import React, { useState } from 'react';
import {
  Calendar,
  ChevronDown,
  Plus,
  Bell,
  CheckCircle2,
  AlertTriangle,
  Info,
  LogOut,
  UserCheck,
  Shield,
  Menu
} from 'lucide-react';
import { useEvent } from '../../context/EventContext.tsx';
import { useAuth } from '../../context/AuthContext.tsx';
import { dbService } from '../../services/db.ts';

interface NavbarProps {
  onOpenCreateEvent: () => void;
  onOpenAuthModal: () => void;
  toggleSidebar: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenCreateEvent,
  onOpenAuthModal,
  toggleSidebar,
}) => {
  const { events, activeEvent, setActiveEventId } = useEvent();
  const { currentUser, switchUser, currency, setCurrency, hasPermission } = useAuth();
  const [showEventDropdown, setShowEventDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const notifications = dbService.getNotifications(activeEvent?.id);
  const unreadCount = notifications.filter((n) => !n.read).length;
  const allUsers = dbService.getUsers();

  const handleMarkAllRead = () => {
    dbService.markAllNotificationsRead(activeEvent?.id);
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-stone-200 bg-white/95 px-4 backdrop-blur md:px-6">
      {/* Left side: Hamburger + Event Selector */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-stone-200 text-stone-600 hover:bg-stone-50 md:hidden"
          title="Toggle Navigation Menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Brand in mobile */}
        <div className="flex items-center gap-2 md:hidden">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-stone-900 text-white font-bold">
            P
          </div>
          <span className="font-bold tracking-tight text-stone-900">PlanIT</span>
        </div>

        {/* Event Switcher Dropdown */}
        <div className="relative hidden sm:block">
          <button
            onClick={() => setShowEventDropdown(!showEventDropdown)}
            className="flex items-center gap-2.5 rounded-xl border border-stone-200/90 bg-stone-50/70 px-3.5 py-1.5 text-left text-sm font-medium text-stone-800 transition hover:bg-stone-100"
          >
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <div className="max-w-[200px] truncate font-semibold text-stone-900 md:max-w-[280px]">
              {activeEvent ? activeEvent.name : 'Select Event'}
            </div>
            <span className="hidden rounded bg-stone-200/80 px-1.5 py-0.5 text-[10px] font-medium text-stone-700 lg:inline">
              {activeEvent?.category || 'Event'}
            </span>
            <ChevronDown className="h-4 w-4 text-stone-500" />
          </button>

          {showEventDropdown && (
            <div className="absolute left-0 mt-2 w-80 rounded-2xl border border-stone-200 bg-white p-2 shadow-xl z-50">
              <div className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-stone-500">
                Switch Event
              </div>
              <div className="max-h-64 overflow-y-auto space-y-1">
                {events.length === 0 ? (
                  <p className="px-3 py-6 text-center text-xs text-stone-400">
                    No events created yet.
                  </p>
                ) : (
                  events.map((evt) => (
                    <button
                      key={evt.id}
                      onClick={() => {
                        setActiveEventId(evt.id);
                        setShowEventDropdown(false);
                      }}
                      className={`flex w-full items-start gap-3 rounded-xl p-2.5 text-left transition ${
                        evt.id === activeEvent?.id ? 'bg-stone-100 font-semibold' : 'hover:bg-stone-50'
                      }`}
                    >
                      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-stone-900 text-white text-xs">
                        <Calendar className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-semibold text-stone-900">{evt.name}</p>
                        <p className="text-[11px] text-stone-500">{evt.eventDate} • {evt.category}</p>
                      </div>
                      {evt.status === 'upcoming' && (
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-medium text-emerald-800">
                          Upcoming
                        </span>
                      )}
                    </button>
                  ))
                )}
              </div>
              <div className="mt-2 border-t border-stone-100 pt-2">
                <button
                  onClick={() => {
                    setShowEventDropdown(false);
                    onOpenCreateEvent();
                  }}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-stone-900 py-2 text-xs font-medium text-white transition hover:bg-stone-800"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Create New Event
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right side: Currency, Notifications, New Event button, User profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Currency Switcher */}
        <select
          value={currency}
          onChange={(e) => setCurrency(e.target.value)}
          className="rounded-lg border border-stone-200 bg-white px-2 py-1 text-xs font-semibold text-stone-700 hover:bg-stone-50 focus:outline-none focus:ring-1 focus:ring-stone-400"
          title="Select Currency"
        >
          <option value="₹">₹ INR</option>
          <option value="$">$ USD</option>
          <option value="€">€ EUR</option>
          <option value="£">£ GBP</option>
          <option value="AED">AED</option>
        </select>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-stone-200 text-stone-600 transition hover:bg-stone-50"
            title="Notifications"
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-white">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-stone-200 bg-white p-3 shadow-2xl z-50">
              <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                <span className="text-xs font-bold text-stone-900">Notifications ({unreadCount} new)</span>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-[11px] font-medium text-stone-500 hover:text-stone-800"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <div className="mt-2 max-h-72 overflow-y-auto space-y-2">
                {notifications.length === 0 ? (
                  <p className="py-6 text-center text-xs text-stone-400">No notifications yet.</p>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`flex gap-3 rounded-xl p-2.5 text-xs transition ${
                        n.read ? 'bg-white opacity-70' : 'bg-stone-50 border border-stone-100 font-medium'
                      }`}
                    >
                      <div className="mt-0.5">
                        {n.type === 'success' && <CheckCircle2 className="h-4 w-4 text-emerald-600" />}
                        {n.type === 'warning' && <AlertTriangle className="h-4 w-4 text-amber-600" />}
                        {n.type === 'info' && <Info className="h-4 w-4 text-blue-600" />}
                        {n.type === 'alert' && <AlertTriangle className="h-4 w-4 text-red-600" />}
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-stone-900">{n.title}</div>
                        <div className="text-stone-600 text-[11px] mt-0.5">{n.message}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Create Event CTA */}
        {(!activeEvent || hasPermission(activeEvent.id, 'edit')) && (
          <button
            onClick={onOpenCreateEvent}
            className="hidden items-center gap-1.5 rounded-xl bg-stone-900 px-3.5 py-1.5 text-xs font-medium text-white shadow-sm transition hover:bg-stone-800 sm:flex"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>New Event</span>
          </button>
        )}

        {/* User Profile & Demo Switcher */}
        <div className="relative">
          <button
            onClick={() => setShowUserDropdown(!showUserDropdown)}
            className="flex items-center gap-2 rounded-xl border border-stone-200/90 bg-stone-50/50 p-1 pr-2.5 transition hover:bg-stone-100"
          >
            <img
              src={currentUser?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80'}
              alt={currentUser?.name}
              className="h-7 w-7 rounded-lg object-cover ring-1 ring-stone-200"
            />
            <div className="hidden text-left sm:block">
              <p className="text-xs font-semibold leading-tight text-stone-900 truncate max-w-[100px]">{currentUser?.name?.split(' ')[0]}</p>
              <span className="text-[10px] font-bold text-amber-700 tracking-wider">
                {currentUser?.memberType || currentUser?.role}
              </span>
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-stone-400" />
          </button>

          {showUserDropdown && (
            <div className="absolute right-0 mt-2 w-72 rounded-2xl border border-stone-200 bg-white p-3 shadow-xl z-50">
              <div className="flex items-center gap-3 border-b border-stone-100 pb-3">
                <img
                  src={currentUser?.avatarUrl}
                  alt={currentUser?.name}
                  className="h-10 w-10 rounded-xl object-cover"
                />
                <div className="min-w-0">
                  <p className="text-xs font-bold text-stone-900 truncate">{currentUser?.name}</p>
                  <p className="text-[11px] text-stone-500 truncate">{currentUser?.email}</p>
                  <span className="inline-block mt-1 rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-900">
                    {currentUser?.memberType || currentUser?.role}
                    {currentUser?.relation && currentUser.relation !== currentUser.memberType ? ` (${currentUser.relation})` : ''}
                  </span>
                </div>
              </div>

              <div className="mt-3">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-stone-400 px-1 mb-1">
                  Switch Active Persona (Multi-User)
                </div>
                <div className="space-y-1">
                  {allUsers.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => {
                        switchUser(u.id);
                        setShowUserDropdown(false);
                      }}
                      className={`flex w-full items-center justify-between rounded-lg p-2 text-left text-xs transition ${
                        u.id === currentUser?.id ? 'bg-stone-100 font-semibold' : 'hover:bg-stone-50 text-stone-700'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <img src={u.avatarUrl} alt={u.name} className="h-5 w-5 rounded-md object-cover" />
                        <span className="truncate">{u.name}</span>
                      </div>
                      <span className="text-[10px] font-medium text-stone-500">{u.memberType || u.role}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-3 border-t border-stone-100 pt-2 flex flex-col gap-1">
                <button
                  onClick={() => {
                    setShowUserDropdown(false);
                    onOpenAuthModal();
                  }}
                  className="flex items-center gap-2 rounded-lg p-2 text-xs font-medium text-stone-700 hover:bg-stone-50"
                >
                  <UserCheck className="h-4 w-4 text-stone-500" />
                  Account Login & Registration
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
