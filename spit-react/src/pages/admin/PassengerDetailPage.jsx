import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useApi } from '../../hooks/useApi';
import { PassengerAPI } from '../../api';
import Topbar from '../../components/layout/Topbar';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { PurposeBadge, BudgetBadge } from '../../components/ui/Badge';

const DEST_EMOJI = { 'Tozeur':'🏜️','Douz':'🐪','Carthage':'🏛️','Kairouan':'🕌','Dougga':'🏺','Hammamet':'🏖️','Djerba':'🌊','Monastir':'⛵','Tunis':'🏙️','Sfax':'🍴','Tabarka':'🤿','Ain Draham':'🌲','Gammarth':'💎','Sidi Bou Said':'🎨','La Marsa':'☕','Nabeul':'🏺','Tunis Medina':'🍽️' };
const PREF_ICONS = { beach:'🏖️', culture:'🏛️', desert:'🐪', gastronomy:'🍽️', sports:'⚽' };
const COLORS = ['#212E53','#4A919E','#BED3C3','#EBACA2','#76767f','#505d85','#166874'];
function formatDate(iso) { if (!iso) return '—'; return new Date(iso).toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' }); }

export default function PassengerDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: p, loading, refetch } = useApi(() => PassengerAPI.getById(id), [id]);

  // We need all passengers for the "All Contacts" column
  const { data: allP } = useApi(PassengerAPI.getAll);
  const contacts = Array.isArray(allP) ? allP : [];

  if (loading) return <div><Topbar title="Passengers" /><div style={{ textAlign: 'center', padding: '80px', color: 'var(--muted)' }}>Loading…</div></div>;
  if (!p) return <div><Topbar title="Passengers" /><div style={{ textAlign: 'center', padding: '80px', color: 'var(--muted)' }}>Passenger not found.</div></div>;

  const t = p.travel || {};
  const recs  = p.recommendations || [];
  const name = `${p.firstName||''} ${p.lastName||''}`.trim() || `Passenger #${p.id}`;
  const initials = (p.firstName?.[0] || p.nationality?.[0] || 'P').toUpperCase();
  
  // Custom styles for this specific light/neobrutal layout
  const cardStyle = {
    background: 'var(--surface)',
    borderRadius: '24px',
    padding: '24px',
    border: '1px solid var(--border)',
    boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      <Topbar title="Passenger Profile" />
      
      <div style={{ 
        flex: 1, 
        padding: '0 24px 24px 24px', 
        display: 'grid', 
        gridTemplateColumns: '280px 1fr 320px', 
        gap: '24px',
        overflow: 'hidden'
      }}>
        
        {/* LEFT COLUMN: All Contacts */}
        <div style={{ ...cardStyle, display: 'flex', flexDirection: 'column', padding: '20px 12px', overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 12px 16px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text)', fontFamily: 'Manrope, sans-serif' }}>All Contacts</h2>
            <button style={{ background: 'var(--surface2)', border: 'none', width: 32, height: 32, borderRadius: '50%', color: 'var(--text)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>search</span>
            </button>
          </div>
          
          <div style={{ overflowY: 'auto', flex: 1, paddingRight: '4px' }}>
            {contacts.map(c => {
              const cName = `${c.firstName||''} ${c.lastName||''}`.trim() || `Pass. #${c.id}`;
              const isSel = String(c.id) === String(p.id);
              return (
                <div key={c.id} onClick={() => navigate(`/admin/passengers/${c.id}`)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', 
                    borderRadius: '16px', cursor: 'pointer', marginBottom: '4px',
                    background: isSel ? 'var(--surface2)' : 'transparent',
                    border: isSel ? '1px solid var(--border)' : '1px solid transparent',
                    transition: 'all 0.2s'
                  }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: COLORS[c.id % COLORS.length], display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: '14px', flexShrink: 0 }}>
                    {(c.firstName?.[0] || 'P').toUpperCase()}
                  </div>
                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{cName}</div>
                    <div style={{ fontSize: '11px', color: 'var(--muted)' }}>{c.nationality || 'Traveler'}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* CENTER COLUMN: Profile & Analytics */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', overflowY: 'auto', paddingRight: '8px' }}>
          
          {/* Main Profile Header */}
          <div style={{ ...cardStyle, position: 'relative', paddingTop: '40px' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
              <div style={{ position: 'relative' }}>
                <div style={{ width: 120, height: 120, borderRadius: '40px', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '48px', fontWeight: 900, fontFamily: 'Manrope, sans-serif' }}>
                  {initials}
                </div>
                <div style={{ position: 'absolute', bottom: -16, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '6px', background: 'var(--surface2)', padding: '6px 12px', borderRadius: '999px', border: '2px solid var(--surface)', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
                  {['call', 'chat', 'mail', 'work'].map(icon => (
                    <button key={icon} style={{ background: 'transparent', border: 'none', color: 'var(--text)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 24, height: 24 }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>{icon}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            <div style={{ textAlign: 'center', marginTop: '24px' }}>
              <h1 style={{ fontSize: '28px', fontWeight: 900, fontFamily: 'Manrope, sans-serif', color: 'var(--text)', marginBottom: '16px' }}>{name}</h1>
              
              <div style={{ display: 'flex', justifyContent: 'center', gap: '32px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--muted)', fontSize: '13px', fontWeight: 500 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>call</span>
                  +216 ** *** ***
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--muted)', fontSize: '13px', fontWeight: 500 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>mail</span>
                  {p.email || 'contact@example.com'}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--muted)', fontSize: '13px', fontWeight: 500 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>location_on</span>
                  {p.nationality}, {t.destination || 'Tunisia'}
                </div>
              </div>
            </div>
          </div>

          {/* Analytics Section */}
          <div style={{ ...cardStyle }}>
            <div style={{ display: 'flex', gap: '16px', borderBottom: '1px solid var(--border)', paddingBottom: '16px', marginBottom: '24px' }}>
              <button style={{ background: 'transparent', border: 'none', color: 'var(--text)', fontSize: '14px', fontWeight: 800, padding: '4px 12px', borderBottom: '2px solid var(--primary)' }}>Analytics</button>
              <button style={{ background: 'transparent', border: 'none', color: 'var(--muted)', fontSize: '14px', fontWeight: 600, padding: '4px 12px' }}>General</button>
              <button style={{ background: 'transparent', border: 'none', color: 'var(--muted)', fontSize: '14px', fontWeight: 600, padding: '4px 12px' }}>Summary</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '16px' }}>
              {[
                { l: 'Average score', v: '430', tag: '+13%' },
                { l: 'Trips Started', v: '19', tag: '' },
                { l: 'Lost Trips', v: '2', tag: '' },
                { l: 'Completed', v: '24', tag: '' }
              ].map(stat => (
                <div key={stat.l}>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--muted)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {stat.l} {stat.tag && <span style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#10b981', padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: 800 }}>{stat.tag}</span>}
                  </div>
                  <div style={{ fontSize: '36px', fontWeight: 900, fontFamily: 'Manrope, sans-serif', color: 'var(--text)' }}>{stat.v}</div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Notes & Chat */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', overflowY: 'auto' }}>
          
          {/* Notes (AI Recs) */}
          <div style={{ ...cardStyle, flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>auto_awesome</span> Notes & AI
              </h3>
              <button onClick={refreshRecs} style={{ background: 'var(--surface2)', border: 'none', width: 32, height: 32, borderRadius: '8px', color: 'var(--text)', cursor: 'pointer' }}>+</button>
            </div>
            
            <p style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '16px', lineHeight: 1.6 }}>After profile analysis, the following travel recommendations were noted:</p>
            
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {recs.length === 0 ? <div style={{ color: 'var(--muted)', fontSize: '12px' }}>No recommendations yet.</div> : null}
              {recs.map((r, i) => (
                <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'rgba(255, 192, 56, 0.2)', color: '#FFC038', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '14px' }}>✓</div>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)' }}>{r.destination}</div>
                    <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '2px' }}>{r.activity}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Chat Mock */}
          <div style={{ ...cardStyle, flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>chat_bubble</span> Chat
              </h3>
              <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--muted)' }}>open_in_full</span>
            </div>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto', paddingBottom: '16px' }}>
              <div style={{ background: 'var(--surface2)', padding: '12px 16px', borderRadius: '16px 16px 16px 0', fontSize: '13px', color: 'var(--text)', alignSelf: 'flex-start', maxWidth: '85%' }}>
                Can you check the itinerary for {t.destination || 'Tunis'}?
              </div>
              <div style={{ fontSize: '11px', color: 'var(--muted)', alignSelf: 'flex-end', marginTop: '-10px' }}>8:32 AM</div>
              
              <div style={{ background: 'var(--primary)', padding: '12px 16px', borderRadius: '16px 16px 0 16px', fontSize: '13px', color: 'white', alignSelf: 'flex-end', maxWidth: '85%' }}>
                Sure, looking into it now. Here is the draft document.
              </div>
            </div>

            <div style={{ position: 'relative', marginTop: 'auto' }}>
              <input type="text" placeholder="Type something..." style={{ width: '100%', background: 'var(--surface2)', border: '1px solid var(--border)', padding: '14px 48px 14px 16px', borderRadius: '16px', color: 'var(--text)', fontSize: '13px', outline: 'none' }} />
              <button style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', width: 32, height: 32, borderRadius: '10px', background: '#FFC038', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#040814', cursor: 'pointer' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>send</span>
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
