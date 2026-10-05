import React, { useState, useRef } from 'react';
import { 
  Send, 
  Mic, 
  Image as ImageIcon, 
  Smile, 
  PieChart, 
  MapPin, 
  X, 
  Paperclip,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { Attachment, FamilyMember, Message } from '../types/family';

interface ChatInputProps {
  activeMember: FamilyMember;
  replyingTo: Message | null;
  onCancelReply: () => void;
  onSendMessage: (
    text: string,
    attachments?: Attachment[],
    replyTo?: { id: string; senderName: string; text: string }
  ) => void;
  onOpenVoiceRecorder: () => void;
  onOpenCreatePoll: () => void;
  channelName: string;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  activeMember,
  replyingTo,
  onCancelReply,
  onSendMessage,
  onOpenVoiceRecorder,
  onOpenCreatePoll,
  channelName,
}) => {
  const [text, setText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showCheckInMenu, setShowCheckInMenu] = useState(false);
  const [showPhotoPicker, setShowPhotoPicker] = useState(false);
  const [selectedPhotoPreview, setSelectedPhotoPreview] = useState<string | null>(null);
  const [photoCaption, setPhotoCaption] = useState('');

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const emojis = ['❤️', '😊', '😂', '🍲', '☕', '🎂', '🥳', '🐶', '👏', '🙏', '✨', '🏡', '🌸', '🚗', '☀️', '🍕'];

  const checkInPresets = [
    { label: 'Safely arrived home 🏡', location: 'Home', eta: 'Relaxing inside' },
    { label: 'On my way home! 🚗', location: 'Heading Home', eta: 'ETA ~15 mins' },
    { label: 'At the grocery store 🛒', location: 'Market & Groceries', eta: 'Let me know if you need anything!' },
    { label: 'Arrived at school / practice ⚽', location: 'School / Sports Field', eta: 'All settled in' },
    { label: 'Stepping out for a walk 🐕', location: 'Neighborhood Park', eta: 'Walking Buster' },
  ];

  const photoPresets = [
    { label: 'Picnic Fun', url: '/src/assets/images/family_summer_picnic_1791015908360.jpg' },
    { label: 'Lasagna Dinner', url: '/src/assets/images/family_dinner_lasagna_1791015919234.jpg' },
    { label: 'Sleepy Buster', url: '/src/assets/images/family_puppy_park_1791015930194.jpg' },
    { label: 'Ridge Hike', url: '/src/assets/images/family_hiking_view_1791015940356.jpg' },
  ];

  const handleSend = () => {
    const clean = text.trim();
    const hasPhoto = !!selectedPhotoPreview;

    if (!clean && !hasPhoto) return;

    let attachments: Attachment[] | undefined;
    if (selectedPhotoPreview) {
      attachments = [
        {
          type: 'image',
          url: selectedPhotoPreview,
          caption: photoCaption.trim() || undefined,
        },
      ];
    }

    const replyPayload = replyingTo
      ? {
          id: replyingTo.id,
          senderName: replyingTo.senderId,
          text: replyingTo.content.slice(0, 80),
        }
      : undefined;

    onSendMessage(clean, attachments, replyPayload);

    setText('');
    setSelectedPhotoPreview(null);
    setPhotoCaption('');
    setShowEmojiPicker(false);
    setShowCheckInMenu(false);
    setShowPhotoPicker(false);
    onCancelReply();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleCheckInSelect = (item: typeof checkInPresets[0]) => {
    onSendMessage(
      `📍 Check-in: ${item.label}`,
      [
        {
          type: 'location',
          locationName: item.location,
          eta: item.eta,
        },
      ]
    );
    setShowCheckInMenu(false);
  };

  const handleCustomFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setSelectedPhotoPreview(event.target.result as string);
          setShowPhotoPicker(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="border-t border-slate-200/80 bg-white p-3 sm:p-4 relative">
      
      {/* Replying-to Preview */}
      {replyingTo && (
        <div className="mb-2 p-2 bg-slate-100 rounded-xl flex items-center justify-between text-xs text-slate-600 animate-in fade-in duration-150">
          <div className="flex items-center gap-2 truncate">
            <span className="font-semibold text-slate-800">Replying to:</span>
            <span className="italic truncate">{replyingTo.content}</span>
          </div>
          <button
            onClick={onCancelReply}
            className="p-1 hover:text-slate-900 rounded-md"
            title="Cancel reply"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Selected Photo Pending Send Preview */}
      {selectedPhotoPreview && (
        <div className="mb-3 p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-start gap-3">
          <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-slate-200">
            <img src={selectedPhotoPreview} alt="Preview" className="w-full h-full object-cover" />
            <button
              onClick={() => setSelectedPhotoPreview(null)}
              className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
          <input
            type="text"
            placeholder="Add a photo caption..."
            value={photoCaption}
            onChange={(e) => setPhotoCaption(e.target.value)}
            className="flex-1 px-3 py-1.5 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
          />
        </div>
      )}

      {/* Emoji Picker Popover */}
      {showEmojiPicker && (
        <div className="absolute bottom-full mb-2 left-4 bg-white border border-slate-200 rounded-2xl p-2.5 shadow-xl grid grid-cols-8 gap-1 z-30 animate-in fade-in zoom-in-95 duration-150">
          {emojis.map((emoji) => (
            <button
              key={emoji}
              onClick={() => {
                setText((prev) => prev + emoji);
                setShowEmojiPicker(false);
                textareaRef.current?.focus();
              }}
              className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-lg hover:scale-125 transition-transform"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      {/* Check-in Quick Menu Popover */}
      {showCheckInMenu && (
        <div className="absolute bottom-full mb-2 left-12 bg-white border border-slate-200 rounded-2xl p-2 shadow-xl w-72 z-30 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-2 py-1 border-b border-slate-100 mb-1">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Quick Family Check-in
            </p>
          </div>
          <div className="space-y-1">
            {checkInPresets.map((preset, idx) => (
              <button
                key={idx}
                onClick={() => handleCheckInSelect(preset)}
                className="w-full text-left px-3 py-2 rounded-xl text-xs text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 transition-colors flex items-center justify-between"
              >
                <span>{preset.label}</span>
                <span className="text-[10px] text-slate-400">{preset.eta}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Photo Picker Popover */}
      {showPhotoPicker && (
        <div className="absolute bottom-full mb-2 left-12 bg-white border border-slate-200 rounded-2xl p-3 shadow-xl w-80 z-30 animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2">
            <p className="text-xs font-bold text-slate-800">Share Family Photo</p>
            <button onClick={() => setShowPhotoPicker(false)} className="text-slate-400 hover:text-slate-600">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-3">
            {photoPresets.map((p, idx) => (
              <div
                key={idx}
                onClick={() => {
                  setSelectedPhotoPreview(p.url);
                  setShowPhotoPicker(false);
                }}
                className="cursor-pointer group relative aspect-4/3 rounded-xl overflow-hidden border border-slate-200 hover:border-emerald-500"
              >
                <img src={p.url} alt={p.label} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                <span className="absolute bottom-0 inset-x-0 bg-black/60 text-[10px] text-white text-center py-0.5 truncate px-1">
                  {p.label}
                </span>
              </div>
            ))}
          </div>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Upload from device...</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleCustomFileUpload}
            className="hidden"
          />
        </div>
      )}

      {/* Main Input Box */}
      <div className="flex items-end gap-2 bg-slate-50 border border-slate-200/90 rounded-2xl p-1.5 focus-within:border-slate-400 focus-within:ring-2 focus-within:ring-slate-900/5 transition-all">
        
        {/* Action triggers toolbar inside input */}
        <div className="flex items-center gap-0.5 pb-1 pl-1">
          <button
            type="button"
            onClick={() => {
              setShowEmojiPicker(!showEmojiPicker);
              setShowCheckInMenu(false);
              setShowPhotoPicker(false);
            }}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-200/60 transition-colors"
            title="Emoji"
          >
            <Smile className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => {
              setShowPhotoPicker(!showPhotoPicker);
              setShowEmojiPicker(false);
              setShowCheckInMenu(false);
            }}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-200/60 transition-colors"
            title="Share Photo"
          >
            <ImageIcon className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={onOpenVoiceRecorder}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
            title="Voice Note"
          >
            <Mic className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => {
              setShowCheckInMenu(!showCheckInMenu);
              setShowEmojiPicker(false);
              setShowPhotoPicker(false);
            }}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
            title="Location Check-in"
          >
            <MapPin className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={onOpenCreatePoll}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-amber-600 hover:bg-amber-50 transition-colors"
            title="Dinner / Family Poll"
          >
            <PieChart className="w-4 h-4" />
          </button>
        </div>

        {/* Text Area */}
        <textarea
          ref={textareaRef}
          rows={1}
          placeholder={`Message #${channelName} as ${activeMember.name}...`}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 max-h-32 min-h-[38px] py-2 px-2 text-sm bg-transparent resize-none focus:outline-none text-slate-900 placeholder:text-slate-400"
        />

        {/* Send Button */}
        <button
          onClick={handleSend}
          disabled={!text.trim() && !selectedPhotoPreview}
          className="w-9 h-9 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none text-white flex items-center justify-center shadow-xs transition-colors shrink-0 mb-0.5"
          title="Send message (Enter)"
        >
          <Send className="w-4 h-4" />
        </button>

      </div>

      <div className="flex items-center justify-between mt-1 px-1 text-[11px] text-slate-400">
        <span className="flex items-center gap-1">
          Chatting as <strong className="text-slate-700">{activeMember.name}</strong> ({activeMember.role})
        </span>
        <span className="hidden sm:inline">Press Enter to send · Shift+Enter for new line</span>
      </div>

    </div>
  );
};
