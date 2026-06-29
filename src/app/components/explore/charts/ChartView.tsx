import React from 'react';
import {
  ResponsiveContainer, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, Tooltip, Legend,
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
  const data = spec.data ?? [];
  const rows = spec.rows ?? [];
  const series = spec.series ?? [];
  const points = spec.points ?? [];

  // KPI
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

  // Cross-tab → tabella matrice (in mini ripiega su grouped bars)
  if (spec.chartType === 'crosstab' && !mini) {
    return (
      <div className="overflow-auto" style={{ maxHeight: height }}>
        <table className="w-full text-xs border border-zinc-200 rounded-lg overflow-hidden">
          <thead>
            <tr className="bg-zinc-50">
              <th className="text-left font-medium text-zinc-500 px-2.5 py-1.5 border-b border-zinc-200"> </th>
              {series.map((s) => (
                <th key={s} className="text-right font-medium text-zinc-600 px-2.5 py-1.5 border-b border-zinc-200">{s}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={String(r.name)} className="even:bg-zinc-50/50">
                <td className="px-2.5 py-1.5 font-medium text-zinc-700 border-b border-zinc-100">{r.name}</td>
                {series.map((s) => (
                  <td key={s} className="px-2.5 py-1.5 text-right tabular-nums text-zinc-700 border-b border-zinc-100">
                    {typeof r[s] === 'number' ? (r[s] as number).toLocaleString('it-IT') : String(r[s] ?? 0)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  // Pie
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

  // Scatter / correlazione
  if (spec.chartType === 'scatter') {
    return (
      <div style={{ height }}>
        <ResponsiveContainer width="100%" height={height}>
          <ScatterChart margin={{ top: 8, right: 12, left: mini ? -28 : -4, bottom: mini ? 0 : 14 }}>
            {!mini && <CartesianGrid strokeDasharray="3 3" stroke="#f1f1f3" />}
            <XAxis
              type="number" dataKey="x" name={spec.xLabel} tick={{ fontSize: 10, fill: '#71717a' }} hide={mini}
              label={mini ? undefined : { value: spec.xLabel, position: 'insideBottom', offset: -6, fontSize: 11, fill: '#71717a' }}
            />
            <YAxis type="number" dataKey="y" name={spec.yLabel} tick={{ fontSize: 10, fill: '#71717a' }} width={40} hide={mini} />
            <ZAxis range={[mini ? 12 : 40, mini ? 12 : 60]} />
            {!mini && <Tooltip cursor={{ strokeDasharray: '3 3' }} content={<CustomTooltip />} />}
            <Scatter data={points} fill="#3b82f6" fillOpacity={0.7} />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    );
  }

  // Multi-serie: grouped / stacked / multiline / (crosstab mini)
  const isMulti = series.length > 0 && rows.length > 0
    && (spec.chartType === 'grouped' || spec.chartType === 'stacked' || spec.chartType === 'multiline' || spec.chartType === 'crosstab');
  if (isMulti) {
    if (spec.chartType === 'multiline') {
      return (
        <div style={{ height }}>
          <ResponsiveContainer width="100%" height={height}>
            <LineChart data={rows} margin={{ top: 8, right: 8, left: mini ? -28 : -12, bottom: 0 }}>
              {!mini && <CartesianGrid strokeDasharray="3 3" stroke="#f1f1f3" vertical={false} />}
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#71717a' }} hide={mini} />
              <YAxis tick={{ fontSize: 10, fill: '#71717a' }} width={38} tickFormatter={compact} hide={mini} />
              {!mini && <Tooltip content={<CustomTooltip />} />}
              {!mini && <Legend wrapperStyle={{ fontSize: 11 }} />}
              {series.map((s, i) => (
                <Line key={s} type="monotone" dataKey={s} stroke={PIE_COLORS[i % PIE_COLORS.length]} strokeWidth={2} dot={{ r: mini ? 1.5 : 3 }} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      );
    }
    const stacked = spec.stacked || spec.chartType === 'stacked';
    return (
      <div style={{ height }}>
        <ResponsiveContainer width="100%" height={height}>
          <BarChart data={rows} margin={{ top: 8, right: 8, left: mini ? -28 : -12, bottom: 0 }}>
            {!mini && <CartesianGrid strokeDasharray="3 3" stroke="#f1f1f3" vertical={false} />}
            <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#71717a' }} interval={0} hide={mini} />
            <YAxis tick={{ fontSize: 10, fill: '#71717a' }} width={38} tickFormatter={compact} hide={mini} />
            {!mini && <Tooltip content={<CustomTooltip />} />}
            {!mini && <Legend wrapperStyle={{ fontSize: 11 }} />}
            {series.map((s, i) => (
              <Bar key={s} dataKey={s} stackId={stacked ? 'a' : undefined} fill={PIE_COLORS[i % PIE_COLORS.length]} radius={stacked ? [0, 0, 0, 0] : [3, 3, 0, 0]} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  // Single line
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

  // Single bar / histogram (default)
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
