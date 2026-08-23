import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../../services/api';
import { Card, Button, Avatar } from '../../components/UI';
import { Calendar, Clock, AlertTriangle, Plus, Trash2, ChevronLeft, HelpCircle } from 'lucide-react';

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
      setError("Doctor notes are required.");
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      // 1. Submit consultation notes
      await API.post(`appointments/${id}/consultation/`, {
        doctor_notes: notes,
        follow_up_date: followUpDate || null
      });

      // 2. Submit medications if any were entered
      const validMeds = medications.filter(m => m.medicine_name.trim() !== '');
      if (validMeds.length > 0) {
        await API.post(`appointments/${id}/prescription/`, {
          medications: validMeds
        });
      }

      // 3. Complete appointment status
      await API.post(`appointments/${id}/complete/`);

      navigate('/doctor/dashboard');
    } catch (err) {
      console.error("Failed to finalize consultation", err);
      setError(err.response?.data?.detail || "Failed to submit consultation records.");
      setSubmitting(false);
    }
  };

  const getUrgencyBadge = (urgency) => {
    switch (urgency) {
      case 'LOW':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700 uppercase tracking-wide">Low</span>;
      case 'MEDIUM':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-700 uppercase tracking-wide">Medium</span>;
      case 'HIGH':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-700 uppercase tracking-wide animate-pulse">High</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 uppercase tracking-wide">Unavailable</span>;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error && !appointment) {
    return (
      <div className="max-w-2xl mx-auto bg-white dark:bg-slate-800 p-8 rounded-2xl border border-slate-200 dark:border-slate-700 text-center shadow-sm">
        <AlertTriangle className="h-10 w-10 text-rose-500 mx-auto mb-4" />
        <p className="text-slate-800 dark:text-slate-200 font-semibold">{error}</p>
        <Button onClick={() => navigate('/doctor/dashboard')} variant="primary" className="mt-4">
          Back to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header back bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/doctor/dashboard')}
          className="inline-flex items-center space-x-1.5 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors cursor-pointer"
        >
          <ChevronLeft className="h-4.5 w-4.5" />
          <span>Back to Dashboard</span>
        </button>
        <span className="text-xs text-slate-400 dark:text-slate-500 font-mono font-semibold">Appointment #{appointment?.id}</span>
      </div>

      {error && (
        <div className="bg-rose-50 dark:bg-rose-950/80 border-l-4 border-rose-500 p-4 rounded-xl text-xs font-bold text-rose-800 dark:text-rose-200">
          {error}
        </div>
      )}

      {/* Patient Profile Card */}
      {appointment && (
        <Card className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center space-x-3.5">
            <Avatar name={appointment.patient.name} />
            <div>
              <span className="text-[10px] font-bold text-primary-700 dark:text-primary-300 uppercase tracking-widest bg-primary-50 dark:bg-primary-950 px-2 py-0.5 rounded-md border border-primary-100 dark:border-primary-800">
                Active Consultation
              </span>
              <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-1">{appointment.patient.name}</h1>
              <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">{appointment.patient.email}</p>
            </div>
          </div>

          <div className="flex items-center space-x-2 text-xs text-slate-700 dark:text-slate-300 font-bold bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-3 rounded-xl">
            <Calendar className="h-4 w-4 text-slate-400 dark:text-slate-500" />
            <span>{appointment.appointment_date}</span>
            <span className="text-slate-300 dark:text-slate-600">|</span>
            <Clock className="h-4 w-4 text-slate-400 dark:text-slate-500" />
            <span>{appointment.start_time.substring(0, 5)} - {appointment.end_time.substring(0, 5)}</span>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pre-Visit AI Triage Insights Sidebar */}
        <div className="space-y-6 lg:col-span-1">
          <Card title="Raw Patient Symptoms">
            <p className="text-xs text-slate-700 dark:text-slate-300 italic bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-3 rounded-xl font-medium leading-relaxed">
              "{appointment?.symptoms?.symptoms_text || 'No symptoms submitted.'}"
            </p>
          </Card>

          {preVisit && (
            <Card title="AI Pre-Visit Triage">
              <div className="space-y-4">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 dark:text-slate-400 font-bold">Urgency Index:</span>
                  {getUrgencyBadge(preVisit.urgency)}
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Chief Complaint</span>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-relaxed">{preVisit.chief_complaint}</p>
                </div>

                {preVisit.suggested_questions?.length > 0 && (
                  <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-700">
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center space-x-1">
                      <HelpCircle className="h-3 w-3 text-slate-400" />
                      <span>Suggested Diagnostics Questions</span>
                    </span>
                    <ul className="space-y-2">
                      {preVisit.suggested_questions.map((q, idx) => (
                        <li key={idx} className="text-xs text-slate-700 dark:text-slate-300 bg-primary-50/40 dark:bg-primary-950/40 p-2.5 rounded-xl border border-primary-100 dark:border-primary-800/60 font-medium">
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
                  <label htmlFor="notes" className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Doctor Observations (Mandatory)</label>
                  <textarea
                    id="notes"
                    required
                    rows={6}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Describe checkup observations, symptoms diagnostic, and recommendations..."
                    className="w-full p-4 theme-input border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-xs font-medium"
                  />
                </div>

                <div>
                  <label htmlFor="followUp" className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Follow-up Date (Optional)</label>
                  <input
                    type="date"
                    id="followUp"
                    value={followUpDate}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setFollowUpDate(e.target.value)}
                    className="p-2.5 theme-input border rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary-500"
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
                      className="border border-slate-200 dark:border-slate-700 rounded-2xl p-4 bg-slate-50/50 dark:bg-slate-900/50 grid grid-cols-1 sm:grid-cols-12 gap-3 items-end relative"
                    >
                      <div className="sm:col-span-3">
                        <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wide">Medicine Name</label>
                        <input
                          type="text"
                          required
                          value={med.medicine_name}
                          onChange={(e) => handleMedChange(idx, 'medicine_name', e.target.value)}
                          placeholder="e.g. Paracetamol"
                          className="w-full p-2 theme-input border rounded-lg text-xs font-medium"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wide">Dosage</label>
                        <input
                          type="text"
                          required
                          value={med.dosage}
                          onChange={(e) => handleMedChange(idx, 'dosage', e.target.value)}
                          placeholder="e.g. 650mg"
                          className="w-full p-2 theme-input border rounded-lg text-xs font-medium"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wide">Frequency</label>
                        <select
                          value={med.frequency}
                          onChange={(e) => handleMedChange(idx, 'frequency', e.target.value)}
                          className="w-full p-2 theme-input border rounded-lg text-xs font-medium"
                        >
                          <option value="Once daily">Once daily</option>
                          <option value="Twice daily">Twice daily</option>
                          <option value="Thrice daily">Thrice daily</option>
                          <option value="As needed">As needed</option>
                        </select>
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wide">Duration</label>
                        <input
                          type="text"
                          value={med.duration}
                          onChange={(e) => handleMedChange(idx, 'duration', e.target.value)}
                          placeholder="e.g. 5 days"
                          className="w-full p-2 theme-input border rounded-lg text-xs font-medium"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wide">Instructions</label>
                        <input
                          type="text"
                          value={med.instructions}
                          onChange={(e) => handleMedChange(idx, 'instructions', e.target.value)}
                          placeholder="After meals"
                          className="w-full p-2 theme-input border rounded-lg text-xs font-medium"
                        />
                      </div>
                      <div className="sm:col-span-1 flex justify-end">
                        <button
                          type="button"
                          onClick={() => handleRemoveMedication(idx)}
                          className="p-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                          title="Remove Medicine"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            <div className="flex justify-end space-x-3">
              <Button
                variant="secondary"
                onClick={() => navigate('/doctor/dashboard')}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={submitting}
                className="px-6"
              >
                {submitting ? 'Finalizing Consultation...' : 'Complete Consultation'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DoctorConsult;
