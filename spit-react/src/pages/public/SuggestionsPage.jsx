import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { PassengerAPI } from '../../api';
import { BASE_URL as API_BASE } from '../../api';

const GRADIENTS = [
  'linear-gradient(45deg, #FF3CAC 0%, #784BA0 50%, #2B86C5 100%)',
  'linear-gradient(132deg, #F4D03F 0%, #16A085 100%)',
  'linear-gradient(62deg, #8EC5FC 0%, #E0C3FC 100%)',
  'linear-gradient(45deg, #00DBDE 0%, #FC00FF 100%)',
  'linear-gradient(19deg, #21D4FD 0%, #B721FF 100%)',
  'linear-gradient(90deg, #FAD961 0%, #F76B1C 100%)',
  'linear-gradient(43deg, #4158D0 0%, #C850C0 46%, #FFCC70 100%)'
];

function Avatar({ src, initials, color, size = 110 }) {
  const [imgError, setImgError] = useState(false);
  const style = {
    width: size, height: size, borderRadius: '50%', flexShrink: 0,
    background: color || '#4A919E',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: 'white', fontWeight: 800, fontSize: size * 0.35,
    overflow: 'hidden', border: '5px solid var(--surface)',
    boxShadow: '0 8px 24px var(--glass-shadow)',
    transition: 'transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
  };
  const imgSrc = src ? (src.startsWith('http') ? src : `${API_BASE}${src}`) : null;
  return (
    <div style={style} className="avatar-hover">
      {imgSrc && !imgError
        ? <img src={imgSrc} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={() => setImgError(true)} />
        : <span style={{ fontFamily: 'Manrope, sans-serif' }}>{initials || '?'}</span>
      }
    </div>
  );
}

