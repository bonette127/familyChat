import React, { useState } from 'react';
import { 
  Heart, 
  Smile, 
  Pin, 
  Reply, 
  MapPin, 
  Play, 
  Pause, 
  Eye,
  Search,
  Filter,
  X,
  Clock,
  ExternalLink
} from 'lucide-react';
import { Attachment, FamilyMember, Message } from '../types/family';

interface MessageItemProps {
  message: Message;
  members: FamilyMember[];
  activeMemberId: string;
  isSameSender: boolean;
  isSelected?: boolean;
  onSelectForReaction?: (message: Message) => void;
  onReact: (messageId: string, emoji: string) => void;
  onVotePoll: (messageId: string, optionId: string) => void;
  onTogglePin: (messageId: string) => void;
  onReplyTo: (message: Message) => void;
  onOpenImageLightbox: (url: string, caption?: string) => void;
  onViewReadReceipts: (message: Message) => void;
}

export const MessageItem: React.FC<MessageItemProps> = ({
  message,
  members,
  activeMemberId,
  isSameSender,
  isSelected = false,
  onSelectForReaction,
  onReact,
  onVotePoll,
  onTogglePin,
  onReplyTo,
  onOpenImageLightbox,
  onViewReadReceipts,
}) => {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [showReactionMenu, setShowReactionMenu] = useState(false);
  const [isSeenTooltipOpen, setIsSeenTooltipOpen] = useState(false);
  const [seenSearchQuery, setSeenSearchQuery] = useState('');
  const [seenFilterTab, setSeenFilterTab] = useState<'all' | 'read' | 'unread'>('all');

  const quickReactions = ['❤️', '👍', '😂', '🍲', '🎉', '🙏', '🐶', '👏'];

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

  const sender = getMember(message.senderId);
  const isMe = message.senderId === activeMemberId;

  const formatTimestamp = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return 'Just now';
    }
  };

  const handleToggleAudio = () => {
    if (isPlayingAudio) {
      setIsPlayingAudio(false);
    } else {
      setIsPlayingAudio(true);
      let p = 0;
      const interval = setInterval(() => {
        p += 10;
        setAudioProgress(p);
        if (p >= 100) {
          clearInterval(interval);
          setIsPlayingAudio(false);
          setAudioProgress(0);
        }
      }, 300);
    }
  };

  // --- Read Status Calculation ---
  // List of members other than the author who have read this message
  const readByList = message.readBy || [];
  const otherFamilyMembers = members.filter((m) => m.id !== message.senderId);
  const readers = readByList
    .filter((id) => id !== message.senderId)
    .map((id) => getMember(id));

  // If only the author has seen or read it, include author so it's clear who has seen it
  const allWhoSeen = readByList.map((id) => getMember(id));
  const displayReaders = readers.length > 0 ? readers : allWhoSeen;

  const targetMembers = members;
  const unreadMembers = targetMembers.filter((m) => !readByList.includes(m.id));

  const filteredTooltipMembers = targetMembers.filter((m) => {
    const isRead = readByList.includes(m.id);
    if (seenFilterTab === 'read' && !isRead) return false;
    if (seenFilterTab === 'unread' && isRead) return false;
    if (seenSearchQuery.trim()) {
      const q = seenSearchQuery.toLowerCase();
      const matchName = m.name.toLowerCase().includes(q);
      const matchRole = (m.familyRole || m.role || '').toLowerCase().includes(q);
      const matchRel = (m.relationship || '').toLowerCase().includes(q);
      return matchName || matchRole || matchRel;
    }
    return true;
  });

  const hasBeenReadByOthers = readers.length > 0;
  const isReadByAllOthers = otherFamilyMembers.length > 0 && readers.length >= otherFamilyMembers.length;

  return (
    <div
      data-message-id={message.id}
      className={`group relative flex gap-3 transition-all ${
        isMe ? 'flex-row-reverse' : 'flex-row'
      } ${isSameSender ? 'mt-1' : 'mt-4'}`}
    >
      {/* Sender Avatar */}
      {!isSameSender ? (
        <div
          className={`w-9 h-9 rounded-full shrink-0 flex items-center justify-center text-white text-xs font-bold shadow-xs ${sender.avatarColor}`}
          title={`${sender.name} (${sender.role})`}
        >
          {sender.name.charAt(0)}
        </div>
      ) : (
        <div className="w-9 shrink-0" />
      )}

      {/* Message Body & Actions Container */}
      <div className={`flex flex-col max-w-[85%] sm:max-w-[75%] ${isMe ? 'items-end' : 'items-start'}`}>
        
        {/* Sender Name and Time */}
        {!isSameSender && (
          <div className={`flex items-center gap-1.5 mb-1 px-1 text-xs text-slate-500 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
            <span className="font-bold text-slate-900">
              {sender.name}
            </span>
            {sender.familyRole && (
              <span className="text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-1.5 py-0.2 rounded-md">
                {sender.familyRole}
              </span>
            )}
            {sender.role && sender.role !== sender.familyRole && (
              <span className="text-[10px] text-slate-400">
                ({sender.role})
              </span>
            )}
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span className="text-[11px] text-slate-400 font-mono">
              {formatTimestamp(message.timestamp)}
            </span>
            {message.isPinned && (
              <span className="flex items-center gap-0.5 text-[10px] text-amber-600 bg-amber-50 px-1.5 py-0.2 rounded font-medium border border-amber-200/60">
                <Pin className="w-2.5 h-2.5" /> Pinned
              </span>
            )}
          </div>
        )}

        {/* Replied-to Quote Preview */}
        {message.replyTo && (
          <div
            className={`text-xs mb-1.5 p-2 rounded-xl bg-slate-200/60 border-l-2 border-slate-400 text-slate-600 max-w-md truncate ${
              isMe ? 'mr-1' : 'ml-1'
            }`}
          >
            <span className="font-semibold">{message.replyTo.senderName}: </span>
            <span>{message.replyTo.text}</span>
          </div>
        )}

        {/* Message Bubble Card */}
        <div
          onClick={() => onSelectForReaction?.(message)}
          className={`relative px-4 py-3 rounded-2xl shadow-xs transition-all cursor-pointer ${
            isSelected ? 'ring-2 ring-amber-400 ring-offset-2' : ''
          } ${
            isMe
              ? 'bg-slate-900 text-white rounded-tr-xs'
              : 'bg-white border border-slate-200/80 text-slate-800 rounded-tl-xs'
          }`}
        >
          {isSelected && (
            <div className="absolute -top-2.5 right-2 px-1.5 py-0.2 rounded bg-amber-400 text-slate-950 font-bold text-[9px] uppercase tracking-wider shadow-xs z-10">
              Selected for Reaction
            </div>
          )}

          {/* Text Content */}
          {message.content && (
            <p className="text-sm leading-relaxed whitespace-pre-wrap select-text">
              {message.content}
            </p>
          )}

          {/* Attachments: Location Check-in */}
          {message.attachments?.map((att, i) => {
            if (att.type === 'location') {
              return (
                <div
                  key={i}
                  className={`mt-2 p-2.5 rounded-xl border flex items-center gap-3 ${
                    isMe
                      ? 'bg-slate-800/80 border-slate-700 text-slate-200'
                      : 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                  }`}
                >
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-500 flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div className="text-xs">
                    <p className="font-semibold">{att.locationName || 'Checked In'}</p>
                    {att.eta && <p className="opacity-80 mt-0.5">{att.eta}</p>}
                  </div>
                </div>
              );
            }

            if (att.type === 'image' && att.url) {
              return (
                <div key={i} className="mt-2.5">
                  <div
                    onClick={() => onOpenImageLightbox(att.url!, att.caption)}
                    className="relative rounded-xl overflow-hidden cursor-pointer bg-slate-100 max-h-72 border border-slate-200/60 group/img"
                  >
                    <img
                      src={att.url}
                      alt={att.caption || 'Family snapshot'}
                      className="w-full h-auto object-cover group-hover/img:scale-102 transition-transform duration-200"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  {att.caption && (
                    <p className={`text-xs mt-1.5 italic ${isMe ? 'text-slate-300' : 'text-slate-500'}`}>
                      {att.caption}
                    </p>
                  )}
                </div>
              );
            }

            if (att.type === 'audio') {
              return (
                <div
                  key={i}
                  className={`mt-2.5 p-3 rounded-xl flex items-center gap-3 border ${
                    isMe
                      ? 'bg-slate-800/90 border-slate-700 text-white'
                      : 'bg-slate-100/90 border-slate-200 text-slate-900'
                  }`}
                >
                  <button
                    onClick={handleToggleAudio}
                    className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                      isMe
                        ? 'bg-emerald-500 hover:bg-emerald-400 text-white'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    }`}
                  >
                    {isPlayingAudio ? (
                      <Pause className="w-4 h-4 fill-white" />
                    ) : (
                      <Play className="w-4 h-4 fill-white ml-0.5" />
                    )}
                  </button>

                  <div className="flex-1 flex flex-col gap-1">
                    <div className="flex items-center gap-0.5 h-6">
                      {[12, 24, 18, 28, 14, 20, 26, 16, 22, 10, 19, 25, 14, 27, 21, 15].map((h, barIdx) => {
                        const barThreshold = (barIdx / 16) * 100;
                        const isPast = audioProgress >= barThreshold;
                        return (
                          <span
                            key={barIdx}
                            style={{ height: `${h}px` }}
                            className={`flex-1 rounded-full transition-colors ${
                              isPast
                                ? 'bg-emerald-400'
                                : isMe
                                ? 'bg-slate-600'
                                : 'bg-slate-300'
                            }`}
                          />
                        );
                      })}
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                      <span>Voice Note</span>
                      <span>{att.duration ? `00:${att.duration.toString().padStart(2, '0')}` : '00:08'}</span>
                    </div>
                  </div>
                </div>
              );
            }

            return null;
          })}

          {/* Poll Card */}
          {message.poll && (
            <div
              className={`mt-2.5 p-4 rounded-xl border ${
                isMe
                  ? 'bg-slate-800 border-slate-700 text-white'
                  : 'bg-amber-50/40 border-amber-200/80 text-slate-900'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-bold font-display">
                  📊 {message.poll.question}
                </h4>
              </div>

              <div className="space-y-2 mt-3">
                {message.poll.options.map((opt) => {
                  const totalVotes = message.poll?.options.reduce((sum, o) => sum + o.votes.length, 0) || 0;
                  const voteCount = opt.votes.length;
                  const percent = totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0;
                  const hasVotedThis = opt.votes.includes(activeMemberId);

                  return (
                    <div
                      key={opt.id}
                      onClick={() => onVotePoll(message.id, opt.id)}
                      className={`relative overflow-hidden p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                        hasVotedThis
                          ? isMe
                            ? 'border-emerald-400 bg-emerald-950/30'
                            : 'border-emerald-500 bg-emerald-50/80'
                          : isMe
                          ? 'border-slate-700 bg-slate-900/50 hover:border-slate-600'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div
                        style={{ width: `${percent}%` }}
                        className={`absolute inset-y-0 left-0 transition-all duration-300 pointer-events-none opacity-20 ${
                          isMe ? 'bg-emerald-400' : 'bg-emerald-500'
                        }`}
                      />

                      <div className="relative flex items-center justify-between z-10">
                        <span className="font-medium flex items-center gap-1.5">
                          {hasVotedThis && (
                            <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[9px] shrink-0">
                              ✓
                            </span>
                          )}
                          {opt.text}
                        </span>
                        <span className="font-mono font-semibold ml-2 shrink-0">
                          {voteCount} ({percent}%)
                        </span>
                      </div>

                      {opt.votes.length > 0 && (
                        <div className="relative flex items-center gap-1 mt-1.5 z-10">
                          {opt.votes.map((voterId) => {
                            const voter = getMember(voterId);
                            return (
                              <span
                                key={voterId}
                                className={`w-4 h-4 rounded-full flex items-center justify-center text-white text-[8px] font-bold ${voter.avatarColor}`}
                                title={voter.name}
                              >
                                {voter.name.charAt(0)}
                              </span>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Seen By / Delivery Status Bar with Search & Visual Filter */}
        <div
          className={`relative flex items-center gap-1.5 mt-1 px-1 flex-wrap ${
            isMe ? 'justify-end' : 'justify-start'
          }`}
        >
          {readers.length > 0 ? (
            <div className="relative inline-flex items-center gap-1">
              <button
                type="button"
                onClick={() => setIsSeenTooltipOpen(!isSeenTooltipOpen)}
                className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border transition-all cursor-pointer text-[10px] font-medium shadow-2xs group/seen ${
                  isSeenTooltipOpen
                    ? 'bg-emerald-100 border-emerald-300 text-emerald-900 ring-2 ring-emerald-400/30'
                    : 'bg-emerald-50/90 hover:bg-emerald-100 border-emerald-200/80 text-emerald-800'
                }`}
                title="Click to search or filter family members who have seen this message"
              >
                <Eye className="w-3.5 h-3.5 text-emerald-600 shrink-0" />

                {/* Viewer avatar circles */}
                <div className="flex -space-x-1.5 items-center">
                  {readers.slice(0, 4).map((reader) => (
                    <div
                      key={reader.id}
                      className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-white text-[8px] font-bold ring-1.5 ring-white ${reader.avatarColor}`}
                      title={`Seen by ${reader.name}`}
                    >
                      {reader.name.charAt(0)}
                    </div>
                  ))}
                  {readers.length > 4 && (
                    <span className="w-3.5 h-3.5 rounded-full bg-emerald-200 text-emerald-900 text-[8px] font-bold flex items-center justify-center ring-1.5 ring-white">
                      +{readers.length - 4}
                    </span>
                  )}
                </div>

                {/* Explicit Seen by Names list */}
                <span className="font-bold text-emerald-900 group-hover/seen:underline">
                  Seen by {readers.map((r) => (r.id === activeMemberId ? 'you' : r.name)).join(', ')}
                </span>
              </button>

              {/* Quick Search Tooltip Toggle Icon */}
              <button
                type="button"
                onClick={() => setIsSeenTooltipOpen(!isSeenTooltipOpen)}
                className={`p-1 rounded-full border text-[10px] transition-colors flex items-center justify-center ${
                  isSeenTooltipOpen
                    ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
                    : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-500 hover:text-slate-800'
                }`}
                title="Quick search who read this message"
              >
                <Search className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <div className="relative inline-flex items-center gap-1">
              <button
                type="button"
                onClick={() => setIsSeenTooltipOpen(!isSeenTooltipOpen)}
                className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-slate-700 transition-colors cursor-pointer group/del p-0.5 rounded-md hover:bg-slate-100"
                title="Delivered. Click to search family read status"
              >
                <Clock className="w-3 h-3 text-slate-400 group-hover/del:text-emerald-600" />
                <span>Delivered</span>
                <Search className="w-2.5 h-2.5 text-slate-400 ml-0.5 opacity-60 group-hover/del:opacity-100" />
              </button>
            </div>
          )}

          {/* Interactive Seen By Tooltip Popover with Visual Filter and Search Bar */}
          {isSeenTooltipOpen && (
            <div
              className={`absolute z-30 w-76 bg-white rounded-2xl border border-slate-200 shadow-xl p-3 text-slate-800 animate-in fade-in zoom-in-95 duration-150 ${
                isMe ? 'right-0 top-full mt-1.5' : 'left-0 top-full mt-1.5'
              }`}
            >
              {/* Tooltip Header */}
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                <div className="flex items-center gap-1.5">
                  <Eye className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-bold font-display text-slate-900">
                    Who has seen this message?
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsSeenTooltipOpen(false);
                    setSeenSearchQuery('');
                  }}
                  className="text-slate-400 hover:text-slate-600 p-0.5 rounded-md hover:bg-slate-100"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Real-Time Search Bar */}
              <div className="relative mb-2">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Filter by name or role (e.g. Mary, Aunt)..."
                  value={seenSearchQuery}
                  onChange={(e) => setSeenSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-7 py-1.5 text-xs bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-slate-400 text-slate-800"
                  autoFocus
                />
                {seenSearchQuery && (
                  <button
                    type="button"
                    onClick={() => setSeenSearchQuery('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Visual Filter Tabs */}
              <div className="flex items-center gap-1 mb-2 bg-slate-100/90 p-0.5 rounded-xl text-[10px]">
                <button
                  type="button"
                  onClick={() => setSeenFilterTab('all')}
                  className={`flex-1 py-1 rounded-lg font-semibold transition-all ${
                    seenFilterTab === 'all'
                      ? 'bg-white text-slate-900 shadow-2xs font-bold'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  All ({targetMembers.length})
                </button>
                <button
                  type="button"
                  onClick={() => setSeenFilterTab('read')}
                  className={`flex-1 py-1 rounded-lg font-semibold transition-all flex items-center justify-center gap-1 ${
                    seenFilterTab === 'read'
                      ? 'bg-white text-emerald-700 shadow-2xs font-bold'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <Eye className="w-3 h-3 text-emerald-600" />
                  <span>Seen ({readers.length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSeenFilterTab('unread')}
                  className={`flex-1 py-1 rounded-lg font-semibold transition-all flex items-center justify-center gap-1 ${
                    seenFilterTab === 'unread'
                      ? 'bg-white text-slate-800 shadow-2xs font-bold'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <Clock className="w-3 h-3 text-slate-400" />
                  <span>Unread ({unreadMembers.length})</span>
                </button>
              </div>

              {/* Members List with Read/Unread Status */}
              <div className="space-y-1 max-h-48 overflow-y-auto pr-0.5 custom-scrollbar">
                {filteredTooltipMembers.length === 0 ? (
                  <div className="py-4 text-center text-xs text-slate-400">
                    No family members match your filter
                  </div>
                ) : (
                  filteredTooltipMembers.map((m) => {
                    const hasRead = readByList.includes(m.id);
                    return (
                      <div
                        key={m.id}
                        className="flex items-center justify-between p-1.5 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-colors"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-[9px] font-bold shrink-0 ${m.avatarColor}`}
                          >
                            {m.name.charAt(0)}
                          </div>
                          <div className="min-w-0 truncate">
                            <p className="text-xs font-semibold text-slate-800 truncate leading-tight">
                              {m.name} {m.id === activeMemberId && '(You)'}
                            </p>
                            <p className="text-[10px] text-slate-400 truncate">
                              {m.familyRole || m.role}
                            </p>
                          </div>
                        </div>

                        {hasRead ? (
                          <span className="shrink-0 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200/60 flex items-center gap-1">
                            <Eye className="w-3 h-3 text-emerald-600" />
                            <span>Seen</span>
                          </span>
                        ) : (
                          <span className="shrink-0 text-[10px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-lg flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5 text-slate-400" />
                            <span>Not yet</span>
                          </span>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              {/* Tooltip Footer with Full Audit Button */}
              <div className="pt-2 mt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <span className="text-slate-400">
                  {readers.length} of {targetMembers.length} family read
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setIsSeenTooltipOpen(false);
                    onViewReadReceipts(message);
                  }}
                  className="font-semibold text-emerald-700 hover:text-emerald-800 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>Detailed Modal</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Clean, Intuitive Heart / Like Pill Below Bubble */}
        {message.reactions?.['❤️'] && message.reactions['❤️'].length > 0 && (
          <div className={`flex mt-1 ${isMe ? 'justify-end' : 'justify-start'}`}>
            <button
              type="button"
              onClick={() => onReact(message.id, '❤️')}
              className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs transition-all border ${
                message.reactions['❤️'].includes(activeMemberId)
                  ? 'bg-rose-50 border-rose-200 text-rose-600 font-bold shadow-2xs'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
              title={`Liked by: ${message.reactions['❤️'].map((id) => getMember(id).name).join(', ')}`}
            >
              <Heart className={`w-3.5 h-3.5 ${message.reactions['❤️'].includes(activeMemberId) ? 'fill-rose-500 text-rose-500' : 'text-slate-400'}`} />
              <span className="text-[11px] font-mono">{message.reactions['❤️'].length}</span>
            </button>
          </div>
        )}

        {/* Clean Hover Action Bar */}
        <div
          className={`absolute top-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-white border border-slate-200 rounded-xl px-1.5 py-1 shadow-md z-20 ${
            isMe ? 'right-[calc(100%+8px)]' : 'left-[calc(100%+8px)]'
          }`}
        >
          {/* 1-Click Clean Like Button */}
          <button
            type="button"
            onClick={() => onReact(message.id, '❤️')}
            className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold transition-colors ${
              message.reactions?.['❤️']?.includes(activeMemberId)
                ? 'bg-rose-50 text-rose-600 font-bold'
                : 'text-slate-600 hover:text-rose-600 hover:bg-slate-100'
            }`}
            title={message.reactions?.['❤️']?.includes(activeMemberId) ? 'Unlike' : 'Heart / Like message'}
          >
            <Heart className={`w-3.5 h-3.5 ${message.reactions?.['❤️']?.includes(activeMemberId) ? 'fill-rose-500 text-rose-500' : ''}`} />
            <span>Like</span>
          </button>

          <div className="w-px h-4 bg-slate-200 my-auto" />

          <button
            type="button"
            onClick={() => onReplyTo(message)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            title="Reply to message"
          >
            <Reply className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => onTogglePin(message.id)}
            className={`p-1.5 rounded-lg transition-colors ${
              message.isPinned
                ? 'text-amber-600 bg-amber-50'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
            }`}
            title={message.isPinned ? 'Unpin message' : 'Pin message'}
          >
            <Pin className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => onViewReadReceipts(message)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            title="View read details"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </div>
  );
};
