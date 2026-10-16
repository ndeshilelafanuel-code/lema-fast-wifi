import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
  Smartphone,
  QrCode,
  Gift,
  RotateCw,
  MessageSquare,
  ChevronRight,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  SlidersHorizontal
} from 'lucide-react';

interface VoiceGuideStep {
  id: number;
  title: string;
  badge: string;
  badgeColor: string;
  icon: React.ReactNode;
  summary: string;
  details: string[];
  speechText: string;
  actionTab?: 'mobile-stk' | 'voucher' | 'reconnect' | 'trial';
  actionLabel?: string;
}

interface VoiceGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTab?: (tab: 'mobile-stk' | 'voucher' | 'reconnect' | 'trial') => void;
  supportPhone?: string;
  hotspotName?: string;
}

export const VoiceGuideModal: React.FC<VoiceGuideModalProps> = ({
  isOpen,
  onClose,
  onSelectTab,
  supportPhone = '0653 578 184',
  hotspotName = 'LEMA FAST WiFi',
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speechRate, setSpeechRate] = useState<number>(0.92); // 0.85 = polepole, 0.92 = kawaida, 1.05 = haraka
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const steps: VoiceGuideStep[] = [
    {
      id: 1,
      title: 'Hatua ya 1: Jinsi ya Kulipia kwa Simu (Mobile Money)',
      badge: 'Lipa Simu',
      badgeColor: 'bg-amber-500 text-stone-950',
      icon: <Smartphone className="w-5 h-5 text-amber-500" />,
      summary: 'Lipia moja kwa moja kwa M-Pesa, Mixx by Yas, Airtel au Halopesa.',
      details: [
        '1. Gusa kichupo cha kwanza cha "Lipa Simu".',
        '2. Chagua kifurushi chako: Saa 2 (Tsh 500), Siku 1 (Tsh 1,000), Wiki 1 (Tsh 5,000) au Mwezi 1.',
        '3. Gusa mtandao wako wa simu (Vodacom M-Pesa, Mixx by Yas, Airtel, au Halopesa).',
        '4. Andika namba yako ya simu ya kulipia kisha bonyeza "LIPA NA UNGANISHA".',
        '5. Ujumbe wa USSD utatokea kwenye simu yako; weka PIN yako ya siri ya mtandao kuthibitisha. Mtandao utawaka papo hapo bila nenosiri!',
      ],
      speechText:
        'Hatua ya kwanza: Kulipia kwa simu kupitia M-Pesa, Mixx by Yas, Airtel Money, au Halopesa. Kwanza, gusa kichupo cha Lipa Simu. Pili, chagua kifurushi unachotaka, kama vile Saa mbili, Siku moja, Wiki moja, au Mwezi mzima. Tatu, gusa mtandao wako wa simu, na uandike namba yako ya simu. Nne, bonyeza kitufe kikubwa cha Lipa na Unganisha. Ujumbe wa namba ya siri utatokea kwenye kioo cha simu yako; weka PIN yako ya mtandao kuthibitisha. Ukishaweka PIN, mtandao utawaka kiotomatiki bila kuhitaji nenosiri!',
      actionTab: 'mobile-stk',
      actionLabel: 'Nenda Kwenye Lipa Simu',
    },
    {
      id: 2,
      title: 'Hatua ya 2: Jinsi ya Kutumia Vocha ya Karatasi au QR Code',
      badge: 'Vocha ya QR',
      badgeColor: 'bg-sky-500 text-white',
      icon: <QrCode className="w-5 h-5 text-sky-500" />,
      summary: 'Scan QR code ya vocha kwa kamera au andika namba 4 za vocha.',
      details: [
        '1. Gusa kichupo cha pili cha "Vocha".',
        '2. Njia ya haraka: Gusa kitufe cha "SCAN VOCHA KWA KAMERA" na uelekeze kamera kwenye QR Code ya vocha yako. Mfumo utasoma na kukuunganisha kiotomatiki bila kupiga picha!',
        '3. Njia ya pili: Andika tarakimu za namba ya vocha kwenye kisanduku kisha gusa "UNGANISHA VOCHA SASA".',
        '4. Vocha za karatasi zinapatikana maduka na vibanda vyote vya mtaani.',
      ],
      speechText:
        'Hatua ya pili: Kutumia vocha ya karatasi uliyonunua dukani au kibandani. Kwanza, gusa kichupo cha pili kilichoandikwa Vocha. Kama una risiti yenye msimbo wa QR, gusa kitufe cha Scan Vocha kwa Kamera. Elekeza kamera yako kwenye msimbo wa QR, na kamera itasoma kiotomatiki papo hapo bila haja ya kupiga picha. Au kama huna QR, andika tarakimu za namba ya vocha kwenye kisanduku, kisha bonyeza Unganisha Vocha Sasa.',
      actionTab: 'voucher',
      actionLabel: 'Nenda Kwenye Vocha',
    },
    {
      id: 3,
      title: 'Hatua ya 3: Kujaribu Mtandao Bure (Majaribio ya Dk 5)',
      badge: 'Bure Kabisa',
      badgeColor: 'bg-emerald-500 text-stone-950',
      icon: <Gift className="w-5 h-5 text-emerald-500" />,
      summary: 'Pima kasi na ubora wa Fiber & Starlink kabla ya kununua kifurushi.',
      details: [
        '1. Kama ni mara yako ya kwanza leo, gusa kitufe cha "Dk 5 Bure" au kichupo cha "Bure".',
        '2. Bonyeza "ANZA MAJARIBIO YA BURE".',
        '3. Kifaa chako kitaunganishwa papo hapo kwa kasi ya juu ya 20 Mbps kwa dakika tano bila malipo yoyote!',
      ],
      speechText:
        'Hatua ya tatu: Kujaribu mtandao bure kabla ya kulipia. Kama unataka kupima spidi na ubora wa mtandao wetu, gusa kitufe cha Dk 5 Bure hapo juu, au kichupo cha Bure. Bonyeza Anza Majaribio ya Bure, na simu yako itaunganishwa papo hapo kwa kasi kubwa ya megabaiti 20 kwa sekunde!',
      actionTab: 'trial',
      actionLabel: 'Jaribu Mtandao Bure',
    },
    {
      id: 4,
      title: 'Hatua ya 4: Jinsi ya Kurudisha Mtandao Ukikatika (Rudisha SMS)',
      badge: 'Rudisha Bando',
      badgeColor: 'bg-purple-500 text-white',
      icon: <RotateCw className="w-5 h-5 text-purple-400" />,
      summary: 'Rudisha bando lako bila kulipa tena ukitumia namba ya SMS ya malipo.',
      details: [
        '1. Ikiwa ulikwisha lipia kifurushi lakini simu ikazima au mtandao ukatoka, usilipe tena!',
        '2. Gusa kichupo cha "Rudisha SMS".',
        '3. Andika namba ya kumbukumbu ya muamala (Transaction ID / Reference) kutoka kwenye SMS ya M-Pesa, Mixx, au Airtel.',
        '4. Bonyeza "RECONNECT", na intaneti yako itarudi mara moja.',
      ],
      speechText:
        'Hatua ya nne: Kurudisha mtandao ukikatika. Kama ulikwisha lipia bando lakini simu ikazima au intaneti ikakatika, huna haja ya kulipa tena. Gusa kichupo cha Rudisha SMS, weka namba ya kumbukumbu ya muamala uliyoipokea kwenye ujumbe wa SMS wa simu yako, kisha bonyeza Reconnect. Mtandao wako utarudi papo hapo!',
      actionTab: 'reconnect',
      actionLabel: 'Nenda Kwenye Rudisha SMS',
    },
    {
      id: 5,
      title: 'Hatua ya 5: Msaada wa Papo Hapo wa WhatsApp (Masaa 24/7)',
      badge: 'Msaada 24/7',
      badgeColor: 'bg-emerald-600 text-white',
      icon: <MessageSquare className="w-5 h-5 text-emerald-400" />,
      summary: 'Msaada wa haraka, nakala ya risiti, au msaada wa fundi.',
      details: [
        `1. Wasiliana nasi wakati wowote kwa namba: ${supportPhone}.`,
        '2. Gusa kitufe cha kijani cha "WhatsApp 24/7" kutuma ombi la msaada pamoja na taarifa za simu yako.',
        '3. Risiti ya vocha yako inatumwa moja kwa moja kwenye WhatsApp yako usipoteze.',
      ],
      speechText:
        `Hatua ya tano: Msaada wa wateja masaa 24. Ukikwama popote, gusa kitufe cha kijani cha WhatsApp, au piga simu namba ${supportPhone}. Utapata msaada wa haraka sana kutoka kwa wahudumu wetu. Asante kwa kuchagua ${hotspotName}!`,
    },
  ];

  const stopAudio = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
  };

  const speakText = (text: string, onDone?: () => void) => {
    stopAudio();
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    try {
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = 'sw-TZ';
      utter.rate = speechRate;
      utter.pitch = 1.02;

      // Select natural Swahili or clear voice if available in browser
      const voices = window.speechSynthesis.getVoices();
      const swahiliVoice = voices.find((v) => v.lang.startsWith('sw') || v.lang.includes('sw'));
      if (swahiliVoice) {
        utter.voice = swahiliVoice;
      }

      utter.onstart = () => setIsPlaying(true);
      utter.onend = () => {
        setIsPlaying(false);
        if (onDone) onDone();
      };
      utter.onerror = () => setIsPlaying(false);

      utteranceRef.current = utter;
      window.speechSynthesis.speak(utter);
    } catch {
      setIsPlaying(false);
    }
  };

  // Play a specific step
  const handlePlayStep = (index: number) => {
    setCurrentStepIndex(index);
    const step = steps[index];
    speakText(step.speechText);
  };

  // Play full tour starting from current step through all remaining steps
  const handlePlayFullTour = (startIdx = 0) => {
    let idx = startIdx;
    setCurrentStepIndex(idx);

    const playNext = (nextIdx: number) => {
      if (nextIdx >= steps.length) {
        setIsPlaying(false);
        return;
      }
      setCurrentStepIndex(nextIdx);
      speakText(steps[nextIdx].speechText, () => {
        // Short pause between steps
        setTimeout(() => {
          playNext(nextIdx + 1);
        }, 600);
      });
    };

    playNext(idx);
  };

  // Handle Play / Pause toggle
  const handleTogglePlay = () => {
    if (isPlaying) {
      stopAudio();
    } else {
      handlePlayStep(currentStepIndex);
    }
  };

  useEffect(() => {
    if (isOpen) {
      // Automatically start playing from Step 1 when modal opens
      const timer = setTimeout(() => {
        handlePlayStep(0);
      }, 400);
      return () => {
        clearTimeout(timer);
        stopAudio();
      };
    } else {
      stopAudio();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-stone-900 border border-stone-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-stone-900 via-stone-850 to-stone-900 border-b border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <Volume2 className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-black uppercase tracking-wider text-white">
                  Mwongozo wa Sauti (Hatua kwa Hatua)
                </h3>
                <span className="text-[9px] bg-amber-500/20 text-amber-300 font-bold px-1.5 py-0.2 rounded border border-amber-500/30">
                  Swahili
                </span>
              </div>
              <p className="text-[11px] text-stone-400 mt-0.5">
                Sikiliza jinsi ya kujiunga, kulipia au kuweka vocha hatua kwa hatua
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              stopAudio();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-stone-800 text-stone-300 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Audio Player Toolbar: Big Play/Pause, Soundwave Bars, and Speed Control */}
        <div className="px-4 py-3 bg-stone-950 border-b border-stone-800/80 flex items-center justify-between gap-3">
          {/* Play / Stop Button */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleTogglePlay}
              className={`py-2 px-3.5 rounded-xl font-black text-xs flex items-center gap-2 transition-all cursor-pointer shadow-md active:scale-95 ${
                isPlaying
                  ? 'bg-rose-500 hover:bg-rose-400 text-white'
                  : 'bg-amber-400 hover:bg-amber-300 text-stone-950'
              }`}
            >
              {isPlaying ? (
                <>
                  <Pause className="w-3.5 h-3.5 fill-current" />
                  <span>Sitisha Sauti</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Sikiliza Sasa</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => handlePlayFullTour(0)}
              className="py-2 px-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-[11px] font-bold transition-colors cursor-pointer border border-stone-700 flex items-center gap-1.5"
              title="Sikiliza Hatua Zote Mfululizo"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Anza Mwanzo</span>
            </button>
          </div>

          {/* Soundwave Animation while speaking */}
          <div className="flex items-center gap-1 h-6 px-3 bg-stone-900 rounded-xl border border-stone-800">
            {[40, 90, 60, 100, 70, 50, 85, 30].map((h, i) => (
              <span
                key={i}
                className={`w-1 rounded-full transition-all duration-150 ${
                  isPlaying ? 'bg-amber-400' : 'bg-stone-700'
                }`}
                style={{
                  height: isPlaying ? `${Math.max(6, (h * (0.5 + Math.random() * 0.5)) / 4)}px` : '4px',
                }}
              />
            ))}
            <span className="text-[10px] text-stone-400 font-mono ml-1.5">
              {isPlaying ? 'Inasoma...' : 'Tayari'}
            </span>
          </div>

          {/* Speed Selector (Kawaida / Polepole) */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => {
                const newRate = speechRate === 0.92 ? 0.8 : 0.92;
                setSpeechRate(newRate);
                if (isPlaying) {
                  stopAudio();
                  setTimeout(() => handlePlayStep(currentStepIndex), 100);
                }
              }}
              className="py-1 px-2 rounded-lg bg-stone-850 hover:bg-stone-800 text-stone-300 text-[10px] font-bold border border-stone-700 flex items-center gap-1 cursor-pointer"
              title="Badilisha kasi ya maongezi"
            >
              <SlidersHorizontal className="w-3 h-3 text-amber-400" />
              <span>{speechRate < 0.9 ? '🐢 Polepole' : '⚡ Kawaida'}</span>
            </button>
          </div>
        </div>

        {/* Step-by-Step Interactive Cards List */}
        <div className="p-4 overflow-y-auto space-y-3 flex-1 bg-stone-900/60">
          {steps.map((step, idx) => {
            const isCurrent = currentStepIndex === idx;

            return (
              <div
                key={step.id}
                onClick={() => handlePlayStep(idx)}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden ${
                  isCurrent
                    ? 'bg-gradient-to-r from-amber-500/15 via-amber-500/10 to-stone-850 border-amber-500 ring-2 ring-amber-500/40 shadow-lg'
                    : 'bg-stone-850/80 hover:bg-stone-800 border-stone-800 text-stone-300'
                }`}
              >
                {/* Active Indicator & Top Row */}
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                        isCurrent
                          ? 'bg-amber-500 text-stone-950 font-black shadow-xs'
                          : 'bg-stone-800 text-stone-400'
                      }`}
                    >
                      {step.icon}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span
                          className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${step.badgeColor}`}
                        >
                          {step.badge}
                        </span>
                        {isCurrent && isPlaying && (
                          <span className="text-[10px] font-bold text-amber-400 flex items-center gap-1 animate-pulse">
                            <Volume2 className="w-3 h-3" />
                            <span>Inasoma sasa...</span>
                          </span>
                        )}
                      </div>
                      <h4 className="text-xs sm:text-sm font-black text-white mt-0.5 leading-snug">
                        {step.title}
                      </h4>
                    </div>
                  </div>

                  {/* Play Single Step Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (isCurrent && isPlaying) {
                        stopAudio();
                      } else {
                        handlePlayStep(idx);
                      }
                    }}
                    className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 cursor-pointer transition-transform ${
                      isCurrent && isPlaying
                        ? 'bg-amber-400 text-stone-950 scale-105 shadow-md'
                        : 'bg-stone-800 hover:bg-stone-700 text-stone-300 border border-stone-700'
                    }`}
                    title="Sikiliza Hatua Hii"
                  >
                    {isCurrent && isPlaying ? (
                      <Pause className="w-3 h-3 fill-current" />
                    ) : (
                      <Play className="w-3 h-3 fill-current ml-0.5" />
                    )}
                  </button>
                </div>

                {/* Step Details Bullet Points */}
                <div className="pl-10 space-y-1 my-2">
                  {step.details.map((point, pIdx) => (
                    <div key={pIdx} className="flex items-start gap-1.5 text-[11px] text-stone-300 leading-relaxed font-medium">
                      <span className="text-amber-400 mt-1 shrink-0 font-bold">•</span>
                      <span>{point}</span>
                    </div>
                  ))}
                </div>

                {/* Direct Action Button (Takes User to the exact tab) */}
                {step.actionTab && onSelectTab && (
                  <div className="pl-10 pt-1 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        stopAudio();
                        onClose();
                        onSelectTab(step.actionTab!);
                      }}
                      className="inline-flex items-center gap-1.5 py-1 px-2.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold text-[10px] border border-amber-500/40 transition-colors cursor-pointer"
                    >
                      <span>{step.actionLabel || 'Nenda Hapo'}</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>

                    <span className="text-[10px] text-stone-500">
                      Gusa popote kusikiliza sauti
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="p-3 bg-stone-950 border-t border-stone-800 flex items-center justify-between text-[11px] text-stone-400">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Msaada wa Sauti wa LEMA FAST WiFi</span>
          </div>
          <button
            type="button"
            onClick={() => {
              stopAudio();
              onClose();
            }}
            className="py-1 px-3 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold transition-colors cursor-pointer"
          >
            Funga
          </button>
        </div>
      </div>
    </div>
  );
};
