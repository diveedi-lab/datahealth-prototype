import React from 'react';
import { ArrowLeft, Compass, Table2, Network, ArrowRight } from 'lucide-react';

export type ExploreMode = 'chat' | 'query' | 'graphical';

const MODES: {
  key: ExploreMode; title: string; desc: string;
  Icon: React.ComponentType<{ className?: string }>; gradient: string;
}[] = [
  { key: 'chat', title: 'Chat', desc: 'Chatta con i dati: l’AI crea query e grafici mentre esplori. Ideale per partire da una domanda.', Icon: Compass, gradient: 'from-violet-500 to-violet-600' },
  { key: 'query', title: 'Query assistite', desc: 'Scrivi tu la query (con assist AI per l’SQL), esegui e ispeziona i risultati. Query-centrico.', Icon: Table2, gradient: 'from-blue-500 to-blue-600' },
  { key: 'graphical', title: 'Data Explorer', desc: 'Naviga struttura e dati su React Flow, con anteprima dei file. Usabile anche stand-alone.', Icon: Network, gradient: 'from-emerald-500 to-emerald-600' },
];

export function ModeChooser({
  onPick, onExit,
}: {
  onPick: (mode: ExploreMode) => void;
  onExit: () => void;
}) {
  return (
    <div className="h-screen w-screen flex flex-col app-backdrop overflow-hidden">
      <header className="h-14 shrink-0 flex items-center px-4">
        <button onClick={onExit} className="flex items-center gap-1.5 px-2.5 py-1.5 text-sm text-zinc-500 hover:text-zinc-800 hover:bg-zinc-500/10 rounded-lg transition-colors">
          <ArrowLeft className="w-4 h-4" /> Chiudi
        </button>
      </header>

      <div className="flex-1 min-h-0 overflow-auto">
        <div className="max-w-4xl mx-auto w-full px-6 py-10">
          <h1 className="text-2xl font-bold text-zinc-900">Come vuoi esplorare i dati?</h1>
          <p className="text-sm text-zinc-500 mt-1">Tre metodi complementari — puoi passare dall’uno all’altro (dai risultati apri l’esplorazione grafica).</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            {MODES.map((m) => (
              <button
                key={m.key}
                onClick={() => onPick(m.key)}
                className="group text-left glass-card rounded-2xl p-5 hover:shadow-lg transition-all"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${m.gradient} text-white flex items-center justify-center mb-6`}>
                  <m.Icon className="w-6 h-6" />
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-base font-semibold text-zinc-900">{m.title}</p>
                  <ArrowRight className="w-4 h-4 text-zinc-300 group-hover:text-zinc-600 group-hover:translate-x-0.5 transition-all" />
                </div>
                <p className="text-[13px] text-zinc-500 mt-1.5 leading-relaxed">{m.desc}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
