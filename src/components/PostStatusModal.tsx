import React, { useState } from 'react';
import { X, Sparkles, MapPin, Smile, Image as ImageIcon, Send, Clock } from 'lucide-react';
import { FamilyMember, FamilyStatusUpdate } from '../types/family';

interface PostStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeMember: FamilyMember;
  onAddStatus: (status: Omit<FamilyStatusUpdate, 'id' | 'postedAt' | 'formattedTime'>) => void;
}

const PRESET_EMOJIS = ['✨', '😊', '☕', '🥖', '🍲', '🚗', '📚', '🏃', '😴', '🥳', '🌿', '❤️'];

const PRESET_PHOTOS = [
  { url: '/src/assets/images/family_summer_picnic_1791015908360.jpg', title: 'Summer Picnic' },
  { url: '/src/assets/images/family_dinner_lasagna_1791015919234.jpg', title: 'Dinner Lasagna' },
  { url: '/src/assets/images/family_puppy_park_1791015930194.jpg', title: 'Puppy at Park' },
  { url: '/src/assets/images/family_hiking_view_1791015940356.jpg', title: 'Hiking Trail' },
];

export const PostStatusModal: React.FC<PostStatusModalProps> = ({
  isOpen,
  onClose,
  activeMember,
  onAddStatus,
}) => {
  const [text, setText] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('✨');
  const [location, setLocation] = useState(activeMember.location || '');
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    onAddStatus({
      memberId: activeMember.id,
      memberName: activeMember.name,
      avatarColor: activeMember.avatarColor,
      avatarImage: activeMember.avatarImage,
      text: text.trim(),
      moodEmoji: selectedEmoji,
      location: location.trim() || undefined,
      mediaUrl: selectedPhoto || undefined,
    });

    setText('');
    setSelectedPhoto(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 text-emerald-700 flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 font-display">
                Post Family Status Update
              </h3>
              <p className="text-xs text-slate-500">
                Visible to all family units & branches for 24 hours
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Member Card preview */}
          <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-slate-50 border border-slate-150">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${activeMember.avatarColor}`}>
              {activeMember.name.charAt(0)}
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 block">{activeMember.name}</span>
              <span className="text-[10px] text-slate-500">
                {activeMember.familyUnitName || activeMember.role}
              </span>
            </div>
          </div>

          {/* Text Area */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              What's happening right now?
            </label>
            <textarea
              rows={3}
              placeholder="e.g. Taking the kids to the park! ⚽ Cooking family dinner 🍲..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white resize-none"
              required
            />
          </div>

          {/* Mood Emoji Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Select Mood / Activity Emoji:
            </label>
            <div className="flex items-center gap-1.5 flex-wrap">
              {PRESET_EMOJIS.map((emoji) => (
                <button
                  type="button"
                  key={emoji}
                  onClick={() => setSelectedEmoji(emoji)}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg transition-all ${
                    selectedEmoji === emoji
                      ? 'bg-emerald-100 border-2 border-emerald-500 scale-110 shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 border border-slate-200'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Location Tag */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-emerald-600" />
              <span>Location / Spot (Optional):</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Home, Central Park, Transit, Library..."
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
            />
          </div>

          {/* Attach Family Photo */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
              <ImageIcon className="w-3.5 h-3.5 text-indigo-600" />
              <span>Attach Photo (Optional):</span>
            </label>
            <div className="grid grid-cols-4 gap-2">
              {PRESET_PHOTOS.map((photo) => (
                <div
                  key={photo.url}
                  onClick={() => setSelectedPhoto(selectedPhoto === photo.url ? null : photo.url)}
                  className={`relative aspect-square rounded-xl overflow-hidden cursor-pointer border-2 transition-all ${
                    selectedPhoto === photo.url
                      ? 'border-emerald-500 ring-2 ring-emerald-500/20 scale-102 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 opacity-80 hover:opacity-100'
                  }`}
                >
                  <img
                    src={photo.url}
                    alt={photo.title}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  {selectedPhoto === photo.url && (
                    <div className="absolute inset-0 bg-emerald-600/30 flex items-center justify-center">
                      <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold">
                        ✓
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Submit Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={!text.trim()}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all active:scale-95"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Publish Status</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
