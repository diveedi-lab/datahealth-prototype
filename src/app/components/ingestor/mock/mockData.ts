import type {
  CollectionFileInput, CollectionMeta, EditorEdge, EditorNode,
  EditorState, Variable, FileMatch,
} from '../types';
import { SCHEMA_VERSION } from '../types';

// ─── Palette coerente con DataExplorer ───
const COLOR = {
  demog: '#3b82f6',
  vs: '#8b5cf6',
  lb: '#f59e0b',
  incl: '#ec4899',
  imaging: '#06b6d4',
  context: '#d97706',
};

// ─── Helper per costruire variabili con statistiche ───
const v = (x: Variable): Variable => x;

function demogVars(): Variable[] {
  return [
    v({
      name: 'SUBJID', label: 'Subject ID', type: 'id', pk: true, completeness: 1,
      description: 'Identificativo univoco del paziente. Chiave di collegamento tra tutti i file.',
      stats: { missingPct: 0, uniqueCount: 1420, sampleValues: ['S0001', 'S0002', 'S0017', 'S0431'],
        topValues: [], distribution: { kind: 'none' } },
    }),
    v({
      name: 'AGE', label: 'Age at enrollment', type: 'integer', completeness: 0.988,
      description: 'Età del paziente all’arruolamento (anni compiuti).',
      issues: ['1.2% valori mancanti'],
      stats: { missingPct: 1.2, uniqueCount: 58, sampleValues: [34, 57, 62, 71],
        topValues: [{ value: 61, count: 58, pct: 4.1 }, { value: 58, count: 54, pct: 3.8 }, { value: 64, count: 51, pct: 3.6 }],
        distribution: { kind: 'numeric', min: 19, max: 88, mean: 56.4, median: 58, bins: [
          { range: '18–30', count: 140 }, { range: '31–45', count: 310 }, { range: '46–60', count: 520 },
          { range: '61–75', count: 360 }, { range: '76–90', count: 90 },
        ] } },
    }),
    v({
      name: 'SEX', label: 'Sex', type: 'categorical', completeness: 1,
      description: 'Sesso biologico del paziente.',
      stats: { missingPct: 0, uniqueCount: 2, sampleValues: ['F', 'M'],
        topValues: [{ value: 'F', count: 735, pct: 51.8 }, { value: 'M', count: 685, pct: 48.2 }],
        distribution: { kind: 'categorical', categories: [{ name: 'F', count: 735 }, { name: 'M', count: 685 }] } },
    }),
    v({
      name: 'RACE', label: 'Race', type: 'categorical', completeness: 0.993,
      description: 'Etnia auto-riferita.',
      stats: { missingPct: 0.7, uniqueCount: 4, sampleValues: ['White', 'Asian', 'Black'],
        topValues: [{ value: 'White', count: 980, pct: 69.0 }, { value: 'Asian', count: 210, pct: 14.8 }, { value: 'Black', count: 140, pct: 9.9 }],
        distribution: { kind: 'categorical', categories: [
          { name: 'White', count: 980 }, { name: 'Asian', count: 210 }, { name: 'Black', count: 140 }, { name: 'Other', count: 90 },
        ] } },
    }),
    v({
      name: 'ENROLDT', label: 'Enrollment date', type: 'date', completeness: 1,
      description: 'Data di arruolamento nello studio.',
      stats: { missingPct: 0, uniqueCount: 248, sampleValues: ['2025-01-08', '2025-04-22', '2025-09-30'],
        topValues: [], distribution: { kind: 'date', min: '2025-01-08', max: '2025-12-19', bins: [
          { name: 'Q1', count: 360 }, { name: 'Q2', count: 410 }, { name: 'Q3', count: 380 }, { name: 'Q4', count: 270 },
        ] } },
    }),
    v({
      name: 'SITE_FREETEXT', label: 'Site (free text)', type: 'string', completeness: 0.88, nullable: true,
      description: 'Nome sito in testo libero — non normalizzato. Candidato allo scarto in conversione.',
      issues: ['12% mancante', 'testo non normalizzato'],
      stats: { missingPct: 12, uniqueCount: 41, sampleValues: ['Milano - Niguarda', 'Roma Gemelli', 'Site 12'],
        topValues: [{ value: 'Milano - Niguarda', count: 180, pct: 12.7 }, { value: 'Roma Gemelli', count: 150, pct: 10.6 }],
        distribution: { kind: 'categorical', categories: [
          { name: 'Milano', count: 320 }, { name: 'Roma', count: 280 }, { name: 'Napoli', count: 190 }, { name: 'Altro', count: 630 },
        ] } },
    }),
  ];
}

