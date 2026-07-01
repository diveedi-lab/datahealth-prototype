import React from 'react';
import { CloudUpload, Table2, ArrowRight } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';

// Primo step della creazione: ingestion (nuovo DB) oppure collezione derivata (query).
export function NewCollectionChooser({
  open, onOpenChange, onIngestion, onDerived,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onIngestion: () => void;
  onDerived: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Nuova collection</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-zinc-500 -mt-1">Come vuoi creare la collection?</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
          <button
            onClick={() => { onOpenChange(false); onIngestion(); }}
            className="group text-left rounded-2xl border border-zinc-200 bg-white/60 p-4 hover:border-blue-300 hover:shadow-md transition-all"
          >
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center mb-4">
              <CloudUpload className="w-6 h-6" />
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-zinc-900">Ingestion</p>
              <ArrowRight className="w-4 h-4 text-zinc-300 group-hover:text-blue-600 transition-colors" />
            </div>
            <p className="text-[12.5px] text-zinc-500 mt-1 leading-relaxed">Carica file/DB e modella il flusso di standardizzazione e conversione.</p>
          </button>

          <button
            onClick={() => { onOpenChange(false); onDerived(); }}
            className="group text-left rounded-2xl border border-zinc-200 bg-white/60 p-4 hover:border-emerald-300 hover:shadow-md transition-all"
          >
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white flex items-center justify-center mb-4">
              <Table2 className="w-6 h-6" />
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-zinc-900">Collezione derivata</p>
              <ArrowRight className="w-4 h-4 text-zinc-300 group-hover:text-emerald-600 transition-colors" />
            </div>
            <p className="text-[12.5px] text-zinc-500 mt-1 leading-relaxed">Definisci una query su collection esistenti e salvala come nuova collection condivisibile.</p>
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
