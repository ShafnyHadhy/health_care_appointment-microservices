import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function BookingModal({ doctor, onClose }) {

  const navigate = useNavigate();

  const [selectedDate, setSelectedDate] = useState('');
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [loading, setLoading] = useState(false);

  // Use local midnight so "Today" isn't shifted by UTC conversions
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  // Format as YYYY-MM-DD in LOCAL time (avoid toISOString() which uses UTC)
  const formatDate = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  console.log('Doctor in BookingModal:', doctor);

  const fetchSlots = async (date) => {
    try {
      setLoading(true);

      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/appointments/slots?doctorId=${doctor._id}&date=${date}`
      );

      setSlots(res.data.slots);
      setSelectedSlot(null);

      console.log('Fetched slots:', res.data.slots);

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-sm p-4">

      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-black/5">

        {/* Close Button */}
        <button
          onClick={onClose}
          type="button"
          className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition"
          aria-label="Close"
        >
          <X size={18} />
        </button>

        <div className="p-6">
          {/* Doctor Info */}
          <div className="flex items-center gap-4 mb-5">
            <div className="h-14 w-14 rounded-full bg-gray-100 ring-1 ring-gray-200 overflow-hidden flex items-center justify-center">
              <img
                src="/user.png"
                alt="Doctor"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="min-w-0">
              <h2 className="font-bold text-lg text-gray-900 truncate">{doctor.name}</h2>
              <p className="text-sm text-gray-500 truncate">{doctor.specialty}</p>
              {doctor.consultationFee ? (
                <p className="text-xs text-gray-400 mt-0.5">Consultation: {doctor.consultationFee} LKR</p>
              ) : null}
            </div>
          </div>

          {/* Date Selection */}
          <div className="mb-5">
            <p className="text-xs font-semibold text-gray-700 mb-2">Select date</p>
            <div className="flex flex-wrap gap-2">

              <button
                onClick={() => {
                  const d = formatDate(today);
                  setSelectedDate(d);
                  fetchSlots(d);
                }}
                type="button"
                className={`px-3 py-2 rounded-lg text-xs font-semibold transition
                  ${selectedDate === formatDate(today)
                    ? 'bg-primary text-white shadow-sm'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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
                type="button"
                className={`px-3 py-2 rounded-lg text-xs font-semibold transition
                  ${selectedDate === formatDate(tomorrow)
                    ? 'bg-primary text-white shadow-sm'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                Tomorrow
              </button>

              <input
                type="date"
                value={selectedDate}
                min={formatDate(today)}
                onChange={(e) => {
                  const picked = e.target.value;
                  const minDate = formatDate(today);
                  const nextDate = picked && picked < minDate ? minDate : picked;

                  setSelectedDate(nextDate);
                  if (nextDate) fetchSlots(nextDate);
                }}
                className="h-9 rounded-lg border border-gray-200 bg-white px-3 text-xs text-gray-700 shadow-sm outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </div>

          {/* Slots */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-gray-900">Available slots</h3>
              <span className="text-[11px] text-gray-400">30 min</span>
            </div>

            {loading ? (
              <p className="text-xs text-gray-500">Loading slots...</p>
            ) : slots.length === 0 ? (
              <p className="text-xs text-red-500">No slots available</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {slots.map((slot, i) => {
                  const isBooked = slot.status === 'booked';
                  const isSelected = selectedSlot === slot.time;

                  return (
                    <button
                      key={i}
                      type="button"
                      disabled={isBooked}
                      onClick={() => setSelectedSlot(slot.time)}
                      className={`px-3 py-2 rounded-lg text-xs font-semibold transition border
                        ${isBooked ? 'bg-red-50 text-red-600 border-red-100 cursor-not-allowed' : ''}
                        ${!isBooked && !isSelected ? 'bg-gray-50 text-gray-800 border-gray-200 hover:bg-gray-100' : ''}
                        ${isSelected ? 'bg-primary text-white border-primary shadow-sm' : ''}
                      `}
                    >
                      {slot.time}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Legend */}
          <div className="mt-4 flex flex-wrap gap-3 text-[11px] text-gray-500">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-gray-300" />
              Available
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-red-400" />
              Booked
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-primary" />
              Selected
            </span>
          </div>

          {/* Confirm Button */}
          <button
            onClick={handleConfirm}
            type="button"
            disabled={!selectedSlot}
            className="mt-5 w-full rounded-xl bg-primary py-2.5 text-sm font-semibold text-white shadow-sm hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Confirm appointment
          </button>
        </div>
      </div>
    </div>
  );
}