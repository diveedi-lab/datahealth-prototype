import React, { useState } from 'react';
import {
  Search, Eye, Download, Copy, Check, Table2, Code2, X, Database, Play,
  Lock, Globe, Users, Shield, ShieldCheck, Star, StarOff, Pencil, Trash2,
  Clock, MoreHorizontal, Share2
} from 'lucide-react';

// ─── Types ───

interface SavedQuery {
  id: string;
  name: string;
  description: string;
  prompt: string;
  sql: string;
  databases: string[];
  tables: string[];
  lastRun: string;
  createdAt: string;
  author: { name: string; email: string; avatar: string };
  visibility: 'private' | 'team' | 'public';
  permissions: { type: 'owner' | 'editor' | 'viewer'; users: { name: string; email: string; avatar: string }[] }[];
  starred: boolean;
  runCount: number;
}

// ─── Mock Data ───

const DB_COLORS: Record<string, string> = {
  'CARDIO-2024': 'bg-rose-500', 'ONCO-TRIAL-A': 'bg-amber-500',
  'NEURO-PHASE3': 'bg-violet-500', 'RESP-PILOT': 'bg-emerald-500', 'DERM-COHORT-B': 'bg-blue-500',
};

const VIS_CONFIG = {
  private: { icon: Lock, label: 'Private', cls: 'text-zinc-500 bg-zinc-100 dark:bg-zinc-800' },
  team: { icon: Users, label: 'Team', cls: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30' },
  public: { icon: Globe, label: 'Public', cls: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30' },
};

const PERM_CONFIG = {
  owner: { icon: ShieldCheck, cls: 'text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/30', label: 'Owner' },
  editor: { icon: Shield, cls: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30', label: 'Editor' },
  viewer: { icon: Eye, cls: 'text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800', label: 'Viewer' },
};

const MOCK_SAVED: SavedQuery[] = [
  {
    id: 'SQ-001', name: 'Active patients with labs', description: 'Active patients over 30 from CARDIO-2024 joined with lab results and adverse events.',
    prompt: 'Show all active patients over 30 with their latest lab results and adverse events',
    sql: "SELECT p.*, lr.test_name, lr.value\nFROM patients p\nJOIN lab_results lr ON p.patient_id = lr.patient_id\nWHERE p.status = 'Active' AND p.age >= 30;",
    databases: ['CARDIO-2024'], tables: ['patients', 'lab_results', 'adverse_events'],
    lastRun: '2026-04-09T14:23:00', createdAt: '2026-03-15T10:00:00',
    author: { name: 'You', email: 'admin@datalake.io', avatar: 'Y' },
    visibility: 'team',
    permissions: [
      { type: 'owner', users: [{ name: 'You', email: 'admin@datalake.io', avatar: 'Y' }] },
      { type: 'editor', users: [{ name: 'Dr. M. Rossi', email: 'm.rossi@clinic.org', avatar: 'MR' }] },
      { type: 'viewer', users: [{ name: 'Dr. L. Bianchi', email: 'l.bianchi@clinic.org', avatar: 'LB' }] },
    ],
    starred: true, runCount: 23,
  },
  {
    id: 'SQ-002', name: 'High troponin cohort', description: 'Patients with elevated troponin I values and their current medications.',
    prompt: 'Find patients with high troponin values and their current medication history',
    sql: "SELECT p.patient_id, p.age, lr.value AS troponin, m.drug_name, m.dose\nFROM patients p\nJOIN lab_results lr ON p.patient_id = lr.patient_id\nJOIN medications m ON p.patient_id = m.patient_id\nWHERE lr.test_name = 'Troponin I' AND lr.flag = 'High';",
    databases: ['CARDIO-2024'], tables: ['patients', 'lab_results', 'medications'],
    lastRun: '2026-04-09T11:05:00', createdAt: '2026-03-20T14:30:00',
    author: { name: 'Dr. M. Rossi', email: 'm.rossi@clinic.org', avatar: 'MR' },
    visibility: 'team',
    permissions: [
      { type: 'owner', users: [{ name: 'Dr. M. Rossi', email: 'm.rossi@clinic.org', avatar: 'MR' }] },
      { type: 'viewer', users: [{ name: 'You', email: 'admin@datalake.io', avatar: 'Y' }, { name: 'Dr. L. Bianchi', email: 'l.bianchi@clinic.org', avatar: 'LB' }] },
    ],
    starred: true, runCount: 15,
  },
  {
    id: 'SQ-003', name: 'Moderate+ AEs cross-study', description: 'Adverse events with severity moderate or higher across CARDIO and NEURO studies.',
    prompt: 'Get all adverse events with severity moderate or higher across studies',
    sql: "SELECT ae.*, p.age, p.gender, p.site_id\nFROM adverse_events ae\nJOIN patients p ON ae.patient_id = p.patient_id\nWHERE ae.severity IN ('Moderate','Severe','Critical');",
    databases: ['CARDIO-2024', 'NEURO-PHASE3'], tables: ['adverse_events', 'patients'],
    lastRun: '2026-04-08T09:18:00', createdAt: '2026-02-28T11:00:00',
    author: { name: 'You', email: 'admin@datalake.io', avatar: 'Y' },
    visibility: 'public',
    permissions: [
      { type: 'owner', users: [{ name: 'You', email: 'admin@datalake.io', avatar: 'Y' }] },
      { type: 'editor', users: [{ name: 'Dr. M. Rossi', email: 'm.rossi@clinic.org', avatar: 'MR' }] },
      { type: 'viewer', users: [{ name: 'Dr. L. Bianchi', email: 'l.bianchi@clinic.org', avatar: 'LB' }, { name: 'Dr. A. Verdi', email: 'a.verdi@clinic.org', avatar: 'AV' }] },
    ],
    starred: false, runCount: 8,
  },
  {
    id: 'SQ-004', name: 'Cross-study overlap', description: 'Patient overlap between CARDIO-2024 and NEURO-PHASE3 databases.',
    prompt: 'Cross-database patient overlap between CARDIO-2024 and NEURO-PHASE3',
    sql: "SELECT c.patient_id, c.age, c.gender\nFROM cardio_2024.patients c\nJOIN neuro_phase3.patients n ON c.patient_id = n.patient_id;",
    databases: ['CARDIO-2024', 'NEURO-PHASE3'], tables: ['patients'],
    lastRun: '2026-04-06T10:30:00', createdAt: '2026-03-01T09:00:00',
    author: { name: 'Dr. M. Rossi', email: 'm.rossi@clinic.org', avatar: 'MR' },
    visibility: 'public',
    permissions: [
      { type: 'owner', users: [{ name: 'Dr. M. Rossi', email: 'm.rossi@clinic.org', avatar: 'MR' }] },
      { type: 'viewer', users: [{ name: 'You', email: 'admin@datalake.io', avatar: 'Y' }, { name: 'Dr. L. Bianchi', email: 'l.bianchi@clinic.org', avatar: 'LB' }, { name: 'Dr. A. Verdi', email: 'a.verdi@clinic.org', avatar: 'AV' }] },
    ],
    starred: false, runCount: 5,
  },
  {
    id: 'SQ-005', name: 'Monthly enrollments DERM', description: 'Monthly enrollment count for DERM-COHORT-B during 2025.',
    prompt: 'Count enrolled patients per month for DERM-COHORT-B in 2025',
    sql: "SELECT DATE_TRUNC('month', enrollment_date) AS month, COUNT(*)\nFROM patients WHERE enrollment_date >= '2025-01-01'\nGROUP BY 1 ORDER BY 1;",
    databases: ['DERM-COHORT-B'], tables: ['patients'],
    lastRun: '2026-04-05T08:12:00', createdAt: '2026-03-10T16:00:00',
    author: { name: 'You', email: 'admin@datalake.io', avatar: 'Y' },
    visibility: 'private',
    permissions: [
      { type: 'owner', users: [{ name: 'You', email: 'admin@datalake.io', avatar: 'Y' }] },
    ],
    starred: false, runCount: 3,
  },
];

// ─── Detail Panel ───

function DetailPanel({ query, onClose }: { query: SavedQuery; onClose: () => void }) {
  const [sqlCopied, setSqlCopied] = useState(false);
  const vis = VIS_CONFIG[query.visibility];
  const VisIcon = vis.icon;

  const copySql = () => {
    navigator.clipboard.writeText(query.sql);
    setSqlCopied(true);
    setTimeout(() => setSqlCopied(false), 2000);
  };

  return (
    <div className="w-full lg:w-[420px] shrink-0 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm flex flex-col overflow-hidden transition-colors">
      <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-xs font-mono text-zinc-400">{query.id}</span>
            <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full ${vis.cls}`}>
              <VisIcon className="w-3 h-3" />{vis.label}
            </span>
          </div>
          <p className="text-sm font-semibold text-zinc-900 dark:text-white">{query.name}</p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">{query.description}</p>
        </div>
        <button onClick={onClose} className="p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800"><X className="w-4 h-4" /></button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Meta */}
        <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 grid grid-cols-2 gap-3">
          <div>
            <p className="text-[11px] uppercase tracking-wider text-zinc-400 mb-1">Author</p>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center text-[10px] font-medium text-zinc-600 dark:text-zinc-300 shrink-0">{query.author.avatar}</div>
              <span className="text-sm text-zinc-700 dark:text-zinc-300 truncate">{query.author.name}</span>
            </div>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wider text-zinc-400 mb-1">Last run</p>
            <p className="text-sm text-zinc-700 dark:text-zinc-300">{new Date(query.lastRun).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wider text-zinc-400 mb-1">Total runs</p>
            <p className="text-sm text-zinc-700 dark:text-zinc-300">{query.runCount}</p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wider text-zinc-400 mb-1">Created</p>
            <p className="text-sm text-zinc-700 dark:text-zinc-300">{new Date(query.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
          </div>
        </div>

        {/* NL Prompt */}
        <div className="p-4 border-b border-zinc-100 dark:border-zinc-800">
          <p className="text-[11px] uppercase tracking-wider text-zinc-400 mb-2">Natural language prompt</p>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 italic leading-relaxed">"{query.prompt}"</p>
        </div>

        {/* DBs & Tables */}
        <div className="p-4 border-b border-zinc-100 dark:border-zinc-800">
          <p className="text-[11px] uppercase tracking-wider text-zinc-400 mb-2">Databases</p>
          <div className="flex flex-wrap gap-1.5 mb-3">
            {query.databases.map(db => (
              <span key={db} className="inline-flex items-center gap-1.5 px-2 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-md text-xs font-medium text-zinc-700 dark:text-zinc-300">
                <span className={`w-2 h-2 rounded-full ${DB_COLORS[db] || 'bg-zinc-400'}`} />{db}
              </span>
            ))}
          </div>
          <p className="text-[11px] uppercase tracking-wider text-zinc-400 mb-2">Tables</p>
          <div className="flex flex-wrap gap-1.5">
            {query.tables.map(t => (
              <span key={t} className="inline-flex items-center gap-1 px-2 py-1 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-md text-xs text-zinc-600 dark:text-zinc-400">
                <Table2 className="w-3 h-3" />{t}
              </span>
            ))}
          </div>
        </div>

        {/* SQL */}
        <div className="p-4 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <Code2 className="w-3.5 h-3.5 text-violet-500" />
              <p className="text-[11px] uppercase tracking-wider text-zinc-400">Generated SQL</p>
            </div>
            <button onClick={copySql} className="text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 flex items-center gap-1">
              {sqlCopied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
              {sqlCopied ? 'Copied' : 'Copy'}
            </button>
          </div>
          <pre className="text-[12px] leading-relaxed text-zinc-600 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-900/50 rounded-lg p-3 overflow-x-auto font-mono border border-zinc-200 dark:border-zinc-800">{query.sql}</pre>
        </div>

        {/* Permissions */}
        <div className="p-4">
          <p className="text-[11px] uppercase tracking-wider text-zinc-400 mb-3">Permissions</p>
          <div className="space-y-3">
            {query.permissions.map(perm => {
              const cfg = PERM_CONFIG[perm.type];
              const PermIcon = cfg.icon;
              return (
                <div key={perm.type}>
                  <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full ${cfg.cls} mb-1.5`}>
                    <PermIcon className="w-3 h-3" />{cfg.label}
                  </span>
                  <div className="space-y-1 ml-1">
                    {perm.users.map(u => (
                      <div key={u.email} className="flex items-center gap-2 py-1">
                        <div className="w-6 h-6 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center text-[10px] font-medium text-zinc-600 dark:text-zinc-300 shrink-0">{u.avatar}</div>
                        <div className="min-w-0">
                          <p className="text-sm text-zinc-700 dark:text-zinc-300 truncate">{u.name}</p>
                          <p className="text-[11px] text-zinc-400 truncate">{u.email}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="p-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center gap-2 shrink-0">
        <button className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium transition-colors">
          <Play className="w-3.5 h-3.5" /> Run
        </button>
        <button className="flex items-center justify-center gap-1.5 px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs font-medium text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
          <Share2 className="w-3.5 h-3.5" /> Share
        </button>
        <button className="flex items-center justify-center gap-1.5 px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs font-medium text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
          <Download className="w-3.5 h-3.5" /> Export
        </button>
      </div>
    </div>
  );
}

// ─── Main ───

export function SavedQueries() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterVis, setFilterVis] = useState('all');
  const [queries, setQueries] = useState(MOCK_SAVED);
  const [selected, setSelected] = useState<SavedQuery | null>(null);

  const toggleStar = (id: string) => {
    setQueries(prev => prev.map(q => q.id === id ? { ...q, starred: !q.starred } : q));
  };

  const filtered = queries.filter(q => {
    const matchSearch = !searchTerm || q.name.toLowerCase().includes(searchTerm.toLowerCase()) || q.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchVis = filterVis === 'all' || q.visibility === filterVis;
    return matchSearch && matchVis;
  }).sort((a, b) => (a.starred === b.starred ? 0 : a.starred ? -1 : 1));

  return (
    <div className="flex gap-4 h-full w-full min-h-0">
      <div className="flex-1 flex flex-col min-w-0 min-h-0">
        {/* Filters */}
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search saved queries..."
              className="w-full pl-9 pr-4 py-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:text-zinc-200 transition-colors" />
          </div>
          <select value={filterVis} onChange={e => setFilterVis(e.target.value)}
            className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-sm text-zinc-700 dark:text-zinc-300 focus:ring-2 focus:ring-blue-500/50 outline-none">
            <option value="all">All visibility</option>
            <option value="private">Private</option>
            <option value="team">Team</option>
            <option value="public">Public</option>
          </select>
          <span className="text-xs text-zinc-400">{filtered.length} saved queries</span>
        </div>

        {/* Cards Grid */}
        <div className="flex-1 overflow-auto">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
            {filtered.map(q => {
              const vis = VIS_CONFIG[q.visibility];
              const VisIcon = vis.icon;
              const isSelected = selected?.id === q.id;
              return (
                <div
                  key={q.id}
                  onClick={() => setSelected(q)}
                  className={`bg-white dark:bg-zinc-950 border rounded-xl p-4 cursor-pointer transition-all hover:shadow-md ${
                    isSelected ? 'border-blue-400 dark:border-blue-600 shadow-md ring-1 ring-blue-200 dark:ring-blue-900' : 'border-zinc-200 dark:border-zinc-800'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-semibold text-zinc-900 dark:text-white truncate">{q.name}</p>
                        <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full shrink-0 ${vis.cls}`}>
                          <VisIcon className="w-2.5 h-2.5" />{vis.label}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2">{q.description}</p>
                    </div>
                    <button
                      onClick={e => { e.stopPropagation(); toggleStar(q.id); }}
                      className="shrink-0 p-1 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                    >
                      {q.starred ? <Star className="w-4 h-4 text-amber-500 fill-amber-500" /> : <StarOff className="w-4 h-4 text-zinc-300 dark:text-zinc-600" />}
                    </button>
                  </div>

                  <div className="flex items-center gap-3 mt-3 flex-wrap">
                    <div className="flex items-center gap-1">
                      {q.databases.map(db => (
                        <span key={db} className={`w-2 h-2 rounded-full ${DB_COLORS[db] || 'bg-zinc-400'}`} title={db} />
                      ))}
                      <span className="text-[11px] text-zinc-400 ml-1">{q.databases.join(', ')}</span>
                    </div>
                    <div className="flex-1" />
                    <div className="flex items-center gap-1.5 text-[11px] text-zinc-400">
                      <Play className="w-3 h-3" />{q.runCount} runs
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-zinc-400">
                      <Clock className="w-3 h-3" />{new Date(q.lastRun).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-5 h-5 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center text-[9px] font-medium text-zinc-600 dark:text-zinc-300">{q.author.avatar}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          {filtered.length === 0 && (
            <div className="py-16 flex flex-col items-center text-zinc-400 dark:text-zinc-600">
              <Search className="w-8 h-8 mb-2 opacity-50" />
              <p className="text-sm">No saved queries found</p>
            </div>
          )}
        </div>
      </div>

      {selected && <DetailPanel query={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
