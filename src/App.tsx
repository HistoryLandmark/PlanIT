/**
 * PlanIT - Event Management Platform
 * Centralized Application Shell
 */

import React, { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext.tsx';
import { EventProvider, useEvent } from './context/EventContext.tsx';
import { Navbar } from './components/layout/Navbar.tsx';
import { Sidebar, TabType } from './components/layout/Sidebar.tsx';
import { DashboardView } from './components/dashboard/DashboardView.tsx';
import { EventsListView } from './components/events/EventsListView.tsx';
import { CountdownView } from './components/countdown/CountdownView.tsx';
import { GuestManagementView } from './components/guests/GuestManagementView.tsx';
import { ExpenseManagementView } from './components/expenses/ExpenseManagementView.tsx';
import { BudgetManagementView } from './components/budget/BudgetManagementView.tsx';
import { InvitationManagementView } from './components/invitations/InvitationManagementView.tsx';
import { RSVPTrackingView } from './components/rsvp/RSVPTrackingView.tsx';
import { VendorsView } from './components/vendors/VendorsView.tsx';
import { ReportsView } from './components/reports/ReportsView.tsx';
import { SettingsView } from './components/settings/SettingsView.tsx';
import { EventModal } from './components/events/EventModal.tsx';
import { AuthModal } from './components/auth/AuthModal.tsx';
import { Event, Guest, RSVPStatus } from './types/database.ts';
import { dbService } from './services/db.ts';
import { formatDate, formatTime, triggerConfetti } from './utils/formatters.ts';
import { Sparkles, Calendar, MapPin, CheckCircle2, XCircle, ExternalLink } from 'lucide-react';

function AppContent() {
  const { events, activeEvent, createEvent, updateEvent, refreshData } = useEvent();

  const [currentTab, setCurrentTab] = useState<TabType>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Event modal state
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);

  // Auth modal state
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // RSVP Simulator state from guest view
  const [rsvpGuestTarget, setRsvpGuestTarget] = useState<Guest | null>(null);

  // Public RSVP token in URL hash e.g. #rsvp=rsvp-sunil-sharma-9822
  const [publicToken, setPublicToken] = useState<string | null>(null);

  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash;
      if (hash && hash.startsWith('#rsvp=')) {
        const token = hash.replace('#rsvp=', '').trim();
        if (token) setPublicToken(token);
      } else {
        setPublicToken(null);
      }
    };

    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const handleOpenCreateEvent = () => {
    setEditingEvent(null);
    setIsEventModalOpen(true);
  };

  const handleEditEvent = (evt: Event) => {
    setEditingEvent(evt);
    setIsEventModalOpen(true);
  };

  const handleSaveEvent = (data: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingEvent) {
      updateEvent(editingEvent.id, data);
    } else {
      createEvent(data);
    }
  };

  // If a public guest arrives with an RSVP token in the URL hash, render the dedicated invitation & response page
  if (publicToken) {
    const guest = dbService.getGuestByToken(publicToken);
    const event = guest ? dbService.getEventById(guest.eventId) : null;

    if (!guest || !event) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-stone-950 p-6 text-white text-center">
          <div className="max-w-md space-y-4">
            <h1 className="text-xl font-bold">Invitation Link Not Found</h1>
            <p className="text-xs text-stone-400">
              The RSVP token you followed is expired or invalid. Please check your invitation message or contact the event host.
            </p>
            <a
              href="#"
              onClick={() => {
                window.location.hash = '';
                setPublicToken(null);
              }}
              className="inline-block rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-stone-950"
            >
              Back to PlanIT App
            </a>
          </div>
        </div>
      );
    }

    return (
      <PublicRSVPPortal
        guest={guest}
        event={event}
        onExit={() => {
          window.location.hash = '';
          setPublicToken(null);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-stone-100/60 font-sans text-stone-900 antialiased">
      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={(tab) => setCurrentTab(tab)}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Content Area (offset by sidebar width on desktop) */}
      <div className="md:pl-64 flex flex-col min-h-screen">
        {/* Top Navbar */}
        <Navbar
          onOpenCreateEvent={handleOpenCreateEvent}
          onOpenAuthModal={() => setIsAuthModalOpen(true)}
          toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />

        {/* View Router */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {currentTab === 'dashboard' && (
            <DashboardView
              onNavigateTab={(tab) => setCurrentTab(tab)}
              onOpenCreateEvent={handleOpenCreateEvent}
              onEditEvent={handleEditEvent}
            />
          )}

          {currentTab === 'events' && (
            <EventsListView
              onOpenCreateEvent={handleOpenCreateEvent}
              onEditEvent={handleEditEvent}
              onNavigateTab={(tab) => setCurrentTab(tab)}
            />
          )}

          {currentTab === 'countdown' && (
            <CountdownView onOpenCreateEvent={handleOpenCreateEvent} />
          )}

          {currentTab === 'guests' && (
            <GuestManagementView
              onOpenRSVPSimulator={(g) => setRsvpGuestTarget(g)}
              onOpenCreateEvent={handleOpenCreateEvent}
            />
          )}

          {currentTab === 'budget' && (
            <BudgetManagementView onOpenCreateEvent={handleOpenCreateEvent} />
          )}

          {currentTab === 'expenses' && (
            <ExpenseManagementView onOpenCreateEvent={handleOpenCreateEvent} />
          )}

          {currentTab === 'invitations' && (
            <InvitationManagementView onOpenCreateEvent={handleOpenCreateEvent} />
          )}

          {currentTab === 'rsvp' && (
            <RSVPTrackingView onOpenCreateEvent={handleOpenCreateEvent} />
          )}

          {currentTab === 'vendors' && (
            <VendorsView onOpenCreateEvent={handleOpenCreateEvent} />
          )}

          {currentTab === 'reports' && (
            <ReportsView onOpenCreateEvent={handleOpenCreateEvent} />
          )}

          {currentTab === 'settings' && <SettingsView />}
        </main>
      </div>

      {/* Event Create / Edit Modal */}
      <EventModal
        isOpen={isEventModalOpen}
        onClose={() => setIsEventModalOpen(false)}
        onSave={handleSaveEvent}
        initialData={editingEvent}
      />

      {/* Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      {/* Guest RSVP Simulator Modal triggered from Guests list */}
      {rsvpGuestTarget && activeEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/80 p-4 backdrop-blur-sm">
          <div className="flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-3xl border border-stone-800 bg-stone-900 text-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-stone-800 px-6 py-4">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                Personal RSVP Portal: {rsvpGuestTarget.name}
              </span>
              <button onClick={() => setRsvpGuestTarget(null)} className="rounded-lg p-1 text-stone-400 hover:bg-stone-800">
                ✕
              </button>
            </div>
            <div className="p-6 space-y-4 overflow-y-auto">
              <p className="text-xs text-stone-300">
                This is the exact view <strong>{rsvpGuestTarget.name}</strong> sees when tapping their personal WhatsApp / Email invitation link.
              </p>
              <div className="rounded-2xl border border-stone-800 bg-stone-950 p-4 space-y-2 text-xs text-stone-300">
                <div className="font-bold text-white text-sm">{activeEvent.name}</div>
                <div>📅 {formatDate(activeEvent.eventDate)} ({formatTime(activeEvent.startTime)})</div>
                <div>📍 {activeEvent.venueName}</div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => {
                    dbService.submitRSVP(activeEvent.id, rsvpGuestTarget.id, 'Confirmed', rsvpGuestTarget.headCount, 'No restrictions', 'Excited to attend!');
                    triggerConfetti();
                    setRsvpGuestTarget(null);
                    refreshData();
                  }}
                  className="flex-1 rounded-xl bg-emerald-500 py-3 text-xs font-bold text-stone-950 hover:bg-emerald-400"
                >
                  Confirm Attendance
                </button>
                <button
                  onClick={() => {
                    dbService.submitRSVP(activeEvent.id, rsvpGuestTarget.id, 'Declined', 0, '', 'Regretfully out of town');
                    setRsvpGuestTarget(null);
                    refreshData();
                  }}
                  className="rounded-xl border border-stone-700 bg-stone-800 px-4 py-3 text-xs font-bold text-stone-300 hover:bg-stone-700"
                >
                  Decline
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Dedicated Public Guest RSVP Experience
function PublicRSVPPortal({ guest, event, onExit }: { guest: Guest; event: Event; onExit: () => void }) {
  const [status, setStatus] = useState<RSVPStatus>(guest.rsvpStatus === 'Pending' ? 'Confirmed' : guest.rsvpStatus);
  const [headCount, setHeadCount] = useState(guest.headCount || 1);
  const [dietary, setDietary] = useState('');
  const [remarks, setRemarks] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dbService.submitRSVP(event.id, guest.id, status, headCount, dietary, remarks);
    if (status === 'Confirmed') {
      triggerConfetti();
    }
    setIsSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-stone-950 p-4 sm:p-8 flex items-center justify-center text-white font-sans">
      <div className="w-full max-w-lg rounded-3xl border border-stone-800 bg-stone-900 p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="flex justify-between items-center border-b border-stone-800 pb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Official Invitation</span>
          </div>
          <button onClick={onExit} className="text-xs text-stone-400 hover:text-white">
            Planner View
          </button>
        </div>

        {isSubmitted ? (
          <div className="text-center py-8 space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 ring-2 ring-emerald-500/40">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h2 className="text-2xl font-black text-white">Thank You, {guest.name}!</h2>
            <p className="text-xs text-stone-300 max-w-sm mx-auto">
              Your response has been registered with the host. We look forward to celebrating together!
            </p>
            <button
              onClick={onExit}
              className="mt-4 rounded-xl bg-amber-500 px-6 py-2.5 text-xs font-bold text-stone-950 hover:bg-amber-400"
            >
              Return to Planner
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="text-center space-y-2">
              <h1 className="text-2xl sm:text-3xl font-black text-white">{event.name}</h1>
              <p className="text-xs text-stone-400">
                You are cordially invited as our honored guest, <strong className="text-amber-400">{guest.name}</strong>
              </p>
            </div>

            <div className="rounded-2xl border border-stone-800 bg-stone-950 p-4 text-xs text-stone-300 space-y-2">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-amber-400" />
                <span>{formatDate(event.eventDate)} at {formatTime(event.startTime)}</span>
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
                  className="mt-1 inline-flex items-center gap-1 text-[11px] font-semibold text-amber-400 hover:underline"
                >
                  <ExternalLink className="h-3 w-3" />
                  View Location on Google Maps
                </a>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-2">Will you be attending?</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setStatus('Confirmed')}
                    className={`rounded-xl py-3 text-xs font-bold transition flex items-center justify-center gap-2 ${
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
                    className={`rounded-xl py-3 text-xs font-bold transition flex items-center justify-center gap-2 ${
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
                    Number of Attendees in Your Party
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
                <label className="block text-xs font-semibold text-stone-300 mb-1">Dietary Preferences</label>
                <input
                  type="text"
                  value={dietary}
                  onChange={(e) => setDietary(e.target.value)}
                  placeholder="e.g. Jain food, Vegan, Halal, Nut allergy"
                  className="w-full rounded-xl border border-stone-700 bg-stone-950 px-3 py-2 text-xs text-white focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">Message to Host</label>
                <textarea
                  rows={2}
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Warm wishes and congratulations..."
                  className="w-full rounded-xl border border-stone-700 bg-stone-950 px-3 py-2 text-xs text-white focus:border-amber-400 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full rounded-xl bg-amber-500 py-3 text-xs font-bold text-stone-950 shadow-lg hover:bg-amber-400 transition"
            >
              Submit RSVP
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <EventProvider>
        <AppContent />
      </EventProvider>
    </AuthProvider>
  );
}
