import React, { useMemo, useState } from 'react';
import {
  Bell, Upload, AlertTriangle, Share2, Eye, ShieldAlert, BarChart3, ChevronRight,
} from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet';

type NotifType = 'ingestion' | 'validation' | 'share' | 'access' | 'security' | 'query';

interface Notif {
  id: string;
  type: NotifType;
  title: string;
  body: string;
  time: string;
  read: boolean;
  to?: { tab: string; sub?: string };
}

const TYPE_META: Record<NotifType, { icon: React.ComponentType<{ className?: string }>; chip: string; accent: string; label: string }> = {
  ingestion: { icon: Upload, chip: 'bg-blue-100 text-blue-600', accent: 'bg-blue-500', label: 'Ingestion' },
  validation: { icon: AlertTriangle, chip: 'bg-amber-100 text-amber-600', accent: 'bg-amber-500', label: 'Validazione' },
  share: { icon: Share2, chip: 'bg-emerald-100 text-emerald-600', accent: 'bg-emerald-500', label: 'Condivisione' },
  access: { icon: Eye, chip: 'bg-violet-100 text-violet-600', accent: 'bg-violet-500', label: 'Accesso' },
  security: { icon: ShieldAlert, chip: 'bg-rose-100 text-rose-600', accent: 'bg-rose-500', label: 'Sicurezza' },
  query: { icon: BarChart3, chip: 'bg-indigo-100 text-indigo-600', accent: 'bg-indigo-500', label: 'Query' },
};

const FILTERS: { key: 'all' | NotifType; label: string }[] = [
  { key: 'all', label: 'Tutte' },
  { key: 'ingestion', label: 'Ingestion' },
  { key: 'validation', label: 'Validazione' },
  { key: 'share', label: 'Condivisione' },
  { key: 'access', label: 'Accesso' },
  { key: 'security', label: 'Sicurezza' },
];

const MOCK: Notif[] = [
  { id: '1', type: 'ingestion', title: 'Ingestion completata', body: '1.240 record caricati in CARDIO-2024 dal batch #4821.', time: '5 min fa', read: false, to: { tab: 'ingestor', sub: 'Collections' } },
  { id: '2', type: 'validation', title: 'Validazione fallita', body: 'Biopsy Results Import: 108 record con tumor_grade non valido.', time: '23 min fa', read: false, to: { tab: 'ingestor', sub: 'Collections' } },
  { id: '3', type: 'share', title: 'Nuova condivisione', body: 'ONCO biomarkers extract condiviso con Pharma Partner X.', time: '1 ora fa', read: false, to: { tab: 'audit', sub: 'Sharing Summary' } },
  { id: '4', type: 'access', title: 'Accesso a dati condivisi', body: 'Dr. M. Rossi ha visualizzato CARDIO-2024 · Virtual Collection.', time: '2 ore fa', read: true, to: { tab: 'audit', sub: 'Access Logs' } },
  { id: '5', type: 'security', title: 'Avviso sicurezza', body: 'Accesso da un indirizzo IP non riconosciuto.', time: 'ieri', read: true, to: { tab: 'audit', sub: 'Security Alerts' } },
  { id: '6', type: 'query', title: 'Query salvata', body: '«Pazienti over 60 con troponina alta» aggiunta alle Saved Queries.', time: 'ieri', read: true, to: { tab: 'querytool', sub: 'Saved Queries' } },
  { id: '7', type: 'ingestion', title: 'Nuovi file caricati', body: '320 file DICOM aggiunti a ONCO-TRIAL-A imaging.', time: '2 giorni fa', read: true },
];

