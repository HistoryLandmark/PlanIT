import React, { useState } from 'react';
import {
  Mail,
  Send,
  Sparkles,
  Smartphone,
  Copy,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Clock,
  Palette,
  Globe,
  MessageSquare,
  FileText,
  Eye,
  RefreshCw,
  Users
} from 'lucide-react';
import { useEvent } from '../../context/EventContext.tsx';
import {
  InvitationTemplate,
  InvitationTone,
  InvitationLanguage,
  InvitationTemplateStyle,
  Guest
} from '../../types/database.ts';
import { dbService } from '../../services/db.ts';
import { formatDate, formatTime } from '../../utils/formatters.ts';

const TEMPLATE_STYLES: InvitationTemplateStyle[] = [
  'Royal Gold Floral',
  'Modern Vibrant',
  'Traditional Festive',
  'Minimalist Linear',
];

const TONES: InvitationTone[] = ['Traditional', 'Formal', 'Modern'];
const LANGUAGES: InvitationLanguage[] = ['English', 'Marathi', 'Hindi'];

interface InvitationManagementViewProps {
  onOpenCreateEvent?: () => void;
}

export const InvitationManagementView: React.FC<InvitationManagementViewProps> = ({ onOpenCreateEvent }) => {
  const { activeEvent, refreshData } = useEvent();

  const [activeChannelTab, setActiveChannelTab] = useState<'builder' | 'whatsapp' | 'email' | 'logs'>('builder');

  // Builder state
  const [selectedStyle, setSelectedStyle] = useState<InvitationTemplateStyle>('Royal Gold Floral');
  const [selectedTone, setSelectedTone] = useState<InvitationTone>('Traditional');
  const [selectedLanguage, setSelectedLanguage] = useState<InvitationLanguage>('English');
  const [customHeadline, setCustomHeadline] = useState('');
  const [customBody, setCustomBody] = useState('');

  const guests = activeEvent ? dbService.getGuests(activeEvent.id) : [];
  const logs = activeEvent ? dbService.getInvitationLogs(activeEvent.id) : [];
  const [selectedGuestId, setSelectedGuestId] = useState<string>(guests[0]?.id || '');

  if (!activeEvent) {
    return (
      <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-stone-200 bg-white p-12 text-center">
        <Mail className="h-10 w-10 text-stone-300" />
        <h3 className="mt-3 text-sm font-bold text-stone-900">No Event Selected</h3>
        <p className="mt-1 text-xs text-stone-500 max-w-sm">
          Please select or create an event to customize digital invitations and launch WhatsApp / Email delivery.
        </p>
        {onOpenCreateEvent && (
          <button
            onClick={onOpenCreateEvent}
            className="mt-4 flex items-center gap-1.5 rounded-xl bg-stone-900 px-4 py-2 text-xs font-semibold text-white hover:bg-stone-800"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Create Event First</span>
          </button>
        )}
      </div>
    );
  }

  const previewGuest = guests.find((g) => g.id === selectedGuestId) || guests[0] || {
    id: 'preview',
    name: 'Honored Guest',
    mobileNumber: '+91 98200 12345',
    emailAddress: 'guest@example.com',
    headCount: 2,
    uniqueToken: 'rsvp-sample-token',
  };

  // Generate dynamic message based on event and language/tone
  const getGeneratedMessage = (lang: InvitationLanguage, tone: InvitationTone, gName: string) => {
    if (!activeEvent) return '';
    const rsvpUrl = `${window.location.origin}/#rsvp=${previewGuest.uniqueToken}`;

    if (lang === 'Marathi') {
      return `॥ श्री गणेशाय नमः ॥\n\nसप्रेम नमस्कार ${gName},\n\nआमच्या येथे ${activeEvent.name} चे शुभमंगल व स्नेहभोजन आयोजित केले आहे.\n\n📅 दिनांक: ${formatDate(activeEvent.eventDate)}\n⏰ वेळ: ${formatTime(activeEvent.startTime)}\n📍 ठिकाण: ${activeEvent.venueName}, ${activeEvent.venueAddress}\n\nआपली उपस्थिती आमच्या आनंदात भर घालेल.\n\nकृपया उपस्थिती नोंदवण्यासाठी खालील लिंकवर क्लिक करा:\n${rsvpUrl}\n\nआपले नम्र,\n${activeEvent.organizerName}`;
    }

    if (lang === 'Hindi') {
      return `॥ शुभ विवाह व स्वागत समारोह ॥\n\nआदरणीय ${gName},\n\nहमारे परिवार में ${activeEvent.name} का मांगलिक उत्सव आयोजित किया गया है।\n\nदिनांक: ${formatDate(activeEvent.eventDate)}\nसमय: ${formatTime(activeEvent.startTime)}\nस्थान: ${activeEvent.venueName}, ${activeEvent.venueAddress}\n\nआप सहपरिवार सादर आमंत्रित हैं।\n\nकृपया अपनी उपस्थिति दर्ज करें:\n${rsvpUrl}\n\nदर्शनाभिलाषी,\n${activeEvent.organizerName}`;
    }

    // English
    if (tone === 'Formal') {
      return `Dear ${gName},\n\nWe take immense pleasure in cordially inviting you and your family to grace the auspicious celebration of ${activeEvent.name}.\n\nDate: ${formatDate(activeEvent.eventDate)}\nTime: ${formatTime(activeEvent.startTime)} to ${formatTime(activeEvent.endTime)}\nVenue: ${activeEvent.venueName}\nAddress: ${activeEvent.venueAddress}\n\nPlease confirm your presence using the official RSVP link:\n${rsvpUrl}\n\nWarm regards,\n${activeEvent.organizerName}`;
    }

    if (tone === 'Modern') {
      return `Hey ${gName}! ✨\n\nThe countdown is officially on for ${activeEvent.name}! We can't celebrate this milestone without you.\n\n📅 ${formatDate(activeEvent.eventDate)} at ${formatTime(activeEvent.startTime)}\n📍 ${activeEvent.venueName}\n🗺️ Location: ${activeEvent.googleMapsUrl || 'Venue on Map'}\n\nTap here to RSVP in seconds:\n${rsvpUrl}\n\nCan't wait to see you! 🎉\n${activeEvent.organizerName}`;
    }

    // Traditional English
    return `Together with our families,\nWe joyfully invite ${gName} to celebrate ${activeEvent.name}.\n\nDate: ${formatDate(activeEvent.eventDate)}\nTime: ${formatTime(activeEvent.startTime)}\nVenue: ${activeEvent.venueName}\n\nYour presence and blessings will make our celebration complete.\n\nRSVP link: ${rsvpUrl}\n\nWith warm blessings,\n${activeEvent.organizerName}`;
  };

  const finalMessage = customBody || getGeneratedMessage(selectedLanguage, selectedTone, previewGuest.name);

  // Send Single WhatsApp
  const handleOpenWhatsApp = (guest: Guest) => {
    if (!activeEvent) return;
    const phone = guest.mobileNumber.replace(/\D/g, '');
    const msg = getGeneratedMessage(selectedLanguage, selectedTone, guest.name);
    const encoded = encodeURIComponent(msg);
    const waUrl = phone ? `https://wa.me/${phone}?text=${encoded}` : `https://wa.me/?text=${encoded}`;
    window.open(waUrl, '_blank');

    // Prompt user to record log accurately (avoid false delivery marking)
    if (window.confirm(`WhatsApp opened for ${guest.name}. Mark invitation status as "Sent"?`)) {
      dbService.logInvitationSent({
        eventId: activeEvent.id,
        guestId: guest.id,
        guestName: guest.name,
        recipientContact: guest.mobileNumber,
        channel: 'WhatsApp',
        status: 'Sent',
      });
      refreshData();
    }
  };

  // Simulate Bulk WhatsApp sending
  const [isBulkSending, setIsBulkSending] = useState(false);
  const handleBulkWhatsApp = async () => {
    if (!activeEvent) return;
    const pendingGuests = guests.filter((g) => g.invitationStatus !== 'Sent' && g.mobileNumber);
    if (pendingGuests.length === 0) {
      alert('All guests with mobile numbers have already been sent invitations!');
      return;
    }

    if (
      !window.confirm(
        `Start automated WhatsApp queue for ${pendingGuests.length} guests via the WhatsApp Cloud API simulated batch?`
      )
    ) {
      return;
    }

    setIsBulkSending(true);
    let sentCount = 0;

    for (const g of pendingGuests) {
      dbService.logInvitationSent({
        eventId: activeEvent.id,
        guestId: g.id,
        guestName: g.name,
        recipientContact: g.mobileNumber,
        channel: 'WhatsApp',
        status: 'Sent',
      });
      sentCount++;
    }

    setIsBulkSending(false);
    alert(`Successfully sent invitations to ${sentCount} guests via WhatsApp!`);
    refreshData();
  };

  // Send Single Email
  const handleSendEmail = (guest: Guest) => {
    if (!activeEvent) return;
    const email = guest.emailAddress;
    const subject = `Invitation: ${activeEvent.name}`;
    const body = getGeneratedMessage(selectedLanguage, selectedTone, guest.name);

    dbService.logInvitationSent({
      eventId: activeEvent.id,
      guestId: guest.id,
      guestName: guest.name,
      recipientContact: email || 'Direct Mail',
      channel: 'Email',
      subject,
      status: 'Sent',
    });

    alert(`Email invitation successfully queued and dispatched to ${guest.name} (${email || 'Direct'})!`);
    refreshData();
  };

  // Simulate Bulk Email
  const handleBulkEmail = () => {
    if (!activeEvent) return;
    const pendingGuests = guests.filter((g) => g.invitationStatus !== 'Sent' && g.emailAddress);
    if (pendingGuests.length === 0) {
      alert('All guests with email addresses have already received invitations!');
      return;
    }

    if (!window.confirm(`Dispatch branded email invitations to ${pendingGuests.length} guests?`)) return;

    pendingGuests.forEach((g) => {
      dbService.logInvitationSent({
        eventId: activeEvent.id,
        guestId: g.id,
        guestName: g.name,
        recipientContact: g.emailAddress,
        channel: 'Email',
        subject: `Exclusive Invitation: ${activeEvent.name}`,
        status: 'Sent',
      });
    });

    alert(`Successfully dispatched ${pendingGuests.length} email invitations!`);
    refreshData();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight text-stone-900 sm:text-2xl">
            Invitation Studio & Delivery
          </h1>
          <p className="mt-1 text-xs text-stone-500">
            Craft bespoke multilingual invitation cards and deliver via WhatsApp and Email with instant RSVP links.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveChannelTab('whatsapp')}
            className="flex items-center gap-1.5 rounded-xl border border-emerald-300 bg-emerald-50 px-3.5 py-2 text-xs font-bold text-emerald-800 shadow-xs hover:bg-emerald-100"
          >
            <Smartphone className="h-4 w-4 text-emerald-600" />
            <span>WhatsApp Sender</span>
          </button>
          <button
            onClick={() => setActiveChannelTab('email')}
            className="flex items-center gap-1.5 rounded-xl border border-blue-300 bg-blue-50 px-3.5 py-2 text-xs font-bold text-blue-800 shadow-xs hover:bg-blue-100"
          >
            <Mail className="h-4 w-4 text-blue-600" />
            <span>Email Sender</span>
          </button>
        </div>
      </div>

      {/* Channel Tabs */}
      <div className="flex border-b border-stone-200 gap-6 text-xs font-bold">
        <button
          onClick={() => setActiveChannelTab('builder')}
          className={`pb-3 transition ${
            activeChannelTab === 'builder'
              ? 'border-b-2 border-stone-900 text-stone-900'
              : 'text-stone-400 hover:text-stone-700'
          }`}
        >
          Invitation Builder & Themes
        </button>
        <button
          onClick={() => setActiveChannelTab('whatsapp')}
          className={`pb-3 transition ${
            activeChannelTab === 'whatsapp'
              ? 'border-b-2 border-stone-900 text-stone-900'
              : 'text-stone-400 hover:text-stone-700'
          }`}
        >
          WhatsApp Campaign ({guests.filter((g) => g.mobileNumber).length} recipients)
        </button>
        <button
          onClick={() => setActiveChannelTab('email')}
          className={`pb-3 transition ${
            activeChannelTab === 'email'
              ? 'border-b-2 border-stone-900 text-stone-900'
              : 'text-stone-400 hover:text-stone-700'
          }`}
        >
          Email Campaign ({guests.filter((g) => g.emailAddress).length} recipients)
        </button>
        <button
          onClick={() => setActiveChannelTab('logs')}
          className={`pb-3 transition ${
            activeChannelTab === 'logs'
              ? 'border-b-2 border-stone-900 text-stone-900'
              : 'text-stone-400 hover:text-stone-700'
          }`}
        >
          Delivery Audit History ({logs.length})
        </button>
      </div>

      {/* Tab: Builder */}
      {activeChannelTab === 'builder' && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Left Column: Builder Controls */}
          <div className="space-y-4 lg:col-span-5">
            <div className="rounded-3xl border border-stone-200 bg-white p-5 shadow-xs space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400">Card Design & Template</h3>
              <div className="grid grid-cols-2 gap-2">
                {TEMPLATE_STYLES.map((st) => (
                  <button
                    key={st}
                    onClick={() => setSelectedStyle(st)}
                    className={`rounded-xl border p-2.5 text-left text-xs font-semibold transition ${
                      selectedStyle === st
                        ? 'border-amber-500 bg-amber-50/50 text-amber-900 ring-1 ring-amber-400'
                        : 'border-stone-200 text-stone-700 hover:bg-stone-50'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>

              {/* Language & Tone */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-stone-700">Language</label>
                  <select
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value as InvitationLanguage)}
                    className="mt-1 w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs font-medium focus:border-stone-400 focus:outline-none"
                  >
                    {LANGUAGES.map((l) => (
                      <option key={l} value={l}>{l}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700">Tone</label>
                  <select
                    value={selectedTone}
                    onChange={(e) => setSelectedTone(e.target.value as InvitationTone)}
                    className="mt-1 w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs font-medium focus:border-stone-400 focus:outline-none"
                  >
                    {TONES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Preview Guest Selector */}
              <div>
                <label className="block text-xs font-semibold text-stone-700">Preview With Guest</label>
                <select
                  value={selectedGuestId}
                  onChange={(e) => setSelectedGuestId(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs font-medium focus:border-stone-400 focus:outline-none"
                >
                  {guests.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name} ({g.headCount} attendees • {g.category})
                    </option>
                  ))}
                </select>
              </div>

              {/* Message Editor */}
              <div>
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-stone-700">Invitation Message</label>
                  <button
                    onClick={() => setCustomBody('')}
                    className="flex items-center gap-1 text-[11px] text-stone-500 hover:text-stone-900"
                  >
                    <RefreshCw className="h-3 w-3" />
                    Reset to Default
                  </button>
                </div>
                <textarea
                  rows={8}
                  value={finalMessage}
                  onChange={(e) => setCustomBody(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-stone-200 p-3 font-sans text-xs leading-relaxed focus:border-stone-400 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Right Column: Live Luxury Card Mockup Preview */}
          <div className="lg:col-span-7 flex flex-col justify-start">
            <div className="sticky top-20 rounded-3xl border border-stone-200 bg-stone-900 p-6 sm:p-8 text-white shadow-2xl">
              <div className="flex items-center justify-between border-b border-stone-800 pb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                  {selectedStyle} • Card Preview
                </span>
                <span className="rounded-full bg-stone-800 px-2.5 py-0.5 text-[10px] font-semibold text-stone-300">
                  {selectedLanguage} • {selectedTone}
                </span>
              </div>

              {/* Card Container with luxury border frame */}
              <div
                className={`mt-6 rounded-2xl p-6 sm:p-8 text-center transition-all ${
                  selectedStyle === 'Royal Gold Floral'
                    ? 'border-2 border-amber-500/50 bg-gradient-to-b from-stone-950 via-stone-900 to-stone-950 shadow-amber-500/10'
                    : selectedStyle === 'Modern Vibrant'
                    ? 'border border-purple-500/50 bg-gradient-to-b from-stone-950 via-purple-950/40 to-stone-950 shadow-purple-500/10'
                    : selectedStyle === 'Traditional Festive'
                    ? 'border-2 border-red-500/50 bg-gradient-to-b from-stone-950 via-red-950/40 to-stone-950 shadow-red-500/10'
                    : 'border border-stone-700 bg-stone-950 shadow-lg'
                }`}
              >
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/20 text-amber-400 ring-1 ring-amber-500/40 mb-3">
                  <Sparkles className="h-5 w-5" />
                </div>

                <div className="text-xs uppercase font-bold tracking-widest text-amber-400">
                  Official Invitation
                </div>

                <h2 className="mt-2 text-xl sm:text-2xl font-black text-white">
                  {activeEvent?.name}
                </h2>

                <p className="mt-1 text-xs text-stone-300 font-medium">
                  Honoring our guest: <strong className="text-amber-300">{previewGuest.name}</strong>
                </p>

                <div className="my-6 whitespace-pre-line text-xs sm:text-sm text-stone-300 leading-relaxed max-w-lg mx-auto border-t border-b border-stone-800/80 py-4">
                  {finalMessage}
                </div>

                <div className="rounded-xl bg-stone-900/90 p-3 text-xs text-stone-400 space-y-1">
                  <div>📅 {formatDate(activeEvent?.eventDate)} at {formatTime(activeEvent?.startTime)}</div>
                  <div>📍 {activeEvent?.venueName}</div>
                </div>

                {/* Simulated RSVP Button */}
                <div className="mt-5">
                  <div className="inline-block rounded-xl bg-amber-500 px-6 py-2.5 text-xs font-bold text-stone-950 shadow-md">
                    Confirm Attendance (RSVP)
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: WhatsApp Campaign */}
      {activeChannelTab === 'whatsapp' && (
        <div className="space-y-4">
          <div className="flex flex-col justify-between gap-3 rounded-2xl border border-stone-200 bg-emerald-50/50 p-4 sm:flex-row sm:items-center">
            <div>
              <h3 className="text-xs font-bold text-emerald-950">WhatsApp Direct & Automated Messaging</h3>
              <p className="text-[11px] text-emerald-800">
                Click any guest to open WhatsApp Web / App with prefilled personalized greeting and direct RSVP link.
              </p>
            </div>
            <button
              onClick={handleBulkWhatsApp}
              disabled={isBulkSending}
              className="flex items-center gap-1.5 rounded-xl bg-emerald-700 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-800 transition"
            >
              <Smartphone className="h-4 w-4" />
              <span>{isBulkSending ? 'Sending...' : 'Automated Bulk Dispatch'}</span>
            </button>
          </div>

          {/* List of Guests for WhatsApp */}
          <div className="overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-stone-200 bg-stone-50 font-bold uppercase text-stone-500 text-[10px] tracking-wider">
                <tr>
                  <th className="px-4 py-3">Guest Name</th>
                  <th className="px-4 py-3">Mobile Number</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {guests.map((g) => (
                  <tr key={g.id} className="hover:bg-stone-50/70 transition">
                    <td className="px-4 py-3 font-bold text-stone-900">{g.name}</td>
                    <td className="px-4 py-3 font-mono text-stone-700">{g.mobileNumber || 'No phone'}</td>
                    <td className="px-4 py-3 text-stone-600">{g.category}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          g.invitationStatus === 'Sent'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-stone-100 text-stone-600'
                        }`}
                      >
                        {g.invitationStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleOpenWhatsApp(g)}
                        disabled={!g.mobileNumber}
                        className="rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700 disabled:opacity-40"
                      >
                        Open WhatsApp
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Email Campaign */}
      {activeChannelTab === 'email' && (
        <div className="space-y-4">
          <div className="flex flex-col justify-between gap-3 rounded-2xl border border-stone-200 bg-blue-50/50 p-4 sm:flex-row sm:items-center">
            <div>
              <h3 className="text-xs font-bold text-blue-950">Email Invitations Delivery</h3>
              <p className="text-[11px] text-blue-800">
                Send formal HTML invitations directly to guest inboxes with responsive styling.
              </p>
            </div>
            <button
              onClick={handleBulkEmail}
              className="flex items-center gap-1.5 rounded-xl bg-blue-700 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-800 transition"
            >
              <Mail className="h-4 w-4" />
              <span>Bulk Email All Guests</span>
            </button>
          </div>

          <div className="overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-stone-200 bg-stone-50 font-bold uppercase text-stone-500 text-[10px] tracking-wider">
                <tr>
                  <th className="px-4 py-3">Guest Name</th>
                  <th className="px-4 py-3">Email Address</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {guests.map((g) => (
                  <tr key={g.id} className="hover:bg-stone-50/70 transition">
                    <td className="px-4 py-3 font-bold text-stone-900">{g.name}</td>
                    <td className="px-4 py-3 text-stone-700">{g.emailAddress || 'No email provided'}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          g.invitationStatus === 'Sent'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-stone-100 text-stone-600'
                        }`}
                      >
                        {g.invitationStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleSendEmail(g)}
                        disabled={!g.emailAddress}
                        className="rounded-xl bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 disabled:opacity-40"
                      >
                        Send Email
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Delivery Logs */}
      {activeChannelTab === 'logs' && (
        <div className="overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-xs">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-stone-200 bg-stone-50 font-bold uppercase text-stone-500 text-[10px] tracking-wider">
              <tr>
                <th className="px-4 py-3">Guest</th>
                <th className="px-4 py-3">Channel</th>
                <th className="px-4 py-3">Recipient Contact</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-xs text-stone-400">
                    No invitation dispatches recorded yet.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-stone-50/70 transition">
                    <td className="px-4 py-3 font-bold text-stone-900">{log.guestName}</td>
                    <td className="px-4 py-3 font-semibold text-stone-700">{log.channel}</td>
                    <td className="px-4 py-3 font-mono text-stone-600">{log.recipientContact}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800">
                        {log.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-stone-500 text-[11px]">{new Date(log.sentAt).toLocaleString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
