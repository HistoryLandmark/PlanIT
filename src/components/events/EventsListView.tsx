import React, { useState } from 'react';
import {
  CalendarDays,
  Plus,
  Search,
  Filter,
  MapPin,
  Clock,
  Archive,
  Trash2,
  Edit2,
  CheckCircle2,
  Sparkles,
  ExternalLink,
  Users,
  Timer
} from 'lucide-react';
import { useEvent } from '../../context/EventContext.tsx';
import { useAuth } from '../../context/AuthContext.tsx';
import { Event, EventCategory } from '../../types/database.ts';
import { formatCurrency, formatDate, formatTime } from '../../utils/formatters.ts';

interface EventsListViewProps {
  onOpenCreateEvent: () => void;
  onEditEvent: (event: Event) => void;
  onNavigateTab: (tab: any) => void;
}

export const EventsListView: React.FC<EventsListViewProps> = ({
  onOpenCreateEvent,
  onEditEvent,
  onNavigateTab,
}) => {
  const { events, activeEvent, setActiveEventId, calculateCountdown, updateEvent, deleteEvent } = useEvent();
  const { currency, hasPermission } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'upcoming' | 'completed' | 'archived'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const filteredEvents = events.filter((evt) => {
    const matchesSearch =
      evt.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evt.venueName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || evt.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || evt.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const handleToggleArchive = (evt: Event) => {
    const nextStatus = evt.status === 'archived' ? 'upcoming' : 'archived';
    updateEvent(evt.id, { status: nextStatus });
  };

  const handleDelete = (evt: Event) => {
    if (window.confirm(`Permanently delete event "${evt.name}"? This action cannot be undone.`)) {
      deleteEvent(evt.id);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight text-stone-900 sm:text-2xl">
            My Events Portfolio
          </h1>
          <p className="mt-1 text-xs text-stone-500">
            Manage all celebration projects, active countdowns, and archives in one central hub.
          </p>
        </div>

        <button
          onClick={onOpenCreateEvent}
          className="flex items-center gap-1.5 rounded-xl bg-stone-900 px-4 py-2 text-xs font-semibold text-white shadow-md hover:bg-stone-800"
        >
          <Plus className="h-4 w-4" />
          <span>Create New Event</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-col gap-3 rounded-2xl border border-stone-200 bg-white p-3 shadow-xs sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-stone-400" />
          <input
            type="text"
            placeholder="Search events by title or venue..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-stone-200 pl-9 pr-4 py-2 text-xs font-medium focus:border-stone-400 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs font-medium text-stone-700 focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="upcoming">Upcoming</option>
            <option value="completed">Completed</option>
            <option value="archived">Archived</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs font-medium text-stone-700 focus:outline-none"
          >
            <option value="all">All Categories</option>
            <option value="Wedding">Wedding</option>
            <option value="Engagement">Engagement</option>
            <option value="Reception">Reception</option>
            <option value="Birthday">Birthday</option>
            <option value="Corporate">Corporate</option>
            <option value="Family Function">Family Function</option>
            <option value="Anniversary">Anniversary</option>
          </select>
        </div>
      </div>

      {/* Event Cards Grid */}
      {filteredEvents.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-stone-200 bg-white p-12 text-center">
          <CalendarDays className="h-10 w-10 text-stone-300" />
          <h3 className="mt-3 text-sm font-bold text-stone-900">No Events Found</h3>
          <p className="mt-1 text-xs text-stone-500 max-w-sm">
            Your events list is empty. Click below to begin planning your celebrations from scratch.
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
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredEvents.map((evt) => {
            const isCurrent = evt.id === activeEvent?.id;
            const cd = calculateCountdown(evt);

            return (
            <div
              key={evt.id}
              className={`flex flex-col overflow-hidden rounded-3xl border transition-all ${
                isCurrent
                  ? 'border-stone-900 bg-white shadow-xl ring-2 ring-stone-900/10'
                  : 'border-stone-200 bg-white shadow-xs hover:shadow-md'
              }`}
            >
              <div className="relative h-48 w-full bg-stone-100">
                <img src={evt.coverImage} alt={evt.name} className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-stone-950/20 to-transparent" />

                <div className="absolute top-3 inset-x-3 flex items-center justify-between">
                  <span className="rounded-full bg-white/90 px-3 py-0.5 text-[11px] font-bold text-stone-900 backdrop-blur-xs">
                    {evt.category}
                  </span>
                  <div className="flex items-center gap-1">
                    {isCurrent && (
                      <span className="rounded-full bg-emerald-500 px-2.5 py-0.5 text-[10px] font-bold text-white shadow-xs">
                        Active
                      </span>
                    )}
                    <span className="rounded-full bg-stone-900/80 px-2 py-0.5 text-[10px] font-semibold text-stone-300 capitalize">
                      {evt.status}
                    </span>
                  </div>
                </div>

                <div className="absolute bottom-3 inset-x-3 text-white">
                  <div className="text-[11px] text-stone-300">{formatDate(evt.eventDate)}</div>
                  <h3 className="text-base font-bold text-white line-clamp-1">{evt.name}</h3>
                </div>
              </div>

              <div className="flex flex-1 flex-col justify-between p-5 space-y-4">
                <div className="space-y-2 text-xs text-stone-600">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-stone-400 shrink-0" />
                    <span className="truncate">{evt.venueName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-stone-400 shrink-0" />
                    <span>{formatTime(evt.startTime)} to {formatTime(evt.endTime)}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-xl bg-stone-50 p-2.5 text-xs">
                  <div>
                    <span className="text-[10px] text-stone-400 uppercase font-semibold block">Budget</span>
                    <span className="font-bold text-stone-900">{formatCurrency(evt.estimatedBudget, currency)}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-stone-400 uppercase font-semibold block">Countdown</span>
                    <span className="font-mono font-bold text-amber-700">
                      {cd.isCompleted ? 'Completed' : `${cd.days}d ${cd.hours}h`}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 border-t border-stone-100 pt-3">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onEditEvent(evt)}
                      className="rounded-lg p-2 text-stone-500 hover:bg-stone-100"
                      title="Edit Event"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleToggleArchive(evt)}
                      className="rounded-lg p-2 text-stone-500 hover:bg-stone-100"
                      title={evt.status === 'archived' ? 'Unarchive' : 'Archive'}
                    >
                      <Archive className="h-4 w-4" />
                    </button>
                    {hasPermission(evt.id, 'edit') && (
                      <button
                        onClick={() => handleDelete(evt)}
                        className="rounded-lg p-2 text-stone-500 hover:bg-red-50 hover:text-red-600"
                        title="Delete Event"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      setActiveEventId(evt.id);
                      onNavigateTab('dashboard');
                    }}
                    className={`rounded-xl px-4 py-2 text-xs font-semibold transition ${
                      isCurrent
                        ? 'bg-stone-100 text-stone-900'
                        : 'bg-stone-900 text-white hover:bg-stone-800'
                    }`}
                  >
                    {isCurrent ? 'Current Focus' : 'Switch Focus'}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    )}
  </div>
  );
};
