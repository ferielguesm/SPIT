import { useState, useMemo } from 'react';
import { toast } from 'react-hot-toast';
import { useApi } from '../../hooks/useApi';
import { UserAPI, PassengerAPI } from '../../api';
import Topbar from '../../components/layout/Topbar';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Input, { Select } from '../../components/ui/Input';

const COLORS = ['#2446D4','#4A919E','#166874','#505d85','#833ab4','#10b981','#f59e0b'];

function timeAgo(iso) {
  if (!iso) return '—';
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  return hrs < 24 ? `${hrs}h ago` : `${Math.floor(hrs / 24)}d ago`;
}

const ROLE_STYLE = {
  admin:     { bg: 'rgba(36,70,212,0.12)',  color: '#2446D4' },
  editor:    { bg: 'rgba(74,145,158,0.12)', color: '#4A919E' },
  viewer:    { bg: 'var(--surface2)',        color: 'var(--muted)' },
  passenger: { bg: 'rgba(16,185,129,0.12)', color: '#10b981' },
};

function RoleBadge({ role }) {
  const s = ROLE_STYLE[role?.toLowerCase()] || ROLE_STYLE.viewer;
  return (
    <span style={{ display: 'inline-flex', padding: '3px 10px', borderRadius: '6px', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', background: s.bg, color: s.color }}>
      {role || 'viewer'}
    </span>
  );
}

export default function UsersPage() {
  const { data: adminUsers,  loading: loadingUsers,  refetch: refetchUsers }  = useApi(UserAPI.getAll);
  const { data: passengers,  loading: loadingPass,   refetch: refetchPass }   = useApi(PassengerAPI.getAll);

  const [modal,      setModal]      = useState(false);
  const [search,     setSearch]     = useState('');
  const [typeFilter, setTypeFilter] = useState('all'); // all | admin | passenger
  const [roleFilter, setRoleFilter] = useState('');
  const [form,       setForm]       = useState({ fname: '', lname: '', email: '', role: 'viewer' });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  // Merge admin users + passengers into one unified list
  const allUsers = useMemo(() => {
    const admins = (Array.isArray(adminUsers) ? adminUsers : []).map(u => ({
      id:        u.id,
      name:      u.fullName || '—',
      email:     u.email,
      role:      u.role || 'viewer',
      type:      'admin',
      createdAt: u.createdAt,
      _raw:      u,
    }));
    const pax = (Array.isArray(passengers) ? passengers : []).map(p => ({
      id:        p.id,
      name:      `${p.firstName || ''} ${p.lastName || ''}`.trim() || p.nationality || '—',
      email:     p.email || '—',
      role:      'passenger',
      type:      'passenger',
      nationality: p.nationality,
      destination: p.travel?.destination,
      budget:    p.travel?.budget,
      createdAt: p.createdAt,
      _raw:      p,
    }));
    return [...admins, ...pax];
  }, [adminUsers, passengers]);

  const filtered = useMemo(() => allUsers.filter(u => {
    if (typeFilter === 'admin'     && u.type !== 'admin')     return false;
    if (typeFilter === 'passenger' && u.type !== 'passenger') return false;
    if (roleFilter && u.role !== roleFilter)                  return false;
    if (search) {
      const q = search.toLowerCase();
      if (!u.name.toLowerCase().includes(q) && !u.email.toLowerCase().includes(q)) return false;
    }
    return true;
  }), [allUsers, typeFilter, roleFilter, search]);

  const adminCount     = (Array.isArray(adminUsers) ? adminUsers : []).length;
  const passengerCount = (Array.isArray(passengers) ? passengers : []).length;
  const loading        = loadingUsers || loadingPass;

  const submit = async (e) => {
    e.preventDefault();
    try {
      await UserAPI.create({ fullName: `${form.fname} ${form.lname}`.trim(), email: form.email, password: 'changeme123', role: form.role });
      toast.success('User created!');
      setModal(false);
      refetchUsers();
    } catch (err) { toast.error(err.message); }
  };

  const deleteEntry = async (u) => {
    if (!confirm(`Delete ${u.name}?`)) return;
    try {
      if (u.type === 'admin')     { await UserAPI.delete(u.id);      refetchUsers(); }
      else                        { await PassengerAPI.delete(u.id); refetchPass();  }
      toast.success('Deleted');
    } catch (err) { toast.error(err.message); }
  };

  const editRole = async (u) => {
    if (u.type !== 'admin') { toast('Passengers don\'t have admin roles'); return; }
    const newRole = prompt(`Change role for ${u.name}:`, u.role);
    if (!newRole) return;
    try { await UserAPI.update(u.id, { role: newRole.toLowerCase() }); toast.success('Role updated'); refetchUsers(); }
    catch (err) { toast.error(err.message); }
  };

  const inp = { background: 'var(--input-bg)', border: '1.5px solid var(--input-border)', borderRadius: '10px', padding: '8px 14px', fontSize: '13px', color: 'var(--text)', outline: 'none' };

  return (
    <div>
      <Topbar title="User Management">
        <div style={{ marginLeft: '16px' }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or email…"
            style={{ ...inp, width: '260px' }} />
        </div>
      </Topbar>

      <div style={{ padding: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h2 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text)' }}>All Platform Users</h2>
            <p style={{ color: 'var(--muted)', marginTop: '4px', fontSize: '14px' }}>Admin accounts and registered passengers — all from the database.</p>
          </div>
          <Button variant="primary" icon="person_add" onClick={() => setModal(true)}>Add Admin User</Button>
        </div>

        {/* KPI cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '20px', marginBottom: '28px' }}>
          {[
            { label: 'Total Platform Users', value: allUsers.length,   icon: 'groups',          color: '#2446D4' },
            { label: 'Admin / Staff',         value: adminCount,        icon: 'admin_panel_settings', color: '#4A919E' },
            { label: 'Passengers',            value: passengerCount,    icon: 'flight_takeoff',  color: '#10b981' },
            { label: 'Roles Defined',         value: [...new Set(allUsers.map(u => u.role))].length, icon: 'badge', color: '#f59e0b' },
          ].map(({ label, value, icon, color }) => (
            <Card key={label} style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ width: 40, height: 40, borderRadius: '10px', background: color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span className="material-symbols-outlined" style={{ color, fontSize: '20px' }}>{icon}</span>
              </div>
              <div>
                <div style={{ fontSize: '26px', fontWeight: 900, color: 'var(--text)', fontFamily: 'Manrope, sans-serif' }}>{value}</div>
                <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</div>
              </div>
            </Card>
          ))}
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
          {/* Type toggle */}
          <div style={{ display: 'flex', background: 'var(--surface2)', borderRadius: '10px', padding: '4px', gap: '2px' }}>
            {[['all','All'], ['admin','Admins'], ['passenger','Passengers']].map(([val, lbl]) => (
              <button key={val} onClick={() => setTypeFilter(val)}
                style={{ padding: '6px 14px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: 700, transition: 'all 0.15s', background: typeFilter === val ? 'var(--surface)' : 'transparent', color: typeFilter === val ? 'var(--text)' : 'var(--muted)', boxShadow: typeFilter === val ? '0 1px 3px rgba(0,0,0,.1)' : 'none' }}>
                {lbl}
              </button>
            ))}
          </div>

          {/* Role filter (admin only) */}
          {typeFilter !== 'passenger' && (
            <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} style={inp}>
              <option value="">All Roles</option>
              {['admin','editor','viewer'].map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase()+r.slice(1)}</option>)}
            </select>
          )}

          {(search || roleFilter) && (
            <button onClick={() => { setSearch(''); setRoleFilter(''); }}
              style={{ padding: '8px 14px', borderRadius: '10px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>
              Clear
            </button>
          )}

          <span style={{ marginLeft: 'auto', fontSize: '13px', color: 'var(--muted)', alignSelf: 'center' }}>
            {filtered.length} of {allUsers.length} users
          </span>
        </div>

        {/* Table */}
        <Card style={{ overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--surface2)' }}>
                  {['ID', 'User', 'Type', 'Role / Info', 'Registered', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '12px 20px', fontSize: '10px', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.1em', textAlign: h === 'Actions' ? 'right' : 'left', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} style={{ textAlign: 'center', padding: '48px', color: 'var(--muted)' }}>Loading…</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={6} style={{ textAlign: 'center', padding: '48px', color: 'var(--muted)' }}>No users found.</td></tr>
                ) : filtered.map((u, i) => {
                  const bg = COLORS[i % COLORS.length];
                  const initials = u.name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase() || '?';
                  return (
                    <tr key={u.type + u.id} style={{ borderTop: '1px solid var(--border)', transition: 'background 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--surface2)'}
                      onMouseLeave={e => e.currentTarget.style.background = ''}>

                      <td style={{ padding: '14px 20px', fontFamily: 'monospace', fontSize: '11px', color: 'var(--muted)', whiteSpace: 'nowrap' }}>
                        {u.type === 'admin' ? `#USR-${String(u.id).padStart(4,'0')}` : `#SP-${String(u.id).padStart(5,'0')}`}
                      </td>

                      <td style={{ padding: '14px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ width: 34, height: 34, borderRadius: '50%', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, color: 'white', flexShrink: 0 }}>{initials}</div>
                          <div>
                            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)' }}>{u.name}</div>
                            <div style={{ fontSize: '11px', color: 'var(--muted)' }}>{u.email}</div>
                          </div>
                        </div>
                      </td>

                      <td style={{ padding: '14px 20px' }}>
                        <span style={{ padding: '3px 10px', borderRadius: '6px', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', background: u.type === 'admin' ? 'rgba(36,70,212,0.1)' : 'rgba(16,185,129,0.1)', color: u.type === 'admin' ? '#2446D4' : '#10b981' }}>
                          {u.type === 'admin' ? 'Admin' : 'Passenger'}
                        </span>
                      </td>

                      <td style={{ padding: '14px 20px' }}>
                        {u.type === 'admin'
                          ? <RoleBadge role={u.role} />
                          : <div style={{ fontSize: '12px', color: 'var(--muted)' }}>
                              {u.nationality && <span style={{ marginRight: 6 }}>🌍 {u.nationality}</span>}
                              {u.destination && <span>📍 {u.destination}</span>}
                            </div>
                        }
                      </td>

                      <td style={{ padding: '14px 20px', fontSize: '12px', color: 'var(--muted)', whiteSpace: 'nowrap' }}>
                        {timeAgo(u.createdAt)}
                      </td>

                      <td style={{ padding: '14px 20px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                        {u.type === 'admin' && (
                          <button onClick={() => editRole(u)} title="Edit role"
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', padding: '4px', borderRadius: '6px' }}
                            onMouseEnter={e => { e.currentTarget.style.color = '#4A919E'; e.currentTarget.style.background = 'var(--surface2)'; }}
                            onMouseLeave={e => { e.currentTarget.style.color = 'var(--muted)'; e.currentTarget.style.background = 'none'; }}>
                            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>edit</span>
                          </button>
                        )}
                        <button onClick={() => deleteEntry(u)} title="Delete"
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', padding: '4px', borderRadius: '6px' }}
                          onMouseEnter={e => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; }}
                          onMouseLeave={e => { e.currentTarget.style.color = 'var(--muted)'; e.currentTarget.style.background = 'none'; }}>
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
      </div>

      {/* Add Admin User Modal */}
      <Modal open={modal} onClose={() => setModal(false)} title="Add Admin User">
        <form onSubmit={submit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Input label="First Name" value={form.fname} onChange={e => set('fname', e.target.value)} placeholder="Ahmed" required />
            <Input label="Last Name"  value={form.lname} onChange={e => set('lname', e.target.value)} placeholder="Ben Ali" required />
          </div>
          <Input label="Email" type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="user@spit.gov.tn" required />
          <Select label="Role" value={form.role} onChange={e => set('role', e.target.value)}>
            <option value="viewer">Viewer — read-only access</option>
            <option value="editor">Editor — can manage passengers</option>
            <option value="admin">Admin — full access</option>
          </Select>
          <p style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '16px' }}>
            Default password: <code style={{ background: 'var(--surface2)', padding: '2px 6px', borderRadius: '4px' }}>changeme123</code> — user should change on first login.
          </p>
          <div style={{ display: 'flex', gap: '12px' }}>
            <Button variant="outline" onClick={() => setModal(false)} style={{ flex: 1, justifyContent: 'center' }}>Cancel</Button>
            <Button type="submit" variant="primary" style={{ flex: 2, justifyContent: 'center' }}>Create User</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
