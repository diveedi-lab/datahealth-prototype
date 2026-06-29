import { useState } from 'react';
import { Search, Add, Close, Location, Email, Phone, Certificate, Archive } from '@carbon/icons-react';

interface Biobank {
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
  sampleTypes: string[];
  storageCapacity: string;
  currentOccupancy: string;
  temperatureOptions: string[];
  status: 'Active' | 'Inactive' | 'Under Review';
  notes: string;
}

const MOCK_BIOBANKS: Biobank[] = [
  {
    id: 'bb1', name: 'Swiss Biobanking Platform', code: 'SBP-01', type: 'National Biobank',
    city: 'Lausanne', country: 'Switzerland', address: 'Route de la Corniche 9A, 1066 Épalinges',
    contactName: 'Dr. Pierre Lambert', contactEmail: 'p.lambert@sbp.ch', contactPhone: '+41 21 314 5678',
    accreditations: ['ISO 20387', 'ISBER Best Practices'],
    sampleTypes: ['Serum', 'Plasma', 'DNA', 'FFPE Tissue', 'Whole Blood', 'PBMC'],
    storageCapacity: '2.5M samples', currentOccupancy: '68%',
    temperatureOptions: ['-80°C', '-196°C (LN2)', '-20°C', '+4°C', 'Room Temp'],
    status: 'Active', notes: 'Hub for Swiss clinical trial biospecimens, 24/7 monitoring',
  },
  {
    id: 'bb2', name: 'UK Biobank Satellite', code: 'UKBS-01', type: 'Population Biobank',
    city: 'Manchester', country: 'United Kingdom', address: 'Cheadle Royal Business Park, SK8 3GQ',
    contactName: 'Dr. Emily Carter', contactEmail: 'e.carter@ukbiobank.ac.uk', contactPhone: '+44 161 475 1234',
    accreditations: ['ISO 20387', 'HTA Licensed'],
    sampleTypes: ['Serum', 'Plasma', 'Urine', 'Saliva', 'Whole Blood'],
    storageCapacity: '5M samples', currentOccupancy: '82%',
    temperatureOptions: ['-80°C', '-196°C (LN2)', '-20°C'],
    status: 'Active', notes: 'Access through approved research applications only',
  },
  {
    id: 'bb3', name: 'BBMRI-ERIC Partner Node Italy', code: 'BBMRI-IT', type: 'Research Network Node',
    city: 'Graz', country: 'Austria', address: 'Neue Stiftingtalstraße 2, 8010 Graz',
    contactName: 'Prof. Andrea Poli', contactEmail: 'a.poli@bbmri.eu', contactPhone: '+43 316 385 7290',
    accreditations: ['ISO 20387', 'BBMRI Quality Mark'],
    sampleTypes: ['Tissue', 'FFPE', 'Blood derivatives', 'Cell Lines'],
    storageCapacity: '800K samples', currentOccupancy: '55%',
    temperatureOptions: ['-80°C', '-196°C (LN2)', 'Room Temp (FFPE)'],
    status: 'Active', notes: 'Part of the European BBMRI-ERIC infrastructure',
  },
  {
    id: 'bb4', name: 'BioRepository Singapore', code: 'BRS-01', type: 'Hospital Biobank',
    city: 'Singapore', country: 'Singapore', address: '20 College Road, 169856',
    contactName: 'Dr. Wei Lin Tan', contactEmail: 'w.tan@brs.sg', contactPhone: '+65 6779 5555',
    accreditations: ['CAP Biorepository', 'ISO 20387'],
    sampleTypes: ['Serum', 'Plasma', 'CSF', 'Tissue', 'Bone Marrow'],
    storageCapacity: '1.2M samples', currentOccupancy: '71%',
    temperatureOptions: ['-80°C', '-196°C (LN2)', '-150°C'],
    status: 'Active', notes: 'Specializing in Asian population genetics samples',
  },
  {
    id: 'bb5', name: 'Charité CryoHub', code: 'CCH-01', type: 'Academic Biobank',
    city: 'Berlin', country: 'Germany', address: 'Charitéplatz 1, 10117 Berlin',
    contactName: 'Dr. Katrin Fischer', contactEmail: 'k.fischer@charite.de', contactPhone: '+49 30 450 536 001',
    accreditations: ['ISO 20387'],
    sampleTypes: ['Plasma', 'Serum', 'DNA', 'RNA', 'Organoids'],
    storageCapacity: '600K samples', currentOccupancy: '45%',
    temperatureOptions: ['-80°C', '-196°C (LN2)'],
    status: 'Under Review', notes: 'Expanding capacity, new LN2 facility under construction',
  },
];

