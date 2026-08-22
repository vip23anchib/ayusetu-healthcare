from rest_framework import permissions

class IsParticipantOrAdmin(permissions.BasePermission):
    """
    Custom permission to only allow participants of the appointment or admins to access it.
    """
    def has_object_permission(self, request, view, obj):
        if request.user.role == 'ADMIN':
            return True
        if request.user.role == 'DOCTOR':
            return obj.doctor.user == request.user
        if request.user.role == 'PATIENT':
            return obj.patient == request.user
        return False
