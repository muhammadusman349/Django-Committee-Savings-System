from rest_framework import status
from rest_framework.response import Response
from rest_framework import generics
from .models import User
from .serializers import (
                        SignupSerializer, LoginSerializer,
                        UserProfileSerializer, ChangePasswordSerializer
                        )
from rest_framework.permissions import IsAuthenticated

# Create your views here.


class SignupView(generics.ListCreateAPIView):
    permission_classes = []
    serializer_class = SignupSerializer
    queryset = User.objects.all().order_by('-id')

    def post(self, request, *args, **kwargs):
        return super().post(request, *args, **kwargs)


class LoginView(generics.GenericAPIView):
    permission_classes = []
    serializer_class = LoginSerializer
    queryset = User.objects.all().order_by('-id')

    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            return Response(serializer.validated_data, status=status.HTTP_200_OK)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data)


class ChangePasswordView(generics.UpdateAPIView):
    serializer_class = ChangePasswordSerializer
    permission_classes = [IsAuthenticated]

    def update(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = request.user
        # Check old password
        if not user.check_password(serializer.data.get('old_password')):
            return Response(
                {"old_password": ["Wrong password."]},
                status=status.HTTP_400_BAD_REQUEST
            )

        user.set_password(serializer.data.get('new_password'))
        user.save()

        return Response({"status": "password changed"}, status=status.HTTP_200_OK)
