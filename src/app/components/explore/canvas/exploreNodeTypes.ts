import { CollectionNode } from './nodes/CollectionNode';
import { QueryNode } from './nodes/QueryNode';
import { ChartNode } from './nodes/ChartNode';

// Oggetto STABILE fuori dai componenti (evita re-render in React Flow)
export const exploreNodeTypes = {
  collectionNode: CollectionNode,
  queryNode: QueryNode,
  chartNode: ChartNode,
};
