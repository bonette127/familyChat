import React, { useState } from 'react';
import { 
  Shield, 
  Crown, 
  Users, 
  UserPlus, 
  CheckCircle2, 
  Clock, 
  KeyRound, 
  Mail, 
  Activity, 
  Eye, 
  Lock, 
  Unlock, 
  AlertTriangle, 
  Sparkles, 
  FileText, 
  Settings, 
  Save, 
  ExternalLink,
  ChevronRight,
  TrendingUp,
  MessageCircle,
  Camera,
  Calendar,
  Gift,
  UserMinus,
  Building,
  Edit2,
  BadgeCheck,
  UserCheck
} from 'lucide-react';
import { FamilyMember, FamilyUnit, SecurityAuditLog, Message, MilestoneCelebration, PhotoMemory } from '../types/family';

interface AdminDashboardProps {
  adminMember: FamilyMember;
  allMembers: FamilyMember[];
  familyUnits: FamilyUnit[];
  messages: Message[];
  milestones: MilestoneCelebration[];
  memories: PhotoMemory[];
  securityLogs: SecurityAuditLog[];
  adminCredentials: { email: string; password?: string; mainMemberId: string };
  onUpdateAdminCredentials: (email: string, password?: string) => void;
  onOpenRegisterMember: () => void;
  onOpenSuperAdminModal: () => void;
  onToggleChatAccess: (memberId: string) => void;
  onResetMemberPassword: (memberId: string, newPass: string) => void;
  onRemoveMember: (memberId: string) => void;
  onUpdateMemberRole?: (memberId: string, roleData: { role: string; familyRole?: string; familyUnitId?: string; familyUnitName?: string; hasChatAccess?: boolean; isLeader?: boolean; isOrgAdmin?: boolean }) => void;
  onSwitchToUserView: () => void;
  onSwitchToOrgAdminView?: () => void;
  onSwitchToSuperAdminView?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  adminMember,
  allMembers,
  familyUnits,
  messages,
  milestones,
  memories,
  securityLogs,
  adminCredentials,
  onUpdateAdminCredentials,
  onOpenRegisterMember,
  onOpenSuperAdminModal,
  onToggleChatAccess,
  onResetMemberPassword,
  onRemoveMember,
  onUpdateMemberRole,
  onSwitchToUserView,
  onSwitchToOrgAdminView,
  onSwitchToSuperAdminView,
}) => {
  const [activeAdminSection, setActiveAdminSection] = useState<'roles' | 'overview' | 'security' | 'audit'>('roles');
  const [memberToRemove, setMemberToRemove] = useState<FamilyMember | null>(null);
  
  // Role Editor Modal state
  const [editingMemberRole, setEditingMemberRole] = useState<FamilyMember | null>(null);
  const [selectedRoleTier, setSelectedRoleTier] = useState<string>('Active Family Member');
  const [selectedFamilyRole, setSelectedFamilyRole] = useState<string>('');
  const [selectedUnitId, setSelectedUnitId] = useState<string>('');
  const [selectedChatAccess, setSelectedChatAccess] = useState<boolean>(true);
  
  // Credentials update state
  const [adminEmail, setAdminEmail] = useState(adminCredentials.email || 'kibondoqueenmary2022@gmail.com');
  const [adminPassword, setAdminPassword] = useState(adminCredentials.password || 'admin');
  const [confirmPassword, setConfirmPassword] = useState(adminCredentials.password || 'admin');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);
  const [saveErrorMsg, setSaveErrorMsg] = useState<string | null>(null);

  // Member search & filter
  const [memberSearchQuery, setMemberSearchQuery] = useState('');
  const [selectedMemberForReset, setSelectedMemberForReset] = useState<FamilyMember | null>(null);
  const [newTempPassword, setNewTempPassword] = useState('');

  const handleOpenRoleEditor = (member: FamilyMember) => {
    setEditingMemberRole(member);
    setSelectedRoleTier(member.role || 'Active Family Member');
    setSelectedFamilyRole(member.familyRole || '');
    setSelectedUnitId(member.familyUnitId || (familyUnits[0]?.id || ''));
    setSelectedChatAccess(member.hasChatAccess ?? true);
  };

  const handleSaveMemberRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMemberRole || !onUpdateMemberRole) return;

    const unit = familyUnits.find((u) => u.id === selectedUnitId);
    const isBranchAdmin = selectedRoleTier === 'Unit / Branch Admin';

    onUpdateMemberRole(editingMemberRole.id, {
      role: selectedRoleTier,
      familyRole: selectedFamilyRole.trim() || editingMemberRole.familyRole,
      familyUnitId: selectedUnitId,
      familyUnitName: unit?.name,
      hasChatAccess: selectedChatAccess,
      isLeader: isBranchAdmin,
      isOrgAdmin: isBranchAdmin,
    });

    setSaveSuccessMsg(`Assigned role "${selectedRoleTier}" to ${editingMemberRole.name} successfully.`);
    setEditingMemberRole(null);
    setTimeout(() => setSaveSuccessMsg(null), 4000);
  };

  const handleSaveCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSuccessMsg(null);
    setSaveErrorMsg(null);

    if (!adminEmail.trim()) {
      setSaveErrorMsg('Admin email / username cannot be empty');
      return;
    }
    if (adminPassword.length < 5) {
      setSaveErrorMsg('Password must be at least 5 characters');
      return;
    }
    if (adminPassword !== confirmPassword) {
      setSaveErrorMsg('Passwords do not match');
      return;
    }

    onUpdateAdminCredentials(adminEmail.trim(), adminPassword);
    setSaveSuccessMsg('Family Admin credentials successfully updated and secured.');
    setTimeout(() => setSaveSuccessMsg(null), 4000);
  };

  const handleExecutePasswordReset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMemberForReset || !newTempPassword.trim()) return;
    onResetMemberPassword(selectedMemberForReset.id, newTempPassword.trim());
    setSelectedMemberForReset(null);
    setNewTempPassword('');
  };

  const filteredMembers = allMembers.filter((m) => {
    if (!memberSearchQuery.trim()) return true;
    const q = memberSearchQuery.toLowerCase();
    return (
      m.name.toLowerCase().includes(q) ||
      (m.familyRole || m.role || '').toLowerCase().includes(q) ||
      (m.email || '').toLowerCase().includes(q) ||
      (m.familyUnitName || '').toLowerCase().includes(q)
    );
  });

  const onlineCount = allMembers.filter((m) => m.isOnline).length;

  const getRoleBadgeStyle = (role: string, isAdmin?: boolean) => {
    if (isAdmin || role.includes('Head') || role.includes('Family Head')) {
      return 'bg-emerald-100 text-emerald-800 border-emerald-300';
    }
    if (role.includes('Branch') || role.includes('Unit') || role.includes('Org')) {
      return 'bg-teal-100 text-teal-800 border-teal-300';
    }
    if (role.includes('Elder')) {
      return 'bg-amber-100 text-amber-900 border-amber-300';
    }
    if (role.includes('Youth')) {
      return 'bg-purple-100 text-purple-800 border-purple-300';
    }
    return 'bg-indigo-50 text-indigo-700 border-indigo-200';
  };

  return (
    <div className="flex-1 flex flex-col h-full min-w-0 bg-slate-50 overflow-y-auto">
      {/* Top Banner: Distinct Family Admin Branding */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-900 text-white p-6 sm:p-8 shrink-0 shadow-md">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-400 flex items-center justify-center text-3xl shadow-inner shrink-0">
              👑
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-bold uppercase tracking-wider">
                  Family Admin Dashboard
                </span>
                <span className="px-2 py-0.5 rounded-full bg-white/10 text-emerald-100 text-xs font-semibold">
                  Lineage Head: {adminMember.name} (Mary)
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold font-display tracking-tight text-white mt-1">
                Family Admin Member & Role Management
              </h1>
              <p className="text-xs sm:text-sm text-emerald-100/80 mt-0.5 max-w-2xl">
                Manage all family members and the specific roles assigned to them within the system. Oversee household branches, regulate chat access, and configure lineage governance.
              </p>
            </div>
          </div>

          {/* Quick Perspective Switcher for Testing */}
          <div className="flex items-center gap-2 shrink-0 self-stretch sm:self-auto justify-end flex-wrap">
            {onSwitchToSuperAdminView && (
              <button
                onClick={onSwitchToSuperAdminView}
                className="px-3.5 py-2 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                title="Inspect Root Superadmin Platform Overseer Console"
              >
                <span>🌐 Superadmin View</span>
              </button>
            )}
            {onSwitchToOrgAdminView && (
              <button
                onClick={onSwitchToOrgAdminView}
                className="px-3.5 py-2 bg-teal-500/20 hover:bg-teal-500/30 text-teal-200 border border-teal-400/30 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                title="Preview Organization Administrator (David) Dashboard"
              >
                <Building className="w-3.5 h-3.5 text-teal-400" />
                <span>Branch Admin (David)</span>
              </button>
            )}
            <button
              onClick={onSwitchToUserView}
              className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Preview how regular family members (Sophia, Liam) operate"
            >
              <span>User View (Sophia)</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onOpenRegisterMember}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-2 cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>+ Add Member</span>
            </button>
          </div>
        </div>

        {/* Navigation Sub-Tabs */}
        <div className="max-w-6xl mx-auto flex items-center gap-2 mt-6 pt-4 border-t border-emerald-900 text-xs overflow-x-auto">
          <button
            onClick={() => setActiveAdminSection('roles')}
            className={`px-3.5 py-1.5 rounded-xl font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeAdminSection === 'roles'
                ? 'bg-emerald-500 text-white font-bold shadow-xs'
                : 'text-emerald-100 hover:text-white hover:bg-white/5'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Members & Assigned Roles Matrix</span>
            <span className="px-1.5 py-0.2 rounded-full bg-emerald-900 text-[10px] text-emerald-200 font-mono">
              {allMembers.length}
            </span>
          </button>
          <button
            onClick={() => setActiveAdminSection('overview')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition-colors cursor-pointer ${
              activeAdminSection === 'overview'
                ? 'bg-emerald-500 text-white font-bold shadow-xs'
                : 'text-emerald-100 hover:text-white hover:bg-white/5'
            }`}
          >
            Family Metrics Overview
          </button>
          <button
            onClick={() => setActiveAdminSection('security')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition-colors cursor-pointer ${
              activeAdminSection === 'security'
                ? 'bg-emerald-500 text-white font-bold shadow-xs'
                : 'text-emerald-100 hover:text-white hover:bg-white/5'
            }`}
          >
            Admin Credentials & Units
          </button>
          <button
            onClick={() => setActiveAdminSection('audit')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeAdminSection === 'audit'
                ? 'bg-emerald-500 text-white font-bold shadow-xs'
                : 'text-emerald-100 hover:text-white hover:bg-white/5'
            }`}
          >
            <span>Audit Trail</span>
            <span className="px-1.5 py-0.2 rounded-full bg-emerald-900 text-[10px] text-emerald-200 font-mono">
              {securityLogs.length}
            </span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-4 sm:p-6 max-w-6xl w-full mx-auto space-y-6">
        
        {saveSuccessMsg && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl text-xs font-semibold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{saveSuccessMsg}</span>
          </div>
        )}

        {/* SECTION 1: MEMBERS & ASSIGNED ROLES MANAGEMENT (PRIMARY FOCUS) */}
        {activeAdminSection === 'roles' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            
            {/* Explainer Card: Structure of System Roles */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                    <BadgeCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900 font-display">
                      How System Roles Operate within Family Forum
                    </h2>
                    <p className="text-xs text-slate-500">
                      Clear operational boundaries eliminate confusion and prevent administrative conflation
                    </p>
                  </div>
                </div>
                <span className="text-[10px] bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full font-bold">
                  {allMembers.length} Registered Accounts
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-xs">
                <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-emerald-900">
                    <Crown className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Family Head & Admin (Mary)</span>
                  </div>
                  <p className="text-[11px] text-emerald-800">
                    Appoints leaders, assigns roles, registers members, oversees all household branches, and holds root family authority.
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-teal-50/70 border border-teal-200/80 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-teal-900">
                    <Building className="w-3.5 h-3.5 text-teal-600" />
                    <span>Branch Admin (David)</span>
                  </div>
                  <p className="text-[11px] text-teal-800">
                    Oversees North Branch unit. Can add members to his branch and remove members he previously added.
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-indigo-50/70 border border-indigo-200/80 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-indigo-900">
                    <Users className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Active & Youth Members</span>
                  </div>
                  <p className="text-[11px] text-indigo-800">
                    Sophia, Liam, and Aunt Sarah operate in their personal space: chat, photo slideshow, milestone RSVPs, and daily check-ins.
                  </p>
                </div>
              </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
              <div>
                <h3 className="text-sm font-bold text-slate-900 font-display">
                  Family Lineage Roster & Role Matrix
                </h3>
                <p className="text-xs text-slate-400">
                  Click <strong className="text-slate-700">"Edit Role"</strong> on any member to reassign system permissions or household branch
                </p>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <input
                  type="text"
                  placeholder="Filter by name, role, branch..."
                  value={memberSearchQuery}
                  onChange={(e) => setMemberSearchQuery(e.target.value)}
                  className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-800 w-full sm:w-64"
                />
                <button
                  onClick={onOpenRegisterMember}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shrink-0 transition-colors cursor-pointer"
                >
                  + Add Member
                </button>
              </div>
            </div>

            {/* Member Roles Table */}
            <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50/90 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                      <th className="py-3.5 px-4">Member Name & Contact</th>
                      <th className="py-3.5 px-4">Assigned System Role</th>
                      <th className="py-3.5 px-4">Kinship / Lineage Title</th>
                      <th className="py-3.5 px-4">Household Branch</th>
                      <th className="py-3.5 px-4">Chat Permissions</th>
                      <th className="py-3.5 px-4 text-right">Family Admin Controls</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredMembers.map((m) => {
                      const isMainAdmin = m.id === adminMember.id || m.isAdmin;
                      return (
                        <tr key={m.id} className="hover:bg-slate-50/80 transition-colors">
                          {/* Member info */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2.5">
                              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-2xs ${m.avatarColor}`}>
                                {m.name.charAt(0)}
                              </div>
                              <div>
                                <p className="font-bold text-slate-800 flex items-center gap-1.5">
                                  <span>{m.name}</span>
                                  <span className={`w-2 h-2 rounded-full shrink-0 ${m.isOnline ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                                </p>
                                <p className="text-[10px] text-slate-400 font-mono">{m.email || 'No email registered'}</p>
                              </div>
                            </div>
                          </td>

                          {/* Assigned System Role */}
                          <td className="py-3.5 px-4">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-bold border ${getRoleBadgeStyle(m.role, m.isAdmin)}`}>
                              {m.isAdmin && <Crown className="w-3 h-3 text-emerald-600" />}
                              {m.isOrgAdmin && <Building className="w-3 h-3 text-teal-600" />}
                              <span>{m.role || 'Active Family Member'}</span>
                            </span>
                          </td>

                          {/* Kinship / Family Relationship */}
                          <td className="py-3.5 px-4">
                            <span className="font-semibold text-slate-800">{m.familyRole || 'Family Member'}</span>
                            <p className="text-[10px] text-slate-400">{m.generation || 'Family Circle'}</p>
                          </td>

                          {/* Household Branch */}
                          <td className="py-3.5 px-4">
                            <span className="font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-lg text-[11px]">
                              🏡 {m.familyUnitName || 'Central Branch'}
                            </span>
                          </td>

                          {/* Chat Permissions */}
                          <td className="py-3.5 px-4">
                            <button
                              type="button"
                              onClick={() => onToggleChatAccess(m.id)}
                              disabled={isMainAdmin}
                              className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-colors flex items-center gap-1 cursor-pointer ${
                                m.hasChatAccess
                                  ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200'
                                  : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
                              } ${isMainAdmin ? 'opacity-80 cursor-not-allowed' : ''}`}
                              title={isMainAdmin ? 'Family Head chat access is mandatory' : 'Click to toggle chat access'}
                            >
                              {m.hasChatAccess ? (
                                <>
                                  <Unlock className="w-3 h-3" />
                                  <span>Active Chat</span>
                                </>
                              ) : (
                                <>
                                  <Lock className="w-3 h-3" />
                                  <span>Restricted</span>
                                </>
                              )}
                            </button>
                          </td>

                          {/* Controls */}
                          <td className="py-3.5 px-4 text-right">
                            <div className="inline-flex items-center gap-1.5 justify-end">
                              {/* Edit Role Button */}
                              <button
                                type="button"
                                onClick={() => handleOpenRoleEditor(m)}
                                className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/80 rounded-lg text-[10px] font-bold transition-colors flex items-center gap-1 cursor-pointer shadow-2xs"
                                title="Change assigned role or household branch"
                              >
                                <Edit2 className="w-3 h-3" />
                                <span>Edit Role</span>
                              </button>

                              {/* Passcode Reset */}
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedMemberForReset(m);
                                  setNewTempPassword('family' + Math.floor(1000 + Math.random() * 9000));
                                }}
                                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[10px] font-semibold transition-colors cursor-pointer"
                                title="Issue temporary passcode"
                              >
                                Passcode
                              </button>

                              {/* Remove Member */}
                              {!isMainAdmin ? (
                                <button
                                  type="button"
                                  onClick={() => setMemberToRemove(m)}
                                  className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-[10px] font-bold transition-colors flex items-center gap-0.5 cursor-pointer"
                                  title="Remove member from lineage"
                                >
                                  <UserMinus className="w-3 h-3" />
                                  <span>Remove</span>
                                </button>
                              ) : (
                                <span className="text-[10px] text-slate-400 italic font-mono px-1">
                                  Head
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Role Assignment Modal */}
            {editingMemberRole && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
                <form
                  onSubmit={handleSaveMemberRole}
                  className="w-full max-w-md bg-white rounded-3xl border border-slate-200 p-6 shadow-2xl space-y-4"
                >
                  <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-white font-bold text-sm ${editingMemberRole.avatarColor}`}>
                      {editingMemberRole.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 font-display">
                        Assign Role for {editingMemberRole.name}
                      </h3>
                      <p className="text-xs text-slate-500">
                        Configure system authority tier, kinship title, and branch assignment
                      </p>
                    </div>
                  </div>

                  {/* System Role Selection */}
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                      System Permission Role
                    </label>
                    <select
                      value={selectedRoleTier}
                      onChange={(e) => setSelectedRoleTier(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    >
                      <option value="Active Family Member">Active Family Member (Standard User Space)</option>
                      <option value="Unit / Branch Admin">Unit / Branch Admin (Can manage branch members)</option>
                      <option value="Lineage Elder & Event Coordinator">Lineage Elder & Event Coordinator</option>
                      <option value="Youth Member">Youth Member (Student / Child)</option>
                      <option value="Family Head & Admin">Family Head & Admin (Co-Administrator)</option>
                    </select>
                  </div>

                  {/* Kinship / Family Role Title */}
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Kinship / Family Relationship Title
                    </label>
                    <input
                      type="text"
                      value={selectedFamilyRole}
                      onChange={(e) => setSelectedFamilyRole(e.target.value)}
                      placeholder="e.g. Eldest Daughter, Father, Uncle, Aunt, Cousin"
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-semibold"
                    />
                  </div>

                  {/* Branch Unit Assignment */}
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                      Household Branch Assignment
                    </label>
                    <select
                      value={selectedUnitId}
                      onChange={(e) => setSelectedUnitId(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
                    >
                      {familyUnits.map((u) => (
                        <option key={u.id} value={u.id}>
                          🏡 {u.name} (Leader: {u.leaderName || 'Mary'})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Chat Participation Access */}
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">Grant Chat Messaging Access</span>
                      <span className="text-[10px] text-slate-500">Allow member to post in Living Room and channel feeds</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={selectedChatAccess}
                      onChange={(e) => setSelectedChatAccess(e.target.checked)}
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setEditingMemberRole(null)}
                      className="px-3 py-2 text-xs text-slate-500 hover:text-slate-800 font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Save Assigned Role</span>
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Modal for Confirming Member Removal */}
            {memberToRemove && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
                <div className="w-full max-w-sm bg-white rounded-3xl border border-slate-200 p-5 shadow-2xl space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto">
                    <UserMinus className="w-6 h-6" />
                  </div>

                  <div className="text-center">
                    <h3 className="text-base font-bold font-display text-slate-900">
                      Remove {memberToRemove.name}?
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      As Family Admin, you are removing <span className="font-semibold text-slate-800">{memberToRemove.name}</span> ({memberToRemove.familyRole || memberToRemove.role}) from the lineage circle.
                    </p>
                    <p className="text-[11px] text-rose-600 bg-rose-50 p-2 rounded-xl mt-3 font-semibold">
                      Their access will be immediately revoked across all channels.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setMemberToRemove(null)}
                      className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onRemoveMember(memberToRemove.id);
                        setMemberToRemove(null);
                      }}
                      className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs cursor-pointer"
                    >
                      Confirm Remove
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Modal for Resetting Member Password */}
            {selectedMemberForReset && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
                <div className="w-full max-w-sm bg-white rounded-3xl border border-slate-200 p-5 shadow-2xl space-y-4">
                  <div className="flex items-center gap-2 text-indigo-700">
                    <KeyRound className="w-5 h-5" />
                    <h3 className="text-sm font-bold font-display text-slate-900">
                      Reset Password for {selectedMemberForReset.name}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500">
                    As Family Admin, you can provision a new login passcode for {selectedMemberForReset.name}.
                  </p>
                  <form onSubmit={handleExecutePasswordReset} className="space-y-3">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                        New Temporary Password
                      </label>
                      <input
                        type="text"
                        value={newTempPassword}
                        onChange={(e) => setNewTempPassword(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-800"
                        required
                      />
                    </div>
                    <div className="flex items-center justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setSelectedMemberForReset(null)}
                        className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-800 font-semibold"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
                      >
                        Confirm & Save
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

          </div>
        )}

        {/* SECTION 2: SYSTEM OVERVIEW */}
        {activeAdminSection === 'overview' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Quick Metrics Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
                <div className="flex items-center justify-between text-slate-500 mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider">Lineage Members</span>
                  <Users className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold font-display text-slate-900">{allMembers.length}</span>
                  <span className="text-xs text-emerald-600 font-semibold">● {onlineCount} online</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Across 2 Household Branches</p>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
                <div className="flex items-center justify-between text-slate-500 mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider">Forum Messages</span>
                  <MessageCircle className="w-4 h-4 text-indigo-600" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold font-display text-slate-900">{messages.length}</span>
                  <span className="text-xs text-slate-500">conversations</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Authentic family responses</p>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
                <div className="flex items-center justify-between text-slate-500 mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider">Life Celebrations</span>
                  <Sparkles className="w-4 h-4 text-rose-500" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold font-display text-slate-900">{milestones.length}</span>
                  <span className="text-xs text-rose-600 font-semibold">active</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Sophia & Daniel's Wedding</p>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
                <div className="flex items-center justify-between text-slate-500 mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider">Scrapbook Photos</span>
                  <Camera className="w-4 h-4 text-amber-500" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold font-display text-slate-900">{memories.length}</span>
                  <span className="text-xs text-amber-600 font-semibold">with slideshow</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Auto-cycling memories</p>
              </div>
            </div>

            {/* Lineage Branch Overview */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-2xs space-y-3">
              <h3 className="text-sm font-bold text-slate-900 font-display">
                Family Units & Lineage Branches
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {familyUnits.map((u) => {
                  const branchMembers = allMembers.filter((m) => m.familyUnitId === u.id);
                  return (
                    <div key={u.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 text-sm">🏡 {u.name}</span>
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          {branchMembers.length} Members
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">{u.description}</p>
                      <p className="text-[11px] text-slate-600">
                        Appointed Leader: <strong className="text-slate-800">{u.leaderName || 'Admin Mary'}</strong>
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* SECTION 3: ADMIN CREDENTIALS & SETTINGS */}
        {activeAdminSection === 'security' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-200">
            {/* Form to Update Admin Username & Password */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-2xs space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 font-display">
                    Family Head Credentials
                  </h3>
                  <p className="text-xs text-slate-400">
                    Update your admin username/email and login password
                  </p>
                </div>
              </div>

              {saveErrorMsg && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{saveErrorMsg}</span>
                </div>
              )}

              <form onSubmit={handleSaveCredentials} className="space-y-3.5 text-xs">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Admin Username / Email
                  </label>
                  <input
                    type="text"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 text-slate-800 font-semibold"
                    required
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    New Admin Password
                  </label>
                  <input
                    type="password"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 text-slate-800"
                    required
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Confirm Admin Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 text-slate-800"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Save New Credentials</span>
                </button>
              </form>
            </div>

            {/* Lineage Verification Details */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-2xs space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Crown className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 font-display">
                    Lineage Statutory Verification
                  </h3>
                  <p className="text-xs text-slate-400">
                    Criteria certified by Superadmin Platform Overseer
                  </p>
                </div>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block">National ID</span>
                  <span className="font-bold text-slate-800 font-mono text-sm">{adminMember.nationalIdNumber || 'NAT-ID-882194-HQ'}</span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block">Age Status</span>
                  <span className="font-bold text-emerald-700 text-sm">{adminMember.age || 48} Years (Eligible Adult: Over 25 ✓)</span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block">Lineage Representation</span>
                  <span className="font-bold text-slate-800 text-sm">Parent of {adminMember.childrenCount || 3} children</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 4: SECURITY AUDIT TRAIL */}
        {activeAdminSection === 'audit' && (
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-2xs space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 font-display">
                    Family Governance Security Audit Trail
                  </h3>
                  <p className="text-xs text-slate-400">
                    Transparent log of administrative appointments, role reassignments, and registrations
                  </p>
                </div>
              </div>
              <span className="text-xs font-mono text-slate-400">
                {securityLogs.length} events logged
              </span>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
              {securityLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-start justify-between gap-3 text-xs"
                >
                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-slate-800">{log.action.replace(/_/g, ' ')}</span>
                      <span className="text-[10px] text-slate-400">by {log.performedByName}</span>
                    </div>
                    <p className="text-slate-600 text-xs">{log.details}</p>
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
