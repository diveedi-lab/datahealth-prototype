import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Database, ChevronDown, Check, X, ZoomIn, ZoomOut, Maximize2, Table2,
  Key, Link2, Hash, Calendar, Type, ToggleLeft, ArrowRight, Layers
} from 'lucide-react';

// ─── Schema Types ───

interface Column {
  name: string;
  type: 'string' | 'integer' | 'float' | 'date' | 'boolean' | 'id';
  pk?: boolean;
  fk?: { table: string; column: string };
  nullable?: boolean;
  description: string;
}

interface TableSchema {
  name: string;
  label: string;
  columns: Column[];
  rowCount: number;
  color: string;
}

interface Relationship {
  from: { table: string; column: string };
  to: { table: string; column: string };
  type: '1:N' | '1:1' | 'N:M';
}

interface DbSchema {
  id: string;
  name: string;
  tables: TableSchema[];
  relationships: Relationship[];
}

// ─── Mock Schemas ───

const SCHEMAS: DbSchema[] = [
  {
    id: 'cardio-2024', name: 'CARDIO-2024',
    tables: [
      { name: 'patients', label: 'Patients', color: '#3b82f6', rowCount: 1420,
        columns: [
          { name: 'patient_id', type: 'id', pk: true, description: 'Unique patient identifier' },
          { name: 'age', type: 'integer', description: 'Patient age at enrollment' },
          { name: 'gender', type: 'string', description: 'Biological sex (M/F)' },
          { name: 'enrollment_date', type: 'date', description: 'Date of study enrollment' },
          { name: 'site_id', type: 'string', fk: { table: 'sites', column: 'site_id' }, description: 'Reference to study site' },
          { name: 'status', type: 'string', description: 'Patient status (Active, Completed, Withdrawn)' },
          { name: 'weight_kg', type: 'float', nullable: true, description: 'Weight in kilograms' },
          { name: 'height_cm', type: 'float', nullable: true, description: 'Height in centimeters' },
        ]
      },
      { name: 'lab_results', label: 'Lab Results', color: '#8b5cf6', rowCount: 8560,
        columns: [
          { name: 'lab_id', type: 'id', pk: true, description: 'Unique lab result identifier' },
          { name: 'patient_id', type: 'id', fk: { table: 'patients', column: 'patient_id' }, description: 'Reference to patient' },
          { name: 'test_name', type: 'string', description: 'Name of lab test' },
          { name: 'value', type: 'float', description: 'Numeric result value' },
          { name: 'unit', type: 'string', description: 'Measurement unit' },
          { name: 'collection_date', type: 'date', description: 'Sample collection date' },
          { name: 'flag', type: 'string', nullable: true, description: 'Abnormality flag (Normal, High, Low)' },
        ]
      },
      { name: 'adverse_events', label: 'Adverse Events', color: '#f59e0b', rowCount: 470,
        columns: [
          { name: 'ae_id', type: 'id', pk: true, description: 'Unique AE identifier' },
          { name: 'patient_id', type: 'id', fk: { table: 'patients', column: 'patient_id' }, description: 'Reference to patient' },
          { name: 'event_name', type: 'string', description: 'Adverse event description' },
          { name: 'severity', type: 'string', description: 'Severity grade (Mild, Moderate, Severe)' },
          { name: 'start_date', type: 'date', description: 'Event onset date' },
          { name: 'resolution_date', type: 'date', nullable: true, description: 'Event resolution date' },
          { name: 'related', type: 'string', description: 'Drug relatedness assessment' },
        ]
      },
      { name: 'medications', label: 'Medications', color: '#10b981', rowCount: 3200,
        columns: [
          { name: 'med_id', type: 'id', pk: true, description: 'Unique medication record ID' },
          { name: 'patient_id', type: 'id', fk: { table: 'patients', column: 'patient_id' }, description: 'Reference to patient' },
          { name: 'drug_name', type: 'string', description: 'Drug name' },
          { name: 'dose', type: 'string', description: 'Dosage amount and unit' },
          { name: 'frequency', type: 'string', description: 'Dosing frequency' },
          { name: 'start_date', type: 'date', description: 'Medication start date' },
          { name: 'end_date', type: 'date', nullable: true, description: 'Medication end date' },
        ]
      },
      { name: 'clinical_visits', label: 'Clinical Visits', color: '#ec4899', rowCount: 5680,
        columns: [
          { name: 'visit_id', type: 'id', pk: true, description: 'Unique visit identifier' },
          { name: 'patient_id', type: 'id', fk: { table: 'patients', column: 'patient_id' }, description: 'Reference to patient' },
          { name: 'visit_date', type: 'date', description: 'Date of clinical visit' },
          { name: 'visit_type', type: 'string', description: 'Visit type (Screening, Baseline, Follow-up)' },
          { name: 'investigator', type: 'string', description: 'Investigator name' },
          { name: 'site_id', type: 'string', fk: { table: 'sites', column: 'site_id' }, description: 'Reference to study site' },
        ]
      },
      { name: 'sites', label: 'Sites', color: '#64748b', rowCount: 12,
        columns: [
          { name: 'site_id', type: 'id', pk: true, description: 'Unique site identifier' },
          { name: 'site_name', type: 'string', description: 'Site institution name' },
          { name: 'country', type: 'string', description: 'Country code' },
          { name: 'pi_name', type: 'string', description: 'Principal investigator name' },
          { name: 'active', type: 'boolean', description: 'Site active status' },
        ]
      },
    ],
    relationships: [
      { from: { table: 'lab_results', column: 'patient_id' }, to: { table: 'patients', column: 'patient_id' }, type: '1:N' },
      { from: { table: 'adverse_events', column: 'patient_id' }, to: { table: 'patients', column: 'patient_id' }, type: '1:N' },
      { from: { table: 'medications', column: 'patient_id' }, to: { table: 'patients', column: 'patient_id' }, type: '1:N' },
      { from: { table: 'clinical_visits', column: 'patient_id' }, to: { table: 'patients', column: 'patient_id' }, type: '1:N' },
      { from: { table: 'patients', column: 'site_id' }, to: { table: 'sites', column: 'site_id' }, type: '1:N' },
      { from: { table: 'clinical_visits', column: 'site_id' }, to: { table: 'sites', column: 'site_id' }, type: '1:N' },
    ],
  },
];

