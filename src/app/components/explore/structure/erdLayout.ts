import { MarkerType, type Node, type Edge } from '@xyflow/react';
import type { ExploreCollection, ExploreQuery, ExploreTable } from '../types';
import { getCollection } from '../mock/mockCatalog';

const FK_EDGE = {
  markerEnd: { type: MarkerType.ArrowClosed, color: '#818cf8' },
  style: { stroke: '#818cf8', strokeWidth: 1.5 },
  labelStyle: { fontSize: 10, fill: '#71717a' },
  labelBgStyle: { fill: '#ffffff', fillOpacity: 0.8 },
};

// ─── ERD di una collection: tabelle + relazioni FK ───
export function buildCollectionErd(collection: ExploreCollection): { nodes: Node[]; edges: Edge[] } {
  const tables = collection.tables;
  const cols = Math.ceil(Math.sqrt(tables.length || 1));
  const nodes: Node[] = tables.map((t, i) => ({
    id: t.name,
    type: 'tableNode',
    position: { x: (i % cols) * 320 + 40, y: Math.floor(i / cols) * 360 + 40 },
    data: { table: t },
  }));
  const present = new Set(tables.map((t) => t.name));
  const edges: Edge[] = [];
  for (const t of tables) {
    for (const c of t.columns) {
      if (c.fk && present.has(c.fk.table)) {
        edges.push({
          id: `e-${t.name}-${c.name}-${c.fk.table}`,
          source: t.name,
          target: c.fk.table,
          label: `${c.name} → ${c.fk.column}`,
          ...FK_EDGE,
        });
      }
    }
  }
  return { nodes, edges };
}

// ─── Lineage di una query: tabelle/colonne usate → risultato ───
export function buildQueryLineage(query: ExploreQuery): {
  nodes: Node[]; edges: Edge[]; resultSchema: { name: string; columns: string[] }[];
} {
  const collection = getCollection(query.collections[0]);
  const resultCols = new Set(query.results.flatMap((r) => r.columns));

  // tabelle sorgente con almeno una colonna usata (fallback: tutte)
  let sourceTables: { table: ExploreTable; used: string[] }[] = [];
  if (collection) {
    sourceTables = collection.tables
      .map((t) => ({ table: t, used: t.columns.filter((c) => resultCols.has(c.name)).map((c) => c.name) }))
      .filter((x) => x.used.length > 0);
    if (sourceTables.length === 0) sourceTables = collection.tables.slice(0, 3).map((t) => ({ table: t, used: [] }));
  }

  const nodes: Node[] = sourceTables.map((x, i) => ({
    id: x.table.name,
    type: 'tableNode',
    position: { x: 40, y: i * 320 + 40 },
    data: { table: x.table, highlightColumns: x.used.length ? x.used : undefined },
  }));

  const resultSchema = query.results.map((r) => ({ name: r.name, columns: r.columns }));
  const resultNodes: Node[] = query.results.map((r, i) => ({
    id: `result-${i}`,
    type: 'tableNode',
    position: { x: 560, y: i * 320 + 40 },
    data: {
      isResult: true,
      table: {
        name: r.name, label: r.name, color: '#10b981', rowCount: r.totalRows,
        columns: r.columns.map((name) => ({ name, type: 'string' as const, description: '' })),
      },
    },
  }));

  const edges: Edge[] = [];
  for (const s of sourceTables) {
    for (let i = 0; i < query.results.length; i++) {
      edges.push({
        id: `e-${s.table.name}-result-${i}`,
        source: s.table.name,
        target: `result-${i}`,
        animated: true,
        ...FK_EDGE,
      });
    }
  }

  return { nodes: [...nodes, ...resultNodes], edges, resultSchema };
}
