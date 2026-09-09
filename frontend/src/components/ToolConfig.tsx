import React from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface ToolConfigProps {
  toolId: string;
  splitMode: 'ranges' | 'all_pages';
  setSplitMode: (m: 'ranges' | 'all_pages') => void;
  pageRanges: string;
  setPageRanges: (r: string) => void;
  compressLevel: 'low' | 'medium' | 'high';
  setCompressLevel: (l: 'low' | 'medium' | 'high') => void;
  rotateAngle: number;
  setRotateAngle: (a: number) => void;
  cropMargins: { top: number; bottom: number; left: number; right: number };
  setCropMargins: React.Dispatch<React.SetStateAction<{ top: number; bottom: number; left: number; right: number }>>;
  paperSize: string;
  setPaperSize: (s: string) => void;
  orientation: string;
  setOrientation: (o: string) => void;
  password: string;
  setPassword: (p: string) => void;
  showPassword: boolean;
  setShowPassword: (s: boolean) => void;
  allowPrint: boolean;
  setAllowPrint: (b: boolean) => void;
  allowCopy: boolean;
  setAllowCopy: (b: boolean) => void;
  watermarkText: string;
  setWatermarkText: (t: string) => void;
  watermarkOpacity: number;
  setWatermarkOpacity: (o: number) => void;
  watermarkFontSize: number;
  setWatermarkFontSize: (f: number) => void;
  pageNumPattern: string;
  setPageNumPattern: (p: string) => void;
  pageNumPos: string;
  setPageNumPos: (p: string) => void;
}

