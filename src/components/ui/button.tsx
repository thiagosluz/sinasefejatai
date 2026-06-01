import React, { forwardRef } from 'react'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'tinto' | 'olive' | 'outline' | 'ghost' | 'danger' | 'warning'
  size?: 'sm' | 'md' | 'lg' | 'icon'
  asChild?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'tinto', size = 'md', children, ...props }, ref) => {
    
    // Base styles (Retro-Editorial)
    const baseStyles = "inline-flex items-center justify-center font-bold uppercase tracking-wider transition-all disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
    
    // Size variants
    const sizeStyles = {
      sm: "py-1.5 px-3 text-[10px]",
      md: "py-2.5 px-4 text-xs",
      lg: "py-3 px-6 text-sm",
      icon: "p-1"
    }

    // Color variants (Retro-Editorial shadows and borders)
    const variantStyles = {
      tinto: "bg-brand-tinto hover:bg-brand-tinto-light text-white font-serif shadow-[2px_2px_0px_var(--brand-ink)] hover:shadow-[1px_1px_0px_var(--brand-ink)] hover:translate-x-[1px] hover:translate-y-[1px]",
      olive: "bg-brand-olive hover:bg-brand-olive-light text-white font-serif shadow-[2px_2px_0px_var(--brand-ink)] hover:shadow-[1px_1px_0px_var(--brand-ink)] hover:translate-x-[1px] hover:translate-y-[1px]",
      outline: "bg-brand-cream hover:bg-brand-card border-2 border-brand-ink text-brand-ink font-serif shadow-[2px_2px_0px_var(--brand-ink)] hover:shadow-[1px_1px_0px_var(--brand-ink)] hover:translate-x-[1px] hover:translate-y-[1px]",
      danger: "bg-transparent hover:bg-brand-tinto text-brand-tinto hover:text-white border border-brand-tinto shadow-[1px_1px_0px_var(--brand-tinto)] hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px]",
      warning: "bg-amber-100 hover:bg-amber-200 border border-amber-600 text-amber-900 shadow-[1px_1px_0px_var(--brand-ink)] hover:translate-x-[1px] hover:translate-y-[1px]",
      ghost: "bg-transparent hover:bg-brand-ink/10 text-brand-ink/70 hover:text-brand-ink shadow-none"
    }

    const combinedClassName = `${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`

    return (
      <button ref={ref} className={combinedClassName} {...props}>
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'
