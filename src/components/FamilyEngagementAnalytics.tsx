import React, { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  Users,
  Calendar,
  CheckCircle2,
  TrendingUp,
  Smile,
  Flame,
  Clock,
  Sparkles,
  ShieldCheck,
  Send,
  ArrowUpRight,
  Info,
  Heart,
  Share2,
  Check,
  Award,
  Zap,
  Activity
} from 'lucide-react';
import { FamilyMember } from '../types/family';

export interface FamilyEngagementAnalyticsProps {
  members: FamilyMember[];
  isAdminLoggedIn?: boolean;
  onOpenRegisterMember?: () => void;
  onOpenCheckInModal?: () => void;
  onSendCheckInPromptToChat?: (prompt: string) => void;
}

// Historical Weekly Engagement Dataset
const WEEKLY_DATA = [
  {
    week: 'W37 (Sep 08)',
    weekShort: 'Sep 08',
    checkIns: 24,
    morningCheckIns: 12,
    eveningCheckIns: 12,
    activeMembers: 4,
    totalMembers: 6,
    messagesCount: 58,
    mediaCount: 12,
    participationPct: 67,
  },
  {
    week: 'W38 (Sep 15)',
    weekShort: 'Sep 15',
    checkIns: 31,
    morningCheckIns: 16,
    eveningCheckIns: 15,
    activeMembers: 5,
    totalMembers: 6,
    messagesCount: 84,
    mediaCount: 19,
    participationPct: 83,
  },
  {
    week: 'W39 (Sep 22)',
    weekShort: 'Sep 22',
    checkIns: 38,
    morningCheckIns: 21,
    eveningCheckIns: 17,
    activeMembers: 5,
    totalMembers: 6,
    messagesCount: 112,
    mediaCount: 22,
    participationPct: 83,
  },
  {
    week: 'W40 (Sep 29)',
    weekShort: 'Sep 29',
    checkIns: 43,
    morningCheckIns: 23,
    eveningCheckIns: 20,
    activeMembers: 6,
    totalMembers: 6,
    messagesCount: 135,
    mediaCount: 28,
    participationPct: 100,
  },
  {
    week: 'W41 (Oct 06)',
    weekShort: 'Current',
    checkIns: 49,
    morningCheckIns: 27,
    eveningCheckIns: 22,
    activeMembers: 6,
    totalMembers: 6,
    messagesCount: 164,
    mediaCount: 35,
    participationPct: 100,
  },
];

// Daily Rhythm in Current Week
const DAILY_RHYTHM = [
  { day: 'Mon', checkIns: 7, activeMembers: 6, morning: 4, evening: 3 },
  { day: 'Tue', checkIns: 6, activeMembers: 5, morning: 3, evening: 3 },
  { day: 'Wed', checkIns: 8, activeMembers: 6, morning: 5, evening: 3 },
  { day: 'Thu', checkIns: 7, activeMembers: 6, morning: 4, evening: 3 },
  { day: 'Fri', checkIns: 6, activeMembers: 6, morning: 3, evening: 3 },
  { day: 'Sat', checkIns: 8, activeMembers: 6, morning: 4, evening: 4 },
  { day: 'Sun', checkIns: 9, activeMembers: 6, morning: 5, evening: 4 },
];

// Mood Distribution from Family Check-ins
const MOOD_DATA = [
  { name: 'Happy / Joyful', value: 46, emoji: '😊', color: '#10b981' },
  { name: 'Peaceful / Cozy', value: 28, emoji: '🌿', color: '#6366f1' },
  { name: 'Energized / Active', value: 16, emoji: '⚡', color: '#f59e0b' },
  { name: 'Busy / Focusing', value: 10, emoji: '💼', color: '#94a3b8' },
];

