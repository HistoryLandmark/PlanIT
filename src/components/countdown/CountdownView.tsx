import React, { useState, useEffect } from 'react';
import {
  Timer,
  Calendar,
  Clock,
  MapPin,
  ExternalLink,
  Sparkles,
  Share2,
  CheckCircle2,
  PartyPopper,
  ChevronRight,
  Phone,
  Mail
} from 'lucide-react';
import { useEvent } from '../../context/EventContext.tsx';
import { formatDate, formatTime, triggerConfetti } from '../../utils/formatters.ts';

import { Plus } from 'lucide-react';

interface CountdownViewProps {
  onOpenCreateEvent?: () => void;
}

export const CountdownView: React.FC<CountdownViewProps> = ({ onOpenCreateEvent }) => {
  const { events, activeEvent, setActiveEventId, calculateCountdown } = useEvent();

  // Ticking seconds
  const [, setTick] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const cd = calculateCountdown(activeEvent);

  const handleShare = () => {
    if (!activeEvent) return;
    const shareText = `Join us for ${activeEvent.name} on ${formatDate(activeEvent.eventDate)} at ${activeEvent.venueName}! Countdown is on!`;
    if (navigator.share) {
      navigator.share({ title: activeEvent.name, text: shareText, url: window.location.href }).catch(() => {});
    } else {
      navigator.clipboard.writeText(shareText);
      alert('Event details copied to clipboard!');
    }
  };

  if (!activeEvent) {
    return (
      <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-stone-200 bg-white p-12 text-center">
        <Timer className="h-10 w-10 text-stone-300" />
        <h3 className="mt-3 text-sm font-bold text-stone-900">No Active Event Selected</h3>
        <p className="mt-1 text-xs text-stone-500 max-w-sm">
          Create or select an event to activate the live ticking countdown timer.
        </p>
        {onOpenCreateEvent && (
          <button
            onClick={onOpenCreateEvent}
            className="mt-4 flex items-center gap-1.5 rounded-xl bg-stone-900 px-4 py-2 text-xs font-semibold text-white hover:bg-stone-800"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Create First Event</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Event Selector Pills */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight text-stone-900 sm:text-2xl">
            Live Event Countdown
          </h1>
          <p className="mt-1 text-xs text-stone-500">
            Precision countdown timers updating every second for all celebration milestones.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => triggerConfetti()}
            className="flex items-center gap-1.5 rounded-xl border border-amber-300 bg-amber-50 px-3.5 py-2 text-xs font-bold text-amber-800 shadow-xs hover:bg-amber-100 transition"
          >
            <PartyPopper className="h-4 w-4 text-amber-600" />
            <span>Celebrate 🎉</span>
          </button>
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 rounded-xl border border-stone-200 bg-white px-3.5 py-2 text-xs font-semibold text-stone-700 shadow-xs hover:bg-stone-50 transition"
          >
            <Share2 className="h-3.5 w-3.5" />
            <span>Share</span>
          </button>
        </div>
      </div>

      {/* Event Selector Horizontal Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {events.map((evt) => {
          const isSelected = evt.id === activeEvent.id;
          return (
            <button
              key={evt.id}
              onClick={() => setActiveEventId(evt.id)}
              className={`flex items-center gap-2 rounded-2xl px-4 py-2 text-xs font-semibold whitespace-nowrap transition ${
                isSelected
                  ? 'bg-stone-900 text-white shadow-md'
                  : 'border border-stone-200 bg-white text-stone-600 hover:bg-stone-50 hover:text-stone-900'
              }`}
            >
              <div
                className={`h-2 w-2 rounded-full ${
                  evt.status === 'completed' ? 'bg-stone-400' : 'bg-amber-400'
                }`}
              />
              <span>{evt.name}</span>
              <span className={`text-[10px] ${isSelected ? 'text-stone-300' : 'text-stone-400'}`}>
                {evt.eventDate}
              </span>
            </button>
          );
        })}
      </div>

      {/* Giant Hero Luxury Countdown Card */}
      <div className="relative overflow-hidden rounded-3xl border border-stone-200 bg-gradient-to-b from-stone-900 via-stone-950 to-black p-6 text-white shadow-2xl sm:p-10 lg:p-12 text-center">
        {/* Ambient lighting effects */}
        <div className="absolute -top-32 left-1/2 h-72 w-96 -translate-x-1/2 rounded-full bg-amber-500/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 right-10 h-72 w-72 rounded-full bg-purple-500/15 blur-3xl pointer-events-none" />

        <div className="relative z-10 mx-auto max-w-4xl space-y-6">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/20 px-4 py-1.5 text-xs font-semibold text-amber-300 ring-1 ring-amber-500/40">
            <Sparkles className="h-4 w-4" />
            <span>{activeEvent.category} • Official Countdown</span>
          </div>

          <h2 className="text-2xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl">
            {activeEvent.name}
          </h2>

          <p className="mx-auto max-w-2xl text-xs sm:text-sm text-stone-300">
            {activeEvent.description || 'Every moment brings us closer to this joyous celebration.'}
          </p>

          {/* Status announcement */}
          {cd.isCompleted ? (
            <div className="mx-auto inline-flex items-center gap-2 rounded-2xl bg-emerald-500/20 px-6 py-3 text-sm font-bold text-emerald-300 ring-1 ring-emerald-500/40">
              <CheckCircle2 className="h-5 w-5" />
              <span>This celebration has concluded joyously! Memories remain forever.</span>
            </div>
          ) : cd.isStarted ? (
            <div className="mx-auto inline-flex items-center gap-2 rounded-2xl bg-amber-500/20 px-6 py-3 text-sm font-bold text-amber-300 ring-1 ring-amber-500/40 animate-pulse">
              <PartyPopper className="h-5 w-5" />
              <span>The celebration is underway today! Enjoy the festivities!</span>
            </div>
          ) : (
            /* Countdown Digit Blocks */
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-6 pt-4">
              {/* Days */}
              <div className="rounded-2xl border border-stone-800 bg-stone-900/90 p-4 sm:p-6 backdrop-blur-md shadow-inner">
                <span className="font-mono text-4xl font-extrabold text-white sm:text-6xl lg:text-7xl">
                  {String(cd.days).padStart(2, '0')}
                </span>
                <span className="block text-xs font-bold uppercase tracking-widest text-amber-400 mt-2">
                  Days
                </span>
              </div>

              {/* Hours */}
              <div className="rounded-2xl border border-stone-800 bg-stone-900/90 p-4 sm:p-6 backdrop-blur-md shadow-inner">
                <span className="font-mono text-4xl font-extrabold text-white sm:text-6xl lg:text-7xl">
                  {String(cd.hours).padStart(2, '0')}
                </span>
                <span className="block text-xs font-bold uppercase tracking-widest text-amber-400 mt-2">
                  Hours
                </span>
              </div>

              {/* Minutes */}
              <div className="rounded-2xl border border-stone-800 bg-stone-900/90 p-4 sm:p-6 backdrop-blur-md shadow-inner">
                <span className="font-mono text-4xl font-extrabold text-white sm:text-6xl lg:text-7xl">
                  {String(cd.minutes).padStart(2, '0')}
                </span>
                <span className="block text-xs font-bold uppercase tracking-widest text-amber-400 mt-2">
                  Minutes
                </span>
              </div>

              {/* Seconds */}
              <div className="rounded-2xl border border-amber-500/40 bg-stone-900/90 p-4 sm:p-6 backdrop-blur-md shadow-inner">
                <span className="font-mono text-4xl font-extrabold text-amber-400 sm:text-6xl lg:text-7xl animate-pulse">
                  {String(cd.seconds).padStart(2, '0')}
                </span>
                <span className="block text-xs font-bold uppercase tracking-widest text-amber-300 mt-2">
                  Seconds
                </span>
              </div>
            </div>
          )}

          {/* Quick Schedule & Venue Bar */}
          <div className="mx-auto flex flex-wrap items-center justify-center gap-6 rounded-2xl border border-stone-800/80 bg-stone-900/60 px-6 py-4 text-xs text-stone-300 backdrop-blur-md mt-6">
            <span className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-amber-400" />
              <span>{formatDate(activeEvent.eventDate)}</span>
            </span>
            <span className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-amber-400" />
              <span>{formatTime(activeEvent.startTime)} - {formatTime(activeEvent.endTime)}</span>
            </span>
            <span className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-amber-400" />
              <span>{activeEvent.venueName}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Two Column Section: Venue Location & Organizer Contact */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Venue Location Card */}
        <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-stone-100 text-stone-700">
              <MapPin className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-stone-900">Venue & Navigation</h3>
              <p className="text-xs text-stone-500">Complete location address and route navigation</p>
            </div>
          </div>

          <div className="rounded-2xl border border-stone-100 bg-stone-50 p-4 space-y-2">
            <div className="font-bold text-stone-900 text-sm">{activeEvent.venueName}</div>
            <p className="text-xs text-stone-600 leading-relaxed">{activeEvent.venueAddress || 'Address will be updated shortly.'}</p>
            {activeEvent.additionalNotes && (
              <p className="text-[11px] text-amber-800 font-medium bg-amber-50 rounded-lg p-2 mt-2">
                Note: {activeEvent.additionalNotes}
              </p>
            )}
          </div>

          {activeEvent.googleMapsUrl && (
            <a
              href={activeEvent.googleMapsUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-2 rounded-xl bg-stone-900 py-2.5 text-xs font-semibold text-white transition hover:bg-stone-800"
            >
              <ExternalLink className="h-4 w-4" />
              Open in Google Maps
            </a>
          )}
        </div>

        {/* Organizer & Host Details Card */}
        <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-stone-100 text-stone-700">
              <Phone className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-stone-900">Organizer & Help Desk</h3>
              <p className="text-xs text-stone-500">Contact information for guests and vendors</p>
            </div>
          </div>

          <div className="rounded-2xl border border-stone-100 bg-stone-50 p-4 space-y-3">
            <div>
              <span className="text-[10px] uppercase font-bold text-stone-400 block">Lead Organizer</span>
              <span className="text-xs font-bold text-stone-900">{activeEvent.organizerName}</span>
            </div>
            <div className="flex items-center justify-between text-xs text-stone-700 border-t border-stone-200/60 pt-2">
              <span className="flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5 text-stone-400" />
                <span>{activeEvent.contactPhone || 'Not specified'}</span>
              </span>
              {activeEvent.contactPhone && (
                <a
                  href={`tel:${activeEvent.contactPhone}`}
                  className="rounded-lg bg-stone-200/80 px-2 py-0.5 text-[11px] font-semibold text-stone-800 hover:bg-stone-300"
                >
                  Call
                </a>
              )}
            </div>
            <div className="flex items-center justify-between text-xs text-stone-700 border-t border-stone-200/60 pt-2">
              <span className="flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-stone-400" />
                <span>{activeEvent.contactEmail || 'Not specified'}</span>
              </span>
              {activeEvent.contactEmail && (
                <a
                  href={`mailto:${activeEvent.contactEmail}`}
                  className="rounded-lg bg-stone-200/80 px-2 py-0.5 text-[11px] font-semibold text-stone-800 hover:bg-stone-300"
                >
                  Email
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
