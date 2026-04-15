import React from 'react';
import { 
  Stethoscope, 
  User, 
  ArrowRight, 
  HeartPulse, 
  Mail, 
  HelpCircle 
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function RoleSelection() {
  const patientFeatures = ["Secure Booking", "Telemedicine", "History Access"];
  const doctorFeatures = ["Clinical Portal", "Practice Management"];

  return (
    <div className="bg-surface font-body text-on-surface antialiased min-h-screen flex flex-col">
      {/* Main Onboarding Container
          Note: TopAppBar is suppressed for onboarding contexts 
      */}
      <main className="grow flex flex-col items-center justify-center px-4 py-8 md:py-12 bg-neutral">
        
        {/* Header Section */}
        <div className="max-w-3xl w-full text-center mb-10 md:mb-12">
          {/* <div className="flex justify-center mb-6">
            <div className="w-12 h-12 bg-primary-container rounded-xl flex items-center justify-center text-on-primary-container shadow-sm">
              <HeartPulse size={28} />
            </div>
          </div> */}
          <h1 className="font-headline font-extrabold text-3xl md:text-4xl text-primary tracking-tight mb-3">
            Join CareBridge as a...
          </h1>
          <p className="font-body text-base text-on-surface-variant opacity-80 max-w-md mx-auto">
            Welcome to the clinical sanctuary. Please choose your path to personalize your healthcare experience.
          </p>
        </div>

        {/* Role Cards Grid: Asymmetrical Layout */}
        <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
          
          {/* Patient Card (Span 7) */}
          <div className="md:col-span-7 group cursor-pointer">
            <div className="h-full bg-white rounded-xl p-6 md:p-8 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/5 border border-outline-variant/20 flex flex-col">
              <div className="flex justify-between items-start mb-8">
                <div className="w-12 h-12 rounded-full bg-tertiary flex items-center justify-center text-secondary">
                  <User size={24} />
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <ArrowRight className="text-primary" size={20} />
                </div>
              </div>
              
              <h2 className="font-headline font-bold text-2xl text-on-surface mb-3">Patient</h2>
              <p className="font-body text-on-surface-variant leading-relaxed text-sm md:text-base mb-8">
                I want to book appointments and consult with doctors. Access your medical records, chat with specialists, and manage your health journey in one peaceful place.
              </p>

              <div className="mt-auto">
                <div className="flex flex-wrap gap-2 mb-6">
                  {patientFeatures.map((tag) => (
                    <span key={tag} className="px-3 py-1 bg-secondary-fixed/20 text-on-secondary-fixed-variant font-label text-xs rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
                <Link to="/patient-register"
                  className="w-full py-3 px-5 rounded-xl text-white font-bold text-base transition-transform active:scale-[0.98] shadow-md shadow-primary/10 hover:shadow-primary/20"
                  style={{ background: 'linear-gradient(135deg, #006063 0%, #007b7f 100%)' }}
                >
                  Continue as Patient
                </Link>
              </div>
            </div>
          </div>

          {/* Doctor Card (Span 5) */}
          <div className="md:col-span-5 group cursor-pointer">
            <div className="h-full bg-tertiary rounded-xl p-6 md:p-8 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/5 border border-outline-variant/20 flex flex-col">
              <div className="flex justify-between items-start mb-8">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <Stethoscope size={24} fill="currentColor" fillOpacity={0.2} />
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <ArrowRight className="text-primary" size={20} />
                </div>
              </div>

              <h2 className="font-headline font-bold text-2xl text-on-surface mb-3">Doctor</h2>
              <p className="font-body text-on-surface-variant leading-relaxed text-sm mb-8">
                I want to manage my practice and see patients. Efficient clinical workflows, intelligent scheduling, and streamlined patient communication.
              </p>

              <div className="mt-auto">
                <div className="flex flex-wrap gap-2 mb-6">
                  {doctorFeatures.map((tag) => (
                    <span key={tag} className="px-3 py-1 bg-primary/10 text-primary font-label text-[10px] rounded-full uppercase tracking-wider font-semibold">
                      {tag}
                    </span>
                  ))}
                </div>
                <Link to="/doctor-register" 
                    className="w-full py-3 px-5 rounded-xl bg-secondary text-on-secondary-container font-bold text-base transition-transform active:scale-[0.98] shadow-md hover:shadow-lg"
                >
                  Join Clinical Staff
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Support Info Section: Glassmorphism */}
        <div className="mt-14 max-w-3xl w-full flex flex-col md:flex-row items-center justify-between gap-6 px-6 py-4 bg-surface-container/50 backdrop-blur-md rounded-2xl border border-white/20">
          <div className="flex items-center gap-4">
            <p className="text-xs text-on-surface-variant font-medium leading-tight">
              Over <span className="text-primary font-bold">2,500+</span> certified specialists <br/> already using CareBridge.
            </p>
          </div>
          <div className="flex items-center gap-5">
            <a href="#" className="text-xs font-label font-semibold text-primary hover:underline flex items-center gap-1">
              <HelpCircle size={14} /> Need help?
            </a>
            <span className="h-3 w-1px bg-outline-variant hidden md:block"></span>
            <a href="#" className="text-xs font-label font-semibold text-on-surface-variant opacity-70 hover:opacity-100 transition-all flex items-center gap-1">
              <Mail size={14} /> Contact Support
            </a>
          </div>
        </div>
      </main>

      {/* Footer Meta */}
      <footer className="py-6 text-center">
        <p className="text-[10px] text-on-surface-variant opacity-50 font-label tracking-widest uppercase">
          © 2026 CareBridge Clinical Sanctuary. All Rights Reserved.
        </p>
      </footer>
    </div>
  );
}