import React, { ReactNode } from 'react';
import { cookies } from 'next/headers';
import { Toaster } from 'react-hot-toast';
import './globals.css';
import { LanguageProvider } from '@/context/LanguageContext';
import { AuthProvider } from '@/context/AuthContext';
import { GlobalThemeProvider } from '@/components/theme-provider';
import type { TranslationLanguage } from '@/constants/translations';

export const metadata = {
  title: "Arcadia Dashboard",
  description: "Project tracking and management platform.",
  icons: {
    icon: [
      {
        url: "/assets/MAINLOGO.png?v=1",
        href: "/assets/MAINLOGO.png?v=1",
      }
    ],
    shortcut: "/assets/MAINLOGO.png?v=1",
    apple: "/assets/MAINLOGO.png?v=1",
  },
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const cookieStore = await cookies();
  const cookieLang = cookieStore.get('elcasa-lang')?.value;

  const initialLanguage: TranslationLanguage = cookieLang === 'it' ? 'it' : 'en';

  return (
    <html lang={initialLanguage} suppressHydrationWarning>
      <body className="antialiased transition-colors duration-500">
        <GlobalThemeProvider>
          <AuthProvider>
            <LanguageProvider initialLanguage={initialLanguage}>{children}</LanguageProvider>
          </AuthProvider>
        </GlobalThemeProvider>
        <Toaster position="top-right" reverseOrder={false} />
      </body>
    </html>
  );
}
