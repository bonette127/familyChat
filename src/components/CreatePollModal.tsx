import React, { useState } from 'react';
import { X, Plus, Trash2, PieChart } from 'lucide-react';

interface CreatePollModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (question: string, options: string[]) => void;
}

export const CreatePollModal: React.FC<CreatePollModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '', '']);

  if (!isOpen) return null;

  const handleOptionChange = (index: number, val: string) => {
    const updated = [...options];
    updated[index] = val;
    setOptions(updated);
  };

  const handleAddOption = () => {
    if (options.length < 6) {
      setOptions([...options, '']);
    }
  };

  const handleRemoveOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanQuestion = question.trim();
    const cleanOptions = options.map((o) => o.trim()).filter(Boolean);

    if (!cleanQuestion || cleanOptions.length < 2) return;

    onSubmit(cleanQuestion, cleanOptions);
    setQuestion('');
    setOptions(['', '', '']);
    onClose();
  };

  const quickTemplates = [
    { q: 'What should we have for dinner tonight? 🍲', opts: ['Taco Night 🌮', 'Homemade Pasta 🍝', 'Order Pizza 🍕'] },
    { q: 'Saturday family activity vote! ☀️', opts: ['Pine Ridge Hike 🥾', 'Board Game & Movie Marathon 🎲', 'Visit Farmer\'s Market 🥬'] },
    { q: 'Which movie for Friday night? 🎬', opts: ['Animated Comedy 🍿', 'Classic Adventure 🧭', 'Mystery Whodunit 🕵️'] },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <PieChart className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 font-display">
                Create Family Vote / Poll
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Everyone can tap to cast their vote in real-time
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Quick template buttons */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1.5">
              Quick Suggestions
            </label>
            <div className="flex flex-wrap gap-1.5">
              {quickTemplates.map((t, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setQuestion(t.q);
                    setOptions(t.opts);
                  }}
                  className="text-xs bg-slate-100 hover:bg-amber-50 hover:text-amber-900 hover:border-amber-200 border border-slate-200 px-3 py-1.5 rounded-xl transition-colors text-slate-700 font-medium text-left"
                >
                  {t.q.slice(0, 32)}...
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Poll Question
            </label>
            <input
              type="text"
              placeholder="e.g. Where should we go this weekend?"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
              autoFocus
              required
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700">
                Poll Options (Minimum 2)
              </label>
              {options.length < 6 && (
                <button
                  type="button"
                  onClick={handleAddOption}
                  className="text-xs text-amber-600 hover:text-amber-700 font-medium flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Option</span>
                </button>
              )}
            </div>

            <div className="space-y-2">
              {options.map((opt, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="w-5 text-center text-xs font-bold text-slate-400">
                    {i + 1}.
                  </span>
                  <input
                    type="text"
                    placeholder={`Option ${i + 1}`}
                    value={opt}
                    onChange={(e) => handleOptionChange(i, e.target.value)}
                    className="flex-1 px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                  />
                  {options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveOption(i)}
                      className="p-2 text-slate-400 hover:text-rose-500 transition-colors"
                      title="Remove option"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!question.trim() || options.filter(o => o.trim()).length < 2}
              className="px-5 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 disabled:opacity-40 disabled:pointer-events-none rounded-xl shadow-xs transition-colors"
            >
              Post Poll in Chat
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
