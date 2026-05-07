import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { PassengerAPI } from '../../api';
import logo    from '../../assets/logo.png';
import imgOACA  from '../../assets/OACA.webp';
import imgSesame from '../../assets/sesame.png';
import tunisiaVideo from '../../assets/tunisia.mp4';

import imgSidiBouSaid from '../../assets/sidi bou said.avif';
import imgDjerba      from '../../assets/djerba.jpg';
import imgTozeur      from '../../assets/tozeur.jfif';
import imgCarthage    from '../../assets/carthage.webp';

const DESTINATIONS = [
  { photo: imgSidiBouSaid, name: 'Sidi Bou Said', tag: 'Culture',  desc: 'Iconic blue-and-white village perched above the Mediterranean.' },
  { photo: imgDjerba,      name: 'Djerba',         tag: 'Beach',    desc: 'Island paradise with golden beaches and ancient history.' },
  { photo: imgTozeur,      name: 'Tozeur',          tag: 'Desert',   desc: 'Gateway to the Sahara — dunes, palms, and starry skies.' },
  { photo: imgCarthage,    name: 'Carthage',        tag: 'Heritage', desc: 'UNESCO ruins of one of antiquity\'s greatest civilizations.' },
];

const QUOTES = [
  { icon: '🌅', quote: 'Tunisia is where the Sahara meets the sea — a country of infinite contrasts, ancient stories, and warm hearts.' },
  { icon: '🎨', quote: 'From the blue streets of Sidi Bou Said to the golden dunes of Tozeur, every corner of Tunisia is a painting.' },
  { icon: '🏛️', quote: 'Carthage, Kairouan, Dougga — Tunisia carries 3,000 years of civilization in its stones and its people.' },
  { icon: '🌸', quote: 'The medinas of Tunisia are living museums — alleys filled with jasmine, artisans, and centuries of culture.' },
  { icon: '🍽️', quote: 'Tunisian cuisine is a journey — harissa, brik, couscous, and fresh seafood from a crossroads civilization.' },
  { icon: '✨', quote: 'Whether you seek desert adventure, coastal peace, or ancient ruins — Tunisia has a place made just for you.' },
];

