import { useEffect, useState } from "react";
import { api, type LeaveRequest } from "../lib/api";

type EssProfile = {
  employeeCode: string;
  firstName: string;
  lastName: string;
  designation: string;
  department: string;
  netPayCurrency?: string | null;
  manager?: {
    firstName: string;
    lastName: string;
    employeeCode: string;
  } | null;
};

function formatEssMoney(value: number, currency?: string | null) {
  const amount = value.toLocaleString();
  const code = currency?.trim();
  return code ? `${code} ${amount}` : amount;
}

type Payslip = {
  id: string;
  month: number;
  year: number;
  netPay: number;
};

export function EssPage() {
  const [profile, setProfile] = useState<EssProfile | null>(null);
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [payslips, setPayslips] = useState<Payslip[]>([]);

  useEffect(() => {
    Promise.all([
      api.get<EssProfile>("/ess/me"),
      api.get<LeaveRequest[]>("/ess/my-leaves"),
      api.get<Payslip[]>("/ess/my-payslips"),
    ]).then(([profileRes, leavesRes, payslipsRes]) => {
      setProfile(profileRes.data);
      setLeaves(leavesRes.data);
      setPayslips(payslipsRes.data);
    });
  }, []);

  if (!profile) {
    return <p>Loading ESS profile...</p>;
  }

  return (
    <section>
      <h2 className="section-heading">Employee Self-Service</h2>

      <div className="stats-grid">
        <article className="stat-card">
          <div className="label">Employee ID</div>
          <div className="value">{profile.employeeCode}</div>
        </article>
        <article className="stat-card">
          <div className="label">Department</div>
          <div className="value">{profile.department}</div>
        </article>
        <article className="stat-card">
          <div className="label">Designation</div>
          <div className="value">{profile.designation}</div>
        </article>
      </div>

      <div className="grid-2">
        <div className="panel">
          <h3>My Leave Requests</h3>
          <table>
            <thead>
              <tr>
                <th>Type</th>
                <th>Dates</th>
                <th>Days</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {leaves.map((leave) => (
                <tr key={leave.id}>
                  <td>{leave.leaveType?.name ?? leave.leaveTypeId}</td>
                  <td>
                    {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                  </td>
                  <td>{leave.days}</td>
                  <td>{leave.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="panel">
          <h3>My Payslips</h3>
          <table>
            <thead>
              <tr>
                <th>Month</th>
                <th>Year</th>
                <th>Net Pay</th>
              </tr>
            </thead>
            <tbody>
              {payslips.map((payslip) => (
                <tr key={payslip.id}>
                  <td>{payslip.month}</td>
                  <td>{payslip.year}</td>
                  <td>{formatEssMoney(payslip.netPay, profile.netPayCurrency)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
