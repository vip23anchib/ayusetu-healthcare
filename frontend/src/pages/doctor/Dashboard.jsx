import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import API from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Calendar, Clock, CalendarDays, AlertTriangle, ShieldAlert, CheckCircle, Plus, Trash2 } from 'lucide-react';

const DoctorDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [doctorProfile, setDoctorProfile] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Calendar connect alert state
  const [calendarStatus, setCalendarStatus] = useState(searchParams.get('calendar'));

  // Leave Form state
  const [leaveDate, setLeaveDate] = useState('');
  const [leaveReason, setLeaveReason] = useState('');
  const [submittingLeave, setSubmittingLeave] = useState(false);

  const loadDoctorProfileAndAppointments = async () => {
    setLoading(true);
    setError('');
    try {
      // 1. Fetch public doctors list to find doctor matching user ID
      const docRes = await API.get('doctors/');
      const currentDoc = docRes.data.find(d => d.user.id === user?.id);
      
      if (currentDoc) {
        // Fetch detailed profile (including leaves/hours)
        const detailRes = await API.get(`admin/doctors/${currentDoc.id}/`);
        setDoctorProfile(detailRes.data);
      }

      // 2. Fetch appointments (automatically filtered by backend role for doctors)
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
      // Reload profile
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
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">Low</span>;
      case 'MEDIUM':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-100">Medium</span>;
      case 'HIGH':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-100 animate-pulse">High</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-500">Unavailable</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Profile */}
      <div className="bg-gradient-to-r from-primary-800 to-primary-600 rounded-3xl p-8 text-white shadow-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <span className="text-primary-200 text-sm font-semibold uppercase tracking-wider">Doctor Portal</span>
          <h1 className="text-3xl font-extrabold mt-1">Welcome, Dr. {user?.name}</h1>
          <p className="text-primary-100/90 text-sm mt-1">
            {doctorProfile ? `${doctorProfile.specialization} specialist` : 'Loading profile...'}
          </p>
        </div>
        
        {/* Calendar Connection Action */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl flex flex-col items-center text-center">
          <span className="text-xs font-semibold text-primary-100">Google Calendar Sync</span>
          <button
            onClick={handleConnectCalendar}
            className="mt-3 inline-flex items-center space-x-2 bg-white text-primary-700 hover:bg-primary-50 py-2 px-4 rounded-xl text-xs font-bold transition-all shadow-md"
          >
            <Calendar className="h-4 w-4 text-primary-600" />
            <span>Connect Calendar</span>
          </button>
        </div>
      </div>

      {calendarStatus === 'connected' && (
        <div className="bg-emerald-50 border-l-4 border-emerald-500 p-4 rounded-xl text-sm text-emerald-800 flex items-center space-x-2">
          <CheckCircle className="h-5 w-5 text-emerald-600" />
          <span>Google Calendar connected and sync active!</span>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-xl text-sm text-red-800">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Appointments Schedule */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6">
              <h2 className="text-lg font-bold text-slate-800 mb-4">Patient Consultation Schedule</h2>
              
              {appointments.length === 0 ? (
                <p className="text-sm text-slate-500 py-6 text-center">No bookings found in your schedule.</p>
              ) : (
                <div className="space-y-4">
                  {appointments.map((appt) => (
                    <div
                      key={appt.id}
                      className="border border-slate-100 rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-slate-50/50 transition-colors"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-slate-800">{appt.patient.name}</span>
                          <span className="text-slate-300">|</span>
                          <span className="text-xs text-slate-500 font-medium">ID #{appt.id}</span>
                        </div>
                        <div className="flex items-center space-x-2.5 text-xs text-slate-500">
                          <Calendar className="h-3.5 w-3.5 text-slate-400" />
                          <span>{appt.appointment_date}</span>
                          <Clock className="h-3.5 w-3.5 text-slate-400" />
                          <span>{appt.start_time.substring(0, 5)} - {appt.end_time.substring(0, 5)}</span>
                        </div>
                        
                        {/* Pre-Visit Symptoms details */}
                        {appt.symptoms && (
                          <div className="mt-2 text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-100 max-w-lg">
                            <span className="font-semibold text-slate-700 block mb-0.5">Symptoms:</span>
                            <p className="text-slate-600 line-clamp-2">"{appt.symptoms.symptoms_text}"</p>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center space-x-3 w-full sm:w-auto shrink-0 justify-between sm:justify-end">
                        {appt.pre_visit_summary && (
                          <div className="flex flex-col items-end">
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">AI Urgency</span>
                            {getUrgencyBadge(appt.pre_visit_summary.urgency)}
                          </div>
                        )}
                        
                        {appt.status === 'CONFIRMED' && (
                          <button
                            onClick={() => navigate(`/doctor/appointments/${appt.id}/consult`)}
                            className="bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold py-2 px-4 rounded-xl transition-all shadow-sm"
                          >
                            Consult Patient
                          </button>
                        )}
                        {appt.status === 'COMPLETED' && (
                          <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">
                            Completed
                          </span>
                        )}
                        {appt.status === 'CANCELLED' && (
                          <span className="text-xs font-semibold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-100">
                            Cancelled
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Leave Management Sidebar */}
          <div className="space-y-6">
            {/* Add Leave */}
            <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6">
              <h3 className="font-bold text-slate-800 flex items-center space-x-2 mb-4">
                <CalendarDays className="h-5 w-5 text-primary-600" />
                <span>Mark Doctor Leave</span>
              </h3>
              
              <form onSubmit={handleAddLeave} className="space-y-3">
                <div>
                  <label htmlFor="leaveDate" className="block text-xs font-bold text-slate-600 mb-1">LEAVE DATE</label>
                  <input
                    type="date"
                    id="leaveDate"
                    required
                    value={leaveDate}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setLeaveDate(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="leaveReason" className="block text-xs font-bold text-slate-600 mb-1">REASON / NOTE</label>
                  <input
                    type="text"
                    id="leaveReason"
                    value={leaveReason}
                    onChange={(e) => setLeaveReason(e.target.value)}
                    placeholder="e.g. Conference, Personal leave..."
                    className="w-full p-2 border border-slate-200 rounded-lg text-sm"
                  />
                </div>
                <button
                  type="submit"
                  disabled={submittingLeave}
                  className="w-full bg-primary-600 hover:bg-primary-700 text-white py-2 rounded-xl text-sm font-semibold transition-all disabled:opacity-50"
                >
                  {submittingLeave ? 'Scheduling Leave...' : 'Submit Leave'}
                </button>
              </form>
            </div>

            {/* Current Leaves List */}
            {doctorProfile && doctorProfile.leaves?.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6">
                <h3 className="font-bold text-slate-800 mb-3 text-sm">Scheduled Leaves</h3>
                <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto">
                  {doctorProfile.leaves.map((leave) => (
                    <div key={leave.id} className="py-2.5 flex justify-between items-center text-xs">
                      <div>
                        <span className="font-bold text-slate-700">{leave.leave_date}</span>
                        {leave.reason && <p className="text-slate-500 mt-0.5">{leave.reason}</p>}
                      </div>
                      <button
                        onClick={() => handleDeleteLeave(leave.leave_date)}
                        className="text-red-500 hover:text-red-600 hover:bg-red-50 p-1.5 rounded-lg transition-all"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorDashboard;
