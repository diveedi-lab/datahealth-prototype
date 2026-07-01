import React, { useState } from 'react';
import { Plus, CheckCircle2, Clock, AlertCircle, XCircle, ChevronRight, Database, Search, Pencil, FileText, Layers, HardDrive, Table2, Network } from 'lucide-react';
import { getSavedStage } from './ingestor/state/persistence';
import { STAGE_BADGE } from './ingestor/badges';
import { NewCollectionChooser } from './ingestor/NewCollectionChooser';
import { listDerived, derivedToQuery, type DerivedCollection } from './explore/derivedStore';
import { getCollection } from './explore/mock/mockCatalog';
import type { ExploreQuery } from './explore/types';

interface DataSource {
  id: string;
  name: string;
  targetDatabase: string;
  status: 'draft' | 'in-progress' | 'completed' | 'failed';
  filesTotal: number;
  filesIngested: number;
  sizeGB: number;
  entities: number;
  variables: number;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  createdBy: string;
  description: string;
  errorMessage?: string;
}

const STATUS_CONFIG = {
  draft: { icon: Pencil, cls: 'text-zinc-500', bg: 'bg-zinc-100', label: 'Draft' },
  'in-progress': { icon: Clock, cls: 'text-blue-600', bg: 'bg-blue-50', label: 'In Progress' },
  completed: { icon: CheckCircle2, cls: 'text-emerald-600', bg: 'bg-emerald-50', label: 'Completed' },
  failed: { icon: XCircle, cls: 'text-red-500', bg: 'bg-red-50', label: 'Failed' },
};

const DB_COLORS: Record<string, string> = {
  'CARDIO-2024': 'bg-rose-500', 'ONCO-TRIAL-A': 'bg-amber-500',
  'NEURO-PHASE3': 'bg-violet-500', 'RESP-PILOT': 'bg-emerald-500', 'DERM-COHORT-B': 'bg-blue-500',
};

const MOCK_SOURCES: DataSource[] = [
  { id: 'DS-0012', name: 'CARDIO Q1 2026 Lab Results', targetDatabase: 'CARDIO-2024', status: 'in-progress', filesTotal: 2400, filesIngested: 1847, sizeGB: 12.4, entities: 3, variables: 84, createdAt: '2026-04-05T10:00:00', updatedAt: '2026-04-11T14:15:00', createdBy: 'Dr. M. Rossi', description: 'Quarterly laboratory results batch including blood panels, metabolic panels, and cardiac biomarkers.' },
  { id: 'DS-0011', name: 'ONCO Imaging Archive', targetDatabase: 'ONCO-TRIAL-A', status: 'in-progress', filesTotal: 850, filesIngested: 320, sizeGB: 45.2, entities: 2, variables: 32, createdAt: '2026-04-02T09:00:00', updatedAt: '2026-04-11T09:30:00', createdBy: 'A. Bianchi', description: 'DICOM imaging data import including CT scans, MRI sequences, and pathology slides.' },
  { id: 'DS-0010', name: 'NEURO Demographics Update', targetDatabase: 'NEURO-PHASE3', status: 'draft', filesTotal: 18, filesIngested: 0, sizeGB: 0.2, entities: 1, variables: 24, createdAt: '2026-04-11T08:00:00', updatedAt: '2026-04-11T08:00:00', createdBy: 'You', description: 'Updated patient demographics and baseline characteristics for Phase 3 cohort.' },
  { id: 'DS-0009', name: 'March Adverse Events Report', targetDatabase: 'CARDIO-2024', status: 'completed', filesTotal: 340, filesIngested: 340, sizeGB: 1.8, entities: 2, variables: 18, createdAt: '2026-04-01T14:00:00', updatedAt: '2026-04-10T14:22:00', completedAt: '2026-04-10T14:22:00', createdBy: 'Dr. L. Bianchi', description: 'Monthly adverse events collection including severity grading and causality assessment.' },
  { id: 'DS-0008', name: 'Spirometry CSV Batch', targetDatabase: 'RESP-PILOT', status: 'completed', filesTotal: 120, filesIngested: 120, sizeGB: 0.4, entities: 1, variables: 12, createdAt: '2026-03-28T09:00:00', updatedAt: '2026-04-10T09:35:00', completedAt: '2026-04-10T09:35:00', createdBy: 'Dr. A. Verdi', description: 'Pulmonary function test results from all sites.' },
  { id: 'DS-0007', name: 'Visit Records Q4 2025', targetDatabase: 'CARDIO-2024', status: 'completed', filesTotal: 5200, filesIngested: 5200, sizeGB: 8.1, entities: 4, variables: 56, createdAt: '2026-03-20T08:00:00', updatedAt: '2026-04-09T08:45:00', completedAt: '2026-04-09T08:45:00', createdBy: 'You', description: 'Complete Q4 2025 site visit records with investigator assessments and CRF data.' },
  { id: 'DS-0006', name: 'Biopsy Results Import', targetDatabase: 'ONCO-TRIAL-A', status: 'failed', filesTotal: 420, filesIngested: 312, sizeGB: 3.2, entities: 2, variables: 28, createdAt: '2026-03-15T16:00:00', updatedAt: '2026-04-08T16:30:00', createdBy: 'Dr. S. Russo', description: 'Tissue biopsy analysis results and histopathology reports.', errorMessage: 'Schema validation failed: column \"tumor_grade\" type mismatch in 108 records.' },
  { id: 'DS-0005', name: 'NEURO Assessment Scores', targetDatabase: 'NEURO-PHASE3', status: 'completed', filesTotal: 1800, filesIngested: 1800, sizeGB: 2.5, entities: 2, variables: 44, createdAt: '2026-03-10T10:00:00', updatedAt: '2026-04-08T10:18:00', completedAt: '2026-04-08T10:18:00', createdBy: 'F. Verdi', description: 'Cognitive and neurological assessment scores including MMSE, MoCA, and custom scales.' },
  { id: 'DS-0004', name: 'DERM Photography Set', targetDatabase: 'DERM-COHORT-B', status: 'completed', filesTotal: 640, filesIngested: 640, sizeGB: 18.6, entities: 1, variables: 8, createdAt: '2026-03-01T11:00:00', updatedAt: '2026-04-07T12:20:00', completedAt: '2026-04-07T12:20:00', createdBy: 'You', description: 'Standardized dermatological photography set with lesion measurement metadata.' },
  { id: 'DS-0003', name: 'Medication History CSV', targetDatabase: 'CARDIO-2024', status: 'completed', filesTotal: 88, filesIngested: 88, sizeGB: 0.3, entities: 1, variables: 14, createdAt: '2026-02-20T15:00:00', updatedAt: '2026-04-06T15:02:00', completedAt: '2026-04-06T15:02:00', createdBy: 'Dr. M. Rossi', description: 'Concomitant medication records for all enrolled patients.' },
  { id: 'DS-0002', name: 'Baseline ECG Data', targetDatabase: 'CARDIO-2024', status: 'draft', filesTotal: 0, filesIngested: 0, sizeGB: 0, entities: 0, variables: 0, createdAt: '2026-04-10T16:00:00', updatedAt: '2026-04-10T16:00:00', createdBy: 'Dr. P. Marino', description: 'Baseline electrocardiogram recordings and automated measurements.' },
];

