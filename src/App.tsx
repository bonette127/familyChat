/**
 * Kinfolk - Family Chat & Hub
 * A warm, private space for family messaging, photo sharing, dinner polls,
 * voice notes, shared lists, and family events.
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageCircle, 
  Camera, 
  ShoppingCart, 
  Calendar, 
  Users, 
  X,
  Volume2,
  Sparkles,
  FolderHeart
} from 'lucide-react';

import { 
  Attachment, 
  Channel, 
  ChoreItem, 
  FamilyEvent, 
  FamilyMember, 
  FamilyUnit,
  GroceryItem, 
  Message, 
  QuickNotice,
  AdminCredentials,
  SentInviteEmail,
  DailyCheckInRecord,
  SecurityAuditLog,
  MilestoneCelebration
} from './types/family';

import { 
  INITIAL_CHANNELS, 
  INITIAL_CHORES, 
  INITIAL_EVENTS, 
  INITIAL_GROCERIES, 
  INITIAL_MEMBERS, 
  INITIAL_MESSAGES, 
  INITIAL_NOTICES,
  DEFAULT_ADMIN_CREDENTIALS,
  INITIAL_SENT_EMAILS,
  INITIAL_CHECKIN_RECORDS,
  INITIAL_FAMILY_UNITS,
  INITIAL_SECURITY_LOGS,
  INITIAL_MILESTONES
} from './data/initialData';

import { Sidebar } from './components/Sidebar';
import { ChatHeader } from './components/ChatHeader';
import { MessageList } from './components/MessageList';
import { ChatInput } from './components/ChatInput';
import { FamilyAlbumTab, PhotoMemory } from './components/FamilyAlbumTab';
import { SharedMediaTab } from './components/SharedMediaTab';
import { MilestonesCelebrationsTab } from './components/MilestonesCelebrationsTab';
import { CalendarTab } from './components/CalendarTab';
import { CallModal } from './components/CallModal';
import { NoticeBoardModal } from './components/NoticeBoardModal';
import { FamilyMembersModal } from './components/FamilyMembersModal';
import { CreatePollModal } from './components/CreatePollModal';
import { VoiceNoteRecorder } from './components/VoiceNoteRecorder';
import { AdminLoginModal } from './components/AdminLoginModal';
import { DailyCheckInModal } from './components/DailyCheckInModal';
import { EmailDeliveryModal } from './components/EmailDeliveryModal';
import { MemberLoginModal } from './components/MemberLoginModal';
import { CongratulatoryToast, CongratulatoryNoticeData } from './components/CongratulatoryToast';
import { FamilyEngagementAnalytics } from './components/FamilyEngagementAnalytics';
import { FamilySettingsModal } from './components/FamilySettingsModal';
import { FamilyTab } from './components/FamilyTab';
import { FamilyPresencePanel } from './components/FamilyPresencePanel';
import { FamilyUnitsModal } from './components/FamilyUnitsModal';
import { FamilyAuthLanding } from './components/FamilyAuthLanding';
import { SuperAdminModal } from './components/SuperAdminModal';

import { playSendChime, playReceiveChime, playReactionPop, playSuccessCelebration } from './utils/audio';

const STORAGE_KEY = 'kinfolk_family_lineage_v4_pristine';

// Automated purge of legacy chaotic data keys to ensure a fresh, pristine system
try {
  const legacyStorageKeys = [
    'kinfolk_family_hub_data_v1',
    'kinfolk_family_hub_data_v1_members',
    'kinfolk_family_hub_data_v1_messages',
    'kinfolk_family_hub_data_v1_events',
    'kinfolk_family_hub_data_v1_groceries',
    'kinfolk_family_hub_data_v1_chores',
    'kinfolk_family_hub_data_v1_notices',
    'kinfolk_family_hub_data_v1_admin_creds',
    'kinfolk_family_hub_data_v1_sent_emails',
    'kinfolk_family_hub_data_v1_checkin_history',
    'kinfolk_family_hub_data_v2',
    'kinfolk_family_hub_v3_structured'
  ];
  legacyStorageKeys.forEach((key) => localStorage.removeItem(key));
} catch {
  // Ignore storage isolation errors
}

export default function App() {
  // --- Persistent State Initialization ---
  const [familyName, setFamilyName] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY + '_name');
      return saved ? JSON.parse(saved) : 'The Kinfolk Family';
    } catch {
      return 'The Kinfolk Family';
    }
  });

  const [members, setMembers] = useState<FamilyMember[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY + '_members');
      return saved ? JSON.parse(saved) : INITIAL_MEMBERS;
    } catch {
      return INITIAL_MEMBERS;
    }
  });

  const [activeMemberId, setActiveMemberId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY + '_active_member');
      return saved ? JSON.parse(saved) : DEFAULT_ADMIN_CREDENTIALS.mainMemberId;
    } catch {
      return DEFAULT_ADMIN_CREDENTIALS.mainMemberId;
    }
  });

  const [familyUnits, setFamilyUnits] = useState<FamilyUnit[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY + '_family_units');
      return saved ? JSON.parse(saved) : INITIAL_FAMILY_UNITS;
    } catch {
      return INITIAL_FAMILY_UNITS;
    }
  });

  const [securityLogs, setSecurityLogs] = useState<SecurityAuditLog[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY + '_security_logs');
      return saved ? JSON.parse(saved) : INITIAL_SECURITY_LOGS;
    } catch {
      return INITIAL_SECURITY_LOGS;
    }
  });

  const [isPresencePanelOpen, setIsPresencePanelOpen] = useState(true);
  const [isFamilyUnitsModalOpen, setIsFamilyUnitsModalOpen] = useState(false);

  const [channels, setChannels] = useState<Channel[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY + '_channels');
      return saved ? JSON.parse(saved) : INITIAL_CHANNELS;
    } catch {
      return INITIAL_CHANNELS;
    }
  });

  const [activeChannelId, setActiveChannelId] = useState<string>('general');
  const [activeTab, setActiveTab] = useState<'chat' | 'album' | 'media' | 'celebrations' | 'calendar' | 'family'>('chat');

  const [milestones, setMilestones] = useState<MilestoneCelebration[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY + '_milestones');
      return saved ? JSON.parse(saved) : INITIAL_MILESTONES;
    } catch {
      return INITIAL_MILESTONES;
    }
  });

  const [isSuperAdminModalOpen, setIsSuperAdminModalOpen] = useState(false);

  const [messages, setMessages] = useState<Message[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY + '_messages');
      return saved ? JSON.parse(saved) : INITIAL_MESSAGES;
    } catch {
      return INITIAL_MESSAGES;
    }
  });

  const [groceries, setGroceries] = useState<GroceryItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY + '_groceries');
      return saved ? JSON.parse(saved) : INITIAL_GROCERIES;
    } catch {
      return INITIAL_GROCERIES;
    }
  });

  const [chores, setChores] = useState<ChoreItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY + '_chores');
      return saved ? JSON.parse(saved) : INITIAL_CHORES;
    } catch {
      return INITIAL_CHORES;
    }
  });

  const [events, setEvents] = useState<FamilyEvent[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY + '_events');
      return saved ? JSON.parse(saved) : INITIAL_EVENTS;
    } catch {
      return INITIAL_EVENTS;
    }
  });

  const [notices, setNotices] = useState<QuickNotice[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY + '_notices');
      return saved ? JSON.parse(saved) : INITIAL_NOTICES;
    } catch {
      return INITIAL_NOTICES;
    }
  });

  const [memories, setMemories] = useState<PhotoMemory[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY + '_memories');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return [
      {
        id: 'mem-1',
        url: '/src/assets/images/family_summer_picnic_1791015908360.jpg',
        caption: 'Annual Summer Picnic in Mill Creek Park with fresh lemonade and watermelon!',
        date: 'Sep 28, 2026',
        authorId: 'mary',
        category: 'trips',
        likes: ['mom', 'dad', 'grandma', 'liam'],
      },
      {
        id: 'mem-2',
        url: '/src/assets/images/family_dinner_lasagna_1791015919234.jpg',
        caption: 'Homemade bubbling lasagna fresh from the oven. Sarah\'s secret recipe!',
        date: 'Oct 02, 2026',
        authorId: 'mom',
        category: 'food',
        likes: ['mary', 'dad', 'liam'],
      },
      {
        id: 'mem-3',
        url: '/src/assets/images/family_puppy_park_1791015930194.jpg',
        caption: 'Buster fetching tennis balls until he couldn\'t keep his eyes open.',
        date: 'Oct 01, 2026',
        authorId: 'liam',
        category: 'pets',
        likes: ['mary', 'mom', 'grandma'],
      },
      {
        id: 'mem-4',
        url: '/src/assets/images/family_hiking_view_1791015940356.jpg',
        caption: 'Pine Ridge trail overlook at golden hour. Breath-taking autumn leaves.',
        date: 'Sep 29, 2026',
        authorId: 'dad',
        category: 'trips',
        likes: ['mary', 'mom'],
      },
    ];
  });

  // Admin Credentials & Authentication State
  const [adminCredentials, setAdminCredentials] = useState<AdminCredentials>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY + '_admin_creds');
      return saved ? JSON.parse(saved) : DEFAULT_ADMIN_CREDENTIALS;
    } catch {
      return DEFAULT_ADMIN_CREDENTIALS;
    }
  });

  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY + '_admin_session');
      return saved !== null ? JSON.parse(saved) : true; // Default admin logged in on first launch
    } catch {
      return true;
    }
  });

  // App settings & simulation
  const [isLivelyMode, setIsLivelyMode] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [typingMemberName, setTypingMemberName] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [selectedMessageForReaction, setSelectedMessageForReaction] = useState<Message | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Modals
  const [isDailyCheckInOpen, setIsDailyCheckInOpen] = useState(false);
  const [isCallModalOpen, setIsCallModalOpen] = useState(false);
  const [isNoticeBoardOpen, setIsNoticeBoardOpen] = useState(false);
  const [isMembersModalOpen, setIsMembersModalOpen] = useState(false);
  const [isAdminLoginModalOpen, setIsAdminLoginModalOpen] = useState(false);
  const [isCreatePollOpen, setIsCreatePollOpen] = useState(false);
  const [isVoiceRecorderOpen, setIsVoiceRecorderOpen] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<{ url: string; caption?: string } | null>(null);

  // Member Registration & Credentials Email States
  const [sentInviteEmails, setSentInviteEmails] = useState<SentInviteEmail[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY + '_sent_emails');
      return saved ? JSON.parse(saved) : INITIAL_SENT_EMAILS;
    } catch {
      return INITIAL_SENT_EMAILS;
    }
  });
  const [selectedEmailForPreview, setSelectedEmailForPreview] = useState<SentInviteEmail | null>(null);
  const [isEmailDeliveryModalOpen, setIsEmailDeliveryModalOpen] = useState(false);
  const [isMemberLoginModalOpen, setIsMemberLoginModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [prefilledLoginEmail, setPrefilledLoginEmail] = useState('');
  const [membersModalTab, setMembersModalTab] = useState<'members' | 'register' | 'units' | 'invites' | 'analytics'>('members');
  const [loginToastNotice, setLoginToastNotice] = useState<string | null>(null);
  const [congratulatoryNotice, setCongratulatoryNotice] = useState<CongratulatoryNoticeData | null>(null);

  // Daily Check-In History state for Mood Trends & Engagement Analytics
  const [checkInHistory, setCheckInHistory] = useState<DailyCheckInRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY + '_checkin_history');
      return saved ? JSON.parse(saved) : INITIAL_CHECKIN_RECORDS;
    } catch {
      return INITIAL_CHECKIN_RECORDS;
    }
  });

  // --- Persistence Side Effects ---
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY + '_checkin_history', JSON.stringify(checkInHistory));
  }, [checkInHistory]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY + '_sent_emails', JSON.stringify(sentInviteEmails));
  }, [sentInviteEmails]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY + '_admin_creds', JSON.stringify(adminCredentials));
  }, [adminCredentials]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY + '_admin_session', JSON.stringify(isAdminLoggedIn));
  }, [isAdminLoggedIn]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY + '_name', JSON.stringify(familyName));
  }, [familyName]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY + '_members', JSON.stringify(members));
  }, [members]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY + '_active_member', JSON.stringify(activeMemberId));
  }, [activeMemberId]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY + '_channels', JSON.stringify(channels));
  }, [channels]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY + '_messages', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY + '_groceries', JSON.stringify(groceries));
  }, [groceries]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY + '_chores', JSON.stringify(chores));
  }, [chores]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY + '_milestones', JSON.stringify(milestones));
  }, [milestones]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY + '_events', JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY + '_notices', JSON.stringify(notices));
  }, [notices]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY + '_memories', JSON.stringify(memories));
  }, [memories]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY + '_family_units', JSON.stringify(familyUnits));
  }, [familyUnits]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY + '_security_logs', JSON.stringify(securityLogs));
  }, [securityLogs]);

  const activeMember = members.find((m) => m.id === activeMemberId) || members[0];
  const currentChannel = channels.find((c) => c.id === activeChannelId) || channels[0];

  // Filter messages for current channel and search
  const currentChannelMessages = messages.filter((m) => {
    if (m.channelId !== currentChannel.id) return false;
    if (!searchQuery.trim()) return true;
    return (
      m.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.attachments && m.attachments.some(a => a.caption?.toLowerCase().includes(searchQuery.toLowerCase())))
    );
  });

  // --- Handlers ---
  const handleMarkAsRead = (messageIds: string[]) => {
    setMessages((prev) => {
      let hasChanges = false;
      const next = prev.map((msg) => {
        if (messageIds.includes(msg.id)) {
          const currentRead = msg.readBy || [];
          if (!currentRead.includes(activeMemberId)) {
            hasChanges = true;
            return {
              ...msg,
              readBy: [...currentRead, activeMemberId],
            };
          }
        }
        return msg;
      });
      return hasChanges ? next : prev;
    });
  };

  const handleSendMessage = (
    text: string,
    attachments?: Attachment[],
    replyTo?: { id: string; senderName: string; text: string }
  ) => {
    playSendChime(isMuted);

    const newMsg: Message = {
      id: `msg-${Date.now()}`,
      channelId: currentChannel.id,
      senderId: activeMemberId,
      content: text,
      timestamp: new Date().toISOString(),
      reactions: {},
      readBy: [activeMemberId],
      attachments,
      replyTo,
    };

    setMessages((prev) => [...prev, newMsg]);

    // Simulated Lively Family Banter
    if (isLivelyMode) {
      triggerSimulatedFamilyReaction(newMsg, currentChannel.id, activeMemberId);
    }
  };

  const triggerSimulatedFamilyReaction = (
    userMsg: Message,
    channelId: string,
    senderId: string
  ) => {
    const potentialRepliers = members.filter((m) => m.id !== senderId);
    if (potentialRepliers.length === 0) return;

    const randomReplier = potentialRepliers[Math.floor(Math.random() * potentialRepliers.length)];

    // 1. Add reaction or typing simulation
    const delayMs = 1400 + Math.random() * 1200;

    setTimeout(() => {
      // Show typing indicator
      setTypingMemberName(randomReplier.name);

      setTimeout(() => {
        setTypingMemberName(null);

        // Generate warm authentic response depending on channel & text
        let replyContent = '';
        const lower = userMsg.content.toLowerCase();

        if (lower.includes('dinner') || lower.includes('food') || lower.includes('eat') || channelId === 'dinner') {
          const dinnerReplies = [
            `That sounds wonderful! I'll make sure we have plenty of fresh parmesan and crusty bread. 🥖`,
            `Yum! Count me in! I can help chop herbs and set the dining table. 🥗`,
            `Can we save a warm plate for later? Practice might run 15 minutes over! ⚽`,
            `Delicious idea sweetie! I will put on the Italian music playlist. 🎶`,
          ];
          replyContent = dinnerReplies[Math.floor(Math.random() * dinnerReplies.length)];
        } else if (lower.includes('check-in') || lower.includes('home') || lower.includes('safe') || lower.includes('school')) {
          replyContent = `Glad you arrived safely! Have a wonderful day darling. ❤️`;
        } else if (lower.includes('grocery') || channelId === 'groceries') {
          replyContent = `Got it! Just checked off what I could find at the counter. 🛒`;
        } else {
          const generalReplies = [
            `Love this! Thank you for sharing darling. 🥰`,
            `So proud of you! See you at dinner tonight. ✨`,
            `Sounds like a plan! Let me know if you need anything picked up on my way back. 🚗`,
            `That put the biggest smile on my face! ❤️`,
          ];
          replyContent = generalReplies[Math.floor(Math.random() * generalReplies.length)];
        }

        playReceiveChime(isMuted);

        const replyMsg: Message = {
          id: `msg-${Date.now()}`,
          channelId,
          senderId: randomReplier.id,
          content: replyContent,
          timestamp: new Date().toISOString(),
          reactions: { '❤️': [senderId] },
          readBy: [randomReplier.id],
        };

        setMessages((prev) => [
          ...prev.map((m) => {
            // Replier also read userMsg and recent messages in this channel
            if (m.channelId === channelId) {
              const currentRead = m.readBy || [];
              if (!currentRead.includes(randomReplier.id)) {
                return { ...m, readBy: [...currentRead, randomReplier.id] };
              }
            }
            return m;
          }),
          replyMsg,
        ]);

        // Also add reaction to user's original message
        setMessages((prev) =>
          prev.map((m) => {
            if (m.id === userMsg.id) {
              const currentReactions = { ...m.reactions };
              const heartList = currentReactions['❤️'] || [];
              if (!heartList.includes(randomReplier.id)) {
                currentReactions['❤️'] = [...heartList, randomReplier.id];
              }
              return { ...m, reactions: currentReactions };
            }
            return m;
          })
        );
      }, 1500);
    }, delayMs);
  };

  const handleReact = (messageId: string, emoji: string) => {
    playReactionPop(isMuted);

    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.id !== messageId) return msg;
        const currentReactions = { ...msg.reactions };
        const userList = currentReactions[emoji] || [];

        if (userList.includes(activeMemberId)) {
          // Remove reaction
          currentReactions[emoji] = userList.filter((id) => id !== activeMemberId);
          if (currentReactions[emoji].length === 0) {
            delete currentReactions[emoji];
          }
        } else {
          // Add reaction
          currentReactions[emoji] = [...userList, activeMemberId];
        }

        return { ...msg, reactions: currentReactions };
      })
    );
  };

  const handleVotePoll = (messageId: string, optionId: string) => {
    playReactionPop(isMuted);

    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.id !== messageId || !msg.poll) return msg;

        const updatedOptions = msg.poll.options.map((opt) => {
          const hasVoted = opt.votes.includes(activeMemberId);
          if (opt.id === optionId) {
            return {
              ...opt,
              votes: hasVoted
                ? opt.votes.filter((id) => id !== activeMemberId)
                : [...opt.votes, activeMemberId],
            };
          } else {
            // single choice vote
            return {
              ...opt,
              votes: opt.votes.filter((id) => id !== activeMemberId),
            };
          }
        });

        return {
          ...msg,
          poll: {
            ...msg.poll,
            options: updatedOptions,
          },
        };
      })
    );
  };

  const handleTogglePin = (messageId: string) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId ? { ...msg, isPinned: !msg.isPinned } : msg
      )
    );
  };

  const handleSendVoiceNote = (audioUrl: string, duration: number) => {
    handleSendMessage('🎙️ Voice Note', [
      {
        type: 'audio',
        audioBlobUrl: audioUrl,
        duration,
      },
    ]);
  };

  const handleCreatePoll = (question: string, options: string[]) => {
    playSendChime(isMuted);

    const newPollMessage: Message = {
      id: `msg-${Date.now()}`,
      channelId: currentChannel.id,
      senderId: activeMemberId,
      content: `📊 New Family Vote: ${question}`,
      timestamp: new Date().toISOString(),
      reactions: {},
      readBy: [activeMemberId],
      poll: {
        question,
        createdBy: activeMemberId,
        options: options.map((opt, i) => ({
          id: `opt-${i}`,
          text: opt,
          votes: i === 0 ? [activeMemberId] : [],
        })),
      },
    };

    setMessages((prev) => [...prev, newPollMessage]);

    // If lively mode is active, simulate a family member voting after 2 seconds
    if (isLivelyMode) {
      setTimeout(() => {
        const otherMembers = members.filter((m) => m.id !== activeMemberId);
        if (otherMembers.length > 0) {
          const randomVoter = otherMembers[Math.floor(Math.random() * otherMembers.length)];
          const randomOptIdx = Math.floor(Math.random() * options.length);
          setMessages((prev) =>
            prev.map((m) => {
              if (m.id === newPollMessage.id && m.poll) {
                const updated = m.poll.options.map((opt, idx) => {
                  if (idx === randomOptIdx && !opt.votes.includes(randomVoter.id)) {
                    return { ...opt, votes: [...opt.votes, randomVoter.id] };
                  }
                  return opt;
                });
                return { ...m, poll: { ...m.poll, options: updated } };
              }
              return m;
            })
          );
        }
      }, 2000);
    }
  };

  // --- Milestones & Celebrations Handlers ---
  const handleAddMilestone = (newMilestone: Omit<MilestoneCelebration, 'id' | 'createdAt'>) => {
    const created: MilestoneCelebration = {
      ...newMilestone,
      id: `milestone-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setMilestones((prev) => [created, ...prev]);
    playSuccessCelebration();

    // Auto-post a celebration announcement into the celebrations room
    const announcementMsg: Message = {
      id: `msg-mile-${Date.now()}`,
      channelId: 'celebrations',
      senderId: activeMemberId,
      content: `🎉 **FAMILY CELEBRATION ANNOUNCED** 🎉\n\n**${created.title}** honoring **${created.honoreeName}**!\n📅 Date: ${created.date} ${created.time ? `at ${created.time}` : ''}\n📍 Location: ${created.location}\n\nJoin the Milestones & Celebrations hub to RSVP, choose preparation duties, and share your blessings!`,
      timestamp: 'Just now',
      reactions: { '🎉': [activeMemberId], '❤️': [activeMemberId] },
      readBy: [activeMemberId],
    };
    setMessages((prev) => [...prev, announcementMsg]);
  };

  const handleToggleMilestoneTask = (milestoneId: string, taskId: string) => {
    playReactionPop(isMuted);
    setMilestones((prev) =>
      prev.map((m) => {
        if (m.id !== milestoneId) return m;
        return {
          ...m,
          organizingTasks: m.organizingTasks.map((t) =>
            t.id === taskId ? { ...t, completed: !t.completed } : t
          ),
        };
      })
    );
  };

  const handleAddMilestoneTask = (milestoneId: string, taskTitle: string, assignedToName?: string) => {
    setMilestones((prev) =>
      prev.map((m) => {
        if (m.id !== milestoneId) return m;
        return {
          ...m,
          organizingTasks: [
            ...m.organizingTasks,
            { id: `task-${Date.now()}`, title: taskTitle, assignedToName, completed: false },
          ],
        };
      })
    );
  };

  const handleUpdateMilestoneRsvp = (
    milestoneId: string,
    status: 'attending' | 'maybe' | 'declined',
    guestsCount: number
  ) => {
    setMilestones((prev) =>
      prev.map((m) => {
        if (m.id !== milestoneId) return m;
        const otherRsvps = m.rsvps.filter((r) => r.memberId !== activeMemberId);
        return {
          ...m,
          rsvps: [
            ...otherRsvps,
            { memberId: activeMemberId, memberName: activeMember.name, status, guestsCount },
          ],
        };
      })
    );
  };

  const handleAddMilestoneBlessing = (milestoneId: string, message: string) => {
    const newBlessing = {
      id: `bless-${Date.now()}`,
      memberId: activeMemberId,
      memberName: activeMember.name,
      message,
      timestamp: new Date().toISOString(),
    };
    setMilestones((prev) =>
      prev.map((m) =>
        m.id === milestoneId ? { ...m, blessings: [...m.blessings, newBlessing] } : m
      )
    );
    playSendChime(isMuted);
  };

  const handleAnnounceMilestoneInChat = (text: string, channelId: string = 'celebrations') => {
    const msg: Message = {
      id: `msg-${Date.now()}`,
      channelId,
      senderId: activeMemberId,
      content: text,
      timestamp: 'Just now',
      reactions: { '🎉': [activeMemberId] },
      readBy: [activeMemberId],
    };
    setMessages((prev) => [...prev, msg]);
    playSendChime(isMuted);
  };

  const handleRevokeAdmin = (adminMemberId: string, reason: string) => {
    setMembers((prev) =>
      prev.map((m) =>
        m.id === adminMemberId ? { ...m, isAdmin: false, role: 'Lineage Member' } : m
      )
    );
    const targetMember = members.find((m) => m.id === adminMemberId);
    const auditLog: SecurityAuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      action: 'SUPER_ADMIN_REVOKE_ADMIN',
      performedById: activeMember.id,
      performedByName: `${activeMember.name} (Super Admin)`,
      targetId: adminMemberId,
      targetName: targetMember?.name,
      details: `Super Admin revoked administrator privileges for ${targetMember?.name || adminMemberId}. Reason: ${reason}`,
    };
    setSecurityLogs((prev) => [auditLog, ...prev]);
  };

  const handleToggleOnlinePresence = (memberId: string) => {
    setMembers((prev) =>
      prev.map((m) =>
        m.id === memberId ? { ...m, isOnline: !m.isOnline } : m
      )
    );
  };

  // --- Groceries & Chores Handlers ---
  const handleToggleGrocery = (id: string) => {
    playReactionPop(isMuted);
    setGroceries((prev) =>
      prev.map((g) => (g.id === id ? { ...g, completed: !g.completed } : g))
    );
  };

  const handleAddGrocery = (item: Omit<GroceryItem, 'id' | 'completed' | 'addedAt'>) => {
    const newItem: GroceryItem = {
      ...item,
      id: `g-${Date.now()}`,
      completed: false,
      addedAt: 'Just now',
    };
    setGroceries((prev) => [newItem, ...prev]);
  };

  const handleDeleteGrocery = (id: string) => {
    setGroceries((prev) => prev.filter((g) => g.id !== id));
  };

  const handleToggleChore = (id: string) => {
    playReactionPop(isMuted);
    setChores((prev) =>
      prev.map((c) => (c.id === id ? { ...c, completed: !c.completed } : c))
    );
  };

  const handleAddChore = (chore: Omit<ChoreItem, 'id' | 'completed'>) => {
    const newChore: ChoreItem = {
      ...chore,
      id: `c-${Date.now()}`,
      completed: false,
    };
    setChores((prev) => [newChore, ...prev]);
  };

  const handleDeleteChore = (id: string) => {
    setChores((prev) => prev.filter((c) => c.id !== id));
  };

  const handleShareToChat = (text: string) => {
    handleSendMessage(text);
    setActiveTab('chat');
  };

  // --- Calendar Handlers ---
  const handleAddEvent = (evt: Omit<FamilyEvent, 'id'>) => {
    const newEvt: FamilyEvent = {
      ...evt,
      id: `e-${Date.now()}`,
    };
    setEvents((prev) => [...prev, newEvt]);
  };

  const handleShareEventToChat = (event: FamilyEvent) => {
    handleSendMessage(
      `📅 **Family Reminder:** ${event.title}\n🗓️ ${event.date} at ${event.time}\n📍 ${event.location}`
    );
    setActiveTab('chat');
  };

  const handleDeleteEvent = (id: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== id));
  };

  // --- Album Handlers ---
  const handleAddMemory = (memory: Omit<PhotoMemory, 'id' | 'likes'>) => {
    const newMem: PhotoMemory = {
      ...memory,
      id: `mem-${Date.now()}`,
      likes: [activeMemberId],
    };
    setMemories((prev) => [newMem, ...prev]);

    // Also share a sneak peek to #album channel
    handleSendMessage(`📸 New Family Memory added to scrapbook: "${memory.caption}"`, [
      {
        type: 'image',
        url: memory.url,
        caption: memory.caption,
      },
    ]);
  };

  const handleToggleLikeMemory = (memoryId: string) => {
    playReactionPop(isMuted);
    setMemories((prev) =>
      prev.map((m) => {
        if (m.id !== memoryId) return m;
        const hasLiked = m.likes.includes(activeMemberId);
        return {
          ...m,
          likes: hasLiked
            ? m.likes.filter((id) => id !== activeMemberId)
            : [...m.likes, activeMemberId],
        };
      })
    );
  };

  // --- Notice Board Handlers ---
  const handleAddNotice = (notice: Omit<QuickNotice, 'id'>) => {
    const newNotice: QuickNotice = {
      ...notice,
      id: `n-${Date.now()}`,
    };
    setNotices((prev) => [...prev, newNotice]);
  };

  const handleDeleteNotice = (id: string) => {
    setNotices((prev) => prev.filter((n) => n.id !== id));
  };

  // --- Daily Check-in Handler ---
  const handleSaveDailyCheckIn = (
    memberId: string,
    moodEmoji: string,
    shortStatus: string,
    note?: string,
    shareToChat?: boolean
  ) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setMembers((prev) =>
      prev.map((m) =>
        m.id === memberId
          ? {
              ...m,
              moodEmoji,
              shortStatus,
              lastCheckInTime: `Today, ${timeStr}`,
              checkInNote: note,
            }
          : m
      )
    );

    // Record check-in to historical check-in data for Mood Trends analytics
    let score = 8;
    if (['😊', '✨', '❤️'].includes(moodEmoji)) score = 9;
    else if (['🥳'].includes(moodEmoji)) score = 10;
    else if (['☕', '🌿', '🍲', '🍞'].includes(moodEmoji)) score = 8;
    else if (['💻', '🚗', '🏃', '📚'].includes(moodEmoji)) score = 7;
    else if (['😴', '🛋️'].includes(moodEmoji)) score = 6;

    const checkingMember = members.find((m) => m.id === memberId) || activeMember;
    const dateStr = now.toISOString().slice(0, 10);
    const dayLabel = now.toLocaleDateString([], { weekday: 'short' });
    const formattedDate = now.toLocaleDateString([], { month: 'short', day: 'numeric' });

    const newRecord: DailyCheckInRecord = {
      id: `ck-${Date.now()}`,
      memberId,
      memberName: checkingMember.name,
      avatarColor: checkingMember.avatarColor,
      moodEmoji,
      moodLabel: shortStatus,
      moodScore: score,
      shortStatus,
      note,
      dateStr,
      dayLabel,
      formattedDate,
      timestamp: now.toISOString(),
    };

    setCheckInHistory((prev) => [newRecord, ...prev]);

    playSendChime(isMuted);

    if (shareToChat) {
      const noteSnippet = note ? `\n💬 "${note}"` : '';
      handleSendMessage(
        `✨ **Daily Check-in:** ${moodEmoji} feeling **${shortStatus}**${noteSnippet}`
      );
    }
  };

  // --- Member & Family Unit Handlers ---
  const handleUpdateMember = (updated: FamilyMember) => {
    setMembers((prev) =>
      prev.map((m) => (m.id === updated.id ? updated : m))
    );
  };

  const handleToggleOnlinePresence = (memberId: string) => {
    setMembers((prev) =>
      prev.map((m) => {
        if (m.id === memberId) {
          const nextOnline = !m.isOnline;
          return {
            ...m,
            isOnline: nextOnline,
            lastActiveTime: nextOnline ? 'Active now' : 'Just now',
          };
        }
        return m;
      })
    );
  };

  const handleToggleChatAccess = (memberId: string) => {
    const targetMember = members.find((m) => m.id === memberId);
    if (!targetMember) return;
    const nextAccess = !targetMember.hasChatAccess;

    setMembers((prev) =>
      prev.map((m) => {
        if (m.id === memberId) {
          return {
            ...m,
            hasChatAccess: nextAccess,
            accessGrantedAt: nextAccess ? new Date().toISOString() : undefined,
            accessGrantedBy: nextAccess ? activeMember.name : undefined,
          };
        }
        return m;
      })
    );

    // Audit log
    const newLog: SecurityAuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      action: nextAccess ? 'GRANT_CHAT_ACCESS' : 'REVOKE_CHAT_ACCESS',
      performedById: activeMember.id,
      performedByName: `${activeMember.name} (${activeMember.isAdmin ? 'Admin' : 'Leader'})`,
      targetId: targetMember.id,
      targetName: targetMember.name,
      details: `${nextAccess ? 'Granted' : 'Revoked'} chat access permissions for ${targetMember.name}`,
    };
    setSecurityLogs((prev) => [newLog, ...prev]);
  };

  const handleDeleteMember = (memberId: string) => {
    if (memberId === DEFAULT_ADMIN_CREDENTIALS.mainMemberId) return; // Cannot delete Grand Admin
    const targetMember = members.find((m) => m.id === memberId);
    setMembers((prev) => prev.filter((m) => m.id !== memberId));
    if (activeMemberId === memberId) {
      setActiveMemberId(DEFAULT_ADMIN_CREDENTIALS.mainMemberId);
    }

    if (targetMember) {
      const newLog: SecurityAuditLog = {
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        action: 'REMOVE_MEMBER',
        performedById: activeMember.id,
        performedByName: `${activeMember.name} (${activeMember.isAdmin ? 'Admin' : 'Leader'})`,
        targetId: targetMember.id,
        targetName: targetMember.name,
        details: `Removed ${targetMember.name} from family circle`,
      };
      setSecurityLogs((prev) => [newLog, ...prev]);
    }
  };

  const handleAddFamilyUnit = (name: string, description: string, leaderId?: string) => {
    const newUnitId = `unit-${Date.now()}`;
    const leaderMember = leaderId ? members.find((m) => m.id === leaderId) : undefined;
    
    const newUnit: FamilyUnit = {
      id: newUnitId,
      name,
      description,
      leaderId: leaderMember?.id,
      leaderName: leaderMember?.name,
      leaderEmail: leaderMember?.email,
      appointedAt: leaderMember ? new Date().toISOString() : undefined,
      appointedBy: activeMember.name,
      createdAt: new Date().toISOString(),
      color: 'bg-indigo-500',
    };

    setFamilyUnits((prev) => [...prev, newUnit]);

    // If leader was assigned, update member's role and unit
    if (leaderMember) {
      setMembers((prev) =>
        prev.map((m) =>
          m.id === leaderMember.id
            ? {
                ...m,
                isLeader: true,
                role: 'Family Unit Leader',
                familyUnitId: newUnitId,
                familyUnitName: name,
              }
            : m
        )
      );
    }

    // Security audit log
    const newLog: SecurityAuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      action: 'CREATE_UNIT',
      performedById: activeMember.id,
      performedByName: `${activeMember.name} (Admin)`,
      targetId: newUnitId,
      targetName: name,
      details: `Created Family Unit "${name}"${leaderMember ? ` and appointed ${leaderMember.name} as leader` : ''}`,
    };
    setSecurityLogs((prev) => [newLog, ...prev]);
  };

  const handleAppointLeader = (unitId: string, memberId: string) => {
    const targetMember = members.find((m) => m.id === memberId);
    const targetUnit = familyUnits.find((u) => u.id === unitId);
    if (!targetMember || !targetUnit) return;

    // Update unit with leader details
    setFamilyUnits((prev) =>
      prev.map((u) =>
        u.id === unitId
          ? {
              ...u,
              leaderId: targetMember.id,
              leaderName: targetMember.name,
              leaderEmail: targetMember.email,
              appointedAt: new Date().toISOString(),
              appointedBy: activeMember.name,
            }
          : u
      )
    );

    // Update member role and unit
    setMembers((prev) =>
      prev.map((m) =>
        m.id === memberId
          ? {
              ...m,
              isLeader: true,
              role: 'Family Unit Leader',
              familyUnitId: unitId,
              familyUnitName: targetUnit.name,
            }
          : m
      )
    );

    // Security audit log
    const newLog: SecurityAuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      action: 'APPOINT_LEADER',
      performedById: activeMember.id,
      performedByName: `${activeMember.name} (Admin)`,
      targetId: targetMember.id,
      targetName: targetMember.name,
      details: `Appointed ${targetMember.name} as Leader of ${targetUnit.name}`,
    };
    setSecurityLogs((prev) => [newLog, ...prev]);

    // System announcement in chat
    handleSendMessage(
      `👑 **Leadership Update:** ${targetMember.name} has been appointed as Leader of **${targetUnit.name}**! They are now authorized to register family members for this unit.`
    );
  };

  const handleAddMember = (newMemberData: Omit<FamilyMember, 'id'>, sentEmail?: SentInviteEmail) => {
    const newMemberId = `member-${Date.now()}`;
    const newMember: FamilyMember = {
      ...newMemberData,
      id: newMemberId,
      accessGrantedAt: newMemberData.hasChatAccess ? new Date().toISOString() : undefined,
      accessGrantedBy: newMemberData.hasChatAccess ? activeMember.name : undefined,
    };
    setMembers((prev) => [...prev, newMember]);

    const targetUnit = familyUnits.find((u) => u.id === newMemberData.familyUnitId);

    // Security audit log
    const newLog: SecurityAuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      action: 'ADD_MEMBER',
      performedById: activeMember.id,
      performedByName: `${activeMember.name} (${activeMember.isAdmin ? 'Admin' : 'Unit Leader'})`,
      targetId: newMemberId,
      targetName: newMember.name,
      details: `Registered ${newMember.name} to ${targetUnit?.name || 'Family Unit'}${sentEmail ? ' & dispatched credentials' : ''}`,
    };
    setSecurityLogs((prev) => [newLog, ...prev]);

    if (sentEmail) {
      const finalizedEmail: SentInviteEmail = {
        ...sentEmail,
        memberId: newMemberId,
      };
      setSentInviteEmails((prev) => [finalizedEmail, ...prev]);
      setSelectedEmailForPreview(finalizedEmail);
      
      // Congratulatory Toast Notification & Celebration Chime
      setCongratulatoryNotice({
        id: `congrat-${Date.now()}`,
        memberName: newMember.name,
        recipientEmail: finalizedEmail.recipientEmail,
        loginPassword: finalizedEmail.loginPassword,
        sentAt: finalizedEmail.sentAt,
        memberId: newMemberId,
        hasChatAccess: !!newMember.hasChatAccess,
      });

      playSuccessCelebration(isMuted);
    } else {
      setActiveMemberId(newMember.id);
    }
  };

  const handleTestLoginAsMember = (memberId: string) => {
    setActiveMemberId(memberId);
    setActiveTab('chat');
    const member = members.find((m) => m.id === memberId);
    if (member) {
      const notice = member.hasChatAccess
        ? `Logged in as ${member.name}! Full chat messaging enabled.`
        : `Logged in as ${member.name}. Chat access is restricted by Admin.`;
      setLoginToastNotice(notice);
      setTimeout(() => setLoginToastNotice(null), 5000);
      playReceiveChime(isMuted);
    }
  };

  const handleAddChannel = (name: string, description: string) => {
    const newChan: Channel = {
      id: name,
      name,
      iconName: 'MessageCircle',
      description,
      category: 'channel',
    };
    setChannels((prev) => [...prev, newChan]);
    setActiveChannelId(newChan.id);
    setActiveTab('chat');
  };

  const handleResetData = () => {
    if (window.confirm('Reset all family chat data to a clean, fresh state ready for new use?')) {
      try {
        localStorage.clear();
      } catch {}
      setFamilyName('The Kinfolk Family');
      setMembers(INITIAL_MEMBERS);
      setFamilyUnits(INITIAL_FAMILY_UNITS);
      setSecurityLogs(INITIAL_SECURITY_LOGS);
      setChannels(INITIAL_CHANNELS);
      setMessages(INITIAL_MESSAGES);
      setGroceries(INITIAL_GROCERIES);
      setChores(INITIAL_CHORES);
      setEvents(INITIAL_EVENTS);
      setNotices(INITIAL_NOTICES);
      setSentInviteEmails(INITIAL_SENT_EMAILS);
      setCheckInHistory(INITIAL_CHECKIN_RECORDS);
      setAdminCredentials(DEFAULT_ADMIN_CREDENTIALS);
      setIsAdminLoggedIn(true);
      setActiveMemberId(DEFAULT_ADMIN_CREDENTIALS.mainMemberId);
      setActiveChannelId('general');
      setActiveTab('chat');
      setLoginToastNotice('System has been reset to a fresh, clean state with organized units and appointed leaders.');
      setTimeout(() => setLoginToastNotice(null), 5000);
    }
  };

  if (!activeMemberId || !activeMember) {
    return (
      <FamilyAuthLanding
        existingMembers={members}
        securityLogs={securityLogs}
        onLoginMember={(id) => {
          setActiveMemberId(id);
          const m = members.find((x) => x.id === id);
          if (m?.isAdmin) setIsAdminLoggedIn(true);
        }}
        onLoginWithCredentials={(email, pass) => {
          const m = members.find(
            (x) =>
              (x.email?.toLowerCase() === email.toLowerCase() || x.name.toLowerCase() === email.toLowerCase()) &&
              x.password === pass
          );
          if (m) {
            setActiveMemberId(m.id);
            if (m.isAdmin) setIsAdminLoggedIn(true);
            return true;
          }
          if (email.toLowerCase() === adminCredentials.email.toLowerCase() && pass === adminCredentials.password) {
            setActiveMemberId(adminCredentials.mainMemberId);
            setIsAdminLoggedIn(true);
            return true;
          }
          return false;
        }}
        onRegisterFamilyHead={(data) => {
          const newId = `head-${Date.now()}`;
          const newHeadMember: FamilyMember = {
            id: newId,
            name: data.name,
            role: 'Family Head & Admin',
            familyRole: data.familyRole,
            avatarColor: 'bg-emerald-600',
            status: `Leading ${data.familyName}`,
            statusEmoji: '👑',
            moodEmoji: '✨',
            shortStatus: 'Online',
            lastCheckInTime: 'Just now',
            lastActiveTime: 'Active now',
            checkInNote: 'Registered as verified Family Head',
            relationship: `${data.familyRole} & Lineage Head`,
            email: data.email,
            password: data.password,
            isOnline: true,
            isAdmin: true,
            isSuperAdmin: false,
            adminVerified: true,
            nationalIdNumber: data.nationalIdNumber,
            age: data.age,
            hasChildren: true,
            childrenCount: data.childrenCount,
            generation: 'Generation I (Family Elders)',
            hasChatAccess: true,
            accessGrantedAt: new Date().toISOString(),
            accessGrantedBy: 'Super Admin System',
            joinedAt: new Date().toISOString(),
          };

          const newUnit: FamilyUnit = {
            id: `unit-${Date.now()}`,
            name: data.familyName,
            description: `Lineage branch managed by ${data.name}`,
            leaderId: newId,
            leaderName: data.name,
            leaderEmail: data.email,
            appointedAt: new Date().toISOString(),
            appointedBy: 'Super Admin System',
            color: 'bg-emerald-500',
            createdAt: new Date().toISOString(),
          };

          const auditLog: SecurityAuditLog = {
            id: `log-${Date.now()}`,
            timestamp: new Date().toISOString(),
            action: 'REGISTER_FAMILY_HEAD',
            performedById: newId,
            performedByName: `${data.name} (Family Head)`,
            targetId: newId,
            targetName: data.name,
            details: `Verified Family Head registered with National ID ${data.nationalIdNumber}, age ${data.age}, and ${data.childrenCount} children.`,
          };

          setMembers((prev) => [...prev, newHeadMember]);
          setFamilyUnits((prev) => [...prev, newUnit]);
          setSecurityLogs((prev) => [auditLog, ...prev]);
          setActiveMemberId(newId);
          setIsAdminLoggedIn(true);
          setFamilyName(data.familyName);
        }}
      />
    );
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-white text-slate-900 font-sans">
      
      {/* Left Sidebar */}
      <Sidebar
        familyName={familyName}
        onUpdateFamilyName={setFamilyName}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        channels={channels}
        activeChannelId={activeChannelId}
        onSelectChannel={setActiveChannelId}
        onAddChannel={handleAddChannel}
        members={members}
        activeMemberId={activeMemberId}
        messages={messages}
        onOpenDailyCheckIn={() => setIsDailyCheckInOpen(true)}
        onOpenMembersModal={() => {
          setMembersModalTab('members');
          setIsMembersModalOpen(true);
        }}
        onOpenMemberLogin={() => setIsMemberLoginModalOpen(true)}
        onOpenRegisterModal={() => {
          setMembersModalTab('register');
          setIsMembersModalOpen(true);
        }}
        onOpenNoticeBoard={() => setIsNoticeBoardOpen(true)}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        isAdminLoggedIn={isAdminLoggedIn}
        onOpenAdminLogin={() => setIsAdminLoginModalOpen(true)}
        onOpenSuperAdminModal={() => setIsSuperAdminModalOpen(true)}
        onSignOut={() => setActiveMemberId(null)}
        familyUnits={familyUnits}
        isLivelyMode={isLivelyMode}
        onToggleLivelyMode={() => setIsLivelyMode(!isLivelyMode)}
        onResetData={handleResetData}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full min-w-0 bg-slate-50 relative pb-16 md:pb-0">
        
        {/* Render Tab Content */}
        {activeTab === 'chat' && (
          <div className="flex-1 flex h-full min-w-0 overflow-hidden">
            <div className="flex-1 flex flex-col h-full min-w-0">
              <ChatHeader
                currentChannel={currentChannel}
                activeMember={activeMember}
                allMembers={members}
                isMuted={isMuted}
                onToggleMute={() => setIsMuted(!isMuted)}
                onStartCall={() => setIsCallModalOpen(true)}
                onOpenMembersModal={() => {
                  setMembersModalTab('members');
                  setIsMembersModalOpen(true);
                }}
                onOpenRegisterMember={() => {
                  setMembersModalTab('register');
                  setIsMembersModalOpen(true);
                }}
                onOpenMemberLogin={() => setIsMemberLoginModalOpen(true)}
                onOpenSettings={() => setIsSettingsModalOpen(true)}
                sentEmailsCount={sentInviteEmails.length}
                onOpenNoticeBoard={() => setIsNoticeBoardOpen(true)}
                onToggleSidebarMobile={() => setIsMobileSidebarOpen(true)}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                isAdminLoggedIn={isAdminLoggedIn}
                onOpenAdminLogin={() => setIsAdminLoginModalOpen(true)}
                onOpenDailyCheckIn={() => setIsDailyCheckInOpen(true)}
                onInsertPromptToChat={(prompt) => handleSendMessage(prompt)}
                isPresencePanelOpen={isPresencePanelOpen}
                onTogglePresencePanel={() => setIsPresencePanelOpen(!isPresencePanelOpen)}
                onOpenFamilyUnitsModal={() => setIsFamilyUnitsModalOpen(true)}
                onToggleOnlinePresence={handleToggleOnlinePresence}
                onSignOut={() => setActiveMemberId(null)}
              />

              {/* Chat Messages Feed */}
              <MessageList
                messages={currentChannelMessages}
                members={members}
                activeMemberId={activeMemberId}
                selectedMessageId={selectedMessageForReaction?.id}
                onSelectMessage={(msg) =>
                  setSelectedMessageForReaction((prev) => (prev?.id === msg.id ? null : msg))
                }
                onReact={handleReact}
                onVotePoll={handleVotePoll}
                onTogglePin={handleTogglePin}
                onReplyTo={setReplyingTo}
                onOpenImageLightbox={(url, caption) => setLightboxImage({ url, caption })}
                onMarkAsRead={handleMarkAsRead}
              />

              {/* Typing Indicator */}
              {typingMemberName && (
                <div className="px-6 py-1.5 bg-slate-50 text-xs text-slate-500 italic flex items-center gap-2 border-t border-slate-100">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce delay-100" />
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce delay-200" />
                  <span>{typingMemberName} is typing...</span>
                </div>
              )}

              {/* Message Input Box */}
              <ChatInput
                activeMember={activeMember}
                replyingTo={replyingTo}
                onCancelReply={() => setReplyingTo(null)}
                onSendMessage={handleSendMessage}
                onOpenVoiceRecorder={() => setIsVoiceRecorderOpen(true)}
                onOpenCreatePoll={() => setIsCreatePollOpen(true)}
                onOpenAdminLogin={() => setIsAdminLoginModalOpen(true)}
                channelName={currentChannel.name}
                selectedMessage={selectedMessageForReaction}
                onClearSelectedMessage={() => setSelectedMessageForReaction(null)}
                onReact={handleReact}
                latestMessage={currentChannelMessages[currentChannelMessages.length - 1] || null}
              />
            </div>

            {/* Clear Active vs Inactive Family Presence Panel */}
            {isPresencePanelOpen && (
              <FamilyPresencePanel
                members={members}
                familyUnits={familyUnits}
                activeMember={activeMember}
                onSelectMember={setActiveMemberId}
                onOpenMembersModal={(tab) => {
                  if (tab === 'security') {
                    setIsFamilyUnitsModalOpen(true);
                  } else {
                    setMembersModalTab(tab || 'members');
                    setIsMembersModalOpen(true);
                  }
                }}
                onToggleOnlinePresence={handleToggleOnlinePresence}
                onClose={() => setIsPresencePanelOpen(false)}
                currentChannelName={currentChannel.name}
              />
            )}
          </div>
        )}

        {activeTab === 'album' && (
          <FamilyAlbumTab
            members={members}
            activeMemberId={activeMemberId}
            memories={memories}
            onAddMemory={handleAddMemory}
            onToggleLike={handleToggleLikeMemory}
          />
        )}

        {activeTab === 'media' && (
          <SharedMediaTab
            messages={messages}
            channels={channels}
            members={members}
            activeMemberId={activeMemberId}
            onOpenImageLightbox={(url, caption) => setLightboxImage({ url, caption })}
            onNavigateToMessage={(channelId, messageId) => {
              setActiveChannelId(channelId);
              setActiveTab('chat');
              const targetMsg = messages.find((m) => m.id === messageId);
              if (targetMsg) setSelectedMessageForReaction(targetMsg);
            }}
          />
        )}

        {activeTab === 'celebrations' && (
          <MilestonesCelebrationsTab
            milestones={milestones}
            activeMember={activeMember}
            allMembers={members}
            onAddMilestone={handleAddMilestone}
            onToggleTask={handleToggleMilestoneTask}
            onAddTask={handleAddMilestoneTask}
            onUpdateRsvp={handleUpdateMilestoneRsvp}
            onAddBlessing={handleAddMilestoneBlessing}
            onAnnounceInChat={handleAnnounceMilestoneInChat}
          />
        )}

        {activeTab === 'calendar' && (
          <CalendarTab
            events={events}
            members={members}
            onAddEvent={handleAddEvent}
            onShareEventToChat={handleShareEventToChat}
            onDeleteEvent={handleDeleteEvent}
          />
        )}

        {activeTab === 'family' && (
          <FamilyTab
            members={members}
            activeMember={activeMember}
            activeMemberId={activeMemberId}
            checkInHistory={checkInHistory}
            isAdminLoggedIn={isAdminLoggedIn}
            familyName={familyName}
            onOpenDailyCheckIn={() => setIsDailyCheckInOpen(true)}
            onOpenRegisterMember={() => {
              setMembersModalTab('register');
              setIsMembersModalOpen(true);
            }}
            onOpenMembersModal={() => {
              setMembersModalTab('members');
              setIsMembersModalOpen(true);
            }}
            onOpenAdminLogin={() => setIsAdminLoginModalOpen(true)}
            onOpenExportModal={() => setIsSettingsModalOpen(true)}
            onSendCheckInPromptToChat={(prompt) => handleSendMessage(prompt)}
            onSelectMember={setActiveMemberId}
            events={events}
            onNavigateToCalendar={() => setActiveTab('calendar')}
          />
        )}

        {/* Mobile Fixed Bottom Navigation Bar */}
        <nav className="md:hidden fixed bottom-0 inset-x-0 z-30 h-16 bg-white/95 backdrop-blur-md border-t border-slate-200 grid grid-cols-6 items-center px-1">
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex flex-col items-center justify-center h-full min-h-[44px] transition-colors ${
              activeTab === 'chat' ? 'text-slate-900 font-bold' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <MessageCircle className="w-4 h-4" />
            <span className="text-[9px] mt-1">Chat</span>
          </button>

          <button
            onClick={() => setActiveTab('celebrations')}
            className={`flex flex-col items-center justify-center h-full min-h-[44px] transition-colors ${
              activeTab === 'celebrations' ? 'text-rose-600 font-bold' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span className="text-[9px] mt-1">Events</span>
          </button>

          <button
            onClick={() => setActiveTab('media')}
            className={`flex flex-col items-center justify-center h-full min-h-[44px] transition-colors ${
              activeTab === 'media' ? 'text-indigo-600 font-bold' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <FolderHeart className="w-4 h-4" />
            <span className="text-[9px] mt-1">Media</span>
          </button>

          <button
            onClick={() => setActiveTab('album')}
            className={`flex flex-col items-center justify-center h-full min-h-[44px] transition-colors ${
              activeTab === 'album' ? 'text-slate-900 font-bold' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span className="text-[9px] mt-1">Moments</span>
          </button>

          <button
            onClick={() => setActiveTab('calendar')}
            className={`flex flex-col items-center justify-center h-full min-h-[44px] transition-colors ${
              activeTab === 'calendar' ? 'text-slate-900 font-bold' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span className="text-[9px] mt-1">Calendar</span>
          </button>

          <button
            onClick={() => setActiveTab('family')}
            className={`flex flex-col items-center justify-center h-full min-h-[44px] transition-colors ${
              activeTab === 'family' ? 'text-emerald-700 font-bold' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Users className="w-4 h-4" />
            <span className="text-[9px] mt-1">Family</span>
          </button>
        </nav>

      </main>

      {/* --- Modals & Overlays --- */}
      <CallModal
        isOpen={isCallModalOpen}
        onClose={() => setIsCallModalOpen(false)}
        channelName={currentChannel.name}
        members={members}
        activeMember={activeMember}
      />

      <NoticeBoardModal
        isOpen={isNoticeBoardOpen}
        onClose={() => setIsNoticeBoardOpen(false)}
        notices={notices}
        onAddNotice={handleAddNotice}
        onDeleteNotice={handleDeleteNotice}
      />

      {/* Congratulatory Toast Notification with Confetti Animation */}
      <CongratulatoryToast
        notice={congratulatoryNotice}
        onClose={() => setCongratulatoryNotice(null)}
        onViewDeliveredEmail={() => {
          if (selectedEmailForPreview) {
            setIsEmailDeliveryModalOpen(true);
          }
        }}
        onTestLogin={(memberId) => handleTestLoginAsMember(memberId)}
      />

      {/* Login Toast Notice */}
      {loginToastNotice && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-2xl shadow-2xl flex items-center gap-2.5 border border-slate-700 text-xs font-semibold animate-in fade-in slide-in-from-top-2">
          <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{loginToastNotice}</span>
          <button
            onClick={() => setLoginToastNotice(null)}
            className="text-slate-400 hover:text-white ml-2 text-xs"
          >
            ✕
          </button>
        </div>
      )}

      <FamilyMembersModal
        isOpen={isMembersModalOpen}
        onClose={() => setIsMembersModalOpen(false)}
        members={members}
        activeMemberId={activeMemberId}
        onSelectActiveMember={setActiveMemberId}
        onUpdateMember={handleUpdateMember}
        onAddMember={handleAddMember}
        onToggleChatAccess={handleToggleChatAccess}
        onDeleteMember={handleDeleteMember}
        isAdminLoggedIn={isAdminLoggedIn}
        onOpenAdminLogin={() => setIsAdminLoginModalOpen(true)}
        onAdminLogout={() => setIsAdminLoggedIn(false)}
        onOpenDailyCheckIn={() => setIsDailyCheckInOpen(true)}
        sentInviteEmails={sentInviteEmails}
        onOpenEmailPreview={(email) => {
          setSelectedEmailForPreview(email);
          setIsEmailDeliveryModalOpen(true);
        }}
        onOpenMemberLoginModal={(email) => {
          setPrefilledLoginEmail(email || '');
          setIsMemberLoginModalOpen(true);
        }}
        initialTab={membersModalTab}
        onTestLoginAsMember={handleTestLoginAsMember}
        checkInHistory={checkInHistory}
        onOpenExportModal={() => setIsSettingsModalOpen(true)}
        familyUnits={familyUnits}
        onAddFamilyUnit={handleAddFamilyUnit}
        onAppointLeader={handleAppointLeader}
        securityLogs={securityLogs}
        onToggleOnlinePresence={handleToggleOnlinePresence}
        events={events}
        onNavigateToCalendar={() => setActiveTab('calendar')}
      />

      {/* Family Units & Appointed Leaders Modal */}
      <FamilyUnitsModal
        isOpen={isFamilyUnitsModalOpen}
        onClose={() => setIsFamilyUnitsModalOpen(false)}
        familyUnits={familyUnits}
        members={members}
        activeMember={activeMember}
        isAdminLoggedIn={isAdminLoggedIn}
        onAddFamilyUnit={handleAddFamilyUnit}
        onAppointLeader={handleAppointLeader}
        onOpenRegisterMember={() => {
          setMembersModalTab('register');
          setIsMembersModalOpen(true);
        }}
        securityLogs={securityLogs}
      />

      {/* Family Settings & Archive Export Modal */}
      <FamilySettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        familyName={familyName}
        onUpdateFamilyName={setFamilyName}
        isLivelyMode={isLivelyMode}
        onToggleLivelyMode={() => setIsLivelyMode(!isLivelyMode)}
        isMuted={isMuted}
        onToggleMute={() => setIsMuted(!isMuted)}
        isAdminLoggedIn={isAdminLoggedIn}
        onOpenAdminLogin={() => setIsAdminLoginModalOpen(true)}
        onAdminLogout={() => setIsAdminLoggedIn(false)}
        adminCredentials={adminCredentials}
        onUpdateAdminCredentials={setAdminCredentials}
        members={members}
        channels={channels}
        messages={messages}
        groceries={groceries}
        chores={chores}
        events={events}
        notices={notices}
        checkInHistory={checkInHistory}
        onResetData={handleResetData}
      />

      {/* Delivered Email Preview & Credentials Modal */}
      <EmailDeliveryModal
        isOpen={isEmailDeliveryModalOpen}
        onClose={() => setIsEmailDeliveryModalOpen(false)}
        emailData={selectedEmailForPreview}
        familyName={familyName}
        onTestLoginAsMember={handleTestLoginAsMember}
        onOpenMemberLoginModal={(email) => {
          setPrefilledLoginEmail(email);
          setIsMemberLoginModalOpen(true);
        }}
      />

      {/* Family Member Login Modal */}
      <MemberLoginModal
        isOpen={isMemberLoginModalOpen}
        onClose={() => setIsMemberLoginModalOpen(false)}
        members={members}
        activeMemberId={activeMemberId}
        initialEmail={prefilledLoginEmail}
        onLoginSuccess={handleTestLoginAsMember}
        onOpenEmailPreview={(email) => {
          setSelectedEmailForPreview(email);
          setIsEmailDeliveryModalOpen(true);
        }}
        sentInviteEmails={sentInviteEmails}
      />

      <DailyCheckInModal
        isOpen={isDailyCheckInOpen}
        onClose={() => setIsDailyCheckInOpen(false)}
        activeMember={activeMember}
        onSaveCheckIn={handleSaveDailyCheckIn}
      />

      <AdminLoginModal
        isOpen={isAdminLoginModalOpen}
        onClose={() => setIsAdminLoginModalOpen(false)}
        adminCredentials={adminCredentials}
        onLoginSuccess={() => setIsAdminLoggedIn(true)}
        onUpdateCredentials={setAdminCredentials}
        isAdminLoggedIn={isAdminLoggedIn}
        onAdminLogout={() => setIsAdminLoggedIn(false)}
        mainMember={members.find(m => m.isAdmin) || members[0]}
      />

      <CreatePollModal
        isOpen={isCreatePollOpen}
        onClose={() => setIsCreatePollOpen(false)}
        onSubmit={handleCreatePoll}
      />

      <VoiceNoteRecorder
        isOpen={isVoiceRecorderOpen}
        onClose={() => setIsVoiceRecorderOpen(false)}
        onSendVoiceNote={handleSendVoiceNote}
      />

      {/* Global Lightbox for Image Attachments */}
      {lightboxImage && (
        <div
          onClick={() => setLightboxImage(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-4xl w-full bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-800 flex flex-col"
          >
            <button
              onClick={() => setLightboxImage(null)}
              className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-slate-950/70 text-white flex items-center justify-center hover:bg-slate-900 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="max-h-[80vh] bg-black flex items-center justify-center">
              <img
                src={lightboxImage.url}
                alt="Enlarged view"
                className="max-h-[80vh] w-auto object-contain"
                referrerPolicy="no-referrer"
              />
            </div>

            {lightboxImage.caption && (
              <div className="p-4 bg-slate-900 text-white text-xs">
                {lightboxImage.caption}
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
