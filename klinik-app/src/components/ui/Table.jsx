export default function Table({ columns = [], rows = [], emptyMessage = 'Tidak ada data', loading = false }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 shadow-sm bg-white">
      <table className="w-full">
        <thead className="bg-slate-50 text-xs text-slate-500 uppercase tracking-wide">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className={`py-3 px-4 ${col.align === 'right' ? 'text-right' : 'text-left'}`}
                style={col.width ? { width: col.width } : {}}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={columns.length} className="text-center py-12 text-slate-400 text-sm">
                Memuat data...
              </td>
            </tr>
          ) : rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="text-center py-12 text-slate-400 text-sm">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            rows.map((row, rowIdx) => (
              <tr key={rowIdx} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={`py-3 px-4 text-sm text-slate-700 ${col.align === 'right' ? 'text-right' : ''}`}
                  >
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}