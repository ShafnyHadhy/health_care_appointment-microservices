import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

export default function UsersManager() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, patient, doctor
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem('token');
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            const { data } = await axios.get(`${apiUrl}/api/admin/users`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (data?.data?.all) {
                setUsers(data.data.all);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
            toast.error('Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id, type) => {
        if (!window.confirm(`Are you sure you want to delete this ${type}? This action cannot be undone.`)) return;

        try {
            const token = localStorage.getItem('token');
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            await axios.delete(`${apiUrl}/api/admin/users/${type}/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success(`${type} deleted successfully`);
            fetchUsers();
        } catch (error) {
            console.error('Error deleting user:', error);
            toast.error('Failed to delete user');
        }
    };

    const filteredUsers = users.filter(u => {
        if (filter !== 'all' && u.userType !== filter) return false;
        if (search) {
            const searchLower = search.toLowerCase();
            const matchName = u.name?.toLowerCase().includes(searchLower);
            const matchEmail = u.email?.toLowerCase().includes(searchLower);
            return matchName || matchEmail;
        }
        return true;
    });

    if (loading) return <div className="flex items-center justify-center h-full"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <h3 className="text-xl font-bold text-gray-800">User Account Management</h3>
                
                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                    <input 
                        type="text" 
                        placeholder="Search by name or email..." 
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                    <select 
                        value={filter} 
                        onChange={(e) => setFilter(e.target.value)}
                        className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                        <option value="all">All Roles</option>
                        <option value="patient">Patients</option>
                        <option value="doctor">Doctors</option>
                    </select>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 border-y border-gray-200">
                            <th className="px-4 py-3 text-sm font-semibold text-gray-600">Name</th>
                            <th className="px-4 py-3 text-sm font-semibold text-gray-600">Email</th>
                            <th className="px-4 py-3 text-sm font-semibold text-gray-600">Role</th>
                            <th className="px-4 py-3 text-sm font-semibold text-gray-600 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.length > 0 ? filteredUsers.map((user) => (
                            <tr key={user._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-150">
                                <td className="px-4 py-4 text-sm font-medium text-gray-800">{user.name || `${user.firstName || ''} ${user.lastName || ''}`}</td>
                                <td className="px-4 py-4 text-sm text-gray-600">{user.email}</td>
                                <td className="px-4 py-4 text-sm">
                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold uppercase tracking-wide
                                        ${user.userType === 'patient' ? 'bg-blue-100 text-blue-700' : 'bg-teal-100 text-teal-700'}
                                    `}>
                                        {user.userType}
                                    </span>
                                </td>
                                <td className="px-4 py-4 text-right space-x-2">
                                    <button 
                                        className="text-gray-500 hover:text-blue-600 bg-gray-100 hover:bg-blue-50 p-2 rounded-lg transition"
                                        title="Cannot Edit directly in mock mode"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(user._id, user.userType)}
                                        className="text-gray-500 hover:text-red-600 bg-gray-100 hover:bg-red-50 p-2 rounded-lg transition"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                    </button>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="4" className="px-4 py-8 text-center text-gray-500">No users found matching your criteria.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
