import React, { useState } from 'react';
import {
  Receipt,
  Plus,
  Search,
  Filter,
  DollarSign,
  Calendar,
  CreditCard,
  User,
  Store,
  Edit2,
  Trash2,
  Paperclip,
  CheckCircle2,
  Clock,
  AlertCircle,
  X,
  ExternalLink,
  PieChart as PieIcon
} from 'lucide-react';
import { useEvent } from '../../context/EventContext.tsx';
import { useAuth } from '../../context/AuthContext.tsx';
import {
  Expense,
  ExpenseCategoryName,
  PaymentMethod,
  PaymentStatus
} from '../../types/database.ts';
import { dbService } from '../../services/db.ts';
import { formatCurrency, formatDate } from '../../utils/formatters.ts';

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

const PAYMENT_METHODS: PaymentMethod[] = [
  'UPI',
  'Bank Transfer',
  'Credit Card',
  'Debit Card',
  'Cash',
  'Cheque',
];

interface ExpenseManagementViewProps {
  onOpenCreateEvent?: () => void;
}

export const ExpenseManagementView: React.FC<ExpenseManagementViewProps> = ({ onOpenCreateEvent }) => {
  const { activeEvent, refreshData } = useEvent();
  const { currency, currentUser } = useAuth();

  const [activeTab, setActiveTab] = useState<'all' | 'categories' | 'vendors' | 'persons'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  const expenses = activeEvent ? dbService.getExpenses(activeEvent.id) : [];
  const vendors = activeEvent ? dbService.getVendors(activeEvent.id) : [];
  const contributions = activeEvent ? dbService.getContributions(activeEvent.id) : [];
  const users = dbService.getUsers();

  if (!activeEvent) {
    return (
      <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-stone-200 bg-white p-12 text-center">
        <Receipt className="h-10 w-10 text-stone-300" />
        <h3 className="mt-3 text-sm font-bold text-stone-900">No Event Selected</h3>
        <p className="mt-1 text-xs text-stone-500 max-w-sm">
          Please select or create an event to log vendor expenses, payment receipts, and cashflow.
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

  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ExpenseCategoryName>('Venue');
  const [vendorName, setVendorName] = useState('');
  const [amount, setAmount] = useState<number>(10000);
  const [paymentDate, setPaymentDate] = useState('2026-11-03');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('Paid');
  const [paidBy, setPaidBy] = useState(currentUser?.name || 'Rohan Sharma');
  const [receiptUrl, setReceiptUrl] = useState('');
  const [remarks, setRemarks] = useState('');

  const openAddModal = () => {
    setEditingExpense(null);
    setTitle('');
    setCategory('Venue');
    setVendorName('');
    setAmount(10000);
    setPaymentDate(new Date().toISOString().split('T')[0]);
    setPaymentMethod('UPI');
    setPaymentStatus('Paid');
    setPaidBy(currentUser?.name || 'Rohan Sharma');
    setReceiptUrl('');
    setRemarks('');
    setIsModalOpen(true);
  };

  const openEditModal = (exp: Expense) => {
    setEditingExpense(exp);
    setTitle(exp.title);
    setCategory(exp.category);
    setVendorName(exp.vendorName);
    setAmount(exp.amount);
    setPaymentDate(exp.paymentDate);
    setPaymentMethod(exp.paymentMethod);
    setPaymentStatus(exp.paymentStatus);
    setPaidBy(exp.paidBy);
    setReceiptUrl(exp.receiptUrl || '');
    setRemarks(exp.remarks || '');
    setIsModalOpen(true);
  };

  const handleSaveExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeEvent || !title.trim() || amount <= 0) return;

    // Match vendorId if exists
    const matchingVendor = vendors.find((v) => v.name.toLowerCase() === vendorName.toLowerCase());

    dbService.saveExpense({
      id: editingExpense?.id,
      eventId: activeEvent.id,
      title: title.trim(),
      category,
      vendorName: vendorName.trim() || 'Direct Vendor',
      vendorId: matchingVendor?.id,
      amount: Number(amount),
      paymentDate,
      paymentMethod,
      paymentStatus,
      paidBy: paidBy.trim(),
      receiptUrl: receiptUrl.trim() || undefined,
      remarks: remarks.trim() || undefined,
    });

    setIsModalOpen(false);
    refreshData();
  };

  const handleDeleteExpense = (exp: Expense) => {
    if (window.confirm(`Delete expense "${exp.title}" (${formatCurrency(exp.amount, currency)})?`)) {
      dbService.deleteExpense(exp.id);
      refreshData();
    }
  };

  // Metrics
  const totalExpenseSum = expenses.reduce((s, e) => s + e.amount, 0);
  const paidSum = expenses.filter((e) => e.paymentStatus === 'Paid').reduce((s, e) => s + e.amount, 0);
  const pendingSum = expenses.filter((e) => e.paymentStatus === 'Pending' || e.paymentStatus === 'Partial').reduce((s, e) => s + e.amount, 0);

  // Filtered List
  const filteredExpenses = expenses.filter((exp) => {
    const matchesSearch =
      exp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exp.vendorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exp.paidBy.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || exp.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || exp.paymentStatus === filterStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Grouped breakdowns
  const categoryBreakdown = CATEGORIES.map((cat) => {
    const matching = expenses.filter((e) => e.category === cat);
    const sum = matching.reduce((s, e) => s + e.amount, 0);
    return { category: cat, total: sum, count: matching.length };
  }).filter((c) => c.total > 0).sort((a, b) => b.total - a.total);

  const vendorBreakdown = Array.from(new Set(expenses.map((e) => e.vendorName))).map((vName) => {
    const matching = expenses.filter((e) => e.vendorName === vName);
    const sum = matching.reduce((s, e) => s + e.amount, 0);
    const pending = matching.filter((e) => e.paymentStatus === 'Pending').reduce((s, e) => s + e.amount, 0);
    return { vendor: vName, total: sum, pending, count: matching.length };
  }).sort((a, b) => b.total - a.total);

  const personBreakdown = Array.from(new Set(expenses.map((e) => e.paidBy))).map((pName) => {
    const matching = expenses.filter((e) => e.paidBy === pName);
    const sum = matching.reduce((s, e) => s + e.amount, 0);
    return { person: pName, total: sum, count: matching.length };
  }).sort((a, b) => b.total - a.total);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight text-stone-900 sm:text-2xl">
            Expense Management
          </h1>
          <p className="mt-1 text-xs text-stone-500">
            Log vendor invoices, track cashflow payments, and audit person-wise contributions.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center gap-1.5 rounded-xl bg-stone-900 px-4 py-2 text-xs font-semibold text-white shadow-md hover:bg-stone-800"
        >
          <Plus className="h-4 w-4" />
          <span>Add Expense</span>
        </button>
      </div>

      {/* Aggregate Metric Cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-xs">
          <span className="text-[11px] font-semibold text-stone-500">Total Incurred Expenses</span>
          <p className="mt-1 text-xl font-bold text-stone-900">{formatCurrency(totalExpenseSum, currency)}</p>
          <span className="text-[10px] text-stone-400">{expenses.length} invoices & payments</span>
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-xs">
          <span className="text-[11px] font-semibold text-stone-500">Paid Amount</span>
          <p className="mt-1 text-xl font-bold text-emerald-600">{formatCurrency(paidSum, currency)}</p>
          <span className="text-[10px] text-stone-400">Completed transactions</span>
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-xs">
          <span className="text-[11px] font-semibold text-stone-500">Pending Clearances</span>
          <p className="mt-1 text-xl font-bold text-amber-600">{formatCurrency(pendingSum, currency)}</p>
          <span className="text-[10px] text-stone-400">Due vendor balances</span>
        </div>
      </div>

      {/* Breakdown Tabs: All, Categories, Vendors, Persons */}
      <div className="flex border-b border-stone-200 gap-6 text-xs font-bold">
        <button
          onClick={() => setActiveTab('all')}
          className={`pb-3 transition ${
            activeTab === 'all'
              ? 'border-b-2 border-stone-900 text-stone-900'
              : 'text-stone-400 hover:text-stone-700'
          }`}
        >
          All Expenses ({expenses.length})
        </button>
        <button
          onClick={() => setActiveTab('categories')}
          className={`pb-3 transition ${
            activeTab === 'categories'
              ? 'border-b-2 border-stone-900 text-stone-900'
              : 'text-stone-400 hover:text-stone-700'
          }`}
        >
          Category-wise ({categoryBreakdown.length})
        </button>
        <button
          onClick={() => setActiveTab('vendors')}
          className={`pb-3 transition ${
            activeTab === 'vendors'
              ? 'border-b-2 border-stone-900 text-stone-900'
              : 'text-stone-400 hover:text-stone-700'
          }`}
        >
          Vendor-wise ({vendorBreakdown.length})
        </button>
        <button
          onClick={() => setActiveTab('persons')}
          className={`pb-3 transition ${
            activeTab === 'persons'
              ? 'border-b-2 border-stone-900 text-stone-900'
              : 'text-stone-400 hover:text-stone-700'
          }`}
        >
          Person-wise ({personBreakdown.length})
        </button>
      </div>

      {/* Main Tab Content */}
      {activeTab === 'all' && (
        <div className="space-y-4">
          {/* Search & Filters */}
          <div className="flex flex-col gap-3 rounded-2xl border border-stone-200 bg-white p-3 shadow-xs sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-stone-400" />
              <input
                type="text"
                placeholder="Search by expense title, vendor name, or payer..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-stone-200 pl-9 pr-4 py-2 text-xs font-medium focus:border-stone-400 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs font-medium text-stone-700 focus:outline-none"
              >
                <option value="all">All Categories</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs font-medium text-stone-700 focus:outline-none"
              >
                <option value="all">All Statuses</option>
                <option value="Paid">Paid</option>
                <option value="Pending">Pending</option>
                <option value="Partial">Partial</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-stone-200 bg-stone-50/80 font-bold uppercase text-stone-500 text-[10px] tracking-wider">
                  <tr>
                    <th className="px-4 py-3">Expense Details</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Vendor</th>
                    <th className="px-4 py-3">Amount</th>
                    <th className="px-4 py-3">Paid By</th>
                    <th className="px-4 py-3">Date & Method</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filteredExpenses.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-xs text-stone-400">
                        No expenses match your search.
                      </td>
                    </tr>
                  ) : (
                    filteredExpenses.map((exp) => (
                      <tr key={exp.id} className="hover:bg-stone-50/70 transition">
                        <td className="px-4 py-3">
                          <div className="font-bold text-stone-900">{exp.title}</div>
                          {exp.remarks && (
                            <div className="text-[11px] text-stone-500 italic truncate max-w-xs">{exp.remarks}</div>
                          )}
                          {exp.receiptUrl && (
                            <a
                              href={exp.receiptUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="mt-1 inline-flex items-center gap-1 text-[10px] text-blue-600 hover:underline"
                            >
                              <Paperclip className="h-3 w-3" />
                              View Receipt
                            </a>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span className="rounded-lg bg-stone-100 px-2 py-0.5 text-[11px] font-semibold text-stone-700">
                            {exp.category}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-medium text-stone-800">{exp.vendorName}</td>
                        <td className="px-4 py-3 font-mono text-sm font-bold text-stone-900">
                          {formatCurrency(exp.amount, currency)}
                        </td>
                        <td className="px-4 py-3 font-medium text-stone-700">{exp.paidBy}</td>
                        <td className="px-4 py-3">
                          <div className="text-stone-800">{formatDate(exp.paymentDate)}</div>
                          <div className="text-[10px] text-stone-400 font-medium">{exp.paymentMethod}</div>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                              exp.paymentStatus === 'Paid'
                                ? 'bg-emerald-100 text-emerald-800'
                                : exp.paymentStatus === 'Pending'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {exp.paymentStatus === 'Paid' && <CheckCircle2 className="h-3 w-3" />}
                            {exp.paymentStatus === 'Pending' && <Clock className="h-3 w-3" />}
                            {exp.paymentStatus}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => openEditModal(exp)}
                              className="rounded-lg border border-stone-200 bg-white p-1.5 text-stone-600 hover:bg-stone-50"
                              title="Edit Expense"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteExpense(exp)}
                              className="rounded-lg border border-stone-200 bg-white p-1.5 text-red-600 hover:bg-red-50"
                              title="Delete Expense"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Category Breakdown Tab */}
      {activeTab === 'categories' && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categoryBreakdown.map((item) => (
            <div key={item.category} className="rounded-3xl border border-stone-200 bg-white p-5 shadow-xs">
              <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">{item.category}</span>
              <p className="mt-2 text-xl font-black text-stone-900">{formatCurrency(item.total, currency)}</p>
              <div className="mt-2 flex items-center justify-between text-xs text-stone-500 border-t border-stone-100 pt-2">
                <span>{item.count} recorded payments</span>
                <span>{Math.round((item.total / totalExpenseSum) * 100)}% of total</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Vendor Breakdown Tab */}
      {activeTab === 'vendors' && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {vendorBreakdown.map((item) => (
            <div key={item.vendor} className="rounded-3xl border border-stone-200 bg-white p-5 shadow-xs">
              <div className="flex items-center gap-2">
                <Store className="h-4 w-4 text-stone-400" />
                <span className="text-xs font-bold text-stone-900">{item.vendor}</span>
              </div>
              <p className="mt-2 text-xl font-black text-stone-900">{formatCurrency(item.total, currency)}</p>
              <div className="mt-2 flex items-center justify-between text-xs border-t border-stone-100 pt-2">
                <span className="text-stone-500">{item.count} invoices</span>
                {item.pending > 0 ? (
                  <span className="font-semibold text-amber-600">
                    Pending: {formatCurrency(item.pending, currency)}
                  </span>
                ) : (
                  <span className="font-semibold text-emerald-600">Fully Settled</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Person Breakdown Tab */}
      {activeTab === 'persons' && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {personBreakdown.map((item) => (
            <div key={item.person} className="rounded-3xl border border-stone-200 bg-white p-5 shadow-xs">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-stone-400" />
                <span className="text-xs font-bold text-stone-900">{item.person}</span>
              </div>
              <p className="mt-2 text-xl font-black text-stone-900">{formatCurrency(item.total, currency)}</p>
              <div className="mt-2 flex items-center justify-between text-xs text-stone-500 border-t border-stone-100 pt-2">
                <span>{item.count} transactions</span>
                <span>{Math.round((item.total / totalExpenseSum) * 100)}% of expenses</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Expense Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-3xl border border-stone-200 bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="text-base font-bold text-stone-900">
                {editingExpense ? 'Edit Expense Record' : 'Record New Expense'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="rounded-lg p-1 text-stone-400 hover:bg-stone-100">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveExpense} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700">Expense Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Venue 50% Advance Booking"
                  className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2 text-xs font-medium focus:border-stone-400 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700">Category *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ExpenseCategoryName)}
                    className="mt-1 w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs font-medium focus:border-stone-400 focus:outline-none"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700">Vendor / Payee</label>
                  <input
                    type="text"
                    value={vendorName}
                    onChange={(e) => setVendorName(e.target.value)}
                    placeholder="e.g. Grand Palace Hotel"
                    className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2 text-xs font-medium focus:border-stone-400 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700">Amount ({currency}) *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2 text-xs font-medium focus:border-stone-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700">Payment Date</label>
                  <input
                    type="date"
                    required
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2 text-xs font-medium focus:border-stone-400 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700">Method</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                    className="mt-1 w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs font-medium focus:border-stone-400 focus:outline-none"
                  >
                    {PAYMENT_METHODS.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700">Status</label>
                  <select
                    value={paymentStatus}
                    onChange={(e) => setPaymentStatus(e.target.value as PaymentStatus)}
                    className="mt-1 w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs font-medium focus:border-stone-400 focus:outline-none"
                  >
                    <option value="Paid">Paid</option>
                    <option value="Pending">Pending</option>
                    <option value="Partial">Partial</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700">Paid By</label>
                  <input
                    type="text"
                    value={paidBy}
                    onChange={(e) => setPaidBy(e.target.value)}
                    placeholder="Payer Name"
                    className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2 text-xs font-medium focus:border-stone-400 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700">Receipt / Invoice Link (URL)</label>
                <input
                  type="url"
                  value={receiptUrl}
                  onChange={(e) => setReceiptUrl(e.target.value)}
                  placeholder="https://..."
                  className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2 text-xs font-medium focus:border-stone-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700">Remarks / UTR Number</label>
                <input
                  type="text"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="e.g. UTR #98421049, balance due before Sangeet"
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
                  {editingExpense ? 'Save Changes' : 'Record Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
