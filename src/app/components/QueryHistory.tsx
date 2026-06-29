import React, { useState, useRef, useEffect } from 'react';
import {
  Clock, Search, Eye, Download, Copy, Check, Table2, Code2, X,
  Database, Play, ChevronRight, AlertCircle, CheckCircle2, XCircle,
  User, ChevronDown
} from 'lucide-react';

// ─── Types & Mock Data ───

interface HistoryEntry {
  id: string;
  prompt: string;
  sql: string;
  databases: string[];
  tables: string[];
  rowCount: number;
  executionTime: string;
  createdAt: string;
  author: { name: string; avatar: string };
  status: 'completed' | 'failed' | 'cancelled';
}

const DB_COLORS: Record<string, string> = {
  'CARDIO-2024': 'bg-rose-500', 'ONCO-TRIAL-A': 'bg-amber-500',
  'NEURO-PHASE3': 'bg-violet-500', 'RESP-PILOT': 'bg-emerald-500', 'DERM-COHORT-B': 'bg-blue-500',
};

const STATUS_CONFIG = {
  completed: { icon: CheckCircle2, cls: 'text-emerald-600', label: 'Completed' },
  failed: { icon: XCircle, cls: 'text-red-500', label: 'Failed' },
  cancelled: { icon: AlertCircle, cls: 'text-zinc-400', label: 'Cancelled' },
};

const AUTHORS = ['You', 'Dr. M. Rossi', 'Dr. L. Bianchi', 'Dr. A. Verdi', 'Dr. S. Russo', 'Dr. P. Marino'];

