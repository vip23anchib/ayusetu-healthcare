import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../services/api';
import { Button, Avatar, EmptyState } from '../../components/UI';
import { Search, ArrowRight, Star, Clock, Calendar } from 'lucide-react';

const SPECIALTIES = [
  'All',
  'Cardiology',
  'General Physician',
  'Dermatology',
  'Pediatrics',
  'Orthopedics',
  'ENT Specialist'
];

const PatientDoctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [specialization, setSpecialization] = useState('');
  const [activeChip, setActiveChip] = useState('All');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchDoctors = async (spec = '') => {
    setLoading(true);
    try {
      const response = await API.get(`doctors/?specialization=${spec}`);
      setDoctors(response.data);
    } catch (err) {
      console.error("Failed to fetch doctors list", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchDoctors(specialization);
  };

  const handleChipClick = (spec) => {
    setActiveChip(spec);
    if (spec === 'All') {
      setSpecialization('');
      fetchDoctors('');
    } else {
      setSpecialization(spec);
      fetchDoctors(spec);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto animate-fade-in">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-navy-800 via-primary-700 to-teal-700 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-xl space-y-2">
          <span className="text-[10px] font-extrabold uppercase tracking-widest bg-white/10 px-3 py-1 rounded-full border border-white/20 text-teal-200">
            AyuSetu Multispeciality Clinic
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight font-display">
            Find Your Healthcare Specialist
          </h1>
          <p className="text-white/80 text-xs sm:text-sm leading-relaxed font-medium">
            Browse verified clinical practitioners, check shift availability, and lock your consultation slot in seconds.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-800/90 p-5 rounded-2xl border border-slate-200/90 dark:border-slate-700/80 elevated-card space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Specialty Filter Chips */}
          <div className="flex flex-wrap gap-2">
            {SPECIALTIES.map((spec) => (
              <button
                key={spec}
                onClick={() => handleChipClick(spec)}
                className={`text-xs font-bold px-3.5 py-2 rounded-xl border transition-all cursor-pointer ${
                  activeChip === spec
                    ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}
              >
                {spec}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <form onSubmit={handleSearch} className="flex gap-2 w-full md:w-80 shrink-0">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 dark:text-slate-500" />
              <input
                type="text"
                placeholder="Search specialty..."
                value={specialization}
                onChange={(e) => setSpecialization(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs theme-input border rounded-xl focus:outline-none font-medium"
              />
            </div>
            <Button type="submit" variant="primary">
              Search
            </Button>
          </form>
        </div>
      </div>

      {/* Doctor Cards Grid */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary-600 border-t-transparent"></div>
        </div>
      ) : doctors.length === 0 ? (
        <EmptyState
          icon={Search}
          title="No Specialists Found"
          message="No doctors match your department search criteria. Try clearing search filters."
          actionText="Clear Filters"
          onAction={() => handleChipClick('All')}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {doctors.map((doc) => (
            <div
              key={doc.id}
              className="bg-white dark:bg-slate-800/90 rounded-3xl border border-slate-200/90 dark:border-slate-700/80 p-6 elevated-card flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-xl group"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <Avatar name={doc.user.name} specialization={doc.specialization} size="md" />
                  <div className="flex items-center gap-1 text-xs font-bold text-amber-500 bg-amber-50 dark:bg-amber-950/60 border border-amber-200/80 dark:border-amber-800 px-2.5 py-1 rounded-full">
                    <Star className="h-3.5 w-3.5 fill-amber-400" />
                    <span>4.9</span>
                  </div>
                </div>

                <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-lg font-display">
                  Dr. {doc.user.name}
                </h3>
                <p className="text-xs font-bold text-teal-600 dark:text-teal-400 mt-0.5">
                  {doc.specialization}
                </p>

                <div className="border-t border-slate-100 dark:border-slate-700/60 pt-4 mt-4 space-y-2 text-xs text-slate-500 dark:text-slate-400 font-medium">
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 text-slate-400" /> Duration:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{doc.slot_duration} minutes</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5 text-slate-400" /> Shifts:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {doc.working_hours?.length > 0
                        ? `${doc.working_hours.length} shifts active`
                        : 'Configured'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-700/60">
                <Button
                  onClick={() => navigate(`/patient/book/${doc.id}`)}
                  variant="primary"
                  className="w-full flex items-center justify-center space-x-1.5 py-3"
                >
                  <span>Select Time Slot</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PatientDoctors;
