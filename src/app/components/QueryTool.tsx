import React, { useState, useRef, useEffect } from 'react';
import {
  Play, Save, Download, Database, Sparkles, X, ChevronDown, ChevronRight,
  Copy, Check, Table2, ArrowRight, Loader2, MessageSquare, Code2, Eye, EyeOff,
  RotateCcw, Maximize2, Minimize2, Plus, FileText, Pencil, CornerDownLeft
} from 'lucide-react';

// ─── Mock Data ──────────────────────────────────────────────────────────

const AVAILABLE_DATABASES = [
  { id: 'cardio-2024', name: 'CARDIO-2024', tables: 14, records: '1.2M', color: 'bg-rose-500' },
  { id: 'onco-trial-a', name: 'ONCO-TRIAL-A', tables: 22, records: '3.8M', color: 'bg-amber-500' },
  { id: 'neuro-phase3', name: 'NEURO-PHASE3', tables: 18, records: '2.1M', color: 'bg-violet-500' },
  { id: 'resp-pilot', name: 'RESP-PILOT', tables: 8, records: '420K', color: 'bg-emerald-500' },
  { id: 'derm-cohort-b', name: 'DERM-COHORT-B', tables: 11, records: '780K', color: 'bg-blue-500' },
];

interface ResultTable {
  name: string;
  columns: string[];
  rows: Record<string, string | number>[];
  totalRows: number;
}

const MOCK_RESULT_TABLES: ResultTable[] = [
  {
    name: 'patients',
    columns: ['patient_id', 'age', 'gender', 'enrollment_date', 'site_id', 'status'],
    rows: [
      { patient_id: 'PT-1001', age: 45, gender: 'M', enrollment_date: '2023-01-15', site_id: 'Site A', status: 'Active' },
      { patient_id: 'PT-1002', age: 32, gender: 'F', enrollment_date: '2023-02-10', site_id: 'Site B', status: 'Active' },
      { patient_id: 'PT-1003', age: 58, gender: 'M', enrollment_date: '2023-03-22', site_id: 'Site A', status: 'Active' },
      { patient_id: 'PT-1005', age: 61, gender: 'F', enrollment_date: '2023-05-18', site_id: 'Site B', status: 'Active' },
      { patient_id: 'PT-1006', age: 37, gender: 'M', enrollment_date: '2023-06-12', site_id: 'Site A', status: 'Active' },
      { patient_id: 'PT-1008', age: 41, gender: 'F', enrollment_date: '2023-08-14', site_id: 'Site B', status: 'Active' },
    ],
    totalRows: 142,
  },
  {
    name: 'lab_results',
    columns: ['lab_id', 'patient_id', 'test_name', 'value', 'unit', 'collection_date', 'flag'],
    rows: [
      { lab_id: 'LB-4401', patient_id: 'PT-1001', test_name: 'Troponin I', value: 0.04, unit: 'ng/mL', collection_date: '2024-01-20', flag: 'Normal' },
      { lab_id: 'LB-4402', patient_id: 'PT-1001', test_name: 'BNP', value: 125, unit: 'pg/mL', collection_date: '2024-01-20', flag: 'Normal' },
      { lab_id: 'LB-4403', patient_id: 'PT-1002', test_name: 'Troponin I', value: 0.12, unit: 'ng/mL', collection_date: '2024-01-22', flag: 'High' },
      { lab_id: 'LB-4404', patient_id: 'PT-1003', test_name: 'CRP', value: 8.5, unit: 'mg/L', collection_date: '2024-01-18', flag: 'High' },
      { lab_id: 'LB-4405', patient_id: 'PT-1005', test_name: 'LDL', value: 142, unit: 'mg/dL', collection_date: '2024-02-01', flag: 'High' },
    ],
    totalRows: 856,
  },
  {
    name: 'adverse_events',
    columns: ['ae_id', 'patient_id', 'event_name', 'severity', 'start_date', 'resolution_date', 'related'],
    rows: [
      { ae_id: 'AE-201', patient_id: 'PT-1001', event_name: 'Headache', severity: 'Mild', start_date: '2024-01-25', resolution_date: '2024-01-26', related: 'Unlikely' },
      { ae_id: 'AE-202', patient_id: 'PT-1003', event_name: 'Nausea', severity: 'Moderate', start_date: '2024-01-30', resolution_date: '2024-02-02', related: 'Possible' },
      { ae_id: 'AE-203', patient_id: 'PT-1006', event_name: 'Dizziness', severity: 'Mild', start_date: '2024-02-05', resolution_date: '2024-02-05', related: 'Probable' },
    ],
    totalRows: 47,
  },
];

