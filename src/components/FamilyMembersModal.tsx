import React, { useState, useEffect } from 'react';
import { 
  X, 
  Battery, 
  MapPin, 
  Phone, 
  Calendar, 
  UserCheck, 
  Plus, 
  Sparkles, 
  Smile, 
  Shield, 
  ShieldCheck, 
  ShieldAlert, 
  Lock, 
  Unlock, 
  Check, 
  Trash2, 
  KeyRound,
  Mail,
  RefreshCw,
  Eye,
  EyeOff,
  Copy,
  ExternalLink,
  Send,
  LogIn,
  PartyPopper,
  CheckCircle2,
  BarChart2
} from 'lucide-react';
import { FamilyMember, SentInviteEmail } from '../types/family';
import { FamilyEngagementAnalytics } from './FamilyEngagementAnalytics';

interface FamilyMembersModalProps {
  isOpen: boolean;
  onClose: () => void;
  members: FamilyMember[];
  activeMemberId: string;
  onSelectActiveMember: (id: string) => void;
  onUpdateMember: (updated: FamilyMember) => void;
  onAddMember: (newMember: Omit<FamilyMember, 'id'>, sentEmail?: SentInviteEmail) => void;
  onToggleChatAccess: (memberId: string) => void;
  onDeleteMember: (memberId: string) => void;
  isAdminLoggedIn: boolean;
  onOpenAdminLogin: () => void;
  onAdminLogout: () => void;
  onOpenDailyCheckIn?: () => void;
  sentInviteEmails?: SentInviteEmail[];
  onOpenEmailPreview?: (email: SentInviteEmail) => void;
  onOpenMemberLoginModal?: (prefilledEmail?: string) => void;
  initialTab?: 'members' | 'register' | 'invites' | 'analytics';
  onTestLoginAsMember?: (memberId: string) => void;
}

