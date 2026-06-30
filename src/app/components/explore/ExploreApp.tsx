import React, { useState } from 'react';
import type { ExploreState } from './types';
import { ExploreHome } from './ExploreHome';
import { ExploreWorkspace } from './ExploreWorkspace';
import { genId } from './ids';

type View = { mode: 'home' } | { mode: 'workspace'; id: string; seed?: ExploreState };

export function ExploreApp({
  initial, onExit,
}: {
  initial: View;
  onExit: () => void;
}) {
  const [view, setView] = useState<View>(initial);

  if (view.mode === 'workspace') {
    return (
      <ExploreWorkspace
        key={view.id}
        explorationId={view.id}
        seed={view.seed}
        onClose={() => setView({ mode: 'home' })}
      />
    );
  }

  return (
    <ExploreHome
      onOpen={(id) => setView({ mode: 'workspace', id })}
      onNewChat={() => setView({ mode: 'workspace', id: `exp-${genId('e')}` })}
      onClose={onExit}
    />
  );
}