function vsVars(): Variable[] {
  return [
    v({ name: 'SUBJID', label: 'Subject ID', type: 'id', completeness: 1, fk: { file: 'DEMOG.csv', column: 'SUBJID' },
      description: 'Riferimento al paziente (FK su DEMOG).',
      stats: { missingPct: 0, uniqueCount: 1418, sampleValues: ['S0001', 'S0002'], topValues: [], distribution: { kind: 'none' } } }),
    v({ name: 'VSTESTCD', label: 'Vital sign test', type: 'categorical', completeness: 1,
      description: 'Codice del parametro vitale misurato.',
      stats: { missingPct: 0, uniqueCount: 5, sampleValues: ['SYSBP', 'DIABP', 'HR'],
        topValues: [{ value: 'SYSBP', count: 2840, pct: 25 }, { value: 'DIABP', count: 2840, pct: 25 }, { value: 'HR', count: 2272, pct: 20 }],
        distribution: { kind: 'categorical', categories: [
          { name: 'SYSBP', count: 2840 }, { name: 'DIABP', count: 2840 }, { name: 'HR', count: 2272 }, { name: 'TEMP', count: 1704 }, { name: 'RESP', count: 1704 },
        ] } } }),
    v({ name: 'VSORRES', label: 'Result value', type: 'float', completeness: 0.974,
      description: 'Valore misurato del parametro vitale.',
      issues: ['2.6% mancante'],
      stats: { missingPct: 2.6, uniqueCount: 612, sampleValues: [128.0, 82.0, 72.0, 36.7],
        topValues: [{ value: 120, count: 410, pct: 3.6 }, { value: 80, count: 380, pct: 3.3 }],
        distribution: { kind: 'numeric', min: 35.4, max: 198, mean: 89.7, median: 81, bins: [
          { range: '<40', count: 1620 }, { range: '40–80', count: 3980 }, { range: '80–120', count: 3540 }, { range: '120–160', count: 1720 }, { range: '>160', count: 500 },
        ] } } }),
    v({ name: 'VISIT', label: 'Visit', type: 'categorical', completeness: 1,
      description: 'Visita di studio in cui è stata effettuata la misura.',
      stats: { missingPct: 0, uniqueCount: 4, sampleValues: ['Screening', 'Baseline', 'Week 4'],
        topValues: [{ value: 'Baseline', count: 3120, pct: 27.5 }],
        distribution: { kind: 'categorical', categories: [
          { name: 'Screening', count: 2840 }, { name: 'Baseline', count: 3120 }, { name: 'Week 4', count: 2780 }, { name: 'Week 12', count: 2620 },
        ] } } }),
    v({ name: 'VSDT', label: 'Measurement date', type: 'date', completeness: 0.998,
      description: 'Data della misurazione.',
      stats: { missingPct: 0.2, uniqueCount: 301, sampleValues: ['2025-02-11', '2025-06-03'], topValues: [],
        distribution: { kind: 'date', min: '2025-01-10', max: '2026-01-15', bins: [
          { name: 'Q1', count: 2600 }, { name: 'Q2', count: 3100 }, { name: 'Q3', count: 3000 }, { name: 'Q4', count: 2660 },
        ] } } }),
    v({ name: 'IMGREF', label: 'Image reference (file name)', type: 'string', completeness: 0.37,
      description: 'Nome del file immagine DICOM associato alla visita — è la variabile che collega questa tabella al set "imaging/". Valorizzata solo nelle visite con imaging.',
      issues: ['63% mancante (solo le visite con imaging)', '119 riferimenti senza file immagine corrispondente'],
      stats: { missingPct: 63, uniqueCount: 4180, sampleValues: ['IMG_S0001_Baseline.dcm', 'IMG_S0002_Week12.dcm', 'IMG_S0017_Screening.dcm'],
        topValues: [], distribution: { kind: 'none' } } }),
  ];
}

