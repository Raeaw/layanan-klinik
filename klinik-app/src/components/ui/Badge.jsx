export default function Badge({ children, variant = 'default' }) {
  const variants = {
    default: 'bg-slate-100 text-slate-600',
    success: 'bg-teal-100 text-teal-700',
    warning: 'bg-amber-100 text-amber-700',
    danger:  'bg-red-100 text-red-700',
    info:    'bg-blue-100 text-blue-700',
  };
  return (
    <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full ${variants[variant] ?? variants.default}`}>
      {children}
    </span>
  );
}