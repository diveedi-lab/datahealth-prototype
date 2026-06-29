import { useState } from 'react';
import { Search, Filter, Download, ChevronDown, Close, View } from '@carbon/icons-react';

type Severity = 'Info' | 'Warning' | 'Error' | 'Critical';
type Category = 'Data' | 'User' | 'System' | 'Query' | 'Import' | 'Export' | 'Config';

interface LogEntry {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  category: Category;
  severity: Severity;
  resource: string;
  details: string;
  ip: string;
  sessionId: string;
  duration: string;
}

const MOCK_LOGS: LogEntry[] = [
  { id: 'log-001', timestamp: '2026-04-14 09:42:18', user: 'elena.rossi@pharma.com', action: 'CREATE_ENTITY', category: 'Data', severity: 'Info', resource: 'Entity: patient_reported_outcomes', details: 'Created new custom entity with 15 variables', ip: '192.168.1.45', sessionId: 'sess-a8f3c2', duration: '1.2s' },
  { id: 'log-002', timestamp: '2026-04-14 09:38:05', user: 'hans.muller@clz.ch', action: 'EXPORT_DATA', category: 'Export', severity: 'Info', resource: 'Study: ONCO-2024-001', details: 'Exported SDTM datasets (DM, AE, LB) in SAS XPT format', ip: '10.0.0.112', sessionId: 'sess-b2d4e1', duration: '4.8s' },
  { id: 'log-003', timestamp: '2026-04-14 09:35:22', user: 'sarah.williams@medpath.co.uk', action: 'MODIFY_VARIABLE', category: 'Data', severity: 'Warning', resource: 'Variable: AESEV in AE', details: 'Changed codelist from CL.SEVERITY to CL.SEVERITY_V2. Previous codelist had 3 values, new one has 5.', ip: '172.16.0.88', sessionId: 'sess-c7f9a3', duration: '0.8s' },
  { id: 'log-004', timestamp: '2026-04-14 09:30:11', user: 'admin@platform.io', action: 'BULK_IMPORT', category: 'Import', severity: 'Info', resource: 'Database: CARDIO-RWE-01', details: 'Imported 12,847 records from EHR extract. 3 records rejected (missing person_id).', ip: '10.0.0.1', sessionId: 'sess-d1e5b7', duration: '32.4s' },
  { id: 'log-005', timestamp: '2026-04-14 09:22:47', user: 'klaus.weber@bioanalytica.de', action: 'EXECUTE_QUERY', category: 'Query', severity: 'Info', resource: 'Query: Adverse Events by Severity', details: 'SELECT query on AE entity, returned 2,341 rows. Execution plan: full table scan.', ip: '192.168.2.15', sessionId: 'sess-e4c8d2', duration: '1.5s' },
  { id: 'log-006', timestamp: '2026-04-14 09:18:33', user: 'admin@platform.io', action: 'DELETE_RECORDS', category: 'Data', severity: 'Critical', resource: 'Database: RARE-GEN-001', details: 'Deleted 42 duplicate records from person table. Backup created before deletion: bkp-20260414-0918.', ip: '10.0.0.1', sessionId: 'sess-d1e5b7', duration: '2.1s' },
  { id: 'log-007', timestamp: '2026-04-14 09:12:05', user: 'jan.devries@genomescan.nl', action: 'UPDATE_CONFIG', category: 'Config', severity: 'Warning', resource: 'Lab: GenomeScan BV', details: 'Updated turnaround time from 14 days to 10 days. Changed contact email.', ip: '10.10.5.22', sessionId: 'sess-f3a7b1', duration: '0.3s' },
  { id: 'log-008', timestamp: '2026-04-14 09:05:18', user: 'elena.rossi@pharma.com', action: 'CREATE_STUDY', category: 'Data', severity: 'Info', resource: 'Project: Oncology Research Program', details: 'Created child study ONCO-BIO-003 of type Biomarker Study with 5 metadata fields.', ip: '192.168.1.45', sessionId: 'sess-a8f3c2', duration: '0.9s' },
  { id: 'log-009', timestamp: '2026-04-14 08:55:42', user: 'system', action: 'AUTO_BACKUP', category: 'System', severity: 'Info', resource: 'All Databases', details: 'Scheduled daily backup completed. Total size: 2.4 GB. Stored to: s3://backups/20260414/', ip: '10.0.0.1', sessionId: 'sys-backup', duration: '145.2s' },
  { id: 'log-010', timestamp: '2026-04-14 08:48:11', user: 'maria.bianchi@hsr.it', action: 'FAILED_IMPORT', category: 'Import', severity: 'Error', resource: 'Database: CHR-CARDIO-01', details: 'Import failed: CSV file has 28 columns, expected 24. File: cardio_vitals_20260413.csv', ip: '172.16.1.50', sessionId: 'sess-g2h8c4', duration: '0.4s' },
  { id: 'log-011', timestamp: '2026-04-14 08:40:29', user: 'thomas.meier@charite.de', action: 'SHARE_DATASET', category: 'Export', severity: 'Info', resource: 'Study: CHR-CARDIO-01', details: 'Shared anonymized dataset with Cardiology Data Hub consortium. 120 patients, 8 variables.', ip: '192.168.3.77', sessionId: 'sess-h5j2k9', duration: '3.2s' },
  { id: 'log-012', timestamp: '2026-04-14 08:32:55', user: 'admin@platform.io', action: 'ROLE_CHANGE', category: 'User', severity: 'Warning', resource: 'User: wei.tan@brs.sg', details: 'Role changed from Viewer to Data Manager. Approved by admin@platform.io.', ip: '10.0.0.1', sessionId: 'sess-d1e5b7', duration: '0.2s' },
  { id: 'log-013', timestamp: '2026-04-14 08:20:03', user: 'system', action: 'SCHEMA_MIGRATION', category: 'System', severity: 'Warning', resource: 'Database: ONCO-2024-001', details: 'Applied schema migration v3.4.1 → v3.4.2. Added 2 new columns to LB entity.', ip: '10.0.0.1', sessionId: 'sys-migrate', duration: '8.7s' },
  { id: 'log-014', timestamp: '2026-04-14 08:10:44', user: 'pierre.lambert@sbp.ch', action: 'UPDATE_BIOBANK', category: 'Config', severity: 'Info', resource: 'Biobank: Swiss Biobanking Platform', details: 'Updated current occupancy from 65% to 68%. Added new sample type: Organoids.', ip: '10.10.8.33', sessionId: 'sess-i9m1n6', duration: '0.5s' },
  { id: 'log-015', timestamp: '2026-04-14 07:55:18', user: 'system', action: 'ETL_PIPELINE', category: 'System', severity: 'Error', resource: 'Connector: HL7-FHIR-Bridge', details: 'ETL pipeline failed at transformation step. Error: unmapped concept_id 44819283. 1,200 of 5,000 records processed.', ip: '10.0.0.1', sessionId: 'sys-etl', duration: '67.3s' },
];