const MOCK_HISTORY: HistoryEntry[] = [
  { id: 'QRY-0041', prompt: 'Show all active patients over 30 with their latest lab results and adverse events', sql: "SELECT p.*, lr.test_name, lr.value\nFROM patients p\nJOIN lab_results lr ON p.patient_id = lr.patient_id\nWHERE p.status = 'Active' AND p.age >= 30;", databases: ['CARDIO-2024'], tables: ['patients', 'lab_results', 'adverse_events'], rowCount: 142, executionTime: '0.82s', createdAt: '2026-04-11T14:23:00', author: { name: 'You', avatar: 'Y' }, status: 'completed' },
  { id: 'QRY-0040', prompt: 'Find patients with high troponin values and their current medication history', sql: "SELECT p.patient_id, lr.value AS troponin, m.drug_name\nFROM patients p\nJOIN lab_results lr ON p.patient_id = lr.patient_id\nJOIN medications m ON p.patient_id = m.patient_id\nWHERE lr.test_name = 'Troponin I' AND lr.flag = 'High';", databases: ['CARDIO-2024'], tables: ['patients', 'lab_results', 'medications'], rowCount: 38, executionTime: '1.21s', createdAt: '2026-04-11T11:05:00', author: { name: 'Dr. M. Rossi', avatar: 'MR' }, status: 'completed' },
  { id: 'QRY-0039', prompt: 'List all ONCO-TRIAL-A sites with enrollment counts and completion rates', sql: "SELECT s.site_id, COUNT(p.patient_id) AS enrolled\nFROM sites s JOIN patients p ON s.site_id = p.site_id\nGROUP BY s.site_id;", databases: ['ONCO-TRIAL-A'], tables: ['sites', 'patients'], rowCount: 24, executionTime: '0.56s', createdAt: '2026-04-11T09:42:00', author: { name: 'Dr. L. Bianchi', avatar: 'LB' }, status: 'completed' },
  { id: 'QRY-0038', prompt: 'Get all adverse events with severity moderate or higher across studies', sql: "SELECT ae.*, p.age, p.gender\nFROM adverse_events ae\nJOIN patients p ON ae.patient_id = p.patient_id\nWHERE ae.severity IN ('Moderate','Severe');", databases: ['CARDIO-2024', 'NEURO-PHASE3'], tables: ['adverse_events', 'patients'], rowCount: 89, executionTime: '0.94s', createdAt: '2026-04-10T16:18:00', author: { name: 'You', avatar: 'Y' }, status: 'completed' },
  { id: 'QRY-0037', prompt: 'Show RESP-PILOT spirometry values below threshold for last 3 months', sql: "SELECT p.patient_id, lr.value, lr.collection_date\nFROM patients p JOIN lab_results lr ON p.patient_id = lr.patient_id\nWHERE lr.test_name LIKE '%spirometry%' AND lr.value < 80;", databases: ['RESP-PILOT'], tables: ['patients', 'lab_results'], rowCount: 0, executionTime: '0.31s', createdAt: '2026-04-10T13:55:00', author: { name: 'Dr. A. Verdi', avatar: 'AV' }, status: 'failed' },
  { id: 'QRY-0036', prompt: 'Cross-database patient overlap between CARDIO-2024 and NEURO-PHASE3', sql: "SELECT c.patient_id, c.age\nFROM cardio_2024.patients c\nJOIN neuro_phase3.patients n ON c.patient_id = n.patient_id;", databases: ['CARDIO-2024', 'NEURO-PHASE3'], tables: ['patients'], rowCount: 12, executionTime: '2.14s', createdAt: '2026-04-10T10:30:00', author: { name: 'Dr. M. Rossi', avatar: 'MR' }, status: 'completed' },
  { id: 'QRY-0035', prompt: 'Count enrolled patients per month for DERM-COHORT-B in 2025', sql: "SELECT DATE_TRUNC('month', enrollment_date) AS month, COUNT(*)\nFROM patients\nWHERE enrollment_date >= '2025-01-01'\nGROUP BY 1 ORDER BY 1;", databases: ['DERM-COHORT-B'], tables: ['patients'], rowCount: 12, executionTime: '0.18s', createdAt: '2026-04-09T17:12:00', author: { name: 'You', avatar: 'Y' }, status: 'completed' },
  { id: 'QRY-0034', prompt: 'Retrieve medications with frequency above 2x daily across all cardiac patients', sql: "SELECT m.drug_name, m.dose, m.frequency, p.patient_id\nFROM medications m JOIN patients p ON m.patient_id = p.patient_id;", databases: ['CARDIO-2024'], tables: ['medications', 'patients'], rowCount: 0, executionTime: '0.44s', createdAt: '2026-04-09T14:30:00', author: { name: 'Dr. L. Bianchi', avatar: 'LB' }, status: 'cancelled' },
  { id: 'QRY-0033', prompt: 'Get imaging records for ONCO patients with tumor size > 2cm', sql: "SELECT i.*, p.patient_id, p.age\nFROM imaging i\nJOIN patients p ON i.patient_id = p.patient_id\nWHERE i.tumor_size_cm > 2;", databases: ['ONCO-TRIAL-A'], tables: ['imaging', 'patients'], rowCount: 234, executionTime: '1.52s', createdAt: '2026-04-09T11:08:00', author: { name: 'Dr. S. Russo', avatar: 'SR' }, status: 'completed' },
  { id: 'QRY-0032', prompt: 'Show all visits in March 2026 with investigator details per site', sql: "SELECT cv.*, s.site_name, s.pi_name\nFROM clinical_visits cv\nJOIN sites s ON cv.site_id = s.site_id\nWHERE cv.visit_date BETWEEN '2026-03-01' AND '2026-03-31';", databases: ['CARDIO-2024'], tables: ['clinical_visits', 'sites'], rowCount: 486, executionTime: '0.67s', createdAt: '2026-04-08T16:45:00', author: { name: 'Dr. P. Marino', avatar: 'PM' }, status: 'completed' },
  { id: 'QRY-0031', prompt: 'Find patients enrolled in both CARDIO and ONCO trials', sql: "SELECT DISTINCT c.patient_id\nFROM cardio_2024.patients c\nJOIN onco_trial_a.patients o ON c.patient_id = o.patient_id;", databases: ['CARDIO-2024', 'ONCO-TRIAL-A'], tables: ['patients'], rowCount: 7, executionTime: '1.88s', createdAt: '2026-04-08T14:20:00', author: { name: 'You', avatar: 'Y' }, status: 'completed' },
  { id: 'QRY-0030', prompt: 'List all NEURO-PHASE3 assessments with score below 60', sql: "SELECT a.*, p.patient_id\nFROM assessments a\nJOIN patients p ON a.patient_id = p.patient_id\nWHERE a.score < 60;", databases: ['NEURO-PHASE3'], tables: ['assessments', 'patients'], rowCount: 67, executionTime: '0.39s', createdAt: '2026-04-08T10:15:00', author: { name: 'Dr. A. Verdi', avatar: 'AV' }, status: 'completed' },
  { id: 'QRY-0029', prompt: 'Count adverse events by severity across all databases', sql: "SELECT ae.severity, COUNT(*) AS total\nFROM adverse_events ae\nGROUP BY ae.severity\nORDER BY total DESC;", databases: ['CARDIO-2024', 'NEURO-PHASE3', 'ONCO-TRIAL-A'], tables: ['adverse_events'], rowCount: 4, executionTime: '0.72s', createdAt: '2026-04-07T15:33:00', author: { name: 'Dr. M. Rossi', avatar: 'MR' }, status: 'completed' },
  { id: 'QRY-0028', prompt: 'Export complete patient demographics for RESP-PILOT', sql: "SELECT p.*\nFROM patients p\nWHERE 1=1;", databases: ['RESP-PILOT'], tables: ['patients'], rowCount: 500, executionTime: '0.22s', createdAt: '2026-04-07T11:00:00', author: { name: 'Dr. L. Bianchi', avatar: 'LB' }, status: 'completed' },
  { id: 'QRY-0027', prompt: 'Get lab results with critical flags in the last 7 days', sql: "SELECT lr.*, p.patient_id\nFROM lab_results lr\nJOIN patients p ON lr.patient_id = p.patient_id\nWHERE lr.flag = 'Critical' AND lr.collection_date >= CURRENT_DATE - 7;", databases: ['CARDIO-2024'], tables: ['lab_results', 'patients'], rowCount: 18, executionTime: '0.41s', createdAt: '2026-04-07T09:18:00', author: { name: 'You', avatar: 'Y' }, status: 'completed' },
  { id: 'QRY-0026', prompt: 'Show treatment cycle completion rates by drug for ONCO-TRIAL-A', sql: "SELECT tc.drug_name, COUNT(*) AS total,\n  SUM(CASE WHEN tc.completed THEN 1 ELSE 0 END) AS completed\nFROM treatment_cycles tc\nGROUP BY tc.drug_name;", databases: ['ONCO-TRIAL-A'], tables: ['treatment_cycles'], rowCount: 8, executionTime: '0.55s', createdAt: '2026-04-06T16:40:00', author: { name: 'Dr. S. Russo', avatar: 'SR' }, status: 'completed' },
  { id: 'QRY-0025', prompt: 'Find all patients with BMI above 30', sql: "SELECT p.patient_id, p.weight_kg, p.height_cm,\n  (p.weight_kg / POWER(p.height_cm / 100.0, 2)) AS bmi\nFROM patients p\nWHERE (p.weight_kg / POWER(p.height_cm / 100.0, 2)) > 30;", databases: ['CARDIO-2024'], tables: ['patients'], rowCount: 312, executionTime: '0.29s', createdAt: '2026-04-06T13:22:00', author: { name: 'Dr. P. Marino', avatar: 'PM' }, status: 'completed' },
  { id: 'QRY-0024', prompt: 'Show medication interactions across NEURO patients', sql: "SELECT m1.drug_name AS drug_a, m2.drug_name AS drug_b, COUNT(*) AS co_prescriptions\nFROM medications m1\nJOIN medications m2 ON m1.patient_id = m2.patient_id AND m1.drug_name < m2.drug_name\nGROUP BY m1.drug_name, m2.drug_name\nHAVING COUNT(*) > 5;", databases: ['NEURO-PHASE3'], tables: ['medications'], rowCount: 15, executionTime: '1.87s', createdAt: '2026-04-06T10:05:00', author: { name: 'Dr. A. Verdi', avatar: 'AV' }, status: 'failed' },
  { id: 'QRY-0023', prompt: 'Get enrollment trends by quarter for all databases', sql: "SELECT DATE_TRUNC('quarter', enrollment_date) AS quarter, COUNT(*)\nFROM patients\nGROUP BY 1 ORDER BY 1;", databases: ['CARDIO-2024', 'ONCO-TRIAL-A', 'NEURO-PHASE3', 'RESP-PILOT'], tables: ['patients'], rowCount: 16, executionTime: '0.63s', createdAt: '2026-04-05T14:50:00', author: { name: 'You', avatar: 'Y' }, status: 'completed' },
  { id: 'QRY-0022', prompt: 'List sites with more than 200 enrolled patients', sql: "SELECT s.site_id, s.site_name, COUNT(p.patient_id) AS enrolled\nFROM sites s JOIN patients p ON s.site_id = p.site_id\nGROUP BY s.site_id, s.site_name\nHAVING COUNT(p.patient_id) > 200;", databases: ['CARDIO-2024'], tables: ['sites', 'patients'], rowCount: 4, executionTime: '0.35s', createdAt: '2026-04-05T09:30:00', author: { name: 'Dr. M. Rossi', avatar: 'MR' }, status: 'completed' },
];