function lbVars(): Variable[] {
  return [
    v({ name: 'SUBJID', label: 'Subject ID', type: 'id', completeness: 1, fk: { file: 'DEMOG.csv', column: 'SUBJID' },
      description: 'Riferimento al paziente (FK su DEMOG).',
      stats: { missingPct: 0, uniqueCount: 1410, sampleValues: ['S0001', 'S0003'], topValues: [], distribution: { kind: 'none' } } }),
    v({ name: 'LBTESTCD', label: 'Lab test', type: 'categorical', completeness: 1,
      description: 'Codice dell’analisi di laboratorio.',
      stats: { missingPct: 0, uniqueCount: 5, sampleValues: ['GLUC', 'CHOL', 'HDL'],
        topValues: [{ value: 'GLUC', count: 1820, pct: 21.3 }],
        distribution: { kind: 'categorical', categories: [
          { name: 'GLUC', count: 1820 }, { name: 'CHOL', count: 1760 }, { name: 'HDL', count: 1680 }, { name: 'LDL', count: 1680 }, { name: 'TROP', count: 1620 },
        ] } } }),
    v({ name: 'LBORRES', label: 'Result', type: 'float', completeness: 0.961,
      description: 'Valore del risultato di laboratorio.',
      issues: ['3.9% mancante', '7 outlier rilevati'],
      stats: { missingPct: 3.9, uniqueCount: 1203, sampleValues: [98, 187, 54, 0.04],
        topValues: [{ value: 90, count: 120, pct: 1.4 }],
        distribution: { kind: 'numeric', min: 0.01, max: 412, mean: 96.2, median: 88, bins: [
          { range: '<50', count: 1240 }, { range: '50–100', count: 3360 }, { range: '100–200', count: 2980 }, { range: '200–300', count: 720 }, { range: '>300', count: 260 },
        ] } } }),
    v({ name: 'LBORRESU', label: 'Unit', type: 'categorical', completeness: 0.961,
      description: 'Unità di misura del risultato.',
      stats: { missingPct: 3.9, uniqueCount: 3, sampleValues: ['mg/dL', 'mmol/L', 'ng/mL'],
        topValues: [{ value: 'mg/dL', count: 5200, pct: 60.7 }],
        distribution: { kind: 'categorical', categories: [
          { name: 'mg/dL', count: 5200 }, { name: 'mmol/L', count: 2100 }, { name: 'ng/mL', count: 1260 },
        ] } } }),
    v({ name: 'custom_biomarker', label: 'Custom biomarker (proprietary)', type: 'float', completeness: 0.74,
      description: 'Biomarcatore proprietario non standard — richiede mappatura custom verso il dominio target.',
      issues: ['26% mancante', 'variabile origin / non standard'],
      stats: { missingPct: 26, uniqueCount: 880, sampleValues: [1.24, 0.88, 2.05],
        topValues: [{ value: 1.0, count: 64, pct: 0.7 }],
        distribution: { kind: 'numeric', min: 0.02, max: 9.8, mean: 1.9, median: 1.4, bins: [
          { range: '0–1', count: 1860 }, { range: '1–2', count: 2240 }, { range: '2–4', count: 1480 }, { range: '4–6', count: 520 }, { range: '>6', count: 220 },
        ] } } }),
  ];
}

function boolVar(name: string, label: string, trueCount: number, falseCount: number, desc: string): Variable {
  const total = trueCount + falseCount;
  return v({
    name, label, type: 'boolean', completeness: 1,
    description: desc,
    issues: falseCount > 0 ? [`${falseCount} pazienti con criterio NON soddisfatto`] : undefined,
    stats: {
      missingPct: 0, uniqueCount: 2, sampleValues: ['Y', 'N'],
      topValues: [
        { value: 'Y', count: trueCount, pct: +(trueCount / total * 100).toFixed(1) },
        { value: 'N', count: falseCount, pct: +(falseCount / total * 100).toFixed(1) },
      ],
      distribution: { kind: 'boolean', trueCount, falseCount },
    },
  });
}

