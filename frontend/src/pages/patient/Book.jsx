import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../../services/api';
import { Card, Button, Avatar, EmptyState } from '../../components/UI';
import { Calendar, Clock, AlertCircle, Timer } from 'lucide-react';

const PatientBook = () => {
  const { doctorId } = useParams();
  const navigate = useNavigate();

  const [doctor, setDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [slots, setSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [error, setError] = useState('');
  
  const [heldAppointment, setHeldAppointment] = useState(null);
  const [symptoms, setSymptoms] = useState('');
  const [confirming, setConfirming] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300);

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        const response = await API.get(`doctors/${doctorId}/`);
        setDoctor(response.data);
      } catch (err) {
        console.error("Failed to load doctor profile", err);
        setError("Doctor profile not found.");
      }
    };
    fetchDoctor();
  }, [doctorId]);

  const fetchSlots = async () => {
    if (!selectedDate) return;
    setLoadingSlots(true);
    setError('');
    try {
      const response = await API.get(`doctors/${doctorId}/slots/?date=${selectedDate}`);
      setSlots(response.data);
    } catch (err) {
      console.error("Failed to fetch slots", err);
      setError("Failed to fetch slots for this date.");
    } finally {
      setLoadingSlots(false);
    }
  };

  useEffect(() => {
    fetchSlots();
    setHeldAppointment(null);
  }, [selectedDate, doctorId]);

  useEffect(() => {
    if (!heldAppointment) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setHeldAppointment(null);
          alert("Slot hold expired. Please select a time slot again.");
          fetchSlots();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [heldAppointment]);

  const handleSelectSlot = async (slot) => {
    setError('');
    try {
      const response = await API.post('appointments/', {
        doctor_id: parseInt(doctorId),
        appointment_date: selectedDate,
        start_time: slot.start_time
      });
      
      setHeldAppointment(response.data);
      setTimeLeft(300);
    } catch (err) {
      if (err.response?.status === 409) {
        setError(err.response.data.detail || "This slot was just held by another patient. Please select another slot.");
      } else {
        setError(err.response?.data?.detail || "Failed to hold slot. Please try again.");
      }
      fetchSlots();
    }
  };

  const handleConfirmBooking = async (e) => {
    e.preventDefault();
    if (!symptoms.trim()) {
      setError("Symptom details are mandatory.");
      return;
    }

    setConfirming(true);
    setError('');

    try {
      await API.post(`appointments/${heldAppointment.id}/symptoms/`, {
        symptoms_text: symptoms
      });

      navigate(`/patient/appointments/${heldAppointment.id}`);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to confirm booking.");
      setConfirming(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  if (error && !doctor) {
    return (
      <div className="max-w-2xl mx-auto bg-white dark:bg-slate-800 p-8 rounded-2xl border border-slate-200 dark:border-slate-700 text-center shadow-sm">
        <AlertCircle className="h-10 w-10 text-rose-500 mx-auto mb-4" />
        <p className="text-slate-700 dark:text-slate-200 font-semibold">{error}</p>
        <Button onClick={() => navigate('/patient/doctors')} variant="primary" className="mt-4">
          Back to Doctors
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Profile card */}
      {doctor && (
        <Card className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center space-x-3.5">
            <Avatar name={doctor.user.name} specialization={doctor.specialization} />
            <div>
              <span className="text-[10px] font-bold text-primary-700 dark:text-primary-300 uppercase tracking-widest bg-primary-50 dark:bg-primary-950 px-2 py-0.5 rounded-md border border-primary-100 dark:border-primary-800">
                AyuSetu Multispeciality Clinic
              </span>
              <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-1">Dr. {doctor.user.name}</h1>
              <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">{doctor.specialization} • {doctor.slot_duration} min consult</p>
            </div>
          </div>
        </Card>
      )}

      {error && (
        <div className="bg-rose-50 dark:bg-rose-950/60 border-l-4 border-rose-500 p-4 rounded-xl text-xs font-bold text-rose-800 dark:text-rose-200">
          {error}
        </div>
      )}

      {!heldAppointment ? (
        /* Date Selection & Available Slot Grid */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Column: Date Picker */}
          <Card title="1. Select Date" className="md:col-span-1">
            <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">
              Consultation Date
            </label>
            <input
              type="date"
              value={selectedDate}
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full p-3 theme-input border rounded-xl text-xs font-bold focus:ring-2 focus:ring-primary-500 focus:outline-none"
            />
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-3 leading-relaxed">
              Slots are calculated dynamically based on practitioner hours and scheduled leaves.
            </p>
          </Card>

          {/* Right Column: Available Time Slots */}
          <div className="md:col-span-2">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-3 flex items-center space-x-2">
              <Clock className="h-4.5 w-4.5 text-primary-600 dark:text-primary-400" />
              <span>2. Choose Time Slot ({selectedDate})</span>
            </h3>

            {loadingSlots ? (
              <div className="flex justify-center py-12 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
              </div>
            ) : slots.length === 0 ? (
              <EmptyState
                icon={Calendar}
                title="No Available Slots"
                message="No time slots available for this doctor on the selected date. Doctor may be off or fully booked."
              />
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {slots.map((slot, index) => (
                  <button
                    key={index}
                    disabled={!slot.available}
                    onClick={() => handleSelectSlot(slot)}
                    className={`py-2.5 px-3 text-xs font-bold rounded-xl text-center border transition-all cursor-pointer ${
                      slot.available
                        ? 'border-primary-200 dark:border-primary-800 bg-primary-50/50 dark:bg-primary-950/40 text-primary-700 dark:text-primary-300 hover:bg-primary-600 hover:text-white dark:hover:bg-primary-600 dark:hover:text-white hover:border-transparent'
                        : 'border-slate-200 dark:border-slate-700/60 bg-slate-100 dark:bg-slate-800/40 text-slate-400 dark:text-slate-600 cursor-not-allowed line-through'
                    }`}
                  >
                    {slot.start_time.substring(0, 5)}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Symptom Submission & Hold Timer Screen */
        <Card className="space-y-6">
          <div className="bg-amber-50 dark:bg-amber-950/80 border border-amber-200 dark:border-amber-800 rounded-2xl p-4 flex items-center justify-between shadow-sm">
            <div className="flex items-center space-x-3">
              <Timer className="h-5 w-5 text-amber-600 dark:text-amber-400 animate-pulse shrink-0" />
              <div>
                <p className="text-xs font-bold text-amber-800 dark:text-amber-200 uppercase tracking-wide">Slot Held Safely</p>
                <p className="text-[11px] text-amber-700 dark:text-amber-300 mt-0.5">Your reservation is locked. Please submit your symptoms to confirm.</p>
              </div>
            </div>
            <span className="text-base font-mono font-bold text-amber-700 dark:text-amber-300 bg-white dark:bg-slate-800 border border-amber-200 dark:border-amber-700 px-3 py-1 rounded-xl shadow-sm">
              {formatTime(timeLeft)}
            </span>
          </div>

          <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-4 text-xs font-semibold text-slate-600 dark:text-slate-300 space-y-1">
            <p className="text-slate-400 uppercase tracking-wider text-[10px]">Clinical Slot Details:</p>
            <p className="text-slate-800 dark:text-slate-100 font-bold">
              Dr. {doctor?.user?.name} — {selectedDate} @ {heldAppointment.start_time.substring(0, 5)} - {heldAppointment.end_time.substring(0, 5)} (IST)
            </p>
          </div>

          <form onSubmit={handleConfirmBooking} className="space-y-5">
            <div>
              <label htmlFor="symptoms" className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wide">
                Describe Symptoms & Concerns (Mandatory)
              </label>
              <textarea
                id="symptoms"
                rows={4}
                required
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                placeholder="Example: Fever for 2 days with body ache and mild cough."
                className="w-full p-4 theme-input border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-xs font-medium"
              />
            </div>

            <div className="flex space-x-3 pt-3 border-t border-slate-100 dark:border-slate-700">
              <Button
                variant="secondary"
                onClick={() => setHeldAppointment(null)}
              >
                Change Time
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={confirming}
                className="flex-1"
              >
                {confirming ? 'Confirming Appointment...' : 'Confirm Appointment'}
              </Button>
            </div>
          </form>
        </Card>
      )}
    </div>
  );
};

export default PatientBook;
