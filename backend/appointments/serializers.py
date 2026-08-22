from rest_framework import serializers
from doctors.serializers import DoctorSerializer
from accounts.serializers import UserSerializer
from .models import Appointment

class AppointmentSerializer(serializers.ModelSerializer):
    doctor = DoctorSerializer(read_only=True)
    patient = UserSerializer(read_only=True)

    class Meta:
        model = Appointment
        fields = (
            'id', 'doctor', 'patient', 'appointment_date', 
            'start_time', 'end_time', 'status', 'hold_expires_at',
            'created_at', 'updated_at'
        )

class HoldSlotSerializer(serializers.Serializer):
    doctor_id = serializers.IntegerField()
    appointment_date = serializers.DateField()
    start_time = serializers.CharField()

class ConfirmBookingSerializer(serializers.Serializer):
    symptoms_text = serializers.CharField(max_length=2000, required=True)

class RescheduleSerializer(serializers.Serializer):
    appointment_date = serializers.DateField()
    start_time = serializers.CharField()
