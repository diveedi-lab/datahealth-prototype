import { useCallback } from 'react';
import { useEditor } from '../state/EditorContext';
import { runAnalysis } from '../mock/mockAnalysis';

// Esegue l'analisi simulata (spinner + delay) e popola nodi/edge + timestamp/firma.
export function useRunAnalysis() {
  const { state, dispatch } = useEditor();
  return useCallback(() => {
    dispatch({ type: 'SET_BUSY', busy: 'analyzing' });
    const nodes = state.nodes;
    setTimeout(() => {
      const r = runAnalysis(nodes);
      dispatch({ type: 'SET_ANALYSIS', nodes: r.nodes, edges: r.edges, at: Date.now() });
    }, 1100);
  }, [state.nodes, dispatch]);
}
