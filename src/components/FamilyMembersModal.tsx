import React, { useState } from 'react';
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
  KeyRound 
} from 'lucide-react';
import { FamilyMember } from '../types/family';

interface FamilyMembersModalProps {
  isOpen: boolean;
  onClose: () => void;
  members: FamilyMember[];
  activeMemberId: string;
  onSelectActiveMember: (id: string) => void;
  onUpdateMember: (updated: FamilyMember) => void;
  onAddMember: (newMember: Omit<FamilyMember, 'id'>) => void;
  onToggleChatAccess: (memberId: string) => void;
  onDeleteMember: (memberId: string) => void;
  isAdminLoggedIn: boolean;
  onOpenAdminLogin: () => void;
  onAdminLogout: () => void;
  onOpenDailyCheckIn?: () => void;
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
}) => {
  const [isEditingSelf, setIsEditingSelf] = useState(false);
  const [isAddingNew, setIsAddingNew] = useState(false);

  const activeMember = members.find((m) => m.id === activeMemberId) || members[0];
  const mainMember = members.find((m) => m.isAdmin) || members[0];

  // Edit status states
  const [statusText, setStatusText] = useState(activeMember.status);
  const [statusEmoji, setStatusEmoji] = useState(activeMember.statusEmoji);
  const [locationText, setLocationText] = useState(activeMember.location || '');

  // Add member states
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRelationship, setNewRelationship] = useState('');
  const [newHometown, setNewHometown] = useState('');
  const [newColor, setNewColor] = useState('bg-teal-500');
  const [grantImmediateAccess, setGrantImmediateAccess] = useState(true);

  if (!isOpen) return null;

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
    onAddMember({
      name: newName.trim(),
      role: newRole.trim(),
      email: newEmail.trim() || undefined,
      relationship: newRelationship.trim() || newRole.trim(),
      hometown: newHometown.trim() || undefined,
      avatarColor: newColor,
      status: 'Joined the family circle',
      statusEmoji: '👋',
      moodEmoji: '😊',
      shortStatus: 'At Home',
      lastCheckInTime: 'Just joined',
      batteryLevel: 100,
      location: newHometown.trim() || 'Home',
      isOnline: true,
      isAdmin: false,
      hasChatAccess: grantImmediateAccess,
      accessGrantedAt: grantImmediateAccess ? new Date().toISOString() : undefined,
      accessGrantedBy: grantImmediateAccess ? mainMember.name : undefined,
    });
    setNewName('');
    setNewRole('');
    setNewEmail('');
    setNewRelationship('');
    setNewHometown('');
    setIsAddingNew(false);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="text-lg font-bold text-slate-900 font-display flex items-center gap-2">
              <span>Family Circle & Access Control</span>
              {isAdminLoggedIn && (
                <span className="text-[10px] bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" /> Admin Mode
                </span>
              )}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Main member permissions, chat access authorization, and family members
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* Main Member Admin Status Banner */}
          <div className="p-4 rounded-2xl border transition-all bg-gradient-to-r from-slate-900 to-slate-800 text-white shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/10 text-emerald-400 flex items-center justify-center font-bold">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-slate-100">
                      Main Member: {mainMember.name}
                    </h4>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-semibold">
                      Family Head
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {isAdminLoggedIn 
                      ? 'You are logged in with admin credentials. You can add members and grant chat access.'
                      : 'Admin credentials required to add members and grant or suspend chat access.'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                {isAdminLoggedIn ? (
                  <button
                    onClick={onAdminLogout}
                    className="px-3 py-1.5 rounded-xl bg-slate-700/80 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors flex items-center gap-1.5"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>Lock Admin</span>
                  </button>
                ) : (
                  <button
                    onClick={onOpenAdminLogin}
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-sm"
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>Admin Login</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Active Profile Banner */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-xs ${activeMember.avatarColor}`}
              >
                {activeMember.name.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-slate-900 text-sm">
                    {activeMember.name}
                  </h4>
                  <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                    Current You
                  </span>
                  {activeMember.hasChatAccess ? (
                    <span className="text-[10px] font-semibold text-emerald-600 flex items-center gap-0.5">
                      <Check className="w-3 h-3" /> Chat Allowed
                    </span>
                  ) : (
                    <span className="text-[10px] font-semibold text-rose-600 flex items-center gap-0.5">
                      <Lock className="w-3 h-3" /> No Chat Access
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  {activeMember.statusEmoji} {activeMember.status}
                </p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-[11px] font-semibold text-slate-700 bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded-md flex items-center gap-1">
                    <span>{activeMember.moodEmoji || '😊'}</span>
                    <span>{activeMember.shortStatus || 'At Home'}</span>
                  </span>
                  {onOpenDailyCheckIn && (
                    <button
                      type="button"
                      onClick={onOpenDailyCheckIn}
                      className="text-[10px] text-amber-800 hover:text-amber-950 font-bold underline cursor-pointer"
                    >
                      Daily Check-in
                    </button>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                setStatusText(activeMember.status);
                setStatusEmoji(activeMember.statusEmoji);
                setLocationText(activeMember.location || '');
                setIsEditingSelf(!isEditingSelf);
              }}
              className="text-xs font-medium text-slate-700 hover:text-slate-900 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-xs"
            >
              {isEditingSelf ? 'Close' : 'Update Status'}
            </button>
          </div>

          {/* Quick Status Editor */}
          {isEditingSelf && (
            <form onSubmit={handleSaveStatus} className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  maxLength={2}
                  value={statusEmoji}
                  onChange={(e) => setStatusEmoji(e.target.value)}
                  className="w-12 px-2 py-2 text-center text-lg border border-slate-200 rounded-xl bg-white"
                  title="Emoji"
                />
                <input
                  type="text"
                  placeholder="What are you up to?"
                  value={statusText}
                  onChange={(e) => setStatusText(e.target.value)}
                  className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Current location (e.g. Home, Kitchen, Market)"
                  value={locationText}
                  onChange={(e) => setLocationText(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold"
                >
                  Save Status
                </button>
              </div>
            </form>
          )}

          {/* Members List with Access Control */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Family Members & Chat Access
                </h4>
                <p className="text-[11px] text-slate-500">
                  Main member grants or revokes chat access for each person
                </p>
              </div>
              <span className="text-xs text-slate-500">
                {members.length} members
              </span>
            </div>

            <div className="grid gap-2.5">
              {members.map((member) => {
                const isActive = member.id === activeMemberId;
                const isFamilyMainAdmin = !!member.isAdmin;

                return (
                  <div
                    key={member.id}
                    className={`p-3.5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      isActive
                        ? 'border-emerald-500/40 bg-emerald-50/20'
                        : 'border-slate-200/80 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-xs ${member.avatarColor}`}
                      >
                        {member.name.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-semibold text-slate-900">
                            {member.name}
                          </span>
                          {/* Daily Check-in mood emoji and short status ('At Home', 'Commuting', 'Busy') */}
                          {member.shortStatus && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-700 bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded-md">
                              <span>{member.moodEmoji || '😊'}</span>
                              <span>{member.shortStatus}</span>
                            </span>
                          )}
                          {isFamilyMainAdmin && (
                            <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.2 rounded-full">
                              Main Member 🛡️
                            </span>
                          )}
                          <span className="text-xs text-slate-500">
                            ({member.relationship || member.role})
                          </span>
                        </div>

                        {member.checkInNote && (
                          <p className="text-[11px] text-slate-600 italic mt-0.5">
                            "{member.checkInNote}"
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
                    <div className="flex items-center gap-2 self-end sm:self-center">
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
                              <span>Revoke Access</span>
                            </>
                          ) : (
                            <>
                              <Unlock className="w-3 h-3" />
                              <span>Grant Access</span>
                            </>
                          )}
                        </button>
                      )}

                      {/* Delete member (admin only, cannot delete main member) */}
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
                          <UserCheck className="w-3.5 h-3.5" />
                          <span>Current</span>
                        </span>
                      ) : (
                        <button
                          onClick={() => onSelectActiveMember(member.id)}
                          className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-colors"
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

          {/* Add New Member Section (Governed by Main Member Admin) */}
          {isAdminLoggedIn ? (
            isAddingNew ? (
              <form onSubmit={handleCreateMember} className="p-5 rounded-2xl border border-slate-300 bg-slate-50 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Add New Member & Grant Chat Access</span>
                  </h4>
                  <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-100 px-2 py-0.5 rounded-full">
                    Admin Action
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Full Name (e.g. Uncle Peter)"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="px-3.5 py-2 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                    autoFocus
                    required
                  />
                  <input
                    type="text"
                    placeholder="Role (e.g. Uncle / Cousin / Grandson)"
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    className="px-3.5 py-2 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Family Relation / Branch (e.g. Cousin on Mom's side)"
                    value={newRelationship}
                    onChange={(e) => setNewRelationship(e.target.value)}
                    className="px-3.5 py-2 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                  <input
                    type="text"
                    placeholder="City / Hometown (e.g. Chicago, IL)"
                    value={newHometown}
                    onChange={(e) => setNewHometown(e.target.value)}
                    className="px-3.5 py-2 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>

                <input
                  type="email"
                  placeholder="Optional Email or Phone for member"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                />

                {/* Avatar Color Picker */}
                <div>
                  <label className="text-xs text-slate-500 mb-1.5 block">Avatar Theme:</label>
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

                {/* Grant chat access toggle checkbox */}
                <label className="flex items-center gap-2 p-3 bg-white border border-slate-200 rounded-xl cursor-pointer">
                  <input
                    type="checkbox"
                    checked={grantImmediateAccess}
                    onChange={(e) => setGrantImmediateAccess(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded-md focus:ring-emerald-500 border-slate-300"
                  />
                  <div className="text-xs">
                    <p className="font-semibold text-slate-800">
                      Grant chat participation access immediately
                    </p>
                    <p className="text-[10px] text-slate-500">
                      Allows member to post messages, voice notes, and vote on family polls
                    </p>
                  </div>
                </label>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAddingNew(false)}
                    className="px-3.5 py-1.5 text-xs text-slate-600 hover:text-slate-900"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-xl hover:bg-slate-800 transition-colors shadow-xs"
                  >
                    Add Member to Circle
                  </button>
                </div>
              </form>
            ) : (
              <button
                onClick={() => setIsAddingNew(true)}
                className="w-full py-3.5 border-2 border-dashed border-slate-300 rounded-2xl text-slate-700 hover:text-slate-900 hover:border-slate-400 hover:bg-slate-50 transition-all text-xs font-bold flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4 text-emerald-600" />
                <span>Add Family Member & Grant Chat Access</span>
              </button>
            )
          ) : (
            /* Admin lock gate when not logged in */
            <div className="p-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-slate-200 text-slate-600 flex items-center justify-center shrink-0">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">
                    Admin Credentials Required to Add Members
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Only the main family member can add new members and grant chat access permissions.
                  </p>
                </div>
              </div>

              <button
                onClick={onOpenAdminLogin}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shrink-0 transition-colors flex items-center gap-1.5 shadow-2xs"
              >
                <KeyRound className="w-3.5 h-3.5 text-emerald-400" />
                <span>Log In as Main Member</span>
              </button>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span>Protected family network</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
