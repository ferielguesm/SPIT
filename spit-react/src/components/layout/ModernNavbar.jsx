import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { toast } from 'react-hot-toast';
import logo from '../../assets/logo.png';

export default function ModernNavbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggle } = useTheme();

  const initials = `${user?.firstName?.[0] || ''}${user?.lastName?.[0] || ''}`.toUpperCase();

  const isActive = (path) => location.pathname === path;

  const s = {
    nav: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      height: '85px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      zIndex: 1000,
      padding: '0 50px',
      background: theme === 'dark' ? 'rgba(11, 17, 33, 0.7)' : 'rgba(255, 255, 255, 0.7)',
      backdropFilter: 'blur(30px) saturate(150%)',
      WebkitBackdropFilter: 'blur(30px) saturate(150%)',
      borderBottom: theme === 'dark' ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.05)',
      transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
    },
    logoSection: {
      display: 'flex',
      alignItems: 'center',
      cursor: 'pointer',
      transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
    },
    centerPill: {
      display: 'flex',
      alignItems: 'center',
      background: theme === 'dark' ? 'rgba(30, 41, 59, 0.5)' : 'rgba(241, 245, 249, 0.8)',
      backdropFilter: 'blur(10px)',
      padding: '5px',
      borderRadius: '24px',
      gap: '4px',
      border: '1px solid var(--border)',
      boxShadow: '0 4px 15px rgba(0,0,0,0.05)'
    },
    pillItem: (active) => ({
      width: '42px',
      height: '42px',
      borderRadius: '18px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: active ? 'var(--primary)' : 'var(--muted)',
      background: active ? (theme === 'dark' ? 'rgba(36, 70, 212, 0.2)' : 'white') : 'transparent',
      boxShadow: active && theme !== 'dark' ? '0 4px 10px rgba(0,0,0,0.05)' : 'none',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      border: active ? '1px solid var(--border)' : '1px solid transparent'
    }),
    rightSection: {
      display: 'flex',
      alignItems: 'center',
      gap: '15px'
    },
    iconBtn: {
      width: '42px',
      height: '42px',
      borderRadius: '14px',
      background: 'var(--surface2)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'var(--text)',
      cursor: 'pointer',
      border: '1px solid var(--border)',
      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
      opacity: 0.8
    },
    avatar: {
      width: '44px',
      height: '44px',
      borderRadius: '14px',
      background: 'linear-gradient(135deg, var(--primary), #4DA1FF)',
      color: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: 900,
      fontSize: '14px',
      boxShadow: '0 8px 16px rgba(36, 70, 212, 0.2)',
      cursor: 'pointer',
      transition: 'transform 0.3s'
    }
  };

  return (
    <nav style={s.nav}>
      <style>{`
        .nav-icon:hover { transform: scale(1.1); opacity: 1; color: var(--primary); }
        .logo-hover:hover { transform: scale(1.1) rotate(-3deg); filter: drop-shadow(0 0 15px rgba(var(--primary-rgb), 0.3)); }
      `}</style>

      {/* LEFT: LOGO */}
      <div 
        style={s.logoSection} 
        onClick={() => navigate('/feed')}
        className="logo-hover"
      >
        <img src={logo} alt="SPIT" style={{ height: '65px', width: 'auto', display: 'block' }} />
      </div>

      {/* CENTER: FLOATING PILL */}
      <div style={s.centerPill}>
        {[
          { path: '/feed', icon: 'home', label: 'Home' },
          { path: '/dashboard', icon: 'dashboard', label: 'Dashboard' },
          { path: '/profile', icon: 'person', label: 'Profile' }
        ].map(item => (
          <div 
            key={item.path}
            onClick={() => navigate(item.path)} 
            style={s.pillItem(isActive(item.path))}
            title={item.label}
            className="nav-icon"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>{item.icon}</span>
          </div>
        ))}
      </div>

      {/* RIGHT: ACTIONS */}
      <div style={s.rightSection}>
        <div style={s.iconBtn} onClick={() => navigate('/messages')} className="nav-icon">
          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>chat_bubble</span>
        </div>
        <div style={s.iconBtn} onClick={toggle} className="nav-icon">
          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
            {theme === 'dark' ? 'light_mode' : 'dark_mode'}
          </span>
        </div>
        <div style={s.avatar} onClick={() => navigate('/profile')} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-3px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
          {initials}
        </div>
        <div 
          style={{ ...s.iconBtn, color: '#EF4444', border: '1px solid rgba(239, 68, 68, 0.2)', background: 'rgba(239, 68, 68, 0.05)' }} 
          onClick={() => { logout(); navigate('/login'); }}
          className="nav-icon"
          title="Logout"
        >
          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>logout</span>
        </div>
      </div>
    </nav>
  );
}
