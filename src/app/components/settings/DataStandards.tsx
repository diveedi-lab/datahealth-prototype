import { useState } from 'react';
import { Save, Checkmark, Information } from '@carbon/icons-react';

interface Standard {
  key: string;
  name: string;
  description: string;
  currentVersion: string;
  availableVersions: string[];
  enabled: boolean;
  category: string;
}

const MOCK_STANDARDS: Standard[] = [
  { key: 'sdtm', name: 'CDISC SDTM', description: 'Study Data Tabulation Model — structure for submitting tabulation datasets to regulatory authorities', currentVersion: '1.8', availableVersions: ['1.4', '1.5', '1.6', '1.7', '1.8', '2.0 (Draft)'], enabled: true, category: 'CDISC' },
  { key: 'sdtmig', name: 'CDISC SDTM-IG', description: 'Implementation Guide providing domain-specific guidance for SDTM datasets', currentVersion: '3.4', availableVersions: ['3.1.2', '3.1.3', '3.2', '3.3', '3.4'], enabled: true, category: 'CDISC' },
  { key: 'adam', name: 'CDISC ADaM', description: 'Analysis Data Model — standard for analysis-ready datasets supporting statistical computing', currentVersion: '2.1', availableVersions: ['2.0', '2.1'], enabled: true, category: 'CDISC' },
  { key: 'cdash', name: 'CDISC CDASH', description: 'Clinical Data Acquisition Standards Harmonization — standardized CRF field definitions', currentVersion: '2.2', availableVersions: ['1.1', '2.0', '2.1', '2.2'], enabled: true, category: 'CDISC' },
  { key: 'ct', name: 'CDISC Controlled Terminology', description: 'NCI Enterprise Vocabulary Services — standardized code lists and value sets', currentVersion: '2026-03-28', availableVersions: ['2025-06-27', '2025-09-26', '2025-12-19', '2026-03-28'], enabled: true, category: 'CDISC' },
  { key: 'define', name: 'Define-XML', description: 'Case Report Tabulation Data Definition Specification for submission packages', currentVersion: '2.1', availableVersions: ['2.0', '2.1'], enabled: true, category: 'CDISC' },
  { key: 'omop', name: 'OMOP CDM', description: 'Observational Medical Outcomes Partnership Common Data Model for observational research', currentVersion: '5.4', availableVersions: ['5.2', '5.3', '5.4', '6.0 (Beta)'], enabled: true, category: 'OHDSI' },
  { key: 'omopVocab', name: 'OMOP Vocabularies', description: 'Standardized vocabularies (SNOMED, ICD-10, LOINC, RxNorm, etc.) for OMOP CDM', currentVersion: 'v5.0 2026-Q1', availableVersions: ['v5.0 2025-Q3', 'v5.0 2025-Q4', 'v5.0 2026-Q1'], enabled: true, category: 'OHDSI' },
  { key: 'fhir', name: 'HL7 FHIR', description: 'Fast Healthcare Interoperability Resources — REST-based standard for health data exchange', currentVersion: 'R4 (4.0.1)', availableVersions: ['R3 (STU3)', 'R4 (4.0.1)', 'R4B (4.3.0)', 'R5 (5.0.0)'], enabled: false, category: 'HL7' },
  { key: 'meddra', name: 'MedDRA', description: 'Medical Dictionary for Regulatory Activities — terminology for adverse event coding', currentVersion: '27.0', availableVersions: ['25.0', '25.1', '26.0', '26.1', '27.0'], enabled: true, category: 'Terminology' },
  { key: 'whoDrug', name: 'WHODrug Global', description: 'WHO Drug Dictionary for standardized medication coding in clinical studies', currentVersion: 'March 2026', availableVersions: ['September 2025', 'December 2025', 'March 2026'], enabled: true, category: 'Terminology' },
];

const categories = [...new Set(MOCK_STANDARDS.map(s => s.category))];

export function DataStandards() {
  const [standards, setStandards] = useState(MOCK_STANDARDS);
  const [saved, setSaved] = useState(false);

  const toggleEnabled = (key: string) => {
    setStandards(prev => prev.map(s => s.key === key ? { ...s, enabled: !s.enabled } : s));
    setSaved(false);
  };

  const changeVersion = (key: string, version: string) => {
    setStandards(prev => prev.map(s => s.key === key ? { ...s, currentVersion: version } : s));
    setSaved(false);
  };

  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2500); };

  return (
    <div className="h-full flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-zinc-900 dark:text-zinc-100">Data Standards</h1>
          <p className="text-[14px] text-zinc-500 dark:text-zinc-400 mt-1">Configure CDISC, OMOP, HL7, and terminology versions used for entity validation and exports</p>
        </div>
        <button onClick={handleSave}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-[14px] transition-colors ${saved ? 'bg-emerald-600 text-white' : 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200'}`}>
          <Save size={16} /> {saved ? 'Saved!' : 'Save Changes'}
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-4 gap-3">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3">
          <p className="text-[12px] text-zinc-500 dark:text-zinc-400">Total Standards</p>
          <p className="text-[20px] text-zinc-900 dark:text-zinc-100 mt-0.5">{standards.length}</p>
        </div>
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3">
          <p className="text-[12px] text-zinc-500 dark:text-zinc-400">Enabled</p>
          <p className="text-[20px] text-emerald-600 dark:text-emerald-400 mt-0.5">{standards.filter(s => s.enabled).length}</p>
        </div>
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3">
          <p className="text-[12px] text-zinc-500 dark:text-zinc-400">Disabled</p>
          <p className="text-[20px] text-zinc-400 mt-0.5">{standards.filter(s => !s.enabled).length}</p>
        </div>
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3">
          <p className="text-[12px] text-zinc-500 dark:text-zinc-400">Categories</p>
          <p className="text-[20px] text-zinc-900 dark:text-zinc-100 mt-0.5">{categories.length}</p>
        </div>
      </div>

      <div className="flex-1 overflow-auto space-y-4 pb-4">
        {categories.map(cat => (
          <div key={cat} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
            <div className="px-6 py-3 border-b border-zinc-100 dark:border-zinc-800">
              <h2 className="text-[14px] text-zinc-900 dark:text-zinc-100">{cat}</h2>
            </div>
            <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {standards.filter(s => s.category === cat).map(std => (
                <div key={std.key} className={`px-6 py-4 flex items-center justify-between gap-6 transition-opacity ${!std.enabled ? 'opacity-50' : ''}`}>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-[14px] text-zinc-900 dark:text-zinc-100">{std.name}</p>
                      {std.enabled && <Checkmark size={14} className="text-emerald-500" />}
                    </div>
                    <p className="text-[12px] text-zinc-400 dark:text-zinc-500 mt-0.5">{std.description}</p>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <select value={std.currentVersion} onChange={e => changeVersion(std.key, e.target.value)}
                      className="px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-[13px] text-zinc-900 dark:text-zinc-100 outline-none">
                      {std.availableVersions.map(v => <option key={v} value={v}>{v}</option>)}
                    </select>
                    <button onClick={() => toggleEnabled(std.key)}
                      className={`relative w-9 h-5 rounded-full transition-colors ${std.enabled ? 'bg-emerald-500' : 'bg-zinc-300 dark:bg-zinc-600'}`}>
                      <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${std.enabled ? 'translate-x-4.5' : 'translate-x-0.5'}`} />
                    </button>
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
