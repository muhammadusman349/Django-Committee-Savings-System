from django.db import models
from account.models import User
from dateutil.relativedelta import relativedelta
from django.utils import timezone


class Committee(models.Model):
    STATUS_CHOICES = [
        ('ACTIVE', 'Active'),
        ('COMPLETED', 'Completed'),
    ]
    name = models.CharField(max_length=100)
    description = models.TextField()
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='ACTIVE')
    monthly_amount = models.DecimalField(max_digits=10, decimal_places=2, help_text="Exact amount each member must contribute monthly (no partial payments).")
    duration_months = models.PositiveIntegerField()
    organizer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='organized_committees')
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.end_date:
            self.end_date = self.start_date + relativedelta(months=self.duration_months)
        super().save(*args, **kwargs)

    @property
    def total_collected(self):
        return Contribution.objects.filter(
            membership__committee=self,
            payment_status='PAID'
        ).aggregate(total=models.Sum('amount_paid'))['total'] or 0


class Membership(models.Model):
    STATUS_CHOICES = [
        ('ACTIVE', 'Active'),
        ('LEFT', 'Left'),
        ('REMOVED', 'Removed'),
    ]
    committee = models.ForeignKey(Committee, on_delete=models.CASCADE, related_name='memberships')
    member = models.ForeignKey(User, on_delete=models.CASCADE, related_name='committees_joined')
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='ACTIVE')
    joined_at = models.DateTimeField(auto_now_add=True)
    left_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('committee', 'member')
        ordering = ['joined_at']

    def __str__(self):
        return f"{self.member.full_name} - {self.committee.name}"

    def save(self, *args, **kwargs):
        if self.status in ['LEFT', 'REMOVED'] and not self.left_at:
            self.left_at = timezone.now()
        elif self.status == 'ACTIVE':
            self.left_at = None
        super().save(*args, **kwargs)

    @property
    def total_contributed(self):
        return self.contributions.filter(payment_status='PAID').aggregate(
            total=models.Sum('amount_paid')
        )['total'] or 0


class Contribution(models.Model):
    PAYMENT_STATUS_CHOICES = [
        ('PAID', 'Paid'),
        ('PENDING', 'Pending'),
        ('LATE', 'Late'),
    ]
    membership = models.ForeignKey(Membership, on_delete=models.CASCADE, related_name='contributions')
    amount_paid = models.DecimalField(max_digits=10, decimal_places=2)
    for_month = models.DateField()
    due_date = models.DateField()
    payment_date = models.DateField(null=True, blank=True)
    payment_status = models.CharField(max_length=10, choices=PAYMENT_STATUS_CHOICES, default='PENDING')
    verified_by_organizer = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('membership', 'for_month')
        ordering = ['for_month']

    def __str__(self):
        return f"{self.membership.member.full_name} paid {self.amount_paid} for {self.for_month}"

    def clean(self):
        if self.payment_date and self.payment_date > self.due_date:
            self.payment_status = 'LATE'

    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)


class Payout(models.Model):
    membership = models.ForeignKey(Membership, on_delete=models.CASCADE, related_name='payouts')
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    paid_at = models.DateTimeField(auto_now_add=True)
    received_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='payouts_received')
    is_confirmed = models.BooleanField(default=False)
    received_in_cash = models.BooleanField(default=True)
    confirmed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('membership',)

    def __str__(self):
        return f"{self.membership.member.name} received {self.total_amount} from {self.membership.committee.name}"


# class CashCollection(models.Model):
#     collector = models.ForeignKey(User, on_delete=models.CASCADE, related_name='collections')
#     member = models.ForeignKey(User, on_delete=models.CASCADE, related_name='cash_collections')
#     committee = models.ForeignKey(Committee, on_delete=models.CASCADE, related_name='cash_collections')
#     amount = models.DecimalField(max_digits=10, decimal_places=2)
#     collection_date = models.DateField()
#     remarks = models.TextField(blank=True)

#     def __str__(self):
#         return f"{self.amount} collected from {self.member.name} on {self.collection_date}"


# class Invitation(models.Model):
#     STATUS_CHOICES = [
#         ('PENDING', 'Pending'),
#         ('ACCEPTED', 'Accepted'),
#         ('EXPIRED', 'Expired'),
#     ]

#     committee = models.ForeignKey(Committee, on_delete=models.CASCADE, related_name='invitations')
#     invited_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='invitations_sent')
#     email = models.EmailField()
#     token = models.CharField(max_length=100, unique=True)
#     status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='PENDING')
#     created_at = models.DateTimeField(auto_now_add=True)

#     def __str__(self):
#         return f"Invitation to {self.email} for {self.committee.name}"
