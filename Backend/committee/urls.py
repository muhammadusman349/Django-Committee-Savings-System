from django.urls import path
from .views import (
    CommitteeView, MembershipListCreateView, MembershipDetailView,
    ContributionListCreateView, ContributionDetailView, ContributionVerifyView,
    PayoutListCreateView, PayoutDetailView, PayoutConfirmView
    )

urlpatterns = [
    # Committees
    path('committees/', CommitteeView.as_view(), name='committee-list-create'),
    path('committees/<int:id>/', CommitteeView.as_view(), name='committee-detail'),

    # Memberships
    path('committees/<int:committee_id>/members/', MembershipListCreateView.as_view(), name='membership-list-create'),
    path('committees/<int:committee_id>/members/<int:id>/', MembershipDetailView.as_view(), name='membership-detail'),

    # Contributions
    path('memberships/<int:membership_id>/contributions/', ContributionListCreateView.as_view(), name='contribution-list-create'),
    path('memberships/<int:membership_id>/contributions/<int:id>/', ContributionDetailView.as_view(), name='contribution-detail'),
    # Verify contributions
    path('contributions/<int:id>/verify/', ContributionVerifyView.as_view(), name='contribution-verify'),

    # Payouts
    path('committees/<int:committee_id>/payouts/', PayoutListCreateView.as_view(), name='payout-list-create'),
    path('payouts/<int:id>/', PayoutDetailView.as_view(), name='payout-detail'),
    path('payouts/<int:id>/confirm/', PayoutConfirmView.as_view(), name='payout-confirm'),
]
