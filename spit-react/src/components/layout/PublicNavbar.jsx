import { NavLink } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import logo from '../../assets/logo.png';
import ChatWidget from '../chat/ChatWidget';

const NAV_ITEMS = [
  { to: '/',      icon: 'cottage',        label: 'Home' },
  { to: '/about', icon: 'travel_explore', label: 'About Us' },
  { to: '/login', icon: 'manage_accounts', label: 'My Account' },
];

export default function PublicNavbar() {
  const { toggle, isDark } = useTheme();

  return (
    <div style={{
      position: 'fixed', top: '24px', left: 0, right: 0, zIndex: 200,
      display: 'flex', alignItems: 'center',
      padding: '14px 40px',
      pointerEvents: 'none',
      marginTop: '10px'
    }}>

      {/* ── LEFT: Logo ── */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', pointerEvents: 'all' }}>
        <NavLink to="/" 
          style={{ 
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', textDecoration: 'none',
            transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = 'scale(1.1)';
            e.currentTarget.querySelector('img').style.filter = 'drop-shadow(0 4px 12px rgba(36,70,212,0.6))';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.querySelector('img').style.filter = 'drop-shadow(0 2px 8px rgba(0,0,0,0.4))';
          }}
        >
          <img src={logo} alt="SPIT" 
            style={{ 
              height: '100px', width: 'auto', objectFit: 'contain', 
              filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.4))',
              transition: 'filter 0.3s ease'
            }} 
          />

        </NavLink>
      </div>

      {/* ── CENTER: Pill nav ── */}
      <div style={{
        flex: 0,
        display: 'flex', alignItems: 'center', gap: '6px',
        padding: '8px 14px',
        background: 'rgba(36,70,212,0.25)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '999px',
        boxShadow: '0 12px 48px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.08)',
        pointerEvents: 'all',
      }}>
        {NAV_ITEMS.map(({ to, icon, label }) => (
          <NavLink key={to} to={to} end={to === '/'}
            title={label}
            style={({ isActive }) => ({
              width: 56, height: 56, borderRadius: '16px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              textDecoration: 'none',
              background: isActive ? 'rgba(36,70,212,0.8)' : 'transparent',
              border: isActive ? '1px solid rgba(255,192,56,0.6)' : '1px solid transparent',
              color: isActive ? '#FFC038' : 'rgba(255,255,255,0.6)',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: isActive ? 'inset 0 1px 0 rgba(255,255,255,0.08), 0 4px 12px rgba(0,0,0,0.2)' : 'none',
              transform: isActive ? 'scale(1.05)' : 'scale(1)',
            })}
            onMouseEnter={e => {
              if (!e.currentTarget.getAttribute('style').includes('rgba(36,70,212,0.8)')) {
                e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                e.currentTarget.style.color = 'white';
                e.currentTarget.style.transform = 'scale(1.05)';
              }
            }}
            onMouseLeave={e => {
              if (!e.currentTarget.getAttribute('style').includes('rgba(36,70,212,0.8)')) {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = 'rgba(255,255,255,0.6)';
                e.currentTarget.style.transform = 'scale(1)';
              }
            }}
          >
            <span className="material-symbols-outlined"
              style={{ fontSize: '26px', fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 24" }}>
              {icon}
            </span>
          </NavLink>
        ))}
      </div>

      {/* ── RIGHT: Actions ── */}
      <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', gap: '8px', pointerEvents: 'all' }}>
        <ChatWidget />
        <button onClick={toggle} title={isDark ? 'Light mode' : 'Dark mode'}
          style={{
            width: 56, height: 56, borderRadius: '16px',
            background: 'rgba(36,70,212,0.2)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.1)',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'rgba(255,255,255,0.7)',
            boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(36,70,212,0.4)'; e.currentTarget.style.color = 'white'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(36,70,212,0.2)'; e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; }}
        >
          <span className="material-symbols-outlined"
            style={{ fontSize: '26px', fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 24" }}>
            {isDark ? 'light_mode' : 'dark_mode'}
          </span>
        </button>
      </div>
    </div>
  );
}
