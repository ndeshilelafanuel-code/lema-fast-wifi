import React, { useState, useEffect, useRef } from 'react';
import jsQR from 'jsqr';
import {
  Camera,
  X,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  RefreshCw,
  QrCode,
  Zap,
  HelpCircle,
  Volume2
} from 'lucide-react';

interface VoucherQrScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (voucherCode: string) => void;
}

export const VoucherQrScannerModal: React.FC<VoucherQrScannerModalProps> = ({
  isOpen,
  onClose,
  onScanSuccess,
}) => {
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [scannedCode, setScannedCode] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameId = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Play audio chime on successful scan
  const playScanBeep = () => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(987.77, ctx.currentTime); // B5 note
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.18);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.18);
    } catch {
      // Audio not supported or blocked
    }
  };

  const stopCamera = () => {
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
      animationFrameId.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const startCamera = async () => {
    setCameraError(null);
    stopCamera();

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraError('Kivinjari hiki hakiruhusu kamera ya moja kwa moja. Tumia vifungo vya majaribio au andika vocha kwa mkono.');
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 640 },
          height: { ideal: 640 },
        },
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        await videoRef.current.play();
        setIsCameraActive(true);
        scanFrame();
      }
    } catch (err: unknown) {
      const e = err as Error;
      if (e.name === 'NotAllowedError' || e.name === 'PermissionDeniedError') {
        setCameraError('Ruhusa ya kamera imezimwa. Tafadhali ruhusu kamera kwenye kivinjari chako.');
      } else {
        setCameraError('Kamera haipatikani kwa sasa. Unaweza kuchagua vocha ya mfano hapa chini au kuandika kwa mkono.');
      }
      setIsCameraActive(false);
    }
  };

  const scanFrame = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });

      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'dontInvert',
        });

        if (code && code.data) {
          const raw = code.data.trim();
          // Extract numeric code or cleaned token from QR
          const cleaned = raw.replace(/^.*[=:/#]/, '').trim() || raw;
          handleFoundCode(cleaned);
          return;
        }
      }
    }

    animationFrameId.current = requestAnimationFrame(scanFrame);
  };

  const handleFoundCode = (code: string) => {
    playScanBeep();
    setScannedCode(code);
    stopCamera();
    setTimeout(() => {
      onScanSuccess(code);
      onClose();
    }, 700);
  };

  useEffect(() => {
    if (isOpen) {
      setScannedCode(null);
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen, facingMode]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-stone-900 border border-stone-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 bg-stone-850 border-b border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <QrCode className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-white">
                Scan Vocha kwa Kamera
              </h3>
              <p className="text-[10px] text-stone-400">
                Elekeza kamera kwenye msimbo wa QR wa vocha
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-800 text-stone-300 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Viewfinder Video Area */}
        <div className="relative bg-black flex items-center justify-center min-h-[280px] overflow-hidden">
          <video
            ref={videoRef}
            className={`w-full h-full object-cover min-h-[280px] ${
              facingMode === 'user' ? 'scale-x-[-1]' : ''
            }`}
            playsInline
            muted
          />
          <canvas ref={canvasRef} className="hidden" />

          {/* Viewfinder Target Overlay */}
          {isCameraActive && !scannedCode && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="w-56 h-56 border-2 border-amber-400/80 rounded-2xl relative shadow-[0_0_0_9999px_rgba(0,0,0,0.55)]">
                {/* Corner markers */}
                <span className="absolute -top-1 -left-1 w-4 h-4 border-t-4 border-l-4 border-amber-400 rounded-tl" />
                <span className="absolute -top-1 -right-1 w-4 h-4 border-t-4 border-r-4 border-amber-400 rounded-tr" />
                <span className="absolute -bottom-1 -left-1 w-4 h-4 border-b-4 border-l-4 border-amber-400 rounded-bl" />
                <span className="absolute -bottom-1 -right-1 w-4 h-4 border-b-4 border-r-4 border-amber-400 rounded-br" />

                {/* Scanning laser line animation */}
                <div className="absolute left-2 right-2 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent shadow-[0_0_8px_#f59e0b] animate-[bounce_2s_infinite]" />
              </div>
            </div>
          )}

          {/* Scanned Success Badge Overlay */}
          {scannedCode && (
            <div className="absolute inset-0 bg-stone-950/90 flex flex-col items-center justify-center p-6 text-center space-y-2 animate-in zoom-in-95 duration-200">
              <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/40">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="text-sm font-black text-white uppercase tracking-wider">
                Vocha Imesomwa!
              </h4>
              <span className="text-xl font-mono font-black text-amber-400 bg-stone-900 px-4 py-1.5 rounded-xl border border-stone-800">
                {scannedCode}
              </span>
              <p className="text-[11px] text-stone-400">
                Inakuunganisha kwenye mtandao kiotomatiki...
              </p>
            </div>
          )}

          {/* Camera Error / Fallback View */}
          {cameraError && !isCameraActive && (
            <div className="p-6 text-center space-y-3 bg-stone-950/90 m-4 rounded-2xl border border-rose-500/30">
              <div className="w-10 h-10 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto border border-rose-500/40">
                <AlertCircle className="w-5 h-5" />
              </div>
              <p className="text-xs text-stone-300 leading-relaxed font-medium">
                {cameraError}
              </p>
              <button
                type="button"
                onClick={startCamera}
                className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-white text-xs font-bold rounded-xl transition-colors inline-flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Jaribu Tena Kamera</span>
              </button>
            </div>
          )}
        </div>

        {/* Controls & Quick Test Bar */}
        <div className="p-4 bg-stone-850 border-t border-stone-800 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <button
              type="button"
              onClick={() => setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'))}
              className="px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-[11px] font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Camera className="w-3.5 h-3.5 text-amber-400" />
              <span>{facingMode === 'environment' ? 'Geuza Kamera (Mbele)' : 'Kamera ya Nyuma'}</span>
            </button>

            <span className="text-[10px] text-stone-400 flex items-center gap-1 font-mono">
              <Volume2 className="w-3 h-3 text-emerald-400" />
              <span>Sauti ya Beep Imewashwa</span>
            </span>
          </div>

          {/* Quick Simulation Samples (Perfect for testing when without paper voucher) */}
          <div className="pt-2 border-t border-stone-800">
            <span className="text-[10px] text-stone-400 uppercase font-black tracking-wider block mb-1.5">
              Au Jaribu Vocha za Mfano (1-Click Test):
            </span>
            <div className="grid grid-cols-3 gap-2">
              {['9482', '5120', '8841'].map((sampleCode) => (
                <button
                  key={sampleCode}
                  type="button"
                  onClick={() => handleFoundCode(sampleCode)}
                  className="py-1.5 px-2 bg-stone-900 hover:bg-amber-500 hover:text-stone-950 text-amber-400 font-mono font-bold text-xs rounded-xl border border-stone-700/80 transition-all cursor-pointer text-center group"
                >
                  <span className="block text-[9px] text-stone-400 group-hover:text-stone-900 font-sans font-normal">
                    Karatasi #{sampleCode.slice(0, 2)}
                  </span>
                  <span>{sampleCode}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
