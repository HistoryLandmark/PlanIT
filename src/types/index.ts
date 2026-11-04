export type UserRole = 'owner' | 'admin' | 'collaborator' | 'viewer';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  avatar?: string;
  organization?: string;
}

export type EventCategory = 
  | 'wedding' 
  | 'engagement' 
  | 'reception' 
  | 'birthday' 
  | 'corporate' 
  | 'family' 
  | 'anniversary' 
  | 'other';

export type EventStatus = 'upcoming' | 'ongoing' | 'completed' | 'archived';

export interface Event {
  id: string;
  name: string;
  category: EventCategory;
  description: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  venueName: string;
  venueAddress: string;
  mapUrl?: string;
  coverImage: string;
  organizerName: string;
  organizerPhone: string;
  organizerEmail: string;
  estimatedBudget: number;
  notes?: string;
  status: EventStatus;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export type GuestCategory = 
  | 'Family' 
  | 'Relatives' 
  | 'Friends' 
  | 'Office/Colleagues' 
  | 'Business Associates' 
  | 'VIP Guests' 
  | 'Others';

export type InvitationStatus = 'Not Sent' | 'Draft' | 'Ready' | 'Sent' | 'Failed';
export type RSVPStatus = 'Pending' | 'Confirmed' | 'Declined';

export interface Guest {
  id: string;
  eventId: string;
  serialNumber: number;
  name: string;
  mobile: string;
  email: string;
  headCount: number; // expected attendees for this party
  category: GuestCategory;
  invitationStatus: InvitationStatus;
  rsvpStatus: RSVPStatus;
  assignedTableId?: string;
  remarks?: string;
  dietaryPreference?: string;
  invitationSentAt?: string;
  rsvpUpdatedAt?: string;
  createdAt: string;
}

export type TableShape = 'round' | 'rectangular';

export interface Table {
  id: string;
  eventId: string;
  tableNumber: string;
  name: string;
  capacity: number;
  shape: TableShape;
  zone: string; // e.g., 'VIP Area', 'Front Lawn', 'Main Ballroom', 'Family Terrace'
  notes?: string;
}

export type ExpenseCategory = 
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

export type PaymentMethod = 'UPI' | 'Cash' | 'Bank Transfer' | 'Credit Card' | 'Cheque';
export type PaymentStatus = 'Paid' | 'Partially Paid' | 'Pending';

export interface Expense {
  id: string;
  eventId: string;
  title: string;
  category: ExpenseCategory;
  vendorName: string;
  amount: number;
  paymentDate: string;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  paidBy: string; // name or user id
  receiptUrl?: string;
  remarks?: string;
  createdAt: string;
}

export interface BudgetCategoryAllocation {
  id: string;
  eventId: string;
  category: ExpenseCategory;
  allocatedAmount: number;
}

export interface Contribution {
  id: string;
  eventId: string;
  personName: string;
  allocatedAmount: number; // amount committed
  contributedAmount: number; // actual cash contributed to pool
  notes?: string;
}

export interface Vendor {
  id: string;
  eventId: string;
  name: string;
  category: ExpenseCategory;
  contactPerson: string;
  phone: string;
  email: string;
  totalQuotation: number;
  paidAmount: number;
  status: 'Contracted' | 'In Discussion' | 'Completed' | 'Pending Payment';
  notes?: string;
}

export type InvitationLanguage = 'English' | 'Marathi' | 'Hindi';
export type InvitationTone = 'Formal' | 'Traditional' | 'Modern';

export interface InvitationLog {
  id: string;
  eventId: string;
  guestId: string;
  guestName: string;
  channel: 'WhatsApp' | 'Email';
  recipient: string;
  status: 'Sent' | 'Ready' | 'Draft' | 'Failed';
  timestamp: string;
  messageSnippet: string;
  details?: string;
}

export interface NotificationItem {
  id: string;
  eventId?: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'alert';
  read: boolean;
  timestamp: string;
}

export interface AppDatabase {
  users: User[];
  events: Event[];
  guests: Guest[];
  tables: Table[];
  expenses: Expense[];
  budgetCategories: BudgetCategoryAllocation[];
  contributions: Contribution[];
  vendors: Vendor[];
  invitationLogs: InvitationLog[];
  notifications: NotificationItem[];
}
