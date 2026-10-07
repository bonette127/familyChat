import React, { useState, useRef, useEffect } from 'react';
import { CheckCheck, X } from 'lucide-react';
import { FamilyMember, Message } from '../types/family';
import { MessageItem } from './MessageItem';

interface MessageListProps {
  messages: Message[];
  members: FamilyMember[];
  activeMemberId: string;
  selectedMessageId?: string | null;
  onSelectMessage?: (message: Message) => void;
  onReact: (messageId: string, emoji: string) => void;
  onVotePoll: (messageId: string, optionId: string) => void;
  onTogglePin: (messageId: string) => void;
  onReplyTo: (message: Message) => void;
  onOpenImageLightbox: (url: string, caption?: string) => void;
  onMarkAsRead: (messageIds: string[]) => void;
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  members,
  activeMemberId,
  selectedMessageId,
  onSelectMessage,
  onReact,
  onVotePoll,
  onTogglePin,
  onReplyTo,
  onOpenImageLightbox,
  onMarkAsRead,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [selectedReadReceiptsMsg, setSelectedReadReceiptsMsg] = useState<Message | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  // IntersectionObserver to mark messages as read when they appear in the viewport
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const newlyReadIds: string[] = [];

        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.2) {
            const messageId = entry.target.getAttribute('data-message-id');
            if (messageId) {
              const msg = messages.find((m) => m.id === messageId);
              // If current active member hasn't read it yet, mark as read
              if (msg && (!msg.readBy || !msg.readBy.includes(activeMemberId))) {
                newlyReadIds.push(messageId);
              }
            }
          }
        });

        if (newlyReadIds.length > 0) {
          onMarkAsRead(newlyReadIds);
        }
      },
      {
        root: container,
        threshold: [0.2, 0.5],
      }
    );

    const elements = container.querySelectorAll('[data-message-id]');
    elements.forEach((el) => observer.observe(el));

    return () => {
      observer.disconnect();
    };
  }, [messages, activeMemberId, onMarkAsRead]);

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

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 space-y-4 bg-slate-50/50"
    >
      {messages.map((msg, index) => {
        const prevMsg = messages[index - 1];
        const isSameSender = prevMsg ? prevMsg.senderId === msg.senderId : false;

        return (
          <MessageItem
            key={msg.id}
            message={msg}
            members={members}
            activeMemberId={activeMemberId}
            isSameSender={isSameSender}
            isSelected={selectedMessageId === msg.id}
            onSelectForReaction={onSelectMessage}
            onReact={onReact}
            onVotePoll={onVotePoll}
            onTogglePin={onTogglePin}
            onReplyTo={onReplyTo}
            onOpenImageLightbox={onOpenImageLightbox}
            onViewReadReceipts={setSelectedReadReceiptsMsg}
          />
        );
      })}
      <div ref={bottomRef} />

      {/* Read Receipts Detail Modal */}
      {selectedReadReceiptsMsg && (
        <div
          onClick={() => setSelectedReadReceiptsMsg(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-150"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm bg-white rounded-3xl border border-slate-200 shadow-2xl p-5"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <div className="flex items-center gap-2">
                <CheckCheck className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-900 font-display">
                  Message Read Receipts
                </h3>
              </div>
              <button
                onClick={() => setSelectedReadReceiptsMsg(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500 bg-slate-50 p-2.5 rounded-xl italic mb-4 border border-slate-100 line-clamp-2">
              "{selectedReadReceiptsMsg.content || 'Attachment / Voice note'}"
            </p>

            <div className="space-y-3">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Read by ({((selectedReadReceiptsMsg.readBy || []).filter(id => id !== selectedReadReceiptsMsg.senderId)).length} family members):
                </p>
                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {(selectedReadReceiptsMsg.readBy || []).map((memberId) => {
                    const m = getMember(memberId);
                    const isAuthor = memberId === selectedReadReceiptsMsg.senderId;

                    return (
                      <div
                        key={memberId}
                        className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100"
                      >
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold ${m.avatarColor}`}
                          >
                            {m.name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-slate-800">
                              {m.name} {memberId === activeMemberId && '(You)'}
                            </p>
                            <p className="text-[10px] text-slate-400">
                              {m.role}
                            </p>
                          </div>
                        </div>

                        <span className="text-[10px] text-emerald-600 font-medium flex items-center gap-1">
                          <CheckCheck className="w-3 h-3" />
                          {isAuthor ? 'Author' : 'Read'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Members who haven't read yet */}
              {(() => {
                const unreadMembers = members.filter(
                  (m) => !(selectedReadReceiptsMsg.readBy || []).includes(m.id)
                );
                if (unreadMembers.length === 0) return null;

                return (
                  <div className="pt-2 border-t border-slate-100">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                      Not yet read ({unreadMembers.length}):
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {unreadMembers.map((m) => (
                        <span
                          key={m.id}
                          className="text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-lg flex items-center gap-1"
                        >
                          <span className={`w-2 h-2 rounded-full ${m.avatarColor}`} />
                          {m.name.split(' ')[0]}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>

            <button
              onClick={() => setSelectedReadReceiptsMsg(null)}
              className="w-full mt-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
