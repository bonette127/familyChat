import React, { useState } from 'react';
import { X, Battery, MapPin, Phone, Calendar, UserCheck, Plus, Sparkles, Smile } from 'lucide-react';
import { FamilyMember } from '../types/family';

interface FamilyMembersModalProps {
  isOpen: boolean;
  onClose: () => void;
  members: FamilyMember[];
  activeMemberId: string;
  onSelectActiveMember: (id: string) => void;
  onUpdateMember: (updated: FamilyMember) => void;
  onAddMember: (newMember: Omit<FamilyMember, 'id'>) => void;
}

export const FamilyMembersModal: React.FC<FamilyMembersModalProps> = ({
  isOpen,
  onClose,
  members,
  activeMemberId,
  onSelectActiveMember,
  onUpdateMember,
  onAddMember,
}) => {
  const [isEditingSelf, setIsEditingSelf] = useState(false);
  const [isAddingNew, setIsAddingNew] = useState(false);

  const activeMember = members.find((m) => m.id === activeMemberId) || members[0];

  // Edit status states
  const [statusText, setStatusText] = useState(activeMember.status);
  const [statusEmoji, setStatusEmoji] = useState(activeMember.statusEmoji);
  const [locationText, setLocationText] = useState(activeMember.location || '');

  // Add member states
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState('');
  const [newColor, setNewColor] = useState('bg-teal-500');

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
      avatarColor: newColor,
      status: 'Joined the family chat',
      statusEmoji: '👋',
      batteryLevel: 100,
      location: 'Home',
      isOnline: true,
    });
    setNewName('');
    setNewRole('');
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
      <div className="w-full max-w-xl bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="text-lg font-bold text-slate-900 font-display">
              Family Circle & Members
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Switch chatting profile, update status, and view contacts
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
          
          {/* Active Profile Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent border border-emerald-500/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-sm ${activeMember.avatarColor}`}
                >
                  {activeMember.name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-slate-900 text-sm">
                      {activeMember.name}
                    </h4>
                    <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                      Active You
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {activeMember.statusEmoji} {activeMember.status}
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  setStatusText(activeMember.status);
                  setStatusEmoji(activeMember.statusEmoji);
                  setLocationText(activeMember.location || '');
                  setIsEditingSelf(!isEditingSelf);
                }}
                className="text-xs font-medium text-emerald-700 hover:text-emerald-800 bg-white px-3 py-1.5 rounded-xl border border-emerald-200 shadow-xs"
              >
                {isEditingSelf ? 'Close' : 'Update Status'}
              </button>
            </div>

            {/* Quick Status Editor */}
            {isEditingSelf && (
              <form onSubmit={handleSaveStatus} className="mt-4 pt-4 border-t border-emerald-500/20 space-y-3">
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
                    className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Current location (e.g. Home, Kitchen, Market)"
                    value={locationText}
                    onChange={(e) => setLocationText(e.target.value)}
                    className="flex-1 px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold"
                  >
                    Save Status
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Members List with 1-Click Profile Switching */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                All Family Members (Click to switch who you chat as)
              </h4>
              <span className="text-xs text-slate-500">
                {members.length} members
              </span>
            </div>

            <div className="grid gap-2.5">
              {members.map((member) => {
                const isActive = member.id === activeMemberId;
                return (
                  <div
                    key={member.id}
                    className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between ${
                      isActive
                        ? 'border-emerald-500/40 bg-emerald-50/30'
                        : 'border-slate-200/80 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-xs ${member.avatarColor}`}
                      >
                        {member.name.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-slate-900">
                            {member.name}
                          </span>
                          <span className="text-xs text-slate-500">
                            ({member.role})
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                          <span className="flex items-center gap-1">
                            <span>{member.statusEmoji}</span>
                            <span className="truncate max-w-[150px]">{member.status}</span>
                          </span>
                          {member.location && (
                            <span className="hidden sm:flex items-center gap-1 text-slate-400">
                              <MapPin className="w-3 h-3 text-slate-400" />
                              <span>{member.location}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {member.batteryLevel !== undefined && (
                        <div className="hidden sm:flex items-center gap-1 text-xs text-slate-400" title={`Battery ${member.batteryLevel}%`}>
                          <Battery className="w-3.5 h-3.5 text-slate-400" />
                          <span>{member.batteryLevel}%</span>
                        </div>
                      )}

                      {isActive ? (
                        <span className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-semibold flex items-center gap-1">
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

          {/* Add New Member Form */}
          {isAddingNew ? (
            <form onSubmit={handleCreateMember} className="p-4 rounded-2xl border border-slate-300 bg-slate-50 space-y-3">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                Add Family Member
              </h4>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Full Name (e.g. Uncle Peter)"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="px-3 py-2 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                  autoFocus
                />
                <input
                  type="text"
                  placeholder="Role (e.g. Uncle / Cousin)"
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="px-3 py-2 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

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

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddingNew(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-medium text-white bg-slate-900 rounded-xl hover:bg-slate-800 transition-colors"
                >
                  Add to Family Circle
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setIsAddingNew(true)}
              className="w-full py-3 border border-dashed border-slate-300 rounded-2xl text-slate-600 hover:text-slate-900 hover:border-slate-400 hover:bg-slate-50 transition-all text-xs font-semibold flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Another Family Member or Pet</span>
            </button>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span>Private and secure family circle</span>
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
