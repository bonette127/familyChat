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
  Edit2
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
  // Archive data
  members: FamilyMember[];
  channels: Channel[];
  messages: Message[];
  groceries: GroceryItem[];
  chores: ChoreItem[];
  events: FamilyEvent[];
  notices: QuickNotice[];
  checkInHistory: DailyCheckInRecord[];
  onResetData: () => void;
}

export const FamilySettingsModal: React.FC<FamilySettingsModalProps> = ({
  isOpen,
  onClose,
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
  groceries,
  chores,
  events,
  notices,
  checkInHistory,
  onResetData,
}) => {
  const [activeTab, setActiveTab] = useState<'export' | 'general' | 'admin'>('export');
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempFamilyName, setTempFamilyName] = useState(familyName);
  const [downloadSuccessNotice, setDownloadSuccessNotice] = useState<{ filename: string; sizeKb: number } | null>(null);

  if (!isOpen) return null;

  const handleExportHistory = () => {
    const timestamp = new Date().toISOString();
    const dateFormatted = new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    // Comprehensive archive payload
    const archivePayload = {
      archiveTitle: 'Kinfolk Family Chat & Hub - Complete History Archive',
      app: 'Kinfolk Private Family Chat',
      version: '1.0',
      exportTimestamp: timestamp,
      exportFormattedDate: dateFormatted,
      familyName: familyName,
      stats: {
        totalMessages: messages.length,
        totalMembers: members.length,
        totalChannels: channels.length,
        totalDailyCheckIns: checkInHistory.length,
        totalGroceries: groceries.length,
        totalChores: chores.length,
        totalEvents: events.length,
        totalNotices: notices.length,
      },
      members: members.map((m) => ({
        id: m.id,
        name: m.name,
        role: m.role,
        relationship: m.relationship,
        hometown: m.hometown,
        email: m.email,
        shortStatus: m.shortStatus,
        moodEmoji: m.moodEmoji,
        lastCheckInTime: m.lastCheckInTime,
        checkInNote: m.checkInNote,
        isAdmin: m.isAdmin,
        hasChatAccess: m.hasChatAccess,
      })),
      channels: channels,
      messages: messages.map((msg) => ({
        id: msg.id,
        channelId: msg.channelId,
        senderId: msg.senderId,
        senderName: members.find((m) => m.id === msg.senderId)?.name || msg.senderId,
        content: msg.content,
        timestamp: msg.timestamp,
        reactions: msg.reactions,
        readBy: msg.readBy,
        isPinned: msg.isPinned,
        attachments: msg.attachments,
        poll: msg.poll,
        replyTo: msg.replyTo,
      })),
      dailyCheckInHistory: checkInHistory,
      groceries: groceries,
      chores: chores,
      events: events,
      notices: notices,
    };

    const jsonString = JSON.stringify(archivePayload, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const safeFamilyName = familyName.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const filename = `${safeFamilyName}-history-archive-${new Date().toISOString().slice(0, 10)}.json`;

    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    const sizeKb = Math.round(blob.size / 1024) || 1;
    setDownloadSuccessNotice({ filename, sizeKb });
    playSuccessCelebration(isMuted);

    setTimeout(() => {
      setDownloadSuccessNotice(null);
    }, 7000);
  };

  const handleSaveName = (e: React.FormEvent) => {
    e.preventDefault();
    if (tempFamilyName.trim()) {
      onUpdateFamilyName(tempFamilyName.trim());
      setIsEditingName(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/65 backdrop-blur-sm p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-xs">
              <Settings className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 font-display flex items-center gap-2">
                <span>Family Settings & Data Archive</span>
              </h3>
              <p className="text-xs text-slate-500">
                Manage circle preferences, export complete chat history, and configure admin security
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

        {/* Tab Switcher */}
        <div className="px-6 pt-3 pb-1 border-b border-slate-100 flex items-center gap-2 bg-white">
          <button
            onClick={() => setActiveTab('export')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              activeTab === 'export'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Export Family History</span>
          </button>

          <button
            onClick={() => setActiveTab('general')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              activeTab === 'general'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>General Preferences</span>
          </button>

          <button
            onClick={() => setActiveTab('admin')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              activeTab === 'admin'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Shield className="w-3.5 h-3.5 text-indigo-400" />
            <span>Admin & Security</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          
          {/* TAB 1: EXPORT FAMILY HISTORY */}
          {activeTab === 'export' && (
            <div className="space-y-4">
              {/* Highlight Hero Card */}
              <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-850 to-indigo-950 text-white border border-slate-800 shadow-xl space-y-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 relative z-10">
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/20 border border-emerald-500/30 px-2 py-0.5 rounded-full inline-block">
                      Data Archiving & Backup
                    </span>
                    <h4 className="text-lg font-bold text-white font-display">
                      Export Complete Family History
                    </h4>
                    <p className="text-xs text-slate-300 max-w-md leading-relaxed">
                      Generate a downloadable JSON archive of all family messages, shared photos, voice notes,
                      dinner polls, daily check-in wellness logs, lists, and member profiles for safe archiving.
                    </p>
                  </div>

                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
                    <FileJson className="w-6 h-6 text-emerald-400" />
                  </div>
                </div>

                {/* Archive Stats Breakdown */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-3 border-t border-slate-800 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
                    <span className="text-[10px] text-slate-400 block mb-0.5">Chat Messages</span>
                    <span className="font-bold text-white font-mono text-sm">{messages.length}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
                    <span className="text-[10px] text-slate-400 block mb-0.5">Family Members</span>
                    <span className="font-bold text-white font-mono text-sm">{members.length}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
                    <span className="text-[10px] text-slate-400 block mb-0.5">Daily Check-ins</span>
                    <span className="font-bold text-white font-mono text-sm">{checkInHistory.length}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
                    <span className="text-[10px] text-slate-400 block mb-0.5">Lists & Events</span>
                    <span className="font-bold text-white font-mono text-sm">{events.length + groceries.length + chores.length}</span>
                  </div>
                </div>

                {/* Export Action Button */}
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 relative z-10">
                  <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
                    <Database className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Formatted as standard JSON with full timestamps</span>
                  </span>

                  <button
                    onClick={handleExportHistory}
                    className="w-full sm:w-auto px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all active:scale-98"
                  >
                    <Download className="w-4 h-4 text-slate-950" />
                    <span>Download Family Archive (.json)</span>
                  </button>
                </div>
              </div>

              {/* Success Notification Alert */}
              {downloadSuccessNotice && (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-1 text-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-emerald-500 text-white flex items-center justify-center shrink-0">
                      <Check className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold">Archive Downloaded Successfully!</p>
                      <p className="text-[11px] text-emerald-800 mt-0.5 font-mono">
                        {downloadSuccessNotice.filename} (~{downloadSuccessNotice.sizeKb} KB)
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setDownloadSuccessNotice(null)}
                    className="text-emerald-700 hover:text-emerald-900 font-bold text-xs"
                  >
                    ✕
                  </button>
                </div>
              )}

              {/* Educational Note */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-600 space-y-1">
                <p className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  <span>How archiving works</span>
                </p>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Your archive includes every channel thread, timestamped reaction, message attachment URL,
                  chore task, and mood log. You can safely store this JSON file on an external drive or cloud drive for permanent family records.
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: GENERAL PREFERENCES */}
          {activeTab === 'general' && (
            <div className="space-y-4 text-xs">
              {/* Family Name */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900">Family Circle Name</span>
                    <p className="text-[11px] text-slate-500">Displayed in chat headers and invitation emails</p>
                  </div>
                  {!isEditingName && (
                    <button
                      onClick={() => setIsEditingName(true)}
                      className="px-2.5 py-1 text-slate-700 hover:bg-slate-200 rounded-lg font-semibold flex items-center gap-1"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>Edit</span>
                    </button>
                  )}
                </div>

                {isEditingName ? (
                  <form onSubmit={handleSaveName} className="flex gap-2 pt-1">
                    <input
                      type="text"
                      value={tempFamilyName}
                      onChange={(e) => setTempFamilyName(e.target.value)}
                      className="flex-1 px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-slate-900"
                    />
                    <button
                      type="submit"
                      className="px-3 py-1.5 bg-slate-900 text-white rounded-xl font-bold"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setTempFamilyName(familyName);
                        setIsEditingName(false);
                      }}
                      className="px-3 py-1.5 text-slate-600 hover:bg-slate-200 rounded-xl"
                    >
                      Cancel
                    </button>
                  </form>
                ) : (
                  <p className="font-bold text-slate-900 text-sm font-display">{familyName}</p>
                )}
              </div>

              {/* Lively Replies Simulator */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 flex items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span className="font-bold text-slate-900">Lively Family Simulation</span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Automatically simulates replies from Mom, Dad, and Liam to keep conversations interactive
                  </p>
                </div>
                <button
                  onClick={onToggleLivelyMode}
                  className={`w-10 h-6 rounded-full transition-colors relative ${
                    isLivelyMode ? 'bg-emerald-500' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                      isLivelyMode ? 'left-5' : 'left-1'
                    }`}
                  />
                </button>
              </div>

              {/* Audio Sound Effects */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 flex items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    {isMuted ? <VolumeX className="w-4 h-4 text-rose-500" /> : <Volume2 className="w-4 h-4 text-emerald-600" />}
                    <span className="font-bold text-slate-900">Acoustic Chimes & Audio FX</span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Play pleasant celesta sound effects for sent messages, reactions, and check-ins
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

              {/* Reset Demo */}
              <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-800">Reset Demo State</span>
                  <p className="text-[10px] text-slate-400">Restore default demo messages and members</p>
                </div>
                <button
                  onClick={onResetData}
                  className="px-3 py-1.5 text-xs text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Demo</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: ADMIN & SECURITY */}
          {activeTab === 'admin' && (
            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-indigo-600" />
                    <span className="font-bold text-slate-900">Administrator Authorization</span>
                  </div>
                  {isAdminLoggedIn ? (
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                      Logged In (Admin Active)
                    </span>
                  ) : (
                    <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full">
                      Member View (Admin Locked)
                    </span>
                  )}
                </div>

                <p className="text-[11px] text-slate-500">
                  Admins can grant chat permissions, register relatives, and manage member credentials.
                </p>

                <div className="flex gap-2 pt-1">
                  {isAdminLoggedIn ? (
                    <button
                      onClick={onAdminLogout}
                      className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold rounded-xl"
                    >
                      Log Out of Admin Mode
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        onClose();
                        onOpenAdminLogin();
                      }}
                      className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl"
                    >
                      Authenticate as Admin
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50/70 flex items-center justify-between">
          <span className="text-[11px] text-slate-400 font-mono">Kinfolk Family Hub v1.0</span>
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
