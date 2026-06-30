import { useState } from 'react';
import { Search, Add, Edit, Close, Location, Phone, Email, Certificate, Renew } from '@carbon/icons-react';

interface Lab {
  id: string;
  name: string;
  code: string;
  type: string;
  city: string;
  country: string;
  address: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  accreditations: string[];
  specializations: string[];
  status: 'Active' | 'Inactive' | 'Under Review';
  turnaroundDays: number;
  notes: string;
}

const MOCK_LABS: Lab[] = [
  {
    id: 'lab1', name: 'Central Laboratory Zurich', code: 'CLZ-01', type: 'Central Lab',
    city: 'Zurich', country: 'Switzerland', address: 'Rämistrasse 100, 8091 Zürich',
    contactName: 'Dr. Hans Müller', contactEmail: 'h.muller@clz.ch', contactPhone: '+41 44 123 4567',
    accreditations: ['ISO 15189', 'CAP', 'GLP'],
    specializations: ['Clinical Chemistry', 'Hematology', 'Immunology'],
    status: 'Active', turnaroundDays: 3, notes: 'Primary central lab for EU-based trials',
  },
  {
    id: 'lab2', name: 'MedPath Diagnostics', code: 'MPD-01', type: 'Reference Lab',
    city: 'London', country: 'United Kingdom', address: '45 Harley Street, London W1G 8QR',
    contactName: 'Dr. Sarah Williams', contactEmail: 's.williams@medpath.co.uk', contactPhone: '+44 20 7946 0958',
    accreditations: ['ISO 15189', 'UKAS'],
    specializations: ['Pathology', 'Histology', 'Molecular Diagnostics'],
    status: 'Active', turnaroundDays: 5, notes: 'Specialist in oncology tissue analysis',
  },
  {
    id: 'lab3', name: 'BioAnalytica GmbH', code: 'BAG-01', type: 'Specialty Lab',
    city: 'Munich', country: 'Germany', address: 'Leopoldstraße 42, 80802 München',
    contactName: 'Prof. Klaus Weber', contactEmail: 'k.weber@bioanalytica.de', contactPhone: '+49 89 2180 7230',
    accreditations: ['ISO 15189', 'GLP', 'GCP'],
    specializations: ['Pharmacokinetics', 'Biomarker Assays', 'ELISA'],
    status: 'Active', turnaroundDays: 7, notes: 'Specialized PK/PD and biomarker analysis',
  },
  {
    id: 'lab4', name: 'GenomeScan BV', code: 'GSC-01', type: 'Genomics Lab',
    city: 'Leiden', country: 'Netherlands', address: 'Plesmanlaan 1d, 2333 BZ Leiden',
    contactName: 'Dr. Jan de Vries', contactEmail: 'j.devries@genomescan.nl', contactPhone: '+31 71 568 7890',
    accreditations: ['ISO 17025', 'CLIA'],
    specializations: ['WES', 'WGS', 'RNA-Seq', 'Single-Cell Sequencing'],
    status: 'Active', turnaroundDays: 14, notes: 'NGS services and bioinformatics support',
  },
  {
    id: 'lab5', name: 'Covance Clinical Labs', code: 'CCL-01', type: 'Central Lab',
    city: 'Indianapolis', country: 'USA', address: '8211 SciCor Drive, Indianapolis, IN 46214',
    contactName: 'Mark Johnson', contactEmail: 'm.johnson@covance.com', contactPhone: '+1 317 271 1200',
    accreditations: ['CAP', 'CLIA', 'GLP'],
    specializations: ['Clinical Chemistry', 'Hematology', 'Coagulation', 'Urinalysis'],
    status: 'Active', turnaroundDays: 2, notes: 'Global central lab with 24/7 operations',
  },
  {
    id: 'lab6', name: 'Laboratorio San Raffaele', code: 'LSR-01', type: 'Academic Lab',
    city: 'Milan', country: 'Italy', address: 'Via Olgettina 60, 20132 Milano',
    contactName: 'Dr. Maria Bianchi', contactEmail: 'm.bianchi@hsr.it', contactPhone: '+39 02 2643 2511',
    accreditations: ['ISO 15189'],
    specializations: ['Flow Cytometry', 'Immunophenotyping', 'Cell Therapy QC'],
    status: 'Under Review', turnaroundDays: 5, notes: 'Renewal of ISO accreditation in progress',
  },
];

const statusColors: Record<string, string> = {
  Active: 'bg-emerald-100 text-emerald-800',
  Inactive: 'bg-zinc-200 text-zinc-600',
  'Under Review': 'bg-amber-100 text-amber-800',
};

