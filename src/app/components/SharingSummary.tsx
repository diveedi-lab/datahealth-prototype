import React, { useState, useMemo } from 'react';
import { Shield, Search, Share2, Users, UserCheck, Eye, Download, Filter, ArrowUpRight, ArrowDownRight, Clock, Database } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { SearchMultiSelect } from './ui/SearchMultiSelect';
import { listShares } from './sharing/sharesStore';

const MOCK_DATABASES = [
  { id: 'db-alpha', name: 'CARDIO-2024' },
  { id: 'db-beta', name: 'NEURO-PHASE3' },
  { id: 'db-gamma', name: 'ONCO-TRIAL-A' },
  { id: 'db-delta', name: 'RESP-PILOT' },
];

const TIME_RANGES = ['Last 7 days', 'Last 30 days', 'Last 90 days'] as const;

const MOCK_SHARING_STATS: Record<string, { usersWithAccess: number; queries: number; collaborations: number; downloads: number; views: number }> = {
  'db-alpha': { usersWithAccess: 48, queries: 420000, collaborations: 3, downloads: 1200, views: 8400 },
  'db-beta': { usersWithAccess: 32, queries: 310000, collaborations: 2, downloads: 800, views: 5600 },
  'db-gamma': { usersWithAccess: 45, queries: 380000, collaborations: 2, downloads: 1500, views: 9200 },
  'db-delta': { usersWithAccess: 17, queries: 90000, collaborations: 1, downloads: 200, views: 1400 },
};

const QUERY_TREND = [
  { month: 'Jan', queries: 82000 }, { month: 'Feb', queries: 95000 }, { month: 'Mar', queries: 110000 },
  { month: 'Apr', queries: 98000 }, { month: 'May', queries: 125000 }, { month: 'Jun', queries: 140000 },
];

const ACCESS_BY_ROLE = [
  { name: 'Investigator', value: 42 },
  { name: 'Data Manager', value: 35 },
  { name: 'Biostatistician', value: 28 },
  { name: 'Monitor', value: 22 },
  { name: 'Admin', value: 15 },
];

const ROLE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-zinc-200 rounded-lg shadow-lg px-3 py-2 text-xs">
      {label && <p className="text-zinc-500 mb-1">{label}</p>}
      {payload.map((p: any, i: number) => (
        <div key={i} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: p.color || p.fill || p.stroke }} />
          <span className="text-zinc-700">{p.name}: <span className="font-medium">{typeof p.value === 'number' ? p.value.toLocaleString() : p.value}</span></span>
        </div>
      ))}
    </div>
  );
}

const RECENT_SHARES = [
  { user: 'Dr. M. Rossi', database: 'CARDIO-2024', action: 'Granted read access', time: '2 hours ago', role: 'Investigator' },
  { user: 'A. Bianchi', database: 'ONCO-TRIAL-A', action: 'Exported dataset', time: '4 hours ago', role: 'Biostatistician' },
  { user: 'F. Verdi', database: 'NEURO-PHASE3', action: 'Created collaboration', time: '6 hours ago', role: 'Data Manager' },
  { user: 'L. Neri', database: 'CARDIO-2024', action: 'Executed 12 queries', time: '8 hours ago', role: 'Monitor' },
  { user: 'S. Russo', database: 'RESP-PILOT', action: 'Granted write access', time: '1 day ago', role: 'Admin' },
  { user: 'G. Colombo', database: 'ONCO-TRIAL-A', action: 'Revoked access', time: '1 day ago', role: 'Admin' },
];

const TOP_QUERIERS = [
  { user: 'A. Bianchi', queries: 14200, db: 'ONCO-TRIAL-A' },
  { user: 'Dr. M. Rossi', queries: 11800, db: 'CARDIO-2024' },
  { user: 'F. Verdi', queries: 9400, db: 'NEURO-PHASE3' },
  { user: 'P. Marino', queries: 7100, db: 'CARDIO-2024' },
  { user: 'L. Neri', queries: 5600, db: 'RESP-PILOT' },
];

