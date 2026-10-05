export interface FamilyMember {
  id: string;
  name: string;
  role: string;
  avatarColor: string;
  avatarImage?: string;
  status: string;
  statusEmoji: string;
  batteryLevel?: number;
  location?: string;
  birthday?: string;
  phone?: string;
  isOnline: boolean;
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
  type: 'image' | 'audio' | 'location' | 'recipe';
  url?: string;
  caption?: string;
  duration?: number; // seconds for audio
  audioBlobUrl?: string;
  recipeTitle?: string;
  recipeIngredients?: string[];
  locationName?: string;
  eta?: string;
}

export interface Message {
  id: string;
  channelId: string;
  senderId: string;
  content: string;
  timestamp: string;
  reactions: Record<string, string[]>; // emoji -> array of memberIds
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
  category: 'produce' | 'dairy' | 'pantry' | 'bakery' | 'household' | 'other';
  completed: boolean;
  addedBy: string;
  assignedTo?: string;
  addedAt: string;
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
