import React from 'react';
import { EditorProvider } from './state/EditorContext';
import { EditorToolbar } from './EditorToolbar';
import { AnalysisBanner } from './AnalysisBanner';
import { StageRouter } from './StageRouter';

export function CollectionEditor({ collectionId, onClose }: { collectionId: string; onClose: () => void }) {
  return (
    <EditorProvider collectionId={collectionId}>
      <div className="h-screen w-screen flex flex-col bg-zinc-50 overflow-hidden">
        <EditorToolbar onClose={onClose} />
        <AnalysisBanner />
        <StageRouter />
      </div>
    </EditorProvider>
  );
}
