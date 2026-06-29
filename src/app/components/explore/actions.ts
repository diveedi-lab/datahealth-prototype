import type { ChartType, AnalysisType, ChartSource } from './types';

// ─── Catalogo delle azioni che l'AI può emettere (tool use) ───
// Union discriminata su `type`. Il client le valida (sanitizeActions) e le applica.

export interface SetScopeAction {
  type: 'set_scope';
  collections: string[];
  queryId?: string | null;
}
export interface AddToScopeAction {
  type: 'add_to_scope';
  collections: string[];
}
export interface RemoveFromScopeAction {
  type: 'remove_from_scope';
  collections: string[];
}
export interface CreateQueryAction {
  type: 'create_query';
  title: string;
  prompt: string;
  collections?: string[];
  domain?: string;
  variables?: string[];
}
export interface CreateChartAction {
  type: 'create_chart';
  title: string;
  chartType: ChartType;
  variable: string;
  groupBy?: string;          // serie categoriale (grouped/stacked/multiline/crosstab)
  secondVariable?: string;   // seconda variabile numerica (scatter/correlazione)
  source?: ChartSource;
}
export interface CreateAnalysisAction {
  type: 'create_analysis';
  title: string;
  analysis: AnalysisType;
  variables: string[];
  source?: ChartSource;
}
export interface SaveQueryAction {
  type: 'save_query';
  targetId?: string;
  name?: string;
  visibility?: 'private' | 'team' | 'public';
}
export interface AnswerAction {
  type: 'answer';
  text: string;
}
export interface ExplainAction {
  type: 'explain';
  targetId?: string;
  text: string;
}

export type ExploreAction =
  | SetScopeAction
  | AddToScopeAction
  | RemoveFromScopeAction
  | CreateQueryAction
  | CreateChartAction
  | CreateAnalysisAction
  | SaveQueryAction
  | AnswerAction
  | ExplainAction;

export const CHART_TYPES: ChartType[] = [
  'bar', 'line', 'pie', 'histogram', 'kpi', 'grouped', 'stacked', 'multiline', 'scatter', 'crosstab',
];
export const ANALYSIS_TYPES: AnalysisType[] = [
  'summary_stats', 'missingness', 'correlation', 'crosstab', 'outliers',
];
