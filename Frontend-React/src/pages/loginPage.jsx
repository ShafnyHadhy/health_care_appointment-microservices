import axios from "axios";
import { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { MdMedicalServices, MdMail, MdLock, MdVisibility, MdVisibilityOff, MdArrowForward } from "react-icons/md";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  async function login() {
    try {
      setError("");
      setLoading(true);

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/login`,
        { email, password }
      );

      console.log(response.data);

      localStorage.setItem("token", response.data.token);
      
      const user = response.data.user;

      if (user.role == "admin") {
        navigate("/admin");
      } else if (user.role == "doctor") {
        navigate("/doctor");
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

  const handleSubmit = (e) => {
    e.preventDefault();
    login();
  };

  return (
    <div className="bg-neutral font-body text-on-surface h-screen flex flex-col items-center justify-center p-4 md:p-6 selection:bg-secondary-fixed selection:text-on-secondary-fixed relative overflow-hidden">
      
      {/* Visual Polish: Ambient Glows */}
      <div className="fixed top-0 left-0 w-full h-full -z-10 pointer-events-none opacity-40">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-secondary-fixed/20 blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-primary-fixed/20 blur-[120px]"></div>
      </div>

      <main className="w-full max-w-4xl h-full max-h-150 grid grid-cols-1 md:grid-cols-12 gap-0 overflow-hidden bg-surface-container-low rounded-lg shadow-md relative z-10">
        
        {/* Brand/Visual Side (Asymmetric Layout) */}
        <div className="hidden md:flex md:col-span-7 flex-col justify-between p-6 md:p-8 relative overflow-hidden bg-surface-container-highest bg-tertiary">
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-6">
              <MdMedicalServices className="text-primary text-2xl" />
              <h1 className="font-headline font-extrabold text-xl text-primary tracking-tight">CareBridge</h1>
            </div>
            <div className="max-w-sm">
              <h2 className="font-headline text-3xl font-extrabold text-on-surface leading-[1.1] mb-3">
                The Clinical <br /><span className="text-primary">Sanctuary.</span>
              </h2>
              <p className="text-sm text-on-surface-variant leading-relaxed opacity-80">
                Designed for clinicians who value precision and serenity. Experience a therapeutic digital environment for patient care.
              </p>
            </div>
          </div>

          {/* Asymmetric Glass Card Component */}
          <div className="relative z-10 self-end mt-6 w-full max-w-xs p-4 rounded-lg bg-white/40 backdrop-blur-xl border border-outline-variant/20">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full overflow-hidden">
                <img 
                  alt="Dr. Aris Thorne" 
                  className="w-full h-full object-cover" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBXlSqd_6JNc2yc34d8sNPo0TGU2a8CaWT6j5dahYaSRt7koo3dZLmg_Spezs4LDUfEkQYX-uBSMIuJbVBiMAxBrhhceKX072K1rs9HuXTpLitE4N6Y__Wawh2yeqcEBKbNc1NTTNTdH1ETNw6dWHcpOP8N8Qy5urhIMwy92vrprYG2z30ZciULIkjX_m9Lur2v2qq_TnYoh78gXhHRRcHzi7fstDP4ApNaiC754pUAv2_UiFjxqM34n2ejcoEKkJN5vMFmk7VTn_Q"
                />
              </div>
              <div>
                <p className="font-headline font-bold text-sm text-on-surface">Dr. Aris Thorne</p>
                <p className="text-[10px] text-on-surface-variant">Chief of Medicine</p>
              </div>
            </div>
            <p className="text-xs italic text-on-surface-variant">
              "CareBridge has transformed our diagnostic workflow into a calm, focused experience."
            </p>
          </div>

          {/* Background Decorative Elements */}
          <div className="absolute -right-20 -bottom-20 w-80 h-80 rounded-full bg-primary-fixed/20 blur-3xl"></div>
          <div className="absolute -left-10 top-20 w-56 h-56 rounded-full bg-secondary-fixed/10 blur-2xl"></div>
        </div>

        {/* Login Form Side */}
        <div className="md:col-span-5 flex flex-col justify-center p-6 md:p-8 bg-white overflow-y-auto">
          
          {/* Mobile Brand Identity */}
          <div className="flex items-center gap-2 mb-6 md:hidden">
            <MdMedicalServices className="text-primary text-xl" />
            <span className="font-headline font-extrabold text-base text-primary tracking-tight">CareBridge</span>
          </div>

          <div className="mb-5">
            <h3 className="font-headline text-lg font-bold text-on-surface mb-1">Welcome Back</h3>
            <p className="text-on-surface-variant text-[10px] md:text-xs">Please enter your clinical credentials to continue.</p>
          </div>

          {error && (
            <div className="mb-4 rounded-lg border border-red-300/30 bg-red-50 px-3 py-2 text-xs text-red-600">
              {error}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider" htmlFor="email">
                Clinical Email
              </label>
              <div className="relative group">
                <MdMail className="text-base absolute left-3 top-1/2 -translate-y-1/2 text-outline-variant group-focus-within:text-primary transition-colors" />
                <input 
                  className="w-full pl-9 pr-3 py-2 text-sm bg-surface rounded-lg border-none ring-1 ring-outline-variant/30 focus:ring-2 focus:ring-primary focus:bg-white transition-all text-on-surface placeholder:text-outline-variant/60" 
                  id="email" 
                  name="email" 
                  placeholder="name@gmail.com" 
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider" htmlFor="password">
                  Password
                </label>
                <a className="text-[10px] font-bold text-primary hover:text-primary-container transition-colors" href="#forgot">
                  Forgot password?
                </a>
              </div>
              <div className="relative group">
                <MdLock className="text-base absolute left-3 top-1/2 -translate-y-1/2 text-outline-variant group-focus-within:text-primary transition-colors" />
                <input 
                  className="w-full pl-9 pr-10 py-2 text-sm bg-surface rounded-lg border-none ring-1 ring-outline-variant/30 focus:ring-2 focus:ring-primary focus:bg-white transition-all text-on-surface placeholder:text-outline-variant/60" 
                  id="password" 
                  name="password" 
                  placeholder="••••••••" 
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button 
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-outline-variant hover:text-on-surface transition-colors" 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <MdVisibilityOff className="text-base" /> : <MdVisibility className="text-base" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center gap-2 py-1 text-[10px]">
              <input 
                className="w-3.5 h-3.5 rounded border-outline-variant text-primary focus:ring-primary focus:ring-offset-surface" 
                id="remember" 
                type="checkbox"
              />
              <label className="text-xs text-on-surface-variant cursor-pointer select-none" htmlFor="remember">
                Remember this workstation for 30 days
              </label>
            </div>

            {/* Login CTA */}
            <button 
              className="w-full py-2.5 mt-2 rounded-lg text-white font-bold text-sm shadow-md shadow-primary/10 hover:shadow-primary/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-60" 
              type="submit"
              disabled={loading}
              style={{ background: 'linear-gradient(135deg, #006063 0%, #007b7f 100%)' }}
            >
              <span>{loading ? "Authenticating..." : "Login"}</span>
              <MdArrowForward className="text-base" />
            </button>
          </form>

          {/* Footer Links */}
          <div className="mt-8 pt-5 border-t border-surface-container text-center">
            <p className="text-[10px] text-on-surface-variant mb-3">Secured by CareBridge Encryption Protocol</p>
            <div className="flex justify-center gap-4 text-[9px] font-medium text-outline">
              <a className="hover:text-primary transition-colors" href="#privacy">Privacy Policy</a>
              <a className="hover:text-primary transition-colors" href="#terms">Terms of Service</a>
              <a className="hover:text-primary transition-colors" href="#support">Support</a>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
