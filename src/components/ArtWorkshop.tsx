import React, { useRef, useState, useEffect } from 'react';
import { Palette, Trash2, CheckCircle, HelpCircle, Star, Sparkles } from 'lucide-react';
import { playSound } from '../utils/audio';

interface ArtWorkshopProps {
  onSaveDrawing: (dataUrl: string) => void;
  savedDrawingsCount: number;
}

const COLORS = [
  { value: '#ef4444', name: 'قرمز زغال‌اخته' },
  { value: '#f97316', name: 'نارنجی هویج' },
  { value: '#eab308', name: 'زرد بال جوجه' },
  { value: '#22c55e', name: 'سبز قورباغه' },
  { value: '#06b6d4', name: 'آبی استخر' },
  { value: '#3b82f6', name: 'آبی فضانورد' },
  { value: '#a855f7', name: 'بنفش تمشک' },
  { value: '#ec4899', name: 'صورتی هلو' },
  { value: '#78350f', name: 'قهوه‌ای شکلات' },
  { value: '#0f172a', name: 'مشکی کلاغ' },
];

const BRUSH_SIZES = [
  { value: 4, label: 'باریک' },
  { value: 12, label: 'متوسط' },
  { value: 24, label: 'پهن' }
];

const STAMPS = [
  { value: '⭐', label: 'ستاره' },
  { value: '🦕', label: 'دایناسور' },
  { value: '🚀', label: 'موشک' },
  { value: '🌈', label: 'رنگین‌کمان' },
  { value: '🎨', label: 'پالت' },
  { value: '🌸', label: 'شکوفه' },
  { value: '🐱', label: 'گربه ملوس' },
  { value: '👑', label: 'تاج پادشاه' }
];

