'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, FolderOpen, Image, Clock, Users, Briefcase, Settings, LogOut, Menu, X, ChevronLeft, ChevronRight, CheckSquare2, CalendarClock } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { getSupabase } from '@/app/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

const MAIN_LOGO_CLASS = "w-auto h-10 object-contain";


export default function Sidebar() {
  const pathname = usePathname();
  const { t } = useLanguage();
  const router = useRouter();

  const { user, loading } = useAuth();
  const [profileName, setProfileName] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navItems = useMemo(
    () => [
      { name: t('dashboard'),    path: '/admin',            icon: LayoutDashboard },
      { name: t('projects'),    path: '/admin/cases',       icon: FolderOpen },
      { name: t('tasks'),        path: '/admin/jobs',        icon: CheckSquare2 },
      { name: t('leaveRequests'),path: '/admin/leave-requests', icon: CalendarClock },
      { name: t('photosMedia'), path: '/admin/media',       icon: Image },
      { name: t('timeline'),    path: '/admin/timeline',    icon: Clock },
      { name: t('customers'),   path: '/admin/customers',   icon: Briefcase },
      { name: t('team'),        path: '/admin/team',        icon: Users },
      { name: t('settings'),    path: '/admin/settings',    icon: Settings },

    ],
    [t]
  );

  useEffect(() => {
    if (user?.id) {
      getSupabase()
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .maybeSingle()
        .then(({ data, error }) => {
          if (error) console.error('[Sidebar Profile Load Error]:', error);
          if (data?.full_name) setProfileName(data.full_name);
        });
    }
  }, [user?.id]);

  const displayName = loading
    ? ''
    : profileName || user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split('@')[0] || '';
  const displayEmail = loading ? '' : user?.email || '';
  const avatarLetter = displayName ? displayName.charAt(0).toUpperCase() : 'A';

  return (
    <>
      {/* Mobile Top Header Bar (contains hamburger) */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white z-50 px-4 flex items-center justify-between dark:bg-[#0e0e0e]">
        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
          className="p-2.5 rounded-xl bg-transparent text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white shadow-none focus:outline-none"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
        <div />
      </div>

      {/* Mobile Overlay Backdrop */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
        />
      )}

      {/* Sidebar Container — locked to viewport */}
      <div className={`fixed top-0 left-0 z-40 h-screen w-64 overflow-y-auto bg-white dark:bg-[#0e0e0e] transition-all duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
      <aside className={`h-full p-3 flex flex-col ${
        isCollapsed ? 'lg:w-20' : 'lg:w-64'
      }`}>
      <div>
        <div className={`flex items-center gap-3 mb-8 transition-all duration-300 ${isCollapsed ? 'justify-center px-0' : 'px-2'}`}>
          <img src="/assets/MAINLOGO.png" alt="Arcadia logo" className={MAIN_LOGO_CLASS} />
          {!isCollapsed && <span className="text-xl font-black tracking-tight text-zinc-900 dark:text-white">Arcadia</span>}
        </div>

        <nav className="space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.path}
                href={item.path}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 rounded-2xl transition-all ${
                  isCollapsed ? 'justify-center px-0 py-3.5' : 'justify-start px-4 py-3'
                } ${
                  isActive
                    ? 'bg-zinc-100 text-[#FFB800] font-semibold shadow-sm dark:bg-zinc-700'
                    : 'text-zinc-500 font-medium tracking-wide hover:text-zinc-900 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-zinc-800'
                }`}
              >
                <item.icon className="w-6 h-6 transition-colors flex-shrink-0" />
                {!isCollapsed && <span className="text-[15px] font-medium tracking-wide whitespace-nowrap">{item.name}</span>}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto pt-6 border-t border-zinc-200 dark:border-zinc-800 space-y-3">
        {/* Collapse Toggle Button - Desktop Only */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden lg:flex w-full items-center justify-center px-3 py-2.5 rounded-xl text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 dark:text-zinc-500 dark:hover:text-white dark:hover:bg-zinc-800 transition-all"
        >
          {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>

        {/* User Profile Stack */}
        <div className={`flex items-center gap-3 transition-all duration-300 ${isCollapsed ? 'justify-center px-0' : 'px-4'}`}>
          <div className="w-10 h-10 rounded-full bg-zinc-100 border border-zinc-200 dark:bg-zinc-800 dark:border-zinc-700 flex items-center justify-center text-sm font-bold text-[#FFB800] flex-shrink-0">
            {avatarLetter}
          </div>
          {!isCollapsed && (
            <div>
              <p className="text-sm font-bold text-zinc-900 dark:text-white">{displayName}</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">{displayEmail}</p>
            </div>
          )}
        </div>

        {/* Sign Out Button */}
        <button
          type="button"
          onClick={() => {
            const handleMainDashboardLogout = () => {
               
              console.log("Dashboard Logout Triggered: Hard-flushing session states...");

              if (typeof window !== "undefined") {
                // 1. Wipe out both any logged-in user tokens AND our onboarding tracking states
                localStorage.clear();
                sessionStorage.clear();

                // 2. Clear any lingering cookies if applicable
                document.cookie.split(";").forEach((c) => {
                  document.cookie = c
                    .replace(/^ +/, "")
                    .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
                });

                // 3. Force route back to the onboarding step sequence
                window.location.href = "/onboarding?reset=" + Date.now();
              }
            };

            handleMainDashboardLogout();
          }}
          className={`flex items-center gap-2 rounded-2xl text-sm font-semibold text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 dark:text-zinc-500 dark:hover:text-white dark:hover:bg-zinc-800 transition-all ${

            isCollapsed ? 'justify-center w-full px-3 py-2.5' : 'justify-start w-full px-4 py-3'
          }`}
        >
          <LogOut className="w-5 h-5 transition-colors flex-shrink-0" />
          {!isCollapsed && <span>{t('signOut')}</span>}
        </button>



      </div>

    </aside>
    </div>
    </>
  );
}
