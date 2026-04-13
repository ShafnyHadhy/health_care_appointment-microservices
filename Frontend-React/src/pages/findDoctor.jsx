import React from 'react';
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

export default function FindDoctor() {
  const doctors = [
    {
      name: "Dr. Julian Rivera",
      specialty: "Pediatric Cardiology",
      rating: "4.9",
      fee: "$75",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDTypzQWtsqKTSvWV0vrlbFdtQz-UrQcK2MYdepdwhm8cGIVvNt-qQM2cuZgMNZJG5J88iZkLtJQjwMtKZWSFsTu7Qe4gFjm4N-x-JlyiMgxYVUIkJ59d4vdTq4CYZD65Rs0tXcTBpyjRuuc5MUVSyXOV2ZZdft87ZcQ9KAfvoe79B7guioiioJspfjPGZVayPJnypy0oD2iagt9oEp_629LwtYNKhagtPRy0MccG1vlz8FhRD3jDtjlxHHpjqAvFISii4Q_sLxSGk",
      tags: [
        { icon: <ShieldCheck size={14} />, label: "Accepts Aetna" },
        { icon: <MapPin size={14} />, label: "2.4 miles away" }
      ],
      availability: null
    },
    {
      name: "Dr. Sarah Jenkins",
      specialty: "General Pediatrics",
      rating: "4.8",
      fee: "$50",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuD7AZsaTOVtI_AOJe8RD1AqLlJhH1uenMGrK42mEULorxjGG8d9UF0ZBaouSX8ytS-xZNgdSE8hclMfJu6YBKpCv3duD1b6-UqonxRXVO0ObYI1_hwiHqjJ95XE3L1dP0DkDcI8l0NjO7Ja309DMLV3E9YEdHm3rwASiJG70emjMdYXx76pllX3miG4lSv5kzO9Zb94hrC9TQlBmXPyHtSz6R011YOo-s9zunjuCsgpomOJfo9PjBCxczsgei5jgVGp9Yxexjvi-SM",
      tags: [
        { icon: <Languages size={14} />, label: "Spanish, English" }
      ],
      availability: "Available Today"
    },
    {
      name: "Dr. Michael Chen",
      specialty: "Pediatric Endocrinology",
      rating: "5.0",
      fee: "$120",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBG0ezZtaLsRmYGjZLM9MIrXwNrZCZfe5oI2lE9QApv0NNOajvnlBF8SffgKSLKI-a6LYjm1gUCyTDq5wEKc-8VpknlstEhVyziSFSIsrJ2I4abTLJ3vPlaIXT9wbu7QystEfyCr4KfsdBJOQnbEF0aDl-YyXEG__Vae90ICI_PlaGtd-Udg-AUbo9DccAjD7Ofxy7qunlJbMV7CWICWqn0D3yRWbzTNzNE6htgOZwZcXBAbwcOaOVfQfNgaOdlCm7O9MkpQowOGP0",
      tags: [
        { icon: <Video size={14} />, label: "Virtual Visit" },
        { icon: <Users size={14} />, label: "15+ yrs exp" }
      ],
      availability: null
    },
    {
      name: "Dr. Elena Petrova",
      specialty: "Pediatric Neurology",
      rating: "4.7",
      fee: "$110",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCvBjue46sFbNUekRSotgMDyhzjgz-obiMgLrDRWeqUd1X3zfhij825zQjrd6OHxseZTUOl-444VZDLLNLl0eA63tRQaV3shCUf-BdcGt1FCk3n3YUJhcFQaT37M5xi1T27fAGxOkW7Nwe0dUuzuvoyIcoQHfooPRVubfoVsGvAv0bBeF9c2gwWdlh2hOw37HDEPbUFGPpovT7YYOtbZKKGr3YGVTAb1F8ppdAxszMe7cWe7J6eHGPtj8b1ytCoEeYfBUJ2MCMI6Es",
      tags: [
        { icon: <Award size={14} />, label: "Top Rated 2023" },
        { icon: <Stethoscope size={14} />, label: "Board Certified" }
      ],
      availability: null
    }
  ];

  return (
    <div className="bg-neutral font-body text-on-surface">
      <main className="max-w-7xl mx-auto flex flex-col md:flex-row min-h-screen px-8 py-8 gap-8">
        
        {/* Filter Sidebar */}
        <aside className="w-full md:w-64 lg:w-72 shrink-0">
          <div className="sticky top-24 bg-white p-5 rounded-md space-y-6 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="font-headline font-bold text-xl text-primary">Filters</h2>
              <button className="text-sm font-semibold text-primary/70 hover:text-primary">Clear all</button>
            </div>

            {/* Specialty */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-on-surface-variant">Specialty</h3>
              <div className="space-y-2">
                {['Cardiology', 'Pediatrics', 'Dermatology', 'Neurology'].map((spec) => (
                  <label key={spec} className="flex items-center group cursor-pointer">
                    <input 
                      type="checkbox" 
                      defaultChecked={spec === 'Pediatrics'}
                      className="rounded text-primary focus:ring-primary mr-3 h-5 w-5 border-outline-variant bg-surface-container-lowest" 
                    />
                    <span className={`text-on-surface transition-colors ${spec === 'Pediatrics' ? 'font-semibold' : 'group-hover:text-primary'}`}>
                      {spec}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Availability */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-on-surface-variant">Availability</h3>
              <div className="flex flex-wrap gap-2">
                <button className="px-4 py-2 rounded-md text-xs font-semibold bg-primary text-on-primary">Today</button>
                <button className="px-4 py-2 rounded-md text-xs font-semibold bg-surface-container-highest text-on-surface hover:bg-surface-variant transition-colors">This Week</button>
                <button className="px-4 py-2 rounded-md text-xs font-semibold bg-surface-container-highest text-on-surface hover:bg-surface-variant transition-colors">Next Week</button>
              </div>
            </div>

            {/* Fee Range */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold uppercase tracking-wider text-on-surface-variant">Consultation Fee</h3>
                <span className="text-xs font-bold text-primary">$20 - $250</span>
              </div>
              <input 
                type="range" 
                className="w-full h-1 bg-outline-variant rounded-lg appearance-none cursor-pointer accent-primary" 
              />
              <div className="flex justify-between text-[10px] text-outline">
                <span>$20</span>
                <span>$500+</span>
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
              <p className="text-gray-500 mt-1 text-sm">24 pediatricians available in your network.</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500">Sort by:</span>
              <button className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-md border border-gray-200 font-semibold text-sm hover:bg-gray-50 transition-colors text-gray-700 shadow-sm">
                Highest Rating
                <ChevronDown size={16} />
              </button>
            </div>
          </div>

          {/* Doctor Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {doctors.map((doc, i) => (
              <div key={i} className="bg-white p-4 rounded-md transition-all duration-300 hover:shadow-sm flex flex-col sm:flex-row gap-4 group border border-gray-200 hover:border-primary/30">
                <div className="w-full sm:w-36 h-40 sm:h-auto rounded-md overflow-hidden relative border border-gray-100">
                  <img src={doc.image} alt={doc.name} className="w-full h-full object-cover" />
                  <div className="absolute top-2 left-2 bg-white/90 backdrop-blur px-1.5 py-0.5 rounded flex items-center gap-1 shadow-sm border border-gray-100">
                    <Star size={12} className="text-yellow-500 fill-yellow-500" />
                    <span className="text-xs font-bold text-gray-900">{doc.rating}</span>
                  </div>
                </div>

                <div className="grow flex flex-col justify-between py-0.5">
                  <div>
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-headline text-lg font-bold text-gray-900">{doc.name}</h3>
                        <p className="text-primary font-medium text-sm">{doc.specialty}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Fee</p>
                        <p className="text-lg font-bold text-gray-900">{doc.fee}</p>
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {doc.availability && (
                        <span className="bg-green-50 px-2 py-1 rounded text-[10px] font-bold text-green-700 flex items-center gap-1 border border-green-100">
                          <Calendar size={12} />
                          {doc.availability}
                        </span>
                      )}
                      {doc.tags.map((tag, idx) => (
                        <span key={idx} className="bg-gray-50 px-2 py-1 rounded text-[10px] font-medium text-gray-600 flex items-center gap-1 border border-gray-100">
                          {tag.icon}
                          {tag.label}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <button className="flex-1 py-1.5 px-3 rounded-md font-semibold text-xs border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors">
                      View Profile
                    </button>
                    <button 
                      className="bg-primary flex-1 py-1.5 px-3 rounded-md font-semibold text-xs text-white shadow-sm hover:opacity-90 active:scale-95 transition-all"
                    >
                      Book Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Load More Button */}
          <div className="flex justify-center pt-4">
            <button className="group flex items-center gap-2 bg-white border border-gray-200 shadow-sm px-4 py-2 rounded-md font-semibold text-xs text-primary hover:bg-gray-50 transition-all duration-300">
              Load more specialists
              <ChevronDown size={14} className="group-hover:translate-y-0.5 transition-transform" />
            </button>
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

// Sub-component for icons used in mappings
function ShieldCheck({ size }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}