import React, { useEffect, useState } from 'react';
import {
  Calendar,
  Clock,
  Video
} from 'lucide-react';

import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function DoctorAppointments() {

  const navigate = useNavigate();

  const [appointments, setAppointments] = useState([]);
  const [doctorData, setDoctorData] = useState(null);
  const [loadingId, setLoadingId] = useState(null);

  const token = localStorage.getItem('token');

  const convertTo24Hour = (time) => {
    if (!time) return "00:00";

    if (time.includes("AM") || time.includes("PM")) {
      const [t, modifier] = time.split(' ');
      let [hours, minutes] = t.split(':');

      if (modifier === 'PM' && hours !== '12') hours = parseInt(hours) + 12;
      if (modifier === 'AM' && hours === '12') hours = '00';

      return `${hours}:${minutes}`;
    }

    return time;
  };

  const fetchData = async () => {
    try {
      const [doctorRes, appointRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL}/api/doctors/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${import.meta.env.VITE_API_URL}/api/appointments`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      setDoctorData(doctorRes.data.data);
      setAppointments(appointRes.data.data);

    } catch (err) {
      toast.error('Failed to load dashboard');
    }
  };

  useEffect(() => {
    if (!token) {
      toast.error('Please login');
      navigate('/login');
    }
    fetchData();
  }, []);

  const sortedAppointments = [...appointments].sort((a, b) => {
    const timeA = convertTo24Hour(a.timeSlot?.split(' - ')[0]);
    const timeB = convertTo24Hour(b.timeSlot?.split(' - ')[0]);

    const dateA = new Date(`${a.date.split('T')[0]}T${timeA}`);
    const dateB = new Date(`${b.date.split('T')[0]}T${timeB}`);

    return dateA - dateB;
  });

  const activeAppointments = sortedAppointments.filter(
    app => ['accepted', 'confirmed'].includes(app.status)
  );

  const nextAppointment = activeAppointments.find(app => {
    const dateStr = app.date.split('T')[0];
    const startTimeRaw = app.timeSlot?.split(' - ')[0];
    const startTime = convertTo24Hour(startTimeRaw);

    const appointmentStart = new Date(`${dateStr}T${startTime}`);
    return appointmentStart > new Date();
  }) || activeAppointments[0];

  const canStartNow = (appointment) => {
    if (!appointment || !appointment.timeSlot) return false;
    if (!['accepted', 'confirmed'].includes(appointment.status)) return false;

    const dateStr = appointment.date.split('T')[0];
    const startTimeRaw = appointment.timeSlot.split(' - ')[0];
    const startTime = convertTo24Hour(startTimeRaw);

    const appointmentStart = new Date(`${dateStr}T${startTime}`);
    const now = new Date();

    const diffMinutes = (appointmentStart - now) / (1000 * 60);

    return diffMinutes <= 30 && diffMinutes >= -60;
  };

  const canStart = nextAppointment && canStartNow(nextAppointment);

  const updateStatus = async (id, status) => {
    try {
      setLoadingId(id);

      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/doctors/appointments/${id}/status`,
        { status },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      toast.success(`Appointment ${status}`);
      fetchData();

    } catch (err) {
      toast.error('Action failed');
    } finally {
      setLoadingId(null);
    }
  };

  const handleStartSession = async (appointment) => {
    try {
      let res;

      try {
        res = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/telemedicine/session/${appointment._id}`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );

        toast.success('Session found, joining...');

      } catch (err) {

        if (err.response?.status === 404) {
          res = await axios.post(
            `${import.meta.env.VITE_API_URL}/api/telemedicine/session/create`,
            {
              appointmentId: appointment._id,
              doctorId: appointment.doctorId,
              patientId: appointment.patientId
            },
            {
              headers: { Authorization: `Bearer ${token}` }
            }
          );
        } else {
          throw err;
        }
      }

      const meetUrl = res.data.data.meetUrl;
      window.open(meetUrl, '_blank');

    } catch (err) {
      toast.error("Failed to start session");
    }
  };

  return (
    <div className="bg-neutral font-body text-on-surface min-h-screen py-8">
      <main className="max-w-7xl mx-auto px-4 md:px-8 pb-24">

        {/* HEADER */}
        <header className="flex justify-between items-center mb-8">
          <div className="flex flex-col">
            <h2 className="font-headline font-bold text-2xl text-primary tracking-tight">
              Welcome, Dr. {doctorData?.name ? doctorData.name.split(' ')[1] : ''}
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              Manage your appointments and consultations efficiently.
            </p>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* LEFT */}
          <section className="lg:col-span-8 flex flex-col gap-6">

            {/* NEXT APPOINTMENT */}
            <div className="bg-white rounded-xl p-6 relative overflow-hidden border border-gray-200 shadow-sm">
              <div className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded text-xs font-semibold mb-4">
                  <Clock size={12} />
                  Up Next
              </div>
              <h3 className="font-headline font-semibold text-lg text-gray-900 mb-4">Upcoming Consultation</h3>

              {nextAppointment ? (
                <>
                  <p className="text-gray-600 text-sm mb-4">
                    Patient: <span className="font-semibold text-primary">{nextAppointment.patientName}</span>
                  </p>

                  <div className="flex flex-wrap items-center gap-4 md:gap-6 mb-6">
                    <div className="flex items-center gap-2 font-medium text-sm text-gray-700">
                      <Calendar size={16} className="text-primary" />
                      {new Date(nextAppointment.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                    <div className="flex items-center gap-2 font-medium text-sm text-gray-700">
                      <Clock size={16} className="text-primary" />
                      {nextAppointment.timeSlot}
                    </div>
                  </div>

                  {['accepted','confirmed'].includes(nextAppointment.status) && (
                    canStart ? (
                      <button 
                        onClick={() => handleStartSession(nextAppointment)}
                        className="text-white px-5 py-2.5 rounded-md font-semibold flex items-center w-fit gap-2 shadow-sm transition-all active:scale-95 text-sm"
                        style={{ background: '#006063' }}
                      >
                        <Video size={16} />
                        Start Consultation
                      </button>
                    ) : (
                      <button 
                        disabled
                        className="text-white px-5 py-2.5 rounded-md font-semibold flex items-center w-fit gap-2 shadow-sm text-sm opacity-50 cursor-not-allowed"
                        style={{ background: '#006063' }}
                      >
                        <Video size={16} />
                        Join available 30 mins before
                      </button>
                    )
                  )}
                </>
              ) : (
                <p className="text-sm text-gray-500">No upcoming appointments found.</p>
              )}
            </div>

            {/* LIST */}
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <h3 className="font-headline font-semibold text-lg text-gray-900 mb-6">All Appointments</h3>

              <div className="space-y-4 relative">
                {appointments.length > 0 ? appointments.map(app => (
                  <div key={app._id} className="relative flex flex-col md:flex-row gap-4 p-4 border border-gray-100 rounded-lg hover:border-primary/30 transition-colors shadow-sm justify-between items-start md:items-center">

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-bold text-sm text-gray-900 truncate">{app.patientName}</p>
                        <span className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider
                          ${app.status === 'accepted' ? 'bg-blue-100 text-blue-700' : ''}
                          ${app.status === 'confirmed' ? 'bg-green-100 text-green-700' : ''}
                          ${app.status === 'pending' ? 'bg-amber-100 text-amber-700' : ''}
                          ${app.status === 'rejected' ? 'bg-red-100 text-red-700' : ''}
                          ${app.status === 'cancelled' ? 'bg-gray-100 text-gray-700' : ''}
                          ${app.status === 'completed' ? 'bg-blue-100 text-blue-700' : ''}
                        `}>
                          {app.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-500 uppercase tracking-wide font-semibold flex items-center gap-1.5 mb-1.5">
                        <Calendar size={10} className="shrink-0" />
                        {new Date(app.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} • {app.timeSlot}
                      </p>
                      <p className="text-xs text-gray-600 leading-relaxed truncate">
                        <span className="font-semibold text-gray-500">Reason:</span> {app.reason || 'No reason provided'}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 shrink-0 w-full md:w-auto mt-2 md:mt-0">
                      {app.status === 'pending' && (
                        <>
                          <button
                            onClick={() => updateStatus(app._id, 'accepted')}
                            disabled={loadingId === app._id}
                            className="px-4 py-1.5 bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 text-xs font-semibold rounded-md transition-colors disabled:opacity-50"
                          >
                            Accept
                          </button>

                          <button
                            onClick={() => updateStatus(app._id, 'rejected')}
                            disabled={loadingId === app._id}
                            className="px-4 py-1.5 bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 text-xs font-semibold rounded-md transition-colors disabled:opacity-50"
                          >
                            Reject
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-8">
                     <p className="text-sm text-gray-500">No appointments scheduled.</p>
                  </div>
                )}
              </div>
            </div>

          </section>

          {/* RIGHT */}
          <aside className="lg:col-span-4">
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <h3 className="font-headline font-semibold text-lg text-gray-900 mb-6">Quick Stats</h3>

              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <span className="text-sm text-gray-600 font-medium">Total</span>
                  <span className="text-sm font-bold text-gray-900">{appointments.length}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg border border-green-100">
                  <span className="text-sm text-green-700 font-medium">Confirmed</span>
                  <span className="text-sm font-bold text-green-800">{appointments.filter(a => a.status === 'confirmed').length}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <span className="text-sm text-blue-700 font-medium">Accepted</span>
                  <span className="text-sm font-bold text-blue-800">{appointments.filter(a => a.status === 'accepted').length}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-amber-50 rounded-lg border border-amber-100">
                  <span className="text-sm text-amber-700 font-medium">Pending</span>
                  <span className="text-sm font-bold text-amber-800">{appointments.filter(a => a.status === 'pending').length}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg border border-red-100">
                  <span className="text-sm text-red-700 font-medium">Rejected/Cancelled</span>
                  <span className="text-sm font-bold text-red-800">{appointments.filter(a => ['rejected', 'cancelled'].includes(a.status)).length}</span>
                </div>
              </div>
            </div>
          </aside>

        </div>
      </main>
    </div>
  );
}