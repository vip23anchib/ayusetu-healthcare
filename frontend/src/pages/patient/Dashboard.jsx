import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Card, Button, Avatar, EmptyState } from '../../components/UI';
import { Calendar, Clock, Stethoscope, ArrowRight, Activity, Heart } from 'lucide-react';

const PatientDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [upcoming, setUpcoming] = useState(null);
  const [stats, setStats] = useState({ total: 0, completed: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const response = await API.get('appointments/');
        const sorted = response.data.sort((a, b) => new Date(a.appointment_date) - new Date(b.appointment_date));
        
        const confirmed = sorted.filter(a => a.status === 'CONFIRMED');
        
        if (confirmed.length > 0) {
          setUpcoming(confirmed[0]);
        }
        
        setStats({
          total: response.data.length,
          completed: response.data.filter(a => a.status === 'COMPLETED').length
        });
      } catch (err) {
        console.error("Failed to load dashboard statistics", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Welcome Card banner */}
      <div className="bg-gradient-to-br from-primary-800 via-primary-700 to-navy-700 rounded-3xl p-8 text-white shadow-md relative overflow-hidden">
        <div className="absolute right-0 bottom-0 opacity-10 translate-y-6 translate-x-6">
          <Heart className="h-64 w-64" />
        </div>
        <div className="relative z-10 max-w-lg space-y-2">
          <span className="text-primary-200 text-[10px] font-bold uppercase tracking-widest bg-white/10 px-2.5 py-1 rounded-full border border-white/20">
            AyuSetu Multispeciality Clinic
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight mt-2">Welcome back, {user?.name}!</h1>
          <p className="text-white/80 text-xs leading-relaxed">
            Access our specialist directory, book consultation slots, and review post-visit prescription summaries instantly.
          </p>
        </div>
      </div>

      {/* Summary Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800/90 p-5 rounded-2xl border border-slate-200/90 dark:border-slate-700/80 elevated-card flex items-center space-x-4">
          <div className="h-10 w-10 rounded-xl bg-teal-50 dark:bg-teal-950/60 flex items-center justify-center text-teal-600 dark:text-teal-400 shrink-0">
            <Activity className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase block tracking-wider">Total Bookings</span>
            <span className="text-xl font-extrabold text-slate-800 dark:text-slate-100">{stats.total}</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800/90 p-5 rounded-2xl border border-slate-200/90 dark:border-slate-700/80 elevated-card flex items-center space-x-4">
          <div className="h-10 w-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
            <Calendar className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase block tracking-wider">Completed</span>
            <span className="text-xl font-extrabold text-slate-800 dark:text-slate-100">{stats.completed}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Quick Action Navigation Buttons */}
        <div className="md:col-span-1 space-y-4">
          <button
            onClick={() => navigate('/patient/doctors')}
            className="w-full bg-white dark:bg-slate-800/90 hover:border-primary-400 border border-slate-200/90 dark:border-slate-700/80 p-5 rounded-2xl flex items-center justify-between elevated-card hover:shadow-md transition-all group text-left cursor-pointer"
          >
            <div className="flex items-center space-x-3.5">
              <div className="h-10 w-10 rounded-xl bg-primary-50 dark:bg-primary-950/80 flex items-center justify-center text-primary-700 dark:text-primary-300 transition-colors group-hover:bg-primary-100 dark:group-hover:bg-primary-900">
                <Stethoscope className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 dark:text-slate-100 group-hover:text-primary-700 dark:group-hover:text-primary-300 transition-colors text-sm">Book Specialist</h3>
                <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">Find doctor slot calendars</p>
              </div>
            </div>
            <ArrowRight className="h-5 w-5 text-slate-400 dark:text-slate-500 group-hover:translate-x-1 transition-transform group-hover:text-primary-600 dark:group-hover:text-primary-400" />
          </button>

          <button
            onClick={() => navigate('/patient/appointments')}
            className="w-full bg-white dark:bg-slate-800/90 hover:border-primary-400 border border-slate-200/90 dark:border-slate-700/80 p-5 rounded-2xl flex items-center justify-between elevated-card hover:shadow-md transition-all group text-left cursor-pointer"
          >
            <div className="flex items-center space-x-3.5">
              <div className="h-10 w-10 rounded-xl bg-primary-50 dark:bg-primary-950/80 flex items-center justify-center text-primary-700 dark:text-primary-300 transition-colors group-hover:bg-primary-100 dark:group-hover:bg-primary-900">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 dark:text-slate-100 group-hover:text-primary-700 dark:group-hover:text-primary-300 transition-colors text-sm">My Schedules</h3>
                <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">Checkups details & notes</p>
              </div>
            </div>
            <ArrowRight className="h-5 w-5 text-slate-400 dark:text-slate-500 group-hover:translate-x-1 transition-transform group-hover:text-primary-600 dark:group-hover:text-primary-400" />
          </button>
        </div>

        {/* Next Scheduled Consultation */}
        <div className="md:col-span-2">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
            </div>
          ) : upcoming ? (
            <Card title="Next Scheduled Consultation" subtitle="Upcoming confirmed appointment at AyuSetu.">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50 dark:bg-slate-900/60 p-5 rounded-2xl border border-slate-100 dark:border-slate-700/60">
                <div className="flex items-center space-x-3.5">
                  <Avatar name={upcoming.doctor.user.name} specialization={upcoming.doctor.specialization} />
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-slate-100 text-base">Dr. {upcoming.doctor.user.name}</h4>
                    <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold">{upcoming.doctor.specialization}</p>
                  </div>
                </div>

                <div className="space-y-1 text-left sm:text-right">
                  <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
                    <Calendar className="h-3.5 w-3.5 text-primary-600 dark:text-primary-400" />
                    <span>{upcoming.appointment_date}</span>
                  </div>
                  <div className="flex items-center space-x-1.5 text-xs text-slate-500 dark:text-slate-400 font-semibold">
                    <Clock className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
                    <span>{upcoming.start_time.substring(0, 5)} - {upcoming.end_time.substring(0, 5)}</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 flex justify-end">
                <Button onClick={() => navigate(`/patient/appointments/${upcoming.id}`)} variant="primary">
                  View Appointment Details
                </Button>
              </div>
            </Card>
          ) : (
            <EmptyState
              icon={Calendar}
              title="No Upcoming Consultations"
              message="You have no confirmed bookings scheduled at the moment. Explore available doctor slots to schedule a visit."
              actionText="Book an Appointment"
              onAction={() => navigate('/patient/doctors')}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;
