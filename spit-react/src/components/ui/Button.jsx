export default function Button({ children, variant = 'primary', size = 'md', icon, onClick, disabled, type = 'button', style = {}, className = '' }) {
  const base = {
    display: 'inline-flex', alignItems: 'center', gap: '8px',
    borderRadius: '12px', fontWeight: 600, cursor: disabled ? 'not-allowed' : 'pointer',
    border: 'none', transition: 'all 0.2s', fontFamily: 'inherit',
    opacity: disabled ? 0.6 : 1,
  };
  const sizes = {
    sm: { padding: '7px 14px', fontSize: '12px' },
    md: { padding: '10px 20px', fontSize: '14px' },
    lg: { padding: '14px 28px', fontSize: '15px' },
  };
  const variants = {
    primary:  { background: 'var(--primary)', color: 'white', boxShadow: '0 4px 12px rgba(36,70,212,0.25)' },
    secondary:{ background: 'var(--dark)', color: 'white' },
    navy:     { background: 'var(--bg)', color: 'white' },
    outline:  { background: 'transparent', color: 'var(--text)', border: '1.5px solid var(--border)' },
    ghost:    { background: 'rgba(255,192,56,0.1)', color: 'var(--accent)', border: '1px solid rgba(255,192,56,0.2)' },
    danger:   { background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' },
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled}
      style={{ ...base, ...sizes[size], ...variants[variant], ...style }} className={className}>
      {icon && <span className="material-symbols-outlined" style={{ fontSize: size === 'sm' ? '16px' : '18px' }}>{icon}</span>}
      {children}
    </button>
  );
}
