import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import {
  LayoutDashboard,
  Calendar,
  Users,
  Mail,
  LineChart,
  HelpCircle,
  LogOut,
  Home,
  FileText,
  UserCircle,
  Search,
  Bell,
  Clock,
  Video,
  PlusCircle,
  CloudUpload,
  Bot,
  FlaskConical,
  Pill,
  ClipboardCheck,
  CheckCircle2,
  Lightbulb,
  Heart,
  Wind,
  Activity,
  Footprints,
  X,
  Upload,
  Loader2,
  CheckCircle,
  Trash2,
  ChevronRight,
} from "lucide-react";

export default function PatientDashboard() {
  const navigate = useNavigate();
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [user, setUser] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [reports, setReports] = useState([]);
  const [loadingReports, setLoadingReports] = useState(false);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loadingPrescriptions, setLoadingPrescriptions] = useState(false);

  const activityItems = [
    {
      icon: <FlaskConical size={18} className="text-primary" />,
      title: "Lab Results Updated",
      desc: "Metabolic panel from General Hospital is now available.",
      time: "2 Hours Ago",
    },
    {
      icon: <Pill size={18} className="text-primary" />,
      title: "Prescription Renewed",
      desc: "Dr. Sarah Jenkins approved your request for Vitamin D3.",
      time: "Yesterday",
    },
    {
      icon: <UserCircle size={18} className="text-primary" />,
      title: "Profile Information Changed",
      desc: "Your emergency contact was updated successfully.",
      time: "3 Days Ago",
    },
    {
      icon: <CheckCircle2 size={18} className="text-primary" />,
      title: "Health Assessment Complete",
      desc: "The annual wellness survey has been logged to your records.",
      time: "Oct 24",
    },
  ];

  const metrics = [
    { icon: <Heart size={24} />, label: "Heart Rate", val: "72", unit: "BPM" },
    { icon: <Wind size={24} />, label: "Blood Oxygen", val: "98", unit: "%" },
    {
      icon: <Activity size={24} />,
      label: "Blood Pressure",
      val: "120/80",
      unit: "mmHg",
    },
    {
      icon: <Footprints size={24} />,
      label: "Steps Today",
      val: "8,432",
      unit: "steps",
    },
  ];

  // Fetch user and reports on load
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    if (!token) {
      navigate("/login");
    } else {
      fetchReports();
      fetchPrescriptions();
    }
  }, [token, navigate]);

  const handleDeleteReport = async (fileName) => {
    if (!window.confirm("Are you sure you want to delete this report?")) {
      return;
    }

    try {
      const response = await axios.delete(
        `http://localhost:3001/api/patients/reports/${fileName}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.status === 200) {
        toast.success("Report deleted successfully!");
        fetchReports();
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error(error.response?.data?.message || "Failed to delete report");
    }
  };

  // Fetch all reports
  const fetchReports = async () => {
    setLoadingReports(true);
    try {
      const response = await axios.get(
        "http://localhost:3001/api/patients/reports",
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setReports(response.data.reports || []);
    } catch (error) {
      console.error("Error fetching reports:", error);
    } finally {
      setLoadingReports(false);
    }
  };

  const fetchPrescriptions = async () => {
    setLoadingPrescriptions(true);
    try {
      const response = await axios.get(
        "http://localhost:3001/api/patients/prescriptions",
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setPrescriptions(response.data.prescriptions || []);
    } catch (error) {
      console.error("Error fetching prescriptions:", error);
    } finally {
      setLoadingPrescriptions(false);
    }
  };

  // Handle file selection
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      const allowedTypes = [
        "application/pdf",
        "image/jpeg",
        "image/jpg",
        "image/png",
      ];
      if (!allowedTypes.includes(file.type)) {
        toast.error("Only PDF, JPG, JPEG, PNG files are allowed");
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File size must be less than 10MB");
        return;
      }
      setSelectedFile(file);
    }
  };

  // Handle file upload
  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error("Please select a file first");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("report", selectedFile);

    try {
      const response = await axios.post(
        "http://localhost:3001/api/patients/reports/upload",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        },
      );

      if (response.status === 201) {
        setUploadSuccess(true);
        toast.success("Medical report uploaded successfully!");
        setSelectedFile(null);
        fetchReports();
        setTimeout(() => {
          setShowUploadModal(false);
          setUploadSuccess(false);
        }, 2000);
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(error.response?.data?.message || "Failed to upload report");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-neutral font-body text-on-surface min-h-screen py-8">
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 pb-24">
        <header className="flex justify-between items-center mb-8">
          <div className="flex flex-col">
            <h2 className="font-headline font-bold text-2xl text-primary tracking-tight">
              Welcome back, {user?.name?.split(" ")[0] || "Alex"}
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              Your health dashboard is up to date.
            </p>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <section className="lg:col-span-8">
            {/* Highlight Card */}
            <div className="bg-white rounded-lg p-6 relative overflow-hidden border border-gray-200 flex flex-col md:flex-row gap-6 items-center shadow-sm">
              <div className="flex-1 z-10">
                <div className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded text-xs font-semibold mb-4">
                  <Clock size={12} />
                  Upcoming Today
                </div>
                <h3 className="font-headline text-2xl font-bold text-gray-900 mb-2">
                  Next Appointment
                </h3>
                <p className="text-gray-600 text-sm mb-6">
                  Consultation with{" "}
                  <span className="font-semibold text-primary">
                    Dr. Sarah Jenkins
                  </span>
                </p>
                <div className="flex items-center gap-6 mb-6">
                  <div className="flex items-center gap-2 font-medium text-sm text-gray-700">
                    <Calendar size={16} className="text-primary" /> Today
                  </div>
                  <div className="flex items-center gap-2 font-medium text-sm text-gray-700">
                    <Clock size={16} className="text-primary" /> 2:00 PM
                  </div>
                </div>
                <button
                  className="text-white px-5 py-2.5 rounded-md font-semibold flex items-center gap-2 shadow-sm transition-all active:scale-95 text-sm"
                  style={{ background: "#006063" }}
                >
                  <Video size={16} />
                  Join Video Room
                </button>
              </div>
              <div className="relative w-full md:w-56 h-48 rounded-md overflow-hidden shrink-0 border border-gray-100">
                <img
                  alt="Dr. Sarah Jenkins"
                  className="w-full h-full object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuD-M9Qi2E_J56XpWqQV8oWO1W4IgqEhRsdQF1ugv6D4PfhA3oY4qjiWSMJVPrqkxbVYXfrRfH7jpmJVxCQMZXUFJfmVOrfCI9RyPNOaiFtmvUJ-q6zbdwV1M0yyIcSrn6fT2dcdazwz5P1AB6LGWPN1DX6hx-ezhXtlAyQGkwXAQBjeSsgEjfyBty6B9lpvLEKDizNsW-omf_Wbyci4zJxE5jNTOGEZkTPdoOzOnk-7LHvcEdpjzQWQrIwUr15fdCHoII7iI16T9EI"
                />
              </div>
            </div>

            {/* Shortcut Bento - UPDATED with onClick handlers */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-6">
              <div
                className="bg-white border border-gray-200 hover:border-primary/40 transition-colors p-5 rounded-lg group cursor-pointer shadow-sm"
                onClick={() => navigate("/find-doctor")}
              >
                <div className="w-10 h-10 bg-primary/5 rounded-md flex items-center justify-center text-primary mb-3">
                  <PlusCircle size={20} />
                </div>
                <h4 className="font-headline font-semibold text-sm text-gray-900 mb-1">
                  Book Appointment
                </h4>
                <p className="text-xs text-gray-500">Schedule a new visit</p>
              </div>

              {/* Upload Report - Opens Modal */}
              <div
                className="bg-white border border-gray-200 hover:border-primary/40 transition-colors p-5 rounded-lg group cursor-pointer shadow-sm"
                onClick={() => setShowUploadModal(true)}
              >
                <div className="w-10 h-10 bg-primary/5 rounded-md flex items-center justify-center text-primary mb-3">
                  <CloudUpload size={20} />
                </div>
                <h4 className="font-headline font-semibold text-sm text-gray-900 mb-1">
                  Upload Report
                </h4>
                <p className="text-xs text-gray-500">Share medical files</p>
              </div>

              <div
                className="bg-white border border-gray-200 hover:border-primary/40 transition-colors p-5 rounded-lg group cursor-pointer shadow-sm"
                onClick={() => navigate("/ai-symptom-checker")}
              >
                <div className="w-10 h-10 bg-primary/5 rounded-md flex items-center justify-center text-primary mb-3">
                  <Bot size={20} />
                </div>
                <h4 className="font-headline font-semibold text-sm text-gray-900 mb-1">
                  AI Symptom Checker
                </h4>
                <p className="text-xs text-gray-500">Instant health insights</p>
              </div>
            </div>

            {/* Medical Reports Section */}
            <div className="mt-8">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-headline font-semibold text-lg text-gray-900">
                  My Medical Reports
                </h3>
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="text-primary text-xs font-semibold hover:underline flex items-center gap-1"
                >
                  <Upload size={12} /> Upload New
                </button>
              </div>

              {loadingReports ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="animate-spin text-primary" size={24} />
                </div>
              ) : reports.length > 0 ? (
                <div className="space-y-3">
                  {reports.map((report, index) => (
                    <div
                      key={index}
                      className="bg-white border border-gray-200 rounded-lg p-4 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <FileText size={20} className="text-primary" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {report.originalName}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(report.uploadDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <a
                          href={report.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 bg-teal-600 text-white text-sm rounded-lg hover:bg-teal-700 transition-colors flex items-center gap-1"
                        >
                          <FileText size={14} />
                          View
                        </a>
                        <button
                          onClick={() => handleDeleteReport(report.fileName)}
                          className="px-3 py-1.5 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 transition-colors flex items-center gap-1"
                        >
                          <Trash2 size={14} />
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
                  <FileText size={40} className="text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">
                    No medical reports yet
                  </p>
                  <button
                    onClick={() => setShowUploadModal(true)}
                    className="mt-3 text-primary text-sm font-medium hover:underline"
                  >
                    Upload your first report
                  </button>
                </div>
              )}
            </div>
            {/* Recent Prescriptions Section */}
            <div className="mt-8">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-headline font-semibold text-lg text-gray-900">
                  Recent Prescriptions
                </h3>
                <button
                  onClick={() => navigate("/profile")}
                  className="text-primary text-xs font-semibold hover:underline flex items-center gap-1"
                >
                  View All <ChevronRight size={12} />
                </button>
              </div>

              {loadingPrescriptions ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="animate-spin text-primary" size={24} />
                </div>
              ) : prescriptions.length > 0 ? (
                <div className="space-y-3">
                  {[...prescriptions]
                    .sort((a, b) => new Date(b.issuedAt) - new Date(a.issuedAt))
                    .slice(0, 3)
                    .map((prescription, index) => (
                      <div
                        key={index}
                        className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-teal-50 rounded-lg flex items-center justify-center">
                              <Pill size={20} className="text-teal-600" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {new Date(
                                  prescription.issuedAt,
                                ).toLocaleDateString()}
                              </p>
                              <p className="text-xs text-gray-500">
                                {prescription.medications?.length} medication(s)
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => navigate("/profile")}
                            className="text-primary text-xs font-medium hover:underline"
                          >
                            View Details
                          </button>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {prescription.medications
                            ?.slice(0, 2)
                            .map((med, medIdx) => (
                              <span
                                key={medIdx}
                                className="px-2 py-1 bg-gray-100 rounded-md text-xs text-gray-600"
                              >
                                {med.name}
                              </span>
                            ))}
                          {prescription.medications?.length > 2 && (
                            <span className="px-2 py-1 bg-gray-100 rounded-md text-xs text-gray-600">
                              +{prescription.medications.length - 2} more
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
                  <Pill size={40} className="text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">No prescriptions yet</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Your prescriptions will appear here after doctor visits
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* Activity Sidebar */}
          <aside className="lg:col-span-4">
            <div className="bg-white border border-gray-200 rounded-lg p-6 h-full shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-headline font-semibold text-lg text-gray-900">
                  Recent Activity
                </h3>
                <button className="text-primary text-xs font-semibold hover:underline">
                  View All
                </button>
              </div>
              <div className="space-y-6 relative">
                <div className="absolute left-3.75 top-2 bottom-2 w-0.5 bg-gray-100"></div>
                {activityItems.map((item, i) => (
                  <div key={i} className="relative flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shrink-0 z-10 border border-gray-200 shadow-sm">
                      {React.cloneElement(item.icon, { size: 14 })}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        {item.title}
                      </p>
                      <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                        {item.desc}
                      </p>
                      <p className="text-[10px] text-primary font-semibold mt-1.5 uppercase tracking-wide">
                        {item.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 bg-primary/5 border border-primary/10 p-5 rounded-md relative overflow-hidden">
                <div className="relative z-10 text-gray-800">
                  <h4 className="font-semibold text-sm flex items-center gap-2 mb-1.5">
                    <Lightbulb size={16} className="text-primary" /> Pro-Tip
                  </h4>
                  <p className="text-xs leading-relaxed opacity-90">
                    Keep your insurance card handy for your appointment today to
                    ensure a smooth check-in process.
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </div>

        {/* Vital Metrics */}
        <section className="mt-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {metrics.map((m) => (
              <div
                key={m.label}
                className="bg-white p-5 rounded-lg border border-gray-200 flex items-center gap-4 shadow-sm hover:border-primary/20 transition-colors"
              >
                <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  {React.cloneElement(m.icon, { size: 18 })}
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">
                    {m.label}
                  </p>
                  <p className="text-lg font-bold text-gray-900">
                    {m.val}{" "}
                    <span className="text-xs font-medium text-gray-500">
                      {m.unit}
                    </span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Upload Report Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 relative">
            <button
              onClick={() => {
                setShowUploadModal(false);
                setSelectedFile(null);
                setUploadSuccess(false);
              }}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>

            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <CloudUpload size={32} className="text-primary" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">
                Upload Medical Report
              </h3>
              <p className="text-gray-500 text-sm mt-1">
                Upload your medical reports, prescriptions, or lab results
              </p>
            </div>

            {uploadSuccess ? (
              <div className="text-center py-8">
                <CheckCircle
                  size={48}
                  className="text-green-500 mx-auto mb-3"
                />
                <p className="text-green-600 font-semibold">
                  Upload Successful!
                </p>
                <p className="text-gray-500 text-sm mt-1">
                  Your report has been uploaded.
                </p>
              </div>
            ) : (
              <>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center mb-6">
                  <input
                    type="file"
                    id="file-upload"
                    className="hidden"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileSelect}
                  />
                  <label htmlFor="file-upload" className="cursor-pointer block">
                    <Upload size={40} className="text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600 text-sm">
                      {selectedFile
                        ? selectedFile.name
                        : "Click to select a file"}
                    </p>
                    <p className="text-gray-400 text-xs mt-1">
                      PDF, JPG, JPEG, PNG (Max 10MB)
                    </p>
                  </label>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowUploadModal(false);
                      setSelectedFile(null);
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpload}
                    disabled={!selectedFile || uploading}
                    className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="animate-spin" size={16} />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload size={16} />
                        Upload
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
