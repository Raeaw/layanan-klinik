import { useState, useEffect } from 'react';
import { api } from '../api';
import { Users, ClipboardList, Pill, TrendingUp } from 'lucide-react';

const fmt = {
  currency: (n) => 'Rp ' + Number(n).toLocaleString('id-ID'),
  date: (d) => new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }),
};

function StatCard({ label, value, icon: Icon, color = 'teal' }) {
  const colors = {
    teal:   { bg: 'bg-teal-50',   text: 'text-teal-700',   icon: 'text-teal-500' },
    blue:   { bg: 'bg-blue-50',   text: 'text-blue-700',   icon: 'text-blue-500' },
    amber:  { bg: 'bg-amber-50',  text: 'text-amber-700',  icon: 'text-amber-500' },
    purple: { bg: 'bg-purple-50', text: 'text-purple-700', icon: 'text-purple-500' },
  };
  const c = colors[color];
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex items-center gap-4">
      <div className={`${c.bg} rounded-xl p-3`}>
        <Icon size={22} className={c.icon} />
      </div>
      <div>
        <p className="text-xs text-slate-500 font-medium">{label}</p>
        <p className={`text-2xl font-bold mt-0.5 ${c.text}`}>{value}</p>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [recentLayanan, setRecentLayanan] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.getPasien(),
      api.getLayanan(),
      api.getObat(),
    ]).then(([pasien, layanan, obat]) => {
      const totalPendapatan = layanan.reduce((s, l) => s + Number(l.total_cost), 0);
      setStats({
        totalPasien: pasien.length,
        totalLayanan: layanan.length,
        totalObat: obat.length,
        totalPendapatan,
      });
      setRecentLayanan(layanan.slice(0, 5));
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-slate-400 text-sm">Memuat data...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-800">Dashboard</h1>
        <p className="text-sm text-slate-500 mt-0.5">Ringkasan data klinik</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <StatCard label="Total Pasien"     value={stats.totalPasien}                    icon={Users}          color="teal"   />
        <StatCard label="Total Layanan"    value={stats.totalLayanan}                   icon={ClipboardList}  color="blue"   />
        <StatCard label="Jenis Obat"       value={stats.totalObat}                      icon={Pill}           color="amber"  />
        <StatCard label="Total Pendapatan" value={fmt.currency(stats.totalPendapatan)}  icon={TrendingUp}     color="purple" />
      </div>

      {/* Layanan Terbaru */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-700 text-sm">Layanan Terbaru</h2>
        </div>
        {recentLayanan.length === 0 ? (
          <p className="text-center py-10 text-slate-400 text-sm">Belum ada layanan</p>
        ) : (
          <table className="w-full">
            <thead className="bg-slate-50 text-xs text-slate-500 uppercase tracking-wide">
              <tr>
                <th className="text-left py-3 px-4">Tanggal</th>
                <th className="text-left py-3 px-4">Pasien</th>
                <th className="text-left py-3 px-4">Dokter</th>
                <th className="text-right py-3 px-4">Total</th>
              </tr>
            </thead>
            <tbody>
              {recentLayanan.map(l => (
                <tr key={l.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 text-sm text-slate-600">{fmt.date(l.service_date)}</td>
                  <td className="py-3 px-4 text-sm font-medium text-slate-800">{l.patient.name}</td>
                  <td className="py-3 px-4 text-sm text-slate-600">{l.doctor.name}</td>
                  <td className="py-3 px-4 text-right text-sm font-semibold text-teal-700">{fmt.currency(l.total_cost)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}