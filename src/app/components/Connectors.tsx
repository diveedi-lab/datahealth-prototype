import React, { useState } from 'react';
import { Database, Cloud, Server, HardDrive, CheckCircle2, XCircle, AlertCircle, Settings, Plus, ExternalLink, RefreshCw, Trash2, Shield } from 'lucide-react';

interface Connector {
  id: string;
  name: string;
  type: string;
  icon: 'database' | 'cloud' | 'server' | 'storage';
  status: 'connected' | 'disconnected' | 'error';
  description: string;
  lastSync?: string;
  recordsSynced?: number;
  config?: { host?: string; bucket?: string; region?: string };
}

const ICON_MAP = {
  database: Database, cloud: Cloud, server: Server, storage: HardDrive,
};

const STATUS_CONFIG = {
  connected: { icon: CheckCircle2, cls: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/30', label: 'Connected' },
  disconnected: { icon: XCircle, cls: 'text-zinc-400 dark:text-zinc-500', bg: 'bg-zinc-100 dark:bg-zinc-800', label: 'Disconnected' },
  error: { icon: AlertCircle, cls: 'text-red-500 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-950/30', label: 'Error' },
};

const MOCK_CONNECTORS: Connector[] = [
  { id: 'conn-1', name: 'AWS S3 - Clinical Data', type: 'Amazon S3', icon: 'cloud', status: 'connected', description: 'Primary storage for clinical trial raw data files (DICOM, PDF, CSV).', lastSync: '2026-04-11T10:30:00', recordsSynced: 45200, config: { bucket: 'clinical-data-prod', region: 'eu-west-1' } },
  { id: 'conn-2', name: 'PostgreSQL - CDMS', type: 'PostgreSQL', icon: 'database', status: 'connected', description: 'Clinical Data Management System database for structured trial data.', lastSync: '2026-04-11T09:00:00', recordsSynced: 2800000, config: { host: 'cdms-prod.internal.io:5432' } },
  { id: 'conn-3', name: 'Azure Blob - Imaging', type: 'Azure Blob Storage', icon: 'cloud', status: 'connected', description: 'Medical imaging archive for DICOM and pathology slides.', lastSync: '2026-04-10T22:00:00', recordsSynced: 18400, config: { bucket: 'imaging-archive', region: 'westeurope' } },
  { id: 'conn-4', name: 'SFTP - Lab Partner', type: 'SFTP Server', icon: 'server', status: 'error', description: 'Automated lab results import from external laboratory partner.', lastSync: '2026-04-09T06:00:00', recordsSynced: 12000 },
  { id: 'conn-5', name: 'Oracle - Legacy EDC', type: 'Oracle Database', icon: 'database', status: 'disconnected', description: 'Legacy Electronic Data Capture system (migration complete).', recordsSynced: 890000, config: { host: 'edc-legacy.internal.io:1521' } },
  { id: 'conn-6', name: 'Google Cloud Storage', type: 'GCS', icon: 'cloud', status: 'disconnected', description: 'Backup and disaster recovery storage for all trial data.', config: { bucket: 'datalake-backup-dr', region: 'europe-west4' } },
];

const AVAILABLE_TYPES = [
  { name: 'Amazon S3', icon: 'cloud' as const },
  { name: 'Azure Blob Storage', icon: 'cloud' as const },
  { name: 'Google Cloud Storage', icon: 'cloud' as const },
  { name: 'PostgreSQL', icon: 'database' as const },
  { name: 'MySQL', icon: 'database' as const },
  { name: 'Oracle Database', icon: 'database' as const },
  { name: 'SFTP Server', icon: 'server' as const },
  { name: 'REST API', icon: 'server' as const },
  { name: 'FHIR Server', icon: 'server' as const },
];

export function Connectors() {
  const [connectors] = useState(MOCK_CONNECTORS);
  const [showAdd, setShowAdd] = useState(false);

  const fmt = (n: number) => new Intl.NumberFormat('en-US', { notation: 'compact', compactDisplay: 'short' }).format(n);

  return (
    <div className="flex flex-col gap-6 h-full w-full min-h-0 overflow-auto pb-8">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Connectors</h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Manage external data source connections for automated ingestion.</p>
        </div>
        <button onClick={() => setShowAdd(!showAdd)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors shadow-sm">
          <Plus className="w-4 h-4" /> Add Connector
        </button>
      </div>

      {/* Active Connectors */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {connectors.map(conn => {
          const stCfg = STATUS_CONFIG[conn.status];
          const StIcon = stCfg.icon;
          const ConnIcon = ICON_MAP[conn.icon];
          return (
            <div key={conn.id} className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 hover:shadow-md transition-all">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0">
                  <ConnIcon className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <p className="text-sm font-semibold text-zinc-900 dark:text-white truncate">{conn.name}</p>
                    <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full ${stCfg.bg} ${stCfg.cls}`}>
                      <StIcon className={`w-3 h-3 ${stCfg.cls}`} />{stCfg.label}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-2">{conn.description}</p>
                  <div className="flex items-center gap-3 text-[11px] text-zinc-400 dark:text-zinc-500 flex-wrap">
                    <span className="font-medium text-zinc-500 dark:text-zinc-400">{conn.type}</span>
                    {conn.recordsSynced && <span>{fmt(conn.recordsSynced)} records synced</span>}
                    {conn.lastSync && <span>Last sync: {new Date(conn.lastSync).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>}
                    {conn.config?.host && <span className="font-mono text-[10px]">{conn.config.host}</span>}
                    {conn.config?.bucket && <span className="font-mono text-[10px]">{conn.config.bucket}</span>}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                {conn.status === 'connected' && (
                  <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
                    <RefreshCw className="w-3 h-3" /> Sync Now
                  </button>
                )}
                {conn.status === 'disconnected' && (
                  <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-950/50 transition-colors">
                    <ExternalLink className="w-3 h-3" /> Connect
                  </button>
                )}
                {conn.status === 'error' && (
                  <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 rounded-lg hover:bg-red-100 dark:hover:bg-red-950/50 transition-colors">
                    <RefreshCw className="w-3 h-3" /> Retry
                  </button>
                )}
                <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
                  <Settings className="w-3 h-3" /> Configure
                </button>
                <div className="flex-1" />
                <button className="p-1.5 text-zinc-400 hover:text-red-500 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Available Connector Types */}
      {showAdd && (
        <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-white mb-3">Available Connector Types</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {AVAILABLE_TYPES.map(t => {
              const TIcon = ICON_MAP[t.icon];
              return (
                <button key={t.name} className="flex items-center gap-3 px-4 py-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm text-zinc-700 dark:text-zinc-300 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-colors text-left">
                  <TIcon className="w-4 h-4 text-zinc-500 dark:text-zinc-400 shrink-0" />
                  {t.name}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
