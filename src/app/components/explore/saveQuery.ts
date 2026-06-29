import type { QueryArtifact } from './types';
import type { UserSavedQuery } from '../savedQueries/types';
import { addSaved } from '../savedQueries/savedStore';
import { getCollection } from './mock/mockCatalog';
import { genId } from './ids';

const ME = { name: 'You', email: 'admin@datalake.io', avatar: 'Y' };

// Mappa una query-artifact in una UserSavedQuery e la persiste nello store.
export function saveQueryArtifact(
  artifact: QueryArtifact,
  opts?: { name?: string; visibility?: 'private' | 'team' | 'public' },
): UserSavedQuery {
  const q = artifact.query;
  // SavedQueries.DB_COLORS è keyed sui nomi MAIUSCOLI (es. 'CARDIO-2024')
  const databases = q.collections.map((c) => getCollection(c)?.name ?? c.toUpperCase());
  const tables = Array.from(new Set(q.results.map((r) => r.name)));
  const now = new Date().toISOString();
  const saved: UserSavedQuery = {
    id: `USQ-${genId('q').slice(2)}`,
    name: opts?.name ?? artifact.title ?? q.title,
    description: q.prompt.slice(0, 140),
    prompt: q.prompt,
    sql: q.sql,
    databases,
    tables,
    lastRun: now,
    createdAt: now,
    author: { ...ME },
    visibility: opts?.visibility ?? 'private',
    permissions: [{ type: 'owner', users: [{ ...ME }] }],
    starred: false,
    runCount: 1,
  };
  return addSaved(saved);
}
