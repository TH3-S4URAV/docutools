import React from 'react';
import { ShieldCheck, Zap, UserCheck, Layers, FileCheck, Lock } from 'lucide-react';

export const AboutSection: React.FC = () => {
  return (
    <section id="privacy" className="py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto border-t border-slate-200/80 dark:border-slate-800/80">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mb-3">
          Built for Privacy, Speed & Precision
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          DocuTools is built from the ground up to give you high-fidelity document utilities without signup walls, tracking, or file retention.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1 */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs text-left">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
            100% Privacy-Conscious
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Your files are processed in isolated UUID sandboxes and immediately deleted upon download completion. Stale files are automatically purged every 10 minutes.
          </p>
        </div>

        {/* Card 2 */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs text-left">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4">
            <Zap className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
            Native C++ Speed
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Powered by PyMuPDF's ultra-fast native C++ engine and client-side WebAssembly, operations finish in milliseconds without unnecessary cloud round-trips.
          </p>
        </div>

        {/* Card 3 */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs text-left">
          <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4">
            <UserCheck className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
            No Account Friction
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Zero signups, zero credit cards, zero watermarks forced into your documents. Every single tool is ready for instant use by students and professionals.
          </p>
        </div>
      </div>

      {/* Frequently Asked Questions (SEO Optimized) */}
      <div id="faq" className="mt-16 pt-12 border-t border-slate-200/60 dark:border-slate-800/60 text-left">
        <div className="text-center max-w-xl mx-auto mb-10">
          <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-2">
            Frequently Asked Questions
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Everything you need to know about using DocuTools for your documents and PDFs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-800">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1.5">
              How to convert PDF to Image (JPG or PNG)?
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Click on the <strong>PDF to JPG</strong> or <strong>PDF to PNG</strong> tool, choose your PDF document, and instantly download high-definition JPG pictures or transparent PNG photos of all pages.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-800">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1.5">
              Can I convert JPG and PNG images into a PDF?
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Yes! Use the <strong>JPG to PDF</strong> or <strong>PNG to PDF</strong> tool to merge multiple pictures, receipts, or photos into a single, clean PDF file with custom page orientation.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-800">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1.5">
              Is DocuTools really 100% free to use?
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Yes. All 32 document tools including Merge PDF, Compress PDF, PDF to Word, and OCR are completely free without daily limits, hidden subscriptions, or account requirements.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-800">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1.5">
              Are my files safe and private?
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              DocuTools never reads, analyzes, or retains your documents. Processing occurs in isolated memory containers and client-side browser WebAssembly, with automated file deletion.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
