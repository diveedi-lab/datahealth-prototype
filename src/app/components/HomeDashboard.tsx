import React from 'react';
import {
  Database, Compass, Share2, ArrowRight, Upload, CheckCircle2, AlertTriangle,
  ShieldAlert, Eye, Download, Clock, Users, HardDrive, BarChart3, Activity,
  ChevronRight, Search, Link2,
} from 'lucide-react';

import { listShares } from './sharing/sharesStore';

interface DashboardProps {
  onCreateCollection: () => void;
  onExplore: () => void;
  onOpenCollection: (id: string) => void;
  onNavigate: (tab: string, sub?: string) => void;
  onShare?: () => void;
}

const DB_DOT: Record<string, string> = {
  'CARDIO-2024': 'bg-rose-500', 'ONCO-TRIAL-A': 'bg-amber-500',
  'NEURO-PHASE3': 'bg-violet-500', 'RESP-PILOT': 'bg-emerald-500', 'DERM-COHORT-B': 'bg-blue-500',
};

// ─── Mock operativo ───
const KPIS = [
  { label: 'Collezioni', value: '12', sub: '3 in lavorazione', icon: Database, tone: 'text-blue-600 bg-blue-50' },
  { label: 'Volume dati', value: '1.24 TB', sub: '+82 GB questa settimana', icon: HardDrive, tone: 'text-violet-600 bg-violet-50' },
  { label: 'Dataset condivisi', value: '8', sub: '2 esterni', icon: Share2, tone: 'text-emerald-600 bg-emerald-50' },
  { label: 'Query (7 gg)', value: '47', sub: '12 salvate', icon: BarChart3, tone: 'text-amber-600 bg-amber-50' },
];

const INGESTING = [
  { id: 'DS-0012', name: 'CARDIO Q1 2026 Lab Results', db: 'CARDIO-2024', status: 'in-progress', done: 1847, total: 2400, by: 'Dr. M. Rossi' },
  { id: 'DS-0011', name: 'ONCO Imaging Archive', db: 'ONCO-TRIAL-A', status: 'in-progress', done: 320, total: 850, by: 'A. Bianchi' },
  { id: 'DS-0010', name: 'NEURO Demographics Update', db: 'NEURO-PHASE3', status: 'draft', done: 0, total: 18, by: 'You' },
  { id: 'DS-0002', name: 'Baseline ECG Data', db: 'CARDIO-2024', status: 'draft', done: 0, total: 0, by: 'Dr. P. Marino' },
];

const SHARED = [
  { name: 'CARDIO-2024 · Virtual Collection', with: 'Università di Milano', kind: 'team', detail: '12 utenti · scade tra 28 gg', icon: Users },
  { name: 'ONCO biomarkers extract', with: 'Pharma Partner X', kind: 'external', detail: 'sola lettura · scade tra 6 gg', icon: Link2 },
  { name: 'NEURO assessment scores', with: 'Team Neurologia', kind: 'internal', detail: '5 utenti', icon: Users },
  { name: 'Spirometry dataset (RESP)', with: 'Link pubblico', kind: 'public', detail: 'chiunque con il link', icon: Link2 },
];

const KIND_BADGE: Record<string, string> = {
  team: 'bg-blue-50 text-blue-600', external: 'bg-amber-50 text-amber-600',
  internal: 'bg-zinc-100 text-zinc-600', public: 'bg-emerald-50 text-emerald-600',
};

const ACCESS = [
  { who: 'Dr. M. Rossi', action: 'ha visualizzato', what: 'CARDIO-2024 · Virtual Collection', when: '12 min fa', icon: Eye, tone: 'text-blue-500' },
  { who: 'Pharma Partner X', action: 'ha scaricato', what: 'ONCO biomarkers extract', when: '1 ora fa', icon: Download, tone: 'text-amber-500' },
  { who: 'Dr. L. Bianchi', action: 'ha interrogato', what: 'NEURO assessment scores', when: '3 ore fa', icon: Search, tone: 'text-violet-500' },
  { who: 'Link pubblico', action: 'accesso a', what: 'Spirometry dataset', when: 'ieri', icon: Link2, tone: 'text-emerald-500' },
];

