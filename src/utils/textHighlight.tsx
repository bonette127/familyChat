import React from 'react';

/**
 * Escapes regex special characters to prevent regex crashes when user queries contain
 * characters like ( ) [ ] * + ? ^ $ \ { } |
 */
export function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Wraps search query matches in a highlighted span with a yellow background color.
 * Preserves original letter casing and handles multi-word or special-character queries.
 */
export function highlightTextMatches(text: string, query?: string): React.ReactNode {
  if (!text) return null;
  const trimmed = (query || '').trim();
  if (!trimmed) return text;

  try {
    const escaped = escapeRegExp(trimmed);
    const regex = new RegExp(`(${escaped})`, 'gi');
    const parts = text.split(regex);

    if (parts.length <= 1) return text;

    return parts.map((part, index) => {
      if (part.toLowerCase() === trimmed.toLowerCase()) {
        return (
          <span
            key={index}
            className="bg-yellow-300 text-slate-900 font-bold px-1 py-0.2 rounded-xs shadow-2xs"
          >
            {part}
          </span>
        );
      }
      return part;
    });
  } catch {
    return text;
  }
}
