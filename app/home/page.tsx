// app/page.tsx
'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import * as XLSX from 'xlsx';
import FileUpload from '../component/FileUpload';
import ProgressBar from '../component/ProgressBar';
import LogsPanel from '../component/LogPanel';
import { SheetData, LogEntry } from '../../.next/types';

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [sheetsData, setSheetsData] = useState<SheetData[]>([]);
  const [currentFileName, setCurrentFileName] = useState<string>('');
  const [darkMode, setDarkMode] = useState(false);
  const [currentStep, setCurrentStep] = useState<'attach' | 'processing' | 'complete'>('attach');
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    setMounted(true);
    const savedMode = localStorage.getItem('darkMode');
    if (savedMode) {
      setDarkMode(savedMode === 'true');
    }
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem('darkMode', darkMode.toString());
      if (darkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [darkMode, mounted]);

  const addLog = useCallback((message: string, type: LogEntry['type']) => {
    setLogs(prev => [...prev, { id: crypto.randomUUID(), message, type, timestamp: Date.now() }]);
  }, []);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const processExcelFile = async (file: File): Promise<SheetData[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          
          const sheets: SheetData[] = [];
          
          for (let i = 0; i < workbook.SheetNames.length; i++) {
            const sheetName = workbook.SheetNames[i];
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "" }) as any[][];
            
            // Filter out empty rows
            const nonEmptyRows = jsonData.filter(row => 
              row && row.length > 0 && row.some(cell => cell && cell.toString().trim() !== '')
            );
            
            // Find header row (first row with meaningful data)
            let headers: string[] = [];
            let dataStartIndex = 0;
            
            for (let idx = 0; idx < Math.min(nonEmptyRows.length, 5); idx++) {
              const row = nonEmptyRows[idx];
              const nonEmptyCount = row.filter(cell => cell && cell.toString().trim() !== '').length;
              if (nonEmptyCount >= 2) {
                headers = row.map((cell, colIdx) => cell?.toString().trim() || `Column_${colIdx + 1}`);
                dataStartIndex = idx + 1;
                break;
              }
            }
            
            // Extract data rows
            const dataRows = nonEmptyRows.slice(dataStartIndex);
            
            sheets.push({
              name: sheetName,
              rowCount: dataRows.length,
              headers: headers,
              data: dataRows.slice(0, 100) // Limit to first 100 rows for performance
            });
            
            addLog(`📄 Sheet "${sheetName}": ${dataRows.length} records found`, 'info');
          }
          
          resolve(sheets);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsArrayBuffer(file);
    });
  };

  const handleProcess = useCallback(async () => {
    if (files.length === 0 || isProcessing) return;

    setIsProcessing(true);
    setProgress(0);
    setLogs([]);
    setSheetsData([]);
    setCurrentStep('processing');
    
    addLog(`🚀 Starting to process ${files.length} file(s)...`, 'info');

    abortControllerRef.current = new AbortController();
    const allSheets: SheetData[] = [];

    for (let i = 0; i < files.length; i++) {
      if (abortControllerRef.current?.signal.aborted) {
        addLog('⏹️ Processing cancelled.', 'error');
        break;
      }

      const file = files[i];
      setCurrentFileName(file.name);
      addLog(`📖 Reading: ${file.name} (${formatFileSize(file.size)})`, 'processing');

      try {
        const sheets = await processExcelFile(file);
        allSheets.push(...sheets);
        addLog(`✅ Completed: ${file.name} - Found ${sheets.length} sheets`, 'success');
      } catch (error) {
        addLog(`❌ Error: ${file.name} - Failed to read`, 'error');
      }

      setProgress(((i + 1) / files.length) * 100);
      setSheetsData([...allSheets]);
    }

    addLog(`🏁 Processing complete! Total sheets: ${allSheets.length}`, 'info');
    setIsProcessing(false);
    setCurrentStep('complete');
    abortControllerRef.current = null;
  }, [files, isProcessing, addLog, formatFileSize]);

  const handleFilesSelected = useCallback((selectedFiles: File[]) => {
    setFiles(selectedFiles);
    setCurrentStep('attach');
    setSheetsData([]);
    setLogs([]);
  }, []);

  const handleReset = useCallback(() => {
    if (isProcessing && abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setFiles([]);
    setIsProcessing(false);
    setProgress(0);
    setLogs([]);
    setSheetsData([]);
    setCurrentFileName('');
    setCurrentStep('attach');
  }, [isProcessing]);

  const toggleDarkMode = useCallback(() => {
    setDarkMode(prev => !prev);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen transition-colors duration-300 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-full">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
              📊 File Processing Dashboard
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Upload Excel files to extract and view sheet data
            </p>
          </div>
          {/* <button
            onClick={toggleDarkMode}
            className="p-2 rounded-full transition-colors bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-yellow-300 hover:bg-gray-300 dark:hover:bg-gray-600"
            aria-label="Toggle dark mode"
          >
            {darkMode ? '☀️' : '🌙'}
          </button> */}
        </div>

        {/* Main Card */}
        <div className="rounded-2xl shadow-xl overflow-hidden transition-colors duration-300 bg-[#FAFAFA] dark:bg-gray-800">
          <div className="p-6">
            {/* File Upload Section */}
            {currentStep === 'attach' && (
              <div className="space-y-4">
                <FileUpload 
                  onFilesSelected={handleFilesSelected} 
                  isProcessing={isProcessing}
                  darkMode={darkMode}
                />

                {/* File List - Only show file names and sizes, no title */}
                {files.length > 0 && (
                  <div className="space-y-1 max-h-64 overflow-y-auto">
                    {files.map((file, idx) => {
                      const ext = file.name.split('.').pop()?.toLowerCase();
                      const icon = ext === 'xlsx' || ext === 'xls' ? '📊' : '📄';
                      return (
                        <div
                          key={idx}
                          className="flex items-center justify-between px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-sm"
                        >
                          <div className="flex items-center gap-2">
                            <span>{icon}</span>
                            <span className="font-medium">{file.name}</span>
                          </div>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {formatFileSize(file.size)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Process Button */}
                {files.length > 0 && (
                  <button
                    onClick={handleProcess}
                    className="w-full px-5 py-3 rounded-lg font-medium transition-all transform active:scale-95 bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg"
                  >
                    🚀 Process Files
                  </button>
                )}
              </div>
            )}

            {/* Processing Section with Progress Bar */}
            {currentStep === 'processing' && (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Processing: {currentFileName}
                  </div>
                  <ProgressBar progress={progress} darkMode={darkMode} />
                </div>
                <LogsPanel logs={logs} darkMode={darkMode} />
              </div>
            )}

            {/* Complete Section - Show Sheets Data */}
            {currentStep === 'complete' && (
              <div className="space-y-6">
                {/* Summary Header */}
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className={`text-xl font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                      📑 Sheets Data ({sheetsData.length} sheets)
                    </h2>
                    <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Total records: {sheetsData.reduce((sum, sheet) => sum + sheet.rowCount, 0)}
                    </p>
                  </div>
                  <button
                    onClick={handleReset}
                    className="px-4 py-2 rounded-lg font-medium transition-all border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    🔄 Upload New Files
                  </button>
                </div>

                {/* Logs Panel */}
                <LogsPanel logs={logs} darkMode={darkMode} />

                {/* Sheets Grid */}
                <div className="space-y-6 max-h-[600px] overflow-y-auto">
                  {sheetsData.map((sheet, sheetIndex) => (
                    <div
                      key={sheetIndex}
                      className={`rounded-lg overflow-hidden border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}
                    >
                      {/* Sheet Header */}
                      <div className={`px-4 py-3 border-b font-medium flex justify-between items-center ${darkMode ? 'border-gray-700 bg-gray-800/50 text-gray-200' : 'border-gray-200 bg-gray-50 text-gray-700'}`}>
                        <div className="flex items-center gap-2">
                          <span className="text-lg">📄</span>
                          <span className="font-semibold">{sheet.name}</span>
                          <span className={`text-sm ml-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            ({sheet.rowCount} records)
                          </span>
                        </div>
                      </div>

                      {/* Sheet Data Table */}
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                          <thead className={darkMode ? 'bg-gray-700' : 'bg-gray-100'}>
                            <tr>
                              {sheet.headers.slice(0, 8).map((header, idx) => (
                                <th
                                  key={idx}
                                  className={`px-3 py-2 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}
                                >
                                  {header.length > 30 ? header.substring(0, 30) + '...' : header}
                                </th>
                              ))}
                              {sheet.headers.length > 8 && (
                                <th className={`px-3 py-2 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                  +{sheet.headers.length - 8} more
                                </th>
                              )}
                            </tr>
                          </thead>
                          <tbody className={`divide-y ${darkMode ? 'divide-gray-700 bg-gray-800' : 'divide-gray-200 bg-[#FAFAFA]'}`}>
                            {sheet.data.slice(0, 10).map((row, rowIdx) => (
                              <tr key={rowIdx} className={`hover:${darkMode ? 'bg-gray-700' : 'bg-gray-50'} transition-colors`}>
                                {sheet.headers.slice(0, 8).map((_, colIdx) => (
                                  <td
                                    key={colIdx}
                                    className={`px-3 py-2 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'} max-w-xs truncate`}
                                  >
                                    {row[colIdx] || '—'}
                                  </td>
                                ))}
                                {sheet.headers.length > 8 && (
                                  <td className={`px-3 py-2 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                    ...
                                  </td>
                                )}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        {sheet.data.length > 10 && (
                          <div className={`px-4 py-2 text-center text-sm border-t ${darkMode ? 'border-gray-700 text-gray-400' : 'border-gray-200 text-gray-500'}`}>
                            Showing first 10 of {sheet.data.length} rows
                          </div>
                        )}
                        {sheet.data.length === 0 && (
                          <div className={`px-4 py-8 text-center text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            No data rows found in this sheet
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {sheetsData.length === 0 && (
                  <div className={`text-center py-12 rounded-lg ${darkMode ? 'bg-gray-700/50' : 'bg-gray-100'}`}>
                    <div className="text-4xl mb-3">📭</div>
                    <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      No sheets data found. Please upload a valid Excel file.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <p className="text-center text-sm mt-6 text-gray-400 dark:text-gray-500">
          💡 Upload Excel files (.xlsx, .xls) to extract and view sheet data
        </p>
      </div>
    </div>
  );
}