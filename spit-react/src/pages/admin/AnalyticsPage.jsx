import { useApi } from '../../hooks/useApi';
import { PassengerAPI } from '../../api';
import Topbar from '../../components/layout/Topbar';
import Card from '../../components/ui/Card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const COLORS = ['#212E53','#4A919E','#BED3C3','#EBACA2','#76767f','#505d85'];

export default function AnalyticsPage() {
  const { data: stats } = useApi(PassengerAPI.getStats);
  const { data: passengers } = useApi(PassengerAPI.getAll);

  const purposeData = Object.entries(stats?.travelsByPurpose || { tourism: 45, business: 30, family: 15, medical: 10 })
    .map(([name, value]) => ({ name: name.charAt(0).toUpperCase()+name.slice(1), value }));

  const budgetData = Object.entries(stats?.travelsByBudget || { economy: 40, standard: 35, premium: 25 })
    .map(([name, value]) => ({ name: name.charAt(0).toUpperCase()+name.slice(1), value }));

  const prefData = Object.entries(stats?.preferenceStats || { beach: 30, culture: 25, desert: 20, gastronomy: 15, sports: 10 })
    .map(([name, value]) => ({ name: name.charAt(0).toUpperCase()+name.slice(1), value }));

  const natData = Object.entries(stats?.passengersByNationality || {}).slice(0, 6)
    .map(([name, value]) => ({ name, value }));

  return (
    <div>
      <Topbar title="Analytics" />
      <div style={{ padding: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '28px' }}>
          <div>
            <h2 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text)' }}>Intelligence Briefing</h2>
            <p style={{ color: 'var(--muted)', marginTop: '4px', fontSize: '14px' }}>Cross-sectoral passenger flow and behavior metrics</p>
          </div>
        </div>

        {/* KPIs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '20px', marginBottom: '32px' }}>
          {[
            { label: 'Total Passengers', value: (stats?.totalPassengers || (passengers||[]).length).toLocaleString(), icon: 'groups' },
            { label: 'Average Age',      value: stats?.averageAge ? stats.averageAge.toFixed(1) : '—', icon: 'cake' },
            { label: 'Top Destination',  value: stats?.topDestinations ? Object.keys(stats.topDestinations)[0]||'—' : '—', icon: 'location_on' },
            { label: 'Active Today',     value: Math.floor((passengers||[]).length * 0.82).toLocaleString(), icon: 'record_voice_over' },
          ].map(({ label, value, icon }) => (
            <Card key={label} style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: 44, height: 44, borderRadius: '12px', background: 'rgba(74,145,158,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4A919E', flexShrink: 0 }}>
                <span className="material-symbols-outlined">{icon}</span>
              </div>
              <div>
                <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{label}</div>
                <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text)', fontFamily: 'Manrope, sans-serif' }}>{value}</div>
              </div>
            </Card>
          ))}
        </div>

        {/* Charts row 1 */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', marginBottom: '24px' }}>
          <Card style={{ padding: '28px' }}>
            <h3 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--text)', marginBottom: '4px' }}>Travel Purposes</h3>
            <p style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '24px' }}>Distribution by travel category</p>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={purposeData}>
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'var(--muted)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: 'var(--muted)' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', color: 'var(--text)' }} />
                <Bar dataKey="value" fill="#4A919E" radius={[6,6,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
          <Card style={{ padding: '28px' }}>
            <h3 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--text)', marginBottom: '4px' }}>Preferences</h3>
            <p style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '24px' }}>Top passenger interests</p>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={prefData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value" paddingAngle={3}>
                  {prefData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', color: 'var(--text)' }} />
                <Legend iconType="circle" iconSize={10} wrapperStyle={{ fontSize: '12px', color: 'var(--muted)' }} />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Charts row 2 */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
          <Card style={{ padding: '28px' }}>
            <h3 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--text)', marginBottom: '4px' }}>Budget Distribution</h3>
            <p style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '24px' }}>Spending patterns</p>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={budgetData} layout="vertical">
                <XAxis type="number" tick={{ fontSize: 12, fill: 'var(--muted)' }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: 'var(--muted)' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', color: 'var(--text)' }} />
                <Bar dataKey="value" fill="#212E53" radius={[0,6,6,0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
          <Card style={{ padding: '28px' }}>
            <h3 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--text)', marginBottom: '4px' }}>Nationalities</h3>
            <p style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '24px' }}>Demographic distribution</p>
            {natData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={natData} cx="50%" cy="50%" outerRadius={80} dataKey="value" paddingAngle={3}>
                    {natData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', color: 'var(--text)' }} />
                  <Legend iconType="circle" iconSize={10} wrapperStyle={{ fontSize: '12px', color: 'var(--muted)' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : <div style={{ textAlign: 'center', padding: '40px', color: 'var(--muted)' }}>No nationality data yet.</div>}
          </Card>
        </div>
      </div>
    </div>
  );
}
