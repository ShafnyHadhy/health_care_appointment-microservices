<<<<<<< Updated upstream
import React from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import DashboardOverview from '../components/Admin/DashboardOverview';
import UsersManager from '../components/Admin/UsersManager';
import DoctorVerification from '../components/Admin/DoctorVerification';

export default function AdminPage() {
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const navItems = [
        { name: 'Dashboard', path: '/admin', exact: true },
        { name: 'Users', path: '/admin/users' },
        { name: 'Verifications', path: '/admin/verifications' }
    ];

    return (
        <div className="flex h-screen bg-gray-100 font-sans">
            {/* Sidebar */}
            <div className="w-64 bg-gray-900 text-white flex flex-col shadow-2xl">
                <div className="h-20 flex items-center justify-center border-b border-gray-800">
                    <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-teal-400">
                        Admin Portal
                    </h1>
                </div>
                
                <nav className="flex-1 mt-6 px-4 space-y-2">
                    {navItems.map(item => {
                        const active = item.exact 
                            ? location.pathname === item.path 
                            : location.pathname.startsWith(item.path);

                        return (
                            <Link 
                                key={item.name} 
                                to={item.path}
                                className={`block px-4 py-3 rounded-lg transition-all duration-200 ${
                                    active 
                                    ? 'bg-blue-600 text-white shadow-lg' 
                                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                                }`}
                            >
                                {item.name}
                            </Link>
                        )
                    })}
                </nav>

                <div className="p-4 border-t border-gray-800">
                    <button 
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-red-600/10 text-red-500 rounded-lg hover:bg-red-600 hover:text-white transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                        <span>Logout</span>
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="h-20 bg-white shadow-sm flex items-center justify-between px-8">
                    <h2 className="text-xl font-semibold text-gray-800">
                        {navItems.find(i => (i.exact ? location.pathname === i.path : location.pathname.startsWith(i.path)))?.name || 'Admin'}
                    </h2>
                    <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold border border-blue-200">
                            A
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto bg-gray-50 p-8">
                    <Routes>
                        <Route path="/" element={<DashboardOverview />} />
                        <Route path="/users" element={<UsersManager />} />
                        <Route path="/verifications" element={<DoctorVerification />} />
                    </Routes>
                </main>
            </div>
        </div>
    );
=======
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

<<<<<<< Updated upstream
const API = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const NAV = [
  { id: 'overview',  label: 'Dashboard',         icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { id: 'doctors',   label: 'Doctor Verification',icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
  { id: 'users',     label: 'User Management',    icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' },
  { id: 'appointments', label: 'Appointments',    icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
];

=======
// ─── CareBridge Brand Config ─────────────────────────────────────────────────
const API    = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const TEAL   = '#006063';
const TEAL2  = '#007b7f';
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const C = {
  bg:      '#f8fafc', // Slate-50
  sidebar: '#ffffff',
  card:    '#ffffff',
  border:  '#e2e8f0', // Slate-200
  border2: '#cbd5e1', // Slate-300
  text:    '#0f172a', // Slate-900
  muted:   '#475569', // Slate-600
  dim:     '#94a3b8', // Slate-400
  teal:    TEAL,
  teal2:   TEAL2,
};
const GAP = '24px'; // Increased gap
const PIE_COLORS = [TEAL, '#0ea5e9', '#f59e0b', '#ef4444', '#8b5cf6'];

const NAV = [
  { id:'overview',     label:'Dashboard',           icon:'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { id:'doctors',      label:'Doctor Verification', icon:'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
  { id:'users',        label:'User Management',     icon:'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' },
  { id:'appointments', label:'Appointments',         icon:'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
  { id:'reports',      label:'Predictive Analytics',icon:'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
  { id:'settings',     label:'Roles & Permissions', icon:'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z' },
  { id:'gamification', label:'Rewards & Badges',   icon:'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z' },
];

const TRANSLATIONS = {
  en: { dashboard: 'Dashboard', search: 'Search...', language: 'Language', status: 'System Status', doctor: 'Doctor', patient: 'Patient', welcome: 'Welcome, Admin' },
  ta: { dashboard: 'டாஷ்போர்டு', search: 'தேடு...', language: 'மொழி', status: 'கணினி நிலை', doctor: 'மருத்துவர்', patient: 'நோயாளி', welcome: 'வரவேற்கிறோம், நிர்வாகி' },
  si: { dashboard: 'උපකරණ පුවරුව', search: 'සොයන්න...', language: 'භාෂාව', status: 'පද්ධති තත්ත්වය', doctor: 'වෛද්‍යවරයා', patient: 'රෝගියා', welcome: 'සාදරයෙන් පිළිගනිමු, පරිපාලක' }
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmtDate  = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' }) : '—';
const fmtMini  = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day:'2-digit', month:'short' }) : '—';
const initials = (n) => (n||'?').split(' ').map(w=>w[0]).slice(0,2).join('').toUpperCase();

const Avatar = ({ name, size=34, bg=`linear-gradient(135deg,${TEAL},${TEAL2})` }) => (
  <div style={{ width:size, height:size, background:bg, borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:800, fontSize:Math.round(size*0.32), flexShrink:0 }}>
    {initials(name)}
  </div>
);

const Icon = ({ d, size=18, color='currentColor', strokeWidth=2 }) => (
  <svg width={size} height={size} fill="none" stroke={color} viewBox="0 0 24 24" strokeWidth={strokeWidth}>
    <path strokeLinecap="round" strokeLinejoin="round" d={d}/>
  </svg>
);

const Badge = ({ label, color }) => (
  <span style={{ padding:'5px 12px', borderRadius:20, fontSize:12, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.5px', background:`rgba(${color},0.12)`, color:`rgb(${color})` }}>{label}</span>
);
const statusCol = (s='') => {
  const l = s.toLowerCase();
  if (['verified','confirmed','completed','active'].includes(l)) return '0,188,140';
  if (['rejected','cancelled','inactive'].includes(l))          return '239,68,68';
  return '245,158,11';
};

const Search = ({ value, onChange, placeholder='Search…', suggestions=[] }) => (
  <div style={{ position:'relative', minWidth:240 }}>
    <div style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', pointerEvents:'none' }}>
      <Icon d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" size={15} color={C.dim} strokeWidth={2.5}/>
    </div>
    <input value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
      style={{ width:'100%', padding:'12px 14px 12px 42px', background:C.sidebar, border:`1px solid ${C.border}`, borderRadius:12, color:C.text, fontSize:15, outline:'none', boxSizing:'border-box', boxShadow:'0 1px 2px rgba(0,0,0,0.05)' }}/>
    {value && <button onClick={()=>onChange('')} style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', color:C.muted, cursor:'pointer', fontSize:20 }}>×</button>}
    
    {suggestions.length > 0 && (
      <div style={{ position:'absolute', top:'100%', left:0, right:0, background:C.card, border:`1px solid ${C.border}`, borderRadius:10, marginTop:10, zIndex:1000, boxShadow:'0 10px 25px rgba(0,0,0,0.5)', overflow:'hidden' }}>
        {suggestions.map((s,i) => (
          <div key={i} onClick={() => { onChange(s.text); }} style={{ padding:'10px 15px', color:C.text, fontSize:12, cursor:'pointer', borderBottom: i<suggestions.length-1?`1px solid ${C.border}`:'none', background:'transparent', hover: { background:'rgba(0,123,127,0.1)' } }}>
            <div style={{ display:'flex', justifyContent:'space-between' }}>
              <span>{s.text}</span>
              <span style={{ fontSize:9, color:C.dim, textTransform:'uppercase' }}>{s.type}</span>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);

const Table = ({ cols, rows, empty='No records.' }) => (
  <div style={{ overflowX:'auto' }}>
    <table style={{ width:'100%', borderCollapse:'collapse' }}>
      <thead><tr style={{ background:'#040e18' }}>
        {cols.map(c => <th key={c} style={{ padding:'9px 16px', textAlign:'left', fontSize:9, color:C.dim, textTransform:'uppercase', letterSpacing:'1px', fontWeight:700, whiteSpace:'nowrap' }}>{c}</th>)}
      </tr></thead>
      <tbody>
        {rows.length === 0
          ? <tr><td colSpan={cols.length} style={{ padding:48, textAlign:'center', color:C.dim, fontSize:13 }}>{empty}</td></tr>
          : rows}
      </tbody>
    </table>
  </div>
);
const TR = ({ children, i=0 }) => <tr style={{ borderTop:`1px solid ${C.border}`, background: i%2===1 ? 'rgba(0,0,0,0.01)' : 'transparent', transition:'background 0.2s' }}>{children}</tr>;
const TD = ({ children, sub=false, mono=false }) => <td style={{ padding:'18px 20px', fontSize:sub?14:15, color:sub?C.muted:C.text, fontFamily:mono?'monospace':'inherit', whiteSpace:'nowrap', fontWeight:sub?500:600 }}>{children}</td>;

const Card = ({ children, style={}, noPad=false }) => (
  <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:16, boxShadow:'0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.02)', ...(noPad?{}:{padding:24}), ...style }}>{children}</div>
);
const CardHead = ({ title, right, badge }) => (
  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
      <span style={{ fontWeight:800, color:C.text, fontSize:16, letterSpacing:'-0.3px' }}>{title}</span>
      {badge!==undefined && <span style={{ padding:'3px 10px', borderRadius:20, fontSize:11, fontWeight:800, background:`rgba(0,96,99,0.1)`, color:TEAL2 }}>{badge}</span>}
    </div>
    {right}
  </div>
);

const Overlay = ({ children, onClose }) => (
  <div onClick={onClose} style={{ position:'fixed', inset:0, background:'rgba(15,23,42,0.6)', backdropFilter:'blur(4px)', zIndex:2000, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
    <div onClick={e=>e.stopPropagation()} style={{ background:'#ffffff', borderRadius:24, padding:'32px', width:'100%', maxWidth:540, border:`1px solid ${C.border}`, maxHeight:'90vh', overflowY:'auto', boxShadow:'0 25px 50px -12px rgba(0,0,0,0.25)' }}>
      {children}
    </div>
  </div>
);
const MHead = ({ title, onClose }) => (
  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:28 }}>
    <h2 style={{ margin:0, fontSize:22, fontWeight:900, color:C.text, letterSpacing:'-0.5px' }}>{title}</h2>
    <button onClick={onClose} style={{ background:'#f1f5f9', border:'none', color:C.muted, width:40, height:40, borderRadius:20, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', fontSize:24 }}>×</button>
  </div>
);
const MField = ({ label, value, onChange, type='text', options=null, disabled=false }) => (
  <div style={{ marginBottom:24 }}>
    <label style={{ display:'block', fontSize:13, color:C.text, textTransform:'uppercase', letterSpacing:'1.5px', marginBottom:10, fontWeight:800 }}>{label}</label>
    {options
      ? <select value={value} onChange={e=>onChange(e.target.value)} disabled={disabled}
          style={{ width:'100%', padding:'14px 16px', background:'#f8fafc', border:`1px solid ${C.border}`, borderRadius:14, color:C.text, fontSize:15, outline:'none', fontWeight:500 }}>
          {options.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      : <input type={type} value={value} onChange={e=>onChange(e.target.value)} disabled={disabled}
          style={{ width:'100%', padding:'14px 16px', background:'#f8fafc', border:`1px solid ${C.border}`, borderRadius:14, color:disabled?C.muted:C.text, fontSize:15, outline:'none', boxSizing:'border-box', fontWeight:500 }}/>
    }
  </div>
);

const TealBtn = ({ onClick, children, outline=false, danger=false, sm=false, disabled=false }) => (
  <button onClick={onClick} disabled={disabled} style={{
    padding: sm ? '8px 16px' : '14px 28px',
    background: danger ? 'rgba(239,68,68,0.1)' : outline ? 'transparent' : `linear-gradient(135deg,${TEAL},${TEAL2})`,
    border: danger ? '1px solid rgba(239,68,68,0.3)' : outline ? `1px solid ${C.border2}` : 'none',
    borderRadius: 12, color: danger ? '#dc2626' : outline ? C.muted : '#fff',
    fontSize: sm ? 13 : 16, fontWeight:700, cursor:disabled?'not-allowed':'pointer', whiteSpace:'nowrap', transition:'all 0.2s',
    display:'flex', alignItems:'center', justifyContent:'center', gap:10, opacity:disabled?0.6:1,
    boxShadow: outline ? 'none' : '0 4px 12px rgba(0,96,99,0.15)',
  }}>{children}</button>
);

// ─── Main Component ───────────────────────────────────────────────────────────
>>>>>>> Stashed changes
export default function AdminPage() {
  const navigate = useNavigate();
  const [active, setActive]       = useState('overview');
  const [doctors, setDoctors]     = useState([]);
  const [users, setUsers]         = useState([]);
  const [appointments, setAppointments] = useState([]);
<<<<<<< Updated upstream
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
=======
  const [loading,      setLoading]      = useState(true);
  const [search,       setSearch]       = useState('');
  const [docFilter,    setDocFilter]    = useState('all');
  const [apptFilter,   setApptFilter]   = useState('all');
  const [deleteModal,  setDeleteModal]  = useState(null);
  const [editModal,    setEditModal]    = useState(null);
  const [reportType,   setReportType]   = useState('summary');
  const [activityLog,  setActivityLog]  = useState([]);
  
  // New Innovative States
  const [lang,         setLang]         = useState('en');
  const [suggestions,  setSuggestions]  = useState([]);
  const [notifications,setNotifications]= useState([]);
  const [analytics,    setAnalytics]    = useState(null);
  const [gamification, setGamification] = useState(null);
  const [roles,        setRoles]        = useState([]);
  const [chatbotOpen,  setChatbotOpen]  = useState(false);
  const [chatLog,      setChatLog]      = useState([{ from:'ai', msg:'Hello! How can I assist you today?' }]);
  const [chatInput,    setChatInput]    = useState('');

  useEffect(() => {
    const chk = () => { const m = window.innerWidth < 768; setIsMobile(m); setSideOpen(!m); };
    chk(); window.addEventListener('resize', chk);
    fetchAll(); // Fix: Call fetchAll on mount
    return () => window.removeEventListener('resize', chk);
  }, []);

  const goTab = (id) => { setActive(id); setSearch(''); };
  useEffect(() => {
    if (search.length > 2) {
      const fetchSuggestions = async () => {
        try {
          const cfg = { headers:{ Authorization:`Bearer ${localStorage.getItem('token')}` } };
          const res = await axios.get(`${API}/api/admin/actions/search-suggestions?query=${search}`, cfg);
          setSuggestions(res.data.suggestions || []);
        } catch(e) { console.error(e); }
      };
      const t = setTimeout(fetchSuggestions, 300);
      return () => clearTimeout(t);
    } else {
      setSuggestions([]);
    }
  }, [search]);

  const addLog = (msg, type='info') =>
    setActivityLog(prev => [{ msg, type, time: new Date() }, ...prev].slice(0,20));

  const fetchAll = async () => {
    setLoading(true);
    try {
      const cfg = { headers:{ Authorization:`Bearer ${localStorage.getItem('token')}` } };
      const [dR, uR, aR, nR, gR, rR, anR] = await Promise.allSettled([
        axios.get(`${API}/api/admin/users?type=doctor`, cfg),
        axios.get(`${API}/api/admin/users?type=patient`, cfg),
        axios.get(`${API}/api/admin/appointments`, cfg),
        axios.get(`${API}/api/admin/actions/notifications`, cfg),
        axios.get(`${API}/api/admin/actions/gamification`, cfg),
        axios.get(`${API}/api/admin/actions/roles`, cfg),
        axios.get(`${API}/api/admin/actions/analytics`, cfg),
      ]);
      if (dR.status==='fulfilled') setDoctors(dR.value.data?.data || []);
      if (uR.status==='fulfilled') setUsers(uR.value.data?.data || []);
      if (aR.status==='fulfilled') setAppointments(aR.value.data?.data || []);
      if (nR.status==='fulfilled') setNotifications(nR.value.data || []);
      if (gR.status==='fulfilled') setGamification(gR.value.data || null);
      if (rR.status==='fulfilled') setRoles(rR.value.data || []);
      if (anR.status==='fulfilled') setAnalytics(anR.value.data || null);
    } catch(e) { console.error(e); }
    finally { setLoading(false); }
>>>>>>> Stashed changes
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

<<<<<<< Updated upstream
  const pendingDoctors  = doctors.filter(d => !d.isVerified && !d.isRejected);
  const verifiedDoctors = doctors.filter(d => d.isVerified);
  const stats = [
    { label: 'Total Users',       value: users.length,           color: '#6366f1', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' },
    { label: 'Total Doctors',     value: doctors.length,         color: '#2563eb', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
    { label: 'Pending Verification', value: pendingDoctors.length, color: '#f59e0b', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
    { label: 'Appointments',      value: appointments.length,    color: '#10b981', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
  ];

=======
  const handleChat = async () => {
    if (!chatInput.trim()) return;
    const msg = chatInput;
    setChatLog(p => [...p, { from:'user', msg }]);
    setChatInput('');
    try {
      const cfg = { headers:{ Authorization:`Bearer ${localStorage.getItem('token')}` } };
      const res = await axios.post(`${API}/api/admin/actions/chatbot`, { message: msg }, cfg);
      setChatLog(p => [...p, { from:'ai', msg:res.data.response }]);
    } catch { toast.error('Assistant unavailable'); }
  };

  const handleAwardPoints = async (p, b) => {
    try {
      const cfg = { headers:{ Authorization:`Bearer ${localStorage.getItem('token')}` } };
      await axios.post(`${API}/api/admin/actions/gamification/award`, { points:p, badge:b }, cfg);
      fetchAll();
    } catch(e) { console.error(e); }
  };

  // ── Derived ───────────────────────────────────────────────────────────────
  const pending  = useMemo(() => doctors.filter(d => !d.isVerified && !d.isRejected), [doctors]);
  const verified = useMemo(() => doctors.filter(d =>  d.isVerified), [doctors]);

  const filtDocs = useMemo(() => {
    let d = [...doctors];
    if (docFilter==='pending')  d = d.filter(x => !x.isVerified && !x.isRejected);
    if (docFilter==='verified') d = d.filter(x =>  x.isVerified);
    if (docFilter==='rejected') d = d.filter(x =>  x.isRejected);
    if (search) d = d.filter(x => `${x.name||''} ${x.email||''} ${x.specialization||''}`.toLowerCase().includes(search.toLowerCase()));
    return d;
  }, [doctors, docFilter, search]);

  const filtUsers = useMemo(() => {
    let u = [...users];
    if (search) u = u.filter(x => `${x.name||x.fullName||''} ${x.email||''}`.toLowerCase().includes(search.toLowerCase()));
    return u;
  }, [users, search]);

  const filtAppts = useMemo(() => {
    let a = [...appointments];
    if (apptFilter!=='all') a = a.filter(x => (x.status||'').toLowerCase()===apptFilter);
    if (search) a = a.filter(x => `${x.patientName||''} ${x.doctorName||''} ${x.status||''}`.toLowerCase().includes(search.toLowerCase()));
    return a;
  }, [appointments, apptFilter, search]);

  const monthlyData = useMemo(() => MONTHS.map((m,i) => ({
    month:m,
    Appointments: appointments.filter(a => a.createdAt && new Date(a.createdAt).getMonth()===i).length,
    Patients:     users.filter(u => u.createdAt && new Date(u.createdAt).getMonth()===i).length,
  })), [appointments, users]);

  const statusPie = useMemo(() => {
    const map = {}; appointments.forEach(a => { const s=a.status||'Pending'; map[s]=(map[s]||0)+1; });
    return Object.entries(map).map(([name,value]) => ({ name, value }));
  }, [appointments]);

  const specialtyData = useMemo(() => {
    const map = {}; doctors.forEach(d => { const s=d.specialization||'General'; map[s]=(map[s]||0)+1; });
    return Object.entries(map).sort((a,b)=>b[1]-a[1]).slice(0,5).map(([name,value])=>({ name, value }));
  }, [doctors]);

  // ── Exports ───────────────────────────────────────────────────────────────
  const getReportRows = () => {
    if (reportType==='doctor_performance') return {
      title:'Doctor Performance', headers:['Name','Specialty','Email','Status'],
      rows: doctors.map(d => [d.name||'N/A', d.specialization||'—', d.email||'—', d.isVerified?'Verified':d.isRejected?'Rejected':'Pending']),
    };
    if (reportType==='appointment_trends') return {
      title:'Appointment Trends', headers:['Month','Appointments','New Patients'],
      rows: monthlyData.map(m=>[m.month, m.Appointments, m.Patients]),
    };
    return {
      title:'Summary Report', headers:['Metric','Value'],
      rows:[['Total Patients',users.length],['Total Doctors',doctors.length],['Pending Verifications',pending.length],['Verified Doctors',verified.length],['Total Appointments',appointments.length]],
    };
  };

  const exportCSV = (filename, headers, rows) => {
    const c = [headers,...rows].map(r=>r.map(v=>`"${(v||'').toString().replace(/"/g,'""')}"`).join(',')).join('\n');
    const a = document.createElement('a'); a.href=URL.createObjectURL(new Blob([c],{type:'text/csv'})); a.download=filename+'.csv'; a.click();
    toast.success('CSV downloaded!');
  };
  const exportXLSX = (filename, headers, rows) => {
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([headers,...rows]), 'Report');
    XLSX.writeFile(wb, filename+'.xlsx'); toast.success('XLSX downloaded!');
  };
  const exportPDF = (title, headers, rows) => {
    const doc = new jsPDF();
    doc.setFontSize(18); doc.setTextColor(0,96,99); doc.text('CareBridge', 14, 18);
    doc.setFontSize(11); doc.setTextColor(100,116,139); doc.text(`Admin Report — ${title}`, 14, 26);
    doc.setFontSize(8); doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 32);
    autoTable(doc, { startY:37, head:[headers], body:rows, styles:{fontSize:9,cellPadding:4}, headStyles:{fillColor:[0,96,99],textColor:255,fontStyle:'bold'}, alternateRowStyles:{fillColor:[240,253,254]} });
    doc.save(title.replace(/\s+/g,'_')+'.pdf'); toast.success('PDF downloaded!');
  };

  // ── Render: Dashboard ─────────────────────────────────────────────────────
  const renderDashboard = () => (
    <div style={{ display:'flex', flexDirection:'column', gap:GAP }}>
      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:GAP }}>
        {[
          { label:'Total Patients', value:users.length,        col:TEAL,      icon:'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' },
          { label:'Active Doctors',  value:doctors.length,      col:'#38bdf8', icon:'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
          { label:'Pending Review',  value:pending.length,      col:'#fbbf24', icon:'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
          { label:'Appointments',    value:appointments.length, col:'#a78bfa', icon:'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
        ].map(s => (
          <Card key={s.label} style={{ borderLeft:`4px solid ${s.col}`, borderRadius:14, padding:'22px' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <div>
                <div style={{ fontSize:10, color:C.dim, textTransform:'uppercase', letterSpacing:'1px', fontWeight:800, marginBottom:8 }}>{s.label}</div>
                <div style={{ fontSize:30, fontWeight:900, color:'#fff', lineHeight:1 }}>{s.value}</div>
              </div>
              <div style={{ width:46, height:46, background:`${s.col}20`, borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center' }}>
                <Icon d={s.icon} size={20} color={s.col}/>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Pending alert */}
      {pending.length > 0 && (
        <div style={{ background:'rgba(245,158,11,0.07)', border:'1px solid rgba(245,158,11,0.25)', borderRadius:10, padding:'12px 16px', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:10 }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ color:'#f59e0b', fontSize:18 }}>⚠</div>
            <div>
              <div style={{ fontWeight:700, color:'#fbbf24', fontSize:13 }}>{pending.length} Doctor{pending.length>1?'s':''} Awaiting Verification</div>
              <div style={{ fontSize:11, color:'#92400e' }}>Action required</div>
            </div>
          </div>
          <TealBtn onClick={()=>goTab('doctors')} sm>Review →</TealBtn>
        </div>
      )}

      {/* Charts */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(300px, 1fr))', gap:GAP }}>
        <Card>
          <CardHead title="Monthly Activity"/>
          <ResponsiveContainer width="100%" height={190}>
            <AreaChart data={monthlyData} margin={{ top:0, right:0, left:-28, bottom:0 }}>
              <defs>
                <linearGradient id="tg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={TEAL} stopOpacity={0.35}/>
                  <stop offset="95%" stopColor={TEAL} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false}/>
              <XAxis dataKey="month" tick={{ fill:C.dim, fontSize:9 }} axisLine={false} tickLine={false}/>
              <YAxis tick={{ fill:C.dim, fontSize:9 }} axisLine={false} tickLine={false} allowDecimals={false}/>
              <Tooltip contentStyle={{ background:'#040e18', border:`1px solid ${C.border}`, borderRadius:8, fontSize:11 }}/>
              <Area type="monotone" dataKey="Appointments" stroke={TEAL} strokeWidth={2} fill="url(#tg)"/>
              <Area type="monotone" dataKey="Patients" stroke="#0ea5e9" strokeWidth={2} fill="none" strokeDasharray="4 4"/>
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <CardHead title="Specialties"/>
          {specialtyData.length > 0 ? (
            <div style={{ display:'flex', flexDirection:'column', gap:8, marginTop:4 }}>
              {specialtyData.map((s,i) => {
                const max = specialtyData[0].value || 1;
                return (
                  <div key={i}>
                    <div style={{ display:'flex', justifyContent:'space-between', fontSize:11, marginBottom:3 }}>
                      <span style={{ color:C.text }}>{s.name}</span>
                      <span style={{ fontWeight:700, color:TEAL2 }}>{s.value}</span>
                    </div>
                    <div style={{ height:4, background:C.border, borderRadius:4 }}>
                      <div style={{ height:'100%', width:`${(s.value/max)*100}%`, background:`linear-gradient(90deg,${TEAL},${TEAL2})`, borderRadius:4 }}/>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : <div style={{ color:C.dim, fontSize:12, textAlign:'center', paddingTop:16 }}>No data yet</div>}
        </Card>
      </div>

      {/* Recent doctors + activity */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(300px, 1fr))', gap:GAP }}>
        <Card noPad>
          <div style={{ padding:'12px 16px', borderBottom:`1px solid ${C.border}`, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <span style={{ fontWeight:700, color:C.text, fontSize:13 }}>Recent Doctors</span>
            <TealBtn sm outline onClick={()=>goTab('doctors')}>View all</TealBtn>
          </div>
          <Table cols={['Doctor','Specialty','Status']} rows={doctors.slice(0,5).map((d,i) => (
            <TR key={d._id||i} i={i}>
              <TD><div style={{ display:'flex', alignItems:'center', gap:9 }}><Avatar name={d.name||d.fullName}/>{d.name||d.fullName||'N/A'}</div></TD>
              <TD sub>{d.specialization||'—'}</TD>
              <TD><Badge label={d.isVerified?'Verified':d.isRejected?'Rejected':'Pending'} color={statusCol(d.isVerified?'verified':d.isRejected?'rejected':'pending')}/></TD>
            </TR>
          ))} empty="No doctors yet."/>
        </Card>

        <Card>
          <CardHead title="Activity Log" badge={activityLog.length}/>
          <div style={{ display:'flex', flexDirection:'column', gap:6, maxHeight:230, overflowY:'auto' }}>
            {activityLog.length === 0
              ? <div style={{ fontSize:11, color:C.dim, paddingTop:20, textAlign:'center' }}>No recent activity</div>
              : activityLog.map((l,i) => (
                <div key={i} style={{ display:'flex', gap:8, padding:'5px 0', borderBottom:`1px solid ${C.border}` }}>
                  <div style={{ width:6, height:6, borderRadius:'50%', background: l.type==='success'?TEAL:l.type==='danger'?'#ef4444':'#f59e0b', flexShrink:0, marginTop:4 }}/>
                  <div>
                    <div style={{ fontSize:12, color:C.text }}>{l.msg}</div>
                    <div style={{ fontSize:9, color:C.dim }}>{fmtMini(l.time)}</div>
                  </div>
                </div>
              ))}
          </div>
        </Card>
      </div>
    </div>
  );

  // ── Render: Doctors ───────────────────────────────────────────────────────
  const renderDoctors = () => (
    <Card noPad>
      <div style={{ padding:'12px 16px', borderBottom:`1px solid ${C.border}`, display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:10 }}>
        <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
          {['all','pending','verified','rejected'].map(f => (
            <button key={f} onClick={()=>setDocFilter(f)} style={{ padding:'4px 12px', borderRadius:20, fontSize:11, fontWeight:700, border:'none', cursor:'pointer', textTransform:'capitalize', background:docFilter===f?TEAL:'rgba(0,96,99,0.12)', color:docFilter===f?'#fff':C.muted }}>{f}</button>
          ))}
        </div>
        <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
          <Search value={search} onChange={setSearch} placeholder="Search doctors…"/>
          <TealBtn onClick={()=>setEditModal({ mode:'create', type:'doctor', data:{} })}>+ Add Doctor</TealBtn>
        </div>
      </div>
      <Table cols={['Doctor','Specialty','Email','Status','Actions']} rows={filtDocs.map((d,i) => (
        <TR key={d._id||i} i={i}>
          <TD><div style={{ display:'flex', alignItems:'center', gap:9 }}><Avatar name={d.name||d.fullName}/>{d.name||d.fullName||'N/A'}</div></TD>
          <TD sub>{d.specialization||'—'}</TD>
          <TD sub mono>{d.email||'—'}</TD>
          <TD><Badge label={d.isVerified?'Verified':d.isRejected?'Rejected':'Pending'} color={statusCol(d.isVerified?'verified':d.isRejected?'rejected':'pending')}/></TD>
          <TD>
            <div style={{ display:'flex', gap:5 }}>
              {!d.isVerified && !d.isRejected && <>
                <button onClick={()=>handleVerify(d._id, d.name||'Dr')} style={{ padding:'4px 10px', background:'rgba(0,188,140,0.12)', border:'1px solid rgba(0,188,140,0.3)', borderRadius:6, color:'#34d399', fontSize:10, fontWeight:700, cursor:'pointer' }}>✓ Verify</button>
                <button onClick={()=>handleReject(d._id, d.name||'Dr')} style={{ padding:'4px 10px', background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.25)', borderRadius:6, color:'#f87171', fontSize:10, fontWeight:700, cursor:'pointer' }}>✗ Reject</button>
              </>}
              <button onClick={()=>setEditModal({ mode:'edit', type:'doctor', data:d })} style={{ padding:'4px 10px', background:`rgba(0,96,99,0.12)`, border:`1px solid rgba(0,96,99,0.3)`, borderRadius:6, color:TEAL2, fontSize:10, fontWeight:700, cursor:'pointer' }}>Edit</button>
              <button onClick={()=>setDeleteModal({ type:'doctor', id:d._id, name:d.name||d.fullName||'Doctor' })} style={{ padding:'4px 10px', background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.2)', borderRadius:6, color:'#f87171', fontSize:10, fontWeight:700, cursor:'pointer' }}>Del</button>
            </div>
          </TD>
        </TR>
      ))} empty="No doctors match filter."/>
    </Card>
  );

  // ── Render: Users ─────────────────────────────────────────────────────────
  const renderUsers = () => (
    <Card noPad>
      <div style={{ padding:'12px 16px', borderBottom:`1px solid ${C.border}`, display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:10 }}>
        <Search value={search} onChange={setSearch} placeholder="Search patients…"/>
        <TealBtn onClick={()=>setEditModal({ mode:'create', type:'user', data:{} })}>+ Add Patient</TealBtn>
      </div>
      <Table cols={['Patient','Email','Phone','Joined','Actions']} rows={filtUsers.map((u,i) => (
        <TR key={u._id||i} i={i}>
          <TD><div style={{ display:'flex', alignItems:'center', gap:9 }}><Avatar name={u.name||u.fullName} bg="linear-gradient(135deg,#0ea5e9,#006063)"/>{u.name||u.fullName||'N/A'}</div></TD>
          <TD sub mono>{u.email||'—'}</TD>
          <TD sub>{u.phone||u.phoneNumber||'—'}</TD>
          <TD sub>{fmtDate(u.createdAt)}</TD>
          <TD>
            <div style={{ display:'flex', gap:5 }}>
              <button onClick={()=>setEditModal({ mode:'edit', type:'user', data:u })} style={{ padding:'4px 10px', background:`rgba(0,96,99,0.12)`, border:`1px solid rgba(0,96,99,0.3)`, borderRadius:6, color:TEAL2, fontSize:10, fontWeight:700, cursor:'pointer' }}>Edit</button>
              <button onClick={()=>setDeleteModal({ type:'user', id:u._id, name:u.name||u.fullName||'Patient' })} style={{ padding:'4px 10px', background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.2)', borderRadius:6, color:'#f87171', fontSize:10, fontWeight:700, cursor:'pointer' }}>Del</button>
            </div>
          </TD>
        </TR>
      ))} empty="No patients found."/>
    </Card>
  );

  // ── Render: Appointments ──────────────────────────────────────────────────
  const renderAppointments = () => (
    <Card noPad>
      <div style={{ padding:'12px 16px', borderBottom:`1px solid ${C.border}`, display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:10 }}>
        <div style={{ display:'flex', gap:6 }}>
          {['all','pending','confirmed','completed','cancelled'].map(f => (
            <button key={f} onClick={()=>setApptFilter(f)} style={{ padding:'4px 12px', borderRadius:20, fontSize:11, fontWeight:700, border:'none', cursor:'pointer', textTransform:'capitalize', background:apptFilter===f?TEAL:'rgba(0,96,99,0.12)', color:apptFilter===f?'#fff':C.muted }}>{f}</button>
          ))}
        </div>
        <Search value={search} onChange={setSearch} placeholder="Search appointments…"/>
      </div>
      <Table cols={['Patient','Doctor','Date','Time','Status']} rows={filtAppts.map((a,i) => (
        <TR key={a._id||i} i={i}>
          <TD>{a.patientName||a.patient||'N/A'}</TD>
          <TD sub>{a.doctorName||a.doctor||'—'}</TD>
          <TD sub>{fmtDate(a.date||a.appointmentDate)}</TD>
          <TD sub>{a.time||a.timeSlot||'—'}</TD>
          <TD><Badge label={a.status||'Pending'} color={statusCol(a.status)}/></TD>
        </TR>
      ))} empty="No appointments found."/>
    </Card>
  );

  // ── Render: Analytics ──────────────────────────────────────────────────
  const renderAnalytics = () => (
    <div style={{ display:'flex', flexDirection:'column', gap:GAP }}>
      <Card>
        <CardHead title="Predictive Trends (Next Month Projection)"/>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:20 }}>
          <div style={{ background:'rgba(0,188,140,0.05)', padding:20, borderRadius:12, border:`1px solid rgba(0,188,140,0.1)` }}>
            <div style={{ fontSize:10, color:C.dim, textTransform:'uppercase', fontWeight:800 }}>Appointment Forecast</div>
            <div style={{ fontSize:32, fontWeight:900, color:'#34d399' }}>+{analytics?.forecast?.nextMonth || 0}</div>
            <div style={{ fontSize:11, color:C.dim, marginTop:5 }}>Expected growth based on history</div>
          </div>
          <Card style={{ padding:15 }}>
            <div style={{ fontSize:10, color:C.dim, textTransform:'uppercase', fontWeight:800 }}>Confidence Score</div>
            <div style={{ display:'flex', gap:4, marginTop:10 }}>
              {[1,2,3,4,5].map(s => <div key={s} style={{ height:6, flex:1, borderRadius:3, background: s<=3 ? TEAL : C.border }}/>)}
            </div>
            <div style={{ fontSize:11, color:C.dim, marginTop:8 }}>Medium (Based on 6 months data)</div>
          </Card>
        </div>
      </Card>

      <Card>
        <CardHead title="Appointment Density Heatmap (Day vs Hour)"/>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(24, 1fr)', gap:2 }}>
          {Array.from({length:7}).map((_,d) => 
            Array.from({length:24}).map((_,h) => {
              const val = Math.random(); // Simulated heatmap data
              return <div key={`${d}-${h}`} title={`${val*100}% load`} style={{ aspectRatio:'1/1', background:ValToCol(val), borderRadius:1 }}/>
            })
          )}
        </div>
        <div style={{ display:'flex', justifyContent:'space-between', marginTop:10, fontSize:9, color:C.dim }}>
          <span>12 AM</span><span>12 PM</span><span>11 PM</span>
        </div>
      </Card>
    </div>
  );
  const ValToCol = (v) => {
    if (v > 0.8) return '#ef4444';
    if (v > 0.6) return '#f59e0b';
    if (v > 0.4) return '#34d399';
    return '#152e44';
  };

  // ── Render: Gamification ──────────────────────────────────────────────────
  const renderGamification = () => (
    <div style={{ display:'flex', flexDirection:'column', gap:GAP }}>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 2fr', gap:GAP }}>
        <Card>
          <CardHead title="Your Stats"/>
          <div style={{ textAlign:'center' }}>
            <div style={{ fontSize:42, fontWeight:900, color:TEAL2 }}>{gamification?.current?.points || 0}</div>
            <div style={{ fontSize:11, color:C.dim, textTransform:'uppercase', letterSpacing:1 }}>Total Points Earned</div>
            <div style={{ display:'flex', flexWrap:'wrap', gap:6, justifyContent:'center', marginTop:20 }}>
              {(gamification?.current?.badges || ['Starter']).map(b => (
                <div key={b} style={{ padding:'5px 12px', background:TEAL, borderRadius:20, fontSize:10, fontWeight:800, color:'#fff' }}>🏅 {b}</div>
              ))}
            </div>
          </div>
        </Card>
        <Card noPad>
          <CardHead title="Global Admin Leaderboard" style={{ padding:20 }}/>
          <Table cols={['Rank','Admin','Points','Badges']} rows={(gamification?.leaderboard || []).map((a,i) => (
            <TR key={i} i={i}>
              <TD><span style={{ fontWeight:800, color:i===0?'#fbbf24':C.dim }}>#{i+1}</span></TD>
              <TD><div style={{ display:'flex', alignItems:'center', gap:8 }}><Avatar name={a.name}/>{a.name}</div></TD>
              <TD><span style={{ fontWeight:700 }}>{a.points}</span></TD>
              <TD>{a.badges?.length || 0}</TD>
            </TR>
          ))}/>
        </Card>
      </div>

      <Card>
        <CardHead title="Daily Administrative Targets"/>
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {[
            { l:'Verify 3 Doctors', p:30, b:'Reviewer Gold', done:false },
            { l:'Generate Weekly Report', p:20, b:'Analyst', done:true },
            { l:'Handle Pending Appointments', p:15, b:'Efficient', done:false }
          ].map((t,i) => (
            <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:10, background:'rgba(255,255,255,0.02)', borderRadius:12 }}>
              <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                <div style={{ width:20, height:20, borderRadius:'50%', border:`2px solid ${t.done?TEAL2:C.border}`, display:'flex', alignItems:'center', justifyContent:'center', color:TEAL2, fontSize:12 }}>{t.done?'✓':''}</div>
                <span style={{ fontSize:13, color:t.done?C.dim:C.text }}>{t.l}</span>
              </div>
              <TealBtn sm outline onClick={()=>handleAwardPoints(t.p, t.b)} disabled={t.done}>{t.done?'Completed':`Claim ${t.p} pts`}</TealBtn>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );

  // ── Render: Settings / Roles ──────────────────────────────────────────────
  const renderRoles = () => (
    <div style={{ display:'flex', flexDirection:'column', gap:GAP }}>
      <Card noPad>
        <div style={{ padding:20, borderBottom:`1px solid ${C.border}`, display:'flex', justifyContent:'space-between' }}>
          <CardHead title="Role Management" noPad/>
          <TealBtn sm>+ Define New Role</TealBtn>
        </div>
        <Table cols={['Role','Permissions','Assigned Admins','Actions']} rows={roles.map((r,i) => (
          <TR key={i} i={i}>
            <TD><span style={{ fontWeight:700 }}>{r.name}</span></TD>
            <TD><div style={{ display:'flex', flexWrap:'wrap', gap:4 }}>{r.permissions?.slice(0,3).map(p=><Badge key={p} label={p.replace('_',' ')} color="0,123,127"/>)}</div></TD>
            <TD>2</TD>
            <TD><TealBtn sm outline>Edit</TealBtn></TD>
          </TR>
        ))} empty="No custom roles yet."/>
      </Card>
    </div>
  );

  const Chatbot = () => (
    <div style={{ position:'fixed', bottom:40, right:40, zIndex:2000 }}>
      {chatbotOpen ? (
        <div style={{ width:360, background:'white', border:`1px solid ${C.border}`, borderRadius:24, boxShadow:'0 25px 50px -12px rgba(0,0,0,0.15)', overflow:'hidden', display:'flex', flexDirection:'column', maxHeight:500 }}>
          <div style={{ background:TEAL, padding:'20px 24px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <div style={{ width:10, height:10, borderRadius:'50%', background:'#4ade80' }}/>
              <span style={{ fontWeight:800, fontSize:15, color:'white', letterSpacing:'-0.2px' }}>CareBridge AI</span>
            </div>
            <button onClick={()=>setChatbotOpen(false)} style={{ background:'rgba(255,255,255,0.1)', border:'none', color:'#fff', cursor:'pointer', width:32, height:32, borderRadius:16, fontSize:20, display:'flex', alignItems:'center', justifyContent:'center' }}>×</button>
          </div>
          <div style={{ flex:1, padding:20, overflowY:'auto', display:'flex', flexDirection:'column', gap:12, background:'#f8fafc' }}>
            {chatLog.map((l,i) => (
              <div key={i} style={{ alignSelf: l.from==='ai'?'flex-start':'flex-end', background: l.from==='ai'?'#ffffff':'#006063', color: l.from==='ai'?C.text:'#ffffff', padding:'12px 16px', borderRadius:l.from==='ai'?'4px 16px 16px 16px':'16px 16px 4px 16px', fontSize:14, maxWidth:'85%', boxShadow:l.from==='ai'?'0 1px 2px rgba(0,0,0,0.05)':'none', border:l.from==='ai'?`1px solid ${C.border}`:'none', lineHeight:1.5 }}>
                {l.msg}
              </div>
            ))}
          </div>
          <div style={{ padding:16, borderTop:`1px solid ${C.border}`, background:'white' }}>
            <div style={{ display:'flex', gap:10 }}>
              <input value={chatInput} onChange={e=>setChatInput(e.target.value)} onKeyPress={e=>e.key==='Enter' && handleChat()} placeholder="Ask CareBridge AI..." style={{ flex:1, background:'#f1f5f9', border:`1px solid ${C.border}`, borderRadius:12, padding:'12px 16px', color:C.text, fontSize:14, outline:'none' }}/>
              <button onClick={handleChat} style={{ background:TEAL, border:'none', borderRadius:12, width:44, height:44, color:'#fff', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
                 <Icon d="M5 12h14M12 5l7 7-7 7" size={20} color="white" strokeWidth={3}/>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button onClick={()=>setChatbotOpen(true)} style={{ width:64, height:64, borderRadius:20, background:`linear-gradient(135deg,${TEAL},${TEAL2})`, border:'none', boxShadow:'0 12px 32px rgba(0,96,99,0.3)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', transition:'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)' }}>
          <Icon d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" size={28}/>
        </button>
      )}
    </div>
  );

  // ── Edit Modal ────────────────────────────────────────────────────────────
  const EditModal = () => {
    const isCreate = editModal?.mode==='create';
    const isDoc    = editModal?.type==='doctor';
    const d        = editModal?.data || {};
    const [form, setForm] = useState({ name:d.name||d.fullName||'', email:d.email||'', phone:d.phone||d.phoneNumber||'', specialization:d.specialization||'', password:'' });
    const s = k => v => setForm(f => ({ ...f, [k]:v }));
    return (
      <Overlay onClose={()=>setEditModal(null)}>
        <MHead title={isCreate?`Create ${isDoc?'Doctor':'Patient'}`:`Edit ${isDoc?'Doctor':'Patient'}`} onClose={()=>setEditModal(null)}/>
        <MField label="Full Name"     value={form.name}           onChange={s('name')}/>
        <MField label="Email"         value={form.email}          onChange={s('email')} type="email"/>
        <MField label="Phone"         value={form.phone}          onChange={s('phone')} type="tel"/>
        {isDoc && <MField label="Specialization" value={form.specialization} onChange={s('specialization')}/>}
        {isCreate && <MField label="Password"   value={form.password}       onChange={s('password')} type="password"/>}
        <div style={{ display:'flex', justifyContent:'flex-end', gap:8, marginTop:20 }}>
          <TealBtn outline onClick={()=>setEditModal(null)}>Cancel</TealBtn>
          <TealBtn onClick={()=>handleSaveEdit(form)}>{isCreate?'Create':'Save'}</TealBtn>
        </div>
      </Overlay>
    );
  };

  const DeleteModal = () => (
    <Overlay onClose={()=>setDeleteModal(null)}>
      <MHead title="Confirm Deletion" onClose={()=>setDeleteModal(null)}/>
      <p style={{ color:C.text, fontSize:16, margin:'0 0 32px', lineHeight:1.6, fontWeight:500 }}>
        Are you sure you want to permanently delete <strong style={{ color:TEAL }}>{deleteModal?.name}</strong>? This action cannot be undone.
      </p>
      <div style={{ display:'flex', justifyContent:'flex-end', gap:12 }}>
        <TealBtn outline onClick={()=>setDeleteModal(null)}>Keep Record</TealBtn>
        <TealBtn danger onClick={handleDelete}>Delete Permanently</TealBtn>
      </div>
    </Overlay>
  );

  // ── Layout ────────────────────────────────────────────────────────────────
>>>>>>> Stashed changes
  return (
    <div style={{ display:'flex', minHeight:'100vh', background:'#0f172a', color:'#e2e8f0', fontFamily:'-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif' }}>

      {/* SIDEBAR */}
<<<<<<< Updated upstream
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
=======
      <aside style={{ width:260, background:C.sidebar, borderRight:`1px solid ${C.border}`, display:'flex', flexDirection:'column', flexShrink:0, position:isMobile?'fixed':'relative', top:0, left:0, height:'100%', zIndex:100, transform:(isMobile&&!sideOpen)?'translateX(-100%)':'translateX(0)', transition:'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)', boxShadow:'4px 0 24px rgba(0,0,0,0.02)' }}>

        {/* Logo */}
        <div style={{ padding:'32px 24px', borderBottom:`1px solid ${C.border}`, textAlign:'center' }}>
          <div style={{ width:120, height:80, borderRadius:12, overflow:'hidden', background:'#f8fafc', margin:'0 auto', display:'flex', alignItems:'center', justifyContent:'center', border:`1px solid ${C.border}` }}>
            <img src="/logo.png" alt="CareBridge" style={{ width:'100%', height:'100%', objectFit:'contain' }}
              onError={e => { e.target.style.display='none'; }}/>
          </div>
          <div style={{ marginTop:16 }}>
            <div style={{ fontWeight:900, fontSize:20, color:TEAL, letterSpacing:'-0.5px', lineHeight:1 }}>
              Care<span style={{ color:TEAL2 }}>Bridge</span>
            </div>
            <div style={{ fontSize:9, color:TEAL2, textTransform:'uppercase', letterSpacing:'2px', marginTop:8, fontWeight:800, opacity:0.9 }}>
              Precision Healthcare Admin
            </div>
          </div>
        </div>

        {/* System Status */}
        <div style={{ margin:'16px 20px', padding:'12px 16px', background:'rgba(0,96,99,0.03)', border:`1px solid rgba(0,96,99,0.1)`, borderRadius:12 }}>
          <div style={{ fontSize:10, color:C.muted, textTransform:'uppercase', letterSpacing:'1px', marginBottom:8, fontWeight:700 }}>System Health</div>
          <div style={{ display:'flex', gap:14 }}>
            {[{l:'API',ok:true},{l:'DB',ok:true},{l:'AI',ok:true}].map(s => (
              <div key={s.l} style={{ display:'flex', alignItems:'center', gap:5, fontSize:11, fontWeight:600 }}>
                <div style={{ width:6, height:6, borderRadius:'50%', background:s.ok?TEAL2:'#ef4444' }}/>
                <span style={{ color:s.ok?TEAL2:C.muted }}>{s.l}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex:1, padding:'12px 14px', overflowY:'auto' }}>
          {NAV.map(n => (
            <button key={n.id} onClick={()=>{ goTab(n.id); if(isMobile) setSideOpen(false); }}
              style={{ width:'100%', display:'flex', alignItems:'center', gap:12, padding:'12px 16px', borderRadius:14, border:'none', cursor:'pointer', marginBottom:6, transition:'all 0.2s',
                background: active===n.id ? `rgba(0,96,99,0.08)` : 'transparent',
                color:      active===n.id ? TEAL : C.muted,
                fontWeight: active===n.id ? 800 : 600, fontSize:14, textAlign:'left' }}>
              <Icon d={n.icon} size={18} color={active===n.id?TEAL:C.dim} strokeWidth={active===n.id?2.5:2}/>
              {n.label}
              {n.id==='doctors' && pending.length>0 && (
                <span style={{ marginLeft:'auto', background:'#ef4444', color:'#fff', borderRadius:20, padding:'2px 8px', fontSize:10, fontWeight:900 }}>{pending.length}</span>
              )}
            </button>
          ))}
        </nav>

        {/* User pill */}
        <div style={{ padding:'20px', borderTop:`1px solid ${C.border}`, background:'white' }}>
          <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:16 }}>
            <Avatar name="Admin" size={42}/>
            <div>
              <div style={{ fontSize:15, color:C.text, fontWeight:800 }}>Shafny Hadhy</div>
              <div style={{ fontSize:10, color:C.muted, textTransform:'uppercase', letterSpacing:'1px', fontWeight:700 }}>Chief Administrator</div>
            </div>
          </div>
          <button onClick={()=>navigate('/')} style={{ width:'100%', padding:'12px', background:'rgba(239,68,68,0.05)', border:`1px solid rgba(239,68,68,0.1)`, borderRadius:12, color:'#dc2626', fontSize:14, fontWeight:700, cursor:'pointer', transition:'all 0.2s' }}>
            ← Exit Console
>>>>>>> Stashed changes
          </button>
        </div>
      </aside>

<<<<<<< Updated upstream
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
=======
      {/* CONTENT */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', minWidth:0, background:C.bg }}>
        {/* Header */}
        <header style={{ background:'white', borderBottom:`1px solid ${C.border}`, padding:'20px 32px', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:20, position:'sticky', top:0, zIndex:50, boxShadow:'0 1px 2px rgba(0,0,0,0.03)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:16 }}>
            {isMobile && <button onClick={()=>setSideOpen(o=>!o)} style={{ background:'none', border:'none', color:C.muted, cursor:'pointer', fontSize:24 }}>☰</button>}
            <div>
              <h1 style={{ margin:0, fontSize:24, fontWeight:900, color:C.text, letterSpacing:'-0.6px' }}>{NAV.find(n=>n.id===active)?.label}</h1>
              <p style={{ margin:0, fontSize:11, color:C.muted, textTransform:'uppercase', letterSpacing:'1.5px', fontWeight:700 }}>Intelligent Medical Operations</p>
            </div>
          </div>
          <div style={{ display:'flex', gap:20, alignItems:'center' }}>
            <div style={{ display:'flex', gap:10, background:'#f1f5f9', padding:6, borderRadius:12 }}>
              {['en','ta','si'].map(l => (
                <button key={l} onClick={()=>setLang(l)} style={{ padding:'6px 12px', borderRadius:8, border:'none', fontSize:12, fontWeight:800, cursor:'pointer', background:lang===l?TEAL:'transparent', color:lang===l?'#fff':C.muted, transition:'all 0.2s' }}>{l.toUpperCase()}</button>
              ))}
            </div>
            {!isMobile && <Search value={search} onChange={setSearch} placeholder={TRANSLATIONS[lang].search} suggestions={suggestions}/>}
            <button onClick={fetchAll} style={{ width:44, height:44, background:`white`, border:`1px solid ${C.border}`, borderRadius:12, color:TEAL, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', boxShadow:'0 1px 2px rgba(0,0,0,0.05)', transition:'all 0.2s' }} title="Refresh">↻</button>
          </div>
        </header>

        {/* Main */}
        <main style={{ flex:1, padding:'32px', overflowY:'auto' }}>
          {loading
            ? <div style={{ textAlign:'center', padding:'100px 0', color:C.muted }}>
                <div style={{ fontSize:48, animation:'spin 2s linear infinite' }}>⟳</div>
                <p style={{ margin:'20px 0 0', fontSize:18, fontWeight:700, letterSpacing:'-0.2px' }}>CareBridge is syncing hospital data...</p>
                <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
              </div>
            : (
              <div style={{ display:'flex', flexDirection:'column', gap:GAP }}>
                {active==='overview'     && renderDashboard()}
                {active==='doctors'      && renderDoctors()}
                {active==='users'        && renderUsers()}
                {active==='appointments' && renderAppointments()}
                {active==='reports'      && renderAnalytics()}
                {active==='settings'     && renderRoles()}
                {active==='gamification' && renderGamification()}
>>>>>>> Stashed changes
              </div>
            )}

<<<<<<< Updated upstream
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
=======
      <Chatbot/>
      {deleteModal && <DeleteModal/>}
      {editModal   && <EditModal/>}
>>>>>>> Stashed changes
    </div>
  );
>>>>>>> Stashed changes
}