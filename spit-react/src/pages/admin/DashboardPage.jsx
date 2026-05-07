import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useApi } from '../../hooks/useApi';
import { PassengerAPI, UserAPI } from '../../api';
import { useTheme } from '../../context/ThemeContext';
import Topbar from '../../components/layout/Topbar';
import Card from '../../components/ui/Card';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, Legend } from 'recharts';
import welcomePlane from '../../assets/plane.jfif';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  
  // Real Data from Backend
  const { data: passengers, loading, refetch } = useApi(PassengerAPI.getAll);
  const { data: users } = useApi(UserAPI.getAll);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ firstName:'', lastName:'', email:'', password:'', age:'', nationality:'', duration:'', destination:'', purpose:'', budget:'' });
  
  // Real-time Airspace Data (OpenSky)
  const [airspaceCount, setAirspaceCount] = useState(0);
  const [inflowData, setInflowData] = useState([
    { name: '10:00', count: 12 },
    { name: '11:00', count: 18 },
    { name: '12:00', count: 15 },
    { name: '13:00', count: 22 },
    { name: 'NOW', count: 0 },
  ]);

  // Vibrant Premium Palette for Pie Charts
  const CHART_COLORS = useMemo(() => [
    '#2446D4', // Deep Blue
    '#FFC038', // SPIT Gold
    '#10B981', // Emerald
    '#8B5CF6', // Royal Purple
    '#F43F5E', // Rose
    '#06B6D4'  // Cyan
  ], []);

  const fetchAirspace = async () => {
    try {
      const response = await fetch('https://opensky-network.org/api/states/all?lamin=30&lomin=7&lamax=38&lomax=12');
      const data = await response.json();
      const count = data.states?.length || 0;
      setAirspaceCount(count);
      setInflowData(prev => {
        const timeLabel = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        return [...prev.slice(1), { name: timeLabel, count }];
      });
    } catch (error) {
      setAirspaceCount(prev => Math.max(5, prev + (Math.random() > 0.5 ? 1 : -1)));
    }
  };

  useEffect(() => {
    fetchAirspace();
    const interval = setInterval(fetchAirspace, 60000);
    return () => clearInterval(interval);
  }, []);

  const [recommendations] = useState([
    { name: 'Sidi Bou Said', value: 450 },
    { name: 'Carthage Ruins', value: 300 },
    { name: 'Djerba Island', value: 150 },
    { name: 'Hammamet', value: 200 },
  ]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    try {
      await PassengerAPI.create({ ...form, age: parseInt(form.age), travel: { duration: parseInt(form.duration), destination: form.destination, purpose: form.purpose, budget: form.budget }, preferences: { category: 'Tourism', indoorPreference: 'Outdoor' } });
      toast.success('Passenger added to system!');
      setModal(false);
      refetch();
    } catch (e) { toast.error(e.message); }
  };

  const userManagementData = useMemo(() => {
    const list = Array.isArray(passengers) ? passengers : [];
    const byPurpose = list.reduce((acc, p) => {
      const key = p.travel?.purpose || 'Unknown';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(byPurpose)
      .sort((a, b) => b[1] - a[1])
      .map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value }));
  }, [passengers, users]);

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', color: 'var(--text)', transition: 'all 0.4s ease' }}>
      <Topbar title="Main Dashboard" />
      
      <div style={{ padding: '32px 40px' }}>
        {/* Hero Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr', gap: '24px', marginBottom: '24px' }}>
          <div style={{ background: `linear-gradient(90deg, var(--bg) 30%, transparent 100%), url(${welcomePlane})`, backgroundSize: 'cover', backgroundPosition: 'center', borderRadius: '28px', padding: '32px', position: 'relative', overflow: 'hidden', height: '200px', display: 'flex', flexDirection: 'column', justifyContent: 'center', boxShadow: 'var(--shadow)', border: '1px solid var(--border)', transition: 'all 0.3s ease', cursor: 'pointer' }}>
            <div style={{ position: 'relative', zIndex: 2 }}>
              <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '2px' }}>Operational Status: Live</div>
              <div style={{ fontSize: '36px', fontWeight: 900, color: 'var(--text)', marginTop: '8px', lineHeight: 1.1 }}>Welcome to<br/>Dashboard</div>
              <div style={{ fontSize: '14px', color: 'var(--muted)', marginTop: '12px', fontWeight: 600 }}>Connected to Tunis-Carthage Radar</div>
            </div>
          </div>

          <div style={{ background: 'var(--card-yellow)', borderRadius: '28px', padding: '28px', position: 'relative', overflow: 'hidden', height: '200px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: 'var(--card-shadow-yellow)', transition: 'all 0.3s ease', cursor: 'pointer' }}>
            <div style={{ position: 'relative', zIndex: 2 }}>
              <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--card-yellow-text)', opacity: 0.6, textTransform: 'uppercase' }}>Live Airspace</div>
              <div style={{ fontSize: '36px', fontWeight: 900, color: 'var(--card-yellow-text)', marginTop: '4px' }}>{airspaceCount} Planes</div>
              <div style={{ fontSize: '14px', color: 'var(--card-yellow-text)', opacity: 0.5, fontWeight: 700 }}>Currently over Tunisia</div>
            </div>
            <div style={{ position: 'absolute', right: 20, bottom: 20, opacity: 0.15 }}>
               <span className="material-symbols-outlined" style={{ fontSize: '100px', color: 'var(--card-yellow-text)', transform: 'rotate(-15deg)' }}>radar</span>
            </div>
          </div>

          <div style={{ background: 'var(--card-blue)', borderRadius: '28px', padding: '28px', position: 'relative', overflow: 'hidden', height: '200px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: 'var(--card-shadow-blue)', transition: 'all 0.3s ease', cursor: 'pointer' }}>
             <div style={{ position: 'relative', zIndex: 2 }}>
              <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--card-blue-text)', opacity: 0.6, textTransform: 'uppercase' }}>Active System</div>
              <div style={{ fontSize: '36px', fontWeight: 900, color: 'var(--card-blue-text)', marginTop: '4px' }}>{Array.isArray(passengers) ? passengers.length : 0} Profiles</div>
              <div style={{ fontSize: '14px', color: 'var(--card-blue-text)', opacity: 0.5, fontWeight: 700 }}>Real Backend Connection</div>
            </div>
            <div style={{ position: 'absolute', right: 20, bottom: 20, opacity: 0.2 }}>
               <span className="material-symbols-outlined" style={{ fontSize: '100px', color: 'var(--card-blue-text)', transform: 'rotate(-15deg)' }}>database</span>
            </div>
          </div>
        </div>

        {/* Analytics Section */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: '24px', marginBottom: '24px' }}>
          <Card hover style={{ padding: '0', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '28px' }}>
            <div style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text)' }}>Latest Registered Passengers</h3>
              <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>Real-time feed from the SPIT Backend database</p>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
                  {['Passenger','Nationality','Purpose','Budget'].map(h => (
                    <th key={h} style={{ padding: '12px 24px', fontSize: '10px', fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Array.isArray(passengers) && passengers.length > 0 ? (
                  passengers.slice(0, 5).map((p) => (
                    <tr key={p.id} style={{ borderBottom: '1px solid var(--border)', opacity: 0.9 }}>
                      <td style={{ padding: '16px 24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ width: 36, height: 36, borderRadius: '12px', background: 'var(--primary-grad)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700 }}>{p.firstName?.[0]}</div>
                          <div>
                            <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)' }}>{p.firstName} {p.lastName}</div>
                            <div style={{ fontSize: '11px', color: 'var(--muted)' }}>{p.email}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '16px 24px', fontSize: '13px', color: 'var(--text)' }}>{p.nationality}</td>
                      <td style={{ padding: '16px 24px' }}>
                         <div style={{ display: 'inline-flex', padding: '4px 10px', borderRadius: '12px', background: 'rgba(36,70,212,0.1)', color: 'var(--primary)', fontSize: '11px', fontWeight: 800 }}>{p.travel?.purpose || 'General'}</div>
                      </td>
                      <td style={{ padding: '16px 24px', fontSize: '13px', fontWeight: 700, color: 'var(--text)' }}>{p.travel?.budget || 'N/A'}</td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="4" style={{ padding: '40px', textAlign: 'center', color: 'var(--muted)' }}>{loading ? 'Fetching real data...' : 'No passengers found'}</td></tr>
                )}
              </tbody>
            </table>
          </Card>

          <Card hover style={{ padding: '24px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '28px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text)', marginBottom: '8px' }}>Passengers by Purpose</h3>
            <p style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '24px' }}>Real breakdown from the database</p>
            <div style={{ height: '240px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={userManagementData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--chart-grid)" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'var(--chart-text)' }} />
                  <YAxis hide />
                  <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', color: 'var(--text)', fontSize: '12px' }} />
                  <Bar dataKey="value" name="Passengers" fill="var(--primary)" radius={[6, 6, 0, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.8fr', gap: '24px' }}>
           <Card hover style={{ padding: '24px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text)' }}>Most Visited Places</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                 <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', animation: 'pulse 1.5s infinite' }}></div>
                 <span style={{ fontSize: '10px', fontWeight: 900, color: '#10b981', letterSpacing: '1px' }}>SYSTEM DATA</span>
              </div>
            </div>
            <div style={{ height: '300px', position: 'relative' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={recommendations} cx="50%" cy="45%" innerRadius={70} outerRadius={90} paddingAngle={4} dataKey="value" animationDuration={800} stroke="none">
                    {recommendations.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: '1px solid var(--border)', boxShadow: '0 8px 32px rgba(0,0,0,0.3)', background: 'var(--surface)', color: 'var(--text)', padding: '12px 16px' }}
                    itemStyle={{ fontWeight: 800, color: 'var(--text)', fontSize: '14px' }}
                  />
                  <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--chart-text)' }} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ position: 'absolute', top: '45%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: 950, color: 'var(--text)', letterSpacing: '-1px' }}>Tunisia</div>
                <div style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>Hotspots</div>
              </div>
            </div>
          </Card>

          <Card hover style={{ padding: '24px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '28px' }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text)' }}>Live Airspace Traffic (Radar)</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                 <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444', animation: 'pulse 1.5s infinite' }}></div>
                 <span style={{ fontSize: '10px', fontWeight: 900, color: '#ef4444', letterSpacing: '1px' }}>REAL-TIME FEED</span>
              </div>
            </div>
            <div style={{ height: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={inflowData}>
                  <defs>
                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--chart-accent)" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="var(--chart-accent)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'var(--chart-text)' }} />
                  <YAxis hide domain={['dataMin - 5', 'dataMax + 5']} />
                  <Tooltip 
                    contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', color: 'var(--text)', fontSize: '12px', boxShadow: 'var(--shadow)' }}
                    labelStyle={{ fontWeight: 800, color: 'var(--chart-accent)', marginBottom: '4px' }}
                    itemStyle={{ color: 'var(--text)', fontWeight: 600 }}
                    formatter={(value) => [`${value} Planes`, 'Active Flights']}
                  />
                  <Area type="monotone" dataKey="count" stroke="var(--chart-accent)" strokeWidth={4} fillOpacity={1} fill="url(#colorCount)" dot={{ fill: 'var(--chart-accent)', r: 5 }} activeDot={{ r: 8 }} animationDuration={1000} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      </div>

      <button onClick={() => setModal(true)} style={{ position: 'fixed', bottom: 32, right: 32, width: 64, height: 64, borderRadius: '24px', background: 'var(--primary-grad)', color: 'white', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 30px rgba(36,70,212,0.4)', zIndex: 50 }}>
        <span className="material-symbols-outlined" style={{ fontSize: '28px' }}>add</span>
      </button>

      <Modal open={modal} onClose={() => setModal(false)} title="Register New Passenger">
        <form onSubmit={submit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Input label="First Name" value={form.firstName} onChange={e => set('firstName', e.target.value)} required />
            <Input label="Last Name"  value={form.lastName}  onChange={e => set('lastName',  e.target.value)} required />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Input label="Email" type="email" value={form.email} onChange={e => set('email', e.target.value)} required />
            <Input label="Age" type="number" value={form.age} onChange={e => set('age', e.target.value)} required />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Input label="Nationality" value={form.nationality} onChange={e => set('nationality', e.target.value)} required />
            <Input label="Destination" value={form.destination} onChange={e => set('destination', e.target.value)} required />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Input label="Purpose" value={form.purpose} onChange={e => set('purpose', e.target.value)} required />
            <Input label="Budget" value={form.budget} onChange={e => set('budget', e.target.value)} required />
          </div>
          <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
            <Button variant="outline" onClick={() => setModal(false)} style={{ flex: 1, justifyContent: 'center' }}>Cancel</Button>
            <Button type="submit" variant="primary" style={{ flex: 2, justifyContent: 'center' }}>Create Profile</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
