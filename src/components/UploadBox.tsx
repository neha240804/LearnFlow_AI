import React, { useCallback, useRef } from "react";
import { useDropzone } from "react-dropzone";
import { UploadCloud, FileText, Image as ImageIcon, CheckCircle2, X, Sparkles, FileCheck, AlertCircle } from "lucide-react";

interface UploadBoxProps {
  selectedFile: File | null;
  setSelectedFile: (file: File | null) => void;
  onAnalyze?: () => void;
  loading?: boolean;
}

export default function UploadBox({
  selectedFile,
  setSelectedFile,
  onAnalyze,
  loading = false,
}: UploadBoxProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        setSelectedFile(acceptedFiles[0]);
      }
    },
    [setSelectedFile]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    multiple: false,
    accept: {
      "application/pdf": [".pdf"],
      "image/*": [".png", ".jpg", ".jpeg", ".webp", ".gif", ".bmp"],
    },
    onDrop,
  } as any);

  const handleManualFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  return (
    <div className="glass-card rounded-2xl shadow-lg p-6 h-full flex flex-col justify-between border border-slate-200/80 hover:shadow-xl transition-all duration-300">
      <div>
        {/* Header Title */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-100 text-purple-600">
              <UploadCloud size={20} />
            </div>
            <h2 className="text-lg font-bold text-slate-900">Upload Notes</h2>
          </div>
          <span className="text-xs font-bold text-purple-600 bg-purple-50 border border-purple-100 rounded-full px-3 py-1">
            PDF & Images
          </span>
        </div>

        <p className="text-sm text-slate-500 mb-4 leading-relaxed">
          Upload any study note or PDF document to generate a simple explanation & MCQ practice test.
        </p>

        {/* Format Guidance Grid */}
        <div className="grid grid-cols-2 gap-2 mb-4 text-xs font-medium">
          <div className="flex items-center gap-1.5 bg-emerald-50/80 border border-emerald-200/60 rounded-xl px-2.5 py-1.5 text-emerald-800">
            <FileCheck size={14} className="text-emerald-600 shrink-0" />
            <span>Digital PDF</span>
          </div>
          <div className="flex items-center gap-1.5 bg-emerald-50/80 border border-emerald-200/60 rounded-xl px-2.5 py-1.5 text-emerald-800">
            <ImageIcon size={14} className="text-emerald-600 shrink-0" />
            <span>Clear photo / PNG</span>
          </div>
          <div className="flex items-center gap-1.5 bg-amber-50/80 border border-amber-200/60 rounded-xl px-2.5 py-1.5 text-amber-800">
            <AlertCircle size={14} className="text-amber-500 shrink-0" />
            <span>Scanned PDF</span>
          </div>
          <div className="flex items-center gap-1.5 bg-slate-100/80 border border-slate-200/60 rounded-xl px-2.5 py-1.5 text-slate-600">
            <span>Multi-page OK</span>
          </div>
        </div>

        {/* Dropzone Container */}
        <div
          {...getRootProps()}
          onClick={() => fileInputRef.current?.click()}
          className={`relative group border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-300 ${
            isDragActive
              ? "border-indigo-600 bg-indigo-50/80 scale-[1.01]"
              : "border-slate-300 hover:border-indigo-500 hover:bg-slate-50/70"
          }`}
        >
          <input
            {...getInputProps()}
            ref={fileInputRef}
            onChange={handleManualFile}
            accept=".pdf,.png,.jpg,.jpeg,.webp"
          />
          <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300 shadow-sm">
            <UploadCloud size={24} />
          </div>
          <p className="font-bold text-sm text-slate-800">
            {isDragActive ? "Drop document here..." : "Drag & drop study notes"}
          </p>
          <p className="text-xs text-slate-400 mt-1">or click to browse files (PDF, PNG, JPG)</p>
        </div>
      </div>

      {/* File Preview & Direct Action */}
      {selectedFile && (
        <div className="mt-4 space-y-3 pt-3 border-t border-slate-100">
          <div className="rounded-xl bg-indigo-50/80 border border-indigo-200/80 p-3 flex items-center gap-3 shadow-xs">
            {selectedFile.type.includes("pdf") || selectedFile.name.endsWith(".pdf") ? (
              <div className="p-2 rounded-lg bg-rose-100 text-rose-600 shrink-0">
                <FileText size={18} />
              </div>
            ) : (
              <div className="p-2 rounded-lg bg-sky-100 text-sky-600 shrink-0">
                <ImageIcon size={18} />
              </div>
            )}

            <div className="flex-1 min-w-0">
              <p className="font-semibold text-xs text-slate-900 truncate">
                {selectedFile.name}
              </p>
              <p className="text-[11px] text-slate-500">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>

            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="text-emerald-600" size={18} />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedFile(null);
                }}
                className="text-slate-400 hover:text-rose-600 p-1 transition-colors"
                title="Remove file"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {onAnalyze && (
            <button
              type="button"
              onClick={onAnalyze}
              disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 text-white font-bold text-xs rounded-xl shadow-md hover:shadow-indigo-500/25 transition-all duration-200 flex items-center justify-center gap-2"
            >
              <Sparkles size={15} className="animate-spin text-amber-300" />
              <span>{loading ? "Analyzing Document..." : "✨ Generate Explanation & Quiz"}</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
