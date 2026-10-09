import React, { useState, useEffect } from 'react';
import { 
  X, 
  LogIn, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  Check, 
  Sparkles, 
  ShieldCheck, 
  ShieldAlert,
  ArrowRight,
  User
} from 'lucide-react';
import { FamilyMember, SentInviteEmail } from '../types/family';

interface MemberLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  members: FamilyMember[];
  activeMemberId: string;
  initialEmail?: string;
  onLoginSuccess: (memberId: string) => void;
  onOpenEmailPreview?: (emailData: SentInviteEmail) => void;
  sentInviteEmails?: SentInviteEmail[];
}

export const MemberLoginModal: React.FC<MemberLoginModalProps> = ({
  isOpen,
  onClose,
  members,
  activeMemberId,
  initialEmail = '',
  onLoginSuccess,
  onOpenEmailPreview,
  sentInviteEmails = [],
}) => {
  const [emailInput, setEmailInput] = useState(initialEmail);
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<string | null>(null);

  useEffect(() => {
    if (initialEmail) {
      setEmailInput(initialEmail);
      // Auto prefill password if we have a matching sent invite email for quick testing convenience
      const invite = sentInviteEmails.find(
        (i) => i.recipientEmail.toLowerCase() === initialEmail.toLowerCase()
      );
      if (invite) {
        setPasswordInput(invite.loginPassword);
      }
    }
  }, [initialEmail, sentInviteEmails, isOpen]);

  if (!isOpen) return null;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessInfo(null);

    const cleanInput = emailInput.trim().toLowerCase();
    if (!cleanInput) {
      setErrorMsg('Please enter your email or member name.');
      return;
    }

    // Match member by email or name or id
    const foundMember = members.find(
      (m) =>
        (m.email && m.email.toLowerCase() === cleanInput) ||
        m.name.toLowerCase() === cleanInput ||
        m.id.toLowerCase() === cleanInput
    );

    if (!foundMember) {
      setErrorMsg(`No family member found matching "${emailInput}". Please check your email or ask the admin for an invite.`);
      return;
    }

    // Check password: either foundMember.password, or default 'family123' / 'admin'
    const expectedPassword = foundMember.password || (foundMember.isAdmin ? 'admin' : 'family123');
    
    // Check invite email log for any updated password
    const invite = sentInviteEmails.find((inv) => inv.memberId === foundMember.id);
    const validPasswords = [expectedPassword];
    if (invite) validPasswords.push(invite.loginPassword);
    if (foundMember.isAdmin) validPasswords.push('admin');

    if (!validPasswords.includes(passwordInput.trim())) {
      setErrorMsg(`Incorrect password for ${foundMember.name}. Please enter the password sent to ${foundMember.email || 'your email'}.`);
      return;
    }

    // Login successful
    if (foundMember.hasChatAccess) {
      setSuccessInfo(`Welcome, ${foundMember.name}! You are now logged in with full chat access.`);
    } else {
      setSuccessInfo(`Signed in as ${foundMember.name}. Notice: Chat messaging is restricted until granted by Admin.`);
    }

    setTimeout(() => {
      onLoginSuccess(foundMember.id);
      onClose();
    }, 700);
  };

  const handleQuickSelectMember = (member: FamilyMember) => {
    setEmailInput(member.email || member.name);
    const invite = sentInviteEmails.find((inv) => inv.memberId === member.id);
    setPasswordInput(member.password || invite?.loginPassword || (member.isAdmin ? 'admin' : 'family123'));
    setErrorMsg(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/65 backdrop-blur-sm p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col">
        
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-bold shadow-xs">
              <LogIn className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 font-display">
                Family Member Sign In
              </h3>
              <p className="text-xs text-slate-500">
                Log in with credentials received in your invite email
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successInfo && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-start gap-2.5">
              <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{successInfo}</span>
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Email Address or Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="e.g. sarah.mom@kinfolk.family or Name"
                  className="w-full px-3.5 py-2.5 pl-10 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
                  required
                  autoFocus
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Password / Access Passcode
                </label>
                {sentInviteEmails.length > 0 && onOpenEmailPreview && (
                  <button
                    type="button"
                    onClick={() => {
                      const latest = sentInviteEmails[sentInviteEmails.length - 1];
                      if (latest) onOpenEmailPreview(latest);
                    }}
                    className="text-[11px] text-emerald-600 hover:text-emerald-800 hover:underline font-semibold"
                  >
                    View invite email credentials
                  </button>
                )}
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="Enter your invite password"
                  className="w-full px-3.5 py-2.5 pl-10 pr-10 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
                  required
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-bold shadow-md transition-transform active:scale-98"
            >
              <span>Log In to Family Chat</span>
              <ArrowRight className="w-4 h-4 text-emerald-400" />
            </button>
          </form>

          {/* Quick Test Profiles for Tester */}
          <div className="pt-4 border-t border-slate-100 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Quick Test Accounts (Click to Fill)
              </span>
              <span className="text-[10px] text-slate-400">
                Password auto-fills
              </span>
            </div>

            <div className="grid grid-cols-2 gap-1.5 max-h-36 overflow-y-auto pr-1">
              {members.map((m) => {
                const isActive = m.id === activeMemberId;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => handleQuickSelectMember(m)}
                    className={`flex items-center gap-2 p-2 rounded-xl border text-left transition-all ${
                      isActive
                        ? 'border-emerald-300 bg-emerald-50/70 text-slate-900'
                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0 ${m.avatarColor}`}>
                      {m.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold truncate leading-tight">
                        {m.name}
                      </p>
                      <p className="text-[10px] text-slate-400 truncate">
                        {m.hasChatAccess ? 'Can chat' : 'Restricted'}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
