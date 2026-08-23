# AyuSetu — AI-Powered Healthcare Appointment & Follow-up Platform

![AyuSetu Logo](frontend/public/logo.png)

**AyuSetu** (translating to *"Bridge of Health"*) is a complete, production-grade MVP for clinical appointment scheduling, AI-powered pre-visit symptom triage, doctor consultation notes, prescription tracking, and post-visit patient guidance summaries.

Designed under a hard 2-day MVP timeframe, AyuSetu enforces strict ACID transaction controls, database row locking (`select_for_update`) to eliminate double-bookings, background task workers for email notifications and medication reminders, and direct Google Calendar synchronization.

---

## 📚 Complete Project Documentation Index

For in-depth explanations, architectural diagrams, step-by-step production deployment guides, and interview prep Q&A, refer to our detailed documentation:

1. **[Full Architecture & System Guide](docs/full-guide.md)**:
   - What is AyuSetu in plain English vs technical implementation.
   - Core engineering mechanisms (slot holds, AI triage, emergency leave resolution, email retries).
   - Database schema walkthrough & 3NF relational rationale.
   - Step-by-step production deployment guide (Vercel, Render, Neon PostgreSQL, Upstash Redis).
   - Known limitations & future roadmap.
2. **[Technical Interview Preparation Guide](docs/interview-prep.md)**:
   - Top 10 anticipated technical interview questions & architectural answers.
   - Concurrency, ACID transactions, AI fallback modes, and security isolation Q&A.

---

## ⚡ Quick Start Guide (Local Development)

### 1. Prerequisites
- Python 3.10+
- Node.js 18+ and npm

### 2. Backend Setup (Django REST Framework)
```bash
# Navigate to backend
cd backend

# Create & activate virtual environment
python -m venv venv
# On Windows (PowerShell):
.\venv\Scripts\Activate.ps1
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run migrations & seed authentic Indian demo data
python manage.py migrate
python manage.py seed_data

# Run Backend Test Suite (31 Automated Unit Tests)
python manage.py test accounts doctors appointments consultations notifications calendar_integration

# Start Backend Server (http://127.0.0.1:8000)
python manage.py runserver
```

### 3. Frontend Setup (React 18 + Vite + Tailwind CSS v4)
In a new terminal window:
```bash
# Navigate to frontend
cd frontend

# Install packages
npm install

# Start Development Server (http://localhost:5173)
npm run dev
```

---

## 🔐 Authentic Seed Demo Accounts

The `seed_data` command seeds the database with authentic Indian clinical profiles and demo patient accounts:

| Role | Name / Specialty | Email | Password |
| :--- | :--- | :--- | :--- |
| **Patient** | Rohan Malhotra | `rohan.malhotra@example.com` | `Patient@123` |
| **Patient** | Ananya Reddy | `ananya.reddy@example.com` | `Patient@123` |
| **Doctor** | Dr. Ananya Reddy *(Cardiology)* | `dr.ananya.reddy@example.com` | `Doctor@123` |
| **Doctor** | Dr. Vikram Iyer *(General Physician)* | `dr.vikram.iyer@example.com` | `Doctor@123` |
| **Doctor** | Dr. Meera Krishnan *(Dermatology)* | `dr.meera.krishnan@example.com` | `Doctor@123` |
| **Admin** | Clinic Administrator | `admin@ayusetu.com` | `Admin@123` |

---

## 🛠️ Technology Stack Summary

- **Frontend**: React 18, Vite, Tailwind CSS v4, Lucide Icons, Axios, ThemeContext (Light & Persistent Dark Mode).
- **Backend**: Python 3.10+, Django 6.1, Django REST Framework, SimpleJWT Authentication.
- **Database**: PostgreSQL (Production) / SQLite3 (Local Dev & Testing) with Row Locking (`select_for_update`) and Partial Unique Index Constraints.
- **Async Queue & Background Workers**: `django-q2` ORM task runner with email retry backoff and periodic expired hold cleanup.
- **External Integrations**: OpenAI API (`gpt-4o-mini`) for pre/post visit summaries, Google Calendar API (OAuth 2.0).

---

## 🎨 Key Features & Design Highlights

- **AyuSetu Visual Identity**:
  - Two-tone brand wordmark (**Ayu** in deep navy `#1E3A5F`, **Setu** in teal `#0F9B8E`) rendered with Baloo 2 extra-bold font.
  - Caduceus + heart + hexagon logo mark in sidebar, header, login/register screens, and browser favicon.
  - Persistent Light & Dark Theme Toggle switch with contrast text adjustments.
- **Concurrency & Double-Booking Protection**:
  - 5-minute slot hold reservation pattern.
  - Atomic transaction locks return `409 Conflict` on race conditions.
  - Periodic background task releases expired slot holds automatically.
- **Non-Blocking AI Summaries**:
  - OpenAI symptom analysis runs in a try/except safety wrapper.
  - Fallback status `UNAVAILABLE` preserves booking flow and displays raw patient symptoms if AI services are down.
- **Admin Control Center**:
  - Global booking activity log with real-time patient/doctor/specialty search, status filter pills, date selector, and individual row View details modal.
  - Doctor leave configuration automatically cancels conflict slots and notifies affected patients.

---

## 📄 License
This repository is built for the AyuSetu Healthcare MVP Assignment.
