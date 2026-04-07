// app/page.tsx - Enhanced with Stage 2 PDF Mapping Integration
'use client';

import { useState, useCallback, useRef, useEffect } from "react";
import * as XLSX from 'xlsx';
import { Search, ChevronDown, Eye, ChevronLeft, ChevronRight, Check, Upload, FileText, Link, CheckCircle, AlertCircle, Loader2 } from "lucide-react";

// ==================== Types & Interfaces ====================
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

interface PDFMapping {
  id: string;
  recordId: string;
  pdfName: string;
  pdfSize: number;
  pdfUrl?: string;
  status: 'pending' | 'matched' | 'verified';
  confidence?: number;
  matchedAt?: number;
}

// ==================== Helper Components ====================

// Searchable Filter Component
function SearchableFilter({ placeholder, options, className, value, onChange }: { placeholder: string; options: string[], className?: string; value?: string; onChange?: (value: string) => void }) {
  const [open, setOpen] = useState(false);
  const [internalValue, setInternalValue] = useState(value || "");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleSelect = (option: string) => {
    const newValue = internalValue === option ? "" : option;
    setInternalValue(newValue);
    if (onChange) onChange(newValue);
    setOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} className={`relative ${className || "flex-1"}`} style={{ zIndex: 9999 }}>
      <button
        onClick={() => setOpen(!open)}
        className={`flex h-10 min-w-0 w-full rounded-md bg-slate-50 border border-slate-200 hover:bg-white transition-colors cursor-pointer items-center justify-between px-3 text-slate-600 outline-none focus:bg-white focus:ring-2 focus:ring-slate-300`}
      >
        <span className="flex-1 tracking-[0.01em] leading-5 truncate text-left">
          {internalValue || placeholder}
        </span>
        <ChevronDown className="h-4 w-4 shrink-0 text-slate-400 ml-2" />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-lg z-[9999] max-h-60 overflow-auto">
          <div className="p-1 sticky top-0 bg-white border-b border-slate-100">
            <input
              type="text"
              placeholder="Search..."
              className="w-full p-2 text-sm border border-slate-200 rounded-lg"
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => {
                const search = e.target.value.toLowerCase();
                const items = document.querySelectorAll(`.filter-option-${placeholder.replace(/\s/g, '')}`);
                items.forEach(item => {
                  const text = item.textContent?.toLowerCase() || '';
                  (item as HTMLElement).style.display = text.includes(search) ? 'block' : 'none';
                });
              }}
            />
          </div>
          <div className="p-1">
            {options.map((option) => (
              <div
                key={option}
                className={`filter-option-${placeholder.replace(/\s/g, '')} px-3 py-2 text-sm cursor-pointer hover:bg-slate-100 rounded-lg ${internalValue === option ? 'bg-indigo-50 text-indigo-700' : ''}`}
                onClick={() => handleSelect(option)}
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
function LogsPanel({ logs, darkMode }: { logs: LogEntry[]; darkMode: boolean }) {
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
          logs.map((log: LogEntry) => (
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

// PDF Upload & Mapping Component (NEW for Stage 2)
function PDFMappingPanel({ records, onMappingComplete, darkMode }: { records: FileRecord[]; onMappingComplete: (mappings: PDFMapping[]) => void; darkMode: boolean }) {
  const [pdfFiles, setPdfFiles] = useState<File[]>([]);
  const [isMapping, setIsMapping] = useState(false);
  const [mappings, setMappings] = useState<PDFMapping[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);

  const handlePDFSelect = (files: File[]) => {
    const pdfs = files.filter(f => f.type === 'application/pdf' || f.name.endsWith('.pdf'));
    setPdfFiles(prev => [...prev, ...pdfs]);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    handlePDFSelect(files);
  };

  // Smart matching algorithm: matches PDF filename to record fields
  const performMatching = useCallback(() => {
    setIsMapping(true);
    const newMappings: PDFMapping[] = [];

    for (const pdf of pdfFiles) {
      const pdfName = pdf.name.replace('.pdf', '').toLowerCase();
      let bestMatch: FileRecord | null = null;
      let bestScore = 0;

      for (const record of records) {
        let score = 0;
        // Match by fileNo
        if (record.fileNo.toLowerCase() !== '-' && pdfName.includes(record.fileNo.toLowerCase())) score += 40;
        // Match by bundleNo
        if (record.bundleNo.toLowerCase() !== '-' && pdfName.includes(record.bundleNo.toLowerCase())) score += 30;
        // Match by shelfNo
        if (record.shelfNo.toLowerCase() !== '-' && pdfName.includes(record.shelfNo.toLowerCase())) score += 20;
        // Match by subject keywords (first 3 words)
        const subjectWords = record.subject.toLowerCase().split(' ').slice(0, 3);
        for (const word of subjectWords) {
          if (word.length > 3 && pdfName.includes(word)) score += 10;
        }

        if (score > bestScore && score > 0) {
          bestScore = score;
          bestMatch = record;
        }
      }

      newMappings.push({
        id: crypto.randomUUID(),
        recordId: bestMatch?.id || '',
        pdfName: pdf.name,
        pdfSize: pdf.size,
        status: bestMatch ? (bestScore > 60 ? 'matched' : 'pending') : 'pending',
        confidence: bestScore,
        matchedAt: bestMatch ? Date.now() : undefined,
      });
    }

    setMappings(newMappings);
    setIsMapping(false);
    onMappingComplete(newMappings);
  }, [pdfFiles, records, onMappingComplete]);

  const updateMappingStatus = (mappingId: string, status: 'pending' | 'matched' | 'verified') => {
    setMappings(prev => prev.map(m => m.id === mappingId ? { ...m, status } : m));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  if (records.length === 0) {
    return (
      <div className={`text-center py-12 rounded-xl border-2 border-dashed ${darkMode ? 'border-gray-600 bg-gray-800/30' : 'border-gray-200 bg-gray-50'}`}>
        <FileText className="w-12 h-12 mx-auto text-gray-400 mb-3" />
        <p className="text-gray-500">No records available. Please process Excel files in Stage 1 first.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* PDF Upload Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-xl p-6 transition-all duration-200 text-center cursor-pointer ${
          isDragOver
            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
            : darkMode
            ? 'border-gray-600 hover:border-gray-500 bg-gray-800'
            : 'border-gray-300 hover:border-gray-400 bg-gray-50'
        }`}
      >
        <input
          type="file"
          multiple
          accept=".pdf"
          onChange={(e) => e.target.files && handlePDFSelect(Array.from(e.target.files))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          style={{ position: 'relative', opacity: 0, width: '0.1px', height: '0.1px' }}
        />
        <label className="cursor-pointer block">
          <Upload className="w-10 h-10 mx-auto text-indigo-500 mb-2" />
          <p className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
            Upload Scanned PDF Files
          </p>
          <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Drag & drop PDF files or click to browse
          </p>
        </label>
      </div>

      {/* Selected PDFs List */}
      {pdfFiles.length > 0 && (
        <div className={`rounded-lg border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className={`px-4 py-2 border-b font-medium text-sm ${darkMode ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-gray-50'}`}>
            Selected PDFs ({pdfFiles.length})
          </div>
          <div className="max-h-48 overflow-y-auto p-2 space-y-1">
            {pdfFiles.map((file, idx) => (
              <div key={idx} className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-500" />
                  <span className="truncate max-w-[200px]">{file.name}</span>
                </div>
                <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-400'}`}>{formatFileSize(file.size)}</span>
              </div>
            ))}
          </div>
          <div className="px-4 py-3 border-t flex justify-end">
            <button
              onClick={performMatching}
              disabled={isMapping}
              className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-lg text-sm font-medium hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {isMapping ? <Loader2 className="w-4 h-4 animate-spin" /> : <Link className="w-4 h-4" />}
              {isMapping ? 'Matching...' : 'Auto-Match PDFs to Records'}
            </button>
          </div>
        </div>
      )}

      {/* Mappings Results */}
      {mappings.length > 0 && (
        <div className={`rounded-lg border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className={`px-4 py-2 border-b font-medium text-sm ${darkMode ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-gray-50'}`}>
            📄 PDF to Record Mappings ({mappings.filter(m => m.status !== 'pending').length} / {mappings.length} matched)
          </div>
          <div className="max-h-80 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className={`sticky top-0 ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <tr className={`border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <th className="px-4 py-2 text-left">PDF File</th>
                  <th className="px-4 py-2 text-left">Matched Record</th>
                  <th className="px-4 py-2 text-center">Confidence</th>
                  <th className="px-4 py-2 text-center">Status</th>
                  <th className="px-4 py-2 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {mappings.map((mapping) => {
                  const matchedRecord = records.find(r => r.id === mapping.recordId);
                  return (
                    <tr key={mapping.id} className={`${darkMode ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'}`}>
                      <td className="px-4 py-2">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-indigo-500" />
                          <span className="truncate max-w-[150px]">{mapping.pdfName}</span>
                        </div>
                      </td>
                      <td className="px-4 py-2">
                        {matchedRecord ? (
                          <div>
                            <div className="font-medium">{matchedRecord.fileNo}</div>
                            <div className="text-xs text-gray-500 truncate max-w-[200px]">{matchedRecord.subject}</div>
                          </div>
                        ) : (
                          <span className="text-gray-400 italic">No match found</span>
                        )}
                      </td>
                      <td className="px-4 py-2 text-center">
                        {mapping.confidence ? (
                          <div className="flex items-center justify-center gap-1">
                            <div className={`w-16 h-1.5 rounded-full bg-gray-200 overflow-hidden`}>
                              <div className={`h-full rounded-full ${mapping.confidence > 60 ? 'bg-green-500' : mapping.confidence > 30 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${Math.min(mapping.confidence, 100)}%` }} />
                            </div>
                            <span className="text-xs">{Math.round(mapping.confidence)}%</span>
                          </div>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="px-4 py-2 text-center">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                          mapping.status === 'verified' ? 'bg-green-100 text-green-700' :
                          mapping.status === 'matched' ? 'bg-blue-100 text-blue-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {mapping.status === 'verified' ? <CheckCircle className="w-3 h-3" /> : mapping.status === 'matched' ? <Link className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                          {mapping.status}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-center">
                        {mapping.status !== 'verified' && matchedRecord && (
                          <button
                            onClick={() => updateMappingStatus(mapping.id, 'verified')}
                            className="px-2 py-1 text-xs bg-indigo-50 text-indigo-600 rounded hover:bg-indigo-100 transition-colors"
                          >
                            Verify
                          </button>
                        )}
                        {!matchedRecord && (
                          <button className="px-2 py-1 text-xs text-gray-500 border rounded hover:bg-gray-100 transition-colors">
                            Manual Map
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ==================== Main Component ====================

const availableProjects = [
  "तारापूर अणुऊर्जा प्रकल्प ३ & ४",
  "सुर्या प्रकल्प",
];

const availableColumns = ["Subject", "File No", "Remarks", "Shelf No"];

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [allRecords, setAllRecords] = useState<FileRecord[]>([]);
  const [sheetsList, setSheetsList] = useState<{ name: string; rowCount: number }[]>([]);
  const [darkMode, setDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState<StepKey>('upload');
  const [selectedProject, setSelectedProject] = useState("तारापूर अणुऊर्जा प्रकल्प ३ & ४");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [selectedFile, setSelectedFile] = useState<FileRecord | null>(null);
  const [searchColumns, setSearchColumns] = useState<string[]>(availableColumns);
  const [columnMenuOpen, setColumnMenuOpen] = useState(false);
  const [pdfMappings, setPdfMappings] = useState<PDFMapping[]>([]);
  const columnMenuRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const [checks, setChecks] = useState([false, false, false, false]);
  const [stage2Completed, setStage2Completed] = useState(false);
  const allChecked = checks.every(Boolean);

  type StepKey = 'upload' | 'records' | 'mapping';

const steps: { key: StepKey; label: string }[] = [
  { key: 'upload', label: 'Upload' },
  { key: 'records', label: 'Records' },
  { key: 'mapping', label: 'PDF Mapping' },
];

  const toggleColumn = (col: string) => {
    setSearchColumns(prev =>
      prev.includes(col) ? prev.filter(c => c !== col) : [...prev, col]
    );
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (columnMenuRef.current && !columnMenuRef.current.contains(event.target as Node)) {
        setColumnMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
    addLog(`📁 Selected Project: ${selectedProject}`, 'info');

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
          addLog(`   ${idx + 1}. ${sheet.name} - ${sheet.rowCount.toLocaleString()} records imported successfully`, 'info');
        });
      } else {
        addLog(`❌ Error: ${file.name} - Failed to extract records`, 'error');
      }

      setProgress(((i + 1) / files.length) * 100);
    }

    addLog(`🏁 Processing finished. Total records: ${totalRecords}`, 'info');
    setIsProcessing(false);
    abortControllerRef.current = null;
  }, [files, isProcessing, addLog, formatFileSize, selectedProject]);

  const handleFilesSelected = useCallback((selectedFiles: File[]) => {
    setFiles(selectedFiles);
    setSheetsList([]);
    setAllRecords([]);
    addLog(`📎 ${selectedFiles.length} file(s) selected`, 'info');
    selectedFiles.forEach(f => {
      addLog(`   └─ ${f.name} (${formatFileSize(f.size)})`, 'info');
    });
  }, [addLog, formatFileSize]);

  const handleMappingComplete = useCallback((mappings: PDFMapping[]) => {
    setPdfMappings(mappings);
    addLog(`📄 PDF Mapping completed: ${mappings.filter(m => m.status !== 'pending').length} out of ${mappings.length} PDFs matched to records`, 'success');
  }, [addLog]);

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

  const TEXT = {
    title: "अभिलेख कक्षात पाठवावयाची प्रकरणे",
    branch: "शाखा / विभागाचे नाव : पुनर्वसन शाखा, जिल्हाधिकारी कार्यालय पालघर",
    projectName: selectedProject,
  }

  if (!mounted) {
    return null;
  }

  const handleCompleteStage2 = () => {
  if (allChecked) {
    setStage2Completed(true);
  }
};

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'dark bg-slate-900' : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50'}`}>
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="max-w-[1600px] mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200 dark:shadow-indigo-900/30">
              <span className="text-white font-bold text-lg">N</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-semibold text-slate-800 dark:text-slate-100">{TEXT.title}</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">Document Management System</p>
            </div>
          </div>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {darkMode ? '☀️' : '🌙'}
          </button>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto px-4 py-6">
        
        {/* Stepper code */}
        <div className="mb-10">
          <div className="bg-gradient-to-r from-white to-indigo-50 dark:from-slate-800 dark:to-slate-800 
      rounded-xl px-6 py-4 shadow-md border border-indigo-100 dark:border-slate-700 max-w-4xl mx-auto">

            <div className="flex items-center justify-between relative">
              {steps.map((step, index) => {
                const isActive = activeTab === step.key;
                const isCompleted =
                  (step.key === 'upload' && allRecords.length > 0) ||
                  (step.key === 'records' && allRecords.length > 0 && pdfMappings.length > 0);

                return (
                  <div key={step.key} className="flex-1 flex flex-col items-center relative">

                    {/* Connector Line */}
                    {index !== 0 && (
                      <div className="absolute top-4 left-[-50%] w-full h-[2px] z-0">
                        <div
                          className={`h-full transition-all duration-500
                    ${isCompleted
                              ? 'bg-gradient-to-r from-green-400 to-green-600'
                              : isActive
                                ? 'bg-gradient-to-r from-blue-400 to-blue-600 w-1/2'
                                : 'bg-gray-200 dark:bg-slate-600'
                            }`}
                        />
                      </div>
                    )}

                    {/* Circle */}
                    <div
                      onClick={() => setActiveTab(step.key)}
                      className={`relative z-10 w-10 h-10 flex items-center justify-center rounded-full text-sm font-bold cursor-pointer transition-all duration-300
                ${isActive
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white scale-105 shadow-md'
                          : isCompleted
                            ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-sm'
                            : 'bg-gray-200 text-gray-600 dark:bg-slate-700 dark:text-gray-300'
                        }`}
                    >
                      {isCompleted ? '✓' : index + 1}
                    </div>

                    {/* Label */}
                    <span
                      onClick={() => setActiveTab(step.key)}
                      className={`mt-2 text-xs font-medium cursor-pointer transition-all
                ${isActive
                          ? 'text-blue-600 dark:text-blue-400'
                          : isCompleted
                            ? 'text-green-600'
                            : 'text-gray-500 dark:text-gray-400'
                        }`}
                    >
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Progress Bar */}
            <div className="mt-4 h-1.5 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-500"
                style={{
                  width:
                    activeTab === 'upload' ? '33%' :
                      activeTab === 'records' ? '66%' : '100%',
                }}
              />
            </div>
          </div>
        </div>

        {/* Project Dropdown - Common for all tabs */}
        <div className="mb-6 relative" style={{ zIndex: 100 }}>
          Select Project / प्रकल्प निवडा:
          <SearchableFilter
            placeholder="Select Project"
            options={availableProjects}
            value={selectedProject}
            onChange={setSelectedProject}
            className="w-[350px]"
          />
        </div>

        {/* Stage 1: Upload Tab */}
        {activeTab === 'upload' && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6">
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

        {/* Stage 1: Records Tab */}
        {activeTab === 'records' && (
          <>
            <div className="mb-6 border border-indigo-200/50 bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 text-indigo-950 dark:text-indigo-200 shadow-md shadow-indigo-100/40 rounded-xl p-4">
              <div className="text-center">
                <h2 className="text-xl font-bold mb-1">{TEXT.title}</h2>
                <p className="text-indigo-800/80 dark:text-indigo-300/80 text-sm font-medium leading-tight mb-0.5">{TEXT.branch}</p>
                <p className="text-indigo-800/80 dark:text-indigo-300/80 text-sm font-medium leading-tight">{TEXT.projectName}</p>
                {allRecords.length > 0 && (
                  <p className="text-indigo-600 dark:text-indigo-400 text-sm mt-2">Total Records: {allRecords.length} from {sheetsList.length} sheets</p>
                )}
              </div>
            </div>

            {allRecords.length > 0 ? (
              <>
                <div className="mb-6 border-0 shadow-xl bg-white dark:bg-slate-800 rounded-xl">
                  <div className="flex items-center gap-4 flex-wrap md:flex-nowrap p-4 w-full relative">
                      Search
                    <div className="flex flex-1 w-full shrink h-10 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 focus-within:bg-white dark:focus-within:bg-slate-600 focus-within:ring-2 focus-within:ring-slate-300 transition-colors relative">
                      <div className="relative flex-1 h-full min-w-0">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                        <input
                          type="text"
                          placeholder="Search documents..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full h-full pl-9 pr-3 text-sm bg-transparent border-0 focus:outline-none focus:ring-0 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 rounded-l-lg"
                        />
                      </div>
                      <div className="relative" ref={columnMenuRef}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setColumnMenuOpen(!columnMenuOpen);
                          }}
                          className="flex items-center justify-between gap-1.5 px-3 h-full border-l border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors focus:outline-none shrink-0 bg-transparent cursor-pointer rounded-r-lg text-sm text-slate-600 dark:text-slate-300 min-w-[110px]"
                        >
                          <span className="truncate max-w-[80px]">
                            {searchColumns.length === availableColumns.length ? "All" : `${searchColumns.length} Selected`}
                          </span>
                          <ChevronDown className="h-4 w-4 text-slate-400" />
                        </button>
                        {columnMenuOpen && (
                          <div className="absolute right-0 mt-1 w-48 z-[9999] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-md rounded-md py-1">
                            {availableColumns.map(col => (
                              <div
                                key={col}
                                onClick={() => toggleColumn(col)}
                                className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700"
                              >
                                <Check className={`h-4 w-4 shrink-0 transition-opacity ${searchColumns.includes(col) ? "opacity-100 text-indigo-600" : "opacity-0"}`} />
                                {col}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 text-left text-[14px] relative">
                      Filters:
                      <div className="relative" style={{ zIndex: 9998 }}>
                        <SearchableFilter
                          placeholder="Select Shelf No"
                          options={["1", "2", "3", "4"]}
                          className="w-[180px]"
                        />
                      </div>
                      <div className="relative" style={{ zIndex: 9997 }}>
                        <SearchableFilter
                          placeholder="Select Gattha No"
                          options={sheetsList.map(s => s.name)}
                          className="w-[150px]"
                        />
                      </div>
                      <div className="relative" style={{ zIndex: 9996 }}>
                        <SearchableFilter
                          placeholder="Select Mahitiche Vargikaran"
                          options={["अ", "ब", "क", "ड"]}
                          className="w-[140px]"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-0 shadow-xl bg-white dark:bg-slate-800 rounded-xl overflow-hidden">
                  <div className="mt-4 border-t border-slate-100 dark:border-slate-700 bg-slate-50/30 dark:bg-slate-800/50">
                    <div className="max-h-[600px] overflow-auto relative rounded-b-xl">
                      <table className="w-full border-collapse text-sm">
                        <thead className="sticky top-0 z-[100] bg-gradient-to-r from-blue-50/95 to-indigo-50/95 dark:from-slate-800 dark:to-slate-800 backdrop-blur-md shadow-sm border-b border-indigo-100 dark:border-slate-700">
                          <tr className="text-indigo-950 dark:text-indigo-200 font-bold text-xs uppercase tracking-wider">
                            <th className="p-4 align-middle whitespace-nowrap text-center">अ.क्र</th>
                            <th className="p-4 align-middle whitespace-nowrap text-center">शेल्फ क्र.</th>
                            <th className="p-4 align-middle whitespace-nowrap text-center">गट्टा क्र.</th>
                            <th className="p-4 align-middle whitespace-nowrap text-center">नस्ती क्रमांक</th>
                            <th className="p-4 align-middle whitespace-nowrap text-center">संदर्भ क्र.</th>
                            <th className="p-4 align-middle min-w-[280px] text-left">विषय</th>
                            <th colSpan={2} className="p-4 align-middle text-center border-x border-indigo-100/50 dark:border-slate-700 bg-indigo-100/30 dark:bg-slate-700/50">नस्ती बंद करताना त्यामागील पृष्ठ</th>
                            <th className="p-4 align-middle whitespace-nowrap text-center">माहितीचे वर्गीकरण</th>
                            <th className="p-4 align-middle whitespace-nowrap text-center">नस्ती नष्ट करण्याचा दिनांक</th>
                            <th colSpan={2} className="p-4 align-middle text-center border-x border-indigo-100/50 dark:border-slate-700 bg-indigo-100/30 dark:bg-slate-700/50">व्यक्तीची सही</th>
                            <th className="p-4 align-middle min-w-[200px] text-left">शेरा</th>
                            <th className="p-4 align-middle whitespace-nowrap text-center">पृष्ठ क्र.</th>
                            <th className="p-4 align-middle whitespace-nowrap text-center">View</th>
                           </tr>
                          <tr className="text-indigo-800 dark:text-indigo-300 text-[11px] uppercase tracking-wider bg-indigo-100/20 dark:bg-slate-700/30 border-t border-indigo-100/60 dark:border-slate-700">
                            <th className="p-2"></th><th className="p-2"></th><th className="p-2"></th><th className="p-2"></th><th className="p-2"></th><th className="p-2"></th>
                            <th className="p-2 text-center border-l bg-indigo-100/30 dark:bg-slate-700/50 border-indigo-100/50 dark:border-slate-700">टिपणी भाग</th>
                            <th className="p-2 text-center border-r bg-indigo-100/30 dark:bg-slate-700/50 border-indigo-100/50 dark:border-slate-700">पत्रव्यवहार भाग</th>
                            <th className="p-2"></th><th className="p-2"></th>
                            <th className="p-2 text-center border-l bg-indigo-100/30 dark:bg-slate-700/50 border-indigo-100/50 dark:border-slate-700">पाठविणा-या</th>
                            <th className="p-2 text-center border-r bg-indigo-100/30 dark:bg-slate-700/50 border-indigo-100/50 dark:border-slate-700">स्वीकारणा-याची</th>
                            <th className="p-2"></th><th className="p-2"></th><th className="p-2"></th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                          {paginatedData.map((record) => (
                            <tr key={record.id} className="group bg-white dark:bg-slate-800 hover:bg-indigo-50/40 dark:hover:bg-slate-700/50 transition-colors duration-200">
                              <td className="p-4 text-center font-medium text-slate-700 dark:text-slate-300">{record.serialNo}</td>
                              <td className="p-4 text-center text-slate-600 dark:text-slate-400">{record.shelfNo || '-'}</td>
                              <td className="p-4 text-center text-slate-600 dark:text-slate-400">{record.bundleNo || '-'}</td>
                              <td className="p-4 text-center">
                                <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200 dark:border-slate-600">
                                  {record.fileNo || '-'}
                                </span>
                              </td>
                              <td className="p-4 text-center text-slate-600 dark:text-slate-400">{record.refNo || '-'}</td>
                              <td className="p-4">
                                <div className="whitespace-pre-line break-words max-w-[300px] text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                                  {record.subject}
                                </div>
                              </td>
                              <td className="p-4 text-center text-slate-600 dark:text-slate-400 border-l border-slate-50 dark:border-slate-700">{record.notePages}</td>
                              <td className="p-4 text-center text-slate-600 dark:text-slate-400 border-r border-slate-50 dark:border-slate-700">{record.correspondencePages}</td>
                              <td className="p-4 text-center">
                                <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold ${
                                  record.classification === 'अ' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                                  record.classification === 'ब' ? 'bg-blue-100 text-blue-700 border border-blue-200' :
                                  'bg-slate-100 text-slate-700 border border-slate-200'
                                }`}>
                                  {record.classification}
                                </span>
                              </td>
                              <td className="p-4 text-center text-slate-600 dark:text-slate-400">
                                {record.destructionDate === 'कायम' ? (
                                  <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm">
                                    {record.destructionDate}
                                  </span>
                                ) : record.destructionDate}
                              </td>
                              <td className="p-4 text-center text-slate-600 dark:text-slate-400 border-l border-slate-50 dark:border-slate-700">{record.senderSignature || '-'}</td>
                              <td className="p-4 text-center text-slate-600 dark:text-slate-400 border-r border-slate-50 dark:border-slate-700">{record.receiverSignature || '-'}</td>
                              <td className="p-4">
                                <div className="whitespace-pre-line break-words max-w-[250px] text-slate-500 dark:text-slate-400 text-xs leading-relaxed">
                                  {record.remarks}
                                </div>
                              </td>
                              <td className="p-4 text-center font-medium text-slate-700 dark:text-slate-300">{record.pageRange}</td>
                              <td className="p-4 text-center">
                                <button 
                                  onClick={() => setSelectedFile(record)}
                                  className="inline-flex items-center justify-center px-3 py-1.5 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-indigo-600 dark:text-indigo-400 shadow-sm hover:bg-indigo-50 dark:hover:bg-slate-600 hover:border-indigo-200 hover:text-indigo-700 transition-all font-medium text-sm"
                                >
                                  <Eye className="w-4 h-4 mr-1.5 text-slate-400" />
                                  View
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                       </table>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-800 border-t border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-4">
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Showing <span className="font-medium">{startIndex + 1}</span> to{" "}
                        <span className="font-medium">{Math.min(endIndex, filteredData.length)}</span> of{" "}
                        <span className="font-medium">{filteredData.length}</span>
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-slate-600 dark:text-slate-400">Items per page:</span>
                        <select
                          value={itemsPerPage}
                          onChange={(e) => {
                            setItemsPerPage(Number(e.target.value));
                            setCurrentPage(1);
                          }}
                          className="w-20 px-2 py-1 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-sm"
                        >
                          {[5, 10, 20, 50].map((value) => (
                            <option key={value} value={value}>{value}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-1.5 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-sm disabled:opacity-50 hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors"
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
                                : "border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600"
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                      <button
                        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1.5 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-sm disabled:opacity-50 hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors"
                      >
                        Next
                        <ChevronRight className="h-4 w-4 inline" />
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-12 text-center">
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

        {/* NEW: Stage 2 - PDF Mapping Tab */}
        {activeTab === 'mapping' && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6">
            {/* Stage 2 Header */}
            <div className="mb-6 border-b border-indigo-200 dark:border-indigo-800 pb-4">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <h2 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Stage 2: PDF Document Mapping</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    Link scanned PDF files to their corresponding extracted records. Auto-matching uses filename patterns against record metadata.
                  </p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/30 rounded-full">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                  <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400">
                    {allRecords.length} Records Available for Mapping
                  </span>
                </div>
              </div>
            </div>

            {/* Instructions for user  */}
            <div className="mb-6 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-5 border border-indigo-200 dark:border-indigo-800">
              <h3 className="text-md font-semibold text-indigo-700 dark:text-indigo-300 mb-4">
                Stage 2 Instructions – Surya Project
              </h3>

              <div className="space-y-4 text-sm text-slate-700 dark:text-slate-300">

                {/* Checkbox 1 */}
                <label className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={checks[0]}
                    onChange={() => {
                      const updated = [...checks];
                      updated[0] = !updated[0];
                      setChecks(updated);
                    }}
                  />                  <div>
                    <p>Have you created "{selectedProject}" in your SFTP Location?</p>
                    <p className="text-xs text-slate-500">तुम्ही SFTP लोकेशनमध्ये "{selectedProject}" तयार केला आहे का?</p>
                  </div>
                </label>

                {/* Checkbox 2 */}
                <label className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={checks[1]}
                    onChange={() => {
                      const updated = [...checks];
                      updated[1] = !updated[1];
                      setChecks(updated);
                    }}
                  />
                  <div>
                    <p>
                      Have you kept all Nasti Files in your "{selectedProject}" folder under "{selectedProject} Raw Files"?
                    </p>
                    <p className="text-xs text-slate-500">
                      तुम्ही सर्व नस्ती फाईल्स "{selectedProject} Raw Files" या फोल्डरमध्ये ठेवल्या आहेत का?
                    </p>
                  </div>
                </label>

                {/* Checkbox 3 */}
                <label className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={checks[2]}
                    onChange={() => {
                      const updated = [...checks];
                      updated[2] = !updated[2];
                      setChecks(updated);
                    }}
                  />
                  <div>
                    <p>
                      Have you ensured that each file is named as "nastinumber.pdf" for "Surya Project"?
                    </p>
                    <p className="text-xs text-slate-500">
                      तुम्ही प्रत्येक फाईलचे नाव "nastinumber.pdf" या स्वरूपात ठेवले आहे का?
                    </p>
                    <p className="text-xs italic text-slate-400">
                      e.g. if nasti number is 8 then file name should be 8.pdf
                    </p>
                  </div>
                </label>

                {/* Checkbox 4 */}
                <label className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={checks[3]}
                    onChange={() => {
                      const updated = [...checks];
                      updated[3] = !updated[3];
                      setChecks(updated);
                    }}
                  />
                  <div>
                    <p>
                      I provide my confirmation to process the scanned raw PDF files to link with Surya Project on this portal.
                    </p>
                    <p className="text-xs text-slate-500">
                      मी स्कॅन केलेल्या PDF फाईल्सना या पोर्टलवर Surya Project शी लिंक करण्यासाठी माझी संमती देतो.
                    </p>
                  </div>
                </label>

              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-3 mt-6">
                <button className="px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-700">
                  Cancel
                </button>

                <button
                  onClick={handleCompleteStage2}
                  disabled={!allChecked}
                  className={`px-4 py-2 rounded-lg text-white ${allChecked
                      ? 'bg-indigo-600 hover:bg-indigo-700'
                      : 'bg-gray-400 cursor-not-allowed'
                    }`}
                >
                  Complete the Stage 2
                </button>
              </div>
            </div>

            {/* PDF Mapping Panel */}
            {/* <PDFMappingPanel 
              records={allRecords} 
              onMappingComplete={handleMappingComplete}
              darkMode={darkMode}
            />

            {/* Mapping Summary Stats /}
            {pdfMappings.length > 0 && (
              <div className="mt-6 grid grid-cols-3 gap-4">
                <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-3 text-center">
                  <div className="text-2xl font-bold text-green-600">{pdfMappings.filter(m => m.status === 'verified').length}</div>
                  <div className="text-xs text-green-600">Verified</div>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3 text-center">
                  <div className="text-2xl font-bold text-blue-600">{pdfMappings.filter(m => m.status === 'matched').length}</div>
                  <div className="text-xs text-blue-600">Auto-Matched</div>
                </div>
                <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-3 text-center">
                  <div className="text-2xl font-bold text-yellow-600">{pdfMappings.filter(m => m.status === 'pending').length}</div>
                  <div className="text-xs text-yellow-600">Pending Review</div>
                </div>
              </div>
            )} */}

            {/* New Code */}
            {stage2Completed && (
              <>
                {/* PDF Mapping Panel */}
                <PDFMappingPanel
                  records={allRecords}
                  onMappingComplete={handleMappingComplete}
                  darkMode={darkMode}
                />

                {/* Mapping Summary Stats */}
                {pdfMappings.length > 0 && (
                  <div className="mt-6 grid grid-cols-3 gap-4">
                    <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-3 text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {pdfMappings.filter(m => m.status === 'verified').length}
                      </div>
                      <div className="text-xs text-green-600">Verified</div>
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3 text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {pdfMappings.filter(m => m.status === 'matched').length}
                      </div>
                      <div className="text-xs text-blue-600">Auto-Matched</div>
                    </div>

                    <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-3 text-center">
                      <div className="text-2xl font-bold text-yellow-600">
                        {pdfMappings.filter(m => m.status === 'pending').length}
                      </div>
                      <div className="text-xs text-yellow-600">Pending Review</div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </main>

      {/* View Record Dialog */}
      {selectedFile && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000]" onClick={() => setSelectedFile(null)}>
          <div className="bg-white dark:bg-slate-800 rounded-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">Record Details</h3>
                <button onClick={() => setSelectedFile(null)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">✕</button>
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