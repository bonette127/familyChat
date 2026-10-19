import React, { useState } from 'react';
import {
  X,
  Crown,
  Shield,
  ShieldCheck,
  Plus,
  Users,
  Check,
  Sparkles,
  Lock,
  Mail,
  UserCheck,
  AlertCircle,
  FileText,
  Clock,
  ArrowRight,
  UserPlus
} from 'lucide-react';
import { FamilyMember, FamilyUnit, SecurityAuditLog } from '../types/family';

interface FamilyUnitsModalProps {
  isOpen: boolean;
  onClose: () => void;
  familyUnits: FamilyUnit[];
  members: FamilyMember[];
  activeMember: FamilyMember;
  isAdminLoggedIn: boolean;
  onAddFamilyUnit: (name: string, description: string, leaderId?: string) => void;
  onAppointLeader: (unitId: string, memberId: string) => void;
  onOpenRegisterMember: (unitId?: string) => void;
  securityLogs?: SecurityAuditLog[];
}

export const FamilyUnitsModal: React.FC<FamilyUnitsModalProps> = ({
  isOpen,
  onClose,
  familyUnits,
  members,
  activeMember,
  isAdminLoggedIn,
  onAddFamilyUnit,
  onAppointLeader,
  onOpenRegisterMember,
  securityLogs = [],
}) => {
  const [activeTab, setActiveTab] = useState<'units' | 'create' | 'security'>('units');
  const [newUnitName, setNewUnitName] = useState('');
  const [newUnitDesc, setNewUnitDesc] = useState('');
  const [selectedInitialLeaderId, setSelectedInitialLeaderId] = useState('');
  const [appointingUnitId, setAppointingUnitId] = useState<string | null>(null);
  const [selectedLeaderMemberId, setSelectedLeaderMemberId] = useState('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCreateUnitSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUnitName.trim()) return;

    onAddFamilyUnit(
      newUnitName.trim(),
      newUnitDesc.trim() || 'Family unit household',
      selectedInitialLeaderId || undefined
    );

    setNewUnitName('');
    setNewUnitDesc('');
    setSelectedInitialLeaderId('');
    setActiveTab('units');
    setSuccessMessage(`Family unit "${newUnitName.trim()}" created successfully!`);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const handleConfirmAppointLeader = (unitId: string) => {
    if (!selectedLeaderMemberId) return;
    onAppointLeader(unitId, selectedLeaderMemberId);
    setAppointingUnitId(null);
    setSelectedLeaderMemberId('');

    const targetMember = members.find((m) => m.id === selectedLeaderMemberId);
    const targetUnit = familyUnits.find((u) => u.id === unitId);
    setSuccessMessage(
      `Appointed ${targetMember?.name || 'member'} as Leader of ${targetUnit?.name || 'unit'}!`
    );
    setTimeout(() => setSuccessMessage(null), 3500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-3xl bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-indigo-500/10 via-emerald-500/5 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/15 text-indigo-700 flex items-center justify-center shadow-2xs">
              <Crown className="w-5 h-5 text-indigo-700" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 font-display flex items-center gap-2">
                <span>Family Units & Appointed Leaders</span>
                <span className="text-xs bg-indigo-100 text-indigo-800 font-bold px-2 py-0.5 rounded-full">
                  Structured Hierarchy
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                Admins appoint leaders for each family unit; leaders register their unit members to eliminate disorder
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

        {/* Tab Navigation */}
        <div className="px-6 pt-3 pb-1 border-b border-slate-100 flex items-center gap-2 bg-white">
          <button
            onClick={() => setActiveTab('units')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              activeTab === 'units'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-indigo-400" />
            <span>Family Units ({familyUnits.length})</span>
          </button>

          {(isAdminLoggedIn || activeMember.isAdmin) && (
            <button
              onClick={() => setActiveTab('create')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                activeTab === 'create'
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Plus className="w-3.5 h-3.5 text-emerald-500" />
              <span>Create New Unit</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab('security')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              activeTab === 'security'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Security & Audit Trail</span>
          </button>
        </div>

        {/* Success Alert Banner */}
        {successMessage && (
          <div className="mx-6 mt-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-semibold flex items-center gap-2 animate-in fade-in">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-5">
          
          {/* TAB 1: ALL FAMILY UNITS */}
          {activeTab === 'units' && (
            <div className="space-y-4">
              
              {/* Informational Guidance Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-50/80 via-white to-emerald-50/80 border border-indigo-100 text-xs flex items-start gap-3">
                <Shield className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold text-slate-900">
                    How the Unit Hierarchy Works
                  </p>
                  <p className="text-slate-600 leading-relaxed">
                    The <strong>Grand Admin</strong> oversees all units and appoints a <strong>Family Leader</strong> for each household. 
                    Each appointed leader can then invite and register members for their specific unit. This ensures clear boundaries, eliminates chaotic clutter, and preserves security.
                  </p>
                </div>
              </div>

              {/* Units Grid */}
              <div className="space-y-4">
                {familyUnits.map((unit) => {
                  const unitMembers = members.filter((m) => m.familyUnitId === unit.id);
                  const leader = members.find((m) => m.id === unit.leaderId);
                  const isCurrentMemberLeaderOfThisUnit =
                    activeMember.isLeader && activeMember.familyUnitId === unit.id;
                  const canManageThisUnit =
                    activeMember.isAdmin || isCurrentMemberLeaderOfThisUnit;

                  return (
                    <div
                      key={unit.id}
                      className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-sm transition-all space-y-4"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-700 font-bold flex items-center justify-center text-base border border-indigo-100 shadow-2xs">
                            🏡
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-base font-bold text-slate-900 font-display">
                                {unit.name}
                              </h3>
                              <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full">
                                {unitMembers.length} Members
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5">
                              {unit.description || 'Dedicated family unit household'}
                            </p>
                          </div>
                        </div>

                        {/* Leader & Add Member Action Buttons */}
                        <div className="flex items-center gap-2 flex-wrap">
                          {canManageThisUnit && (
                            <button
                              onClick={() => {
                                onClose();
                                onOpenRegisterMember(unit.id);
                              }}
                              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5"
                              title={`Add a new member to ${unit.name}`}
                            >
                              <UserPlus className="w-3.5 h-3.5 text-emerald-200" />
                              <span>Add Unit Member</span>
                            </button>
                          )}

                          {(activeMember.isAdmin || isAdminLoggedIn) && (
                            <button
                              onClick={() => {
                                setAppointingUnitId(unit.id);
                                setSelectedLeaderMemberId(unit.leaderId || '');
                              }}
                              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1"
                              title="Appoint or change unit leader"
                            >
                              <Crown className="w-3.5 h-3.5 text-amber-500" />
                              <span>{leader ? 'Change Leader' : 'Appoint Leader'}</span>
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Appointing Leader Inline Selector */}
                      {appointingUnitId === unit.id && (
                        <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200 text-xs space-y-2.5 animate-in fade-in">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-amber-900 flex items-center gap-1.5">
                              <Crown className="w-4 h-4 text-amber-600" />
                              <span>Appoint Unit Leader for {unit.name}</span>
                            </span>
                            <button
                              onClick={() => setAppointingUnitId(null)}
                              className="text-amber-800 hover:text-amber-950 font-semibold"
                            >
                              Cancel
                            </button>
                          </div>
                          <p className="text-amber-800">
                            Select a family member to appoint as Leader. They will be granted authority to register and manage members for this unit.
                          </p>
                          <div className="flex items-center gap-2">
                            <select
                              value={selectedLeaderMemberId}
                              onChange={(e) => setSelectedLeaderMemberId(e.target.value)}
                              className="flex-1 px-3 py-1.5 bg-white border border-amber-300 rounded-xl font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                            >
                              <option value="">-- Select Member to Appoint --</option>
                              {members.map((m) => (
                                <option key={m.id} value={m.id}>
                                  {m.name} ({m.role}) {m.isAdmin ? '[Admin]' : ''}
                                </option>
                              ))}
                            </select>
                            <button
                              onClick={() => handleConfirmAppointLeader(unit.id)}
                              disabled={!selectedLeaderMemberId}
                              className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-2xs transition-colors"
                            >
                              Confirm Appointment
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Leader Card */}
                      <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-3 min-w-0">
                          {leader ? (
                            <>
                              <div className="relative">
                                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold ${leader.avatarColor}`}>
                                  {leader.name.charAt(0)}
                                </div>
                                <span
                                  className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white ${
                                    leader.isOnline ? 'bg-emerald-500' : 'bg-slate-300'
                                  }`}
                                />
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-bold text-slate-900 text-sm truncate">
                                    {leader.name}
                                  </span>
                                  <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.2 rounded-md flex items-center gap-0.5">
                                    <Crown className="w-2.5 h-2.5 text-amber-600" />
                                    <span>Appointed Leader</span>
                                  </span>
                                </div>
                                <p className="text-slate-500 text-[11px] truncate">
                                  {leader.email || 'Email registered'} •{' '}
                                  {leader.isOnline ? 'Active Online 🟢' : 'Offline ⚪'}
                                </p>
                              </div>
                            </>
                          ) : (
                            <div className="flex items-center gap-2 text-slate-400 italic">
                              <AlertCircle className="w-4 h-4 text-amber-500" />
                              <span>No leader appointed yet for this unit</span>
                            </div>
                          )}
                        </div>

                        <div className="text-[11px] text-slate-500 shrink-0">
                          {unit.appointedAt ? (
                            <span>Appointed: {new Date(unit.appointedAt).toLocaleDateString()}</span>
                          ) : (
                            <span>Awaiting leader</span>
                          )}
                        </div>
                      </div>

                      {/* Unit Members List */}
                      <div className="space-y-1.5 pt-1">
                        <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 px-1">
                          <span>Unit Members ({unitMembers.length})</span>
                          <span>Presence</span>
                        </div>

                        {unitMembers.length === 0 ? (
                          <p className="text-xs text-slate-400 italic p-2 bg-slate-50 rounded-xl text-center">
                            No members assigned yet. The Unit Leader can add family members.
                          </p>
                        ) : (
                          unitMembers.map((m) => (
                            <div
                              key={m.id}
                              className="px-3 py-2 rounded-xl bg-white border border-slate-150 flex items-center justify-between gap-2 text-xs"
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <div className="relative">
                                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold ${m.avatarColor}`}>
                                    {m.name.charAt(0)}
                                  </div>
                                  <span
                                    className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-white ${
                                      m.isOnline ? 'bg-emerald-500' : 'bg-slate-300'
                                    }`}
                                  />
                                </div>
                                <span className="font-semibold text-slate-800 truncate">
                                  {m.name}
                                </span>
                                {m.isLeader && (
                                  <span className="text-[9px] bg-amber-100 text-amber-800 font-bold px-1 rounded">
                                    Leader
                                  </span>
                                )}
                                {m.isAdmin && (
                                  <span className="text-[9px] bg-purple-100 text-purple-800 font-bold px-1 rounded">
                                    Admin
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center gap-3">
                                {m.addedByLeaderName && (
                                  <span className="text-[10px] text-slate-400 hidden sm:inline">
                                    Added by: {m.addedByLeaderName}
                                  </span>
                                )}
                                <span
                                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                    m.isOnline
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : 'bg-slate-100 text-slate-500'
                                  }`}
                                >
                                  {m.isOnline ? 'Active' : 'Offline'}
                                </span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>

                    </div>
                  );
                })}
              </div>

            </div>
          )}

          {/* TAB 2: CREATE NEW FAMILY UNIT */}
          {activeTab === 'create' && (
            <form onSubmit={handleCreateUnitSubmit} className="space-y-4 max-w-xl mx-auto">
              <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-100 text-xs text-indigo-900 space-y-1">
                <p className="font-bold flex items-center gap-1.5">
                  <Crown className="w-4 h-4 text-indigo-600" />
                  <span>Admin Unit Creation</span>
                </p>
                <p>
                  Create a new household or branch unit and optionally appoint its leader immediately.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block">
                  Family Unit Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. West Coast Branch, Grandparents Household"
                  value={newUnitName}
                  onChange={(e) => setNewUnitName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block">
                  Description / Location
                </label>
                <input
                  type="text"
                  placeholder="e.g. Portland branch household"
                  value={newUnitDesc}
                  onChange={(e) => setNewUnitDesc(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block">
                  Appoint Initial Unit Leader (Optional)
                </label>
                <select
                  value={selectedInitialLeaderId}
                  onChange={(e) => setSelectedInitialLeaderId(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900"
                >
                  <option value="">-- Appoint Leader Later --</option>
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.role})
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-400">
                  You can also appoint a leader at any time from the Units list.
                </p>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setActiveTab('units')}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Create Family Unit</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: SECURITY & AUDIT TRAIL */}
          {activeTab === 'security' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-900 text-white text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold flex items-center gap-1.5 text-emerald-400">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Role-Based Access Control (RBAC) Security Policy</span>
                  </span>
                  <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded">
                    ENFORCED
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 text-[11px] text-slate-300">
                  <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700">
                    <span className="font-bold text-white block mb-0.5">Grand Admin</span>
                    <p className="text-slate-400 text-[10px]">
                      Full governance: creates units, appoints leaders, global permissions, system reset.
                    </p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700">
                    <span className="font-bold text-amber-300 block mb-0.5">Appointed Unit Leader</span>
                    <p className="text-slate-400 text-[10px]">
                      Scoped authority: adds & manages members strictly within their assigned unit.
                    </p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700">
                    <span className="font-bold text-slate-300 block mb-0.5">Unit Member</span>
                    <p className="text-slate-400 text-[10px]">
                      Chat & check-in participation. Cannot register members or modify credentials.
                    </p>
                  </div>
                </div>
              </div>

              {/* Security Audit Trail Log */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 px-1 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Security Audit Log ({securityLogs.length} Events)</span>
                </h4>

                <div className="space-y-1.5 max-h-72 overflow-y-auto">
                  {securityLogs.length === 0 ? (
                    <p className="text-xs text-slate-400 italic p-3 text-center bg-slate-50 rounded-xl">
                      No security audit events recorded yet.
                    </p>
                  ) : (
                    securityLogs.map((log) => (
                      <div
                        key={log.id}
                        className="p-3 rounded-xl bg-white border border-slate-200 flex items-start justify-between gap-3 text-xs"
                      >
                        <div className="space-y-0.5 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-slate-900 font-mono text-[11px]">
                              {log.action}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              by {log.performedByName}
                            </span>
                          </div>
                          <p className="text-slate-600 text-[11px]">
                            {log.details}
                          </p>
                        </div>
                        <span className="text-[10px] font-mono text-slate-400 shrink-0">
                          {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/70 flex items-center justify-between text-xs">
          <span className="text-slate-500 text-[11px]">
            Family Chat Security Protocol: Multi-unit leader governance
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-2xs"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
