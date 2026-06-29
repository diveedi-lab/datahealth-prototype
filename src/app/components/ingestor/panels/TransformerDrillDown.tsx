import React from 'react';
import {
  X, Sparkles, Wand2, ArrowRight, CheckCircle2, AlertTriangle, XCircle, RotateCcw,
} from 'lucide-react';
import { useEditor } from '../state/EditorContext';
import type { Transformer, ValidationStatus } from '../types';

export function TransformerDrillDown({
  transformer, chatOpen, onToggleChat, onClose,
}: {
  transformer: Transformer;
  chatOpen: boolean;
  onToggleChat: () => void;
  onClose: () => void;
}) {
  const { state, dispatch } = useEditor();
  const t = transformer;
  const fileName = (id: string) => state.nodes.find((n) => n.id === id)?.data.label ?? id;
  const targetName = (id: string) => state.targetTables.find((x) => x.id === id)?.name ?? id;

  const setStatus = (status: ValidationStatus) => dispatch({ type: 'VALIDATE_TRANSFORMER', id: t.id, status });

  return (
    <div className="flex flex-col h-full bg-white border-l border-zinc-200">
      <div className="flex items-start gap-2 px-4 py-3 border-b border-zinc-200 shrink-0">
        <Wand2 className="w-4 h-4 text-indigo-500 mt-0.5 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-zinc-900 truncate">{t.title}</p>
          <p className="text-xs text-zinc-400">transformer · {t.kind}</p>
        </div>
        <button
          onClick={onToggleChat}
          className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-lg shrink-0 border transition-colors ${
            chatOpen ? 'bg-violet-600 text-white border-violet-600' : 'text-violet-700 border-violet-200 hover:bg-violet-50'
          }`}
          title="Chat AI su questo transformer"
        >
          <Sparkles className="w-3.5 h-3.5" /> AI
        </button>
        <button onClick={onClose} className="p-1 text-zinc-400 hover:text-zinc-700 rounded shrink-0" aria-label="Chiudi">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-auto p-4 space-y-4">
        <StatusPill status={t.validation} />

        <Section title="Descrizione">
          <p className="text-xs text-zinc-600 leading-relaxed">{t.description}</p>
        </Section>

        {t.rowEffect && (
          <div className="flex items-center gap-2 text-xs bg-zinc-50 rounded-lg px-3 py-2">
            <span className="font-semibold text-zinc-800">{t.rowEffect.inputRows.toLocaleString('it-IT')}</span>
            <ArrowRight className="w-3.5 h-3.5 text-zinc-400" />
            <span className="font-semibold text-zinc-800">{t.rowEffect.outputRows.toLocaleString('it-IT')}</span>
            <span className="text-zinc-400">righe</span>
            {t.rowEffect.note && <span className="text-zinc-400 ml-1 truncate">· {t.rowEffect.note}</span>}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <Section title={`Input (${t.inputs.length})`}>
            <div className="space-y-2">
              {t.inputs.map((inp) => (
                <div key={inp.fileId} className="bg-zinc-50 rounded-lg p-2">
                  <p className="font-mono text-[11px] font-semibold text-zinc-800">{fileName(inp.fileId)}</p>
                  <p className="text-[10px] text-zinc-500 mt-0.5">{inp.columns.join(', ')}</p>
                </div>
              ))}
            </div>
          </Section>
          <Section title={`Output (${t.outputs.length})`}>
            <div className="space-y-2">
              {t.outputs.map((out) => (
                <div key={out.targetId} className="bg-zinc-50 rounded-lg p-2">
                  <p className="font-mono text-[11px] font-semibold text-zinc-800">{targetName(out.targetId)}</p>
                  <p className="text-[10px] text-zinc-500 mt-0.5">{out.columns.join(', ')}</p>
                </div>
              ))}
            </div>
          </Section>
        </div>

        <Section title={`Codice (${t.codeLang})`}>
          <pre className="text-[11px] text-zinc-700 bg-zinc-900/[0.03] border border-zinc-200 rounded-lg p-3 whitespace-pre-wrap font-mono leading-relaxed overflow-auto">{t.code}</pre>
        </Section>

        {t.validationMessage && (
          <div className="flex items-start gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            <span>{t.validationMessage}</span>
          </div>
        )}
      </div>

      {/* azioni di validazione */}
      <div className="shrink-0 border-t border-zinc-200 p-3 flex items-center gap-2">
        <button
          onClick={() => setStatus('validated')}
          className={`flex-1 flex items-center justify-center gap-1.5 text-xs font-medium py-2 rounded-lg transition-colors ${
            t.validation === 'validated' ? 'bg-emerald-600 text-white' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" /> Valida
        </button>
        <button
          onClick={() => setStatus('needs-review')}
          className={`flex items-center justify-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg transition-colors ${
            t.validation === 'needs-review' ? 'bg-orange-500 text-white' : 'bg-orange-50 text-orange-700 hover:bg-orange-100'
          }`}
          title="Da rivedere"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
        <button
          onClick={() => setStatus('rejected')}
          className={`flex items-center justify-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg transition-colors ${
            t.validation === 'rejected' ? 'bg-rose-600 text-white' : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
          }`}
          title="Rifiuta"
        >
          <XCircle className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: ValidationStatus }) {
  const map: Record<ValidationStatus, { label: string; cls: string; Icon: React.ComponentType<{ className?: string }> }> = {
    pending: { label: 'Da validare', cls: 'bg-amber-50 text-amber-700', Icon: AlertTriangle },
    validated: { label: 'Validato', cls: 'bg-emerald-50 text-emerald-700', Icon: CheckCircle2 },
    rejected: { label: 'Rifiutato', cls: 'bg-rose-50 text-rose-700', Icon: XCircle },
    'needs-review': { label: 'Da rivedere', cls: 'bg-orange-50 text-orange-700', Icon: RotateCcw },
  };
  const s = map[status];
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-lg ${s.cls}`}>
      <s.Icon className="w-3.5 h-3.5" /> {s.label}
    </span>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500 mb-1.5">{title}</p>
      {children}
    </div>
  );
}
