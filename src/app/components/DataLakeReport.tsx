import React, { useState, useMemo } from 'react';
import { Activity, Users, FileText, HardDrive, Database, Server, Clock, CheckCircle, AlertTriangle, TrendingUp, Filter } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { SearchMultiSelect } from './ui/SearchMultiSelect';

const TIME_RANGES = ['Last 7 days', 'Last 30 days', 'Last 90 days', 'Last 12 months'] as const;

const MOCK_DATABASES = [
  { id: 'db-alpha', name: 'CARDIO-2024' },
  { id: 'db-beta', name: 'NEURO-PHASE3' },
  { id: 'db-gamma', name: 'ONCO-TRIAL-A' },
  { id: 'db-delta', name: 'RESP-PILOT' },
];

const MOCK_UPTIME_DATA: Record<string, { date: string; uptime: number }[]> = {
  'Last 7 days': [
    { date: 'Mon', uptime: 100 }, { date: 'Tue', uptime: 99.98 }, { date: 'Wed', uptime: 100 },
    { date: 'Thu', uptime: 99.95 }, { date: 'Fri', uptime: 100 }, { date: 'Sat', uptime: 100 }, { date: 'Sun', uptime: 100 },
  ],
  'Last 30 days': Array.from({ length: 30 }, (_, i) => ({ date: `Day ${i + 1}`, uptime: 99.9 + Math.random() * 0.1 })),
  'Last 90 days': Array.from({ length: 12 }, (_, i) => ({ date: `Week ${i + 1}`, uptime: 99.85 + Math.random() * 0.15 })),
  'Last 12 months': ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map(m => ({ date: m, uptime: 99.8 + Math.random() * 0.2 })),
};

const MOCK_DB_STATS: Record<string, { patients: number; files: number; storageGB: number; tables: number; lastIngestion: string; status: string }> = {
  'db-alpha': { patients: 3240, files: 18200, storageGB: 450, tables: 42, lastIngestion: '2 hours ago', status: 'healthy' },
  'db-beta': { patients: 1892, files: 9800, storageGB: 280, tables: 31, lastIngestion: '6 hours ago', status: 'healthy' },
  'db-gamma': { patients: 2800, files: 15400, storageGB: 1228, tables: 67, lastIngestion: '1 hour ago', status: 'warning' },
  'db-delta': { patients: 500, files: 1800, storageGB: 42, tables: 12, lastIngestion: '1 day ago', status: 'healthy' },
};

const MOCK_INGESTION_TREND = [
  { month: 'Jan', files: 2400, size: 120 }, { month: 'Feb', files: 3100, size: 155 },
  { month: 'Mar', files: 4200, size: 210 }, { month: 'Apr', files: 3800, size: 190 },
  { month: 'May', files: 5100, size: 255 }, { month: 'Jun', files: 4700, size: 235 },
];

const MOCK_EVENTS = [
  { time: '14:32', message: 'Backup completed for CARDIO-2024', type: 'success' },
  { time: '13:10', message: 'High storage usage on ONCO-TRIAL-A (92%)', type: 'warning' },
  { time: '11:45', message: 'Ingestion batch #4821 processed (1,200 files)', type: 'success' },
  { time: '09:20', message: 'Schema migration applied to NEURO-PHASE3', type: 'info' },
  { time: '08:00', message: 'Daily integrity check passed for all databases', type: 'success' },
];

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-zinc-200 rounded-lg shadow-lg px-3 py-2 text-xs">
      {label && <p className="text-zinc-500 mb-1">{label}</p>}
      {payload.map((p: any, i: number) => (
        <div key={i} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: p.color || p.fill || p.stroke }} />
          <span className="text-zinc-700">{p.name}: <span className="font-medium">{typeof p.value === 'number' ? (p.name === 'Uptime' ? `${p.value.toFixed(3)}%` : p.value.toLocaleString()) : p.value}</span></span>
        </div>
      ))}
    </div>
  );
}

