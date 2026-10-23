export interface FamilyUnit {
  id: string;
  name: string; // e.g. "Central Household", "North Branch Unit"
  description?: string;
  leaderId?: string; // Appointed leader member ID
  leaderName?: string;
  leaderEmail?: string;
  appointedAt?: string;
  appointedBy?: string; // Admin member ID
  color?: string; // e.g. 'bg-emerald-500'
  createdAt: string;
}

export interface SecurityAuditLog {
  id: string;
  timestamp: string;
  action:
    | 'APPOINT_LEADER'
    | 'REVOKE_LEADER'
    | 'CREATE_UNIT'
    | 'ADD_MEMBER'
    | 'REMOVE_MEMBER'
    | 'GRANT_CHAT_ACCESS'
    | 'REVOKE_CHAT_ACCESS'
    | 'RESET_PASSWORD'
    | 'SYSTEM_RESET';
  performedById: string;
  performedByName: string;
  targetId?: string;
  targetName?: string;
  details: string;
}

export interface FamilyMember {
  id: string;
  name: string;
  role: string;
  avatarColor: string;
  avatarImage?: string;
  status: string;
  statusEmoji: string;
  moodEmoji?: string; // Mood emoji selected in Daily Check-in (e.g. 😊, ☕, 😴, 🥳)
  shortStatus?: string; // Short status selected in Daily Check-in (e.g. 'At Home', 'Commuting', 'Busy')
  lastCheckInTime?: string; // Timestamp of latest Daily Check-in
  lastActiveTime?: string; // e.g. 'Active now', '10m ago', 'Yesterday'
  checkInNote?: string; // Optional note accompanying daily check-in
  familyRole?: string; // e.g. "Aunt", "Uncle", "Grandmother", "Grandfather", "Mom", "Dad", "Cousin"
  relationship?: string; // Family connection to help reconnect (e.g. "Eldest Daughter", "Mother", "Cousin")
  hometown?: string; // Current city or roots
  batteryLevel?: number;
  location?: string;
  birthday?: string;
  phone?: string;
  email?: string;
  isOnline: boolean; // Active vs Inactive indicator
  isAdmin?: boolean; // Grand Admin role
  isLeader?: boolean; // Appointed Unit Leader role
  familyUnitId?: string; // ID of the Family Unit they belong to
  familyUnitName?: string; // Name of the Family Unit
  addedByLeaderId?: string; // Leader who added this member
  addedByLeaderName?: string;
  hasChatAccess: boolean; // Main member or Unit Leader must grant this to allow chat participation
  accessGrantedAt?: string;
  accessGrantedBy?: string;
  password?: string; // Login password/passcode needed for chat access
  inviteSentAt?: string; // Timestamp when credential email was dispatched
  inviteEmailSentTo?: string; // Target email address
}

export interface FamilyMilestoneBadge {
  id: string;
  title: string;
  icon: string;
  description: string;
  criteria: string;
  category: 'streak' | 'mindfulness' | 'joy' | 'consistency' | 'early_bird';
  color: string;
  earnedByMemberIds: string[];
}

export interface SentInviteEmail {
  id: string;
  memberId: string;
  memberName: string;
  recipientEmail: string;
  subject: string;
  loginPassword: string;
  sentAt: string;
  sentByAdminName: string;
  familyUnitName?: string;
  hasChatAccess: boolean;
  status: 'delivered' | 'opened';
}

export interface AdminCredentials {
  email: string;
  password: string;
  mainMemberId: string;
}

export interface PollOption {
  id: string;
  text: string;
  votes: string[]; // member IDs who voted
}

export interface PollData {
  question: string;
  options: PollOption[];
  closed?: boolean;
  createdBy: string;
}

export interface Attachment {
  type: 'image' | 'audio' | 'location' | 'recipe' | 'music' | 'entertainment';
  url?: string;
  caption?: string;
  duration?: number; // seconds for audio
  audioBlobUrl?: string;
  recipeTitle?: string;
  recipeIngredients?: string[];
  locationName?: string;
  eta?: string;
  musicTrack?: {
    title: string;
    artist: string;
    albumArt?: string;
    duration?: string;
    previewUrl?: string;
    genre?: string;
    sharedNote?: string;
  };
  entertainmentItem?: {
    title: string;
    type: 'movie' | 'tv' | 'game' | 'trivia';
    platform?: string; // e.g. 'Netflix', 'Disney+', 'Family Board Game'
    rating?: string;
    posterUrl?: string;
    summary?: string;
    suggestedBy?: string;
  };
}

export interface FamilyStatusUpdate {
  id: string;
  memberId: string;
  memberName: string;
  avatarColor: string;
  avatarImage?: string;
  text: string;
  moodEmoji: string;
  location?: string;
  mediaUrl?: string;
  postedAt: string;
  formattedTime: string;
  likes?: string[];
}

export interface FamilyPhotoConfig {
  url: string;
  updatedAt: string;
  updatedBy: string;
  caption?: string;
}

export interface Message {
  id: string;
  channelId: string;
  senderId: string;
  content: string;
  timestamp: string;
  reactions: Record<string, string[]>; // emoji -> array of memberIds
  readBy?: string[]; // member IDs who have read this message
  isPinned?: boolean;
  attachments?: Attachment[];
  poll?: PollData;
  replyTo?: {
    id: string;
    senderName: string;
    text: string;
  };
}

export interface Channel {
  id: string;
  name: string;
  iconName: string;
  description: string;
  category: 'channel' | 'direct';
  memberIds?: string[];
  pinnedNotice?: string;
}

export interface GroceryItem {
  id: string;
  text: string;
  category: 'produce' | 'dairy' | 'pantry' | 'bakery' | 'household' | 'pharmacy' | 'treats' | 'other';
  completed: boolean;
  addedBy: string;
  assignedTo?: string;
  addedAt: string;
  store?: string; // e.g. "Trader Joe's", "Costco", "Local Market", "Pharmacy"
  estimatedPrice?: number; // e.g. 4.99
  claimedBy?: string; // Member who said "I'll pick this up!"
  claimedByName?: string;
  purchasedBy?: string;
  purchasedByName?: string;
  purchasedAt?: string;
  urgency?: 'urgent' | 'needed' | 'treat';
}

export interface ChoreItem {
  id: string;
  title: string;
  assignedTo: string;
  completed: boolean;
  dueDate: string;
  points: number;
}

export interface FamilyEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  attendees: string[];
  type: 'birthday' | 'dinner' | 'appointment' | 'school' | 'vacation';
}

export interface QuickNotice {
  id: string;
  title: string;
  value: string;
  iconName: string;
  category: string;
}

export interface DailyCheckInRecord {
  id: string;
  memberId: string;
  memberName: string;
  avatarColor: string;
  moodEmoji: string;
  moodLabel: string;
  moodScore: number; // Scale 1 to 10
  shortStatus: string;
  note?: string;
  dateStr: string; // YYYY-MM-DD
  dayLabel: string; // "Mon", "Tue", etc.
  formattedDate: string; // e.g. "Oct 13"
  timestamp: string;
}