export function SharingSummary({ onShare }: { onShare?: () => void }) {
  const [timeRange, setTimeRange] = useState<string>('Last 30 days');
  const [selectedDbs, setSelectedDbs] = useState<string[]>(MOCK_DATABASES.map(d => d.id));
  const myShares = listShares();

  const totals = useMemo(() => {
    let usersWithAccess = 0, queries = 0, collaborations = 0, downloads = 0, views = 0;
    selectedDbs.forEach(id => {
      const s = MOCK_SHARING_STATS[id];
      if (s) { usersWithAccess += s.usersWithAccess; queries += s.queries; collaborations += s.collaborations; downloads += s.downloads; views += s.views; }
    });
    return { usersWithAccess, queries, collaborations, downloads, views };
  }, [selectedDbs]);

  const fmt = (n: number) => new Intl.NumberFormat('en-US', { notation: 'compact', compactDisplay: 'short' }).format(n);

  return (
    <div className="flex flex-col gap-8 w-full max-w-7xl mx-auto h-full overflow-y-auto pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-zinc-900">Sharing Summary</h2>
          <p className="text-sm text-zinc-500 mt-1">Access metrics, collaboration activity, and query usage across databases.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={onShare} className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-sm transition-colors">
            <Share2 className="w-4 h-4" /> Condividi
          </button>
          <select value={timeRange} onChange={e => setTimeRange(e.target.value)} className="px-3 py-2 text-sm bg-white border border-zinc-200 rounded-lg text-zinc-700">
            {TIME_RANGES.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
          <SearchMultiSelect
            options={MOCK_DATABASES.map(db => ({ id: db.id, name: db.name }))}
            selected={selectedDbs}
            onChange={setSelectedDbs}
            label="databases"
            placeholder="Search databases..."
          />
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { icon: <Shield className="w-5 h-5" />, label: 'People with Access', value: totals.usersWithAccess, color: 'blue', trend: '+12%', up: true },
          { icon: <Search className="w-5 h-5" />, label: 'Queries Performed', value: fmt(totals.queries), color: 'violet', trend: '+18%', up: true },
          { icon: <Share2 className="w-5 h-5" />, label: 'Active Collaborations', value: totals.collaborations, color: 'fuchsia', trend: '+2', up: true },
          { icon: <Download className="w-5 h-5" />, label: 'Data Downloads', value: fmt(totals.downloads), color: 'emerald', trend: '+8%', up: true },
          { icon: <Eye className="w-5 h-5" />, label: 'Data Views', value: fmt(totals.views), color: 'amber', trend: '-3%', up: false },
        ].map(card => (
          <div key={card.label} className="glass-card p-5 rounded-2xl transition-colors hover:shadow-md">
            <div className={`bg-${card.color}-100{card.color}-900/30 p-2 rounded-xl text-${card.color}-600{card.color}-400 w-fit mb-3`}>{card.icon}</div>
            <h3 className="text-2xl font-bold text-zinc-900">{card.value}</h3>
            <div className="flex items-center justify-between mt-1">
              <p className="text-sm text-zinc-500">{card.label}</p>
              <span className={`flex items-center gap-0.5 text-xs font-medium ${card.up ? 'text-emerald-600' : 'text-red-500'}`}>
                {card.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}{card.trend}
              </span>
            </div>
          </div>
        ))}
      </div>

      {myShares.length > 0 && (
        <div className="glass-card rounded-2xl p-6">
          <h3 className="text-lg font-bold text-zinc-900 mb-4">Le tue condivisioni</h3>
          <div className="flex flex-col gap-2">
            {myShares.map((s) => (
              <div key={s.id} className="flex items-start gap-3 p-3 bg-zinc-50/70 rounded-xl border border-zinc-100">
                <div className="bg-emerald-100 p-1.5 rounded-full text-emerald-600 mt-0.5 shrink-0">
                  <Database className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-zinc-800 font-medium truncate">{s.collectionNames.join(', ')}</p>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    con {s.users.map(u => u.name).join(', ')} · {s.users.length} utenti
                  </p>
                </div>
                <div className="flex flex-wrap gap-1 justify-end shrink-0 max-w-[45%]">
                  {s.permissions.map(p => (
                    <span key={p} className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-600">{p}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Query Trend */}
        <div className="glass-card rounded-2xl p-6">
          <h3 className="text-lg font-bold text-zinc-900 mb-1">Query Volume Trend</h3>
          <p className="text-sm text-zinc-500 mb-4">Monthly query execution count.</p>
          <div className="h-56">
            <ResponsiveContainer width="100%" height={224}>
              <LineChart data={QUERY_TREND}>
                <CartesianGrid key="grid" strokeDasharray="3 3" stroke="#27272a" />
                <XAxis key="xaxis" dataKey="month" tick={{ fontSize: 12, fill: '#71717a' }} />
                <YAxis key="yaxis" tick={{ fontSize: 12, fill: '#71717a' }} tickFormatter={v => fmt(v)} />
                <Tooltip key="tooltip" content={<CustomTooltip />} />
                <Line key="line" type="monotone" dataKey="queries" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 4, fill: '#8b5cf6' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Access by Role */}
        <div className="glass-card rounded-2xl p-6">
          <h3 className="text-lg font-bold text-zinc-900 mb-1">Access by Role</h3>
          <p className="text-sm text-zinc-500 mb-4">User distribution across roles.</p>
          <div className="flex items-center gap-6">
            <div className="h-48 w-48 shrink-0">
              <ResponsiveContainer width="100%" height={192}>
                <PieChart>
                  <Pie key="pie" data={ACCESS_BY_ROLE} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={2} dataKey="value" nameKey="name">
                    {ACCESS_BY_ROLE.map((entry, i) => <Cell key={`role-${entry.name}`} fill={ROLE_COLORS[i]} />)}
                  </Pie>
                  <Tooltip key="tooltip" content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-col gap-2">
              {ACCESS_BY_ROLE.map((role, i) => (
                <div key={role.name} className="flex items-center gap-2 text-sm text-zinc-600">
                  <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: ROLE_COLORS[i] }} />
                  {role.name} ({role.value})
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Sharing Activity */}
        <div className="glass-card rounded-2xl p-6">
          <h3 className="text-lg font-bold text-zinc-900 mb-4">Recent Activity</h3>
          <div className="flex flex-col gap-3">
            {RECENT_SHARES.map((item, i) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-zinc-50 rounded-xl border border-zinc-100">
                <div className="bg-blue-100 p-1.5 rounded-full text-blue-600 mt-0.5 shrink-0">
                  <UserCheck className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-zinc-700"><span className="font-medium">{item.user}</span> &middot; {item.action}</p>
                  <p className="text-xs text-zinc-400 mt-0.5">{item.database} &middot; {item.time}</p>
                </div>
                <span className="text-xs bg-zinc-100 text-zinc-500 px-2 py-1 rounded-full shrink-0">{item.role}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Queriers */}
        <div className="glass-card rounded-2xl p-6">
          <h3 className="text-lg font-bold text-zinc-900 mb-4">Top Queriers</h3>
          <div className="flex flex-col gap-3">
            {TOP_QUERIERS.map((item, i) => (
              <div key={i} className="flex items-center gap-4 p-3 bg-zinc-50 rounded-xl border border-zinc-100">
                <span className="text-lg font-bold text-zinc-300 w-6 text-center">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-zinc-700">{item.user}</p>
                  <p className="text-xs text-zinc-400">{item.db}</p>
                </div>
                <span className="text-sm font-bold text-zinc-900">{item.queries.toLocaleString()}</span>
                <span className="text-xs text-zinc-400">queries</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}