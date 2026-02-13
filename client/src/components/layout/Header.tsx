import { HiMenu, HiSearch, HiX } from "react-icons/hi";
import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import { useAppStore, type ActiveSection } from "../../stores/app";
import { ThemeToggle } from "./ThemeToggle";

const navItems: { label: string; section: ActiveSection; path: string }[] = [
  { label: "Portfolio", section: "portfolio", path: "/portfolio/executive-summary" },
  { label: "VAR Directory", section: "vars", path: "/vars" },
  { label: "M&A Engine", section: "ma-engine", path: "/ma-engine" },
];

export function Header() {
  const { activeSection, setActiveSection, toggleSidebar, sidebarOpen } =
    useAppStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const handleNavClick = (item: (typeof navItems)[0]) => {
    setActiveSection(item.section);
    navigate(item.path);
    setMobileNavOpen(false);
  };

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 h-16
        bg-[var(--color-background)] border-b border-[var(--color-border)]
        transition-colors duration-200"
    >
      <div className="flex items-center justify-between h-full px-4 lg:px-6 max-w-[1920px] mx-auto">
        {/* Left: Logo + Sidebar Toggle */}
        <div className="flex items-center gap-3">
          {activeSection === "portfolio" && (
            <button
              onClick={toggleSidebar}
              aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
              className="hidden lg:flex items-center justify-center w-10 h-10 rounded-lg
                text-[var(--color-muted)] hover:text-[var(--color-foreground)]
                hover:bg-[var(--color-subtle)] transition-all duration-200"
            >
              <HiMenu className="w-5 h-5" />
            </button>
          )}
          <div
            className="flex items-center gap-2 cursor-pointer select-none"
            onClick={() => {
              setActiveSection("portfolio");
              navigate("/portfolio/executive-summary");
            }}
          >
            {/* Stylized arrow icon */}
            <div className="flex items-center justify-center w-8 h-8 bg-navy rounded-lg">
              <svg
                width="18"
                height="18"
                viewBox="0 0 18 18"
                fill="none"
                className="text-white"
              >
                <path
                  d="M4 9h10M10 5l4 4-4 4"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <span className="text-lg font-bold text-navy dark:text-[var(--color-navy)]">
              BlueAlly
            </span>
            <span className="text-lg font-light text-[var(--color-muted)]">
              Intelligence
            </span>
          </div>
        </div>

        {/* Center: Navigation pills (desktop) */}
        <nav className="hidden md:flex items-center gap-1 bg-[var(--color-subtle)] rounded-full p-1">
          {navItems.map((item) => {
            const isActive = item.section === activeSection;
            return (
              <button
                key={item.section}
                onClick={() => handleNavClick(item)}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200
                  ${
                    isActive
                      ? "bg-navy text-white shadow-sm"
                      : "text-[var(--color-muted)] hover:text-[var(--color-foreground)]"
                  }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Right: Actions */}
        <div className="flex items-center gap-1">
          <button
            aria-label="Search"
            className="flex items-center justify-center w-10 h-10 rounded-lg
              text-[var(--color-muted)] hover:text-[var(--color-foreground)]
              hover:bg-[var(--color-subtle)] transition-all duration-200"
          >
            <HiSearch className="w-5 h-5" />
          </button>
          <ThemeToggle />

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileNavOpen(!mobileNavOpen)}
            aria-label={mobileNavOpen ? "Close menu" : "Open menu"}
            className="flex md:hidden items-center justify-center w-10 h-10 rounded-lg
              text-[var(--color-muted)] hover:text-[var(--color-foreground)]
              hover:bg-[var(--color-subtle)] transition-all duration-200"
          >
            {mobileNavOpen ? (
              <HiX className="w-5 h-5" />
            ) : (
              <HiMenu className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile nav dropdown */}
      {mobileNavOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 bg-[var(--color-background)] border-b border-[var(--color-border)] shadow-lg z-40">
          <nav className="flex flex-col p-4 gap-1">
            {navItems.map((item) => {
              const isActive = item.section === activeSection;
              return (
                <button
                  key={item.section}
                  onClick={() => handleNavClick(item)}
                  className={`px-4 py-3 rounded-xl text-sm font-medium text-left transition-all duration-200
                    ${
                      isActive
                        ? "bg-navy text-white"
                        : "text-[var(--color-muted)] hover:bg-[var(--color-subtle)] hover:text-[var(--color-foreground)]"
                    }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
}
