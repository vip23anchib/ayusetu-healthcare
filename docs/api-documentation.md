# AyuSetu — API Documentation

Base URL: `http://localhost:8000/api/` (local) · `https://your-backend.onrender.com/api/` (production)

**Authentication:** All endpoints except `/auth/register/` and `/auth/login/` require `Authorization: Bearer <access_token>` header.

**Permission tiers:**
- `PUBLIC` — no token required
- `AUTH` — any authenticated user
- `PATIENT` — user with `role=PATIENT`
- `DOCTOR` — user with `role=DOCTOR`
- `ADMIN` — user with `role=ADMIN`
- `PARTICIPANT` — the patient or doctor on that appointment, or any ADMIN

---

## Authentication

### `POST /api/auth/register/`
**Auth:** PUBLIC  
**Purpose:** Create a new patient or doctor account.

**Request body:**
```json
{ "name": "Rohan Malhotra", "email": "rohan@example.com", "password": "Patient@123", "role": "PATIENT" }
```
`role` accepts `"PATIENT"` or `"DOCTOR"`.

**Response `201`:**
```json
{ "access": "<jwt>", "refresh": "<jwt>", "user": { "id": 1, "name": "Rohan Malhotra", "email": "rohan@example.com", "role": "PATIENT" } }
```

**Errors:**
- `400` — email already registered, or missing fields.

---

### `POST /api/auth/login/`
**Auth:** PUBLIC  
**Purpose:** Obtain a JWT token pair.

**Request body:**
```json
{ "email": "rohan@example.com", "password": "Patient@123" }
```

**Response `200`:**
```json
{ "access": "<jwt>", "refresh": "<jwt>", "user": { "id": 1, "name": "Rohan Malhotra", "role": "PATIENT" } }
```

**Errors:**
- `401` — wrong credentials.

---

### `GET /api/auth/me/`
**Auth:** AUTH  
**Purpose:** Return the currently authenticated user's profile.

**Response `200`:**
```json
{ "id": 1, "name": "Rohan Malhotra", "email": "rohan@example.com", "role": "PATIENT" }
```

---

## Doctors

### `GET /api/doctors/`
**Auth:** AUTH  
**Purpose:** List all registered doctors with specialization, slot duration, and working hours.

**Response `200`:** Array of doctor objects.
```json
[{ "id": 1, "user": { "id": 2, "name": "Ananya Reddy" }, "specialization": "Cardiology", "slot_duration": 30, "working_hours": [...], "leaves": [...] }]
```

---

### `GET /api/doctors/{id}/`
**Auth:** AUTH  
**Purpose:** Retrieve a single doctor's profile.

---

### `GET /api/doctors/{id}/slots/?date=YYYY-MM-DD`
**Auth:** AUTH  
**Purpose:** Return available time slots for the doctor on the given date. Slots occupied by `CONFIRMED`, `COMPLETED`, or unexpired `HELD` appointments, or falling on a leave date, are excluded.

**Response `200`:**
```json
[{ "start_time": "09:00:00", "end_time": "09:30:00" }]
```

---

## Admin — Doctor Management

> All `/api/admin/doctors/` endpoints require `role=ADMIN`.

### `POST /api/admin/doctors/`
**Auth:** ADMIN  
**Purpose:** Create a new doctor account with default Monday–Friday 9 AM–5 PM working hours.

**Request body:**
```json
{ "name": "Arjun Kapoor", "email": "dr.arjun.kapoor@example.com", "password": "Doctor@123", "specialization": "Orthopedics", "slot_duration": 30 }
```

**Response `201`:** Doctor object.  
**Errors:** `400` — email taken; `403` — not ADMIN.

---

### `DELETE /api/admin/doctors/{id}/`
**Auth:** ADMIN  
**Purpose:** Delete a doctor's account and all associated data.

---

### `GET /api/admin/doctors/{id}/`
**Auth:** ADMIN  
**Purpose:** Retrieve full doctor profile including leave list.

---

### `POST /api/admin/doctors/{id}/leave/`
**Auth:** ADMIN  
**Purpose:** Schedule a leave day. Cancels all `CONFIRMED`/`HELD` appointments on that date and queues notifications.

**Request body:**
```json
{ "leave_date": "2026-09-10", "reason": "Medical conference" }
```

**Response `201`:** Leave object.  
**Errors:** `400` — date already marked as leave; `403` — not ADMIN.

---

### `DELETE /api/admin/doctors/{id}/leave/`
**Auth:** ADMIN  
**Purpose:** Cancel a previously scheduled leave.

**Request body:**
```json
{ "leave_date": "2026-09-10" }
```

---

## Appointments

### `GET /api/appointments/`
**Auth:** AUTH  
**Purpose:** List appointments. Patients see only their own; Doctors see their own; Admins see all.

**Response `200`:** Array of appointment objects with nested patient, doctor, status, and times.

