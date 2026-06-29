import React, { useState } from 'react';
import {
  X, Sparkles, Database, Table2, Key, ArrowRight, Hash, Type, Calendar,
  ToggleLeft, List as ListIcon, BarChart3,
} from 'lucide-react';
import type { ExploreCollection, ColumnType } from '../types';
import type { VarType } from '../../ingestor/types';
import { DistributionChart } from '../../ingestor/panels/DistributionChart';

const TYPE_ICON: Record<string, React.ReactNode> = {
  id: <Key className="w-3.5 h-3.5 text-amber-500" />,
  string: <Type className="w-3.5 h-3.5 text-blue-500" />,
  integer: <Hash className="w-3.5 h-3.5 text-emerald-500" />,
  float: <Hash className="w-3.5 h-3.5 text-teal-500" />,
  date: <Calendar className="w-3.5 h-3.5 text-violet-500" />,
  boolean: <ToggleLeft className="w-3.5 h-3.5 text-pink-500" />,
  categorical: <ListIcon className="w-3.5 h-3.5 text-indigo-500" />,
};

type Tab = 'tables' | 'variables';

export function CollectionDrillDown({
  collection, chatOpen, onToggleChat, onClose, onVisualize,
}: {
  collection: ExploreCollection;
  chatOpen: boolean;
  onToggleChat: () => void;
  onClose: () => void;
  onVisualize: (variable: string) => void;
}) {
  const [tab, setTab] = useState<Tab>('tables');
  const [openTable, setOpenTable] = useState<string | null>(collection.tables[0]?.name ?? null);
  const [selectedVar, setSelectedVar] = useState<string>(collection.richVariables[0]?.name ?? '');

  const current = collection.richVariables.find((v) => v.name === selectedVar) ?? collection.richVariables[0];

  return (
    <div className="flex flex-col h-full bg-white border-l border-zinc-200">
      <div className="flex items-start gap-2 px-4 py-3 border-b border-zinc-200 shrink-0">
        <span className="w-2.5 h-2.5 rounded-full mt-1.5 shrink-0" style={{ background: collection.color }} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-zinc-900 truncate flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5 text-zinc-400" />{collection.name}
          </p>
          <p className="text-xs text-zinc-400 truncate">{collection.tableCount} tabelle · {collection.variableCount} variabili · {collection.rowsLabel} righe</p>
        </div>
        <button
          onClick={onToggleChat}
          className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-lg shrink-0 border transition-colors ${chatOpen ? 'bg-violet-600 text-white border-violet-600' : 'text-violet-700 border-violet-200 hover:bg-violet-50'}`}
        >
          <Sparkles className="w-3.5 h-3.5" /> AI
        </button>
        <button onClick={onClose} className="p-1 text-zinc-400 hover:text-zinc-700 rounded shrink-0"><X className="w-4 h-4" /></button>
      </div>

      <div className="flex gap-1 m-3 mb-2 bg-zinc-100 p-0.5 rounded-lg">
        {([['tables', 'Tabelle'], ['variables', 'Variabili']] as [Tab, string][]).map(([id, label]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex-1 text-xs py-1.5 rounded-md transition-colors ${tab === id ? 'bg-white shadow-sm text-zinc-900 font-medium' : 'text-zinc-500 hover:text-zinc-700'}`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-auto min-h-0 px-3 pb-3">
        {tab === 'tables' && (
          <div className="space-y-1.5">
            {collection.tables.map((t) => {
              const open = openTable === t.name;
              return (
                <div key={t.name} className="border border-zinc-200 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setOpenTable(open ? null : t.name)}
                    className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-zinc-50"
                  >
                    <Table2 className="w-3.5 h-3.5 shrink-0" style={{ color: t.color }} />
                    <span className="text-xs font-semibold text-zinc-800 flex-1 truncate">{t.label}</span>
                    <span className="text-[10px] text-zinc-400">{t.columns.length} col · {t.rowCount.toLocaleString('it-IT')} righe</span>
                  </button>
                  {open && (
                    <div className="border-t border-zinc-100 divide-y divide-zinc-50">
                      {t.columns.map((c) => (
                        <div key={c.name} className="flex items-center gap-2 px-3 py-1.5">
                          {TYPE_ICON[c.type as ColumnType] ?? <Hash className="w-3.5 h-3.5 text-zinc-400" />}
                          <span className="font-mono text-[11px] text-zinc-700 flex-1 truncate">{c.name}</span>
                          {c.pk && <span className="text-[9px] font-medium px-1 py-0.5 rounded bg-amber-100 text-amber-700">PK</span>}
                          {c.fk && (
                            <span className="text-[9px] font-medium px-1 py-0.5 rounded bg-blue-100 text-blue-700 flex items-center gap-0.5">
                              FK <ArrowRight className="w-2 h-2" /> {c.fk.table}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {tab === 'variables' && (
          collection.richVariables.length === 0 ? (
            <p className="text-xs text-zinc-400 text-center py-8">
              Distribuzioni dettagliate non disponibili per questa collection (demo). Prova con CARDIO-2024.
            </p>
          ) : (
            <div>
              <div className="flex flex-wrap gap-1.5 mb-3">
                {collection.richVariables.map((v) => (
                  <button
                    key={v.name}
                    onClick={() => setSelectedVar(v.name)}
                    className={`text-[11px] px-2 py-1 rounded-lg border flex items-center gap-1 transition-colors ${v.name === current?.name ? 'bg-blue-50 border-blue-200 text-blue-700' : 'border-zinc-200 text-zinc-600 hover:bg-zinc-50'}`}
                  >
                    {TYPE_ICON[v.variable.type as VarType]} {v.variable.label}
                  </button>
                ))}
              </div>

              {current && (
                <div className="border border-zinc-200 rounded-xl p-3">
                  <div className="flex items-center gap-2 mb-1">
                    {TYPE_ICON[current.variable.type as VarType]}
                    <span className="font-mono text-sm font-semibold text-zinc-900">{current.name}</span>
                    <span className="text-[10px] uppercase tracking-wide text-zinc-400">{current.variable.type}</span>
                    <button
                      onClick={() => onVisualize(current.name)}
                      className="ml-auto flex items-center gap-1 text-[11px] font-medium text-violet-700 border border-violet-200 hover:bg-violet-50 px-2 py-1 rounded-lg"
                    >
                      <BarChart3 className="w-3 h-3" /> Visualizza
                    </button>
                  </div>
                  <p className="text-xs text-zinc-500 mb-2">{current.variable.description}</p>
                  <DistributionChart distribution={current.variable.stats!.distribution} />
                </div>
              )}
            </div>
          )
        )}
      </div>
    </div>
  );
}