export default function AboutPage() {
  const { toggle, isDark } = useTheme();
  const [stats, setStats] = useState({ passengers: '—', recs: '—' });

  useEffect(() => {
    PassengerAPI.getStats().then(s => {
      setStats({
        passengers: (s.totalPassengers || 0).toLocaleString(),
        recs: ((s.totalPassengers || 0) * 3).toLocaleString(),
      });
    }).catch(() => {});
  }, []);

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', background: 'var(--bg)', color: 'var(--text)', overflowX: 'hidden' }}>

      {/* ── HERO (video background, same as HomePage) ── */}
      <section style={{ position: 'relative', height: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        <video autoPlay muted loop playsInline
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}>
          <source src={tunisiaVideo} type="video/mp4" />
        </video>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(4,8,20,0.85) 0%, rgba(4,8,20,0.7) 50%, rgba(4,8,20,0.95) 100%)' }} />
        <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', padding: '0 24px', maxWidth: '720px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(36,70,212,0.15)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '999px', padding: '6px 16px', fontSize: '11px', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: '20px' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', animation: 'pulse 2s infinite', display: 'inline-block' }} />
            About SPIT
          </div>
          <h1 style={{ 
            fontSize: '56px', fontWeight: 900, 
            fontFamily: '"SD Dystopian", "Orbitron", sans-serif', 
            lineHeight: 1.1, marginBottom: '16px', 
            textShadow: '0 4px 40px rgba(0,0,0,0.8), 0 2px 8px rgba(0,0,0,0.6)',
            animation: 'fade5s 5s infinite'
          }}>
            <span style={{ color: 'var(--accent)' }}>Smart Passenger</span><br />
            <span style={{ color: 'white' }}>Intelligence Tunisia</span>
          </h1>
          <style>{`
            @keyframes fade5s {
              0%, 100% { opacity: 0; }
              10%, 90% { opacity: 1; }
            }
          `}</style>
          <p style={{ fontSize: '17px', color: 'rgba(203,213,225,0.85)', lineHeight: 1.7, textShadow: '0 2px 12px rgba(0,0,0,0.4)' }}>
            A final-year academic project combining smart platform recommendations and smart UX to deliver personalized travel experiences for every passenger.
          </p>
        </div>
      </section>

      {/* ── STATS ── */}
      <section style={{ background: 'var(--surface)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', padding: '48px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '32px', textAlign: 'center' }}>
          {[
            { value: stats.passengers, label: 'Passengers Registered' },
            { value: stats.recs,       label: 'Recommendations Generated' },
            { value: '15+',            label: 'Tunisian Destinations' },
            { value: '2026',           label: 'Final-Year Project' },
          ].map(({ value, label }) => (
            <div key={label}>
              <div style={{ fontSize: '38px', fontWeight: 900, fontFamily: 'Manrope, sans-serif', color: 'var(--primary)', marginBottom: '6px' }}>{value}</div>
              <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── MISSION ── */}
      <section style={{ padding: '100px 48px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '64px', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.2em', color: 'var(--primary)', marginBottom: '12px' }}>Our Mission</div>
            <h2 style={{ fontSize: '40px', fontWeight: 900, fontFamily: 'Manrope, sans-serif', color: 'var(--text)', lineHeight: 1.2, marginBottom: '20px' }}>
              Making every transit smarter
            </h2>
            <p style={{ fontSize: '16px', color: 'var(--muted)', lineHeight: 1.75, marginBottom: '28px' }}>
              SPIT collects passenger preferences through a smart 4-step onboarding form and uses a rule-based recommendation engine to suggest the best Tunisian destinations, activities, and experiences — tailored to each traveller's profile, budget, and interests.
            </p>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <Link to="/register" style={{ padding: '12px 24px', borderRadius: '10px', background: 'var(--primary-grad)', color: 'white', fontSize: '14px', fontWeight: 700, textDecoration: 'none', boxShadow: '0 8px 24px rgba(36,70,212,0.3)', transition: 'transform 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.04)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
                Start Your Journey →
              </Link>
              <Link to="/login" style={{ padding: '12px 24px', borderRadius: '10px', border: '1.5px solid rgba(255,255,255,0.2)', color: 'var(--text)', fontSize: '14px', fontWeight: 600, textDecoration: 'none' }}>
                Sign In
              </Link>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {[
              { icon: 'hub', title: 'Smart Platform Matches', desc: 'Rule-based engine matches your interests to the best Tunisian destinations instantly.' },
              { icon: 'bolt', title: 'Instant Onboarding',  desc: '4-step smart form captures your profile and generates recommendations in seconds.' },
              { icon: 'lock', title: 'Secure Portals',      desc: 'Separate admin and passenger portals with role-based access control.' },
              { icon: 'monitoring', title: 'Live Analytics',       desc: 'Full admin dashboard with passenger stats, charts, and activity logs.' },
            ].map(({ icon, title, desc }) => (
              <div key={title} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '20px', transition: 'all 0.2s', boxShadow: 'var(--shadow)' }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
                onMouseLeave={e => e.currentTarget.style.transform = ''}>
                <div style={{ marginBottom: '10px' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '32px', color: 'var(--accent)' }}>{icon}</span>
                </div>
                <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text)', marginBottom: '6px', fontFamily: 'Manrope, sans-serif' }}>{title}</div>
                <div style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.6 }}>{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── DESTINATIONS ── */}
      <section style={{ padding: '0 48px 100px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '56px' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.2em', color: 'var(--primary)', marginBottom: '12px' }}>Explore Tunisia</div>
            <h2 style={{ fontSize: '40px', fontWeight: 900, fontFamily: 'Manrope, sans-serif', color: 'var(--text)', lineHeight: 1.15 }}>
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

      {/* ── QUOTES ── */}
      <section style={{ padding: '0 48px 100px', background: 'var(--bg)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', paddingTop: '80px' }}>
          <div style={{ textAlign: 'center', marginBottom: '56px' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.2em', color: 'var(--primary)', marginBottom: '12px' }}>The Soul of Tunisia</div>
            <h2 style={{ fontSize: '40px', fontWeight: 900, fontFamily: 'Manrope, sans-serif', color: 'var(--text)', lineHeight: 1.15 }}>
              A land that stays with you forever
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '24px' }}>
            {QUOTES.map(({ icon, quote }) => (
              <div key={quote} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '20px', padding: '28px', display: 'flex', flexDirection: 'column', gap: '14px', transition: 'all 0.2s', boxShadow: 'var(--shadow)' }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
                onMouseLeave={e => e.currentTarget.style.transform = ''}>
                <div style={{ fontSize: '28px' }}>{icon}</div>
                <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.75, fontStyle: 'italic' }}>"{quote}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ACADEMIC SECTION ── */}
      <section style={{ padding: '80px 48px', background: 'var(--surface)', borderTop: '1px solid var(--border)' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.2em', color: 'var(--primary)', marginBottom: '12px' }}>
            Final Year Project
          </div>
          <h2 style={{ fontSize: '36px', fontWeight: 900, fontFamily: 'Manrope, sans-serif', color: 'var(--text)', lineHeight: 1.2, marginBottom: '16px' }}>
            Built as a Final Year Graduation Project
          </h2>
          <p style={{ fontSize: '16px', color: 'var(--muted)', lineHeight: 1.75, maxWidth: '640px', margin: '0 auto 48px' }}>
            SPIT — Smart Passenger Intelligence Tunisia — is a final year graduation project developed in partnership with the <strong style={{ color: 'var(--text)' }}>Office of Civil Aviation and Airports (OACA)</strong> and supervised by <strong style={{ color: 'var(--text)' }}>Université Sesame</strong>. The project aims to modernize the passenger experience in Tunisian airports through smart platform technology and personalized travel recommendations.
          </p>

          {/* Logos */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '64px', flexWrap: 'wrap' }}>
            {/* OACA */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
              <div style={{ width: 120, height: 120, borderRadius: '20px', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '12px', boxShadow: '0 8px 32px rgba(0,0,0,0.15)', border: '1px solid var(--border)' }}>
                <img src={imgOACA} alt="OACA" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              </div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text)', fontFamily: 'Manrope, sans-serif' }}>OACA</div>
                <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '2px' }}>Office of Civil Aviation and Airports</div>
              </div>
            </div>

            {/* Divider */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', color: 'var(--muted)' }}>
              <div style={{ width: 1, height: 40, background: 'var(--border)' }} />
              <span style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em' }}>×</span>
              <div style={{ width: 1, height: 40, background: 'var(--border)' }} />
            </div>

            {/* Sesame */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
              <div style={{ width: 120, height: 120, borderRadius: '20px', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '12px', boxShadow: '0 8px 32px rgba(0,0,0,0.15)', border: '1px solid var(--border)' }}>
                <img src={imgSesame} alt="Sesame" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              </div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text)', fontFamily: 'Manrope, sans-serif' }}>Université Sesame</div>
                <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '2px' }}>Academic Supervisor & University Partner</div>
              </div>
            </div>
          </div>

          {/* Badge */}
          <div style={{ marginTop: '48px', display: 'inline-flex', alignItems: 'center', gap: '10px', background: 'rgba(36,70,212,0.1)', border: '1px solid rgba(36,70,212,0.2)', borderRadius: '999px', padding: '10px 24px' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--primary)' }}>school</span>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)' }}>Final Year Graduation Project — Class of 2026</span>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding: '100px 48px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, rgba(36,70,212,0.12) 0%, transparent 70%)' }} />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '600px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '44px', fontWeight: 900, fontFamily: 'Manrope, sans-serif', color: 'var(--text)', lineHeight: 1.1, marginBottom: '16px' }}>
            Ready to explore <span style={{ color: 'var(--primary)' }}>Tunisia</span>?
          </h2>
          <p style={{ fontSize: '16px', color: 'var(--muted)', marginBottom: '36px', lineHeight: 1.7 }}>
            Create your free account and get personalized travel recommendations in under 2 minutes.
          </p>
          <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register" style={{ padding: '15px 36px', borderRadius: '999px', background: 'var(--primary-grad)', color: 'white', fontSize: '15px', fontWeight: 700, textDecoration: 'none', boxShadow: '0 8px 24px rgba(36,70,212,0.35)', transition: 'transform 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.04)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
              Create Free Account →
            </Link>
            <Link to="/login" style={{ padding: '15px 36px', borderRadius: '999px', border: '1.5px solid rgba(255,255,255,0.2)', color: 'var(--text)', fontSize: '15px', fontWeight: 600, textDecoration: 'none' }}>
              Sign In
            </Link>
          </div>
        </div>
      </section>

      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
    </div>
  );
}
