import os
import json

import google.generativeai as genai

GEMINI_MODEL = "gemini-1.5-flash"

def analyze_symptoms(symptoms_text):
    """
    Calls Gemini to analyze patient symptoms.
    Returns: {
      "urgency": "LOW" | "MEDIUM" | "HIGH",
      "chief_complaint": "string",
      "suggested_questions": ["string", "string", "string"]
    }
    """
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        # Development fallback mock
        print("[AI Service] GEMINI_API_KEY not found. Running development mock fallback.")
        return get_mock_symptoms_summary(symptoms_text)

    prompt = (
        "You are an assistant helping a licensed healthcare professional review patient-provided symptoms.\n"
        "Analyze the symptoms and return ONLY valid JSON with:\n"
        "{\n"
        "  \"urgency\": \"Low | Medium | High\",\n"
        "  \"chief_complaint\": \"string\",\n"
        "  \"suggested_questions\": [\"string\", \"string\", \"string\"]\n"
        "}\n"
        "Rules:\n"
        "- Do not diagnose.\n"
        "- Do not prescribe medication.\n"
        "- Do not invent facts.\n"
        "- Urgency is a triage-style indicator for clinician review, not a diagnosis.\n"
        "- Provide exactly three suggested questions.\n"
    )

    try:
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel(
            model_name=GEMINI_MODEL,
            generation_config=genai.GenerationConfig(
                response_mime_type="application/json",
                temperature=0.0,
            ),
        )
        full_prompt = f"{prompt}\n\nPatient symptoms:\n{symptoms_text}"
        response = model.generate_content(full_prompt)
        content = response.text
        parsed = json.loads(content)

        # Validate keys and shape (unchanged from original)
        urgency = str(parsed.get("urgency", "MEDIUM")).upper()
        if urgency not in ["LOW", "MEDIUM", "HIGH"]:
            urgency = "MEDIUM"

        questions = parsed.get("suggested_questions", [])
        if not isinstance(questions, list) or len(questions) != 3:
            questions = [
                "When did this start?",
                "Have you noticed any triggers?",
                "Are you taking any other remedies?",
            ]

        return {
            "urgency": urgency,
            "chief_complaint": parsed.get("chief_complaint", symptoms_text[:120]),
            "suggested_questions": questions,
        }
    except Exception as e:
        print(f"[AI Service Error] Gemini symptom analysis failed: {e}")
        # Re-raise so caller can set UNAVAILABLE state
        raise e


def generate_patient_summary(notes, medications):
    """
    Calls Gemini to convert doctor checkup notes and medications into a patient-friendly summary.
    """
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        print("[AI Service] GEMINI_API_KEY not found. Running development mock fallback.")
        return get_mock_patient_summary(notes, medications)

    prompt = (
        "You are converting clinician-provided notes into a patient-friendly summary.\n"
        "Use only information supplied by the clinician.\n\n"
        "Return a concise, easy-to-understand summary containing:\n"
        "- what the clinician explained\n"
        "- prescribed medications and their schedules\n"
        "- follow-up instructions\n"
        "- important precautions explicitly included by the clinician\n\n"
        "Rules:\n"
        "- Do not invent diagnoses.\n"
        "- Do not modify dosage.\n"
        "- Do not add medicines.\n"
        "- Do not override clinician instructions.\n"
        "- Do not introduce information not present in the input.\n"
    )

    user_input = f"Clinician Notes: {notes}\nPrescribed Medications:\n"
    for med in medications:
        user_input += (
            f"- {med.get('medicine_name')}: {med.get('dosage')} dosage, "
            f"frequency: {med.get('frequency')}, duration: {med.get('duration')}. "
            f"Instructions: {med.get('instructions')}\n"
        )

    try:
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel(
            model_name=GEMINI_MODEL,
            generation_config=genai.GenerationConfig(temperature=0.2),
        )
        full_prompt = f"{prompt}\n\n{user_input}"
        response = model.generate_content(full_prompt)
        return response.text.strip()
    except Exception as e:
        print(f"[AI Service Error] Gemini patient summary failed: {e}")
        raise e


# Mock Helpers (unchanged — used when GEMINI_API_KEY is absent)
def get_mock_symptoms_summary(symptoms_text):
    # Analyze keywords for mock urgency
    text_lower = symptoms_text.lower()
    urgency = "LOW"
    if any(k in text_lower for k in ["severe", "chest pain", "breathing", "heart", "bleeding"]):
        urgency = "HIGH"
    elif any(k in text_lower for k in ["fever", "vomiting", "cough", "pain", "moderate"]):
        urgency = "MEDIUM"

    return {
        "urgency": urgency,
        "chief_complaint": symptoms_text[:150] + ("..." if len(symptoms_text) > 150 else ""),
        "suggested_questions": [
            f"Can you detail the onset and progression of: '{symptoms_text[:30]}...'?",
            "Are there any aggravating factors or associated symptoms?",
            "What previous treatments or medications have you tried for this condition?",
        ],
    }

def get_mock_patient_summary(notes, medications):
    med_lines = []
    for med in medications:
        med_lines.append(
            f"- {med.get('medicine_name')} ({med.get('dosage')}) - "
            f"{med.get('frequency')} for {med.get('duration')}. {med.get('instructions')}"
        )

    meds_text = "\n".join(med_lines)
    return (
        f"Based on your consultation, here is your summary:\n\n"
        f"**Doctor's Notes Summary:**\n"
        f"{notes}\n\n"
        f"**Prescribed Medications:**\n"
        f"{meds_text}\n\n"
        f"**Important Notice:** This summary is informational only and does not replace professional medical judgment."
    )
