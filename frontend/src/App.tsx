import React, { useState, useEffect, useRef, useMemo } from 'react';
import confetti from 'canvas-confetti';
import {
  Files, Moon, Sun, Search, ShieldCheck, Sparkles, Zap, Lock, Unlock,
  Combine, Split, Minimize2, Edit3, RotateCw, LayoutGrid, Trash2,
  FileCheck2, Crop, Scaling, GitCompare, Stamp, PenTool, Hash,
  FileText, Presentation, FileSpreadsheet, Image as ImageIcon,
  FileCode, Code, Camera, ScanText, FileSearch, Images, Upload,
  X, Check, AlertCircle, ArrowRight, RefreshCw, Download, FileUp,
  UserCheck, Shield, Heart, CornerUpLeft, Plus, CheckCircle, SearchX
} from 'lucide-react';

import {
  ToolItem, ToolCategory, ProcessResult, TOOLS,
  processToolRequest, formatFileSize
} from './tools';

// -------------------------------------------------------------
// ICON RESOLVER HELPER
// -------------------------------------------------------------
const ICON_MAP: Record<string, React.ElementType> = {
  Combine, Split, Minimize2, Edit3, RotateCw, LayoutGrid, Trash2,
  FileCheck2, Crop, Scaling, GitCompare, Lock, Unlock, Stamp,
  PenTool, Hash, FileText, Presentation, FileSpreadsheet,
  Image: ImageIcon, FileCode, Code, Camera, ScanText, FileSearch, Images
};

function renderToolIcon(name: string, className = "w-6 h-6") {
  const IconComponent = ICON_MAP[name] || FileText;
  return <IconComponent className={className} />;
}

// -------------------------------------------------------------
// UI COMPONENT: HEADER
// -------------------------------------------------------------
interface HeaderProps {
  darkMode: boolean;
  setDarkMode: React.Dispatch<React.SetStateAction<boolean>>;
  onSearchClick: () => void;
  onResetCategory: () => void;
}

const Header: React.FC<HeaderProps> = ({ darkMode, setDarkMode, onSearchClick, onResetCategory }) => (
  <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/85 dark:bg-slate-950/85 border-b border-slate-200/80 dark:border-slate-800/80 transition-colors">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
      <button onClick={onResetCategory} className="flex items-center gap-2.5 group cursor-pointer focus:outline-none">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-rose-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
          <Files className="w-5 h-5" />
        </div>
        <div className="flex flex-col text-left">
          <span className="text-xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
            DOCUTOOLS
            <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400">
              PRO
            </span>
          </span>
          <span className="text-[11px] text-slate-400 -mt-1 hidden sm:inline">
            All your document tools in one place
          </span>
        </div>
      </button>

      <div className="flex-1 max-w-md hidden md:block">
        <button
          onClick={onSearchClick}
          className="w-full flex items-center justify-between px-3.5 py-2 text-sm text-slate-400 bg-slate-100/80 dark:bg-slate-900/80 hover:bg-slate-200/70 dark:hover:bg-slate-800/80 rounded-xl border border-slate-200/60 dark:border-slate-800/60 transition-colors text-left cursor-pointer"
        >
          <span className="flex items-center gap-2">
            <Search className="w-4 h-4 text-slate-400" />
            <span>Search any document tool...</span>
          </span>
          <kbd className="hidden lg:inline-flex items-center gap-0.5 px-2 py-0.5 text-[11px] font-medium text-slate-400 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md shadow-xs">
            Ctrl K
          </kbd>
        </button>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <a href="#privacy" className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Privacy</span>
        </a>
        <a href="/api/health" target="_blank" rel="noreferrer" className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors">
          <Sparkles className="w-4 h-4 text-indigo-500" />
          <span>API Docs</span>
        </a>
        <button
          onClick={() => setDarkMode(prev => !prev)}
          aria-label="Toggle dark mode"
          className="p-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-800/60 transition-colors cursor-pointer"
        >
          {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
        </button>
        <a
          href="https://github.com/TH3-S4URAV/docutools"
          target="_blank"
          rel="noreferrer"
          aria-label="GitHub Repository"
          className="p-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-800/60 transition-colors cursor-pointer"
        >
          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
            <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
          </svg>
        </a>
      </div>
    </div>
  </header>
);

// -------------------------------------------------------------
// UI COMPONENT: HERO
// -------------------------------------------------------------
interface HeroProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  searchInputRef: React.RefObject<HTMLInputElement | null>;
}

