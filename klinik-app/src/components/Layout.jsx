import { NavLink } from 'react-router-dom';
import {
  ClipboardList, Users, Pill, Activity, LayoutDashboard, Stethoscope
} from 'lucide-react';

const nav = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/layanan', label: 'Layanan',  icon: ClipboardList },
  { to: '/pasien',  label: 'Pasien',   icon: Users },
  { to: '/obat',    label: 'Obat',     icon: Pill },
  { to: '/dokter',  label: 'Dokter',  icon: Stethoscope },
];

export default function Layout({ children }) {
  return (
    <div className="flex h-screen bg-slate-50 font-sans">
      {/* Sidebar */}
      <aside className="w-56 bg-white border-r border-slate-200 flex flex-col">
        <div className="px-5 py-5 border-b border-slate-100 flex items-center gap-2">
          <Activity className="text-teal-600" size={20} />
          <span className="font-bold text-slate-800 text-lg tracking-tight">KLINIK</span>
        </div>
        <nav className="flex-1 py-4 px-2 space-y-1">
          {nav.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                 ${isActive
                   ? 'bg-teal-50 text-teal-700'
                   : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`
              }
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="px-5 py-4 border-t border-slate-100 text-xs text-slate-400">
          Sistem Klinik Lokal
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto p-6">
        {children}
      </main>
    </div>
  );
}