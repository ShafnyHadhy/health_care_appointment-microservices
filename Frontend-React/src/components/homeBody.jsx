import { MdVerifiedUser, MdArrowForward, MdMedicalServices, MdVideocam, MdLaptopMac, MdPsychology, MdBolt } from 'react-icons/md';
import { Link } from 'react-router-dom';

const tealPulse = { background: 'linear-gradient(135deg, #006063 0%, #007b7f 100%)' };

export default function HomeBody() {

    const token = localStorage.getItem("token");

  return (
    
    <main className="font-body bg-neutral">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-8 pb-16 md:pt-12 md:pb-24 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 flex flex-col items-start">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-secondary-fixed/30 text-on-secondary-fixed-variant rounded-md font-label text-[10px] md:text-xs font-bold mb-4 md:mb-6 tracking-wide uppercase">
              <MdVerifiedUser className="text-[14px]" />
              Next Generation Telehealth
            </div>
            <h1 className="font-headline font-extrabold text-4xl md:text-5xl lg:text-6xl text-on-surface leading-[1.12] tracking-tight mb-4 md:mb-6">
              Healthcare that <br /> <span className="text-primary">moves with you</span>.
            </h1>
            <p className="text-base md:text-lg text-on-surface-variant max-w-lg mb-8 leading-relaxed opacity-90">
              Bridging the gap between clinical excellence and digital convenience. Access specialists, manage health records, and receive AI-driven insights from anywhere.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              {!token ? (
               <>
                 <Link 
                    to="/patient-register"
                    style={tealPulse} 
                    className="text-white px-6 py-3.5 md:px-8 md:py-4 rounded-xl font-headline font-bold text-base md:text-lg shadow-xl shadow-primary/10 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
                >
                  Register as Patient
                  <MdArrowForward className="text-xl" />
                </Link>
              
                <Link 
                    to="/doctor-register"
                    className="bg-white border-2 border-primary/10 text-primary px-6 py-3.5 md:px-8 md:py-4 rounded-xl font-headline font-bold text-base md:text-lg hover:bg-surface-container-low transition-all flex items-center justify-center gap-3"
                >
                    Register as Doctor
                    <MdMedicalServices className="text-xl" />
                </Link>
               </>
              ) : (
                <Link
                    to="/patient-dashboard" 
                    style={tealPulse} className="text-white px-6 py-3.5 md:px-8 md:py-4 rounded-xl font-headline font-bold text-base md:text-lg shadow-xl shadow-primary/10 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
                >
                  Go to Dashboard
                  <MdArrowForward className="text-xl" />
                </Link>
              )}
            </div>
          </div>

          <div className="lg:col-span-5 relative mt-10 lg:mt-0">
            <div className="relative z-10 rounded-2xl overflow-hidden shadow-xl rotate-1 transition-transform hover:rotate-0 duration-700 mt-8 lg:mt-0">
              <img className="w-full h-87.5 md:h-112.5 lg:h-120 object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAZaRKGPka3fVKBEe9bUIpBXU1fGVDjZrS6WvXYDqGyHBCVP4Q9NZodhUSJSVXcnUFo-PER_x8hyn1IDBjUw5I5ODg-YVVT-Mr4yISgUqxCiSSpBIqpqb6kCszqmIS05ebTzYnHawfUlR2l0AgxUIz2e5u58Kb0oKNXZx54PrzL8xKG7mwgK3Q_-NOkPYAJJNwKZXfDBx_N3ukPnfsX8HEX13jHKlreKmUyNZKbANf5w6b1aDO8FAXWHZGGL3H8iUaHIi4BGnCXePQ" alt="Doctor Consultation" />
              <div className="absolute inset-0 bg-linear-to-t from-black/50 via-transparent to-transparent"></div>
              <div className="absolute bottom-4 left-4 right-4 p-3 md:p-4 bg-white/85 backdrop-blur-md rounded-full flex items-center gap-3 md:gap-4 border border-white/20 shadow-sm">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-md bg-secondary-fixed flex items-center justify-center text-primary">
                  <MdVideocam className="text-xl md:text-2xl" />
                </div>
                <div>
                  <p className="text-[10px] md:text-xs font-bold text-primary uppercase tracking-widest">Live Consultation</p>
                  <p className="text-sm md:text-base text-on-surface font-semibold">Dr. Sarah Jenkins</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-20 bg-surface-container-low mt-8 md:mt-12" id="features">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-10 md:mb-14">
            <h2 className="font-headline font-bold text-3xl md:text-4xl text-on-surface mb-3 md:mb-4">Precision tools for modern care</h2>
            <p className="text-on-surface-variant text-base md:text-lg">Every feature is designed to reduce friction and maximize clinical outcome.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 md:gap-6 auto-rows-[200px] md:auto-rows-[220px]">
            <div className="md:col-span-8 bg-white rounded-xl p-6 md:p-8 flex flex-col md:flex-row gap-6 md:gap-8 items-center shadow-sm hover:shadow-md transition-all">
              <div className="flex-1">
                <div className="w-12 h-12 md:w-14 md:h-14 bg-secondary-fixed/50 rounded-md flex items-center justify-center text-primary mb-4 md:mb-6">
                  <MdLaptopMac className="text-2xl md:text-3xl" />
                </div>
                <h3 className="font-headline font-bold text-xl md:text-2xl mb-2 md:mb-3">Online Consultations</h3>
                <p className="text-sm md:text-base text-on-surface-variant leading-relaxed">High-definition encrypted video calls with built-in prescription tools.</p>
              </div>
              <div className="flex-1 w-full h-full min-h-40 md:min-h-45 rounded-md overflow-hidden bg-gray-100">
                <img className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDthpWi9DBVOxWS8TcdmoBG4G3BFjBNJJmo2cQBOn2rNBPELHiF7NHAj5GQW9hHtAjk7tQ6a6Z9Iz96DXlrObCe-TOR6S0pQ1-kkpnm76krYE9bWYYHP3WpEzF5RrfXKrn1vmPpHdEwOsK7ge7N4PsxCcb5KXE7oWk1nNA-CVFNKolnCFkABXG64vEWO8T_924JT29PLJkoLF7mLnrERpvQJTkEdlVqGGqkM5Wmc-7-cTAbr4hb0GDcWVIjImHiYV64_x29IribY_4" alt="Dashboard" />
              </div>
            </div>

            <div style={tealPulse} className="md:col-span-4 text-white rounded-lg p-6 md:p-8 flex flex-col justify-between shadow-md">
              <div className="w-12 h-12 md:w-14 md:h-14 bg-white/20 rounded-md flex items-center justify-center mb-4 md:mb-6">
                <MdPsychology className="text-2xl md:text-3xl text-white" />
              </div>
              <div>
                <h3 className="font-headline font-bold text-xl md:text-2xl mb-2 md:mb-3">AI Symptom Checker</h3>
                <span className="inline-flex items-center gap-1.5 md:gap-2 text-xs md:text-sm font-bold bg-white/10 px-3 py-1.5 md:px-4 md:py-2 rounded-md mt-2 border border-white/10">
                  BETA Access <MdBolt className="text-sm md:text-base" />
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}