import type { Variable, Distribution } from '../../ingestor/types';
import type { ExploreCollection, ExploreTable, RichVariable } from '../types';

// ─── Palette pallini (coerente con DB_COLORS di Saved/History) ───
export const DB_DOT: Record<string, string> = {
  'cardio-2024': 'bg-rose-500',
  'onco-trial-a': 'bg-amber-500',
  'neuro-phase3': 'bg-violet-500',
  'resp-pilot': 'bg-emerald-500',
  'derm-cohort-b': 'bg-blue-500',
};
const DB_HEX: Record<string, string> = {
  'cardio-2024': '#f43f5e',
  'onco-trial-a': '#f59e0b',
  'neuro-phase3': '#8b5cf6',
  'resp-pilot': '#10b981',
  'derm-cohort-b': '#3b82f6',
};

// ─── Helper variabili ricche (con distribuzione) ───
function richVar(
  name: string, table: string, label: string, type: Variable['type'],
  description: string, distribution: Distribution,
  extra: Partial<Variable> = {},
): RichVariable {
  return {
    name, table,
    variable: {
      name, label, type, description, completeness: 1,
      stats: {
        missingPct: 0, uniqueCount: 0, sampleValues: [], topValues: [],
        distribution,
      },
      ...extra,
    },
  };
}

// ─── Tabelle CARDIO-2024 (schema relazionale) ───
const CARDIO_TABLES: ExploreTable[] = [
  {
    name: 'patients', label: 'Patients', color: '#3b82f6', rowCount: 1420,
    columns: [
      { name: 'patient_id', type: 'id', pk: true, description: 'Identificativo univoco del paziente' },
      { name: 'age', type: 'integer', description: 'Età all’arruolamento' },
      { name: 'gender', type: 'string', description: 'Sesso biologico (M/F)' },
      { name: 'enrollment_date', type: 'date', description: 'Data di arruolamento' },
      { name: 'site_id', type: 'string', fk: { table: 'sites', column: 'site_id' }, description: 'Sito di studio' },
      { name: 'status', type: 'string', description: 'Stato (Active, Completed, Withdrawn)' },
      { name: 'weight_kg', type: 'float', nullable: true, description: 'Peso in kg' },
      { name: 'height_cm', type: 'float', nullable: true, description: 'Altezza in cm' },
    ],
  },
  {
    name: 'lab_results', label: 'Lab Results', color: '#8b5cf6', rowCount: 8560,
    columns: [
      { name: 'lab_id', type: 'id', pk: true, description: 'Identificativo risultato di laboratorio' },
      { name: 'patient_id', type: 'id', fk: { table: 'patients', column: 'patient_id' }, description: 'Riferimento paziente' },
      { name: 'test_name', type: 'string', description: 'Nome del test' },
      { name: 'value', type: 'float', description: 'Valore numerico' },
      { name: 'unit', type: 'string', description: 'Unità di misura' },
      { name: 'collection_date', type: 'date', description: 'Data prelievo' },
      { name: 'flag', type: 'string', nullable: true, description: 'Flag anomalia (Normal, High, Low)' },
    ],
  },
  {
    name: 'adverse_events', label: 'Adverse Events', color: '#f59e0b', rowCount: 470,
    columns: [
      { name: 'ae_id', type: 'id', pk: true, description: 'Identificativo evento avverso' },
      { name: 'patient_id', type: 'id', fk: { table: 'patients', column: 'patient_id' }, description: 'Riferimento paziente' },
      { name: 'event_name', type: 'string', description: 'Descrizione evento' },
      { name: 'severity', type: 'string', description: 'Gravità (Mild, Moderate, Severe)' },
      { name: 'start_date', type: 'date', description: 'Data insorgenza' },
      { name: 'resolution_date', type: 'date', nullable: true, description: 'Data risoluzione' },
      { name: 'related', type: 'string', description: 'Correlazione al farmaco' },
    ],
  },
  {
    name: 'medications', label: 'Medications', color: '#10b981', rowCount: 3200,
    columns: [
      { name: 'med_id', type: 'id', pk: true, description: 'Identificativo record farmaco' },
      { name: 'patient_id', type: 'id', fk: { table: 'patients', column: 'patient_id' }, description: 'Riferimento paziente' },
      { name: 'drug_name', type: 'string', description: 'Nome del farmaco' },
      { name: 'dose', type: 'string', description: 'Dose e unità' },
      { name: 'frequency', type: 'string', description: 'Frequenza' },
      { name: 'start_date', type: 'date', description: 'Inizio' },
      { name: 'end_date', type: 'date', nullable: true, description: 'Fine' },
    ],
  },
  {
    name: 'clinical_visits', label: 'Clinical Visits', color: '#ec4899', rowCount: 5680,
    columns: [
      { name: 'visit_id', type: 'id', pk: true, description: 'Identificativo visita' },
      { name: 'patient_id', type: 'id', fk: { table: 'patients', column: 'patient_id' }, description: 'Riferimento paziente' },
      { name: 'visit_date', type: 'date', description: 'Data della visita' },
      { name: 'visit_type', type: 'string', description: 'Tipo (Screening, Baseline, Follow-up)' },
      { name: 'investigator', type: 'string', description: 'Investigatore' },
      { name: 'site_id', type: 'string', fk: { table: 'sites', column: 'site_id' }, description: 'Sito di studio' },
    ],
  },
  {
    name: 'sites', label: 'Sites', color: '#64748b', rowCount: 12,
    columns: [
      { name: 'site_id', type: 'id', pk: true, description: 'Identificativo sito' },
      { name: 'site_name', type: 'string', description: 'Nome istituzione' },
      { name: 'country', type: 'string', description: 'Paese' },
      { name: 'pi_name', type: 'string', description: 'Principal investigator' },
      { name: 'active', type: 'boolean', description: 'Sito attivo' },
    ],
  },
];

