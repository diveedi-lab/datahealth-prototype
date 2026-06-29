import { useState } from 'react';
import { Search, Add, Close, Edit, TrashCan, Checkmark, Subtract, ChevronDown, ChevronRight, Share, Query } from '@carbon/icons-react';

type PermLevel = 'full' | 'read' | 'none';

interface Permission {
  section: string;
  subSections: { name: string; level: PermLevel }[];
}

interface SharedQueryForRole {
  id: string;
  name: string;
  sharedBy: string;
  sharedAt: string;
}

interface RoleRecord {
  id: string;
  name: string;
  description: string;
  usersCount: number;
  isSystem: boolean;
  createdAt: string;
  permissions: Permission[];
  sharedQueries: SharedQueryForRole[];
}

const SECTIONS = [
  { section: 'Dashboard', subs: ['Data Lake Report', 'Sharing Summary', 'Data Dashboard'] },
  { section: 'Query Tool', subs: ['New Query', 'Data Explorer', 'Saved Queries', 'History'] },
  { section: 'Ingestor', subs: ['Database', 'Connectors', 'File Uploader'] },
  { section: 'Data Manager', subs: ['Projects & Studies', 'Entities', 'Variables', 'Laboratory', 'Biobank'] },
  { section: 'Audit', subs: ['Operation Logs', 'Access Logs', 'Security Alerts'] },
  { section: 'User Manager', subs: ['User Management', 'Workgroups', 'Roles & Permissions'] },
];

const makePerms = (defaultLevel: PermLevel, overrides?: Record<string, Record<string, PermLevel>>): Permission[] =>
  SECTIONS.map(s => ({
    section: s.section,
    subSections: s.subs.map(sub => ({
      name: sub,
      level: overrides?.[s.section]?.[sub] ?? defaultLevel,
    })),
  }));

const MOCK_ROLES: RoleRecord[] = [
  {
    id: 'r-001', name: 'Admin', description: 'Full platform access with user management and configuration capabilities', usersCount: 1, isSystem: true, createdAt: '2024-01-01',
    permissions: makePerms('full'),
    sharedQueries: [
      { id: 'rq-1', name: 'Lab Values Out of Range', sharedBy: 'system', sharedAt: '2026-04-01' },
      { id: 'rq-2', name: 'Platform Usage Statistics', sharedBy: 'system', sharedAt: '2026-04-01' },
    ],
  },
  {
    id: 'r-002', name: 'Data Manager', description: 'Manage data entities, variables, studies, and perform imports/exports', usersCount: 4, isSystem: true, createdAt: '2024-01-01',
    permissions: makePerms('read', {
      'Query Tool': { 'New Query': 'full', 'Data Explorer': 'full', 'Saved Queries': 'full', 'History': 'full' },
      'Ingestor': { 'Database': 'full', 'Connectors': 'full', 'File Uploader': 'full' },
      'Data Manager': { 'Projects & Studies': 'full', 'Entities': 'full', 'Variables': 'full', 'Laboratory': 'full', 'Biobank': 'full' },
      'User Manager': { 'User Management': 'none', 'Workgroups': 'none', 'Roles & Permissions': 'none' },
    }),
    sharedQueries: [
      { id: 'rq-3', name: 'Lab Values Out of Range', sharedBy: 'system', sharedAt: '2026-04-01' },
      { id: 'rq-4', name: 'SDTM Domain Completeness', sharedBy: 'elena.rossi@pharma.com', sharedAt: '2026-03-15' },
    ],
  },
  {
    id: 'r-003', name: 'Analyst', description: 'Run queries, explore data, and view dashboards. No write access to data definitions.', usersCount: 2, isSystem: true, createdAt: '2024-01-01',
    permissions: makePerms('read', {
      'Query Tool': { 'New Query': 'full', 'Data Explorer': 'full', 'Saved Queries': 'full', 'History': 'full' },
      'Ingestor': { 'Database': 'none', 'Connectors': 'none', 'File Uploader': 'none' },
      'User Manager': { 'User Management': 'none', 'Workgroups': 'none', 'Roles & Permissions': 'none' },
    }),
    sharedQueries: [
      { id: 'rq-5', name: 'Biomarker Trend Analysis', sharedBy: 'system', sharedAt: '2026-04-01' },
    ],
  },
  {
    id: 'r-004', name: 'Viewer', description: 'Read-only access to dashboards and reports. Cannot create or modify data.', usersCount: 2, isSystem: true, createdAt: '2024-01-01',
    permissions: makePerms('none', {
      'Dashboard': { 'Data Lake Report': 'read', 'Sharing Summary': 'read', 'Data Dashboard': 'read' },
    }),
    sharedQueries: [],
  },
  {
    id: 'r-005', name: 'API User', description: 'Programmatic access via API keys for automated integrations and ETL pipelines', usersCount: 1, isSystem: true, createdAt: '2024-01-01',
    permissions: makePerms('none', {
      'Query Tool': { 'New Query': 'full', 'Data Explorer': 'read', 'Saved Queries': 'read', 'History': 'read' },
      'Ingestor': { 'Database': 'read', 'Connectors': 'read', 'File Uploader': 'full' },
    }),
    sharedQueries: [],
  },
  {
    id: 'r-006', name: 'Lab Coordinator', description: 'Manage laboratory and biobank records. Read access to studies and variables.', usersCount: 0, isSystem: false, createdAt: '2026-02-10',
    permissions: makePerms('none', {
      'Dashboard': { 'Data Lake Report': 'read', 'Sharing Summary': 'read', 'Data Dashboard': 'read' },
      'Data Manager': { 'Projects & Studies': 'read', 'Entities': 'read', 'Variables': 'read', 'Laboratory': 'full', 'Biobank': 'full' },
    }),
    sharedQueries: [
      { id: 'rq-6', name: 'Sample Inventory Report', sharedBy: 'elena.rossi@pharma.com', sharedAt: '2026-04-02' },
    ],
  },
];

