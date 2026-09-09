import React, { useRef, useState, useEffect } from 'react';
import { Camera, RefreshCw, Check, Trash2, Sliders, Image as ImageIcon } from 'lucide-react';

interface DocumentScannerProps {
  onPagesCaptured: (capturedFiles: File[]) => void;
}

export const DocumentScanner: React.FC<DocumentScannerProps> = ({ onPagesCaptured }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedPages, setCapturedPages] = useState<{ id: string; url: string; file: File }[]>([]);
  const [filterMode, setFilterMode] = useState<'color' | 'grayscale' | 'bw'>('bw');
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const startCamera = async () => {
    setCameraError(null);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setStream(mediaStream);
      setCameraActive(true);
    } catch (err: any) {
      setCameraError('Camera access unavailable or permission denied. You can still upload page images directly.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setCameraActive(false);
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const captureFrame = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Apply filters if requested
    if (filterMode !== 'color') {
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imgData.data;
      for (let i = 0; i < data.length; i += 4) {
        const avg = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
        if (filterMode === 'grayscale') {
          data[i] = avg;
          data[i + 1] = avg;
          data[i + 2] = avg;
        } else if (filterMode === 'bw') {
          const val = avg > 128 ? 255 : 0;
          data[i] = val;
          data[i + 1] = val;
          data[i + 2] = val;
        }
      }
      ctx.putImageData(imgData, 0, 0);
    }

    canvas.toBlob((blob) => {
      if (!blob) return;
      const file = new File([blob], `scanned_page_${capturedPages.length + 1}.png`, { type: 'image/png' });
      const url = URL.createObjectURL(blob);
      const updated = [...capturedPages, { id: Math.random().toString(), url, file }];
      setCapturedPages(updated);
      onPagesCaptured(updated.map(p => p.file));
    }, 'image/png');
  };

  const removePage = (id: string) => {
    const updated = capturedPages.filter(p => p.id !== id);
    setCapturedPages(updated);
    onPagesCaptured(updated.map(p => p.file));
  };

  return (
    <div className="space-y-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-left">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
          <Camera className="w-4 h-4 text-indigo-500" />
          Camera Document Scanner
        </h4>

        <div className="flex items-center gap-1 bg-slate-200 dark:bg-slate-800 p-1 rounded-lg text-xs font-semibold">
          <button
            type="button"
            onClick={() => setFilterMode('bw')}
            className={`px-2 py-1 rounded-md cursor-pointer ${filterMode === 'bw' ? 'bg-white dark:bg-slate-900 text-indigo-600 shadow-xs' : 'text-slate-500'}`}
          >
            B&W Doc
          </button>
          <button
            type="button"
            onClick={() => setFilterMode('grayscale')}
            className={`px-2 py-1 rounded-md cursor-pointer ${filterMode === 'grayscale' ? 'bg-white dark:bg-slate-900 text-indigo-600 shadow-xs' : 'text-slate-500'}`}
          >
            Grayscale
          </button>
          <button
            type="button"
            onClick={() => setFilterMode('color')}
            className={`px-2 py-1 rounded-md cursor-pointer ${filterMode === 'color' ? 'bg-white dark:bg-slate-900 text-indigo-600 shadow-xs' : 'text-slate-500'}`}
          >
            Color
          </button>
        </div>
      </div>

      {/* Video Stream Container */}
      <div className="relative aspect-video rounded-xl bg-black overflow-hidden flex items-center justify-center border border-slate-700">
        {cameraActive ? (
          <>
            <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
            {/* Guide overlay */}
            <div className="absolute inset-8 border-2 border-dashed border-white/50 rounded-lg pointer-events-none" />
          </>
        ) : (
          <div className="text-center p-6 text-slate-400">
            <Camera className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p className="text-xs mb-3">Camera is currently inactive.</p>
            <button
              type="button"
              onClick={startCamera}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs"
            >
              Start Camera
            </button>
          </div>
        )}
        <canvas ref={canvasRef} className="hidden" />
      </div>

      {cameraError && (
        <div className="p-3 text-xs rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300">
          {cameraError}
        </div>
      )}

      {/* Action Bar */}
      {cameraActive && (
        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={captureFrame}
            className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-emerald-500/20 flex items-center gap-2"
          >
            <Camera className="w-4 h-4" /> Capture Page ({capturedPages.length + 1})
          </button>

          <button
            type="button"
            onClick={stopCamera}
            className="px-3 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold"
          >
            Stop Camera
          </button>
        </div>
      )}

      {/* Scanned Pages Thumbnails */}
      {capturedPages.length > 0 && (
        <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
          <div className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">
            Captured {capturedPages.length} Page{capturedPages.length > 1 ? 's' : ''}:
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
            {capturedPages.map((page, idx) => (
              <div key={page.id} className="relative group rounded-lg overflow-hidden border border-slate-300 dark:border-slate-700 aspect-3/4 bg-white">
                <img src={page.url} alt={`Scanned page ${idx + 1}`} className="w-full h-full object-cover" />
                <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-black/70 text-white">
                  {idx + 1}
                </span>
                <button
                  type="button"
                  onClick={() => removePage(page.id)}
                  className="absolute top-1 right-1 p-1 rounded-full bg-rose-600 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
