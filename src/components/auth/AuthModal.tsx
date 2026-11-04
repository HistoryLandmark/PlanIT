import React, { useState } from 'react';
import {
  X,
  Lock,
  Mail,
  User as UserIcon,
  CheckCircle2,
  AlertCircle,
  Heart,
  Users,
  Briefcase
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { dbService } from '../../services/db.ts';
import { MemberType } from '../../types/database.ts';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { login, register, switchUser } = useAuth();

  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [memberType, setMemberType] = useState<MemberType>('Bride');
  const [familySide, setFamilySide] = useState<"Bride's Family" | "Groom's Family" | 'Family Member'>("Bride's Family");
  const [relation, setRelation] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const allUsers = dbService.getUsers();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (mode === 'login') {
      const res = await login(email, password);
      if (res.success) {
        onClose();
      } else {
        setErrorMsg(res.message || 'Invalid credentials.');
      }
    } else if (mode === 'register') {
      const effectiveMemberType: MemberType =
        memberType === 'Family Member' ? familySide : memberType;
      const effectiveRole = memberType === 'Event Planner' ? 'admin' : 'owner';
      
      const res = await register(
        name,
        email,
        password,
        effectiveRole,
        effectiveMemberType,
        relation.trim() || (memberType === 'Family Member' ? familySide : memberType)
      );
      if (res.success) {
        onClose();
      } else {
        setErrorMsg(res.message || 'Registration failed.');
      }
    } else if (mode === 'forgot') {
      setSuccessMsg(`Password reset instructions have been dispatched to ${email}.`);
      setTimeout(() => {
        setMode('login');
        setSuccessMsg(null);
      }, 3000);
    }
  };

  const handleSelectDemoUser = (userId: string) => {
    switchUser(userId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 p-4 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-md rounded-3xl border border-stone-200 bg-white p-6 shadow-2xl space-y-4 my-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-stone-900 text-amber-400 shadow-xs">
              {mode === 'register' ? <Heart className="h-4 w-4 text-rose-400" /> : <Lock className="h-4 w-4" />}
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-900">
                {mode === 'login'
                  ? 'Sign In to PlanIT'
                  : mode === 'register'
                  ? 'Create Your Account'
                  : 'Reset Password'}
              </h3>
              <p className="text-[11px] text-stone-500">
                {mode === 'register'
                  ? 'Select your identity (Bride, Groom, Family, Planner)'
                  : 'Secure access & event collaboration'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1 text-stone-400 hover:bg-stone-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Feedback Alert */}
        {errorMsg && (
          <div className="flex items-center gap-2 rounded-xl bg-red-50 p-3 text-xs text-red-700">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
            <span>{errorMsg}</span>
          </div>
        )}
        {successMsg && (
          <div className="flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-xs text-emerald-700">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === 'register' && (
            <>
              {/* Persona / Member Type Selection */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  I am registering as:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setMemberType('Bride')}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-semibold transition text-left ${
                      memberType === 'Bride'
                        ? 'border-rose-400 bg-rose-50 text-rose-900 ring-2 ring-rose-200'
                        : 'border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-700'
                    }`}
                  >
                    <span className="text-base">👰</span>
                    <div>
                      <div className="font-bold">Bride</div>
                      <div className="text-[10px] text-stone-500 font-normal">Primary Celebrant</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMemberType('Groom')}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-semibold transition text-left ${
                      memberType === 'Groom'
                        ? 'border-indigo-400 bg-indigo-50 text-indigo-900 ring-2 ring-indigo-200'
                        : 'border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-700'
                    }`}
                  >
                    <span className="text-base">🤵</span>
                    <div>
                      <div className="font-bold">Groom</div>
                      <div className="text-[10px] text-stone-500 font-normal">Primary Celebrant</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMemberType('Family Member')}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-semibold transition text-left ${
                      memberType === 'Family Member'
                        ? 'border-amber-400 bg-amber-50 text-amber-900 ring-2 ring-amber-200'
                        : 'border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-700'
                    }`}
                  >
                    <span className="text-base">👨‍👩‍👧</span>
                    <div>
                      <div className="font-bold">Family Member</div>
                      <div className="text-[10px] text-stone-500 font-normal">Bride / Groom's family</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMemberType('Event Planner')}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-semibold transition text-left ${
                      memberType === 'Event Planner'
                        ? 'border-stone-900 bg-stone-100 text-stone-900 ring-2 ring-stone-300'
                        : 'border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-700'
                    }`}
                  >
                    <span className="text-base">📋</span>
                    <div>
                      <div className="font-bold">Event Planner</div>
                      <div className="text-[10px] text-stone-500 font-normal">Organizer / Coordinator</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* If Family Member selected: Side & Relation */}
              {memberType === 'Family Member' && (
                <div className="p-3 bg-amber-50/60 rounded-2xl border border-amber-200/80 space-y-2.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-amber-900 mb-1">
                      Which side of the family?
                    </label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setFamilySide("Bride's Family")}
                        className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-medium border transition ${
                          familySide === "Bride's Family"
                            ? 'bg-rose-500 text-white border-rose-500 shadow-xs'
                            : 'bg-white text-stone-700 border-amber-200 hover:bg-amber-100'
                        }`}
                      >
                        Bride's Side
                      </button>
                      <button
                        type="button"
                        onClick={() => setFamilySide("Groom's Family")}
                        className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-medium border transition ${
                          familySide === "Groom's Family"
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                            : 'bg-white text-stone-700 border-amber-200 hover:bg-amber-100'
                        }`}
                      >
                        Groom's Side
                      </button>
                      <button
                        type="button"
                        onClick={() => setFamilySide('Family Member')}
                        className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-medium border transition ${
                          familySide === 'Family Member'
                            ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                            : 'bg-white text-stone-700 border-amber-200 hover:bg-amber-100'
                        }`}
                      >
                        Close Relative
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-amber-900 mb-1">
                      Relationship / Role (Optional)
                    </label>
                    <input
                      type="text"
                      value={relation}
                      onChange={(e) => setRelation(e.target.value)}
                      placeholder="e.g. Mother of Bride, Brother, Sister, Uncle"
                      className="w-full rounded-xl border border-amber-200 bg-white px-3 py-1.5 text-xs text-stone-800 focus:border-amber-400 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-stone-700">Full Name *</label>
                <div className="relative mt-1">
                  <UserIcon className="absolute left-3 top-2.5 h-4 w-4 text-stone-400" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={
                      memberType === 'Bride'
                        ? 'e.g. Ananya Sharma'
                        : memberType === 'Groom'
                        ? 'e.g. Rohan Kapoor'
                        : memberType === 'Family Member'
                        ? 'e.g. Meera Sharma (Mother)'
                        : 'e.g. Vikram Malhotra'
                    }
                    className="w-full rounded-xl border border-stone-200 pl-9 pr-3 py-2 text-xs font-medium focus:border-stone-400 focus:outline-none"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-semibold text-stone-700">Email Address *</label>
            <div className="relative mt-1">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-stone-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@domain.com"
                className="w-full rounded-xl border border-stone-200 pl-9 pr-3 py-2 text-xs font-medium focus:border-stone-400 focus:outline-none"
              />
            </div>
          </div>

          {mode !== 'forgot' && (
            <div>
              <label className="block text-xs font-semibold text-stone-700">Password</label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-stone-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-stone-200 pl-9 pr-3 py-2 text-xs font-medium focus:border-stone-400 focus:outline-none"
                />
              </div>
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              className="w-full rounded-xl bg-stone-900 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-stone-800 transition flex items-center justify-center gap-1.5"
            >
              <span>
                {mode === 'login'
                  ? 'Sign In'
                  : mode === 'register'
                  ? `Create Account as ${memberType}`
                  : 'Send Reset Link'}
              </span>
            </button>
          </div>
        </form>

        {/* Toggle Links */}
        <div className="flex items-center justify-between text-xs text-stone-500 pt-1">
          {mode === 'login' ? (
            <>
              <button
                type="button"
                onClick={() => setMode('forgot')}
                className="hover:text-stone-900 hover:underline"
              >
                Forgot password?
              </button>
              <button
                type="button"
                onClick={() => setMode('register')}
                className="font-bold text-stone-900 hover:underline"
              >
                New user? Register
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setMode('login')}
              className="text-stone-900 font-bold hover:underline mx-auto"
            >
              Back to Sign In
            </button>
          )}
        </div>

        {/* Quick Demo Switcher Section */}
        <div className="border-t border-stone-100 pt-3">
          <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block mb-2">
            Or Click to Switch Demo Persona
          </span>
          <div className="space-y-1.5">
            {allUsers.map((u) => (
              <button
                key={u.id}
                type="button"
                onClick={() => handleSelectDemoUser(u.id)}
                className="flex w-full items-center justify-between rounded-xl border border-stone-100 bg-stone-50/70 p-2 text-left text-xs transition hover:bg-stone-100"
              >
                <div className="flex items-center gap-2">
                  <img src={u.avatarUrl} alt={u.name} className="h-6 w-6 rounded-lg object-cover" />
                  <div>
                    <span className="font-bold text-stone-900">{u.name}</span>
                    <span className="block text-[10px] text-stone-500">{u.email}</span>
                  </div>
                </div>
                <span className="rounded bg-stone-200 px-1.5 py-0.5 text-[9px] font-bold uppercase text-stone-700">
                  {u.role}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
