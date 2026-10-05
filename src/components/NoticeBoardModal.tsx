import React, { useState } from 'react';
import { X, Copy, Check, Plus, Wifi, Key, PhoneCall, Calendar, Shield, Sparkles } from 'lucide-react';
import { QuickNotice } from '../types/family';

interface NoticeBoardModalProps {
  isOpen: boolean;
  onClose: () => void;
  notices: QuickNotice[];
  onAddNotice: (notice: Omit<QuickNotice, 'id'>) => void;
  onDeleteNotice: (id: string) => void;
}

export const NoticeBoardModal: React.FC<NoticeBoardModalProps> = ({
  isOpen,
  onClose,
  notices,
  onAddNotice,
  onDeleteNotice,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [value, setValue] = useState('');
  const [category, setCategory] = useState('Household');
  const [iconName, setIconName] = useState('Wifi');

  if (!isOpen) return null;

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !value.trim()) return;
    onAddNotice({
      title: title.trim(),
      value: value.trim(),
      category,
      iconName,
    });
    setTitle('');
    setValue('');
    setIsAdding(false);
  };

  const getIcon = (name: string) => {
    switch (name) {
      case 'Wifi':
        return <Wifi className="w-5 h-5 text-indigo-500" />;
      case 'Key':
        return <Key className="w-5 h-5 text-amber-500" />;
      case 'PhoneCall':
        return <PhoneCall className="w-5 h-5 text-emerald-500" />;
      case 'Calendar':
        return <Calendar className="w-5 h-5 text-sky-500" />;
      default:
        return <Shield className="w-5 h-5 text-rose-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="text-lg font-bold text-slate-900 font-display">
              Family Bulletin & Info
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Passcodes, Wi-Fi credentials, and emergency numbers
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Notices Content */}
        <div className="p-6 overflow-y-auto space-y-4">
          <div className="grid gap-3">
            {notices.map((notice) => (
              <div
                key={notice.id}
                className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 transition-all flex items-start justify-between group"
              >
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center justify-center shrink-0">
                    {getIcon(notice.iconName)}
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                      {notice.category}
                    </span>
                    <h4 className="text-sm font-semibold text-slate-900 mt-0.5">
                      {notice.title}
                    </h4>
                    <p className="text-sm font-mono text-slate-700 bg-white/80 px-2 py-1 rounded-md border border-slate-200/60 mt-1.5 select-all inline-block">
                      {notice.value}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => handleCopy(notice.id, notice.value)}
                    className="p-2 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                    title="Copy info"
                  >
                    {copiedId === notice.id ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    onClick={() => onDeleteNotice(notice.id)}
                    className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors opacity-0 group-hover:opacity-100"
                    title="Remove item"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Add Notice Toggle Form */}
          {isAdding ? (
            <form onSubmit={handleCreate} className="p-4 rounded-2xl border border-slate-300 bg-white space-y-3 shadow-xs">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                Add New Pinned Family Info
              </h4>
              <input
                type="text"
                placeholder="Title (e.g. Spare House Key Location)"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900"
                autoFocus
              />
              <input
                type="text"
                placeholder="Value / Details (e.g. Under ceramic owl planter)"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white text-slate-700"
                >
                  <option value="Household">Household</option>
                  <option value="Tech">Tech / Wi-Fi</option>
                  <option value="Security">Security</option>
                  <option value="Health">Health</option>
                </select>
                <select
                  value={iconName}
                  onChange={(e) => setIconName(e.target.value)}
                  className="px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white text-slate-700"
                >
                  <option value="Wifi">Wi-Fi Icon</option>
                  <option value="Key">Key Icon</option>
                  <option value="PhoneCall">Phone Icon</option>
                  <option value="Calendar">Calendar Icon</option>
                  <option value="Shield">Shield Icon</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-medium text-white bg-slate-900 rounded-xl hover:bg-slate-800 transition-colors"
                >
                  Save to Board
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setIsAdding(true)}
              className="w-full py-3 border border-dashed border-slate-300 rounded-2xl text-slate-600 hover:text-slate-900 hover:border-slate-400 hover:bg-slate-50 transition-all text-xs font-semibold flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Important Family Note or Code</span>
            </button>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            Visible to all family members
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-100 font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