export default function SuggestionsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const passengerId = user?.id;

  const [passenger, setPassenger] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [followed, setFollowed] = useState(new Set());

  useEffect(() => {
    if (!passengerId) { navigate('/login'); return; }
    
    const loadData = async () => {
      try {
        const [me, all] = await Promise.all([
          PassengerAPI.getById(passengerId),
          PassengerAPI.getAll()
        ]);
        setPassenger(me);
        
        const sorted = all
          .filter(p => p.id !== passengerId)
          .sort((a, b) => {
            const aMatch = a.nationality === me?.nationality || a.travel?.destination === me?.travel?.destination;
            const bMatch = b.nationality === me?.nationality || b.travel?.destination === me?.travel?.destination;
            if (aMatch && !bMatch) return -1;
            if (!aMatch && bMatch) return 1;
            return 0;
          });
        setSuggestions(sorted);
      } catch (error) {
        toast.error('Could not load community members');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [passengerId, navigate]);

  const toggleFollow = async (id) => {
    try {
      if (followed.has(id)) {
        await PassengerAPI.unfollow(id, passengerId);
        setFollowed(prev => { const s = new Set(prev); s.delete(id); return s; });
      } else {
        await PassengerAPI.follow(id, passengerId);
        setFollowed(prev => new Set([...prev, id]));
        toast.success('Connection established!');
      }
    } catch { toast.error('Could not update connection'); }
  };

  if (loading) return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 24, padding: '40px 24px' }}>
      {[1,2,3,4,5,6,7,8].map(i => (
        <div key={i} style={{ height: 350, background: 'var(--surface)', borderRadius: 24, animation: 'pulse 1.5s infinite', border: '1px solid var(--border)' }} />
      ))}
    </div>
  );

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px', animation: 'fadeIn 0.8s ease' }}>
      <header style={{ marginBottom: 48, textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(74,145,158,0.1)', padding: '6px 16px', borderRadius: 999, color: 'var(--primary)', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16 }}>
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>explore</span> Community Discovery
        </div>
        <h1 style={{ fontSize: '42px', fontWeight: 900, color: 'var(--text)', marginBottom: 12, fontFamily: 'Manrope, sans-serif', letterSpacing: '-1px' }}>Discover Your <span style={{ color: 'var(--primary)' }}>Network</span></h1>
        <p style={{ color: 'var(--muted)', fontSize: 17, maxWidth: 600, margin: '0 auto' }}>Meet other travellers and locals sharing your Tunisian experience.</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 24 }}>
        {suggestions.map((s, i) => {
          const name = `${s.firstName || s.nationality || 'Traveller'} ${s.lastName || ''}`.trim();
          const initials = name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
          const isFollowing = followed.has(s.id);
          const isMatch = s.nationality === passenger?.nationality || s.travel?.destination === passenger?.travel?.destination;
          const reason = s.nationality === passenger?.nationality ? 'Same Nationality' : 
                         s.travel?.destination === passenger?.travel?.destination ? 'Headed to ' + s.travel.destination : 
                         'Global Traveller';
          const icon = s.nationality === passenger?.nationality ? 'public' : 
                       s.travel?.destination === passenger?.travel?.destination ? 'location_on' : 
                       'language';

          return (
            <div key={s.id} 
              className="suggestion-card"
              style={{ 
                background: 'var(--surface)', 
                borderRadius: 28, 
                border: '1px solid var(--border)', 
                overflow: 'hidden', 
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                animation: `slideUp 0.6s ease-out ${i * 0.05}s both`
              }}
            >
              {/* Header Gradient */}
              <div style={{ height: 110, background: GRADIENTS[i % GRADIENTS.length], position: 'relative' }}>
                {isMatch && (
                  <div style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)', padding: '4px 10px', borderRadius: 999, display: 'flex', alignItems: 'center', gap: 4, color: 'white', fontSize: 10, fontWeight: 800, textTransform: 'uppercase' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 12 }}>stars</span> Match
                  </div>
                )}
              </div>

              {/* Avatar Section */}
              <div style={{ marginTop: -55, display: 'flex', justifyContent: 'center', position: 'relative', zIndex: 2 }}>
                <Avatar src={s.profileImageUrl} initials={initials} color={GRADIENTS[i % GRADIENTS.length].split(',')[1].trim()} size={110} />
              </div>
              
              <div style={{ padding: '20px 24px 28px', textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ fontSize: 19, fontWeight: 900, color: 'var(--text)', marginBottom: 6, fontFamily: 'Manrope, sans-serif' }}>{name}</h3>
                
                <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6, background: 'var(--surface2)', padding: '6px 14px', borderRadius: 999, fontSize: 12, fontWeight: 600, color: 'var(--muted)', alignSelf: 'center', marginBottom: 24 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 16, color: 'var(--primary)' }}>{icon}</span>
                  {reason}
                </div>

                <div style={{ marginTop: 'auto', display: 'flex', gap: 10 }}>
                  <button 
                    onClick={() => toggleFollow(s.id)}
                    className="follow-btn"
                    style={{ 
                      flex: 1,
                      padding: '12px', 
                      borderRadius: 16, 
                      background: isFollowing ? 'var(--surface2)' : 'var(--primary-grad)', 
                      color: isFollowing ? 'var(--text)' : 'white', 
                      border: 'none', 
                      fontSize: 14, 
                      fontWeight: 800, 
                      cursor: 'pointer',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      boxShadow: isFollowing ? 'none' : '0 8px 20px rgba(74, 145, 158, 0.3)'
                    }}
                  >
                    {isFollowing ? 'Following' : 'Connect'}
                  </button>
                  <button 
                    className="dismiss-btn"
                    style={{ 
                      width: 48, 
                      height: 48, 
                      borderRadius: 16, 
                      background: 'var(--surface2)', 
                      border: 'none', 
                      color: 'var(--muted)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.2s'
                    }}
                    onClick={() => setSuggestions(prev => prev.filter(x => x.id !== s.id))}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 22 }}>close</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { 
          from { opacity: 0; transform: translateY(30px); } 
          to { opacity: 1; transform: translateY(0); } 
        }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.6; } }

        .suggestion-card {
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        .suggestion-card:hover {
          transform: translateY(-10px) scale(1.02);
          box-shadow: 0 20px 40px rgba(0,0,0,0.25);
          border-color: var(--primary);
        }
        .suggestion-card:hover .avatar-hover {
          transform: scale(1.1) rotate(3deg);
        }
        .follow-btn:hover {
          opacity: 0.9;
          transform: scale(1.05);
        }
        .follow-btn:active {
          transform: scale(0.95);
        }
        .dismiss-btn:hover {
          background: #ef4444 !important;
          color: white !important;
        }
      `}</style>
    </div>
  );
}
