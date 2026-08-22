from rest_framework import serializers
from .models import Symptom, PreVisitSummary, Consultation, Prescription, Medication, PostVisitSummary

class SymptomSerializer(serializers.ModelSerializer):
    class Meta:
        model = Symptom
        fields = ('id', 'appointment', 'symptoms_text', 'created_at')

class PreVisitSummarySerializer(serializers.ModelSerializer):
    class Meta:
        model = PreVisitSummary
        fields = ('id', 'appointment', 'urgency', 'chief_complaint', 'suggested_questions', 'status', 'created_at', 'updated_at')

class MedicationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Medication
        fields = ('id', 'medicine_name', 'dosage', 'frequency', 'duration', 'instructions')

class PrescriptionSerializer(serializers.ModelSerializer):
    medications = MedicationSerializer(many=True, read_only=True)

    class Meta:
        model = Prescription
        fields = ('id', 'consultation', 'medications', 'created_at', 'updated_at')

class PostVisitSummarySerializer(serializers.ModelSerializer):
    class Meta:
        model = PostVisitSummary
        fields = ('id', 'consultation', 'summary', 'status', 'created_at', 'updated_at')

class ConsultationSerializer(serializers.ModelSerializer):
    prescription = PrescriptionSerializer(read_only=True)
    post_visit_summary = PostVisitSummarySerializer(read_only=True)

    class Meta:
        model = Consultation
        fields = ('id', 'appointment', 'doctor_notes', 'follow_up_date', 'prescription', 'post_visit_summary', 'created_at', 'updated_at')

class MedicationInputSerializer(serializers.Serializer):
    medicine_name = serializers.CharField(max_length=255)
    dosage = serializers.CharField(max_length=255)
    frequency = serializers.CharField(max_length=255)
    duration = serializers.CharField(max_length=255)
    instructions = serializers.CharField(max_length=255, required=False, allow_blank=True)

class ConsultationCreateSerializer(serializers.Serializer):
    doctor_notes = serializers.CharField(max_length=10000)
    follow_up_date = serializers.DateField(required=False, allow_null=True)
    medications = MedicationInputSerializer(many=True, default=list)
