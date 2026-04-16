import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
    MdPayments, MdSearch, MdFilterList, 
    MdDownload, MdTrendingUp, MdSecurity,
    MdRotateRight, MdArrowBack
} from 'react-icons/md';
import Header from '../../components/header';
import Footer from '../../components/footer';
import { generateReceiptPDF } from '../../utils/receiptGenerator';
import toast from 'react-hot-toast';

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
                const sortedPayments = response.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                setPayments(sortedPayments);
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
            
            const response = await axios.get(
                `${import.meta.env.VITE_API_URL}/api/appointments/${payment.appointmentId}/status`, 
                config
            );
            
            const appointment = response.data.data;
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

    const completedCount = payments.filter(p => p.status === 'completed').length;
    const successRate = payments.length > 0 ? (completedCount / payments.length) * 100 : 100;

    const filteredPayments = payments.filter(payment => 
        payment.appointmentId.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.status.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="bg-[#fcfdfd] text-[#191c1d] min-h-screen font-body selection:bg-teal-100 flex flex-col">
            <Header />

            <main className="flex-1 p-4 md:p-10 max-w-7xl mx-auto w-full">
                {/* Back Button & Title */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div>
                        <button 
                            onClick={() => navigate('/patient-dashboard')}
                            className="flex items-center gap-2 text-teal-600 font-bold text-xs uppercase tracking-widest hover:gap-3 transition-all mb-4 group"
                        >
                            <MdArrowBack size={18} className="group-hover:-translate-x-1 transition-transform" />
                            Back to Dashboard
                        </button>
                        <h1 className="text-5xl font-black tracking-tight text-[#191c1d] font-headline uppercase italic leading-none">
                            Payment <span className="text-teal-600">History.</span>
                        </h1>
                        <p className="text-slate-500 text-sm font-medium mt-3 max-w-xl leading-relaxed italic">
                            Secure access to your medical financial records. All billing and transaction data is end-to-end encrypted.
                        </p>
                    </div>

                    {/* Quick Stats Bento */}
                    <div className="flex gap-4">
                        <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm flex flex-col items-center justify-center min-w-[140px] text-center">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Success Rate</span>
                            <span className="text-3xl font-black text-teal-600 leading-none">{successRate.toFixed(0)}%</span>
                        </div>
                        <div className="bg-[#006063] p-6 rounded-3xl shadow-xl shadow-[#006063]/20 flex flex-col items-center justify-center min-w-[140px] text-center text-white">
                            <span className="text-[10px] font-black text-white/50 uppercase tracking-widest mb-1">Payments</span>
                            <span className="text-3xl font-black leading-none">{payments.length}</span>
                        </div>
                    </div>
                </div>

                {/* Total Balance Hero */}
                <div className="bg-white p-10 rounded-[40px] shadow-2xl shadow-teal-900/5 mb-12 relative overflow-hidden group border border-slate-100">
                    <div className="relative z-10 flex flex-col md:flex-row justify-between items-end gap-8">
                        <div>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] block mb-4">Cumulative Healthcare Spending</span>
                            <div className="text-7xl font-black text-[#006063] tracking-tighter flex items-start gap-1">
                                <span className="text-3xl mt-2">Rs.</span>
                                {totalSpent.toLocaleString()}
                            </div>
                            <div className="mt-6 flex items-center gap-2">
                                <div className="bg-teal-50 text-teal-700 px-3 py-1 rounded-full text-[10px] font-black flex items-center gap-1.5 uppercase tracking-wider border border-teal-100/50">
                                    <MdTrendingUp size={14} />
                                    Investment in Health
                                </div>
                            </div>
                        </div>
                        
                        <div className="hidden lg:block w-full max-w-xs space-y-4">
                           <p className="text-[11px] text-slate-400 font-medium leading-relaxed italic">
                                "The greatest wealth is health." This total includes all consultation fees, medical reports, and specialist referrals processed through our secure gateway.
                           </p>
                        </div>
                    </div>
                    {/* Abstract background decorations */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-teal-50 rounded-full blur-[100px] opacity-50 -mr-20 -mt-20"></div>
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-teal-50 rounded-full blur-[60px] opacity-30 -ml-10 -mb-10"></div>
                </div>

                {/* Data Section */}
                <section className="bg-white rounded-[40px] shadow-xl shadow-slate-200/50 border border-slate-200 flex flex-col overflow-hidden">
                    <div className="p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-100">
                        <div className="relative flex-1 max-w-lg">
                            <MdSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={24} />
                            <input 
                                className="w-full pl-14 pr-6 py-4 bg-slate-50 border-none rounded-3xl text-sm font-semibold focus:ring-4 focus:ring-teal-500/10 transition-all outline-none placeholder:text-slate-300" 
                                placeholder="Search transactions by ID, status or amount..." 
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex bg-slate-50 p-1.5 rounded-3xl gap-1 border border-slate-100">
                            <button className="px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest bg-white text-teal-600 shadow-sm border border-slate-200/50">Records</button>
                            <button className="px-3 py-2.5 rounded-2xl text-slate-400 hover:text-teal-600 transition-colors"><MdFilterList size={22} /></button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-50/50">
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Transaction Date</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Appointment Identity</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Fee (LKR)</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Settlement</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Receipt</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {loading ? (
                                    <tr>
                                        <td colSpan="5" className="px-8 py-20 text-center text-sm text-slate-400 font-bold animate-pulse uppercase tracking-widest">Synchronizing secure records...</td>
                                    </tr>
                                ) : filteredPayments.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-8 py-20 text-center text-sm text-slate-400 font-bold uppercase tracking-widest">No matching logs discovered</td>
                                    </tr>
                                ) : filteredPayments.map((payment) => (
                                    <tr key={payment._id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-8 py-7">
                                            <div className="text-xs font-bold text-slate-900">{new Date(payment.createdAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</div>
                                            <div className="text-[9px] text-slate-400 font-black uppercase tracking-tighter mt-1">{new Date(payment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                        </td>
                                        <td className="px-8 py-7">
                                            <div className="text-xs font-black text-slate-900">REF-{payment.appointmentId.slice(-8).toUpperCase()}</div>
                                            <div className="text-[9px] text-teal-600 font-black uppercase tracking-widest mt-0.5">Validated Transaction</div>
                                        </td>
                                        <td className="px-8 py-7 text-sm font-black text-[#006063] text-right">Rs. {payment.amount.toFixed(2)}</td>
                                        <td className="px-8 py-7">
                                            <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.15em] border ${
                                                payment.status === 'completed' ? 'bg-teal-50 text-teal-700 border-teal-100' :
                                                payment.status === 'pending' ? 'bg-orange-50 text-orange-700 border-orange-100' :
                                                'bg-rose-50 text-rose-700 border-rose-100'
                                            }`}>
                                                <span className={`w-1.5 h-1.5 rounded-full mr-2.5 ${
                                                    payment.status === 'completed' ? 'bg-teal-600' :
                                                    payment.status === 'pending' ? 'bg-orange-500' :
                                                    'bg-rose-500'
                                                }`}></span>
                                                {payment.status}
                                            </span>
                                        </td>
                                        <td className="px-8 py-7 text-center">
                                            <button 
                                               onClick={() => handleDownloadReceipt(payment)}
                                               disabled={downloadingId === payment._id}
                                               className="bg-white border border-slate-200 text-slate-800 hover:bg-teal-600 hover:text-white hover:border-teal-600 p-3 rounded-2xl disabled:opacity-30 transition-all shadow-sm active:scale-90 inline-flex items-center justify-center group"
                                            >
                                                {downloadingId === payment._id ? (
                                                    <MdRotateRight className="animate-spin" size={20} />
                                                ) : (
                                                    <MdDownload size={20} className="group-hover:-translate-y-0.5 transition-transform" />
                                                )}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>

                <div className="mt-12 p-8 bg-slate-900 text-white rounded-[40px] flex flex-col md:flex-row items-center gap-8 border border-slate-800 shadow-2xl">
                    <div className="w-16 h-16 rounded-[24px] bg-teal-500 flex items-center justify-center text-white shrink-0 shadow-lg shadow-teal-500/30">
                        <MdSecurity size={36} />
                    </div>
                    <div>
                        <h4 className="text-sm font-black uppercase tracking-[0.2em] mb-2">Secure Ledger Technology</h4>
                        <p className="text-xs text-slate-400 font-medium leading-relaxed">
                            Your billing history is protected by 256-bit encryption. These records serve as official documentation for insurance claims and tax purposes. If you spot any discrepancies, please contact our medical billing department immediately.
                        </p>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
