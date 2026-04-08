// components/RecordsViewer.tsx
'use client';

import { useState } from 'react';
import { Record, ProcessedFile } from '../../.next/types';

interface RecordsViewerProps {
  records: Record[];
  darkMode: boolean;
  onBack?: () => void;
  selectedFileName?: string | null;
  processedFiles: ProcessedFile[];
  onViewFileRecords: (fileName: string) => void;
}

export default function RecordsViewer({ 
  records, 
  darkMode, 
  onBack, 
  selectedFileName,
  processedFiles,
  onViewFileRecords 
}: RecordsViewerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSheet, setSelectedSheet] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 20;

  // Get unique sheet names
  const sheetNames = ['all', ...new Set(records.map(r => r.sheetName))];

  // Filter records
  const filteredRecords = records.filter(record => {
    const matchesSearch = searchTerm === '' || 
      Object.values(record.columns).some(val => 
        val && val.toString().toLowerCase().includes(searchTerm.toLowerCase())
      );
    const matchesSheet = selectedSheet === 'all' || record.sheetName === selectedSheet;
    return matchesSearch && matchesSheet;
  });

  // Pagination
  const totalPages = Math.ceil(filteredRecords.length / recordsPerPage);
  const paginatedRecords = filteredRecords.slice(
    (currentPage - 1) * recordsPerPage,
    currentPage * recordsPerPage
  );

  // Get all unique column headers from all records
  const allColumns = records.length > 0 
    ? [...new Set(records.flatMap(r => Object.keys(r.columns)))]
    : [];

  // Function to render cell value
  const renderCellValue = (value: any) => {
    if (value === null || value === undefined || value === '') {
      return <span className="text-gray-400 dark:text-gray-500 italic">—</span>;
    }
    const strValue = value.toString();
    if (strValue.length > 100) {
      return (
        <span title={strValue} className="cursor-help">
          {strValue.substring(0, 100)}...
        </span>
      );
    }
    return strValue;
  };

  return (
    <div className="space-y-4">
      {/* Header with Back button */}
      <div className="flex justify-between items-center">
        <div>
          {onBack && (
            <button
              onClick={onBack}
              className={`mb-2 text-sm px-3 py-1 rounded-lg transition-colors ${
                darkMode 
                  ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700' 
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              ← Back to all records
            </button>
          )}
          <h2 className={`text-xl font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
            {selectedFileName ? `Records from: ${selectedFileName}` : `All Records (${filteredRecords.length})`}
          </h2>
          {!selectedFileName && processedFiles.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {processedFiles.filter(f => f.status === 'success').map(file => (
                <button
                  key={file.name}
                  onClick={() => onViewFileRecords(file.name)}
                  className={`text-xs px-2 py-1 rounded transition-colors ${
                    darkMode
                      ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                  }`}
                >
                  📄 {file.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <input
            type="text"
            placeholder="🔍 Search records..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className={`w-full px-3 py-2 rounded-lg border transition-colors ${
              darkMode
                ? 'bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-400 focus:border-blue-500'
                : 'bg-[#FAFAFA] border-gray-300 text-gray-800 placeholder-gray-400 focus:border-blue-500'
            } focus:outline-none`}
          />
        </div>
        <select
          value={selectedSheet}
          onChange={(e) => {
            setSelectedSheet(e.target.value);
            setCurrentPage(1);
          }}
          className={`px-3 py-2 rounded-lg border transition-colors ${
            darkMode
              ? 'bg-gray-700 border-gray-600 text-gray-200'
              : 'bg-[#FAFAFA] border-gray-300 text-gray-700'
          } focus:outline-none focus:border-blue-500`}
        >
          {sheetNames.map(sheet => (
            <option key={sheet} value={sheet}>
              {sheet === 'all' ? '📑 All Sheets' : `📄 ${sheet}`}
            </option>
          ))}
        </select>
      </div>

      {/* Records Table */}
      {filteredRecords.length === 0 ? (
        <div className={`text-center py-12 rounded-lg ${darkMode ? 'bg-gray-700/50' : 'bg-gray-100'}`}>
          <div className="text-4xl mb-3">📭</div>
          <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            {records.length === 0 
              ? 'No records found. Process some files first!' 
              : 'No matching records found.'}
          </p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className={darkMode ? 'bg-gray-700' : 'bg-gray-50'}>
                <tr>
                  <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    #
                  </th>
                  <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Sheet
                  </th>
                  <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Row
                  </th>
                  {allColumns.slice(0, 6).map(col => (
                    <th key={col} className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {col.length > 30 ? col.substring(0, 30) + '...' : col}
                    </th>
                  ))}
                  {allColumns.length > 6 && (
                    <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      ...
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className={`divide-y ${darkMode ? 'divide-gray-700 bg-gray-800' : 'divide-gray-200 bg-[#FAFAFA]'}`}>
                {paginatedRecords.map((record, idx) => (
                  <tr key={record.id} className={`hover:${darkMode ? 'bg-gray-700' : 'bg-gray-50'} transition-colors`}>
                    <td className={`px-4 py-2 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {(currentPage - 1) * recordsPerPage + idx + 1}
                    </td>
                    <td className={`px-4 py-2 text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                      {record.sheetName}
                    </td>
                    <td className={`px-4 py-2 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {record.rowNumber}
                    </td>
                    {allColumns.slice(0, 6).map(col => (
                      <td key={col} className={`px-4 py-2 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'} max-w-xs truncate`}>
                        {renderCellValue(record.columns[col])}
                      </td>
                    ))}
                    {allColumns.length > 6 && (
                      <td className={`px-4 py-2 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        +{allColumns.length - 6} more
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center mt-4">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className={`px-3 py-1 rounded transition-colors ${
                  currentPage === 1
                    ? 'opacity-50 cursor-not-allowed'
                    : darkMode
                    ? 'hover:bg-gray-700'
                    : 'hover:bg-gray-100'
                }`}
              >
                ← Previous
              </button>
              <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Page {currentPage} of {totalPages} ({filteredRecords.length} records)
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className={`px-3 py-1 rounded transition-colors ${
                  currentPage === totalPages
                    ? 'opacity-50 cursor-not-allowed'
                    : darkMode
                    ? 'hover:bg-gray-700'
                    : 'hover:bg-gray-100'
                }`}
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}