const statusColors: Record<string, string> = {
  Active: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
  Inactive: 'bg-zinc-200 text-zinc-600 dark:bg-zinc-700/40 dark:text-zinc-400',
  'Under Review': 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
};

const typeColors: Record<string, string> = {
  'National Biobank': 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
  'Population Biobank': 'bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-300',
  'Research Network Node': 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/40 dark:text-cyan-300',
  'Hospital Biobank': 'bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300',
  'Academic Biobank': 'bg-fuchsia-100 text-fuchsia-800 dark:bg-fuchsia-900/40 dark:text-fuchsia-300',
};

function getTypeColor(t: string) {
  return typeColors[t] || 'bg-zinc-100 text-zinc-700 dark:bg-zinc-700/40 dark:text-zinc-300';
}

export function Biobank() {
  const [biobanks] = useState(MOCK_BIOBANKS);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [selected, setSelected] = useState<Biobank | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  const types = Array.from(new Set(biobanks.map(b => b.type)));

  const filtered = biobanks.filter(b => {
    const q = search.toLowerCase();
    const matchSearch = b.name.toLowerCase().includes(q) || b.code.toLowerCase().includes(q) || b.city.toLowerCase().includes(q) || b.country.toLowerCase().includes(q);
    const matchType = filterType === 'All' || b.type === filterType;
    return matchSearch && matchType;
  });

  return (
    <div className="h-full flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-zinc-900 dark:text-zinc-100">Biobank</h1>
          <p className="text-[14px] text-zinc-500 dark:text-zinc-400 mt-1">Manage partner biobanks, storage facilities, and sample type availability</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 px-4 py-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg hover:opacity-90 transition-opacity text-[14px]">
          <Add size={16} /> New Biobank
        </button>
      </div>

      <div className="flex gap-3 items-center">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input type="text" placeholder="Search by name, code, city, or country..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-[14px] text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 outline-none focus:ring-2 focus:ring-zinc-900/10 dark:focus:ring-zinc-100/10" />
        </div>
        <select value={filterType} onChange={e => setFilterType(e.target.value)} className="px-3 py-2.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-[14px] text-zinc-900 dark:text-zinc-100 outline-none">
          <option value="All">All Types</option>
          {types.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4">
          <p className="text-[12px] text-zinc-500 dark:text-zinc-400">Total Biobanks</p>
          <p className="text-[24px] text-zinc-900 dark:text-zinc-100 mt-1">{biobanks.length}</p>
        </div>
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4">
          <p className="text-[12px] text-zinc-500 dark:text-zinc-400">Active</p>
          <p className="text-[24px] text-emerald-600 dark:text-emerald-400 mt-1">{biobanks.filter(b => b.status === 'Active').length}</p>
        </div>
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4">
          <p className="text-[12px] text-zinc-500 dark:text-zinc-400">Countries</p>
          <p className="text-[24px] text-zinc-900 dark:text-zinc-100 mt-1">{new Set(biobanks.map(b => b.country)).size}</p>
        </div>
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4">
          <p className="text-[12px] text-zinc-500 dark:text-zinc-400">Sample Types</p>
          <p className="text-[24px] text-zinc-900 dark:text-zinc-100 mt-1">{new Set(biobanks.flatMap(b => b.sampleTypes)).size}</p>
        </div>
      </div>

      {/* Cards */}
      <div className="flex-1 overflow-auto grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 content-start">
        {filtered.map(bb => (
          <div key={bb.id} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 cursor-pointer hover:shadow-md dark:hover:border-zinc-700 transition-all"
            onClick={() => setSelected(bb)}>
            <div className="flex items-start justify-between mb-3">
              <div className="min-w-0 flex-1">
                <p className="text-[15px] text-zinc-900 dark:text-zinc-100 truncate">{bb.name}</p>
                <p className="text-[12px] text-zinc-500 dark:text-zinc-400 font-mono">{bb.code}</p>
              </div>
              <div className="flex gap-1.5 shrink-0 ml-2">
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${getTypeColor(bb.type)}`}>{bb.type}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${statusColors[bb.status]}`}>{bb.status}</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-[12px] text-zinc-500 dark:text-zinc-400 mb-3">
              <Location size={14} className="shrink-0" />
              <span>{bb.city}, {bb.country}</span>
            </div>

            <div className="space-y-2 mb-3 text-[12px]">
              <div className="flex justify-between text-zinc-500 dark:text-zinc-400">
                <span>Capacity</span><span className="text-zinc-700 dark:text-zinc-300">{bb.storageCapacity}</span>
              </div>
              <div className="flex justify-between text-zinc-500 dark:text-zinc-400">
                <span>Occupancy</span>
                <span className="text-zinc-700 dark:text-zinc-300">{bb.currentOccupancy}</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-1 mb-3">
              {bb.sampleTypes.slice(0, 4).map(s => (
                <span key={s} className="text-[10px] px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-full">{s}</span>
              ))}
              {bb.sampleTypes.length > 4 && (
                <span className="text-[10px] px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 rounded-full">+{bb.sampleTypes.length - 4}</span>
              )}
            </div>

            <div className="flex items-center gap-1 text-[11px] text-zinc-400 dark:text-zinc-500 pt-3 border-t border-zinc-100 dark:border-zinc-800">
              <Certificate size={14} />
              <span>{bb.accreditations.join(', ')}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Detail */}
      {selected && (
        <div className="fixed inset-0 bg-black/30 dark:bg-black/50 z-50 flex justify-end" onClick={() => setSelected(null)}>
          <div className="w-[520px] bg-white dark:bg-zinc-900 h-full shadow-xl overflow-auto" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <div>
                <h2 className="text-zinc-900 dark:text-zinc-100">{selected.name}</h2>
                <p className="text-[13px] text-zinc-500 dark:text-zinc-400 font-mono">{selected.code}</p>
              </div>
              <button onClick={() => setSelected(null)} className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg"><Close size={20} className="text-zinc-400" /></button>
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
                    <p className="text-[14px] text-zinc-900 dark:text-zinc-100">{selected.address}</p>
                    <p className="text-[12px] text-zinc-500 dark:text-zinc-400">{selected.city}, {selected.country}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Email size={16} className="text-zinc-400 shrink-0" />
                  <div>
                    <p className="text-[14px] text-zinc-900 dark:text-zinc-100">{selected.contactName}</p>
                    <p className="text-[12px] text-zinc-500 dark:text-zinc-400">{selected.contactEmail}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone size={16} className="text-zinc-400 shrink-0" />
                  <p className="text-[14px] text-zinc-900 dark:text-zinc-100">{selected.contactPhone}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-lg p-3">
                  <p className="text-[12px] text-zinc-500 dark:text-zinc-400">Storage Capacity</p>
                  <p className="text-[16px] text-zinc-900 dark:text-zinc-100 mt-1">{selected.storageCapacity}</p>
                </div>
                <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-lg p-3">
                  <p className="text-[12px] text-zinc-500 dark:text-zinc-400">Current Occupancy</p>
                  <p className="text-[16px] text-zinc-900 dark:text-zinc-100 mt-1">{selected.currentOccupancy}</p>
                </div>
              </div>

              <div>
                <p className="text-[12px] text-zinc-500 dark:text-zinc-400 mb-2">Temperature Options</p>
                <div className="flex flex-wrap gap-2">
                  {selected.temperatureOptions.map(t => (
                    <span key={t} className="text-[12px] px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg border border-blue-200 dark:border-blue-800">{t}</span>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-[12px] text-zinc-500 dark:text-zinc-400 mb-2">Accreditations</p>
                <div className="flex flex-wrap gap-2">
                  {selected.accreditations.map(a => (
                    <span key={a} className="text-[12px] px-3 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 rounded-lg border border-emerald-200 dark:border-emerald-800">{a}</span>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-[12px] text-zinc-500 dark:text-zinc-400 mb-2">Sample Types</p>
                <div className="flex flex-wrap gap-2">
                  {selected.sampleTypes.map(s => (
                    <span key={s} className="text-[12px] px-3 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-lg">{s}</span>
                  ))}
                </div>
              </div>

              {selected.notes && (
                <div>
                  <p className="text-[12px] text-zinc-500 dark:text-zinc-400 mb-1">Notes</p>
                  <p className="text-[14px] text-zinc-900 dark:text-zinc-100">{selected.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Create */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/30 dark:bg-black/50 z-50 flex items-center justify-center" onClick={() => setShowCreate(false)}>
          <div className="w-[580px] bg-white dark:bg-zinc-900 rounded-2xl shadow-xl max-h-[85vh] overflow-auto" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-zinc-200 dark:border-zinc-800">
              <h2 className="text-zinc-900 dark:text-zinc-100">Add Biobank</h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-[12px] text-zinc-500 dark:text-zinc-400 mb-1 block">Name</label><input className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-[14px] text-zinc-900 dark:text-zinc-100 outline-none" /></div>
                <div><label className="text-[12px] text-zinc-500 dark:text-zinc-400 mb-1 block">Code</label><input className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-[14px] text-zinc-900 dark:text-zinc-100 outline-none font-mono" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-[12px] text-zinc-500 dark:text-zinc-400 mb-1 block">Type</label><input className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-[14px] text-zinc-900 dark:text-zinc-100 outline-none" placeholder="e.g. Hospital Biobank" /></div>
                <div><label className="text-[12px] text-zinc-500 dark:text-zinc-400 mb-1 block">Storage Capacity</label><input className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-[14px] text-zinc-900 dark:text-zinc-100 outline-none" placeholder="e.g. 1M samples" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-[12px] text-zinc-500 dark:text-zinc-400 mb-1 block">City</label><input className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-[14px] text-zinc-900 dark:text-zinc-100 outline-none" /></div>
                <div><label className="text-[12px] text-zinc-500 dark:text-zinc-400 mb-1 block">Country</label><input className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-[14px] text-zinc-900 dark:text-zinc-100 outline-none" /></div>
              </div>
              <div><label className="text-[12px] text-zinc-500 dark:text-zinc-400 mb-1 block">Address</label><input className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-[14px] text-zinc-900 dark:text-zinc-100 outline-none" /></div>
              <div className="grid grid-cols-3 gap-4">
                <div><label className="text-[12px] text-zinc-500 dark:text-zinc-400 mb-1 block">Contact Name</label><input className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-[14px] text-zinc-900 dark:text-zinc-100 outline-none" /></div>
                <div><label className="text-[12px] text-zinc-500 dark:text-zinc-400 mb-1 block">Email</label><input className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-[14px] text-zinc-900 dark:text-zinc-100 outline-none" /></div>
                <div><label className="text-[12px] text-zinc-500 dark:text-zinc-400 mb-1 block">Phone</label><input className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-[14px] text-zinc-900 dark:text-zinc-100 outline-none" /></div>
              </div>
            </div>
            <div className="p-6 border-t border-zinc-200 dark:border-zinc-800 flex justify-end gap-3">
              <button onClick={() => setShowCreate(false)} className="px-4 py-2 text-[14px] text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors">Cancel</button>
              <button onClick={() => setShowCreate(false)} className="px-4 py-2 text-[14px] bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg hover:opacity-90 transition-opacity">Create</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