const Hero: React.FC<HeroProps> = ({ searchQuery, setSearchQuery, searchInputRef }) => (
  <section className="relative pt-12 pb-8 px-4 sm:px-6 lg:px-8 text-center max-w-5xl mx-auto">
    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/60 dark:border-indigo-800/60 text-indigo-600 dark:text-indigo-400 text-xs font-semibold mb-6">
      <Zap className="w-3.5 h-3.5 fill-current" />
      <span>32 Genuine Document Utilities • 100% Free & Private</span>
    </div>

    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.15] mb-4">
      All your document tools{' '}
      <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-rose-600 bg-clip-text text-transparent">
        in one place.
      </span>
    </h1>

    <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
      Make document work simple. Convert, edit, organize, compress, protect, and OCR your files with fast native engines and complete privacy.
    </p>

    <div className="max-w-xl mx-auto relative mb-6">
      <div className="relative flex items-center">
        <Search className="absolute left-4 w-5 h-5 text-slate-400 pointer-events-none" />
        <input
          ref={searchInputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search tools: merge, compress, word, jpg, watermark, ocr..."
          className="w-full pl-12 pr-10 py-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 shadow-md shadow-slate-900/5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm transition-all"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3.5 p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  </section>
);

// -------------------------------------------------------------
// UI COMPONENT: TOOL CARD
// -------------------------------------------------------------
interface ToolCardProps {
  tool: ToolItem;
  onSelect: (tool: ToolItem) => void;
}

