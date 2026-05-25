"use client";

import * as React from "react";
import { cn } from "@/app/lib/utils";

type LabelProps = React.LabelHTMLAttributes<HTMLLabelElement> & {
  className?: string;
};

export function Label({ className, ...props }: LabelProps) {
  return (
    <label
      className={cn("text-zinc-300 text-sm font-medium mb-1.5", className)}
      {...props}
    />
  );
}


