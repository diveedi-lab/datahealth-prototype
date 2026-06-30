// Componenti query condivisi — estratti da QueryTool per essere riusati
// nel workspace "Explore" (drill-down delle query) e altrove.
import React, { useState } from 'react';
import { Code2, Copy, Check } from 'lucide-react';

// ─── Tipi ───
export interface ResultTable {
  name: string;
  columns: string[];
  rows: Record<string, string | number>[];
  totalRows: number;
}

// ─── Badge per flag/severità/stato ───
export function FlagBadge({ value }: { value: string }) {
  const v = value.toLowerCase();
  let cls = 'bg-zinc-100 text-zinc-600 border-zinc-200';
  if (['active', 'normal', 'mild', 'unlikely', 'completed'].includes(v))
    cls = 'bg-emerald-50 text-emerald-600 border-emerald-200';
  else if (['high', 'moderate', 'possible', 'probable', 'elevated'].includes(v))
    cls = 'bg-amber-50 text-amber-600 border-amber-200';
  else if (['severe', 'critical', 'definite', 'low'].includes(v))
    cls = 'bg-red-50 text-red-600 border-red-200';
  return <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${cls}`}>{value}</span>;
}

// ─── Tabella dei risultati ───
export function ResultTableView({ table }: { table: ResultTable }) {
  return (
    <div className="flex-1 overflow-auto">
      <table className="w-full text-sm text-left whitespace-nowrap">
        <thead className="text-xs text-zinc-500 bg-zinc-50 sticky top-0 z-10">
          <tr>
            {table.columns.map((col) => (
              <th key={col} className="px-4 py-3 font-medium border-b border-zinc-200">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100">
          {table.rows.map((row, i) => (
            <tr key={i} className="hover:bg-zinc-50/80 transition-colors">
              {table.columns.map((col) => {
                const val = row[col];
                const isId = col.endsWith('_id') && typeof val === 'string' && (val as string).includes('-');
                const isFlag = col === 'flag' || col === 'severity' || col === 'status' || col === 'related';
                return (
                  <td key={col} className="px-4 py-2.5">
                    {val === '' || val == null ? (
                      <span className="text-zinc-300">∅</span>
                    ) : isId ? (
                      <span className="font-medium text-blue-600">{String(val)}</span>
                    ) : isFlag ? (
                      <FlagBadge value={String(val)} />
                    ) : (
                      <span className="text-zinc-700">{String(val)}</span>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Blocco SQL read-only (collassabile, copiabile) ───
export function SqlBlock({ sql, defaultOpen = true }: { sql: string; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  const [copied, setCopied] = useState(false);
  const statements = sql.split(';').filter((s) => s.trim()).length;

  const copy = () => {
    navigator.clipboard.writeText(sql);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="glass-card rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2.5">
        <button onClick={() => setOpen((o) => !o)} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <Code2 className="w-4 h-4 text-violet-500" />
          <span className="text-sm font-medium text-zinc-700">SQL generato</span>
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-violet-100 text-violet-600 font-medium">
            {statements} statement{statements !== 1 ? 's' : ''}
          </span>
        </button>
        <button
          onClick={copy}
          className="p-1.5 text-zinc-400 hover:text-zinc-600 rounded-md hover:bg-zinc-100 transition-colors"
          title="Copia SQL"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
        </button>
      </div>
      {open && (
        <pre className="border-t border-zinc-100 p-4 text-[12.5px] leading-relaxed text-zinc-700 bg-zinc-50 overflow-x-auto font-mono">
          {sql}
        </pre>
      )}
    </div>
  );
}
