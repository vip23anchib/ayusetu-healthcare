import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../../services/api';
import { Calendar, Clock, Stethoscope, AlertTriangle, ShieldAlert, Heart, Plus, Trash2, ChevronLeft, HelpCircle } from 'lucide-react';

const DoctorConsult = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [appointment, setAppointment] = useState(null);
  const [preVisit, setPreVisit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Form states
  const [notes, setNotes] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [medications, setMedications] = useState([
    { medicine_name: '', dosage: '', frequency: 'Once daily', duration: '5 days', instructions: '' }
  ]);

  useEffect(() => {
    const fetchConsultData = async () => {
      setLoading(true);
      setError('');
      try {
        const apptRes = await API.get(`appointments/${id}/`);
        setAppointment(apptRes.data);

        // Try load pre-visit summary
        try {
          const pvRes = await API.get(`appointments/${id}/pre-visit-summary/`);
          setPreVisit(pvRes.data);
        } catch (e) {
          console.log("No pre-visit summary available for this slot", e);
        }
      } catch (err) {
        console.error("Failed to load consult context", err);
        setError("Failed to load appointment context.");
      } finally {
        setLoading(false);
      }
    };
    fetchConsultData();
  }, [id]);

  const handleAddMedication = () => {
    setMedications([
      ...medications,
      { medicine_name: '', dosage: '', frequency: 'Once daily', duration: '5 days', instructions: '' }
    ]);
  };

  const handleRemoveMedication = (index) => {
    setMedications(medications.filter((_, idx) => idx !== index));
  };

  const handleMedChange = (index, field, value) => {
    const updated = medications.map((med, idx) => {
      if (idx === index) {
        return { ...med, [field]: value };
      }
      return med;
    });
    setMedications(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!notes.trim()) {
      setError("Clinical checkup notes are mandatory.");
      return;
    }

    // Filter out incomplete medications (must have medicine name)
    const validMeds = medications.filter(m => m.medicine_name.trim() !== '');

    setSubmitting(true);
    setError('');

    try {
      await API.post(`appointments/${id}/consultation/`, {
        doctor_notes: notes,
        follow_up_date: followUpDate || null,
        medications: validMeds
      });
      
      // Redirect back to dashboard
      navigate('/doctor/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to submit checkup. Please try again.");
      setSubmitting(false);
    }
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'LOW': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'MEDIUM': return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'HIGH': return 'bg-rose-50 text-rose-700 border-rose-100 animate-pulse';
      default: return 'bg-slate-50 text-slate-500 border-slate-100';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error || !appointment) {
    return (
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl border border-slate-200 text-center shadow-sm">
        <AlertTriangle className="h-10 w-10 text-red-500 mx-auto mb-4" />
        <p className="text-slate-700 font-semibold">{error || "Appointment not found."}</p>
        <button onClick={() => navigate('/doctor/dashboard')} className="mt-4 text-sm text-primary-600 font-bold">
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header Profile */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/doctor/dashboard')}
          className="inline-flex items-center space-x-1.5 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ChevronLeft className="h-4.5 w-4.5" />
          <span>Exit Consultation</span>
        </button>
        <span className="text-xs text-slate-500 font-mono">Appt Ref: #{appointment.id}</span>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-xs font-bold text-primary-600 uppercase tracking-wider">Clinical Consult Builder</span>
          <h1 className="text-xl font-bold text-slate-800 mt-1">Patient Checkup: {appointment.patient.name}</h1>
          <p className="text-slate-500 text-xs mt-0.5">{appointment.patient.email}</p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-slate-700 bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-lg font-medium">
          <Calendar className="h-4 w-4 text-slate-400" />
          <span>{appointment.appointment_date}</span>
          <span className="text-slate-200">|</span>
          <Clock className="h-4 w-4 text-slate-400" />
          <span>{appointment.start_time.substring(0, 5)} - {appointment.end_time.substring(0, 5)}</span>
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 border-l-4 border-rose-500 p-4 rounded-xl text-sm text-rose-800">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Triage Side Panel */}
        <div className="lg:col-span-1 space-y-6">
          {/* Patient Symptoms */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-3">
            <h3 className="font-semibold text-slate-800 flex items-center space-x-2 border-b border-slate-100 pb-2">
              <Stethoscope className="h-4.5 w-4.5 text-primary-600" />
              <span>Reported Symptoms</span>
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed italic bg-slate-50/50 p-3 rounded-xl border border-slate-100/50">
              "{appointment.symptoms?.symptoms_text || 'No symptoms provided.'}"
            </p>
          </div>

          {/* AI pre visit summary */}
          {preVisit && (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
              <h3 className="font-semibold text-slate-800 flex items-center space-x-2 border-b border-slate-100 pb-2">
                <ShieldAlert className="h-4.5 w-4.5 text-primary-600" />
                <span>AI Pre-Visit Triage</span>
              </h3>

              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-medium">Urgency:</span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getUrgencyColor(preVisit.urgency)}`}>
                  {preVisit.urgency}
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Chief Complaint Summary</span>
                <p className="text-xs font-semibold text-slate-700 leading-relaxed">{preVisit.chief_complaint}</p>
              </div>

              {/* Suggested Questions */}
              {preVisit.suggested_questions?.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1">
                    <HelpCircle className="h-3 w-3 text-slate-400" />
                    <span>Suggested Prompts for Doctor</span>
                  </span>
                  <ul className="space-y-2">
                    {preVisit.suggested_questions.map((q, idx) => (
                      <li key={idx} className="text-xs text-slate-600 bg-primary-50/30 p-2 rounded-lg border border-primary-50">
                        {idx + 1}. {q}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Forms Consultation builder */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Notes Section */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
              <h3 className="font-semibold text-slate-800 border-b border-slate-100 pb-2 flex items-center space-x-2">
                <Heart className="h-4.5 w-4.5 text-primary-600" />
                <span>Consultation Notes & Checkup Report</span>
              </h3>
              
              <div>
                <label htmlFor="notes" className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Clinical Observations (Mandatory)</label>
                <textarea
                  id="notes"
                  required
                  rows={6}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Record your clinical observations, diagnosis, and care advice..."
                  className="w-full p-4 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm shadow-inner"
                />
              </div>

              <div>
                <label htmlFor="followUp" className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Follow-up Date (Optional)</label>
                <input
                  type="date"
                  id="followUp"
                  value={followUpDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setFollowUpDate(e.target.value)}
                  className="p-2 border border-slate-200 rounded-lg text-sm"
                />
              </div>
            </div>

            {/* Prescription Medications Section */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                <h3 className="font-semibold text-slate-800 flex items-center space-x-2">
                  <Stethoscope className="h-4.5 w-4.5 text-primary-600" />
                  <span>Prescription & Dosing Guidelines</span>
                </h3>
                <button
                  type="button"
                  onClick={handleAddMedication}
                  className="inline-flex items-center space-x-1 py-1.5 px-3 bg-primary-50 text-primary-700 hover:bg-primary-100 rounded-xl text-xs font-bold transition-all border border-primary-100"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add Medicine</span>
                </button>
              </div>

              {medications.length === 0 ? (
                <p className="text-xs text-slate-500 py-3 italic">No medications prescribed. Use the button to add a prescription.</p>
              ) : (
                <div className="space-y-4">
                  {medications.map((med, idx) => (
                    <div
                      key={idx}
                      className="border border-slate-100 rounded-xl p-4 bg-slate-50/30 grid grid-cols-1 sm:grid-cols-12 gap-3 items-end relative"
                    >
                      <div className="sm:col-span-3">
                        <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">Medicine Name</label>
                        <input
                          type="text"
                          required
                          value={med.medicine_name}
                          onChange={(e) => handleMedChange(idx, 'medicine_name', e.target.value)}
                          placeholder="e.g. Paracetamol"
                          className="w-full p-2 border border-slate-200 bg-white rounded-lg text-xs"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">Dosage</label>
                        <input
                          type="text"
                          required
                          value={med.dosage}
                          onChange={(e) => handleMedChange(idx, 'dosage', e.target.value)}
                          placeholder="e.g. 500mg"
                          className="w-full p-2 border border-slate-200 bg-white rounded-lg text-xs"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">Frequency</label>
                        <select
                          value={med.frequency}
                          onChange={(e) => handleMedChange(idx, 'frequency', e.target.value)}
                          className="w-full p-2 border border-slate-200 bg-white rounded-lg text-xs"
                        >
                          <option value="Once daily">Once daily</option>
                          <option value="Twice daily">Twice daily</option>
                          <option value="Three times daily">Three times daily</option>
                          <option value="Four times daily">Four times daily</option>
                          <option value="As needed">As needed</option>
                        </select>
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">Duration</label>
                        <input
                          type="text"
                          required
                          value={med.duration}
                          onChange={(e) => handleMedChange(idx, 'duration', e.target.value)}
                          placeholder="e.g. 5 days"
                          className="w-full p-2 border border-slate-200 bg-white rounded-lg text-xs"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">Instructions</label>
                        <input
                          type="text"
                          value={med.instructions}
                          onChange={(e) => handleMedChange(idx, 'instructions', e.target.value)}
                          placeholder="After meal"
                          className="w-full p-2 border border-slate-200 bg-white rounded-lg text-xs"
                        />
                      </div>
                      <div className="sm:col-span-1 text-center sm:text-right">
                        <button
                          type="button"
                          onClick={() => handleRemoveMedication(idx)}
                          className="p-2 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        >
                          <Trash2 className="h-4 w-4 mx-auto" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Actions Submit */}
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="w-full sm:w-auto py-3 px-8 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl shadow-md transition-all disabled:opacity-50"
              >
                {submitting ? 'Submitting Consult & Generating AI Advice...' : 'Submit Consultation Checkup'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DoctorConsult;
