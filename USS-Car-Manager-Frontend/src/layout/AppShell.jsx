import { useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { roleLabel } from "../utils/format";

const items = [
  { to: "/", label: "Dashboard", icon: "⌂", exact: true },
  { to: "/cars", label: "Cars", icon: "▣" },
  { to: "/earnings", label: "Earnings", icon: "↗" },
  { to: "/expenses", label: "Expenses", icon: "↘" },
  { to: "/partners", label: "Partners", icon: "◎" },
  { to: "/maintenance", label: "Maintenance", icon: "◇" },
  { to: "/reports", label: "Reports", icon: "▤" },
];

export default function AppShell() {
  const [open, setOpen] = useState(false);
  const { user, logout, isAdmin, canWrite } = useAuth();
  const location = useLocation();

  const close = () => setOpen(false);

  return (
    <div className="app-shell"><a className="skip-link" href="#main-content">Skip to content</a>
      {open && <button className="sidebar-scrim" aria-label="Close navigation" onClick={close} />}
      <aside className={`sidebar ${open ? "is-open" : ""}`}>
        <div className="brand-row">
          <Link className="brand" to="/" onClick={close}>
            <span className="brand-mark">U</span>
            <span><strong>USS</strong><small>Car Manager</small></span>
          </Link>
          <button className="icon-btn sidebar-close" aria-label="Close navigation" onClick={close}>×</button>
        </div>
        <nav className="sidebar-nav">
          <div className="nav-section-label">Workspace</div>
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.exact}
              onClick={close}
              className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
            >
              <span className="nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
          {isAdmin && (
            <>
              <div className="nav-section-label">Administration</div>
              <NavLink to="/audit" onClick={close} className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>
                <span className="nav-icon">◷</span><span>Audit history</span>
              </NavLink>
            </>
          )}
        </nav>
        <div className="sidebar-footer">
          <div className="user-chip">
            <span className="avatar">{(user?.name || "U").slice(0, 1).toUpperCase()}</span>
            <span><strong>{user?.name || "User"}</strong><small>{roleLabel(user?.role)}</small></span>
          </div>
          <button className="btn btn-ghost btn-block" onClick={logout}>Log out</button>
        </div>
      </aside>

      <div className="app-main">
        <header className="topbar">
          <div className="topbar-left">
            <button className="icon-btn menu-btn" aria-label="Open navigation" onClick={() => setOpen(true)}>☰</button>
            <div>
              <div className="topbar-title">USS Car Manager</div>
              <div className="topbar-path">{pathLabel(location.pathname)}</div>
            </div>
          </div>
          <div className="topbar-actions">
            {canWrite && <Link className="btn btn-primary btn-sm desktop-only" to="/quick-add">+ New record</Link>}
            <span className={`role-pill role-${user?.role}`}>{roleLabel(user?.role)}</span>
          </div>
        </header>
        <main id="main-content" className="content"><div key={location.pathname} className="page-enter"><Outlet /></div></main>
        <nav className="mobile-bottom-nav" aria-label="Mobile navigation">
          <NavLink to="/" end><span>⌂</span><small>Home</small></NavLink>
          <NavLink to="/cars"><span>▣</span><small>Cars</small></NavLink>
          {canWrite ? <NavLink to="/quick-add" className="mobile-add"><span>+</span><small>Add</small></NavLink> : <NavLink to="/reports"><span>▤</span><small>Reports</small></NavLink>}
          <NavLink to="/expenses"><span>↘</span><small>Expenses</small></NavLink>
          <button onClick={() => setOpen(true)}><span>☰</span><small>More</small></button>
        </nav>
      </div>
    </div>
  );
}

function pathLabel(path) {
  if (path === "/") return "Dashboard";
  if (path.startsWith("/cars")) return "Fleet";
  if (path.startsWith("/earnings")) return "Earnings";
  if (path.startsWith("/expenses")) return "Expenses";
  if (path.startsWith("/partners")) return "Partners";
  if (path.startsWith("/maintenance")) return "Maintenance";
  if (path.startsWith("/reports")) return "Reports";
  if (path.startsWith("/audit")) return "Audit history";
  return "Workspace";
}
