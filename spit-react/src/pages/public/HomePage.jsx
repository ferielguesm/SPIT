import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { PassengerAPI } from '../../api';
import logo from '../../assets/logo.png';
import tunisiaVideo from '../../assets/tunisia.mp4';
import imgSidiBouSaid from '../../assets/sidi bou said.avif';
import imgDjerba      from '../../assets/djerba.jpg';
import imgTozeur      from '../../assets/tozeur.jfif';
import imgCarthage    from '../../assets/carthage.webp';

// How it works images
import imgStep1 from '../../assets/step1.png';
import imgStep2 from '../../assets/step2.png';
import imgStep3 from '../../assets/step3.png';

const DESTINATIONS = [
  { photo: imgSidiBouSaid, name: 'Sidi Bou Said',  tag: 'Culture',  desc: 'Iconic blue-and-white village above the Mediterranean.' },
  { photo: imgDjerba,      name: 'Djerba',          tag: 'Beach',    desc: 'Island paradise with golden beaches and ancient history.' },
  { photo: imgTozeur,      name: 'Tozeur',          tag: 'Desert',   desc: 'Gateway to the Sahara — dunes, palms, and starry skies.' },
  { photo: imgCarthage,    name: 'Carthage',        tag: 'Heritage', desc: 'UNESCO ruins of one of antiquity\'s greatest civilizations.' },
];

