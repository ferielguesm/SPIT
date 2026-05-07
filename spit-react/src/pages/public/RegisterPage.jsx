import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { PassengerAPI, UserAPI } from '../../api';
import tunisiaVideo from '../../assets/tunisia.mp4';

import logo from '../../assets/logo.png';

// ── Data & Constants ──────────────────────────────────────
const STEPS = ['Account', 'Profile', 'Interests', 'Review'];
const PURPOSES = [
  { val: 'tourism',   label: '🌍 Tourism' },
  { val: 'business',  label: '💼 Business' },
  { val: 'family',    label: '👨‍👩‍👧 Family' },
  { val: 'medical',   label: '🏥 Medical' },
  { val: 'education', label: '🎓 Education' },
  { val: 'transit',   label: '🔄 Transit' },
];
const BUDGETS = [
  { val: 'economy',  icon: '💰', name: 'Economy' },
  { val: 'standard', icon: '💳', name: 'Standard' },
  { val: 'premium',  icon: '💎', name: 'Premium' },
];
const PREFS = [
  { key: 'beach',      icon: '🏖️', name: 'Beach' },
  { key: 'culture',    icon: '🏛️', name: 'Culture' },
  { key: 'desert',     icon: '🐪', name: 'Desert' },
  { key: 'gastronomy', icon: '🍽️', name: 'Food' },
  { key: 'sports',     icon: '⚽', name: 'Sports' },
];

const COUNTRIES = [
  "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia", "Australia", "Austria",
  "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan",
  "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cabo Verde", "Cambodia",
  "Cameroon", "Canada", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo", "Costa Rica",
  "Croatia", "Cuba", "Cyprus", "Czech Republic", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Ecuador", "Egypt",
  "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini", "Ethiopia", "Fiji", "Finland", "France", "Gabon",
  "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana",
  "Haiti", "Honduras", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel",
  "Italy", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Korea, North", "Korea, South", "Kosovo",
  "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania",
  "Luxembourg", "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius",
  "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar", "Namibia",
  "Nauru", "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Macedonia", "Norway", "Oman",
  "Pakistan", "Palau", "Palestine", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal",
  "Qatar", "Romania", "Russia", "Rwanda", "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent", "Samoa", "San Marino", "Sao Tome and Principe",
  "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia",
  "South Africa", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria", "Taiwan",
  "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan",
  "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States", "Uruguay", "Uzbekistan", "Vanuatu", "Vatican City",
  "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe"
].sort();

// ── Styled Components (Inline) ───────────────────────────
const inpStyle = {
  width: '100%', padding: '14px 16px',
  borderRadius: '14px', border: '1.5px solid rgba(255,255,255,0.1)',
  background: 'rgba(255,255,255,0.03)', fontSize: '15px',
  color: 'white', outline: 'none', fontFamily: 'Inter, sans-serif',
  transition: 'all 0.3s',
};

const labelStyle = { 
  display: 'block', fontSize: '12px', fontWeight: 700, 
  color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', 
  letterSpacing: '0.1em', marginBottom: '8px' 
};

const pillStyle = (selected) => ({
  padding: '10px 20px', borderRadius: '12px', cursor: 'pointer',
  background: selected ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
  border: `1.5px solid ${selected ? 'var(--accent)' : 'rgba(255,255,255,0.1)'}`,
  fontSize: '13px', fontWeight: 800,
  color: selected ? 'white' : 'rgba(255,255,255,0.5)',
  transition: 'all 0.3s',
  display: 'flex', alignItems: 'center', gap: '8px'
});

