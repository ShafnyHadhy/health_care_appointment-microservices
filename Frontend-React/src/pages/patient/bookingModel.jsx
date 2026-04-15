import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Calendar, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function BookingModal({ doctor, onClose }) {

  const navigate = useNavigate();

  const [selectedDate, setSelectedDate] = useState('');
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [loading, setLoading] = useState(false);

  // Generate Today / Tomorrow
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);

  const formatDate = (date) => date.toISOString().split('T')[0];

  console.log('Doctor in BookingModal:', doctor);

  // Fetch slots
  const fetchSlots = async (date) => {
    try {
      setLoading(true);

      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/appointments/slots?doctorId=${doctor._id}&date=${date}`
      );

      setSlots(res.data.slots);
      setSelectedSlot(null);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const todayStr = formatDate(today);
    setSelectedDate(todayStr);
    fetchSlots(todayStr);
  }, []);

  const handleConfirm = () => {
    if (!selectedSlot) return;

    navigate('/confirm-booking', {
      state: {
        doctor: {
            _id: doctor._id,
            name: doctor.name,
            specialty: doctor.specialty,
            consultationFee: doctor.consultationFee
        },
        date: selectedDate,
        timeSlot: selectedSlot
        }
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">

      <div className="bg-white w-full max-w-lg rounded-2xl p-6 shadow-xl relative">

        {/* Close Button */}
        <button onClick={onClose} className="absolute top-4 right-4">
          <X size={18} />
        </button>

        {/* Doctor Info */}
        <div className="flex items-center gap-4 mb-4">
          <img src="/user.jpg" className="w-14 h-14 rounded-full object-cover" />
          <div>
            <h2 className="font-bold text-lg">{doctor.name}</h2>
            <p className="text-sm text-gray-500">{doctor.specialty}</p>
          </div>
        </div>

        {/* Date Selection */}
        <div className="flex gap-2 mb-4">

          <button
            onClick={() => {
              const d = formatDate(today);
              setSelectedDate(d);
              fetchSlots(d);
            }}
            className={`px-3 py-1.5 rounded text-xs font-semibold 
              ${selectedDate === formatDate(today)
                ? 'bg-primary text-white'
                : 'bg-gray-100'
              }`}
          >
            Today
          </button>

          <button
            onClick={() => {
              const d = formatDate(tomorrow);
              setSelectedDate(d);
              fetchSlots(d);
            }}
            className={`px-3 py-1.5 rounded text-xs font-semibold 
              ${selectedDate === formatDate(tomorrow)
                ? 'bg-primary text-white'
                : 'bg-gray-100'
              }`}
          >
            Tomorrow
          </button>

          <input
            type="date"
            value={selectedDate}
            onChange={(e) => {
              setSelectedDate(e.target.value);
              fetchSlots(e.target.value);
            }}
            className="border px-2 py-1 rounded text-xs"
          />
        </div>

        {/* Slots */}
        <div>
          <h3 className="text-sm font-semibold mb-2">Available Slots</h3>

          {loading ? (
            <p className="text-xs text-gray-500">Loading slots...</p>
          ) : slots.length === 0 ? (
            <p className="text-xs text-red-500">No slots available</p>
          ) : (
            <div className="grid grid-cols-3 gap-2">

              {slots.map((slot, i) => (
                <button
                  key={i}
                  disabled={slot.status === 'booked'}
                  onClick={() => setSelectedSlot(slot.time)}
                  className={`p-2 rounded text-xs font-semibold transition
                    ${slot.status === 'booked' && 'bg-red-100 text-red-500 cursor-not-allowed'}
                    ${slot.status === 'available' && 'bg-blue-100 text-blue-700 hover:bg-blue-200'}
                    ${selectedSlot === slot.time && 'bg-green-500 text-white'}
                  `}
                >
                  {slot.time}
                </button>
              ))}

            </div>
          )}
        </div>

        {/* Legend */}
        <div className="flex gap-4 mt-4 text-[11px] text-gray-500">
          <span>🔵 Available</span>
          <span>🔴 Booked</span>
          <span>🟢 Selected</span>
        </div>

        {/* Confirm Button */}
        <button
          onClick={handleConfirm}
          disabled={!selectedSlot}
          className="w-full mt-5 bg-primary text-white py-2 rounded-lg text-sm font-semibold disabled:opacity-50"
        >
          Confirm Appointment
        </button>

      </div>
    </div>
  );
}