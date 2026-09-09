import React, { useRef, useState, useEffect } from 'react';
import { Eraser, Check, Upload, PenTool } from 'lucide-react';

interface SignaturePadProps {
  onSignatureReady: (blob: Blob) => void;
  pageNum: number;
  setPageNum: (p: number) => void;
  posX: number;
  setPosX: (x: number) => void;
  posY: number;
  setPosY: (y: number) => void;
}

export const SignaturePad: React.FC<SignaturePadProps> = ({
  onSignatureReady,
  pageNum,
  setPageNum,
  posX,
  setPosX,
  posY,
  setPosY
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [strokeColor, setStrokeColor] = useState('#0f172a');
  const [mode, setMode] = useState<'draw' | 'upload'>('draw');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = strokeColor;
  }, [strokeColor]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
    setHasSignature(true);
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas && hasSignature) {
      canvas.toBlob((blob) => {
        if (blob) onSignatureReady(blob);
      }, 'image/png');
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      onSignatureReady(file);
      setHasSignature(true);
    }
  };

  return (
    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-left space-y-4">
      {/* Mode selection tabs */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        <button
          type="button"
          onClick={() => setMode('draw')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer ${
            mode === 'draw'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
          }`}
        >
          <PenTool className="w-3.5 h-3.5" /> Draw Signature
        </button>
        <button
          type="button"
          onClick={() => setMode('upload')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer ${
            mode === 'upload'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
          }`}
        >
          <Upload className="w-3.5 h-3.5" /> Upload Image
        </button>
      </div>

      {mode === 'draw' ? (
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Sign inside the box:
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setStrokeColor('#0f172a')}
                className={`w-5 h-5 rounded-full bg-slate-900 border-2 ${
                  strokeColor === '#0f172a' ? 'border-indigo-500 scale-110' : 'border-transparent'
                }`}
              />
              <button
                type="button"
                onClick={() => setStrokeColor('#1e40af')}
                className={`w-5 h-5 rounded-full bg-blue-700 border-2 ${
                  strokeColor === '#1e40af' ? 'border-indigo-500 scale-110' : 'border-transparent'
                }`}
              />
              <button
                type="button"
                onClick={clearCanvas}
                className="ml-2 px-2 py-1 text-[11px] font-medium text-slate-500 hover:text-rose-500 flex items-center gap-1 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-md"
              >
                <Eraser className="w-3 h-3" /> Clear
              </button>
            </div>
          </div>

          <canvas
            ref={canvasRef}
            width={440}
            height={160}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
            className="w-full bg-white dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-700 rounded-xl cursor-crosshair touch-none"
          />
        </div>
      ) : (
        <div className="text-center py-6 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl">
          <input
            type="file"
            accept="image/png,image/jpeg"
            onChange={handleImageUpload}
            className="text-xs file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 dark:file:bg-indigo-950 dark:file:text-indigo-300"
          />
          <p className="text-[11px] text-slate-400 mt-2">Upload a transparent PNG signature for best results.</p>
        </div>
      )}

      {/* Positioning controls */}
      <div className="grid grid-cols-3 gap-3 pt-2 border-t border-slate-200 dark:border-slate-800">
        <div>
          <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
            Target Page
          </label>
          <input
            type="number"
            min={1}
            value={pageNum}
            onChange={(e) => setPageNum(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
          />
        </div>
        <div>
          <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
            X Position (pt)
          </label>
          <input
            type="number"
            value={posX}
            onChange={(e) => setPosX(parseInt(e.target.value) || 0)}
            className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
          />
        </div>
        <div>
          <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
            Y Position (pt)
          </label>
          <input
            type="number"
            value={posY}
            onChange={(e) => setPosY(parseInt(e.target.value) || 0)}
            className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
          />
        </div>
      </div>
    </div>
  );
};
