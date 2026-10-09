import React, { useState, useMemo } from 'react';
import { 
  Image as ImageIcon, 
  Mic, 
  Play, 
  Pause, 
  Search, 
  Filter, 
  ExternalLink, 
  Calendar, 
  MessageCircle,
  Volume2,
  FolderHeart,
  Sparkles,
  Maximize2
} from 'lucide-react';
import { Message, Channel, FamilyMember } from '../types/family';

interface SharedMediaTabProps {
  messages: Message[];
  channels: Channel[];
  members: FamilyMember[];
  activeMemberId: string;
  onOpenImageLightbox: (url: string, caption?: string) => void;
  onNavigateToMessage: (channelId: string, messageId: string) => void;
}

interface MediaItem {
  id: string;
  type: 'image' | 'audio';
  url?: string;
  audioUrl?: string;
  duration?: number;
  caption?: string;
  timestamp: string;
  senderId: string;
  channelId: string;
  messageId: string;
  reactions: Record<string, string[]>;
}

export const SharedMediaTab: React.FC<SharedMediaTabProps> = ({
  messages,
  channels,
  members,
  activeMemberId,
  onOpenImageLightbox,
  onNavigateToMessage,
}) => {
  const [filterType, setFilterType] = useState<'all' | 'image' | 'audio'>('all');
  const [selectedChannelId, setSelectedChannelId] = useState<string>('all');
  const [selectedMemberId, setSelectedMemberId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [audioProgress, setAudioProgress] = useState<Record<string, number>>({});

  // Helper to look up member
  const getMember = (id: string): FamilyMember => {
    return (
      members.find((m) => m.id === id) || {
        id,
        name: 'Family Member',
        role: 'Relative',
        avatarColor: 'bg-slate-500',
        status: '',
        statusEmoji: '👋',
        isOnline: false,
        hasChatAccess: true,
      }
    );
  };

  // Helper to look up channel
  const getChannelName = (channelId: string) => {
    const ch = channels.find((c) => c.id === channelId);
    return ch ? ch.name : channelId;
  };

  // Extract all media items from messages across all channels
  const allMediaItems = useMemo<MediaItem[]>(() => {
    const items: MediaItem[] = [];

    messages.forEach((msg) => {
      if (!msg.attachments || msg.attachments.length === 0) return;

      msg.attachments.forEach((att, idx) => {
        if (att.type === 'image' && att.url) {
          items.push({
            id: `${msg.id}-img-${idx}`,
            type: 'image',
            url: att.url,
            caption: att.caption || (msg.content !== '📸 Photo' ? msg.content : undefined),
            timestamp: msg.timestamp,
            senderId: msg.senderId,
            channelId: msg.channelId,
            messageId: msg.id,
            reactions: msg.reactions,
          });
        } else if (att.type === 'audio') {
          items.push({
            id: `${msg.id}-audio-${idx}`,
            type: 'audio',
            audioUrl: att.audioBlobUrl || att.url,
            duration: att.duration || 8,
            caption: att.caption || (msg.content !== '🎙️ Voice Note' ? msg.content : undefined),
            timestamp: msg.timestamp,
            senderId: msg.senderId,
            channelId: msg.channelId,
            messageId: msg.id,
            reactions: msg.reactions,
          });
        }
      });
    });

    // Sort newest first
    return items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [messages]);

  // Filtered media items
  const filteredMedia = useMemo(() => {
    return allMediaItems.filter((item) => {
      // Filter by type
      if (filterType !== 'all' && item.type !== filterType) {
        return false;
      }

      // Filter by channel
      if (selectedChannelId !== 'all' && item.channelId !== selectedChannelId) {
        return false;
      }

      // Filter by sender
      if (selectedMemberId !== 'all' && item.senderId !== selectedMemberId) {
        return false;
      }

      // Filter by search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const sender = getMember(item.senderId);
        const matchesCaption = item.caption?.toLowerCase().includes(q);
        const matchesSender = sender.name.toLowerCase().includes(q);
        const matchesChannel = getChannelName(item.channelId).toLowerCase().includes(q);
        if (!matchesCaption && !matchesSender && !matchesChannel) {
          return false;
        }
      }

      return true;
    });
  }, [allMediaItems, filterType, selectedChannelId, selectedMemberId, searchQuery]);

  // Audio Playback simulation / handling
  const handleTogglePlayAudio = (itemId: string, durationSec: number = 8) => {
    if (playingAudioId === itemId) {
      setPlayingAudioId(null);
    } else {
      setPlayingAudioId(itemId);
      setAudioProgress((prev) => ({ ...prev, [itemId]: 0 }));

      const intervalStepMs = 150;
      const totalSteps = (durationSec * 1000) / intervalStepMs;
      let step = 0;

      const interval = setInterval(() => {
        step++;
        const pct = Math.min(100, Math.round((step / totalSteps) * 100));
        setAudioProgress((prev) => ({ ...prev, [itemId]: pct }));

        if (pct >= 100) {
          clearInterval(interval);
          setPlayingAudioId((curr) => (curr === itemId ? null : curr));
          setAudioProgress((prev) => ({ ...prev, [itemId]: 0 }));
        }
      }, intervalStepMs);
    }
  };

  const totalImages = allMediaItems.filter((m) => m.type === 'image').length;
  const totalAudios = allMediaItems.filter((m) => m.type === 'audio').length;

  const formatDate = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch {
      return 'Recent';
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 overflow-y-auto">
      
      {/* Top Header & Overview Banner */}
      <div className="bg-white border-b border-slate-200/80 px-4 py-5 sm:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            <div>
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center text-sm font-bold shadow-2xs">
                  📸
                </span>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 font-display">
                  Shared Media & Voice Notes
                </h1>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                All photos, memories, and voice messages collected across family rooms in a dedicated grid view.
              </p>
            </div>

            {/* Quick Stats Pill */}
            <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-200/80 self-start md:self-auto">
              <div className="flex items-center gap-1.5 px-3 py-1 bg-white rounded-xl shadow-2xs text-xs font-semibold text-slate-700">
                <ImageIcon className="w-3.5 h-3.5 text-sky-500" />
                <span>{totalImages} Photos</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 bg-white rounded-xl shadow-2xs text-xs font-semibold text-slate-700">
                <Mic className="w-3.5 h-3.5 text-emerald-500" />
                <span>{totalAudios} Voice Notes</span>
              </div>
            </div>

          </div>

          {/* Filter Bar & Controls */}
          <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
            
            {/* Filter Tabs (All / Photos / Voice Notes) */}
            <div className="flex items-center gap-1.5 bg-slate-100/80 p-1 rounded-xl shrink-0 self-start">
              <button
                type="button"
                onClick={() => setFilterType('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  filterType === 'all'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All Media ({allMediaItems.length})
              </button>

              <button
                type="button"
                onClick={() => setFilterType('image')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  filterType === 'image'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5 text-sky-600" />
                <span>Photos ({totalImages})</span>
              </button>

              <button
                type="button"
                onClick={() => setFilterType('audio')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  filterType === 'audio'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Mic className="w-3.5 h-3.5 text-emerald-600" />
                <span>Voice Notes ({totalAudios})</span>
              </button>
            </div>

            {/* Search and Dropdowns */}
            <div className="flex flex-wrap items-center gap-2">
              
              {/* Search text input */}
              <div className="flex-1 sm:w-56 flex items-center bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs shadow-2xs focus-within:ring-2 focus-within:ring-slate-900/10">
                <Search className="w-3.5 h-3.5 text-slate-400 mr-2 shrink-0" />
                <input
                  type="text"
                  placeholder="Search captions or relatives..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent focus:outline-none text-slate-800 w-full text-xs placeholder:text-slate-400"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="text-slate-400 hover:text-slate-600 text-xs px-1"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Room / Channel Filter */}
              <select
                value={selectedChannelId}
                onChange={(e) => setSelectedChannelId(e.target.value)}
                className="bg-white border border-slate-200 text-slate-700 text-xs rounded-xl px-2.5 py-1.5 focus:outline-none shadow-2xs cursor-pointer font-medium"
              >
                <option value="all">All Rooms & Circles</option>
                {channels.map((ch) => (
                  <option key={ch.id} value={ch.id}>
                    #{ch.name}
                  </option>
                ))}
              </select>

              {/* Relative / Member Filter */}
              <select
                value={selectedMemberId}
                onChange={(e) => setSelectedMemberId(e.target.value)}
                className="bg-white border border-slate-200 text-slate-700 text-xs rounded-xl px-2.5 py-1.5 focus:outline-none shadow-2xs cursor-pointer font-medium"
              >
                <option value="all">All Family Members</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.role})
                  </option>
                ))}
              </select>

            </div>

          </div>
        </div>
      </div>

      {/* Grid Content Area */}
      <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
        {filteredMedia.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200/90 p-12 text-center max-w-lg mx-auto shadow-xs my-8">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4 text-2xl shadow-2xs">
              🖼️
            </div>
            <h3 className="text-base font-bold text-slate-800 font-display">
              No shared media found
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              {searchQuery || selectedChannelId !== 'all' || selectedMemberId !== 'all'
                ? 'Try adjusting your search terms or filters to find photos and voice notes.'
                : 'Share your family dinner photos or record voice notes in any chat room to see them collected here!'}
            </p>
            {(searchQuery || selectedChannelId !== 'all' || selectedMemberId !== 'all' || filterType !== 'all') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedChannelId('all');
                  setSelectedMemberId('all');
                  setFilterType('all');
                }}
                className="mt-4 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition-colors"
              >
                Reset Filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
            {filteredMedia.map((item) => {
              const sender = getMember(item.senderId);
              const channelName = getChannelName(item.channelId);

              // 1. IMAGE MEDIA CARD
              if (item.type === 'image' && item.url) {
                return (
                  <div
                    key={item.id}
                    className="group bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col"
                  >
                    {/* Image Preview Container */}
                    <div
                      onClick={() => onOpenImageLightbox(item.url!, item.caption)}
                      className="relative aspect-4/3 bg-slate-900 overflow-hidden cursor-pointer"
                    >
                      <img
                        src={item.url}
                        alt={item.caption || 'Shared photo'}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />

                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                        <span className="flex items-center gap-1.5 text-white text-xs font-semibold drop-shadow-md">
                          <Maximize2 className="w-3.5 h-3.5" />
                          <span>View Full Photo</span>
                        </span>
                      </div>

                      {/* Channel Pill Badge */}
                      <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full bg-slate-950/70 backdrop-blur-xs text-white text-[10px] font-medium tracking-wide">
                        #{channelName}
                      </span>
                    </div>

                    {/* Metadata & Caption */}
                    <div className="p-3.5 flex-1 flex flex-col justify-between">
                      <div>
                        {item.caption && (
                          <p className="text-xs font-semibold text-slate-800 line-clamp-2 leading-snug mb-2">
                            {item.caption}
                          </p>
                        )}
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                        {/* Sender info */}
                        <div className="flex items-center gap-1.5 min-w-0">
                          <div
                            className={`w-5 h-5 rounded-full flex items-center justify-center text-white text-[9px] font-bold shrink-0 ${sender.avatarColor}`}
                          >
                            {sender.name.charAt(0)}
                          </div>
                          <span className="font-semibold text-slate-700 truncate">
                            {sender.name}
                          </span>
                        </div>

                        {/* Date & Jump Action */}
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-[10px] text-slate-400">
                            {formatDate(item.timestamp)}
                          </span>
                          <button
                            type="button"
                            onClick={() => onNavigateToMessage(item.channelId, item.messageId)}
                            className="p-1 rounded-md text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                            title={`Jump to message in #${channelName}`}
                          >
                            <ExternalLink className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }

              // 2. VOICE NOTE / AUDIO MEDIA CARD
              if (item.type === 'audio') {
                const isPlaying = playingAudioId === item.id;
                const progress = audioProgress[item.id] || 0;

                return (
                  <div
                    key={item.id}
                    className="group bg-gradient-to-br from-emerald-50/60 via-white to-white rounded-2xl border border-emerald-200/80 p-4 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div>
                      {/* Top Bar: Channel Tag + Voice Badge */}
                      <div className="flex items-center justify-between mb-3">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                          <Volume2 className="w-3 h-3" />
                          <span>Voice Note</span>
                        </span>
                        <span className="text-[11px] font-medium text-slate-500">
                          #{channelName}
                        </span>
                      </div>

                      {/* Audio Player Component */}
                      <div className="bg-slate-900 text-white rounded-xl p-3 flex items-center gap-3 shadow-2xs">
                        <button
                          type="button"
                          onClick={() => handleTogglePlayAudio(item.id, item.duration || 8)}
                          className="w-10 h-10 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center justify-center shrink-0 transition-transform hover:scale-105 active:scale-95 shadow-md"
                        >
                          {isPlaying ? (
                            <Pause className="w-4 h-4 fill-slate-950" />
                          ) : (
                            <Play className="w-4 h-4 fill-slate-950 ml-0.5" />
                          )}
                        </button>

                        <div className="flex-1 min-w-0">
                          {/* Animated Waveform bars */}
                          <div className="flex items-center gap-0.5 h-6">
                            {[10, 22, 16, 26, 14, 18, 24, 15, 20, 12, 18, 24, 14, 25, 19, 13].map((barHeight, bIdx) => {
                              const barThreshold = (bIdx / 16) * 100;
                              const isPast = progress >= barThreshold;
                              return (
                                <span
                                  key={bIdx}
                                  style={{ height: `${barHeight}px` }}
                                  className={`flex-1 rounded-full transition-colors ${
                                    isPast
                                      ? 'bg-emerald-400'
                                      : isPlaying
                                      ? 'bg-slate-600 animate-pulse'
                                      : 'bg-slate-700'
                                  }`}
                                />
                              );
                            })}
                          </div>

                          <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono mt-1">
                            <span>{isPlaying ? 'Playing...' : 'Voice Memory'}</span>
                            <span>{item.duration ? `00:${item.duration.toString().padStart(2, '0')}` : '00:08'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Note / Caption if available */}
                      {item.caption && (
                        <p className="text-xs text-slate-700 font-medium italic mt-3 bg-white/80 p-2 rounded-xl border border-slate-100 line-clamp-2">
                          "{item.caption}"
                        </p>
                      )}
                    </div>

                    {/* Sender Footer */}
                    <div className="mt-4 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <div
                          className={`w-5 h-5 rounded-full flex items-center justify-center text-white text-[9px] font-bold shrink-0 ${sender.avatarColor}`}
                        >
                          {sender.name.charAt(0)}
                        </div>
                        <span className="font-semibold text-slate-700 truncate">
                          {sender.name}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[10px] text-slate-400">
                          {formatDate(item.timestamp)}
                        </span>
                        <button
                          type="button"
                          onClick={() => onNavigateToMessage(item.channelId, item.messageId)}
                          className="p-1 rounded-md text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                          title={`Jump to message in #${channelName}`}
                        >
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              }

              return null;
            })}
          </div>
        )}
      </div>

    </div>
  );
};
