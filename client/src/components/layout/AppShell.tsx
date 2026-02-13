import { Outlet } from "react-router-dom";
import { useAppStore } from "../../stores/app";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";

export function AppShell() {
  const { activeSection, sidebarOpen } = useAppStore();

  const showSidebar = activeSection === "portfolio";
  const sidebarActive = showSidebar && sidebarOpen;

  return (
    <div className="min-h-screen bg-[var(--color-background)] transition-colors duration-200">
      <Header />
      <Sidebar />

      <main
        className={`pt-16 transition-all duration-200 min-h-screen
          ${sidebarActive ? "lg:pl-60" : ""}`}
      >
        <div className="p-6 lg:p-8 max-w-[1600px] mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