export const FamilyEngagementAnalytics: React.FC<FamilyEngagementAnalyticsProps> = ({
  members,
  isAdminLoggedIn = true,
  onOpenRegisterMember,
  onOpenCheckInModal,
  onSendCheckInPromptToChat,
}) => {
  const [selectedView, setSelectedView] = useState<'weekly' | 'daily'>('weekly');
  const [activeMetricTab, setActiveMetricTab] = useState<'all' | 'checkins' | 'activeMembers'>('all');
  const [isCopiedSummary, setIsCopiedSummary] = useState(false);

  // Derived current metrics
  const currentWeek = WEEKLY_DATA[WEEKLY_DATA.length - 1];
  const previousWeek = WEEKLY_DATA[WEEKLY_DATA.length - 2];
  const checkInGrowth = Math.round(
    ((currentWeek.checkIns - previousWeek.checkIns) / previousWeek.checkIns) * 100
  );
  const activeMembersCount = members.filter((m) => m.isOnline || m.shortStatus).length || members.length;

  const handleCopyAdminSummary = () => {
    const summaryText = `📊 Family Engagement Snapshot (${currentWeek.week}):
• Weekly Check-ins: ${currentWeek.checkIns} (+${checkInGrowth}% vs last week)
• Active Family Members: ${activeMembersCount} of ${members.length} (${Math.round((activeMembersCount / members.length) * 100)}% participation)
• Chat Messages & Memories: ${currentWeek.messagesCount} messages, ${currentWeek.mediaCount} shared photos & voice notes
• Top Family Check-in Peak: Sunday & Wednesday mornings (8:00 AM - 9:30 AM)`;
    navigator.clipboard.writeText(summaryText);
    setIsCopiedSummary(true);
    setTimeout(() => setIsCopiedSummary(false), 2500);
  };

  // Custom Chart Tooltips
  const CustomWeeklyTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900/95 backdrop-blur-md text-white p-3 rounded-xl border border-slate-700 shadow-xl text-xs space-y-1">
          <p className="font-bold text-slate-200 border-b border-slate-800 pb-1">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={`tooltip-${index}`} className="flex items-center justify-between gap-3 text-[11px]">
              <span className="flex items-center gap-1.5" style={{ color: entry.color }}>
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                <span>{entry.name}:</span>
              </span>
              <span className="font-bold font-mono text-white">{entry.value}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      
      {/* Admin Insights Header Card */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-850 to-indigo-950 text-white p-5 sm:p-6 rounded-3xl border border-slate-800 shadow-xl relative overflow-hidden">
        {/* Ambient glow decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-48 h-48 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                <span>Admin Engagement Intelligence</span>
              </span>
              <span className="text-xs text-slate-400 font-mono">Updated this week</span>
            </div>

            <h3 className="text-lg sm:text-xl font-extrabold tracking-tight font-display text-white">
              Family Circle Engagement & Check-in Pulse
            </h3>
            <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
              Real-time analytics tracking check-in frequency, active member participation across weeks,
              and family wellness trends to keep everyone connected and cared for.
            </p>
          </div>

          {/* Quick Action Controls */}
          <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
            <button
              onClick={handleCopyAdminSummary}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
              title="Copy summary report"
            >
              {isCopiedSummary ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-300">Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5 text-slate-300" />
                  <span>Copy Report</span>
                </>
              )}
            </button>

            {onSendCheckInPromptToChat && (
              <button
                onClick={() =>
                  onSendCheckInPromptToChat(
                    "🌻 **Family Check-in Prompt:** How is everyone feeling today? Don't forget to tap your daily status update in the Family tab!"
                  )
                }
                className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md shadow-emerald-500/20 active:scale-98"
                title="Post a check-in reminder to general chat"
              >
                <Send className="w-3.5 h-3.5 text-slate-950" />
                <span>Nudge Check-in</span>
              </button>
            )}
          </div>
        </div>

        {/* 4 Stat Metric Badges */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-5 pt-4 border-t border-slate-800/80">
          
          <div className="p-3 bg-slate-800/60 rounded-2xl border border-slate-700/60 backdrop-blur-xs">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span>Weekly Check-ins</span>
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-xl sm:text-2xl font-black text-white font-mono">{currentWeek.checkIns}</span>
              <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/20 px-1.5 py-0.2 rounded-md">
                +{checkInGrowth}%
              </span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              {currentWeek.morningCheckIns} morning • {currentWeek.eveningCheckIns} evening
            </p>
          </div>

          <div className="p-3 bg-slate-800/60 rounded-2xl border border-slate-700/60 backdrop-blur-xs">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span>Active Members</span>
              <Users className="w-3.5 h-3.5 text-indigo-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-xl sm:text-2xl font-black text-white font-mono">
                {currentWeek.activeMembers} <span className="text-sm font-normal text-slate-400">/ {members.length}</span>
              </span>
              <span className="text-[11px] font-bold text-indigo-300 bg-indigo-500/20 px-1.5 py-0.2 rounded-md">
                100%
              </span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">All members participating</p>
          </div>

          <div className="p-3 bg-slate-800/60 rounded-2xl border border-slate-700/60 backdrop-blur-xs">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span>Chat & Moments</span>
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-xl sm:text-2xl font-black text-white font-mono">{currentWeek.messagesCount}</span>
              <span className="text-[11px] font-bold text-amber-300 bg-amber-500/20 px-1.5 py-0.2 rounded-md">
                +{currentWeek.mediaCount} media
              </span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">Shared voice & photos</p>
          </div>

          <div className="p-3 bg-slate-800/60 rounded-2xl border border-slate-700/60 backdrop-blur-xs">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span>Family Wellness</span>
              <Heart className="w-3.5 h-3.5 text-rose-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-xl sm:text-2xl font-black text-white font-mono">92%</span>
              <span className="text-[11px] font-bold text-rose-300 bg-rose-500/20 px-1.5 py-0.2 rounded-md">
                Positive 😊
              </span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">Based on daily check-in moods</p>
          </div>

        </div>
      </div>

      {/* Navigation Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setActiveMetricTab('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
              activeMetricTab === 'all'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            All Visualizations
          </button>
          <button
            onClick={() => setActiveMetricTab('checkins')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              activeMetricTab === 'checkins'
                ? 'bg-emerald-600 text-white'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Check-in Frequency</span>
          </button>
          <button
            onClick={() => setActiveMetricTab('activeMembers')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              activeMetricTab === 'activeMembers'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Active Members</span>
          </button>
        </div>

        <div className="flex items-center gap-1.5 self-end sm:self-center">
          <span className="text-xs text-slate-400 font-medium">Granularity:</span>
          <div className="inline-flex p-0.5 bg-slate-100 rounded-xl">
            <button
              onClick={() => setSelectedView('weekly')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors ${
                selectedView === 'weekly' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Weekly (5 Weeks)
            </button>
            <button
              onClick={() => setSelectedView('daily')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors ${
                selectedView === 'daily' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Daily Rhythm
            </button>
          </div>
        </div>
      </div>

      {/* Primary Chart Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        
        {/* CHART 1: Check-in frequency by Week */}
        {(activeMetricTab === 'all' || activeMetricTab === 'checkins') && (
          <div className={`bg-white rounded-3xl border border-slate-200 p-5 shadow-2xs space-y-4 ${activeMetricTab === 'checkins' ? 'lg:col-span-2' : ''}`}>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span>Check-in Frequency {selectedView === 'weekly' ? 'by Week' : 'by Day of Week'}</span>
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  {selectedView === 'weekly'
                    ? 'Total check-ins completed per week, split into morning and evening check-ins'
                    : 'Check-in volume across the days of the current week'}
                </p>
              </div>

              <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-xl">
                {currentWeek.checkIns} Total This Week
              </span>
            </div>

            {/* Recharts Area/Bar Chart */}
            <div className="w-full h-64 sm:h-72">
              <ResponsiveContainer width="100%" height="100%">
                {selectedView === 'weekly' ? (
                  <AreaChart data={WEEKLY_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="colorMorning" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis
                      dataKey="weekShort"
                      tickLine={false}
                      axisLine={{ stroke: '#e2e8f0' }}
                      tick={{ fill: '#64748b', fontSize: 11 }}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: '#64748b', fontSize: 11 }}
                    />
                    <Tooltip content={<CustomWeeklyTooltip />} />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                    <Area
                      type="monotone"
                      dataKey="checkIns"
                      name="Total Check-ins"
                      stroke="#10b981"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorTotal)"
                    />
                    <Area
                      type="monotone"
                      dataKey="morningCheckIns"
                      name="Morning Check-ins"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      strokeDasharray="4 4"
                      fillOpacity={1}
                      fill="url(#colorMorning)"
                    />
                    <Area
                      type="monotone"
                      dataKey="eveningCheckIns"
                      name="Evening Check-ins"
                      stroke="#8b5cf6"
                      strokeWidth={2}
                      fill="transparent"
                    />
                  </AreaChart>
                ) : (
                  <BarChart data={DAILY_RHYTHM} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis
                      dataKey="day"
                      tickLine={false}
                      axisLine={{ stroke: '#e2e8f0' }}
                      tick={{ fill: '#64748b', fontSize: 11 }}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: '#64748b', fontSize: 11 }}
                    />
                    <Tooltip content={<CustomWeeklyTooltip />} />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                    <Bar dataKey="morning" name="Morning Check-ins" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="evening" name="Evening Check-ins" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Peak check-in window: <strong>7:30 AM – 9:00 AM</strong></span>
              </span>
              <span className="text-emerald-700 font-semibold font-mono">
                Average {Math.round(currentWeek.checkIns / 7)} check-ins / day
              </span>
            </div>
          </div>
        )}

        {/* CHART 2: Active members by Week */}
        {(activeMetricTab === 'all' || activeMetricTab === 'activeMembers') && (
          <div className={`bg-white rounded-3xl border border-slate-200 p-5 shadow-2xs space-y-4 ${activeMetricTab === 'activeMembers' ? 'lg:col-span-2' : ''}`}>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                  <span>Active Members & Participation by Week</span>
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Distinct family members engaging weekly through chat, check-ins, or polls
                </p>
              </div>

              <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-1 rounded-xl">
                {currentWeek.activeMembers} of {members.length} Active
              </span>
            </div>

            {/* Recharts Bar & Line Chart */}
            <div className="w-full h-64 sm:h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={WEEKLY_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="weekShort"
                    tickLine={false}
                    axisLine={{ stroke: '#e2e8f0' }}
                    tick={{ fill: '#64748b', fontSize: 11 }}
                  />
                  <YAxis
                    domain={[0, members.length + 1]}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: '#64748b', fontSize: 11 }}
                  />
                  <Tooltip content={<CustomWeeklyTooltip />} />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                  <Bar
                    dataKey="activeMembers"
                    name="Active Members"
                    fill="#6366f1"
                    radius={[6, 6, 0, 0]}
                  />
                  <Bar
                    dataKey="totalMembers"
                    name="Total Circle Members"
                    fill="#e2e8f0"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
              <span className="flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-amber-500" />
                <span>Family participation rate: <strong>100%</strong></span>
              </span>
              <span className="text-indigo-700 font-semibold font-mono">
                +2 members added since Sep 08
              </span>
            </div>
          </div>
        )}

      </div>

      {/* Member Engagement Breakdown & Family Health */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Mood & Wellness Breakdown */}
        <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-2xs space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Smile className="w-4 h-4 text-emerald-500" />
                <span>Family Wellness / Mood Distribution</span>
              </h4>
              <span className="text-[10px] text-slate-400 font-medium">Last 30 Days</span>
            </div>
            <p className="text-xs text-slate-500">
              Aggregated from member check-in mood logs and status reactions
            </p>
          </div>

          <div className="h-44 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={MOOD_DATA}
                  cx="50%"
                  cy="50%"
                  innerRadius={38}
                  outerRadius={68}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {MOOD_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any, name: any) => [`${value}%`, name]}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '11px',
                    border: '1px solid #334155',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100">
            {MOOD_DATA.map((m) => (
              <div key={m.name} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: m.color }} />
                <span className="truncate text-slate-600 text-[11px]">{m.emoji} {m.name}</span>
                <span className="font-bold font-mono text-slate-800 ml-auto text-[11px]">{m.value}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Member Check-in Frequency Leaderboard */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 p-5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-500" />
                <span>Individual Check-in Frequency & Engagement</span>
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Current week attendance and daily check-in streaks for each family member
              </p>
            </div>

            {onOpenCheckInModal && (
              <button
                onClick={onOpenCheckInModal}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors"
              >
                <span>Check In Now</span>
              </button>
            )}
          </div>

          <div className="space-y-2 pt-1">
            {members.map((member, idx) => {
              // Simulated realistic check-in frequency for week out of 7
              const checkInsThisWeek = idx === 0 ? 7 : idx === 1 ? 7 : idx === 2 ? 6 : idx === 3 ? 5 : 6;
              const streakDays = idx === 0 ? 12 : idx === 1 ? 9 : idx === 2 ? 6 : idx === 3 ? 7 : 4;
              const pct = Math.round((checkInsThisWeek / 7) * 100);

              return (
                <div
                  key={member.id}
                  className="p-3 rounded-2xl bg-slate-50/70 border border-slate-150 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${member.avatarColor}`}
                      >
                        {member.name.charAt(0)}
                      </div>
                      {member.isOnline && (
                        <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 truncate">{member.name}</span>
                        {member.isAdmin && (
                          <span className="text-[9px] bg-indigo-100 text-indigo-700 font-bold px-1.5 py-0.2 rounded">
                            Admin
                          </span>
                        )}
                        <span className="text-[11px] text-slate-400">({member.role})</span>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">
                        Status: {member.moodEmoji || '😊'} {member.shortStatus || 'Active'} • Last: {member.lastCheckInTime || 'Today'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0 justify-between sm:justify-end">
                    {/* Streak badge */}
                    <div className="flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded-lg">
                      <Flame className="w-3.5 h-3.5 text-amber-500" />
                      <span>{streakDays}d streak</span>
                    </div>

                    {/* Progress Bar & Rate */}
                    <div className="w-28 space-y-1">
                      <div className="flex justify-between text-[10px] text-slate-500">
                        <span>Check-ins</span>
                        <span className="font-bold text-slate-800">{checkInsThisWeek}/7</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
};
