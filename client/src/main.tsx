import { StrictMode, Suspense, lazy } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import "@client/styles/globals.css";
import { AppShell } from "./components/layout/AppShell";

// Lazy-loaded pages for code-splitting
const ExecutiveSummary = lazy(() => import("./pages/portfolio/ExecutiveSummary"));
const ValueReadiness = lazy(() => import("./pages/portfolio/ValueReadiness"));
const PortfolioAmplification = lazy(() => import("./pages/portfolio/PortfolioAmplification"));
const HoldPeriod = lazy(() => import("./pages/portfolio/HoldPeriod"));
const ValueDrivers = lazy(() => import("./pages/portfolio/ValueDrivers"));
const Dashboard = lazy(() => import("./pages/portfolio/Dashboard"));
const ScenarioPlanner = lazy(() => import("./pages/portfolio/ScenarioPlanner"));
const VarDirectory = lazy(() => import("./pages/VarDirectory"));
const VarDossier = lazy(() => import("./pages/VarDossier"));
const MaEngine = lazy(() => import("./pages/MaEngine"));
const MaScenario = lazy(() => import("./pages/MaScenario"));
const Insights = lazy(() => import("./pages/Insights"));

// Loading fallback
function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-[var(--color-navy)] border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-[var(--color-muted)]">Loading...</p>
      </div>
    </div>
  );
}

function LazyPage({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<PageLoader />}>{children}</Suspense>;
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <AppShell />,
    children: [
      {
        index: true,
        element: <Navigate to="/portfolio/executive-summary" replace />,
      },
      {
        path: "portfolio",
        children: [
          {
            index: true,
            element: <Navigate to="/portfolio/executive-summary" replace />,
          },
          {
            path: "executive-summary",
            element: <LazyPage><ExecutiveSummary /></LazyPage>,
          },
          {
            path: "value-readiness",
            element: <LazyPage><ValueReadiness /></LazyPage>,
          },
          {
            path: "portfolio-amplification",
            element: <LazyPage><PortfolioAmplification /></LazyPage>,
          },
          {
            path: "hold-period",
            element: <LazyPage><HoldPeriod /></LazyPage>,
          },
          {
            path: "value-drivers",
            element: <LazyPage><ValueDrivers /></LazyPage>,
          },
          {
            path: "dashboard",
            element: <LazyPage><Dashboard /></LazyPage>,
          },
          {
            path: "scenario-planner",
            element: <LazyPage><ScenarioPlanner /></LazyPage>,
          },
        ],
      },
      {
        path: "vars",
        element: <LazyPage><VarDirectory /></LazyPage>,
      },
      {
        path: "vars/:id",
        element: <LazyPage><VarDossier /></LazyPage>,
      },
      {
        path: "ma-engine",
        element: <LazyPage><MaEngine /></LazyPage>,
      },
      {
        path: "ma-engine/scenario",
        element: <LazyPage><MaScenario /></LazyPage>,
      },
      {
        path: "insights",
        element: <LazyPage><Insights /></LazyPage>,
      },
    ],
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
