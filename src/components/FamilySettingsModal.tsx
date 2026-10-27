import React, { useState } from 'react';
import { 
  X, 
  Settings, 
  Download, 
  Check, 
  FileJson, 
  Shield, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  RotateCcw, 
  MessageCircle, 
  Users, 
  Calendar, 
  Clock, 
  Database,
  Lock,
  Edit2,
  User,
  KeyRound,
  Mail,
  Camera,
  CheckCircle2,
  Crown
} from 'lucide-react';
import { 
  Channel, 
  ChoreItem, 
  FamilyEvent, 
  FamilyMember, 
  GroceryItem, 
  Message, 
  QuickNotice, 
  DailyCheckInRecord,
  AdminCredentials 
} from '../types/family';
import { playSuccessCelebration } from '../utils/audio';

interface FamilySettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeMember: FamilyMember;
  onUpdateMember: (updated: FamilyMember) => void;
  familyName: string;
  onUpdateFamilyName: (name: string) => void;
  isLivelyMode: boolean;
  onToggleLivelyMode: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  isAdminLoggedIn: boolean;
  onOpenAdminLogin: () => void;
  onAdminLogout: () => void;
  adminCredentials: AdminCredentials;
  onUpdateAdminCredentials: (creds: AdminCredentials) => void;
  members: FamilyMember[];
  channels: Channel[];
  messages: Message[];
  events: FamilyEvent[];
  notices: QuickNotice[];
  checkInHistory: DailyCheckInRecord[];
  onResetData: () => void;
}

