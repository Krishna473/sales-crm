import { useSalesScope } from "./useSalesScope.js";
import "./sales-portal.css";

function isDueToday(dueDate) {
  if (!dueDate) return false;
  return new Date(dueDate).toDateString() === new Date().toDateString();
}

export default function SalesDashboardHome({ session, onNavigate }) {
  const { loading, error, scopedTasks, scopedAlerts, areaDoctors, areaProducts, inventory, coveredPincodes } =
    useSalesScope(session);

  if (loading) return <p className="sp-muted">Loading dashboard…</p>;
  if (error) return <p className="sp-login-error">{error}</p>;

  const total = scopedTasks.length;
  const done = scopedTasks.filter((t) => t.status === "done").length;
  const inProgress = scopedTasks.filter((t) => t.status === "in_progress").length;
  const open = total - done - inProgress;
  const donePct = total ? Math.round((done / total) * 100) : 0;
  const progressPct = total ? Math.round((inProgress / total) * 100) : 0;

  const unreadAlerts = scopedAlerts.filter((a) => !a.is_read).length;
  const lowStock = inventory.filter(
    (i) => coveredPincodes.has(i.pincode) && (Number(i.available_quantity) || 0) <= (Number(i.reorder_level) || 0)
  ).length;

  const todayTasks = scopedTasks.filter((t) => isDueToday(t.due_date));

  const donutGradient = `conic-gradient(var(--primary) 0deg ${donePct * 3.6}deg, var(--accent) ${donePct * 3.6}deg ${
    (donePct + progressPct) * 3.6
  }deg, var(--border) ${(donePct + progressPct) * 3.6}deg 360deg)`;

  return (
    <div>
      <div className="sp-card">
        <h2>
          Welcome back{session.executive?.name ? `, ${session.executive.name}` : ""}
        </h2>
        <p className="sp-muted">
          {session.role === "executive"
            ? "Here's your task progress and today's plan."
            : `Team overview for ${session.role === "regionalManager" ? session.region || "all regions" : session.region}.`}
        </p>
      </div>

      <div className="sp-stats-grid">
        <div className="sp-stat-card">
          <p className="sp-stat-label">Total tasks</p>
          <p className="sp-stat-value">{total}</p>
        </div>
        <div className="sp-stat-card">
          <p className="sp-stat-label">Completed</p>
          <p className="sp-stat-value">{done}</p>
        </div>
        <div className="sp-stat-card">
          <p className="sp-stat-label">Unread alerts</p>
          <p className="sp-stat-value">{unreadAlerts}</p>
        </div>
        <div className="sp-stat-card">
          <p className="sp-stat-label">Low stock rows</p>
          <p className="sp-stat-value">{lowStock}</p>
        </div>
      </div>

      <div className="sp-dashboard-grid">
        <div className="sp-card">
          <h3>Task completion</h3>
          <p className="sp-muted">{total} tasks in scope</p>
          <div className="sp-donut-wrap" style={{ marginTop: 14 }}>
            <div className="sp-donut" style={{ background: total ? donutGradient : "var(--border)" }}>
              <div className="sp-donut-center">
                <strong>{donePct}%</strong>
                <span>done</span>
              </div>
            </div>
            <ul className="sp-donut-legend">
              <li>
                <span className="sp-legend-dot" style={{ background: "var(--primary)" }} /> Done — {done}
              </li>
              <li>
                <span className="sp-legend-dot" style={{ background: "var(--accent)" }} /> In progress — {inProgress}
              </li>
              <li>
                <span className="sp-legend-dot" style={{ background: "var(--border)" }} /> Open — {open}
              </li>
            </ul>
          </div>
        </div>

        <div className="sp-card">
          <h3>Today's plan</h3>
          <p className="sp-muted">{todayTasks.length} task(s) due today</p>
          <div className="sp-task-list">
            {todayTasks.length === 0 ? (
              <p className="sp-muted" style={{ marginTop: 10 }}>
                Nothing due today.
              </p>
            ) : (
              todayTasks.map((t) => (
                <div className="sp-task-row" key={t.id}>
                  <div>
                    <p className="sp-task-title">{t.title}</p>
                    <p className="sp-muted">
                      pin {t.pincode || "—"} · {String(t.priority || "").toUpperCase()}
                    </p>
                  </div>
                  <span className={"sp-status-pill" + (t.status === "done" ? " active" : "")}>{t.status}</span>
                </div>
              ))
            )}
          </div>
          <button className="sp-logout-btn" style={{ marginTop: 14 }} onClick={() => onNavigate("dailyPlan")}>
            Open Daily Activities →
          </button>
        </div>
      </div>

      <div className="sp-card">
        <h3>Area snapshot</h3>
        <p className="sp-muted">
          {areaDoctors.length} doctors · {areaProducts.length} products/SKUs in {coveredPincodes.size} covered pin code(s)
        </p>
      </div>
    </div>
  );
}
