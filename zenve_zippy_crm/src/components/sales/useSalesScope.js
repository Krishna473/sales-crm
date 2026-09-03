import { useState, useEffect, useMemo, useCallback } from "react";
import { fetchList } from "../../api.js";

export const ALL_REGIONS = "ALL";

// Tasks/alerts have no direct executive-id field in the schema — only a
// pincode. An item is "in scope" if it's tagged with one of the covered pin
// codes, or has no pincode at all (a general item visible to everyone in
// scope). Same approach used throughout this project wherever tasks are
// shown, since there's no other real link available yet.
export function useSalesScope(session) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [executives, setExecutives] = useState([]);
  const [coverage, setCoverage] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [products, setProducts] = useState([]);
  const [inventory, setInventory] = useState([]);

  const loadAll = useCallback(() => {
    setLoading(true);
    setError("");
    Promise.all([
      fetchList("sales_executives"),
      fetchList("pincode_coverage"),
      fetchList("executive_tasks"),
      fetchList("executive_alerts"),
      fetchList("doctors"),
      fetchList("products"),
      fetchList("inventory"),
    ])
      .then(([execs, cov, tsk, alr, docs, prods, inv]) => {
        setExecutives(Array.isArray(execs) ? execs : []);
        setCoverage(Array.isArray(cov) ? cov : []);
        setTasks(Array.isArray(tsk) ? tsk : []);
        setAlerts(Array.isArray(alr) ? alr : []);
        setDoctors(Array.isArray(docs) ? docs : []);
        setProducts(Array.isArray(prods) ? prods : []);
        setInventory(Array.isArray(inv) ? inv : []);
      })
      .catch((err) => setError(err?.message || "Failed to load sales data"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const execsInScope = useMemo(() => {
    if (session.role === "executive") {
      const one = executives.find((e) => e.id === session.executive?.id);
      return one ? [one] : [];
    }
    if (!session.region || session.region === ALL_REGIONS) return executives;
    return executives.filter((e) => e.region === session.region);
  }, [session, executives]);

  const coveredPincodes = useMemo(() => {
    const ids = new Set(execsInScope.map((e) => e.id));
    return new Set(coverage.filter((c) => ids.has(c.executive_id)).map((c) => c.pincode));
  }, [execsInScope, coverage]);

  const myCoverage = useMemo(
    () => coverage.filter((c) => execsInScope.some((e) => e.id === c.executive_id)),
    [coverage, execsInScope]
  );

  const scopedTasks = useMemo(
    () => tasks.filter((t) => !t.pincode || coveredPincodes.has(t.pincode)),
    [tasks, coveredPincodes]
  );
  const scopedAlerts = useMemo(
    () => alerts.filter((a) => !a.pincode || coveredPincodes.has(a.pincode)),
    [alerts, coveredPincodes]
  );
  const areaDoctors = useMemo(() => doctors.filter((d) => coveredPincodes.has(d.pincode)), [doctors, coveredPincodes]);
  const areaProducts = useMemo(() => products.filter((p) => coveredPincodes.has(p.pincode)), [products, coveredPincodes]);

  return {
    loading,
    error,
    loadAll,
    executives,
    coverage,
    tasks,
    alerts,
    doctors,
    products,
    inventory,
    execsInScope,
    coveredPincodes,
    myCoverage,
    scopedTasks,
    scopedAlerts,
    areaDoctors,
    areaProducts,
    setTasks,
    setAlerts,
  };
}
