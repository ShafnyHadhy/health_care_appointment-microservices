import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Header from "../components/Header";
import Footer from "../components/footer";
import {
  User,
  Mail,
  Phone,
  Stethoscope,
  Calendar,
  MapPin,
  DollarSign,
  Clock,
  Loader2,
  Edit2,
  Save,
  X,
  HeartPulse,
  Activity,
  Briefcase,
  FileText,
  ChevronRight,
  Lock,
  Smartphone,
  Bell,
  Shield,
  Users,
  Verified,
  Star,
  Pill,
} from "lucide-react";
import toast from "react-hot-toast";

export default function ProfilePage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [stats, setStats] = useState([]);
  const [statsLoading, setStatsLoading] = useState(true);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loadingPrescriptions, setLoadingPrescriptions] = useState(false);

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userRole = user.role;

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    fetchProfile();
    fetchStats();
    fetchPrescriptions();
  }, []);

  const fetchProfile = async () => {
    try {
      let response;
      if (userRole === "patient") {
        response = await axios.get(
          "http://localhost:3001/api/patients/profile",
          { headers: { Authorization: `Bearer ${token}` } },
        );
      } else if (userRole === "doctor") {
        response = await axios.get(
          "http://localhost:3002/api/doctors/profile",
          { headers: { Authorization: `Bearer ${token}` } },
        );
      }
      setProfile(response.data);
      setEditForm(response.data);
    } catch (err) {
      console.error("Error fetching profile:", err);
      toast.error("Failed to load profile");
      if (err.response?.status === 401) {
        localStorage.clear();
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch real stats data
  const fetchStats = async () => {
    setStatsLoading(true);
    try {
      if (userRole === "patient") {
        // Fetch patient appointments count
        const appointmentsRes = await axios
          .get(
            "http://localhost:3003/api/appointments/patient/" +
              (profile?._id || user?.id),
            { headers: { Authorization: `Bearer ${token}` } },
          )
          .catch(() => ({ data: [] }));

        // Fetch patient reports count
        const reportsRes = await axios
          .get("http://localhost:3001/api/patients/reports", {
            headers: { Authorization: `Bearer ${token}` },
          })
          .catch(() => ({ data: { reports: [] } }));

        const appointmentsCount = appointmentsRes.data?.length || 0;
        const reportsCount = reportsRes.data?.reports?.length || 0;

        setStats([
          {
            icon: <Calendar size={18} />,
            label: "Appointments",
            value: appointmentsCount.toString(),
            change: "+0",
          },
          {
            icon: <FileText size={18} />,
            label: "Reports",
            value: reportsCount.toString(),
            change: "+0",
          },
          {
            icon: <HeartPulse size={18} />,
            label: "Health Score",
            value: "92",
            change: "+5%",
          },
          {
            icon: <Activity size={18} />,
            label: "Status",
            value: "Active",
            change: "Good",
          },
        ]);
      } else if (userRole === "doctor") {
        // Fetch doctor appointments count
        const appointmentsRes = await axios
          .get(
            "http://localhost:3003/api/appointments/doctor/" +
              (profile?._id || user?.id),
            { headers: { Authorization: `Bearer ${token}` } },
          )
          .catch(() => ({ data: [] }));

        // Fetch doctor's patients count (unique patients from appointments)
        const appointments = appointmentsRes.data || [];
        const uniquePatients = [
          ...new Set(appointments.map((apt) => apt.patientId)),
        ];

        const appointmentsCount = appointments.length;
        const patientsCount = uniquePatients.length;

        setStats([
          {
            icon: <Calendar size={18} />,
            label: "Appointments",
            value: appointmentsCount.toString(),
            change: "+0",
          },
          {
            icon: <Users size={18} />,
            label: "Total Patients",
            value: patientsCount.toString(),
            change: "+0",
          },
          {
            icon: <Stethoscope size={18} />,
            label: "Experience",
            value: profile?.experience || "5",
            change: "Years",
          },
          {
            icon: <Star size={18} />,
            label: "Rating",
            value: profile?.rating?.toString() || "4.8",
            change: "+0",
          },
        ]);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
      // Set default stats if fetch fails
      if (userRole === "patient") {
        setStats([
          {
            icon: <Calendar size={18} />,
            label: "Appointments",
            value: "0",
            change: "+0",
          },
          {
            icon: <FileText size={18} />,
            label: "Reports",
            value: "0",
            change: "+0",
          },
          {
            icon: <HeartPulse size={18} />,
            label: "Health Score",
            value: "92",
            change: "+5%",
          },
          {
            icon: <Activity size={18} />,
            label: "Status",
            value: "Active",
            change: "Good",
          },
        ]);
      } else {
        setStats([
          {
            icon: <Calendar size={18} />,
            label: "Appointments",
            value: "0",
            change: "+0",
          },
          {
            icon: <Users size={18} />,
            label: "Total Patients",
            value: "0",
            change: "+0",
          },
          {
            icon: <Stethoscope size={18} />,
            label: "Experience",
            value: profile?.experience || "5",
            change: "Years",
          },
          {
            icon: <Star size={18} />,
            label: "Rating",
            value: profile?.rating?.toString() || "4.8",
            change: "+0",
          },
        ]);
      }
    } finally {
      setStatsLoading(false);
    }
  };

  // Fetch prescriptions
  const fetchPrescriptions = async () => {
    if (userRole !== "patient") return;

    setLoadingPrescriptions(true);
    try {
      const response = await axios.get(
        "http://localhost:3001/api/patients/prescriptions",
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setPrescriptions(response.data.prescriptions || []);
    } catch (error) {
      console.error("Error fetching prescriptions:", error);
    } finally {
      setLoadingPrescriptions(false);
    }
  };

  // Refresh stats when profile updates
  useEffect(() => {
    if (profile) {
      fetchStats();
    }
  }, [profile]);

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      let response;
      if (userRole === "patient") {
        response = await axios.put(
          "http://localhost:3001/api/patients/profile",
          editForm,
          { headers: { Authorization: `Bearer ${token}` } },
        );
      } else if (userRole === "doctor") {
        response = await axios.put(
          "http://localhost:3002/api/doctors/profile",
          editForm,
          { headers: { Authorization: `Bearer ${token}` } },
        );
      }
      setProfile(editForm);
      setIsEditing(false);
      toast.success("Profile updated successfully!");
      fetchStats();
    } catch (err) {
      console.error("Error updating profile:", err);
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <Loader2 className="animate-spin text-teal-600" size={48} />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header with Cover Image */}
        <div className="relative mb-8">
          {/* Profile Avatar */}
          <div className="absolute -bottom-12 left-6 md:left-8">
            <div className="w-24 h-24 md:w-28 md:h-28 rounded-2xl bg-white shadow-lg flex items-center justify-center border-4 border-white">
              <div className="w-full h-full rounded-xl bg-gradient-to-br from-teal-100 to-teal-200 flex items-center justify-center">
                <span className="text-3xl md:text-4xl font-bold text-teal-600">
                  {profile?.name?.charAt(0) || "U"}
                </span>
              </div>
            </div>
          </div>

          {/* Profile Info */}
          <div className="ml-32 md:ml-40 pt-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-gray-900">
                  {profile?.name}
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <span className="px-2 py-0.5 bg-teal-100 text-teal-700 text-xs rounded-full capitalize">
                    {userRole}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-green-600">
                    <Verified size={12} /> Active
                  </span>
                </div>
                <p className="text-gray-500 text-sm mt-1">{profile?.email}</p>
              </div>

              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="mt-4 md:mt-0 flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-colors shadow-sm"
                >
                  <Edit2 size={16} />
                  Edit Profile
                </button>
              ) : (
                <div className="mt-4 md:mt-0 flex gap-2">
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setEditForm(profile);
                    }}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <X size={16} />
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-colors disabled:opacity-50"
                  >
                    {saving ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Save size={16} />
                    )}
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats Cards - Real Data */}
        {!statsLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {stats.map((stat, idx) => (
              <div
                key={idx}
                className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-10 h-10 bg-teal-50 rounded-lg flex items-center justify-center text-teal-600">
                    {stat.icon}
                  </div>
                  <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                    {stat.change}
                  </span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 animate-pulse"
              >
                <div className="w-10 h-10 bg-gray-200 rounded-lg mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-16 mb-1"></div>
                <div className="h-4 bg-gray-200 rounded w-20"></div>
              </div>
            ))}
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="border-b border-gray-200 overflow-x-auto">
            <div className="flex">
              <button
                onClick={() => setActiveTab("profile")}
                className={`px-6 py-3 text-sm font-medium transition-colors whitespace-nowrap ${
                  activeTab === "profile"
                    ? "text-teal-600 border-b-2 border-teal-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <User size={16} className="inline mr-2" />
                Profile Information
              </button>
              <button
                onClick={() => setActiveTab("medical")}
                className={`px-6 py-3 text-sm font-medium transition-colors whitespace-nowrap ${
                  activeTab === "medical"
                    ? "text-teal-600 border-b-2 border-teal-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <HeartPulse size={16} className="inline mr-2" />
                Medical Info
              </button>
              <button
                onClick={() => setActiveTab("prescriptions")}
                className={`px-6 py-3 text-sm font-medium transition-colors whitespace-nowrap ${
                  activeTab === "prescriptions"
                    ? "text-teal-600 border-b-2 border-teal-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <Pill size={16} className="inline mr-2" /> Prescriptions
              </button>
              <button
                onClick={() => setActiveTab("security")}
                className={`px-6 py-3 text-sm font-medium transition-colors whitespace-nowrap ${
                  activeTab === "security"
                    ? "text-teal-600 border-b-2 border-teal-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <Lock size={16} className="inline mr-2" />
                Security
              </button>
              <button
                onClick={() => setActiveTab("activity")}
                className={`px-6 py-3 text-sm font-medium transition-colors whitespace-nowrap ${
                  activeTab === "activity"
                    ? "text-teal-600 border-b-2 border-teal-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <Activity size={16} className="inline mr-2" />
                Activity
              </button>
            </div>
          </div>

          <div className="p-6">
            {/* Profile Information Tab - Same as before */}
            {activeTab === "profile" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <User size={16} className="text-teal-600" />
                      Full Name
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="name"
                        value={editForm.name || ""}
                        onChange={handleEditChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                      />
                    ) : (
                      <p className="text-gray-900">
                        {profile?.name || "Not set"}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <Mail size={16} className="text-teal-600" />
                      Email Address
                    </label>
                    <p className="text-gray-900">{profile?.email}</p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <Phone size={16} className="text-teal-600" />
                      Phone Number
                    </label>
                    {isEditing ? (
                      <input
                        type="tel"
                        name="phone"
                        value={editForm.phone || ""}
                        onChange={handleEditChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      />
                    ) : (
                      <p className="text-gray-900">
                        {profile?.phone || "Not set"}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <MapPin size={16} className="text-teal-600" />
                      Location
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="location"
                        value={editForm.location || ""}
                        onChange={handleEditChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        placeholder="City, Country"
                      />
                    ) : (
                      <p className="text-gray-900">
                        {profile?.location || "Not set"}
                      </p>
                    )}
                  </div>
                </div>

                {userRole === "doctor" && (
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Briefcase size={20} className="text-teal-600" />
                      Professional Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">
                          Specialization
                        </label>
                        {isEditing ? (
                          <select
                            name="specialty"
                            value={editForm.specialty || ""}
                            onChange={handleEditChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                          >
                            <option value="">Select Specialization</option>
                            <option value="Cardiologist">Cardiologist</option>
                            <option value="Dermatologist">Dermatologist</option>
                            <option value="Neurologist">Neurologist</option>
                            <option value="Pediatrician">Pediatrician</option>
                            <option value="General Physician">
                              General Physician
                            </option>
                          </select>
                        ) : (
                          <p className="text-gray-900">
                            {profile?.specialty || "Not set"}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                          <DollarSign size={16} className="text-teal-600" />
                          Consultation Fee
                        </label>
                        {isEditing ? (
                          <input
                            type="number"
                            name="consultationFee"
                            value={editForm.consultationFee || ""}
                            onChange={handleEditChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                          />
                        ) : (
                          <p className="text-gray-900">
                            {profile?.consultationFee || "Not set"} LKR
                          </p>
                        )}
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <label className="text-sm font-medium text-gray-700">
                          Bio
                        </label>
                        {isEditing ? (
                          <textarea
                            name="bio"
                            value={editForm.bio || ""}
                            onChange={handleEditChange}
                            rows="3"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                            placeholder="About yourself..."
                          />
                        ) : (
                          <p className="text-gray-900">
                            {profile?.bio || "Not set"}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {userRole === "patient" && (
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Calendar size={20} className="text-teal-600" />
                      Personal Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">
                          Date of Birth
                        </label>
                        {isEditing ? (
                          <input
                            type="date"
                            name="dateOfBirth"
                            value={editForm.dateOfBirth?.split("T")[0] || ""}
                            onChange={handleEditChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                          />
                        ) : (
                          <p className="text-gray-900">
                            {profile?.dateOfBirth?.split("T")[0] || "Not set"}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">
                          Gender
                        </label>
                        {isEditing ? (
                          <select
                            name="gender"
                            value={editForm.gender || ""}
                            onChange={handleEditChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                          >
                            <option value="">Select Gender</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                          </select>
                        ) : (
                          <p className="text-gray-900 capitalize">
                            {profile?.gender || "Not set"}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                          <MapPin size={16} className="text-teal-600" />
                          Address
                        </label>
                        {isEditing ? (
                          <textarea
                            name="address"
                            value={editForm.address || ""}
                            onChange={handleEditChange}
                            rows="2"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                            placeholder="Your address"
                          />
                        ) : (
                          <p className="text-gray-900">
                            {profile?.address || "Not set"}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Medical Information Tab */}
            {activeTab === "medical" && userRole === "patient" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <HeartPulse size={16} className="text-teal-600" />
                      Blood Group
                    </label>
                    {isEditing ? (
                      <select
                        name="bloodGroup"
                        value={editForm.bloodGroup || ""}
                        onChange={handleEditChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      >
                        <option value="">Select Blood Group</option>
                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B-">B-</option>
                        <option value="O+">O+</option>
                        <option value="O-">O-</option>
                        <option value="AB+">AB+</option>
                        <option value="AB-">AB-</option>
                      </select>
                    ) : (
                      <p className="text-gray-900">
                        {profile?.bloodGroup || "Not set"}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <Activity size={16} className="text-teal-600" />
                      Allergies
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="allergies"
                        value={editForm.allergies || ""}
                        onChange={handleEditChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        placeholder="Any allergies"
                      />
                    ) : (
                      <p className="text-gray-900">
                        {profile?.allergies || "None"}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Prescriptions Tab */}
            {activeTab === "prescriptions" && userRole === "patient" && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Pill className="text-teal-600" size={24} />
                  <h2 className="text-xl font-semibold text-gray-900">
                    My Prescriptions
                  </h2>
                </div>

                {loadingPrescriptions ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="animate-spin text-teal-600" size={32} />
                  </div>
                ) : prescriptions.length > 0 ? (
                  <div className="space-y-4">
                    {prescriptions.map((prescription, index) => (
                      <div
                        key={index}
                        className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center">
                              <Pill size={24} className="text-teal-600" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900">
                                Prescription #{index + 1}
                              </h3>
                              <p className="text-xs text-gray-500">
                                {new Date(
                                  prescription.issuedAt,
                                ).toLocaleDateString()}{" "}
                                at{" "}
                                {new Date(
                                  prescription.issuedAt,
                                ).toLocaleTimeString()}
                              </p>
                            </div>
                          </div>
                          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                            Active
                          </span>
                        </div>

                        <div className="mt-4">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">
                            Medications:
                          </h4>
                          <div className="space-y-2">
                            {prescription.medications?.map((med, medIdx) => (
                              <div
                                key={medIdx}
                                className="bg-gray-50 rounded-lg p-3"
                              >
                                <div className="flex items-center justify-between">
                                  <span className="font-medium text-gray-800">
                                    {med.name}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    {med.dosage}
                                  </span>
                                </div>
                                <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                                  <span>Frequency: {med.frequency}</span>
                                  <span>Duration: {med.duration}</span>
                                </div>
                                {med.instructions && (
                                  <p className="text-xs text-gray-500 mt-1">
                                    <span className="font-medium">
                                      Instructions:
                                    </span>{" "}
                                    {med.instructions}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>

                        {prescription.notes && (
                          <div className="mt-4 p-3 bg-amber-50 rounded-lg">
                            <p className="text-xs text-amber-800">
                              <span className="font-medium">
                                Doctor's Notes:
                              </span>{" "}
                              {prescription.notes}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-gray-50 rounded-xl">
                    <Pill size={48} className="text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No prescriptions yet</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Your prescriptions will appear here after doctor visits
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Security Tab */}
            {activeTab === "security" && (
              <div className="space-y-4">
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <p className="text-sm text-amber-800 flex items-center gap-2">
                    <Shield size={16} />
                    Your account is protected with secure encryption
                  </p>
                </div>

                <div className="space-y-3">
                  <button className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <Lock size={20} className="text-teal-600" />
                      <div className="text-left">
                        <p className="font-medium text-gray-900">
                          Change Password
                        </p>
                        <p className="text-xs text-gray-500">
                          Update your password regularly
                        </p>
                      </div>
                    </div>
                    <ChevronRight size={20} className="text-gray-400" />
                  </button>

                  <button className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <Smartphone size={20} className="text-teal-600" />
                      <div className="text-left">
                        <p className="font-medium text-gray-900">
                          Two-Factor Authentication
                        </p>
                        <p className="text-xs text-gray-500">
                          Add an extra layer of security
                        </p>
                      </div>
                    </div>
                    <ChevronRight size={20} className="text-gray-400" />
                  </button>

                  <button className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <Bell size={20} className="text-teal-600" />
                      <div className="text-left">
                        <p className="font-medium text-gray-900">
                          Notification Settings
                        </p>
                        <p className="text-xs text-gray-500">
                          Manage your email preferences
                        </p>
                      </div>
                    </div>
                    <ChevronRight size={20} className="text-gray-400" />
                  </button>
                </div>
              </div>
            )}

            {/* Activity Tab */}
            {activeTab === "activity" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Last Login</p>
                    <p className="text-sm text-gray-500">
                      Today at {new Date().toLocaleTimeString()}
                    </p>
                  </div>
                  <Activity size={20} className="text-gray-400" />
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Account Created</p>
                    <p className="text-sm text-gray-500">
                      {new Date().toLocaleDateString()}
                    </p>
                  </div>
                  <Calendar size={20} className="text-gray-400" />
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Device</p>
                    <p className="text-sm text-gray-500">Web Browser</p>
                  </div>
                  <Smartphone size={20} className="text-gray-400" />
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