const ToolCard: React.FC<ToolCardProps> = ({ tool, onSelect }) => (
  <button
    onClick={() => onSelect(tool)}
    className="group relative flex flex-col items-start p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs hover:shadow-xl hover:-translate-y-1.5 transition-all duration-200 text-left cursor-pointer w-full"
  >
    {tool.popular && (
      <span className="absolute top-4 right-4 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800/50">
        Popular
      </span>
    )}

    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 duration-200 ${tool.badgeBg} ${tool.badgeColor}`}>
      {renderToolIcon(tool.iconName, "w-6 h-6")}
    </div>

    <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1.5 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
      {tool.title}
    </h3>

    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4 line-clamp-2">
      {tool.description}
    </p>

    <div className="mt-auto flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 group-hover:gap-2.5 transition-all">
      <span>Open Tool</span>
      <ArrowRight className="w-3.5 h-3.5" />
    </div>
  </button>
);

// -------------------------------------------------------------
// UI COMPONENT: DROPZONE
// -------------------------------------------------------------
interface DropzoneProps {
  accept: string;
  multiple?: boolean;
  files: File[];
  onFilesSelected: (files: File[]) => void;
  onRemoveFile: (index: number) => void;
}

const Dropzone: React.FC<DropzoneProps> = ({ accept, multiple, files, onFilesSelected, onRemoveFile }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const dropped = Array.from(e.dataTransfer.files);
      onFilesSelected(multiple ? [...files, ...dropped] : [dropped[0]]);
    }
  };

  return (
    <div className="w-full">
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-8 sm:p-10 text-center cursor-pointer transition-all duration-200 ${
          isDragOver
            ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/20 scale-[0.99]'
            : 'border-slate-300 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-600 bg-slate-50/60 dark:bg-slate-900/60'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={(e) => {
            if (e.target.files) {
              const selected = Array.from(e.target.files);
              onFilesSelected(multiple ? [...files, ...selected] : [selected[0]]);
            }
          }}
          className="hidden"
        />

        <div className="w-14 h-14 rounded-2xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-4">
          <FileUp className="w-7 h-7" />
        </div>

        <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white mb-1">
          {multiple ? 'Choose files or drag & drop here' : 'Choose a file or drag & drop here'}
        </h4>

        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-3">
          Supports: <span className="font-mono font-medium">{accept}</span> up to 50MB
        </p>

        <button
          type="button"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs"
        >
          <Upload className="w-3.5 h-3.5" />
          <span>Browse Device</span>
        </button>
      </div>

      {files.length > 0 && (
        <div className="mt-4 space-y-2">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Selected Files ({files.length})
          </div>
          <div className="max-h-44 overflow-y-auto space-y-2 pr-1">
            {files.map((file, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs"
              >
                <div className="flex items-center gap-2 truncate">
                  <span className="w-5 h-5 rounded-md bg-indigo-100 dark:bg-indigo-950 text-indigo-600 flex items-center justify-center font-bold text-[10px]">
                    {idx + 1}
                  </span>
                  <span className="font-medium text-slate-800 dark:text-slate-200 truncate">{file.name}</span>
                  <span className="text-slate-400 text-[10px] whitespace-nowrap">({formatFileSize(file.size)})</span>
                </div>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); onRemoveFile(idx); }}
                  className="p-1 text-slate-400 hover:text-red-500 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// -------------------------------------------------------------
// UI COMPONENT: SUCCESS SCREEN
// -------------------------------------------------------------
interface ToolSuccessProps {
  tool: ToolItem;
  result: ProcessResult;
  onReset: () => void;
  onClose: () => void;
}

const ToolSuccess: React.FC<ToolSuccessProps> = ({ tool, result, onReset, onClose }) => {
  useEffect(() => {
    confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
  }, []);

  return (
    <div className="text-center py-6 px-4">
      <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-4 animate-bounce">
        <CheckCircle className="w-8 h-8" />
      </div>

      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
        {result.message || 'Operation Completed Successfully!'}
      </h3>

      <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 max-w-sm mx-auto">
        Your document was processed with 100% privacy and is ready for download.
      </p>

      {result.savingsPercent !== undefined && result.savingsPercent > 0 && (
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-semibold mb-6">
          <span>Reduced by {result.savingsPercent}%</span>
          {result.originalSize && result.resultSize && (
            <span className="text-[11px] opacity-80">
              ({formatFileSize(result.originalSize)} ➔ {formatFileSize(result.resultSize)})
            </span>
          )}
        </div>
      )}

      {result.data && (
        <div className="mb-6 p-4 rounded-xl bg-slate-50 dark:bg-slate-900 text-left text-xs font-mono max-h-48 overflow-y-auto border border-slate-200 dark:border-slate-800">
          <pre>{JSON.stringify(result.data, null, 2)}</pre>
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        {result.downloadUrl && (
          <a
            href={result.downloadUrl}
            download={result.filename}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold shadow-md shadow-indigo-600/20"
          >
            <Download className="w-4 h-4" />
            <span>Download {result.filename}</span>
          </a>
        )}
        <button
          onClick={onReset}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-sm font-semibold"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Process Another File</span>
        </button>
      </div>
    </div>
  );
};

// -------------------------------------------------------------
// UI COMPONENT: SIGNATURE PAD
// -------------------------------------------------------------
interface SignaturePadProps {
  onSignatureReady: (blob: Blob) => void;
}

const SignaturePad: React.FC<SignaturePadProps> = ({ onSignatureReady }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasContent, setHasContent] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      }
    }
  }, []);

  const startDraw = (e: any) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    setIsDrawing(true);
    setHasContent(true);
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || (e.touches && e.touches[0].clientX)) - rect.left;
    const y = (e.clientY || (e.touches && e.touches[0].clientY)) - rect.top;
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: any) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || (e.touches && e.touches[0].clientX)) - rect.left;
    const y = (e.clientY || (e.touches && e.touches[0].clientY)) - rect.top;
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      setHasContent(false);
    }
  };

  const confirmSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.toBlob((blob) => {
      if (blob) onSignatureReady(blob);
    }, 'image/png');
  };

  return (
    <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Draw Signature on Screen</span>
        <button onClick={clearCanvas} className="text-xs text-rose-500 hover:underline flex items-center gap-1 cursor-pointer">
          <CornerUpLeft className="w-3 h-3" /> Clear
        </button>
      </div>
      <canvas
        ref={canvasRef}
        width={380}
        height={140}
        onMouseDown={startDraw}
        onMouseMove={draw}
        onMouseUp={() => setIsDrawing(false)}
        onTouchStart={startDraw}
        onTouchMove={draw}
        onTouchEnd={() => setIsDrawing(false)}
        className="w-full bg-slate-50 dark:bg-slate-950 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 cursor-crosshair touch-none"
      />
      {hasContent && (
        <button
          onClick={confirmSignature}
          className="mt-3 w-full py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold cursor-pointer"
        >
          Confirm Drawn Signature
        </button>
      )}
    </div>
  );
};

// -------------------------------------------------------------
// UI COMPONENT: DOCUMENT SCANNER (WEBRTC)
// -------------------------------------------------------------
interface DocumentScannerProps {
  onCapture: (file: File) => void;
}

const DocumentScanner: React.FC<DocumentScannerProps> = ({ onCapture }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [streamActive, setStreamActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startCamera = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setStreamActive(true);
      }
    } catch (err: any) {
      setError('Camera access denied or unavailable on this device.');
    }
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0);
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], `scanned_page_${Date.now()}.jpg`, { type: 'image/jpeg' });
          onCapture(file);
          // Stop stream
          const stream = video.srcObject as MediaStream;
          stream?.getTracks().forEach(t => t.stop());
          setStreamActive(false);
        }
      }, 'image/jpeg', 0.92);
    }
  };

  return (
    <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
      {!streamActive ? (
        <div>
          <Camera className="w-10 h-10 text-indigo-500 mx-auto mb-2" />
          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-1">WebRTC Live Document Scanner</h4>
          <p className="text-xs text-slate-400 mb-4">Capture receipts, pages, or forms instantly with your device camera.</p>
          {error && <div className="text-xs text-rose-500 mb-3">{error}</div>}
          <button onClick={startCamera} className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold cursor-pointer">
            Activate Camera
          </button>
        </div>
      ) : (
        <div>
          <video ref={videoRef} className="w-full rounded-xl mb-3 bg-black max-h-60 object-cover" autoPlay playsInline />
          <button onClick={capturePhoto} className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold cursor-pointer">
            Snap Document Page
          </button>
        </div>
      )}
    </div>
  );
};

// -------------------------------------------------------------
// UI COMPONENT: MAIN TOOL MODAL
// -------------------------------------------------------------
interface ToolModalProps {
  tool: ToolItem | null;
  onClose: () => void;
}

const ToolModal: React.FC<ToolModalProps> = ({ tool, onClose }) => {
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ProcessResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Form options state
  const [compressionLevel, setCompressionLevel] = useState('medium');
  const [rotationAngle, setRotationAngle] = useState(90);
  const [password, setPassword] = useState('');
  const [watermarkText, setWatermarkText] = useState('CONFIDENTIAL');
  const [pageNumberFormat, setPageNumberFormat] = useState('Page {n} of {total}');
  const [signatureBlob, setSignatureBlob] = useState<Blob | null>(null);
  const [pageRanges, setPageRanges] = useState('');
  const [pageSize, setPageSize] = useState('A4');

  if (!tool) return null;

  const handleExecute = async () => {
    if (files.length === 0) {
      setError('Please choose at least one file to process.');
      return;
    }
    setError(null);
    setLoading(true);

    const formData = new FormData();
    if (tool.multiple) {
      files.forEach(f => formData.append('files', f));
    } else {
      formData.append('file', files[0]);
    }

    // Attach tool-specific configs
    if (tool.id === 'compress-pdf') formData.append('level', compressionLevel);
    if (tool.id === 'rotate-pdf') formData.append('angle', rotationAngle.toString());
    if (tool.id === 'protect-pdf' || tool.id === 'unlock-pdf') formData.append('password', password);
    if (tool.id === 'add-watermark') formData.append('text', watermarkText);
    if (tool.id === 'page-numbers') formData.append('pattern', pageNumberFormat);
    if (tool.id === 'split-pdf' || tool.id === 'delete-pages' || tool.id === 'extract-pages') {
      formData.append('ranges', pageRanges);
      formData.append('pages', pageRanges);
    }
    if (tool.id === 'resize-pdf') formData.append('paper_size', pageSize);
    if (tool.id === 'sign-pdf' && signatureBlob) {
      formData.append('signature', signatureBlob, 'signature.png');
    }

    try {
      const res = await processToolRequest(tool.endpoint, formData);
      setResult(res);
    } catch (err: any) {
      setError(err.message || 'Operation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/70 backdrop-blur-xs">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200/80 dark:border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${tool.badgeBg} ${tool.badgeColor}`}>
              {renderToolIcon(tool.iconName, "w-5 h-5")}
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">{tool.title}</h3>
              <p className="text-xs text-slate-400">{tool.description}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {result ? (
            <ToolSuccess
              tool={tool}
              result={result}
              onReset={() => { setResult(null); setFiles([]); }}
              onClose={onClose}
            />
          ) : (
            <>
              {/* Optional Custom Component: Scanner */}
              {tool.customComponent === 'scanner' && (
                <DocumentScanner onCapture={(captured) => setFiles(prev => [...prev, captured])} />
              )}

              {/* Upload Dropzone */}
              <Dropzone
                accept={tool.accept}
                multiple={tool.multiple}
                files={files}
                onFilesSelected={setFiles}
                onRemoveFile={(idx) => setFiles(prev => prev.filter((_, i) => i !== idx))}
              />

              {/* Tool Options */}
              {tool.id === 'compress-pdf' && (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Compression Intensity</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['low', 'medium', 'high'].map((lvl) => (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => setCompressionLevel(lvl)}
                        className={`py-2 text-xs font-bold capitalize rounded-xl border cursor-pointer ${
                          compressionLevel === lvl
                            ? 'bg-indigo-600 text-white border-indigo-600'
                            : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {tool.id === 'rotate-pdf' && (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Rotation Angle</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[90, 180, 270].map((deg) => (
                      <button
                        key={deg}
                        type="button"
                        onClick={() => setRotationAngle(deg)}
                        className={`py-2 text-xs font-bold rounded-xl border cursor-pointer ${
                          rotationAngle === deg
                            ? 'bg-indigo-600 text-white border-indigo-600'
                            : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        +{deg}°
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {(tool.id === 'protect-pdf' || tool.id === 'unlock-pdf') && (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Document Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter document password..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-white"
                  />
                </div>
              )}

              {tool.id === 'add-watermark' && (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Watermark Text</label>
                  <input
                    type="text"
                    value={watermarkText}
                    onChange={(e) => setWatermarkText(e.target.value)}
                    placeholder="e.g. CONFIDENTIAL"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-white"
                  />
                </div>
              )}

              {tool.id === 'page-numbers' && (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Numbering Pattern</label>
                  <input
                    type="text"
                    value={pageNumberFormat}
                    onChange={(e) => setPageNumberFormat(e.target.value)}
                    placeholder="Page {n} of {total}"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-white"
                  />
                </div>
              )}

              {(tool.id === 'split-pdf' || tool.id === 'delete-pages' || tool.id === 'extract-pages') && (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Page Ranges (e.g. 1-3, 5)</label>
                  <input
                    type="text"
                    value={pageRanges}
                    onChange={(e) => setPageRanges(e.target.value)}
                    placeholder="e.g. 1-2, 4"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-white"
                  />
                </div>
              )}

              {tool.id === 'resize-pdf' && (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Standard Paper Size</label>
                  <select
                    value={pageSize}
                    onChange={(e) => setPageSize(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-white"
                  >
                    <option value="A4">A4 (Standard 210 x 297 mm)</option>
                    <option value="Letter">US Letter</option>
                    <option value="Legal">Legal</option>
                    <option value="A3">A3</option>
                  </select>
                </div>
              )}

              {/* Optional Custom Component: Signature Pad */}
              {tool.customComponent === 'signature' && (
                <SignaturePad onSignatureReady={setSignatureBlob} />
              )}
            </>
          )}
        </div>

        {/* Footer Actions */}
        {!result && (
          <div className="p-6 border-t border-slate-200/80 dark:border-slate-800/80 flex items-center justify-end gap-3 bg-slate-50/50 dark:bg-slate-900/50">
            <button
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleExecute}
              disabled={loading || files.length === 0}
              className={`px-6 py-2.5 rounded-xl text-xs font-bold text-white flex items-center gap-2 cursor-pointer transition-all ${
                loading || files.length === 0
                  ? 'bg-slate-400 cursor-not-allowed opacity-60'
                  : 'bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/20'
              }`}
            >
              {loading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
              <span>{loading ? 'Processing Document...' : `Execute ${tool.title}`}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// -------------------------------------------------------------
// UI COMPONENT: ABOUT & FAQ SECTION (SEO GROUNDING)
// -------------------------------------------------------------
const AboutSection: React.FC = () => (
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
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs text-left">
        <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">100% Privacy-Conscious</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          Files are processed in ephemeral sandboxes and immediately purged. Stale files are automatically cleared every 10 minutes.
        </p>
      </div>

      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs text-left">
        <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4">
          <Zap className="w-5 h-5" />
        </div>
        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">Native C++ Speed</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          Powered by PyMuPDF's ultra-fast native C++ engine and client-side WebAssembly, operations finish in milliseconds.
        </p>
      </div>

      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs text-left">
        <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4">
          <UserCheck className="w-5 h-5" />
        </div>
        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">No Account Friction</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          Zero signups, zero credit cards, zero watermarks forced into your documents. Ready for instant daily use.
        </p>
      </div>
    </div>

    {/* FAQ SECTION */}
    <div id="faq" className="mt-16 pt-12 border-t border-slate-200/60 dark:border-slate-800/60 text-left">
      <div className="text-center max-w-xl mx-auto mb-10">
        <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-2">Frequently Asked Questions</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">Everything you need to know about using DocuTools for your documents and PDFs.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
        <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-800">
          <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1.5">How to convert PDF to Image (JPG or PNG)?</h4>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Click on <strong>PDF to JPG</strong> or <strong>PDF to PNG</strong>, choose your PDF document, and instantly download high-definition pictures of all pages.
          </p>
        </div>
        <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-800">
          <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1.5">Can I convert JPG and PNG images into a PDF?</h4>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Yes! Use the <strong>JPG to PDF</strong> or <strong>PNG to PDF</strong> tool to merge multiple pictures or receipts into a clean PDF file.
          </p>
        </div>
        <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-800">
          <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1.5">Is DocuTools really 100% free to use?</h4>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Yes. All 32 document tools including Merge, Compress, PDF to Word, and OCR are completely free without limits or subscription fees.
          </p>
        </div>
        <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-800">
          <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1.5">Are my files safe and private?</h4>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            DocuTools never retains your documents. Processing occurs in isolated memory containers and client-side browser WebAssembly.
          </p>
        </div>
      </div>
    </div>
  </section>
);

// -------------------------------------------------------------
// UI COMPONENT: FOOTER
// -------------------------------------------------------------
const Footer: React.FC<{ onSelectCategory: (cat: ToolCategory) => void }> = ({ onSelectCategory }) => (
  <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 py-12 px-4 sm:px-6 lg:px-8 text-xs text-slate-500 dark:text-slate-400">
    <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold">
          <Files className="w-4 h-4" />
        </div>
        <span className="font-bold text-slate-900 dark:text-white">DOCUTOOLS</span>
        <span>• All your document tools in one place.</span>
      </div>
      <div className="flex items-center gap-6">
        <button onClick={() => onSelectCategory('all')} className="hover:text-indigo-600 cursor-pointer">All Tools</button>
        <button onClick={() => onSelectCategory('pdf_organize')} className="hover:text-indigo-600 cursor-pointer">Organize</button>
        <button onClick={() => onSelectCategory('convert_from_pdf')} className="hover:text-indigo-600 cursor-pointer">Convert</button>
        <a href="#privacy" className="hover:text-indigo-600">Privacy Guarantee</a>
      </div>
    </div>
  </footer>
);

// -------------------------------------------------------------
// ROOT APPLICATION COMPONENT
// -------------------------------------------------------------
export default function App() {
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  const [selectedCategory, setSelectedCategory] = useState<ToolCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTool, setActiveTool] = useState<ToolItem | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Ctrl+K shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const categories: { id: ToolCategory; label: string }[] = [
    { id: 'all', label: 'All 32 Tools' },
    { id: 'pdf_organize', label: 'Organize & Edit' },
    { id: 'convert_from_pdf', label: 'PDF to Office/Img' },
    { id: 'convert_to_pdf', label: 'Office/Img to PDF' },
    { id: 'pdf_security', label: 'Security' },
    { id: 'pdf_annotate', label: 'Sign & Annotate' },
    { id: 'ocr_extra', label: 'OCR & Utilities' }
  ];

  const filteredTools = useMemo(() => {
    const list = TOOLS.filter(t => {
      const matchesCat = selectedCategory === 'all' || t.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q ||
        t.title.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.id.includes(q);
      return matchesCat && matchesSearch;
    });
    if (selectedCategory === 'all' && !searchQuery.trim()) {
      return [...list].sort((a, b) => (b.popular ? 1 : 0) - (a.popular ? 1 : 0));
    }
    return list;
  }, [selectedCategory, searchQuery]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors">
      <Header
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        onSearchClick={() => searchInputRef.current?.focus()}
        onResetCategory={() => { setSelectedCategory('all'); setSearchQuery(''); }}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <Hero
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          searchInputRef={searchInputRef}
        />

        {/* Category Pills */}
        <section className="mb-10">
          <div className="flex items-center justify-center flex-wrap gap-2">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-800/80'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </section>

        {/* Tools Grid */}
        <section className="mb-20">
          {filteredTools.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
              {filteredTools.map(tool => (
                <ToolCard
                  key={tool.id}
                  tool={tool}
                  onSelect={(t) => setActiveTool(t)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 px-4">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-900 text-slate-400 flex items-center justify-center mx-auto mb-4">
                <SearchX className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                No tools found for "{searchQuery}"
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-4">
                Try searching for keywords like "merge", "pdf", "word", "excel", "ocr", or reset filters.
              </p>
              <button
                onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
                className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold shadow-xs cursor-pointer"
              >
                Clear Search & Show All Tools
              </button>
            </div>
          )}
        </section>

        {/* About & FAQ */}
        <AboutSection />
      </main>

      <Footer onSelectCategory={setSelectedCategory} />

      {/* Tool Modal Dialog */}
      <ToolModal
        tool={activeTool}
        onClose={() => setActiveTool(null)}
      />
    </div>
  );
}