// ─── Variabili ricche CARDIO (per analisi e grafici in NL) ───
const CARDIO_RICH: RichVariable[] = [
  richVar('age', 'patients', 'Età', 'integer', 'Età del paziente all’arruolamento (anni).', {
    kind: 'numeric', min: 19, max: 88, mean: 56.4, median: 58, bins: [
      { range: '18–30', count: 140 }, { range: '31–45', count: 310 }, { range: '46–60', count: 520 },
      { range: '61–75', count: 360 }, { range: '76–90', count: 90 },
    ],
  }, { stats: { missingPct: 1.2, uniqueCount: 58, sampleValues: [34, 57, 62, 71], topValues: [], distribution: { kind: 'numeric', min: 19, max: 88, mean: 56.4, median: 58, bins: [
    { range: '18–30', count: 140 }, { range: '31–45', count: 310 }, { range: '46–60', count: 520 }, { range: '61–75', count: 360 }, { range: '76–90', count: 90 },
  ] } }, completeness: 0.988, issues: ['1.2% valori mancanti'] }),
  richVar('gender', 'patients', 'Sesso', 'categorical', 'Sesso biologico del paziente.', {
    kind: 'categorical', categories: [{ name: 'F', count: 735 }, { name: 'M', count: 685 }],
  }),
  richVar('status', 'patients', 'Stato', 'categorical', 'Stato del paziente nello studio.', {
    kind: 'categorical', categories: [{ name: 'Active', count: 980 }, { name: 'Completed', count: 320 }, { name: 'Withdrawn', count: 120 }],
  }),
  richVar('enrollment_date', 'patients', 'Arruolamento', 'date', 'Data di arruolamento nello studio (per trimestre).', {
    kind: 'date', min: '2025-01-08', max: '2025-12-19', bins: [
      { name: 'Q1', count: 360 }, { name: 'Q2', count: 410 }, { name: 'Q3', count: 380 }, { name: 'Q4', count: 270 },
    ],
  }),
  richVar('site_id', 'patients', 'Sito', 'categorical', 'Sito di arruolamento dei pazienti.', {
    kind: 'categorical', categories: [
      { name: 'Site A', count: 420 }, { name: 'Site B', count: 380 }, { name: 'Site C', count: 290 },
      { name: 'Site D', count: 210 }, { name: 'Site E', count: 120 },
    ],
  }),
  richVar('lab_value', 'lab_results', 'Valore lab', 'float', 'Valore numerico dei risultati di laboratorio.', {
    kind: 'numeric', min: 0.01, max: 412, mean: 96.2, median: 88, bins: [
      { range: '<50', count: 1240 }, { range: '50–100', count: 3360 }, { range: '100–200', count: 2980 },
      { range: '200–300', count: 720 }, { range: '>300', count: 260 },
    ],
  }, { stats: { missingPct: 3.9, uniqueCount: 1203, sampleValues: [98, 187, 0.04], topValues: [], distribution: { kind: 'numeric', min: 0.01, max: 412, mean: 96.2, median: 88, bins: [
    { range: '<50', count: 1240 }, { range: '50–100', count: 3360 }, { range: '100–200', count: 2980 }, { range: '200–300', count: 720 }, { range: '>300', count: 260 },
  ] } }, completeness: 0.961, issues: ['3.9% mancante', '7 outlier'] }),
  richVar('test_name', 'lab_results', 'Test', 'categorical', 'Tipo di test di laboratorio.', {
    kind: 'categorical', categories: [
      { name: 'Troponin I', count: 1620 }, { name: 'BNP', count: 1760 }, { name: 'CRP', count: 1680 },
      { name: 'LDL', count: 1820 }, { name: 'HDL', count: 1680 },
    ],
  }),
  richVar('flag', 'lab_results', 'Flag', 'categorical', 'Flag di anomalia del risultato.', {
    kind: 'categorical', categories: [{ name: 'Normal', count: 6100 }, { name: 'High', count: 1900 }, { name: 'Low', count: 560 }],
  }),
  richVar('severity', 'adverse_events', 'Gravità AE', 'categorical', 'Gravità degli eventi avversi.', {
    kind: 'categorical', categories: [{ name: 'Mild', count: 260 }, { name: 'Moderate', count: 150 }, { name: 'Severe', count: 60 }],
  }),
];

