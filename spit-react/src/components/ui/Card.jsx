export default function Card({ children, style = {}, className = '', hover = false }) {
  return (
    <div
      className={className}
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: '16px',
        boxShadow: 'var(--shadow)',
        transition: hover ? 'transform 0.2s, box-shadow 0.2s' : undefined,
        ...style,
      }}
      onMouseEnter={hover ? e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,.1)'; } : undefined}
      onMouseLeave={hover ? e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = 'var(--shadow)'; } : undefined}
    >
      {children}
    </div>
  );
}
