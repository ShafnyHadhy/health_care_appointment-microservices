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
            <main className="flex-grow flex items-center justify-center p-4 relative overflow-hidden">
                {/* Abstract Background Decoration */}
                <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
                    <div className="absolute -top-24 -left-24 w-96 h-96 bg-[#d6e3ff]/30 rounded-full blur-[100px]"></div>
                    <div className="absolute top-1/2 -right-24 w-80 h-80 bg-[#d6e4f5]/40 rounded-full blur-[80px]"></div>
                </div>

                <div className="max-w-2xl w-full z-10 scale-[0.9] origin-center lowercase">
                    {/* Success Icon Container */}
                    <div className="flex flex-col items-center text-center mb-4">
                        <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-lg shadow-[#007b7f]/5 mb-4 border border-[#007b7f]/5">
                            <div style={tealAccent} className="w-10 h-10 rounded-full flex items-center justify-center shadow-inner">
                                <MdCheckCircle className="text-white text-2xl" />
                            </div>
                        </div>
                        <h1 className="text-3xl font-black tracking-tight text-[#007b7f] mb-1 font-headline uppercase italic">Success!</h1>
                        <p className="text-[#424752] text-[10px] opacity-80 uppercase tracking-widest font-black">Clinical confirmed.</p>
                    </div>

                    {/* Bento-style Information Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-6 gap-3 mb-6">
                        {/* Transaction Summary Card */}
                        <div className="md:col-span-4 bg-white p-5 rounded-2xl shadow-xl shadow-[#007b7f]/5 border border-[#c2c6d4]">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#424752] opacity-50 mb-0.5">Receipt</p>
                                    <p className="font-mono text-xs text-[#007b7f] font-bold">TXN-{Math.random().toString(36).substr(2, 6).toUpperCase()}</p>
                                </div>
                                <div className="bg-[#e0f2f1] text-[#006063] px-3 py-1 rounded-full text-[8px] font-black flex items-center gap-1.5 uppercase tracking-wider">
                                    <MdSecurity size={12} />
                                    HIPAA SECURE
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl overflow-hidden bg-[#f3f4f5] flex items-center justify-center text-[#007b7f]">
                                        <MdMedicalServices size={24} />
                                    </div>
                                    <div>
                                        <p className="text-[8px] font-black uppercase tracking-widest text-[#424752] opacity-50">Practitioner</p>
                                        <p className="font-black text-[#191c1d] text-sm">Specialist Consultant</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[#c2c6d4]/20">
                                    <div>
                                        <p className="text-[8px] font-black uppercase tracking-widest text-[#424752] opacity-50">Status</p>
                                        <p className="font-black text-xs text-[#191c1d]">Confirmed</p>
                                    </div>
                                    <div>
                                        <p className="text-[8px] font-black uppercase tracking-widest text-[#424752] opacity-50">Method</p>
                                        <p className="font-black text-xs text-[#191c1d]">Stripe</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Payment Status Sidebar */}
                        <div className="md:col-span-2 bg-[#006063] text-white p-5 rounded-2xl flex flex-col justify-between shadow-2xl shadow-[#007b7f]/30 relative overflow-hidden group">
                            <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
                            <div className="relative z-10">
                                <p className="text-[8px] font-black uppercase tracking-[0.2em] opacity-60 mb-1">Paid</p>
                                <p className="text-2xl font-black tracking-tighter">Rs.150.00</p>
                            </div>
                            <div className="mt-4 relative z-10">
                                <div className="flex items-center gap-2 text-[8px] font-black uppercase tracking-widest opacity-80 mb-2">
                                    <MdCreditCard size={14} />
                                    SECURE
                                </div>
                                <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden">
                                    <div className="w-full h-full bg-white animate-[progress_1s_ease-in-out]"></div>
                                </div>
                            </div>
                        </div>

                        {/* Small Info Cards */}
                        <div className="md:col-span-3 bg-[#e0f2f1] p-4 rounded-2xl border border-[#007b7f]/5 transition-all">
                            <div className="flex items-center gap-2 mb-2">
                                <MdVideocam size={16} className="text-[#007b7f]" />
                                <p className="font-black text-[#006063] font-headline text-[10px] tracking-tight uppercase">Virtual Visit</p>
                            </div>
                            <p className="text-[9px] text-[#596674] leading-relaxed font-bold">
                                Link sent to portal.
                            </p>
                        </div>
                        <div className="md:col-span-3 bg-[#edeeef] p-4 rounded-2xl border border-[#c2c6d4] transition-all">
                            <div className="flex items-center gap-2 mb-2">
                                <MdDescription size={16} className="text-[#007b7f]" />
                                <p className="font-black text-[#191c1d] font-headline text-[10px] tracking-tight uppercase">Records</p>
                            </div>
                            <p className="text-[9px] text-[#424752] leading-relaxed font-bold opacity-80">
                                Upload before call.
                            </p>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-row gap-3 justify-center">
                        <button 
                            onClick={() => navigate('/')}
                            style={tealAccent}
                            className="text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl shadow-[#007b7f]/20 hover:scale-[1.02] active:scale-95 transition-all"
                        >
                            <span>Dashboard</span>
                            <MdArrowForward className="text-sm" />
                        </button>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="w-full border-t border-[#c2c6d4]/20 bg-white px-8 py-3 flex justify-between items-center opacity-40">
                <div className="text-[8px] font-black uppercase tracking-[0.2em] text-[#424752]">
                    © 2026 CareBridge • Clinical Sanctuary
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
