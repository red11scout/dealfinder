import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hover?: boolean;
  padding?: "sm" | "md" | "lg";
}

const paddingMap = {
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
};

export function Card({
  children,
  className = "",
  onClick,
  hover = false,
  padding = "md",
}: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`
        rounded-xl border border-[var(--color-border)]
        bg-[var(--color-card)] text-[var(--color-card-foreground)]
        shadow-sm
        ${paddingMap[padding]}
        ${hover ? "hover:shadow-md hover:border-blue/30 cursor-pointer" : ""}
        ${onClick ? "cursor-pointer" : ""}
        transition-all duration-200
        ${className}
      `}
    >
      {children}
    </div>
  );
}
