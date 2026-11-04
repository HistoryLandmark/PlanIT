import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  User,
  Shield,
  DollarSign,
  Users,
  RotateCcw,
  CheckCircle2,
  Trash2,
  Plus,
  Lock,
  Mail,
  Phone
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useEvent } from '../../context/EventContext.tsx';
import { dbService } from '../../services/db.ts';
import { RoleType } from '../../types/database.ts';

export const SettingsView: React.FC = () => {
  const { currentUser, updateProfile, currency, setCurrency } = useAuth();
  const { activeEvent, refreshData } = useEvent();

  // Profile Form
  const [name, setName] = useState(currentUser?.name || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [memberType, setMemberType] = useState(currentUser?.memberType || 'Event Planner');
  const [relation, setRelation] = useState(currentUser?.relation || '');
  const [profileSuccess, setProfileSuccess] = useState(false);

  // Collaborator Form
  const [newCollabEmail, setNewCollabEmail] = useState('');
  const [newCollabRole, setNewCollabRole] = useState<RoleType>('collaborator');

  const collabs = activeEvent ? dbService.getCollaborators(activeEvent.id) : [];

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({ name, email, phone, memberType: memberType as any, relation });
    setProfileSuccess(true);
    setTimeout(() => setProfileSuccess(false), 3000);
  };

  const handleAddCollaborator = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeEvent || !newCollabEmail.trim()) return;

    dbService.addCollaborator({
      eventId: activeEvent.id,
      userId: `user-${Date.now()}`,
      userName: newCollabEmail.split('@')[0],
      userEmail: newCollabEmail.trim(),
      role: newCollabRole,
      permissions: {
        canEditEvent: newCollabRole === 'admin' || newCollabRole === 'owner',
        canManageGuests: true,
        canManageBudget: newCollabRole === 'admin' || newCollabRole === 'owner',
        canSendInvitations: true,
      },
    });

    setNewCollabEmail('');
    refreshData();
  };

  const handleRemoveCollaborator = (id: string) => {
    if (window.confirm('Remove collaborator from this event?')) {
      dbService.removeCollaborator(id);
      refreshData();
    }
  };

  const handleResetData = () => {
    if (window.confirm('Reset database to clean default sample data? This will restore original demo events and guests.')) {
      dbService.ensureInitialized(true);
      window.location.reload();
    }
  };

  return (
    <div className="space-y-8 pb-12 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-xl font-extrabold tracking-tight text-stone-900 sm:text-2xl">
          System Settings & Permissions
        </h1>
        <p className="mt-1 text-xs text-stone-500">
          Configure profile details, team access privileges, currency preferences, and database integrity.
        </p>
      </div>

      {/* 1. Profile Settings */}
      <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-stone-100 pb-3">
          <User className="h-4 w-4 text-stone-600" />
          <h2 className="text-sm font-bold text-stone-900">User Profile Management</h2>
        </div>

        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-stone-700">Display Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2 text-xs font-medium focus:border-stone-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2 text-xs font-medium focus:border-stone-400 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-stone-700">Mobile Phone</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2 text-xs font-medium focus:border-stone-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700">Account Access Role</label>
              <input
                type="text"
                disabled
                value={currentUser?.role?.toUpperCase() || 'OWNER'}
                className="mt-1 w-full rounded-xl border border-stone-100 bg-stone-50 px-3 py-2 text-xs font-bold text-amber-800"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-stone-700">My Persona / Identity</label>
              <select
                value={memberType}
                onChange={(e) => setMemberType(e.target.value as any)}
                className="mt-1 w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs font-medium focus:border-stone-400 focus:outline-none"
              >
                <option value="Bride">👰 Bride (Primary Celebrant)</option>
                <option value="Groom">🤵 Groom (Primary Celebrant)</option>
                <option value="Bride's Family">🌸 Bride's Family</option>
                <option value="Groom's Family">🎩 Groom's Family</option>
                <option value="Family Member">👨‍👩‍👧 Close Family Member</option>
                <option value="Event Planner">📋 Event Planner / Coordinator</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700">Family Relationship / Specific Title</label>
              <input
                type="text"
                value={relation}
                onChange={(e) => setRelation(e.target.value)}
                placeholder="e.g. Mother of the Bride, Brother, Sister"
                className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2 text-xs font-medium focus:border-stone-400 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            {profileSuccess ? (
              <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
                <CheckCircle2 className="h-4 w-4" />
                Profile updated successfully!
              </span>
            ) : <span />}

            <button
              type="submit"
              className="rounded-xl bg-stone-900 px-5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-stone-800"
            >
              Save Profile Changes
            </button>
          </div>
        </form>
      </div>

      {/* 2. Event Collaborators & Permissions */}
      {activeEvent && (
        <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-stone-600" />
              <div>
                <h2 className="text-sm font-bold text-stone-900">Event Collaborators & Access Roles</h2>
                <p className="text-[11px] text-stone-500">Authorized members for "{activeEvent.name}"</p>
              </div>
            </div>
          </div>

          {/* Add collaborator row */}
          <form onSubmit={handleAddCollaborator} className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <input
              type="email"
              required
              placeholder="Enter collaborator email (e.g. planner@gmail.com)..."
              value={newCollabEmail}
              onChange={(e) => setNewCollabEmail(e.target.value)}
              className="flex-1 rounded-xl border border-stone-200 px-3 py-2 text-xs font-medium focus:border-stone-400 focus:outline-none"
            />
            <select
              value={newCollabRole}
              onChange={(e) => setNewCollabRole(e.target.value as RoleType)}
              className="rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs font-medium focus:border-stone-400 focus:outline-none"
            >
              <option value="collaborator">Collaborator (Guests & Invites)</option>
              <option value="admin">Administrator (Full Access)</option>
              <option value="viewer">Viewer (Read Only)</option>
            </select>
            <button
              type="submit"
              className="flex items-center justify-center gap-1.5 rounded-xl bg-stone-900 px-4 py-2 text-xs font-semibold text-white hover:bg-stone-800"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Member</span>
            </button>
          </form>

          {/* Collaborator List */}
          <div className="divide-y divide-stone-100 border border-stone-100 rounded-2xl overflow-hidden mt-3">
            {collabs.map((collab) => (
              <div key={collab.id} className="flex items-center justify-between p-3 text-xs bg-stone-50/50">
                <div>
                  <div className="font-bold text-stone-900">{collab.userName}</div>
                  <div className="text-[11px] text-stone-500">{collab.userEmail}</div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-bold uppercase text-amber-800">
                    {collab.role}
                  </span>
                  {collab.role !== 'owner' && (
                    <button
                      onClick={() => handleRemoveCollaborator(collab.id)}
                      className="rounded-lg p-1 text-stone-400 hover:text-red-600"
                      title="Remove Member"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Global Currency & Regional Setting */}
      <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-stone-100 pb-3">
          <DollarSign className="h-4 w-4 text-stone-600" />
          <h2 className="text-sm font-bold text-stone-900">Currency & Regional Preferences</h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {['₹', '$', '€', '£'].map((curr) => (
            <button
              key={curr}
              onClick={() => setCurrency(curr)}
              className={`rounded-2xl border p-4 text-center transition ${
                currency === curr
                  ? 'border-stone-900 bg-stone-900 text-white font-bold shadow-md'
                  : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-50'
              }`}
            >
              <span className="font-mono text-2xl font-black">{curr}</span>
              <span className="block text-[10px] mt-1 text-stone-400 uppercase">
                {curr === '₹' ? 'Indian Rupee' : curr === '$' ? 'US Dollar' : curr === '€' ? 'Euro' : 'British Pound'}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 4. Database Reset / Reseed */}
      <div className="rounded-3xl border border-stone-200 bg-stone-50/70 p-6 space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500">Demo Data & Diagnostics</h3>
        <p className="text-xs text-stone-600 leading-relaxed">
          Need to test with fresh sample data? Reseeding will restore the three demo celebration projects (Wedding, Corporate Summit, Birthday Party) with realistic guests, seating charts, and budgets.
        </p>
        <button
          onClick={handleResetData}
          className="flex items-center gap-2 rounded-xl border border-stone-300 bg-white px-4 py-2 text-xs font-semibold text-stone-800 shadow-xs hover:bg-stone-100"
        >
          <RotateCcw className="h-3.5 w-3.5 text-stone-500" />
          <span>Reset Demo Database to Initial Seeds</span>
        </button>
      </div>
    </div>
  );
};
