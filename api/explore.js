// Serverless function (Vercel) — driver AI del workspace "Explore" di DataHealth.
// Claude (Haiku 4.5) interpreta i messaggi e ritorna AZIONI strutturate via tool use.
// La API key resta lato server (env ANTHROPIC_API_KEY). I dati restano mock lato client.
import Anthropic from '@anthropic-ai/sdk';

const CHART_TYPES = ['bar', 'line', 'pie', 'histogram', 'kpi', 'grouped', 'stacked', 'multiline', 'scatter', 'crosstab'];
const ANALYSIS_TYPES = ['summary_stats', 'missingness', 'correlation', 'crosstab', 'outliers'];

const SOURCE_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    kind: { type: 'string', enum: ['query', 'collection'] },
    queryId: { type: 'string' },
    collectionId: { type: 'string' },
  },
  required: ['kind'],
};

const TOOLS = [
  {
    name: 'set_scope',
    description: 'Imposta lo scope di lavoro a un insieme di collection (sostituisce lo scope attuale). Usa SOLO gli id elencati nel catalogo.',
    input_schema: {
      type: 'object', additionalProperties: false,
      properties: { collections: { type: 'array', items: { type: 'string' } } },
      required: ['collections'],
    },
  },
  {
    name: 'add_to_scope',
    description: 'Aggiunge collection allo scope corrente senza rimuovere le altre.',
    input_schema: {
      type: 'object', additionalProperties: false,
      properties: { collections: { type: 'array', items: { type: 'string' } } },
      required: ['collections'],
    },
  },
  {
    name: 'remove_from_scope',
    description: 'Rimuove collection dallo scope corrente.',
    input_schema: {
      type: 'object', additionalProperties: false,
      properties: { collections: { type: 'array', items: { type: 'string' } } },
      required: ['collections'],
    },
  },
  {
    name: 'create_query',
    description: 'Crea una query in linguaggio naturale sullo scope (genera SQL e risultati mock). Usala quando l’utente vuole interrogare/filtrare/elencare dati.',
    input_schema: {
      type: 'object', additionalProperties: false,
      properties: {
        title: { type: 'string', description: 'Titolo breve della query' },
        prompt: { type: 'string', description: 'La richiesta in linguaggio naturale' },
        collections: { type: 'array', items: { type: 'string' }, description: 'Collection coinvolte (id dal catalogo); se omesse usa lo scope' },
        variables: { type: 'array', items: { type: 'string' } },
      },
      required: ['title', 'prompt'],
    },
  },
  {
    name: 'create_chart',
    description: 'Crea un grafico. Monovariato (bar/line/pie/histogram/kpi) per "distribuzione dell’età". Per confronti tra DUE variabili usa groupBy (serie categoriale: grouped/stacked/multiline/crosstab, es. "età per sito") oppure secondVariable (asse numerico per scatter/correlazione, es. "correlazione età e valore lab"). Usa SOLO le coppie elencate in crossPairs del catalogo.',
    input_schema: {
      type: 'object', additionalProperties: false,
      properties: {
        title: { type: 'string' },
        chartType: { type: 'string', enum: CHART_TYPES },
        variable: { type: 'string', description: 'Nome variabile dal catalogo (es. age, gender, severity, site_id, lab_value)' },
        groupBy: { type: 'string', description: 'Seconda variabile categoriale per grouped/stacked/multiline/crosstab' },
        secondVariable: { type: 'string', description: 'Seconda variabile numerica per scatter/correlazione' },
        source: SOURCE_SCHEMA,
      },
      required: ['chartType', 'variable'],
    },
  },
  {
    name: 'create_analysis',
    description: 'Crea un’analisi su una o più variabili (statistiche, valori mancanti, ecc.).',
    input_schema: {
      type: 'object', additionalProperties: false,
      properties: {
        title: { type: 'string' },
        analysis: { type: 'string', enum: ANALYSIS_TYPES },
        variables: { type: 'array', items: { type: 'string' }, minItems: 1 },
        source: SOURCE_SCHEMA,
      },
      required: ['analysis', 'variables'],
    },
  },
  {
    name: 'save_query',
    description: 'Salva una query come artefatto persistente nella sezione Saved Queries. Usa quando l’utente dice "salva"/"save". Se non specifica quale, salva l’ultima query creata (ometti targetId).',
    input_schema: {
      type: 'object', additionalProperties: false,
      properties: {
        targetId: { type: 'string' },
        name: { type: 'string' },
        visibility: { type: 'string', enum: ['private', 'team', 'public'] },
      },
      required: [],
    },
  },
  {
    name: 'answer',
    description: 'Rispondi a una domanda o chiedi un chiarimento, senza creare artefatti.',
    input_schema: {
      type: 'object', additionalProperties: false,
      properties: { text: { type: 'string' } },
      required: ['text'],
    },
  },
  {
    name: 'explain',
    description: 'Spiega brevemente un elemento del workspace.',
    input_schema: {
      type: 'object', additionalProperties: false,
      properties: { text: { type: 'string' }, targetId: { type: 'string' } },
      required: ['text'],
    },
  },
];

