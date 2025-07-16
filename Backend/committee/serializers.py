from rest_framework import serializers
from .models import Committee, Membership, Contribution, Payout
from django.utils import timezone
from django.db.models import Sum
from account.models import User


class MembershipSerializer(serializers.ModelSerializer):
    member_name = serializers.CharField(source='member.full_name', read_only=True)
    committee_name = serializers.CharField(source='committee.name', read_only=True)
    total_contributed = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = Membership
        fields = [
            'id', 'committee', 'committee_name', 'member', 'member_name', 'status',
            'joined_at', 'left_at', 'total_contributed', 'created_at', 'updated_at'
        ]
        read_only_fields = ['left_at', 'joined_at', 'created_at', 'updated_at']
        extra_kwargs = {
            'committee': {'write_only': True},
            'member': {'write_only': True},
        }

    def validate(self, data):
        # Only check for duplicates when creating new membership
        if self.instance is None and Membership.objects.filter(
            committee=data['committee'],
            member=data['member'],
            status='ACTIVE'
        ).exists():
            raise serializers.ValidationError(
                {"member": "This member is already active in the committee."}
            )

        # Auto-set left_at when status changes to LEFT/REMOVED
        if 'status' in data and data['status'] in ('LEFT', 'REMOVED'):
            data['left_at'] = timezone.now()

        return data


class CommitteeSerializer(serializers.ModelSerializer):
    organizer_name = serializers.CharField(source='organizer.full_name', read_only=True)
    status = serializers.CharField(read_only=True)
    total_collected = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    current_members_count = serializers.SerializerMethodField()
    total_amount = serializers.SerializerMethodField()
    members = MembershipSerializer(many=True, write_only=True, required=False)
    members_list = serializers.SerializerMethodField()

    class Meta:
        model = Committee
        fields = [
            'id', 'name', 'description', 'status', 'monthly_amount', 'duration_months',
            'organizer', 'organizer_name', 'start_date', 'end_date', 'created_at', 'updated_at',
            'total_collected', 'current_members_count', 'total_amount', 'members', 'members_list'
        ]
        read_only_fields = ['organizer', 'end_date', 'created_at', 'updated_at']

    def get_current_members_count(self, obj):
        return obj.memberships.filter(status='ACTIVE').count()

    def get_total_amount(self, obj):
        monthly_amount = obj.monthly_amount
        duration_months = obj.duration_months
        return monthly_amount * duration_months

    def get_members_list(self, obj):
        return [
            {
                'id': m.member.id,
                'name': m.member.full_name,
                'status': m.status,
            }
            for m in obj.memberships.filter(status='ACTIVE')
        ]

    def validate(self, data):
        # if 'start_date' in data and data['start_date'] < timezone.now().date():
        #     raise serializers.ValidationError({"start_date": "Start date cannot be in the past."})
        if 'monthly_amount' in data and data['monthly_amount'] <= 0:
            raise serializers.ValidationError({"monthly_amount": "Monthly amount must be positive."})
            # Prevent non-organizers from modifying committees.
        if not self.context['request'].user.is_organizer and self.context['request'].method != 'GET':
            raise serializers.ValidationError("Only organizers can modify committees.")
        return data

    def create(self, validated_data):
        members_data = validated_data.pop('members', [])
        organizer = self.context['request'].user

        # Create committee
        committee = Committee.objects.create(organizer=organizer, **validated_data)

        # Create memberships
        for member_data in members_data:
            Membership.objects.create(
                committee=committee,
                member=member_data['member'],
                status=member_data.get('status', 'ACTIVE')
            )
        return committee

    def update(self, instance, validated_data):
        members_data = validated_data.pop('members', None)

        # Update committee fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if members_data is not None:
            # Remove existing active members not in new list
            new_member_ids = [m['member'].id if isinstance(m['member'], User) else m['member'] for m in members_data]
            Membership.objects.filter(committee=instance, status='ACTIVE').exclude(member_id__in=new_member_ids).update(status='REMOVED')

            # Add new members
            for member_data in members_data:
                member_id = member_data['member']
                status = member_data.get('status', 'ACTIVE')

                membership, created = Membership.objects.get_or_create(
                    committee=instance,
                    member_id=member_id,
                    defaults={'status': status}
                )
                if not created and membership.status != status:
                    membership.status = status
                    membership.save()

        return instance


