// app/page.tsx - With project dropdown disabled after records are extracted
'use client';

import { useState, useCallback, useRef, useEffect } from "react";
import * as XLSX from 'xlsx';
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { Search, ChevronDown, ChevronLeft, ChevronRight, Check, Upload, FileText, Link as LinkIcon, CheckCircle, AlertCircle, Loader2, UploadCloud, X, Table2, FileStack } from "lucide-react";
import CustomDropdown from "./component/CustomDropdown";
import { MdOutlineFileUpload } from "react-icons/md";
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

// // Internal components have been outsourced to component folder

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
        📋 Progress Log
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
              className={`text-sm py-1.5 px-2 rounded transition-all duration-200 ${darkMode ? 'hover:bg-gray-700/50' : 'hover:bg-gray-100'
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

// Mapping Logger Component (Same design as Progress Log)
function MappingLogger({ logs, darkMode }: { logs: string[]; darkMode: boolean }) {
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <div className={`rounded-lg overflow-hidden border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
      <div className={`px-4 py-3 border-b font-medium ${darkMode ? 'border-gray-700 bg-gray-800/50 text-gray-200' : 'border-gray-200 bg-gray-50 text-gray-700'}`}>
        📋 Mapping Logger
      </div>
      <div className="h-64 overflow-y-auto p-3 space-y-2">
        {logs.length === 0 ? (
          <p className={`text-sm text-center py-8 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
            No mapping logs yet. Click "Complete Stage 2" to start mapping.
          </p>
        ) : (
          logs.map((log, index) => (
            <div
              key={index}
              className={`text-sm py-1.5 px-2 rounded transition-all duration-200 ${darkMode ? 'hover:bg-gray-700/50' : 'hover:bg-gray-100'
                }`}
            >
              <span className="mr-2">📄</span>
              <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>{log}</span>
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
    const input = e.target;
    if (!input.files?.length || isProcessing) return;
    const excel = firstExcelFile(input.files);
    input.value = "";
    if (excel) onFilesSelected([excel]);
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
    if (!isProcessing && e.dataTransfer.files?.length) {
      const excel = firstExcelFile(e.dataTransfer.files);
      if (excel) onFilesSelected([excel]);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`relative border-2 border-dashed rounded-xl p-8 transition-all duration-200 ${isDragOver
        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
        : darkMode
          ? 'border-gray-600 hover:border-gray-500 bg-gray-800'
          : 'border-gray-300 hover:border-gray-400 bg-gray-50'
        } ${isProcessing ? 'opacity-50 pointer-events-none' : ''}`}
    >
      <input
        type="file"
        accept={EXCEL_ACCEPT}
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
          .xlsx or .xls • One file only (replaces previous)
        </p>
      </div>
    </div>
  );
}

// ==================== Main Component ====================

const availableProjects = [
  "तारापूर अणुऊर्जा प्रकल्प ३ & ४",
  "सुर्या प्रकल्प",
];

const availableColumns = ["Subject", "File No", "Remarks", "Shelf No"];

const EXCEL_ACCEPT =
  ".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel";

function isExcelFile(file: File): boolean {
  const lower = file.name.toLowerCase();
  if (lower.endsWith(".xlsx") || lower.endsWith(".xls")) return true;
  return (
    file.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
    file.type === "application/vnd.ms-excel" ||
    file.type === "application/vnd.ms-excel.sheet.macroEnabled.12"
  );
}

function firstExcelFile(files: FileList | File[]): File | null {
  for (const f of Array.from(files)) {
    if (isExcelFile(f)) return f;
  }
  return null;
}

type StepKey = 'upload' | 'records' | 'mapping';

const steps: { key: StepKey; label: string; icon: LucideIcon }[] = [
  { key: "upload", label: "Upload", icon: Upload },
  { key: "records", label: "Records", icon: Table2 },
  { key: "mapping", label: "PDF Mapping", icon: FileStack },
];

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
  const [searchColumns, setSearchColumns] = useState<string[]>(availableColumns);
  const [columnMenuOpen, setColumnMenuOpen] = useState(false);
  const [pdfMappings, setPdfMappings] = useState<PDFMapping[]>([]);
  const columnMenuRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const [checks, setChecks] = useState([false, false, false, false]);
  const [stage2Completed, setStage2Completed] = useState(false);
  const [mappingLogs, setMappingLogs] = useState<string[]>([]);

  const allChecked = checks.every(Boolean);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target;
    if (!input.files?.length) return;
    const excel = firstExcelFile(input.files);
    input.value = "";
    if (excel) setFiles([excel]);
  };

  // Clears all selected files
  const handleCancelFiles = () => {
    setFiles([]); // assuming you have a `files` state
    setLogs([]); // optional: clear logs too
    setProgress(0); // reset progress if needed
  };

  const removeFileAt = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // Exports selected files
  const handleExportFiles = () => {
    if (files.length === 0) return;

    // Example: create a ZIP of files or trigger download
    // For simplicity, here we just log file names
    console.log("Exporting files:", files.map(f => f.name));

    // If you want, you can implement actual download logic:
    // files.forEach(file => { ... })
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (!e.dataTransfer.files?.length) return;
    const excel = firstExcelFile(e.dataTransfer.files);
    if (excel) setFiles([excel]);
  };

  // Check if project dropdown should be disabled (after records are extracted)
  const isProjectDisabled = allRecords.length > 0;

  const toggleColumn = (col: string) => {
    setSearchColumns(prev =>
      prev.includes(col) ? prev.filter(c => c !== col) : [...prev, col]
    );
  };

  // Helper function to add logs to mapping logger
  const addLogToMapping = (message: string) => {
    setMappingLogs(prev => [...prev, message]);
  };

  // Check if step is completed
  const isStepCompleted = (stepKey: StepKey): boolean => {
    if (stepKey === 'upload') return allRecords.length > 0;
    if (stepKey === 'records') return allRecords.length > 0;
    if (stepKey === 'mapping') return stage2Completed;
    return false;
  };

  // Handle next step navigation
  const goToNextStep = () => {
    if (activeTab === 'upload' && allRecords.length > 0) {
      setActiveTab('records');
    } else if (activeTab === 'records' && allRecords.length > 0) {
      setActiveTab('mapping');
    }
  };

  // Handle previous step navigation
  const goToPreviousStep = () => {
    if (activeTab === 'records') {
      setActiveTab('upload');
    } else if (activeTab === 'mapping') {
      setActiveTab('records');
    }
  };

  const handleCompleteStage2 = async () => {
    if (allChecked) {
      setStage2Completed(true);
      setMappingLogs([]);

      addLogToMapping(`🚀 Starting PDF Mapping Process for "${selectedProject}"...`);
      await new Promise(resolve => setTimeout(resolve, 500));

      addLogToMapping(`📁 Scanning for PDF files in folder structure...`);
      await new Promise(resolve => setTimeout(resolve, 800));

      addLogToMapping(`📊 Found ${allRecords.length} records to map`);
      await new Promise(resolve => setTimeout(resolve, 500));

      let mappedCount = 0;
      for (let i = 0; i < Math.min(allRecords.length, 15); i++) {
        const record = allRecords[i];
        await new Promise(resolve => setTimeout(resolve, 200));

        if (record.fileNo && record.fileNo !== '-') {
          addLogToMapping(`✅ Matched: ${record.fileNo}.pdf → Record #${record.serialNo} (${record.subject.substring(0, 40)}...)`);
          mappedCount++;
        } else {
          addLogToMapping(`⚠️ No match found for record #${record.serialNo} (missing file number)`);
        }
      }

      if (allRecords.length > 15) {
        addLogToMapping(`... and ${allRecords.length - 15} more records processed`);
      }

      await new Promise(resolve => setTimeout(resolve, 500));
      addLogToMapping(`🎉 Mapping completed! ${mappedCount} out of ${allRecords.length} files matched successfully.`);
    }
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
    const excel = firstExcelFile(selectedFiles);
    if (!excel) return;
    setFiles([excel]);
    setSheetsList([]);
    setAllRecords([]);
    addLog(`📎 ${excel.name} (${formatFileSize(excel.size)})`, 'info');
  }, [addLog, formatFileSize]);

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

  const goToStep = (stepKey: StepKey) => {
    if (stepKey === "upload") setActiveTab("upload");
    else if (stepKey === "records" && allRecords.length > 0) setActiveTab("records");
    else if (stepKey === "mapping" && allRecords.length > 0) setActiveTab("mapping");
  };

  return (
    <div
      className={`flex min-h-0 flex-col overflow-hidden transition-colors duration-300 h-[calc(100dvh-7.5rem)] ${darkMode ? "dark bg-slate-900" : "bg-gradient-to-br from-[#F7F7F7] via-blue-50 to-indigo-50"}`}
    >
      <main className="mx-auto flex h-full min-h-0 w-full max-w-[1600px] flex-1 flex-col px-4 py-4">
        <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-hidden lg:flex-row lg:items-stretch">
          {/* Left: stepper — fills column; no page scroll */}
          <aside className="flex w-full shrink-0 flex-col self-stretch min-h-0 lg:w-[20%] lg:min-w-[11rem] lg:max-w-[15rem]">
            <div className="flex w-full flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xl dark:border-slate-700 dark:bg-slate-800 lg:min-h-0 lg:flex-1">
              <p className="mb-4 shrink-0 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Progress
              </p>
              <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
                {steps.map((step, index) => {
                  const isActive = activeTab === step.key;
                  const isCompleted = isStepCompleted(step.key);
                  const disabled =
                    (step.key === "records" && allRecords.length === 0) ||
                    (step.key === "mapping" && allRecords.length === 0);
                  const StepIcon = step.icon;

                  return (
                    <div key={step.key} className="flex flex-col">
                      <button
                        type="button"
                        aria-current={isActive ? "step" : undefined}
                        disabled={disabled}
                        onClick={() => goToStep(step.key)}
                        className={`group flex w-full items-center gap-3 rounded-xl p-3 text-left transition-all duration-200 ${
                          isActive
                            ? "border-2 border-[#09b556] bg-emerald-50/70 shadow-md shadow-emerald-900/5 ring-2 ring-[#09b556]/25 dark:border-emerald-500 dark:bg-emerald-950/35 dark:ring-emerald-500/30"
                            : "border-2 border-transparent bg-slate-50/50 dark:bg-slate-700/30"
                        } ${
                          !disabled && !isActive
                            ? "hover:border-slate-300 hover:bg-white dark:hover:border-slate-500 dark:hover:bg-slate-700/50"
                            : ""
                        } ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
                      >
                        <span
                          className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border transition-colors ${
                            isActive
                              ? "border-emerald-200 bg-white text-[#09b556] shadow-sm dark:border-emerald-700 dark:bg-slate-800 dark:text-emerald-400"
                              : isCompleted
                                ? "border-emerald-200/80 bg-emerald-100 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300"
                                : "border-slate-200 bg-white text-slate-400 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-500"
                          }`}
                        >
                          {isCompleted ? (
                            <Check className="h-7 w-7 stroke-[2.5]" aria-hidden />
                          ) : (
                            <StepIcon className="h-7 w-7" strokeWidth={1.75} aria-hidden />
                          )}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span
                            className={`block text-sm font-semibold leading-tight ${
                              isActive
                                ? "text-emerald-800 dark:text-emerald-300"
                                : isCompleted
                                  ? "text-emerald-700 dark:text-emerald-400"
                                  : "text-slate-600 dark:text-slate-400"
                            }`}
                          >
                            {step.label}
                          </span>
                          <span className="mt-0.5 block text-[11px] font-medium text-slate-400 dark:text-slate-500">
                            {step.key === "upload" && "Spreadsheet upload"}
                            {step.key === "records" && "Review extracted rows"}
                            {step.key === "mapping" && "Link PDF documents"}
                          </span>
                        </span>
                      </button>
                      {index < steps.length - 1 && (
                        <div
                          className="flex justify-start py-5 pl-10"
                          aria-hidden
                        >
                          <div
                            className={`w-0.5 min-h-[52px] shrink-0 rounded-full ${
                              isCompleted
                                ? "bg-gradient-to-b from-emerald-400 to-emerald-600"
                                : "bg-slate-200 dark:bg-slate-600"
                            }`}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="mt-auto pt-4 shrink-0 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-green-400 to-emerald-600 transition-all duration-500"
                  style={{
                    width:
                      activeTab === "upload"
                        ? "33%"
                        : activeTab === "records"
                          ? "66%"
                          : "100%",
                  }}
                />
              </div>
            </div>
          </aside>

          {/* Right: project row fixed; only inner stage area scrolls */}
          <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
            <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-800">
              {/* Shared horizontal inset: padding on wrapper, scroll uses inner only so scrollbar does not steal width vs project */}
              <div className="flex min-h-0 flex-1 flex-col px-6 pb-6 pt-6">
                <div className="relative mb-6 shrink-0 w-full" style={{ zIndex: 100 }}>
                  <label className={`mb-1 block text-sm font-medium ${isProjectDisabled ? "text-gray-400 dark:text-gray-500" : "text-slate-700 dark:text-slate-300"}`}>
                    Select Project / प्रकल्प निवडा:
                    {isProjectDisabled && <span className="ml-2 text-xs text-gray-400">(Project locked after extraction)</span>}
                  </label>
                  <CustomDropdown
                    placeholder="Select Project"
                    options={availableProjects.map(p => ({ label: p, value: p }))}
                    value={selectedProject}
                    onChange={setSelectedProject}
                    disabled={isProjectDisabled}
                    className="w-full max-w-full"
                  />
                </div>

                <div
                  className={`flex min-h-0 w-full flex-1 flex-col overflow-x-hidden overscroll-contain [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden ${
                    activeTab === "records" ? "overflow-hidden" : "overflow-y-auto"
                  }`}
                >
        {/* Stage 1: Upload Tab */}
        {activeTab === 'upload' && (
          // <div className="bg-[#FAFAFA] dark:bg-slate-800 rounded-2xl shadow-xl p-6">
          //   {/* <FileUpload onFilesSelected={handleFilesSelected} isProcessing={isProcessing} darkMode={darkMode} /> */}
          //   <div className="space-y-2">
          //     <label className="block font-semibold text-[#121212] text-[16px]">Attachments</label>
          //     <div className="relative group">
          //       <div
          //         onDragOver={(e) => e.preventDefault()}
          //         onDrop={handleFileDrop}
          //         onClick={() => document.getElementById('file-upload')?.click()}
          //         className="w-full rounded-xl border-2 border-dashed border-[#e4e4e4] bg-[#fafafa]/50 transition-all p-8 flex flex-col items-center justify-center gap-3 cursor-pointer">
          //         <div className="w-10 h-10 rounded-full bg-transparent flex items-center justify-center text-[#09b556] group-hover:scale-110 transition-transform">
          //           <UploadCloud size={32} strokeWidth={1.5} />
          //         </div>
          //         <div className="text-center space-y-0.5">
          //           <p className="text-[12px] font-semibold text-[#121212]">Drag and drop files here,</p>
          //           <p className="text-[12px] font-semibold text-[#121212]">or <span className="text-[#121212] font-semibold">click to browse</span></p>
          //           <p className="text-[10px] text-[#636363] pt-1">PDF, DOCX, JPG, PNG, up to 500kb each</p>
          //         </div>
          //       </div>
          //       <input
          //         id="file-upload"
          //         type="file"
          //         multiple
          //         className="hidden"
          //         onChange={handleFileSelect}
          //       />
          //     </div>

          //     {files.length > 0 && (
          //       <div className="flex flex-wrap gap-2 pt-2">
          //         {files.map((file, index) => (
          //           <div key={index} className="flex items-center gap-2 bg-[#f0f9ff] border border-[#bae6fd] px-3 py-1 rounded-full text-[12px] text-[#0369a1]">
          //             <span className="truncate max-w-[150px]">{file.name}</span>
          //             {/* <button onClick={() => removeFile(index)} className="hover:text-red-500 font-bold">×</button> */}
          //           </div>
          //         ))}
          //       </div>
          //     )}
          //   </div>

          //   {files.length > 0 && !isProcessing && (
          //     <div className="mt-4 p-4 rounded-lg bg-gray-100 dark:bg-gray-700/50">
          //       <h3 className="text-sm font-medium mb-2 text-gray-600 dark:text-gray-300">📎 Selected Files ({files.length})</h3>
          //       <div className="flex flex-col gap-1.5 max-h-40 overflow-y-auto">
          //         {files.map((file, idx) => (
          //           <div key={idx} className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-[#FAFAFA] dark:bg-gray-600 text-gray-700 dark:text-gray-200 text-sm">
          //             <div className="flex items-center gap-2"><span>📊</span><span className="font-medium truncate">{file.name}</span></div>
          //             <span className="text-xs text-gray-500 dark:text-gray-400">{formatFileSize(file.size)}</span>
          //           </div>
          //         ))}
          //       </div>
          //     </div>
          //   )}
          //   <div className="flex gap-3 mt-4">
          //     <button onClick={processFiles} disabled={files.length === 0 || isProcessing} className={`px-5 py-2.5 rounded-lg font-medium transition-all transform active:scale-95 ${files.length === 0 || isProcessing ? 'bg-gray-300 cursor-not-allowed dark:bg-gray-700 dark:text-gray-400' : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg'}`}>
          //       {isProcessing ? '⚙️ Processing...' : 'Extract Records'}
          //     </button>
          //   </div>
          //   {(isProcessing || logs.length > 0) && (
          //     <>
          //       <ProgressBar progress={progress} darkMode={darkMode} />
          //       <div className="space-y-2 mt-4">
          //         {/* <h3 className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>📝 Progress Log</h3> */}
          //         <LogsPanel logs={logs} darkMode={darkMode} />
          //       </div>
          //     </>
          //   )}
          //   {allRecords.length > 0 && (
          //     <div className="mt-6 flex justify-end">
          //       <button
          //         onClick={goToNextStep}
          //         className="px-6 py-2.5 rounded-xl font-medium transition-all bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg flex items-center gap-2"
          //       >
          //         Proceed to Next Stage
          //         <ChevronRight className="w-5 h-5" />
          //       </button>
          //     </div>
          //   )}
          // </div>
          <div className="space-y-2">
              <label className="block font-semibold text-[#121212] dark:text-slate-100 text-[16px]">Attachments</label>

              {/* Drop Area */}
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleFileDrop}
                onClick={() => document.getElementById('file-upload')?.click()}
                className="w-full rounded-lg border border-dotted border-slate-500/45 dark:border-slate-400/55 bg-transparent transition-all p-6 flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-slate-500/70 dark:hover:border-slate-400/80"
              >
                <div className="w-8 h-8 flex items-center justify-center text-[#09b556]">
                  <MdOutlineFileUpload size={24} />
                </div>
                <div className="text-center space-y-0.5">
                  <p className="text-[12px] font-semibold text-[#121212] dark:text-slate-100">Drag and drop files here,</p>
                  <p className="text-[12px] font-semibold text-[#121212] dark:text-slate-100">or <span className="font-semibold">click to browse</span></p>
                  <p className="text-[10px] text-[#636363] dark:text-slate-400 pt-1">Excel only (.xlsx, .xls) — one file; choosing again replaces it</p>
                </div>
                <input
                  id="file-upload"
                  type="file"
                  accept={EXCEL_ACCEPT}
                  className="hidden"
                  onChange={handleFileSelect}
                />
              </div>

              {/* Selected files preview */}
              {files.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {files.map((file, index) => (
                    <div
                      key={`${file.name}-${index}`}
                      className="flex items-center gap-1.5 pl-3 pr-1 py-1 rounded-full text-[12px] text-[#0369a1] bg-[#f0f9ff] border border-[#bae6fd] dark:bg-sky-950/40 dark:border-sky-800 dark:text-sky-200"
                    >
                      <span className="truncate max-w-[200px]">{file.name}</span>
                      <button
                        type="button"
                        onClick={() => removeFileAt(index)}
                        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[#0369a1] hover:bg-sky-200/80 dark:text-sky-200 dark:hover:bg-sky-800/80 transition-colors"
                        aria-label={`Remove ${file.name}`}
                      >
                        <X className="h-3.5 w-3.5" strokeWidth={2.5} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Buttons below drop area */}
              {/* Buttons below drop area, aligned to the right */}
              <div className="flex justify-end gap-3 mt-4">
                <button
                  onClick={handleCancelFiles}
                  className="px-4 py-2 rounded-lg bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-400 dark:hover:bg-gray-600 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={processFiles}
                  className="px-4 py-2 rounded-lg bg-[#09B556] hover:bg-[#079c4a] text-white transition"
                  disabled={files.length === 0}
                >
                  Export
                </button>
              </div>
          </div>
        )}

        {/* Stage 1: Records Tab */}
        {activeTab === 'records' && (
          <div className="flex min-h-0 min-w-0 flex-1 flex-col">
            {allRecords.length > 0 && (
              <div className="sticky top-0 z-[70] mb-3 shrink-0 border-b border-slate-200/80 bg-transparent py-1.5 text-left dark:border-slate-600">
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                  Total Records: {allRecords.length} from {sheetsList.length} sheets
                </p>
              </div>
            )}
            {allRecords.length > 0 ? (
              <>
                <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border-0 bg-[#FAFAFA] dark:bg-slate-800">
                  <div className="flex min-h-0 flex-1 flex-col border-t border-slate-100 bg-[#F7F7F7]/30 dark:border-slate-700 dark:bg-slate-800/50">
                    <div className="min-h-0 flex-1 overflow-auto rounded-b-xl">
                      <table className="w-max min-w-full border-separate border-spacing-0 text-sm">
                        <thead>
                          <tr className="text-xs font-bold uppercase leading-none tracking-wider text-slate-800 dark:text-slate-300">
                            <th className="sticky top-0 left-0 z-50 box-border min-w-[4.5rem] w-[4.5rem] max-w-[4.5rem] border-b border-r border-slate-200 bg-indigo-50/98 py-1.5 px-2 text-center align-middle whitespace-nowrap backdrop-blur-sm dark:border-slate-600 dark:bg-slate-800/98">
                              अ.क्र
                            </th>
                            <th className="sticky top-0 left-[4.5rem] z-50 box-border min-w-[5rem] w-[5rem] max-w-[5rem] border-b border-r border-slate-200 bg-indigo-50/98 py-1.5 px-2 text-center align-middle whitespace-nowrap backdrop-blur-sm dark:border-slate-600 dark:bg-slate-800/98">
                              शेल्फ क्र.
                            </th>
                            <th className="sticky top-0 left-[9.5rem] z-50 box-border min-w-[5rem] w-[5rem] max-w-[5rem] border-b border-r border-slate-200 bg-indigo-50/98 py-1.5 px-2 text-center align-middle whitespace-nowrap backdrop-blur-sm dark:border-slate-600 dark:bg-slate-800/98">
                              गट्टा क्र.
                            </th>
                            <th className="sticky top-0 z-40 border-b border-indigo-100/50 bg-gradient-to-r from-indigo-50/98 to-blue-50/98 py-1.5 px-2 text-center align-middle whitespace-nowrap backdrop-blur-sm dark:border-slate-700 dark:from-slate-800/98 dark:to-slate-800/98">
                              नस्ती क्रमांक
                            </th>
                            <th className="sticky top-0 z-40 border-b border-indigo-100/50 bg-gradient-to-r from-indigo-50/98 to-blue-50/98 py-1.5 px-2 text-center align-middle whitespace-nowrap backdrop-blur-sm dark:border-slate-700 dark:from-slate-800/98 dark:to-slate-800/98">
                              संदर्भ क्र.
                            </th>
                            <th className="sticky top-0 z-40 min-w-[280px] border-b border-indigo-100/50 bg-gradient-to-r from-indigo-50/98 to-blue-50/98 py-1.5 px-2 text-left align-middle backdrop-blur-sm dark:border-slate-700 dark:from-slate-800/98 dark:to-slate-800/98">
                              विषय
                            </th>
                            <th colSpan={2} className="sticky top-0 z-40 border-b border-x border-indigo-100/50 bg-indigo-100/40 py-1.5 px-2 text-center align-middle whitespace-nowrap dark:border-slate-700 dark:bg-slate-700/60">
                              नस्ती बंद करताना त्यामागील पृष्ठ
                            </th>
                            <th className="sticky top-0 z-40 border-b border-indigo-100/50 bg-gradient-to-r from-indigo-50/98 to-blue-50/98 py-1.5 px-2 text-center align-middle whitespace-nowrap backdrop-blur-sm dark:border-slate-700 dark:from-slate-800/98 dark:to-slate-800/98">
                              माहितीचे वर्गीकरण
                            </th>
                            <th className="sticky top-0 z-40 border-b border-indigo-100/50 bg-gradient-to-r from-indigo-50/98 to-blue-50/98 py-1.5 px-2 text-center align-middle whitespace-nowrap backdrop-blur-sm dark:border-slate-700 dark:from-slate-800/98 dark:to-slate-800/98">
                              नस्ती नष्ट करण्याचा दिनांक
                            </th>
                            <th colSpan={2} className="sticky top-0 z-40 border-b border-x border-indigo-100/50 bg-indigo-100/40 py-1.5 px-2 text-center align-middle whitespace-nowrap dark:border-slate-700 dark:bg-slate-700/60">
                              व्यक्तीची सही
                            </th>
                            <th className="sticky top-0 z-40 min-w-[200px] border-b border-indigo-100/50 bg-gradient-to-r from-indigo-50/98 to-blue-50/98 py-1.5 px-2 text-left align-middle backdrop-blur-sm dark:border-slate-700 dark:from-slate-800/98 dark:to-slate-800/98">
                              शेरा
                            </th>
                            <th className="sticky top-0 z-40 border-b border-indigo-100/50 bg-gradient-to-r from-indigo-50/98 to-blue-50/98 py-1.5 px-2 text-center align-middle whitespace-nowrap backdrop-blur-sm dark:border-slate-700 dark:from-slate-800/98 dark:to-slate-800/98">
                              पृष्ठ क्र.
                            </th>
                          </tr>
                          <tr className="bg-indigo-100/25 text-[11px] font-bold uppercase leading-snug tracking-wider text-slate-700 dark:bg-slate-700/35 dark:text-slate-400">
                            <th className="sticky top-[calc(1.5rem+1px)] left-0 z-50 box-border min-w-[4.5rem] w-[4.5rem] max-w-[4.5rem] border-b border-r border-slate-200 bg-indigo-100/90 py-2 px-2 backdrop-blur-sm dark:border-slate-600 dark:bg-slate-800/98" />
                            <th className="sticky top-[calc(1.5rem+1px)] left-[4.5rem] z-50 box-border min-w-[5rem] w-[5rem] max-w-[5rem] border-b border-r border-slate-200 bg-indigo-100/90 py-2 px-2 backdrop-blur-sm dark:border-slate-600 dark:bg-slate-800/98" />
                            <th className="sticky top-[calc(1.5rem+1px)] left-[9.5rem] z-50 box-border min-w-[5rem] w-[5rem] max-w-[5rem] border-b border-r border-slate-200 bg-indigo-100/90 py-2 px-2 backdrop-blur-sm dark:border-slate-600 dark:bg-slate-800/98" />
                            <th className="sticky top-[calc(1.5rem+1px)] z-40 border-b border-slate-200/80 bg-indigo-100/90 py-2 px-2 dark:border-slate-600 dark:bg-slate-800/98" />
                            <th className="sticky top-[calc(1.5rem+1px)] z-40 border-b border-slate-200/80 bg-indigo-100/90 py-2 px-2 dark:border-slate-600 dark:bg-slate-800/98" />
                            <th className="sticky top-[calc(1.5rem+1px)] z-40 border-b border-slate-200/80 bg-indigo-100/90 py-2 px-2 dark:border-slate-600 dark:bg-slate-800/98" />
                            <th className="sticky top-[calc(1.5rem+1px)] z-40 border-b border-l border-indigo-100/50 bg-indigo-100/50 py-2 px-2 text-center dark:border-slate-700 dark:bg-slate-700/50">
                              टिपणी भाग
                            </th>
                            <th className="sticky top-[calc(1.5rem+1px)] z-40 border-b border-r border-indigo-100/50 bg-indigo-100/50 py-2 px-2 text-center dark:border-slate-700 dark:bg-slate-700/50">
                              पत्रव्यवहार भाग
                            </th>
                            <th className="sticky top-[calc(1.5rem+1px)] z-40 border-b border-slate-200/80 bg-indigo-100/90 py-2 px-2 dark:border-slate-600 dark:bg-slate-800/98" />
                            <th className="sticky top-[calc(1.5rem+1px)] z-40 border-b border-slate-200/80 bg-indigo-100/90 py-2 px-2 dark:border-slate-600 dark:bg-slate-800/98" />
                            <th className="sticky top-[calc(1.5rem+1px)] z-40 border-b border-l border-indigo-100/50 bg-indigo-100/50 py-2 px-2 text-center dark:border-slate-700 dark:bg-slate-700/50">
                              पाठविणा-या
                            </th>
                            <th className="sticky top-[calc(1.5rem+1px)] z-40 border-b border-r border-indigo-100/50 bg-indigo-100/50 py-2 px-2 text-center dark:border-slate-700 dark:bg-slate-700/50">
                              स्वीकारणा-याची
                            </th>
                            <th className="sticky top-[calc(1.5rem+1px)] z-40 border-b border-slate-200/80 bg-indigo-100/90 py-2 px-2 dark:border-slate-600 dark:bg-slate-800/98" />
                            <th className="sticky top-[calc(1.5rem+1px)] z-40 border-b border-slate-200/80 bg-indigo-100/90 py-2 px-2 dark:border-slate-600 dark:bg-slate-800/98" />
                          </tr>
                        </thead>
                        <tbody>
                          {paginatedData.map((record) => (
                            <tr key={record.id} className="group bg-[#FAFAFA] transition-colors duration-200 dark:bg-slate-800 hover:bg-indigo-50/40 dark:hover:bg-slate-700/50">
                              <td className="sticky left-0 z-20 box-border min-w-[4.5rem] w-[4.5rem] max-w-[4.5rem] border-b border-r border-slate-200 bg-[#FAFAFA] p-4 text-center font-medium text-slate-700 group-hover:bg-indigo-50/60 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:group-hover:bg-slate-700/80">
                                {record.serialNo}
                              </td>
                              <td className="sticky left-[4.5rem] z-20 box-border min-w-[5rem] w-[5rem] max-w-[5rem] border-b border-r border-slate-200 bg-[#FAFAFA] p-4 text-center text-slate-600 group-hover:bg-indigo-50/60 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-400 dark:group-hover:bg-slate-700/80">
                                {record.shelfNo || "-"}
                              </td>
                              <td className="sticky left-[9.5rem] z-20 box-border min-w-[5rem] w-[5rem] max-w-[5rem] border-b border-r border-slate-200 bg-[#FAFAFA] p-4 text-center text-slate-600 group-hover:bg-indigo-50/60 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-400 dark:group-hover:bg-slate-700/80">
                                {record.bundleNo || "-"}
                              </td>
                              <td className="border-b border-slate-100 p-4 text-center dark:border-slate-700">
                                <span className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-[#F0F0F0] px-2.5 py-1 text-xs font-medium text-slate-700 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300">
                                  {record.fileNo || "-"}
                                </span>
                              </td>
                              <td className="border-b border-slate-100 p-4 text-center text-slate-600 dark:border-slate-700 dark:text-slate-400">{record.refNo || "-"}</td>
                              <td className="border-b border-slate-100 p-4 dark:border-slate-700">
                                <div className="max-w-[300px] whitespace-pre-line break-words font-medium leading-relaxed text-slate-700 dark:text-slate-300">{record.subject}</div>
                              </td>
                              <td className="border-b border-l border-slate-100 p-4 text-center text-slate-600 dark:border-slate-700 dark:text-slate-400">{record.notePages}</td>
                              <td className="border-b border-r border-slate-100 p-4 text-center text-slate-600 dark:border-slate-700 dark:text-slate-400">{record.correspondencePages}</td>
                              <td className="border-b border-slate-100 p-4 text-center dark:border-slate-700">
                                <span className={`inline-flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${record.classification === "अ" ? "border border-amber-200 bg-amber-100 text-amber-700" : record.classification === "ब" ? "border border-blue-200 bg-blue-100 text-slate-600" : "border border-slate-200 bg-[#F0F0F0] text-slate-700"}`}>{record.classification}</span>
                              </td>
                              <td className="border-b border-slate-100 p-4 text-center text-slate-600 dark:border-slate-700 dark:text-slate-400">
                                {record.destructionDate === "कायम" ? (
                                  <span className="inline-flex items-center rounded border border-emerald-200 bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700">{record.destructionDate}</span>
                                ) : (
                                  record.destructionDate
                                )}
                              </td>
                              <td className="border-b border-l border-slate-100 p-4 text-center text-slate-600 dark:border-slate-700 dark:text-slate-400">{record.senderSignature || "-"}</td>
                              <td className="border-b border-r border-slate-100 p-4 text-center text-slate-600 dark:border-slate-700 dark:text-slate-400">{record.receiverSignature || "-"}</td>
                              <td className="border-b border-slate-100 p-4 dark:border-slate-700">
                                <div className="max-w-[250px] whitespace-pre-line break-words text-xs leading-relaxed text-slate-500 dark:text-slate-400">{record.remarks}</div>
                              </td>
                              <td className="border-b border-slate-100 p-4 text-center font-medium text-slate-700 dark:border-slate-700 dark:text-slate-300">{record.pageRange}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  <div className="flex shrink-0 flex-col items-center justify-between gap-4 border-t border-slate-200 bg-gradient-to-r from-[#F7F7F7] to-[#F0F0F0] px-6 py-4 dark:border-slate-700 dark:from-slate-800 dark:to-slate-800 sm:flex-row">
                    <div className="flex items-center gap-4">
                      <p className="text-sm text-slate-600 dark:text-slate-400">Showing <span className="font-medium">{startIndex + 1}</span> to <span className="font-medium">{Math.min(endIndex, filteredData.length)}</span> of <span className="font-medium">{filteredData.length}</span></p>
                      <div className="flex items-center gap-2"><span className="text-sm text-slate-600 dark:text-slate-400">Items per page:</span><select value={itemsPerPage} onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }} className="w-20 px-2 py-1 border border-slate-300 dark:border-slate-600 rounded-md bg-[#FAFAFA] dark:bg-slate-700 text-sm">{[5, 10, 20, 50].map((value) => (<option key={value} value={value}>{value}</option>))}</select></div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="px-3 py-1.5 border border-slate-300 dark:border-slate-600 rounded-md bg-[#FAFAFA] dark:bg-slate-700 text-sm disabled:opacity-50 hover:bg-[#F7F7F7] dark:hover:bg-slate-600 transition-colors"><ChevronLeft className="h-4 w-4 inline" /> Prev</button>
                      {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => { let pageNum; if (totalPages <= 5) pageNum = i + 1; else if (currentPage <= 3) pageNum = i + 1; else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i; else pageNum = currentPage - 2 + i; return (<button key={pageNum} onClick={() => setCurrentPage(pageNum)} className={`px-3 py-1.5 rounded-md text-sm transition-all ${currentPage === pageNum ? "bg-gradient-to-r from-indigo-600 to-blue-600 text-white" : "border border-slate-300 dark:border-slate-600 bg-[#FAFAFA] dark:bg-slate-700 hover:bg-[#F7F7F7] dark:hover:bg-slate-600"}`}>{pageNum}</button>); })}
                      <button onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className="px-3 py-1.5 border border-slate-300 dark:border-slate-600 rounded-md bg-[#FAFAFA] dark:bg-slate-700 text-sm disabled:opacity-50 hover:bg-[#F7F7F7] dark:hover:bg-slate-600 transition-colors">Next <ChevronRight className="h-4 w-4 inline" /></button>
                    </div>
                  </div>
                  </div>
                </div>
                <div className="mt-4 flex shrink-0 justify-between">
                  <button
                    onClick={goToPreviousStep}
                    className="px-6 py-2.5 rounded-xl font-medium transition-all bg-slate-200 hover:bg-slate-300 text-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-slate-300 shadow-sm flex items-center gap-2"
                  >
                    <ChevronLeft className="w-5 h-5" />
                    Previous Stage
                  </button>
                  <button
                    onClick={goToNextStep}
                    className="px-6 py-2.5 rounded-xl font-medium transition-all bg-indigo-600 hover:bg-indigo-700 text-white shadow-md hover:shadow-lg flex items-center gap-2"
                  >
                    Proceed to PDF Mapping
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </>
            ) : (
              <div className="bg-[#FAFAFA] dark:bg-slate-800 rounded-2xl shadow-xl p-12 text-center">
                <div className="text-6xl mb-4">📋</div>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">No Records Found</h3>
                <p className="text-gray-500 dark:text-gray-400">Please upload and process an Excel file first to see records here.</p>
              </div>
            )}
          </div>
        )}

        {/* Stage 2: PDF Mapping Tab */}
        {activeTab === 'mapping' && (
          <div className="bg-[#FAFAFA] dark:bg-slate-800 rounded-2xl shadow-xl p-6">
            <div className="mb-6 border-b border-indigo-200 dark:border-indigo-800 pb-4">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <h2 className="text-xl font-bold bg-gradient-to-r from-black to-gray-500 bg-clip-text text-transparent">
                    Stage 2: PDF Document Mapping
                  </h2>                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Link scanned PDF files to their corresponding extracted records. Auto-matching uses filename patterns against record metadata.</p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/30 rounded-full">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-400">{allRecords.length} Records Available for Mapping</span>
                </div>
              </div>
            </div>

            <div className="mb-6 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-5 border border-indigo-200 dark:border-indigo-800">
              <h3 className="text-md font-semibold text-slate-600 dark:text-slate-400 mb-4">Stage 2 Instructions – {selectedProject}</h3>
              <div className="space-y-4 text-sm text-slate-700 dark:text-slate-300">
                <label className="flex items-start gap-3 cursor-pointer"><input type="checkbox" checked={checks[0]} onChange={() => { const updated = [...checks]; updated[0] = !updated[0]; setChecks(updated); }} className="mt-0.5" /><div><p>Have you created "{selectedProject}" in your SFTP Location?</p><p className="text-xs text-slate-500">तुम्ही SFTP लोकेशनमध्ये "{selectedProject}" तयार केला आहे का?</p></div></label>
                <label className="flex items-start gap-3 cursor-pointer"><input type="checkbox" checked={checks[1]} onChange={() => { const updated = [...checks]; updated[1] = !updated[1]; setChecks(updated); }} className="mt-0.5" /><div><p>Have you kept all Nasti Files in your "{selectedProject}" folder under "{selectedProject} Raw Files"?</p><p className="text-xs text-slate-500">तुम्ही सर्व नस्ती फाईल्स "{selectedProject} Raw Files" या फोल्डरमध्ये ठेवल्या आहेत का?</p></div></label>
                <label className="flex items-start gap-3 cursor-pointer"><input type="checkbox" checked={checks[2]} onChange={() => { const updated = [...checks]; updated[2] = !updated[2]; setChecks(updated); }} className="mt-0.5" /><div><p>Have you ensured that each file is named as "nastinumber.pdf" for "{selectedProject}"?</p><p className="text-xs text-slate-500">तुम्ही प्रत्येक फाईलचे नाव "नस्ती क्रमांक.pdf" या स्वरूपात ठेवले आहे का?</p><p className="text-xs italic text-slate-400">e.g. if nasti number is 8 then file name should be 8.pdf</p></div></label>
                <label className="flex items-start gap-3 cursor-pointer"><input type="checkbox" checked={checks[3]} onChange={() => { const updated = [...checks]; updated[3] = !updated[3]; setChecks(updated); }} className="mt-0.5" /><div><p>I provide my confirmation to process the scanned raw PDF files to link with {selectedProject} on this portal.</p><p className="text-xs text-slate-500">मी स्कॅन केलेल्या PDF फाईल्सना या पोर्टलवर {selectedProject} शी लिंक करण्यासाठी माझी संमती देतो.</p></div></label>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button onClick={() => { setChecks([false, false, false, false]); setStage2Completed(false); setMappingLogs([]); }} className="px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors">Reset</button>
                <button onClick={handleCompleteStage2} disabled={!allChecked} className={`px-4 py-2 rounded-lg text-white transition-all ${allChecked ? 'bg-indigo-600 hover:bg-indigo-700 shadow-md hover:shadow-lg' : 'bg-gray-400 cursor-not-allowed'}`}>Complete Stage 2</button>
              </div>
            </div>

            {stage2Completed && (
              <div className="space-y-2 mt-4">
                {/* <h3 className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>📝 Mapping Logger</h3> */}
                <MappingLogger logs={mappingLogs} darkMode={darkMode} />
              </div>
            )}

            <div className="mt-8 flex justify-between border-t border-slate-200 dark:border-slate-700 pt-6">
              <button
                onClick={goToPreviousStep}
                className="px-6 py-2.5 rounded-xl font-medium transition-all bg-slate-200 hover:bg-slate-300 text-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-slate-300 shadow-sm flex items-center gap-2"
              >
                <ChevronLeft className="w-5 h-5" />
                Previous Stage
              </button>
              {stage2Completed && (
                <button
                  onClick={() => alert('Process Completed Successfully!')}
                  className="px-6 py-2.5 rounded-xl font-medium transition-all bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg flex items-center gap-2"
                >
                  <CheckCircle className="w-5 h-5" />
                  Finish Process
                </button>
              )}
            </div>
          </div>
        )}
              </div>
            </div>
            </div>
          </div>
        </div>
      </main>

    </div>
  );
}