import { useNavigate } from "react-router-dom";
import { 
    MdVerifiedUser, MdInfo, MdCancelPresentation, MdRefresh, 
    MdDashboard, MdOpenInNew, MdHelpOutline, MdMedicalServices 
} from "react-icons/md";

const tealAccent = { background: 'linear-gradient(135deg, #006063 0%, #007b7f 100%)' };

export default function CancelPage() {
    const navigate = useNavigate();

    return (
        <div className="bg-[#f8f9fa] text-[#191c1d] h-screen flex flex-col font-body selection:bg-[#007b7f]/10 overflow-hidden">
            <main className="flex-grow flex items-center justify-center p-6 sm:p-12">
                <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
                    {/* Asymmetric Visual Side */}
                    <div className="md:col-span-5 hidden md:block group">
                        <div className="relative h-[550px] w-full rounded-3xl overflow-hidden shadow-2xl shadow-[#007b7f]/10 transition-all duration-700">
                            <img 
                                className="absolute inset-0 w-full h-full object-cover transition-transform duration-[2000ms] group-hover:scale-110" 
                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAL62WuG8opxJ1UG4-TjXc-K9pBvIjvKIM7q4OxpWOzkmSz7TdPRuF4UWZIAiYfNBSNAFeytJvL_EXmQwraQcuMToNeLdoXAtIkDlttWT1CT1pnyVqo4IQqmnixUEsyW-EbEneZwAGZEY65Is4bNVGq2KKsYkgAJJIsM7EhThZNAzyXbcLNe4q8kuj7wsCkBNLCj2L5tkrChvJFOMOojW3cz8zMj1YXq6zc7J-AM3sf9G5GUY7isBiOOnJyate5l3HF5YMZUhRCDMCG" 
                                alt="Modern clinical space" 
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#006063]/60 via-transparent to-transparent"></div>
                            <div className="absolute bottom-8 left-8 right-8 bg-white/70 backdrop-blur-xl p-8 rounded-2xl border border-white/20 shadow-xl">
                                <div className="flex items-center gap-3 mb-3">
                                    <MdVerifiedUser className="text-[#007b7f] text-2xl" />
                                    <span className="text-[#001b3d] font-black tracking-tight font-headline">The Sanctuary Secure</span>
                                </div>
                                <p className="text-[#424752] text-xs leading-relaxed font-medium">
                                    Your security is our priority. No charges have been made to your account during this cancelled session.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Main Content Canvas */}
                    <div className="md:col-span-7 space-y-12">
                        {/* Brand Anchor for Mobile */}
                        <div className="md:hidden flex justify-center mb-8">
                            <div className="flex items-center gap-2">
                                <MdMedicalServices className="text-[#007b7f] text-2xl" />
                                <span className="text-xl font-black tracking-tighter text-[#007b7f] font-headline">The Sanctuary</span>
                            </div>
                        </div>

                        <section className="space-y-8">
                            <header className="space-y-4">
                                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#f3f4f5] border border-[#c2c6d4]/30 rounded-full shadow-sm">
                                    <MdInfo className="text-[#7b3200] text-base" />
                                    <span className="text-[10px] font-black tracking-[0.15em] uppercase text-[#424752] opacity-70">Transaction Update</span>
                                </div>
                                <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-[#191c1d] font-headline leading-[1.05]">
                                    Payment <br /><span className="text-[#007b7f]">Cancelled.</span>
                                </h1>
                                <p className="text-[#424752] text-lg leading-relaxed max-w-lg font-medium opacity-80">
                                    The checkout process was interrupted. We want to confirm that <span className="font-black text-[#191c1d] border-b-2 border-[#007b7f]/20">no funds were deducted</span> from your account. 
                                </p>
                            </header>

                            {/* Status Card using Tonal Layering */}
                            <div className="bg-[#f3f4f5] p-6 rounded-2xl space-y-4 border border-[#c2c6d4]/40">
                                <div className="flex items-start gap-4">
                                    <div className="bg-white p-4 rounded-xl shadow-sm border border-[#c2c6d4] flex items-center justify-center text-[#007b7f]">
                                        <MdCancelPresentation size={32} />
                                    </div>
                                    <div className="space-y-1 pt-0.5">
                                        <h3 className="font-black text-[#191c1d] text-sm uppercase tracking-tighter">Session Details</h3>
                                        <p className="text-[10px] font-black text-[#424752] opacity-60 uppercase tracking-widest">
                                            Ref Index: <span className="font-mono text-[#007b7f]">#CB-{Math.random().toString(36).substr(2, 6).toUpperCase()}</span>
                                        </p>
                                        <p className="text-[10px] font-black text-[#424752] opacity-60 uppercase tracking-widest">
                                            Portal Status: <span className="text-[#7b3200]">Inactive</span>
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Action Cluster */}
                            <div className="flex flex-col sm:flex-row gap-4 pt-6">
                                <button 
                                    onClick={() => window.history.back()}
                                    style={tealAccent}
                                    className="text-white px-10 py-4.5 rounded-2xl font-black text-sm tracking-wide shadow-xl shadow-[#007b7f]/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                                >
                                    <span>Try Again</span>
                                    <MdRefresh size={18} />
                                </button>
                                <button 
                                    onClick={() => navigate('/')}
                                    className="bg-[#edeeef] text-[#007b7f] px-10 py-4.5 rounded-2xl font-black text-sm tracking-wide hover:bg-[#e1e3e4] active:scale-95 transition-all flex items-center justify-center gap-2 border border-[#007b7f]/5"
                                >
                                    <span>Back to Dashboard</span>
                                    <MdDashboard size={18} />
                                </button>
                            </div>
                        </section>

                        {/* Help Section using Negative Space */}
                        <footer className="pt-12 border-t border-[#c2c6d4]/30">
                            <div className="flex flex-col gap-5">
                                <p className="text-[10px] text-[#424752] font-black tracking-[0.2em] uppercase opacity-50">Need Assistance?</p>
                                <div className="flex flex-wrap gap-x-8 gap-y-3">
                                    <a className="text-sm text-[#007b7f] font-black hover:opacity-70 flex items-center gap-1.5 transition-all" href="#">
                                        Billing Support
                                        <MdOpenInNew size={14} />
                                    </a>
                                    <a className="text-sm text-[#007b7f] font-black hover:opacity-70 flex items-center gap-1.5 transition-all" href="#">
                                        Payment FAQ
                                        <MdHelpOutline size={16} />
                                    </a>
                                </div>
                            </div>
                        </footer>
                    </div>
                </div>
            </main>

            {/* Shared Component: Footer */}
            <footer className="w-full border-t border-[#c2c6d4]/20 bg-white flex flex-col md:flex-row justify-between items-center px-12 py-12 gap-8">
                <div className="text-[9px] font-black uppercase tracking-[0.2em] text-[#424752] opacity-40">
                    © 2026 CareBridge Clinical Sanctuary. HIPAA Compliant & Secure.
                </div>
                <div className="flex flex-wrap justify-center gap-8">
                    <a className="text-[9px] font-black uppercase tracking-[0.2em] text-[#424752] hover:text-[#007b7f] transition-all opacity-40 hover:opacity-100" href="#">Privacy Policy</a>
                    <a className="text-[9px] font-black uppercase tracking-[0.2em] text-[#424752] hover:text-[#007b7f] transition-all opacity-40 hover:opacity-100" href="#">Terms of Service</a>
                    <a className="text-[9px] font-black uppercase tracking-[0.2em] text-[#424752] hover:text-[#007b7f] transition-all opacity-40 hover:opacity-100" href="#">Security Standards</a>
                    <a className="text-[9px] font-black uppercase tracking-[0.2em] text-[#424752] hover:text-[#007b7f] transition-all opacity-40 hover:opacity-100" href="#">Contact Support</a>
                </div>
            </footer>
        </div>
    );
}
