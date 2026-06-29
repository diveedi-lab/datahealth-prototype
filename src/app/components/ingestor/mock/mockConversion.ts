import type { Transformer, TargetTable, TargetFormat, SourceFormat, VarType } from '../types';

const tcol = (name: string, type: VarType, required: boolean, description: string, mappedFrom?: string) =>
  ({ name, type, required, description, mappedFrom });

const TARGET_COLOR = { cdisc: '#8b5cf6', omop: '#06b6d4', fhir: '#10b981' };

function targetTables(): TargetTable[] {
  return [
    {
      id: 'tgt-ie', name: 'IE', format: 'cdisc', label: 'Inclusion/Exclusion', color: TARGET_COLOR.cdisc,
      position: { x: 980, y: 60 }, estRowCount: 127,
      columns: [
        tcol('STUDYID', 'string', true, 'Identificativo studio', 'const CARDIO-2024'),
        tcol('USUBJID', 'id', true, 'Soggetto univoco', 'INCL.SUBJID'),
        tcol('IETESTCD', 'string', true, 'Codice criterio', 'INCL.colname'),
        tcol('IETEST', 'string', true, 'Testo criterio', 'protocollo'),
        tcol('IECAT', 'string', false, 'Categoria (INCL/EXCL)', 'const INCL'),
        tcol('IEORRES', 'string', true, 'Risultato originale', 'valore N'),
        tcol('IESTRESC', 'string', true, 'Risultato standard', "const NOT MET"),
      ],
    },
    {
      id: 'tgt-dm', name: 'DM', format: 'cdisc', label: 'Demographics', color: TARGET_COLOR.cdisc,
      position: { x: 980, y: 250 }, estRowCount: 1420,
      columns: [
        tcol('STUDYID', 'string', true, 'Identificativo studio', 'const CARDIO-2024'),
        tcol('USUBJID', 'id', true, 'Soggetto univoco', 'DEMOG.SUBJID'),
        tcol('AGE', 'integer', false, 'Età', 'DEMOG.AGE'),
        tcol('SEX', 'string', true, 'Sesso', 'DEMOG.SEX'),
        tcol('RACE', 'string', false, 'Etnia', 'DEMOG.RACE'),
        tcol('RFSTDTC', 'date', false, 'Data inizio reference', 'DEMOG.ENROLDT'),
      ],
    },
    {
      id: 'tgt-person', name: 'person', format: 'omop', label: 'OMOP person', color: TARGET_COLOR.omop,
      position: { x: 980, y: 430 }, estRowCount: 1420,
      columns: [
        tcol('person_id', 'id', true, 'ID persona', 'DEMOG.SUBJID'),
        tcol('year_of_birth', 'integer', true, 'Anno di nascita', 'derivata da DEMOG.AGE'),
        tcol('gender_concept_id', 'integer', true, 'Concept genere', 'map DEMOG.SEX'),
        tcol('race_concept_id', 'integer', false, 'Concept etnia', 'map DEMOG.RACE'),
      ],
    },
    {
      id: 'tgt-vs', name: 'VS', format: 'cdisc', label: 'Vital Signs', color: TARGET_COLOR.cdisc,
      position: { x: 980, y: 600 }, estRowCount: 11360,
      columns: [
        tcol('STUDYID', 'string', true, 'Identificativo studio', 'const CARDIO-2024'),
        tcol('USUBJID', 'id', true, 'Soggetto univoco', 'VS.SUBJID'),
        tcol('VSTESTCD', 'string', true, 'Parametro', 'VS.VSTESTCD'),
        tcol('VSORRES', 'float', true, 'Valore', 'VS.VSORRES + LB.custom_biomarker'),
        tcol('VSDTC', 'date', false, 'Data', 'VS.VSDT'),
      ],
    },
  ];
}

const INCL_SQL = `SELECT 'CARDIO-2024' AS STUDYID, i.SUBJID AS USUBJID,
       c.code AS IETESTCD, c.text AS IETEST, 'INCL' AS IECAT,
       'N' AS IEORRES, 'NOT MET' AS IESTRESC
FROM INCL i
CROSS JOIN LATERAL (VALUES
  ('INCL01', i.INCL01, 'Age >= 18 years'),
  ('INCL02', i.INCL02, 'Signed informed consent'),
  ('INCL03', i.INCL03, 'Confirmed CAD diagnosis'),
  ('INCL04', i.INCL04, 'LVEF >= 40%'),
  ('INCL05', i.INCL05, 'No prior MI within 30 days'),
  ('INCL06', i.INCL06, 'Able to attend all visits')
) AS c(code, val, text)
WHERE c.val = 'N';   -- i criteri soddisfatti (Y) restano impliciti`;

const DM_PY = `dm = demog.rename(columns={'SUBJID':'USUBJID','ENROLDT':'RFSTDTC'})
dm['STUDYID'] = 'CARDIO-2024'
dm = dm[['STUDYID','USUBJID','AGE','SEX','RACE','RFSTDTC']]   # SITE_FREETEXT droppata

person = pd.DataFrame({
  'person_id': demog['SUBJID'],
  'year_of_birth': enrollment_year - demog['AGE'],
  'gender_concept_id': demog['SEX'].map({'M':8507,'F':8532}),
  'race_concept_id': demog['RACE'].map(RACE_CONCEPTS),
})`;

