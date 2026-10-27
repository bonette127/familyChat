import React, { useState } from 'react';
import { 
  Sparkles, 
  Heart, 
  Calendar, 
  MapPin, 
  Clock, 
  Plus, 
  CheckCircle2, 
  Circle, 
  Users, 
  Send, 
  MessageSquare, 
  Share2, 
  Gift, 
  ChevronRight,
  PartyPopper,
  Filter
} from 'lucide-react';
import { MilestoneCelebration, FamilyMember } from '../types/family';

interface MilestonesCelebrationsTabProps {
  milestones: MilestoneCelebration[];
  activeMember: FamilyMember;
  allMembers: FamilyMember[];
  onAddMilestone: (milestone: Omit<MilestoneCelebration, 'id' | 'createdAt'>) => void;
  onToggleTask: (milestoneId: string, taskId: string) => void;
  onAddTask: (milestoneId: string, taskTitle: string, assignedToName?: string) => void;
  onUpdateRsvp: (milestoneId: string, status: 'attending' | 'maybe' | 'declined', guestsCount: number) => void;
  onAddBlessing: (milestoneId: string, message: string) => void;
  onAnnounceInChat: (text: string, channelId?: string) => void;
}

export const MilestonesCelebrationsTab: React.FC<MilestonesCelebrationsTabProps> = ({
  milestones,
  activeMember,
  allMembers,
  onAddMilestone,
  onToggleTask,
  onAddTask,
  onUpdateRsvp,
  onAddBlessing,
  onAnnounceInChat,
}) => {
  const [selectedMilestoneId, setSelectedMilestoneId] = useState<string>(
    milestones[0]?.id || ''
  );
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newTaskText, setNewTaskText] = useState('');
  const [newBlessingText, setNewBlessingText] = useState('');
  const [rsvpGuests, setRsvpGuests] = useState(1);
  const [justAnnounced, setJustAnnounced] = useState(false);

  // Form State for new Milestone
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<MilestoneCelebration['category']>('wedding');
  const [honoreeName, setHonoreeName] = useState('');
  const [honoreeRole, setHonoreeRole] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [initialTask1, setInitialTask1] = useState('');
  const [initialTask2, setInitialTask2] = useState('');

  const activeMilestone = milestones.find((m) => m.id === selectedMilestoneId) || milestones[0];

  const filteredMilestones = milestones.filter((m) => {
    if (categoryFilter === 'all') return true;
    return m.category === categoryFilter;
  });

  const getCategoryBadge = (cat: MilestoneCelebration['category']) => {
    switch (cat) {
      case 'wedding':
        return { label: 'Wedding Celebration 💍', color: 'bg-rose-100 text-rose-800 border-rose-200' };
      case 'birthday':
        return { label: 'Milestone Birthday 🎂', color: 'bg-amber-100 text-amber-800 border-amber-200' };
      case 'anniversary':
        return { label: 'Anniversary Jubilee 🥂', color: 'bg-purple-100 text-purple-800 border-purple-200' };
      case 'graduation':
        return { label: 'Graduation & Honor 🎓', color: 'bg-blue-100 text-blue-800 border-blue-200' };
      case 'baby_shower':
        return { label: 'New Lineage Arrival 👶', color: 'bg-pink-100 text-pink-800 border-pink-200' };
      case 'reunion':
        return { label: 'Grand Lineage Reunion 🌳', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
      default:
        return { label: 'Family Celebration ✨', color: 'bg-slate-100 text-slate-800 border-slate-200' };
    }
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !honoreeName.trim() || !date.trim()) return;

    const organizingTasks = [];
    if (initialTask1.trim()) {
      organizingTasks.push({ id: `t-${Date.now()}-1`, title: initialTask1.trim(), completed: false });
    }
    if (initialTask2.trim()) {
      organizingTasks.push({ id: `t-${Date.now()}-2`, title: initialTask2.trim(), completed: false });
    }

    onAddMilestone({
      title: title.trim(),
      category,
      honoreeName: honoreeName.trim(),
      honoreeRole: honoreeRole.trim() || undefined,
      date,
      time: time || undefined,
      location: location.trim() || 'Family Gathering Place',
      description: description.trim() || `Gathering the lineage to celebrate ${honoreeName.trim()}`,
      organizerId: activeMember.id,
      organizerName: activeMember.name,
      organizingTasks,
      rsvps: [{ memberId: activeMember.id, memberName: activeMember.name, status: 'attending', guestsCount: 1 }],
      blessings: [],
    });

    // Reset Form
    setTitle('');
    setHonoreeName('');
    setHonoreeRole('');
    setDate('');
    setTime('');
    setLocation('');
    setDescription('');
    setInitialTask1('');
    setInitialTask2('');
    setIsCreateModalOpen(false);
  };

  const handleAddTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskText.trim() || !activeMilestone) return;
    onAddTask(activeMilestone.id, newTaskText.trim());
    setNewTaskText('');
  };

  const handleAddBlessingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBlessingText.trim() || !activeMilestone) return;
    onAddBlessing(activeMilestone.id, newBlessingText.trim());
    setNewBlessingText('');
  };

  const handleAnnounceMilestone = () => {
    if (!activeMilestone) return;
    const announcement = `🎉 **FAMILY CELEBRATION ANNOUNCEMENT** 🎉\n\nWe are gathering the whole family to celebrate: **${activeMilestone.title}** for our beloved **${activeMilestone.honoreeName}**!\n\n📅 **Date**: ${activeMilestone.date} ${activeMilestone.time ? `at ${activeMilestone.time}` : ''}\n📍 **Location**: ${activeMilestone.location}\n\nPlease join the celebration hub to RSVP, take on preparation tasks, and leave your heartfelt blessings!`;
    onAnnounceInChat(announcement, 'celebrations');
    setJustAnnounced(true);
    setTimeout(() => setJustAnnounced(false), 3000);
  };

  const myRsvp = activeMilestone?.rsvps.find((r) => r.memberId === activeMember.id);
  const attendingCount = activeMilestone?.rsvps
    .filter((r) => r.status === 'attending')
    .reduce((sum, r) => sum + r.guestsCount, 0) || 0;

  return (
    <div className="flex-1 flex flex-col md:flex-row h-full overflow-hidden bg-slate-50">
      {/* Left Column: Milestone list & filters */}
      <div className="w-full md:w-80 lg:w-96 border-r border-slate-200/80 bg-white flex flex-col shrink-0">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 font-display flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <span>Life Celebrations</span>
            </h2>
            <p className="text-xs text-slate-500">Weddings, birthdays & milestones</p>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Event</span>
          </button>
        </div>

        {/* Filter chips */}
        <div className="p-3 border-b border-slate-100 flex items-center gap-1.5 overflow-x-auto text-[11px]">
          <button
            onClick={() => setCategoryFilter('all')}
            className={`px-2.5 py-1 rounded-lg font-bold shrink-0 transition-colors ${
              categoryFilter === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setCategoryFilter('wedding')}
            className={`px-2.5 py-1 rounded-lg font-bold shrink-0 transition-colors ${
              categoryFilter === 'wedding'
                ? 'bg-rose-600 text-white'
                : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
            }`}
          >
            Weddings 💍
          </button>
          <button
            onClick={() => setCategoryFilter('birthday')}
            className={`px-2.5 py-1 rounded-lg font-bold shrink-0 transition-colors ${
              categoryFilter === 'birthday'
                ? 'bg-amber-600 text-white'
                : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
            }`}
          >
            Birthdays 🎂
          </button>
          <button
            onClick={() => setCategoryFilter('anniversary')}
            className={`px-2.5 py-1 rounded-lg font-bold shrink-0 transition-colors ${
              categoryFilter === 'anniversary'
                ? 'bg-purple-600 text-white'
                : 'bg-purple-50 text-purple-700 hover:bg-purple-100'
            }`}
          >
            Anniversaries 🥂
          </button>
        </div>

        {/* Celebrations list */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
          {filteredMilestones.length === 0 ? (
            <div className="text-center py-12 px-4">
              <PartyPopper className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-700">No celebrations in this category</p>
              <p className="text-xs text-slate-400 mt-1">
                Click "Add Event" to organize a wedding, birthday, or family celebration!
              </p>
            </div>
          ) : (
            filteredMilestones.map((m) => {
              const badge = getCategoryBadge(m.category);
              const isSelected = activeMilestone?.id === m.id;
              const pendingTasks = m.organizingTasks.filter((t) => !t.completed).length;

              return (
                <div
                  key={m.id}
                  onClick={() => setSelectedMilestoneId(m.id)}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-emerald-50/60 border-emerald-400 shadow-xs ring-1 ring-emerald-400/40'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badge.color}`}>
                      {badge.label}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {m.date}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 font-display line-clamp-1">
                    {m.title}
                  </h3>

                  <p className="text-xs text-slate-600 mt-0.5">
                    Honoring <span className="font-semibold text-slate-800">{m.honoreeName}</span>
                    {m.honoreeRole ? ` (${m.honoreeRole})` : ''}
                  </p>

                  <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3 text-emerald-600" />
                      <span>{m.rsvps.filter((r) => r.status === 'attending').length} attending</span>
                    </span>
                    {pendingTasks > 0 ? (
                      <span className="text-amber-600 font-semibold">
                        {pendingTasks} tasks to organize
                      </span>
                    ) : (
                      <span className="text-emerald-600 font-semibold">Ready & planned</span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Right Column: Detailed View of Selected Milestone */}
      <div className="flex-1 flex flex-col h-full overflow-y-auto">
        {activeMilestone ? (
          <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto w-full space-y-6">
            {/* Header Hero Banner */}
            <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-emerald-800 via-teal-900 to-slate-900 text-white p-6 sm:p-8 shadow-sm">
              <div className="relative z-10 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-white">
                    {getCategoryBadge(activeMilestone.category).label}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleAnnounceMilestone}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-slate-900 rounded-xl text-xs font-bold hover:bg-slate-100 transition-colors shadow-xs"
                      title="Post announcement to family chat"
                    >
                      <Share2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{justAnnounced ? 'Announced to Chat!' : 'Share to Family Chat'}</span>
                    </button>
                  </div>
                </div>

                <h1 className="text-2xl sm:text-3xl font-extrabold font-display">
                  {activeMilestone.title}
                </h1>

                <p className="text-sm text-white/90 max-w-2xl leading-relaxed">
                  {activeMilestone.description}
                </p>

                <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-white/80">
                  <div className="flex items-center gap-1.5 bg-black/20 px-3 py-1.5 rounded-xl">
                    <Calendar className="w-4 h-4 text-emerald-300" />
                    <span>{activeMilestone.date}</span>
                    {activeMilestone.time && <span>• {activeMilestone.time}</span>}
                  </div>
                  <div className="flex items-center gap-1.5 bg-black/20 px-3 py-1.5 rounded-xl">
                    <MapPin className="w-4 h-4 text-rose-300" />
                    <span>{activeMilestone.location}</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-black/20 px-3 py-1.5 rounded-xl">
                    <Users className="w-4 h-4 text-amber-300" />
                    <span>{attendingCount} Family Members Attending</span>
                  </div>
                </div>
              </div>
            </div>

            {/* RSVP Zone */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <PartyPopper className="w-4 h-4 text-emerald-600" />
                    <span>Your Family RSVP</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Will you and your household be attending this family celebration?
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1 text-xs font-semibold">
                    <button
                      onClick={() => onUpdateRsvp(activeMilestone.id, 'attending', rsvpGuests)}
                      className={`px-3 py-1.5 rounded-lg transition-all ${
                        myRsvp?.status === 'attending'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Attending 🥂
                    </button>
                    <button
                      onClick={() => onUpdateRsvp(activeMilestone.id, 'maybe', rsvpGuests)}
                      className={`px-3 py-1.5 rounded-lg transition-all ${
                        myRsvp?.status === 'maybe'
                          ? 'bg-amber-600 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Maybe
                    </button>
                    <button
                      onClick={() => onUpdateRsvp(activeMilestone.id, 'declined', 0)}
                      className={`px-3 py-1.5 rounded-lg transition-all ${
                        myRsvp?.status === 'declined'
                          ? 'bg-rose-600 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Can't Make It
                    </button>
                  </div>
                </div>
              </div>

              {/* RSVP attendee list chips */}
              <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2 text-xs">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Confirmed:
                </span>
                {activeMilestone.rsvps
                  .filter((r) => r.status === 'attending')
                  .map((r, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200"
                    >
                      <span>{r.memberName}</span>
                      {r.guestsCount > 1 && (
                        <span className="text-[10px] bg-emerald-200/80 px-1 rounded-full">
                          +{r.guestsCount - 1}
                        </span>
                      )}
                    </span>
                  ))}
              </div>
            </div>

            {/* Two Column Section: Organizing Checklist + Blessings Wall */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left: Lineage Organizing Checklist */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs flex flex-col space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Gift className="w-4 h-4 text-emerald-600" />
                      <span>Organize Together</span>
                    </h3>
                    <p className="text-xs text-slate-500">
                      Family coordination & preparation duties
                    </p>
                  </div>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                    {activeMilestone.organizingTasks.filter((t) => t.completed).length} /{' '}
                    {activeMilestone.organizingTasks.length} Done
                  </span>
                </div>

                {/* Task List */}
                <div className="space-y-2 flex-1">
                  {activeMilestone.organizingTasks.length === 0 ? (
                    <p className="text-xs text-slate-400 italic py-4 text-center">
                      No preparation tasks added yet. Add one below!
                    </p>
                  ) : (
                    activeMilestone.organizingTasks.map((task) => (
                      <div
                        key={task.id}
                        onClick={() => onToggleTask(activeMilestone.id, task.id)}
                        className={`flex items-start gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-all ${
                          task.completed
                            ? 'bg-slate-50 border-slate-200 opacity-60'
                            : 'bg-white border-slate-200 hover:border-emerald-300'
                        }`}
                      >
                        <button className="mt-0.5 text-slate-400 hover:text-emerald-600">
                          {task.completed ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <Circle className="w-4 h-4 text-slate-300" />
                          )}
                        </button>
                        <div className="min-w-0 flex-1">
                          <p
                            className={`text-xs font-medium leading-snug ${
                              task.completed
                                ? 'line-through text-slate-400'
                                : 'text-slate-800'
                            }`}
                          >
                            {task.title}
                          </p>
                          {task.assignedToName && (
                            <span className="text-[10px] text-emerald-700 font-semibold">
                              Assigned to {task.assignedToName}
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Add Task input */}
                <form onSubmit={handleAddTaskSubmit} className="flex items-center gap-2 pt-2 border-t border-slate-100">
                  <input
                    type="text"
                    placeholder="Add task (e.g. bring vintage photos)..."
                    value={newTaskText}
                    onChange={(e) => setNewTaskText(e.target.value)}
                    className="flex-1 px-3 py-1.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50"
                  />
                  <button
                    type="submit"
                    disabled={!newTaskText.trim()}
                    className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white text-xs font-bold rounded-xl transition-colors"
                  >
                    Add
                  </button>
                </form>
              </div>

              {/* Right: Blessings & Wishes Wall */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs flex flex-col space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Heart className="w-4 h-4 text-rose-500" />
                    <span>Family Blessings & Wishes</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Congratulatory messages from across generations
                  </p>
                </div>

                {/* Blessings feed */}
                <div className="space-y-2.5 flex-1 max-h-72 overflow-y-auto pr-1">
                  {activeMilestone.blessings.length === 0 ? (
                    <div className="text-center py-6">
                      <Heart className="w-8 h-8 text-rose-200 mx-auto mb-1.5" />
                      <p className="text-xs text-slate-400">
                        Be the first family member to send a blessing or toast!
                      </p>
                    </div>
                  ) : (
                    activeMilestone.blessings.map((b) => (
                      <div
                        key={b.id}
                        className="p-3 rounded-xl bg-rose-50/50 border border-rose-100/80 space-y-1"
                      >
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-bold text-slate-800">{b.memberName}</span>
                          <span className="text-[10px] text-slate-400">
                            {new Date(b.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-xs text-slate-700 italic leading-relaxed">
                          "{b.message}"
                        </p>
                      </div>
                    ))
                  )}
                </div>

                {/* Send Blessing Form */}
                <form onSubmit={handleAddBlessingSubmit} className="flex items-center gap-2 pt-2 border-t border-slate-100">
                  <input
                    type="text"
                    placeholder="Write a warm family wish or toast..."
                    value={newBlessingText}
                    onChange={(e) => setNewBlessingText(e.target.value)}
                    className="flex-1 px-3 py-1.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-400 bg-slate-50"
                  />
                  <button
                    type="submit"
                    disabled={!newBlessingText.trim()}
                    className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 disabled:opacity-40 text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1"
                  >
                    <Send className="w-3 h-3" />
                    <span>Send</span>
                  </button>
                </form>
              </div>
            </div>
          </div>
        ) : (
          <div className="m-auto text-center p-8">
            <Sparkles className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">No Celebration Selected</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Select a milestone celebration from the left or create a new life event for the whole family!
            </p>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold"
            >
              + Create Life Celebration
            </button>
          </div>
        )}
      </div>

      {/* Create Milestone Celebration Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 font-display flex items-center gap-2">
                <PartyPopper className="w-5 h-5 text-emerald-600" />
                <span>Create Family Life Celebration</span>
              </h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Celebration Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="wedding">💍 Wedding Celebration</option>
                  <option value="birthday">🎂 Milestone Birthday</option>
                  <option value="anniversary">🥂 Wedding Anniversary</option>
                  <option value="graduation">🎓 Graduation & Honor</option>
                  <option value="baby_shower">👶 Baby Shower / Lineage Arrival</option>
                  <option value="reunion">🌳 Grand Lineage Reunion</option>
                  <option value="other">✨ Family Achievement Celebration</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Celebration Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Maya & Kevin's Wedding Celebration"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Honoree Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Maya & Kevin"
                    value={honoreeName}
                    onChange={(e) => setHonoreeName(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Family Role
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Daughter, Aunt, Uncle"
                    value={honoreeRole}
                    onChange={(e) => setHonoreeRole(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Time (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 4:00 PM"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Location / Venue
                </label>
                <input
                  type="text"
                  placeholder="e.g. St. Jude Chapel & Conservatory Gardens"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Description & Meaning
                </label>
                <textarea
                  placeholder="Share details of the celebration with the entire family lineage..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700">
                  Initial Organization Tasks (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Task 1: e.g. Bring family photo album"
                  value={initialTask1}
                  onChange={(e) => setInitialTask1(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-xl"
                />
                <input
                  type="text"
                  placeholder="Task 2: e.g. Prepare toast & blessing"
                  value={initialTask2}
                  onChange={(e) => setInitialTask2(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs"
                >
                  Announce & Create Celebration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
