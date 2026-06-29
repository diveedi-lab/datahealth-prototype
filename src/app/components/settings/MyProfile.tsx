import { useState } from 'react';
import { Save, Edit, Password, Security, Time, Devices, Email, Location, Checkmark, Close, Warning } from '@carbon/icons-react';

interface Session {
  id: string;
  device: string;
  browser: string;
  ip: string;
  location: string;
  lastActive: string;
  isCurrent: boolean;
}

interface ActivityEntry {
  timestamp: string;
  action: string;
  resource: string;
}

const MOCK_SESSIONS: Session[] = [
  { id: 's-1', device: 'MacBook Pro 16"', browser: 'Chrome 124', ip: '194.230.xx.xx', location: 'Zurich, CH', lastActive: 'Now', isCurrent: true },
  { id: 's-2', device: 'iPad Pro', browser: 'Safari 18', ip: '194.230.xx.xx', location: 'Zurich, CH', lastActive: '2 hours ago', isCurrent: false },
  { id: 's-3', device: 'Windows Desktop', browser: 'Edge 124', ip: '85.120.xx.xx', location: 'Milan, IT', lastActive: 'Yesterday 16:42', isCurrent: false },
];

const MOCK_ACTIVITY: ActivityEntry[] = [
  { timestamp: '2026-04-14 09:42', action: 'Created entity', resource: 'patient_reported_outcomes' },
  { timestamp: '2026-04-14 09:05', action: 'Created study', resource: 'Oncology Research Program' },
  { timestamp: '2026-04-13 16:30', action: 'Modified variable', resource: 'AETERM in AE domain' },
  { timestamp: '2026-04-13 11:15', action: 'Exported data', resource: 'Study ONCO-2024-001' },
  { timestamp: '2026-04-12 14:20', action: 'Executed query', resource: 'Patient Demographics' },
  { timestamp: '2026-04-12 10:05', action: 'Shared query', resource: 'AE Summary → Hans Müller' },
  { timestamp: '2026-04-11 15:33', action: 'Invited user', resource: 'lisa.chen@novagen.com' },
  { timestamp: '2026-04-11 09:12', action: 'Updated laboratory', resource: 'BioAnalytica GmbH accreditations' },
  { timestamp: '2026-04-10 17:00', action: 'Modified role', resource: 'Lab Coordinator permissions' },
  { timestamp: '2026-04-10 11:30', action: 'Login', resource: 'MacBook Pro / Chrome' },
];

