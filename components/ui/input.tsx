import * as React from "react"

import { cn } from "@/lib/utils"

interface InputProps extends React.ComponentProps<"input"> {
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

function Input({ 
  className, 
  type, 
  leftIcon,
  rightIcon,
  ...props 
}: InputProps) {
  return (
    <div className="relative flex items-center">
      {leftIcon && (
        <div className="absolute left-3 flex items-center text-slate-400 pointer-events-none">
          {leftIcon}
        </div>
      )}
      <input
        type={type}
        data-slot="input"
        className={cn(
          "h-10 w-full min-w-0 rounded-xl border border-slate-200 bg-white px-3 py-2 text-base transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-slate-400 focus-visible:border-medical-primary focus-visible:ring-3 focus-visible:ring-medical-light disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-slate-50 disabled:opacity-50 aria-invalid:border-red-500 aria-invalid:ring-3 aria-invalid:ring-red-100 md:text-sm",
          leftIcon && "pl-10",
          rightIcon && "pr-10",
          className
        )}
        {...props}
      />
      {rightIcon && (
        <div className="absolute right-3 flex items-center text-slate-400 pointer-events-none">
          {rightIcon}
        </div>
      )}
    </div>
  )
}

export { Input }
