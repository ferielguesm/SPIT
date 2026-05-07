export default function StatCard({ label, value, icon, iconBg = 'var(--surface2)', iconColor = 'var(--teal)', badge, pulse }) {
  return (
    <div style={{
      background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px',
      padding: '24px', boxShadow: 'var(--shadow)', transition: 'transform 0.2s',
    }}
      onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-3px)'}
      onMouseLeave={e => e.currentTarget.style.transform = ''}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
        <div style={{ width: 40, height: 40, borderRadius: '10px', background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span className="material-symbols-outlined" style={{ color: iconColor, fontSize: '20px' }}>{icon}</span>
        </div>
        {badge && (
          <span style={{ fontSize: '10px', fontWeight: 700, padding: '3px 8px', borderRadius: '6px', background: badge.bg, color: badge.color }}>
            {badge.text}
          </span>
        )}
        {pulse && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#4A919E', animation: 'pulse 1.5s infinite' }} />
            <span style={{ fontSize: '9px', fontWeight: 700, color: '#166874', textTransform: 'uppercase' }}>Live</span>
          </div>
        )}
      </div>
      <div style={{ fontSize: '10px', fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{label}</div>
      <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text)', marginTop: '4px', fontFamily: 'Manrope, sans-serif' }}>{value ?? '—'}</div>
    </div>
  );
}