// ─── SearchSelect Component ───

function SearchSelect({ value, onChange, options, placeholder, allLabel }: {
  value: string; onChange: (v: string) => void; options: string[]; placeholder: string; allLabel: string;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const filtered = options.filter(o => !search || o.toLowerCase().includes(search.toLowerCase()));
  const displayLabel = value === 'all' ? allLabel : value;

  return (
    <div ref={ref} className="relative">
      <button onClick={() => { setOpen(!open); setSearch(''); }}
        className="flex items-center gap-2 bg-white border border-zinc-200 rounded-xl px-3 py-2 text-sm text-zinc-700 hover:border-zinc-300 transition-colors min-w-[160px]">
        <span className="flex-1 text-left truncate">{displayLabel}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-zinc-400 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute left-0 top-full mt-1 w-56 bg-white border border-zinc-200 rounded-xl shadow-xl z-50 overflow-hidden">
          <div className="p-2 border-b border-zinc-100">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder={placeholder}
                className="w-full pl-8 pr-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500/50 text-zinc-700" autoFocus />
            </div>
          </div>
          <div className="max-h-48 overflow-y-auto p-1">
            <button onClick={() => { onChange('all'); setOpen(false); }}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${value === 'all' ? 'bg-blue-50 text-blue-600' : 'text-zinc-700 hover:bg-zinc-50'}`}>
              {allLabel}
            </button>
            {filtered.map(o => (
              <button key={o} onClick={() => { onChange(o); setOpen(false); }}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${value === o ? 'bg-blue-50 text-blue-600' : 'text-zinc-700 hover:bg-zinc-50'}`}>
                {o}
              </button>
            ))}
            {filtered.length === 0 && <p className="px-3 py-2 text-xs text-zinc-400">No results</p>}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Component ───

