export default function Button({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  type = 'button',
  className = '',
}) {
  const base = 'inline-flex items-center gap-2 font-medium rounded-xl transition-colors disabled:opacity-60 disabled:cursor-not-allowed';

  const variants = {
    primary:   'bg-teal-600 text-white hover:bg-teal-700',
    secondary: 'bg-slate-100 text-slate-700 hover:bg-slate-200',
    danger:    'bg-red-500 text-white hover:bg-red-600',
    ghost:     'text-slate-600 hover:bg-slate-100',
  };

  const sizes = {
    sm: 'text-xs px-3 py-1.5',
    md: 'text-sm px-4 py-2',
    lg: 'text-base px-5 py-2.5',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${variants[variant] ?? variants.primary} ${sizes[size] ?? sizes.md} ${className}`}
    >
      {children}
    </button>
  );
}