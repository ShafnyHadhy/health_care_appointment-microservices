import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import Header from "../../components/header";
import Footer from "../../components/footer";
import {
  Calendar,
  Clock,
  Video,
  PlusCircle,
  CloudUpload,
  Bot,
  FlaskConical,
  Pill,
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
  FileText,
  UserCircle,
} from "lucide-react";
import AppointmentModal from "./appointmentModel";

export default function PatientDashboard() {
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;

  const [myAppointments, setMyAppointments] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [patientData, setPatientData] = useState(null);
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

  // Fetch patient profile + appointments
  useEffect(() => {
    const storedToken = localStorage.getItem("token");

    if (!storedToken) {
      toast.error("Please log in to access your dashboard");
      navigate("/login");
      return;
    }

    const fetchPatientProfile = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/patients/profile`, {
          headers: {
            Authorization: `Bearer ${storedToken}`,
          },
        });

        setPatientData(res.data);
      } catch (error) {
        console.error("Error fetching patient profile:", error);
        toast.error(
          error.response?.data?.message || "Failed to load patient profile",
        );
      }
    };

    const fetchMyAppointments = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/appointments`, {
          headers: {
            Authorization: `Bearer ${storedToken}`,
          },
        });

        const myAppoints = res.data.data || [];
        setMyAppointments(myAppoints);
        console.log("Fetched appointments:", myAppoints);
      } catch (error) {
        toast.error(
          error.response?.data?.message || "Failed to fetch appointments",
        );
        console.error("Error fetching appointments:", error);
      }
    };

    fetchPatientProfile();
    fetchMyAppointments();
  }, [API_URL, navigate]);

  // Fetch reports + prescriptions
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");

    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    if (!storedToken) {
      navigate("/login");
      return;
    }

    setToken(storedToken);
    fetchReports(storedToken);
    fetchPrescriptions(storedToken);
  }, [navigate]);

  const sortedAppointments = [...myAppointments].sort((a, b) => {
    const dateA = new Date(
      `${a.date.split("T")[0]}T${a.timeSlot ? a.timeSlot.split(" - ")[0] : "00:00"}`,
    );
    const dateB = new Date(
      `${b.date.split("T")[0]}T${b.timeSlot ? b.timeSlot.split(" - ")[0] : "00:00"}`,
    );
    return dateA - dateB;
  });

  const activeAppointments = sortedAppointments.filter(
    (app) => app.status === "accepted" || app.status === "confirmed",
  );

  const nextAppointment =
    activeAppointments.find((app) => {
      const appDateStr = app.date.split("T")[0];
      const todayStr = new Date().toISOString().split("T")[0];

      if (appDateStr > todayStr) return true;

      if (appDateStr === todayStr) {
        if (!app.timeSlot) return true;

        const timeParts = app.timeSlot.split(" - ");
        const endTime = timeParts.length > 1 ? timeParts[1] : timeParts[0];
        const [h, m] = endTime.split(":").map(Number);
        const now = new Date();

        return (
          h > now.getHours() || (h === now.getHours() && m > now.getMinutes())
        );
      }

      return false;
    }) || activeAppointments[0];

  const canJoinNow = (appointment) => {
    if (!appointment || !appointment.timeSlot) return false;
    if (!["accepted", "confirmed"].includes(appointment.status)) return false;

    const dateStr = appointment.date.split("T")[0];

    const convertTo24Hour = (time) => {
      if (!time.includes("AM") && !time.includes("PM")) return time;

      const [t, modifier] = time.split(" ");
      let [hours, minutes] = t.split(":");

      hours = parseInt(hours, 10);

      if (modifier === "PM" && hours !== 12) hours += 12;
      if (modifier === "AM" && hours === 12) hours = 0;

      return `${String(hours).padStart(2, "0")}:${minutes}`;
    };

    const startTimeRaw = appointment.timeSlot.split(" - ")[0];
    const startTime = convertTo24Hour(startTimeRaw);

    const appointmentStart = new Date(`${dateStr}T${startTime}`);
    const now = new Date();

    const diffMinutes = (appointmentStart - now) / (1000 * 60);

    return diffMinutes <= 30 && diffMinutes >= -60;
  };

  const handleJoinSession = async (appointment) => {
    try {
      const storedToken = localStorage.getItem("token");
      let res;

      try {
        res = await axios.get(
          `${API_URL}/api/telemedicine/session/${appointment._id}`,
          {
            headers: { Authorization: `Bearer ${storedToken}` },
          },
        );

        console.log("Existing telemedicine session response:", res);
      } catch (err) {
        if (err.response?.status === 404) {
          toast.error(
            "Session not found. Please wait for the doctor to start the session.",
          );

          res = await axios.post(
            `${API_URL}/api/telemedicine/session/create`,
            {
              appointmentId: appointment._id,
              doctorId: appointment.doctorId,
              patientId: appointment.patientId,
            },
            {
              headers: { Authorization: `Bearer ${storedToken}` },
            },
          );

          console.log("Created new telemedicine session response:", res);
        } else {
          throw err;
        }
      }

      const meetUrl = res?.data?.data?.meetUrl;

      if (!meetUrl) {
        toast.error("Meeting URL not found");
        return;
      }

      window.open(meetUrl, "_blank");
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to start session");
    }
  };

  const canJoin = nextAppointment && canJoinNow(nextAppointment);

  const handleDeleteReport = async (fileName) => {
    if (!window.confirm("Are you sure you want to delete this report?")) {
      return;
    }

    try {
      const response = await axios.delete(
        `${API_URL}/api/patients/reports/${fileName}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.status === 200) {
        toast.success("Report deleted successfully!");
        fetchReports(token);
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error(error.response?.data?.message || "Failed to delete report");
    }
  };

  const fetchReports = async (authToken = token) => {
    setLoadingReports(true);
    try {
      const response = await axios.get(`${API_URL}/api/patients/reports`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      setReports(response.data.reports || []);
    } catch (error) {
      console.error("Error fetching reports:", error);
      toast.error(error.response?.data?.message || "Failed to load reports");
    } finally {
      setLoadingReports(false);
    }
  };

  const fetchPrescriptions = async (authToken = token) => {
    setLoadingPrescriptions(true);
    try {
      const response = await axios.get(
        `${API_URL}/api/patients/prescriptions`,
        {
          headers: { Authorization: `Bearer ${authToken}` },
        },
      );

      setPrescriptions(response.data.prescriptions || []);
    } catch (error) {
      console.error("Error fetching prescriptions:", error);
      toast.error(
        error.response?.data?.message || "Failed to load prescriptions",
      );
    } finally {
      setLoadingPrescriptions(false);
    }
  };

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

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error("Please select a file first");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("report", selectedFile);

    try {
      // ✅ Use direct patient service URL (bypass API Gateway)
      const uploadUrl = "http://localhost:3001/api/patients/reports/upload";
      console.log("📤 Uploading to:", uploadUrl);
      console.log("📤 File:", selectedFile.name);
      console.log("📤 Token exists:", !!token);

      const response = await axios.post(uploadUrl, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("📦 Upload response:", response.data);

      if (response.status === 201) {
        setUploadSuccess(true);
        toast.success("Medical report uploaded successfully!");
        setSelectedFile(null);
        await fetchReports(token);
        setTimeout(() => {
          setShowUploadModal(false);
          setUploadSuccess(false);
        }, 2000);
      }
    } catch (error) {
      console.error("❌ Upload error:", error);
      console.error("❌ Error response:", error.response?.data);
      console.error("❌ Error status:", error.response?.status);

      if (error.response?.status === 401) {
        toast.error("Session expired. Please login again.");
        navigate("/login");
      } else if (error.response?.status === 403) {
        toast.error("Access denied. Please check your permissions.");
      } else if (error.response?.status === 404) {
        toast.error("Upload endpoint not found. Please contact support.");
      } else {
        toast.error(error.response?.data?.message || "Failed to upload report");
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-neutral font-body text-on-surface min-h-screen ">
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-8 md:px-8 pb-24">
        <header className="flex justify-between items-center mb-8">
          <div className="flex flex-col">
            <h2 className="font-headline font-bold text-2xl text-primary tracking-tight">
              Welcome back
              {patientData?.name ? `, ${patientData.name.split(" ")[0]}` : ""}
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              Your health dashboard is up to date.
            </p>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <section className="lg:col-span-8">
            <div className="bg-white rounded-xl p-6 relative overflow-hidden border border-gray-200 flex flex-col md:flex-row gap-6 items-center shadow-sm">
              <div className="flex-1 z-10">
                <div className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded text-xs font-semibold mb-4">
                  <Clock size={12} />
                  {nextAppointment
                    ? new Date(nextAppointment.date).toDateString() ===
                      new Date().toDateString()
                      ? "Upcoming Today"
                      : "Upcoming Appointment"
                    : "No Upcoming Appointments"}
                </div>

                <h3 className="font-headline text-2xl font-bold text-gray-900 mb-2">
                  Next Appointment
                </h3>

                <p className="text-gray-600 text-sm mb-6">
                  {nextAppointment ? (
                    <>
                      Consultation with{" "}
                      <span className="font-semibold text-primary">
                        {nextAppointment.doctorName}
                      </span>
                    </>
                  ) : (
                    "No upcoming appointments scheduled."
                  )}
                </p>

                <div className="flex flex-wrap items-center gap-4 md:gap-6 mb-6">
                  <div className="flex items-center gap-2 font-medium text-sm text-gray-700">
                    <Calendar size={16} className="text-primary" />
                    {nextAppointment
                      ? new Date(nextAppointment.date).toLocaleDateString(
                          "en-US",
                          { month: "short", day: "numeric", year: "numeric" },
                        )
                      : "N/A"}
                  </div>

                  <div className="flex items-center gap-2 font-medium text-sm text-gray-700">
                    <Clock size={16} className="text-primary" />
                    {nextAppointment ? nextAppointment.timeSlot : "N/A"}
                  </div>
                </div>

                {nextAppointment &&
                  ["accepted", "confirmed"].includes(nextAppointment.status) &&
                  (canJoin ? (
                    <button
                      onClick={() => handleJoinSession(nextAppointment)}
                      className="text-white px-5 py-2.5 rounded-md font-semibold flex items-center gap-2 shadow-sm text-sm"
                      style={{ background: "#006063" }}
                    >
                      <Video size={16} />
                      Join Video Room
                    </button>
                  ) : (
                    <button
                      disabled
                      className="text-white px-5 py-2.5 rounded-md font-semibold flex items-center gap-2 shadow-sm text-sm opacity-50 cursor-not-allowed"
                      style={{ background: "#006063" }}
                    >
                      <Video size={16} />
                      Join available 30 mins before
                    </button>
                  ))}

                {nextAppointment &&
                  !canJoin &&
                  ["accepted", "confirmed"].includes(
                    nextAppointment.status,
                  ) && (
                    <span className="text-xs font-medium text-gray-500">
                      You can join 30 minutes before the appointment
                    </span>
                  )}

                {nextAppointment &&
                  nextAppointment.status !== "confirmed" &&
                  nextAppointment.status !== "accepted" && (
                    <span className="text-xs font-medium text-amber-600 bg-amber-50 px-3 py-1.5 rounded border border-amber-100 block w-fit">
                      Waiting for doctor confirmation...
                    </span>
                  )}
              </div>

              <div className="relative w-full md:w-42 h-42 rounded-full overflow-hidden shrink-0 border border-gray-800">
                <img
                  alt="Doctor"
                  className="w-full h-full object-cover"
                  src="/user.png"
                />
              </div>
            </div>

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
                onClick={() => navigate("/symptom-checker")}
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

          <aside className="lg:col-span-4">
            <div className="bg-white border border-gray-200 rounded-xl p-6 h-full shadow-sm max-h-125 overflow-y-auto hover:scrollbar-thin">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-headline font-semibold text-lg text-gray-900">
                  My Appointments
                </h3>
              </div>

              <div className="space-y-6 relative">
                {myAppointments.length > 0 ? (
                  myAppointments.map((app, i) => {
                    const appDate = new Date(app.date);

                    return (
                      <div
                        key={i}
                        className="relative flex gap-4 p-3 border border-gray-100 rounded-lg hover:border-primary/30 transition-colors shadow-sm"
                      >
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20">
                          <Calendar size={16} className="text-primary" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start gap-2">
                            <p className="text-sm font-bold text-gray-900 truncate">
                              {app.doctorName}
                            </p>

                            <span
                              className={`shrink-0 text-[10px] font-bold px-3 py-0.5 rounded-full uppercase tracking-wider ${
                                app.status === "accepted"
                                  ? "bg-blue-100 text-blue-700"
                                  : app.status === "confirmed"
                                    ? "bg-green-100 text-green-700"
                                    : app.status === "cancelled"
                                      ? "bg-amber-100 text-amber-700"
                                      : app.status === "completed"
                                        ? "bg-blue-100 text-blue-700"
                                        : app.status === "rejected"
                                          ? "bg-red-100 text-red-700"
                                          : "bg-gray-100 text-gray-700"
                              }`}
                            >
                              {app.status}
                            </span>
                          </div>

                          <p className="text-[11px] text-gray-500 mt-1 uppercase tracking-wide font-semibold flex items-center gap-1.5">
                            <Clock size={10} className="shrink-0" />
                            {appDate.toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}{" "}
                            at {app.timeSlot}
                          </p>

                          <div className="flex justify-between items-center mt-1.5 pt-1.5 border-t border-gray-100">
                            <p className="text-xs text-gray-600 leading-relaxed truncate pr-2">
                              <span className="font-semibold text-gray-500">
                                Reason:
                              </span>{" "}
                              {app.reason || "Routine Checkup"}
                            </p>

                            <button
                              onClick={() => setSelectedAppointment(app)}
                              className="text-primary text-[10px] font-bold uppercase tracking-wider hover:underline shrink-0"
                            >
                              View
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8">
                    <Calendar
                      className="mx-auto text-gray-300 mb-2"
                      size={32}
                    />
                    <p className="text-sm text-gray-500">
                      No appointments found.
                    </p>
                  </div>
                )}
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

        {selectedAppointment && (
          <AppointmentModal
            appointment={selectedAppointment}
            onClose={() => setSelectedAppointment(null)}
            refresh={() => {
              window.location.reload();
            }}
          />
        )}
      </main>

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
      <Footer />
    </div>
  );
}