export const ToolConfig: React.FC<ToolConfigProps> = ({
  toolId,
  splitMode,
  setSplitMode,
  pageRanges,
  setPageRanges,
  compressLevel,
  setCompressLevel,
  rotateAngle,
  setRotateAngle,
  cropMargins,
  setCropMargins,
  paperSize,
  setPaperSize,
  orientation,
  setOrientation,
  password,
  setPassword,
  showPassword,
  setShowPassword,
  allowPrint,
  setAllowPrint,
  allowCopy,
  setAllowCopy,
  watermarkText,
  setWatermarkText,
  watermarkOpacity,
  setWatermarkOpacity,
  watermarkFontSize,
  setWatermarkFontSize,
  pageNumPattern,
  setPageNumPattern,
  pageNumPos,
  setPageNumPos
}) => {
  return (
    <>
      {toolId === 'split-pdf' && (
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-left space-y-3">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Split Method:</span>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
              <input type="radio" checked={splitMode === 'ranges'} onChange={() => setSplitMode('ranges')} className="text-indigo-600" />
              <span>Custom range (e.g. 1-3, 5)</span>
            </label>
            <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
              <input type="radio" checked={splitMode === 'all_pages'} onChange={() => setSplitMode('all_pages')} className="text-indigo-600" />
              <span>Burst into single pages (ZIP)</span>
            </label>
          </div>
          {splitMode === 'ranges' && (
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">Page Ranges:</label>
              <input
                type="text"
                value={pageRanges}
                onChange={(e) => setPageRanges(e.target.value)}
                placeholder="1-2, 4, 6-8"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
              />
            </div>
          )}
        </div>
      )}

      {toolId === 'compress-pdf' && (
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-left space-y-3">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Compression Level:</span>
          <div className="grid grid-cols-3 gap-2 text-center">
            {(['low', 'medium', 'high'] as const).map((lvl) => (
              <button
                key={lvl}
                type="button"
                onClick={() => setCompressLevel(lvl)}
                className={`p-3 rounded-xl border text-xs font-bold capitalize cursor-pointer ${
                  compressLevel === lvl
                    ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-400'
                }`}
              >
                {lvl === 'medium' ? 'Medium (Recommended)' : lvl}
              </button>
            ))}
          </div>
        </div>
      )}

      {toolId === 'rotate-pdf' && (
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-left space-y-3">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Rotation Angle:</span>
          <div className="flex gap-2">
            {[90, 180, 270].map((deg) => (
              <button
                key={deg}
                type="button"
                onClick={() => setRotateAngle(deg)}
                className={`px-4 py-2 rounded-xl text-xs font-bold cursor-pointer ${
                  rotateAngle === deg
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                {deg}° Clockwise
              </button>
            ))}
          </div>
        </div>
      )}

      {(toolId === 'delete-pdf-pages' || toolId === 'extract-pdf-pages') && (
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-left">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            {toolId === 'delete-pdf-pages' ? 'Pages to Delete:' : 'Pages to Extract:'}
          </label>
          <input
            type="text"
            value={pageRanges}
            onChange={(e) => setPageRanges(e.target.value)}
            placeholder="e.g. 1, 3, 5-8"
            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
          />
        </div>
      )}

      {toolId === 'crop-pdf' && (
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-left space-y-3">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Crop Margins (points):</span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {(['top', 'bottom', 'left', 'right'] as const).map((side) => (
              <div key={side}>
                <label className="block text-[11px] uppercase font-semibold text-slate-400 mb-1">{side}</label>
                <input
                  type="number"
                  min={0}
                  value={cropMargins[side]}
                  onChange={(e) => setCropMargins({ ...cropMargins, [side]: parseFloat(e.target.value) || 0 })}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {toolId === 'resize-pdf' && (
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-left space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Paper Size</label>
              <select
                value={paperSize}
                onChange={(e) => setPaperSize(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
              >
                <option value="A4">A4 (210 x 297 mm)</option>
                <option value="Letter">Letter (8.5 x 11 in)</option>
                <option value="Legal">Legal (8.5 x 14 in)</option>
                <option value="A3">A3 (297 x 420 mm)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Orientation</label>
              <select
                value={orientation}
                onChange={(e) => setOrientation(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
              >
                <option value="portrait">Portrait</option>
                <option value="landscape">Landscape</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {(toolId === 'protect-pdf' || toolId === 'unlock-pdf') && (
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-left space-y-3">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
            {toolId === 'protect-pdf' ? 'Set Document Password:' : 'Enter PDF Password to Decrypt:'}
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password..."
              className="w-full pl-3 pr-10 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {toolId === 'protect-pdf' && (
            <div className="flex gap-4 pt-1">
              <label className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
                <input type="checkbox" checked={allowPrint} onChange={(e) => setAllowPrint(e.target.checked)} className="rounded text-indigo-600" />
                <span>Allow Printing</span>
              </label>
              <label className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
                <input type="checkbox" checked={allowCopy} onChange={(e) => setAllowCopy(e.target.checked)} className="rounded text-indigo-600" />
                <span>Allow Text Copying</span>
              </label>
            </div>
          )}
        </div>
      )}

      {(toolId === 'add-watermark' || toolId === 'edit-pdf') && (
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-left space-y-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Watermark Text</label>
            <input
              type="text"
              value={watermarkText}
              onChange={(e) => setWatermarkText(e.target.value)}
              placeholder="e.g. CONFIDENTIAL, DRAFT"
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">Opacity: {Math.round(watermarkOpacity * 100)}%</label>
              <input
                type="range"
                min="0.1"
                max="1"
                step="0.05"
                value={watermarkOpacity}
                onChange={(e) => setWatermarkOpacity(parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">Font Size: {watermarkFontSize}pt</label>
              <input
                type="range"
                min="16"
                max="72"
                value={watermarkFontSize}
                onChange={(e) => setWatermarkFontSize(parseInt(e.target.value))}
                className="w-full"
              />
            </div>
          </div>
        </div>
      )}

      {toolId === 'add-page-numbers' && (
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-left space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Format</label>
              <select
                value={pageNumPattern}
                onChange={(e) => setPageNumPattern(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
              >
                <option value="Page {n} of {total}">Page 1 of 10</option>
                <option value="{n} / {total}">1 / 10</option>
                <option value="{n}">1</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Position</label>
              <select
                value={pageNumPos}
                onChange={(e) => setPageNumPos(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
              >
                <option value="bottom-center">Bottom Center</option>
                <option value="bottom-right">Bottom Right</option>
                <option value="bottom-left">Bottom Left</option>
                <option value="top-center">Top Center</option>
                <option value="top-right">Top Right</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
