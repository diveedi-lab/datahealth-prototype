import { useState } from 'react';
import { Search, Download, Close, Login, Logout, Locked, Unlocked, WarningAlt } from '@carbon/icons-react';

type AccessType = 'Login' | 'Logout' | 'Token Refresh' | 'Password Change' | 'MFA Verify' | 'Session Timeout' | 'API Key Used';
type AccessResult = 'Success' | 'Failed' | 'Blocked';

interface AccessEntry {
  id: string;
  timestamp: string;
  user: string;
  type: AccessType;
  result: AccessResult;
  ip: string;
  location: string;
  device: string;
  browser: string;
  sessionId: string;
  details: string;
  mfaUsed: boolean;
}

const MOCK_ACCESS: AccessEntry[] = [
  { id: 'acc-001', timestamp: '2026-04-14 09:42:00', user: 'elena.rossi@pharma.com', type: 'Login', result: 'Success', ip: '192.168.1.45', location: 'Milan, Italy', device: 'MacBook Pro', browser: 'Chrome 124', sessionId: 'sess-a8f3c2', details: 'Standard login via SSO (Azure AD)', mfaUsed: true },
  { id: 'acc-002', timestamp: '2026-04-14 09:38:12', user: 'hans.muller@clz.ch', type: 'Token Refresh', result: 'Success', ip: '10.0.0.112', location: 'Zurich, Switzerland', device: 'Windows Desktop', browser: 'Edge 124', sessionId: 'sess-b2d4e1', details: 'Access token refreshed, session extended by 30 min', mfaUsed: false },
  { id: 'acc-003', timestamp: '2026-04-14 09:35:55', user: 'unknown@attacker.xyz', type: 'Login', result: 'Blocked', ip: '45.33.32.156', location: 'Unknown (Tor exit node)', device: 'Unknown', browser: 'Unknown', sessionId: '—', details: 'Blocked: IP on threat intelligence blacklist. Geo-blocking rule triggered.', mfaUsed: false },
  { id: 'acc-004', timestamp: '2026-04-14 09:30:22', user: 'sarah.williams@medpath.co.uk', type: 'Login', result: 'Failed', ip: '172.16.0.88', location: 'London, UK', device: 'MacBook Air', browser: 'Safari 17', sessionId: '—', details: 'Invalid password. Attempt 2 of 5.', mfaUsed: false },
  { id: 'acc-005', timestamp: '2026-04-14 09:30:48', user: 'sarah.williams@medpath.co.uk', type: 'Login', result: 'Success', ip: '172.16.0.88', location: 'London, UK', device: 'MacBook Air', browser: 'Safari 17', sessionId: 'sess-c7f9a3', details: 'Login successful after retry. MFA via Authenticator app.', mfaUsed: true },
  { id: 'acc-006', timestamp: '2026-04-14 09:25:11', user: 'admin@platform.io', type: 'MFA Verify', result: 'Success', ip: '10.0.0.1', location: 'Basel, Switzerland', device: 'Linux Workstation', browser: 'Firefox 125', sessionId: 'sess-d1e5b7', details: 'MFA re-verification for admin action (DELETE_RECORDS)', mfaUsed: true },
  { id: 'acc-007', timestamp: '2026-04-14 09:20:33', user: 'klaus.weber@bioanalytica.de', type: 'Login', result: 'Success', ip: '192.168.2.15', location: 'Munich, Germany', device: 'Windows Desktop', browser: 'Chrome 124', sessionId: 'sess-e4c8d2', details: 'Standard login with LDAP authentication', mfaUsed: true },
  { id: 'acc-008', timestamp: '2026-04-14 09:10:05', user: 'jan.devries@genomescan.nl', type: 'API Key Used', result: 'Success', ip: '10.10.5.22', location: 'Leiden, Netherlands', device: 'API Client', browser: 'Python requests/2.31', sessionId: 'api-key-gs01', details: 'API key GS-API-2024-01 used for data export endpoint', mfaUsed: false },
  { id: 'acc-009', timestamp: '2026-04-14 08:55:00', user: 'system', type: 'Token Refresh', result: 'Success', ip: '10.0.0.1', location: 'Internal', device: 'Server', browser: 'System Process', sessionId: 'sys-backup', details: 'Service account token refreshed for backup process', mfaUsed: false },
  { id: 'acc-010', timestamp: '2026-04-14 08:48:33', user: 'maria.bianchi@hsr.it', type: 'Login', result: 'Success', ip: '172.16.1.50', location: 'Milan, Italy', device: 'iPad Pro', browser: 'Safari 17 (iPadOS)', sessionId: 'sess-g2h8c4', details: 'Mobile login with biometric MFA', mfaUsed: true },
  { id: 'acc-011', timestamp: '2026-04-14 08:30:00', user: 'thomas.meier@charite.de', type: 'Password Change', result: 'Success', ip: '192.168.3.77', location: 'Berlin, Germany', device: 'Windows Desktop', browser: 'Chrome 124', sessionId: 'sess-h5j2k9', details: 'Password changed per 90-day policy. All other sessions invalidated.', mfaUsed: true },
  { id: 'acc-012', timestamp: '2026-04-14 08:15:22', user: 'wei.tan@brs.sg', type: 'Login', result: 'Failed', ip: '103.27.12.44', location: 'Singapore', device: 'Windows Desktop', browser: 'Chrome 124', sessionId: '—', details: 'Account locked after 5 failed attempts. Unlock email sent.', mfaUsed: false },
  { id: 'acc-013', timestamp: '2026-04-14 07:50:11', user: 'pierre.lambert@sbp.ch', type: 'Session Timeout', result: 'Success', ip: '10.10.8.33', location: 'Lausanne, Switzerland', device: 'MacBook Pro', browser: 'Chrome 124', sessionId: 'sess-i9m1n6-old', details: 'Session expired after 30 min of inactivity. User re-authenticated.', mfaUsed: false },
  { id: 'acc-014', timestamp: '2026-04-14 07:30:45', user: 'bot-scanner@probe.net', type: 'Login', result: 'Blocked', ip: '185.220.101.34', location: 'Unknown (Data Center)', device: 'Unknown', browser: 'curl/7.88', sessionId: '—', details: 'Blocked: Automated bot detected. Rate limit exceeded (50 req/min). IP banned for 24h.', mfaUsed: false },
  { id: 'acc-015', timestamp: '2026-04-14 07:15:00', user: 'elena.rossi@pharma.com', type: 'Logout', result: 'Success', ip: '192.168.1.45', location: 'Milan, Italy', device: 'MacBook Pro', browser: 'Chrome 124', sessionId: 'sess-a8f3c2-prev', details: 'Manual logout. Session duration: 4h 12m.', mfaUsed: false },
];