// ─── Tabelle generiche per le collection stub ───
function stubTables(prefix: string, color: string): ExploreTable[] {
  return [
    {
      name: 'patients', label: 'Patients', color, rowCount: 800,
      columns: [
        { name: 'patient_id', type: 'id', pk: true, description: 'Identificativo paziente' },
        { name: 'age', type: 'integer', description: 'Età' },
        { name: 'gender', type: 'string', description: 'Sesso' },
        { name: 'enrollment_date', type: 'date', description: 'Arruolamento' },
        { name: 'site_id', type: 'string', description: 'Sito' },
        { name: 'status', type: 'string', description: 'Stato' },
      ],
    },
    {
      name: `${prefix}_results`, label: 'Results', color: '#8b5cf6', rowCount: 4200,
      columns: [
        { name: 'result_id', type: 'id', pk: true, description: 'Identificativo risultato' },
        { name: 'patient_id', type: 'id', fk: { table: 'patients', column: 'patient_id' }, description: 'Riferimento paziente' },
        { name: 'measure', type: 'string', description: 'Misura' },
        { name: 'value', type: 'float', description: 'Valore' },
        { name: 'date', type: 'date', description: 'Data' },
      ],
    },
    {
      name: 'adverse_events', label: 'Adverse Events', color: '#f59e0b', rowCount: 320,
      columns: [
        { name: 'ae_id', type: 'id', pk: true, description: 'Identificativo evento' },
        { name: 'patient_id', type: 'id', fk: { table: 'patients', column: 'patient_id' }, description: 'Riferimento paziente' },
        { name: 'severity', type: 'string', description: 'Gravità' },
        { name: 'start_date', type: 'date', description: 'Insorgenza' },
      ],
    },
  ];
}

