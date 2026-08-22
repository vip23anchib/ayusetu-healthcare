# AyuSetu — AI-Powered Healthcare Appointment & Follow-up Platform

AyuSetu is a full-stack clinical scheduling and AI-driven consultation MVP designed to streamline doctor appointments, clinical follow-ups, and patient care guidance. The platform utilizes advanced concurrency controls to prevent double-bookings, incorporates background queues for notifications/reminders, and leverages LLMs for pre-visit symptoms triage and clinical summaries.

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- Python 3.10+
- Node.js 18+
- npm (v9+)

### 2. Backend Installation (Django REST Framework)
Navigate to the `backend/` directory:
```bash
cd backend
```

Create and activate a virtual environment:
```bash
# Windows
python -m venv venv
venv\Scripts\activate

# macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

Install dependencies:
```bash
pip install -r requirements.txt
```

Run database migrations:
```bash
python manage.py migrate
```

Initialize local mock data (seeds admin, doctor profiles, working hours, patients, and consultation histories):
```bash
python manage.py seed_data
```

Start the Django development server:
```bash
python manage.py runserver
```

Start the background task worker (Django-Q cluster):
```bash
python manage.py qcluster
```

---

### 3. Frontend Installation (Vite + React + Tailwind v4)
Navigate to the `frontend/` directory in a new terminal:
```bash
cd frontend
```

Install packages:
```bash
npm install
```

Launch the Vite development server:
```bash
npm run dev
```
Open your browser and navigate to `http://localhost:5173`.

---

## 🔑 Seeding Login Credentials

The `seed_data` command initializes the system with these pre-configured user credentials:

| Role | Email | Password | Details |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@ayusetu.com` | `adminpassword` | Global metrics, doctor setup, leaves configuration. |
| **Doctor** | `heart@ayusetu.com` | `doctorpassword` | Sarah Heart (Cardiology) - Mon-Fri 9 AM - 5 PM. |
| **Doctor** | `brain@ayusetu.com` | `doctorpassword` | Charles Brain (Neurology) - Mon-Fri 9 AM - 5 PM. |
| **Doctor** | `child@ayusetu.com` | `doctorpassword` | Lily Child (Paediatrics) - Mon-Fri 9 AM - 5 PM. |
| **Patient** | `patient@ayusetu.com` | `patientpassword` | Jane Patient (Completed yesterday checkup, upcoming consult tomorrow). |
| **Patient** | `patient2@ayusetu.com` | `patient2password` | John Patient (Upcoming consult tomorrow). |

---

## 🛠️ Core Engineering Architectures

### 1. Concurrency Controls & Slot Locks
- AyuSetu uses row-level database locks (`select_for_update`) to serialize concurrent booking attempts.
- In addition, a partial unique database index (`unique_active_appointment_slot`) on `(doctor, appointment_date, start_time)` filters out cancelled or expired slots, acting as the ultimate safety net.
- During local SQLite testing, thread-isolated SQLite connections normally raise `OperationalError` ("database is locked") when concurrent connections collide. The backend handles this dynamically, translating both database `IntegrityError` index violations and SQLite `OperationalError` locks into user-friendly `SlotConflictError` alerts (409 Conflict).

### 2. AI Pre/Post-Visit Summaries & Outage Recovery
- **Pre-Visit Symptoms Triage:** Generates urgency level (LOW, MEDIUM, HIGH), chief complaints, and suggested doctor checkup prompts.
- **Post-Visit Patient Summaries:** Generates clear advice, precaution warnings, and dosage lists.
- **Outage Fallbacks:** If the OpenAI API is overloaded, times out (after 8 seconds), or the API key is missing, errors are caught silently. The app saves the summary with status `FAILED` and sets the urgency to `UNAVAILABLE` or preserves raw symptoms without disrupting the doctor or patient workflows.

### 3. Asynchronous Queue Processing & Medication Reminders
- Task processing runs via the database-backed `Django-Q` cluster.
- When an appointment triggers email actions (booking, reschedule, cancel, leave reschedule), a `Notification` record is created in state `PENDING` and queued. If the email dispatch fails (e.g. SMTP outages), the worker catches it, increments attempts, and schedules a delayed retry task using a one-shot `Schedule` record.
- **Medication Reminders:** Frequency strings (e.g. "Twice daily" for "5 days") are parsed into tomorrow's scheduled one-shot tasks, triggering future notifications at 9 AM/9 PM automatically.

### 4. Google Calendar Synchronization & Connect Fallbacks
- Confirmed appointments trigger Google Calendar sync tasks.
- If Google credentials or Client secrets are missing in `.env`, the OAuth connector returns a mock callback target (`code=mock_code_123`) which links development credentials. The sync service prints mock event creation outputs to the developer console and marks the state `ACTIVE` or `DELETED`, ensuring zero-setup developer environments compile, run, and test successfully.

---

## 🧪 Automated Testing

We maintain 29 unit tests covering authentication, doctor schedules, leave controls, concurrent slot holds, AI fallbacks, email retries, and calendar callbacks.

To execute the test suite:
```bash
cd backend
venv\Scripts\python manage.py test accounts doctors appointments consultations notifications calendar_integration
```
