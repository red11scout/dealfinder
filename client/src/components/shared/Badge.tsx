import React from "react";

interface BadgeProps {
  label: string;
  variant: "navy" | "blue" | "green" | "gray" | "red";
  size?: "sm" | "md";
}

const variantClasses = {
  navy: "bg-[var(--color-navy)]/10 text-[var(--color-navy)]",
  blue: "bg-[var(--color-blue)]/10 text-[var(--color-blue)]",
  green: "bg-[var(--color-green)]/10 text-[var(--color-green)]",
  gray: "bg-[var(--color-muted)]/10 text-[var(--color-muted)]",
  red: "bg-red-500/10 text-red-500",
};

const sizeClasses = {
  sm: "text-xs px-2 py-0.5",
  md: "text-sm px-3 py-1",
};

export function Badge({ label, variant, size = "md" }: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center rounded-full font-medium
        ${variantClasses[variant]}
        ${sizeClasses[size]}
      `}
    >
      {label}
    </span>
  );
}
