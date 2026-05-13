import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { api, type LeaveRequest, type LeaveType } from "../lib/api";
import { useAuth } from "../context/AuthContext";

type Balance = {
  id: string;
  openingBalance: number;
  accrued: number;
  used: number;
  carryForward: number;
  leaveType: LeaveType;
};

export function LeavePage() {
  const { user } = useAuth();
  const [types, setTypes] = useState<LeaveType[]>([]);
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [balances, setBalances] = useState<Balance[]>([]);
  const [form, setForm] = useState({ leaveTypeId: "", startDate: "", endDate: "", days: 1, reason: "" });

  const load = async () => {
    const [typesRes, requestsRes] = await Promise.all([api.get<LeaveType[]>("/leave/types"), api.get<LeaveRequest[]>("/leave/requests")]);
    setTypes(typesRes.data);
    setRequests(requestsRes.data);

    if (user?.employee?.id) {
      const balanceRes = await api.get<Balance[]>(`/leave/balances/${user.employee.id}`);
      setBalances(balanceRes.data);
    }
  };

  useEffect(() => {
    load();
  }, [user?.employee?.id]);

  const applyLeave = async (event: FormEvent) => {
    event.preventDefault();
    if (!user?.employee?.id) return;

    await api.post("/leave/requests", {
      employeeId: user.employee.id,
      leaveTypeId: form.leaveTypeId,
      startDate: new Date(form.startDate).toISOString(),
      endDate: new Date(form.endDate).toISOString(),
      days: Number(form.days),
      reason: form.reason,
    });

    setForm({ leaveTypeId: "", startDate: "", endDate: "", days: 1, reason: "" });
    load();
  };

  const l1Approve = async (id: string) => {
    await api.post(`/leave/requests/${id}/l1-approve`);
    load();
  };

  const l2Approve = async (id: string) => {
    await api.post(`/leave/requests/${id}/l2-approve`);
    load();
  };

  return (
    <section>
      <h2 className="section-heading">Leave Management</h2>

      <div className="panel form-panel">
        <h3>Apply Leave</h3>
        <form className="grid-form" onSubmit={applyLeave}>
          <select value={form.leaveTypeId} onChange={(event) => setForm({ ...form, leaveTypeId: event.target.value })} required>
            <option value="">Select Leave Type</option>
            {types.map((type) => (
              <option key={type.id} value={type.id}>
                {type.name} ({type.yearlyAllocation}/year)
              </option>
            ))}
          </select>
          <input type="date" value={form.startDate} onChange={(event) => setForm({ ...form, startDate: event.target.value })} required />
          <input type="date" value={form.endDate} onChange={(event) => setForm({ ...form, endDate: event.target.value })} required />
          <input type="number" min={1} max={60} value={form.days} onChange={(event) => setForm({ ...form, days: Number(event.target.value) })} required />
          <input placeholder="Reason" value={form.reason} onChange={(event) => setForm({ ...form, reason: event.target.value })} required />
          <button className="button" type="submit">
            Submit Request
          </button>
        </form>
      </div>

      <div className="grid-2">
        <div className="panel">
          <h3>My Leave Balances</h3>
          <table>
            <thead>
              <tr>
                <th>Leave Type</th>
                <th>Opening</th>
                <th>Accrued</th>
                <th>Used</th>
                <th>Carry Forward</th>
              </tr>
            </thead>
            <tbody>
              {balances.map((balance) => (
                <tr key={balance.id}>
                  <td>{balance.leaveType.name}</td>
                  <td>{balance.openingBalance}</td>
                  <td>{balance.accrued}</td>
                  <td>{balance.used}</td>
                  <td>{Math.min(60, balance.carryForward)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="panel">
          <h3>Approval Queue</h3>
          <table>
            <thead>
              <tr>
                <th>Employee</th>
                <th>Leave Type</th>
                <th>Days</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((request) => (
                <tr key={request.id}>
                  <td>{request.employee ? `${request.employee.firstName} ${request.employee.lastName}` : request.employeeId}</td>
                  <td>{request.leaveType?.name ?? request.leaveTypeId}</td>
                  <td>{request.days}</td>
                  <td>{request.status}</td>
                  <td>
                    {request.status === "PENDING_L1" ? (
                      <button className="button button-secondary" onClick={() => l1Approve(request.id)} type="button">
                        L1 Approve
                      </button>
                    ) : null}
                    {request.status === "PENDING_L2" ? (
                      <button className="button button-secondary" onClick={() => l2Approve(request.id)} type="button">
                        L2 Approve
                      </button>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
