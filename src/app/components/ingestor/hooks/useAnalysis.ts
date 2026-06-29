import { useCallback } from 'react';
import { useEditor } from '../state/EditorContext';

// Avvia l'analisi simulata (spinner + delay). Il calcolo avviene nel reducer
// sui nodi correnti, così rimuovere/aggiungere file durante lo spinner resta coerente.
export function useRunAnalysis() {
  const { dispatch } = useEditor();
  return useCallback(() => {
    dispatch({ type: 'SET_BUSY', busy: 'analyzing' });
    setTimeout(() => {
      dispatch({ type: 'RUN_ANALYSIS', at: Date.now() });
    }, 1100);
  }, [dispatch]);
}
