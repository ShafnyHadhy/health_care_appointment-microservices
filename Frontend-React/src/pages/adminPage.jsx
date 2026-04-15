import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { toast, Toaster } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Area, AreaChart
} from 'recharts';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

// ─── CareBridge Brand Config ─────────────────────────────────────────────────
const API    = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const TEAL   = '#006063';
const TEAL2  = '#007b7f';
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const C = {
  bg:      '#050a14',
  sidebar: '#07111c',
  card:    '#0d1d2b',
  border:  '#152e44',
  border2: '#1d3e5a',
  text:    '#f1f5f9',
  muted:   '#94a3b8',
  dim:     '#64748b',
  teal:    TEAL,
  teal2:   TEAL2,
};
const GAP = '20px';
const PIE_COLORS = [TEAL, '#0ea5e9', '#f59e0b', '#ef4444', '#8b5cf6'];

const NAV = [
  { id:'overview',     label:'Dashboard',           icon:'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { id:'doctors',      label:'Doctor Verification', icon:'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
  { id:'users',        label:'User Management',     icon:'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' },
  { id:'appointments', label:'Appointments',         icon:'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
  { id:'reports',      label:'Reports & Analytics', icon:'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
];

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
  <span style={{ padding:'3px 10px', borderRadius:20, fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.4px', background:`rgba(${color},0.14)`, color:`rgb(${color})` }}>{label}</span>
);
const statusCol = (s='') => {
  const l = s.toLowerCase();
  if (['verified','confirmed','completed','active'].includes(l)) return '0,188,140';
  if (['rejected','cancelled','inactive'].includes(l))          return '239,68,68';
  return '245,158,11';
};

const Search = ({ value, onChange, placeholder='Search…' }) => (
  <div style={{ position:'relative', minWidth:240 }}>
    <div style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', pointerEvents:'none' }}>
      <Icon d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" size={15} color={C.dim} strokeWidth={2.5}/>
    </div>
    <input value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
      style={{ width:'100%', padding:'10px 12px 10px 38px', background:'#07111c', border:`1px solid ${C.border}`, borderRadius:10, color:C.text, fontSize:13, outline:'none', boxSizing:'border-box' }}/>
    {value && <button onClick={()=>onChange('')} style={{ position:'absolute', right:10, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', color:C.muted, cursor:'pointer', fontSize:18 }}>×</button>}
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
const TR = ({ children, i=0 }) => <tr style={{ borderTop:`1px solid ${C.border}`, background: i%2===1 ? 'rgba(255,255,255,0.02)' : 'transparent' }}>{children}</tr>;
const TD = ({ children, sub=false, mono=false }) => <td style={{ padding:'14px 18px', fontSize:sub?12:14, color:sub?C.dim:C.text, fontFamily:mono?'monospace':'inherit', whiteSpace:'nowrap' }}>{children}</td>;

const Card = ({ children, style={}, noPad=false }) => (
  <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:12, ...(noPad?{}:{padding:20}), ...style }}>{children}</div>
);
const CardHead = ({ title, right, badge }) => (
  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
      <span style={{ fontWeight:700, color:C.text, fontSize:13 }}>{title}</span>
      {badge!==undefined && <span style={{ padding:'2px 8px', borderRadius:12, fontSize:9, fontWeight:800, background:`rgba(0,96,99,0.18)`, color:TEAL2 }}>{badge}</span>}
    </div>
    {right}
  </div>
);

const Overlay = ({ children, onClose }) => (
  <div onClick={onClose} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.8)', zIndex:2000, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
    <div onClick={e=>e.stopPropagation()} style={{ background:'#0d2035', borderRadius:16, padding:28, width:'100%', maxWidth:500, border:`1px solid ${C.border2}`, maxHeight:'90vh', overflowY:'auto' }}>
      {children}
    </div>
  </div>
);
const MHead = ({ title, onClose }) => (
  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:22 }}>
    <h2 style={{ margin:0, fontSize:16, fontWeight:800, color:'#f1f5f9' }}>{title}</h2>
    <button onClick={onClose} style={{ background:'none', border:'none', color:C.muted, fontSize:22, cursor:'pointer' }}>×</button>
  </div>
);
const MField = ({ label, value, onChange, type='text', options=null, disabled=false }) => (
  <div style={{ marginBottom:20 }}>
    <label style={{ display:'block', fontSize:11, color:C.dim, textTransform:'uppercase', letterSpacing:'1px', marginBottom:8, fontWeight:700 }}>{label}</label>
    {options
      ? <select value={value} onChange={e=>onChange(e.target.value)} disabled={disabled}
          style={{ width:'100%', padding:'12px 14px', background:C.sidebar, border:`1px solid ${C.border}`, borderRadius:12, color:C.text, fontSize:14, outline:'none' }}>
          {options.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      : <input type={type} value={value} onChange={e=>onChange(e.target.value)} disabled={disabled}
          style={{ width:'100%', padding:'12px 14px', background:C.sidebar, border:`1px solid ${C.border}`, borderRadius:12, color:disabled?C.dim:C.text, fontSize:14, outline:'none', boxSizing:'border-box' }}/>
    }
  </div>
);

const TealBtn = ({ onClick, children, outline=false, danger=false, sm=false }) => (
  <button onClick={onClick} style={{
    padding: sm ? '7px 14px' : '11px 24px',
    background: danger ? 'rgba(239,68,68,0.15)' : outline ? 'transparent' : `linear-gradient(135deg,${TEAL},${TEAL2})`,
    border: danger ? '1px solid rgba(239,68,68,0.4)' : outline ? `1px solid ${C.border2}` : 'none',
    borderRadius: 10, color: danger ? '#fca5a5' : outline ? C.muted : '#fff',
    fontSize: sm ? 12 : 14, fontWeight:700, cursor:'pointer', whiteSpace:'nowrap', transition:'all 0.2s',
    display:'flex', alignItems:'center', justifyContent:'center', gap:8,
    boxShadow: outline ? 'none' : '0 4px 12px rgba(0,96,99,0.25)',
  }}>{children}</button>
);

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AdminPage() {
  const navigate = useNavigate();
  const [active,       setActive]       = useState('overview');
  const [sideOpen,     setSideOpen]     = useState(true);
  const [isMobile,     setIsMobile]     = useState(false);
  const [doctors,      setDoctors]      = useState([]);
  const [users,        setUsers]        = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [search,       setSearch]       = useState('');
  const [docFilter,    setDocFilter]    = useState('all');
  const [apptFilter,   setApptFilter]   = useState('all');
  const [deleteModal,  setDeleteModal]  = useState(null);
  const [editModal,    setEditModal]    = useState(null);
  const [reportType,   setReportType]   = useState('summary');
  const [activityLog,  setActivityLog]  = useState([]);

  useEffect(() => {
    const chk = () => { const m = window.innerWidth < 768; setIsMobile(m); setSideOpen(!m); };
    chk(); window.addEventListener('resize', chk);
    return () => window.removeEventListener('resize', chk);
  }, []);

  const goTab = (id) => { setActive(id); setSearch(''); };
  useEffect(() => { fetchAll(); }, []);

  const addLog = (msg, type='info') =>
    setActivityLog(prev => [{ msg, type, time: new Date() }, ...prev].slice(0,20));

  const fetchAll = async () => {
    setLoading(true);
    try {
      const cfg = { headers:{ Authorization:`Bearer ${localStorage.getItem('token')}` } };
      const [dR, uR, aR] = await Promise.allSettled([
        axios.get(`${API}/api/admin/users?type=doctor`, cfg),
        axios.get(`${API}/api/admin/users?type=patient`, cfg),
        axios.get(`${API}/api/admin/appointments`, cfg),
      ]);
      if (dR.status==='fulfilled') setDoctors(dR.value.data?.data || []);
      if (uR.status==='fulfilled') setUsers(uR.value.data?.data || []);
      if (aR.status==='fulfilled') setAppointments(aR.value.data?.data || []);
    } catch(e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleVerify = async (id, name) => {
    try { await axios.put(`${API}/api/admin/doctors/verify/${id}`, {}, { headers:{ Authorization:`Bearer ${localStorage.getItem('token')}` } });
      toast.success('Doctor verified!'); addLog(`✓ Verified Dr. ${name}`, 'success'); fetchAll();
    } catch { toast.error('Verification failed.'); }
  };
  const handleReject = async (id, name) => {
    try { await axios.put(`${API}/api/admin/doctors/reject/${id}`, {}, { headers:{ Authorization:`Bearer ${localStorage.getItem('token')}` } });
      toast.success('Doctor rejected.'); addLog(`✗ Rejected Dr. ${name}`, 'warn'); fetchAll();
    } catch { toast.error('Action failed.'); }
  };
  const handleDelete = async () => {
    if (!deleteModal) return;
    try {
      await axios.delete(`${API}/api/admin/users/${deleteModal.type}/${deleteModal.id}`, { headers:{ Authorization:`Bearer ${localStorage.getItem('token')}` } });
      toast.success(`${deleteModal.name} deleted.`); addLog(`🗑 Deleted ${deleteModal.name}`, 'danger');
      setDeleteModal(null); fetchAll();
    } catch { toast.error('Delete failed.'); setDeleteModal(null); }
  };
  const handleSaveEdit = async (formData) => {
    if (!editModal) return;
    const cfg = { headers:{ Authorization:`Bearer ${localStorage.getItem('token')}` } };
    try {
      if (editModal.mode === 'create') {
        const url = editModal.type==='doctor' ? `${API}/api/doctors/register` : `${API}/api/patients/register`;
        await axios.post(url, formData, cfg);
        toast.success('Created!'); addLog(`+ Created ${formData.name}`, 'success');
      } else {
        await axios.patch(`${API}/api/admin/users/${editModal.type}/${editModal.data._id}`, formData, cfg);
        toast.success('Updated!'); addLog(`✏ Updated ${formData.name}`, 'info');
      }
      setEditModal(null); fetchAll();
    } catch(e) { toast.error(e.response?.data?.message || 'Action failed.'); }
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

  // ── Render: Reports ───────────────────────────────────────────────────────
  const renderReports = () => {
    const { title, headers, rows } = getReportRows();
    return (
      <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
        <Card>
          <div style={{ display:'flex', flexWrap:'wrap', gap:14, alignItems:'flex-end' }}>
            <div style={{ flex:'1 1 160px' }}>
              <label style={{ display:'block', fontSize:10, color:C.dim, textTransform:'uppercase', letterSpacing:'0.7px', marginBottom:5, fontWeight:700 }}>Report Type</label>
              <select value={reportType} onChange={e=>setReportType(e.target.value)} style={{ width:'100%', padding:'8px 10px', background:'#040e18', border:`1px solid ${C.border}`, borderRadius:8, color:C.text, fontSize:12, outline:'none' }}>
                <option value="summary">Summary Report</option>
                <option value="doctor_performance">Doctor Performance</option>
                <option value="appointment_trends">Appointment Trends</option>
              </select>
            </div>
            <div style={{ display:'flex', gap:8 }}>
              {[{label:'PDF',col:'#ef4444',fn:()=>exportPDF(title,headers,rows)},{label:'CSV',col:TEAL2,fn:()=>exportCSV(title,headers,rows)},{label:'XLSX',col:'#0ea5e9',fn:()=>exportXLSX(title,headers,rows)}].map(b => (
                <button key={b.label} onClick={b.fn} style={{ padding:'8px 14px', background:'rgba(255,255,255,0.05)', border:`1px solid ${C.border}`, borderRadius:8, color:b.col, fontSize:12, fontWeight:700, cursor:'pointer' }}>{b.label}</button>
              ))}
            </div>
          </div>
        </Card>

        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(110px,1fr))', gap:10 }}>
          {[{l:'Appointments',v:appointments.length,c:TEAL},{l:'Doctors',v:doctors.length,c:'#0ea5e9'},{l:'Patients',v:users.length,c:'#8b5cf6'},{l:'Pending',v:pending.length,c:'#f59e0b'}].map(m => (
            <div key={m.l} style={{ background:C.card, border:`1px solid ${C.border}`, borderLeft:`3px solid ${m.c}`, borderRadius:10, padding:'12px 14px' }}>
              <div style={{ fontSize:9, color:C.dim, textTransform:'uppercase', letterSpacing:'0.7px', marginBottom:3 }}>{m.l}</div>
              <div style={{ fontSize:22, fontWeight:800, color:'#f1f5f9' }}>{m.v}</div>
            </div>
          ))}
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap:14 }}>
          <Card>
            <CardHead title="Monthly Appointments"/>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={monthlyData} margin={{ top:0, right:0, left:-28, bottom:0 }} barSize={9}>
                <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false}/>
                <XAxis dataKey="month" tick={{ fill:C.dim, fontSize:9 }} axisLine={false} tickLine={false}/>
                <YAxis tick={{ fill:C.dim, fontSize:9 }} axisLine={false} tickLine={false} allowDecimals={false}/>
                <Tooltip contentStyle={{ background:'#040e18', border:`1px solid ${C.border}`, borderRadius:8, fontSize:11 }}/>
                <Bar dataKey="Appointments" fill={TEAL} radius={[3,3,0,0]}/>
              </BarChart>
            </ResponsiveContainer>
          </Card>
          <Card>
            <CardHead title="By Status"/>
            {statusPie.length > 0
              ? <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie data={statusPie} cx="50%" cy="50%" innerRadius={40} outerRadius={62} paddingAngle={3} dataKey="value" strokeWidth={0}>
                      {statusPie.map((_,i) => <Cell key={i} fill={PIE_COLORS[i%PIE_COLORS.length]}/>)}
                    </Pie>
                    <Tooltip contentStyle={{ background:'#040e18', border:`1px solid ${C.border}`, borderRadius:8, fontSize:11 }}/>
                  </PieChart>
                </ResponsiveContainer>
              : <div style={{ height:160, display:'flex', alignItems:'center', justifyContent:'center', color:C.dim, fontSize:12 }}>No data</div>}
          </Card>
        </div>

        <Card noPad>
          <div style={{ padding:'11px 16px', borderBottom:`1px solid ${C.border}`, display:'flex', justifyContent:'space-between' }}>
            <span style={{ fontWeight:600, color:C.text, fontSize:13 }}>{title}</span>
            <span style={{ fontSize:10, color:C.dim }}>{rows.length} rows</span>
          </div>
          <Table cols={headers} rows={rows.slice(0,12).map((r,i) => (
            <TR key={i} i={i}>{r.map((cell,ci) => <TD key={ci} sub={ci>0}>{cell}</TD>)}</TR>
          ))} empty="No data."/>
        </Card>
      </div>
    );
  };

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
      <MHead title="Confirm Delete" onClose={()=>setDeleteModal(null)}/>
      <p style={{ color:C.muted, fontSize:13, margin:'0 0 22px', lineHeight:1.7 }}>
        Permanently delete <strong style={{ color:'#f1f5f9' }}>{deleteModal?.name}</strong>? This cannot be undone.
      </p>
      <div style={{ display:'flex', justifyContent:'flex-end', gap:8 }}>
        <TealBtn outline onClick={()=>setDeleteModal(null)}>Cancel</TealBtn>
        <TealBtn danger onClick={handleDelete}>Delete</TealBtn>
      </div>
    </Overlay>
  );

  // ── Layout ────────────────────────────────────────────────────────────────
  return (
    <div style={{ display:'flex', minHeight:'100vh', background:C.bg, color:C.text, fontFamily:'"Inter",-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif' }}>
      <Toaster position="top-right" toastOptions={{ style:{ background:'#0d1f2d', color:'#e2e8f0', border:`1px solid ${C.border2}`, fontSize:13 } }}/>
      {isMobile && sideOpen && <div onClick={()=>setSideOpen(false)} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', zIndex:99 }}/>}

      {/* SIDEBAR */}
      <aside style={{ width:220, background:C.sidebar, borderRight:`1px solid ${C.border}`, display:'flex', flexDirection:'column', flexShrink:0, position:isMobile?'fixed':'relative', top:0, left:0, height:'100%', zIndex:100, transform:(isMobile&&!sideOpen)?'translateX(-100%)':'translateX(0)', transition:'transform 0.25s ease' }}>

        {/* Logo */}
        <div style={{ padding:'24px 18px', borderBottom:`1px solid ${C.border}`, textAlign:'center' }}>
          <div style={{ width:110, height:74, borderRadius:10, overflow:'hidden', background:'#050a14', margin:'0 auto', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <img src="/logo.png" alt="CareBridge" style={{ width:'100%', height:'100%', objectFit:'contain' }}
              onError={e => { e.target.style.display='none'; }}/>
          </div>
          <div style={{ marginTop:12 }}>
            <div style={{ fontWeight:900, fontSize:16, color:'#fff', letterSpacing:'-0.4px', lineHeight:1 }}>
              Care<span style={{ color:TEAL2 }}>Bridge</span>
            </div>
            <div style={{ fontSize:8, color:TEAL2, textTransform:'uppercase', letterSpacing:'1.5px', marginTop:5, fontWeight:800, opacity:0.8 }}>
              Bridging Excellence, Caring for Lives
            </div>
          </div>
          <div style={{ marginTop:12, paddingTop:12, borderTop:`1px solid ${C.border}` }}>
            <div style={{ fontSize:8, color:C.dim, textTransform:'uppercase', letterSpacing:'1.2px', fontWeight:800 }}>Admin Console</div>
          </div>
        </div>

        {/* System Status */}
        <div style={{ margin:'12px 14px', padding:'8px 12px', background:'rgba(0,96,99,0.1)', border:`1px solid rgba(0,96,99,0.25)`, borderRadius:8 }}>
          <div style={{ fontSize:9, color:C.dim, textTransform:'uppercase', letterSpacing:'0.7px', marginBottom:4 }}>System Status</div>
          <div style={{ display:'flex', gap:12 }}>
            {[{l:'API',ok:true},{l:'DB',ok:true},{l:'AI',ok:true}].map(s => (
              <div key={s.l} style={{ display:'flex', alignItems:'center', gap:4, fontSize:10 }}>
                <div style={{ width:5, height:5, borderRadius:'50%', background:s.ok?TEAL2:'#ef4444' }}/>
                <span style={{ color:s.ok?TEAL2:C.muted }}>{s.l}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex:1, padding:'6px 10px', overflowY:'auto' }}>
          {NAV.map(n => (
            <button key={n.id} onClick={()=>{ goTab(n.id); if(isMobile) setSideOpen(false); }}
              style={{ width:'100%', display:'flex', alignItems:'center', gap:9, padding:'9px 10px', borderRadius:8, border:'none', cursor:'pointer', marginBottom:3,
                background: active===n.id ? `rgba(0,96,99,0.2)` : 'transparent',
                color:      active===n.id ? TEAL2 : C.muted,
                fontWeight: active===n.id ? 700 : 500, fontSize:13, textAlign:'left' }}>
              <Icon d={n.icon} size={16} color={active===n.id?TEAL2:C.dim}/>
              {n.label}
              {n.id==='doctors' && pending.length>0 && (
                <span style={{ marginLeft:'auto', background:'#ef4444', color:'#fff', borderRadius:12, padding:'1px 7px', fontSize:9, fontWeight:800 }}>{pending.length}</span>
              )}
            </button>
          ))}
        </nav>

        {/* User pill */}
        <div style={{ padding:'16px', borderTop:`1px solid ${C.border}` }}>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:12 }}>
            <div style={{ width:36, height:36, background:`linear-gradient(135deg,${TEAL},${TEAL2})`, borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontSize:13, fontWeight:900 }}>A</div>
            <div>
              <div style={{ fontSize:13, color:'#fff', fontWeight:800 }}>Admin</div>
              <div style={{ fontSize:9, color:C.dim, textTransform:'uppercase', letterSpacing:'0.5px' }}>Head Administrator</div>
            </div>
          </div>
          <button onClick={()=>navigate('/')} style={{ width:'100%', padding:'9px', background:'rgba(239,68,68,0.08)', border:`1px solid rgba(239,68,68,0.2)`, borderRadius:10, color:'#f87171', fontSize:12, fontWeight:700, cursor:'pointer' }}>
            ← Exit to CareBridge
          </button>
        </div>
      </aside>

      {/* CONTENT */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', minWidth:0 }}>
        {/* Header */}
        <header style={{ background:'#050a14', borderBottom:`1px solid ${C.border}`, padding:'18px 28px', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:16, position:'sticky', top:0, zIndex:50 }}>
          <div style={{ display:'flex', alignItems:'center', gap:14 }}>
            {isMobile && <button onClick={()=>setSideOpen(o=>!o)} style={{ background:'none', border:'none', color:C.muted, cursor:'pointer', fontSize:22 }}>☰</button>}
            <div>
              <h1 style={{ margin:0, fontSize:20, fontWeight:900, color:'#fff', letterSpacing:'-0.5px' }}>{NAV.find(n=>n.id===active)?.label}</h1>
              <p style={{ margin:0, fontSize:10, color:C.dim, textTransform:'uppercase', letterSpacing:'1px' }}>CareBridge Intelligence Dashboard</p>
            </div>
          </div>
          <div style={{ display:'flex', gap:16, alignItems:'center' }}>
            {!isMobile && <Search value={search} onChange={setSearch} placeholder="Global search…"/>}
            <button onClick={fetchAll} style={{ width:38, height:38, background:`rgba(0,96,99,0.15)`, border:`1px solid ${C.border}`, borderRadius:10, color:TEAL2, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }} title="Refresh">↻</button>
          </div>
        </header>

        {/* Main */}
        <main style={{ flex:1, padding:'28px', overflowY:'auto' }}>
          {loading
            ? <div style={{ textAlign:'center', padding:'80px 0', color:C.dim }}><div style={{ fontSize:32 }}>⟳</div><p style={{ margin:'12px 0 0' }}>Syncing Hospital Data…</p></div>
            : (
              <div style={{ display:'flex', flexDirection:'column', gap:GAP }}>
                {active==='overview'     && renderDashboard()}
                {active==='doctors'      && renderDoctors()}
                {active==='users'        && renderUsers()}
                {active==='appointments' && renderAppointments()}
                {active==='reports'      && renderReports()}
              </div>
            )
          }
        </main>
      </div>

      {deleteModal && <DeleteModal/>}
      {editModal   && <EditModal/>}
    </div>
  );
}