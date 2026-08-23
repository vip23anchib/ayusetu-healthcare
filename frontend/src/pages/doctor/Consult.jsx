import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../../services/api';
import { Card, Button, Avatar } from '../../components/UI';
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

    const validMeds = medications.filter(m => m.medicine_name.trim() !== '');

    setSubmitting(true);
    setError('');

    try {
      await API.post(`appointments/${id}/consultation/`, {
        doctor_notes: notes,
        follow_up_date: followUpDate || null,
        medications: validMeds
      });
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
      default: return 'bg-slate-50 text-slate-500 border-slate-200';
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
        <Button onClick={() => navigate('/doctor/dashboard')} variant="primary" className="mt-4">
          Back to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header Back navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/doctor/dashboard')}
          className="inline-flex items-center space-x-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <ChevronLeft className="h-4.5 w-4.5" />
          <span>Exit Consultation Screen</span>
        </button>
        <span className="text-xs text-slate-400 font-mono">ID: #{appointment.id}</span>
      </div>

      <Card className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-[10px] font-bold text-primary-700 uppercase tracking-widest bg-primary-50 px-2 py-0.5 rounded-md border border-primary-100">
            AyuSetu Multispeciality Clinic
          </span>
          <h1 className="text-lg font-bold text-slate-800 mt-1">Patient Checkup: {appointment.patient.name}</h1>
          <p className="text-slate-500 text-xs mt-0.5">{appointment.patient.email}</p>
        </div>
        <div className="flex items-center space-x-2 text-xs text-slate-600 font-bold bg-slate-50 border border-slate-100 p-3 rounded-xl">
          <Calendar className="h-4 w-4 text-slate-400" />
          <span>{appointment.appointment_date}</span>
          <span className="text-slate-250">|</span>
          <Clock className="h-4 w-4 text-slate-400" />
          <span>{appointment.start_time.substring(0, 5)} - {appointment.end_time.substring(0, 5)}</span>
        </div>
      </Card>

      {error && (
        <div className="bg-rose-50 border-l-4 border-rose-500 p-4 rounded-xl text-xs font-bold text-rose-800">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Symptoms & Triage Panel */}
        <div className="lg:col-span-1 space-y-6">
          <Card title="Patient Reported Symptoms">
            <p className="text-xs text-slate-600 leading-relaxed italic bg-slate-50 border border-slate-100 p-3 rounded-xl">
              "{appointment.symptoms?.symptoms_text || 'No symptoms provided.'}"
            </p>
          </Card>

          {preVisit && (
            <Card title="AI Pre-Visit Triage">
              <div className="space-y-4">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-bold">Urgency Index:</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getUrgencyColor(preVisit.urgency)}`}>
                    {preVisit.urgency}
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Chief Complaint</span>
                  <p className="text-xs font-bold text-slate-700 leading-relaxed">{preVisit.chief_complaint}</p>
                </div>

                {preVisit.suggested_questions?.length > 0 && (
                  <div className="space-y-2 pt-3 border-t border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1">
                      <HelpCircle className="h-3 w-3 text-slate-400" />
                      <span>Suggested Diagnostics Questions</span>
                    </span>
                    <ul className="space-y-2">
                      {preVisit.suggested_questions.map((q, idx) => (
                        <li key={idx} className="text-xs text-slate-600 bg-primary-50/20 p-2.5 rounded-xl border border-primary-100">
                          {idx + 1}. {q}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>

        {/* Notes, prescription and guidelines builder */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Consultation Notes */}
            <Card title="Clinical Observations & Diagnostics">
              <div className="space-y-4">
                <div>
                  <label htmlFor="notes" className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Doctor Observations (Mandatory)</label>
                  <textarea
                    id="notes"
                    required
                    rows={6}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Describe checkup observations, symptoms diagnostic, and recommendations..."
                    className="w-full p-4 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-xs font-medium"
                  />
                </div>

                <div>
                  <label htmlFor="followUp" className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Follow-up Date (Optional)</label>
                  <input
                    type="date"
                    id="followUp"
                    value={followUpDate}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setFollowUpDate(e.target.value)}
                    className="p-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
            </Card>

            {/* Prescriptions */}
            <Card
              title="Prescription Sheet"
              action={
                <Button
                  onClick={handleAddMedication}
                  variant="outline"
                  className="flex items-center space-x-1"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add Medicine</span>
                </Button>
              }
            >
              {medications.length === 0 ? (
                <p className="text-xs text-slate-400 py-3 italic">No medications prescribed. Use the Add Medicine button to populate.</p>
              ) : (
                <div className="space-y-4">
                  {medications.map((med, idx) => (
                    <div
                      key={idx}
                      className="border border-slate-100 rounded-2xl p-4 bg-slate-50/20 grid grid-cols-1 sm:grid-cols-12 gap-3 items-end relative"
                    >
                      <div className="sm:col-span-3">
                        <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wide">Medicine Name</label>
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
                        <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wide">Dosage</label>
                        <input
                          type="text"
                          required
                          value={med.dosage}
                          onChange={(e) => handleMedChange(idx, 'dosage', e.target.value)}
                          placeholder="e.g. 650mg"
                          className="w-full p-2 border border-slate-200 bg-white rounded-lg text-xs"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wide">Frequency</label>
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
                        <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wide">Duration</label>
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
                        <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wide">Instructions</label>
                        <input
                          type="text"
                          value={med.instructions}
                          onChange={(e) => handleMedChange(idx, 'instructions', e.target.value)}
                          placeholder="After meal"
                          className="w-full p-2 border border-slate-200 bg-white rounded-lg text-xs"
                        />
                      </div>
                      <div className="sm:col-span-1 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveMedication(idx)}
                          className="p-2 text-rose-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all cursor-pointer"
                        >
                          <Trash2 className="h-4.5 w-4.5 mx-auto" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            <div className="flex justify-end pt-2">
              <Button
                type="submit"
                variant="primary"
                disabled={submitting}
                className="w-full sm:w-auto"
              >
                {submitting ? 'Submitting Consult & Generating AI Advice...' : 'Submit Consultation Checkup'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DoctorConsult;
