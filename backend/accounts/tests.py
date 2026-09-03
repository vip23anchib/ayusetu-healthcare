from unittest.mock import patch
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from accounts.models import User
from doctors.models import Doctor

class AuthTests(APITestCase):
    def setUp(self):
        self.register_url = reverse('register')
        self.login_url = reverse('login')
        self.google_auth_url = reverse('google-auth')
        self.me_url = reverse('me')

    def test_register_patient_success(self):
        data = {
            'name': 'John Doe',
            'email': 'john@example.com',
            'password': 'securepassword123',
            'role': 'PATIENT'
        }
        response = self.client.post(self.register_url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)
        self.assertEqual(response.data['user']['email'], 'john@example.com')
        self.assertEqual(response.data['user']['role'], 'PATIENT')

    def test_register_invalid_role(self):
        data = {
            'name': 'John Doe',
            'email': 'john@example.com',
            'password': 'securepassword123',
            'role': 'SUPERUSER' # invalid role
        }
        response = self.client.post(self.register_url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_login_success(self):
        user = User.objects.create_user(
            email='doctor@example.com',
            name='Dr. Smith',
            password='doctorpassword',
            role='DOCTOR'
        )
        data = {
            'email': 'doctor@example.com',
            'password': 'doctorpassword'
        }
        response = self.client.post(self.login_url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertEqual(response.data['user']['role'], 'DOCTOR')

    def test_login_invalid_credentials(self):
        data = {
            'email': 'nonexistent@example.com',
            'password': 'wrongpassword'
        }
        response = self.client.post(self.login_url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_me_endpoint_authenticated(self):
        user = User.objects.create_user(
            email='patient@example.com',
            name='Jane Patient',
            password='patientpassword',
            role='PATIENT'
        )
        self.client.force_authenticate(user=user)
        response = self.client.get(self.me_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['email'], 'patient@example.com')

    def test_me_endpoint_unauthenticated(self):
        response = self.client.get(self.me_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    @patch('google.oauth2.id_token.verify_oauth2_token')
    def test_google_auth_login_existing_user(self, mock_verify):
        mock_verify.return_value = {
            'email': 'existing.google@example.com',
            'name': 'Existing Google User',
            'sub': '123456789'
        }
        User.objects.create_user(
            email='existing.google@example.com',
            name='Existing Google User',
            role='PATIENT'
        )
        response = self.client.post(self.google_auth_url, {'credential': 'valid_mock_token'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertEqual(response.data['user']['email'], 'existing.google@example.com')
        self.assertFalse(response.data['is_new_user'])

    @patch('google.oauth2.id_token.verify_oauth2_token')
    def test_google_auth_register_new_patient(self, mock_verify):
        mock_verify.return_value = {
            'email': 'new.patient@example.com',
            'name': 'New Patient',
            'sub': '987654321'
        }
        response = self.client.post(self.google_auth_url, {
            'credential': 'valid_mock_token',
            'role': 'PATIENT'
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('access', response.data)
        self.assertEqual(response.data['user']['email'], 'new.patient@example.com')
        self.assertEqual(response.data['user']['role'], 'PATIENT')
        self.assertTrue(response.data['is_new_user'])
        self.assertTrue(User.objects.filter(email='new.patient@example.com').exists())

    @patch('google.oauth2.id_token.verify_oauth2_token')
    def test_google_auth_register_new_doctor(self, mock_verify):
        mock_verify.return_value = {
            'email': 'new.doctor@example.com',
            'name': 'Dr. New Doctor',
            'sub': '555555555'
        }
        response = self.client.post(self.google_auth_url, {
            'credential': 'valid_mock_token',
            'role': 'DOCTOR'
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('access', response.data)
        self.assertEqual(response.data['user']['role'], 'DOCTOR')
        user = User.objects.get(email='new.doctor@example.com')
        self.assertTrue(Doctor.objects.filter(user=user).exists())

    def test_google_auth_missing_credential(self):
        response = self.client.post(self.google_auth_url, {})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    @patch('google.oauth2.id_token.verify_oauth2_token')
    def test_google_auth_invalid_token(self, mock_verify):
        mock_verify.side_effect = ValueError("Token expired")
        response = self.client.post(self.google_auth_url, {'credential': 'invalid_token'})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('Invalid Google token', response.data['detail'])

    def test_google_auth_sandbox_patient(self):
        response = self.client.post(self.google_auth_url, {
            'credential': 'mock_google_token_test_patient',
            'email': 'sandbox.patient@example.com',
            'name': 'Sandbox Patient',
            'role': 'PATIENT'
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('access', response.data)
        self.assertEqual(response.data['user']['email'], 'sandbox.patient@example.com')
        self.assertEqual(response.data['user']['role'], 'PATIENT')
        self.assertTrue(User.objects.filter(email='sandbox.patient@example.com').exists())

    def test_google_auth_sandbox_doctor(self):
        response = self.client.post(self.google_auth_url, {
            'credential': 'mock_google_token_test_doctor',
            'email': 'sandbox.doctor@example.com',
            'name': 'Dr. Sandbox Doctor',
            'role': 'DOCTOR'
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('access', response.data)
        self.assertEqual(response.data['user']['role'], 'DOCTOR')
        user = User.objects.get(email='sandbox.doctor@example.com')
        self.assertTrue(Doctor.objects.filter(user=user).exists())