export function DB({
  onOpenCollection, onNewDerived, onExploreDerived,
}: {
  onOpenCollection?: (id: string) => void;
  onNewDerived?: () => void;
  onExploreDerived?: (q: ExploreQuery) => void;
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [chooserOpen, setChooserOpen] = useState(false);
  const [derived] = useState<DerivedCollection[]>(() => listDerived());

  const derivedFiltered = derived.filter((d) => !searchTerm || d.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const filtered = MOCK_SOURCES.filter(p => {
    const matchSearch = !searchTerm || p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const formatDate = (d: string) => {
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatRelative = (d: string) => {
    const diff = Date.now() - new Date(d).getTime();
    const hours = Math.floor(diff / 3600000);
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return formatDate(d);
  };

  return (
    <div className="flex flex-col gap-4 h-full w-full min-h-0">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-2xl font-bold text-zinc-900">Collections</h2>
          <p className="text-sm text-zinc-500 mt-1">Crea e gestisci le collection di dati. Aprine una per modellare il flusso di ingestione e conversione.</p>
        </div>
        <button
          onClick={() => setChooserOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" /> New Collection
        </button>
      </div>

      <NewCollectionChooser
        open={chooserOpen}
        onOpenChange={setChooserOpen}
        onIngestion={() => onOpenCollection?.(`new-${Date.now()}`)}
        onDerived={() => onNewDerived?.()}
      />

      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search collections..."
            className="w-full pl-9 pr-4 py-2 bg-white border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="bg-white border border-zinc-200 rounded-xl px-3 pr-8 py-2 text-sm text-zinc-700 outline-none appearance-none"
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='%2371717a' viewBox='0 0 24 24'%3E%3Cpath d='M7 10l5 5 5-5z'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center' }}>
          <option value="all">All statuses</option>
          <option value="draft">Draft</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="failed">Failed</option>
        </select>
        <span className="text-xs text-zinc-400">{filtered.length + derivedFiltered.length} collections</span>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="grid grid-cols-1 gap-3">
          {derivedFiltered.map((d) => (
            <div
              key={d.id}
              onClick={() => onExploreDerived?.(derivedToQuery(d))}
              className="glass-card rounded-xl p-4 hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex items-start gap-4">
                <div className="p-2.5 rounded-xl bg-emerald-50 shrink-0">
                  <Table2 className="w-5 h-5 text-emerald-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-xs font-mono text-zinc-400">{d.id}</span>
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 flex items-center gap-1">
                      <Table2 className="w-3 h-3" /> Derivata
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-zinc-900 truncate">{d.name}</p>
                  <p className="text-xs text-zinc-500 mt-0.5 line-clamp-1 italic">“{d.prompt}”</p>
                  <div className="flex items-center gap-4 mt-2.5 flex-wrap">
                    <span className="flex items-center gap-1.5 text-xs text-zinc-500">
                      {d.sourceCollections.map((c) => (
                        <span key={c} className={`w-2 h-2 rounded-full ${getCollection(c)?.dotClass || 'bg-zinc-400'}`} />
                      ))}
                      {d.sourceCollections.map((c) => getCollection(c)?.name ?? c).join(', ')}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-zinc-400"><Layers className="w-3 h-3" />{d.rowCount.toLocaleString('it-IT')} righe</span>
                    <span className="flex items-center gap-1 text-xs text-emerald-600"><Network className="w-3 h-3" /> Esplora su React Flow</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-300 shrink-0 mt-1 group-hover:text-zinc-500 transition-colors" />
              </div>
            </div>
          ))}
          {filtered.map(src => {
            const stCfg = STATUS_CONFIG[src.status];
            const StIcon = stCfg.icon;
            const progress = src.filesTotal > 0 ? (src.filesIngested / src.filesTotal) * 100 : 0;
            const savedStage = getSavedStage(src.id);
            return (
              <div
                key={src.id}
                onClick={() => onOpenCollection?.(src.id)}
                className="glass-card rounded-xl p-4 hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="flex items-start gap-4">
                  <div className={`p-2.5 rounded-xl ${stCfg.bg} shrink-0`}>
                    <StIcon className={`w-5 h-5 ${stCfg.cls}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-xs font-mono text-zinc-400">{src.id}</span>
                      <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${stCfg.bg} ${stCfg.cls}`}>{stCfg.label}</span>
                      {src.status === 'completed' && (
                        <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 flex items-center gap-1">
                          <Database className="w-3 h-3" /> Database ready
                        </span>
                      )}
                      {savedStage && (
                        <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${STAGE_BADGE[savedStage].cls} flex items-center gap-1`}>
                          <Pencil className="w-3 h-3" /> Editor · {STAGE_BADGE[savedStage].label}
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-semibold text-zinc-900 truncate">{src.name}</p>
                    <p className="text-xs text-zinc-500 mt-0.5 line-clamp-1">{src.description}</p>

                    <div className="flex items-center gap-4 mt-2.5 flex-wrap">
                      <span className="flex items-center gap-1.5 text-xs text-zinc-500">
                        <span className={`w-2 h-2 rounded-full ${DB_COLORS[src.targetDatabase] || 'bg-zinc-400'}`} />{src.targetDatabase}
                      </span>
                      {src.filesTotal > 0 && (
                        <span className="flex items-center gap-1 text-xs text-zinc-400">
                          <FileText className="w-3 h-3" />{src.filesIngested.toLocaleString()} / {src.filesTotal.toLocaleString()} files
                        </span>
                      )}
                      {src.sizeGB > 0 && (
                        <span className="flex items-center gap-1 text-xs text-zinc-400">
                          <HardDrive className="w-3 h-3" />{src.sizeGB} GB
                        </span>
                      )}
                      {src.entities > 0 && (
                        <span className="flex items-center gap-1 text-xs text-zinc-400">
                          <Layers className="w-3 h-3" />{src.entities} entities · {src.variables} variables
                        </span>
                      )}
                      <span className="text-xs text-zinc-400">{src.createdBy}</span>
                      <span className="text-xs text-zinc-400">Updated {formatRelative(src.updatedAt)}</span>
                    </div>

                    {src.status === 'in-progress' && src.filesTotal > 0 && (
                      <div className="mt-2.5">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[11px] text-zinc-400">{Math.round(progress)}% ingested</span>
                        </div>
                        <div className="h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                          <div className="h-full rounded-full bg-blue-500 transition-all" style={{ width: `${progress}%` }} />
                        </div>
                      </div>
                    )}

                    {src.errorMessage && (
                      <p className="text-xs text-red-500 mt-2 flex items-start gap-1">
                        <AlertCircle className="w-3 h-3 shrink-0 mt-0.5" />{src.errorMessage}
                      </p>
                    )}
                  </div>
                  <ChevronRight className="w-4 h-4 text-zinc-300 shrink-0 mt-1 group-hover:text-zinc-500 transition-colors" />
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && derivedFiltered.length === 0 && (
            <div className="py-16 flex flex-col items-center text-zinc-400 glass-card rounded-2xl">
              <Database className="w-8 h-8 mb-2 opacity-50" />
              <p className="text-sm">No databases match your filters</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}