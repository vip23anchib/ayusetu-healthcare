from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.core.exceptions import ValidationError
from .models import Appointment
from .permissions import IsParticipantOrAdmin
from .serializers import (
    AppointmentSerializer,
    HoldSlotSerializer,
    ConfirmBookingSerializer,
    RescheduleSerializer
)
from .services import (
    hold_slot,
    confirm_booking,
    cancel_appointment,
    reschedule_appointment,
    SlotConflictError
)

class AppointmentViewSet(viewsets.ModelViewSet):
    """
    CRUD and actions for Appointments.
    """
    permission_classes = [permissions.IsAuthenticated, IsParticipantOrAdmin]
    serializer_class = AppointmentSerializer

    def get_queryset(self):
        user = self.request.user
        queryset = Appointment.objects.all().select_related('doctor__user', 'patient')
        if user.role == 'PATIENT':
            return queryset.filter(patient=user)
        elif user.role == 'DOCTOR':
            return queryset.filter(doctor__user=user)
        return queryset

    def create(self, request, *args, **kwargs):
        """
        POST /api/appointments/ -> Create a HOLD.
        """
        serializer = HoldSlotSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        try:
            appointment = hold_slot(
                patient=request.user,
                doctor_id=serializer.validated_data['doctor_id'],
                check_date=serializer.validated_data['appointment_date'],
                start_time_str=serializer.validated_data['start_time']
            )
            return Response(AppointmentSerializer(appointment).data, status=status.HTTP_201_CREATED)
        except SlotConflictError as e:
            return Response({"detail": str(e)}, status=status.HTTP_409_CONFLICT)
        except ValidationError as e:
            # Check if this is a django validation error with dict
            msg = getattr(e, 'message', str(e))
            if hasattr(e, 'message_dict'):
                msg = e.message_dict
            return Response({"detail": msg}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'], url_path='symptoms')
    def symptoms(self, request, pk=None):
        """
        POST /api/appointments/{id}/symptoms/ -> Confirm booking and record patient symptoms.
        """
        appointment = self.get_object()
        serializer = ConfirmBookingSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            confirmed_appt = confirm_booking(
                appointment_id=appointment.id,
                symptoms_text=serializer.validated_data['symptoms_text']
            )
            return Response(AppointmentSerializer(confirmed_appt).data, status=status.HTTP_200_OK)
        except ValidationError as e:
            msg = getattr(e, 'message', str(e))
            return Response({"detail": msg}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'], url_path='cancel')
    def cancel(self, request, pk=None):
        """
        POST /api/appointments/{id}/cancel/ -> Cancel appointment.
        """
        appointment = self.get_object()
        try:
            cancelled_appt = cancel_appointment(appointment.id, request.user)
            return Response(AppointmentSerializer(cancelled_appt).data, status=status.HTTP_200_OK)
        except ValidationError as e:
            msg = getattr(e, 'message', str(e))
            return Response({"detail": msg}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['patch', 'post'], url_path='reschedule')
    def reschedule(self, request, pk=None):
        """
        PATCH/POST /api/appointments/{id}/reschedule/ -> Reschedule.
        """
        appointment = self.get_object()
        serializer = RescheduleSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            rescheduled_appt = reschedule_appointment(
                appointment_id=appointment.id,
                user=request.user,
                new_date=serializer.validated_data['appointment_date'],
                new_start_time_str=serializer.validated_data['start_time']
            )
            return Response(AppointmentSerializer(rescheduled_appt).data, status=status.HTTP_200_OK)
        except SlotConflictError as e:
            return Response({"detail": str(e)}, status=status.HTTP_409_CONFLICT)
        except ValidationError as e:
            msg = getattr(e, 'message', str(e))
            return Response({"detail": msg}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['get'], url_path='pre-visit-summary')
    def pre_visit_summary(self, request, pk=None):
        appointment = self.get_object()
        from consultations.models import PreVisitSummary
        from consultations.serializers import PreVisitSummarySerializer
        
        try:
            summary = PreVisitSummary.objects.get(appointment=appointment)
            return Response(PreVisitSummarySerializer(summary).data)
        except PreVisitSummary.DoesNotExist:
            return Response({"detail": "Pre-visit summary not found."}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=True, methods=['post'], url_path='consultation')
    def consultation(self, request, pk=None):
        if request.user.role not in ['DOCTOR', 'ADMIN']:
            return Response({"detail": "Permission denied."}, status=status.HTTP_403_FORBIDDEN)
            
        appointment = self.get_object()
        from consultations.serializers import ConsultationCreateSerializer, ConsultationSerializer
        from consultations.services import create_consultation
        
        serializer = ConsultationCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        try:
            consult = create_consultation(
                appointment_id=appointment.id,
                doctor_notes=serializer.validated_data['doctor_notes'],
                follow_up_date=serializer.validated_data.get('follow_up_date'),
                medications=serializer.validated_data.get('medications', [])
            )
            return Response(ConsultationSerializer(consult).data, status=status.HTTP_201_CREATED)
        except ValidationError as e:
            msg = getattr(e, 'message', str(e))
            return Response({"detail": msg}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['get', 'post'], url_path='prescription')
    def prescription(self, request, pk=None):
        appointment = self.get_object()
        from consultations.models import Prescription
        from consultations.serializers import PrescriptionSerializer
        
        try:
            prescription_obj = Prescription.objects.get(consultation__appointment=appointment)
            return Response(PrescriptionSerializer(prescription_obj).data)
        except Prescription.DoesNotExist:
            return Response({"detail": "Prescription not found."}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=True, methods=['get'], url_path='post-visit-summary')
    def post_visit_summary(self, request, pk=None):
        appointment = self.get_object()
        from consultations.models import PostVisitSummary
        from consultations.serializers import PostVisitSummarySerializer
        
        try:
            summary = PostVisitSummary.objects.get(consultation__appointment=appointment)
            return Response(PostVisitSummarySerializer(summary).data)
        except PostVisitSummary.DoesNotExist:
            return Response({"detail": "Post-visit summary not found."}, status=status.HTTP_404_NOT_FOUND)

