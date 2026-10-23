import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Heart, Send, MapPin, Smile, Clock } from 'lucide-react';
import { FamilyMember, FamilyStatusUpdate } from '../types/family';

interface StatusViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  statusUpdates: FamilyStatusUpdate[];
  initialStatusId?: string;
  members: FamilyMember[];
  activeMember: FamilyMember;
  onReplyInChat: (text: string) => void;
  onLikeStatus?: (statusId: string) => void;
}

export const StatusViewerModal: React.FC<StatusViewerModalProps> = ({
  isOpen,
  onClose,
  statusUpdates,
  initialStatusId,
  members,
  activeMember,
  onReplyInChat,
  onLikeStatus,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [replyText, setReplyText] = useState('');
  const [hasLiked, setHasLiked] = useState(false);

  useEffect(() => {
    if (initialStatusId && statusUpdates.length > 0) {
      const idx = statusUpdates.findIndex((s) => s.id === initialStatusId);
      if (idx !== -1) setCurrentIndex(idx);
    } else {
      setCurrentIndex(0);
    }
  }, [initialStatusId, statusUpdates, isOpen]);

  if (!isOpen || statusUpdates.length === 0) return null;

  const currentStatus = statusUpdates[currentIndex] || statusUpdates[0];
  const author = members.find((m) => m.id === currentStatus.memberId);

  const handleNext = () => {
    if (currentIndex < statusUpdates.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setHasLiked(false);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setHasLiked(false);
    }
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    onReplyInChat(
      `💬 **Replying to ${currentStatus.memberName}'s Status:** "${currentStatus.text}"\n> ${replyText.trim()}`
    );
    setReplyText('');
    onClose();
  };

  const handleToggleLike = () => {
    setHasLiked(!hasLiked);
    if (onLikeStatus) onLikeStatus(currentStatus.id);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col text-white max-h-[92vh]">
        
        {/* Top Progress Bars */}
        <div className="px-4 pt-3 pb-2 flex gap-1.5 items-center">
          {statusUpdates.map((s, idx) => (
            <div
              key={s.id}
              className="h-1 flex-1 rounded-full bg-slate-800 overflow-hidden"
            >
              <div
                className={`h-full transition-all duration-300 ${
                  idx < currentIndex
                    ? 'w-full bg-emerald-400'
                    : idx === currentIndex
                    ? 'w-full bg-white'
                    : 'w-0'
                }`}
              />
            </div>
          ))}
        </div>

        {/* Header Bar */}
        <div className="px-4 py-2 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold ${currentStatus.avatarColor}`}>
              {currentStatus.memberName.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-white font-display">
                  {currentStatus.memberName}
                </span>
                <span className="text-base">{currentStatus.moodEmoji}</span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                <Clock className="w-3 h-3 text-slate-400" />
                <span>{currentStatus.formattedTime}</span>
                {currentStatus.location && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-0.5 text-emerald-400">
                      <MapPin className="w-3 h-3" />
                      <span>{currentStatus.location}</span>
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Status Content Canvas */}
        <div className="relative flex-1 min-h-[340px] max-h-[460px] flex items-center justify-center bg-gradient-to-b from-slate-900 via-slate-850 to-slate-950 p-6 overflow-hidden">
          {/* If there is an image */}
          {currentStatus.mediaUrl ? (
            <div className="relative w-full h-full flex flex-col items-center justify-center">
              <img
                src={currentStatus.mediaUrl}
                alt={currentStatus.text}
                className="max-h-[300px] w-full object-cover rounded-2xl shadow-lg border border-slate-700/60"
                referrerPolicy="no-referrer"
              />
              <div className="mt-4 p-3 rounded-2xl bg-slate-900/90 border border-slate-800 w-full text-center">
                <p className="text-sm font-medium text-slate-100">
                  {currentStatus.text}
                </p>
              </div>
            </div>
          ) : (
            /* Text-based rich status card */
            <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-900/40 via-emerald-900/30 to-slate-900 border border-emerald-500/20 text-center space-y-4 shadow-xl max-w-sm w-full">
              <span className="text-5xl block animate-bounce">{currentStatus.moodEmoji}</span>
              <p className="text-lg font-semibold text-white font-display leading-relaxed">
                "{currentStatus.text}"
              </p>
              {author?.role && (
                <span className="text-xs text-emerald-300/80 font-mono block">
                  {author.role} • {author.familyUnitName || 'Central'}
                </span>
              )}
            </div>
          )}

          {/* Left / Right Arrow navigation overlays */}
          {currentIndex > 0 && (
            <button
              onClick={handlePrev}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-slate-900/70 hover:bg-slate-800 text-white flex items-center justify-center transition-all border border-slate-700"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}

          <button
            onClick={handleNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-slate-900/70 hover:bg-slate-800 text-white flex items-center justify-center transition-all border border-slate-700"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Footer: Quick Reply into Family Chat */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/95 space-y-3">
          <form onSubmit={handleSendReply} className="flex items-center gap-2">
            <input
              type="text"
              placeholder={`Reply to ${currentStatus.memberName}...`}
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              className="flex-1 px-3.5 py-2.5 rounded-2xl bg-slate-800 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />

            <button
              type="button"
              onClick={handleToggleLike}
              className={`p-2.5 rounded-2xl border transition-all ${
                hasLiked
                  ? 'bg-rose-500/20 border-rose-500/50 text-rose-400'
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
              }`}
              title="React with Love"
            >
              <Heart className={`w-4 h-4 ${hasLiked ? 'fill-rose-400' : ''}`} />
            </button>

            <button
              type="submit"
              disabled={!replyText.trim()}
              className="px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors shadow-2xs"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send</span>
            </button>
          </form>

          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>{currentIndex + 1} of {statusUpdates.length} updates</span>
            <span>Family Status Stories</span>
          </div>
        </div>

      </div>
    </div>
  );
};
