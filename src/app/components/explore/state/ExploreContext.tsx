import React, { createContext, useContext, useEffect, useReducer, useRef } from 'react';
import type { ExploreState } from '../types';
import { exploreReducer, type ExploreReducerAction } from './exploreReducer';
import { loadExplore, saveExplore } from './persistence';
import { createEmptyExplore } from '../mock/mockLibrary';

interface InitArg { id: string; seed?: ExploreState }

function initState(arg: InitArg): ExploreState {
  const saved = loadExplore(arg.id);
  if (saved) return saved;
  if (arg.seed) return arg.seed;
  return createEmptyExplore(arg.id);
}

interface ExploreContextValue {
  state: ExploreState;
  dispatch: React.Dispatch<ExploreReducerAction>;
}

const ExploreContext = createContext<ExploreContextValue | null>(null);

export function ExploreProvider({
  explorationId, seed, children,
}: {
  explorationId: string;
  seed?: ExploreState;
  children: React.ReactNode;
}) {
  const [state, dispatch] = useReducer(exploreReducer, { id: explorationId, seed }, initState);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => saveExplore(explorationId, state), 300);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [state, explorationId]);

  return <ExploreContext.Provider value={{ state, dispatch }}>{children}</ExploreContext.Provider>;
}

export function useExplore(): ExploreContextValue {
  const ctx = useContext(ExploreContext);
  if (!ctx) throw new Error('useExplore must be used within an ExploreProvider');
  return ctx;
}
