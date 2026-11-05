import React, { useState } from 'react';
import { 
  Shield, 
  Crown, 
  Users, 
  UserPlus, 
  CheckCircle2, 
  Clock, 
  KeyRound, 
  Mail, 
  Activity, 
  Eye, 
  Lock, 
  Unlock, 
  AlertTriangle, 
  Sparkles, 
  FileText, 
  Settings, 
  Save, 
  ExternalLink,
  ChevronRight,
  TrendingUp,
  MessageCircle,
  Camera,
  Calendar,
  Gift,
  UserMinus,
  Building
} from 'lucide-react';
import { FamilyMember, FamilyUnit, SecurityAuditLog, Message, MilestoneCelebration, PhotoMemory } from '../types/family';

interface AdminDashboardProps {
  adminMember: FamilyMember;
  allMembers: FamilyMember[];
  familyUnits: FamilyUnit[];
  messages: Message[];
  milestones: MilestoneCelebration[];
  memories: PhotoMemory[];
  securityLogs: SecurityAuditLog[];
  adminCredentials: { email: string; password?: string; mainMemberId: string };
  onUpdateAdminCredentials: (email: string, password?: string) => void;
  onOpenRegisterMember: () => void;
  onOpenSuperAdminModal: () => void;
  onToggleChatAccess: (memberId: string) => void;
  onResetMemberPassword: (memberId: string, newPass: string) => void;
  onRemoveMember: (memberId: string) => void;
  onSwitchToUserView: () => void;
  onSwitchToOrgAdminView?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  adminMember,
  allMembers,
  familyUnits,
  messages,
  milestones,
  memories,
  securityLogs,
  adminCredentials,
  onUpdateAdminCredentials,
  onOpenRegisterMember,
  onOpenSuperAdminModal,
  onToggleChatAccess,
  onResetMemberPassword,
  onRemoveMember,
  onSwitchToUserView,
  onSwitchToOrgAdminView,
}) => {
  const [activeAdminSection, setActiveAdminSection] = useState<'overview' | 'members' | 'security' | 'audit'>('overview');
  const [memberToRemove, setMemberToRemove] = useState<FamilyMember | null>(null);
  
  // Credentials update state
  const [adminEmail, setAdminEmail] = useState(adminCredentials.email || 'kibondoqueenmary2022@gmail.com');
  const [adminPassword, setAdminPassword] = useState(adminCredentials.password || 'family2026');
  const [confirmPassword, setConfirmPassword] = useState(adminCredentials.password || 'family2026');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);
  const [saveErrorMsg, setSaveErrorMsg] = useState<string | null>(null);

  // Member search & filter
  const [memberSearchQuery, setMemberSearchQuery] = useState('');
  const [selectedMemberForReset, setSelectedMemberForReset] = useState<FamilyMember | null>(null);
  const [newTempPassword, setNewTempPassword] = useState('');

  const handleSaveCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSuccessMsg(null);
    setSaveErrorMsg(null);

    if (!adminEmail.trim()) {
      setSaveErrorMsg('Admin email / username cannot be empty');
      return;
    }
    if (adminPassword.length < 6) {
      setSaveErrorMsg('Password must be at least 6 characters');
      return;
    }
    if (adminPassword !== confirmPassword) {
      setSaveErrorMsg('Passwords do not match');
      return;
    }

    onUpdateAdminCredentials(adminEmail.trim(), adminPassword);
    setSaveSuccessMsg('Admin credentials successfully updated and secured.');
    setTimeout(() => setSaveSuccessMsg(null), 4000);
  };

  const handleExecutePasswordReset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMemberForReset || !newTempPassword.trim()) return;
    onResetMemberPassword(selectedMemberForReset.id, newTempPassword.trim());
    setSelectedMemberForReset(null);
    setNewTempPassword('');
  };

  const filteredMembers = allMembers.filter((m) => {
    if (!memberSearchQuery.trim()) return true;
    const q = memberSearchQuery.toLowerCase();
    return (
      m.name.toLowerCase().includes(q) ||
      (m.familyRole || m.role || '').toLowerCase().includes(q) ||
      (m.email || '').toLowerCase().includes(q)
    );
  });

  const onlineCount = allMembers.filter((m) => m.isOnline).length;
  const offlineCount = allMembers.length - onlineCount;

  return (
    <div className="flex-1 flex flex-col h-full min-w-0 bg-slate-50 overflow-y-auto">
      {/* Top Banner: Distinct Admin Branding */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 shrink-0 shadow-md">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-400 flex items-center justify-center text-2xl shadow-inner shrink-0">
              👑
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/30 border border-indigo-400/40 text-indigo-200 text-xs font-bold uppercase tracking-wider">
                  Main System Administrator
                </span>
                <span className="px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-xs">
                  Lineage Head: {adminMember.name}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold font-display tracking-tight text-white mt-1">
                Main System Administration & Lineage Control
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
                Full system governance: manage organization administrators, oversee all branches, grant permissions, and secure system credentials.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 self-stretch sm:self-auto justify-end flex-wrap">
            {onSwitchToOrgAdminView && (
              <button
                onClick={onSwitchToOrgAdminView}
                className="px-3.5 py-2 bg-teal-500/20 hover:bg-teal-500/30 text-teal-200 border border-teal-400/30 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5"
                title="Preview Organization Administrator Dashboard"
              >
                <Building className="w-3.5 h-3.5 text-teal-400" />
                <span>Org Admin View</span>
              </button>
            )}
            <button
              onClick={onSwitchToUserView}
              className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5"
              title="Preview how regular family members see their dashboard"
            >
              <span>User View</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onOpenRegisterMember}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add Member</span>
            </button>
          </div>
        </div>

        {/* Navigation Sub-Tabs */}
        <div className="max-w-6xl mx-auto flex items-center gap-2 mt-6 pt-4 border-t border-slate-800 text-xs overflow-x-auto">
          <button
            onClick={() => setActiveAdminSection('overview')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition-colors ${
              activeAdminSection === 'overview'
                ? 'bg-emerald-500 text-white font-bold'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            System Overview
          </button>
          <button
            onClick={() => setActiveAdminSection('members')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition-colors flex items-center gap-1.5 ${
              activeAdminSection === 'members'
                ? 'bg-emerald-500 text-white font-bold'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <span>Family Lineage Roster</span>
            <span className="px-1.5 py-0.2 rounded-full bg-slate-800 text-[10px] text-slate-300 font-mono">
              {allMembers.length}
            </span>
          </button>
          <button
            onClick={() => setActiveAdminSection('security')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition-colors ${
              activeAdminSection === 'security'
                ? 'bg-emerald-500 text-white font-bold'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            Admin Credentials & Branches
          </button>
          <button
            onClick={() => setActiveAdminSection('audit')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition-colors flex items-center gap-1.5 ${
              activeAdminSection === 'audit'
                ? 'bg-emerald-500 text-white font-bold'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <span>Security Audit Trail</span>
            <span className="px-1.5 py-0.2 rounded-full bg-slate-800 text-[10px] text-slate-300 font-mono">
              {securityLogs.length}
            </span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-4 sm:p-6 max-w-6xl w-full mx-auto space-y-6">
        
        {/* SECTION 1: SYSTEM OVERVIEW */}
        {activeAdminSection === 'overview' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Quick Metrics Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
                <div className="flex items-center justify-between text-slate-500 mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider">Lineage Members</span>
                  <Users className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold font-display text-slate-900">{allMembers.length}</span>
                  <span className="text-xs text-emerald-600 font-semibold">● {onlineCount} online</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">1 verified Family Head</p>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
                <div className="flex items-center justify-between text-slate-500 mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider">Forum Messages</span>
                  <MessageCircle className="w-4 h-4 text-indigo-600" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold font-display text-slate-900">{messages.length}</span>
                  <span className="text-xs text-slate-500">total sent</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Across all gathering rooms</p>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
                <div className="flex items-center justify-between text-slate-500 mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider">Life Milestones</span>
                  <Sparkles className="w-4 h-4 text-rose-500" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold font-display text-slate-900">{milestones.length}</span>
                  <span className="text-xs text-rose-600 font-semibold">active celebrations</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Weddings, birthdays & reunions</p>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
                <div className="flex items-center justify-between text-slate-500 mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider">Lineage Branches</span>
                  <Crown className="w-4 h-4 text-amber-500" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold font-display text-slate-900">{familyUnits.length}</span>
                  <span className="text-xs text-amber-600 font-semibold">units formed</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Governed under Family Head</p>
              </div>
            </div>

            {/* Quick Admin Authority Guidance */}
            <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200/80 text-indigo-950 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-700 shrink-0">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold">Admin Authority & Governance Rules</h3>
                  <p className="text-xs text-indigo-800 mt-0.5">
                    As Head of Family, only you can register new relatives into the private lineage. Members can manage their own profile and password, while you maintain lineage security and oversee system health.
                  </p>
                </div>
              </div>
              <button
                onClick={onOpenSuperAdminModal}
                className="px-3 py-1.5 bg-indigo-900 hover:bg-indigo-950 text-white rounded-xl text-xs font-semibold shrink-0 transition-colors"
              >
                Super Admin Council
              </button>
            </div>

            {/* Recent Lineage Activity Snapshot */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-2xs">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                <div>
                  <h2 className="text-sm font-bold text-slate-900 font-display">
                    Lineage Members Quick Status
                  </h2>
                  <p className="text-xs text-slate-400">
                    Live presence, role assignments, and check-in times
                  </p>
                </div>
                <button
                  onClick={() => setActiveAdminSection('members')}
                  className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 hover:underline flex items-center gap-1"
                >
                  <span>View All Members</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="divide-y divide-slate-100">
                {allMembers.slice(0, 5).map((m) => {
                  const memberMsgCount = messages.filter((msg) => msg.senderId === m.id).length;
                  return (
                    <div key={m.id} className="py-3 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 ${m.avatarColor}`}>
                          {m.name.charAt(0)}
                        </div>
                        <div className="min-w-0 truncate">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-800 truncate">{m.name}</span>
                            {m.isAdmin && (
                              <span className="px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                                Head of Family
                              </span>
                            )}
                            <span className={`w-2 h-2 rounded-full shrink-0 ${m.isOnline ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                          </div>
                          <p className="text-[11px] text-slate-400 truncate">
                            {m.familyRole || m.role} • {m.isOnline ? 'Online now' : 'Offline'} • {m.lastCheckInTime ? `Checked in ${m.lastCheckInTime}` : 'No check-in yet'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-xs font-mono text-slate-500 hidden sm:inline">
                          {memberMsgCount} messages
                        </span>
                        <span className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold ${
                          m.hasChatAccess
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}>
                          {m.hasChatAccess ? 'Chat Active' : 'Restricted'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* SECTION 2: FAMILY LINEAGE ROSTER & ACTIVITY MONITOR */}
        {activeAdminSection === 'members' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
              <div>
                <h2 className="text-sm font-bold text-slate-900 font-display">
                  Family Lineage Roster & Activity Monitor
                </h2>
                <p className="text-xs text-slate-400">
                  Manage member permissions, check real-time online presence, and grant chat access
                </p>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <input
                  type="text"
                  placeholder="Filter by name, role, email..."
                  value={memberSearchQuery}
                  onChange={(e) => setMemberSearchQuery(e.target.value)}
                  className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-800 w-full sm:w-56"
                />
                <button
                  onClick={onOpenRegisterMember}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shrink-0 transition-colors"
                >
                  + Add Member
                </button>
              </div>
            </div>

            {/* Member Cards Table */}
            <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                      <th className="py-3 px-4">Family Member</th>
                      <th className="py-3 px-4">Lineage Role</th>
                      <th className="py-3 px-4">Presence</th>
                      <th className="py-3 px-4">Contributions</th>
                      <th className="py-3 px-4">Chat Access</th>
                      <th className="py-3 px-4 text-right">Admin Controls</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredMembers.map((m) => {
                      const memberMsgCount = messages.filter((msg) => msg.senderId === m.id).length;
                      const memberMemCount = memories.filter((mem) => mem.authorId === m.id).length;
                      return (
                        <tr key={m.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2.5">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${m.avatarColor}`}>
                                {m.name.charAt(0)}
                              </div>
                              <div>
                                <p className="font-bold text-slate-800 flex items-center gap-1.5">
                                  <span>{m.name}</span>
                                  {m.isAdmin && (
                                    <span className="px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 text-[9px] font-bold">
                                      Admin
                                    </span>
                                  )}
                                </p>
                                <p className="text-[10px] text-slate-400">{m.email || 'No email registered'}</p>
                              </div>
                            </div>
                          </td>

                          <td className="py-3 px-4">
                            <span className="font-semibold text-slate-700">{m.familyRole || m.role}</span>
                            <p className="text-[10px] text-slate-400">{m.relationship || 'Direct Lineage'}</p>
                          </td>

                          <td className="py-3 px-4">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                              m.isOnline ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${m.isOnline ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                              {m.isOnline ? 'Active Online' : 'Offline'}
                            </span>
                          </td>

                          <td className="py-3 px-4">
                            <span className="text-slate-700 font-medium">{memberMsgCount} messages</span>
                            <span className="text-slate-400 text-[10px] block">{memberMemCount} keepsakes</span>
                          </td>

                          <td className="py-3 px-4">
                            <button
                              type="button"
                              onClick={() => onToggleChatAccess(m.id)}
                              disabled={m.isAdmin}
                              className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-colors flex items-center gap-1 cursor-pointer ${
                                m.hasChatAccess
                                  ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200'
                                  : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
                              } ${m.isAdmin ? 'opacity-70 cursor-not-allowed' : ''}`}
                              title={m.isAdmin ? 'Admin access cannot be disabled' : 'Click to toggle access'}
                            >
                              {m.hasChatAccess ? (
                                <>
                                  <Unlock className="w-3 h-3" />
                                  <span>Granted</span>
                                </>
                              ) : (
                                <>
                                  <Lock className="w-3 h-3" />
                                  <span>Restricted</span>
                                </>
                              )}
                            </button>
                          </td>

                          <td className="py-3 px-4 text-right">
                            <div className="inline-flex items-center gap-1.5 justify-end">
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedMemberForReset(m);
                                  setNewTempPassword('family' + Math.floor(1000 + Math.random() * 9000));
                                }}
                                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[10px] font-semibold transition-colors"
                              >
                                Password
                              </button>

                              {!m.isAdmin && !m.isSuperAdmin ? (
                                <button
                                  type="button"
                                  onClick={() => setMemberToRemove(m)}
                                  className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-[10px] font-bold transition-colors flex items-center gap-1"
                                  title="Remove member from system"
                                >
                                  <UserMinus className="w-3 h-3" />
                                  <span>Remove</span>
                                </button>
                              ) : (
                                <span className="text-[10px] text-slate-400 italic">
                                  System Head
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Modal for Confirming Member Removal */}
            {memberToRemove && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
                <div className="w-full max-w-sm bg-white rounded-3xl border border-slate-200 p-5 shadow-2xl space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto">
                    <UserMinus className="w-6 h-6" />
                  </div>

                  <div className="text-center">
                    <h3 className="text-base font-bold font-display text-slate-900">
                      Remove {memberToRemove.name}?
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      As Main System Administrator, you are removing <span className="font-semibold text-slate-800">{memberToRemove.name}</span> ({memberToRemove.familyRole || memberToRemove.role}) from the family forum system.
                    </p>
                    <p className="text-[11px] text-rose-600 bg-rose-50 p-2 rounded-xl mt-3 font-semibold">
                      Their access will be immediately revoked and they will be removed from all channels and branch units.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setMemberToRemove(null)}
                      className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onRemoveMember(memberToRemove.id);
                        setMemberToRemove(null);
                      }}
                      className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
                    >
                      Confirm Remove
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Modal for Resetting Member Password */}
            {selectedMemberForReset && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
                <div className="w-full max-w-sm bg-white rounded-3xl border border-slate-200 p-5 shadow-2xl space-y-4">
                  <div className="flex items-center gap-2 text-indigo-700">
                    <KeyRound className="w-5 h-5" />
                    <h3 className="text-sm font-bold font-display text-slate-900">
                      Reset Password for {selectedMemberForReset.name}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500">
                    As Head of Family, you can provision a new login password for {selectedMemberForReset.name}. They will be able to update it once logged in.
                  </p>
                  <form onSubmit={handleExecutePasswordReset} className="space-y-3">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                        New Temporary Password
                      </label>
                      <input
                        type="text"
                        value={newTempPassword}
                        onChange={(e) => setNewTempPassword(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-800"
                        required
                      />
                    </div>
                    <div className="flex items-center justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setSelectedMemberForReset(null)}
                        className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-800 font-semibold"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs"
                      >
                        Confirm & Save
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* SECTION 3: ADMIN CREDENTIALS & SYSTEM SETTINGS */}
        {activeAdminSection === 'security' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-200">
            {/* Form to Update Admin Username & Password */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-2xs space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 font-display">
                    Head of Family Credentials
                  </h3>
                  <p className="text-xs text-slate-400">
                    Update your admin username/email and login password
                  </p>
                </div>
              </div>

              {saveSuccessMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{saveSuccessMsg}</span>
                </div>
              )}

              {saveErrorMsg && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{saveErrorMsg}</span>
                </div>
              )}

              <form onSubmit={handleSaveCredentials} className="space-y-3.5 text-xs">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Admin Username / Email
                  </label>
                  <input
                    type="text"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 text-slate-800 font-semibold"
                    required
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Used to authenticate into the Head of Family console.
                  </p>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    New Admin Password
                  </label>
                  <input
                    type="password"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 text-slate-800"
                    required
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Confirm Admin Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 text-slate-800"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Save New Credentials</span>
                </button>
              </form>
            </div>

            {/* Lineage Branch & Family Units Overview */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-2xs space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Crown className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 font-display">
                    Family Branches & Lineage Units
                  </h3>
                  <p className="text-xs text-slate-400">
                    Branches representing multi-generational family units
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {familyUnits.map((u) => (
                  <div key={u.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-800">{u.name}</span>
                      <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-semibold border border-emerald-200">
                        Active Branch
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">{u.description || 'Family branch lineage'}</p>
                    <p className="text-[10px] text-slate-400">
                      Appointed Leader: <strong className="text-slate-700">{u.leaderName || 'Admin Mary'}</strong>
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SECTION 4: SECURITY AUDIT TRAIL */}
        {activeAdminSection === 'audit' && (
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-2xs space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 font-display">
                    Governance Security Audit Trail
                  </h3>
                  <p className="text-xs text-slate-400">
                    Transparent log of administrative appointments, registrations, and revocations
                  </p>
                </div>
              </div>
              <span className="text-xs font-mono text-slate-400">
                {securityLogs.length} events logged
              </span>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
              {securityLogs.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  No administrative actions logged yet.
                </div>
              ) : (
                securityLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-start justify-between gap-3 text-xs"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800">{log.action.replace(/_/g, ' ')}</span>
                        <span className="text-[10px] text-slate-400">by {log.performedByName}</span>
                      </div>
                      <p className="text-slate-600 text-xs">{log.details}</p>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono shrink-0">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
