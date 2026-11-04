import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Download,
  Printer,
  FileText,
  Users,
  PieChart,
  Receipt,
  Store,
  UserCheck,
  CheckCircle2
} from 'lucide-react';
import { useEvent } from '../../context/EventContext.tsx';
import { useAuth } from '../../context/AuthContext.tsx';
import { dbService } from '../../services/db.ts';
import { exportToCSV, formatCurrency, formatDate } from '../../utils/formatters.ts';

import { Plus } from 'lucide-react';

interface ReportsViewProps {
  onOpenCreateEvent?: () => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({ onOpenCreateEvent }) => {
  const { activeEvent } = useEvent();
  const { currency } = useAuth();

  const [activeReportTab, setActiveReportTab] = useState<'hub' | 'printable'>('hub');

  if (!activeEvent) {
    return (
      <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-stone-200 bg-white p-12 text-center">
        <FileSpreadsheet className="h-10 w-10 text-stone-300" />
        <h3 className="mt-3 text-sm font-bold text-stone-900">No Event Selected</h3>
        <p className="mt-1 text-xs text-stone-500 max-w-sm">
          Please select or create an event to generate CSV spreadsheets and executive print summaries.
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

  const guests = dbService.getGuests(activeEvent.id);
  const expenses = dbService.getExpenses(activeEvent.id);
  const budgetObj = dbService.getEventBudget(activeEvent.id);
  const budgetCategories = dbService.getBudgetCategories(activeEvent.id);
  const vendors = dbService.getVendors(activeEvent.id);
  const contributions = dbService.getContributions(activeEvent.id);
  const summary = dbService.getEventSummary(activeEvent.id);

  // 1. Export Complete Guest List
  const exportGuestList = () => {
    const headers = ['#', 'Name', 'Mobile', 'Email', 'Headcount', 'Category', 'Invitation', 'RSVP', 'Remarks'];
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
      ];
    });
    exportToCSV(`PlanIT_${activeEvent.name}_Guest_List`, headers, rows);
  };

  // 2. Export RSVP Report
  const exportRSVPReport = () => {
    const headers = ['Guest Name', 'Contact', 'RSVP Status', 'Confirmed Headcount', 'Dietary Restrictions', 'Remarks'];
    const rows = guests.map((g) => [
      g.name,
      g.mobileNumber || g.emailAddress || '',
      g.rsvpStatus,
      g.rsvpStatus === 'Confirmed' ? g.headCount : 0,
      g.remarks || 'None',
      g.invitationStatus,
    ]);
    exportToCSV(`PlanIT_${activeEvent.name}_RSVP_Report`, headers, rows);
  };

  // 4. Export Budget vs Expense Report
  const exportBudgetExpenseReport = () => {
    const headers = ['Category', 'Allocated Budget', 'Actual Expenses', 'Variance', 'Status'];
    const rows = budgetCategories.map((bc) => {
      const actual = expenses.filter((e) => e.category === bc.categoryName).reduce((s, e) => s + e.amount, 0);
      const variance = bc.allocatedAmount - actual;
      return [
        bc.categoryName,
        bc.allocatedAmount,
        actual,
        variance,
        variance < 0 ? 'Overspent' : 'Within Budget',
      ];
    });
    exportToCSV(`PlanIT_${activeEvent.name}_Budget_Vs_Expenses`, headers, rows);
  };

  // 5. Export Vendor Expenditure
  const exportVendorReport = () => {
    const headers = ['Vendor Name', 'Category', 'Contact Person', 'Phone', 'Contract Amount', 'Paid Amount', 'Pending Balance', 'Status'];
    const rows = vendors.map((v) => [
      v.name,
      v.category,
      v.contactPerson,
      v.phone,
      v.contractAmount,
      v.paidAmount,
      Math.max(0, v.contractAmount - v.paidAmount),
      v.status,
    ]);
    exportToCSV(`PlanIT_${activeEvent.name}_Vendor_Payments`, headers, rows);
  };

