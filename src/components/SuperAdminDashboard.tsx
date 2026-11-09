import React, { useState } from 'react';
import { 
  Crown, 
  ShieldAlert, 
  ShieldCheck, 
  Users, 
  AlertTriangle, 
  CheckCircle2, 
  FileText, 
  KeyRound, 
  Clock, 
  IdCard,
  UserX,
  ExternalLink,
  Building,
  Server,
  Activity,
  ArrowRight,
  Database,
  Lock,
  Unlock,
  RotateCcw,
  Trash2,
  Plus
} from 'lucide-react';
import { FamilyMember, SecurityAuditLog, FamilyUnit } from '../types/family';

interface SuperAdminDashboardProps {
  members: FamilyMember[];
  familyUnits: FamilyUnit[];
  securityLogs: SecurityAuditLog[];
  onRevokeAdmin: (adminMemberId: string, reason: string) => void;
  onResetMemberPassword: (memberId: string, newPass: string) => void;
  onDeleteOrganization: (unitId: string, reason: string) => void;
  onRegisterOrganization?: (data: { name: string; description: string; leaderName: string; leaderEmail: string }) => void;
  onSwitchToFamilyAdmin: () => void;
  onSwitchToOrgAdmin: () => void;
  onSwitchToUserView: () => void;
}

