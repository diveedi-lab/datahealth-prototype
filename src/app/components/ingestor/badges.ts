import type { FlowStage } from './types';

// Mappa lo stadio del flusso a un badge mostrato nella lista Collections (DB.tsx)
export const STAGE_BADGE: Record<FlowStage, { label: string; cls: string }> = {
  upload: { label: 'Draft', cls: 'bg-zinc-100 text-zinc-600' },
  base: { label: 'Draft', cls: 'bg-zinc-100 text-zinc-600' },
  analyzed: { label: 'Analyzed', cls: 'bg-blue-50 text-blue-600' },
  conversion: { label: 'Converting', cls: 'bg-amber-50 text-amber-600' },
  validation: { label: 'Validating', cls: 'bg-violet-50 text-violet-600' },
  finalized: { label: 'Finalized', cls: 'bg-emerald-50 text-emerald-600' },
};
