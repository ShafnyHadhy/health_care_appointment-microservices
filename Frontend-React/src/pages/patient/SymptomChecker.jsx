import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import Header from '../../components/header';
import Footer from '../../components/footer';

const COMMON_SYMPTOMS = [
    'Headache', 'Fever', 'Cough', 'Nausea', 'Dizziness', 'Fatigue',
    'Chest Pain', 'Shortness of Breath', 'Stomach Ache', 'Gastric',
    'Joint Pain', 'Anxiety', 'Rash', 'Wheezing', 'Thirst', 'Urination',
    'Weight Gain', 'Heartburn', 'Acid Reflux', 'Blurry Vision'
];

const tealGradient = { background: 'linear-gradient(135deg, #006063 0%, #007b7f 100%)' };

export default function SymptomChecker() {
    const navigate = useNavigate();

    // Step Tracking
    const [step, setStep] = useState(1);

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
        Critical: { color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200', icon: '🚨', label: 'Critical Risk' },
        Urgent:   { color: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-200', icon: '⚠️', label: 'Urgent' },
        Moderate: { color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200', icon: '🔶', label: 'Moderate' },
        Low:      { color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200', icon: '✅', label: 'Low Risk' },
    };

    // PRINT STYLES INJECTION
    useEffect(() => {
        const style = document.createElement('style');
        style.innerHTML = `
            @media print {
                @page { margin: 0; size: auto; }
                body { background-color: white !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                .no-print { display: none !important; }
            }
        `;
        document.head.appendChild(style);
        return () => document.head.removeChild(style);
    }, []);

    // Filter suggestions locally
    useEffect(() => {
        if (!searchTerm) { setSuggestions([]); return; }
        const filtered = COMMON_SYMPTOMS.filter(s =>
            s.toLowerCase().includes(searchTerm.toLowerCase()) && !selectedSymptoms.includes(s)
        );
        setSuggestions(filtered);
    }, [searchTerm, selectedSymptoms]);

    const handleAddSymptom = (smp) => {
        if (!selectedSymptoms.includes(smp)) setSelectedSymptoms([...selectedSymptoms, smp]);
        setSearchTerm('');
        setSuggestions([]);
    };

    const handleRemoveSymptom = (smp) => {
        setSelectedSymptoms(selectedSymptoms.filter(s => s !== smp));
    };

    const runAnalysis = async (specificSymptoms = null) => {
        let finalSymptoms = specificSymptoms || [...selectedSymptoms];
        const isReAnalysis = !!specificSymptoms;

        if (!specificSymptoms && searchTerm.trim()) {
            const splitSymptoms = searchTerm.split(',').map(s => s.trim()).filter(s => s);
            finalSymptoms = [...new Set([...finalSymptoms, ...splitSymptoms])];
        }

        if (finalSymptoms.length === 0) { toast.error('Please enter at least one symptom.'); return; }

        if (!isReAnalysis) setStep(2);
        setIsAnalyzing(true);

        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
            const response = await axios.post(`${apiUrl}/api/symptoms/analyze`, { symptoms: finalSymptoms }, { timeout: 15000 });

            if (response.data.success) {
                const result = response.data.data;
                setAiResult(result);
                
                // Silently save report for Admin Dashboard
                try {
                    await axios.post(`${apiUrl}/api/admin/ai-reports/public`, {
                        patientName: patientName || 'Anonymous',
                        patientEmail: patientEmail || 'Not Provided',
                        patientPhone: patientPhone || 'Not Provided',
                        symptoms: finalSymptoms,
                        riskLevel: result.riskLevel || 'Low',
                        disease: result.possibleConditions?.[0]?.name || 'Unspecified',
                        recommendedSpecialty: result.recommendedSpecialty || 'General Practitioner'
                    });
                } catch (reportErr) {
                    console.error('Failed to save AI report internally:', reportErr);
                }

                if (!isReAnalysis) {
                    setStep(3);
                    if (result.isEmergency) setTimeout(() => setShowEmergency(true), 400);
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
                const filtered = data.data.filter(d =>
                    d.specialization && d.specialization.toLowerCase().includes(targetSpecialty.toLowerCase())
                );
                setDoctors(filtered.length > 0 ? filtered : data.data);
            }
        } catch (err) {
            console.error('Failed to fetch doctors:', err);
        }
    };

    const handleDoctorSelect = (doc) => {
        setSelectedDoctor(doc);
        setStep(4);
    };

    const confirmBooking = async () => {
        if (!selectedDate || !selectedTime) { toast.error('Please select both date and time.'); return; }
        setIsBooking(true);
        setTimeout(() => {
            setIsBooking(false);
            toast.success('Appointment Booked Successfully!');
            navigate('/patient-dashboard');
        }, 1500);
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
  .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #007B7F; padding-bottom: 14px; margin-bottom: 20px; }
  .header-left { display: flex; align-items: center; gap: 12px; }
  .header-icon { width: 40px; height: 40px; background: #007B7F; border-radius: 6px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .header-icon svg { width: 22px; height: 22px; stroke: #fff; fill: none; }
  .header-title { font-size: 20px; font-weight: 800; color: #000; text-transform: uppercase; letter-spacing: -0.5px; }
  .header-sub { font-size: 9px; color: #94a3b8; text-transform: uppercase; letter-spacing: 1.5px; margin-top: 2px; }
  .header-right { text-align: right; }
  .header-right .label { font-size: 8px; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; }
  .header-right .value { font-size: 12px; font-weight: 700; color: #000; }
  .summary { background: #f0fdfa; border-left: 4px solid #007B7F; padding: 14px 16px; margin-bottom: 20px; border-radius: 0 6px 6px 0; }
  .summary .label { font-size: 8px; font-weight: 700; color: #007B7F; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 6px; }
  .summary p { font-size: 12px; color: #1e293b; line-height: 1.7; }
  .summary strong { color: #000; font-weight: 700; }
  .actions-box { border: 1px solid #e2e8f0; padding: 18px; border-radius: 6px; margin-bottom: 16px; }
  .section-title { font-size: 8px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 1.5px; border-bottom: 1px solid #f1f5f9; padding-bottom: 8px; margin-bottom: 14px; }
  .action-item { display: flex; gap: 12px; align-items: flex-start; margin-bottom: 14px; }
  .action-number { font-size: 22px; font-weight: 800; color: #dbeafe; line-height: 1; flex-shrink: 0; }
  .action-label { font-size: 8px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 3px; }
  .action-text { font-size: 12px; font-weight: 600; color: #1e293b; line-height: 1.5; }
  .action-divider { border-top: 1px solid #f1f5f9; padding-top: 12px; margin-top: 2px; }
  .table-box { border: 1px solid #e2e8f0; border-radius: 6px; overflow: hidden; margin-bottom: 16px; }
  table { width: 100%; border-collapse: collapse; }
  thead tr { background: #1e293b; }
  thead th { padding: 10px 14px; font-size: 9px; font-weight: 700; color: #fff; text-transform: uppercase; letter-spacing: 1px; text-align: left; }
  thead th:last-child { text-align: right; }
  tbody tr { border-bottom: 1px solid #f1f5f9; }
  tbody tr:last-child { border-bottom: none; }
  tbody td { padding: 10px 14px; font-size: 11px; color: #64748b; }
  tbody td:last-child { text-align: right; font-weight: 700; }
  .bottom-row { display: grid; grid-template-columns: 1fr 3fr; gap: 16px; margin-bottom: 20px; }
  .chart-box { border: 1px solid #e2e8f0; border-radius: 6px; padding: 16px; display: flex; flex-direction: column; align-items: center; justify-content: center; background: #f8fafc; }
  .chart-label { font-size: 7px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px; text-align: center; }
  .specialist-box { border: 1px solid #e2e8f0; border-radius: 6px; padding: 16px; display: flex; align-items: center; gap: 16px; }
  .specialist-icon { width: 48px; height: 48px; background: #007B7F; border-radius: 6px; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 20px; font-weight: 800; flex-shrink: 0; }
  .specialist-label { font-size: 8px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px; }
  .specialist-name { font-size: 15px; font-weight: 800; color: #000; }
  .footer { display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #e2e8f0; padding-top: 12px; }
  .footer p { font-size: 7px; color: #cbd5e1; text-transform: uppercase; letter-spacing: 0.5px; }
</style>
</head>
<body>
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
      <div class="value">${patientName || 'ANONYMOUS'}</div>
      <div style="font-size:9px;color:#64748b;">${patientEmail || 'No Email'} &bull; ${patientPhone || 'No Phone'}</div>
      <div class="label" style="margin-top:10px;">Generated On</div>
      <div class="value">${date}</div>
    </div>
  </div>
  <div style="background:#fffbeb;border:1px solid #f59e0b;border-radius:6px;padding:10px 14px;margin-bottom:18px;display:flex;gap:10px;align-items:flex-start;">
    <span style="font-size:16px;flex-shrink:0;">⚠️</span>
    <p style="font-size:10px;color:#92400e;font-weight:700;line-height:1.6;"><strong>IMPORTANT:</strong> This is an AI-generated health assessment — NOT a medical diagnosis. Always consult a licensed physician.</p>
  </div>
  <div class="summary">
    <div class="label">AI Assessment Summary</div>
    <p>Based on <strong>${selectedSymptoms.length}</strong> reported symptom${selectedSymptoms.length !== 1 ? 's' : ''}, the AI identified <strong>${(aiResult.possibleConditions || []).length}</strong> possible condition(s). Risk level is assessed as <strong>${riskLevel}</strong>. ${aiResult.recommendedAction}</p>
  </div>
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
        <div class="action-text" style="font-weight:400;color:#475569;">${aiResult.clinicalAdvice || aiResult.advice || 'Consult a licensed physician for a full evaluation.'}</div>
      </div>
    </div>
    <div class="action-item action-divider">
      <div class="action-number" style="color:#f1f5f9;">03</div>
      <div>
        <div class="action-label">Lifestyle &amp; Recovery</div>
        <div class="action-text" style="font-weight:400;color:#475569;">${aiResult.lifestyleAdvice || 'Rest and maintain adequate fluid intake for 48 hours.'}</div>
      </div>
    </div>
  </div>
  <div class="table-box">
    <table>
      <thead><tr><th>Clinical Parameter</th><th>Reading</th></tr></thead>
      <tbody>
        <tr><td>Risk Level</td><td style="color:${riskColor};font-weight:800;">${riskLevel}</td></tr>
        <tr><td>Most Likely Condition</td><td style="color:#000;font-weight:700;">${topCondition}</td></tr>
        <tr><td>Symptoms Reported</td><td style="color:#000;font-weight:700;">${selectedSymptoms.length}</td></tr>
        <tr><td>Recommended Specialist</td><td style="color:#007B7F;font-weight:700;">${aiResult.recommendedSpecialty}</td></tr>
      </tbody>
    </table>
  </div>
  <div class="bottom-row">
    <div class="chart-box">
      <div class="chart-label">Risk Level</div>
      <div style="font-size:28px;margin:6px 0;">${riskLevel === 'Critical' ? '🚨' : riskLevel === 'Urgent' ? '⚠️' : riskLevel === 'Moderate' ? '🔶' : '✅'}</div>
      <div style="font-size:10px;font-weight:800;color:${riskColor};text-transform:uppercase;text-align:center;">${riskLevel}</div>
    </div>
    <div class="specialist-box">
      <div class="specialist-icon">${(aiResult.recommendedSpecialty || 'D')[0]}</div>
      <div>
        <div class="specialist-label">Recommended Specialist</div>
        <div class="specialist-name">${aiResult.recommendedSpecialty}</div>
        <div style="font-size:9px;color:#94a3b8;margin-top:3px;">Please book an appointment at the earliest convenience.</div>
      </div>
    </div>
  </div>
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

    // Progress Steps
    const steps = ['Symptoms', 'Analysis', 'Results', 'Booking'];

    const renderProgressBar = (current) => (
        <div className="mb-10">
            <div className="flex items-center justify-between mb-3">
                {steps.map((label, i) => {
                    const stepNum = i + 1;
                    const isActive = stepNum === current;
                    const isDone = stepNum < current;
                    return (
                        <div key={label} className="flex items-center gap-2">
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                                isDone ? 'bg-primary border-primary text-white' :
                                isActive ? 'border-primary text-primary bg-white' :
                                'border-gray-200 text-gray-400 bg-white'
                            }`} style={isDone ? tealGradient : {}}>
                                {isDone ? (
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                    </svg>
                                ) : stepNum}
                            </div>
                            <span className={`text-xs font-label font-semibold hidden sm:block ${isActive ? 'text-primary' : isDone ? 'text-gray-600' : 'text-gray-400'}`}>
                                {label}
                            </span>
                            {i < steps.length - 1 && (
                                <div className={`h-px w-8 sm:w-16 md:w-24 mx-2 transition-all ${isDone ? 'bg-primary' : 'bg-gray-200'}`} style={isDone ? { background: '#007B7F' } : {}} />
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-neutral font-body">
            <Header />

            <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10 md:py-16">

                {/* Page Header */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#007B7F]/10 text-primary rounded-md font-label text-xs font-bold mb-4 tracking-wide uppercase">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                        AI-Powered Analysis
                    </div>
                    <h1 className="font-headline font-extrabold text-4xl md:text-5xl text-on-surface leading-tight tracking-tight mb-4">
                        AI Symptom <span className="text-primary">Checker</span>
                    </h1>
                    <p className="text-on-surface-variant text-base md:text-lg max-w-xl mx-auto leading-relaxed">
                        Describe your symptoms and get an instant AI-powered health assessment matched with CareBridge specialists.
                    </p>
                </div>

                {/* Main Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-10">
                    {renderProgressBar(step)}

                    {/* ── STEP 1: INPUT ── */}
                    {step === 1 && (
                        <div>
                            {/* Patient Profile */}
                            <div className="bg-[#F4FFFB] border border-[#007B7F]/10 rounded-xl p-6 mb-8">
                                <h3 className="font-label text-xs font-bold text-primary uppercase tracking-widest mb-5 flex items-center gap-2">
                                    <span className="w-2 h-2 bg-primary rounded-full" style={{ background: '#007B7F' }} />
                                    Patient Information
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="font-label text-xs font-semibold text-gray-500 uppercase tracking-widest">Full Name</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. Naji Ahmad"
                                            value={patientName}
                                            onChange={(e) => setPatientName(e.target.value)}
                                            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all text-sm font-medium text-gray-900 placeholder:text-gray-300"
                                            style={{ '--tw-ring-color': '#007B7F33' }}
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="font-label text-xs font-semibold text-gray-500 uppercase tracking-widest">Email</label>
                                        <input
                                            type="email"
                                            placeholder="naji@example.com"
                                            value={patientEmail}
                                            onChange={(e) => setPatientEmail(e.target.value)}
                                            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all text-sm font-medium text-gray-900 placeholder:text-gray-300"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="font-label text-xs font-semibold text-gray-500 uppercase tracking-widest">Phone</label>
                                        <input
                                            type="tel"
                                            placeholder="+94 7X XXX XXXX"
                                            value={patientPhone}
                                            onChange={(e) => setPatientPhone(e.target.value)}
                                            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all text-sm font-medium text-gray-900 placeholder:text-gray-300"
                                        />
                                    </div>
                                </div>
                            </div>

                            <h2 className="font-headline font-bold text-xl text-on-surface mb-6 flex items-center gap-3">
                                <span className="flex items-center justify-center w-7 h-7 rounded-lg text-white text-xs font-bold" style={tealGradient}>1</span>
                                Describe Your Symptoms
                            </h2>

                            <div className="space-y-6">
                                {/* Autocomplete Input */}
                                <div className="relative">
                                    <label className="block font-label text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">Search symptoms</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' && searchTerm.trim()) handleAddSymptom(searchTerm.trim());
                                            }}
                                            placeholder="Type a symptom and press Enter…"
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-5 py-4 focus:outline-none focus:ring-2 focus:border-primary/40 transition-all text-gray-900 font-medium placeholder:text-gray-400"
                                        />
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 bg-gray-100 text-gray-400 px-2 py-1 rounded-md text-[10px] font-bold font-label">
                                            ENTER
                                        </div>
                                    </div>

                                    {suggestions.length > 0 && (
                                        <div className="absolute z-30 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg max-h-52 overflow-y-auto">
                                            {suggestions.map(s => (
                                                <button
                                                    key={s}
                                                    onClick={() => handleAddSymptom(s)}
                                                    className="w-full text-left px-5 py-3.5 hover:bg-[#F4FFFB] text-gray-700 hover:text-primary border-b border-gray-50 last:border-0 transition-all flex justify-between items-center font-label font-medium text-sm"
                                                >
                                                    <span>{s}</span>
                                                    <span className="text-[10px] font-bold text-primary bg-[#007B7F]/10 px-2.5 py-1 rounded-lg">+ Add</span>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Common Symptoms Chips */}
                                <div>
                                    <label className="block font-label text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Common symptoms</label>
                                    <div className="flex flex-wrap gap-2">
                                        {COMMON_SYMPTOMS.filter(s => !selectedSymptoms.includes(s)).slice(0, 10).map(s => (
                                            <button
                                                key={s}
                                                onClick={() => handleAddSymptom(s)}
                                                className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-xs font-label font-semibold text-gray-600 hover:bg-[#F4FFFB] hover:text-primary hover:border-primary/30 transition-all shadow-sm"
                                            >
                                                + {s}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Selected Symptoms */}
                                {selectedSymptoms.length > 0 && (
                                    <div className="p-5 bg-[#F4FFFB] rounded-xl border border-[#007B7F]/10">
                                        <p className="font-label text-xs font-bold text-primary uppercase tracking-widest mb-3">Selected symptoms ({selectedSymptoms.length})</p>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedSymptoms.map(s => (
                                                <div key={s} className="flex items-center gap-2 px-4 py-2 text-white rounded-lg text-xs font-label font-bold shadow-sm" style={tealGradient}>
                                                    <span>{s}</span>
                                                    <button
                                                        onClick={() => handleRemoveSymptom(s)}
                                                        className="w-4 h-4 bg-white/20 hover:bg-white/40 rounded-full flex items-center justify-center transition-colors"
                                                        aria-label={`Remove ${s}`}
                                                    >
                                                        <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="flex justify-end pt-2">
                                    <button
                                        onClick={() => runAnalysis()}
                                        disabled={selectedSymptoms.length === 0 && !searchTerm.trim()}
                                        className="flex items-center gap-3 text-white font-headline font-bold py-3.5 px-8 rounded-xl transition-all shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                        style={tealGradient}
                                    >
                                        Run AI Analysis
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── STEP 2: ANALYZING ── */}
                    {step === 2 && (
                        <div className="py-20 flex flex-col items-center justify-center text-center">
                            <div className="relative w-20 h-20 mb-8">
                                <div className="absolute inset-0 rounded-full opacity-20 animate-ping" style={{ background: '#007B7F' }} />
                                <div className="relative w-20 h-20 rounded-2xl flex items-center justify-center text-white shadow-xl rotate-6" style={tealGradient}>
                                    <svg className="w-10 h-10 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                                    </svg>
                                </div>
                            </div>
                            <h3 className="font-headline font-bold text-2xl text-on-surface mb-3">Evaluating your symptoms…</h3>
                            <p className="text-on-surface-variant max-w-sm font-label text-base leading-relaxed">
                                Cross-referencing symptoms against global clinical datasets in real-time.
                            </p>
                        </div>
                    )}

                    {/* ── STEP 3: RESULTS ── */}
                    {step === 3 && aiResult && (
                        <div>
                            <h2 className="font-headline font-bold text-xl text-on-surface mb-6 flex items-center gap-3">
                                <span className="flex items-center justify-center w-7 h-7 rounded-lg text-white text-xs font-bold" style={tealGradient}>2</span>
                                AI Health Assessment
                            </h2>

                            {/* Risk Banner */}
                            {(() => {
                                const risk = riskConfig[aiResult.riskLevel] || riskConfig.Low;
                                return (
                                    <div className={`mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl border ${risk.bg} ${risk.border}`}>
                                        <div className="flex items-center gap-4">
                                            <span className="text-3xl">{risk.icon}</span>
                                            <div>
                                                <p className="font-label text-xs font-bold text-gray-400 uppercase tracking-widest mb-0.5">Risk Assessment</p>
                                                <p className={`font-headline font-bold text-xl ${risk.color} uppercase`}>{risk.label}</p>
                                            </div>
                                        </div>
                                        <p className={`font-label font-semibold text-sm ${risk.color} max-w-xs leading-snug`}>
                                            {aiResult.recommendedAction}
                                        </p>
                                    </div>
                                );
                            })()}

                            {/* Main Results Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                                {/* Conditions */}
                                <div className="md:col-span-2 bg-gray-50 border border-gray-100 rounded-xl p-6 space-y-5">
                                    {aiResult.possibleConditions?.length > 0 && (
                                        <div>
                                            <p className="font-label text-[10px] font-bold text-primary uppercase tracking-widest mb-1">Most Likely Condition</p>
                                            <p className="font-headline font-bold text-2xl text-on-surface">{aiResult.possibleConditions[0].name}</p>
                                            <p className="font-label text-xs text-gray-400 mt-1">⚠ AI assessment only — not a confirmed diagnosis</p>
                                        </div>
                                    )}
                                    {aiResult.possibleConditions?.length > 1 && (
                                        <div>
                                            <p className="font-label text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Other Possibilities</p>
                                            <div className="space-y-2">
                                                {aiResult.possibleConditions.slice(1).map((c, i) => (
                                                    <div key={i} className="flex items-center justify-between py-2 px-3 bg-white rounded-lg border border-gray-100">
                                                        <span className="font-label font-semibold text-sm text-gray-700">{c.name}</span>
                                                        <span className={`font-label text-[10px] font-bold uppercase px-2.5 py-1 rounded-full ${c.likelihood === 'Possible' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-500'}`}>
                                                            {c.likelihood}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    {(!aiResult.possibleConditions || aiResult.possibleConditions.length === 0) && (
                                        <p className="text-gray-500 font-label text-sm">Could not identify a specific condition — please consult a GP.</p>
                                    )}
                                    <div>
                                        <p className="font-label text-[10px] font-bold text-primary uppercase tracking-widest mb-2">Clinical Guidance</p>
                                        <p className="text-gray-700 font-label font-medium text-sm leading-relaxed">{aiResult.clinicalAdvice}</p>
                                    </div>
                                    <div className="flex flex-wrap gap-3 pt-2">
                                        <button
                                            onClick={() => setShowReport(true)}
                                            className="inline-flex items-center gap-2 font-label text-xs font-bold text-primary bg-[#007B7F]/10 hover:bg-[#007B7F]/20 px-5 py-2.5 rounded-lg border border-[#007B7F]/20 transition-all"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                            View Health Report
                                        </button>
                                    </div>
                                </div>

                                {/* Match Score Panel */}
                                <div className="bg-white border border-gray-100 rounded-xl p-6 text-center shadow-sm flex flex-col items-center justify-center">
                                    <div className="w-full h-1 rounded-full mb-6" style={tealGradient} />
                                    <p className="font-label text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Neural Confidence</p>
                                    <div className="font-headline font-extrabold text-4xl text-on-surface mb-4">{aiResult.matchScore || '—'}</div>
                                    <div className="w-full bg-gray-100 rounded-full h-2.5 mb-4">
                                        <div
                                            className="h-full rounded-full transition-all duration-1000"
                                            style={{ width: aiResult.matchScore || '0%', ...tealGradient }}
                                        />
                                    </div>
                                    <p className="font-label text-xs font-semibold text-primary">Positive Mapping</p>
                                    <div className="h-px w-10 bg-gray-100 my-2" />
                                    <p className="font-label text-xs text-gray-400">Baseline Match Score</p>
                                </div>
                            </div>

                            {/* Follow-Up Questions */}
                            {aiResult.isAmbiguous && aiResult.followUpQuestions?.length > 0 && (
                                <div className="mb-8 p-6 bg-blue-50 border border-blue-100 rounded-xl relative">
                                    <div className="flex items-center gap-3 mb-5">
                                        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 border border-blue-200">
                                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h3 className="font-label text-xs font-bold text-blue-700 uppercase tracking-widest">Clarification Needed</h3>
                                            <p className="font-label text-sm text-blue-600 font-medium">Additional markers help refine your assessment</p>
                                        </div>
                                    </div>
                                    <div className="space-y-3 relative">
                                        {isAnalyzing && (
                                            <div className="absolute inset-0 z-20 bg-white/70 backdrop-blur-sm rounded-xl flex items-center justify-center">
                                                <div className="flex flex-col items-center gap-3">
                                                    <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" style={{ borderTopColor: '#007B7F' }} />
                                                    <p className="font-label font-bold text-sm text-primary">Updating assessment…</p>
                                                </div>
                                            </div>
                                        )}
                                        {aiResult.followUpQuestions.map((q, idx) => (
                                            <div
                                                key={q}
                                                className={`bg-white p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${clickedQuestionIdx === idx ? 'border-blue-300 bg-blue-50' : 'border-gray-100 hover:border-blue-200'}`}
                                            >
                                                <p className={`font-label font-semibold text-sm ${clickedQuestionIdx === idx ? 'text-blue-700' : 'text-gray-800'}`}>{q}</p>
                                                <div className="flex gap-2 shrink-0">
                                                    <button
                                                        disabled={isAnalyzing}
                                                        onClick={() => {
                                                            setClickedQuestionIdx(idx);
                                                            const cleanSymptom = q
                                                                .replace(/^(Is the|Does the|Do you|Has the|Have you|Is there|When did|Are you experiencing|Are you also experiencing|Are you feeling|Do you notice|Is your|Have you felt|Any)\s+/i, '')
                                                                .replace(/\?$/, '')
                                                                .trim();
                                                            setAiResult(prev => ({ ...prev, followUpQuestions: prev.followUpQuestions.filter((_, i) => i !== idx) }));
                                                            const newList = [...new Set([...selectedSymptoms, cleanSymptom])];
                                                            setSelectedSymptoms(newList);
                                                            runAnalysis(newList);
                                                        }}
                                                        className={`px-5 py-2 rounded-lg font-label text-xs font-bold uppercase tracking-wide transition-all ${isAnalyzing ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'text-white hover:opacity-90'}`}
                                                        style={isAnalyzing ? {} : tealGradient}
                                                    >
                                                        {isAnalyzing && clickedQuestionIdx === idx ? 'Updating…' : 'Yes'}
                                                    </button>
                                                    <button
                                                        disabled={isAnalyzing}
                                                        onClick={() => setAiResult(prev => ({ ...prev, followUpQuestions: prev.followUpQuestions.filter((_, i) => i !== idx) }))}
                                                        className={`px-5 py-2 rounded-lg font-label text-xs font-bold uppercase tracking-wide border transition-all ${isAnalyzing ? 'bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed' : 'bg-white text-gray-500 hover:bg-gray-50 border-gray-200'}`}
                                                    >
                                                        No
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Doctor Recommendations */}
                            <div className="mt-8">
                                <h3 className="font-headline font-bold text-lg text-on-surface mb-6 flex items-center justify-between">
                                    Available Specialists
                                    <span className="font-label text-xs font-bold text-primary bg-[#007B7F]/10 border border-[#007B7F]/20 px-4 py-1.5 rounded-full">
                                        {aiResult.recommendedSpecialty}
                                    </span>
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {doctors.length > 0 ? doctors.slice(0, 4).map(doc => (
                                        <div
                                            key={doc._id}
                                            onClick={() => handleDoctorSelect(doc)}
                                            className="bg-white border border-gray-100 rounded-xl p-5 hover:border-primary/30 hover:shadow-md transition-all cursor-pointer group"
                                        >
                                            <div className="flex items-center gap-4 mb-4">
                                                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-headline font-bold text-xl shadow-sm" style={tealGradient}>
                                                    {(doc.name || doc.firstName || 'D')[0]}
                                                </div>
                                                <div>
                                                    <h4 className="font-headline font-bold text-gray-900 group-hover:text-primary transition-colors">{doc.name || `${doc.firstName} ${doc.lastName}`}</h4>
                                                    <p className="font-label text-xs font-semibold text-gray-400 uppercase tracking-widest">{doc.specialization || 'Clinical Expert'}</p>
                                                </div>
                                            </div>
                                            <div className="pt-4 border-t border-gray-50 flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                                                    <span className="font-label text-xs font-bold text-emerald-600 uppercase tracking-widest">Available Now</span>
                                                </div>
                                                <svg className="w-5 h-5 text-gray-300 group-hover:text-primary group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                                </svg>
                                            </div>
                                        </div>
                                    )) : (
                                        <div className="col-span-full py-16 text-center border-2 border-dashed border-gray-200 rounded-xl">
                                            <p className="text-gray-400 font-label font-medium">No matching specialists found. Please visit the General Triage desk.</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="pt-8 mt-8 border-t border-gray-100 flex justify-between items-center">
                                <button
                                    onClick={() => setStep(1)}
                                    className="text-gray-400 hover:text-primary font-label font-semibold text-sm px-4 py-2 transition-colors flex items-center gap-2"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                    </svg>
                                    Re-enter Symptoms
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ── STEP 4: BOOKING ── */}
                    {step === 4 && selectedDoctor && (
                        <div>
                            <h2 className="font-headline font-bold text-xl text-on-surface mb-8 flex items-center gap-3">
                                <span className="flex items-center justify-center w-7 h-7 rounded-lg text-white text-xs font-bold" style={tealGradient}>3</span>
                                Book Your Appointment
                            </h2>

                            <div className="flex flex-col md:flex-row gap-8">
                                {/* Left: Date & Time */}
                                <div className="flex-1 space-y-6">
                                    <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
                                        <label className="block font-label text-xs font-bold text-primary uppercase tracking-widest mb-4">Select Date</label>
                                        <input
                                            type="date"
                                            value={selectedDate}
                                            onChange={e => setSelectedDate(e.target.value)}
                                            min={new Date().toISOString().split('T')[0]}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-5 py-4 focus:outline-none focus:border-primary/40 text-gray-900 font-label font-semibold text-base"
                                        />
                                    </div>

                                    <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
                                        <label className="block font-label text-xs font-bold text-primary uppercase tracking-widest mb-4">Select Time</label>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                            {['09:00 AM', '10:30 AM', '01:00 PM', '02:30 PM', '04:00 PM'].map(time => (
                                                <button
                                                    key={time}
                                                    onClick={() => setSelectedTime(time)}
                                                    className={`py-3.5 px-4 border-2 rounded-xl font-label text-xs font-bold transition-all uppercase tracking-wide ${
                                                        selectedTime === time
                                                            ? 'text-white border-transparent'
                                                            : 'border-gray-100 bg-gray-50 text-gray-500 hover:border-primary/30 hover:text-primary'
                                                    }`}
                                                    style={selectedTime === time ? tealGradient : {}}
                                                >
                                                    {time}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Right: Summary Sidebar */}
                                <div className="w-full md:w-80 bg-gray-900 rounded-2xl p-8 h-max sticky top-24 border border-gray-800">
                                    <h4 className="font-label text-[10px] font-bold text-primary uppercase tracking-widest mb-8 border-b border-white/10 pb-5" style={{ color: '#00B2A9' }}>
                                        Booking Summary
                                    </h4>
                                    <div className="space-y-6">
                                        <div className="flex gap-4">
                                            <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-[#00B2A9] border border-white/10">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                </svg>
                                            </div>
                                            <div>
                                                <p className="font-label text-[10px] font-bold text-gray-500 uppercase mb-1">Doctor</p>
                                                <p className="font-headline font-bold text-white text-base leading-tight">{selectedDoctor.name || selectedDoctor.firstName}</p>
                                                <p className="font-label text-xs font-semibold mt-0.5" style={{ color: '#00B2A9' }}>{selectedDoctor.specialization}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-4">
                                            <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-emerald-400 border border-white/10">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                                </svg>
                                            </div>
                                            <div>
                                                <p className="font-label text-[10px] font-bold text-gray-500 uppercase mb-1">Condition</p>
                                                <p className="font-headline font-bold text-white text-base leading-tight">{aiResult?.possibleConditions?.[0]?.name || 'Clinical Triage'}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-4">
                                            <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-blue-400 border border-white/10">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                            </div>
                                            <div>
                                                <p className="font-label text-[10px] font-bold text-gray-500 uppercase mb-1">Schedule</p>
                                                <p className="font-headline font-bold text-primary text-base leading-snug" style={{ color: '#00B2A9' }}>
                                                    {selectedDate || 'Select Date'}<br />{selectedTime || 'Select Slot'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-8 space-y-3">
                                        <button
                                            onClick={confirmBooking}
                                            disabled={isBooking || !selectedDate || !selectedTime}
                                            className="w-full text-white font-headline font-bold py-4 px-6 rounded-xl transition-all shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed font-label text-sm uppercase tracking-wide"
                                            style={tealGradient}
                                        >
                                            {isBooking ? 'Booking…' : 'Confirm Appointment'}
                                        </button>
                                        <button
                                            onClick={() => setStep(3)}
                                            className="w-full text-gray-400 hover:text-white font-label font-semibold py-3 text-xs uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
                                        >
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                            </svg>
                                            Back to Results
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {/* ── REPORT MODAL ── */}
            {showReport && aiResult && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
                    <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm" onClick={() => setShowReport(false)} />
                    <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl relative z-[110] flex flex-col max-h-[90vh] overflow-y-auto border border-gray-100">
                        {/* Modal Header */}
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white" style={tealGradient}>
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="font-headline font-bold text-gray-900 text-base">Clinical Report</h3>
                                    <p className="font-label text-xs font-semibold text-primary mt-0.5">AI Analytical Output</p>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={downloadDossier}
                                    className="flex items-center gap-2 text-white font-label font-bold text-xs uppercase tracking-widest px-5 py-2.5 rounded-xl shadow-sm transition-all hover:opacity-90"
                                    style={tealGradient}
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                    </svg>
                                    Export PDF
                                </button>
                                <button
                                    onClick={() => setShowReport(false)}
                                    className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-red-500 rounded-xl transition-all border border-gray-100 hover:border-red-100"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        {/* Report Content */}
                        <div className="p-6 space-y-5 bg-white">
                            {/* Report Header */}
                            <div className="flex justify-between items-center border-b-2 border-gray-900 pb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white" style={tealGradient}>
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h1 className="font-headline font-extrabold text-xl text-gray-900 uppercase">Clinical Assessment Report</h1>
                                        <p className="font-label text-[10px] text-primary font-bold uppercase tracking-widest">CareBridge AI Clinical Systems</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-label text-[9px] font-bold text-gray-400 uppercase tracking-widest">Generated</p>
                                    <p className="font-label text-xs font-bold text-gray-900">{new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                </div>
                            </div>

                            {/* Disclaimer */}
                            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-3">
                                <span className="text-amber-500 text-lg flex-shrink-0">⚠️</span>
                                <p className="font-label text-[10px] text-amber-800 font-bold leading-relaxed">
                                    <strong>IMPORTANT:</strong> This is an AI-generated health assessment — NOT a medical diagnosis. Always consult a licensed physician before making any health decisions.
                                </p>
                            </div>

                            {/* Patient Identification */}
                            <div className="grid grid-cols-3 gap-4 bg-gray-50 border-y border-gray-200 py-5 px-4 rounded-xl">
                                <div>
                                    <p className="font-label text-[8px] font-bold text-gray-400 uppercase tracking-widest mb-1">Patient Name</p>
                                    <p className="font-label text-xs font-black text-gray-900">{patientName || 'Anonymous'}</p>
                                </div>
                                <div>
                                    <p className="font-label text-[8px] font-bold text-gray-400 uppercase tracking-widest mb-1">Email</p>
                                    <p className="font-label text-xs font-black text-gray-900">{patientEmail || 'Not Provided'}</p>
                                </div>
                                <div>
                                    <p className="font-label text-[8px] font-bold text-gray-400 uppercase tracking-widest mb-1">Phone</p>
                                    <p className="font-label text-xs font-black text-gray-900">{patientPhone || 'Not Provided'}</p>
                                </div>
                            </div>

                            {/* Summary */}
                            <div className="bg-[#F4FFFB] border-l-4 border-primary p-5 rounded-r-xl" style={{ borderLeftColor: '#007B7F' }}>
                                <p className="font-label text-[10px] font-bold text-primary uppercase tracking-widest mb-2">AI Assessment Summary</p>
                                <p className="font-label text-sm text-gray-800 leading-relaxed">
                                    Based on <strong className="text-gray-900">{selectedSymptoms.length}</strong> reported symptom{selectedSymptoms.length !== 1 ? 's' : ''}, the system identified{' '}
                                    <strong className="text-gray-900">{(aiResult.possibleConditions || []).length}</strong> prospective condition(s). Risk level is{' '}
                                    <strong className="text-gray-900 underline underline-offset-2">{aiResult.riskLevel}</strong>. {aiResult.recommendedAction}
                                </p>
                            </div>

                            {/* Action Table */}
                            <div className="border border-gray-200 rounded-xl overflow-hidden">
                                <div className="bg-gray-50 px-5 py-3 border-b border-gray-200">
                                    <p className="font-label text-[10px] font-bold text-gray-500 uppercase tracking-widest">Management Protocol</p>
                                </div>
                                <div className="p-5 space-y-4">
                                    <div className="flex gap-4">
                                        <span className="font-headline font-black text-xl text-primary" style={{ color: '#007B7F' }}>01</span>
                                        <div>
                                            <p className="font-label text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Clinical Mandate</p>
                                            <p className="font-label text-sm font-semibold text-gray-800">{aiResult.advice || aiResult.recommendedAction}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-4 border-t border-gray-100 pt-4">
                                        <span className="font-headline font-black text-xl text-gray-200">02</span>
                                        <div>
                                            <p className="font-label text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Recovery Guidance</p>
                                            <p className="font-label text-sm text-gray-600">{aiResult.lifestyleAdvice || 'Observe rest and maintain fluid intake for 48 hours.'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Metrics */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="border border-gray-200 rounded-xl p-4 flex flex-col items-center justify-center text-center bg-gray-50">
                                    <p className="font-label text-[7px] font-bold text-gray-400 uppercase tracking-widest mb-2">Risk Level</p>
                                    <div className="text-2xl mb-1">
                                        {aiResult.riskLevel === 'Critical' ? '🚨' : aiResult.riskLevel === 'Urgent' ? '⚠️' : aiResult.riskLevel === 'Moderate' ? '🔶' : '✅'}
                                    </div>
                                    <div className="font-label text-[9px] font-black text-gray-900 uppercase">{aiResult.riskLevel}</div>
                                </div>
                                <div className="md:col-span-3 border border-gray-200 rounded-xl p-4 flex items-center justify-between bg-white">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-headline font-bold text-lg" style={tealGradient}>
                                            {aiResult.recommendedSpecialty[0]}
                                        </div>
                                        <div>
                                            <p className="font-label text-[8px] font-bold text-gray-400 uppercase tracking-widest">Recommended Specialist</p>
                                            <p className="font-headline font-bold text-gray-900">{aiResult.recommendedSpecialty}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                                <p className="font-label text-[7px] text-gray-400 uppercase tracking-widest">Disclaimer: AI-generated report. Always consult a licensed physician.</p>
                                <p className="font-label text-[8px] font-bold text-gray-400 uppercase">CareBridge AI • {new Date().getFullYear()}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ── EMERGENCY MODAL ── */}
            {showEmergencyProtocol && (
                <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-md" onClick={() => setShowEmergencyProtocol(false)} />
                    <div className="relative z-10 bg-white border border-gray-100 rounded-2xl p-10 max-w-lg w-full shadow-2xl">
                        <div className="flex items-center gap-5 mb-8">
                            <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center text-2xl border border-red-100">🚨</div>
                            <div>
                                <h2 className="font-headline font-black text-xl text-gray-900">Emergency Protocol</h2>
                                <p className="font-label text-[10px] text-red-500 font-bold uppercase tracking-widest">CareBridge Critical Response</p>
                            </div>
                            <button
                                onClick={() => setShowEmergencyProtocol(false)}
                                className="ml-auto w-9 h-9 rounded-xl bg-gray-50 hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-900 transition-all border border-gray-100"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="bg-red-50 border border-red-100 rounded-xl p-6 mb-6">
                            <p className="font-label text-[10px] font-bold text-red-700 uppercase tracking-widest mb-2">Critical Alert — Action Required</p>
                            <p className="font-label text-sm text-gray-700 font-medium leading-relaxed">
                                If you are experiencing a life-threatening emergency (severe chest pain, breathing failure, loss of consciousness), immediately{' '}
                                <span className="font-bold text-red-700 underline underline-offset-2">contact local emergency services</span>.
                            </p>
                        </div>
                        <div className="space-y-3">
                            <p className="font-label text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Emergency Contacts</p>
                            <a href="tel:999" className="flex items-center justify-between p-5 bg-red-600 hover:opacity-90 rounded-xl transition-all group shadow-lg">
                                <div className="flex items-center gap-4">
                                    <span className="text-2xl">📞</span>
                                    <div>
                                        <p className="font-headline font-bold text-white text-base">Call 999</p>
                                        <p className="font-label text-[10px] text-red-100 font-semibold uppercase tracking-widest">Ambulance / Police / Fire</p>
                                    </div>
                                </div>
                                <svg className="w-6 h-6 text-white group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                </svg>
                            </a>
                            <a href="tel:911" className="flex items-center justify-between p-5 bg-gray-900 hover:bg-black rounded-xl transition-all group shadow-lg">
                                <div className="flex items-center gap-4">
                                    <span className="text-2xl">📞</span>
                                    <div>
                                        <p className="font-headline font-bold text-white text-base">Call 911</p>
                                        <p className="font-label text-[10px] text-gray-500 font-semibold uppercase tracking-widest">International Emergency</p>
                                    </div>
                                </div>
                                <svg className="w-6 h-6 text-gray-500 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                </svg>
                            </a>
                        </div>
                    </div>
                </div>
            )}

            <Footer />
        </div>
    );
}
