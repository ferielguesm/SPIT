import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useApi } from '../../hooks/useApi';
import { PassengerAPI } from '../../api';
import Topbar from '../../components/layout/Topbar';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Input, { Select } from '../../components/ui/Input';
import { PurposeBadge, BudgetBadge } from '../../components/ui/Badge';

const COLORS = ['#212E53','#4A919E','#BED3C3','#EBACA2','#76767f','#505d85','#166874'];
function timeAgo(iso) {
  if (!iso) return 'â€”';
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  return hrs < 24 ? `${hrs} hr ago` : `${Math.floor(hrs/24)} days ago`;
}

export default function PassengersPage() {
  const navigate = useNavigate();
  const { data: passengers, loading, refetch } = useApi(PassengerAPI.getAll);
  const [view, setView]     = useState('grid');
  const [search, setSearch] = useState('');
  const [purpose, setPurpose] = useState('');
  const [budget, setBudget]   = useState('');
  const [modal, setModal]     = useState(false);
  const [form, setForm] = useState({ firstName:'', lastName:'', email:'', password:'', age:'', nationality:'', duration:'', destination:'', purpose:'', budget:'', beach:false, culture:false, desert:false, gastronomy:false, sports:false });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const filtered = (Array.isArray(passengers) ? passengers : []).filter(p => {
    const t = p.travel || {};
    if (purpose && (t.purpose||'').toLowerCase() !== purpose) return false;
    if (budget  && (t.budget||'').toLowerCase()  !== budget)  return false;
    if (search  && !(p.nationality||'').toLowerCase().includes(search.toLowerCase()) && !String(p.id).includes(search)) return false;
    return true;
  });

  const submit = async (e) => {
    e.preventDefault();
    try {
      await PassengerAPI.create({ firstName: form.firstName, lastName: form.lastName, email: form.email, password: form.password, age: parseInt(form.age), nationality: form.nationality, travel: { duration: parseInt(form.duration), destination: form.destination, purpose: form.purpose, budget: form.budget }, preferences: { beach: form.beach, culture: form.culture, desert: form.desert, gastronomy: form.gastronomy, sports: form.sports } });
      toast.success('Passenger created!'); setModal(false); refetch();
    } catch (e) { toast.error(e.message); }
  };

  const deleteP = async (id) => {
    if (!confirm('Delete this passenger?')) return;
    try { await PassengerAPI.delete(id); toast.success('Deleted'); refetch(); } catch (e) { toast.error(e.message); }
  };

  return (
    <div>
      <Topbar title="Passengers">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginLeft: '16px' }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search passengersâ€¦" style={{ background: 'var(--input-bg)', border: '1.5px solid var(--input-border)', borderRadius: '12px', padding: '8px 14px', fontSize: '13px', color: 'var(--text)', outline: 'none', width: '240px' }} />
        </div>
      </Topbar>
      <div style={{ padding: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h2 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text)' }}>Passenger Registry</h2>
            <p style={{ color: 'var(--muted)', marginTop: '4px', fontSize: '14px' }}>{filtered.length} passengers found</p>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <div style={{ display: 'flex', background: 'var(--surface2)', padding: '4px', borderRadius: '10px', gap: '2px' }}>
              {['grid','list'].map(v => (
                <button key={v} onClick={() => setView(v)} style={{ padding: '6px 12px', borderRadius: '8px', border: 'none', cursor: 'pointer', background: view===v ? 'var(--surface)' : 'transparent', color: 'var(--text)', boxShadow: view===v ? '0 1px 3px rgba(0,0,0,.1)' : 'none' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>{v === 'grid' ? 'grid_view' : 'view_list'}</span>
                </button>
              ))}
            </div>
            <Button variant="primary" icon="person_add" onClick={() => setModal(true)}>Add Passenger</Button>
          </div>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '24px' }}>
          {[['purpose', purpose, setPurpose, ['tourism','business','family','medical']], ['budget', budget, setBudget, ['economy','standard','premium']]].map(([label, val, setter, opts]) => (
            <select key={label} value={val} onChange={e => setter(e.target.value)} style={{ background: 'var(--input-bg)', border: '1.5px solid var(--input-border)', borderRadius: '10px', padding: '8px 14px', fontSize: '13px', color: 'var(--text)', outline: 'none' }}>
              <option value="">All {label.charAt(0).toUpperCase()+label.slice(1)}s</option>
              {opts.map(o => <option key={o} value={o}>{o.charAt(0).toUpperCase()+o.slice(1)}</option>)}
            </select>
          ))}
          <button onClick={() => { setSearch(''); setPurpose(''); setBudget(''); }} style={{ background: 'var(--surface2)', border: '1.5px solid var(--input-border)', borderRadius: '10px', padding: '8px 14px', fontSize: '13px', color: 'var(--muted)', cursor: 'pointer' }}>Clear</button>
        </div>

        {loading ? <div style={{ textAlign: 'center', padding: '60px', color: 'var(--muted)' }}>Loadingâ€¦</div> : (
          view === 'grid' ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: '20px' }}>
              {filtered.map(p => {
                const t = p.travel || {};
                const bg = COLORS[p.id % COLORS.length];
                const prefs = p.preferences || {};
                const prefTags = Object.entries(prefs).filter(([k,v]) => v === true && ['beach','culture','desert','gastronomy','sports'].includes(k)).map(([k]) => k);
                return (
                  <Card key={p.id} hover style={{ padding: '24px', cursor: 'pointer' }} onClick={() => navigate(`/admin/passengers/${p.id}`)}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
                      <div style={{ width: 52, height: 52, borderRadius: '14px', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: 800, color: 'white', flexShrink: 0 }}>{(p.nationality||'??').substring(0,2).toUpperCase()}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text)', fontFamily: 'Manrope, sans-serif' }}>#SP-{String(p.id).padStart(5,'0')}</div>
                        <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '2px' }}>{p.nationality} Â· Age {p.age}</div>
                      </div>
                      <PurposeBadge purpose={t.purpose} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '12px' }}>
                      {[['Destination', t.destination||'â€”'], ['Duration', (t.duration||'â€”')+' days']].map(([l,v]) => (
                        <div key={l}><div style={{ color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', fontSize: '10px', letterSpacing: '0.05em' }}>{l}</div><div style={{ fontWeight: 700, color: 'var(--text)', marginTop: '2px' }}>{v}</div></div>
                      ))}
                      <div><div style={{ color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', fontSize: '10px', letterSpacing: '0.05em' }}>Budget</div><div style={{ marginTop: '4px' }}><BudgetBadge budget={t.budget} /></div></div>
                      <div><div style={{ color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', fontSize: '10px', letterSpacing: '0.05em' }}>Registered</div><div style={{ fontWeight: 700, color: 'var(--text)', marginTop: '2px' }}>{timeAgo(p.createdAt)}</div></div>
                    </div>
                    {prefTags.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '14px' }}>
                        {prefTags.map(k => <span key={k} style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '999px', background: 'var(--surface2)', color: 'var(--muted)', fontWeight: 600 }}>{k}</span>)}
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card style={{ overflow: 'hidden' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead><tr style={{ background: 'var(--surface2)' }}>
                    {['Passenger','Age','Nationality','Purpose','Destination','Budget','Duration',''].map(h => (
                      <th key={h} style={{ padding: '14px 24px', fontSize: '10px', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.1em', textAlign: 'left' }}>{h}</th>
                    ))}
                  </tr></thead>
                  <tbody>
                    {filtered.map(p => {
                      const t = p.travel || {};
                      const bg = COLORS[p.id % COLORS.length];
                      return (
                        <tr key={p.id} style={{ borderTop: '1px solid var(--border)' }}
                          onMouseEnter={e => e.currentTarget.style.background = 'var(--surface2)'}
                          onMouseLeave={e => e.currentTarget.style.background = ''}>
                          <td style={{ padding: '16px 24px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <div style={{ width: 32, height: 32, borderRadius: '8px', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700, color: 'white' }}>{(p.nationality||'??').substring(0,2).toUpperCase()}</div>
                              <span style={{ fontWeight: 700, color: 'var(--text)' }}>#SP-{String(p.id).padStart(5,'0')}</span>
                            </div>
                          </td>
                          <td style={{ padding: '16px 24px', color: 'var(--muted)' }}>{p.age}</td>
                          <td style={{ padding: '16px 24px' }}><span style={{ padding: '2px 8px', borderRadius: '6px', background: 'var(--surface2)', fontSize: '11px', fontWeight: 700 }}>{p.nationality}</span></td>
                          <td style={{ padding: '16px 24px' }}><PurposeBadge purpose={t.purpose} /></td>
                          <td style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--text)' }}>{t.destination||'â€”'}</td>
                          <td style={{ padding: '16px 24px' }}><BudgetBadge budget={t.budget} /></td>
                          <td style={{ padding: '16px 24px', color: 'var(--muted)' }}>{t.duration||'â€”'} days</td>
                          <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                            <button onClick={() => navigate(`/admin/passengers/${p.id}`)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', padding: '4px' }}>
                              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>visibility</span>
                            </button>
                            <button onClick={() => deleteP(p.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', padding: '4px' }}>
                              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>delete</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          )
        )}
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title="New Passenger">
        <form onSubmit={submit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Input label="First Name" value={form.firstName} onChange={e => set('firstName', e.target.value)} required />
            <Input label="Last Name"  value={form.lastName}  onChange={e => set('lastName',  e.target.value)} required />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Input label="Email"    type="email"    value={form.email}    onChange={e => set('email',    e.target.value)} required />
            <Input label="Password" type="password" value={form.password} onChange={e => set('password', e.target.value)} required />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Input label="Age"         type="number" value={form.age}         onChange={e => set('age',         e.target.value)} min="1" max="119" required />
            <Input label="Nationality"               value={form.nationality} onChange={e => set('nationality', e.target.value)} required />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Input label="Duration (days)" type="number" value={form.duration}    onChange={e => set('duration',    e.target.value)} min="1" required />
            <Input label="Destination"                   value={form.destination} onChange={e => set('destination', e.target.value)} required />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Select label="Purpose" value={form.purpose} onChange={e => set('purpose', e.target.value)} required>
              <option value="">Selectâ€¦</option>
              {['tourism','business','family','medical'].map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase()+p.slice(1)}</option>)}
            </Select>
            <Select label="Budget" value={form.budget} onChange={e => set('budget', e.target.value)} required>
              <option value="">Selectâ€¦</option>
              {['economy','standard','premium'].map(b => <option key={b} value={b}>{b.charAt(0).toUpperCase()+b.slice(1)}</option>)}
            </Select>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '24px' }}>
            {[['beach','ðŸ– Beach'],['culture','ðŸ› Culture'],['desert','ðŸœ Desert'],['gastronomy','ðŸ½ Gastronomy'],['sports','âš½ Sports']].map(([k,l]) => (
              <label key={k} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 14px', borderRadius: '10px', border: `1.5px solid ${form[k] ? '#4A919E' : 'var(--input-border)'}`, background: form[k] ? 'rgba(74,145,158,0.08)' : 'transparent', cursor: 'pointer', fontSize: '13px', fontWeight: 500, color: form[k] ? '#166874' : 'var(--text)', transition: 'all 0.2s' }}>
                <input type="checkbox" checked={form[k]} onChange={e => set(k, e.target.checked)} style={{ accentColor: '#4A919E' }} /> {l}
              </label>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <Button variant="outline" onClick={() => setModal(false)} style={{ flex: 1, justifyContent: 'center' }}>Cancel</Button>
            <Button type="submit" variant="primary" style={{ flex: 2, justifyContent: 'center' }}>Create Passenger</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

