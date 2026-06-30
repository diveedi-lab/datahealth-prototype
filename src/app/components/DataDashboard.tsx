import React, { useState, useMemo } from 'react';
import { Hash, Layers, List, HardDrive, Database, Filter, FileText, BarChart3, TrendingUp, Table } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';
import { SearchMultiSelect } from './ui/SearchMultiSelect';

const MOCK_DATABASES = [
  { id: 'db-alpha', name: 'CARDIO-2024' },
  { id: 'db-beta', name: 'NEURO-PHASE3' },
  { id: 'db-gamma', name: 'ONCO-TRIAL-A' },
  { id: 'db-delta', name: 'RESP-PILOT' },
];

const MOCK_DB_DATA: Record<string, {
  variables: number; entities: number; spaceGB: number; rows: number;
  fileTypes: Record<string, number>;
  entityBreakdown: { name: string; count: number }[];
  variablesByType: { name: string; count: number }[];
}> = {
  'db-alpha': {
    variables: 1250, entities: 24, spaceGB: 450, rows: 2450000,
    fileTypes: { PDF: 450, DICOM: 120, XLSX: 80, CSV: 60 },
    entityBreakdown: [{ name: 'Patient', count: 3240 }, { name: 'Visit', count: 18200 }, { name: 'Lab Result', count: 42000 }, { name: 'Adverse Event', count: 890 }, { name: 'Medication', count: 5600 }],
    variablesByType: [{ name: 'Numeric', count: 520 }, { name: 'Categorical', count: 380 }, { name: 'Date/Time', count: 180 }, { name: 'Text', count: 120 }, { name: 'Binary', count: 50 }],
  },
  'db-beta': {
    variables: 840, entities: 18, spaceGB: 280, rows: 1200000,
    fileTypes: { PDF: 320, CSV: 150, JSON: 45 },
    entityBreakdown: [{ name: 'Patient', count: 1892 }, { name: 'Scan', count: 9400 }, { name: 'Assessment', count: 15200 }, { name: 'Adverse Event', count: 420 }],
    variablesByType: [{ name: 'Numeric', count: 310 }, { name: 'Categorical', count: 240 }, { name: 'Date/Time', count: 140 }, { name: 'Text', count: 100 }, { name: 'Binary', count: 50 }],
  },
  'db-gamma': {
    variables: 3200, entities: 45, spaceGB: 1228, rows: 8500000,
    fileTypes: { DICOM: 850, PDF: 1200, JSON: 400, XLSX: 220, CSV: 180 },
    entityBreakdown: [{ name: 'Patient', count: 2800 }, { name: 'Biopsy', count: 4200 }, { name: 'Treatment Cycle', count: 22000 }, { name: 'Lab Result', count: 68000 }, { name: 'Imaging', count: 15400 }],
    variablesByType: [{ name: 'Numeric', count: 1200 }, { name: 'Categorical', count: 880 }, { name: 'Date/Time', count: 520 }, { name: 'Text', count: 400 }, { name: 'Binary', count: 200 }],
  },
  'db-delta': {
    variables: 320, entities: 8, spaceGB: 42, rows: 180000,
    fileTypes: { PDF: 80, CSV: 40, XLSX: 20 },
    entityBreakdown: [{ name: 'Patient', count: 500 }, { name: 'Visit', count: 2400 }, { name: 'Spirometry', count: 4800 }],
    variablesByType: [{ name: 'Numeric', count: 140 }, { name: 'Categorical', count: 90 }, { name: 'Date/Time', count: 50 }, { name: 'Text', count: 30 }, { name: 'Binary', count: 10 }],
  },
};

const PIE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#6366f1', '#ec4899', '#14b8a6'];
const ENTITY_COLORS = ['#6366f1', '#3b82f6', '#10b981', '#f59e0b', '#ec4899'];

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-zinc-200 rounded-lg shadow-lg px-3 py-2 text-xs">
      {label && <p className="text-zinc-500 mb-1">{label}</p>}
      {payload.map((p: any, i: number) => (
        <div key={i} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: p.color || p.fill }} />
          <span className="text-zinc-700">{p.name}: <span className="font-medium">{typeof p.value === 'number' ? p.value.toLocaleString() : p.value}</span></span>
        </div>
      ))}
    </div>
  );
}

