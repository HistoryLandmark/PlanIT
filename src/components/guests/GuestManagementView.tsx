import React, { useState, useRef } from 'react';
import {
  Users,
  UserPlus,
  Upload,
  Download,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  XCircle,
  AlertTriangle,
  Send,
  MoreVertical,
  Edit2,
  Trash2,
  Link as LinkIcon,
  Copy,
  X,
  FileSpreadsheet
} from 'lucide-react';
import { useEvent } from '../../context/EventContext.tsx';
import { Guest, GuestCategory, InvitationStatus, RSVPStatus } from '../../types/database.ts';
import { dbService } from '../../services/db.ts';
import { exportToCSV } from '../../utils/formatters.ts';

interface GuestManagementViewProps {
  onOpenRSVPSimulator?: (guest: Guest) => void;
  onOpenCreateEvent?: () => void;
}

const CATEGORIES: GuestCategory[] = [
  'Family',
  'Relatives',
  'Friends',
  'Office/Colleagues',
  'Business Associates',
  'VIP Guests',
  'Others',
];

export const GuestManagementView: React.FC<GuestManagementViewProps> = ({
  onOpenRSVPSimulator,
  onOpenCreateEvent,
}) => {
  const { activeEvent, refreshData } = useEvent();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedRSVP, setSelectedRSVP] = useState<string>('all');
  const [selectedInviteStatus, setSelectedInviteStatus] = useState<string>('all');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null);

  const guests = activeEvent ? dbService.getGuests(activeEvent.id) : [];

  if (!activeEvent) {
    return (
      <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-stone-200 bg-white p-12 text-center">
        <Users className="h-10 w-10 text-stone-300" />
        <h3 className="mt-3 text-sm font-bold text-stone-900">No Event Selected</h3>
        <p className="mt-1 text-xs text-stone-500 max-w-sm">
          Please select or create an event first to manage the guest list, phone numbers, and categories.
        </p>
        {onOpenCreateEvent && (
          <button
            onClick={onOpenCreateEvent}
            className="mt-4 flex items-center gap-1.5 rounded-xl bg-stone-900 px-4 py-2 text-xs font-semibold text-white hover:bg-stone-800"
          >
            <UserPlus className="h-3.5 w-3.5" />
            <span>Create Event First</span>
          </button>
        )}
      </div>
    );
  }

  // Form State
  const [formName, setFormName] = useState('');
  const [formMobile, setFormMobile] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formHeadCount, setFormHeadCount] = useState(1);
  const [formCategory, setFormCategory] = useState<GuestCategory>('Friends');
  const [formInviteStatus, setFormInviteStatus] = useState<InvitationStatus>('Draft');
  const [formRSVPStatus, setFormRSVPStatus] = useState<RSVPStatus>('Pending');
  const [formRemarks, setFormRemarks] = useState('');
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);

  const openAddModal = () => {
    setEditingGuest(null);
    setFormName('');
    setFormMobile('');
    setFormEmail('');
    setFormHeadCount(1);
    setFormCategory('Friends');
    setFormInviteStatus('Draft');
    setFormRSVPStatus('Pending');
    setFormRemarks('');
    setDuplicateWarning(null);
    setIsModalOpen(true);
  };

  const openEditModal = (guest: Guest) => {
    setEditingGuest(guest);
    setFormName(guest.name);
    setFormMobile(guest.mobileNumber);
    setFormEmail(guest.emailAddress);
    setFormHeadCount(guest.headCount);
    setFormCategory(guest.category);
    setFormInviteStatus(guest.invitationStatus);
    setFormRSVPStatus(guest.rsvpStatus);
    setFormRemarks(guest.remarks || '');
    setDuplicateWarning(null);
    setIsModalOpen(true);
  };

  const checkDuplicates = (phone: string) => {
    if (!activeEvent || !phone.trim()) {
      setDuplicateWarning(null);
      return;
    }
    const dupes = dbService.findDuplicatePhones(activeEvent.id, phone, editingGuest?.id);
    if (dupes.length > 0) {
      setDuplicateWarning(`Warning: Mobile number already used by ${dupes.map((d) => d.name).join(', ')}`);
    } else {
      setDuplicateWarning(null);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeEvent || !formName.trim()) return;

    dbService.saveGuest({
      id: editingGuest?.id,
      eventId: activeEvent.id,
      name: formName.trim(),
      mobileNumber: formMobile.trim(),
      emailAddress: formEmail.trim(),
      headCount: Number(formHeadCount) > 0 ? Number(formHeadCount) : 1,
      category: formCategory,
      invitationStatus: formInviteStatus,
      rsvpStatus: formRSVPStatus,
      remarks: formRemarks.trim(),
    });

    setIsModalOpen(false);
    refreshData();
  };

  const handleDelete = (guest: Guest) => {
    if (window.confirm(`Delete guest "${guest.name}" from event guest list?`)) {
      dbService.deleteGuest(guest.id);
      refreshData();
    }
  };

  // CSV Export
  const handleExportCSV = () => {
    if (!activeEvent) return;
    const headers = [
      'Serial Number',
      'Guest Name',
      'Mobile Number',
      'Email Address',
      'Head Count',
      'Category',
      'Invitation Status',
      'RSVP Status',
      'Remarks',
      'RSVP Token',
    ];

    const rows = guests.map((g) => {
      return [
        g.serialNumber,
        g.name,
        g.mobileNumber,
        g.emailAddress,
        g.headCount,
        g.category,
        g.invitationStatus,
        g.rsvpStatus,
        g.remarks || '',
        g.uniqueToken,
      ];
    });

    exportToCSV(`PlanIT_Guests_${activeEvent.name.replace(/[^a-zA-Z0-9]/g, '_')}`, headers, rows);
  };

  // Sample CSV Download for Bulk Import
  const handleDownloadSampleCSV = () => {
    const headers = ['Guest Name', 'Mobile Number', 'Email Address', 'Head Count', 'Category', 'Remarks'];
    const sampleRows = [
      ['Ramesh & Geeta Verma', '+91 9822011223', 'ramesh.verma@example.com', '2', 'Relatives', 'Requires ground floor room'],
      ['Siddharth Joshi', '+91 9876543210', 'siddharth@example.com', '1', 'Friends', 'College buddy'],
      ['Anita Roy', '+91 9823145678', 'anita.roy@example.com', '3', 'Family', 'With 2 children'],
    ];
    exportToCSV('PlanIT_Guest_Bulk_Import_Template', headers, sampleRows);
  };

  // CSV Import Parser
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeEvent) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      if (!text) return;

      const lines = text.split('\n').filter((l) => l.trim().length > 0);
      if (lines.length <= 1) {
        alert('CSV file is empty or only contains headers.');
        return;
      }

      const importedGuests: Array<{ name: string; mobileNumber: string; emailAddress?: string; headCount?: number; category?: any; remarks?: string }> = [];

      for (let i = 1; i < lines.length; i++) {
        // Simple comma split respecting quotes
        const cols = lines[i].split(',').map((c) => c.replace(/^"|"$/g, '').trim());
        if (cols[0]) {
          importedGuests.push({
            name: cols[0],
            mobileNumber: cols[1] || '',
            emailAddress: cols[2] || '',
            headCount: parseInt(cols[3], 10) || 1,
            category: cols[4] || 'Friends',
            remarks: cols[5] || '',
          });
        }
      }

      const count = dbService.bulkImportGuests(activeEvent.id, importedGuests);
      alert(`Imported ${count} guests successfully!`);
      refreshData();
      if (fileInputRef.current) fileInputRef.current.value = '';
    };

    reader.readAsText(file);
  };

  // Filtering
  const filteredGuests = guests.filter((g) => {
    const matchesSearch =
      g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.mobileNumber.includes(searchQuery) ||
      g.emailAddress.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || g.category === selectedCategory;
    const matchesRSVP = selectedRSVP === 'all' || g.rsvpStatus === selectedRSVP;
    const matchesInvite = selectedInviteStatus === 'all' || g.invitationStatus === selectedInviteStatus;
    return matchesSearch && matchesCategory && matchesRSVP && matchesInvite;
  });

  // Aggregated Stats
  const totalGuests = guests.length;
  const totalExpectedAttendees = guests.reduce((sum, g) => sum + (g.headCount || 1), 0);
  const confirmedCount = guests.filter((g) => g.rsvpStatus === 'Confirmed').length;
  const confirmedAttendees = guests
    .filter((g) => g.rsvpStatus === 'Confirmed')
    .reduce((sum, g) => sum + (g.headCount || 1), 0);
  const pendingCount = guests.filter((g) => g.rsvpStatus === 'Pending').length;
  const declinedCount = guests.filter((g) => g.rsvpStatus === 'Declined').length;

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight text-stone-900 sm:text-2xl">
            Guest List Management
          </h1>
          <p className="mt-1 text-xs text-stone-500">
            Track invitations, headcounts, seating assignments, and RSVPs.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Hidden File Input for CSV */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".csv"
            className="hidden"
          />

          <button
            onClick={handleDownloadSampleCSV}
            className="flex items-center gap-1.5 rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-50"
            title="Download CSV Template"
          >
            <FileSpreadsheet className="h-4 w-4 text-stone-500" />
            <span className="hidden sm:inline">Template</span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-50"
          >
            <Upload className="h-4 w-4 text-stone-500" />
            <span>Import CSV</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-50"
          >
            <Download className="h-4 w-4 text-stone-500" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={openAddModal}
            className="flex items-center gap-1.5 rounded-xl bg-stone-900 px-4 py-2 text-xs font-semibold text-white shadow-md hover:bg-stone-800"
          >
            <UserPlus className="h-4 w-4" />
            <span>Add Guest</span>
          </button>
        </div>
      </div>

      {/* Aggregate Metric Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-xs">
          <span className="text-[11px] font-semibold text-stone-500">Total Invited Parties</span>
          <p className="mt-1 text-xl font-bold text-stone-900">{totalGuests}</p>
          <span className="text-[10px] text-stone-400">Unique guest entries</span>
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-xs">
          <span className="text-[11px] font-semibold text-stone-500">Expected Headcount</span>
          <p className="mt-1 text-xl font-bold text-stone-900">{totalExpectedAttendees}</p>
          <span className="text-[10px] text-stone-400">Total individual attendees</span>
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-xs">
          <span className="text-[11px] font-semibold text-stone-500">Confirmed Attendees</span>
          <p className="mt-1 text-xl font-bold text-emerald-600">{confirmedAttendees}</p>
          <span className="text-[10px] text-stone-400">{confirmedCount} invitations confirmed</span>
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-xs">
          <span className="text-[11px] font-semibold text-stone-500">Pending / Declined</span>
          <p className="mt-1 text-xl font-bold text-stone-900">
            {pendingCount} <span className="text-xs font-normal text-stone-400">/ {declinedCount} dec</span>
          </p>
          <span className="text-[10px] text-stone-400">Awaiting RSVP responses</span>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-stone-200 bg-white p-3 shadow-xs sm:flex-row sm:items-center">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-stone-400" />
          <input
            type="text"
            placeholder="Search by guest name, mobile, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-stone-200 pl-9 pr-4 py-2 text-xs font-medium focus:border-stone-400 focus:outline-none"
          />
        </div>

        {/* Category filter */}
        <div className="flex items-center gap-2">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs font-medium text-stone-700 focus:outline-none"
          >
            <option value="all">All Categories</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          {/* RSVP Status filter */}
          <select
            value={selectedRSVP}
            onChange={(e) => setSelectedRSVP(e.target.value)}
            className="rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs font-medium text-stone-700 focus:outline-none"
          >
            <option value="all">All RSVPs</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Pending">Pending</option>
            <option value="Declined">Declined</option>
          </select>

          {/* Invitation status filter */}
          <select
            value={selectedInviteStatus}
            onChange={(e) => setSelectedInviteStatus(e.target.value)}
            className="rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs font-medium text-stone-700 focus:outline-none"
          >
            <option value="all">All Invites</option>
            <option value="Draft">Draft</option>
            <option value="Ready">Ready</option>
            <option value="Sent">Sent</option>
            <option value="Failed">Failed</option>
          </select>
        </div>
      </div>

      {/* Guest Table */}
      <div className="overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-stone-200 bg-stone-50/80 font-bold uppercase text-stone-500 text-[10px] tracking-wider">
              <tr>
                <th className="px-4 py-3">#</th>
                <th className="px-4 py-3">Guest Name</th>
                <th className="px-4 py-3">Mobile & Email</th>
                <th className="px-4 py-3 text-center">Party Size</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Invite Status</th>
                <th className="px-4 py-3">RSVP</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredGuests.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-xs text-stone-400">
                    No guests match your filters. Click "Add Guest" to invite someone!
                  </td>
                </tr>
              ) : (
                filteredGuests.map((guest) => {
                  const isDupe = dbService.findDuplicatePhones(guest.eventId, guest.mobileNumber, guest.id).length > 0;

                  return (
                    <tr key={guest.id} className="hover:bg-stone-50/70 transition">
                      <td className="px-4 py-3 font-mono text-stone-400">{guest.serialNumber}</td>
                      <td className="px-4 py-3">
                        <div className="font-bold text-stone-900">{guest.name}</div>
                        {guest.remarks && (
                          <div className="text-[11px] text-stone-500 italic truncate max-w-xs">{guest.remarks}</div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <span className="font-medium text-stone-800">{guest.mobileNumber || '—'}</span>
                          {isDupe && (
                            <span className="inline-flex items-center gap-0.5 rounded bg-amber-100 px-1 py-0.2 text-[9px] font-bold text-amber-800" title="Duplicate Phone Number detected!">
                              <AlertTriangle className="h-3 w-3 text-amber-600" />
                              Dupe
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-stone-500">{guest.emailAddress || '—'}</div>
                      </td>
                      <td className="px-4 py-3 text-center font-bold text-stone-900">
                        {guest.headCount}
                      </td>
                      <td className="px-4 py-3">
                        <span className="rounded-lg bg-stone-100 px-2 py-0.5 text-[11px] font-medium text-stone-700">
                          {guest.category}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                            guest.invitationStatus === 'Sent'
                              ? 'bg-emerald-100 text-emerald-800'
                              : guest.invitationStatus === 'Ready'
                              ? 'bg-blue-100 text-blue-800'
                              : guest.invitationStatus === 'Failed'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-stone-100 text-stone-600'
                          }`}
                        >
                          {guest.invitationStatus}
                        </span>
                      </td>
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
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Test RSVP Link */}
                          <button
                            onClick={() => onOpenRSVPSimulator?.(guest)}
                            className="rounded-lg border border-stone-200 bg-white p-1.5 text-stone-600 hover:bg-stone-50"
                            title="Open Guest RSVP Card Simulator"
                          >
                            <LinkIcon className="h-3.5 w-3.5 text-amber-600" />
                          </button>
                          <button
                            onClick={() => openEditModal(guest)}
                            className="rounded-lg border border-stone-200 bg-white p-1.5 text-stone-600 hover:bg-stone-50"
                            title="Edit Guest"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(guest)}
                            className="rounded-lg border border-stone-200 bg-white p-1.5 text-red-600 hover:bg-red-50"
                            title="Delete Guest"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
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

      {/* Guest Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-3xl border border-stone-200 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-stone-100 px-6 py-4">
              <h3 className="text-base font-bold text-stone-900">
                {editingGuest ? 'Edit Guest Information' : 'Add New Guest to Event'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="rounded-lg p-1 text-stone-400 hover:bg-stone-100">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700">Guest Name / Family Name *</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Anand & Shilpa Joshi"
                  className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2 text-xs font-medium focus:border-stone-400 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700">Mobile Number</label>
                  <input
                    type="text"
                    value={formMobile}
                    onChange={(e) => {
                      setFormMobile(e.target.value);
                      checkDuplicates(e.target.value);
                    }}
                    placeholder="+91 98200 12345"
                    className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2 text-xs font-medium focus:border-stone-400 focus:outline-none"
                  />
                  {duplicateWarning && (
                    <p className="mt-1 text-[10px] font-semibold text-amber-700">{duplicateWarning}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700">Email Address</label>
                  <input
                    type="email"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="guest@example.com"
                    className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2 text-xs font-medium focus:border-stone-400 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700">Head Count (Attendees)</label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={formHeadCount}
                    onChange={(e) => setFormHeadCount(parseInt(e.target.value, 10) || 1)}
                    className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2 text-xs font-medium focus:border-stone-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700">Category</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as GuestCategory)}
                    className="mt-1 w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs font-medium focus:border-stone-400 focus:outline-none"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700">Invite Status</label>
                  <select
                    value={formInviteStatus}
                    onChange={(e) => setFormInviteStatus(e.target.value as InvitationStatus)}
                    className="mt-1 w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs font-medium focus:border-stone-400 focus:outline-none"
                  >
                    <option value="Draft">Draft</option>
                    <option value="Ready">Ready</option>
                    <option value="Sent">Sent</option>
                    <option value="Failed">Failed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700">RSVP Status</label>
                  <select
                    value={formRSVPStatus}
                    onChange={(e) => setFormRSVPStatus(e.target.value as RSVPStatus)}
                    className="mt-1 w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs font-medium focus:border-stone-400 focus:outline-none"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Declined">Declined</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700">Remarks / Dietary Needs</label>
                <input
                  type="text"
                  value={formRemarks}
                  onChange={(e) => setFormRemarks(e.target.value)}
                  placeholder="e.g. Jain food preference, VIP seating requested"
                  className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2 text-xs font-medium focus:border-stone-400 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-stone-200 px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-stone-900 px-5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-stone-800"
                >
                  {editingGuest ? 'Save Changes' : 'Add Guest'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