  // 6. Export Person-wise Contributions & Reimbursements
  const exportPersonReport = () => {
    const headers = ['Contributor Name', 'Pledged Allocation', 'Direct Paid Expenses', 'Pending Reimbursement', 'Notes'];
    const rows = contributions.map((c) => [
      c.contributorName,
      c.allocatedAmount,
      c.amountPaid,
      c.reimbursementPending,
      c.notes || '',
    ]);
    exportToCSV(`PlanIT_${activeEvent.name}_Person_Contributions`, headers, rows);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight text-stone-900 sm:text-2xl">
            Reports & Downloadable Analytics
          </h1>
          <p className="mt-1 text-xs text-stone-500">
            Generate CSV, Excel-compatible sheets, and print-ready executive summaries for "{activeEvent.name}".
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveReportTab(activeReportTab === 'hub' ? 'printable' : 'hub')}
            className="flex items-center gap-1.5 rounded-xl border border-stone-200 bg-white px-3.5 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-50"
          >
            {activeReportTab === 'hub' ? (
              <>
                <Printer className="h-4 w-4 text-stone-500" />
                <span>Executive Print View</span>
              </>
            ) : (
              <>
                <FileSpreadsheet className="h-4 w-4 text-stone-500" />
                <span>Downloadable Reports Hub</span>
              </>
            )}
          </button>
          {activeReportTab === 'printable' && (
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 rounded-xl bg-stone-900 px-4 py-2 text-xs font-semibold text-white shadow-md hover:bg-stone-800"
            >
              <Printer className="h-4 w-4" />
              <span>Print / Save as PDF</span>
            </button>
          )}
        </div>
      </div>