const permLevelIcon = (level: PermLevel) => {
  if (level === 'full') return <Checkmark size={14} className="text-emerald-600" />;
  if (level === 'read') return <Subtract size={14} className="text-amber-500" />;
  return <Close size={14} className="text-zinc-300" />;
};

const permLevelLabel = (level: PermLevel) => {
  if (level === 'full') return 'Full Access';
  if (level === 'read') return 'Read Only';
  return 'No Access';
};

const permLevelColor = (level: PermLevel) => {
  if (level === 'full') return 'bg-emerald-100 text-emerald-800';
  if (level === 'read') return 'bg-amber-100 text-amber-800';
  return 'bg-zinc-100 text-zinc-500';
};

const roleColors: Record<string, string> = {
  Admin: 'bg-violet-100 text-violet-800',
  'Data Manager': 'bg-cyan-100 text-cyan-800',
  Analyst: 'bg-indigo-100 text-indigo-800',
  Viewer: 'bg-zinc-200 text-zinc-600',
  'API User': 'bg-amber-100 text-amber-800',
  'Lab Coordinator': 'bg-teal-100 text-teal-800',
};

export function RolesPermissions() {
  const [roles, setRoles] = useState(MOCK_ROLES);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<RoleRecord | null>(null);
  const [detailTab, setDetailTab] = useState<'permissions' | 'queries'>('permissions');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newPerms, setNewPerms] = useState<Permission[]>(makePerms('none'));

  const filtered = roles.filter(r => r.name.toLowerCase().includes(search.toLowerCase()) || r.description.toLowerCase().includes(search.toLowerCase()));

  const toggleSection = (s: string) => {
    const next = new Set(expandedSections);
    if (next.has(s)) next.delete(s); else next.add(s);
    setExpandedSections(next);
  };

  const handleCreateRole = () => {
    if (!newName.trim()) return;
    const nr: RoleRecord = {
      id: `r-${Date.now()}`, name: newName.trim(), description: newDesc.trim(), usersCount: 0, isSystem: false,
      createdAt: new Date().toISOString().split('T')[0], permissions: newPerms, sharedQueries: [],
    };
    setRoles([...roles, nr]);
    setNewName(''); setNewDesc(''); setNewPerms(makePerms('none')); setShowCreate(false);
  };

  const cyclePermLevel = (sectionIdx: number, subIdx: number) => {
    const copy = newPerms.map((p, pi) => pi === sectionIdx ? {
      ...p, subSections: p.subSections.map((s, si) => si === subIdx ? { ...s, level: (s.level === 'none' ? 'read' : s.level === 'read' ? 'full' : 'none') as PermLevel } : s)
    } : p);
    setNewPerms(copy);
  };

  return (
    <div className="h-full flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-zinc-900">Roles & Permissions</h1>
          <p className="text-[14px] text-zinc-500 mt-1">Define roles with fine-grained access control across all platform sections</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 px-4 py-2.5 bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 transition-colors text-[14px]">
          <Add size={16} /> Create Role
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
        <input type="text" placeholder="Search roles..." value={search} onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-zinc-200 rounded-lg text-[14px] text-zinc-900 placeholder:text-zinc-400 outline-none focus:ring-2 focus:ring-zinc-900/10" />
      </div>

      {/* Role Cards */}
      <div className="flex-1 overflow-auto grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filtered.map(role => (
          <div key={role.id}
            className="bg-white border border-zinc-200 rounded-xl p-5 hover:shadow-md transition-all cursor-pointer hover:border-zinc-300"
            onClick={() => { setSelected(role); setDetailTab('permissions'); setExpandedSections(new Set()); }}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[11px] px-2 py-0.5 rounded-full ${roleColors[role.name] || 'bg-zinc-200 text-zinc-600'}`}>{role.name}</span>
                  {role.isSystem && <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-500">System</span>}
                </div>
                <p className="text-[13px] text-zinc-500 mt-1">{role.description}</p>
              </div>
              <ChevronRight size={16} className="text-zinc-300 shrink-0 mt-1" />
            </div>
            <div className="flex gap-4 text-[12px] text-zinc-400">
              <span>{role.usersCount} user{role.usersCount !== 1 ? 's' : ''}</span>
              <span>Created {role.createdAt}</span>
              {role.sharedQueries.length > 0 && <span>{role.sharedQueries.length} shared queries</span>}
            </div>
            {/* Permission summary row */}
            <div className="flex flex-wrap gap-1.5 mt-3">
              {role.permissions.map(p => {
                const hasAccess = p.subSections.some(s => s.level !== 'none');
                const allFull = p.subSections.every(s => s.level === 'full');
                return (
                  <span key={p.section} className={`text-[10px] px-2 py-0.5 rounded-full ${
                    allFull ? 'bg-emerald-100 text-emerald-700'
                    : hasAccess ? 'bg-amber-100 text-amber-700'
                    : 'bg-zinc-100 text-zinc-400'
                  }`}>{p.section}</span>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Create Role Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center" onClick={() => setShowCreate(false)}>
          <div className="bg-white rounded-2xl shadow-xl w-[640px] max-h-[85vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-zinc-200 flex items-center justify-between shrink-0">
              <h2 className="text-zinc-900">Create New Role</h2>
              <button onClick={() => setShowCreate(false)} className="p-1.5 hover:bg-zinc-100 rounded-lg"><Close size={20} className="text-zinc-400" /></button>
            </div>
            <div className="p-6 space-y-4 overflow-auto flex-1">
              <div>
                <label className="text-[12px] text-zinc-500 mb-1.5 block">Role Name *</label>
                <input type="text" value={newName} onChange={e => setNewName(e.target.value)} placeholder="e.g. Site Monitor"
                  className="w-full px-4 py-2.5 bg-white border border-zinc-200 rounded-lg text-[14px] text-zinc-900 placeholder:text-zinc-400 outline-none" />
              </div>
              <div>
                <label className="text-[12px] text-zinc-500 mb-1.5 block">Description</label>
                <input type="text" value={newDesc} onChange={e => setNewDesc(e.target.value)} placeholder="Describe the role purpose"
                  className="w-full px-4 py-2.5 bg-white border border-zinc-200 rounded-lg text-[14px] text-zinc-900 placeholder:text-zinc-400 outline-none" />
              </div>
              <div>
                <label className="text-[12px] text-zinc-500 mb-3 block">Permissions — Click to cycle: None → Read → Full</label>
                <div className="space-y-2">
                  {newPerms.map((p, pi) => (
                    <div key={p.section} className="border border-zinc-200 rounded-lg overflow-hidden">
                      <div className="px-4 py-2.5 bg-zinc-50 text-[13px] text-zinc-700">{p.section}</div>
                      <div className="divide-y divide-zinc-100">
                        {p.subSections.map((sub, si) => (
                          <div key={sub.name} className="flex items-center justify-between px-4 py-2 cursor-pointer hover:bg-zinc-50 transition-colors" onClick={() => cyclePermLevel(pi, si)}>
                            <span className="text-[13px] text-zinc-600">{sub.name}</span>
                            <span className={`text-[11px] px-2.5 py-0.5 rounded-full flex items-center gap-1.5 ${permLevelColor(sub.level)}`}>
                              {permLevelIcon(sub.level)} {permLevelLabel(sub.level)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-zinc-200 flex justify-end gap-3 shrink-0">
              <button onClick={() => setShowCreate(false)} className="px-4 py-2.5 border border-zinc-300 text-zinc-700 rounded-lg hover:bg-zinc-100 transition-colors text-[14px]">Cancel</button>
              <button onClick={handleCreateRole} className="px-4 py-2.5 bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 transition-colors text-[14px]">Create Role</button>
            </div>
          </div>
        </div>
      )}

      {/* Role Detail Panel */}
      {selected && (
        <div className="fixed inset-0 bg-black/30 z-50 flex justify-end" onClick={() => setSelected(null)}>
          <div className="w-[580px] bg-white h-full shadow-xl overflow-auto" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-zinc-200 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-zinc-900">{selected.name}</h2>
                  {selected.isSystem && <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-500">System</span>}
                </div>
                <p className="text-[13px] text-zinc-500">{selected.description}</p>
                <p className="text-[12px] text-zinc-400 mt-1">{selected.usersCount} users · Created {selected.createdAt}</p>
              </div>
              <button onClick={() => setSelected(null)} className="p-1.5 hover:bg-zinc-100 rounded-lg"><Close size={20} className="text-zinc-400" /></button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-zinc-200">
              {([['permissions', 'Permissions'], ['queries', 'Shared Queries']] as const).map(([key, label]) => (
                <button key={key} onClick={() => setDetailTab(key)}
                  className={`px-5 py-3 text-[13px] border-b-2 transition-colors ${detailTab === key
                    ? 'border-zinc-900 text-zinc-900'
                    : 'border-transparent text-zinc-400 hover:text-zinc-600'
                  }`}>
                  {label}
                  {key === 'queries' && <span className="ml-1.5 text-[11px] bg-zinc-100 px-1.5 py-0.5 rounded-full">{selected.sharedQueries.length}</span>}
                </button>
              ))}
            </div>

            <div className="p-6">
              {detailTab === 'permissions' && (
                <div className="space-y-2">
                  {selected.permissions.map(p => {
                    const isExpanded = expandedSections.has(p.section);
                    const allFull = p.subSections.every(s => s.level === 'full');
                    const allNone = p.subSections.every(s => s.level === 'none');
                    return (
                      <div key={p.section} className="border border-zinc-200 rounded-lg overflow-hidden">
                        <button className="w-full flex items-center justify-between px-4 py-3 hover:bg-zinc-50 transition-colors" onClick={() => toggleSection(p.section)}>
                          <div className="flex items-center gap-2">
                            {isExpanded ? <ChevronDown size={14} className="text-zinc-400" /> : <ChevronRight size={14} className="text-zinc-400" />}
                            <span className="text-[14px] text-zinc-900">{p.section}</span>
                          </div>
                          <span className={`text-[11px] px-2 py-0.5 rounded-full ${allFull ? 'bg-emerald-100 text-emerald-700' : allNone ? 'bg-zinc-100 text-zinc-400' : 'bg-amber-100 text-amber-700'}`}>
                            {allFull ? 'Full Access' : allNone ? 'No Access' : 'Partial'}
                          </span>
                        </button>
                        {isExpanded && (
                          <div className="border-t border-zinc-100 divide-y divide-zinc-100">
                            {p.subSections.map(sub => (
                              <div key={sub.name} className="flex items-center justify-between px-4 py-2.5 pl-10">
                                <span className="text-[13px] text-zinc-600">{sub.name}</span>
                                <span className={`text-[11px] px-2.5 py-0.5 rounded-full flex items-center gap-1.5 ${permLevelColor(sub.level)}`}>
                                  {permLevelIcon(sub.level)} {permLevelLabel(sub.level)}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {detailTab === 'queries' && (
                <div className="space-y-3">
                  {selected.sharedQueries.length === 0 && <p className="text-[14px] text-zinc-400 text-center py-8">No queries shared with this role</p>}
                  {selected.sharedQueries.map(q => (
                    <div key={q.id} className="bg-zinc-50 border border-zinc-100 rounded-lg p-4">
                      <p className="text-[14px] text-zinc-900 flex items-center gap-2">
                        <Query size={14} className="text-zinc-400 shrink-0" />
                        {q.name}
                      </p>
                      <p className="text-[12px] text-zinc-500 mt-1">
                        Shared by <span className="text-zinc-700">{q.sharedBy}</span> on {q.sharedAt}
                      </p>
                      <p className="text-[11px] text-violet-600 mt-1">Accessible to all users with role "{selected.name}"</p>
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
