import { NavLink } from "react-router-dom";
import {
  AlertTriangle,
  BarChart3,
  LayoutDashboard,
  Settings,
  UserCircle2,
  UserSearch,
  X,
} from "lucide-react";

const navigationItems = [
  { label: "Overview", to: "/", icon: LayoutDashboard },
  { label: "Churn Analysis", to: "/analysis", icon: BarChart3 },
  { label: "Customer Prediction", to: "/prediction", icon: UserSearch },
  { label: "Risk Customers", to: "/risk", icon: AlertTriangle },
];

export default function Sidebar({ isOpen, onClose }) {
  return (
    <>
      <div
        className={`sidebar-backdrop ${isOpen ? "is-visible" : ""}`}
        onClick={onClose}
        aria-hidden={!isOpen}
      />
      <aside className={`sidebar ${isOpen ? "is-open" : ""}`} aria-label="Primary navigation">
        <div className="sidebar__top">
          <div className="sidebar__brand">
            <div className="brand-mark" aria-hidden="true">
              <span />
            </div>
            <div>
              <div className="sidebar__brand-title">ChurnIQ</div>
              <div className="sidebar__brand-subtitle">Telecom Intelligence</div>
            </div>
          </div>
          <button type="button" className="sidebar__close" aria-label="Close navigation" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <nav className="sidebar__nav">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `sidebar__link ${isActive ? "is-active" : ""}`
                }
                onClick={onClose}
              >
                <Icon size={17} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="sidebar__divider" />

        <div className="sidebar__secondary">
          <button type="button" className="sidebar__link sidebar__link--button">
            <Settings size={17} />
            <span>Settings</span>
          </button>
        </div>

        <div className="sidebar__footer">
          <div className="sidebar__profile">
            <div className="sidebar__profile-icon">
              <UserCircle2 size={18} />
            </div>
            <div>
              <div className="sidebar__profile-name">Operations Analyst</div>
              <div className="sidebar__profile-role">Internal workspace</div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
