import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../services/api';
import { Search, User, ArrowRight, Shield } from 'lucide-react';

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
          <h1 className="text-2xl font-bold text-slate-800">Find a Healthcare Specialist</h1>
          <p className="text-slate-500 text-sm mt-1">Search by department, specialization, or clinic area.</p>
        </div>
        
        <form onSubmit={handleSearch} className="flex gap-2 w-full md:w-auto shrink-0">
          <div className="relative flex-1 md:w-80">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search specialization (e.g. Cardiology)..."
              value={specialization}
              onChange={(e) => setSpecialization(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-slate-800"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
          >
            Search
          </button>
        </form>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      ) : doctors.length === 0 ? (
        <div className="bg-white text-center py-12 rounded-2xl border border-slate-200/80 p-8 shadow-sm">
          <p className="text-slate-500 font-medium">No doctors found matching that search.</p>
          <button onClick={() => { setSpecialization(''); fetchDoctors(''); }} className="mt-4 text-sm text-primary-600 font-semibold hover:text-primary-700">
            Clear filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {doctors.map((doc) => (
            <div
              key={doc.id}
              className="bg-white rounded-2xl border border-slate-200/60 p-6 flex flex-col justify-between hover:shadow-md hover:border-primary-200 transition-all group"
            >
              <div>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="h-12 w-12 rounded-full bg-primary-50 border border-primary-100 flex items-center justify-center text-primary-600">
                    <User className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 group-hover:text-primary-700 transition-colors">Dr. {doc.user.name}</h3>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                      {doc.specialization}
                    </span>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-4 space-y-2 text-sm text-slate-600">
                  <div className="flex justify-between">
                    <span>Slot Duration:</span>
                    <span className="font-semibold text-slate-800">{doc.slot_duration} minutes</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Working Days:</span>
                    <span className="font-semibold text-slate-800">
                      {doc.working_hours?.length > 0
                        ? `${doc.working_hours.length} days/week`
                        : 'No hours set'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <button
                  onClick={() => navigate(`/patient/book/${doc.id}`)}
                  className="w-full flex items-center justify-center space-x-2 py-2 px-4 border border-transparent rounded-xl text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 group-hover:bg-primary-600 transition-all shadow-sm"
                >
                  <span>Book Appointment</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PatientDoctors;