      {activeReportTab === 'hub' ? (
        /* Report Download Cards Hub */
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {/* Guest List Report */}
          <div className="rounded-3xl border border-stone-200 bg-white p-5 shadow-xs hover:shadow-md transition space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-stone-100 text-stone-800">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-stone-900">Complete Guest List</h3>
                <p className="text-[11px] text-stone-500">{guests.length} invitees recorded</p>
              </div>
            </div>
            <p className="text-xs text-stone-600">
              Includes contact information, party headcounts, assigned table codes, and categories.
            </p>
            <button
              onClick={exportGuestList}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-stone-900 py-2.5 text-xs font-semibold text-white hover:bg-stone-800"
            >
              <Download className="h-3.5 w-3.5" />
              Download CSV
            </button>
          </div>

          {/* RSVP Report */}
          <div className="rounded-3xl border border-stone-200 bg-white p-5 shadow-xs hover:shadow-md transition space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                <UserCheck className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-stone-900">RSVP & Attendee Roster</h3>
                <p className="text-[11px] text-stone-500">{summary.confirmedAttendees} confirmed guests</p>
              </div>
            </div>
            <p className="text-xs text-stone-600">
              Breakdown of confirmed, declined, and pending responses with dietary preferences.
            </p>
            <button
              onClick={exportRSVPReport}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-stone-900 py-2.5 text-xs font-semibold text-white hover:bg-stone-800"
            >
              <Download className="h-3.5 w-3.5" />
              Download CSV
            </button>
          </div>


          {/* Budget & Expense Report */}
          <div className="rounded-3xl border border-stone-200 bg-white p-5 shadow-xs hover:shadow-md transition space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
                <PieChart className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-stone-900">Budget vs. Actual Variance</h3>
                <p className="text-[11px] text-stone-500">{formatCurrency(summary.totalActualExpenses, currency)} spent</p>
              </div>
            </div>
            <p className="text-xs text-stone-600">
              Category-by-category comparison of estimated budgets vs logged expenses.
            </p>
            <button
              onClick={exportBudgetExpenseReport}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-stone-900 py-2.5 text-xs font-semibold text-white hover:bg-stone-800"
            >
              <Download className="h-3.5 w-3.5" />
              Download CSV
            </button>
          </div>

          {/* Vendor Report */}
          <div className="rounded-3xl border border-stone-200 bg-white p-5 shadow-xs hover:shadow-md transition space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-700">
                <Store className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-stone-900">Vendor Payment Ledger</h3>
                <p className="text-[11px] text-stone-500">{vendors.length} service contracts</p>
              </div>
            </div>
            <p className="text-xs text-stone-600">
              Full statement of contractor amounts, payments settled, and outstanding dues.
            </p>
            <button
              onClick={exportVendorReport}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-stone-900 py-2.5 text-xs font-semibold text-white hover:bg-stone-800"
            >
              <Download className="h-3.5 w-3.5" />
              Download CSV
            </button>
          </div>

          {/* Person-wise Report */}
          <div className="rounded-3xl border border-stone-200 bg-white p-5 shadow-xs hover:shadow-md transition space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-stone-100 text-stone-700">
                <Receipt className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-stone-900">Contributions & Reimbursements</h3>
                <p className="text-[11px] text-stone-500">{contributions.length} contributors</p>
              </div>
            </div>
            <p className="text-xs text-stone-600">
              Audit trail of individual family/partner pledges and pending expense reimbursements.
            </p>
            <button
              onClick={exportPersonReport}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-stone-900 py-2.5 text-xs font-semibold text-white hover:bg-stone-800"
            >
              <Download className="h-3.5 w-3.5" />
              Download CSV
            </button>
          </div>
        </div>
      ) : (
        /* Printable Executive Summary Sheet */
        <div className="rounded-3xl border border-stone-300 bg-white p-8 shadow-md space-y-6 print:border-none print:shadow-none print:p-0">
          <div className="flex justify-between items-start border-b border-stone-200 pb-6">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-amber-600">PlanIT Event Dossier</div>
              <h2 className="text-2xl font-black text-stone-900 mt-1">{activeEvent.name}</h2>
              <p className="text-xs text-stone-500 mt-1">
                {activeEvent.category} • {formatDate(activeEvent.eventDate)} ({activeEvent.venueName})
              </p>
            </div>
            <div className="text-right text-xs text-stone-500">
              <div>Generated: {new Date().toLocaleDateString()}</div>
              <div>Lead Organizer: {activeEvent.organizerName}</div>
            </div>
          </div>

          {/* Key Figures Table */}
          <div className="grid grid-cols-4 gap-4 p-4 bg-stone-50 rounded-2xl">
            <div>
              <span className="text-[10px] font-semibold text-stone-500 uppercase">Estimated Budget</span>
              <p className="text-lg font-bold text-stone-900">{formatCurrency(summary.totalEstimatedBudget, currency)}</p>
            </div>
            <div>
              <span className="text-[10px] font-semibold text-stone-500 uppercase">Incurred Expenses</span>
              <p className="text-lg font-bold text-stone-900">{formatCurrency(summary.totalActualExpenses, currency)}</p>
            </div>
            <div>
              <span className="text-[10px] font-semibold text-stone-500 uppercase">Total Attending</span>
              <p className="text-lg font-bold text-emerald-600">{summary.confirmedAttendees} guests</p>
            </div>
            <div>
              <span className="text-[10px] font-semibold text-stone-500 uppercase">Pending RSVPs</span>
              <p className="text-lg font-bold text-amber-600">{summary.pendingRSVPCount} invitations</p>
            </div>
          </div>

          {/* Category Summary */}
          <div>
            <h3 className="text-sm font-bold text-stone-900 mb-2">Category Financial Breakdown</h3>
            <table className="w-full text-left text-xs border border-stone-200 rounded-xl overflow-hidden">
              <thead className="bg-stone-100 font-bold">
                <tr>
                  <th className="p-2.5">Category</th>
                  <th className="p-2.5">Allocated</th>
                  <th className="p-2.5">Incurred</th>
                  <th className="p-2.5">Net Variance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                {budgetCategories.map((bc) => {
                  const actual = expenses.filter((e) => e.category === bc.categoryName).reduce((s, e) => s + e.amount, 0);
                  const variance = bc.allocatedAmount - actual;
                  return (
                    <tr key={bc.id}>
                      <td className="p-2.5 font-semibold text-stone-900">{bc.categoryName}</td>
                      <td className="p-2.5">{formatCurrency(bc.allocatedAmount, currency)}</td>
                      <td className="p-2.5">{formatCurrency(actual, currency)}</td>
                      <td className={`p-2.5 font-bold ${variance < 0 ? 'text-red-600' : 'text-emerald-700'}`}>
                        {formatCurrency(variance, currency)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Vendors Summary */}
          <div>
            <h3 className="text-sm font-bold text-stone-900 mb-2">Contracted Vendor Statement</h3>
            <table className="w-full text-left text-xs border border-stone-200 rounded-xl overflow-hidden">
              <thead className="bg-stone-100 font-bold">
                <tr>
                  <th className="p-2.5">Vendor</th>
                  <th className="p-2.5">Category</th>
                  <th className="p-2.5">Contract Value</th>
                  <th className="p-2.5">Paid</th>
                  <th className="p-2.5">Pending</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                {vendors.map((v) => (
                  <tr key={v.id}>
                    <td className="p-2.5 font-semibold text-stone-900">{v.name}</td>
                    <td className="p-2.5 text-stone-600">{v.category}</td>
                    <td className="p-2.5">{formatCurrency(v.contractAmount, currency)}</td>
                    <td className="p-2.5 text-emerald-600">{formatCurrency(v.paidAmount, currency)}</td>
                    <td className="p-2.5 font-bold text-amber-700">
                      {formatCurrency(Math.max(0, v.contractAmount - v.paidAmount), currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
