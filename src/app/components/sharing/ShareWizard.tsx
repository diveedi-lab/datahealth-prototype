import React, { useEffect, useMemo, useState } from 'react';
import {
  Search, Check, ArrowRight, ArrowLeft, Send, Eye, Pencil, Download, FolderOpen, Users, Database, Info,
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { EXPLORE_COLLECTIONS } from '../explore/mock/mockCatalog';
import { listDerived } from '../explore/derivedStore';
import { PLATFORM_USERS } from './mockUsers';
import { addShare, type SharePermission, type Share } from './sharesStore';

const PERMISSIONS: { key: SharePermission; label: string; desc: string; Icon: React.ComponentType<{ className?: string }> }[] = [
  { key: 'view', label: 'Visualizza', desc: 'Vedere dati e struttura', Icon: Eye },
  { key: 'write', label: 'Modifica', desc: 'Creare query e derivate', Icon: Pencil },
  { key: 'download', label: 'Download', desc: 'Esportare i dati', Icon: Download },
  { key: 'file-access', label: 'Accesso file', desc: 'Accedere ai file grezzi', Icon: FolderOpen },
];

const STEPS = ['Collection', 'Permessi', 'Utenti'];

export function ShareWizard({
  open, onOpenChange, onDone, presetCollectionId,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onDone?: (s: Share) => void;
  presetCollectionId?: string;
}) {
  const [step, setStep] = useState(0);
  const [coll, setColl] = useState<Set<string>>(new Set());
  const [perms, setPerms] = useState<Set<SharePermission>>(new Set(['view']));
  const [users, setUsers] = useState<Set<string>>(new Set());
  const [qColl, setQColl] = useState('');
  const [qUser, setQUser] = useState('');

  useEffect(() => {
    if (open) {
      setStep(0);
      setColl(new Set(presetCollectionId ? [presetCollectionId] : []));
      setPerms(new Set(['view']));
      setUsers(new Set());
      setQColl(''); setQUser('');
    }
  }, [open, presetCollectionId]);

  const collOptions = useMemo(() => [
    ...EXPLORE_COLLECTIONS.map((c) => ({ id: c.id, name: c.name, dot: c.dotClass, kind: 'Catalogo' })),
    ...listDerived().map((d) => ({ id: d.id, name: d.name, dot: 'bg-emerald-500', kind: 'Derivata' })),
  ], []);
  const collFiltered = collOptions.filter((c) => !qColl || c.name.toLowerCase().includes(qColl.toLowerCase()));
  const usersFiltered = PLATFORM_USERS.filter((u) => !qUser || u.name.toLowerCase().includes(qUser.toLowerCase()) || u.role.toLowerCase().includes(qUser.toLowerCase()));

  const toggle = <T,>(set: Set<T>, setter: (s: Set<T>) => void, v: T) => {
    const next = new Set(set);
    if (next.has(v)) next.delete(v); else next.add(v);
    setter(next);
  };

  const canNext = step === 0 ? coll.size > 0 : step === 1 ? perms.size > 0 : users.size > 0;

  const submit = () => {
    const names = [...coll].map((id) => collOptions.find((c) => c.id === id)?.name ?? id);
    const us = [...users].map((id) => {
      const u = PLATFORM_USERS.find((x) => x.id === id)!;
      return { id: u.id, name: u.name, avatar: u.avatar };
    });
    const s = addShare({ collections: [...coll], collectionNames: names, permissions: [...perms], users: us });
    onDone?.(s);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Condividi dati</DialogTitle>
        </DialogHeader>

        {/* stepper */}
        <div className="flex items-center gap-2">
          {STEPS.map((s, i) => (
            <React.Fragment key={s}>
              <div className={`flex items-center gap-1.5 text-xs font-medium ${i === step ? 'text-blue-600' : i < step ? 'text-emerald-600' : 'text-zinc-400'}`}>
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${i === step ? 'bg-blue-600 text-white' : i < step ? 'bg-emerald-100 text-emerald-600' : 'bg-zinc-100 text-zinc-400'}`}>
                  {i < step ? <Check className="w-3 h-3" /> : i + 1}
                </span>
                {s}
              </div>
              {i < STEPS.length - 1 && <div className="flex-1 h-px bg-zinc-200" />}
            </React.Fragment>
          ))}
        </div>

        <div className="min-h-[280px]">
          {/* Step 1 — collections */}
          {step === 0 && (
            <div>
              <div className="flex items-start gap-2 text-[11px] text-zinc-500 bg-blue-50/60 border border-blue-100 rounded-lg px-2.5 py-1.5 mb-2">
                <Info className="w-3.5 h-3.5 mt-0.5 shrink-0 text-blue-500" />
                <span>Le collection si condividono <strong>intere</strong>. Per condividere solo una parte, crea prima una <strong>collezione derivata</strong> con una query.</span>
              </div>
              <div className="relative mb-2">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input value={qColl} onChange={(e) => setQColl(e.target.value)} placeholder="Cerca collection…" autoFocus
                  className="w-full pl-9 pr-3 py-2 text-sm bg-white/70 border border-zinc-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/30" />
              </div>
              <div className="max-h-64 overflow-auto border border-zinc-200 rounded-xl divide-y divide-zinc-50">
                {collFiltered.map((c) => {
                  const active = coll.has(c.id);
                  return (
                    <button key={c.id} onClick={() => toggle(coll, setColl, c.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors ${active ? 'bg-blue-50/60' : 'hover:bg-zinc-50'}`}>
                      <span className={`w-[18px] h-[18px] rounded flex items-center justify-center shrink-0 border ${active ? 'bg-blue-600 border-blue-600' : 'border-zinc-300 bg-white'}`}>
                        {active && <Check className="w-3 h-3 text-white" />}
                      </span>
                      <span className={`w-2 h-2 rounded-full shrink-0 ${c.dot}`} />
                      <span className="text-sm text-zinc-800 flex-1 truncate">{c.name}</span>
                      <span className="text-[10px] text-zinc-400">{c.kind}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 2 — permissions */}
          {step === 1 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {PERMISSIONS.map((p) => {
                const active = perms.has(p.key);
                return (
                  <button key={p.key} onClick={() => toggle(perms, setPerms, p.key)}
                    className={`text-left rounded-xl border p-3 transition-all ${active ? 'border-blue-400 bg-blue-50/50 ring-1 ring-blue-200' : 'border-zinc-200 hover:border-zinc-300'}`}>
                    <div className="flex items-center gap-2">
                      <span className={`w-8 h-8 rounded-lg flex items-center justify-center ${active ? 'bg-blue-600 text-white' : 'bg-zinc-100 text-zinc-500'}`}>
                        <p.Icon className="w-4 h-4" />
                      </span>
                      <span className="text-sm font-medium text-zinc-800 flex-1">{p.label}</span>
                      {active && <Check className="w-4 h-4 text-blue-600" />}
                    </div>
                    <p className="text-[11px] text-zinc-500 mt-1.5">{p.desc}</p>
                  </button>
                );
              })}
            </div>
          )}

          {/* Step 3 — users */}
          {step === 2 && (
            <div>
              <div className="relative mb-2">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input value={qUser} onChange={(e) => setQUser(e.target.value)} placeholder="Cerca utenti…" autoFocus
                  className="w-full pl-9 pr-3 py-2 text-sm bg-white/70 border border-zinc-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/30" />
              </div>
              <div className="max-h-64 overflow-auto border border-zinc-200 rounded-xl divide-y divide-zinc-50">
                {usersFiltered.map((u) => {
                  const active = users.has(u.id);
                  return (
                    <button key={u.id} onClick={() => toggle(users, setUsers, u.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors ${active ? 'bg-blue-50/60' : 'hover:bg-zinc-50'}`}>
                      <span className={`w-[18px] h-[18px] rounded flex items-center justify-center shrink-0 border ${active ? 'bg-blue-600 border-blue-600' : 'border-zinc-300 bg-white'}`}>
                        {active && <Check className="w-3 h-3 text-white" />}
                      </span>
                      <span className="w-7 h-7 rounded-full bg-zinc-200 flex items-center justify-center text-[10px] font-medium text-zinc-600 shrink-0">{u.avatar}</span>
                      <span className="min-w-0 flex-1">
                        <span className="text-sm text-zinc-800 block truncate">{u.name}</span>
                        <span className="text-[11px] text-zinc-400 block truncate">{u.email}</span>
                      </span>
                      <span className="text-[10px] text-zinc-400 shrink-0">{u.role}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* footer */}
        <div className="flex items-center justify-between pt-1">
          <span className="text-xs text-zinc-400 flex items-center gap-3">
            <span className="flex items-center gap-1"><Database className="w-3.5 h-3.5" />{coll.size}</span>
            <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" />{perms.size}</span>
            <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{users.size}</span>
          </span>
          <div className="flex items-center gap-2">
            {step > 0 && (
              <button onClick={() => setStep((s) => s - 1)} className="flex items-center gap-1.5 px-3 py-2 text-sm text-zinc-600 border border-zinc-200 rounded-xl hover:bg-zinc-100/60">
                <ArrowLeft className="w-4 h-4" /> Indietro
              </button>
            )}
            {step < 2 ? (
              <button onClick={() => setStep((s) => s + 1)} disabled={!canNext}
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white rounded-xl">
                Avanti <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button onClick={submit} disabled={!canNext}
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white rounded-xl">
                <Send className="w-4 h-4" /> Invia
              </button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
