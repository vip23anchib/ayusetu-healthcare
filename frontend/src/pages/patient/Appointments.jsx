import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import API from '../../services/api';
import { Card, Badge, Button, EmptyState, Avatar } from '../../components/UI';
import { Calendar, Clock, RefreshCw, XCircle, ChevronRight, X } from 'lucide-react';

const PatientAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const location = useLocation();
  const navigate = useNavigate();

  // Reschedule Modal state
  const [reschedulingAppt, setReschedulingAppt] = useState(null);
  const [newDate, setNewDate] = useState('');
  const [newSlot, setNewSlot] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const response = await API.get('appointments/');
      const sorted = response.data.sort((a, b) => {
        if (a.status === 'CONFIRMED' && b.status !== 'CONFIRMED') return -1;
        if (a.status !== 'CONFIRMED' && b.status === 'CONFIRMED') return 1;
        return new Date(b.appointment_date) - new Date(a.appointment_date);
      });
      setAppointments(sorted);
    } catch (err) {
      console.error("Failed to load appointments", err);
      setError("Failed to load appointments list.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
    if (location.state?.successMessage) {
      setSuccessMsg(location.state.successMessage);
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const handleCancel = async (id) => {
    if (!window.confirm("Cancel this appointment? This cannot be undone.")) return;
    try {
      await API.post(`appointments/${id}/cancel/`);
      setSuccessMsg("Appointment cancelled successfully.");
      fetchAppointments();
    } catch (err) {
      setError(err.response?.data?.detail || "Cancellation failed.");
    }
  };

  // Load available slots for reschedule
  useEffect(() => {
    if (!reschedulingAppt || !newDate) return;
    const fetchRescheduleSlots = async () => {
      setLoadingSlots(true);
      try {
        const response = await API.get(`doctors/${reschedulingAppt.doctor.id}/slots/?date=${newDate}`);
        setAvailableSlots(response.data.filter(s => s.available));
      } catch (err) {
        console.error("Failed to fetch slots for reschedule", err);
      } finally {
        setLoadingSlots(false);
      }
    };
    fetchRescheduleSlots();
  }, [newDate, reschedulingAppt]);

  const handleRescheduleSubmit = async (e) => {
    e.preventDefault();
    if (!newDate || !newSlot) {
      alert("Please select both date and time slot.");
      return;
    }
    try {
      await API.patch(`appointments/${reschedulingAppt.id}/reschedule/`, {
        appointment_date: newDate,
        start_time: newSlot
      });
      setSuccessMsg("Appointment rescheduled successfully.");
      setReschedulingAppt(null);
      setNewDate('');
      setNewSlot('');
      fetchAppointments();
    } catch (err) {
      alert(err.response?.data?.detail || "Rescheduling failed. Slot might have been booked.");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">My Appointments</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 font-medium">Review upcoming consultations, prescriptions, and digital checkup advice.</p>
      </div>

      {successMsg && (
        <div className="bg-emerald-50 dark:bg-emerald-950/80 border-l-4 border-emerald-500 p-4 rounded-xl text-xs font-bold text-emerald-800 dark:text-emerald-200">
          {successMsg}
        </div>
      )}

      {error && (
        <div className="bg-rose-50 dark:bg-rose-950/80 border-l-4 border-rose-500 p-4 rounded-xl text-xs font-bold text-rose-800 dark:text-rose-200">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      ) : appointments.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="No Appointments Found"
          message="You haven't scheduled any consultation slots yet at AyuSetu Multispeciality Clinic."
          actionText="Find Specialist"
          onAction={() => navigate('/patient/doctors')}
        />
      ) : (
        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs theme-table">
              <thead>
                <tr className="border-b font-bold uppercase tracking-wider">
                  <th className="px-6 py-4">Specialist Doctor</th>
                  <th className="px-6 py-4">Department</th>
                  <th className="px-6 py-4">Scheduled Date & Time</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 font-medium">
                {appointments.map((appt) => (
                  <tr key={appt.id} className="transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <Avatar name={appt.doctor.user.name} specialization={appt.doctor.specialization} />
                        <span className="font-bold text-slate-900 dark:text-slate-100">Dr. {appt.doctor.user.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-bold uppercase text-[9px] tracking-wider">
                        {appt.doctor.specialization}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-1.5 font-bold text-slate-800 dark:text-slate-200">
                        <Calendar className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
                        <span>{appt.appointment_date}</span>
                      </div>
                      <div className="flex items-center space-x-1.5 text-slate-500 dark:text-slate-400 mt-1">
                        <Clock className="h-3.5 w-3.5" />
                        <span>{appt.start_time.substring(0, 5)} - {appt.end_time.substring(0, 5)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge status={appt.status} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        {appt.status === 'CONFIRMED' && (
                          <>
                            <button
                              onClick={() => setReschedulingAppt(appt)}
                              className="inline-flex items-center space-x-1 py-2 px-3 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-[10px] font-bold transition-all cursor-pointer shadow-sm"
                            >
                              <RefreshCw className="h-3 w-3 text-slate-400" />
                              <span>Reschedule</span>
                            </button>
                            <button
                              onClick={() => handleCancel(appt.id)}
                              className="inline-flex items-center space-x-1 py-2 px-3 border border-rose-200 dark:border-rose-800 bg-white dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 rounded-xl text-[10px] font-bold transition-all cursor-pointer shadow-sm"
                            >
                              <XCircle className="h-3 w-3" />
                              <span>Cancel</span>
                            </button>
                          </>
                        )}
                        {(appt.status === 'CONFIRMED' || appt.status === 'COMPLETED') && (
                          <button
                            onClick={() => navigate(`/patient/appointments/${appt.id}`)}
                            className="inline-flex items-center space-x-1 py-2 px-3 bg-primary-50 dark:bg-primary-950/80 hover:bg-primary-100 dark:hover:bg-primary-900 text-primary-700 dark:text-primary-300 rounded-xl text-[10px] font-bold transition-all cursor-pointer border border-primary-100 dark:border-primary-800 shadow-sm"
                          >
                            <span>View details</span>
                            <ChevronRight className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Reschedule Modal Popover */}
      {reschedulingAppt && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 w-full max-w-md shadow-xl space-y-4 relative text-slate-900 dark:text-slate-100">
            <button 
              onClick={() => { setReschedulingAppt(null); setNewDate(''); setNewSlot(''); }}
              className="absolute right-4 top-4 p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
            >
              <X className="h-4.5 w-4.5" />
            </button>
            <h3 className="text-lg font-bold tracking-tight">Reschedule Consultation</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Rescheduling appointment with Dr. {reschedulingAppt.doctor.user.name}</p>
            
            <form onSubmit={handleRescheduleSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Choose New Date</label>
                <input
                  type="date"
                  value={newDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => { setNewDate(e.target.value); setNewSlot(''); }}
                  className="w-full p-2.5 theme-input border rounded-xl text-xs font-semibold focus:ring-2 focus:ring-primary-500 focus:outline-none"
                />
              </div>

              {newDate && (
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Available Shift Slots</label>
                  {loadingSlots ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-primary-600 mx-auto py-2"></div>
                  ) : availableSlots.length === 0 ? (
                    <p className="text-xs text-slate-400 py-2">No available slots found for selected date.</p>
                  ) : (
                    <div className="grid grid-cols-3 gap-2">
                      {availableSlots.map((s, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setNewSlot(s.start_time)}
                          className={`py-2 px-2 text-xs font-bold rounded-xl border text-center transition-all cursor-pointer ${
                            newSlot === s.start_time
                              ? 'bg-primary-600 text-white border-transparent shadow-sm'
                              : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                          }`}
                        >
                          {s.start_time.substring(0, 5)}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100 dark:border-slate-700">
                <Button
                  variant="secondary"
                  onClick={() => { setReschedulingAppt(null); setNewDate(''); setNewSlot(''); }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={!newDate || !newSlot}
                >
                  Reschedule
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientAppointments;
