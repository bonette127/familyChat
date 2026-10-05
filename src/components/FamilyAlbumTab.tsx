import React, { useState } from 'react';
import { Camera, Heart, Plus, Calendar, User, X, ZoomIn, Image as ImageIcon } from 'lucide-react';
import { FamilyMember } from '../types/family';

export interface PhotoMemory {
  id: string;
  url: string;
  caption: string;
  date: string;
  authorId: string;
  category: 'trips' | 'food' | 'pets' | 'milestones' | 'general';
  likes: string[]; // member IDs who liked
}

interface FamilyAlbumTabProps {
  members: FamilyMember[];
  activeMemberId: string;
  memories: PhotoMemory[];
  onAddMemory: (memory: Omit<PhotoMemory, 'id' | 'likes'>) => void;
  onToggleLike: (memoryId: string) => void;
}

export const FamilyAlbumTab: React.FC<FamilyAlbumTabProps> = ({
  members,
  activeMemberId,
  memories,
  onAddMemory,
  onToggleLike,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoMemory | null>(null);
  const [isAddingModal, setIsAddingModal] = useState(false);

  // New Memory Form
  const [caption, setCaption] = useState('');
  const [category, setCategory] = useState<'trips' | 'food' | 'pets' | 'milestones' | 'general'>('general');
  const [customImageUrl, setCustomImageUrl] = useState('');
  const [imagePreview, setImagePreview] = useState<string>('');

  const samplePresets = [
    { label: 'Summer Picnic', url: '/src/assets/images/family_summer_picnic_1791015908360.jpg', cat: 'trips' },
    { label: 'Lasagna Night', url: '/src/assets/images/family_dinner_lasagna_1791015919234.jpg', cat: 'food' },
    { label: 'Buster Dog', url: '/src/assets/images/family_puppy_park_1791015930194.jpg', cat: 'pets' },
    { label: 'Ridge Hike', url: '/src/assets/images/family_hiking_view_1791015940356.jpg', cat: 'trips' },
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImagePreview(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateMemory = (e: React.FormEvent) => {
    e.preventDefault();
    const finalUrl = imagePreview || customImageUrl || samplePresets[0].url;
    if (!caption.trim()) return;

    onAddMemory({
      url: finalUrl,
      caption: caption.trim(),
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      authorId: activeMemberId,
      category,
    });

    setCaption('');
    setImagePreview('');
    setCustomImageUrl('');
    setIsAddingModal(false);
  };

  const filteredMemories = selectedCategory === 'all'
    ? memories
    : memories.filter((m) => m.category === selectedCategory);

  const getMember = (id: string) => members.find((m) => m.id === id) || { name: 'Family Member', avatarColor: 'bg-slate-500' };

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto bg-slate-50/60 p-4 sm:p-6 lg:p-8">
      {/* Top Header */}
      <div className="max-w-6xl w-full mx-auto mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 font-display flex items-center gap-2">
            <Camera className="w-6 h-6 text-rose-500" />
            Family Memories & Scrapbook
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Cherished snapshots, vacations, Sunday dinners, and milestone moments
          </p>
        </div>

        <button
          onClick={() => setIsAddingModal(true)}
          className="self-start sm:self-auto px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Family Photo</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="max-w-6xl w-full mx-auto mb-6 flex items-center gap-1.5 overflow-x-auto pb-1">
        {[
          { id: 'all', label: 'All Memories' },
          { id: 'trips', label: 'Trips & Outdoors' },
          { id: 'food', label: 'Dinners & Cooking' },
          { id: 'pets', label: 'Pets & Play' },
          { id: 'milestones', label: 'Milestones' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedCategory(tab.id)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
              selectedCategory === tab.id
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200/80'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Grid of Memories */}
      <div className="max-w-6xl w-full mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMemories.map((mem) => {
          const author = getMember(mem.authorId);
          const hasLiked = mem.likes.includes(activeMemberId);

          return (
            <div
              key={mem.id}
              className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col hover:shadow-md transition-shadow group"
            >
              {/* Image Container with zoom cursor */}
              <div
                onClick={() => setSelectedPhoto(mem)}
                className="relative aspect-4/3 bg-slate-100 overflow-hidden cursor-pointer"
              >
                <img
                  src={mem.url}
                  alt={mem.caption}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    // Fallback container
                    (e.currentTarget as HTMLElement).style.display = 'none';
                  }}
                />
                <div className="absolute inset-0 bg-slate-900/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="p-2 rounded-full bg-white/90 text-slate-900 shadow-sm">
                    <ZoomIn className="w-4 h-4" />
                  </span>
                </div>
              </div>

              {/* Memory Details */}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-900 line-clamp-2">
                    {mem.caption}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-2">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-bold ${author.avatarColor}`}>
                      {author.name.charAt(0)}
                    </div>
                    <span>{author.name.split(' ')[0]}</span>
                    <span aria-hidden="true">·</span>
                    <span>{mem.date}</span>
                  </div>

                  <button
                    onClick={() => onToggleLike(mem.id)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition-colors ${
                      hasLiked
                        ? 'border-rose-200 bg-rose-50 text-rose-600 font-semibold'
                        : 'border-slate-200 text-slate-500 hover:text-rose-500 hover:bg-slate-50'
                    }`}
                  >
                    <Heart className={`w-3.5 h-3.5 ${hasLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
                    <span>{mem.likes.length}</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredMemories.length === 0 && (
        <div className="max-w-md mx-auto my-12 text-center p-8 bg-white rounded-3xl border border-slate-200">
          <ImageIcon className="w-10 h-10 text-slate-400 mx-auto mb-2" />
          <h4 className="text-sm font-semibold text-slate-800">No photos in this category yet</h4>
          <p className="text-xs text-slate-500 mt-1">Upload the first snapshot to share with the whole family.</p>
        </div>
      )}

      {/* Lightbox Modal */}
      {selectedPhoto && (
        <div
          onClick={() => setSelectedPhoto(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-4xl w-full bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-800 flex flex-col"
          >
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-slate-950/70 text-white flex items-center justify-center hover:bg-slate-900 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="max-h-[75vh] bg-black flex items-center justify-center">
              <img
                src={selectedPhoto.url}
                alt={selectedPhoto.caption}
                className="max-h-[75vh] w-auto object-contain"
                referrerPolicy="no-referrer"
              />
            </div>

            <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-100">
                  {selectedPhoto.caption}
                </p>
                <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                  <span>Posted by {getMember(selectedPhoto.authorId).name}</span>
                  <span aria-hidden="true">·</span>
                  <span>{selectedPhoto.date}</span>
                </div>
              </div>

              <button
                onClick={() => onToggleLike(selectedPhoto.id)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border text-xs font-semibold ${
                  selectedPhoto.likes.includes(activeMemberId)
                    ? 'border-rose-500 bg-rose-500/20 text-rose-400'
                    : 'border-slate-700 bg-slate-800 text-slate-300 hover:text-white'
                }`}
              >
                <Heart className={`w-4 h-4 ${selectedPhoto.likes.includes(activeMemberId) ? 'fill-rose-500 text-rose-500' : ''}`} />
                <span>{selectedPhoto.likes.length} Likes</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Memory Modal */}
      {isAddingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 overflow-hidden flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <h3 className="text-base font-bold text-slate-900 font-display">
                Add to Family Scrapbook
              </h3>
              <button
                onClick={() => setIsAddingModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateMemory} className="space-y-4">
              {/* Photo selection */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Select Photo or Choose Preset
                </label>
                
                {/* Sample Presets */}
                <div className="grid grid-cols-4 gap-2 mb-3">
                  {samplePresets.map((p, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        setImagePreview(p.url);
                        setCategory(p.cat as any);
                      }}
                      className={`relative aspect-4/3 rounded-xl overflow-hidden border-2 transition-all ${
                        imagePreview === p.url ? 'border-rose-500 ring-2 ring-rose-200' : 'border-slate-200 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={p.url} alt={p.label} className="w-full h-full object-cover" />
                      <span className="absolute bottom-0 inset-x-0 bg-black/60 text-[9px] text-white text-center py-0.5 truncate px-1">
                        {p.label}
                      </span>
                    </button>
                  ))}
                </div>

                {/* File Upload Option */}
                <div className="flex items-center gap-2">
                  <label className="cursor-pointer px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 hover:bg-slate-100 text-xs font-medium text-slate-700 flex items-center gap-1.5 transition-colors">
                    <Camera className="w-4 h-4 text-slate-500" />
                    <span>Upload from device...</span>
                    <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                  </label>
                  {imagePreview && (
                    <span className="text-xs text-emerald-600 font-medium">
                      ✓ Image selected
                    </span>
                  )}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Caption or Memory Note
                </label>
                <textarea
                  rows={2}
                  placeholder="What was happening here? (e.g. Liam scoring the game-winning goal!)"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white text-slate-700"
                >
                  <option value="trips">Trips & Outdoors</option>
                  <option value="food">Dinners & Cooking</option>
                  <option value="pets">Pets & Play</option>
                  <option value="milestones">Milestones & Birthdays</option>
                  <option value="general">Everyday Moments</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddingModal(false)}
                  className="px-4 py-2 text-xs text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!caption.trim() || !imagePreview}
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 disabled:pointer-events-none text-white text-xs font-semibold rounded-xl"
                >
                  Post to Scrapbook
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
