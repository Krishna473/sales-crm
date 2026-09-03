import { useState } from "react";
import SalesLogin from "./SalesLogin.jsx";
import SalesLayout from "./SalesLayout.jsx";
import SalesDashboardHome from "./SalesDashboardHome.jsx";
import SalesDailyPlan from "./SalesDailyPlan.jsx";
import SalesProfile from "./SalesProfile.jsx";
import SalesTeamView from "./SalesTeamView.jsx";

export default function SalesPortal({ onExitToAdmin }) {
  const [session, setSession] = useState(null); // { role, executive, region }
  const [page, setPage] = useState("dashboard");

  if (!session) {
    return <SalesLogin onLogin={(s) => { setSession(s); setPage("dashboard"); }} />;
  }

  return (
    <SalesLayout session={session} activePage={page} onNavigate={setPage} onLogout={() => setSession(null)} onBackToAdmin={onExitToAdmin}>
      {page === "dashboard" && <SalesDashboardHome session={session} onNavigate={setPage} />}
      {page === "dailyPlan" && <SalesDailyPlan session={session} />}
      {page === "profile" && <SalesProfile session={session} />}
      {page === "team" && session.role !== "executive" && <SalesTeamView session={session} />}
    </SalesLayout>
  );
}