const AVAILABLE_DBS = [
  { id: 'cardio-2024', name: 'CARDIO-2024', color: 'bg-rose-500' },
  { id: 'onco-trial-a', name: 'ONCO-TRIAL-A', color: 'bg-amber-500' },
  { id: 'neuro-phase3', name: 'NEURO-PHASE3', color: 'bg-violet-500' },
  { id: 'resp-pilot', name: 'RESP-PILOT', color: 'bg-emerald-500' },
  { id: 'derm-cohort-b', name: 'DERM-COHORT-B', color: 'bg-blue-500' },
];

// ─── Graph Layout ───

interface NodePos { x: number; y: number; w: number; h: number }

function computeLayout(tables: TableSchema[]): Record<string, NodePos> {
  const positions: Record<string, NodePos> = {};
  // Radial layout: patients at center, rest around
  const centerIdx = tables.findIndex(t => t.name === 'patients');
  const center = centerIdx >= 0 ? centerIdx : 0;
  const cx = 500, cy = 350;
  const nodeW = 220, nodeH = 56;
  
  tables.forEach((t, i) => {
    if (i === center) {
      positions[t.name] = { x: cx - nodeW / 2, y: cy - nodeH / 2, w: nodeW, h: nodeH };
    } else {
      const others = tables.length - 1;
      const adjustedIdx = i > center ? i - 1 : i;
      const angle = (adjustedIdx / others) * Math.PI * 2 - Math.PI / 2;
      const rx = 260, ry = 200;
      positions[t.name] = {
        x: cx + Math.cos(angle) * rx - nodeW / 2,
        y: cy + Math.sin(angle) * ry - nodeH / 2,
        w: nodeW,
        h: nodeH,
      };
    }
  });
  return positions;
}

