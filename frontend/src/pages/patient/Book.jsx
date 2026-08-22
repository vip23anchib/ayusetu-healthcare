import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../../services/api';
import { Calendar, Clock, AlertCircle, ShieldAlert, Timer } from 'lucide-react';

const PatientBook = () => {
  const { doctorId } = useParams();
  const navigate = useNavigate();

  const [doctor, setDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState(() => {
    // Tomorrow as default date string YYYY-MM-DD
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [slots, setSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [error, setError] = useState('');
  
  // Hold state
  const [heldAppointment, setHeldAppointment] = useState(null);
  const [symptoms, setSymptoms] = useState('');
  const [confirming, setConfirming] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds

  // Fetch doctor details
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

  // Fetch available slots
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
    // Reset hold if date changes
    setHeldAppointment(null);
  }, [selectedDate, doctorId]);

  // Hold Timer logic
  useEffect(() => {
    if (!heldAppointment) return;
    
    setTimeLeft(300);
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setHeldAppointment(null);
          setError("Your 5-minute slot hold has expired. Please select a new slot.");
          fetchSlots();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
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
    } catch (err) {
      const errMsg = err.response?.data?.detail || "Could not hold slot. It may have just been booked.";
      setError(errMsg);
      fetchSlots(); // Refresh availability
    }
  };

  const handleConfirmBooking = async (e) => {
    e.preventDefault();
    if (!symptoms.trim()) {
      setError("Please describe your symptoms before confirming.");
      return;
    }
    setConfirming(true);
    setError('');
    try {
      await API.post(`appointments/${heldAppointment.id}/symptoms/`, {
        symptoms_text: symptoms
      });
      // Redirect to appointments list with success status
      navigate('/patient/appointments', { state: { successMessage: "Appointment booked and confirmed successfully!" } });
    } catch (err) {
      const errMsg = err.response?.data?.detail || "Confirmation failed. Please try again.";
      setError(errMsg);
      setConfirming(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Profile */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-xs font-semibold text-primary-600 uppercase tracking-wider">Book Consultation</span>
          <h1 className="text-2xl font-bold text-slate-800 mt-1">
            {doctor ? `Dr. ${doctor.user?.name}` : 'Loading Doctor...'}
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">{doctor?.specialization}</p>
        </div>
        <div className="text-sm bg-slate-100 px-3 py-1.5 rounded-lg text-slate-700">
          Slot duration: <span className="font-semibold">{doctor?.slot_duration} minutes</span>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-xl flex items-start space-x-2">
          <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {!heldAppointment ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Calendar Date Picker */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm h-fit">
            <h3 className="font-semibold text-slate-800 mb-4 flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-primary-600" />
              <span>Select Date</span>
            </h3>
            <input
              type="date"
              value={selectedDate}
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-800 text-sm font-medium"
            />
          </div>

          {/* Time Slots Picker */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm md:col-span-2">
            <h3 className="font-semibold text-slate-800 mb-4 flex items-center space-x-2">
              <Clock className="h-5 w-5 text-primary-600" />
              <span>Available Times</span>
            </h3>

            {loadingSlots ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
              </div>
            ) : slots.length === 0 ? (
              <p className="text-sm text-slate-500 py-6 text-center">No working hours or available slots found for this date.</p>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {slots.map((slot, index) => (
                  <button
                    key={index}
                    disabled={!slot.available}
                    onClick={() => handleSelectSlot(slot)}
                    className={`py-2 px-3 text-xs font-semibold rounded-xl text-center border transition-all ${
                      slot.available
                        ? 'border-primary-100 bg-primary-50/30 text-primary-700 hover:bg-primary-600 hover:text-white hover:border-transparent'
                        : 'border-slate-100 bg-slate-50 text-slate-400 cursor-not-allowed line-through'
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
        <div className="bg-white rounded-2xl border border-slate-200/80 p-8 shadow-sm space-y-6">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <Timer className="h-5 w-5 text-amber-600 animate-pulse" />
              <div>
                <p className="text-sm font-bold text-amber-800">Slot Held Temporarily</p>
                <p className="text-xs text-amber-700 mt-0.5">Please submit your symptoms before the hold timer expires.</p>
              </div>
            </div>
            <span className="text-lg font-mono font-bold text-amber-700 bg-white border border-amber-100 px-3 py-1 rounded-lg">
              {formatTime(timeLeft)}
            </span>
          </div>

          <div>
            <h3 className="font-semibold text-slate-800 mb-1">Appointment Summary</h3>
            <p className="text-sm text-slate-500">
              Date: <span className="font-semibold text-slate-800">{selectedDate}</span> at{' '}
              <span className="font-semibold text-slate-800">{heldAppointment.start_time} - {heldAppointment.end_time}</span>
            </p>
          </div>

          <form onSubmit={handleConfirmBooking} className="space-y-4">
            <div>
              <label htmlFor="symptoms" className="block text-sm font-semibold text-slate-700 mb-2">
                Describe Your Symptoms & Medical Concerns (Mandatory)
              </label>
              <textarea
                id="symptoms"
                rows={4}
                required
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                placeholder="Example: I have been experiencing dull chest pains after jogging for the past 3 days. It usually lasts 5 minutes and subsides with rest."
                className="w-full p-4 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-800 text-sm shadow-inner"
              />
            </div>

            <div className="flex space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setHeldAppointment(null)}
                className="px-6 py-2.5 border border-slate-200 text-slate-700 text-sm font-semibold rounded-xl hover:bg-slate-50 transition-all"
              >
                Change Slot
              </button>
              <button
                type="submit"
                disabled={confirming}
                className="flex-1 py-2.5 px-6 bg-primary-600 hover:bg-primary-700 text-white text-sm font-bold rounded-xl shadow-md transition-all disabled:opacity-50"
              >
                {confirming ? 'Confirming Appointment...' : 'Confirm Appointment'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default PatientBook;
