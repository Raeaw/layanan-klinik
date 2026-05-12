import { useState, useEffect } from 'react';
import { api } from '../api';
import { Plus, X, Pencil, ArrowLeft, ChevronRight, Stethoscope, Users, ClipboardList } from 'lucide-react';

const fmt = {
  date:     (d) => new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }),
  currency: (n) => 'Rp ' + Number(n).toLocaleString('id-ID'),
};

const inputCls = 'w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-300';

function DokterModal({ onClose, onSaved, existing }) {
  const [form, setForm] = useState(
    existing ? { name: existing.name, specialization: existing.specialization || '' }
             : { name: '', specialization: '' }
  );
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    existing ? await api.updateDokter(existing.id, form) : await api.createDokter(form);
    setSaving(false);
    onSaved();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-800">{existing ? 'Edit Dokter' : 'Tambah Dokter'}</h2>
          <button onClick={onClose}><X size={18} className="text-slate-400" /></button>
        </div>
        <div className="px-6 py-4 space-y-3">
          <div>
            <label className="text-xs font-medium text-slate-600 mb-1 block">Nama Dokter *</label>
            <input className={inputCls} value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 mb-1 block">Spesialisasi</label>
            <input className={inputCls} placeholder="Umum, Gigi, Anak, dll" value={form.specialization}
              onChange={e => setForm(f => ({ ...f, specialization: e.target.value }))} />
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

function DokterDetail({ dokterId, onBack, onEdit }) {
  const [data, setData]       = useState(null);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    api.getDokterById(dokterId).then(setData);
  }, [dokterId]);

  if (!data) return <div className="p-8 text-center text-slate-400 text-sm">Memuat...</div>;

  const totalPasienUnik = new Set(data.services.map(s => s.patientId)).size;
  const totalPendapatan = data.services.reduce((s, l) => s + Number(l.total_cost), 0);

  return (
    <div>
      <button onClick={onBack}
        className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-4 transition-colors">
        <ArrowLeft size={14} /> Kembali ke daftar
      </button>

      {/* Info Dokter */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-4 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="bg-teal-50 rounded-xl p-2">
              <Stethoscope size={20} className="text-teal-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">{data.name}</h2>
              {data.specialization
                ? <span className="text-xs bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full font-medium">{data.specialization}</span>
                : <span className="text-xs text-slate-400">Spesialisasi tidak dicatat</span>}
            </div>
          </div>
        </div>
        <button onClick={onEdit}
          className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-teal-600 border border-slate-200 hover:border-teal-300 px-3 py-1.5 rounded-lg transition-colors">
          <Pencil size={12} /> Edit
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex items-center gap-3">
          <div className="bg-blue-50 rounded-xl p-2.5"><ClipboardList size={18} className="text-blue-500" /></div>
          <div>
            <p className="text-xs text-slate-500">Total Layanan</p>
            <p className="text-xl font-bold text-blue-600">{data.services.length}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex items-center gap-3">
          <div className="bg-purple-50 rounded-xl p-2.5"><Users size={18} className="text-purple-500" /></div>
          <div>
            <p className="text-xs text-slate-500">Pasien Unik</p>
            <p className="text-xl font-bold text-purple-600">{totalPasienUnik}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex items-center gap-3">
          <div className="bg-teal-50 rounded-xl p-2.5"><span className="text-teal-500 text-sm font-bold">Rp</span></div>
          <div>
            <p className="text-xs text-slate-500">Total Pendapatan</p>
            <p className="text-lg font-bold text-teal-600">{fmt.currency(totalPendapatan)}</p>
          </div>
        </div>
      </div>

      {/* Riwayat Layanan */}
      <h3 className="font-semibold text-slate-700 mb-3 text-sm">Riwayat Layanan ({data.services.length})</h3>
      {data.services.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center text-slate-400 text-sm">
          Belum ada layanan yang ditangani
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 text-xs text-slate-500 uppercase tracking-wide">
              <tr>
                <th className="text-left py-3 px-4">Tanggal</th>
                <th className="text-left py-3 px-4">Pasien</th>
                <th className="text-left py-3 px-4">Item</th>
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
                    <td className="py-3 px-4 text-sm font-medium text-slate-800">{svc.patient.name}</td>
                    <td className="py-3 px-4 text-sm text-slate-500">{svc.details.length} item</td>
                    <td className="py-3 px-4 text-right text-sm font-semibold text-teal-700">{fmt.currency(svc.total_cost)}</td>
                    <td className="py-3 px-4">
                      <ChevronRight size={14} className={`text-slate-400 transition-transform ${expanded === svc.id ? 'rotate-90' : ''}`} />
                    </td>
                  </tr>
                  {expanded === svc.id && (
                    <tr className="bg-teal-50/40">
                      <td colSpan={5} className="px-6 py-3">
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

export default function Dokter() {
  const [dokter, setDokter]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData]   = useState(null);
  const [selectedId, setSelectedId] = useState(null);

  const load = () => {
    setLoading(true);
    api.getDokter().then(d => { setDokter(d); setLoading(false); });
  };
  useEffect(load, []);

  const openEdit = (d) => { setEditData(d); setShowModal(true); };
  const closeModal = () => { setShowModal(false); setEditData(null); };

  if (selectedId) {
    const selected = dokter.find(d => d.id === selectedId);
    return (
      <DokterDetail
        dokterId={selectedId}
        onBack={() => setSelectedId(null)}
        onEdit={() => openEdit(selected)}
      />
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Manajemen Dokter</h1>
          <p className="text-sm text-slate-500 mt-0.5">{dokter.length} dokter terdaftar</p>
        </div>
        <button onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-teal-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-teal-700 transition-colors shadow-sm">
          <Plus size={16} /> Tambah Dokter
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-sm">Memuat data...</div>
        ) : (
          <table className="w-full">
            <thead className="bg-slate-50 text-xs text-slate-500 uppercase tracking-wide">
              <tr>
                <th className="text-left py-3 px-4">Nama Dokter</th>
                <th className="text-left py-3 px-4">Spesialisasi</th>
                <th className="text-right py-3 px-4">Total Layanan</th>
                <th className="py-3 px-4 w-8"></th>
              </tr>
            </thead>
            <tbody>
              {dokter.length === 0 ? (
                <tr><td colSpan={4} className="text-center py-12 text-slate-400 text-sm">Belum ada dokter</td></tr>
              ) : (
                dokter.map(d => (
                  <tr key={d.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 text-sm font-medium text-slate-800">{d.name}</td>
                    <td className="py-3 px-4">
                      {d.specialization
                        ? <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{d.specialization}</span>
                        : <span className="text-slate-400 text-sm">-</span>}
                    </td>
                    <td className="py-3 px-4 text-right text-sm text-slate-600">
                      {d._count?.services ?? '-'}
                    </td>
                    <td className="py-3 px-4 flex justify-end gap-2">
                      <button onClick={() => openEdit(d)} className="text-slate-400 hover:text-teal-600 transition-colors">
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => setSelectedId(d.id)} className="text-slate-400 hover:text-teal-600 transition-colors">
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

      {showModal && <DokterModal onClose={closeModal} onSaved={load} existing={editData} />}
    </div>
  );
}