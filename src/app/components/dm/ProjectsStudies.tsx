import { useState } from 'react';
import { Search, Add, ChevronDown, ChevronRight, FolderOpen, Edit, TrashCan, Close } from '@carbon/icons-react';

interface MetadataField {
  key: string;
  value: string;
}

interface ProjectItem {
  id: string;
  name: string;
  type: string;
  description: string;
  status: 'Active' | 'Completed' | 'Planned' | 'Suspended' | 'Archived';
  metadata: MetadataField[];
  children: ProjectItem[];
  createdAt: string;
}

const MOCK_PROJECTS: ProjectItem[] = [
  {
    id: 'p1', name: 'Oncology Research Program', type: 'Program', description: 'Multi-study oncology research initiative across institutions', status: 'Active', createdAt: '2023-06-01',
    metadata: [
      { key: 'Therapeutic Area', value: 'Oncology' },
      { key: 'Lead Institution', value: 'University Hospital Zurich' },
      { key: 'Funding', value: 'EU Horizon 2024' },
    ],
    children: [
      {
        id: 's1', name: 'ONCO-2024-001', type: 'Clinical Trial', description: 'Phase III randomized double-blind trial for advanced NSCLC', status: 'Active', createdAt: '2024-01-15',
        metadata: [
          { key: 'Phase', value: 'III' },
          { key: 'Sponsor', value: 'PharmaCorp AG' },
          { key: 'Protocol ID', value: 'PC-ONCO-301' },
          { key: 'ClinicalTrials.gov', value: 'NCT00000001' },
          { key: 'Data Standard', value: 'CDISC SDTM 3.4' },
          { key: 'Target Enrollment', value: '450' },
        ],
        children: [],
      },
      {
        id: 's2', name: 'ONCO-BIO-002', type: 'Biomarker Study', description: 'Exploratory biomarker discovery in tumor tissue samples', status: 'Planned', createdAt: '2024-06-01',
        metadata: [
          { key: 'Sample Type', value: 'FFPE Tissue' },
          { key: 'PI', value: 'Dr. Elena Rossi' },
          { key: 'Expected Samples', value: '200' },
        ],
        children: [],
      },
    ],
  },
  {
    id: 'p2', name: 'Cardiology Data Hub', type: 'Research Project', description: 'Cardiovascular disease observational data collection', status: 'Active', createdAt: '2023-03-10',
    metadata: [
      { key: 'Therapeutic Area', value: 'Cardiology' },
      { key: 'Data Standard', value: 'OMOP CDM 5.4' },
      { key: 'Consortium', value: 'EHR-Heart Network' },
    ],
    children: [
      {
        id: 's3', name: 'CARDIO-RWE-01', type: 'Observational Study', description: 'Retrospective cohort study on heart failure outcomes', status: 'Active', createdAt: '2023-09-01',
        metadata: [
          { key: 'Design', value: 'Retrospective Cohort' },
          { key: 'Data Source', value: 'EHR + Claims' },
          { key: 'Population', value: '~12,000 patients' },
        ],
        children: [],
      },
      {
        id: 's4', name: 'CARDIO-REG-01', type: 'Registry', description: 'Prospective patient registry for arrhythmia patients', status: 'Active', createdAt: '2023-03-10',
        metadata: [
          { key: 'Registry Type', value: 'Prospective' },
          { key: 'Sites', value: '14 centers across 5 countries' },
          { key: 'Sponsor', value: 'HealthNet Foundation' },
        ],
        children: [],
      },
    ],
  },
  {
    id: 'p3', name: 'Rare Disease Consortium', type: 'Consortium', description: 'Cross-institutional data sharing for rare genetic diseases', status: 'Active', createdAt: '2022-01-01',
    metadata: [
      { key: 'Diseases', value: 'Gaucher, Fabry, Pompe' },
      { key: 'Partners', value: '8 institutions' },
      { key: 'Data Model', value: 'Custom + OMOP mapping' },
    ],
    children: [
      {
        id: 's5', name: 'RARE-GEN-001', type: 'Genetic Study', description: 'Whole exome sequencing and phenotype correlation', status: 'Completed', createdAt: '2022-01-01',
        metadata: [
          { key: 'Sequencing', value: 'WES' },
          { key: 'Samples Analyzed', value: '342' },
          { key: 'Completion Date', value: '2024-08-15' },
        ],
        children: [],
      },
    ],
  },
  {
    id: 'p4', name: 'Parexel International', type: 'CRO', description: 'Contract research organization managing Phase I–IV trials globally', status: 'Active', createdAt: '2023-02-15',
    metadata: [
      { key: 'Region', value: 'Global' },
      { key: 'Specialization', value: 'Oncology, Rare Disease' },
      { key: 'Active Protocols', value: '12' },
      { key: 'Contact', value: 'ops@parexel-demo.com' },
    ],
    children: [],
  },
  {
    id: 'p5', name: 'Charité University Hospital', type: 'Hospital', description: 'Major academic medical center and clinical trial site in Berlin', status: 'Active', createdAt: '2022-09-01',
    metadata: [
      { key: 'City', value: 'Berlin, Germany' },
      { key: 'Beds', value: '3,000+' },
      { key: 'Research Departments', value: '17' },
      { key: 'Ethics Committee ID', value: 'EA2/034/22' },
    ],
    children: [
      {
        id: 's6', name: 'CHR-CARDIO-01', type: 'Clinical Trial', description: 'Investigator-initiated trial on novel anticoagulants', status: 'Active', createdAt: '2024-03-01',
        metadata: [
          { key: 'PI', value: 'Prof. Thomas Meier' },
          { key: 'Phase', value: 'II' },
          { key: 'Enrollment', value: '120' },
        ],
        children: [],
      },
    ],
  },
  {
    id: 'p6', name: 'GenomaTech AG', type: 'Biotech', description: 'Biotech company specializing in gene therapy and CRISPR-based treatments', status: 'Active', createdAt: '2023-11-20',
    metadata: [
      { key: 'Focus', value: 'Gene Therapy' },
      { key: 'Pipeline Stage', value: 'Preclinical / Phase I' },
      { key: 'HQ', value: 'Basel, Switzerland' },
      { key: 'Partnership Type', value: 'Co-development' },
    ],
    children: [
      {
        id: 's7', name: 'GT-CRISPR-001', type: 'Biomarker Study', description: 'CRISPR efficacy biomarker identification in patient-derived organoids', status: 'Planned', createdAt: '2025-01-01',
        metadata: [
          { key: 'Technology', value: 'CRISPR-Cas9' },
          { key: 'Model', value: 'Patient-derived Organoids' },
          { key: 'Expected Start', value: 'Q2 2025' },
        ],
        children: [],
      },
    ],
  },
];