function inclVars(): Variable[] {
  return [
    v({ name: 'SUBJID', label: 'Subject ID', type: 'id', pk: true, completeness: 1,
      description: 'Identificativo paziente (una riga per paziente — formato wide).',
      stats: { missingPct: 0, uniqueCount: 1420, sampleValues: ['S0001', 'S0002'], topValues: [], distribution: { kind: 'none' } } }),
    boolVar('INCL01', 'Age ≥ 18 years', 1418, 2, 'Criterio di inclusione: età ≥ 18 anni (Y = soddisfatto).'),
    boolVar('INCL02', 'Signed informed consent', 1420, 0, 'Criterio di inclusione: consenso informato firmato.'),
    boolVar('INCL03', 'Confirmed CAD diagnosis', 1400, 20, 'Criterio di inclusione: diagnosi confermata di coronaropatia.'),
    boolVar('INCL04', 'LVEF ≥ 40%', 1360, 60, 'Criterio di inclusione: frazione di eiezione ventricolare ≥ 40%.'),
    boolVar('INCL05', 'No prior MI within 30 days', 1390, 30, 'Criterio (esclusione invertito): nessun infarto nei 30 giorni precedenti.'),
    boolVar('INCL06', 'Able to attend all visits', 1405, 15, 'Criterio di inclusione: capacità di partecipare a tutte le visite.'),
  ];
}

const IMAGING_MATCH: FileMatch = {
  total: 4180, matched: 4061, unmatched: 119,
  unmatchedExamples: [
    'IMG_S0412_V3.dcm — subject S0412 assente in DEMOG',
    'IMG_S0118_V9.dcm — visita V9 non nella codelist VISIT',
    'IMG_UNKNOWN_BL.dcm — nome file malformato',
  ],
  note: 'Match per nome file con la colonna VS.IMGREF. 119 immagini orfane: 71 subject inesistente, 38 visita ignota, 10 nome malformato.',
};

// ─── Anteprime dei dati grezzi (per esplorare i file originali nel Source data) ───
const DEMOG_PREVIEW: Array<Record<string, string | number>> = [
  { SUBJID: 'S0001', AGE: 62, SEX: 'F', RACE: 'White', ENROLDT: '2025-02-14', SITE_FREETEXT: 'Milano - Niguarda' },
  { SUBJID: 'S0002', AGE: 57, SEX: 'M', RACE: 'White', ENROLDT: '2025-02-18', SITE_FREETEXT: 'Roma Gemelli' },
  { SUBJID: 'S0003', AGE: 71, SEX: 'F', RACE: 'Asian', ENROLDT: '2025-03-02', SITE_FREETEXT: 'Site 12' },
  { SUBJID: 'S0004', AGE: 34, SEX: 'M', RACE: 'Black', ENROLDT: '2025-03-09', SITE_FREETEXT: '' },
  { SUBJID: 'S0005', AGE: 49, SEX: 'F', RACE: 'White', ENROLDT: '2025-03-15', SITE_FREETEXT: 'Napoli Federico II' },
  { SUBJID: 'S0006', AGE: 66, SEX: 'M', RACE: 'Other', ENROLDT: '2025-03-21', SITE_FREETEXT: 'Milano - Niguarda' },
];

const VS_PREVIEW: Array<Record<string, string | number>> = [
  { SUBJID: 'S0001', VSTESTCD: 'SYSBP', VSORRES: 128, VISIT: 'Baseline', VSDT: '2025-02-20', IMGREF: 'IMG_S0001_Baseline.dcm' },
  { SUBJID: 'S0001', VSTESTCD: 'DIABP', VSORRES: 82, VISIT: 'Baseline', VSDT: '2025-02-20', IMGREF: '' },
  { SUBJID: 'S0001', VSTESTCD: 'HR', VSORRES: 72, VISIT: 'Baseline', VSDT: '2025-02-20', IMGREF: '' },
  { SUBJID: 'S0002', VSTESTCD: 'SYSBP', VSORRES: 141, VISIT: 'Screening', VSDT: '2025-02-19', IMGREF: 'IMG_S0002_Screening.dcm' },
  { SUBJID: 'S0002', VSTESTCD: 'TEMP', VSORRES: 36.7, VISIT: 'Week 12', VSDT: '2025-05-14', IMGREF: 'IMG_S0002_Week12.dcm' },
  { SUBJID: 'S0003', VSTESTCD: 'HR', VSORRES: 88, VISIT: 'Baseline', VSDT: '2025-03-10', IMGREF: '' },
];

