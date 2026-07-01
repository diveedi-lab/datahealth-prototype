import React, { useState } from 'react';
import type { ExploreState } from './types';
import { ExploreApp } from './ExploreApp';
import { ModeChooser, type ExploreMode } from './ModeChooser';
import { QueryTool } from './query/QueryTool';
import { DataExplorer } from './graphical/DataExplorer';

export type ExploreAppInitial = { mode: 'home' } | { mode: 'workspace'; id: string; seed?: ExploreState };
export type EntryInitial = { kind: 'chooser' } | { kind: 'chat'; app: ExploreAppInitial };

// Umbrella: chooser tra le 3 modalità (chat / query assistite / grafico), o chat diretta (da Saved/History).
export function ExploreEntry({ initial, onExit }: { initial: EntryInitial; onExit: () => void }) {
  const [view, setView] = useState<'chooser' | ExploreMode>(initial.kind === 'chat' ? 'chat' : 'chooser');
  const chatInit: ExploreAppInitial = initial.kind === 'chat' ? initial.app : { mode: 'home' };
  const directChat = initial.kind === 'chat';

  if (view === 'chat') {
    return <ExploreApp initial={chatInit} onExit={directChat ? onExit : () => setView('chooser')} />;
  }
  if (view === 'query') return <QueryTool onBack={() => setView('chooser')} />;
  if (view === 'graphical') return <DataExplorer onBack={() => setView('chooser')} />;
  return <ModeChooser onPick={setView} onExit={onExit} />;
}
