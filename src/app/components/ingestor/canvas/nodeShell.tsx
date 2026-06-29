import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { cn } from '../../ui/utils';

interface NodeShellProps {
  color: string;
  selected?: boolean;
  dimmed?: boolean;
  width?: number;
  clickable?: boolean;
  dashed?: boolean;
  hasTarget?: boolean;
  hasSource?: boolean;
  children: React.ReactNode;
}

const handleStyle: React.CSSProperties = {
  width: 10,
  height: 10,
  background: '#a1a1aa',
  border: '2px solid #ffffff',
};

export function NodeShell({
  color, selected, dimmed, width = 230, clickable, dashed,
  hasTarget = true, hasSource = true, children,
}: NodeShellProps) {
  return (
    <div
      className={cn(
        'relative rounded-xl border bg-white shadow-sm transition-all',
        dashed ? 'border-dashed' : 'border-solid',
        selected ? 'border-blue-400 ring-2 ring-blue-500/30' : 'border-zinc-200',
        dimmed && 'opacity-30',
        clickable ? 'cursor-pointer hover:shadow-md' : 'cursor-default',
      )}
      style={{ width }}
    >
      <span
        className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl"
        style={{ background: color }}
      />
      {hasTarget && <Handle type="target" position={Position.Left} style={handleStyle} />}
      <div className="pl-3 pr-3 py-2.5">{children}</div>
      {hasSource && <Handle type="source" position={Position.Right} style={handleStyle} />}
    </div>
  );
}

export function MiniBar({ value, color = '#10b981' }: { value: number; color?: string }) {
  const pct = Math.round(value * 100);
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 flex-1 rounded-full bg-zinc-100 overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="text-[10px] text-zinc-400 tabular-nums">{pct}%</span>
    </div>
  );
}
