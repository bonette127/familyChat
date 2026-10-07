import React, { useState, useEffect } from 'react';
import { Sparkles, MessageCircle, RefreshCw, ChevronUp, ChevronDown, HeartHandshake, X } from 'lucide-react';

interface DailyFamilyInsightProps {
  onInsertPromptToChat: (promptText: string) => void;
  channelName: string;
}

export const DAILY_FAMILY_QUESTIONS = [
  {
    id: 'insight-1',
    category: 'Childhood & Heritage',
    icon: '🌱',
    question: "What is a childhood family tradition or holiday memory that always brings a warm smile to your face?",
    prompt: "🌱 Today's Family Question: What is a childhood family tradition or holiday memory that always brings a warm smile to your face?",
    starterTip: "Share a memory that other relatives might remember too!"
  },
  {
    id: 'insight-2',
    category: 'Family Recipes',
    icon: '🍲',
    question: "Which family dish or comfort meal instantly feels like home, and do you know who first passed down the recipe?",
    prompt: "🍲 Today's Family Question: Which family dish or comfort meal instantly feels like home to you?",
    starterTip: "Tell us about a favorite dinner or dessert from family gatherings."
  },
  {
    id: 'insight-3',
    category: 'Resemblance & Quirks',
    icon: '💡',
    question: "Who in our family tree do you think you resemble the most in terms of humor, quirks, or habits?",
    prompt: "💡 Today's Family Question: Who in our family do you think you resemble most in looks, humor, or quirks?",
    starterTip: "Grandparents, aunts, uncles, or cousins—let's discover the traits we share!"
  },
  {
    id: 'insight-4',
    category: 'Wisdom & Life Lessons',
    icon: '📚',
    question: "What is the best piece of advice or saying from a family elder that you still remember and live by today?",
    prompt: "📚 Today's Family Question: What is the best piece of advice or saying from our elders that you still cherish?",
    starterTip: "Pass down the words of wisdom that guided you."
  },
  {
    id: 'insight-5',
    category: 'Where Life Took Us',
    icon: '🗺️',
    question: "For relatives we haven't seen in a while, what is your city/neighborhood like right now and what is a favorite local spot?",
    prompt: "🗺️ Today's Family Question: For relatives we haven't seen lately, where are you living now and what's your everyday routine looking like?",
    starterTip: "Help distant family picture your life and surroundings."
  },
  {
    id: 'insight-6',
    category: 'Milestones & Hobbies',
    icon: '🎉',
    question: "What is an exciting new hobby, personal goal, or milestone you've experienced recently that you're proud of?",
    prompt: "🎉 Today's Family Question: What is something new in your life recently that you're excited or proud about?",
    starterTip: "No matter how big or small, we'd love to celebrate with you!"
  },
  {
    id: 'insight-7',
    category: 'Reunion Dreams',
    icon: '🏡',
    question: "If we planned a family reunion weekend next summer, what would be your ideal activity for all generations to do together?",
    prompt: "🏡 Today's Family Question: If our whole family gathered for a reunion weekend, what activity would you most want us all to do together?",
    starterTip: "Barbecue, campfire stories, old photo viewing, or a park picnic?"
  },
];

export const DailyFamilyInsight: React.FC<DailyFamilyInsightProps> = ({
  onInsertPromptToChat,
  channelName,
}) => {
  // Determine daily question based on date so it's consistent for the day
  const getDayIndex = () => {
    const now = new Date();
    const dayOfYear = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 1000 / 60 / 60 / 24);
    return dayOfYear % DAILY_FAMILY_QUESTIONS.length;
  };

  const [currentIndex, setCurrentIndex] = useState(getDayIndex);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [hasSharedToday, setHasSharedToday] = useState(false);

  const currentInsight = DAILY_FAMILY_QUESTIONS[currentIndex] || DAILY_FAMILY_QUESTIONS[0];

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % DAILY_FAMILY_QUESTIONS.length);
    setHasSharedToday(false);
  };

  const handleShareToChat = () => {
    onInsertPromptToChat(currentInsight.prompt);
    setHasSharedToday(true);
  };

  if (isCollapsed) {
    return (
      <div className="bg-amber-50/70 border-b border-amber-200/60 px-4 py-1.5 flex items-center justify-between transition-all">
        <button
          onClick={() => setIsCollapsed(false)}
          className="flex items-center gap-2 text-xs font-semibold text-amber-900 hover:text-amber-950 transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
          <span>Daily Family Insight:</span>
          <span className="font-normal text-amber-800/90 truncate max-w-xs sm:max-w-md">
            "{currentInsight.question}"
          </span>
          <ChevronDown className="w-3.5 h-3.5 text-amber-600" />
        </button>

        <button
          onClick={handleShareToChat}
          className="text-[11px] font-semibold text-amber-800 hover:text-amber-950 px-2 py-0.5 rounded-lg bg-amber-100/80 hover:bg-amber-200/80 transition-colors"
        >
          Ask in #{channelName}
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-amber-50/90 via-orange-50/70 to-rose-50/60 border-b border-amber-200/70 px-4 py-2.5 sm:px-6 transition-all shadow-2xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        
        {/* Left Side: Insight Label & Prompt */}
        <div className="flex items-start sm:items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-xl bg-amber-500/15 border border-amber-300/50 flex items-center justify-center shrink-0 text-amber-700 text-sm shadow-2xs mt-0.5 sm:mt-0">
            {currentInsight.icon}
          </div>
          
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800/90 bg-amber-200/50 px-1.5 py-0.2 rounded-md">
                Daily Family Insight
              </span>
              <span className="text-[10px] text-amber-700/80 hidden md:inline">
                · Reconnect & Build Familiarity
              </span>
            </div>

            <p className="text-xs sm:text-sm font-semibold text-slate-800 mt-0.5 leading-snug">
              {currentInsight.question}
            </p>
          </div>
        </div>

        {/* Right Side: Actions (Ask/Share to Chat, Next, Collapse) */}
        <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
          <button
            type="button"
            onClick={handleShareToChat}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
              hasSharedToday
                ? 'bg-emerald-600 text-white shadow-2xs'
                : 'bg-amber-600 hover:bg-amber-700 text-white shadow-2xs'
            }`}
            title="Post this question into the chat to spark family bonding"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>{hasSharedToday ? 'Shared to Chat ✓' : 'Answer in Chat'}</span>
          </button>

          <button
            type="button"
            onClick={handleNext}
            className="p-1.5 rounded-xl text-amber-800 hover:text-amber-950 hover:bg-amber-200/60 transition-colors"
            title="Next conversation starter"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => setIsCollapsed(true)}
            className="p-1.5 rounded-xl text-amber-700 hover:text-amber-900 hover:bg-amber-200/60 transition-colors"
            title="Collapse daily insight banner"
          >
            <ChevronUp className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </div>
  );
};
