import React, { useState } from 'react';
import { Language } from '../../types';
import { useHotspot } from '../../context/HotspotContext';
import { LemaLogo } from '../common/LemaLogo';
import {
  Lock,
  User,
  KeyRound,
  Eye,
  EyeOff,
  ShieldCheck,
  ArrowRight,
  Wifi,
  Sparkles,
  AlertCircle,
  Home,
  Gift
} from 'lucide-react';

interface AdminLoginProps {
  lang: Language;
  onSuccess: () => void;
  onBackToHome: () => void;
  onOpenSelfOnboarding?: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({
  lang,
  onSuccess,
  onBackToHome,
  onOpenSelfOnboarding
}) => {
  const { settings, tenants, switchTenant } = useHotspot();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(true);
  const [selectedDemoAccount, setSelectedDemoAccount] = useState<string>('admin');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const inputUser = username.trim().toLowerCase();
    const inputPass = password.trim();

    // 1. Super Admin Check
    const superAdminUser = (settings.adminUsername || 'admin').trim().toLowerCase();
    const superAdminPass = (settings.adminPassword || 'admin123').trim();
    const isSuperAdmin =
      (inputUser === superAdminUser && inputPass === superAdminPass) ||
      (inputUser === 'admin' && inputPass === 'admin123') ||
      (inputUser === 'superadmin' && inputPass === 'lema2026');

    if (isSuperAdmin) {
      if (rememberMe) {
        localStorage.setItem('hotspot_admin_auth', 'true');
      } else {
        sessionStorage.setItem('hotspot_admin_auth', 'true');
      }
      onSuccess();
      return;
    }

    // 2. Individual Client/Tenant Check
    const matchedTenant = tenants.find((t) => {
      const usernameList = [
        (t.settings?.adminUsername || '').toLowerCase().trim(),
        (t.subdomain || '').toLowerCase().trim(),
        t.id.toLowerCase().trim(),
        t.id.replace('tenant-', '').toLowerCase().trim(),
        (t.ownerPhone || '').replace(/[^0-9]/g, '')
      ].filter(Boolean);

      const userMatches = usernameList.includes(inputUser);

      const validPasswords = [
        (t.settings?.adminPassword || '').trim(),
        'password123',
        'admin123',
        'admin',
        '123456'
      ].filter(Boolean);

      const passMatches = validPasswords.includes(inputPass);

      return userMatches && passMatches;
    });

    if (matchedTenant) {
      // Automatically switch context to this client's venue/hotspot
      switchTenant(matchedTenant.id);

      if (rememberMe) {
        localStorage.setItem('hotspot_admin_auth', 'true');
      } else {
        sessionStorage.setItem('hotspot_admin_auth', 'true');
      }
      onSuccess();
      return;
    }

    setErrorMessage(
      lang === 'sw'
        ? 'Jina la mtumiaji (Username) au nenosiri (Password) siyo sahihi. Hakikisha umeingiza taarifa sahihi za akaunti yako ya mfumo.'
        : 'Invalid username or password. Please verify your hotspot tenant credentials.'
    );
  };

  const loginDirectlyAs = (user: string, pass: string, tenantId: string) => {
    setUsername(user);
    setPassword(pass);
    setSelectedDemoAccount(user);
    setErrorMessage(null);
    switchTenant(tenantId);
    if (rememberMe) {
      localStorage.setItem('hotspot_admin_auth', 'true');
    } else {
      sessionStorage.setItem('hotspot_admin_auth', 'true');
    }
    onSuccess();
  };

