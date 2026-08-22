import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../services/api';
import { Users, Calendar, AlertCircle, Shield, Clipboard, ArrowRight } from 'lucide-react';

const AdminDashboard = () => {
  const navigate = useNavigate();

  const [doctorsCount, setDoctorsCount] = useState(0);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadAdminMetrics = async () => {
    setLoading(true);
    setError('');
    try {
      // Fetch doctors count
      const docRes = await API.get('doctors/');
      setDoctorsCount(docRes.data.length);

      // Fetch appointments (Admin sees all appointments)
      const apptRes = await API.get('appointments/');
      setAppointments(apptRes.data);
    } catch (err) {
      console.error("Failed to load admin stats", err);
      setError("Failed to retrieve system overview statistics.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminMetrics();
  }, []);

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
      {/* Welcome & Overview Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800 flex items-center space-x-2">
          <Shield className="h-6 w-6 text-primary-600" />
          <span>Admin Portal Control Center</span>
        </h1>
        <p className="text-slate-500 text-sm mt-1">Monitor active doctors, scheduled leaves, and global booking statuses.</p>
      </div>

      {error && (
        <div className="bg-rose-50 border-l-4 border-rose-500 p-4 rounded-xl text-sm text-rose-800">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      ) : (
        <>
          {/* Metrics summary widgets */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl border border-slate-200/60 p-6 flex items-center justify-between shadow-sm">
              <div className="space-y-1">
                <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">Active Doctors</span>
                <p className="text-3xl font-extrabold text-slate-800">{doctorsCount}</p>
              </div>
              <div className="h-12 w-12 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center">
                <Users className="h-6 w-6" />
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/60 p-6 flex items-center justify-between shadow-sm">
              <div className="space-y-1">
                <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">Global Appointments</span>
                <p className="text-3xl font-extrabold text-slate-800">{appointments.length}</p>
              </div>
              <div className="h-12 w-12 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center">
                <Calendar className="h-6 w-6" />
              </div>
            </div>

            {/* Quick Links Nav */}
            <div className="bg-white rounded-2xl border border-slate-200/60 p-6 flex flex-col justify-center space-y-2 shadow-sm">
              <button
                onClick={() => navigate('/admin/doctors')}
                className="w-full flex justify-between items-center text-left py-1 text-sm font-semibold text-primary-600 hover:text-primary-700 hover:underline transition-all"
              >
                <span>Manage Doctors Profiles</span>
                <ArrowRight className="h-4 w-4" />
              </button>
              <button
                onClick={() => navigate('/admin/leaves')}
                className="w-full flex justify-between items-center text-left py-1 text-sm font-semibold text-primary-600 hover:text-primary-700 hover:underline transition-all"
              >
                <span>Register Doctor Leave Dates</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Global appointments ledger */}
          <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6 space-y-4">
            <h2 className="text-lg font-bold text-slate-800 flex items-center space-x-2">
              <Clipboard className="h-5 w-5 text-primary-600" />
              <span>Global Booking Activity</span>
            </h2>

            {appointments.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-6">No appointments registered in the system.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider text-xs">
                      <th className="px-4 py-3">ID</th>
                      <th className="px-4 py-3">Patient</th>
                      <th className="px-4 py-3">Doctor</th>
                      <th className="px-4 py-3">Specialization</th>
                      <th className="px-4 py-3">Date & Time</th>
                      <th className="px-4 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {appointments.map((appt) => (
                      <tr key={appt.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-4 py-3 font-semibold text-slate-500">#{appt.id}</td>
                        <td className="px-4 py-3 font-bold text-slate-800">{appt.patient.name}</td>
                        <td className="px-4 py-3">Dr. {appt.doctor.user.name}</td>
                        <td className="px-4 py-3">{appt.doctor.specialization}</td>
                        <td className="px-4 py-3">
                          <span>{appt.appointment_date}</span>
                          <span className="block text-xs text-slate-500 mt-0.5">
                            {appt.start_time.substring(0, 5)} - {appt.end_time.substring(0, 5)}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getStatusStyle(appt.status)}`}>
                            {appt.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
