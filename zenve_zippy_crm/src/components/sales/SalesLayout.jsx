import "./sales-portal.css";
import logo from "../../assets/zenve-zippy-logo.png";

const NAV_ITEMS = [
  { key: "dashboard", label: "Dashboard", roles: ["executive", "manager", "regionalManager"] },
  { key: "dailyPlan", label: "Daily Activities", roles: ["executive", "manager", "regionalManager"] },
  { key: "team", label: "My Team", roles: ["manager", "regionalManager"] },
  { key: "profile", label: "My Profile", roles: ["executive", "manager", "regionalManager"] },
];

function initialsOf(name) {
  if (!name) return "?";
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function SalesLayout({ session, activePage, onNavigate, onLogout, onBackToAdmin, children }) {
  const displayName = session.executive?.name || (session.role === "regionalManager" ? "Regional Manager" : "Sales Manager");
  const items = NAV_ITEMS.filter((i) => i.roles.includes(session.role));

  return (
    <div className="sp-root">
      <header className="sp-topnav">
        <div className="sp-topnav-brand">
          <img src={logo} alt="Zenve Zippy" />
          <span>Zenve Zippy · Sales</span>
        </div>

        <nav className="sp-topnav-menu">
          {items.map((item) => (
            <button
              key={item.key}
              className={activePage === item.key ? "active" : ""}
              onClick={() => onNavigate(item.key)}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="sp-topnav-right">
          <button className="sp-bell" title="Alerts" onClick={() => onNavigate("dashboard")}>
            🔔
            <span className="sp-bell-dot" />
          </button>
          <button className="sp-avatar" title={displayName} onClick={() => onNavigate("profile")}>
            {initialsOf(displayName)}
          </button>
          <button className="sp-logout-btn" onClick={onBackToAdmin}>
            Admin CRM
          </button>
          <button className="sp-logout-btn" onClick={onLogout}>
            Logout
          </button>
        </div>
      </header>

      <main className="sp-body">{children}</main>
    </div>
  );
}
