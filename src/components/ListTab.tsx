import React, { useState } from 'react';
import { ShoppingCart, CheckCircle2, Circle, Plus, Trash2, Check, User, Sparkles, Award } from 'lucide-react';
import { ChoreItem, FamilyMember, GroceryItem } from '../types/family';

interface ListTabProps {
  members: FamilyMember[];
  activeMemberId: string;
  groceries: GroceryItem[];
  chores: ChoreItem[];
  onToggleGrocery: (id: string) => void;
  onAddGrocery: (item: Omit<GroceryItem, 'id' | 'completed' | 'addedAt'>) => void;
  onDeleteGrocery: (id: string) => void;
  onToggleChore: (id: string) => void;
  onAddChore: (chore: Omit<ChoreItem, 'id' | 'completed'>) => void;
  onDeleteChore: (id: string) => void;
  onShareToChat?: (text: string) => void;
}

export const ListTab: React.FC<ListTabProps> = ({
  members,
  activeMemberId,
  groceries,
  chores,
  onToggleGrocery,
  onAddGrocery,
  onDeleteGrocery,
  onToggleChore,
  onAddChore,
  onDeleteChore,
  onShareToChat,
}) => {
  const [activeSegment, setActiveSegment] = useState<'groceries' | 'chores'>('groceries');
  const [filterPendingOnly, setFilterPendingOnly] = useState(false);

  // New grocery form
  const [newGroceryText, setNewGroceryText] = useState('');
  const [newGroceryCat, setNewGroceryCat] = useState<GroceryItem['category']>('produce');
  const [newGroceryAssignee, setNewGroceryAssignee] = useState<string>('');

  // New chore form
  const [newChoreTitle, setNewChoreTitle] = useState('');
  const [newChoreAssignee, setNewChoreAssignee] = useState<string>(members[0]?.id || 'mary');
  const [newChoreDue, setNewChoreDue] = useState('Tomorrow');
  const [newChorePoints, setNewChorePoints] = useState(15);
  const [isAddingChore, setIsAddingChore] = useState(false);

  const handleAddGrocerySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroceryText.trim()) return;
    onAddGrocery({
      text: newGroceryText.trim(),
      category: newGroceryCat,
      addedBy: activeMemberId,
      assignedTo: newGroceryAssignee || undefined,
    });
    setNewGroceryText('');
    setNewGroceryAssignee('');
  };

  const handleAddChoreSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChoreTitle.trim()) return;
    onAddChore({
      title: newChoreTitle.trim(),
      assignedTo: newChoreAssignee,
      dueDate: newChoreDue.trim(),
      points: Number(newChorePoints) || 10,
    });
    setNewChoreTitle('');
    setIsAddingChore(false);
  };

  const handleShareGroceries = () => {
    const pending = groceries.filter((g) => !g.completed);
    if (pending.length === 0) {
      onShareToChat?.('🛒 Grocery list is all clear! Everything has been bought. 🎉');
      return;
    }
    const listString = pending.map((g) => `• ${g.text}`).join('\n');
    onShareToChat?.(`🛒 **Family Grocery List (${pending.length} items needed):**\n${listString}`);
  };

  const getMember = (id?: string) => {
    if (!id) return null;
    return members.find((m) => m.id === id);
  };

  // Grocery statistics
  const pendingGroceries = groceries.filter((g) => !g.completed);
  const completedGroceries = groceries.filter((g) => g.completed);

  // Chore points calculation
  const totalPointsByMember = members.reduce((acc, m) => {
    const pts = chores
      .filter((c) => c.assignedTo === m.id && c.completed)
      .reduce((sum, c) => sum + c.points, 0);
    acc[m.id] = pts;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto bg-slate-50/60 p-4 sm:p-6 lg:p-8">
      {/* Top Header */}
      <div className="max-w-4xl w-full mx-auto mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 font-display flex items-center gap-2">
            <ShoppingCart className="w-6 h-6 text-emerald-600" />
            Family Lists & Chores
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Keep track of shared groceries, market items, and weekly family chores
          </p>
        </div>

        {/* Segmented Controller */}
        <div className="flex items-center gap-1 p-1 bg-white border border-slate-200 rounded-xl shadow-xs self-start sm:self-auto">
          <button
            onClick={() => setActiveSegment('groceries')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${
              activeSegment === 'groceries'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Groceries ({pendingGroceries.length})
          </button>
          <button
            onClick={() => setActiveSegment('chores')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${
              activeSegment === 'chores'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Chores & Points
          </button>
        </div>
      </div>

      {activeSegment === 'groceries' && (
        <div className="max-w-4xl w-full mx-auto space-y-6">
          {/* Quick Add Bar */}
          <form
            onSubmit={handleAddGrocerySubmit}
            className="p-4 bg-white border border-slate-200/80 rounded-2xl shadow-xs flex flex-col sm:flex-row items-center gap-2.5"
          >
            <input
              type="text"
              placeholder="Add item (e.g. Sourdough bread, avocados, Greek yogurt...)"
              value={newGroceryText}
              onChange={(e) => setNewGroceryText(e.target.value)}
              className="flex-1 w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
            />
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={newGroceryCat}
                onChange={(e) => setNewGroceryCat(e.target.value as any)}
                className="px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white text-slate-700"
              >
                <option value="produce">Produce</option>
                <option value="dairy">Dairy & Eggs</option>
                <option value="pantry">Pantry & Grains</option>
                <option value="bakery">Bakery</option>
                <option value="household">Household</option>
                <option value="other">Other</option>
              </select>

              <select
                value={newGroceryAssignee}
                onChange={(e) => setNewGroceryAssignee(e.target.value)}
                className="px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white text-slate-700"
              >
                <option value="">Anyone</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    Assigned: {m.name.split(' ')[0]}
                  </option>
                ))}
              </select>

              <button
                type="submit"
                disabled={!newGroceryText.trim()}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>
          </form>

          {/* Controls Bar */}
          <div className="flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-700">
                {pendingGroceries.length} items needed
              </span>
              <span aria-hidden="true">·</span>
              <span>{completedGroceries.length} checked off</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setFilterPendingOnly(!filterPendingOnly)}
                className="text-xs text-slate-600 hover:text-slate-900 font-medium underline-offset-4 hover:underline"
              >
                {filterPendingOnly ? 'Show All' : 'Hide Checked'}
              </button>
              <button
                onClick={handleShareGroceries}
                className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-medium border border-emerald-200/60 transition-colors"
              >
                Share List to #General
              </button>
            </div>
          </div>

          {/* Groceries Items List */}
          <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs divide-y divide-slate-100 overflow-hidden">
            {groceries
              .filter((g) => !filterPendingOnly || !g.completed)
              .map((item) => {
                const assignee = getMember(item.assignedTo);
                const addedBy = getMember(item.addedBy);

                return (
                  <div
                    key={item.id}
                    className={`p-3.5 sm:p-4 flex items-center justify-between transition-colors ${
                      item.completed ? 'bg-slate-50/60' : 'hover:bg-slate-50/40'
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <button
                        onClick={() => onToggleGrocery(item.id)}
                        className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors ${
                          item.completed
                            ? 'bg-emerald-500 text-white shadow-xs'
                            : 'border-2 border-slate-300 hover:border-emerald-500 text-transparent'
                        }`}
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>

                      <div>
                        <p
                          className={`text-sm font-medium ${
                            item.completed
                              ? 'line-through text-slate-400'
                              : 'text-slate-900'
                          }`}
                        >
                          {item.text}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                          <span className="capitalize">{item.category}</span>
                          {addedBy && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span>Added by {addedBy.name.split(' ')[0]}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {assignee && (
                        <div
                          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-medium"
                          title={`Assigned to ${assignee.name}`}
                        >
                          <div
                            className={`w-4 h-4 rounded-full flex items-center justify-center text-white text-[9px] font-bold ${assignee.avatarColor}`}
                          >
                            {assignee.name.charAt(0)}
                          </div>
                          <span>{assignee.name.split(' ')[0]}</span>
                        </div>
                      )}

                      <button
                        onClick={() => onDeleteGrocery(item.id)}
                        className="p-1.5 text-slate-300 hover:text-rose-500 rounded-lg transition-colors"
                        title="Delete item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {activeSegment === 'chores' && (
        <div className="max-w-4xl w-full mx-auto space-y-6">
          {/* Family Chore Leaderboard */}
          <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20 rounded-2xl p-4 sm:p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-600" />
                <h3 className="font-bold text-slate-900 text-sm font-display">
                  Family Chore Points & Rewards
                </h3>
              </div>
              <span className="text-xs text-slate-500">
                Completed tasks earn weekend treat points!
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {members.map((m) => (
                <div key={m.id} className="bg-white/80 border border-amber-500/20 rounded-xl p-2.5 text-center">
                  <div className={`w-8 h-8 rounded-full mx-auto mb-1 flex items-center justify-center text-white text-xs font-bold ${m.avatarColor}`}>
                    {m.name.charAt(0)}
                  </div>
                  <p className="text-xs font-semibold text-slate-900 truncate">{m.name.split(' ')[0]}</p>
                  <p className="text-sm font-bold text-amber-600 tabular-nums">
                    {totalPointsByMember[m.id] || 0} pts
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Add Chore Trigger or Form */}
          {isAddingChore ? (
            <form onSubmit={handleAddChoreSubmit} className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-3">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Assign New Family Chore
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Task (e.g. Empty dishwasher, water houseplants)"
                  value={newChoreTitle}
                  onChange={(e) => setNewChoreTitle(e.target.value)}
                  className="px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
                  autoFocus
                  required
                />
                <select
                  value={newChoreAssignee}
                  onChange={(e) => setNewChoreAssignee(e.target.value)}
                  className="px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white text-slate-700"
                >
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      Assign to: {m.name} ({m.role})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Due Time (e.g. Today 5 PM)"
                  value={newChoreDue}
                  onChange={(e) => setNewChoreDue(e.target.value)}
                  className="px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white"
                />
                <input
                  type="number"
                  placeholder="Points (e.g. 15)"
                  value={newChorePoints}
                  onChange={(e) => setNewChorePoints(Number(e.target.value))}
                  className="px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddingChore(false)}
                  className="px-3.5 py-1.5 text-xs text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-medium text-white bg-slate-900 rounded-xl hover:bg-slate-800"
                >
                  Add Chore
                </button>
              </div>
            </form>
          ) : (
            <div className="flex justify-end">
              <button
                onClick={() => setIsAddingChore(true)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Family Chore</span>
              </button>
            </div>
          )}

          {/* Chores List */}
          <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs divide-y divide-slate-100 overflow-hidden">
            {chores.map((chore) => {
              const assignee = getMember(chore.assignedTo);

              return (
                <div
                  key={chore.id}
                  className={`p-4 flex items-center justify-between transition-colors ${
                    chore.completed ? 'bg-slate-50/60' : 'hover:bg-slate-50/40'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <button
                      onClick={() => onToggleChore(chore.id)}
                      className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors ${
                        chore.completed
                          ? 'bg-amber-500 text-white shadow-xs'
                          : 'border-2 border-slate-300 hover:border-amber-500 text-transparent'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>

                    <div>
                      <p
                        className={`text-sm font-medium ${
                          chore.completed
                            ? 'line-through text-slate-400'
                            : 'text-slate-900'
                        }`}
                      >
                        {chore.title}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                        <span>Due: {chore.dueDate}</span>
                        <span aria-hidden="true">·</span>
                        <span className="text-amber-600 font-semibold font-mono">
                          +{chore.points} pts
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {assignee && (
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-medium">
                        <div
                          className={`w-4 h-4 rounded-full flex items-center justify-center text-white text-[9px] font-bold ${assignee.avatarColor}`}
                        >
                          {assignee.name.charAt(0)}
                        </div>
                        <span>{assignee.name.split(' ')[0]}</span>
                      </div>
                    )}

                    <button
                      onClick={() => onDeleteChore(chore.id)}
                      className="p-1.5 text-slate-300 hover:text-rose-500 rounded-lg transition-colors"
                      title="Delete chore"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
