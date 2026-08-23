import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../services/api';
import { Card, Button, Avatar, EmptyState } from '../../components/UI';
import { Search, ArrowRight } from 'lucide-react';

const PatientDoctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [specialization, setSpecialization] = useState('');
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Find a Healthcare Specialist</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 font-medium">Book slots at AyuSetu Multispeciality Clinic by department or specialty.</p>
        </div>
        
        <form onSubmit={handleSearch} className="flex gap-2 w-full md:w-auto shrink-0">
          <div className="relative flex-1 md:w-80">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              placeholder="Search (e.g. Cardiology, General Physician)..."
              value={specialization}
              onChange={(e) => setSpecialization(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 text-xs theme-input border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 font-medium"
            />
          </div>
          <Button type="submit" variant="primary">
            Search
          </Button>
        </form>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      ) : doctors.length === 0 ? (
        <EmptyState
          icon={Search}
          title="No Specialists Found"
          message="No doctors match your department search criteria. Try clearing search filters."
          actionText="Clear Filters"
          onAction={() => { setSpecialization(''); fetchDoctors(''); }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {doctors.map((doc) => (
            <Card
              key={doc.id}
              className="flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center space-x-3 mb-4">
                  <Avatar name={doc.user.name} specialization={doc.specialization} />
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-slate-100">Dr. {doc.user.name}</h3>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600 mt-0.5 uppercase tracking-wide">
                      {doc.specialization}
                    </span>
                  </div>
                </div>

                <div className="border-t border-slate-100 dark:border-slate-700/60 pt-4 space-y-2 text-xs text-slate-500 dark:text-slate-400 font-medium">
                  <div className="flex justify-between">
                    <span>Consultation Duration:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{doc.slot_duration} minutes</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Weekly Availability:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {doc.working_hours?.length > 0
                        ? `${doc.working_hours.length} shifts configured`
                        : 'Call clinic to confirm'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6 border-t border-slate-100 dark:border-slate-700/60 pt-4">
                <Button
                  onClick={() => navigate(`/patient/book/${doc.id}`)}
                  variant="primary"
                  className="w-full flex items-center justify-center space-x-1.5"
                >
                  <span>Book Appointment</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default PatientDoctors;
