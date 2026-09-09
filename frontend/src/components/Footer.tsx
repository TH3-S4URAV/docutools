import React from 'react';
import { Files, Heart, Shield, CheckCircle2 } from 'lucide-react';
import { CATEGORIES } from '../data/tools';
import { ToolCategory } from '../types';

interface FooterProps {
  onSelectCategory: (cat: ToolCategory) => void;
}

export const Footer: React.FC<FooterProps> = ({ onSelectCategory }) => {
  return (
    <footer className="border-t border-slate-200/80 dark:border-slate-800/80 bg-white/50 dark:bg-slate-950/50 pt-12 pb-8 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-10 text-left">
        {/* Brand */}
        <div className="space-y-3 md:col-span-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
              <Files className="w-4 h-4" />
            </div>
            <span className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
              DOCUTOOLS
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            All your document tools in one place. Convert, edit, organize and secure PDFs, Office documents, and images.
          </p>
          <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold pt-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span>All 32 Tools Operational</span>
          </div>
        </div>

        {/* Categories 1 */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-3">
            PDF Tools
          </h4>
          <ul className="space-y-2 text-xs text-slate-500 dark:text-slate-400">
            <li><button onClick={() => onSelectCategory('pdf_organize')} className="hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer">Merge & Split PDF</button></li>
            <li><button onClick={() => onSelectCategory('pdf_organize')} className="hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer">Compress PDF</button></li>
            <li><button onClick={() => onSelectCategory('pdf_organize')} className="hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer">Rotate & Organize PDF</button></li>
            <li><button onClick={() => onSelectCategory('pdf_organize')} className="hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer">Crop & Resize PDF</button></li>
          </ul>
        </div>

        {/* Categories 2 */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-3">
            Conversions
          </h4>
          <ul className="space-y-2 text-xs text-slate-500 dark:text-slate-400">
            <li><button onClick={() => onSelectCategory('convert_from_pdf')} className="hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer">PDF to Word (.docx)</button></li>
            <li><button onClick={() => onSelectCategory('convert_from_pdf')} className="hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer">PDF to Excel (.xlsx)</button></li>
            <li><button onClick={() => onSelectCategory('convert_from_pdf')} className="hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer">PDF to PowerPoint (.pptx)</button></li>
            <li><button onClick={() => onSelectCategory('convert_to_pdf')} className="hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer">Word, PPT & Excel to PDF</button></li>
          </ul>
        </div>

        {/* Security & OCR */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-3">
            Security & OCR
          </h4>
          <ul className="space-y-2 text-xs text-slate-500 dark:text-slate-400">
            <li><button onClick={() => onSelectCategory('pdf_security')} className="hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer">Protect PDF (AES-256)</button></li>
            <li><button onClick={() => onSelectCategory('pdf_security')} className="hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer">Unlock PDF</button></li>
            <li><button onClick={() => onSelectCategory('pdf_annotate')} className="hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer">Sign PDF & Watermark</button></li>
            <li><button onClick={() => onSelectCategory('ocr_extra')} className="hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer">OCR Image to Text</button></li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-6 border-t border-slate-200/60 dark:border-slate-800/60 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-3">
        <div>
          © {new Date().getFullYear()} DOCUTOOLS. All rights reserved. Made for speed & privacy.
        </div>
        <div className="flex items-center gap-4">
          <a href="#privacy" className="hover:underline">Privacy Policy</a>
          <a href="#privacy" className="hover:underline">Terms of Service</a>
          <a href="/api/health" target="_blank" rel="noreferrer" className="hover:underline">System Status</a>
        </div>
      </div>
    </footer>
  );
};
