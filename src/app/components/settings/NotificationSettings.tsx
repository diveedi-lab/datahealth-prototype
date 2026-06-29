import { useState } from 'react';
import { Save, Email, Notification, Warning, Information } from '@carbon/icons-react';

interface NotifChannel {
  key: string;
  label: string;
  description: string;
  email: boolean;
  inApp: boolean;
}

const CHANNEL_GROUPS: { title: string; channels: NotifChannel[] }[] = [
  {
    title: 'Security Events',
    channels: [
      { key: 'loginFailed', label: 'Failed Login Attempts', description: 'Alert when a user exceeds the max login threshold', email: true, inApp: true },
      { key: 'accountLocked', label: 'Account Lockout', description: 'Notification when a user account is temporarily suspended', email: true, inApp: true },
      { key: 'mfaDisabled', label: 'MFA Disabled', description: 'Alert when a user disables multi-factor authentication', email: true, inApp: true },
      { key: 'suspiciousAccess', label: 'Suspicious Access Pattern', description: 'Unusual login location or time-of-day anomaly detected', email: true, inApp: true },
    ],
  },
  {
    title: 'Data Operations',
    channels: [
      { key: 'bulkExport', label: 'Bulk Data Export', description: 'Triggered when a large dataset export is initiated', email: true, inApp: true },
      { key: 'schemaChange', label: 'Schema Modification', description: 'Entity or variable definition is created, modified, or deleted', email: false, inApp: true },
      { key: 'studyStatusChange', label: 'Study Status Change', description: 'A project or study transitions to a new status (e.g. Active → Locked)', email: true, inApp: true },
      { key: 'importComplete', label: 'Data Import Completed', description: 'A file upload or connector ingestion job has finished', email: false, inApp: true },
      { key: 'importFailed', label: 'Data Import Failed', description: 'An ingestion job encountered errors or was aborted', email: true, inApp: true },
    ],
  },
  {
    title: 'User & Access',
    channels: [
      { key: 'newUserInvited', label: 'New User Invited', description: 'An invitation was sent to a new platform user', email: false, inApp: true },
      { key: 'userActivated', label: 'User Activated', description: 'An invited user accepted and completed onboarding', email: false, inApp: true },
      { key: 'roleChanged', label: 'Role Assignment Changed', description: 'A user\'s role or permissions have been modified', email: true, inApp: true },
      { key: 'queryShared', label: 'Query Shared With You', description: 'Another user or role shared a saved query with you', email: false, inApp: true },
    ],
  },
  {
    title: 'System & Maintenance',
    channels: [
      { key: 'backupComplete', label: 'Backup Completed', description: 'Scheduled database backup finished successfully', email: false, inApp: true },
      { key: 'backupFailed', label: 'Backup Failed', description: 'A scheduled backup encountered an error', email: true, inApp: true },
      { key: 'storageThreshold', label: 'Storage Threshold Alert', description: 'Platform storage exceeds 80% of allocated capacity', email: true, inApp: true },
      { key: 'scheduledMaintenance', label: 'Scheduled Maintenance', description: 'Upcoming maintenance window notification', email: true, inApp: true },
    ],
  },
];

export function NotificationSettings() {
  const [channels, setChannels] = useState<Record<string, { email: boolean; inApp: boolean }>>(() => {
    const map: Record<string, { email: boolean; inApp: boolean }> = {};
    CHANNEL_GROUPS.forEach(g => g.channels.forEach(c => { map[c.key] = { email: c.email, inApp: c.inApp }; }));
    return map;
  });
  const [digestFreq, setDigestFreq] = useState('Daily');
  const [saved, setSaved] = useState(false);

  const toggle = (key: string, type: 'email' | 'inApp') => {
    setChannels(prev => ({ ...prev, [key]: { ...prev[key], [type]: !prev[key][type] } }));
    setSaved(false);
  };

  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2500); };

  return (
    <div className="h-full flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-zinc-900 dark:text-zinc-100">Notifications</h1>
          <p className="text-[14px] text-zinc-500 dark:text-zinc-400 mt-1">Configure alert channels and notification preferences for platform events</p>
        </div>
        <button onClick={handleSave}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-[14px] transition-colors ${saved ? 'bg-emerald-600 text-white' : 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200'}`}>
          <Save size={16} /> {saved ? 'Saved!' : 'Save Preferences'}
        </button>
      </div>

      {/* Digest setting */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-6 py-4 flex items-center justify-between">
        <div>
          <p className="text-[14px] text-zinc-900 dark:text-zinc-100">Email Digest Frequency</p>
          <p className="text-[12px] text-zinc-400 dark:text-zinc-500 mt-0.5">Combine non-critical email notifications into a periodic digest</p>
        </div>
        <select value={digestFreq} onChange={e => setDigestFreq(e.target.value)}
          className="px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-[14px] text-zinc-900 dark:text-zinc-100 outline-none">
          <option>Immediately</option><option>Hourly</option><option>Daily</option><option>Weekly</option>
        </select>
      </div>

      {/* Channel groups */}
      <div className="flex-1 overflow-auto space-y-4 pb-4">
        {CHANNEL_GROUPS.map(group => (
          <div key={group.title} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
            <div className="px-6 py-3 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
              <h2 className="text-[14px] text-zinc-900 dark:text-zinc-100">{group.title}</h2>
              <div className="flex gap-8 text-[11px] text-zinc-400 dark:text-zinc-500">
                <span className="w-14 text-center">Email</span>
                <span className="w-14 text-center">In-App</span>
              </div>
            </div>
            <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {group.channels.map(ch => (
                <div key={ch.key} className="px-6 py-3 flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] text-zinc-900 dark:text-zinc-100">{ch.label}</p>
                    <p className="text-[12px] text-zinc-400 dark:text-zinc-500 mt-0.5">{ch.description}</p>
                  </div>
                  <div className="flex gap-8 shrink-0">
                    <div className="w-14 flex justify-center">
                      <button onClick={() => toggle(ch.key, 'email')}
                        className={`relative w-9 h-5 rounded-full transition-colors ${channels[ch.key]?.email ? 'bg-emerald-500' : 'bg-zinc-300 dark:bg-zinc-600'}`}>
                        <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${channels[ch.key]?.email ? 'translate-x-4.5' : 'translate-x-0.5'}`} />
                      </button>
                    </div>
                    <div className="w-14 flex justify-center">
                      <button onClick={() => toggle(ch.key, 'inApp')}
                        className={`relative w-9 h-5 rounded-full transition-colors ${channels[ch.key]?.inApp ? 'bg-emerald-500' : 'bg-zinc-300 dark:bg-zinc-600'}`}>
                        <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${channels[ch.key]?.inApp ? 'translate-x-4.5' : 'translate-x-0.5'}`} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
