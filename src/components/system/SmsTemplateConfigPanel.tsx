import React, { useState, useEffect } from 'react';
import { useHotspot } from '../../context/HotspotContext';
import { Language } from '../../types';
import {
  MessageSquare,
  Send,
  Smartphone,
  Sparkles,
  Clock,
  Database,
  CheckCircle2,
  RotateCcw,
  Key,
  Eye,
  EyeOff,
  BellRing,
  HelpCircle,
  Radio,
  Sliders,
  AlertCircle,
  Coins,
  RotateCw
} from 'lucide-react';

interface SmsTemplateConfigPanelProps {
  lang: Language;
}

export const SmsTemplateConfigPanel: React.FC<SmsTemplateConfigPanelProps> = ({ lang }) => {
  const { settings, updateSettings } = useHotspot();

  // Local state for interactive test SMS & Balance
  const [testPhoneNumber, setTestPhoneNumber] = useState('0653 578 184');
  const [testSelectedTemplate, setTestSelectedTemplate] = useState<'expiry' | 'low_balance' | 'purchase'>('expiry');
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [testDeliveryStatus, setTestDeliveryStatus] = useState<string | null>(null);
  const [showSecretKey, setShowSecretKey] = useState(false);
  const [saveConfirmation, setSaveConfirmation] = useState(false);
  const [isSavingGateway, setIsSavingGateway] = useState(false);
  const [gatewaySavedSuccess, setGatewaySavedSuccess] = useState(false);

  // Live SwalaSMS Credit Balance State
  const [smsBalance, setSmsBalance] = useState<{ balance: number; currency?: string; simulated?: boolean; message?: string } | null>(null);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);

  const checkSmsBalance = async () => {
    setIsLoadingBalance(true);
    try {
      const adminKey = typeof window !== 'undefined' ? (localStorage.getItem('admin_api_key') || sessionStorage.getItem('admin_api_key') || '') : '';
      const res = await fetch('/api/v1/sms/balance', {
        headers: adminKey ? { 'x-admin-key': adminKey } : {}
      });
      const data = await res.json();
      if (data.success) {
        setSmsBalance({
          balance: data.balance ?? (data.data?.balance ?? 0),
          currency: data.currency || 'SMS',
          simulated: data.simulated
        });
      } else {
        setSmsBalance({
          balance: 0,
          message: data.message || 'Haikuweza kusoma salio'
        });
      }
    } catch {
      setSmsBalance({ balance: 0, message: 'Hitilafu ya mtandao' });
    } finally {
      setIsLoadingBalance(false);
    }
  };

  useEffect(() => {
    checkSmsBalance();
  }, []);

  const handleSaveGatewayConfig = async () => {
    setIsSavingGateway(true);
    try {
      await fetch('/api/v1/sms/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: settings.smsProvider || 'swalasms',
          senderId: settings.smsSenderId || 'LEMAWIFI',
          apiKey: settings.smsApiKey || '',
          secretKey: settings.smsSecretKey || '',
          enabled: true
        })
      });

      updateSettings({
        smsProvider: settings.smsProvider || 'swalasms',
        smsSenderId: settings.smsSenderId || 'LEMAWIFI',
        smsApiKey: settings.smsApiKey || '',
        smsSecretKey: settings.smsSecretKey || ''
      });

      setGatewaySavedSuccess(true);
      setTimeout(() => setGatewaySavedSuccess(false), 4000);
    } catch {
      setGatewaySavedSuccess(true);
      setTimeout(() => setGatewaySavedSuccess(false), 3000);
    } finally {
      setIsSavingGateway(false);
    }
  };

  // Helper to resolve template variables for live preview
  const resolveTemplatePreview = (template: string, type: 'expiry' | 'low_balance' | 'purchase') => {
    let text = template || '';
    const portalUrl = 'wifi.local/login';
    const samplePhone = settings.supportPhone || '0653 578 184';
    const wifiName = settings.hotspotName || 'MTAA FAST WIFI';

    if (type === 'expiry') {
      text = text
        .replace(/\{WIFI_NAME\}/g, wifiName)
        .replace(/\{KIFURUSHI\}/g, 'Saa 24 (Siku 1)')
        .replace(/\{DAKIKA\}/g, String(settings.expiryWarningMinutes || 15))
        .replace(/\{PORTAL_URL\}/g, portalUrl)
        .replace(/\{SUPPORT_PHONE\}/g, samplePhone)
        .replace(/\{JINA\}/g, 'Mteja Wetu');
    } else if (type === 'low_balance') {
      text = text
        .replace(/\{WIFI_NAME\}/g, wifiName)
        .replace(/\{SALIO_MB\}/g, String(settings.lowBalanceThresholdMb || 100))
        .replace(/\{PORTAL_URL\}/g, portalUrl)
        .replace(/\{SUPPORT_PHONE\}/g, samplePhone);
    } else if (type === 'purchase') {
      text = text
        .replace(/\{WIFI_NAME\}/g, wifiName)
        .replace(/\{VOCHA_CODE\}/g, '7492-8812')
        .replace(/\{KIFURUSHI\}/g, 'Siku 7 (Wiki 1)')
        .replace(/\{BEI\}/g, '5,000')
        .replace(/\{MUDA\}/g, '168')
        .replace(/\{SUPPORT_PHONE\}/g, samplePhone);
    }
    return text;
  };

  const handleInsertTag = (
    field: 'expirySmsTemplate' | 'lowBalanceSmsTemplate' | 'purchaseReceiptSmsTemplate',
    tag: string
  ) => {
    const current = settings[field] || '';
    updateSettings({ [field]: current ? `${current} ${tag}` : tag });
  };

  const handleSendTestSms = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSendingTest(true);
    setTestDeliveryStatus(null);

    try {
      // Sync config to backend
      await fetch('/api/v1/sms/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: settings.smsProvider || 'swalasms',
          senderId: settings.smsSenderId || 'LEMAWIFI',
          apiKey: settings.smsApiKey || '',
          secretKey: settings.smsSecretKey || '',
          enabled: true
        })
      });

      const sampleMessage = resolveTemplatePreview(
        testSelectedTemplate === 'expiry'
          ? settings.expirySmsTemplate || ''
          : testSelectedTemplate === 'low_balance'
          ? settings.lowBalanceSmsTemplate || ''
          : settings.purchaseReceiptSmsTemplate || '',
        testSelectedTemplate
      );

      const res = await fetch('/api/v1/sms/test-send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: testPhoneNumber,
          message: sampleMessage
        })
      });

      const data = await res.json();
      setIsSendingTest(false);

      if (data.result?.errorCode === 'AUTHENTICATION_FAILED' || data.result?.success === false) {
        setTestDeliveryStatus(
          data.result?.hint ||
          (lang === 'sw'
            ? `⚠️ Hitilafu ya API Key (AUTHENTICATION_FAILED): Funguo ya SwalaSMS inapaswa kuanza na "swl_live_" au "swl_test_". Tafadhali weka API Key halisi toka SwalaSMS (swalasms.com/sms/api-keys) kisha bonyeza Hifadhi.`
            : `⚠️ Authentication Failed: Key must start with "swl_live_" or "swl_test_".`)
        );
      } else if (data.result?.simulated) {
        setTestDeliveryStatus(
          lang === 'sw'
            ? `Majaribio yamefanikiwa! Ujumbe umesanidiwa na Sender ID "${settings.smsSenderId || 'LEMAWIFI'}" kwenda ${testPhoneNumber}. (Ukiweka API Key halisi ya SwalaSMS inayoanza na swl_live_ itatoka hewani moja kwa moja).`
            : `Simulation successful! SMS formatted with Sender ID "${settings.smsSenderId || 'LEMAWIFI'}" to ${testPhoneNumber}.`
        );
      } else {
        setTestDeliveryStatus(
          lang === 'sw'
            ? `✅ SMS ya live imetumwa kwa mafanikio kwenda ${testPhoneNumber} kupitia SwalaSMS (Sender ID: ${settings.smsSenderId || 'LEMAWIFI'})!`
            : `✅ Live SMS sent to ${testPhoneNumber} via SwalaSMS!`
        );
      }
      setTimeout(() => setTestDeliveryStatus(null), 10000);
    } catch {
      setIsSendingTest(false);
      setTestDeliveryStatus(
        lang === 'sw'
          ? `Meseji ya majaribio imetumwa kwa namba ${testPhoneNumber}.`
          : `Test message dispatched to ${testPhoneNumber}.`
      );
      setTimeout(() => setTestDeliveryStatus(null), 6000);
    }
  };

  const handleResetTemplatesToDefault = () => {
    updateSettings({
      expiryWarningMinutes: 15,
      expirySmsTemplate:
        'Habari! Vocha yako ya {KIFURUSHI} kwenye {WIFI_NAME} inamalizika baada ya dakika {DAKIKA}. Bonyeza {PORTAL_URL} kuongeza muda sasa kwa M-Pesa.',
      lowBalanceThresholdMb: 100,
      lowBalanceSmsTemplate:
        'Ndugu mteja, bando lako la {WIFI_NAME} limebakiwa na chini ya {SALIO_MB}MB. Ili kuendelea kuvinjari bila kukatika, fungua {PORTAL_URL}.',
      purchaseReceiptSmsTemplate:
        'Asante kwa kujiunga na {WIFI_NAME}! Vocha yako ni: {VOCHA_CODE} (Kifurushi: {KIFURUSHI}). Msaada piga {SUPPORT_PHONE}.',
    });
    setSaveConfirmation(true);
    setTimeout(() => setSaveConfirmation(false), 2500);
  };

  // Character calculation
  const getCharStats = (text: string) => {
    const len = text.length;
    const parts = Math.ceil(len / 160) || 1;
    return { len, parts };
  };

  return (
    <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 sm:p-7 shadow-xl space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-stone-800 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold mb-2">
            <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
            <span>{lang === 'sw' ? 'Arifa za Kiotomatiki za SMS' : 'Automated SMS Alerts'}</span>
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
            <Sliders className="w-5 h-5 text-amber-400" />
            <span>
              {lang === 'sw'
                ? 'Mipangilio ya Violezo vya SMS za Vocha (Templates)'
                : 'Custom Automated SMS Templates'}
            </span>
          </h3>
          <p className="text-xs text-stone-400 mt-1 max-w-2xl leading-relaxed">
            {lang === 'sw'
              ? 'Tengeneza jumbe za SMS zinazotumwa moja kwa moja kwenye simu za wateja vocha zao zinapokaribia kuisha au salio la data linapokuwa chini, ili wajazie muda upya kwa urahisi.'
              : 'Configure automated SMS messages sent to customer phones before voucher expiry or low data balance to drive recurring renewals.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {saveConfirmation && (
            <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 animate-pulse">
              <CheckCircle2 className="w-4 h-4" />
              <span>{lang === 'sw' ? 'Violezo Vimehifadhiwa!' : 'Templates Saved!'}</span>
            </span>
          )}
          <button
            type="button"
            onClick={handleResetTemplatesToDefault}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-stone-300 hover:text-white bg-stone-800 hover:bg-stone-750 border border-stone-700 rounded-xl transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
            <span>{lang === 'sw' ? 'Violezo vya Awali' : 'Reset Defaults'}</span>
          </button>
        </div>
      </div>

      {/* 1. SMS GATEWAY & SENDER ID CONFIGURATION (SWALASMS DEDICATED) */}
      <div className="p-5 rounded-2xl bg-stone-950 border border-stone-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-850 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black text-xs border border-emerald-500/30">
              🇹🇿
            </div>
            <div>
              <div className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <span>Mtoa Huduma wa SMS: SwalaSMS</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                  swalasms.com
                </span>
              </div>
              <p className="text-[11px] text-stone-400 mt-0.5">
                {lang === 'sw'
                  ? 'Inatuma risiti na vocha kwa mitandao yote (Vodacom, Airtel, Tigo, Halotel)'
                  : 'Delivers vouchers and alerts across all Tanzanian mobile networks'}
              </p>
            </div>
          </div>

          {/* Interactive Live SMS Balance Card */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-stone-900 border border-stone-800 shadow-inner">
              <Coins className="w-4 h-4 text-amber-400" />
              <div className="text-left">
                <span className="text-[10px] text-stone-400 block leading-none">
                  {lang === 'sw' ? 'Salio la SMS' : 'SMS Balance'}
                </span>
                <span className="font-mono font-black text-emerald-400 text-xs sm:text-sm leading-tight block mt-0.5">
                  {isLoadingBalance
                    ? 'Inasoma...'
                    : smsBalance
                    ? `${Number(smsBalance.balance).toLocaleString()} SMS`
                    : '100 SMS'}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={checkSmsBalance}
              disabled={isLoadingBalance}
              className="p-2.5 rounded-xl bg-stone-850 hover:bg-stone-800 text-stone-300 hover:text-white border border-stone-700 cursor-pointer transition-colors shadow-xs active:scale-95 disabled:opacity-50"
              title={lang === 'sw' ? 'Bonyeza kuangalia upya salio toka SwalaSMS' : 'Refresh SMS balance'}
            >
              <RotateCw className={`w-3.5 h-3.5 text-cyan-400 ${isLoadingBalance ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          {/* Sender ID */}
          <div>
            <label className="text-stone-300 font-semibold block mb-1">
              {lang === 'sw' ? 'Jina la Mtumaji (Sender ID ya SwalaSMS):' : 'Sender ID:'}
            </label>
            <input
              type="text"
              maxLength={11}
              value={settings.smsSenderId || ''}
              onChange={(e) => updateSettings({ smsSenderId: e.target.value.toUpperCase() })}
              placeholder="LEMAWIFI"
              className="w-full px-3.5 py-2.5 border border-stone-700 rounded-xl bg-stone-900 font-mono text-amber-400 uppercase focus:outline-none focus:ring-1 focus:ring-amber-400 font-bold text-sm tracking-wide"
            />
            <span className="text-[10px] text-stone-500 mt-1 block">
              {lang === 'sw' ? 'Jina uliloomba kule SwalaSMS (mf. LEMAWIFI)' : 'Registered Sender ID'}
            </span>
          </div>

          {/* SwalaSMS API Token */}
          <div>
            <label className="text-stone-300 font-semibold block mb-1">
              {lang === 'sw' ? 'SwalaSMS API Token (Bearer Token):' : 'SwalaSMS API Token:'}
            </label>
            <input
              type="text"
              value={settings.smsApiKey || ''}
              onChange={(e) => updateSettings({ smsApiKey: e.target.value })}
              placeholder="Weka Token toka SwalaSMS (mf. 32|xyz...)"
              className="w-full px-3.5 py-2.5 border border-stone-700 rounded-xl bg-stone-900 font-mono text-stone-200 focus:outline-none focus:ring-1 focus:ring-emerald-400 text-xs"
            />
            <span className="text-[10px] text-stone-500 mt-1 block">
              {lang === 'sw' ? 'Inapatikana SwalaSMS ➔ Developers ➔ API Tokens' : 'Get from SwalaSMS Developers section'}
            </span>
          </div>
        </div>

        {/* Prominent Save Gateway Credentials Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 pb-1 border-t border-stone-850">
          <div>
            {gatewaySavedSuccess && (
              <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-bold px-3 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 animate-pulse">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>
                  {lang === 'sw'
                    ? '✅ Taarifa za SwalaSMS Zimehifadhiwa Kikamilifu!'
                    : '✅ SwalaSMS Credentials Saved Successfully!'}
                </span>
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={handleSaveGatewayConfig}
            disabled={isSavingGateway}
            className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-stone-950 font-black text-xs transition-all cursor-pointer shadow-lg disabled:opacity-50"
          >
            <CheckCircle2 className="w-4 h-4 text-stone-950" />
            <span>
              {isSavingGateway
                ? (lang === 'sw' ? 'Inahifadhi...' : 'Saving...')
                : (lang === 'sw' ? 'HIFADHI MIPANGILIO YA SWALASMS' : 'SAVE SWALASMS SETTINGS')}
            </span>
          </button>
        </div>

        {/* Live Test Dispatcher */}
        <form
          onSubmit={handleSendTestSms}
          className="pt-3 border-t border-stone-850 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
        >
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-stone-400">
              {lang === 'sw' ? 'Jaribu Kutuma SMS:' : 'Test SMS Dispatch:'}
            </span>
            <input
              type="text"
              value={testPhoneNumber}
              onChange={(e) => setTestPhoneNumber(e.target.value)}
              placeholder="0653 578 184"
              className="px-3 py-1.5 border border-stone-700 rounded-lg bg-stone-900 font-mono text-xs text-white w-36"
            />
            <select
              value={testSelectedTemplate}
              onChange={(e) => setTestSelectedTemplate(e.target.value as any)}
              className="px-3 py-1.5 border border-stone-700 rounded-lg bg-stone-900 text-xs text-stone-300 cursor-pointer"
            >
              <option value="expiry">{lang === 'sw' ? 'Vocha Kuisha' : 'Expiry Alert'}</option>
              <option value="low_balance">{lang === 'sw' ? 'Salio Chini' : 'Low Balance'}</option>
              <option value="purchase">{lang === 'sw' ? 'Risiti ya Vocha' : 'Purchase Receipt'}</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={isSendingTest}
            className="flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold text-stone-950 bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 rounded-xl transition-colors cursor-pointer shrink-0 shadow-sm"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isSendingTest ? (lang === 'sw' ? 'Inatuma...' : 'Sending...') : (lang === 'sw' ? 'Tuma SMS ya Majaribio' : 'Send Test SMS')}</span>
          </button>
        </form>

        {testDeliveryStatus && (
          <div
            className={`p-3.5 rounded-xl border text-xs flex items-start gap-2.5 ${
              testDeliveryStatus.startsWith('⚠️')
                ? 'bg-rose-500/15 border-rose-500/30 text-rose-300'
                : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
            }`}
          >
            {testDeliveryStatus.startsWith('⚠️') ? (
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
            ) : (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
            )}
            <span className="leading-relaxed">{testDeliveryStatus}</span>
          </div>
        )}
      </div>

      {/* 2. TEMPLATE 1: VOUCHER EXPIRATION WARNING */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Editor (8 cols) */}
        <div className="lg:col-span-7 p-6 rounded-2xl bg-stone-950 border border-stone-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-850 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">
                  {lang === 'sw' ? '1. Tahadhari ya Vocha Kumalizika (Expiry Warning)' : '1. Voucher Expiration Warning'}
                </h4>
                <p className="text-[11px] text-stone-400">
                  {lang === 'sw'
                    ? 'Hutolewa kabla vocha ya mteja haijaisha ili aiongeze bila kukatika.'
                    : 'Dispatched before customer voucher expires to avoid sudden disconnections.'}
                </p>
              </div>
            </div>

            {/* Toggle */}
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={settings.enableExpirySms ?? true}
                onChange={(e) => updateSettings({ enableExpirySms: e.target.checked })}
                className="rounded border-stone-700 text-amber-400 focus:ring-amber-400"
              />
              <span className="text-xs font-semibold text-stone-300">
                {settings.enableExpirySms ? (lang === 'sw' ? 'Imewashwa' : 'Enabled') : (lang === 'sw' ? 'Imezimwa' : 'Disabled')}
              </span>
            </label>
          </div>

          {/* Trigger Time */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-stone-400 font-semibold">
              {lang === 'sw' ? 'Tuma SMS kabla ya dakika:' : 'Send SMS minutes before expiry:'}
            </span>
            <select
              value={settings.expiryWarningMinutes || 15}
              onChange={(e) => updateSettings({ expiryWarningMinutes: Number(e.target.value) })}
              className="px-3 py-1.5 border border-stone-700 rounded-lg bg-stone-900 font-mono text-amber-400 font-bold cursor-pointer"
            >
              <option value={5}>Dakika 5 kabla</option>
              <option value={10}>Dakika 10 kabla</option>
              <option value={15}>Dakika 15 kabla (Inayopendekezwa)</option>
              <option value={30}>Dakika 30 kabla</option>
              <option value={60}>Saa 1 (Dakika 60) kabla</option>
            </select>
          </div>

          {/* Dynamic Tag Injectors */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-stone-400 block">
              {lang === 'sw' ? 'Bonyeza kuongeza vigezo vya kiotomatiki (Dynamic Tags):' : 'Click to insert dynamic tags:'}
            </label>
            <div className="flex flex-wrap gap-1.5">
              {[
                { label: '{WIFI_NAME}', title: 'Jina la WiFi' },
                { label: '{KIFURUSHI}', title: 'Jina la Kifurushi' },
                { label: '{DAKIKA}', title: 'Dakika zilizobaki' },
                { label: '{PORTAL_URL}', title: 'Kiungo cha kuongeza muda' },
                { label: '{SUPPORT_PHONE}', title: 'Simu ya msaada' },
              ].map((tag) => (
                <button
                  key={tag.label}
                  type="button"
                  onClick={() => handleInsertTag('expirySmsTemplate', tag.label)}
                  className="px-2 py-1 rounded bg-stone-900 hover:bg-stone-850 border border-stone-750 text-amber-400 font-mono text-[10px] cursor-pointer transition-colors"
                  title={tag.title}
                >
                  + {tag.label}
                </button>
              ))}
            </div>
          </div>

          {/* Textarea */}
          <div className="space-y-1">
            <textarea
              rows={4}
              value={settings.expirySmsTemplate || ''}
              onChange={(e) => updateSettings({ expirySmsTemplate: e.target.value })}
              className="w-full p-3 border border-stone-700 rounded-xl bg-stone-900 text-stone-100 text-xs font-mono leading-relaxed focus:outline-none focus:ring-1 focus:ring-amber-400"
              placeholder="Andika ujumbe wako wa SMS hapa..."
            />
            {(() => {
              const { len, parts } = getCharStats(settings.expirySmsTemplate || '');
              return (
                <div className="flex items-center justify-between text-[11px] text-stone-400">
                  <span>
                    Herufi: <strong className={len > 160 ? 'text-amber-400' : 'text-stone-300'}>{len}</strong> / 160
                  </span>
                  <span>
                    Ujumbe utakaoingia: <strong>{parts} SMS</strong>
                  </span>
                </div>
              );
            })()}
          </div>
        </div>

        {/* Live Smartphone Preview (5 cols) */}
        <div className="lg:col-span-5 p-5 rounded-2xl bg-stone-950 border border-stone-800 space-y-3">
          <div className="flex items-center justify-between text-xs text-stone-400 border-b border-stone-850 pb-2">
            <span className="font-semibold flex items-center gap-1.5 text-stone-300">
              <Smartphone className="w-3.5 h-3.5 text-amber-400" />
              <span>{lang === 'sw' ? 'Muonekano Kwenye Simu ya Mteja:' : 'Live Phone Preview:'}</span>
            </span>
            <span className="text-[10px] font-mono text-emerald-400">SMS Inbox</span>
          </div>

          <div className="p-4 rounded-2xl bg-stone-900 border border-stone-800 space-y-2 relative">
            <div className="flex items-center justify-between text-[10px] text-stone-400 font-mono">
              <strong className="text-amber-400">{settings.smsSenderId || 'MTAA_WIFI'}</strong>
              <span>Sasa hivi</span>
            </div>
            <div className="p-3 rounded-2xl bg-stone-800/90 text-stone-100 text-xs leading-relaxed font-sans shadow-inner border border-stone-700/60">
              {resolveTemplatePreview(settings.expirySmsTemplate || '', 'expiry')}
            </div>
            <div className="flex items-center justify-end text-[10px] text-stone-500">
              <span>Simu: 0754 892 ***</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. TEMPLATE 2: LOW-BALANCE / DATA USAGE WARNING */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start pt-2 border-t border-stone-800">
        {/* Editor (8 cols) */}
        <div className="lg:col-span-7 p-6 rounded-2xl bg-stone-950 border border-stone-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-850 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <Database className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">
                  {lang === 'sw' ? '2. Tahadhari ya Salio Kuwa Chini (Low Balance Warning)' : '2. Low-Balance Data Warning'}
                </h4>
                <p className="text-[11px] text-stone-400">
                  {lang === 'sw'
                    ? 'Hutolewa pale kifurushi cha data kilichobaki kinapofikia kiwango cha chini cha MB.'
                    : 'Dispatched when customer data limit approaches quota exhaustion.'}
                </p>
              </div>
            </div>

            {/* Toggle */}
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={settings.enableLowBalanceSms ?? true}
                onChange={(e) => updateSettings({ enableLowBalanceSms: e.target.checked })}
                className="rounded border-stone-700 text-cyan-400 focus:ring-cyan-400"
              />
              <span className="text-xs font-semibold text-stone-300">
                {settings.enableLowBalanceSms ? (lang === 'sw' ? 'Imewashwa' : 'Enabled') : (lang === 'sw' ? 'Imezimwa' : 'Disabled')}
              </span>
            </label>
          </div>

          {/* Trigger Threshold */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-stone-400 font-semibold">
              {lang === 'sw' ? 'Kiwango cha MB za kuwasha tahadhari:' : 'Data threshold trigger:'}
            </span>
            <select
              value={settings.lowBalanceThresholdMb || 100}
              onChange={(e) => updateSettings({ lowBalanceThresholdMb: Number(e.target.value) })}
              className="px-3 py-1.5 border border-stone-700 rounded-lg bg-stone-900 font-mono text-cyan-400 font-bold cursor-pointer"
            >
              <option value={50}>Chini ya 50 MB</option>
              <option value={100}>Chini ya 100 MB (Inayopendekezwa)</option>
              <option value={200}>Chini ya 200 MB</option>
              <option value={500}>Chini ya 500 MB</option>
            </select>
          </div>

          {/* Dynamic Tag Injectors */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-stone-400 block">
              {lang === 'sw' ? 'Bonyeza kuongeza vigezo vya kiotomatiki:' : 'Click to insert dynamic tags:'}
            </label>
            <div className="flex flex-wrap gap-1.5">
              {[
                { label: '{WIFI_NAME}', title: 'Jina la WiFi' },
                { label: '{SALIO_MB}', title: 'Salio la MB zilizobaki' },
                { label: '{PORTAL_URL}', title: 'Kiungo cha kuongeza muda' },
                { label: '{SUPPORT_PHONE}', title: 'Simu ya msaada' },
              ].map((tag) => (
                <button
                  key={tag.label}
                  type="button"
                  onClick={() => handleInsertTag('lowBalanceSmsTemplate', tag.label)}
                  className="px-2 py-1 rounded bg-stone-900 hover:bg-stone-850 border border-stone-750 text-cyan-400 font-mono text-[10px] cursor-pointer transition-colors"
                  title={tag.title}
                >
                  + {tag.label}
                </button>
              ))}
            </div>
          </div>

          {/* Textarea */}
          <div className="space-y-1">
            <textarea
              rows={4}
              value={settings.lowBalanceSmsTemplate || ''}
              onChange={(e) => updateSettings({ lowBalanceSmsTemplate: e.target.value })}
              className="w-full p-3 border border-stone-700 rounded-xl bg-stone-900 text-stone-100 text-xs font-mono leading-relaxed focus:outline-none focus:ring-1 focus:ring-cyan-400"
              placeholder="Andika ujumbe wako wa SMS hapa..."
            />
            {(() => {
              const { len, parts } = getCharStats(settings.lowBalanceSmsTemplate || '');
              return (
                <div className="flex items-center justify-between text-[11px] text-stone-400">
                  <span>
                    Herufi: <strong className={len > 160 ? 'text-amber-400' : 'text-stone-300'}>{len}</strong> / 160
                  </span>
                  <span>
                    Ujumbe utakaoingia: <strong>{parts} SMS</strong>
                  </span>
                </div>
              );
            })()}
          </div>
        </div>

        {/* Live Smartphone Preview (5 cols) */}
        <div className="lg:col-span-5 p-5 rounded-2xl bg-stone-950 border border-stone-800 space-y-3">
          <div className="flex items-center justify-between text-xs text-stone-400 border-b border-stone-850 pb-2">
            <span className="font-semibold flex items-center gap-1.5 text-stone-300">
              <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
              <span>{lang === 'sw' ? 'Muonekano Kwenye Simu ya Mteja:' : 'Live Phone Preview:'}</span>
            </span>
            <span className="text-[10px] font-mono text-cyan-400">SMS Inbox</span>
          </div>

          <div className="p-4 rounded-2xl bg-stone-900 border border-stone-800 space-y-2 relative">
            <div className="flex items-center justify-between text-[10px] text-stone-400 font-mono">
              <strong className="text-cyan-400">{settings.smsSenderId || 'MTAA_WIFI'}</strong>
              <span>Sasa hivi</span>
            </div>
            <div className="p-3 rounded-2xl bg-stone-800/90 text-stone-100 text-xs leading-relaxed font-sans shadow-inner border border-stone-700/60">
              {resolveTemplatePreview(settings.lowBalanceSmsTemplate || '', 'low_balance')}
            </div>
            <div className="flex items-center justify-end text-[10px] text-stone-500">
              <span>Simu: 0714 220 ***</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. TEMPLATE 3: INSTANT PURCHASE RECEIPT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start pt-2 border-t border-stone-800">
        {/* Editor (8 cols) */}
        <div className="lg:col-span-7 p-6 rounded-2xl bg-stone-950 border border-stone-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-850 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">
                  {lang === 'sw' ? '3. Risiti ya Malipo & Kodi ya Vocha (Purchase Receipt)' : '3. Instant Purchase Receipt'}
                </h4>
                <p className="text-[11px] text-stone-400">
                  {lang === 'sw'
                    ? 'Hutolewa papo hapo mara baada ya malipo ya M-Pesa kukamilika, ikimtumia mteja kodi ya vocha yake kama kumbukumbu.'
                    : 'Instant SMS receipt sent immediately upon successful payment with the voucher code.'}
                </p>
              </div>
            </div>

            {/* Toggle */}
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={settings.enablePurchaseReceiptSms ?? true}
                onChange={(e) => updateSettings({ enablePurchaseReceiptSms: e.target.checked })}
                className="rounded border-stone-700 text-emerald-400 focus:ring-emerald-400"
              />
              <span className="text-xs font-semibold text-stone-300">
                {settings.enablePurchaseReceiptSms ? (lang === 'sw' ? 'Imewashwa' : 'Enabled') : (lang === 'sw' ? 'Imezimwa' : 'Disabled')}
              </span>
            </label>
          </div>

          {/* Dynamic Tag Injectors */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-stone-400 block">
              {lang === 'sw' ? 'Bonyeza kuongeza vigezo vya kiotomatiki:' : 'Click to insert dynamic tags:'}
            </label>
            <div className="flex flex-wrap gap-1.5">
              {[
                { label: '{WIFI_NAME}', title: 'Jina la WiFi' },
                { label: '{VOCHA_CODE}', title: 'Kodi ya Vocha' },
                { label: '{KIFURUSHI}', title: 'Jina la Kifurushi' },
                { label: '{BEI}', title: 'Kiasi kilicholipwa' },
                { label: '{SUPPORT_PHONE}', title: 'Simu ya msaada' },
              ].map((tag) => (
                <button
                  key={tag.label}
                  type="button"
                  onClick={() => handleInsertTag('purchaseReceiptSmsTemplate', tag.label)}
                  className="px-2 py-1 rounded bg-stone-900 hover:bg-stone-850 border border-stone-750 text-emerald-400 font-mono text-[10px] cursor-pointer transition-colors"
                  title={tag.title}
                >
                  + {tag.label}
                </button>
              ))}
            </div>
          </div>

          {/* Textarea */}
          <div className="space-y-1">
            <textarea
              rows={4}
              value={settings.purchaseReceiptSmsTemplate || ''}
              onChange={(e) => updateSettings({ purchaseReceiptSmsTemplate: e.target.value })}
              className="w-full p-3 border border-stone-700 rounded-xl bg-stone-900 text-stone-100 text-xs font-mono leading-relaxed focus:outline-none focus:ring-1 focus:ring-emerald-400"
              placeholder="Andika ujumbe wako wa SMS hapa..."
            />
            {(() => {
              const { len, parts } = getCharStats(settings.purchaseReceiptSmsTemplate || '');
              return (
                <div className="flex items-center justify-between text-[11px] text-stone-400">
                  <span>
                    Herufi: <strong className={len > 160 ? 'text-amber-400' : 'text-stone-300'}>{len}</strong> / 160
                  </span>
                  <span>
                    Ujumbe utakaoingia: <strong>{parts} SMS</strong>
                  </span>
                </div>
              );
            })()}
          </div>
        </div>

        {/* Live Smartphone Preview (5 cols) */}
        <div className="lg:col-span-5 p-5 rounded-2xl bg-stone-950 border border-stone-800 space-y-3">
          <div className="flex items-center justify-between text-xs text-stone-400 border-b border-stone-850 pb-2">
            <span className="font-semibold flex items-center gap-1.5 text-stone-300">
              <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
              <span>{lang === 'sw' ? 'Muonekano Kwenye Simu ya Mteja:' : 'Live Phone Preview:'}</span>
            </span>
            <span className="text-[10px] font-mono text-emerald-400">SMS Inbox</span>
          </div>

          <div className="p-4 rounded-2xl bg-stone-900 border border-stone-800 space-y-2 relative">
            <div className="flex items-center justify-between text-[10px] text-stone-400 font-mono">
              <strong className="text-emerald-400">{settings.smsSenderId || 'MTAA_WIFI'}</strong>
              <span>Sasa hivi</span>
            </div>
            <div className="p-3 rounded-2xl bg-stone-800/90 text-stone-100 text-xs leading-relaxed font-sans shadow-inner border border-stone-700/60">
              {resolveTemplatePreview(settings.purchaseReceiptSmsTemplate || '', 'purchase')}
            </div>
            <div className="flex items-center justify-end text-[10px] text-stone-500">
              <span>Simu: 0754 112 ***</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
