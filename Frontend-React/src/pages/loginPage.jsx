import axios from "axios";
import { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function login() {
    try {
      setError("");
      setLoading(true);

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/users/login`,
        { email, password }
      );

      console.log(response.data);

      localStorage.setItem("token", response.data.token);
      
      const user = response.data.user;

      if (user.role == "admin") {
        navigate("/admin");
      } else if (user.role == "provider") {
        navigate("/provider");
      } else {
        navigate("/");
      }

      toast.success("Login successful!");

    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Login failed. Please try again."
      );

      toast.error("Login failed. Please check your credentials.");

    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="h-screen w-full bg-[url('/bbg.jpg')] bg-cover bg-center overflow-hidden">
      <div className="h-full w-full bg-black/45 flex items-center justify-center">
        <div className="w-full max-w-6xl px-4">
          <div className="w-full grid grid-cols-1 md:grid-cols-2 rounded-3xl overflow-hidden shadow-2xl border border-white/15 bg-white/10 backdrop-blur-xl">

            {/* LEFT */}
            <div className="relative p-6 md:p-8 text-white flex flex-col justify-between">
              <div className="absolute inset-0 bg-linear-to-br from-blue-500/25 via-cyan-400/10 to-transparent pointer-events-none" />

              <div className="relative z-10 flex flex-col h-full">

                {/* Logo */}
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-white/15 border border-white/15 flex items-center justify-center text-sm">
                    ♻️
                  </div>
                  <div>
                    <p className="text-xs text-white/70">Welcome to</p>
                    <h2 className="text-xl font-bold">ReConnect Platform</h2>
                  </div>
                </div>

                {/* Heading */}
                <div className="mt-6">
                  <h1 className="text-2xl md:text-3xl font-bold leading-snug">
                    Customers, Repairers & Recyclers — all in one place.
                  </h1>
                  <p className="mt-3 text-sm text-white/80">
                    Find trusted repair centers, request pickups and reduce e-waste efficiently.
                  </p>
                </div>

                {/* Features */}
                <div className="mt-6 grid gap-2">
                  <FeatureItemSmall
                    title="Fast Requests"
                    desc="Create requests in seconds."
                  />
                  <FeatureItemSmall
                    title="Trusted Providers"
                    desc="Verified repairers & recyclers."
                  />
                  <FeatureItemSmall
                    title="Real-time Updates"
                    desc="Track your request status."
                  />
                </div>

                {/* Roles */}
                <div className="mt-6">
                  <p className="text-xs text-white/70 mb-2">Login as:</p>
                  <div className="flex flex-wrap gap-2">
                    <RoleChip label="Customer" />
                    <RoleChip label="Repair Center" />
                    <RoleChip label="Recycler" />
                  </div>
                </div>

                <div className="mt-6 text-[10px] text-white/60">
                  By continuing, you agree to our Terms & Privacy Policy.
                </div>
              </div>
            </div>

            {/* RIGHT */}
            <div className="p-6 md:p-8 bg-white/5 flex items-center justify-center">
              <div className="w-full max-w-sm">
                <div className="rounded-2xl border border-white/15 bg-white/10 backdrop-blur-xl shadow-xl p-6">

                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-white">Sign in</h3>
                    <p className="text-xs text-white/70 mt-1">
                      Enter your credentials
                    </p>
                  </div>

                  {error && (
                    <div className="mb-3 rounded-lg border border-red-300/30 bg-red-500/15 px-3 py-2 text-xs text-red-100">
                      {error}
                    </div>
                  )}

                  <div className="space-y-3">

                    <div>
                      <label className="text-xs text-white/80">Email</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="mt-1 w-full h-9 rounded-lg px-3 text-sm bg-white/15 border border-white/15 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-300/70"
                      />
                    </div>

                    <div>
                      <label className="text-xs text-white/80">Password</label>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="mt-1 w-full h-9 rounded-lg px-3 text-sm bg-white/15 border border-white/15 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-300/70"
                      />
                    </div>

                    <button
                      onClick={login}
                      disabled={loading}
                      className="w-full h-9 rounded-lg text-sm font-semibold text-slate-900
                                bg-linear-to-r from-cyan-200 to-blue-200
                                hover:from-cyan-100 hover:to-blue-100
                                transition disabled:opacity-60"
                    >
                      {loading ? "Signing in..." : "Login"}
                    </button>

                  </div>
                </div>

                <p className="mt-3 text-center text-[10px] text-white/60">
                  Repairers & recyclers use the same login.
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureItemSmall({ title, desc }) {
  return (
    <div className="rounded-xl border border-white/15 bg-white/10 px-3 py-2">
      <p className="text-sm font-semibold">{title}</p>
      <p className="text-xs text-white/80">{desc}</p>
    </div>
  );
}

function RoleChip({ label }) {
  return (
    <span className="px-3 py-1 rounded-full text-xs font-semibold border border-white/15 bg-white/10 text-white/90">
      {label}
    </span>
  );
}
