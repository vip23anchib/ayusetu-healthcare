import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Card, Button, Avatar, EmptyState, StatCard } from '../../components/UI';
import { Calendar, Clock, Stethoscope, ArrowRight, Activity, Heart, Sparkles, CheckCircle2 } from 'lucide-react';

const PatientDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [upcoming, setUpcoming] = useState(null);
  const [stats, setStats] = useState({ total: 0, completed: 0, confirmed: 0 });
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
          completed: response.data.filter(a => a.status === 'COMPLETED').length,
          confirmed: confirmed.length
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
    <div className="space-y-8 max-w-6xl mx-auto animate-fade-in">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-br from-primary-800 via-primary-700 to-navy-800 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 bottom-0 opacity-10 translate-y-6 translate-x-6 pointer-events-none">
          <Heart className="h-64 w-64" />
        </div>
        <div className="relative z-10 max-w-xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-[10px] font-extrabold uppercase tracking-widest text-teal-200">
            <Sparkles className="h-3 w-3 text-teal-300" />
            AyuSetu Patient Portal · Active Care Plan
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-display">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-white/80 text-xs sm:text-sm leading-relaxed font-medium">
            Schedule consultations, review Gemini AI symptom triage insights, and track follow-up prescriptions effortlessly.
          </p>
          <div className="pt-2 flex flex-wrap gap-3">
            <button
              onClick={() => navigate('/patient/doctors')}
              className="inline-flex items-center gap-2 px-4.5 py-2.5 rounded-xl bg-white text-teal-800 font-bold text-xs shadow-md hover:bg-teal-50 transition-all cursor-pointer font-display"
            >
              <Stethoscope className="h-4 w-4 text-teal-600" />
              Book Specialist
            </button>
            <button
              onClick={() => navigate('/patient/appointments')}
              className="inline-flex items-center gap-2 px-4.5 py-2.5 rounded-xl bg-white/15 text-white border border-white/20 font-bold text-xs hover:bg-white/25 transition-all cursor-pointer font-display"
            >
              <Calendar className="h-4 w-4" />
              View Appointments ({stats.total})
            </button>
          </div>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <StatCard
          title="Total Consultations"
          value={stats.total}
          subtitle="All-time booked visits"
          icon={Activity}
          color="teal"
        />
        <StatCard
          title="Upcoming Confirmed"
          value={stats.confirmed}
          subtitle="Active scheduled slots"
          icon={Calendar}
          color="navy"
        />
        <StatCard
          title="Completed Visits"
          value={stats.completed}
          subtitle="Finished consultations"
          icon={CheckCircle2}
          color="emerald"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions Card */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white dark:bg-slate-800/90 p-5 rounded-2xl border border-slate-200/90 dark:border-slate-700/80 elevated-card space-y-3">
            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider font-display block">
              Quick Shortcuts
            </span>

            <button
              onClick={() => navigate('/patient/doctors')}
              className="w-full bg-slate-50 dark:bg-slate-900/60 hover:bg-teal-50 dark:hover:bg-teal-950/40 border border-slate-200/80 dark:border-slate-700/80 hover:border-teal-300 dark:hover:border-teal-700 p-4 rounded-xl flex items-center justify-between transition-all group text-left cursor-pointer"
            >
              <div className="flex items-center space-x-3">
                <div className="h-9 w-9 rounded-xl bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 flex items-center justify-center">
                  <Stethoscope className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-slate-100 text-xs font-display">Specialist Directory</h4>
                  <p className="text-[11px] text-slate-400">Cardiology, ENT, Derm & more</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-400 group-hover:translate-x-1 group-hover:text-teal-600 transition-all" />
            </button>

            <button
              onClick={() => navigate('/patient/appointments')}
              className="w-full bg-slate-50 dark:bg-slate-900/60 hover:bg-sky-50 dark:hover:bg-sky-950/40 border border-slate-200/80 dark:border-slate-700/80 hover:border-sky-300 dark:hover:border-sky-700 p-4 rounded-xl flex items-center justify-between transition-all group text-left cursor-pointer"
            >
              <div className="flex items-center space-x-3">
                <div className="h-9 w-9 rounded-xl bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 flex items-center justify-center">
                  <Calendar className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-slate-100 text-xs font-display">My Appointments</h4>
                  <p className="text-[11px] text-slate-400">View prescription summaries</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-400 group-hover:translate-x-1 group-hover:text-sky-600 transition-all" />
            </button>
          </div>
        </div>

        {/* Next Scheduled Consultation */}
        <div className="lg:col-span-2">
          {loading ? (
            <div className="flex justify-center py-16 bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200/90 dark:border-slate-700/80">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-600 border-t-transparent"></div>
            </div>
          ) : upcoming ? (
            <Card 
              title="Next Scheduled Consultation" 
              subtitle="Confirmed upcoming appointment at AyuSetu Multispeciality."
              icon={Calendar}
              badge="Confirmed"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50 dark:bg-slate-900/60 p-5 rounded-2xl border border-slate-100 dark:border-slate-700/60">
                <div className="flex items-center space-x-4">
                  <Avatar name={upcoming.doctor.user.name} specialization={upcoming.doctor.specialization} size="md" />
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-slate-100 text-base font-display">Dr. {upcoming.doctor.user.name}</h4>
                    <span className="text-teal-600 dark:text-teal-400 text-xs font-bold">{upcoming.doctor.specialization}</span>
                    <p className="text-[11px] text-slate-400 mt-0.5">Consultation Fee: ₹{upcoming.doctor.consultation_fee}</p>
                  </div>
                </div>

                <div className="space-y-1.5 text-left sm:text-right">
                  <div className="flex items-center sm:justify-end space-x-1.5 text-xs font-bold text-slate-800 dark:text-slate-200">
                    <Calendar className="h-3.5 w-3.5 text-primary-600 dark:text-primary-400" />
                    <span>{upcoming.appointment_date}</span>
                  </div>
                  <div className="flex items-center sm:justify-end space-x-1.5 text-xs text-slate-500 dark:text-slate-400 font-semibold">
                    <Clock className="h-3.5 w-3.5 text-slate-400" />
                    <span>{upcoming.start_time.substring(0, 5)} - {upcoming.end_time.substring(0, 5)}</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 flex justify-end">
                <Button onClick={() => navigate(`/patient/appointments/${upcoming.id}`)} variant="primary">
                  View Consultation Details
                </Button>
              </div>
            </Card>
          ) : (
            <EmptyState
              icon={Calendar}
              title="No Upcoming Consultations"
              message="You have no confirmed visits scheduled. Browse verified doctors to select your preferred time slot."
              actionText="Find Specialists & Book"
              onAction={() => navigate('/patient/doctors')}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;
