import { useState } from 'react';
import { Search, Add, Edit, TrashCan, ChevronDown, ChevronRight, Tag, DataStructured, Copy } from '@carbon/icons-react';

type Standard = 'CDISC' | 'OMOP' | 'Custom';
type EntityOrigin = 'Standard' | 'Standard-Modified' | 'Custom';

interface Entity {
  id: string;
  name: string;
  label: string;
  standard: Standard;
  origin: EntityOrigin;
  domain: string;
  description: string;
  variableCount: number;
  version: string;
  lastModified: string;
}

const MOCK_ENTITIES: Entity[] = [
  { id: 'e1', name: 'DM', label: 'Demographics', standard: 'CDISC', origin: 'Standard', domain: 'SDTM', description: 'Subject demographic information including age, sex, race', variableCount: 24, version: '3.4', lastModified: '2024-11-20' },
  { id: 'e2', name: 'AE', label: 'Adverse Events', standard: 'CDISC', origin: 'Standard', domain: 'SDTM', description: 'Records of adverse events experienced by subjects', variableCount: 32, version: '3.4', lastModified: '2024-11-18' },
  { id: 'e3', name: 'LB', label: 'Laboratory Results', standard: 'CDISC', origin: 'Standard-Modified', domain: 'SDTM', description: 'Laboratory test results with custom biomarker extensions', variableCount: 38, version: '3.4-mod', lastModified: '2024-12-01' },
  { id: 'e4', name: 'VS', label: 'Vital Signs', standard: 'CDISC', origin: 'Standard', domain: 'SDTM', description: 'Vital signs measurements', variableCount: 18, version: '3.4', lastModified: '2024-10-15' },
  { id: 'e5', name: 'person', label: 'Person', standard: 'OMOP', origin: 'Standard', domain: 'CDM', description: 'Uniquely identifies each person in the source data', variableCount: 18, version: '5.4', lastModified: '2024-11-10' },
  { id: 'e6', name: 'condition_occurrence', label: 'Condition Occurrence', standard: 'OMOP', origin: 'Standard', domain: 'CDM', description: 'Records of conditions/diagnoses', variableCount: 16, version: '5.4', lastModified: '2024-11-10' },
  { id: 'e7', name: 'drug_exposure', label: 'Drug Exposure', standard: 'OMOP', origin: 'Standard-Modified', domain: 'CDM', description: 'Drug exposure records with custom dosing fields', variableCount: 22, version: '5.4-mod', lastModified: '2024-12-05' },
  { id: 'e8', name: 'patient_reported_outcomes', label: 'Patient Reported Outcomes', standard: 'Custom', origin: 'Custom', domain: 'PRO', description: 'Custom entity for patient-reported outcome measures', variableCount: 15, version: '1.0', lastModified: '2024-12-10' },
  { id: 'e9', name: 'biobank_samples', label: 'Biobank Samples', standard: 'Custom', origin: 'Custom', domain: 'BIO', description: 'Custom entity for biological sample tracking', variableCount: 20, version: '1.2', lastModified: '2024-12-08' },
];

const standardColors: Record<string, string> = {
  CDISC: 'bg-violet-100 text-violet-800',
  OMOP: 'bg-cyan-100 text-cyan-800',
  Custom: 'bg-zinc-200 text-zinc-700',
};

const originColors: Record<string, string> = {
  Standard: 'bg-emerald-100 text-emerald-800',
  'Standard-Modified': 'bg-amber-100 text-amber-800',
  Custom: 'bg-rose-100 text-rose-800',
};