export default function RegisterPage() {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const [step, setStep]       = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState(false);
  const [errors, setErrors]   = useState({});
  const [accType, setAccType] = useState('passenger'); // 'passenger' | 'staff'

  const activeSteps = accType === 'passenger' ? STEPS : ['Account', 'Review'];

  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', password: '', confirmPassword: '',
    age: '', nationality: '', duration: '7', destination: 'Tunis',
    purpose: '', budget: '',
    prefs: { beach: false, culture: false, desert: false, gastronomy: false, sports: false },
  });

  const set    = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const setPref = (k)   => setForm(f => ({ ...f, prefs: { ...f.prefs, [k]: !f.prefs[k] } }));

  const validate = (s) => {
    const e = {};
    if (s === 1) {
      if (!form.firstName.trim()) e.firstName = 'Required';
      if (!form.lastName.trim())  e.lastName  = 'Required';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Valid email required';
      if (form.password.length < 6) e.password = 'Min. 6 characters';
      if (form.password !== form.confirmPassword) e.confirmPassword = "Passwords don't match";
    }
    if (accType === 'passenger') {
      if (s === 2) {
        if (!form.age || form.age < 1 || form.age > 119) e.age = 'Valid age required';
        if (!form.nationality.trim()) e.nationality = 'Required';
        if (!form.purpose) e.purpose = 'Select a purpose';
      }
      if (s === 3) { if (!form.budget) e.budget = 'Select a budget'; }
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => { if (validate(step)) setStep(s => s + 1); };
  const back = () => setStep(s => s - 1);

  const submit = async () => {
    setError(''); setLoading(true);
    try {
      if (accType === 'passenger') {
        await PassengerAPI.create({
          firstName: form.firstName, lastName: form.lastName,
          email: form.email, password: form.password,
          age: parseInt(form.age), nationality: form.nationality,
          travel: { duration: parseInt(form.duration), destination: form.destination, purpose: form.purpose, budget: form.budget },
          preferences: form.prefs,
        });
        const passenger = await PassengerAPI.loginPassenger(form.email, form.password);
        login({ ...passenger, type: 'passenger' });
      } else {
        await UserAPI.create({
          fullName: `${form.firstName} ${form.lastName}`,
          email: form.email, password: form.password,
          role: 'PENDING_STAFF'
        });
      }
      setSuccess(true);
    } catch (e) { 
      setError(e.response?.data?.message || 'Registration failed'); 
    } finally { setLoading(false); }
  };

  const inpFocus = (e) => { e.target.style.borderColor = 'var(--primary)'; e.target.style.background = 'rgba(255,255,255,0.07)'; };
  const inpBlur  = (e) => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.background = 'rgba(255,255,255,0.03)'; };

  const handleTypeChange = (type) => { setAccType(type); setStep(1); setError(''); setErrors({}); };

  return (
    <div style={{ position: 'relative', height: '100vh', display: 'flex', overflow: 'hidden', fontFamily: 'Inter, sans-serif' }}>

      {/* ── Background ── */}
      <video autoPlay muted loop playsInline style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0 }}>
        <source src={tunisiaVideo} type="video/mp4" />
      </video>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(4,8,20,0.85)', zIndex: 1 }} />

      {/* ── Top Bar ── */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, padding: '30px 50px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 20 }} className="animate-fade-in">
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
          <img src={logo} alt="SPIT" style={{ height: '48px', width: 'auto', filter: 'drop-shadow(0 0 10px rgba(36,70,212,0.4))' }} />
          <span style={{ fontSize: '20px', fontWeight: 900, letterSpacing: '0.15em', fontFamily: 'Manrope, sans-serif', color: 'white' }}>SPIT</span>
        </Link>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontSize: '14px', fontWeight: 600, transition: 'all 0.3s' }}
          onMouseEnter={e => { e.target.style.color = 'white'; e.target.style.transform = 'translateX(-4px)'; }}
          onMouseLeave={e => { e.target.style.color = 'rgba(255,255,255,0.6)'; e.target.style.transform = 'translateX(0)'; }}>
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_back</span> Back to Home
        </Link>
      </div>

      {/* ── Left Hero (Inclined) ── */}
      <div style={{
        position: 'absolute', left: 0, top: 0, bottom: 0, width: '60%', zIndex: 5,
        display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 80px',
        clipPath: 'polygon(0 0, 100% 0, 85% 100%, 0 100%)',
      }} className="animate-slide-left">
        <div style={{ maxWidth: '520px' }}>
          <div style={{ display: 'inline-block', fontSize: '12px', fontWeight: 800, letterSpacing: '0.25em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: '24px', padding: '6px 12px', background: 'rgba(255, 192, 56, 0.1)', borderRadius: '4px', borderLeft: '3px solid var(--accent)' }}>Join the Community</div>
          <h1 style={{ fontSize: '64px', fontWeight: 900, fontFamily: 'Manrope, sans-serif', color: 'white', lineHeight: 1.05, marginBottom: '24px', textShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
            Start Your<br /> <span style={{ color: 'transparent', WebkitTextStroke: '1px rgba(255,255,255,0.5)' }}>Tunisia Journey</span>
          </h1>
          <p style={{ fontSize: '18px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.8, marginBottom: '40px', maxWidth: '440px' }}>Unlock a world of personalized travel intelligence. Our AI is ready to plan your perfect trip.</p>
          
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            {activeSteps.map((s, i) => {
              const n = i + 1;
              const done = n < step, active = n === step;
              return (
                <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: 36, height: 36, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 900, background: done ? 'var(--accent)' : active ? 'var(--primary)' : 'rgba(255,255,255,0.05)', color: done ? 'var(--bg)' : 'white', border: active ? '1px solid var(--accent)' : '1px solid rgba(255,255,255,0.1)', transition: 'all 0.4s', transform: active ? 'scale(1.1)' : 'scale(1)' }}>
                    {done ? <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>check</span> : n}
                  </div>
                  {i < activeSteps.length - 1 && <div style={{ width: '20px', height: '2px', background: done ? 'var(--accent)' : 'rgba(255,255,255,0.1)' }} />}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Right Panel (Inclined) ── */}
      <div style={{
        position: 'absolute', right: 0, top: 0, bottom: 0, width: '45%', zIndex: 6,
        background: 'rgba(255,255,255,0.02)', backdropFilter: 'blur(40px)', WebkitBackdropFilter: 'blur(40px)',
        borderLeft: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '0 60px 0 100px', overflowY: 'auto', clipPath: 'polygon(20% 0, 100% 0, 100% 100%, 0 100%)',
      }} className="animate-slide-right">
        
        <div style={{ width: '100%', maxWidth: '400px', padding: '60px 0' }}>
          {error && <div style={{ background: 'rgba(186,26,26,0.15)', border: '1px solid rgba(186,26,26,0.3)', color: '#fca5a5', borderRadius: '12px', padding: '12px 16px', fontSize: '14px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}><span className="material-symbols-outlined" style={{ fontSize: '18px' }}>error</span>{error}</div>}

          {success ? (
            <div style={{ textAlign: 'center' }} className="animate-fade-in">
              <div style={{ fontSize: '64px', marginBottom: '24px' }}>✨</div>
              <h2 style={{ fontSize: '32px', fontWeight: 900, fontFamily: 'Manrope, sans-serif', color: 'white', marginBottom: '16px' }}>{accType === 'passenger' ? 'Welcome Aboard!' : 'Application Sent'}</h2>
              <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.5)', marginBottom: '40px', lineHeight: 1.6 }}>{accType === 'passenger' ? 'Your account is ready. Explore your personalized Tunisia dashboard now.' : 'Your application is received. We will review your profile and notify you via email.'}</p>
              <button onClick={() => navigate(accType === 'passenger' ? '/feed' : '/')} style={{ width: '100%', padding: '18px', borderRadius: '14px', background: 'var(--primary)', color: 'white', border: 'none', fontSize: '16px', fontWeight: 800, cursor: 'pointer', boxShadow: '0 10px 30px rgba(36,70,212,0.3)' }}>{accType === 'passenger' ? 'Go to Dashboard' : 'Back Home'}</button>
            </div>
          ) : (
            <div className="animate-fade-in">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <h2 style={{ fontSize: '28px', fontWeight: 900, fontFamily: 'Manrope, sans-serif', color: 'white' }}>{activeSteps[step-1]}</h2>
                <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '4px', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <button type="button" onClick={() => handleTypeChange('passenger')} style={{ padding: '8px 14px', borderRadius: '8px', border: 'none', background: accType === 'passenger' ? 'var(--accent)' : 'transparent', color: accType === 'passenger' ? 'var(--bg)' : 'rgba(255,255,255,0.4)', fontSize: '12px', fontWeight: 800, cursor: 'pointer' }}>Passenger</button>
                  <button type="button" onClick={() => handleTypeChange('staff')} style={{ padding: '8px 14px', borderRadius: '8px', border: 'none', background: accType === 'staff' ? 'var(--accent)' : 'transparent', color: accType === 'staff' ? 'var(--bg)' : 'rgba(255,255,255,0.4)', fontSize: '12px', fontWeight: 800, cursor: 'pointer' }}>Staff</button>
                </div>
              </div>

              {step === 1 && (
                <div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                    <div>
                      <label style={labelStyle}>First Name</label>
                      <input style={{...inpStyle, borderColor: errors.firstName ? '#ef4444' : 'rgba(255,255,255,0.1)'}} value={form.firstName} onChange={e => set('firstName', e.target.value)} onFocus={inpFocus} onBlur={inpBlur} />
                    </div>
                    <div>
                      <label style={labelStyle}>Last Name</label>
                      <input style={{...inpStyle, borderColor: errors.lastName ? '#ef4444' : 'rgba(255,255,255,0.1)'}} value={form.lastName} onChange={e => set('lastName', e.target.value)} onFocus={inpFocus} onBlur={inpBlur} />
                    </div>
                  </div>
                  <div style={{ marginBottom: '20px' }}>
                    <label style={labelStyle}>Email Address</label>
                    <input style={{...inpStyle, borderColor: errors.email ? '#ef4444' : 'rgba(255,255,255,0.1)'}} type="email" value={form.email} onChange={e => set('email', e.target.value)} onFocus={inpFocus} onBlur={inpBlur} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '32px' }}>
                    <div>
                      <label style={labelStyle}>Password</label>
                      <input style={{...inpStyle, borderColor: errors.password ? '#ef4444' : 'rgba(255,255,255,0.1)'}} type="password" value={form.password} onChange={e => set('password', e.target.value)} onFocus={inpFocus} onBlur={inpBlur} />
                    </div>
                    <div>
                      <label style={labelStyle}>Confirm</label>
                      <input style={{...inpStyle, borderColor: errors.confirmPassword ? '#ef4444' : 'rgba(255,255,255,0.1)'}} type="password" value={form.confirmPassword} onChange={e => set('confirmPassword', e.target.value)} onFocus={inpFocus} onBlur={inpBlur} />
                    </div>
                  </div>
                  <button type="button" onClick={next} style={{ width: '100%', padding: '16px', borderRadius: '14px', background: 'var(--primary)', color: 'white', border: 'none', fontSize: '16px', fontWeight: 800, cursor: 'pointer' }}>Continue →</button>
                </div>
              )}

              {step === 2 && accType === 'passenger' && (
                <div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                    <div><label style={labelStyle}>Age</label><input type="number" style={inpStyle} value={form.age} onChange={e => set('age', e.target.value)} onFocus={inpFocus} onBlur={inpBlur} /></div>
                    <div>
                      <label style={labelStyle}>Nationality</label>
                      <div style={{ position: 'relative' }}>
                        <div 
                          onClick={() => set('showCountries', !form.showCountries)}
                          style={{...inpStyle, cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}
                        >
                          <span style={{ color: form.nationality ? 'white' : 'rgba(255,255,255,0.4)' }}>
                            {form.nationality || 'Select Country'}
                          </span>
                          <span className="material-symbols-outlined" style={{ fontSize: '18px', transition: 'transform 0.3s', transform: form.showCountries ? 'rotate(180deg)' : 'rotate(0)' }}>
                            expand_more
                          </span>
                        </div>
                        
                        {form.showCountries && (
                          <div style={{ 
                            position: 'absolute', top: 'calc(100% + 8px)', left: 0, right: 0, 
                            background: 'rgba(15,23,42,0.95)', backdropFilter: 'blur(20px)', 
                            borderRadius: '14px', border: '1px solid rgba(255,255,255,0.1)', 
                            maxHeight: '280px', // Roughly 7 items (40px each)
                            overflowY: 'auto', zIndex: 100, 
                            boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
                            padding: '8px'
                          }} className="custom-scroll">
                            {COUNTRIES.map(c => (
                              <div 
                                key={c}
                                onClick={() => { set('nationality', c); set('showCountries', false); }}
                                style={{ 
                                  padding: '12px 16px', borderRadius: '8px', cursor: 'pointer', 
                                  color: 'rgba(255,255,255,0.7)', fontSize: '14px', 
                                  transition: 'all 0.2s',
                                  background: form.nationality === c ? 'rgba(36,70,212,0.3)' : 'transparent'
                                }}
                                onMouseEnter={e => { e.target.style.background = 'rgba(255,255,255,0.05)'; e.target.style.color = 'white'; }}
                                onMouseLeave={e => { e.target.style.background = form.nationality === c ? 'rgba(36,70,212,0.3)' : 'transparent'; e.target.style.color = form.nationality === c ? 'white' : 'rgba(255,255,255,0.7)'; }}
                              >
                                {c}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div style={{ marginBottom: '32px' }}>
                    <label style={labelStyle}>Travel Purpose</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>{PURPOSES.map(p => <div key={p.val} onClick={() => set('purpose', p.val)} style={pillStyle(form.purpose === p.val)}>{p.label}</div>)}</div>
                  </div>
                  <div style={{ display: 'flex', gap: '16px' }}>
                    <button type="button" onClick={back} style={{ flex: 1, padding: '16px', borderRadius: '14px', background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer' }}>Back</button>
                    <button type="button" onClick={next} style={{ flex: 2, padding: '16px', borderRadius: '14px', background: 'var(--primary)', color: 'white', border: 'none', cursor: 'pointer' }}>Next</button>
                  </div>
                </div>
              )}

              {step === 3 && accType === 'passenger' && (
                <div>
                  <div style={{ marginBottom: '24px' }}>
                    <label style={labelStyle}>Budget Preference</label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '10px' }}>
                      {BUDGETS.map(b => <div key={b.val} onClick={() => set('budget', b.val)} style={{ ...pillStyle(form.budget === b.val), flexDirection: 'column', padding: '16px 8px' }}><span>{b.icon}</span><span style={{ fontSize: '12px' }}>{b.name}</span></div>)}
                    </div>
                  </div>
                  <div style={{ marginBottom: '32px' }}>
                    <label style={labelStyle}>Interests</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>{PREFS.map(p => <div key={p.key} onClick={() => setPref(p.key)} style={pillStyle(form.prefs[p.key])}>{p.icon} {p.name}</div>)}</div>
                  </div>
                  <div style={{ display: 'flex', gap: '16px' }}>
                    <button type="button" onClick={back} style={{ flex: 1, padding: '16px', borderRadius: '14px', background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer' }}>Back</button>
                    <button type="button" onClick={next} style={{ flex: 2, padding: '16px', borderRadius: '14px', background: 'var(--primary)', color: 'white', border: 'none', cursor: 'pointer' }}>Review</button>
                  </div>
                </div>
              )}

              {((step === 4 && accType === 'passenger') || (step === 2 && accType === 'staff')) && (
                <div>
                  <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', padding: '24px', marginBottom: '32px' }}>
                    <div style={{ marginBottom: '16px' }}><label style={labelStyle}>Full Name</label><div style={{ color: 'white', fontWeight: 800 }}>{form.firstName} {form.lastName}</div></div>
                    <div style={{ marginBottom: '16px' }}><label style={labelStyle}>Email</label><div style={{ color: 'white', fontWeight: 800 }}>{form.email}</div></div>
                    {accType === 'passenger' && <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}><div><label style={labelStyle}>Age</label><div style={{ color: 'white', fontWeight: 800 }}>{form.age}</div></div><div><label style={labelStyle}>Budget</label><div style={{ color: 'white', fontWeight: 800 }}>{form.budget}</div></div></div>}
                  </div>
                  <div style={{ display: 'flex', gap: '16px' }}>
                    <button type="button" onClick={back} style={{ flex: 1, padding: '16px', borderRadius: '14px', background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer' }}>Edit</button>
                    <button type="button" onClick={submit} disabled={loading} style={{ flex: 2, padding: '16px', borderRadius: '14px', background: 'var(--primary)', color: 'white', border: 'none', fontWeight: 800, cursor: loading ? 'not-allowed' : 'pointer' }}>{loading ? 'Creating…' : 'Confirm & Register'}</button>
                  </div>
                </div>
              )}

              <p style={{ textAlign: 'center', marginTop: '32px', fontSize: '14px', color: 'rgba(255,255,255,0.4)' }}>Already have an account? <Link to="/login" style={{ color: 'white', fontWeight: 800, textDecoration: 'none', borderBottom: '1px solid var(--accent)' }}>Sign In</Link></p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