const severityColors: Record<string, string> = {
  Info: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
  Warning: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
  Error: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
  Critical: 'bg-red-200 text-red-900 dark:bg-red-900/60 dark:text-red-200',
};

const categoryColors: Record<string, string> = {
  Data: 'bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-300',
  User: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/40 dark:text-cyan-300',
  System: 'bg-zinc-200 text-zinc-700 dark:bg-zinc-700/40 dark:text-zinc-300',
  Query: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300',
  Import: 'bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300',
  Export: 'bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300',
  Config: 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300',
};

export function OperationLogs() {
  const [logs] = useState(MOCK_LOGS);
  const [search, setSearch] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('All');
  const [filterCategory, setFilterCategory] = useState('All');
  const [selected, setSelected] = useState<LogEntry | null>(null);

  const filtered = logs.filter(l => {
    const q = search.toLowerCase();
    const matchSearch = l.user.toLowerCase().includes(q) || l.action.toLowerCase().includes(q) || l.resource.toLowerCase().includes(q) || l.details.toLowerCase().includes(q);
    const matchSev = filterSeverity === 'All' || l.severity === filterSeverity;
    const matchCat = filterCategory === 'All' || l.category === filterCategory;
    return matchSearch && matchSev && matchCat;
  });

  return (
    <div className="h-full flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-zinc-900 dark:text-zinc-100">Operation Logs</h1>
          <p className="text-[14px] text-zinc-500 dark:text-zinc-400 mt-1">Complete audit trail of all user and system actions</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-[14px]">
          <Download size={16} /> Export Logs
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 items-center">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input type="text" placeholder="Search by user, action, resource, or details..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-[14px] text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 outline-none focus:ring-2 focus:ring-zinc-900/10 dark:focus:ring-zinc-100/10" />
        </div>
        <select value={filterSeverity} onChange={e => setFilterSeverity(e.target.value)} className="px-3 py-2.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-[14px] text-zinc-900 dark:text-zinc-100 outline-none">
          <option value="All">All Severities</option>
          <option>Info</option><option>Warning</option><option>Error</option><option>Critical</option>
        </select>
        <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} className="px-3 py-2.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-[14px] text-zinc-900 dark:text-zinc-100 outline-none">
          <option value="All">All Categories</option>
          <option>Data</option><option>User</option><option>System</option><option>Query</option><option>Import</option><option>Export</option><option>Config</option>
        </select>
      </div>

      <p className="text-[13px] text-zinc-500 dark:text-zinc-400">{filtered.length} log entries</p>

      {/* Table */}
      <div className="flex-1 overflow-auto bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl">
        <table className="w-full">
          <thead>
            <tr className="border-b border-zinc-200 dark:border-zinc-800">
              {['Timestamp', 'Severity', 'Category', 'User', 'Action', 'Resource', 'Duration'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-[12px] text-zinc-500 dark:text-zinc-400 whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(log => (
              <tr key={log.id} className="border-b last:border-b-0 border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/30 cursor-pointer transition-colors" onClick={() => setSelected(log)}>
                <td className="px-4 py-3 text-[13px] text-zinc-500 dark:text-zinc-400 font-mono whitespace-nowrap">{log.timestamp}</td>
                <td className="px-4 py-3"><span className={`text-[11px] px-2 py-0.5 rounded-full ${severityColors[log.severity]}`}>{log.severity}</span></td>
                <td className="px-4 py-3"><span className={`text-[11px] px-2 py-0.5 rounded-full ${categoryColors[log.category]}`}>{log.category}</span></td>
                <td className="px-4 py-3 text-[13px] text-zinc-700 dark:text-zinc-300 max-w-[180px] truncate">{log.user}</td>
                <td className="px-4 py-3 text-[13px] text-zinc-900 dark:text-zinc-100 font-mono">{log.action}</td>
                <td className="px-4 py-3 text-[13px] text-zinc-600 dark:text-zinc-400 max-w-[200px] truncate">{log.resource}</td>
                <td className="px-4 py-3 text-[12px] text-zinc-400">{log.duration}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <div className="p-10 text-center text-zinc-400 text-[14px]">No logs match your filters</div>}
      </div>

      {/* Detail */}
      {selected && (
        <div className="fixed inset-0 bg-black/30 dark:bg-black/50 z-50 flex justify-end" onClick={() => setSelected(null)}>
          <div className="w-[540px] bg-white dark:bg-zinc-900 h-full shadow-xl overflow-auto" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <div>
                <h2 className="text-zinc-900 dark:text-zinc-100 font-mono">{selected.action}</h2>
                <p className="text-[13px] text-zinc-500 dark:text-zinc-400">{selected.timestamp}</p>
              </div>
              <button onClick={() => setSelected(null)} className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg"><Close size={20} className="text-zinc-400" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex gap-2 flex-wrap">
                <span className={`text-[11px] px-2.5 py-1 rounded-full ${severityColors[selected.severity]}`}>{selected.severity}</span>
                <span className={`text-[11px] px-2.5 py-1 rounded-full ${categoryColors[selected.category]}`}>{selected.category}</span>
              </div>
              {[
                { label: 'User', value: selected.user },
                { label: 'Resource', value: selected.resource },
                { label: 'Details', value: selected.details },
                { label: 'IP Address', value: selected.ip },
                { label: 'Session ID', value: selected.sessionId },
                { label: 'Duration', value: selected.duration },
              ].map(f => (
                <div key={f.label}>
                  <p className="text-[12px] text-zinc-500 dark:text-zinc-400 mb-1">{f.label}</p>
                  <p className="text-[14px] text-zinc-900 dark:text-zinc-100 break-all">{f.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
