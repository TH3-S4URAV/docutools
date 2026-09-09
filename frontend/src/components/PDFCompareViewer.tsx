import React, { useState } from 'react';
import { GitCompare, FileText, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Dropzone } from './Dropzone';

interface PDFCompareViewerProps {
  files: File[];
  setFiles: React.Dispatch<React.SetStateAction<File[]>>;
  comparisonResult?: {
    doc_a_pages: number;
    doc_b_pages: number;
    additions_count: number;
    deletions_count: number;
    is_identical: boolean;
    diff_text: string;
  };
}

export const PDFCompareViewer: React.FC<PDFCompareViewerProps> = ({
  files,
  setFiles,
  comparisonResult
}) => {
  const [fileA, setFileA] = useState<File[]>(files[0] ? [files[0]] : []);
  const [fileB, setFileB] = useState<File[]>(files[1] ? [files[1]] : []);

  const handleUpdateA = (updater: React.SetStateAction<File[]>) => {
    setFileA((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      setFiles([next[0], fileB[0]].filter(Boolean));
      return next;
    });
  };

  const handleUpdateB = (updater: React.SetStateAction<File[]>) => {
    setFileB((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      setFiles([fileA[0], next[0]].filter(Boolean));
      return next;
    });
  };

  return (
    <div className="space-y-6 text-left">
      {/* Dual Upload Panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-2">
            Document A (Original)
          </div>
          <Dropzone
            accept=".pdf"
            files={fileA}
            setFiles={handleUpdateA}
            label="Upload Document A"
          />
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 mb-2">
            Document B (Modified)
          </div>
          <Dropzone
            accept=".pdf"
            files={fileB}
            setFiles={handleUpdateB}
            label="Upload Document B"
          />
        </div>
      </div>

      {/* Comparison Results Card */}
      {comparisonResult && (
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h4 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <GitCompare className="w-5 h-5 text-indigo-500" />
              Comparison Summary
            </h4>

            {comparisonResult.is_identical ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
                <CheckCircle2 className="w-4 h-4" /> Documents are Identical
              </span>
            ) : (
              <div className="flex items-center gap-2 text-xs font-bold">
                <span className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-600 border border-emerald-200 dark:border-emerald-800">
                  +{comparisonResult.additions_count} Additions
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-950 text-rose-600 border border-rose-200 dark:border-rose-800">
                  -{comparisonResult.deletions_count} Deletions
                </span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs text-slate-600 dark:text-slate-400">
            <div>Document A Pages: <span className="font-bold text-slate-900 dark:text-white">{comparisonResult.doc_a_pages}</span></div>
            <div>Document B Pages: <span className="font-bold text-slate-900 dark:text-white">{comparisonResult.doc_b_pages}</span></div>
          </div>

          {comparisonResult.diff_text && (
            <div>
              <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Text Differences:
              </div>
              <pre className="p-3 rounded-xl bg-slate-900 text-slate-200 text-xs font-mono max-h-60 overflow-y-auto whitespace-pre-wrap leading-relaxed">
                {comparisonResult.diff_text}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
