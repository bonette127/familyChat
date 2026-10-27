import React, { useState } from 'react';
import { 
  Home, 
  Utensils, 
  Camera, 
  Calendar, 
  ShoppingCart, 
  MessageCircle, 
  Heart, 
  Plus, 
  Pin, 
  Users, 
  Sparkles, 
  RotateCcw,
  Battery,
  MapPin,
  ChevronRight,
  Shield,
  Crown,
  Edit2,
  X,
  FolderHeart,
  LogIn,
  Settings,
  CircleDot,
  Gift
} from 'lucide-react';
import { Channel, FamilyMember, Message, FamilyUnit } from '../types/family';

interface SidebarProps {
  familyName: string;
  onUpdateFamilyName: (name: string) => void;
  activeTab: 'chat' | 'album' | 'media' | 'celebrations' | 'calendar' | 'family';
  onSelectTab: (tab: 'chat' | 'album' | 'media' | 'celebrations' | 'calendar' | 'family') => void;
  channels: Channel[];
  activeChannelId: string;
  onSelectChannel: (channelId: string) => void;
  onAddChannel: (name: string, description: string) => void;
  members: FamilyMember[];
  familyUnits?: FamilyUnit[];
  activeMemberId: string;
  messages?: Message[];
  onOpenDailyCheckIn?: () => void;
  onOpenMembersModal: () => void;
  onOpenMemberLogin?: () => void;
  onOpenRegisterModal?: () => void;
  onOpenNoticeBoard: () => void;
  onOpenSettings?: () => void;
  isAdminLoggedIn?: boolean;
  onOpenAdminLogin?: () => void;
  onOpenSuperAdminModal?: () => void;
  onSignOut?: () => void;
  isLivelyMode: boolean;
  onToggleLivelyMode: () => void;
  onResetData: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  familyName,
  onUpdateFamilyName,
  activeTab,
  onSelectTab,
  channels,
  activeChannelId,
  onSelectChannel,
  onAddChannel,
  members,
  familyUnits = [],
  activeMemberId,
  messages = [],
  onOpenDailyCheckIn,
  onOpenMembersModal,
  onOpenMemberLogin,
  onOpenRegisterModal,
  onOpenNoticeBoard,
  onOpenSettings,
  isAdminLoggedIn,
  onOpenAdminLogin,
  onOpenSuperAdminModal,
  onSignOut,
  isLivelyMode,
  onToggleLivelyMode,
  onResetData,
  isMobileOpen,
  onCloseMobile,
}) => {
  const [isEditingFamilyName, setIsEditingFamilyName] = useState(false);
  const [tempFamilyName, setTempFamilyName] = useState(familyName);
  const [isAddingChannel, setIsAddingChannel] = useState(false);
  const [presenceFilter, setPresenceFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [newChannelName, setNewChannelName] = useState('');
  const [newChannelDesc, setNewChannelDesc] = useState('');

  const activeMember = members.find((m) => m.id === activeMemberId) || members[0];

  const getUnreadCount = (channelId: string) => {
    return messages.filter(
      (m) =>
        m.channelId === channelId &&
        m.senderId !== activeMemberId &&
        (!m.readBy || !m.readBy.includes(activeMemberId))
    ).length;
  };

  const handleSaveFamilyName = (e: React.FormEvent) => {
    e.preventDefault();
    if (tempFamilyName.trim()) {
      onUpdateFamilyName(tempFamilyName.trim());
    }
    setIsEditingFamilyName(false);
  };

  const handleCreateChannel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChannelName.trim()) return;
    onAddChannel(
      newChannelName.trim().toLowerCase().replace(/\s+/g, '-'),
      newChannelDesc.trim() || 'Custom family channel'
    );
    setNewChannelName('');
    setNewChannelDesc('');
    setIsAddingChannel(false);
  };

  const getChannelIcon = (name: string) => {
    switch (name) {
      case 'general':
        return <Home className="w-4 h-4" />;
      case 'dinner':
        return <Utensils className="w-4 h-4" />;
      case 'album':
        return <Camera className="w-4 h-4" />;
      case 'plans':
        return <Calendar className="w-4 h-4" />;
      case 'groceries':
        return <ShoppingCart className="w-4 h-4" />;
      case 'dm-mom':
        return <Heart className="w-4 h-4 text-rose-500" />;
      default:
        return <MessageCircle className="w-4 h-4" />;
    }
  };

  const groupChannels = channels.filter((c) => c.category === 'channel');
  const directChannels = channels.filter((c) => c.category === 'direct');

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs md:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-40 w-72 bg-white border-r border-slate-200/80 flex flex-col transition-transform duration-200 ease-in-out md:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Family Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          {isEditingFamilyName ? (
            <form onSubmit={handleSaveFamilyName} className="flex items-center gap-1.5 w-full">
              <input
                type="text"
                value={tempFamilyName}
                onChange={(e) => setTempFamilyName(e.target.value)}
                className="flex-1 px-2.5 py-1 text-sm font-bold border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 font-display"
                autoFocus
              />
              <button
                type="submit"
                className="px-2 py-1 bg-slate-900 text-white text-xs rounded-lg font-medium"
              >
                Save
              </button>
            </form>
          ) : (
            <div className="flex items-center justify-between w-full">
              <div
                onClick={() => {
                  setTempFamilyName(familyName);
                  setIsEditingFamilyName(true);
                }}
                className="cursor-pointer group flex items-center gap-2"
                title="Click to rename your family"
              >
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold text-sm shadow-2xs">
                  🏡
                </div>
                <div>
                  <h1 className="text-sm font-bold text-slate-900 font-display group-hover:text-emerald-700 flex items-center gap-1.5 transition-colors">
                    <span>{familyName}</span>
                    <Edit2 className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100" />
                  </h1>
                  <p className="text-[11px] text-slate-400">Private Family Circle</p>
                </div>
              </div>

              {/* Close button on mobile */}
              <button
                onClick={onCloseMobile}
                className="md:hidden p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Active Member Banner */}
        <div className="px-4 py-2.5 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between">
          <div
            onClick={onOpenMembersModal}
            className="flex items-center gap-2.5 cursor-pointer group flex-1 mr-2 min-w-0"
            title="Switch profile & permissions"
          >
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 ${activeMember.avatarColor}`}>
              {activeMember.name.charAt(0)}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="text-xs font-semibold text-slate-800 truncate group-hover:text-emerald-700">
                  {activeMember.name}
                </p>
                {activeMember.isAdmin && (
                  <span className="text-[9px] bg-indigo-100 text-indigo-700 font-bold px-1.5 py-0.2 rounded shrink-0">
                    Admin
                  </span>
                )}
              </div>
              <p className="text-[10px] text-slate-400 truncate flex items-center gap-1">
                {activeMember.hasChatAccess ? (
                  <span>{activeMember.role}</span>
                ) : (
                  <span className="text-rose-600 font-semibold">Chat restricted</span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {onOpenAdminLogin && (
              <button
                onClick={onOpenAdminLogin}
                className={`p-1.5 rounded-lg text-xs transition-colors ${
                  isAdminLoggedIn
                    ? 'text-emerald-700 bg-emerald-100/70 hover:bg-emerald-100'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/60'
                }`}
                title={isAdminLoggedIn ? 'Admin mode active' : 'Log in as main member'}
              >
                <Shield className="w-3.5 h-3.5" />
              </button>
            )}

            {onOpenMemberLogin && (
              <button
                onClick={onOpenMemberLogin}
                className="text-[11px] font-medium text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md transition-colors flex items-center gap-1 shadow-2xs"
                title="Sign in with member credentials"
              >
                <LogIn className="w-3 h-3 text-emerald-600" />
                <span>Sign In</span>
              </button>
            )}

            <button
              onClick={onOpenMembersModal}
              className="text-[11px] font-medium text-emerald-700 bg-emerald-100/60 hover:bg-emerald-100 px-2 py-0.5 rounded-md transition-colors"
            >
              Switch
            </button>
          </div>
        </div>

        {/* Daily Check-in Quick Card for Active Member */}
        <div className="px-4 py-2.5 bg-gradient-to-r from-amber-500/10 via-rose-500/5 to-transparent border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-lg shrink-0">{activeMember.moodEmoji || '☀️'}</span>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-800 truncate">
                  {activeMember.shortStatus || 'Not checked in'}
                </span>
              </div>
              <p className="text-[10px] text-slate-500 truncate">
                {activeMember.lastCheckInTime ? `Checked in ${activeMember.lastCheckInTime}` : "Tap to share today's status"}
              </p>
            </div>
          </div>

          <button
            onClick={onOpenDailyCheckIn}
            className="px-2.5 py-1 bg-white hover:bg-slate-50 text-slate-800 text-[11px] font-semibold border border-slate-200 rounded-lg shadow-2xs transition-colors shrink-0 flex items-center gap-1 active:scale-95"
            title="Daily Check-in (Mood & Status)"
          >
            <span>Check In</span>
          </button>
        </div>

        {/* Main Tab Navigators */}
        <div className="p-3 border-b border-slate-100 space-y-1">
          <button
            onClick={() => {
              onSelectTab('chat');
              onCloseMobile();
            }}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
              activeTab === 'chat'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <MessageCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <div className="text-left min-w-0">
              <span className="block font-bold text-xs truncate">Living Room Chat</span>
              <span className="text-[10px] opacity-75 font-normal block truncate">Family conversation feed</span>
            </div>
          </button>

          <button
            onClick={() => {
              onSelectTab('celebrations');
              onCloseMobile();
            }}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
              activeTab === 'celebrations'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-4 h-4 text-rose-400 shrink-0" />
            <div className="text-left min-w-0">
              <span className="block font-bold text-xs truncate">Milestones & Celebrations</span>
              <span className="text-[10px] opacity-75 font-normal block truncate">Weddings, birthdays & reunions</span>
            </div>
          </button>

          <button
            onClick={() => {
              onSelectTab('album');
              onCloseMobile();
            }}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
              activeTab === 'album'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Camera className="w-4 h-4 text-indigo-400 shrink-0" />
            <div className="text-left min-w-0">
              <span className="block font-bold text-xs truncate">Family Keepsakes</span>
              <span className="text-[10px] opacity-75 font-normal block truncate">Photos & scrapbook albums</span>
            </div>
          </button>

          <button
            onClick={() => {
              onSelectTab('media');
              onCloseMobile();
            }}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
              activeTab === 'media'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <FolderHeart className="w-4 h-4 text-rose-500 shrink-0" />
            <div className="text-left min-w-0">
              <span className="block font-bold text-xs truncate">Voice Notes & Audio</span>
              <span className="text-[10px] opacity-75 font-normal block truncate">Voice notes, music & recipes</span>
            </div>
          </button>

          <button
            onClick={() => {
              onSelectTab('calendar');
              onCloseMobile();
            }}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
              activeTab === 'calendar'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Calendar className="w-4 h-4 text-teal-400 shrink-0" />
            <div className="text-left min-w-0">
              <span className="block font-bold text-xs truncate">Gatherings & Birthdays</span>
              <span className="text-[10px] opacity-75 font-normal block truncate">Family calendar & trips</span>
            </div>
          </button>

          <button
            onClick={() => {
              onSelectTab('family');
              onCloseMobile();
            }}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
              activeTab === 'family'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Users className="w-4 h-4 text-amber-500 shrink-0" />
            <div className="text-left min-w-0">
              <span className="block font-bold text-xs truncate">Family Circle & Badges</span>
              <span className="text-[10px] opacity-75 font-normal block truncate">Check-ins & milestone awards</span>
            </div>
          </button>
        </div>

        {/* Scrollable Channels & Family Presence */}
        <div className="flex-1 overflow-y-auto p-3 space-y-5">
          
          {/* Family Channels */}
          <div>
            <div className="flex items-center justify-between px-2 mb-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Family Gathering Rooms
              </span>
              <button
                onClick={() => setIsAddingChannel(!isAddingChannel)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                title="Create Channel"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Inline Channel Creator */}
            {isAddingChannel && (
              <form onSubmit={handleCreateChannel} className="mb-2 p-2.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <input
                  type="text"
                  placeholder="Channel name (e.g. game-night)"
                  value={newChannelName}
                  onChange={(e) => setNewChannelName(e.target.value)}
                  className="w-full px-2.5 py-1 text-xs border border-slate-200 rounded-lg bg-white"
                  autoFocus
                />
                <div className="flex justify-end gap-1.5">
                  <button
                    type="button"
                    onClick={() => setIsAddingChannel(false)}
                    className="px-2 py-0.5 text-[11px] text-slate-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-2.5 py-0.5 text-[11px] bg-slate-900 text-white rounded-md font-medium"
                  >
                    Add
                  </button>
                </div>
              </form>
            )}

            <div className="space-y-0.5">
              {groupChannels.map((ch) => {
                const isActive = activeTab === 'chat' && activeChannelId === ch.id;
                const unread = getUnreadCount(ch.id);
                return (
                  <button
                    key={ch.id}
                    onClick={() => {
                      onSelectTab('chat');
                      onSelectChannel(ch.id);
                      onCloseMobile();
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                      isActive
                        ? 'bg-slate-100 text-slate-900 font-bold'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-slate-400">{getChannelIcon(ch.id)}</span>
                      <span className="truncate">{ch.name}</span>
                    </div>

                    {unread > 0 && (
                      <span className="px-1.5 py-0.5 rounded-full bg-emerald-500 text-white font-mono text-[10px] font-bold shrink-0 ml-1.5 shadow-2xs">
                        {unread}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Direct Family DMs */}
          <div>
            <div className="px-2 mb-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                One-on-One Family Chats
              </span>
            </div>
            <div className="space-y-0.5">
              {directChannels.map((ch) => {
                const isActive = activeTab === 'chat' && activeChannelId === ch.id;
                const unread = getUnreadCount(ch.id);
                return (
                  <button
                    key={ch.id}
                    onClick={() => {
                      onSelectTab('chat');
                      onSelectChannel(ch.id);
                      onCloseMobile();
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                      isActive
                        ? 'bg-slate-100 text-slate-900 font-bold'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-slate-400">{getChannelIcon(ch.id)}</span>
                      <span className="truncate">{ch.name}</span>
                    </div>

                    {unread > 0 && (
                      <span className="px-1.5 py-0.5 rounded-full bg-emerald-500 text-white font-mono text-[10px] font-bold shrink-0 ml-1.5 shadow-2xs">
                        {unread}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Family Circle Presence (Active vs Inactive) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Family Presence
              </span>
              <div className="flex items-center gap-1.5">
                {onOpenRegisterModal && (activeMember.isAdmin || activeMember.isLeader) && (
                  <button
                    onClick={onOpenRegisterModal}
                    className="text-[10px] text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 px-2 py-0.5 rounded-md font-bold flex items-center gap-0.5"
                    title={activeMember.isAdmin ? "Register a new family member" : `Add member to ${activeMember.familyUnitName || 'your unit'}`}
                  >
                    <span>+ Add</span>
                  </button>
                )}
                <button
                  onClick={onOpenMembersModal}
                  className="text-[10px] text-slate-500 hover:text-slate-800 hover:underline font-medium"
                >
                  Manage
                </button>
              </div>
            </div>

            {/* Presence Filter Buttons */}
            <div className="flex items-center gap-1 px-1">
              <button
                onClick={() => setPresenceFilter('all')}
                className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all ${
                  presenceFilter === 'all'
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-500 hover:bg-slate-100'
                }`}
              >
                All ({members.length})
              </button>
              <button
                onClick={() => setPresenceFilter('active')}
                className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 ${
                  presenceFilter === 'active'
                    ? 'bg-emerald-600 text-white'
                    : 'text-slate-500 hover:bg-slate-100'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>Active ({members.filter((m) => m.isOnline).length})</span>
              </button>
              <button
                onClick={() => setPresenceFilter('inactive')}
                className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 ${
                  presenceFilter === 'inactive'
                    ? 'bg-slate-600 text-white'
                    : 'text-slate-500 hover:bg-slate-100'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                <span>Inactive ({members.filter((m) => !m.isOnline).length})</span>
              </button>
            </div>

            {/* ACTIVE NOW SECTION */}
            {(presenceFilter === 'all' || presenceFilter === 'active') && (
              <div className="space-y-1">
                <div className="px-2 pt-1 pb-0.5 flex items-center justify-between">
                  <span className="text-[10px] font-extrabold text-emerald-800 uppercase tracking-wider flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Active Now ({members.filter((m) => m.isOnline).length})</span>
                  </span>
                </div>
                {members.filter((m) => m.isOnline).map((m) => (
                  <div
                    key={m.id}
                    onClick={onOpenMembersModal}
                    className="px-2.5 py-1.5 rounded-xl hover:bg-emerald-50/60 bg-white border border-slate-150 transition-colors cursor-pointer flex items-center justify-between gap-2 group shadow-2xs"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="relative shrink-0">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold ${m.avatarColor}`}>
                          {m.name.charAt(0)}
                        </div>
                        <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 border border-white" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <p className="text-xs font-bold text-slate-900 truncate group-hover:text-emerald-700">
                            {m.name}
                          </p>
                          {m.familyRole && (
                            <span className="text-[8px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-1 py-0.2 rounded shrink-0">
                              {m.familyRole}
                            </span>
                          )}
                          {m.isAdmin && (
                            <span className="text-[8px] bg-purple-100 text-purple-800 font-bold px-1 rounded flex items-center gap-0.5">
                              <Shield className="w-2 h-2" /> Admin
                            </span>
                          )}
                          {m.isLeader && !m.isAdmin && (
                            <span className="text-[8px] bg-amber-100 text-amber-800 font-bold px-1 rounded flex items-center gap-0.5">
                              <Crown className="w-2 h-2" /> Leader
                            </span>
                          )}
                        </div>
                        <p className="text-[9px] text-slate-500 truncate">
                          {m.familyUnitName ? `🏡 ${m.familyUnitName}` : m.role}
                          {m.shortStatus ? ` • ${m.moodEmoji || '😊'} ${m.shortStatus}` : ''}
                        </p>
                      </div>
                    </div>
                    <span className="text-[9px] font-bold text-emerald-700 bg-emerald-100/70 px-1.5 py-0.2 rounded shrink-0">
                      Active
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* INACTIVE / OFFLINE SECTION */}
            {(presenceFilter === 'all' || presenceFilter === 'inactive') && (
              <div className="space-y-1 pt-1">
                <div className="px-2 pb-0.5 flex items-center justify-between">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                    <span>Inactive / Offline ({members.filter((m) => !m.isOnline).length})</span>
                  </span>
                </div>
                {members.filter((m) => !m.isOnline).map((m) => (
                  <div
                    key={m.id}
                    onClick={onOpenMembersModal}
                    className="px-2.5 py-1.5 rounded-xl hover:bg-slate-100/80 bg-slate-50/70 border border-slate-200/60 transition-colors cursor-pointer flex items-center justify-between gap-2 group opacity-85 hover:opacity-100"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="relative shrink-0">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold grayscale-40 ${m.avatarColor}`}>
                          {m.name.charAt(0)}
                        </div>
                        <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-slate-300 border border-white" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <p className="text-xs font-medium text-slate-700 truncate">
                            {m.name}
                          </p>
                          {m.familyRole && (
                            <span className="text-[8px] font-medium text-slate-600 bg-slate-200/80 px-1 py-0.2 rounded shrink-0">
                              {m.familyRole}
                            </span>
                          )}
                          {m.isAdmin && (
                            <span className="text-[8px] bg-purple-50 text-purple-700 font-bold px-1 rounded">
                              Admin
                            </span>
                          )}
                          {m.isLeader && !m.isAdmin && (
                            <span className="text-[8px] bg-amber-50 text-amber-700 font-bold px-1 rounded">
                              Leader
                            </span>
                          )}
                        </div>
                        <p className="text-[9px] text-slate-400 truncate">
                          {m.familyUnitName ? `🏡 ${m.familyUnitName}` : m.role} • {m.lastActiveTime || 'Offline'}
                        </p>
                      </div>
                    </div>
                    <span className="text-[9px] text-slate-400 font-mono shrink-0">
                      Offline
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Footer Features (Settings & Export + Lively simulator toggle + Bulletin button + Reset) */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/50 space-y-2 text-xs">
          {/* Family Settings & Archive Button */}
          {onOpenSettings && (
            <button
              onClick={onOpenSettings}
              className="w-full py-1.5 px-2.5 rounded-xl bg-white border border-slate-200 text-slate-800 hover:bg-slate-50 transition-colors flex items-center justify-between font-semibold shadow-2xs"
            >
              <span className="flex items-center gap-1.5">
                <Settings className="w-3.5 h-3.5 text-slate-700" />
                <span>Family Settings & Archive</span>
              </span>
              <span className="text-[10px] text-emerald-700 font-mono font-bold bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                Export JSON
              </span>
            </button>
          )}

          {/* Pinned Info Button */}
          <button
            onClick={onOpenNoticeBoard}
            className="w-full py-1.5 px-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors flex items-center justify-between font-medium"
          >
            <span className="flex items-center gap-1.5">
              <Pin className="w-3.5 h-3.5 text-amber-500" />
              <span>Family Bulletin & Wi-Fi</span>
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {/* Lively Simulator Toggle */}
          <div className="flex items-center justify-between px-1 py-1 text-slate-600">
            <span className="flex items-center gap-1.5 text-[11px]">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Lively Family Replies</span>
            </span>
            <button
              onClick={onToggleLivelyMode}
              className={`w-8 h-4 rounded-full transition-colors relative ${
                isLivelyMode ? 'bg-emerald-500' : 'bg-slate-300'
              }`}
              title="Toggle automatic authentic family responses to your messages"
            >
              <span
                className={`w-3 h-3 rounded-full bg-white absolute top-0.5 transition-transform ${
                  isLivelyMode ? 'left-4.5' : 'left-0.5'
                }`}
              />
            </button>
          </div>

          {/* Super Admin Console Button */}
          {onOpenSuperAdminModal && (activeMember.isSuperAdmin || activeMember.isAdmin) && (
            <button
              onClick={onOpenSuperAdminModal}
              className="w-full py-1.5 px-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-800 text-xs font-bold transition-colors flex items-center justify-between"
              title="Super Admin Lineage Oversight"
            >
              <span className="flex items-center gap-1.5">
                <Crown className="w-3.5 h-3.5 text-indigo-600" />
                <span>Super Admin Console</span>
              </span>
              <ChevronRight className="w-3 h-3 text-indigo-400" />
            </button>
          )}

          {/* Sign Out to Lineage Gate */}
          {onSignOut && (
            <button
              onClick={onSignOut}
              className="w-full py-1.5 px-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-medium transition-colors flex items-center justify-between"
              title="Sign out of current account and return to Portal"
            >
              <span className="flex items-center gap-1.5">
                <LogIn className="w-3.5 h-3.5 text-rose-500 rotate-180" />
                <span>Sign Out of Lineage</span>
              </span>
              <ChevronRight className="w-3 h-3 text-slate-400" />
            </button>
          )}

          {/* Reset Demo Data */}
          <button
            onClick={onResetData}
            className="w-full text-center text-[10px] text-slate-400 hover:text-slate-600 pt-1 flex items-center justify-center gap-1"
            title="Reset messages and family data to default"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Family Chat</span>
          </button>
        </div>

      </aside>
    </>
  );
};
