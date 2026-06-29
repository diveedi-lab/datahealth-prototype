// Tipo condiviso tra la sezione Saved Queries e il salvataggio dal workspace Explore.
export interface SavedQueryUser {
  name: string;
  email: string;
  avatar: string;
}

export interface SavedQueryPermission {
  type: 'owner' | 'editor' | 'viewer';
  users: SavedQueryUser[];
}

export interface SavedQuery {
  id: string;
  name: string;
  description: string;
  prompt: string;
  sql: string;
  databases: string[];
  tables: string[];
  lastRun: string;
  createdAt: string;
  author: SavedQueryUser;
  visibility: 'private' | 'team' | 'public';
  permissions: SavedQueryPermission[];
  starred: boolean;
  runCount: number;
}

// Le query salvate dall'utente hanno la stessa forma.
export type UserSavedQuery = SavedQuery;