export const SuperAdminDashboard: React.FC<SuperAdminDashboardProps> = ({
  members,
  familyUnits,
  securityLogs,
  onRevokeAdmin,
  onResetMemberPassword,
  onDeleteOrganization,
  onRegisterOrganization,
  onSwitchToFamilyAdmin,
  onSwitchToOrgAdmin,
  onSwitchToUserView,
}) => {
  const [activeSection, setActiveSection] = useState<'organizations' | 'heads' | 'architecture' | 'logs'>('organizations');
  
  // Organization removal state
  const [selectedUnitToDelete, setSelectedUnitToDelete] = useState<FamilyUnit | null>(null);
  const [deleteOrgReason, setDeleteOrgReason] = useState('');
  
  // Admin revocation state
  const [selectedAdminToRevoke, setSelectedAdminToRevoke] = useState<FamilyMember | null>(null);
  const [revokeReason, setRevokeReason] = useState('');

  // Password reset state
  const [selectedMemberForReset, setSelectedMemberForReset] = useState<FamilyMember | null>(null);
  const [newTempPassword, setNewTempPassword] = useState('');
  
  // New Organization Modal state
  const [isRegisteringOrg, setIsRegisteringOrg] = useState(false);
  const [newOrgName, setNewOrgName] = useState('');
  const [newOrgDesc, setNewOrgDesc] = useState('');
  const [newOrgLeaderName, setNewOrgLeaderName] = useState('');
  const [newOrgLeaderEmail, setNewOrgLeaderEmail] = useState('');

  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  // Filter family admins (like Mary)
  const familyAdmins = members.filter((m) => m.isAdmin);

  const handleConfirmDeleteOrganization = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUnitToDelete || !deleteOrgReason.trim()) return;

    const unitName = selectedUnitToDelete.name;
    onDeleteOrganization(selectedUnitToDelete.id, deleteOrgReason.trim());
    setSuccessNotice(`Deleted entire organization "${unitName}" and purged associated members to eliminate chaos. Action recorded in audit trail.`);
    setSelectedUnitToDelete(null);
    setDeleteOrgReason('');
    setTimeout(() => setSuccessNotice(null), 5000);
  };

  const handleRevokeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAdminToRevoke || !revokeReason.trim()) return;

    onRevokeAdmin(selectedAdminToRevoke.id, revokeReason.trim());
    setSuccessNotice(`Administrative privileges revoked for ${selectedAdminToRevoke.name}. Action logged to audit trail.`);
    setSelectedAdminToRevoke(null);
    setRevokeReason('');
    setTimeout(() => setSuccessNotice(null), 5000);
  };

  const handlePasswordResetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMemberForReset || !newTempPassword.trim()) return;

    onResetMemberPassword(selectedMemberForReset.id, newTempPassword.trim());
    setSuccessNotice(`Passcode for ${selectedMemberForReset.name} reset by Super Admin Bonette.`);
    setSelectedMemberForReset(null);
    setNewTempPassword('');
    setTimeout(() => setSuccessNotice(null), 4000);
  };

  const handleCreateOrgSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrgName.trim() || !newOrgLeaderName.trim()) return;

    if (onRegisterOrganization) {
      onRegisterOrganization({
        name: newOrgName.trim(),
        description: newOrgDesc.trim() || 'Standard registered organization branch',
        leaderName: newOrgLeaderName.trim(),
        leaderEmail: newOrgLeaderEmail.trim() || 'leader@family.org',
      });
      setSuccessNotice(`Organization "${newOrgName}" registered with administrator ${newOrgLeaderName}.`);
      setIsRegisteringOrg(false);
      setNewOrgName('');
      setNewOrgDesc('');
      setNewOrgLeaderName('');
      setNewOrgLeaderEmail('');
      setTimeout(() => setSuccessNotice(null), 4000);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full min-w-0 bg-slate-950 text-slate-100 overflow-y-auto font-sans">
      
      {/* Superadmin Top Banner: Deep Midnight Platform Owner Theme */}
      <div className="bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 border-b border-indigo-500/30 p-6 sm:p-8 shrink-0">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 border border-indigo-400/40 text-indigo-400 flex items-center justify-center text-3xl shadow-inner shrink-0">
              👑
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/30 border border-indigo-400/40 text-indigo-200 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Platform Owner: Bonette
                </span>
                <span className="px-2 py-0.5 rounded-full bg-white/10 text-slate-200 text-xs font-mono font-bold">
                  Username: IBYO YAKOZE
                </span>
                <span className="px-2 py-0.5 rounded-full bg-indigo-900/60 text-indigo-300 text-xs font-mono">
                  Root Sovereign Authority
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold font-display tracking-tight text-white mt-1">
                Super Admin Platform Governance Console
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5 max-w-2xl">
                I am Bonette (IBYO YAKOZE), owner of this platform. I oversee all organizations and administrators to ensure order. If chaos or misconduct arises, I have authority to delete that entire organization from the system.
              </p>
            </div>
          </div>

          {/* Perspective Switcher Controls */}
          <div className="flex items-center gap-2 shrink-0 self-stretch sm:self-auto justify-end flex-wrap">
            <button
              onClick={onSwitchToFamilyAdmin}
              className="px-3.5 py-2 bg-emerald-600/30 hover:bg-emerald-600/40 text-emerald-200 border border-emerald-500/40 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
              title="Switch to Family Admin (Mary) Dashboard"
            >
              <Crown className="w-3.5 h-3.5 text-emerald-400" />
              <span>Family Admin View (Mary)</span>
            </button>
            <button
              onClick={onSwitchToOrgAdmin}
              className="px-3.5 py-2 bg-teal-600/30 hover:bg-teal-600/40 text-teal-200 border border-teal-500/40 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
              title="Switch to Organization Admin (David) Dashboard"
            >
              <Building className="w-3.5 h-3.5 text-teal-400" />
              <span>Branch Admin View (David)</span>
            </button>
            <button
              onClick={onSwitchToUserView}
              className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
              title="Switch to Individual Member (Sophia) Dashboard"
            >
              <ExternalLink className="w-3.5 h-3.5 text-indigo-400" />
              <span>User View (Sophia)</span>
            </button>
          </div>
        </div>

        {/* Console Navigation Sub-Tabs */}
        <div className="max-w-6xl mx-auto flex items-center gap-2 mt-6 pt-4 border-t border-slate-800 text-xs overflow-x-auto">
          <button
            onClick={() => setActiveSection('organizations')}
            className={`px-3.5 py-1.5 rounded-xl font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeSection === 'organizations'
                ? 'bg-indigo-600 text-white font-bold shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Building className="w-3.5 h-3.5" />
            <span>Organizations Oversight & Deletion</span>
            <span className="px-1.5 py-0.2 rounded-full bg-slate-900 text-[10px] text-slate-300 font-mono">
              {familyUnits.length}
            </span>
          </button>
          <button
            onClick={() => setActiveSection('heads')}
            className={`px-3.5 py-1.5 rounded-xl font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeSection === 'heads'
                ? 'bg-indigo-600 text-white font-bold shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Family Admins Verification</span>
            <span className="px-1.5 py-0.2 rounded-full bg-slate-900 text-[10px] text-slate-300 font-mono">
              {familyAdmins.length}
            </span>
          </button>
          <button
            onClick={() => setActiveSection('architecture')}
            className={`px-3.5 py-1.5 rounded-xl font-semibold transition-colors cursor-pointer ${
              activeSection === 'architecture'
                ? 'bg-indigo-600 text-white font-bold shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            Governance Hierarchy
          </button>
          <button
            onClick={() => setActiveSection('logs')}
            className={`px-3.5 py-1.5 rounded-xl font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeSection === 'logs'
                ? 'bg-indigo-600 text-white font-bold shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <span>Root Audit Trail</span>
            <span className="px-1.5 py-0.2 rounded-full bg-slate-900 text-[10px] text-slate-300 font-mono">
              {securityLogs.length}
            </span>
          </button>
        </div>
      </div>

      {/* Main Body Content */}
      <div className="flex-1 p-4 sm:p-6 max-w-6xl w-full mx-auto space-y-6">
        
        {/* Success Alert */}
        {successNotice && (
          <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{successNotice}</span>
          </div>
        )}

        {/* Platform Overview Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider">Organizations</span>
              <Building className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="text-2xl font-bold font-display text-white">{familyUnits.length}</div>
            <p className="text-[11px] text-indigo-300 mt-1">Managed under Bonette</p>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider">Verified Admins</span>
              <Crown className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-bold font-display text-white">{familyAdmins.length}</div>
            <p className="text-[11px] text-slate-400 mt-1">ID & Age verified</p>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider">Total Members</span>
              <Users className="w-4 h-4 text-teal-400" />
            </div>
            <div className="text-2xl font-bold font-display text-white">{members.length}</div>
            <p className="text-[11px] text-slate-400 mt-1">Monitored for anti-chaos</p>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider">Platform Integrity</span>
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold font-display text-emerald-400">100% Strict</div>
            <p className="text-[11px] text-slate-400 mt-1">Zero-chaos enforcement</p>
          </div>
        </div>

        {/* SECTION 1: ORGANIZATIONS OVERSIGHT & EMERGENCY DELETION */}
        {activeSection === 'organizations' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-bold text-white font-display flex items-center gap-2">
                  <Building className="w-4 h-4 text-indigo-400" />
                  <span>Organizations & Household Lineages Under Surveillance</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  As Super Admin Bonette, you monitor all registered organizations. If any organization exhibits chaos, bad behavior, or disputes, you can delete that entire organization from the system immediately.
                </p>
              </div>
              <button
                onClick={() => setIsRegisteringOrg(true)}
                className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shrink-0 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Register Organization</span>
              </button>
            </div>

            {/* Organizations Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {familyUnits.map((unit) => {
                const orgMembers = members.filter((m) => m.familyUnitId === unit.id);
                return (
                  <div
                    key={unit.id}
                    className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-3.5 hover:border-slate-700 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-bold text-white">🏡 {unit.name}</h3>
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/30">
                            Active Unit
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">{unit.description}</p>
                      </div>

                      {/* Delete Entire Organization Button */}
                      <button
                        onClick={() => setSelectedUnitToDelete(unit)}
                        className="px-3 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
                        title="Delete this entire organization from system to eliminate chaos"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                        <span>Delete Organization</span>
                      </button>
                    </div>

                    <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400">Organization Administrator:</span>
                        <strong className="text-slate-200">{unit.leaderName || 'Mary (Family Head)'}</strong>
                      </div>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400">Registered Members:</span>
                        <span className="font-mono text-emerald-400 font-bold">{orgMembers.length} Accounts</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400">Creation Timestamp:</span>
                        <span className="text-slate-400 font-mono text-[10px]">
                          {unit.createdAt ? new Date(unit.createdAt).toLocaleDateString() : 'Active'}
                        </span>
                      </div>
                    </div>

                    {/* Member Pills preview */}
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block mb-1.5">
                        Organization Members ({orgMembers.length})
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {orgMembers.map((m) => (
                          <span
                            key={m.id}
                            className="px-2 py-0.5 rounded-lg bg-slate-800 text-slate-300 text-[11px] font-semibold flex items-center gap-1"
                          >
                            <span className={`w-2 h-2 rounded-full ${m.avatarColor}`} />
                            <span>{m.name}</span>
                            <span className="text-[9px] text-slate-500">({m.familyRole || m.role})</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Modal: Confirm Deleting Entire Organization */}
            {selectedUnitToDelete && (
              <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
                <form
                  onSubmit={handleConfirmDeleteOrganization}
                  className="w-full max-w-md bg-slate-900 border border-rose-500/40 rounded-3xl p-6 shadow-2xl space-y-4"
                >
                  <div className="w-14 h-14 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/40 flex items-center justify-center mx-auto">
                    <Trash2 className="w-7 h-7" />
                  </div>

                  <div className="text-center">
                    <h3 className="text-lg font-bold font-display text-white">
                      Delete Entire Organization: {selectedUnitToDelete.name}?
                    </h3>
                    <p className="text-xs text-slate-300 mt-1">
                      As Super Admin & Platform Owner <span className="text-white font-bold">Bonette (IBYO YAKOZE)</span>, you are deleting this organization from the platform.
                    </p>
                    <p className="text-xs text-rose-400 bg-rose-950/60 p-2.5 rounded-xl border border-rose-500/30 mt-3 font-semibold text-left">
                      ⚠️ Strict Requirement: All members in this organization and its records will be completely removed to eliminate chaos. This action is permanently logged to the root audit trail.
                    </p>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Formal Reason for Organization Deletion *
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={deleteOrgReason}
                      onChange={(e) => setDeleteOrgReason(e.target.value)}
                      placeholder="e.g. Chaotic disputes, breach of platform rules, unresolvable misconduct by members..."
                      className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedUnitToDelete(null);
                        setDeleteOrgReason('');
                      }}
                      className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-md"
                    >
                      Delete Entire Organization
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Modal: Register New Organization (Standard Way) */}
            {isRegisteringOrg && (
              <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
                <form
                  onSubmit={handleCreateOrgSubmit}
                  className="w-full max-w-md bg-slate-900 border border-indigo-500/40 rounded-3xl p-6 shadow-2xl space-y-4"
                >
                  <div className="flex items-center gap-2.5 text-indigo-400">
                    <Building className="w-5 h-5" />
                    <h3 className="text-base font-bold font-display text-white">
                      Register Organization in Standard Way
                    </h3>
                  </div>
                  <p className="text-xs text-slate-400">
                    Register a new organization and appoint its administrator. The organization admin can then register their members.
                  </p>

                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                        Organization Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. South Branch Household"
                        value={newOrgName}
                        onChange={(e) => setNewOrgName(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                        Organization Description
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Southern regional family circle"
                        value={newOrgDesc}
                        onChange={(e) => setNewOrgDesc(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                        Appointed Organization Administrator Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Robert Smith"
                        value={newOrgLeaderName}
                        onChange={(e) => setNewOrgLeaderName(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                        Administrator Email
                      </label>
                      <input
                        type="email"
                        placeholder="e.g. robert@family.org"
                        value={newOrgLeaderEmail}
                        onChange={(e) => setNewOrgLeaderEmail(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsRegisteringOrg(false)}
                      className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-md"
                    >
                      Register Organization
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}

        {/* SECTION 2: VERIFIED FAMILY ADMINS */}
        {activeSection === 'heads' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30">
              <div>
                <h2 className="text-sm font-bold text-white font-display flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Verified Family Admins (Heads of Family)</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Super Admin Bonette oversees all family heads. If a family head fails to maintain order, Bonette can revoke or replace them.
                </p>
              </div>
              <span className="text-xs font-mono text-indigo-300 bg-indigo-500/20 px-2.5 py-1 rounded-lg border border-indigo-400/30">
                Statutory Criteria: Age 25+ • National ID • Parentage
              </span>
            </div>

            {/* List of Family Heads */}
            <div className="space-y-3">
              {familyAdmins.map((admin) => (
                <div
                  key={admin.id}
                  className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-4"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white text-lg font-bold shadow-md ${admin.avatarColor}`}>
                        {admin.name.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-base font-bold text-white">{admin.name}</h3>
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold">
                            Verified Family Head
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 text-xs font-mono">
                            {admin.email}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Lineage: <span className="text-slate-200 font-semibold">{admin.familyUnitName || 'Central Lineage'}</span> • Role: <span className="text-emerald-300">{admin.role}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
                      <button
                        onClick={() => {
                          setSelectedMemberForReset(admin);
                          setNewTempPassword('family' + Math.floor(1000 + Math.random() * 9000));
                        }}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <KeyRound className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Reset Passcode</span>
                      </button>
                      <button
                        onClick={() => setSelectedAdminToRevoke(admin)}
                        className="px-3 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                        title="Revoke Family Admin privileges"
                      >
                        <UserX className="w-3.5 h-3.5" />
                        <span>Revoke Admin</span>
                      </button>
                    </div>
                  </div>

                  {/* Verification Criteria Matrix */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 text-xs">
                    <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800">
                      <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Age Verification</span>
                      <span className="text-sm font-bold text-emerald-400 font-mono flex items-center gap-1 mt-0.5">
                        <span>{admin.age || 48} Years</span>
                        <span className="text-[10px] text-slate-400">(Req &gt; 25: ✓)</span>
                      </span>
                    </div>

                    <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800">
                      <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">National ID</span>
                      <span className="text-sm font-bold text-slate-200 font-mono truncate block mt-0.5">
                        {admin.nationalIdNumber || 'NAT-ID-882194-HQ'}
                      </span>
                    </div>

                    <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800">
                      <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Lineage Representation</span>
                      <span className="text-sm font-bold text-indigo-300 font-mono flex items-center gap-1 mt-0.5">
                        <span>{admin.childrenCount || 3} Children</span>
                        <span className="text-[10px] text-emerald-400">✓</span>
                      </span>
                    </div>

                    <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800">
                      <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Admin Standing</span>
                      <span className="text-sm font-bold text-emerald-400 flex items-center gap-1 mt-0.5">
                        <span>Good Standing</span>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Revoke Family Admin Dialog Modal */}
            {selectedAdminToRevoke && (
              <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
                <form
                  onSubmit={handleRevokeSubmit}
                  className="w-full max-w-md bg-slate-900 border border-rose-500/40 rounded-3xl p-6 shadow-2xl space-y-4"
                >
                  <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/40 flex items-center justify-center mx-auto">
                    <UserX className="w-6 h-6" />
                  </div>

                  <div className="text-center">
                    <h3 className="text-base font-bold font-display text-white">
                      Revoke Family Admin: {selectedAdminToRevoke.name}?
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      As Super Admin Bonette, you are removing administrative rights from <span className="text-white font-semibold">{selectedAdminToRevoke.name}</span>. A formal audit justification is required.
                    </p>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Formal Reason for Revocation *
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={revokeReason}
                      onChange={(e) => setRevokeReason(e.target.value)}
                      placeholder="e.g. Failure to maintain family order, misconduct, or requested transition..."
                      className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedAdminToRevoke(null);
                        setRevokeReason('');
                      }}
                      className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-md"
                    >
                      Confirm Revocation
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Reset Passcode Modal */}
            {selectedMemberForReset && (
              <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
                <form
                  onSubmit={handlePasswordResetSubmit}
                  className="w-full max-w-sm bg-slate-900 border border-slate-700 rounded-3xl p-5 shadow-2xl space-y-4"
                >
                  <div className="flex items-center gap-2 text-indigo-400">
                    <KeyRound className="w-5 h-5" />
                    <h3 className="text-sm font-bold font-display text-white">
                      Superadmin Passcode Reset: {selectedMemberForReset.name}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-400">
                    Issue a new temporary login passcode for this administrator.
                  </p>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      New Temporary Passcode
                    </label>
                    <input
                      type="text"
                      required
                      value={newTempPassword}
                      onChange={(e) => setNewTempPassword(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-xl font-mono text-white"
                    />
                  </div>
                  <div className="flex items-center gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setSelectedMemberForReset(null)}
                      className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold"
                    >
                      Save Passcode
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}

        {/* SECTION 3: SYSTEM ROLE ARCHITECTURE & HIERARCHY */}
        {activeSection === 'architecture' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
              <h2 className="text-base font-bold text-white font-display">
                Governance Hierarchy: Platform Owner Bonette vs. Family Admins vs. Branch Admins vs. Users
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                Authority is organized into four distinct architectural tiers with absolute clarity:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                {/* Level 1: Platform Owner & Super Admin */}
                <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                      <span>👑 Level 1: Super Admin (Bonette / IBYO YAKOZE)</span>
                    </span>
                    <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full font-mono">
                      Platform Owner
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Owner of the entire platform. Monitors the entire system to ensure everything is running smoothly. Has authority to delete any organization if issues or chaos arise.
                  </p>
                </div>

                {/* Level 2: Family Admin */}
                <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                      <span>👑 Level 2: Family Admin (Mary)</span>
                    </span>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-mono">
                      Lineage Head
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Governs this specific family forum and lineage circle. Manages members, assigns roles, appoints branch leaders, creates household units, and regulates chat access.
                  </p>
                </div>

                {/* Level 3: Organization Admin */}
                <div className="p-4 rounded-2xl bg-teal-950/40 border border-teal-500/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-teal-300 uppercase tracking-wider flex items-center gap-1.5">
                      <span>🏢 Level 3: Organization / Branch Admin (David)</span>
                    </span>
                    <span className="text-[10px] bg-teal-500/20 text-teal-300 px-2 py-0.5 rounded-full font-mono">
                      Unit Head
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Registers their organization in the standard way, registers their members, and manages their branch unit.
                  </p>
                </div>

                {/* Level 4: Individual Family Member */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                      <span>👤 Level 4: Individual Family Users</span>
                    </span>
                    <span className="text-[10px] bg-white/10 text-slate-300 px-2 py-0.5 rounded-full font-mono">
                      Lineage Circle
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Family members (Sophia, Liam, Aunt Sarah) operate in their personal space: chat, photo slideshow, milestones RSVPs, and daily check-ins.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 4: ROOT AUDIT TRAIL */}
        {activeSection === 'logs' && (
          <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-400" />
                <h3 className="text-sm font-bold text-white font-display">
                  Cryptographic System Audit Trail
                </h3>
              </div>
              <span className="text-xs font-mono text-slate-400">
                {securityLogs.length} logged events
              </span>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
              {securityLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs flex items-start justify-between gap-3"
                >
                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`font-bold font-mono text-[11px] ${
                        log.action.includes('DELETE') ? 'text-rose-400' : 'text-indigo-300'
                      }`}>
                        {log.action}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        by {log.performedByName}
                      </span>
                    </div>
                    <p className="text-slate-300 text-xs">{log.details}</p>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono shrink-0">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
