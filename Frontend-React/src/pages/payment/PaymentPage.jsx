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

    // Form State
    const [formData, setFormData] = useState({
        cardName: "",
        cardNumber: "",
        expiry: "",
        cvv: ""
    });

    const [errors, setErrors] = useState({});

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

    const validateForm = () => {
        const newErrors = {};
        if (!formData.cardName.trim()) newErrors.cardName = "Name is required";
        
        const cardStripped = formData.cardNumber.replace(/\s+/g, '');
        if (!/^\d{16}$/.test(cardStripped)) newErrors.cardNumber = "Invalid card number (16 digits required)";
        
        if (!/^\d{2}\/\d{2}$/.test(formData.expiry)) newErrors.expiry = "Use MM/YY format";
        
        if (!/^\d{3}$/.test(formData.cvv)) newErrors.cvv = "Invalid CVV (3 digits)";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handlePayment = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            toast.error("Please fix the errors in the form.");
            return;
        }

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

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
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
        <div className="bg-[#f8f9fa] text-[#191c1d] min-h-screen font-body selection:bg-[#007b7f]/10">
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

            <main className="pt-24 pb-20 px-6 max-w-5xl mx-auto min-h-screen">
                <div className="flex flex-col md:grid md:grid-cols-12 gap-12">
                    {/* Payment Form Side */}
                    <div className="md:col-span-12 lg:col-span-7 space-y-8">
                        <div className="space-y-3">
                            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-[#191c1d] font-headline">Secure Payment</h1>
                            <p className="text-[#424752] text-sm leading-relaxed opacity-80">
                                Complete your transaction for the upcoming consultation. All data is encrypted and HIPAA compliant.
                            </p>
                        </div>

                        <div className="bg-white p-6 md:p-10 rounded-2xl shadow-xl shadow-[#00488d]/5 border border-[#c2c6d4]/20 space-y-8">
                            <form className="grid grid-cols-1 gap-6" onSubmit={handlePayment}>
                                {/* Card Name */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black tracking-widest text-[#424752] uppercase">Name on Card</label>
                                    <input 
                                        name="cardName"
                                        value={formData.cardName}
                                        onChange={handleInputChange}
                                        className={`w-full bg-[#f3f4f5] border-none rounded-xl p-4 text-sm focus:ring-2 focus:ring-[#007b7f] placeholder:text-[#424752]/30 transition-all outline-none ${errors.cardName ? 'ring-2 ring-red-500' : ''}`} 
                                        placeholder="Johnathan Doe" 
                                        type="text"
                                    />
                                    {errors.cardName && <p className="text-[10px] text-red-500 font-bold uppercase tracking-tight">{errors.cardName}</p>}
                                </div>

                                {/* Card Number */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black tracking-widest text-[#424752] uppercase">Card Number</label>
                                    <div className="relative">
                                        <input 
                                            name="cardNumber"
                                            value={formData.cardNumber}
                                            onChange={(e) => {
                                                const val = e.target.value.replace(/\D/g, '').match(/.{1,4}/g)?.join(' ') || '';
                                                if (val.length <= 19) handleInputChange({ target: { name: 'cardNumber', value: val } });
                                            }}
                                            className={`w-full bg-[#f3f4f5] border-none rounded-xl p-4 pr-12 text-sm focus:ring-2 focus:ring-[#007b7f] placeholder:text-[#424752]/30 transition-all outline-none ${errors.cardNumber ? 'ring-2 ring-red-500' : ''}`} 
                                            placeholder="0000 0000 0000 0000" 
                                            type="text"
                                        />
                                        <MdCreditCard className="absolute right-4 top-1/2 -translate-y-1/2 text-[#424752] opacity-30" size={24} />
                                    </div>
                                    {errors.cardNumber && <p className="text-[10px] text-red-500 font-bold uppercase tracking-tight">{errors.cardNumber}</p>}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    {/* Expiry */}
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black tracking-widest text-[#424752] uppercase">Expiry Date</label>
                                        <input 
                                            name="expiry"
                                            value={formData.expiry}
                                            onChange={(e) => {
                                                let val = e.target.value.replace(/\D/g, '');
                                                if (val.length >= 2) val = val.slice(0, 2) + '/' + val.slice(2, 4);
                                                if (val.length <= 5) handleInputChange({ target: { name: 'expiry', value: val } });
                                            }}
                                            className={`w-full bg-[#f3f4f5] border-none rounded-xl p-4 text-sm focus:ring-2 focus:ring-[#007b7f] placeholder:text-[#424752]/30 transition-all outline-none ${errors.expiry ? 'ring-2 ring-red-500' : ''}`} 
                                            placeholder="MM / YY" 
                                            type="text"
                                        />
                                        {errors.expiry && <p className="text-[10px] text-red-500 font-bold uppercase tracking-tight">{errors.expiry}</p>}
                                    </div>
                                    {/* CVV */}
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black tracking-widest text-[#424752] uppercase">CVV</label>
                                        <div className="relative">
                                            <input 
                                                name="cvv"
                                                value={formData.cvv}
                                                onChange={(e) => {
                                                    const val = e.target.value.replace(/\D/g, '');
                                                    if (val.length <= 3) handleInputChange({ target: { name: 'cvv', value: val } });
                                                }}
                                                className={`w-full bg-[#f3f4f5] border-none rounded-xl p-4 pr-12 text-sm focus:ring-2 focus:ring-[#007b7f] placeholder:text-[#424752]/30 transition-all outline-none ${errors.cvv ? 'ring-2 ring-red-500' : ''}`} 
                                                placeholder="***" 
                                                type="password"
                                            />
                                            <MdLock className="absolute right-4 top-1/2 -translate-y-1/2 text-[#424752] opacity-30" size={20} />
                                        </div>
                                        {errors.cvv && <p className="text-[10px] text-red-500 font-bold uppercase tracking-tight">{errors.cvv}</p>}
                                    </div>
                                </div>

                                <div className="pt-6">
                                    <button 
                                        type="submit"
                                        disabled={paying}
                                        style={tealAccent}
                                        className="w-full text-white font-black py-4.5 rounded-2xl shadow-xl shadow-[#007b7f]/20 hover:scale-[1.01] active:scale-[0.98] transition-all flex justify-center items-center gap-2 disabled:opacity-70"
                                    >
                                        <span>{paying ? "Authenticating..." : `Pay Rs.${totalAmount.toFixed(2)} Now`}</span>
                                        <MdArrowForward className="text-xl" />
                                    </button>
                                </div>
                            </form>

                            {/* Trust Indicators */}
                            <div className="flex flex-wrap justify-between items-center pt-6 gap-4 border-t border-[#c2c6d4]/20">
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
                    <div className="md:col-span-12 lg:col-span-5 space-y-6">
                        <div className="bg-[#f3f4f5] p-8 rounded-3xl space-y-8 border border-[#c2c6d4]/10 shadow-sm">
                            <h2 className="text-2xl font-black tracking-tight text-[#191c1d] font-headline">Consultation Summary</h2>
                            
                            <div className="space-y-6">
                                <div className="flex justify-between items-start gap-4">
                                    <div>
                                        <p className="font-black text-[#191c1d] text-base">Specialist Consultation</p>
                                        <p className="text-xs font-bold text-[#424752] opacity-70 mt-1 uppercase tracking-tight">
                                            {appointment.doctorName}
                                        </p>
                                    </div>
                                    <p className="font-black text-[#191c1d]">Rs.{appointment.consultationFee.toFixed(2)}</p>
                                </div>
                                
                                <div className="flex justify-between items-center text-sm font-medium text-[#424752]">
                                    <p>Administrative Fee</p>
                                    <p>Rs.{platformFee.toFixed(2)}</p>
                                </div>

                                <div className="h-px bg-[#c2c6d4]/30"></div>
                                
                                <div className="flex justify-between items-center pt-2">
                                    <p className="text-lg font-black font-headline tracking-tight">Total Amount</p>
                                    <p className="text-3xl font-black text-[#007b7f] tracking-tighter">
                                        Rs.{totalAmount.toFixed(2)}
                                    </p>
                                </div>
                            </div>

                            {/* Secure Status Indicator */}
                            <div className="bg-[#e0f2f1] text-[#006063] px-5 py-4 rounded-2xl flex items-center gap-4">
                                <MdSecurity size={28} className="shrink-0" />
                                <div className="text-[10px] leading-tight font-black uppercase tracking-wider">
                                    <p className="mb-0.5">Secure Checkout</p>
                                    <p className="opacity-60 font-medium normal-case">Protected with 256-bit AES encryption</p>
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
            <footer className="w-full border-t border-[#c2c6d4]/20 bg-white">
                <div className="flex flex-col md:flex-row justify-between items-center px-8 py-12 gap-6 max-w-7xl mx-auto">
                    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[#424752] opacity-40">
                        © 2026 CareBridge Clinical Sanctuary. HIPAA Compliant.
                    </div>
                    <div className="flex gap-8 text-[9px] font-black uppercase tracking-[0.2em] text-[#424752] opacity-60">
                        <a className="hover:text-[#007b7f] transition-colors" href="#">Privacy Policy</a>
                        <a className="hover:text-[#007b7f] transition-colors" href="#">Terms of Service</a>
                        <a className="hover:text-[#007b7f] transition-colors" href="#">Security Standards</a>
                    </div>
                </div>
            </footer>
        </div>
    );
}
