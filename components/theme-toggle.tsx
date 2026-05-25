"use client";

import { useId } from "react";
import { MoonIcon, SunIcon } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { useGlobalTheme } from "@/components/theme-provider";

export function ThemeToggle() {
  const id = useId();
  const { theme, setTheme } = useGlobalTheme();
  const isDark = theme === "dark";

  const handleThemeChange = (checked: boolean) => {
    setTheme(checked ? "dark" : "light");
  };

  return (
    <div className="group inline-flex items-center gap-2 select-none">
      <span
        className={cn("cursor-pointer transition-colors duration-200", isDark ? "text-zinc-500" : "text-amber-500")}
        onClick={() => setTheme("light")}
      >
        <SunIcon className="size-4" />
      </span>
      <Switch
        id={id}
        checked={isDark}
        onCheckedChange={handleThemeChange}
        className="data-[state=checked]:bg-[#FFC107] data-[state=unchecked]:bg-zinc-300"
      />
      <span
        className={cn("cursor-pointer transition-colors duration-200", isDark ? "text-[#FFC107]" : "text-zinc-400")}
        onClick={() => setTheme("dark")}
      >
        <MoonIcon className="size-4" />
      </span>
    </div>
  );
}