---

### `POST /api/appointments/`
**Auth:** PATIENT  
**Purpose:** Hold a slot for 5 minutes. Creates an `Appointment` with `status=HELD`.

**Request body:**
```json
{ "doctor_id": 1, "appointment_date": "2026-09-15", "start_time": "10:00:00" }
```

**Response `201`:** Appointment object including `hold_expires_at`.  
**Errors:**
- `409 Conflict` — slot already taken or held: `{"detail": "This slot was just booked by another patient. Please choose another slot."}`
- `400` — past date, doctor on leave, or outside working hours.

---

### `GET /api/appointments/{id}/`
**Auth:** PARTICIPANT  
**Purpose:** Retrieve a single appointment's full detail.

---

### `POST /api/appointments/{id}/symptoms/`
**Auth:** PATIENT  
**Purpose:** Submit pre-visit symptoms and confirm the booking. Transitions `status` from `HELD` to `CONFIRMED`. Queues the AI triage task and booking confirmation email.

**Request body:**
```json
{ "symptoms_text": "Persistent chest tightness for 3 days, mild shortness of breath on exertion." }
```

**Response `200`:** Updated appointment object.  
**Errors:** `400` — appointment not in HELD state, or hold expired.

---

### `POST /api/appointments/{id}/cancel/`
**Auth:** PARTICIPANT  
**Purpose:** Cancel a `CONFIRMED` appointment. Queues cancellation notification emails.

**Response `200`:** Updated appointment with `status=CANCELLED`.  
**Errors:** `400` — appointment already cancelled/completed.

---

### `POST /api/appointments/{id}/reschedule/`  
*(also accepts `PATCH`)*  
**Auth:** PATIENT  
**Purpose:** Move a `CONFIRMED` appointment to a new date/time slot.

**Request body:**
```json
{ "appointment_date": "2026-09-20", "start_time": "14:00:00" }
```

**Response `200`:** Updated appointment object.  
**Errors:**
- `409 Conflict` — new slot is taken.
- `400` — appointment not reschedulable, or past date.

---

### `GET /api/appointments/{id}/pre-visit-summary/`
**Auth:** PARTICIPANT  
**Purpose:** Retrieve AI-generated triage summary (urgency, chief complaint, 3 suggested questions).

**Response `200`:**
```json
{ "urgency": "MEDIUM", "chief_complaint": "Persistent chest tightness", "suggested_questions": ["...", "...", "..."], "status": "COMPLETED" }
```
**Errors:** `404` — summary not generated yet.

---

### `GET /api/appointments/{id}/consultation/`
**Auth:** PARTICIPANT  
**Purpose:** Retrieve completed consultation notes, follow-up date, and prescription.

---

### `POST /api/appointments/{id}/consultation/`
**Auth:** DOCTOR  
**Purpose:** Finalize a consultation with notes and medications. Sets appointment `status=COMPLETED`. Queues AI post-visit summary and email.

**Request body:**
```json
{
  "doctor_notes": "Patient presents with stable angina. Recommend stress test.",
  "follow_up_date": "2026-10-01",
  "medications": [
    { "medicine_name": "Aspirin", "dosage": "75mg", "frequency": "Once daily", "duration": "30 days", "instructions": "Take after food." }
  ]
}
```

**Response `201`:** Consultation object.  
**Errors:** `403` — not a doctor; `400` — already completed.

---

### `GET /api/appointments/{id}/prescription/`
**Auth:** PARTICIPANT  
**Purpose:** Retrieve prescription and medication list for a completed appointment.

---

### `GET /api/appointments/{id}/post-visit-summary/`
**Auth:** PARTICIPANT  
**Purpose:** Retrieve AI-generated patient-friendly post-visit instructions.

---

## Google Calendar Integration

### `GET /api/calendar/connect/`
**Auth:** AUTH  
**Purpose:** Generate a Google OAuth 2.0 authorization URL. Redirect the user to this URL to grant calendar access.

**Response `200`:** `{ "auth_url": "https://accounts.google.com/o/oauth2/auth?..." }`

---

### `GET /api/calendar/callback/`
**Auth:** PUBLIC (called by Google's redirect)  
**Purpose:** Handles the OAuth callback, exchanges the authorization code for tokens, stores credentials, and creates the pending calendar event.

---

## Common Error Shapes

| Code | When | Shape |
| :--- | :--- | :--- |
| `400` | Validation failure | `{"detail": "..."}` or `{"field": ["error"]}` |
| `401` | Missing or invalid token | `{"detail": "Authentication credentials were not provided."}` |
| `403` | Wrong role | `{"detail": "Permission denied."}` |
| `404` | Record not found | `{"detail": "Not found."}` |
| `409` | Slot conflict on booking/reschedule | `{"detail": "This slot was just booked by another patient..."}` |
