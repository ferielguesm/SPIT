import { NavLink } from 'react-router-dom';
import logo from '../../assets/logo.png';

export default function PublicFooter() {
  const year = new Date().getFullYear();

  return (
    <footer style={{
      width: '100%',
      background: 'var(--surface)',
      backdropFilter: 'blur(12px)',
      borderTop: '1px solid var(--border)',
      padding: '32px 48px 24px',
      color: 'var(--muted)',
    }}>
      {/* Top row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '32px', marginBottom: '28px' }}>

        {/* Brand */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
            <img src={logo} alt="SPIT" style={{ height: '44px', width: 'auto', objectFit: 'contain' }} />
            <span style={{ fontSize: '16px', fontWeight: 900, letterSpacing: '0.1em', fontFamily: 'Manrope, sans-serif', color: 'var(--text)' }}>SPIT</span>
          </div>
          <p style={{ fontSize: '12px', lineHeight: 1.6, maxWidth: '220px', color: 'var(--muted)' }}>
            Smart Passenger Intelligence Tunisia — AI-powered travel recommendations for every journey.
          </p>
        </div>

        {/* Links */}
        <div style={{ display: 'flex', gap: '48px', flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--label)', marginBottom: '12px' }}>Platform</div>
            {[
              { to: '/login',    label: 'Sign In' },
              { to: '/register', label: 'Create Account' },
              { to: '/about',    label: 'About Us' },
            ].map(({ to, label }) => (
              <NavLink key={to} to={to} style={{ display: 'block', fontSize: '13px', color: 'var(--muted)', textDecoration: 'none', marginBottom: '8px', transition: 'color 0.2s' }}
                onMouseEnter={e => e.target.style.color = '#4A919E'}
                onMouseLeave={e => e.target.style.color = 'var(--muted)'}>
                {label}
              </NavLink>
            ))}
          </div>
          <div>
            <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--label)', marginBottom: '12px' }}>Destinations</div>
            {['Tunis', 'Djerba', 'Hammamet', 'Tozeur', 'Sidi Bou Said'].map(d => (
              <div key={d} style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '8px' }}>{d}</div>
            ))}
          </div>
          <div>
            <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--label)', marginBottom: '12px' }}>Legal</div>
            {['Privacy Policy', 'Terms of Service', 'Support'].map(l => (
              <div key={l} style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '8px', cursor: 'pointer' }}>{l}</div>
            ))}
          </div>
        </div>
      </div>

      {/* Divider */}
      <div style={{ height: '1px', background: 'var(--border)', marginBottom: '20px' }} />

      {/* Bottom row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <span style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.15em' }}>
          © {year} SPIT Aviation Systems — Final Year Academic Project
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#4A919E', animation: 'pulse 2s infinite' }} />
          <span style={{ fontSize: '11px', fontWeight: 600, color: '#4A919E', textTransform: 'uppercase', letterSpacing: '0.1em' }}>System Live</span>
        </div>
      </div>
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
    </footer>
  );
}
