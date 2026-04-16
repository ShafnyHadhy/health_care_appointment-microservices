import { useState, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";

export default function Header() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));

  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setToken(localStorage.getItem("token"));
  }, [localStorage.getItem("token")]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
    navigate("/login");
  };

  // Role-based navigation links
  const getDashboardLink = () => {
    if (!user) return "/";
    if (user.role === "patient") return "/patient-dashboard";
    if (user.role === "doctor") return "/doctor";
    if (user.role === "admin") return "/admin";
    return "/";
  };

  const getDashboardName = () => {
    if (!user) return "Dashboard";
    if (user.role === "patient") return "Dashboard";
    if (user.role === "doctor") return "Dashboard";
    if (user.role === "admin") return "Admin";
    return "Dashboard";
  };

  const getNav2Link = () => {
    if (!user) return "/resources";
    if (user.role === "patient") return "/find-doctor";
    if (user.role === "doctor") return "/appointments";
    if (user.role === "admin") return "/users";
    return "/resources";
  };

  const getNav2Name = () => {
    if (!user) return "Resources";
    if (user.role === "patient") return "Find Doctor";
    if (user.role === "doctor") return "Appointments";
    if (user.role === "admin") return "Users";
    return "Resources";
  };

  const getNav3Link = () => {
    return user ? "/profile" : "/about";
  };

  const getNav3Name = () => {
    return user ? "Profile" : "About";
  };

  const getUserName = () => {
    if (!user) return "Guest";
    return user.name?.split(" ")[0] || user.email?.split("@")[0] || user.role;
  };

  const getUserRoleBadge = () => {
    if (!user) return null;
    const roleColors = {
      patient: "bg-teal-100 text-teal-700",
      doctor: "bg-blue-100 text-blue-700",
      admin: "bg-purple-100 text-purple-700",
    };
    return roleColors[user.role] || "bg-gray-100 text-gray-700";
  };

  return (
    <nav className="w-full top-0 sticky z-50 bg-white/90 backdrop-blur-md border-b border-gray-200 shadow-sm">
      <div className="flex justify-between items-center py-3 px-4 md:px-8 max-w-7xl mx-auto">
        {/* Logo Section */}
        <div className="flex items-center gap-8">
          <div className="flex flex-row items-center gap-2">
            <img
              src="/logo.png"
              alt="Logo"
              className="w-14 h-10 rounded-md object-cover"
            />
            <Link
              to="/"
              className="text-xl font-black text-primary tracking-tight font-headline pt-2"
            >
              Care<span className="text-secondary">Bridge</span>
            </Link>
          </div>

          {/* Desktop Navigation - Role Based */}
          <div className="hidden md:flex gap-6 items-center mt-3">
            {/* Home - Always visible */}
            <NavLink
              end
              className={({ isActive }) =>
                `font-label text-sm transition-colors ${isActive ? "text-primary font-semibold" : "text-gray-600 hover:text-primary"}`
              }
              to="/"
            >
              Home
            </NavLink>

            {/* Dashboard - Role based */}
            <NavLink
              className={({ isActive }) =>
                `font-label text-sm transition-colors ${isActive ? "text-primary font-semibold" : "text-gray-600 hover:text-primary"}`
              }
              to={getDashboardLink()}
            >
              {getDashboardName()}
            </NavLink>

            {/* Second Nav - Role based (Find Doctor / Appointments / Users) */}
            <NavLink
              className={({ isActive }) =>
                `font-label text-sm transition-colors ${isActive ? "text-primary font-semibold" : "text-gray-600 hover:text-primary"}`
              }
              to={getNav2Link()}
            >
              {getNav2Name()}
            </NavLink>

            {/* Payments - Only for patients */}
            {token && user?.role === "patient" && (
              <NavLink
                className={({ isActive }) =>
                  `font-label text-sm transition-colors ${isActive ? "text-primary font-semibold" : "text-gray-600 hover:text-primary"}`
                }
                to="/payment-history"
              >
                Payments
              </NavLink>
            )}

            {/* Prescriptions - Only for doctors */}
            {token && user?.role === "doctor" && (
              <NavLink
                className={({ isActive }) =>
                  `font-label text-sm transition-colors ${isActive ? "text-primary font-semibold" : "text-gray-600 hover:text-primary"}`
                }
                to="/prescriptions"
              >
                Prescriptions
              </NavLink>
            )}

            {/* Reports - Only for patients */}
            {token && user?.role === "patient" && (
              <NavLink
                className={({ isActive }) =>
                  `font-label text-sm transition-colors ${isActive ? "text-primary font-semibold" : "text-gray-600 hover:text-primary"}`
                }
                to="/reports"
              >
                Reports
              </NavLink>
            )}

            {/* Profile / About */}
            <NavLink
              className={({ isActive }) =>
                `font-label text-sm transition-colors ${isActive ? "text-primary font-semibold" : "text-gray-600 hover:text-primary"}`
              }
              to={getNav3Link()}
            >
              {getNav3Name()}
            </NavLink>
          </div>
        </div>

        {/* Right Side - User Menu */}
        <div className="flex items-center gap-4">
          {!token ? (
            // Not logged in
            <>
              <Link
                className="text-gray-700 font-semibold text-sm px-4 py-2 flex items-center justify-center hover:bg-gray-50 rounded-md transition-all border border-transparent hover:border-gray-200"
                to="/login"
              >
                Login
              </Link>
              <Link
                to="/role-selection"
                className="flex items-center justify-center bg-primary text-white font-semibold text-sm px-5 py-2 rounded-md shadow-sm hover:opacity-90 transition-all"
                style={{ background: "#006063" }}
              >
                Get Started
              </Link>
            </>
          ) : (
            // Logged in - User Menu
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 hover:bg-gray-50 p-1.5 pr-3 rounded-xl transition-all border border-transparent hover:border-gray-200"
              >
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-2xl ${getUserRoleBadge()} border border-current/20`}
                >
                  <span className="text-sm font-bold">
                    {getUserName().charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="hidden sm:block text-left">
                  <span className="font-label text-sm font-semibold text-gray-700">
                    {getUserName()}
                  </span>
                  <p className="text-[10px] text-gray-400 capitalize -mt-0.5">
                    {user?.role}
                  </p>
                </div>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 text-gray-400 hidden sm:block"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-2 flex flex-col z-50 overflow-hidden">
                  {/* User Info */}
                  <div className="px-4 py-3 border-b border-gray-100 mb-1">
                    <p className="text-sm font-semibold text-gray-900">
                      {user?.name}
                    </p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                    <span
                      className={`inline-block mt-1 px-2 py-0.5 text-[10px] font-medium rounded-full capitalize ${getUserRoleBadge()}`}
                    >
                      {user?.role}
                    </span>
                  </div>

                  {/* Menu Items - Role Based */}
                  <Link
                    to="/profile"
                    className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary transition-colors flex items-center gap-2"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                    My Profile
                  </Link>

                  {/* Role-specific menu items */}
                  {user?.role === "patient" && (
                    <>
                      <Link
                        to="/patient-dashboard"
                        className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary transition-colors flex items-center gap-2"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                          />
                        </svg>
                        Dashboard
                      </Link>
                      <Link
                        to="/payment-history"
                        className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary transition-colors flex items-center gap-2"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                          />
                        </svg>
                        Payments
                      </Link>
                    </>
                  )}

                  {user?.role === "doctor" && (
                    <>
                      <Link
                        to="/doctor"
                        className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary transition-colors flex items-center gap-2"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                          />
                        </svg>
                        Dashboard
                      </Link>
                      <Link
                        to="/appointments"
                        className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary transition-colors flex items-center gap-2"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        Appointments
                      </Link>
                    </>
                  )}

                  {user?.role === "admin" && (
                    <Link
                      to="/admin"
                      className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary transition-colors flex items-center gap-2"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      Admin Panel
                    </Link>
                  )}

                  <div className="border-t border-gray-100 my-1"></div>

                  <button
                    onClick={() => {
                      setIsDropdownOpen(false);
                      handleLogout();
                    }}
                    className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2 w-full text-left"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                      />
                    </svg>
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
