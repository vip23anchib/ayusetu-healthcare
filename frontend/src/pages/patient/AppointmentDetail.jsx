import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../../services/api';
import { Card, Badge, Button, Avatar } from '../../components/UI';
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
        const apptRes = await API.get(`appointments/${id}/`);
        setAppointment(apptRes.data);

        try {
          const pvRes = await API.get(`appointments/${id}/pre-visit-summary/`);
          setPreVisit(pvRes.data);
        } catch (e) {
          console.log("No pre-visit summary found or pending", e);
        }

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
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100 uppercase tracking-wider">Low</span>;
      case 'MEDIUM':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-100 uppercase tracking-wider">Medium</span>;
      case 'HIGH':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-100 uppercase tracking-wider animate-pulse">High</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-50 text-slate-400 border border-slate-200 uppercase tracking-wider">Unavailable</span>;
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
        <Button onClick={() => navigate('/patient/appointments')} variant="primary" className="mt-4">
          Back to List
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header back link */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/patient/appointments')}
          className="inline-flex items-center space-x-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <ChevronLeft className="h-4.5 w-4.5" />
          <span>Back to Appointments</span>
        </button>
        <span className="text-xs text-slate-400 font-mono">ID: #{appointment.id}</span>
      </div>

      <Card className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center space-x-3.5">
          <Avatar name={appointment.doctor.user.name} specialization={appointment.doctor.specialization} />
          <div>
            <span className="text-[10px] font-bold text-primary-700 uppercase tracking-widest bg-primary-50 px-2 py-0.5 rounded-md border border-primary-100">
              AyuSetu Multispeciality Clinic
            </span>
            <h1 className="text-lg font-bold text-slate-800 mt-1">Dr. {appointment.doctor.user.name}</h1>
            <p className="text-slate-500 text-xs mt-0.5">{appointment.doctor.specialization}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2 text-xs text-slate-600 font-bold bg-slate-50 border border-slate-100 p-3 rounded-xl">
          <Calendar className="h-4 w-4 text-slate-400" />
          <span>{appointment.appointment_date}</span>
          <span className="text-slate-300">|</span>
          <Clock className="h-4 w-4 text-slate-400" />
          <span>{appointment.start_time.substring(0, 5)} - {appointment.end_time.substring(0, 5)}</span>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Symptoms & Triage Card */}
        <div className="space-y-6 md:col-span-1">
          <Card title="Patient Raw Symptoms">
            <p className="text-xs text-slate-600 leading-relaxed italic bg-slate-50 border border-slate-100 p-3 rounded-xl">
              "{appointment.symptoms?.symptoms_text || 'No symptoms provided.'}"
            </p>
          </Card>

          {preVisit && (
            <Card title="AI Triage Assessment">
              <div className="space-y-4">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-bold">Urgency Index:</span>
                  {getUrgencyBadge(preVisit.urgency)}
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Chief Complaint</span>
                  <p className="text-xs text-slate-700 font-bold leading-relaxed">{preVisit.chief_complaint}</p>
                </div>

                <div className="bg-primary-50/30 border border-primary-100 p-3 rounded-xl text-slate-500 text-[10px] leading-relaxed">
                  Notice: AI analysis is for physician triage review and does not substitute professional medical diagnosis.
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Notes, prescription and advice summaries */}
        <div className="space-y-6 md:col-span-2">
          {appointment.status === 'COMPLETED' && consultation ? (
            <>
              {/* Doctor Consultation Notes */}
              <Card title="Consultation Diagnostics">
                <p className="text-xs text-slate-700 whitespace-pre-line leading-relaxed font-medium">
                  {consultation.doctor_notes}
                </p>
                {consultation.follow_up_date && (
                  <div className="inline-flex items-center space-x-2 bg-primary-50 text-primary-800 px-3 py-1.5 rounded-xl text-[10px] font-bold mt-4 border border-primary-100">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>Follow-up Scheduled: {consultation.follow_up_date}</span>
                  </div>
                )}
              </Card>

              {/* Prescription Details */}
              {consultation.prescription?.medications?.length > 0 && (
                <Card title="Clinical Prescriptions">
                  <div className="overflow-hidden border border-slate-100 rounded-xl">
                    <table className="w-full text-left border-collapse text-[11px]">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider">
                          <th className="px-4 py-3">Medicine</th>
                          <th className="px-4 py-3">Dosage</th>
                          <th className="px-4 py-3">Frequency</th>
                          <th className="px-4 py-3">Duration</th>
                          <th className="px-4 py-3">Instructions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                        {consultation.prescription.medications.map((med, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/30">
                            <td className="px-4 py-3 font-bold text-slate-800">{med.medicine_name}</td>
                            <td className="px-4 py-3">{med.dosage}</td>
                            <td className="px-4 py-3">{med.frequency}</td>
                            <td className="px-4 py-3">{med.duration}</td>
                            <td className="px-4 py-3 text-slate-400 italic">{med.instructions || 'None'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              )}

              {/* AI Follow-up advice */}
              {consultation.post_visit_summary && (
                <Card title="Patient-Friendly Instructions">
                  <div className="text-xs text-slate-700 whitespace-pre-line leading-relaxed bg-teal-50/10 border border-teal-100 p-4 rounded-2xl font-medium">
                    {consultation.post_visit_summary.summary}
                  </div>
                </Card>
              )}
            </>
          ) : (
            <Card className="flex flex-col items-center justify-center text-center py-12 min-h-[300px]">
              <FileText className="h-10 w-10 text-slate-300 mb-3" />
              <h4 className="font-bold text-slate-700 text-sm">Consultation History Pending</h4>
              <p className="text-slate-400 text-xs mt-1 max-w-xs">This visit is confirmed. Notes, prescriptions, and summaries will appear here after the consult is finalized.</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientAppointmentDetail;
