import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import API from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Card, Badge, Button, Avatar } from '../../components/UI';
import { Calendar, Clock, CalendarDays, CheckCircle, Trash2, ShieldAlert } from 'lucide-react';

const DoctorDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [doctorProfile, setDoctorProfile] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [calendarStatus, setCalendarStatus] = useState(searchParams.get('calendar'));
  const [leaveDate, setLeaveDate] = useState('');
  const [leaveReason, setLeaveReason] = useState('');
  const [submittingLeave, setSubmittingLeave] = useState(false);

  const loadDoctorProfileAndAppointments = async () => {
    setLoading(true);
    setError('');
    try {
      const docRes = await API.get('doctors/');
      const currentDoc = docRes.data.find(d => d.user.id === user?.id);
      
      if (currentDoc) {
        const detailRes = await API.get(`admin/doctors/${currentDoc.id}/`);
        setDoctorProfile(detailRes.data);
      }

      const apptRes = await API.get('appointments/');
      setAppointments(apptRes.data);
    } catch (err) {
      console.error("Failed to load doctor dashboard data", err);
      setError("Failed to load doctor dashboard details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDoctorProfileAndAppointments();
  }, [user]);

  const handleConnectCalendar = async () => {
    try {
      const response = await API.post('calendar/connect/');
      if (response.data?.authorization_url) {
        window.location.href = response.data.authorization_url;
      }
    } catch (err) {
      alert("Failed to connect Google Calendar.");
    }
  };

  const handleAddLeave = async (e) => {
    e.preventDefault();
    if (!doctorProfile || !leaveDate) return;
    setSubmittingLeave(true);
    setError('');
    try {
      await API.post(`admin/doctors/${doctorProfile.id}/leave/`, {
        leave_date: leaveDate,
        reason: leaveReason
      });
      setLeaveDate('');
      setLeaveReason('');
      await loadDoctorProfileAndAppointments();
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to submit leave. Date might conflict.");
    } finally {
      setSubmittingLeave(false);
    }
  };

  const handleDeleteLeave = async (dateStr) => {
    if (!window.confirm(`Cancel leave for ${dateStr}?`)) return;
    try {
      await API.delete(`admin/doctors/${doctorProfile.id}/leave/`, {
        data: { leave_date: dateStr }
      });
      await loadDoctorProfileAndAppointments();
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to cancel leave.");
    }
  };

  const getUrgencyBadge = (urgency) => {
    switch (urgency) {
      case 'LOW':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100 uppercase tracking-wide">Low</span>;
      case 'MEDIUM':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-100 uppercase tracking-wide">Medium</span>;
      case 'HIGH':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-100 uppercase tracking-wide animate-pulse">High</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-50 text-slate-400 border border-slate-200 uppercase tracking-wide">Unavailable</span>;
    }
  };

  // Stats computation
  const confirmedCount = appointments.filter(a => a.status === 'CONFIRMED').length;
  const completedCount = appointments.filter(a => a.status === 'COMPLETED').length;

  return (
    <div className="space-y-6">
      {/* Header Profile banner */}
      <div className="bg-gradient-to-br from-primary-800 via-primary-700 to-primary-600 rounded-3xl p-8 text-white shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <span className="text-primary-200 text-[10px] font-bold uppercase tracking-widest bg-primary-900/30 px-2.5 py-1 rounded-full border border-primary-500/20">
            AyuSetu Multispeciality Clinic
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight mt-2">Welcome, Dr. {user?.name}</h1>
          <p className="text-primary-100/90 text-sm mt-1">
            {doctorProfile ? `${doctorProfile.specialization} specialist` : 'Loading profile details...'}
          </p>
        </div>
        
        {/* Google Calendar Connection Card */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 p-5 rounded-2xl flex flex-col items-center text-center max-w-xs">
          <span className="text-xs font-bold text-primary-100">Google Calendar Sync</span>
          <Button
            onClick={handleConnectCalendar}
            variant="secondary"
            className="mt-3 flex items-center space-x-1.5"
          >
            <Calendar className="h-3.5 w-3.5" />
            <span>Connect Calendar</span>
          </Button>
        </div>
      </div>

      {calendarStatus === 'connected' && (
        <div className="bg-emerald-50 border-l-4 border-emerald-500 p-4 rounded-xl text-xs font-bold text-emerald-800 flex items-center space-x-2">
          <CheckCircle className="h-5 w-5 text-emerald-600" />
          <span>Google Calendar successfully synced!</span>
        </div>
      )}

      {error && (
        <div className="bg-rose-50 border-l-4 border-rose-500 p-4 rounded-xl text-xs font-bold text-rose-800">
          {error}
        </div>
      )}

      {/* Summary Statistics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center space-x-4">
          <div className="h-10 w-10 rounded-xl bg-primary-50 flex items-center justify-center text-primary-700">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase block tracking-wider font-semibold">Today's Confirmed</span>
            <span className="text-lg font-bold text-slate-800">{confirmedCount}</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center space-x-4">
          <div className="h-10 w-10 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600">
            <CheckCircle className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase block tracking-wider font-semibold">Completed Consults</span>
            <span className="text-lg font-bold text-slate-800">{completedCount}</span>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Appointments Schedule */}
          <div className="lg:col-span-2">
            <Card title="Patient Consultation Schedule" subtitle="Check raw symptoms and review triage analysis details before launching consultations.">
              {appointments.length === 0 ? (
                <p className="text-xs text-slate-400 py-8 text-center">No appointments scheduled.</p>
              ) : (
                <div className="space-y-4">
                  {appointments.map((appt) => (
                    <div
                      key={appt.id}
                      className="border border-slate-100 rounded-2xl p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-slate-50/30 transition-colors"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-slate-800 text-sm">{appt.patient.name}</span>
                          <span className="text-slate-300">|</span>
                          <span className="text-[10px] text-slate-400 font-bold">ID #{appt.id}</span>
                        </div>
                        <div className="flex items-center space-x-2.5 text-xs text-slate-500 font-medium">
                          <Calendar className="h-3.5 w-3.5 text-slate-400" />
                          <span>{appt.appointment_date}</span>
                          <Clock className="h-3.5 w-3.5 text-slate-400" />
                          <span>{appt.start_time.substring(0, 5)} - {appt.end_time.substring(0, 5)}</span>
                        </div>
                        
                        {/* Pre-Visit Symptoms details */}
                        {appt.symptoms && (
                          <div className="mt-3 text-xs bg-slate-50/50 p-3 rounded-xl border border-slate-100 max-w-lg font-medium text-slate-600">
                            <span className="font-bold text-slate-700 block mb-1">Chief Complaint:</span>
                            <p className="italic">"{appt.symptoms.symptoms_text}"</p>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center space-x-3 w-full sm:w-auto shrink-0 justify-between sm:justify-end border-t sm:border-t-0 border-slate-50 pt-3 sm:pt-0">
                        {appt.pre_visit_summary && (
                          <div className="flex flex-col items-end shrink-0">
                            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Triage</span>
                            {getUrgencyBadge(appt.pre_visit_summary.urgency)}
                          </div>
                        )}
                        
                        {appt.status === 'CONFIRMED' && (
                          <Button
                            onClick={() => navigate(`/doctor/appointments/${appt.id}/consult`)}
                            variant="primary"
                          >
                            Consult
                          </Button>
                        )}
                        {appt.status === 'COMPLETED' && (
                          <Badge status="COMPLETED" />
                        )}
                        {appt.status === 'CANCELLED' && (
                          <Badge status="CANCELLED" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          {/* Leave Management Sidebar */}
          <div className="space-y-6">
            {/* Add Leave */}
            <Card title="Mark Doctor Leave" subtitle="Select leave dates. Configured leaves cancel all pending bookings.">
              <form onSubmit={handleAddLeave} className="space-y-4">
                <div>
                  <label htmlFor="leaveDate" className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Leave Date</label>
                  <input
                    type="date"
                    id="leaveDate"
                    required
                    value={leaveDate}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setLeaveDate(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-primary-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="leaveReason" className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Reason / Description</label>
                  <input
                    type="text"
                    id="leaveReason"
                    value={leaveReason}
                    onChange={(e) => setLeaveReason(e.target.value)}
                    placeholder="e.g. Conference, Personal leave..."
                    className="w-full p-2.5 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-primary-500 focus:outline-none"
                  />
                </div>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={submittingLeave}
                  className="w-full"
                >
                  {submittingLeave ? 'Scheduling Leave...' : 'Submit Leave'}
                </Button>
              </form>
            </Card>

            {/* Current Leaves List */}
            {doctorProfile && doctorProfile.leaves?.length > 0 && (
              <Card title="Scheduled Leave Log" subtitle="History of booked leaves.">
                <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto">
                  {doctorProfile.leaves.map((leave) => (
                    <div key={leave.id} className="py-3 flex justify-between items-center text-xs">
                      <div>
                        <span className="font-bold text-slate-700">{leave.leave_date}</span>
                        {leave.reason && <p className="text-slate-400 mt-0.5 font-medium">{leave.reason}</p>}
                      </div>
                      <button
                        onClick={() => handleDeleteLeave(leave.leave_date)}
                        className="text-rose-500 hover:text-rose-600 hover:bg-rose-50 p-2 rounded-xl transition-all cursor-pointer"
                      >
                        <Trash2 className="h-4.5 w-4.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorDashboard;
