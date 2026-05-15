import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import Topbar from '../../components/layout/Topbar';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

function Toggle({ checked, onChange }) {
  return (
    <div onClick={onChange} style={{ width: 44, height: 24, borderRadius: '999px', background: checked ? '#166874' : 'var(--border)', position: 'relative', cursor: 'pointer', transition: 'background 0.2s', flexShrink: 0 }}>
      <div style={{ position: 'absolute', top: 3, left: checked ? 23 : 3, width: 18, height: 18, background: 'white', borderRadius: '50%', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,.2)' }} />
    </div>
  );
}

function ToggleRow({ label, sub, checked, onChange }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: '1px solid var(--border)' }}>
      <div>
        <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>{label}</div>
        {sub && <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '2px' }}>{sub}</div>}
      </div>
      <Toggle checked={checked} onChange={onChange} />
    </div>
  );
}

const SECTIONS = ['General','API & Backend','Notifications','Security','About'];

export default function SettingsPage() {
  const { user } = useAuth();
  const { toggle: toggleTheme, isDark } = useTheme();
  const [active, setActive] = useState('General');
  const [apiUrl, setApiUrl] = useState(import.meta.env.VITE_API_URL || 'http://localhost:8084/api');
  const [connStatus, setConnStatus] = useState('');
  const [toggles, setToggles] = useState({
    autoRecs: true, liveRefresh: true, sessionTimeout: true,
    auditLog: false, notifNew: true, notifRec: true, notifError: true,
  });
  const tog = k => setToggles(t => ({ ...t, [k]: !t[k] }));

  const testConnection = async () => {
    setConnStatus('Testing…');
    try {
      const r = await fetch(apiUrl + '/passengers');
      setConnStatus(r.ok ? '✓ Connected successfully' : `✗ Server responded with ${r.status}`);
    } catch { setConnStatus('✗ Could not reach backend'); }
  };

  return (
    <div>
      <Topbar title="Settings" />
      <div style={{ padding: '32px' }}>
        <div style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text)' }}>System Configuration</h2>
          <p style={{ color: 'var(--muted)', marginTop: '4px', fontSize: '14px' }}>Manage SPIT platform settings and integrations</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: '24px' }}>
          {/* Nav */}
          <Card style={{ padding: '12px', height: 'fit-content' }}>
            {SECTIONS.map(s => (
              <button key={s} onClick={() => setActive(s)}
                style={{ width: '100%', textAlign: 'left', padding: '10px 14px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: active === s ? 700 : 500, background: active === s ? 'var(--surface2)' : 'transparent', color: active === s ? 'var(--text)' : 'var(--muted)', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                  {s === 'General' ? 'tune' : s === 'API & Backend' ? 'api' : s === 'Notifications' ? 'notifications' : s === 'Security' ? 'security' : 'info'}
                </span>
                {s}
              </button>
            ))}
          </Card>

          {/* Panel */}
          <Card style={{ padding: '32px' }}>
            {active === 'General' && (
              <>
                <div style={{ marginBottom: '28px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text)', marginBottom: '4px' }}>System Preferences</h3>
                  <p style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '16px' }}>Configure general platform behavior</p>
                  <ToggleRow label="Dark Mode" sub="Switch to dark theme" checked={isDark} onChange={toggleTheme} />
                  <ToggleRow label="Auto-generate Recommendations" sub="Generate AI recommendations on passenger creation" checked={toggles.autoRecs} onChange={() => tog('autoRecs')} />
                  <ToggleRow label="Live Data Refresh" sub="Auto-refresh dashboard every 30 seconds" checked={toggles.liveRefresh} onChange={() => tog('liveRefresh')} />
                </div>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text)', marginBottom: '4px' }}>Display</h3>
                  <p style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '16px' }}>Customize how data is presented</p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--muted)', marginBottom: '7px' }}>Default Page Size</label>
                      <select style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', background: 'var(--input-bg)', border: '1.5px solid var(--input-border)', color: 'var(--text)', fontSize: '14px', outline: 'none' }}>
                        <option>10 rows</option><option>25 rows</option><option>50 rows</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--muted)', marginBottom: '7px' }}>Date Format</label>
                      <select style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', background: 'var(--input-bg)', border: '1.5px solid var(--input-border)', color: 'var(--text)', fontSize: '14px', outline: 'none' }}>
                        <option>DD/MM/YYYY</option><option>MM/DD/YYYY</option><option>YYYY-MM-DD</option>
                      </select>
                    </div>
                  </div>
                </div>
              </>
            )}

            {active === 'API & Backend' && (
              <>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text)', marginBottom: '4px' }}>Backend Connection</h3>
                <p style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '20px' }}>Configure the Spring Boot API endpoint</p>
                <div style={{ display: 'flex', gap: '10px', marginBottom: '8px' }}>
                  <input value={apiUrl} onChange={e => setApiUrl(e.target.value)}
                    style={{ flex: 1, padding: '10px 14px', borderRadius: '10px', background: 'var(--input-bg)', border: '1.5px solid var(--input-border)', color: 'var(--text)', fontSize: '14px', outline: 'none' }} />
                  <Button onClick={testConnection}>Test</Button>
                </div>
                {connStatus && <div style={{ fontSize: '13px', color: connStatus.startsWith('✓') ? '#166874' : '#ba1a1a', marginBottom: '20px' }}>{connStatus}</div>}
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text)', marginBottom: '12px', marginTop: '24px' }}>Database Info</h3>
                <div style={{ background: 'var(--surface2)', borderRadius: '12px', padding: '16px', fontFamily: 'monospace', fontSize: '13px', color: 'var(--text)', lineHeight: 2 }}>
                  <div><span style={{ color: 'var(--muted)' }}>Host:</span> Neon PostgreSQL (cloud)</div>
                  <div><span style={{ color: 'var(--muted)' }}>Database:</span> spit</div>
                  <div><span style={{ color: 'var(--muted)' }}>User:</span> 21694</div>
                  <div><span style={{ color: 'var(--muted)' }}>ORM:</span> Hibernate / Spring Data JPA</div>
                </div>
              </>
            )}

            {active === 'Notifications' && (
              <>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text)', marginBottom: '4px' }}>Alert Preferences</h3>
                <p style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '16px' }}>Choose which events trigger notifications</p>
                <ToggleRow label="New Passenger Registered" sub="Alert when a new passenger is added" checked={toggles.notifNew} onChange={() => tog('notifNew')} />
                <ToggleRow label="Recommendation Generated" sub="Alert when AI generates new recommendations" checked={toggles.notifRec} onChange={() => tog('notifRec')} />
                <ToggleRow label="System Errors" sub="Alert on backend connection failures" checked={toggles.notifError} onChange={() => tog('notifError')} />
              </>
            )}

            {active === 'Security' && (
              <>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text)', marginBottom: '4px' }}>Access Control</h3>
                <p style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '16px' }}>Manage authentication and session settings</p>
                <ToggleRow label="Session Timeout" sub="Auto-logout after 30 minutes of inactivity" checked={toggles.sessionTimeout} onChange={() => tog('sessionTimeout')} />
                <ToggleRow label="Audit Logging" sub="Log all admin actions to the database" checked={toggles.auditLog} onChange={() => tog('auditLog')} />
              </>
            )}

            {active === 'About' && (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                  <div style={{ width: 56, height: 56, borderRadius: '16px', background: '#4A919E', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '24px', fontWeight: 900, fontFamily: 'Manrope, sans-serif' }}>S</div>
                  <div>
                    <div style={{ fontSize: '22px', fontWeight: 900, color: 'var(--text)', fontFamily: 'Manrope, sans-serif' }}>SPIT</div>
                    <div style={{ fontSize: '13px', color: 'var(--muted)' }}>Smart Passenger Intelligence Tunisia</div>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  {[
                    { label: 'Version',   value: '1.0.0' },
                    { label: 'Frontend',  value: 'React 18 + Vite' },
                    { label: 'Backend',   value: 'Spring Boot 3.2' },
                    { label: 'Database',  value: 'PostgreSQL 16' },
                    { label: 'AI Engine', value: 'Rule-Based v2.4' },
                    { label: 'Logged in as', value: user?.fullName || 'Administrator' },
                  ].map(({ label, value }) => (
                    <div key={label} style={{ background: 'var(--surface2)', borderRadius: '12px', padding: '14px' }}>
                      <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>{label}</div>
                      <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text)' }}>{value}</div>
                    </div>
                  ))}
                </div>
              </>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '28px' }}>
              <Button icon="save" onClick={() => toast.success('Settings saved')}>Save Changes</Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
