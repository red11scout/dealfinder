import React, { useState, useRef, useCallback } from "react";

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  position?: "top" | "bottom" | "left" | "right";
}

const positionClasses = {
  top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
  bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
  left: "right-full top-1/2 -translate-y-1/2 mr-2",
  right: "left-full top-1/2 -translate-y-1/2 ml-2",
};

const arrowClasses = {
  top: "top-full left-1/2 -translate-x-1/2 border-t-[var(--color-foreground)] dark:border-t-[var(--color-card)] border-x-transparent border-b-transparent",
  bottom: "bottom-full left-1/2 -translate-x-1/2 border-b-[var(--color-foreground)] dark:border-b-[var(--color-card)] border-x-transparent border-t-transparent",
  left: "left-full top-1/2 -translate-y-1/2 border-l-[var(--color-foreground)] dark:border-l-[var(--color-card)] border-y-transparent border-r-transparent",
  right: "right-full top-1/2 -translate-y-1/2 border-r-[var(--color-foreground)] dark:border-r-[var(--color-card)] border-y-transparent border-l-transparent",
};

export function Tooltip({ content, children, position = "top" }: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showTooltip = useCallback(() => {
    timeoutRef.current = setTimeout(() => setVisible(true), 200);
  }, []);

  const hideTooltip = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setVisible(false);
  }, []);

  return (
    <div className="relative inline-flex" onMouseEnter={showTooltip} onMouseLeave={hideTooltip}>
      {children}
      <div
        className={`
          absolute z-50 ${positionClasses[position]}
          pointer-events-none
          transition-opacity duration-200
          ${visible ? "opacity-100" : "opacity-0"}
        `}
      >
        <div className="relative bg-[var(--color-foreground)] dark:bg-[var(--color-card)] text-[var(--color-background)] dark:text-[var(--color-card-foreground)] text-sm px-3 py-2 rounded-lg max-w-[300px] whitespace-normal shadow-lg dark:border dark:border-[var(--color-border)]">
          {content}
          <div className={`absolute w-0 h-0 border-4 ${arrowClasses[position]}`} />
        </div>
      </div>
    </div>
  );
}
