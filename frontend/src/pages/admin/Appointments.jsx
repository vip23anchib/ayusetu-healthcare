import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { Calendar, Clock, AlertTriangle, Shield, CheckCircle, Search, Trash2 } from 'lucide-react';

const AdminAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Filters state
  const [doctorQuery, setDoctorQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const fetchGlobalAppointments = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await API.get('appointments/');
      // Sort newest first
      const sorted = response.data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setAppointments(sorted);
      setFiltered(sorted);
    } catch (err) {
      console.error("Failed to load global appointments", err);
      setError("Failed to load appointments ledger.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGlobalAppointments();
  }, []);

  // Filter apply logic
  useEffect(() => {
    let result = appointments;

    if (doctorQuery.trim()) {
      const q = doctorQuery.toLowerCase();
      result = result.filter(
        a => a.doctor.user.name.toLowerCase().includes(q) || a.patient.name.toLowerCase().includes(q)
      );
    }

    if (statusFilter !== 'ALL') {
      result = result.filter(a => a.status === statusFilter);
    }

    setFiltered(result);
  }, [doctorQuery, statusFilter, appointments]);

  const handleAdminCancel = async (id) => {
    if (!window.confirm("As an admin, cancel this appointment? This will notify both patient and doctor.")) return;
    try {
      await API.post(`appointments/${id}/cancel/`);
      setSuccess("Appointment cancelled successfully.");
      fetchGlobalAppointments();
    } catch (err) {
      alert("Failed to cancel appointment.");
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'CONFIRMED': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'COMPLETED': return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'CANCELLED': return 'bg-rose-50 text-rose-700 border-rose-100';
      case 'HELD': return 'bg-amber-50 text-amber-700 border-amber-100';
      default: return 'bg-slate-50 text-slate-500 border-slate-100';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center space-x-2">
            <Shield className="h-6 w-6 text-primary-600" />
            <span>Global Appointments Control</span>
          </h1>
          <p className="text-slate-500 text-sm mt-1">Audit active slot reservations, verify consult logs, and override schedules.</p>
        </div>
      </div>

      {success && (
        <div className="bg-emerald-50 border-l-4 border-emerald-500 p-4 rounded-xl text-sm text-emerald-800 flex items-center space-x-2">
          <CheckCircle className="h-5 w-5 text-emerald-600" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="bg-rose-50 border-l-4 border-rose-500 p-4 rounded-xl text-sm text-rose-800">
          {error}
        </div>
      )}

      {/* Filters Form */}
      <div className="bg-white rounded-2xl border border-slate-200/60 p-5 shadow-sm flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search patient or doctor name..."
            value={doctorQuery}
            onChange={(e) => setDoctorQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div className="flex items-center space-x-2 w-full md:w-auto">
          <span className="text-xs font-bold text-slate-500 shrink-0">STATUS:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="p-2 border border-slate-200 rounded-lg text-sm bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500 w-full"
          >
            <option value="ALL">All Statuses</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="COMPLETED">Completed</option>
            <option value="HELD">Held</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="EXPIRED">Expired</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white text-center py-12 rounded-2xl border border-slate-200/60 p-8 shadow-sm">
          <p className="text-slate-500 text-sm">No appointments matching selected filters.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/60 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider text-xs">
                  <th className="px-4 py-4">ID</th>
                  <th className="px-4 py-4">Patient</th>
                  <th className="px-4 py-4">Doctor</th>
                  <th className="px-4 py-4">Date & Time</th>
                  <th className="px-4 py-4">Status</th>
                  <th className="px-4 py-4 text-right">Override</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filtered.map((appt) => (
                  <tr key={appt.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3 text-xs font-semibold text-slate-400">#{appt.id}</td>
                    <td className="px-4 py-3 font-bold text-slate-800">{appt.patient.name}</td>
                    <td className="px-4 py-3">Dr. {appt.doctor.user.name} ({appt.doctor.specialization})</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                        <span>{appt.appointment_date}</span>
                      </div>
                      <div className="flex items-center space-x-1 text-xs text-slate-500 mt-0.5">
                        <Clock className="h-3.5 w-3.5 text-slate-400" />
                        <span>{appt.start_time.substring(0, 5)} - {appt.end_time.substring(0, 5)}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getStatusStyle(appt.status)}`}>
                        {appt.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {appt.status === 'CONFIRMED' && (
                        <button
                          onClick={() => handleAdminCancel(appt.id)}
                          className="p-1.5 border border-rose-100 hover:bg-rose-50 text-rose-600 rounded-lg transition-all"
                          title="Cancel Appointment"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAppointments;
