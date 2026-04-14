import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";

export default function Header() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const nav1 = token ? "Dashboard" : "Services";
  const nav2 = token ? "Find a Doctor" : "Resources";
  const nav3 = token ? "Profile" : "About";

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <nav className="w-full top-0 sticky z-50 bg-white/90 backdrop-blur-md border-b border-gray-200 shadow-sm">
      <div className="flex justify-between items-center py-3 px-4 md:px-8 max-w-7xl mx-auto">
        <div className="flex items-center gap-8">
          <div className="flex flex-row items-center gap-2">
            <img src="/logo.png" alt="Logo" className="w-14 h-10 rounded-md object-cover" />
            <Link
              to="/"
              className="text-xl font-black text-primary tracking-tight font-headline pt-2"
            >
              Care<span className="text-secondary">Bridge</span>
            </Link>
          </div>
          <div className="hidden md:flex gap-6 items-center mt-3">
            <NavLink end className={({ isActive }) => `font-label text-sm transition-colors ${isActive ? "text-primary font-semibold" : "text-gray-600 hover:text-primary"}`} to="/">Home</NavLink>
            <NavLink className={({ isActive }) => `font-label text-sm transition-colors ${isActive ? "text-primary font-semibold" : "text-gray-600 hover:text-primary"}`} to={token ? "/patient-dashboard" : "/services"}>{nav1}</NavLink>
            <NavLink className={({ isActive }) => `font-label text-sm transition-colors ${isActive ? "text-primary font-semibold" : "text-gray-600 hover:text-primary"}`} to={token ? "/find-doctor" : "/resources"}>{nav2}</NavLink>
            {token && (
              <NavLink className={({ isActive }) => `font-label text-sm transition-colors ${isActive ? "text-primary font-semibold" : "text-gray-600 hover:text-primary"}`} to="/payment-history">Payments</NavLink>
            )}
            <NavLink className={({ isActive }) => `font-label text-sm transition-colors ${isActive ? "text-primary font-semibold" : "text-gray-600 hover:text-primary"}`} to={token ? "/profile" : "/about"}>{nav3}</NavLink>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {!token ? (
            <>
              <Link className="text-gray-700 font-semibold text-sm px-4 py-2 flex items-center justify-center hover:bg-gray-50 rounded-md transition-all border border-transparent hover:border-gray-200" to="/login">Login</Link>
              <Link
                to="/role-selection"
                className="flex items-center justify-center bg-primary text-white font-semibold text-sm px-5 py-2 rounded-md shadow-sm hover:opacity-90 transition-all"
                style={{ background: '#006063' }}
              >
                Get Started
              </Link>
            </>
          ) : (
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 hover:bg-gray-50 p-1.5 pr-3 rounded-xl transition-all border border-transparent hover:border-gray-200"
              >
                <div className="flex items-center justify-center w-8 h-8 rounded-2xl bg-primary/10 text-primary border border-primary/20">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <span className="font-label text-sm font-semibold text-gray-700 hidden sm:block">Shafny Hadhy</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 hidden sm:block" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-sm border border-gray-200 py-1.5 flex flex-col z-50 overflow-hidden">
                  <div className="px-4 py-2 border-b border-gray-100 mb-1.5">
                    <p className="text-xs font-label font-bold text-gray-500 uppercase tracking-wide">My Account</p>
                  </div>
                  <Link
                    to="/settings"
                    className="px-4 py-2 text-sm font-label text-gray-700 hover:bg-gray-50 hover:text-primary transition-colors text-left"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    Settings
                  </Link>
                  <button
                    onClick={() => {
                      setIsDropdownOpen(false);
                      handleLogout();
                    }}
                    className="px-4 py-2 text-sm font-label text-red-600 hover:bg-red-50 transition-colors text-left"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}