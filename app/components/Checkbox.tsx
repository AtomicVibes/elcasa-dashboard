"use client";

import * as React from "react";
import { Check } from "lucide-react";

import { cn } from "@/app/lib/utils";

type CheckboxProps = {
  id?: string;
  checked?: boolean;
  defaultChecked?: boolean;
  disabled?: boolean;
  className?: string;
  onCheckedChange?: (checked: boolean | "indeterminate") => void;
};

export function Checkbox({
  id,
  checked,
  defaultChecked,
  disabled,
  className,
  onCheckedChange,
}: CheckboxProps) {
  const isControlled = typeof checked === "boolean";
  const [uncontrolledChecked, setUncontrolledChecked] = React.useState(
    defaultChecked ?? false
  );

  const value = isControlled ? checked : uncontrolledChecked;

  return (
    <button
      type="button"
      id={id}
      role="checkbox"
      aria-checked={value}
      disabled={disabled}
      onClick={() => {
        const next = !value;
        if (!isControlled) setUncontrolledChecked(next);
        onCheckedChange?.(next);
      }}
      className={cn(
        "h-5 w-5 shrink-0 rounded border border-zinc-500 bg-transparent transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#FFC107] data-[state=checked]:bg-[#FFC107] data-[state=checked]:border-[#FFC107] data-[state=checked]:text-zinc-950",
        value ? "bg-[#FFC107] border-[#FFC107] text-zinc-950" : "bg-transparent",
        className
      )}
      data-state={value ? "checked" : "unchecked"}
    >
      {value && <Check className="h-4 w-4" aria-hidden="true" />}
    </button>
  );
}