const statusColors: Record<string, string> = {
  Active: 'bg-emerald-100 text-emerald-800',
  Completed: 'bg-blue-100 text-blue-800',
  Planned: 'bg-amber-100 text-amber-800',
  Suspended: 'bg-red-100 text-red-800',
  Archived: 'bg-zinc-200 text-zinc-600',
};

const typeColors: Record<string, string> = {
  Program: 'bg-indigo-100 text-indigo-800',
  'Research Project': 'bg-violet-100 text-violet-800',
  Consortium: 'bg-fuchsia-100 text-fuchsia-800',
  'Clinical Trial': 'bg-cyan-100 text-cyan-800',
  'Observational Study': 'bg-teal-100 text-teal-800',
  Registry: 'bg-sky-100 text-sky-800',
  'Biomarker Study': 'bg-orange-100 text-orange-800',
  'Genetic Study': 'bg-rose-100 text-rose-800',
  'CRO': 'bg-lime-100 text-lime-800',
  'Hospital': 'bg-pink-100 text-pink-800',
  'Biotech': 'bg-emerald-100 text-emerald-800',
};

function getTypeColor(type: string) {
  return typeColors[type] || 'bg-zinc-100 text-zinc-700';
}

export function ProjectsStudies() {
  const [projects] = useState(MOCK_PROJECTS);
  const [expanded, setExpanded] = useState<Set<string>>(new Set(['p1', 'p2']));
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<ProjectItem | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newMeta, setNewMeta] = useState<MetadataField[]>([{ key: '', value: '' }]);

  const toggle = (id: string) => {
    const n = new Set(expanded);
    n.has(id) ? n.delete(id) : n.add(id);
    setExpanded(n);
  };

  const filtered = projects.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.type.toLowerCase().includes(search.toLowerCase()) ||
    p.children.some(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.type.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="h-full flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-zinc-900">Projects & Studies</h1>
          <p className="text-[14px] text-zinc-500 mt-1">Organize research projects, studies, registries, and programs with flexible metadata</p>
        </div>
        <button onClick={() => { setShowCreate(true); setNewMeta([{ key: '', value: '' }]); }}
          className="flex items-center gap-2 px-4 py-2 bg-zinc-900 text-white rounded-lg hover:opacity-90 transition-opacity text-[14px]">
          <Add size={16} /> New Item
        </button>
      </div>

      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
        <input type="text" placeholder="Search by name or type..." value={search} onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-zinc-200 rounded-lg text-[14px] text-zinc-900 placeholder:text-zinc-400 outline-none focus:ring-2 focus:ring-zinc-900/10" />
      </div>

      {/* Tree */}
      <div className="flex-1 overflow-auto space-y-3">
        {filtered.map(project => (
          <div key={project.id} className="bg-white border border-zinc-200 rounded-xl overflow-hidden">
            <div className="flex items-center gap-3 px-5 py-4 cursor-pointer hover:bg-zinc-50 transition-colors"
              onClick={() => toggle(project.id)}>
              {project.children.length > 0 ? (
                expanded.has(project.id) ? <ChevronDown size={16} className="text-zinc-400 shrink-0" /> : <ChevronRight size={16} className="text-zinc-400 shrink-0" />
              ) : <div className="w-4" />}
              <FolderOpen size={18} className="text-zinc-500 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-[15px] text-zinc-900 truncate">{project.name}</p>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full shrink-0 ${getTypeColor(project.type)}`}>{project.type}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full shrink-0 ${statusColors[project.status]}`}>{project.status}</span>
                </div>
                <p className="text-[12px] text-zinc-500 truncate">{project.description}</p>
              </div>
              <span className="text-[12px] text-zinc-400 shrink-0">{project.children.length} {project.children.length === 1 ? 'child' : 'children'}</span>
              <button className="p-1.5 hover:bg-zinc-100 rounded-lg transition-colors shrink-0" onClick={e => { e.stopPropagation(); setSelected(project); }}>
                <Edit size={14} className="text-zinc-400" />
              </button>
            </div>

            {expanded.has(project.id) && project.children.length > 0 && (
              <div className="border-t border-zinc-100">
                {project.children.map(child => (
                  <div key={child.id}
                    className="flex items-center gap-3 px-5 py-3 pl-14 hover:bg-zinc-50 cursor-pointer transition-colors border-b last:border-b-0 border-zinc-100"
                    onClick={() => setSelected(child)}>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-[14px] text-zinc-800">{child.name}</p>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full shrink-0 ${getTypeColor(child.type)}`}>{child.type}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full shrink-0 ${statusColors[child.status]}`}>{child.status}</span>
                      </div>
                      <p className="text-[12px] text-zinc-500 truncate">{child.description}</p>
                    </div>
                    <span className="text-[12px] text-zinc-400 shrink-0">{child.metadata.length} fields</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Detail Panel */}
      {selected && (
        <div className="fixed inset-0 bg-black/30 z-50 flex justify-end" onClick={() => setSelected(null)}>
          <div className="w-[520px] bg-white h-full shadow-xl overflow-auto" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-zinc-200 flex items-center justify-between">
              <div>
                <h2 className="text-zinc-900">{selected.name}</h2>
                <p className="text-[13px] text-zinc-500">{selected.description}</p>
              </div>
              <button onClick={() => setSelected(null)} className="p-1.5 hover:bg-zinc-100 rounded-lg"><Close size={20} className="text-zinc-400" /></button>
            </div>
            <div className="p-6 space-y-5">
              <div className="flex gap-2 flex-wrap">
                <span className={`text-[11px] px-2.5 py-1 rounded-full ${getTypeColor(selected.type)}`}>{selected.type}</span>
                <span className={`text-[11px] px-2.5 py-1 rounded-full ${statusColors[selected.status]}`}>{selected.status}</span>
              </div>

              <div>
                <p className="text-[12px] text-zinc-500 mb-1">Created</p>
                <p className="text-[14px] text-zinc-900">{selected.createdAt}</p>
              </div>

              <div>
                <p className="text-[12px] text-zinc-500 mb-3">Metadata</p>
                <div className="space-y-2">
                  {selected.metadata.map((m, i) => (
                    <div key={i} className="flex items-center gap-3 bg-zinc-50 rounded-lg px-4 py-2.5">
                      <span className="text-[12px] text-zinc-500 min-w-[140px] shrink-0">{m.key}</span>
                      <span className="text-[14px] text-zinc-900">{m.value}</span>
                    </div>
                  ))}
                  {selected.metadata.length === 0 && (
                    <p className="text-[13px] text-zinc-400 italic">No metadata defined</p>
                  )}
                </div>
              </div>

              {selected.children.length > 0 && (
                <div>
                  <p className="text-[12px] text-zinc-500 mb-3">Children ({selected.children.length})</p>
                  <div className="space-y-2">
                    {selected.children.map(c => (
                      <div key={c.id} className="flex items-center gap-2 bg-zinc-50 rounded-lg px-4 py-2.5 cursor-pointer hover:bg-zinc-100 transition-colors"
                        onClick={() => setSelected(c)}>
                        <span className="text-[14px] text-zinc-900 flex-1">{c.name}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${getTypeColor(c.type)}`}>{c.type}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center" onClick={() => setShowCreate(false)}>
          <div className="w-[580px] bg-white rounded-2xl shadow-xl max-h-[85vh] overflow-auto" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-zinc-200">
              <h2 className="text-zinc-900">Create New Item</h2>
              <p className="text-[13px] text-zinc-500 mt-1">Add a project, study, registry, or any research item</p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-[12px] text-zinc-500 mb-1 block">Name</label>
                <input className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-[14px] text-zinc-900 outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[12px] text-zinc-500 mb-1 block">Type</label>
                  <input className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-[14px] text-zinc-900 outline-none" placeholder="e.g. Research Project, Clinical Trial..." />
                </div>
                <div>
                  <label className="text-[12px] text-zinc-500 mb-1 block">Parent (optional)</label>
                  <select className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-[14px] text-zinc-900 outline-none">
                    <option value="">None (top-level)</option>
                    {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-[12px] text-zinc-500 mb-1 block">Description</label>
                <textarea className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-[14px] text-zinc-900 outline-none resize-none h-16" />
              </div>

              {/* Flexible Metadata */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[12px] text-zinc-500">Metadata Fields</label>
                  <button onClick={() => setNewMeta([...newMeta, { key: '', value: '' }])} className="text-[12px] text-zinc-500 hover:text-zinc-900 flex items-center gap-1 transition-colors">
                    <Add size={14} /> Add Field
                  </button>
                </div>
                <div className="space-y-2">
                  {newMeta.map((m, i) => (
                    <div key={i} className="flex gap-2 items-center">
                      <input placeholder="Key" value={m.key} onChange={e => { const n = [...newMeta]; n[i].key = e.target.value; setNewMeta(n); }}
                        className="flex-1 px-3 py-2 bg-white border border-zinc-200 rounded-lg text-[13px] text-zinc-900 outline-none" />
                      <input placeholder="Value" value={m.value} onChange={e => { const n = [...newMeta]; n[i].value = e.target.value; setNewMeta(n); }}
                        className="flex-1 px-3 py-2 bg-white border border-zinc-200 rounded-lg text-[13px] text-zinc-900 outline-none" />
                      {newMeta.length > 1 && (
                        <button onClick={() => setNewMeta(newMeta.filter((_, j) => j !== i))} className="p-1.5 hover:bg-zinc-100 rounded-lg transition-colors shrink-0">
                          <Close size={14} className="text-zinc-400" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
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