export default function Input({
  label,
  value,
  onChange,
  placeholder = '',
  type = 'text',
  required = false,
  disabled = false,
  className = '',
  rows,
}) {
  const inputCls =
    'w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-300 disabled:bg-slate-50 disabled:text-slate-400';

  return (
    <div className={className}>
      {label && (
        <label className="block text-xs font-medium text-slate-600 mb-1">
          {label} {required && <span className="text-red-400">*</span>}
        </label>
      )}
      {rows ? (
        <textarea
          className={inputCls}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          rows={rows}
        />
      ) : (
        <input
          type={type}
          className={inputCls}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
        />
      )}
    </div>
  );
}