import { TableNode } from './TableNode';

// Oggetto STABILE fuori dai componenti (evita re-render in React Flow)
export const structureNodeTypes = { tableNode: TableNode };
