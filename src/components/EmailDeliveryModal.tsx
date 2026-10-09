import React, { useState } from 'react';
import { 
  X, 
  Mail, 
  Check, 
  Copy, 
  ExternalLink, 
  LogIn, 
  ShieldCheck, 
  Key, 
  Sparkles, 
  Lock, 
  Unlock,
  Eye,
  EyeOff,
  Send,
  MessageCircle
} from 'lucide-react';
import { SentInviteEmail } from '../types/family';

interface EmailDeliveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  emailData: SentInviteEmail | null;
  familyName: string;
  onTestLoginAsMember: (memberId: string) => void;
  onOpenMemberLoginModal: (prefilledEmail: string) => void;
}

export const EmailDeliveryModal: React.FC<EmailDeliveryModalProps> = ({
  isOpen,
  onClose,
  emailData,
  familyName,
  onTestLoginAsMember,
  onOpenMemberLoginModal,
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(true);

  if (!isOpen || !emailData) return null;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const copyFullCredentials = () => {
    const text = `Kinfolk Family Chat Credentials
Family Circle: ${familyName}
Member: ${emailData.memberName}
Email: ${emailData.recipientEmail}
Password: ${emailData.loginPassword}
Chat Access: ${emailData.hasChatAccess ? 'Granted (Full Access)' : 'Pending Admin Approval'}`;
    handleCopy(text, 'full');
  };

  const mailtoSubject = encodeURIComponent(emailData.subject);
  const mailtoBody = encodeURIComponent(
`Hi ${emailData.memberName},

You've been invited by ${emailData.sentByAdminName} to join our private family chat on Kinfolk (${familyName})!

Here are your personal login credentials:
• Login Email: ${emailData.recipientEmail}
• Temporary Password: ${emailData.loginPassword}
• Chat Access: ${emailData.hasChatAccess ? 'Active & Authorized' : 'Pending Admin Approval'}

Log in to start sharing messages, photos, voice notes, and family memories with us!`
  );
  const mailtoUrl = `mailto:${emailData.recipientEmail}?subject=${mailtoSubject}&body=${mailtoBody}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/65 backdrop-blur-sm p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Top Header */}
        <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold tracking-tight">Family Invitation Email</h3>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Check className="w-2.5 h-2.5" /> Delivered to Inbox
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Credentials dispatched to {emailData.recipientEmail}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Email Client Simulated Container */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 bg-slate-50/60">
          
          {/* Email Envelope / Headers Card */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs space-y-2 text-xs">
            <div className="grid grid-cols-[64px_1fr] items-center gap-2 text-slate-500">
              <span className="font-semibold text-slate-400 uppercase tracking-wider text-[10px]">From:</span>
              <span className="text-slate-800 font-medium">
                {emailData.sentByAdminName} (Family Admin) &lt;admin@kinfolk.family&gt;
              </span>
            </div>
            <div className="grid grid-cols-[64px_1fr] items-center gap-2 text-slate-500">
              <span className="font-semibold text-slate-400 uppercase tracking-wider text-[10px]">To:</span>
              <span className="text-slate-900 font-bold bg-amber-50 text-amber-900 px-2 py-0.5 rounded-md border border-amber-200/80 inline-block w-fit">
                {emailData.memberName} &lt;{emailData.recipientEmail}&gt;
              </span>
            </div>
            <div className="grid grid-cols-[64px_1fr] items-center gap-2 text-slate-500">
              <span className="font-semibold text-slate-400 uppercase tracking-wider text-[10px]">Date:</span>
              <span className="text-slate-600">{emailData.sentAt}</span>
            </div>
            <div className="grid grid-cols-[64px_1fr] items-baseline gap-2 pt-2 border-t border-slate-100">
              <span className="font-semibold text-slate-400 uppercase tracking-wider text-[10px]">Subject:</span>
              <span className="text-slate-900 font-bold text-sm">
                {emailData.subject}
              </span>
            </div>
          </div>

          {/* Email Body Content */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs space-y-5">
            
            {/* Welcoming Header Banner inside Email */}
            <div className="flex items-center gap-3 p-3.5 bg-gradient-to-r from-emerald-500/10 via-amber-500/10 to-teal-500/10 border border-emerald-200/60 rounded-2xl">
              <div className="w-10 h-10 rounded-xl bg-white border border-emerald-200 flex items-center justify-center text-xl shadow-2xs shrink-0">
                🏡
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 font-display">
                  Welcome to {familyName}!
                </h4>
                <p className="text-xs text-slate-600 mt-0.5">
                  Private family circle for messaging, photo sharing, and daily check-ins
                </p>
              </div>
            </div>

            {/* Letter Text */}
            <div className="text-xs text-slate-700 space-y-2 leading-relaxed">
              <p>
                Hello <strong>{emailData.memberName}</strong>,
              </p>
              <p>
                <strong>{emailData.sentByAdminName}</strong> has registered you as a family member in our private family chat app. You now have personal login credentials to join the conversation and connect with relatives.
              </p>
            </div>

            {/* Highlighted Credentials Box */}
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 text-white space-y-3.5 shadow-md">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-amber-400" /> Your Personal Login Credentials
                </span>
                <span className="text-[10px] bg-slate-800 text-emerald-400 px-2 py-0.5 rounded-full font-mono font-semibold">
                  CONFIDENTIAL
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Username / Email */}
                <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/80">
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                    <span>Login Email / Username</span>
                    <button
                      onClick={() => handleCopy(emailData.recipientEmail, 'email')}
                      className="text-slate-400 hover:text-white transition-colors"
                      title="Copy email"
                    >
                      {copiedKey === 'email' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                  <p className="text-sm font-bold font-mono text-white truncate">
                    {emailData.recipientEmail}
                  </p>
                </div>

                {/* Password / Access Passcode */}
                <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/80">
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                    <span>Access Password</span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-slate-400 hover:text-white transition-colors"
                        title={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                      </button>
                      <button
                        onClick={() => handleCopy(emailData.loginPassword, 'password')}
                        className="text-slate-400 hover:text-white transition-colors"
                        title="Copy password"
                      >
                        {copiedKey === 'password' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>
                  <p className="text-sm font-bold font-mono text-amber-300 tracking-wider">
                    {showPassword ? emailData.loginPassword : '••••••••••••'}
                  </p>
                </div>
              </div>

              {/* Chat Access Status Pill */}
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400">Chat Messaging Permission:</span>
                {emailData.hasChatAccess ? (
                  <span className="text-emerald-400 font-bold flex items-center gap-1 bg-emerald-500/15 px-2.5 py-1 rounded-lg border border-emerald-500/30">
                    <ShieldCheck className="w-3.5 h-3.5" /> Full Chat Access Enabled
                  </span>
                ) : (
                  <span className="text-rose-300 font-bold flex items-center gap-1 bg-rose-500/15 px-2.5 py-1 rounded-lg border border-rose-500/30">
                    <Lock className="w-3.5 h-3.5" /> Restricted (Read-only until authorized)
                  </span>
                )}
              </div>
            </div>

            {/* Testing Guide Callout */}
            <div className="p-3.5 bg-amber-50 border border-amber-200/90 rounded-2xl text-amber-900 text-xs flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold">Ready to test the login workflow?</p>
                <p className="text-[11px] text-amber-800 leading-normal">
                  Use the quick actions below to test how {emailData.memberName} logs into the chat with these credentials. You can either test instant 1-click login or open the manual login screen to verify credentials entry.
                </p>
              </div>
            </div>

          </div>

          {/* Action Row for Testing */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-2.5">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Test & Delivery Actions
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {/* Option 1: 1-Click Test Login */}
              <button
                onClick={() => {
                  onTestLoginAsMember(emailData.memberId);
                  onClose();
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-xs transition-transform active:scale-98"
              >
                <LogIn className="w-4 h-4 text-emerald-400" />
                <span>Log In as {emailData.memberName} (1-Click Test)</span>
              </button>

              {/* Option 2: Test Manual Login Screen */}
              <button
                onClick={() => {
                  onClose();
                  onOpenMemberLoginModal(emailData.recipientEmail);
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 rounded-xl text-xs font-semibold shadow-2xs transition-colors"
              >
                <Key className="w-4 h-4 text-slate-600" />
                <span>Test Manual Login Screen</span>
              </button>

              {/* Option 3: Send real email via mail client */}
              <a
                href={mailtoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200/80 text-slate-700 rounded-xl text-xs font-medium transition-colors"
              >
                <Send className="w-3.5 h-3.5 text-slate-500" />
                <span>Send via Mail Client (mailto:)</span>
              </a>

              {/* Option 4: Copy full text */}
              <button
                onClick={copyFullCredentials}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200/80 text-slate-700 rounded-xl text-xs font-medium transition-colors"
              >
                {copiedKey === 'full' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Credentials Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-500" />
                    <span>Copy Full Credentials Text</span>
                  </>
                )}
              </button>
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3.5 bg-slate-100/80 border-t border-slate-200 flex items-center justify-between text-xs">
          <span className="text-slate-500">
            Email invitation sent to <strong className="text-slate-800">{emailData.recipientEmail}</strong>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-semibold rounded-xl transition-colors shadow-2xs"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
