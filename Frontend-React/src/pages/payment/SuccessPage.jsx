import { useNavigate } from "react-router-dom";
import { 
    MdCheckCircle, MdSecurity, MdCreditCard, 
    MdVideocam, MdDescription, MdArrowForward, MdMedicalServices 
} from "react-icons/md";

const tealAccent = { background: 'linear-gradient(135deg, #006063 0%, #007b7f 100%)' };

export default function SuccessPage() {
    const navigate = useNavigate();

    return (
        <div className="bg-[#f8f9fa] text-[#191c1d] h-screen font-body selection:bg-[#007b7f]/10 flex flex-col overflow-hidden">
            <main className="flex-grow flex items-center justify-center p-6 sm:p-12 relative">
                {/* Abstract Background Decoration */}
                <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
                    <div className="absolute -top-24 -left-24 w-96 h-96 bg-[#d6e3ff]/30 rounded-full blur-[100px]"></div>
                    <div className="absolute top-1/2 -right-24 w-80 h-80 bg-[#d6e4f5]/40 rounded-full blur-[80px]"></div>
                </div>

                <div className="max-w-2xl w-full z-10">
                    {/* Success Icon Container */}
                    <div className="flex flex-col items-center text-center mb-6">
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg shadow-[#007b7f]/5 mb-6 border border-[#007b7f]/5">
                            <div style={tealAccent} className="w-12 h-12 rounded-full flex items-center justify-center shadow-inner">
                                <MdCheckCircle className="text-white text-3xl" />
                            </div>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-black tracking-tight text-[#007b7f] mb-2 font-headline uppercase italic">Payment Successful!</h1>
                        <p className="text-[#424752] text-sm opacity-80">Your consultation is confirmed and secured.</p>
                    </div>

                    {/* Bento-style Information Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-8">
                        {/* Transaction Summary Card */}
                        <div className="md:col-span-4 bg-white p-6 rounded-2xl shadow-xl shadow-[#007b7f]/5 border border-[#c2c6d4]/20">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#424752] opacity-50 mb-1">Receipt Information</p>
                                    <p className="font-mono text-sm text-[#007b7f] font-bold">TXN-{Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
                                </div>
                                <div className="bg-[#e0f2f1] text-[#006063] px-4 py-1.5 rounded-full text-[10px] font-black flex items-center gap-1.5 uppercase tracking-wider">
                                    <MdSecurity size={14} />
                                    Secure HIPAA
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-[#f3f4f5] flex items-center justify-center text-[#007b7f]">
                                        <MdMedicalServices size={28} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-[#424752] opacity-50">Practitioner</p>
                                        <p className="font-black text-[#191c1d] text-base">Specialist Consultant</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6 pt-6 border-t border-[#c2c6d4]/20">
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-[#424752] opacity-50 mb-1">Status</p>
                                        <p className="font-black text-sm text-[#191c1d]">Confirmed</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-[#424752] opacity-50 mb-1">Method</p>
                                        <p className="font-black text-sm text-[#191c1d]">Stripe Secure</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Payment Status Sidebar */}
                        <div className="md:col-span-2 bg-[#006063] text-white p-6 rounded-2xl flex flex-col justify-between shadow-2xl shadow-[#007b7f]/30 relative overflow-hidden group">
                            <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
                            <div className="relative z-10">
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-2">Amount Paid</p>
                                <p className="text-3xl md:text-4xl font-black tracking-tighter">Rs.150.00</p>
                            </div>
                            <div className="mt-8 relative z-10">
                                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest opacity-80 mb-3">
                                    <MdCreditCard size={16} />
                                    Protected Transaction
                                </div>
                                <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden">
                                    <div className="w-full h-full bg-white"></div>
                                </div>
                            </div>
                        </div>

                        {/* Small Info Cards */}
                        <div className="md:col-span-3 bg-[#e0f2f1] p-5 rounded-2xl border border-[#007b7f]/5 group border-transparent hover:border-[#007b7f]/20 transition-all">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-2 bg-[#007b7f] text-white rounded-xl shadow-md">
                                    <MdVideocam size={20} />
                                </div>
                                <p className="font-black text-[#006063] font-headline text-sm tracking-tight text-on-secondary-container">Virtual Visit</p>
                            </div>
                            <p className="text-xs text-[#596674] leading-relaxed font-medium">
                                A link to the secure video room has been sent to your email and patient portal.
                            </p>
                        </div>
                        <div className="md:col-span-3 bg-[#edeeef] p-5 rounded-2xl border border-transparent hover:border-[#c2c6d4] transition-all">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-2 bg-white text-[#007b7f] rounded-xl shadow-sm border border-[#c2c6d4]/20">
                                    <MdDescription size={20} />
                                </div>
                                <p className="font-black text-[#191c1d] font-headline text-sm tracking-tight">Documents Needed</p>
                            </div>
                            <p className="text-xs text-[#424752] leading-relaxed font-medium opacity-80">
                                Please ensure your latest medical history is uploaded before the call starts.
                            </p>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button 
                            onClick={() => navigate('/')}
                            style={tealAccent}
                            className="text-white px-10 py-4.5 rounded-2xl font-black text-sm flex items-center justify-center gap-3 shadow-xl shadow-[#007b7f]/20 hover:scale-[1.02] active:scale-95 transition-all"
                        >
                            <span>View Appointment Details</span>
                            <MdArrowForward className="text-xl" />
                        </button>
                        <button 
                            onClick={() => navigate('/')}
                            className="bg-[#f3f4f5] text-[#007b7f] px-10 py-4.5 rounded-2xl font-black text-sm hover:bg-[#edeeef] active:scale-95 transition-all border border-[#007b7f]/5"
                        >
                            Back to Dashboard
                        </button>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="w-full border-t border-[#c2c6d4]/20 bg-white flex flex-col md:flex-row justify-between items-center px-12 py-10 gap-6">
                <div className="flex flex-wrap justify-center gap-8">
                    <a className="text-[9px] font-black uppercase tracking-[0.2em] text-[#424752] hover:text-[#007b7f] transition-all opacity-40 hover:opacity-100" href="#">Privacy Policy</a>
                    <a className="text-[9px] font-black uppercase tracking-[0.2em] text-[#424752] hover:text-[#007b7f] transition-all opacity-40 hover:opacity-100" href="#">Terms of Service</a>
                    <a className="text-[9px] font-black uppercase tracking-[0.2em] text-[#424752] hover:text-[#007b7f] transition-all opacity-40 hover:opacity-100" href="#">Security Standards</a>
                </div>
                <div className="text-[9px] font-black uppercase tracking-[0.2em] text-[#424752] opacity-40">
                    © 2026 CareBridge Clinical Sanctuary. HIPAA Compliant & Secure.
                </div>
            </footer>

            <style>{`
                @keyframes progress {
                    0% { width: 0%; }
                    100% { width: 100%; }
                }
            `}</style>
        </div>
    );
}
