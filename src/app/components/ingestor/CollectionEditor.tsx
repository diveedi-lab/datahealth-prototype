import React, { useState } from 'react';
import { EditorProvider, useEditor } from './state/EditorContext';
import { EditorToolbar } from './EditorToolbar';
import { AnalysisBanner } from './AnalysisBanner';
import { StageRouter } from './StageRouter';
import { AiChat } from './AiChat';
import { STAGE_LABEL } from './types';

export function CollectionEditor({ collectionId, onClose }: { collectionId: string; onClose: () => void }) {
  return (
    <EditorProvider collectionId={collectionId}>
      <EditorShell onClose={onClose} />
    </EditorProvider>
  );
}

function EditorShell({ onClose }: { onClose: () => void }) {
  const { state } = useEditor();
  const [chatOpen, setChatOpen] = useState(false);
  const scope = `${STAGE_LABEL[state.stage]} · ${state.meta.name}`;

  return (
    <div className="h-screen w-screen flex flex-col app-backdrop overflow-hidden">
      <EditorToolbar onClose={onClose} chatOpen={chatOpen} onToggleChat={() => setChatOpen((o) => !o)} />
      <AnalysisBanner />
      <div className="flex-1 flex min-h-0">
        <StageRouter />
        {chatOpen && (
          <div className="w-[380px] shrink-0 border-l border-zinc-200">
            <AiChat
              scope={scope}
              hint="Posso aiutarti sulla vista corrente."
              suggestions={['Cosa devo fare qui?', 'Spiega i collegamenti tra i file', 'Quali problemi di qualità ci sono?']}
              onClose={() => setChatOpen(false)}
            />
          </div>
        )}
      </div>
    </div>
  );
}
