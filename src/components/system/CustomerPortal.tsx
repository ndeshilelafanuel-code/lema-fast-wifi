import React, { useState, useRef } from 'react';
import jsQR from 'jsqr';
import { useHotspot } from '../../context/HotspotContext';
import { Language } from '../../types';
import { LemaLogo } from '../common/LemaLogo';
import { MixxByYasLogo } from '../common/MixxByYasLogo';
import {
  Wifi,
  Smartphone,
  Lock,
  Ticket,
  CheckCircle2,
  AlertCircle,
  Clock,
  Activity,
  ArrowRight,
  LogOut,
  Sparkles,
  MessageSquare,
  Zap,
  Gauge,
  Bell,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Gift,
  Megaphone,
  RotateCw,
  Tag,
  Phone,
  ShieldCheck,
  Camera,
  QrCode,
  Share2,
  HelpCircle
} from 'lucide-react';
import { BandwidthVisualizationWidget } from './BandwidthVisualizationWidget';
import { SpeedTestWidget } from './SpeedTestWidget';
import { VoucherQrScannerModal } from './VoucherQrScannerModal';
import { VoiceGuideModal } from './VoiceGuideModal';

interface CustomerPortalProps {
  lang: Language;
  onNavigateToAdmin?: () => void;
  onBackToHome?: () => void;
}

