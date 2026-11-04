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
  Notification
} from '../types/database.ts';

// Clean initial state with no pre-filled events, guests, expenses, or tables
export const INITIAL_USERS: User[] = [
  {
    id: 'user-admin',
    name: 'Event Organizer',
    email: 'organizer@planit.io',
    phone: '',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    role: 'owner',
    createdAt: new Date().toISOString(),
  },
];

export const INITIAL_EVENTS: Event[] = [];
export const INITIAL_COLLABORATORS: EventCollaborator[] = [];
export const INITIAL_BUDGETS: EventBudget[] = [];
export const INITIAL_BUDGET_CATEGORIES: BudgetCategory[] = [];
export const INITIAL_GUESTS: Guest[] = [];
export const INITIAL_TABLES: Table[] = [];
export const INITIAL_TABLE_ASSIGNMENTS: TableAssignment[] = [];
export const INITIAL_EXPENSES: Expense[] = [];
export const INITIAL_CONTRIBUTIONS: Contribution[] = [];
export const INITIAL_INVITATION_TEMPLATES: InvitationTemplate[] = [];
export const INITIAL_INVITATION_LOGS: InvitationLog[] = [];
export const INITIAL_RSVP_RESPONSES: RSVPResponse[] = [];
export const INITIAL_VENDORS: Vendor[] = [];
export const INITIAL_NOTIFICATIONS: Notification[] = [];
