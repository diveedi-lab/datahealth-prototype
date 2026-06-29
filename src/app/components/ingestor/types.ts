import type { XYPosition } from '@xyflow/react';

// ─── Stadi del flusso ───
export type FlowStage =
  | 'source'
  | 'analyzed'
  | 'conversion'
  | 'validation'
  | 'finalized';

export const STAGE_ORDER: FlowStage[] = [
  'source', 'analyzed', 'conversion', 'validation', 'finalized',
];

export const STAGE_LABEL: Record<FlowStage, string> = {
  source: 'Source data',
  analyzed: 'Analisi',
  conversion: 'Conversione',
  validation: 'Validazione',
  finalized: 'Virtual Collection',
};

// ─── Categorie file e formati ───
export type FileBucket = 'datafeed' | 'file-collection' | 'context';
export type SourceFormat = 'custom' | 'oracledb' | 'redcap' | 'omop' | 'cdash' | 'cdisc' | 'fhir';
export type TargetFormat = 'omop' | 'cdisc' | 'fhir';
export type VarType = 'string' | 'integer' | 'float' | 'date' | 'boolean' | 'id' | 'categorical';
export type ValidationStatus = 'pending' | 'validated' | 'rejected' | 'needs-review';

// ─── Statistiche / distribuzioni delle variabili ───
export interface CategoryCount { name: string; count: number; }
export interface HistogramBin { range: string; count: number; }

export type Distribution =
  | { kind: 'categorical'; categories: CategoryCount[] }
  | { kind: 'numeric'; bins: HistogramBin[]; min: number; max: number; mean: number; median: number }
  | { kind: 'date'; bins: CategoryCount[]; min: string; max: string }
  | { kind: 'boolean'; trueCount: number; falseCount: number }
  | { kind: 'none' };

export interface VarStats {
  missingPct: number;
  uniqueCount: number;
  sampleValues: (string | number)[];
  topValues: { value: string | number; count: number; pct: number }[];
  distribution: Distribution;
}

export interface Variable {
  name: string;
  label: string;
  type: VarType;
  description: string;
  pk?: boolean;
  fk?: { file: string; column: string };
  nullable?: boolean;
  completeness: number; // 0..1
  issues?: string[];
  stats?: VarStats; // valorizzato dopo l'analisi
}

export interface FileMatch {
  total: number;
  matched: number;
  unmatched: number;
  unmatchedExamples: string[];
  note?: string;
}

// ─── Dati portati da un nodo-file di React Flow ───
export interface FileNodeData {
  bucket: FileBucket;
  label: string;
  fileName: string;
  color: string;
  analyzed: boolean;
  // datafeed (tabella)
  rowCount?: number;
  variables?: Variable[];
  completeness?: number; // a livello file, dopo analisi
  // file-collection (es. immagini)
  memberCount?: number;
  totalSizeGB?: number;
  fileKind?: string;
  namingPattern?: string;
  match?: FileMatch;
  // context
  contextType?: string;
  role?: string;
  helps?: string;
  // anteprima dei dati grezzi (disponibile anche prima dell'analisi, nello stadio Source data)
  previewRows?: Array<Record<string, string | number>>;  // righe d'esempio per i file tabulari
  previewFiles?: string[];                                 // nomi file d'esempio per le file-collection
  previewText?: string;                                    // estratto testuale per i file di contesto
  previewTable?: { headers: string[]; rows: string[][] };  // tabella d'esempio (es. mapping)
}

// ─── File "caricato" (stadio upload, prima di diventare nodo) ───
export interface CollectionFileInput {
  id: string;
  bucket: FileBucket;
  name: string;
  sizeLabel: string;
  meta: string;       // breve descrittore mostrato nella lista upload
  uploadedVia?: 'web' | 'cli';
}

// ─── Nodi / edge serializzati ───
export type EditorNodeType = 'tabularFile' | 'fileCollection' | 'contextNode';

export interface EditorNode {
  id: string;
  type: EditorNodeType;
  position: XYPosition;
  data: FileNodeData;
}

export type EdgeKind = 'id-match' | 'context-link';
export interface EditorEdge {
  id: string;
  source: string;
  target: string;
  kind: EdgeKind;
  label?: string;
}

// ─── Forward-compat: conversione N:N (Fase 2) ───
export interface TransformerIO { nodeId: string; columns: string[]; }
export type TransformerKind = '1:1' | 'split' | 'merge' | 'complex' | 'drop';
export interface Transformer {
  id: string;
  position: XYPosition;
  title: string;
  kind: TransformerKind;
  description: string;
  code: string;
  inputs: TransformerIO[];
  outputs: TransformerIO[];
  validation: ValidationStatus;
}

// ─── Meta della Collection ───
export interface CollectionMeta {
  id: string;
  name: string;
  description: string;
  targetDatabase: string;
  createdBy: string;
  sourceFormat?: SourceFormat;
  targetFormat?: TargetFormat;
}

// ─── Stato completo dell'editor (serializzato in localStorage) ───
export interface EditorState {
  schemaVersion: number;
  meta: CollectionMeta;
  stage: FlowStage;
  maxStageReached: FlowStage;
  uploads: CollectionFileInput[];
  nodes: EditorNode[];
  edges: EditorEdge[];
  transformers: Transformer[];
  viewport?: { x: number; y: number; zoom: number };
  busy: null | 'analyzing' | 'converting' | 'finalizing';
  // Tracciamento analisi per il banner + staleness dello stepper
  analyzedAt: number | null;          // timestamp dell'ultima analisi
  analyzedSignature: string | null;   // firma dei dati sorgente al momento dell'analisi
}

export const SCHEMA_VERSION = 2;
