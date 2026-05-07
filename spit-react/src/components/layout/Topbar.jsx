import { useTheme } from '../../context/ThemeContext';

export default function Topbar({ title, children }) {
  const { toggle, isDark } = useTheme();

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 40,
      background: 'var(--topbar-bg)', backdropFilter: 'blur(12px)',
      boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
      height: 64, display: 'flex', alignItems: 'center',
      justifyContent: 'space-between', padding: '0 32px',
      borderBottom: '1px solid var(--border)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <h1 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.5px' }}>{title}</h1>
        {children}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button onClick={toggle} title="Toggle theme"
          style={{ 
            width: 40, height: 40, borderRadius: '12px', 
            background: 'var(--surface2)', border: '1px solid var(--border)', 
            cursor: 'pointer', display: 'flex', alignItems: 'center', 
            justifyContent: 'center', color: 'var(--text)',
            transition: 'all 0.2s'
          }}>
          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>{isDark ? 'light_mode' : 'dark_mode'}</span>
        </button>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
          <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text)' }}>
            {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
          </div>
          <div style={{ fontSize: '10px', fontWeight: 600, color: 'var(--muted)' }}>System Live</div>
        </div>
      </div>
    </header>
  );
}
