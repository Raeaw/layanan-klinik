import { useState, useEffect } from 'react';
import { api } from '../api';
import { Search, Plus, ChevronRight, X, ArrowLeft, Phone, MapPin, Calendar, ClipboardList } from 'lucide-react';

const fmt = {
  date:     (d) => new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }),
  currency: (n) => 'Rp ' + Number(n).toLocaleString('id-ID'),
};

const inputCls = 'w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-300';

function TambahPasienModal({ onClose, onSaved }) {
  const [form, setForm] = useState({ name: '', contact: '', address: '' });
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!form.name.trim()) return;
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
            <input className={inputCls} value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 mb-1 block">Kontak</label>
            <input className={inputCls} placeholder="No. HP / email" value={form.contact}
              onChange={e => setForm(f => ({ ...f, contact: e.target.value }))} />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 mb-1 block">Alamat</label>
            <textarea className={inputCls} rows={2} value={form.address}
              onChange={e => setForm(f => ({ ...f, address: e.target.value }))} />
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
  const [data, setData]         = useState(null);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    api.getPasienById(pasienId).then(setData);
  }, [pasienId]);

  if (!data) return <div className="p-8 text-center text-slate-400 text-sm">Memuat...</div>;

  const totalBiaya = data.services.reduce((s, l) => s + Number(l.total_cost), 0);

  return (
    <div>
      <button onClick={onBack}
        className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-4 transition-colors">
        <ArrowLeft size={14} /> Kembali ke daftar
      </button>

      {/* Info Pasien */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-4">
        <h2 className="text-lg font-bold text-slate-800 mb-3">{data.name}</h2>
        <div className="space-y-2">
          {data.contact && (
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Phone size={14} className="text-slate-400 shrink-0" />
              {data.contact}
            </div>
          )}
          {data.address && (
            <div className="flex items-start gap-2 text-sm text-slate-600">
              <MapPin size={14} className="text-slate-400 shrink-0 mt-0.5" />
              {data.address}
            </div>
          )}
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Calendar size={12} className="shrink-0" />
            Terdaftar {fmt.date(data.created_at)}
          </div>
        </div>
      </div>

      {/* Stat */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex items-center gap-3">
          <div className="bg-blue-50 rounded-xl p-2.5"><ClipboardList size={18} className="text-blue-500" /></div>
          <div>
            <p className="text-xs text-slate-500">Total Kunjungan</p>
            <p className="text-xl font-bold text-blue-600">{data.services.length}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex items-center gap-3">
          <div className="bg-teal-50 rounded-xl p-2.5"><span className="text-teal-500 text-sm font-bold">Rp</span></div>
          <div>
            <p className="text-xs text-slate-500">Total Biaya</p>
            <p className="text-lg font-bold text-teal-600">{fmt.currency(totalBiaya)}</p>
          </div>
        </div>
      </div>

      {/* Riwayat Layanan */}
      <h3 className="font-semibold text-slate-700 mb-3 text-sm">Riwayat Layanan ({data.services.length})</h3>
      {data.services.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center text-slate-400 text-sm">
          Belum ada riwayat layanan
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 text-xs text-slate-500 uppercase tracking-wide">
              <tr>
                <th className="text-left py-3 px-4">Tanggal</th>
                <th className="text-left py-3 px-4">Dokter</th>
                <th className="text-right py-3 px-4">Total</th>
                <th className="py-3 px-4 w-8"></th>
              </tr>
            </thead>
            <tbody>
              {data.services.map(svc => (
                <>
                  <tr key={svc.id}
                    className="border-b border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer"
                    onClick={() => setExpanded(prev => prev === svc.id ? null : svc.id)}>
                    <td className="py-3 px-4 text-sm text-slate-600">{fmt.date(svc.service_date)}</td>
                    <td className="py-3 px-4 text-sm text-slate-700">{svc.doctor.name}</td>
                    <td className="py-3 px-4 text-right text-sm font-semibold text-teal-700">{fmt.currency(svc.total_cost)}</td>
                    <td className="py-3 px-4">
                      <ChevronRight size={14} className={`text-slate-400 transition-transform ${expanded === svc.id ? 'rotate-90' : ''}`} />
                    </td>
                  </tr>
                  {expanded === svc.id && (
                    <tr className="bg-teal-50/40">
                      <td colSpan={4} className="px-6 py-3">
                        {svc.notes && <p className="text-xs text-slate-500 italic mb-2">"{svc.notes}"</p>}
                        <div className="space-y-1">
                          {svc.details.map(d => (
                            <div key={d.id} className="flex justify-between text-xs text-slate-600">
                              <span>{d.item_name} × {d.quantity}</span>
                              <span>{fmt.currency(Number(d.price_at_the_time) * d.quantity)}</span>
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
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
                <th className="py-3 px-4 w-8"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-12 text-slate-400 text-sm">Belum ada pasien</td></tr>
              ) : (
                filtered.map(p => (
                  <tr key={p.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer"
                    onClick={() => setSelectedId(p.id)}>
                    <td className="py-3 px-4 text-sm font-medium text-slate-800">{p.name}</td>
                    <td className="py-3 px-4 text-sm text-slate-600">{p.contact || '-'}</td>
                    <td className="py-3 px-4 text-sm text-slate-600 max-w-xs truncate">{p.address || '-'}</td>
                    <td className="py-3 px-4 text-sm text-slate-500">{fmt.date(p.created_at)}</td>
                    <td className="py-3 px-4">
                      <ChevronRight size={16} className="text-slate-400" />
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