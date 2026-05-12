import { useState, useEffect } from 'react';
import { api } from '../api';
import { Search, Plus, ChevronRight, X, ArrowLeft } from 'lucide-react';

const fmt = {
  date:     (d) => new Date(d).toLocaleDateString('id-ID', { day:'2-digit', month:'short', year:'numeric' }),
  currency: (n) => 'Rp ' + Number(n).toLocaleString('id-ID'),
};

function TambahPasienModal({ onClose, onSaved }) {
  const [form, setForm] = useState({ name: '', contact: '', address: '' });
  const [saving, setSaving] = useState(false);
  const inputCls = 'w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-300';

  const submit = async () => {
    if (!form.name.trim()) return alert('Nama wajib diisi');
    setSaving(true);
    await api.createPasien(form);
    setSaving(false);
    onSaved();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-800">Tambah Pasien</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
        </div>
        <div className="px-6 py-4 space-y-3">
          <div>
            <label className="text-xs font-medium text-slate-600 mb-1 block">Nama *</label>
            <input className={inputCls} value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 mb-1 block">Kontak</label>
            <input className={inputCls} placeholder="No. HP / email" value={form.contact}
              onChange={e => setForm(f => ({...f, contact: e.target.value}))} />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 mb-1 block">Alamat</label>
            <textarea className={inputCls} rows={2} value={form.address}
              onChange={e => setForm(f => ({...f, address: e.target.value}))} />
          </div>
        </div>
        <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg">Batal</button>
          <button onClick={submit} disabled={saving}
            className="px-4 py-2 text-sm bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-60">
            {saving ? 'Menyimpan...' : 'Simpan'}
          </button>
        </div>
      </div>
    </div>
  );
}

function PasienDetail({ pasienId, onBack }) {
  const [data, setData] = useState(null);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    api.getPasienById(pasienId).then(setData);
  }, [pasienId]);

  if (!data) return <div className="p-8 text-center text-slate-400 text-sm">Memuat...</div>;

  return (
    <div>
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-4 transition-colors">
        <ArrowLeft size={14} /> Kembali ke daftar
      </button>
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-4">
        <h2 className="text-lg font-bold text-slate-800">{data.name}</h2>
        {data.contact && <p className="text-sm text-slate-500 mt-1">📞 {data.contact}</p>}
        {data.address && <p className="text-sm text-slate-500">📍 {data.address}</p>}
        <p className="text-xs text-slate-400 mt-2">Terdaftar: {fmt.date(data.created_at)}</p>
      </div>

      <h3 className="font-semibold text-slate-700 mb-3">Riwayat Layanan ({data.services.length})</h3>
      {data.services.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-400 text-sm">
          Belum ada riwayat layanan
        </div>
      ) : (
        <div className="space-y-2">
          {data.services.map(svc => (
            <div key={svc.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <button
                onClick={() => setExpanded(prev => prev === svc.id ? null : svc.id)}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-slate-800">{fmt.date(svc.service_date)}</span>
                  <span className="text-xs text-slate-500">{svc.doctor.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-teal-700">{fmt.currency(svc.total_cost)}</span>
                  <ChevronRight size={14} className={`text-slate-400 transition-transform ${expanded === svc.id ? 'rotate-90' : ''}`} />
                </div>
              </button>
              {expanded === svc.id && (
                <div className="px-4 pb-3 border-t border-slate-100">
                  {svc.notes && <p className="text-xs text-slate-500 italic mt-2 mb-2">"{svc.notes}"</p>}
                  <div className="space-y-1">
                    {svc.details.map(d => (
                      <div key={d.id} className="flex justify-between text-xs text-slate-600 py-0.5">
                        <span>{d.item_name} × {d.quantity}</span>
                        <span>{fmt.currency(Number(d.price_at_the_time) * d.quantity)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Pasien() {
  const [pasien, setPasien]         = useState([]);
  const [search, setSearch]         = useState('');
  const [showModal, setShowModal]   = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading]       = useState(true);

  const load = () => {
    setLoading(true);
    api.getPasien().then(d => { setPasien(d); setLoading(false); });
  };
  useEffect(load, []);

  const filtered = pasien.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  if (selectedId) return <PasienDetail pasienId={selectedId} onBack={() => setSelectedId(null)} />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Data Pasien</h1>
          <p className="text-sm text-slate-500 mt-0.5">{pasien.length} pasien terdaftar</p>
        </div>
        <button onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-teal-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-teal-700 transition-colors shadow-sm">
          <Plus size={16} /> Tambah Pasien
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input className="w-64 pl-8 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-300"
              placeholder="Cari nama pasien..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-sm">Memuat data...</div>
        ) : (
          <table className="w-full">
            <thead className="bg-slate-50 text-xs text-slate-500 uppercase tracking-wide">
              <tr>
                <th className="text-left py-3 px-4">Nama</th>
                <th className="text-left py-3 px-4">Kontak</th>
                <th className="text-left py-3 px-4">Alamat</th>
                <th className="text-left py-3 px-4">Terdaftar</th>
                <th className="py-3 px-4 w-10"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-12 text-slate-400 text-sm">Belum ada pasien</td></tr>
              ) : (
                filtered.map(p => (
                  <tr key={p.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 text-sm font-medium text-slate-800">{p.name}</td>
                    <td className="py-3 px-4 text-sm text-slate-600">{p.contact || '-'}</td>
                    <td className="py-3 px-4 text-sm text-slate-600 max-w-xs truncate">{p.address || '-'}</td>
                    <td className="py-3 px-4 text-sm text-slate-500">{fmt.date(p.created_at)}</td>
                    <td className="py-3 px-4">
                      <button onClick={() => setSelectedId(p.id)}
                        className="text-teal-600 hover:text-teal-700 transition-colors">
                        <ChevronRight size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
      {showModal && <TambahPasienModal onClose={() => setShowModal(false)} onSaved={load} />}
    </div>
  );
}