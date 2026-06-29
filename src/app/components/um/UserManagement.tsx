import { useState } from 'react';
import { Search, Add, Close, Email, UserAvatar, TrashCan, Edit, ChevronRight, Time, Share, Query } from '@carbon/icons-react';

type UserStatus = 'Active' | 'Invited' | 'Suspended' | 'Deactivated';

interface AuditEntry {
  timestamp: string;
  action: string;
  resource: string;
  severity: 'Info' | 'Warning' | 'Error' | 'Critical';
}

interface SharedQuery {
  id: string;
  name: string;
  sharedBy: string;
  sharedAt: string;
  sharedVia: 'Direct' | 'Role';
  roleName?: string;
}

interface UserRecord {
  id: string;
  email: string;
  name: string;
  role: string;
  status: UserStatus;
  invitedAt: string;
  lastLogin: string;
  mfaEnabled: boolean;
  department: string;
  auditTrail: AuditEntry[];
  sharedQueries: SharedQuery[];
}

const MOCK_USERS: UserRecord[] = [
  {
    id: 'u-001', email: 'elena.rossi@pharma.com', name: 'Elena Rossi', role: 'Admin', status: 'Active',
    invitedAt: '2024-01-15', lastLogin: '2026-04-14 09:42', mfaEnabled: true, department: 'Clinical Operations',
    auditTrail: [
      { timestamp: '2026-04-14 09:42:18', action: 'CREATE_ENTITY', resource: 'Entity: patient_reported_outcomes', severity: 'Info' },
      { timestamp: '2026-04-14 09:05:18', action: 'CREATE_STUDY', resource: 'Project: Oncology Research Program', severity: 'Info' },
      { timestamp: '2026-04-13 16:30:00', action: 'MODIFY_VARIABLE', resource: 'Variable: AETERM in AE', severity: 'Warning' },
      { timestamp: '2026-04-13 11:15:00', action: 'EXPORT_DATA', resource: 'Study: ONCO-2024-001', severity: 'Info' },
      { timestamp: '2026-04-12 14:20:00', action: 'EXECUTE_QUERY', resource: 'Query: Patient Demographics', severity: 'Info' },
    ],
    sharedQueries: [
      { id: 'sq-1', name: 'Adverse Events Summary by Site', sharedBy: 'hans.muller@clz.ch', sharedAt: '2026-04-10', sharedVia: 'Direct' },
      { id: 'sq-2', name: 'Lab Values Out of Range', sharedBy: 'system', sharedAt: '2026-04-01', sharedVia: 'Role', roleName: 'Admin' },
      { id: 'sq-3', name: 'Patient Enrollment Trend', sharedBy: 'sarah.williams@medpath.co.uk', sharedAt: '2026-03-22', sharedVia: 'Direct' },
    ],
  },
  {
    id: 'u-002', email: 'hans.muller@clz.ch', name: 'Hans Müller', role: 'Data Manager', status: 'Active',
    invitedAt: '2024-03-01', lastLogin: '2026-04-14 09:38', mfaEnabled: true, department: 'Biostatistics',
    auditTrail: [
      { timestamp: '2026-04-14 09:38:05', action: 'EXPORT_DATA', resource: 'Study: ONCO-2024-001 (SDTM)', severity: 'Info' },
      { timestamp: '2026-04-13 22:15:33', action: 'EXPORT_DATA', resource: 'Bulk export: DM, AE, LB', severity: 'Warning' },
      { timestamp: '2026-04-13 10:00:00', action: 'EXECUTE_QUERY', resource: 'Query: AE Severity Distribution', severity: 'Info' },
    ],
    sharedQueries: [
      { id: 'sq-4', name: 'Lab Values Out of Range', sharedBy: 'system', sharedAt: '2026-04-01', sharedVia: 'Role', roleName: 'Data Manager' },
      { id: 'sq-5', name: 'SDTM Domain Completeness', sharedBy: 'elena.rossi@pharma.com', sharedAt: '2026-03-15', sharedVia: 'Direct' },
    ],
  },
  {
    id: 'u-003', email: 'sarah.williams@medpath.co.uk', name: 'Sarah Williams', role: 'Data Manager', status: 'Active',
    invitedAt: '2024-06-12', lastLogin: '2026-04-14 09:30', mfaEnabled: true, department: 'Data Management',
    auditTrail: [
      { timestamp: '2026-04-14 09:35:22', action: 'MODIFY_VARIABLE', resource: 'Variable: AESEV codelist change', severity: 'Warning' },
      { timestamp: '2026-04-13 14:10:00', action: 'CREATE_ENTITY', resource: 'Entity: concomitant_meds', severity: 'Info' },
    ],
    sharedQueries: [
      { id: 'sq-6', name: 'Lab Values Out of Range', sharedBy: 'system', sharedAt: '2026-04-01', sharedVia: 'Role', roleName: 'Data Manager' },
    ],
  },
  {
    id: 'u-004', email: 'klaus.weber@bioanalytica.de', name: 'Klaus Weber', role: 'Analyst', status: 'Active',
    invitedAt: '2025-01-20', lastLogin: '2026-04-14 09:22', mfaEnabled: true, department: 'Laboratory',
    auditTrail: [
      { timestamp: '2026-04-14 09:22:47', action: 'EXECUTE_QUERY', resource: 'Query: AE by Severity', severity: 'Info' },
      { timestamp: '2026-04-13 15:00:00', action: 'EXECUTE_QUERY', resource: 'Query: Lab Panel Results', severity: 'Info' },
    ],
    sharedQueries: [
      { id: 'sq-7', name: 'Lab Panel Results by Visit', sharedBy: 'hans.muller@clz.ch', sharedAt: '2026-04-05', sharedVia: 'Direct' },
      { id: 'sq-8', name: 'Biomarker Trend Analysis', sharedBy: 'system', sharedAt: '2026-04-01', sharedVia: 'Role', roleName: 'Analyst' },
    ],
  },
  {
    id: 'u-005', email: 'maria.bianchi@hsr.it', name: 'Maria Bianchi', role: 'Viewer', status: 'Active',
    invitedAt: '2025-03-10', lastLogin: '2026-04-14 08:48', mfaEnabled: true, department: 'Clinical Research',
    auditTrail: [
      { timestamp: '2026-04-14 08:48:33', action: 'LOGIN', resource: 'iPad Pro / Safari', severity: 'Info' },
      { timestamp: '2026-04-13 09:00:00', action: 'VIEW_DASHBOARD', resource: 'Data Lake Report', severity: 'Info' },
    ],
    sharedQueries: [
      { id: 'sq-9', name: 'Patient Enrollment Trend', sharedBy: 'elena.rossi@pharma.com', sharedAt: '2026-03-20', sharedVia: 'Direct' },
    ],
  },
  {
    id: 'u-006', email: 'thomas.meier@charite.de', name: 'Thomas Meier', role: 'Data Manager', status: 'Active',
    invitedAt: '2024-09-05', lastLogin: '2026-04-14 08:40', mfaEnabled: true, department: 'Cardiology',
    auditTrail: [
      { timestamp: '2026-04-14 08:40:29', action: 'SHARE_DATASET', resource: 'Study: CHR-CARDIO-01', severity: 'Info' },
      { timestamp: '2026-04-14 08:30:00', action: 'PASSWORD_CHANGE', resource: 'Self-service', severity: 'Warning' },
    ],
    sharedQueries: [
      { id: 'sq-10', name: 'Cardio Vitals Weekly Summary', sharedBy: 'elena.rossi@pharma.com', sharedAt: '2026-04-08', sharedVia: 'Direct' },
      { id: 'sq-11', name: 'Lab Values Out of Range', sharedBy: 'system', sharedAt: '2026-04-01', sharedVia: 'Role', roleName: 'Data Manager' },
    ],
  },
  {
    id: 'u-007', email: 'wei.tan@brs.sg', name: 'Wei Tan', role: 'Viewer', status: 'Suspended',
    invitedAt: '2025-06-01', lastLogin: '2026-04-14 08:15', mfaEnabled: false, department: 'Regulatory',
    auditTrail: [
      { timestamp: '2026-04-14 08:15:22', action: 'LOGIN_FAILED', resource: 'Account locked (5 attempts)', severity: 'Error' },
    ],
    sharedQueries: [],
  },
  {
    id: 'u-008', email: 'pierre.lambert@sbp.ch', name: 'Pierre Lambert', role: 'Analyst', status: 'Active',
    invitedAt: '2025-02-15', lastLogin: '2026-04-14 07:50', mfaEnabled: true, department: 'Biobanking',
    auditTrail: [
      { timestamp: '2026-04-14 08:10:44', action: 'UPDATE_BIOBANK', resource: 'Biobank: Swiss Biobanking Platform', severity: 'Info' },
    ],
    sharedQueries: [
      { id: 'sq-12', name: 'Sample Inventory Report', sharedBy: 'elena.rossi@pharma.com', sharedAt: '2026-04-02', sharedVia: 'Direct' },
      { id: 'sq-13', name: 'Biomarker Trend Analysis', sharedBy: 'system', sharedAt: '2026-04-01', sharedVia: 'Role', roleName: 'Analyst' },
    ],
  },
  {
    id: 'u-009', email: 'jan.devries@genomescan.nl', name: 'Jan de Vries', role: 'API User', status: 'Active',
    invitedAt: '2025-04-22', lastLogin: '2026-04-14 09:10', mfaEnabled: false, department: 'Genomics',
    auditTrail: [
      { timestamp: '2026-04-14 09:10:05', action: 'API_CALL', resource: 'Endpoint: /api/export (API Key)', severity: 'Info' },
      { timestamp: '2026-04-13 11:05:44', action: 'API_CALL_FAILED', resource: 'Expired API key GS-API-2023-12', severity: 'Error' },
    ],
    sharedQueries: [],
  },
  {
    id: 'u-010', email: 'lisa.chen@novagen.com', name: 'Lisa Chen', role: 'Data Manager', status: 'Invited',
    invitedAt: '2026-04-13', lastLogin: '—', mfaEnabled: false, department: 'Data Science',
    auditTrail: [],
    sharedQueries: [
      { id: 'sq-14', name: 'SDTM Domain Completeness', sharedBy: 'elena.rossi@pharma.com', sharedAt: '2026-04-13', sharedVia: 'Direct' },
    ],
  },
];

