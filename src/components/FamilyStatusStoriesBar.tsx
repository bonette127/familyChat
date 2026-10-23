import React from 'react';
import { Plus, Sparkles, MapPin, Smile } from 'lucide-react';
import { FamilyMember, FamilyStatusUpdate } from '../types/family';

interface FamilyStatusStoriesBarProps {
  members: FamilyMember[];
  activeMember: FamilyMember;
  statusUpdates: FamilyStatusUpdate[];
  onOpenStatusViewer: (statusId: string) => void;
  onOpenPostStatus: () => void;
}

export const FamilyStatusStoriesBar: React.FC<FamilyStatusStoriesBarProps> = ({
  members,
  activeMember,
  statusUpdates,
  onOpenStatusViewer,
  onOpenPostStatus,
}) => {
  const myStatus = statusUpdates.find((s) => s.memberId === activeMember.id);
  const otherStatuses = statusUpdates.filter((s) => s.memberId !== activeMember.id);

  return (
    <div className="px-4 py-2.5 bg-white border-b border-slate-200/70 overflow-x-auto no-scrollbar flex items-center gap-3 shrink-0">
      {/* 1. My Status Circle (+ Add or View) */}
      <div className="flex flex-col items-center shrink-0">
        <button
          onClick={myStatus ? () => onOpenStatusViewer(myStatus.id) : onOpenPostStatus}
          className="relative group focus:outline-none"
          title={myStatus ? 'View my active status' : 'Post your status update'}
        >
          <div
            className={`w-12 h-12 rounded-full p-0.5 transition-all ${
              myStatus
                ? 'bg-gradient-to-tr from-emerald-500 to-indigo-500 hover:scale-105'
                : 'border-2 border-dashed border-slate-300 hover:border-emerald-500'
            }`}
          >
            <div className={`w-full h-full rounded-full flex items-center justify-center text-white text-xs font-bold ${activeMember.avatarColor}`}>
              {activeMember.name.charAt(0)}
            </div>
          </div>

          {/* Plus icon badge or status emoji */}
          {myStatus ? (
            <span className="absolute -bottom-1 -right-1 text-xs bg-white rounded-full shadow-2xs border border-slate-100 p-0.5">
              {myStatus.moodEmoji}
            </span>
          ) : (
            <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-600 group-hover:bg-emerald-500 text-white rounded-full flex items-center justify-center text-[10px] font-bold shadow-2xs border border-white">
              +
            </span>
          )}
        </button>

        <span className="text-[10px] font-medium text-slate-700 mt-1 max-w-[56px] truncate text-center">
          {myStatus ? 'My Status' : 'Add Status'}
        </span>
      </div>

      <div className="h-8 w-px bg-slate-200 shrink-0" />

      {/* 2. Family Members Status Updates */}
      {otherStatuses.length > 0 ? (
        otherStatuses.map((status) => {
          return (
            <div key={status.id} className="flex flex-col items-center shrink-0">
              <button
                onClick={() => onOpenStatusViewer(status.id)}
                className="relative group focus:outline-none hover:scale-105 transition-transform"
                title={`${status.memberName}: "${status.text}" (${status.formattedTime})`}
              >
                <div className="w-12 h-12 rounded-full p-0.5 bg-gradient-to-tr from-emerald-500 via-teal-400 to-indigo-500 shadow-2xs">
                  <div className={`w-full h-full rounded-full flex items-center justify-center text-white text-xs font-bold ${status.avatarColor}`}>
                    {status.memberName.charAt(0)}
                  </div>
                </div>

                <span className="absolute -bottom-1 -right-1 text-xs bg-white rounded-full shadow-2xs border border-slate-100 p-0.5">
                  {status.moodEmoji}
                </span>
              </button>

              <span className="text-[10px] font-semibold text-slate-800 mt-1 max-w-[60px] truncate text-center">
                {status.memberName}
              </span>
            </div>
          );
        })
      ) : (
        <div className="flex items-center gap-2 text-xs text-slate-400 pl-1">
          <Sparkles className="w-3.5 h-3.5 text-slate-300" />
          <span>No recent statuses from other members. Share yours!</span>
        </div>
      )}
    </div>
  );
};