class ContributionSerializer(serializers.ModelSerializer):
    member_name = serializers.CharField(source='membership.member.full_name', read_only=True)
    committee_name = serializers.CharField(source='membership.committee.name', read_only=True)
    required_amount = serializers.DecimalField(source='membership.committee.monthly_amount', max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = Contribution
        fields = [
            'id', 'membership', 'member_name', 'committee_name', 'amount_paid',
            'required_amount', 'for_month', 'due_date', 'payment_date',
            'payment_status', 'verified_by_organizer', 'created_at', 'updated_at'
        ]
        read_only_fields = ['payment_status', 'verified_by_organizer', 'created_at', 'updated_at']
        extra_kwargs = {'membership': {'write_only': True}}

    def validate(self, data):
        membership = data.get('membership', getattr(self.instance, 'membership', None))
        if not membership:
            raise serializers.ValidationError({"membership": "Membership is required."})

        required_amount = membership.committee.monthly_amount

        if 'amount_paid' in data:
            if data['amount_paid'] != required_amount:
                raise serializers.ValidationError({
                    "amount_paid": f"Amount must be exactly {required_amount} (no partial or over payments)."
                })

        # Auto-set payment status
        payment_date = data.get('payment_date')
        due_date = data.get('due_date', getattr(self.instance, 'due_date', None))
        if payment_date:
            data['payment_status'] = 'LATE' if due_date and payment_date > due_date else 'PAID'
        else:
            data['payment_status'] = 'PENDING'

        return data

    def create(self, validated_data):
        request = self.context.get('request')
        if request and request.user.is_authenticated and hasattr(request.user, 'is_organizer') and request.user.is_organizer:
            validated_data['verified_by_organizer'] = True
        return super().create(validated_data)


class PayoutSerializer(serializers.ModelSerializer):
    member_name = serializers.CharField(source='membership.member.full_name', read_only=True)
    committee_name = serializers.CharField(source='membership.committee.name', read_only=True)
    organizer_name = serializers.CharField(source='membership.committee.organizer.full_name', read_only=True)
    member_id = serializers.IntegerField(source='membership.member.id', read_only=True)
    committee_id = serializers.IntegerField(source='membership.committee.id', read_only=True)
    total_eligible = serializers.SerializerMethodField()

    class Meta:
        model = Payout
        fields = [
            'id', 'membership', 'member_name', 'member_id', 'committee_name', 
            'committee_id', 'organizer_name', 'total_eligible', 'total_amount',
            'paid_at', 'received_by', 'is_confirmed', 'confirmed_at', 'received_in_cash', 
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'paid_at', 'member_name', 'committee_name', 'organizer_name', 
            'member_id', 'committee_id', 'confirmed_at', 'created_at', 'updated_at',
            'is_confirmed', 'total_eligible'
        ]
        extra_kwargs = {
            'membership': {'write_only': True},
        }

    def get_total_eligible(self, obj):
        """Calculate total verified contributions for this membership"""
        # Handle both Payout objects and Membership objects
        membership = obj.membership if isinstance(obj, Payout) else obj
        return membership.contributions.filter(
            payment_status='PAID',
            verified_by_organizer=True
        ).aggregate(total=Sum('amount_paid'))['total'] or 0

    def validate(self, data):
        membership = data.get('membership', getattr(self.instance, 'membership', None))
        if not membership:
            raise serializers.ValidationError({"membership": "Membership is required."})

        # Only allow organizer to create payouts
        request = self.context.get('request')
        if request and membership.committee.organizer != request.user:
            raise serializers.ValidationError(
                {"membership": "Only the committee organizer can create payouts."}
            )

        # Validate that the member hasn't already received a payout
        if self.instance is None and Payout.objects.filter(membership=membership).exists():
            raise serializers.ValidationError(
                {"membership": "This member has already received a payout for this committee."}
            )

        # Validate amount against verified contributions
        if 'total_amount' in data:
            total_verified = self.get_total_eligible(membership)
            if data['total_amount'] > total_verified:
                raise serializers.ValidationError({
                    "total_amount": f"Amount cannot exceed total verified contributions ({total_verified})"
                })
        return data

    def create(self, validated_data):
        # Set the received_by field to the request user if not specified
        if 'received_by' not in validated_data:
            validated_data['received_by'] = self.context['request'].user
        return super().create(validated_data)