export function MyProfile() {
  const [tab, setTab] = useState<'profile' | 'security' | 'sessions' | 'activity'>('profile');
  const [saved, setSaved] = useState(false);

  // Profile fields
  const [firstName, setFirstName] = useState('Elena');
  const [lastName, setLastName] = useState('Rossi');
  const [emailAddr] = useState('elena.rossi@pharma.com');
  const [phone, setPhone] = useState('+41 79 123 4567');
  const [department, setDepartment] = useState('Clinical Operations');
  const [jobTitle, setJobTitle] = useState('Lead Data Manager');
  const [timezone, setTimezone] = useState('Europe/Zurich');
  const [language, setLanguage] = useState('English');

  const [sessions, setSessions] = useState(MOCK_SESSIONS);

  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2500); };

  const revokeSession = (id: string) => {
    setSessions(prev => prev.filter(s => s.id !== id));
  };

  const tabs = [
    { key: 'profile' as const, label: 'Profile' },
    { key: 'security' as const, label: 'Security' },
    { key: 'sessions' as const, label: 'Active Sessions' },
    { key: 'activity' as const, label: 'Recent Activity' },
  ];

  return (
    <div className="h-full flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center text-[22px] text-zinc-600 dark:text-zinc-300">
            ER
          </div>
          <div>
            <h1 className="text-zinc-900 dark:text-zinc-100">{firstName} {lastName}</h1>
            <p className="text-[14px] text-zinc-500 dark:text-zinc-400 mt-0.5">{jobTitle} · {department}</p>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-300">Admin</span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">MFA Enabled</span>
            </div>
          </div>
        </div>
        {tab === 'profile' && (
          <button onClick={handleSave}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-[14px] transition-colors ${saved ? 'bg-emerald-600 text-white' : 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200'}`}>
            <Save size={16} /> {saved ? 'Saved!' : 'Save Profile'}
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-zinc-200 dark:border-zinc-800">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-5 py-3 text-[13px] border-b-2 transition-colors ${tab === t.key
              ? 'border-zinc-900 dark:border-zinc-100 text-zinc-900 dark:text-zinc-100'
              : 'border-transparent text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300'
            }`}>
            {t.label}
            {t.key === 'sessions' && <span className="ml-1.5 text-[11px] bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded-full">{sessions.length}</span>}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-auto pb-4">
        {/* Profile Tab */}
        {tab === 'profile' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800">
                <h2 className="text-[15px] text-zinc-900 dark:text-zinc-100">Personal Information</h2>
              </div>
              <div className="p-6 grid grid-cols-2 gap-5">
                <div>
                  <label className="text-[12px] text-zinc-500 dark:text-zinc-400 mb-1.5 block">First Name</label>
                  <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-[14px] text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-zinc-900/10 dark:focus:ring-zinc-100/10" />
                </div>
                <div>
                  <label className="text-[12px] text-zinc-500 dark:text-zinc-400 mb-1.5 block">Last Name</label>
                  <input type="text" value={lastName} onChange={e => setLastName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-[14px] text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-zinc-900/10 dark:focus:ring-zinc-100/10" />
                </div>
                <div>
                  <label className="text-[12px] text-zinc-500 dark:text-zinc-400 mb-1.5 block">Email</label>
                  <div className="flex items-center gap-2 px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-lg">
                    <Email size={14} className="text-zinc-400" />
                    <span className="text-[14px] text-zinc-500 dark:text-zinc-400">{emailAddr}</span>
                  </div>
                </div>
                <div>
                  <label className="text-[12px] text-zinc-500 dark:text-zinc-400 mb-1.5 block">Phone</label>
                  <input type="text" value={phone} onChange={e => setPhone(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-[14px] text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-zinc-900/10 dark:focus:ring-zinc-100/10" />
                </div>
                <div>
                  <label className="text-[12px] text-zinc-500 dark:text-zinc-400 mb-1.5 block">Job Title</label>
                  <input type="text" value={jobTitle} onChange={e => setJobTitle(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-[14px] text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-zinc-900/10 dark:focus:ring-zinc-100/10" />
                </div>
                <div>
                  <label className="text-[12px] text-zinc-500 dark:text-zinc-400 mb-1.5 block">Department</label>
                  <input type="text" value={department} onChange={e => setDepartment(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-[14px] text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-zinc-900/10 dark:focus:ring-zinc-100/10" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800">
                <h2 className="text-[15px] text-zinc-900 dark:text-zinc-100">Preferences</h2>
              </div>
              <div className="p-6 grid grid-cols-2 gap-5">
                <div>
                  <label className="text-[12px] text-zinc-500 dark:text-zinc-400 mb-1.5 block">Timezone</label>
                  <select value={timezone} onChange={e => setTimezone(e.target.value)}
                    className="w-full px-3 py-2.5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-[14px] text-zinc-900 dark:text-zinc-100 outline-none">
                    {['UTC', 'Europe/Zurich', 'Europe/London', 'Europe/Berlin', 'US/Eastern', 'US/Pacific', 'Asia/Tokyo', 'Asia/Singapore'].map(tz => <option key={tz}>{tz}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[12px] text-zinc-500 dark:text-zinc-400 mb-1.5 block">Language</label>
                  <select value={language} onChange={e => setLanguage(e.target.value)}
                    className="w-full px-3 py-2.5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-[14px] text-zinc-900 dark:text-zinc-100 outline-none">
                    <option>English</option><option>Deutsch</option><option>Français</option><option>Italiano</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6">
              <h2 className="text-[15px] text-zinc-900 dark:text-zinc-100 mb-1">Account Details</h2>
              <div className="grid grid-cols-3 gap-6 mt-4">
                <div>
                  <p className="text-[12px] text-zinc-500 dark:text-zinc-400">Role</p>
                  <p className="text-[14px] text-zinc-900 dark:text-zinc-100 mt-1">Admin</p>
                </div>
                <div>
                  <p className="text-[12px] text-zinc-500 dark:text-zinc-400">Member Since</p>
                  <p className="text-[14px] text-zinc-900 dark:text-zinc-100 mt-1">January 15, 2024</p>
                </div>
                <div>
                  <p className="text-[12px] text-zinc-500 dark:text-zinc-400">Last Password Change</p>
                  <p className="text-[14px] text-zinc-900 dark:text-zinc-100 mt-1">February 28, 2026</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Security Tab */}
        {tab === 'security' && (
          <div className="space-y-4">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-[15px] text-zinc-900 dark:text-zinc-100 flex items-center gap-2"><Password size={16} /> Password</h3>
                  <p className="text-[13px] text-zinc-400 dark:text-zinc-500 mt-1">Last changed on February 28, 2026. Expires in 45 days.</p>
                </div>
                <button className="px-4 py-2 border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-[13px]">
                  Change Password
                </button>
              </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-[15px] text-zinc-900 dark:text-zinc-100 flex items-center gap-2"><Security size={16} /> Multi-Factor Authentication</h3>
                  <p className="text-[13px] text-zinc-400 dark:text-zinc-500 mt-1">MFA is enabled via Authenticator App. Configured on January 15, 2024.</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 flex items-center gap-1"><Checkmark size={12} /> Active</span>
                    <span className="text-[11px] text-zinc-400">Recovery codes: 6 remaining</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="px-4 py-2 border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-[13px]">
                    Regenerate Codes
                  </button>
                  <button className="px-4 py-2 border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-[13px]">
                    Reconfigure
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6">
              <h3 className="text-[15px] text-zinc-900 dark:text-zinc-100 mb-3">Login History</h3>
              <div className="space-y-2">
                {[
                  { time: '2026-04-14 09:42', location: 'Zurich, CH', device: 'Chrome / macOS', status: 'Success' },
                  { time: '2026-04-13 08:30', location: 'Zurich, CH', device: 'Safari / iPadOS', status: 'Success' },
                  { time: '2026-04-12 10:05', location: 'Zurich, CH', device: 'Chrome / macOS', status: 'Success' },
                  { time: '2026-04-11 09:12', location: 'Milan, IT', device: 'Edge / Windows', status: 'Success' },
                  { time: '2026-04-10 22:15', location: 'Unknown', device: 'Firefox / Linux', status: 'Failed' },
                ].map((entry, i) => (
                  <div key={i} className="flex items-center justify-between px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-[12px] text-zinc-500 dark:text-zinc-400 w-36">{entry.time}</span>
                      <span className="text-[13px] text-zinc-700 dark:text-zinc-300">{entry.device}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[12px] text-zinc-400 flex items-center gap-1"><Location size={12} />{entry.location}</span>
                      <span className={`text-[11px] px-2 py-0.5 rounded-full ${entry.status === 'Success' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300' : 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300'}`}>
                        {entry.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Sessions Tab */}
        {tab === 'sessions' && (
          <div className="space-y-3">
            {sessions.map(session => (
              <div key={session.id} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-zinc-100 dark:bg-zinc-800 rounded-lg flex items-center justify-center shrink-0">
                      <Devices size={18} className="text-zinc-500 dark:text-zinc-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-[14px] text-zinc-900 dark:text-zinc-100">{session.device}</p>
                        {session.isCurrent && <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">Current</span>}
                      </div>
                      <p className="text-[13px] text-zinc-500 dark:text-zinc-400 mt-0.5">{session.browser}</p>
                      <div className="flex gap-4 mt-1.5 text-[12px] text-zinc-400 dark:text-zinc-500">
                        <span className="flex items-center gap-1"><Location size={12} />{session.location}</span>
                        <span>IP: {session.ip}</span>
                        <span className="flex items-center gap-1"><Time size={12} />{session.lastActive}</span>
                      </div>
                    </div>
                  </div>
                  {!session.isCurrent && (
                    <button onClick={() => revokeSession(session.id)}
                      className="px-3 py-1.5 border border-red-300 dark:border-red-800 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-[12px]">
                      Revoke
                    </button>
                  )}
                </div>
              </div>
            ))}
            {sessions.length > 1 && (
              <button onClick={() => setSessions(prev => prev.filter(s => s.isCurrent))}
                className="w-full py-3 border border-red-300 dark:border-red-800 text-red-600 dark:text-red-400 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-[13px]">
                Revoke All Other Sessions
              </button>
            )}
          </div>
        )}

        {/* Activity Tab */}
        {tab === 'activity' && (
          <div className="space-y-2">
            {MOCK_ACTIVITY.map((entry, i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg">
                <div className="w-2 h-2 rounded-full bg-zinc-300 dark:bg-zinc-600 shrink-0" />
                <span className="font-mono text-[12px] text-zinc-400 dark:text-zinc-500 w-36 shrink-0">{entry.timestamp}</span>
                <span className="text-[13px] text-zinc-700 dark:text-zinc-300 w-36 shrink-0">{entry.action}</span>
                <span className="text-[13px] text-zinc-500 dark:text-zinc-400 flex-1 truncate">{entry.resource}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
