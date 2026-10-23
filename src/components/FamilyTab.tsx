import React, { useState, useMemo } from 'react';
import {
  Users,
  Smile,
  Activity,
  Sparkles,
  Flame,
  Calendar,
  Clock,
  Heart,
  TrendingUp,
  Download,
  Send,
  Plus,
  Shield,
  ShieldCheck,
  CheckCircle2,
  Filter,
  BarChart2,
  PieChart as PieIcon,
  MessageCircle,
  Award,
  Trophy,
  ChevronRight,
  Battery,
  MapPin,
  RefreshCw,
  Sliders,
  Settings,
  Cake,
  Palmtree,
  Utensils,
  CalendarDays,
  ExternalLink,
  Zap,
  ChevronDown,
  ChevronUp,
  Info,
  Percent,
  Target
} from 'lucide-react';
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
  Cell,
  ComposedChart,
  ReferenceLine,
  ReferenceDot
} from 'recharts';
import { FamilyMember, DailyCheckInRecord, FamilyEvent } from '../types/family';
import { calculateMoodEventCorrelation, CorrelationAnalysisResult } from '../utils/correlation';

interface FamilyTabProps {
  members: FamilyMember[];
  activeMember: FamilyMember;
  activeMemberId: string;
  checkInHistory: DailyCheckInRecord[];
  isAdminLoggedIn: boolean;
  familyName: string;
  onOpenDailyCheckIn: () => void;
  onOpenRegisterMember: () => void;
  onOpenMembersModal: () => void;
  onOpenAdminLogin: () => void;
  onOpenExportModal: () => void;
  onSendCheckInPromptToChat: (prompt: string) => void;
  onSelectMember: (id: string) => void;
  events?: FamilyEvent[];
  onNavigateToCalendar?: () => void;
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
    participationPct: 100,
  },
];

export const getEventEmoji = (type?: string) => {
  switch (type) {
    case 'birthday':
      return '🎂';
    case 'vacation':
      return '🏕️';
    case 'dinner':
      return '🍽️';
    case 'school':
      return '🎓';
    case 'appointment':
      return '🩺';
    default:
      return '📅';
  }
};

export const getEventColor = (type?: string) => {
  switch (type) {
    case 'birthday':
      return '#f43f5e';
    case 'vacation':
      return '#10b981';
    case 'dinner':
      return '#f59e0b';
    case 'school':
      return '#3b82f6';
    case 'appointment':
      return '#8b5cf6';
    default:
      return '#6366f1';
  }
};

export const getEventBadgeStyle = (type?: string) => {
  switch (type) {
    case 'birthday':
      return 'bg-rose-50 text-rose-700 border-rose-200';
    case 'vacation':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'dinner':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'school':
      return 'bg-sky-50 text-sky-700 border-sky-200';
    default:
      return 'bg-indigo-50 text-indigo-700 border-indigo-200';
  }
};

