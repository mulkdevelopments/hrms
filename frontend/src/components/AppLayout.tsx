import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function AppLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="logo">HRMS Enterprise</div>
        <nav>
          <NavLink to="/" end className="nav-link">
            Dashboard
          </NavLink>
          <NavLink to="/employees" className="nav-link">
            Employees
          </NavLink>
          <NavLink to="/leave" className="nav-link">
            Leave Management
          </NavLink>
        </nav>
      </aside>

      <main className="content">
        <header className="topbar">
          <div>
            <div className="title">{user?.employee ? `${user.employee.firstName} ${user.employee.lastName}` : user?.email}</div>
            <div className="subtitle">Role: {user?.role}</div>
          </div>
          <button type="button" className="button button-secondary" onClick={logout}>
            Logout
          </button>
        </header>
        <Outlet />
      </main>
    </div>
  );
}
