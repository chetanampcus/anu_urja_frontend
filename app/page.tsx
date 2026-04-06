// app/page.tsx
'use client';

import { useState, useCallback, useRef, useEffect } from "react";
import * as XLSX from 'xlsx';
import { Search, ChevronDown, Eye, ChevronLeft, ChevronRight, Check } from "lucide-react";

// Searchable Filter Component (from your dashboard)
function SearchableFilter({ placeholder, options, className }: { placeholder: string; options: string[], className?: string }) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");

  return (
    <div className={`relative ${className || "flex-1"}`}>
      <button
        onClick={() => setOpen(!open)}
        className={`flex h-10 min-w-0 w-full rounded-md bg-slate-50 border border-slate-200 hover:bg-white transition-colors cursor-pointer items-center justify-between px-3 text-slate-600 outline-none focus:bg-white focus:ring-2 focus:ring-slate-300`}
      >
        <span className="flex-1 tracking-[0.01em] leading-5 truncate text-left">
          {value || placeholder}
        </span>
        <ChevronDown className="h-4 w-4 shrink-0 text-slate-400 ml-2" />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-lg z-[999] max-h-60 overflow-auto">
          <div className="p-1">
            <input
              type="text"
              placeholder="Search..."
              className="w-full p-2 text-sm border border-slate-200 rounded-lg mb-1"
              onChange={(e) => {
                const search = e.target.value.toLowerCase();
                const items = document.querySelectorAll('.filter-option');
                items.forEach(item => {
                  const text = item.textContent?.toLowerCase() || '';
                  (item as HTMLElement).style.display = text.includes(search) ? 'block' : 'none';
                });
              }}
            />
            {options.map((option) => (
              <div
                key={option}
                className={`filter-option px-3 py-2 text-sm cursor-pointer hover:bg-slate-100 rounded-lg ${value === option ? 'bg-indigo-50 text-indigo-700' : ''}`}
                onClick={() => {
                  setValue(value === option ? "" : option);
                  setOpen(false);
                }}
              >
                {option}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Logs Panel Component
function LogsPanel({ logs, darkMode }: { logs: any[]; darkMode: boolean }) {
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const getLogIcon = (type: string) => {
    switch (type) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'processing': return '⏳';
      default: return 'ℹ️';
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
          logs.map((log: any) => (
            <div
              key={log.id}
              className={`text-sm py-1.5 px-2 rounded transition-all duration-200 ${
                darkMode ? 'hover:bg-gray-700/50' : 'hover:bg-gray-100'
              }`}
            >
              <span className="mr-2">{getLogIcon(log.type)}</span>
              <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>{log.message}</span>
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

// Progress Bar Component
function ProgressBar({ progress, darkMode }: { progress: number; darkMode: boolean }) {
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

// File Upload Component
function FileUpload({ onFilesSelected, isProcessing, darkMode }: { onFilesSelected: (files: File[]) => void; isProcessing: boolean; darkMode: boolean }) {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && !isProcessing) {
      onFilesSelected(Array.from(e.target.files));
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isProcessing) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    if (!isProcessing && e.dataTransfer.files) {
      onFilesSelected(Array.from(e.dataTransfer.files));
    }
  };

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
        accept=".xlsx,.xls"
        onChange={handleFileChange}
        disabled={isProcessing}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
      />
      <div className="text-center">
        <div className="text-5xl mb-3">📊</div>
        <p className={`text-base font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
          Drop Excel files here or click to upload
        </p>
        <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          Supports .xlsx, .xls files • Multiple files allowed
        </p>
      </div>
    </div>
  );
}

interface FileRecord {
  id: string;
  serialNo: number;
  shelfNo: string;
  bundleNo: string;
  fileNo: string;
  refNo: string;
  subject: string;
  notePages: string;
  correspondencePages: string;
  classification: string;
  destructionDate: string;
  senderSignature: string;
  receiverSignature: string;
  remarks: string;
  pageRange: string;
}

interface LogEntry {
  id: string;
  message: string;
  type: 'info' | 'processing' | 'success' | 'error';
  timestamp: number;
}

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [allRecords, setAllRecords] = useState<FileRecord[]>([]);
  const [sheetsList, setSheetsList] = useState<{ name: string; rowCount: number }[]>([]);
  const [darkMode, setDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState<'upload' | 'records'>('upload');
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [selectedFile, setSelectedFile] = useState<FileRecord | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Search columns filter
  const availableColumns = ["Subject", "File No", "Remarks", "Shelf No"];
  const [searchColumns, setSearchColumns] = useState<string[]>(availableColumns);

  const toggleColumn = (col: string) => {
    setSearchColumns(prev =>
      prev.includes(col) ? prev.filter(c => c !== col) : [...prev, col]
    );
  };

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

  const extractAllRecordsFromExcel = async (file: File): Promise<{ records: FileRecord[]; sheets: { name: string; rowCount: number }[] }> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          
          const allRecords: FileRecord[] = [];
          const sheets: { name: string; rowCount: number }[] = [];
          let globalSerialNo = 1;
          
          for (const sheetName of workbook.SheetNames) {
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "" }) as any[][];
            
            const nonEmptyRows = jsonData.filter(row => 
              row && row.length > 0 && row.some(cell => cell && cell.toString().trim() !== '')
            );
            
            let headers: string[] = [];
            let dataStartIndex = 0;
            
            for (let idx = 0; idx < Math.min(nonEmptyRows.length, 10); idx++) {
              const row = nonEmptyRows[idx];
              const nonEmptyCount = row.filter(cell => cell && cell.toString().trim() !== '').length;
              if (nonEmptyCount > 3) {
                headers = row.map((cell, colIdx) => cell?.toString().trim() || `Column_${colIdx + 1}`);
                dataStartIndex = idx + 1;
                break;
              }
            }
            
            if (headers.length === 0 && nonEmptyRows.length > 0) {
              const maxCols = Math.max(...nonEmptyRows.map(row => row.length));
              headers = Array.from({ length: maxCols }, (_, i) => `Column_${i + 1}`);
              dataStartIndex = 0;
            }
            
            const dataRows = nonEmptyRows.slice(dataStartIndex);
            
            sheets.push({
              name: sheetName,
              rowCount: dataRows.length
            });
            
            dataRows.forEach((row, idx) => {
              const getValue = (key: string) => {
                const colIndex = headers.findIndex(h => h.toLowerCase().includes(key.toLowerCase()));
                if (colIndex !== -1 && row[colIndex]) return row[colIndex].toString();
                return '-';
              };
              
              allRecords.push({
                id: `${sheetName}_row_${idx}`,
                serialNo: globalSerialNo++,
                shelfNo: getValue('शेल्फ') || '-',
                bundleNo: sheetName,
                fileNo: getValue('नस्ती') || getValue('क्रमांक') || '-',
                refNo: getValue('संदर्भ') || '-',
                subject: getValue('विषय') || '-',
                notePages: getValue('टिपणी') || '-',
                correspondencePages: getValue('पत्रव्यवहार') || '-',
                classification: getValue('वर्गीकरण') || 'अ',
                destructionDate: getValue('दिनांक') || 'कायम',
                senderSignature: getValue('पाठविणारा') || '-',
                receiverSignature: getValue('स्वीकारणारा') || '-',
                remarks: getValue('शेरा') || '-',
                pageRange: getValue('पृष्ठ') || '-',
              });
            });
          }
          
          resolve({ records: allRecords, sheets });
        } catch (error) {
          console.error('Error extracting records:', error);
          resolve({ records: [], sheets: [] });
        }
      };
      reader.onerror = () => {
        resolve({ records: [], sheets: [] });
      };
      reader.readAsArrayBuffer(file);
    });
  };

  const processFiles = useCallback(async () => {
    if (files.length === 0 || isProcessing) return;

    setIsProcessing(true);
    setProgress(0);
    setLogs([]);
    setAllRecords([]);
    setSheetsList([]);
    
    addLog(`🚀 Starting processing of ${files.length} file(s)...`, 'info');

    abortControllerRef.current = new AbortController();
    let totalRecords = 0;

    for (let i = 0; i < files.length; i++) {
      if (abortControllerRef.current?.signal.aborted) {
        addLog('⏹️ Processing cancelled by user.', 'error');
        break;
      }

      const file = files[i];
      addLog(`⏳ Processing: ${file.name} (${formatFileSize(file.size)})`, 'processing');

      const result = await extractAllRecordsFromExcel(file);
      
      if (result.records.length > 0) {
        totalRecords += result.records.length;
        setAllRecords(prev => [...prev, ...result.records]);
        setSheetsList(prev => [...prev, ...result.sheets]);
        
        addLog(`✅ Completed: ${file.name} - Found ${result.sheets.length} sheets with ${result.records.length} records`, 'success');
        
        result.sheets.forEach((sheet, idx) => {
          addLog(`   ${idx + 1}. ${sheet.name} - ${sheet.rowCount.toLocaleString()} records`, 'info');
        });
      } else {
        addLog(`❌ Error: ${file.name} - Failed to extract records`, 'error');
      }

      setProgress(((i + 1) / files.length) * 100);
    }

    addLog(`🏁 Processing finished. Total records: ${totalRecords}`, 'info');
    setIsProcessing(false);
    abortControllerRef.current = null;
  }, [files, isProcessing, addLog, formatFileSize]);

  const handleFilesSelected = useCallback((selectedFiles: File[]) => {
    setFiles(selectedFiles);
    setSheetsList([]);
    setAllRecords([]);
    addLog(`📎 ${selectedFiles.length} file(s) selected`, 'info');
    selectedFiles.forEach(f => {
      addLog(`   └─ ${f.name} (${formatFileSize(f.size)})`, 'info');
    });
  }, [addLog, formatFileSize]);

  // Filter records based on search
  const filteredData = allRecords.filter((record) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();

    if (searchColumns.includes("Subject") && record.subject.toLowerCase().includes(query)) return true;
    if (searchColumns.includes("File No") && record.fileNo.toLowerCase().includes(query)) return true;
    if (searchColumns.includes("Remarks") && record.remarks.toLowerCase().includes(query)) return true;
    if (searchColumns.includes("Shelf No") && record.shelfNo.toLowerCase().includes(query)) return true;

    return false;
  });

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, endIndex);

  const handleItemsPerPageChange = (value: number) => {
    setItemsPerPage(value);
    setCurrentPage(1);
  };

  const TEXT = {
    title: "अभिलेख कक्षात पाठवावयाची प्रकरणे",
    branch: "शाखा / विभागाचे नाव : पुनर्वसन शाखा, जिल्हाधिकारी कार्यालय पालघर",
    projectName: "प्रकरणाचे नाव: तारापूर अणुऊर्जा प्रकल्प ३ & ४",
  }

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-[1600px] mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
              <span className="text-white font-bold text-lg">N</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-semibold text-slate-800">{TEXT.title}</h1>
              <p className="text-xs text-slate-500">Document Management System</p>
            </div>
          </div>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-full hover:bg-slate-100 transition-colors"
          >
            {darkMode ? '☀️' : '🌙'}
          </button>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto px-4 py-6">
        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
          <nav className="flex gap-8" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('upload')}
              className={`relative px-1 py-3 text-sm font-medium transition-all duration-200 ${
                activeTab === 'upload'
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">📁</span>
                <span>Upload Doc</span>
              </div>
              {activeTab === 'upload' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-full transition-all duration-200" />
              )}
            </button>
            
            <button
              onClick={() => setActiveTab('records')}
              className={`relative px-1 py-3 text-sm font-medium transition-all duration-200 ${
                activeTab === 'records'
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">📋</span>
                <span>Record Read</span>
                {allRecords.length > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                    {allRecords.length}
                  </span>
                )}
              </div>
              {activeTab === 'records' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-full transition-all duration-200" />
              )}
            </button>
          </nav>
        </div>

        {/* Upload Doc Tab - Removed Reset Button */}
        {activeTab === 'upload' && (
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <FileUpload 
              onFilesSelected={handleFilesSelected} 
              isProcessing={isProcessing}
              darkMode={darkMode}
            />

            {files.length > 0 && !isProcessing && (
              <div className="mt-4 p-4 rounded-lg bg-gray-100 dark:bg-gray-700/50">
                <h3 className="text-sm font-medium mb-2 text-gray-600 dark:text-gray-300">
                  📎 Selected Files ({files.length})
                </h3>
                <div className="flex flex-col gap-1.5 max-h-40 overflow-y-auto">
                  {files.map((file, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-white dark:bg-gray-600 text-gray-700 dark:text-gray-200 text-sm"
                    >
                      <div className="flex items-center gap-2">
                        <span>📊</span>
                        <span className="font-medium truncate">{file.name}</span>
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formatFileSize(file.size)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-3 mt-4">
              <button
                onClick={processFiles}
                disabled={files.length === 0 || isProcessing}
                className={`px-5 py-2.5 rounded-lg font-medium transition-all transform active:scale-95 ${
                  files.length === 0 || isProcessing
                    ? 'bg-gray-300 cursor-not-allowed dark:bg-gray-700 dark:text-gray-400'
                    : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg'
                }`}
              >
                {isProcessing ? '⚙️ Processing...' : '🚀 Extract Records'}
              </button>
            </div>

            <ProgressBar progress={progress} darkMode={darkMode} />

            <div className="space-y-2 mt-4">
              <h3 className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                📝 Progress Log
              </h3>
              <LogsPanel logs={logs} darkMode={darkMode} />
            </div>
          </div>
        )}

        {/* Record Read Tab - Removed Progress Log */}
        {activeTab === 'records' && (
          <>
            {/* Title Card */}
            <div className="mb-6 border border-indigo-200/50 bg-gradient-to-r from-blue-100 to-indigo-100 text-indigo-950 shadow-md shadow-indigo-100/40 rounded-xl p-4">
              <div className="text-center">
                <h2 className="text-xl font-bold mb-1">{TEXT.title}</h2>
                <p className="text-indigo-800/80 text-sm font-medium leading-tight mb-0.5">{TEXT.branch}</p>
                <p className="text-indigo-800/80 text-sm font-medium leading-tight">{TEXT.projectName}</p>
                {allRecords.length > 0 && (
                  <p className="text-indigo-600 text-sm mt-2">Total Records: {allRecords.length} from {sheetsList.length} sheets</p>
                )}
              </div>
            </div>

            {allRecords.length > 0 ? (
              <>
                {/* Search + Filter Wrapper */}
                <div className="mb-6 border-0 shadow-xl bg-white rounded-xl overflow-hidden">
                  <div className="flex items-center gap-4 flex-wrap md:flex-nowrap p-4 w-full">
                    {/* Search */}
                    <div className="flex flex-1 w-full shrink h-10 rounded-lg border border-slate-200 bg-slate-50 focus-within:bg-white focus-within:ring-2 focus-within:ring-slate-300 overflow-visible transition-colors">
                      <div className="relative flex-1 h-full min-w-0">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                        <input
                          type="text"
                          placeholder="Search documents..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full h-full pl-9 pr-3 text-sm bg-transparent border-0 focus:outline-none focus:ring-0 text-slate-900 placeholder:text-slate-500 rounded-l-lg"
                        />
                      </div>
                      <div className="relative">
                        <button
                          onClick={() => {
                            const menu = document.getElementById('column-menu');
                            if (menu) menu.classList.toggle('hidden');
                          }}
                          className="flex items-center justify-between gap-1.5 px-3 h-full border-l border-slate-200 hover:bg-slate-100 transition-colors focus:outline-none shrink-0 bg-transparent cursor-pointer rounded-r-lg text-sm text-slate-600 min-w-[110px]"
                        >
                          <span className="truncate max-w-[80px]">
                            {searchColumns.length === availableColumns.length ? "All" : `${searchColumns.length} Selected`}
                          </span>
                          <ChevronDown className="h-4 w-4 text-slate-400" />
                        </button>
                        <div id="column-menu" className="hidden absolute right-0 mt-1 w-48 z-[999] bg-white border border-slate-200 shadow-md rounded-md py-1">
                          {availableColumns.map(col => (
                            <div
                              key={col}
                              onClick={() => toggleColumn(col)}
                              className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-slate-100"
                            >
                              <Check className={`h-4 w-4 shrink-0 transition-opacity ${searchColumns.includes(col) ? "opacity-100 text-indigo-600" : "opacity-0"}`} />
                              {col}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Filters */}
                    <div className="flex items-center gap-3 shrink-0 text-left text-[14px]">
                      <SearchableFilter
                        placeholder="Select Shelf No"
                        options={["1", "2", "3", "4"]}
                        className="w-[180px]"
                      />
                      <SearchableFilter
                        placeholder="Select Gattha No"
                        options={sheetsList.map(s => s.name)}
                        className="w-[150px]"
                      />
                      <SearchableFilter
                        placeholder="Select Mahitiche Vargikaran"
                        options={["अ", "ब", "क", "ड"]}
                        className="w-[140px]"
                      />
                    </div>
                  </div>
                </div>

                {/* Table Card */}
                <div className="border-0 shadow-xl bg-white rounded-xl overflow-hidden">
                  <div className="mt-4 border-t border-slate-100 bg-slate-50/30">
                    {/* SCROLL AREA */}
                    <div className="max-h-[600px] overflow-auto relative rounded-b-xl">
                      <table className="w-full border-collapse text-sm">
                        {/* HEADER */}
                        <thead className="sticky top-0 z-[100] bg-gradient-to-r from-blue-50/95 to-indigo-50/95 backdrop-blur-md shadow-sm border-b border-indigo-100">
                          {/* ROW 1 */}
                          <tr className="text-indigo-950 font-bold text-xs uppercase tracking-wider">
                            <th className="p-4 align-middle whitespace-nowrap text-center">अ.क्र</th>
                            <th className="p-4 align-middle whitespace-nowrap text-center">शेल्फ क्र.</th>
                            <th className="p-4 align-middle whitespace-nowrap text-center">गट्टा क्र.</th>
                            <th className="p-4 align-middle whitespace-nowrap text-center">नस्ती क्रमांक</th>
                            <th className="p-4 align-middle whitespace-nowrap text-center">संदर्भ क्र.</th>
                            <th className="p-4 align-middle min-w-[280px] text-left">विषय</th>
                            <th colSpan={2} className="p-4 align-middle text-center border-x border-indigo-100/50 bg-indigo-100/30">नस्ती बंद करताना त्यामागील पृष्ठ</th>
                            <th className="p-4 align-middle whitespace-nowrap text-center">माहितीचे वर्गीकरण</th>
                            <th className="p-4 align-middle whitespace-nowrap text-center">नस्ती नष्ट करण्याचा दिनांक</th>
                            <th colSpan={2} className="p-4 align-middle text-center border-x border-indigo-100/50 bg-indigo-100/30">व्यक्तीची सही</th>
                            <th className="p-4 align-middle min-w-[200px] text-left">शेरा</th>
                            <th className="p-4 align-middle whitespace-nowrap text-center">पृष्ठ क्र.</th>
                            <th className="p-4 align-middle whitespace-nowrap text-center">View</th>
                          </tr>
                          {/* ROW 2 */}
                          <tr className="text-indigo-800 text-[11px] uppercase tracking-wider bg-indigo-100/20 border-t border-indigo-100/60">
                            <th className="p-2"></th>
                            <th className="p-2"></th>
                            <th className="p-2"></th>
                            <th className="p-2"></th>
                            <th className="p-2"></th>
                            <th className="p-2"></th>
                            <th className="p-2 text-center border-l bg-indigo-100/30 border-indigo-100/50">टिपणी भाग</th>
                            <th className="p-2 text-center border-r bg-indigo-100/30 border-indigo-100/50">पत्रव्यवहार भाग</th>
                            <th className="p-2"></th>
                            <th className="p-2"></th>
                            <th className="p-2 text-center border-l bg-indigo-100/30 border-indigo-100/50">पाठविणा-या</th>
                            <th className="p-2 text-center border-r bg-indigo-100/30 border-indigo-100/50">स्वीकारणा-याची</th>
                            <th className="p-2"></th>
                            <th className="p-2"></th>
                            <th className="p-2"></th>
                          </tr>
                        </thead>

                        {/* BODY */}
                        <tbody className="divide-y divide-slate-100">
                          {paginatedData.map((record) => (
                            <tr
                              key={record.id}
                              className="group bg-white hover:bg-indigo-50/40 transition-colors duration-200"
                            >
                              <td className="p-4 text-center font-medium text-slate-700">{record.serialNo}</td>
                              <td className="p-4 text-center text-slate-600">{record.shelfNo || '-'}</td>
                              <td className="p-4 text-center text-slate-600">{record.bundleNo || '-'}</td>
                              <td className="p-4 text-center">
                                <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200">
                                  {record.fileNo || '-'}
                                </span>
                              </td>
                              <td className="p-4 text-center text-slate-600">{record.refNo || '-'}</td>
                              <td className="p-4">
                                <div className="whitespace-pre-line break-words max-w-[300px] text-slate-700 leading-relaxed font-medium">
                                  {record.subject}
                                </div>
                              </td>
                              <td className="p-4 text-center text-slate-600 border-l border-slate-50 group-hover:border-indigo-50/50">{record.notePages}</td>
                              <td className="p-4 text-center text-slate-600 border-r border-slate-50 group-hover:border-indigo-50/50">{record.correspondencePages}</td>
                              <td className="p-4 text-center">
                                <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold ${
                                  record.classification === 'अ' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                                  record.classification === 'ब' ? 'bg-blue-100 text-blue-700 border border-blue-200' :
                                  'bg-slate-100 text-slate-700 border border-slate-200'
                                }`}>
                                  {record.classification}
                                </span>
                              </td>
                              <td className="p-4 text-center text-slate-600">
                                {record.destructionDate === 'कायम' ? (
                                  <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm">
                                    {record.destructionDate}
                                  </span>
                                ) : (
                                  record.destructionDate
                                )}
                              </td>
                              <td className="p-4 text-center text-slate-600 border-l border-slate-50 group-hover:border-indigo-50/50">{record.senderSignature || '-'}</td>
                              <td className="p-4 text-center text-slate-600 border-r border-slate-50 group-hover:border-indigo-50/50">{record.receiverSignature || '-'}</td>
                              <td className="p-4">
                                <div className="whitespace-pre-line break-words max-w-[250px] text-slate-500 text-xs leading-relaxed">
                                  {record.remarks}
                                </div>
                              </td>
                              <td className="p-4 text-center font-medium text-slate-700">{record.pageRange}</td>
                              <td className="p-4 text-center">
                                <button 
                                  onClick={() => setSelectedFile(record)}
                                  className="inline-flex items-center justify-center px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-indigo-600 shadow-sm hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-700 transition-all font-medium text-sm group/btn"
                                >
                                  <Eye className="w-4 h-4 mr-1.5 text-slate-400 group-hover/btn:text-indigo-600 transition-colors" />
                                  View
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Pagination */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 bg-gradient-to-r from-slate-50 to-slate-100 border-t border-slate-200">
                    <div className="flex items-center gap-4">
                      <p className="text-sm text-slate-600">
                        Showing <span className="font-medium">{startIndex + 1}</span> to{" "}
                        <span className="font-medium">{Math.min(endIndex, filteredData.length)}</span> of{" "}
                        <span className="font-medium">{filteredData.length}</span>
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-slate-600">Items per page:</span>
                        <div className="relative">
                          <button
                            onClick={() => {
                              const menu = document.getElementById('items-per-page-menu');
                              if (menu) menu.classList.toggle('hidden');
                            }}
                            className="w-20 px-2 py-1 border border-slate-300 rounded-md bg-white text-sm flex items-center justify-between"
                          >
                            {itemsPerPage}
                            <ChevronDown className="h-4 w-4" />
                          </button>
                          <div id="items-per-page-menu" className="hidden absolute top-full left-0 mt-1 w-20 bg-white border border-slate-200 rounded-md shadow-md z-50">
                            {[5, 10, 20, 50].map((value) => (
                              <div
                                key={value}
                                onClick={() => handleItemsPerPageChange(value)}
                                className={`px-2 py-1 text-sm cursor-pointer hover:bg-slate-100 ${itemsPerPage === value ? "bg-indigo-50 text-indigo-700" : ""}`}
                              >
                                {value}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-1.5 border border-slate-300 rounded-md bg-white text-sm disabled:opacity-50 hover:bg-slate-50 transition-colors"
                      >
                        <ChevronLeft className="h-4 w-4 inline" />
                        Prev
                      </button>
                      {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            className={`px-3 py-1.5 rounded-md text-sm transition-all ${
                              currentPage === pageNum
                                ? "bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-md"
                                : "border border-slate-300 bg-white hover:bg-slate-50"
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                      <button
                        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1.5 border border-slate-300 rounded-md bg-white text-sm disabled:opacity-50 hover:bg-slate-50 transition-colors"
                      >
                        Next
                        <ChevronRight className="h-4 w-4 inline" />
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
                <div className="text-6xl mb-4">📋</div>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  No Records Found
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Please upload and process an Excel file first to see records here.
                </p>
              </div>
            )}
          </>
        )}
      </main>

      {/* View Record Dialog */}
      {selectedFile && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000]" onClick={() => setSelectedFile(null)}>
          <div className="bg-white rounded-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-800">Record Details</h3>
                <button onClick={() => setSelectedFile(null)} className="text-gray-500 hover:text-gray-700">✕</button>
              </div>
              <div className="space-y-3">
                <div><span className="font-semibold">अ.क्र:</span> {selectedFile.serialNo}</div>
                <div><span className="font-semibold">शेल्फ क्र.:</span> {selectedFile.shelfNo}</div>
                <div><span className="font-semibold">गट्टा क्र.:</span> {selectedFile.bundleNo}</div>
                <div><span className="font-semibold">नस्ती क्रमांक:</span> {selectedFile.fileNo}</div>
                <div><span className="font-semibold">विषय:</span> {selectedFile.subject}</div>
                <div><span className="font-semibold">माहितीचे वर्गीकरण:</span> {selectedFile.classification}</div>
                <div><span className="font-semibold">नस्ती नष्ट करण्याचा दिनांक:</span> {selectedFile.destructionDate}</div>
                <div><span className="font-semibold">शेरा:</span> {selectedFile.remarks}</div>
                <div><span className="font-semibold">पृष्ठ क्र.:</span> {selectedFile.pageRange}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}