const LB_PREVIEW: Array<Record<string, string | number>> = [
  { SUBJID: 'S0001', LBTESTCD: 'GLUC', LBORRES: 98, LBORRESU: 'mg/dL', custom_biomarker: 1.24 },
  { SUBJID: 'S0001', LBTESTCD: 'CHOL', LBORRES: 187, LBORRESU: 'mg/dL', custom_biomarker: '' },
  { SUBJID: 'S0002', LBTESTCD: 'HDL', LBORRES: 54, LBORRESU: 'mg/dL', custom_biomarker: 0.88 },
  { SUBJID: 'S0002', LBTESTCD: 'TROP', LBORRES: 0.04, LBORRESU: 'ng/mL', custom_biomarker: 2.05 },
  { SUBJID: 'S0003', LBTESTCD: 'LDL', LBORRES: 122, LBORRESU: 'mg/dL', custom_biomarker: '' },
  { SUBJID: 'S0004', LBTESTCD: 'GLUC', LBORRES: 110, LBORRESU: 'mg/dL', custom_biomarker: 1.51 },
];

const INCL_PREVIEW: Array<Record<string, string | number>> = [
  { SUBJID: 'S0001', INCL01: 'Y', INCL02: 'Y', INCL03: 'Y', INCL04: 'Y', INCL05: 'Y', INCL06: 'Y' },
  { SUBJID: 'S0002', INCL01: 'Y', INCL02: 'Y', INCL03: 'Y', INCL04: 'N', INCL05: 'Y', INCL06: 'Y' },
  { SUBJID: 'S0003', INCL01: 'Y', INCL02: 'Y', INCL03: 'N', INCL04: 'Y', INCL05: 'Y', INCL06: 'N' },
  { SUBJID: 'S0004', INCL01: 'N', INCL02: 'Y', INCL03: 'Y', INCL04: 'Y', INCL05: 'N', INCL06: 'Y' },
  { SUBJID: 'S0005', INCL01: 'Y', INCL02: 'Y', INCL03: 'Y', INCL04: 'Y', INCL05: 'Y', INCL06: 'Y' },
  { SUBJID: 'S0006', INCL01: 'Y', INCL02: 'Y', INCL03: 'Y', INCL04: 'N', INCL05: 'Y', INCL06: 'Y' },
];

const IMAGING_FILES: string[] = [
  'IMG_S0001_Baseline.dcm', 'IMG_S0001_Week12.dcm', 'IMG_S0002_Screening.dcm',
  'IMG_S0002_Week12.dcm', 'IMG_S0003_Baseline.dcm', 'IMG_S0005_Baseline.dcm',
  'IMG_S0412_V3.dcm  (orfano)', 'IMG_UNKNOWN_BL.dcm  (malformato)',
];

const MAPPING_PREVIEW = {
  headers: ['source_col', 'target_var', 'target_table', 'note'],
  rows: [
    ['INCL01', 'IETESTCD=INCL01', 'CDISC IE', 'wide→long'],
    ['SEX', 'SEX', 'CDISC DM', 'codelist M/F'],
    ['RACE', 'race_concept_id', 'OMOP person', 'map a concept'],
    ['AGE', 'year_of_birth', 'OMOP person', 'derivata'],
    ['SITE_FREETEXT', '—', '—', 'drop (non normalizzato)'],
  ],
};

const PROTOCOL_PREVIEW = `PROTOCOLLO CARDIO-2024 v3 — Criteri di inclusione
INCL01  Età ≥ 18 anni
INCL02  Consenso informato firmato
INCL03  Diagnosi confermata di coronaropatia (CAD)
INCL04  Frazione di eiezione (LVEF) ≥ 40%
INCL05  Nessun infarto miocardico nei 30 giorni precedenti
INCL06  Capacità di partecipare a tutte le visite

Codelist VISIT: Screening, Baseline, Week 4, Week 12 …`;

const ECRF_PREVIEW = `eCRF annotato — modulo Demografia (pag. 2)
[ Subject ID ] → variabile SUBJID (identificativo univoco)
[ Date of birth / Age ] → AGE (anni compiuti all'arruolamento)
[ Sex ] → SEX  (M / F)
[ Race ] → RACE (codelist standard)
[ Enrollment date ] → ENROLDT (YYYY-MM-DD) …`;

