import React, { useState, useMemo } from 'react';
import { 
  FileText, Users, HardDrive, Search, 
  ChevronRight, Activity, Database, Shield,
  Share2, Hash, Layers, List, Filter,
  FileDigit, FileJson, FileType2, ImageIcon
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const MOCK_DATABASES = [
  { id: 'db-alpha', name: 'DB-Alpha (Cardio)' },
  { id: 'db-beta', name: 'DB-Beta (Neuro)' },
  { id: 'db-gamma', name: 'DB-Gamma (Onco)' },
];

const MOCK_DATA_DASHBOARD: Record<string, any> = {
  'db-alpha': { 
    variables: 1250, 
    entities: 24, 
    spaceGB: 450, 
    rows: 2450000,
    fileTypes: { PDF: 450, DICOM: 120, XLSX: 80 }
  },
  'db-beta': { 
    variables: 840, 
    entities: 18, 
    spaceGB: 280, 
    rows: 1200000,
    fileTypes: { PDF: 320, CSV: 150 }
  },
  'db-gamma': { 
    variables: 3200, 
    entities: 45, 
    spaceGB: 1228, // 1.2 TB
    rows: 8500000,
    fileTypes: { DICOM: 850, PDF: 1200, JSON: 400 }
  },
};

const PIE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#6366f1', '#8b5cf6'];

export function Dashboard() {
  const [selectedDbs, setSelectedDbs] = useState<string[]>(['db-alpha', 'db-beta', 'db-gamma']);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const toggleDb = (id: string) => {
    setSelectedDbs(prev => 
      prev.includes(id) ? prev.filter(dbId => dbId !== id) : [...prev, id]
    );
  };

  const selectAll = () => setSelectedDbs(MOCK_DATABASES.map(db => db.id));
  const deselectAll = () => setSelectedDbs([]);

  const dashboardStats = useMemo(() => {
    let variables = 0;
    let entities = 0;
    let spaceGB = 0;
    let rows = 0;
    const fileTypes: Record<string, number> = {};

    selectedDbs.forEach(id => {
      const db = MOCK_DATA_DASHBOARD[id];
      if (db) {
        variables += db.variables;
        entities += db.entities;
        spaceGB += db.spaceGB;
        rows += db.rows;
        
        Object.entries(db.fileTypes).forEach(([type, count]) => {
          fileTypes[type] = (fileTypes[type] || 0) + (count as number);
        });
      }
    });

    const fileChartData = Object.entries(fileTypes)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    return {
      variables,
      entities,
      space: spaceGB >= 1024 ? (spaceGB / 1024).toFixed(2) + ' TB' : Math.round(spaceGB) + ' GB',
      rows: new Intl.NumberFormat('en-US', { notation: "compact", compactDisplay: "short" }).format(rows),
      fileTypes: fileChartData
    };
  }, [selectedDbs]);

  return (
    <div className="flex flex-col gap-8 w-full max-w-7xl mx-auto h-full overflow-y-auto pb-10">
      
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Data Lake Overview</h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">General statistics, sharing summary, and specific database insights.</p>
        </div>
      </div>

      {/* Section 1: Data Lake Report */}
      <section>
        <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-4">Data Lake Report</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col justify-between">
            <div className="flex items-start justify-between mb-4">
              <div className="bg-emerald-100 dark:bg-emerald-900/30 p-2 rounded-xl text-emerald-600 dark:text-emerald-400">
                <Activity className="w-5 h-5" />
              </div>
              <span className="text-xs font-medium text-zinc-500 bg-zinc-100 dark:bg-zinc-800 dark:text-zinc-400 px-2 py-1 rounded-full">Last 30d</span>
            </div>
            <div>
              <h3 className="text-3xl font-bold text-zinc-900 dark:text-white">99.99%</h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">System Uptime</p>
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col justify-between">
            <div className="flex items-start justify-between mb-4">
              <div className="bg-indigo-100 dark:bg-indigo-900/30 p-2 rounded-xl text-indigo-600 dark:text-indigo-400">
                <Users className="w-5 h-5" />
              </div>
              <span className="text-xs font-medium text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 px-2 py-1 rounded-full">+5%</span>
            </div>
            <div>
              <h3 className="text-3xl font-bold text-zinc-900 dark:text-white">8,432</h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Registered Patients</p>
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col justify-between">
            <div className="flex items-start justify-between mb-4">
              <div className="bg-amber-100 dark:bg-amber-900/30 p-2 rounded-xl text-amber-600 dark:text-amber-400">
                <FileText className="w-5 h-5" />
              </div>
              <span className="text-xs font-medium text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 px-2 py-1 rounded-full">+22%</span>
            </div>
            <div>
              <h3 className="text-3xl font-bold text-zinc-900 dark:text-white">45.2k</h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Registered Files</p>
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col justify-between">
            <div className="flex items-start justify-between mb-4">
              <div className="bg-rose-100 dark:bg-rose-900/30 p-2 rounded-xl text-rose-600 dark:text-rose-400">
                <HardDrive className="w-5 h-5" />
              </div>
              <span className="text-xs font-medium text-zinc-600 bg-zinc-100 dark:bg-zinc-800 dark:text-zinc-400 px-2 py-1 rounded-full">3 DBs Active</span>
            </div>
            <div>
              <h3 className="text-3xl font-bold text-zinc-900 dark:text-white">1.9 TB</h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Total Database Size</p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Sharing Summary */}
      <section>
        <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-4">Sharing Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center gap-4">
            <div className="bg-blue-100 dark:bg-blue-900/30 p-4 rounded-full text-blue-600 dark:text-blue-400 shrink-0">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">People with Access</p>
              <h4 className="text-2xl font-bold text-zinc-900 dark:text-white">142</h4>
            </div>
          </div>
          
          <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center gap-4">
            <div className="bg-violet-100 dark:bg-violet-900/30 p-4 rounded-full text-violet-600 dark:text-violet-400 shrink-0">
              <Search className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Queries Performed</p>
              <h4 className="text-2xl font-bold text-zinc-900 dark:text-white">1.2M</h4>
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center gap-4">
            <div className="bg-fuchsia-100 dark:bg-fuchsia-900/30 p-4 rounded-full text-fuchsia-600 dark:text-fuchsia-400 shrink-0">
              <Share2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Active Collaborations</p>
              <h4 className="text-2xl font-bold text-zinc-900 dark:text-white">8</h4>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Data Dashboard */}
      <section className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm p-6 overflow-hidden transition-colors duration-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Data Dashboard</h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Detailed variable and entity breakdown by selected databases.</p>
          </div>
          
          {/* Custom Multi-select Filter */}
          <div className="relative">
            <button 
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="flex items-center gap-2 px-4 py-2 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
            >
              <Filter className="w-4 h-4" />
              Filter Databases ({selectedDbs.length})
            </button>
            
            {isFilterOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setIsFilterOpen(false)} />
                <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl z-20 overflow-hidden">
                  <div className="p-2 flex gap-2 border-b border-zinc-100 dark:border-zinc-800">
                    <button onClick={selectAll} className="flex-1 text-xs py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded hover:bg-blue-100 dark:hover:bg-blue-900/40">Select All</button>
                    <button onClick={deselectAll} className="flex-1 text-xs py-1.5 bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded hover:bg-zinc-100 dark:hover:bg-zinc-700">Clear</button>
                  </div>
                  <div className="max-h-60 overflow-y-auto p-2">
                    {MOCK_DATABASES.map(db => (
                      <label key={db.id} className="flex items-center gap-3 p-2 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 rounded-lg cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={selectedDbs.includes(db.id)}
                          onChange={() => toggleDb(db.id)}
                          className="rounded border-zinc-300 dark:border-zinc-600 text-blue-600 focus:ring-blue-500/50 dark:bg-zinc-800"
                        />
                        <span className="text-sm text-zinc-700 dark:text-zinc-300">{db.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {selectedDbs.length === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center text-zinc-400 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl">
            <Database className="w-8 h-8 mb-3 opacity-50" />
            <p>Please select at least one database to view statistics.</p>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Stats Grid */}
            <div className="flex-1 grid grid-cols-2 gap-4">
              <div className="bg-zinc-50 dark:bg-zinc-950 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center gap-2 mb-2 text-zinc-500 dark:text-zinc-400">
                  <Hash className="w-4 h-4" />
                  <span className="text-sm font-medium">Total Variables</span>
                </div>
                <p className="text-2xl font-bold text-zinc-900 dark:text-white">{dashboardStats.variables.toLocaleString()}</p>
              </div>
              
              <div className="bg-zinc-50 dark:bg-zinc-950 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center gap-2 mb-2 text-zinc-500 dark:text-zinc-400">
                  <Layers className="w-4 h-4" />
                  <span className="text-sm font-medium">Entities</span>
                </div>
                <p className="text-2xl font-bold text-zinc-900 dark:text-white">{dashboardStats.entities.toLocaleString()}</p>
              </div>

              <div className="bg-zinc-50 dark:bg-zinc-950 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center gap-2 mb-2 text-zinc-500 dark:text-zinc-400">
                  <List className="w-4 h-4" />
                  <span className="text-sm font-medium">Total Entries (Rows)</span>
                </div>
                <p className="text-2xl font-bold text-zinc-900 dark:text-white">{dashboardStats.rows}</p>
              </div>

              <div className="bg-zinc-50 dark:bg-zinc-950 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center gap-2 mb-2 text-zinc-500 dark:text-zinc-400">
                  <HardDrive className="w-4 h-4" />
                  <span className="text-sm font-medium">Space Occupied</span>
                </div>
                <p className="text-2xl font-bold text-zinc-900 dark:text-white">{dashboardStats.space}</p>
              </div>
            </div>

            {/* File Types Breakdown */}
            <div className="w-full lg:w-80 shrink-0 bg-zinc-50 dark:bg-zinc-950 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 flex flex-col">
              <h4 className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-4">Saved Files by Type</h4>
              <div className="flex-1 flex items-center justify-center min-h-[160px]">
                {dashboardStats.fileTypes.length > 0 ? (
                  <ResponsiveContainer width="100%" height={160}>
                    <PieChart>
                      <Pie
                        data={dashboardStats.fileTypes}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={70}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {dashboardStats.fileTypes.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                        itemStyle={{ color: '#fff' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-sm text-zinc-500">No files found.</p>
                )}
              </div>
              <div className="flex flex-wrap gap-2 mt-4 justify-center">
                {dashboardStats.fileTypes.map((type, idx) => (
                  <div key={type.name} className="flex items-center gap-1.5 text-xs text-zinc-600 dark:text-zinc-400">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }} />
                    {type.name} ({type.value})
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </section>

    </div>
  );
}