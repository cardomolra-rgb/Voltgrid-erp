import React from 'react';

export type StatusPillTone = 'emerald' | 'rose' | 'amber' | 'blue' | 'zinc';

const TONE_CLASSES: Record<StatusPillTone, string> = {
  emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  rose: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  zinc: 'bg-zinc-800 text-zinc-400 border-zinc-700',
};

interface StatusPillProps<T extends string> {
  status: T;
  toneMap: Record<T, StatusPillTone>;
  className?: string;
}

export function StatusPill<T extends string>({ status, toneMap, className = '' }: StatusPillProps<T>) {
  const tone = toneMap[status] ?? 'zinc';
  return (
    <span
      className={`px-2.5 py-0.5 rounded text-[10px] font-bold font-mono border whitespace-nowrap ${TONE_CLASSES[tone]} ${className}`}
    >
      {status}
    </span>
  );
}
