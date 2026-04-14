import { MdSend } from 'react-icons/md';

export default function Footer() {
  return (
    <footer className="bg-tertiary pt-16 pb-8 px-4 sm:px-6 border-t border-[#006063]/10 mt-12">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          <div className="col-span-1">
            <span className="text-2xl font-black text-primary tracking-tight font-headline block mb-6">CareBridge</span>
            <p className="text-on-surface-variant leading-relaxed">Redefining clinical standards for the digital era.</p>
          </div>
          <div>
            <h4 className="font-headline font-bold text-on-surface mb-6 uppercase text-sm tracking-widest">Platform</h4>
            <ul className="space-y-4 text-on-surface-variant font-medium text-sm">
              <li><a className="hover:text-primary transition-colors" href="#">For Patients</a></li>
              <li><a className="hover:text-primary transition-colors" href="#">For Doctors</a></li>
              <li><a className="hover:text-primary transition-colors" href="#">Security & Privacy</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-headline font-bold text-on-surface mb-6 uppercase text-sm tracking-widest">Company</h4>
            <ul className="space-y-4 text-on-surface-variant font-medium text-sm">
              <li><a className="hover:text-primary transition-colors" href="#">About Us</a></li>
              <li><a className="hover:text-primary transition-colors" href="#">Contact</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-headline font-bold text-on-surface mb-6 uppercase text-sm tracking-widest">Newsletter</h4>
            <div className="flex gap-2">
              <input className="flex-1 bg-white border border-[#006063]/10 rounded-xl px-4 text-sm focus:ring-2 focus:ring-primary shadow-sm" placeholder="Email" type="email"/>
              <button className="bg-primary text-white p-3 rounded-xl flex items-center justify-center hover:opacity-90 transition-opacity" style={{ background: 'linear-gradient(135deg, #006063 0%, #007b7f 100%)' }}>
                <MdSend className="text-xl" />
              </button>
            </div>
          </div>
        </div>
        <p className="text-on-surface-variant text-sm text-center pt-8 border-t border-[#006063]/10">© 2026 MediTeal Health Systems Inc.</p>
      </div>
    </footer>
  );
}