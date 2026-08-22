import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import { Calendar, Clock, Stethoscope, ArrowRight, Pill, User, Heart } from 'lucide-react';

const PatientDashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [upcoming, setUpcoming] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUpcoming = async () => {
      setLoading(true);
      try {
        const response = await API.get('appointments/');
        // Find next confirmed appointment in future
        const nowStr = new Date().toISOString().split('T')[0];
        const confirmed = response.data
          .filter(a => a.status === 'CONFIRMED')
          .sort((a, b) => new Date(a.appointment_date) - new Date(b.appointment_date));
        
        if (confirmed.length > 0) {
          setUpcoming(confirmed[0]);
        }
      } catch (err) {
        console.error("Failed to load upcoming appts", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUpcoming();
  }, []);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Welcome Card */}
      <div className="bg-gradient-to-r from-primary-700 to-primary-500 rounded-3xl p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 bottom-0 opacity-10 translate-y-6 translate-x-6">
          <Heart className="h-64 w-64" />
        </div>
        <div className="relative z-10 max-w-lg space-y-2">
          <span className="text-primary-100 text-xs font-semibold uppercase tracking-wider">Patient Portal</span>
          <h1 className="text-3xl font-extrabold">Welcome back, {user?.name}!</h1>
          <p className="text-primary-100/90 text-sm">
            Access specialists directories, schedule doctor consults, and review your digital health summaries.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Quick Action Navigation Cards */}
        <div className="md:col-span-1 space-y-4">
          <button
            onClick={() => navigate('/patient/doctors')}
            className="w-full bg-white hover:border-primary-300 border border-slate-200/80 p-5 rounded-2xl flex items-center justify-between shadow-sm transition-all group text-left"
          >
            <div className="flex items-center space-x-3.5">
              <div className="h-10 w-10 rounded-xl bg-primary-50 flex items-center justify-center text-primary-600">
                <Stethoscope className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 group-hover:text-primary-700 transition-colors">Book Doctor</h3>
                <p className="text-slate-500 text-xs mt-0.5">Find matching slots</p>
              </div>
            </div>
            <ArrowRight className="h-5 w-5 text-slate-400 group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={() => navigate('/patient/appointments')}
            className="w-full bg-white hover:border-primary-300 border border-slate-200/80 p-5 rounded-2xl flex items-center justify-between shadow-sm transition-all group text-left"
          >
            <div className="flex items-center space-x-3.5">
              <div className="h-10 w-10 rounded-xl bg-primary-50 flex items-center justify-center text-primary-600">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 group-hover:text-primary-700 transition-colors">My Appointments</h3>
                <p className="text-slate-500 text-xs mt-0.5">Checkups & History</p>
              </div>
            </div>
            <ArrowRight className="h-5 w-5 text-slate-400 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Upcoming consult details */}
        <div className="md:col-span-2">
          {loading ? (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-8 shadow-sm flex justify-center items-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
            </div>
          ) : upcoming ? (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm flex flex-col justify-between h-full space-y-4">
              <div>
                <span className="text-xs font-bold text-primary-600 uppercase tracking-wider block mb-2">Upcoming Consultation</span>
                <div className="flex items-start space-x-4">
                  <div className="h-12 w-12 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                    <User className="h-6 w-6" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-bold text-slate-800">Dr. {upcoming.doctor.user.name}</h3>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                      {upcoming.doctor.specialization}
                    </span>
                    <div className="flex items-center space-x-2 text-xs text-slate-500 pt-1">
                      <Calendar className="h-3.5 w-3.5 text-slate-400" />
                      <span>{upcoming.appointment_date}</span>
                      <Clock className="h-3.5 w-3.5 text-slate-400" />
                      <span>{upcoming.start_time.substring(0, 5)} - {upcoming.end_time.substring(0, 5)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button
                  onClick={() => navigate(`/patient/appointments/${upcoming.id}`)}
                  className="bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold py-2 px-4 rounded-xl transition-all shadow-sm flex items-center space-x-1"
                >
                  <span>View Details</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-8 shadow-sm text-center flex flex-col justify-center items-center h-full py-12">
              <Calendar className="h-10 w-10 text-slate-300 mb-3" />
              <h3 className="font-semibold text-slate-700">No upcoming consultations</h3>
              <p className="text-slate-400 text-xs mt-1">Book a slot today to consult with a specialist practitioner.</p>
              <button
                onClick={() => navigate('/patient/doctors')}
                className="mt-4 text-xs font-bold text-primary-600 hover:text-primary-700"
              >
                Find Doctors
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;
