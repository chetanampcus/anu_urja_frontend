import React from "react";
import { Paperclip } from "lucide-react";

interface PdfViewerProps {
  pdfUrl: string;
  isOpen: boolean;
  onClose: () => void;
  documentName?: string;
  selectedProject?: string;
  rowData?: any;
}

const PdfViewer: React.FC<PdfViewerProps> = ({
  pdfUrl,
  isOpen,
  onClose,
  documentName,
  selectedProject,
  rowData,
}) => {
  if (!isOpen) return null;

  const fileName = documentName || pdfUrl?.split("/").pop() || "Document.pdf";
  const projectName = selectedProject || "-";
  const gatthaKramank = rowData?.bundleNo || "-";
  const nastiKramank = rowData?.fileNo || "-";

  return (
    <div className="fixed inset-0 z-[9999] bg-black/10 backdrop-blur-sm flex flex-col">
      {/* 🔝 TOP TOOLBAR */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 sm:px-6 py-2 sm:py-3 bg-white/80 backdrop-blur-md border-b shadow-sm sticky top-0 z-50">
        {/* Left */}
        <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-slate-700 min-w-0 flex-1">
          <Paperclip className="h-4 w-4 text-green-600 flex-shrink-0" />
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <span className="truncate rounded-md bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-700">
              प्रकल्पाचे नाव - {projectName}
            </span>
            <span className="truncate rounded-md bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-700">
              गट्ठा क्रमांक - {gatthaKramank}
            </span>
            <span className="truncate rounded-md bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-700">
              नस्ती क्रमांक - {nastiKramank}
            </span>
            <span className="truncate rounded-md bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-700">
              फाईल नाव - {fileName}
            </span>
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
          {/* Download */}
          {pdfUrl && (
            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-600 text-xs sm:text-sm hover:underline"
            >
              <span className="hidden sm:inline">Download</span>
              <span className="sm:hidden">⬇</span>
            </a>
          )}

          {/* Close */}
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-red-500 text-base sm:text-lg font-bold"
          >
            ✕
          </button>
        </div>
      </div>

      {/* 📄 PREVIEW AREA */}
      <div className="flex-1 overflow-auto flex justify-center items-start py-3 sm:py-6 px-2">
        {pdfUrl ? (
          <div className="bg-white/95 backdrop-blur-md shadow-2xl rounded-xl w-full max-w-[95%] sm:max-w-5xl border border-green-100 p-2 sm:p-3">
            <iframe
              src={`${pdfUrl}#toolbar=0&view=FitH`}
              className="w-full rounded-md"
              style={{
                height: "calc(100vh - 120px)", // responsive height
                border: "none",
                background: "white",
              }}
              title="PDF Preview"
            />
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-slate-500 text-sm">
            No file selected
          </div>
        )}
      </div>
    </div>
  );
};

export default PdfViewer;
