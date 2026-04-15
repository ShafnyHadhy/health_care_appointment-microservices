import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const NAV = [
  { id: 'overview',  label: 'Dashboard',         icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { id: 'doctors',   label: 'Doctor Verification',icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
  { id: 'users',     label: 'User Management',    icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' },
  { id: 'appointments', label: 'Appointments',    icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
];

export default function AdminPage() {
  const navigate = useNavigate();
  const [active, setActive]       = useState('overview');
  const [doctors, setDoctors]     = useState([]);
  const [users, setUsers]         = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [dRes, uRes, aRes] = await Promise.allSettled([
        axios.get(`${API}/api/doctors`),
        axios.get(`${API}/api/patients`),
        axios.get(`${API}/api/appointments`),
      ]);
      if (dRes.status === 'fulfilled') setDoctors(dRes.value.data?.data || dRes.value.data || []);
      if (uRes.status === 'fulfilled') setUsers(uRes.value.data?.data || uRes.value.data || []);
      if (aRes.status === 'fulfilled') setAppointments(aRes.value.data?.data || aRes.value.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const verifyDoctor = async (id) => {
    try {
      await axios.patch(`${API}/api/doctors/${id}/verify`);
      toast.success('Doctor verified!');
      fetchAll();
    } catch { toast.error('Verification failed.'); }
  };

  const rejectDoctor = async (id) => {
    try {
      await axios.patch(`${API}/api/doctors/${id}/reject`);
      toast.success('Doctor rejected.');
      fetchAll();
    } catch { toast.error('Action failed.'); }
  };

  const pendingDoctors  = doctors.filter(d => !d.isVerified && !d.isRejected);
  const verifiedDoctors = doctors.filter(d => d.isVerified);
  const stats = [
    { label: 'Total Users',       value: users.length,           color: '#6366f1', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' },
    { label: 'Total Doctors',     value: doctors.length,         color: '#2563eb', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
    { label: 'Pending Verification', value: pendingDoctors.length, color: '#f59e0b', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
    { label: 'Appointments',      value: appointments.length,    color: '#10b981', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
  ];

  return (
    <div style={{ display:'flex', minHeight:'100vh', background:'#0f172a', color:'#e2e8f0', fontFamily:'-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif' }}>

      {/* SIDEBAR */}
      <aside style={{ width:240, background:'#1e293b', borderRight:'1px solid #334155', display:'flex', flexDirection:'column', padding:'24px 0', flexShrink:0 }}>
        <div style={{ padding:'0 20px 24px', borderBottom:'1px solid #334155' }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ width:36, height:36, background:'linear-gradient(135deg,#6366f1,#2563eb)', borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center' }}>
              <svg width="20" height="20" fill="none" stroke="#fff" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/></svg>
            </div>
            <div>
              <div style={{ fontWeight:800, fontSize:14, color:'#f1f5f9', letterSpacing:'-0.3px' }}>HealthPro Admin</div>
              <div style={{ fontSize:10, color:'#64748b', textTransform:'uppercase', letterSpacing:'1px' }}>Control Panel</div>
            </div>
          </div>
        </div>
        <nav style={{ flex:1, padding:'16px 12px' }}>
          {NAV.map(n => (
            <button key={n.id} onClick={() => setActive(n.id)}
              style={{ width:'100%', display:'flex', alignItems:'center', gap:10, padding:'10px 12px', borderRadius:8, border:'none', cursor:'pointer', marginBottom:4,
                background: active===n.id ? 'rgba(99,102,241,0.15)' : 'transparent',
                color: active===n.id ? '#818cf8' : '#94a3b8',
                fontWeight: active===n.id ? 700 : 500, fontSize:13, textAlign:'left' }}>
              <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d={n.icon}/></svg>
              {n.label}
            </button>
          ))}
        </nav>
        <div style={{ padding:'16px 20px', borderTop:'1px solid #334155' }}>
          <button onClick={() => navigate('/')}
            style={{ width:'100%', padding:'9px 12px', background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.2)', borderRadius:8, color:'#f87171', fontSize:12, fontWeight:700, cursor:'pointer' }}>
            ← Back to Site
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <main style={{ flex:1, padding:32, overflowY:'auto' }}>

        {/* HEADER BAR */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:28 }}>
          <div>
            <h1 style={{ fontSize:22, fontWeight:800, color:'#f1f5f9', margin:0 }}>{NAV.find(n=>n.id===active)?.label}</h1>
            <p style={{ fontSize:12, color:'#64748b', margin:'4px 0 0', textTransform:'uppercase', letterSpacing:'0.5px' }}>HealthPro Administration System</p>
          </div>
          <button onClick={fetchAll} style={{ padding:'8px 16px', background:'rgba(99,102,241,0.15)', border:'1px solid rgba(99,102,241,0.3)', borderRadius:8, color:'#818cf8', fontSize:12, fontWeight:700, cursor:'pointer' }}>
            ↻ Refresh
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign:'center', padding:'80px 0', color:'#64748b' }}>
            <div style={{ fontSize:32, marginBottom:12 }}>⟳</div>
            <p>Loading dashboard data...</p>
          </div>
        ) : (
          <>
            {/* ── OVERVIEW ── */}
            {active === 'overview' && (
              <div>
                {/* Stats Cards */}
                <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:28 }}>
                  {stats.map(s => (
                    <div key={s.label} style={{ background:'#1e293b', border:'1px solid #334155', borderRadius:12, padding:'20px 20px 16px', borderTop:`3px solid ${s.color}` }}>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                        <div>
                          <div style={{ fontSize:11, color:'#64748b', textTransform:'uppercase', letterSpacing:'0.8px', marginBottom:8 }}>{s.label}</div>
                          <div style={{ fontSize:32, fontWeight:800, color:'#f1f5f9' }}>{s.value}</div>
                        </div>
                        <div style={{ width:40, height:40, background:`${s.color}22`, borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center' }}>
                          <svg width="20" height="20" fill="none" stroke={s.color} viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d={s.icon}/></svg>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pending Doctors Alert */}
                {pendingDoctors.length > 0 && (
                  <div style={{ background:'rgba(245,158,11,0.1)', border:'1px solid rgba(245,158,11,0.3)', borderRadius:12, padding:'16px 20px', marginBottom:24, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                      <div style={{ width:36, height:36, background:'rgba(245,158,11,0.2)', borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', color:'#f59e0b', fontSize:18 }}>⚠</div>
                      <div>
                        <div style={{ fontWeight:700, color:'#fbbf24', fontSize:14 }}>{pendingDoctors.length} Doctor{pendingDoctors.length>1?'s':''} Awaiting Verification</div>
                        <div style={{ fontSize:12, color:'#92400e' }}>Review and verify new doctor registrations</div>
                      </div>
                    </div>
                    <button onClick={() => setActive('doctors')} style={{ padding:'8px 16px', background:'rgba(245,158,11,0.2)', border:'1px solid rgba(245,158,11,0.4)', borderRadius:8, color:'#fbbf24', fontSize:12, fontWeight:700, cursor:'pointer' }}>
                      Review →
                    </button>
                  </div>
                )}

                {/* Recent Doctors */}
                <div style={{ background:'#1e293b', border:'1px solid #334155', borderRadius:12, overflow:'hidden' }}>
                  <div style={{ padding:'16px 20px', borderBottom:'1px solid #334155', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <span style={{ fontWeight:700, color:'#f1f5f9', fontSize:14 }}>Recent Doctors</span>
                    <span style={{ fontSize:11, color:'#64748b', textTransform:'uppercase', letterSpacing:'0.5px' }}>{doctors.length} total</span>
                  </div>
                  <table style={{ width:'100%', borderCollapse:'collapse' }}>
                    <thead><tr style={{ background:'#0f172a' }}>
                      {['Name','Specialization','Status'].map(h => (
                        <th key={h} style={{ padding:'10px 20px', textAlign:'left', fontSize:10, color:'#64748b', textTransform:'uppercase', letterSpacing:'0.8px', fontWeight:700 }}>{h}</th>
                      ))}
                    </tr></thead>
                    <tbody>
                      {doctors.slice(0,6).map((d,i) => (
                        <tr key={d._id||i} style={{ borderTop:'1px solid #1e293b' }}>
                          <td style={{ padding:'12px 20px', fontSize:13, color:'#e2e8f0', fontWeight:600 }}>{d.name || d.fullName || 'N/A'}</td>
                          <td style={{ padding:'12px 20px', fontSize:12, color:'#94a3b8' }}>{d.specialization || '—'}</td>
                          <td style={{ padding:'12px 20px' }}>
                            <span style={{ padding:'3px 10px', borderRadius:20, fontSize:10, fontWeight:700, textTransform:'uppercase',
                              background: d.isVerified ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)',
                              color: d.isVerified ? '#34d399' : '#fbbf24' }}>
                              {d.isVerified ? 'Verified' : 'Pending'}
                            </span>
                          </td>
                        </tr>
                      ))}
                      {doctors.length === 0 && <tr><td colSpan={3} style={{ padding:'32px 20px', textAlign:'center', color:'#475569', fontSize:13 }}>No doctors found.</td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ── DOCTOR VERIFICATION ── */}
            {active === 'doctors' && (
              <div style={{ background:'#1e293b', border:'1px solid #334155', borderRadius:12, overflow:'hidden' }}>
                <div style={{ padding:'16px 20px', borderBottom:'1px solid #334155' }}>
                  <span style={{ fontWeight:700, color:'#f1f5f9', fontSize:14 }}>All Doctors</span>
                  <span style={{ marginLeft:10, padding:'2px 10px', background:'rgba(99,102,241,0.15)', color:'#818cf8', borderRadius:20, fontSize:11, fontWeight:700 }}>{doctors.length}</span>
                </div>
                <table style={{ width:'100%', borderCollapse:'collapse' }}>
                  <thead><tr style={{ background:'#0f172a' }}>
                    {['Doctor','Specialization','Email','Status','Actions'].map(h => (
                      <th key={h} style={{ padding:'10px 20px', textAlign:'left', fontSize:10, color:'#64748b', textTransform:'uppercase', letterSpacing:'0.8px', fontWeight:700 }}>{h}</th>
                    ))}
                  </tr></thead>
                  <tbody>
                    {doctors.map((d,i) => (
                      <tr key={d._id||i} style={{ borderTop:'1px solid #334155' }}>
                        <td style={{ padding:'14px 20px' }}>
                          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                            <div style={{ width:34, height:34, background:'linear-gradient(135deg,#6366f1,#2563eb)', borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:800, fontSize:13, flexShrink:0 }}>
                              {(d.name||d.fullName||'D')[0].toUpperCase()}
                            </div>
                            <span style={{ fontSize:13, color:'#e2e8f0', fontWeight:600 }}>{d.name||d.fullName||'N/A'}</span>
                          </div>
                        </td>
                        <td style={{ padding:'14px 20px', fontSize:12, color:'#94a3b8' }}>{d.specialization||'—'}</td>
                        <td style={{ padding:'14px 20px', fontSize:12, color:'#94a3b8' }}>{d.email||'—'}</td>
                        <td style={{ padding:'14px 20px' }}>
                          <span style={{ padding:'3px 10px', borderRadius:20, fontSize:10, fontWeight:700, textTransform:'uppercase',
                            background: d.isVerified ? 'rgba(16,185,129,0.15)' : d.isRejected ? 'rgba(239,68,68,0.15)' : 'rgba(245,158,11,0.15)',
                            color: d.isVerified ? '#34d399' : d.isRejected ? '#f87171' : '#fbbf24' }}>
                            {d.isVerified ? 'Verified' : d.isRejected ? 'Rejected' : 'Pending'}
                          </span>
                        </td>
                        <td style={{ padding:'14px 20px' }}>
                          {!d.isVerified && !d.isRejected && (
                            <div style={{ display:'flex', gap:8 }}>
                              <button onClick={() => verifyDoctor(d._id)}
                                style={{ padding:'5px 12px', background:'rgba(16,185,129,0.15)', border:'1px solid rgba(16,185,129,0.3)', borderRadius:6, color:'#34d399', fontSize:11, fontWeight:700, cursor:'pointer' }}>
                                ✓ Verify
                              </button>
                              <button onClick={() => rejectDoctor(d._id)}
                                style={{ padding:'5px 12px', background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.2)', borderRadius:6, color:'#f87171', fontSize:11, fontWeight:700, cursor:'pointer' }}>
                                ✗ Reject
                              </button>
                            </div>
                          )}
                          {(d.isVerified || d.isRejected) && <span style={{ fontSize:11, color:'#475569' }}>—</span>}
                        </td>
                      </tr>
                    ))}
                    {doctors.length === 0 && <tr><td colSpan={5} style={{ padding:'40px 20px', textAlign:'center', color:'#475569', fontSize:13 }}>No doctors registered yet.</td></tr>}
                  </tbody>
                </table>
              </div>
            )}

            {/* ── USER MANAGEMENT ── */}
            {active === 'users' && (
              <div style={{ background:'#1e293b', border:'1px solid #334155', borderRadius:12, overflow:'hidden' }}>
                <div style={{ padding:'16px 20px', borderBottom:'1px solid #334155' }}>
                  <span style={{ fontWeight:700, color:'#f1f5f9', fontSize:14 }}>All Patients / Users</span>
                  <span style={{ marginLeft:10, padding:'2px 10px', background:'rgba(99,102,241,0.15)', color:'#818cf8', borderRadius:20, fontSize:11, fontWeight:700 }}>{users.length}</span>
                </div>
                <table style={{ width:'100%', borderCollapse:'collapse' }}>
                  <thead><tr style={{ background:'#0f172a' }}>
                    {['Name','Email','Phone','Joined'].map(h => (
                      <th key={h} style={{ padding:'10px 20px', textAlign:'left', fontSize:10, color:'#64748b', textTransform:'uppercase', letterSpacing:'0.8px', fontWeight:700 }}>{h}</th>
                    ))}
                  </tr></thead>
                  <tbody>
                    {users.map((u,i) => (
                      <tr key={u._id||i} style={{ borderTop:'1px solid #334155' }}>
                        <td style={{ padding:'14px 20px' }}>
                          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                            <div style={{ width:34, height:34, background:'linear-gradient(135deg,#8b5cf6,#6366f1)', borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:800, fontSize:13, flexShrink:0 }}>
                              {(u.name||u.fullName||'U')[0].toUpperCase()}
                            </div>
                            <span style={{ fontSize:13, color:'#e2e8f0', fontWeight:600 }}>{u.name||u.fullName||'N/A'}</span>
                          </div>
                        </td>
                        <td style={{ padding:'14px 20px', fontSize:12, color:'#94a3b8' }}>{u.email||'—'}</td>
                        <td style={{ padding:'14px 20px', fontSize:12, color:'#94a3b8' }}>{u.phone||u.phoneNumber||'—'}</td>
                        <td style={{ padding:'14px 20px', fontSize:12, color:'#64748b' }}>{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}</td>
                      </tr>
                    ))}
                    {users.length === 0 && <tr><td colSpan={4} style={{ padding:'40px 20px', textAlign:'center', color:'#475569', fontSize:13 }}>No users registered yet.</td></tr>}
                  </tbody>
                </table>
              </div>
            )}

            {/* ── APPOINTMENTS ── */}
            {active === 'appointments' && (
              <div style={{ background:'#1e293b', border:'1px solid #334155', borderRadius:12, overflow:'hidden' }}>
                <div style={{ padding:'16px 20px', borderBottom:'1px solid #334155' }}>
                  <span style={{ fontWeight:700, color:'#f1f5f9', fontSize:14 }}>All Appointments</span>
                  <span style={{ marginLeft:10, padding:'2px 10px', background:'rgba(16,185,129,0.15)', color:'#34d399', borderRadius:20, fontSize:11, fontWeight:700 }}>{appointments.length}</span>
                </div>
                <table style={{ width:'100%', borderCollapse:'collapse' }}>
                  <thead><tr style={{ background:'#0f172a' }}>
                    {['Patient','Doctor','Date','Time','Status'].map(h => (
                      <th key={h} style={{ padding:'10px 20px', textAlign:'left', fontSize:10, color:'#64748b', textTransform:'uppercase', letterSpacing:'0.8px', fontWeight:700 }}>{h}</th>
                    ))}
                  </tr></thead>
                  <tbody>
                    {appointments.map((a,i) => (
                      <tr key={a._id||i} style={{ borderTop:'1px solid #334155' }}>
                        <td style={{ padding:'12px 20px', fontSize:13, color:'#e2e8f0', fontWeight:600 }}>{a.patientName||a.patient||'N/A'}</td>
                        <td style={{ padding:'12px 20px', fontSize:12, color:'#94a3b8' }}>{a.doctorName||a.doctor||'—'}</td>
                        <td style={{ padding:'12px 20px', fontSize:12, color:'#94a3b8' }}>{a.date||'—'}</td>
                        <td style={{ padding:'12px 20px', fontSize:12, color:'#94a3b8' }}>{a.time||a.timeSlot||'—'}</td>
                        <td style={{ padding:'12px 20px' }}>
                          <span style={{ padding:'3px 10px', borderRadius:20, fontSize:10, fontWeight:700, textTransform:'uppercase',
                            background: a.status==='confirmed' ? 'rgba(16,185,129,0.15)' : a.status==='cancelled' ? 'rgba(239,68,68,0.15)' : 'rgba(99,102,241,0.15)',
                            color: a.status==='confirmed' ? '#34d399' : a.status==='cancelled' ? '#f87171' : '#818cf8' }}>
                            {a.status||'Pending'}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {appointments.length === 0 && <tr><td colSpan={5} style={{ padding:'40px 20px', textAlign:'center', color:'#475569', fontSize:13 }}>No appointments found.</td></tr>}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}