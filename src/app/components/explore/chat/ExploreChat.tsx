import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, User, Wand2 } from 'lucide-react';
import { useExplore } from '../state/ExploreContext';
import { genId } from '../ids';
import { getCollection } from '../mock/mockCatalog';
import { buildAiCatalog, sanitizeActions, applyActions, fallbackActions } from '../applyActions';
import { ArtifactCard } from '../artifacts/ArtifactCard';

const SUGGESTIONS = [
  'Pazienti over 60 con troponina alta',
  'Distribuzione dell’età',
  'Valore lab per sito',
  'Correlazione tra età e valore lab',
];

export function ExploreChat({ onOpenArtifact }: { onOpenArtifact: (id: string) => void }) {
  const { state, dispatch } = useExplore();
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const msgs = state.chatLog;

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [msgs, typing]);

  const send = async (text: string) => {
    const t = text.trim();
    if (!t || typing) return;
    dispatch({ type: 'APPEND_CHAT', msg: { id: genId('m'), role: 'user', text: t } });
    setInput('');
    setTyping(true);

    const history = [...msgs, { role: 'user', text: t }].map((m) => ({ role: m.role, text: m.text })).slice(-12);
    const scope = {
      collections: state.scope.collections,
      names: state.scope.collections.map((c) => getCollection(c)?.name ?? c),
      activeQueryId: state.scope.queryId,
      activeQueryTitle: state.scope.queryId ? state.artifacts[state.scope.queryId]?.title : undefined,
    };

    const finish = (replyText: string, summary: string, artifactIds: string[]) => {
      dispatch({
        type: 'APPEND_CHAT',
        msg: {
          id: genId('m'), role: 'assistant',
          text: replyText || (summary ? 'Fatto.' : '…'),
          actionsSummary: summary || undefined,
          artifactIds: artifactIds.length ? artifactIds : undefined,
        },
      });
      setTyping(false);
    };

    try {
      const res = await fetch('/api/explore', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ messages: history, scope, catalog: buildAiCatalog() }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const serverReturnedActions = Array.isArray(data?.actions) && data.actions.length > 0;
      const actions = sanitizeActions(data?.actions);
      const apiMessage = typeof data?.message === 'string' && data.message.trim() ? data.message.trim() : '';
      if (actions.length === 0) {
        if (serverReturnedActions) {
          finish(apiMessage || 'Non ho capito bene la richiesta: puoi indicare la collection o la variabile da usare?', '', []);
          return;
        }
        const r = applyActions(fallbackActions(t, state.scope.collections), { state, dispatch });
        finish(apiMessage || r.replyText, r.summary, r.artifactIds);
        return;
      }
      const r = applyActions(actions, { state, dispatch });
      finish(apiMessage || r.replyText, r.summary, r.artifactIds);
    } catch {
      const r = applyActions(fallbackActions(t, state.scope.collections), { state, dispatch });
      finish(r.replyText, r.summary, r.artifactIds);
    }
  };

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="flex-1 overflow-auto">
        <div className="max-w-3xl mx-auto w-full px-4 py-4 space-y-3">
          {msgs.map((m) => (
            <div key={m.id} className={`flex gap-2 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-7 h-7 rounded-full shrink-0 flex items-center justify-center ${m.role === 'user' ? 'bg-blue-600' : 'bg-violet-100'}`}>
                {m.role === 'user' ? <User className="w-4 h-4 text-white" /> : <Sparkles className="w-4 h-4 text-violet-600" />}
              </div>
              <div className="max-w-[80%] space-y-1.5">
                <div className={`text-sm leading-relaxed px-3.5 py-2.5 rounded-2xl ${m.role === 'user' ? 'bg-blue-600 text-white rounded-tr-sm' : 'bg-zinc-100 text-zinc-700 rounded-tl-sm'}`}>
                  {m.text}
                </div>
                {m.actionsSummary && (
                  <div className="flex items-start gap-1.5 text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-lg px-2 py-1">
                    <Wand2 className="w-3 h-3 mt-0.5 shrink-0" />
                    <span>{m.actionsSummary}</span>
                  </div>
                )}
                {m.artifactIds && m.artifactIds.length > 0 && (
                  <div className="space-y-1.5">
                    {m.artifactIds.map((aid) => {
                      const art = state.artifacts[aid];
                      if (!art) return null;
                      return (
                        <ArtifactCard
                          key={aid}
                          artifact={art}
                          active={state.currentArtifactId === aid}
                          onOpen={onOpenArtifact}
                        />
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          ))}
          {typing && (
            <div className="flex gap-2">
              <div className="w-7 h-7 rounded-full bg-violet-100 flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4 text-violet-600" />
              </div>
              <div className="bg-zinc-100 rounded-2xl rounded-tl-sm px-3 py-2.5 flex gap-1">
                <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce" />
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>
      </div>

      <div className="shrink-0 border-t border-zinc-200 bg-white">
        <div className="max-w-3xl mx-auto w-full px-4 py-3">
          {msgs.length <= 2 && (
            <div className="pb-2 flex flex-wrap gap-1.5">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="text-[11px] px-2.5 py-1 rounded-full border border-zinc-200 text-zinc-600 hover:bg-zinc-50"
                >
                  {s}
                </button>
              ))}
            </div>
          )}
          <div className="flex items-center gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') send(input); }}
              placeholder="Chiedi una query, un grafico o un'analisi…"
              className="flex-1 px-4 py-2.5 text-sm bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:ring-2 focus:ring-violet-500/40"
            />
            <button
              onClick={() => send(input)}
              disabled={!input.trim() || typing}
              className="p-2.5 bg-violet-600 hover:bg-violet-700 disabled:opacity-40 text-white rounded-xl"
              aria-label="Invia"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
