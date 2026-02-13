import React from "react";
import { LoadingSpinner } from "./LoadingSpinner";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant: "primary" | "secondary" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
  icon?: React.ReactNode;
  loading?: boolean;
}

const variantClasses = {
  primary: "bg-[var(--color-navy)] text-white hover:bg-[var(--color-navy)]/90",
  secondary: "bg-[var(--color-blue)] text-white hover:bg-[var(--color-blue)]/90",
  ghost: "bg-transparent text-[var(--color-foreground)] hover:bg-[var(--color-subtle)]",
  outline:
    "bg-transparent border border-[var(--color-navy)] text-[var(--color-navy)] hover:bg-[var(--color-navy)]/5",
};

const sizeClasses = {
  sm: "h-8 px-3 text-sm gap-1.5",
  md: "h-10 px-4 text-base gap-2",
  lg: "h-12 px-6 text-lg gap-2.5",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant,
      size = "md",
      icon,
      loading = false,
      disabled,
      children,
      className = "",
      ...props
    },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`
          inline-flex items-center justify-center
          rounded-lg font-medium
          min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0
          transition-all duration-200
          disabled:opacity-50 disabled:cursor-not-allowed
          ${variantClasses[variant]}
          ${sizeClasses[size]}
          ${className}
        `}
        {...props}
      >
        {loading ? (
          <LoadingSpinner size="sm" />
        ) : icon ? (
          <span className="shrink-0">{icon}</span>
        ) : null}
        {children && <span>{children}</span>}
      </button>
    );
  },
);

Button.displayName = "Button";
