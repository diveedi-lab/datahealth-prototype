import { useState } from 'react';
import { Add, Close, TrashCan, Copy, View, ViewOff, Time, Checkmark, Warning } from '@carbon/icons-react';

interface ApiKey {
  id: string;
  name: string;
  prefix: string;
  createdAt: string;
  expiresAt: string;
  lastUsed: string;
  status: 'Active' | 'Expired' | 'Revoked';
  scopes: string[];
  createdBy: string;
}

const MOCK_KEYS: ApiKey[] = [
  { id: 'ak-001', name: 'ETL Pipeline - BioAnalytica', prefix: 'csp_live_Ba7x', createdAt: '2025-11-01', expiresAt: '2026-11-01', lastUsed: '2026-04-14 09:10', status: 'Active', scopes: ['query:execute', 'data:read', 'ingestor:upload'], createdBy: 'elena.rossi@pharma.com' },
  { id: 'ak-002', name: 'GenomeScan Integration', prefix: 'csp_live_Gs2k', createdAt: '2025-04-22', expiresAt: '2026-04-22', lastUsed: '2026-04-13 11:05', status: 'Active', scopes: ['query:execute', 'data:read', 'data:export'], createdBy: 'elena.rossi@pharma.com' },
  { id: 'ak-003', name: 'Monitoring Dashboard', prefix: 'csp_live_Md9q', createdAt: '2025-06-15', expiresAt: '2026-06-15', lastUsed: '2026-04-14 08:00', status: 'Active', scopes: ['dashboard:read', 'audit:read'], createdBy: 'hans.muller@clz.ch' },
  { id: 'ak-004', name: 'Legacy SDTM Export', prefix: 'csp_live_Lx3r', createdAt: '2024-12-01', expiresAt: '2025-12-01', lastUsed: '2025-11-28 16:44', status: 'Expired', scopes: ['data:read', 'data:export'], createdBy: 'sarah.williams@medpath.co.uk' },
  { id: 'ak-005', name: 'Test Sandbox Key', prefix: 'csp_test_Tb1w', createdAt: '2026-01-10', expiresAt: '2026-07-10', lastUsed: '2026-03-02 10:20', status: 'Revoked', scopes: ['query:execute', 'data:read'], createdBy: 'elena.rossi@pharma.com' },
];

const ALL_SCOPES = [
  { value: 'query:execute', label: 'Execute Queries' },
  { value: 'data:read', label: 'Read Data' },
  { value: 'data:export', label: 'Export Data' },
  { value: 'data:write', label: 'Write Data' },
  { value: 'ingestor:upload', label: 'Upload Files' },
  { value: 'dashboard:read', label: 'Read Dashboards' },
  { value: 'audit:read', label: 'Read Audit Logs' },
  { value: 'admin:full', label: 'Full Admin Access' },
];

const statusColors: Record<string, string> = {
  Active: 'bg-emerald-100 text-emerald-800',
  Expired: 'bg-amber-100 text-amber-800',
  Revoked: 'bg-red-100 text-red-800',
};

