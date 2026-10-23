import React, { useState, useMemo } from 'react';
import {
  Users,
  Search,
  Shield,
  Crown,
  Sparkles,
  Smile,
  Clock,
  Battery,
  MapPin,
  Filter,
  Plus,
  X,
  Radio,
  Lock,
  ChevronDown,
  ChevronRight,
  Eye,
  CheckCircle2,
  CircleDot
} from 'lucide-react';
import { FamilyMember, FamilyUnit } from '../types/family';

interface FamilyPresencePanelProps {
  members: FamilyMember[];
  familyUnits: FamilyUnit[];
  activeMember: FamilyMember;
  onSelectMember: (id: string) => void;
  onOpenMembersModal: (tab?: 'members' | 'register' | 'units' | 'security') => void;
  onToggleOnlinePresence: (memberId: string) => void;
  onClose?: () => void;
  currentChannelName?: string;
}

export const FamilyPresencePanel: React.FC<FamilyPresencePanelProps> = ({
  members,
  familyUnits,
  activeMember,
  onSelectMember,
  onOpenMembersModal,
  onToggleOnlinePresence,
  onClose,
  currentChannelName = 'general',
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUnitFilter, setSelectedUnitFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'inactive'>('all');

  // Filter members by search and unit
  const filteredMembers = useMemo(() => {
    return members.filter((m) => {
      const matchesSearch =
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (m.familyRole && m.familyRole.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (m.familyUnitName && m.familyUnitName.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesUnit =
        selectedUnitFilter === 'all' || m.familyUnitId === selectedUnitFilter;

      return matchesSearch && matchesUnit;
    });
  }, [members, searchQuery, selectedUnitFilter]);

  // Separate into Active vs Inactive
  const activeMembers = useMemo(() => {
    return filteredMembers.filter((m) => m.isOnline);
  }, [filteredMembers]);

  const inactiveMembers = useMemo(() => {
    return filteredMembers.filter((m) => !m.isOnline);
  }, [filteredMembers]);

  // Is active user an admin or unit leader?
  const canAddMembers = activeMember.isAdmin || activeMember.isLeader;
  const userUnit = familyUnits.find((u) => u.id === activeMember.familyUnitId);

  return (
    <aside className="w-72 lg:w-80 h-full bg-white border-l border-slate-200/90 flex flex-col shrink-0 shadow-lg lg:shadow-none z-20">
      {/* Top Header */}
      <div className="p-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-700 flex items-center justify-center">
            <Users className="w-4 h-4 text-emerald-600" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 font-display">
              <span>Family Presence</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full font-mono bg-emerald-100 text-emerald-800 font-bold">
                #{currentChannelName}
              </span>
            </h3>
            <p className="text-[10px] text-slate-500">
              Active & Inactive Members
            </p>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
            title="Close presence panel"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Presence Metrics Bar */}
      <div className="grid grid-cols-2 p-2.5 bg-slate-50/40 border-b border-slate-100 gap-2">
        <button
          onClick={() => setActiveTab(activeTab === 'active' ? 'all' : 'active')}
          className={`p-2 rounded-xl text-left transition-all border ${
            activeTab === 'active'
              ? 'bg-emerald-50 border-emerald-300 ring-2 ring-emerald-500/20'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-bold text-emerald-700">
            <span className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>Active</span>
            </span>
            <span className="font-mono text-sm font-black">{activeMembers.length}</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-0.5">Online & in chat</p>
        </button>

        <button
          onClick={() => setActiveTab(activeTab === 'inactive' ? 'all' : 'inactive')}
          className={`p-2 rounded-xl text-left transition-all border ${
            activeTab === 'inactive'
              ? 'bg-slate-100 border-slate-400 ring-2 ring-slate-400/20'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-bold text-slate-600">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-slate-300"></span>
              <span>Inactive</span>
            </span>
            <span className="font-mono text-sm font-black">{inactiveMembers.length}</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-0.5">Away or offline</p>
        </button>
      </div>

      {/* Active Member's Self Presence Toggle Switch */}
      <div className="px-3 py-2 bg-gradient-to-r from-emerald-500/10 via-slate-50 to-transparent border-b border-slate-100 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 min-w-0">
          <div className="relative">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold ${activeMember.avatarColor}`}>
              {activeMember.name.charAt(0)}
            </div>
            <span
              className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-white ${
                activeMember.isOnline ? 'bg-emerald-500' : 'bg-slate-300'
              }`}
            />
          </div>
          <div className="min-w-0">
            <p className="font-bold text-slate-900 truncate text-[11px] flex items-center gap-1">
              <span>{activeMember.name}</span>
              <span className="text-[9px] text-slate-400 font-normal">(You)</span>
            </p>
            <p className="text-[10px] text-slate-500 truncate">
              {activeMember.isOnline ? 'Status: Active Online' : 'Status: Inactive / Offline'}
            </p>
          </div>
        </div>

        <button
          onClick={() => onToggleOnlinePresence(activeMember.id)}
          className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all border shrink-0 ${
            activeMember.isOnline
              ? 'bg-emerald-600 text-white border-emerald-700 shadow-2xs'
              : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-100'
          }`}
          title="Toggle your presence for testing active vs inactive display"
        >
          {activeMember.isOnline ? 'Go Offline' : 'Go Active'}
        </button>
      </div>

      {/* Search and Unit Filter */}
      <div className="p-2.5 border-b border-slate-100 space-y-2 bg-white">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search family presence..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-slate-100/80 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all border border-transparent focus:border-slate-300"
          />
        </div>

        {/* Filter by Family Unit */}
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 shrink-0">
            Unit:
          </span>
          <select
            value={selectedUnitFilter}
            onChange={(e) => setSelectedUnitFilter(e.target.value)}
            className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-900"
          >
            <option value="all">All Family Units ({familyUnits.length})</option>
            {familyUnits.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Scrollable Members List */}
      <div className="flex-1 overflow-y-auto p-2.5 space-y-4">
        
        {/* SECTION 1: ACTIVE NOW */}
        {(activeTab === 'all' || activeTab === 'active') && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between px-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Active Now ({activeMembers.length})</span>
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Live presence</span>
            </div>

            {activeMembers.length === 0 ? (
              <div className="p-3 text-center rounded-xl bg-slate-50 border border-slate-150 text-slate-400 text-xs">
                No active members in this view
              </div>
            ) : (
              activeMembers.map((m) => {
                const isCurrent = m.id === activeMember.id;
                return (
                  <div
                    key={m.id}
                    onClick={() => onSelectMember(m.id)}
                    className={`p-2.5 rounded-2xl border transition-all cursor-pointer group ${
                      isCurrent
                        ? 'bg-emerald-50/60 border-emerald-300 shadow-2xs ring-1 ring-emerald-500/20'
                        : 'bg-white border-slate-200/80 hover:border-slate-300 hover:bg-slate-50/80'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="relative shrink-0">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${m.avatarColor}`}
                          >
                            {m.name.charAt(0)}
                          </div>
                          {/* Green active dot */}
                          <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white" />
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-xs font-bold text-slate-900 truncate group-hover:text-emerald-700">
                              {m.name}
                            </span>
                            {m.familyRole && (
                              <span className="text-[9px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-1.5 py-0.2 rounded-md shrink-0">
                                {m.familyRole}
                              </span>
                            )}
                            
                            {/* Role Badges */}
                            {m.isAdmin && (
                              <span className="text-[9px] bg-purple-100 text-purple-800 font-bold px-1.5 py-0.2 rounded-md flex items-center gap-0.5 shrink-0">
                                <Shield className="w-2.5 h-2.5 text-purple-600" />
                                <span>Admin</span>
                              </span>
                            )}
                            {m.isLeader && !m.isAdmin && (
                              <span className="text-[9px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.2 rounded-md flex items-center gap-0.5 shrink-0">
                                <Crown className="w-2.5 h-2.5 text-amber-600" />
                                <span>Leader</span>
                              </span>
                            )}
                          </div>

                          {/* Family Unit Tag */}
                          {m.familyUnitName && (
                            <p className="text-[10px] text-indigo-700 font-medium truncate mt-0.5">
                              🏡 {m.familyUnitName}
                            </p>
                          )}

                          {/* Status & Mood */}
                          <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mt-0.5 truncate">
                            <span className="text-xs">{m.moodEmoji || '😊'}</span>
                            <span className="truncate font-medium text-slate-700">{m.shortStatus || 'Active'}</span>
                            {m.batteryLevel !== undefined && (
                              <span className="text-slate-400 font-mono">· {m.batteryLevel}%</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Presence pill */}
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 shrink-0">
                        Online
                      </span>
                    </div>

                    {/* Check-in note if present */}
                    {m.checkInNote && (
                      <p className="text-[10px] text-slate-500 italic mt-1.5 pt-1 border-t border-slate-100 truncate">
                        "{m.checkInNote}"
                      </p>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* SECTION 2: INACTIVE / OFFLINE */}
        {(activeTab === 'all' || activeTab === 'inactive') && (
          <div className="space-y-1.5 pt-2">
            <div className="flex items-center justify-between px-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                <span>Inactive / Offline ({inactiveMembers.length})</span>
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Away</span>
            </div>

            {inactiveMembers.length === 0 ? (
              <div className="p-3 text-center rounded-xl bg-slate-50 border border-slate-150 text-slate-400 text-xs">
                All members are currently active
              </div>
            ) : (
              inactiveMembers.map((m) => {
                const isCurrent = m.id === activeMember.id;
                return (
                  <div
                    key={m.id}
                    onClick={() => onSelectMember(m.id)}
                    className={`p-2.5 rounded-2xl border transition-all cursor-pointer opacity-80 hover:opacity-100 ${
                      isCurrent
                        ? 'bg-slate-100 border-slate-300 shadow-2xs'
                        : 'bg-slate-50/70 border-slate-200 hover:bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="relative shrink-0">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold grayscale-40 ${m.avatarColor}`}
                          >
                            {m.name.charAt(0)}
                          </div>
                          {/* Grey offline dot */}
                          <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-slate-300 border-2 border-white" />
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-xs font-semibold text-slate-700 truncate">
                              {m.name}
                            </span>
                            {m.familyRole && (
                              <span className="text-[9px] font-medium text-slate-600 bg-slate-200/80 px-1.5 py-0.2 rounded shrink-0">
                                {m.familyRole}
                              </span>
                            )}
                            {m.isAdmin && (
                              <span className="text-[9px] bg-purple-50 text-purple-700 font-bold px-1.5 py-0.2 rounded shrink-0">
                                Admin
                              </span>
                            )}
                            {m.isLeader && !m.isAdmin && (
                              <span className="text-[9px] bg-amber-50 text-amber-700 font-bold px-1.5 py-0.2 rounded shrink-0">
                                Leader
                              </span>
                            )}
                          </div>

                          {m.familyUnitName && (
                            <p className="text-[10px] text-slate-500 font-medium truncate mt-0.5">
                              🏡 {m.familyUnitName}
                            </p>
                          )}

                          <p className="text-[10px] text-slate-400 truncate mt-0.5">
                            Last active: {m.lastActiveTime || 'Recently'}
                          </p>
                        </div>
                      </div>

                      <span className="text-[9px] font-medium px-1.5 py-0.5 rounded-md bg-slate-200/70 text-slate-600 shrink-0">
                        Offline
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

      </div>

      {/* Bottom Leadership & Unit Management Toolbar */}
      <div className="p-3 border-t border-slate-200/80 bg-slate-50/90 space-y-2">
        {/* Unit Leader or Admin Registration Badge */}
        {canAddMembers && (
          <div className="p-2.5 rounded-2xl bg-white border border-emerald-200 shadow-2xs space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-900 flex items-center gap-1 text-[11px]">
                <Crown className="w-3.5 h-3.5 text-amber-500" />
                <span>
                  {activeMember.isAdmin ? 'Grand Admin Hub' : `Leader: ${userUnit?.name || 'Unit'}`}
                </span>
              </span>
              <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded">
                Authorized
              </span>
            </div>
            <p className="text-[10px] text-slate-500 leading-tight">
              {activeMember.isAdmin
                ? 'Appoint leaders for family units and manage circle permissions'
                : `Responsible for adding and managing members of ${userUnit?.name || 'your unit'}`}
            </p>
            <div className="grid grid-cols-2 gap-1.5 pt-1">
              <button
                onClick={() => onOpenMembersModal('register')}
                className="w-full py-1.5 px-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[11px] font-bold transition-colors flex items-center justify-center gap-1 shadow-2xs"
              >
                <Plus className="w-3 h-3" />
                <span>Add Member</span>
              </button>
              <button
                onClick={() => onOpenMembersModal('units')}
                className="w-full py-1.5 px-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-[11px] font-bold transition-colors flex items-center justify-center gap-1 shadow-2xs"
              >
                <Crown className="w-3 h-3 text-amber-400" />
                <span>{activeMember.isAdmin ? 'Appoint Leaders' : 'View Units'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Regular Member View */}
        {!canAddMembers && (
          <div className="p-2 rounded-xl bg-slate-100 text-slate-600 text-[10px] flex items-center justify-between">
            <span>Unit Leader: <strong>{userUnit?.leaderName || 'Appointed Leader'}</strong></span>
            <button
              onClick={() => onOpenMembersModal('members')}
              className="font-semibold text-slate-900 hover:underline"
            >
              View Unit
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};
