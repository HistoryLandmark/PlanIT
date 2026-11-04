/**
 * PlanIT Client & Relational Database Service
 * Provides relational persistence, foreign key integrity, cross-module updates,
 * search, filtering, duplicate phone detection, and aggregation calculations.
 */

import {
  User,
  Event,
  EventCollaborator,
  EventBudget,
  BudgetCategory,
  Guest,
  Table,
  TableAssignment,
  Expense,
  Contribution,
  InvitationTemplate,
  InvitationLog,
  RSVPResponse,
  Vendor,
  Notification,
  RSVPStatus,
  InvitationStatus
} from '../types/database.ts';

import {
  INITIAL_USERS,
  INITIAL_EVENTS,
  INITIAL_COLLABORATORS,
  INITIAL_BUDGETS,
  INITIAL_BUDGET_CATEGORIES,
  INITIAL_GUESTS,
  INITIAL_TABLES,
  INITIAL_TABLE_ASSIGNMENTS,
  INITIAL_EXPENSES,
  INITIAL_CONTRIBUTIONS,
  INITIAL_INVITATION_TEMPLATES,
  INITIAL_INVITATION_LOGS,
  INITIAL_RSVP_RESPONSES,
  INITIAL_VENDORS,
  INITIAL_NOTIFICATIONS
} from './seedData.ts';

const STORAGE_KEYS = {
  USERS: 'planit_users_scratch_v3',
  EVENTS: 'planit_events_scratch_v3',
  COLLABORATORS: 'planit_collabs_scratch_v3',
  BUDGETS: 'planit_budgets_scratch_v3',
  BUDGET_CATEGORIES: 'planit_budget_categories_scratch_v3',
  GUESTS: 'planit_guests_scratch_v3',
  TABLES: 'planit_tables_scratch_v3',
  TABLE_ASSIGNMENTS: 'planit_table_assignments_scratch_v3',
  EXPENSES: 'planit_expenses_scratch_v3',
  CONTRIBUTIONS: 'planit_contributions_scratch_v3',
  INVITATION_TEMPLATES: 'planit_inv_templates_scratch_v3',
  INVITATION_LOGS: 'planit_inv_logs_scratch_v3',
  RSVP_RESPONSES: 'planit_rsvp_responses_scratch_v3',
  VENDORS: 'planit_vendors_scratch_v3',
  NOTIFICATIONS: 'planit_notifications_scratch_v3',
  ACTIVE_EVENT_ID: 'planit_active_event_id_scratch_v3',
  ACTIVE_USER_ID: 'planit_active_user_id_scratch_v3',
  CURRENCY: 'planit_currency_scratch_v3',
};

