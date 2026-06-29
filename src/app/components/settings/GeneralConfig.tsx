import { useState } from 'react';
import { Save, Information, Renew } from '@carbon/icons-react';

interface ConfigField {
  key: string;
  label: string;
  description: string;
  type: 'text' | 'select' | 'number' | 'toggle';
  value: string | number | boolean;
  options?: string[];
  unit?: string;
}

const SECTIONS: { title: string; description: string; fields: ConfigField[] }[] = [
  {
    title: 'Platform Identity',
    description: 'Core platform naming and branding settings',
    fields: [
      { key: 'platformName', label: 'Platform Name', description: 'Displayed in the browser title and exported reports', type: 'text', value: 'ClinStore Data Platform' },
      { key: 'orgName', label: 'Organization Name', description: 'Legal entity name for audit trails and compliance headers', type: 'text', value: 'PharmaCorp International AG' },
      { key: 'environment', label: 'Environment', description: 'Current deployment environment label', type: 'select', value: 'Production', options: ['Production', 'Staging', 'Development', 'QA'] },
    ],
  },
  {
    title: 'Regional & Locale',
    description: 'Date, time, and regional format preferences',
    fields: [
      { key: 'timezone', label: 'Default Timezone', description: 'Applied to all timestamps in logs and exports', type: 'select', value: 'Europe/Zurich', options: ['UTC', 'Europe/Zurich', 'Europe/London', 'Europe/Berlin', 'US/Eastern', 'US/Pacific', 'Asia/Tokyo', 'Asia/Singapore'] },
      { key: 'dateFormat', label: 'Date Format', description: 'Standard date representation across the platform', type: 'select', value: 'YYYY-MM-DD', options: ['YYYY-MM-DD', 'DD/MM/YYYY', 'MM/DD/YYYY', 'DD-MMM-YYYY'] },
      { key: 'timeFormat', label: 'Time Format', description: 'Clock format for all displayed timestamps', type: 'select', value: '24h', options: ['24h', '12h'] },
    ],
  },
  {
    title: 'Security & Sessions',
    description: 'Authentication and session management policies',
    fields: [
      { key: 'sessionTimeout', label: 'Session Timeout', description: 'Auto-logout after period of inactivity', type: 'number', value: 30, unit: 'minutes' },
      { key: 'maxLoginAttempts', label: 'Max Login Attempts', description: 'Account lockout threshold before temporary suspension', type: 'number', value: 5, unit: 'attempts' },
      { key: 'lockoutDuration', label: 'Lockout Duration', description: 'Time before a locked account can retry authentication', type: 'number', value: 15, unit: 'minutes' },
      { key: 'enforceMfa', label: 'Enforce MFA for All Users', description: 'Require multi-factor authentication at login for every user', type: 'toggle', value: true },
      { key: 'passwordExpiry', label: 'Password Expiry', description: 'Force password rotation after the specified number of days', type: 'number', value: 90, unit: 'days' },
    ],
  },
  {
    title: 'Data Retention & Compliance',
    description: 'Retention policies for clinical data and audit records',
    fields: [
      { key: 'auditRetention', label: 'Audit Log Retention', description: 'Duration to retain audit trail records (regulatory minimum: 15 years for clinical)', type: 'number', value: 25, unit: 'years' },
      { key: 'dataRetention', label: 'Archived Study Retention', description: 'How long archived study databases are preserved after study closure', type: 'number', value: 25, unit: 'years' },
      { key: 'backupFrequency', label: 'Backup Frequency', description: 'Automated full backup schedule for all databases', type: 'select', value: 'Daily', options: ['Hourly', 'Every 6 hours', 'Daily', 'Weekly'] },
      { key: 'gdprMode', label: 'GDPR Compliance Mode', description: 'Enable pseudonymization enforcement and right-to-erasure workflows', type: 'toggle', value: true },
      { key: 'part11Mode', label: '21 CFR Part 11 Mode', description: 'Enforce electronic signature and audit trail requirements per FDA regulation', type: 'toggle', value: true },
    ],
  },
  {
    title: 'Export & Integration',
    description: 'Default behavior for data exports and external connections',
    fields: [
      { key: 'defaultExportFormat', label: 'Default Export Format', description: 'Preferred file format for data exports', type: 'select', value: 'SAS XPORT v5', options: ['SAS XPORT v5', 'SAS XPORT v8', 'CSV', 'Parquet', 'JSON', 'NDJSON'] },
      { key: 'exportCompression', label: 'Export Compression', description: 'Compression method applied to bulk exports', type: 'select', value: 'ZIP', options: ['None', 'ZIP', 'GZIP', 'TAR.GZ'] },
      { key: 'maxExportRows', label: 'Max Export Rows', description: 'Row limit per single export operation (0 = unlimited)', type: 'number', value: 1000000, unit: 'rows' },
    ],
  },
];

