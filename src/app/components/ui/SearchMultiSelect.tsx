import React, { useState, useRef, useEffect } from 'react';
import { Search, Check, ChevronDown, X } from 'lucide-react';

interface Option {
  id: string;
  name: string;
  color?: string;
}

export function SearchMultiSelect({
  options,
  selected,
  onChange,
  label,
  placeholder = 'Search...',
}: {
  options: Option[];
  selected: string[];
  onChange: (ids: string[]) => void;
  label: string;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const filtered = options.filter(o => !search || o.name.toLowerCase().includes(search.toLowerCase()));
  const allSelected = selected.length === options.length;
  const noneSelected = selected.length === 0;

  const toggle = (id: string) => {
    onChange(selected.includes(id) ? selected.filter(x => x !== id) : [...selected, id]);
  };

  const displayText = allSelected
    ? `All ${label}`
    : noneSelected
    ? `No ${label}`
    : selected.length === 1
    ? options.find(o => o.id === selected[0])?.name || '1 selected'
    : `${selected.length} ${label}`;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => { setOpen(!open); setSearch(''); }}
        className="flex items-center gap-2 bg-white border border-zinc-200 rounded-xl px-3 py-2 text-sm text-zinc-700 hover:border-zinc-300 transition-colors min-w-[160px]"
      >
        <span className="flex-1 text-left truncate">{displayText}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-zinc-400 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute left-0 top-full mt-1 w-64 bg-white border border-zinc-200 rounded-xl shadow-xl z-50 overflow-hidden">
          <div className="p-2 border-b border-zinc-100">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder={placeholder}
                className="w-full pl-8 pr-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500/50 text-zinc-700"
                autoFocus
              />
            </div>
          </div>
          <div className="p-1 border-b border-zinc-100 flex gap-1">
            <button
              onClick={() => onChange(options.map(o => o.id))}
              className="flex-1 text-xs py-1.5 rounded-md bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
            >
              All
            </button>
            <button
              onClick={() => onChange([])}
              className="flex-1 text-xs py-1.5 rounded-md bg-zinc-50 text-zinc-500 hover:bg-zinc-100 transition-colors"
            >
              Clear
            </button>
          </div>
          <div className="max-h-48 overflow-y-auto p-1">
            {filtered.map(o => {
              const isChecked = selected.includes(o.id);
              return (
                <button
                  key={o.id}
                  onClick={() => toggle(o.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors text-left ${
                    isChecked
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-zinc-700 hover:bg-zinc-50'
                  }`}
                >
                  {o.color && <span className={`w-2 h-2 rounded-full shrink-0 ${o.color}`} />}
                  <span className="flex-1 truncate">{o.name}</span>
                  {isChecked && <Check className="w-3.5 h-3.5 text-blue-500 shrink-0" />}
                </button>
              );
            })}
            {filtered.length === 0 && <p className="px-3 py-2 text-xs text-zinc-400">No results</p>}
          </div>
        </div>
      )}
    </div>
  );
}
