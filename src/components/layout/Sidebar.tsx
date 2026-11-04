import React from 'react';
import {
  LayoutDashboard,
  CalendarDays,
  Timer,
  Users,
  Grid2X2,
  PieChart,
  Receipt,
  Mail,
  UserCheck,
  Store,
  FileSpreadsheet,
  Settings,
  Sparkles,
  X
} from 'lucide-react';
import { useEvent } from '../../context/EventContext.tsx';

export type TabType =
  | 'dashboard'
  | 'events'
  | 'countdown'
  | 'guests'
  | 'budget'
  | 'expenses'
  | 'invitations'
  | 'rsvp'
  | 'vendors'
  | 'reports'
  | 'settings';

interface SidebarProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isOpen,
  onClose,
}) => {
  const { activeEvent, activeSummary, calculateCountdown } = useEvent();
  const countdown = calculateCountdown(activeEvent);

  const navItems = [
    { id: 'dashboard' as TabType, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'events' as TabType, label: 'My Events', icon: CalendarDays },
    {
      id: 'countdown' as TabType,
      label: 'Countdown',
      icon: Timer,
      badge: !countdown.isCompleted ? `${countdown.days}d` : 'Done',
      badgeColor: 'bg-amber-100 text-amber-800',
    },
    {
      id: 'guests' as TabType,
      label: 'Guest Management',
      icon: Users,
      badge: activeSummary ? `${activeSummary.totalGuests}` : undefined,
    },
    { id: 'budget' as TabType, label: 'Budget', icon: PieChart },
    { id: 'expenses' as TabType, label: 'Expenses', icon: Receipt },
    { id: 'invitations' as TabType, label: 'Invitations', icon: Mail },
    {
      id: 'rsvp' as TabType,
      label: 'RSVP Tracking',
      icon: UserCheck,
      badge: activeSummary ? `${activeSummary.confirmedGuestsCount}` : undefined,
      badgeColor: 'bg-emerald-100 text-emerald-800',
    },
    { id: 'vendors' as TabType, label: 'Vendors', icon: Store },
    { id: 'reports' as TabType, label: 'Reports', icon: FileSpreadsheet },
    { id: 'settings' as TabType, label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-stone-900/40 backdrop-blur-xs md:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex w-64 flex-col border-r border-stone-200 bg-stone-50/70 p-4 transition-transform duration-200 md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header / Brand */}
        <div className="flex items-center justify-between px-2 pt-2 pb-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-stone-900 to-stone-800 text-amber-400 shadow-md">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <span className="text-base font-extrabold tracking-tight text-stone-900">PlanIT</span>
              <span className="block text-[10px] font-medium uppercase tracking-wider text-stone-500">
                Event Studio
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-stone-500 hover:bg-stone-200/50 md:hidden"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 space-y-1 overflow-y-auto pr-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  onClose();
                }}
                className={`group flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-medium transition ${
                  isActive
                    ? 'bg-stone-900 text-white shadow-sm'
                    : 'text-stone-600 hover:bg-stone-200/60 hover:text-stone-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon
                    className={`h-4 w-4 transition ${
                      isActive ? 'text-amber-400' : 'text-stone-400 group-hover:text-stone-700'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      isActive
                        ? 'bg-stone-800 text-stone-200'
                        : item.badgeColor || 'bg-stone-200/80 text-stone-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Current Event Summary Widget in Sidebar */}
        {activeEvent && (
          <div className="mt-4 rounded-2xl border border-stone-200/80 bg-white p-3 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Active Event</span>
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            </div>
            <p className="mt-1 truncate text-xs font-semibold text-stone-900">{activeEvent.name}</p>
            <div className="mt-2 flex items-center justify-between text-[11px] text-stone-500">
              <span>{activeEvent.eventDate}</span>
              <span className="font-medium text-stone-700">{countdown.days} days left</span>
            </div>
          </div>
        )}
      </aside>
    </>
  );
};
