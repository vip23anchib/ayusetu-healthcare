# AyuSetu — System Design Document

This document describes the architectural patterns and design decisions implemented in AyuSetu.

## 1. Double-Booking Prevention (Concurrency Controls)
To guarantee strict serialization of slot booking under concurrent patient requests:
1. **Application-Level Check:** Availability checks query the active status values (`CONFIRMED`, `COMPLETED`, and `HELD` within their 5-minute lease) to verify if the target slot is open.
2. **Database Row Locks:** During `hold_slot` execution, the target `Doctor` row is locked using `select_for_update()` inside a `transaction.atomic()` block. This serializes all booking checks for the same doctor.
3. **Database Unique Constraints:** A partial unique index `unique_active_appointment_slot` is defined on `(doctor, appointment_date, start_time)` filtering out `CANCELLED` and `EXPIRED` status entries.
4. **Conflict Handling:** If a race condition bypasses the lock or violates the unique constraint, the database raises an `IntegrityError` or an `OperationalError` (database lock under SQLite). These are intercepted and raised as a `SlotConflictError` (HTTP 409 Conflict) with the message: *"This slot was just booked by another patient. Please choose another slot."*

## 2. Doctor Leave Conflict Handling
When an admin or doctor schedules a leave date:
1. **Leave Creation:** A `DoctorLeave` row is created, enforcing a database unique constraint per doctor/date.
2. **Conflict Scan:** The service scans for active appointments (`status__in=['CONFIRMED', 'HELD']`) matching the doctor and date.
3. **Cancellation & Release:** Affected appointments are marked `CANCELLED`.
4. **Notifications:** Reschedule warning alerts are created in state `PENDING` and queued in the background task queue to notify both patient and doctor.
5. **Calendar Cleanups:** Associated Google Calendar events are deleted.
6. **Slot Protection:** Subsequent queries for slots on that date return empty results due to leave-date filtering.

## 3. Slot Hold Lease Mechanism
To allow patient symptom input without blocking slots indefinitely:
1. **Hold Placement:** Choosing a slot creates an `Appointment` in state `HELD` with `hold_expires_at = now + 5 minutes`.
2. **Lease Protection:** Other booking requests check this time block. If the hold has not expired, it blocks other reservations.
3. **Hold Confirmation:** Submitting symptoms updates the status from `HELD` to `CONFIRMED`.
4. **Hold Cleanup:** A Django-Q scheduled task runs periodically to release expired holds. Expired entries are marked `EXPIRED`, releasing the slot immediately.

## 4. Notification Failure Handling
1. **Transaction Independence:** Creating or updating bookings is decoupled from email dispatch. Bookings save first; notifications are written to the database in state `PENDING` and queued asynchronously using Django-Q.
2. **Task Execution:** Workers fetch the `Notification` record, update status to `PROCESSING`, and attempt email dispatch.
3. **Retry Strategy:** If dispatch throws an exception, the worker increments `attempts` (capped at 3). If `attempts < 3`, status resets to `PENDING` and a delayed one-shot Django-Q `Schedule` is generated to retry in 2 minutes. On final failure, status is set to `FAILED` with `last_error` populated.

## 5. Third-Party Integration Fallbacks
- **AI Triage & Summaries:** Symptoms parsing calls OpenAI with a 10-second timeout. If the request fails, the task saves the record with status `FAILED` and sets urgency to `UNAVAILABLE`, preserving the patient's raw symptoms for doctor review without failing the booking.
- **Google Calendar Sync:** Events sync via background tasks. If Google credentials or secrets are missing, it falls back to console logging and updates status to `ACTIVE`, keeping bookings functional.
