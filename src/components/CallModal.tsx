import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Video, VideoOff, PhoneOff, Users, Volume2 } from 'lucide-react';
import { FamilyMember } from '../types/family';

interface CallModalProps {
  isOpen: boolean;
  onClose: () => void;
  channelName: string;
  members: FamilyMember[];
  activeMember: FamilyMember;
}

export const CallModal: React.FC<CallModalProps> = ({
  isOpen,
  onClose,
  channelName,
  members,
  activeMember,
}) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [speakerId, setSpeakerId] = useState<string>('mom');

  useEffect(() => {
    if (!isOpen) {
      setSeconds(0);
      return;
    }
    const timer = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);

    // Random active speaker simulation
    const speakerInterval = setInterval(() => {
      const otherMembers = members.filter(m => m.id !== activeMember.id);
      if (otherMembers.length > 0) {
        const randomSpeaker = otherMembers[Math.floor(Math.random() * otherMembers.length)];
        setSpeakerId(randomSpeaker.id);
      }
    }, 4000);

    return () => {
      clearInterval(timer);
      clearInterval(speakerInterval);
    };
  }, [isOpen, members, activeMember]);

  if (!isOpen) return null;

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col text-white">
        
        {/* Call Header */}
        <div className="px-6 py-4 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-base text-slate-100 font-display">
                Family Live Call: {channelName}
              </h3>
              <p className="text-xs text-slate-400">
                Connected · {formatTime(seconds)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Volume2 className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span>HD Voice Active</span>
          </div>
        </div>

        {/* Member Video/Audio Grid */}
        <div className="p-6 grid grid-cols-2 sm:grid-cols-3 gap-4 bg-slate-950/40">
          {members.map((member) => {
            const isMe = member.id === activeMember.id;
            const isSpeaking = speakerId === member.id && !isMe;

            return (
              <div
                key={member.id}
                className={`relative flex flex-col items-center justify-center p-6 rounded-2xl border transition-all duration-300 ${
                  isSpeaking
                    ? 'border-emerald-500/80 bg-emerald-950/20 shadow-lg shadow-emerald-500/10 scale-[1.02]'
                    : 'border-slate-800 bg-slate-900/60'
                }`}
              >
                {/* Voice ripple indicator */}
                {isSpeaking && (
                  <span className="absolute inset-0 rounded-2xl border-2 border-emerald-400/50 animate-ping pointer-events-none" />
                )}

                <div
                  className={`w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold text-white shadow-md mb-3 ${member.avatarColor}`}
                >
                  {member.name.charAt(0)}
                </div>

                <div className="text-center">
                  <p className="text-sm font-semibold text-slate-100 flex items-center justify-center gap-1.5">
                    {member.name} {isMe && '(You)'}
                  </p>
                  <p className="text-xs text-slate-400">{member.role}</p>
                </div>

                <div className="absolute top-3 right-3 flex items-center gap-1">
                  {isSpeaking && (
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Speaking
                    </span>
                  )}
                  {isMe && isMuted && (
                    <span className="p-1 rounded-full bg-rose-500/20 text-rose-400">
                      <MicOff className="w-3.5 h-3.5" />
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Call Controls Bar */}
        <div className="px-6 py-5 border-t border-slate-800 bg-slate-900 flex items-center justify-center gap-4">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
              isMuted
                ? 'bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 border border-rose-500/40'
                : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
            }`}
            title={isMuted ? 'Unmute microphone' : 'Mute microphone'}
          >
            {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          <button
            onClick={() => setIsVideoOff(!isVideoOff)}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
              isVideoOff
                ? 'bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 border border-rose-500/40'
                : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
            }`}
            title={isVideoOff ? 'Turn video on' : 'Turn video off'}
          >
            {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
          </button>

          <button
            onClick={onClose}
            className="px-6 h-12 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-medium text-sm flex items-center gap-2 shadow-lg shadow-rose-900/30 active:scale-95 transition-all"
          >
            <PhoneOff className="w-5 h-5" />
            <span>End Call</span>
          </button>
        </div>

      </div>
    </div>
  );
};
