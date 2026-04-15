import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { 
    MdSecurity, MdCreditCard, MdLock, MdVerifiedUser, 
    MdArrowForward, MdInfo, MdSchedule, MdHistory,
    MdMedicalServices, MdNotifications
} from "react-icons/md";

const tealAccent = { background: 'linear-gradient(135deg, #006063 0%, #007b7f 100%)' };
const primaryTeal = '#007b7f';
const darkTeal = '#006063';

export default function PaymentPage() {
    const { appointmentId } = useParams();
    const navigate = useNavigate();
    const [appointment, setAppointment] = useState(null);
    const [loading, setLoading] = useState(true);
    const [paying, setPaying] = useState(false);


    useEffect(() => {
        const fetchAppointment = async () => {
            const token = localStorage.getItem("token");
            
            if (!token) {
                toast.error("Please login to proceed with payment.");
                navigate("/login");
                return;
            }

            try {
                const config = {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                };
                // Fixed path to match teammate's /:id/status design
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/appointments/${appointmentId}/status`, config);
                setAppointment(response.data.data);
            } catch (err) {
                console.error("Error fetching appointment:", err);
                toast.error("Failed to load appointment details.");
            } finally {
                setLoading(false);
            }
        };

        fetchAppointment();
    }, [appointmentId, navigate]);


    const handlePayment = async (e) => {
        e.preventDefault();
        

        try {
            setPaying(true);
            const config = {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            };
            
            const response = await axios.post(
                `${import.meta.env.VITE_API_URL}/api/payment/create-checkout-session`,
                { 
                    appointmentId, 
                    amount: appointment.consultationFee 
                },
                config
            );

            if (response.data.url) {
                window.location.href = response.data.url;
            }
        } catch (err) {
            console.error("Payment error:", err);
            toast.error("Payment initialization failed. Please try again.");
        } finally {
            setPaying(false);
        }
    };


    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#f8f9fa]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-[#007b7f]"></div>
            </div>
        );
    }

    if (!appointment) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8f9fa] p-4 text-center">
                <MdSecurity className="text-6xl text-[#007b7f]/20 mb-4" />
                <h2 className="text-2xl font-bold text-[#191c1d] mb-4 font-headline uppercase tracking-tight">Session Not Found</h2>
                <button 
                    onClick={() => navigate('/')}
                    className="text-[#007b7f] font-black uppercase tracking-widest text-xs"
                >
                    Back to Dashboard
                </button>
            </div>
        );
    }

    const platformFee = 25.00;
    const totalAmount = (appointment.consultationFee || 0) + platformFee;

    return (
        <div className="bg-[#f8f9fa] text-[#191c1d] h-screen font-body selection:bg-[#007b7f]/10 overflow-hidden flex flex-col">
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
                        <button className="p-2 text-[#007b7f] hover:bg-[#edeeef] transition-colors rounded-full transition-all active:scale-95 duration-150">
                            <MdNotifications size={24} />
                        </button>
                        <div className="w-8 h-8 rounded-full bg-[#007b7f]/5 border border-[#007b7f]/10 overflow-hidden">
                        </div>
                    </div>
                </div>
            </header>

            <main className="flex-1 pt-20 pb-4 px-6 max-w-5xl mx-auto w-full overflow-hidden flex flex-col justify-center">
                <div className="flex flex-col md:grid md:grid-cols-12 gap-8">
                    {/* Payment Form Side */}
                    <div className="md:col-span-12 lg:col-span-7 space-y-6">
                        <div className="space-y-2">
                            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-[#191c1d] font-headline uppercase italic">Secure Payment</h1>
                            <p className="text-[#424752] text-[11px] leading-relaxed opacity-80 uppercase tracking-wider font-bold">
                                Encrypted & HIPAA compliant transaction
                            </p>
                        </div>

                        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-xl shadow-[#00488d]/5 border border-[#c2c6d4] space-y-6">
                            <div className="space-y-4">
                                <div className="flex items-center gap-4 p-4 bg-[#f8f9fa] border border-[#c2c6d4]/30 rounded-2xl">
                                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm border border-[#c2c6d4]/20">
                                        <MdCreditCard className="text-[#007b7f]" size={24} />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-[#191c1d]">Stripe Secure Portal</p>
                                        <p className="text-[9px] text-[#424752] opacity-60">Redirecting to verified gateway.</p>
                                    </div>
                                    <div className="px-3 py-1 bg-[#e0f2f1] text-[#006063] text-[8px] font-black uppercase tracking-tighter rounded-full">
                                        Active
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="p-5 bg-[#fff9c4]/20 border border-[#fff176]/50 rounded-2xl flex items-start gap-3">
                                        <MdInfo className="text-[#fbc02d] mt-0.5" size={20} />
                                        <p className="text-[10px] text-[#574c00] leading-relaxed font-medium">
                                            We use Stripe for secure, encrypted payment processing. No credit card information is stored on our servers, ensuring your clinical records and financial data stay separate and secure.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-2 space-y-3">
                                <button 
                                    onClick={handlePayment}
                                    disabled={paying}
                                    style={tealAccent}
                                    className="w-full text-white font-black py-4 rounded-2xl shadow-xl shadow-[#007b7f]/20 hover:scale-[1.01] active:scale-[0.98] transition-all flex justify-center items-center gap-3 disabled:opacity-70 group"
                                >
                                    <span className="text-sm tracking-wide uppercase italic">{paying ? "Opening Portal..." : `Checkout Rs.${totalAmount.toFixed(2)}`}</span>
                                    <MdArrowForward className="text-xl group-hover:translate-x-1 transition-transform" />
                                </button>

                                <button 
                                    type="button"
                                    onClick={() => navigate('/cancel')}
                                    className="w-full bg-[#f3f4f5] text-[#424752] font-black py-3 rounded-xl text-[9px] uppercase tracking-[0.2em] hover:bg-[#edeeef] transition-all active:scale-[0.98] border border-[#c2c6d4]/30"
                                >
                                    Cancel and return
                                </button>
                            </div>

                            {/* Trust Indicators */}
                            <div className="flex flex-wrap justify-between items-center pt-8 gap-4 border-t border-[#c2c6d4]/20">
                                <div className="flex items-center gap-2 text-[#424752]">
                                    <MdVerifiedUser className="text-[#007b7f]" size={18} />
                                    <span className="text-[9px] font-black uppercase tracking-[0.15em]">PCI-DSS Compliant</span>
                                </div>
                                <div className="flex items-center gap-2 text-[#424752]">
                                    <MdSecurity className="text-[#007b7f]" size={18} />
                                    <span className="text-[9px] font-black uppercase tracking-[0.15em]">HIPAA Secure</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Order Summary Side */}
                    <div className="md:col-span-12 lg:col-span-5 space-y-4">
                        <div className="bg-[#f3f4f5] p-6 rounded-3xl space-y-6 border border-[#c2c6d4]/10 shadow-sm">
                            <h2 className="text-xl font-black tracking-tight text-[#191c1d] font-headline uppercase italic">Summary</h2>
                            
                            <div className="space-y-4">
                                <div className="flex justify-between items-start gap-4">
                                    <div>
                                        <p className="font-black text-[#191c1d] text-sm">Specialist Consultation</p>
                                        <p className="text-[10px] font-bold text-[#424752] opacity-70 mt-0.5 uppercase tracking-tight">
                                            {appointment.doctorName}
                                        </p>
                                    </div>
                                    <p className="font-black text-[#191c1d] text-sm">Rs.{appointment.consultationFee.toFixed(2)}</p>
                                </div>
                                
                                <div className="flex justify-between items-center text-xs font-medium text-[#424752]">
                                    <p>Admin Fee</p>
                                    <p>Rs.{platformFee.toFixed(2)}</p>
                                </div>

                                <div className="h-px bg-[#c2c6d4]/30"></div>
                                
                                <div className="flex justify-between items-center pt-1">
                                    <p className="text-sm font-black font-headline tracking-tight uppercase">Total</p>
                                    <p className="text-2xl font-black text-[#007b7f] tracking-tighter">
                                        Rs.{totalAmount.toFixed(2)}
                                    </p>
                                </div>
                            </div>

                            {/* Secure Status Indicator */}
                            <div className="bg-[#e0f2f1] text-[#006063] px-4 py-3 rounded-2xl flex items-center gap-3">
                                <MdSecurity size={24} className="shrink-0" />
                                <div className="text-[9px] leading-tight font-black uppercase tracking-wider">
                                    <p className="mb-0.5">Secure Checkout</p>
                                    <p className="opacity-60 font-medium normal-case">256-bit AES encryption</p>
                                </div>
                            </div>
                        </div>

                        {/* Bento Style Secondary Info */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-[#f3f4f5] p-5 rounded-2xl flex flex-col items-center justify-center text-center gap-3 border border-[#c2c6d4]/10">
                                <MdSchedule className="text-[#007b7f] text-2xl" />
                                <p className="text-[9px] font-black uppercase tracking-widest text-[#424752] opacity-70 leading-tight">Instant Confirmation</p>
                            </div>
                            <div className="bg-[#f3f4f5] p-5 rounded-2xl flex flex-col items-center justify-center text-center gap-3 border border-[#c2c6d4]/10">
                                <MdHistory className="text-[#007b7f] text-2xl" />
                                <p className="text-[9px] font-black uppercase tracking-widest text-[#424752] opacity-70 leading-tight">Patient Support 24/7</p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="w-full border-t border-[#c2c6d4]/20 bg-white py-4 px-8">
                <div className="flex flex-row justify-between items-center max-w-7xl mx-auto opacity-40">
                    <p className="text-[8px] font-black uppercase tracking-widest text-[#424752]">© 2026 CareBridge • HIPAA Secure</p>
                    <div className="flex gap-4 text-[8px] font-black uppercase tracking-widest text-[#424752]">
                        <a href="#">Privacy</a>
                        <a href="#">Terms</a>
                    </div>
                </div>
            </footer>
        </div>
    );
}
