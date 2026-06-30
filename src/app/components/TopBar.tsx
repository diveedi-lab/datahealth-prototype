import React from 'react';
import { User } from 'lucide-react';
import { NotificationsDrawer } from './NotificationsDrawer';
import { IconTip } from './ui/icon-tip';

export function TopBar({
  currentTabLabel, onNavigate,
}: {
  currentTabLabel: string;
  onNavigate?: (tab: string, sub?: string) => void;
}) {
  return (
    <header className="h-16 glass-chrome border-b flex items-center justify-between px-6 shrink-0">
      <div className="flex items-center gap-4">
        <h2 className="text-lg font-semibold text-zinc-800">{currentTabLabel}</h2>
      </div>

      <div className="flex items-center gap-1.5">
        <NotificationsDrawer onNavigate={onNavigate} />
        <IconTip label="Profilo">
          <button className="w-8 h-8 ml-1 rounded-full bg-blue-600 flex items-center justify-center text-white shadow-sm hover:bg-blue-700 transition-colors" aria-label="Profilo">
            <User className="w-4 h-4" />
          </button>
        </IconTip>
      </div>
    </header>
  );
}
