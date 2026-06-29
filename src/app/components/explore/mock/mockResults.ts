import type { ResultTable } from '../../shared/query';
import type { QueryStatus } from '../types';
import { getCollection } from './mockCatalog';

// ─── Result-set mock riutilizzabili ───
const PATIENTS: ResultTable = {
  name: 'patients',
  columns: ['patient_id', 'age', 'gender', 'enrollment_date', 'site_id', 'status'],
  rows: [
    { patient_id: 'PT-1001', age: 45, gender: 'M', enrollment_date: '2025-01-15', site_id: 'Site A', status: 'Active' },
    { patient_id: 'PT-1003', age: 58, gender: 'M', enrollment_date: '2025-03-22', site_id: 'Site A', status: 'Active' },
    { patient_id: 'PT-1005', age: 61, gender: 'F', enrollment_date: '2025-05-18', site_id: 'Site B', status: 'Active' },
    { patient_id: 'PT-1008', age: 67, gender: 'F', enrollment_date: '2025-08-14', site_id: 'Site B', status: 'Active' },
    { patient_id: 'PT-1011', age: 72, gender: 'M', enrollment_date: '2025-09-02', site_id: 'Site C', status: 'Completed' },
    { patient_id: 'PT-1014', age: 63, gender: 'F', enrollment_date: '2025-10-19', site_id: 'Site A', status: 'Active' },
  ],
  totalRows: 142,
};

const LAB_RESULTS: ResultTable = {
  name: 'lab_results',
  columns: ['lab_id', 'patient_id', 'test_name', 'value', 'unit', 'collection_date', 'flag'],
  rows: [
    { lab_id: 'LB-4401', patient_id: 'PT-1001', test_name: 'Troponin I', value: 0.04, unit: 'ng/mL', collection_date: '2025-01-20', flag: 'Normal' },
    { lab_id: 'LB-4403', patient_id: 'PT-1005', test_name: 'Troponin I', value: 0.12, unit: 'ng/mL', collection_date: '2025-01-22', flag: 'High' },
    { lab_id: 'LB-4404', patient_id: 'PT-1003', test_name: 'CRP', value: 8.5, unit: 'mg/L', collection_date: '2025-01-18', flag: 'High' },
    { lab_id: 'LB-4405', patient_id: 'PT-1008', test_name: 'LDL', value: 142, unit: 'mg/dL', collection_date: '2025-02-01', flag: 'High' },
    { lab_id: 'LB-4408', patient_id: 'PT-1014', test_name: 'BNP', value: 410, unit: 'pg/mL', collection_date: '2025-02-09', flag: 'High' },
  ],
  totalRows: 856,
};

const HIGH_TROPONIN: ResultTable = {
  name: 'high_troponin',
  columns: ['patient_id', 'age', 'gender', 'troponin', 'unit', 'flag', 'site_id'],
  rows: [
    { patient_id: 'PT-1005', age: 61, gender: 'F', troponin: 0.12, unit: 'ng/mL', flag: 'High', site_id: 'Site B' },
    { patient_id: 'PT-1014', age: 63, gender: 'F', troponin: 0.18, unit: 'ng/mL', flag: 'High', site_id: 'Site A' },
    { patient_id: 'PT-1021', age: 69, gender: 'M', troponin: 0.31, unit: 'ng/mL', flag: 'High', site_id: 'Site C' },
    { patient_id: 'PT-1027', age: 74, gender: 'M', troponin: 0.27, unit: 'ng/mL', flag: 'High', site_id: 'Site A' },
    { patient_id: 'PT-1033', age: 66, gender: 'F', troponin: 0.15, unit: 'ng/mL', flag: 'High', site_id: 'Site B' },
  ],
  totalRows: 41,
};

const ADVERSE: ResultTable = {
  name: 'adverse_events',
  columns: ['ae_id', 'patient_id', 'event_name', 'severity', 'start_date', 'related'],
  rows: [
    { ae_id: 'AE-201', patient_id: 'PT-1001', event_name: 'Headache', severity: 'Mild', start_date: '2025-01-25', related: 'Unlikely' },
    { ae_id: 'AE-202', patient_id: 'PT-1003', event_name: 'Nausea', severity: 'Moderate', start_date: '2025-01-30', related: 'Possible' },
    { ae_id: 'AE-206', patient_id: 'PT-1014', event_name: 'Arrhythmia', severity: 'Severe', start_date: '2025-02-12', related: 'Probable' },
    { ae_id: 'AE-209', patient_id: 'PT-1021', event_name: 'Dizziness', severity: 'Mild', start_date: '2025-02-18', related: 'Probable' },
  ],
  totalRows: 89,
};

const ENROLLMENT_BY_SITE: ResultTable = {
  name: 'enrollment_by_site',
  columns: ['site_id', 'site_name', 'enrolled', 'active', 'completion_rate'],
  rows: [
    { site_id: 'Site A', site_name: 'Milano - Niguarda', enrolled: 420, active: 360, completion_rate: '86%' },
    { site_id: 'Site B', site_name: 'Roma Gemelli', enrolled: 380, active: 300, completion_rate: '79%' },
    { site_id: 'Site C', site_name: 'Napoli Federico II', enrolled: 290, active: 240, completion_rate: '83%' },
    { site_id: 'Site D', site_name: 'Torino Molinette', enrolled: 210, active: 170, completion_rate: '81%' },
    { site_id: 'Site E', site_name: 'Bologna S.Orsola', enrolled: 120, active: 96, completion_rate: '80%' },
  ],
  totalRows: 12,
};

