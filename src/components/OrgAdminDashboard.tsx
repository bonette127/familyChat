import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Users, 
  UserPlus, 
  UserMinus, 
  Clock, 
  Lock, 
  Unlock, 
  KeyRound, 
  Search, 
  CheckCircle2, 
  AlertTriangle, 
  ExternalLink,
  MessageCircle,
  Building,
  Filter
} from 'lucide-react';
import { FamilyMember, FamilyUnit, Message } from '../types/family';

interface OrgAdminDashboardProps {
  orgAdminMember: FamilyMember;
  allMembers: FamilyMember[];
  familyUnits: FamilyUnit[];
  messages: Message[];
  onOpenRegisterMember: (unitId?: string) => void;
  onRemoveMember: (memberId: string) => void;
  onToggleChatAccess: (memberId: string) => void;
  onResetMemberPassword: (memberId: string, newPass: string) => void;
  onSwitchToUserView: () => void;
}

export const OrgAdminDashboard: React.FC<OrgAdminDashboardProps> = ({
  orgAdminMember,
  allMembers,
  familyUnits,
  messages,
  onOpenRegisterMember,
  onRemoveMember,
  onToggleChatAccess,
  onResetMemberPassword,
  onSwitchToUserView,
}) => {
  // Find unit for this Organization Admin
  const adminUnit = familyUnits.find(
    (u) => u.id === orgAdminMember.familyUnitId || u.leaderId === orgAdminMember.id
  ) || familyUnits[0] || {
    id: 'unit-default',
    name: 'Organization Branch',
    description: 'Local family branch',
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [filterScope, setFilterScope] = useState<'all_unit' | 'added_by_me' | 'online'>('all_unit');
  const [memberToRemove, setMemberToRemove] = useState<FamilyMember | null>(null);
  const [selectedMemberForReset, setSelectedMemberForReset] = useState<FamilyMember | null>(null);
  const [newTempPassword, setNewTempPassword] = useState('');
  const [actionSuccessNotice, setActionSuccessNotice] = useState<string | null>(null);

  // Unit members: members in this unit or added by this org admin
  const unitMembers = allMembers.filter((m) => {
    const isInUnit = m.familyUnitId === adminUnit.id;
    const isAddedByMe = m.addedById === orgAdminMember.id || m.addedByLeaderId === orgAdminMember.id;
    return isInUnit || isAddedByMe || m.id === orgAdminMember.id;
  });

  // Filter based on search and tab
  const displayedMembers = unitMembers.filter((m) => {
    const isAddedByMe = m.addedById === orgAdminMember.id || m.addedByLeaderId === orgAdminMember.id;
    
    if (filterScope === 'added_by_me' && !isAddedByMe && m.id !== orgAdminMember.id) return false;
    if (filterScope === 'online' && !m.isOnline) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = m.name.toLowerCase().includes(q);
      const matchRole = (m.familyRole || m.role || '').toLowerCase().includes(q);
      const matchEmail = (m.email || '').toLowerCase().includes(q);
      return matchName || matchRole || matchEmail;
    }
    return true;
  });

  const membersAddedByMeCount = unitMembers.filter(
    (m) => m.addedById === orgAdminMember.id || m.addedByLeaderId === orgAdminMember.id
  ).length;

  const onlineInUnitCount = unitMembers.filter((m) => m.isOnline).length;
  const unitMsgCount = messages.filter((msg) =>
    unitMembers.some((m) => m.id === msg.senderId)
  ).length;

  const handleConfirmRemove = () => {
    if (!memberToRemove) return;
    const removedName = memberToRemove.name;
    onRemoveMember(memberToRemove.id);
    setMemberToRemove(null);
    setActionSuccessNotice(`Removed ${removedName} from your organization.`);
    setTimeout(() => setActionSuccessNotice(null), 4000);
  };

  const handleExecutePasswordReset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMemberForReset || !newTempPassword.trim()) return;
    onResetMemberPassword(selectedMemberForReset.id, newTempPassword.trim());
    const targetName = selectedMemberForReset.name;
    setSelectedMemberForReset(null);
    setNewTempPassword('');
    setActionSuccessNotice(`Reset temporary passcode for ${targetName}.`);
    setTimeout(() => setActionSuccessNotice(null), 4000);
  };

  return (
    <div className="flex-1 flex flex-col h-full min-w-0 bg-slate-50 overflow-y-auto">
      {/* Top Banner: Distinct Organization Administrator Styling */}
      <div className="bg-gradient-to-r from-teal-900 via-emerald-900 to-slate-900 text-white p-6 sm:p-8 shrink-0 shadow-md">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-400/20 border border-emerald-400/40 text-emerald-300 flex items-center justify-center text-2xl shadow-inner shrink-0">
              <Building className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-200 text-xs font-bold uppercase tracking-wider">
                  Organization Administrator Dashboard
                </span>
                <span className="px-2 py-0.5 rounded-full bg-white/10 text-emerald-100 text-xs">
                  {adminUnit.name}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold font-display tracking-tight text-white mt-1">
                {adminUnit.name} Management
              </h1>
              <p className="text-xs text-emerald-100/80 mt-1 max-w-xl">
                Administrator: <span className="font-semibold text-white">{orgAdminMember.name}</span>. You can register new members to this organization and remove members you previously added.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 w-full sm:w-auto">
            <button
              onClick={onSwitchToUserView}
              className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5"
              title="Preview standard family user interface"
            >
              <span>User View</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onOpenRegisterMember(adminUnit.id)}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add Member to Unit</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-4 sm:p-6 max-w-6xl w-full mx-auto space-y-6">
        
        {/* Success Toast Notice */}
        {actionSuccessNotice && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{actionSuccessNotice}</span>
          </div>
        )}

        {/* Quick Metrics for this Organization */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Unit Members</span>
              <Users className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold font-display text-slate-900">{unitMembers.length}</span>
              <span className="text-xs text-emerald-600 font-semibold">● {onlineInUnitCount} online</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">In {adminUnit.name}</p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Added By You</span>
              <UserPlus className="w-4 h-4 text-teal-600" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold font-display text-slate-900">{membersAddedByMeCount}</span>
              <span className="text-xs text-slate-500">managed by you</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Eligible for removal by you</p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Unit Activity</span>
              <MessageCircle className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold font-display text-slate-900">{unitMsgCount}</span>
              <span className="text-xs text-slate-500">messages</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">From members in this unit</p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Role Scope</span>
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-base font-bold font-display text-emerald-800">Unit Admin</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Scoped to {adminUnit.name}</p>
          </div>
        </div>

        {/* Scope Note Banner */}
        <div className="p-4 rounded-2xl bg-teal-50/70 border border-teal-200/80 text-teal-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-teal-100 flex items-center justify-center text-teal-700 shrink-0 font-bold">
              ✓
            </div>
            <div>
              <span className="font-bold text-teal-900">Organization Administrator Authority:</span>
              <span className="text-teal-800 ml-1">
                You can add new members directly to this unit. If you need to remove a member you previously added, click the <span className="font-semibold text-rose-700">"Remove"</span> button beside their name below.
              </span>
            </div>
          </div>
          <button
            onClick={() => onOpenRegisterMember(adminUnit.id)}
            className="px-3 py-1.5 bg-teal-700 hover:bg-teal-800 text-white rounded-xl font-bold shrink-0 shadow-2xs transition-colors"
          >
            + Add Member
          </button>
        </div>

        {/* Member Management Roster */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs overflow-hidden space-y-4 p-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900 font-display">
                Organization Member Roster
              </h2>
              <p className="text-xs text-slate-400">
                Manage members in {adminUnit.name} and remove members you added
              </p>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setFilterScope('all_unit')}
                className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                  filterScope === 'all_unit'
                    ? 'bg-white text-slate-900 shadow-2xs font-bold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                All Unit ({unitMembers.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterScope('added_by_me')}
                className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                  filterScope === 'added_by_me'
                    ? 'bg-white text-emerald-700 shadow-2xs font-bold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Added by Me ({membersAddedByMeCount})
              </button>
              <button
                type="button"
                onClick={() => setFilterScope('online')}
                className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                  filterScope === 'online'
                    ? 'bg-white text-emerald-700 shadow-2xs font-bold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Online ({onlineInUnitCount})
              </button>
            </div>
          </div>

          {/* Search bar */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search unit member by name, role, email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-800"
            />
          </div>

          {/* Member Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Member Name</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Added By</th>
                  <th className="py-3 px-4">Presence</th>
                  <th className="py-3 px-4">Chat Access</th>
                  <th className="py-3 px-4 text-right">Admin Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {displayedMembers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-xs text-slate-400">
                      No members match your filter criteria.
                    </td>
                  </tr>
                ) : (
                  displayedMembers.map((m) => {
                    const isAddedByMe =
                      m.addedById === orgAdminMember.id || m.addedByLeaderId === orgAdminMember.id;
                    const isMe = m.id === orgAdminMember.id;
                    const isMainAdmin = !!m.isAdmin || !!m.isSuperAdmin;

                    // Can this Org Admin remove this member?
                    // An organization admin can remove members they previously added (or in their unit, except Main Admin and themselves)
                    const canRemove = !isMe && !isMainAdmin && (isAddedByMe || m.familyUnitId === adminUnit.id);

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
                                {isMe && (
                                  <span className="px-1.5 py-0.2 rounded bg-teal-100 text-teal-800 text-[9px] font-bold">
                                    You (Org Admin)
                                  </span>
                                )}
                                {isMainAdmin && (
                                  <span className="px-1.5 py-0.2 rounded bg-indigo-100 text-indigo-800 text-[9px] font-bold">
                                    System Admin
                                  </span>
                                )}
                              </p>
                              <p className="text-[10px] text-slate-400">{m.email || 'No email'}</p>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <span className="font-semibold text-slate-700">{m.familyRole || m.role}</span>
                          <p className="text-[10px] text-slate-400">{m.relationship || 'Unit Member'}</p>
                        </td>

                        <td className="py-3 px-4">
                          {isAddedByMe ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200">
                              Added by You
                            </span>
                          ) : m.addedByName ? (
                            <span className="text-[10px] text-slate-500">
                              {m.addedByName}
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-400">
                              System Head
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            m.isOnline ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${m.isOnline ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                            {m.isOnline ? 'Online' : 'Offline'}
                          </span>
                        </td>

                        <td className="py-3 px-4">
                          <button
                            type="button"
                            onClick={() => onToggleChatAccess(m.id)}
                            disabled={isMainAdmin}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-colors flex items-center gap-1 cursor-pointer ${
                              m.hasChatAccess
                                ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200'
                                : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
                            } ${isMainAdmin ? 'opacity-70 cursor-not-allowed' : ''}`}
                            title={isMainAdmin ? 'Main admin access cannot be altered' : 'Toggle chat permissions'}
                          >
                            {m.hasChatAccess ? (
                              <>
                                <Unlock className="w-3 h-3" />
                                <span>Active</span>
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
                          <div className="inline-flex items-center gap-1.5">
                            {/* Reset Password */}
                            {!isMainAdmin && (
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedMemberForReset(m);
                                  setNewTempPassword('branch' + Math.floor(1000 + Math.random() * 9000));
                                }}
                                className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[10px] font-semibold transition-colors"
                                title="Reset passcode"
                              >
                                Passcode
                              </button>
                            )}

                            {/* Remove Member Button */}
                            {canRemove ? (
                              <button
                                type="button"
                                onClick={() => setMemberToRemove(m)}
                                className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-[10px] font-bold transition-colors flex items-center gap-1"
                                title={isAddedByMe ? 'Remove member you added' : 'Remove unit member'}
                              >
                                <UserMinus className="w-3 h-3" />
                                <span>Remove</span>
                              </button>
                            ) : (
                              !isMe && (
                                <span className="text-[10px] text-slate-400 italic">
                                  System Protected
                                </span>
                              )
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Confirmation Modal for Removing Member */}
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
                As Organization Administrator, you are removing <span className="font-semibold text-slate-800">{memberToRemove.name}</span> ({memberToRemove.familyRole || memberToRemove.role}) from <span className="font-semibold text-slate-800">{adminUnit.name}</span>.
              </p>
              <p className="text-[11px] text-rose-600 bg-rose-50 p-2 rounded-xl mt-3 font-semibold">
                Their chat access will be immediately terminated and they will be removed from this organization roster.
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
                onClick={handleConfirmRemove}
                className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
              >
                Confirm Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Password Reset Modal */}
      {selectedMemberForReset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-sm bg-white rounded-3xl border border-slate-200 p-5 shadow-2xl space-y-4">
            <div className="flex items-center gap-2 text-teal-700">
              <KeyRound className="w-5 h-5" />
              <h3 className="text-sm font-bold font-display text-slate-900">
                Reset Passcode for {selectedMemberForReset.name}
              </h3>
            </div>
            <p className="text-xs text-slate-500">
              Set a temporary passcode for {selectedMemberForReset.name} to log into {adminUnit.name}.
            </p>
            <form onSubmit={handleExecutePasswordReset} className="space-y-3">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  New Temporary Passcode
                </label>
                <input
                  type="text"
                  value={newTempPassword}
                  onChange={(e) => setNewTempPassword(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-800"
                  required
                />
              </div>
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedMemberForReset(null)}
                  className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-xs"
                >
                  Save Passcode
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
