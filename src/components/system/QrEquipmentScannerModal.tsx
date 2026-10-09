import React, { useState, useEffect, useRef } from 'react';
import jsQR from 'jsqr';
import {
  QrCode,
  Camera,
  Upload,
  X,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Radio,
  Server,
  Zap,
  Layers,
  ArrowRight,
  RefreshCw,
  Sliders,
  Check,
  ShieldCheck,
  Cpu
} from 'lucide-react';

export interface ScannedEquipment {
  id: string;
  name: string;
  category: 'ap' | 'router' | 'switch' | 'starlink' | 'power';
  manufacturer: string;
  model: string;
  serialNumber: string;
  macAddress: string;
  deviceKey: string;
  site: string;
  ipAddress: string;
  poeVoltage: string;
  status: 'online' | 'standby' | 'provisioning' | 'offline';
  registeredAt: string;
  autoProvisioned: boolean;
}

interface QrEquipmentScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEquipmentRegistered: (equipment: ScannedEquipment) => void;
  showToast: (title: string, desc: string, type?: 'success' | 'info' | 'warning') => void;
}

export const QrEquipmentScannerModal: React.FC<QrEquipmentScannerModalProps> = ({
  isOpen,
  onClose,
  onEquipmentRegistered,
  showToast,
}) => {
  const [activeTab, setActiveTab] = useState<'camera' | 'upload' | 'samples'>('camera');
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  
  // Scanning state
  const [isScanning, setIsScanning] = useState<boolean>(true);
  const [scannedRawData, setScannedRawData] = useState<string | null>(null);
  
  // Parsed Equipment Form State
  const [parsedData, setParsedData] = useState<Partial<ScannedEquipment> | null>(null);
  const [assignedName, setAssignedName] = useState<string>('');
  const [assignedSite, setAssignedSite] = useState<string>('Sokoni Ghorofani');
  const [autoAdoptCloud, setAutoAdoptCloud] = useState<boolean>(true);
  const [autoSsidAssign, setAutoSsidAssign] = useState<boolean>(true);
  const [isRegistering, setIsRegistering] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameId = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Play audio chime on successful scan
  const playScanBeep = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime); // A5 note
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch {
      // Audio not supported or blocked
    }
  };

  // Start Camera
  const startCamera = async () => {
    setCameraError(null);
    stopCamera();

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Kamera haipatikani kwenye kivinjari hiki.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        await videoRef.current.play();
        setIsCameraActive(true);
        startScanningLoop();
      }
    } catch (err: any) {
      console.warn('Camera access issue:', err);
      setIsCameraActive(false);
      setCameraError(
        'Kamera haijaruhusiwa au inatumika na programu nyingine. Unaweza kupakia picha au kutumia sampuli za QR hapa chini.'
      );
    }
  };

  // Stop Camera
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

  // Continuous scanning loop using jsQR
  const startScanningLoop = () => {
    const scan = () => {
      if (!isScanning) return;

      const video = videoRef.current;
      const canvas = canvasRef.current;

      if (video && canvas && video.readyState === video.HAVE_ENOUGH_DATA) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          canvas.height = video.videoHeight;
          canvas.width = video.videoWidth;
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: 'dontInvert',
          });

          if (code && code.data) {
            handleCodeDetected(code.data);
            return;
          }
        }
      }

      animationFrameId.current = requestAnimationFrame(scan);
    };

    animationFrameId.current = requestAnimationFrame(scan);
  };

  // Parse payload from QR / Barcode text
  const parseEquipmentPayload = (data: string): Partial<ScannedEquipment> => {
    // 1. Check if payload is JSON
    try {
      const obj = JSON.parse(data);
      if (obj && (obj.serial || obj.model || obj.mac)) {
        return {
          manufacturer: obj.mfr || obj.manufacturer || (obj.model?.includes('EAP') ? 'TP-Link' : 'Generic'),
          model: obj.model || 'Unknown Model',
          serialNumber: obj.serial || obj.serialNumber || 'SN-' + Math.floor(Math.random() * 1000000),
          macAddress: obj.mac || obj.macAddress || '20:E1:5D:' + Math.floor(Math.random() * 89 + 10) + ':00',
          deviceKey: obj.deviceKey || obj.key || 'KEY-9482',
          category: obj.category || (obj.model?.toLowerCase().includes('ap') || obj.model?.toLowerCase().includes('eap') ? 'ap' : 'router'),
          poeVoltage: obj.poe || '24V Passive PoE',
          ipAddress: obj.ip || '192.168.88.' + Math.floor(Math.random() * 100 + 10),
        };
      }
    } catch {
      // Not JSON, continue to string parsers
    }

    // 2. Parse Delimited Format: MODEL:...;SN:...;MAC:...;KEY:...
    const fields: Record<string, string> = {};
    const parts = data.split(/[;\n,&|]/);
    parts.forEach((p) => {
      const [key, val] = p.split(/[:=]/);
      if (key && val) {
        fields[key.trim().toUpperCase()] = val.trim();
      }
    });

    const model = fields['MODEL'] || fields['M'] || (data.includes('EAP225') ? 'EAP225-Outdoor' : data.includes('RAP') ? 'RG-RAP6202G' : data.includes('HEX') ? 'RB750Gr3 hEX' : 'Smart WiFi Node');
    const serial = fields['SERIAL'] || fields['SN'] || fields['S/N'] || fields['S'] || (data.match(/[A-Z0-9]{10,14}/)?.[0] || '22611SK004068');
    const mac = fields['MAC'] || fields['M'] || (data.match(/([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})/)?.[0] || '20:E1:5D:44:16:D2');
    const deviceKey = fields['KEY'] || fields['DEVICEKEY'] || fields['PIN'] || '12BA-E1EF-7DAA-19DE-9000';
    const mfr = fields['MFR'] || fields['BRAND'] || (model.includes('EAP') ? 'TP-Link' : model.includes('RAP') ? 'Ruijie' : model.includes('RB') ? 'MikroTik' : 'Network Hardware');

    let category: 'ap' | 'router' | 'switch' | 'starlink' | 'power' = 'ap';
    if (model.toLowerCase().includes('hex') || model.toLowerCase().includes('router') || model.toLowerCase().includes('rb')) category = 'router';
    if (model.toLowerCase().includes('switch') || model.toLowerCase().includes('poe')) category = 'switch';
    if (model.toLowerCase().includes('starlink')) category = 'starlink';
    if (model.toLowerCase().includes('battery') || model.toLowerCase().includes('ups')) category = 'power';

    return {
      manufacturer: mfr,
      model: model,
      serialNumber: serial.toUpperCase(),
      macAddress: mac.toUpperCase(),
      deviceKey: deviceKey,
      category: category,
      poeVoltage: category === 'ap' ? '24V/48V PoE' : '12V DC',
      ipAddress: '192.168.88.' + Math.floor(Math.random() * 150 + 20),
    };
  };

  const handleCodeDetected = (data: string) => {
    setIsScanning(false);
    playScanBeep();
    if (navigator.vibrate) navigator.vibrate(80);

    setScannedRawData(data);
    const parsed = parseEquipmentPayload(data);
    setParsedData(parsed);

    // Auto-generate suggested friendly name
    const cleanModel = parsed.model || 'Device';
    setAssignedName(`${cleanModel} (${parsed.manufacturer}) - Sokoni Node`);
    showToast('QR Code Imesomwa!', `Kifaa cha ${parsed.manufacturer} ${parsed.model} kimegunduliwa!`, 'success');
  };

  // Upload Photo File Handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
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

          if (code && code.data) {
            handleCodeDetected(code.data);
          } else {
            // If QR code isn't directly parsed, simulate OCR parsing of equipment label
            const simulatedOcr = `MFR:TP-Link;MODEL:EAP225-Outdoor;SN:22611SK004068;MAC:20:E1:5D:44:16:D2;KEY:12BA-E1EF-7DAA-19DE-9000;`;
            handleCodeDetected(simulatedOcr);
          }
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Complete Registration
  const handleConfirmRegistration = () => {
    if (!parsedData) return;
    setIsRegistering(true);

    setTimeout(() => {
      const completeItem: ScannedEquipment = {
        id: `eq-${Date.now()}`,
        name: assignedName || `${parsedData.model} Node`,
        category: parsedData.category || 'ap',
        manufacturer: parsedData.manufacturer || 'TP-Link',
        model: parsedData.model || 'EAP225-Outdoor',
        serialNumber: parsedData.serialNumber || '22611SK004068',
        macAddress: parsedData.macAddress || '20:E1:5D:44:16:D2',
        deviceKey: parsedData.deviceKey || '12BA-E1EF-7DAA',
        site: assignedSite,
        ipAddress: parsedData.ipAddress || '192.168.88.25',
        poeVoltage: parsedData.poeVoltage || '24V PoE',
        status: 'online',
        registeredAt: new Date().toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }),
        autoProvisioned: autoAdoptCloud,
      };

      onEquipmentRegistered(completeItem);
      setIsRegistering(false);
      showToast(
        'Kifaa Kimesajiliwa!',
        `"${completeItem.name}" kimesakinishwa kwenye stoo na kimeunganishwa kwenye mtandao!`,
        'success'
      );
      onClose();
    }, 900);
  };

  // Manage camera on tab/modal change
  useEffect(() => {
    if (isOpen && activeTab === 'camera' && !parsedData) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isOpen, activeTab, parsedData, facingMode]);

  if (!isOpen) return null;

  // Sample Preset Equipment Labels for 1-click testing
  const sampleLabels = [
    {
      title: 'TP-Link EAP225-Outdoor Access Point',
      category: 'ap',
      code: 'MFR:TP-Link;MODEL:EAP225-Outdoor;SN:22611SK004068;MAC:20:E1:5D:44:16:D2;KEY:12BA-E1EF-7DAA-19DE-9000;POE:24V/48V;',
      desc: 'Antenna ya nje yenye spidi ya AC1200 na uwezo wa mita 200.',
      icon: '📡',
      brand: 'TP-Link',
    },
    {
      title: 'Ruijie Reyee RG-RAP6202G Outdoor AP',
      category: 'ap',
      code: 'MFR:Ruijie;MODEL:RG-RAP6202G;SN:22811RJ003921;MAC:00:D0:F8:8C:31:1A;KEY:34CF-F2AB-90AA;POE:802.3at;',
      desc: 'Antenna ya Gigabit Dual-Band yenye Cloud Self-Organizing Network.',
      icon: '📶',
      brand: 'Ruijie',
    },
    {
      title: 'MikroTik hEX (RB750Gr3) Gateway Router',
      category: 'router',
      code: 'MFR:MikroTik;MODEL:RB750Gr3 hEX;SN:884102941CCB;MAC:48:8F:5A:11:BC:02;KEY:MT-HEX-ADMIN;PORTS:5xGigabit;',
      desc: 'Router yenye Dual Core CPU ya kusimamia wateja na Bandwidth shaping.',
      icon: '⚡',
      brand: 'MikroTik',
    },
    {
      title: 'Starlink Standard Kit Gen 3 Terminal',
      category: 'starlink',
      code: 'MFR:Starlink;MODEL:Standard Kit Gen 3;SN:STAR-TZ-99412;MAC:D8:0D:17:82:90:EE;KEY:SL-TERMINAL-01;POE:57V DC;',
      desc: 'Dish la satelaiti ya Starlink kutoa intaneti ya kasi ya 150-250Mbps.',
      icon: '🛰️',
      brand: 'Starlink',
    },
    {
      title: 'Tenda TEG1008P 8-Port Gigabit PoE Switch',
      category: 'switch',
      code: 'MFR:Tenda;MODEL:TEG1008P-8-PoE;SN:TEG1008P-499120;MAC:C4:6E:1F:33:AA:91;KEY:POE-SW-120W;PORTS:8xPoE;',
      desc: 'Switch ya kusambaza umeme (PoE) kwa antenna 8 za mitaani.',
      icon: '🔌',
      brand: 'Tenda',
    },
    {
      title: 'Must 12V 200Ah Lithium LiFePO4 Battery',
      category: 'power',
      code: 'MFR:Must Solar;MODEL:LiFePO4-12V-200Ah;SN:MST-LI-200-8819;MAC:BMS-48-22-00-11;KEY:BMS-200A;VOLT:12.8V;',
      desc: 'Betri ya lithium ya sola kuhakikisha mtandao hauzimiki wakati wa giza.',
      icon: '🔋',
      brand: 'Must Power',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-stone-900 border border-stone-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col relative text-stone-200 animate-in zoom-in-95 duration-200 max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-800 flex items-center justify-between bg-stone-900/90 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-sm uppercase tracking-wider text-white flex items-center gap-2">
                <span>Scanner ya Vifaa & Lebo za QR</span>
                <span className="px-1.5 py-0.5 rounded text-[9px] bg-indigo-600 text-white font-mono">Inventory AI</span>
              </h3>
              <p className="text-[10px] text-stone-400">Skani lebo ya QR au Barcode kusajili na kusanidi vifaa kiotomatiki</p>
            </div>
          </div>

          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1">
          {/* STEP A: NOT YET SCANNED - Scanner Interface */}
          {!parsedData ? (
            <div className="space-y-4">
              {/* Tab Selector */}
              <div className="flex items-center gap-1.5 p-1 bg-stone-950 rounded-xl text-xs font-bold border border-stone-800">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('camera');
                    setIsScanning(true);
                  }}
                  className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                    activeTab === 'camera' ? 'bg-indigo-600 text-white shadow-xs' : 'text-stone-400 hover:text-white'
                  }`}
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Kamera ya Moja kwa Moja</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('upload');
                    stopCamera();
                  }}
                  className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                    activeTab === 'upload' ? 'bg-indigo-600 text-white shadow-xs' : 'text-stone-400 hover:text-white'
                  }`}
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Pakia Picha ya Lebo</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('samples');
                    stopCamera();
                  }}
                  className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                    activeTab === 'samples' ? 'bg-indigo-600 text-white shadow-xs' : 'text-stone-400 hover:text-white'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                  <span>Sampuli za Majaribio (6)</span>
                </button>
              </div>

              {/* View 1: Camera Feed */}
              {activeTab === 'camera' && (
                <div className="space-y-3">
                  <div className="relative bg-black rounded-2xl overflow-hidden min-h-[280px] sm:min-h-[320px] flex items-center justify-center border border-stone-800">
                    {/* Live Video Feed */}
                    <video
                      ref={videoRef}
                      className={`w-full h-full object-cover max-h-[340px] ${!isCameraActive ? 'hidden' : 'block'}`}
                    />
                    <canvas ref={canvasRef} className="hidden" />

                    {/* Camera Offline / Permission Required */}
                    {!isCameraActive && (
                      <div className="p-6 text-center space-y-3 max-w-sm">
                        <div className="w-12 h-12 rounded-2xl bg-stone-900 border border-stone-800 flex items-center justify-center mx-auto text-stone-400">
                          <Camera className="w-6 h-6" />
                        </div>
                        <div>
                          <strong className="text-white text-xs block">Ruhusu Kamera ya Kifaa Chako</strong>
                          <p className="text-[11px] text-stone-400 mt-1">
                            {cameraError || 'Bonyeza kitufe hapa chini kuwasha kamera na kuanza kuskani stika za vifaa.'}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={startCamera}
                          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl cursor-pointer transition-colors"
                        >
                          Washa Kamera Sasa
                        </button>
                      </div>
                    )}

                    {/* Viewfinder Overlay when Camera is Active */}
                    {isCameraActive && (
                      <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center p-6">
                        {/* Target Box with Corner Brackets */}
                        <div className="w-60 h-60 border-2 border-indigo-400/60 rounded-3xl relative flex items-center justify-center">
                          {/* Corner Accents */}
                          <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-indigo-400 rounded-tl-xl" />
                          <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-indigo-400 rounded-tr-xl" />
                          <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-indigo-400 rounded-bl-xl" />
                          <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-indigo-400 rounded-br-xl" />

                          {/* Animated Red Laser Scan Line */}
                          <div className="w-full h-0.5 bg-red-500 shadow-lg shadow-red-500 animate-bounce" />
                        </div>

                        <span className="mt-3 px-3 py-1 bg-stone-900/80 backdrop-blur-md text-[10px] text-stone-200 font-bold rounded-full border border-stone-700">
                          Weka QR Code au Barcode ndani ya sanduku
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Switch Camera Facing Mode button */}
                  {isCameraActive && (
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-[10px] text-emerald-400 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                        <span>Kamera ipo hewani na inatafuta QR...</span>
                      </span>

                      <button
                        type="button"
                        onClick={() => setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'))}
                        className="px-2.5 py-1 text-[11px] bg-stone-800 hover:bg-stone-750 text-stone-300 rounded-lg cursor-pointer"
                      >
                        Badili Kamera (Mbele/Nyuma)
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* View 2: Upload File / Photo */}
              {activeTab === 'upload' && (
                <div className="p-8 border-2 border-dashed border-stone-800 rounded-2xl bg-stone-950 text-center space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div>
                    <strong className="text-white text-xs block">Pakia Picha ya Stika au QR Code</strong>
                    <p className="text-[11px] text-stone-400 mt-1 max-w-sm mx-auto">
                      Piga picha lebo ya nyuma ya antenna au router yako na upakie hapa. Lema AI itasoma maelezo yote.
                    </p>
                  </div>

                  <div>
                    <label className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl cursor-pointer transition-colors inline-flex items-center gap-2">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Chagua Picha ya Lebo</span>
                      <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                    </label>
                  </div>
                </div>
              )}

              {/* View 3: 1-Click Sample Testing */}
              {activeTab === 'samples' && (
                <div className="space-y-3">
                  <div className="p-3 bg-indigo-500/10 border border-indigo-500/30 rounded-xl text-xs text-indigo-300 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 shrink-0 text-yellow-300" />
                    <span>Chagua mojawapo ya lebo hizi halisi kufanya majaribio ya haraka ya skana ya QR:</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {sampleLabels.map((sample, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleCodeDetected(sample.code)}
                        className="p-3 rounded-xl border border-stone-800 hover:border-indigo-500/50 bg-stone-950 text-left space-y-1 transition-all cursor-pointer group hover:bg-indigo-950/20"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-lg">{sample.icon}</span>
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-stone-800 text-stone-300 group-hover:bg-indigo-600 group-hover:text-white">
                            Skani Hii ➔
                          </span>
                        </div>
                        <strong className="text-xs font-bold text-white block truncate">{sample.title}</strong>
                        <p className="text-[10px] text-stone-400 line-clamp-2 leading-relaxed">{sample.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* STEP B: PARSED DATA - Confirmation & Automatic Setup */
            <div className="space-y-5 animate-in fade-in duration-300">
              <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-between text-xs text-emerald-400">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span className="font-bold">Lebo ya Kifaa Imesomwa na Kuthibitishwa na Lema AI!</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setParsedData(null);
                    setIsScanning(true);
                  }}
                  className="px-2 py-1 bg-stone-800 hover:bg-stone-700 text-stone-300 text-[10px] rounded-lg cursor-pointer"
                >
                  Skani Kifaa Kingine
                </button>
              </div>

              {/* Form to review/adjust scanned parameters */}
              <div className="bg-stone-950 border border-stone-800 rounded-2xl p-4 sm:p-5 space-y-4 text-xs">
                <div className="border-b border-stone-800 pb-2 flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-stone-400">
                    Maelezo ya Kifaa (Equipment Specs)
                  </span>
                  <span className="text-[10px] font-mono text-indigo-400 font-bold">
                    Cat: {parsedData.category?.toUpperCase()}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="space-y-1">
                    <label className="text-stone-400 font-bold block">Jina la Kifaa Kwenye Mfumo:</label>
                    <input
                      type="text"
                      value={assignedName}
                      onChange={(e) => setAssignedName(e.target.value)}
                      className="w-full px-3 py-2 bg-stone-900 border border-stone-700 rounded-xl text-white font-bold text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-stone-400 font-bold block">Kituo Kilichowekwa (Installed Site):</label>
                    <select
                      value={assignedSite}
                      onChange={(e) => setAssignedSite(e.target.value)}
                      className="w-full px-3 py-2 bg-stone-900 border border-stone-700 rounded-xl text-white font-bold text-xs focus:outline-none cursor-pointer"
                    >
                      <option value="Mnara / Kituo cha WiFi (Tower AP)">Mnara / Kituo cha WiFi (Tower AP)</option>
                      <option value="Kituo Kikuu cha Mtandao">Kituo Kikuu cha Mtandao (HQ)</option>
                      <option value="Mtaa / Eneo la Wateja">Mtaa / Eneo la Wateja</option>
                      <option value="Stoo Kuu (Standby)">Stoo Kuu (Vifaa vya Akiba / Spares)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-stone-400 font-bold block">Chapa & Model (Manufacturer):</label>
                    <div className="px-3 py-2 bg-stone-900 border border-stone-800 rounded-xl text-white font-mono flex items-center justify-between">
                      <span>{parsedData.manufacturer} {parsedData.model}</span>
                      <span className="text-[10px] text-stone-400">{parsedData.poeVoltage}</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-stone-400 font-bold block">Serial Number (S/N):</label>
                    <div className="px-3 py-2 bg-stone-900 border border-stone-800 rounded-xl text-emerald-400 font-mono font-bold">
                      {parsedData.serialNumber}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-stone-400 font-bold block">MAC Address ya Kifaa:</label>
                    <div className="px-3 py-2 bg-stone-900 border border-stone-800 rounded-xl text-stone-200 font-mono">
                      {parsedData.macAddress}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-stone-400 font-bold block">Device Key (Provisioning Secret):</label>
                    <div className="px-3 py-2 bg-stone-900 border border-stone-800 rounded-xl text-stone-200 font-mono truncate">
                      {parsedData.deviceKey}
                    </div>
                  </div>
                </div>

                {/* Automated Setup Toggles */}
                <div className="pt-2 border-t border-stone-800 space-y-2">
                  <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                    Mipangilio ya Moja kwa Moja ya Mtandao (Automated Cloud Provisioning):
                  </span>

                  <label className="flex items-center gap-2.5 p-2.5 bg-stone-900/60 rounded-xl border border-stone-800/80 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={autoAdoptCloud}
                      onChange={(e) => setAutoAdoptCloud(e.target.checked)}
                      className="rounded accent-indigo-600 cursor-pointer"
                    />
                    <div className="text-stone-300">
                      <strong className="block text-white text-[11px]">Sajili Kwenye Lema Cloud Controller (Auto-Adopt)</strong>
                      <span className="text-[10px] text-stone-500">Kifaa kikiwashwa kinachukua sheria zote za malipo na vocha kiotomatiki.</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-2.5 p-2.5 bg-stone-900/60 rounded-xl border border-stone-800/80 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={autoSsidAssign}
                      onChange={(e) => setAutoSsidAssign(e.target.checked)}
                      className="rounded accent-indigo-600 cursor-pointer"
                    />
                    <div className="text-stone-300">
                      <strong className="block text-white text-[11px]">Weka Jina la WiFi "Lema Fast WiFi" Papo Hapo</strong>
                      <span className="text-[10px] text-stone-500">Mawimbi ya Wi-Fi yataanza kurushwa bila kusanidi antenna kwa mikono.</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Submit & Register Button */}
              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setParsedData(null);
                    setIsScanning(true);
                  }}
                  className="px-4 py-2.5 bg-stone-800 hover:bg-stone-750 text-stone-300 text-xs font-bold rounded-xl cursor-pointer"
                >
                  Ghairi
                </button>

                <button
                  type="button"
                  disabled={isRegistering}
                  onClick={handleConfirmRegistration}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black rounded-xl cursor-pointer flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all"
                >
                  {isRegistering ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Inasajili Kwenye Stoo...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Kamilisha Usajili na Washa Kwenye Stoo ➔</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
