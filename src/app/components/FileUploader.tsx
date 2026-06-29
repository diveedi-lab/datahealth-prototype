import React, { useState } from 'react';
import { Terminal, Key, Copy, Check, Plus, Trash2, Eye, EyeOff, Download, Shield, Clock, AlertCircle, ExternalLink } from 'lucide-react';

interface ApiKey {
  id: string;
  name: string;
  prefix: string;
  createdAt: string;
  lastUsed?: string;
  scopes: string[];
  status: 'active' | 'revoked';
}

const MOCK_KEYS: ApiKey[] = [
  { id: 'key-1', name: 'Production Uploader', prefix: 'dlk_prod_7f3a...', createdAt: '2026-01-15T10:00:00', lastUsed: '2026-04-11T09:45:00', scopes: ['upload', 'read'], status: 'active' },
  { id: 'key-2', name: 'CI/CD Pipeline', prefix: 'dlk_ci_9b2c...', createdAt: '2026-02-20T14:00:00', lastUsed: '2026-04-10T22:00:00', scopes: ['upload'], status: 'active' },
  { id: 'key-3', name: 'Lab Partner Integration', prefix: 'dlk_lab_4e1d...', createdAt: '2025-11-01T08:00:00', lastUsed: '2026-03-15T06:00:00', scopes: ['upload', 'read'], status: 'active' },
  { id: 'key-4', name: 'Legacy Migration Script', prefix: 'dlk_mig_8a5f...', createdAt: '2025-06-10T12:00:00', lastUsed: '2025-12-20T18:00:00', scopes: ['upload', 'read', 'delete'], status: 'revoked' },
];

const CLI_EXAMPLES = [
  { label: 'Install the CLI tool', cmd: 'pip install datalake-cli' },
  { label: 'Authenticate with your API key', cmd: 'datalake auth login --key <YOUR_API_KEY>' },
  { label: 'Upload a single file', cmd: 'datalake upload --db CARDIO-2024 --file ./data/lab_results.csv' },
  { label: 'Upload a directory', cmd: 'datalake upload --db CARDIO-2024 --dir ./data/batch_q1/ --recursive' },
  { label: 'Upload with schema validation', cmd: 'datalake upload --db CARDIO-2024 --file ./data.csv --validate --schema patients' },
  { label: 'Check upload status', cmd: 'datalake status --process DS-0012' },
  { label: 'List recent uploads', cmd: 'datalake list --limit 10' },
];

