// Serverless function (Vercel) — chat AI per il prototipo DataHealth.
// La API key resta lato server (variabile d'ambiente ANTHROPIC_API_KEY su Vercel),
// non viene mai esposta al client. Modello a basso costo: Claude Haiku 4.5.
import Anthropic from '@anthropic-ai/sdk';

const SYSTEM = `Sei l'assistente AI dentro "DataHealth", un PROTOTIPO dimostrativo (mock) di una
piattaforma per dati clinici. Questa è una chat di TEST: i dati sono finti e non serve alcun disclaimer.
Rispondi in italiano, in modo MOLTO BREVE (1-3 frasi), con risposte plausibili, concrete e pertinenti
al contesto fornito. Niente preamboli, niente elenchi lunghi: vai dritto al punto come un assistente
esperto di dati clinici, standard (CDISC/OMOP/FHIR), qualità dei dati e conversioni.`;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'method_not_allowed' });
    return;
  }
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: 'missing_api_key' });
    return;
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const scope = typeof body.scope === 'string' ? body.scope : '';
    const incoming = Array.isArray(body.messages) ? body.messages : [];

    // Normalizza in messaggi Anthropic e tieni solo le ultime battute
    let messages = incoming
      .map((m) => ({
        role: m.role === 'user' ? 'user' : 'assistant',
        content: String(m.text ?? m.content ?? '').slice(0, 2000),
      }))
      .filter((m) => m.content.trim().length > 0)
      .slice(-12);

    // La prima battuta deve essere dell'utente
    while (messages.length && messages[0].role !== 'user') messages.shift();
    if (messages.length === 0) messages = [{ role: 'user', content: 'Ciao' }];

    const client = new Anthropic({ apiKey });
    const resp = await client.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 256,
      system: scope ? `${SYSTEM}\n\nContesto / sezione corrente: ${scope}` : SYSTEM,
      messages,
    });

    const reply = resp.content
      .filter((b) => b.type === 'text')
      .map((b) => b.text)
      .join('')
      .trim();

    res.status(200).json({ reply: reply || '…' });
  } catch (err) {
    res.status(500).json({ error: 'llm_error', detail: String(err?.message || err) });
  }
}
