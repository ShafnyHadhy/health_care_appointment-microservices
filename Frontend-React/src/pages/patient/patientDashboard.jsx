import React, { useEffect, useState } from 'react';
import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  Mail, 
  LineChart, 
  HelpCircle, 
  LogOut, 
  Home, 
  FileText, 
  UserCircle, 
  Search, 
  Bell, 
  Clock, 
  Video, 
  PlusCircle, 
  CloudUpload, 
  Bot, 
  FlaskConical, 
  Pill, 
  ClipboardCheck, 
  CheckCircle2, 
  Lightbulb, 
  Heart, 
  Wind, 
  Activity, 
  Footprints 
} from 'lucide-react';

import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import AppointmentModal from './appointmentModel';

export default function PatientDashboard() {

  const navigate = useNavigate();
  const [myAppointments, setMyAppointments] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [patientData, setPatientData] = useState(null); // State for patient details

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please log in to access your dashboard');
      navigate('/login');
    }

    const fetchPatientProfile = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/patients/profile`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setPatientData(res.data.data);
      } catch (error) {
        console.error('Error fetching patient profile:', error);
      }
    };

    const fetchMyAppointments = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/appointments`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        const myAppoints = res.data.data;
        setMyAppointments(myAppoints);
        console.log('Fetched appointments:', myAppoints);
      } catch (error) {
        toast.error('Failed to fetch appointments');
        console.error('Error fetching appointments:', error);
      }
    }

    fetchPatientProfile();
    fetchMyAppointments();

  }, []);

  const metrics = [
    { icon: <Heart size={24} />, label: "Heart Rate", val: "72", unit: "BPM" },
    { icon: <Wind size={24} />, label: "Blood Oxygen", val: "98", unit: "%" },
    { icon: <Activity size={24} />, label: "Blood Pressure", val: "120/80", unit: "mmHg" },
    { icon: <Footprints size={24} />, label: "Steps Today", val: "8,432", unit: "steps" },
  ];

  const sortedAppointments = [...myAppointments].sort((a, b) => {
     const dateA = new Date(`${a.date.split('T')[0]}T${a.timeSlot ? a.timeSlot.split(' - ')[0] : '00:00'}`);
     const dateB = new Date(`${b.date.split('T')[0]}T${b.timeSlot ? b.timeSlot.split(' - ')[0] : '00:00'}`);
     return dateA - dateB;
  });

  const activeAppointments = sortedAppointments.filter(app => app.status === 'accepted' || app.status === 'confirmed');

  const nextAppointment = activeAppointments.find(app => {
    const appDateStr = app.date.split('T')[0]; 
    const todayStr = new Date().toISOString().split('T')[0];
    
    if (appDateStr > todayStr) return true; 
    if (appDateStr === todayStr) {

       if (!app.timeSlot) return true; 
       //const startTime = app.timeSlot.split(' - ')[0]; 
       ///const [h, m] = startTime.split(':').map(Number);
       const timeParts = app.timeSlot.split(' - ');
       const endTime = timeParts.length > 1 ? timeParts[1] : timeParts[0];
       const [h, m] = endTime.split(':').map(Number);
       const now = new Date();
       return (h > now.getHours()) || (h === now.getHours() && m > now.getMinutes());
    }
    return false;
  }) || activeAppointments[0]; 

  const canJoinNow = (appointment) => {
    if (!appointment || !appointment.timeSlot) return false;

    if (!['accepted', 'confirmed'].includes(appointment.status)) return false;

    const dateStr = appointment.date.split('T')[0];

    const convertTo24Hour = (time) => {
      const [t, modifier] = time.split(' ');
      let [hours, minutes] = t.split(':');

      if (modifier === 'PM' && hours !== '12') hours = parseInt(hours) + 12;
      if (modifier === 'AM' && hours === '12') hours = '00';

      return `${hours}:${minutes}`;
    };

    const startTimeRaw = appointment.timeSlot.split(' - ')[0];
    const startTime = convertTo24Hour(startTimeRaw);

    const appointmentStart = new Date(`${dateStr}T${startTime}`);
    const now = new Date();

    const diffMinutes = (appointmentStart - now) / (1000 * 60);

    return diffMinutes <= 30 && diffMinutes >= -60;
  };

  const handleJoinSession = async (appointment) => {
    try {
      const token = localStorage.getItem('token');

      let res;

      try {

        res = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/telemedicine/session/${appointment._id}`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );

        console.log('Existing telemedicine session response:', res);

      } catch (err) {
        if ( err.response?.status === 404 ) {

          toast.error("Session not found. Please wait for the doctor to start the session.");

          res = await axios.post(`${import.meta.env.VITE_API_URL}/api/telemedicine/session/create`,
            {
              appointmentId: appointment._id,
              doctorId: appointment.doctorId,
              patientId: appointment.patientId
            },
            {
              headers: { Authorization: `Bearer ${token}` }
            }
          );

          console.log('Created new telemedicine session response:', res);
          
        } else {
          throw err;
        }
      }

      console.log('Telemedicine session response:', res);

      const meetUrl = res.data.data.meetUrl;

      window.open(meetUrl, '_blank');

    } catch (error) {
      console.error(error);
      toast.error("Failed to start session");
    }
  };

  const canJoin = nextAppointment && canJoinNow(nextAppointment);

  return (
    <div className="bg-neutral font-body text-on-surface min-h-screen py-8">
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 pb-24">
        <header className="flex justify-between items-center mb-8">
          <div className="flex flex-col">
            <h2 className="font-headline font-bold text-2xl text-primary tracking-tight">
              Welcome back{patientData?.name ? `, ${patientData.name.split(' ')[0]}` : ''}
            </h2>
            <p className="text-gray-500 text-sm mt-1">Your health dashboard is up to date.</p>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <section className="lg:col-span-8">
            {/* Highlight Card */}
            <div className="bg-white rounded-xl p-6 relative overflow-hidden border border-gray-200 flex flex-col md:flex-row gap-6 items-center shadow-sm">
              <div className="flex-1 z-10">
                <div className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded text-xs font-semibold mb-4">
                  <Clock size={12} />
                  {nextAppointment ? (
                    new Date(nextAppointment.date).toDateString() === new Date().toDateString() 
                      ? "Upcoming Today" 
                      : "Upcoming Appointment"
                  ) : "No Upcoming Appointments"}
                </div>
                <h3 className="font-headline text-2xl font-bold text-gray-900 mb-2">Next Appointment</h3>
                <p className="text-gray-600 text-sm mb-6">
                  {nextAppointment ? (
                    <>Consultation with <span className="font-semibold text-primary">{nextAppointment.doctorName}</span></>
                  ) : "No upcoming appointments scheduled."}
                </p>
                <div className="flex flex-wrap items-center gap-4 md:gap-6 mb-6">
                  <div className="flex items-center gap-2 font-medium text-sm text-gray-700">
                    <Calendar size={16} className="text-primary" /> 
                    {nextAppointment ? new Date(nextAppointment.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : "N/A"}
                  </div>
                  <div className="flex items-center gap-2 font-medium text-sm text-gray-700">
                    <Clock size={16} className="text-primary" /> 
                    {nextAppointment ? nextAppointment.timeSlot : "N/A"}
                  </div>
                </div>
               {nextAppointment && ['accepted','confirmed'].includes(nextAppointment.status) && (
                  canJoin ? (
                    <button
                      onClick={() => handleJoinSession(nextAppointment)}
                      className="text-white px-5 py-2.5 rounded-md font-semibold flex items-center gap-2 shadow-sm text-sm"
                      style={{ background: '#006063' }}
                    >
                      <Video size={16} />
                      Join Video Room
                    </button>
                  ) : (
                    <button
                      disabled
                      className="text-white px-5 py-2.5 rounded-md font-semibold flex items-center gap-2 shadow-sm text-sm opacity-50 cursor-not-allowed"
                      style={{ background: '#006063' }}
                    >
                      <Video size={16} />
                      Join available 30 mins before
                    </button>
                  )
                )}
                {nextAppointment && 
                  !canJoin && 
                  ['accepted', 'confirmed'].includes(nextAppointment.status) && (
                    <span className="text-xs font-medium text-gray-500">
                      You can join 30 minutes before the appointment
                    </span>
                )}
                {nextAppointment && nextAppointment.status !== 'confirmed' && nextAppointment.status !== 'accepted' && (
                  <span className="text-xs font-medium text-amber-600 bg-amber-50 px-3 py-1.5 rounded border border-amber-100 block w-fit">
                    Waiting for doctor confirmation...
                  </span>
                )}
              </div>
              <div className="relative w-full md:w-42 h-42 rounded-full overflow-hidden shrink-0 border border-gray-800">
                <img alt="Doctor" className="w-full h-full object-cover" src="/user.png"/>
              </div>
            </div>

            {/* Shortcut Bento */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-6">
              {[
                { icon: <PlusCircle size={20} />, title: "Book Appointment", desc: "Schedule a new visit", path: "/find-doctor" },
                { icon: <CloudUpload size={20} />, title: "Upload Report", desc: "Share medical files", path: "/patient-dashboard" },
                { icon: <Bot size={20} />, title: "AI Symptom Checker", desc: "Instant health insights", path: "/symptom-checker" }
              ].map((item) => (
                <div 
                  key={item.title} 
                  onClick={() => navigate(item.path)}
                  className="bg-white border border-gray-200 hover:border-primary/40 transition-colors p-5 rounded-lg group cursor-pointer shadow-sm active:scale-[0.98]"
                >
                  <div className="w-10 h-10 bg-primary/5 rounded-md flex items-center justify-center text-primary mb-3">
                    {item.icon}
                  </div>
                  <h4 className="font-headline font-semibold text-sm text-gray-900 mb-1">{item.title}</h4>
                  <p className="text-xs text-gray-500">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Activity Sidebar */}
          <aside className="lg:col-span-4">
            <div className="bg-white border border-gray-200 rounded-xl p-6 h-full shadow-sm max-h-125 overflow-y-auto hover:scrollbar-thin">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-headline font-semibold text-lg text-gray-900">My Appointments</h3>
              </div>
              <div className="space-y-6 relative">
                {myAppointments.length > 0 ? (
                  myAppointments.map((app, i) => {
                    const appDate = new Date(app.date);
                    const isUpcoming = appDate >= new Date();
                    
                    return (
                      <div key={i} className="relative flex gap-4 p-3 border border-gray-100 rounded-lg hover:border-primary/30 transition-colors shadow-sm">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20">
                           <Calendar size={16} className="text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start gap-2">
                             <p className="text-sm font-bold text-gray-900 truncate">{app.doctorName}</p>
                             <span className={`shrink-0 text-[10px] font-bold px-3 py-0.5 rounded-full uppercase tracking-wider ${
                                app.status === 'accepted' ? 'bg-blue-100 text-blue-700' :
                                app.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                                app.status === 'cancelled' ? 'bg-amber-100 text-amber-700' :
                                app.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                                app.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                'bg-gray-100 text-gray-700'
                             }`}>
                               {app.status}
                             </span>
                          </div>
                          
                          <p className="text-[11px] text-gray-500 mt-1 uppercase tracking-wide font-semibold flex items-center gap-1.5">
                            <Clock size={10} className="shrink-0" /> 
                            {appDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} at {app.timeSlot}
                          </p>
                          <div className="flex justify-between items-center mt-1.5 pt-1.5 border-t border-gray-100">
                            <p className="text-xs text-gray-600 leading-relaxed truncate pr-2">
                              <span className="font-semibold text-gray-500">Reason:</span> {app.reason || 'Routine Checkup'}
                            </p>
                            <button 
                              onClick={() => setSelectedAppointment(app)}
                              className="text-primary text-[10px] font-bold uppercase tracking-wider hover:underline shrink-0"
                            >
                              View
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8">
                     <Calendar className="mx-auto text-gray-300 mb-2" size={32} />
                     <p className="text-sm text-gray-500">No appointments found.</p>
                  </div>
                )}
              </div>
              
              <div className="mt-8 bg-primary/5 border border-primary/10 p-5 rounded-md relative overflow-hidden">
                <div className="relative z-10 text-gray-800">
                  <h4 className="font-semibold text-sm flex items-center gap-2 mb-1.5">
                    <Lightbulb size={16} className="text-primary" /> Pro-Tip
                  </h4>
                  <p className="text-xs leading-relaxed opacity-90">Keep your insurance card handy for your appointment today to ensure a smooth check-in process.</p>
                </div>
              </div>
            </div>
          </aside>
        </div>

        {/* Vital Metrics */}
        <section className="mt-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {metrics.map((m) => (
              <div key={m.label} className="bg-white p-5 rounded-lg border border-gray-200 flex items-center gap-4 shadow-sm hover:border-primary/20 transition-colors">
                <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  {React.cloneElement(m.icon, { size: 18 })}
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">{m.label}</p>
                  <p className="text-lg font-bold text-gray-900">{m.val} <span className="text-xs font-medium text-gray-500">{m.unit}</span></p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {selectedAppointment && (
          <AppointmentModal
            appointment={selectedAppointment}
            onClose={() => setSelectedAppointment(null)}
            refresh={() => {
              // re-fetch appointments
              window.location.reload(); // quick way (later optimize)
            }}
          />
        )}
      </main>
    </div>
  );
}