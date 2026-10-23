import { FamilyEvent } from '../types/family';

export interface DayDataPoint {
  dateKey: string;
  dayLabel: string;
  avgMoodScore: number;
  hasEvents: boolean;
  events?: FamilyEvent[];
  primaryEvent?: FamilyEvent | null;
  totalCheckIns?: number;
}

export interface EventTypeStat {
  type: string;
  label: string;
  emoji: string;
  count: number;
  avgMood: number;
  uplift: number;
}

export interface CorrelationAnalysisResult {
  r: number;
  rFormatted: string;
  rSquared: number;
  rSquaredFormatted: string;
  strength: 'very_strong' | 'strong' | 'moderate' | 'weak' | 'negligible' | 'negative';
  strengthLabel: string;
  eventDaysAvg: number;
  nonEventDaysAvg: number;
  moodDelta: number;
  upliftPercentage: number;
  totalDays: number;
  eventDaysCount: number;
  nonEventDaysCount: number;
  interpretation: string;
  recommendation: string;
  eventTypeBreakdown: EventTypeStat[];
}

/**
 * Calculates the Pearson correlation coefficient (r) between
 * the presence of calendar events (X in {0, 1}) and daily average mood scores (Y).
 */
export function calculateMoodEventCorrelation(dataPoints: DayDataPoint[]): CorrelationAnalysisResult {
  if (!dataPoints || dataPoints.length < 2) {
    return {
      r: 0,
      rFormatted: '0.00',
      rSquared: 0,
      rSquaredFormatted: '0.0%',
      strength: 'negligible',
      strengthLabel: 'Insufficient Data',
      eventDaysAvg: 0,
      nonEventDaysAvg: 0,
      moodDelta: 0,
      upliftPercentage: 0,
      totalDays: dataPoints ? dataPoints.length : 0,
      eventDaysCount: 0,
      nonEventDaysCount: 0,
      interpretation: 'More check-in and calendar data is needed to evaluate correlation.',
      recommendation: 'Log daily check-ins on days with and without scheduled events.',
      eventTypeBreakdown: [],
    };
  }

  const n = dataPoints.length;
  const xVals: number[] = dataPoints.map((d) => (d.hasEvents ? 1 : 0));
  const yVals: number[] = dataPoints.map((d) => d.avgMoodScore);

  const sumX = xVals.reduce((a, b) => a + b, 0);
  const sumY = yVals.reduce((a, b) => a + b, 0);

  const meanX = sumX / n;
  const meanY = sumY / n;

  let numerator = 0;
  let denomX = 0;
  let denomY = 0;

  for (let i = 0; i < n; i++) {
    const diffX = xVals[i] - meanX;
    const diffY = yVals[i] - meanY;
    numerator += diffX * diffY;
    denomX += diffX * diffX;
    denomY += diffY * diffY;
  }

  const denominator = Math.sqrt(denomX * denomY);
  let r = 0;
  if (denominator > 0.000001) {
    r = numerator / denominator;
    // Bound r between -1 and 1
    r = Math.max(-1, Math.min(1, r));
  }

  const rSquared = r * r;
  const rFormatted = (r >= 0 ? '+' : '') + r.toFixed(2);
  const rSquaredFormatted = (rSquared * 100).toFixed(1) + '%';

  // Calculate event vs non-event averages
  const eventDays = dataPoints.filter((d) => d.hasEvents);
  const nonEventDays = dataPoints.filter((d) => !d.hasEvents);

  const eventDaysAvg = eventDays.length > 0
    ? Number((eventDays.reduce((acc, d) => acc + d.avgMoodScore, 0) / eventDays.length).toFixed(2))
    : meanY;

  const nonEventDaysAvg = nonEventDays.length > 0
    ? Number((nonEventDays.reduce((acc, d) => acc + d.avgMoodScore, 0) / nonEventDays.length).toFixed(2))
    : meanY;

  const moodDelta = Number((eventDaysAvg - nonEventDaysAvg).toFixed(2));
  const upliftPercentage = nonEventDaysAvg > 0
    ? Number(((moodDelta / nonEventDaysAvg) * 100).toFixed(1))
    : 0;

  // Strength classifications
  let strength: CorrelationAnalysisResult['strength'] = 'negligible';
  let strengthLabel = 'Negligible / Independent';

  if (r >= 0.8) {
    strength = 'very_strong';
    strengthLabel = 'Very Strong Positive Correlation';
  } else if (r >= 0.6) {
    strength = 'strong';
    strengthLabel = 'Strong Positive Correlation';
  } else if (r >= 0.35) {
    strength = 'moderate';
    strengthLabel = 'Moderate Positive Correlation';
  } else if (r >= 0.1) {
    strength = 'weak';
    strengthLabel = 'Weak Positive Correlation';
  } else if (r <= -0.2) {
    strength = 'negative';
    strengthLabel = 'Negative Correlation';
  }

  // Interpretations
  let interpretation = '';
  let recommendation = '';

  if (r >= 0.6) {
    interpretation = `Family calendar events show a high statistical correlation (r = ${rFormatted}) with daily mood spikes. On average, days with family events scored ${eventDaysAvg}★ compared to ${nonEventDaysAvg}★ on non-event days (+${moodDelta} pts).`;
    recommendation = `Key milestones like birthdays and weekend trips provide measurable wellness surges. Planning regular bi-weekly family dinners and outings will reinforce high collective mood.`;
  } else if (r >= 0.3) {
    interpretation = `Calendar events show a moderate positive link (r = ${rFormatted}) with elevated mood levels (+${moodDelta} pts on event days).`;
    recommendation = `Group activities consistently uplift family spirits. Coordinate shared traditions to sustain this momentum.`;
  } else if (r >= 0) {
    interpretation = `Daily family mood remains steady and positive (r = ${rFormatted}) regardless of whether an external event is scheduled.`;
    recommendation = `Family members maintain positive daily routines even on quiet days.`;
  } else {
    interpretation = `Events do not show an increase in reported mood scores (r = ${rFormatted}). High activity schedules may cause mild fatigue.`;
    recommendation = `Consider spacing busy family events with quiet rest days to keep everyone recharged.`;
  }

  // Breakdown by event type
  const typeMap = new Map<string, { label: string; emoji: string; scores: number[] }>();

  eventDays.forEach((d) => {
    (d.events || []).forEach((evt) => {
      const type = evt.type || 'other';
      let meta = typeMap.get(type);
      if (!meta) {
        let label = 'General Gathering';
        let emoji = '📅';
        if (type === 'birthday') {
          label = 'Birthdays & Celebrations';
          emoji = '🎂';
        } else if (type === 'vacation') {
          label = 'Family Trips & Getaways';
          emoji = '🏕️';
        } else if (type === 'dinner') {
          label = 'Shared Dinners & Meals';
          emoji = '🍽️';
        } else if (type === 'school') {
          label = 'School & Milestones';
          emoji = '🎓';
        } else if (type === 'appointment') {
          label = 'Appointments';
          emoji = '🩺';
        }
        meta = { label, emoji, scores: [] };
        typeMap.set(type, meta);
      }
      meta.scores.push(d.avgMoodScore);
    });
  });

  const eventTypeBreakdown: EventTypeStat[] = [];
  typeMap.forEach((val, key) => {
    const avg = Number((val.scores.reduce((a, b) => a + b, 0) / val.scores.length).toFixed(2));
    const uplift = Number((avg - nonEventDaysAvg).toFixed(2));
    eventTypeBreakdown.push({
      type: key,
      label: val.label,
      emoji: val.emoji,
      count: val.scores.length,
      avgMood: avg,
      uplift,
    });
  });

  // Sort by highest average mood
  eventTypeBreakdown.sort((a, b) => b.avgMood - a.avgMood);

  return {
    r,
    rFormatted,
    rSquared,
    rSquaredFormatted,
    strength,
    strengthLabel,
    eventDaysAvg,
    nonEventDaysAvg,
    moodDelta,
    upliftPercentage,
    totalDays: n,
    eventDaysCount: eventDays.length,
    nonEventDaysCount: nonEventDays.length,
    interpretation,
    recommendation,
    eventTypeBreakdown,
  };
}