const statusColors: Record<string, string> = {
  Active: 'bg-emerald-100 text-emerald-800',
  Invited: 'bg-blue-100 text-blue-800',
  Suspended: 'bg-red-100 text-red-800',
  Deactivated: 'bg-zinc-200 text-zinc-600',
};

const roleColors: Record<string, string> = {
  Admin: 'bg-violet-100 text-violet-800',
  'Data Manager': 'bg-cyan-100 text-cyan-800',
  Analyst: 'bg-indigo-100 text-indigo-800',
  Viewer: 'bg-zinc-200 text-zinc-600',
  'API User': 'bg-amber-100 text-amber-800',
};

const sevColors: Record<string, string> = {
  Info: 'bg-blue-100 text-blue-800',
  Warning: 'bg-amber-100 text-amber-800',
  Error: 'bg-red-100 text-red-800',
  Critical: 'bg-red-200 text-red-900',
};

const ROLES = ['Admin', 'Data Manager', 'Analyst', 'Viewer', 'API User'];

export function UserManagement() {
  const [users, setUsers] = useState(MOCK_USERS);
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [selected, setSelected] = useState<UserRecord | null>(null);
  const [detailTab, setDetailTab] = useState<'info' | 'audit' | 'queries'>('info');
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('Viewer');
  const [inviteDept, setInviteDept] = useState('');

  const filtered = users.filter(u => {
    const q = search.toLowerCase();
    const matchSearch = u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.department.toLowerCase().includes(q);
    const matchRole = filterRole === 'All' || u.role === filterRole;
    const matchStatus = filterStatus === 'All' || u.status === filterStatus;
    return matchSearch && matchRole && matchStatus;
  });

  const handleInvite = () => {
    if (!inviteEmail.trim()) return;
    const newUser: UserRecord = {
      id: `u-${Date.now()}`,
      email: inviteEmail.trim(),
      name: inviteEmail.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
      role: inviteRole,
      status: 'Invited',
      invitedAt: new Date().toISOString().split('T')[0],
      lastLogin: '—',
      mfaEnabled: false,
      department: inviteDept || 'Unassigned',
      auditTrail: [],
      sharedQueries: [],
    };
    setUsers([newUser, ...users]);
    setInviteEmail('');
    setInviteRole('Viewer');
    setInviteDept('');
    setShowInvite(false);
  };

  return (
    <div className="h-full flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-zinc-900">User Management</h1>
          <p className="text-[14px] text-zinc-500 mt-1">Manage platform users, invite new members, and review activity</p>
        </div>
        <button onClick={() => setShowInvite(true)} className="flex items-center gap-2 px-4 py-2.5 bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 transition-colors text-[14px]">
          <Add size={16} /> Invite User
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-5 gap-3">
        {(['Active', 'Invited', 'Suspended', 'Deactivated'] as UserStatus[]).map(s => (
          <div key={s} className="bg-white border border-zinc-200 rounded-xl px-4 py-3">
            <p className="text-[12px] text-zinc-500">{s}</p>
            <p className="text-[20px] text-zinc-900 mt-0.5">{users.filter(u => u.status === s).length}</p>
          </div>
        ))}
        <div className="bg-white border border-zinc-200 rounded-xl px-4 py-3">
          <p className="text-[12px] text-zinc-500">Total</p>
          <p className="text-[20px] text-zinc-900 mt-0.5">{users.length}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 items-center">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input type="text" placeholder="Search by name, email, department..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-zinc-200 rounded-lg text-[14px] text-zinc-900 placeholder:text-zinc-400 outline-none focus:ring-2 focus:ring-zinc-900/10" />
        </div>
        <select value={filterRole} onChange={e => setFilterRole(e.target.value)} className="px-3 py-2.5 bg-white border border-zinc-200 rounded-lg text-[14px] text-zinc-900 outline-none">
          <option value="All">All Roles</option>
          {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="px-3 py-2.5 bg-white border border-zinc-200 rounded-lg text-[14px] text-zinc-900 outline-none">
          <option value="All">All Statuses</option>
          <option>Active</option><option>Invited</option><option>Suspended</option><option>Deactivated</option>
        </select>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto bg-white border border-zinc-200 rounded-xl">
        <table className="w-full">
          <thead>
            <tr className="border-b border-zinc-200">
              {['User', 'Email', 'Role', 'Department', 'Status', 'Last Login', 'MFA', ''].map(h => (
                <th key={h} className="text-left px-4 py-3 text-[12px] text-zinc-500 whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(u => (
              <tr key={u.id} className="border-b last:border-b-0 border-zinc-100 hover:bg-zinc-50 cursor-pointer transition-colors" onClick={() => { setSelected(u); setDetailTab('info'); }}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-zinc-200 flex items-center justify-center text-[12px] text-zinc-600 shrink-0">
                      {u.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    <span className="text-[14px] text-zinc-900">{u.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-[13px] text-zinc-500">{u.email}</td>
                <td className="px-4 py-3"><span className={`text-[11px] px-2 py-0.5 rounded-full ${roleColors[u.role] || 'bg-zinc-200 text-zinc-600'}`}>{u.role}</span></td>
                <td className="px-4 py-3 text-[13px] text-zinc-500">{u.department}</td>
                <td className="px-4 py-3"><span className={`text-[11px] px-2 py-0.5 rounded-full ${statusColors[u.status]}`}>{u.status}</span></td>
                <td className="px-4 py-3 text-[12px] text-zinc-400 font-mono">{u.lastLogin}</td>
                <td className="px-4 py-3 text-[12px]">{u.mfaEnabled ? <span className="text-emerald-600">Enabled</span> : <span className="text-zinc-400">Off</span>}</td>
                <td className="px-4 py-3"><ChevronRight size={16} className="text-zinc-300" /></td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <div className="p-10 text-center text-zinc-400 text-[14px]">No users found</div>}
      </div>

      {/* Invite Modal */}
      {showInvite && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center" onClick={() => setShowInvite(false)}>
          <div className="bg-white rounded-2xl shadow-xl w-[480px] overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-zinc-200 flex items-center justify-between">
              <h2 className="text-zinc-900">Invite New User</h2>
              <button onClick={() => setShowInvite(false)} className="p-1.5 hover:bg-zinc-100 rounded-lg"><Close size={20} className="text-zinc-400" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-[12px] text-zinc-500 mb-1.5 block">Email Address *</label>
                <div className="relative">
                  <Email size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input type="email" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} placeholder="user@organization.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-zinc-200 rounded-lg text-[14px] text-zinc-900 placeholder:text-zinc-400 outline-none focus:ring-2 focus:ring-zinc-900/10" />
                </div>
              </div>
              <div>
                <label className="text-[12px] text-zinc-500 mb-1.5 block">Role *</label>
                <select value={inviteRole} onChange={e => setInviteRole(e.target.value)}
                  className="w-full px-3 py-2.5 bg-white border border-zinc-200 rounded-lg text-[14px] text-zinc-900 outline-none">
                  {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[12px] text-zinc-500 mb-1.5 block">Department</label>
                <input type="text" value={inviteDept} onChange={e => setInviteDept(e.target.value)} placeholder="e.g. Clinical Operations"
                  className="w-full px-4 py-2.5 bg-white border border-zinc-200 rounded-lg text-[14px] text-zinc-900 placeholder:text-zinc-400 outline-none focus:ring-2 focus:ring-zinc-900/10" />
              </div>
              <p className="text-[12px] text-zinc-400">An invitation email will be sent with a link to set up their account and configure MFA.</p>
            </div>
            <div className="p-6 border-t border-zinc-200 flex justify-end gap-3">
              <button onClick={() => setShowInvite(false)} className="px-4 py-2.5 border border-zinc-300 text-zinc-700 rounded-lg hover:bg-zinc-100 transition-colors text-[14px]">Cancel</button>
              <button onClick={handleInvite} className="px-4 py-2.5 bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 transition-colors text-[14px] flex items-center gap-2">
                <Email size={16} /> Send Invitation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Detail Panel */}
      {selected && (
        <div className="fixed inset-0 bg-black/30 z-50 flex justify-end" onClick={() => setSelected(null)}>
          <div className="w-[600px] bg-white h-full shadow-xl overflow-auto" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="p-6 border-b border-zinc-200 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-zinc-200 flex items-center justify-center text-[16px] text-zinc-600">
                  {selected.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <div>
                  <h2 className="text-zinc-900">{selected.name}</h2>
                  <p className="text-[13px] text-zinc-500">{selected.email}</p>
                </div>
              </div>
              <button onClick={() => setSelected(null)} className="p-1.5 hover:bg-zinc-100 rounded-lg"><Close size={20} className="text-zinc-400" /></button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-zinc-200">
              {([['info', 'Profile'], ['audit', 'Audit Trail'], ['queries', 'Shared Queries']] as const).map(([key, label]) => (
                <button key={key} onClick={() => setDetailTab(key)}
                  className={`px-5 py-3 text-[13px] border-b-2 transition-colors ${detailTab === key
                    ? 'border-zinc-900 text-zinc-900'
                    : 'border-transparent text-zinc-400 hover:text-zinc-600'
                  }`}>
                  {label}
                  {key === 'audit' && <span className="ml-1.5 text-[11px] bg-zinc-100 px-1.5 py-0.5 rounded-full">{selected.auditTrail.length}</span>}
                  {key === 'queries' && <span className="ml-1.5 text-[11px] bg-zinc-100 px-1.5 py-0.5 rounded-full">{selected.sharedQueries.length}</span>}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {detailTab === 'info' && (
                <div className="space-y-4">
                  <div className="flex gap-2 flex-wrap mb-4">
                    <span className={`text-[11px] px-2.5 py-1 rounded-full ${roleColors[selected.role] || 'bg-zinc-200 text-zinc-600'}`}>{selected.role}</span>
                    <span className={`text-[11px] px-2.5 py-1 rounded-full ${statusColors[selected.status]}`}>{selected.status}</span>
                    {selected.mfaEnabled && <span className="text-[11px] px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">MFA Enabled</span>}
                  </div>
                  {[
                    { label: 'Email', value: selected.email },
                    { label: 'Department', value: selected.department },
                    { label: 'Role', value: selected.role },
                    { label: 'Invited On', value: selected.invitedAt },
                    { label: 'Last Login', value: selected.lastLogin },
                    { label: 'MFA', value: selected.mfaEnabled ? 'Enabled (Authenticator App)' : 'Not configured' },
                  ].map(f => (
                    <div key={f.label}>
                      <p className="text-[12px] text-zinc-500 mb-1">{f.label}</p>
                      <p className="text-[14px] text-zinc-900">{f.value}</p>
                    </div>
                  ))}

                  <div className="flex gap-3 pt-4 border-t border-zinc-200">
                    <button className="flex-1 px-3 py-2 border border-zinc-300 text-zinc-700 rounded-lg hover:bg-zinc-100 transition-colors text-[13px] flex items-center justify-center gap-2">
                      <Edit size={14} /> Edit User
                    </button>
                    {selected.status === 'Active' ? (
                      <button className="flex-1 px-3 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors text-[13px] flex items-center justify-center gap-2">
                        Suspend
                      </button>
                    ) : selected.status === 'Suspended' ? (
                      <button className="flex-1 px-3 py-2 border border-emerald-300 text-emerald-600 rounded-lg hover:bg-emerald-50 transition-colors text-[13px] flex items-center justify-center gap-2">
                        Reactivate
                      </button>
                    ) : null}
                  </div>
                </div>
              )}

              {detailTab === 'audit' && (
                <div className="space-y-3">
                  {selected.auditTrail.length === 0 && <p className="text-[14px] text-zinc-400 text-center py-8">No audit trail recorded yet</p>}
                  {selected.auditTrail.map((a, i) => (
                    <div key={i} className="flex gap-3 items-start">
                      <div className="w-2 h-2 rounded-full bg-zinc-300 mt-2 shrink-0" />
                      <div className="flex-1 bg-zinc-50 rounded-lg p-3 border border-zinc-100">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-[13px] text-zinc-900">{a.action}</span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${sevColors[a.severity]}`}>{a.severity}</span>
                        </div>
                        <p className="text-[13px] text-zinc-600">{a.resource}</p>
                        <p className="text-[11px] text-zinc-400 mt-1 flex items-center gap-1"><Time size={12} />{a.timestamp}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {detailTab === 'queries' && (
                <div className="space-y-3">
                  {selected.sharedQueries.length === 0 && <p className="text-[14px] text-zinc-400 text-center py-8">No queries shared with this user</p>}
                  {selected.sharedQueries.map(q => (
                    <div key={q.id} className="bg-zinc-50 border border-zinc-100 rounded-lg p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-[14px] text-zinc-900 flex items-center gap-2">
                            <Query size={14} className="text-zinc-400 shrink-0" />
                            {q.name}
                          </p>
                          <p className="text-[12px] text-zinc-500 mt-1">
                            Shared by <span className="text-zinc-700">{q.sharedBy}</span> on {q.sharedAt}
                          </p>
                        </div>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full shrink-0 ${q.sharedVia === 'Role'
                          ? 'bg-violet-100 text-violet-800'
                          : 'bg-sky-100 text-sky-800'
                        }`}>
                          {q.sharedVia === 'Role' ? `Via role: ${q.roleName}` : 'Direct'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
