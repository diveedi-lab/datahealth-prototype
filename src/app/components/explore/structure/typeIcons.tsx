import React from 'react';
import { Key, Type, Hash, Calendar, ToggleLeft, List as ListIcon } from 'lucide-react';

// Mappa icona per tipo colonna/variabile, condivisa tra ERD e pannelli.
export const TYPE_ICON: Record<string, React.ReactNode> = {
  id: <Key className="w-3.5 h-3.5 text-amber-500" />,
  string: <Type className="w-3.5 h-3.5 text-blue-500" />,
  integer: <Hash className="w-3.5 h-3.5 text-emerald-500" />,
  float: <Hash className="w-3.5 h-3.5 text-teal-500" />,
  date: <Calendar className="w-3.5 h-3.5 text-violet-500" />,
  boolean: <ToggleLeft className="w-3.5 h-3.5 text-pink-500" />,
  categorical: <ListIcon className="w-3.5 h-3.5 text-indigo-500" />,
};
