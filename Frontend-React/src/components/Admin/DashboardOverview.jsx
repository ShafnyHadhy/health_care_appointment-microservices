import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export default function DashboardOverview() {
    const [stats, setStats] = useState({
        totalPatients: 0,
        totalDoctors: 0,
        totalAppointments: 0,
        totalRevenue: 0
    });
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchDashboard();
    }, []);

    const fetchDashboard = async () => {
        try {
            const token = localStorage.getItem('token');
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            const { data } = await axios.get(`${apiUrl}/api/admin/dashboard`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (data.data) {
                setStats(data.data);
            }
        } catch (error) {
            console.error('Error fetching dashboard:', error);
            toast.error('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    const downloadReport = () => {
        let csvContent = "data:text/csv;charset=utf-8," 
            + "METRIC SUMMARY\n"
            + `Total Patients,${stats.totalPatients}\n`
            + `Total Doctors,${stats.totalDoctors}\n`
            + `Total Appointments,${stats.totalAppointments}\n`
            + `Total Revenue,$${stats.totalRevenue}\n\n`
            + "SPECIALTY BREAKDOWN\n"
            + "Specialty,Count\n";
        
        if (stats.analytics?.appointmentsBySpecialty) {
            stats.analytics.appointmentsBySpecialty.forEach(s => {
                csvContent += `${s.name},${s.count}\n`;
            });
        }

        csvContent += "\nDAILY TRENDS (Last 7 Days)\nDate,Registrations,Revenue\n";
        if (stats.analytics?.labels) {
            stats.analytics.labels.forEach((label, i) => {
                csvContent += `${label},${stats.analytics.registrationsByDate[i]},${stats.analytics.revenueByDate[i]}\n`;
            });
        }
            
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `healthcare_report_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link); 
        link.click();
        document.body.removeChild(link);
        toast.success('Detailed report downloaded!');
    };

    if (loading) return <div className="flex items-center justify-center h-full"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;

    const maxReg = Math.max(...(stats.analytics?.registrationsByDate || [1]));
    const maxRev = Math.max(...(stats.analytics?.revenueByDate || [1]));

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-2xl font-bold text-gray-800">Operational Analytics</h3>
                <button 
                    onClick={downloadReport}
                    className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition shadow-sm flex items-center space-x-2"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                    <span>Download Comprehensive Report</span>
                </button>
            </div>

            {/* Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Total Patients', value: stats.totalPatients, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: 'Total Doctors', value: stats.totalDoctors, color: 'text-teal-600', bg: 'bg-teal-50' },
                    { label: 'Total Appointments', value: stats.totalAppointments, color: 'text-indigo-600', bg: 'bg-indigo-50' },
                    { label: 'Total Revenue', value: `$${stats.totalRevenue.toLocaleString()}`, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                ].map((card, idx) => (
                    <div key={idx} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 transition-all hover:shadow-md">
                        <div className={`w-10 h-10 ${card.bg} ${card.color} rounded-lg flex items-center justify-center mb-4`}>
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"></path></svg>
                        </div>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">{card.label}</p>
                        <p className={`text-2xl font-black mt-1 ${card.color}`}>{card.value}</p>
                    </div>
                ))}
            </div>

            {/* Analytics Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6">User Registrations (Last 7 Days)</h4>
                    <div className="flex items-end space-x-2 h-48">
                        {stats.analytics?.registrationsByDate?.map((val, i) => {
                            const h = (val / maxReg) * 100;
                            return (
                                <div key={i} className="flex-1 flex flex-col justify-end items-center group relative">
                                    <span className="opacity-0 group-hover:opacity-100 absolute -top-8 bg-gray-800 text-white text-xs py-1 px-2 rounded transition z-10">{val} users</span>
                                    <div style={{ height: `${Math.max(5, h)}%` }} className="w-full bg-blue-500 rounded-t-lg opacity-80 group-hover:opacity-100 transition-all"></div>
                                    <span className="text-[10px] text-gray-400 mt-2 font-bold">{stats.analytics.labels[i]}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6">Revenue Growth (Last 7 Days)</h4>
                    <div className="flex items-end space-x-2 h-48">
                        {stats.analytics?.revenueByDate?.map((val, i) => {
                            const h = (val / maxRev) * 100;
                            return (
                                <div key={i} className="flex-1 flex flex-col justify-end items-center group relative">
                                    <span className="opacity-0 group-hover:opacity-100 absolute -top-8 bg-gray-800 text-white text-xs py-1 px-2 rounded transition z-10">${val}</span>
                                    <div style={{ height: `${Math.max(5, h)}%` }} className="w-full bg-emerald-500 rounded-t-lg opacity-80 group-hover:opacity-100 transition-all"></div>
                                    <span className="text-[10px] text-gray-400 mt-2 font-bold">{stats.analytics.labels[i]}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Specialty Breakdown */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6">Appointments by Specialty</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {stats.analytics?.appointmentsBySpecialty?.map((item, idx) => (
                        <div key={idx} className="p-4 bg-gray-50 rounded-xl border border-gray-100 text-center">
                            <p className="text-xl font-black text-gray-800">{item.count}</p>
                            <p className="text-[10px] font-bold text-gray-400 uppercase truncate">{item.name}</p>
                        </div>
                    ))}
                </div>
            </div>
            
        </div>
    );
}
