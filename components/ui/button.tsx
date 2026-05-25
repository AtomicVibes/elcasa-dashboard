import * as React from 'react'
import { cn } from "@/app/lib/utils"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  asChild?: boolean
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', asChild = false, ...props }, ref) => {
    const Comp = asChild ? 'span' : 'button'
    return (
      <Comp
        ref={ref as React.Ref<any>}
    className={cn(
      'inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFC107]/50 disabled:pointer-events-none disabled:opacity-50',

          {
            default: 'bg-[#FFC107] text-zinc-950 hover:bg-[#FFC107]/90',
            outline: 'border border-zinc-800 bg-transparent text-zinc-200 hover:bg-zinc-900/50',
            ghost: 'hover:bg-[#FFC107]/10 hover:text-[#FFC107]',
            link: 'underline-offset-4 hover:underline text-[#FFC107]',
          }[variant],

          {
            default: 'h-10 px-4 py-2',
            sm: 'h-9 px-3 rounded-md',
            lg: 'h-11 px-8 rounded-md',
            icon: 'h-10 w-10',
          }[size],
          className
        )}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'