const ACTIVITY = [
  { icon: CheckCircle2, tone: 'text-emerald-500', text: 'Ingestion completata · March Adverse Events (CARDIO-2024)', when: '2 ore fa' },
  { icon: AlertTriangle, tone: 'text-amber-500', text: 'Validazione fallita · Biopsy Results Import (108 record)', when: '5 ore fa' },
  { icon: Share2, tone: 'text-blue-500', text: 'Nuova condivisione · ONCO biomarkers → Pharma Partner X', when: 'ieri' },
  { icon: ShieldAlert, tone: 'text-rose-500', text: 'Avviso sicurezza · accesso da IP non riconosciuto', when: 'ieri' },
  { icon: BarChart3, tone: 'text-violet-500', text: 'Query salvata · «Pazienti over 60 con troponina alta»', when: '2 giorni fa' },
];

// ─── Sottocomponenti ───
function ActionCard({
  title, subtitle, Icon, gradient, onClick,
}: {
  title: string; subtitle: string; Icon: React.ComponentType<{ className?: string }>; gradient: string; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`group relative overflow-hidden rounded-2xl p-5 text-left text-white shadow-sm hover:shadow-lg transition-all ${gradient}`}
    >
      <div className="absolute -right-6 -top-6 w-28 h-28 rounded-full bg-white/10 group-hover:scale-110 transition-transform" />
      <div className="relative">
        <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center mb-8">
          <Icon className="w-6 h-6" />
        </div>
        <div className="flex items-end justify-between">
          <div className="min-w-0">
            <p className="text-base font-semibold leading-tight">{title}</p>
            <p className="text-[13px] text-white/80 mt-0.5">{subtitle}</p>
          </div>
          <ArrowRight className="w-5 h-5 shrink-0 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </button>
  );
}

function Panel({
  title, icon: Icon, action, onAction, children,
}: {
  title: string; icon: React.ComponentType<{ className?: string }>; action?: string; onAction?: () => void; children: React.ReactNode;
}) {
  return (
    <div className="glass-card rounded-2xl flex flex-col">
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-zinc-100">
        <h3 className="text-sm font-semibold text-zinc-800 flex items-center gap-2"><Icon className="w-4 h-4 text-zinc-400" />{title}</h3>
        {action && (
          <button onClick={onAction} className="text-xs font-medium text-blue-600 hover:underline flex items-center gap-1">
            {action} <ChevronRight className="w-3 h-3" />
          </button>
        )}
      </div>
      <div className="p-2.5">{children}</div>
    </div>
  );
}

