from rest_framework import status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import redirect
from django.conf import settings
from django.utils import timezone
from google_auth_oauthlib.flow import Flow
from accounts.permissions import IsDoctor
from .models import DoctorGoogleCredentials

class GoogleConnectView(APIView):
    """
    POST /api/calendar/connect/ -> Returns the Google OAuth consent authorization URL.
    """
    permission_classes = [permissions.IsAuthenticated, IsDoctor]

    def post(self, request):
        client_id = settings.GOOGLE_CLIENT_ID if hasattr(settings, 'GOOGLE_CLIENT_ID') else None
        client_secret = settings.GOOGLE_CLIENT_SECRET if hasattr(settings, 'GOOGLE_CLIENT_SECRET') else None
        redirect_uri = settings.GOOGLE_REDIRECT_URI if hasattr(settings, 'GOOGLE_REDIRECT_URI') else None

        if not client_id or not client_secret or not redirect_uri:
            # Fallback mock auth URL for local development/testing
            backend_url = os.getenv("BACKEND_URL", "http://localhost:8000")
            mock_auth_url = f"{backend_url}/api/calendar/callback/?code=mock_code_123&user_id={request.user.id}"
            return Response({
                "authorization_url": mock_auth_url,
                "detail": "OAuth client secrets missing. Using mock callback link."
            }, status=status.HTTP_200_OK)

        # Build Flow
        client_config = {
            "web": {
                "client_id": client_id,
                "client_secret": client_secret,
                "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                "token_uri": "https://oauth2.googleapis.com/token",
            }
        }
        
        try:
            flow = Flow.from_client_config(
                client_config,
                scopes=['https://www.googleapis.com/auth/calendar'],
                redirect_uri=redirect_uri
            )
            # Create authorization url, requesting offline access (refresh tokens) and consent
            authorization_url, state = flow.authorization_url(
                access_type='offline',
                include_granted_scopes='true',
                prompt='consent'
            )
            # Store state in session to verify in callback
            request.session['oauth_state'] = state
            return Response({"authorization_url": authorization_url}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"detail": f"Failed to generate consent URL: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)

import os

class GoogleCallbackView(APIView):
    """
    GET /api/calendar/callback/ -> Receives OAuth code and redirects user to doctor dashboard.
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        code = request.query_params.get('code')
        state = request.query_params.get('state')
        user_id = request.query_params.get('user_id')  # for mock redirects

        frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173")

        if not code:
            return redirect(f"{frontend_url}/doctor/dashboard?calendar=failed")

        # Check if mock code
        if code == 'mock_code_123':
            # Retrieve mock user (or current user if logged in, otherwise mock by user_id)
            from accounts.models import User
            target_user = request.user if request.user.is_authenticated else None
            if not target_user and user_id:
                try:
                    target_user = User.objects.get(id=user_id)
                except User.DoesNotExist:
                    pass

            if target_user:
                # Save mock credentials
                DoctorGoogleCredentials.objects.update_or_create(
                    user=target_user,
                    defaults={
                        'token': 'mock_token_123',
                        'refresh_token': 'mock_refresh_token_123',
                        'token_uri': 'https://oauth2.googleapis.com/token',
                        'client_id': 'mock_client_id_123',
                        'client_secret': 'mock_client_secret_123',
                        'scopes': 'https://www.googleapis.com/auth/calendar'
                    }
                )
                print(f"[Calendar Sync Mock] Linked mock Google Calendar credentials for user {target_user.email}.")
                return redirect(f"{frontend_url}/doctor/dashboard?calendar=connected")
            return redirect(f"{frontend_url}/doctor/dashboard?calendar=failed")

        # Real Google OAuth flow
        client_id = settings.GOOGLE_CLIENT_ID
        client_secret = settings.GOOGLE_CLIENT_SECRET
        redirect_uri = settings.GOOGLE_REDIRECT_URI

        client_config = {
            "web": {
                "client_id": client_id,
                "client_secret": client_secret,
                "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                "token_uri": "https://oauth2.googleapis.com/token",
            }
        }

        try:
            flow = Flow.from_client_config(
                client_config,
                scopes=['https://www.googleapis.com/auth/calendar'],
                redirect_uri=redirect_uri
            )
            
            # Fetch OAuth tokens
            flow.fetch_token(code=code)
            credentials = flow.credentials

            # Retrieve authenticated doctor user
            # Since this callback might run in a separate session without request.user,
            # we check request.user or link credentials
            if request.user.is_authenticated:
                DoctorGoogleCredentials.objects.update_or_create(
                    user=request.user,
                    defaults={
                        'token': credentials.token,
                        'refresh_token': credentials.refresh_token,
                        'token_uri': credentials.token_uri,
                        'client_id': credentials.client_id,
                        'client_secret': credentials.client_secret,
                        'scopes': ','.join(credentials.scopes)
                    }
                )
                return redirect(f"{frontend_url}/doctor/dashboard?calendar=connected")
            else:
                return redirect(f"{frontend_url}/doctor/dashboard?calendar=unauthenticated")
        except Exception as e:
            print(f"[Calendar Callback Error] Exchange code failed: {e}")
            return redirect(f"{frontend_url}/doctor/dashboard?calendar=failed")
