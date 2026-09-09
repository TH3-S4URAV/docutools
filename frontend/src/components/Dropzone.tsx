import React, { useRef, useState } from 'react';
import { UploadCloud, File, X, AlertCircle, Plus } from 'lucide-react';
import { formatFileSize } from '../services/api';

interface DropzoneProps {
  accept: string;
  multiple?: boolean;
  files: File[];
  setFiles: React.Dispatch<React.SetStateAction<File[]>>;
  label?: string;
  maxFiles?: number;
}

export const Dropzone: React.FC<DropzoneProps> = ({
  accept,
  multiple = false,
  files,
  setFiles,
  label,
  maxFiles = 20
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (incomingList: FileList | null) => {
    if (!incomingList || incomingList.length === 0) return;
    setErrorMsg(null);

    const validNewFiles: File[] = [];
    for (let i = 0; i < incomingList.length; i++) {
      const file = incomingList[i];
      // Size check (max 50MB)
      if (file.size > 50 * 1024 * 1024) {
        setErrorMsg(`"${file.name}" exceeds the 50MB maximum size limit.`);
        continue;
      }
      validNewFiles.push(file);
    }

    if (multiple) {
      setFiles(prev => {
        const combined = [...prev, ...validNewFiles];
        return combined.slice(0, maxFiles);
      });
    } else {
      if (validNewFiles.length > 0) {
        setFiles([validNewFiles[0]]);
      }
    }
  };

  const removeFile = (idx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setFiles(prev => prev.filter((_, i) => i !== idx));
  };

  return (
    <div className="w-full">
      {/* Drop area */}
      <div
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragOver(false);
          handleFiles(e.dataTransfer.files);
        }}
        className={`relative border-2 border-dashed rounded-2xl p-8 sm:p-10 text-center transition-all cursor-pointer ${
          isDragOver
            ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30 scale-[1.01]'
            : 'border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 hover:bg-slate-100/60 dark:hover:bg-slate-800/40'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
        />

        <div className="flex flex-col items-center justify-center">
          <div className="w-14 h-14 rounded-2xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4 shadow-xs">
            <UploadCloud className="w-7 h-7 stroke-[2]" />
          </div>

          <h4 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mb-1">
            {label || (multiple ? 'Drop files here, or browse' : 'Drop your document here, or browse')}
          </h4>

          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mb-4">
            Supported formats: <span className="font-semibold text-slate-700 dark:text-slate-300">{accept}</span> up to 50MB.
          </p>

          <button
            type="button"
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold shadow-md shadow-indigo-500/20 transition-transform active:scale-95"
          >
            Select {multiple ? 'Files' : 'File'}
          </button>
        </div>
      </div>

      {/* Error message */}
      {errorMsg && (
        <div className="mt-3 flex items-center gap-2 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* File List */}
      {files.length > 0 && (
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 px-1">
            <span>Selected {files.length} file{files.length > 1 ? 's' : ''}</span>
            {multiple && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add more
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
            {files.map((file, idx) => (
              <div
                key={`${file.name}-${idx}`}
                className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center shrink-0">
                    <File className="w-4 h-4" />
                  </div>
                  <div className="truncate text-left">
                    <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                      {file.name}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {formatFileSize(file.size)}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={(e) => removeFile(idx, e)}
                  className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-rose-500 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
