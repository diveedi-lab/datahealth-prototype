// Serverless (Vercel) — assist "Scrivi con AI" del Query Tool: NL → SQL.
// Claude Haiku 4.5 genera SOLO il testo SQL (i risultati restano mock lato client).
// API key lato server (env ANTHROPIC_API_KEY).
import Anthropic from '@anthropic-ai/sdk';

const SYSTEM = `Sei un generatore di SQL per un PROTOTIPO dimostrativo (mock) di piattaforma per dati clinici.
Dato un prompt in linguaggio naturale e un CATALOGO di collection/tabelle/colonne, restituisci SOLO una query
SQL plausibile e leggibile (multi-riga), SENZA spiegazioni e SENZA markdown. Usa esclusivamente nomi di
tabella/colonna presenti nel catalogo. Niente commenti superflui, vai dritto alla SELECT.`;

function stripFences(s) {
  return String(s || '')
    .replace(/^```[a-zA-Z]*\s*/m, '')
    .replace(/```\s*$/m, '')
    .trim();
}

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
    const prompt = String(body.prompt ?? '').slice(0, 1500);
    const catalog = body.catalog ? JSON.stringify(body.catalog).slice(0, 4500) : '{}';
    if (!prompt.trim()) { res.status(200).json({ sql: '' }); return; }

    const client = new Anthropic({ apiKey });
    const resp = await client.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 400,
      system: SYSTEM,
      messages: [
        { role: 'user', content: `CATALOGO: ${catalog}\n\nRICHIESTA: ${prompt}\n\nRestituisci solo l'SQL.` },
      ],
    });
    const sql = stripFences(resp.content.filter((b) => b.type === 'text').map((b) => b.text).join(''));
    res.status(200).json({ sql });
  } catch (err) {
    res.status(500).json({ error: 'llm_error', detail: String(err?.message || err) });
  }
}
