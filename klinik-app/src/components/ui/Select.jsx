export default function Select({ label, value, onChange, options = [], placeholder = '-- Pilih --', required = false, className = '' }) {
  const selectCls =
    'w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-300 bg-white';

  return (
    <div className={className}>
      {label && (
        <label className="block text-xs font-medium text-slate-600 mb-1">
          {label} {required && <span className="text-red-400">*</span>}
        </label>
      )}
      <select className={selectCls} value={value} onChange={onChange} required={required}>
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}