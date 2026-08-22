import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import API from '../../services/api';
import { Calendar, Clock, AlertCircle, RefreshCw, XCircle, ChevronRight } from 'lucide-react';

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
      // Sort: upcoming (CONFIRMED) first, then date descending
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
      // Clear location state
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const handleCancel = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this appointment? This cannot be undone.")) return;
    try {
      await API.post(`appointments/${id}/cancel/`);
      setSuccessMsg("Appointment cancelled successfully.");
      fetchAppointments();
    } catch (err) {
      setError(err.response?.data?.detail || "Cancellation failed.");
    }
  };

  // Reschedule slots loader
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

  const getStatusBadge = (status) => {
    switch (status) {
      case 'CONFIRMED':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">Confirmed</span>;
      case 'COMPLETED':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-100">Completed</span>;
      case 'CANCELLED':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-100">Cancelled</span>;
      case 'HELD':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-100 animate-pulse">Held</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">Expired</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">My Appointments</h1>
        <p className="text-slate-500 text-sm mt-1">Review upcoming consultations, history, prescriptions, and advice summaries.</p>
      </div>

      {successMsg && (
        <div className="bg-emerald-50 border-l-4 border-emerald-500 p-4 rounded-xl text-sm text-emerald-800">
          {successMsg}
        </div>
      )}

      {error && (
        <div className="bg-rose-50 border-l-4 border-rose-500 p-4 rounded-xl text-sm text-rose-800">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      ) : appointments.length === 0 ? (
        <div className="bg-white text-center py-16 rounded-2xl border border-slate-200/80 p-8 shadow-sm">
          <Calendar className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <h3 className="font-semibold text-slate-700">No appointments found</h3>
          <p className="text-slate-500 text-sm mt-1">You haven't scheduled any consultations yet.</p>
          <button
            onClick={() => navigate('/patient/doctors')}
            className="mt-6 inline-flex items-center space-x-2 px-4 py-2 text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-xl shadow-sm"
          >
            Find a Doctor
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/60 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-100 text-slate-600 text-xs uppercase font-bold tracking-wider">
                  <th className="px-6 py-4">Doctor</th>
                  <th className="px-6 py-4">Specialization</th>
                  <th className="px-6 py-4">Date & Time</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                {appointments.map((appt) => (
                  <tr key={appt.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-800">Dr. {appt.doctor.user.name}</td>
                    <td className="px-6 py-4 text-slate-600">{appt.doctor.specialization}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-1.5 text-slate-800">
                        <Calendar className="h-4 w-4 text-slate-400" />
                        <span>{appt.appointment_date}</span>
                      </div>
                      <div className="flex items-center space-x-1.5 text-xs text-slate-500 mt-0.5">
                        <Clock className="h-3.5 w-3.5 text-slate-400" />
                        <span>{appt.start_time.substring(0, 5)} - {appt.end_time.substring(0, 5)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(appt.status)}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        {appt.status === 'CONFIRMED' && (
                          <>
                            <button
                              onClick={() => setReschedulingAppt(appt)}
                              className="inline-flex items-center space-x-1 py-1.5 px-3 border border-slate-200 hover:bg-slate-50 hover:text-slate-900 rounded-lg text-xs font-semibold transition-all"
                            >
                              <RefreshCw className="h-3.5 w-3.5" />
                              <span>Reschedule</span>
                            </button>
                            <button
                              onClick={() => handleCancel(appt.id)}
                              className="inline-flex items-center space-x-1 py-1.5 px-3 border border-red-100 hover:bg-red-50 text-red-600 hover:text-red-700 rounded-lg text-xs font-semibold transition-all"
                            >
                              <XCircle className="h-3.5 w-3.5" />
                              <span>Cancel</span>
                            </button>
                          </>
                        )}
                        {(appt.status === 'CONFIRMED' || appt.status === 'COMPLETED') && (
                          <button
                            onClick={() => navigate(`/patient/appointments/${appt.id}`)}
                            className="inline-flex items-center space-x-1 py-1.5 px-3 bg-primary-50 text-primary-700 hover:bg-primary-100 rounded-lg text-xs font-bold transition-all"
                          >
                            <span>View Details</span>
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
        </div>
      )}

      {/* Reschedule Modal */}
      {reschedulingAppt && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 w-full max-w-md shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-slate-800">Reschedule Appointment</h3>
            <p className="text-sm text-slate-500">Rescheduling with Dr. {reschedulingAppt.doctor.user.name}</p>
            
            <form onSubmit={handleRescheduleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase">Choose New Date</label>
                <input
                  type="date"
                  value={newDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => { setNewDate(e.target.value); setNewSlot(''); }}
                  className="w-full p-2 border border-slate-200 rounded-lg text-sm"
                />
              </div>

              {newDate && (
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase">Available Time Slots</label>
                  {loadingSlots ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-primary-600 mx-auto"></div>
                  ) : availableSlots.length === 0 ? (
                    <p className="text-xs text-slate-500">No open slots available on this date.</p>
                  ) : (
                    <div className="grid grid-cols-3 gap-2">
                      {availableSlots.map((s, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setNewSlot(s.start_time)}
                          className={`py-1.5 px-2 text-xs font-semibold rounded-lg border text-center transition-all ${
                            newSlot === s.start_time
                              ? 'bg-primary-600 text-white border-transparent'
                              : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          {s.start_time.substring(0, 5)}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => { setReschedulingAppt(null); setNewDate(''); setNewSlot(''); }}
                  className="py-2 px-4 border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newDate || !newSlot}
                  className="py-2 px-4 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-xl disabled:opacity-50"
                >
                  Reschedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientAppointments;
