import { useState, useEffect } from 'react';
import { api } from '../api';
import { Plus, Search, ChevronDown, ChevronUp, X, AlertCircle } from 'lucide-react';

const fmt = {
  date:     (d) => new Date(d).toLocaleDateString('id-ID', { day:'2-digit', month:'short', year:'numeric' }),
  currency: (n) => 'Rp ' + Number(n).toLocaleString('id-ID'),
};

function LayananRow({ svc, onExpand, expanded }) {
  return (
    <>
      <tr className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
        <td className="py-3 px-4 text-sm text-slate-700">{fmt.date(svc.service_date)}</td>
        <td className="py-3 px-4 text-sm font-medium text-slate-800">{svc.patient.name}</td>
        <td className="py-3 px-4 text-sm text-slate-600">{svc.doctor.name}</td>
        <td className="py-3 px-4 text-sm font-semibold text-teal-700">{fmt.currency(svc.total_cost)}</td>
        <td className="py-3 px-4">
          <button onClick={() => onExpand(svc.id)}
            className="text-slate-500 hover:text-teal-600 transition-colors">
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </td>
      </tr>
      {expanded && (
        <tr className="bg-teal-50/40">
          <td colSpan={5} className="px-4 py-3">
            {svc.notes && <p className="text-xs text-slate-500 mb-2 italic">"{svc.notes}"</p>}
            <table className="w-full text-xs">
              <thead>
                <tr className="text-slate-500 border-b border-teal-100">
                  <th className="text-left py-1 pr-4">Item</th>
                  <th className="text-right py-1 pr-4">Qty</th>
                  <th className="text-right py-1">Harga Satuan</th>
                  <th className="text-right py-1">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {svc.details.map(d => (
                  <tr key={d.id} className="border-b border-teal-50">
                    <td className="py-1 pr-4 text-slate-700">{d.item_name}</td>
                    <td className="py-1 pr-4 text-right text-slate-600">{d.quantity}</td>
                    <td className="py-1 text-right text-slate-600">{fmt.currency(d.price_at_the_time)}</td>
                    <td className="py-1 text-right font-medium text-slate-800">
                      {fmt.currency(Number(d.price_at_the_time) * d.quantity)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </td>
        </tr>
      )}
    </>
  );
}

function TambahLayananModal({ onClose, onSaved }) {
  const [error, setError]               = useState('');
  const [pasienList, setPasienList]     = useState([]);
  const [dokterList, setDokterList]     = useState([]);
  const [obatList, setObatList]         = useState([]);
  const [pasienSearch, setPasienSearch] = useState('');
  const [saving, setSaving]             = useState(false);
  const [form, setForm] = useState({
    patientId: '', doctorId: '', service_date: '', notes: '',
    details: [{ item_name: '', medicineId: '', quantity: 1, price_at_the_time: '' }],
  });

  useEffect(() => {
    api.getDokter().then(setDokterList);
    api.getObat().then(setObatList);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      api.getPasien(pasienSearch).then(setPasienList);
    }, 300);
    return () => clearTimeout(t);
  }, [pasienSearch]);

  const addDetail = () => setForm(f => ({
    ...f, details: [...f.details, { item_name: '', medicineId: '', quantity: 1, price_at_the_time: '' }],
  }));

  const setDetail = (i, key, val) => setForm(f => {
    const details = [...f.details];
    details[i] = { ...details[i], [key]: val };
    if (key === 'medicineId' && val) {
      const obat = obatList.find(o => o.id === Number(val));
      if (obat) {
        details[i].item_name = obat.name;
        details[i].price_at_the_time = obat.current_price;
      }
    }
    return { ...f, details };
  });

  const removeDetail = (i) => setForm(f => ({
    ...f, details: f.details.filter((_, idx) => idx !== i),
  }));

  const total = form.details.reduce(
    (s, d) => s + (Number(d.price_at_the_time) || 0) * (Number(d.quantity) || 0), 0
  );

  const submit = async () => {
    if (!form.patientId || !form.doctorId || !form.service_date) {
      setError('Lengkapi data wajib: pasien, dokter, dan tanggal.');
      return;
    }
    setSaving(true);
    setError('');
    const result = await api.createLayanan({
      ...form,
      details: form.details.filter(d => d.item_name),
    });
    setSaving(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    onSaved();
    onClose();
  };

  const inputCls = 'w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-300';

  return (
    <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-800">Tambah Layanan</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-6 py-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">Pasien *</label>
              <input className={inputCls} placeholder="Cari nama pasien..."
                value={pasienSearch} onChange={e => setPasienSearch(e.target.value)} />
              {pasienList.length > 0 && (
                <div className="border border-slate-200 rounded-lg mt-1 max-h-32 overflow-y-auto">
                  {pasienList.map(p => (
                    <button key={p.id} onClick={() => {
                      setForm(f => ({ ...f, patientId: p.id }));
                      setPasienSearch(p.name);
                      setPasienList([]);
                    }} className={`block w-full text-left px-3 py-2 text-sm hover:bg-teal-50 transition-colors
                      ${form.patientId === p.id ? 'bg-teal-50 text-teal-700 font-medium' : 'text-slate-700'}`}>
                      {p.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">Dokter *</label>
              <select className={inputCls} value={form.doctorId}
                onChange={e => setForm(f => ({ ...f, doctorId: e.target.value }))}>
                <option value="">-- Pilih Dokter --</option>
                {dokterList.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">Tanggal Layanan *</label>
              <input type="datetime-local" className={inputCls} value={form.service_date}
                onChange={e => setForm(f => ({ ...f, service_date: e.target.value }))} />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">Catatan</label>
              <input className={inputCls} placeholder="Opsional..." value={form.notes}
                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
            </div>
          </div>

          {/* Item Layanan */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium text-slate-600">Item Layanan</label>
              <button onClick={addDetail}
                className="text-xs text-teal-600 hover:text-teal-700 font-medium flex items-center gap-1">
                <Plus size={12} /> Tambah Item
              </button>
            </div>
            <div className="space-y-2">
              {form.details.map((d, i) => (
                <div key={i} className="grid grid-cols-12 gap-2 items-center">
                  <div className="col-span-3">
                    <select className={inputCls} value={d.medicineId}
                      onChange={e => setDetail(i, 'medicineId', e.target.value)}>
                      <option value="">-- Obat (opsional) --</option>
                      {obatList.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
                    </select>
                  </div>
                  <div className="col-span-4">
                    <input className={inputCls} placeholder="Nama item *" value={d.item_name}
                      onChange={e => setDetail(i, 'item_name', e.target.value)} />
                  </div>
                  <div className="col-span-2">
                    <input type="number" className={inputCls} placeholder="Qty" min={1} value={d.quantity}
                      onChange={e => setDetail(i, 'quantity', e.target.value)} />
                  </div>
                  <div className="col-span-2">
                    <input type="number" className={inputCls} placeholder="Harga" value={d.price_at_the_time}
                      onChange={e => setDetail(i, 'price_at_the_time', e.target.value)} />
                  </div>
                  <div className="col-span-1 flex justify-center">
                    {form.details.length > 1 && (
                      <button onClick={() => removeDetail(i)} className="text-slate-400 hover:text-red-500">
                        <X size={14} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Error pop-out */}
        {error && (
          <div className="mx-6 mb-1 px-4 py-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2">
            <AlertCircle size={16} className="text-red-500 mt-0.5 shrink-0" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
          <span className="text-sm font-semibold text-slate-700">
            Total: <span className="text-teal-700">{fmt.currency(total)}</span>
          </span>
          <div className="flex gap-2">
            <button onClick={onClose}
              className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
              Batal
            </button>
            <button onClick={submit} disabled={saving}
              className="px-4 py-2 text-sm bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-60">
              {saving ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

export default function Layanan() {
  const [layanan, setLayanan]     = useState([]);
  const [expanded, setExpanded]   = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch]       = useState('');
  const [loading, setLoading]     = useState(true);

  const load = () => {
    setLoading(true);
    api.getLayanan().then(data => { setLayanan(data); setLoading(false); });
  };

  useEffect(load, []);

  const toggle = (id) => setExpanded(prev => prev === id ? null : id);

  const filtered = layanan.filter(s =>
    s.patient.name.toLowerCase().includes(search.toLowerCase()) ||
    s.doctor.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Riwayat Layanan</h1>
          <p className="text-sm text-slate-500 mt-0.5">{layanan.length} total layanan tercatat</p>
        </div>
        <button onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-teal-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-teal-700 transition-colors shadow-sm">
          <Plus size={16} /> Tambah Layanan
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              className="w-64 pl-8 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-300"
              placeholder="Cari pasien atau dokter..."
              value={search} onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-sm">Memuat data...</div>
        ) : (
          <table className="w-full">
            <thead className="bg-slate-50 text-xs text-slate-500 uppercase tracking-wide">
              <tr>
                <th className="text-left py-3 px-4">Tanggal</th>
                <th className="text-left py-3 px-4">Pasien</th>
                <th className="text-left py-3 px-4">Dokter</th>
                <th className="text-left py-3 px-4">Total Biaya</th>
                <th className="py-3 px-4 w-10"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-12 text-slate-400 text-sm">Belum ada layanan</td></tr>
              ) : (
                filtered.map(s => (
                  <LayananRow key={s.id} svc={s} onExpand={toggle} expanded={expanded === s.id} />
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {showModal && <TambahLayananModal onClose={() => setShowModal(false)} onSaved={load} />}
    </div>
  );
}