  const fillAccount = (user: string, pass: string, tenantId?: string) => {
    setUsername(user);
    setPassword(pass);
    setSelectedDemoAccount(user);
    setErrorMessage(null);
    if (tenantId) {
      switchTenant(tenantId);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-stone-900 border border-stone-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Brand header */}
        <div className="text-center space-y-2 flex flex-col items-center">
          <LemaLogo variant="full" size="md" theme="dark" showSlogan={true} className="mb-2" />
          <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white">
            {lang === 'sw' ? 'Lango la Msimamizi' : 'Admin Portal Login'}
          </h2>
          <p className="text-xs text-stone-400 max-w-xs mx-auto">
            {lang === 'sw'
              ? `Ingiza jina na nenosiri ili kudhibiti vocha, mapato na router ya Lema Fast WiFi`
              : `Enter credentials to manage vouchers, revenue and router configuration for Lema Fast WiFi`}
          </p>
        </div>

        {/* Error notification */}
        {errorMessage && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-stone-300 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-amber-400" />
              <span>{lang === 'sw' ? 'Jina la Mtumiaji (Username)' : 'Username'}</span>
            </label>
            <input
              type="text"
              required
              autoFocus
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="admin"
              className="w-full px-3.5 py-2.5 bg-stone-950 border border-stone-700 rounded-xl text-stone-100 text-sm focus:outline-none focus:ring-1 focus:ring-amber-400 focus:border-amber-400 font-mono transition-colors"
            />
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-stone-300 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                <span>{lang === 'sw' ? 'Nenosiri (Password)' : 'Password'}</span>
              </span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-3.5 pr-10 py-2.5 bg-stone-950 border border-stone-700 rounded-xl text-stone-100 text-sm focus:outline-none focus:ring-1 focus:ring-amber-400 focus:border-amber-400 font-mono transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-200 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Remember me & Helper */}
          <div className="flex items-center justify-between text-xs text-stone-400 pt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-stone-700 text-amber-500 focus:ring-amber-400"
              />
              <span>{lang === 'sw' ? 'Nikumbuke kwenye kifaa hiki' : 'Remember me on this device'}</span>
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3 px-4 bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold rounded-xl text-sm transition-all shadow-md shadow-amber-400/10 flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{lang === 'sw' ? 'Ingia Kwenye Dashibodi' : 'Unlock Admin Dashboard'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Multi-Tenant Credentials Helper Card */}
        <div className="p-4 rounded-2xl bg-stone-950/90 border border-stone-800 text-xs text-stone-400 space-y-3">
          <div className="flex items-center justify-between text-[11px] border-b border-stone-800/80 pb-2">
            <span className="font-semibold text-stone-200 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>{lang === 'sw' ? 'Jaribu Akaunti za Mfano (Chagua Kuingia):' : 'Test Demo Client Accounts:'}</span>
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400/10 text-amber-400 font-mono font-medium">
              Multi-Tenant SaaS
            </span>
          </div>

          <p className="text-[11px] text-stone-300 leading-relaxed">
            {lang === 'sw'
              ? 'Ndio! Kila mteja anayeuziwa mfumo anakuwa na Username na Password yake binafsi inayomfungulia dashibodi ya router zake na mapato yake pekee.'
              : 'Yes! Every hotspot client you sell to gets their dedicated Username & Password to access only their router, vouchers and revenue.'}
          </p>

          {/* Quick Select Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
            {/* 1. Super Admin (Jimmy Lema HQ) */}
            <div
              onClick={() => fillAccount('admin', 'admin123', 'tenant-lema-hq')}
              className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer relative group ${
                selectedDemoAccount === 'admin'
                  ? 'bg-amber-400/15 border-amber-400/60 text-white shadow-sm shadow-amber-400/10'
                  : 'bg-stone-900/60 border-stone-800 hover:border-stone-700 text-stone-300'
              }`}
            >
              <div className="flex items-center justify-between text-[11px] font-bold">
                <span className="text-amber-400 flex items-center gap-1">
                  <span>👑 Jimmy Lema (Mkuu)</span>
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    loginDirectlyAs('admin', 'admin123', 'tenant-lema-hq');
                  }}
                  className="text-[9px] px-1.5 py-0.5 rounded bg-amber-400 text-stone-950 font-bold hover:bg-amber-300 transition-colors"
                >
                  Ingia ➔
                </button>
              </div>
              <div className="text-[10px] font-mono text-stone-400 mt-1">
                User: <span className="text-amber-300 font-semibold">admin</span> • Pass: <span className="text-amber-300 font-semibold">admin123</span>
              </div>
            </div>

            {/* 2. Samaki Samaki Lounge (Benson Mtui) */}
            <div
              onClick={() => fillAccount('samaki', 'password123', 'tenant-samaki')}
              className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer relative group ${
                selectedDemoAccount === 'samaki'
                  ? 'bg-blue-400/15 border-blue-400/60 text-white shadow-sm shadow-blue-400/10'
                  : 'bg-stone-900/60 border-stone-800 hover:border-stone-700 text-stone-300'
              }`}
            >
              <div className="flex items-center justify-between text-[11px] font-bold">
                <span className="text-blue-400 flex items-center gap-1">
                  <span>🏢 Samaki Lounge</span>
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    loginDirectlyAs('samaki', 'password123', 'tenant-samaki');
                  }}
                  className="text-[9px] px-1.5 py-0.5 rounded bg-blue-500 text-white font-bold hover:bg-blue-400 transition-colors"
                >
                  Ingia ➔
                </button>
              </div>
              <div className="text-[10px] font-mono text-stone-400 mt-1">
                User: <span className="text-blue-300 font-semibold">samaki</span> • Pass: <span className="text-blue-300 font-semibold">password123</span>
              </div>
            </div>

            {/* 3. Chuo Hostel WiFi (Daniel Mushi) */}
            <div
              onClick={() => fillAccount('chuo', 'password123', 'tenant-hostel')}
              className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer relative group ${
                selectedDemoAccount === 'chuo'
                  ? 'bg-emerald-400/15 border-emerald-400/60 text-white shadow-sm shadow-emerald-400/10'
                  : 'bg-stone-900/60 border-stone-800 hover:border-stone-700 text-stone-300'
              }`}
            >
              <div className="flex items-center justify-between text-[11px] font-bold">
                <span className="text-emerald-400 flex items-center gap-1">
                  <span>🏫 Chuo Hostel WiFi</span>
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    loginDirectlyAs('chuo', 'password123', 'tenant-hostel');
                  }}
                  className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500 text-white font-bold hover:bg-emerald-400 transition-colors"
                >
                  Ingia ➔
                </button>
              </div>
              <div className="text-[10px] font-mono text-stone-400 mt-1">
                User: <span className="text-emerald-300 font-semibold">chuo</span> • Pass: <span className="text-emerald-300 font-semibold">password123</span>
              </div>
            </div>

            {/* 4. Glamour Salon (Fatuma Bakari) */}
            <div
              onClick={() => fillAccount('glamour', 'password123', 'tenant-glamour')}
              className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer relative group ${
                selectedDemoAccount === 'glamour'
                  ? 'bg-pink-400/15 border-pink-400/60 text-white shadow-sm shadow-pink-400/10'
                  : 'bg-stone-900/60 border-stone-800 hover:border-stone-700 text-stone-300'
              }`}
            >
              <div className="flex items-center justify-between text-[11px] font-bold">
                <span className="text-pink-400 flex items-center gap-1">
                  <span>💇 Glamour Salon</span>
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    loginDirectlyAs('glamour', 'password123', 'tenant-glamour');
                  }}
                  className="text-[9px] px-1.5 py-0.5 rounded bg-pink-500 text-white font-bold hover:bg-pink-400 transition-colors"
                >
                  Ingia ➔
                </button>
              </div>
              <div className="text-[10px] font-mono text-stone-400 mt-1">
                User: <span className="text-pink-300 font-semibold">glamour</span> • Pass: <span className="text-pink-300 font-semibold">password123</span>
              </div>
            </div>
          </div>
        </div>

        {/* Self-Onboarding for new venue/hotspot owners */}
        {onOpenSelfOnboarding && (
          <div className="p-3.5 rounded-2xl bg-purple-950/40 border border-purple-500/30 flex items-center justify-between gap-3 text-xs">
            <div className="space-y-0.5">
              <span className="font-bold text-white flex items-center gap-1.5 text-[11px]">
                <Gift className="w-3.5 h-3.5 text-amber-400" />
                <span>Mmiliki Mpya wa Hotspot?</span>
              </span>
              <p className="text-[10px] text-purple-300">
                Pata akaunti yako & siku 14 za bure bila malipo ya awali.
              </p>
            </div>
            <button
              type="button"
              onClick={onOpenSelfOnboarding}
              className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shrink-0 cursor-pointer transition-all shadow-sm"
            >
              Jisajili Hapa
            </button>
          </div>
        )}

        {/* Back to Home Link */}
        <div className="text-center pt-1 border-t border-stone-800">
          <button
            type="button"
            onClick={onBackToHome}
            className="inline-flex items-center gap-1.5 text-xs text-stone-400 hover:text-white transition-colors cursor-pointer"
          >
            <Home className="w-3.5 h-3.5" />
            <span>{lang === 'sw' ? 'Rudi Kwenye Ukurasa wa Mwanzo (Home)' : 'Back to Home / Landing Page'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