// ─── Variabili ricche per le collection stub (scalate per varietà) ───
function stubRich(scale: number): RichVariable[] {
  const s = (n: number) => Math.round(n * scale);
  return [
    richVar('age', 'patients', 'Età', 'integer', 'Età del paziente all’arruolamento.', {
      kind: 'numeric', min: 18, max: 90, mean: 54, median: 55, bins: [
        { range: '18–30', count: s(120) }, { range: '31–45', count: s(260) }, { range: '46–60', count: s(300) },
        { range: '61–75', count: s(200) }, { range: '76–90', count: s(60) },
      ],
    }),
    richVar('gender', 'patients', 'Sesso', 'categorical', 'Sesso biologico del paziente.', {
      kind: 'categorical', categories: [{ name: 'F', count: s(430) }, { name: 'M', count: s(370) }],
    }),
    richVar('status', 'patients', 'Stato', 'categorical', 'Stato del paziente nello studio.', {
      kind: 'categorical', categories: [{ name: 'Active', count: s(540) }, { name: 'Completed', count: s(180) }, { name: 'Withdrawn', count: s(80) }],
    }),
    richVar('site_id', 'patients', 'Sito', 'categorical', 'Sito di arruolamento.', {
      kind: 'categorical', categories: [
        { name: 'Site A', count: s(260) }, { name: 'Site B', count: s(220) }, { name: 'Site C', count: s(180) }, { name: 'Site D', count: s(140) },
      ],
    }),
    richVar('severity', 'adverse_events', 'Gravità AE', 'categorical', 'Gravità degli eventi avversi.', {
      kind: 'categorical', categories: [{ name: 'Mild', count: s(180) }, { name: 'Moderate', count: s(100) }, { name: 'Severe', count: s(40) }],
    }),
  ];
}

// ─── Catalogo collection ───
function mk(
  id: string, name: string, description: string, targetDB: string,
  rowsLabel: string, sizeGB: number, tables: ExploreTable[], richVariables: RichVariable[],
): ExploreCollection {
  return {
    id, name, description, color: DB_HEX[id], dotClass: DB_DOT[id], targetDB,
    tableCount: tables.length,
    variableCount: tables.reduce((s, t) => s + t.columns.length, 0),
    rowsLabel, sizeGB, tables, richVariables,
  };
}

export const EXPLORE_COLLECTIONS: ExploreCollection[] = [
  mk('cardio-2024', 'CARDIO-2024', 'Studio cardiologico: pazienti, laboratorio, eventi avversi, terapie, visite e siti.', 'CARDIO-2024', '1.2M', 450, CARDIO_TABLES, CARDIO_RICH),
  mk('onco-trial-a', 'ONCO-TRIAL-A', 'Trial oncologico multicentrico con imaging e cicli di trattamento.', 'ONCO-TRIAL-A', '3.8M', 1228, stubTables('onco', '#f59e0b'), stubRich(1.6)),
  mk('neuro-phase3', 'NEURO-PHASE3', 'Studio neurologico di fase 3 con scale di valutazione e scan.', 'NEURO-PHASE3', '2.1M', 280, stubTables('neuro', '#8b5cf6'), stubRich(1.1)),
  mk('resp-pilot', 'RESP-PILOT', 'Studio pilota respiratorio con spirometrie e visite.', 'RESP-PILOT', '420K', 42, stubTables('resp', '#10b981'), stubRich(0.4)),
  mk('derm-cohort-b', 'DERM-COHORT-B', 'Coorte dermatologica con arruolamenti mensili.', 'DERM-COHORT-B', '780K', 96, stubTables('derm', '#3b82f6'), stubRich(0.7)),
];

export const COLLECTION_BY_ID: Record<string, ExploreCollection> = Object.fromEntries(
  EXPLORE_COLLECTIONS.map((c) => [c.id, c]),
);

export function getCollection(id: string): ExploreCollection | undefined {
  return COLLECTION_BY_ID[id];
}

// Risolve un nome collection (id o nome leggibile) verso un id di catalogo
export function resolveCollectionId(token: string): string | null {
  const t = token.trim().toLowerCase();
  for (const c of EXPLORE_COLLECTIONS) {
    if (c.id.toLowerCase() === t) return c.id;
    if (c.name.toLowerCase() === t) return c.id;
    if (c.name.toLowerCase().replace(/[-\s]/g, '') === t.replace(/[-\s]/g, '')) return c.id;
  }
  // match parziale (es. "cardio")
  for (const c of EXPLORE_COLLECTIONS) {
    if (c.name.toLowerCase().includes(t) || t.includes(c.id.split('-')[0])) return c.id;
  }
  return null;
}
