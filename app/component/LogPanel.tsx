// components/LogPanel.tsx
'use client';

import { useEffect, useRef } from 'react';

interface LogEntry {
  id: string;
  message: string;
  type: 'info' | 'processing' | 'success' | 'error';
  timestamp: number;
}

interface LogsPanelProps {
  logs: LogEntry[];
  darkMode: boolean;
}

export default function LogsPanel({ logs, darkMode }: LogsPanelProps) {
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const getLogIcon = (type: LogEntry['type']) => {
    switch (type) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'processing': return '⏳';
      default: return 'ℹ️';
    }
  };

  const getLogColor = (type: LogEntry['type']) => {
    switch (type) {
      case 'success': return darkMode ? 'text-green-400' : 'text-green-700';
      case 'error': return darkMode ? 'text-red-400' : 'text-red-700';
      case 'processing': return darkMode ? 'text-yellow-400' : 'text-yellow-600';
      default: return darkMode ? 'text-slate-400' : 'text-slate-600';
    }
  };

  return (
    <div className={`rounded-lg overflow-hidden border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
      <div className={`px-4 py-3 border-b font-medium ${darkMode ? 'border-gray-700 bg-gray-800/50 text-gray-200' : 'border-gray-200 bg-gray-50 text-gray-700'}`}>
        📋 Processing Logs
      </div>
      <div className="h-64 overflow-y-auto p-3 space-y-2">
        {logs.length === 0 ? (
          <p className={`text-sm text-center py-8 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
            No logs yet. Upload and process files to see activity.
          </p>
        ) : (
          logs.map((log) => (
            <div
              key={log.id}
              className={`text-sm py-1.5 px-2 rounded transition-all duration-200 ${
                darkMode ? 'hover:bg-gray-700/50' : 'hover:bg-gray-100'
              }`}
            >
              <span className="mr-2">{getLogIcon(log.type)}</span>
              <span className={getLogColor(log.type)}>{log.message}</span>
              <span className={`text-xs ml-2 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                {new Date(log.timestamp).toLocaleTimeString()}
              </span>
            </div>
          ))
        )}
        <div ref={logsEndRef} />
      </div>
    </div>
  );
}