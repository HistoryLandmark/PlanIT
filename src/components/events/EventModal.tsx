import React, { useState, useEffect } from 'react';
import { X, Calendar, MapPin, DollarSign, User, Image as ImageIcon, Sparkles } from 'lucide-react';
import { Event, EventCategory } from '../../types/database.ts';
import { useAuth } from '../../context/AuthContext.tsx';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>) => void;
  initialData?: Event | null;
}

const CATEGORIES: EventCategory[] = [
  'Wedding',
  'Engagement',
  'Reception',
  'Birthday',
  'Corporate',
  'Family Function',
  'Anniversary',
  'Other',
];

const PRESET_COVERS = [
  { label: 'Royal Wedding', url: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&auto=format&fit=crop&q=80' },
  { label: 'Corporate Gala', url: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=1200&auto=format&fit=crop&q=80' },
  { label: 'Birthday Bash', url: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=1200&auto=format&fit=crop&q=80' },
  { label: 'Floral Garden', url: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=1200&auto=format&fit=crop&q=80' },
  { label: 'Evening Lights', url: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1200&auto=format&fit=crop&q=80' },
];

export const EventModal: React.FC<EventModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const { currentUser, currency } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    category: 'Wedding' as EventCategory,
    description: '',
    eventDate: '2026-12-15',
    startTime: '18:00',
    endTime: '23:00',
    venueName: '',
    venueAddress: '',
    googleMapsUrl: '',
    coverImage: PRESET_COVERS[0].url,
    organizerName: currentUser?.name || 'Event Host',
    contactPhone: '+91 98200 11223',
    contactEmail: currentUser?.email || 'host@planit.io',
    estimatedBudget: 500000,
    additionalNotes: '',
    status: 'upcoming' as Event['status'],
    ownerId: currentUser?.id || 'user-1',
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        category: initialData.category,
        description: initialData.description,
        eventDate: initialData.eventDate,
        startTime: initialData.startTime,
        endTime: initialData.endTime,
        venueName: initialData.venueName,
        venueAddress: initialData.venueAddress,
        googleMapsUrl: initialData.googleMapsUrl,
        coverImage: initialData.coverImage,
        organizerName: initialData.organizerName,
        contactPhone: initialData.contactPhone,
        contactEmail: initialData.contactEmail,
        estimatedBudget: initialData.estimatedBudget,
        additionalNotes: initialData.additionalNotes || '',
        status: initialData.status,
        ownerId: initialData.ownerId,
      });
    } else {
      setFormData((prev) => ({
        ...prev,
        organizerName: currentUser?.name || 'Event Host',
        contactEmail: currentUser?.email || 'host@planit.io',
        ownerId: currentUser?.id || 'user-1',
      }));
    }
  }, [initialData, currentUser]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.venueName.trim() || !formData.eventDate) {
      alert('Please fill in Event Name, Venue, and Date.');
      return;
    }
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/50 p-4 backdrop-blur-xs">
      <div className="flex max-h-[92vh] w-full max-w-3xl flex-col rounded-3xl border border-stone-200 bg-white shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-stone-100 px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-stone-900 text-amber-400">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-stone-900">
                {initialData ? 'Edit Event Details' : 'Create New Event'}
              </h2>
              <p className="text-xs text-stone-500">Enter event essentials, venue coordinates, and budget</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
          {/* Section: General Info */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400">Event Overview</h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-stone-700">Event Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Sanya & Kabir's Wedding Celebration"
                  className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2 text-xs font-medium focus:border-stone-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700">Category *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as EventCategory })}
                  className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2 text-xs font-medium focus:border-stone-400 focus:outline-none bg-white"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700">Description</label>
              <textarea
                rows={2}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="A warm note detailing the purpose, schedule, or theme..."
                className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2 text-xs font-medium focus:border-stone-400 focus:outline-none"
              />
            </div>
          </div>

          {/* Section: Schedule & Timings */}
          <div className="space-y-3 border-t border-stone-100 pt-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400">Date & Timings</h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700">Event Date *</label>
                <input
                  type="date"
                  required
                  value={formData.eventDate}
                  onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2 text-xs font-medium focus:border-stone-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-700">Start Time</label>
                <input
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2 text-xs font-medium focus:border-stone-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-700">End Time</label>
                <input
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2 text-xs font-medium focus:border-stone-400 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section: Venue & Maps */}
          <div className="space-y-3 border-t border-stone-100 pt-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400">Venue & Location</h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-stone-700">Venue Name *</label>
                <input
                  type="text"
                  required
                  value={formData.venueName}
                  onChange={(e) => setFormData({ ...formData, venueName: e.target.value })}
                  placeholder="e.g. The Grand Palace & Ballroom"
                  className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2 text-xs font-medium focus:border-stone-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-700">Google Maps Link</label>
                <input
                  type="url"
                  value={formData.googleMapsUrl}
                  onChange={(e) => setFormData({ ...formData, googleMapsUrl: e.target.value })}
                  placeholder="https://maps.google.com/?q=..."
                  className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2 text-xs font-medium focus:border-stone-400 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700">Complete Address</label>
              <input
                type="text"
                value={formData.venueAddress}
                onChange={(e) => setFormData({ ...formData, venueAddress: e.target.value })}
                placeholder="Street address, landmarks, city, pin code"
                className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2 text-xs font-medium focus:border-stone-400 focus:outline-none"
              />
            </div>
          </div>

          {/* Section: Cover Image */}
          <div className="space-y-3 border-t border-stone-100 pt-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400">Cover Banner</h3>
            <div className="flex flex-wrap gap-2">
              {PRESET_COVERS.map((preset, i) => (
                <button
                  type="button"
                  key={i}
                  onClick={() => setFormData({ ...formData, coverImage: preset.url })}
                  className={`relative h-16 w-24 overflow-hidden rounded-xl border-2 transition ${
                    formData.coverImage === preset.url ? 'border-amber-500 ring-2 ring-amber-200' : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={preset.url} alt={preset.label} className="h-full w-full object-cover" />
                  <span className="absolute inset-x-0 bottom-0 bg-stone-900/60 text-[9px] font-medium text-white text-center py-0.5">
                    {preset.label}
                  </span>
                </button>
              ))}
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700">Or Custom Image URL</label>
              <input
                type="url"
                value={formData.coverImage}
                onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2 text-xs font-medium focus:border-stone-400 focus:outline-none"
              />
            </div>
          </div>

          {/* Section: Budget & Organizer */}
          <div className="space-y-3 border-t border-stone-100 pt-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400">Budget & Contact</h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700">Estimated Budget ({currency})</label>
                <input
                  type="number"
                  min="0"
                  step="5000"
                  value={formData.estimatedBudget}
                  onChange={(e) => setFormData({ ...formData, estimatedBudget: Number(e.target.value) })}
                  className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2 text-xs font-medium focus:border-stone-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-700">Organizer Name</label>
                <input
                  type="text"
                  value={formData.organizerName}
                  onChange={(e) => setFormData({ ...formData, organizerName: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2 text-xs font-medium focus:border-stone-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-700">Contact Phone</label>
                <input
                  type="text"
                  value={formData.contactPhone}
                  onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2 text-xs font-medium focus:border-stone-400 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700">Additional Notes / Dress Code / Guidelines</label>
              <input
                type="text"
                value={formData.additionalNotes}
                onChange={(e) => setFormData({ ...formData, additionalNotes: e.target.value })}
                placeholder="e.g. Formal attire, valet parking provided at West Gate..."
                className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2 text-xs font-medium focus:border-stone-400 focus:outline-none"
              />
            </div>
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-end gap-3 border-t border-stone-100 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-stone-200 px-4 py-2 text-xs font-medium text-stone-600 hover:bg-stone-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-stone-900 px-5 py-2 text-xs font-semibold text-white shadow-md hover:bg-stone-800"
            >
              {initialData ? 'Save Changes' : 'Create Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
