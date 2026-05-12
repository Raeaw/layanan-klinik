import { Activity } from 'lucide-react';

export default function Navbar() {
  return (
    <header className="h-14 bg-white border-b border-slate-200 flex items-center px-6 gap-3 shadow-sm">
      <Activity className="text-teal-600" size={20} />
      <span className="font-bold text-slate-800 text-lg tracking-tight">KLINIK</span>
    </header>
  );
}