const typeColors: Record<string, string> = {
  'Central Lab': 'bg-blue-100 text-blue-800',
  'Reference Lab': 'bg-violet-100 text-violet-800',
  'Specialty Lab': 'bg-cyan-100 text-cyan-800',
  'Genomics Lab': 'bg-indigo-100 text-indigo-800',
  'Academic Lab': 'bg-fuchsia-100 text-fuchsia-800',
};

function getTypeColor(t: string) {
  return typeColors[t] || 'bg-zinc-100 text-zinc-700';
}

export function Laboratory() {
  const [labs] = useState(MOCK_LABS);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [selected, setSelected] = useState<Lab | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  const types = Array.from(new Set(labs.map(l => l.type)));

  const filtered = labs.filter(l => {
    const q = search.toLowerCase();
    const matchSearch = l.name.toLowerCase().includes(q) || l.code.toLowerCase().includes(q) || l.city.toLowerCase().includes(q) || l.country.toLowerCase().includes(q);
    const matchType = filterType === 'All' || l.type === filterType;
    return matchSearch && matchType;
  });

  return (
    <div className="h-full flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-zinc-900">Laboratory</h1>
          <p className="text-[14px] text-zinc-500 mt-1">Manage partner laboratories, accreditations, and contact information</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 px-4 py-2 bg-zinc-900 text-white rounded-lg hover:opacity-90 transition-opacity text-[14px]">
          <Add size={16} /> New Laboratory
        </button>
      </div>

      <div className="flex gap-3 items-center">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input type="text" placeholder="Search by name, code, city, or country..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-zinc-200 rounded-lg text-[14px] text-zinc-900 placeholder:text-zinc-400 outline-none focus:ring-2 focus:ring-zinc-900/10" />
        </div>
        <select value={filterType} onChange={e => setFilterType(e.target.value)} className="px-3 py-2.5 bg-white border border-zinc-200 rounded-lg text-[14px] text-zinc-900 outline-none">
          <option value="All">All Types</option>
          {types.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="glass-card rounded-xl p-4">
          <p className="text-[12px] text-zinc-500">Total Labs</p>
          <p className="text-[24px] text-zinc-900 mt-1">{labs.length}</p>
        </div>
        <div className="glass-card rounded-xl p-4">
          <p className="text-[12px] text-zinc-500">Active</p>
          <p className="text-[24px] text-emerald-600 mt-1">{labs.filter(l => l.status === 'Active').length}</p>
        </div>
        <div className="glass-card rounded-xl p-4">
          <p className="text-[12px] text-zinc-500">Countries</p>
          <p className="text-[24px] text-zinc-900 mt-1">{new Set(labs.map(l => l.country)).size}</p>
        </div>
        <div className="glass-card rounded-xl p-4">
          <p className="text-[12px] text-zinc-500">Avg Turnaround</p>
          <p className="text-[24px] text-zinc-900 mt-1">{Math.round(labs.reduce((s, l) => s + l.turnaroundDays, 0) / labs.length)}d</p>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="flex-1 overflow-auto grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 content-start">
        {filtered.map(lab => (
          <div key={lab.id} className="glass-card rounded-xl p-5 cursor-pointer hover:shadow-md transition-all"
            onClick={() => setSelected(lab)}>
            <div className="flex items-start justify-between mb-3">
              <div className="min-w-0 flex-1">
                <p className="text-[15px] text-zinc-900 truncate">{lab.name}</p>
                <p className="text-[12px] text-zinc-500 font-mono">{lab.code}</p>
              </div>
              <div className="flex gap-1.5 shrink-0 ml-2">
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${getTypeColor(lab.type)}`}>{lab.type}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${statusColors[lab.status]}`}>{lab.status}</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-[12px] text-zinc-500 mb-3">
              <Location size={14} className="shrink-0" />
              <span className="truncate">{lab.city}, {lab.country}</span>
            </div>

            <div className="flex flex-wrap gap-1 mb-3">
              {lab.specializations.slice(0, 3).map(s => (
                <span key={s} className="text-[10px] px-2 py-0.5 bg-zinc-100 text-zinc-600 rounded-full">{s}</span>
              ))}
              {lab.specializations.length > 3 && (
                <span className="text-[10px] px-2 py-0.5 bg-zinc-100 text-zinc-500 rounded-full">+{lab.specializations.length - 3}</span>
              )}
            </div>

            <div className="flex items-center justify-between text-[12px] text-zinc-500 pt-3 border-t border-zinc-100">
              <div className="flex items-center gap-1">
                <Certificate size={14} />
                <span>{lab.accreditations.join(', ')}</span>
              </div>
              <span>{lab.turnaroundDays}d TAT</span>
            </div>
          </div>
        ))}
      </div>

      {/* Detail */}
      {selected && (
        <div className="fixed inset-0 bg-black/30 z-50 flex justify-end" onClick={() => setSelected(null)}>
          <div className="w-[520px] glass h-full overflow-auto" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-zinc-200 flex items-center justify-between">
              <div>
                <h2 className="text-zinc-900">{selected.name}</h2>
                <p className="text-[13px] text-zinc-500 font-mono">{selected.code}</p>
              </div>
              <button onClick={() => setSelected(null)} className="p-1.5 hover:bg-zinc-100 rounded-lg"><Close size={20} className="text-zinc-400" /></button>
            </div>
            <div className="p-6 space-y-5">
              <div className="flex gap-2 flex-wrap">
                <span className={`text-[11px] px-2.5 py-1 rounded-full ${getTypeColor(selected.type)}`}>{selected.type}</span>
                <span className={`text-[11px] px-2.5 py-1 rounded-full ${statusColors[selected.status]}`}>{selected.status}</span>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Location size={16} className="text-zinc-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[14px] text-zinc-900">{selected.address}</p>
                    <p className="text-[12px] text-zinc-500">{selected.city}, {selected.country}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Email size={16} className="text-zinc-400 shrink-0" />
                  <div>
                    <p className="text-[14px] text-zinc-900">{selected.contactName}</p>
                    <p className="text-[12px] text-zinc-500">{selected.contactEmail}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone size={16} className="text-zinc-400 shrink-0" />
                  <p className="text-[14px] text-zinc-900">{selected.contactPhone}</p>
                </div>
              </div>

              <div>
                <p className="text-[12px] text-zinc-500 mb-2">Accreditations</p>
                <div className="flex flex-wrap gap-2">
                  {selected.accreditations.map(a => (
                    <span key={a} className="text-[12px] px-3 py-1 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-200">{a}</span>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-[12px] text-zinc-500 mb-2">Specializations</p>
                <div className="flex flex-wrap gap-2">
                  {selected.specializations.map(s => (
                    <span key={s} className="text-[12px] px-3 py-1 bg-zinc-100 text-zinc-700 rounded-lg">{s}</span>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-[12px] text-zinc-500 mb-1">Turnaround Time</p>
                <p className="text-[14px] text-zinc-900">{selected.turnaroundDays} days</p>
              </div>

              {selected.notes && (
                <div>
                  <p className="text-[12px] text-zinc-500 mb-1">Notes</p>
                  <p className="text-[14px] text-zinc-900">{selected.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center" onClick={() => setShowCreate(false)}>
          <div className="w-[580px] glass rounded-2xl max-h-[85vh] overflow-auto" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-zinc-200">
              <h2 className="text-zinc-900">Add Laboratory</h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-[12px] text-zinc-500 mb-1 block">Name</label><input className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-[14px] text-zinc-900 outline-none" /></div>
                <div><label className="text-[12px] text-zinc-500 mb-1 block">Code</label><input className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-[14px] text-zinc-900 outline-none font-mono" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-[12px] text-zinc-500 mb-1 block">Type</label><input className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-[14px] text-zinc-900 outline-none" placeholder="e.g. Central Lab, Genomics Lab" /></div>
                <div><label className="text-[12px] text-zinc-500 mb-1 block">Turnaround (days)</label><input type="number" className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-[14px] text-zinc-900 outline-none" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-[12px] text-zinc-500 mb-1 block">City</label><input className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-[14px] text-zinc-900 outline-none" /></div>
                <div><label className="text-[12px] text-zinc-500 mb-1 block">Country</label><input className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-[14px] text-zinc-900 outline-none" /></div>
              </div>
              <div><label className="text-[12px] text-zinc-500 mb-1 block">Address</label><input className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-[14px] text-zinc-900 outline-none" /></div>
              <div className="grid grid-cols-3 gap-4">
                <div><label className="text-[12px] text-zinc-500 mb-1 block">Contact Name</label><input className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-[14px] text-zinc-900 outline-none" /></div>
                <div><label className="text-[12px] text-zinc-500 mb-1 block">Email</label><input className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-[14px] text-zinc-900 outline-none" /></div>
                <div><label className="text-[12px] text-zinc-500 mb-1 block">Phone</label><input className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-[14px] text-zinc-900 outline-none" /></div>
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
