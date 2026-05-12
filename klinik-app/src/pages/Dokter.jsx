import { useState, useEffect } from 'react';
import { api } from '../api';
import { Plus, X, Pencil } from 'lucide-react';

const inputCls = 'w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-300';

function DokterModal({ onClose, onSaved, existing }) {
  const [form, setForm] = useState(
    existing ? { name: existing.name, specialization: existing.specialization || '' }
             : { name: '', specialization: '' }
  );
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!form.name.trim()) return alert('Nama wajib diisi');
    setSaving(true);
    if (existing) {
      await api.updateDokter(existing.id, form);
    } else {
      await api.createDokter(form);
    }
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

export default function Dokter() {
  const [dokter, setDokter]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData]   = useState(null);

  const load = () => {
    setLoading(true);
    api.getDokter().then(d => { setDokter(d); setLoading(false); });
  };
  useEffect(load, []);

  const openEdit = (d) => { setEditData(d); setShowModal(true); };
  const closeModal = () => { setShowModal(false); setEditData(null); };

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
                <th className="py-3 px-4 w-10"></th>
              </tr>
            </thead>
            <tbody>
              {dokter.length === 0 ? (
                <tr><td colSpan={3} className="text-center py-12 text-slate-400 text-sm">Belum ada dokter</td></tr>
              ) : (
                dokter.map(d => (
                  <tr key={d.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 text-sm font-medium text-slate-800">{d.name}</td>
                    <td className="py-3 px-4">
                      {d.specialization
                        ? <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{d.specialization}</span>
                        : <span className="text-slate-400 text-sm">-</span>}
                    </td>
                    <td className="py-3 px-4">
                      <button onClick={() => openEdit(d)} className="text-slate-400 hover:text-teal-600 transition-colors">
                        <Pencil size={15} />
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