from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.conf import settings
from django.utils.crypto import get_random_string
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from .serializers import RegisterSerializer, LoginSerializer, UserSerializer
from .models import User
from doctors.models import Doctor

class RegisterView(generics.CreateAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = RegisterSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return Response({
            'user': UserSerializer(user).data,
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }, status=status.HTTP_201_CREATED)

class LoginView(generics.GenericAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = LoginSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        refresh = RefreshToken.for_user(user)
        return Response({
            'user': UserSerializer(user).data,
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }, status=status.HTTP_200_OK)

class GoogleAuthView(generics.GenericAPIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        credential = request.data.get('credential') or request.data.get('id_token') or request.data.get('token')
        role = request.data.get('role', User.Role.PATIENT)

        if not credential:
            return Response({'detail': 'Google credential/token is required.'}, status=status.HTTP_400_BAD_REQUEST)

        if role not in [User.Role.PATIENT, User.Role.DOCTOR, User.Role.ADMIN]:
            role = User.Role.PATIENT

        try:
            client_id = getattr(settings, 'GOOGLE_CLIENT_ID', '') or None
            # Verify the Google OAuth2 / ID token
            id_info = id_token.verify_oauth2_token(
                credential,
                google_requests.Request(),
                audience=client_id
            )
        except ValueError as e:
            return Response({'detail': f'Invalid Google token: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'detail': f'Google authentication failed: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)

        email = id_info.get('email')
        if not email:
            return Response({'detail': 'Google account must have an email associated.'}, status=status.HTTP_400_BAD_REQUEST)

        name = id_info.get('name') or id_info.get('given_name') or email.split('@')[0]
        
        user = User.objects.filter(email__iexact=email).first()
        is_created = False

        if user:
            if not user.is_active:
                return Response({'detail': 'User account is disabled.'}, status=status.HTTP_400_BAD_REQUEST)
        else:
            # Create a new user for Google Sign-In
            user = User.objects.create_user(
                email=email,
                name=name,
                password=get_random_string(32),
                role=role
            )
            is_created = True

            # If registered as DOCTOR, automatically create doctor profile
            if role == User.Role.DOCTOR:
                Doctor.objects.get_or_create(
                    user=user,
                    defaults={'specialization': 'General Medicine'}
                )

        refresh = RefreshToken.for_user(user)
        response_status = status.HTTP_201_CREATED if is_created else status.HTTP_200_OK

        return Response({
            'user': UserSerializer(user).data,
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'is_new_user': is_created
        }, status=response_status)

class MeView(generics.RetrieveAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user
