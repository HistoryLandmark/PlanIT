import React, { useState } from 'react';
import {
  PieChart as PieIcon,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Plus,
  Users,
  Edit2,
  Trash2,
  CheckCircle2,
  X,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { useEvent } from '../../context/EventContext.tsx';
import { useAuth } from '../../context/AuthContext.tsx';
import { dbService } from '../../services/db.ts';
import { ExpenseCategoryName, Contribution } from '../../types/database.ts';
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

const COLORS = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
  '#EC4899', '#06B6D4', '#84CC16', '#6366F1', '#14B8A6',
  '#F97316', '#64748B'
];

interface BudgetManagementViewProps {
  onOpenCreateEvent?: () => void;
}

export const BudgetManagementView: React.FC<BudgetManagementViewProps> = ({ onOpenCreateEvent }) => {
  const { activeEvent, refreshData } = useEvent();
  const { currency } = useAuth();

  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [newTotalBudget, setNewTotalBudget] = useState<number>(activeEvent?.estimatedBudget || 1000000);

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [selectedCat, setSelectedCat] = useState<ExpenseCategoryName>('Venue');
  const [catAllocation, setCatAllocation] = useState<number>(100000);

  const [isContribModalOpen, setIsContribModalOpen] = useState(false);
  const [editingContrib, setEditingContrib] = useState<Contribution | null>(null);
  const [contribName, setContribName] = useState('');
  const [contribAllocated, setContribAllocated] = useState<number>(200000);
  const [contribNotes, setContribNotes] = useState('');

  const budgetObj = activeEvent ? dbService.getEventBudget(activeEvent.id) : null;
  const budgetCategories = activeEvent ? dbService.getBudgetCategories(activeEvent.id) : [];
  const expenses = activeEvent ? dbService.getExpenses(activeEvent.id) : [];
  const contributions = activeEvent ? dbService.getContributions(activeEvent.id) : [];

  if (!activeEvent) {
    return (
      <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-stone-200 bg-white p-12 text-center">
        <PieIcon className="h-10 w-10 text-stone-300" />
        <h3 className="mt-3 text-sm font-bold text-stone-900">No Event Selected</h3>
        <p className="mt-1 text-xs text-stone-500 max-w-sm">
          Please select or create an event to set overall budgets, category allocations, and track reimbursements.
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

  const totalBudget = budgetObj?.totalBudget || activeEvent?.estimatedBudget || 0;
  const totalActual = expenses.reduce((s, e) => s + e.amount, 0);
  const remainingBudget = totalBudget - totalActual;
  const isOverBudget = remainingBudget < 0;

  // Category comparisons
  const categoryComparisons = CATEGORIES.map((cat) => {
    const allocated = budgetCategories.find((b) => b.categoryName === cat)?.allocatedAmount || 0;
    const actual = expenses.filter((e) => e.category === cat).reduce((s, e) => s + e.amount, 0);
    const variance = allocated - actual;
    return {
      category: cat,
      allocated,
      actual,
      variance,
      isOver: variance < 0 && allocated > 0,
    };
  }).filter((c) => c.allocated > 0 || c.actual > 0);

  // Chart data: Budget vs Actual for Top Categories
  const barChartData = categoryComparisons.slice(0, 6).map((c) => ({
    name: c.category.split(' ')[0],
    Allocated: c.allocated,
    Actual: c.actual,
  }));

  // Chart data: Actual Spending Pie Chart
  const pieChartData = categoryComparisons
    .filter((c) => c.actual > 0)
    .map((c) => ({
      name: c.category,
      value: c.actual,
    }));

  // Person-wise comparison data
  const personComparisons = contributions.map((c) => {
    const actualPaid = c.amountPaid;
    const netBalance = c.allocatedAmount - actualPaid;
    return {
      name: c.contributorName.split(' ')[0],
      fullName: c.contributorName,
      pledged: c.allocatedAmount,
      paid: actualPaid,
      reimbursement: c.reimbursementPending,
      netBalance,
    };
  });

  const handleSaveTotalBudget = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeEvent) return;
    dbService.setEventBudget(activeEvent.id, Number(newTotalBudget));
    setIsBudgetModalOpen(false);
    refreshData();
  };

  const handleSaveCategoryBudget = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeEvent) return;
    dbService.setBudgetCategory(activeEvent.id, selectedCat, Number(catAllocation));
    setIsCategoryModalOpen(false);
    refreshData();
  };

  const openAddContribution = () => {
    setEditingContrib(null);
    setContribName('');
    setContribAllocated(200000);
    setContribNotes('');
    setIsContribModalOpen(true);
  };

  const openEditContribution = (c: Contribution) => {
    setEditingContrib(c);
    setContribName(c.contributorName);
    setContribAllocated(c.allocatedAmount);
    setContribNotes(c.notes || '');
    setIsContribModalOpen(true);
  };

  const handleSaveContribution = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeEvent || !contribName.trim()) return;

    dbService.saveContribution({
      id: editingContrib?.id,
      eventId: activeEvent.id,
      contributorName: contribName.trim(),
      allocatedAmount: Number(contribAllocated),
      amountPaid: editingContrib?.amountPaid || 0,
      reimbursementPending: editingContrib?.reimbursementPending || 0,
      notes: contribNotes.trim(),
    });

    setIsContribModalOpen(false);
    refreshData();
  };

  const handleDeleteContribution = (c: Contribution) => {
    if (window.confirm(`Delete contributor record for "${c.contributorName}"?`)) {
      dbService.deleteContribution(c.id);
      refreshData();
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight text-stone-900 sm:text-2xl">
            Budget & Financial Analytics
          </h1>
          <p className="mt-1 text-xs text-stone-500">
            Category allocations, expense tracking, contributor reimbursements, and cashflow charts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setNewTotalBudget(totalBudget);
              setIsBudgetModalOpen(true);
            }}
            className="flex items-center gap-1.5 rounded-xl border border-stone-200 bg-white px-3.5 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-50"
          >
            <Edit2 className="h-4 w-4 text-stone-500" />
            <span>Set Overall Budget</span>
          </button>
          <button
            onClick={() => setIsCategoryModalOpen(true)}
            className="flex items-center gap-1.5 rounded-xl bg-stone-900 px-4 py-2 text-xs font-semibold text-white shadow-md hover:bg-stone-800"
          >
            <Plus className="h-4 w-4" />
            <span>Allocate Category</span>
          </button>
        </div>
      </div>

      {/* Overspending Alert if applicable */}
      {isOverBudget && (
        <div className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-800">
          <ShieldAlert className="h-5 w-5 shrink-0 text-red-600" />
          <div className="text-xs">
            <span className="font-bold">Overspending Alert: </span>
            Actual expenses exceed the estimated budget by{' '}
            <strong className="underline">{formatCurrency(Math.abs(remainingBudget), currency)}</strong>. Please review category allocations or adjust the total budget.
          </div>
        </div>
      )}

      {/* Aggregate Cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-xs">
          <span className="text-[11px] font-semibold text-stone-500">Total Event Budget</span>
          <p className="mt-1 text-xl font-bold text-stone-900">{formatCurrency(totalBudget, currency)}</p>
          <span className="text-[10px] text-stone-400">Target expenditure ceiling</span>
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-xs">
          <span className="text-[11px] font-semibold text-stone-500">Total Actual Spent</span>
          <p className="mt-1 text-xl font-bold text-stone-900">{formatCurrency(totalActual, currency)}</p>
          <span className="text-[10px] text-stone-400">
            {totalBudget > 0 ? `${Math.round((totalActual / totalBudget) * 100)}% of budget utilized` : '0%'}
          </span>
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-xs">
          <span className="text-[11px] font-semibold text-stone-500">Remaining Available Budget</span>
          <p className={`mt-1 text-xl font-bold ${isOverBudget ? 'text-red-600' : 'text-emerald-600'}`}>
            {formatCurrency(remainingBudget, currency)}
          </p>
          <span className="text-[10px] text-stone-400">
            {isOverBudget ? 'Exceeded by deficit' : 'Unallocated funds'}
          </span>
        </div>
      </div>

      {/* Visual Analytics Charts Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Bar Chart: Budget vs Actual */}
        <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-xs lg:col-span-7">
          <div className="flex items-center justify-between pb-4">
            <div>
              <h3 className="text-sm font-bold text-stone-900">Budget vs. Actual Expenditure</h3>
              <p className="text-xs text-stone-500">Comparison across primary celebration categories</p>
            </div>
            <span className="rounded-md bg-stone-100 px-2 py-0.5 text-[10px] font-bold text-stone-600">
              Top Categories
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barChartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 10 }} tickFormatter={(val) => `${currency}${val / 1000}k`} />
                <Tooltip
                  formatter={(value: any) => [formatCurrency(Number(value) || 0, currency), '']}
                  contentStyle={{ borderRadius: '12px', fontSize: '11px', border: '1px solid #E5E7EB' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="Allocated" fill="#D1D5DB" radius={[6, 6, 0, 0]} />
                <Bar dataKey="Actual" fill="#1C1917" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Donut Chart: Actual Spending Breakdown */}
        <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-xs lg:col-span-5 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-stone-900">Category Spending Distribution</h3>
            <p className="text-xs text-stone-500">Actual expenses distribution</p>
          </div>

          <div className="h-60 w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieChartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any) => [formatCurrency(Number(value) || 0, currency), '']}
                  contentStyle={{ borderRadius: '12px', fontSize: '11px', border: '1px solid #E5E7EB' }}
                />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex flex-wrap gap-2 text-[10px] text-stone-600 justify-center pt-2">
            {pieChartData.slice(0, 5).map((entry, idx) => (
              <span key={entry.name} className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                <span>{entry.name}</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Category-wise Allocations & Tracking Table */}
      <div className="rounded-3xl border border-stone-200 bg-white shadow-xs overflow-hidden">
        <div className="flex items-center justify-between border-b border-stone-200 bg-stone-50/80 px-6 py-4">
          <div>
            <h3 className="text-sm font-bold text-stone-900">Category Budget Allocations</h3>
            <p className="text-xs text-stone-500">Compare allocated limits against current incurred costs</p>
          </div>
          <button
            onClick={() => setIsCategoryModalOpen(true)}
            className="flex items-center gap-1 text-xs font-semibold text-stone-800 hover:text-stone-950"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add / Edit Category</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-stone-200 bg-stone-50 font-bold uppercase text-stone-500 text-[10px] tracking-wider">
              <tr>
                <th className="px-6 py-3">Category</th>
                <th className="px-6 py-3">Allocated Limit</th>
                <th className="px-6 py-3">Actual Incurred</th>
                <th className="px-6 py-3">Remaining Balance</th>
                <th className="px-6 py-3">Budget Utilization</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {categoryComparisons.map((row) => {
                const percent = row.allocated > 0 ? Math.min(100, Math.round((row.actual / row.allocated) * 100)) : 100;

                return (
                  <tr key={row.category} className="hover:bg-stone-50/70 transition">
                    <td className="px-6 py-3.5 font-bold text-stone-900">{row.category}</td>
                    <td className="px-6 py-3.5 font-medium text-stone-700">
                      {formatCurrency(row.allocated, currency)}
                    </td>
                    <td className="px-6 py-3.5 font-bold text-stone-900">
                      {formatCurrency(row.actual, currency)}
                    </td>
                    <td className="px-6 py-3.5">
                      <span className={`font-semibold ${row.isOver ? 'text-red-600' : 'text-emerald-700'}`}>
                        {formatCurrency(row.variance, currency)}
                        {row.isOver && ' (Overspent)'}
                      </span>
                    </td>
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-24 overflow-hidden rounded-full bg-stone-100">
                          <div
                            className={`h-full ${row.isOver ? 'bg-red-500' : 'bg-stone-800'}`}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-stone-500">{percent}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Person-wise Budget & Reimbursements Module */}
      <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-xs space-y-4">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center border-b border-stone-100 pb-4">
          <div>
            <h3 className="text-sm font-bold text-stone-900">Person-wise Contributions & Reimbursements</h3>
            <p className="text-xs text-stone-500">
              Track pledges, direct expenses paid by family members/partners, and pending settlements.
            </p>
          </div>
          <button
            onClick={openAddContribution}
            className="flex items-center gap-1.5 rounded-xl bg-stone-900 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-stone-800"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Contributor</span>
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {contributions.map((c) => {
            const netBalance = c.allocatedAmount - c.amountPaid;

            return (
              <div key={c.id} className="rounded-2xl border border-stone-200 bg-stone-50/50 p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-stone-900">{c.contributorName}</h4>
                    {c.notes && <p className="text-[10px] text-stone-500 mt-0.5">{c.notes}</p>}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditContribution(c)}
                      className="rounded-lg p-1 text-stone-400 hover:text-stone-700"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteContribution(c)}
                      className="rounded-lg p-1 text-stone-400 hover:text-red-600"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs border-t border-stone-200/60 pt-2">
                  <div className="flex justify-between">
                    <span className="text-stone-500">Pledged / Allocated:</span>
                    <span className="font-semibold text-stone-800">{formatCurrency(c.allocatedAmount, currency)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">Directly Paid Expenses:</span>
                    <span className="font-bold text-stone-900">{formatCurrency(c.amountPaid, currency)}</span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-stone-200/60">
                    <span className="text-stone-600 font-medium">Pending Reimbursement:</span>
                    <span className={`font-bold ${c.reimbursementPending > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                      {c.reimbursementPending > 0
                        ? formatCurrency(c.reimbursementPending, currency)
                        : 'Settled'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Set Overall Budget Modal */}
      {isBudgetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-3xl border border-stone-200 bg-white p-6 shadow-2xl">
            <h3 className="text-sm font-bold text-stone-900">Update Total Event Budget</h3>
            <form onSubmit={handleSaveTotalBudget} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700">Estimated Budget ({currency})</label>
                <input
                  type="number"
                  min="0"
                  step="10000"
                  required
                  value={newTotalBudget}
                  onChange={(e) => setNewTotalBudget(Number(e.target.value))}
                  className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2 text-xs font-medium focus:border-stone-400 focus:outline-none"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsBudgetModalOpen(false)}
                  className="rounded-xl border border-stone-200 px-4 py-2 text-xs font-medium text-stone-600 hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-stone-900 px-5 py-2 text-xs font-semibold text-white hover:bg-stone-800"
                >
                  Save Budget
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Set Category Allocation Modal */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-3xl border border-stone-200 bg-white p-6 shadow-2xl">
            <h3 className="text-sm font-bold text-stone-900">Allocate Category Budget</h3>
            <form onSubmit={handleSaveCategoryBudget} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700">Category</label>
                <select
                  value={selectedCat}
                  onChange={(e) => setSelectedCat(e.target.value as ExpenseCategoryName)}
                  className="mt-1 w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs font-medium focus:border-stone-400 focus:outline-none"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-700">Allocated Amount ({currency})</label>
                <input
                  type="number"
                  min="0"
                  step="5000"
                  required
                  value={catAllocation}
                  onChange={(e) => setCatAllocation(Number(e.target.value))}
                  className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2 text-xs font-medium focus:border-stone-400 focus:outline-none"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="rounded-xl border border-stone-200 px-4 py-2 text-xs font-medium text-stone-600 hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-stone-900 px-5 py-2 text-xs font-semibold text-white hover:bg-stone-800"
                >
                  Save Allocation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add / Edit Contributor Modal */}
      {isContribModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-3xl border border-stone-200 bg-white p-6 shadow-2xl">
            <h3 className="text-sm font-bold text-stone-900">
              {editingContrib ? 'Edit Contributor' : 'Add Financial Contributor'}
            </h3>
            <form onSubmit={handleSaveContribution} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700">Contributor Name *</label>
                <input
                  type="text"
                  required
                  value={contribName}
                  onChange={(e) => setContribName(e.target.value)}
                  placeholder="e.g. Ramesh Sharma, Priya Patel"
                  className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2 text-xs font-medium focus:border-stone-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-700">Allocated / Pledged Amount ({currency})</label>
                <input
                  type="number"
                  min="0"
                  step="10000"
                  required
                  value={contribAllocated}
                  onChange={(e) => setContribAllocated(Number(e.target.value))}
                  className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2 text-xs font-medium focus:border-stone-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-700">Notes / Scope of Expenses</label>
                <input
                  type="text"
                  value={contribNotes}
                  onChange={(e) => setContribNotes(e.target.value)}
                  placeholder="e.g. Handles catering and venue deposit"
                  className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2 text-xs font-medium focus:border-stone-400 focus:outline-none"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsContribModalOpen(false)}
                  className="rounded-xl border border-stone-200 px-4 py-2 text-xs font-medium text-stone-600 hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-stone-900 px-5 py-2 text-xs font-semibold text-white hover:bg-stone-800"
                >
                  {editingContrib ? 'Save' : 'Add Contributor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
