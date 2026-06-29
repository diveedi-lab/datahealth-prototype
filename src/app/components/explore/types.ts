import type { XYPosition } from '@xyflow/react';
import type { Variable } from '../ingestor/types';
import type { ResultTable } from '../shared/query';

export const EXPLORE_SCHEMA_VERSION = 1;

// ─── Scope: l'insieme di lavoro (collection + opzionale query di partenza) ───
export interface ScopeState {
  collections: string[];   // id delle collection (es. 'cardio-2024')
  queryId: string | null;  // id di una query nel workspace usata come base
}

// ─── Catalogo collection ───
export type ColumnType = 'string' | 'integer' | 'float' | 'date' | 'boolean' | 'id';

export interface ExploreColumn {
  name: string;
  type: ColumnType;
  pk?: boolean;
  fk?: { table: string; column: string };
  nullable?: boolean;
  description: string;
}

export interface ExploreTable {
  name: string;
  label: string;
  color: string;
  rowCount: number;
  columns: ExploreColumn[];
}

// Variabile "ricca" con distribuzione (per le analisi/grafici in NL)
export interface RichVariable {
  name: string;     // chiave usata nei comandi (es. 'age', 'sex', 'lab_value')
  table: string;    // tabella di appartenenza
  variable: Variable;
}

export interface ExploreCollection {
  id: string;
  name: string;
  description: string;
  color: string;        // hex per il canvas
  dotClass: string;     // classe tailwind per il pallino (riuso DB_COLORS)
  targetDB: string;
  tableCount: number;
  variableCount: number;
  rowsLabel: string;    // '1.2M'
  sizeGB: number;
  tables: ExploreTable[];
  richVariables: RichVariable[];
}

// ─── Query nel workspace ───
export type QueryStatus = 'idle' | 'running' | 'success' | 'empty' | 'error';

export interface ExploreQuery {
  id: string;
  title: string;
  prompt: string;          // linguaggio naturale
  sql: string;
  collections: string[];   // snapshot dello scope al momento della creazione
  status: QueryStatus;
  results: ResultTable[];   // una o più tabelle risultanti
  rowCount: number;
  execMs: number;
  createdAt: number;
}

// ─── Chart / analisi ───
export type ChartType = 'bar' | 'line' | 'pie' | 'histogram' | 'kpi';
export type AnalysisType = 'summary_stats' | 'missingness' | 'correlation' | 'crosstab' | 'outliers';

export interface ChartDatum { name: string; value: number; }

export interface ChartSpec {
  chartType: ChartType;
  data: ChartDatum[];
  unit?: string;
  kpi?: { value: string; label: string; sub?: string };
}

export type ChartSource =
  | { kind: 'query'; queryId: string }
  | { kind: 'collection'; collectionId: string };

export interface ExploreChart {
  id: string;
  title: string;
  kind: 'chart' | 'analysis';
  chartType: ChartType;
  variable?: string;
  groupBy?: string;
  analysis?: AnalysisType;
  source: ChartSource;
  spec: ChartSpec;
  altSpecs?: Record<ChartType, ChartSpec>;  // varianti per i toggle
  insight: string;
  createdAt: number;
}

// ─── Chat ───
export interface ExploreChatMsg {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  actionsSummary?: string;
}

// ─── Stato completo (serializzato in localStorage) ───
export interface ExploreState {
  schemaVersion: number;
  id: string;
  scope: ScopeState;
  queries: Record<string, ExploreQuery>;
  charts: Record<string, ExploreChart>;
  positions: Record<string, XYPosition>;  // id nodo → posizione (collection/query/chart)
  chatLog: ExploreChatMsg[];
  selectedId: string | null;
  busy: boolean;
}

// Tipo del nodo logico sul canvas (derivato dallo stato)
export type ExploreNodeKind = 'collection' | 'query' | 'chart';
