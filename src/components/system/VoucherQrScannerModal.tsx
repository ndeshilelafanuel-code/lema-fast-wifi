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
  Volume2,
  Upload,
  Image as ImageIcon,
  KeyRound,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
  Smartphone
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
  const [manualCodeInput, setManualCodeInput] = useState<string>('');
  const [isProcessingImage, setIsProcessingImage] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameId = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const nativeCameraInputRef = useRef<HTMLInputElement | null>(null);
  const galleryInputRef = useRef<HTMLInputElement | null>(null);

  // Check if running inside an iframe (like AI Studio preview)
  const isInIframe = typeof window !== 'undefined' && window.self !== window.top;

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
        setCameraError(
          'Kivinjari chako hakiruhusu kamera ya moja kwa moja. Unaweza kutumia kitufe cha "Piga Picha kwa Kamera ya Simu" hapa chini kufungua kamera ya simu moja kwa moja.'
        );
        return;
      }

      let stream: MediaStream | null = null;
      // 1. Try with preferred facing mode
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: facingMode },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });
      } catch {
        // 2. Fallback without resolution constraints
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: facingMode },
            audio: false,
          });
        } catch {
          // 3. Fallback to any available video camera
          stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false,
          });
        }
      }

      if (!stream) {
        throw new Error('Kamera haikuanza');
      }

      streamRef.current = stream;
      if (videoRef.current) {
        const video = videoRef.current;
        video.srcObject = stream;
        video.setAttribute('playsinline', 'true');
        video.setAttribute('autoplay', 'true');
        video.muted = true;

        try {
          await video.play();
        } catch (playErr) {
          console.warn('Video play error, awaiting metadata:', playErr);
        }

        setIsCameraActive(true);
        scanFrame();
      }
    } catch (err: unknown) {
      const e = err as Error;
      console.warn('Camera error:', e);
      if (e.name === 'NotAllowedError' || e.name === 'PermissionDeniedError' || e.name === 'SecurityError') {
        setCameraError(
          isInIframe
            ? 'Kivinjari kinazuia kamera ya video ndani ya dirisha la preview (iframe). Bonyeza kitufe cha njano hapa chini kupiga picha kwa kamera ya simu yako mara moja, au fungua kwenye Tab mpya ya kivinjari.'
            : 'Ruhusa ya kamera imezimwa. Bonyeza alama ya kufuli 🔒 kwenye anwani ya tovuti na uchague "Allow" (Ruhusu), au tumia kitufe cha "Piga Picha kwa Kamera ya Simu" hapa chini.'
        );
      } else {
        setCameraError(
          'Kamera ya moja kwa moja haipatikani kwa sasa. Tumia kitufe cha "Piga Picha kwa Kamera ya Simu" hapa chini kufungua kamera ya simu yako mara moja.'
        );
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
    try {
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([100, 50, 100]);
      }
    } catch {}
    setScannedCode(code);
    stopCamera();
    setTimeout(() => {
      onScanSuccess(code);
      onClose();
    }, 700);
  };

  // Process uploaded image or native camera snapshot
  const handleProcessImageFile = (file?: File) => {
    if (!file) return;
    setIsProcessingImage(true);
    setCameraError(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height);
          setIsProcessingImage(false);

          if (code && code.data) {
            const raw = code.data.trim();
            const cleaned = raw.replace(/^.*[=:/#]/, '').trim() || raw;
            handleFoundCode(cleaned);
          } else {
            setCameraError(
              'Msimbo wa QR haukuonekana vizuri kwenye picha. Tafadhali hakikisha picha ina mwanga mzuri na QR inaonekana yote, au chagua vocha ya mfano hapa chini.'
            );
          }
        } else {
          setIsProcessingImage(false);
        }
      };
      img.onerror = () => {
        setIsProcessingImage(false);
        setCameraError('Imeshindwa kusoma picha hiyo. Jaribu tena.');
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    if (isOpen) {
      setScannedCode(null);
      setManualCodeInput('');
      setCameraError(null);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-stone-900 border border-stone-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Hidden File Inputs for Native Camera Shutter & Gallery */}
        <input
          ref={nativeCameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => handleProcessImageFile(e.target.files?.[0])}
        />
        <input
          ref={galleryInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleProcessImageFile(e.target.files?.[0])}
        />

        {/* Header */}
        <div className="p-4 bg-stone-850 border-b border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-white">
                Scan Vocha kwa Kamera
              </h3>
              <p className="text-[10px] text-stone-400">
                Elekeza kamera kwenye msimbo wa QR wa risiti au vocha
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-800 text-stone-300 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Viewfinder Video Area - Full container with absolute overlays so nothing overflows or splits into columns */}
        <div className="relative bg-black flex items-center justify-center min-h-[260px] max-h-[320px] overflow-hidden w-full">
          {/* Live Video Feed */}
          <video
            ref={videoRef}
            className={`w-full h-full object-cover min-h-[260px] ${!isCameraActive ? 'hidden' : ''} ${
              facingMode === 'user' ? 'scale-x-[-1]' : ''
            }`}
            playsInline
            autoPlay
            muted
          />
          <canvas ref={canvasRef} className="hidden" />

          {/* Viewfinder Target Overlay when streaming */}
          {isCameraActive && !scannedCode && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="w-48 h-48 sm:w-56 sm:h-56 border-2 border-amber-400/80 rounded-2xl relative shadow-[0_0_0_9999px_rgba(0,0,0,0.55)]">
                {/* Corner markers */}
                <span className="absolute -top-1 -left-1 w-4 h-4 border-t-4 border-l-4 border-amber-400 rounded-tl" />
                <span className="absolute -top-1 -right-1 w-4 h-4 border-t-4 border-r-4 border-amber-400 rounded-tr" />
                <span className="absolute -bottom-1 -left-1 w-4 h-4 border-b-4 border-l-4 border-amber-400 rounded-bl" />
                <span className="absolute -bottom-1 -right-1 w-4 h-4 border-b-4 border-r-4 border-amber-400 rounded-br" />

                {/* Scanning laser line animation */}
                <div className="absolute left-2 right-2 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent shadow-[0_0_8px_#f59e0b] animate-[bounce_2s_infinite]" />

                {/* Visual live guide badge */}
                <div className="absolute -bottom-9 left-0 right-0 text-center">
                  <span className="text-[10px] font-black text-amber-300 bg-stone-950/90 px-3 py-1 rounded-full border border-amber-500/40 shadow-lg whitespace-nowrap">
                    ⚡ Elekeza tu kwenye QR — Inasoma yenyewe kiotomatiki!
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Scanned Success Badge Overlay */}
          {scannedCode && (
            <div className="absolute inset-0 bg-stone-950/95 flex flex-col items-center justify-center p-6 text-center space-y-2 animate-in zoom-in-95 duration-200 z-30">
              <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/40">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="text-sm font-black text-white uppercase tracking-wider">
                Vocha Imesomwa!
              </h4>
              <span className="text-2xl font-mono font-black text-amber-400 bg-stone-900 px-5 py-2 rounded-2xl border border-stone-800">
                {scannedCode}
              </span>
              <p className="text-[11px] text-stone-400">
                Inakuunganisha kwenye mtandao kiotomatiki...
              </p>
            </div>
          )}

          {/* Processing snapshot overlay */}
          {isProcessingImage && (
            <div className="absolute inset-0 bg-stone-950/90 flex flex-col items-center justify-center p-4 text-center space-y-2 z-30">
              <RefreshCw className="w-8 h-8 text-amber-400 animate-spin" />
              <p className="text-xs font-bold text-white">Inasoma msimbo wa QR kutoka kwenye picha...</p>
            </div>
          )}

          {/* Camera Error / Fallback View with Direct 1-Tap Shutter & Top-Level Tab option */}
          {cameraError && !isCameraActive && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-4 bg-stone-950/95 text-center space-y-3 overflow-y-auto">
              <div className="w-11 h-11 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto border border-amber-500/30">
                <Camera className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-black text-white uppercase tracking-wider">
                  Fungua Kamera ya Simu
                </h4>
                <p className="text-[11px] text-stone-300 leading-relaxed font-medium mt-1 max-w-[280px]">
                  {cameraError}
                </p>
              </div>

              <div className="flex flex-col gap-2 w-full max-w-[280px] pt-1">
                {/* 1-Tap Native Phone Camera Shutter */}
                <button
                  type="button"
                  onClick={() => nativeCameraInputRef.current?.click()}
                  className="w-full py-3 px-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-black text-xs rounded-xl shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 animate-pulse"
                >
                  <Camera className="w-4 h-4 text-stone-950" />
                  <span>📸 PIGA PICHA KWA KAMERA YA SIMU</span>
                </button>

                {/* Direct Link to Open in Standalone Tab (so browser prompts user to allow live camera) */}
                <a
                  href={typeof window !== 'undefined' ? window.location.href : '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2 px-3 bg-stone-850 hover:bg-stone-750 text-stone-200 text-[11px] font-bold rounded-xl transition-colors inline-flex items-center justify-center gap-1.5 cursor-pointer border border-stone-700"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
                  <span>🌐 Fungua Tab Mpya (Ruhusu Kamera)</span>
                </a>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => galleryInputRef.current?.click()}
                    className="flex-1 py-1.5 px-2 bg-stone-850 hover:bg-stone-750 text-stone-300 text-[11px] font-bold rounded-xl transition-colors inline-flex items-center justify-center gap-1.5 cursor-pointer border border-stone-700"
                  >
                    <Upload className="w-3.5 h-3.5 text-stone-400" />
                    <span>Pakia Picha</span>
                  </button>

                  <button
                    type="button"
                    onClick={startCamera}
                    className="px-3 py-1.5 bg-stone-850 hover:bg-stone-750 text-stone-300 text-[11px] font-bold rounded-xl transition-colors inline-flex items-center gap-1 cursor-pointer border border-stone-700"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
                    <span>Jaribu Tena</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Controls & Options */}
        <div className="p-4 bg-stone-850 border-t border-stone-800 space-y-3 overflow-y-auto">
          {/* Quick Buttons: Native Camera & Switch lens */}
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => nativeCameraInputRef.current?.click()}
              className="flex-1 py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-colors"
            >
              <Camera className="w-3.5 h-3.5 text-stone-950" />
              <span>Piga Picha ya QR</span>
            </button>

            <button
              type="button"
              onClick={() => galleryInputRef.current?.click()}
              className="py-2 px-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors border border-stone-700"
              title="Pakia Picha kutoka Faili"
            >
              <Upload className="w-3.5 h-3.5 text-amber-400" />
              <span>Pakia Picha</span>
            </button>

            {isCameraActive && (
              <button
                type="button"
                onClick={() => setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'))}
                className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 cursor-pointer transition-colors border border-stone-700"
                title="Geuza Kamera"
              >
                <RefreshCw className="w-4 h-4 text-amber-400" />
              </button>
            )}
          </div>

          {/* Fallback Option: Type manually inside modal if user prefers */}
          <div className="pt-2 border-t border-stone-800">
            <span className="text-[10px] text-stone-400 uppercase font-black tracking-wider block mb-1">
              Au Andika Namba ya Vocha Moja kwa Moja:
            </span>
            <div className="flex gap-2">
              <input
                type="text"
                value={manualCodeInput}
                onChange={(e) => setManualCodeInput(e.target.value)}
                placeholder="Mfano: 9482"
                className="flex-1 px-3 py-1.5 bg-stone-900 border border-stone-700 rounded-xl text-center font-mono font-bold text-amber-400 text-xs focus:outline-none focus:border-amber-500"
                maxLength={10}
              />
              <button
                type="button"
                disabled={!manualCodeInput.trim()}
                onClick={() => handleFoundCode(manualCodeInput.trim())}
                className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-stone-950 font-black text-xs rounded-xl cursor-pointer flex items-center gap-1 transition-colors"
              >
                <span>Weka</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Quick Simulation Samples (1-Click Test) */}
          <div className="pt-2 border-t border-stone-800">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] text-stone-400 uppercase font-black tracking-wider">
                Vocha za Mfano (1-Click Test):
              </span>
              <span className="text-[9px] text-emerald-400 font-mono">Bila Vocha ya Karatasi</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { code: '9482', label: 'Saa 24', price: 'Tsh 1,000' },
                { code: '5120', label: 'Wiki 1', price: 'Tsh 5,000' },
                { code: '8841', label: 'Mwezi 1', price: 'Tsh 18,000' },
              ].map((item) => (
                <button
                  key={item.code}
                  type="button"
                  onClick={() => handleFoundCode(item.code)}
                  className="py-1.5 px-2 bg-stone-900 hover:bg-amber-500 hover:text-stone-950 text-amber-400 font-mono font-bold text-xs rounded-xl border border-stone-700/80 transition-all cursor-pointer text-center group"
                >
                  <span className="block text-[8px] text-stone-400 group-hover:text-stone-900 font-sans font-medium">
                    {item.label}
                  </span>
                  <span>{item.code}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
