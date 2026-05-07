import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useApi } from '../../hooks/useApi';
import { PassengerAPI, UserAPI } from '../../api';
import Topbar from '../../components/layout/Topbar';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Input, { Select } from '../../components/ui/Input';

const ROLE_TEMPLATES = [
  {
    id: 1, name: 'Super Admin', level: 'System Level', desc: 'Full architectural access and user governance.',
    icon: 'stars', iconColor: '#4A919E', barColor: '#212E53',
    perms: { passengerRead: true, passengerWrite: true, analyticsRead: true, analyticsWrite: true },
  },
  {
    id: 2, name: 'Passenger Intelligence Officer', level: 'Operational', desc: 'Manages passenger profiles, travel data and recommendation engine.',
    icon: 'manage_accounts', iconColor: '#10b981', barColor: '#10b981', highlight: true,
    perms: { passengerRead: true, passengerWrite: true, analyticsRead: true, analyticsWrite: false },
  },
  {
    id: 3, name: 'Airport Staff', level: 'Terminal Role', desc: 'Ground operations and check-in assistance.',
    icon: 'local_airport', iconColor: '#94a3b8', barColor: 'rgba(33,46,83,0.4)',
    perms: { passengerRead: true, passengerWrite: true, analyticsRead: false, analyticsWrite: false },
  },
];

