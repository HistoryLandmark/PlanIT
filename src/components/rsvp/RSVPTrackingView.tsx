import React, { useState } from 'react';
import {
  UserCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Link as LinkIcon,
  Copy,
  ExternalLink,
  Users,
  Search,
  Filter,
  Sparkles,
  MapPin,
  Calendar,
  X
} from 'lucide-react';
import { useEvent } from '../../context/EventContext.tsx';
import { dbService } from '../../services/db.ts';
import { Guest, RSVPStatus } from '../../types/database.ts';
import { formatDate, formatTime, triggerConfetti } from '../../utils/formatters.ts';

import { Plus } from 'lucide-react';

interface RSVPTrackingViewProps {
  onOpenCreateEvent?: () => void;
}

export const RSVPTrackingView: React.FC<RSVPTrackingViewProps> = ({ onOpenCreateEvent }) => {
  const { activeEvent, refreshData } = useEvent();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [simulatedGuest, setSimulatedGuest] = useState<Guest | null>(null);

  const guests = activeEvent ? dbService.getGuests(activeEvent.id) : [];

  if (!activeEvent) {
    return (
      <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-stone-200 bg-white p-12 text-center">
        <UserCheck className="h-10 w-10 text-stone-300" />
        <h3 className="mt-3 text-sm font-bold text-stone-900">No Event Selected</h3>
        <p className="mt-1 text-xs text-stone-500 max-w-sm">
          Please select or create an event to track confirmed, pending, and declined attendee RSVPs.
        </p>
        {onOpenCreateEvent && (
          <button
            onClick={onOpenCreateEvent}
            className="mt-4 flex items-center gap-1.5 rounded-xl bg-stone-900 px-4 py-2 text-xs font-semibold text-white hover:bg-stone-800"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Create Event First</span>
          </button>
        )}
      </div>
    );
  }

  // Metrics
  const totalGuests = guests.length;
  const sentCount = guests.filter((g) => g.invitationStatus === 'Sent').length;
  const pendingInvites = guests.filter((g) => g.invitationStatus !== 'Sent').length;

  const confirmedGuests = guests.filter((g) => g.rsvpStatus === 'Confirmed');
  const confirmedAttendees = confirmedGuests.reduce((sum, g) => sum + (g.headCount || 1), 0);
  const declinedCount = guests.filter((g) => g.rsvpStatus === 'Declined').length;
  const pendingRSVPCount = guests.filter((g) => g.rsvpStatus === 'Pending').length;
  const totalExpected = guests.reduce((sum, g) => sum + (g.headCount || 1), 0);

  const filteredGuests = guests.filter((g) => {
    const matchesSearch =
      g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.mobileNumber.includes(searchQuery);
    const matchesStatus = filterStatus === 'all' || g.rsvpStatus === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const copyRSVPLink = (guest: Guest) => {
    const link = `${window.location.origin}/#rsvp=${guest.uniqueToken}`;
    navigator.clipboard.writeText(link);
    alert(`Copied unique RSVP link for ${guest.name} to clipboard!\n${link}`);
  };

  const handleSimulateRSVPSubmit = (
    status: RSVPStatus,
    headCount: number,
    dietary: string,
    remarks: string
  ) => {
    if (!activeEvent || !simulatedGuest) return;

    dbService.submitRSVP(
      activeEvent.id,
      simulatedGuest.id,
      status,
      headCount,
      dietary,
      remarks
    );

    if (status === 'Confirmed') {
      triggerConfetti();
    }

    setSimulatedGuest(null);
    refreshData();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-xl font-extrabold tracking-tight text-stone-900 sm:text-2xl">
          RSVP & Attendee Tracking
        </h1>
        <p className="mt-1 text-xs text-stone-500">
          Monitor incoming RSVPs, expected headcount variances, and test live guest invitation response flows.
        </p>
      </div>

      {/* Aggregate Metric Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
        <div className="rounded-2xl border border-stone-200 bg-white p-3.5 shadow-xs">
          <span className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider">Total Guests</span>
          <p className="mt-1 text-xl font-bold text-stone-900">{totalGuests}</p>
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-3.5 shadow-xs">
          <span className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider">Invites Sent</span>
          <p className="mt-1 text-xl font-bold text-blue-600">{sentCount}</p>
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-3.5 shadow-xs">
          <span className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider">Pending Invites</span>
          <p className="mt-1 text-xl font-bold text-stone-600">{pendingInvites}</p>
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-3.5 shadow-xs">
          <span className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider">Confirmed</span>
          <p className="mt-1 text-xl font-bold text-emerald-600">{confirmedGuests.length}</p>
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-3.5 shadow-xs">
          <span className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider">Confirmed Heads</span>
          <p className="mt-1 text-xl font-bold text-emerald-700">{confirmedAttendees}</p>
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-3.5 shadow-xs">
          <span className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider">Declined</span>
          <p className="mt-1 text-xl font-bold text-red-600">{declinedCount}</p>
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-3.5 shadow-xs">
          <span className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider">Pending RSVP</span>
          <p className="mt-1 text-xl font-bold text-amber-600">{pendingRSVPCount}</p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col gap-3 rounded-2xl border border-stone-200 bg-white p-3 shadow-xs sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-stone-400" />
          <input
            type="text"
            placeholder="Search attendee by name or mobile number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-stone-200 pl-9 pr-4 py-2 text-xs font-medium focus:border-stone-400 focus:outline-none"
          />
        </div>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs font-medium text-stone-700 focus:outline-none"
        >
          <option value="all">All RSVP Statuses</option>
          <option value="Confirmed">Confirmed Attendance</option>
          <option value="Pending">Pending Decision</option>
          <option value="Declined">Declined</option>
        </select>
      </div>

      {/* RSVP Table */}
      <div className="overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-stone-200 bg-stone-50 font-bold uppercase text-stone-500 text-[10px] tracking-wider">
              <tr>
                <th className="px-4 py-3">Guest Name</th>
                <th className="px-4 py-3">Contact</th>
                <th className="px-4 py-3 text-center">Attendees</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">RSVP Status</th>
                <th className="px-4 py-3">Remarks / Dietary</th>
                <th className="px-4 py-3 text-right">Guest Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredGuests.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-xs text-stone-400">
                    No matching RSVPs found.
                  </td>
                </tr>
              ) : (
                filteredGuests.map((guest) => {
                  const rsvpRecord = activeEvent
                    ? dbService.getRSVPResponses(activeEvent.id).find((r) => r.guestId === guest.id)
                    : null;

                  return (
                    <tr key={guest.id} className="hover:bg-stone-50/70 transition">
                      <td className="px-4 py-3 font-bold text-stone-900">{guest.name}</td>
                      <td className="px-4 py-3 font-mono text-stone-600">{guest.mobileNumber || guest.emailAddress || '—'}</td>
                      <td className="px-4 py-3 text-center font-bold text-stone-900">
                        {guest.headCount}
                      </td>
                      <td className="px-4 py-3 text-stone-600">{guest.category}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                            guest.rsvpStatus === 'Confirmed'
                              ? 'bg-emerald-100 text-emerald-800'
                              : guest.rsvpStatus === 'Declined'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {guest.rsvpStatus === 'Confirmed' && <CheckCircle2 className="h-3 w-3" />}
                          {guest.rsvpStatus === 'Declined' && <XCircle className="h-3 w-3" />}
                          {guest.rsvpStatus === 'Pending' && <Clock className="h-3 w-3" />}
                          {guest.rsvpStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-stone-500 italic">
                        {rsvpRecord?.dietaryRestrictions || guest.remarks || 'None specified'}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => copyRSVPLink(guest)}
                            className="rounded-lg border border-stone-200 bg-white p-1.5 text-stone-600 hover:bg-stone-50"
                            title="Copy Unique Guest RSVP URL"
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => setSimulatedGuest(guest)}
                            className="flex items-center gap-1 rounded-lg bg-stone-900 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-stone-800"
                          >
                            <ExternalLink className="h-3 w-3" />
                            <span>Open RSVP Portal</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Guest Public RSVP Modal / Simulator */}
      {simulatedGuest && activeEvent && (
        <GuestRSVPSimulatorModal
          guest={simulatedGuest}
          event={activeEvent}
          onClose={() => setSimulatedGuest(null)}
          onSubmit={handleSimulateRSVPSubmit}
        />
      )}
    </div>
  );
};

interface GuestRSVPSimulatorModalProps {
  guest: Guest;
  event: any;
  onClose: () => void;
  onSubmit: (status: RSVPStatus, headCount: number, dietary: string, remarks: string) => void;
}

const GuestRSVPSimulatorModal: React.FC<GuestRSVPSimulatorModalProps> = ({
  guest,
  event,
  onClose,
  onSubmit,
}) => {
  const [status, setStatus] = useState<RSVPStatus>(guest.rsvpStatus === 'Pending' ? 'Confirmed' : guest.rsvpStatus);
  const [headCount, setHeadCount] = useState<number>(guest.headCount || 1);
  const [dietary, setDietary] = useState('');
  const [remarks, setRemarks] = useState('');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/80 p-4 backdrop-blur-sm">
      <div className="flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-3xl border border-stone-800 bg-stone-900 text-white shadow-2xl">
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-stone-800 px-6 py-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-amber-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
              Guest RSVP Portal Experience
            </span>
          </div>
          <button onClick={onClose} className="rounded-lg p-1 text-stone-400 hover:bg-stone-800">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Guest RSVP Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="text-center space-y-2">
            <span className="text-xs font-semibold text-stone-400 uppercase tracking-wider">
              {event.category} Invitation
            </span>
            <h2 className="text-2xl font-black text-white">{event.name}</h2>
            <p className="text-xs text-amber-300">
              Dear <strong className="text-white">{guest.name}</strong>, please confirm your attendance.
            </p>
          </div>

          {/* Event details card */}
          <div className="rounded-2xl border border-stone-800 bg-stone-950 p-4 space-y-2 text-xs text-stone-300">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-amber-400" />
              <span>{formatDate(event.eventDate)} ({formatTime(event.startTime)})</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-amber-400" />
              <span>{event.venueName}, {event.venueAddress}</span>
            </div>
            {event.googleMapsUrl && (
              <a
                href={event.googleMapsUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-amber-400 hover:underline"
              >
                <ExternalLink className="h-3 w-3" />
                View Google Maps Route
              </a>
            )}
          </div>

          {/* Form */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-400 mb-2">
                Will you be attending?
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setStatus('Confirmed')}
                  className={`flex items-center justify-center gap-2 rounded-xl py-3 text-xs font-bold transition ${
                    status === 'Confirmed'
                      ? 'bg-emerald-500 text-stone-950 ring-2 ring-emerald-300'
                      : 'border border-stone-800 bg-stone-950 text-stone-300 hover:bg-stone-800'
                  }`}
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Joyfully Accept</span>
                </button>

                <button
                  type="button"
                  onClick={() => setStatus('Declined')}
                  className={`flex items-center justify-center gap-2 rounded-xl py-3 text-xs font-bold transition ${
                    status === 'Declined'
                      ? 'bg-red-500 text-white ring-2 ring-red-300'
                      : 'border border-stone-800 bg-stone-950 text-stone-300 hover:bg-stone-800'
                  }`}
                >
                  <XCircle className="h-4 w-4" />
                  <span>Regretfully Decline</span>
                </button>
              </div>
            </div>

            {status === 'Confirmed' && (
              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">
                  Total Number of Attending Guests (Max Limit: 10)
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={headCount}
                  onChange={(e) => setHeadCount(parseInt(e.target.value, 10) || 1)}
                  className="w-full rounded-xl border border-stone-700 bg-stone-950 px-3 py-2 text-xs font-bold text-white focus:border-amber-400 focus:outline-none"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1">
                Dietary Preferences / Food Allergies
              </label>
              <input
                type="text"
                value={dietary}
                onChange={(e) => setDietary(e.target.value)}
                placeholder="e.g. Jain food, Vegan, Nut allergy, etc."
                className="w-full rounded-xl border border-stone-700 bg-stone-950 px-3 py-2 text-xs text-white focus:border-amber-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1">
                Personal Message / Wishes for the Host
              </label>
              <textarea
                rows={2}
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Warm congratulations and blessings..."
                className="w-full rounded-xl border border-stone-700 bg-stone-950 px-3 py-2 text-xs text-white focus:border-amber-400 focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={() => onSubmit(status, headCount, dietary, remarks)}
              className="w-full rounded-xl bg-amber-500 py-3 text-xs font-bold text-stone-950 shadow-lg hover:bg-amber-400 transition"
            >
              Submit RSVP Response
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
