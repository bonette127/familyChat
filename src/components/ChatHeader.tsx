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
  ChevronDown
} from 'lucide-react';
import { Channel, FamilyMember } from '../types/family';

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
}) => {
  const [isSearching, setIsSearching] = useState(false);
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
              <h2 className="text-base font-bold text-slate-900 truncate font-display">
                #{currentChannel.name}
              </h2>
            </div>
            <p className="text-xs text-slate-500 truncate hidden sm:block">
              {currentChannel.description}
            </p>
          </div>
        </div>

        {/* Right Actions Zone */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          
          {/* Search bar expandable */}
          {isSearching ? (
            <div className="flex items-center bg-slate-100 rounded-xl px-2.5 py-1 text-xs border border-slate-200 animate-in fade-in duration-150">
              <Search className="w-3.5 h-3.5 text-slate-400 mr-1.5 shrink-0" />
              <input
                type="text"
                placeholder="Search channel..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="bg-transparent focus:outline-none text-slate-800 w-28 sm:w-44 text-xs"
                autoFocus
              />
              <button
                onClick={() => {
                  setIsSearching(false);
                  onSearchChange('');
                }}
                className="text-slate-400 hover:text-slate-600 ml-1"
              >
                ✕
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsSearching(true)}
              className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              title="Search messages"
            >
              <Search className="w-4 h-4" />
            </button>
          )}

          {/* Group Call Button */}
          <button
            onClick={onStartCall}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200/80 rounded-xl text-xs font-semibold transition-colors"
            title="Start Family Live Voice/Video Call"
          >
            <Phone className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Family Call</span>
          </button>

          {/* Mute/Sound Toggle */}
          <button
            onClick={onToggleMute}
            className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            title={isMuted ? 'Unmute sounds' : 'Mute sounds'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-slate-400" /> : <Volume2 className="w-4 h-4 text-emerald-600" />}
          </button>

          {/* Notice Board Button */}
          <button
            onClick={onOpenNoticeBoard}
            className="hidden sm:flex items-center gap-1.5 p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            title="Family Bulletin & Wi-Fi"
          >
            <Pin className="w-4 h-4" />
          </button>

          {/* Active Member Switcher Pill */}
          <button
            onClick={onOpenMembersModal}
            className="flex items-center gap-2 pl-2 pr-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors border border-slate-200/70"
            title="Switch chatting profile"
          >
            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-bold ${activeMember.avatarColor}`}>
              {activeMember.name.charAt(0)}
            </div>
            <span className="text-xs font-medium truncate max-w-[90px] sm:max-w-none">
              {activeMember.name}
            </span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

        </div>
      </div>

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
