import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, RoleType, MemberType } from '../types/database.ts';
import { dbService } from '../services/db.ts';

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  login: (email: string, password?: string) => Promise<{ success: boolean; message?: string }>;
  register: (
    name: string,
    email: string,
    password?: string,
    role?: RoleType,
    memberType?: MemberType,
    relation?: string
  ) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => void;
  switchUser: (userId: string) => void;
  hasPermission: (eventId: string, permission: 'edit' | 'guests' | 'budget' | 'invitations') => boolean;
  canAccessEvent: (eventId: string) => boolean;
  currency: string;
  setCurrency: (symbol: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currency, setCurrencyState] = useState<string>('₹');

  useEffect(() => {
    const loadUser = () => {
      const activeId = dbService.getActiveUserId();
      const user = dbService.getUserById(activeId) || dbService.getUsers()[0] || null;
      setCurrentUser(user);
      setCurrencyState(dbService.getCurrency());
    };

    loadUser();
    const unsubscribe = dbService.subscribe(loadUser);
    return () => {
      unsubscribe();
    };
  }, []);

  const login = async (email: string, _password?: string): Promise<{ success: boolean; message?: string }> => {
    const users = dbService.getUsers();
    const found = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (found) {
      dbService.setActiveUserId(found.id);
      setCurrentUser(found);
      return { success: true };
    }
    return { success: false, message: 'Invalid credentials. User with this email not found.' };
  };

  const register = async (
    name: string,
    email: string,
    _password?: string,
    role: RoleType = 'owner',
    memberType: MemberType = 'Event Planner',
    relation?: string
  ): Promise<{ success: boolean; message?: string }> => {
    const users = dbService.getUsers();
    const existing = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      return { success: false, message: 'An account with this email already exists.' };
    }

    const newUser: User = {
      id: `user-${Date.now()}`,
      name,
      email,
      role,
      memberType,
      relation,
      avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
      createdAt: new Date().toISOString(),
    };
    dbService.saveUser(newUser);
    dbService.setActiveUserId(newUser.id);
    setCurrentUser(newUser);
    return { success: true };
  };

  const logout = () => {
    // For demo / multi-user mode, switch to guest or first user
    const users = dbService.getUsers();
    const nextUser = users.find((u) => u.id !== currentUser?.id) || users[0];
    if (nextUser) {
      dbService.setActiveUserId(nextUser.id);
      setCurrentUser(nextUser);
    }
  };

  const updateProfile = (updates: Partial<User>) => {
    if (!currentUser) return;
    const updated = { ...currentUser, ...updates };
    dbService.saveUser(updated);
    setCurrentUser(updated);
  };

  const switchUser = (userId: string) => {
    const user = dbService.getUserById(userId);
    if (user) {
      dbService.setActiveUserId(user.id);
      setCurrentUser(user);
    }
  };

  const setCurrency = (symbol: string) => {
    dbService.setCurrency(symbol);
    setCurrencyState(symbol);
  };

  const canAccessEvent = (eventId: string): boolean => {
    if (!currentUser) return false;
    if (currentUser.role === 'owner') return true; // Super owner / admin can access all
    const collabs = dbService.getCollaborators(eventId);
    return collabs.some((c) => c.userId === currentUser.id);
  };

  const hasPermission = (eventId: string, permission: 'edit' | 'guests' | 'budget' | 'invitations'): boolean => {
    if (!currentUser) return false;
    if (currentUser.role === 'owner') return true;

    const event = dbService.getEventById(eventId);
    if (event && event.ownerId === currentUser.id) return true;

    const collabs = dbService.getCollaborators(eventId);
    const member = collabs.find((c) => c.userId === currentUser.id);
    if (!member) return false;
    if (member.role === 'owner' || member.role === 'admin') return true;

    switch (permission) {
      case 'edit': return member.permissions.canEditEvent;
      case 'guests': return member.permissions.canManageGuests;
      case 'budget': return member.permissions.canManageBudget;
      case 'invitations': return member.permissions.canSendInvitations;
      default: return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated: !!currentUser,
        login,
        register,
        logout,
        updateProfile,
        switchUser,
        hasPermission,
        canAccessEvent,
        currency,
        setCurrency,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
