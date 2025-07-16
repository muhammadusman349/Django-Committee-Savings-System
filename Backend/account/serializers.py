from rest_framework import serializers, status
from .models import User
from rest_framework_simplejwt.tokens import RefreshToken


class SignupSerializer(serializers.ModelSerializer):
    password = serializers.CharField(max_length=120, required=True, style={'input_type': 'password'}, write_only=True)

    class Meta:
        model = User
        fields = [
            'id',
            'first_name',
            'last_name',
            'email',
            'password',
            'phone',
        ]
        read_only_fields = ('id', 'created_at', 'updated_at')

    def validate(self, attrs):
        email = attrs.get('email')
        request = self.context.get('request')
        if request.method == 'POST':
            if User.objects.filter(email__iexact=email).exists():
                raise serializers.ValidationError('User with this email already exists! Please try another email')
            return attrs

    def create(self, validated_data):
        newuser = User.objects.create(

        first_name=validated_data['first_name'],
        last_name=validated_data['last_name'],
        email=validated_data['email'],
        password=validated_data['password'],
        phone=validated_data['phone'],
        is_verified=True,
        is_active=True,
        is_approved=True,
        )
        newuser.set_password(validated_data['password'])
        newuser.save()
        return newuser


class LoginSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(max_length=120, required=True)
    password = serializers.CharField(max_length=120, required=True, style={'input_type': 'password'})
    access_token = serializers.CharField(max_length=120, min_length=5, read_only=True)
    refresh_token = serializers.CharField(max_length=120, min_length=5, read_only=True)

    class Meta:
        model = User
        fields = [
            'id',
            'email',
            'password',
            'phone',
            'access_token',
            'refresh_token',
        ]
        read_only_fields = ('access_token', 'refresh_token')

    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')

        try:
            user = User.objects.get(email__iexact=email)
        except User.DoesNotExist:
            raise serializers.ValidationError({"error": "provide credential are not valid/email"}, code=status.HTTP_401_UNAUTHORIZED)
        if user:
            if not user.check_password(password):
                raise serializers.ValidationError({"error": "provide credential are not valid/password"}, code=status.HTTP_401_UNAUTHORIZED)

        token = RefreshToken.for_user(user)
        attrs = {}
        attrs['id'] = str(user.id)
        attrs['first_name'] = str(user.first_name)
        attrs['last_name'] = str(user.last_name)
        attrs['email'] = str(user.email)
        attrs['phone'] = str(user.phone)
        attrs['access_token'] = str(token.access_token)
        attrs['refresh_token'] = str(token)
        return attrs


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'id',
            'first_name',
            'last_name',
            'email',
            'phone',
            'is_verified',
            'is_approved',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'is_verified', 'is_approved', 'created_at', 'updated_at']


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True)
