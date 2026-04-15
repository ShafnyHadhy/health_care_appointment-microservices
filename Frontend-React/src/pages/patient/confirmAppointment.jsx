import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Calendar, Clock, User, Stethoscope } from 'lucide-react';

export default function ConfirmBooking() {

  const { state } = useLocation();
  const navigate = useNavigate();

  const { doctor, date, timeSlot } = state || {};

  console.log('Received state in ConfirmBooking:', state);
  console.log('Doctor Details:', doctor);
  console.log('Date:', date);
  console.log('Time Slot:', timeSlot);

  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  if (!doctor || !date || !timeSlot) {
    return (
      <div className="p-10 text-center">
        <p className="text-red-500 font-semibold">Invalid booking data</p>
      </div>
    );
  }

  const handleConfirm = async () => {
    try {
      if (!reason) {
        toast.error('Please enter a reason');
        return;
      }

      setLoading(true);

      const token = localStorage.getItem('token');

      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/appointments/book`,
        {
          doctorId: doctor._id,
          date,
          timeSlot: timeSlot,
          reason
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      toast.success('Appointment booked successfully!');

      navigate('/patient-dashboard'); // or success page

    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 px-4 py-8 md:px-8 md:py-12">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 font-headline tracking-tight">
            Confirm Your Appointment
          </h1>
          <p className="text-gray-500 mt-2 text-sm">
            Please review the details below and state the reason for your visit.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Left Column: Doctor & Appointment Summary */}
          <div className="flex-1 space-y-6">
            <div className="bg-white rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-gray-100 p-6">
              <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-6">Doctor Details</h2>
              
              <div className="flex items-start gap-4 pb-6 border-b border-gray-100">
                <img
                  src="/user.jpg"
                  alt={doctor.name}
                  className="w-20 h-20 rounded-full object-cover border border-gray-200 shadow-sm"
                />
                <div className="mt-1">
                  <h2 className="text-lg font-bold text-gray-900 font-headline">{doctor.name}</h2>
                  <p className="text-primary font-medium text-sm drop-shadow-sm">{doctor.specialty}</p>
                  <div className="mt-2 flex items-center gap-1.5 bg-green-50 w-fit px-2 py-0.5 rounded text-xs font-bold text-green-700 border border-green-100">
                    <Calendar size={12} />
                    Available Today
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                <div className="bg-gray-50/80 p-4 rounded-xl border border-gray-100">
                  <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest flex items-center gap-1"><Calendar size={12} /> Date</p>
                  <p className="font-semibold text-gray-900 mt-1">{new Date(date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
                <div className="bg-gray-50/80 p-4 rounded-xl border border-gray-100">
                  <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest flex items-center gap-1"><Clock size={12} /> Time</p>
                  <p className="font-semibold text-gray-900 mt-1">{timeSlot}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Reason & Payment/Actions */}
          <div className="w-full lg:w-100 xl:w-112.5 shrink-0 space-y-6">
            
            <div className="bg-white rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-gray-100 p-6">
               <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-5 flex items-center gap-2">
                 <Stethoscope size={16} /> 
                 Consultation Details
               </h2>
               
               <div className="space-y-4">
                 <div>
                    <label className="text-sm font-bold text-gray-700 block mb-2">
                      Reason for Visit <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows={4}
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none transition-all text-sm resize-none placeholder:text-gray-400"
                      placeholder="Briefly describe your symptoms or reason for consultation..."
                    />
                 </div>
               </div>
            </div>

            <div className="bg-primary/5 rounded-2xl border border-primary/20 p-6">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-gray-600 font-semibold font-headline">Consultation Fee</span>
                  <span className="text-xl font-bold text-primary">Rs. {doctor.consultationFee}</span>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => navigate(-1)}
                    className="flex-1 py-3 px-4 rounded-xl border-2 border-gray-200 text-gray-600 font-bold hover:bg-white hover:border-gray-300 transition-colors"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={handleConfirm}
                    disabled={loading}
                    className="flex-[1.5] py-3 px-4 rounded-xl bg-primary text-white font-bold hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/30 transition-all active:scale-[0.98] disabled:opacity-70 disabled:pointer-events-none flex items-center justify-center gap-2"
                  >
                    {loading ? (
                       <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : 'Confirm Booking'}
                  </button>
                </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}