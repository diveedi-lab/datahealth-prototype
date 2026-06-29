import type { EditorNode, EditorEdge } from '../types';
import { buildEdges } from './mockData';

// Analisi simulata: marca tutti i nodi come analizzati e genera le connessioni
// (match SUBJID, referenze immagini, link di contesto). I dati statistici sono
// già presenti nei nodi mock e diventano visibili solo dopo l'analisi.
export function runAnalysis(nodes: EditorNode[]): { nodes: EditorNode[]; edges: EditorEdge[] } {
  const analyzed = nodes.map((n) => ({ ...n, data: { ...n.data, analyzed: true } }));
  return { nodes: analyzed, edges: buildEdges(analyzed) };
}