export function DataLakeReport() {
  const [timeRange, setTimeRange] = useState<string>('Last 30 days');
  const [selectedDbs, setSelectedDbs] = useState<string[]>(MOCK_DATABASES.map(d => d.id));

  const totals = useMemo(() => {
    let patients = 0, files = 0, storageGB = 0, tables = 0;
    selectedDbs.forEach(id => {
      const s = MOCK_DB_STATS[id];
      if (s) { patients += s.patients; files += s.files; storageGB += s.storageGB; tables += s.tables; }
    });
    return {
      patients, files, tables,
      storage: storageGB >= 1024 ? `${(storageGB / 1024).toFixed(1)} TB` : `${storageGB} GB`,
    };
  }, [selectedDbs]);

  const uptimeData = MOCK_UPTIME_DATA[timeRange] || [];

  return (
    <div className="flex flex-col gap-8 w-full max-w-7xl mx-auto h-full overflow-y-auto pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-zinc-900">Data Lake Report</h2>
          <p className="text-sm text-zinc-500 mt-1">Infrastructure health, storage metrics, and ingestion trends.</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Time range */}
          <select
            value={timeRange}
            onChange={e => setTimeRange(e.target.value)}
            className="px-3 py-2 text-sm bg-white border border-zinc-200 rounded-lg text-zinc-700"
          >
            {TIME_RANGES.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
          {/* DB filter */}
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: <Activity className="w-5 h-5" />, label: 'System Uptime', value: '99.97%', color: 'emerald', badge: timeRange },
          { icon: <Users className="w-5 h-5" />, label: 'Registered Patients', value: totals.patients.toLocaleString(), color: 'indigo', badge: `+5%` },
          { icon: <FileText className="w-5 h-5" />, label: 'Registered Files', value: totals.files.toLocaleString(), color: 'amber', badge: `+22%` },
          { icon: <HardDrive className="w-5 h-5" />, label: 'Total Storage', value: totals.storage, color: 'rose', badge: `${selectedDbs.length} DBs` },
        ].map(card => (
          <div key={card.label} className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-sm flex flex-col justify-between">
            <div className="flex items-start justify-between mb-4">
              <div className={`bg-${card.color}-100{card.color}-900/30 p-2 rounded-xl text-${card.color}-600{card.color}-400`}>{card.icon}</div>
              <span className="text-xs font-medium text-zinc-500 bg-zinc-100 px-2 py-1 rounded-full">{card.badge}</span>
            </div>
            <h3 className="text-3xl font-bold text-zinc-900">{card.value}</h3>
            <p className="text-sm text-zinc-500 mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Uptime Chart */}
      <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm">
        <h3 className="text-lg font-bold text-zinc-900 mb-1">Uptime History</h3>
        <p className="text-sm text-zinc-500 mb-4">System availability over the selected period.</p>
        <div className="h-64">
          <ResponsiveContainer width="100%" height={256}>
            <AreaChart data={uptimeData}>
              <defs>
                <linearGradient id="uptimeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid key="grid" strokeDasharray="3 3" stroke="#27272a" />
              <XAxis key="xaxis" dataKey="date" tick={{ fontSize: 12, fill: '#71717a' }} />
              <YAxis key="yaxis" domain={[99.7, 100.05]} tick={{ fontSize: 12, fill: '#71717a' }} tickFormatter={v => `${v}%`} />
              <Tooltip key="tooltip" content={<CustomTooltip />} />
              <Area key="area" type="monotone" dataKey="uptime" stroke="#10b981" fill="url(#uptimeGrad)" strokeWidth={2} name="Uptime" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ingestion Trend */}
        <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-zinc-900 mb-1">Ingestion Trend</h3>
          <p className="text-sm text-zinc-500 mb-4">Monthly file ingestion volume.</p>
          <div className="h-56">
            <ResponsiveContainer width="100%" height={224}>
              <BarChart data={MOCK_INGESTION_TREND}>
                <CartesianGrid key="grid" strokeDasharray="3 3" stroke="#27272a" />
                <XAxis key="xaxis" dataKey="month" tick={{ fontSize: 12, fill: '#71717a' }} />
                <YAxis key="yaxis" tick={{ fontSize: 12, fill: '#71717a' }} />
                <Tooltip key="tooltip" content={<CustomTooltip />} />
                <Bar key="bar" dataKey="files" fill="#6366f1" radius={[4, 4, 0, 0]} name="Files" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Events */}
        <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-zinc-900 mb-1">Recent Events</h3>
          <p className="text-sm text-zinc-500 mb-4">Latest system activity log.</p>
          <div className="flex flex-col gap-3">
            {MOCK_EVENTS.map((evt, i) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-zinc-50 rounded-xl border border-zinc-100">
                {evt.type === 'success' ? <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" /> :
                  evt.type === 'warning' ? <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" /> :
                    <Clock className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-zinc-700">{evt.message}</p>
                  <p className="text-xs text-zinc-400 mt-0.5">{evt.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Per-Database Table */}
      <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm">
        <h3 className="text-lg font-bold text-zinc-900 mb-4">Database Breakdown</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-200">
                {['Database', 'Status', 'Patients', 'Files', 'Tables', 'Storage', 'Last Ingestion'].map(h => (
                  <th key={h} className="text-left py-3 px-4 text-zinc-500 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MOCK_DATABASES.filter(db => selectedDbs.includes(db.id)).map(db => {
                const s = MOCK_DB_STATS[db.id];
                return (
                  <tr key={db.id} className="border-b border-zinc-100 hover:bg-zinc-50 transition-colors">
                    <td className="py-3 px-4 font-medium text-zinc-900">{db.name}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-full ${s.status === 'healthy' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${s.status === 'healthy' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                        {s.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-zinc-700">{s.patients.toLocaleString()}</td>
                    <td className="py-3 px-4 text-zinc-700">{s.files.toLocaleString()}</td>
                    <td className="py-3 px-4 text-zinc-700">{s.tables}</td>
                    <td className="py-3 px-4 text-zinc-700">{s.storageGB >= 1024 ? `${(s.storageGB / 1024).toFixed(1)} TB` : `${s.storageGB} GB`}</td>
                    <td className="py-3 px-4 text-zinc-500">{s.lastIngestion}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {selectedDbs.length === 0 && (
            <div className="py-8 text-center text-zinc-400"><Database className="w-6 h-6 mx-auto mb-2 opacity-50" />Select at least one database.</div>
          )}
        </div>
      </div>
    </div>
  );
}