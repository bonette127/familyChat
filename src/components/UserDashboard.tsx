import React, { useState } from 'react';
import { 
  Heart, 
  Smile, 
  Sparkles, 
  MessageCircle, 
  Camera, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  Lock, 
  Save, 
  Edit3, 
  Award, 
  Trophy, 
  Flame, 
  Gift, 
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Play,
  Check,
  Building,
  Crown
} from 'lucide-react';
import { FamilyMember, Message, MilestoneCelebration, PhotoMemory } from '../types/family';

interface UserDashboardProps {
  activeMember: FamilyMember;
  messages: Message[];
  milestones: MilestoneCelebration[];
  memories: PhotoMemory[];
  onOpenDailyCheckIn: () => void;
  onUpdateProfile: (data: { name?: string; avatarColor?: string; password?: string; isOnline?: boolean }) => void;
  onNavigateToTab: (tab: 'chat' | 'celebrations' | 'album' | 'calendar') => void;
  onSwitchToFamilyAdmin?: () => void;
  onSwitchToOrgAdmin?: () => void;
  onSwitchToSuperAdmin?: () => void;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({
  activeMember,
  messages,
  milestones,
  memories,
  onOpenDailyCheckIn,
  onUpdateProfile,
  onNavigateToTab,
  onSwitchToFamilyAdmin,
  onSwitchToOrgAdmin,
  onSwitchToSuperAdmin,
}) => {
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [displayName, setDisplayName] = useState(activeMember.name);
  const [avatarColor, setAvatarColor] = useState(activeMember.avatarColor || 'bg-emerald-600');
  const [newPassword, setNewPassword] = useState(activeMember.password || '');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // User's own contributions
  const myMessages = messages.filter((m) => m.senderId === activeMember.id);
  const myMemories = memories.filter((m) => m.authorId === activeMember.id);
  
  // Celebrations where I RSVP'd or have organizing tasks
  const myRsvps = milestones.filter((mile) =>
    mile.rsvps.some((r) => r.memberId === activeMember.id)
  );
  const myAssignedTasks = milestones.flatMap((mile) =>
    mile.organizingTasks
      .filter((t) => t.assignedToName?.toLowerCase() === activeMember.name.toLowerCase())
      .map((t) => ({ ...t, milestoneTitle: mile.title, milestoneDate: mile.date }))
  );

  // Blessings I posted across celebrations
  const myBlessings = milestones.flatMap((mile) =>
    mile.blessings
      .filter((b) => b.memberId === activeMember.id)
      .map((b) => ({ ...b, milestoneTitle: mile.title }))
  );

  const avatarColorOptions = [
    { label: 'Emerald Green', value: 'bg-emerald-600' },
    { label: 'Rose Pink', value: 'bg-rose-500' },
    { label: 'Indigo Blue', value: 'bg-indigo-600' },
    { label: 'Teal Cyan', value: 'bg-teal-600' },
    { label: 'Amber Orange', value: 'bg-amber-600' },
    { label: 'Purple Violet', value: 'bg-purple-600' },
  ];

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({
      name: displayName.trim(),
      avatarColor,
      password: newPassword,
    });
    setSaveSuccess(true);
    setIsEditingProfile(false);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="flex-1 flex flex-col h-full min-w-0 bg-slate-50 overflow-y-auto font-sans">
      
      {/* Top Banner: Warm Personal Space */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 text-white p-6 sm:p-8 shrink-0 shadow-md">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className={`w-16 h-16 rounded-3xl flex items-center justify-center text-white text-2xl font-bold shadow-lg ring-4 ring-white/20 shrink-0 ${activeMember.avatarColor}`}>
              {activeMember.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white text-xs font-semibold backdrop-blur-xs">
                  {activeMember.familyRole || activeMember.role}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-200 text-xs font-semibold">
                  🏡 {activeMember.familyUnitName || 'Central Branch'}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/30 text-emerald-100 text-xs flex items-center gap-1">
                  <span className={`w-2 h-2 rounded-full ${activeMember.isOnline ? 'bg-emerald-400' : 'bg-slate-400'}`} />
                  {activeMember.isOnline ? 'Active Online' : 'Appearing Offline'}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold font-display tracking-tight text-white mt-1">
                {activeMember.name}'s Family Space
              </h1>
              <p className="text-xs sm:text-sm text-emerald-100 mt-0.5">
                Your personal memories, celebrations, check-in status, and contributions to our family forum.
              </p>
            </div>
          </div>

          {/* Perspective Switchers for Testing */}
          <div className="flex items-center gap-2 shrink-0 self-stretch sm:self-auto justify-end flex-wrap">
            {onSwitchToFamilyAdmin && (
              <button
                onClick={onSwitchToFamilyAdmin}
                className="px-3.5 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-100 border border-emerald-400/30 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                title="Switch to Family Admin (Mary) Dashboard"
              >
                <Crown className="w-3.5 h-3.5 text-emerald-300" />
                <span>Family Admin (Mary)</span>
              </button>
            )}
            {onSwitchToOrgAdmin && (
              <button
                onClick={onSwitchToOrgAdmin}
                className="px-3.5 py-2 bg-teal-500/20 hover:bg-teal-500/30 text-teal-100 border border-teal-400/30 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                title="Switch to Branch Admin (David) Dashboard"
              >
                <Building className="w-3.5 h-3.5 text-teal-300" />
                <span>Branch Admin (David)</span>
              </button>
            )}
            <button
              onClick={onOpenDailyCheckIn}
              className="px-4 py-2 bg-white text-slate-900 hover:bg-slate-100 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-2 cursor-pointer"
            >
              <span>{activeMember.moodEmoji || '☀️'} Check In Today</span>
            </button>
            <button
              onClick={() => setIsEditingProfile(!isEditingProfile)}
              className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{isEditingProfile ? 'Close Edit' : 'Edit Profile'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-4 sm:p-6 max-w-5xl w-full mx-auto space-y-6">
        
        {saveSuccess && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-2xl flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Your profile details and password have been saved successfully!</span>
          </div>
        )}

        {/* DEMONSTRATION SECTION: How Individual Users Operate in the System */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900 font-display">
                  Your Role & How You Operate in Family Forum
                </h2>
                <p className="text-xs text-slate-500">
                  Assigned Role: <strong className="text-emerald-700">{activeMember.role}</strong> ({activeMember.familyRole || 'Family Member'})
                </p>
              </div>
            </div>
            <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2.5 py-1 rounded-full border border-emerald-200">
              ● Permissions Active
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            {/* Operation 1: Chatting */}
            <div 
              onClick={() => onNavigateToTab('chat')}
              className="p-3.5 rounded-2xl bg-slate-50 hover:bg-emerald-50/50 border border-slate-200/80 hover:border-emerald-300 transition-all cursor-pointer group space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 flex items-center gap-1.5 group-hover:text-emerald-700">
                  <MessageCircle className="w-4 h-4 text-emerald-600" />
                  <span>1. Living Room Chat & Direct Messaging</span>
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </div>
              <p className="text-[11px] text-slate-500">
                Post warm updates, reply directly to other family members, record voice notes with automated transcription, and participate in dinner/activity polls.
              </p>
            </div>

            {/* Operation 2: Photo Slideshow */}
            <div 
              onClick={() => onNavigateToTab('album')}
              className="p-3.5 rounded-2xl bg-slate-50 hover:bg-indigo-50/50 border border-slate-200/80 hover:border-indigo-300 transition-all cursor-pointer group space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 flex items-center gap-1.5 group-hover:text-indigo-700">
                  <Play className="w-4 h-4 text-indigo-600" />
                  <span>2. Family Scrapbook & Photo Slideshow</span>
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </div>
              <p className="text-[11px] text-slate-500">
                Browse generational memories, add new keepsakes, and launch the smooth automated Photo Slideshow with auto-play and fullscreen mode.
              </p>
            </div>

            {/* Operation 3: Milestones & Celebrations */}
            <div 
              onClick={() => onNavigateToTab('celebrations')}
              className="p-3.5 rounded-2xl bg-slate-50 hover:bg-rose-50/50 border border-slate-200/80 hover:border-rose-300 transition-all cursor-pointer group space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 flex items-center gap-1.5 group-hover:text-rose-700">
                  <Sparkles className="w-4 h-4 text-rose-500" />
                  <span>3. Milestones & Celebrations</span>
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </div>
              <p className="text-[11px] text-slate-500">
                RSVP to Sophia & Daniel's Wedding, choose rehearsal/floral tasks, and share heartfelt blessings with the honorees.
              </p>
            </div>

            {/* Operation 4: Daily Check-in */}
            <div 
              onClick={onOpenDailyCheckIn}
              className="p-3.5 rounded-2xl bg-slate-50 hover:bg-amber-50/50 border border-slate-200/80 hover:border-amber-300 transition-all cursor-pointer group space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 flex items-center gap-1.5 group-hover:text-amber-800">
                  <Smile className="w-4 h-4 text-amber-500" />
                  <span>4. Daily Check-in & Presence</span>
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </div>
              <p className="text-[11px] text-slate-500">
                Broadcast your daily mood (😊, ☕, 🏃), short status ("At Work", "Relaxing"), and let loved ones know you are safe and sound.
              </p>
            </div>
          </div>

          {/* Privacy Note */}
          <div className="p-3 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 text-[11px] text-emerald-900 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              <strong>Administrative Protection:</strong> System management (member additions, role changes, credentials) is securely restricted to Family Admin Mary. Your experience remains completely intuitive and clutter-free.
            </span>
          </div>
        </div>

        {/* Edit Profile Form Card */}
        {isEditingProfile && (
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-emerald-200 shadow-md space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-900 font-display">
                  Edit Your Personal Profile
                </h3>
              </div>
              <span className="text-xs text-slate-400">
                You can update your name, avatar, and password anytime
              </span>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Your Display Name
                  </label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white text-slate-800 font-semibold"
                    required
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Your Personal Passcode
                  </label>
                  <input
                    type="text"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Set personal password"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                  Choose Your Avatar Color
                </label>
                <div className="flex flex-wrap gap-2">
                  {avatarColorOptions.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setAvatarColor(opt.value)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs transition-all cursor-pointer ${
                        avatarColor === opt.value
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-900 font-bold shadow-2xs'
                          : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <span className={`w-3.5 h-3.5 rounded-full ${opt.value}`} />
                      <span>{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditingProfile(false)}
                  className="px-3 py-1.5 text-slate-500 hover:text-slate-800 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Profile</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* My Contributions Quick Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          <div
            onClick={() => onNavigateToTab('chat')}
            className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs hover:border-emerald-300 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider">My Messages</span>
              <MessageCircle className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-2xl font-bold font-display text-slate-900">{myMessages.length}</div>
            <p className="text-[10px] text-slate-400 mt-0.5">Shared in Living Room</p>
          </div>

          <div
            onClick={() => onNavigateToTab('celebrations')}
            className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs hover:border-rose-300 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider">My RSVPs</span>
              <Sparkles className="w-4 h-4 text-rose-500 group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-2xl font-bold font-display text-slate-900">{myRsvps.length}</div>
            <p className="text-[10px] text-slate-400 mt-0.5">Milestone celebrations</p>
          </div>

          <div
            onClick={() => onNavigateToTab('album')}
            className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs hover:border-indigo-300 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider">Keepsakes Added</span>
              <Camera className="w-4 h-4 text-indigo-500 group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-2xl font-bold font-display text-slate-900">{myMemories.length}</div>
            <p className="text-[10px] text-slate-400 mt-0.5">Photos in Scrapbook</p>
          </div>

          <div
            onClick={() => onNavigateToTab('celebrations')}
            className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs hover:border-amber-300 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider">Blessings Sent</span>
              <Heart className="w-4 h-4 text-rose-500 group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-2xl font-bold font-display text-slate-900">{myBlessings.length}</div>
            <p className="text-[10px] text-slate-400 mt-0.5">Shared with family</p>
          </div>
        </div>

        {/* Daily Status & Mood Card */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center text-2xl shrink-0">
              {activeMember.moodEmoji || '☀️'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Current Status & Mood
                </span>
                <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.2 rounded">
                  {activeMember.lastCheckInTime ? `Checked in ${activeMember.lastCheckInTime}` : 'Not checked in today'}
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 font-display mt-0.5">
                "{activeMember.shortStatus || 'Relaxing with family'}"
              </h3>
              {activeMember.checkInNote && (
                <p className="text-xs text-slate-500 italic mt-0.5">
                  "{activeMember.checkInNote}"
                </p>
              )}
            </div>
          </div>

          <button
            onClick={onOpenDailyCheckIn}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shrink-0 transition-colors cursor-pointer"
          >
            Update Check-in
          </button>
        </div>

        {/* My Milestones & Celebrations Hub */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900 font-display flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-rose-500" />
                <span>My Celebrations & RSVPs</span>
              </h2>
              <p className="text-xs text-slate-400">
                Milestones you are attending or helping coordinate
              </p>
            </div>
            <button
              onClick={() => onNavigateToTab('celebrations')}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
            >
              <span>View Celebrations Hub</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {milestones.map((mile) => {
              const myRsvpStatus = mile.rsvps.find((r) => r.memberId === activeMember.id)?.status;
              return (
                <div
                  key={mile.id}
                  className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <h4 className="font-bold text-slate-800 text-xs">{mile.title}</h4>
                    <p className="text-[11px] text-slate-400">
                      📅 {mile.date} • 📍 {mile.location}
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded-xl bg-emerald-100 text-emerald-800 font-bold text-[10px] shrink-0">
                    RSVP: {myRsvpStatus ? `Attending ✓` : 'Open'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};
