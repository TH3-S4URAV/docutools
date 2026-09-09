import React, { useState } from 'react';
import { RotateCw, Trash2, ArrowLeft, ArrowRight, FileText } from 'lucide-react';

interface PageItem {
  originalNum: number;
  rotation: number;
}

interface PageOrganizerProps {
  initialPagesCount?: number;
  onSequenceChanged: (pageSequence: string) => void;
}

export const PageOrganizer: React.FC<PageOrganizerProps> = ({
  initialPagesCount = 6,
  onSequenceChanged
}) => {
  const [pages, setPages] = useState<PageItem[]>(() =>
    Array.from({ length: initialPagesCount }, (_, i) => ({
      originalNum: i + 1,
      rotation: 0
    }))
  );

  const notifyChange = (updated: PageItem[]) => {
    setPages(updated);
    const seq = updated.map(p => p.originalNum).join(', ');
    onSequenceChanged(seq);
  };

  const movePage = (index: number, direction: 'left' | 'right') => {
    const targetIdx = direction === 'left' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= pages.length) return;
    const updated = [...pages];
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;
    notifyChange(updated);
  };

  const rotatePage = (index: number) => {
    const updated = [...pages];
    updated[index].rotation = (updated[index].rotation + 90) % 360;
    notifyChange(updated);
  };

  const deletePage = (index: number) => {
    if (pages.length <= 1) return;
    const updated = pages.filter((_, i) => i !== index);
    notifyChange(updated);
  };

  return (
    <div className="space-y-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-left">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-white">Visual Page Organizer</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Drag, reorder, rotate, or delete individual pages below:
          </p>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
          {pages.length} Pages
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {pages.map((page, idx) => (
          <div
            key={`page-${page.originalNum}-${idx}`}
            className="flex flex-col items-center justify-between p-3 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-xs group"
          >
            {/* Visual page preview mockup */}
            <div
              className="w-full aspect-3/4 bg-slate-100 dark:bg-slate-900 rounded-lg flex flex-col items-center justify-center p-3 transition-transform duration-200"
              style={{ transform: `rotate(${page.rotation}deg)` }}
            >
              <FileText className="w-8 h-8 text-slate-400 mb-1" />
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Page {page.originalNum}
              </span>
              <span className="text-[10px] text-slate-400">Position #{idx + 1}</span>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-1.5 mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/80 w-full justify-center">
              <button
                type="button"
                disabled={idx === 0}
                onClick={() => movePage(idx, 'left')}
                className="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 text-slate-500"
                title="Move Left"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => rotatePage(idx)}
                className="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-indigo-600 dark:text-indigo-400"
                title="Rotate 90 deg"
              >
                <RotateCw className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => deletePage(idx)}
                className="p-1 rounded-md hover:bg-rose-50 dark:hover:bg-rose-950 text-rose-500"
                title="Delete Page"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                disabled={idx === pages.length - 1}
                onClick={() => movePage(idx, 'right')}
                className="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 text-slate-500"
                title="Move Right"
              >
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
