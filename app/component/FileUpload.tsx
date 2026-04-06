// components/FileUpload.tsx
'use client';

import { useCallback, useState } from 'react';

interface FileUploadProps {
  onFilesSelected: (files: File[]) => void;
  isProcessing: boolean;
  darkMode: boolean;
}

export default function FileUpload({ onFilesSelected, isProcessing, darkMode }: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && !isProcessing) {
      onFilesSelected(Array.from(e.target.files));
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isProcessing) {
      setIsDragOver(true);
    }
  }, [isProcessing]);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    if (!isProcessing && e.dataTransfer.files) {
      onFilesSelected(Array.from(e.dataTransfer.files));
    }
  }, [isProcessing, onFilesSelected]);

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`relative border-2 border-dashed rounded-xl p-8 transition-all duration-200 ${
        isDragOver
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
          : darkMode
          ? 'border-gray-600 hover:border-gray-500 bg-gray-800'
          : 'border-gray-300 hover:border-gray-400 bg-gray-50'
      } ${isProcessing ? 'opacity-50 pointer-events-none' : ''}`}
    >
      <input
        type="file"
        multiple
        accept=".xlsx,.xls,.csv"
        onChange={handleFileChange}
        disabled={isProcessing}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        aria-label="File upload"
      />
      <div className="text-center">
        <div className="text-5xl mb-3">📊</div>
        <p className={`text-base font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
          Drop Excel files here or click to upload
        </p>
        <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          Supports .xlsx, .xls, .csv files • Multiple files allowed
        </p>
      </div>
    </div>
  );
}