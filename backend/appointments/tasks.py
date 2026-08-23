from django.utils import timezone
from appointments.models import Appointment

def release_expired_holds_task():
    """
    Scans the database for appointments in HELD state that have passed their hold_expires_at time.
    Marks them as EXPIRED so the slots are freed.
    """
    now = timezone.now()
    expired_holds = Appointment.objects.filter(
        status=Appointment.Status.HELD,
        hold_expires_at__lte=now
    )
    count = expired_holds.count()
    if count > 0:
        # Update status to EXPIRED and clear the hold timestamp
        expired_holds.update(status=Appointment.Status.EXPIRED, hold_expires_at=None)
        print(f"[Expired Holds Cleanup] Released {count} expired slot holds.")
    return count
