import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, X, User } from 'lucide-react';

interface ChatMsg { id: string; role: 'user' | 'assistant'; text: string; }

let seq = 0;
const nextId = () => `m${seq++}`;

// Risposta di fallback (usata se la serverless function non è raggiungibile, es. in dev locale).
function fallbackReply(text: string, scope: string): string {
  const q = text.toLowerCase();
  const pick = (s: string) => s;
  if (q.includes('incl') || q.includes('inclusion') || q.includes('criteri'))
    return pick(`Nel file INCL i criteri sono in formato "wide" (una colonna per criterio, Y/N). In conversione verso CDISC IE diventano "long": una riga per paziente×criterio, tenendo solo i valori NON idonei (N). Vuoi che ti prepari la bozza di trasformazione?`);
  if (q.includes('immagin') || q.includes('imgref') || q.includes('dicom') || q.includes('orfan'))
    return pick(`Le immagini sono collegate tramite la colonna VS.IMGREF (nome file). Ci sono 119 file orfani: 71 con subject inesistente, 38 con visita ignota, 10 con nome malformato. Posso suggerirti una regola per gestirli.`);
  if (q.includes('mancant') || q.includes('missing') || q.includes('qualit') || q.includes('null'))
    return pick(`Sulla qualità: AGE ha ~1.2% di valori mancanti, LB.LBORRES ~3.9% con 7 outlier, custom_biomarker ~26% mancante. Apri la tab "Qualità" della variabile per i dettagli.`);
  if (q.includes('analisi') || q.includes('analiz') || q.includes('relazion') || q.includes('connession'))
    return pick(`L'analisi collega i file tramite SUBJID (DEMOG→VS/LB/INCL) e le immagini via IMGREF. Genera distribuzioni e qualità per ogni variabile. Se cambi i file sorgente l'analisi va rigenerata.`);
  if (q.includes('conversion') || q.includes('cdisc') || q.includes('omop') || q.includes('fhir') || q.includes('transform'))
    return pick(`La conversione (prossima fase) ti farà scegliere formato origine e target e creerà i transformer N:N tra tabelle sorgente e di destinazione. Esempi: DEMOG→DM+person, INCL→IE.`);
  if (q.includes('come') || q.includes('cosa') || q.includes('aiut') || q.includes('how') || q.includes('?'))
    return pick(`Posso spiegarti questa sezione (${scope}) e cosa conviene fare adesso. Prova a chiedermi delle variabili, della qualità dei dati, dei collegamenti tra file o dei passi successivi.`);
  return pick(`Annotato. Riguardo a "${scope}": posso aiutarti a capire i dati, segnalare anomalie e suggerire i prossimi passi. Cosa vuoi approfondire?`);
}

export function AiChat({
  scope, hint, suggestions = [], onClose,
}: {
  scope: string;
  hint?: string;
  suggestions?: string[];
  onClose?: () => void;
}) {
  const [msgs, setMsgs] = useState<ChatMsg[]>([
    { id: nextId(), role: 'assistant', text: `Ciao! Sono l'assistente AI per ${scope}.${hint ? ' ' + hint : ''} Come posso aiutarti?` },
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [msgs, typing]);

  const send = async (text: string) => {
    const t = text.trim();
    if (!t || typing) return;
    const userMsg: ChatMsg = { id: nextId(), role: 'user', text: t };
    const history = [...msgs, userMsg].map((m) => ({ role: m.role, text: m.text }));
    setMsgs((m) => [...m, userMsg]);
    setInput('');
    setTyping(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ messages: history, scope }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const reply = data && typeof data.reply === 'string' && data.reply.trim()
        ? data.reply
        : fallbackReply(t, scope);
      setMsgs((m) => [...m, { id: nextId(), role: 'assistant', text: reply }]);
    } catch {
      // backend non disponibile (es. dev locale senza serverless) → risposta simulata
      setMsgs((m) => [...m, { id: nextId(), role: 'assistant', text: fallbackReply(t, scope) }]);
    } finally {
      setTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="h-11 shrink-0 flex items-center gap-2 px-3 border-b border-zinc-200">
        <Sparkles className="w-4 h-4 text-violet-600" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-zinc-800 leading-tight">Chat AI</p>
          <p className="text-[10px] text-zinc-400 truncate">{scope}</p>
        </div>
        {onClose && (
          <button onClick={onClose} className="p-1 text-zinc-400 hover:text-zinc-700 rounded" aria-label="Chiudi chat">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-auto p-3 space-y-3">
        {msgs.map((m) => (
          <div key={m.id} className={`flex gap-2 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-6 h-6 rounded-full shrink-0 flex items-center justify-center ${m.role === 'user' ? 'bg-blue-600' : 'bg-violet-100'}`}>
              {m.role === 'user' ? <User className="w-3.5 h-3.5 text-white" /> : <Sparkles className="w-3.5 h-3.5 text-violet-600" />}
            </div>
            <div className={`max-w-[80%] text-xs leading-relaxed px-3 py-2 rounded-2xl ${
              m.role === 'user' ? 'bg-blue-600 text-white rounded-tr-sm' : 'bg-zinc-100 text-zinc-700 rounded-tl-sm'
            }`}>
              {m.text}
            </div>
          </div>
        ))}
        {typing && (
          <div className="flex gap-2">
            <div className="w-6 h-6 rounded-full bg-violet-100 flex items-center justify-center shrink-0">
              <Sparkles className="w-3.5 h-3.5 text-violet-600" />
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

      {suggestions.length > 0 && msgs.length <= 1 && (
        <div className="px-3 pb-2 flex flex-wrap gap-1.5">
          {suggestions.map((s) => (
            <button
              key={s}
              onClick={() => send(s)}
              className="text-[11px] px-2 py-1 rounded-full border border-zinc-200 text-zinc-600 hover:bg-zinc-50"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      <div className="p-2.5 border-t border-zinc-200 flex items-center gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') send(input); }}
          placeholder="Scrivi un messaggio…"
          className="flex-1 px-3 py-2 text-xs bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:ring-2 focus:ring-violet-500/40"
        />
        <button
          onClick={() => send(input)}
          disabled={!input.trim() || typing}
          className="p-2 bg-violet-600 hover:bg-violet-700 disabled:opacity-40 text-white rounded-xl"
          aria-label="Invia"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
