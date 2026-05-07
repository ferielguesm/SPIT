import { useState, useEffect } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { AuthAPI, PassengerAPI } from '../../api';
import logo from '../../assets/logo.png';
import tunisiaVideo from '../../assets/tunisia.mp4';

export default function LoginPage() {
  const { login, isLoggedIn, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [showPw,   setShowPw]   = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');

  // Load remembered email
  useEffect(() => {
    const savedEmail = localStorage.getItem('spit_remembered_email');
    if (savedEmail) {
      setEmail(savedEmail);
      setRemember(true);
    }
  }, []);

  if (isLoggedIn) return <Navigate to={isAdmin ? '/admin' : '/dashboard'} replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      if (remember) {
        localStorage.setItem('spit_remembered_email', email);
      } else {
        localStorage.removeItem('spit_remembered_email');
      }

      const user = await AuthAPI.login(email, password);
      login({ ...user, type: 'admin' });
      navigate('/admin');
    } catch {
      try {
        const passenger = await PassengerAPI.loginPassenger(email, password);
        login({ ...passenger, type: 'passenger' });
        navigate('/feed');
      } catch {
        setError('Invalid email or password.');
        setLoading(false);
      }
    }
  };

  return (
    <div style={{ position: 'relative', height: '100vh', display: 'flex', overflow: 'hidden', fontFamily: 'Inter, sans-serif' }}>

      {/* ── Full-screen video background ── */}
      <video autoPlay muted loop playsInline
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0 }}>
        <source src={tunisiaVideo} type="video/mp4" />
      </video>

      {/* ── Dark overlay over video ── */}
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(4,8,20,0.82)', zIndex: 1 }} />

      {/* ── Top Bar: Logo & Back Home ── */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, padding: '30px 50px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 20 }} className="animate-fade-in">
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
          <img src={logo} alt="SPIT" style={{ height: '48px', width: 'auto', filter: 'drop-shadow(0 0 10px rgba(36,70,212,0.4))' }} />
          <span style={{ fontSize: '20px', fontWeight: 900, letterSpacing: '0.15em', fontFamily: 'Manrope, sans-serif', color: 'white' }}>SPIT</span>
        </Link>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontSize: '14px', fontWeight: 600, transition: 'all 0.3s' }}
          onMouseEnter={e => { e.target.style.color = 'white'; e.target.style.transform = 'translateX(-4px)'; }}
          onMouseLeave={e => { e.target.style.color = 'rgba(255,255,255,0.6)'; e.target.style.transform = 'translateX(0)'; }}>
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_back</span>
          Back to Home
        </Link>
      </div>

      {/* ── Left: Hero text ── */}
      <div style={{
        position: 'absolute', left: 0, top: 0, bottom: 0,
        width: '60%', zIndex: 5,
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        padding: '0 80px',
        clipPath: 'polygon(0 0, 100% 0, 85% 100%, 0 100%)',
      }} className="animate-slide-left">
        <div style={{ maxWidth: '520px' }}>
          <div style={{ 
            display: 'inline-block',
            fontSize: '12px', 
            fontWeight: 800, 
            letterSpacing: '0.25em', 
            textTransform: 'uppercase', 
            color: 'var(--accent)', 
            marginBottom: '24px',
            padding: '6px 12px',
            background: 'rgba(255, 192, 56, 0.1)',
            borderRadius: '4px',
            borderLeft: '3px solid var(--accent)'
          }}>
            Smart Transit Intelligence
          </div>
          <h1 style={{ fontSize: '64px', fontWeight: 900, fontFamily: 'Manrope, sans-serif', color: 'white', lineHeight: 1.05, marginBottom: '24px', textShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
            Discover Tunisia<br />
            <span style={{ color: 'transparent', WebkitTextStroke: '1px rgba(255,255,255,0.5)' }}>On Your Terms</span>
          </h1>
          <p style={{ fontSize: '18px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.8, marginBottom: '40px', maxWidth: '440px' }}>
            AI-powered travel recommendations tailored to your interests, budget, and journey — from the Sahara to the Mediterranean coast.
          </p>
          <div style={{ display: 'flex', gap: '30px', alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '24px', fontWeight: 900, color: 'white' }}>10k+</span>
              <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>Daily Users</span>
            </div>
            <div style={{ width: '1px', height: '30px', background: 'rgba(255,255,255,0.1)' }} />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '24px', fontWeight: 900, color: 'white' }}>98%</span>
              <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>Accuracy</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right: Form panel ── */}
      <div style={{
        position: 'absolute', right: 0, top: 0, bottom: 0,
        width: '45%', zIndex: 6,
        background: 'rgba(255,255,255,0.02)',
        backdropFilter: 'blur(40px)',
        WebkitBackdropFilter: 'blur(40px)',
        borderLeft: '1px solid rgba(255,255,255,0.1)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '0 60px 0 100px',
        clipPath: 'polygon(20% 0, 100% 0, 100% 100%, 0 100%)',
      }} className="animate-slide-right">
        
        {/* Subtle background glow */}
        <div style={{ position: 'absolute', top: '20%', right: '-10%', width: '300px', height: '300px', background: 'rgba(36,70,212,0.15)', filter: 'blur(80px)', borderRadius: '50%', zIndex: -1 }} />
        
        <div style={{ width: '100%', maxWidth: '380px' }}>
          <div style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '32px', fontWeight: 900, fontFamily: 'Manrope, sans-serif', color: 'white', marginBottom: '12px', lineHeight: 1.2 }}>
              Welcome Back
            </h2>
            <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>
              Enter your credentials to access your personalized travel dashboard.
            </p>
          </div>

          {error && (
            <div style={{ 
              background: 'rgba(186,26,26,0.15)', 
              border: '1px solid rgba(186,26,26,0.3)', 
              color: '#fca5a5', 
              borderRadius: '12px', 
              padding: '12px 16px', 
              fontSize: '14px', 
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>error</span>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Email */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>Email Address</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="name@example.com" required
                style={{ width: '100%', padding: '16px', borderRadius: '14px', border: '1.5px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.03)', fontSize: '15px', color: 'white', outline: 'none', fontFamily: 'Inter, sans-serif', transition: 'all 0.3s' }}
                onFocus={e => { e.target.style.borderColor = 'var(--primary)'; e.target.style.background = 'rgba(255,255,255,0.07)'; }}
                onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.background = 'rgba(255,255,255,0.03)'; }}
              />
            </div>

            {/* Password */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label style={{ fontSize: '12px', fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Password</label>
                <Link to="#" style={{ fontSize: '12px', color: 'var(--accent)', textDecoration: 'none', fontWeight: 700 }}>Forgot?</Link>
              </div>
              <div style={{ position: 'relative' }}>
                <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••" required
                  style={{ width: '100%', padding: '16px 48px 16px 16px', borderRadius: '14px', border: '1.5px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.03)', fontSize: '15px', color: 'white', outline: 'none', fontFamily: 'Inter, sans-serif', transition: 'all 0.3s' }}
                  onFocus={e => { e.target.style.borderColor = 'var(--primary)'; e.target.style.background = 'rgba(255,255,255,0.07)'; }}
                  onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.background = 'rgba(255,255,255,0.03)'; }}
                />
                <span className="material-symbols-outlined" onClick={() => setShowPw(p => !p)}
                  style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)', fontSize: '20px', cursor: 'pointer', userSelect: 'none' }}>
                  {showPw ? 'visibility_off' : 'visibility'}
                </span>
              </div>
            </div>

            {/* Remember Me */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '32px' }}>
              <input type="checkbox" id="remember" checked={remember} onChange={e => setRemember(e.target.checked)}
                style={{ width: '18px', height: '18px', accentColor: 'var(--primary)', cursor: 'pointer' }} />
              <label htmlFor="remember" style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', cursor: 'pointer' }}>Keep me signed in</label>
            </div>

            {/* Submit */}
            <button type="submit" disabled={loading}
              style={{ 
                width: '100%', 
                padding: '18px', 
                borderRadius: '14px', 
                background: 'var(--primary)', 
                color: 'white', 
                border: 'none', 
                fontSize: '16px', 
                fontWeight: 800, 
                cursor: loading ? 'not-allowed' : 'pointer', 
                opacity: loading ? 0.7 : 1, 
                fontFamily: 'Manrope, sans-serif', 
                letterSpacing: '0.05em',
                boxShadow: '0 10px 30px rgba(36,70,212,0.3)', 
                transition: 'all 0.3s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px'
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 15px 40px rgba(36,70,212,0.4)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 10px 30px rgba(36,70,212,0.3)'; }}>
              {loading ? (
                <>
                  <div style={{ width: '18px', height: '18px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                  Signing in…
                </>
              ) : (
                <>
                  Sign In
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_forward</span>
                </>
              )}
            </button>
          </form>

          <div style={{ marginTop: '32px', textAlign: 'center' }}>
            <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.4)' }}>
              New to SPIT?{' '}
              <Link to="/register" style={{ color: 'white', fontWeight: 800, textDecoration: 'none', borderBottom: '1px solid var(--accent)' }}>
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
