'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/app/components/Sidebar';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { getSupabase } from '@/app/lib/supabase';
import { Settings, User, Sun, Moon, Monitor, Globe, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';
import { useTheme } from '@/context/ThemeContext';

type SettingsTab = 'settings' | 'profile';

export default function SettingsDashboardPage() {
  const { t, language, setLanguage } = useLanguage();
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();

  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<SettingsTab>('settings');
  const [customUsername, setCustomUsername] = useState('');
  const [saving, setSaving] = useState(false);
  const [profileLoaded, setProfileLoaded] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (activeTab === 'profile' && user && !profileLoaded) {
      loadProfile();
    }
  }, [activeTab, user]);

  async function loadProfile() {
    if (!user) return;
    const { data, error } = await getSupabase()
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .maybeSingle();

    if (error) {
      console.error('[Profile Load Error]:', error);
    }

    if (data?.full_name) {
      setCustomUsername(data.full_name);
    }
    setProfileLoaded(true);
  }

  async function handleUpdateProfile() {
    if (!user) return;
    setSaving(true);
    try {
      const { error } = await getSupabase()
        .from('profiles')
        .upsert(
          { id: user.id, full_name: customUsername.trim() },
          { onConflict: 'id' }
        );

      if (error) throw error;
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('[Settings Profile Sync Error]:', error);
      toast.error('Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  if (!mounted) return null;

  const userEmail = user?.email ?? '';
  const googleName = user?.name || '';

  function ProfileField({ label, children }: { label: string; children: React.ReactNode }) {
    return (
      <div>
        <label className="text-sm font-extrabold block mb-1 text-black dark:text-zinc-200">
          {label}
        </label>
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-zinc-900 dark:bg-[#131313] dark:text-white transition-colors duration-200">
      <Sidebar />

      <main className="ml-0 lg:ml-64 h-screen p-6 pt-20 sm:p-8 lg:p-12 overflow-y-auto bg-white dark:bg-[#131313]">
        <div className="max-w-6xl mx-auto">
          <div className="mb-10">
            <h1 className="mt-3 text-4xl font-black tracking-tight">{t('settings')}</h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-zinc-600 dark:text-[#8e8e8e]">
              {t('settingsDescriptionText')}
            </p>
          </div>

          <div className="flex gap-2 mb-8">
            <button
              type="button"
              onClick={() => setActiveTab('settings')}
              className={cn(
                'inline-flex items-center gap-2 px-4 py-2 text-sm font-bold transition-colors rounded-md',
                activeTab === 'settings'
                  ? 'bg-[#ffc107] text-black'
                  : 'text-zinc-500 hover:text-zinc-900 dark:text-[#8e8e8e] dark:hover:text-white'
              )}
            >
              <Settings size={18} />
              {t('settings').toUpperCase()}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('profile')}
              className={cn(
                'inline-flex items-center gap-2 px-4 py-2 text-sm font-bold transition-colors rounded-md',
                activeTab === 'profile'
                  ? 'bg-[#ffc107] text-black'
                  : 'text-zinc-500 hover:text-zinc-900 dark:text-[#8e8e8e] dark:hover:text-white'
              )}
            >
              <User size={18} />
              {t('settings.profile').toUpperCase()}
            </button>
          </div>

          {activeTab === 'settings' && (
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Visual Mode Card */}
              <div className="rounded-[28px] border p-6 shadow-lg shadow-black/20 bg-zinc-100/80 border-zinc-200 dark:bg-[#1c1b1b] dark:border-neutral-800/90">
                <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">{t('settings.theme')}</p>
                <h2 className="mt-3 text-2xl font-semibold text-zinc-900 dark:text-white">{t('settings.visualMode')}</h2>
                <div className="mt-5 flex gap-2">
                  {(['light', 'dark', 'system'] as const).map((mode) => {
                    const Icon = mode === 'light' ? Sun : mode === 'dark' ? Moon : Monitor;
                    const isActive = theme === mode;
                    return (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => setTheme(mode)}
                        className={cn(
                          'flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-md text-sm font-bold transition-colors capitalize',
                          isActive ? 'bg-[#ffc107] text-black' : 'bg-zinc-200 text-zinc-600 hover:text-zinc-900 dark:bg-[#0e0e0e] dark:text-[#8e8e8e] dark:hover:text-white'
                        )}
                      >
                        <Icon size={20} />
                        {mode === 'light' ? t('settings.light') : mode === 'dark' ? t('settings.dark') : t('settings.auto')}
                      </button>
                    );
                  })}
                </div>
                <p className="mt-5 text-sm leading-7 text-zinc-600 dark:text-[#8e8e8e]">
                  {t('settings.visualModeDesc')}
                </p>
              </div>

              {/* Interface Localization Card */}
              <div className="rounded-[28px] border p-6 shadow-lg shadow-black/20 bg-zinc-100/80 border-zinc-200 dark:bg-[#1c1b1b] dark:border-neutral-800/90">
                <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">{t('settings.language')}</p>
                <h2 className="mt-3 text-2xl font-semibold text-zinc-900 dark:text-white">{t('settings.interfaceLocalization')}</h2>
                <div className="mt-5 space-y-2">
                  {(['en', 'it', 'fr'] as const).map((lang) => {
                    const isActive = language === lang;
                    return (
                      <button
                        key={lang}
                        type="button"
                        onClick={() => setLanguage(lang)}
                        className={cn(
                          'flex items-center gap-3 w-full px-4 py-3 rounded-md text-sm font-bold transition-colors',
                          isActive
                            ? 'border bg-white text-black border-zinc-300 dark:bg-[#1c1b1b] dark:text-white dark:border-zinc-700'
                            : 'text-zinc-600 hover:text-zinc-900 dark:text-[#8e8e8e] dark:hover:text-white',
                        )}
                      >
                        {isActive ? <Globe size={20} className="text-[#ffc107]" /> : <span className="w-5" />}
                        <span className="flex-1 text-left">{lang === 'en' ? t('settings.english') : lang === 'it' ? t('settings.italian') : t('settings.french')}</span>
                        {isActive && (
                          <span className="w-5 h-5 rounded-full bg-[#ffc107] flex items-center justify-center">
                            <Check size={14} className="text-black" />
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Notifications Card */}
              <div className="rounded-[28px] border p-6 shadow-lg shadow-black/20 bg-zinc-100/80 border-zinc-200 dark:bg-[#1c1b1b] dark:border-neutral-800/90">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">{t('settings.notifications')}</p>
                    <h2 className="mt-3 text-2xl font-semibold text-zinc-900 dark:text-white">{t('settings.enabled')}</h2>
                    <p className="mt-2 text-sm leading-7 text-zinc-600 dark:text-[#8e8e8e]">
                      {t('settings.notificationsDesc')}
                    </p>
                  </div>
                  <div className="w-12 h-6 rounded-full bg-[#ffc107] relative flex-shrink-0 cursor-pointer">
                    <div className="absolute right-1 top-1 w-4 h-4 rounded-full bg-white shadow-sm" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="rounded-lg p-6 space-y-4 bg-zinc-50 dark:bg-[#1c1b1b]">
              <h2 className="text-2xl font-semibold mb-6 text-black dark:text-white">{t('settings.profileInformation')}</h2>

              <div className="space-y-4">
                <ProfileField label={t('settings.emailAddress')}>
                  <input
                    type="email"
                    value={userEmail}
                    disabled
                    className="w-full border rounded-xl px-4 py-3 outline-none font-semibold opacity-50 cursor-not-allowed bg-zinc-100 text-zinc-900 dark:bg-[#0e0e0e] dark:text-white dark:border-[#27272a]"
                  />
                </ProfileField>

                <ProfileField label={t('settings.connectedGoogleName')}>
                  <input
                    type="text"
                    value={googleName}
                    disabled
                    className="w-full border rounded-xl px-4 py-3 outline-none font-semibold opacity-50 cursor-not-allowed bg-zinc-100 text-zinc-900 dark:bg-[#0e0e0e] dark:text-white dark:border-[#27272a]"
                  />
                </ProfileField>

                <ProfileField label={t('settings.customDashboardUsername')}>
                  <input
                    type="text"
                    value={customUsername}
                    onChange={(e) => setCustomUsername(e.target.value)}
                    placeholder={t('settings.usernamePlaceholder')}
                    className="w-full border rounded-xl px-4 py-3 outline-none transition-all focus:border-[#FFC107] font-semibold bg-[#fafafa] text-black border-[#d4d4d8] placeholder:text-zinc-400 dark:bg-[#09090b] dark:text-white dark:border-[#27272a] dark:placeholder:text-zinc-600"
                  />
                </ProfileField>

                <button
                  type="button"
                  onClick={handleUpdateProfile}
                  disabled={saving || !customUsername.trim()}
                  className={cn(
                    'w-full bg-[#ffc107] text-black font-bold py-3 rounded-md active:opacity-90 transition-opacity',
                    (saving || !customUsername.trim()) && 'opacity-50 cursor-not-allowed'
                  )}
                >
                  {saving ? t('settings.saving') : t('settings.saveProfile')}
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
