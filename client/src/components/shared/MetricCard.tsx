import React from "react";
import { HiArrowTrendingUp, HiArrowTrendingDown } from "react-icons/hi2";
import { Card } from "./Card";

interface MetricCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  trend?: { value: number; direction: "up" | "down" };
  icon?: React.ReactNode;
  color?: "navy" | "blue" | "green";
}

const colorMap = {
  navy: "text-[var(--color-navy)]",
  blue: "text-[var(--color-blue)]",
  green: "text-[var(--color-green)]",
};

export function MetricCard({
  label,
  value,
  subtitle,
  trend,
  icon,
  color = "navy",
}: MetricCardProps) {
  return (
    <Card>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-[var(--color-muted)] uppercase tracking-wider mb-1">
            {label}
          </p>
          <p className={`text-3xl font-bold ${colorMap[color]}`}>{value}</p>
          {(subtitle || trend) && (
            <div className="flex items-center gap-2 mt-2">
              {trend && (
                <span
                  className={`inline-flex items-center gap-1 text-sm font-medium ${
                    trend.direction === "up" ? "text-[var(--color-green)]" : "text-red-500"
                  }`}
                >
                  {trend.direction === "up" ? (
                    <HiArrowTrendingUp className="w-4 h-4" />
                  ) : (
                    <HiArrowTrendingDown className="w-4 h-4" />
                  )}
                  {trend.value}%
                </span>
              )}
              {subtitle && (
                <span className="text-sm text-[var(--color-muted)]">{subtitle}</span>
              )}
            </div>
          )}
        </div>
        {icon && (
          <div className={`${colorMap[color]} opacity-60`}>
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
}
