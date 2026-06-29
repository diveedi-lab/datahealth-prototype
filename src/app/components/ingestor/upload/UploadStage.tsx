import React from 'react';
import { Table2, Images, BookOpen, Plus, X, Terminal, UploadCloud } from 'lucide-react';
import { useEditor } from '../state/EditorContext';
import { DEMO_FILES } from '../mock/mockData';
import type { FileBucket } from '../types';

const SECTIONS: { bucket: FileBucket; title: string; desc: string; icon: React.ComponentType<{ className?: string }>; cli?: boolean }[] = [
  {
    bucket: 'datafeed', icon: Table2,
    title: 'File tabulari (datafeed)',
    desc: 'CSV e tabelle che fanno da feed dati. Bulk upload dal browser.',
  },
  {
    bucket: 'file-collection', icon: Images,
    title: 'File-collection',
    desc: 'Set di file il cui contenuto è il centro (es. immagini), referenziati per nome nei metadati. Upload asincrono via tool CLI.',
    cli: true,
  },
  {
    bucket: 'context', icon: BookOpen,
    title: 'File di contesto',
    desc: 'Mapping, contesto clinico, eCRF annotato: file amministrativi e di comprensione della collection.',
  },
];

export function UploadStage() {
  const { state, dispatch } = useEditor();

  const addSamples = (bucket: FileBucket) => {
    dispatch({ type: 'ADD_FILES', files: DEMO_FILES.filter((f) => f.bucket === bucket) });
  };

  return (
    <div className="flex-1 overflow-auto">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex items-center gap-3 mb-1">
          <UploadCloud className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-bold text-zinc-900">Carica i file della collection</h2>
        </div>
        <p className="text-sm text-zinc-500 mb-6">
          Organizza i file in tre categorie. Quando hai almeno un file tabulare puoi proseguire al canvas.
        </p>

        <div className="space-y-4">
          {SECTIONS.map((sec) => {
            const files = state.uploads.filter((u) => u.bucket === sec.bucket);
            const Icon = sec.icon;
            return (
              <div key={sec.bucket} className="bg-white border border-zinc-200 rounded-2xl p-5">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-zinc-100 shrink-0">
                    <Icon className="w-5 h-5 text-zinc-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-zinc-900">{sec.title}</h3>
                      {sec.cli && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded bg-zinc-900 text-white">
                          <Terminal className="w-3 h-3" /> CLI
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-zinc-500 mt-0.5">{sec.desc}</p>
                  </div>
                  <button
                    onClick={() => addSamples(sec.bucket)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors shrink-0"
                  >
                    <Plus className="w-4 h-4" /> File di esempio
                  </button>
                </div>

                {/* dropzone / lista */}
                <div className="mt-4">
                  {files.length === 0 ? (
                    <div className="border-2 border-dashed border-zinc-200 rounded-xl py-8 flex flex-col items-center text-zinc-400">
                      <UploadCloud className="w-6 h-6 mb-1.5 opacity-60" />
                      <p className="text-xs">Trascina i file qui o usa "File di esempio"</p>
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      {files.map((f) => (
                        <div key={f.id} className="flex items-center gap-3 px-3 py-2 bg-zinc-50 rounded-lg">
                          <Icon className="w-4 h-4 text-zinc-400 shrink-0" />
                          <span className="font-mono text-xs text-zinc-800 truncate flex-1">{f.name}</span>
                          <span className="text-[11px] text-zinc-400 shrink-0">{f.meta}</span>
                          <span className="text-[11px] text-zinc-400 shrink-0 w-16 text-right">{f.sizeLabel}</span>
                          <button
                            onClick={() => dispatch({ type: 'REMOVE_FILE', fileId: f.id })}
                            className="p-0.5 text-zinc-400 hover:text-rose-500 rounded shrink-0"
                            aria-label="Rimuovi"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
