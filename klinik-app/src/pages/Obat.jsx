import { useState, useEffect } from 'react';
import { api } from '../api';
import { Plus, X, ChevronRight, ArrowLeft, AlertTriangle, Package } from 'lucide-react';

const fmt = {
  date:     (d) => new Date(d).toLocaleDateString('id-ID', { day:'2-digit', month:'short', year:'numeric' }),
  currency: (n) => 'Rp ' + Number(n).toLocaleString('id-ID'),
};

// Cek expired: merah < 30 hari, kuning < 90 hari
const expiryStatus = (dateStr) => {
  const days = Math.ceil((new Date(dateStr) - new Date()) / 86400000);
  if (days < 0)  return { color: 'text-red-600',    bg: 'bg-red-50',    label: 'Kadaluarsa' };
  if (days < 30) return { color: 'text-red-500',    bg: 'bg-red-50',    label: `${days}h lagi` };
  if (days < 90) return { color: 'text-amber-600',  bg: 'bg-amber-50',  label: `${days}h lagi` };
  return { color: 'text-slate-500', bg: '', label: fmt.date(dateStr) };
};

const inputCls = 'w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-300';

function TambahObatModal({ onClose, onSaved }) {
  const [form, setForm] = useState({ name: '', category: '', current_price: '' });
  const [saving, setSaving] = useState(false);
  const submit = async () => {
    if (!form.name.trim() || !form.current_price) return alert('Nama dan harga wajib diisi');
    setSaving(true);
    await api.createObat(form);
    setSaving(false);
    onSaved();
    onClose();
  };
  return (
    <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-800">Tambah Obat</h2>
          <button onClick={onClose}><X size={18} className="text-slate-400" /></button>
        </div>
        <div className="px-6 py-4 space-y-3">
          <div><label className="text-xs font-medium text-slate-600 mb-1 block">Nama Obat *</label>
            <input className={inputCls} value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} /></div>
          <div><label className="text-xs font-medium text-slate-600 mb-1 block">Kategori</label>
            <input className={inputCls} placeholder="Antibiotik, Analgetik, dll" value={form.category}
              onChange={e => setForm(f => ({...f, category: e.target.value}))} /></div>
          <div><label className="text-xs font-medium text-slate-600 mb-1 block">Harga Saat Ini *</label>
            <input type="number" className={inputCls} value={form.current_price}
              onChange={e => setForm(f => ({...f, current_price: e.target.value}))} /></div>
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

function ObatDetail({ obatId, onBack, onUpdated }) {
  const [data, setData]         = useState(null);
  const [newHarga, setNewHarga] = useState('');
  const [stokForm, setStokForm] = useState({ stock_quantity: '', expiry_date: '' });
  const [saving, setSaving]     = useState(false);

  useEffect(() => {
    api.getObatById(obatId).then(setData);
  }, [obatId]);

  const load = () => {
    api.getObatById(obatId).then(setData);
  };

  const ubahHarga = async () => {
    if (!newHarga) return;
    setSaving(true);
    await api.updateHargaObat(obatId, { new_price: newHarga });
    setNewHarga('');
    setSaving(false);
    load();
    onUpdated();
  };

  const tambahStok = async () => {
    if (!stokForm.stock_quantity || !stokForm.expiry_date) return alert('Isi semua kolom stok');
    setSaving(true);
    await api.tambahStok(obatId, stokForm);
    setStokForm({ stock_quantity: '', expiry_date: '' });
    setSaving(false);
    load();
    onUpdated();
  };

  if (!data) return <div className="p-8 text-center text-slate-400 text-sm">Memuat...</div>;

  const totalStok = data.batches.reduce((s, b) => s + b.stock_quantity, 0);

  return (
    <div>
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-4 transition-colors">
        <ArrowLeft size={14} /> Kembali ke daftar
      </button>

      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* Info & Ubah Harga */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <h2 className="text-lg font-bold text-slate-800">{data.name}</h2>
          {data.category && <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{data.category}</span>}
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-teal-700">{fmt.currency(data.current_price)}</span>
            <span className="text-sm text-slate-400">harga saat ini</span>
          </div>
          <div className="mt-4 border-t border-slate-100 pt-4">
            <label className="text-xs font-medium text-slate-600 mb-1 block">Ubah Harga</label>
            <div className="flex gap-2">
              <input type="number" className={inputCls} placeholder="Harga baru" value={newHarga}
                onChange={e => setNewHarga(e.target.value)} />
              <button onClick={ubahHarga} disabled={saving}
                className="px-3 py-2 bg-teal-600 text-white text-sm rounded-lg hover:bg-teal-700 disabled:opacity-60 whitespace-nowrap">
                Simpan
              </button>
            </div>
          </div>
        </div>

        {/* Tambah Stok */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-slate-700">Tambah Stok</h3>
            <div className="flex items-center gap-1 text-sm font-bold text-teal-700">
              <Package size={14} /> {totalStok} unit
            </div>
          </div>
          <div className="space-y-2">
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">Jumlah Unit</label>
              <input type="number" className={inputCls} value={stokForm.stock_quantity}
                onChange={e => setStokForm(f => ({...f, stock_quantity: e.target.value}))} />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">Tanggal Expired</label>
              <input type="date" className={inputCls} value={stokForm.expiry_date}
                onChange={e => setStokForm(f => ({...f, expiry_date: e.target.value}))} />
            </div>
            <button onClick={tambahStok} disabled={saving}
              className="w-full py-2 bg-teal-600 text-white text-sm rounded-lg hover:bg-teal-700 disabled:opacity-60">
              {saving ? 'Menyimpan...' : 'Tambah Stok'}
            </button>
          </div>
        </div>
      </div>

      {/* Tabel Stok per Batch */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm mb-4 overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100">
          <h3 className="font-semibold text-slate-700 text-sm">Stok per Batch</h3>
        </div>
        <table className="w-full">
          <thead className="bg-slate-50 text-xs text-slate-500 uppercase tracking-wide">
            <tr>
              <th className="text-left py-3 px-4">Tanggal Input</th>
              <th className="text-left py-3 px-4">Expired</th>
              <th className="text-right py-3 px-4">Stok</th>
            </tr>
          </thead>
          <tbody>
            {data.batches.length === 0 ? (
              <tr><td colSpan={3} className="text-center py-6 text-slate-400 text-sm">Belum ada stok</td></tr>
            ) : data.batches.map(b => {
              const status = expiryStatus(b.expiry_date);
              return (
                <tr key={b.id} className="border-b border-slate-100">
                  <td className="py-3 px-4 text-sm text-slate-600">{fmt.date(b.date_added)}</td>
                  <td className="py-3 px-4">
                    <span className={`text-sm font-medium ${status.color}`}>
                      {status.label !== fmt.date(b.expiry_date) && <AlertTriangle size={12} className="inline mr-1" />}
                      {status.label === fmt.date(b.expiry_date) ? status.label : `${fmt.date(b.expiry_date)} (${status.label})`}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right text-sm font-semibold text-slate-800">{b.stock_quantity}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Riwayat Harga */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100">
          <h3 className="font-semibold text-slate-700 text-sm">Riwayat Harga</h3>
        </div>
        {data.price_histories.length === 0 ? (
          <p className="text-center py-6 text-slate-400 text-sm">Belum ada perubahan harga</p>
        ) : (
          <table className="w-full">
            <thead className="bg-slate-50 text-xs text-slate-500 uppercase tracking-wide">
              <tr>
                <th className="text-left py-3 px-4">Tanggal</th>
                <th className="text-right py-3 px-4">Harga Lama</th>
                <th className="text-right py-3 px-4">Harga Baru</th>
              </tr>
            </thead>
            <tbody>
              {data.price_histories.map(h => (
                <tr key={h.id} className="border-b border-slate-100">
                  <td className="py-3 px-4 text-sm text-slate-600">{fmt.date(h.changed_at)}</td>
                  <td className="py-3 px-4 text-right text-sm text-slate-500 line-through">{fmt.currency(h.old_price)}</td>
                  <td className="py-3 px-4 text-right text-sm font-semibold text-teal-700">{fmt.currency(h.new_price)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default function Obat() {
  const [obat, setObat]           = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading]     = useState(true);

  const load = () => {
    setLoading(true);
    api.getObat().then(d => { setObat(d); setLoading(false); });
  };
  useEffect(load, []);

  if (selectedId) return <ObatDetail obatId={selectedId} onBack={() => setSelectedId(null)} onUpdated={load} />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Manajemen Obat</h1>
          <p className="text-sm text-slate-500 mt-0.5">{obat.length} jenis obat terdaftar</p>
        </div>
        <button onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-teal-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-teal-700 transition-colors shadow-sm">
          <Plus size={16} /> Tambah Obat
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-sm">Memuat data...</div>
        ) : (
          <table className="w-full">
            <thead className="bg-slate-50 text-xs text-slate-500 uppercase tracking-wide">
              <tr>
                <th className="text-left py-3 px-4">Nama Obat</th>
                <th className="text-left py-3 px-4">Kategori</th>
                <th className="text-right py-3 px-4">Harga Saat Ini</th>
                <th className="text-right py-3 px-4">Stok Total</th>
                <th className="text-left py-3 px-4">Expired Terdekat</th>
                <th className="py-3 px-4 w-10"></th>
              </tr>
            </thead>
            <tbody>
              {obat.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12 text-slate-400 text-sm">Belum ada data obat</td></tr>
              ) : (
                obat.map(o => {
                  const status = o.nearestExpiry ? expiryStatus(o.nearestExpiry) : null;
                  return (
                    <tr key={o.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 text-sm font-medium text-slate-800">{o.name}</td>
                      <td className="py-3 px-4">
                        {o.category
                          ? <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{o.category}</span>
                          : <span className="text-slate-400 text-sm">-</span>}
                      </td>
                      <td className="py-3 px-4 text-right text-sm font-semibold text-teal-700">{fmt.currency(o.current_price)}</td>
                      <td className="py-3 px-4 text-right text-sm font-bold text-slate-800">{o.totalStock}</td>
                      <td className="py-3 px-4">
                        {status ? (
                          <span className={`text-xs font-medium ${status.color}`}>
                            {(status.label !== fmt.date(o.nearestExpiry)) && <AlertTriangle size={11} className="inline mr-1" />}
                            {fmt.date(o.nearestExpiry)}
                          </span>
                        ) : <span className="text-slate-400 text-sm">-</span>}
                      </td>
                      <td className="py-3 px-4">
                        <button onClick={() => setSelectedId(o.id)}
                          className="text-teal-600 hover:text-teal-700 transition-colors">
                          <ChevronRight size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        )}
      </div>

      {showModal && <TambahObatModal onClose={() => setShowModal(false)} onSaved={load} />}
    </div>
  );
}