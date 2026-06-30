import React, { useState } from 'react';
import {
  X, ChevronsUpDown, ChevronLeft, ChevronRight, Search, BarChart3, Check,
} from 'lucide-react';
import type { Artifact, ArtifactRef, ChartType, StructureRequest } from '../types';
import { ChartArtifactView } from './ChartArtifactView';
import { QueryArtifactView } from './QueryArtifactView';

export function ArtifactPanel({
  list, active, width, fullScreen, onStartResize, onSelect, onClose,
  sourceLabel, onChangeType, onVisualize, onSave, onOpenStructure,
}: {
  list: ArtifactRef[];
  active: Artifact;
  width: number;
  fullScreen?: boolean;
  onStartResize: (e: React.MouseEvent) => void;
  onSelect: (id: string) => void;
  onClose: () => void;
  sourceLabel: string;
  onChangeType: (type: ChartType) => void;
  onVisualize: (variable: string) => void;
  onSave: () => void;
  onOpenStructure: (req: StructureRequest) => void;
}) {
  const [open, setOpen] = useState(false);
  const idx = list.findIndex((a) => a.id === active.id);
  const go = (delta: number) => {
    const next = list[idx + delta];
    if (next) onSelect(next.id);
  };

  return (
    <aside
      className={`flex animate-in slide-in-from-right duration-200 ${fullScreen ? 'absolute inset-0 z-30' : 'relative shrink-0 h-full'}`}
      style={fullScreen ? undefined : { width }}
    >
      {!fullScreen && (
        <div onMouseDown={onStartResize} className="w-1.5 shrink-0 cursor-col-resize bg-transparent hover:bg-blue-200 transition-colors" title="Trascina per ridimensionare" />
      )}
      <div className="flex-1 min-w-0 flex flex-col glass">
        {/* header: switcher + nav + close */}
        <div className="h-11 shrink-0 flex items-center gap-1.5 px-2.5 border-b border-zinc-200 relative">
          <button
            onClick={() => setOpen((o) => !o)}
            className="flex items-center gap-1.5 min-w-0 flex-1 px-2 py-1 rounded-lg hover:bg-zinc-50"
          >
            <span className={`w-5 h-5 rounded flex items-center justify-center shrink-0 ${active.kind === 'chart' ? 'bg-violet-100 text-violet-600' : 'bg-blue-100 text-blue-600'}`}>
              {active.kind === 'chart' ? <BarChart3 className="w-3 h-3" /> : <Search className="w-3 h-3" />}
            </span>
            <span className="text-sm font-semibold text-zinc-800 truncate">{active.title}</span>
            <ChevronsUpDown className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
          </button>

          <div className="flex items-center gap-0.5 shrink-0">
            <button onClick={() => go(-1)} disabled={idx <= 0} className="p-1 text-zinc-400 hover:text-zinc-700 disabled:opacity-30 rounded"><ChevronLeft className="w-4 h-4" /></button>
            <span className="text-[10px] text-zinc-400 tabular-nums w-9 text-center">{idx + 1}/{list.length}</span>
            <button onClick={() => go(1)} disabled={idx >= list.length - 1} className="p-1 text-zinc-400 hover:text-zinc-700 disabled:opacity-30 rounded"><ChevronRight className="w-4 h-4" /></button>
          </div>
          <button onClick={onClose} className="p-1 text-zinc-400 hover:text-zinc-700 rounded shrink-0" aria-label="Chiudi pannello"><X className="w-4 h-4" /></button>

          {open && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
              <div className="absolute left-2.5 top-11 w-72 max-h-80 overflow-auto glass rounded-xl z-40 p-1.5">
                {list.length === 0 && <p className="text-xs text-zinc-400 px-2 py-2">Nessun artefatto.</p>}
                {list.map((a) => (
                  <button
                    key={a.id}
                    onClick={() => { onSelect(a.id); setOpen(false); }}
                    className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-left transition-colors ${a.id === active.id ? 'bg-blue-50' : 'hover:bg-zinc-50'}`}
                  >
                    <span className={`w-5 h-5 rounded flex items-center justify-center shrink-0 ${a.kind === 'chart' ? 'bg-violet-100 text-violet-600' : 'bg-blue-100 text-blue-600'}`}>
                      {a.kind === 'chart' ? <BarChart3 className="w-3 h-3" /> : <Search className="w-3 h-3" />}
                    </span>
                    <span className="text-xs text-zinc-700 truncate flex-1">{a.title}</span>
                    {a.id === active.id && <Check className="w-3.5 h-3.5 text-blue-500 shrink-0" />}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* body */}
        <div className="flex-1 min-h-0">
          {active.kind === 'chart' ? (
            <ChartArtifactView chart={active.chart} sourceLabel={sourceLabel} onChangeType={onChangeType} />
          ) : (
            <QueryArtifactView
              query={active.query}
              saved={active.saved}
              onVisualize={onVisualize}
              onSave={onSave}
              onOpenStructure={() => onOpenStructure({ mode: 'query', queryId: active.id })}
            />
          )}
        </div>
      </div>
    </aside>
  );
}
