import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../services/api';
import { Badge, Button, Avatar } from '../../components/UI';
import { Calendar, Clock, Shield, CheckCircle, Search, Trash2, Eye, X, ClipboardList } from 'lucide-react';

const AdminAppointments = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [dateFilter, setDateFilter] = useState('');

  const fetchGlobalAppointments = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await API.get('appointments/');
      const sorted = response.data.sort((a, b) => new Date(b.appointment_date) - new Date(a.appointment_date));
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

  useEffect(() => {
    let result = appointments;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        a => a.doctor.user.name.toLowerCase().includes(q) ||
             a.patient.name.toLowerCase().includes(q) ||
             a.doctor.specialization.toLowerCase().includes(q)
      );
    }

    if (statusFilter !== 'ALL') {
      result = result.filter(a => a.status === statusFilter);
    }

    if (dateFilter) {
      result = result.filter(a => a.appointment_date === dateFilter);
    }

    setFiltered(result);
  }, [searchQuery, statusFilter, dateFilter, appointments]);

  const handleAdminCancel = async (id) => {
    if (!window.confirm("Cancel this appointment? Both patient and doctor will be notified.")) return;
    try {
      await API.post(`appointments/${id}/cancel/`);
      setSuccess("Appointment cancelled successfully.");
      fetchGlobalAppointments();
    } catch (err) {
      alert("Failed to cancel appointment.");
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('ALL');
    setDateFilter('');
  };

  const hasActiveFilters = searchQuery || statusFilter !== 'ALL' || dateFilter;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Global Appointments Control</h1>
        <p className="text-slate-500 text-sm mt-1">Audit active slot reservations, verify consult logs, and override schedules.</p>
      </div>

      {success && (
        <div className="bg-emerald-50 border-l-4 border-emerald-500 p-4 rounded-xl text-xs font-bold text-emerald-800 flex items-center space-x-2">
          <CheckCircle className="h-4 w-4 text-emerald-600" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="bg-rose-50 border-l-4 border-rose-500 p-4 rounded-xl text-xs font-bold text-rose-800">
          {error}
        </div>
      )}

      {/* Enhanced Search & Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
          {/* Text Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search patient, doctor, or specialization..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs font-semibold border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-800"
            />
          </div>

          {/* Status filter */}
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide shrink-0">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="ALL">All</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="COMPLETED">Completed</option>
              <option value="HELD">Held</option>
              <option value="CANCELLED">Cancelled</option>
              <option value="EXPIRED">Expired</option>
            </select>
          </div>

          {/* Date filter */}
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide shrink-0">Date:</span>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* Clear filters */}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center space-x-1 text-xs font-bold text-rose-500 hover:text-rose-600 px-3 py-2 border border-rose-100 rounded-xl hover:bg-rose-50 transition-all"
            >
              <X className="h-3.5 w-3.5" />
              <span>Clear</span>
            </button>
          )}
        </div>

        {hasActiveFilters && (
          <p className="text-[10px] text-slate-400 font-bold mt-2 pl-1">
            Showing {filtered.length} of {appointments.length} appointments
          </p>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white text-center py-14 rounded-2xl border border-slate-200/80 shadow-sm">
          <ClipboardList className="h-10 w-10 text-slate-200 mx-auto mb-3" />
          <h4 className="font-bold text-slate-500 text-sm">No Appointments Found</h4>
          <p className="text-slate-400 text-xs mt-1 max-w-xs mx-auto">
            {hasActiveFilters
              ? 'No appointments match your current filters. Try adjusting the search or status.'
              : 'No appointments have been booked yet in the system.'}
          </p>
          {hasActiveFilters && (
            <button onClick={clearFilters} className="mt-4 text-xs font-bold text-primary-600 hover:text-primary-700">
              Clear all filters
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="px-4 py-3.5">ID</th>
                  <th className="px-4 py-3.5">Patient</th>
                  <th className="px-4 py-3.5">Doctor Specialist</th>
                  <th className="px-4 py-3.5">Date & Time</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                {filtered.map((appt) => (
                  <tr key={appt.id} className="hover:bg-slate-50/30 transition-colors">
                    <td className="px-4 py-3 text-slate-400 font-bold">#{appt.id}</td>
                    <td className="px-4 py-3 font-bold text-slate-800">{appt.patient.name}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-2">
                        <Avatar name={appt.doctor.user.name} specialization={appt.doctor.specialization} />
                        <div>
                          <span className="font-bold text-slate-700">Dr. {appt.doctor.user.name}</span>
                          <span className="block text-[10px] text-slate-400">{appt.doctor.specialization}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-1 font-bold text-slate-700">
                        <Calendar className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span>{appt.appointment_date}</span>
                      </div>
                      <div className="flex items-center space-x-1 text-[10px] text-slate-400 mt-0.5">
                        <Clock className="h-3 w-3 text-slate-300 shrink-0" />
                        <span>{appt.start_time.substring(0, 5)} – {appt.end_time.substring(0, 5)}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge status={appt.status} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end space-x-2">
                        {/* View detail button — always visible */}
                        <button
                          onClick={() => navigate(`/patient/appointments/${appt.id}`)}
                          className="p-1.5 border border-primary-100 hover:bg-primary-50 text-primary-600 rounded-lg transition-all"
                          title="View appointment detail"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        {/* Cancel button — only for CONFIRMED */}
                        {appt.status === 'CONFIRMED' && (
                          <button
                            onClick={() => handleAdminCancel(appt.id)}
                            className="p-1.5 border border-rose-100 hover:bg-rose-50 text-rose-600 rounded-lg transition-all"
                            title="Cancel appointment"
                          >
                            <Trash2 className="h-4 w-4" />
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
    </div>
  );
};

export default AdminAppointments;