const MOCK_GENERATED_SQL = `-- Generated from natural language query
-- Target databases: CARDIO-2024

SELECT p.patient_id, p.age, p.gender, p.enrollment_date,
       p.site_id, p.status
FROM   patients p
WHERE  p.status = 'Active'
  AND  p.age >= 30;

SELECT lr.lab_id, lr.patient_id, lr.test_name,
       lr.value, lr.unit, lr.collection_date, lr.flag
FROM   lab_results lr
  JOIN patients p ON lr.patient_id = p.patient_id
WHERE  p.status = 'Active'
  AND  p.age >= 30
  AND  lr.collection_date >= '2024-01-01';

SELECT ae.ae_id, ae.patient_id, ae.event_name,
       ae.severity, ae.start_date, ae.resolution_date, ae.related
FROM   adverse_events ae
  JOIN patients p ON ae.patient_id = p.patient_id
WHERE  p.status = 'Active'
  AND  p.age >= 30;`;

const EXAMPLE_PROMPTS = [
  'Show all active patients over 30 with their latest lab results and adverse events',
  'Find patients with high troponin values and their medication history',
  'List all sites with patient counts, enrollment trends, and completion rates',
  'Get adverse events flagged as probable, with patient demographics and lab values',
];

// ─── Components ─────────────────────────────────────────────────────────

