import { useState } from 'react';
import { Search, Close, WarningAlt, WarningFilled, CheckmarkFilled, Download, Renew } from '@carbon/icons-react';

type AlertSeverity = 'Critical' | 'High' | 'Medium' | 'Low';
type AlertStatus = 'Open' | 'Investigating' | 'Resolved' | 'Dismissed';

interface SecurityAlert {
  id: string;
  timestamp: string;
  severity: AlertSeverity;
  status: AlertStatus;
  title: string;
  category: string;
  source: string;
  affectedUser: string;
  ip: string;
  description: string;
  recommendation: string;
  resolvedBy: string;
  resolvedAt: string;
}

const MOCK_ALERTS: SecurityAlert[] = [
  {
    id: 'sa-001', timestamp: '2026-04-14 09:35:55', severity: 'Critical', status: 'Open',
    title: 'Tor Exit Node Login Attempt', category: 'Threat Intelligence',
    source: 'IP Reputation Engine', affectedUser: 'unknown@attacker.xyz', ip: '45.33.32.156',
    description: 'Login attempt detected from known Tor exit node (45.33.32.156). This IP appears on 3 threat intelligence blacklists. The request was automatically blocked by geo-blocking rules.',
    recommendation: 'Review firewall rules. Consider blocking entire Tor exit node list. Monitor for additional attempts from this IP range.',
    resolvedBy: '', resolvedAt: '',
  },
  {
    id: 'sa-002', timestamp: '2026-04-14 08:15:22', severity: 'High', status: 'Investigating',
    title: 'Brute Force Attack Detected', category: 'Authentication',
    source: 'Rate Limiter', affectedUser: 'wei.tan@brs.sg', ip: '103.27.12.44',
    description: 'Account wei.tan@brs.sg locked after 5 consecutive failed login attempts within 3 minutes. Pattern consistent with credential stuffing attack. IP geolocation matches user\'s expected location (Singapore).',
    recommendation: 'Verify with user if attempts were legitimate. If not, force password reset and review account activity. Consider implementing CAPTCHA after 3 failed attempts.',
    resolvedBy: '', resolvedAt: '',
  },
  {
    id: 'sa-003', timestamp: '2026-04-14 07:30:45', severity: 'Critical', status: 'Resolved',
    title: 'Automated Bot Scanning Detected', category: 'Intrusion Detection',
    source: 'WAF / Rate Limiter', affectedUser: 'bot-scanner@probe.net', ip: '185.220.101.34',
    description: 'Automated scanning detected: 50+ requests per minute to authentication endpoints. User agent identified as curl/7.88. IP belongs to a known data center (Hetzner). IP has been banned for 24 hours.',
    recommendation: 'IP has been auto-banned. Review WAF logs for additional scanning patterns. Update rate limiting rules if needed.',
    resolvedBy: 'system (auto)', resolvedAt: '2026-04-14 07:31:00',
  },
  {
    id: 'sa-004', timestamp: '2026-04-13 22:15:33', severity: 'High', status: 'Resolved',
    title: 'Unusual Data Export Volume', category: 'Data Exfiltration',
    source: 'Anomaly Detection', affectedUser: 'hans.muller@clz.ch', ip: '10.0.0.112',
    description: 'User exported 3 complete datasets (DM, AE, LB) totaling 45,000 records in a single session. This is 400% above the user\'s average export volume. Export occurred outside normal business hours (22:15 CET).',
    recommendation: 'Contacted user who confirmed legitimate export for regulatory submission deadline. Marked as resolved.',
    resolvedBy: 'admin@platform.io', resolvedAt: '2026-04-14 08:00:00',
  },
  {
    id: 'sa-005', timestamp: '2026-04-13 18:42:00', severity: 'Medium', status: 'Resolved',
    title: 'Privilege Escalation Attempt', category: 'Authorization',
    source: 'RBAC Engine', affectedUser: 'maria.bianchi@hsr.it', ip: '172.16.1.50',
    description: 'User attempted to access admin endpoint /api/admin/users without sufficient permissions. Request was denied (HTTP 403). User has role "Data Manager" which does not include user administration.',
    recommendation: 'Likely accidental navigation. No further action required. User was informed of correct access procedures.',
    resolvedBy: 'admin@platform.io', resolvedAt: '2026-04-13 19:00:00',
  },
  {
    id: 'sa-006', timestamp: '2026-04-13 14:20:18', severity: 'Medium', status: 'Dismissed',
    title: 'Login from New Device', category: 'Authentication',
    source: 'Device Fingerprinting', affectedUser: 'thomas.meier@charite.de', ip: '192.168.3.77',
    description: 'First login detected from a new device (iPad Pro, Safari 17). User has previously only used Windows Desktop + Chrome. MFA was successfully completed.',
    recommendation: 'User confirmed new device. Added to trusted devices list.',
    resolvedBy: 'thomas.meier@charite.de', resolvedAt: '2026-04-13 14:25:00',
  },
  {
    id: 'sa-007', timestamp: '2026-04-13 11:05:44', severity: 'Low', status: 'Resolved',
    title: 'Expired API Key Usage Attempt', category: 'Authentication',
    source: 'API Gateway', affectedUser: 'jan.devries@genomescan.nl', ip: '10.10.5.22',
    description: 'Attempt to use expired API key GS-API-2023-12 (expired 2024-01-01). Request was rejected. User has an active key GS-API-2024-01.',
    recommendation: 'User updated their integration to use the current API key. Old key reference removed from their scripts.',
    resolvedBy: 'jan.devries@genomescan.nl', resolvedAt: '2026-04-13 11:30:00',
  },
  {
    id: 'sa-008', timestamp: '2026-04-13 06:00:00', severity: 'Low', status: 'Resolved',
    title: 'SSL Certificate Expiry Warning', category: 'Infrastructure',
    source: 'Certificate Monitor', affectedUser: 'system', ip: '10.0.0.1',
    description: 'SSL certificate for api.platform.io expires in 14 days (2026-04-28). Auto-renewal is configured via Let\'s Encrypt but requires DNS validation.',
    recommendation: 'Certificate auto-renewed successfully on 2026-04-13 06:15:00. Next renewal scheduled for 2026-07-12.',
    resolvedBy: 'system (auto)', resolvedAt: '2026-04-13 06:15:00',
  },
  {
    id: 'sa-009', timestamp: '2026-04-12 20:30:00', severity: 'High', status: 'Open',
    title: 'Concurrent Sessions from Multiple Countries', category: 'Authentication',
    source: 'Session Monitor', affectedUser: 'elena.rossi@pharma.com', ip: '192.168.1.45 / 89.42.15.200',
    description: 'Active sessions detected simultaneously from Milan, Italy (192.168.1.45) and Bucharest, Romania (89.42.15.200). Geographic distance makes simultaneous legitimate access unlikely.',
    recommendation: 'Immediately investigate the Bucharest session. Consider forcing logout of all sessions and requiring password reset. Contact user to verify.',
    resolvedBy: '', resolvedAt: '',
  },
];

