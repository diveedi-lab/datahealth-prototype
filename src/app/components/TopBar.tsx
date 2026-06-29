import React, { useState, useRef, useEffect } from 'react';
import { Bell, Sun, Moon, User, Database, Upload, AlertTriangle, CheckCircle, Info, X } from 'lucide-react';

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'ingestion' | 'alert' | 'success' | 'info';
  read: boolean;
}

const MOCK_NOTIFICATIONS: Notification[] = [
  { id: '1', title: 'New data uploaded', message: '1,240 new records ingested into CARDIO-2024 from batch #4821.', time: '5 min ago', type: 'ingestion', read: false },
  { id: '2', title: 'Storage threshold reached', message: 'ONCO-TRIAL-A has reached 92% of allocated storage capacity.', time: '23 min ago', type: 'alert', read: false },
  { id: '3', title: 'Query export completed', message: 'Your export "Neuro baseline cohort" is ready for download.', time: '1 hour ago', type: 'success', read: false },
  { id: '4', title: 'Schema update applied', message: 'NEURO-PHASE3 schema v2.4 migration completed successfully.', time: '2 hours ago', type: 'info', read: true },
  { id: '5', title: 'New files uploaded', message: '320 DICOM files added to ONCO-TRIAL-A imaging dataset.', time: '3 hours ago', type: 'ingestion', read: true },
  { id: '6', title: 'Backup completed', message: 'Daily backup for all databases completed without errors.', time: '6 hours ago', type: 'success', read: true },
  { id: '7', title: 'User access granted', message: 'Dr. M. Rossi was granted read access to CARDIO-2024.', time: '8 hours ago', type: 'info', read: true },
  { id: '8', title: 'Validation warning', message: '3 records in RESP-PILOT flagged for missing spirometry values.', time: '1 day ago', type: 'alert', read: true },
];

const typeIcon: Record<string, React.ReactNode> = {
  ingestion: <Upload className="w-4 h-4" />,
  alert: <AlertTriangle className="w-4 h-4" />,
  success: <CheckCircle className="w-4 h-4" />,
  info: <Info className="w-4 h-4" />,
};

const typeColor: Record<string, string> = {
  ingestion: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
  alert: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
  success: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
  info: 'bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400',
};

export function TopBar({ isDark, toggleTheme, currentTabLabel }: { isDark: boolean; toggleTheme: () => void; currentTabLabel: string }) {
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  const markRead = (id: string) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  const dismiss = (id: string) => setNotifications(prev => prev.filter(n => n.id !== id));

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen]);

  return (
    <header className="h-16 bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between px-6 transition-colors duration-200 shrink-0">
      <div className="flex items-center gap-4">
        <h2 className="text-lg font-semibold text-zinc-800 dark:text-zinc-100">{currentTabLabel}</h2>
      </div>

      <div className="flex items-center gap-3">
        {/* Notifications */}
        <div className="relative" ref={panelRef}>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2.5 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors relative"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 flex items-center justify-center bg-red-500 rounded-full text-[10px] font-medium text-white border-2 border-white dark:border-zinc-950">
                {unreadCount}
              </span>
            )}
          </button>

          {isOpen && (
            <div className="absolute right-0 top-full mt-2 w-96 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl z-50 overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-zinc-900 dark:text-white text-sm">Notifications</h3>
                  {unreadCount > 0 && (
                    <span className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-medium px-2 py-0.5 rounded-full">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
                  >
                    Mark all as read
                  </button>
                )}
              </div>

              {/* Notification list */}
              <div className="max-h-[400px] overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="py-10 flex flex-col items-center text-zinc-400">
                    <Bell className="w-6 h-6 mb-2 opacity-50" />
                    <p className="text-sm">No notifications</p>
                  </div>
                ) : (
                  notifications.map(n => (
                    <div
                      key={n.id}
                      className={`flex items-start gap-3 px-4 py-3 border-b border-zinc-50 dark:border-zinc-800/50 hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors cursor-pointer ${!n.read ? 'bg-blue-50/50 dark:bg-blue-950/20' : ''}`}
                      onClick={() => markRead(n.id)}
                    >
                      <div className={`p-2 rounded-xl shrink-0 mt-0.5 ${typeColor[n.type]}`}>
                        {typeIcon[n.type]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className={`text-sm ${!n.read ? 'font-semibold text-zinc-900 dark:text-white' : 'font-medium text-zinc-700 dark:text-zinc-300'}`}>
                            {n.title}
                          </p>
                          <button
                            onClick={(e) => { e.stopPropagation(); dismiss(n.id); }}
                            className="p-0.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 rounded shrink-0"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 line-clamp-2">{n.message}</p>
                        <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-1">{n.time}</p>
                      </div>
                      {!n.read && (
                        <span className="w-2 h-2 bg-blue-500 rounded-full shrink-0 mt-2" />
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* Footer */}
              {notifications.length > 0 && (
                <div className="px-4 py-2.5 border-t border-zinc-100 dark:border-zinc-800 text-center">
                  <button className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium">
                    View all notifications
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="p-2.5 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
          aria-label="Toggle Theme"
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        <div className="w-8 h-8 ml-2 rounded-full bg-blue-600 flex items-center justify-center text-white cursor-pointer shadow-sm">
          <User className="w-4 h-4" />
        </div>
      </div>
    </header>
  );
}