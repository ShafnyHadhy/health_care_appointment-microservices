import React, { useState } from "react";
import {
  User,
  Mail,
  Phone,
  Lock,
  Clock,
  ArrowRight,
  ShieldCheck,
  FileText,
  Stethoscope,
  AlertCircle,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

export default function PatientRegister() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

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

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const API_URL = "http://localhost:3001";

      const response = await axios.post(
        `${API_URL}/api/patients/register`,
        {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      if (response.status === 201) {
        setSuccess(
          "✅ Patient registered successfully! Please login to continue.",
        );

        setFormData({
          name: "",
          email: "",
          phone: "",
          password: "",
          confirmPassword: "",
        });

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
          "Cannot connect to server. Please check if backend is running on port 3001",
        );
      } else {
        setError("An error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-neutral font-body text-on-surface antialiased min-h-screen flex flex-col">
      <main className="grow flex items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-4xl flex flex-col md:flex-row gap-0 overflow-hidden rounded-lg shadow-md">
          <div className="hidden md:flex md:w-5/12 bg-teal-700 p-8 flex-col justify-between relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-6">
                <Stethoscope className="text-white w-6 h-6" />
                <span className="font-headline font-black text-lg tracking-tighter text-white">
                  CareBridge
                </span>
              </div>
              <h1 className="font-headline text-3xl font-extrabold text-white leading-tight tracking-tight mb-4">
                Welcome to your{" "}
                <span className="text-white/70">Clinical Sanctuary</span>.
              </h1>
              <p className="text-white font-medium text-sm max-w-xs">
                Join our healthcare community and experience a more serene
                approach to digital medicine.
              </p>
            </div>

            <div className="relative z-10 flex gap-3 flex-wrap">
              <span className="bg-white/20 px-4 py-2 rounded-full text-white text-sm font-semibold flex items-center gap-2 backdrop-blur-sm">
                <ShieldCheck size={16} /> Secure Data
              </span>
              <span className="bg-white/20 px-4 py-2 rounded-full text-white text-sm font-semibold flex items-center gap-2 backdrop-blur-sm">
                <FileText size={16} /> HIPAA Compliant
              </span>
            </div>

            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
            <img
              className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-30"
              src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&h=800&fit=crop"
              alt="Clinical Environment"
            />
          </div>

          <div className="w-full md:w-7/12 bg-white p-6 md:p-10">
            <div className="max-w-sm mx-auto">
              <header className="mb-6">
                <h2 className="font-headline text-2xl font-bold text-on-surface mb-1">
                  Create Account
                </h2>
                <p className="text-on-surface-variant text-sm font-medium">
                  Please enter your details to register as a new patient.
                </p>
              </header>

              {success && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-start gap-2">
                  <CheckCircle
                    className="text-green-500 mt-0.5 shrink-0"
                    size={16}
                  />
                  <p className="text-sm text-green-700">{success}</p>
                </div>
              )}

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                  <AlertCircle
                    className="text-red-500 mt-0.5 shrink-0"
                    size={16}
                  />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="space-y-1.5">
                  <label
                    className="block text-xs font-semibold text-on-surface-variant"
                    htmlFor="name"
                  >
                    Full Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-outline w-4 h-4" />
                    <input
                      className="w-full bg-surface-container-lowest border border-gray-200 rounded-lg py-2 pl-9 pr-3 text-sm text-on-surface focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 transition-all outline-none"
                      id="name"
                      name="name"
                      placeholder="John Doe"
                      type="text"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label
                    className="block text-xs font-semibold text-on-surface-variant"
                    htmlFor="email"
                  >
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-outline w-4 h-4" />
                    <input
                      className="w-full bg-surface-container-lowest border border-gray-200 rounded-lg py-2 pl-9 pr-3 text-sm text-on-surface focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 transition-all outline-none"
                      id="email"
                      name="email"
                      placeholder="john@example.com"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label
                    className="block text-xs font-semibold text-on-surface-variant"
                    htmlFor="phone"
                  >
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-outline w-4 h-4" />
                    <input
                      className="w-full bg-surface-container-lowest border border-gray-200 rounded-lg py-2 pl-9 pr-3 text-sm text-on-surface focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 transition-all outline-none"
                      id="phone"
                      name="phone"
                      placeholder="+1 (555) 000-0000"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label
                      className="block text-xs font-semibold text-on-surface-variant"
                      htmlFor="password"
                    >
                      Password *
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-outline w-4 h-4" />
                      <input
                        className="w-full bg-surface-container-lowest border border-gray-200 rounded-lg py-2 pl-9 pr-3 text-sm text-on-surface focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 transition-all outline-none"
                        id="password"
                        name="password"
                        placeholder="••••••••"
                        type="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label
                      className="block text-xs font-semibold text-on-surface-variant"
                      htmlFor="confirmPassword"
                    >
                      Confirm *
                    </label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-outline w-4 h-4" />
                      <input
                        className="w-full bg-surface-container-lowest border border-gray-200 rounded-lg py-2 pl-9 pr-3 text-sm text-on-surface focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 transition-all outline-none"
                        id="confirmPassword"
                        name="confirmPassword"
                        placeholder="••••••••"
                        type="password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    className="w-full py-2.5 rounded-lg text-white font-headline font-bold text-sm shadow-sm hover:opacity-95 active:scale-[0.98] transition-all duration-150 flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    type="submit"
                    disabled={loading}
                    style={{
                      background:
                        "linear-gradient(135deg, #006063 0%, #007b7f 100%)",
                    }}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="animate-spin" size={16} />
                        Creating Account...
                      </>
                    ) : (
                      <>
                        Create Account
                        <ArrowRight size={16} />
                      </>
                    )}
                  </button>
                </div>
              </form>

              <footer className="mt-6 text-center">
                <p className="text-on-surface-variant text-xs font-medium">
                  Already have an account?
                  <Link
                    className="text-teal-600 font-bold hover:underline underline-offset-4 ml-1"
                    to="/login"
                  >
                    Login instead
                  </Link>
                </p>
              </footer>
            </div>
          </div>
        </div>
      </main>

      <div className="py-6 text-center text-outline text-[10px] font-medium tracking-widest uppercase opacity-60">
        Clinical Sanctuary © 2026 CareBridge Systems
      </div>
    </div>
  );
}
