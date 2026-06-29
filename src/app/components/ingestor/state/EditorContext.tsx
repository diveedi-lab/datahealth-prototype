import React, { createContext, useContext, useEffect, useReducer, useRef } from 'react';
import type { EditorState } from '../types';
import { editorReducer, type EditorAction } from './editorReducer';
import { loadState, saveState } from './persistence';
import { createDemoState, createEmptyState } from '../mock/mockData';

function initState(id: string): EditorState {
  const saved = loadState(id);
  if (saved) return saved;
  // "New Collection" → vuota; card esistenti → demo ricca COLL-CARDIO-Q2
  if (id.startsWith('new-')) return createEmptyState(id);
  return createDemoState(id);
}

interface EditorContextValue {
  state: EditorState;
  dispatch: React.Dispatch<EditorAction>;
}

const EditorContext = createContext<EditorContextValue | null>(null);

export function EditorProvider({ collectionId, children }: { collectionId: string; children: React.ReactNode }) {
  const [state, dispatch] = useReducer(editorReducer, collectionId, initState);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Persistenza debounced su localStorage (il NODE_MOVE è frequente durante il drag)
  useEffect(() => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => saveState(collectionId, state), 300);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [state, collectionId]);

  return <EditorContext.Provider value={{ state, dispatch }}>{children}</EditorContext.Provider>;
}

export function useEditor(): EditorContextValue {
  const ctx = useContext(EditorContext);
  if (!ctx) throw new Error('useEditor must be used within an EditorProvider');
  return ctx;
}