export function HomeDashboard({ onCreateCollection, onExplore, onOpenCollection, onNavigate, onShare }: DashboardProps) {
  const today = new Date().toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' });
  const shareRows = [
    ...listShares().map((sh) => ({
      name: sh.collectionNames.join(', ') || 'Collezione',
      with: sh.users.map((u) => u.name).join(', ') || '—',
      kind: 'team' as const,
      detail: sh.permissions.join(' · '),
      icon: Users,
    })),
    ...SHARED,
  ];

  return (
    <div className="max-w-7xl mx-auto w-full flex flex-col gap-6 pb-10">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Bentornato 👋</h1>
        <p className="text-sm text-zinc-500 mt-1 capitalize">{today} · ecco cosa sta succedendo nella piattaforma</p>
      </div>

      {/* Azioni prioritarie (flussi principali) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <ActionCard
          title="Crea una collection"
          subtitle="Carica e standardizza nuovi dati"
          Icon={Database}
          gradient="bg-gradient-to-br from-blue-500 to-blue-600"
          onClick={onCreateCollection}
        />
        <ActionCard
          title="Esplora i dati"
          subtitle="Interroga e visualizza in linguaggio naturale"
          Icon={Compass}
          gradient="bg-gradient-to-br from-violet-500 to-violet-600"
          onClick={onExplore}
        />
        <ActionCard
          title="Condividi dati"
          subtitle="Condividi collection con team e partner"
          Icon={Share2}
          gradient="bg-gradient-to-br from-emerald-500 to-emerald-600"
          onClick={() => (onShare ? onShare() : onNavigate('audit', 'Sharing Summary'))}
        />
      </div>

      {/* KPI */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {KPIS.map((k) => (
          <div key={k.label} className="glass-card rounded-2xl p-4 transition-shadow hover:shadow-md">
            <span className={`w-9 h-9 rounded-xl flex items-center justify-center ${k.tone}`}><k.icon className="w-[18px] h-[18px]" /></span>
            <p className="text-2xl font-bold text-zinc-900 mt-3 tabular-nums">{k.value}</p>
            <p className="text-xs text-zinc-500">{k.label}</p>
            <p className="text-[11px] text-zinc-400 mt-1">{k.sub}</p>
          </div>
        ))}
      </div>

      {/* Caricamenti in corso + Attività */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <Panel title="Caricamenti in corso" icon={Upload} action="Tutte le collection" onAction={() => onNavigate('ingestor', 'Collections')}>
            <div className="space-y-1">
              {INGESTING.map((c) => {
                const pct = c.total > 0 ? Math.round((c.done / c.total) * 100) : 0;
                const draft = c.status === 'draft';
                return (
                  <button
                    key={c.id}
                    onClick={() => onOpenCollection(c.id)}
                    className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-zinc-50 transition-colors group"
                  >
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${DB_DOT[c.db] || 'bg-zinc-400'}`} />
                      <span className="text-sm font-medium text-zinc-800 truncate flex-1">{c.name}</span>
                      <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${draft ? 'bg-zinc-100 text-zinc-500' : 'bg-blue-50 text-blue-600'}`}>
                        {draft ? 'Bozza' : `${pct}%`}
                      </span>
                      <ChevronRight className="w-4 h-4 text-zinc-300 group-hover:text-zinc-500" />
                    </div>
                    <div className="flex items-center gap-2 mt-1.5 pl-4">
                      <div className="h-1.5 flex-1 rounded-full bg-zinc-100 overflow-hidden">
                        <div className={`h-full rounded-full ${draft ? 'bg-zinc-300' : 'bg-blue-500'}`} style={{ width: `${draft ? 4 : pct}%` }} />
                      </div>
                      <span className="text-[11px] text-zinc-400 shrink-0">
                        {c.total > 0 ? `${c.done.toLocaleString('it-IT')}/${c.total.toLocaleString('it-IT')} file` : 'in preparazione'} · {c.by}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </Panel>
        </div>

        <Panel title="Attività & avvisi" icon={Activity}>
          <div className="space-y-0.5">
            {ACTIVITY.map((a, i) => (
              <div key={i} className="flex items-start gap-2.5 px-3 py-2 rounded-xl hover:bg-zinc-50 transition-colors">
                <a.icon className={`w-4 h-4 shrink-0 mt-0.5 ${a.tone}`} />
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] text-zinc-700 leading-snug">{a.text}</p>
                  <p className="text-[11px] text-zinc-400 mt-0.5">{a.when}</p>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      {/* Dati condivisi + Accessi */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Panel title="Condivisioni attive" icon={Share2} action="Gestisci" onAction={() => onNavigate('audit', 'Sharing Summary')}>
          <div className="space-y-1">
            {shareRows.map((s, i) => (
              <button
                key={i}
                onClick={() => onNavigate('audit', 'Sharing Summary')}
                className="w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-zinc-50 transition-colors"
              >
                <span className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center shrink-0"><s.icon className="w-4 h-4 text-zinc-500" /></span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-zinc-800 truncate">{s.name}</p>
                  <p className="text-[11px] text-zinc-400 truncate">{s.with} · {s.detail}</p>
                </div>
                <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full shrink-0 ${KIND_BADGE[s.kind]}`}>{s.kind}</span>
              </button>
            ))}
          </div>
        </Panel>

        <Panel title="Accessi recenti ai dati condivisi" icon={Eye} action="Access log" onAction={() => onNavigate('audit', 'Access Logs')}>
          <div className="space-y-0.5">
            {ACCESS.map((a, i) => (
              <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-zinc-50 transition-colors">
                <a.icon className={`w-4 h-4 shrink-0 ${a.tone}`} />
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] text-zinc-700 leading-snug truncate">
                    <span className="font-medium text-zinc-900">{a.who}</span> {a.action} <span className="text-zinc-600">{a.what}</span>
                  </p>
                </div>
                <span className="text-[11px] text-zinc-400 shrink-0 flex items-center gap-1"><Clock className="w-3 h-3" />{a.when}</span>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}
