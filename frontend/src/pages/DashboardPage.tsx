import { useEffect, useState } from "react";
import { api, type DashboardOverview } from "../lib/api";

export function DashboardPage() {
  const [overview, setOverview] = useState<DashboardOverview | null>(null);

  useEffect(() => {
    api.get<DashboardOverview>("/dashboard/overview").then((res) => setOverview(res.data));
  }, []);

  if (!overview) {
    return <p>Loading dashboard...</p>;
  }

  return (
    <section>
      <h2 className="section-heading">Executive Dashboard</h2>
      <div className="stats-grid">
        <article className="stat-card">
          <div className="label">Total Headcount</div>
          <div className="value">{overview.headcount}</div>
        </article>
        <article className="stat-card">
          <div className="label">On Leave Today</div>
          <div className="value">{overview.onLeave}</div>
        </article>
        <article className="stat-card">
          <div className="label">Pending Approvals</div>
          <div className="value">{overview.pendingLeaveApprovals}</div>
        </article>
        <article className="stat-card">
          <div className="label">Monthly Payroll</div>
          <div className="value">AED {overview.monthlyPayroll.toLocaleString()}</div>
        </article>
      </div>

      <div className="panel">
        <h3>Headcount by Department</h3>
        <table>
          <thead>
            <tr>
              <th>Department</th>
              <th>Employees</th>
            </tr>
          </thead>
          <tbody>
            {overview.employeesByDept.map((department) => (
              <tr key={department.department}>
                <td>{department.department}</td>
                <td>{department.count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