// ─── File di input (stadio upload) ───
export const DEMO_FILES: CollectionFileInput[] = [
  { id: 'f-demog', bucket: 'datafeed', name: 'DEMOG.csv', sizeLabel: '0.4 MB', meta: '1.420 righe · 6 colonne' },
  { id: 'f-vs', bucket: 'datafeed', name: 'VS.csv', sizeLabel: '2.1 MB', meta: '11.360 righe · 6 colonne' },
  { id: 'f-lb', bucket: 'datafeed', name: 'LB.csv', sizeLabel: '1.6 MB', meta: '8.560 righe · 5 colonne' },
  { id: 'f-incl', bucket: 'datafeed', name: 'INCL.csv', sizeLabel: '0.2 MB', meta: '1.420 righe · 7 colonne (wide)' },
  { id: 'f-img', bucket: 'file-collection', name: 'imaging/', sizeLabel: '38.6 GB', meta: '4.180 file DICOM', uploadedVia: 'cli' },
  { id: 'f-map', bucket: 'context', name: 'var_mapping.xlsx', sizeLabel: '0.1 MB', meta: 'Mapping variabili → CDISC' },
  { id: 'f-proto', bucket: 'context', name: 'clinical_protocol_v3.pdf', sizeLabel: '2.4 MB', meta: 'Protocollo clinico' },
  { id: 'f-ecrf', bucket: 'context', name: 'annotated_eCRF.pdf', sizeLabel: '5.1 MB', meta: 'eCRF annotato' },
];

// ─── Costruzione nodi a partire dai file ───
interface NodeSpec {
  type: EditorNode['type'];
  position: { x: number; y: number };
  build: (input: CollectionFileInput) => EditorNode['data'];
}

const NODE_REGISTRY: Record<string, NodeSpec> = {
  'DEMOG.csv': {
    type: 'tabularFile', position: { x: 60, y: 300 },
    build: (i) => ({ bucket: 'datafeed', label: 'DEMOG', fileName: i.name, color: COLOR.demog, analyzed: false,
      rowCount: 1420, completeness: 0.97, variables: demogVars(), previewRows: DEMOG_PREVIEW }),
  },
  'VS.csv': {
    type: 'tabularFile', position: { x: 400, y: 80 },
    build: (i) => ({ bucket: 'datafeed', label: 'VS', fileName: i.name, color: COLOR.vs, analyzed: false,
      rowCount: 11360, completeness: 0.99, variables: vsVars(), previewRows: VS_PREVIEW }),
  },
  'LB.csv': {
    type: 'tabularFile', position: { x: 400, y: 300 },
    build: (i) => ({ bucket: 'datafeed', label: 'LB', fileName: i.name, color: COLOR.lb, analyzed: false,
      rowCount: 8560, completeness: 0.93, variables: lbVars(), previewRows: LB_PREVIEW }),
  },
  'INCL.csv': {
    type: 'tabularFile', position: { x: 400, y: 520 },
    build: (i) => ({ bucket: 'datafeed', label: 'INCL', fileName: i.name, color: COLOR.incl, analyzed: false,
      rowCount: 1420, completeness: 1, variables: inclVars(), previewRows: INCL_PREVIEW }),
  },
  'imaging/': {
    type: 'fileCollection', position: { x: 760, y: 80 },
    build: (i) => ({ bucket: 'file-collection', label: 'Imaging set', fileName: i.name, color: COLOR.imaging, analyzed: false,
      memberCount: 4180, totalSizeGB: 38.6, fileKind: 'DICOM', namingPattern: 'IMG_<SUBJID>_<VISIT>.dcm', match: IMAGING_MATCH, previewFiles: IMAGING_FILES }),
  },
  'var_mapping.xlsx': {
    type: 'contextNode', position: { x: 60, y: 60 },
    build: (i) => ({ bucket: 'context', label: 'Variable mapping', fileName: i.name, color: COLOR.context, analyzed: false,
      contextType: 'variable-mapping', role: 'Mappa le colonne origine REDCap verso le variabili CDISC IE/DM.',
      helps: 'INCL, DEMOG', previewTable: MAPPING_PREVIEW }),
  },
  'clinical_protocol_v3.pdf': {
    type: 'contextNode', position: { x: 60, y: 560 },
    build: (i) => ({ bucket: 'context', label: 'Clinical protocol', fileName: i.name, color: COLOR.context, analyzed: false,
      contextType: 'clinical-context', role: 'Definizione testuale dei 6 criteri di inclusione e della codelist VISIT.',
      helps: 'INCL, VS', previewText: PROTOCOL_PREVIEW }),
  },
  'annotated_eCRF.pdf': {
    type: 'contextNode', position: { x: 760, y: 320 },
    build: (i) => ({ bucket: 'context', label: 'Annotated eCRF', fileName: i.name, color: COLOR.context, analyzed: false,
      contextType: 'annotated-ecrf', role: 'eCRF annotato che lega i campi del form ai nomi variabile.',
      helps: 'DEMOG, VS, LB', previewText: ECRF_PREVIEW }),
  },
};

