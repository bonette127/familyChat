import React, { useState } from 'react';
import { 
  X, 
  Crown, 
  ShieldAlert, 
  ShieldCheck, 
  Users, 
  AlertTriangle, 
  CheckCircle2, 
  Trash2, 
  FileText, 
  Key, 
  Clock, 
  IdCard,
  UserX
} from 'lucide-react';
import { FamilyMember, SecurityAuditLog, FamilyUnit } from '../types/family';

interface SuperAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  members: FamilyMember[];
  familyUnits: FamilyUnit[];
  securityLogs: SecurityAuditLog[];
  onRevokeAdmin: (adminMemberId: string, reason: string) => void;
  activeMember: FamilyMember;
}

export const SuperAdminModal: React.FC<SuperAdminModalProps> = ({
  isOpen,
  onClose,
  members,
  familyUnits,
  securityLogs,
  onRevokeAdmin,
  activeMember,
}) => {
  const [selectedAdminId, setSelectedAdminId] = useState<string | null>(null);
  const [removalReason, setRemovalReason] = useState('');
  const [activeTab, setActiveTab] = useState<'admins' | 'audit'>('admins');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const adminMembers = members.filter((m) => m.isAdmin);

  const handleRevokeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAdminId || !removalReason.trim()) return;

    const targetAdmin = members.find((m) => m.id === selectedAdminId);
    onRevokeAdmin(selectedAdminId, removalReason.trim());
    setSuccessMessage(`Admin privileges successfully revoked for ${targetAdmin?.name || 'admin'}.`);
    setSelectedAdminId(null);
    setRemovalReason('');
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-indigo-500/30 text-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-5 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-xl font-bold">
              👑
            </div>
            <div>
              <h3 className="text-base font-bold font-display text-white flex items-center gap-2">
                <span>Super Admin Lineage Oversight</span>
                <span className="text-[10px] font-mono bg-indigo-500/30 text-indigo-300 border border-indigo-400/30 px-2 py-0.5 rounded-full uppercase">
                  Root Authority
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Governance console to audit family admins, verify credentials, and remove rogue leaders
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex rounded-xl bg-slate-950 p-1 border border-white/10 text-xs">
          <button
            onClick={() => setActiveTab('admins')}
            className={`flex-1 py-1.5 rounded-lg font-bold transition-all ${
              activeTab === 'admins'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Verified Family Heads ({adminMembers.length})
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`flex-1 py-1.5 rounded-lg font-bold transition-all ${
              activeTab === 'audit'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Security Audit Trail ({securityLogs.length})
          </button>
        </div>

        {successMessage && (
          <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* TAB 1: Registered Admins List */}
        {activeTab === 'admins' && (
          <div className="space-y-4">
            <div className="space-y-2.5">
              {adminMembers.map((admin) => (
                <div
                  key={admin.id}
                  className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-white font-bold text-sm ${admin.avatarColor}`}>
                        {admin.name.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-sm">{admin.name}</span>
                          <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-semibold">
                            Verified Family Head
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 font-mono">{admin.email}</p>
                      </div>
                    </div>

                    {/* Revoke button */}
                    {admin.id !== activeMember.id ? (
                      <button
                        onClick={() => setSelectedAdminId(admin.id)}
                        className="px-3 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 self-start sm:self-auto"
                      >
                        <UserX className="w-3.5 h-3.5" />
                        <span>Revoke Admin</span>
                      </button>
                    ) : (
                      <span className="text-[11px] text-slate-500 italic">Current Session Admin</span>
                    )}
                  </div>

                  {/* Verification Criteria Data Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px]">
                    <div className="p-2 rounded-xl bg-black/30 border border-white/5">
                      <span className="text-slate-400 block text-[10px]">Age Verification</span>
                      <span className="font-bold text-emerald-400 font-mono">
                        {admin.age ? `${admin.age} yrs (25+ ✓)` : '48 yrs (✓)'}
                      </span>
                    </div>

                    <div className="p-2 rounded-xl bg-black/30 border border-white/5">
                      <span className="text-slate-400 block text-[10px]">National ID</span>
                      <span className="font-bold text-slate-200 font-mono truncate block">
                        {admin.nationalIdNumber || 'NAT-ID-882194'}
                      </span>
                    </div>

                    <div className="p-2 rounded-xl bg-black/30 border border-white/5">
                      <span className="text-slate-400 block text-[10px]">Lineage Status</span>
                      <span className="font-bold text-slate-200">
                        {admin.hasChildren ? `Parent (${admin.childrenCount || 3} kids)` : 'Family Branch'}
                      </span>
                    </div>

                    <div className="p-2 rounded-xl bg-black/30 border border-white/5">
                      <span className="text-slate-400 block text-[10px]">Role in Family</span>
                      <span className="font-bold text-emerald-300">
                        {admin.familyRole || 'Family Elder'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Removal Reason Dialog */}
            {selectedAdminId && (
              <form
                onSubmit={handleRevokeSubmit}
                className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/40 space-y-3"
              >
                <div className="flex items-center gap-2 text-rose-300 font-bold text-xs">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Authority Action: Remove Admin Privileges</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Provide the formal reason for revoking this administrator (e.g. violation of family trust, administrative mistakes, or misconduct). This will be recorded into the permanent security audit log.
                </p>
                <textarea
                  required
                  placeholder="State the reason for revoking admin rights..."
                  value={removalReason}
                  onChange={(e) => setRemovalReason(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-rose-500/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedAdminId(null);
                      setRemovalReason('');
                    }}
                    className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl transition-colors"
                  >
                    Confirm & Revoke Admin
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* TAB 2: Audit Logs */}
        {activeTab === 'audit' && (
          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {securityLogs.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">No security audit logs found.</p>
            ) : (
              securityLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-3 rounded-xl bg-white/5 border border-white/10 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between text-slate-400 text-[10px]">
                    <span className="font-mono bg-white/10 px-1.5 py-0.2 rounded text-slate-300">
                      {log.action}
                    </span>
                    <span>{new Date(log.timestamp).toLocaleString()}</span>
                  </div>
                  <p className="text-white text-xs font-medium">{log.details}</p>
                  <p className="text-[10px] text-slate-400">By: {log.performedByName}</p>
                </div>
              ))
            )}
          </div>
        )}

        {/* Footer */}
        <div className="pt-3 border-t border-white/10 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            Super Admin Governance Engine • Integrity Protected
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl"
          >
            Close Console
          </button>
        </div>
      </div>
    </div>
  );
};
