import React, { useState } from 'react';
import { X, Sparkles, Send, Check, Heart, Smile, MapPin, Clock } from 'lucide-react';
import { FamilyMember } from '../types/family';

interface DailyCheckInModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeMember: FamilyMember;
  onSaveCheckIn: (
    memberId: string,
    moodEmoji: string,
    shortStatus: string,
    note?: string,
    shareToChat?: boolean
  ) => void;
}

export const DailyCheckInModal: React.FC<DailyCheckInModalProps> = ({
  isOpen,
  onClose,
  activeMember,
  onSaveCheckIn,
}) => {
  const [selectedEmoji, setSelectedEmoji] = useState(activeMember.moodEmoji || '😊');
  const [selectedStatus, setSelectedStatus] = useState(activeMember.shortStatus || 'At Home');
  const [customStatus, setCustomStatus] = useState('');
  const [note, setNote] = useState('');
  const [shareToChat, setShareToChat] = useState(true);

  if (!isOpen) return null;

  const moodPresets = [
    { emoji: '😊', label: 'Grateful' },
    { emoji: '☕', label: 'Cozy' },
    { emoji: '🌿', label: 'Peaceful' },
    { emoji: '💻', label: 'Productive' },
    { emoji: '🚗', label: 'On the Go' },
    { emoji: '🥳', label: 'Celebrating' },
    { emoji: '😴', label: 'Resting' },
    { emoji: '🍲', label: 'Cooking' },
    { emoji: '❤️', label: 'Loving' },
    { emoji: '✨', label: 'Inspired' },
  ];

  // Specific statuses requested by user: 'At Home', 'Commuting', 'Busy'
  const primaryStatuses = [
    { label: 'At Home', icon: '🏡', description: 'Safe & cozy inside' },
    { label: 'Commuting', icon: '🚗', description: 'On the road / transit' },
    { label: 'Busy', icon: '⏳', description: 'Occupied, will reply soon' },
  ];

  const secondaryStatuses = [
    { label: 'At Work', icon: '💼' },
    { label: 'Studying', icon: '📚' },
    { label: 'Resting', icon: '🛋️' },
    { label: 'Exercising', icon: '🏃' },
    { label: 'Out & About', icon: '🛍️' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalStatus = customStatus.trim() ? customStatus.trim() : selectedStatus;
    onSaveCheckIn(
      activeMember.id,
      selectedEmoji,
      finalStatus,
      note.trim() || undefined,
      shareToChat
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-amber-500/10 via-rose-500/5 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-700 flex items-center justify-center text-xl shadow-2xs">
              ☀️
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 font-display flex items-center gap-2">
                <span>Daily Family Check-in</span>
              </h3>
              <p className="text-xs text-slate-500">
                Let relatives know how you're doing and where you're at today
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Form Content */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6">
          
          {/* Member Identity & Live Preview Pill */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm ${activeMember.avatarColor}`}>
                {activeMember.name.charAt(0)}
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium">Checking in as</p>
                <p className="text-sm font-bold text-slate-900">
                  {activeMember.name} <span className="text-xs text-slate-500 font-normal">({activeMember.role})</span>
                </p>
              </div>
            </div>

            {/* Live member list badge preview */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
              <span className="text-base">{selectedEmoji}</span>
              <span className="text-xs font-semibold text-slate-800">
                {customStatus.trim() || selectedStatus}
              </span>
            </div>
          </div>

          {/* 1. Pick Mood Emoji */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2">
              1. Choose Today's Mood
            </label>
            <div className="grid grid-cols-5 gap-2">
              {moodPresets.map((m) => {
                const isSelected = selectedEmoji === m.emoji;
                return (
                  <button
                    key={m.emoji}
                    type="button"
                    onClick={() => setSelectedEmoji(m.emoji)}
                    className={`p-2.5 rounded-2xl border text-center transition-all flex flex-col items-center justify-center ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50/80 ring-2 ring-emerald-200 scale-105 shadow-2xs'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 bg-white'
                    }`}
                  >
                    <span className="text-2xl mb-1">{m.emoji}</span>
                    <span className={`text-[10px] font-medium truncate w-full ${isSelected ? 'text-emerald-800 font-bold' : 'text-slate-500'}`}>
                      {m.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Choose Short Status (At Home, Commuting, Busy) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                2. Select Short Status
              </label>
              <span className="text-[11px] text-slate-400">Appears next to your name</span>
            </div>

            {/* Primary requested statuses */}
            <div className="grid grid-cols-3 gap-2.5 mb-2.5">
              {primaryStatuses.map((s) => {
                const isSelected = selectedStatus === s.label && !customStatus;
                return (
                  <button
                    key={s.label}
                    type="button"
                    onClick={() => {
                      setSelectedStatus(s.label);
                      setCustomStatus('');
                    }}
                    className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'border-slate-900 bg-slate-900 text-white shadow-xs scale-[1.02]'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 text-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <span className="text-lg">{s.icon}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                    </div>
                    <div>
                      <p className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                        {s.label}
                      </p>
                      <p className={`text-[10px] mt-0.5 leading-tight ${isSelected ? 'text-slate-300' : 'text-slate-400'}`}>
                        {s.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Secondary helpful status tags */}
            <div className="flex flex-wrap gap-1.5 mb-3">
              {secondaryStatuses.map((s) => (
                <button
                  key={s.label}
                  type="button"
                  onClick={() => {
                    setSelectedStatus(s.label);
                    setCustomStatus('');
                  }}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-medium transition-colors flex items-center gap-1.5 ${
                    selectedStatus === s.label && !customStatus
                      ? 'border-slate-900 bg-slate-900 text-white'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span>{s.icon}</span>
                  <span>{s.label}</span>
                </button>
              ))}
            </div>

            {/* Custom status input */}
            <div className="relative">
              <input
                type="text"
                placeholder="Or type a custom short status (e.g. 'Walking Buster', 'Visiting Grandma')..."
                value={customStatus}
                onChange={(e) => setCustomStatus(e.target.value)}
                maxLength={30}
                className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-800"
              />
              {customStatus && (
                <button
                  type="button"
                  onClick={() => setCustomStatus('')}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 text-xs"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* 3. Optional Note / Thought */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1.5">
              3. Quick Thought for the Family (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="e.g. 'Missing everyone! Looking forward to catching up this weekend.' or 'Quiet evening cooking dinner.'"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-800 resize-none"
            />
          </div>

          {/* 4. Share to chat toggle */}
          <div className="p-3 bg-emerald-50/70 border border-emerald-200/60 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Send className="w-4 h-4 text-emerald-600" />
              <div>
                <p className="text-xs font-semibold text-slate-800">
                  Share Check-in to #General Chat
                </p>
                <p className="text-[11px] text-slate-500">
                  Broadcasts a warm greeting so disconnected relatives know you're around
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShareToChat(!shareToChat)}
              className={`w-9 h-5 rounded-full transition-colors relative ${
                shareToChat ? 'bg-emerald-600' : 'bg-slate-300'
              }`}
            >
              <span
                className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.5 transition-transform ${
                  shareToChat ? 'left-5' : 'left-0.5'
                }`}
              />
            </button>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-2 transition-all active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Save Today's Check-in</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