let fallbackY = 40;
export function buildNodesFromFiles(files: CollectionFileInput[]): EditorNode[] {
  fallbackY = 40;
  return files.map((f) => {
    const spec = NODE_REGISTRY[f.name];
    if (spec) {
      return { id: f.id, type: spec.type, position: { ...spec.position }, data: spec.build(f) };
    }
    // fallback generico per file non noti (upload custom)
    const y = fallbackY; fallbackY += 160;
    const type: EditorNode['type'] = f.bucket === 'file-collection' ? 'fileCollection' : f.bucket === 'context' ? 'contextNode' : 'tabularFile';
    return {
      id: f.id, type, position: { x: 40, y },
      data: {
        bucket: f.bucket, label: f.name.replace(/\.[^.]+$/, ''), fileName: f.name,
        color: f.bucket === 'context' ? COLOR.context : '#64748b', analyzed: false,
        rowCount: f.bucket === 'datafeed' ? 0 : undefined,
        variables: f.bucket === 'datafeed' ? [] : undefined,
        contextType: f.bucket === 'context' ? 'data-dictionary' : undefined,
        role: f.bucket === 'context' ? f.meta : undefined,
      },
    };
  });
}

// ─── Edge generati dall'analisi (solo tra file dati; il contesto sta nel Source data) ───
export function buildEdges(nodes: EditorNode[]): EditorEdge[] {
  const has = (id: string) => nodes.some((n) => n.id === id);
  const edges: EditorEdge[] = [];
  // SUBJID linkage da DEMOG verso le altre tabelle
  for (const tgt of ['f-vs', 'f-lb', 'f-incl']) {
    if (has('f-demog') && has(tgt)) {
      edges.push({ id: `e-subjid-${tgt}`, source: 'f-demog', target: tgt, kind: 'id-match', label: 'SUBJID' });
    }
  }
  // imaging referenziato dalla colonna IMGREF di VS (per nome file)
  if (has('f-vs') && has('f-img')) {
    edges.push({ id: 'e-img-vs', source: 'f-vs', target: 'f-img', kind: 'id-match', label: 'IMGREF' });
  }
  return edges;
}

// ─── Meta della collection demo ───
export const DEMO_META: CollectionMeta = {
  id: 'COLL-CARDIO-Q2',
  name: 'CARDIO Q2 2026 — Clinical Bundle',
  description: 'Bundle trimestrale: demografia, vital signs, laboratorio, criteri di inclusione e imaging cardiaco.',
  targetDatabase: 'CARDIO-2024',
  createdBy: 'Dr. M. Rossi',
  sourceFormat: 'redcap',
  targetFormat: 'cdisc',
};

// ─── Factory di stato ───
export function createDemoState(id: string): EditorState {
  const nodes = buildNodesFromFiles(DEMO_FILES);
  return {
    schemaVersion: SCHEMA_VERSION,
    meta: { ...DEMO_META, id },
    stage: 'source',
    maxStageReached: 'source',
    uploads: DEMO_FILES,
    nodes,
    edges: [],
    transformers: [],
    busy: null,
    analyzedAt: null,
    analyzedSignature: null,
  };
}

export function createEmptyState(id: string): EditorState {
  return {
    schemaVersion: SCHEMA_VERSION,
    meta: {
      id, name: 'New Collection', description: 'Nuova collection — carica i file per iniziare.',
      targetDatabase: '—', createdBy: 'You',
    },
    stage: 'source',
    maxStageReached: 'source',
    uploads: [],
    nodes: [],
    edges: [],
    transformers: [],
    busy: null,
    analyzedAt: null,
    analyzedSignature: null,
  };
}

// Firma dei dati sorgente: cambia quando aggiungi/rimuovi file → marca l'analisi come "stale"
export function sourceSignature(uploads: { id: string }[]): string {
  return uploads.map((u) => u.id).sort().join('|');
}
