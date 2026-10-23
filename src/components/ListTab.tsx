import React, { useState } from 'react';
import { 
  ShoppingCart, 
  CheckCircle2, 
  Circle, 
  Plus, 
  Trash2, 
  Check, 
  User, 
  Sparkles, 
  Award,
  Store,
  DollarSign,
  Clock,
  Send,
  AlertCircle,
  ShoppingBag,
  RotateCcw,
  CheckCheck,
  Tag,
  ArrowRight,
  HeartHandshake
} from 'lucide-react';
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

const QUICK_PRESETS = [
  { text: 'Farm Fresh Eggs (1 Dozen)', category: 'dairy' as const, store: 'Supermarket', price: 4.80, icon: '🥚' },
  { text: 'Whole Milk & Oat Milk', category: 'dairy' as const, store: 'Trader Joe\'s', price: 5.20, icon: '🥛' },
  { text: 'Sourdough Country Loaf', category: 'bakery' as const, store: 'Artisan Bakery', price: 6.50, icon: '🍞' },
  { text: 'Fresh Bananas & Berries', category: 'produce' as const, store: 'Farmers Market', price: 7.90, icon: '🍎' },
  { text: 'Ground Dark Roast Coffee', category: 'pantry' as const, store: 'Trader Joe\'s', price: 11.50, icon: '☕' },
  { text: 'Extra Virgin Olive Oil', category: 'pantry' as const, store: 'Costco', price: 15.00, icon: '🫒' },
  { text: 'Paper Towels & Tissues', category: 'household' as const, store: 'Costco', price: 18.50, icon: '🧻' },
  { text: 'Weekend Family Ice Cream', category: 'treats' as const, store: 'Supermarket', price: 6.90, icon: '🍨' },
];

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
  const [activeSegment, setActiveSegment] = useState<'groceries' | 'purchased' | 'chores'>('groceries');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);

  // New purchase/grocery form states
  const [newGroceryText, setNewGroceryText] = useState('');
  const [newGroceryCat, setNewGroceryCat] = useState<GroceryItem['category']>('produce');
  const [newGroceryStore, setNewGroceryStore] = useState('Trader Joe\'s');
  const [newGroceryPrice, setNewGroceryPrice] = useState<string>('');
  const [newGroceryUrgency, setNewGroceryUrgency] = useState<'urgent' | 'needed' | 'treat'>('needed');
  const [newGroceryAssignee, setNewGroceryAssignee] = useState<string>('');

  // Chores form state
  const [newChoreTitle, setNewChoreTitle] = useState('');
  const [newChoreAssignee, setNewChoreAssignee] = useState<string>(members[0]?.id || '');
  const [newChoreDue, setNewChoreDue] = useState('Tomorrow');
  const [newChorePoints, setNewChorePoints] = useState(15);
  const [isAddingChore, setIsAddingChore] = useState(false);

  const activeMember = members.find((m) => m.id === activeMemberId) || members[0];

  const getMember = (id?: string) => {
    if (!id) return null;
    return members.find((m) => m.id === id);
  };

  const handleAddGrocerySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroceryText.trim()) return;

    onAddGrocery({
      text: newGroceryText.trim(),
      category: newGroceryCat,
      addedBy: activeMemberId,
      assignedTo: newGroceryAssignee || undefined,
      store: newGroceryStore.trim() || undefined,
      estimatedPrice: newGroceryPrice ? parseFloat(newGroceryPrice) : undefined,
      urgency: newGroceryUrgency,
    });

    setNewGroceryText('');
    setNewGroceryPrice('');
    setNewGroceryAssignee('');
  };

  const handleQuickAddPreset = (preset: typeof QUICK_PRESETS[0]) => {
    onAddGrocery({
      text: preset.text,
      category: preset.category,
      addedBy: activeMemberId,
      store: preset.store,
      estimatedPrice: preset.price,
      urgency: 'needed',
    });
  };

  const handleClaimItem = (item: GroceryItem) => {
    // Toggle claiming this item
    const isClaimedByMe = item.claimedBy === activeMemberId;
    onAddGrocery({
      ...item,
      claimedBy: isClaimedByMe ? undefined : activeMemberId,
      claimedByName: isClaimedByMe ? undefined : `${activeMember.familyRole ? `${activeMember.familyRole} ` : ''}${activeMember.name}`,
    });
    // Remove old copy
    onDeleteGrocery(item.id);
  };

  const handleAddChoreSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChoreTitle.trim()) return;
    onAddChore({
      title: newChoreTitle.trim(),
      assignedTo: newChoreAssignee || activeMemberId,
      dueDate: newChoreDue.trim(),
      points: Number(newChorePoints) || 10,
    });
    setNewChoreTitle('');
    setIsAddingChore(false);
  };

  const handleShareGroceries = () => {
    const pending = groceries.filter((g) => !g.completed);
    if (pending.length === 0) {
      onShareToChat?.('🛒 Family shopping list is all clear! Everything has been purchased. 🎉');
      return;
    }
    const listString = pending
      .map((g) => `• ${g.text}${g.store ? ` [${g.store}]` : ''}${g.estimatedPrice ? ` (~$${g.estimatedPrice.toFixed(2)})` : ''}`)
      .join('\n');
    onShareToChat?.(`🛒 **Family Shared Shopping List (${pending.length} items needed):**\n${listString}\n\n*Anyone stopping by the market can grab these!* 🛍️`);
  };

  // Grocery statistics
  const pendingGroceries = groceries.filter((g) => !g.completed);
  const completedGroceries = groceries.filter((g) => g.completed);

  const totalEstimatedCost = pendingGroceries.reduce((sum, g) => sum + (g.estimatedPrice || 0), 0);
  const totalPurchasedCost = completedGroceries.reduce((sum, g) => sum + (g.estimatedPrice || 0), 0);

  // Filtered pending list
  const filteredGroceries = pendingGroceries.filter((g) => {
    if (filterCategory === 'all') return true;
    return g.category === filterCategory;
  });

  // Chore points calculation
  const totalPointsByMember = members.reduce((acc, m) => {
    const pts = chores
      .filter((c) => c.assignedTo === m.id && c.completed)
      .reduce((sum, c) => sum + c.points, 0);
    acc[m.id] = pts;
    return acc;
  }, {} as Record<string, number>);

  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case 'produce':
        return { label: 'Produce', emoji: '🍎', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
      case 'bakery':
        return { label: 'Bakery', emoji: '🍞', color: 'bg-amber-100 text-amber-800 border-amber-200' };
      case 'dairy':
        return { label: 'Dairy & Eggs', emoji: '🥛', color: 'bg-sky-100 text-sky-800 border-sky-200' };
      case 'pantry':
        return { label: 'Pantry', emoji: '🥫', color: 'bg-orange-100 text-orange-800 border-orange-200' };
      case 'treats':
        return { label: 'Treats & Snacks', emoji: '🎂', color: 'bg-rose-100 text-rose-800 border-rose-200' };
      case 'household':
        return { label: 'Household', emoji: '🧼', color: 'bg-indigo-100 text-indigo-800 border-indigo-200' };
      case 'pharmacy':
        return { label: 'Pharmacy', emoji: '💊', color: 'bg-teal-100 text-teal-800 border-teal-200' };
      default:
        return { label: 'General', emoji: '🛒', color: 'bg-slate-100 text-slate-800 border-slate-200' };
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto bg-slate-50/70 p-4 sm:p-6 lg:p-8">
      {/* Top Header Banner: Warm, Unmistakable Family Purchases Hub */}
      <div className="max-w-5xl w-full mx-auto mb-6">
        <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white rounded-3xl p-5 sm:p-7 border border-emerald-800/80 shadow-xl relative overflow-hidden">
          {/* Ambient glow backgrounds */}
          <div className="absolute -top-10 -right-10 w-72 h-72 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 left-1/3 w-64 h-64 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-bold bg-emerald-500/25 text-emerald-300 border border-emerald-400/30 px-3 py-0.5 rounded-full flex items-center gap-1.5">
                  <ShoppingBag className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Family Shared Shopping & Purchases</span>
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  {pendingGroceries.length} items needed • ${totalEstimatedCost.toFixed(2)} est.
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-display text-white">
                Family Shopping & Shared Errands Hub
              </h2>
              <p className="text-xs sm:text-sm text-emerald-100/90 max-w-2xl leading-relaxed">
                Coordinate shared groceries, market stops, and purchases for the household.
                Claim items you're picking up so relatives know it's handled without double buying!
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2 flex-wrap shrink-0">
              <button
                onClick={handleShareGroceries}
                className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-2xl text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
                title="Send current shopping list to Family Chat"
              >
                <Send className="w-4 h-4 text-slate-950" />
                <span>Share List to Chat</span>
              </button>

              <button
                onClick={() => setIsQuickAddOpen(!isQuickAddOpen)}
                className="px-3.5 py-2.5 bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-2xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
                title="Open 1-tap quick essentials"
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>{isQuickAddOpen ? 'Close Quick Add' : '1-Tap Essentials'}</span>
              </button>
            </div>
          </div>

          {/* 3 Overview Metric Counters */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 pt-5 border-t border-emerald-800/60">
            <div className="p-3 bg-emerald-950/60 rounded-2xl border border-emerald-800/60 backdrop-blur-xs flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300 block mb-0.5">
                  Items Needed Now
                </span>
                <span className="text-2xl font-black font-mono text-white">
                  {pendingGroceries.length}
                </span>
                <span className="text-[10px] text-emerald-400 block mt-0.5">
                  Across {new Set(pendingGroceries.map((g) => g.store || 'Market')).size} stores
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-lg">
                🛒
              </div>
            </div>

            <div className="p-3 bg-emerald-950/60 rounded-2xl border border-emerald-800/60 backdrop-blur-xs flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300 block mb-0.5">
                  Estimated Cart Budget
                </span>
                <span className="text-2xl font-black font-mono text-white">
                  ${totalEstimatedCost.toFixed(2)}
                </span>
                <span className="text-[10px] text-amber-400 block mt-0.5">
                  Shared family shopping total
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-lg">
                💵
              </div>
            </div>

            <div className="p-3 bg-emerald-950/60 rounded-2xl border border-emerald-800/60 backdrop-blur-xs flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-teal-300 block mb-0.5">
                  Purchased & In Kitchen
                </span>
                <span className="text-2xl font-black font-mono text-white">
                  {completedGroceries.length} items
                </span>
                <span className="text-[10px] text-teal-400 block mt-0.5">
                  ${totalPurchasedCost.toFixed(2)} fulfilled this week
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center text-lg">
                ✅
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 1-Tap Quick Essentials Presets Drawer */}
      {isQuickAddOpen && (
        <div className="max-w-5xl w-full mx-auto mb-6 p-4 rounded-3xl bg-gradient-to-r from-amber-50 via-white to-orange-50 border-2 border-amber-300 shadow-sm space-y-3 animate-in fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">⚡</span>
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 font-display">
                1-Tap Frequently Purchased Family Essentials
              </h3>
            </div>
            <span className="text-[11px] text-amber-800 font-medium">Tap any item to add instantly to cart</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {QUICK_PRESETS.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleQuickAddPreset(p)}
                className="p-2.5 rounded-2xl bg-white hover:bg-amber-100/60 border border-amber-200 text-left transition-all active:scale-95 hover:border-amber-400 shadow-2xs group flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-2xl">{p.icon}</span>
                  <span className="text-[10px] font-mono font-bold text-amber-800 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                    +${p.price.toFixed(2)}
                  </span>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900 group-hover:text-amber-900 truncate">
                    {p.text}
                  </p>
                  <p className="text-[10px] text-slate-500 truncate mt-0.5">
                    {p.store}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Navigation Controller & Category Filter */}
      <div className="max-w-5xl w-full mx-auto mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
        {/* Main Section Switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl self-start sm:self-auto">
          <button
            onClick={() => setActiveSegment('groceries')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeSegment === 'groceries'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>Need to Buy ({pendingGroceries.length})</span>
          </button>

          <button
            onClick={() => setActiveSegment('purchased')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeSegment === 'purchased'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Purchased & In Kitchen ({completedGroceries.length})</span>
          </button>

          <button
            onClick={() => setActiveSegment('chores')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeSegment === 'chores'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Award className="w-3.5 h-3.5 text-amber-400" />
            <span>Chores & Points</span>
          </button>
        </div>

        {/* Category Pills when in groceries */}
        {activeSegment === 'groceries' && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
              Filter:
            </span>
            {['all', 'produce', 'bakery', 'dairy', 'pantry', 'treats', 'household'].map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-2.5 py-1 rounded-xl font-semibold capitalize shrink-0 transition-colors ${
                  filterCategory === cat
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* VIEW 1: NEED TO BUY (SHOPPING CART & PURCHASING) */}
      {activeSegment === 'groceries' && (
        <div className="max-w-5xl w-full mx-auto space-y-6">
          {/* Big Intuitive "Add Purchase Item" Form */}
          <form
            onSubmit={handleAddGrocerySubmit}
            className="p-5 bg-white border border-slate-200 rounded-3xl shadow-xs space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                <Plus className="w-4 h-4 text-emerald-600" />
                <span>Add Item to Family Shopping List</span>
              </span>
              <span className="text-[11px] text-slate-400">
                Logged by {activeMember.name} {activeMember.familyRole ? `(${activeMember.familyRole})` : ''}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              {/* Item Name */}
              <div className="sm:col-span-5">
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Item Description *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Sourdough bread, Avocados, Greek yogurt..."
                  value={newGroceryText}
                  onChange={(e) => setNewGroceryText(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white font-medium"
                  required
                />
              </div>

              {/* Aisle Category */}
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Aisle / Category
                </label>
                <select
                  value={newGroceryCat}
                  onChange={(e) => setNewGroceryCat(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white text-slate-700 font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="produce">🍎 Produce</option>
                  <option value="dairy">🥛 Dairy & Eggs</option>
                  <option value="pantry">🥫 Pantry & Spices</option>
                  <option value="bakery">🍞 Bakery</option>
                  <option value="treats">🎂 Treats & Dessert</option>
                  <option value="household">🧼 Household</option>
                  <option value="pharmacy">💊 Pharmacy</option>
                  <option value="other">📦 Other</option>
                </select>
              </div>

              {/* Store Suggestion */}
              <div className="sm:col-span-3">
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Target Store / Market
                </label>
                <input
                  type="text"
                  placeholder="e.g. Trader Joe's, Bakery"
                  value={newGroceryStore}
                  onChange={(e) => setNewGroceryStore(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              {/* Estimated Price */}
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Est. Price ($)
                </label>
                <div className="relative">
                  <span className="absolute left-2.5 top-2 text-xs text-slate-400 font-mono">$</span>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="4.99"
                    value={newGroceryPrice}
                    onChange={(e) => setNewGroceryPrice(e.target.value)}
                    className="w-full pl-6 pr-2.5 py-2 text-xs font-mono border border-slate-200 rounded-xl bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>

            {/* Sub-row for Urgency & Add Button */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-3">
                <span className="text-[11px] font-bold text-slate-500">Urgency:</span>
                <label className="inline-flex items-center gap-1.5 cursor-pointer text-xs">
                  <input
                    type="radio"
                    name="urgency"
                    checked={newGroceryUrgency === 'needed'}
                    onChange={() => setNewGroceryUrgency('needed')}
                    className="text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Normal Need</span>
                </label>
                <label className="inline-flex items-center gap-1.5 cursor-pointer text-xs">
                  <input
                    type="radio"
                    name="urgency"
                    checked={newGroceryUrgency === 'urgent'}
                    onChange={() => setNewGroceryUrgency('urgent')}
                    className="text-rose-600 focus:ring-rose-500"
                  />
                  <span className="text-rose-700 font-bold">⚡ Urgent (Out of Stock)</span>
                </label>
                <label className="inline-flex items-center gap-1.5 cursor-pointer text-xs">
                  <input
                    type="radio"
                    name="urgency"
                    checked={newGroceryUrgency === 'treat'}
                    onChange={() => setNewGroceryUrgency('treat')}
                    className="text-amber-600 focus:ring-amber-500"
                  />
                  <span>Weekend Treat</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={!newGroceryText.trim()}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md active:scale-98 shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Add to Shopping List</span>
              </button>
            </div>
          </form>

          {/* Items Needed List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                <span>Items Needed from Stores ({filteredGroceries.length})</span>
                {totalEstimatedCost > 0 && (
                  <span className="text-[11px] font-mono text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.2 rounded-md font-bold">
                    Est. Total: ${totalEstimatedCost.toFixed(2)}
                  </span>
                )}
              </h4>
              <span className="text-[11px] text-slate-500">
                Tap <strong>"I'll Pick This Up"</strong> to coordinate
              </span>
            </div>

            {filteredGroceries.length === 0 ? (
              <div className="p-8 text-center bg-white border border-dashed border-slate-300 rounded-3xl space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-2xl mx-auto">
                  🎉
                </div>
                <h4 className="text-sm font-bold text-slate-900">
                  All family purchases are fulfilled!
                </h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  There are no pending items in this category. Use the form above or tap 1-Tap Essentials to add items.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {filteredGroceries.map((item) => {
                  const badge = getCategoryBadge(item.category);
                  const addedByMember = getMember(item.addedBy);
                  const isClaimedByMe = item.claimedBy === activeMemberId;
                  const isClaimed = Boolean(item.claimedBy);

                  return (
                    <div
                      key={item.id}
                      className={`p-4 rounded-3xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs ${
                        isClaimed
                          ? 'bg-gradient-to-r from-emerald-50/70 via-white to-amber-50/40 border-emerald-300 ring-1 ring-emerald-400/30'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {/* Left: Item Info, Store, Price, Category */}
                      <div className="flex items-start gap-3.5 min-w-0">
                        {/* Check off button */}
                        <button
                          onClick={() => onToggleGrocery(item.id)}
                          className="w-7 h-7 rounded-xl border-2 border-slate-300 hover:border-emerald-600 flex items-center justify-center text-transparent hover:text-emerald-600 transition-colors shrink-0 mt-0.5 bg-white shadow-2xs"
                          title="Mark as Purchased & In Kitchen"
                        >
                          <Check className="w-4 h-4 text-emerald-600" />
                        </button>

                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-bold text-slate-900">
                              {item.text}
                            </span>

                            {/* Category Pill */}
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 ${badge.color}`}>
                              <span>{badge.emoji}</span>
                              <span>{badge.label}</span>
                            </span>

                            {/* Urgency Pill */}
                            {item.urgency === 'urgent' && (
                              <span className="text-[10px] font-black text-rose-700 bg-rose-100 border border-rose-300 px-2 py-0.5 rounded-full animate-pulse">
                                ⚡ Urgent
                              </span>
                            )}
                          </div>

                          {/* Meta: Store, Estimated Price, Added By */}
                          <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
                            {item.store && (
                              <span className="flex items-center gap-1 text-slate-700 font-semibold">
                                <Store className="w-3.5 h-3.5 text-slate-400" />
                                <span>{item.store}</span>
                              </span>
                            )}

                            {item.estimatedPrice !== undefined && (
                              <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                                ~${item.estimatedPrice.toFixed(2)}
                              </span>
                            )}

                            {addedByMember && (
                              <span className="flex items-center gap-1 text-slate-400">
                                <span>Requested by:</span>
                                <strong className="text-slate-700">
                                  {addedByMember.name}
                                </strong>
                                {addedByMember.familyRole && (
                                  <span className="text-[9px] text-rose-700 bg-rose-50 px-1 py-0.2 rounded font-bold border border-rose-200">
                                    {addedByMember.familyRole}
                                  </span>
                                )}
                              </span>
                            )}
                          </div>

                          {/* Claimed Status Indicator */}
                          {isClaimed && (
                            <div className="pt-1 flex items-center gap-1.5 text-xs text-emerald-800 font-bold">
                              <HeartHandshake className="w-3.5 h-3.5 text-emerald-600" />
                              <span>
                                {isClaimedByMe
                                  ? "You claimed this! Picking it up for the family."
                                  : `${item.claimedByName || 'A family member'} is picking this up!`}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right: Action Buttons */}
                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                        {/* Claim / Picking up toggle */}
                        <button
                          type="button"
                          onClick={() => handleClaimItem(item)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 ${
                            isClaimedByMe
                              ? 'bg-emerald-600 text-white border-emerald-700 shadow-2xs'
                              : isClaimed
                              ? 'bg-amber-50 text-amber-900 border-amber-300'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200'
                          }`}
                          title="Let family know you are buying this"
                        >
                          <ShoppingBag className="w-3.5 h-3.5" />
                          <span>{isClaimedByMe ? 'Claimed by You' : isClaimed ? 'Claimed' : "I'll Pick This Up"}</span>
                        </button>

                        {/* Mark Purchased Button */}
                        <button
                          type="button"
                          onClick={() => onToggleGrocery(item.id)}
                          className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 transition-colors flex items-center gap-1"
                          title="Mark as bought"
                        >
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Bought!</span>
                        </button>

                        {/* Delete button */}
                        <button
                          type="button"
                          onClick={() => onDeleteGrocery(item.id)}
                          className="p-1.5 text-slate-300 hover:text-rose-600 rounded-lg transition-colors"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW 2: PURCHASED & IN THE KITCHEN */}
      {activeSegment === 'purchased' && (
        <div className="max-w-5xl w-full mx-auto space-y-4">
          <div className="flex items-center justify-between px-1">
            <div>
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
                Fulfilled Purchases & Kitchen Inventory ({completedGroceries.length})
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Total fulfilled this week: <strong className="text-emerald-700 font-mono">${totalPurchasedCost.toFixed(2)}</strong>
              </p>
            </div>

            <button
              onClick={handleShareGroceries}
              className="px-3.5 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors"
            >
              Share Status in Chat
            </button>
          </div>

          {completedGroceries.length === 0 ? (
            <div className="p-8 text-center bg-white border border-dashed border-slate-300 rounded-3xl space-y-2">
              <p className="text-sm font-semibold text-slate-600">No purchased items yet this cycle</p>
              <p className="text-xs text-slate-400">Mark items as "Bought!" in the Need to Buy tab to track here.</p>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-3xl divide-y divide-slate-100 overflow-hidden shadow-xs">
              {completedGroceries.map((item) => {
                const badge = getCategoryBadge(item.category);
                const purchaser = item.purchasedByName || (item.claimedByName ? item.claimedByName : 'Family Member');

                return (
                  <div
                    key={item.id}
                    className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50 hover:bg-white transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                        <Check className="w-4 h-4 text-emerald-600" />
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-800 line-through text-slate-500">
                            {item.text}
                          </span>
                          <span className={`text-[9px] font-bold px-2 py-0.2 rounded-full border ${badge.color}`}>
                            {badge.emoji} {badge.label}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                          {item.store && <span>Purchased at {item.store}</span>}
                          {item.estimatedPrice && (
                            <span className="font-mono text-emerald-700 font-bold">
                              • ${item.estimatedPrice.toFixed(2)}
                            </span>
                          )}
                          <span>• Fulfilled by {purchaser}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      {/* Re-add to shopping list button */}
                      <button
                        onClick={() => onToggleGrocery(item.id)}
                        className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 transition-colors flex items-center gap-1 shadow-2xs"
                        title="Re-add to needed list"
                      >
                        <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                        <span>Buy Again</span>
                      </button>

                      <button
                        onClick={() => onDeleteGrocery(item.id)}
                        className="p-1.5 text-slate-300 hover:text-rose-500 rounded-lg transition-colors"
                        title="Delete record"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* VIEW 3: CHORES & POINTS */}
      {activeSegment === 'chores' && (
        <div className="max-w-5xl w-full mx-auto space-y-6">
          {/* Family Chore Leaderboard */}
          <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20 rounded-3xl p-5 shadow-2xs">
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

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
              {members.map((m) => (
                <div key={m.id} className="bg-white/90 border border-amber-500/20 rounded-2xl p-3 text-center shadow-2xs">
                  <div className={`w-9 h-9 rounded-full mx-auto mb-1.5 flex items-center justify-center text-white text-xs font-bold ${m.avatarColor}`}>
                    {m.name.charAt(0)}
                  </div>
                  <p className="text-xs font-bold text-slate-900 truncate">{m.name}</p>
                  {m.familyRole && (
                    <p className="text-[9px] text-rose-700 font-semibold truncate">{m.familyRole}</p>
                  )}
                  <p className="text-sm font-black text-amber-600 tabular-nums mt-1">
                    {totalPointsByMember[m.id] || 0} pts
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Add Chore Trigger or Form */}
          {isAddingChore ? (
            <form onSubmit={handleAddChoreSubmit} className="p-5 bg-white border border-slate-200 rounded-3xl shadow-xs space-y-4">
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
                  className="px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white text-slate-700 font-medium"
                >
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      Assign to: {m.name} ({m.familyRole || m.role})
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
                  className="px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white font-mono"
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
                  className="px-4 py-2 text-xs font-bold text-white bg-slate-900 rounded-xl hover:bg-slate-800"
                >
                  Add Chore
                </button>
              </div>
            </form>
          ) : (
            <div className="flex justify-end">
              <button
                onClick={() => setIsAddingChore(true)}
                className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs font-bold flex items-center gap-1.5 shadow-xs"
              >
                <Plus className="w-3.5 h-3.5 text-emerald-400" />
                <span>Assign Family Chore</span>
              </button>
            </div>
          )}

          {/* Chores List */}
          <div className="bg-white border border-slate-200 rounded-3xl shadow-xs divide-y divide-slate-100 overflow-hidden">
            {chores.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                No active chores currently assigned. Tap "Assign Family Chore" to add one!
              </div>
            ) : (
              chores.map((chore) => {
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
                          className={`text-sm font-semibold ${
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
                          <span className="text-amber-600 font-bold font-mono">
                            +{chore.points} pts
                          </span>
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
                          <span>{assignee.name}</span>
                          {assignee.familyRole && (
                            <span className="text-[9px] text-rose-700 font-bold">
                              ({assignee.familyRole})
                            </span>
                          )}
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
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
