import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Star, 
  Verified, 
  MapPin, 
  Calendar, 
  Languages, 
  Video, 
  ChevronDown, 
  Info, 
  Users,
  Award,
  Stethoscope,
  Home,
  FileText,
  UserCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';
import { useState } from 'react';

export default function FindDoctor() {

  const navigate = useNavigate();
  const [allDoctors, setAllDoctors] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('All');

  const filteredDoctors = allDoctors.filter(doc => {
    const matchesSpecialty = selectedSpecialty === 'All' || doc.specialty?.toLowerCase() === selectedSpecialty.toLowerCase();
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = !searchLower || 
      doc.name?.toLowerCase().includes(searchLower) || 
      doc.specialty?.toLowerCase().includes(searchLower);
    return matchesSpecialty && matchesSearch;
  });

  useEffect(() => {

    const token = localStorage.getItem('token');

    if (!token) {
      toast.error('Please log in to view doctors');
      navigate('/login');
      return;
    }

    const fetchDoctors = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/doctors`)
        const doctorsFromApi = response.data.data;

        const mappedDoctors = doctorsFromApi.map((d) => {

          let availabilityText = null;
          
          if (Array.isArray(d.availability) && d.availability.length > 0) {
            availabilityText = 'Available Today';
          }

          return {
            ...d,
            availability: availabilityText,
            tags: [
              ...(d.isVerified
                ? [{ icon: <Verified size={14} />, label: 'Verified doctor' }]
                : []),
              { icon: <MapPin size={14} />, label: 'Online' },
            ],
          };
        });

        console.log('Mapped doctors:', mappedDoctors);
        setAllDoctors(mappedDoctors);
        toast.success('Doctors fetched successfully');

      } catch (error) {
        toast.error('Failed to fetch doctors', error);
      }
    }

    fetchDoctors();

  }, []);

  return (
    <div className="bg-neutral font-body text-on-surface">
      <main className="max-w-7xl mx-auto flex flex-col md:flex-row min-h-screen px-8 py-8 gap-8 items-start">
        
        {/* Filter Sidebar */}
        <aside className="w-full md:w-64 lg:w-72 shrink-0 sticky top-8">
          <div className="bg-white p-5 rounded-xl space-y-6 border border-gray-200 shadow-sm max-h-[calc(100vh-4rem)] overflow-y-auto hover:scrollbar-thin">
            <div className="flex items-center justify-between">
              <h2 className="font-headline font-bold text-xl text-primary">Filters</h2>
              <button 
                onClick={() => { setSelectedSpecialty('All'); setSearchQuery(''); }}
                className="text-sm font-semibold text-primary/70 hover:text-primary"
              >
                Clear all
              </button>
            </div>

            {/* Specialty */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Specialty</h3>
              <div className="space-y-2">
                {['All', 'Cardiology', 'Pediatrics', 'Dermatology', 'Neurology', 'Psychiatry', 'Orthopedics', 'Ophthalmology', 'Gastroenterology'].map((spec) => (
                  <label key={spec} className="flex items-center group cursor-pointer" onClick={(e) => e.stopPropagation()}>
                    <input 
                      type="radio" 
                      name="specialty"
                      checked={selectedSpecialty === spec}
                      onChange={() => setSelectedSpecialty(spec)}
                      className="text-primary focus:ring-primary mr-3 h-4 w-4 border-outline-variant bg-surface-container-lowest" 
                    />
                    <span className={`text-black text-sm transition-colors ${selectedSpecialty === spec ? 'font-semibold text-primary' : 'group-hover:text-primary'}`}>
                      {spec}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Insight Chip */}
            <div className="pt-4 border-t border-outline-variant/20">
              <div className="bg-secondary-fixed/50 p-3 rounded-lg">
                <p className="text-xs font-medium text-on-secondary-fixed-variant leading-relaxed flex items-start gap-2">
                  <Info size={14} className="mt-0.5 shrink-0" />
                  Showing pediatricians with 4.5+ star ratings available this week.
                </p>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <section className="grow space-y-8">
          {/* Search & Headline Section */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="font-headline text-2xl font-bold text-gray-900 tracking-tight">Find Specialists</h1>
              <p className="text-gray-500 mt-1 text-sm">{filteredDoctors.length} doctors available in your network.</p>
            </div>
            <div className="flex-1 max-w-md relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by doctor name, specialty, or condition..." 
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-shadow"
              />
            </div>
          </div>

          {/* Doctor Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {filteredDoctors.map((doc, i) => (
              <div key={i} className="bg-white p-4 rounded-xl transition-all duration-200 hover:shadow-md flex flex-row items-start gap-4 group border border-gray-100 hover:border-primary/40">
                <div className="w-16 h-16 sm:w-20 sm:h-20 shrink-0 rounded-full overflow-hidden relative border border-gray-200 shadow-sm mt-1">
                  <img src="/user.jpg" alt={doc.name} className="w-full h-full object-cover" />
                </div>

                <div className="grow flex flex-col justify-between min-w-0">
                  <div>
                    <div className="flex justify-between items-start gap-2">
                       <div className="truncate">
                        <h3 className="font-headline text-base font-bold text-gray-900 truncate">{doc.name}</h3>
                        <p className="text-primary font-medium text-[13px] truncate">{doc.specialty}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-[9px] text-gray-400 uppercase font-bold tracking-widest mb-0.5">Fee</p>
                        <p className="text-sm font-bold text-gray-900">{doc.consultationFee}</p>
                      </div>
                    </div>

                    <div className="mt-2.5 flex flex-wrap gap-1.5">
                      {doc.availability && (
                        <span className="bg-green-50 px-2 py-0.5 rounded text-[10px] font-bold text-green-700 flex items-center gap-1 border border-green-100">
                          <Calendar size={10} />
                          {doc.availability}
                        </span>
                      )}
                      {(doc.tags || []).map((tag, idx) => (
                        <span key={idx} className="bg-gray-50 px-2 py-0.5 rounded text-[10px] font-medium text-gray-600 flex items-center gap-1 border border-gray-100">
                          {tag.icon}
                          {tag.label}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-3.5 flex gap-2">
                    <button className="flex-1 py-1.5 px-2 rounded-md font-semibold text-[11px] border border-gray-200 text-gray-600 hover:text-gray-800 hover:bg-gray-50 transition-colors uppercase tracking-wide">
                      Profile
                    </button>
                    <button 
                      className="bg-primary flex-[1.5] py-1.5 px-2 rounded-md font-semibold text-[11px] text-white shadow-sm hover:opacity-90 active:scale-95 transition-all uppercase tracking-wide"
                    >
                      Book Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </section>
      </main>

      {/* BottomNavBar (Mobile Only) */}
      <nav className="fixed bottom-0 left-0 w-full z-50 md:hidden bg-white border-t border-gray-200 flex justify-around items-center px-4 pb-safe py-2 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
        <a className="flex flex-col items-center justify-center text-gray-500 hover:text-primary transition-colors" href="#">
          <Home size={18} />
          <span className="font-label text-[10px] font-semibold mt-1">Home</span>
        </a>
        <a className="flex flex-col items-center justify-center bg-primary/10 text-primary rounded-md px-4 py-1" href="#">
          <Search size={18} />
          <span className="font-label text-[10px] font-semibold mt-1">Find</span>
        </a>
        <a className="flex flex-col items-center justify-center text-gray-500 hover:text-primary transition-colors" href="#">
          <FileText size={18} />
          <span className="font-label text-[10px] font-semibold mt-1">Records</span>
        </a>
        <a className="flex flex-col items-center justify-center text-gray-500 hover:text-primary transition-colors" href="#">
          <UserCircle size={18} />
          <span className="font-label text-[10px] font-semibold mt-1">Profile</span>
        </a>
      </nav>
    </div>
  );
}
