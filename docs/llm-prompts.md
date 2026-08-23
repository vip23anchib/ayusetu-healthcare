# AyuSetu — LLM Prompts Reference

This document contains the **verbatim** prompt text used in `backend/ai/ai_service.py`, plus the input→output flow for each.

---

## 1. Pre-Visit Symptom Triage

**Source:** `ai_service.py → analyze_symptoms(symptoms_text)` — called after `POST /api/appointments/{id}/symptoms/` when the patient submits symptoms.

### System Prompt (verbatim)

```
You are an assistant helping a licensed healthcare professional review patient-provided symptoms.
Analyze the symptoms and return ONLY valid JSON with:
{
  "urgency": "Low | Medium | High",
  "chief_complaint": "string",
  "suggested_questions": ["string", "string", "string"]
}
Rules:
- Do not diagnose.
- Do not prescribe medication.
- Do not invent facts.
- Urgency is a triage-style indicator for clinician review, not a diagnosis.
- Provide exactly three suggested questions.
```

### User Message
The raw patient-submitted symptoms text (free-form string), e.g.:
```
"Persistent chest tightness for 3 days, mild shortness of breath on exertion, no fever."
```

### Model Configuration
- **Model:** `gpt-4o-mini`
- **Temperature:** `0.0` (deterministic, reproducible output)
- **Response format:** `{ "type": "json_object" }` (forces valid JSON)
- **Timeout:** 8 seconds

### Output Shape (validated before saving)
```json
{
  "urgency": "MEDIUM",
  "chief_complaint": "Persistent chest tightness with exertional dyspnoea",
  "suggested_questions": [
    "When exactly did the chest tightness begin and does it radiate anywhere?",
    "Do you have any history of cardiac conditions or hypertension?",
    "Does the discomfort worsen at rest or only during physical activity?"
  ]
}
```

### Input → LLM → Output Flow
```
Patient submits symptoms (POST /api/appointments/{id}/symptoms/)
    │
    ▼
confirm_booking() saves Symptom record + transitions status → CONFIRMED
    │
    ▼ (Django-Q async task)
generate_pre_visit_summary_task(appointment_id)
    │
    ├─ Calls analyze_symptoms(symptoms_text)
    │     ├─ [OPENAI_API_KEY present] → httpx POST → OpenAI API → parse JSON
    │     └─ [Key absent] → keyword-based mock fallback (urgency from keywords)
    │
    ▼
PreVisitSummary saved with urgency / chief_complaint / suggested_questions
    │
    ▼
Shown in:
  - Doctor Portal → Today's schedule card (chief complaint + suggested questions)
  - Patient Portal → Appointment Detail → "AI Triage Assessment" card
```

---

## 2. Post-Visit Patient-Friendly Summary

**Source:** `ai_service.py → generate_patient_summary(notes, medications)` — called after `POST /api/appointments/{id}/consultation/` when the doctor finalizes a consult.

### System Prompt (verbatim)

```
You are converting clinician-provided notes into a patient-friendly summary.
Use only information supplied by the clinician.

Return a concise, easy-to-understand summary containing:
- what the clinician explained
- prescribed medications and their schedules
- follow-up instructions
- important precautions explicitly included by the clinician

Rules:
- Do not invent diagnoses.
- Do not modify dosage.
- Do not add medicines.
- Do not override clinician instructions.
- Do not introduce information not present in the input.
```

### User Message (constructed programmatically)

```
Clinician Notes: <doctor_notes text>
Prescribed Medications:
- <medicine_name>: <dosage> dosage, frequency: <frequency>, duration: <duration>. Instructions: <instructions>
- (one line per medication)
```

### Model Configuration
- **Model:** `gpt-4o-mini`
- **Temperature:** `0.2` (slightly creative for readability, still grounded)
- **Timeout:** 10 seconds

### Output Shape
Free-form plain text (not JSON). Example:

```
Based on your visit today with Dr. Arjun Kapoor:

Your doctor explained that you have stable angina and recommends a stress test to 
further assess your heart's condition.

Medications prescribed:
• Aspirin 75mg — Take once daily after food for 30 days.

Follow-up: Please return for a review on 1st October 2026.

Important: Avoid strenuous activity until your stress test results are reviewed.
```

### Input → LLM → Output Flow
```
Doctor finalizes consultation (POST /api/appointments/{id}/consultation/)
    │
    ▼
create_consultation() saves Consultation + Prescription + Medications
    + sets Appointment status → COMPLETED
    │
    ▼ (Django-Q async task)
generate_post_visit_summary_task(consultation_id)
    │
    ├─ Calls generate_patient_summary(notes, medications_list)
    │     ├─ [OPENAI_API_KEY present] → httpx POST → OpenAI API → plain text response
    │     └─ [Key absent] → mock fallback (bullet-list format from notes + meds)
    │
    ▼
PostVisitSummary saved with summary text + status=COMPLETED
    │
    ▼ (additional async task)
Medication reminder Notification queued (type=MEDICATION_REMINDER)
    │
    ▼
Shown in:
  - Patient Portal → Appointment Detail → "Patient-Friendly Instructions" card
```

---

## Development Mock Fallbacks

When `OPENAI_API_KEY` is not set, both functions fall back to deterministic local logic:

**`get_mock_symptoms_summary(symptoms_text)`** — checks for keywords (`"chest pain"`, `"fever"`, `"severe"`, etc.) to assign urgency. Returns the first 150 characters of the symptoms as the chief complaint.

**`get_mock_patient_summary(notes, medications)`** — returns a formatted string combining the raw notes and a bullet list of the medications. Includes a disclaimer footer.

This ensures the booking and consultation flow works end-to-end locally without an OpenAI account.