export default function ArtWorkshop({ onSaveDrawing, savedDrawingsCount }: ArtWorkshopProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [color, setColor] = useState('#ef4444');
  const [brushSize, setBrushSize] = useState(12);
  const [isDrawing, setIsDrawing] = useState(false);
  const [mode, setMode] = useState<'draw' | 'eraser' | 'stamp'>('draw');
  const [selectedStamp, setSelectedStamp] = useState('⭐');
  const [showGuide, setShowGuide] = useState(true);

  // Auto-resize canvas to match container size
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set initial size
    canvas.width = canvas.parentElement?.clientWidth || 600;
    canvas.height = 340;

    // Background to white
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  // Standard Mouse drawing helper
  const getMousePos = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();

    let clientX = 0;
    let clientY = 0;

    if ('touches' in e) {
      if (e.touches.length === 0) return null;
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const pos = getMousePos(e);
    if (!pos) return;

    if (mode === 'stamp') {
      // Draw stamp immediately
      ctx.font = `${brushSize * 3}px Arial`;
      ctx.fillStyle = '#000000';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(selectedStamp, pos.x, pos.y);
      playSound('pop');
      return;
    }

    // Drawing mode
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    ctx.strokeStyle = mode === 'eraser' ? '#ffffff' : color;
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const pos = getMousePos(e);
    if (!pos) return;

    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    if (!window.confirm('آیا می‌خواهی تخته نقاشی خودت رو کاملاً پاک کنی؟')) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    playSound('pop');
  };

  const saveArtwork = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    onSaveDrawing(dataUrl);
    playSound('levelup');
    alert('هورااا! نقاشی قشنگ تو ثبت شد و امتیاز تجربه گرفتی! 🎨🏆');
  };

  return (
    <div id="art-workshop" ref={containerRef} className="bg-white rounded-3xl comic-border p-5 text-right">
      
      {/* Title block */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b-2 border-slate-200 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-pink-900 bg-pink-100 border-2 border-black px-3 py-1 rounded-full flex items-center gap-1 shadow-[2px_2px_0px_0px_#1A1A1A]">
            <Sparkles className="w-3.5 h-3.5 text-pink-600 animate-spin" />
            تعداد شاهکارها: {savedDrawingsCount} نقاشی ثبت شده
          </span>
        </div>
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-black text-[#D946EF] font-sans">کارستان هنر و خلاقیت 🎨</h2>
          <div className="text-2xl">👩‍🎨</div>
        </div>
      </div>

      {showGuide && (
        <div className="mb-3 bg-white border-2 border-black rounded-2xl p-3 flex items-start gap-2 text-xs text-pink-950 font-bold leading-relaxed relative" dir="rtl">
          <span>💡 کودک من! یک ابزار از پایین انتخاب کن. می‌تونی با قلم کار کنی، یا پاک‌کن برداری، یا مهرهای جادویی (استامپ) رو برداری و روی بوم بکوبی! در پایان، دکمه "ثبت اثر" را بزن تا امتیاز بگیری!</span>
          <button 
            onClick={() => setShowGuide(false)} 
            id="close-guide-btn"
            className="text-pink-400 hover:text-pink-600 mr-auto font-black cursor-pointer text-sm"
          >
            ×
          </button>
        </div>
      )}

      {/* Main Canvas Container with drawing lines indicator */}
      <div className="relative border-4 border-black rounded-2xl overflow-hidden shadow-inner bg-white bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          id="drawing-canvas-area"
          className="w-full cursor-crosshair block touch-none"
        />
      </div>

      {/* Tool panel: Drawing, Eraser, Stamping Mode Selector */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
        
        {/* Brush Sizes */}
        <div className="bg-white p-3 rounded-2xl comic-border-xs">
          <span className="text-xs font-black text-slate-500 block mb-2 text-right">اندازه نوک مداد:</span>
          <div className="flex justify-between gap-1">
            {BRUSH_SIZES.map((sz) => (
              <button
                key={sz.value}
                onClick={() => { setBrushSize(sz.value); playSound('pop'); }}
                id={`brush-size-btn-${sz.value}`}
                className={`flex-1 py-1 px-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  brushSize === sz.value 
                    ? 'bg-pink-400 text-pink-950 pill-btn-sm scale-102 hover:translate-y-0.5' 
                    : 'bg-white border-2 border-slate-200 text-slate-600 hover:scale-102 hover:border-black'
                }`}
              >
                {sz.label}
              </button>
            ))}
          </div>
        </div>

        {/* Action Mode Controls */}
        <div className="bg-white p-3 rounded-2xl comic-border-xs flex flex-col justify-center">
          <span className="text-xs font-black text-slate-500 block mb-2 text-right">حالت مداد جادویی:</span>
          <div className="grid grid-cols-3 gap-1">
            <button
              onClick={() => { setMode('draw'); playSound('pop'); }}
              id="mode-draw-btn"
              className={`py-1 text-[11px] font-black rounded-xl cursor-pointer transition-all ${
                mode === 'draw' ? 'bg-blue-400 text-blue-950 pill-btn-sm scale-102' : 'bg-white border-2 border-slate-200 text-slate-600'
              }`}
            >
              🚀 مداد
            </button>
            <button
              onClick={() => { setMode('eraser'); playSound('pop'); }}
              id="mode-eraser-btn"
              className={`py-1 text-[11px] font-black rounded-xl cursor-pointer transition-all ${
                mode === 'eraser' ? 'bg-pink-400 text-pink-950 pill-btn-sm scale-102' : 'bg-white border-2 border-slate-200 text-slate-600'
              }`}
            >
              🧽 پاک‌کن
            </button>
            <button
              onClick={() => { setMode('stamp'); playSound('pop'); }}
              id="mode-stamp-btn"
              className={`py-1 text-[11px] font-black rounded-xl cursor-pointer transition-all ${
                mode === 'stamp' ? 'bg-yellow-400 text-yellow-950 pill-btn-sm scale-102' : 'bg-white border-2 border-slate-200 text-slate-600'
              }`}
            >
              🧸 استامپ
            </button>
          </div>
        </div>

        {/* Clear and Save Operations */}
        <div className="flex gap-2 items-center">
          <button
            onClick={clearCanvas}
            id="clear-canvas-btn"
            className="flex-1 max-h-[46px] bg-white text-rose-600 p-2.5 rounded-2xl font-black text-xs cursor-pointer transition-all flex items-center justify-center gap-1 pill-btn-sm"
          >
            <Trash2 className="w-4 h-4 shrink-0" />
            پاک کردن کل صفحه
          </button>

          <button
            onClick={saveArtwork}
            id="save-drawing-btn"
            className="flex-1 max-h-[46px] bg-pink-400 text-pink-950 p-2.5 rounded-2xl font-black text-xs cursor-pointer transition-all flex items-center justify-center gap-1.5 pill-btn-sm"
          >
            <CheckCircle className="w-4 h-4 shrink-0" />
            ثبت در آلبوم نقاشی
          </button>
        </div>

      </div>

      {/* Mode Specific Configurations */}
      {mode === 'stamp' ? (
        <div className="mt-3 bg-white comic-border-xs p-3 rounded-2xl flex flex-col items-end animate-fade-in">
          <span className="text-[10px] text-amber-950 font-black block mb-2">🎈 مهر خودت رو انتخاب کن و هر کجای نقاشی که دوست داری تقه‌ای بزن:</span>
          <div className="flex flex-wrap gap-2 justify-end">
            {STAMPS.map((st) => (
              <button
                key={st.value}
                onClick={() => { setSelectedStamp(st.value); playSound('pop'); }}
                id={`stamp-select-btn-${st.value}`}
                className={`w-10 h-10 bg-white rounded-xl text-lg flex items-center justify-center cursor-pointer hover:scale-105 transition-transform ${
                  selectedStamp === st.value && mode === 'stamp'
                    ? 'bg-yellow-300 comic-border-xs'
                    : 'bg-white border-2 border-slate-200 hover:border-black'
                }`}
                title={st.label}
              >
                {st.value}
              </button>
            ))}
          </div>
        </div>
      ) : (
        /* Color selection panel for drawing mode */
        <div className="mt-3 bg-white comic-border-xs p-3 rounded-2xl text-right animate-fade-in">
          <span className="text-xs font-black text-slate-500 block mb-2 flex items-center justify-end gap-1">
            <span>مداد رنگی‌های من 🌈</span>
            <Palette className="w-4 h-4 text-pink-500" />
          </span>
          <div className="flex flex-wrap gap-2.5 justify-end">
            {COLORS.map((col) => (
              <button
                key={col.value}
                onClick={() => { setColor(col.value); if (mode !== 'draw') setMode('draw'); playSound('pop'); }}
                id={`color-preset-btn-${col.value.replace('#', '')}`}
                className={`w-8 h-8 rounded-full border-3 transition-transform cursor-pointer hover:scale-115 ${
                  color === col.value && mode === 'draw'
                    ? 'border-black scale-110 shadow-[2px_2px_0px_0px_#1A1A1A]'
                    : 'border-slate-300'
                }`}
                style={{ backgroundColor: col.value }}
                title={col.name}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
