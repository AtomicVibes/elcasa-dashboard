"use client";

import { ThemeProvider as NextThemeProvider, useTheme as useNextTheme } from "next-themes";
import type { ReactNode } from "react";

/** Set NEXT_PUBLIC_DISABLE_THEME_PROVIDER_FOR_TEST=true in .env.local to bypass ThemeProvider */
const isDisabled =
  process.env.NEXT_PUBLIC_DISABLE_THEME_PROVIDER_FOR_TEST === "true";

export function GlobalThemeProvider({ children }: { children: ReactNode }) {
  if (isDisabled) {
    return <>{children}</>;
  }

  return (
    <NextThemeProvider attribute="class" defaultTheme="system" enableSystem>
      {children}
    </NextThemeProvider>
  );
}

export function useGlobalTheme() {
  const { theme, setTheme, resolvedTheme } = useNextTheme();
  return {
    theme: (resolvedTheme ?? "dark") as "light" | "dark",
    rawTheme: (theme ?? "dark") as "light" | "dark" | "system",
    setTheme,
  };
}
