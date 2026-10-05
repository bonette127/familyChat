import React, { useState, useRef, useEffect } from 'react';
import { 
  Heart, 
  Smile, 
  Pin, 
  Reply, 
  MapPin, 
  Play, 
  Pause, 
  Check, 
  CheckCheck, 
  MoreVertical,
  ChevronDown
} from 'lucide-react';
import { Attachment, FamilyMember, Message, PollData } from '../types/family';

interface MessageListProps {
  messages: Message[];
  members: FamilyMember[];
  activeMemberId: string;
  onReact: (messageId: string, emoji: string) => void;
  onVotePoll: (messageId: string, optionId: string) => void;
  onTogglePin: (messageId: string) => void;
  onReplyTo: (message: Message) => void;
  onOpenImageLightbox: (url: string, caption?: string) => void;
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  members,
  activeMemberId,
  onReact,
  onVotePoll,
  onTogglePin,
  onReplyTo,
  onOpenImageLightbox,
}) => {
  const bottomRef = useRef<HTMLDivElement>(null);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [audioProgress, setAudioProgress] = useState<Record<string, number>>({});
  const [activeReactionMenuMsgId, setActiveReactionMenuMsgId] = useState<string | null>(null);

  const quickReactions = ['❤️', '👍', '😂', '🍲', '🎉', '🙏', '🐶', '👏'];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

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
      }
    );
  };

  const formatTimestamp = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return 'Just now';
    }
  };

  const handleToggleAudio = (msgId: string) => {
    if (playingAudioId === msgId) {
      setPlayingAudioId(null);
    } else {
      setPlayingAudioId(msgId);
      // Simulate playback progress
      let p = 0;
      const interval = setInterval(() => {
        p += 10;
        setAudioProgress((prev) => ({ ...prev, [msgId]: p }));
        if (p >= 100) {
          clearInterval(interval);
          setPlayingAudioId(null);
          setAudioProgress((prev) => ({ ...prev, [msgId]: 0 }));
        }
      }, 300);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 space-y-5 bg-slate-50/50">
      {messages.map((msg, index) => {
        const sender = getMember(msg.senderId);
        const isMe = msg.senderId === activeMemberId;
        const prevMsg = messages[index - 1];
        const isSameSender = prevMsg && prevMsg.senderId === msg.senderId;

        return (
          <div
            key={msg.id}
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
                <div className={`flex items-center gap-2 mb-1 px-1 text-xs text-slate-500 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                  <span className="font-semibold text-slate-800">
                    {sender.name}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {sender.role}
                  </span>
                  <span aria-hidden="true" className="text-slate-300">·</span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {formatTimestamp(msg.timestamp)}
                  </span>
                  {msg.isPinned && (
                    <span className="flex items-center gap-0.5 text-[10px] text-amber-600 bg-amber-50 px-1.5 py-0.2 rounded font-medium border border-amber-200/60">
                      <Pin className="w-2.5 h-2.5" /> Pinned
                    </span>
                  )}
                </div>
              )}

              {/* Replied-to Quote Preview */}
              {msg.replyTo && (
                <div
                  className={`text-xs mb-1.5 p-2 rounded-xl bg-slate-200/60 border-l-2 border-slate-400 text-slate-600 max-w-md truncate ${
                    isMe ? 'mr-1' : 'ml-1'
                  }`}
                >
                  <span className="font-semibold">{msg.replyTo.senderName}: </span>
                  <span>{msg.replyTo.text}</span>
                </div>
              )}

              {/* Message Bubble Card */}
              <div
                className={`relative px-4 py-3 rounded-2xl shadow-xs transition-all ${
                  isMe
                    ? 'bg-slate-900 text-white rounded-tr-xs'
                    : 'bg-white border border-slate-200/80 text-slate-800 rounded-tl-xs'
                }`}
              >
                {/* Text Content */}
                {msg.content && (
                  <p className="text-sm leading-relaxed whitespace-pre-wrap select-text">
                    {msg.content}
                  </p>
                )}

                {/* Attachments: Location Check-in */}
                {msg.attachments?.map((att, i) => {
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
                    const isThisPlaying = playingAudioId === msg.id;
                    const progress = audioProgress[msg.id] || 0;

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
                          onClick={() => handleToggleAudio(msg.id)}
                          className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                            isMe
                              ? 'bg-emerald-500 hover:bg-emerald-400 text-white'
                              : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                          }`}
                        >
                          {isThisPlaying ? (
                            <Pause className="w-4 h-4 fill-white" />
                          ) : (
                            <Play className="w-4 h-4 fill-white ml-0.5" />
                          )}
                        </button>

                        <div className="flex-1 flex flex-col gap-1">
                          {/* Animated Waveform Bars */}
                          <div className="flex items-center gap-0.5 h-6">
                            {[12, 24, 18, 28, 14, 20, 26, 16, 22, 10, 19, 25, 14, 27, 21, 15].map((h, barIdx) => {
                              const barThreshold = (barIdx / 16) * 100;
                              const isPast = progress >= barThreshold;
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
                {msg.poll && (
                  <div
                    className={`mt-2.5 p-4 rounded-xl border ${
                      isMe
                        ? 'bg-slate-800 border-slate-700 text-white'
                        : 'bg-amber-50/40 border-amber-200/80 text-slate-900'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-bold font-display">
                        📊 {msg.poll.question}
                      </h4>
                    </div>

                    <div className="space-y-2 mt-3">
                      {msg.poll.options.map((opt) => {
                        const totalVotes = msg.poll?.options.reduce((sum, o) => sum + o.votes.length, 0) || 0;
                        const voteCount = opt.votes.length;
                        const percent = totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0;
                        const hasVotedThis = opt.votes.includes(activeMemberId);

                        return (
                          <div
                            key={opt.id}
                            onClick={() => onVotePoll(msg.id, opt.id)}
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
                            {/* Percentage fill bar */}
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

                            {/* Avatars of family members who voted */}
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

              {/* Reactions Bar Below Bubble */}
              {Object.keys(msg.reactions).length > 0 && (
                <div className={`flex flex-wrap gap-1 mt-1.5 ${isMe ? 'justify-end' : 'justify-start'}`}>
                  {Object.entries(msg.reactions).map(([emoji, memberIds]) => {
                    if (memberIds.length === 0) return null;
                    const hasMyReact = memberIds.includes(activeMemberId);
                    return (
                      <button
                        key={emoji}
                        onClick={() => onReact(msg.id, emoji)}
                        className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs transition-colors border ${
                          hasMyReact
                            ? 'bg-amber-100 border-amber-300 text-amber-900 font-semibold shadow-xs'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                        title={memberIds.map((m) => getMember(m).name).join(', ')}
                      >
                        <span>{emoji}</span>
                        <span className="text-[10px] font-mono">{memberIds.length}</span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Hover Floating Action Bar */}
              <div
                className={`absolute top-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-white border border-slate-200 rounded-xl px-2 py-1 shadow-md z-20 ${
                  isMe ? 'right-[calc(100%+8px)]' : 'left-[calc(100%+8px)]'
                }`}
              >
                {/* Quick Emoji Trigger */}
                <div className="relative">
                  <button
                    onClick={() =>
                      setActiveReactionMenuMsgId(
                        activeReactionMenuMsgId === msg.id ? null : msg.id
                      )
                    }
                    className="p-1 rounded-md text-slate-500 hover:text-amber-500 hover:bg-slate-100 transition-colors"
                    title="Add reaction"
                  >
                    <Smile className="w-3.5 h-3.5" />
                  </button>

                  {/* Reaction Popover */}
                  {activeReactionMenuMsgId === msg.id && (
                    <div className="absolute bottom-full mb-1 left-0 bg-white border border-slate-200 rounded-2xl p-1.5 shadow-xl flex items-center gap-1 z-30">
                      {quickReactions.map((emoji) => (
                        <button
                          key={emoji}
                          onClick={() => {
                            onReact(msg.id, emoji);
                            setActiveReactionMenuMsgId(null);
                          }}
                          className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center text-sm transition-transform hover:scale-125"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  onClick={() => onReplyTo(msg)}
                  className="p-1 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                  title="Reply"
                >
                  <Reply className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => onTogglePin(msg.id)}
                  className={`p-1 rounded-md transition-colors ${
                    msg.isPinned
                      ? 'text-amber-600 bg-amber-50'
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                  title={msg.isPinned ? 'Unpin message' : 'Pin message'}
                >
                  <Pin className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>
          </div>
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
};
