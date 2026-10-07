import React, { useState } from 'react';
import { Shield, Key, Lock, X, Check, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { AdminCredentials, FamilyMember } from '../types/family';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  adminCredentials: AdminCredentials;
  onLoginSuccess: () => void;
  onUpdateCredentials: (newCreds: AdminCredentials) => void;
  isAdminLoggedIn: boolean;
  onAdminLogout: () => void;
  mainMember: FamilyMember;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  adminCredentials,
  onLoginSuccess,
  onUpdateCredentials,
  isAdminLoggedIn,
  onAdminLogout,
  mainMember,
}) => {
  const [emailInput, setEmailInput] = useState(adminCredentials.email);
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Change password states
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const emailMatch =
      emailInput.trim().toLowerCase() === adminCredentials.email.toLowerCase() ||
      emailInput.trim().toLowerCase() === 'admin';

    const passMatch = passwordInput === adminCredentials.password;

    if (emailMatch && passMatch) {
      onLoginSuccess();
      setPasswordInput('');
      onClose();
    } else {
      setErrorMsg('Invalid admin credentials. Please verify your email/username and password.');
    }
  };

  const handleChangePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (newPassword.length < 4) {
      setErrorMsg('New password must be at least 4 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg('New password and confirmation do not match.');
      return;
    }

    onUpdateCredentials({
      ...adminCredentials,
      password: newPassword,
    });
    setSuccessNotice('Admin password updated successfully.');
    setIsChangingPassword(false);
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(() => setSuccessNotice(null), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 font-display">
                Main Member & Admin Console
              </h3>
              <p className="text-xs text-slate-500">
                Grant chat access and manage family permissions
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

        {/* Modal Body */}
        <div className="p-6">
          {successNotice && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successNotice}</span>
            </div>
          )}

          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {isAdminLoggedIn ? (
            /* Logged In View */
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm ${mainMember.avatarColor}`}>
                    {mainMember.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-bold text-slate-900">{mainMember.name}</p>
                      <span className="text-[10px] bg-emerald-600 text-white font-semibold px-2 py-0.5 rounded-full">
                        Admin Active
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">{adminCredentials.email}</p>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-xs text-slate-600 space-y-1.5">
                <p className="font-semibold text-slate-800 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Admin Authority Granted</span>
                </p>
                <p className="text-[11px] leading-relaxed text-slate-500">
                  As the main member, you have full privileges to add family members, grant or revoke chat access, and configure group permissions.
                </p>
              </div>

              {isChangingPassword ? (
                <form onSubmit={handleChangePasswordSubmit} className="space-y-3 pt-2 border-t border-slate-100">
                  <p className="text-xs font-bold text-slate-800">Update Admin Password</p>
                  <input
                    type="password"
                    placeholder="New password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900"
                    required
                  />
                  <input
                    type="password"
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900"
                    required
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsChangingPassword(false)}
                      className="px-3 py-1.5 text-xs text-slate-600"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-3.5 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded-xl"
                    >
                      Save Password
                    </button>
                  </div>
                </form>
              ) : (
                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => setIsChangingPassword(true)}
                    className="text-xs text-slate-600 hover:text-slate-900 font-medium underline-offset-4 hover:underline"
                  >
                    Change Admin Password
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onAdminLogout();
                      onClose();
                    }}
                    className="px-4 py-2 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-xl text-xs font-semibold transition-colors border border-rose-200"
                  >
                    Lock / Log Out Admin
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Login Form View */
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div className="p-3 bg-amber-50/80 border border-amber-200/80 rounded-2xl text-xs text-amber-900 space-y-1">
                <p className="font-semibold flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-amber-600" />
                  <span>Main Member Login Required</span>
                </p>
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  Only the main member can add new members and grant chat access. Log in with admin credentials below.
                </p>
                <div className="mt-1.5 pt-1.5 border-t border-amber-200/60 font-mono text-[10px] text-amber-800">
                  <span>Default Email: <strong>{adminCredentials.email}</strong> · Pass: <strong>{adminCredentials.password}</strong></span>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Admin Email / Username
                </label>
                <input
                  type="text"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
                  placeholder="admin@kinfolk.family or admin"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Admin Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white pr-10"
                    placeholder="Enter admin password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Log In as Admin</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
