from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import DoctorViewSet, AdminDoctorViewSet

router = DefaultRouter()
router.register(r'doctors', DoctorViewSet, basename='doctor')
router.register(r'admin/doctors', AdminDoctorViewSet, basename='admin-doctor')

urlpatterns = [
    path('', include(router.urls)),
]