function getEdgePoints(fromPos: NodePos, toPos: NodePos): { x1: number; y1: number; x2: number; y2: number } {
  const fcx = fromPos.x + fromPos.w / 2, fcy = fromPos.y + fromPos.h / 2;
  const tcx = toPos.x + toPos.w / 2, tcy = toPos.y + toPos.h / 2;
  return { x1: fcx, y1: fcy, x2: tcx, y2: tcy };
}

// ─── Type Icons ───

const TYPE_ICONS: Record<string, React.ReactNode> = {
  id: <Key className="w-3 h-3 text-amber-500" />,
  string: <Type className="w-3 h-3 text-blue-500" />,
  integer: <Hash className="w-3 h-3 text-emerald-500" />,
  float: <Hash className="w-3 h-3 text-teal-500" />,
  date: <Calendar className="w-3 h-3 text-violet-500" />,
  boolean: <ToggleLeft className="w-3 h-3 text-pink-500" />,
};

// ─── Main Component ───

export function DataExplorer() {
  const [selectedDb, setSelectedDb] = useState('cardio-2024');
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [hoveredTable, setHoveredTable] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const svgRef = useRef<SVGSVGElement>(null);

  const schema = SCHEMAS.find(s => s.id === selectedDb);
  const positions = schema ? computeLayout(schema.tables) : {};

  const selectedTableData = schema?.tables.find(t => t.name === selectedTable);

  const handleMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    if ((e.target as SVGElement).closest('.graph-node')) return;
    setIsPanning(true);
    setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!isPanning) return;
    setPan({ x: e.clientX - panStart.x, y: e.clientY - panStart.y });
  };
  const handleMouseUp = () => setIsPanning(false);

  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    setZoom(z => Math.max(0.4, Math.min(2, z - e.deltaY * 0.001)));
  }, []);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    svg.addEventListener('wheel', handleWheel, { passive: false });
    return () => svg.removeEventListener('wheel', handleWheel);
  }, [handleWheel]);

  const resetView = () => { setZoom(1); setPan({ x: 0, y: 0 }); };

  // Highlight relationships for hovered/selected table
  const highlightTable = hoveredTable || selectedTable;
  const highlightedRels = schema?.relationships.filter(
    r => r.from.table === highlightTable || r.to.table === highlightTable
  ) || [];
  const connectedTables = new Set(highlightedRels.flatMap(r => [r.from.table, r.to.table]));

  return (
    <div className="flex gap-4 h-full w-full min-h-0">
      {/* Graph Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-0">
        {/* Toolbar */}
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <div className="relative">
            <select
              value={selectedDb}
              onChange={e => { setSelectedDb(e.target.value); setSelectedTable(null); }}
              className="appearance-none bg-white border border-zinc-200 rounded-xl pl-9 pr-8 py-2 text-sm text-zinc-700 focus:ring-2 focus:ring-blue-500/50 outline-none"
            >
              {AVAILABLE_DBS.map(db => (
                <option key={db.id} value={db.id}>{db.name}</option>
              ))}
            </select>
            <Database className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-blue-500 pointer-events-none" />
            <ChevronDown className="w-4 h-4 absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
          </div>
          {schema && (
            <span className="text-xs text-zinc-400">
              {schema.tables.length} entities · {schema.relationships.length} relationships · {schema.tables.reduce((s, t) => s + t.columns.length, 0)} variables
            </span>
          )}
          <div className="flex-1" />
          <div className="flex items-center gap-1 bg-white border border-zinc-200 rounded-lg overflow-hidden">
            <button onClick={() => setZoom(z => Math.min(2, z + 0.15))} className="p-1.5 hover:bg-zinc-100 transition-colors">
              <ZoomIn className="w-4 h-4 text-zinc-500" />
            </button>
            <span className="text-xs text-zinc-400 w-10 text-center">{Math.round(zoom * 100)}%</span>
            <button onClick={() => setZoom(z => Math.max(0.4, z - 0.15))} className="p-1.5 hover:bg-zinc-100 transition-colors">
              <ZoomOut className="w-4 h-4 text-zinc-500" />
            </button>
            <div className="w-px h-5 bg-zinc-200" />
            <button onClick={resetView} className="p-1.5 hover:bg-zinc-100 transition-colors">
              <Maximize2 className="w-4 h-4 text-zinc-500" />
            </button>
          </div>
        </div>

        {/* SVG Graph */}
        <div className="flex-1 bg-white border border-zinc-200 rounded-xl shadow-sm overflow-hidden relative">
          {schema ? (
            <svg
              ref={svgRef}
              className="w-full h-full cursor-grab active:cursor-grabbing"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              <defs>
                <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
                  <polygon points="0 0, 8 3, 0 6" className="fill-zinc-300" />
                </marker>
                <marker id="arrowhead-hl" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
                  <polygon points="0 0, 8 3, 0 6" className="fill-blue-400" />
                </marker>
              </defs>
              <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
                {/* Edges */}
                {schema.relationships.map((rel, i) => {
                  const fromPos = positions[rel.from.table];
                  const toPos = positions[rel.to.table];
                  if (!fromPos || !toPos) return null;
                  const pts = getEdgePoints(fromPos, toPos);
                  const isHighlighted = highlightedRels.includes(rel);
                  return (
                    <g key={i}>
                      <line
                        x1={pts.x1} y1={pts.y1} x2={pts.x2} y2={pts.y2}
                        className={isHighlighted ? 'stroke-blue-400' : 'stroke-zinc-200'}
                        strokeWidth={isHighlighted ? 2.5 : 1.5}
                        strokeDasharray={rel.type === 'N:M' ? '6 3' : undefined}
                        markerEnd={isHighlighted ? 'url(#arrowhead-hl)' : 'url(#arrowhead)'}
                      />
                      {isHighlighted && (
                        <text
                          x={(pts.x1 + pts.x2) / 2} y={(pts.y1 + pts.y2) / 2 - 8}
                          textAnchor="middle"
                          className="text-[10px] fill-blue-500 font-medium"
                        >
                          {rel.type}
                        </text>
                      )}
                    </g>
                  );
                })}

                {/* Nodes */}
                {schema.tables.map(table => {
                  const pos = positions[table.name];
                  if (!pos) return null;
                  const isSelected = selectedTable === table.name;
                  const isConnected = connectedTables.has(table.name);
                  const isHovered = hoveredTable === table.name;
                  const dimmed = highlightTable && !isConnected;
                  return (
                    <g
                      key={table.name}
                      className="graph-node cursor-pointer"
                      onClick={() => setSelectedTable(isSelected ? null : table.name)}
                      onMouseEnter={() => setHoveredTable(table.name)}
                      onMouseLeave={() => setHoveredTable(null)}
                      style={{ opacity: dimmed ? 0.3 : 1, transition: 'opacity 0.2s' }}
                    >
                      <rect
                        x={pos.x} y={pos.y} width={pos.w} height={pos.h}
                        rx={12}
                        className={`transition-colors ${
                          isSelected
                            ? 'fill-blue-50 stroke-blue-400'
                            : isHovered
                            ? 'fill-zinc-50 stroke-zinc-300'
                            : 'fill-white stroke-zinc-200'
                        }`}
                        strokeWidth={isSelected ? 2 : 1}
                      />
                      {/* Color bar */}
                      <rect x={pos.x} y={pos.y} width={5} height={pos.h} rx={2.5} fill={table.color} />
                      {/* Table icon */}
                      <foreignObject x={pos.x + 14} y={pos.y + (pos.h - 18) / 2} width={18} height={18}>
                        <Table2 className="w-[18px] h-[18px]" style={{ color: table.color }} />
                      </foreignObject>
                      {/* Label */}
                      <text x={pos.x + 38} y={pos.y + pos.h / 2 - 4} className="text-[13px] fill-zinc-800 font-medium">
                        {table.label}
                      </text>
                      <text x={pos.x + 38} y={pos.y + pos.h / 2 + 12} className="text-[10px] fill-zinc-400">
                        {table.columns.length} cols · {table.rowCount.toLocaleString()} rows
                      </text>
                    </g>
                  );
                })}
              </g>
            </svg>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-zinc-400">
              <p className="text-sm">Schema not available for this database</p>
            </div>
          )}

          {/* Legend */}
          <div className="absolute bottom-3 left-3 bg-white/90 border border-zinc-200 rounded-lg px-3 py-2 flex items-center gap-4 text-[11px] text-zinc-500 backdrop-blur-sm">
            <span className="flex items-center gap-1.5"><span className="w-4 h-0.5 bg-zinc-300 inline-block" /> 1:N</span>
            <span className="flex items-center gap-1.5"><span className="w-4 h-0.5 bg-zinc-300 inline-block border-dashed border-t border-zinc-400" style={{ borderStyle: 'dashed' }} /> N:M</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-blue-100 border border-blue-400 inline-block" /> Selected</span>
            <span>Click node to inspect · Scroll to zoom · Drag to pan</span>
          </div>
        </div>
      </div>

      {/* Detail Panel */}
      {selectedTableData && (
        <div className="w-full lg:w-[380px] shrink-0 bg-white border border-zinc-200 rounded-xl shadow-sm flex flex-col overflow-hidden transition-colors">
          {/* Header */}
          <div className="p-4 border-b border-zinc-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: selectedTableData.color + '20' }}>
                <Table2 className="w-4 h-4" style={{ color: selectedTableData.color }} />
              </div>
              <div>
                <p className="text-sm font-semibold text-zinc-900">{selectedTableData.label}</p>
                <p className="text-[11px] text-zinc-400">{selectedTableData.name} · {selectedTableData.rowCount.toLocaleString()} rows</p>
              </div>
            </div>
            <button onClick={() => setSelectedTable(null)} className="p-1 text-zinc-400 hover:text-zinc-600 rounded-md hover:bg-zinc-100">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Columns */}
          <div className="flex-1 overflow-y-auto">
            <div className="px-4 pt-3 pb-1">
              <p className="text-[11px] uppercase tracking-wider text-zinc-400">
                Variables ({selectedTableData.columns.length})
              </p>
            </div>
            <div className="px-2 pb-4">
              {selectedTableData.columns.map(col => (
                <div key={col.name} className="px-2 py-2.5 rounded-lg hover:bg-zinc-50 transition-colors">
                  <div className="flex items-center gap-2 mb-0.5">
                    {TYPE_ICONS[col.type] || <Hash className="w-3 h-3 text-zinc-400" />}
                    <span className="text-sm font-medium text-zinc-800 font-mono">{col.name}</span>
                    {col.pk && (
                      <span className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-amber-100 text-amber-600 uppercase">PK</span>
                    )}
                    {col.fk && (
                      <span className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-blue-100 text-blue-600 uppercase flex items-center gap-0.5">
                        FK <ArrowRight className="w-2 h-2" /> {col.fk.table}
                      </span>
                    )}
                    {col.nullable && (
                      <span className="text-[9px] text-zinc-400 italic">nullable</span>
                    )}
                  </div>
                  <p className="text-[11px] text-zinc-500 ml-5">{col.description}</p>
                </div>
              ))}
            </div>

            {/* Relationships */}
            {highlightedRels.length > 0 && selectedTable && (
              <div className="px-4 pb-4">
                <p className="text-[11px] uppercase tracking-wider text-zinc-400 mb-2">
                  Relationships ({highlightedRels.length})
                </p>
                <div className="space-y-1.5">
                  {highlightedRels.map((rel, i) => {
                    const isOutgoing = rel.from.table === selectedTable;
                    const otherTable = isOutgoing ? rel.to.table : rel.from.table;
                    const otherData = schema?.tables.find(t => t.name === otherTable);
                    return (
                      <div key={i} className="flex items-center gap-2 px-2 py-2 bg-zinc-50 rounded-lg text-xs">
                        <Link2 className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                        <span className="text-zinc-600">
                          {isOutgoing ? rel.from.column : rel.to.column}
                        </span>
                        <ArrowRight className="w-3 h-3 text-zinc-400 shrink-0" />
                        <button
                          onClick={() => setSelectedTable(otherTable)}
                          className="font-medium text-blue-600 hover:underline"
                        >
                          {otherData?.label || otherTable}
                        </button>
                        <span className="text-zinc-400 ml-auto shrink-0">{rel.type}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
