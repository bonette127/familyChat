import React, { useState } from 'react';
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
  Eye
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
          <div className={`flex items-center gap-2 mb-1 px-1 text-xs text-slate-500 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
            <span className="font-semibold text-slate-800">
              {sender.name}
            </span>
            <span className="text-[11px] text-slate-400">
              {sender.role}
            </span>
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

        {/* Small 'read' status row (checkmarks + list of avatars) */}
        <div
          className={`flex items-center gap-1.5 mt-1 px-1 select-none transition-opacity ${
            isMe ? 'justify-end' : 'justify-start'
          }`}
        >
          {isMe ? (
            // Sent by active member
            <button
              type="button"
              onClick={() => onViewReadReceipts(message)}
              className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 transition-colors group/readstatus"
              title={
                hasBeenReadByOthers
                  ? `Read by: ${readers.map((r) => r.name).join(', ')}`
                  : 'Delivered (Not yet read by others)'
              }
            >
              {hasBeenReadByOthers ? (
                <>
                  {/* Small double checkmark */}
                  <span className="flex items-center text-emerald-600">
                    <CheckCheck className="w-3.5 h-3.5" />
                  </span>

                  {/* List of avatars of family members who read it */}
                  <div className="flex -space-x-1.5 items-center">
                    {readers.slice(0, 4).map((reader) => (
                      <div
                        key={reader.id}
                        className={`w-4 h-4 rounded-full flex items-center justify-center text-white text-[8px] font-bold ring-1.5 ring-white shadow-2xs ${reader.avatarColor}`}
                        title={`Read by ${reader.name}`}
                      >
                        {reader.name.charAt(0)}
                      </div>
                    ))}
                    {readers.length > 4 && (
                      <span className="w-4 h-4 rounded-full bg-slate-200 text-slate-700 text-[8px] font-bold flex items-center justify-center ring-1.5 ring-white">
                        +{readers.length - 4}
                      </span>
                    )}
                  </div>

                  <span className="text-[10px] text-slate-400 group-hover/readstatus:text-slate-600 group-hover/readstatus:underline font-medium">
                    {isReadByAllOthers
                      ? 'Read by all'
                      : `Read by ${readers.map((r) => r.name.split(' ')[0]).join(', ')}`}
                  </span>
                </>
              ) : (
                <>
                  <Check className="w-3 h-3 text-slate-400" />
                  <span className="text-[10px] text-slate-400">Delivered</span>
                </>
              )}
            </button>
          ) : (
            // Received from another family member
            <button
              type="button"
              onClick={() => onViewReadReceipts(message)}
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-600 transition-colors group/readstatus"
              title={hasBeenReadByOthers ? `Seen by: ${readers.map((r) => r.name).join(', ')}` : 'Delivered to family'}
            >
              {hasBeenReadByOthers ? (
                <>
                  <span className="flex items-center text-emerald-600">
                    <CheckCheck className="w-3.5 h-3.5" />
                  </span>
                  {/* List of avatars of members who read this message */}
                  <div className="flex -space-x-1 items-center">
                    {readers.slice(0, 4).map((reader) => (
                      <div
                        key={reader.id}
                        className={`w-4 h-4 rounded-full flex items-center justify-center text-white text-[8px] font-bold ring-1.5 ring-white shadow-2xs ${reader.avatarColor}`}
                        title={`Seen by ${reader.name}`}
                      >
                        {reader.name.charAt(0)}
                      </div>
                    ))}
                    {readers.length > 4 && (
                      <span className="w-4 h-4 rounded-full bg-slate-200 text-slate-700 text-[8px] font-bold flex items-center justify-center ring-1.5 ring-white">
                        +{readers.length - 4}
                      </span>
                    )}
                  </div>

                  <span className="text-[10px] text-slate-400 group-hover/readstatus:underline">
                    Seen by {readers.map((r) => r.id === activeMemberId ? 'you' : r.name.split(' ')[0]).join(', ')}
                  </span>
                </>
              ) : (
                <>
                  <Check className="w-3 h-3 text-slate-400" />
                  <span className="text-[10px] text-slate-400">Delivered</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* Reactions Bar Below Bubble */}
        {Object.keys(message.reactions).length > 0 && (
          <div className={`flex flex-wrap gap-1 mt-1 ${isMe ? 'justify-end' : 'justify-start'}`}>
            {Object.entries(message.reactions).map(([emoji, memberIds]) => {
              if (memberIds.length === 0) return null;
              const hasMyReact = memberIds.includes(activeMemberId);
              return (
                <button
                  key={emoji}
                  onClick={() => onReact(message.id, emoji)}
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
          {/* Quick React Direct Common Family Emojis (No menu needed) */}
          <div className="flex items-center gap-0.5 border-r border-slate-200 pr-1 mr-0.5">
            {['❤️', '😂', '👍', '🎉'].map((emoji) => {
              const hasReacted = message.reactions[emoji]?.includes(activeMemberId);
              return (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => onReact(message.id, emoji)}
                  className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs transition-transform hover:scale-130 active:scale-90 ${
                    hasReacted ? 'bg-amber-100 font-bold scale-110' : 'hover:bg-slate-100'
                  }`}
                  title={`Quick React: ${emoji}`}
                >
                  {emoji}
                </button>
              );
            })}
          </div>

          {/* Quick React Select Button */}
          {onSelectForReaction && (
            <button
              onClick={() => onSelectForReaction(message)}
              className={`p-1 rounded-md transition-colors ${
                isSelected
                  ? 'text-amber-600 bg-amber-50 font-bold'
                  : 'text-slate-500 hover:text-amber-600 hover:bg-slate-100'
              }`}
              title={isSelected ? 'Selected for quick reaction bar' : 'Select message for input reaction bar'}
            >
              <Heart className="w-3.5 h-3.5" />
            </button>
          )}

          {/* More Emojis Trigger */}
          <div className="relative">
            <button
              onClick={() => setShowReactionMenu(!showReactionMenu)}
              className="p-1 rounded-md text-slate-500 hover:text-amber-500 hover:bg-slate-100 transition-colors"
              title="More emojis"
            >
              <Smile className="w-3.5 h-3.5" />
            </button>

            {showReactionMenu && (
              <div className="absolute bottom-full mb-1 left-0 bg-white border border-slate-200 rounded-2xl p-1.5 shadow-xl flex items-center gap-1 z-30">
                {quickReactions.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => {
                      onReact(message.id, emoji);
                      setShowReactionMenu(false);
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
            onClick={() => onReplyTo(message)}
            className="p-1 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            title="Reply"
          >
            <Reply className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => onTogglePin(message.id)}
            className={`p-1 rounded-md transition-colors ${
              message.isPinned
                ? 'text-amber-600 bg-amber-50'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
            }`}
            title={message.isPinned ? 'Unpin message' : 'Pin message'}
          >
            <Pin className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => onViewReadReceipts(message)}
            className="p-1 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            title="View read details"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </div>
  );
};
