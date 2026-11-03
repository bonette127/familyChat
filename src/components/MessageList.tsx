import React, { useState, useRef, useEffect } from 'react';
import { Eye, X, Search, Clock, Users, Filter } from 'lucide-react';
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
  const [receiptSearchQuery, setReceiptSearchQuery] = useState('');
  const [receiptFilterTab, setReceiptFilterTab] = useState<'all' | 'read' | 'unread'>('all');

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
      {messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full py-16 text-center max-w-md mx-auto space-y-3">
          <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center text-3xl shadow-inner">
            🛋️
          </div>
          <h3 className="text-base font-bold text-slate-800 font-display">
            The Family Living Room is Clean & Ready
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            All previous clutter and mock data have been stripped out. As the Family Head, you can send the very first message below, announce a family milestone, or register members to join your private circle.
          </p>
          <div className="pt-2 flex items-center gap-2 text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-3 py-1.5 rounded-xl font-semibold">
            <span>👑 Admin Space • Ready for Testing</span>
          </div>
        </div>
      ) : (
        messages.map((msg, index) => {
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
        })
      )}
      <div ref={bottomRef} />

      {/* Read Receipts Detail Modal */}
      {selectedReadReceiptsMsg && (() => {
        const readIds = selectedReadReceiptsMsg.readBy || [];
        const readMembers = members.filter((m) => readIds.includes(m.id));
        const unreadMembers = members.filter((m) => !readIds.includes(m.id));
        const readPercentage = members.length > 0 ? Math.round((readMembers.length / members.length) * 100) : 0;

        const filteredMembers = members.filter((m) => {
          const isRead = readIds.includes(m.id);
          if (receiptFilterTab === 'read' && !isRead) return false;
          if (receiptFilterTab === 'unread' && isRead) return false;
          if (receiptSearchQuery.trim()) {
            const q = receiptSearchQuery.toLowerCase();
            const matchName = m.name.toLowerCase().includes(q);
            const matchRole = (m.familyRole || m.role || '').toLowerCase().includes(q);
            const matchRel = (m.relationship || '').toLowerCase().includes(q);
            return matchName || matchRole || matchRel;
          }
          return true;
        });

        return (
          <div
            onClick={() => {
              setSelectedReadReceiptsMsg(null);
              setReceiptSearchQuery('');
              setReceiptFilterTab('all');
            }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-150"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-2xl p-5"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <Eye className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 font-display">
                      Message Read Receipts
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Family message delivery and view audit
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setSelectedReadReceiptsMsg(null);
                    setReceiptSearchQuery('');
                    setReceiptFilterTab('all');
                  }}
                  className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Message Snippet Preview */}
              <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-2xl italic mb-3.5 border border-slate-100 line-clamp-2">
                "{selectedReadReceiptsMsg.content || 'Attachment / Voice note'}"
              </div>

              {/* Read Progress Bar */}
              <div className="mb-3.5 p-3 rounded-2xl bg-emerald-50/60 border border-emerald-100">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-semibold text-emerald-950 flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Family Read Rate</span>
                  </span>
                  <span className="font-bold text-emerald-800 font-mono">
                    {readMembers.length} of {members.length} ({readPercentage}%)
                  </span>
                </div>
                <div className="w-full h-2 bg-emerald-200/50 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                    style={{ width: `${readPercentage}%` }}
                  />
                </div>
              </div>

              {/* Search Bar */}
              <div className="relative mb-2.5">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Filter member by name or role (e.g. Aunt, Mary)..."
                  value={receiptSearchQuery}
                  onChange={(e) => setReceiptSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-8 py-2 text-xs bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-800 placeholder:text-slate-400"
                  autoFocus
                />
                {receiptSearchQuery && (
                  <button
                    type="button"
                    onClick={() => setReceiptSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Visual Filter Tabs */}
              <div className="flex items-center gap-1.5 mb-3 bg-slate-100/80 p-1 rounded-xl text-xs">
                <button
                  type="button"
                  onClick={() => setReceiptFilterTab('all')}
                  className={`flex-1 py-1.5 rounded-lg font-semibold transition-all ${
                    receiptFilterTab === 'all'
                      ? 'bg-white text-slate-900 shadow-2xs font-bold'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  All ({members.length})
                </button>
                <button
                  type="button"
                  onClick={() => setReceiptFilterTab('read')}
                  className={`flex-1 py-1.5 rounded-lg font-semibold transition-all flex items-center justify-center gap-1 ${
                    receiptFilterTab === 'read'
                      ? 'bg-white text-emerald-700 shadow-2xs font-bold'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Seen ({readMembers.length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setReceiptFilterTab('unread')}
                  className={`flex-1 py-1.5 rounded-lg font-semibold transition-all flex items-center justify-center gap-1 ${
                    receiptFilterTab === 'unread'
                      ? 'bg-white text-slate-800 shadow-2xs font-bold'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Not Read ({unreadMembers.length})</span>
                </button>
              </div>

              {/* Filtered Members List */}
              <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1 custom-scrollbar">
                {filteredMembers.length === 0 ? (
                  <div className="py-6 text-center text-xs text-slate-400">
                    No family member matches your search filter
                  </div>
                ) : (
                  filteredMembers.map((m) => {
                    const hasRead = readIds.includes(m.id);
                    const isAuthor = m.id === selectedReadReceiptsMsg.senderId;

                    return (
                      <div
                        key={m.id}
                        className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-white hover:border-slate-200 transition-colors"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 ${m.avatarColor}`}
                          >
                            {m.name.charAt(0)}
                          </div>
                          <div className="min-w-0 truncate">
                            <p className="text-xs font-bold text-slate-900 truncate">
                              {m.name} {m.id === activeMemberId && '(You)'}
                            </p>
                            <p className="text-[10px] text-slate-400 truncate">
                              {m.familyRole || m.role} • {m.relationship || 'Lineage Member'}
                            </p>
                          </div>
                        </div>

                        {hasRead ? (
                          <span className="shrink-0 text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200/60 font-semibold px-2 py-0.5 rounded-lg flex items-center gap-1">
                            <Eye className="w-3.5 h-3.5 text-emerald-600" />
                            {isAuthor ? 'Author' : 'Seen'}
                          </span>
                        ) : (
                          <span className="shrink-0 text-[10px] text-slate-500 bg-slate-100 font-medium px-2 py-0.5 rounded-lg flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-400" />
                            <span>Not yet</span>
                          </span>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              {/* Close Button */}
              <button
                onClick={() => {
                  setSelectedReadReceiptsMsg(null);
                  setReceiptSearchQuery('');
                  setReceiptFilterTab('all');
                }}
                className="w-full mt-4 py-2.5 bg-slate-900 text-white rounded-2xl text-xs font-semibold hover:bg-slate-800 transition-colors shadow-xs"
              >
                Close Audit View
              </button>
            </div>
          </div>
        );
      })()}
    </div>
  );
};