const severityColors: Record<string, string> = {
  Critical: 'bg-red-200 text-red-900',
  High: 'bg-red-100 text-red-800',
  Medium: 'bg-amber-100 text-amber-800',
  Low: 'bg-blue-100 text-blue-800',
};

const statusColors: Record<string, string> = {
  Open: 'bg-red-100 text-red-800',
  Investigating: 'bg-amber-100 text-amber-800',
  Resolved: 'bg-emerald-100 text-emerald-800',
  Dismissed: 'bg-zinc-200 text-zinc-600',
};

const severityIcon = (s: AlertSeverity) => {
  if (s === 'Critical') return <WarningFilled size={16} className="text-red-600" />;
  if (s === 'High') return <WarningAlt size={16} className="text-red-500" />;
  if (s === 'Medium') return <WarningAlt size={16} className="text-amber-500" />;
  return <WarningAlt size={16} className="text-blue-500" />;
};

export function SecurityAlerts() {
  const [alerts] = useState(MOCK_ALERTS);
  const [search, setSearch] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [selected, setSelected] = useState<SecurityAlert | null>(null);

  const filtered = alerts.filter(a => {
    const q = search.toLowerCase();
    const matchSearch = a.title.toLowerCase().includes(q) || a.affectedUser.toLowerCase().includes(q) || a.description.toLowerCase().includes(q) || a.category.toLowerCase().includes(q);
    const matchSev = filterSeverity === 'All' || a.severity === filterSeverity;
    const matchStat = filterStatus === 'All' || a.status === filterStatus;
    return matchSearch && matchSev && matchStat;
  });

  const openCount = alerts.filter(a => a.status === 'Open').length;
  const investigatingCount = alerts.filter(a => a.status === 'Investigating').length;
  const criticalOpen = alerts.filter(a => a.severity === 'Critical' && (a.status === 'Open' || a.status === 'Investigating')).length;

  return (
    <div className="h-full flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-zinc-900">Security Alerts</h1>
          <p className="text-[14px] text-zinc-500 mt-1">Threat detection, anomaly alerts, and security incident management</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 border border-zinc-300 text-zinc-700 rounded-lg hover:bg-zinc-100 transition-colors text-[14px]">
          <Download size={16} /> Export Report
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white border border-zinc-200 rounded-xl p-4">
          <p className="text-[12px] text-zinc-500">Total Alerts</p>
          <p className="text-[24px] text-zinc-900 mt-1">{alerts.length}</p>
        </div>
        <div className="bg-white border border-red-200 rounded-xl p-4">
          <p className="text-[12px] text-red-600">Open</p>
          <p className="text-[24px] text-red-600 mt-1">{openCount}</p>
        </div>
        <div className="bg-white border border-amber-200 rounded-xl p-4">
          <p className="text-[12px] text-amber-600">Investigating</p>
          <p className="text-[24px] text-amber-600 mt-1">{investigatingCount}</p>
        </div>
        <div className="bg-white border border-red-300 rounded-xl p-4">
          <p className="text-[12px] text-red-700">Critical (Active)</p>
          <p className="text-[24px] text-red-700 mt-1">{criticalOpen}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 items-center">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input type="text" placeholder="Search alerts..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-zinc-200 rounded-lg text-[14px] text-zinc-900 placeholder:text-zinc-400 outline-none focus:ring-2 focus:ring-zinc-900/10" />
        </div>
        <select value={filterSeverity} onChange={e => setFilterSeverity(e.target.value)} className="px-3 py-2.5 bg-white border border-zinc-200 rounded-lg text-[14px] text-zinc-900 outline-none">
          <option value="All">All Severities</option>
          <option>Critical</option><option>High</option><option>Medium</option><option>Low</option>
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="px-3 py-2.5 bg-white border border-zinc-200 rounded-lg text-[14px] text-zinc-900 outline-none">
          <option value="All">All Statuses</option>
          <option>Open</option><option>Investigating</option><option>Resolved</option><option>Dismissed</option>
        </select>
      </div>

      {/* Alert List */}
      <div className="flex-1 overflow-auto space-y-3">
        {filtered.map(alert => (
          <div key={alert.id}
            className={`bg-white border rounded-xl p-5 cursor-pointer hover:shadow-md transition-all ${
              alert.status === 'Open' && alert.severity === 'Critical'
                ? 'border-red-300'
                : alert.status === 'Open'
                ? 'border-red-200'
                : 'border-zinc-200'
            }`}
            onClick={() => setSelected(alert)}>
            <div className="flex items-start gap-3">
              <div className="mt-0.5 shrink-0">{severityIcon(alert.severity)}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <p className="text-[15px] text-zinc-900">{alert.title}</p>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${severityColors[alert.severity]}`}>{alert.severity}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${statusColors[alert.status]}`}>{alert.status}</span>
                </div>
                <p className="text-[13px] text-zinc-500 line-clamp-2">{alert.description}</p>
                <div className="flex gap-4 mt-2 text-[12px] text-zinc-400">
                  <span>{alert.timestamp}</span>
                  <span>{alert.category}</span>
                  <span>{alert.affectedUser}</span>
                  <span className="font-mono">{alert.ip}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && <div className="p-10 text-center text-zinc-400 text-[14px]">No alerts match your filters</div>}
      </div>

      {/* Detail */}
      {selected && (
        <div className="fixed inset-0 bg-black/30 z-50 flex justify-end" onClick={() => setSelected(null)}>
          <div className="w-[560px] bg-white h-full shadow-xl overflow-auto" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-zinc-200 flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="mt-1 shrink-0">{severityIcon(selected.severity)}</div>
                <div>
                  <h2 className="text-zinc-900">{selected.title}</h2>
                  <p className="text-[13px] text-zinc-500 mt-0.5">{selected.timestamp}</p>
                </div>
              </div>
              <button onClick={() => setSelected(null)} className="p-1.5 hover:bg-zinc-100 rounded-lg shrink-0"><Close size={20} className="text-zinc-400" /></button>
            </div>
            <div className="p-6 space-y-5">
              <div className="flex gap-2 flex-wrap">
                <span className={`text-[11px] px-2.5 py-1 rounded-full ${severityColors[selected.severity]}`}>{selected.severity}</span>
                <span className={`text-[11px] px-2.5 py-1 rounded-full ${statusColors[selected.status]}`}>{selected.status}</span>
                <span className="text-[11px] px-2.5 py-1 rounded-full bg-zinc-100 text-zinc-700">{selected.category}</span>
              </div>

              <div>
                <p className="text-[12px] text-zinc-500 mb-1">Source</p>
                <p className="text-[14px] text-zinc-900">{selected.source}</p>
              </div>

              <div>
                <p className="text-[12px] text-zinc-500 mb-1">Affected User</p>
                <p className="text-[14px] text-zinc-900">{selected.affectedUser}</p>
              </div>

              <div>
                <p className="text-[12px] text-zinc-500 mb-1">IP Address</p>
                <p className="text-[14px] text-zinc-900 font-mono">{selected.ip}</p>
              </div>

              <div>
                <p className="text-[12px] text-zinc-500 mb-1">Description</p>
                <p className="text-[14px] text-zinc-900 leading-relaxed">{selected.description}</p>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="text-[12px] text-amber-700 mb-1">Recommendation</p>
                <p className="text-[14px] text-amber-900 leading-relaxed">{selected.recommendation}</p>
              </div>

              {selected.resolvedBy && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                  <p className="text-[12px] text-emerald-700 mb-1">Resolution</p>
                  <p className="text-[14px] text-emerald-900">Resolved by <span className="font-mono">{selected.resolvedBy}</span> at {selected.resolvedAt}</p>
                </div>
              )}

              {(selected.status === 'Open' || selected.status === 'Investigating') && (
                <div className="flex gap-3 pt-2">
                  <button className="flex-1 px-4 py-2.5 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors text-[14px] flex items-center justify-center gap-2">
                    <Renew size={16} /> Mark Investigating
                  </button>
                  <button className="flex-1 px-4 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-[14px] flex items-center justify-center gap-2">
                    <CheckmarkFilled size={16} /> Resolve
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
