import React, { useState } from 'react';
import { Calendar, Clock, MapPin, Plus, Users, Send, X, Cake, Utensils, Heart } from 'lucide-react';
import { FamilyEvent, FamilyMember } from '../types/family';

interface CalendarTabProps {
  events: FamilyEvent[];
  members: FamilyMember[];
  onAddEvent: (event: Omit<FamilyEvent, 'id'>) => void;
  onShareEventToChat: (event: FamilyEvent) => void;
  onDeleteEvent: (id: string) => void;
}

export const CalendarTab: React.FC<CalendarTabProps> = ({
  events,
  members,
  onAddEvent,
  onShareEventToChat,
  onDeleteEvent,
}) => {
  const [isAddingModal, setIsAddingModal] = useState(false);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('2026-10-14');
  const [time, setTime] = useState('6:30 PM');
  const [location, setLocation] = useState('');
  const [type, setType] = useState<FamilyEvent['type']>('dinner');

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onAddEvent({
      title: title.trim(),
      date,
      time: time.trim(),
      location: location.trim() || 'Home',
      attendees: ['Entire Family'],
      type,
    });

    setTitle('');
    setLocation('');
    setIsAddingModal(false);
  };

  const getTypeIcon = (eventType: FamilyEvent['type']) => {
    switch (eventType) {
      case 'birthday':
        return <Cake className="w-4 h-4 text-rose-500" />;
      case 'dinner':
        return <Utensils className="w-4 h-4 text-amber-500" />;
      case 'school':
        return <Users className="w-4 h-4 text-sky-500" />;
      default:
        return <Calendar className="w-4 h-4 text-emerald-500" />;
    }
  };

  // Sort events by date
  const sortedEvents = [...events].sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto bg-slate-50/60 p-4 sm:p-6 lg:p-8">
      {/* Top Header */}
      <div className="max-w-4xl w-full mx-auto mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 font-display flex items-center gap-2">
            <Calendar className="w-6 h-6 text-sky-600" />
            Family Calendar & Celebrations
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Birthdays, school games, doctor appointments, and family trips
          </p>
        </div>

        <button
          onClick={() => setIsAddingModal(true)}
          className="self-start sm:self-auto px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Family Event</span>
        </button>
      </div>

      {/* Events List */}
      <div className="max-w-4xl w-full mx-auto space-y-4">
        {sortedEvents.map((evt) => (
          <div
            key={evt.id}
            className="p-5 bg-white border border-slate-200/80 rounded-2xl shadow-xs hover:border-slate-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col items-center justify-center shrink-0">
                <span className="text-[10px] uppercase font-bold text-slate-400">
                  {new Date(evt.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short' })}
                </span>
                <span className="text-base font-bold text-slate-900 font-mono">
                  {new Date(evt.date + 'T00:00:00').getDate()}
                </span>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="p-1 rounded-md bg-slate-100">
                    {getTypeIcon(evt.type)}
                  </span>
                  <h4 className="text-base font-bold text-slate-900">
                    {evt.title}
                  </h4>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-2">
                  <span className="flex items-center gap-1 font-mono">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{evt.time}</span>
                  </span>
                  {evt.location && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{evt.location}</span>
                      </span>
                    </>
                  )}
                  <span aria-hidden="true">·</span>
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    <span>{evt.attendees.join(', ')}</span>
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
              <button
                onClick={() => onShareEventToChat(evt)}
                className="px-3 py-1.5 rounded-xl border border-sky-200 bg-sky-50 text-sky-700 hover:bg-sky-100 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                title="Post reminder into General chat"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Remind Chat</span>
              </button>

              <button
                onClick={() => onDeleteEvent(evt.id)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-colors"
                title="Delete event"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}

        {sortedEvents.length === 0 && (
          <div className="text-center p-8 bg-white rounded-3xl border border-slate-200">
            <Calendar className="w-10 h-10 text-slate-400 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-800">No events on the calendar</p>
          </div>
        )}
      </div>

      {/* Add Event Modal */}
      {isAddingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white rounded-3xl border border-slate-200 shadow-2xl p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-bold text-slate-900 font-display">
                Add Family Event or Date
              </h3>
              <button onClick={() => setIsAddingModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Event Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Grandma's Surprise Birthday Party"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Time</label>
                  <input
                    type="text"
                    placeholder="e.g. 2:00 PM"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Location</label>
                <input
                  type="text"
                  placeholder="e.g. Home Dining Room or Park Pavilion"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl bg-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Event Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white text-slate-700"
                >
                  <option value="birthday">Birthday & Milestone 🎂</option>
                  <option value="dinner">Family Dinner / Cookout 🍲</option>
                  <option value="school">School / Sports / Game ⚽</option>
                  <option value="appointment">Doctor / Dentist Checkup 🩺</option>
                  <option value="vacation">Trip / Vacation ⛺</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddingModal(false)}
                  className="px-4 py-2 text-xs text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl"
                >
                  Save Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