export function GeneralConfig() {
  const [fields, setFields] = useState<Record<string, string | number | boolean>>(() => {
    const map: Record<string, string | number | boolean> = {};
    SECTIONS.forEach(s => s.fields.forEach(f => { map[f.key] = f.value; }));
    return map;
  });
  const [saved, setSaved] = useState(false);

  const updateField = (key: string, value: string | number | boolean) => {
    setFields(prev => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="h-full flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-zinc-900 dark:text-zinc-100">General Configuration</h1>
          <p className="text-[14px] text-zinc-500 dark:text-zinc-400 mt-1">Platform-wide settings, security policies, and compliance configuration</p>
        </div>
        <button onClick={handleSave}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-[14px] transition-colors ${saved ? 'bg-emerald-600 text-white' : 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200'}`}>
          <Save size={16} /> {saved ? 'Saved!' : 'Save Changes'}
        </button>
      </div>

      <div className="flex-1 overflow-auto space-y-6 pb-4">
        {SECTIONS.map(section => (
          <div key={section.title} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800">
              <h2 className="text-[15px] text-zinc-900 dark:text-zinc-100">{section.title}</h2>
              <p className="text-[13px] text-zinc-400 dark:text-zinc-500 mt-0.5">{section.description}</p>
            </div>
            <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {section.fields.map(field => (
                <div key={field.key} className="px-6 py-4 flex items-center justify-between gap-8">
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] text-zinc-900 dark:text-zinc-100">{field.label}</p>
                    <p className="text-[12px] text-zinc-400 dark:text-zinc-500 mt-0.5">{field.description}</p>
                  </div>
                  <div className="shrink-0 w-56">
                    {field.type === 'text' && (
                      <input type="text" value={fields[field.key] as string} onChange={e => updateField(field.key, e.target.value)}
                        className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-[14px] text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-zinc-900/10 dark:focus:ring-zinc-100/10" />
                    )}
                    {field.type === 'select' && (
                      <select value={fields[field.key] as string} onChange={e => updateField(field.key, e.target.value)}
                        className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-[14px] text-zinc-900 dark:text-zinc-100 outline-none">
                        {field.options!.map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                    )}
                    {field.type === 'number' && (
                      <div className="flex items-center gap-2">
                        <input type="number" value={fields[field.key] as number} onChange={e => updateField(field.key, parseInt(e.target.value) || 0)}
                          className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-[14px] text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-zinc-900/10 dark:focus:ring-zinc-100/10" />
                        {field.unit && <span className="text-[12px] text-zinc-400 whitespace-nowrap">{field.unit}</span>}
                      </div>
                    )}
                    {field.type === 'toggle' && (
                      <button onClick={() => updateField(field.key, !fields[field.key])}
                        className={`relative w-11 h-6 rounded-full transition-colors ${fields[field.key] ? 'bg-emerald-500' : 'bg-zinc-300 dark:bg-zinc-600'}`}>
                        <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${fields[field.key] ? 'translate-x-5.5' : 'translate-x-0.5'}`} />
                      </button>
                    )}
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
