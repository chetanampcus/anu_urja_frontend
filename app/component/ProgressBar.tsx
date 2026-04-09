// components/ProgressBar.tsx
'use client';

import { useEffect, useState } from 'react';

interface ProgressBarProps {
  progress: number;
  darkMode: boolean;
  /** Animate shimmer on the fill while extraction runs */
  isActive?: boolean;
  /** 100% + done — subtle success treatment */
  isComplete?: boolean;
  label?: string;
}

export default function ProgressBar({
  progress,
  darkMode,
  isActive = false,
  isComplete = false,
  label = 'Import progress',
}: ProgressBarProps) {
  const [animatedProgress, setAnimatedProgress] = useState(0);

  useEffect(() => {
    const timer = window.setTimeout(() => setAnimatedProgress(progress), 50);
    return () => window.clearTimeout(timer);
  }, [progress]);

  const pct = Math.min(100, Math.max(0, Math.round(animatedProgress)));

  return (
    <div className="w-full">
      <div className="mb-3 flex items-center justify-between gap-3">
        <span
          className={`text-sm font-semibold tracking-tight ${darkMode ? 'text-slate-100' : 'text-slate-800'}`}
        >
          {label}
        </span>
        <span
          className={`rounded-md px-2 py-0.5 text-sm font-bold tabular-nums ${
            isComplete
              ? darkMode
                ? 'bg-emerald-950/60 text-emerald-300'
                : 'bg-emerald-100 text-emerald-800'
              : darkMode
                ? 'bg-slate-700/80 text-slate-200'
                : 'bg-slate-100 text-slate-700'
          }`}
        >
          {pct}%
        </span>
      </div>
      <div
        className={`relative h-3.5 w-full overflow-hidden rounded-full shadow-inner ${
          darkMode ? 'bg-slate-700/90 ring-1 ring-slate-600/80' : 'bg-slate-200/90 ring-1 ring-slate-300/60'
        }`}
      >
        <div
          className={`relative h-full overflow-hidden rounded-full transition-[width] duration-700 ease-out ${
            isComplete
              ? 'bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 shadow-[0_0_20px_rgba(16,185,129,0.45)]'
              : 'bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500 shadow-[0_0_16px_rgba(99,102,241,0.35)]'
          }`}
          style={{ width: `${pct}%` }}
        >
          {isActive && pct > 0 && pct < 100 && (
            <div className="pointer-events-none absolute inset-y-0 left-0 w-2/5 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-progress-shimmer" />
          )}
        </div>
      </div>
      <p className={`mt-2 text-xs ${darkMode ? 'text-slate-500' : 'text-slate-500'}`}>
        {isComplete
          ? 'Opening Records in a moment…'
          : isActive
            ? 'Reading sheets and building rows…'
            : 'Click Extract again to load data from your spreadsheet.'}
      </p>
    </div>
  );
}
