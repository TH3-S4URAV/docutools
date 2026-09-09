import React, { useState } from 'react';
import { CheckCircle, Download, Check, Copy } from 'lucide-react';
import { ProcessResult } from '../types';
import { formatFileSize } from '../services/api';

interface ToolSuccessProps {
  result: ProcessResult;
  onReset: () => void;
}

export const ToolSuccess: React.FC<ToolSuccessProps> = ({ result, onReset }) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-8 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50 text-center space-y-6">
      <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-xs">
        <CheckCircle className="w-8 h-8 stroke-[2.2]" />
      </div>

      <div>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
          Processing Complete!
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Your document was processed safely and is ready for download.
        </p>
      </div>

      {/* Stats Comparison */}
      <div className="flex flex-wrap items-center justify-center gap-4 py-2">
        {result.originalSize && (
          <div className="px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs">
            <span className="text-slate-400 block">Original Size</span>
            <span className="font-bold text-slate-800 dark:text-slate-200">
              {formatFileSize(result.originalSize)}
            </span>
          </div>
        )}

        {result.resultSize && (
          <div className="px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs">
            <span className="text-slate-400 block">Output Size</span>
            <span className="font-bold text-slate-800 dark:text-slate-200">
              {formatFileSize(result.resultSize)}
            </span>
          </div>
        )}

        {result.savingsPercent !== undefined && result.savingsPercent > 0 && (
          <div className="px-4 py-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-950 border border-emerald-300 dark:border-emerald-800 text-xs">
            <span className="text-emerald-700 dark:text-emerald-400 block font-semibold">Saved</span>
            <span className="font-black text-emerald-800 dark:text-emerald-300">
              {result.savingsPercent}%
            </span>
          </div>
        )}
      </div>

      {/* Download or Text Result */}
      {result.downloadUrl ? (
        <div className="space-y-3">
          <a
            href={result.downloadUrl}
            download={result.filename}
            className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-lg shadow-indigo-500/25 transition-all hover:scale-102 cursor-pointer"
          >
            <Download className="w-4 h-4" /> Download {result.filename}
          </a>
          <div>
            <button
              onClick={onReset}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 underline cursor-pointer"
            >
              Process another file
            </button>
          </div>
        </div>
      ) : result.data && result.data.text ? (
        <div className="space-y-3 text-left">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Extracted Text ({result.data.char_count} chars):
            </span>
            <button
              onClick={() => copyToClipboard(result.data.text)}
              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied!' : 'Copy Text'}
            </button>
          </div>
          <textarea
            readOnly
            value={result.data.text}
            className="w-full h-48 p-3 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-mono leading-relaxed"
          />
          <div className="text-center">
            <button
              onClick={onReset}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 underline cursor-pointer"
            >
              Process another image
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
};
