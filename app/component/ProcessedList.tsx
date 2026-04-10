// components/ProcessedList.tsx
'use client';

interface ProcessedFile {
  name: string;
  size: number;
  type?: string;
  status: 'success' | 'error';
  sheets?: Array<{ name: string; rowCount: number }>;
  error?: string;
}

interface ProcessedListProps {
  processedFiles: ProcessedFile[];
  darkMode: boolean;
}

export default function ProcessedList({ processedFiles, darkMode }: ProcessedListProps) {
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const successCount = processedFiles.filter(f => f.status === 'success').length;
  const errorCount = processedFiles.filter(f => f.status === 'error').length;

  return (
    <div className={`rounded-lg overflow-hidden border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
      <div className={`px-4 py-3 border-b font-medium flex justify-between items-center ${darkMode ? 'border-gray-700 bg-gray-800/50 text-gray-200' : 'border-gray-200 bg-gray-50 text-gray-700'}`}>
        <span>📄 Processed Files</span>
        {processedFiles.length > 0 && (
          <div className="flex gap-3 text-xs">
            <span className="text-green-500">✅ {successCount}</span>
            <span className="text-red-500">❌ {errorCount}</span>
          </div>
        )}
      </div>
      <div className="h-64 overflow-y-auto">
        {processedFiles.length === 0 ? (
          <p className={`text-sm text-center py-8 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
            No files processed yet.
          </p>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {processedFiles.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                className={`flex items-center justify-between p-3 transition-colors duration-150 ${
                  darkMode ? 'hover:bg-gray-700/30' : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <span className="text-base">
                    {file.status === 'success' ? '✅' : '❌'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                      {file.name}
                    </p>
                    <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                      {formatFileSize(file.size)} • {file.type || 'Unknown'}
                      {file.sheets && ` • ${file.sheets.length} sheets`}
                    </p>
                  </div>
                </div>
                {file.status === 'error' && file.error && (
                  <span className={`text-xs px-2 py-1 rounded ${darkMode ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-600'}`}>
                    {file.error}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}