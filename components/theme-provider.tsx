"use client";

import type { ReactNode } from "react";
import { ThemeProvider as NativeThemeProvider, useTheme } from "@/context/ThemeContext";

export function GlobalThemeProvider({ children }: { children: ReactNode }) {
  return <NativeThemeProvider>{children}</NativeThemeProvider>;
}

export function useGlobalTheme() {
  const { resolvedTheme, setTheme, isDark, mounted } = useTheme();
  return {
    theme: resolvedTheme,
    setTheme,
    isDark,
    mounted,
  };
}
