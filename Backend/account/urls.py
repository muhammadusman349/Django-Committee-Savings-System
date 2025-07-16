from django.urls import path
from .views import SignupView, LoginView, UserProfileView, ChangePasswordView


urlpatterns = [
    path('signup/',                     SignupView.as_view(),            name='signup'),
    path('login/',                      LoginView.as_view(),             name='login'),
    path('profile/',                    UserProfileView.as_view(),       name='profile'),
    path('change-password/',            ChangePasswordView.as_view(),    name='change-password'),
]
