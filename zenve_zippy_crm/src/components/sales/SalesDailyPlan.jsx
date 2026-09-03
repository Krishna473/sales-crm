import { useMemo, useState } from "react";
import { createRecord, updateRecord } from "../../api.js";
import { useSalesScope } from "./useSalesScope.js";
import "./sales-portal.css";

const PLAN_TABS = ["standard", "monthly", "daily"];

function isWithinPlan(dueDate, plan) {
  if (plan === "standard") return true;
  if (!dueDate) return false;
  const due = new Date(dueDate);
  const today = new Date();
  if (plan === "daily") return due.toDateString() === today.toDateString();
  if (plan === "monthly") return due.getFullYear() === today.getFullYear() && due.getMonth() === today.getMonth();
  return true;
}

function formatINR(n) {
  return "₹" + Math.round(n || 0).toLocaleString("en-IN");
}

export default function SalesDailyPlan({ session }) {
  const scope = useSalesScope(session);
  const { loading, error, scopedTasks, scopedAlerts, myCoverage, areaDoctors, areaProducts, setTasks, setAlerts } = scope;

  const [subTab, setSubTab] = useState("tasks"); // tasks | alerts | coverage
  const [activePlan, setActivePlan] = useState("standard");

  const [taskTitle, setTaskTitle] = useState("");
  const [taskPincode, setTaskPincode] = useState("");
  const [taskPriority, setTaskPriority] = useState("medium");
  const [taskDue, setTaskDue] = useState("");
  const [busy, setBusy] = useState(false);
  const [localError, setLocalError] = useState("");

  const planFilteredTasks = useMemo(
    () => scopedTasks.filter((t) => isWithinPlan(t.due_date, activePlan)),
    [scopedTasks, activePlan]
  );

  const assignPincodeOptions = [...new Set(myCoverage.map((c) => c.pincode))];

  function addTask() {
    if (!taskTitle.trim()) return;
    setBusy(true);
    createRecord("executive_tasks", {
      title: taskTitle.trim(),
      task_type: session.role === "executive" ? "field_task" : session.role === "manager" ? "manager_assigned" : "regional_assigned",
      entity_type: "general",
      pincode: taskPincode.trim() || null,
      priority: taskPriority,
      status: "open",
      due_date: taskDue || null,
    })
      .then((created) => {
        setTasks((prev) => [...prev, created]);
        setTaskTitle("");
        setTaskPincode("");
        setTaskDue("");
        setTaskPriority("medium");
      })
      .catch((err) => setLocalError(err?.message || "Failed to add task"))
      .finally(() => setBusy(false));
  }

  function setTaskStatus(task, status) {
    updateRecord("executive_tasks", task.id, { status })
      .then((updated) => setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t))))
      .catch((err) => setLocalError(err?.message || "Failed to update task"));
  }

  function markAlertRead(alert) {
    updateRecord("executive_alerts", alert.id, { is_read: true })
      .then((updated) => setAlerts((prev) => prev.map((a) => (a.id === updated.id ? updated : a))))
      .catch((err) => setLocalError(err?.message || "Failed to update alert"));
  }

  if (loading) return <p className="sp-muted">Loading…</p>;
  if (error) return <p className="sp-login-error">{error}</p>;

  return (
    <div>
      <div className="sp-card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <div className="sp-topnav-menu" style={{ padding: 0 }}>
          {["tasks", "alerts", "coverage"].map((t) => (
            <button key={t} className={subTab === t ? "active" : ""} onClick={() => setSubTab(t)}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
        {subTab === "tasks" && (
          <div className="sp-plan-tabs">
            {PLAN_TABS.map((plan) => (
              <button key={plan} className={activePlan === plan ? "active" : ""} onClick={() => setActivePlan(plan)}>
                {plan.charAt(0).toUpperCase() + plan.slice(1)} plan
              </button>
            ))}
          </div>
        )}
      </div>

      {localError && <p className="sp-login-error">{localError}</p>}

      {subTab === "tasks" && (
        <>
          <div className="sp-card">
            <h3>{session.role === "executive" ? "Add a field task" : "Assign a task"}</h3>
            <div className="sp-task-form">
              <input placeholder="Task title" value={taskTitle} onChange={(e) => setTaskTitle(e.target.value)} />
              <select value={taskPincode} onChange={(e) => setTaskPincode(e.target.value)}>
                <option value="">Pin code</option>
                {assignPincodeOptions.map((pc) => (
                  <option key={pc} value={pc}>
                    {pc}
                  </option>
                ))}
              </select>
              <select value={taskPriority} onChange={(e) => setTaskPriority(e.target.value)}>
                <option value="low">low</option>
                <option value="medium">medium</option>
                <option value="high">high</option>
              </select>
              <input type="date" value={taskDue} onChange={(e) => setTaskDue(e.target.value)} />
              <button className="sp-login-btn" style={{ width: "auto", height: 40, padding: "0 16px" }} onClick={addTask} disabled={busy || !taskTitle.trim()}>
                Add task
              </button>
            </div>
            {session.role !== "executive" && (
              <p className="sp-login-note">
                Tasks are matched to executives by pin code — there's no direct assignee field on tasks in the current schema.
              </p>
            )}
          </div>

          <div className="sp-card">
            <h3>
              {session.role === "executive" ? "My tasks" : "Team tasks"}{" "}
              <span className="sp-muted">({activePlan} plan · {planFilteredTasks.length})</span>
            </h3>
            <div className="sp-task-list">
              {planFilteredTasks.length === 0 ? (
                <p className="sp-muted">No tasks in this view.</p>
              ) : (
                planFilteredTasks.map((t) => (
                  <div className="sp-task-row" key={t.id}>
                    <div>
                      <p className="sp-task-title">{t.title}</p>
                      <p className="sp-muted">
                        {t.task_type} · pin {t.pincode || "—"} · due {t.due_date || "—"} · {String(t.priority || "").toUpperCase()}
                      </p>
                    </div>
                    <div className="sp-status-pills">
                      {[
                        ["open", "open"],
                        ["in_progress", "in progress"],
                        ["done", "done"],
                      ].map(([value, label]) => (
                        <button
                          key={value}
                          className={"sp-status-pill" + (t.status === value ? " active" : "")}
                          onClick={() => setTaskStatus(t, value)}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}

      {subTab === "alerts" && (
        <div className="sp-card">
          <h3>Alerts</h3>
          <div className="sp-task-list">
            {scopedAlerts.length === 0 ? (
              <p className="sp-muted">No alerts.</p>
            ) : (
              scopedAlerts.map((a) => (
                <div className="sp-task-row" key={a.id}>
                  <div>
                    <p className="sp-task-title">{a.title}</p>
                    <p className="sp-muted">
                      {a.severity} · pin {a.pincode || "—"}
                    </p>
                  </div>
                  {a.is_read ? (
                    <span className="sp-status-pill active">read</span>
                  ) : (
                    <button className="sp-status-pill" onClick={() => markAlertRead(a)}>
                      mark read
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {subTab === "coverage" && (
        <>
          <div className="sp-coverage-grid">
            <div className="sp-card">
              <h3>Pin codes covered</h3>
              <div className="sp-pincode-pills">
                {myCoverage.length === 0 ? (
                  <p className="sp-muted">No pin codes assigned yet.</p>
                ) : (
                  myCoverage.map((c) => (
                    <span className="sp-status-pill" key={c.id}>
                      {c.pincode}
                    </span>
                  ))
                )}
              </div>
            </div>
            <div className="sp-card">
              <h3>Doctors in area</h3>
              <div className="sp-task-list">
                {areaDoctors.length === 0 ? (
                  <p className="sp-muted">None yet.</p>
                ) : (
                  areaDoctors.map((d) => (
                    <div className="sp-task-row" key={d.id}>
                      <div>
                        <p className="sp-task-title">{d.name}</p>
                        <p className="sp-muted">
                          {d.specializations || "—"} · pin {d.pincode}
                        </p>
                      </div>
                      <span className="sp-muted">★ {d.rating ?? "—"}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
          <div className="sp-card">
            <h3>Medicines, pet food &amp; accessories in area</h3>
            <table className="zzc-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Pin</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Rx</th>
                </tr>
              </thead>
              <tbody>
                {areaProducts.length === 0 ? (
                  <tr className="zzc-empty-row">
                    <td colSpan={5}>None yet</td>
                  </tr>
                ) : (
                  areaProducts.map((p) => (
                    <tr key={p.id}>
                      <td>{p.name}</td>
                      <td>{p.pincode}</td>
                      <td>{formatINR(p.price)}</td>
                      <td>{p.stock_quantity}</td>
                      <td>{p.is_prescription_required === true || p.is_prescription_required === "Yes" ? "Yes" : "No"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
