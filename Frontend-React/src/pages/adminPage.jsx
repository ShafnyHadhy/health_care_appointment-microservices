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
import html2canvas from 'html2canvas';

// ─── CareBridge Brand Config (Homepage Matching) ──────────────────────────────
const API    = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const PRIMARY = '#007B7F'; // Matches homepage primary
const SECONDARY = '#00B2A9';
const TERTIARY = '#E2F7F1';
const NEUTRAL = '#F4FFFB';
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const C = {
  bg:      NEUTRAL,
  sidebar: '#FFFFFF',
  card:    '#FFFFFF',
  border:  '#E2F7F1',
  border2: '#CCEBE2',
  text:    '#1A1C1E',
  muted:   '#49454F',
  dim:     '#79747E',
  primary: PRIMARY,
  secondary: SECONDARY,
};
const GAP = '24px';
const PIE_COLORS = [PRIMARY, SECONDARY, '#38bdf8', '#fbbf24', '#f87171'];

const NAV = [
  { id:'overview',     label:'Dashboard',           icon:'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { id:'doctors',      label:'Doctor Verification', icon:'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
  { id:'users',        label:'User Management',     icon:'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' },
  { id:'appointments', label:'Appointments',         icon:'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
  { id:'reports',      label:'Reports & Analytics', icon:'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
  { id:'aiDiagnostics',label:'AI Diagnostics',      icon:'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmtDate  = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' }) : '—';
const fmtMini  = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day:'2-digit', month:'short' }) : '—';
const initials = (n) => (n||'?').split(' ').map(w=>w[0]).slice(0,2).join('').toUpperCase();

const Avatar = ({ name, size=38, bg=`linear-gradient(135deg, ${PRIMARY}, ${SECONDARY})` }) => (
  <div style={{ width:size, height:size, background:bg, borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:800, fontSize:Math.round(size*0.32), flexShrink:0, shadow:'0 2px 8px rgba(0,123,127,0.2)' }}>
    {initials(name)}
  </div>
);

const Icon = ({ d, size=18, color='currentColor', strokeWidth=2 }) => (
  <svg width={size} height={size} fill="none" stroke={color} viewBox="0 0 24 24" strokeWidth={strokeWidth}>
    <path strokeLinecap="round" strokeLinejoin="round" d={d}/>
  </svg>
);

const Badge = ({ label, color }) => (
  <span style={{ padding:'4px 12px', borderRadius:8, fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.5px', background:`rgba(${color},0.12)`, color:`rgb(${color})`, border:`0.5px solid rgba(${color},0.2)` }}>{label}</span>
);
const statusCol = (s='') => {
  const l = s.toLowerCase();
  if (['verified','confirmed','completed','active'].includes(l)) return '0,123,127';
  if (['rejected','cancelled','inactive'].includes(l))          return '239,68,68';
  return '245,158,11';
};

const Search = ({ value, onChange, placeholder='Search records…' }) => (
  <div style={{ position:'relative', minWidth:280 }}>
    <div style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', pointerEvents:'none' }}>
      <Icon d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" size={16} color={C.dim} strokeWidth={2.5}/>
    </div>
    <input value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
      style={{ width:'100%', padding:'12px 14px 12px 42px', background:'#FFFFFF', border:`1px solid ${C.border}`, borderRadius:14, color:C.text, fontSize:14, outline:'none', boxSizing:'border-box', boxShadow:'0 2px 4px rgba(0,0,0,0.02)', transition:'all 0.2s' }}
      onFocus={e => e.target.style.borderColor = PRIMARY}/>
    {value && <button onClick={()=>onChange('')} style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', color:C.dim, cursor:'pointer', fontSize:20 }}>×</button>}
  </div>
);

const Table = ({ cols, rows, empty='No records found.' }) => (
  <div style={{ overflowX:'auto' }}>
    <table style={{ width:'100%', borderCollapse:'collapse' }}>
      <thead><tr style={{ background:TERTIARY }}>
        {cols.map(c => <th key={c} style={{ padding:'12px 20px', textAlign:'left', fontSize:10, color:PRIMARY, textTransform:'uppercase', letterSpacing:'1px', fontWeight:800, whiteSpace:'nowrap' }}>{c}</th>)}
      </tr></thead>
      <tbody>
        {rows.length === 0
          ? <tr><td colSpan={cols.length} style={{ padding:60, textAlign:'center', color:C.dim, fontSize:14 }}>{empty}</td></tr>
          : rows}
      </tbody>
    </table>
  </div>
);
const TR = ({ children, i=0 }) => <tr style={{ borderTop:`1px solid ${C.border}`, background: i%2===1 ? 'rgba(0,123,127,0.02)' : 'transparent', transition:'background 0.2s' }}>{children}</tr>;
const TD = ({ children, sub=false, mono=false }) => <td style={{ padding:'16px 20px', fontSize:sub?13:15, color:sub?C.dim:C.text, fontFamily:mono?'monospace':'inherit', whiteSpace:'nowrap', fontWeight:sub?500:600 }}>{children}</td>;

const Card = ({ children, style={}, noPad=false, title }) => (
  <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:16, boxShadow:'0 4px 20px rgba(0,96,99,0.04)', ...(noPad?{}:{padding:GAP}), ...style, position:'relative', overflow:'hidden' }}>
    {title && <div style={{ fontSize:16, fontWeight:800, color:PRIMARY, marginBottom:20, fontFamily:'"Manrope", sans-serif' }}>{title}</div>}
    {children}
  </div>
);

const Overlay = ({ children, onClose }) => (
  <div onClick={onClose} style={{ position:'fixed', inset:0, background:'rgba(0,40,42,0.4)', backdropFilter:'blur(4px)', zIndex:2000, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
    <div onClick={e=>e.stopPropagation()} style={{ background:'#FFFFFF', borderRadius:24, padding:32, width:'100%', maxWidth:540, border:`1px solid ${C.border}`, boxShadow:'0 20px 60px rgba(0,0,0,0.1)', maxHeight:'90vh', overflowY:'auto' }}>
      {children}
    </div>
  </div>
);
const MHead = ({ title, onClose }) => (
  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:28 }}>
    <h2 style={{ margin:0, fontSize:22, fontWeight:800, color:PRIMARY, fontFamily:'"Manrope", sans-serif' }}>{title}</h2>
    <button onClick={onClose} style={{ background:'rgba(0,123,127,0.05)', border:'none', color:PRIMARY, width:32, height:32, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:24, cursor:'pointer' }}>×</button>
  </div>
);
const MField = ({ label, value, onChange, type='text', options=null, disabled=false }) => (
  <div style={{ marginBottom:22 }}>
    <label style={{ display:'block', fontSize:12, color:PRIMARY, textTransform:'uppercase', letterSpacing:'0.8px', marginBottom:10, fontWeight:800 }}>{label}</label>
    {options
      ? <select value={value} onChange={e=>onChange(e.target.value)} disabled={disabled}
          style={{ width:'100%', padding:'14px 16px', background:NEUTRAL, border:`1px solid ${C.border}`, borderRadius:14, color:C.text, fontSize:15, outline:'none' }}>
          {options.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      : <input type={type} value={value} onChange={e=>onChange(e.target.value)} disabled={disabled}
          style={{ width:'100%', padding:'14px 16px', background:NEUTRAL, border:`1px solid ${C.border}`, borderRadius:14, color:disabled?C.dim:C.text, fontSize:15, outline:'none', boxSizing:'border-box' }}/>
    }
  </div>
);

const TealBtn = ({ onClick, children, outline=false, danger=false, sm=false }) => (
  <button onClick={onClick} style={{
    padding: sm ? '8px 16px' : '14px 32px',
    background: danger ? 'rgba(239,68,68,0.1)' : outline ? 'transparent' : `linear-gradient(135deg, #006063 0%, #007B7F 100%)`,
    border: danger ? '1.5px solid rgba(239,68,68,0.2)' : outline ? `1.5px solid ${C.border2}` : 'none',
    borderRadius: 14, color: danger ? '#ef4444' : outline ? PRIMARY : '#fff',
    fontSize: sm ? 13 : 15, fontWeight:800, cursor:'pointer', whiteSpace:'nowrap', transition:'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    display:'flex', alignItems:'center', justifyContent:'center', gap:10,
    boxShadow: outline || danger ? 'none' : '0 6px 16px rgba(0,123,127,0.2)',
  }}
  onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'}
  onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
  >{children}</button>
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
  const [aiReports,    setAiReports]    = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [search,       setSearch]       = useState('');
  const [docFilter,    setDocFilter]    = useState('all');
  const [apptFilter,   setApptFilter]   = useState('all');
  const [deleteModal,  setDeleteModal]  = useState(null);
  const [editModal,    setEditModal]    = useState(null);
  const [reportType,   setReportType]   = useState('summary');
  const [activityLog,  setActivityLog]  = useState([]);

  useEffect(() => {
    const chk = () => { const m = window.innerWidth < 1024; setIsMobile(m); setSideOpen(!m); };
    chk(); window.addEventListener('resize', chk);
    return () => window.removeEventListener('resize', chk);
  }, []);

  const goTab = (id) => { setActive(id); setSearch(''); };
  useEffect(() => { fetchAll(); }, []);

  const addLog = (msg, type='info') =>
    setActivityLog(prev => [{ msg, type, time: new Date() }, ...prev].slice(0,25));

  const fetchAll = async () => {
    setLoading(true);
    try {
      const cfg = { headers:{ Authorization:`Bearer ${localStorage.getItem('token')}` } };
      const [uR, aR, aiR] = await Promise.allSettled([
        axios.get(`${API}/api/admin/users`, cfg),
        axios.get(`${API}/api/admin/appointments`, cfg),
        axios.get(`${API}/api/admin/ai-reports`, cfg),
      ]);
      
      if (uR.status==='fulfilled') {
        const userData = uR.value.data?.data;
        setDoctors(userData?.doctors || []);
        setUsers(userData?.patients || []);
      }
      if (aR.status==='fulfilled') setAppointments(aR.value.data?.data || []);
      if (aiR.status==='fulfilled') setAiReports(aiR.value.data?.data || []);
    } catch(e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleVerify = async (id, name) => {
    try { await axios.put(`${API}/api/admin/doctors/verify/${id}`, {}, { headers:{ Authorization:`Bearer ${localStorage.getItem('token')}` } });
      toast.success('Doctor verified successfully!'); addLog(`✓ Verified Dr. ${name}`, 'success'); fetchAll();
    } catch { toast.error('Verification failed.'); }
  };
  const handleReject = async (id, name) => {
    try { await axios.put(`${API}/api/admin/doctors/reject/${id}`, {}, { headers:{ Authorization:`Bearer ${localStorage.getItem('token')}` } });
      toast.success('Doctor application rejected.'); addLog(`✗ Rejected Dr. ${name}`, 'warn'); fetchAll();
    } catch { toast.error('Action failed.'); }
  };
  const handleDelete = async () => {
    if (!deleteModal) return;
    try {
      await axios.delete(`${API}/api/admin/users/${deleteModal.type}/${deleteModal.id}`, { headers:{ Authorization:`Bearer ${localStorage.getItem('token')}` } });
      toast.success(`${deleteModal.name} removed from registry.`); addLog(`🗑 Deleted ${deleteModal.name}`, 'danger');
      setDeleteModal(null); fetchAll();
    } catch { toast.error('Delete operation failed.'); setDeleteModal(null); }
  };
  const handleSaveEdit = async (formData) => {
    if (!editModal) return;
    const cfg = { headers:{ Authorization:`Bearer ${localStorage.getItem('token')}` } };
    try {
      if (editModal.mode === 'create') {
        const url = editModal.type==='doctor' ? `${API}/api/doctors/register` : `${API}/api/patients/register`;
        await axios.post(url, formData, cfg);
        toast.success('Record created successfully!'); addLog(`+ Created ${formData.name}`, 'success');
      } else {
        // CHANGED PATCH TO PUT TO MATCH BACKEND
        await axios.put(`${API}/api/admin/users/${editModal.type}/${editModal.data._id}`, formData, cfg);
        toast.success('Record updated successfully!'); addLog(`✏ Updated ${formData.name}`, 'info');
      }
      setEditModal(null); fetchAll();
    } catch(e) { toast.error(e.response?.data?.message || 'Operation failed.'); }
  };

  // ── Derived ───────────────────────────────────────────────────────────────
  const pending  = useMemo(() => doctors.filter(d => !d.isVerified && !d.isRejected), [doctors]);
  const verified = useMemo(() => doctors.filter(d =>  d.isVerified), [doctors]);

  const filtDocs = useMemo(() => {
    let d = [...doctors];
    if (docFilter==='pending')  d = d.filter(x => !x.isVerified && !x.isRejected);
    if (docFilter==='verified') d = d.filter(x =>  x.isVerified);
    if (docFilter==='rejected') d = d.filter(x =>  x.isRejected);
    if (search) d = d.filter(x => `${x.name||x.fullName||''} ${x.email||''} ${x.specialization||x.specialty||''}`.toLowerCase().includes(search.toLowerCase()));
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
    if (search) a = a.filter(x => `${x.patientName||x.patient||''} ${x.doctorName||x.doctor||''} ${x.status||''}`.toLowerCase().includes(search.toLowerCase()));
    return a;
  }, [appointments, apptFilter, search]);

  const filtAiReports = useMemo(() => {
    let r = [...aiReports];
    if (search) r = r.filter(x => `${x.patientName||''} ${x.disease||''} ${x.riskLevel||''}`.toLowerCase().includes(search.toLowerCase()));
    return r;
  }, [aiReports, search]);

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
    const map = {}; doctors.forEach(d => { const s=d.specialization||d.specialty||'General'; map[s]=(map[s]||0)+1; });
    return Object.entries(map).sort((a,b)=>b[1]-a[1]).slice(0,5).map(([name,value])=>({ name, value }));
  }, [doctors]);

  // ── Exports ───────────────────────────────────────────────────────────────
  const getReportRows = () => {
    if (reportType==='doctor_performance') return {
      title:'Doctor Performance', headers:['Name','Specialty','Email','Status'],
      rows: doctors.map(d => [d.name||d.fullName||'N/A', d.specialization||d.specialty||'—', d.email||'—', d.isVerified?'Verified':d.isRejected?'Rejected':'Pending']),
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
    toast.success('CSV Exported Successfully');
  };
  const exportXLSX = (filename, headers, rows) => {
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([headers,...rows]), 'Report');
    XLSX.writeFile(wb, filename+'.xlsx'); toast.success('XLSX Exported Successfully');
  };
  const exportPDF = async (title, headers, rows) => {
    toast.loading('Generating detailed PDF report...', { id: 'pdf-toast' });
    try {
      const doc = new jsPDF('p', 'mm', 'a4');
      doc.setFontSize(22); doc.setTextColor(0,123,127); doc.text('CareBridge Analytics', 14, 22);
      doc.setFontSize(14); doc.setTextColor(73,69,79); doc.text(`${title}`, 14, 32);
      doc.setFontSize(10); doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 38);
      
      let startY = 46;

      // Try capturing charts
      const chartsEl = document.getElementById('report-charts');
      if (chartsEl) {
        const canvas = await html2canvas(chartsEl, { scale: 2, useCORS: true });
        const imgData = canvas.toDataURL('image/png');
        
        // Calculate image dimensions to fit A4 width (maintain aspect ratio)
        const pdfWidth = doc.internal.pageSize.getWidth() - 28; // 14mm margins
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        
        doc.addImage(imgData, 'PNG', 14, startY, pdfWidth, pdfHeight);
        startY += pdfHeight + 15; // Push table below charts
      }

      autoTable(doc, { 
        startY: startY, 
        head: [headers], 
        body: rows, 
        styles: { fontSize: 9, cellPadding: 5 }, 
        headStyles: { fillColor: [0, 123, 127], textColor: 255, fontStyle: 'bold' }, 
        alternateRowStyles: { fillColor: [244, 255, 251] } 
      });
      
      doc.save(title.replace(/\s+/g,'_')+'.pdf'); 
      toast.success('PDF Exported Successfully', { id: 'pdf-toast' });
    } catch (e) {
      console.error(e);
      toast.error('Failed to generate PDF', { id: 'pdf-toast' });
    }
  };

  // ── Render: Dashboard ─────────────────────────────────────────────────────
  const renderDashboard = () => (
    <div style={{ display:'flex', flexDirection:'column', gap:GAP }}>
      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))', gap:GAP }}>
        {[
          { label:'Total Patients', value:users.length,        col:PRIMARY,   icon:'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' },
          { label:'Active Doctors',  value:doctors.length,      col:SECONDARY, icon:'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
          { label:'Pending Review',  value:pending.length,      col:'#fbbf24', icon:'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
          { label:'Appointments',    value:appointments.length, col:'#8b5cf6', icon:'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
        ].map(s => (
          <Card key={s.label} style={{ background:'#fff', borderRadius:20, padding:'28px' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
              <div>
                <div style={{ fontSize:12, color:C.dim, textTransform:'uppercase', letterSpacing:'1.2px', fontWeight:800, marginBottom:10 }}>{s.label}</div>
                <div style={{ fontSize:36, fontWeight:900, color:C.text, lineHeight:1 }}>{s.value}</div>
              </div>
              <div style={{ width:52, height:52, background:`rgba(${s.col==='#007B7F'?'0,123,127':s.col==='#00B2A9'?'0,178,169':'210,210,210'},0.1)`, borderRadius:16, display:'flex', alignItems:'center', justifyContent:'center' }}>
                <Icon d={s.icon} size={24} color={s.col}/>
              </div>
            </div>
            <div style={{ height:4, width:'100%', background:TERTIARY, borderRadius:10, marginTop:24 }}>
                <div style={{ height:'100%', width:'60%', background:s.col, borderRadius:10 }} />
            </div>
          </Card>
        ))}
      </div>

      {/* Pending Alert Banner */}
      {pending.length > 0 && (
        <div style={{ background:TERTIARY, border:`1.5px solid ${C.border2}`, borderRadius:20, padding:'16px 24px', display:'flex', justifyContent:'space-between', alignItems:'center', gap:20 }}>
          <div style={{ display:'flex', alignItems:'center', gap:16 }}>
            <div style={{ width:40, height:40, background:PRIMARY, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff' }}>!</div>
            <div>
              <div style={{ fontWeight:800, color:PRIMARY, fontSize:15 }}>Verification Queue Alert</div>
              <div style={{ fontSize:13, color:C.dim }}>{pending.length} medical professional{pending.length>1?'s are': ' is'} awaiting credentials review.</div>
            </div>
          </div>
          <TealBtn onClick={()=>goTab('doctors')} sm>Go to Queue →</TealBtn>
        </div>
      )}

      {/* Analytics Charts */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(400px, 1fr))', gap:GAP }}>
        <Card title="Patient Registry & Activity">
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={monthlyData} margin={{ top:0, right:10, left:-20, bottom:0 }}>
              <defs>
                <linearGradient id="primaryGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={PRIMARY} stopOpacity={0.2}/>
                  <stop offset="95%" stopColor={PRIMARY} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false}/>
              <XAxis dataKey="month" tick={{ fill:C.dim, fontSize:11, fontWeight:600 }} axisLine={false} tickLine={false}/>
              <YAxis tick={{ fill:C.dim, fontSize:11, fontWeight:600 }} axisLine={false} tickLine={false} allowDecimals={false}/>
              <Tooltip contentStyle={{ background:'#FFFFFF', border:`1px solid ${C.border}`, borderRadius:12, fontSize:12, boxShadow:'0 10px 30px rgba(0,0,0,0.08)' }}/>
              <Area type="monotone" dataKey="Appointments" stroke={PRIMARY} strokeWidth={3} fill="url(#primaryGrad)" activeDot={{ r: 6, strokeWidth: 0 }}/>
              <Area type="monotone" dataKey="Patients" stroke={SECONDARY} strokeWidth={2} fill="none" strokeDasharray="6 4"/>
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Specialty Distribution">
          {specialtyData.length > 0 ? (
            <div style={{ display:'flex', flexDirection:'column', gap:14, marginTop:10 }}>
              {specialtyData.map((s,i) => {
                const max = specialtyData[0].value || 1;
                return (
                  <div key={i}>
                    <div style={{ display:'flex', justifyContent:'space-between', fontSize:13, marginBottom:8, fontWeight:700 }}>
                      <span style={{ color:C.text }}>{s.name}</span>
                      <span style={{ color:PRIMARY }}>{s.value} Specialists</span>
                    </div>
                    <div style={{ height:10, background:TERTIARY, borderRadius:10 }}>
                      <div style={{ height:'100%', width:`${(s.value/max)*100}%`, background:PIE_COLORS[i%PIE_COLORS.length], borderRadius:10, boxShadow:`0 0 10px ${PIE_COLORS[i%PIE_COLORS.length]}40` }}/>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : <div style={{ color:C.dim, fontSize:14, textAlign:'center', paddingTop:40 }}>No diagnostic data available.</div>}
        </Card>
      </div>

      {/* Tables Row */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(400px, 1fr))', gap:GAP }}>
        <Card title="Recent Provider Onboarding" noPad>
          <div style={{ padding:'0 24px 20px', display:'flex', justifyContent:'flex-end' }}>
             <TealBtn sm outline onClick={()=>goTab('doctors')}>View All Doctors</TealBtn>
          </div>
          <Table cols={['Provider','Expertise','Status']} rows={doctors.slice(0,6).map((d,i) => (
            <TR key={d._id||i} i={i}>
              <TD><div style={{ display:'flex', alignItems:'center', gap:12 }}><Avatar name={d.name||d.fullName}/>{d.name||d.fullName||'N/A'}</div></TD>
              <TD sub>{d.specialization || d.specialty || 'General Pract.'}</TD>
              <TD><Badge label={d.isVerified?'Verified':d.isRejected?'Rejected':'Pending'} color={statusCol(d.isVerified?'verified':d.isRejected?'rejected':'pending')}/></TD>
            </TR>
          ))} empty="No healthcare providers registered."/>
        </Card>

        <Card title="Operations Journal" badge={activityLog.length}>
          <div style={{ display:'flex', flexDirection:'column', gap:10, maxHeight:360, overflowY:'auto', paddingRight:6 }}>
            {activityLog.length === 0
              ? <div style={{ fontSize:14, color:C.dim, paddingTop:40, textAlign:'center' }}>The operation journal is currently clear.</div>
              : activityLog.map((l,i) => (
                <div key={i} style={{ display:'flex', gap:14, padding:'12px 16px', background:TERTIARY, borderRadius:14, border:`1.5px solid ${NEUTRAL}` }}>
                  <div style={{ width:8, height:8, borderRadius:'50%', background: l.type==='success'?PRIMARY:l.type==='danger'?'#ef4444':'#fbbf24', flexShrink:0, marginTop:6 }}/>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:14, color:C.text, fontWeight:700 }}>{l.msg}</div>
                    <div style={{ fontSize:11, color:C.dim, marginTop:2, fontWeight:600 }}>{fmtMini(l.time)} • System Notification</div>
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
    <Card noPad title="Credential Verification & Registry">
      <div style={{ padding:'0 24px 24px', borderBottom:`1px solid ${C.border}`, display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:16, marginTop:-10 }}>
        <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
          {['all','pending','verified','rejected'].map(f => (
            <button key={f} onClick={()=>setDocFilter(f)} style={{ padding:'8px 18px', borderRadius:12, fontSize:13, fontWeight:800, border:'none', cursor:'pointer', textTransform:'capitalize', background:docFilter===f?PRIMARY:TERTIARY, color:docFilter===f?'#fff':PRIMARY, transition:'all 0.2s' }}>{f}</button>
          ))}
        </div>
        <div style={{ display:'flex', gap:12, flexWrap:'wrap', alignItems:'center' }}>
          <Search value={search} onChange={setSearch} placeholder="Search specialists…"/>
          <TealBtn sm onClick={()=>setEditModal({ mode:'create', type:'doctor', data:{} })}>+ Register Provider</TealBtn>
        </div>
      </div>
      <Table cols={['Provider','Expertise','Contact','Accreditation','Manage']} rows={filtDocs.map((d,i) => (
        <TR key={d._id||i} i={i}>
          <TD><div style={{ display:'flex', alignItems:'center', gap:12 }}><Avatar name={d.name||d.fullName}/>{d.name||d.fullName||'N/A'}</div></TD>
          <TD sub>{d.specialization||d.specialty||'—'}</TD>
          <TD sub mono>{d.email||'—'}</TD>
          <TD><Badge label={d.isVerified?'Verified':d.isRejected?'Rejected':'Pending'} color={statusCol(d.isVerified?'verified':d.isRejected?'rejected':'pending')}/></TD>
          <TD>
            <div style={{ display:'flex', gap:8 }}>
              {!d.isVerified && !d.isRejected && <>
                <button onClick={()=>handleVerify(d._id, d.name||'Dr')} title="Review & Approve" style={{ width:34, height:34, background:'rgba(0,123,127,0.1)', border:'none', borderRadius:10, color:PRIMARY, fontSize:16, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>✓</button>
                <button onClick={()=>handleReject(d._id, d.name||'Dr')} title="Reject Credentials" style={{ width:34, height:34, background:'rgba(239,68,68,0.1)', border:'none', borderRadius:10, color:'#ef4444', fontSize:16, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>✗</button>
              </>}
              <button onClick={()=>setEditModal({ mode:'edit', type:'doctor', data:d })} title="Modify Profile" style={{ width:34, height:34, background:'rgba(0,123,127,0.1)', border:'none', borderRadius:10, color:PRIMARY, fontSize:14, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>✎</button>
              <button onClick={()=>setDeleteModal({ type:'doctor', id:d._id, name:d.name||d.fullName||'Doctor' })} title="Revoke Access" style={{ width:34, height:34, background:'rgba(239,68,68,0.1)', border:'none', borderRadius:10, color:'#ef4444', fontSize:20, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>×</button>
            </div>
          </TD>
        </TR>
      ))} empty="No medical providers found matching the criteria."/>
    </Card>
  );

  // ── Render: Users ─────────────────────────────────────────────────────────
  const renderUsers = () => (
    <Card noPad title="Patient Health Registry">
      <div style={{ padding:'0 24px 24px', borderBottom:`1px solid ${C.border}`, display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:16, marginTop:-10 }}>
        <Search value={search} onChange={setSearch} placeholder="Filter patients by name/email…"/>
        <TealBtn sm onClick={()=>setEditModal({ mode:'create', type:'user', data:{} })}>+ Add New Patient</TealBtn>
      </div>
      <Table cols={['Patient Identity','Contact Email','Phone Number','Enrollment','Actions']} rows={filtUsers.map((u,i) => (
        <TR key={u._id||i} i={i}>
          <TD><div style={{ display:'flex', alignItems:'center', gap:12 }}><Avatar name={u.name||u.fullName} bg={`linear-gradient(135deg, ${SECONDARY}, ${PRIMARY})`}/>{u.name||u.fullName||'N/A'}</div></TD>
          <TD sub mono>{u.email||'—'}</TD>
          <TD sub>{u.phone||u.phoneNumber||'—'}</TD>
          <TD sub>{fmtDate(u.createdAt)}</TD>
          <TD>
            <div style={{ display:'flex', gap:8 }}>
              <TealBtn sm outline onClick={()=>setEditModal({ mode:'edit', type:'user', data:u })}>Edit</TealBtn>
              <button onClick={()=>setDeleteModal({ type:'user', id:u._id, name:u.name||u.fullName||'Patient' })} style={{ width:34, height:34, background:'rgba(239,68,68,0.1)', border:'none', borderRadius:10, color:'#ef4444', fontSize:20, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>×</button>
            </div>
          </TD>
        </TR>
      ))} empty="No patient records detected."/>
    </Card>
  );

  // ── Render: Appointments ──────────────────────────────────────────────────
  const renderAppointments = () => (
    <Card noPad title="Clinical Appointments Schedule">
      <div style={{ padding:'0 24px 24px', borderBottom:`1px solid ${C.border}`, display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:16, marginTop:-10 }}>
        <div style={{ display:'flex', gap:8 }}>
          {['all','pending','confirmed','completed','cancelled'].map(f => (
            <button key={f} onClick={()=>setApptFilter(f)} style={{ padding:'8px 18px', borderRadius:12, fontSize:13, fontWeight:800, border:'none', cursor:'pointer', textTransform:'capitalize', background:apptFilter===f?PRIMARY:TERTIARY, color:apptFilter===f?'#fff':PRIMARY, transition:'all 0.2s' }}>{f}</button>
          ))}
        </div>
        <Search value={search} onChange={setSearch} placeholder="Search schedule…"/>
      </div>
      <Table cols={['Patient','Physician','Scheduled Date','Slot','Status']} rows={filtAppts.map((a,i) => (
        <TR key={a._id||i} i={i}>
          <TD>{a.patientName||a.patient||'N/A'}</TD>
          <TD sub>{a.doctorName||a.doctor||'—'}</TD>
          <TD sub>{fmtDate(a.date||a.appointmentDate)}</TD>
          <TD sub>{a.timeSlot||a.time||'—'}</TD>
          <TD><Badge label={a.status||'Pending'} color={statusCol(a.status)}/></TD>
        </TR>
      ))} empty="No clinical appointments found in this window."/>
    </Card>
  );

  // ── Render: Reports ───────────────────────────────────────────────────────
  const renderReports = () => {
    const { title, headers, rows } = getReportRows();
    return (
      <div style={{ display:'flex', flexDirection:'column', gap:GAP }}>
        <Card title="Analytics Engine Configuration">
          <div style={{ display:'flex', flexWrap:'wrap', gap:20, alignItems:'flex-end' }}>
            <div style={{ flex:'1 1 240px' }}>
              <label style={{ display:'block', fontSize:12, color:PRIMARY, textTransform:'uppercase', letterSpacing:'1px', marginBottom:10, fontWeight:800 }}>Dataset Source</label>
              <select value={reportType} onChange={e=>setReportType(e.target.value)} style={{ width:'100%', padding:'14px 16px', background:TERTIARY, border:`1.5px solid ${C.border}`, borderRadius:14, color:PRIMARY, fontSize:15, outline:'none', fontWeight:700 }}>
                <option value="summary">Hospital Operations Summary</option>
                <option value="doctor_performance">Provider Productivity Matrix</option>
                <option value="appointment_trends">Engagement & Growth Trends</option>
              </select>
            </div>
            <div style={{ display:'flex', gap:10 }}>
              {[{label:'Download PDF',col:'#ef4444',fn:()=>exportPDF(title,headers,rows)},{label:'CSV Schema',col:SECONDARY,fn:()=>exportCSV(title,headers,rows)},{label:'XLSX Sheet',col:'#0ea5e9',fn:()=>exportXLSX(title,headers,rows)}].map(b => (
                <button key={b.label} onClick={b.fn} style={{ padding:'12px 20px', background:NEUTRAL, border:`1.5px solid ${C.border}`, borderRadius:14, color:b.col, fontSize:14, fontWeight:800, cursor:'pointer', transition:'all 0.2s' }}>{b.label}</button>
              ))}
            </div>
          </div>
        </Card>

        <div id="report-charts" style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap:GAP }}>
          <Card title="Growth Analytics Overview">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={monthlyData} margin={{ top:0, right:10, left:-20, bottom:0 }} barSize={12}>
                <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false}/>
                <XAxis dataKey="month" tick={{ fill:C.dim, fontSize:11, fontWeight:600 }} axisLine={false} tickLine={false}/>
                <YAxis tick={{ fill:C.dim, fontSize:11, fontWeight:600 }} axisLine={false} tickLine={false} allowDecimals={false}/>
                <Tooltip contentStyle={{ background:'#FFFFFF', border:`1px solid ${C.border}`, borderRadius:12, fontSize:12, boxShadow:'0 10px 30px rgba(0,0,0,0.08)' }} cursor={{fill: TERTIARY}}/>
                <Bar dataKey="Appointments" fill={PRIMARY} radius={[4,4,0,0]}/>
              </BarChart>
            </ResponsiveContainer>
          </Card>
          <Card title="Operational Mix">
            {statusPie.length > 0
              ? <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie data={statusPie} cx="50%" cy="50%" innerRadius={60} outerRadius={85} paddingAngle={6} dataKey="value" strokeWidth={0}>
                      {statusPie.map((_,i) => <Cell key={i} fill={PIE_COLORS[i%PIE_COLORS.length]}/>)}
                    </Pie>
                    <Tooltip contentStyle={{ background:'#FFFFFF', border:`1px solid ${C.border}`, borderRadius:12, fontSize:12 }}/>
                  </PieChart>
                </ResponsiveContainer>
              : <div style={{ height:260, display:'flex', alignItems:'center', justifyContent:'center', color:C.dim, fontSize:14 }}>Insufficient operational data.</div>}
        </Card>
        </div>

        <Card noPad title="Report Result Preview">
          <div style={{ padding:'0 24px 14px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <span style={{ fontSize:13, color:C.dim, fontWeight:700 }}>Data Source: <span style={{color:PRIMARY}}>{title}</span></span>
            <span style={{ fontSize:11, color:PRIMARY, fontWeight:800, background:TERTIARY, padding:'4px 10px', borderRadius:8 }}>{rows.length} RECORD SETS</span>
          </div>
          <Table cols={headers} rows={rows.slice(0,15).map((r,i) => (
            <TR key={i} i={i}>{r.map((cell,ci) => <TD key={ci} sub={ci>0}>{cell}</TD>)}</TR>
          ))} empty="Query returned zero results."/>
        </Card>
      </div>
    );
  };

  // ── Render: AI Diagnostics ────────────────────────────────────────────────
  const renderAiDiagnostics = () => (
    <Card noPad title="AI Diagnostic Intelligence">
      <div style={{ padding:'0 24px 24px', borderBottom:`1px solid ${C.border}`, display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:16, marginTop:-10 }}>
        <Search value={search} onChange={setSearch} placeholder="Search by patient, disease or risk level…"/>
      </div>
      <Table cols={['Patient Info', 'Reported Symptoms', 'Predicted Disease', 'Risk Level', 'Analysis Date']} rows={filtAiReports.map((r,i) => (
        <TR key={r._id||i} i={i}>
          <TD>
            <div style={{ fontWeight:800 }}>{r.patientName || 'Anonymous'}</div>
            <div style={{ fontSize:11, color:C.dim }}>{r.patientEmail} • {r.patientPhone}</div>
          </TD>
          <TD sub><div style={{ maxWidth:200, overflow:'hidden', textOverflow:'ellipsis' }}>{(r.symptoms||[]).join(', ')}</div></TD>
          <TD><span style={{ color:PRIMARY, fontWeight:700 }}>{r.disease}</span> <div style={{ fontSize:10, color:C.dim, marginTop:2 }}>REC: {r.recommendedSpecialty}</div></TD>
          <TD><Badge label={r.riskLevel||'Low'} color={r.riskLevel==='Critical'?'239,68,68':r.riskLevel==='Urgent'?'245,158,11':r.riskLevel==='Moderate'?'234,179,8':'16,185,129'}/></TD>
          <TD sub>{fmtDate(r.createdAt)}</TD>
        </TR>
      ))} empty="No AI diagnostic reports have been generated yet."/>
    </Card>
  );

  // ── Edit Modal ────────────────────────────────────────────────────────────
  const EditModal = () => {
    const isCreate = editModal?.mode==='create';
    const isDoc    = editModal?.type==='doctor';
    const d        = editModal?.data || {};
    const [form, setForm] = useState({ name:d.name||d.fullName||'', email:d.email||'', phone:d.phone||d.phoneNumber||'', specialization:d.specialization||d.specialty||'', password:'' });
    const s = k => v => setForm(f => ({ ...f, [k]:v }));
    return (
      <Overlay onClose={()=>setEditModal(null)}>
        <MHead title={isCreate?`Onboard New ${isDoc?'Provider':'Patient'}`:`Customize ${isDoc?'Provider':'Patient'} Profile`} onClose={()=>setEditModal(null)}/>
        <MField label="Full Legal Name"     value={form.name}           onChange={s('name')}/>
        <MField label="Official Email"         value={form.email}          onChange={s('email')} type="email"/>
        <MField label="Primary Phone"         value={form.phone}          onChange={s('phone')} type="tel"/>
        {isDoc && <MField label="Specialization / Expertise" value={form.specialization} onChange={s('specialization')}/>}
        {isCreate && <MField label="Security Credentials"   value={form.password}       onChange={s('password')} type="password"/>}
        <div style={{ display:'flex', justifyContent:'flex-end', gap:12, marginTop:32 }}>
          <TealBtn outline onClick={()=>setEditModal(null)}>Discard Changes</TealBtn>
          <TealBtn onClick={()=>handleSaveEdit(form)}>{isCreate?'Confirm Onboarding':'Update Database'}</TealBtn>
        </div>
      </Overlay>
    );
  };

  const DeleteModal = () => (
    <Overlay onClose={()=>setDeleteModal(null)}>
      <MHead title="Authorize Deletion" onClose={()=>setDeleteModal(null)}/>
      <p style={{ color:C.muted, fontSize:15, margin:'0 0 32px', lineHeight:1.8, fontWeight:600 }}>
        You are about to permanently remove <strong style={{ color:PRIMARY }}>{deleteModal?.name}</strong> from the official CareBridge registry. This action is definitive and cannot be reversed. 
      </p>
      <div style={{ display:'flex', justifyContent:'flex-end', gap:12 }}>
        <TealBtn outline onClick={()=>setDeleteModal(null)}>Cancel</TealBtn>
        <TealBtn danger onClick={handleDelete}>Confirm Deletion</TealBtn>
      </div>
    </Overlay>
  );

  // ── Layout ────────────────────────────────────────────────────────────────
  return (
    <div style={{ display:'flex', minHeight:'100vh', background:C.bg, color:C.text, fontFamily:'"Inter", sans-serif' }}>
      <Toaster position="top-right" toastOptions={{ style:{ background:'#FFFFFF', color:PRIMARY, border:`2px solid ${C.border2}`, fontSize:14, fontWeight:700, borderRadius:16, boxShadow:'0 10px 40px rgba(0,0,0,0.06)' } }}/>
      {isMobile && sideOpen && <div onClick={()=>setSideOpen(false)} style={{ position:'fixed', inset:0, background:'rgba(0,40,42,0.2)', backdropFilter:'blur(2px)', zIndex:99 }}/>}

      {/* SIDEBAR */}
      <aside style={{ width:280, background:C.sidebar, borderRight:`1.5px solid ${C.border}`, display:'flex', flexDirection:'column', flexShrink:0, position:isMobile?'fixed':'relative', top:0, left:0, height:'100vh', zIndex:100, transform:(isMobile&&!sideOpen)?'translateX(-100%)':'translateX(0)', transition:'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)', boxShadow:isMobile? '20px 0 60px rgba(0,0,0,0.05)' : 'none' }}>

        {/* Logo Section */}
        <div style={{ padding:'32px 24px', textAlign:'center', display:'flex', flexDirection:'column', alignItems:'center' }}>
          <div style={{ width:120, height:84, borderRadius:20, overflow:'hidden', background:NEUTRAL, marginBottom:16, display:'flex', alignItems:'center', justifyContent:'center', border:`2px solid ${C.border}` }}>
            <img src="/logo.png" alt="CareBridge" style={{ width:'85%', height:'85%', objectFit:'contain' }}
              onError={e => { e.target.style.display='none'; }}/>
          </div>
          <div style={{ fontWeight:900, fontSize:22, color:PRIMARY, letterSpacing:'-0.8px', fontFamily:'"Manrope", sans-serif' }}>
            Care<span style={{ color:SECONDARY }}>Bridge</span>
          </div>
          <div style={{ fontSize:9, color:SECONDARY, textTransform:'uppercase', letterSpacing:'2px', marginTop:6, fontWeight:800 }}>
            Bridging Excellence
          </div>
        </div>

        {/* Navigation Section */}
        <nav style={{ flex:1, padding:'10px 16px', overflowY:'auto' }}>
          <div style={{ fontSize:10, color:C.dim, textTransform:'uppercase', letterSpacing:'1.5px', fontWeight:800, padding:'20px 14px 10px' }}>Core Management</div>
          {NAV.map(n => (
            <button key={n.id} onClick={()=>{ goTab(n.id); if(isMobile) setSideOpen(false); }}
              style={{ width:'100%', display:'flex', alignItems:'center', gap:14, padding:'14px 16px', borderRadius:16, border:'none', cursor:'pointer', marginBottom:6,
                background: active===n.id ? TERTIARY : 'transparent',
                color:      active===n.id ? PRIMARY : C.dim,
                fontWeight: active===n.id ? 800 : 600, fontSize:15, textAlign:'left', transition:'all 0.2s' }}>
              <Icon d={n.icon} size={20} color={active===n.id?PRIMARY:C.dim} strokeWidth={active===n.id?2.5:2}/>
              {n.label}
              {n.id==='doctors' && pending.length>0 && (
                <span style={{ marginLeft:'auto', background:PRIMARY, color:'#fff', borderRadius:10, padding:'2px 8px', fontSize:10, fontWeight:900 }}>{pending.length}</span>
              )}
            </button>
          ))}
        </nav>

        {/* User Profile & Exit */}
        <div style={{ padding:'24px', background:NEUTRAL, borderTop:`1.5px solid ${C.border}`, margin:'16px', borderRadius:24 }}>
          <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:16 }}>
            <Avatar name="Admin" size={42} />
            <div>
              <div style={{ fontSize:15, color:C.text, fontWeight:900 }}>Head Admin</div>
              <div style={{ fontSize:10, color:PRIMARY, fontWeight:800, textTransform:'uppercase' }}>System Integrity</div>
            </div>
          </div>
          <button onClick={()=>navigate('/')} style={{ width:'100%', padding:'12px', background:'#fff', border:`1px solid ${C.border}`, borderRadius:14, color:PRIMARY, fontSize:13, fontWeight:800, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8, boxShadow:'0 2px 8px rgba(0,0,0,0.02)' }}>
            <span>←</span> Return to Portal
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', minWidth:0, height:'100vh', overflow:'hidden' }}>
        {/* Superior Header */}
        <header style={{ background:'#FFFFFF', borderBottom:`1.5px solid ${C.border}`, padding:'20px 40px', display:'flex', justifyContent:'space-between', alignItems:'center', zIndex:50, boxShadow:'0 4px 20px rgba(0,96,99,0.02)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:20 }}>
            {isMobile && <button onClick={()=>setSideOpen(o=>!o)} style={{ background:TERTIARY, border:'none', color:PRIMARY, borderRadius:12, width:44, height:44, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, cursor:'pointer' }}>☰</button>}
            <div>
              <h1 style={{ margin:0, fontSize:24, fontWeight:900, color:PRIMARY, letterSpacing:'-0.5px', fontFamily:'"Manrope", sans-serif' }}>{NAV.find(n=>n.id===active)?.label}</h1>
              <div style={{ fontSize:11, color:C.dim, fontWeight:700, textTransform:'uppercase', letterSpacing:'1px', marginTop:2 }}>Central Intelligence Ops</div>
            </div>
          </div>
          <div style={{ display:'flex', gap:24, alignItems:'center' }}>
            {!isMobile && <Search value={search} onChange={setSearch} />}
            <div style={{ width:1.5, height:32, background:C.border }} />
            <button onClick={fetchAll} style={{ width:44, height:44, background:NEUTRAL, border:`1.5px solid ${C.border}`, borderRadius:14, color:PRIMARY, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', fontSize:20, transition:'all 0.2s' }} title="Synchronize Data">↻</button>
          </div>
        </header>

        {/* Dynamic Canvas */}
        <main style={{ flex:1, padding:'40px', overflowY:'auto', background:NEUTRAL }}>
          {loading
            ? <div style={{ height:'100%', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', color:PRIMARY }}>
                <div style={{ fontSize:48, animation:'spin 2s linear infinite' }}>⟳</div>
                <p style={{ margin:'20px 0 0', fontWeight:800, fontSize:16, letterSpacing:'1px', textTransform:'uppercase' }}>Synchronizing Hospital Matrix…</p>
                <style>{`@keyframes spin { 100% { transform:rotate(360deg); } }`}</style>
              </div>
            : (
              <div style={{ maxWidth:1200, margin:'0 auto', width:'100%' }}>
                {active==='overview'     && renderDashboard()}
                {active==='doctors'      && renderDoctors()}
                {active==='users'        && renderUsers()}
                {active==='appointments' && renderAppointments()}
                {active==='reports'      && renderReports()}
                {active==='aiDiagnostics'&& renderAiDiagnostics()}
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