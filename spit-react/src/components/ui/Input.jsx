export default function Input({ label, icon, type = 'text', error, rightIcon, onRightIconClick, ...props }) {
  return (
    <div style={{ marginBottom: '16px' }}>
      {label && (
        <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--label)', marginBottom: '7px' }}>
          {label}
        </label>
      )}
      <div style={{ position: 'relative' }}>
        {icon && (
          <span className="material-symbols-outlined" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--label)', fontSize: '18px', pointerEvents: 'none' }}>
            {icon}
          </span>
        )}
        <input
          type={type}
          style={{
            width: '100%',
            background: 'var(--input-bg)',
            border: `1.5px solid ${error ? '#ba1a1a' : 'var(--input-border)'}`,
            borderRadius: '12px',
            padding: `13px ${rightIcon ? '44px' : '14px'} 13px ${icon ? '40px' : '14px'}`,
            fontSize: '14px',
            color: 'var(--text)',
            outline: 'none',
            transition: 'border-color 0.2s, box-shadow 0.2s',
          }}
          onFocus={e => { e.target.style.borderColor = 'var(--primary)'; e.target.style.boxShadow = '0 0 0 3px rgba(36,70,212,0.15)'; }}
          onBlur={e => { e.target.style.borderColor = error ? '#ba1a1a' : 'var(--input-border)'; e.target.style.boxShadow = 'none'; }}
          {...props}
        />
        {rightIcon && (
          <span className="material-symbols-outlined"
            onClick={onRightIconClick}
            style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--label)', fontSize: '18px', cursor: onRightIconClick ? 'pointer' : 'default' }}>
            {rightIcon}
          </span>
        )}
      </div>
      {error && <div style={{ fontSize: '11px', color: '#ff6b6b', marginTop: '4px' }}>{error}</div>}
    </div>
  );
}

export function Select({ label, error, children, ...props }) {
  return (
    <div style={{ marginBottom: '16px' }}>
      {label && (
        <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--label)', marginBottom: '7px' }}>
          {label}
        </label>
      )}
      <select
        style={{
          width: '100%', background: 'var(--input-bg)', border: `1.5px solid ${error ? '#ba1a1a' : 'var(--input-border)'}`,
          borderRadius: '12px', padding: '13px 14px', fontSize: '14px', color: 'var(--text)', outline: 'none',
        }}
        {...props}
      >
        {children}
      </select>
      {error && <div style={{ fontSize: '11px', color: '#ff6b6b', marginTop: '4px' }}>{error}</div>}
    </div>
  );
}
