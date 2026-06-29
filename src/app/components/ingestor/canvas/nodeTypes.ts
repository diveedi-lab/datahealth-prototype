import { TabularFileNode } from './nodes/TabularFileNode';
import { FileCollectionNode } from './nodes/FileCollectionNode';
import { ContextNode } from './nodes/ContextNode';

// Oggetto STABILE definito fuori dai componenti (evita re-render in React Flow)
export const nodeTypes = {
  tabularFile: TabularFileNode,
  fileCollection: FileCollectionNode,
  contextNode: ContextNode,
};
