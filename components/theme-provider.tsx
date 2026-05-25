"use client";

import { ThemeProvider as NextThemeProvider, useTheme as useNextTheme } from "next-themes";
import type { ReactNode } from "react";

export function GlobalThemeProvider({ children }: { children: ReactNode }) {
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
