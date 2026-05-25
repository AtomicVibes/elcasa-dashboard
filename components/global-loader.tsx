"use client";

import { cn } from "@/lib/utils";
import { Spinner } from "@/components/ui/spinner";
import { useGlobalTheme } from "@/components/theme-provider";

export function GlobalLoader({ active }: { active: boolean }) {
  const { theme } = useGlobalTheme();
  const isDark = theme === "dark";

  if (!active) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm"
      aria-hidden="true"
    >
      <Spinner
        className={cn(
          "h-10 w-10",
          isDark ? "text-zinc-100" : "text-zinc-900"
        )}
      />
    </div>
  );
}