function TogglePill({ on }) {
  return (
    <div style={{ width: 40, height: 22, borderRadius: '999px', background: on ? '#4A919E' : 'var(--border)', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}>
      <div style={{ position: 'absolute', top: 3, left: on ? 21 : 3, width: 16, height: 16, background: 'white', borderRadius: '50%', transition: 'left 0.2s' }} />
    </div>
  );
}

export default function RolesPage() {
  const [roles, setRoles] = useState(ROLE_TEMPLATES);
  const [modal, setModal] = useState(false);
  const [form, setForm]   = useState({ name: '', desc: '', level: 'Operational' });

  // Real data from backend
  const { data: passengers } = useApi(PassengerAPI.getAll);
  const { data: users }      = useApi(UserAPI.getAll);

  const totalPassengers = Array.isArray(passengers) ? passengers.length : 0;
  const totalUsers      = Array.isArray(users) ? users.length : 0;
  const adminCount      = Array.isArray(users) ? users.filter(u => u.role === 'admin').length : 0;
  const viewerCount     = Array.isArray(users) ? users.filter(u => u.role === 'viewer' || u.role === 'editor').length : 0;

  // Real nationality breakdown for the PIO card
  const topNationalities = Array.isArray(passengers)
    ? Object.entries(
        passengers.reduce((acc, p) => { acc[p.nationality] = (acc[p.nationality] || 0) + 1; return acc; }, {})
      ).sort((a, b) => b[1] - a[1]).slice(0, 3)
    : [];

  const createRole = () => {
    if (!form.name.trim()) { toast.error('Role name required'); return; }
    setRoles(r => [...r, {
      id: Date.now(), name: form.name, level: form.level, desc: form.desc || 'Custom role',
      icon: 'manage_accounts', iconColor: '#4A919E', barColor: '#4A919E',
      perms: { passengerRead: false, passengerWrite: false, analyticsRead: false, analyticsWrite: false },
    }]);
    toast.success('Role created');
    setModal(false);
    setForm({ name: '', desc: '', level: 'Operational' });
  };

  // Real stats per role
  const roleStats = {
    1: { count: adminCount,   label: 'admin users',      metric: totalPassengers + ' profiles managed' },
    2: { count: totalPassengers, label: 'passengers',    metric: totalPassengers + ' profiles in DB' },
    3: { count: viewerCount,  label: 'staff accounts',   metric: 'Terminal access only' },
  };

  return (
    <div>
      <Topbar title="Roles & Permissions" />
      <div style={{ padding: '32px' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h2 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text)' }}>Access Governance</h2>
            <p style={{ color: 'var(--muted)', marginTop: '4px', fontSize: '14px', maxWidth: '520px' }}>
              Define and manage granular access controls. Changes apply instantly to all associated user profiles.
            </p>
          </div>
          <Button icon="add" onClick={() => setModal(true)}>Create New Role</Button>
        </div>

        {/* Role cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '20px', marginBottom: '24px' }}>
          {roles.map(r => {
            const stats = roleStats[r.id] || { count: '—', label: 'members', metric: '' };
            return (
              <Card key={r.id} style={{ padding: '28px', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: r.highlight ? '0 0 0 2px rgba(16,185,129,0.25)' : undefined }}>
                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: 4, background: r.barColor }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <div>
                    <span style={{ display: 'inline-flex', padding: '3px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', background: 'var(--surface2)', color: 'var(--muted)', marginBottom: '8px' }}>{r.level}</span>
                    <h3 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--text)', fontFamily: 'Manrope, sans-serif' }}>{r.name}</h3>
                    <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>{r.desc}</p>
                  </div>
                  <span className="material-symbols-outlined" style={{ color: r.iconColor, fontSize: '28px' }}>{r.icon}</span>
                </div>

                {/* Real stat badge */}
                <div style={{ background: 'var(--surface2)', borderRadius: 10, padding: '10px 14px', marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid var(--border)' }}>
                  <div>
                    <div style={{ fontSize: 22, fontWeight: 900, color: 'var(--text)', fontFamily: 'Manrope, sans-serif' }}>{stats.count}</div>
                    <div style={{ fontSize: 10, color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{stats.label}</div>
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--muted)', textAlign: 'right', maxWidth: 120 }}>{stats.metric}</div>
                </div>

                <div style={{ flex: 1 }}>
                  {[
                    { label: 'Passenger Data', read: r.perms.passengerRead, write: r.perms.passengerWrite },
                    { label: 'Analytics Engines', read: r.perms.analyticsRead, write: r.perms.analyticsWrite },
                  ].map(({ label, read, write }) => (
                    <div key={label} style={{ marginBottom: '12px' }}>
                      <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '6px' }}>{label}</div>
                      {[{ name: 'Read Access', on: read }, { name: 'Write Access', on: write }].map(({ name, on }) => (
                        <div key={name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'var(--surface2)', borderRadius: '10px', marginBottom: '4px', opacity: on ? 1 : 0.45 }}>
                          <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text)' }}>{name}</span>
                          <TogglePill on={on} />
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 'auto', paddingTop: '14px', borderTop: '1px solid var(--border)', display: 'flex', gap: '8px' }}>
                  <button style={{ flex: 1, background: 'none', border: 'none', cursor: 'pointer', fontSize: '11px', fontWeight: 700, color: 'var(--text)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', padding: '8px', borderRadius: '8px', transition: 'all 0.2s' }}
                    onMouseEnter={e => { e.currentTarget.style.color = '#4A919E'; e.currentTarget.style.background = 'var(--surface2)'; }}
                    onMouseLeave={e => { e.currentTarget.style.color = 'var(--text)'; e.currentTarget.style.background = 'none'; }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>edit_note</span> MANAGE
                  </button>
                  <button style={{ flex: 1, background: 'none', border: 'none', cursor: 'pointer', fontSize: '11px', fontWeight: 700, color: 'var(--text)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', padding: '8px', borderRadius: '8px', transition: 'all 0.2s' }}
                    onMouseEnter={e => { e.currentTarget.style.color = '#4A919E'; e.currentTarget.style.background = 'var(--surface2)'; }}
                    onMouseLeave={e => { e.currentTarget.style.color = 'var(--text)'; e.currentTarget.style.background = 'none'; }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>content_copy</span> CLONE
                  </button>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Live system stats banner */}
        <div style={{ background: '#212E53', borderRadius: '20px', padding: '32px 36px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '32px', flexWrap: 'wrap', position: 'relative', overflow: 'hidden', marginBottom: '24px' }}>
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 2px 2px, #4A919E 1px, transparent 0)', backgroundSize: '24px 24px', opacity: 0.08, pointerEvents: 'none' }} />
          <div style={{ position: 'relative', zIndex: 1, flex: 1, minWidth: '280px' }}>
            <h3 style={{ fontSize: '20px', fontWeight: 800, color: 'white', fontFamily: 'Manrope, sans-serif', marginBottom: '8px' }}>Live System Overview</h3>
            <p style={{ color: 'rgba(219,225,255,0.7)', fontSize: '13px', lineHeight: 1.7, maxWidth: '480px', marginBottom: '20px' }}>
              Real-time data from the SPIT database. All role assignments and permissions are enforced at the API level.
            </p>
            <div style={{ display: 'flex', gap: '28px', alignItems: 'center', flexWrap: 'wrap' }}>
              {[
                { val: roles.length,      label: 'Active Roles' },
                { val: totalUsers,        label: 'Admin Users' },
                { val: totalPassengers,   label: 'Passengers' },
                { val: adminCount,        label: 'Super Admins' },
              ].map(({ val, label }) => (
                <div key={label}>
                  <div style={{ fontSize: '28px', fontWeight: 900, color: '#4A919E', fontFamily: 'Manrope, sans-serif' }}>{val}</div>
                  <div style={{ fontSize: '10px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.15em', marginTop: 2 }}>{label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Top nationalities from real DB */}
          <div style={{ position: 'relative', zIndex: 1, background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '20px 24px', minWidth: 200 }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 12 }}>Top Nationalities</div>
            {topNationalities.length > 0 ? topNationalities.map(([nat, count]) => (
              <div key={nat} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, gap: 16 }}>
                <span style={{ fontSize: 13, color: 'white', fontWeight: 600 }}>{nat}</span>
                <span style={{ fontSize: 12, color: '#4A919E', fontWeight: 800 }}>{count} passengers</span>
              </div>
            )) : (
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>No passenger data yet</div>
            )}
          </div>
        </div>

        {/* Users table from real DB */}
        <Card style={{ padding: '28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h3 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--text)', fontFamily: 'Manrope, sans-serif' }}>Admin Users — Live from Database</h3>
              <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: 4 }}>{totalUsers} users registered in the system</p>
            </div>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--surface2)' }}>
                {['User', 'Email', 'Role', 'Registered'].map(h => (
                  <th key={h} style={{ padding: '10px 16px', fontSize: '10px', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.1em', textAlign: 'left' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.isArray(users) && users.length > 0 ? users.map(u => (
                <tr key={u.id} style={{ borderTop: '1px solid var(--border)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--surface2)'}
                  onMouseLeave={e => e.currentTarget.style.background = ''}>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 12, fontWeight: 700 }}>
                        {(u.fullName || u.email || '?')[0].toUpperCase()}
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{u.fullName || '—'}</span>
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: 12, color: 'var(--muted)' }}>{u.email}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ padding: '3px 10px', borderRadius: 6, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', background: u.role === 'admin' ? 'rgba(36,70,212,0.1)' : 'var(--surface2)', color: u.role === 'admin' ? 'var(--primary)' : 'var(--muted)' }}>
                      {u.role || 'viewer'}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: 12, color: 'var(--muted)' }}>
                    {u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                  </td>
                </tr>
              )) : (
                <tr><td colSpan={4} style={{ padding: '32px', textAlign: 'center', color: 'var(--muted)' }}>No users found</td></tr>
              )}
            </tbody>
          </table>
        </Card>
      </div>

      {/* Create Role Modal */}
      <Modal open={modal} onClose={() => setModal(false)} title="Create New Role">
        <Input label="Role Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Security Auditor" />
        <Input label="Description" value={form.desc} onChange={e => setForm(f => ({ ...f, desc: e.target.value }))} placeholder="Brief description" />
        <Select label="Level" value={form.level} onChange={e => setForm(f => ({ ...f, level: e.target.value }))}>
          <option value="System Level">System Level</option>
          <option value="Operational">Operational</option>
          <option value="Terminal Role">Terminal Role</option>
        </Select>
        <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
          <Button variant="outline" style={{ flex: 1 }} onClick={() => setModal(false)}>Cancel</Button>
          <Button style={{ flex: 2 }} onClick={createRole}>Create Role</Button>
        </div>
      </Modal>
    </div>
  );
}
