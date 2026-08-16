import { Suspense, lazy, useState } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { Menu } from "lucide-react";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";

const Overview = lazy(() => import("./pages/Overview"));
const ChurnAnalysis = lazy(() => import("./pages/ChurnAnalysis"));
const CustomerPrediction = lazy(() => import("./pages/CustomerPrediction"));
const RiskCustomers = lazy(() => import("./pages/RiskCustomers"));

const pageMeta = {
  "/": {
    title: "Overview",
    description: "Monitor customer churn, risk exposure, and retention opportunities.",
  },
  "/analysis": {
    title: "Churn Analysis",
    description: "Explore customer behavior and service patterns associated with churn.",
  },
  "/prediction": {
    title: "Customer Prediction",
    description: "Estimate churn probability for an individual customer.",
  },
  "/risk": {
    title: "Risk Customers",
    description: "Prioritize customers who may require retention attention.",
  },
};

function AppShell({ children, pathname, onMenuClick, sidebarOpen, onCloseSidebar }) {
  const meta = pageMeta[pathname] ?? pageMeta["/"];

  return (
    <div className="app-shell">
      <Sidebar isOpen={sidebarOpen} onClose={onCloseSidebar} />
      <div className="app-main">
        <header className="mobile-topbar">
          <button
            type="button"
            className="mobile-nav-button"
            aria-label="Open navigation"
            onClick={onMenuClick}
          >
            <Menu size={18} />
          </button>
          <div>
            <div className="mobile-topbar__title">ChurnIQ</div>
            <div className="mobile-topbar__subtitle">Telecom Intelligence</div>
          </div>
        </header>
        <main className="app-content">
          <div className="content-frame">
            <Header title={meta.title} description={meta.description} />
            <div className="page-content">{children}</div>
            <footer className="app-footer">
              <span>Telecom Churn Intelligence</span>
              <span>Model: XGBoost</span>
              <span>Version 1.0</span>
            </footer>
          </div>
        </main>
      </div>
    </div>
  );
}

function AppRoutes({ sidebarOpen, onMenuClick, onCloseSidebar }) {
  const { pathname } = useLocation();

  return (
    <AppShell
      pathname={pathname}
      onMenuClick={onMenuClick}
      sidebarOpen={sidebarOpen}
      onCloseSidebar={onCloseSidebar}
    >
      <Suspense
        fallback={
          <section className="panel">
            <div className="empty-state empty-state--compact">
              <p>Loading workspace...</p>
            </div>
          </section>
        }
      >
        <Routes>
          <Route path="/" element={<Overview />} />
          <Route path="/analysis" element={<ChurnAnalysis />} />
          <Route path="/prediction" element={<CustomerPrediction />} />
          <Route path="/risk" element={<RiskCustomers />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </AppShell>
  );
}

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <AppRoutes
      sidebarOpen={sidebarOpen}
      onMenuClick={() => setSidebarOpen(true)}
      onCloseSidebar={() => setSidebarOpen(false)}
    />
  );
}
