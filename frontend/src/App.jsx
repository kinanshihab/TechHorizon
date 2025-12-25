import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';
import {
  TrendingUp,
  Users,
  DollarSign,
  Swords,
  Activity,
  Filter,
  ArrowUpRight
} from 'lucide-react';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#6366f1'];

// Available Roles for Filtering
const ROLES = [
  "All",
  "Developer, full-stack",
  "Developer, back-end",
  "Developer, front-end",
  "Data scientist or machine learning specialist",
  "DevOps specialist",
  "Developer, mobile"
];

const BATTLE_SKILLS = ["Python", "JavaScript", "Java", "C++", "C#", "Go", "Rust", "TypeScript", "SQL", "Swift"];

function App() {
  const [selectedRole, setSelectedRole] = useState("All");

  // Battle State
  const [skill1, setSkill1] = useState("Python");
  const [skill2, setSkill2] = useState("JavaScript");
  const [battleResult, setBattleResult] = useState(null);

  // Main Dashboard State
  const [stats, setStats] = useState({ top_skill: "Loading...", trend_of_month: "...", total_jobs_analyzed: 0 });
  const [heatmapData, setHeatmapData] = useState([]);
  const [salaryData, setSalaryData] = useState([]);
  const [growthData, setGrowthData] = useState([]);

  // Fetch Dashboard Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const query = selectedRole !== "All" ? `?role=${encodeURIComponent(selectedRole)}` : "";

        const [statsRes, heatmapRes, salaryRes, growthRes] = await Promise.all([
          fetch(`http://127.0.0.1:8000/api/stats${query}`),
          fetch(`http://127.0.0.1:8000/api/skills/heatmap${query}`),
          fetch(`http://127.0.0.1:8000/api/salary/trends${query}`),
          fetch(`http://127.0.0.1:8000/api/skills/growth${query}`)
        ]);

        setStats(await statsRes.json());
        setHeatmapData((await heatmapRes.json()).slice(0, 10));
        setSalaryData((await salaryRes.json()).slice(0, 8));
        setGrowthData(await growthRes.json());
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };

    fetchData();
  }, [selectedRole]);

  // Auto-run Battle when selection changes
  useEffect(() => {
    const runBattle = async () => {
      try {
        const query = `?skill1=${encodeURIComponent(skill1)}&skill2=${encodeURIComponent(skill2)}&role=${encodeURIComponent(selectedRole)}`;
        const res = await fetch(`http://127.0.0.1:8000/api/battle${query}`);
        const data = await res.json();
        setBattleResult(data);
      } catch (err) {
        console.error("Battle failed:", err);
      }
    };
    runBattle();
  }, [skill1, skill2, selectedRole]);

  return (
    <div className="container">
      {/* Header */}
      <header style={{ marginBottom: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'end', borderBottom: '1px solid var(--border-color)', paddingBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'white' }}>
            <Activity size={28} className="text-primary" style={{ color: '#3b82f6' }} />
            TechHorizon
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Market Intelligence & Career Analytics
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'end', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Market Context</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Filter size={16} color="var(--text-muted)" />
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="custom-select"
            >
              {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
        </div>
      </header>

      {/* TECH BATTLE ARENA (Redesigned) */}
      <section className="card battle-card animate-enter" style={{ marginBottom: '3rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', color: 'var(--text-muted)' }}>
          <Swords size={20} />
          <h2 style={{ fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>Direct Comparison</h2>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', flexWrap: 'wrap', gap: '2rem' }}>
          {/* Controls */}
          <div style={{ flex: 1, minWidth: '300px' }}>
            <p style={{ marginBottom: '1rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Compare two technologies to see their market performance relative to the selected role.</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <select value={skill1} onChange={(e) => setSkill1(e.target.value)} className="custom-select" style={{ width: '100%' }}>
                {BATTLE_SKILLS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>VS</span>
              <select value={skill2} onChange={(e) => setSkill2(e.target.value)} className="custom-select" style={{ width: '100%' }}>
                {BATTLE_SKILLS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {/* Results Display */}
          {battleResult && (
            <div style={{ flex: 2, display: 'flex', gap: '2rem', background: '#09090b', padding: '1.5rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
              {/* Skill 1 */}
              <div style={{ flex: 1 }}>
                <div style={{ color: '#3b82f6', fontWeight: 600, marginBottom: '0.5rem' }}>{battleResult.skill1.name}</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 600 }}>${battleResult.skill1.salary.toLocaleString()}</div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Avg. Compensation</div>
                <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
                  <Users size={14} color="var(--text-muted)" />
                  {battleResult.skill1.count} developers
                </div>
              </div>

              {/* Divider */}
              <div style={{ width: '1px', background: 'var(--border-color)' }}></div>

              {/* Skill 2 */}
              <div style={{ flex: 1 }}>
                <div style={{ color: '#10b981', fontWeight: 600, marginBottom: '0.5rem' }}>{battleResult.skill2.name}</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 600 }}>${battleResult.skill2.salary.toLocaleString()}</div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Avg. Compensation</div>
                <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
                  <Users size={14} color="var(--text-muted)" />
                  {battleResult.skill2.count} developers
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* KPI Cards */}
      <div className="stat-grid animate-enter" style={{ marginBottom: '3rem', animationDelay: '0.1s' }}>
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
            <Users size={16} /> Most Popular
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 600 }}>{stats.top_skill}</div>
        </div>
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
            <TrendingUp size={16} /> Trending (Month)
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 600, color: '#10b981' }}>{stats.trend_of_month}</div>
        </div>
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
            <Activity size={16} /> Dataset Size
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 600 }}>{stats.total_jobs_analyzed.toLocaleString()}</div>
        </div>
      </div>

      {/* Charts Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: '2rem', marginBottom: '4rem' }}>

        {/* Heatmap */}
        <div className="card animate-enter" style={{ animationDelay: '0.2s' }}>
          <h2 className="section-title"><Activity size={20} /> Market Share (Top 10)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={heatmapData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" horizontal={false} />
              <XAxis type="number" hide />
              <YAxis dataKey="text" type="category" width={100} tick={{ fill: '#a1a1aa', fontSize: 12 }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#18181b', borderColor: '#3f3f46', borderRadius: '6px' }}
                itemStyle={{ color: '#f4f4f5' }}
                cursor={{ fill: 'rgba(255,255,255,0.03)' }}
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {heatmapData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Salary Chart */}
        <div className="card animate-enter" style={{ animationDelay: '0.3s' }}>
          <h2 className="section-title"><DollarSign size={20} /> Compensation Analysis</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={salaryData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
              <XAxis
                dataKey="job_title"
                tick={{ fill: '#a1a1aa', fontSize: 11 }}
                interval={0}
                angle={-15}
                textAnchor="end"
                height={60}
              />
              <YAxis tick={{ fill: '#a1a1aa', fontSize: 12 }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#18181b', borderColor: '#3f3f46', borderRadius: '6px' }}
                formatter={(val) => `$${val.toLocaleString()}`}
                cursor={{ fill: 'rgba(255,255,255,0.03)' }}
              />
              <Bar dataKey="salary_in_usd" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Growth Section */}
      <div className="card animate-enter" style={{ animationDelay: '0.4s' }}>
        <h2 className="section-title"><ArrowUpRight size={20} /> High Growth Segments</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
          {growthData.map((item, idx) => (
            <div key={idx} style={{
              padding: '1rem',
              background: 'rgba(24, 24, 27, 0.5)',
              borderRadius: '6px',
              borderLeft: `2px solid ${COLORS[idx % COLORS.length]}`,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span style={{ fontWeight: 500, fontSize: '0.9rem' }}>{item.skill}</span>
              <span style={{ color: '#10b981', fontWeight: 600, fontSize: '0.85rem' }}>+{item.growth.toFixed(1)}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default App