export function DataDashboard() {
  const [selectedDbs, setSelectedDbs] = useState<string[]>(MOCK_DATABASES.map(d => d.id));

  const stats = useMemo(() => {
    let variables = 0, entities = 0, spaceGB = 0, rows = 0;
    const fileTypes: Record<string, number> = {};
    const entityMap: Record<string, number> = {};
    const varTypeMap: Record<string, number> = {};

    selectedDbs.forEach(id => {
      const db = MOCK_DB_DATA[id];
      if (!db) return;
      variables += db.variables; entities += db.entities; spaceGB += db.spaceGB; rows += db.rows;
      Object.entries(db.fileTypes).forEach(([t, c]) => { fileTypes[t] = (fileTypes[t] || 0) + c; });
      db.entityBreakdown.forEach(e => { entityMap[e.name] = (entityMap[e.name] || 0) + e.count; });
      db.variablesByType.forEach(v => { varTypeMap[v.name] = (varTypeMap[v.name] || 0) + v.count; });
    });

    return {
      variables, entities,
      space: spaceGB >= 1024 ? `${(spaceGB / 1024).toFixed(1)} TB` : `${spaceGB} GB`,
      rows: new Intl.NumberFormat('en-US', { notation: 'compact', compactDisplay: 'short' }).format(rows),
      fileTypes: Object.entries(fileTypes).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value),
      entityBreakdown: Object.entries(entityMap).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count),
      variablesByType: Object.entries(varTypeMap).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count),
    };
  }, [selectedDbs]);

  return (
    <div className="flex flex-col gap-8 w-full max-w-7xl mx-auto h-full overflow-y-auto pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-zinc-900">Data Dashboard</h2>
          <p className="text-sm text-zinc-500 mt-1">Detailed variable, entity, and file breakdown by selected databases.</p>
        </div>
        <SearchMultiSelect
          options={MOCK_DATABASES.map(db => ({ id: db.id, name: db.name }))}
          selected={selectedDbs}
          onChange={setSelectedDbs}
          label="databases"
          placeholder="Search databases..."
        />
      </div>

      {selectedDbs.length === 0 ? (
        <div className="py-16 flex flex-col items-center justify-center text-zinc-400 border-2 border-dashed border-zinc-200 rounded-2xl">
          <Database className="w-8 h-8 mb-3 opacity-50" />
          <p>Select at least one database to view statistics.</p>
        </div>
      ) : (
        <>
          {/* Summary KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: <Hash className="w-4 h-4" />, label: 'Total Variables', value: stats.variables.toLocaleString() },
              { icon: <Layers className="w-4 h-4" />, label: 'Entities', value: stats.entities.toLocaleString() },
              { icon: <List className="w-4 h-4" />, label: 'Total Rows', value: stats.rows },
              { icon: <HardDrive className="w-4 h-4" />, label: 'Space Occupied', value: stats.space },
            ].map(kpi => (
              <div key={kpi.label} className="glass-card p-5 rounded-2xl transition-colors hover:shadow-md">
                <div className="flex items-center gap-2 mb-2 text-zinc-500">{kpi.icon}<span className="text-sm font-medium">{kpi.label}</span></div>
                <p className="text-2xl font-bold text-zinc-900">{kpi.value}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* File Types Pie */}
            <div className="glass-card rounded-2xl p-6">
              <h3 className="text-lg font-bold text-zinc-900 mb-1">Files by Type</h3>
              <p className="text-sm text-zinc-500 mb-4">Distribution of stored file formats.</p>
              <div className="flex items-center gap-6">
                <div className="h-52 w-52 shrink-0">
                  {stats.fileTypes.length > 0 ? (
                    <ResponsiveContainer width="100%" height={208}>
                      <PieChart>
                        <Pie key="pie" data={stats.fileTypes} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={2} dataKey="value" nameKey="name">
                          {stats.fileTypes.map((entry, i) => <Cell key={`ft-${entry.name}`} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                        </Pie>
                        <Tooltip key="tooltip" content={<CustomTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : <p className="text-sm text-zinc-500 flex items-center justify-center h-full">No files.</p>}
                </div>
                <div className="flex flex-col gap-2">
                  {stats.fileTypes.map((type, i) => (
                    <div key={type.name} className="flex items-center gap-2 text-sm text-zinc-600">
                      <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                      {type.name} <span className="font-medium text-zinc-900">({type.value.toLocaleString()})</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Variables by Type */}
            <div className="glass-card rounded-2xl p-6">
              <h3 className="text-lg font-bold text-zinc-900 mb-1">Variables by Type</h3>
              <p className="text-sm text-zinc-500 mb-4">Breakdown of variable data types.</p>
              <div className="h-56">
                <ResponsiveContainer width="100%" height={224}>
                  <BarChart data={stats.variablesByType} layout="vertical">
                    <CartesianGrid key="grid" strokeDasharray="3 3" stroke="#27272a" />
                    <XAxis key="xaxis" type="number" tick={{ fontSize: 12, fill: '#71717a' }} />
                    <YAxis key="yaxis" dataKey="name" type="category" width={90} tick={{ fontSize: 12, fill: '#71717a' }} />
                    <Tooltip key="tooltip" content={<CustomTooltip />} />
                    <Bar key="bar" dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Entity Breakdown */}
          <div className="glass-card rounded-2xl p-6">
            <h3 className="text-lg font-bold text-zinc-900 mb-1">Entity Breakdown</h3>
            <p className="text-sm text-zinc-500 mb-4">Record counts per entity type across selected databases.</p>
            <div className="h-64">
              <ResponsiveContainer width="100%" height={256}>
                <BarChart data={stats.entityBreakdown}>
                  <CartesianGrid key="grid" strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis key="xaxis" dataKey="name" tick={{ fontSize: 12, fill: '#71717a' }} />
                  <YAxis key="yaxis" tick={{ fontSize: 12, fill: '#71717a' }} tickFormatter={v => new Intl.NumberFormat('en-US', { notation: 'compact' }).format(v)} />
                  <Tooltip key="tooltip" content={<CustomTooltip />} formatter={(v: number) => [v.toLocaleString(), 'Records']} />
                  <Bar key="bar" dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Per-DB comparison table */}
          <div className="glass-card rounded-2xl p-6">
            <h3 className="text-lg font-bold text-zinc-900 mb-4">Database Comparison</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-200">
                    {['Database', 'Variables', 'Entities', 'Rows', 'Storage', 'File Types'].map(h => (
                      <th key={h} className="text-left py-3 px-4 text-zinc-500 font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {MOCK_DATABASES.filter(db => selectedDbs.includes(db.id)).map(db => {
                    const d = MOCK_DB_DATA[db.id];
                    return (
                      <tr key={db.id} className="border-b border-zinc-100 hover:bg-zinc-50 transition-colors">
                        <td className="py-3 px-4 font-medium text-zinc-900">{db.name}</td>
                        <td className="py-3 px-4 text-zinc-700">{d.variables.toLocaleString()}</td>
                        <td className="py-3 px-4 text-zinc-700">{d.entities}</td>
                        <td className="py-3 px-4 text-zinc-700">{d.rows.toLocaleString()}</td>
                        <td className="py-3 px-4 text-zinc-700">{d.spaceGB >= 1024 ? `${(d.spaceGB / 1024).toFixed(1)} TB` : `${d.spaceGB} GB`}</td>
                        <td className="py-3 px-4">
                          <div className="flex flex-wrap gap-1.5">
                            {Object.entries(d.fileTypes).map(([type, count]) => (
                              <span key={type} className="text-xs bg-zinc-100 text-zinc-600 px-2 py-0.5 rounded-full">{type} ({count})</span>
                            ))}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}