export const FamilySettingsModal: React.FC<FamilySettingsModalProps> = ({
  isOpen,
  onClose,
  activeMember,
  onUpdateMember,
  familyName,
  onUpdateFamilyName,
  isLivelyMode,
  onToggleLivelyMode,
  isMuted,
  onToggleMute,
  isAdminLoggedIn,
  onOpenAdminLogin,
  onAdminLogout,
  adminCredentials,
  onUpdateAdminCredentials,
  members,
  channels,
  messages,
  events,
  notices,
  checkInHistory,
  onResetData,
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'admin' | 'general' | 'export'>('profile');
  const [isEditingFamilyName, setIsEditingFamilyName] = useState(false);
  const [tempFamilyName, setTempFamilyName] = useState(familyName);
  const [downloadSuccessNotice, setDownloadSuccessNotice] = useState<{ filename: string; sizeKb: number } | null>(null);

  // Profile Edit State for Active Member
  const [profileName, setProfileName] = useState(activeMember.name);
  const [profileEmail, setProfileEmail] = useState(activeMember.email || '');
  const [profilePassword, setProfilePassword] = useState(activeMember.password || '');
  const [profileAvatarColor, setProfileAvatarColor] = useState(activeMember.avatarColor);
  const [profileStatus, setProfileStatus] = useState(activeMember.status);
  const [profileStatusEmoji, setProfileStatusEmoji] = useState(activeMember.statusEmoji);
  const [profileIsOnline, setProfileIsOnline] = useState(activeMember.isOnline);
  const [profileSavedFeedback, setProfileSavedFeedback] = useState(false);

  // Admin Credentials Update State (Specifically for Admin)
  const [adminEmailInput, setAdminEmailInput] = useState(adminCredentials.email);
  const [adminPasswordInput, setAdminPasswordInput] = useState(adminCredentials.password);
  const [adminCredsSuccess, setAdminCredsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileName.trim()) return;

    const updated: FamilyMember = {
      ...activeMember,
      name: profileName.trim(),
      email: profileEmail.trim(),
      password: profilePassword,
      avatarColor: profileAvatarColor,
      status: profileStatus.trim(),
      statusEmoji: profileStatusEmoji,
      isOnline: profileIsOnline,
    };

    onUpdateMember(updated);
    setProfileSavedFeedback(true);
    setTimeout(() => setProfileSavedFeedback(false), 3000);
  };

  const handleSaveAdminCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminEmailInput.trim() || !adminPasswordInput.trim()) return;

    onUpdateAdminCredentials({
      ...adminCredentials,
      email: adminEmailInput.trim().toLowerCase(),
      password: adminPasswordInput.trim(),
    });

    // Also update active member if active member is the admin
    if (activeMember.isAdmin) {
      onUpdateMember({
        ...activeMember,
        email: adminEmailInput.trim().toLowerCase(),
        password: adminPasswordInput.trim(),
      });
    }

    setAdminCredsSuccess(true);
    setTimeout(() => setAdminCredsSuccess(false), 3000);
  };

  const handleSaveFamilyName = (e: React.FormEvent) => {
    e.preventDefault();
    if (tempFamilyName.trim()) {
      onUpdateFamilyName(tempFamilyName.trim());
    }
    setIsEditingFamilyName(false);
  };

  const handleExportHistory = () => {
    const timestamp = new Date().toISOString();
    const payload = {
      archiveTitle: `${familyName} - Generational Lineage Archive`,
      app: 'Kinfolk Private Lineage Hub',
      version: '2.0',
      exportTimestamp: timestamp,
      familyName,
      stats: {
        totalMessages: messages.length,
        totalMembers: members.length,
        totalChannels: channels.length,
        totalDailyCheckIns: checkInHistory.length,
        totalEvents: events.length,
      },
      members,
      channels,
      messages,
      events,
    };

    const jsonStr = JSON.stringify(payload, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const filename = `${familyName.toLowerCase().replace(/\s+/g, '_')}_archive_${new Date().toISOString().slice(0, 10)}.json`;

    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setDownloadSuccessNotice({ filename, sizeKb: Math.round(blob.size / 1024) });
    playSuccessCelebration();
  };

  const avatarColors = [
    'bg-emerald-600',
    'bg-teal-600',
    'bg-indigo-600',
    'bg-purple-600',
    'bg-rose-600',
    'bg-amber-600',
    'bg-sky-600',
    'bg-slate-700',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-700 flex items-center justify-center font-bold">
              <Settings className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 font-display flex items-center gap-2">
                <span>Family & Profile Settings</span>
              </h3>
              <p className="text-xs text-slate-500">
                Manage your personal profile, admin credentials, and lineage configuration
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

        {/* Navigation Tabs */}
        <div className="px-6 pt-3 pb-1 border-b border-slate-100 flex items-center gap-2 bg-white text-xs">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-3.5 py-1.5 rounded-xl font-semibold transition-colors flex items-center gap-1.5 ${
              activeTab === 'profile'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <User className="w-3.5 h-3.5 text-emerald-400" />
            <span>My Profile & Presence</span>
          </button>

          {activeMember.isAdmin && (
            <button
              onClick={() => setActiveTab('admin')}
              className={`px-3.5 py-1.5 rounded-xl font-semibold transition-colors flex items-center gap-1.5 ${
                activeTab === 'admin'
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Shield className="w-3.5 h-3.5 text-indigo-400" />
              <span>Admin Credentials</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab('general')}
            className={`px-3.5 py-1.5 rounded-xl font-semibold transition-colors flex items-center gap-1.5 ${
              activeTab === 'general'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Preferences</span>
          </button>

          <button
            onClick={() => setActiveTab('export')}
            className={`px-3.5 py-1.5 rounded-xl font-semibold transition-colors flex items-center gap-1.5 ${
              activeTab === 'export'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Export Archive</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          
          {/* TAB 1: MY PROFILE & PRESENCE (Self-management) */}
          {activeTab === 'profile' && (
            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Personal Member Profile</h4>
                  <p className="text-slate-500 text-[11px]">
                    Members can edit their own names, photos, passwords, and online visibility
                  </p>
                </div>
                {profileSavedFeedback && (
                  <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-xl font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Saved!</span>
                  </span>
                )}
              </div>

              {/* Online / Offline Presence Selector */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-800 text-xs">Live Presence Status</span>
                  <p className="text-[11px] text-slate-500">
                    Controls whether other family members see you as Online or Offline
                  </p>
                </div>
                <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setProfileIsOnline(true)}
                    className={`px-3 py-1 rounded-lg font-bold flex items-center gap-1.5 transition-all ${
                      profileIsOnline
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-300" />
                    <span>Online</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setProfileIsOnline(false)}
                    className={`px-3 py-1 rounded-lg font-bold flex items-center gap-1.5 transition-all ${
                      !profileIsOnline
                        ? 'bg-slate-700 text-white shadow-xs'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-slate-400" />
                    <span>Offline</span>
                  </button>
                </div>
              </div>

              {/* Name & Avatar */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Display Name</label>
                  <input
                    type="text"
                    required
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Your Email</label>
                  <input
                    type="email"
                    value={profileEmail}
                    onChange={(e) => setProfileEmail(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-slate-700 font-bold mb-1">Personal Login Password</label>
                <div className="relative">
                  <KeyRound className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={profilePassword}
                    onChange={(e) => setProfilePassword(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 text-xs border border-slate-200 rounded-xl font-mono"
                    placeholder="Enter new password"
                  />
                </div>
              </div>

              {/* Avatar Color Picker */}
              <div>
                <label className="block text-slate-700 font-bold mb-1.5">Avatar Color & Icon</label>
                <div className="flex items-center gap-2">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-white font-bold text-base shadow-xs ${profileAvatarColor}`}>
                    {profileName.charAt(0) || 'U'}
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {avatarColors.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setProfileAvatarColor(color)}
                        className={`w-6 h-6 rounded-full ${color} transition-transform ${
                          profileAvatarColor === color ? 'ring-2 ring-slate-900 ring-offset-2 scale-110' : 'opacity-80 hover:opacity-100'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Status and Emoji */}
              <div className="grid grid-cols-4 gap-2">
                <div className="col-span-1">
                  <label className="block text-slate-700 font-bold mb-1">Status Emoji</label>
                  <input
                    type="text"
                    value={profileStatusEmoji}
                    onChange={(e) => setProfileStatusEmoji(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl text-center text-base"
                  />
                </div>
                <div className="col-span-3">
                  <label className="block text-slate-700 font-bold mb-1">Custom Status Note</label>
                  <input
                    type="text"
                    value={profileStatus}
                    onChange={(e) => setProfileStatus(e.target.value)}
                    placeholder="What are you doing today?"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
                >
                  Save Profile Changes
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: ADMIN CREDENTIALS (Admin manages own username & password) */}
          {activeTab === 'admin' && activeMember.isAdmin && (
            <form onSubmit={handleSaveAdminCredentials} className="space-y-4 text-xs">
              <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200/80 space-y-1">
                <div className="flex items-center gap-2 text-indigo-900 font-bold text-sm">
                  <Crown className="w-4 h-4 text-indigo-600" />
                  <span>Admin Credentials Self-Management</span>
                </div>
                <p className="text-[11px] text-indigo-700 leading-relaxed">
                  As the Family Head Admin, you hold full authority over this platform. You can update your own administrative username/email and login password here.
                </p>
              </div>

              {adminCredsSuccess && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Admin credentials updated successfully!</span>
                </div>
              )}

              <div>
                <label className="block text-slate-700 font-bold mb-1">Admin Username / Email</label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    value={adminEmailInput}
                    onChange={(e) => setAdminEmailInput(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 text-xs border border-slate-200 rounded-xl font-mono focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Admin Password</label>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={adminPasswordInput}
                    onChange={(e) => setAdminPasswordInput(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 text-xs border border-slate-200 rounded-xl font-mono focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
                >
                  Save Admin Credentials
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: GENERAL PREFERENCES */}
          {activeTab === 'general' && (
            <div className="space-y-4 text-xs">
              {/* Family Lineage Title */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900">Family Lineage Title</span>
                    <p className="text-[11px] text-slate-500">
                      The official family name displayed across the lineage hub
                    </p>
                  </div>
                  {!isEditingFamilyName && (
                    <button
                      onClick={() => setIsEditingFamilyName(true)}
                      className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-semibold"
                    >
                      Rename
                    </button>
                  )}
                </div>

                {isEditingFamilyName ? (
                  <form onSubmit={handleSaveFamilyName} className="flex gap-2 pt-1">
                    <input
                      type="text"
                      value={tempFamilyName}
                      onChange={(e) => setTempFamilyName(e.target.value)}
                      className="flex-1 px-3 py-1.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900"
                      autoFocus
                    />
                    <button
                      type="submit"
                      className="px-3.5 py-1.5 bg-slate-900 text-white rounded-xl font-bold"
                    >
                      Save
                    </button>
                  </form>
                ) : (
                  <p className="font-bold text-slate-900 text-sm font-display">{familyName}</p>
                )}
              </div>

              {/* Sound Effects */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 flex items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    {isMuted ? <VolumeX className="w-4 h-4 text-rose-500" /> : <Volume2 className="w-4 h-4 text-emerald-600" />}
                    <span className="font-bold text-slate-900">Chimes & Audio FX</span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Play pleasant audio feedback for sent messages and milestone blessings
                  </p>
                </div>
                <button
                  onClick={onToggleMute}
                  className={`w-10 h-6 rounded-full transition-colors relative ${
                    !isMuted ? 'bg-emerald-500' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                      !isMuted ? 'left-5' : 'left-1'
                    }`}
                  />
                </button>
              </div>

              {/* Reset State */}
              <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-800">Pristine Reset</span>
                  <p className="text-[10px] text-slate-400">Restore clean slate with only Admin Mary</p>
                </div>
                <button
                  onClick={onResetData}
                  className="px-3 py-1.5 text-xs text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Chat</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: EXPORT ARCHIVE */}
          {activeTab === 'export' && (
            <div className="space-y-4">
              <div className="p-5 rounded-3xl bg-slate-900 text-white border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-base font-bold font-display">Export Lineage History</h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Download a complete backup of all conversations, members, and celebrations
                    </p>
                  </div>
                  <FileJson className="w-8 h-8 text-emerald-400" />
                </div>

                <div className="grid grid-cols-3 gap-2 pt-2 text-xs">
                  <div className="p-2 bg-white/5 rounded-xl border border-white/10">
                    <span className="text-[10px] text-slate-400 block">Messages</span>
                    <span className="font-bold font-mono text-sm">{messages.length}</span>
                  </div>
                  <div className="p-2 bg-white/5 rounded-xl border border-white/10">
                    <span className="text-[10px] text-slate-400 block">Members</span>
                    <span className="font-bold font-mono text-sm">{members.length}</span>
                  </div>
                  <div className="p-2 bg-white/5 rounded-xl border border-white/10">
                    <span className="text-[10px] text-slate-400 block">Events</span>
                    <span className="font-bold font-mono text-sm">{events.length}</span>
                  </div>
                </div>

                <button
                  onClick={handleExportHistory}
                  className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-md transition-colors"
                >
                  <Download className="w-4 h-4 text-slate-950" />
                  <span>Download Family Archive (.json)</span>
                </button>
              </div>

              {downloadSuccessNotice && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Downloaded {downloadSuccessNotice.filename} ({downloadSuccessNotice.sizeKb} KB)</span>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50/70 flex items-center justify-between">
          <span className="text-[11px] text-slate-400 font-mono">Kinfolk Lineage Platform</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-xl hover:bg-slate-800 transition-colors"
          >
            Close Settings
          </button>
        </div>

      </div>
    </div>
  );
};
