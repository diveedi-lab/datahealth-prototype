import React from 'react';
import {
  ResponsiveContainer, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip,
} from 'recharts';
import type { ChartSpec } from '../types';

export const PIE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#6366f1', '#ec4899', '#14b8a6', '#f43f5e'];
const compact = (v: number) => new Intl.NumberFormat('it-IT', { notation: 'compact' }).format(v);

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-zinc-200 rounded-lg shadow-lg px-3 py-2 text-xs">
      {label && <p className="text-zinc-500 mb-1">{label}</p>}
      {payload.map((p: any, i: number) => (
        <div key={i} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: p.color || p.fill }} />
          <span className="text-zinc-700">
            {p.name}: <span className="font-medium">{typeof p.value === 'number' ? p.value.toLocaleString('it-IT') : p.value}</span>
          </span>
        </div>
      ))}
    </div>
  );
}

export function ChartView({ spec, height = 200, mini = false }: { spec: ChartSpec; height?: number; mini?: boolean }) {
  const data = spec.data;

  if (spec.chartType === 'kpi') {
    const k = spec.kpi;
    return (
      <div className="flex flex-col items-center justify-center" style={{ height }}>
        <p className="text-3xl font-bold text-zinc-900 tabular-nums">{k?.value ?? '—'}</p>
        <p className="text-xs text-zinc-500 mt-1">{k?.label}</p>
        {k?.sub && <p className="text-[11px] text-zinc-400 mt-0.5">{k.sub}</p>}
      </div>
    );
  }

  if (spec.chartType === 'pie') {
    return (
      <div style={{ height }}>
        <ResponsiveContainer width="100%" height={height}>
          <PieChart>
            <Pie
              data={data} cx="50%" cy="50%"
              innerRadius={mini ? 18 : 50} outerRadius={mini ? 32 : 80}
              paddingAngle={2} dataKey="value" nameKey="name"
            >
              {data.map((e, i) => <Cell key={e.name} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
            </Pie>
            {!mini && <Tooltip content={<CustomTooltip />} />}
          </PieChart>
        </ResponsiveContainer>
      </div>
    );
  }

  if (spec.chartType === 'line') {
    return (
      <div style={{ height }}>
        <ResponsiveContainer width="100%" height={height}>
          <LineChart data={data} margin={{ top: 8, right: 8, left: mini ? -28 : -12, bottom: 0 }}>
            {!mini && <CartesianGrid strokeDasharray="3 3" stroke="#f1f1f3" vertical={false} />}
            <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#71717a' }} hide={mini} />
            <YAxis tick={{ fontSize: 10, fill: '#71717a' }} width={38} tickFormatter={compact} hide={mini} />
            {!mini && <Tooltip content={<CustomTooltip />} />}
            <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} dot={{ r: mini ? 2 : 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  }

  // bar / histogram
  const many = data.length > 5;
  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} margin={{ top: 8, right: 8, left: mini ? -28 : -12, bottom: 0 }}>
          {!mini && <CartesianGrid strokeDasharray="3 3" stroke="#f1f1f3" vertical={false} />}
          <XAxis
            dataKey="name" tick={{ fontSize: 10, fill: '#71717a' }} interval={0}
            angle={many && !mini ? -20 : 0} textAnchor={many && !mini ? 'end' : 'middle'}
            height={many && !mini ? 42 : 22} hide={mini}
          />
          <YAxis tick={{ fontSize: 10, fill: '#71717a' }} width={38} tickFormatter={compact} hide={mini} />
          {!mini && <Tooltip content={<CustomTooltip />} />}
          <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
