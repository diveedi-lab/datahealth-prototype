import React, { useState } from 'react';
import {
  Table2, Images, BookOpen, Plus, X, Terminal, PanelLeftClose, PanelLeftOpen, Database, FileUp,
} from 'lucide-react';
import { useEditor } from './state/EditorContext';
import { DEMO_FILES } from './mock/mockData';
import type { FileBucket } from './types';

const GROUPS: { bucket: FileBucket; title: string; icon: React.ComponentType<{ className?: string }>; cli?: boolean }[] = [
  { bucket: 'datafeed', title: 'Tabelle (datafeed)', icon: Table2 },
  { bucket: 'file-collection', title: 'File-collection', icon: Images, cli: true },
  { bucket: 'context', title: 'File di contesto', icon: BookOpen },
];

export function SourceDataPanel({
  selectedId, onSelect,
}: {
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}) {
  const { state, dispatch } = useEditor();
  const [collapsed, setCollapsed] = useState(false);

  const addSamples = (bucket: FileBucket) =>
    dispatch({ type: 'ADD_FILES', files: DEMO_FILES.filter((f) => f.bucket === bucket) });

  if (collapsed) {
    return (
      <div className="w-12 shrink-0 border-r border-zinc-200 bg-white flex flex-col items-center py-3 gap-3">
        <button onClick={() => setCollapsed(false)} className="p-1.5 text-zinc-500 hover:bg-zinc-100 rounded-lg" aria-label="Apri Source data">
          <PanelLeftOpen className="w-4 h-4" />
        </button>
        <Database className="w-4 h-4 text-zinc-300" />
        <span className="text-[10px] text-zinc-400 [writing-mode:vertical-rl] rotate-180 mt-1">Source data</span>
      </div>
    );
  }

  return (
    <div className="w-72 shrink-0 border-r border-zinc-200 bg-white flex flex-col">
      <div className="h-11 shrink-0 flex items-center justify-between px-3 border-b border-zinc-200">
        <div className="flex items-center gap-2">
          <FileUp className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-semibold text-zinc-800">Source data</span>
        </div>
        <button onClick={() => setCollapsed(true)} className="p-1 text-zinc-400 hover:bg-zinc-100 rounded-lg" aria-label="Comprimi">
          <PanelLeftClose className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-auto p-3 space-y-4">
        {GROUPS.map((g) => {
          const files = state.uploads.filter((u) => u.bucket === g.bucket);
          const Icon = g.icon;
          return (
            <div key={g.bucket}>
              <div className="flex items-center gap-1.5 mb-1.5">
                <Icon className="w-3.5 h-3.5 text-zinc-400" />
                <span className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">{g.title}</span>
                {g.cli && (
                  <span className="inline-flex items-center gap-0.5 text-[9px] font-medium px-1 py-0.5 rounded bg-zinc-900 text-white">
                    <Terminal className="w-2.5 h-2.5" /> CLI
                  </span>
                )}
                <span className="ml-auto text-[10px] text-zinc-400">{files.length}</span>
                <button
                  onClick={() => addSamples(g.bucket)}
                  className="p-0.5 text-blue-600 hover:bg-blue-50 rounded"
                  aria-label="Aggiungi file di esempio"
                  title="Aggiungi file di esempio"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {files.length === 0 ? (
                <div className="border border-dashed border-zinc-200 rounded-lg py-3 px-2 text-center text-[11px] text-zinc-400">
                  Nessun file — usa <span className="text-blue-600">+</span>
                </div>
              ) : (
                <div className="space-y-1">
                  {files.map((f) => (
                    <div
                      key={f.id}
                      onClick={() => onSelect(f.id)}
                      className={`group flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer transition-colors ${
                        selectedId === f.id ? 'bg-blue-50 ring-1 ring-blue-200' : 'hover:bg-zinc-50'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="font-mono text-xs text-zinc-800 truncate">{f.name}</p>
                        <p className="text-[10px] text-zinc-400 truncate">{f.meta} · {f.sizeLabel}</p>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); dispatch({ type: 'REMOVE_FILE', fileId: f.id }); if (selectedId === f.id) onSelect(null); }}
                        className="p-0.5 text-zinc-300 hover:text-rose-500 rounded shrink-0 opacity-0 group-hover:opacity-100"
                        aria-label="Rimuovi"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        <p className="text-[10px] text-zinc-400 leading-relaxed pt-2 border-t border-zinc-100">
          Le tabelle e le file-collection compaiono come nodi nel canvas. I file di contesto restano qui
          come supporto e non vengono mostrati nel grafo.
        </p>
      </div>
    </div>
  );
}
