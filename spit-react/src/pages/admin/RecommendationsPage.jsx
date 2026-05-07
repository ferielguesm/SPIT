import { useState, useMemo } from 'react';
import { toast } from 'react-hot-toast';
import { useApi } from '../../hooks/useApi';
import { PassengerAPI } from '../../api';
import Topbar from '../../components/layout/Topbar';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

const DEST_EMOJI = {
  'Tozeur':'🏜️','Douz':'🐪','Carthage':'🏛️','Kairouan':'🕌','Dougga':'🏺',
  'Hammamet':'🏖️','Djerba':'🌊','Monastir':'⛵','Tunis':'🏙️','Sfax':'🍴',
  'Tabarka':'🤿','Ain Draham':'🌲','Gammarth':'💎','Sidi Bou Said':'🎨',
  'La Marsa':'☕','Nabeul':'🏺','Tunis Medina':'🍽️',
};

export default function RecommendationsPage() {
  const { data: passengers, loading, refetch } = useApi(PassengerAPI.getAll);

  const [search,       setSearch]       = useState('');
  const [destFilter,   setDestFilter]   = useState('');
  const [budgetFilter, setBudgetFilter] = useState('');
  const [purposeFilter,setPurposeFilter]= useState('');
  const [passengerFilter, setPassengerFilter] = useState('');
  const [sortBy,       setSortBy]       = useState('newest');
  const [generating,   setGenerating]   = useState(false);

  // Flatten all recommendations with their passenger context
  const allRecs = useMemo(() =>
    (Array.isArray(passengers) ? passengers : []).flatMap(p =>
      (p.recommendations || []).map(r => ({ ...r, passenger: p }))
    ), [passengers]);

  // Derive unique filter options from real data
  const allDestinations = useMemo(() =>
    [...new Set(allRecs.map(r => r.destination).filter(Boolean))].sort(), [allRecs]);
  const allBudgets = useMemo(() =>
    [...new Set((Array.isArray(passengers) ? passengers : []).map(p => p.travel?.budget).filter(Boolean))].sort(), [passengers]);
  const allPurposes = useMemo(() =>
    [...new Set((Array.isArray(passengers) ? passengers : []).map(p => p.travel?.purpose).filter(Boolean))].sort(), [passengers]);
  const passengerList = useMemo(() =>
    (Array.isArray(passengers) ? passengers : []).map(p => ({
      id: p.id,
      name: `${p.firstName || ''} ${p.lastName || ''}`.trim() || `#SP-${String(p.id).padStart(5,'0')}`,
    })), [passengers]);

  // Apply all filters + sort
  const filtered = useMemo(() => {
    let r = allRecs;
    if (search)          r = r.filter(x => x.destination?.toLowerCase().includes(search.toLowerCase()) || x.activity?.toLowerCase().includes(search.toLowerCase()) || x.passenger?.nationality?.toLowerCase().includes(search.toLowerCase()));
    if (destFilter)      r = r.filter(x => x.destination === destFilter);
    if (budgetFilter)    r = r.filter(x => x.passenger?.travel?.budget === budgetFilter);
    if (purposeFilter)   r = r.filter(x => x.passenger?.travel?.purpose === purposeFilter);
    if (passengerFilter) r = r.filter(x => String(x.passenger?.id) === passengerFilter);
    if (sortBy === 'newest') r = [...r].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    if (sortBy === 'oldest') r = [...r].sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
    if (sortBy === 'dest')   r = [...r].sort((a, b) => (a.destination || '').localeCompare(b.destination || ''));
    return r;
  }, [allRecs, search, destFilter, budgetFilter, purposeFilter, passengerFilter, sortBy]);

  const hasFilters = search || destFilter || budgetFilter || purposeFilter || passengerFilter;
  const clearFilters = () => { setSearch(''); setDestFilter(''); setBudgetFilter(''); setPurposeFilter(''); setPassengerFilter(''); setSortBy('newest'); };

  const generateFor = async (passengerId) => {
    toast.loading('Generating…', { id: 'rg' + passengerId });
    try {
      await PassengerAPI.recommend(passengerId);
      toast.success('Done!', { id: 'rg' + passengerId });
      refetch();
    } catch (e) { toast.error(e.message, { id: 'rg' + passengerId }); }
  };

  const generateAll = async () => {
    if (!Array.isArray(passengers) || passengers.length === 0) { toast.error('No passengers'); return; }
    setGenerating(true);
    toast.loading('Refreshing all…', { id: 'genall' });
    try {
      await Promise.all(passengers.map(p => PassengerAPI.recommend(p.id)));
      toast.success('All refreshed!', { id: 'genall' });
      refetch();
    } catch (e) { toast.error(e.message, { id: 'genall' }); }
    finally { setGenerating(false); }
  };

  const sel = {
    background: 'var(--input-bg)', border: '1.5px solid var(--input-border)',
    borderRadius: '10px', padding: '8px 12px', fontSize: '13px',
    color: 'var(--text)', outline: 'none', cursor: 'pointer',
  };

  const BUDGET_COLOR = { economy: '#10b981', standard: '#F59E0B', premium: '#a78bfa' };

  return (
    <div>
      <Topbar title="Recommendations" />
      <div style={{ padding: '32px' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h2 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text)' }}>Recommendations</h2>
            <p style={{ color: 'var(--muted)', marginTop: '4px', fontSize: '14px' }}>
              {allRecs.length} total · {filtered.length} shown · {Array.isArray(passengers) ? passengers.length : 0} passengers
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <Button variant="outline" icon="refresh" onClick={generateAll} disabled={generating}>
              {generating ? 'Refreshing…' : 'Refresh All'}
            </Button>
          </div>
        </div>

        {/* KPI row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '16px', marginBottom: '24px' }}>
          {[
            { label: 'Total Recommendations', value: allRecs.length,                                                                                                                  icon: 'recommend',   color: '#4A919E' },
            { label: 'Unique Destinations',   value: new Set(allRecs.map(r => r.destination)).size,                                                                                   icon: 'location_on', color: '#10b981' },
            { label: 'Passengers Covered',    value: new Set(allRecs.map(r => r.passenger?.id)).size,                                                                                 icon: 'groups',      color: '#a78bfa' },
            { label: 'Avg per Passenger',     value: Array.isArray(passengers) && passengers.length > 0 ? (allRecs.length / passengers.length).toFixed(1) : '0',                     icon: 'analytics',   color: '#F59E0B' },
          ].map(({ label, value, icon, color }) => (
            <Card key={label} style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ width: 40, height: 40, borderRadius: '10px', background: color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span className="material-symbols-outlined" style={{ color, fontSize: '20px' }}>{icon}</span>
              </div>
              <div>
                <div style={{ fontSize: '22px', fontWeight: 900, color: 'var(--text)', fontFamily: 'Manrope, sans-serif' }}>{value}</div>
                <div style={{ fontSize: '10px', color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</div>
              </div>
            </Card>
          ))}
        </div>

        {/* Smart filter bar */}
        <Card style={{ padding: '16px 20px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>

            {/* Free-text search */}
            <div style={{ position: 'relative', flex: '1 1 200px', minWidth: 180 }}>
              <span className="material-symbols-outlined" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 16, color: 'var(--muted)', pointerEvents: 'none' }}>search</span>
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search destination, activity, nationality…"
                style={{ ...sel, paddingLeft: 34, width: '100%', boxSizing: 'border-box' }} />
            </div>

            {/* Destination */}
            <select value={destFilter} onChange={e => setDestFilter(e.target.value)} style={sel}>
              <option value="">All Destinations</option>
              {allDestinations.map(d => <option key={d} value={d}>{DEST_EMOJI[d] || '📍'} {d}</option>)}
            </select>

            {/* Budget */}
            <select value={budgetFilter} onChange={e => setBudgetFilter(e.target.value)} style={sel}>
              <option value="">All Budgets</option>
              {allBudgets.map(b => <option key={b} value={b}>{b.charAt(0).toUpperCase() + b.slice(1)}</option>)}
            </select>

            {/* Purpose */}
            <select value={purposeFilter} onChange={e => setPurposeFilter(e.target.value)} style={sel}>
              <option value="">All Purposes</option>
              {allPurposes.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
            </select>

            {/* Passenger */}
            <select value={passengerFilter} onChange={e => setPassengerFilter(e.target.value)} style={{ ...sel, maxWidth: 200 }}>
              <option value="">All Passengers</option>
              {passengerList.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>

            {/* Sort */}
            <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={sel}>
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="dest">Destination A–Z</option>
            </select>

            {hasFilters && (
              <button onClick={clearFilters}
                style={{ padding: '8px 14px', borderRadius: 10, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap' }}>
                <span className="material-symbols-outlined" style={{ fontSize: 14 }}>close</span> Clear filters
              </button>
            )}
          </div>

          {/* Active filter chips */}
          {hasFilters && (
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 10, alignItems: 'center' }}>
              {search        && <span style={{ padding: '3px 10px', borderRadius: 999, background: 'rgba(36,70,212,0.1)',   color: 'var(--primary)', fontSize: 11, fontWeight: 700 }}>"{search}"</span>}
              {destFilter    && <span style={{ padding: '3px 10px', borderRadius: 999, background: 'rgba(16,185,129,0.1)',  color: '#10b981',        fontSize: 11, fontWeight: 700 }}>{DEST_EMOJI[destFilter] || '📍'} {destFilter}</span>}
              {budgetFilter  && <span style={{ padding: '3px 10px', borderRadius: 999, background: 'rgba(245,158,11,0.1)', color: '#F59E0B',         fontSize: 11, fontWeight: 700 }}>{budgetFilter}</span>}
              {purposeFilter && <span style={{ padding: '3px 10px', borderRadius: 999, background: 'rgba(167,139,250,0.1)',color: '#a78bfa',         fontSize: 11, fontWeight: 700 }}>{purposeFilter}</span>}
              {passengerFilter && <span style={{ padding: '3px 10px', borderRadius: 999, background: 'rgba(74,145,158,0.1)', color: '#4A919E',       fontSize: 11, fontWeight: 700 }}>Passenger #{passengerFilter}</span>}
              <span style={{ fontSize: 11, color: 'var(--muted)' }}>{filtered.length} result{filtered.length !== 1 ? 's' : ''}</span>
            </div>
          )}
        </Card>

        {/* Results list */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: 'var(--muted)' }}>Loading…</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', color: 'var(--muted)' }}>
            <span className="material-symbols-outlined" style={{ fontSize: 48, display: 'block', marginBottom: 12, color: 'var(--border)' }}>search_off</span>
            {hasFilters ? 'No recommendations match your filters.' : 'No recommendations yet. Add passengers first.'}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {filtered.map((r, i) => {
              const p = r.passenger || {};
              const budget = p.travel?.budget || '';
              const budgetColor = BUDGET_COLOR[budget] || 'var(--muted)';
              return (
                <Card key={i} style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap', transition: 'border-color 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(74,145,158,0.3)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>

                  {/* Emoji */}
                  <div style={{ width: 52, height: 52, borderRadius: '12px', background: 'var(--surface2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', flexShrink: 0 }}>
                    {DEST_EMOJI[r.destination] || '📍'}
                  </div>

                  {/* Destination + activity */}
                  <div style={{ flex: 1, minWidth: 160 }}>
                    <div style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text)', marginBottom: 3 }}>{r.destination}</div>
                    <div style={{ fontSize: '12px', color: 'var(--muted)', fontStyle: 'italic' }}>"{r.activity}"</div>
                  </div>

                  {/* Passenger */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 160 }}>
                    <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
                      {(p.firstName || p.nationality || '?')[0].toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)' }}>{p.firstName || ''} {p.lastName || ''}</div>
                      <div style={{ fontSize: 10, color: 'var(--muted)' }}>{p.nationality} · #SP-{String(p.id || 0).padStart(5,'0')}</div>
                    </div>
                  </div>

                  {/* Tags + refresh */}
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'flex-end', alignItems: 'center' }}>
                    {p.travel?.purpose && (
                      <span style={{ padding: '3px 10px', borderRadius: 999, fontSize: 10, fontWeight: 700, background: 'rgba(36,70,212,0.1)', color: 'var(--primary)', textTransform: 'uppercase' }}>
                        {p.travel.purpose}
                      </span>
                    )}
                    {budget && (
                      <span style={{ padding: '3px 10px', borderRadius: 999, fontSize: 10, fontWeight: 700, background: budgetColor + '18', color: budgetColor, textTransform: 'uppercase' }}>
                        {budget}
                      </span>
                    )}
                    <button onClick={() => generateFor(p.id)}
                      style={{ padding: '4px 10px', borderRadius: 999, fontSize: 10, fontWeight: 700, background: 'var(--surface2)', color: 'var(--muted)', border: '1px solid var(--border)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 3, transition: 'all 0.15s' }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(74,145,158,0.1)'; e.currentTarget.style.color = '#4A919E'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'var(--surface2)'; e.currentTarget.style.color = 'var(--muted)'; }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 12 }}>refresh</span> Refresh
                    </button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
