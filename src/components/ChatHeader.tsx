import React, { useState } from 'react';
import { 
  Phone, 
  Video, 
  Search, 
  Pin, 
  Volume2, 
  VolumeX, 
  Users, 
  Info,
  Menu,
  Sparkles,
  ChevronDown,
  Shield,
  KeyRound,
  Mail,
  LogIn,
  Settings,
  Crown
} from 'lucide-react';
import { Channel, FamilyMember } from '../types/family';
import { DailyFamilyInsight } from './DailyFamilyInsight';

interface ChatHeaderProps {
  currentChannel: Channel;
  activeMember: FamilyMember;
  allMembers: FamilyMember[];
  isMuted: boolean;
  onToggleMute: () => void;
  onStartCall: () => void;
  onOpenMembersModal: () => void;
  onOpenNoticeBoard: () => void;
  onToggleSidebarMobile: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  isAdminLoggedIn?: boolean;
  onOpenAdminLogin?: () => void;
  onOpenDailyCheckIn?: () => void;
  onInsertPromptToChat?: (promptText: string) => void;
  onOpenRegisterMember?: () => void;
  onOpenMemberLogin?: () => void;
  onOpenSettings?: () => void;
  isPresencePanelOpen?: boolean;
  onTogglePresencePanel?: () => void;
  onOpenFamilyUnitsModal?: () => void;
  onToggleOnlinePresence?: (memberId: string) => void;
  onSignOut?: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  currentChannel,
  activeMember,
  allMembers,
  isMuted,
  onToggleMute,
  onStartCall,
  onOpenMembersModal,
  onOpenNoticeBoard,
  onToggleSidebarMobile,
  searchQuery,
  onSearchChange,
  isAdminLoggedIn,
  onOpenAdminLogin,
  onOpenDailyCheckIn,
  onInsertPromptToChat,
  onOpenRegisterMember,
  onOpenMemberLogin,
  onOpenSettings,
  isPresencePanelOpen,
  onTogglePresencePanel,
  onOpenFamilyUnitsModal,
  onToggleOnlinePresence,
  onSignOut,
}) => {
  const [isPinnedDismissed, setIsPinnedDismissed] = useState(false);

  return (
    <div className="border-b border-slate-200/80 bg-white shrink-0">
      {/* Main Top Bar */}
      <div className="px-4 py-3 sm:px-6 flex items-center justify-between gap-3">
        {/* Left: Mobile hamburger + Channel identity */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onToggleSidebarMobile}
            className="md:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            title="Open Channels Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-lg shrink-0">
                {currentChannel.name === 'general' ? '🛋️' : currentChannel.name === 'celebrations' ? '🎉' : currentChannel.name === 'lineage' ? '🌳' : '💬'}
              </span>
              <h2 className="text-base font-bold text-slate-900 truncate font-display">
                {currentChannel.name === 'general'
                  ? 'Family Living Room'
                  : currentChannel.name === 'celebrations'
                  ? 'Weddings & Celebrations'
                  : currentChannel.name === 'lineage'
                  ? 'Lineage & Heritage'
                  : `#${currentChannel.name}`}
              </h2>
            </div>
            <p className="text-xs text-slate-500 truncate hidden sm:block">
              {currentChannel.description || 'Private family conversation & daily connection'}
            </p>
          </div>
        </div>

        {/* Right Actions Zone */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          
          {/* Persistent Text Search Input */}
          <div className="flex items-center bg-slate-100/90 focus-within:bg-white focus-within:ring-2 focus-within:ring-slate-900 focus-within:border-transparent rounded-xl px-2.5 py-1.5 text-xs border border-slate-200 transition-all w-28 sm:w-44 md:w-56 shrink-0">
            <Search className="w-3.5 h-3.5 text-slate-400 mr-1.5 shrink-0" />
            <input
              type="text"
              placeholder={`Search #${currentChannel.name}...`}
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="bg-transparent focus:outline-none text-slate-800 w-full text-xs placeholder:text-slate-400"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="text-slate-400 hover:text-slate-600 ml-1 p-0.5 rounded-full hover:bg-slate-200 transition-colors"
                title="Clear search"
              >
                ✕
              </button>
            )}
          </div>

          {/* Group Call Button */}
          <button
            onClick={onStartCall}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200/80 rounded-xl text-xs font-semibold transition-colors"
            title="Start Family Live Voice/Video Call"
          >
            <Phone className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Family Call</span>
          </button>

          {/* Active / Inactive Presence Toggle */}
          {onTogglePresencePanel && (
            <button
              onClick={onTogglePresencePanel}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                isPresencePanelOpen
                  ? 'bg-emerald-600 border-emerald-600 text-white shadow-2xs'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
              title={isPresencePanelOpen ? 'Hide Active/Inactive Members Panel' : 'Show Active/Inactive Members Panel'}
            >
              <Users className={`w-3.5 h-3.5 ${isPresencePanelOpen ? 'text-emerald-200' : 'text-slate-500'}`} />
              <span className="flex items-center gap-1 font-mono text-[11px]">
                <span className={isPresencePanelOpen ? 'text-white font-bold' : 'text-emerald-600 font-bold'}>
                  ● {allMembers.filter((m) => m.isOnline).length} Active
                </span>
                <span className={isPresencePanelOpen ? 'text-emerald-200' : 'text-slate-400'}>
                  • {allMembers.filter((m) => !m.isOnline).length} Inactive
                </span>
              </span>
            </button>
          )}

          {/* Family Units & Appointed Leaders Button */}
          {onOpenFamilyUnitsModal && (
            <button
              onClick={onOpenFamilyUnitsModal}
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100/90 text-amber-900 border border-amber-200/80 text-xs font-semibold transition-colors"
              title="Family Units & Leader Management"
            >
              <Crown className="w-3.5 h-3.5 text-amber-600" />
              <span className="hidden xl:inline">Units & Leaders</span>
            </button>
          )}

          {/* Mute/Sound Toggle */}
          <button
            onClick={onToggleMute}
            className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            title={isMuted ? 'Unmute sounds' : 'Mute sounds'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-slate-400" /> : <Volume2 className="w-4 h-4 text-emerald-600" />}
          </button>

          {/* Family Settings & Archive Button */}
          {onOpenSettings && (
            <button
              onClick={onOpenSettings}
              className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              title="Family Settings & Export Archive"
            >
              <Settings className="w-4 h-4 text-slate-600" />
            </button>
          )}

          {/* Invite Member Action */}
          {onOpenRegisterMember && (
            <button
              onClick={onOpenRegisterMember}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-2xs"
              title="Register a new family member & send credentials email"
            >
              <Mail className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Invite Member</span>
            </button>
          )}

          {/* Member Sign In Action */}
          {onOpenMemberLogin && (
            <button
              onClick={onOpenMemberLogin}
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors border border-slate-200"
              title="Sign in with member credentials"
            >
              <LogIn className="w-3.5 h-3.5 text-emerald-600" />
              <span>Sign In</span>
            </button>
          )}

          {/* Notice Board Button */}
          <button
            onClick={onOpenNoticeBoard}
            className="hidden sm:flex items-center gap-1.5 p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            title="Family Bulletin & Wi-Fi"
          >
            <Pin className="w-4 h-4" />
          </button>

          {/* Admin Login / Admin Status Action */}
          {onOpenAdminLogin && (
            <button
              onClick={onOpenAdminLogin}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold transition-colors border ${
                isAdminLoggedIn
                  ? 'bg-slate-900 border-slate-800 text-white hover:bg-slate-800 shadow-2xs'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
              }`}
              title={isAdminLoggedIn ? 'Main member admin active - click to manage' : 'Log in as main member with admin credentials'}
            >
              <Shield className={`w-3.5 h-3.5 ${isAdminLoggedIn ? 'text-emerald-400' : 'text-slate-400'}`} />
              <span className="hidden sm:inline">
                {isAdminLoggedIn ? 'Admin Active' : 'Admin Login'}
              </span>
            </button>
          )}

          {/* Daily Check-in Quick Pill */}
          {onOpenDailyCheckIn && (
            <button
              onClick={onOpenDailyCheckIn}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-50 hover:bg-amber-100/80 text-amber-900 border border-amber-200/80 text-xs font-semibold transition-colors shrink-0"
              title="Daily Check-in: Share today's mood and status"
            >
              <span>{activeMember.moodEmoji || '☀️'}</span>
              <span className="hidden md:inline">{activeMember.shortStatus || 'Daily Check-in'}</span>
            </button>
          )}

          {/* Active Member Switcher Pill */}
          <button
            onClick={onOpenMembersModal}
            className="flex items-center gap-2 pl-2 pr-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors border border-slate-200/70"
            title="Switch chatting profile"
          >
            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0 relative ${activeMember.avatarColor}`}>
              {activeMember.name.charAt(0)}
              <span
                className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-white ${
                  activeMember.isOnline ? 'bg-emerald-500' : 'bg-slate-400'
                }`}
              />
            </div>
            <div className="flex items-center gap-1 min-w-0">
              <span className="text-xs font-bold truncate max-w-[90px] sm:max-w-none text-slate-900">
                {activeMember.name}
              </span>
              {activeMember.familyRole && (
                <span className="text-[9px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-1 py-0.2 rounded shrink-0">
                  {activeMember.familyRole}
                </span>
              )}
            </div>
            <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
          </button>

          {/* Quick Online/Offline Toggle */}
          {onToggleOnlinePresence && (
            <button
              onClick={() => onToggleOnlinePresence(activeMember.id)}
              className={`flex items-center gap-1 px-2 py-1 rounded-xl text-[11px] font-bold border transition-colors ${
                activeMember.isOnline
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                  : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
              }`}
              title="Click to toggle your presence: Online vs Offline"
            >
              <span className={`w-2 h-2 rounded-full ${activeMember.isOnline ? 'bg-emerald-500' : 'bg-slate-400'}`} />
              <span className="hidden sm:inline">{activeMember.isOnline ? 'Online' : 'Offline'}</span>
            </button>
          )}

          {/* Sign Out to Lineage Gate */}
          {onSignOut && (
            <button
              onClick={onSignOut}
              className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
              title="Sign Out to Lineage Portal"
            >
              <LogIn className="w-4 h-4 rotate-180" />
            </button>
          )}

        </div>
      </div>

      {/* Daily Family Insight Component */}
      <DailyFamilyInsight
        onInsertPromptToChat={onInsertPromptToChat || (() => {})}
        channelName={currentChannel.name}
      />

      {/* Pinned Channel Notice Banner */}
      {currentChannel.pinnedNotice && !isPinnedDismissed && (
        <div className="px-4 py-2 bg-amber-50/70 border-t border-amber-100 flex items-center justify-between text-xs text-amber-900">
          <div className="flex items-center gap-2 truncate">
            <Pin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span className="font-semibold shrink-0">Pinned Notice:</span>
            <span className="truncate">{currentChannel.pinnedNotice}</span>
          </div>
          <button
            onClick={() => setIsPinnedDismissed(true)}
            className="text-amber-700 hover:text-amber-900 text-xs ml-2 font-medium"
          >
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
};
