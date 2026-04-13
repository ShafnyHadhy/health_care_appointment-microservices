import React from 'react';
import { 
  HeartPulse, 
  User, 
  Mail, 
  Phone, 
  Stethoscope, 
  ShieldCheck, 
  Lock, 
  ChevronRight,
  Globe,
  MessageSquare,
  Zap,
  Bot
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function DoctorRegister() {
  const perks = [
    { icon: <Zap size={14} />, label: "Instant Telehealth" },
    { icon: <Bot size={14} />, label: "AI Assistant" },
    { icon: <Globe size={14} />, label: "Global Directory" },
    { icon: <MessageSquare size={14} />, label: "Secure Messaging" },
    { icon: <ShieldCheck size={14} />, label: "Priority Support" },
  ];

  return (
    <div className="bg-neutral font-body text-on-surface antialiased min-h-screen">
      {/* Top Navigation */}
      <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl shadow-sm h-14 flex items-center px-4 md:px-6">
        <div className="flex justify-between items-center w-full max-w-screen-2xl mx-auto">
          <div className="flex items-center gap-2">
            {/* <HeartPulse className="text-primary" size={24} /> */}
            <span className="text-lg font-bold tracking-tighter text-teal-800 font-headline">CareBridge</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs font-medium text-slate-600">
              Already have an account?
            </span>
            <Link
                to="/login"
                className="bg-secondary-container text-on-secondary-container px-3 py-1.5 rounded-lg text-xs font-semibold active:scale-95 hover:text-teal-600 transition-colors"
            >
              Log In
            </Link>
          </div>
        </div>
      </header>

      <main className="pt-20 pb-16 px-4 md:px-6">
        <div className="max-w-4xl mx-auto">
          {/* Hero Title */}
          <div className="mb-8">
            <h1 className="font-headline text-3xl font-extrabold tracking-tight text-on-surface mb-3">
              Join our <span className="text-primary">Clinical Sanctuary</span>
            </h1>
            <p className="text-sm text-on-surface-variant max-w-2xl leading-relaxed">
              Secure your position in a therapeutic ecosystem designed for excellence. Your expertise deserves a modern workspace.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Registration Form Column */}
            <div className="lg:col-span-7 bg-white p-6 lg:p-8 rounded-lg border border-black/5 shadow-sm">
              <form onSubmit={(e) => e.preventDefault()} className="space-y-8">
                
                {/* Section 1: Identity */}
                <section>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="w-6 h-6 rounded-full bg-surface-container-low flex items-center justify-center text-primary">
                      <User size={14} fill="currentColor" fillOpacity={0.2} />
                    </span>
                    <h3 className="font-headline text-lg font-bold text-on-surface">Identity & Contact</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-semibold uppercase tracking-wider text-on-surface-variant ml-1">Full Name</label>
                      <input 
                        className="w-full bg-surface-container-lowest border border-outline/10 rounded-lg px-3 py-2 text-sm focus:border-primary focus:ring-2 focus:ring-primary/10 text-on-surface placeholder:text-outline-variant transition-all outline-none" 
                        placeholder="Dr. Julianne Mercer" 
                        type="text"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-semibold uppercase tracking-wider text-on-surface-variant ml-1">Email Address</label>
                      <input 
                        className="w-full bg-surface-container-lowest border border-outline/10 rounded-lg px-3 py-2 text-sm focus:border-primary focus:ring-2 focus:ring-primary/10 text-on-surface placeholder:text-outline-variant transition-all outline-none" 
                        placeholder="j.mercer@clinic.com" 
                        type="email"
                      />
                    </div>
                    <div className="space-y-1.5 md:col-span-2">
                      <label className="text-[10px] font-semibold uppercase tracking-wider text-on-surface-variant ml-1">Phone Number</label>
                      <div className="relative">
                        <input 
                          className="w-full bg-surface-container-lowest border border-outline/10 rounded-lg px-3 py-2 pl-9 text-sm focus:border-primary focus:ring-2 focus:ring-primary/10 text-on-surface placeholder:text-outline-variant transition-all outline-none" 
                          placeholder="+1 (555) 000-0000" 
                          type="tel"
                        />
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-outline w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </section>

                {/* Section 2: Professional Details */}
                <section>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="w-6 h-6 rounded-full bg-surface-container-low flex items-center justify-center text-primary">
                      <Stethoscope size={14} fill="currentColor" fillOpacity={0.2} />
                    </span>
                    <h3 className="font-headline text-lg font-bold text-on-surface">Professional Profile</h3>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-semibold uppercase tracking-wider text-on-surface-variant ml-1">Specialization</label>
                      <div className="relative">
                        <select className="w-full bg-surface-container-lowest border border-outline/10 rounded-lg px-3 py-2 text-sm focus:border-primary focus:ring-2 focus:ring-primary/10 text-on-surface transition-all appearance-none outline-none">
                          <option disabled value="">Select your medical field</option>
                          <option>Cardiology</option>
                          <option>Dermatology</option>
                          <option>Internal Medicine</option>
                          <option>Neurology</option>
                          <option>Pediatrics</option>
                          <option>Psychiatry</option>
                        </select>
                        <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 text-outline rotate-90" size={16} />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-semibold uppercase tracking-wider text-on-surface-variant ml-1">License Number</label>
                      <input 
                        className="w-full bg-surface-container-lowest border border-outline/10 rounded-lg px-3 py-2 text-sm focus:border-primary focus:ring-2 focus:ring-primary/10 text-on-surface placeholder:text-outline-variant transition-all outline-none" 
                        placeholder="MD-8829-XJ" 
                        type="text"
                      />
                    </div>
                  </div>
                </section>

                {/* Section 3: Security */}
                <section>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="w-6 h-6 rounded-full bg-surface-container-low flex items-center justify-center text-primary">
                      <Lock size={14} fill="currentColor" fillOpacity={0.2} />
                    </span>
                    <h3 className="font-headline text-lg font-bold text-on-surface">Security</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-semibold uppercase tracking-wider text-on-surface-variant ml-1">Password</label>
                      <input 
                        className="w-full bg-surface-container-lowest border border-outline/10 rounded-lg px-3 py-2 text-sm focus:border-primary focus:ring-2 focus:ring-primary/10 text-on-surface placeholder:text-outline-variant transition-all outline-none" 
                        placeholder="••••••••" 
                        type="password"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-semibold uppercase tracking-wider text-on-surface-variant ml-1">Confirm Password</label>
                      <input 
                        className="w-full bg-surface-container-lowest border border-outline/10 rounded-lg px-3 py-2 text-sm focus:border-primary focus:ring-2 focus:ring-primary/10 text-on-surface placeholder:text-outline-variant transition-all outline-none" 
                        placeholder="••••••••" 
                        type="password"
                      />
                    </div>
                  </div>
                </section>

                <div className="pt-4 space-y-4">
                  {/* Registration CTA */}
                  <button 
                    className="w-full py-3 rounded-lg text-white font-headline font-bold text-base shadow-lg shadow-primary/10 active:scale-[0.98] transition-all" 
                    style={{ background: 'linear-gradient(135deg, #006063 0%, #007b7f 100%)' }}
                    type="submit"
                  >
                    Register as Doctor
                  </button>

                  {/* Verification Note */}
                  <div className="flex gap-3 p-4 bg-surface-container-low rounded-lg items-start">
                    <ShieldCheck className="text-primary mt-1.5 shrink-0" size={16} />
                    <div className="space-y-0.5">
                      <p className="text-xs font-semibold text-on-surface">Awaiting Admin Verification</p>
                      <p className="text-[10px] text-on-surface-variant leading-relaxed">
                        To maintain the sanctuary's integrity, all medical credentials undergo a manual 24-48 hour verification process by our clinical administrators.
                      </p>
                    </div>
                  </div>
                </div>
              </form>
            </div>

            {/* Visual/Info Column */}
            <div className="lg:col-span-5 space-y-6">
              {/* High-end Card Pattern */}
              <div className="relative rounded-lg overflow-hidden aspect-4/5 border border-black/5 group shadow-sm">
                <img 
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBBwVl_5_C6XOb_sYtPmXxnLMBaG3ZTEE0n0zbDVUJPdD4RpisJrGZkpfp_jTJXANNraiJFtEvM_AYB8qY600yMO92npc_Vn6dm0RMpXoDCoyPTJd_B7Ss4PYfdQlfdv-YXXirsdsDI41TuuY2BYLdqv-vyrBqmQ0iK85PO4qTHHqgsAuVJCN4qHIXo0INFDQOoLc-MyI6OJUWgJ_OhV_zhsghJz5XlpTO21RKKgzpkahBevKjhNiVhDg0-7YGZVMKXdKxZoVsPc2c"
                  alt="Modern office interior"
                />
                <div className="absolute inset-0 bg-linear-to-t from-primary/90 via-primary/20 to-transparent"></div>
                <div className="absolute bottom-0 left-0 p-6 text-on-primary">
                  <span className="inline-block px-2.5 py-1 bg-secondary-fixed/30 backdrop-blur-md rounded-full text-[9px] font-bold uppercase tracking-[0.2em] mb-3">
                    CareBridge Network
                  </span>
                  <h2 className="font-headline text-2xl font-extrabold leading-tight mb-2">Precision tools for modern care.</h2>
                  <p className="text-on-primary/80 text-xs leading-relaxed">
                    Integrated diagnostics, seamless patient records, and an interface that breathes with you.
                  </p>
                </div>
              </div>

              {/* Perks Showcase */}
              <div className="bg-surface-container-low p-5 rounded-lg space-y-3 border border-black/5 shadow-sm">
                <p className="text-[10px] font-bold text-primary uppercase tracking-widest">Network Perks</p>
                <div className="flex flex-wrap gap-2">
                  {perks.map((perk, index) => (
                    <span 
                      key={index} 
                      className="px-3 py-1.5 bg-secondary-fixed/50 text-on-secondary-fixed rounded-full text-[10px] font-semibold flex items-center gap-1.5"
                    >
                      {perk.icon}
                      {perk.label}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer Meta */}
      <footer className="py-4 border-t border-outline-variant/10">
        <div className="max-w-screen-2xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-on-surface-variant">© 2026 CareBridge Clinical Sanctuary. All rights reserved.</p>
          <div className="flex gap-6">
            <a className="text-[10px] font-medium text-on-surface-variant hover:text-primary transition-colors uppercase tracking-wider" href="#">Privacy Policy</a>
            <a className="text-[10px] font-medium text-on-surface-variant hover:text-primary transition-colors uppercase tracking-wider" href="#">Terms of Service</a>
            <a className="text-[10px] font-medium text-on-surface-variant hover:text-primary transition-colors uppercase tracking-wider" href="#">Support Center</a>
          </div>
        </div>
      </footer>
    </div>
  );
}