function buildSystem(scope, catalog) {
  const scopeNames = scope?.names?.length ? scope.names.join(', ') : '(vuoto)';
  const cat = catalog
    ? JSON.stringify(catalog).slice(0, 6000)
    : '{}';
  return `Sei il DRIVER AI del workspace "Explore" di DataHealth, un PROTOTIPO dimostrativo (dati mock, nessun disclaimer necessario).
Interpreti i messaggi dell'utente e AGISCI sempre tramite i tool forniti (non rispondere mai solo a parole se c'è un'azione possibile).

Regole:
- Per impostare/cambiare le collection di lavoro usa set_scope / add_to_scope / remove_from_scope.
- Per interrogare/filtrare/elencare dati usa create_query (genera SQL+risultati mock).
- Per "distribuzione/conteggio/grafico di <variabile>" usa create_chart monovariato. Per confronti tra DUE variabili
  usa create_chart con groupBy (grouped/stacked/multiline/crosstab) o secondVariable (scatter/correlazione): scegli
  le variabili SOLO tra le coppie elencate in crossPairs del catalogo. Per analisi (mancanti, statistiche) usa create_analysis.
- Per "salva/save (la query)" usa save_query (ometti targetId per l'ultima query creata).
- Puoi combinare più tool in una sola risposta (es. set_scope + create_query, oppure create_query + save_query).
- Usa SOLO gli id di collection e i nomi di variabile presenti nel CATALOGO. Non inventare id.
- Per domande generiche o chiarimenti usa answer. Tieni i testi MOLTO brevi (1-2 frasi), in italiano.

Scope corrente: ${scopeNames}.
CATALOGO (usa solo questi id/nomi): ${cat}`;
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
    const scope = body.scope || {};
    const catalog = body.catalog || null;
    const incoming = Array.isArray(body.messages) ? body.messages : [];

    let messages = incoming
      .map((m) => ({
        role: m.role === 'user' ? 'user' : 'assistant',
        content: String(m.text ?? m.content ?? '').slice(0, 2000),
      }))
      .filter((m) => m.content.trim().length > 0)
      .slice(-12);

    while (messages.length && messages[0].role !== 'user') messages.shift();
    if (messages.length === 0) messages = [{ role: 'user', content: 'Ciao' }];

    const client = new Anthropic({ apiKey });
    const resp = await client.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 700,
      system: buildSystem(scope, catalog),
      tools: TOOLS,
      tool_choice: { type: 'any' },
      messages,
    });

    const actions = resp.content
      .filter((b) => b.type === 'tool_use')
      .map((b) => ({ type: b.name, ...(b.input || {}) }));

    const message = resp.content
      .filter((b) => b.type === 'text')
      .map((b) => b.text)
      .join('')
      .trim();

    res.status(200).json({ message, actions });
  } catch (err) {
    res.status(500).json({ error: 'llm_error', detail: String(err?.message || err) });
  }
}
