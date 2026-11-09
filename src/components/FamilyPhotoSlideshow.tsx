import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  ChevronLeft, 
  ChevronRight, 
  X, 
  Heart, 
  Calendar, 
  User, 
  Sparkles,
  Maximize2,
  Minimize2,
  RotateCcw
} from 'lucide-react';
import { PhotoMemory } from './FamilyAlbumTab';
import { FamilyMember } from '../types/family';

interface FamilyPhotoSlideshowProps {
  isOpen: boolean;
  onClose: () => void;
  memories: PhotoMemory[];
  members: FamilyMember[];
  activeMemberId: string;
  onToggleLike: (memoryId: string) => void;
  initialIndex?: number;
}

export const FamilyPhotoSlideshow: React.FC<FamilyPhotoSlideshowProps> = ({
  isOpen,
  onClose,
  memories,
  members,
  activeMemberId,
  onToggleLike,
  initialIndex = 0,
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const SLIDE_DURATION = 4500; // 4.5 seconds per slide

  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(Math.min(initialIndex, Math.max(0, memories.length - 1)));
      setIsPlaying(true);
      setProgress(0);
    }
  }, [isOpen, initialIndex, memories.length]);

  // Handle slide cycling
  useEffect(() => {
    if (!isOpen || !isPlaying || memories.length <= 1) return;

    setProgress(0);
    const stepTime = 50;
    const increment = (stepTime / SLIDE_DURATION) * 100;

    progressIntervalRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          return 0;
        }
        return prev + increment;
      });
    }, stepTime);

    timerRef.current = setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % memories.length);
    }, SLIDE_DURATION);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, [isOpen, isPlaying, currentIndex, memories.length]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowRight') {
        goToNext();
      } else if (e.key === 'ArrowLeft') {
        goToPrev();
      } else if (e.key === ' ') {
        e.preventDefault();
        setIsPlaying((p) => !p);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, memories.length]);

  if (!isOpen || memories.length === 0) return null;

  const currentMemory = memories[currentIndex] || memories[0];
  const author = members.find((m) => m.id === currentMemory.authorId) || {
    name: 'Family Member',
    avatarColor: 'bg-emerald-600',
    familyRole: 'Relative',
  };
  const isLiked = currentMemory.likes.includes(activeMemberId);

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % memories.length);
    setProgress(0);
  };

  const goToPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + memories.length) % memories.length);
    setProgress(0);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      setIsFullscreen(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-xl flex flex-col justify-between text-white animate-in fade-in duration-300 select-none">
      
      {/* Top Progress Bar for Slide Timer */}
      <div className="w-full h-1 bg-white/10 relative overflow-hidden">
        <div 
          className="h-full bg-linear-to-r from-emerald-400 via-teal-400 to-rose-400 transition-all ease-linear"
          style={{ width: isPlaying ? `${Math.min(100, progress)}%` : '0%' }}
        />
      </div>

      {/* Top Control Bar */}
      <div className="px-6 py-4 flex items-center justify-between z-20 bg-linear-to-b from-black/60 to-transparent">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/10 backdrop-blur-md text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Family Photo Slideshow</span>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {currentIndex + 1} of {memories.length}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Play / Pause Toggle */}
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors flex items-center justify-center cursor-pointer"
            title={isPlaying ? 'Pause Slideshow (Space)' : 'Play Slideshow (Space)'}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
          </button>

          {/* Fullscreen Button */}
          <button
            onClick={toggleFullscreen}
            className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer hidden sm:flex"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="p-2.5 rounded-full bg-white/10 hover:bg-rose-500/80 text-white transition-colors cursor-pointer"
            title="Exit Slideshow (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Slideshow Stage with Smooth Ambient Backdrop */}
      <div className="relative flex-1 flex items-center justify-center px-4 sm:px-16 overflow-hidden">
        
        {/* Soft Ambient Blurred Background */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-25 blur-3xl scale-120 transition-all duration-1000 pointer-events-none"
          style={{ backgroundImage: `url(${currentMemory.url})` }}
        />

        {/* Previous Button */}
        <button
          onClick={goToPrev}
          className="absolute left-4 sm:left-8 z-30 p-3 rounded-full bg-black/40 hover:bg-black/70 border border-white/10 text-white transition-all transform hover:scale-110 active:scale-95 cursor-pointer shadow-lg"
          title="Previous Photo (Left Arrow)"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        {/* Next Button */}
        <button
          onClick={goToNext}
          className="absolute right-4 sm:right-8 z-30 p-3 rounded-full bg-black/40 hover:bg-black/70 border border-white/10 text-white transition-all transform hover:scale-110 active:scale-95 cursor-pointer shadow-lg"
          title="Next Photo (Right Arrow)"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Active Memory Photo Container */}
        <div className="relative max-w-4xl max-h-[68vh] w-full flex flex-col items-center justify-center z-10 transition-all duration-700 ease-out">
          <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/15 bg-black/40 max-h-[62vh]">
            <img
              key={currentMemory.id}
              src={currentMemory.url}
              alt={currentMemory.caption}
              className="max-h-[62vh] w-auto max-w-full object-contain mx-auto animate-in fade-in zoom-in-95 duration-500"
              referrerPolicy="no-referrer"
            />
          </div>

          {/* Caption Overlay */}
          <div className="mt-4 max-w-2xl text-center px-4">
            <p className="text-base sm:text-lg font-medium text-white drop-shadow-md">
              "{currentMemory.caption}"
            </p>
            <div className="mt-2 flex items-center justify-center gap-3 text-xs text-slate-300 flex-wrap">
              <span className="flex items-center gap-1.5 font-semibold text-white">
                <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold text-white ${author.avatarColor}`}>
                  {author.name.charAt(0)}
                </span>
                <span>{author.name}</span>
                <span className="text-[10px] text-emerald-300 font-normal">({author.familyRole || 'Family Member'})</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>{currentMemory.date}</span>
              </span>
              <span>•</span>
              <button
                onClick={() => onToggleLike(currentMemory.id)}
                className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-xs font-semibold transition-all cursor-pointer ${
                  isLiked 
                    ? 'bg-rose-500/30 border-rose-400/50 text-rose-300' 
                    : 'bg-white/10 hover:bg-white/20 border-white/20 text-white'
                }`}
                title={isLiked ? 'Unlike' : 'Love memory'}
              >
                <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-rose-400 text-rose-400' : ''}`} />
                <span>{currentMemory.likes.length}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Thumbnail Strip for Direct Navigation */}
      <div className="px-6 py-4 bg-linear-to-t from-black/80 to-transparent z-20">
        <div className="max-w-4xl mx-auto flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
          {memories.map((mem, index) => {
            const isSelected = index === currentIndex;
            return (
              <button
                key={mem.id}
                onClick={() => {
                  setCurrentIndex(index);
                  setProgress(0);
                }}
                className={`relative shrink-0 w-16 h-12 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                  isSelected 
                    ? 'border-emerald-400 scale-105 shadow-md shadow-emerald-500/30' 
                    : 'border-transparent opacity-60 hover:opacity-100 hover:border-white/40'
                }`}
              >
                <img
                  src={mem.url}
                  alt={mem.caption}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
