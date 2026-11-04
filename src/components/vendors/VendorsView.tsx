import React, { useState } from 'react';
import {
  Store,
  Plus,
  Phone,
  Mail,
  Edit2,
  Trash2,
  DollarSign,
  Star,
  CheckCircle2,
  Clock,
  X,
  ExternalLink
} from 'lucide-react';
import { useEvent } from '../../context/EventContext.tsx';
import { useAuth } from '../../context/AuthContext.tsx';
import { dbService } from '../../services/db.ts';
import { Vendor, ExpenseCategoryName } from '../../types/database.ts';
import { formatCurrency } from '../../utils/formatters.ts';

const CATEGORIES: ExpenseCategoryName[] = [
  'Venue',
  'Catering',
  'Decoration',
  'Photography and videography',
  'Clothing',
  'Jewellery',
  'Invitations and printing',
  'Transportation',
  'Accommodation',
  'Entertainment',
  'Gifts',
  'Miscellaneous',
];

interface VendorsViewProps {
  onOpenCreateEvent?: () => void;
}

export const VendorsView: React.FC<VendorsViewProps> = ({ onOpenCreateEvent }) => {
  const { activeEvent, refreshData } = useEvent();
  const { currency } = useAuth();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);

  const vendors = activeEvent ? dbService.getVendors(activeEvent.id) : [];

  if (!activeEvent) {
    return (
      <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-stone-200 bg-white p-12 text-center">
        <Store className="h-10 w-10 text-stone-300" />
        <h3 className="mt-3 text-sm font-bold text-stone-900">No Event Selected</h3>
        <p className="mt-1 text-xs text-stone-500 max-w-sm">
          Please select or create an event to manage catering, photography, decor, and venue contracts.
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

  // Form states
  const [name, setName] = useState('');
  const [category, setCategory] = useState<ExpenseCategoryName>('Catering');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [contractAmount, setContractAmount] = useState<number>(100000);
  const [paidAmount, setPaidAmount] = useState<number>(50000);
  const [rating, setRating] = useState<number>(5);
  const [status, setStatus] = useState<Vendor['status']>('Hired');
  const [notes, setNotes] = useState('');

  const openAddModal = () => {
    setEditingVendor(null);
    setName('');
    setCategory('Catering');
    setContactPerson('');
    setPhone('');
    setEmail('');
    setContractAmount(100000);
    setPaidAmount(0);
    setRating(5);
    setStatus('Hired');
    setNotes('');
    setIsModalOpen(true);
  };

  const openEditModal = (v: Vendor) => {
    setEditingVendor(v);
    setName(v.name);
    setCategory(v.category);
    setContactPerson(v.contactPerson);
    setPhone(v.phone);
    setEmail(v.email);
    setContractAmount(v.contractAmount);
    setPaidAmount(v.paidAmount);
    setRating(v.rating || 5);
    setStatus(v.status);
    setNotes(v.notes || '');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeEvent || !name.trim()) return;

    dbService.saveVendor({
      id: editingVendor?.id,
      eventId: activeEvent.id,
      name: name.trim(),
      category,
      contactPerson: contactPerson.trim(),
      phone: phone.trim(),
      email: email.trim(),
      contractAmount: Number(contractAmount),
      paidAmount: Number(paidAmount),
      rating: Number(rating),
      status,
      notes: notes.trim(),
    });

    setIsModalOpen(false);
    refreshData();
  };

  const handleDelete = (v: Vendor) => {
    if (window.confirm(`Delete vendor "${v.name}"?`)) {
      dbService.deleteVendor(v.id);
      refreshData();
    }
  };

  const totalContract = vendors.reduce((s, v) => s + v.contractAmount, 0);
  const totalPaid = vendors.reduce((s, v) => s + v.paidAmount, 0);
  const totalPending = Math.max(0, totalContract - totalPaid);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight text-stone-900 sm:text-2xl">
            Vendor Directory & Contracts
          </h1>
          <p className="mt-1 text-xs text-stone-500">
            Track external partners, caterers, decorators, contracts, and settlement statuses.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center gap-1.5 rounded-xl bg-stone-900 px-4 py-2 text-xs font-semibold text-white shadow-md hover:bg-stone-800"
        >
          <Plus className="h-4 w-4" />
          <span>Add Vendor</span>
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-xs">
          <span className="text-[11px] font-semibold text-stone-500">Total Contract Value</span>
          <p className="mt-1 text-xl font-bold text-stone-900">{formatCurrency(totalContract, currency)}</p>
          <span className="text-[10px] text-stone-400">{vendors.length} signed partner agreements</span>
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-xs">
          <span className="text-[11px] font-semibold text-stone-500">Total Paid to Date</span>
          <p className="mt-1 text-xl font-bold text-emerald-600">{formatCurrency(totalPaid, currency)}</p>
          <span className="text-[10px] text-stone-400">
            {totalContract > 0 ? `${Math.round((totalPaid / totalContract) * 100)}% settled` : '0%'}
          </span>
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-xs">
          <span className="text-[11px] font-semibold text-stone-500">Outstanding Balance Due</span>
          <p className="mt-1 text-xl font-bold text-amber-600">{formatCurrency(totalPending, currency)}</p>
          <span className="text-[10px] text-stone-400">Payable before celebration</span>
        </div>
      </div>

      {/* Vendor Cards Grid */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {vendors.map((vendor) => {
          const balanceDue = Math.max(0, vendor.contractAmount - vendor.paidAmount);

          return (
            <div
              key={vendor.id}
              className="flex flex-col justify-between rounded-3xl border border-stone-200 bg-white p-5 shadow-xs hover:shadow-md transition"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <span className="rounded-md bg-stone-100 px-2 py-0.5 text-[10px] font-bold text-stone-600">
                      {vendor.category}
                    </span>
                    <h3 className="mt-2 text-base font-bold text-stone-900">{vendor.name}</h3>
                    <p className="text-xs text-stone-500">{vendor.contactPerson}</p>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(vendor)}
                      className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-700"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(vendor)}
                      className="rounded-lg p-1.5 text-stone-400 hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <div className="mt-4 space-y-2 text-xs text-stone-600 border-t border-stone-100 pt-3">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5 text-stone-400" />
                      <span>{vendor.phone || 'No phone'}</span>
                    </span>
                    {vendor.phone && (
                      <a href={`tel:${vendor.phone}`} className="text-[11px] font-semibold text-stone-800 hover:underline">
                        Call
                      </a>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5 text-stone-400" />
                      <span className="truncate max-w-[150px]">{vendor.email || 'No email'}</span>
                    </span>
                    {vendor.email && (
                      <a href={`mailto:${vendor.email}`} className="text-[11px] font-semibold text-stone-800 hover:underline">
                        Email
                      </a>
                    )}
                  </div>
                </div>

                {vendor.notes && (
                  <p className="mt-3 text-[11px] text-stone-500 bg-stone-50 rounded-xl p-2.5">
                    {vendor.notes}
                  </p>
                )}
              </div>

              {/* Financial Status Footer */}
              <div className="mt-4 border-t border-stone-100 pt-3">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-stone-500">Contract Value:</span>
                  <span className="font-bold text-stone-900">{formatCurrency(vendor.contractAmount, currency)}</span>
                </div>
                <div className="flex justify-between text-xs mb-2">
                  <span className="text-stone-500">Paid Amount:</span>
                  <span className="font-semibold text-emerald-600">{formatCurrency(vendor.paidAmount, currency)}</span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-dashed border-stone-200">
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      vendor.status === 'Completed'
                        ? 'bg-stone-100 text-stone-700'
                        : vendor.status === 'Hired'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {vendor.status}
                  </span>

                  <span className="text-xs font-bold text-stone-900">
                    {balanceDue === 0 ? (
                      <span className="text-emerald-600 font-semibold">Settled</span>
                    ) : (
                      <span>Due: {formatCurrency(balanceDue, currency)}</span>
                    )}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-3xl border border-stone-200 bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="text-base font-bold text-stone-900">
                {editingVendor ? 'Edit Vendor Partner' : 'Add New Vendor Partner'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="rounded-lg p-1 text-stone-400 hover:bg-stone-100">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700">Vendor / Company Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Royal Spoon Gourmet Caterers"
                  className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2 text-xs font-medium focus:border-stone-400 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700">Service Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ExpenseCategoryName)}
                    className="mt-1 w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs font-medium focus:border-stone-400 focus:outline-none"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700">Contact Person</label>
                  <input
                    type="text"
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    placeholder="e.g. Chef Manjeet Singh"
                    className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2 text-xs font-medium focus:border-stone-400 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700">Phone</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98200 12345"
                    className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2 text-xs font-medium focus:border-stone-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="vendor@company.com"
                    className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2 text-xs font-medium focus:border-stone-400 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700">Contract Amount ({currency})</label>
                  <input
                    type="number"
                    min="0"
                    step="5000"
                    value={contractAmount}
                    onChange={(e) => setContractAmount(Number(e.target.value))}
                    className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2 text-xs font-medium focus:border-stone-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700">Paid Advance ({currency})</label>
                  <input
                    type="number"
                    min="0"
                    step="5000"
                    value={paidAmount}
                    onChange={(e) => setPaidAmount(Number(e.target.value))}
                    className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2 text-xs font-medium focus:border-stone-400 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as Vendor['status'])}
                    className="mt-1 w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs font-medium focus:border-stone-400 focus:outline-none"
                  >
                    <option value="Hired">Hired (Active)</option>
                    <option value="Shortlisted">Shortlisted</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700">Rating (1 to 5 Stars)</label>
                  <select
                    value={rating}
                    onChange={(e) => setRating(Number(e.target.value))}
                    className="mt-1 w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs font-medium focus:border-stone-400 focus:outline-none"
                  >
                    <option value={5}>⭐⭐⭐⭐⭐ 5 Stars</option>
                    <option value={4}>⭐⭐⭐⭐ 4 Stars</option>
                    <option value={3}>⭐⭐⭐ 3 Stars</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700">Scope of Deliverables & Notes</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. 6 live counters, tasting session on Nov 10"
                  className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2 text-xs font-medium focus:border-stone-400 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-stone-100">
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
                  {editingVendor ? 'Save Vendor' : 'Add Vendor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
