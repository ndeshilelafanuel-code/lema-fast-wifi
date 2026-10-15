import React, { useState, useEffect, useRef } from 'react';
import jsQR from 'jsqr';
import {
  Camera,
  X,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  QrCode,
  Zap,
  Upload,
  ExternalLink,
  ChevronRight
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
  const [isCameraStarting, setIsCameraStarting] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [scannedCode, setScannedCode] = useState<string | null>(null);
  const [manualCodeInput, setManualCodeInput] = useState<string>('');

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameId = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileUploadInputRef = useRef<HTMLInputElement | null>(null);

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
    setIsCameraStarting(false);
  };

  const startCamera = async () => {
    setCameraError(null);
    setIsCameraStarting(true);
    stopCamera();

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraError('Kivinjari chako hakiruhusu kamera ya moja kwa moja. Unaweza kupakia picha au kuandika namba hapa chini.');
        setIsCameraStarting(false);
        return;
      }

      let stream: MediaStream | null = null;

      // Tiered attempts for robust mobile camera opening:
      // 1. Environment camera (back camera) with ideal standard mobile aspect
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: facingMode },
            width: { ideal: 640 },
            height: { ideal: 480 },
          },
          audio: false,
        });
      } catch {
        // 2. Fallback: simple facingMode without constraints
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: facingMode },
            audio: false,
          });
        } catch {
          // 3. Fallback: Any available camera stream
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

        video.onloadedmetadata = async () => {
          try {
            await video.play();
            setIsCameraActive(true);
            setIsCameraStarting(false);
            scanFrame();
          } catch (e) {
            console.warn('Video play deferred:', e);
            setIsCameraActive(true);
            setIsCameraStarting(false);
            scanFrame();
          }
        };

        // Fallback in case onloadedmetadata doesn't fire immediately
        setTimeout(async () => {
          if (videoRef.current && !isCameraActive) {
            try {
              await videoRef.current.play();
              setIsCameraActive(true);
              setIsCameraStarting(false);
              scanFrame();
            } catch {}
          }
        }, 500);
      }
    } catch (err: unknown) {
      const e = err as Error;
      console.warn('Camera error:', e);
      setIsCameraStarting(false);
      setIsCameraActive(false);

      if (e.name === 'NotAllowedError' || e.name === 'PermissionDeniedError' || e.name === 'SecurityError') {
        setCameraError(
          isInIframe
            ? 'Kivinjari kimezuia kamera ndani ya dirisha hili la preview. Unaweza kufungua kwenye Tab mpya ya kivinjari ili kuruhusu kamera, au pakia picha ya QR hapa chini.'
            : 'Ruhusa ya kamera imezimwa kwenye kivinjari chako. Tafadhali gusa alama ya kufuli 🔒 kwenye anwani ya tovuti na uchague "Allow" (Ruhusu Kamera), kisha bonyeza "Jaribu Tena".'
        );
      } else {
        setCameraError('Kamera haikuweza kufunguka kwa sasa. Tafadhali hakikisha hakuna app nyingine inayotumia kamera, au pakia picha ya vocha.');
      }
    }
  };

  // High-speed optimized QR scanning loop
  const scanFrame = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (video.readyState >= video.HAVE_CURRENT_DATA && video.videoWidth > 0) {
      // Downscale to 480px width for fast 60fps mobile decoding
      const targetWidth = Math.min(480, video.videoWidth);
      const scale = targetWidth / video.videoWidth;
      const targetHeight = Math.floor(video.videoHeight * scale);

      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });

      if (ctx) {
        ctx.drawImage(video, 0, 0, targetWidth, targetHeight);
        const imageData = ctx.getImageData(0, 0, targetWidth, targetHeight);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'attemptBoth',
        });

        if (code && code.data) {
          const raw = code.data.trim();
          // Extract numeric voucher code from URL or token (e.g. "http://lema.wifi/login?code=9482" -> "9482")
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
        navigator.vibrate([80, 40, 80]);
      }
    } catch {}
    setScannedCode(code);
    stopCamera();
    setTimeout(() => {
      onScanSuccess(code);
      onClose();
    }, 600);
  };

  // Process uploaded image if user chooses file
  const handleProcessUploadedFile = (file?: File) => {
    if (!file) return;
    setCameraError(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 800;
        let w = img.width;
        let h = img.height;
        if (w > maxDim || h > maxDim) {
          if (w > h) {
            h = Math.round((h * maxDim) / w);
            w = maxDim;
          } else {
            w = Math.round((w * maxDim) / h);
            h = maxDim;
          }
        }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, w, h);
          const imageData = ctx.getImageData(0, 0, w, h);
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: 'attemptBoth',
          });

          if (code && code.data) {
            const raw = code.data.trim();
            const cleaned = raw.replace(/^.*[=:/#]/, '').trim() || raw;
            handleFoundCode(cleaned);
          } else {
            setCameraError('Msimbo wa QR haukuonekana vizuri kwenye picha. Tafadhali hakikisha picha ina mwanga mzuri, au chagua vocha ya mfano hapa chini.');
          }
        }
      };
      img.onerror = () => {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-sm bg-stone-900 border border-stone-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Hidden File Input for fallback gallery/photo upload */}
        <input
          ref={fileUploadInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleProcessUploadedFile(e.target.files?.[0])}
        />

        {/* Compact Header */}
        <div className="px-4 py-3 bg-stone-850 border-b border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-white">
                Scan Vocha (QR Code)
              </h3>
              <p className="text-[10px] text-stone-400">
                Elekeza kamera kwenye msimbo wa QR
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-stone-800 text-stone-400 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Camera Viewfinder Area - Height optimized so it fits any phone without scrolling */}
        <div className="relative bg-black flex items-center justify-center h-[230px] sm:h-[250px] overflow-hidden w-full">
          {/* Live Video Feed */}
          <video
            ref={videoRef}
            className={`w-full h-full object-cover ${!isCameraActive ? 'hidden' : ''} ${
              facingMode === 'user' ? 'scale-x-[-1]' : ''
            }`}
            playsInline
            autoPlay
            muted
          />
          <canvas ref={canvasRef} className="hidden" />

          {/* Loading Indicator while camera spins up */}
          {isCameraStarting && !isCameraActive && !cameraError && (
            <div className="flex flex-col items-center justify-center gap-2 text-stone-400">
              <RefreshCw className="w-7 h-7 text-amber-400 animate-spin" />
              <span className="text-xs font-bold text-stone-300">Inawasha kamera...</span>
            </div>
          )}

          {/* Viewfinder Target Reticle with Animated Laser Line */}
          {isCameraActive && !scannedCode && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="w-44 h-44 sm:w-48 sm:h-48 border-2 border-amber-400/80 rounded-2xl relative shadow-[0_0_0_9999px_rgba(0,0,0,0.55)]">
                {/* 4 Corner Markers */}
                <span className="absolute -top-1 -left-1 w-4 h-4 border-t-3 border-l-3 border-amber-400 rounded-tl" />
                <span className="absolute -top-1 -right-1 w-4 h-4 border-t-3 border-r-3 border-amber-400 rounded-tr" />
                <span className="absolute -bottom-1 -left-1 w-4 h-4 border-b-3 border-l-3 border-amber-400 rounded-bl" />
                <span className="absolute -bottom-1 -right-1 w-4 h-4 border-b-3 border-r-3 border-amber-400 rounded-br" />

                {/* Animated Horizontal Laser Scan Bar */}
                <div className="absolute left-2 right-2 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent shadow-[0_0_8px_#f59e0b] animate-[bounce_2s_infinite]" />

                {/* Live Floating Guide */}
                <div className="absolute -bottom-8 left-0 right-0 text-center">
                  <span className="text-[10px] font-bold text-amber-300 bg-stone-950/85 px-2.5 py-0.5 rounded-full border border-amber-500/30 whitespace-nowrap shadow-sm">
                    ⚡ Inasoma kiotomatiki mara moja
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Scanned Success Overlay */}
          {scannedCode && (
            <div className="absolute inset-0 bg-stone-950/95 flex flex-col items-center justify-center p-4 text-center space-y-2 animate-in zoom-in-95 duration-150 z-30">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/40">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h4 className="text-xs font-black text-white uppercase tracking-wider">
                Vocha Imesomwa!
              </h4>
              <span className="text-2xl font-mono font-black text-amber-400 bg-stone-900 px-4 py-1.5 rounded-xl border border-stone-800">
                {scannedCode}
              </span>
              <p className="text-[10px] text-stone-400">
                Inakuunganisha kwenye mtandao kiotomatiki...
              </p>
            </div>
          )}

          {/* Error / Fallback View (inside viewfinder so no layout shift) */}
          {cameraError && !isCameraActive && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-4 bg-stone-950/95 text-center space-y-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto border border-amber-500/30">
                <AlertCircle className="w-5 h-5" />
              </div>
              <p className="text-[11px] text-stone-300 leading-snug font-medium max-w-[270px]">
                {cameraError}
              </p>

              <div className="flex flex-col gap-1.5 w-full max-w-[240px] pt-1">
                <button
                  type="button"
                  onClick={startCamera}
                  className="w-full py-2 px-3 bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-xs rounded-xl shadow-xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Washa Kamera / Jaribu Tena</span>
                </button>

                {isInIframe && (
                  <a
                    href={typeof window !== 'undefined' ? window.location.href : '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-1.5 px-3 bg-stone-850 hover:bg-stone-750 text-stone-200 text-[10px] font-bold rounded-xl transition-colors inline-flex items-center justify-center gap-1 border border-stone-700"
                  >
                    <ExternalLink className="w-3 h-3 text-amber-400" />
                    <span>Fungua Tab Mpya (Ruhusu Kamera)</span>
                  </a>
                )}

                <button
                  type="button"
                  onClick={() => fileUploadInputRef.current?.click()}
                  className="w-full py-1.5 px-3 bg-stone-850 hover:bg-stone-750 text-stone-300 text-[10px] font-bold rounded-xl transition-colors inline-flex items-center justify-center gap-1 border border-stone-700 cursor-pointer"
                >
                  <Upload className="w-3 h-3 text-stone-400" />
                  <span>Pakia Picha ya Vocha</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Compact Bottom Controls: Manual input & Quick Test Chips */}
        <div className="p-3 bg-stone-850 border-t border-stone-800 space-y-2.5">
          {/* Controls Bar: Switch Lens / Upload */}
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => fileUploadInputRef.current?.click()}
              className="flex-1 py-1.5 px-2 bg-stone-800 hover:bg-stone-700 text-stone-300 text-[11px] font-bold rounded-xl transition-colors inline-flex items-center justify-center gap-1.5 cursor-pointer border border-stone-700"
            >
              <Upload className="w-3.5 h-3.5 text-amber-400" />
              <span>Pakia Picha ya Vocha</span>
            </button>

            {isCameraActive && (
              <button
                type="button"
                onClick={() => setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'))}
                className="py-1.5 px-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-[11px] font-bold cursor-pointer transition-colors border border-stone-700 flex items-center gap-1"
                title="Geuza Kamera Mbele/Nyuma"
              >
                <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
                <span>Geuza</span>
              </button>
            )}
          </div>

          {/* Manual Input Row */}
          <div className="pt-2 border-t border-stone-800">
            <div className="flex gap-1.5">
              <input
                type="text"
                value={manualCodeInput}
                onChange={(e) => setManualCodeInput(e.target.value)}
                placeholder="Au andika namba (mfano: 9482)"
                className="flex-1 px-3 py-1.5 bg-stone-900 border border-stone-700 rounded-xl text-center font-mono font-bold text-amber-400 text-xs focus:outline-none focus:border-amber-500 placeholder:font-sans placeholder:text-stone-500 placeholder:text-[10px]"
                maxLength={10}
              />
              <button
                type="button"
                disabled={!manualCodeInput.trim()}
                onClick={() => handleFoundCode(manualCodeInput.trim())}
                className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-stone-950 font-black text-xs rounded-xl cursor-pointer flex items-center gap-1 transition-colors shrink-0"
              >
                <span>Weka</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Quick 1-Click Sample Chips */}
          <div className="pt-2 border-t border-stone-800 flex items-center justify-between gap-1.5">
            <span className="text-[9px] text-stone-400 uppercase font-black shrink-0">
              Majaribio:
            </span>
            <div className="flex items-center gap-1.5 flex-1 justify-end">
              {[
                { code: '9482', label: 'Saa 24' },
                { code: '5120', label: 'Wiki 1' },
                { code: '8841', label: 'Mwezi 1' },
              ].map((item) => (
                <button
                  key={item.code}
                  type="button"
                  onClick={() => handleFoundCode(item.code)}
                  className="py-1 px-2 bg-stone-900 hover:bg-amber-500 hover:text-stone-950 text-amber-400 font-mono font-bold text-[10px] rounded-lg border border-stone-700/80 transition-all cursor-pointer flex items-center gap-1"
                >
                  <span className="text-stone-400 font-sans text-[8px]">{item.label}:</span>
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