const AE_BY_SEVERITY: ResultTable = {
  name: 'ae_by_severity',
  columns: ['severity', 'total', 'pct'],
  rows: [
    { severity: 'Mild', total: 260, pct: '55.3%' },
    { severity: 'Moderate', total: 150, pct: '31.9%' },
    { severity: 'Severe', total: 60, pct: '12.8%' },
  ],
  totalRows: 3,
};

// ─── Catalogo result-set ───
interface ResultSpec {
  id: string;
  sql: (coll: string) => string;
  results: ResultTable[];
  rowCount: number;
  execMs: number;
}

const RESULT_SETS: Record<string, ResultSpec> = {
  high_troponin: {
    id: 'high_troponin',
    sql: (c) => `-- ${c}\nSELECT p.patient_id, p.age, p.gender, lr.value AS troponin,\n       lr.unit, lr.flag, p.site_id\nFROM   patients p\nJOIN   lab_results lr ON lr.patient_id = p.patient_id\nWHERE  lr.test_name = 'Troponin I'\n  AND  lr.flag = 'High';`,
    results: [HIGH_TROPONIN], rowCount: 41, execMs: 1210,
  },
  adverse: {
    id: 'adverse',
    sql: (c) => `-- ${c}\nSELECT ae.ae_id, ae.patient_id, ae.event_name,\n       ae.severity, ae.start_date, ae.related\nFROM   adverse_events ae\nJOIN   patients p ON ae.patient_id = p.patient_id\nWHERE  ae.severity IN ('Moderate','Severe');`,
    results: [ADVERSE], rowCount: 89, execMs: 940,
  },
  enrollment_by_site: {
    id: 'enrollment_by_site',
    sql: (c) => `-- ${c}\nSELECT s.site_id, s.site_name, COUNT(p.patient_id) AS enrolled,\n       SUM(CASE WHEN p.status='Active' THEN 1 ELSE 0 END) AS active\nFROM   sites s\nJOIN   patients p ON p.site_id = s.site_id\nGROUP  BY s.site_id, s.site_name\nORDER  BY enrolled DESC;`,
    results: [ENROLLMENT_BY_SITE], rowCount: 12, execMs: 560,
  },
  ae_by_severity: {
    id: 'ae_by_severity',
    sql: (c) => `-- ${c}\nSELECT ae.severity, COUNT(*) AS total\nFROM   adverse_events ae\nGROUP  BY ae.severity\nORDER  BY total DESC;`,
    results: [AE_BY_SEVERITY], rowCount: 3, execMs: 320,
  },
  labs: {
    id: 'labs',
    sql: (c) => `-- ${c}\nSELECT lr.lab_id, lr.patient_id, lr.test_name, lr.value,\n       lr.unit, lr.collection_date, lr.flag\nFROM   lab_results lr\nJOIN   patients p ON lr.patient_id = p.patient_id\nWHERE  p.status = 'Active';`,
    results: [LAB_RESULTS], rowCount: 856, execMs: 820,
  },
  patients: {
    id: 'patients',
    sql: (c) => `-- ${c}\nSELECT p.patient_id, p.age, p.gender, p.enrollment_date,\n       p.site_id, p.status\nFROM   patients p\nWHERE  p.status = 'Active'\n  AND  p.age >= 30;`,
    results: [PATIENTS, LAB_RESULTS], rowCount: 142, execMs: 760,
  },
};

// ─── Matcher prompt → result-set ───
const MATCHERS: { id: string; test: (q: string) => boolean }[] = [
  { id: 'high_troponin', test: (q) => /tropon/.test(q) },
  { id: 'enrollment_by_site', test: (q) => /(sit[oi]|enroll|arruol|centr)/.test(q) && /(cont|count|per|trend|numero|quant)/.test(q) },
  { id: 'ae_by_severity', test: (q) => /(avvers|adverse|\bae\b|grav|sever)/.test(q) && /(cont|count|per|distrib|numero)/.test(q) },
  { id: 'adverse', test: (q) => /(avvers|adverse|evento|\bae\b)/.test(q) },
  { id: 'labs', test: (q) => /(lab|laborat|esam|troponin|colester|chol|ldl|hdl|bnp|crp)/.test(q) },
];

export function buildQueryResult(prompt: string, collections: string[]): {
  sql: string; results: ResultTable[]; rowCount: number; execMs: number; status: QueryStatus;
} {
  const q = prompt.toLowerCase();
  let spec: ResultSpec = RESULT_SETS.patients;
  for (const m of MATCHERS) {
    if (m.test(q)) { spec = RESULT_SETS[m.id]; break; }
  }
  const collName = collections.map((id) => getCollection(id)?.name ?? id).join(', ') || 'CARDIO-2024';
  return {
    sql: spec.sql(collName),
    results: spec.results,
    rowCount: spec.rowCount,
    execMs: spec.execMs,
    status: spec.rowCount > 0 ? 'success' : 'empty',
  };
}
