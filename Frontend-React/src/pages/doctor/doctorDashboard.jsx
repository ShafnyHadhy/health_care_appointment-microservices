import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import Header from "../../components/header";
import Footer from "../../components/footer";
import {
  Calendar,
  Users,
  Clock,
  Stethoscope,
  FileText,
  Pill,
  Video,
  Loader2,
  User,
  CheckCircle,
  XCircle,
  PlusCircle,
  Search,
  Activity,
  HeartPulse,
  Star,
  Calendar as CalendarIcon,
  Clock as ClockIcon,
  Phone,
  Mail,
  X,
  Trash2,
  ChevronRight,
  LayoutDashboard,
  Lightbulb,
  Edit2,
  Save,
  MapPin,
  DollarSign,
  Eye,
  Download,
  CloudUpload,
  Bot,
  FlaskConical,
  ClipboardCheck,
  CheckCircle2,
  Footprints,
  Wind,
  HelpCircle,
  LineChart,
  LogOut,
  Home,
  Bell,
} from "lucide-react";

export default function DoctorDashboard() {
  const navigate = useNavigate();
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [user, setUser] = useState(null);
  const [doctor, setDoctor] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [prescriptionForm, setPrescriptionForm] = useState({
    medications: [
      { name: "", dosage: "", frequency: "", duration: "", instructions: "" },
    ],
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("overview");

  // View Reports State
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedReportPatient, setSelectedReportPatient] = useState(null);
  const [patientReports, setPatientReports] = useState([]);
  const [loadingReports, setLoadingReports] = useState(false);

  // Availability State
  const [availability, setAvailability] = useState([]);
  const [loadingAvailability, setLoadingAvailability] = useState(false);
  const [isEditingAvailability, setIsEditingAvailability] = useState(false);
  const [editAvailability, setEditAvailability] = useState([]);

  const [showPrescriptionDetailsModal, setShowPrescriptionDetailsModal] =
    useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState(null);

  // Stats state
  const [stats, setStats] = useState({
    todayAppointments: 0,
    totalPatients: 0,
    totalPrescriptions: 0,
    pendingAppointments: 0,
    completedAppointments: 0,
    rating: 0,
  });

  // Helper function to safely extract array from response
  const safelyExtractArray = (response, fallback = []) => {
    if (!response) return fallback;
    if (Array.isArray(response)) return response;
    if (response.data && Array.isArray(response.data)) return response.data;
    if (response.patients && Array.isArray(response.patients))
      return response.patients;
    if (response.appointments && Array.isArray(response.appointments))
      return response.appointments;
    if (response.prescriptions && Array.isArray(response.prescriptions))
      return response.prescriptions;
    return fallback;
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      if (parsedUser.role !== "doctor") {
        toast.error("Access denied. Doctor only area.");
        navigate("/login");
      }
    }
    if (!token) {
      navigate("/login");
    } else {
      fetchDoctorProfile();
      fetchAppointments();
      fetchPatients();
      fetchPrescriptions();
      fetchAvailability();
    }
  }, [token, navigate]);

  // Fetch Doctor Profile
  const fetchDoctorProfile = async () => {
    try {
      const response = await axios.get(
        "http://localhost:3002/api/doctors/profile",
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setDoctor(response.data);
      setStats((prev) => ({ ...prev, rating: response.data?.rating || 4.5 }));
    } catch (error) {
      console.error("Error fetching doctor:", error);
      if (error.response?.status === 401) {
        localStorage.clear();
        navigate("/login");
      }
    }
  };

  // Fetch Appointments with error handling
  const fetchAppointments = async () => {
    try {
      const response = await axios
        .get("http://localhost:3003/api/appointments", {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 5000,
        })
        .catch((err) => {
          if (err.code === "ECONNREFUSED") {
            console.warn("⚠️ Appointment service not available on port 3003");
            return { data: [] };
          }
          throw err;
        });

      const appointmentsData = safelyExtractArray(response, []);
      setAppointments(appointmentsData);

      const today = new Date().toDateString();
      const todayAppts = appointmentsData.filter(
        (a) => a.date && new Date(a.date).toDateString() === today,
      );

      setStats((prev) => ({
        ...prev,
        todayAppointments: todayAppts.length,
        pendingAppointments: appointmentsData.filter(
          (a) => a.status === "pending",
        ).length,
        completedAppointments: appointmentsData.filter(
          (a) => a.status === "completed",
        ).length,
      }));
    } catch (error) {
      console.error("Error fetching appointments:", error);
      setAppointments([]);
    }
  };

  // Fetch Patients with error handling
  const fetchPatients = async () => {
    try {
      const response = await axios
        .get("http://localhost:3001/api/patients", {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 5000,
        })
        .catch((err) => {
          if (err.code === "ECONNREFUSED") {
            console.warn("⚠️ Patient service not available on port 3001");
            return { data: [] };
          }
          throw err;
        });

      const patientsData = safelyExtractArray(response, []);
      setPatients(patientsData);
      setStats((prev) => ({ ...prev, totalPatients: patientsData.length }));
    } catch (error) {
      console.error("Error fetching patients:", error);
      setPatients([]);
    }
  };

  // Fetch Prescriptions with error handling
  const fetchPrescriptions = async () => {
    try {
      const response = await axios
        .get("http://localhost:3002/api/doctors/prescriptions", {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 5000,
        })
        .catch((err) => {
          if (err.code === "ECONNREFUSED") {
            console.warn("⚠️ Doctor service not available");
            return { data: [] };
          }
          throw err;
        });

      const prescriptionsData = safelyExtractArray(response, []);
      setPrescriptions(prescriptionsData);
      setStats((prev) => ({
        ...prev,
        totalPrescriptions: prescriptionsData.length,
      }));
    } catch (error) {
      console.error("Error fetching prescriptions:", error);
      setPrescriptions([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Patient Reports
  const fetchPatientReports = async (patient) => {
    setLoadingReports(true);
    setSelectedReportPatient(patient);
    try {
      const response = await axios.get(
        `http://localhost:3001/api/patients/patients/${patient._id}/medical-reports`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setPatientReports(response.data?.reports || []);
      setShowReportModal(true);
    } catch (error) {
      console.error("Error fetching reports:", error);
      toast.error("Failed to load patient reports");
      setPatientReports([]);
      setShowReportModal(true);
    } finally {
      setLoadingReports(false);
    }
  };

  // Fetch Availability
  const fetchAvailability = async () => {
    setLoadingAvailability(true);
    try {
      const response = await axios
        .get("http://localhost:3002/api/doctors/availability", {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 5000,
        })
        .catch(() => ({ data: [] }));

      let availabilityData = response.data || [];

      if (availabilityData && availabilityData.length > 0) {
        setAvailability(availabilityData);
        setEditAvailability(availabilityData);
      } else {
        const defaultAvailability = [
          {
            day: "Monday",
            startTime: "09:00",
            endTime: "17:00",
            isAvailable: true,
          },
          {
            day: "Tuesday",
            startTime: "09:00",
            endTime: "17:00",
            isAvailable: true,
          },
          {
            day: "Wednesday",
            startTime: "09:00",
            endTime: "17:00",
            isAvailable: true,
          },
          {
            day: "Thursday",
            startTime: "09:00",
            endTime: "17:00",
            isAvailable: true,
          },
          {
            day: "Friday",
            startTime: "09:00",
            endTime: "17:00",
            isAvailable: true,
          },
          {
            day: "Saturday",
            startTime: "09:00",
            endTime: "13:00",
            isAvailable: false,
          },
          {
            day: "Sunday",
            startTime: "09:00",
            endTime: "13:00",
            isAvailable: false,
          },
        ];
        setAvailability(defaultAvailability);
        setEditAvailability(defaultAvailability);
      }
    } catch (error) {
      console.error("Error fetching availability:", error);
    } finally {
      setLoadingAvailability(false);
    }
  };

  // Update Availability
  const handleUpdateAvailability = async () => {
    setSubmitting(true);
    try {
      await axios.put(
        "http://localhost:3002/api/doctors/availability",
        { availability: editAvailability },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setAvailability(editAvailability);
      setIsEditingAvailability(false);
      toast.success("Availability updated successfully!");
    } catch (error) {
      console.error("Error updating availability:", error);
      toast.error("Failed to update availability");
    } finally {
      setSubmitting(false);
    }
  };

  const toggleDayAvailability = (index) => {
    const newAvailability = [...editAvailability];
    newAvailability[index].isAvailable = !newAvailability[index].isAvailable;
    setEditAvailability(newAvailability);
  };

  const updateTime = (index, field, value) => {
    const newAvailability = [...editAvailability];
    newAvailability[index][field] = value;
    setEditAvailability(newAvailability);
  };

  const addAvailabilitySlot = () => {
    setEditAvailability([
      ...editAvailability,
      {
        day: "Monday",
        startTime: "09:00",
        endTime: "17:00",
        isAvailable: true,
      },
    ]);
  };

  const removeAvailabilitySlot = (index) => {
    const newAvailability = editAvailability.filter((_, i) => i !== index);
    setEditAvailability(newAvailability);
  };

  // Accept Appointment
  const handleAcceptAppointment = async (appointmentId) => {
    try {
      await axios.put(
        `http://localhost:3002/api/doctors/appointments/${appointmentId}/status`,
        { status: "confirmed" },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      toast.success("Appointment accepted!");
      fetchAppointments();
    } catch (error) {
      toast.error("Failed to accept appointment");
    }
  };

  // Reject Appointment
  const handleRejectAppointment = async (appointmentId) => {
    try {
      await axios.put(
        `http://localhost:3002/api/doctors/appointments/${appointmentId}/status`,
        { status: "cancelled" },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      toast.success("Appointment rejected");
      fetchAppointments();
    } catch (error) {
      toast.error("Failed to reject appointment");
    }
  };

  // Prescription functions
  const handleAddMedication = () => {
    setPrescriptionForm({
      ...prescriptionForm,
      medications: [
        ...prescriptionForm.medications,
        { name: "", dosage: "", frequency: "", duration: "", instructions: "" },
      ],
    });
  };

  const handleRemoveMedication = (index) => {
    const newMedications = prescriptionForm.medications.filter(
      (_, i) => i !== index,
    );
    setPrescriptionForm({ ...prescriptionForm, medications: newMedications });
  };

  const handleMedicationChange = (index, field, value) => {
    const newMedications = [...prescriptionForm.medications];
    newMedications[index][field] = value;
    setPrescriptionForm({ ...prescriptionForm, medications: newMedications });
  };

  const handleIssuePrescription = async () => {
    if (!selectedPatient) return;

    setSubmitting(true);
    try {
      await axios.post(
        "http://localhost:3002/api/doctors/prescriptions",
        {
          patientId: selectedPatient._id,
          medications: prescriptionForm.medications.filter((m) => m.name),
          notes: prescriptionForm.notes,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      toast.success("Prescription issued successfully!");
      setShowPrescriptionModal(false);
      setPrescriptionForm({
        medications: [
          {
            name: "",
            dosage: "",
            frequency: "",
            duration: "",
            instructions: "",
          },
        ],
        notes: "",
      });
      fetchPrescriptions();
    } catch (error) {
      toast.error("Failed to issue prescription");
    } finally {
      setSubmitting(false);
    }
  };

  // Safe filtered data
  const filteredPatients = Array.isArray(patients)
    ? patients.filter(
        (p) =>
          p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.phone?.includes(searchTerm),
      )
    : [];

  const filteredAppointments = Array.isArray(appointments)
    ? appointments.filter((a) =>
        a.patientName?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    : [];

  const getRecentActivity = () => {
    const activities = [];

    if (Array.isArray(appointments)) {
      appointments
        .filter((a) => a.status === "completed")
        .slice(0, 2)
        .forEach((apt) => {
          activities.push({
            icon: <CheckCircle size={18} className="text-green-500" />,
            title: "Appointment Completed",
            desc: `${apt.patientName || "Patient"}'s appointment completed`,
            time: apt.date ? new Date(apt.date).toLocaleDateString() : "Recent",
          });
        });
    }

    if (Array.isArray(prescriptions)) {
      prescriptions.slice(0, 2).forEach((pres) => {
        activities.push({
          icon: <Pill size={18} className="text-teal-600" />,
          title: "Prescription Issued",
          desc: `Prescription issued for ${pres.patientName || "patient"}`,
          time: pres.issuedAt
            ? new Date(pres.issuedAt).toLocaleDateString()
            : "Recent",
        });
      });
    }

    return activities.slice(0, 4);
  };

  const metrics = [
    {
      icon: <HeartPulse size={24} />,
      label: "Today's Patients",
      val: stats.todayAppointments,
      unit: "visits",
    },
    {
      icon: <Users size={24} />,
      label: "Total Patients",
      val: stats.totalPatients,
      unit: "patients",
    },
    {
      icon: <Pill size={24} />,
      label: "Prescriptions",
      val: stats.totalPrescriptions,
      unit: "issued",
    },
    {
      icon: <Star size={24} />,
      label: "Rating",
      val: stats.rating.toFixed(1),
      unit: "/5",
    },
  ];

  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-teal-600" size={48} />
      </div>
    );
  }

  return (
    <div className="bg-gray-50 font-body text-on-surface min-h-screen">
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-6 md:px-8 pb-20">
        {/* Welcome Header */}
        <div className="mb-6 rounded-2xl bg-linear-to-r from-teal-500 to-teal-700 p-6 text-white shadow-lg">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-teal-100">Welcome Back</p>
              <h1 className="text-2xl font-bold md:text-3xl">
                Dr. {doctor?.name || "Doctor"}
              </h1>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-teal-100">
                <span>{doctor?.specialty || "General Physician"}</span>
                <span>•</span>
                <span>
                  {doctor?.qualifications?.join(", ") || "Medical Professional"}
                </span>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="rounded-xl bg-white/20 px-4 py-2 text-center backdrop-blur-sm">
                <div className="flex items-center justify-center gap-1">
                  <Star size={14} className="text-yellow-300" />
                  <p className="text-2xl font-bold">
                    {stats.rating.toFixed(1)}
                  </p>
                </div>
                <p className="text-xs">Rating</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === "overview"
                ? "text-teal-600 border-b-2 border-teal-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <LayoutDashboard size={16} className="inline mr-2" /> Overview
          </button>
          <button
            onClick={() => setActiveTab("appointments")}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === "appointments"
                ? "text-teal-600 border-b-2 border-teal-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Calendar size={16} className="inline mr-2" /> Appointments (
            {appointments.length})
          </button>
          <button
            onClick={() => setActiveTab("patients")}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === "patients"
                ? "text-teal-600 border-b-2 border-teal-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Users size={16} className="inline mr-2" /> Patients (
            {patients.length})
          </button>
          <button
            onClick={() => setActiveTab("prescriptions")}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === "prescriptions"
                ? "text-teal-600 border-b-2 border-teal-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Pill size={16} className="inline mr-2" /> Prescriptions (
            {prescriptions.length})
          </button>
          <button
            onClick={() => setActiveTab("availability")}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === "availability"
                ? "text-teal-600 border-b-2 border-teal-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Clock size={16} className="inline mr-2" /> Availability
          </button>
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
              {metrics.map((m, idx) => (
                <div
                  key={idx}
                  className="bg-white p-5 rounded-lg border border-gray-200 flex items-center gap-4 shadow-sm hover:border-teal-600/20 transition-colors"
                >
                  <div className="w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600">
                    {React.cloneElement(m.icon, { size: 22 })}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      {m.label}
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {m.val}{" "}
                      <span className="text-xs font-medium text-gray-500">
                        {m.unit}
                      </span>
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <section className="lg:col-span-8">
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="font-headline font-semibold text-lg text-gray-900">
                      Today's Appointments
                    </h3>
                  </div>
                  <div className="divide-y divide-gray-200">
                    {Array.isArray(appointments) &&
                    appointments.filter(
                      (a) =>
                        a.date &&
                        new Date(a.date).toDateString() ===
                          new Date().toDateString(),
                    ).length > 0 ? (
                      appointments
                        .filter(
                          (a) =>
                            a.date &&
                            new Date(a.date).toDateString() ===
                              new Date().toDateString(),
                        )
                        .map((apt) => (
                          <div
                            key={apt._id}
                            className="p-4 hover:bg-gray-50 transition-colors"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex items-start gap-3">
                                <div className="w-10 h-10 bg-teal-50 rounded-full flex items-center justify-center">
                                  <User size={20} className="text-teal-600" />
                                </div>
                                <div>
                                  <p className="font-semibold text-gray-900">
                                    {apt.patientName || "Patient"}
                                  </p>
                                  <div className="flex items-center gap-3 mt-1">
                                    <span className="flex items-center gap-1 text-xs text-gray-500">
                                      <Clock size={12} />{" "}
                                      {apt.timeSlot || "N/A"}
                                    </span>
                                    <span
                                      className={`px-2 py-0.5 text-xs rounded-full ${
                                        apt.status === "confirmed"
                                          ? "bg-green-100 text-green-700"
                                          : apt.status === "pending"
                                            ? "bg-yellow-100 text-yellow-700"
                                            : "bg-gray-100 text-gray-700"
                                      }`}
                                    >
                                      {apt.status || "pending"}
                                    </span>
                                  </div>
                                  <p className="text-sm text-gray-600 mt-1">
                                    {apt.symptoms || "No symptoms provided"}
                                  </p>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                {apt.status === "pending" && (
                                  <>
                                    <button
                                      onClick={() =>
                                        handleAcceptAppointment(apt._id)
                                      }
                                      className="px-3 py-1.5 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700"
                                    >
                                      Accept
                                    </button>
                                    <button
                                      onClick={() =>
                                        handleRejectAppointment(apt._id)
                                      }
                                      className="px-3 py-1.5 bg-red-600 text-white text-xs rounded-lg hover:bg-red-700"
                                    >
                                      Reject
                                    </button>
                                  </>
                                )}
                                <button
                                  onClick={() => {
                                    setSelectedPatient({
                                      _id: apt.patientId,
                                      name: apt.patientName,
                                    });
                                    setShowPrescriptionModal(true);
                                  }}
                                  className="px-3 py-1.5 border border-teal-600 text-teal-600 text-xs rounded-lg hover:bg-teal-50"
                                >
                                  <Pill size={12} className="inline mr-1" /> Rx
                                </button>
                              </div>
                            </div>
                          </div>
                        ))
                    ) : (
                      <div className="p-8 text-center text-gray-500">
                        No appointments scheduled for today
                      </div>
                    )}
                  </div>
                </div>
              </section>

              <aside className="lg:col-span-4">
                <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="font-headline font-semibold text-lg text-gray-900">
                      Recent Activity
                    </h3>
                  </div>
                  <div className="space-y-6 relative">
                    <div className="absolute left-3.75 top-2 bottom-2 w-0.5 bg-gray-100"></div>
                    {getRecentActivity().map((item, i) => (
                      <div key={i} className="relative flex gap-4">
                        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shrink-0 z-10 border border-gray-200 shadow-sm">
                          {React.cloneElement(item.icon, { size: 14 })}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">
                            {item.title}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {item.desc}
                          </p>
                          <p className="text-[10px] text-teal-600 font-semibold mt-1 uppercase tracking-wide">
                            {item.time}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 bg-teal-50 border border-teal-100 p-4 rounded-lg">
                    <h4 className="font-semibold text-sm flex items-center gap-2 mb-1">
                      <Lightbulb size={16} className="text-teal-600" /> Practice
                      Summary
                    </h4>
                    <p className="text-xs text-gray-600">
                      You have {stats.pendingAppointments} pending appointments
                      and {stats.totalPatients} total patients.
                    </p>
                  </div>
                </div>
              </aside>
            </div>
          </>
        )}

        {/* Appointments Tab */}
        {activeTab === "appointments" && (
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="font-headline font-semibold text-lg text-gray-900">
                All Appointments
              </h3>
              <div className="relative">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  placeholder="Search appointments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm w-64 focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                />
              </div>
            </div>
            <div className="divide-y divide-gray-200">
              {filteredAppointments.length > 0 ? (
                filteredAppointments.map((apt) => (
                  <div
                    key={apt._id}
                    className="p-5 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-teal-50 rounded-full flex items-center justify-center">
                          <User size={24} className="text-teal-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {apt.patientName || "Patient"}
                          </h3>
                          <div className="flex items-center gap-4 mt-1">
                            <span className="flex items-center gap-1 text-xs text-gray-500">
                              <CalendarIcon size={12} />{" "}
                              {apt.date
                                ? new Date(apt.date).toLocaleDateString()
                                : "N/A"}
                            </span>
                            <span className="flex items-center gap-1 text-xs text-gray-500">
                              <ClockIcon size={12} /> {apt.timeSlot || "N/A"}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mt-2">
                            {apt.symptoms || "No symptoms"}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {apt.status === "pending" && (
                          <>
                            <button
                              onClick={() => handleAcceptAppointment(apt._id)}
                              className="px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700"
                            >
                              Accept
                            </button>
                            <button
                              onClick={() => handleRejectAppointment(apt._id)}
                              className="px-3 py-1.5 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => {
                            setSelectedPatient({
                              _id: apt.patientId,
                              name: apt.patientName,
                            });
                            setShowPrescriptionModal(true);
                          }}
                          className="px-3 py-1.5 border border-teal-600 text-teal-600 text-sm rounded-lg hover:bg-teal-50"
                        >
                          <Pill size={14} className="inline mr-1" /> Rx
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-gray-500">
                  {searchTerm
                    ? `No appointments found matching "${searchTerm}"`
                    : "No appointments found"}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Patients Tab */}
        {activeTab === "patients" && (
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h3 className="font-headline font-semibold text-lg text-gray-900">
                  My Patients
                </h3>
                <div className="relative w-full md:w-80">
                  <Search
                    size={16}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="text"
                    placeholder="Search by name, email or phone..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                  />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5">
              {filteredPatients.length > 0 ? (
                filteredPatients.map((patient) => (
                  <div
                    key={patient._id}
                    className="bg-gray-50 rounded-lg p-4 hover:shadow-md transition-shadow border border-gray-100"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center">
                        <User size={24} className="text-teal-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">
                          {patient.name || "Unknown"}
                        </h3>
                        <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                          <Mail size={10} /> {patient.email || "N/A"}
                        </p>
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                          <Phone size={10} /> {patient.phone || "N/A"}
                        </p>
                        <div className="flex flex-wrap gap-2 mt-3">
                          <button
                            onClick={() => {
                              setSelectedPatient(patient);
                              setShowPrescriptionModal(true);
                            }}
                            className="text-teal-600 text-xs hover:underline"
                          >
                            Issue Rx
                          </button>
                          <button
                            onClick={() => fetchPatientReports(patient)}
                            className="bg-teal-600 text-white text-xs px-3 py-1.5 rounded-lg hover:bg-teal-700 transition-colors flex items-center gap-1"
                          >
                            <FileText size={12} /> View Reports
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-2 p-8 text-center text-gray-500">
                  {searchTerm
                    ? `No patients found matching "${searchTerm}"`
                    : "No patients found"}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Prescriptions Tab */}
        {activeTab === "prescriptions" && (
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="font-headline font-semibold text-lg text-gray-900">
                My Prescriptions
              </h3>
            </div>
            <div className="divide-y divide-gray-200">
              {prescriptions.length > 0 ? (
                prescriptions.map((pres) => (
                  <div
                    key={pres._id}
                    className="p-5 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-teal-50 rounded-lg flex items-center justify-center">
                          <Pill size={20} className="text-teal-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            Patient: {pres.patientName || "Unknown"}
                          </p>
                          <p className="text-xs text-gray-500">
                            {pres.issuedAt
                              ? new Date(pres.issuedAt).toLocaleDateString()
                              : "Recent"}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedPrescription(pres);
                          setShowPrescriptionDetailsModal(true);
                        }}
                        className="text-teal-600 text-sm hover:underline flex items-center gap-1"
                      >
                        <Eye size={14} /> View Details
                      </button>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {pres.medications?.slice(0, 3).map((med, i) => (
                        <span
                          key={i}
                          className="px-2 py-1 bg-gray-100 rounded-md text-xs text-gray-600"
                        >
                          {med.name} ({med.dosage})
                        </span>
                      ))}
                      {pres.medications?.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 rounded-md text-xs text-gray-600">
                          +{pres.medications.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-gray-500">
                  No prescriptions issued yet
                </div>
              )}
            </div>
          </div>
        )}

        {/* Availability Tab */}
        {activeTab === "availability" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Working Hours
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Set your weekly availability for patient appointments
                </p>
              </div>
              {!isEditingAvailability ? (
                <button
                  onClick={() => {
                    setEditAvailability([...availability]);
                    setIsEditingAvailability(true);
                  }}
                  className="px-4 py-2 bg-teal-600 text-white rounded-lg text-sm hover:bg-teal-700 transition-colors flex items-center gap-2"
                >
                  <Edit2 size={16} /> Edit Schedule
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={handleUpdateAvailability}
                    disabled={submitting}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition-colors flex items-center gap-2"
                  >
                    {submitting ? (
                      <Loader2 className="animate-spin" size={16} />
                    ) : (
                      <Save size={16} />
                    )}
                    {submitting ? "Saving..." : "Save Changes"}
                  </button>
                  <button
                    onClick={() => {
                      setIsEditingAvailability(false);
                      setEditAvailability([...availability]);
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors flex items-center gap-2"
                  >
                    <X size={16} /> Cancel
                  </button>
                </div>
              )}
            </div>

            {loadingAvailability ? (
              <div className="flex justify-center py-12">
                <Loader2 className="animate-spin text-teal-600" size={32} />
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Day
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Start Time
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          End Time
                        </th>
                        {isEditingAvailability && (
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        )}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {(isEditingAvailability
                        ? editAvailability
                        : availability
                      ).map((slot, idx) => (
                        <tr
                          key={idx}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-6 py-4">
                            {isEditingAvailability ? (
                              <select
                                value={slot.day}
                                onChange={(e) =>
                                  updateTime(idx, "day", e.target.value)
                                }
                                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-teal-500"
                              >
                                {[
                                  "Monday",
                                  "Tuesday",
                                  "Wednesday",
                                  "Thursday",
                                  "Friday",
                                  "Saturday",
                                  "Sunday",
                                ].map((day) => (
                                  <option key={day} value={day}>
                                    {day}
                                  </option>
                                ))}
                              </select>
                            ) : (
                              <span className="font-medium text-gray-900">
                                {slot.day}
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            {isEditingAvailability ? (
                              <button
                                onClick={() => toggleDayAvailability(idx)}
                                className={`px-3 py-1 rounded-full text-xs font-medium ${slot.isAvailable ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-red-100 text-red-700 hover:bg-red-200"} transition-colors`}
                              >
                                {slot.isAvailable ? "Available" : "Unavailable"}
                              </button>
                            ) : (
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-medium ${slot.isAvailable ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                              >
                                {slot.isAvailable ? "Available" : "Unavailable"}
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            {isEditingAvailability ? (
                              <input
                                type="time"
                                value={slot.startTime}
                                onChange={(e) =>
                                  updateTime(idx, "startTime", e.target.value)
                                }
                                disabled={!slot.isAvailable}
                                className={`px-3 py-2 border border-gray-300 rounded-lg text-sm ${!slot.isAvailable ? "bg-gray-100 cursor-not-allowed" : ""}`}
                              />
                            ) : (
                              <span className="text-gray-600">
                                {slot.isAvailable ? slot.startTime : "-"}
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            {isEditingAvailability ? (
                              <input
                                type="time"
                                value={slot.endTime}
                                onChange={(e) =>
                                  updateTime(idx, "endTime", e.target.value)
                                }
                                disabled={!slot.isAvailable}
                                className={`px-3 py-2 border border-gray-300 rounded-lg text-sm ${!slot.isAvailable ? "bg-gray-100 cursor-not-allowed" : ""}`}
                              />
                            ) : (
                              <span className="text-gray-600">
                                {slot.isAvailable ? slot.endTime : "-"}
                              </span>
                            )}
                          </td>
                          {isEditingAvailability && (
                            <td className="px-6 py-4">
                              <button
                                onClick={() => removeAvailabilitySlot(idx)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <Trash2 size={18} />
                              </button>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {isEditingAvailability && (
                  <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                    <button
                      onClick={addAvailabilitySlot}
                      className="text-teal-600 text-sm flex items-center gap-1 hover:underline"
                    >
                      <PlusCircle size={16} /> Add New Slot
                    </button>
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle size={18} className="text-green-600" />
                  <span className="font-semibold text-green-800">
                    Available Days
                  </span>
                </div>
                <p className="text-2xl font-bold text-green-900">
                  {availability.filter((s) => s.isAvailable).length}
                </p>
                <p className="text-xs text-green-600 mt-1">days per week</p>
              </div>
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <Clock size={18} className="text-blue-600" />
                  <span className="font-semibold text-blue-800">
                    Weekly Hours
                  </span>
                </div>
                <p className="text-2xl font-bold text-blue-900">
                  {availability
                    .filter((s) => s.isAvailable)
                    .reduce((total, slot) => {
                      const start = parseInt(
                        slot.startTime?.split(":")[0] || 9,
                      );
                      const end = parseInt(slot.endTime?.split(":")[0] || 17);
                      return total + (end - start);
                    }, 0)}{" "}
                  hrs
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  total working hours
                </p>
              </div>
              <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar size={18} className="text-purple-600" />
                  <span className="font-semibold text-purple-800">
                    Next Available
                  </span>
                </div>
                <p className="text-lg font-bold text-purple-900">
                  {availability.find((s) => s.isAvailable)?.day || "Monday"}
                </p>
                <p className="text-xs text-purple-600 mt-1">next working day</p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Prescription Modal */}
      {showPrescriptionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">
                Issue Prescription
              </h2>
              <button
                onClick={() => setShowPrescriptionModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="bg-teal-50 rounded-lg p-4">
                <p className="font-medium text-teal-800">
                  Patient: {selectedPatient?.name}
                </p>
              </div>
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold text-gray-900">Medications</h3>
                  <button
                    onClick={handleAddMedication}
                    className="text-teal-600 text-sm flex items-center gap-1"
                  >
                    <PlusCircle size={14} /> Add Medicine
                  </button>
                </div>
                {prescriptionForm.medications.map((med, idx) => (
                  <div
                    key={idx}
                    className="border border-gray-200 rounded-lg p-4 mb-4"
                  >
                    <div className="flex justify-between mb-3">
                      <h4 className="font-medium text-gray-700">
                        Medicine {idx + 1}
                      </h4>
                      {idx > 0 && (
                        <button
                          onClick={() => handleRemoveMedication(idx)}
                          className="text-red-500 text-sm"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="text"
                        placeholder="Medicine Name"
                        value={med.name}
                        onChange={(e) =>
                          handleMedicationChange(idx, "name", e.target.value)
                        }
                        className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
                      />
                      <input
                        type="text"
                        placeholder="Dosage"
                        value={med.dosage}
                        onChange={(e) =>
                          handleMedicationChange(idx, "dosage", e.target.value)
                        }
                        className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
                      />
                      <input
                        type="text"
                        placeholder="Frequency"
                        value={med.frequency}
                        onChange={(e) =>
                          handleMedicationChange(
                            idx,
                            "frequency",
                            e.target.value,
                          )
                        }
                        className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
                      />
                      <input
                        type="text"
                        placeholder="Duration"
                        value={med.duration}
                        onChange={(e) =>
                          handleMedicationChange(
                            idx,
                            "duration",
                            e.target.value,
                          )
                        }
                        className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
                      />
                      <input
                        type="text"
                        placeholder="Instructions"
                        value={med.instructions}
                        onChange={(e) =>
                          handleMedicationChange(
                            idx,
                            "instructions",
                            e.target.value,
                          )
                        }
                        className="col-span-2 px-3 py-2 border border-gray-200 rounded-lg text-sm"
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Notes
                </label>
                <textarea
                  rows="3"
                  value={prescriptionForm.notes}
                  onChange={(e) =>
                    setPrescriptionForm({
                      ...prescriptionForm,
                      notes: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg resize-none"
                  placeholder="Add any additional notes..."
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowPrescriptionModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleIssuePrescription}
                  disabled={submitting}
                  className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50"
                >
                  {submitting ? (
                    <Loader2 className="animate-spin inline mr-2" size={16} />
                  ) : null}
                  Issue Prescription
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Reports Modal */}
      {showReportModal && selectedReportPatient && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[80vh] overflow-hidden flex flex-col">
            <div className="bg-linear-to-r from-teal-600 to-teal-700 px-6 py-4 text-white flex justify-between items-center">
              <div className="flex items-center gap-2">
                <FileText size={24} />
                <div>
                  <h2 className="text-xl font-bold">Patient Medical Reports</h2>
                  <p className="text-teal-100 text-sm">
                    {selectedReportPatient.name} • {selectedReportPatient.email}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowReportModal(false)}
                className="text-white/80 hover:text-white"
              >
                <X size={24} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              {loadingReports ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="animate-spin text-teal-600" size={40} />
                </div>
              ) : patientReports.length > 0 ? (
                <div className="space-y-4">
                  {patientReports.map((report, idx) => (
                    <div
                      key={idx}
                      className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center">
                            <FileText size={24} className="text-teal-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">
                              {report.originalName}
                            </p>
                            <p className="text-xs text-gray-500">
                              Uploaded on{" "}
                              {new Date(report.uploadDate).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <a
                            href={report.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 bg-teal-600 text-white text-sm rounded-lg hover:bg-teal-700 flex items-center gap-1"
                          >
                            <Eye size={14} /> View
                          </a>
                          <a
                            href={report.fileUrl}
                            download
                            className="px-3 py-1.5 border border-teal-600 text-teal-600 text-sm rounded-lg hover:bg-teal-50 flex items-center gap-1"
                          >
                            <Download size={14} /> Download
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-xl">
                  <FileText size={48} className="text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">
                    No medical reports found for this patient
                  </p>
                </div>
              )}
            </div>
            <div className="border-t border-gray-200 px-6 py-4 flex justify-end">
              <button
                onClick={() => setShowReportModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Prescription Details Modal */}
      {showPrescriptionDetailsModal && selectedPrescription && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="sticky top-0 bg-linear-to-r from-teal-600 to-teal-700 px-6 py-4 text-white flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Pill size={24} />
                <h2 className="text-xl font-bold">Prescription Details</h2>
              </div>
              <button
                onClick={() => setShowPrescriptionDetailsModal(false)}
                className="text-white/80 hover:text-white"
              >
                <X size={24} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4 pb-4 border-b">
                <div>
                  <p className="text-sm text-gray-500">Patient Name</p>
                  <p className="font-semibold text-gray-900">
                    {selectedPrescription.patientName || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Issued Date</p>
                  <p className="font-semibold text-gray-900">
                    {new Date(
                      selectedPrescription.issuedAt,
                    ).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Pill size={18} className="text-teal-600" /> Medications
                </h3>
                <div className="space-y-3">
                  {selectedPrescription.medications?.map((med, idx) => (
                    <div
                      key={idx}
                      className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-gray-800">
                          {med.name}
                        </h4>
                        <span className="text-sm text-gray-500">
                          {med.dosage}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                        <p>
                          <span className="font-medium">Frequency:</span>{" "}
                          {med.frequency}
                        </p>
                        <p>
                          <span className="font-medium">Duration:</span>{" "}
                          {med.duration}
                        </p>
                        {med.instructions && (
                          <p className="col-span-2 mt-2">
                            <span className="font-medium">Instructions:</span>{" "}
                            {med.instructions}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {selectedPrescription.notes && (
                <div className="mt-4 p-4 bg-amber-50 rounded-lg border border-amber-200">
                  <h3 className="font-semibold text-amber-800 mb-2 flex items-center gap-2">
                    <FileText size={16} /> Doctor's Notes
                  </h3>
                  <p className="text-amber-700">{selectedPrescription.notes}</p>
                </div>
              )}
              <div className="flex justify-end pt-4">
                <button
                  onClick={() => setShowPrescriptionDetailsModal(false)}
                  className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