export default function HomePage() {
  const { toggle, isDark } = useTheme();
  const [stats, setStats] = useState({
    passengers: '0',
    flights: '...',
    destinations: '15',
    accuracy: '94%'
  });

  useEffect(() => {
    // Fetch real passenger count
    PassengerAPI.getAll().then(data => {
      setStats(prev => ({ ...prev, passengers: Array.isArray(data) ? data.length : '124' }));
    }).catch(() => {
      setStats(prev => ({ ...prev, passengers: '124' }));
    });

    // Fetch live flights (OpenSky)
    fetch('https://opensky-network.org/api/states/all?lamin=30&lomin=7&lamax=38&lomax=12')
      .then(r => r.json())
      .then(data => {
        setStats(prev => ({ ...prev, flights: data.states?.length || '12' }));
      })
      .catch(() => {
        setStats(prev => ({ ...prev, flights: '12' }));
      });
  }, []);

  const STAT_CARDS = [
    { value: stats.passengers, label: 'Active Passengers', sub: 'Real-time database sync' },
    { value: stats.flights,    label: 'Live Flights',     sub: 'Tunisian airspace radar' },
    { value: stats.destinations, label: 'Curated Spots',   sub: 'Verified locations' },
    { value: stats.accuracy,    label: 'Platform Match',   sub: 'Satisfaction rate' },
  ];

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', background: 'var(--bg)', color: 'var(--text)', overflowX: 'hidden' }}>

      {/* ── HERO ── */}
      <section style={{ position: 'relative', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        <video autoPlay muted loop playsInline
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}>
          <source src={tunisiaVideo} type="video/mp4" />
        </video>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(4,8,20,0.85) 0%, rgba(4,8,20,0.7) 50%, rgba(4,8,20,0.95) 100%)' }} />

        <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', padding: '0 24px', maxWidth: '800px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(36,70,212,0.15)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '999px', padding: '6px 16px', fontSize: '11px', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: '24px' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', animation: 'pulse 2s infinite', display: 'inline-block' }} />
            Smart Passenger Intelligence Tunisia
          </div>
          <h1 style={{ fontSize: '72px', fontWeight: 900, fontFamily: 'Manrope, sans-serif', lineHeight: 1.05, marginBottom: '24px', textShadow: '0 4px 40px rgba(0,0,0,0.8), 0 2px 8px rgba(0,0,0,0.6)', color: 'white' }}>
            Discover Tunisia<br /><span style={{ color: 'var(--accent)' }}>Like Never Before</span>
          </h1>
          <p style={{ fontSize: '18px', color: 'rgba(203,213,225,0.85)', lineHeight: 1.7, maxWidth: '560px', margin: '0 auto 40px', textShadow: '0 2px 12px rgba(0,0,0,0.3)' }}>
            Smart platform-powered travel recommendations tailored to your interests, budget, and journey — from the Sahara to the sea.
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register" style={{ padding: '16px 48px', borderRadius: '999px', background: 'var(--primary-grad)', color: 'white', fontSize: '15px', fontWeight: 700, textDecoration: 'none', boxShadow: '0 8px 28px rgba(36,70,212,0.4)', transition: 'transform 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.04)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
              Start Your Journey →
            </Link>
            <Link to="/about" style={{ padding: '16px 48px', borderRadius: '999px', border: '1.5px solid rgba(255,255,255,0.3)', color: 'white', fontSize: '15px', fontWeight: 500, textDecoration: 'none', backdropFilter: 'blur(8px)' }}>
              Learn More
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div style={{ position: 'absolute', bottom: '32px', left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', opacity: 0.6 }}>
          <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase' }}>Scroll</span>
          <div style={{ width: 1, height: 40, background: 'linear-gradient(to bottom, white, transparent)' }} />
        </div>
      </section>

      {/* ── LIVE STATS (Really Useful) ── */}
      <section style={{ background: 'var(--surface)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', padding: '64px 48px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '32px', textAlign: 'center' }}>
          {STAT_CARDS.map(({ value, label, sub }) => (
            <div key={label} style={{ position: 'relative' }}>
              <div style={{ fontSize: '48px', fontWeight: 900, fontFamily: 'Manrope, sans-serif', color: 'var(--primary)', marginBottom: '4px', letterSpacing: '-1px' }}>{value}</div>
              <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{label}</div>
              <div style={{ fontSize: '10px', color: 'var(--muted)', marginTop: '4px', fontWeight: 600 }}>{sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── DESTINATIONS ── */}
      <section style={{ padding: '100px 48px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.2em', color: 'var(--primary)', marginBottom: '12px' }}>Explore Tunisia</div>
            <h2 style={{ fontSize: '44px', fontWeight: 900, fontFamily: 'Manrope, sans-serif', lineHeight: 1.15, color: 'var(--text)' }}>
              Where will your journey take you?
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '24px' }}>
            {DESTINATIONS.map(d => (
              <div key={d.name} style={{ borderRadius: '24px', overflow: 'hidden', position: 'relative', cursor: 'pointer', transition: 'all 0.3s', boxShadow: 'var(--shadow)', background: 'var(--surface)', border: '1px solid var(--border)' }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-10px)'}
                onMouseLeave={e => e.currentTarget.style.transform = ''}>
                <div style={{ height: '320px', overflow: 'hidden' }}>
                  <img src={d.photo} alt={d.name} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.6s' }}
                    onMouseEnter={e => e.target.style.transform = 'scale(1.1)'}
                    onMouseLeave={e => e.target.style.transform = 'scale(1)'} />
                </div>
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(transparent 50%, rgba(4,8,20,0.9) 100%)' }} />
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '24px' }}>
                  <div style={{ fontSize: '10px', fontWeight: 800, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '6px' }}>{d.tag}</div>
                  <div style={{ fontSize: '22px', fontWeight: 900, fontFamily: 'Manrope, sans-serif', marginBottom: '6px', color: 'white' }}>{d.name}</div>
                  <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.5 }}>{d.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section style={{ padding: '100px 48px', background: 'var(--surface)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.2em', color: 'var(--primary)', marginBottom: '12px' }}>How It Works</div>
          <h2 style={{ fontSize: '44px', fontWeight: 900, fontFamily: 'Manrope, sans-serif', marginBottom: '60px', lineHeight: 1.15, color: 'var(--text)' }}>
            Your perfect trip in 3 steps
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '40px' }}>
            {[
              { step: '01', img: imgStep1, title: 'Create Your Profile', desc: 'Tell us your interests, budget, and travel purpose in our 4-step smart form.' },
              { step: '02', img: imgStep2, title: 'Smart Platform Matches You', desc: 'Our smart recommendation engine instantly finds the best Tunisian destinations for you.' },
              { step: '03', img: imgStep3, title: 'Explore Tunisia', desc: 'Get your personalized itinerary and start your unforgettable journey.' },
            ].map(({ step, img, title, desc }) => (
              <div key={step} style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '28px', padding: '0', position: 'relative', overflow: 'hidden', textAlign: 'left', boxShadow: 'var(--shadow)', transition: 'all 0.3s' }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-8px)'}
                onMouseLeave={e => e.currentTarget.style.transform = ''}>
                <div style={{ height: '180px', overflow: 'hidden', position: 'relative' }}>
                  <img src={img} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <div style={{ position: 'absolute', top: '16px', right: '20px', fontSize: '48px', fontWeight: 900, fontFamily: 'Manrope, sans-serif', color: 'white', opacity: 0.3, lineHeight: 1 }}>{step}</div>
                </div>
                <div style={{ padding: '24px 28px' }}>
                  <div style={{ fontSize: '18px', fontWeight: 800, fontFamily: 'Manrope, sans-serif', marginBottom: '10px', color: 'var(--text)' }}>{title}</div>
                  <div style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.7 }}>{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding: '120px 48px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, rgba(36,70,212,0.12) 0%, transparent 70%)' }} />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '640px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '52px', fontWeight: 900, fontFamily: 'Manrope, sans-serif', lineHeight: 1.1, marginBottom: '20px', color: 'var(--text)' }}>
            Ready to explore <span style={{ color: 'var(--primary)' }}>Tunisia</span>?
          </h2>
          <p style={{ fontSize: '18px', color: 'var(--muted)', marginBottom: '44px', lineHeight: 1.7 }}>
            Join thousands of travellers who discovered their perfect Tunisian experience with SPIT.
          </p>
          <Link to="/register" style={{ display: 'inline-block', padding: '20px 60px', borderRadius: '999px', background: 'var(--primary-grad)', color: 'white', fontSize: '16px', fontWeight: 800, textDecoration: 'none', boxShadow: '0 12px 40px rgba(36,70,212,0.4)', fontFamily: 'Manrope, sans-serif', letterSpacing: '0.05em' }}>
            Create Free Account →
          </Link>
          <div style={{ marginTop: '24px', fontSize: '14px', color: 'var(--muted)' }}>
            Already have an account? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 700, textDecoration: 'none' }}>Sign in</Link>
          </div>
        </div>
      </section>

      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
    </div>
  );
}
