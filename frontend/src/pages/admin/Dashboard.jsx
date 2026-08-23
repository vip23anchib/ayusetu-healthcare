import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../services/api';
import { Card, Badge, Avatar } from '../../components/UI';
import { Users, Calendar, Shield, Clipboard, ArrowRight, CheckCircle, XCircle, TrendingUp } from 'lucide-react';

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
      const docRes = await API.get('doctors/');
      setDoctorsCount(docRes.data.length);

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

  const confirmedCount = appointments.filter(a => a.status === 'CONFIRMED').length;
  const completedCount = appointments.filter(a => a.status === 'COMPLETED').length;
  const cancelledCount = appointments.filter(a => a.status === 'CANCELLED').length;

  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const thisWeekCount = appointments.filter(a => new Date(a.appointment_date) >= oneWeekAgo).length;

  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <div className="bg-gradient-to-br from-navy-800 via-navy-700 to-primary-800 rounded-3xl p-8 text-white shadow-md relative overflow-hidden">
        <div className="absolute right-0 bottom-0 opacity-5 translate-y-6 translate-x-6">
          <Shield className="h-64 w-64" />
        </div>
        <div className="relative z-10 space-y-2">
          <span className="text-primary-200 text-[10px] font-bold uppercase tracking-widest bg-white/10 px-2.5 py-1 rounded-full border border-white/20">
            Admin Control Center
          </span>
          <h1 className="text-2xl font-extrabold tracking-tight mt-2">AyuSetu Multispeciality Clinic</h1>
          <p className="text-white/80 text-xs leading-relaxed max-w-md">
            Monitor active medical specialists, leave scheduling logs, and audit all global appointments.
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 dark:bg-rose-950/80 border-l-4 border-rose-500 p-4 rounded-xl text-xs font-bold text-rose-800 dark:text-rose-200">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      ) : (
        <>
          {/* Stat Cards Row — 4 uniform restrained cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 flex flex-col space-y-3 elevated-card">
              <div className="flex items-center justify-between">
                <div className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-slate-700/60 flex items-center justify-center text-slate-700 dark:text-slate-300 shrink-0">
                  <Users className="h-5 w-5" />
                </div>
                <span className="text-[9px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-700 px-2 py-0.5 rounded-full">Active</span>
              </div>
              <div>
                <p className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">{doctorsCount}</p>
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mt-0.5">Specialists</span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium border-t border-slate-100 dark:border-slate-700/60 pt-2">Registered on platform</p>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 flex flex-col space-y-3 elevated-card">
              <div className="flex items-center justify-between">
                <div className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-slate-700/60 flex items-center justify-center text-primary-600 dark:text-primary-400 shrink-0">
                  <Calendar className="h-5 w-5" />
                </div>
                <span className="text-[9px] font-bold text-primary-700 dark:text-primary-300 bg-primary-50 dark:bg-primary-950/80 border border-primary-100 dark:border-primary-800 px-2 py-0.5 rounded-full">Total</span>
              </div>
              <div>
                <p className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">{appointments.length}</p>
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mt-0.5">Appointments</span>
              </div>
              <p className="text-[10px] text-primary-600 dark:text-primary-400 font-bold border-t border-slate-100 dark:border-slate-700/60 pt-2 flex items-center space-x-1">
                <TrendingUp className="h-3 w-3" />
                <span>+{thisWeekCount} this week</span>
              </p>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 flex flex-col space-y-3 elevated-card">
              <div className="flex items-center justify-between">
                <div className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-slate-700/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                  <CheckCircle className="h-5 w-5" />
                </div>
                <span className="text-[9px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-700 px-2 py-0.5 rounded-full">Done</span>
              </div>
              <div>
                <p className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">{completedCount}</p>
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mt-0.5">Completed</span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium border-t border-slate-100 dark:border-slate-700/60 pt-2">{confirmedCount} confirmed upcoming</p>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 flex flex-col space-y-3 elevated-card">
              <div className="flex items-center justify-between">
                <div className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-slate-700/60 flex items-center justify-center text-rose-600 dark:text-rose-400 shrink-0">
                  <XCircle className="h-5 w-5" />
                </div>
                <span className="text-[9px] font-bold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-700 px-2 py-0.5 rounded-full">Cancelled</span>
              </div>
              <div>
                <p className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">{cancelledCount}</p>
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mt-0.5">Cancellations</span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium border-t border-slate-100 dark:border-slate-700/60 pt-2">Patients notified by email</p>
            </div>
          </div>

          {/* Quick Links — Restrained, consistent card style without flood pastel background */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 elevated-card p-5">
            <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3">Quick Navigation</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                onClick={() => navigate('/admin/doctors')}
                className="flex items-center justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-primary-400 dark:hover:border-primary-500 px-4 py-3.5 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-100 hover:text-primary-700 dark:hover:text-primary-300 transition-all cursor-pointer group"
              >
                <span>Manage Specialists</span>
                <ArrowRight className="h-4 w-4 text-slate-400 group-hover:translate-x-1 group-hover:text-primary-600 transition-all" />
              </button>
              <button
                onClick={() => navigate('/admin/leaves')}
                className="flex items-center justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-primary-400 dark:hover:border-primary-500 px-4 py-3.5 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-100 hover:text-primary-700 dark:hover:text-primary-300 transition-all cursor-pointer group"
              >
                <span>Doctor Leave Logs</span>
                <ArrowRight className="h-4 w-4 text-slate-400 group-hover:translate-x-1 group-hover:text-primary-600 transition-all" />
              </button>
              <button
                onClick={() => navigate('/admin/appointments')}
                className="flex items-center justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-primary-400 dark:hover:border-primary-500 px-4 py-3.5 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-100 hover:text-primary-700 dark:hover:text-primary-300 transition-all cursor-pointer group"
              >
                <span>Appointments Oversight</span>
                <ArrowRight className="h-4 w-4 text-slate-400 group-hover:translate-x-1 group-hover:text-primary-600 transition-all" />
              </button>
            </div>
          </div>

          {/* Global appointments ledger (preview — top 10) */}
          <Card title="Recent Booking Activity" subtitle="Latest 10 appointments across all clinicians at AyuSetu.">
            {appointments.length === 0 ? (
              <div className="text-center py-10">
                <Clipboard className="h-10 w-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400">No appointments registered yet.</p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">Bookings will appear here once patients start scheduling.</p>
              </div>
            ) : (
              <div className="overflow-x-auto border border-slate-200 dark:border-slate-700 rounded-xl">
                <table className="w-full text-left border-collapse text-xs theme-table">
                  <thead>
                    <tr className="border-b font-bold uppercase tracking-wider">
                      <th className="px-4 py-3">ID</th>
                      <th className="px-4 py-3">Patient</th>
                      <th className="px-4 py-3">Doctor Specialist</th>
                      <th className="px-4 py-3">Scheduled Date & Time</th>
                      <th className="px-4 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 font-medium">
                    {appointments.slice(0, 10).map((appt) => (
                      <tr key={appt.id} className="transition-colors">
                        <td className="px-4 py-3 text-slate-500 dark:text-slate-400 font-bold">#{appt.id}</td>
                        <td className="px-4 py-3 font-bold text-slate-900 dark:text-slate-100">{appt.patient.name}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center space-x-2">
                            <Avatar name={appt.doctor.user.name} specialization={appt.doctor.specialization} />
                            <span className="font-bold text-slate-800 dark:text-slate-200">Dr. {appt.doctor.user.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-bold text-slate-800 dark:text-slate-200">{appt.appointment_date}</span>
                          <span className="block text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                            {appt.start_time.substring(0, 5)} – {appt.end_time.substring(0, 5)} IST
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <Badge status={appt.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {appointments.length > 10 && (
              <div className="mt-4 text-center">
                <button
                  onClick={() => navigate('/admin/appointments')}
                  className="text-xs font-bold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors cursor-pointer"
                >
                  View all {appointments.length} appointments →
                </button>
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