export function Entities() {
  const [entities] = useState(MOCK_ENTITIES);
  const [search, setSearch] = useState('');
  const [filterStandard, setFilterStandard] = useState<string>('All');
  const [filterOrigin, setFilterOrigin] = useState<string>('All');
  const [selectedEntity, setSelectedEntity] = useState<Entity | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  const filtered = entities.filter(e => {
    const matchSearch = e.name.toLowerCase().includes(search.toLowerCase()) || e.label.toLowerCase().includes(search.toLowerCase());
    const matchStd = filterStandard === 'All' || e.standard === filterStandard;
    const matchOrigin = filterOrigin === 'All' || e.origin === filterOrigin;
    return matchSearch && matchStd && matchOrigin;
  });

  return (
    <div className="h-full flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-zinc-900">Entities</h1>
          <p className="text-[14px] text-zinc-500 mt-1">Define and manage data entities based on CDISC, OMOP, or custom standards</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 px-4 py-2 bg-zinc-900 text-white rounded-lg hover:opacity-90 transition-opacity text-[14px]">
          <Add size={16} /> New Entity
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 items-center">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input type="text" placeholder="Search entities..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-zinc-200 rounded-lg text-[14px] text-zinc-900 placeholder:text-zinc-400 outline-none focus:ring-2 focus:ring-zinc-900/10" />
        </div>
        <select value={filterStandard} onChange={e => setFilterStandard(e.target.value)}
          className="px-3 py-2.5 bg-white border border-zinc-200 rounded-lg text-[14px] text-zinc-900 outline-none">
          <option value="All">All Standards</option>
          <option value="CDISC">CDISC</option>
          <option value="OMOP">OMOP</option>
          <option value="Custom">Custom</option>
        </select>
        <select value={filterOrigin} onChange={e => setFilterOrigin(e.target.value)}
          className="px-3 py-2.5 bg-white border border-zinc-200 rounded-lg text-[14px] text-zinc-900 outline-none">
          <option value="All">All Origins</option>
          <option value="Standard">Standard</option>
          <option value="Standard-Modified">Standard-Modified</option>
          <option value="Custom">Custom</option>
        </select>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto glass-card rounded-2xl">
        <table className="w-full">
          <thead>
            <tr className="border-b border-zinc-200">
              {['Name', 'Label', 'Standard', 'Origin', 'Domain', 'Variables', 'Version', 'Modified'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-[12px] text-zinc-500 whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(entity => (
              <tr key={entity.id} className="border-b last:border-b-0 border-zinc-100 hover:bg-zinc-50 cursor-pointer transition-colors" onClick={() => setSelectedEntity(entity)}>
                <td className="px-4 py-3 text-[14px] text-zinc-900 font-mono">{entity.name}</td>
                <td className="px-4 py-3 text-[14px] text-zinc-700">{entity.label}</td>
                <td className="px-4 py-3"><span className={`text-[11px] px-2 py-0.5 rounded-full ${standardColors[entity.standard]}`}>{entity.standard}</span></td>
                <td className="px-4 py-3"><span className={`text-[11px] px-2 py-0.5 rounded-full ${originColors[entity.origin]}`}>{entity.origin}</span></td>
                <td className="px-4 py-3 text-[13px] text-zinc-500">{entity.domain}</td>
                <td className="px-4 py-3 text-[13px] text-zinc-600">{entity.variableCount}</td>
                <td className="px-4 py-3 text-[13px] text-zinc-500">{entity.version}</td>
                <td className="px-4 py-3 text-[13px] text-zinc-400">{entity.lastModified}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="p-10 text-center text-zinc-400 text-[14px]">No entities match your filters</div>
        )}
      </div>

      {/* Detail Panel */}
      {selectedEntity && (
        <div className="fixed inset-0 bg-black/30 z-50 flex justify-end" onClick={() => setSelectedEntity(null)}>
          <div className="w-[500px] glass h-full overflow-auto" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-zinc-200 flex items-center justify-between">
              <div>
                <h2 className="text-zinc-900 font-mono">{selectedEntity.name}</h2>
                <p className="text-[13px] text-zinc-500">{selectedEntity.label}</p>
              </div>
              <div className="flex gap-2">
                <button className="p-2 hover:bg-zinc-100 rounded-lg transition-colors"><Copy size={16} className="text-zinc-500" /></button>
                <button className="p-2 hover:bg-zinc-100 rounded-lg transition-colors"><Edit size={16} className="text-zinc-500" /></button>
                <button onClick={() => setSelectedEntity(null)} className="text-zinc-400 hover:text-zinc-600 text-[20px] px-1">&times;</button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex gap-2">
                <span className={`text-[11px] px-2 py-0.5 rounded-full ${standardColors[selectedEntity.standard]}`}>{selectedEntity.standard}</span>
                <span className={`text-[11px] px-2 py-0.5 rounded-full ${originColors[selectedEntity.origin]}`}>{selectedEntity.origin}</span>
              </div>
              {[
                { label: 'Domain', value: selectedEntity.domain },
                { label: 'Version', value: selectedEntity.version },
                { label: 'Description', value: selectedEntity.description },
                { label: 'Variable Count', value: String(selectedEntity.variableCount) },
                { label: 'Last Modified', value: selectedEntity.lastModified },
              ].map(f => (
                <div key={f.label}>
                  <p className="text-[12px] text-zinc-500 mb-1">{f.label}</p>
                  <p className="text-[14px] text-zinc-900">{f.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center" onClick={() => setShowCreate(false)}>
          <div className="w-[520px] glass rounded-2xl" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-zinc-200">
              <h2 className="text-zinc-900">Create New Entity</h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[12px] text-zinc-500 mb-1 block">Name</label>
                  <input className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-[14px] text-zinc-900 outline-none font-mono" placeholder="e.g. DM, VS" />
                </div>
                <div>
                  <label className="text-[12px] text-zinc-500 mb-1 block">Label</label>
                  <input className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-[14px] text-zinc-900 outline-none" placeholder="e.g. Demographics" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[12px] text-zinc-500 mb-1 block">Standard</label>
                  <select className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-[14px] text-zinc-900 outline-none">
                    <option>CDISC</option><option>OMOP</option><option>Custom</option>
                  </select>
                </div>
                <div>
                  <label className="text-[12px] text-zinc-500 mb-1 block">Origin</label>
                  <select className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-[14px] text-zinc-900 outline-none">
                    <option>Standard</option><option>Standard-Modified</option><option>Custom</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-[12px] text-zinc-500 mb-1 block">Description</label>
                <textarea className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-[14px] text-zinc-900 outline-none resize-none h-20" />
              </div>
            </div>
            <div className="p-6 border-t border-zinc-200 flex justify-end gap-3">
              <button onClick={() => setShowCreate(false)} className="px-4 py-2 text-[14px] text-zinc-600 hover:bg-zinc-100 rounded-lg transition-colors">Cancel</button>
              <button onClick={() => setShowCreate(false)} className="px-4 py-2 text-[14px] bg-zinc-900 text-white rounded-lg hover:opacity-90 transition-opacity">Create</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
