import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
    MdDashboard, MdPayments, MdMedication, MdVerifiedUser, 
    MdHelpOutline, MdAdd, MdSearch, MdFilterList, 
    MdDownload, MdMoreHoriz, MdTrendingUp, MdSecurity,
    MdNotifications, MdHistory, MdMedicalServices, MdCheckCircle, MdRotateRight
} from 'react-icons/md';
import { generateReceiptPDF } from '../../utils/receiptGenerator';
import toast from 'react-hot-toast';

const tealAccent = { background: 'linear-gradient(135deg, #006063 0%, #007b7f 100%)' };

export default function PaymentHistory() {
    const navigate = useNavigate();
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [downloadingId, setDownloadingId] = useState(null);

    useEffect(() => {
        const fetchPayments = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/payment`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                setPayments(response.data);
            } catch (error) {
                console.error('Error fetching payments:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchPayments();
    }, []);

    const handleDownloadReceipt = async (payment) => {
        try {
            setDownloadingId(payment._id);
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            
            // 1. Fetch full appointment details (needed for Doctor Name, Specialty, etc.)
            const response = await axios.get(
                `${import.meta.env.VITE_API_URL}/api/appointments/${payment.appointmentId}/status`, 
                config
            );
            
            const appointment = response.data.data;
            
            // 2. Generate PDF
            generateReceiptPDF({ payment, appointment });
            
            toast.success("Receipt downloaded successfully!");
        } catch (error) {
            console.error('Error generating receipt:', error);
            const errorMsg = error.response?.data?.message || error.message;
            toast.error(`Error: ${errorMsg}`);
        } finally {
            setDownloadingId(null);
        }
    };

    const totalSpent = payments
        .filter(p => p.status === 'completed')
        .reduce((sum, p) => sum + p.amount, 0);

    const filteredPayments = payments.filter(payment => 
        payment.appointmentId.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.status.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="bg-[#f8f9fa] text-[#191c1d] min-h-screen font-body selection:bg-[#007b7f]/10 flex flex-col">
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
                        <button className="p-2 text-[#424752] hover:bg-[#edeeef] transition-colors rounded-full">
                            <MdNotifications size={24} />
                        </button>
                        <button className="p-2 text-[#424752] hover:bg-[#edeeef] transition-colors rounded-full">
                            <MdHistory size={24} />
                        </button>
                        <div className="w-8 h-8 rounded-full bg-[#007b7f]/5 border border-[#007b7f]/10 overflow-hidden">
                        </div>
                    </div>
                </div>
            </header>

            <div className="flex pt-16 flex-grow">
                {/* SideNavBar */}
                <aside className="hidden md:flex flex-col p-4 gap-2 h-[calc(100vh-64px)] w-64 border-r border-[#c2c6d4]/20 bg-white sticky top-16">
                    <div className="flex items-center gap-3 px-2 py-4 mb-4">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white" style={tealAccent}>
                            <MdMedicalServices size={24} />
                        </div>
                        <div>
                            <div className="text-sm font-black text-[#191c1d]">Patient Portal</div>
                            <div className="text-[10px] text-[#424752]/60 uppercase font-black tracking-widest">Secure Access</div>
                        </div>
                    </div>
                    
                    <nav className="flex-1 space-y-1">
                        {[
                            { icon: <MdDashboard />, label: 'Dashboard', path: '/' },
                            { icon: <MdPayments />, label: 'Payments', path: '/payment-history', active: true },
                            { icon: <MdMedication />, label: 'Prescriptions', path: '#' },
                            { icon: <MdVerifiedUser />, label: 'Insurance', path: '#' },
                            { icon: <MdHelpOutline />, label: 'Support', path: '#' },
                        ].map((item, idx) => (
                            <button 
                                key={idx}
                                onClick={() => item.path !== '#' && navigate(item.path)}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all font-black text-xs uppercase tracking-tight ${item.active ? 'bg-[#e0f2f1] text-[#006063]' : 'text-[#424752] hover:bg-[#f3f4f5]'}`}
                            >
                                <span className="text-lg">{item.icon}</span>
                                <span>{item.label}</span>
                            </button>
                        ))}
                    </nav>

                    <button style={tealAccent} className="mt-auto text-white py-3.5 rounded-xl font-black text-[10px] uppercase tracking-widest active:scale-95 transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#007b7f]/20">
                        <MdAdd size={18} />
                        New Consultation
                    </button>
                </aside>

                {/* Main Content Area */}
                <main className="flex-1 p-6 md:p-10 max-w-6xl mx-auto w-full">
                    <header className="mb-10">
                        <h1 className="text-4xl font-black tracking-tight text-[#191c1d] mb-2 font-headline uppercase italic">Payment <span className="text-[#007b7f]">History.</span></h1>
                        <p className="text-[#424752]/70 text-sm font-medium max-w-2xl leading-relaxed">Review and manage your medical billing, consultation fees, and insurance claims in our secure HIPAA-compliant vault.</p>
                    </header>

                    {/* Summary Bento Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                        <div className="col-span-1 md:col-span-2 bg-white p-8 rounded-3xl shadow-xl shadow-[#007b7f]/5 flex flex-col justify-between relative overflow-hidden group border border-[#c2c6d4]/20">
                            <div className="relative z-10">
                                <span className="text-[10px] font-black text-[#424752]/50 uppercase tracking-[0.2em]">Total Spent Year-to-Date</span>
                                <div className="text-5xl font-black text-[#007b7f] mt-3 tracking-tighter">Rs.{totalSpent.toFixed(2)}</div>
                            </div>
                            <div className="mt-8 flex gap-4 relative z-10">
                                <div className="bg-[#e0f2f1] text-[#006063] px-3 py-1 rounded-full text-[9px] font-black flex items-center gap-1.5 uppercase tracking-wider">
                                    <MdTrendingUp size={14} />
                                    12% vs last year
                                </div>
                                <div className="text-[10px] text-[#424752]/60 font-bold flex items-center uppercase tracking-tight">Includes all referrals</div>
                            </div>
                            <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-[#007b7f]/5 rounded-full blur-3xl group-hover:bg-[#007b7f]/10 transition-colors"></div>
                        </div>

                        <div className="bg-[#006063] text-white p-8 rounded-3xl flex flex-col justify-center shadow-2xl shadow-[#007b7f]/30">
                            <div className="text-white/60 font-black text-[10px] uppercase tracking-[0.2em] mb-4">Transactions</div>
                            <div className="flex items-baseline gap-2">
                                <span className="text-6xl font-black tracking-tighter">{payments.length}</span>
                                <span className="text-white/60 font-black text-xs uppercase tracking-tighter">Payments</span>
                            </div>
                            <div className="mt-6 w-full bg-white/20 h-1.5 rounded-full overflow-hidden">
                                <div className="bg-white h-full" style={{ width: '85%' }}></div>
                            </div>
                            <div className="mt-3 text-[10px] text-white/50 font-black uppercase tracking-widest">85% Processed successfully</div>
                        </div>
                    </div>

                    {/* Transactions Section */}
                    <section className="bg-white rounded-3xl shadow-xl shadow-[#007b7f]/5 border border-[#c2c6d4] overflow-hidden">
                        <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#c2c6d4]/10">
                            <div className="relative flex-1 max-w-md">
                                <MdSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[#424752]/40" size={20} />
                                <input 
                                    className="w-full pl-11 pr-4 py-3 bg-[#f3f4f5] border border-[#c2c6d4]/40 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#007b7f]/20 focus:border-[#007b7f] transition-all outline-none" 
                                    placeholder="Search by ID or status..." 
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <div className="flex gap-2">
                                <button className="px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-[#007b7f] text-white shadow-md">All Time</button>
                                <button className="px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-[#f3f4f5] text-[#424752] hover:bg-[#edeeef] transition-colors">Pending</button>
                                <button className="px-3 py-2.5 rounded-xl bg-[#f3f4f5] text-[#424752] hover:bg-[#edeeef] transition-colors"><MdFilterList size={18} /></button>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-[#f3f4f5]/50 border-b border-[#c2c6d4]/10">
                                        <th className="px-6 py-4 text-[10px] font-black text-[#424752]/50 uppercase tracking-[0.2em]">Date</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-[#424752]/50 uppercase tracking-[0.2em]">Consultation ID</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-[#424752]/50 uppercase tracking-[0.2em]">Amount</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-[#424752]/50 uppercase tracking-[0.2em]">Status</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-[#424752]/50 uppercase tracking-[0.2em]">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#c2c6d4]/10">
                                    {loading ? (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-12 text-center text-sm text-[#424752]/40 font-black animate-pulse uppercase tracking-widest">Encrypting clinical data...</td>
                                        </tr>
                                    ) : filteredPayments.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-12 text-center text-sm text-[#424752]/40 font-black uppercase tracking-widest">No secure records found</td>
                                        </tr>
                                    ) : filteredPayments.map((payment) => (
                                        <tr key={payment._id} className="hover:bg-[#f3f4f5]/30 transition-colors">
                                            <td className="px-6 py-5 text-xs font-bold text-[#191c1d]">
                                                {new Date(payment.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="text-xs font-black text-[#191c1d]">#{payment.appointmentId}</div>
                                                <div className="text-[9px] text-[#424752]/50 font-black uppercase tracking-widest mt-0.5">Clinical ID</div>
                                            </td>
                                            <td className="px-6 py-5 text-xs font-black text-[#007b7f]">Rs.{payment.amount.toFixed(2)}</td>
                                            <td className="px-6 py-5">
                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${
                                                    payment.status === 'completed' ? 'bg-[#e0f2f1] text-[#006063]' :
                                                    payment.status === 'pending' ? 'bg-[#fff3e0] text-[#e65100]' :
                                                    'bg-[#ffebee] text-[#c62828]'
                                                }`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full mr-2 ${
                                                        payment.status === 'completed' ? 'bg-[#007b7f]' :
                                                        payment.status === 'pending' ? 'bg-[#ff9800]' :
                                                        'bg-[#f44336]'
                                                    }`}></span>
                                                    {payment.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5">
                                                <button 
                                                   onClick={() => handleDownloadReceipt(payment)}
                                                   disabled={downloadingId === payment._id}
                                                   className="text-[#007b7f] hover:text-[#006063] disabled:opacity-50 transition-colors flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest"
                                                >
                                                    {downloadingId === payment._id ? (
                                                        <MdRotateRight className="animate-spin" size={14} />
                                                    ) : (
                                                        <MdDownload size={14} />
                                                    )}
                                                    {downloadingId === payment._id ? 'Generating...' : 'Receipt'}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>

                    <div className="mt-8 flex items-center gap-4 p-5 bg-[#e0f2f1]/40 rounded-2xl border border-[#007b7f]/10 shadow-sm">
                        <div className="w-10 h-10 rounded-full bg-[#007b7f] flex items-center justify-center text-white shadow-md">
                            <MdSecurity size={20} />
                        </div>
                        <p className="text-[10px] font-black text-[#006063] uppercase tracking-widest leading-relaxed">
                            All financial data is encrypted and managed through our secure healthcare payment gateway.<br />
                            For billing inquiries, contact patient support.
                        </p>
                    </div>
                </main>
            </div>

            <footer className="w-full border-t border-[#c2c6d4]/20 bg-white flex flex-col md:flex-row justify-between items-center px-12 py-12 gap-8">
                <div className="text-[9px] font-black uppercase tracking-[0.2em] text-[#424752] opacity-40">
                    © 2026 CareBridge Clinical Sanctuary. HIPAA Compliant & Secure.
                </div>
                <div className="flex flex-wrap justify-center gap-8">
                    <a className="text-[9px] font-black uppercase tracking-[0.2em] text-[#424752] hover:text-[#007b7f] transition-all opacity-40 hover:opacity-100" href="#">Privacy Policy</a>
                    <a className="text-[9px] font-black uppercase tracking-[0.2em] text-[#424752] hover:text-[#007b7f] transition-all opacity-40 hover:opacity-100" href="#">Terms of Service</a>
                    <a className="text-[9px] font-black uppercase tracking-[0.2em] text-[#424752] hover:text-[#007b7f] transition-all opacity-40 hover:opacity-100" href="#">Security Standards</a>
                </div>
            </footer>
        </div>
    );
}
