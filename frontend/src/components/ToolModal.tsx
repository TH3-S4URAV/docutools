import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import * as Icons from 'lucide-react';
import { ArrowLeft, RefreshCw, AlertCircle } from 'lucide-react';
import { ToolItem, ProcessResult } from '../types';
import { Dropzone } from './Dropzone';
import { SignaturePad } from './SignaturePad';
import { DocumentScanner } from './DocumentScanner';
import { PageOrganizer } from './PageOrganizer';
import { PDFCompareViewer } from './PDFCompareViewer';
import { ToolSuccess } from './ToolSuccess';
import { ToolConfig } from './ToolConfig';
import { processToolRequest } from '../services/api';

interface ToolModalProps {
  tool: ToolItem;
  onClose: () => void;
}

export const ToolModal: React.FC<ToolModalProps> = ({ tool, onClose }) => {
  const [files, setFiles] = useState<File[]>([]);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ProcessResult | null>(null);

  // Tool Config States
  const [splitMode, setSplitMode] = useState<'ranges' | 'all_pages'>('ranges');
  const [pageRanges, setPageRanges] = useState('1');
  const [compressLevel, setCompressLevel] = useState<'low' | 'medium' | 'high'>('medium');
  const [rotateAngle, setRotateAngle] = useState<number>(90);
  const [cropMargins, setCropMargins] = useState({ top: 30, bottom: 30, left: 30, right: 30 });
  const [paperSize, setPaperSize] = useState('A4');
  const [orientation, setOrientation] = useState('portrait');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [allowPrint, setAllowPrint] = useState(true);
  const [allowCopy, setAllowCopy] = useState(true);
  const [watermarkText, setWatermarkText] = useState('CONFIDENTIAL');
  const [watermarkOpacity, setWatermarkOpacity] = useState(0.3);
  const [watermarkFontSize, setWatermarkFontSize] = useState(44);
  const [pageNumPattern, setPageNumPattern] = useState('Page {n} of {total}');
  const [pageNumPos, setPageNumPos] = useState('bottom-center');
  const [htmlCode, setHtmlCode] = useState('');

  // Signature states
  const [signatureBlob, setSignatureBlob] = useState<Blob | null>(null);
  const [sigPage, setSigPage] = useState(1);
  const [sigX, setSigX] = useState(100);
  const [sigY, setSigY] = useState(100);

  // Compare state
  const [comparisonData, setComparisonData] = useState<any>(null);

  const IconComponent = (Icons as any)[tool.iconName] || Icons.FileText;

  const handleProcess = async () => {
    setError(null);

    if (tool.id === 'html-to-pdf') {
      if (files.length === 0 && !htmlCode.trim()) {
        setError('Please upload an HTML file or enter HTML/CSS code.');
        return;
      }
    } else if (tool.id === 'compare-pdf') {
      if (files.length < 2) {
        setError('Please upload both Document A and Document B to compare.');
        return;
      }
    } else if (tool.id === 'merge-pdf') {
      if (files.length < 2) {
        setError('Please select at least 2 PDF documents to merge.');
        return;
      }
    } else if (files.length === 0) {
      setError('Please select or upload a document to proceed.');
      return;
    }

    setProcessing(true);

    try {
      const formData = new FormData();

      if (tool.multiple || tool.id === 'merge-pdf' || tool.id === 'jpg-to-pdf' || tool.id === 'png-to-pdf') {
        files.forEach((f) => formData.append('files', f));
      } else if (tool.id === 'compare-pdf') {
        formData.append('file_a', files[0]);
        formData.append('file_b', files[1]);
      } else if (files[0]) {
        formData.append('file', files[0]);
      }

      if (tool.id === 'split-pdf') {
        formData.append('mode', splitMode);
        formData.append('ranges', pageRanges);
      } else if (tool.id === 'compress-pdf') {
        formData.append('level', compressLevel);
      } else if (tool.id === 'rotate-pdf') {
        formData.append('angle', rotateAngle.toString());
        formData.append('pages', 'all');
      } else if (tool.id === 'delete-pdf-pages' || tool.id === 'extract-pdf-pages' || tool.id === 'organize-pdf') {
        formData.append('pages', pageRanges);
      } else if (tool.id === 'crop-pdf') {
        formData.append('top', cropMargins.top.toString());
        formData.append('bottom', cropMargins.bottom.toString());
        formData.append('left', cropMargins.left.toString());
        formData.append('right', cropMargins.right.toString());
      } else if (tool.id === 'resize-pdf') {
        formData.append('paper_size', paperSize);
        formData.append('orientation', orientation);
      } else if (tool.id === 'protect-pdf') {
        formData.append('password', password);
        formData.append('allow_print', allowPrint.toString());
        formData.append('allow_copy', allowCopy.toString());
      } else if (tool.id === 'unlock-pdf') {
        formData.append('password', password);
      } else if (tool.id === 'add-watermark' || tool.id === 'edit-pdf') {
        formData.append('text', watermarkText);
        formData.append('opacity', watermarkOpacity.toString());
        formData.append('font_size', watermarkFontSize.toString());
        formData.append('angle', '45');
        formData.append('position', 'center');
      } else if (tool.id === 'add-page-numbers') {
        formData.append('format_pattern', pageNumPattern);
        formData.append('position', pageNumPos);
        formData.append('start_num', '1');
      } else if (tool.id === 'sign-pdf') {
        if (!signatureBlob) throw new Error('Please sign or upload signature before proceeding.');
        formData.append('signature', signatureBlob, 'signature.png');
        formData.append('page_num', sigPage.toString());
        formData.append('x', sigX.toString());
        formData.append('y', sigY.toString());
      } else if (tool.id === 'html-to-pdf' && htmlCode.trim()) {
        formData.append('html_content', htmlCode);
      }

      const res = await processToolRequest(tool.endpoint, formData);

      if (tool.id === 'compare-pdf') {
        setComparisonData(res.data);
      }
      setResult(res);

      try {
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
      } catch {}
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setProcessing(false);
    }
  };

  const resetAll = () => {
    setFiles([]);
    setResult(null);
    setError(null);
    setComparisonData(null);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6">
      <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8 transition-all">
        {/* Modal Top Bar */}
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white px-2.5 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>All Tools</span>
          </button>

          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-xl ${tool.badgeBg} ${tool.badgeColor} flex items-center justify-center`}>
              <IconComponent className="w-4 h-4" />
            </div>
            <span className="text-sm font-bold text-slate-900 dark:text-white">{tool.title}</span>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 space-y-6">
          <div className="text-center max-w-lg mx-auto">
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-2">{tool.title}</h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{tool.description}</p>
          </div>

          {result && !comparisonData ? (
            <ToolSuccess result={result} onReset={resetAll} />
          ) : (
            <div className="space-y-6">
              {tool.id === 'compare-pdf' ? (
                <PDFCompareViewer files={files} setFiles={setFiles} comparisonResult={comparisonData} />
              ) : tool.id === 'scan-to-pdf' ? (
                <DocumentScanner onPagesCaptured={(captured) => setFiles(captured)} />
              ) : tool.id === 'html-to-pdf' ? (
                <div className="space-y-4 text-left">
                  <Dropzone accept={tool.accept} files={files} setFiles={setFiles} label="Drop an HTML file here, or enter code below" />
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Or paste raw HTML & CSS code:</label>
                    <textarea
                      rows={5}
                      placeholder="<!DOCTYPE html><html><body><h1>DocuTools Report</h1></body></html>"
                      value={htmlCode}
                      onChange={(e) => setHtmlCode(e.target.value)}
                      className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-mono"
                    />
                  </div>
                </div>
              ) : (
                <Dropzone accept={tool.accept} multiple={tool.multiple} files={files} setFiles={setFiles} />
              )}

              {tool.id === 'organize-pdf' && <PageOrganizer onSequenceChanged={(seq) => setPageRanges(seq)} />}

              {tool.id === 'sign-pdf' && (
                <SignaturePad
                  onSignatureReady={(b) => setSignatureBlob(b)}
                  pageNum={sigPage}
                  setPageNum={setSigPage}
                  posX={sigX}
                  setPosX={setSigX}
                  posY={sigY}
                  setPosY={setSigY}
                />
              )}

              <ToolConfig
                toolId={tool.id}
                splitMode={splitMode}
                setSplitMode={setSplitMode}
                pageRanges={pageRanges}
                setPageRanges={setPageRanges}
                compressLevel={compressLevel}
                setCompressLevel={setCompressLevel}
                rotateAngle={rotateAngle}
                setRotateAngle={setRotateAngle}
                cropMargins={cropMargins}
                setCropMargins={setCropMargins}
                paperSize={paperSize}
                setPaperSize={setPaperSize}
                orientation={orientation}
                setOrientation={setOrientation}
                password={password}
                setPassword={setPassword}
                showPassword={showPassword}
                setShowPassword={setShowPassword}
                allowPrint={allowPrint}
                setAllowPrint={setAllowPrint}
                allowCopy={allowCopy}
                setAllowCopy={setAllowCopy}
                watermarkText={watermarkText}
                setWatermarkText={setWatermarkText}
                watermarkOpacity={watermarkOpacity}
                setWatermarkOpacity={setWatermarkOpacity}
                watermarkFontSize={watermarkFontSize}
                setWatermarkFontSize={setWatermarkFontSize}
                pageNumPattern={pageNumPattern}
                setPageNumPattern={setPageNumPattern}
                pageNumPos={pageNumPos}
                setPageNumPos={setPageNumPos}
              />

              {error && (
                <div className="flex items-center gap-2.5 p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs text-left">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <button
                  type="button"
                  disabled={processing}
                  onClick={handleProcess}
                  className="w-full py-4 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:scale-98 disabled:opacity-50 text-white font-bold text-sm sm:text-base shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  {processing ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      <span>Processing document with native engine...</span>
                    </>
                  ) : (
                    <>
                      <IconComponent className="w-5 h-5" />
                      <span>Execute {tool.title}</span>
                    </>
                  )}
                </button>
                <div className="mt-2 text-[11px] text-slate-400 text-center">
                  🔒 Files are processed in isolated sandboxes and automatically deleted.
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
