import { useEffect, useState } from "react";
import { fetchList } from "../../api.js";
import logo from "../../assets/zenve-zippy-logo.png";
import "./sales-portal.css";

const ROLES = [
  { key: "executive", label: "Sales Executive" },
  { key: "manager", label: "Sales Manager" },
  { key: "regionalManager", label: "Regional Manager" },
];

export default function SalesLogin({ onLogin }) {
  const [role, setRole] = useState("executive");
  const [executives, setExecutives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [executiveId, setExecutiveId] = useState("");
  const [region, setRegion] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    fetchList("sales_executives")
      .then((rows) => setExecutives(Array.isArray(rows) ? rows : []))
      .catch((err) => setError(err?.message || "Couldn't load employee list"))
      .finally(() => setLoading(false));
  }, []);

  const regions = [...new Set(executives.map((e) => e.region).filter(Boolean))];

  const canSubmit = role === "executive" ? Boolean(executiveId) : Boolean(region);

  function handleSubmit(e) {
    e.preventDefault();
    if (!canSubmit) return;
    if (role === "executive") {
      const exec = executives.find((x) => String(x.id) === String(executiveId));
      onLogin({ role, executive: exec, region: exec?.region || null });
    } else {
      onLogin({ role, executive: null, region });
    }
  }

  return (
    <div className="sp-root">
      <div className="sp-login-wrap">
        <form className="sp-login-card" onSubmit={handleSubmit}>
          <div className="sp-login-logo">
            <img src={logo} alt="Zenve Zippy" />
            <div>
              <h1>Zenve Zippy</h1>
              <p>Sales team login</p>
            </div>
          </div>

          {error && <p className="sp-login-error">{error}</p>}

          <div className="sp-role-toggle">
            {ROLES.map((r) => (
              <button
                type="button"
                key={r.key}
                className={role === r.key ? "active" : ""}
                onClick={() => {
                  setRole(r.key);
                  setExecutiveId("");
                  setRegion("");
                }}
              >
                {r.label}
              </button>
            ))}
          </div>

          {role === "executive" ? (
            <div className="sp-field">
              <label>Employee</label>
              <select value={executiveId} onChange={(e) => setExecutiveId(e.target.value)} disabled={loading}>
                <option value="">{loading ? "Loading employees…" : "Select your name"}</option>
                {executives.map((ex) => (
                  <option key={ex.id} value={ex.id}>
                    {ex.name} — {ex.region || ex.city || "—"}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="sp-field">
              <label>{role === "regionalManager" ? "Region you oversee" : "Region"}</label>
              <select value={region} onChange={(e) => setRegion(e.target.value)} disabled={loading}>
                <option value="">{loading ? "Loading regions…" : "Select region"}</option>
                {regions.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="sp-field">
            <label>Password</label>
            <input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>

          <button type="submit" className="sp-login-btn" disabled={!canSubmit}>
            Login
          </button>

          <p className="sp-login-note">
            No authentication backend exists yet, so password isn't checked — selecting your name/region and clicking Login is
            enough for now. Once real auth is added, this form's submit handler is the only thing that needs to change.
          </p>
        </form>
      </div>
    </div>
  );
}
