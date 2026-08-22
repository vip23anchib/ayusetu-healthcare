import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../../services/api';
import { Calendar, Clock, AlertCircle, ChevronLeft, Shield, Stethoscope, FileText, Pill } from 'lucide-react';

const PatientAppointmentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [appointment, setAppointment] = useState(null);
  const [preVisit, setPreVisit] = useState(null);
  const [consultation, setConsultation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      setError('');
      try {
        // Fetch appointment
        const apptRes = await API.get(`appointments/${id}/`);
        setAppointment(apptRes.data);

        // Fetch pre-visit summary
        try {
          const pvRes = await API.get(`appointments/${id}/pre-visit-summary/`);
          setPreVisit(pvRes.data);
        } catch (e) {
          console.log("No pre-visit summary found or pending", e);
        }

        // Fetch consultation details if completed
        if (apptRes.data.status === 'COMPLETED') {
          try {
            const cRes = await API.get(`appointments/${id}/consultation/`);
            setConsultation(cRes.data);
          } catch (e) {
            console.log("No consultation notes found", e);
          }
        }
      } catch (err) {
        console.error("Failed to load details", err);
        setError("Failed to load appointment details.");
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

  const getUrgencyBadge = (urgency) => {
    switch (urgency) {
      case 'LOW':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-100 uppercase">Low</span>;
      case 'MEDIUM':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-100 uppercase">Medium</span>;
      case 'HIGH':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-100 uppercase animate-pulse">High</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-500 border border-slate-200 uppercase">Unavailable</span>;
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
        <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-4" />
        <p className="text-slate-700 font-semibold">{error || "Appointment not found."}</p>
        <button onClick={() => navigate('/patient/appointments')} className="mt-4 text-sm text-primary-600 font-bold hover:text-primary-700">
          Back to Appointments list
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Profile */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/patient/appointments')}
          className="inline-flex items-center space-x-1.5 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ChevronLeft className="h-4.5 w-4.5" />
          <span>Back to List</span>
        </button>
        <span className="text-xs text-slate-500 font-mono">Appt ID: #{appointment.id}</span>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-xs font-bold text-primary-600 uppercase tracking-wider">Consultation Details</span>
          <h1 className="text-xl font-bold text-slate-800 mt-1">Dr. {appointment.doctor.user.name}</h1>
          <p className="text-slate-500 text-xs mt-0.5">{appointment.doctor.specialization}</p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-slate-700">
          <Calendar className="h-4 w-4 text-slate-400" />
          <span className="font-semibold">{appointment.appointment_date}</span>
          <span className="text-slate-300">|</span>
          <Clock className="h-4 w-4 text-slate-400" />
          <span className="font-semibold">{appointment.start_time.substring(0, 5)} - {appointment.end_time.substring(0, 5)}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Side: Symptoms & AI Pre-visit Urgency */}
        <div className="space-y-6 md:col-span-1">
          {/* Patient Symptoms */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-3">
            <h3 className="font-semibold text-slate-800 flex items-center space-x-2 border-b border-slate-100 pb-2">
              <Stethoscope className="h-4.5 w-4.5 text-primary-600" />
              <span>Reported Symptoms</span>
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed italic bg-slate-50/50 p-3 rounded-xl border border-slate-100">
              "{appointment.symptoms?.symptoms_text || 'No symptoms provided.'}"
            </p>
          </div>

          {/* AI Pre-visit summary */}
          {preVisit && (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
              <h3 className="font-semibold text-slate-800 flex items-center space-x-2 border-b border-slate-100 pb-2">
                <Shield className="h-4.5 w-4.5 text-primary-600" />
                <span>AI Triage Analysis</span>
              </h3>
              
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-600">Urgency Level:</span>
                {getUrgencyBadge(preVisit.urgency)}
              </div>

              <div className="space-y-1">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Chief Complaint:</span>
                <p className="text-sm text-slate-700 font-medium">{preVisit.chief_complaint}</p>
              </div>

              <div className="bg-blue-50/30 border border-blue-100 p-3 rounded-lg text-slate-500 text-[10px] leading-relaxed">
                Notice: AI assessments are informational triage filters. They do not represent doctor diagnoses or replacements.
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Consultation notes, prescriptions, and Follow up summary */}
        <div className="space-y-6 md:col-span-2">
          {appointment.status === 'COMPLETED' && consultation ? (
            <>
              {/* Doctor Consultation Notes */}
              <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-3">
                <h3 className="font-semibold text-slate-800 flex items-center space-x-2 border-b border-slate-100 pb-2">
                  <FileText className="h-4.5 w-4.5 text-primary-600" />
                  <span>Clinical Consultation Notes</span>
                </h3>
                <p className="text-sm text-slate-700 whitespace-pre-line leading-relaxed">{consultation.doctor_notes}</p>
                {consultation.follow_up_date && (
                  <div className="inline-flex items-center space-x-2 bg-primary-50 text-primary-800 px-3 py-1.5 rounded-lg text-xs font-bold mt-2">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>Follow-up Recommended: {consultation.follow_up_date}</span>
                  </div>
                )}
              </div>

              {/* Prescription Medications */}
              {consultation.prescription?.medications?.length > 0 && (
                <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
                  <h3 className="font-semibold text-slate-800 flex items-center space-x-2 border-b border-slate-100 pb-2">
                    <Pill className="h-4.5 w-4.5 text-primary-600" />
                    <span>Prescribed Medications</span>
                  </h3>
                  
                  <div className="overflow-hidden border border-slate-100 rounded-xl">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider">
                          <th className="px-4 py-3">Medicine</th>
                          <th className="px-4 py-3">Dosage</th>
                          <th className="px-4 py-3">Frequency</th>
                          <th className="px-4 py-3">Duration</th>
                          <th className="px-4 py-3">Instructions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700">
                        {consultation.prescription.medications.map((med, idx) => (
                          <tr key={idx}>
                            <td className="px-4 py-3 font-semibold text-slate-800">{med.medicine_name}</td>
                            <td className="px-4 py-3">{med.dosage}</td>
                            <td className="px-4 py-3">{med.frequency}</td>
                            <td className="px-4 py-3">{med.duration}</td>
                            <td className="px-4 py-3 text-slate-500 italic">{med.instructions || 'None'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Patient Friendly summary */}
              {consultation.post_visit_summary && (
                <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-3">
                  <h3 className="font-semibold text-slate-800 flex items-center space-x-2 border-b border-slate-100 pb-2">
                    <Shield className="h-4.5 w-4.5 text-primary-600" />
                    <span>Patient-Friendly Advice Summary</span>
                  </h3>
                  <div className="text-sm text-slate-700 whitespace-pre-line leading-relaxed bg-primary-50/20 border border-primary-100 p-4 rounded-xl">
                    {consultation.post_visit_summary.summary}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-8 shadow-sm text-center py-12">
              <FileText className="h-10 w-10 text-slate-300 mx-auto mb-3" />
              <h4 className="font-semibold text-slate-600">No consultation details yet</h4>
              <p className="text-slate-400 text-sm mt-1">This appointment is scheduled, but the checkup hasn't occurred yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientAppointmentDetail;
