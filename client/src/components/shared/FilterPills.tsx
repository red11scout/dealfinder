import React from "react";

interface FilterPillsProps {
  options: { label: string; value: string }[];
  selected: string | string[];
  onChange: (value: string) => void;
  multiSelect?: boolean;
}

export function FilterPills({
  options,
  selected,
  onChange,
  multiSelect = false,
}: FilterPillsProps) {
  const isSelected = (value: string) => {
    if (Array.isArray(selected)) {
      return selected.includes(value);
    }
    return selected === value;
  };

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={`
            rounded-full px-4 py-1.5 text-sm font-medium
            transition-all duration-200
            ${
              isSelected(option.value)
                ? "bg-[var(--color-navy)] text-white"
                : "bg-transparent border border-[var(--color-border)] text-[var(--color-muted)] hover:border-blue/50"
            }
          `}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