export function FileUploader() {
  const [keys, setKeys] = useState(MOCK_KEYS);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedCmd, setCopiedCmd] = useState<number | null>(null);
  const [showNewKey, setShowNewKey] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');

  const copyToClipboard = (text: string, id: string | number) => {
    navigator.clipboard.writeText(text);
    if (typeof id === 'string') {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } else {
      setCopiedCmd(id);
      setTimeout(() => setCopiedCmd(null), 2000);
    }
  };

  const createKey = () => {
    if (!newKeyName.trim()) return;
    const newKey: ApiKey = {
      id: `key-${Date.now()}`, name: newKeyName, prefix: `dlk_new_${Math.random().toString(36).substring(2, 6)}...`,
      createdAt: new Date().toISOString(), scopes: ['upload'], status: 'active',
    };
    setKeys(prev => [newKey, ...prev]);
    setNewKeyName('');
    setShowNewKey(false);
  };

  const revokeKey = (id: string) => {
    setKeys(prev => prev.map(k => k.id === id ? { ...k, status: 'revoked' as const } : k));
  };

  return (
    <div className="flex flex-col gap-6 h-full w-full min-h-0 overflow-auto pb-8 max-w-5xl">
      <div>
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">File Uploader</h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Use the CLI tool or API to upload files programmatically to the data lake.</p>
      </div>

      {/* API Keys Section — shown first, since a key is required before using the CLI */}
      <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl">
        <div className="px-5 py-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
              <Key className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-zinc-900 dark:text-white">1. Create an API Key</p>
              <p className="text-xs text-zinc-400">You need an API key to authenticate the CLI tool and API calls.</p>
            </div>
          </div>
          <button onClick={() => setShowNewKey(true)} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium transition-colors">
            <Plus className="w-3.5 h-3.5" /> Create Key
          </button>
        </div>

        {showNewKey && (
          <div className="px-5 py-4 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 flex items-center gap-3">
            <input type="text" value={newKeyName} onChange={e => setNewKeyName(e.target.value)} placeholder="Key name (e.g. CI/CD Pipeline)"
              className="flex-1 px-3 py-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:text-zinc-200" autoFocus
              onKeyDown={e => e.key === 'Enter' && createKey()} />
            <button onClick={createKey} disabled={!newKeyName.trim()} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-300 dark:disabled:bg-zinc-700 text-white rounded-lg text-sm font-medium transition-colors">Create</button>
            <button onClick={() => setShowNewKey(false)} className="px-3 py-2 text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300">Cancel</button>
          </div>
        )}

        <div className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
          {keys.map(key => (
            <div key={key.id} className={`px-5 py-4 flex items-center gap-4 ${key.status === 'revoked' ? 'opacity-50' : ''}`}>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${key.status === 'active' ? 'bg-emerald-50 dark:bg-emerald-950/30' : 'bg-zinc-100 dark:bg-zinc-800'}`}>
                <Shield className={`w-4 h-4 ${key.status === 'active' ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-400'}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-zinc-900 dark:text-white">{key.name}</p>
                  {key.status === 'revoked' && <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500 font-medium">Revoked</span>}
                </div>
                <div className="flex items-center gap-3 mt-0.5 text-[11px] text-zinc-400 dark:text-zinc-500">
                  <span className="font-mono">{key.prefix}</span>
                  <span>Created {new Date(key.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  {key.lastUsed && <span>Last used {new Date(key.lastUsed).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>}
                </div>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap shrink-0">
                {key.scopes.map(s => (
                  <span key={s} className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 font-medium">{s}</span>
                ))}
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button onClick={() => copyToClipboard(key.prefix, key.id)} className="p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors" title="Copy key">
                  {copiedId === key.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
                {key.status === 'active' && (
                  <button onClick={() => revokeKey(key.id)} className="p-1.5 text-zinc-400 hover:text-red-500 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors" title="Revoke key">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CLI Tool Section */}
      <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl">
        <div className="px-5 py-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-zinc-900 dark:bg-zinc-800 flex items-center justify-center shrink-0">
              <Terminal className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-zinc-900 dark:text-white">2. Install & Use the CLI</p>
              <p className="text-xs text-zinc-400">v2.4.1 — Command line tool for data upload and management</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a href="#" className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors">
              <ExternalLink className="w-3 h-3" /> Documentation
            </a>
            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 dark:bg-zinc-800 text-white rounded-lg text-xs font-medium hover:bg-zinc-800 dark:hover:bg-zinc-700 transition-colors">
              <Download className="w-3 h-3" /> Download CLI
            </button>
          </div>
        </div>
        <div className="p-5 space-y-3">
          {CLI_EXAMPLES.map((ex, i) => (
            <div key={i}>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mb-1 uppercase tracking-wider">{ex.label}</p>
              <div className="flex items-center gap-2 bg-zinc-900 dark:bg-zinc-900/80 rounded-lg px-4 py-2.5 font-mono text-[13px] text-emerald-400 group">
                <span className="text-zinc-500 select-none">$</span>
                <code className="flex-1 overflow-x-auto">{ex.cmd}</code>
                <button onClick={() => copyToClipboard(ex.cmd, i)} className="shrink-0 p-1 text-zinc-500 hover:text-zinc-300 opacity-0 group-hover:opacity-100 transition-opacity">
                  {copiedCmd === i ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Security Notice */}
      <div className="flex items-start gap-3 px-4 py-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/30 rounded-xl">
        <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-700 dark:text-amber-300">
          <p className="font-medium mb-0.5">Security Reminder</p>
          <p className="text-amber-600 dark:text-amber-400">API keys grant access to your data lake. Never share keys in public repositories or unsecured channels. Revoke unused keys regularly.</p>
        </div>
      </div>
    </div>
  );
}