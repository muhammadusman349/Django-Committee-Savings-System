from .models import Committee, Membership, Contribution, Payout
from .serializers import CommitteeSerializer, MembershipSerializer, ContributionSerializer, PayoutSerializer
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .permissions import IsOrganizer
from rest_framework.exceptions import PermissionDenied
from django.shortcuts import get_object_or_404
from django.db import models
from django.utils import timezone
from dateutil.relativedelta import relativedelta


# Create your views here.


class CommitteeView(generics.ListCreateAPIView, generics.RetrieveUpdateDestroyAPIView):
    serializer_class = CommitteeSerializer
    permission_classes = [IsOrganizer]
    queryset = Committee.objects.all().order_by('-id')
    lookup_field = 'id'

    def get(self, request, *args, **kwargs):
        id = self.kwargs.get('id', None)
        if id:
            return self.retrieve(request, *args, **kwargs)
        return self.list(request, *args, **kwargs)

    def perform_create(self, serializer):
        serializer.save(organizer=self.request.user)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        old_start = instance.start_date
        old_duration = instance.duration_months

        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)

        # Check if start_date or duration_months changed
        new_start = serializer.validated_data.get('start_date', old_start)
        new_duration = serializer.validated_data.get('duration_months', old_duration)

        if new_start != old_start or new_duration != old_duration:
            serializer.validated_data['end_date'] = new_start + relativedelta(months=new_duration)

        self.perform_update(serializer)
        return Response(serializer.data)


class MembershipListCreateView(generics.ListCreateAPIView):
    serializer_class = MembershipSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'id'

    def get_queryset(self):
        committee_id = self.kwargs['committee_id']
        committee = get_object_or_404(Committee, id=committee_id)

        if not (
            committee.organizer == self.request.user or
            committee.memberships.filter(member=self.request.user).exists()
        ):
            raise PermissionDenied("You don't have permission to view members of this committee.")

        return Membership.objects.filter(committee=committee)

    def perform_create(self, serializer):
        committee = get_object_or_404(Committee, id=self.kwargs['committee_id'])

        if committee.organizer != self.request.user:
            raise PermissionDenied("Only the committee organizer can add members.")

        serializer.save(committee=committee)


class MembershipDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = MembershipSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'id'

    def get_queryset(self):
        return Membership.objects.filter(committee_id=self.kwargs['committee_id'])

    def perform_update(self, serializer):
        membership = serializer.instance
        committee = membership.committee

        if committee.organizer == self.request.user:
            serializer.save()
        elif membership.member == self.request.user:
            new_status = serializer.validated_data.get('status')
            if new_status == 'LEFT':
                serializer.save()
            else:
                raise PermissionDenied("You can only change your own status to LEFT.")
        else:
            raise PermissionDenied("You don't have permission to update this membership.")

    def perform_destroy(self, instance):
        if instance.committee.organizer != self.request.user:
            raise PermissionDenied("Only the committee organizer can remove members.")
        instance.delete()


class ContributionListCreateView(generics.ListCreateAPIView):
    serializer_class = ContributionSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'id'

    def get_queryset(self):
        membership_id = self.kwargs['membership_id']
        membership = get_object_or_404(Membership, id=membership_id)

        if not (
            membership.member == self.request.user or
            membership.committee.organizer == self.request.user
        ):
            raise PermissionDenied("You don't have permission to view these contributions.")

        return Contribution.objects.filter(membership=membership).order_by('-id')

    def perform_create(self, serializer):
        membership = get_object_or_404(Membership, id=self.kwargs['membership_id'])

        if not (
            membership.member == self.request.user or
            membership.committee.organizer == self.request.user
        ):
            raise PermissionDenied("Only the member or organizer can record contributions.")

        serializer.save(membership=membership)


class ContributionDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ContributionSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'id'

    def get_queryset(self):
        membership_id = self.kwargs['membership_id']
        membership = get_object_or_404(Membership, id=membership_id)

        if not (
            membership.member == self.request.user or
            membership.committee.organizer == self.request.user
        ):
            raise PermissionDenied("You don't have permission to modify this contribution.")

        return Contribution.objects.filter(membership=membership)


class ContributionVerifyView(generics.GenericAPIView):
    serializer_class = ContributionSerializer
    permission_classes = [IsOrganizer]

    def patch(self, request, *args, **kwargs):
        contribution_id = self.kwargs.get('id')
        if not contribution_id:
            return Response(
                {"detail": "Contribution ID is required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        contribution = get_object_or_404(Contribution, id=contribution_id)

        # Only the committee organizer can verify
        if contribution.membership.committee.organizer != request.user:
            raise PermissionDenied("Only the organizer can verify this contribution.")

        contribution.verified_by_organizer = True
        contribution.save()

        serializer = self.get_serializer(contribution)
        return Response(serializer.data, status=status.HTTP_200_OK)


class PayoutListCreateView(generics.ListCreateAPIView):
    serializer_class = PayoutSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'id'

    def get_queryset(self):
        committee_id = self.kwargs.get('committee_id')
        if committee_id:
            committee = get_object_or_404(Committee, id=committee_id)

            # Only organizer can view all payouts for a committee
            if committee.organizer != self.request.user:
                raise PermissionDenied("Only the organizer can view payouts for this committee.")

            return Payout.objects.filter(membership__committee=committee)

        # For regular users, only show their own payouts
        return Payout.objects.filter(membership__member=self.request.user)

    def perform_create(self, serializer):
        membership = serializer.validated_data['membership']

        # Only organizer can create payouts
        if membership.committee.organizer != self.request.user:
            raise PermissionDenied("Only the organizer can create payouts.")

        # Calculate total amount (sum of all contributions)
        total_amount = membership.committee.monthly_amount * membership.committee.duration_months

        # Verify all contributions are paid
        unpaid_contributions = membership.contributions.filter(payment_status__in=['PENDING', 'LATE']).exists()
        if unpaid_contributions:
            raise PermissionDenied("Cannot create payout until all contributions are paid.")

        serializer.save(total_amount=total_amount, paid_at=timezone.now())


class PayoutDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = PayoutSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'id'

    def get_queryset(self):
        # Users can only see their own payouts or payouts from committees they organize
        return Payout.objects.filter(
            models.Q(membership__member=self.request.user) |
            models.Q(membership__committee__organizer=self.request.user)
        )

    def perform_update(self, serializer):
        payout = serializer.instance

        # Only organizer can update payout details
        if payout.membership.committee.organizer != self.request.user:
            raise PermissionDenied("Only the organizer can update this payout.")

        # Member can only confirm receipt
        if payout.membership.member == self.request.user:
            if 'is_confirmed' in serializer.validated_data:
                if serializer.validated_data['is_confirmed']:
                    serializer.save(is_confirmed=True)
                return
            raise PermissionDenied("You can only confirm receipt of this payout.")

        serializer.save()

    def perform_destroy(self, instance):
        if instance.membership.committee.organizer != self.request.user:
            raise PermissionDenied("Only the organizer can delete this payout.")
        instance.delete()


class PayoutConfirmView(generics.GenericAPIView):
    serializer_class = PayoutSerializer
    permission_classes = [IsOrganizer]

    def patch(self, request, *args, **kwargs):
        payout = get_object_or_404(Payout, id=self.kwargs['id'])

        # Only the organizer can confirm
        if payout.membership.committee.organizer != request.user:
            raise PermissionDenied("Only the organizer can confirm this payout.")

        payout.is_confirmed = True
        payout.confirmed_at = timezone.now()
        payout.save()

        serializer = self.get_serializer(payout)
        return Response(serializer.data, status=status.HTTP_200_OK)
