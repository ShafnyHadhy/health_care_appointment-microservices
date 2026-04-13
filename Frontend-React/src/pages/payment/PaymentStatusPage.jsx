import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
    MdVerifiedUser, MdLock, MdCheck, MdNotifications, 
    MdHistory, MdMedicalServices 
} from "react-icons/md";

export default function PaymentStatusPage() {
    const { appointmentId } = useParams();
    const navigate = useNavigate();
    const [step, setStep] = useState(1);

    useEffect(() => {
        // Step 1: Initialized (Immediate)
        // Step 2: Verifying (after 1s)
        const timer1 = setTimeout(() => setStep(2), 1000);
        // Step 3: Redirect to Success (after 3.5s)
        const timer2 = setTimeout(() => {
            navigate('/success');
        }, 3500);

        return () => {
            clearTimeout(timer1);
            clearTimeout(timer2);
        };
    }, [navigate]);

    return (
        <div className="bg-[#f8f9fa] text-[#191c1d] h-screen font-body antialiased selection:bg-[#007b7f]/10 overflow-hidden">
            {/* TopAppBar */}
            <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl shadow-sm border-b border-[#007b7f]/5">
                <div className="flex justify-between items-center px-6 py-3 max-w-7xl mx-auto">
                    <div className="text-xl font-black tracking-tighter text-[#007b7f] font-headline">The Sanctuary</div>
                    <nav className="hidden md:flex gap-8 items-center font-medium tracking-tight text-sm">
                        <a className="text-[#424752] hover:text-[#007b7f] transition-colors" href="#">Consultations</a>
                        <a className="text-[#424752] hover:text-[#007b7f] transition-colors" href="#">Health Records</a>
                        <a className="text-[#424752] hover:text-[#007b7f] transition-colors" href="#">Messages</a>
                    </nav>
                    <div className="flex items-center gap-4">
                        <button className="p-2 text-[#424752] hover:bg-[#edeeef] transition-colors rounded-full active:scale-95 duration-150">
                            <MdNotifications size={24} />
                        </button>
                        <button className="p-2 text-[#424752] hover:bg-[#edeeef] transition-colors rounded-full active:scale-95 duration-150">
                            <MdHistory size={24} />
                        </button>
                        <div className="w-8 h-8 rounded-full bg-[#007b7f]/5 border border-[#007b7f]/10 overflow-hidden">
                        </div>
                    </div>
                </div>
            </header>

            <main className="min-h-screen pt-24 pb-12 px-6 flex items-center justify-center relative overflow-hidden">
                {/* Background Editorial Element */}
                <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
                    <div className="absolute top-[10%] right-[-5%] w-96 h-96 bg-[#007b7f]/5 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-[10%] left-[-5%] w-80 h-80 bg-[#b2dfdb]/30 rounded-full blur-3xl"></div>
                </div>

                <div className="relative z-10 w-full max-w-2xl">
                    {/* Processing Card */}
                    <div className="bg-white rounded-3xl p-12 text-center shadow-xl shadow-[#007b7f]/5 border border-[#c2c6d4]/20 flex flex-col items-center">
                        {/* Status Visualizer */}
                        <div className="relative mb-8">
                            <div className="spinner-ring"></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <MdVerifiedUser className="text-[#007b7f] text-4xl" />
                            </div>
                        </div>

                        {/* Messaging Hierarchy */}
                        <h1 className="text-3xl font-black tracking-tight text-[#191c1d] mb-4 font-headline uppercase leading-tight">Verifying your payment...</h1>
                        <p className="text-[#424752] text-lg max-w-md mx-auto leading-relaxed mb-10 opacity-80">
                            Please stay on this page. We are securely communicating with your financial institution to finalize your clinical appointment booking.
                        </p>

                        {/* Secure Progress Indicator */}
                        <div className="w-full max-w-sm space-y-6">
                            <div className="flex items-center gap-3 justify-center mb-8">
                                <div className="bg-[#e0f2f1] px-4 py-1.5 rounded-full flex items-center gap-2 shadow-sm">
                                    <MdLock className="text-[#006063] text-sm" />
                                    <span className="text-[#006063] text-[10px] font-black tracking-[0.15em] uppercase">End-to-End Encrypted</span>
                                </div>
                            </div>

                            {/* Bento-style status steps */}
                            <div className="grid grid-cols-1 gap-3 text-left">
                                <div className={`p-5 rounded-2xl flex items-center gap-4 transition-all duration-500 ${step >= 1 ? 'bg-[#f3f4f5] border border-[#c2c6d4]/20' : 'opacity-40'}`}>
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-[#007b7f] text-white' : 'bg-[#c2c6d4]'}`}>
                                        <MdCheck size={14} />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-black text-[#191c1d] uppercase tracking-tighter">Payment method initialized</p>
                                    </div>
                                </div>

                                <div className={`p-5 rounded-2xl flex items-center gap-4 transition-all duration-500 border-l-4 border-[#007b7f] ${step >= 2 ? 'bg-white shadow-md' : 'bg-[#f3f4f5] opacity-50'}`}>
                                    <div className="w-6 h-6 rounded-full border-2 border-[#007b7f] flex items-center justify-center">
                                        <div className="w-2 h-2 bg-[#007b7f] rounded-full animate-pulse"></div>
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-black text-[#007b7f] uppercase tracking-tighter">Verifying transaction status</p>
                                        <div className="h-1.5 w-full bg-[#007b7f]/10 rounded-full mt-2 overflow-hidden">
                                            <div className="h-full bg-[#007b7f] shimmer w-full"></div>
                                        </div>
                                    </div>
                                </div>

                                <div className={`p-5 rounded-2xl flex items-center gap-4 transition-all duration-500 ${step >= 3 ? 'bg-[#f3f4f5]' : 'bg-[#f3f4f5] opacity-40'}`}>
                                    <div className="w-6 h-6 rounded-full bg-[#c2c6d4] flex items-center justify-center"></div>
                                    <div className="flex-1">
                                        <p className="text-sm font-black text-[#424752] opacity-60 uppercase tracking-tighter">Confirming health record sync</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Technical ID for reassurance */}
                        <div className="mt-12 pt-8 border-t border-[#c2c6d4]/20 w-full flex flex-col md:flex-row items-center justify-between gap-6">
                            <div className="text-left">
                                <p className="text-[10px] uppercase tracking-[0.2em] text-[#424752] font-black opacity-50 mb-1">Transaction Identity</p>
                                <p className="text-sm font-mono text-[#007b7f] font-bold tracking-tight">CB-{Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
                            </div>
                            <div className="flex items-center gap-2 opacity-60">
                                <span className="text-[9px] font-black text-[#424752] uppercase tracking-widest ">PCI-DSS Secure Gateway</span>
                            </div>
                        </div>
                    </div>

                    {/* Contextual Help */}
                    <div className="mt-8 text-center">
                        <p className="text-sm text-[#424752] font-medium opacity-60">
                            Taking longer than expected? 
                            <a className="text-[#007b7f] font-black hover:underline underline-offset-4 ml-1" href="#">Contact Support</a>
                        </p>
                    </div>
                </div>
            </main>

            <style>{`
                .spinner-ring {
                    border: 4px solid #f3f4f5;
                    border-top-color: #007b7f;
                    border-radius: 50%;
                    width: 90px;
                    height: 90px;
                    animation: spin 1s linear infinite;
                }
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                .shimmer {
                    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent);
                    background-size: 200% 100%;
                    animation: shimmer 1.5s infinite linear;
                }
                @keyframes shimmer {
                    0% { background-position: -200% 0; }
                    100% { background-position: 200% 0; }
                }
            `}</style>
        </div>
    );
}