const VS_PY = `vs_std = vs[['SUBJID','VSTESTCD','VSORRES','VSDT']].rename(
    columns={'SUBJID':'USUBJID','VSDT':'VSDTC'})
bio = lb[lb.LBTESTCD.isna()][['SUBJID','custom_biomarker']].rename(
    columns={'SUBJID':'USUBJID','custom_biomarker':'VSORRES'})
bio['VSTESTCD'] = 'BIOMARK'
vs_out = pd.concat([vs_std, bio]).assign(STUDYID='CARDIO-2024')`;

function transformers(): Transformer[] {
  return [
    {
      id: 'tr-incl', position: { x: 540, y: 100 }, title: 'INCL → IE (wide→long)', kind: 'complex',
      description:
        'Origine "wide": 1 riga per paziente, una colonna Y/N per criterio. Destinazione CDISC IE "long": una riga per paziente×criterio, ma SOLO per i criteri NON soddisfatti (valore N). I criteri soddisfatti (Y) restano impliciti e non generano righe.',
      codeLang: 'sql', code: INCL_SQL,
      inputs: [{ fileId: 'f-incl', columns: ['SUBJID', 'INCL01', 'INCL02', 'INCL03', 'INCL04', 'INCL05', 'INCL06'] }],
      outputs: [{ targetId: 'tgt-ie', columns: ['USUBJID', 'IETESTCD', 'IETEST', 'IEORRES', 'IESTRESC'] }],
      validation: 'needs-review',
      validationMessage: 'INCL05 è un criterio di esclusione invertito: verifica la semantica Y/N con il protocollo prima di confermare.',
      rowEffect: { inputRows: 1420, outputRows: 127, note: '6×1420 celle valutate; solo 127 valori "N" diventano righe.' },
    },
    {
      id: 'tr-dm', position: { x: 540, y: 300 }, title: 'DEMOG → DM + person (split)', kind: 'split',
      description:
        'I dati anagrafici di DEMOG si dividono su due destinazioni: CDISC DM e OMOP person. La colonna SITE_FREETEXT non mappa a nessun target e viene droppata.',
      codeLang: 'python', code: DM_PY,
      inputs: [{ fileId: 'f-demog', columns: ['SUBJID', 'AGE', 'SEX', 'RACE', 'ENROLDT', 'SITE_FREETEXT'] }],
      outputs: [
        { targetId: 'tgt-dm', columns: ['USUBJID', 'AGE', 'SEX', 'RACE', 'RFSTDTC'] },
        { targetId: 'tgt-person', columns: ['person_id', 'year_of_birth', 'gender_concept_id', 'race_concept_id'] },
      ],
      validation: 'pending',
      validationMessage: '1 colonna droppata (SITE_FREETEXT) — conferma che non serva.',
      rowEffect: { inputRows: 1420, outputRows: 2840, note: '1420 righe → DM (1420) + person (1420).' },
    },
    {
      id: 'tr-vs', position: { x: 540, y: 520 }, title: 'VS + LB → VS (merge)', kind: 'merge',
      description:
        'I vital signs di VS e il biomarcatore custom da LB confluiscono nello stesso dominio CDISC VS, allineati su SUBJID.',
      codeLang: 'python', code: VS_PY,
      inputs: [
        { fileId: 'f-vs', columns: ['SUBJID', 'VSTESTCD', 'VSORRES', 'VSDT'] },
        { fileId: 'f-lb', columns: ['SUBJID', 'custom_biomarker'] },
      ],
      outputs: [{ targetId: 'tgt-vs', columns: ['USUBJID', 'VSTESTCD', 'VSORRES', 'VSDTC'] }],
      validation: 'pending',
      rowEffect: { inputRows: 19920, outputRows: 12410, note: 'VS (11360) + biomarker (1050) → VS (12410).' },
    },
  ];
}

// La conversione è simulata: per il prototipo restituisce il set demo (redcap→cdisc/omop)
// indipendentemente dal formato scelto.
export function generateConversion(_targetFormat: TargetFormat): { transformers: Transformer[]; targetTables: TargetTable[] } {
  return { transformers: transformers(), targetTables: targetTables() };
}

export function buildVirtualCollection(state: {
  meta: { sourceFormat?: SourceFormat; targetFormat?: TargetFormat };
  transformers: Transformer[];
  targetTables: TargetTable[];
}, at: number) {
  const passed = state.transformers.filter((t) => t.validation === 'validated').length;
  const warnings = state.transformers.filter((t) => t.validation === 'needs-review').length;
  const errors = state.transformers.filter((t) => t.validation === 'rejected').length;
  return {
    createdAt: at,
    sourceFormat: state.meta.sourceFormat ?? 'redcap',
    targetFormat: state.meta.targetFormat ?? 'cdisc',
    tables: state.targetTables.map((t) => ({ targetId: t.id, name: t.name, rowCount: t.estRowCount })),
    unmapped: [{ file: 'DEMOG.csv', columns: ['SITE_FREETEXT'] }],
    passed, warnings, errors,
  };
}
