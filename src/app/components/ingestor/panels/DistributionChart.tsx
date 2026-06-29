import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import type { Distribution } from '../types';

const compact = (v: number) => new Intl.NumberFormat('it-IT', { notation: 'compact' }).format(v);

export function DistributionChart({ distribution }: { distribution: Distribution }) {
  if (distribution.kind === 'none') {
    return <p className="text-xs text-zinc-400 py-4 text-center">Identificatore univoco — nessuna distribuzione.</p>;
  }

  let data: { name: string; count: number }[] = [];
  if (distribution.kind === 'categorical') data = distribution.categories.map((c) => ({ name: c.name, count: c.count }));
  else if (distribution.kind === 'numeric') data = distribution.bins.map((b) => ({ name: b.range, count: b.count }));
  else if (distribution.kind === 'date') data = distribution.bins.map((b) => ({ name: b.name, count: b.count }));
  else if (distribution.kind === 'boolean') data = [
    { name: 'Y', count: distribution.trueCount }, { name: 'N', count: distribution.falseCount },
  ];

  const many = data.length > 5;

  return (
    <div className="h-48">
      <ResponsiveContainer width="100%" height={192}>
        <BarChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f1f3" vertical={false} />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 10, fill: '#71717a' }}
            interval={0}
            angle={many ? -20 : 0}
            textAnchor={many ? 'end' : 'middle'}
            height={many ? 42 : 22}
          />
          <YAxis tick={{ fontSize: 10, fill: '#71717a' }} width={38} tickFormatter={compact} />
          <Tooltip
            formatter={(value: number) => [value.toLocaleString('it-IT'), 'Conteggio']}
            contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e4e4e7' }}
          />
          <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
