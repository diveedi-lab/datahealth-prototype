import React from 'react';
import type { NodeProps } from '@xyflow/react';
import { Database, ChevronRight } from 'lucide-react';
import type { ExploreCollection } from '../../types';
import { NodeShell } from '../../../ingestor/canvas/nodeShell';

type RFData = { collection: ExploreCollection; _dimmed?: boolean };

function CollectionNodeImpl({ data, selected }: NodeProps) {
  const { collection: c, _dimmed } = data as RFData;
  return (
    <NodeShell color={c.color} selected={selected} dimmed={_dimmed} width={244} clickable hasTarget={false} hasSource>
      <div className="flex items-center gap-2">
        <Database className="w-4 h-4 shrink-0" style={{ color: c.color }} />
        <span className="font-semibold text-[13px] text-zinc-800 truncate flex-1">{c.name}</span>
        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: c.color }} />
      </div>
      <p className="text-[10px] text-zinc-400 mt-1">
        {c.tableCount} tabelle · {c.variableCount} variabili
      </p>
      <div className="flex items-center justify-between mt-1.5 text-[10px]">
        <span className="text-zinc-500">{c.rowsLabel} righe · {c.sizeGB >= 1024 ? `${(c.sizeGB / 1024).toFixed(1)} TB` : `${c.sizeGB} GB`}</span>
        <span className="text-blue-600 font-medium flex items-center gap-0.5">
          esplora <ChevronRight className="w-3 h-3" />
        </span>
      </div>
    </NodeShell>
  );
}

export const CollectionNode = React.memo(CollectionNodeImpl);
