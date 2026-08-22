from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from accounts.permissions import IsAdmin, IsDoctor
from .models import Doctor, DoctorWorkingHours, DoctorLeave
from .serializers import (
    DoctorSerializer, 
    DoctorCreateUpdateSerializer, 
    DoctorWorkingHoursSerializer, 
    DoctorLeaveSerializer
)

class DoctorViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Publicly readable list/details of doctors.
    """
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = DoctorSerializer

    def get_queryset(self):
        queryset = Doctor.objects.all().select_related('user').prefetch_related('working_hours', 'leaves')
        specialization = self.request.query_params.get('specialization', None)
        if specialization:
            queryset = queryset.filter(specialization__icontains=specialization)
        return queryset

    @action(detail=True, methods=['post', 'get'], url_path='working-hours', permission_classes=[permissions.IsAuthenticated])
    def working_hours(self, request, pk=None):
        doctor = self.get_object()
        if request.method == 'GET':
            hours = doctor.working_hours.all()
            serializer = DoctorWorkingHoursSerializer(hours, many=True)
            return Response(serializer.data)
            
        # POST: Create or Update working hours
        # Only admin or the doctor themselves can update working hours
        if request.user.role != 'ADMIN' and getattr(request.user, 'doctor_profile', None) != doctor:
            return Response({"detail": "Permission denied."}, status=status.HTTP_403_FOR_CONTENT)
            
        day_of_week = request.data.get('day_of_week')
        start_time = request.data.get('start_time')
        end_time = request.data.get('end_time')

        if day_of_week is None or not start_time or not end_time:
            return Response({"detail": "day_of_week, start_time, and end_time are required."}, status=status.HTTP_400_BAD_REQUEST)

        working_hour, created = DoctorWorkingHours.objects.update_or_create(
            doctor=doctor,
            day_of_week=day_of_week,
            defaults={'start_time': start_time, 'end_time': end_time}
        )
        serializer = DoctorWorkingHoursSerializer(working_hour)
        return Response(serializer.data, status=status.HTTP_200_OK if not created else status.HTTP_201_CREATED)

    @action(detail=True, methods=['get'], url_path='slots', permission_classes=[permissions.IsAuthenticated])
    def slots(self, request, pk=None):
        doctor = self.get_object()
        date_str = request.query_params.get('date', None)
        if not date_str:
            return Response({"detail": "date parameter is required (?date=YYYY-MM-DD)"}, status=status.HTTP_400_BAD_REQUEST)
        
        from appointments.services import generate_available_slots
        try:
            slots = generate_available_slots(doctor.id, date_str)
            return Response(slots, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)



class AdminDoctorViewSet(viewsets.ModelViewSet):
    """
    Admin-only CRUD endpoints for Doctor Profiles.
    """
    permission_classes = [permissions.IsAuthenticated]
    queryset = Doctor.objects.all().select_related('user').prefetch_related('working_hours', 'leaves')

    def get_permissions(self):
        if self.action in ['leave', 'retrieve']:
            return [permissions.IsAuthenticated()]
        return [IsAdmin()]

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return DoctorCreateUpdateSerializer
        return DoctorSerializer

    @action(detail=True, methods=['post', 'delete'], url_path='leave')
    def leave(self, request, pk=None):
        doctor = self.get_object()
        
        # Verify permissions: must be Admin or the doctor themselves
        if request.user.role != 'ADMIN' and doctor.user != request.user:
            return Response({"detail": "You do not have permission to manage this doctor's leaves."}, status=status.HTTP_403_FORBIDDEN)
        
        if request.method == 'POST':
            leave_date = request.data.get('leave_date')
            reason = request.data.get('reason', '')

            if not leave_date:
                return Response({"detail": "leave_date is required."}, status=status.HTTP_400_BAD_REQUEST)

            if DoctorLeave.objects.filter(doctor=doctor, leave_date=leave_date).exists():
                return Response({"detail": "Doctor is already marked on leave for this date."}, status=status.HTTP_400_BAD_REQUEST)

            leave_obj = DoctorLeave.objects.create(doctor=doctor, leave_date=leave_date, reason=reason)
            
            try:
                from appointments.services import handle_doctor_leave
                handle_doctor_leave(doctor.id, leave_date)
            except ImportError:
                pass

            serializer = DoctorLeaveSerializer(leave_obj)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
            
        elif request.method == 'DELETE':
            # Support receiving leave_date either in request body or as a query parameter
            leave_date = request.data.get('leave_date') or request.query_params.get('leave_date')

            if not leave_date:
                return Response({"detail": "leave_date is required."}, status=status.HTTP_400_BAD_REQUEST)

            leaves = DoctorLeave.objects.filter(doctor=doctor, leave_date=leave_date)
            if not leaves.exists():
                return Response({"detail": "No leave found on this date."}, status=status.HTTP_404_NOT_FOUND)
                
            leaves.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)

