import {
  HiOutlineChartBar,
  HiOutlineChartPie,
  HiOutlineLightningBolt,
  HiOutlineClock,
  HiOutlineSparkles,
  HiOutlineViewGrid,
  HiOutlineAdjustments,
} from "react-icons/hi";
import { useNavigate, useLocation } from "react-router-dom";
import { useAppStore } from "../../stores/app";
import type { IconType } from "react-icons";

interface SidebarTab {
  label: string;
  path: string;
  icon: IconType;
}

const portfolioTabs: SidebarTab[] = [
  {
    label: "Executive Summary",
    path: "/portfolio/executive-summary",
    icon: HiOutlineChartBar,
  },
  {
    label: "Value-Readiness",
    path: "/portfolio/value-readiness",
    icon: HiOutlineChartPie,
  },
  {
    label: "Portfolio Amplification",
    path: "/portfolio/portfolio-amplification",
    icon: HiOutlineLightningBolt,
  },
  {
    label: "Hold Period",
    path: "/portfolio/hold-period",
    icon: HiOutlineClock,
  },
  {
    label: "Value Drivers",
    path: "/portfolio/value-drivers",
    icon: HiOutlineSparkles,
  },
  {
    label: "Dashboard",
    path: "/portfolio/dashboard",
    icon: HiOutlineViewGrid,
  },
  {
    label: "Scenario Planner",
    path: "/portfolio/scenario-planner",
    icon: HiOutlineAdjustments,
  },
];

export function Sidebar() {
  const { activeSection, sidebarOpen, toggleSidebar } = useAppStore();
  const navigate = useNavigate();
  const location = useLocation();

  // Only show sidebar for portfolio section
  if (activeSection !== "portfolio") return null;

  return (
    <>
      {/* Mobile overlay backdrop */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/30 z-30 transition-opacity duration-200"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-16 left-0 bottom-0 z-30 w-60
          bg-[var(--color-background)] border-r border-[var(--color-border)]
          transition-transform duration-200 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex flex-col h-full">
          {/* Section title */}
          <div className="px-5 pt-6 pb-2">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)]">
              Portfolio Analytics
            </h2>
          </div>

          {/* Navigation tabs */}
          <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
            {portfolioTabs.map((tab) => {
              const isActive = location.pathname === tab.path;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.path}
                  onClick={() => {
                    navigate(tab.path);
                    // Close sidebar on mobile after selection
                    if (window.innerWidth < 1024) {
                      toggleSidebar();
                    }
                  }}
                  className={`group flex items-center gap-3 w-full px-3 py-2.5 rounded-lg
                    text-sm font-medium transition-all duration-200
                    ${
                      isActive
                        ? "bg-navy/5 text-navy dark:bg-[var(--color-navy)]/10 dark:text-[var(--color-navy)] border-l-[3px] border-l-navy dark:border-l-[var(--color-navy)]"
                        : "text-[var(--color-muted)] hover:text-[var(--color-foreground)] hover:bg-[var(--color-subtle)]"
                    }`}
                >
                  <Icon
                    className={`w-5 h-5 flex-shrink-0 transition-colors duration-200
                      ${
                        isActive
                          ? "text-navy dark:text-[var(--color-navy)]"
                          : "text-[var(--color-muted)] group-hover:text-[var(--color-blue)]"
                      }`}
                  />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Bottom section */}
          <div className="px-5 py-4 border-t border-[var(--color-border)]">
            <p className="text-xs text-[var(--color-muted)]">
              BlueAlly Intelligence v1.0
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
