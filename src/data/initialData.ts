import {
  AdminCredentials,
  Channel,
  ChoreItem,
  FamilyEvent,
  FamilyMember,
  FamilyUnit,
  GroceryItem,
  Message,
  QuickNotice,
  SentInviteEmail,
  DailyCheckInRecord,
  SecurityAuditLog,
  MilestoneCelebration
} from '../types/family';

export const DEFAULT_ADMIN_CREDENTIALS: AdminCredentials = {
  email: 'kibondoqueenmary2022@gmail.com',
  password: 'admin',
  mainMemberId: 'admin-mary',
};

export const INITIAL_FAMILY_UNITS: FamilyUnit[] = [
  {
    id: 'unit-central',
    name: 'Central Lineage Branch',
    description: 'Founding family lineage branch managed by Mary',
    leaderId: 'admin-mary',
    leaderName: 'Mary',
    leaderEmail: 'kibondoqueenmary2022@gmail.com',
    appointedAt: '2026-10-20T10:00:00Z',
    appointedBy: 'Super Admin System',
    color: 'bg-emerald-500',
    createdAt: '2026-10-20T10:00:00Z',
  },
];

// Pristine clean members list containing ONLY Mary (the Family Head Admin)
export const INITIAL_MEMBERS: FamilyMember[] = [
  {
    id: 'admin-mary',
    name: 'Mary',
    role: 'Family Head & Admin',
    familyRole: 'Family Elder / Head',
    avatarColor: 'bg-emerald-600',
    status: 'Managing family lineage & gatherings',
    statusEmoji: '👑',
    moodEmoji: '✨',
    shortStatus: 'Online',
    lastCheckInTime: 'Today',
    lastActiveTime: 'Active now',
    checkInNote: 'Welcome to our private family lineage portal',
    relationship: 'Family Matriarch & Admin',
    hometown: 'Central Household',
    batteryLevel: 98,
    location: 'Central Household',
    birthday: 'Nov 12',
    phone: '+1 (555) 019-2831',
    email: 'kibondoqueenmary2022@gmail.com',
    password: 'admin',
    isOnline: true,
    isAdmin: true,
    isSuperAdmin: true,
    adminVerified: true,
    nationalIdNumber: 'NAT-ID-882194-HQ',
    age: 48,
    hasChildren: true,
    childrenCount: 3,
    generation: 'Generation I (Family Elders)',
    familyUnitId: 'unit-central',
    familyUnitName: 'Central Lineage Branch',
    hasChatAccess: true,
    accessGrantedAt: '2026-10-20T10:00:00Z',
    accessGrantedBy: 'Super Admin System',
    joinedAt: '2026-10-20T10:00:00Z',
  },
];

// Clean empty chat messages - ready for user testing
export const INITIAL_MESSAGES: Message[] = [];

export const INITIAL_CHANNELS: Channel[] = [
  {
    id: 'general',
    name: 'general',
    iconName: 'Home',
    description: 'Family Living Room — Hearth for deep conversations and daily life updates',
    category: 'channel',
  },
  {
    id: 'celebrations',
    name: 'celebrations',
    iconName: 'Sparkles',
    description: 'Weddings, Birthdays & Milestones — Organizing grand family moments together',
    category: 'channel',
  },
  {
    id: 'lineage',
    name: 'lineage',
    iconName: 'Heart',
    description: 'Generational Lineage & Heritage — Family wisdom, memories & roots',
    category: 'channel',
  },
];

// Empty shopping and chores arrays to remove clutter
export const INITIAL_GROCERIES: GroceryItem[] = [];
export const INITIAL_CHORES: ChoreItem[] = [];

// Family Life Milestones & Celebrations (Weddings, Birthdays, Anniversaries, Graduations)
export const INITIAL_MILESTONES: MilestoneCelebration[] = [
  {
    id: 'milestone-wedding-1',
    title: "Sophia & Daniel's Wedding Celebration",
    category: 'wedding',
    honoreeName: 'Sophia & Daniel',
    honoreeRole: 'Daughter & Future Son-in-Law',
    date: '2026-12-18',
    time: '4:00 PM',
    location: 'Grand Botanical Conservatory & Gardens',
    description: 'Our dear Sophia is getting married! The entire lineage is gathering to celebrate love, family heritage, and new beginnings. Everyone is invited to coordinate preparations, blessings, and toasts.',
    coverPhoto: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80',
    organizerId: 'admin-mary',
    organizerName: 'Mary',
    organizingTasks: [
      { id: 'task-1', title: 'Prepare traditional lineage toast & family blessing', assignedToName: 'Mary', completed: true },
      { id: 'task-2', title: 'Curate vintage family wedding photo display', completed: false },
      { id: 'task-3', title: 'Coordinate floral centerpieces & bouquets', completed: false },
      { id: 'task-4', title: 'Organize children and grandchild rehearsal roles', completed: false },
    ],
    rsvps: [
      { memberId: 'admin-mary', memberName: 'Mary', status: 'attending', guestsCount: 2 },
    ],
    blessings: [
      {
        id: 'bless-1',
        memberId: 'admin-mary',
        memberName: 'Mary',
        message: 'May your union be blessed with immense joy, patience, and everlasting love across the generations!',
        timestamp: '2026-10-20T12:00:00Z',
      },
    ],
    createdAt: '2026-10-20T10:00:00Z',
  },
];

export const INITIAL_EVENTS: FamilyEvent[] = [
  {
    id: 'event-1',
    title: "Sophia & Daniel's Wedding",
    date: '2026-12-18',
    time: '4:00 PM',
    location: 'Grand Botanical Conservatory',
    attendees: ['admin-mary'],
    type: 'birthday',
  },
];

export const INITIAL_NOTICES: QuickNotice[] = [
  {
    id: 'n-1',
    title: 'Family Lineage Hub',
    value: 'Private Generational Network',
    iconName: 'Shield',
    category: 'info',
  },
  {
    id: 'n-2',
    title: 'Upcoming Celebration',
    value: "Sophia's Wedding in Dec",
    iconName: 'Sparkles',
    category: 'milestone',
  },
];

export const INITIAL_SENT_EMAILS: SentInviteEmail[] = [];

export const INITIAL_CHECKIN_RECORDS: DailyCheckInRecord[] = [
  {
    id: 'ck-init-1',
    memberId: 'admin-mary',
    memberName: 'Mary',
    avatarColor: 'bg-emerald-600',
    moodEmoji: '✨',
    moodLabel: 'Inspired',
    moodScore: 10,
    shortStatus: 'Online',
    note: 'Welcome to our private family lineage portal.',
    dateStr: '2026-10-20',
    dayLabel: 'Mon',
    formattedDate: 'Oct 20',
    timestamp: '2026-10-20T09:00:00Z',
  },
];

export const INITIAL_SECURITY_LOGS: SecurityAuditLog[] = [
  {
    id: 'log-init-1',
    timestamp: '2026-10-20T08:00:00Z',
    action: 'REGISTER_FAMILY_HEAD',
    performedById: 'admin-mary',
    performedByName: 'Mary (Family Head)',
    details: 'Verified Family Head Mary registered with National ID & children lineage declaration (Age 48).',
  },
];
