import { create } from "zustand";

export type ActiveSection = "portfolio" | "vars" | "ma-engine";

interface AppState {
  activeSection: ActiveSection;
  sidebarOpen: boolean;
  searchQuery: string;
  setActiveSection: (section: ActiveSection) => void;
  toggleSidebar: () => void;
  setSearchQuery: (query: string) => void;
}

function getInitialSidebarState(): boolean {
  if (typeof window === "undefined") return true;
  return window.innerWidth >= 1024;
}

export const useAppStore = create<AppState>((set) => ({
  activeSection: "portfolio",
  sidebarOpen: getInitialSidebarState(),
  searchQuery: "",

  setActiveSection: (activeSection: ActiveSection) =>
    set({ activeSection }),

  toggleSidebar: () =>
    set((state) => ({ sidebarOpen: !state.sidebarOpen })),

  setSearchQuery: (searchQuery: string) =>
    set({ searchQuery }),
}));
