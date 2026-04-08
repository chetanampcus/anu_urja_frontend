'use client';

import React from 'react';
import { UploadCloud } from 'lucide-react';

interface FileUploadProps {
  files: File[];
  setFiles: React.Dispatch<React.SetStateAction<File[]>>;
}

const FileUpload: React.FC<FileUploadProps> = ({ files, setFiles }) => {
  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files);
    setFiles((prev) => [...prev, ...droppedFiles]);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      setFiles((prev) => [...prev, ...selectedFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-2">
      <label className="block font-semibold text-[#121212] text-[16px]">Attachments</label>
      <div className="relative group">
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleFileDrop}
          onClick={() => document.getElementById('file-upload')?.click()}
          className="w-full rounded-xl border-2 border-dashed border-[#e4e4e4] bg-[#fafafa]/50 transition-all p-8 flex flex-col items-center justify-center gap-3 cursor-pointer"
        >
          <div className="w-10 h-10 rounded-full bg-transparent flex items-center justify-center text-[#09b556] group-hover:scale-110 transition-transform">
            <UploadCloud size={32} strokeWidth={1.5} />
          </div>
          <div className="text-center space-y-0.5">
            <p className="text-[12px] font-semibold text-[#121212]">Drag and drop files here,</p>
            <p className="text-[12px] font-semibold text-[#121212]">
              or <span className="text-[#121212] font-semibold">click to browse</span>
            </p>
            <p className="text-[10px] text-[#636363] pt-1">PDF, DOCX, JPG, PNG, up to 500kb each</p>
          </div>
        </div>
        <input
          id="file-upload"
          type="file"
          multiple
          className="hidden"
          onChange={handleFileSelect}
        />
      </div>

      {files.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-2">
          {files.map((file, index) => (
            <div key={index} className="flex items-center gap-2 bg-[#f0f9ff] border border-[#bae6fd] px-3 py-1 rounded-full text-[12px] text-[#0369a1]">
              <span className="truncate max-w-[150px]">{file.name}</span>
              <button onClick={() => removeFile(index)} className="hover:text-red-500 font-bold">×</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FileUpload;