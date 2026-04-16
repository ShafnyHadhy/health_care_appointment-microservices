import React, { useEffect, useState } from 'react';
import {
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
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

      setDoctorData(doctorRes.data);
      setAppointments(appointRes.data.data);

      console.log('Doctor Data:', doctorRes.data);
      console.log('Appointments:', appointRes.data.data);

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
    return new Date(a.date) - new Date(b.date);
  });

  const nextAppointment = sortedAppointments.find(a => a.status === 'confirmed') || sortedAppointments[0];

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

  return (
    <div className="bg-neutral min-h-screen py-8">
      <main className="max-w-7xl mx-auto px-6">

        {/* HEADER */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-primary">
            Welcome Dr. {doctorData?.name? doctorData.name.split(' ')[1] : ''}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage your appointments efficiently
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* LEFT SIDE */}
          <section className="lg:col-span-8">

            {/* NEXT APPOINTMENT */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm mb-6">
              <h2 className="text-lg font-semibold mb-4">Next Appointment</h2>

              {nextAppointment ? (
                <>
                  <p className="text-sm text-gray-600 mb-2">
                    Patient: <span className="font-semibold">{nextAppointment.patientName}</span>
                  </p>

                  <div className="flex gap-6 text-sm mb-4">
                    <span className="flex items-center gap-2">
                      <Calendar size={14} />
                      {new Date(nextAppointment.date).toDateString()}
                    </span>
                    <span className="flex items-center gap-2">
                      <Clock size={14} />
                      {nextAppointment.timeSlot}
                    </span>
                  </div>

                  {nextAppointment.status === 'confirmed' && (
                    <button className="bg-primary text-white px-4 py-2 rounded flex items-center gap-2">
                      <Video size={16} />
                      Start Consultation
                    </button>
                  )}
                </>
              ) : (
                <p className="text-gray-500">No appointments yet</p>
              )}
            </div>

            {/* APPOINTMENT LIST */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <h2 className="text-lg font-semibold mb-4">All Appointments</h2>

              <div className="space-y-4">
                {appointments.map(app => (
                  <div
                    key={app._id}
                    className="border border-gray-200 rounded-lg p-4 flex justify-between items-center shadow-sm"
                  >

                    {/* LEFT */}
                    <div>
                      <p className="font-semibold">{app.patientName}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(app.date).toDateString()} • {app.timeSlot}
                      </p>

                      <p className="text-xs text-gray-400 mt-1">
                        {app.reason || 'No reason'}
                      </p>
                    </div>

                    {/* RIGHT */}
                    <div className="flex items-center gap-2">

                      {/* STATUS */}
                      <span className={`text-xs px-4 py-1 rounded-full font-semibold
                        ${app.status === 'accepted' && 'bg-blue-100 text-blue-700'}
                        ${app.status === 'confirmed' && 'bg-green-100 text-green-700'}
                        ${app.status === 'pending' && 'bg-amber-100 text-amber-700'}
                        ${app.status === 'rejected' && 'bg-red-100 text-red-700'}
                        ${app.status === 'cancelled' && 'bg-gray-100 text-gray-700'}
                      `}>
                        {app.status}
                      </span>

                      {/* ACTIONS */}
                      {app.status === 'pending' && (
                        <>
                          <button
                            onClick={() => updateStatus(app._id, 'accepted')}
                            disabled={loadingId === app._id}
                            className="px-6 py-1 bg-green-600 text-white text-xs rounded-lg hover:bg-green-600/80"
                          >
                            Accept
                          </button>

                          <button
                            onClick={() => updateStatus(app._id, 'rejected')}
                            disabled={loadingId === app._id}
                            className="px-6 py-1 bg-red-600 text-white text-xs rounded-lg hover:bg-red-600/80"
                          >
                            Reject
                          </button>
                        </>
                      )}

                    </div>
                  </div>
                ))}
              </div>
            </div>

          </section>

          {/* RIGHT SIDE */}
          <aside className="lg:col-span-4">
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <h3 className="font-semibold mb-4">Quick Stats</h3>

              <div className="space-y-3 text-sm">
                <p>Total Appointments: <b>{appointments.length}</b></p>
                <p>Confirmed: <b>{appointments.filter(a => a.status === 'confirmed').length}</b></p>
                <p>Pending: <b>{appointments.filter(a => a.status === 'pending').length}</b></p>
                <p>Rejected: <b>{appointments.filter(a => a.status === 'rejected').length}</b></p>
              </div>
            </div>
          </aside>

        </div>
      </main>
    </div>
  );
}