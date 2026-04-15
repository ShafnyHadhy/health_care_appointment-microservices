import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import Header from "../../components/header";
import Footer from "../../components/footer";
import {
  Pill,
  User,
  Stethoscope,
  Calendar,
  Clock,
  FileText,
  PlusCircle,
  Trash2,
  Edit2,
  Save,
  X,
  Search,
  Loader2,
  Eye,
  Printer,
  Download,
  Send,
  Phone,
  Mail,
  HeartPulse,
  Activity,
  Thermometer,
  Weight,
  ClipboardList,
  History,
  ArrowLeft,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

export default function PrescriptionManagerPage() {
  const navigate = useNavigate();
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("new");
  const [loading, setLoading] = useState(false);
  const [patients, setPatients] = useState([]);
  const [currentDoctor, setCurrentDoctor] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [prescriptions, setPrescriptions] = useState([]);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState(null);
  const [pageLoading, setPageLoading] = useState(true); // ✅ New loading state

  const [prescriptionForm, setPrescriptionForm] = useState({
    patientId: "",
    diagnosis: "",
    symptoms: "",
    temperature: "",
    bloodPressure: "",
    heartRate: "",
    weight: "",
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

  // ✅ Helper function to safely extract array from response
  const safelyExtractArray = (response, fallback = []) => {
    if (!response) return fallback;
    if (Array.isArray(response)) return response;
    if (response.data && Array.isArray(response.data)) return response.data;
    if (response.patients && Array.isArray(response.patients))
      return response.patients;
    if (response.doctors && Array.isArray(response.doctors))
      return response.doctors;
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
      Promise.all([
        fetchPatients(),
        fetchCurrentDoctor(),
        fetchPrescriptions(),
      ]).finally(() => setPageLoading(false));
    }
  }, [token, navigate]);

  // ✅ Fixed fetchPatients - safely handle response
  const fetchPatients = async () => {
    try {
      const response = await axios
        .get("http://localhost:3001/api/patients", {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 5000,
        })
        .catch((err) => {
          if (err.code === "ECONNREFUSED") {
            console.warn("⚠️ Patient service not available");
            return { data: [] };
          }
          throw err;
        });

      const patientsData = safelyExtractArray(response, []);
      setPatients(patientsData);
      console.log("✅ Patients loaded:", patientsData.length);
    } catch (error) {
      console.error("Error fetching patients:", error);
      setPatients([]);
    }
  };

  const fetchCurrentDoctor = async () => {
    try {
      const response = await axios
        .get("http://localhost:3002/api/doctors/profile", {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 5000,
        })
        .catch(() => ({ data: null }));

      setCurrentDoctor(response.data);
    } catch (error) {
      console.error("Error fetching current doctor:", error);
    }
  };

  const fetchPrescriptions = async () => {
    setLoading(true);
    try {
      const response = await axios
        .get("http://localhost:3002/api/doctors/prescriptions", {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 5000,
        })
        .catch(() => ({ data: [] }));

      const prescriptionsData = safelyExtractArray(response, []);
      setPrescriptions(prescriptionsData);
    } catch (error) {
      console.error("Error fetching prescriptions:", error);
      setPrescriptions([]);
    } finally {
      setLoading(false);
    }
  };

  // Delete Prescription
  const handleDeletePrescription = async (prescriptionId) => {
    if (!window.confirm("Are you sure you want to delete this prescription?")) {
      return;
    }

    try {
      await axios.delete(
        `http://localhost:3002/api/doctors/prescriptions/${prescriptionId}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      toast.success("Prescription deleted successfully!");
      fetchPrescriptions();
      setShowDetailsModal(false);
    } catch (error) {
      console.error("Error deleting prescription:", error);
      toast.error("Failed to delete prescription");
    }
  };

  // Update Prescription
  const handleUpdatePrescription = async () => {
    if (!editForm) return;

    setLoading(true);
    try {
      const response = await axios.put(
        `http://localhost:3002/api/doctors/prescriptions/${editForm._id}`,
        {
          medications: editForm.medications,
          notes: editForm.notes,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      if (response.status === 200) {
        toast.success("Prescription updated successfully!");
        setIsEditing(false);
        setEditForm(null);
        fetchPrescriptions();
        setShowDetailsModal(false);
      }
    } catch (error) {
      console.error("Error updating prescription:", error);
      toast.error("Failed to update prescription");
    } finally {
      setLoading(false);
    }
  };

  const handleEditMedicationChange = (index, field, value) => {
    const newMedications = [...editForm.medications];
    newMedications[index][field] = value;
    setEditForm({ ...editForm, medications: newMedications });
  };

  const handleEditAddMedication = () => {
    setEditForm({
      ...editForm,
      medications: [
        ...editForm.medications,
        {
          name: "",
          dosage: "",
          frequency: "",
          duration: "",
          instructions: "",
        },
      ],
    });
  };

  const handleEditRemoveMedication = (index) => {
    const newMedications = editForm.medications.filter((_, i) => i !== index);
    setEditForm({ ...editForm, medications: newMedications });
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setPrescriptionForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddMedication = () => {
    setPrescriptionForm({
      ...prescriptionForm,
      medications: [
        ...prescriptionForm.medications,
        {
          name: "",
          dosage: "",
          frequency: "",
          duration: "",
          instructions: "",
        },
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

  const handleSubmitPrescription = async () => {
    if (!prescriptionForm.patientId) {
      toast.error("Please select a patient");
      return;
    }

    if (
      prescriptionForm.medications.filter((m) => m.name.trim()).length === 0
    ) {
      toast.error("Please add at least one medication");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        "http://localhost:3002/api/doctors/prescriptions",
        {
          patientId: prescriptionForm.patientId,
          medications: prescriptionForm.medications.filter((m) =>
            m.name.trim(),
          ),
          notes: prescriptionForm.notes,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      if (response.status === 201) {
        toast.success("Prescription issued successfully!");
        setPrescriptionForm({
          patientId: "",
          diagnosis: "",
          symptoms: "",
          temperature: "",
          bloodPressure: "",
          heartRate: "",
          weight: "",
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
        setSelectedPatient(null);
        fetchPrescriptions();
        setActiveTab("history");
      }
    } catch (error) {
      console.error("Error submitting prescription:", error);
      toast.error(
        error.response?.data?.message || "Failed to issue prescription",
      );
    } finally {
      setLoading(false);
    }
  };

  // ✅ Fixed filteredPatients - safe check
  const filteredPatients = Array.isArray(patients)
    ? patients.filter(
        (p) =>
          p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.phone?.includes(searchTerm),
      )
    : [];

  const getStatusColor = (issuedAt) => {
    const issuedDate = new Date(issuedAt);
    const now = new Date();
    const daysDiff = (now - issuedDate) / (1000 * 60 * 60 * 24);
    if (daysDiff <= 7) return "bg-green-100 text-green-700";
    if (daysDiff <= 30) return "bg-yellow-100 text-yellow-700";
    return "bg-gray-100 text-gray-700";
  };

  const getStatusText = (issuedAt) => {
    const issuedDate = new Date(issuedAt);
    const now = new Date();
    const daysDiff = (now - issuedDate) / (1000 * 60 * 60 * 24);
    if (daysDiff <= 7) return "Recent";
    if (daysDiff <= 30) return "Active";
    return "Archived";
  };

  // ✅ Page loading state
  if (pageLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <Loader2 className="animate-spin text-teal-600" size={48} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-teal-600 to-teal-700 px-6 py-4 text-white">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <Pill size={28} />
                <div>
                  <h2 className="text-xl font-bold">Prescription Management</h2>
                  <p className="text-teal-100 text-sm">
                    Issue and manage patient prescriptions
                  </p>
                </div>
              </div>
              {currentDoctor && (
                <div className="bg-white/20 rounded-lg px-3 py-1.5">
                  <p className="text-sm font-medium">
                    Dr. {currentDoctor.name}
                  </p>
                  <p className="text-xs text-teal-100">
                    {currentDoctor.specialty}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="flex border-b border-gray-200 px-6">
            <button
              onClick={() => setActiveTab("new")}
              className={`px-4 py-3 text-sm font-medium transition-colors flex items-center gap-2 ${
                activeTab === "new"
                  ? "text-teal-600 border-b-2 border-teal-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <PlusCircle size={16} /> New Prescription
            </button>
            <button
              onClick={() => {
                fetchPrescriptions();
                setActiveTab("history");
              }}
              className={`px-4 py-3 text-sm font-medium transition-colors flex items-center gap-2 ${
                activeTab === "history"
                  ? "text-teal-600 border-b-2 border-teal-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <History size={16} /> Prescription History ({prescriptions.length}
              )
            </button>
          </div>

          <div className="p-6">
            {/* New Prescription Tab */}
            {activeTab === "new" && (
              <div className="space-y-6">
                {/* Current Doctor Info */}
                <div className="bg-teal-50 rounded-xl p-4 border border-teal-200">
                  <div className="flex items-center gap-3">
                    <Stethoscope size={24} className="text-teal-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">
                        Prescribing Doctor
                      </p>
                      <p className="font-semibold text-gray-900">
                        Dr. {currentDoctor?.name} ({currentDoctor?.specialty})
                      </p>
                      <p className="text-xs text-gray-500">
                        {currentDoctor?.email}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Patient Selection */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <User size={18} className="text-teal-600" /> Select Patient
                  </h3>
                  {!prescriptionForm.patientId ? (
                    <div>
                      <div className="relative">
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
                      <div className="mt-3 max-h-48 overflow-y-auto space-y-2">
                        {filteredPatients.length > 0 ? (
                          filteredPatients.map((patient) => (
                            <div
                              key={patient._id}
                              onClick={() => {
                                setPrescriptionForm((prev) => ({
                                  ...prev,
                                  patientId: patient._id,
                                }));
                                setSelectedPatient(patient);
                                setSearchTerm("");
                              }}
                              className="p-3 bg-white rounded-lg border border-gray-200 hover:border-teal-500 cursor-pointer transition-all hover:shadow-sm"
                            >
                              <p className="font-medium text-gray-900">
                                {patient.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {patient.email} • {patient.phone}
                              </p>
                            </div>
                          ))
                        ) : (
                          <div className="p-4 text-center text-gray-500">
                            {searchTerm
                              ? "No patients found"
                              : "Loading patients..."}
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-teal-50 rounded-lg p-3 flex justify-between items-center">
                      <div>
                        <p className="font-medium text-teal-800">
                          {selectedPatient?.name}
                        </p>
                        <p className="text-xs text-teal-600">
                          {selectedPatient?.email} • {selectedPatient?.phone}
                        </p>
                      </div>
                      <button
                        onClick={() =>
                          setPrescriptionForm((prev) => ({
                            ...prev,
                            patientId: "",
                          }))
                        }
                        className="text-teal-600 hover:text-teal-800"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  )}
                </div>

                {/* Medications Section */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                      <Pill size={18} className="text-teal-600" /> Medications *
                    </h3>
                    <button
                      onClick={handleAddMedication}
                      className="text-teal-600 text-sm flex items-center gap-1 hover:underline"
                    >
                      <PlusCircle size={14} /> Add Medicine
                    </button>
                  </div>
                  <div className="space-y-3">
                    {prescriptionForm.medications.map((med, idx) => (
                      <div
                        key={idx}
                        className="bg-white rounded-lg p-4 border border-gray-200"
                      >
                        <div className="flex justify-between items-center mb-3">
                          <h4 className="font-medium text-gray-700">
                            Medicine {idx + 1}
                          </h4>
                          {idx > 0 && (
                            <button
                              onClick={() => handleRemoveMedication(idx)}
                              className="text-red-500 text-sm hover:underline"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <input
                            type="text"
                            placeholder="Medicine Name *"
                            value={med.name}
                            onChange={(e) =>
                              handleMedicationChange(
                                idx,
                                "name",
                                e.target.value,
                              )
                            }
                            className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
                          />
                          <input
                            type="text"
                            placeholder="Dosage (e.g., 500mg)"
                            value={med.dosage}
                            onChange={(e) =>
                              handleMedicationChange(
                                idx,
                                "dosage",
                                e.target.value,
                              )
                            }
                            className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
                          />
                          <input
                            type="text"
                            placeholder="Frequency (e.g., Twice daily)"
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
                            placeholder="Duration (e.g., 5 days)"
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
                            className="col-span-1 md:col-span-2 px-3 py-2 border border-gray-200 rounded-lg text-sm"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Additional Notes */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Notes (Optional)
                  </label>
                  <textarea
                    name="notes"
                    value={prescriptionForm.notes}
                    onChange={handleFormChange}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg resize-none"
                    placeholder="Any additional instructions for the patient..."
                  />
                </div>

                {/* Submit Button */}
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    onClick={() => navigate("/doctor")}
                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmitPrescription}
                    disabled={loading}
                    className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 flex items-center gap-2"
                  >
                    {loading ? (
                      <Loader2 className="animate-spin" size={16} />
                    ) : (
                      <Send size={16} />
                    )}
                    {loading ? "Issuing..." : "Issue Prescription"}
                  </button>
                </div>
              </div>
            )}

            {/* Prescription History Tab */}
            {activeTab === "history" && (
              <div className="space-y-4">
                {loading ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="animate-spin text-teal-600" size={40} />
                  </div>
                ) : prescriptions.length > 0 ? (
                  prescriptions.map((pres, idx) => (
                    <div
                      key={pres._id}
                      className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center">
                            <Pill size={24} className="text-teal-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">
                              Prescription #{idx + 1}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(pres.issuedAt).toLocaleDateString()} at{" "}
                              {new Date(pres.issuedAt).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(pres.issuedAt)}`}
                          >
                            {getStatusText(pres.issuedAt)}
                          </span>
                        </div>
                      </div>

                      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Patient:</span>{" "}
                            {pres.patientName || "N/A"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Medications:</span>{" "}
                            {pres.medications?.length} items
                          </p>
                        </div>
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

                      <div className="mt-4 flex gap-2">
                        <button
                          onClick={() => {
                            setSelectedPrescription(pres);
                            setShowDetailsModal(true);
                            setIsEditing(false);
                          }}
                          className="text-teal-600 text-sm hover:underline flex items-center gap-1"
                        >
                          <Eye size={14} /> View Details
                        </button>
                        <button
                          onClick={() => {
                            setSelectedPrescription(pres);
                            setEditForm(JSON.parse(JSON.stringify(pres)));
                            setIsEditing(true);
                            setShowDetailsModal(true);
                          }}
                          className="text-blue-600 text-sm hover:underline flex items-center gap-1"
                        >
                          <Edit2 size={14} /> Edit
                        </button>
                        <button
                          onClick={() => handleDeletePrescription(pres._id)}
                          className="text-red-600 text-sm hover:underline flex items-center gap-1"
                        >
                          <Trash2 size={14} /> Delete
                        </button>
                        <button className="text-teal-600 text-sm hover:underline flex items-center gap-1">
                          <Printer size={14} /> Print
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 bg-gray-50 rounded-xl">
                    <Pill size={48} className="text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No prescriptions found</p>
                    <button
                      onClick={() => setActiveTab("new")}
                      className="mt-3 text-teal-600 text-sm hover:underline"
                    >
                      Create your first prescription
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />

      {/* Prescription Details Modal */}
      {showDetailsModal && selectedPrescription && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[85vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-teal-600 to-teal-700 px-6 py-4 text-white flex justify-between items-center">
              <div className="flex items-center gap-2">
                {isEditing ? <Edit2 size={24} /> : <Pill size={24} />}
                <h2 className="text-xl font-bold">
                  {isEditing ? "Edit Prescription" : "Prescription Details"}
                </h2>
              </div>
              <button
                onClick={() => {
                  setShowDetailsModal(false);
                  setIsEditing(false);
                  setEditForm(null);
                }}
                className="text-white/80 hover:text-white"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {!isEditing ? (
                <>
                  <div className="grid grid-cols-2 gap-4 pb-4 border-b">
                    <div>
                      <p className="text-sm text-gray-500">Prescription ID</p>
                      <p className="font-medium text-sm">
                        {selectedPrescription._id}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Issued Date</p>
                      <p className="font-medium">
                        {new Date(
                          selectedPrescription.issuedAt,
                        ).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">
                      Medications
                    </h3>
                    <div className="space-y-3">
                      {selectedPrescription.medications?.map((med, i) => (
                        <div key={i} className="bg-gray-50 rounded-lg p-4">
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
                                <span className="font-medium">
                                  Instructions:
                                </span>{" "}
                                {med.instructions}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {selectedPrescription.notes && (
                    <div className="mt-4 p-4 bg-amber-50 rounded-lg">
                      <h3 className="font-semibold text-amber-800 mb-2">
                        Doctor's Notes
                      </h3>
                      <p className="text-amber-700">
                        {selectedPrescription.notes}
                      </p>
                    </div>
                  )}

                  <div className="flex justify-end pt-4">
                    <button
                      onClick={() => setShowDetailsModal(false)}
                      className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
                    >
                      Close
                    </button>
                  </div>
                </>
              ) : (
                editForm && (
                  <>
                    <div>
                      <div className="flex justify-between items-center mb-3">
                        <h3 className="font-semibold text-gray-900">
                          Medications
                        </h3>
                        <button
                          onClick={handleEditAddMedication}
                          className="text-teal-600 text-sm flex items-center gap-1 hover:underline"
                        >
                          <PlusCircle size={14} /> Add Medicine
                        </button>
                      </div>
                      <div className="space-y-3">
                        {editForm.medications?.map((med, idx) => (
                          <div
                            key={idx}
                            className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                          >
                            <div className="flex justify-between items-center mb-3">
                              <h4 className="font-medium text-gray-700">
                                Medicine {idx + 1}
                              </h4>
                              {idx > 0 && (
                                <button
                                  onClick={() =>
                                    handleEditRemoveMedication(idx)
                                  }
                                  className="text-red-500 text-sm hover:underline"
                                >
                                  Remove
                                </button>
                              )}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <input
                                type="text"
                                placeholder="Medicine Name"
                                value={med.name}
                                onChange={(e) =>
                                  handleEditMedicationChange(
                                    idx,
                                    "name",
                                    e.target.value,
                                  )
                                }
                                className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
                              />
                              <input
                                type="text"
                                placeholder="Dosage"
                                value={med.dosage}
                                onChange={(e) =>
                                  handleEditMedicationChange(
                                    idx,
                                    "dosage",
                                    e.target.value,
                                  )
                                }
                                className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
                              />
                              <input
                                type="text"
                                placeholder="Frequency"
                                value={med.frequency}
                                onChange={(e) =>
                                  handleEditMedicationChange(
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
                                  handleEditMedicationChange(
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
                                  handleEditMedicationChange(
                                    idx,
                                    "instructions",
                                    e.target.value,
                                  )
                                }
                                className="col-span-1 md:col-span-2 px-3 py-2 border border-gray-200 rounded-lg text-sm"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Notes
                      </label>
                      <textarea
                        value={editForm.notes || ""}
                        onChange={(e) =>
                          setEditForm({ ...editForm, notes: e.target.value })
                        }
                        rows="3"
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg resize-none"
                        placeholder="Additional notes..."
                      />
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                      <button
                        onClick={() => {
                          setIsEditing(false);
                          setEditForm(null);
                        }}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleUpdatePrescription}
                        disabled={loading}
                        className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 flex items-center gap-2"
                      >
                        {loading ? (
                          <Loader2 className="animate-spin" size={16} />
                        ) : (
                          <Save size={16} />
                        )}
                        Save Changes
                      </button>
                    </div>
                  </>
                )
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