export function QueryHistory() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAuthor, setFilterAuthor] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filtered = MOCK_HISTORY.filter(q => {
    const matchSearch = !searchTerm || q.prompt.toLowerCase().includes(searchTerm.toLowerCase()) || q.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchAuthor = filterAuthor === 'all' || q.author.name === filterAuthor;
    const matchStatus = filterStatus === 'all' || q.status === filterStatus;
    return matchSearch && matchAuthor && matchStatus;
  });

  const copySql = (id: string, sql: string) => {
    navigator.clipboard.writeText(sql);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatDate = (d: string) => {
    const date = new Date(d);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / 3600000);
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="flex flex-col gap-4 h-full w-full min-h-0">
      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search history..."
            className="w-full pl-9 pr-4 py-2 bg-white border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-colors" />
        </div>
        <SearchSelect value={filterAuthor} onChange={setFilterAuthor} options={AUTHORS} placeholder="Search authors..." allLabel="All authors" />
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          className="bg-white border border-zinc-200 rounded-xl px-3 pr-8 py-2 text-sm text-zinc-700 focus:ring-2 focus:ring-blue-500/50 outline-none appearance-none"
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='%2371717a' viewBox='0 0 24 24'%3E%3Cpath d='M7 10l5 5 5-5z'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center' }}>
          <option value="all">All statuses</option>
          <option value="completed">Completed</option>
          <option value="failed">Failed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <span className="text-xs text-zinc-400">{filtered.length} entries</span>
      </div>

      {/* Log List */}
      <div className="flex-1 bg-white border border-zinc-200 rounded-xl shadow-sm overflow-hidden flex flex-col min-h-0">
        <div className="overflow-auto flex-1">
          <div className="divide-y divide-zinc-100">
            {filtered.map(entry => {
              const isExpanded = expandedId === entry.id;
              const stCfg = STATUS_CONFIG[entry.status];
              const StIcon = stCfg.icon;
              return (
                <div key={entry.id} className="transition-colors">
                  <button onClick={() => setExpandedId(isExpanded ? null : entry.id)}
                    className="w-full flex items-center gap-4 px-4 py-3 text-left hover:bg-zinc-50/80 transition-colors">
                    <ChevronRight className={`w-4 h-4 text-zinc-400 shrink-0 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                    <StIcon className={`w-4 h-4 shrink-0 ${stCfg.cls}`} />
                    <span className="text-xs font-mono text-zinc-400 shrink-0 w-20">{entry.id}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-zinc-700 truncate">{entry.prompt}</p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {entry.databases.map(db => (
                        <span key={db} className={`w-2 h-2 rounded-full ${DB_COLORS[db] || 'bg-zinc-400'}`} title={db} />
                      ))}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="w-5 h-5 rounded-full bg-zinc-200 flex items-center justify-center text-[9px] font-medium text-zinc-600">{entry.author.avatar}</div>
                    </div>
                    <span className="text-xs text-zinc-400 shrink-0 w-16 text-right">{entry.status === 'failed' ? '—' : entry.rowCount.toLocaleString() + ' rows'}</span>
                    <span className="text-xs text-zinc-400 shrink-0 w-14 text-right">{entry.executionTime}</span>
                    <span className="text-xs text-zinc-400 shrink-0 w-16 text-right">{formatDate(entry.createdAt)}</span>
                  </button>
                  {isExpanded && (
                    <div className="px-4 pb-4 pt-1 ml-10 mr-4">
                      <div className="bg-zinc-50 border border-zinc-200 rounded-lg overflow-hidden">
                        <div className="flex items-center justify-between px-3 py-2 border-b border-zinc-200">
                          <div className="flex items-center gap-2">
                            <Code2 className="w-3.5 h-3.5 text-violet-500" />
                            <span className="text-xs font-medium text-zinc-500">Generated SQL</span>
                          </div>
                          <button onClick={() => copySql(entry.id, entry.sql)} className="text-xs text-zinc-400 hover:text-zinc-600 flex items-center gap-1">
                            {copiedId === entry.id ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                            {copiedId === entry.id ? 'Copied' : 'Copy'}
                          </button>
                        </div>
                        <pre className="p-3 text-[12px] leading-relaxed text-zinc-600 font-mono overflow-x-auto">{entry.sql}</pre>
                      </div>
                      <div className="flex items-center gap-4 mt-3 flex-wrap">
                        <div className="flex items-center gap-1.5 text-xs text-zinc-500"><Database className="w-3.5 h-3.5" />{entry.databases.join(', ')}</div>
                        <div className="flex items-center gap-1.5 text-xs text-zinc-500"><Table2 className="w-3.5 h-3.5" />{entry.tables.join(', ')}</div>
                        <div className="flex items-center gap-1.5 text-xs text-zinc-500"><User className="w-3.5 h-3.5" />{entry.author.name}</div>
                        <div className="flex items-center gap-1.5 text-xs text-zinc-500"><Clock className="w-3.5 h-3.5" />{new Date(entry.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
                        <div className="flex-1" />
                        <button className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium transition-colors"><Play className="w-3 h-3" /> Re-run</button>
                        <button className="flex items-center gap-1.5 px-3 py-1.5 border border-zinc-200 rounded-lg text-xs font-medium text-zinc-600 hover:bg-zinc-100 transition-colors"><Download className="w-3 h-3" /> Export</button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            {filtered.length === 0 && (
              <div className="py-16 flex flex-col items-center text-zinc-400">
                <Clock className="w-8 h-8 mb-2 opacity-50" />
                <p className="text-sm">No queries match your filters</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
