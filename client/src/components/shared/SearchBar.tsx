import React from "react";
import { HiMagnifyingGlass, HiXMark } from "react-icons/hi2";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function SearchBar({
  value,
  onChange,
  placeholder = "Search...",
  className = "",
}: SearchBarProps) {
  return (
    <div className={`relative ${className}`}>
      <HiMagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-muted)]" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`
          w-full h-12 pl-12 pr-10
          rounded-full border border-[var(--color-border)]
          bg-[var(--color-card)] text-[var(--color-foreground)]
          placeholder:text-[var(--color-muted)]
          focus:outline-none focus:ring-2 focus:ring-blue/30 focus:border-[var(--color-blue)]
          transition-all duration-200
        `}
      />
      {value && (
        <button
          onClick={() => onChange("")}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-[var(--color-muted)] hover:text-[var(--color-foreground)] hover:bg-[var(--color-subtle)] transition-all duration-200"
        >
          <HiXMark className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