const resultColors: Record<string, string> = {
  Success: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
  Failed: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
  Blocked: 'bg-red-200 text-red-900 dark:bg-red-900/60 dark:text-red-200',
};

const typeColors: Record<string, string> = {
  Login: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
  Logout: 'bg-zinc-200 text-zinc-700 dark:bg-zinc-700/40 dark:text-zinc-300',
  'Token Refresh': 'bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300',
  'Password Change': 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
  'MFA Verify': 'bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-300',
  'Session Timeout': 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300',
  'API Key Used': 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/40 dark:text-cyan-300',
};

export function AccessLogs() {
  const [logs] = useState(MOCK_ACCESS);
  const [search, setSearch] = useState('');
  const [filterResult, setFilterResult] = useState('All');
  const [filterType, setFilterType] = useState('All');
  const [selected, setSelected] = useState<AccessEntry | null>(null);

  const types = Array.from(new Set(logs.map(l => l.type)));

  const filtered = logs.filter(l => {
    const q = search.toLowerCase();
    const matchSearch = l.user.toLowerCase().includes(q) || l.ip.includes(q) || l.location.toLowerCase().includes(q) || l.details.toLowerCase().includes(q);
    const matchRes = filterResult === 'All' || l.result === filterResult;
    const matchType = filterType === 'All' || l.type === filterType;
    return matchSearch && matchRes && matchType;
  });

  const failedCount = logs.filter(l => l.result === 'Failed').length;
  const blockedCount = logs.filter(l => l.result === 'Blocked').length;
  const mfaCount = logs.filter(l => l.mfaUsed).length;

  return (
    <div className="h-full flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-zinc-900 dark:text-zinc-100">Access Logs</h1>
          <p className="text-[14px] text-zinc-500 dark:text-zinc-400 mt-1">Authentication events, login attempts, and session management</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-[14px]">
          <Download size={16} /> Export
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4">
          <p className="text-[12px] text-zinc-500 dark:text-zinc-400">Total Events</p>
          <p className="text-[24px] text-zinc-900 dark:text-zinc-100 mt-1">{logs.length}</p>
        </div>
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4">
          <p className="text-[12px] text-zinc-500 dark:text-zinc-400">Failed Logins</p>
          <p className="text-[24px] text-red-600 dark:text-red-400 mt-1">{failedCount}</p>
        </div>
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4">
          <p className="text-[12px] text-zinc-500 dark:text-zinc-400">Blocked</p>
          <p className="text-[24px] text-red-700 dark:text-red-300 mt-1">{blockedCount}</p>
        </div>
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4">
          <p className="text-[12px] text-zinc-500 dark:text-zinc-400">MFA Used</p>
          <p className="text-[24px] text-emerald-600 dark:text-emerald-400 mt-1">{mfaCount}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 items-center">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input type="text" placeholder="Search by user, IP, location..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-[14px] text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 outline-none focus:ring-2 focus:ring-zinc-900/10 dark:focus:ring-zinc-100/10" />
        </div>
        <select value={filterResult} onChange={e => setFilterResult(e.target.value)} className="px-3 py-2.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-[14px] text-zinc-900 dark:text-zinc-100 outline-none">
          <option value="All">All Results</option>
          <option>Success</option><option>Failed</option><option>Blocked</option>
        </select>
        <select value={filterType} onChange={e => setFilterType(e.target.value)} className="px-3 py-2.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-[14px] text-zinc-900 dark:text-zinc-100 outline-none">
          <option value="All">All Types</option>
          {types.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl">
        <table className="w-full">
          <thead>
            <tr className="border-b border-zinc-200 dark:border-zinc-800">
              {['Timestamp', 'Result', 'Type', 'User', 'IP Address', 'Location', 'Device', 'MFA'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-[12px] text-zinc-500 dark:text-zinc-400 whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(log => (
              <tr key={log.id} className="border-b last:border-b-0 border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/30 cursor-pointer transition-colors" onClick={() => setSelected(log)}>
                <td className="px-4 py-3 text-[13px] text-zinc-500 dark:text-zinc-400 font-mono whitespace-nowrap">{log.timestamp}</td>
                <td className="px-4 py-3"><span className={`text-[11px] px-2 py-0.5 rounded-full ${resultColors[log.result]}`}>{log.result}</span></td>
                <td className="px-4 py-3"><span className={`text-[11px] px-2 py-0.5 rounded-full ${typeColors[log.type]}`}>{log.type}</span></td>
                <td className="px-4 py-3 text-[13px] text-zinc-700 dark:text-zinc-300 max-w-[180px] truncate">{log.user}</td>
                <td className="px-4 py-3 text-[13px] text-zinc-500 dark:text-zinc-400 font-mono">{log.ip}</td>
                <td className="px-4 py-3 text-[13px] text-zinc-600 dark:text-zinc-400">{log.location}</td>
                <td className="px-4 py-3 text-[13px] text-zinc-500 dark:text-zinc-400 max-w-[120px] truncate">{log.device}</td>
                <td className="px-4 py-3">
                  {log.mfaUsed
                    ? <Locked size={16} className="text-emerald-600 dark:text-emerald-400" />
                    : <Unlocked size={16} className="text-zinc-300 dark:text-zinc-600" />}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <div className="p-10 text-center text-zinc-400 text-[14px]">No access logs match your filters</div>}
      </div>

      {/* Detail */}
      {selected && (
        <div className="fixed inset-0 bg-black/30 dark:bg-black/50 z-50 flex justify-end" onClick={() => setSelected(null)}>
          <div className="w-[520px] bg-white dark:bg-zinc-900 h-full shadow-xl overflow-auto" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <div>
                <h2 className="text-zinc-900 dark:text-zinc-100">{selected.type}</h2>
                <p className="text-[13px] text-zinc-500 dark:text-zinc-400">{selected.timestamp}</p>
              </div>
              <button onClick={() => setSelected(null)} className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg"><Close size={20} className="text-zinc-400" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex gap-2 flex-wrap">
                <span className={`text-[11px] px-2.5 py-1 rounded-full ${resultColors[selected.result]}`}>{selected.result}</span>
                <span className={`text-[11px] px-2.5 py-1 rounded-full ${typeColors[selected.type]}`}>{selected.type}</span>
                {selected.mfaUsed && <span className="text-[11px] px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">MFA Verified</span>}
              </div>
              {[
                { label: 'User', value: selected.user },
                { label: 'IP Address', value: selected.ip },
                { label: 'Location', value: selected.location },
                { label: 'Device', value: selected.device },
                { label: 'Browser / Client', value: selected.browser },
                { label: 'Session ID', value: selected.sessionId },
                { label: 'Details', value: selected.details },
              ].map(f => (
                <div key={f.label}>
                  <p className="text-[12px] text-zinc-500 dark:text-zinc-400 mb-1">{f.label}</p>
                  <p className="text-[14px] text-zinc-900 dark:text-zinc-100 break-all">{f.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
