import { useState } from 'react';
import { Search, Add, Edit, Filter, Copy, ArrowUp, ArrowDown } from '@carbon/icons-react';

type Standard = 'CDISC' | 'OMOP' | 'Custom';
type DataType = 'Char' | 'Num' | 'Date' | 'DateTime' | 'Integer' | 'Float' | 'Boolean' | 'Text';
type Origin = 'Standard' | 'Standard-Modified' | 'Custom';

interface Variable {
  id: string;
  name: string;
  label: string;
  entity: string;
  standard: Standard;
  origin: Origin;
  dataType: DataType;
  length: number | null;
  required: boolean;
  codelist: string | null;
  description: string;
  core: 'Req' | 'Exp' | 'Perm';
}

const MOCK_VARIABLES: Variable[] = [
  { id: 'v1', name: 'STUDYID', label: 'Study Identifier', entity: 'DM', standard: 'CDISC', origin: 'Standard', dataType: 'Char', length: 20, required: true, codelist: null, description: 'Unique identifier for a study', core: 'Req' },
  { id: 'v2', name: 'USUBJID', label: 'Unique Subject Identifier', entity: 'DM', standard: 'CDISC', origin: 'Standard', dataType: 'Char', length: 40, required: true, codelist: null, description: 'Identifier used to uniquely identify a subject across all studies', core: 'Req' },
  { id: 'v3', name: 'SUBJID', label: 'Subject Identifier for the Study', entity: 'DM', standard: 'CDISC', origin: 'Standard', dataType: 'Char', length: 20, required: true, codelist: null, description: 'Subject identifier within the study', core: 'Req' },
  { id: 'v4', name: 'AGE', label: 'Age', entity: 'DM', standard: 'CDISC', origin: 'Standard', dataType: 'Num', length: 8, required: false, codelist: null, description: 'Age expressed in AGEU', core: 'Exp' },
  { id: 'v5', name: 'SEX', label: 'Sex', entity: 'DM', standard: 'CDISC', origin: 'Standard', dataType: 'Char', length: 2, required: false, codelist: 'CL.SEX', description: 'Sex of the subject', core: 'Req' },
  { id: 'v6', name: 'AETERM', label: 'Reported Term for the Adverse Event', entity: 'AE', standard: 'CDISC', origin: 'Standard', dataType: 'Char', length: 200, required: true, codelist: null, description: 'Verbatim name of the adverse event', core: 'Req' },
  { id: 'v7', name: 'AESEV', label: 'Severity/Intensity', entity: 'AE', standard: 'CDISC', origin: 'Standard', dataType: 'Char', length: 10, required: false, codelist: 'CL.SEVERITY', description: 'Severity or intensity of the event', core: 'Exp' },
  { id: 'v8', name: 'person_id', label: 'Person ID', entity: 'person', standard: 'OMOP', origin: 'Standard', dataType: 'Integer', length: null, required: true, codelist: null, description: 'A unique identifier for each person', core: 'Req' },
  { id: 'v9', name: 'year_of_birth', label: 'Year of Birth', entity: 'person', standard: 'OMOP', origin: 'Standard', dataType: 'Integer', length: null, required: true, codelist: null, description: 'The year of birth of the person', core: 'Req' },
  { id: 'v10', name: 'gender_concept_id', label: 'Gender Concept', entity: 'person', standard: 'OMOP', origin: 'Standard', dataType: 'Integer', length: null, required: true, codelist: 'CONCEPT.GENDER', description: 'The concept representing the gender', core: 'Req' },
  { id: 'v11', name: 'custom_biomarker', label: 'Custom Biomarker Score', entity: 'LB', standard: 'CDISC', origin: 'Custom', dataType: 'Float', length: null, required: false, codelist: null, description: 'Custom biomarker measurement added to standard LB entity', core: 'Perm' },
  { id: 'v12', name: 'pro_score', label: 'PRO Total Score', entity: 'patient_reported_outcomes', standard: 'Custom', origin: 'Custom', dataType: 'Float', length: null, required: true, codelist: null, description: 'Total patient-reported outcome score', core: 'Req' },
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

const coreColors: Record<string, string> = {
  Req: 'bg-red-100 text-red-700',
  Exp: 'bg-amber-100 text-amber-700',
  Perm: 'bg-zinc-100 text-zinc-600',
};

export function Variables() {
  const [variables] = useState(MOCK_VARIABLES);
  const [search, setSearch] = useState('');
  const [filterStandard, setFilterStandard] = useState('All');
  const [filterEntity, setFilterEntity] = useState('All');
  const [filterOrigin, setFilterOrigin] = useState('All');
  const [selectedVar, setSelectedVar] = useState<Variable | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  const entities = Array.from(new Set(variables.map(v => v.entity)));

  const filtered = variables.filter(v => {
    const s = search.toLowerCase();
    const matchSearch = v.name.toLowerCase().includes(s) || v.label.toLowerCase().includes(s);
    const matchStd = filterStandard === 'All' || v.standard === filterStandard;
    const matchEnt = filterEntity === 'All' || v.entity === filterEntity;
    const matchOrig = filterOrigin === 'All' || v.origin === filterOrigin;
    return matchSearch && matchStd && matchEnt && matchOrig;
  });

  return (
    <div className="h-full flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-zinc-900">Variables</h1>
          <p className="text-[14px] text-zinc-500 mt-1">Define and manage variables across entities and standards</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 px-4 py-2 bg-zinc-900 text-white rounded-lg hover:opacity-90 transition-opacity text-[14px]">
          <Add size={16} /> New Variable
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 items-center flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input type="text" placeholder="Search variables..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-zinc-200 rounded-lg text-[14px] text-zinc-900 placeholder:text-zinc-400 outline-none focus:ring-2 focus:ring-zinc-900/10" />
        </div>
        <select value={filterStandard} onChange={e => setFilterStandard(e.target.value)} className="px-3 py-2.5 bg-white border border-zinc-200 rounded-lg text-[14px] text-zinc-900 outline-none">
          <option value="All">All Standards</option><option>CDISC</option><option>OMOP</option><option>Custom</option>
        </select>
        <select value={filterEntity} onChange={e => setFilterEntity(e.target.value)} className="px-3 py-2.5 bg-white border border-zinc-200 rounded-lg text-[14px] text-zinc-900 outline-none">
          <option value="All">All Entities</option>
          {entities.map(e => <option key={e} value={e}>{e}</option>)}
        </select>
        <select value={filterOrigin} onChange={e => setFilterOrigin(e.target.value)} className="px-3 py-2.5 bg-white border border-zinc-200 rounded-lg text-[14px] text-zinc-900 outline-none">
          <option value="All">All Origins</option><option>Standard</option><option>Standard-Modified</option><option>Custom</option>
        </select>
      </div>

      <p className="text-[13px] text-zinc-500">{filtered.length} variables found</p>

      {/* Table */}
      <div className="flex-1 overflow-auto glass-card rounded-2xl">
        <table className="w-full">
          <thead>
            <tr className="border-b border-zinc-200">
              {['Name', 'Label', 'Entity', 'Standard', 'Origin', 'Type', 'Core', 'Codelist'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-[12px] text-zinc-500 whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(v => (
              <tr key={v.id} className="border-b last:border-b-0 border-zinc-100 hover:bg-zinc-50 cursor-pointer transition-colors" onClick={() => setSelectedVar(v)}>
                <td className="px-4 py-3 text-[14px] text-zinc-900 font-mono">{v.name}</td>
                <td className="px-4 py-3 text-[13px] text-zinc-700 max-w-[200px] truncate">{v.label}</td>
                <td className="px-4 py-3 text-[13px] text-zinc-600 font-mono">{v.entity}</td>
                <td className="px-4 py-3"><span className={`text-[11px] px-2 py-0.5 rounded-full ${standardColors[v.standard]}`}>{v.standard}</span></td>
                <td className="px-4 py-3"><span className={`text-[11px] px-2 py-0.5 rounded-full ${originColors[v.origin]}`}>{v.origin}</span></td>
                <td className="px-4 py-3 text-[13px] text-zinc-500">{v.dataType}{v.length ? `(${v.length})` : ''}</td>
                <td className="px-4 py-3"><span className={`text-[11px] px-2 py-0.5 rounded-full ${coreColors[v.core]}`}>{v.core}</span></td>
                <td className="px-4 py-3 text-[13px] text-zinc-400 font-mono">{v.codelist || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <div className="p-10 text-center text-zinc-400 text-[14px]">No variables match your filters</div>}
      </div>

      {/* Detail */}
      {selectedVar && (
        <div className="fixed inset-0 bg-black/30 z-50 flex justify-end" onClick={() => setSelectedVar(null)}>
          <div className="w-[500px] glass h-full overflow-auto" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-zinc-200 flex items-center justify-between">
              <div>
                <h2 className="text-zinc-900 font-mono">{selectedVar.name}</h2>
                <p className="text-[13px] text-zinc-500">{selectedVar.label}</p>
              </div>
              <button onClick={() => setSelectedVar(null)} className="text-zinc-400 hover:text-zinc-600 text-[20px]">&times;</button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex gap-2 flex-wrap">
                <span className={`text-[11px] px-2 py-0.5 rounded-full ${standardColors[selectedVar.standard]}`}>{selectedVar.standard}</span>
                <span className={`text-[11px] px-2 py-0.5 rounded-full ${originColors[selectedVar.origin]}`}>{selectedVar.origin}</span>
                <span className={`text-[11px] px-2 py-0.5 rounded-full ${coreColors[selectedVar.core]}`}>{selectedVar.core}</span>
                {selectedVar.required && <span className="text-[11px] px-2 py-0.5 rounded-full bg-red-100 text-red-700">Required</span>}
              </div>
              {[
                { label: 'Entity', value: selectedVar.entity },
                { label: 'Data Type', value: `${selectedVar.dataType}${selectedVar.length ? `(${selectedVar.length})` : ''}` },
                { label: 'Codelist', value: selectedVar.codelist || 'None' },
                { label: 'Description', value: selectedVar.description },
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
          <div className="w-[560px] glass rounded-2xl max-h-[80vh] overflow-auto" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-zinc-200">
              <h2 className="text-zinc-900">Create New Variable</h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[12px] text-zinc-500 mb-1 block">Name</label>
                  <input className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-[14px] text-zinc-900 outline-none font-mono" placeholder="VARNAME" />
                </div>
                <div>
                  <label className="text-[12px] text-zinc-500 mb-1 block">Label</label>
                  <input className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-[14px] text-zinc-900 outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-[12px] text-zinc-500 mb-1 block">Standard</label>
                  <select className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-[14px] text-zinc-900 outline-none">
                    <option>CDISC</option><option>OMOP</option><option>Custom</option>
                  </select>
                </div>
                <div>
                  <label className="text-[12px] text-zinc-500 mb-1 block">Entity</label>
                  <select className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-[14px] text-zinc-900 outline-none">
                    {entities.map(e => <option key={e}>{e}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[12px] text-zinc-500 mb-1 block">Data Type</label>
                  <select className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-[14px] text-zinc-900 outline-none">
                    {['Char','Num','Integer','Float','Date','DateTime','Boolean','Text'].map(t => <option key={t}>{t}</option>)}
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
