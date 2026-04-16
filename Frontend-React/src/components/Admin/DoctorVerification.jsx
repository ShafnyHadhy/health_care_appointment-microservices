import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

export default function DoctorVerification() {
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDoctors();
    }, []);

    const fetchDoctors = async () => {
        try {
            const token = localStorage.getItem('token');
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            const { data } = await axios.get(`${apiUrl}/api/admin/users`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Filter doctors who are unverified and unrejected
            if (data?.data?.doctors) {
                const unverified = data.data.doctors.filter(d => d.isVerified === false && d.status !== 'rejected');
                setDoctors(unverified);
            }
        } catch (error) {
            console.error('Error fetching doctors:', error);
            toast.error('Failed to load pending applications');
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (id, action) => {
        try {
            const token = localStorage.getItem('token');
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            
            if (action === 'verify') {
                await axios.put(`${apiUrl}/api/admin/doctors/verify/${id}`, {}, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                toast.success('Doctor verified successfully');
            } else if (action === 'reject') {
                await axios.put(`${apiUrl}/api/admin/doctors/reject/${id}`, {}, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                toast.success('Doctor application rejected');
            }
            
            // Remove the doctor from the local state list immediately
            setDoctors(doctors.filter(d => d._id !== id));
        } catch (error) {
            console.error(`Error performing ${action}:`, error);
            toast.error(`Failed to ${action} doctor`);
        }
    };

    if (loading) return <div className="flex items-center justify-center h-full"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>;

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-800">Pending Doctor Applications</h3>
                <p className="text-sm text-gray-500 mt-1">Review credentials and approve or reject new doctor registrations.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {doctors.length > 0 ? (
                    doctors.map(doctor => (
                        <div key={doctor._id} className="border border-gray-200 rounded-xl p-5 hover:border-indigo-300 transition-colors shadow-sm bg-gray-50">
                            <div className="flex items-center space-x-3 mb-4">
                                <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-lg">
                                    {(doctor.name || doctor.firstName || 'D')[0]}
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-800">{doctor.name || `${doctor.firstName} ${doctor.lastName}`}</h4>
                                    <p className="text-xs text-gray-500 font-medium">{doctor.specialization || 'General Practitioner'}</p>
                                </div>
                            </div>
                            
                            <div className="space-y-2 mb-6">
                                <div className="text-sm flex justify-between border-b border-gray-200 pb-1">
                                    <span className="text-gray-500">Email:</span>
                                    <span className="text-gray-800 font-medium truncate ml-2">{doctor.email}</span>
                                </div>
                                <div className="text-sm flex justify-between border-b border-gray-200 pb-1">
                                    <span className="text-gray-500">Experience:</span>
                                    <span className="text-gray-800 font-medium">{doctor.experience || 0} Years</span>
                                </div>
                                <div className="text-sm flex justify-between pb-1">
                                    <span className="text-gray-500">Consultation Fee:</span>
                                    <span className="text-gray-800 font-medium">${doctor.consultationFee || 0}</span>
                                </div>
                            </div>

                            <div className="flex space-x-3">
                                <button 
                                    onClick={() => handleAction(doctor._id, 'verify')}
                                    className="flex-1 bg-indigo-600 text-white py-2 rounded-lg font-medium text-sm hover:bg-indigo-700 transition"
                                >
                                    Approve
                                </button>
                                <button 
                                    onClick={() => handleAction(doctor._id, 'reject')}
                                    className="flex-1 bg-red-50 text-red-600 py-2 rounded-lg font-medium text-sm hover:bg-red-100 transition"
                                >
                                    Reject
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full py-12 flex flex-col items-center justify-center bg-gray-50 rounded-xl border border-dashed border-gray-300">
                        <svg className="w-12 h-12 text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        <p className="text-gray-500 font-medium">No pending doctor applications right now.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
