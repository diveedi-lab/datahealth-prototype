import React, { useState } from 'react';
import { Upload, CheckCircle2, Clock, AlertCircle, XCircle, ChevronRight, Database, FileText, Search, Filter, RefreshCw, MoreHorizontal, Loader2 } from 'lucide-react';

interface UploadProcess {
  id: string;
  name: string;
  database: string;
  status: 'completed' | 'running' | 'queued' | 'failed';
  filesTotal: number;
  filesProcessed: number;
  sizeGB: number;
  startedAt: string;
  completedAt?: string;
  createdBy: string;
  errorMessage?: string;
}

const STATUS_CONFIG = {
  completed: { icon: CheckCircle2, cls: 'text-emerald-600', bg: 'bg-emerald-50', label: 'Completed' },
  running: { icon: Loader2, cls: 'text-blue-600 animate-spin', bg: 'bg-blue-50', label: 'Running' },
  queued: { icon: Clock, cls: 'text-amber-600', bg: 'bg-amber-50', label: 'Queued' },
  failed: { icon: XCircle, cls: 'text-red-500', bg: 'bg-red-50', label: 'Failed' },
};

const DB_COLORS: Record<string, string> = {
  'CARDIO-2024': 'bg-rose-500', 'ONCO-TRIAL-A': 'bg-amber-500',
  'NEURO-PHASE3': 'bg-violet-500', 'RESP-PILOT': 'bg-emerald-500', 'DERM-COHORT-B': 'bg-blue-500',
};

const MOCK_PROCESSES: UploadProcess[] = [
  { id: 'UP-0012', name: 'Q1 2026 Lab Results Batch', database: 'CARDIO-2024', status: 'running', filesTotal: 2400, filesProcessed: 1847, sizeGB: 12.4, startedAt: '2026-04-11T10:15:00', createdBy: 'Dr. M. Rossi' },
  { id: 'UP-0011', name: 'DICOM Imaging Import', database: 'ONCO-TRIAL-A', status: 'running', filesTotal: 850, filesProcessed: 320, sizeGB: 45.2, startedAt: '2026-04-11T09:00:00', createdBy: 'A. Bianchi' },
  { id: 'UP-0010', name: 'Patient Demographics Update', database: 'NEURO-PHASE3', status: 'queued', filesTotal: 18, filesProcessed: 0, sizeGB: 0.2, startedAt: '2026-04-11T11:30:00', createdBy: 'You' },
  { id: 'UP-0009', name: 'March Adverse Events', database: 'CARDIO-2024', status: 'completed', filesTotal: 340, filesProcessed: 340, sizeGB: 1.8, startedAt: '2026-04-10T14:00:00', completedAt: '2026-04-10T14:22:00', createdBy: 'Dr. L. Bianchi' },
  { id: 'UP-0008', name: 'Spirometry CSV Batch', database: 'RESP-PILOT', status: 'completed', filesTotal: 120, filesProcessed: 120, sizeGB: 0.4, startedAt: '2026-04-10T09:30:00', completedAt: '2026-04-10T09:35:00', createdBy: 'Dr. A. Verdi' },
  { id: 'UP-0007', name: 'Visit Records Q4 2025', database: 'CARDIO-2024', status: 'completed', filesTotal: 5200, filesProcessed: 5200, sizeGB: 8.1, startedAt: '2026-04-09T08:00:00', completedAt: '2026-04-09T08:45:00', createdBy: 'You' },
  { id: 'UP-0006', name: 'Biopsy Results Import', database: 'ONCO-TRIAL-A', status: 'failed', filesTotal: 420, filesProcessed: 312, sizeGB: 3.2, startedAt: '2026-04-08T16:00:00', createdBy: 'Dr. S. Russo', errorMessage: 'Schema validation failed: column "tumor_grade" type mismatch' },
  { id: 'UP-0005', name: 'Assessment Scores Batch', database: 'NEURO-PHASE3', status: 'completed', filesTotal: 1800, filesProcessed: 1800, sizeGB: 2.5, startedAt: '2026-04-08T10:00:00', completedAt: '2026-04-08T10:18:00', createdBy: 'F. Verdi' },
  { id: 'UP-0004', name: 'Skin Photography Set', database: 'DERM-COHORT-B', status: 'completed', filesTotal: 640, filesProcessed: 640, sizeGB: 18.6, startedAt: '2026-04-07T11:00:00', completedAt: '2026-04-07T12:20:00', createdBy: 'You' },
  { id: 'UP-0003', name: 'Medication History CSV', database: 'CARDIO-2024', status: 'completed', filesTotal: 88, filesProcessed: 88, sizeGB: 0.3, startedAt: '2026-04-06T15:00:00', completedAt: '2026-04-06T15:02:00', createdBy: 'Dr. M. Rossi' },
];

