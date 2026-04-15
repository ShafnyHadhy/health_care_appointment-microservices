import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const COMMON_SYMPTOMS = [
    'Headache', 'Fever', 'Cough', 'Nausea', 'Dizziness', 'Fatigue', 
    'Chest Pain', 'Shortness of Breath', 'Stomach Ache', 'Gastric',
    'Joint Pain', 'Anxiety', 'Rash', 'Wheezing', 'Thirst', 'Urination',
    'Weight Gain', 'Heartburn', 'Acid Reflux', 'Blurry Vision'
];

export default function SymptomChecker() {
    const navigate = useNavigate();

    // Step Tracking
    const [step, setStep] = useState(1);
    
    // PRINT STYLES INJECTION
    useEffect(() => {
        const style = document.createElement('style');
        style.innerHTML = `
            @media print {
                @page { margin: 0; size: auto; }
                body { background-color: white !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                .no-print { display: none !important; }
                .print-full { position: absolute !important; top: 0 !important; left: 0 !important; width: 100% !important; height: auto !important; margin: 0 !important; padding: 0 !important; border: none !important; overflow: visible !important; }
                .print-bg { background-color: white !important; }
            }
        `;
        document.head.appendChild(style);
        return () => document.head.removeChild(style);
    }, []);

    // Step 1: Input State
    const [selectedSymptoms, setSelectedSymptoms] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [suggestions, setSuggestions] = useState([]);

    // Step 2 & 3: AI & Doctor Results
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [aiResult, setAiResult] = useState(null);
    const [showReport, setShowReport] = useState(false);
    const [showEmergency, setShowEmergency] = useState(false);
    const [showEmergencyProtocol, setShowEmergencyProtocol] = useState(false);
    const [clickedQuestionIdx, setClickedQuestionIdx] = useState(null);
    const [doctors, setDoctors] = useState([]);
    const [selectedDoctor, setSelectedDoctor] = useState(null);

    // Step 4: Booking
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedTime, setSelectedTime] = useState('');
    const [isBooking, setIsBooking] = useState(false);

    // Patient Profile
    const [patientName, setPatientName] = useState('');
    const [patientEmail, setPatientEmail] = useState('');
    const [patientPhone, setPatientPhone] = useState('');

    // Risk Level config
    const riskConfig = {
        Critical: { color: 'text-red-400',    bg: 'bg-red-500/15',    border: 'border-red-500/30',    icon: '🚨', label: 'Critical Risk' },
        Urgent:   { color: 'text-orange-400', bg: 'bg-orange-500/15', border: 'border-orange-500/30', icon: '⚠️', label: 'Urgent' },
        Moderate: { color: 'text-amber-400',  bg: 'bg-amber-500/15',  border: 'border-amber-500/30',  icon: '🔶', label: 'Moderate' },
        Low:      { color: 'text-emerald-400',bg: 'bg-emerald-500/15',border: 'border-emerald-500/30',icon: '✅', label: 'Low Risk' },
    };

    // Filter suggestions locally
    useEffect(() => {
        if (!searchTerm) {
            setSuggestions([]);
            return;
        }
        const filtered = COMMON_SYMPTOMS.filter(s => 
            s.toLowerCase().includes(searchTerm.toLowerCase()) && 
            !selectedSymptoms.includes(s)
        );
        setSuggestions(filtered);
    }, [searchTerm, selectedSymptoms]);

    const handleAddSymptom = (smp) => {
        if (!selectedSymptoms.includes(smp)) {
            setSelectedSymptoms([...selectedSymptoms, smp]);
        }
        setSearchTerm('');
    };

    const handleRemoveSymptom = (smp) => {
        setSelectedSymptoms(selectedSymptoms.filter(s => s !== smp));
    };

    const runAnalysis = async (specificSymptoms = null) => {
        let finalSymptoms = specificSymptoms || [...selectedSymptoms];
        const isReAnalysis = !!specificSymptoms;
        
        // Auto-add the current search term if something is typed but not 'added'
        if (!specificSymptoms && searchTerm.trim()) {
            const splitSymptoms = searchTerm.split(',').map(s => s.trim()).filter(s => s);
            finalSymptoms = [...new Set([...finalSymptoms, ...splitSymptoms])];
        }

        if (finalSymptoms.length === 0) {
            toast.error('Please enter at least one symptom.');
            return;
        }

        // Only show full-screen analyzer for the first run; re-analysis is 'silent'
        if (!isReAnalysis) setStep(2); 
        setIsAnalyzing(true);
        
        try {
            // Using 127.0.0.1 instead of localhost for faster resolution on Mac
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
            const response = await axios.post(`${apiUrl}/api/symptoms/analyze`, {
                symptoms: finalSymptoms
            }, { timeout: 15000 }); 
            
            if (response.data.success) {
                const result = response.data.data;
                setAiResult(result);
                if (!isReAnalysis) {
                    setStep(3);
                    // Trigger emergency modal after a short delay so UI settles
                    if (result.isEmergency) {
                        setTimeout(() => setShowEmergency(true), 400);
                    }
                }
                fetchDoctors(result.recommendedSpecialty);
            } else {
                toast.error(response.data.message || 'Analysis failed.');
                setStep(1);
            }
        } catch (error) {
            console.error('Error:', error);
            if (error.code === 'ECONNABORTED') {
                toast.error('Analysis timed out. Try checking your internet or restarting servers.');
            } else {
                toast.error('Could not connect to AI Service. Please check the backend.');
            }
            if (!isReAnalysis) setStep(1);
        } finally {
            setIsAnalyzing(false);
            setClickedQuestionIdx(null);
        }
    };

    const fetchDoctors = async (targetSpecialty) => {
        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
            const { data } = await axios.get(`${apiUrl}/api/doctors`);
            if (data?.data) {
                // simple frontend filtering based on AI's recommended specialty
                const filtered = data.data.filter(d => 
                    d.specialization && d.specialization.toLowerCase().includes(targetSpecialty.toLowerCase())
                );
                // Fallback to all if none matching
                setDoctors(filtered.length > 0 ? filtered : data.data);
            }
        } catch (err) {
            console.error("Failed to fetch doctors:", err);
            // Ignore error gracefully so user can still see AI results
        }
    };

    const handleDoctorSelect = (doc) => {
        setSelectedDoctor(doc);
        setStep(4);
    };

    const confirmBooking = async () => {
        if (!selectedDate || !selectedTime) {
            toast.error('Please select both date and time.');
            return;
        }
        
        setIsBooking(true);
        // Simulate booking network call
        setTimeout(() => {
            setIsBooking(false);
            toast.success('Appointment Booked Successfully!');
            navigate('/patient-dashboard');
        }, 1500);
    };

    // UI RENDERERS
    const renderProgressBar = (current) => {
        return (
            <div className="w-full bg-white/5 h-1.5 mb-10 overflow-hidden rounded-full border border-white/5">
                <div 
                    className="bg-gradient-to-r from-blue-600 to-emerald-500 h-full transition-all duration-700 ease-out shadow-[0_0_15px_rgba(59,130,246,0.5)]"
                    style={{ width: `${(current / 4) * 100}%` }}
                ></div>
            </div>
        );
    };

    const downloadDossier = () => {
        if (!aiResult) { alert('No report data. Please run analysis first.'); return; }
        const printWindow = window.open('', '_blank', 'width=860,height=1000');
        if (!printWindow) { alert('Pop-up blocked. Please allow pop-ups for this site.'); return; }

        const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        const riskLevel = aiResult.riskLevel || 'Low';
        const riskColor = { Critical: '#ef4444', Urgent: '#f97316', Moderate: '#f59e0b', Low: '#10b981' }[riskLevel] || '#10b981';
        const topCondition = aiResult.possibleConditions?.[0]?.name || 'Unspecified';

        const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>AI Health Assessment - CareBridge</title>
<style>
  @page { margin: 0.6in; size: A4 portrait; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; background: #fff; color: #1e293b; font-size: 12px; line-height: 1.5; -webkit-print-color-adjust: exact; print-color-adjust: exact; }

  /* HEADER */
  .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #2563eb; padding-bottom: 14px; margin-bottom: 20px; }
  .header-left { display: flex; align-items: center; gap: 12px; }
  .header-icon { width: 40px; height: 40px; background: #2563eb; border-radius: 6px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .header-icon svg { width: 22px; height: 22px; stroke: #fff; fill: none; }
  .header-title { font-size: 20px; font-weight: 800; color: #000; text-transform: uppercase; letter-spacing: -0.5px; }
  .header-sub { font-size: 9px; color: #94a3b8; text-transform: uppercase; letter-spacing: 1.5px; margin-top: 2px; }
  .header-right { text-align: right; }
  .header-right .label { font-size: 8px; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; }
  .header-right .value { font-size: 12px; font-weight: 700; color: #000; }

  /* SUMMARY */
  .summary { background: #eff6ff; border-left: 4px solid #2563eb; padding: 14px 16px; margin-bottom: 20px; border-radius: 0 6px 6px 0; }
  .summary .label { font-size: 8px; font-weight: 700; color: #2563eb; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 6px; }
  .summary p { font-size: 12px; color: #1e293b; line-height: 1.7; }
  .summary strong { color: #000; font-weight: 700; }

  /* TWO COL GRID */
  .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px; }

  /* ACTIONS BOX */
  .actions-box { border: 1px solid #e2e8f0; padding: 18px; border-radius: 6px; }
  .section-title { font-size: 8px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 1.5px; border-bottom: 1px solid #f1f5f9; padding-bottom: 8px; margin-bottom: 14px; }
  .action-item { display: flex; gap: 12px; align-items: flex-start; margin-bottom: 14px; }
  .action-number { font-size: 22px; font-weight: 800; color: #dbeafe; line-height: 1; flex-shrink: 0; }
  .action-label { font-size: 8px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 3px; }
  .action-text { font-size: 12px; font-weight: 600; color: #1e293b; line-height: 1.5; }
  .action-divider { border-top: 1px solid #f1f5f9; padding-top: 12px; margin-top: 2px; }
  .action-text.recovery { font-weight: 400; color: #475569; }

  /* TABLE */
  .table-box { border: 1px solid #e2e8f0; border-radius: 6px; overflow: hidden; }
  table { width: 100%; border-collapse: collapse; }
  thead tr { background: #1e293b; }
  thead th { padding: 10px 14px; font-size: 9px; font-weight: 700; color: #fff; text-transform: uppercase; letter-spacing: 1px; text-align: left; }
  thead th:last-child { text-align: right; }
  tbody tr { border-bottom: 1px solid #f1f5f9; }
  tbody tr:last-child { border-bottom: none; }
  tbody td { padding: 10px 14px; font-size: 11px; color: #64748b; }
  tbody td:last-child { text-align: right; font-weight: 700; }
  .val-blue { color: #2563eb; }
  .val-amber { color: #d97706; }
  .val-black { color: #000; }

  /* BOTTOM ROW */
  .bottom-row { display: grid; grid-template-columns: 1fr 3fr; gap: 16px; margin-bottom: 20px; }

  /* CHART */
  .chart-box { border: 1px solid #e2e8f0; border-radius: 6px; padding: 16px; display: flex; flex-direction: column; align-items: center; justify-content: center; background: #f8fafc; }
  .chart-label { font-size: 7px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px; text-align: center; }
  .chart-container { position: relative; width: 70px; height: 70px; }
  .chart-container svg { width: 70px; height: 70px; transform: rotate(-90deg); }
  .chart-text { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 800; color: #000; }

  /* SPECIALIST */
  .specialist-box { border: 1px solid #e2e8f0; border-radius: 6px; padding: 16px; display: flex; align-items: center; gap: 16px; }
  .specialist-icon { width: 48px; height: 48px; background: #2563eb; border-radius: 6px; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 20px; font-weight: 800; flex-shrink: 0; }
  .specialist-label { font-size: 8px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px; }
  .specialist-name { font-size: 15px; font-weight: 800; color: #000; }
  .specialist-note { font-size: 9px; color: #94a3b8; margin-top: 3px; }

  /* FOOTER */
  .footer { display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #e2e8f0; padding-top: 12px; }
  .footer p { font-size: 7px; color: #cbd5e1; text-transform: uppercase; letter-spacing: 0.5px; }
</style>
</head>
<body>

  <!-- HEADER -->
  <div class="header">
    <div class="header-left">
      <div class="header-icon">
        <svg viewBox="0 0 24 24" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
        </svg>
      </div>
      <div>
        <div class="header-title">Patient Diagnostic Report</div>
        <div class="header-sub">CareBridge AI Clinical Systems</div>
      </div>
    </div>
    <div class="header-right">
      <div class="label">Patient Information</div>
      <div class="value" style="color:#000;">${patientName || 'ANONYMOUS'}</div>
      <div style="font-size:9px;color:#64748b;">${patientEmail || 'No Email'} &bull; ${patientPhone || 'No Phone'}</div>
      <div class="label" style="margin-top:10px;">Generated On</div>
      <div class="value">${date}</div>
    </div>
  </div>

  <!-- DISCLAIMER BANNER -->
  <div style="background:#fffbeb;border:1px solid #f59e0b;border-radius:6px;padding:10px 14px;margin-bottom:18px;display:flex;gap:10px;align-items:flex-start;">
    <span style="font-size:16px;flex-shrink:0;">⚠️</span>
    <p style="font-size:10px;color:#92400e;font-weight:700;line-height:1.6;"><strong>IMPORTANT:</strong> This is an AI-generated health assessment — NOT a medical diagnosis. This document is for informational purposes only. Always consult a licensed physician before making any health decisions.</p>
  </div>

  <!-- SUMMARY -->
  <div class="summary">
    <div class="label">AI Assessment Summary</div>
    <p>Based on <strong>${selectedSymptoms.length}</strong> reported symptom${selectedSymptoms.length !== 1 ? 's' : ''}, the AI identified <strong>${(aiResult.possibleConditions || []).length}</strong> possible condition(s). Risk level is assessed as <strong>${riskLevel}</strong>. ${aiResult.recommendedAction}</p>
  </div>

    <!-- WHAT TO DO -->
    <div class="actions-box">
      <div class="section-title">Recommended Action</div>
      <div class="action-item">
        <div class="action-number">01</div>
        <div>
          <div class="action-label">Immediate Action</div>
          <div class="action-text">${aiResult.recommendedAction}</div>
        </div>
      </div>
      <div class="action-item action-divider">
        <div class="action-number" style="color:#f1f5f9;">02</div>
        <div>
          <div class="action-label">Clinical Guidance</div>
          <div class="action-text recovery">${aiResult.clinicalAdvice || aiResult.advice || 'Consult a licensed physician for a full evaluation.'}</div>
        </div>
      </div>
      <div class="action-item action-divider">
        <div class="action-number" style="color:#f1f5f9;">03</div>
        <div>
          <div class="action-label">Lifestyle &amp; Recovery</div>
          <div class="action-text recovery">${aiResult.lifestyleAdvice || 'Rest and maintain adequate fluid intake for 48 hours.'}</div>
        </div>
      </div>
    </div>

    <!-- METRIC TABLE -->
    <div class="table-box">
      <table>
        <thead>
          <tr>
            <th>Clinical Parameter</th>
            <th>Reading</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>Risk Level</td><td style="color:${riskColor};font-weight:800;">${riskLevel}</td></tr>
          <tr><td>Most Likely Condition</td><td class="val-black">${topCondition}</td></tr>
          <tr><td>Symptoms Reported</td><td class="val-black">${selectedSymptoms.length}</td></tr>
          <tr><td>Recommended Specialist</td><td class="val-blue">${aiResult.recommendedSpecialty}</td></tr>
        </tbody>
      </table>
    </div>
  </div>

  <!-- RISK + SPECIALIST -->
  <div class="bottom-row">
    <!-- RISK INDICATOR -->
    <div class="chart-box">
      <div class="chart-label">Risk Level</div>
      <div style="font-size:28px;margin:6px 0;">${riskLevel === 'Critical' ? '🚨' : riskLevel === 'Urgent' ? '⚠️' : riskLevel === 'Moderate' ? '🔶' : '✅'}</div>
      <div style="font-size:10px;font-weight:800;color:${riskColor};text-transform:uppercase;text-align:center;">${riskLevel}</div>
    </div>

    <!-- SPECIALIST -->
    <div class="specialist-box">
      <div class="specialist-icon">${(aiResult.recommendedSpecialty || 'D')[0]}</div>
      <div>
        <div class="specialist-label">Recommended Specialist</div>
        <div class="specialist-name">${aiResult.recommendedSpecialty}</div>
        <div class="specialist-note">Please book an appointment at the earliest convenience.</div>
      </div>
    </div>
  </div>

  <!-- FOOTER -->
  <div class="footer">
    <p>Disclaimer: This is an AI-generated report. Always consult a licensed physician before making medical decisions.</p>
    <p>CareBridge AI &bull; ${new Date().getFullYear()}</p>
  </div>

</body>
</html>`;

        const doc = printWindow.document;
        doc.open();
        doc.write(html);
        doc.close();
        printWindow.focus();
        setTimeout(() => { printWindow.print(); }, 600);
    };

    return (
        <div className="min-h-screen bg-[#05080d] text-slate-200 font-sans selection:bg-blue-500/30">
            {/* FUTURISTIC MESH BACKGROUND */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px] animate-pulse-slow"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-600/10 rounded-full blur-[120px] animate-pulse-slow deleay-1000"></div>
                <div className="absolute top-[20%] right-[10%] w-[20%] h-[20%] bg-indigo-600/15 rounded-full blur-[100px]"></div>
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03]"></div>
            </div>

            {/* HEADER / BRANDING */}
            <nav className="relative z-20 border-b border-white/5 bg-black/20 backdrop-blur-md px-6 py-4">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-4 group cursor-pointer" onClick={() => navigate('/')}>
                        <div className="w-21 h-14 rounded-xl overflow-hidden shadow-xl group-hover:scale-105 transition-transform flex-shrink-0 border border-white/5">
                            <img src="/logo.png" alt="CareBridge" className="w-full h-full object-contain" onError={(e)=>{e.target.style.display='none';}}/>
                        </div>
                        <div className="hidden sm:block">
                            <span className="text-xl font-black tracking-tighter text-white">Care<span className="text-emerald-400">Bridge</span></span>
                            <div className="flex items-center gap-1 mt-1">
                                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Neural Diagnostic Active</span>
                            </div>
                        </div>
                    </div>
                    <div className="hidden md:flex items-center gap-6">
                        <button onClick={() => setShowEmergencyProtocol(true)} className="text-sm font-bold text-red-400 hover:text-red-300 transition-colors flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>Emergency Protocol</button>
                        <button className="text-sm font-bold text-slate-400 hover:text-white transition-colors underline decoration-blue-500 underline-offset-8">Symptom Engine</button>
                        <div className="h-4 w-px bg-white/10"></div>
                        <div className="flex items-center gap-2">
                             <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-bold">PT</div>
                             <span className="text-xs font-bold">Guest Patient</span>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="relative z-10 max-w-3xl mx-auto px-6 py-8 md:py-12">
                
                {/* HERO TEXT */}
                <div className="text-center mb-10">
                    <h1 className="text-3xl md:text-4xl font-black text-white mb-3 tracking-tight leading-tight">
                        AI Symptom <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-emerald-400">Analysis Engine</span>
                    </h1>
                    <p className="text-slate-400 font-medium max-w-lg mx-auto text-base leading-relaxed">
                        Fast, secure, and clinical-grade health matching powered by deep neural networks.
                    </p>
                </div>

                {/* MAIN GLASS CONTAINER */}
                <div className="bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-[2rem] shadow-2xl p-6 md:p-10 relative overflow-hidden">
                    {/* Decorative element */}
                    <div className="absolute -top-24 -left-24 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl"></div>
                    
                    {renderProgressBar(step)}

                    {/* STEP 1: INPUT */}
                    {step === 1 && (
                        <div className="animate-fade-in relative z-10">
                            {/* PATIENT PROFILE CARD */}
                            <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 mb-8 backdrop-blur-xl relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                                    <svg className="w-20 h-20 text-blue-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                                </div>
                                <h3 className="text-xs font-black text-blue-400 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                                    <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                                    Patient Clinical Profile
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Full Identity</label>
                                        <input 
                                            type="text"
                                            placeholder="e.g. Naji Ahmad"
                                            value={patientName}
                                            onChange={(e) => setPatientName(e.target.value)}
                                            className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-3.5 focus:outline-none focus:border-blue-500/50 transition-all text-sm font-bold text-white placeholder:text-slate-700"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Digital Mail</label>
                                        <input 
                                            type="email"
                                            placeholder="naji@example.com"
                                            value={patientEmail}
                                            onChange={(e) => setPatientEmail(e.target.value)}
                                            className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-3.5 focus:outline-none focus:border-blue-500/50 transition-all text-sm font-bold text-white placeholder:text-slate-700"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Contact Nexus</label>
                                        <input 
                                            type="tel"
                                            placeholder="+94 7X XXX XXXX"
                                            value={patientPhone}
                                            onChange={(e) => setPatientPhone(e.target.value)}
                                            className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-3.5 focus:outline-none focus:border-blue-500/50 transition-all text-sm font-bold text-white placeholder:text-slate-700"
                                        />
                                    </div>
                                </div>
                            </div>

                            <h2 className="text-xl font-black text-white mb-8 flex items-center gap-2">
                                <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-blue-600/20 text-blue-400 text-xs border border-blue-500/30">01</span>
                                Clinical Observations
                            </h2>

                            <div className="space-y-10">
                                {/* Autocomplete Input */}
                                <div className="relative">
                                    <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-3">Begin typing symptoms</label>
                                    <div className="relative group">
                                        <input 
                                            type="text" 
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' && searchTerm.trim()) {
                                                    handleAddSymptom(searchTerm.trim());
                                                }
                                            }}
                                            placeholder="Headache, Chest pain, etc..."
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all text-white text-base placeholder:text-slate-600"
                                        />
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 bg-white/5 px-2 py-1 rounded text-[10px] font-bold border border-white/10">ESC</div>
                                    </div>
                                    
                                    {suggestions.length > 0 && (
                                        <div className="absolute z-30 w-full mt-2 bg-[#0e1421] border border-white/10 rounded-2xl shadow-2xl max-h-60 overflow-y-auto backdrop-blur-xl">
                                            {suggestions.map(s => (
                                                <button 
                                                    key={s}
                                                    onClick={() => handleAddSymptom(s)}
                                                    className="w-full text-left px-6 py-4 hover:bg-blue-600/20 text-slate-300 hover:text-white border-b border-white/5 last:border-0 transition-all flex justify-between items-center group/item"
                                                >
                                                    <span className="font-bold">{s}</span>
                                                    <span className="text-[10px] font-bold opacity-0 group-hover/item:opacity-100 bg-blue-500 text-white px-2 py-1 rounded transition-all">ADD</span>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Quick Chips */}
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4 px-1">Common Patterns:</label>
                                    <div className="flex flex-wrap gap-2.5">
                                        {COMMON_SYMPTOMS.filter(s => !selectedSymptoms.includes(s)).slice(0, 8).map(s => (
                                            <button 
                                                key={s}
                                                onClick={() => handleAddSymptom(s)}
                                                className="px-5 py-2.5 bg-white/5 border border-white/5 rounded-xl text-xs font-bold text-slate-400 hover:bg-blue-600 hover:text-white hover:border-blue-500 transition-all active:scale-95"
                                            >
                                                + {s}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Selected Chips */}
                                {selectedSymptoms.length > 0 && (
                                    <div className="p-6 bg-blue-600/5 rounded-3xl border border-blue-500/10 animate-scale-in">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-blue-400 mb-4">Current Symptom Profile:</p>
                                        <div className="flex flex-wrap gap-2.5">
                                            {selectedSymptoms.map(s => (
                                                <div key={s} className="flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl text-xs font-black shadow-[0_4px_15px_rgba(37,99,235,0.3)] animate-scale-in">
                                                    <span>{s}</span>
                                                    <button onClick={() => handleRemoveSymptom(s)} className="hover:text-blue-100 bg-white/10 rounded-full p-0.5" aria-label={`Remove ${s}`}>
                                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path></svg>
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="pt-10 flex justify-end">
                                    <button 
                                        onClick={() => runAnalysis()}
                                        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black py-3.5 px-10 rounded-xl transition-all shadow-xl shadow-blue-600/20 active:scale-95 flex items-center gap-3 text-xs uppercase tracking-widest group"
                                    >
                                        Initiate Analysis
                                        <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 2: ANALYZING STATE */}
                    {step === 2 && (
                        <div className="py-16 flex flex-col items-center justify-center text-center animate-fade-in relative">
                            <div className="relative w-20 h-20 mb-8">
                                <div className="absolute inset-0 bg-blue-500/20 rounded-full animate-ping opacity-75"></div>
                                <div className="absolute inset-2 bg-emerald-500/10 rounded-full animate-ping delay-150"></div>
                                <div className="relative w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-[0_10px_40px_rgba(37,99,235,0.4)] rotate-12 animate-float">
                                    <svg className="w-10 h-10 animate-spin-slow" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>
                                </div>
                            </div>
                            <h3 className="text-2xl font-black text-white mb-3 uppercase tracking-tighter italic">Processing <span className="text-blue-500">Clinical Data</span>...</h3>
                            <p className="text-slate-500 max-w-sm font-medium text-sm">Cross-referencing symptom clusters against 140,000+ medical pathways and proprietary neural datasets.</p>
                        </div>
                    )}

                    {/* STEP 3: RESULTS & DOCTORS */}
                    {step === 3 && aiResult && (
                        <div className="animate-fade-in relative z-10">

                            {/* EMERGENCY MODAL */}
                            {showEmergency && (
                                <div className="fixed inset-0 z-[200] bg-red-950/95 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center">
                                    <div className="text-7xl mb-6 animate-bounce">🚨</div>
                                    <h2 className="text-3xl font-black text-red-400 mb-3 uppercase tracking-tight">Emergency Symptoms Detected</h2>
                                    <p className="text-slate-200 max-w-md mb-2 leading-relaxed">Your reported symptoms may indicate a <strong>serious medical emergency</strong>. Do not wait — time is critical.</p>
                                    <p className="text-red-300 text-sm font-bold mb-8 uppercase tracking-widest">Do NOT drive yourself. Call now.</p>
                                    <div className="flex flex-col sm:flex-row gap-4 mb-8">
                                        <a href="tel:999" className="bg-red-600 hover:bg-red-500 text-white font-black py-4 px-10 rounded-2xl text-lg transition-all shadow-2xl shadow-red-900/50 flex items-center gap-3">
                                            📞 Call Emergency (999)
                                        </a>
                                        <a href="tel:911" className="bg-red-900/60 hover:bg-red-900 border border-red-500/50 text-white font-black py-4 px-10 rounded-2xl text-lg transition-all flex items-center gap-3">
                                            📞 Call 911
                                        </a>
                                    </div>
                                    <button onClick={() => setShowEmergency(false)} className="text-slate-400 hover:text-white text-sm font-bold uppercase tracking-widest transition-colors border-b border-slate-600 pb-0.5">
                                        I understand the risk — view AI assessment →
                                    </button>
                                </div>
                            )}

                            <h2 className="text-xl font-black text-white mb-6 flex items-center gap-2">
                                <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-600/20 text-emerald-400 text-xs border border-emerald-500/30">02</span>
                                AI Health Assessment
                            </h2>

                            {/* RISK LEVEL BANNER */}
                            {(() => {
                                const risk = riskConfig[aiResult.riskLevel] || riskConfig.Low;
                                return (
                                    <div className={`mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl border ${risk.bg} ${risk.border}`}>
                                        <div className="flex items-center gap-4">
                                            <span className="text-3xl">{risk.icon}</span>
                                            <div>
                                                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Risk Assessment</p>
                                                <p className={`text-xl font-black ${risk.color} uppercase tracking-tighter`}>{risk.label}</p>
                                            </div>
                                        </div>
                                        <div className={`text-sm font-bold ${risk.color} max-w-sm leading-snug`}>
                                            {aiResult.recommendedAction}
                                        </div>
                                    </div>
                                );
                            })()}

                            <div className="bg-white/5 border border-white/10 rounded-[2rem] p-8 mb-10 overflow-hidden relative group">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-bl-full translate-x-12 -translate-y-12"></div>

                                <div className="flex flex-col md:flex-row md:items-start justify-between gap-10">
                                    <div className="flex-1 space-y-8">

                                        {/* PRIMARY CONDITION — Prominent Display */}
                                        {aiResult.possibleConditions?.length > 0 && (
                                            <div>
                                                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-500 mb-1 px-1">Most Likely Condition</p>
                                                <p className="text-2xl font-black text-white tracking-tighter leading-tight italic">{aiResult.possibleConditions[0].name}</p>
                                                <p className="text-[9px] text-slate-500 font-bold mt-1 px-0.5">⚠ AI assessment only — not a confirmed diagnosis</p>
                                            </div>
                                        )}

                                        {/* RANKED CONDITIONS LIST */}
                                        {aiResult.possibleConditions?.length > 1 && (
                                            <div>
                                                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2 px-1">Other Possibilities</p>
                                                <div className="space-y-1.5">
                                                    {aiResult.possibleConditions.slice(1).map((c, i) => (
                                                        <div key={i} className="flex items-center justify-between py-2 px-3 rounded-xl bg-white/5 border border-white/5">
                                                            <span className="font-bold text-sm text-slate-400">{c.name}</span>
                                                            <span className={`text-[9px] font-black uppercase px-3 py-1 rounded-full ${
                                                                c.likelihood === 'Possible'
                                                                    ? 'bg-amber-500/15 text-amber-400 border border-amber-500/20'
                                                                    : 'bg-white/5 text-slate-500 border border-white/5'
                                                            }`}>{c.likelihood}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {(!aiResult.possibleConditions || aiResult.possibleConditions.length === 0) && (
                                            <p className="text-slate-500 text-sm font-medium px-1">Could not identify a specific condition — please see a GP.</p>
                                        )}

                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500 mb-2 px-1">Clinical Guidance</p>
                                            <p className="text-slate-300 font-medium leading-relaxed">{aiResult.clinicalAdvice}</p>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-4">
                                            <button
                                                onClick={() => setShowReport(true)}
                                                className="inline-flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 px-6 py-3 rounded-xl border border-emerald-500/20 transition-all active:scale-95"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                                                View Health Report
                                            </button>
                                            {aiResult.possibleConditions?.length > 0 && (
                                                <div className="flex items-center gap-2 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl">
                                                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Identified:</span>
                                                    <span className="text-sm font-black text-white italic">{aiResult.possibleConditions[0].name}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Disease Name + Match Score Panel */}
                                    <div className="w-full md:w-52 bg-white/5 p-5 rounded-2xl border border-white/10 text-center relative overflow-hidden backdrop-blur-md flex-shrink-0">
                                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-3">AI Diagnosis</p>

                                        {/* Disease Name — large & prominent */}
                                        <p className="text-lg font-black text-white tracking-tighter italic leading-tight mb-4">
                                            {aiResult.possibleConditions?.[0]?.name || '—'}
                                        </p>

                                        {/* Match % */}
                                        <div className="text-3xl font-black text-white mb-3 tracking-tighter italic">
                                            {aiResult.matchScore || '—'}
                                        </div>

                                        {/* Progress bar */}
                                        <div className="w-full bg-white/5 rounded-full h-2 shadow-inner">
                                            <div
                                                className="bg-gradient-to-r from-emerald-600 to-emerald-400 h-full rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)] transition-all duration-1000"
                                                style={{ width: aiResult.matchScore || '0%' }}
                                            ></div>
                                        </div>
                                        <div className="mt-3 flex justify-between text-[10px] font-bold text-slate-500 px-1 uppercase tracking-tighter">
                                            <span>Baseline</span>
                                            <span>Match</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* FOLLOW-UP QUESTIONS (Feedback Loop) */}
                            {aiResult.isAmbiguous && aiResult.followUpQuestions?.length > 0 && (
                                <div className="mb-12 p-8 bg-blue-600/[0.03] border border-blue-500/20 rounded-[2rem] relative">
                                    <div className="flex items-center gap-4 mb-8">
                                        <div className="w-12 h-12 bg-blue-600/20 rounded-2xl flex items-center justify-center text-blue-400 border border-blue-500/30">
                                            <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"></path></svg>
                                        </div>
                                        <div>
                                            <h3 className="text-xs font-black text-blue-400 uppercase tracking-[0.2em]">Clarification Engine</h3>
                                            <p className="text-sm text-slate-400 font-bold">Additional clinical markers identified</p>
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-4 relative">
                                        {/* Updating Overlay */}
                                        {isAnalyzing && (
                                            <div className="absolute inset-0 z-20 bg-slate-950/60 backdrop-blur-[2px] rounded-3xl flex items-center justify-center animate-fade-in">
                                                <div className="flex flex-col items-center gap-4">
                                                    <div className="w-10 h-10 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
                                                    <p className="text-white font-black text-sm uppercase tracking-widest italic">Updating Assessment...</p>
                                                </div>
                                            </div>
                                        )}
                                        {aiResult.followUpQuestions.map((q, idx) => (
                                            <div key={q} className={`bg-white/5 p-5 rounded-2xl border transition-all group ${clickedQuestionIdx === idx ? 'border-blue-500/50 bg-blue-500/5' : 'border-white/5 hover:bg-white/10'} flex flex-col sm:flex-row sm:items-center justify-between gap-6`}>
                                                <p className={`font-bold text-base transition-colors ${clickedQuestionIdx === idx ? 'text-blue-400' : 'text-white'}`}>{q}</p>
                                                <div className="flex gap-3">
                                                    <button 
                                                        disabled={isAnalyzing}
                                                        onClick={() => {
                                                            setClickedQuestionIdx(idx);
                                                            
                                                            // 1. Clean the symptom from the question
                                                            const cleanSymptom = q
                                                                .replace(/^(Is the|Does the|Do you|Has the|Have you|Is there|When did|Are you experiencing|Are you also experiencing|Are you feeling|Do you notice|Is your|Have you felt|Any)\s+/i, '')
                                                                .replace(/\?$/, '')
                                                                .trim();
                                                            
                                                            // 2. Clear this question immediately for UI responsiveness
                                                            setAiResult(prev => ({
                                                                ...prev,
                                                                followUpQuestions: prev.followUpQuestions.filter((_, i) => i !== idx)
                                                            }));

                                                            // 3. Update symptoms and trigger analysis
                                                            const newList = [...new Set([...selectedSymptoms, cleanSymptom])];
                                                            setSelectedSymptoms(newList);
                                                            runAnalysis(newList);
                                                        }}
                                                        className={`px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all active:scale-95 shadow-xl flex items-center gap-2 ${
                                                            isAnalyzing && clickedQuestionIdx === idx
                                                                ? 'bg-blue-600/50 text-white/50 cursor-wait'
                                                                : isAnalyzing
                                                                ? 'bg-blue-600/20 text-white/30 cursor-not-allowed'
                                                                : 'bg-blue-600 text-white hover:bg-blue-500 shadow-blue-600/20'
                                                        }`}
                                                    >
                                                        {isAnalyzing && clickedQuestionIdx === idx ? (
                                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                                        ) : (
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                                                        )}
                                                        {isAnalyzing && clickedQuestionIdx === idx ? 'Analysing...' : 'Yes'}
                                                    </button>
                                                    <button 
                                                        disabled={isAnalyzing}
                                                        onClick={() => {
                                                            setAiResult(prev => ({
                                                                ...prev,
                                                                followUpQuestions: prev.followUpQuestions.filter((_, i) => i !== idx)
                                                            }));
                                                        }}
                                                        className={`px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all border ${
                                                            isAnalyzing 
                                                                ? 'bg-white/5 text-slate-500 border-white/5 cursor-not-allowed'
                                                                : 'bg-white/5 text-slate-400 hover:bg-white/10 border-white/5'
                                                        }`}
                                                    >
                                                        No
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="mt-12">
                                <h3 className="text-xl font-black text-white mb-6 uppercase tracking-tight flex justify-between items-end">
                                    Strategic Consultations
                                    <span className="text-[10px] font-black text-blue-400 bg-blue-500/10 border border-blue-500/20 px-4 py-1.5 rounded-full uppercase tracking-widest">{aiResult.recommendedSpecialty}</span>
                                </h3>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    {doctors.length > 0 ? doctors.slice(0, 4).map(doc => (
                                        <div key={doc._id} className="bg-white/5 border border-white/5 rounded-2xl p-5 hover:border-blue-500/50 hover:bg-white/[0.08] transition-all group cursor-pointer" onClick={() => handleDoctorSelect(doc)}>
                                            <div className="flex items-center gap-4 mb-4">
                                                <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-blue-700 text-white rounded-xl flex justify-center items-center font-black text-xl shadow-xl shadow-blue-900/40">
                                                    {(doc.name || doc.firstName || 'D')[0]}
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-white text-base tracking-tight group-hover:text-blue-400 transition-colors">{doc.name || `${doc.firstName} ${doc.lastName}`}</h4>
                                                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">{doc.specialization || 'Clinical Expert'}</p>
                                                </div>
                                            </div>
                                            <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                                                    <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Available Today</span>
                                                </div>
                                                <div className="text-blue-500 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all">
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
                                                </div>
                                            </div>
                                        </div>
                                    )) : (
                                        <div className="col-span-full py-12 text-center border-2 border-dashed border-white/5 rounded-[2rem] bg-white/[0.01]">
                                            <p className="text-slate-500 font-bold">No Neural Matching Specialists found. Refer to General Triage.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            <div className="pt-12 mt-12 border-t border-white/5 flex justify-between">
                                <button 
                                    onClick={() => setStep(1)}
                                    className="text-slate-500 hover:text-white font-bold px-6 py-2 transition-colors uppercase tracking-widest text-[10px]"
                                >
                                    &larr; Re-run Clinical Model
                                </button>
                            </div>
                        </div>
                    )}

                    {/* STEP 4: CALENDAR BOOKING */}
                    {step === 4 && selectedDoctor && (
                        <div className="animate-fade-in relative z-10">
                            <h2 className="text-xl font-black text-white mb-8 flex items-center gap-2">
                                <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-indigo-600/20 text-indigo-400 text-xs border border-indigo-500/30">03</span>
                                Appointment Synchronization
                            </h2>

                            <div className="flex flex-col md:flex-row gap-10">
                                <div className="flex-1 space-y-8">
                                    
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4">Target Date</label>
                                        <input 
                                            type="date" 
                                            value={selectedDate}
                                            onChange={e => setSelectedDate(e.target.value)}
                                            min={new Date().toISOString().split('T')[0]} 
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-indigo-500 text-white font-bold"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4">Priority Access Slots</label>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                            {['09:00 AM', '10:30 AM', '01:00 PM', '02:30 PM', '04:00 PM'].map(time => (
                                                <button 
                                                    key={time}
                                                    onClick={() => setSelectedTime(time)}
                                                    className={`py-3 px-4 border-2 rounded-2xl text-xs font-black transition-all uppercase tracking-tighter ${
                                                        selectedTime === time 
                                                        ? 'border-indigo-600 bg-indigo-600/10 text-indigo-400 shadow-[0_0_15px_rgba(79,70,229,0.3)]' 
                                                        : 'border-white/5 text-slate-500 hover:border-indigo-500/50'
                                                    }`}
                                                >
                                                    {time}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                </div>

                                <div className="w-full md:w-80 bg-white/5 border border-white/10 rounded-[2rem] p-8 h-max backdrop-blur-md">
                                    <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-6 border-b border-white/10 pb-4">Secure Confirmation</h4>
                                    
                                    <div className="space-y-6">
                                        <div className="flex gap-4">
                                            <div className="w-10 h-10 bg-indigo-600/20 rounded-xl flex items-center justify-center text-indigo-400 shrink-0">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-black text-slate-500 uppercase mb-1">Assigned Consultant</p>
                                                <p className="font-bold text-white leading-tight">{selectedDoctor.name || selectedDoctor.firstName}</p>
                                                <p className="text-[10px] font-bold text-indigo-400 mt-1">{selectedDoctor.specialization}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-4">
                                            <div className="w-10 h-10 bg-emerald-600/20 rounded-xl flex items-center justify-center text-emerald-400 shrink-0">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-black text-slate-500 uppercase mb-1">Diagnostic Target</p>
                                                <p className="font-bold text-white leading-tight">{aiResult?.possibleConditions?.[0]?.name || 'See health report'}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-4">
                                            <div className="w-10 h-10 bg-blue-600/20 rounded-xl flex items-center justify-center text-blue-400 shrink-0">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-black text-slate-500 uppercase mb-1">Timestamp</p>
                                                <p className="font-bold text-blue-400 leading-tight">{selectedDate || 'DATE_PENDING'}<br/>{selectedTime || 'TIME_PENDING'}</p>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="mt-10">
                                        <button 
                                            onClick={confirmBooking}
                                            disabled={isBooking || !selectedDate || !selectedTime}
                                            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-600 text-white font-black py-3.5 px-4 rounded-xl transition-all shadow-xl shadow-indigo-600/20 active:scale-95 flex justify-center items-center uppercase tracking-widest text-[10px]"
                                        >
                                            {isBooking ? 'Syncing...' : 'Finalize Reservation'}
                                        </button>
                                        <button 
                                            onClick={() => setStep(3)}
                                            className="text-slate-500 hover:text-white font-bold py-2 mt-4 w-full text-[10px] uppercase tracking-widest transition-colors"
                                        >
                                            &larr; Adjust Diagnosis
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* REPORT MODAL */}
                    {showReport && aiResult && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
                            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm print:hidden" onClick={() => setShowReport(false)}></div>
                            <div className="bg-white w-full max-w-2xl rounded-xl shadow-2xl relative z-[110] flex flex-col max-h-[90vh] overflow-y-auto border border-slate-200 animate-scale-in">
                                {/* Header (Screen only) */}
                                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50 sticky top-0 z-10 print:hidden">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-sm">
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-900 uppercase tracking-widest text-xs">AI Health Assessment</h3>
                                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Not a Medical Diagnosis</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-3">
                                        <button onClick={downloadDossier} className="px-4 py-2 flex items-center gap-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-bold text-[10px] uppercase tracking-widest" title="Instant Download">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                                            Download PDF
                                        </button>
                                        <button onClick={() => setShowReport(false)} className="w-10 h-10 flex items-center justify-center bg-slate-100 text-slate-500 hover:bg-red-500 hover:text-white rounded-lg transition-all border border-slate-200">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                        </button>
                                    </div>
                                </div>

                                 {/* Report Content */}
                                <div className="p-8 space-y-6 bg-white" id="clinical-report-content" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>

                                    {/* Report Header */}
                                    <div className="flex justify-between items-center border-b-2 border-black pb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 bg-blue-600 flex items-center justify-center text-white">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                                            </div>
                                            <div>
                                                <h1 className="text-xl font-black text-slate-900 tracking-tighter uppercase">Patient Diagnostic Report</h1>
                                                <p className="text-[9px] text-emerald-600 font-bold uppercase tracking-[0.2em]">CareBridge AI Clinical Systems &bull; Bridging Excellence</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Generated</p>
                                            <p className="text-xs font-bold text-black">{new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                        </div>
                                    </div>

                                    {/* Disclaimer Banner */}
                                    <div className="bg-amber-50 border border-amber-300 rounded-lg p-3 flex items-start gap-3">
                                        <span className="text-amber-500 text-lg flex-shrink-0">⚠️</span>
                                        <p className="text-[10px] text-amber-800 font-bold leading-relaxed">
                                            <strong>IMPORTANT:</strong> This is an AI-generated health assessment — NOT a medical diagnosis. This report is for informational purposes only. Always consult a licensed physician before making any health decisions.
                                        </p>
                                    </div>

                                    {/* Patient Identification */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-50 border-y border-slate-200 py-6 px-4">
                                        <div>
                                            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1">Patient Name</p>
                                            <p className="text-xs font-black text-slate-900">{patientName || 'Anonymous'}</p>
                                        </div>
                                        <div>
                                            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1">Electronic Mail</p>
                                            <p className="text-xs font-black text-slate-900">{patientEmail || 'Not Provided'}</p>
                                        </div>
                                        <div>
                                            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1">Contact Nexus</p>
                                            <p className="text-xs font-black text-slate-900">{patientPhone || 'Not Provided'}</p>
                                        </div>
                                    </div>

                                    {/* Summary */}
                                    <div className="bg-blue-50 border-l-4 border-blue-600 p-4">
                                        <p className="text-[9px] font-bold text-blue-600 uppercase tracking-widest mb-1.5">AI Assessment Summary</p>
                                        <p className="text-sm text-slate-800 leading-relaxed">
                                            Based on <strong>{selectedSymptoms.length}</strong> reported symptom{selectedSymptoms.length !== 1 ? 's' : ''}, the AI identified <span className="font-bold text-black">{(aiResult.possibleConditions || []).length}</span> possible condition{aiResult.possibleConditions?.length !== 1 ? 's' : ''}.
                                            Risk level is assessed as <span className="font-bold text-black underline underline-offset-2">{aiResult.riskLevel}</span>.
                                            Recommended action: {aiResult.recommendedAction}
                                        </p>
                                    </div>

                                    {/* 2. ACTION ROADMAP (The "What to do" Part) */}
                                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 relative z-10">
                                        <div className="md:col-span-12">
                                            <div className="bg-slate-50 border border-slate-200 p-6">
                                                <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-500 mb-6">Management Protocol & Suggestions</h3>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                    <div className="space-y-4">
                                                        <div className="flex gap-4">
                                                            <div className="text-xl font-bold text-blue-600">01</div>
                                                            <div>
                                                                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1">Primary Recommendation</p>
                                                                <p className="text-sm font-bold text-slate-800 leading-snug">{aiResult.advice}</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex gap-4 pt-2 border-t border-slate-100">
                                                            <div className="text-xl font-bold text-slate-300">02</div>
                                                            <div>
                                                                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1">Recovery Guidance</p>
                                                                <p className="text-xs text-slate-600 leading-relaxed font-bold">{aiResult.lifestyleAdvice || "Observe rest and maintain fluid intake for 48 hours."}</p>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Metric Table (Visual Object 1) */}
                                                    <div className="border border-slate-200">
                                                        <table className="w-full text-left text-[10px]">
                                                            <thead>
                                                                <tr className="bg-slate-100 text-slate-900 uppercase tracking-widest">
                                                                    <th className="px-4 py-2.5 font-bold">Clinical Parameter</th>
                                                                    <th className="px-4 py-2.5 font-bold text-right">Index</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody className="divide-y divide-slate-100">
                                                                <tr>
                                                                    <td className="px-4 py-2 font-medium text-slate-500 italic">Risk Level</td>
                                                                    <td className="px-4 py-2 text-right font-bold text-blue-600">{aiResult.riskLevel || 'N/A'}</td>
                                                                </tr>
                                                                <tr>
                                                                    <td className="px-4 py-2 font-medium text-slate-500 italic">Symptoms Reported</td>
                                                                    <td className="px-4 py-2 text-right font-bold text-slate-700">{selectedSymptoms.length}</td>
                                                                </tr>
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* 3. VISUALS (Chart & Specialist) */}
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative z-10 mt-2">
                                        {/* Intensity Chart (Visual Object 2) */}
                                        <div className="md:col-span-1 border border-slate-200 p-4 flex flex-col items-center justify-center bg-white shadow-sm">
                                            <p className="text-[7px] font-bold text-slate-400 uppercase tracking-widest mb-2">Risk Level</p>
                                            <div className="text-xl font-black text-center leading-tight">
                                                {aiResult.riskLevel === 'Critical' ? '🚨' : aiResult.riskLevel === 'Urgent' ? '⚠️' : aiResult.riskLevel === 'Moderate' ? '🔶' : '✅'}
                                            </div>
                                            <div className="text-[9px] font-black text-black mt-1 uppercase tracking-tight text-center">{aiResult.riskLevel}</div>
                                        </div>

                                        {/* Specialist Link */}
                                        <div className="md:col-span-3 border border-slate-200 p-5 flex items-center justify-between bg-white shadow-sm">
                                            <div className="flex items-center gap-5">
                                                <div className="w-12 h-12 bg-black flex items-center justify-center text-white text-xl font-bold">
                                                    {aiResult.recommendedSpecialty[0]}
                                                </div>
                                                <div>
                                                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Recommended Professional</p>
                                                    <p className="text-sm font-bold text-black tracking-tight underline">{aiResult.recommendedSpecialty}</p>
                                                </div>
                                            </div>
                                            <div className="text-[8px] font-bold text-slate-300 italic">AUTO_REFERRAL_ENABED</div>
                                        </div>
                                    </div>

                                    {/* Footer Section */}
                                    <div className="pt-4 border-t border-slate-200 flex justify-between items-center">
                                        <p className="text-[7px] text-slate-400 font-medium uppercase tracking-widest">Disclaimer: AI-generated report. Always consult a licensed physician.</p>
                                        <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">CareBridge AI &bull; {new Date().getFullYear()}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            
            {/* EMERGENCY PROTOCOL MODAL */}
            {showEmergencyProtocol && (
                <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowEmergencyProtocol(false)}></div>
                    <div className="relative z-10 bg-[#0d0f14] border border-red-500/30 rounded-3xl p-8 max-w-md w-full shadow-2xl shadow-red-900/30 animate-scale-in">
                        {/* Header */}
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 bg-red-500/20 rounded-2xl flex items-center justify-center text-2xl border border-red-500/30">🚨</div>
                            <div>
                                <h2 className="text-lg font-black text-red-400 uppercase tracking-tight">Emergency Protocol</h2>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">CareBridge Critical Response</p>
                            </div>
                            <button onClick={() => setShowEmergencyProtocol(false)} className="ml-auto w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-all">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"/></svg>
                            </button>
                        </div>

                        {/* Medical Emergency Panel */}
                        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-5 mb-6">
                            <p className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-2">Medical Emergency — Action Required</p>
                            <p className="text-sm text-red-200 font-bold leading-relaxed">
                                If you are experiencing a medical emergency, such as severe bleeding, a heart attack, or any life-threatening condition, immediately <span className="underline decoration-red-500">call emergency services</span>. Prompt action is crucial—do not wait for help to arrive.
                            </p>
                        </div>

                        {/* Emergency Contacts */}
                        <div className="space-y-3 mb-6">
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-3">Emergency Contacts</p>
                            <a href="tel:999" className="flex items-center justify-between p-4 bg-red-600 hover:bg-red-500 rounded-2xl transition-all group">
                                <div className="flex items-center gap-3">
                                    <span className="text-xl">📞</span>
                                    <div>
                                        <p className="font-black text-white text-sm">Call 999</p>
                                        <p className="text-[10px] text-red-200">Ambulance / Police / Fire</p>
                                    </div>
                                </div>
                                <svg className="w-5 h-5 text-white group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
                            </a>
                            <a href="tel:911" className="flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-all group">
                                <div className="flex items-center gap-3">
                                    <span className="text-xl">📞</span>
                                    <div>
                                        <p className="font-black text-white text-sm">Call 911</p>
                                        <p className="text-[10px] text-slate-400">International Emergency</p>
                                    </div>
                                </div>
                                <svg className="w-5 h-5 text-slate-400 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
                            </a>
                        </div>

                        {/* Quick Signs */}
                        <div className="bg-white/3 border border-white/5 rounded-2xl p-4">
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-3">Signs That Need Immediate Help</p>
                            <ul className="space-y-1.5">
                                {['Chest pain or pressure','Difficulty breathing','Face drooping or arm weakness','Severe bleeding or head injury','Loss of consciousness'].map((s, i) => (
                                    <li key={i} className="flex items-center gap-2 text-xs text-slate-300 font-medium">
                                        <span className="w-1.5 h-1.5 bg-red-500 rounded-full flex-shrink-0"></span>{s}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            )}

            {/* FOOTER */}
            <footer className="relative z-10 py-10 text-center text-slate-600 text-[10px] font-bold uppercase tracking-widest bg-black/50">
                <p>&copy; 2026 CareBridge AI &bull; Clinical Suite 3.4 &bull; All Protocols Secure</p>
            </footer>
        </div>
    );
}