export function ApiKeys() {
  const [keys, setKeys] = useState(MOCK_KEYS);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newExpiry, setNewExpiry] = useState('365');
  const [newScopes, setNewScopes] = useState<Set<string>>(new Set());
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const toggleScope = (scope: string) => {
    const next = new Set(newScopes);
    if (next.has(scope)) next.delete(scope); else next.add(scope);
    setNewScopes(next);
  };

  const handleCreate = () => {
    if (!newName.trim() || newScopes.size === 0) return;
    const prefix = `csp_live_${Math.random().toString(36).slice(2, 6)}`;
    const fullKey = `${prefix}_${Math.random().toString(36).slice(2, 18)}${Math.random().toString(36).slice(2, 18)}`;
    const now = new Date();
    const expiry = new Date(now.getTime() + parseInt(newExpiry) * 86400000);
    const newKey: ApiKey = {
      id: `ak-${Date.now()}`, name: newName.trim(), prefix, createdAt: now.toISOString().split('T')[0],
      expiresAt: expiry.toISOString().split('T')[0], lastUsed: '—', status: 'Active',
      scopes: Array.from(newScopes), createdBy: 'elena.rossi@pharma.com',
    };
    setKeys([newKey, ...keys]);
    setGeneratedKey(fullKey);
  };

  const closeCreate = () => {
    setShowCreate(false); setNewName(''); setNewExpiry('365'); setNewScopes(new Set()); setGeneratedKey(null);
  };

  const handleRevoke = (id: string) => {
    setKeys(prev => prev.map(k => k.id === id ? { ...k, status: 'Revoked' as const } : k));
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  return (
    <div className="h-full flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-zinc-900">API Keys</h1>
          <p className="text-[14px] text-zinc-500 mt-1">Manage programmatic access tokens for ETL pipelines, integrations, and automated workflows</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 px-4 py-2.5 bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 transition-colors text-[14px]">
          <Add size={16} /> Generate Key
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {(['Active', 'Expired', 'Revoked'] as const).map(s => (
          <div key={s} className="glass-card rounded-xl px-4 py-3">
            <p className="text-[12px] text-zinc-500">{s}</p>
            <p className="text-[20px] text-zinc-900 mt-0.5">{keys.filter(k => k.status === s).length}</p>
          </div>
        ))}
      </div>

      {/* Key List */}
      <div className="flex-1 overflow-auto space-y-3 pb-4">
        {keys.map(key => (
          <div key={key.id} className="glass-card rounded-xl p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-[14px] text-zinc-900">{key.name}</p>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${statusColors[key.status]}`}>{key.status}</span>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <code className="text-[13px] font-mono bg-zinc-100 px-2 py-0.5 rounded text-zinc-600">{key.prefix}••••••••</code>
                  <button onClick={() => handleCopy(key.prefix, key.id)} className="p-1 hover:bg-zinc-100 rounded transition-colors">
                    {copiedId === key.id ? <Checkmark size={14} className="text-emerald-500" /> : <Copy size={14} className="text-zinc-400" />}
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {key.scopes.map(s => (
                    <span key={s} className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-600">{s}</span>
                  ))}
                </div>
                <div className="flex gap-4 text-[12px] text-zinc-400">
                  <span>Created {key.createdAt} by {key.createdBy.split('@')[0]}</span>
                  <span>Expires {key.expiresAt}</span>
                  <span>Last used {key.lastUsed}</span>
                </div>
              </div>
              {key.status === 'Active' && (
                <button onClick={() => handleRevoke(key.id)}
                  className="px-3 py-1.5 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors text-[12px]">
                  Revoke
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center" onClick={closeCreate}>
          <div className="glass rounded-2xl w-[520px] max-h-[80vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-zinc-200 flex items-center justify-between shrink-0">
              <h2 className="text-zinc-900">{generatedKey ? 'API Key Generated' : 'Generate API Key'}</h2>
              <button onClick={closeCreate} className="p-1.5 hover:bg-zinc-100 rounded-lg"><Close size={20} className="text-zinc-400" /></button>
            </div>

            {generatedKey ? (
              <div className="p-6 space-y-4">
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex gap-3">
                  <Warning size={16} className="text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[13px] text-amber-800">Copy this key now — it won't be shown again.</p>
                    <p className="text-[12px] text-amber-600 mt-1">Store it securely in your secrets manager or vault.</p>
                  </div>
                </div>
                <div className="bg-zinc-50 rounded-lg p-4 flex items-center gap-3">
                  <code className="flex-1 text-[13px] font-mono text-zinc-900 break-all">{generatedKey}</code>
                  <button onClick={() => handleCopy(generatedKey, 'new')} className="p-2 hover:bg-zinc-200 rounded-lg transition-colors shrink-0">
                    {copiedId === 'new' ? <Checkmark size={16} className="text-emerald-500" /> : <Copy size={16} className="text-zinc-500" />}
                  </button>
                </div>
                <button onClick={closeCreate} className="w-full px-4 py-2.5 bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 transition-colors text-[14px]">
                  Done
                </button>
              </div>
            ) : (
              <>
                <div className="p-6 space-y-4 overflow-auto flex-1">
                  <div>
                    <label className="text-[12px] text-zinc-500 mb-1.5 block">Key Name *</label>
                    <input type="text" value={newName} onChange={e => setNewName(e.target.value)} placeholder="e.g. ETL Pipeline - LabService"
                      className="w-full px-4 py-2.5 bg-white border border-zinc-200 rounded-lg text-[14px] text-zinc-900 placeholder:text-zinc-400 outline-none" />
                  </div>
                  <div>
                    <label className="text-[12px] text-zinc-500 mb-1.5 block">Expiration</label>
                    <select value={newExpiry} onChange={e => setNewExpiry(e.target.value)}
                      className="w-full px-3 py-2.5 bg-white border border-zinc-200 rounded-lg text-[14px] text-zinc-900 outline-none">
                      <option value="30">30 days</option><option value="90">90 days</option><option value="180">180 days</option><option value="365">1 year</option><option value="730">2 years</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[12px] text-zinc-500 mb-2 block">Scopes *</label>
                    <div className="grid grid-cols-2 gap-2">
                      {ALL_SCOPES.map(scope => (
                        <button key={scope.value} onClick={() => toggleScope(scope.value)}
                          className={`px-3 py-2 rounded-lg text-[13px] text-left border transition-colors ${newScopes.has(scope.value)
                            ? 'border-zinc-900 bg-zinc-900 text-white'
                            : 'border-zinc-200 text-zinc-600 hover:bg-zinc-50'
                          }`}>
                          {scope.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="p-6 border-t border-zinc-200 flex justify-end gap-3 shrink-0">
                  <button onClick={closeCreate} className="px-4 py-2.5 border border-zinc-300 text-zinc-700 rounded-lg hover:bg-zinc-100 transition-colors text-[14px]">Cancel</button>
                  <button onClick={handleCreate} className="px-4 py-2.5 bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 transition-colors text-[14px]">Generate</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
