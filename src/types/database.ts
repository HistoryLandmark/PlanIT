/**
 * PlanIT Database Schema & Types
 * Relational entities as specified in requirements:
 * Users, User_Roles, Events, Event_Collaborators, Event_Budgets, Budget_Categories,
 * Guests, Guest_Events, Tables, Table_Assignments, Expenses, Expense_Categories,
 * Contributions, Invitations, Invitation_Templates, Invitation_Logs, RSVP_Responses,
 * Vendors, Attachments, Notifications.
 */

export type RoleType = 'owner' | 'admin' | 'collaborator' | 'viewer';

export type MemberType =
  | 'Bride'
  | 'Groom'
  | "Bride's Family"
  | "Groom's Family"
  | 'Family Member'
  | 'Event Planner';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  role: RoleType;
  memberType?: MemberType;
  relation?: string;
  createdAt: string;
}

export interface UserRole {
  id: string;
  userId: string;
  roleName: RoleType;
  permissions: string[];
}

export type EventCategory =
  | 'Wedding'
  | 'Engagement'
  | 'Reception'
  | 'Birthday'
  | 'Corporate'
  | 'Family Function'
  | 'Anniversary'
  | 'Other';

export type EventStatus = 'upcoming' | 'ongoing' | 'completed' | 'archived';

export interface Event {
  id: string;
  name: string;
  category: EventCategory;
  description: string;
  eventDate: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string;   // HH:mm
  venueName: string;
  venueAddress: string;
  googleMapsUrl: string;
  coverImage: string;
  organizerName: string;
  contactPhone: string;
  contactEmail: string;
  estimatedBudget: number;
  additionalNotes?: string;
  status: EventStatus;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface EventCollaborator {
  id: string;
  eventId: string;
  userId: string;
  userName: string;
  userEmail: string;
  role: RoleType;
  permissions: {
    canEditEvent: boolean;
    canManageGuests: boolean;
    canManageBudget: boolean;
    canManageTables?: boolean;
    canSendInvitations: boolean;
  };
  addedAt: string;
}

export interface EventBudget {
  id: string;
  eventId: string;
  totalBudget: number;
  currency: string;
  updatedAt: string;
}

export interface BudgetCategory {
  id: string;
  eventId: string;
  categoryName: ExpenseCategoryName;
  allocatedAmount: number;
  notes?: string;
}

export type GuestCategory =
  | 'Family'
  | 'Relatives'
  | 'Friends'
  | 'Office/Colleagues'
  | 'Business Associates'
  | 'VIP Guests'
  | 'Others';

export type InvitationStatus = 'Draft' | 'Ready' | 'Sent' | 'Failed';
export type RSVPStatus = 'Pending' | 'Confirmed' | 'Declined';

export interface Guest {
  id: string;
  serialNumber: number;
  eventId: string;
  name: string;
  mobileNumber: string;
  emailAddress: string;
  headCount: number; // expected attendees in this party
  category: GuestCategory;
  invitationStatus: InvitationStatus;
  rsvpStatus: RSVPStatus;
  assignedTableId?: string;
  remarks?: string;
  uniqueToken: string; // for custom RSVP link
  createdAt: string;
  updatedAt: string;
}

export interface GuestEvent {
  id: string;
  guestId: string;
  eventId: string;
  attended?: boolean;
}

export type TableShape = 'Round' | 'Rectangular' | 'Oval' | 'Head Table';

export interface Table {
  id: string;
  eventId: string;
  tableNumber: string;
  tableName: string;
  capacity: number;
  shape: TableShape;
  notes?: string;
}

export interface TableAssignment {
  id: string;
  eventId: string;
  tableId: string;
  guestId: string;
  seatCount: number;
  assignedAt: string;
}

export type ExpenseCategoryName =
  | 'Venue'
  | 'Catering'
  | 'Decoration'
  | 'Photography and videography'
  | 'Clothing'
  | 'Jewellery'
  | 'Invitations and printing'
  | 'Transportation'
  | 'Accommodation'
  | 'Entertainment'
  | 'Gifts'
  | 'Miscellaneous';

export type PaymentMethod = 'Cash' | 'Credit Card' | 'Debit Card' | 'UPI' | 'Bank Transfer' | 'Cheque';
export type PaymentStatus = 'Paid' | 'Pending' | 'Partial';

export interface Expense {
  id: string;
  eventId: string;
  title: string;
  category: ExpenseCategoryName;
  vendorName: string;
  vendorId?: string;
  amount: number;
  paymentDate: string;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  paidBy: string; // name of user or contributor
  paidById?: string;
  receiptUrl?: string;
  remarks?: string;
  createdAt: string;
}

export interface ExpenseCategory {
  id: string;
  name: ExpenseCategoryName;
  color: string;
  iconName: string;
}

export interface Contribution {
  id: string;
  eventId: string;
  contributorName: string;
  contributorId?: string;
  allocatedAmount: number; // pledged/allocated
  amountPaid: number;      // actual paid directly towards expenses
  reimbursementPending: number;
  notes?: string;
  updatedAt: string;
}

export type InvitationTone = 'Formal' | 'Traditional' | 'Modern';
export type InvitationLanguage = 'English' | 'Marathi' | 'Hindi';
export type InvitationTemplateStyle = 'Royal Gold Floral' | 'Minimalist Linear' | 'Modern Vibrant' | 'Traditional Festive';

export interface InvitationTemplate {
  id: string;
  eventId: string;
  style: InvitationTemplateStyle;
  tone: InvitationTone;
  language: InvitationLanguage;
  headline: string;
  subheadline: string;
  bodyTemplate: string;
  closingMessage: string;
  cardBackgroundUrl?: string;
  primaryColor: string;
}

export interface Invitation {
  id: string;
  eventId: string;
  guestId: string;
  templateId?: string;
  personalizedMessage: string;
  channel: 'WhatsApp' | 'Email' | 'Both';
  status: InvitationStatus;
  sentAt?: string;
}

export interface InvitationLog {
  id: string;
  eventId: string;
  guestId: string;
  guestName: string;
  recipientContact: string;
  channel: 'WhatsApp' | 'Email';
  status: 'Sent' | 'Failed' | 'Draft' | 'Delivered';
  subject?: string;
  sentAt: string;
  errorMessage?: string;
}

export interface RSVPResponse {
  id: string;
  eventId: string;
  guestId: string;
  status: RSVPStatus;
  confirmedHeadCount: number;
  dietaryRestrictions?: string;
  guestRemarks?: string;
  submittedAt: string;
}

export interface Vendor {
  id: string;
  eventId: string;
  name: string;
  category: ExpenseCategoryName;
  contactPerson: string;
  phone: string;
  email: string;
  contractAmount: number;
  paidAmount: number;
  rating?: number;
  status: 'Hired' | 'Shortlisted' | 'Completed';
  notes?: string;
}

export interface Attachment {
  id: string;
  eventId: string;
  expenseId?: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  fileUrl: string;
  uploadedAt: string;
}

export interface Notification {
  id: string;
  eventId?: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'alert';
  read: boolean;
  createdAt: string;
}
