import React from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  Lock, 
  Clock, 
  ArrowRight, 
  ShieldCheck, 
  FileText,
  Stethoscope
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function PatientRegister() {
  return (
    <div className="bg-neutral font-body text-on-surface antialiased min-h-screen flex flex-col">
      {/* Suppressed TopNavBar for Focused Journey (Registration) */}
      
      <main className="grow flex items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-4xl flex flex-col md:flex-row gap-0 overflow-hidden rounded-lg shadow-md">
          
          {/* Branding/Visual Side (Asymmetric Layout) */}
          <div className="hidden md:flex md:w-5/12 bg-primary p-8 flex-col justify-between relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-6">
                <Stethoscope className="text-secondary-fixed w-6 h-6" />
                <span className="font-headline font-black text-lg tracking-tighter text-white">CareBridge</span>
              </div>
              <h1 className="font-headline text-3xl font-extrabold text-white leading-tight tracking-tight mb-4">
                Welcome to your <span className="text-white/70">Clinical Sanctuary</span>.
              </h1>
              <p className="text-white font-medium text-sm max-w-xs">
                Join our healthcare community and experience a more serene approach to digital medicine.
              </p>
            </div>

            {/* Patient Insight Chip (Thematic Elements) */}
            <div className="relative z-10 flex gap-3 flex-wrap">
              <span className="bg-neutral/70 px-4 py-2 rounded-full text-on-secondary-fixed text-sm font-semibold flex items-center gap-2 backdrop-blur-sm">
                <ShieldCheck size={16} /> Secure Data
              </span>
              <span className="bg-neutral/70 px-4 py-2 rounded-full text-on-secondary-fixed text-sm font-semibold flex items-center gap-2 backdrop-blur-sm">
                <FileText size={16} /> HIPAA Compliant
              </span>
            </div>

            {/* Abstract Decorative Pulse & Overlay Image */}
            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-secondary-fixed opacity-10 rounded-full blur-3xl"></div>
            <img 
              className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-30" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDZLIHleSaxw53lkGyB618nIKowHPLIuH3BvyDneK1EnWcRYR3uyu7UMh3pxCn0e66Uqht5V0Aq8Rc6GA37ISq4S-gypFxQKtAN2cGVUVWkYM3yOJu2t7y5DtxsIs9ZKRGKPl5_P8qZx53d20xtiUd5FiVJk4VSnGq7yusqvi3kMBwmHjV-8QFdofZ-C8UNDzomduvTSnX4zYmglr3i1Ay-_rV9T4H7blL-lFgDXYAVOyugoWnrOCxuHqHf4JJLrn3fg0Zb2vjy07E" 
              alt="Clinical Environment"
            />
          </div>

          {/* Registration Form Canvas */}
          <div className="w-full md:w-7/12 bg-white p-6 md:p-10">
            <div className="max-w-sm mx-auto">
              <header className="mb-6">
                <h2 className="font-headline text-2xl font-bold text-on-surface mb-1">Create Account</h2>
                <p className="text-on-surface-variant text-sm font-medium">Please enter your details to register as a new patient.</p>
              </header>

              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                {/* Full Name */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-on-surface-variant" htmlFor="full_name">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-outline w-4 h-4" />
                    <input 
                      className="w-full bg-surface-container-lowest border border-[rgba(189,201,201,0.2)] rounded-lg py-2 pl-9 pr-3 text-sm text-on-surface focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all outline-none" 
                      id="full_name" 
                      placeholder="John Doe" 
                      type="text"
                    />
                  </div>
                </div>

                {/* Email Address */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-on-surface-variant" htmlFor="email">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-outline w-4 h-4" />
                    <input 
                      className="w-full bg-surface-container-lowest border border-[rgba(189,201,201,0.2)] rounded-lg py-2 pl-9 pr-3 text-sm text-on-surface focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all outline-none" 
                      id="email" 
                      placeholder="john@example.com" 
                      type="email"
                    />
                  </div>
                </div>

                {/* Phone Number */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-on-surface-variant" htmlFor="phone">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-outline w-4 h-4" />
                    <input 
                      className="w-full bg-surface-container-lowest border border-[rgba(189,201,201,0.2)] rounded-lg py-2 pl-9 pr-3 text-sm text-on-surface focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all outline-none" 
                      id="phone" 
                      placeholder="+1 (555) 000-0000" 
                      type="tel"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Password */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-on-surface-variant" htmlFor="password">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-outline w-4 h-4" />
                      <input 
                        className="w-full bg-surface-container-lowest border border-[rgba(189,201,201,0.2)] rounded-lg py-2 pl-9 pr-3 text-sm text-on-surface focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all outline-none" 
                        id="password" 
                        placeholder="••••••••" 
                        type="password"
                      />
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-on-surface-variant" htmlFor="confirm_password">Confirm</label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-outline w-4 h-4" />
                      <input 
                        className="w-full bg-surface-container-lowest border border-[rgba(189,201,201,0.2)] rounded-lg py-2 pl-9 pr-3 text-sm text-on-surface focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all outline-none" 
                        id="confirm_password" 
                        placeholder="••••••••" 
                        type="password"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <button 
                    className="w-full py-2.5 rounded-lg text-white font-headline font-bold text-sm shadow-sm hover:opacity-95 active:scale-[0.98] transition-all duration-150 flex justify-center items-center gap-2" 
                    type="submit"
                    style={{ background: 'linear-gradient(135deg, #006063 0%, #007b7f 100%)' }}
                  >
                    Create Account
                    <ArrowRight size={16} />
                  </button>
                </div>
              </form>

              <footer className="mt-6 text-center">
                <p className="text-on-surface-variant text-xs font-medium">
                  Already have an account? 
                  <Link className="text-primary font-bold hover:underline underline-offset-4 ml-1" to="/login">Login instead</Link>
                </p>
              </footer>
            </div>
          </div>
        </div>
      </main>

      {/* Ambient Sanctuary Footnote */}
      <div className="py-6 text-center text-outline text-[10px] font-medium tracking-widest uppercase opacity-60">
        Clinical Sanctuary © 2026 CareBridge Systems
      </div>
    </div>
  );
}