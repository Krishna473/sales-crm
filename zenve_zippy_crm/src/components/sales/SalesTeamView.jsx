import { useMemo } from "react";
import { useSalesScope, ALL_REGIONS } from "./useSalesScope.js";
import "./sales-portal.css";

export default function SalesTeamView({ session }) {
  const { loading, error, execsInScope, coverage, tasks } = useSalesScope(session);

  const execStats = useMemo(() => {
    return execsInScope.map((exec) => {
      const myPincodes = new Set(coverage.filter((c) => c.executive_id === exec.id).map((c) => c.pincode));
      const myTasks = tasks.filter((t) => t.pincode && myPincodes.has(t.pincode));
      const done = myTasks.filter((t) => t.status === "done").length;
      const pct = myTasks.length > 0 ? Math.round((done / myTasks.length) * 100) : null;
      return { exec, taskCount: myTasks.length, done, pct };
    });
  }, [execsInScope, coverage, tasks]);

  const totalAssigned = execStats.reduce((s, r) => s + r.taskCount, 0);
  const totalDone = execStats.reduce((s, r) => s + r.done, 0);
  const overallPct = totalAssigned > 0 ? Math.round((totalDone / totalAssigned) * 100) : null;

  if (loading) return <p className="sp-muted">Loading team…</p>;
  if (error) return <p className="sp-login-error">{error}</p>;

  return (
    <div>
      <div className="sp-card">
        <h2>My Team</h2>
        <p className="sp-muted">
          {session.role === "regionalManager"
            ? session.region && session.region !== ALL_REGIONS
              ? `Scope: ${session.region}`
              : "Scope: all regions"
            : `Scope: ${session.region}`}
        </p>
      </div>

      <div className="sp-stats-grid">
        <div className="sp-stat-card">
          <p className="sp-stat-label">Executives</p>
          <p className="sp-stat-value">{execsInScope.length}</p>
        </div>
        <div className="sp-stat-card">
          <p className="sp-stat-label">Tasks assigned</p>
          <p className="sp-stat-value">{totalAssigned}</p>
        </div>
        <div className="sp-stat-card">
          <p className="sp-stat-label">Tasks completed</p>
          <p className="sp-stat-value">{totalDone}</p>
        </div>
        <div className="sp-stat-card">
          <p className="sp-stat-label">Overall completion</p>
          <p className="sp-stat-value">{overallPct === null ? "—" : `${overallPct}%`}</p>
        </div>
      </div>

      <div className="sp-card">
        <h3>Completion by executive</h3>
        <div className="sp-task-list">
          {execStats.length === 0 ? (
            <p className="sp-muted">No executives in scope yet.</p>
          ) : (
            execStats.map(({ exec, taskCount, done, pct }) => (
              <div className="sp-task-row" key={exec.id}>
                <div>
                  <p className="sp-task-title">
                    {exec.name} <span className="sp-muted">· {exec.region || "—"}</span>
                  </p>
                  <p className="sp-muted">
                    {taskCount} task{taskCount === 1 ? "" : "s"} assigned · {done} completed
                  </p>
                </div>
                <span className="sp-status-pill active">{pct === null ? "no tasks yet" : `${pct}% complete`}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
