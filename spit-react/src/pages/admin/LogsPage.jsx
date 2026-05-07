import { useState } from 'react';
import Topbar from '../../components/layout/Topbar';
import Card from '../../components/ui/Card';

const LEVELS = { INFO: { bg: '#a7eefc', color: '#001f24' }, WARN: { bg: '#EBACA2', color: '#4a211b' }, ERROR: { bg: '#fca5a5', color: '#7f1d1d' }, DEBUG: { bg: '#e1e3e4', color: '#45464e' } };

const SAMPLE_LOGS = [
  { id: 1, level: 'INFO',  time: '2026-04-05 09:14:22', source: 'PassengerController', message: 'GET /api/passengers â€” 200 OK (12ms)' },
  { id: 2, level: 'INFO',  time: '2026-04-05 09:13:55', source: 'RecommendationEngine', message: 'Generated 5 recommendations for passenger #SP-00003' },
  { id: 3, level: 'WARN',  time: '2026-04-05 09:12:10', source: 'PostService',          message: 'Image upload skipped â€” no file provided' },
  { id: 4, level: 'INFO',  time: '2026-04-05 09:11:44', source: 'UserController',       message: 'POST /api/auth/login â€” admin@spit.gov.tn authenticated' },
  { id: 5, level: 'INFO',  time: '2026-04-05 09:10:30', source: 'PassengerService',     message: 'Passenger #SP-00007 created successfully' },
  { id: 6, level: 'ERROR', time: '2026-04-05 09:09:05', source: 'DataSource',           message: 'Connection pool warning: 80% capacity reached' },
  { id: 7, level: 'INFO',  time: '2026-04-05 09:08:50', source: 'PostController',       message: 'POST /api/posts â€” 201 Created (34ms)' },
  { id: 8, level: 'DEBUG', time: '2026-04-05 09:07:22', source: 'WebSocketConfig',      message: 'STOMP client connected from 192.168.1.42' },
  { id: 9, level: 'INFO',  time: '2026-04-05 09:06:11', source: 'PassengerController',  message: 'DELETE /api/passengers/2 â€” 200 OK' },
  { id: 10, level: 'WARN', time: '2026-04-05 09:05:00', source: 'RecommendationEngine', message: 'No preferences set for passenger #SP-00009 â€” using fallback' },
  { id: 11, level: 'INFO', time: '2026-04-05 09:04:33', source: 'DataInitializer',      message: 'Default admin already exists â€” skipping seed' },
  { id: 12, level: 'INFO', time: '2026-04-05 09:03:18', source: 'SpringApplication',    message: 'SPIT Backend started on port 8089 in 3.42s' },
];

export default function LogsPage() {
  const [levelFilter, setLevelFilter] = useState('');
  const [search, setSearch] = useState('');

  const filtered = SAMPLE_LOGS.filter(l => {
    if (levelFilter && l.level !== levelFilter) return false;
    if (search && !l.message.toLowerCase().includes(search.toLowerCase()) && !l.source.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div>
      <Topbar title="Activity Logs" />
      <div style={{ padding: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search logsâ€¦"
              style={{ background: 'var(--input-bg)', border: '1.5px solid var(--input-border)', borderRadius: '12px', padding: '8px 14px', fontSize: '13px', color: 'var(--text)', outline: 'none', width: '220px' }}
            />
            <select
              value={levelFilter}
              onChange={e => setLevelFilter(e.target.value)}
              style={{ background: 'var(--input-bg)', border: '1.5px solid var(--input-border)', borderRadius: '10px', padding: '8px 14px', fontSize: '13px', color: 'var(--text)', outline: 'none' }}
            >
              <option value="">All Levels</option>
              {['INFO', 'WARN', 'ERROR', 'DEBUG'].map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '16px', marginBottom: '28px' }}>
          {[
            { label: 'Total Events', value: SAMPLE_LOGS.length, icon: 'receipt_long', color: '#4A919E' },
            { label: 'Errors',       value: SAMPLE_LOGS.filter(l => l.level === 'ERROR').length, icon: 'error', color: '#ef4444' },
            { label: 'Warnings',     value: SAMPLE_LOGS.filter(l => l.level === 'WARN').length,  icon: 'warning', color: '#f59e0b' },
            { label: 'Info',         value: SAMPLE_LOGS.filter(l => l.level === 'INFO').length,  icon: 'info', color: '#166874' },
          ].map(({ label, value, icon, color }) => (
            <Card key={label} style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ width: 40, height: 40, borderRadius: '10px', background: color + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', color, flexShrink: 0 }}>
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>{icon}</span>
              </div>
              <div>
                <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{label}</div>
                <div style={{ fontSize: '24px', fontWeight: 900, color: 'var(--text)', fontFamily: 'Manrope, sans-serif' }}>{value}</div>
              </div>
            </Card>
          ))}
        </div>

        <Card style={{ overflow: 'hidden' }}>
          <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', color: 'var(--muted)', fontWeight: 500 }}>{filtered.length} entries</span>
            <span style={{ fontSize: '11px', color: 'var(--muted)' }}>Showing latest events</span>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--surface2)' }}>
                  {['Level', 'Timestamp', 'Source', 'Message'].map(h => (
                    <th key={h} style={{ padding: '12px 20px', fontSize: '10px', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.1em', textAlign: 'left' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(log => {
                  const ls = LEVELS[log.level] || LEVELS.DEBUG;
                  return (
                    <tr key={log.id} style={{ borderTop: '1px solid var(--border)' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--surface2)'}
                      onMouseLeave={e => e.currentTarget.style.background = ''}>
                      <td style={{ padding: '12px 20px' }}>
                        <span style={{ padding: '3px 10px', borderRadius: '6px', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', background: ls.bg, color: ls.color }}>
                          {log.level}
                        </span>
                      </td>
                      <td style={{ padding: '12px 20px', fontSize: '12px', color: 'var(--muted)', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>{log.time}</td>
                      <td style={{ padding: '12px 20px', fontSize: '12px', fontWeight: 600, color: '#4A919E', whiteSpace: 'nowrap' }}>{log.source}</td>
                      <td style={{ padding: '12px 20px', fontSize: '13px', color: 'var(--text)' }}>{log.message}</td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr><td colSpan={4} style={{ textAlign: 'center', padding: '48px', color: 'var(--muted)' }}>No logs match your filter.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}

