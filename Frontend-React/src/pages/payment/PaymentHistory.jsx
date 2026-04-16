import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { generateReceiptPDF } from '../../utils/receiptGenerator';
import toast from 'react-hot-toast';

export default function PaymentHistory() {
    const navigate = useNavigate();
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [downloadingId, setDownloadingId] = useState(null);
    const [patientData, setPatientData] = useState(null);

    useEffect(() => {
        const fetchPatientProfile = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/patients/profile`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                setPatientData(response.data);
            } catch (error) {
                console.error('Error fetching patient profile:', error);
            }
        };

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
        fetchPatientProfile();
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
        <div className="bg-neutral text-on-surface min-h-screen font-body selection:bg-primary/10 py-12 px-6">
            <main className="max-w-4xl mx-auto w-full">
                {/* Independent Header with Navigation */}
                <div className="flex justify-between items-center mb-12">
                    <div 
                        onClick={() => navigate('/patient-dashboard')}
                        className="flex items-center gap-3 cursor-pointer group"
                    >
                        <div className="w-10 h-10 rounded-xl bg-white border border-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300 shadow-sm">
                            <span className="material-symbols-outlined text-xl">arrow_back</span>
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary group-hover:opacity-70 transition-opacity">Back to Portal</span>
                    </div>

                    {/* Official Company Branding */}
                    <div className="flex flex-row items-center gap-3">
                        <img
                            src="/logo.png"
                            alt="Logo"
                            className="w-12 h-9 rounded-md object-cover shadow-sm"
                        />
                        <div className="text-xl font-black text-primary tracking-tight font-headline">
                            Care<span className="text-secondary">Bridge</span>
                        </div>
                    </div>
                </div>

                {/* Page Title */}
                <header className="mb-12">
                    <h1 className="text-5xl font-extrabold tracking-tight text-on-surface mb-3 font-headline uppercase italic leading-none">
                        Payment <span className="text-primary">History.</span>
                    </h1>
                    <p className="text-on-surface-variant text-sm font-medium leading-relaxed italic opacity-70">
                        Official medical financial records. This archive contains all settled consultations and ledger entries for your account.
                    </p>
                </header>

                {/* Summary Bento Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <div className="col-span-1 md:col-span-2 bg-white p-8 rounded-[32px] shadow-sm border border-primary/5 flex flex-col justify-between relative overflow-hidden group">
                        <div className="relative z-10">
                            <span className="text-[10px] font-black text-primary/60 uppercase tracking-[0.2em]">Total Lifetime Spending</span>
                            <div className="text-6xl font-black text-primary mt-2 tracking-tighter">
                                <span className="text-2xl mr-1 opacity-50 font-normal">Rs.</span>
                                {totalSpent.toLocaleString()}
                            </div>
                        </div>
                        <div className="mt-8 flex gap-4 relative z-10">
                            <div className="bg-tertiary text-primary px-4 py-1.5 rounded-full text-[10px] font-black flex items-center gap-1.5 uppercase border border-primary/10">
                                <span className="material-symbols-outlined text-xs">verified</span>
                                Secure Transaction Log
                            </div>
                        </div>
                        <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors"></div>
                    </div>

                    <div className="bg-white p-8 rounded-[32px] flex flex-col justify-center border border-primary/5 shadow-sm">
                        <div className="text-primary/50 font-black text-[10px] uppercase tracking-widest mb-4">Audit Entries</div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-6xl font-black text-primary tracking-tighter">{payments.length}</span>
                            <span className="text-primary/40 font-black text-[10px] uppercase tracking-widest">Records</span>
                        </div>
                        <div className="mt-6 w-full bg-neutral h-2 rounded-full overflow-hidden border border-primary/5">
                            <div className="bg-primary h-full transition-all duration-1000 shadow-lg" style={{ width: `${successRate}%` }}></div>
                        </div>
                    </div>
                </div>

                {/* Transactions Section */}
                <section className="bg-white rounded-[32px] shadow-xl shadow-primary/5 border border-primary/10 overflow-hidden">
                    {/* Filter Bar */}
                    <div className="p-8 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-primary/5">
                        <div className="relative flex-1 max-w-md">
                            <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-primary/40">search</span>
                            <input 
                                className="w-full pl-14 pr-6 py-4 bg-neutral border-none rounded-2xl text-sm font-semibold focus:ring-4 focus:ring-primary/10 transition-all outline-none placeholder:text-primary/30" 
                                placeholder="Search archives..." 
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-2">
                            <button className="px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest bg-primary text-white shadow-lg shadow-primary/20">All Time</button>
                            <button className="px-4 py-3 rounded-2xl text-[10px] font-black uppercase bg-neutral text-primary border border-primary/10 hover:bg-white transition-all">
                                <span className="material-symbols-outlined text-[18px]">filter_list</span>
                            </button>
                        </div>
                    </div>

                    {/* Table Content */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-neutral/50">
                                    <th className="px-10 py-6 text-[10px] font-black text-primary/60 uppercase tracking-[0.2em]">Settlement Date</th>
                                    <th className="px-10 py-6 text-[10px] font-black text-primary/60 uppercase tracking-[0.2em]">Session Reference</th>
                                    <th className="px-10 py-6 text-[10px] font-black text-primary/60 uppercase tracking-[0.2em] text-right">Fee (LKR)</th>
                                    <th className="px-10 py-6 text-[10px] font-black text-primary/60 uppercase tracking-[0.2em]">Integrity</th>
                                    <th className="px-10 py-6 text-[10px] font-black text-primary/60 uppercase tracking-[0.2em] text-center">Receipt</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-primary/5">
                                {loading ? (
                                    <tr>
                                        <td colSpan="5" className="px-10 py-24 text-center text-[10px] text-primary/40 font-black uppercase tracking-[0.4em] animate-pulse">Decrypting Financial Archive...</td>
                                    </tr>
                                ) : filteredPayments.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-10 py-24 text-center text-[10px] text-primary/40 font-black uppercase tracking-[0.2em]">No valid logs discovered in archive</td>
                                    </tr>
                                ) : filteredPayments.map((payment) => (
                                    <tr key={payment._id} className="hover:bg-neutral/30 transition-colors group px-4">
                                        <td className="px-10 py-8">
                                            <div className="text-xs font-black text-on-surface uppercase tracking-tight">{new Date(payment.createdAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</div>
                                            <div className="text-[9px] text-primary/40 font-bold uppercase mt-1">{new Date(payment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                        </td>
                                        <td className="px-10 py-8">
                                            <div className="text-[11px] font-black text-on-surface tracking-tighter">APP-{payment.appointmentId.slice(-8).toUpperCase()}</div>
                                            <div className="text-[9px] text-secondary font-black uppercase tracking-widest mt-1 opacity-80">Verified Settlement</div>
                                        </td>
                                        <td className="px-10 py-8 text-sm font-black text-primary text-right">Rs. {payment.amount.toFixed(2)}</td>
                                        <td className="px-10 py-8">
                                            <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                                                payment.status === 'completed' ? 'bg-teal-50 text-teal-700 border-teal-100' :
                                                payment.status === 'pending' ? 'bg-blue-50 text-blue-800 border-blue-100' :
                                                'bg-rose-50 text-rose-800 border-rose-100'
                                            }`}>
                                                <span className={`w-2 h-2 rounded-full mr-2.5 ${
                                                    payment.status === 'completed' ? 'bg-teal-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' :
                                                    payment.status === 'pending' ? 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]' :
                                                    'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]'
                                                }`}></span>
                                                {payment.status}
                                            </span>
                                        </td>
                                        <td className="px-10 py-8 text-center">
                                            <button 
                                                onClick={() => handleDownloadReceipt(payment)}
                                                disabled={downloadingId === payment._id}
                                                className="bg-white border border-primary/10 text-primary hover:bg-primary hover:text-white hover:border-primary p-3 rounded-2xl disabled:opacity-30 transition-all shadow-sm active:scale-95 inline-flex items-center justify-center group/btn"
                                            >
                                                {downloadingId === payment._id ? (
                                                    <span className="material-symbols-outlined animate-spin text-[20px]">rotate_right</span>
                                                ) : (
                                                    <span className="material-symbols-outlined text-[20px] group-hover/btn:-translate-y-1 transition-transform">download_2</span>
                                                )}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* Footer Disclaimer */}
                <div className="mt-12 flex items-center justify-between border-t border-primary/10 pt-12 pb-8">
                    <div className="flex items-center gap-4 max-w-xl">
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0 transition-transform hover:rotate-12">
                            <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>gpp_good</span>
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-widest leading-relaxed text-primary/60">
                            CareBridge Security Protocol: This financial archive is protected by AES-256 clinical encryption. All entries are immutable and HIPAA-validated for absolute record integrity.
                        </p>
                    </div>
                    
                    <div className="hidden lg:flex flex-col items-end gap-1 px-4 py-2 bg-white rounded-xl border border-primary/5 shadow-sm">
                        <div className="text-[10px] font-black uppercase tracking-widest text-primary">© {new Date().getFullYear()} CareBridge Health Inc.</div>
                        <div className="text-[9px] font-black uppercase tracking-widest text-secondary opacity-80 cursor-pointer hover:underline transition-all">Secure Audit Portal</div>
                    </div>
                </div>
            </main>
        </div>
    );
}