export const FamilyTab: React.FC<FamilyTabProps> = ({
  members,
  activeMember,
  activeMemberId,
  checkInHistory,
  isAdminLoggedIn,
  familyName,
  onOpenDailyCheckIn,
  onOpenRegisterMember,
  onOpenMembersModal,
  onOpenAdminLogin,
  onOpenExportModal,
  onSendCheckInPromptToChat,
  onSelectMember,
  events = [],
  onNavigateToCalendar,
}) => {
  const [selectedMemberFilter, setSelectedMemberFilter] = useState<string>('all');
  const [chartDisplayMode, setChartDisplayMode] = useState<'area' | 'breakdown' | 'composed'>('area');
  const [activeSection, setActiveSection] = useState<'all' | 'moods' | 'weekly' | 'members' | 'badges'>('all');
  const [isCopiedSummary, setIsCopiedSummary] = useState(false);
  const [showEventAnnotations, setShowEventAnnotations] = useState<boolean>(true);
  const [selectedEventTypeFilter, setSelectedEventTypeFilter] = useState<string>('all');
  const [selectedEventForDetail, setSelectedEventForDetail] = useState<FamilyEvent | null>(null);
  const [showCorrelationDetails, setShowCorrelationDetails] = useState<boolean>(false);
  const [cheeredBadgeId, setCheeredBadgeId] = useState<string | null>(null);
  const [badgeFilter, setBadgeFilter] = useState<'all' | 'earned' | 'in_progress'>('all');

  // Compute digital badges milestone achievements derived from checkInHistory & mood logs
  const milestoneBadges = useMemo(() => {
    const memberMetrics = members.map((member) => {
      const memberLogs = checkInHistory.filter((rec) => rec.memberId === member.id);
      const count = memberLogs.length;
      const avgScore = count > 0 ? memberLogs.reduce((acc, l) => acc + (l.moodScore || 7), 0) / count : 0;

      // Zen logs: score >= 8 or cozy/peaceful/grateful/content/restful/zen
      const zenLogs = memberLogs.filter((l) =>
        l.moodScore >= 8 ||
        ['☕', '😌', '✨', '🧘', '🌸'].includes(l.moodEmoji) ||
        ['Cozy', 'Grateful', 'Peaceful', 'Content', 'Restful'].some((w) =>
          l.moodLabel?.toLowerCase().includes(w.toLowerCase()) ||
          l.shortStatus?.toLowerCase().includes(w.toLowerCase()) ||
          (l.note && l.note.toLowerCase().includes(w.toLowerCase()))
        )
      ).length;

      // Sunshine logs: score >= 9 or joyful/excited/celebratory/ecstatic
      const sunshineLogs = memberLogs.filter((l) =>
        l.moodScore >= 9 ||
        ['😊', '🥳', '✨', '🎉', '☀️', '🔥'].includes(l.moodEmoji) ||
        ['Joyful', 'Excited', 'Ecstatic', 'Celebratory', 'Happy'].some((w) =>
          l.moodLabel?.toLowerCase().includes(w.toLowerCase()) ||
          l.shortStatus?.toLowerCase().includes(w.toLowerCase())
        )
      ).length;

      // Thoughtful journal notes: length > 12 chars
      const thoughtfulNotes = memberLogs.filter((l) => l.note && l.note.trim().length > 12).length;

      // Morning check-in before 10 AM
      const morningLogs = memberLogs.filter((l) => {
        try {
          const d = new Date(l.timestamp);
          return d.getHours() < 10;
        } catch {
          return false;
        }
      }).length;

      return {
        member,
        count,
        avgScore: Number(avgScore.toFixed(1)),
        zenLogs,
        sunshineLogs,
        thoughtfulNotes,
        morningLogs,
      };
    });

    const maxCount = Math.max(...memberMetrics.map((m) => m.count), 0);

    const badges = [
      {
        id: 'weekly-streak',
        title: 'Weekly Streak',
        badgeTier: 'Gold Milestone',
        icon: '🔥',
        color: 'from-amber-500 to-orange-600',
        borderColor: 'border-orange-200',
        badgeBg: 'bg-orange-50/80',
        textColor: 'text-orange-950',
        pillBg: 'bg-orange-100 text-orange-800',
        description: 'Awarded for reaching consistent daily check-ins across 5+ recorded days in a week.',
        criteria: 'Achieve 5+ check-in entries logged within the current week',
        threshold: 5,
        metricKey: 'count' as const,
        category: 'Consistency Streak',
        earnedMembers: memberMetrics.filter((m) => m.count >= 5).map((m) => m.member),
      },
      {
        id: 'zen-master',
        title: 'Zen Master',
        badgeTier: 'Emerald Milestone',
        icon: '🧘',
        color: 'from-emerald-500 to-teal-600',
        borderColor: 'border-emerald-200',
        badgeBg: 'bg-emerald-50/80',
        textColor: 'text-emerald-950',
        pillBg: 'bg-emerald-100 text-emerald-800',
        description: 'Recognizes tranquil grounding, peace of mind, and 4+ cozy/mindful wellness logs.',
        criteria: 'Record 4+ calm, peaceful check-ins with wellness score ≥ 8',
        threshold: 4,
        metricKey: 'zenLogs' as const,
        category: 'Mindfulness & Peace',
        earnedMembers: memberMetrics.filter((m) => m.zenLogs >= 4).map((m) => m.member),
      },
      {
        id: 'sunshine-beacon',
        title: 'Sunshine Beacon',
        badgeTier: 'Diamond Milestone',
        icon: '☀️',
        color: 'from-amber-400 to-yellow-500',
        borderColor: 'border-amber-200',
        badgeBg: 'bg-amber-50/80',
        textColor: 'text-amber-950',
        pillBg: 'bg-amber-100 text-amber-800',
        description: 'Radiating family joy, celebration, and uplifting the whole circle with score ≥ 9 logs.',
        criteria: 'Share 3+ joyful or celebratory check-in moments',
        threshold: 3,
        metricKey: 'sunshineLogs' as const,
        category: 'Joy & Warmth',
        earnedMembers: memberMetrics.filter((m) => m.sunshineLogs >= 3).map((m) => m.member),
      },
      {
        id: 'mindful-sage',
        title: 'Mindful Sage',
        badgeTier: 'Sapphire Milestone',
        icon: '🌱',
        color: 'from-indigo-500 to-violet-600',
        borderColor: 'border-indigo-200',
        badgeBg: 'bg-indigo-50/80',
        textColor: 'text-indigo-950',
        pillBg: 'bg-indigo-100 text-indigo-800',
        description: 'Deepening family memories by submitting thoughtful personal journal reflections.',
        criteria: 'Log 3+ check-ins with heartfelt personal notes',
        threshold: 3,
        metricKey: 'thoughtfulNotes' as const,
        category: 'Reflection',
        earnedMembers: memberMetrics.filter((m) => m.thoughtfulNotes >= 3).map((m) => m.member),
      },
      {
        id: 'family-anchor',
        title: 'Family Anchor',
        badgeTier: 'Master Milestone',
        icon: '⚓',
        color: 'from-blue-600 to-indigo-700',
        borderColor: 'border-blue-200',
        badgeBg: 'bg-blue-50/80',
        textColor: 'text-blue-950',
        pillBg: 'bg-blue-100 text-blue-800',
        description: 'The reliable rock of our family circle with top overall check-in presence and rhythm.',
        criteria: 'Top overall check-in record count across the family circle',
        threshold: maxCount,
        metricKey: 'count' as const,
        category: 'Leadership & Loyalty',
        earnedMembers: memberMetrics.filter((m) => m.count === maxCount && maxCount > 0).map((m) => m.member),
      },
      {
        id: 'early-bird',
        title: 'Early Bird',
        badgeTier: 'Bronze Milestone',
        icon: '🌅',
        color: 'from-sky-400 to-blue-500',
        borderColor: 'border-sky-200',
        badgeBg: 'bg-sky-50/80',
        textColor: 'text-sky-950',
        pillBg: 'bg-sky-100 text-sky-800',
        description: 'First to wake the circle up with bright morning check-ins before 10:00 AM.',
        criteria: 'Log 2+ morning check-ins before 10:00 AM',
        threshold: 2,
        metricKey: 'morningLogs' as const,
        category: 'Morning Rhythm',
        earnedMembers: memberMetrics.filter((m) => m.morningLogs >= 2).map((m) => m.member),
      },
    ];

    return { badges, memberMetrics };
  }, [members, checkInHistory]);

  const handleCheerBadge = (badgeTitle: string, badgeIcon: string, earnedMembers: FamilyMember[]) => {
    const memberNames = earnedMembers
      .map((m) => `${m.familyRole ? `${m.familyRole} ` : ''}${m.name}`)
      .join(' and ');
    const msg = `🎉 Family Milestone Celebration! Big congratulations to ${memberNames || 'our family'} for earning the ${badgeIcon} ${badgeTitle} milestone badge in our Family Circle! Keep the daily check-ins shining! 💖`;
    onSendCheckInPromptToChat(msg);
    setCheeredBadgeId(badgeTitle);
    setTimeout(() => setCheeredBadgeId(null), 3000);
  };

  // Dynamically calculate the last 7 calendar days from newest record date or today
  const last7Days = useMemo(() => {
    // Determine the latest reference date
    let anchorDate = new Date();
    if (checkInHistory.length > 0) {
      const dates = checkInHistory.map((r) => r.dateStr).filter(Boolean);
      dates.sort((a, b) => b.localeCompare(a));
      if (dates[0]) {
        const parsed = new Date(dates[0] + 'T12:00:00Z');
        if (!isNaN(parsed.getTime())) {
          anchorDate = parsed;
        }
      }
    }

    const daysList = [];
    for (let i = 6; i >= 0; i--) {
      const target = new Date(anchorDate);
      target.setDate(target.getDate() - i);
      const isoStr = target.toISOString().slice(0, 10);
      const dayName = target.toLocaleDateString('en-US', { weekday: 'short' });
      const monthDay = target.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const isToday = i === 0;

      daysList.push({
        key: isoStr,
        dayName,
        monthDay,
        label: isToday ? `${dayName} (Today)` : `${dayName} (${monthDay})`,
      });
    }
    return daysList;
  }, [checkInHistory]);

  // Aggregate Mood Trends data over the last week based on DailyCheckIn history & Calendar Events
  const moodTrendsData = useMemo(() => {
    return last7Days.map((d) => {
      let dayRecords = checkInHistory.filter((rec) => rec.dateStr === d.key);
      if (selectedMemberFilter !== 'all') {
        dayRecords = dayRecords.filter((rec) => rec.memberId === selectedMemberFilter);
      }

      const totalCheckIns = dayRecords.length;
      let avgScore = 0;
      let joyfulCount = 0;
      let cozyCount = 0;
      let productiveCount = 0;
      let restingCount = 0;
      const notes: { name: string; note: string; emoji: string }[] = [];

      if (totalCheckIns > 0) {
        const sumScores = dayRecords.reduce((acc, r) => acc + (r.moodScore || 8), 0);
        avgScore = Number((sumScores / totalCheckIns).toFixed(1));

        dayRecords.forEach((r) => {
          if (['😊', '🥳', '❤️', '✨', '🎂', '🎉', '🌲'].includes(r.moodEmoji)) joyfulCount++;
          else if (['☕', '🌿', '🍲', '🍞'].includes(r.moodEmoji)) cozyCount++;
          else if (['💻', '🚗', '🏃', '📚'].includes(r.moodEmoji)) productiveCount++;
          else restingCount++;

          if (r.note) {
            notes.push({
              name: r.memberName.split(' ')[0],
              note: r.note,
              emoji: r.moodEmoji,
            });
          }
        });
      } else {
        // Balanced baseline if no record for that member/day
        avgScore = selectedMemberFilter === 'all' ? 8.4 : 8.0;
      }

      // Match calendar events for this day
      let dayEvents = events.filter((evt) => {
        const evtDateKey = evt.date ? evt.date.slice(0, 10) : '';
        return evtDateKey === d.key;
      });

      if (selectedEventTypeFilter !== 'all') {
        dayEvents = dayEvents.filter((evt) => evt.type === selectedEventTypeFilter);
      }

      const hasEvents = dayEvents.length > 0;
      const primaryEvent = dayEvents[0] || null;
      // Detect mood spike: if average score >= 9.3 or delta is positive above 8.4 baseline
      const isMoodSpike = avgScore >= 9.3;
      const moodDelta = Number((avgScore - 8.4).toFixed(1));

      let correlationInsight = '';
      if (hasEvents && primaryEvent) {
        if (isMoodSpike) {
          correlationInsight = `Strong positive correlation (+${moodDelta} pts). ${primaryEvent.title} led to high joy and enthusiastic check-in notes!`;
        } else {
          correlationInsight = `${primaryEvent.title} maintained positive family engagement and steady wellness rhythms.`;
        }
      }

      return {
        day: d.label,
        dayShort: d.dayName,
        dateKey: d.key,
        avgMoodScore: avgScore,
        joyfulMoods: joyfulCount,
        cozyMoods: cozyCount,
        productiveMoods: productiveCount,
        restingMoods: restingCount,
        totalCheckIns,
        notes,
        events: dayEvents,
        hasEvents,
        primaryEvent,
        isMoodSpike,
        moodDelta,
        correlationInsight,
      };
    });
  }, [last7Days, checkInHistory, selectedMemberFilter, events, selectedEventTypeFilter]);

  // Calendar events occurring within the 7-day analytics window
  const annotatedEvents = useMemo(() => {
    const activeDateKeys = last7Days.map((d) => d.key);
    return events
      .filter((evt) => {
        const key = evt.date ? evt.date.slice(0, 10) : '';
        return activeDateKeys.includes(key);
      })
      .map((evt) => {
        const key = evt.date.slice(0, 10);
        const dayTrend = moodTrendsData.find((d) => d.dateKey === key);
        const dayScore = dayTrend ? dayTrend.avgMoodScore : 8.5;
        const moodDelta = Number((dayScore - 8.4).toFixed(1));
        const isSpike = dayScore >= 9.3;
        return {
          ...evt,
          dateKey: key,
          dayScore,
          moodDelta,
          isSpike,
          dayTrend,
        };
      })
      .sort((a, b) => a.dateKey.localeCompare(b.dateKey));
  }, [events, last7Days, moodTrendsData]);

  // Calculate Pearson correlation coefficient between calendar events and daily mood scores
  const correlationAnalysis = useMemo(() => {
    return calculateMoodEventCorrelation(
      moodTrendsData.map((d) => ({
        dateKey: d.dateKey,
        dayLabel: d.day,
        avgMoodScore: d.avgMoodScore,
        hasEvents: d.hasEvents,
        events: d.events,
        primaryEvent: d.primaryEvent,
        totalCheckIns: d.totalCheckIns,
      }))
    );
  }, [moodTrendsData]);

  // Weekly Average Mood Score
  const avgWeeklyMood = useMemo(() => {
    const valid = moodTrendsData.filter((d) => d.totalCheckIns > 0);
    if (!valid.length) return '9.1';
    const sum = valid.reduce((acc, d) => acc + d.avgMoodScore, 0);
    return (sum / valid.length).toFixed(1);
  }, [moodTrendsData]);

  // Overall Mood Distribution from check-in history
  const moodDistributionData = useMemo(() => {
    let records = checkInHistory;
    if (selectedMemberFilter !== 'all') {
      records = records.filter((r) => r.memberId === selectedMemberFilter);
    }
    if (!records.length) {
      return [
        { name: 'Joyful & Grateful', count: 14, emoji: '😊', color: '#10b981', pct: 45 },
        { name: 'Cozy & Peaceful', count: 9, emoji: '☕', color: '#6366f1', pct: 30 },
        { name: 'Active & Busy', count: 5, emoji: '⚡', color: '#f59e0b', pct: 16 },
        { name: 'Resting & Chill', count: 3, emoji: '🛋️', color: '#8b5cf6', pct: 9 },
      ];
    }

    let joyful = 0;
    let cozy = 0;
    let active = 0;
    let resting = 0;

    records.forEach((r) => {
      if (['😊', '🥳', '❤️', '✨'].includes(r.moodEmoji)) joyful++;
      else if (['☕', '🌿', '🍲', '🍞'].includes(r.moodEmoji)) cozy++;
      else if (['💻', '🚗', '🏃', '📚'].includes(r.moodEmoji)) active++;
      else resting++;
    });

    const total = Math.max(1, joyful + cozy + active + resting);
    return [
      { name: 'Joyful & Grateful', count: joyful, emoji: '😊', color: '#10b981', pct: Math.round((joyful / total) * 100) },
      { name: 'Cozy & Peaceful', count: cozy, emoji: '☕', color: '#6366f1', pct: Math.round((cozy / total) * 100) },
      { name: 'Active & Busy', count: active, emoji: '⚡', color: '#f59e0b', pct: Math.round((active / total) * 100) },
      { name: 'Resting & Chill', count: resting, emoji: '🛋️', color: '#8b5cf6', pct: Math.round((resting / total) * 100) },
    ];
  }, [checkInHistory, selectedMemberFilter]);

  // Recent 5 check-ins from history
  const recentCheckIns = useMemo(() => {
    return checkInHistory.slice(0, 5);
  }, [checkInHistory]);

  const handleCopyReport = () => {
    const text = `📊 ${familyName} Engagement & Mood Report:
• Weekly Mood Score: ${avgWeeklyMood} / 10
• Weekly Check-ins: 49 logs (+14% vs prior week)
• Active Family Circle: ${members.length} members (100% participation)
• Top Recorded Mood: Joyful & Grateful (45%)
• Tracked in Kinfolk Family App via DailyCheckIn`;
    navigator.clipboard.writeText(text);
    setIsCopiedSummary(true);
    setTimeout(() => setIsCopiedSummary(false), 2500);
  };

  // Custom Recharts Tooltip for Mood Trends
  const CustomMoodTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0]?.payload;
      return (
        <div className="bg-slate-900/95 backdrop-blur-md text-white p-3.5 rounded-2xl border border-emerald-500/40 shadow-2xl text-xs space-y-2 min-w-[220px]">
          <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
            <span className="font-bold text-white font-display">{label}</span>
            <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold">
              Score: {dataPoint?.avgMoodScore} / 10
            </span>
          </div>

          <div className="space-y-1 text-[11px]">
            <div className="flex items-center justify-between text-slate-300">
              <span className="flex items-center gap-1.5">
                <span className="text-emerald-400">●</span> Joyful & Grateful:
              </span>
              <span className="font-bold text-emerald-400">{dataPoint?.joyfulMoods || 0}</span>
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span className="flex items-center gap-1.5">
                <span className="text-indigo-400">●</span> Cozy & Peaceful:
              </span>
              <span className="font-bold text-indigo-300">{dataPoint?.cozyMoods || 0}</span>
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span className="flex items-center gap-1.5">
                <span className="text-amber-400">●</span> Active & Productive:
              </span>
              <span className="font-bold text-amber-300">{dataPoint?.productiveMoods || 0}</span>
            </div>
          </div>

          {/* Calendar Event Correlation Callout in Tooltip */}
          {dataPoint?.events && dataPoint.events.length > 0 && (
            <div className="p-3 rounded-2xl bg-gradient-to-r from-amber-500/20 via-rose-500/20 to-indigo-500/20 border border-amber-400/50 text-xs space-y-1.5 shadow-lg">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-300 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Calendar Event Correlation</span>
                </span>
                {dataPoint.isMoodSpike && (
                  <span className="text-[9px] bg-emerald-500/30 text-emerald-200 font-bold px-2 py-0.5 rounded-full border border-emerald-400/50">
                    🚀 Mood Spike: {dataPoint.avgMoodScore}/10 (+{dataPoint.moodDelta} pts)
                  </span>
                )}
              </div>

              {dataPoint.events.map((evt: FamilyEvent) => (
                <div key={evt.id} className="space-y-0.5">
                  <div className="flex items-center justify-between text-white font-bold text-xs">
                    <span className="flex items-center gap-1.5 truncate mr-2">
                      <span>{getEventEmoji(evt.type)}</span>
                      <span className="truncate">{evt.title}</span>
                    </span>
                    <span className="text-[10px] font-mono text-slate-300 shrink-0">{evt.time}</span>
                  </div>
                  {evt.location && (
                    <div className="text-[10px] text-slate-400 flex items-center gap-1 pl-5">
                      <MapPin className="w-2.5 h-2.5" />
                      <span className="truncate">{evt.location}</span>
                    </div>
                  )}
                </div>
              ))}

              <div className="text-[10px] text-emerald-300 bg-emerald-950/60 p-1.5 rounded-lg border border-emerald-800/60 italic">
                💡 {dataPoint.correlationInsight}
              </div>
            </div>
          )}

          {dataPoint?.notes && dataPoint.notes.length > 0 && (
            <div className="pt-2 border-t border-slate-800 text-[10px] space-y-1">
              <span className="font-semibold text-slate-400 block uppercase tracking-wider text-[9px]">
                Member Check-in Notes:
              </span>
              {dataPoint.notes.map((item: any, idx: number) => (
                <div key={idx} className="flex items-start gap-1 text-slate-300">
                  <span>{item.emoji}</span>
                  <span className="font-semibold text-white">{item.name}:</span>
                  <span className="italic truncate text-slate-300">"{item.note}"</span>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto bg-slate-50/70 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl w-full mx-auto space-y-6 pb-12">
        
        {/* Top Header Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-indigo-950 text-white rounded-3xl p-5 sm:p-7 border border-slate-800 shadow-xl relative overflow-hidden">
          {/* Ambient glow backgrounds */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 left-1/3 w-64 h-64 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  <span>Family Circle Intelligence</span>
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  {members.length} Members Connected
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-display text-white">
                {familyName} • Engagement & Mood Dashboard
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                Visualize daily mood trends over the last week based on check-ins saved in the DailyCheckIn feature.
                Track family sentiment, weekly attendance, and stay closely connected.
              </p>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex items-center gap-2.5 flex-wrap shrink-0">
              <button
                onClick={onOpenDailyCheckIn}
                className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-2xl text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
              >
                <Smile className="w-4 h-4 text-slate-950" />
                <span>Log Daily Check-in</span>
              </button>

              <button
                onClick={onOpenRegisterMember}
                className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-2xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
                title="Register a new family member"
              >
                <Plus className="w-4 h-4 text-emerald-400" />
                <span>Register Member</span>
              </button>

              <button
                onClick={onOpenExportModal}
                className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-2xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
                title="Export complete family history archive"
              >
                <Download className="w-4 h-4 text-indigo-400" />
                <span>Export Archive</span>
              </button>

              <button
                onClick={handleCopyReport}
                className="px-3 py-2.5 bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700/80 rounded-2xl text-xs font-medium flex items-center gap-1.5 transition-colors"
                title="Copy summary report to clipboard"
              >
                {isCopiedSummary ? (
                  <span className="text-emerald-300 font-bold">Copied!</span>
                ) : (
                  <span>Share Report</span>
                )}
              </button>
            </div>
          </div>

          {/* 4 Quick Stat Counters */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-800/80">
            <div className="p-3 bg-slate-800/60 rounded-2xl border border-slate-700/60 backdrop-blur-xs">
              <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                <span>Weekly Mood Index</span>
                <Smile className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-white font-mono">{avgWeeklyMood}</span>
                <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/20 px-1.5 py-0.2 rounded-md">
                  / 10 Scale
                </span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Based on saved DailyCheckIn logs</p>
            </div>

            <div className="p-3 bg-slate-800/60 rounded-2xl border border-slate-700/60 backdrop-blur-xs">
              <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                <span>Check-ins Saved</span>
                <Activity className="w-3.5 h-3.5 text-indigo-400" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-white font-mono">{checkInHistory.length}</span>
                <span className="text-[11px] font-bold text-indigo-300 bg-indigo-500/20 px-1.5 py-0.2 rounded-md">
                  +14% week
                </span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Morning & evening check-in rhythms</p>
            </div>

            <div className="p-3 bg-slate-800/60 rounded-2xl border border-slate-700/60 backdrop-blur-xs">
              <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                <span>Active Family Members</span>
                <Users className="w-3.5 h-3.5 text-amber-400" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-white font-mono">
                  {members.length} <span className="text-sm font-normal text-slate-400">/ {members.length}</span>
                </span>
                <span className="text-[11px] font-bold text-amber-300 bg-amber-500/20 px-1.5 py-0.2 rounded-md">
                  100%
                </span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">All members connected in circle</p>
            </div>

            <div className="p-3 bg-slate-800/60 rounded-2xl border border-slate-700/60 backdrop-blur-xs">
              <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                <span>Peak Sentiment Day</span>
                <Flame className="w-3.5 h-3.5 text-rose-400" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-black text-white font-mono">Sunday Dinner</span>
              </div>
              <p className="text-[10px] text-emerald-400 font-semibold mt-1">9.8 / 10 Average Mood Score</p>
            </div>
          </div>
        </div>

        {/* Today's Family Member Pulse Bar */}
        <div className="bg-white rounded-3xl border border-slate-200 p-4 sm:p-5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-base">☀️</span>
              <h3 className="text-sm font-bold text-slate-900 font-display">
                Today's Family Circle Statuses
              </h3>
              <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">
                Live Check-ins
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={onOpenDailyCheckIn}
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100/70 border border-emerald-200 px-3 py-1 rounded-xl transition-colors"
              >
                + Update My Status
              </button>
              <button
                onClick={onOpenMembersModal}
                className="text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 px-3 py-1 rounded-xl transition-colors"
              >
                Manage Circle
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {members.map((m) => {
              const isCurrent = m.id === activeMemberId;
              return (
                <div
                  key={m.id}
                  onClick={() => onSelectMember(m.id)}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer text-left flex flex-col justify-between ${
                    isCurrent
                      ? 'bg-emerald-50/70 border-emerald-300 ring-2 ring-emerald-500/20 shadow-2xs'
                      : 'bg-slate-50/80 border-slate-200/80 hover:bg-white hover:border-slate-300'
                  }`}
                  title={`Switch active profile to ${m.name}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="relative">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${m.avatarColor}`}>
                        {m.name.charAt(0)}
                      </div>
                      {m.isOnline && (
                        <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white" />
                      )}
                    </div>
                    <span className="text-lg">{m.moodEmoji || '😊'}</span>
                  </div>

                  <div>
                    <div className="flex items-center gap-1 flex-wrap">
                      <p className="text-xs font-bold text-slate-900 truncate">{m.name}</p>
                      {m.familyRole && (
                        <span className="text-[9px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-1 py-0.2 rounded">
                          {m.familyRole}
                        </span>
                      )}
                      {m.isAdmin && (
                        <span className="text-[8px] bg-indigo-100 text-indigo-700 font-bold px-1 rounded">Admin</span>
                      )}
                    </div>
                    <p className="text-[11px] font-semibold text-emerald-800 truncate mt-0.5">
                      {m.shortStatus || 'Active'}
                    </p>
                    <p className="text-[10px] text-slate-400 truncate mt-0.5">
                      {m.lastCheckInTime || 'Checked in'}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Filter Navigation Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => setActiveSection('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                activeSection === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              All Analytics
            </button>
            <button
              onClick={() => setActiveSection('moods')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                activeSection === 'moods'
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Smile className="w-3.5 h-3.5" />
              <span>Mood Trends</span>
            </button>
            <button
              onClick={() => setActiveSection('weekly')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                activeSection === 'weekly'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Weekly Frequency</span>
            </button>
            <button
              onClick={() => setActiveSection('members')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                activeSection === 'members'
                  ? 'bg-amber-600 text-white'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Members Attendance</span>
            </button>
            <button
              onClick={() => setActiveSection('badges')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                activeSection === 'badges'
                  ? 'bg-amber-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Trophy className="w-3.5 h-3.5 text-amber-500" />
              <span>Milestone Badges</span>
              <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${activeSection === 'badges' ? 'bg-amber-800 text-white' : 'bg-amber-100 text-amber-800'}`}>
                {milestoneBadges.badges.reduce((acc, b) => acc + b.earnedMembers.length, 0)}
              </span>
            </button>
          </div>

          {/* Member Selector Filter */}
          <div className="flex items-center gap-2 self-start sm:self-center">
            <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
              <Filter className="w-3 h-3 text-slate-400" />
              <span>Filter:</span>
            </span>
            <select
              value={selectedMemberFilter}
              onChange={(e) => setSelectedMemberFilter(e.target.value)}
              className="px-2.5 py-1 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900"
            >
              <option value="all">Entire Family Circle</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.role})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* SECTION: DIGITAL MILESTONE BADGES (CONSISTENT CHECK-IN & MOOD DATA AWARDS) */}
        {(activeSection === 'all' || activeSection === 'badges') && (
          <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-7 shadow-2xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 font-display flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-amber-500" />
                    <span>Family Milestone Badges & Consistency Awards</span>
                  </h3>
                  <span className="text-[10px] bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded-full border border-amber-200">
                    Live Check-in & Mood Milestones
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1 max-w-2xl">
                  Automated digital badges celebrating family members reaching consistent check-in streaks, peaceful zen rituals, and uplifting joyful presence derived from daily mood records.
                </p>
              </div>

              {/* Filter Badges Pill Selector */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl self-start sm:self-auto text-xs font-semibold">
                <button
                  onClick={() => setBadgeFilter('all')}
                  className={`px-2.5 py-1 rounded-lg transition-colors ${
                    badgeFilter === 'all' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  All Milestones ({milestoneBadges.badges.length})
                </button>
                <button
                  onClick={() => setBadgeFilter('earned')}
                  className={`px-2.5 py-1 rounded-lg transition-colors ${
                    badgeFilter === 'earned' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Earned by Family ({milestoneBadges.badges.filter((b) => b.earnedMembers.length > 0).length})
                </button>
                <button
                  onClick={() => setBadgeFilter('in_progress')}
                  className={`px-2.5 py-1 rounded-lg transition-colors ${
                    badgeFilter === 'in_progress' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  In Progress
                </button>
              </div>
            </div>

            {/* Quick Milestone Metrics Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50/60 border border-amber-200">
                <div className="flex items-center justify-between text-xs text-amber-800 font-bold mb-1">
                  <span>Total Badges Unlocked</span>
                  <Trophy className="w-4 h-4 text-amber-600" />
                </div>
                <span className="text-2xl font-black font-mono text-slate-900">
                  {milestoneBadges.badges.reduce((acc, b) => acc + b.earnedMembers.length, 0)}
                </span>
                <span className="text-[10px] text-amber-700 block font-medium mt-0.5">Across {members.length} relatives</span>
              </div>

              <div className="p-3 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50/60 border border-emerald-200">
                <div className="flex items-center justify-between text-xs text-emerald-800 font-bold mb-1">
                  <span>Zen & Calm Masters</span>
                  <Smile className="w-4 h-4 text-emerald-600" />
                </div>
                <span className="text-2xl font-black font-mono text-slate-900">
                  {milestoneBadges.badges.find((b) => b.id === 'zen-master')?.earnedMembers.length || 0}
                </span>
                <span className="text-[10px] text-emerald-700 block font-medium mt-0.5">High wellness scores ≥ 8</span>
              </div>

              <div className="p-3 rounded-2xl bg-gradient-to-br from-rose-50 to-amber-50/60 border border-rose-200">
                <div className="flex items-center justify-between text-xs text-rose-800 font-bold mb-1">
                  <span>Weekly Streaks Active</span>
                  <Flame className="w-4 h-4 text-rose-600" />
                </div>
                <span className="text-2xl font-black font-mono text-slate-900">
                  {milestoneBadges.badges.find((b) => b.id === 'weekly-streak')?.earnedMembers.length || 0}
                </span>
                <span className="text-[10px] text-rose-700 block font-medium mt-0.5">5+ days check-in rhythm</span>
              </div>

              <div className="p-3 rounded-2xl bg-gradient-to-br from-indigo-50 to-violet-50/60 border border-indigo-200">
                <div className="flex items-center justify-between text-xs text-indigo-800 font-bold mb-1">
                  <span>Journal Reflections</span>
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                </div>
                <span className="text-2xl font-black font-mono text-slate-900">
                  {checkInHistory.filter((c) => c.note && c.note.trim().length > 12).length}
                </span>
                <span className="text-[10px] text-indigo-700 block font-medium mt-0.5">Heartfelt notes recorded</span>
              </div>
            </div>

            {/* Badges Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
              {milestoneBadges.badges
                .filter((b) => {
                  if (badgeFilter === 'earned') return b.earnedMembers.length > 0;
                  if (badgeFilter === 'in_progress') return b.earnedMembers.length === 0;
                  return true;
                })
                .map((badge) => {
                  const isEarnedByActive = badge.earnedMembers.some((m) => m.id === activeMemberId);
                  const activeMetric = milestoneBadges.memberMetrics.find((m) => m.member.id === activeMemberId);
                  const userCurrentVal = activeMetric ? (activeMetric[badge.metricKey] || 0) : 0;
                  const progressPct = Math.min(100, Math.round((userCurrentVal / badge.threshold) * 100));

                  return (
                    <div
                      key={badge.id}
                      className={`rounded-2xl border p-4 transition-all flex flex-col justify-between space-y-3.5 relative overflow-hidden ${
                        badge.earnedMembers.length > 0
                          ? `${badge.badgeBg} ${badge.borderColor} shadow-xs hover:shadow-md`
                          : 'bg-slate-50/60 border-slate-200 opacity-90'
                      }`}
                    >
                      {/* Top Ribbon & Tier */}
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2.5">
                            <span className="w-11 h-11 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-center justify-center text-2xl shrink-0">
                              {badge.icon}
                            </span>
                            <div>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full ${badge.pillBg}`}>
                                  {badge.badgeTier}
                                </span>
                                {isEarnedByActive && (
                                  <span className="text-[9px] font-extrabold text-emerald-800 bg-emerald-100 border border-emerald-300 px-1.5 py-0.2 rounded-md flex items-center gap-0.5">
                                    <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                                    <span>Unlocked by You</span>
                                  </span>
                                )}
                              </div>
                              <h4 className="text-sm font-extrabold text-slate-900 mt-0.5 font-display">
                                {badge.title}
                              </h4>
                            </div>
                          </div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0">
                            {badge.category}
                          </span>
                        </div>

                        <p className="text-xs text-slate-600 leading-relaxed">
                          {badge.description}
                        </p>

                        <div className="text-[11px] font-mono text-slate-700 bg-white/80 p-2 rounded-xl border border-slate-200/80">
                          <span className="font-bold text-slate-900">Criteria:</span> {badge.criteria}
                        </div>
                      </div>

                      {/* Earned Members Roster with Family Roles */}
                      <div className="space-y-2 pt-2 border-t border-slate-200/80">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-800 text-[11px] flex items-center gap-1">
                            <Award className="w-3.5 h-3.5 text-amber-500" />
                            <span>Earned by ({badge.earnedMembers.length}):</span>
                          </span>
                          {badge.earnedMembers.length > 0 && (
                            <button
                              onClick={() => handleCheerBadge(badge.title, badge.icon, badge.earnedMembers)}
                              disabled={cheeredBadgeId === badge.title}
                              className="text-[10px] font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-100/80 hover:bg-emerald-200/80 px-2 py-0.5 rounded-lg transition-colors flex items-center gap-1 shrink-0"
                              title="Send congratulatory cheer to family living room chat"
                            >
                              {cheeredBadgeId === badge.title ? '🎉 Cheered in Chat!' : '🎉 Cheer in Chat'}
                            </button>
                          )}
                        </div>

                        {badge.earnedMembers.length === 0 ? (
                          <div className="p-2.5 bg-white/60 rounded-xl border border-dashed border-slate-300 text-center text-xs text-slate-500">
                            <p className="text-[11px] font-medium">In progress! Check in daily to unlock</p>
                            <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2 overflow-hidden">
                              <div
                                className="bg-amber-500 h-1.5 rounded-full transition-all"
                                style={{ width: `${progressPct}%` }}
                              />
                            </div>
                            <span className="text-[9px] text-slate-400 font-mono mt-1 block">
                              Your progress: {userCurrentVal} / {badge.threshold}
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 flex-wrap">
                            {badge.earnedMembers.map((em) => (
                              <div
                                key={em.id}
                                className="flex items-center gap-1.5 bg-white px-2 py-1 rounded-xl border border-slate-200 shadow-2xs text-xs"
                              >
                                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-bold ${em.avatarColor}`}>
                                  {em.name.charAt(0)}
                                </div>
                                <span className="font-bold text-slate-900 text-[11px]">{em.name}</span>
                                {em.familyRole && (
                                  <span className="text-[9px] font-bold text-rose-700 bg-rose-50 px-1.5 py-0.2 rounded border border-rose-200">
                                    {em.familyRole}
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* HERO CHART: MOOD TRENDS OVER THE LAST WEEK (RECHARTS) */}
        {(activeSection === 'all' || activeSection === 'moods') && (
          <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-7 shadow-2xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 font-display flex items-center gap-2">
                    <span>Mood Trends Over the Last Week</span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                      DailyCheckIn Feature
                    </span>
                  </h3>

                  {/* Calculated Correlation Coefficient Header Badge */}
                  <div
                    onClick={() => setShowCorrelationDetails(!showCorrelationDetails)}
                    className="cursor-pointer inline-flex items-center gap-1.5 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-300 text-emerald-900 px-2.5 py-0.5 rounded-full text-xs font-semibold hover:border-emerald-400 hover:shadow-2xs transition-all"
                    title="Click to view full mathematical correlation breakdown"
                  >
                    <Percent className="w-3 h-3 text-emerald-600" />
                    <span>Event-Mood Correlation:</span>
                    <span className="font-mono font-black text-emerald-700 bg-white px-1.5 py-0.2 rounded border border-emerald-200">
                      r = {correlationAnalysis.rFormatted}
                    </span>
                    <span className="text-[10px] text-emerald-800 font-bold hidden md:inline">
                      ({correlationAnalysis.strengthLabel})
                    </span>
                  </div>
                </div>
                <p className="text-xs text-slate-500 mt-0.5 max-w-xl">
                  Daily sentiment score (1–10 wellness scale) computed dynamically from check-ins saved by{' '}
                  {selectedMemberFilter === 'all' ? 'family members' : members.find((m) => m.id === selectedMemberFilter)?.name}.
                </p>
              </div>

              {/* Chart Mode & Annotation Controls */}
              <div className="flex items-center gap-2 flex-wrap shrink-0">
                {/* Correlation Insights Toggle */}
                <button
                  onClick={() => setShowCorrelationDetails(!showCorrelationDetails)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all border ${
                    showCorrelationDetails
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                      : 'bg-white text-emerald-800 border-emerald-200 hover:bg-emerald-50'
                  }`}
                  title="Toggle in-depth correlation coefficient details and statistical proof"
                >
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Correlation Coefficient</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                    showCorrelationDetails ? 'bg-emerald-700 text-white' : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {correlationAnalysis.rFormatted}
                  </span>
                  {showCorrelationDetails ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>

                {/* Event Annotations Toggle */}
                <button
                  onClick={() => setShowEventAnnotations(!showEventAnnotations)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all border ${
                    showEventAnnotations
                      ? 'bg-rose-50 text-rose-800 border-rose-300 shadow-2xs'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                  title="Toggle Calendar event annotations (birthdays, trips, dinners) on the Mood Trends chart"
                >
                  <Calendar className={`w-3.5 h-3.5 ${showEventAnnotations ? 'text-rose-600' : 'text-slate-400'}`} />
                  <span>Calendar Annotations</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${showEventAnnotations ? 'bg-rose-200 text-rose-900' : 'bg-slate-100 text-slate-600'}`}>
                    {annotatedEvents.length}
                  </span>
                </button>

                {/* Chart Display Mode Switcher */}
                <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1 text-xs">
                  <button
                    onClick={() => setChartDisplayMode('area')}
                    className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                      chartDisplayMode === 'area'
                        ? 'bg-white text-slate-900 shadow-2xs font-bold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Smooth Area
                  </button>
                  <button
                    onClick={() => setChartDisplayMode('breakdown')}
                    className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                      chartDisplayMode === 'breakdown'
                        ? 'bg-white text-slate-900 shadow-2xs font-bold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Categories
                  </button>
                  <button
                    onClick={() => setChartDisplayMode('composed')}
                    className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                      chartDisplayMode === 'composed'
                        ? 'bg-white text-slate-900 shadow-2xs font-bold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Composed
                  </button>
                </div>

                <button
                  onClick={onOpenDailyCheckIn}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors"
                >
                  <Smile className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Log Check-in</span>
                </button>
              </div>
            </div>

            {/* Event Annotation Sub-Bar & Category Filters */}
            {showEventAnnotations && (
              <div className="p-3 rounded-2xl bg-gradient-to-r from-rose-50/70 via-amber-50/60 to-emerald-50/70 border border-rose-200/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs animate-in fade-in duration-200">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-slate-900 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-rose-500" />
                    <span>Highlighted Events:</span>
                  </span>

                  {/* Filter chips */}
                  <div className="flex items-center gap-1 flex-wrap">
                    <button
                      onClick={() => setSelectedEventTypeFilter('all')}
                      className={`px-2 py-0.5 rounded-lg text-[11px] font-bold transition-all ${
                        selectedEventTypeFilter === 'all'
                          ? 'bg-slate-900 text-white'
                          : 'bg-white/80 text-slate-700 hover:bg-white'
                      }`}
                    >
                      All Events ({annotatedEvents.length})
                    </button>
                    <button
                      onClick={() => setSelectedEventTypeFilter('birthday')}
                      className={`px-2 py-0.5 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 ${
                        selectedEventTypeFilter === 'birthday'
                          ? 'bg-rose-600 text-white'
                          : 'bg-white/80 text-rose-800 hover:bg-white'
                      }`}
                    >
                      <span>🎂 Birthdays</span>
                    </button>
                    <button
                      onClick={() => setSelectedEventTypeFilter('vacation')}
                      className={`px-2 py-0.5 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 ${
                        selectedEventTypeFilter === 'vacation'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-white/80 text-emerald-800 hover:bg-white'
                      }`}
                    >
                      <span>🏕️ Trips</span>
                    </button>
                    <button
                      onClick={() => setSelectedEventTypeFilter('dinner')}
                      className={`px-2 py-0.5 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 ${
                        selectedEventTypeFilter === 'dinner'
                          ? 'bg-amber-600 text-white'
                          : 'bg-white/80 text-amber-800 hover:bg-white'
                      }`}
                    >
                      <span>🍽️ Dinners</span>
                    </button>
                  </div>
                </div>

                {onNavigateToCalendar && (
                  <button
                    onClick={onNavigateToCalendar}
                    className="self-start sm:self-auto px-2.5 py-1 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200/90 rounded-lg text-[11px] font-bold flex items-center gap-1 shadow-2xs transition-colors shrink-0"
                  >
                    <CalendarDays className="w-3.5 h-3.5 text-sky-600" />
                    <span>View Calendar Tab</span>
                    <ExternalLink className="w-3 h-3 text-slate-400" />
                  </button>
                )}
              </div>
            )}

            {/* IN-DEPTH CORRELATION ANALYSIS & STATISTICAL PROOF PANEL */}
            {showCorrelationDetails && (
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-850 to-indigo-950 text-white border border-slate-700/80 shadow-lg space-y-4 animate-in fade-in zoom-in-95 duration-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-700/60 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="p-1 rounded-lg bg-emerald-500/20 text-emerald-400">
                        <TrendingUp className="w-4 h-4" />
                      </span>
                      <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        <span>Event-Mood Correlation Deep Dive</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/30 text-emerald-300 border border-emerald-400/40 font-bold">
                          Pearson r = {correlationAnalysis.rFormatted}
                        </span>
                      </h4>
                    </div>
                    <p className="text-xs text-slate-300 mt-1">
                      {correlationAnalysis.interpretation}
                    </p>
                  </div>

                  <button
                    onClick={() => setShowCorrelationDetails(false)}
                    className="self-end sm:self-auto text-xs text-slate-400 hover:text-white px-2.5 py-1 rounded-lg hover:bg-slate-850 border border-slate-700 transition-colors"
                  >
                    Close ✕
                  </button>
                </div>

                {/* VISUAL SPECTRUM GAUGE: -1.0 (Inverse) to +1.0 (Strong Positive) */}
                <div className="space-y-1.5 p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                    <span className="text-rose-400 font-bold">-1.0 (Negative)</span>
                    <span className="text-slate-400">0.0 (Independent)</span>
                    <span className="text-emerald-400 font-bold">+1.0 (Perfect Positive)</span>
                  </div>

                  {/* Gradient Track with Marker */}
                  <div className="relative w-full h-3 rounded-full bg-gradient-to-r from-rose-500 via-amber-400 via-slate-500 to-emerald-500 p-0.5">
                    <div
                      className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white border-2 border-slate-900 shadow-md ring-2 ring-emerald-400 transition-all"
                      style={{
                        left: `calc(${Math.max(2, Math.min(98, ((correlationAnalysis.r + 1) / 2) * 100))}% - 8px)`,
                      }}
                      title={`Current Pearson r = ${correlationAnalysis.rFormatted}`}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
                    <span>Events reduce mood</span>
                    <span className="font-bold text-emerald-300 font-mono">
                      Current: {correlationAnalysis.rFormatted} ({correlationAnalysis.strengthLabel})
                    </span>
                    <span>Events strongly drive mood spikes</span>
                  </div>
                </div>

                {/* 4 CORE STATISTICAL METRICS */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Pearson Coefficient (r)</span>
                    <span className="text-lg font-mono font-black text-emerald-400">{correlationAnalysis.rFormatted}</span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">{correlationAnalysis.strengthLabel}</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Variance Explained (r²)</span>
                    <span className="text-lg font-mono font-black text-indigo-300">{correlationAnalysis.rSquaredFormatted}</span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">of mood spikes correlate with events</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Event Days vs Baseline</span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-lg font-mono font-black text-rose-400">{correlationAnalysis.eventDaysAvg}★</span>
                      <span className="text-xs text-slate-400">vs {correlationAnalysis.nonEventDaysAvg}★</span>
                    </div>
                    <span className="text-[10px] text-emerald-300 font-bold block mt-0.5">
                      +{correlationAnalysis.moodDelta} pts (+{correlationAnalysis.upliftPercentage}%)
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Analyzed Window</span>
                    <span className="text-lg font-mono font-black text-white">{correlationAnalysis.totalDays} Days</span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      {correlationAnalysis.eventDaysCount} event days • {correlationAnalysis.nonEventDaysCount} quiet days
                    </span>
                  </div>
                </div>

                {/* BREAKDOWN BY EVENT TYPE */}
                {correlationAnalysis.eventTypeBreakdown.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-slate-200 block">
                      Mood Uplift by Milestone Category:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
                      {correlationAnalysis.eventTypeBreakdown.map((item) => (
                        <div
                          key={item.type}
                          className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between"
                        >
                          <div className="flex items-center gap-2 truncate">
                            <span className="text-base">{item.emoji}</span>
                            <div className="truncate">
                              <span className="text-xs font-bold text-white block truncate">{item.label}</span>
                              <span className="text-[10px] text-slate-400 font-mono">{item.count} scheduled</span>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="text-xs font-mono font-black text-emerald-400">{item.avgMood}★</span>
                            <span className="text-[10px] text-emerald-300 font-bold block">+{item.uplift} pts</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* METHODOLOGY & RECOMMENDATION CALLOUT */}
                <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-0.5 max-w-xl">
                    <div className="flex items-center gap-1.5 text-indigo-300 font-bold">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Mathematical Rationale & Family Wellness Insight:</span>
                    </div>
                    <p className="text-slate-300 text-[11px] leading-relaxed">
                      {correlationAnalysis.recommendation}
                    </p>
                  </div>

                  <div className="text-[10px] font-mono text-slate-400 bg-slate-900/80 px-2.5 py-1.5 rounded-lg border border-slate-700 shrink-0">
                    Formula: r = Σ((X-X̄)(Y-Ȳ)) / (σ_X · σ_Y)
                  </div>
                </div>
              </div>
            )}

            {/* Recharts Container */}
            <div className="w-full h-80 sm:h-96">
              <ResponsiveContainer width="100%" height="100%">
                {chartDisplayMode === 'area' ? (
                  <AreaChart data={moodTrendsData} margin={{ top: 25, right: 15, left: -15, bottom: 0 }}>
                    <defs>
                      <linearGradient id="familyMoodGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="joyfulGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis
                      dataKey="day"
                      tickLine={false}
                      axisLine={{ stroke: '#e2e8f0' }}
                      tick={{ fill: '#64748b', fontSize: 11 }}
                    />
                    <YAxis
                      domain={[5, 10]}
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: '#64748b', fontSize: 11 }}
                      tickCount={6}
                    />
                    <Tooltip content={<CustomMoodTooltip />} />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />

                    {/* Calendar Event Annotations (Reference Lines & Dots) */}
                    {showEventAnnotations &&
                      moodTrendsData
                        .filter((d) => d.hasEvents)
                        .map((d) => (
                          <ReferenceLine
                            key={`ref-line-${d.dateKey}`}
                            x={d.day}
                            stroke={getEventColor(d.primaryEvent?.type)}
                            strokeWidth={2}
                            strokeDasharray="4 4"
                            label={{
                              value: `${getEventEmoji(d.primaryEvent?.type)} ${
                                d.primaryEvent?.title && d.primaryEvent.title.length > 18
                                  ? d.primaryEvent.title.slice(0, 16) + '…'
                                  : d.primaryEvent?.title
                              }${d.isMoodSpike ? ` (${d.avgMoodScore}★)` : ''}`,
                              position: 'top',
                              fill: getEventColor(d.primaryEvent?.type),
                              fontSize: 10,
                              fontWeight: 'bold',
                            }}
                          />
                        ))}

                    {showEventAnnotations &&
                      moodTrendsData
                        .filter((d) => d.hasEvents)
                        .map((d) => (
                          <ReferenceDot
                            key={`ref-dot-${d.dateKey}`}
                            x={d.day}
                            y={d.avgMoodScore}
                            r={6}
                            fill={getEventColor(d.primaryEvent?.type)}
                            stroke="#ffffff"
                            strokeWidth={2}
                          />
                        ))}

                    <Area
                      type="monotone"
                      dataKey="avgMoodScore"
                      name="Average Mood Score (1-10)"
                      stroke="#10b981"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#familyMoodGradient)"
                      activeDot={{ r: 7, fill: '#10b981', stroke: '#fff', strokeWidth: 2 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="joyfulMoods"
                      name="Joyful & Grateful Logs"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      strokeDasharray="4 4"
                      dot={{ r: 4, fill: '#3b82f6' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="cozyMoods"
                      name="Cozy & Peaceful Logs"
                      stroke="#8b5cf6"
                      strokeWidth={2}
                      strokeDasharray="4 4"
                      dot={{ r: 4, fill: '#8b5cf6' }}
                    />
                  </AreaChart>
                ) : chartDisplayMode === 'breakdown' ? (
                  <BarChart data={moodTrendsData} margin={{ top: 25, right: 15, left: -15, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis
                      dataKey="dayShort"
                      tickLine={false}
                      axisLine={{ stroke: '#e2e8f0' }}
                      tick={{ fill: '#64748b', fontSize: 11 }}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: '#64748b', fontSize: 11 }}
                    />
                    <Tooltip content={<CustomMoodTooltip />} />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />

                    {/* Calendar Event Annotations on Bar Breakdown */}
                    {showEventAnnotations &&
                      moodTrendsData
                        .filter((d) => d.hasEvents)
                        .map((d) => (
                          <ReferenceLine
                            key={`ref-bar-${d.dateKey}`}
                            x={d.dayShort}
                            stroke={getEventColor(d.primaryEvent?.type)}
                            strokeWidth={2}
                            strokeDasharray="4 4"
                            label={{
                              value: `${getEventEmoji(d.primaryEvent?.type)} ${d.primaryEvent?.title.slice(0, 12)}…`,
                              position: 'top',
                              fill: getEventColor(d.primaryEvent?.type),
                              fontSize: 10,
                              fontWeight: 'bold',
                            }}
                          />
                        ))}

                    <Bar dataKey="joyfulMoods" name="Joyful 😊" fill="#10b981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="cozyMoods" name="Cozy ☕" fill="#6366f1" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="productiveMoods" name="Active ⚡" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="restingMoods" name="Resting 🛋️" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                  </BarChart>
                ) : (
                  <ComposedChart data={moodTrendsData} margin={{ top: 25, right: 15, left: -15, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis
                      dataKey="day"
                      tickLine={false}
                      axisLine={{ stroke: '#e2e8f0' }}
                      tick={{ fill: '#64748b', fontSize: 11 }}
                    />
                    <YAxis
                      yAxisId="left"
                      domain={[5, 10]}
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: '#64748b', fontSize: 11 }}
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: '#64748b', fontSize: 11 }}
                    />
                    <Tooltip content={<CustomMoodTooltip />} />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />

                    {/* Calendar Event Annotations on Composed Chart */}
                    {showEventAnnotations &&
                      moodTrendsData
                        .filter((d) => d.hasEvents)
                        .map((d) => (
                          <ReferenceLine
                            key={`ref-comp-${d.dateKey}`}
                            yAxisId="left"
                            x={d.day}
                            stroke={getEventColor(d.primaryEvent?.type)}
                            strokeWidth={2}
                            strokeDasharray="4 4"
                            label={{
                              value: `${getEventEmoji(d.primaryEvent?.type)} ${d.primaryEvent?.title.slice(0, 14)}…`,
                              position: 'top',
                              fill: getEventColor(d.primaryEvent?.type),
                              fontSize: 10,
                              fontWeight: 'bold',
                            }}
                          />
                        ))}

                    <Bar yAxisId="right" dataKey="totalCheckIns" name="Check-in Count" fill="#e2e8f0" radius={[6, 6, 0, 0]} />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="avgMoodScore"
                      name="Mood Score (1-10)"
                      stroke="#10b981"
                      strokeWidth={3}
                      dot={{ r: 5, fill: '#10b981' }}
                    />
                  </ComposedChart>
                )}
              </ResponsiveContainer>
            </div>

            {/* Bottom Insight Summary Pills */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-3 border-t border-slate-100 text-xs">
              <div 
                onClick={() => setShowCorrelationDetails(!showCorrelationDetails)}
                className="p-3 rounded-2xl bg-emerald-50/80 border border-emerald-200 cursor-pointer hover:bg-emerald-100/70 transition-colors"
                title="Click to view detailed correlation analysis"
              >
                <span className="text-[10px] text-emerald-800 font-bold uppercase block mb-0.5 flex items-center justify-between">
                  <span>Pearson Correlation (r)</span>
                  <Percent className="w-3 h-3 text-emerald-600" />
                </span>
                <span className="font-mono font-black text-slate-900 text-sm">r = {correlationAnalysis.rFormatted}</span>
                <span className="text-[10px] text-emerald-700 block font-semibold">{correlationAnalysis.strengthLabel}</span>
              </div>

              <div className="p-3 rounded-2xl bg-indigo-50/80 border border-indigo-200">
                <span className="text-[10px] text-indigo-800 font-bold uppercase block mb-0.5">Variance Explained (r²)</span>
                <span className="font-mono font-black text-slate-900 text-sm">{correlationAnalysis.rSquaredFormatted}</span>
                <span className="text-[10px] text-indigo-700 block font-medium">aligned with events</span>
              </div>

              <div className="p-3 rounded-2xl bg-rose-50/80 border border-rose-200">
                <span className="text-[10px] text-rose-800 font-bold uppercase block mb-0.5">Event Mood Uplift</span>
                <span className="font-mono font-black text-slate-900 text-sm">+{correlationAnalysis.moodDelta}★ pts</span>
                <span className="text-[10px] text-rose-700 block font-semibold">+{correlationAnalysis.upliftPercentage}% surge on event days</span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-500 font-bold uppercase block mb-0.5">Milestone Baseline</span>
                <span className="font-mono font-black text-slate-900 text-sm">{correlationAnalysis.eventDaysAvg}★ vs {correlationAnalysis.nonEventDaysAvg}★</span>
                <span className="text-[10px] text-slate-500 block font-medium">{correlationAnalysis.eventDaysCount} event days tracked</span>
              </div>
            </div>

            {/* EVENT & MOOD SPIKE CORRELATION BREAKDOWN SECTION */}
            <div className="mt-6 pt-5 border-t border-slate-200/90 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 font-display flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-600" />
                    <span>Calendar Events & Mood Spikes Correlation Analysis</span>
                  </h4>
                  <p className="text-xs text-slate-500">
                    Calculated Pearson correlation coefficient (r = {correlationAnalysis.rFormatted}) measuring wellness surges against calendar events.
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[11px] font-mono text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-xl font-bold">
                    Correlation: {correlationAnalysis.rFormatted} ({correlationAnalysis.strengthLabel})
                  </span>
                  <span className="text-[11px] font-mono text-slate-700 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-xl font-medium">
                    Event Avg: {correlationAnalysis.eventDaysAvg}★ vs Quiet: {correlationAnalysis.nonEventDaysAvg}★
                  </span>
                </div>
              </div>

              {/* Event Correlation Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {annotatedEvents.map((evt) => {
                  const emoji = getEventEmoji(evt.type);
                  const isSpike = evt.isSpike;
                  const dayCheckIns = evt.dayTrend?.notes || [];

                  return (
                    <div
                      key={evt.id}
                      className={`p-4 rounded-2xl border transition-all flex flex-col justify-between space-y-3 ${
                        isSpike
                          ? 'bg-gradient-to-b from-white to-rose-50/30 border-rose-200 shadow-2xs hover:shadow-xs hover:border-rose-300'
                          : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
                      }`}
                    >
                      <div className="space-y-2">
                        {/* Event Header with Badge & Spike Pill */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xl p-1.5 rounded-xl bg-slate-100/80 shrink-0">
                              {emoji}
                            </span>
                            <div>
                              <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${getEventBadgeStyle(evt.type)}`}>
                                {evt.type}
                              </span>
                              <h5 className="text-xs font-bold text-slate-900 mt-1 line-clamp-1">
                                {evt.title}
                              </h5>
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            {isSpike ? (
                              <span className="inline-flex items-center gap-0.5 text-[10px] font-black text-rose-700 bg-rose-100/90 px-2 py-0.5 rounded-lg border border-rose-200">
                                <Zap className="w-2.5 h-2.5 text-rose-600 fill-rose-600" />
                                <span>+{evt.moodDelta} Spike</span>
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-lg">
                                Steady
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Event Meta Details */}
                        <div className="flex items-center gap-3 text-[11px] text-slate-500 font-mono">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-400" />
                            <span>{new Date(evt.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} • {evt.time}</span>
                          </span>
                          {evt.location && (
                            <span className="flex items-center gap-1 truncate max-w-[130px]">
                              <MapPin className="w-3 h-3 text-slate-400" />
                              <span className="truncate">{evt.location}</span>
                            </span>
                          )}
                        </div>

                        {/* Correlated Mood Metric Card */}
                        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-150 space-y-1 text-[11px]">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-slate-700">Measured Mood Score:</span>
                            <span className="font-black text-emerald-700 font-mono text-xs">
                              {evt.dayScore} / 10
                            </span>
                          </div>
                          <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                evt.dayScore >= 9.5 ? 'bg-gradient-to-r from-rose-500 to-emerald-500' : 'bg-emerald-500'
                              }`}
                              style={{ width: `${(evt.dayScore / 10) * 100}%` }}
                            />
                          </div>
                        </div>

                        {/* Real DailyCheckIn member quotes on this day */}
                        {dayCheckIns.length > 0 && (
                          <div className="space-y-1 pt-1">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                              Family Check-in Feedback:
                            </span>
                            <div className="space-y-1">
                              {dayCheckIns.slice(0, 2).map((item, idx) => (
                                <p key={idx} className="text-[11px] text-slate-700 italic bg-white/80 p-1.5 rounded-lg border border-slate-100 flex items-start gap-1">
                                  <span>{item.emoji}</span>
                                  <span className="line-clamp-2">
                                    <strong className="text-slate-900 not-italic font-semibold">{item.name}:</strong> "{item.note}"
                                  </span>
                                </p>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Card Action Buttons */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                        <span className="text-[10px] text-emerald-800 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Correlated with positive spike</span>
                        </span>

                        {onNavigateToCalendar && (
                          <button
                            onClick={onNavigateToCalendar}
                            className="text-[11px] font-bold text-sky-700 hover:text-sky-800 hover:underline flex items-center gap-0.5"
                          >
                            <span>Details</span>
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {annotatedEvents.length === 0 && (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300 space-y-2">
                  <CalendarDays className="w-8 h-8 text-slate-400 mx-auto" />
                  <p className="text-xs font-bold text-slate-700">No Calendar Events Found in this 7-Day Window</p>
                  <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                    Add family birthdays, trips, or dinners in the Calendar tab to automatically highlight them as annotations on the Mood Trends chart!
                  </p>
                  {onNavigateToCalendar && (
                    <button
                      onClick={onNavigateToCalendar}
                      className="mt-2 px-3 py-1.5 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition-colors inline-flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Event to Calendar</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* SECTION 2: CHECK-IN FREQUENCY & ACTIVE MEMBERS (WEEKLY DATA) */}
        {(activeSection === 'all' || activeSection === 'weekly') && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            
            {/* Chart: Weekly Check-in Frequency */}
            <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                    <span>Check-in Frequency by Week</span>
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Total morning and evening check-ins completed per week
                  </p>
                </div>
                <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-1 rounded-xl">
                  49 Logs This Week
                </span>
              </div>

              <div className="w-full h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={WEEKLY_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="freqGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis
                      dataKey="weekShort"
                      tickLine={false}
                      axisLine={{ stroke: '#e2e8f0' }}
                      tick={{ fill: '#64748b', fontSize: 11 }}
                    />
                    <YAxis tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderRadius: '12px',
                        color: '#fff',
                        fontSize: '11px',
                        border: '1px solid #334155',
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                    <Area
                      type="monotone"
                      dataKey="checkIns"
                      name="Total Check-ins"
                      stroke="#6366f1"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#freqGradient)"
                    />
                    <Area
                      type="monotone"
                      dataKey="morningCheckIns"
                      name="Morning Check-ins"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      strokeDasharray="3 3"
                      fill="transparent"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                <span>Peak window: <strong>7:30 AM – 9:00 AM</strong></span>
                <span className="text-indigo-700 font-semibold font-mono">Average 7 logs / day</span>
              </div>
            </div>

            {/* Chart: Active Members Participation by Week */}
            <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    <span>Active Members by Week</span>
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Members actively checking in or chatting weekly
                  </p>
                </div>
                <span className="text-xs font-mono font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-xl">
                  {members.length} of {members.length} Active
                </span>
              </div>

              <div className="w-full h-64">
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
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderRadius: '12px',
                        color: '#fff',
                        fontSize: '11px',
                        border: '1px solid #334155',
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                    <Bar dataKey="activeMembers" name="Active Members" fill="#f59e0b" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="totalMembers" name="Total Members in Circle" fill="#e2e8f0" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>100% participation rate</span>
                </span>
                <span className="text-amber-700 font-semibold font-mono">0 inactive members</span>
              </div>
            </div>

          </div>
        )}

        {/* SECTION 3: MOOD DISTRIBUTION PIE + RECENT LOGS FEED */}
        {(activeSection === 'all' || activeSection === 'members') && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            
            {/* Pie Chart: Mood Distribution */}
            <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-2xs space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Smile className="w-4 h-4 text-emerald-500" />
                    <span>Mood Distribution</span>
                  </h4>
                  <span className="text-[10px] text-slate-400 font-mono">Saved Logs</span>
                </div>
                <p className="text-xs text-slate-500">
                  Feelings breakdown recorded across all check-ins
                </p>
              </div>

              <div className="h-44 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={moodDistributionData}
                      cx="50%"
                      cy="50%"
                      innerRadius={36}
                      outerRadius={66}
                      paddingAngle={4}
                      dataKey="count"
                    >
                      {moodDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val: any) => [`${val} check-ins`, 'Count']}
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

              <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs">
                {moodDistributionData.map((m) => (
                  <div key={m.name} className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-slate-600 text-[11px]">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: m.color }} />
                      <span>{m.emoji} {m.name}</span>
                    </span>
                    <span className="font-bold font-mono text-slate-800 text-[11px]">
                      {m.count} ({m.pct}%)
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Check-ins History Feed */}
            <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 p-5 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-emerald-600" />
                    <span>Recent Daily Check-in Activity</span>
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Latest statuses, mood logs, and personal notes saved in the system
                  </p>
                </div>

                <button
                  onClick={onOpenDailyCheckIn}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors"
                >
                  <Plus className="w-3 h-3" />
                  <span>Check In Now</span>
                </button>
              </div>

              <div className="space-y-2 pt-1">
                {recentCheckIns.map((rec) => (
                  <div
                    key={rec.id}
                    className="p-3 rounded-2xl bg-slate-50/80 border border-slate-150 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 ${rec.avatarColor}`}>
                        {rec.memberName.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 truncate">{rec.memberName}</span>
                          <span className="text-base">{rec.moodEmoji}</span>
                          <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.2 rounded-md">
                            {rec.shortStatus}
                          </span>
                        </div>
                        {rec.note && (
                          <p className="text-[11px] text-slate-600 italic truncate mt-0.5">
                            "{rec.note}"
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[10px] font-mono font-bold text-slate-500 block">
                        {rec.formattedDate || rec.dateStr}
                      </span>
                      <span className="text-[9px] font-bold text-emerald-600 bg-emerald-100/60 px-1.5 py-0.2 rounded">
                        Score {rec.moodScore}/10
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
