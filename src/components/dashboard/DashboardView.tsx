import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Users,
  DollarSign,
  Receipt,
  Mail,
  UserCheck,
  Timer,
  Plus,
  ArrowUpRight,
  MapPin,
  Clock,
  Sparkles,
  TrendingUp,
  AlertCircle,
  MoreVertical,
  CheckCircle,
  Archive,
  Trash2,
  Edit3,
  ExternalLink
} from 'lucide-react';
import { useEvent } from '../../context/EventContext.tsx';
import { useAuth } from '../../context/AuthContext.tsx';
import { formatCurrency, formatDate, formatTime } from '../../utils/formatters.ts';
import { Event } from '../../types/database.ts';
import { TabType } from '../layout/Sidebar.tsx';

interface DashboardViewProps {
  onNavigateTab: (tab: TabType) => void;
  onOpenCreateEvent: () => void;
  onEditEvent: (event: Event) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigateTab,
  onOpenCreateEvent,
  onEditEvent,
}) => {
  const { events, activeEvent, setActiveEventId, globalStats, calculateCountdown, deleteEvent, updateEvent } = useEvent();
  const { currency, hasPermission } = useAuth();

  // Ticking seconds for real-time countdown updates
  const [, setTick] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const [activeMenuEventId, setActiveMenuEventId] = useState<string | null>(null);

  const nextEvent = globalStats.nextUpcomingEvent;
  const nextCountdown = calculateCountdown(nextEvent);

  const handleArchive = (evt: Event) => {
    const nextStatus = evt.status === 'archived' ? 'upcoming' : 'archived';
    updateEvent(evt.id, { status: nextStatus });
    setActiveMenuEventId(null);
  };

  const handleDelete = (evt: Event) => {
    if (window.confirm(`Are you sure you want to permanently delete "${evt.name}" and all associated guests, expenses, and invitations?`)) {
      deleteEvent(evt.id);
      setActiveMenuEventId(null);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight text-stone-900 sm:text-2xl">
            Event Management Dashboard
          </h1>
          <p className="mt-1 text-xs text-stone-500">
            Real-time multi-event intelligence, countdowns, finances, and RSVP metrics.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => onNavigateTab('countdown')}
            className="flex items-center gap-1.5 rounded-xl border border-stone-200 bg-white px-3.5 py-2 text-xs font-semibold text-stone-700 shadow-xs hover:bg-stone-50"
          >
            <Timer className="h-4 w-4 text-amber-600" />
            <span>Live Countdown</span>
          </button>
          <button
            onClick={onOpenCreateEvent}
            className="flex items-center gap-1.5 rounded-xl bg-stone-900 px-4 py-2 text-xs font-semibold text-white shadow-md hover:bg-stone-800"
          >
            <Plus className="h-4 w-4" />
            <span>Create Event</span>
          </button>
        </div>
      </div>

      {/* Hero: Highlighted Next Upcoming Event Countdown Card, or Welcome Onboarding when 0 events */}
      {nextEvent ? (
        <div className="relative overflow-hidden rounded-3xl border border-stone-200/90 bg-stone-950 p-6 text-white shadow-xl lg:p-8">
          {/* Subtle background glow */}
          <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-amber-500/15 blur-3xl" />
          <div className="absolute -left-20 -bottom-20 h-80 w-80 rounded-full bg-indigo-500/15 blur-3xl" />

          <div className="relative z-10 grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-center">
            {/* Left side: Event Info */}
            <div className="lg:col-span-7 space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="flex items-center gap-1.5 rounded-full bg-amber-500/20 px-3 py-1 text-xs font-semibold text-amber-300 ring-1 ring-amber-500/30">
                  <Sparkles className="h-3.5 w-3.5" />
                  Next Priority Event
                </span>
                <span className="rounded-full bg-stone-800 px-3 py-1 text-xs font-medium text-stone-300">
                  {nextEvent.category}
                </span>
              </div>

              <h2 className="text-xl font-bold tracking-tight text-white sm:text-2xl lg:text-3xl">
                {nextEvent.name}
              </h2>

              <p className="text-xs text-stone-300 line-clamp-2 max-w-xl">
                {nextEvent.description || 'Join us for this momentous celebration.'}
              </p>

              <div className="flex flex-wrap items-center gap-4 text-xs text-stone-400 pt-1">
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-stone-300" />
                  {formatDate(nextEvent.eventDate)} ({formatTime(nextEvent.startTime)})
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-stone-300" />
                  {nextEvent.venueName}
                </span>
              </div>

              <div className="pt-2 flex flex-wrap gap-2.5">
                <button
                  onClick={() => {
                    setActiveEventId(nextEvent.id);
                    onNavigateTab('countdown');
                  }}
                  className="rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-stone-950 shadow-md transition hover:bg-amber-400"
                >
                  View Full Countdown
                </button>
                <button
                  onClick={() => {
                    setActiveEventId(nextEvent.id);
                    onNavigateTab('guests');
                  }}
                  className="rounded-xl bg-stone-800/80 px-4 py-2 text-xs font-semibold text-white transition hover:bg-stone-700"
                >
                  Manage Guests
                </button>
                {nextEvent.googleMapsUrl && (
                  <a
                    href={nextEvent.googleMapsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 rounded-xl bg-stone-800/80 px-3 py-2 text-xs font-medium text-stone-300 transition hover:bg-stone-700 hover:text-white"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    Venue Map
                  </a>
                )}
              </div>
            </div>

            {/* Right side: Big Countdown Timer Digits */}
            <div className="lg:col-span-5">
              <div className="rounded-2xl border border-stone-800 bg-stone-900/80 p-4 sm:p-5 backdrop-blur-md">
                <div className="text-center text-[11px] font-bold uppercase tracking-wider text-amber-400 mb-3">
                  {nextCountdown.isCompleted
                    ? 'Celebration Completed'
                    : nextCountdown.isStarted
                    ? 'Happening Right Now!'
                    : 'Time Remaining to Celebration'}
                </div>

                <div className="grid grid-cols-4 gap-2 text-center">
                  <div className="rounded-xl bg-stone-950/70 p-2 sm:p-3 ring-1 ring-stone-800">
                    <span className="font-mono text-2xl font-black text-white sm:text-3xl">
                      {String(nextCountdown.days).padStart(2, '0')}
                    </span>
                    <span className="block text-[10px] font-semibold uppercase tracking-wider text-stone-400 mt-1">
                      Days
                    </span>
                  </div>
                  <div className="rounded-xl bg-stone-950/70 p-2 sm:p-3 ring-1 ring-stone-800">
                    <span className="font-mono text-2xl font-black text-white sm:text-3xl">
                      {String(nextCountdown.hours).padStart(2, '0')}
                    </span>
                    <span className="block text-[10px] font-semibold uppercase tracking-wider text-stone-400 mt-1">
                      Hours
                    </span>
                  </div>
                  <div className="rounded-xl bg-stone-950/70 p-2 sm:p-3 ring-1 ring-stone-800">
                    <span className="font-mono text-2xl font-black text-white sm:text-3xl">
                      {String(nextCountdown.minutes).padStart(2, '0')}
                    </span>
                    <span className="block text-[10px] font-semibold uppercase tracking-wider text-stone-400 mt-1">
                      Mins
                    </span>
                  </div>
                  <div className="rounded-xl bg-stone-950/70 p-2 sm:p-3 ring-1 ring-amber-500/40">
                    <span className="font-mono text-2xl font-black text-amber-400 sm:text-3xl animate-pulse">
                      {String(nextCountdown.seconds).padStart(2, '0')}
                    </span>
                    <span className="block text-[10px] font-semibold uppercase tracking-wider text-amber-300 mt-1">
                      Secs
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="relative overflow-hidden rounded-3xl border border-stone-200 bg-white p-8 text-center shadow-xs">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 ring-8 ring-amber-50/50">
            <Sparkles className="h-7 w-7" />
          </div>
          <h2 className="mt-4 text-xl font-bold tracking-tight text-stone-900 sm:text-2xl">
            Welcome to PlanIT Event Studio
          </h2>
          <p className="mx-auto mt-2 max-w-lg text-xs text-stone-500 leading-relaxed">
            Your centralized workspace is ready with a clean slate. Create your first event to start managing guest lists, personalized invitations, budgets, and automated RSVP tracking.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={onOpenCreateEvent}
              className="flex items-center gap-2 rounded-xl bg-stone-900 px-5 py-2.5 text-xs font-semibold text-white shadow-md hover:bg-stone-800"
            >
              <Plus className="h-4 w-4" />
              <span>Create Your First Event</span>
            </button>
          </div>
        </div>
      )}

      {/* Grid of Key Stats Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {/* Total Events */}
        <div className="rounded-2xl border border-stone-200/90 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-stone-500">Total Events</span>
            <Calendar className="h-4 w-4 text-stone-400" />
          </div>
          <p className="mt-2 text-xl font-bold tracking-tight text-stone-900">{globalStats.totalEvents}</p>
          <div className="mt-1 flex items-center gap-1 text-[10px] text-stone-500">
            <span className="font-semibold text-emerald-600">{globalStats.upcomingCount} upcoming</span>
            <span>•</span>
            <span>{globalStats.completedCount} completed</span>
          </div>
        </div>

        {/* Total Guests & Headcount */}
        <div className="rounded-2xl border border-stone-200/90 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-stone-500">Total Guests</span>
            <Users className="h-4 w-4 text-stone-400" />
          </div>
          <p className="mt-2 text-xl font-bold tracking-tight text-stone-900">{globalStats.totalGuests}</p>
          <div className="mt-1 text-[10px] text-emerald-600 font-semibold">
            {globalStats.confirmedAttendees} confirmed attendees
          </div>
        </div>

        {/* Total Budget */}
        <div className="rounded-2xl border border-stone-200/90 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-stone-500">Estimated Budget</span>
            <span className="font-mono text-xs font-bold text-stone-400">{currency}</span>
          </div>
          <p className="mt-2 text-lg font-bold tracking-tight text-stone-900 truncate">
            {formatCurrency(globalStats.totalEstimatedBudget, currency)}
          </p>
          <div className="mt-1 text-[10px] text-stone-500">Across all active plans</div>
        </div>

        {/* Actual Expenses */}
        <div className="rounded-2xl border border-stone-200/90 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-stone-500">Actual Expenses</span>
            <Receipt className="h-4 w-4 text-stone-400" />
          </div>
          <p className="mt-2 text-lg font-bold tracking-tight text-stone-900 truncate">
            {formatCurrency(globalStats.totalActualExpenses, currency)}
          </p>
          <div className="mt-1 text-[10px] text-stone-500">
            {globalStats.totalEstimatedBudget > 0
              ? `${Math.round((globalStats.totalActualExpenses / globalStats.totalEstimatedBudget) * 100)}% utilized`
              : '0% utilized'}
          </div>
        </div>

        {/* Remaining Budget */}
        <div className="rounded-2xl border border-stone-200/90 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-stone-500">Remaining Budget</span>
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </div>
          <p
            className={`mt-2 text-lg font-bold tracking-tight truncate ${
              globalStats.remainingBudget < 0 ? 'text-red-600' : 'text-emerald-700'
            }`}
          >
            {formatCurrency(globalStats.remainingBudget, currency)}
          </p>
          <div className="mt-1 text-[10px] text-stone-500">
            {globalStats.remainingBudget < 0 ? 'Over budget alert!' : 'Under budget'}
          </div>
        </div>

        {/* Pending Payments & Invites */}
        <div className="rounded-2xl border border-stone-200/90 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-stone-500">Pending Payments</span>
            <AlertCircle className="h-4 w-4 text-amber-500" />
          </div>
          <p className="mt-2 text-lg font-bold tracking-tight text-amber-700 truncate">
            {formatCurrency(globalStats.pendingPayments, currency)}
          </p>
          <div className="mt-1 text-[10px] text-stone-500">
            {globalStats.invitationsSent} invites sent
          </div>
        </div>
      </div>

      {/* Section: All Event Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-stone-900">Your Managed Events</h3>
            <p className="text-xs text-stone-500">Switch active focus, inspect countdowns, and jump to tools</p>
          </div>
          <button
            onClick={() => onNavigateTab('events')}
            className="flex items-center gap-1 text-xs font-semibold text-stone-700 hover:text-stone-950"
          >
            <span>View All Details</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {events.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-stone-200 bg-white p-10 text-center">
            <Calendar className="h-10 w-10 text-stone-300" />
            <h4 className="mt-3 text-sm font-bold text-stone-900">No Events Yet</h4>
            <p className="mt-1 text-xs text-stone-500 max-w-sm">
              Your events portfolio is currently empty. Click "Create Event" to build your celebration plan from scratch.
            </p>
            <button
              onClick={onOpenCreateEvent}
              className="mt-4 flex items-center gap-1.5 rounded-xl bg-stone-900 px-4 py-2 text-xs font-semibold text-white hover:bg-stone-800"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Create Event</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {events.map((evt) => {
              const isCurrent = evt.id === activeEvent?.id;
              const cd = calculateCountdown(evt);

            return (
              <div
                key={evt.id}
                className={`group relative flex flex-col overflow-hidden rounded-3xl border transition-all duration-200 ${
                  isCurrent
                    ? 'border-stone-900 bg-white shadow-lg ring-1 ring-stone-900/10'
                    : 'border-stone-200 bg-white shadow-xs hover:border-stone-300 hover:shadow-md'
                }`}
              >
                {/* Event Image Banner with Status Tag */}
                <div className="relative h-44 w-full overflow-hidden bg-stone-100">
                  <img
                    src={evt.coverImage}
                    alt={evt.name}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950/70 via-stone-950/20 to-transparent" />

                  {/* Top badges */}
                  <div className="absolute top-3 inset-x-3 flex items-center justify-between">
                    <span className="rounded-full bg-white/90 px-2.5 py-0.5 text-[11px] font-bold text-stone-900 backdrop-blur-xs shadow-xs">
                      {evt.category}
                    </span>

                    <div className="flex items-center gap-1.5">
                      {evt.status === 'completed' && (
                        <span className="rounded-full bg-stone-900/80 px-2.5 py-0.5 text-[10px] font-semibold text-white">
                          Completed
                        </span>
                      )}
                      {evt.status === 'archived' && (
                        <span className="rounded-full bg-amber-500/90 px-2.5 py-0.5 text-[10px] font-semibold text-white">
                          Archived
                        </span>
                      )}
                      {isCurrent && (
                        <span className="rounded-full bg-emerald-500 px-2.5 py-0.5 text-[10px] font-bold text-white shadow-xs">
                          Active Focus
                        </span>
                      )}

                      {/* Dropdown menu */}
                      <div className="relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenuEventId(activeMenuEventId === evt.id ? null : evt.id);
                          }}
                          className="flex h-7 w-7 items-center justify-center rounded-full bg-stone-900/60 text-white backdrop-blur-xs hover:bg-stone-900"
                        >
                          <MoreVertical className="h-3.5 w-3.5" />
                        </button>

                        {activeMenuEventId === evt.id && (
                          <div className="absolute right-0 mt-1 w-44 rounded-2xl border border-stone-200 bg-white p-1.5 shadow-xl z-20">
                            <button
                              onClick={() => {
                                onEditEvent(evt);
                                setActiveMenuEventId(null);
                              }}
                              className="flex w-full items-center gap-2 rounded-xl p-2 text-left text-xs text-stone-700 hover:bg-stone-50"
                            >
                              <Edit3 className="h-3.5 w-3.5" />
                              Edit Event
                            </button>
                            <button
                              onClick={() => handleArchive(evt)}
                              className="flex w-full items-center gap-2 rounded-xl p-2 text-left text-xs text-stone-700 hover:bg-stone-50"
                            >
                              <Archive className="h-3.5 w-3.5" />
                              {evt.status === 'archived' ? 'Unarchive' : 'Archive'}
                            </button>
                            {hasPermission(evt.id, 'edit') && (
                              <button
                                onClick={() => handleDelete(evt)}
                                className="flex w-full items-center gap-2 rounded-xl p-2 text-left text-xs font-semibold text-red-600 hover:bg-red-50"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                                Delete Event
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Date & Countdown Overlay on Image */}
                  <div className="absolute bottom-3 inset-x-3 flex items-end justify-between text-white">
                    <div>
                      <p className="text-[11px] font-medium text-stone-300">
                        {formatDate(evt.eventDate)}
                      </p>
                      <h4 className="text-sm font-bold text-white line-clamp-1">{evt.name}</h4>
                    </div>

                    <div className="rounded-xl bg-stone-900/80 px-2 py-1 text-right backdrop-blur-md">
                      <span className="font-mono text-xs font-bold text-amber-400">
                        {cd.isCompleted ? 'Finished' : `${cd.days}d ${cd.hours}h`}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Event Details Content */}
                <div className="flex flex-1 flex-col justify-between p-4 space-y-3">
                  <div className="space-y-1.5 text-xs text-stone-600">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 shrink-0 text-stone-400" />
                      <span className="truncate">{evt.venueName}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 shrink-0 text-stone-400" />
                      <span>{formatTime(evt.startTime)} to {formatTime(evt.endTime)}</span>
                    </div>
                  </div>

                  {/* Budget & Target info */}
                  <div className="flex items-center justify-between border-t border-stone-100 pt-2.5 text-xs">
                    <div>
                      <span className="text-[10px] text-stone-400 block">Est. Budget</span>
                      <span className="font-bold text-stone-900">
                        {formatCurrency(evt.estimatedBudget, currency)}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-stone-400 block">Status</span>
                      <span className="font-semibold capitalize text-stone-700">{evt.status}</span>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      onClick={() => {
                        setActiveEventId(evt.id);
                        onNavigateTab('countdown');
                      }}
                      className="rounded-xl border border-stone-200 py-2 text-xs font-semibold text-stone-700 transition hover:bg-stone-50"
                    >
                      Countdown
                    </button>
                    <button
                      onClick={() => {
                        setActiveEventId(evt.id);
                        onNavigateTab('guests');
                      }}
                      className="rounded-xl bg-stone-900 py-2 text-xs font-semibold text-white transition hover:bg-stone-800"
                    >
                      Open Planner
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  </div>
  );
};
