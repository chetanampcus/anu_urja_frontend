// components/ProgressBar.tsx
'use client';

import { useEffect, useState } from 'react';

interface ProgressBarProps {
  progress: number;
  darkMode: boolean;
}

export default function ProgressBar({ progress, darkMode }: ProgressBarProps) {
  const [animatedProgress, setAnimatedProgress] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedProgress(progress);
    }, 50);
    return () => clearTimeout(timer);
  }, [progress]);

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-2">
        <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          Overall Progress
        </span>
        <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          {Math.round(animatedProgress)}%
        </span>
      </div>
      <div className={`w-full rounded-full h-3 overflow-hidden ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
        <div
          className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${animatedProgress}%` }}
        />
      </div>
    </div>
  );
}