from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from accounts.models import User

class AuthTests(APITestCase):
    def setUp(self):
        self.register_url = reverse('register')
        self.login_url = reverse('login')
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
