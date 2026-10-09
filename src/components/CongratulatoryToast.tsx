import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Mail, 
  CheckCircle2, 
  Copy, 
  Check, 
  ExternalLink, 
  LogIn, 
  PartyPopper,
  X,
  ShieldCheck,
  KeyRound
} from 'lucide-react';
import { SentInviteEmail } from '../types/family';

export interface CongratulatoryNoticeData {
  id: string;
  memberName: string;
  recipientEmail: string;
  loginPassword: string;
  sentAt: string;
  memberId: string;
  hasChatAccess: boolean;
}

interface CongratulatoryToastProps {
  notice: CongratulatoryNoticeData | null;
  onClose: () => void;
  onViewDeliveredEmail?: () => void;
  onTestLogin?: (memberId: string) => void;
}

// Visual Confetti Particle definitions
const CONFETTI_PARTICLES = [
  { id: 1, left: '10%', delay: '0s', color: 'bg-emerald-400', size: 'w-2 h-2', rotate: 'rotate-45' },
  { id: 2, left: '25%', delay: '0.15s', color: 'bg-amber-400', size: 'w-2.5 h-1.5', rotate: 'rotate-12' },
  { id: 3, left: '40%', delay: '0.3s', color: 'bg-indigo-400', size: 'w-2 h-2', rotate: '-rotate-45' },
  { id: 4, left: '55%', delay: '0.05s', color: 'bg-rose-400', size: 'w-1.5 h-2.5', rotate: 'rotate-90' },
  { id: 5, left: '70%', delay: '0.2s', color: 'bg-teal-400', size: 'w-2 h-2', rotate: 'rotate-30' },
  { id: 6, left: '85%', delay: '0.25s', color: 'bg-amber-300', size: 'w-2.5 h-1.5', rotate: '-rotate-12' },
  { id: 7, left: '95%', delay: '0.1s', color: 'bg-purple-400', size: 'w-2 h-2', rotate: 'rotate-60' },
];

export const CongratulatoryToast: React.FC<CongratulatoryToastProps> = ({
  notice,
  onClose,
  onViewDeliveredEmail,
  onTestLogin,
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (!notice || isPaused) return;

    const timer = setTimeout(() => {
      onClose();
    }, 9000);

    return () => clearTimeout(timer);
  }, [notice, isPaused, onClose]);

  if (!notice) return null;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div 
      className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-xl animate-celebration-pop pointer-events-auto"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Floating Confetti Layer */}
      <div className="absolute -top-3 inset-x-0 h-16 pointer-events-none overflow-hidden z-10">
        {CONFETTI_PARTICLES.map((particle) => (
          <div
            key={particle.id}
            className={`absolute top-0 rounded-xs opacity-90 animate-pulse ${particle.color} ${particle.size} ${particle.rotate}`}
            style={{
              left: particle.left,
              animation: `confettiFall 2.2s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${particle.delay} infinite`,
            }}
          />
        ))}
      </div>

      {/* Toast Content Card */}
      <div className="relative bg-slate-900/95 backdrop-blur-md text-white rounded-2xl shadow-2xl border-2 border-emerald-500/60 p-4 sm:p-5 overflow-hidden">
        {/* Decorative corner glow */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-emerald-500/20 rounded-full blur-2xl pointer-none" />
        <div className="absolute -bottom-10 -left-10 w-28 h-28 bg-amber-500/20 rounded-full blur-2xl pointer-none" />

        <div className="relative z-10 space-y-3">
          {/* Header Row */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/30">
                <PartyPopper className="w-5 h-5 text-slate-950" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-sm sm:text-base font-bold text-white tracking-tight flex items-center gap-1.5 font-display">
                    <span>Congratulations!</span>
                    <span className="text-emerald-400">Registration Complete</span>
                  </h3>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Email Dispatched
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-0.5">
                  Welcome credentials successfully sent to{' '}
                  <span className="font-semibold text-white underline decoration-emerald-400 underline-offset-2">
                    {notice.recipientEmail}
                  </span>
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors shrink-0"
              title="Dismiss notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Credential Glance Box */}
          <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/80 flex flex-wrap items-center justify-between gap-2.5 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-400 text-[11px]">Member:</span>
              <span className="font-bold text-white">{notice.memberName}</span>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 text-[11px]">Password:</span>
              <code className="font-mono font-bold text-amber-300 bg-slate-900/90 px-2 py-0.5 rounded border border-amber-500/30 text-xs">
                {notice.loginPassword}
              </code>
              <button
                onClick={() => handleCopy(notice.loginPassword, 'toast-pwd')}
                className="p-1 text-slate-400 hover:text-amber-300 rounded hover:bg-slate-700/60 transition-colors"
                title="Copy temporary password"
              >
                {copiedKey === 'toast-pwd' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>

            <div className="flex items-center gap-1 text-[11px]">
              <span className="text-slate-400">Chat Access:</span>
              <span className="text-emerald-400 font-semibold">
                {notice.hasChatAccess ? 'Granted 🚀' : 'Pending'}
              </span>
            </div>
          </div>

          {/* Action Buttons Row */}
          <div className="flex items-center justify-between gap-2 pt-1 flex-wrap">
            <span className="text-[11px] text-slate-400 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>Ready for immediate testing</span>
            </span>

            <div className="flex items-center gap-2">
              {onViewDeliveredEmail && (
                <button
                  onClick={() => {
                    onViewDeliveredEmail();
                    onClose();
                  }}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700"
                >
                  <Mail className="w-3.5 h-3.5 text-emerald-400" />
                  <span>View Sent Email</span>
                </button>
              )}

              {onTestLogin && (
                <button
                  onClick={() => {
                    onTestLogin(notice.memberId);
                    onClose();
                  }}
                  className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md shadow-emerald-500/20 active:scale-98"
                >
                  <LogIn className="w-3.5 h-3.5 text-slate-950" />
                  <span>Test Login Now</span>
                </button>
              )}
            </div>
          </div>

          {/* Auto-dismiss timing bar */}
          <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden mt-2">
            <div className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-amber-400 animate-[shrink_9s_linear_forwards]" />
          </div>
        </div>
      </div>
    </div>
  );
};