export const FamilyMembersModal: React.FC<FamilyMembersModalProps> = ({
  isOpen,
  onClose,
  members,
  activeMemberId,
  onSelectActiveMember,
  onUpdateMember,
  onAddMember,
  onToggleChatAccess,
  onDeleteMember,
  isAdminLoggedIn,
  onOpenAdminLogin,
  onAdminLogout,
  onOpenDailyCheckIn,
  sentInviteEmails = [],
  onOpenEmailPreview,
  onOpenMemberLoginModal,
  initialTab = 'members',
  onTestLoginAsMember,
}) => {
  const [activeTab, setActiveTab] = useState<'members' | 'register' | 'invites' | 'analytics'>(initialTab);
  const [isEditingSelf, setIsEditingSelf] = useState(false);

  // Sync initialTab when modal opens
  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  const activeMember = members.find((m) => m.id === activeMemberId) || members[0];
  const mainMember = members.find((m) => m.isAdmin) || members[0];

  // Edit status states
  const [statusText, setStatusText] = useState(activeMember.status);
  const [statusEmoji, setStatusEmoji] = useState(activeMember.statusEmoji);
  const [locationText, setLocationText] = useState(activeMember.location || '');

  // Helper to generate a friendly, secure temporary password
  const generatePassword = () => {
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    return `Kinfolk-${randomDigits}`;
  };

  // Add member states
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState(generatePassword);
  const [showPassword, setShowPassword] = useState(true);
  const [newRelationship, setNewRelationship] = useState('');
  const [newHometown, setNewHometown] = useState('');
  const [newColor, setNewColor] = useState('bg-teal-500');
  const [grantImmediateAccess, setGrantImmediateAccess] = useState(true);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Congratulatory registration success state
  const [registrationSuccessData, setRegistrationSuccessData] = useState<{
    memberName: string;
    email: string;
    password: string;
    hasChatAccess: boolean;
    memberId: string;
    sentEmail: SentInviteEmail;
  } | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSaveStatus = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateMember({
      ...activeMember,
      status: statusText,
      statusEmoji,
      location: locationText,
    });
    setIsEditingSelf(false);
  };

  const handleCreateMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newRole.trim()) return;

    const emailToSend = newEmail.trim() || `${newName.trim().toLowerCase().replace(/\s+/g, '.')}@kinfolk.family`;
    const passwordToUse = newPassword.trim() || generatePassword();
    const tempMemberId = `member-${Date.now()}`;

    const newMemberData: Omit<FamilyMember, 'id'> = {
      name: newName.trim(),
      role: newRole.trim(),
      email: emailToSend,
      password: passwordToUse,
      relationship: newRelationship.trim() || newRole.trim(),
      hometown: newHometown.trim() || undefined,
      avatarColor: newColor,
      status: 'Joined the family circle',
      statusEmoji: '👋',
      moodEmoji: '😊',
      shortStatus: 'At Home',
      lastCheckInTime: 'Just registered',
      batteryLevel: 100,
      location: newHometown.trim() || 'Home',
      isOnline: true,
      isAdmin: false,
      hasChatAccess: grantImmediateAccess,
      accessGrantedAt: grantImmediateAccess ? new Date().toISOString() : undefined,
      accessGrantedBy: grantImmediateAccess ? mainMember.name : undefined,
      inviteSentAt: new Date().toLocaleString(),
      inviteEmailSentTo: emailToSend,
    };

    const sentEmail: SentInviteEmail = {
      id: `email-${Date.now()}`,
      memberId: tempMemberId,
      memberName: newName.trim(),
      recipientEmail: emailToSend,
      subject: `🏡 Welcome to the Kinfolk Family Chat — Your Login Credentials`,
      loginPassword: passwordToUse,
      sentAt: new Date().toLocaleString([], { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      sentByAdminName: mainMember.name,
      hasChatAccess: grantImmediateAccess,
      status: 'delivered',
    };

    onAddMember(newMemberData, sentEmail);

    // Set celebratory congratulatory feedback
    setRegistrationSuccessData({
      memberName: newName.trim(),
      email: emailToSend,
      password: passwordToUse,
      hasChatAccess: grantImmediateAccess,
      memberId: tempMemberId,
      sentEmail,
    });

    // Reset registration form inputs
    setNewName('');
    setNewRole('');
    setNewEmail('');
    setNewRelationship('');
    setNewHometown('');
    setNewPassword(generatePassword());
  };

  const colors = [
    { label: 'Teal', class: 'bg-teal-500' },
    { label: 'Indigo', class: 'bg-indigo-500' },
    { label: 'Orange', class: 'bg-orange-500' },
    { label: 'Pink', class: 'bg-pink-500' },
    { label: 'Violet', class: 'bg-violet-500' },
    { label: 'Cyan', class: 'bg-cyan-500' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/65 backdrop-blur-sm p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div>
            <h3 className="text-base font-bold text-slate-900 font-display flex items-center gap-2">
              <span>Family Circle & Member Access</span>
              {isAdminLoggedIn ? (
                <span className="text-[10px] bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" /> Admin Mode
                </span>
              ) : (
                <span className="text-[10px] bg-slate-100 text-slate-600 border border-slate-200 font-medium px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Lock className="w-3 h-3 text-slate-400" /> Member View
                </span>
              )}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Register family members, dispatch login credentials via email, and manage chat permissions
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="px-6 pt-3 pb-1 border-b border-slate-100 flex items-center gap-2 bg-white">
          <button
            onClick={() => {
              setActiveTab('members');
              setRegistrationSuccessData(null);
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              activeTab === 'members'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <span>Family Members</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${activeTab === 'members' ? 'bg-slate-700 text-white' : 'bg-slate-100 text-slate-600'}`}>
              {members.length}
            </span>
          </button>

          <button
            onClick={() => {
              setActiveTab('register');
              setRegistrationSuccessData(null);
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              activeTab === 'register'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Plus className="w-3.5 h-3.5 text-emerald-500" />
            <span>Register & Invite</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('invites');
              setRegistrationSuccessData(null);
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              activeTab === 'invites'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Mail className="w-3.5 h-3.5 text-amber-500" />
            <span>Sent Credentials Emails</span>
            {sentInviteEmails.length > 0 && (
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${activeTab === 'invites' ? 'bg-slate-700 text-white' : 'bg-amber-100 text-amber-800 font-bold'}`}>
                {sentInviteEmails.length}
              </span>
            )}
          </button>

          <button
            onClick={() => {
              setActiveTab('analytics');
              setRegistrationSuccessData(null);
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              activeTab === 'analytics'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5 text-indigo-400" />
            <span>Engagement Analytics</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* TAB 1: MEMBERS LIST */}
          {activeTab === 'members' && (
            <>
              {/* Quick Analytics Insight Banner */}
              <div className="p-3.5 bg-gradient-to-r from-indigo-50/90 via-white to-emerald-50/90 border border-indigo-100 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-500/15 text-indigo-700 flex items-center justify-center shrink-0">
                    <BarChart2 className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 flex items-center gap-2">
                      <span>Family Engagement & Check-in Pulse</span>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.2 rounded-md">
                        49 check-ins • 100% active
                      </span>
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Visual charts displaying check-in frequency and active members across weeks
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab('analytics')}
                  className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shrink-0 flex items-center justify-center gap-1.5 shadow-2xs transition-colors self-start sm:self-center"
                >
                  <BarChart2 className="w-3.5 h-3.5" />
                  <span>View Charts</span>
                </button>
              </div>

              {/* Main Member Admin Status Banner */}
              <div className="p-4 rounded-2xl border transition-all bg-gradient-to-r from-slate-900 to-slate-800 text-white shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold shrink-0">
                      <Shield className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                          Family Circle Administrator
                        </h4>
                        <span className="text-[10px] bg-emerald-400/20 text-emerald-300 border border-emerald-400/30 px-2 py-0.5 rounded-full font-semibold">
                          Main Member
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-white mt-0.5">
                        {mainMember.name} ({mainMember.relationship || mainMember.role})
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {isAdminLoggedIn ? (
                      <button
                        onClick={onAdminLogout}
                        className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium transition-colors border border-slate-700"
                      >
                        Exit Admin
                      </button>
                    ) : (
                      <button
                        onClick={onOpenAdminLogin}
                        className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-900 font-bold text-xs shadow-xs transition-colors"
                      >
                        Log in as Admin
                      </button>
                    )}

                    <button
                      onClick={() => setActiveTab('register')}
                      className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs shadow-xs transition-colors flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Register Member</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Members List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                    Family Members ({members.length})
                  </h4>
                  <span className="text-[11px] text-slate-400">
                    Switch profile or manage chat access
                  </span>
                </div>

                <div className="space-y-2">
                  {members.map((member) => {
                    const isActive = member.id === activeMemberId;
                    const isFamilyMainAdmin = member.isAdmin;

                    return (
                      <div
                        key={member.id}
                        className={`p-3.5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                          isActive
                            ? 'bg-emerald-50/50 border-emerald-300 ring-1 ring-emerald-300/50 shadow-2xs'
                            : 'bg-white border-slate-200/90 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-start gap-3 min-w-0">
                          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-2xs ${member.avatarColor}`}>
                            {member.name.charAt(0)}
                          </div>
                          
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm font-bold text-slate-900">
                                {member.name}
                              </span>
                              {isFamilyMainAdmin && (
                                <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.2 rounded-full">
                                  Admin 🛡️
                                </span>
                              )}
                              <span className="text-xs text-slate-500">
                                ({member.relationship || member.role})
                              </span>
                            </div>

                            {member.email && (
                              <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5 font-mono">
                                <Mail className="w-3 h-3 text-slate-400" />
                                <span>{member.email}</span>
                              </p>
                            )}

                            {/* Status & Access Badge */}
                            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-1">
                              {member.hasChatAccess ? (
                                <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md font-semibold flex items-center gap-1">
                                  <Unlock className="w-3 h-3 text-emerald-600" />
                                  <span>Chat Access Granted</span>
                                </span>
                              ) : (
                                <span className="text-[10px] text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-md font-semibold flex items-center gap-1">
                                  <Lock className="w-3 h-3 text-rose-600" />
                                  <span>Chat Access Suspended</span>
                                </span>
                              )}

                              {member.location && (
                                <span className="hidden sm:flex items-center gap-1 text-slate-400">
                                  <MapPin className="w-3 h-3 text-slate-400" />
                                  <span>{member.location}</span>
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Actions Zone */}
                        <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                          {/* Admin Toggle for Chat Access */}
                          {isAdminLoggedIn && !isFamilyMainAdmin && (
                            <button
                              onClick={() => onToggleChatAccess(member.id)}
                              className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-colors flex items-center gap-1 ${
                                member.hasChatAccess
                                  ? 'border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100'
                                  : 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                              }`}
                              title={member.hasChatAccess ? 'Suspend chat access' : 'Grant chat access'}
                            >
                              {member.hasChatAccess ? (
                                <>
                                  <Lock className="w-3 h-3" />
                                  <span>Revoke</span>
                                </>
                              ) : (
                                <>
                                  <Unlock className="w-3 h-3" />
                                  <span>Grant Access</span>
                                </>
                              )}
                            </button>
                          )}

                          {/* Delete member (admin only) */}
                          {isAdminLoggedIn && !isFamilyMainAdmin && (
                            <button
                              onClick={() => onDeleteMember(member.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              title="Remove from family circle"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Profile switch trigger */}
                          {isActive ? (
                            <span className="px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-semibold flex items-center gap-1">
                              <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                              <span>Current</span>
                            </span>
                          ) : (
                            <button
                              onClick={() => onSelectActiveMember(member.id)}
                              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-colors"
                            >
                              Chat as {member.name.split(' ')[0]}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {/* TAB 2: REGISTER NEW MEMBER & DISPATCH CREDENTIALS */}
          {activeTab === 'register' && (
            <div className="space-y-5">
              {registrationSuccessData ? (
                <div className="relative p-6 sm:p-7 rounded-3xl border-2 border-emerald-500/50 bg-gradient-to-b from-emerald-50/80 via-white to-amber-50/40 space-y-5 overflow-hidden animate-celebration-pop shadow-xl shadow-emerald-500/5">
                  {/* Floating Confetti Particles */}
                  <div className="absolute top-0 inset-x-0 h-16 pointer-events-none overflow-hidden">
                    <div className="absolute top-2 left-6 w-2 h-2 rounded-xs bg-emerald-400 rotate-45 animate-bounce" />
                    <div className="absolute top-4 left-1/4 w-2.5 h-1.5 rounded-xs bg-amber-400 rotate-12 animate-pulse" />
                    <div className="absolute top-1 left-1/2 w-2 h-2 rounded-xs bg-indigo-400 -rotate-45 animate-bounce" />
                    <div className="absolute top-3 right-1/4 w-2 h-2.5 rounded-xs bg-rose-400 rotate-90 animate-pulse" />
                    <div className="absolute top-2 right-8 w-2.5 h-1.5 rounded-xs bg-teal-400 rotate-30 animate-bounce" />
                  </div>

                  {/* Top Congratulatory Header */}
                  <div className="text-center space-y-2 relative z-10">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-3xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 shadow-lg shadow-emerald-500/30 mx-auto">
                      <PartyPopper className="w-7 h-7 text-slate-950" />
                    </div>

                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-700 bg-emerald-100/90 border border-emerald-300 px-3 py-0.5 rounded-full inline-block mb-1">
                        🎉 Congratulatory Notice
                      </span>
                      <h4 className="text-lg sm:text-xl font-extrabold text-slate-900 font-display">
                        Family Member Registered Successfully!
                      </h4>
                      <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto mt-1">
                        The welcome email containing login credentials has been sent to{' '}
                        <span className="font-bold text-slate-900 underline decoration-emerald-500 underline-offset-2">
                          {registrationSuccessData.email}
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Dispatched Credentials Recap Card */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-3 relative z-10">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        <span>Generated Member Account Details</span>
                      </span>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>Email Dispatched</span>
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Family Member</span>
                        <span className="font-bold text-slate-900 text-sm">{registrationSuccessData.memberName}</span>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Recipient Email</span>
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-slate-800 truncate mr-1">{registrationSuccessData.email}</span>
                          <button
                            type="button"
                            onClick={() => handleCopy(registrationSuccessData.email, 'succ-email')}
                            className="text-slate-400 hover:text-slate-700 p-1"
                            title="Copy email"
                          >
                            {copiedKey === 'succ-email' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Login Password</span>
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-amber-900 text-sm">{registrationSuccessData.password}</span>
                          <button
                            type="button"
                            onClick={() => handleCopy(registrationSuccessData.password, 'succ-pwd')}
                            className="text-slate-400 hover:text-slate-700 p-1"
                            title="Copy password"
                          >
                            {copiedKey === 'succ-pwd' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex flex-col justify-center">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Chat Messaging Permission</span>
                        <span className="text-emerald-700 font-bold flex items-center gap-1">
                          <Unlock className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{registrationSuccessData.hasChatAccess ? 'Granted (Full Chat Access)' : 'Pending Approval'}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action Controls */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 relative z-10">
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      {onOpenEmailPreview && (
                        <button
                          type="button"
                          onClick={() => {
                            onOpenEmailPreview(registrationSuccessData.sentEmail);
                          }}
                          className="flex-1 sm:flex-initial px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-md transition-colors"
                        >
                          <Mail className="w-3.5 h-3.5 text-emerald-400" />
                          <span>View Sent Email (Inbox)</span>
                        </button>
                      )}

                      {onTestLoginAsMember && (
                        <button
                          type="button"
                          onClick={() => {
                            onTestLoginAsMember(registrationSuccessData.memberId);
                            onClose();
                          }}
                          className="flex-1 sm:flex-initial px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-500/20 transition-all active:scale-98"
                        >
                          <LogIn className="w-3.5 h-3.5 text-slate-950" />
                          <span>Test Login Now</span>
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                      <button
                        type="button"
                        onClick={() => setRegistrationSuccessData(null)}
                        className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
                      >
                        ➕ Register Another
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setRegistrationSuccessData(null);
                          setActiveTab('members');
                        }}
                        className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                      >
                        Done (View Members)
                      </button>
                    </div>
                  </div>
                </div>
              ) : !isAdminLoggedIn ? (
                <div className="p-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 flex flex-col items-center justify-center text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center">
                    <ShieldAlert className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">
                      Admin Login Required to Register Members
                    </h4>
                    <p className="text-xs text-slate-500 max-w-sm mt-1">
                      Only the family admin ({mainMember.name}) has authorization to register new members, generate credentials, and send invitation emails.
                    </p>
                  </div>
                  <button
                    onClick={onOpenAdminLogin}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
                  >
                    Log In as Admin ({mainMember.name})
                  </button>
                </div>
              ) : (
                <form onSubmit={handleCreateMember} className="p-5 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-4">
                  <div className="border-b border-slate-200/80 pb-3">
                    <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Mail className="w-4 h-4 text-emerald-600" />
                      <span>Register Family Member & Send Login Credentials</span>
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      The family member will receive an invitation email containing their login email, temporary password, and chat access permissions.
                    </p>
                  </div>

                  {/* Step 1: Member Info */}
                  <div className="space-y-3">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Step 1: Family Member Identity
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Sarah Jenkins or Cousin Leo"
                          value={newName}
                          onChange={(e) => setNewName(e.target.value)}
                          className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                          autoFocus
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Family Role / Title *
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Sister, Uncle, Grandma"
                          value={newRole}
                          onChange={(e) => setNewRole(e.target.value)}
                          className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Relationship / Branch
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Eldest Daughter, Cousin on Mom's side"
                          value={newRelationship}
                          onChange={(e) => setNewRelationship(e.target.value)}
                          className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          City / Hometown
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Seattle, WA or London"
                          value={newHometown}
                          onChange={(e) => setNewHometown(e.target.value)}
                          className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Step 2: Email Destination */}
                  <div className="space-y-2 pt-2 border-t border-slate-200/80">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        Step 2: Recipient Email Address
                      </span>
                      <button
                        type="button"
                        onClick={() => setNewEmail('kibondoqueenmary2022@gmail.com')}
                        className="text-[11px] text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1 hover:underline"
                        title="Fill tester email"
                      >
                        <span>Use my email: kibondoqueenmary2022@gmail.com</span>
                      </button>
                    </div>

                    <div className="relative">
                      <input
                        type="email"
                        placeholder="e.g. kibondoqueenmary2022@gmail.com or member@family.com"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        className="w-full px-3.5 py-2.5 pl-10 text-sm border border-slate-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                        required
                      />
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    </div>
                  </div>

                  {/* Step 3: Temporary Password / Credentials */}
                  <div className="space-y-2 pt-2 border-t border-slate-200/80">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        Step 3: Generated Login Password
                      </span>
                      <button
                        type="button"
                        onClick={() => setNewPassword(generatePassword())}
                        className="text-[11px] text-slate-600 hover:text-slate-900 flex items-center gap-1 font-semibold"
                      >
                        <RefreshCw className="w-3 h-3 text-slate-400" />
                        <span>Regenerate Password</span>
                      </button>
                    </div>

                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full px-3.5 py-2.5 pl-10 pr-10 text-sm font-mono font-bold text-slate-900 border border-slate-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                        required
                      />
                      <KeyRound className="w-4 h-4 text-amber-500 absolute left-3.5 top-3" />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      This temporary password will be embedded inside the welcome email sent to the member.
                    </p>
                  </div>

                  {/* Step 4: Avatar Color */}
                  <div className="pt-2 border-t border-slate-200/80">
                    <label className="text-xs font-semibold text-slate-700 mb-1.5 block">
                      Step 4: Avatar Theme Color
                    </label>
                    <div className="flex gap-2">
                      {colors.map((c) => (
                        <button
                          key={c.class}
                          type="button"
                          onClick={() => setNewColor(c.class)}
                          className={`w-7 h-7 rounded-full ${c.class} ${
                            newColor === c.class ? 'ring-2 ring-offset-2 ring-slate-900 scale-110' : ''
                          } transition-all`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Step 5: Chat Access Permission Checkbox */}
                  <label className="flex items-center gap-3 p-3.5 bg-white border border-slate-200 rounded-2xl cursor-pointer hover:bg-slate-50 transition-colors">
                    <input
                      type="checkbox"
                      checked={grantImmediateAccess}
                      onChange={(e) => setGrantImmediateAccess(e.target.checked)}
                      className="w-4 h-4 text-emerald-600 rounded-md focus:ring-emerald-500 border-slate-300"
                    />
                    <div className="text-xs">
                      <p className="font-bold text-slate-900 flex items-center gap-1.5">
                        <Unlock className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Grant immediate chat access upon registration</span>
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Allows member to send messages, photos, voice notes, and participate in family polls right away.
                      </p>
                    </div>
                  </label>

                  {/* Form Actions */}
                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                    <button
                      type="button"
                      onClick={() => setActiveTab('members')}
                      className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-md transition-transform active:scale-98"
                    >
                      <Send className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Register Member & Send Login Email</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* TAB 3: SENT INVITES & CREDENTIALS LOG */}
          {activeTab === 'invites' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                    Sent Invitation Emails & Credentials Log
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Inspect dispatched emails, copy passwords, or test logging in as any invited member.
                  </p>
                </div>

                <button
                  onClick={() => setActiveTab('register')}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-2xs"
                >
                  <Plus className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Send New Invite</span>
                </button>
              </div>

              {sentInviteEmails.length === 0 ? (
                <div className="p-8 rounded-2xl border border-dashed border-slate-200 text-center space-y-2">
                  <Mail className="w-8 h-8 text-slate-300 mx-auto" />
                  <p className="text-xs font-semibold text-slate-700">No invitation emails sent yet</p>
                  <p className="text-[11px] text-slate-400">
                    Switch to the "Register & Invite" tab to register a family member and send their credentials.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {sentInviteEmails.map((invite) => (
                    <div
                      key={invite.id}
                      className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 transition-all space-y-3 shadow-2xs"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900">{invite.memberName}</span>
                          <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold px-2 py-0.2 rounded-full flex items-center gap-1">
                            <Check className="w-2.5 h-2.5" /> Delivered
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400">{invite.sentAt}</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                          <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-0.5">Recipient Email:</span>
                          <span className="font-mono font-medium text-slate-800">{invite.recipientEmail}</span>
                        </div>

                        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                          <div>
                            <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-0.5">Password:</span>
                            <span className="font-mono font-bold text-amber-900">{invite.loginPassword}</span>
                          </div>
                          <button
                            onClick={() => handleCopy(invite.loginPassword, invite.id)}
                            className="p-1 text-slate-400 hover:text-slate-600 rounded"
                            title="Copy password"
                          >
                            {copiedKey === invite.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[11px] text-slate-500">
                          Chat Access: <strong className={invite.hasChatAccess ? 'text-emerald-700' : 'text-rose-600'}>{invite.hasChatAccess ? 'Authorized' : 'Restricted'}</strong>
                        </span>

                        <div className="flex items-center gap-2">
                          {onOpenEmailPreview && (
                            <button
                              onClick={() => onOpenEmailPreview(invite)}
                              className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1"
                            >
                              <Mail className="w-3 h-3 text-slate-500" />
                              <span>View Delivered Email</span>
                            </button>
                          )}

                          {onOpenMemberLoginModal && (
                            <button
                              onClick={() => {
                                onClose();
                                onOpenMemberLoginModal(invite.recipientEmail);
                              }}
                              className="px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1"
                            >
                              <LogIn className="w-3 h-3 text-emerald-400" />
                              <span>Test Login</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: DATA VISUALIZATION & ENGAGEMENT ANALYTICS (RECHARTS) */}
          {activeTab === 'analytics' && (
            <div className="space-y-4">
              <FamilyEngagementAnalytics
                members={members}
                isAdminLoggedIn={isAdminLoggedIn}
                onOpenRegisterMember={() => setActiveTab('register')}
                onOpenCheckInModal={onOpenDailyCheckIn}
              />
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
