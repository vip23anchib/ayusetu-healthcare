import os
import datetime
from django.utils import timezone
from appointments.models import Appointment
from .models import CalendarEvent, DoctorGoogleCredentials
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build

def get_google_calendar_service(user):
    """
    Builds and returns Google Calendar API client service using doctor's saved credentials.
    Returns None if credentials are not available or client secrets are missing.
    """
    client_id = os.getenv('GOOGLE_CLIENT_ID')
    client_secret = os.getenv('GOOGLE_CLIENT_SECRET')
    
    if not client_id or not client_secret:
        return None

    try:
        cred_obj = DoctorGoogleCredentials.objects.get(user=user)
        # Parse scope list
        scopes = cred_obj.scopes.split(',') if cred_obj.scopes else []
        
        credentials = Credentials(
            token=cred_obj.token,
            refresh_token=cred_obj.refresh_token,
            token_uri=cred_obj.token_uri,
            client_id=client_id,
            client_secret=client_secret,
            scopes=scopes
        )
        
        # Verify and refresh token if expired
        if credentials.expired and credentials.refresh_token:
            from google.auth.transport.requests import Request
            credentials.refresh(Request())
            # Save refreshed token
            cred_obj.token = credentials.token
            cred_obj.save()

        service = build('calendar', 'v3', credentials=credentials)
        return service
    except DoctorGoogleCredentials.DoesNotExist:
        return None
    except Exception as e:
        print(f"[Calendar Service Error] Failed to build Google Calendar Client: {e}")
        return None


def sync_appointment_event(appointment_id):
    """
    Creates a new Google Calendar event when an appointment is confirmed.
    """
    try:
        appointment = Appointment.objects.get(id=appointment_id)
    except Appointment.DoesNotExist:
        return

    # Check if a calendar event already exists
    cal_event, created = CalendarEvent.objects.get_or_create(
        appointment=appointment,
        defaults={'user': appointment.patient, 'status': CalendarEvent.Status.ACTIVE}
    )

    doctor_user = appointment.doctor.user
    service = get_google_calendar_service(doctor_user)

    # Format event payload
    event_start = datetime.datetime.combine(appointment.appointment_date, appointment.start_time).isoformat()
    event_end = datetime.datetime.combine(appointment.appointment_date, appointment.end_time).isoformat()
    
    event_body = {
        'summary': f"AyuSetu Appointment: {appointment.patient.name} with Dr. {doctor_user.name}",
        'description': f"Symptom Summary check.\nUrgency triage.\nInformational purpose only.",
        'start': {
            'dateTime': event_start,
            'timeZone': 'UTC',
        },
        'end': {
            'dateTime': event_end,
            'timeZone': 'UTC',
        },
        'attendees': [
            {'email': appointment.patient.email, 'displayName': appointment.patient.name},
            {'email': doctor_user.email, 'displayName': f"Dr. {doctor_user.name}"}
        ],
    }

    if service:
        try:
            event = service.events().insert(calendarId='primary', body=event_body).execute()
            cal_event.google_event_id = event.get('id')
            cal_event.status = CalendarEvent.Status.ACTIVE
            cal_event.save()
            print(f"[Calendar Sync] Created Google Calendar Event {event.get('id')} for appointment {appointment_id}.")
        except Exception as e:
            print(f"[Calendar Sync Error] Failed to insert event: {e}")
            cal_event.status = CalendarEvent.Status.FAILED
            cal_event.save()
    else:
        # Mock Fallback Console Logging (Zero Config Fallback)
        mock_id = f"mock_google_event_{appointment_id}_{int(timezone.now().timestamp())}"
        print(f"[Calendar Sync Mock] Creating mock Google Calendar Event.")
        print(f"  Summary: {event_body['summary']}")
        print(f"  Start: {event_start}")
        print(f"  End: {event_end}")
        
        cal_event.google_event_id = mock_id
        cal_event.status = CalendarEvent.Status.ACTIVE
        cal_event.save()


def update_appointment_event(appointment_id):
    """
    Updates the Google Calendar event details when an appointment is rescheduled.
    """
    try:
        appointment = Appointment.objects.get(id=appointment_id)
        cal_event = CalendarEvent.objects.get(appointment=appointment)
    except (Appointment.DoesNotExist, CalendarEvent.DoesNotExist):
        return

    doctor_user = appointment.doctor.user
    service = get_google_calendar_service(doctor_user)

    event_start = datetime.datetime.combine(appointment.appointment_date, appointment.start_time).isoformat()
    event_end = datetime.datetime.combine(appointment.appointment_date, appointment.end_time).isoformat()
    
    event_body = {
        'start': {
            'dateTime': event_start,
            'timeZone': 'UTC',
        },
        'end': {
            'dateTime': event_end,
            'timeZone': 'UTC',
        },
    }

    if service and cal_event.google_event_id and not cal_event.google_event_id.startswith('mock_'):
        try:
            service.events().patch(
                calendarId='primary',
                eventId=cal_event.google_event_id,
                body=event_body
            ).execute()
            cal_event.status = CalendarEvent.Status.ACTIVE
            cal_event.save()
            print(f"[Calendar Sync] Updated Google Calendar Event {cal_event.google_event_id} for rescheduled appointment {appointment_id}.")
        except Exception as e:
            print(f"[Calendar Sync Error] Failed to update event: {e}")
            cal_event.status = CalendarEvent.Status.FAILED
            cal_event.save()
    else:
        print(f"[Calendar Sync Mock] Updating mock Google Calendar Event {cal_event.google_event_id} to new timings start: {event_start}, end: {event_end}.")
        cal_event.status = CalendarEvent.Status.ACTIVE
        cal_event.save()


def delete_appointment_event(appointment_id):
    """
    Deletes the Google Calendar event when an appointment is cancelled.
    """
    try:
        cal_event = CalendarEvent.objects.get(appointment_id=appointment_id)
    except CalendarEvent.DoesNotExist:
        return

    appointment = cal_event.appointment
    doctor_user = appointment.doctor.user
    service = get_google_calendar_service(doctor_user)

    if service and cal_event.google_event_id and not cal_event.google_event_id.startswith('mock_'):
        try:
            service.events().delete(
                calendarId='primary',
                eventId=cal_event.google_event_id
            ).execute()
            cal_event.status = CalendarEvent.Status.DELETED
            cal_event.save()
            print(f"[Calendar Sync] Deleted Google Calendar Event {cal_event.google_event_id} for cancelled appointment {appointment_id}.")
        except Exception as e:
            print(f"[Calendar Sync Error] Failed to delete event: {e}")
            cal_event.status = CalendarEvent.Status.FAILED
            cal_event.save()
    else:
        print(f"[Calendar Sync Mock] Deleting mock Google Calendar Event {cal_event.google_event_id} (cancelled).")
        cal_event.status = CalendarEvent.Status.DELETED
        cal_event.save()