export function NotificationsDrawer({ onNavigate }: { onNavigate?: (tab: string, sub?: string) => void }) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Notif[]>(MOCK);
  const [filter, setFilter] = useState<'all' | NotifType>('all');

  const unread = items.filter((n) => !n.read).length;
  const filtered = useMemo(() => (filter === 'all' ? items : items.filter((n) => n.type === filter)), [items, filter]);

  const markAll = () => setItems((p) => p.map((n) => ({ ...n, read: true })));
  const activate = (n: Notif) => {
    setItems((p) => p.map((x) => (x.id === n.id ? { ...x, read: true } : x)));
    if (n.to && onNavigate) { onNavigate(n.to.tab, n.to.sub); setOpen(false); }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          className="group/bell relative p-2.5 text-zinc-500 hover:text-zinc-800 hover:bg-zinc-500/10 rounded-full transition-colors"
          aria-label={unread > 0 ? `Notifiche · ${unread} non lette` : 'Notifiche'}
        >
          <Bell className="w-[18px] h-[18px] origin-top transition-transform duration-200 group-hover/bell:-rotate-[14deg]" />
          {unread > 0 && (
            <span className="absolute top-1 right-1 size-2.5 rounded-full bg-rose-500 ring-2 ring-white" />
          )}
        </button>
      </SheetTrigger>

      <SheetContent side="right" className="glass-strong w-full sm:max-w-md flex flex-col gap-0 p-0">
        <SheetHeader className="px-5 pt-4 pb-2 pr-12">
          <div className="flex items-center gap-2">
            <SheetTitle className="text-base font-semibold text-zinc-900">Notifiche</SheetTitle>
            {unread > 0 && (
              <span className="h-5 rounded-full bg-rose-100 text-rose-600 px-2 text-[11px] font-medium tabular-nums flex items-center">
                {unread} non lette
              </span>
            )}
          </div>
        </SheetHeader>

        <div className="flex items-center gap-2 px-5 py-2.5 border-b border-zinc-200/70 overflow-x-auto no-scrollbar">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`text-[11px] px-2.5 py-1 rounded-full border whitespace-nowrap transition-colors ${filter === f.key ? 'bg-zinc-900 text-white border-zinc-900' : 'border-zinc-200 text-zinc-600 hover:bg-zinc-100/60'}`}
            >
              {f.label}
            </button>
          ))}
          {unread > 0 && (
            <button onClick={markAll} className="ml-auto shrink-0 text-[11px] font-medium text-blue-600 hover:underline">
              Segna tutte come lette
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="py-16 flex flex-col items-center text-zinc-400">
              <Bell className="w-7 h-7 mb-2 opacity-40" />
              <p className="text-sm">Nessuna notifica</p>
            </div>
          ) : (
            <ul className="divide-y divide-zinc-200/60">
              {filtered.map((n) => {
                const meta = TYPE_META[n.type];
                return (
                  <li key={n.id}>
                    <button
                      onClick={() => activate(n)}
                      className={`group/notif relative w-full text-left flex items-start gap-3 px-5 py-3.5 transition-colors hover:bg-zinc-500/[0.06] ${!n.read ? 'bg-blue-500/[0.05]' : ''}`}
                    >
                      <span className={`absolute inset-y-2.5 left-0 w-[3px] rounded-full ${meta.accent} ${n.read ? 'opacity-0 group-hover/notif:opacity-60' : 'opacity-100'}`} />
                      <span className={`mt-0.5 w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${meta.chip}`}>
                        <meta.icon className="w-4 h-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-baseline justify-between gap-2">
                          <p className={`text-sm truncate ${n.read ? 'text-zinc-800' : 'font-semibold text-zinc-900'}`}>{n.title}</p>
                          <span className="text-[10.5px] text-zinc-400 shrink-0 tabular-nums">{n.time}</span>
                        </div>
                        <p className="text-xs text-zinc-500 mt-0.5 line-clamp-2">{n.body}</p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${meta.chip}`}>{meta.label}</span>
                          {n.to && (
                            <span className="ml-auto text-[10.5px] text-zinc-400 inline-flex items-center gap-0.5 opacity-0 group-hover/notif:opacity-100 transition-opacity">
                              Apri <ChevronRight className="w-3 h-3" />
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
