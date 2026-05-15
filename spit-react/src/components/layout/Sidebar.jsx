import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useEffect, useState } from 'react';
import { PassengerAPI, UserAPI } from '../../api';
import { BASE_URL } from '../../api';

const NAV = [
  { to: '/',                     icon: 'home',                 label: 'Home' },
  { to: '/admin',                icon: 'analytics',            label: 'Dashboard' },
  { to: '/admin/passengers',     icon: 'groups',               label: 'Passengers' },
  { to: '/admin/recommendations',icon: 'clinical_notes',       label: 'Recommendations' },
  { to: '/admin/analytics',      icon: 'monitoring',           label: 'Analytics' },
  { to: '/admin/users',          icon: 'group',                label: 'User Management' },
  { to: '/admin/roles',          icon: 'admin_panel_settings', label: 'Roles' },
  { to: '/admin/settings',       icon: 'settings',             label: 'Settings' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const initials = (user?.fullName || 'A').split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();

  const [passengers, setPassengers] = useState([]);
  const [userCount, setUserCount]   = useState(0);

  useEffect(() => {
    PassengerAPI.getAll()
      .then(d => setPassengers(Array.isArray(d) ? d : []))
      .catch(() => {});
    UserAPI.count()
      .then(d => setUserCount(d?.count || 0))
      .catch(() => {});
  }, []);

  // Show first 3 passengers as avatars, rest as "+N"
  const shown   = passengers.slice(0, 3);
  const rest    = passengers.length - shown.length;
  const total   = passengers.length + userCount;

  const COLORS = ['#2446D4', '#4A919E', '#166874', '#505d85', '#833ab4'];

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <aside style={{
      width: 260, height: '100vh', position: 'fixed', left: 0, top: 0,
      background: 'var(--sidebar-bg)', borderRight: isDark ? '1px solid var(--glass-highlight)' : 'none',
      display: 'flex', flexDirection: 'column', padding: '24px 0',
      zIndex: 50,
      boxShadow: isDark ? 'none' : '4px 0 20px rgba(0,0,0,0.05)',
    }}>
      <div style={{ padding: '0 24px', marginBottom: '32px', textAlign: 'center' }}>
        <div style={{ width: 64, height: 64, margin: '0 auto 12px', borderRadius: '50%', border: '2px solid var(--accent)', padding: '3px' }}>
           <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: 'var(--primary-grad)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '20px' }}>{initials}</div>
        </div>
        <div style={{ fontSize: '16px', fontWeight: 800, color: 'white' }}>{user?.fullName || 'ALEX JOHNSON'}</div>
        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>{user?.email || 'admin@spit.gov.tn'}</div>
      </div>

      <nav style={{ flex: 1, padding: '0 12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {NAV.map(({ to, icon, label }) => (
          <NavLink key={to} to={to} end={to === '/admin' || to === '/'}
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: '12px',
              padding: '12px 16px', borderRadius: '12px',
              color: isActive ? 'white' : 'rgba(255,255,255,0.5)',
              background: isActive ? 'var(--primary-grad)' : 'transparent',
              fontSize: '14px', fontWeight: 600, textDecoration: 'none',
              transition: 'all 0.2s',
            })}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>{icon}</span>
            <span>{label}</span>
          </NavLink>
        ))}
        
      </nav>

      <div style={{ padding: '0 24px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <div style={{ fontSize: '10px', fontWeight: 800, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '1px' }}>Active Users</div>
          <div style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.5)' }}>{total} total</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {shown.map((p, i) => {
            const label = ((p.firstName || p.nationality || '?')[0]).toUpperCase();
            const bg = COLORS[i % COLORS.length];
            return (
              <div key={p.id} title={`${p.firstName || ''} ${p.lastName || ''}`.trim() || p.nationality}
                style={{ width: 28, height: 28, borderRadius: '50%', border: '2px solid var(--sidebar-bg)', background: bg, marginLeft: i > 0 ? '-8px' : 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 700, color: 'white', flexShrink: 0, zIndex: shown.length - i, overflow: 'hidden' }}>
                {p.profileImageUrl
                  ? <img src={BASE_URL + p.profileImageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : label}
              </div>
            );
          })}
          {rest > 0 && (
            <div style={{ width: 28, height: 28, borderRadius: '50%', border: '2px solid var(--sidebar-bg)', background: 'var(--accent)', marginLeft: '-8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', color: '#040814', fontWeight: 800, flexShrink: 0 }}>
              +{rest}
            </div>
          )}
          {passengers.length === 0 && (
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)' }}>No passengers yet</div>
          )}
        </div>
      </div>

      <div style={{ padding: '16px 12px' }}>
        <button onClick={handleLogout}
          style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', borderRadius: '12px', background: 'var(--glass-bg)', border: '1px solid var(--glass-highlight)', color: 'white', cursor: 'pointer', transition: 'all 0.2s', fontSize: '13px', fontWeight: 600 }}>
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>logout</span>
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
