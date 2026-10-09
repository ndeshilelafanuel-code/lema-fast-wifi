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
  Home
} from 'lucide-react';

interface AdminLoginProps {
  lang: Language;
  onSuccess: () => void;
  onBackToHome: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({
  lang,
  onSuccess,
  onBackToHome,
}) => {
  const { settings } = useHotspot();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const targetUsername = (settings.adminUsername || 'admin').trim().toLowerCase();
    const targetPassword = (settings.adminPassword || 'admin123').trim();

    if (username.trim().toLowerCase() === targetUsername && password.trim() === targetPassword) {
      if (rememberMe) {
        localStorage.setItem('hotspot_admin_auth', 'true');
      } else {
        sessionStorage.setItem('hotspot_admin_auth', 'true');
      }
      onSuccess();
    } else {
      setErrorMessage(
        lang === 'sw'
          ? 'Jina la mtumiaji (Username) au nenosiri (Password) siyo sahihi. Jaribu tena!'
          : 'Invalid username or password. Please check your credentials and try again.'
      );
    }
  };

  const handleUseDefaultCredentials = () => {
    setUsername(settings.adminUsername || 'admin');
    setPassword(settings.adminPassword || 'admin123');
    setErrorMessage(null);
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

        {/* Quick Helper Default Credentials Card */}
        <div className="p-3.5 rounded-2xl bg-stone-950 border border-stone-800 text-xs text-stone-400 space-y-2">
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-semibold text-stone-300 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>{lang === 'sw' ? 'Taarifa za Awali (Default Login):' : 'Initial Credentials:'}</span>
            </span>
            <button
              type="button"
              onClick={handleUseDefaultCredentials}
              className="text-amber-400 hover:text-amber-300 underline cursor-pointer font-medium"
            >
              {lang === 'sw' ? 'Jaza Haraka' : 'Auto-Fill'}
            </button>
          </div>
          <div className="font-mono text-[11px] text-stone-300 space-y-0.5 bg-stone-900/60 p-2 rounded-lg border border-stone-800/80">
            <div>Username: <strong className="text-amber-400">{settings.adminUsername || 'admin'}</strong></div>
            <div>Password: <strong className="text-amber-400">{settings.adminPassword || 'admin123'}</strong></div>
          </div>
          <p className="text-[10px] text-stone-500">
            {lang === 'sw'
              ? 'Unaweza kubadilisha taarifa hizi wakati wowote ndani ya Dashibodi (kwenye kichupo cha Mipangilio).'
              : 'You can customize your admin credentials anytime inside Dashboard ➔ Settings tab.'}
          </p>
        </div>

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