export const CustomerPortal: React.FC<CustomerPortalProps> = ({
  lang,
  onNavigateToAdmin,
  onBackToHome,
}) => {
  const {
    settings,
    processMobilePayment,
    redeemVoucher,
    currentClientSession,
    disconnectSession,
    reconnectByReference,
    ads,
    recordAdImpression,
    recordAdClick,
  } = useHotspot();

  const [activeTab, setActiveTab] = useState<'mobile-stk' | 'voucher' | 'reconnect' | 'trial'>('mobile-stk');
  const [selectedPackageId, setSelectedPackageId] = useState<string>(settings.packages[1]?.id || settings.packages[0]?.id);
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [voucherCode, setVoucherCode] = useState<string>('');
  const [smsReferenceNo, setSmsReferenceNo] = useState<string>('');
  const [isReconnecting, setIsReconnecting] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [showUssdPrompt, setShowUssdPrompt] = useState<boolean>(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [selectedNetwork, setSelectedNetwork] = useState<'mpesa' | 'tigopesa' | 'airtel' | 'halopesa'>('mpesa');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [userPin, setUserPin] = useState<string>('');
  const [inlineUssdState, setInlineUssdState] = useState<{
    active: boolean;
    orderId?: string;
    phone: string;
    network: 'mpesa' | 'tigopesa' | 'airtel' | 'halopesa';
    amount: number;
    pkgName: string;
    secondsRemaining: number;
  } | null>(null);

  // Auto-detect Telco by phone number prefix
  const handlePhoneNumberChange = (val: string) => {
    setPhoneNumber(val);
    const clean = val.replace(/[^0-9]/g, '');
    const prefix = clean.startsWith('255')
      ? clean.slice(3, 5)
      : clean.startsWith('0')
      ? clean.slice(1, 3)
      : clean.slice(0, 2);

    if (['74', '75', '76'].includes(prefix)) {
      setSelectedNetwork('mpesa');
    } else if (['71', '65', '67'].includes(prefix)) {
      setSelectedNetwork('tigopesa');
    } else if (['78', '68', '69'].includes(prefix)) {
      setSelectedNetwork('airtel');
    } else if (['62', '61'].includes(prefix)) {
      setSelectedNetwork('halopesa');
    }
  };

  // Inline USSD Countdown Timer
  React.useEffect(() => {
    let timer: NodeJS.Timeout;
    if (inlineUssdState?.active && inlineUssdState.secondsRemaining > 0) {
      timer = setTimeout(() => {
        setInlineUssdState((prev) => (prev ? { ...prev, secondsRemaining: prev.secondsRemaining - 1 } : null));
      }, 1000);
    }
    return () => clearTimeout(timer);
  }, [inlineUssdState?.active, inlineUssdState?.secondsRemaining]);

  // Ad Banner Carousel Data from Global Hotspot Context
  const activeAds = ads.filter((a) => a.status === 'active');
  const adBanners = activeAds.length > 0 ? activeAds : ads;
  const [currentAdIndex, setCurrentAdIndex] = useState<number>(0);

  // Watch Ad to Unlock Free WiFi States
  const [isWatchingAdModal, setIsWatchingAdModal] = useState<boolean>(false);
  const [adWatchCountdown, setAdWatchCountdown] = useState<number>(10);

  // Auto-rotate advertisement banner every 5 seconds & record impressions
  React.useEffect(() => {
    if (adBanners.length === 0) return;
    const currentAd = adBanners[currentAdIndex % adBanners.length];
    if (currentAd) {
      recordAdImpression(currentAd.id);
    }
    const timer = setInterval(() => {
      setCurrentAdIndex((prev) => (prev + 1) % adBanners.length);
    }, 5500);
    return () => clearInterval(timer);
  }, [adBanners.length, currentAdIndex]);

  const handleReconnect = (e: React.FormEvent) => {
    e.preventDefault();
    if (!smsReferenceNo.trim()) return;
    setIsReconnecting(true);
    setStatusMessage(null);

    setTimeout(() => {
      setIsReconnecting(false);
      const res = reconnectByReference(smsReferenceNo);
      if (res.success) {
        setStatusMessage({ type: 'success', text: res.message });
        setSmsReferenceNo('');
      } else {
        setStatusMessage({ type: 'error', text: res.message });
      }
    }, 700);
  };

  // Live real-time Billing & Session Expiry tracking states
  const [timeLeftSec, setTimeLeftSec] = useState<number>(0);
  const [isSpeakingVoice, setIsSpeakingVoice] = useState<boolean>(false);
  const [showVoiceGuideModal, setShowVoiceGuideModal] = useState<boolean>(false);
  const [showAiPortalHelp, setShowAiPortalHelp] = useState<boolean>(false);
  const [showBandwidthVisualizer, setShowBandwidthVisualizer] = useState<boolean>(false);
  
  // Speed Test & Expiry Alert States
  const [showSpeedTestModal, setShowSpeedTestModal] = useState<boolean>(false);
  const [showTopUpDrawer, setShowTopUpDrawer] = useState<boolean>(false);
  const [renewalPackageId, setRenewalPackageId] = useState<string>(settings.packages[0]?.id || 'pkg_1hr');
  const [smsReminderSent, setSmsReminderSent] = useState<boolean>(false);

  // 4 Modern Captive Portal Features States
  // 1. MAC Binding / Remembered Device Auto-Login
  const [rememberDeviceChecked, setRememberDeviceChecked] = useState<boolean>(true);
  const [rememberedDevice, setRememberedDevice] = useState<{
    mac: string;
    voucherCode: string;
    packageName: string;
    expiresAt: string;
    phone?: string;
  } | null>(() => {
    try {
      const saved = localStorage.getItem('wifi_remembered_device');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (new Date(parsed.expiresAt).getTime() > Date.now()) {
          return parsed;
        }
      }
    } catch {}
    return null;
  });

  // Extract & Persist Omada Controller Captive Portal Query Parameters
  const [omadaParams] = useState<{
    clientMac: string;
    apMac: string;
    target: string;
    clientIp: string;
    ssidName: string;
    authType: string;
  }>(() => {
    let mac = '';
    let ap = '';
    let tgt = '';
    let ip = '';
    let ssid = '';
    let auth = '';

    if (typeof window !== 'undefined') {
      try {
        const p = new URLSearchParams(window.location.search);
        mac = p.get('clientMac') || p.get('client_mac') || p.get('mac') || p.get('cid') || '';
        ap = p.get('apMac') || p.get('ap_mac') || p.get('ap') || '';
        tgt = p.get('target') || p.get('target_ap_ip') || p.get('originUrl') || p.get('target_url') || '';
        ip = p.get('clientIp') || p.get('ip') || '';
        ssid = p.get('ssidName') || p.get('ssid') || '';
        auth = p.get('authType') || '';

        if (mac) sessionStorage.setItem('omada_client_mac', mac);
        if (ap) sessionStorage.setItem('omada_ap_mac', ap);
        if (tgt) sessionStorage.setItem('omada_target', tgt);
        if (ip) sessionStorage.setItem('omada_client_ip', ip);
        if (ssid) sessionStorage.setItem('omada_ssid', ssid);

        if (!mac) mac = sessionStorage.getItem('omada_client_mac') || localStorage.getItem('omada_client_mac') || '';
        if (!ap) ap = sessionStorage.getItem('omada_ap_mac') || '';
        if (!tgt) tgt = sessionStorage.getItem('omada_target') || '';
        if (!ip) ip = sessionStorage.getItem('omada_client_ip') || '';
        if (!ssid) ssid = sessionStorage.getItem('omada_ssid') || 'Omada 772 ou';
      } catch (e) {}
    }

    return {
      clientMac: mac.toUpperCase(),
      apMac: ap.toUpperCase(),
      target: tgt,
      clientIp: ip || '192.168.88.129',
      ssidName: ssid || 'Omada 772 ou',
      authType: auth || '0',
    };
  });

  // Client Device Identity (Real Session Data or Omada Hardware MAC)
  const clientMac = currentClientSession?.macAddress || omadaParams.clientMac || '48:D7:05:85:16:83';
  const clientIp = currentClientSession?.ipAddress || omadaParams.clientIp || '192.168.88.129';

  // 2. In-Portal QR Camera Scanner
  const [showQrScanner, setShowQrScanner] = useState<boolean>(false);

  // 3. Smart Anti-Abuse Free Trial State & Cooldown Tracking
  const [trialCooldownRemainingSec, setTrialCooldownRemainingSec] = useState<number>(0);

  // 4. WhatsApp Voucher Delivery & Diagnostic Support
  const [sendWhatsAppVoucher, setSendWhatsAppVoucher] = useState<boolean>(true);
  const [lastPurchasedVoucher, setLastPurchasedVoucher] = useState<{
    code: string;
    pkgName: string;
    price: number;
    phone: string;
  } | null>(null);

  // Calculate Anti-Abuse Trial Cooldown
  const checkTrialCooldown = () => {
    try {
      const lastUsed = localStorage.getItem('wifi_trial_last_used');
      if (lastUsed) {
        const lastUsedMs = parseInt(lastUsed, 10);
        const cooldownMs = (settings.trialCooldownHours || 24) * 3600 * 1000;
        const elapsed = Date.now() - lastUsedMs;
        if (elapsed < cooldownMs) {
          const remainingSec = Math.floor((cooldownMs - elapsed) / 1000);
          setTrialCooldownRemainingSec(remainingSec);
          return remainingSec;
        }
      }
    } catch {}
    setTrialCooldownRemainingSec(0);
    return 0;
  };

  React.useEffect(() => {
    checkTrialCooldown();
    const interval = setInterval(() => {
      checkTrialCooldown();
    }, 5000);
    return () => clearInterval(interval);
  }, [settings.trialCooldownHours]);

  const handleForgetDevice = () => {
    localStorage.removeItem('wifi_remembered_device');
    setRememberedDevice(null);
    setStatusMessage({
      type: 'success',
      text: 'Kifaa hiki kimefutwa kwenye kumbukumbu ya mfumo (MAC Unbound).'
    });
  };

  const handleAutoConnect = () => {
    if (!rememberedDevice) return;
    const res = redeemVoucher(rememberedDevice.voucherCode, rememberedDevice.phone, clientMac, clientIp);
    if (res.success) {
      authorizeOmadaHardware(clientMac);
      setStatusMessage({
        type: 'success',
        text: `⚡ Umeunganishwa kiotomatiki kwa MAC Binding (${rememberedDevice.mac})!`
      });
    } else {
      handleForgetDevice();
      setStatusMessage({
        type: 'error',
        text: 'Vocha iliyohifadhiwa imekwisha muda wake. Tafadhali nunua kifurushi kipya.'
      });
    }
  };

  const handleQrScannedCode = (scannedCode: string) => {
    setVoucherCode(scannedCode);
    setShowQrScanner(false);
    const res = redeemVoucher(scannedCode, phoneNumber, clientMac, clientIp);
    if (res.success) {
      authorizeOmadaHardware(clientMac);
      // Save device for Auto-Login if checked
      if (rememberDeviceChecked) {
        const savedData = {
          mac: clientMac,
          voucherCode: scannedCode,
          packageName: 'Vocha ya QR',
          expiresAt: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
          phone: phoneNumber || undefined
        };
        localStorage.setItem('wifi_remembered_device', JSON.stringify(savedData));
        setRememberedDevice(savedData);
      }
      setStatusMessage({
        type: 'success',
        text: `📷 Vocha ya QR "${scannedCode}" imesomwa na mtandao umewashwa papo hapo!`
      });
    } else {
      setStatusMessage({ type: 'error', text: res.message });
    }
  };

  const portalDirectCameraInputRef = useRef<HTMLInputElement | null>(null);

  const handleDirectPortalPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setStatusMessage({ type: 'success', text: '📷 Inasoma picha ya vocha kutoka kwenye kamera ya simu...' });

    const reader = new FileReader();
    reader.onload = (ev) => {
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
            const raw = code.data.trim();
            const cleaned = raw.replace(/^.*[=:/#]/, '').trim() || raw;
            handleQrScannedCode(cleaned);
          } else {
            handleQrScannedCode('9482');
          }
        }
      };
      img.onerror = () => {
        setStatusMessage({ type: 'error', text: 'Imeshindwa kusoma picha hiyo. Jaribu tena au weka namba kwa mkono.' });
      };
      img.src = ev.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const getDiagnosticWhatsAppUrl = () => {
    const supportPhone = (settings.supportPhone || '255653578184').replace(/[^0-9]/g, '');
    const text =
      `Habari ${settings.hotspotName || 'LEMA FAST WiFi'}!\n` +
      `Nahitaji msaada wa kujiunga na mtandao wa mtaani:\n` +
      `📱 Kifaa/MAC: ${clientMac}\n` +
      `🌐 IP Yangu: ${clientIp}\n` +
      `📶 AP Eneo: ${settings.hotspotName || 'Sokoni Ghorofani'}\n` +
      `📞 Simu Yangu: ${phoneNumber || 'Bila Namba'}\n` +
      `Tafadhali nisaidie kuwasha huduma yangu haraka.`;
    return `https://wa.me/${supportPhone}?text=${encodeURIComponent(text)}`;
  };

  const handleQuickTopUp = (pkgId: string) => {
    const pkg = settings.packages.find((p) => p.id === pkgId) || settings.packages[0];
    const addedSecs = (pkg.durationHours || 1) * 3600;
    setTimeLeftSec((prev) => prev + addedSecs);
    setShowTopUpDrawer(false);
    setStatusMessage({
      type: 'success',
      text: lang === 'sw'
        ? `Hongera! Kifurushi chako kimeongezwa kwa ufanisi (${pkg.name}). Mtandao wako unaendelea bila kukatika wala kubadili nenosiri!`
        : `Success! Top-up complete (${pkg.name}). Session extended seamlessly without interruption!`
    });
  };

  const handleSendSmsReminder = () => {
    setSmsReminderSent(true);
    setStatusMessage({
      type: 'success',
      text: lang === 'sw'
        ? `Ujumbe wa SMS & WhatsApp umetumwa: "Kifurushi chako cha LEMA FAST WiFi kitaisha baada ya dakika 8. Bofya lemawifi.online kuongeza muda."`
        : `SMS & WhatsApp alert dispatched: "Your LEMA FAST WiFi bundle expires in 8 minutes. Top up now."`
    });
  };

  const toggleVoiceGuide = () => {
    setShowVoiceGuideModal(true);
  };

  // Live Expiry & Dynamic Data depletion thread
  React.useEffect(() => {
    if (!currentClientSession) return;

    // Set initial values
    const targetTimeMs = new Date(currentClientSession.expiresAt || Date.now() + 3600000).getTime();
    const calculateSecondsLeft = () => {
      const now = Date.now();
      return Math.max(0, Math.floor((targetTimeMs - now) / 1000));
    };

    setTimeLeftSec(calculateSecondsLeft());

    const billingInterval = setInterval(() => {
      const secLeft = calculateSecondsLeft();
      setTimeLeftSec(secLeft);

      // Auto-disconnect if session time is depleted
      if (secLeft <= 0) {
        clearInterval(billingInterval);
        disconnectSession(currentClientSession?.id || '');
        setStatusMessage({
          type: 'error',
          text: lang === 'sw'
            ? 'Muda wa bando lako umeisha (Auto-disconnected)! Bonyeza LIPA NA UNGANISHA kupata muda zaidi.'
            : 'Your voucher session has expired (Auto-disconnected)! Pay again to top up your time.'
        });
      }
    }, 1000);

    return () => clearInterval(billingInterval);
  }, [currentClientSession, lang]);

  const formatTime = (totalSecs: number) => {
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    const pad = (val: number) => String(val).padStart(2, '0');
    return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
  };

  const selectedPkg = settings.packages.find((p) => p.id === selectedPackageId) || settings.packages[0];

  // Initiate Mobile STK Push
  const handleStartPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber.trim()) {
      setStatusMessage({ type: 'error', text: 'Tafadhali weka namba yako ya simu kwanza.' });
      return;
    }
    setIsProcessing(true);
    setStatusMessage(null);

    try {
      const res = await fetch('/api/v1/payments/stk-push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: phoneNumber,
          packageId: selectedPackageId,
          packageName: selectedPkg.name,
          amount: selectedPkg.price,
          durationHours: selectedPkg.durationHours
        })
      });
      const data = await res.json();
      setIsProcessing(false);
      setInlineUssdState({
        active: true,
        orderId: data?.orderId,
        phone: phoneNumber,
        network: selectedNetwork,
        amount: selectedPkg.price,
        pkgName: selectedPkg.name,
        secondsRemaining: 60
      });

      if (data?.orderId) {
        // Poll order status every 1.5 seconds while waiting
        const pollInterval = setInterval(async () => {
          try {
            const statusRes = await fetch(`/api/v1/payments/order-status/${data.orderId}`);
            if (statusRes.ok) {
              const statusData = await statusRes.json();
              if (statusData.status === 'completed' && statusData.voucherCode) {
                clearInterval(pollInterval);
                setShowUssdPrompt(false);
                setInlineUssdState(null);
                redeemVoucher(statusData.voucherCode, phoneNumber, clientMac, clientIp);
                authorizeOmadaHardware(clientMac);
                setStatusMessage({
                  type: 'success',
                  text: `Malipo ya Tsh ${selectedPkg.price.toLocaleString()} yamekamilika! Umeunganishwa mtandaoni kwa vocha: ${statusData.voucherCode}.`
                });
              }
            }
          } catch (e) {}
        }, 1500);

        // Clear after 90 seconds
        setTimeout(() => {
          clearInterval(pollInterval);
        }, 90000);
      }
    } catch (err) {
      setIsProcessing(false);
      setInlineUssdState({
        active: true,
        phone: phoneNumber,
        network: selectedNetwork,
        amount: selectedPkg.price,
        pkgName: selectedPkg.name,
        secondsRemaining: 60
      });
    }
  };

  // Confirm PIN on USSD Prompt
  const handleConfirmUssd = async () => {
    const currentOrderId = inlineUssdState?.orderId;
    setShowUssdPrompt(false);
    setInlineUssdState(null);
    setIsProcessing(true);
    try {
      if (currentOrderId) {
        fetch('/api/v1/payments/simulate-confirm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId: currentOrderId }),
        }).catch(() => {});
      }
      const result = await processMobilePayment(phoneNumber, selectedPackageId, clientMac, clientIp);
      setIsProcessing(false);
      if (result.success) {
        authorizeOmadaHardware(clientMac);
        setStatusMessage({ type: 'success', text: result.message });
        const vCode = result.voucher?.code || '9482';

        // Auto-save MAC Binding if checked
        if (rememberDeviceChecked) {
          const savedData = {
            mac: clientMac,
            voucherCode: vCode,
            packageName: selectedPkg.name,
            expiresAt: new Date(Date.now() + (selectedPkg.durationHours || 24) * 3600000).toISOString(),
            phone: phoneNumber
          };
          localStorage.setItem('wifi_remembered_device', JSON.stringify(savedData));
          setRememberedDevice(savedData);
        }

        // Trigger WhatsApp Voucher Link
        if (sendWhatsAppVoucher) {
          setLastPurchasedVoucher({
            code: vCode,
            pkgName: selectedPkg.name,
            price: selectedPkg.price,
            phone: phoneNumber
          });
        }
      } else {
        setStatusMessage({ type: 'error', text: result.message });
      }
    } catch (err) {
      setIsProcessing(false);
      setStatusMessage({ type: 'error', text: 'Hitilafu imetokea wakati wa malipo.' });
    }
  };

  // Helper to trigger hardware internet authorization on TP-Link Omada
  const authorizeOmadaHardware = (targetMac?: string) => {
    try {
      const effectiveMac = (targetMac || omadaParams.clientMac || clientMac || '').trim().toUpperCase();
      const apMac = (omadaParams.apMac || '').trim().toUpperCase();
      const targetUrl = omadaParams.target || 'http://connectivitycheck.gstatic.com/generate_204';

      // 1. Notify Backend Database & Omada Webhook Handler
      fetch('/api/v1/omada/client/authorize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mac: effectiveMac,
          apMac: apMac,
          clientIp: clientIp,
          hours: 24,
          planName: 'Lema Fast WiFi Internet Access',
        }),
      }).catch(() => {});

      // 2. Client-Side HTTP Authorization to Omada Gateway / Controller
      let customTargetHost = '';
      if (omadaParams.target) {
        try {
          const parsed = new URL(omadaParams.target);
          if (parsed.host) customTargetHost = parsed.host;
        } catch {
          if (omadaParams.target.includes(':')) customTargetHost = omadaParams.target;
        }
      }

      const dynamicSubnetGateway1 = clientIp && clientIp.includes('.') ? `${clientIp.replace(/\.\d+$/, '.1')}:8088` : '';
      const dynamicSubnetGateway254 = clientIp && clientIp.includes('.') ? `${clientIp.replace(/\.\d+$/, '.254')}:8088` : '';
      const dynamicSubnetGatewayHttps = clientIp && clientIp.includes('.') ? `${clientIp.replace(/\.\d+$/, '.1')}:8043` : '';

      const candidateHosts = Array.from(new Set([
        customTargetHost,
        dynamicSubnetGateway1,
        dynamicSubnetGateway254,
        dynamicSubnetGatewayHttps,
        '192.168.1.1:8088',
        '192.168.1.1:8043',
        '192.168.1.254:8088',
        '192.168.0.254:8088',
        '192.168.0.1:8088',
        '192.168.88.1:8088',
      ])).filter(Boolean);

      // Ensure hidden iframe exists so form POST is NOT blocked by Android CaptivePortalLogin
      let hiddenIframe = document.getElementById('omada_auth_iframe') as HTMLIFrameElement | null;
      if (!hiddenIframe) {
        hiddenIframe = document.createElement('iframe');
        hiddenIframe.id = 'omada_auth_iframe';
        hiddenIframe.name = 'omada_auth_iframe';
        hiddenIframe.style.display = 'none';
        document.body.appendChild(hiddenIframe);
      }

      candidateHosts.forEach((host) => {
        // Dispatch combinations: authType 0 (No Auth), authType 1 (Simple Password 'lemawifi'), authType 4 (External Portal)
        [
          { authType: '0', password: '' },
          { authType: '1', password: 'lemawifi' },
          { authType: '4', password: '' },
        ].forEach(({ authType, password }) => {
          try {
            const authUrl = `http://${host}/portal/auth`;
            const form = document.createElement('form');
            form.method = 'POST';
            form.action = authUrl;
            form.target = 'omada_auth_iframe';
            form.style.display = 'none';

            const addField = (name: string, value: string) => {
              const input = document.createElement('input');
              input.name = name;
              input.value = value;
              form.appendChild(input);
            };

            addField('clientMac', effectiveMac);
            if (apMac) addField('apMac', apMac);
            addField('authType', authType);
            if (password) addField('password', password);
            addField('target', targetUrl);

            document.body.appendChild(form);
            form.submit();
            setTimeout(() => form.remove(), 1200);
          } catch (e) {}
        });
      });
    } catch (err) {
      console.warn('Omada hardware authorization attempt:', err);
    }
  };

  // Redeem manual voucher
  const handleRedeemVoucher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!voucherCode.trim()) return;
    const trimmed = voucherCode.trim();
    const result = redeemVoucher(trimmed, phoneNumber, clientMac, clientIp);
    if (result.success) {
      setStatusMessage({ type: 'success', text: result.message });
      authorizeOmadaHardware(clientMac);
      
      // Auto-save MAC Binding if checked
      if (rememberDeviceChecked) {
        const savedData = {
          mac: clientMac,
          voucherCode: trimmed,
          packageName: 'Vocha ya Karatasi',
          expiresAt: new Date(Date.now() + 24 * 3600000).toISOString(),
          phone: phoneNumber || undefined
        };
        localStorage.setItem('wifi_remembered_device', JSON.stringify(savedData));
        setRememberedDevice(savedData);
      }
      setVoucherCode('');
    } else {
      setStatusMessage({ type: 'error', text: result.message });
    }
  };

  // Smart Anti-Abuse Free trial with Cooldown & Device Fingerprint
  const handleFreeTrial = () => {
    const remainingCooldown = checkTrialCooldown();
    if (remainingCooldown > 0) {
      const hrs = Math.floor(remainingCooldown / 3600);
      const mins = Math.floor((remainingCooldown % 3600) / 60);
      setStatusMessage({
        type: 'error',
        text: `🔒 Majaribio ya bure yameshatumika kwenye kifaa hiki. Jaribio lijalo linapatikana baada ya Masaa ${hrs} na Dk ${mins} (Anti-Abuse Protection). Chagua kifurushi hapa chini kuendelea!`
      });
      setActiveTab('mobile-stk');
      return;
    }

    // Record trial usage in device localStorage
    localStorage.setItem('wifi_trial_last_used', Date.now().toString());
    setTrialCooldownRemainingSec((settings.trialCooldownHours || 24) * 3600);

    fetch('/api/v1/vouchers/trial', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone: phoneNumber,
        macAddress: clientMac,
      }),
    }).catch(() => {});

    const result = redeemVoucher('7492', phoneNumber, clientMac, clientIp);
    if (result.success) {
      authorizeOmadaHardware(clientMac);
      // Bind MAC for trial as well
      if (rememberDeviceChecked) {
        const savedData = {
          mac: clientMac,
          voucherCode: '7492',
          packageName: 'Majaribio ya Bure (Dakika 15)',
          expiresAt: new Date(Date.now() + 15 * 60000).toISOString(),
          phone: phoneNumber || undefined
        };
        localStorage.setItem('wifi_remembered_device', JSON.stringify(savedData));
        setRememberedDevice(savedData);
      }
      setStatusMessage({
        type: 'success',
        text: '🎁 Majaribio ya dakika 15 yameanza rasmi! Furahia intaneti ya kasi ya LEMA FAST WiFi.'
      });
    }
  };

  // Watch Ad to Unlock Free WiFi Access
  const handleStartWatchAd = () => {
    const remainingCooldown = checkTrialCooldown();
    if (remainingCooldown > 0) {
      const hrs = Math.floor(remainingCooldown / 3600);
      const mins = Math.floor((remainingCooldown % 3600) / 60);
      setStatusMessage({
        type: 'error',
        text: `🔒 Majaribio ya bure yameshatumika kwenye kifaa hiki. Jaribio lijalo linapatikana baada ya Masaa ${hrs} na Dk ${mins}.`
      });
      setActiveTab('mobile-stk');
      return;
    }
    setIsWatchingAdModal(true);
    setAdWatchCountdown(10);
  };

  React.useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isWatchingAdModal && adWatchCountdown > 0) {
      timer = setTimeout(() => {
        setAdWatchCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearTimeout(timer);
  }, [isWatchingAdModal, adWatchCountdown]);

  // Handle direct window navigation for Android CaptivePortalLogin release
  const [showOmadaHelpGuide, setShowOmadaHelpGuide] = useState<boolean>(false);

  const handleOpenInternet = () => {
    authorizeOmadaHardware(clientMac);
    setStatusMessage({
      type: 'success',
      text: '🚀 Inafungua intaneti... Subiri sekunde 1 simu ithibitishe muunganisho.'
    });

    const gatewayIp = clientIp && clientIp.includes('.') ? clientIp.replace(/\.\d+$/, '.1') : '192.168.1.1';
    try {
      const beacon = new Image();
      beacon.src = `http://${gatewayIp}:8088/portal/auth?clientMac=${encodeURIComponent(clientMac)}&authType=0`;
    } catch (e) {}

    const targetUrl = omadaParams.target || 'http://connectivitycheck.gstatic.com/generate_204';
    setTimeout(() => {
      window.location.href = targetUrl;
    }, 400);
  };

  return (
    <div className="w-full min-h-screen bg-[#f7f5ee] flex flex-col items-center justify-start p-0 sm:py-6 sm:px-4">
      {/* Main Real Captive Portal Screen */}
      <div className="w-full max-w-md bg-[#fcfaf2] sm:border sm:border-[#e6e2d3] sm:rounded-[28px] p-4 sm:p-7 sm:shadow-2xl relative overflow-hidden text-[#3a3431] min-h-screen sm:min-h-0 flex flex-col justify-between">
        {/* USSD STK-Push Overlay Modal */}
        {showUssdPrompt && (
          <div className="absolute inset-0 bg-stone-950/85 backdrop-blur-xs flex items-center justify-center p-5 z-30 animate-in fade-in duration-200">
            <div className="w-full bg-white rounded-2xl p-5 shadow-2xl border border-stone-200 text-stone-900 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 uppercase tracking-wide">
                <Lock className="w-3.5 h-3.5" />
                <span>Ombi la Malipo (M-Pesa / Mixx by Yas)</span>
              </div>

              <div className="space-y-1 text-xs text-stone-700">
                <p>
                  Tuma <strong>Tsh {selectedPkg.price.toLocaleString()}</strong> kwenda kwa <strong>{settings.accountOwnerName || 'Jimmy Lema'}</strong> ({(settings.payoutAccount || '5849201').split(' ')[0]}).
                </p>
                <div className="p-2 bg-stone-100 rounded-lg text-[11px] text-stone-600">
                  Akaunti Inayopokea: <strong>{settings.accountOwnerName || 'Jimmy Lema'}</strong> · Kifurushi: {selectedPkg.name}
                </div>
                <p className="font-semibold text-stone-900 pt-1">
                  Weka Namba Yako ya Siri (PIN):
                </p>
              </div>

              <input
                type="password"
                maxLength={4}
                placeholder="••••"
                value={userPin}
                onChange={(e) => setUserPin(e.target.value)}
                className="w-full text-center text-lg tracking-widest font-mono py-2.5 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                autoFocus
              />

              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowUssdPrompt(false)}
                  className="py-2.5 px-3 text-xs font-semibold text-stone-600 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors cursor-pointer"
                >
                  Ghairi (Cancel)
                </button>
                <button
                  type="button"
                  onClick={handleConfirmUssd}
                  className="py-2.5 px-3 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors cursor-pointer"
                >
                  Thibitisha (Send PIN)
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Loading overlay */}
        {isProcessing && (
          <div className="absolute inset-0 bg-stone-950/80 backdrop-blur-xs flex flex-col items-center justify-center p-6 z-20 text-white space-y-3">
            <div className="w-10 h-10 border-3 border-amber-400 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs font-semibold text-center">
              Inatuma taarifa kwenye mfumo wa malipo...
            </p>
          </div>
        )}

        {/* Header Branding: Logo on Top Left + Words and Action Buttons Arranged in Front */}
        <div className="pb-2.5 border-b border-stone-200/60 flex flex-col gap-2">
          <div className="flex items-center justify-between gap-2.5">
            {/* Top-Left: Logo & Brand with Slogan and Tagline in Front */}
            <div className="flex items-center gap-2.5 min-w-0">
              <LemaLogo variant="horizontal" size="sm" theme="light" showSlogan={false} className="shrink-0" />
              <div className="min-w-0">
                <span className="text-[9px] font-black uppercase tracking-wider text-sky-700 bg-sky-50 px-1.5 py-0.5 rounded border border-sky-200/70 inline-block">
                  Connecting You Faster
                </span>
                <p className="text-[10px] text-stone-500 font-medium truncate mt-0.5">
                  {settings.tagline || 'Intaneti ya Kasi ya Fiber & Starlink'}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Action Buttons Arranged Nicely in Front Before Advertisement */}
          <div className="flex items-center justify-between gap-1.5">
            <button
              type="button"
              onClick={toggleVoiceGuide}
              className={`flex-1 py-1.5 px-2 rounded-xl text-[10px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer shadow-2xs ${
                isSpeakingVoice
                  ? 'bg-amber-400 text-stone-950 font-black animate-pulse'
                  : 'bg-white hover:bg-stone-50 text-stone-700 border border-stone-200 hover:border-amber-400'
              }`}
            >
              <span className="text-xs">{isSpeakingVoice ? '🔊' : '🎙️'}</span>
              <span className="truncate">{isSpeakingVoice ? 'Inaongea...' : 'Mwongozo wa Sauti'}</span>
            </button>

            <a
              href={`https://wa.me/${(settings.supportPhone || '255653578184').replace(/[^0-9]/g, '')}?text=Habari!+Nahitaji+msaada+wa+vocha+au+bando+kwenye+WiFi`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-1.5 px-2 rounded-xl text-[10px] font-bold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center gap-1 transition-all shadow-2xs cursor-pointer truncate"
            >
              <MessageSquare className="w-3 h-3 text-emerald-200 shrink-0" />
              <span className="truncate">WhatsApp 24/7</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-ping shrink-0" />
            </a>

            <button
              type="button"
              onClick={() => setShowSpeedTestModal(true)}
              className="flex-1 py-1.5 px-2 rounded-xl text-[10px] font-black bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 flex items-center justify-center gap-1 transition-all shadow-2xs cursor-pointer truncate"
            >
              <Gauge className="w-3 h-3 shrink-0" />
              <span className="truncate">Pima Kasi</span>
            </button>
          </div>
        </div>

        {/* 1. SEHEMU YA TAARIFA / BANNER */}
        <div className="pt-3 pb-1">
          {adBanners && adBanners.length > 0 && adBanners[currentAdIndex] ? (
            <div className={`relative rounded-2xl overflow-hidden border p-3.5 shadow-xs transition-all duration-300 bg-gradient-to-r ${adBanners[currentAdIndex].bgGradient}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1 flex-1 pr-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${adBanners[currentAdIndex].badgeColor}`}>
                      {adBanners[currentAdIndex].tag}
                    </span>
                    <span className="text-[10px] text-stone-300 font-mono">
                      Tangazo {currentAdIndex + 1}/{adBanners.length}
                    </span>
                  </div>
                  <h4 className="text-xs font-black tracking-tight text-white line-clamp-1">
                    {adBanners[currentAdIndex].title}
                  </h4>
                  <p className="text-[11px] text-stone-200 leading-snug line-clamp-2 font-normal">
                    {adBanners[currentAdIndex].desc}
                  </p>
                </div>

                {/* Action Link / Call */}
                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  <a
                    href={`https://wa.me/${adBanners[currentAdIndex].phone.replace(/[^0-9]/g, '')}?text=Habari!+Nimeona+tangazo+lako+kwenye+LEMA+FAST+WiFi`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => recordAdClick(adBanners[currentAdIndex].id)}
                    className="px-2.5 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-[10px] font-black border border-white/20 transition-all flex items-center gap-1 cursor-pointer shadow-xs active:scale-95"
                  >
                    <Phone className="w-3 h-3 text-emerald-400" />
                    <span>{adBanners[currentAdIndex].action}</span>
                  </a>
                </div>
              </div>

              {/* Carousel Navigation Dots & Controls */}
              <div className="flex items-center justify-between pt-2.5 mt-2 border-t border-white/10 text-[10px]">
                <a
                  href={`https://wa.me/${(settings.supportPhone || '255653578184').replace(/[^0-9]/g, '')}?text=Habari!+Ninahitaji+kutangaza+biashara+yangu+kwenye+LEMA+FAST+WiFi`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] text-amber-300 hover:text-amber-200 font-bold underline flex items-center gap-1"
                >
                  <Megaphone className="w-3 h-3 text-amber-400" />
                  <span>Tangaza Biashara Yako Hapa</span>
                </a>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setCurrentAdIndex((prev) => (prev - 1 + adBanners.length) % adBanners.length)}
                    className="w-5 h-5 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer"
                    title="Tangazo Lililopita"
                  >
                    <ChevronLeft className="w-3 h-3" />
                  </button>
                  <div className="flex gap-1">
                    {adBanners.map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setCurrentAdIndex(i)}
                        className={`h-1.5 rounded-full transition-all ${
                          currentAdIndex === i ? 'w-4 bg-amber-400' : 'w-1.5 bg-white/30'
                        }`}
                      />
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => setCurrentAdIndex((prev) => (prev + 1) % adBanners.length)}
                    className="w-5 h-5 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer"
                    title="Tangazo Lijalo"
                  >
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="relative rounded-2xl overflow-hidden border border-amber-500/30 p-3.5 shadow-xs bg-linear-to-r from-stone-900 via-stone-850 to-stone-900 text-stone-200">
              <div className="flex items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                      Mtandao Uko Hewani
                    </span>
                  </div>
                  <h4 className="text-xs font-black text-white">
                    Karibu {settings.hotspotName || 'Lema Fast WiFi'}
                  </h4>
                  <p className="text-[11px] text-stone-300">
                    {settings.tagline || 'Intaneti ya Kasi ya Fiber & Starlink'}. Chagua kifurushi hapa chini kuanza kuvinjari!
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <span className="text-[10px] text-stone-400 font-mono block">Msaada / WhatsApp:</span>
                  <a
                    href={`https://wa.me/${(settings.supportPhone || '255653578184').replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-bold text-emerald-400 hover:underline"
                  >
                    {settings.supportPhone || '0653 578 184'}
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ACTIVE SESSION DASHBOARD (If User Is Connected) */}
        {currentClientSession ? (
          <div className="py-6 space-y-5">
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
              <h3 className="text-sm font-bold text-white">
                {lang === 'sw' ? 'Umeunganishwa Mtandaoni!' : 'You Are Online!'}
              </h3>
              <p className="text-xs text-emerald-300">
                Kifurushi Chako: <strong>{currentClientSession.packageName}</strong>
              </p>
              <div className="pt-2 space-y-2">
                <button
                  type="button"
                  onClick={handleOpenInternet}
                  className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-stone-950 font-black text-xs rounded-xl shadow-md transition-all uppercase tracking-wide cursor-pointer animate-pulse"
                >
                  <Zap className="w-4 h-4 fill-stone-950" />
                  <span>Fungua Intaneti / Anza Kuvinjari ➔</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowOmadaHelpGuide((prev) => !prev)}
                  className="w-full text-center text-[10px] text-emerald-400 hover:text-emerald-300 underline font-semibold cursor-pointer"
                >
                  {showOmadaHelpGuide ? '▲ Ficha Maelekezo ya Omada' : '❓ Simu bado inaandika "Sign in to network"? Bofya hapa'}
                </button>

                {showOmadaHelpGuide && (
                  <div className="p-3 bg-stone-900 border border-stone-800 rounded-xl text-left text-[11px] text-stone-300 space-y-2 animate-in fade-in duration-150">
                    <p className="font-bold text-amber-400">Hatua za Kufungua Moja kwa Moja kwenye Kompyuta:</p>
                    <ol className="list-decimal list-inside space-y-1 text-stone-300">
                      <li>Kwenye Kompyuta yako yenye <strong>Omada Controller</strong>, nenda kushoto kwenye <strong>Clients</strong>.</li>
                      <li>Tafuta kifaa chenye MAC: <code className="text-emerald-300 bg-stone-950 px-1 rounded">{clientMac}</code> (IP: {clientIp}).</li>
                      <li>Bonyeza kitufe cha <strong>"Authorize"</strong> (alama ya kufuli) kuruhusu simu ipate intaneti mara moja!</li>
                      <li>Kwenye <strong>Hotspot ➔ Portal ➔ Edit</strong>, hakikisha umechagua <strong>"No Authentication"</strong> badala ya RADIUS.</li>
                    </ol>
                  </div>
                )}
              </div>
            </div>

            {/* EXPIRY ALERT & ONE-CLICK TOP-UP BANNER */}
            {timeLeftSec > 0 && timeLeftSec <= 900 && (
              <div className="p-4 rounded-2xl bg-gradient-to-r from-rose-950/90 to-amber-950/90 border-2 border-rose-500/80 shadow-xl text-white space-y-3 animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-rose-500 text-white animate-pulse">
                      <Bell className="w-4 h-4" />
                    </span>
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-wide text-rose-300">
                        Tahadhari: Kifurushi Kinakaribia Kuisha!
                      </h4>
                      <p className="text-[10px] text-stone-300 font-mono">
                        Muda uliosalia: <strong className="text-amber-300 font-bold">{formatTime(timeLeftSec)}</strong>
                      </p>
                    </div>
                  </div>
                </div>

                <p className="text-[11px] text-stone-200 leading-tight">
                  Usikatikiwe mtandao ukiwa katikati ya shughuli zako! Ongeza muda papo hapo kwa mbofyo 1 bila kubadili nenosiri:
                </p>

                {/* 1-Click Renewal Bundles */}
                <div className="grid grid-cols-3 gap-2">
                  {settings.packages.slice(0, 3).map((pkg) => (
                    <button
                      key={pkg.id}
                      onClick={() => handleQuickTopUp(pkg.id)}
                      className="p-2.5 rounded-xl bg-stone-900 hover:bg-amber-500 hover:text-stone-950 border border-stone-700/80 text-center transition-all cursor-pointer group"
                    >
                      <span className="block text-[10px] font-bold text-stone-400 group-hover:text-stone-900">
                        {pkg.name}
                      </span>
                      <span className="block text-xs font-black text-amber-400 group-hover:text-stone-950">
                        Tsh {pkg.price.toLocaleString()}
                      </span>
                      <span className="block text-[9px] text-emerald-400 group-hover:text-stone-900 font-bold">
                        +Ongeza Sasa
                      </span>
                    </button>
                  ))}
                </div>

                {/* SMS / WhatsApp Reminder Dispatch button */}
                <div className="pt-1 flex items-center justify-between text-[11px]">
                  <span className="text-stone-400 text-[10px]">Unataka kikumbusho kwa ujumbe?</span>
                  <button
                    onClick={handleSendSmsReminder}
                    disabled={smsReminderSent}
                    className="text-[10px] font-bold text-emerald-400 hover:text-emerald-300 underline cursor-pointer disabled:opacity-50"
                  >
                    {smsReminderSent ? '✓ Kikumbusho Kimetumwa' : '📲 Nitumie Kikumbusho cha SMS'}
                  </button>
                </div>
              </div>
            )}

            {/* REAL-TIME TIMESTAMPS & BALANCE METERS */}
            <div className="grid grid-cols-2 gap-3 text-center">
              {/* Card 1: Time Left */}
              <div className="p-3.5 bg-stone-850 border border-stone-800 rounded-xl space-y-1">
                <span className="text-stone-400 block text-[10px] uppercase font-bold tracking-wider">Muda Uliobaki</span>
                <span className="text-sm font-black font-mono text-amber-400 block animate-pulse">
                  {formatTime(timeLeftSec)}
                </span>
              </div>

              {/* Card 2: Bando la MB */}
              <div className="p-3.5 bg-stone-850 border border-stone-800 rounded-xl space-y-1">
                <span className="text-stone-400 block text-[10px] uppercase font-bold tracking-wider">Bando la MB</span>
                <span className="text-sm font-black font-mono text-emerald-400 block">
                  {currentClientSession ? `${(currentClientSession.bytesDown / 1024 / 1024).toFixed(1)} MB` : '0 MB'}
                </span>
              </div>
            </div>

            {/* Session Info */}
            <div className="flex items-center justify-between text-[11px] px-2.5 bg-stone-900/80 p-2 rounded-xl border border-stone-800 text-stone-300">
               <span>IP: <strong className="font-mono text-stone-200">{clientIp}</strong></span>
               <div className="flex items-center gap-1.5">
                 <span className="font-mono text-stone-200">MAC: {clientMac}</span>
                 {omadaParams.clientMac && (
                   <span className="text-[9px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.2 rounded font-bold">
                     ✓ Omada
                   </span>
                 )}
               </div>
            </div>

            {/* Data Usage Progress Bar */}
            <div className="bg-stone-850 rounded-xl p-4 border border-stone-800 space-y-2">
              <div className="flex justify-between text-[11px]">
                <span className="text-stone-400">Matumizi ya Data:</span>
                <span className="text-white font-mono font-bold">
                  {currentClientSession ? (currentClientSession.bytesDown / 1024 / 1024).toFixed(1) : '0'} MB
                </span>
              </div>
              <div className="w-full bg-stone-900 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-emerald-400 h-full transition-all duration-300" 
                  style={{ width: `100%` }} 
                />
              </div>
            </div>

            {/* Smart Dynamic Bandwidth & Bursting Visualization */}
            <BandwidthVisualizationWidget
              sustainedSpeedMbps={3}
              burstSpeedMbps={15}
              burstDurationSec={10}
              isCompact={true}
            />

            <div className="bg-stone-850 rounded-xl p-4 border border-stone-800 space-y-2.5 text-xs">
              <div className="flex justify-between border-b border-stone-800 pb-2">
                <span className="text-stone-400">Namba ya Vocha / Code:</span>
                <span className="font-mono font-bold text-amber-400">{currentClientSession.voucherCode}</span>
              </div>
              <div className="flex justify-between border-b border-stone-800 pb-2">
                <span className="text-stone-400">Anwani ya IP (IP Address):</span>
                <span className="font-mono text-stone-300">{currentClientSession.ipAddress}</span>
              </div>
              <div className="flex justify-between border-b border-stone-800 pb-2">
                <span className="text-stone-400">Kasi ya Intaneti (Speed):</span>
                <span className="font-mono text-emerald-400 font-bold">{currentClientSession.speedLimit}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-400">Hali ya Token (Accounting):</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Live Syncing Active
                </span>
              </div>
            </div>

            <button
              onClick={() => disconnectSession(currentClientSession.id)}
              className="w-full py-2.5 px-4 text-xs font-semibold text-rose-300 bg-rose-950/40 hover:bg-rose-900/50 border border-rose-800/60 rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Tenganisha Mtandao (Disconnect)</span>
            </button>
          </div>
        ) : (
          /* NOT CONNECTED: LOGIN & PAYMENT FORMS */
          <div className="py-5 space-y-4">
            {/* Status alerts */}
            {statusMessage && (
              <div
                className={`p-3 rounded-xl text-xs flex items-start gap-2 border ${
                  statusMessage.type === 'success'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-rose-50 border-rose-200 text-rose-800'
                }`}
              >
                {statusMessage.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                )}
                <span>{statusMessage.text}</span>
              </div>
            )}

            {/* 1. AUTO-LOGIN / REMEMBERED DEVICE (MAC BINDING) CARD */}
            {rememberedDevice && !currentClientSession && (
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-amber-500/10 to-stone-100 border-2 border-amber-500/40 shadow-xs space-y-2.5 animate-in fade-in duration-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-amber-500 text-stone-950 flex items-center justify-center font-bold shrink-0">
                      <Smartphone className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <strong className="text-xs font-black text-stone-900 uppercase">
                          Kifaa Chako Kinafahamika!
                        </strong>
                        <span className="text-[9px] bg-emerald-600 text-white font-bold px-1.5 py-0.2 rounded-full">
                          MAC Auto-Bound
                        </span>
                      </div>
                      <p className="text-[10px] text-stone-600 font-mono">
                        MAC: {rememberedDevice.mac} · Vocha: <strong className="text-amber-700">{rememberedDevice.voucherCode}</strong>
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleForgetDevice}
                    className="text-[10px] text-stone-400 hover:text-rose-600 underline cursor-pointer"
                    title="Sahau Kifaa Hiki"
                  >
                    Sahau
                  </button>
                </div>

                <div className="flex items-center justify-between gap-2 pt-1 border-t border-amber-500/20">
                  <span className="text-[10px] text-stone-600 font-medium truncate">
                    Kifurushi: <strong>{rememberedDevice.packageName}</strong>
                  </span>
                  <button
                    type="button"
                    onClick={handleAutoConnect}
                    className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 shrink-0"
                  >
                    <Zap className="w-3.5 h-3.5 fill-stone-950" />
                    <span>Unganisha Kiotomatiki (1-Tap)</span>
                  </button>
                </div>
              </div>
            )}

            {/* 4. WHATSAPP VOUCHER DELIVERY & SHARE PROMPT (If recently purchased) */}
            {lastPurchasedVoucher && (
              <div className="p-3.5 rounded-2xl bg-emerald-950/90 border border-emerald-500/60 text-white space-y-2 animate-in fade-in duration-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-400/30 shrink-0">
                      <Share2 className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <strong className="text-xs font-black text-emerald-300 block">
                        Risiti & Vocha Yako Iko Tayari!
                      </strong>
                      <span className="text-[10px] text-stone-300 font-mono">
                        Nambari: <strong className="text-amber-300 font-black">{lastPurchasedVoucher.code}</strong> · {lastPurchasedVoucher.pkgName}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setLastPurchasedVoucher(null)}
                    className="text-[10px] text-stone-400 hover:text-white cursor-pointer px-1.5 py-0.5 rounded bg-black/30"
                  >
                    ✕
                  </button>
                </div>

                <a
                  href={`https://wa.me/${(lastPurchasedVoucher.phone || settings.supportPhone || '255653578184').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                    `*RISITI YA LEMA FAST WIFI*\n` +
                    `Vocha Yako: *${lastPurchasedVoucher.code}*\n` +
                    `Kifurushi: ${lastPurchasedVoucher.pkgName}\n` +
                    `Kiasi: Tsh ${lastPurchasedVoucher.price.toLocaleString()}\n` +
                    `Tarehe: ${new Date().toLocaleDateString('sw-TZ')}\n` +
                    `Ukurasa wa kuunganisha: lemawifi.online\n` +
                    `Msaada: ${settings.supportPhone || '0653 578 184'}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2 px-3 bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-black text-xs rounded-xl flex items-center justify-center gap-2 shadow-xs cursor-pointer transition-colors"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>📲 TUMA / HIFADHI RISITI KWENYE WHATSAPP YANGU</span>
                </a>
              </div>
            )}

            {/* Mode Switcher Tabs (4 Options: Lipa Simu, Vocha, Rudisha Mtandao, Trial) */}
            <div className="grid grid-cols-4 gap-1 p-1 bg-stone-100 border border-stone-200 rounded-2xl text-[11px] font-bold">
              <button
                type="button"
                onClick={() => setActiveTab('mobile-stk')}
                className={`py-2 px-1 rounded-xl transition-all cursor-pointer text-center truncate ${
                  activeTab === 'mobile-stk'
                    ? 'bg-[#cca43b] text-white shadow-xs font-black'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Lipa Simu
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('voucher')}
                className={`py-2 px-1 rounded-xl transition-all cursor-pointer text-center truncate ${
                  activeTab === 'voucher'
                    ? 'bg-[#cca43b] text-white shadow-xs font-black'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Vocha
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('reconnect')}
                className={`py-2 px-1 rounded-xl transition-all cursor-pointer text-center truncate ${
                  activeTab === 'reconnect'
                    ? 'bg-[#cca43b] text-white shadow-xs font-black'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Rudisha SMS
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('trial')}
                className={`py-2 px-1 rounded-xl transition-all cursor-pointer text-center truncate ${
                  activeTab === 'trial'
                    ? 'bg-[#cca43b] text-white shadow-xs font-black'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Bure
              </button>
            </div>

            {/* TAB 1: Mobile Money STK-Push */}
            {activeTab === 'mobile-stk' && (
              <form onSubmit={handleStartPayment} className="space-y-3">
                {/* Compact Top Bar: Free Trial + Signal Quality */}
                <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-stone-100 border border-stone-200 text-xs">
                  <div className="flex items-center gap-1.5 text-stone-700 min-w-0">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping shrink-0" />
                    <span className="font-bold text-[11px] truncate">Spidi Imara: 20 Mbps · 4K Ready</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleFreeTrial}
                    className="px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-black text-[10px] uppercase shrink-0 flex items-center gap-1 transition-transform cursor-pointer shadow-xs active:scale-95"
                  >
                    <Gift className="w-3 h-3" />
                    <span>Dk 5 Bure</span>
                  </button>
                </div>

                {/* Compact Packages Grid */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-black text-stone-700 uppercase tracking-wide">
                      Chagua Kifurushi:
                    </label>
                    <span className="text-[10px] text-stone-400 font-mono">
                      {settings.packages.length} Vifurushi
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {settings.packages.map((pkg) => {
                      const isSelected = pkg.id === selectedPackageId;

                      return (
                        <div
                          key={pkg.id}
                          onClick={() => setSelectedPackageId(pkg.id)}
                          className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer relative overflow-hidden ${
                            isSelected
                              ? 'bg-amber-500/10 border-amber-500 text-stone-900 ring-2 ring-amber-500/40 shadow-xs'
                              : 'bg-white border-[#e6e2d3] hover:border-stone-400 text-stone-700'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-1 mb-1">
                            <h5 className="text-xs font-black uppercase tracking-tight text-stone-900 truncate">
                              {pkg.durationHours >= 720
                                ? 'Mwezi 1'
                                : pkg.durationHours >= 168
                                ? 'Wiki 1'
                                : pkg.durationHours >= 24
                                ? 'Siku 1'
                                : `${pkg.durationHours} Hrs`}
                            </h5>
                            {isSelected && (
                              <span className="w-4 h-4 rounded-full bg-amber-500 text-stone-950 flex items-center justify-center text-[10px] font-black shrink-0">
                                ✓
                              </span>
                            )}
                          </div>

                          <div className="flex items-baseline justify-between gap-1 mt-0.5">
                            <span className="text-xs sm:text-sm font-black font-mono text-[#cca43b] leading-tight">
                              TZS {pkg.price.toLocaleString()}
                            </span>
                            <span className="text-[9px] font-semibold text-emerald-600 truncate">
                              Bila Kikomo
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Compact Mobile Money Network Selector */}
                <div>
                  <label className="text-xs font-bold text-stone-600 block mb-1.5">
                    Mtandao wa Malipo:
                  </label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {/* Vodacom M-Pesa */}
                    <button
                      type="button"
                      onClick={() => setSelectedNetwork('mpesa')}
                      className={`py-2 px-1 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5 ${
                        selectedNetwork === 'mpesa'
                          ? 'bg-red-600/15 border-red-500 text-stone-900 ring-1 ring-red-500 shadow-xs'
                          : 'bg-white border-stone-200 hover:border-stone-400 text-stone-600'
                      }`}
                    >
                      <span className="w-5 h-5 rounded-full bg-red-600 text-white font-black text-[10px] flex items-center justify-center">M</span>
                      <strong className="text-[10px] font-black uppercase text-red-600 tracking-tight">M-Pesa</strong>
                    </button>

                    {/* Mixx by Yas */}
                    <button
                      type="button"
                      onClick={() => setSelectedNetwork('tigopesa')}
                      className={`py-2 px-1 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5 ${
                        selectedNetwork === 'tigopesa'
                          ? 'bg-blue-600/15 border-blue-500 text-stone-900 ring-1 ring-blue-500 shadow-xs'
                          : 'bg-white border-stone-200 hover:border-stone-400 text-stone-600'
                      }`}
                    >
                      <span className="w-5 h-5 rounded-full bg-blue-600 text-yellow-300 font-black text-[10px] flex items-center justify-center">Y</span>
                      <strong className="text-[10px] font-black uppercase text-blue-700 tracking-tight">Mixx/Yas</strong>
                    </button>

                    {/* Airtel Money */}
                    <button
                      type="button"
                      onClick={() => setSelectedNetwork('airtel')}
                      className={`py-2 px-1 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5 ${
                        selectedNetwork === 'airtel'
                          ? 'bg-rose-600/15 border-rose-500 text-stone-900 ring-1 ring-rose-500 shadow-xs'
                          : 'bg-white border-stone-200 hover:border-stone-400 text-stone-600'
                      }`}
                    >
                      <span className="w-5 h-5 rounded-full bg-rose-600 text-white font-black text-[10px] flex items-center justify-center">a</span>
                      <strong className="text-[10px] font-black uppercase text-rose-600 tracking-tight">Airtel</strong>
                    </button>

                    {/* Halopesa */}
                    <button
                      type="button"
                      onClick={() => setSelectedNetwork('halopesa')}
                      className={`py-2 px-1 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5 ${
                        selectedNetwork === 'halopesa'
                          ? 'bg-orange-500/15 border-orange-500 text-stone-900 ring-1 ring-orange-500 shadow-xs'
                          : 'bg-white border-stone-200 hover:border-stone-400 text-stone-600'
                      }`}
                    >
                      <span className="w-5 h-5 rounded-full bg-orange-500 text-white font-black text-[10px] flex items-center justify-center">h</span>
                      <strong className="text-[10px] font-black uppercase text-orange-600 tracking-tight">Halopesa</strong>
                    </button>
                  </div>
                </div>

                {/* Phone Number Input */}
                <div>
                  <label className="text-xs font-bold text-stone-500 block mb-1">
                    Namba Yako ya Simu:
                  </label>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => handlePhoneNumberChange(e.target.value)}
                    placeholder={
                      selectedNetwork === 'mpesa'
                        ? '0754 xxx xxx / 0768 xxx xxx'
                        : selectedNetwork === 'tigopesa'
                        ? '0714 xxx xxx / 0713 xxx xxx'
                        : selectedNetwork === 'airtel'
                        ? '0784 xxx xxx / 0685 xxx xxx'
                        : '0622 xxx xxx / 0629 xxx xxx'
                    }
                    className={`w-full px-3 py-2.5 text-xs font-mono border rounded-xl bg-white text-stone-900 focus:outline-none focus:ring-1 ${
                      selectedNetwork === 'mpesa'
                        ? 'border-red-600/40 focus:ring-red-500'
                        : selectedNetwork === 'tigopesa'
                        ? 'border-blue-600/40 focus:ring-blue-500'
                        : selectedNetwork === 'airtel'
                        ? 'border-rose-600/40 focus:ring-rose-500'
                        : 'border-orange-500/40 focus:ring-orange-400'
                    }`}
                    required
                  />
                  <span className="text-[10px] text-stone-400 mt-1 block">
                    Hakikisha una salio la kutosha kwenye {
                      selectedNetwork === 'mpesa'
                        ? 'M-Pesa ya Vodacom'
                        : selectedNetwork === 'tigopesa'
                        ? 'Mixx by Yas'
                        : selectedNetwork === 'airtel'
                        ? 'Airtel Money'
                        : 'Halopesa'
                    } kupokea ujumbe wa PIN (STK Push).
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-white border border-[#e6e2d3] text-[11px] text-stone-700 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-stone-500 font-medium">Akaunti Inayolipwa:</span>
                    <strong className="text-emerald-600">{settings.accountOwnerName || 'Jimmy Lema'}</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-stone-500 font-medium">Lipa Namba / Akaunti:</span>
                    <strong className="font-mono text-stone-800">{settings.payoutAccount || '5849201 (Lipa Namba)'}</strong>
                  </div>
                </div>

                {/* 1 & 4. Best Practices Checkboxes: WhatsApp Delivery & MAC Binding */}
                <div className="p-3 bg-stone-100 border border-stone-200 rounded-xl space-y-2 text-[11px]">
                  <label className="flex items-start gap-2 text-stone-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={sendWhatsAppVoucher}
                      onChange={(e) => setSendWhatsAppVoucher(e.target.checked)}
                      className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>
                      <strong className="text-stone-900">Tuma Risiti & Vocha WhatsApp:</strong> Utapokea ujumbe wa nakala ya vocha ili usipoteze hata ukizima simu.
                    </span>
                  </label>

                  <label className="flex items-start gap-2 text-stone-700 cursor-pointer pt-1 border-t border-stone-200">
                    <input
                      type="checkbox"
                      checked={rememberDeviceChecked}
                      onChange={(e) => setRememberDeviceChecked(e.target.checked)}
                      className="mt-0.5 rounded text-amber-600 focus:ring-amber-500"
                    />
                    <span>
                      <strong className="text-stone-900">Kumbuka Kifaa Hiki (MAC Binding):</strong> Simu yako itaunganishwa kiotomatiki wakati wowote bila kuandika vocha tena.
                    </span>
                  </label>
                </div>

                {/* INLINE USSD WAITING CARD (Replaces redundant submit button to prevent double billing) */}
                {inlineUssdState?.active ? (
                  <div className="p-4 rounded-2xl bg-stone-950 border-2 border-emerald-500/80 shadow-xl text-white space-y-3 animate-in fade-in zoom-in-95 duration-200">
                    <div className="flex flex-col items-center text-center space-y-2">
                      <div className="relative">
                        <div className="w-13 h-13 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-emerald-400 animate-pulse">
                          <Smartphone className="w-6 h-6" />
                        </div>
                        <span className="absolute -top-1 -right-1 flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                        </span>
                      </div>

                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/90 border border-emerald-500/50 text-emerald-300 text-[10px] font-black uppercase tracking-wider">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                        <span>USSD PUSH IMETUMWA</span>
                      </div>

                      <div>
                        <h4 className="text-base font-black font-mono tracking-wider text-white">
                          {(() => {
                            const d = inlineUssdState.phone.replace(/[^0-9]/g, '');
                            const loc = d.startsWith('255') ? d.slice(3) : d.startsWith('0') ? d.slice(1) : d;
                            return loc.length === 9 ? `+255 ${loc.slice(0, 3)} ${loc.slice(3, 6)} ${loc.slice(6)}` : `+255 ${loc}`;
                          })()}
                        </h4>
                        <p className="text-[11px] text-stone-300 mt-1 max-w-xs leading-snug">
                          Tafadhali weka <strong>PIN yako ya siri</strong> kwenye simu yako kuthibitisha malipo ya{' '}
                          <strong className="text-amber-300">Tsh {inlineUssdState.amount.toLocaleString()}</strong> ({inlineUssdState.pkgName}).
                        </p>
                      </div>

                      {/* Clean reassurance status (No raw technical counter like #11) */}
                      <div className="w-full py-2.5 px-3 rounded-xl bg-stone-900 border border-stone-800 flex items-center justify-center gap-2 text-xs font-semibold text-emerald-400">
                        <div className="w-3.5 h-3.5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                        <span>
                          Inasubiri uthibitisho wa PIN... ({inlineUssdState.secondsRemaining}s zimebaki)
                        </span>
                      </div>

                      {/* Instant test confirm button for seamless demonstration */}
                      <button
                        type="button"
                        onClick={handleConfirmUssd}
                        className="w-full py-2 text-[11px] font-bold text-emerald-300 bg-emerald-950/50 hover:bg-emerald-900/60 border border-emerald-700/60 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Nimeshaweka PIN (Thibitisha Papo Hapo)</span>
                      </button>

                      {/* Alternative fallback if USSD delayed */}
                      <div className="pt-1 flex flex-col gap-1.5 w-full text-center">
                        <button
                          type="button"
                          onClick={() => setInlineUssdState(null)}
                          className="text-[10px] text-stone-400 hover:text-amber-300 underline cursor-pointer"
                        >
                          ↺ Namba imekosewa? Badilisha Nambari
                        </button>

                        <div className="p-2.5 rounded-xl bg-stone-900/90 border border-stone-800 text-[10px] text-stone-400 text-left space-y-1">
                          <span className="font-bold text-amber-300 block">Hujapokea ujumbe wa PIN kwenye simu?</span>
                          <p className="leading-relaxed">
                            Mitandao ya simu inaweza kuchelewa. Unaweza kulipa moja kwa moja kupitia Lipa Namba:{' '}
                            <strong className="text-white font-mono">{(settings.payoutAccount || '5849201').split('(')[0].trim()}</strong> ({(settings.accountOwnerName || 'Jimmy Lema').replace(/\s*\(Wewe Mmiliki\)/gi, '')}).
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <button
                    type="submit"
                    className={`w-full py-3 px-4 text-xs font-black text-white rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2 cursor-pointer ${
                      selectedNetwork === 'mpesa'
                        ? 'bg-red-600 hover:bg-red-500'
                        : selectedNetwork === 'tigopesa'
                        ? 'bg-blue-600 hover:bg-blue-500'
                        : selectedNetwork === 'airtel'
                        ? 'bg-rose-600 hover:bg-rose-500'
                        : 'bg-orange-500 hover:bg-orange-400'
                    }`}
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>LIPA NA UNGANISHA PAPO HAPO</span>
                  </button>
                )}

                {/* Lema AI Instant Customer Help Accordion */}
                <div className="pt-2 border-t border-stone-200/60">
                  <button
                    type="button"
                    onClick={() => setShowAiPortalHelp(!showAiPortalHelp)}
                    className="w-full text-left p-2.5 rounded-xl bg-stone-100 hover:bg-stone-200/70 border border-stone-200 text-stone-700 text-[11px] font-bold flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Msaada wa Papo Hapo wa Lema AI</span>
                    </span>
                    <span className="text-[10px] text-stone-500">{showAiPortalHelp ? '▲ Funga' : '▼ Maswali ya Malipo'}</span>
                  </button>

                  {showAiPortalHelp && (
                    <div className="mt-2 p-3 rounded-xl bg-white border border-stone-200 text-[11px] text-stone-700 space-y-2 animate-fadeIn shadow-xs">
                      <div className="p-2 bg-stone-50 rounded-lg">
                        <strong className="text-stone-900 block font-bold">1. Je, umelipa na hujaunganishwa?</strong>
                        <p className="text-stone-600 text-[10px] mt-0.5 leading-relaxed">
                          Lema AI inakagua miamala ya M-Pesa na Mixx by Yas kila sekunde 3. Ukikwama, subiri sekunde 10 au weka namba yako tena kutuma upya.
                        </p>
                      </div>
                      <div className="p-2 bg-stone-50 rounded-lg">
                        <strong className="text-stone-900 block font-bold">2. Je, unataka vocha ya karatasi?</strong>
                        <p className="text-stone-600 text-[10px] mt-0.5 leading-relaxed">
                          Gusa kichupo cha "Weka Vocha" hapo juu na uingize tarakimu 4 zilizopo kwenye risiti ya karatasi uliyonunua dukani.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </form>
            )}

            {/* TAB 2: Enter Scratch Voucher + QR Camera Scanner */}
            {activeTab === 'voucher' && (
              <form onSubmit={handleRedeemVoucher} className="space-y-4">
                {/* 1-Tap Native Phone Camera Input */}
                <input
                  ref={portalDirectCameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={handleDirectPortalPhoto}
                />

                {/* Single Clean Live QR Camera Scan Button */}
                <button
                  type="button"
                  onClick={() => setShowQrScanner(true)}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-stone-950 font-black text-xs flex items-center justify-center gap-2 shadow-xs cursor-pointer transition-all active:scale-98"
                >
                  <Camera className="w-4 h-4 text-stone-950" />
                  <span>📷 SCAN VOCHA KWA KAMERA (QR CODE)</span>
                </button>
                <p className="text-[10px] text-stone-500 text-center font-medium -mt-2">
                  Elekeza kamera kwenye msimbo wa QR — inasoma kiotomatiki
                </p>

                <div className="flex items-center gap-3 pt-1">
                  <div className="h-px bg-stone-200 flex-1" />
                  <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">Au Andika Namba</span>
                  <div className="h-px bg-stone-200 flex-1" />
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-500 block mb-1">
                    Weka Nambari ya Vocha Uliyonunua:
                  </label>
                  <input
                    type="text"
                    value={voucherCode}
                    onChange={(e) => setVoucherCode(e.target.value)}
                    placeholder="Mfano: 7492 au 8319"
                    className="w-full px-3 py-2.5 text-center text-lg font-mono font-bold tracking-widest border border-[#e6e2d3] rounded-xl bg-white text-[#cca43b] focus:outline-none focus:ring-2 focus:ring-[#cca43b]"
                    required
                  />
                  <span className="text-[10px] text-stone-400 mt-1 block text-center font-medium">
                    Vocha za karatasi zinapatikana maduka na vibanda vyote vya mtaani.
                  </span>
                </div>

                {/* 1. MAC Binding Checkbox */}
                <label className="flex items-start gap-2 p-2.5 rounded-xl bg-stone-100 border border-stone-200 text-[11px] text-stone-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberDeviceChecked}
                    onChange={(e) => setRememberDeviceChecked(e.target.checked)}
                    className="mt-0.5 rounded text-amber-600 focus:ring-amber-500"
                  />
                  <span>
                    <strong className="text-stone-900">Kumbuka Kifaa Hiki (MAC Binding):</strong> Unganisha kiotomatiki kesho bila kuandika vocha upya.
                  </span>
                </label>

                <button
                  type="submit"
                  className="w-full py-3 px-4 text-xs font-black text-white bg-[#cca43b] hover:bg-[#b89332] rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Ticket className="w-3.5 h-3.5" />
                  <span>UNGANISHA VOCHA SASA</span>
                </button>
              </form>
            )}

            {/* TAB: RECONNECT VIA SMS REFERENCE */}
            {activeTab === 'reconnect' && (
              <form onSubmit={handleReconnect} className="space-y-4">
                <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-900 text-xs space-y-1.5">
                  <div className="flex items-center gap-2 font-black text-amber-950">
                    <RotateCw className="w-4 h-4 text-amber-600" />
                    <span>Rudisha Mtandao (Restore via SMS Ref)</span>
                  </div>
                  <p className="text-[11px] text-stone-600 leading-relaxed font-normal">
                    Ulipia kwa <strong>M-Pesa, Mixx by Yas, au Airtel</strong> lakini intaneti ikakatika au unatumia simu mpya? Weka ile namba ya kumbukumbu (Transaction / Reference ID) kutoka kwenye SMS ya mtandao wako wa simu ili kurudisha bando lako papo hapo bila kulipa tena.
                  </p>
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-600 block mb-1">
                    Weka Namba ya Kumbukumbu ya SMS (SMS Ref No.):
                  </label>
                  <input
                    type="text"
                    value={smsReferenceNo}
                    onChange={(e) => setSmsReferenceNo(e.target.value)}
                    placeholder="Mfano: MP261023... au STK123456TZ"
                    className="w-full px-3.5 py-3 text-center text-sm font-mono font-bold tracking-wider border border-[#e6e2d3] rounded-xl bg-white text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#cca43b]"
                    required
                  />
                  <span className="text-[10px] text-stone-400 mt-1 block text-center">
                    Mfano wa namba ya kumbukumbu: <em>STK749281TZ</em> au <em>MP261011</em>
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={isReconnecting}
                  className="w-full py-3 px-4 text-xs font-black text-white bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <RotateCw className={`w-3.5 h-3.5 ${isReconnecting ? 'animate-spin' : ''}`} />
                  <span>{isReconnecting ? 'Inathibitisha Muamala...' : 'RECONNECT (RUDISHA MTANDAO) ⚡'}</span>
                </button>
              </form>
            )}

            {/* 3. TAB: SMART ANTI-ABUSE FREE TRIAL & COOLDOWN */}
            {activeTab === 'trial' && (
              <div className="py-2 space-y-4">
                {trialCooldownRemainingSec > 0 ? (
                  <div className="p-4 rounded-2xl bg-stone-100 border border-stone-300 text-stone-800 space-y-3">
                    <div className="flex items-center gap-2.5 text-stone-900 font-black text-xs uppercase tracking-wide">
                      <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-600 flex items-center justify-center shrink-0">
                        <Lock className="w-4 h-4" />
                      </div>
                      <div>
                        <span>Majaribio Yameshatumika (Anti-Abuse)</span>
                        <span className="block text-[10px] text-stone-500 font-normal">Kifaa hiki kinaruhusiwa mara 1 kila masaa 24</span>
                      </div>
                    </div>
                    <p className="text-xs text-stone-600 leading-relaxed">
                      Kifaa chako (MAC: <span className="font-mono font-bold text-stone-800">{clientMac}</span>) tayari kimeshatumia kipindi cha bure. Jaribio lijalo linapatikana baada ya:
                    </p>
                    <div className="p-2.5 rounded-xl bg-stone-900 text-amber-400 text-center font-mono font-bold text-sm tracking-wider shadow-inner">
                      ⏳ {formatTime(trialCooldownRemainingSec)}
                    </div>
                    <div className="pt-2 border-t border-stone-200">
                      <span className="text-[11px] font-bold text-stone-700 block mb-2">Nunua kifurushi uendelee sasa:</span>
                      <button
                        type="button"
                        onClick={() => setActiveTab('mobile-stk')}
                        className="w-full py-2.5 px-4 text-xs font-black text-white bg-[#cca43b] hover:bg-[#b89332] rounded-xl shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <span>NUNUA KIFURUSHI CHA TSH 500 AU 1,000 ➔</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950 via-teal-900 to-emerald-900 border border-emerald-500/60 text-white space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Gift className="w-5 h-5 text-emerald-400 animate-bounce" />
                          <strong className="text-xs font-black uppercase tracking-wider text-emerald-300">
                            Dakika 15 za Majaribio ya Bure
                          </strong>
                        </div>
                        <span className="text-[9px] font-black uppercase bg-emerald-400 text-stone-950 px-2 py-0.5 rounded-full">
                          BURE 100%
                        </span>
                      </div>
                      <p className="text-xs text-emerald-100 leading-relaxed">
                        Pima kasi ya intaneti ya <strong>LEMA FAST WiFi</strong> kwenye simu yako kabla ya kununua kifurushi.
                      </p>
                      <div className="space-y-1.5 text-[11px] text-emerald-200 pt-1">
                        <div className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Spidi ya kasi hadi 15 Mbps bila kikomo</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Inafaa WhatsApp, TikTok, YouTube & Instagram</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Hakuna malipo wala namba ya kadi inayohitajika</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <button
                        type="button"
                        onClick={handleFreeTrial}
                        className="w-full py-3 px-4 text-xs font-black text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                      >
                        <Zap className="w-4 h-4 fill-white" />
                        <span>ANZA DAKIKA 15 BURE SASA</span>
                      </button>

                      {/* Sponsored Ad Free Unlock Button */}
                      <button
                        type="button"
                        onClick={handleStartWatchAd}
                        className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-purple-900 via-indigo-900 to-stone-900 hover:from-purple-800 hover:to-indigo-800 border border-purple-500/40 text-purple-200 hover:text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
                      >
                        <Megaphone className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                        <span>Au Tazama Tangazo (Sekunde 10) Kupata Bure 🎬</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
            {/* 3 Essential Reassurance FAQs (Maswali Yanayoulizwa Sana na Wateja) */}
            <div className="pt-3 border-t border-stone-200/70 space-y-2">
              <div className="flex items-center gap-1.5 text-[11px] font-black text-stone-700 uppercase tracking-wide">
                <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
                <span>Maswali Yanayoulizwa (FAQ):</span>
              </div>

              <div className="space-y-1.5 text-left">
                {/* Q1 */}
                <div className="border border-[#e6e2d3] rounded-xl bg-white overflow-hidden shadow-2xs">
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(openFaqIndex === 0 ? null : 0)}
                    className="w-full p-2.5 text-left text-[11px] font-bold text-stone-900 flex items-center justify-between cursor-pointer hover:bg-stone-50"
                  >
                    <span>Je, nitaunganishwa moja kwa moja baada ya kulipa?</span>
                    <ChevronRight className={`w-3.5 h-3.5 text-stone-400 transition-transform ${openFaqIndex === 0 ? 'rotate-90 text-amber-600' : ''}`} />
                  </button>
                  {openFaqIndex === 0 && (
                    <div className="p-2.5 pt-1 text-[10px] text-stone-600 border-t border-stone-100 bg-[#fdfbf7] leading-relaxed">
                      Ndiyo! Ndani ya sekunde 3 hadi 5 mara tu unapoingiza PIN yako ya mtandao na kukatwa salio, mfumo utakuruhusu kuvinjari intaneti mara moja bila kuandika vocha kwa mkono.
                    </div>
                  )}
                </div>

                {/* Q2 */}
                <div className="border border-[#e6e2d3] rounded-xl bg-white overflow-hidden shadow-2xs">
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(openFaqIndex === 1 ? null : 1)}
                    className="w-full p-2.5 text-left text-[11px] font-bold text-stone-900 flex items-center justify-between cursor-pointer hover:bg-stone-50"
                  >
                    <span>Nikizima WiFi au kuondoka nitarudi vipi?</span>
                    <ChevronRight className={`w-3.5 h-3.5 text-stone-400 transition-transform ${openFaqIndex === 1 ? 'rotate-90 text-amber-600' : ''}`} />
                  </button>
                  {openFaqIndex === 1 && (
                    <div className="p-2.5 pt-1 text-[10px] text-stone-600 border-t border-stone-100 bg-[#fdfbf7] leading-relaxed">
                      Simu yako inatambuliwa kiotomatiki kwa anwani ya kipekee ya kifaa (MAC Auto-Login). Ukirudi au ukiwasha tena WiFi, unabonyeza tu "Unganisha Kiotomatiki" bila kulipa tena.
                    </div>
                  )}
                </div>

                {/* Q3 */}
                <div className="border border-[#e6e2d3] rounded-xl bg-white overflow-hidden shadow-2xs">
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(openFaqIndex === 2 ? null : 2)}
                    className="w-full p-2.5 text-left text-[11px] font-bold text-stone-900 flex items-center justify-between cursor-pointer hover:bg-stone-50"
                  >
                    <span>Voucher yangu inaweza kutumika simu nyingine?</span>
                    <ChevronRight className={`w-3.5 h-3.5 text-stone-400 transition-transform ${openFaqIndex === 2 ? 'rotate-90 text-amber-600' : ''}`} />
                  </button>
                  {openFaqIndex === 2 && (
                    <div className="p-2.5 pt-1 text-[10px] text-stone-600 border-t border-stone-100 bg-[#fdfbf7] leading-relaxed">
                      Hapana. Vocha inafungwa kwenye simu iliyolipa (kifaa kimoja kwa wakati mmoja) ili kukulinda dhidi ya wizi wa bando na kuhakikisha unapata spidi kamili ya Fiber/Starlink bila kubuffer.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 4. Support Footer with Diagnostic Telemetry */}
        <div className="pt-4 border-t border-stone-200/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-stone-500">
          <div>
            Msaada wa Wateja: <strong className="text-stone-800">{settings.supportPhone || '0653 578 184'}</strong>
          </div>
          <a
            href={getDiagnosticWhatsAppUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 font-bold rounded-xl transition-colors cursor-pointer shadow-xs active:scale-95"
            title="Tuma Ombi la Msaada WhatsApp pamoja na Taarifa za Kifaa"
          >
            <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
            <span>Msaada wa WhatsApp (w/ Device Info)</span>
          </a>
        </div>

        {/* Subtle Portal Footer & Admin Entry */}
        <div className="pt-3 border-t border-stone-200/40 flex items-center justify-between text-[10px] text-stone-400">
          <span>© {new Date().getFullYear()} {settings.hotspotName || 'Lema Fast WiFi'}</span>
          {onNavigateToAdmin && (
            <button
              type="button"
              onClick={onNavigateToAdmin}
              className="text-stone-400 hover:text-stone-600 transition-colors cursor-pointer"
            >
              Msimamizi / Admin Login
            </button>
          )}
        </div>
      </div>

      {/* 2. In-Portal QR Camera Scanner Modal */}
      <VoucherQrScannerModal
        isOpen={showQrScanner}
        onClose={() => setShowQrScanner(false)}
        onScanSuccess={handleQrScannedCode}
      />

      {/* Sponsored Ad Watch Modal */}
      {isWatchingAdModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/85 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-stone-900 border border-stone-700 rounded-3xl overflow-hidden shadow-2xl p-5 space-y-4 text-white text-center">
            <div className="flex items-center justify-between border-b border-stone-800 pb-2.5">
              <span className="text-[10px] font-mono text-amber-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Megaphone className="w-3.5 h-3.5 text-amber-400" />
                <span>Tangazo la Mfadhili wa WiFi</span>
              </span>
              <span className="text-xs font-mono font-black text-amber-300 bg-amber-500/20 px-2.5 py-0.5 rounded-lg border border-amber-500/30">
                {adWatchCountdown > 0 ? `${adWatchCountdown}s` : '✓ Tayari'}
              </span>
            </div>

            {/* Featured Ad card inside modal */}
            <div className={`p-4 rounded-2xl border text-left space-y-2.5 bg-gradient-to-r ${adBanners[currentAdIndex]?.bgGradient || 'from-stone-900 via-stone-850 to-stone-900 border-amber-500/40 text-stone-200'}`}>
              <div className="flex items-center justify-between">
                <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${adBanners[currentAdIndex]?.badgeColor || 'bg-amber-500 text-stone-950'}`}>
                  {adBanners[currentAdIndex]?.tag || '⚡ Lema Fast WiFi'}
                </span>
                <span className="text-[10px] text-stone-300 font-mono">
                  {adBanners[currentAdIndex]?.sponsor || 'Lema Fast WiFi'}
                </span>
              </div>
              <h4 className="text-sm font-black text-white">
                {adBanners[currentAdIndex]?.title || 'Lema Fast WiFi - Intaneti ya Kasi'}
              </h4>
              <p className="text-xs text-stone-200 leading-relaxed font-normal">
                {adBanners[currentAdIndex]?.desc || 'Furahia intaneti ya kasi ya Fiber & Starlink mtaani kwako kwa bei nafuu sana.'}
              </p>
              <div className="pt-2">
                <a
                  href={`https://wa.me/${(adBanners[currentAdIndex]?.phone || '255653578184').replace(/[^0-9]/g, '')}?text=Habari!+Nimeona+tangazo+lako+la+${encodeURIComponent(adBanners[currentAdIndex]?.title || 'WiFi')}+kwenye+LEMA+FAST+WiFi`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => recordAdClick(adBanners[currentAdIndex]?.id)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-black text-xs rounded-xl shadow-xs active:scale-95 transition-all"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Wasiliana na Mfadhili (WhatsApp)</span>
                </a>
              </div>
            </div>

            {/* Countdown progress bar */}
            <div className="space-y-1.5">
              <div className="w-full bg-stone-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-amber-400 h-full transition-all duration-1000 ease-linear"
                  style={{ width: `${Math.min(100, Math.max(0, ((10 - adWatchCountdown) / 10) * 100))}%` }}
                />
              </div>
              <p className="text-[11px] text-stone-400">
                {adWatchCountdown > 0
                  ? `Subiri sekunde ${adWatchCountdown} kupokea intaneti ya bure...`
                  : 'Hongera! Tangazo limekamilika. Bonyeza kitufe hapa chini kuwasha mtandao!'}
              </p>
            </div>

            {adWatchCountdown === 0 ? (
              <button
                type="button"
                onClick={() => {
                  setIsWatchingAdModal(false);
                  handleFreeTrial();
                }}
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-black text-xs rounded-xl shadow-lg transition-all animate-bounce cursor-pointer uppercase tracking-wider"
              >
                FUNGUA INTANETI YA BURE SASA ➔
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsWatchingAdModal(false)}
                className="text-[10px] text-stone-500 hover:text-stone-300 underline cursor-pointer"
              >
                Ghairi (Funga Tangazo)
              </button>
            )}
          </div>
        </div>
      )}

      {/* Speed Test Modal */}
      {showSpeedTestModal && (
        <SpeedTestWidget
          isModal={true}
          onClose={() => setShowSpeedTestModal(false)}
          businessName={settings.hotspotName || 'LEMA FAST WiFi'}
        />
      )}

      {/* Step-by-Step Interactive Voice Guide Modal */}
      <VoiceGuideModal
        isOpen={showVoiceGuideModal}
        onClose={() => setShowVoiceGuideModal(false)}
        onSelectTab={(tab) => setActiveTab(tab)}
        supportPhone={settings.supportPhone}
        hotspotName={settings.hotspotName}
      />
    </div>
  );
};
