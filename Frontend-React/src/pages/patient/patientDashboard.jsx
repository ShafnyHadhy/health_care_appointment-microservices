import React from 'react';
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

export default function PatientDashboard() {
  const activityItems = [
    { 
      icon: <FlaskConical size={18} className="text-primary" />, 
      title: "Lab Results Updated", 
      desc: "Metabolic panel from General Hospital is now available.", 
      time: "2 Hours Ago" 
    },
    { 
      icon: <Pill size={18} className="text-primary" />, 
      title: "Prescription Renewed", 
      desc: "Dr. Sarah Jenkins approved your request for Vitamin D3.", 
      time: "Yesterday" 
    },
    { 
      icon: <UserCircle size={18} className="text-primary" />, 
      title: "Profile Information Changed", 
      desc: "Your emergency contact was updated successfully.", 
      time: "3 Days Ago" 
    },
    { 
      icon: <CheckCircle2 size={18} className="text-primary" />, 
      title: "Health Assessment Complete", 
      desc: "The annual wellness survey has been logged to your records.", 
      time: "Oct 24" 
    },
  ];

  const metrics = [
    { icon: <Heart size={24} />, label: "Heart Rate", val: "72", unit: "BPM" },
    { icon: <Wind size={24} />, label: "Blood Oxygen", val: "98", unit: "%" },
    { icon: <Activity size={24} />, label: "Blood Pressure", val: "120/80", unit: "mmHg" },
    { icon: <Footprints size={24} />, label: "Steps Today", val: "8,432", unit: "steps" },
  ];

  return (
    <div className="bg-neutral font-body text-on-surface min-h-screen py-8">
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 pb-24">
        <header className="flex justify-between items-center mb-8">
          <div className="flex flex-col">
            <h2 className="font-headline font-bold text-2xl text-primary tracking-tight">Welcome back, Alex</h2>
            <p className="text-gray-500 text-sm mt-1">Your health dashboard is up to date.</p>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <section className="lg:col-span-8">
            {/* Highlight Card */}
            <div className="bg-white rounded-lg p-6 relative overflow-hidden border border-gray-200 flex flex-col md:flex-row gap-6 items-center shadow-sm">
              <div className="flex-1 z-10">
                <div className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded text-xs font-semibold mb-4">
                  <Clock size={12} />
                  Upcoming Today
                </div>
                <h3 className="font-headline text-2xl font-bold text-gray-900 mb-2">Next Appointment</h3>
                <p className="text-gray-600 text-sm mb-6">Consultation with <span className="font-semibold text-primary">Dr. Sarah Jenkins</span></p>
                <div className="flex items-center gap-6 mb-6">
                  <div className="flex items-center gap-2 font-medium text-sm text-gray-700">
                    <Calendar size={16} className="text-primary" /> Today
                  </div>
                  <div className="flex items-center gap-2 font-medium text-sm text-gray-700">
                    <Clock size={16} className="text-primary" /> 2:00 PM
                  </div>
                </div>
                <button className="text-white px-5 py-2.5 rounded-md font-semibold flex items-center gap-2 shadow-sm transition-all active:scale-95 text-sm"
                        style={{ background: '#006063' }}>
                  <Video size={16} />
                  Join Video Room
                </button>
              </div>
              <div className="relative w-full md:w-56 h-48 rounded-md overflow-hidden shrink-0 border border-gray-100">
                <img alt="Dr. Sarah Jenkins" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD-M9Qi2E_J56XpWqQV8oWO1W4IgqEhRsdQF1ugv6D4PfhA3oY4qjiWSMJVPrqkxbVYXfrRfH7jpmJVxCQMZXUFJfmVOrfCI9RyPNOaiFtmvUJ-q6zbdwV1M0yyIcSrn6fT2dcdazwz5P1AB6LGWPN1DX6hx-ezhXtlAyQGkwXAQBjeSsgEjfyBty6B9lpvLEKDizNsW-omf_Wbyci4zJxE5jNTOGEZkTPdoOzOnk-7LHvcEdpjzQWQrIwUr15fdCHoII7iI16T9EI"/>
              </div>
            </div>

            {/* Shortcut Bento */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-6">
              {[
                { icon: <PlusCircle size={20} />, title: "Book Appointment", desc: "Schedule a new visit" },
                { icon: <CloudUpload size={20} />, title: "Upload Report", desc: "Share medical files" },
                { icon: <Bot size={20} />, title: "AI Symptom Checker", desc: "Instant health insights" }
              ].map((item) => (
                <div key={item.title} className="bg-white border border-gray-200 hover:border-primary/40 transition-colors p-5 rounded-lg group cursor-pointer shadow-sm">
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
            <div className="bg-white border border-gray-200 rounded-lg p-6 h-full shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-headline font-semibold text-lg text-gray-900">Recent Activity</h3>
                <button className="text-primary text-xs font-semibold hover:underline">View All</button>
              </div>
              <div className="space-y-6 relative">
                <div className="absolute left-3.75 top-2 bottom-2 w-0.5 bg-gray-100"></div>
                {activityItems.map((item, i) => (
                  <div key={i} className="relative flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shrink-0 z-10 border border-gray-200 shadow-sm">
                      {React.cloneElement(item.icon, { size: 14 })}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{item.title}</p>
                      <p className="text-xs text-gray-500 mt-1 leading-relaxed">{item.desc}</p>
                      <p className="text-[10px] text-primary font-semibold mt-1.5 uppercase tracking-wide">{item.time}</p>
                    </div>
                  </div>
                ))}
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
      </main>
    </div>
  );
}