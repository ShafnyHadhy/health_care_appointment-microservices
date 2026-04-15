import React, { useState } from 'react';
import axios from 'axios';
import { X, Calendar, Clock, ClipboardType, CreditCard, ChevronRight, AlertCircle, RefreshCcw } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AppointmentModal({ appointment, onClose, refresh }) {


  console.log('Received appointment in AppointmentModal:', appointment);

  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem('token');

  const handleCancel = async () => {
    try {
      setLoading(true);

      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/appointments/${appointment._id}/cancel`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      toast.success('Appointment cancelled');
      refresh(); // reload appointments
      onClose();

    } catch (err) {
      toast.error('Cancel failed');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    try {
      setLoading(true);

      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/appointments/${appointment._id}/pay`
      );

      toast.success('Payment successful 🎉');
      refresh();
      onClose();

    } catch (err) {
      toast.error('Payment failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-in fade-in duration-200">

      <div className="bg-white w-full max-w-md rounded-xl shadow-2xl relative flex flex-col max-h-[90vh] overflow-hidden">

        {/* Header Section */}
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h2 className="text-base font-bold text-gray-900 font-headline">Appointment Details</h2>
          <button 
            onClick={onClose} 
            className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto p-scrollbar">

          {/* Doctor Info Card */}
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 overflow-hidden shrink-0">
                <img src="/user.png" alt="Doctor" className="w-full h-full object-cover" />
              </div>
              <div>
                <p className="font-bold text-gray-900 text-sm">{appointment.doctorName}</p>
                <p className="text-[11px] font-semibold text-primary uppercase tracking-wide opacity-90">{appointment.specialty || 'General Practitioner'}</p>
              </div>
            </div>
            
            {/* Status Badge */}
            <div className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border shrink-0 ${
              appointment.status === 'accepted' ? 'bg-blue-50 text-blue-700 border-green-100' :
              appointment.status === 'rejected' ? 'bg-red-50 text-red-700 border-red-100' :
              appointment.status === 'confirmed' ? 'bg-green-50 text-green-700 border-green-100' :
              appointment.status === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-100' :
              appointment.status === 'cancelled' ? 'bg-red-50 text-red-700 border-red-100' :
              'bg-gray-50 text-gray-700 border-gray-200'
            }`}>
              {appointment.status}
            </div>
          </div>

          <div className="space-y-4">
            
            {/* Time & Date Block */}
            <div className="bg-gray-50/80 p-4 rounded-xl border border-gray-100 flex gap-4">
              <div className="flex-1">
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5"><Calendar size={12} /> Date</p>
                <p className="font-semibold text-gray-900 text-sm">
                  {new Date(appointment.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
              <div className="w-px bg-gray-200" />
              <div className="flex-1">
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5"><Clock size={12} /> Time</p>
                <p className="font-semibold text-gray-900 text-sm">{appointment.timeSlot}</p>
              </div>
            </div>

            {/* General Details */}
            <div className="border border-gray-100 rounded-xl divide-y divide-gray-100">
              
              <div className="p-4 flex gap-3">
                <div className="mt-0.5"><ClipboardType size={16} className="text-gray-400" /></div>
                <div className="min-w-0">
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-0.5">Reason for Visit</p>
                  <p className="text-sm text-gray-800 leading-relaxed text-wrap wrap-break-word">{appointment.reason || 'No specific reason provided.'}</p>
                </div>
              </div>

              <div className="p-4 flex gap-3">
                <div className="mt-0.5"><CreditCard size={16} className="text-gray-400" /></div>
                <div className="flex-1 flex justify-between items-center min-w-0">
                  <div>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-0.5">Consultation Fee</p>
                    <p className="text-sm font-semibold text-gray-900">Rs. {appointment.consultationFee}</p>
                  </div>
                  {appointment.isPaid ? (
                    <span className="text-[10px] bg-green-100 text-green-700 font-bold px-2 py-0.5 rounded uppercase tracking-wider">Paid</span>
                  ) : (
                    <span className="text-[10px] bg-gray-100 text-gray-600 font-bold px-2 py-0.5 rounded uppercase tracking-wider">Unpaid</span>
                  )}
                </div>
              </div>

            </div>

          </div>

          {/* Alert Message for pending/cancelled */}
          {appointment.status === 'pending' && (
             <div className="mt-5 bg-amber-50 border border-amber-100 rounded-lg p-3 flex gap-2.5 items-start">
               <AlertCircle size={14} className="text-amber-600 mt-0.5 shrink-0" />
               <p className="text-[11px] text-amber-800 leading-relaxed">
                 This appointment is awaiting confirmation from the doctor. You will be notified once it is accepted.
               </p>
             </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="p-5 border-t border-gray-100 bg-gray-50/30 flex gap-3">
          {appointment.status !== 'cancelled' && appointment.status !== 'rejected' && appointment.status !== 'confirmed' && (
            <button
              onClick={handleCancel}
              disabled={loading}
              className="flex-1 py-2.5 rounded-lg border border-red-200 text-red-600 text-xs font-bold hover:bg-red-50 hover:border-red-300 transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              {loading ? <RefreshCcw size={14} className="animate-spin" /> : 'Cancel Booking'}
            </button>
          )}

          {!appointment.isPaid && appointment.status !== 'cancelled' && appointment.status !== 'rejected' && (
            <button
              onClick={handlePayment}
              disabled={loading || appointment.status === 'pending'} // Prevent payment if pending
              className={`flex-[1.5] py-2.5 rounded-lg text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5
                ${appointment.status === 'pending' 
                  ? 'bg-gray-300 cursor-not-allowed shadow-none' 
                  : 'bg-primary hover:bg-primary/90 hover:shadow-primary/30 active:scale-[0.98]'
                }
              `}
            >
              {loading ? <RefreshCcw size={14} className="animate-spin text-white" /> : (
                <>Pay Rs. {appointment.consultationFee} <ChevronRight size={14} /></>
              )}
            </button>
          )}
          
          {/* If everything is done or cancelled, show a close button to fill the space cleanly */}
          {(appointment.status === 'cancelled' || (appointment.isPaid && appointment.status !== 'pending') || appointment.status === 'rejected') && (
            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-lg bg-gray-100 text-gray-700 text-xs font-bold hover:bg-gray-200 transition-colors"
            >
              Close Window
            </button>
          )}
        </div>

      </div>
    </div>
  );
}