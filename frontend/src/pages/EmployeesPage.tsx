import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { api, type Employee } from "../lib/api";

const initialForm = {
  firstName: "",
  lastName: "",
  email: "",
  designation: "",
  department: "",
  dateOfJoining: "",
  employmentType: "Full-Time",
  basicSalary: 0,
  housingAllowance: 0,
  transportAllowance: 0,
};

export function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState(initialForm);

  const loadEmployees = () => {
    api
      .get<Employee[]>("/employees", {
        params: search ? { search } : undefined,
      })
      .then((res) => setEmployees(res.data));
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    await api.post("/employees", {
      ...form,
      dateOfJoining: new Date(form.dateOfJoining).toISOString(),
    });
    setForm(initialForm);
    loadEmployees();
  };

  return (
    <section>
      <div className="row-between">
        <h2 className="section-heading">Employee Master</h2>
        <button className="button button-secondary" type="button" onClick={loadEmployees}>
          Refresh
        </button>
      </div>

      <div className="panel form-panel">
        <h3>Add Employee</h3>
        <form className="grid-form" onSubmit={submit}>
          <input placeholder="First Name" value={form.firstName} onChange={(event) => setForm({ ...form, firstName: event.target.value })} required />
          <input placeholder="Last Name" value={form.lastName} onChange={(event) => setForm({ ...form, lastName: event.target.value })} required />
          <input placeholder="Official Email" type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required />
          <input placeholder="Designation" value={form.designation} onChange={(event) => setForm({ ...form, designation: event.target.value })} required />
          <input placeholder="Department" value={form.department} onChange={(event) => setForm({ ...form, department: event.target.value })} required />
          <input type="date" value={form.dateOfJoining} onChange={(event) => setForm({ ...form, dateOfJoining: event.target.value })} required />
          <input placeholder="Employment Type" value={form.employmentType} onChange={(event) => setForm({ ...form, employmentType: event.target.value })} required />
          <input
            placeholder="Basic Salary"
            type="number"
            value={form.basicSalary}
            onChange={(event) => setForm({ ...form, basicSalary: Number(event.target.value) })}
            required
          />
          <input
            placeholder="Housing Allowance"
            type="number"
            value={form.housingAllowance}
            onChange={(event) => setForm({ ...form, housingAllowance: Number(event.target.value) })}
            required
          />
          <input
            placeholder="Transport Allowance"
            type="number"
            value={form.transportAllowance}
            onChange={(event) => setForm({ ...form, transportAllowance: Number(event.target.value) })}
            required
          />
          <button className="button" type="submit">
            Create Employee
          </button>
        </form>
      </div>

      <div className="panel">
        <div className="row-between">
          <h3>Employee Records</h3>
          <div className="inline-row">
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by name/emp id/department" />
            <button className="button button-secondary" type="button" onClick={loadEmployees}>
              Search
            </button>
          </div>
        </div>
        <table>
          <thead>
            <tr>
              <th>EMP ID</th>
              <th>Name</th>
              <th>Department</th>
              <th>Designation</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((employee) => (
              <tr key={employee.id}>
                <td>{employee.employeeCode}</td>
                <td>{employee.firstName} {employee.lastName}</td>
                <td>{employee.department}</td>
                <td>{employee.designation}</td>
                <td>{employee.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