export function UploadProcesses() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filtered = MOCK_PROCESSES.filter(p => {
    const matchSearch = !searchTerm || p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const formatDate = (d: string) => {
    const date = new Date(d);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col gap-4 h-full w-full min-h-0">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-2xl font-bold text-zinc-900">Upload Processes</h2>
          <p className="text-sm text-zinc-500 mt-1">Manage and monitor data upload operations.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors shadow-sm">
          <Upload className="w-4 h-4" /> New Upload
        </button>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search processes..."
            className="w-full pl-9 pr-4 py-2 bg-white border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="bg-white border border-zinc-200 rounded-xl px-3 pr-8 py-2 text-sm text-zinc-700 outline-none appearance-none"
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='%2371717a' viewBox='0 0 24 24'%3E%3Cpath d='M7 10l5 5 5-5z'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center' }}>
          <option value="all">All statuses</option>
          <option value="running">Running</option>
          <option value="queued">Queued</option>
          <option value="completed">Completed</option>
          <option value="failed">Failed</option>
        </select>
        <span className="text-xs text-zinc-400">{filtered.length} processes</span>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="grid grid-cols-1 gap-3">
          {filtered.map(proc => {
            const stCfg = STATUS_CONFIG[proc.status];
            const StIcon = stCfg.icon;
            const progress = proc.filesTotal > 0 ? (proc.filesProcessed / proc.filesTotal) * 100 : 0;
            return (
              <div key={proc.id} className="bg-white border border-zinc-200 rounded-xl p-4 hover:shadow-md transition-all cursor-pointer group">
                <div className="flex items-start gap-4">
                  <div className={`p-2 rounded-lg ${stCfg.bg} shrink-0`}>
                    <StIcon className={`w-5 h-5 ${stCfg.cls}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono text-zinc-400">{proc.id}</span>
                      <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${stCfg.bg} ${stCfg.cls}`}>{stCfg.label}</span>
                    </div>
                    <p className="text-sm font-semibold text-zinc-900 truncate">{proc.name}</p>
                    <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                      <span className="flex items-center gap-1.5 text-xs text-zinc-500">
                        <span className={`w-2 h-2 rounded-full ${DB_COLORS[proc.database] || 'bg-zinc-400'}`} />{proc.database}
                      </span>
                      <span className="text-xs text-zinc-400">{proc.filesProcessed.toLocaleString()} / {proc.filesTotal.toLocaleString()} files</span>
                      <span className="text-xs text-zinc-400">{proc.sizeGB} GB</span>
                      <span className="text-xs text-zinc-400">{proc.createdBy}</span>
                      <span className="text-xs text-zinc-400">{formatDate(proc.startedAt)}</span>
                    </div>
                    {(proc.status === 'running' || proc.status === 'failed') && (
                      <div className="mt-2.5">
                        <div className="h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full transition-all ${proc.status === 'failed' ? 'bg-red-500' : 'bg-blue-500'}`} style={{ width: `${progress}%` }} />
                        </div>
                        {proc.errorMessage && (
                          <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3 shrink-0" />{proc.errorMessage}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                  <ChevronRight className="w-4 h-4 text-zinc-300 shrink-0 mt-1 group-hover:text-zinc-500 transition-colors" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
