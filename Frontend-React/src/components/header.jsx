import { Link } from "react-router-dom";

export default function Header() {
  return (
    <nav className="w-full top-0 sticky z-50 bg-white/80 backdrop-blur-xl border-b border-primary/5">
      <div className="flex justify-between items-center py-4 max-w-6xl mx-auto">
        <div className="flex items-center gap-8">
          <span className="text-2xl font-black text-primary tracking-tight font-headline">CareBridge</span>
          <div className="hidden md:flex gap-6 items-center">
            <Link className="text-primary font-bold font-label text-sm transition-colors" to="/">Home</Link>
            <Link className="text-on-surface opacity-70 font-label text-sm hover:opacity-100 transition-colors" to="#">Services</Link>
            <Link className="text-on-surface opacity-70 font-label text-sm hover:opacity-100 transition-colors" to="#">Resources</Link>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Link className="text-primary font-bold text-sm px-4 py-2 hover:bg-primary/10 rounded-lg transition-all" to="/login">Login</Link>
          <Link 
            to="/role-selection"
            className="bg-primary text-white font-bold text-sm px-5 py-2.5 rounded-lg shadow-sm hover:scale-[1.02] transition-all" 
            style={{ background: 'linear-gradient(135deg, #006063 0%, #007b7f 100%)' }}
          >
            Get Started
          </Link>
        </div>
      </div>
    </nav>
  );
}