class DatabaseService {
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.ensureInitialized();
  }

  public subscribe(callback: () => void): () => void {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }

  private notify() {
    this.listeners.forEach((cb) => {
      try {
        cb();
      } catch (err) {
        console.error('Error in DB subscriber:', err);
      }
    });
  }

  private getItem<T>(key: string, fallback: T): T {
    try {
      const data = localStorage.getItem(key);
      if (!data) return fallback;
      return JSON.parse(data) as T;
    } catch {
      return fallback;
    }
  }

  private setItem<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error(`Failed to write to localStorage for key ${key}:`, e);
    }
  }

  public ensureInitialized(forceReset = false) {
    if (forceReset || !localStorage.getItem(STORAGE_KEYS.USERS)) {
      // Clear legacy storage to ensure 100% clean state
      try {
        Object.keys(localStorage).forEach((k) => {
          if (k.startsWith('planit_') && !k.includes('scratch_v3')) {
            localStorage.removeItem(k);
          }
        });
      } catch {}

      this.setItem(STORAGE_KEYS.USERS, INITIAL_USERS);
      this.setItem(STORAGE_KEYS.EVENTS, INITIAL_EVENTS);
      this.setItem(STORAGE_KEYS.COLLABORATORS, INITIAL_COLLABORATORS);
      this.setItem(STORAGE_KEYS.BUDGETS, INITIAL_BUDGETS);
      this.setItem(STORAGE_KEYS.BUDGET_CATEGORIES, INITIAL_BUDGET_CATEGORIES);
      this.setItem(STORAGE_KEYS.GUESTS, INITIAL_GUESTS);
      this.setItem(STORAGE_KEYS.TABLES, INITIAL_TABLES);
      this.setItem(STORAGE_KEYS.TABLE_ASSIGNMENTS, INITIAL_TABLE_ASSIGNMENTS);
      this.setItem(STORAGE_KEYS.EXPENSES, INITIAL_EXPENSES);
      this.setItem(STORAGE_KEYS.CONTRIBUTIONS, INITIAL_CONTRIBUTIONS);
      this.setItem(STORAGE_KEYS.INVITATION_TEMPLATES, INITIAL_INVITATION_TEMPLATES);
      this.setItem(STORAGE_KEYS.INVITATION_LOGS, INITIAL_INVITATION_LOGS);
      this.setItem(STORAGE_KEYS.RSVP_RESPONSES, INITIAL_RSVP_RESPONSES);
      this.setItem(STORAGE_KEYS.VENDORS, INITIAL_VENDORS);
      this.setItem(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
      this.setItem(STORAGE_KEYS.ACTIVE_EVENT_ID, '');
      this.setItem(STORAGE_KEYS.ACTIVE_USER_ID, INITIAL_USERS[0]?.id || 'user-admin');
      this.setItem(STORAGE_KEYS.CURRENCY, '₹');
      this.notify();
    }
  }

  // --- Auth & Users ---
  public getUsers(): User[] {
    return this.getItem(STORAGE_KEYS.USERS, INITIAL_USERS);
  }

  public getUserById(id: string): User | undefined {
    return this.getUsers().find((u) => u.id === id);
  }

  public getActiveUserId(): string {
    return this.getItem(STORAGE_KEYS.ACTIVE_USER_ID, INITIAL_USERS[0].id);
  }

  public setActiveUserId(userId: string): void {
    this.setItem(STORAGE_KEYS.ACTIVE_USER_ID, userId);
    this.notify();
  }

  public saveUser(user: User): void {
    const users = this.getUsers();
    const index = users.findIndex((u) => u.id === user.id);
    if (index >= 0) {
      users[index] = user;
    } else {
      users.push(user);
    }
    this.setItem(STORAGE_KEYS.USERS, users);
    this.notify();
  }

  // --- Currency Preference ---
  public getCurrency(): string {
    return this.getItem(STORAGE_KEYS.CURRENCY, '₹');
  }

  public setCurrency(symbol: string): void {
    this.setItem(STORAGE_KEYS.CURRENCY, symbol);
    this.notify();
  }

  // --- Events ---
  public getEvents(): Event[] {
    return this.getItem(STORAGE_KEYS.EVENTS, INITIAL_EVENTS);
  }

  public getEventById(id: string): Event | undefined {
    return this.getEvents().find((e) => e.id === id);
  }

  public getActiveEventId(): string {
    const events = this.getEvents();
    const saved = this.getItem(STORAGE_KEYS.ACTIVE_EVENT_ID, '');
    if (saved && events.some((e) => e.id === saved)) {
      return saved;
    }
    return events[0]?.id || '';
  }

  public setActiveEventId(id: string): void {
    this.setItem(STORAGE_KEYS.ACTIVE_EVENT_ID, id);
    this.notify();
  }

  public createEvent(eventData: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>): Event {
    const events = this.getEvents();
    const newId = `evt-${Date.now()}`;
    const newEvent: Event = {
      ...eventData,
      id: newId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    events.unshift(newEvent);
    this.setItem(STORAGE_KEYS.EVENTS, events);

    // Create default budget
    const budgets = this.getBudgets();
    budgets.push({
      id: `bud-${Date.now()}`,
      eventId: newId,
      totalBudget: eventData.estimatedBudget || 500000,
      currency: this.getCurrency(),
      updatedAt: new Date().toISOString(),
    });
    this.setItem(STORAGE_KEYS.BUDGETS, budgets);

    // Add creator as owner collaborator
    const collabs = this.getCollaborators();
    const activeUser = this.getUserById(this.getActiveUserId()) || INITIAL_USERS[0];
    collabs.push({
      id: `collab-${Date.now()}`,
      eventId: newId,
      userId: activeUser.id,
      userName: activeUser.name,
      userEmail: activeUser.email,
      role: 'owner',
      permissions: {
        canEditEvent: true,
        canManageGuests: true,
        canManageBudget: true,
        canManageTables: true,
        canSendInvitations: true,
      },
      addedAt: new Date().toISOString(),
    });
    this.setItem(STORAGE_KEYS.COLLABORATORS, collabs);

    // Add default invitation templates
    const templates = this.getInvitationTemplates();
    templates.push(
      {
        id: `tmpl-eng-${Date.now()}`,
        eventId: newId,
        style: 'Royal Gold Floral',
        tone: 'Formal',
        language: 'English',
        headline: 'Cordially Invited',
        subheadline: `To celebrate ${newEvent.name}`,
        bodyTemplate: `Dear {{guestName}},\n\nYou are warmly invited to attend {{eventName}} on {{eventDate}} at {{eventTime}} at {{venueName}}.\n\nRSVP link: {{rsvpLink}}`,
        closingMessage: `Warm regards,\n${newEvent.organizerName}`,
        primaryColor: '#D97706',
      },
      {
        id: `tmpl-mod-${Date.now()}`,
        eventId: newId,
        style: 'Modern Vibrant',
        tone: 'Modern',
        language: 'English',
        headline: "You're Invited! ✨",
        subheadline: 'Join us for this special occasion',
        bodyTemplate: `Hey {{guestName}}! We'd love for you to join us at {{eventName}} on {{eventDate}} at {{venueName}}.\n\nRSVP here: {{rsvpLink}}`,
        closingMessage: `Cheers,\n${newEvent.organizerName}`,
        primaryColor: '#8B5CF6',
      }
    );
    this.setItem(STORAGE_KEYS.INVITATION_TEMPLATES, templates);

    this.setActiveEventId(newId);
    this.addNotification({
      eventId: newId,
      title: 'Event Created',
      message: `"${newEvent.name}" was successfully created.`,
      type: 'success',
    });

    this.notify();
    return newEvent;
  }

  public updateEvent(id: string, updates: Partial<Event>): Event | undefined {
    const events = this.getEvents();
    const index = events.findIndex((e) => e.id === id);
    if (index === -1) return undefined;

    events[index] = {
      ...events[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.setItem(STORAGE_KEYS.EVENTS, events);

    // If budget changed, sync budget entity
    if (updates.estimatedBudget !== undefined) {
      const budgets = this.getBudgets();
      const bIndex = budgets.findIndex((b) => b.eventId === id);
      if (bIndex >= 0) {
        budgets[bIndex].totalBudget = updates.estimatedBudget;
        budgets[bIndex].updatedAt = new Date().toISOString();
        this.setItem(STORAGE_KEYS.BUDGETS, budgets);
      }
    }

    this.notify();
    return events[index];
  }

  public deleteEvent(id: string): void {
    // Cascade delete all records with this eventId
    const events = this.getEvents().filter((e) => e.id !== id);
    this.setItem(STORAGE_KEYS.EVENTS, events);

    this.setItem(STORAGE_KEYS.GUESTS, this.getGuests().filter((g) => g.eventId !== id));
    this.setItem(STORAGE_KEYS.TABLES, this.getTables().filter((t) => t.eventId !== id));
    this.setItem(STORAGE_KEYS.TABLE_ASSIGNMENTS, this.getTableAssignments().filter((ta) => ta.eventId !== id));
    this.setItem(STORAGE_KEYS.EXPENSES, this.getExpenses().filter((x) => x.eventId !== id));
    this.setItem(STORAGE_KEYS.BUDGETS, this.getBudgets().filter((b) => b.eventId !== id));
    this.setItem(STORAGE_KEYS.BUDGET_CATEGORIES, this.getBudgetCategories().filter((bc) => bc.eventId !== id));
    this.setItem(STORAGE_KEYS.CONTRIBUTIONS, this.getContributions().filter((c) => c.eventId !== id));
    this.setItem(STORAGE_KEYS.INVITATION_TEMPLATES, this.getInvitationTemplates().filter((t) => t.eventId !== id));
    this.setItem(STORAGE_KEYS.INVITATION_LOGS, this.getInvitationLogs().filter((l) => l.eventId !== id));
    this.setItem(STORAGE_KEYS.RSVP_RESPONSES, this.getRSVPResponses().filter((r) => r.eventId !== id));
    this.setItem(STORAGE_KEYS.VENDORS, this.getVendors().filter((v) => v.eventId !== id));

    const remaining = this.getEvents();
    if (this.getActiveEventId() === id) {
      this.setActiveEventId(remaining[0]?.id || '');
    }
    this.notify();
  }

  // --- Collaborators ---
  public getCollaborators(eventId?: string): EventCollaborator[] {
    const collabs = this.getItem(STORAGE_KEYS.COLLABORATORS, INITIAL_COLLABORATORS);
    return eventId ? collabs.filter((c) => c.eventId === eventId) : collabs;
  }

  public addCollaborator(collab: Omit<EventCollaborator, 'id' | 'addedAt'>): EventCollaborator {
    const collabs = this.getCollaborators();
    const newCollab: EventCollaborator = {
      ...collab,
      id: `collab-${Date.now()}`,
      addedAt: new Date().toISOString(),
    };
    collabs.push(newCollab);
    this.setItem(STORAGE_KEYS.COLLABORATORS, collabs);
    this.notify();
    return newCollab;
  }

  public removeCollaborator(id: string): void {
    const collabs = this.getCollaborators().filter((c) => c.id !== id);
    this.setItem(STORAGE_KEYS.COLLABORATORS, collabs);
    this.notify();
  }

  // --- Guests ---
  public getGuests(eventId?: string): Guest[] {
    const guests = this.getItem(STORAGE_KEYS.GUESTS, INITIAL_GUESTS);
    return eventId ? guests.filter((g) => g.eventId === eventId) : guests;
  }

  public getGuestById(id: string): Guest | undefined {
    return this.getGuests().find((g) => g.id === id);
  }

  public getGuestByToken(token: string): Guest | undefined {
    return this.getGuests().find((g) => g.uniqueToken === token);
  }

  public findDuplicatePhones(eventId: string, phone: string, excludeGuestId?: string): Guest[] {
    const normalized = phone.replace(/\D/g, '').slice(-10);
    if (!normalized || normalized.length < 7) return [];
    return this.getGuests(eventId).filter((g) => {
      if (excludeGuestId && g.id === excludeGuestId) return false;
      const other = g.mobileNumber.replace(/\D/g, '').slice(-10);
      return other === normalized;
    });
  }

  public saveGuest(guestData: Omit<Guest, 'id' | 'serialNumber' | 'uniqueToken' | 'createdAt' | 'updatedAt'> & { id?: string }): Guest {
    const allGuests = this.getGuests();
    const eventGuests = allGuests.filter((g) => g.eventId === guestData.eventId);

    if (guestData.id) {
      const idx = allGuests.findIndex((g) => g.id === guestData.id);
      if (idx >= 0) {
        const existing = allGuests[idx];
        const updated: Guest = {
          ...existing,
          ...guestData,
          id: existing.id,
          serialNumber: existing.serialNumber,
          uniqueToken: existing.uniqueToken,
          updatedAt: new Date().toISOString(),
        };
        allGuests[idx] = updated;

        // If table assignment changed
        if (guestData.assignedTableId !== existing.assignedTableId) {
          if (guestData.assignedTableId) {
            this.assignGuestToTable(guestData.eventId, guestData.assignedTableId, updated.id, updated.headCount);
          } else {
            this.unassignGuestFromTable(guestData.eventId, updated.id);
          }
        }

        this.setItem(STORAGE_KEYS.GUESTS, allGuests);
        this.notify();
        return updated;
      }
    }

    // New guest
    const maxSerial = eventGuests.reduce((max, g) => Math.max(max, g.serialNumber || 0), 0);
    const newGuest: Guest = {
      ...guestData,
      id: `gst-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      serialNumber: maxSerial + 1,
      uniqueToken: `rsvp-${guestData.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now().toString(36)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    allGuests.push(newGuest);
    this.setItem(STORAGE_KEYS.GUESTS, allGuests);

    if (guestData.assignedTableId) {
      this.assignGuestToTable(guestData.eventId, guestData.assignedTableId, newGuest.id, newGuest.headCount);
    }

    this.notify();
    return newGuest;
  }

  public bulkImportGuests(eventId: string, guestList: Array<{ name: string; mobileNumber: string; emailAddress?: string; headCount?: number; category?: any; remarks?: string }>): number {
    const allGuests = this.getGuests();
    let maxSerial = allGuests.filter((g) => g.eventId === eventId).reduce((max, g) => Math.max(max, g.serialNumber || 0), 0);
    let addedCount = 0;

    guestList.forEach((item) => {
      if (!item.name || !item.name.trim()) return;
      maxSerial++;
      const newGuest: Guest = {
        id: `gst-${Date.now()}-${Math.floor(Math.random() * 100000)}`,
        serialNumber: maxSerial,
        eventId,
        name: item.name.trim(),
        mobileNumber: item.mobileNumber?.trim() || '',
        emailAddress: item.emailAddress?.trim() || '',
        headCount: Number(item.headCount) > 0 ? Number(item.headCount) : 1,
        category: item.category || 'Friends',
        invitationStatus: 'Draft',
        rsvpStatus: 'Pending',
        remarks: item.remarks?.trim() || '',
        uniqueToken: `rsvp-${item.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Math.random().toString(36).substring(2, 8)}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      allGuests.push(newGuest);
      addedCount++;
    });

    this.setItem(STORAGE_KEYS.GUESTS, allGuests);
    this.addNotification({
      eventId,
      title: 'Bulk Guests Imported',
      message: `Successfully imported ${addedCount} guests to the event guest list.`,
      type: 'success',
    });
    this.notify();
    return addedCount;
  }

  public deleteGuest(guestId: string): void {
    const guest = this.getGuestById(guestId);
    if (!guest) return;

    // Unassign table
    this.unassignGuestFromTable(guest.eventId, guestId);

    // Remove from logs & responses
    this.setItem(STORAGE_KEYS.INVITATION_LOGS, this.getInvitationLogs().filter((l) => l.guestId !== guestId));
    this.setItem(STORAGE_KEYS.RSVP_RESPONSES, this.getRSVPResponses().filter((r) => r.guestId !== guestId));

    // Remove guest
    const allGuests = this.getGuests().filter((g) => g.id !== guestId);
    this.setItem(STORAGE_KEYS.GUESTS, allGuests);
    this.notify();
  }

  // --- Tables & Seating Management ---
  public getTables(eventId?: string): Table[] {
    const tables = this.getItem(STORAGE_KEYS.TABLES, INITIAL_TABLES);
    return eventId ? tables.filter((t) => t.eventId === eventId) : tables;
  }

  public getTableAssignments(eventId?: string): TableAssignment[] {
    const assignments = this.getItem(STORAGE_KEYS.TABLE_ASSIGNMENTS, INITIAL_TABLE_ASSIGNMENTS);
    return eventId ? assignments.filter((a) => a.eventId === eventId) : assignments;
  }

  public saveTable(tableData: Omit<Table, 'id'> & { id?: string }): Table {
    const tables = this.getTables();
    if (tableData.id) {
      const idx = tables.findIndex((t) => t.id === tableData.id);
      if (idx >= 0) {
        tables[idx] = { ...tables[idx], ...tableData } as Table;
        this.setItem(STORAGE_KEYS.TABLES, tables);
        this.notify();
        return tables[idx];
      }
    }

    const newTable: Table = {
      ...tableData,
      id: `tbl-${Date.now()}`,
    };
    tables.push(newTable);
    this.setItem(STORAGE_KEYS.TABLES, tables);
    this.notify();
    return newTable;
  }

  public deleteTable(tableId: string): void {
    const tables = this.getTables().filter((t) => t.id !== tableId);
    this.setItem(STORAGE_KEYS.TABLES, tables);

    // Clear assignments & guest references
    const assignments = this.getTableAssignments().filter((a) => a.tableId !== tableId);
    this.setItem(STORAGE_KEYS.TABLE_ASSIGNMENTS, assignments);

    const guests = this.getGuests();
    guests.forEach((g) => {
      if (g.assignedTableId === tableId) {
        g.assignedTableId = undefined;
      }
    });
    this.setItem(STORAGE_KEYS.GUESTS, guests);

    this.notify();
  }

  public assignGuestToTable(eventId: string, tableId: string, guestId: string, seatCount: number): void {
    // Prevent duplicate assignment across tables
    let assignments = this.getTableAssignments().filter((a) => a.guestId !== guestId);
    assignments.push({
      id: `ta-${Date.now()}`,
      eventId,
      tableId,
      guestId,
      seatCount: seatCount > 0 ? seatCount : 1,
      assignedAt: new Date().toISOString(),
    });
    this.setItem(STORAGE_KEYS.TABLE_ASSIGNMENTS, assignments);

    // Update guest record
    const guests = this.getGuests();
    const guest = guests.find((g) => g.id === guestId);
    if (guest) {
      guest.assignedTableId = tableId;
      this.setItem(STORAGE_KEYS.GUESTS, guests);
    }
    this.notify();
  }

  public unassignGuestFromTable(eventId: string, guestId: string): void {
    const assignments = this.getTableAssignments().filter((a) => a.guestId !== guestId);
    this.setItem(STORAGE_KEYS.TABLE_ASSIGNMENTS, assignments);

    const guests = this.getGuests();
    const guest = guests.find((g) => g.id === guestId);
    if (guest) {
      guest.assignedTableId = undefined;
      this.setItem(STORAGE_KEYS.GUESTS, guests);
    }
    this.notify();
  }

  // --- Expenses & Budget ---
  public getExpenses(eventId?: string): Expense[] {
    const expenses = this.getItem(STORAGE_KEYS.EXPENSES, INITIAL_EXPENSES);
    return eventId ? expenses.filter((e) => e.eventId === eventId) : expenses;
  }

  public saveExpense(expenseData: Omit<Expense, 'id' | 'createdAt'> & { id?: string }): Expense {
    const expenses = this.getExpenses();
    if (expenseData.id) {
      const idx = expenses.findIndex((e) => e.id === expenseData.id);
      if (idx >= 0) {
        expenses[idx] = { ...expenses[idx], ...expenseData } as Expense;
        this.setItem(STORAGE_KEYS.EXPENSES, expenses);
        this.recalculateContributions(expenseData.eventId);
        this.notify();
        return expenses[idx];
      }
    }

    const newExpense: Expense = {
      ...expenseData,
      id: `exp-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    expenses.unshift(newExpense);
    this.setItem(STORAGE_KEYS.EXPENSES, expenses);

    // Sync with vendor total paid if vendorId provided
    if (expenseData.vendorId && expenseData.paymentStatus === 'Paid') {
      const vendors = this.getVendors();
      const v = vendors.find((vend) => vend.id === expenseData.vendorId);
      if (v) {
        v.paidAmount = (v.paidAmount || 0) + expenseData.amount;
        this.setItem(STORAGE_KEYS.VENDORS, vendors);
      }
    }

    this.recalculateContributions(expenseData.eventId);
    this.notify();
    return newExpense;
  }

  public deleteExpense(id: string): void {
    const expenses = this.getExpenses();
    const expense = expenses.find((e) => e.id === id);
    const updated = expenses.filter((e) => e.id !== id);
    this.setItem(STORAGE_KEYS.EXPENSES, updated);
    if (expense) {
      this.recalculateContributions(expense.eventId);
    }
    this.notify();
  }

  public getBudgets(): EventBudget[] {
    return this.getItem(STORAGE_KEYS.BUDGETS, INITIAL_BUDGETS);
  }

  public getEventBudget(eventId: string): EventBudget | undefined {
    return this.getBudgets().find((b) => b.eventId === eventId);
  }

  public setEventBudget(eventId: string, totalBudget: number): void {
    const budgets = this.getBudgets();
    const idx = budgets.findIndex((b) => b.eventId === eventId);
    if (idx >= 0) {
      budgets[idx].totalBudget = totalBudget;
      budgets[idx].updatedAt = new Date().toISOString();
    } else {
      budgets.push({
        id: `bud-${Date.now()}`,
        eventId,
        totalBudget,
        currency: this.getCurrency(),
        updatedAt: new Date().toISOString(),
      });
    }
    this.setItem(STORAGE_KEYS.BUDGETS, budgets);

    // Also sync event entity estimated budget
    const events = this.getEvents();
    const event = events.find((e) => e.id === eventId);
    if (event) {
      event.estimatedBudget = totalBudget;
      this.setItem(STORAGE_KEYS.EVENTS, events);
    }

    this.notify();
  }

  public getBudgetCategories(eventId?: string): BudgetCategory[] {
    const categories = this.getItem(STORAGE_KEYS.BUDGET_CATEGORIES, INITIAL_BUDGET_CATEGORIES);
    return eventId ? categories.filter((c) => c.eventId === eventId) : categories;
  }

  public setBudgetCategory(eventId: string, categoryName: any, allocatedAmount: number, notes?: string): void {
    const categories = this.getBudgetCategories();
    const existing = categories.find((c) => c.eventId === eventId && c.categoryName === categoryName);
    if (existing) {
      existing.allocatedAmount = allocatedAmount;
      if (notes !== undefined) existing.notes = notes;
    } else {
      categories.push({
        id: `bc-${Date.now()}`,
        eventId,
        categoryName,
        allocatedAmount,
        notes,
      });
    }
    this.setItem(STORAGE_KEYS.BUDGET_CATEGORIES, categories);
    this.notify();
  }

  public getContributions(eventId?: string): Contribution[] {
    const contributions = this.getItem(STORAGE_KEYS.CONTRIBUTIONS, INITIAL_CONTRIBUTIONS);
    return eventId ? contributions.filter((c) => c.eventId === eventId) : contributions;
  }

  public saveContribution(contributionData: Omit<Contribution, 'id' | 'updatedAt'> & { id?: string }): Contribution {
    const contributions = this.getContributions();
    if (contributionData.id) {
      const idx = contributions.findIndex((c) => c.id === contributionData.id);
      if (idx >= 0) {
        contributions[idx] = {
          ...contributions[idx],
          ...contributionData,
          updatedAt: new Date().toISOString(),
        };
        this.setItem(STORAGE_KEYS.CONTRIBUTIONS, contributions);
        this.notify();
        return contributions[idx];
      }
    }

    const newContrib: Contribution = {
      ...contributionData,
      id: `cnt-${Date.now()}`,
      updatedAt: new Date().toISOString(),
    };
    contributions.push(newContrib);
    this.setItem(STORAGE_KEYS.CONTRIBUTIONS, contributions);
    this.notify();
    return newContrib;
  }

  public deleteContribution(id: string): void {
    const contributions = this.getContributions().filter((c) => c.id !== id);
    this.setItem(STORAGE_KEYS.CONTRIBUTIONS, contributions);
    this.notify();
  }

  private recalculateContributions(eventId: string) {
    const expenses = this.getExpenses(eventId);
    const contributions = this.getContributions(eventId);

    contributions.forEach((c) => {
      // Sum actual paid expenses where paidBy matches contributorName
      const paidSum = expenses
        .filter((e) => e.paidBy?.toLowerCase().includes(c.contributorName.split(' ')[0].toLowerCase()))
        .reduce((sum, e) => sum + e.amount, 0);

      c.amountPaid = paidSum;
      // Pending reimbursement: if actual paid exceeds allocated pledge
      c.reimbursementPending = Math.max(0, paidSum - c.allocatedAmount);
      c.updatedAt = new Date().toISOString();
    });

    const allContribs = this.getContributions();
    const updated = allContribs.map((ac) => {
      const match = contributions.find((c) => c.id === ac.id);
      return match || ac;
    });
    this.setItem(STORAGE_KEYS.CONTRIBUTIONS, updated);
  }

  // --- Vendors ---
  public getVendors(eventId?: string): Vendor[] {
    const vendors = this.getItem(STORAGE_KEYS.VENDORS, INITIAL_VENDORS);
    return eventId ? vendors.filter((v) => v.eventId === eventId) : vendors;
  }

  public saveVendor(vendorData: Omit<Vendor, 'id'> & { id?: string }): Vendor {
    const vendors = this.getVendors();
    if (vendorData.id) {
      const idx = vendors.findIndex((v) => v.id === vendorData.id);
      if (idx >= 0) {
        vendors[idx] = { ...vendors[idx], ...vendorData } as Vendor;
        this.setItem(STORAGE_KEYS.VENDORS, vendors);
        this.notify();
        return vendors[idx];
      }
    }

    const newVendor: Vendor = {
      ...vendorData,
      id: `vnd-${Date.now()}`,
    };
    vendors.push(newVendor);
    this.setItem(STORAGE_KEYS.VENDORS, vendors);
    this.notify();
    return newVendor;
  }

  public deleteVendor(id: string): void {
    const vendors = this.getVendors().filter((v) => v.id !== id);
    this.setItem(STORAGE_KEYS.VENDORS, vendors);
    this.notify();
  }

  // --- Invitations & Templates ---
  public getInvitationTemplates(eventId?: string): InvitationTemplate[] {
    const templates = this.getItem(STORAGE_KEYS.INVITATION_TEMPLATES, INITIAL_INVITATION_TEMPLATES);
    return eventId ? templates.filter((t) => t.eventId === eventId) : templates;
  }

  public saveInvitationTemplate(template: InvitationTemplate): void {
    const templates = this.getInvitationTemplates();
    const idx = templates.findIndex((t) => t.id === template.id);
    if (idx >= 0) {
      templates[idx] = template;
    } else {
      templates.push(template);
    }
    this.setItem(STORAGE_KEYS.INVITATION_TEMPLATES, templates);
    this.notify();
  }

  public getInvitationLogs(eventId?: string): InvitationLog[] {
    const logs = this.getItem(STORAGE_KEYS.INVITATION_LOGS, INITIAL_INVITATION_LOGS);
    return eventId ? logs.filter((l) => l.eventId === eventId) : logs;
  }

  public logInvitationSent(log: Omit<InvitationLog, 'id' | 'sentAt'>): InvitationLog {
    const logs = this.getInvitationLogs();
    const newLog: InvitationLog = {
      ...log,
      id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      sentAt: new Date().toISOString(),
    };
    logs.unshift(newLog);
    this.setItem(STORAGE_KEYS.INVITATION_LOGS, logs);

    // Update guest invitation status
    const guests = this.getGuests();
    const guest = guests.find((g) => g.id === log.guestId);
    if (guest) {
      guest.invitationStatus = log.status === 'Sent' || log.status === 'Delivered' ? 'Sent' : 'Failed';
      this.setItem(STORAGE_KEYS.GUESTS, guests);
    }

    this.notify();
    return newLog;
  }

  // --- RSVP Responses ---
  public getRSVPResponses(eventId?: string): RSVPResponse[] {
    const rsvps = this.getItem(STORAGE_KEYS.RSVP_RESPONSES, INITIAL_RSVP_RESPONSES);
    return eventId ? rsvps.filter((r) => r.eventId === eventId) : rsvps;
  }

  public submitRSVP(eventId: string, guestId: string, status: RSVPStatus, confirmedHeadCount: number, dietaryRestrictions?: string, guestRemarks?: string): RSVPResponse {
    const rsvps = this.getRSVPResponses();
    const existingIdx = rsvps.findIndex((r) => r.guestId === guestId && r.eventId === eventId);

    const rsvpRecord: RSVPResponse = {
      id: existingIdx >= 0 ? rsvps[existingIdx].id : `rsvp-${Date.now()}`,
      eventId,
      guestId,
      status,
      confirmedHeadCount: status === 'Confirmed' ? confirmedHeadCount : 0,
      dietaryRestrictions,
      guestRemarks,
      submittedAt: new Date().toISOString(),
    };

    if (existingIdx >= 0) {
      rsvps[existingIdx] = rsvpRecord;
    } else {
      rsvps.unshift(rsvpRecord);
    }
    this.setItem(STORAGE_KEYS.RSVP_RESPONSES, rsvps);

    // Update guest entity
    const guests = this.getGuests();
    const guest = guests.find((g) => g.id === guestId);
    if (guest) {
      guest.rsvpStatus = status;
      if (status === 'Confirmed') {
        guest.headCount = confirmedHeadCount;
      }
      this.setItem(STORAGE_KEYS.GUESTS, guests);

      // Add in-app notification for host
      this.addNotification({
        eventId,
        title: `RSVP ${status}: ${guest.name}`,
        message: status === 'Confirmed'
          ? `${guest.name} confirmed attendance with ${confirmedHeadCount} guest(s).`
          : `${guest.name} declined attendance.`,
        type: status === 'Confirmed' ? 'success' : 'info',
      });
    }

    this.notify();
    return rsvpRecord;
  }

  // --- Notifications ---
  public getNotifications(eventId?: string): Notification[] {
    const notifs = this.getItem(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    return eventId ? notifs.filter((n) => !n.eventId || n.eventId === eventId) : notifs;
  }

  public addNotification(notif: Omit<Notification, 'id' | 'read' | 'createdAt'>): void {
    const notifs = this.getNotifications();
    notifs.unshift({
      ...notif,
      id: `notif-${Date.now()}`,
      read: false,
      createdAt: new Date().toISOString(),
    });
    this.setItem(STORAGE_KEYS.NOTIFICATIONS, notifs);
    this.notify();
  }

  public markNotificationAsRead(id: string): void {
    const notifs = this.getNotifications();
    const n = notifs.find((x) => x.id === id);
    if (n) {
      n.read = true;
      this.setItem(STORAGE_KEYS.NOTIFICATIONS, notifs);
      this.notify();
    }
  }

  public markAllNotificationsRead(eventId?: string): void {
    const notifs = this.getNotifications();
    notifs.forEach((n) => {
      if (!eventId || n.eventId === eventId) {
        n.read = true;
      }
    });
    this.setItem(STORAGE_KEYS.NOTIFICATIONS, notifs);
    this.notify();
  }

  // --- Aggregate Stats for Dashboard & Reports ---
  public getEventSummary(eventId: string) {
    const event = this.getEventById(eventId);
    const guests = this.getGuests(eventId);
    const tables = this.getTables(eventId);
    const assignments = this.getTableAssignments(eventId);
    const expenses = this.getExpenses(eventId);
    const budgetObj = this.getEventBudget(eventId);
    const budgetCategories = this.getBudgetCategories(eventId);
    const logs = this.getInvitationLogs(eventId);
    const rsvps = this.getRSVPResponses(eventId);
    const vendors = this.getVendors(eventId);
    const contributions = this.getContributions(eventId);

    const totalEstimatedBudget = budgetObj?.totalBudget || event?.estimatedBudget || 0;
    const totalActualExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const totalPaidExpenses = expenses.filter((e) => e.paymentStatus === 'Paid').reduce((sum, e) => sum + e.amount, 0);
    const pendingPayments = expenses.filter((e) => e.paymentStatus === 'Pending' || e.paymentStatus === 'Partial').reduce((sum, e) => sum + e.amount, 0);
    const remainingBudget = totalEstimatedBudget - totalActualExpenses;

    const totalGuests = guests.length;
    const totalExpectedAttendees = guests.reduce((sum, g) => sum + (g.headCount || 1), 0);
    const confirmedGuests = guests.filter((g) => g.rsvpStatus === 'Confirmed');
    const confirmedAttendees = confirmedGuests.reduce((sum, g) => sum + (g.headCount || 1), 0);
    const declinedGuests = guests.filter((g) => g.rsvpStatus === 'Declined');
    const pendingRSVPGuests = guests.filter((g) => g.rsvpStatus === 'Pending');

    const invitationsSent = guests.filter((g) => g.invitationStatus === 'Sent').length;
    const invitationsPending = guests.filter((g) => g.invitationStatus === 'Draft' || g.invitationStatus === 'Ready').length;

    const totalTableCapacity = tables.reduce((sum, t) => sum + t.capacity, 0);
    const totalOccupiedSeats = assignments.reduce((sum, a) => sum + a.seatCount, 0);
    const availableSeats = Math.max(0, totalTableCapacity - totalOccupiedSeats);
    const unseatedGuests = guests.filter((g) => !g.assignedTableId && g.rsvpStatus !== 'Declined');

    return {
      event,
      totalEstimatedBudget,
      totalActualExpenses,
      totalPaidExpenses,
      pendingPayments,
      remainingBudget,
      isOverBudget: remainingBudget < 0,
      totalGuests,
      totalExpectedAttendees,
      confirmedGuestsCount: confirmedGuests.length,
      confirmedAttendees,
      declinedGuestsCount: declinedGuests.length,
      pendingRSVPCount: pendingRSVPGuests.length,
      invitationsSent,
      invitationsPending,
      totalTableCapacity,
      totalOccupiedSeats,
      availableSeats,
      unseatedGuestsCount: unseatedGuests.length,
      tables,
      expenses,
      budgetCategories,
      vendors,
      contributions,
      logs,
      rsvps,
    };
  }

  public getGlobalDashboardStats() {
    const events = this.getEvents();
    const now = new Date();
    const upcomingEvents = events.filter((e) => e.status === 'upcoming' || new Date(`${e.eventDate}T${e.startTime || '00:00'}`) >= now);
    const completedEvents = events.filter((e) => e.status === 'completed' || (new Date(`${e.eventDate}T${e.endTime || '23:59'}`) < now && e.status !== 'archived'));

    let totalGuestsAll = 0;
    let totalBudgetSum = 0;
    let totalExpensesSum = 0;
    let totalPendingPayments = 0;
    let totalInvitesSent = 0;
    let totalConfirmedAll = 0;

    events.forEach((evt) => {
      const summary = this.getEventSummary(evt.id);
      totalGuestsAll += summary.totalGuests;
      totalBudgetSum += summary.totalEstimatedBudget;
      totalExpensesSum += summary.totalActualExpenses;
      totalPendingPayments += summary.pendingPayments;
      totalInvitesSent += summary.invitationsSent;
      totalConfirmedAll += summary.confirmedAttendees;
    });

    // Find next upcoming event
    const sortedUpcoming = [...upcomingEvents].sort((a, b) => {
      return new Date(`${a.eventDate}T${a.startTime || '00:00'}`).getTime() - new Date(`${b.eventDate}T${b.startTime || '00:00'}`).getTime();
    });
    const nextUpcomingEvent = sortedUpcoming[0] || events[0];

    return {
      totalEvents: events.length,
      upcomingCount: upcomingEvents.length,
      completedCount: completedEvents.length,
      totalGuests: totalGuestsAll,
      totalEstimatedBudget: totalBudgetSum,
      totalActualExpenses: totalExpensesSum,
      remainingBudget: totalBudgetSum - totalExpensesSum,
      pendingPayments: totalPendingPayments,
      invitationsSent: totalInvitesSent,
      confirmedAttendees: totalConfirmedAll,
      nextUpcomingEvent,
    };
  }
}

export const dbService = new DatabaseService();
