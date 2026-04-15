import React, { useState } from "react";
import {
  HeartPulse,
  User,
  Mail,
  Phone,
  Stethoscope,
  ShieldCheck,
  Lock,
  ChevronRight,
  Globe,
  MessageSquare,
  Zap,
  Bot,
  AlertCircle,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

export default function DoctorRegister() {
  const navigate = useNavigate();

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    specialty: "",
    licenseNumber: "",
    consultationFee: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (error) setError("");
  };

  // Handle form submission - Connect to Backend
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.name || !formData.email || !formData.password) {
      setError("Please fill all required fields");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (!formData.specialty) {
      setError("Please select your specialization");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // ✅ BACKEND API CALL - Doctor Service on port 3002
      const API_URL = "http://localhost:3002";

      console.log("Sending to backend:", `${API_URL}/api/doctors/register`);

      const response = await axios.post(
        `${API_URL}/api/doctors/register`,
        {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          specialty: formData.specialty,
          phone: formData.phone,
          consultationFee: parseInt(formData.consultationFee) || 0,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      console.log("Response:", response.data);

      if (response.status === 201) {
        setSuccess(
          "✅ Doctor registered successfully! Please wait for admin verification.",
        );

        // Clear form
        setFormData({
          name: "",
          email: "",
          phone: "",
          specialty: "",
          licenseNumber: "",
          consultationFee: "",
          password: "",
          confirmPassword: "",
        });

        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate("/login");
        }, 3000);
      }
    } catch (err) {
      console.error("Registration error:", err);

      if (err.response) {
        setError(
          err.response.data?.message ||
            "Registration failed. Please try again.",
        );
      } else if (err.request) {
        setError(
          "Cannot connect to server. Please check if backend is running on port 3002",
        );
      } else {
        setError("An error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const perks = [
    { icon: <Zap size={14} />, label: "Instant Telehealth" },
    { icon: <Bot size={14} />, label: "AI Assistant" },
    { icon: <Globe size={14} />, label: "Global Directory" },
    { icon: <MessageSquare size={14} />, label: "Secure Messaging" },
    { icon: <ShieldCheck size={14} />, label: "Priority Support" },
  ];

  return (
    <div className="bg-neutral font-body text-on-surface antialiased min-h-screen">
      {/* Top Navigation */}
      <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl shadow-sm h-14 flex items-center px-4 md:px-6">
        <div className="flex justify-between items-center w-full max-w-screen-2xl mx-auto">
          <div className="flex items-center gap-2">
            <HeartPulse className="text-teal-600" size={24} />
            <span className="text-lg font-bold tracking-tighter text-teal-800 font-headline">
              CareBridge
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs font-medium text-slate-600">
              Already have an account?
            </span>
            <Link
              to="/login"
              className="bg-secondary-container text-on-secondary-container px-3 py-1.5 rounded-lg text-xs font-semibold active:scale-95 hover:text-teal-600 transition-colors"
            >
              Log In
            </Link>
          </div>
        </div>
      </header>

      <main className="pt-20 pb-16 px-4 md:px-6">
        <div className="max-w-4xl mx-auto">
          {/* Hero Title */}
          <div className="mb-8">
            <h1 className="font-headline text-3xl font-extrabold tracking-tight text-on-surface mb-3">
              Join our <span className="text-teal-600">Clinical Sanctuary</span>
            </h1>
            <p className="text-sm text-on-surface-variant max-w-2xl leading-relaxed">
              Secure your position in a therapeutic ecosystem designed for
              excellence. Your expertise deserves a modern workspace.
            </p>
          </div>

          {/* Success Message */}
          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
              <CheckCircle
                className="text-green-500 mt-0.5 shrink-0"
                size={18}
              />
              <div>
                <p className="text-sm font-medium text-green-800">{success}</p>
                <p className="text-xs text-green-600 mt-1">
                  Redirecting to login...
                </p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="text-red-500 mt-0.5 shrink-0" size={18} />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Registration Form Column */}
            <div className="lg:col-span-7 bg-white p-6 lg:p-8 rounded-lg border border-black/5 shadow-sm">
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Section 1: Identity */}
                <section>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="w-6 h-6 rounded-full bg-surface-container-low flex items-center justify-center text-teal-600">
                      <User size={14} />
                    </span>
                    <h3 className="font-headline text-lg font-bold text-on-surface">
                      Identity & Contact
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-semibold uppercase tracking-wider text-on-surface-variant ml-1">
                        Full Name *
                      </label>
                      <input
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full bg-surface-container-lowest border border-outline/10 rounded-lg px-3 py-2 text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 text-on-surface placeholder:text-outline-variant transition-all outline-none"
                        placeholder="Dr. Julianne Mercer"
                        type="text"
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-semibold uppercase tracking-wider text-on-surface-variant ml-1">
                        Email Address *
                      </label>
                      <input
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full bg-surface-container-lowest border border-outline/10 rounded-lg px-3 py-2 text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 text-on-surface placeholder:text-outline-variant transition-all outline-none"
                        placeholder="j.mercer@clinic.com"
                        type="email"
                        required
                      />
                    </div>
                    <div className="space-y-1.5 md:col-span-2">
                      <label className="text-[10px] font-semibold uppercase tracking-wider text-on-surface-variant ml-1">
                        Phone Number
                      </label>
                      <div className="relative">
                        <input
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          className="w-full bg-surface-container-lowest border border-outline/10 rounded-lg px-3 py-2 pl-9 text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 text-on-surface placeholder:text-outline-variant transition-all outline-none"
                          placeholder="+1 (555) 000-0000"
                          type="tel"
                        />
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-outline w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </section>

                {/* Section 2: Professional Details */}
                <section>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="w-6 h-6 rounded-full bg-surface-container-low flex items-center justify-center text-teal-600">
                      <Stethoscope size={14} />
                    </span>
                    <h3 className="font-headline text-lg font-bold text-on-surface">
                      Professional Profile
                    </h3>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-semibold uppercase tracking-wider text-on-surface-variant ml-1">
                        Specialization *
                      </label>
                      <div className="relative">
                        <select
                          name="specialty"
                          value={formData.specialty}
                          onChange={handleChange}
                          className="w-full bg-surface-container-lowest border border-outline/10 rounded-lg px-3 py-2 text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 text-on-surface transition-all appearance-none outline-none"
                          required
                        >
                          <option value="">Select your medical field</option>
                          <option value="Cardiologist">Cardiology</option>
                          <option value="Dermatologist">Dermatology</option>
                          <option value="Internal Medicine">
                            Internal Medicine
                          </option>
                          <option value="Neurologist">Neurology</option>
                          <option value="Pediatrician">Pediatrics</option>
                          <option value="Psychiatrist">Psychiatry</option>
                          <option value="General Physician">
                            General Physician
                          </option>
                          <option value="Orthopedic">Orthopedic</option>
                        </select>
                        <ChevronRight
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-outline rotate-90"
                          size={16}
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-semibold uppercase tracking-wider text-on-surface-variant ml-1">
                        Consultation Fee (LKR)
                      </label>
                      <input
                        name="consultationFee"
                        value={formData.consultationFee}
                        onChange={handleChange}
                        className="w-full bg-surface-container-lowest border border-outline/10 rounded-lg px-3 py-2 text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 text-on-surface placeholder:text-outline-variant transition-all outline-none"
                        placeholder="2500"
                        type="number"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-semibold uppercase tracking-wider text-on-surface-variant ml-1">
                        License Number
                      </label>
                      <input
                        name="licenseNumber"
                        value={formData.licenseNumber}
                        onChange={handleChange}
                        className="w-full bg-surface-container-lowest border border-outline/10 rounded-lg px-3 py-2 text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 text-on-surface placeholder:text-outline-variant transition-all outline-none"
                        placeholder="MD-8829-XJ"
                        type="text"
                      />
                    </div>
                  </div>
                </section>

                {/* Section 3: Security */}
                <section>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="w-6 h-6 rounded-full bg-surface-container-low flex items-center justify-center text-teal-600">
                      <Lock size={14} />
                    </span>
                    <h3 className="font-headline text-lg font-bold text-on-surface">
                      Security
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-semibold uppercase tracking-wider text-on-surface-variant ml-1">
                        Password *
                      </label>
                      <input
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className="w-full bg-surface-container-lowest border border-outline/10 rounded-lg px-3 py-2 text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 text-on-surface placeholder:text-outline-variant transition-all outline-none"
                        placeholder="••••••••"
                        type="password"
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-semibold uppercase tracking-wider text-on-surface-variant ml-1">
                        Confirm Password *
                      </label>
                      <input
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className="w-full bg-surface-container-lowest border border-outline/10 rounded-lg px-3 py-2 text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 text-on-surface placeholder:text-outline-variant transition-all outline-none"
                        placeholder="••••••••"
                        type="password"
                        required
                      />
                    </div>
                  </div>
                </section>

                <div className="pt-4 space-y-4">
                  {/* Registration CTA */}
                  <button
                    className="w-full py-3 rounded-lg text-white font-headline font-bold text-base shadow-lg shadow-teal-500/20 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      background:
                        "linear-gradient(135deg, #006063 0%, #007b7f 100%)",
                    }}
                    type="submit"
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 className="animate-spin" size={18} />
                        Registering...
                      </span>
                    ) : (
                      "Register as Doctor"
                    )}
                  </button>

                  {/* Verification Note */}
                  <div className="flex gap-3 p-4 bg-surface-container-low rounded-lg items-start">
                    <ShieldCheck
                      className="text-teal-600 mt-1.5 shrink-0"
                      size={16}
                    />
                    <div className="space-y-0.5">
                      <p className="text-xs font-semibold text-on-surface">
                        Awaiting Admin Verification
                      </p>
                      <p className="text-[10px] text-on-surface-variant leading-relaxed">
                        To maintain the sanctuary's integrity, all medical
                        credentials undergo a manual 24-48 hour verification
                        process by our clinical administrators.
                      </p>
                    </div>
                  </div>
                </div>
              </form>
            </div>

            {/* Visual/Info Column */}
            <div className="lg:col-span-5 space-y-6">
              <div className="relative rounded-lg overflow-hidden aspect-4/5 border border-black/5 group shadow-sm">
                <img
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=500&h=600&fit=crop"
                  alt="Modern medical office"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-teal-900/90 via-teal-900/20 to-transparent"></div>
                <div className="absolute bottom-0 left-0 p-6 text-white">
                  <span className="inline-block px-2.5 py-1 bg-white/30 backdrop-blur-md rounded-full text-[9px] font-bold uppercase tracking-[0.2em] mb-3">
                    CareBridge Network
                  </span>
                  <h2 className="font-headline text-2xl font-extrabold leading-tight mb-2">
                    Precision tools for modern care.
                  </h2>
                  <p className="text-white/80 text-xs leading-relaxed">
                    Integrated diagnostics, seamless patient records, and an
                    interface that breathes with you.
                  </p>
                </div>
              </div>

              {/* Perks Showcase */}
              <div className="bg-surface-container-low p-5 rounded-lg space-y-3 border border-black/5 shadow-sm">
                <p className="text-[10px] font-bold text-teal-600 uppercase tracking-widest">
                  Network Perks
                </p>
                <div className="flex flex-wrap gap-2">
                  {perks.map((perk, index) => (
                    <span
                      key={index}
                      className="px-3 py-1.5 bg-secondary-fixed/50 text-on-secondary-fixed rounded-full text-[10px] font-semibold flex items-center gap-1.5"
                    >
                      {perk.icon}
                      {perk.label}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer Meta */}
      <footer className="py-4 border-t border-outline-variant/10">
        <div className="max-w-screen-2xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-on-surface-variant">
            © 2026 CareBridge Clinical Sanctuary. All rights reserved.
          </p>
          <div className="flex gap-6">
            <a
              className="text-[10px] font-medium text-on-surface-variant hover:text-teal-600 transition-colors uppercase tracking-wider"
              href="#"
            >
              Privacy Policy
            </a>
            <a
              className="text-[10px] font-medium text-on-surface-variant hover:text-teal-600 transition-colors uppercase tracking-wider"
              href="#"
            >
              Terms of Service
            </a>
            <a
              className="text-[10px] font-medium text-on-surface-variant hover:text-teal-600 transition-colors uppercase tracking-wider"
              href="#"
            >
              Support Center
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