function DatabaseSelector({
  selected,
  onToggle,
}: {
  selected: Set<string>;
  onToggle: (id: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen]);

  const selectedDbs = AVAILABLE_DATABASES.filter(db => selected.has(db.id));

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm hover:border-blue-400 dark:hover:border-blue-500 transition-colors min-w-[200px]"
      >
        <Database className="w-4 h-4 text-blue-500 shrink-0" />
        <span className="flex-1 text-left truncate text-zinc-700 dark:text-zinc-200">
          {selectedDbs.length === 0
            ? 'Select databases...'
            : selectedDbs.length === 1
            ? selectedDbs[0].name
            : `${selectedDbs.length} databases selected`}
        </span>
        <ChevronDown className={`w-4 h-4 text-zinc-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full mt-1 w-80 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-xl z-50 overflow-hidden">
          <div className="px-3 py-2 border-b border-zinc-100 dark:border-zinc-800 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
            Available Databases
          </div>
          <div className="max-h-64 overflow-y-auto p-1.5">
            {AVAILABLE_DATABASES.map(db => {
              const isSelected = selected.has(db.id);
              return (
                <button
                  key={db.id}
                  onClick={() => onToggle(db.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                    isSelected
                      ? 'bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800'
                      : 'hover:bg-zinc-50 dark:hover:bg-zinc-800 border border-transparent'
                  }`}
                >
                  <div className={`w-2.5 h-2.5 rounded-full ${db.color} shrink-0`} />
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${isSelected ? 'text-blue-700 dark:text-blue-300' : 'text-zinc-800 dark:text-zinc-200'}`}>
                      {db.name}
                    </p>
                    <p className="text-[11px] text-zinc-400 dark:text-zinc-500">
                      {db.tables} tables · {db.records} records
                    </p>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-blue-500 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function SqlEditor({
  sql,
  editedSql,
  onEditedSqlChange,
  isVisible,
  onToggle,
  isEditing,
  onToggleEditing,
  onReRunSql,
  isReRunning,
}: {
  sql: string;
  editedSql: string;
  onEditedSqlChange: (v: string) => void;
  isVisible: boolean;
  onToggle: () => void;
  isEditing: boolean;
  onToggleEditing: () => void;
  onReRunSql: () => void;
  isReRunning: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const currentSql = isEditing ? editedSql : sql;
  const isModified = editedSql !== sql;

  const handleCopy = () => {
    navigator.clipboard.writeText(currentSql);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleEditorKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      onReRunSql();
    }
    if (e.key === 'Tab') {
      e.preventDefault();
      const ta = editorRef.current;
      if (ta) {
        const start = ta.selectionStart;
        const end = ta.selectionEnd;
        const newVal = editedSql.substring(0, start) + '  ' + editedSql.substring(end);
        onEditedSqlChange(newVal);
        requestAnimationFrame(() => { ta.selectionStart = ta.selectionEnd = start + 2; });
      }
    }
  };

  return (
    <div className={`bg-white dark:bg-zinc-950 border rounded-xl overflow-hidden transition-colors ${isEditing ? 'border-violet-300 dark:border-violet-700 ring-1 ring-violet-200 dark:ring-violet-900' : 'border-zinc-200 dark:border-zinc-800'}`}>
      <div className="flex items-center justify-between px-4 py-3">
        <button
          onClick={onToggle}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <Code2 className="w-4 h-4 text-violet-500" />
          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Generated SQL</span>
          {isModified && (
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 font-medium">
              Modified
            </span>
          )}
          {!isModified && (
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 font-medium">
              3 statements
            </span>
          )}
        </button>
        <div className="flex items-center gap-1.5">
          {isVisible && (
            <>
              <button
                onClick={handleCopy}
                className="p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                title="Copy SQL"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={onToggleEditing}
                className={`p-1.5 rounded-md transition-colors ${isEditing ? 'text-violet-600 dark:text-violet-400 bg-violet-100 dark:bg-violet-900/30' : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
                title={isEditing ? 'Stop editing' : 'Edit SQL manually'}
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
              {isEditing && isModified && (
                <button
                  onClick={onReRunSql}
                  disabled={isReRunning}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-600 hover:bg-violet-700 disabled:bg-zinc-400 text-white rounded-lg text-xs font-medium transition-colors shadow-sm"
                >
                  {isReRunning ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                  Re-run SQL
                </button>
              )}
              {isEditing && isModified && (
                <button
                  onClick={() => onEditedSqlChange(sql)}
                  className="p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                  title="Reset to original"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              )}
            </>
          )}
          <button
            onClick={onToggle}
            className="p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            {isVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
      {isVisible && (
        <div className="border-t border-zinc-100 dark:border-zinc-800 relative">
          {isEditing ? (
            <div className="relative">
              <textarea
                ref={editorRef}
                value={editedSql}
                onChange={e => onEditedSqlChange(e.target.value)}
                onKeyDown={handleEditorKeyDown}
                spellCheck={false}
                className="w-full p-4 text-[13px] leading-relaxed text-zinc-700 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-900/50 font-mono resize-none focus:outline-none min-h-[200px]"
                style={{ tabSize: 2 }}
              />
              <div className="absolute bottom-2 right-2 text-[10px] text-zinc-400 dark:text-zinc-500 flex items-center gap-1.5">
                <kbd className="px-1.5 py-0.5 bg-zinc-200 dark:bg-zinc-700 rounded font-mono border border-zinc-300 dark:border-zinc-600">⌘↵</kbd> to re-run
              </div>
            </div>
          ) : (
            <pre className="p-4 text-[13px] leading-relaxed text-zinc-700 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-900/50 overflow-x-auto font-mono">
              {currentSql}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}

function ResultTableView({ table }: { table: ResultTable }) {
  return (
    <div className="flex-1 overflow-auto">
      <table className="w-full text-sm text-left whitespace-nowrap">
        <thead className="text-xs text-zinc-500 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-900/80 sticky top-0 z-10">
          <tr>
            {table.columns.map(col => (
              <th key={col} className="px-4 py-3 font-medium border-b border-zinc-200 dark:border-zinc-800">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
          {table.rows.map((row, i) => (
            <tr key={i} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-900/30 transition-colors">
              {table.columns.map(col => {
                const val = row[col];
                const isId = col.endsWith('_id') && typeof val === 'string' && (val as string).includes('-');
                const isFlag = col === 'flag' || col === 'severity' || col === 'status' || col === 'related';
                return (
                  <td key={col} className="px-4 py-2.5">
                    {isId ? (
                      <span className="font-medium text-blue-600 dark:text-blue-400">{String(val)}</span>
                    ) : isFlag ? (
                      <FlagBadge value={String(val)} />
                    ) : (
                      <span className="text-zinc-700 dark:text-zinc-300">{String(val)}</span>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function FlagBadge({ value }: { value: string }) {
  const v = value.toLowerCase();
  let cls = 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700';
  if (['active', 'normal', 'mild', 'unlikely'].includes(v))
    cls = 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20';
  else if (['high', 'moderate', 'possible', 'probable'].includes(v))
    cls = 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/20';
  else if (['severe', 'critical', 'definite'].includes(v))
    cls = 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-500/20';
  return <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${cls}`}>{value}</span>;
}

// ─── Main Component ─────────────────────────────────────────────────────

export function QueryTool() {
  const [selectedDbs, setSelectedDbs] = useState<Set<string>>(new Set(['cardio-2024']));
  const [prompt, setPrompt] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [hasResults, setHasResults] = useState(false);
  const [showSql, setShowSql] = useState(false);
  const [editedSql, setEditedSql] = useState(MOCK_GENERATED_SQL);
  const [isEditingSql, setIsEditingSql] = useState(false);
  const [isReRunningSql, setIsReRunningSql] = useState(false);
  const [activeResultTab, setActiveResultTab] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const toggleDb = (id: string) => {
    setSelectedDbs(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleRun = () => {
    if (!prompt.trim() || selectedDbs.size === 0) return;
    setIsRunning(true);
    setHasResults(false);
    setTimeout(() => {
      setIsRunning(false);
      setHasResults(true);
      setActiveResultTab(0);
      setEditedSql(MOCK_GENERATED_SQL);
      setIsEditingSql(false);
      setShowSql(false);
    }, 1500);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleRun();
    }
  };

  const handleExampleClick = (example: string) => {
    setPrompt(example);
    textareaRef.current?.focus();
  };

  const handleReRunSql = () => {
    setIsReRunningSql(true);
    setTimeout(() => {
      setIsReRunningSql(false);
      // In real app, would execute editedSql and update results
    }, 1000);
  };

  const handleReset = () => {
    setPrompt('');
    setHasResults(false);
    setShowSql(false);
    setIsEditingSql(false);
    setEditedSql(MOCK_GENERATED_SQL);
  };

  return (
    <div className="flex flex-col gap-4 h-full w-full">
      {/* ─── Query Input Area ─── */}
      <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm transition-colors">
        {/* Toolbar */}
        <div className="px-4 py-3 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3 flex-wrap">
            <DatabaseSelector selected={selectedDbs} onToggle={toggleDb} />
            {selectedDbs.size > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap">
                {[...selectedDbs].map(id => {
                  const db = AVAILABLE_DATABASES.find(d => d.id === id);
                  if (!db) return null;
                  return (
                    <span key={id} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-xs font-medium text-zinc-700 dark:text-zinc-300">
                      <span className={`w-2 h-2 rounded-full ${db.color}`} />
                      {db.name}
                      <button onClick={() => toggleDb(id)} className="ml-0.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  );
                })}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            {hasResults && (
              <button
                onClick={handleReset}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 border border-zinc-200 dark:border-zinc-700 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                New Query
              </button>
            )}
          </div>
        </div>

        {/* Prompt Input */}
        <div className="relative">
          <div className="absolute left-4 top-4 text-violet-500">
            <Sparkles className="w-5 h-5" />
          </div>
          <textarea
            ref={textareaRef}
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe your query in plain English... e.g. 'Show all active patients over 30 with their lab results and adverse events'"
            rows={isExpanded ? 6 : 2}
            className="w-full pl-12 pr-32 py-4 bg-transparent text-sm text-zinc-800 dark:text-zinc-200 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 resize-none focus:outline-none leading-relaxed"
          />
          <div className="absolute right-3 top-3 flex items-center gap-1.5">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              title={isExpanded ? 'Collapse' : 'Expand'}
            >
              {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={handleRun}
              disabled={isRunning || !prompt.trim() || selectedDbs.size === 0}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-300 dark:disabled:bg-zinc-700 text-white rounded-lg text-sm font-medium transition-colors disabled:cursor-not-allowed shadow-sm"
            >
              {isRunning ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Play className="w-4 h-4" />
              )}
              {isRunning ? 'Generating...' : 'Run'}
            </button>
          </div>
          {!prompt && !hasResults && (
            <div className="px-4 pb-3 text-[11px] text-zinc-400 dark:text-zinc-500">
              Press <kbd className="px-1.5 py-0.5 bg-zinc-100 dark:bg-zinc-800 rounded text-[10px] font-mono border border-zinc-200 dark:border-zinc-700">⌘</kbd> + <kbd className="px-1.5 py-0.5 bg-zinc-100 dark:bg-zinc-800 rounded text-[10px] font-mono border border-zinc-200 dark:border-zinc-700">↵</kbd> to run
            </div>
          )}
        </div>

        {/* Example Prompts */}
        {!hasResults && !prompt && (
          <div className="px-4 pb-4 flex flex-wrap gap-2">
            {EXAMPLE_PROMPTS.map((ex, i) => (
              <button
                key={i}
                onClick={() => handleExampleClick(ex)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs text-zinc-600 dark:text-zinc-400 hover:border-blue-300 dark:hover:border-blue-700 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                <MessageSquare className="w-3 h-3" />
                {ex}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ─── Running State ─── */}
      {isRunning && (
        <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-8 flex flex-col items-center gap-4 transition-colors">
          <div className="relative">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-blue-500 animate-pulse" />
            </div>
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Translating your query...</p>
            <p className="text-xs text-zinc-400 mt-1">Analyzing schema and generating optimized SQL</p>
          </div>
          <div className="flex items-center gap-3 text-xs text-zinc-400">
            <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-500" /> Schema analyzed</span>
            <span className="flex items-center gap-1.5"><Loader2 className="w-3.5 h-3.5 animate-spin text-blue-500" /> Generating SQL</span>
            <span className="flex items-center gap-1.5 opacity-40"><ArrowRight className="w-3.5 h-3.5" /> Executing</span>
          </div>
        </div>
      )}

      {/* ─── Results ─── */}
      {hasResults && !isRunning && (
        <>
          {/* Generated SQL */}
          <SqlEditor
            sql={MOCK_GENERATED_SQL}
            editedSql={editedSql}
            onEditedSqlChange={setEditedSql}
            isVisible={showSql}
            onToggle={() => setShowSql(!showSql)}
            isEditing={isEditingSql}
            onToggleEditing={() => { setIsEditingSql(!isEditingSql); if (!showSql) setShowSql(true); }}
            onReRunSql={handleReRunSql}
            isReRunning={isReRunningSql}
          />

          {/* Result Tables */}
          <div className="flex-1 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm flex flex-col overflow-hidden transition-colors min-h-0">
            {/* Tabs & Actions */}
            <div className="border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between shrink-0">
              <div className="flex items-center overflow-x-auto">
                {MOCK_RESULT_TABLES.map((t, i) => (
                  <button
                    key={t.name}
                    onClick={() => setActiveResultTab(i)}
                    className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                      activeResultTab === i
                        ? 'border-blue-500 text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/20'
                        : 'border-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900/30'
                    }`}
                  >
                    <Table2 className="w-4 h-4" />
                    {t.name}
                    <span className="text-[11px] px-1.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 font-normal">
                      {t.rows.length}/{t.totalRows}
                    </span>
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2 px-4 shrink-0">
                <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 bg-white dark:bg-zinc-900 transition-colors">
                  <Save className="w-3.5 h-3.5" />
                  Save
                </button>
                <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 bg-white dark:bg-zinc-900 transition-colors">
                  <Download className="w-3.5 h-3.5" />
                  Export
                </button>
              </div>
            </div>

            {/* Active Table */}
            <ResultTableView table={MOCK_RESULT_TABLES[activeResultTab]} />

            {/* Footer */}
            <div className="h-10 border-t border-zinc-200 dark:border-zinc-800 px-4 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/50 text-xs text-zinc-500 dark:text-zinc-400 shrink-0">
              <span>
                Showing {MOCK_RESULT_TABLES[activeResultTab].rows.length} of {MOCK_RESULT_TABLES[activeResultTab].totalRows} rows
                <span className="mx-2 text-zinc-300 dark:text-zinc-700">·</span>
                {MOCK_RESULT_TABLES.length} tables returned
                <span className="mx-2 text-zinc-300 dark:text-zinc-700">·</span>
                Executed in 0.82s
              </span>
              <div className="flex gap-1">
                <button className="px-2 py-0.5 border border-zinc-200 dark:border-zinc-700 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50" disabled>
                  Previous
                </button>
                <button className="px-2 py-0.5 border border-zinc-200 dark:border-zinc-700 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                  Next
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ─── Empty State ─── */}
      {!hasResults && !isRunning && (
        <div className="flex-1 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl flex flex-col items-center justify-center text-zinc-400 dark:text-zinc-600 transition-colors">
          <div className="w-16 h-16 rounded-2xl bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center mb-4">
            <Sparkles className="w-8 h-8 text-zinc-300 dark:text-zinc-700" />
          </div>
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-1">Describe what you need</p>
          <p className="text-xs text-zinc-400 dark:text-zinc-500 max-w-md text-center">
            Write your query in natural language, select the target databases, and the AI engine will generate optimized SQL returning multi-table results.
          </p>
        </div>
      )}
    </div>
  );
}