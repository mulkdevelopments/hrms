const API_BASE = "/api";
let token = localStorage.getItem("hrms_token");
let me = null;
let leaveTypes = [];
let employees = [];
let allEmployees = [];
let editingEmployeeId = null;
let managerSearchTerm = "";
const elevatedRoles = new Set(["SUPER_ADMIN", "HR", "HR_OFFICER"]);
const l1Roles = new Set(["MANAGER"]);
const l2Roles = new Set(["HR", "HR_OFFICER", "SUPER_ADMIN"]);

const employeeFilters = {
  search: "",
  department: "All Departments",
  status: "All Status",
};
let leaveRequestsCache = [];
let dashboardCache = null;
let notificationsUnread = true;
const liveNotifications = [];
const leaveStatusSnapshot = new Map();

function relativeTimeLabel(date) {
  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.max(1, Math.floor(diffMs / 60000));
  if (diffMin < 60) return `${diffMin} min ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr} hr ago`;
  const diffDay = Math.floor(diffHr / 24);
  return `${diffDay} day ago`;
}

function pushNotification({ title, desc, tone = "info", icon = "bi-bell", time = new Date() }) {
  liveNotifications.unshift({
    title,
    desc,
    tone,
    icon,
    time: relativeTimeLabel(time),
  });
  if (liveNotifications.length > 20) {
    liveNotifications.length = 20;
  }
  notificationsUnread = true;
  renderNotifications();
}

function notify(message) {
  if (typeof window.showToast === "function") {
    window.showToast(message);
  }
}

function getNotificationEntries() {
  const entries = [...liveNotifications];
  if (!me?.employee) return entries;

  entries.push({
    icon: "bi-person-check",
    tone: "success",
    title: "Signed in successfully",
    desc: `Welcome back, ${me.employee.firstName} ${me.employee.lastName}`,
    time: "Just now",
  });

  const pendingRequests = leaveRequestsCache.filter((item) => item.status === "PENDING_L1" || item.status === "PENDING_L2");
  if (pendingRequests.length) {
    const approvalText = l2Roles.has(me.role)
      ? "Awaiting your L2 approval"
      : l1Roles.has(me.role)
        ? "Awaiting your L1 approval"
        : "Your leave request is under review";
    entries.push({
      icon: "bi-clipboard-data",
      tone: "info",
      title: `${pendingRequests.length} Leave Request(s) Pending`,
      desc: approvalText,
      time: "Live",
    });
  }

  if (!me.employee.bankName || !me.employee.iban) {
    entries.push({
      icon: "bi-bank",
      tone: "warn",
      title: "Bank profile incomplete",
      desc: "Please complete IBAN and Bank Name in your profile.",
      time: "Action needed",
    });
  }

  if (me.employee.status === "PROBATION") {
    entries.push({
      icon: "bi-exclamation-triangle",
      tone: "warn",
      title: "Probation status active",
      desc: "Your profile is currently marked under probation.",
      time: "Current",
    });
  }

  if (dashboardCache?.monthlyPayroll && elevatedRoles.has(me.role)) {
    entries.push({
      icon: "bi-cash-coin",
      tone: "success",
      title: "Payroll snapshot updated",
      desc: `Current monthly payroll: AED ${Math.round(dashboardCache.monthlyPayroll).toLocaleString("en-US")}`,
      time: "Latest",
    });
  }

  return entries.slice(0, 8);
}

function renderNotifications() {
  const list = document.getElementById("notif-list");
  const dot = document.getElementById("notif-dot");
  if (!list) return;

  const entries = getNotificationEntries();
  if (!entries.length) {
    list.innerHTML = `<div class="text-muted" style="padding:8px 0">No notifications right now.</div>`;
  } else {
    list.innerHTML = entries.map((item) => `
      <div class="notif-item">
        <div class="notif-icon ${item.tone}"><i class="bi ${item.icon}"></i></div>
        <div>
          <div class="notif-title">${escapeAttr(item.title)}</div>
          <div class="notif-desc">${escapeAttr(item.desc)}</div>
          <div class="notif-time">${escapeAttr(item.time)}</div>
        </div>
      </div>
    `).join("");
  }

  if (dot) {
    dot.style.display = notificationsUnread && entries.length ? "" : "none";
  }
}

function formatLabel(value = "") {
  return String(value).replaceAll("_", " ");
}

function hasRole(roles) {
  return Boolean(me?.role && roles.includes(me.role));
}

function setViewVisibility(view, visible) {
  const navItem = Array.from(document.querySelectorAll(".nav-item")).find((item) =>
    item.getAttribute("onclick")?.includes(`navigate('${view}'`)
  );
  const viewPanel = document.getElementById(`view-${view}`);
  if (navItem) navItem.style.display = visible ? "" : "none";
  if (viewPanel) viewPanel.style.display = visible ? "" : "none";
}

function applyRoleBasedUi() {
  const role = me?.role ?? "EMPLOYEE";
  const roleViews = {
    SUPER_ADMIN: ["dashboard", "employees", "leave", "payroll", "ess", "profile", "performance", "recruitment", "documents", "compliance", "reports", "settings"],
    HR: ["dashboard", "employees", "leave", "payroll", "ess", "profile", "performance", "recruitment", "documents", "compliance", "reports", "settings"],
    HR_OFFICER: ["dashboard", "employees", "leave", "payroll", "ess", "profile", "performance", "recruitment", "documents", "compliance", "reports", "settings"],
    MANAGER: ["dashboard", "employees", "leave", "ess", "profile"],
    EMPLOYEE: ["leave", "ess", "profile"],
  };
  const allViews = ["dashboard", "employees", "leave", "payroll", "ess", "profile", "performance", "recruitment", "documents", "compliance", "reports", "settings"];
  const allowed = new Set(roleViews[role] ?? roleViews.EMPLOYEE);
  allViews.forEach((view) => setViewVisibility(view, allowed.has(view)));

  const activeView = document.querySelector(".view.active")?.id?.replace("view-", "");
  if (!activeView || !allowed.has(activeView)) {
    const fallbackView = roleViews[role]?.[0] ?? "leave";
    const navItem = document.querySelector(`.nav-item[onclick*="navigate('${fallbackView}'"]`);
    if (typeof window.navigate === "function") {
      window.navigate(fallbackView, navItem);
    }
  }

  const pendingApprovalsTab = document.querySelector("button[onclick*=\"leave-pending\"]");
  if (pendingApprovalsTab) {
    pendingApprovalsTab.style.display = role === "EMPLOYEE" ? "none" : "";
  }

  document.querySelectorAll(".sidebar-nav .nav-section").forEach((section) => {
    const visibleItems = Array.from(section.querySelectorAll(".nav-item"))
      .some((item) => item.style.display !== "none");
    section.style.display = visibleItems ? "" : "none";
  });
}

window.toggleNotifPanel = function toggleNotifPanelLive() {
  const panel = document.getElementById("notif-panel");
  if (!panel) return;
  const isOpening = !panel.classList.contains("open");
  panel.classList.toggle("open");
  if (isOpening) {
    notificationsUnread = false;
  }
  renderNotifications();
};

function escapeAttr(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("\"", "&quot;")
    .replaceAll("'", "&#39;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

async function api(path, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers ?? {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
    cache: "no-store",
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    if (Array.isArray(payload.issues) && payload.issues.length) {
      const firstIssue = payload.issues[0];
      const fieldPath = Array.isArray(firstIssue.path) ? firstIssue.path.join(".") : "";
      const issueText = firstIssue.message || "Invalid input";
      throw new Error(fieldPath ? `${fieldPath}: ${issueText}` : issueText);
    }
    throw new Error(payload.message || `API failed: ${response.status}`);
  }

  if (response.status === 204) {
    return null;
  }
  if (response.status === 304) {
    return null;
  }

  return response.json();
}

function showLoginModal() {
  return new Promise((resolve) => {
    const existing = document.getElementById("hrms-login-modal");
    if (existing) existing.remove();

    const wrapper = document.createElement("div");
    wrapper.id = "hrms-login-modal";
    wrapper.className = "modal-overlay open";
    wrapper.innerHTML = `
      <div class="modal" style="max-width:460px">
        <div class="modal-header" style="justify-content:center;gap:12px;margin-bottom:18px;">
          <img
            src="/Mask%20group.avif"
            alt="HRMS logo"
            style="width:72px;height:72px;object-fit:contain;"
          >
        </div>
        <div class="form-grid">
          <div class="form-group full">
            <label>Email</label>
            <input id="login-email" type="email" value="" placeholder="name@company.com" autocomplete="username">
          </div>
          <div class="form-group full">
            <label>Password</label>
            <input id="login-password" type="password" value="" placeholder="Enter your password" autocomplete="current-password">
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-primary" id="login-submit-btn">Sign In</button>
        </div>
      </div>
    `;

    document.body.appendChild(wrapper);
    const submitBtn = wrapper.querySelector("#login-submit-btn");
    const emailInput = wrapper.querySelector("#login-email");
    const passwordInput = wrapper.querySelector("#login-password");

    const submit = () => {
      const email = emailInput.value.trim();
      const password = passwordInput.value;
      resolve({ email, password, close: () => wrapper.remove() });
    };

    submitBtn.addEventListener("click", submit);
    passwordInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter") submit();
    });
  });
}

async function login(email, password) {
  const loginResponse = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!loginResponse.ok) {
    throw new Error("Invalid credentials");
  }

  const loginData = await loginResponse.json();
  token = loginData.token;
  localStorage.setItem("hrms_token", token);
}

async function bootstrapAuth() {
  if (!token) {
    while (!token) {
      const loginState = await showLoginModal();
      try {
        await login(loginState.email, loginState.password);
        loginState.close();
      } catch (error) {
        notify(error.message);
      }
    }
  }

  try {
    me = await api("/auth/me");
  } catch (_error) {
    localStorage.removeItem("hrms_token");
    token = null;
    return bootstrapAuth();
  }

  const userName = document.querySelector(".user-name");
  const userRole = document.querySelector(".user-role");
  const avatar = document.querySelector(".user-avatar");
  if (me?.employee && userName && userRole && avatar) {
    const fullName = `${me.employee.firstName} ${me.employee.lastName}`;
    userName.textContent = fullName;
    userRole.textContent = formatLabel(me.role);
    avatar.textContent = `${me.employee.firstName[0] ?? ""}${me.employee.lastName[0] ?? ""}`.toUpperCase();
  }
  notificationsUnread = true;
  renderNotifications();
}

function statusBadge(status) {
  const map = {
    ACTIVE: "badge-green",
    PROBATION: "badge-purple",
    ON_LEAVE: "badge-amber",
    RESIGNED: "badge-coral",
    TERMINATED: "badge-coral",
  };
  return map[status] ?? "badge-blue";
}

function toDateInputValue(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

function setSelectByText(select, value) {
  if (!select || !value) return;
  const target = String(value).trim().toLowerCase();
  const match = Array.from(select.options).find((option) => option.textContent.trim().toLowerCase() === target);
  if (match) {
    select.value = match.value;
  }
}

function populateManagerOptions(selectedManagerId = "", currentEmployeeId = "") {
  const managerHiddenInput = document.getElementById("emp-line-manager");
  const managerTrigger = document.getElementById("emp-line-manager-trigger");
  const managerOptions = document.getElementById("emp-line-manager-options");
  const normalizedSearch = managerSearchTerm.trim().toLowerCase();
  if (!managerHiddenInput || !managerTrigger || !managerOptions) return;

  const byDepartment = new Map();
  let selectedLabel = "Select line manager";
  allEmployees
    .filter((employee) => employee.role === "MANAGER")
    .filter((employee) => employee.id !== currentEmployeeId)
    .filter((employee) => {
      if (!normalizedSearch) return true;
      const text = `${employee.firstName} ${employee.lastName} ${employee.employeeCode}`.toLowerCase();
      return text.includes(normalizedSearch);
    })
    .forEach((employee) => {
      if (!byDepartment.has(employee.department)) {
        byDepartment.set(employee.department, []);
      }
      byDepartment.get(employee.department).push(employee);
    });

  managerOptions.innerHTML = "";
  managerHiddenInput.value = selectedManagerId || "";

  if (!byDepartment.size) {
    managerOptions.innerHTML = `<div class="manager-empty">No manager found</div>`;
    managerTrigger.textContent = selectedManagerId ? "Selected manager unavailable" : "Select line manager";
    return;
  }

  Array.from(byDepartment.keys())
    .sort()
    .forEach((department) => {
      const groupLabel = document.createElement("div");
      groupLabel.className = "manager-group-label";
      groupLabel.textContent = department;
      managerOptions.appendChild(groupLabel);

      byDepartment.get(department)
        .sort((a, b) => `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`))
        .forEach((employee) => {
          const label = `${employee.firstName} ${employee.lastName} (${employee.employeeCode})`;
          if (employee.id === selectedManagerId) selectedLabel = label;

          const option = document.createElement("button");
          option.type = "button";
          option.className = "manager-option";
          option.textContent = label;
          option.addEventListener("click", () => {
            managerHiddenInput.value = employee.id;
            managerTrigger.textContent = label;
            document.getElementById("emp-line-manager-menu")?.classList.remove("open");
            managerSearchTerm = "";
            const searchInput = document.getElementById("emp-line-manager-search");
            if (searchInput) searchInput.value = "";
          });
          managerOptions.appendChild(option);
        });
    });

  managerTrigger.textContent = selectedLabel;
}

function resetEmployeeModalForm() {
  const modal = document.getElementById("emp-modal");
  if (!modal) return;
  const title = modal.querySelector(".modal-title");
  const saveBtn = modal.querySelector(".modal-footer .btn.btn-primary");

  [
    "emp-full-name", "emp-code", "emp-dob", "emp-mobile", "emp-email", "emp-designation",
    "emp-join-date", "emp-basic-salary", "emp-emirates-id", "emp-passport", "emp-iban",
    "emp-bank-name", "emp-labour-card", "emp-line-manager-search", "emp-login-email", "emp-login-password",
  ].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.value = "";
  });

  [
    "emp-gender", "emp-nationality", "emp-marital-status", "emp-department", "emp-employment-type",
    "emp-pay-frequency", "emp-probation", "emp-notice", "emp-wps", "emp-access-enabled", "emp-user-role",
  ].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.selectedIndex = 0;
  });

  managerSearchTerm = "";
  populateManagerOptions("", "");
  document.getElementById("emp-line-manager-menu")?.classList.remove("open");

  if (title) title.textContent = "Add New Employee";
  if (saveBtn) saveBtn.textContent = "Create Employee";
  const accessEnabledSelect = document.getElementById("emp-access-enabled");
  accessEnabledSelect?.dispatchEvent(new Event("change"));
  editingEmployeeId = null;
}

function readEmployeePayloadFromModal() {
  const fullName = document.getElementById("emp-full-name").value.trim();
  const [firstName, ...rest] = fullName.split(/\s+/);
  const lastName = rest.join(" ") || "Employee";
  const basicSalary = Number(document.getElementById("emp-basic-salary").value || 0);
  const accessEnabled = document.getElementById("emp-access-enabled").value === "true";
  const loginEmail = document.getElementById("emp-login-email").value.trim();
  const loginPassword = document.getElementById("emp-login-password").value;

  return {
    firstName,
    lastName,
    email: document.getElementById("emp-email").value.trim(),
    phone: document.getElementById("emp-mobile").value.trim() || undefined,
    dateOfBirth: document.getElementById("emp-dob").value ? new Date(document.getElementById("emp-dob").value).toISOString() : undefined,
    dateOfJoining: document.getElementById("emp-join-date").value ? new Date(document.getElementById("emp-join-date").value).toISOString() : new Date().toISOString(),
    designation: document.getElementById("emp-designation").value.trim() || "Staff",
    department: document.getElementById("emp-department").value,
    nationality: document.getElementById("emp-nationality").value,
    emiratesId: document.getElementById("emp-emirates-id").value.trim() || undefined,
    passportNumber: document.getElementById("emp-passport").value.trim() || undefined,
    managerId: document.getElementById("emp-line-manager").value || undefined,
    employmentType: document.getElementById("emp-employment-type").value,
    iban: document.getElementById("emp-iban").value.trim() || undefined,
    bankName: document.getElementById("emp-bank-name").value.trim() || undefined,
    wpsEnabled: document.getElementById("emp-wps").value === "true",
    labourCardNumber: document.getElementById("emp-labour-card").value.trim() || undefined,
    basicSalary,
    housingAllowance: Math.round(basicSalary * 0.3),
    transportAllowance: Math.round(basicSalary * 0.1),
    accessEnabled,
    userRole: accessEnabled ? document.getElementById("emp-user-role").value : undefined,
    loginEmail: accessEnabled ? (loginEmail || undefined) : undefined,
    loginPassword: accessEnabled ? (loginPassword || undefined) : undefined,
  };
}

function renderEmployeesTable() {
  const tableBody = document.querySelector("#emp-table tbody");
  if (!tableBody) return;
  const canManageEmployees = elevatedRoles.has(me?.role);

  tableBody.innerHTML = employees
    .map((employee) => {
      const initials = `${employee.firstName[0] ?? ""}${employee.lastName[0] ?? ""}`.toUpperCase();
      const name = `${employee.firstName} ${employee.lastName}`;
      return `
        <tr>
          <td>
            <div class="flex-center gap-8">
              <div class="user-avatar" style="width:30px;height:30px;font-size:11px">${initials}</div>
              <div>
                <div style="font-weight:500">${name}</div>
                <div class="text-muted">${employee.email}</div>
              </div>
            </div>
          </td>
          <td>${employee.employeeCode}</td>
          <td>${employee.department}</td>
          <td>${employee.designation}</td>
          <td><span class="badge badge-blue">${employee.employmentType ?? "Full-Time"}</span></td>
          <td>${new Date(employee.dateOfJoining).toLocaleDateString("en-GB", { month: "short", year: "numeric" })}</td>
          <td>${employee.emiratesId ?? "—"}</td>
          <td><span class="badge ${statusBadge(employee.status)}">${formatLabel(employee.status)}</span></td>
          <td>
            <div class="flex gap-8" style="flex-wrap:wrap;">
              <button class="btn btn-secondary btn-sm" onclick="window.__viewEmployeeById('${employee.id}')">View</button>
              ${canManageEmployees ? `
              <button class="btn btn-secondary btn-sm" onclick="window.__editEmployee('${employee.id}')">Edit</button>
              <button class="btn btn-secondary btn-sm" onclick="window.__alterBankDetails('${employee.id}')">Bank</button>
              <button class="btn btn-secondary btn-sm" onclick="window.__alterSalaryDetails('${employee.id}')">Salary</button>
              <button class="btn btn-accent btn-sm" onclick="window.__changeEmployeeStatus('${employee.id}')">Status</button>
              <button class="btn btn-danger btn-sm" onclick="window.__deleteEmployee('${employee.id}','${escapeAttr(name)}')">Delete</button>
              ` : ""}
            </div>
          </td>
        </tr>
      `;
    })
    .join("");
}

function wireEmployeeCreation() {
  const modal = document.getElementById("emp-modal");
  const cancelBtn = modal?.querySelector(".modal-footer .btn.btn-secondary");
  const closeBtn = modal?.querySelector(".modal-close");
  const managerSearchInput = document.getElementById("emp-line-manager-search");
  const accessEnabledSelect = document.getElementById("emp-access-enabled");
  const userRoleSelect = document.getElementById("emp-user-role");
  const loginEmailInput = document.getElementById("emp-login-email");
  const loginPasswordInput = document.getElementById("emp-login-password");

  const syncAccessInputsState = () => {
    const enabled = accessEnabledSelect?.value === "true";
    [userRoleSelect, loginEmailInput, loginPasswordInput].forEach((el) => {
      if (!el) return;
      el.disabled = !enabled;
      el.style.opacity = enabled ? "1" : "0.6";
    });
  };

  accessEnabledSelect?.addEventListener("change", syncAccessInputsState);
  userRoleSelect?.addEventListener("change", () => {
    if (accessEnabledSelect && accessEnabledSelect.value !== "true") {
      accessEnabledSelect.value = "true";
      syncAccessInputsState();
    }
  });
  loginEmailInput?.addEventListener("input", () => {
    if (accessEnabledSelect && loginEmailInput.value.trim() && accessEnabledSelect.value !== "true") {
      accessEnabledSelect.value = "true";
      syncAccessInputsState();
    }
  });
  loginPasswordInput?.addEventListener("input", () => {
    if (accessEnabledSelect && loginPasswordInput.value && accessEnabledSelect.value !== "true") {
      accessEnabledSelect.value = "true";
      syncAccessInputsState();
    }
  });
  syncAccessInputsState();

  cancelBtn?.addEventListener("click", resetEmployeeModalForm);
  closeBtn?.addEventListener("click", resetEmployeeModalForm);
  modal?.addEventListener("click", (event) => {
    if (event.target === modal) resetEmployeeModalForm();
  });
  managerSearchInput?.addEventListener("input", () => {
    managerSearchTerm = managerSearchInput.value.trim();
    const selectedManagerId = document.getElementById("emp-line-manager")?.value ?? "";
    populateManagerOptions(selectedManagerId, editingEmployeeId || "");
  });
  const managerTrigger = document.getElementById("emp-line-manager-trigger");
  const managerMenu = document.getElementById("emp-line-manager-menu");
  managerTrigger?.addEventListener("click", () => {
    managerMenu?.classList.toggle("open");
    if (managerMenu?.classList.contains("open")) {
      managerSearchInput?.focus();
    }
  });
  document.addEventListener("click", (event) => {
    const dropdown = document.getElementById("emp-manager-dropdown");
    if (dropdown && !dropdown.contains(event.target)) {
      managerMenu?.classList.remove("open");
    }
  });

  window.saveEmployee = async function saveEmployeeLive() {
    try {
      const payload = readEmployeePayloadFromModal();

      if (!payload.firstName || !payload.email) {
        notify("Please fill Full Name and Email");
        return;
      }
      if (payload.accessEnabled && !payload.userRole) {
        notify("Please select a role when login access is enabled");
        return;
      }

      const isEditMode = Boolean(editingEmployeeId);
      let savedEmployee;
      if (editingEmployeeId) {
        savedEmployee = await api(`/employees/${editingEmployeeId}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
      } else {
        savedEmployee = await api("/employees", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }

      if (savedEmployee?.id) {
        const existingIndex = allEmployees.findIndex((item) => item.id === savedEmployee.id);
        if (existingIndex >= 0) {
          allEmployees[existingIndex] = savedEmployee;
        } else {
          allEmployees.unshift(savedEmployee);
        }
      }

      window.closeModal("emp-modal");
      await refreshEmployees();
      resetEmployeeModalForm();
      notify(isEditMode ? "Employee updated successfully" : "Employee created successfully");
    } catch (error) {
      notify(error.message);
    }
  };
}

function wireEmployeeFilters() {
  const toolbar = document.querySelector("#view-employees .toolbar");
  if (!toolbar) return;

  const searchInput = toolbar.querySelector(".search-bar input");
  const departmentSelect = document.getElementById("emp-filter-department");
  const statusSelect = document.getElementById("emp-filter-status");
  const exportButton = document.getElementById("emp-export-btn");

  if (searchInput) {
    searchInput.addEventListener("input", async (event) => {
      employeeFilters.search = event.target.value.trim();
      await loadEmployees();
    });
  }

  if (departmentSelect) {
    departmentSelect.onchange = async (event) => {
      employeeFilters.department = event.target.value;
      await loadEmployees();
      notify("Department filter applied");
    };
  }

  if (statusSelect) {
    statusSelect.onchange = async (event) => {
      employeeFilters.status = event.target.value;
      await loadEmployees();
      notify("Status filter applied");
    };
  }

  if (exportButton) {
    exportButton.onclick = () => {
      const rows = employees.map((employee) => ({
        employeeCode: employee.employeeCode,
        firstName: employee.firstName,
        lastName: employee.lastName,
        email: employee.email,
        department: employee.department,
        designation: employee.designation,
        employmentType: employee.employmentType ?? "",
        status: employee.status,
      }));

      if (!rows.length) {
        notify("No employee rows to export");
        return;
      }

      const columns = Object.keys(rows[0]);
      const csv = [
        columns.join(","),
        ...rows.map((row) => columns.map((key) => {
          const value = String(row[key] ?? "");
          const escaped = value.replaceAll("\"", "\"\"");
          return `"${escaped}"`;
        }).join(",")),
      ].join("\\n");

      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `employees-export-${new Date().toISOString().slice(0, 10)}.csv`;
      link.click();
      URL.revokeObjectURL(url);
      notify("Employee export downloaded");
    };
  }
}

async function loadEmployees() {
  const normalizedStatus = employeeFilters.status === "All Status"
    ? ""
    : employeeFilters.status.toUpperCase().replace(/\s+/g, "_");
  const normalizedSearch = employeeFilters.search.toLowerCase();

  employees = allEmployees.filter((employee) => {
    const matchesDepartment = employeeFilters.department === "All Departments"
      || employee.department === employeeFilters.department;
    const matchesStatus = !normalizedStatus || employee.status === normalizedStatus;

    const searchable = [
      employee.firstName,
      employee.lastName,
      employee.employeeCode,
      employee.department,
      employee.designation,
      employee.email,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    const matchesSearch = !normalizedSearch || searchable.includes(normalizedSearch);
    return matchesDepartment && matchesStatus && matchesSearch;
  });

  renderEmployeesTable();
}

async function refreshEmployees() {
  const latest = await api("/employees");
  if (Array.isArray(latest)) {
    allEmployees = latest;
  }
  loadEmployees();
  populateEmployeeSelectors();
}

function getEmployeeById(employeeId) {
  return allEmployees.find((employee) => employee.id === employeeId);
}

function closeActionModal() {
  document.getElementById("emp-action-modal")?.remove();
}

function openActionModal({ title, bodyHtml, saveLabel = "Save", hideSave = false, onSave }) {
  closeActionModal();
  const wrapper = document.createElement("div");
  wrapper.id = "emp-action-modal";
  wrapper.className = "modal-overlay open";
  wrapper.innerHTML = `
    <div class="modal" style="max-width:560px">
      <div class="modal-header">
        <div class="modal-title">${title}</div>
        <button class="modal-close" id="emp-modal-close">✕</button>
      </div>
      <div>${bodyHtml}</div>
      <div class="modal-footer">
        <button class="btn btn-secondary" id="emp-modal-cancel">Close</button>
        ${hideSave ? "" : `<button class="btn btn-primary" id="emp-modal-save">${saveLabel}</button>`}
      </div>
    </div>
  `;

  document.body.appendChild(wrapper);

  const close = () => closeActionModal();
  wrapper.querySelector("#emp-modal-close")?.addEventListener("click", close);
  wrapper.querySelector("#emp-modal-cancel")?.addEventListener("click", close);
  wrapper.addEventListener("click", (event) => {
    if (event.target === wrapper) close();
  });

  if (!hideSave && onSave) {
    wrapper.querySelector("#emp-modal-save")?.addEventListener("click", onSave);
  }
}

window.__viewEmployeeById = function viewEmployeeById(employeeId) {
  const employee = getEmployeeById(employeeId);
  if (!employee) {
    notify("Employee not found");
    return;
  }

  openActionModal({
    title: "Employee Details",
    hideSave: true,
    bodyHtml: `
      <div style="display:grid;gap:10px;font-size:13.5px">
        <div><b>Name:</b> ${employee.firstName} ${employee.lastName}</div>
        <div><b>Employee Code:</b> ${employee.employeeCode}</div>
        <div><b>Department:</b> ${employee.department}</div>
        <div><b>Designation:</b> ${employee.designation}</div>
        <div><b>Employment Type:</b> ${employee.employmentType ?? "Full-Time"}</div>
        <div><b>Status:</b> ${formatLabel(employee.status)}</div>
        <div><b>Email:</b> ${employee.email}</div>
        <div><b>Line Manager:</b> ${employee.manager ? `${employee.manager.firstName} ${employee.manager.lastName} (${employee.manager.employeeCode})` : "Not assigned"}</div>
        <div><b>IBAN:</b> ${employee.iban ?? "Not set"}</div>
        <div><b>Bank Name:</b> ${employee.bankName ?? "Not set"}</div>
        <div><b>WPS Enabled:</b> ${employee.wpsEnabled ? "Yes" : "No"}</div>
        <div><b>Labour Card:</b> ${employee.labourCardNumber ?? "Not set"}</div>
      </div>
    `,
  });
};

window.__editEmployee = function editEmployee(employeeId) {
  const employee = getEmployeeById(employeeId);
  if (!employee) {
    notify("Employee not found");
    return;
  }

  const modal = document.getElementById("emp-modal");
  const title = modal.querySelector(".modal-title");
  const saveBtn = modal.querySelector(".modal-footer .btn.btn-primary");

  editingEmployeeId = employeeId;
  managerSearchTerm = "";

  document.getElementById("emp-full-name").value = `${employee.firstName} ${employee.lastName}`.trim();
  document.getElementById("emp-code").value = employee.employeeCode ?? "";
  document.getElementById("emp-dob").value = toDateInputValue(employee.dateOfBirth);
  document.getElementById("emp-mobile").value = employee.phone ?? "";
  document.getElementById("emp-email").value = employee.email ?? "";
  document.getElementById("emp-designation").value = employee.designation ?? "";
  document.getElementById("emp-join-date").value = toDateInputValue(employee.dateOfJoining);
  document.getElementById("emp-basic-salary").value = String(Math.round(employee.basicSalary ?? 0));
  document.getElementById("emp-emirates-id").value = employee.emiratesId ?? "";
  document.getElementById("emp-passport").value = employee.passportNumber ?? "";
  document.getElementById("emp-iban").value = employee.iban ?? "";
  document.getElementById("emp-bank-name").value = employee.bankName ?? "";
  document.getElementById("emp-wps").value = employee.wpsEnabled ? "true" : "false";
  document.getElementById("emp-labour-card").value = employee.labourCardNumber ?? "";
  document.getElementById("emp-access-enabled").value = employee.accessEnabled ? "true" : "false";
  document.getElementById("emp-user-role").value = employee.role ?? "EMPLOYEE";
  document.getElementById("emp-login-email").value = employee.loginEmail ?? employee.email ?? "";
  document.getElementById("emp-login-password").value = "";
  document.getElementById("emp-access-enabled")?.dispatchEvent(new Event("change"));
  document.getElementById("emp-line-manager-search").value = "";

  setSelectByText(document.getElementById("emp-nationality"), employee.nationality);
  setSelectByText(document.getElementById("emp-department"), employee.department);
  setSelectByText(document.getElementById("emp-employment-type"), employee.employmentType ?? "Full-Time");
  populateManagerOptions(employee.managerId ?? "", employee.id);

  if (title) title.textContent = "Edit Employee";
  if (saveBtn) saveBtn.textContent = "Update Employee";

  window.openModal("emp-modal");
};

window.__alterBankDetails = function alterBankDetails(employeeId) {
  const employee = getEmployeeById(employeeId);
  if (!employee) {
    notify("Employee not found");
    return;
  }

  openActionModal({
    title: "Alter Bank Details",
    saveLabel: "Save Bank Details",
    bodyHtml: `
      <div class="form-grid">
        <div class="form-group full">
          <label>IBAN</label>
          <input id="bank-iban" type="text" value="${escapeAttr(employee.iban ?? "")}" placeholder="AE07 0331 2345 6789 0123 456">
        </div>
        <div class="form-group full">
          <label>Bank Name</label>
          <input id="bank-name" type="text" value="${escapeAttr(employee.bankName ?? "")}" placeholder="Emirates NBD">
        </div>
        <div class="form-group">
          <label>WPS Enabled</label>
          <select id="bank-wps">
            <option value="true" ${employee.wpsEnabled ? "selected" : ""}>Yes</option>
            <option value="false" ${!employee.wpsEnabled ? "selected" : ""}>No</option>
          </select>
        </div>
        <div class="form-group">
          <label>Labour Card Number</label>
          <input id="bank-labour-card" type="text" value="${escapeAttr(employee.labourCardNumber ?? "")}" placeholder="LC-20210456">
        </div>
      </div>
    `,
    onSave: async () => {
      try {
        await api(`/employees/${employeeId}/bank`, {
          method: "PATCH",
          body: JSON.stringify({
            iban: document.getElementById("bank-iban").value.trim(),
            bankName: document.getElementById("bank-name").value.trim(),
            wpsEnabled: document.getElementById("bank-wps").value === "true",
            labourCardNumber: document.getElementById("bank-labour-card").value.trim() || undefined,
          }),
        });
        closeActionModal();
        await refreshEmployees();
        notify("Bank details updated");
      } catch (error) {
        notify(error.message);
      }
    },
  });
};

window.__alterSalaryDetails = function alterSalaryDetails(employeeId) {
  const employee = getEmployeeById(employeeId);
  if (!employee) {
    notify("Employee not found");
    return;
  }

  openActionModal({
    title: "Alter Salary Details",
    saveLabel: "Save Salary",
    bodyHtml: `
      <div class="form-grid">
        <div class="form-group">
          <label>Basic Salary (AED)</label>
          <input id="salary-basic" type="number" value="${Math.round(employee.basicSalary ?? 0)}">
        </div>
        <div class="form-group">
          <label>Housing Allowance (AED)</label>
          <input id="salary-housing" type="number" value="${Math.round(employee.housingAllowance ?? 0)}">
        </div>
        <div class="form-group full">
          <label>Transport Allowance (AED)</label>
          <input id="salary-transport" type="number" value="${Math.round(employee.transportAllowance ?? 0)}">
        </div>
      </div>
    `,
    onSave: async () => {
      try {
        await api(`/employees/${employeeId}/compensation`, {
          method: "PATCH",
          body: JSON.stringify({
            basicSalary: Number(document.getElementById("salary-basic").value || 0),
            housingAllowance: Number(document.getElementById("salary-housing").value || 0),
            transportAllowance: Number(document.getElementById("salary-transport").value || 0),
          }),
        });
        closeActionModal();
        await refreshEmployees();
        notify("Salary details updated");
      } catch (error) {
        notify(error.message);
      }
    },
  });
};

window.__changeEmployeeStatus = function changeEmployeeStatus(employeeId) {
  const employee = getEmployeeById(employeeId);
  if (!employee) {
    notify("Employee not found");
    return;
  }

  openActionModal({
    title: "Update Employee Status",
    saveLabel: "Update Status",
    bodyHtml: `
      <div class="form-group">
        <label>Status</label>
        <select id="emp-edit-status">
          <option value="ACTIVE" ${employee.status === "ACTIVE" ? "selected" : ""}>ACTIVE</option>
          <option value="PROBATION" ${employee.status === "PROBATION" ? "selected" : ""}>PROBATION</option>
          <option value="ON_LEAVE" ${employee.status === "ON_LEAVE" ? "selected" : ""}>ON_LEAVE</option>
          <option value="RESIGNED" ${employee.status === "RESIGNED" ? "selected" : ""}>RESIGNED</option>
          <option value="TERMINATED" ${employee.status === "TERMINATED" ? "selected" : ""}>TERMINATED</option>
        </select>
      </div>
    `,
    onSave: async () => {
      try {
        const nextStatus = document.getElementById("emp-edit-status")?.value;
        await api(`/employees/${employeeId}/status`, {
          method: "PATCH",
          body: JSON.stringify({ status: nextStatus }),
        });
        closeActionModal();
        await refreshEmployees();
        notify("Employee status updated");
      } catch (error) {
        notify(error.message);
      }
    },
  });
};

window.__deleteEmployee = function deleteEmployee(employeeId, name) {
  openActionModal({
    title: "Confirm Delete",
    saveLabel: "Delete",
    bodyHtml: `<p style="font-size:13.5px">Delete <b>${name}</b>? This cannot be undone.</p>`,
    onSave: async () => {
      try {
        await api(`/employees/${employeeId}`, { method: "DELETE" });
        closeActionModal();
        await refreshEmployees();
        notify("Employee deleted");
      } catch (error) {
        notify(error.message);
      }
    },
  });
};

window.filterTable = function filterTableLive(input, tableId) {
  if (tableId !== "emp-table") return;
  employeeFilters.search = input.value.trim();
  loadEmployees();
};

function formatLeaveStatus(status) {
  if (status === "PENDING_L1") return "Pending L1";
  if (status === "PENDING_L2") return "Pending L2";
  if (status === "APPROVED") return "Approved";
  if (status === "REJECTED") return "Rejected";
  return status;
}

function leaveStatusBadge(status) {
  if (status === "APPROVED") return "badge-green";
  if (status === "PENDING_L1" || status === "PENDING_L2") return "badge-amber";
  if (status === "REJECTED") return "badge-coral";
  return "badge-blue";
}

async function approveLeaveRequest(id, stage, name) {
  try {
    await api(`/leave/requests/${id}/${stage}-approve`, { method: "POST" });
    notify(`Leave approved for ${name}`);
    await loadLeaveRequests();
  } catch (error) {
    notify(error.message);
  }
}

function renderLeavePending(requests) {
  const tbody = document.querySelector("#leave-pending table tbody");
  const table = document.querySelector("#leave-pending table");
  if (!tbody || !table) return;

  const headerCells = table.querySelectorAll("thead th");
  if (headerCells.length >= 8) {
    if (me?.role === "MANAGER") {
      headerCells[6].textContent = "L1 (You)";
      headerCells[7].textContent = "L2";
    } else if (l2Roles.has(me?.role)) {
      headerCells[6].textContent = "L1";
      headerCells[7].textContent = "L2 (You)";
    } else {
      headerCells[6].textContent = "L1";
      headerCells[7].textContent = "L2";
    }
  }

  tbody.innerHTML = requests
    .map((request) => {
      const name = `${request.employee?.firstName ?? ""} ${request.employee?.lastName ?? ""}`.trim();
      const leaveType = request.leaveType?.name ?? "Leave";
      const start = new Date(request.startDate).toLocaleDateString("en-GB", { month: "short", day: "numeric" });
      const end = new Date(request.endDate).toLocaleDateString("en-GB", { month: "short", day: "numeric" });
      const l1Status = request.l1ApprovedBy
        ? `<span class="badge badge-green">✓ Approved</span>`
        : request.status === "PENDING_L1"
          ? hasRole(Array.from(l1Roles))
            ? `<button class="btn btn-accent btn-sm" onclick="window.__approveLeave('${request.id}','l1','${name}')">Approve L1</button>`
            : `<span class="badge badge-amber">Pending</span>`
          : `<span class="text-muted">—</span>`;

      const l2Status = request.status === "PENDING_L2" && hasRole(Array.from(l2Roles))
        ? `<button class="btn btn-accent btn-sm" onclick="window.__approveLeave('${request.id}','l2','${name}')">Approve L2</button>`
        : request.status === "PENDING_L1"
          ? `<span class="text-muted">Awaiting L1</span>`
          : request.status === "APPROVED"
            ? `<span class="badge badge-green">Approved</span>`
            : request.status === "REJECTED"
              ? `<span class="badge badge-coral">Rejected</span>`
              : `<span class="badge badge-amber">Pending</span>`;

      return `
        <tr>
          <td><b>${name || request.employeeId}</b></td>
          <td><span class="badge badge-blue">${leaveType}</span></td>
          <td>${start}</td>
          <td>${end}</td>
          <td>${request.days}</td>
          <td>${request.reason}</td>
          <td><div class="flex gap-8">${l1Status}</div></td>
          <td><div class="flex gap-8">${l2Status}</div></td>
        </tr>
      `;
    })
    .join("");
}

function renderMyLeaveHistory(requests) {
  const tbody = document.querySelector("#leave-my-table tbody");
  if (!tbody) return;

  const myId = me?.employee?.id;
  const myRequests = requests
    .filter((request) => !myId || request.employeeId === myId)
    .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());

  if (!myRequests.length) {
    tbody.innerHTML = `<tr><td colspan="8" class="text-muted">No leave requests found.</td></tr>`;
    return;
  }

  tbody.innerHTML = myRequests
    .map((request) => {
      const leaveType = request.leaveType?.name ?? "Leave";
      const start = new Date(request.startDate).toLocaleDateString("en-GB", { month: "short", day: "numeric", year: "numeric" });
      const end = new Date(request.endDate).toLocaleDateString("en-GB", { month: "short", day: "numeric", year: "numeric" });
      const l1 = request.l1ApprovedBy
        ? `${request.l1ApprovedBy.firstName} ${request.l1ApprovedBy.lastName}`
        : "—";
      const l2 = request.l2ApprovedBy
        ? `${request.l2ApprovedBy.firstName} ${request.l2ApprovedBy.lastName}`
        : "—";

      return `
        <tr>
          <td><span class="badge badge-blue">${leaveType}</span></td>
          <td>${start}</td>
          <td>${end}</td>
          <td>${request.days}</td>
          <td><span class="badge ${leaveStatusBadge(request.status)}">${formatLeaveStatus(request.status)}</span></td>
          <td>${l1}</td>
          <td>${l2}</td>
          <td>${escapeAttr(request.reason ?? "—")}</td>
        </tr>
      `;
    })
    .join("");
}

async function loadLeaveRequests() {
  const requests = await api("/leave/requests");
  leaveRequestsCache = Array.isArray(requests) ? requests : [];
  const myEmployeeId = me?.employee?.id;
  const isAdminPower = l2Roles.has(me?.role);
  const isManager = me?.role === "MANAGER";
  if (myEmployeeId) {
    leaveRequestsCache.forEach((request) => {
      const previous = leaveStatusSnapshot.get(request.id);
      const changed = previous && previous !== request.status;
      if (changed) {
        const requesterName = `${request.employee?.firstName ?? ""} ${request.employee?.lastName ?? ""}`.trim() || "Employee";
        const leaveTypeName = request.leaveType?.name ?? "Leave";
        const currentUserIsRequester = request.employeeId === myEmployeeId;
        const currentUserIsL1Approver = request.l1ApprovedById === myEmployeeId;
        const currentUserIsL2Approver = request.l2ApprovedById === myEmployeeId;

        // L1 approved: notify requester + admin-powered roles (not L1 approver)
        if (request.status === "PENDING_L2") {
          if (currentUserIsRequester && !currentUserIsL1Approver) {
            pushNotification({
              title: "Manager approved your leave",
              desc: `${leaveTypeName} is now pending L2 approval.`,
              tone: "info",
              icon: "bi-person-check",
            });
          } else if (isAdminPower && !currentUserIsL1Approver) {
            pushNotification({
              title: "Leave moved to L2 approval",
              desc: `${requesterName}'s ${leaveTypeName} is awaiting your L2 decision.`,
              tone: "info",
              icon: "bi-clipboard-check",
            });
          }
        }

        // L2 approved: notify requester + manager/L1 approver (not L2 approver)
        if (request.status === "APPROVED") {
          if (currentUserIsRequester && !currentUserIsL2Approver) {
            pushNotification({
              title: "Leave approved",
              desc: `${leaveTypeName} request is fully approved.`,
              tone: "success",
              icon: "bi-check2-all",
            });
          } else if (isManager && currentUserIsL1Approver && !currentUserIsL2Approver) {
            pushNotification({
              title: "L2 approved leave",
              desc: `${requesterName}'s ${leaveTypeName} is now fully approved.`,
              tone: "success",
              icon: "bi-check2-circle",
            });
          }
        }

        if (request.status === "REJECTED") {
          if (currentUserIsRequester && !currentUserIsL1Approver && !currentUserIsL2Approver) {
            pushNotification({
              title: "Leave rejected",
              desc: `${leaveTypeName} request was rejected.`,
              tone: "error",
              icon: "bi-x-circle",
            });
          } else if (isManager && currentUserIsL1Approver && !currentUserIsL2Approver) {
            pushNotification({
              title: "Leave request rejected",
              desc: `${requesterName}'s ${leaveTypeName} was rejected at L2.`,
              tone: "warn",
              icon: "bi-exclamation-circle",
            });
          }
        }
      }
      leaveStatusSnapshot.set(request.id, request.status);
    });
  }
  renderLeavePending(requests);
  renderMyLeaveHistory(requests);
  const pendingCount = requests.filter((item) => item.status === "PENDING_L1" || item.status === "PENDING_L2").length;
  const pendingTab = document.querySelector("button[onclick*='leave-pending']");
  if (pendingTab) {
    pendingTab.textContent = `Pending Approvals (${pendingCount})`;
  }
  renderNotifications();
}

function populateEmployeeSelectors() {
  const leaveEmployeeSelect = document.querySelector("#leave-apply .form-group select");
  if (!leaveEmployeeSelect) return;

  const current = leaveEmployeeSelect.value;
  const sourceEmployees = elevatedRoles.has(me?.role)
    ? allEmployees
    : allEmployees.filter((employee) => employee.id === me?.employee?.id);

  leaveEmployeeSelect.innerHTML = `<option value="">Select employee…</option>` + sourceEmployees
    .map((employee) => `<option value="${employee.id}">${employee.firstName} ${employee.lastName} (${employee.employeeCode})</option>`)
    .join("");
  leaveEmployeeSelect.value = current;
  if (!leaveEmployeeSelect.value && sourceEmployees.length === 1) {
    leaveEmployeeSelect.value = sourceEmployees[0].id;
  }
}

function populateLeaveTypes() {
  const selects = document.querySelectorAll("#leave-apply .form-group select");
  const leaveTypeSelect = selects[1];
  if (!leaveTypeSelect) return;

  leaveTypeSelect.innerHTML = `<option value="">Select leave type…</option>` + leaveTypes
    .map((type) => `<option value="${type.id}">${type.name} (${type.yearlyAllocation} days/yr)</option>`)
    .join("");
}

function wireLeaveApplyForm() {
  const section = document.getElementById("leave-apply");
  if (!section) return;

  const selects = section.querySelectorAll(".form-group select");
  const dateInputs = section.querySelectorAll("input[type='date']");
  const reason = section.querySelector("textarea");
  const submitBtn = section.querySelector(".btn.btn-primary");

  submitBtn.onclick = async () => {
    try {
      const employeeId = selects[0].value;
      const leaveTypeId = selects[1].value;
      const startDate = dateInputs[0].value;
      const endDate = dateInputs[1].value;
      const reasonText = reason.value.trim();

      if (!employeeId || !leaveTypeId || !startDate || !endDate || !reasonText) {
        notify("Please complete all leave fields");
        return;
      }
      if (!elevatedRoles.has(me?.role) && me?.employee?.id && employeeId !== me.employee.id) {
        notify("You can only apply leave for your own profile");
        return;
      }

      const start = new Date(startDate);
      const end = new Date(endDate);
      const dayMs = 24 * 60 * 60 * 1000;
      const days = Math.max(1, Math.round((end - start) / dayMs) + 1);

      await api("/leave/requests", {
        method: "POST",
        body: JSON.stringify({
          employeeId,
          leaveTypeId,
          startDate: start.toISOString(),
          endDate: end.toISOString(),
          days,
          reason: reasonText,
        }),
      });

      notify("Leave request submitted successfully");
      reason.value = "";
      dateInputs[0].value = "";
      dateInputs[1].value = "";
      await loadLeaveRequests();
    } catch (error) {
      notify(error.message);
    }
  };
}

async function loadDashboard() {
  const data = await api("/dashboard/overview");
  dashboardCache = data ?? null;
  const statValues = document.querySelectorAll("#view-dashboard .stats-grid .stat-value");
  if (statValues.length >= 4) {
    statValues[0].textContent = String(data.headcount ?? 0);
    statValues[1].textContent = String(data.onLeave ?? 0);
    statValues[2].textContent = `${((data.monthlyPayroll ?? 0) / 1000000).toFixed(2)}M`;
  }

  const pendingAlert = document.querySelector("#view-dashboard .alert-success b");
  if (pendingAlert) {
    pendingAlert.textContent = `${data.pendingLeaveApprovals ?? 0} Leave Requests`;
  }
  renderNotifications();
}

async function loadEss() {
  if (!me?.employee?.id) return;

  const [balances, payslips] = await Promise.all([
    api(`/leave/balances/${me.employee.id}`),
    api("/ess/my-payslips"),
  ]);

  const essAlert = document.querySelector("#view-ess .alert b");
  if (essAlert) {
    essAlert.textContent = `${me.employee.firstName} ${me.employee.lastName}`;
  }

  const leaveCards = document.querySelectorAll("#view-ess .stats-grid .stat-value");
  const annual = balances.find((item) => item.leaveType.code === "AL");
  const sick = balances.find((item) => item.leaveType.code === "SL");

  if (leaveCards.length >= 4) {
    leaveCards[0].textContent = String(Math.max(0, Math.round((annual?.openingBalance ?? 0) + (annual?.accrued ?? 0) - (annual?.used ?? 0))));
    leaveCards[1].textContent = String(Math.max(0, Math.round((sick?.openingBalance ?? 0) + (sick?.accrued ?? 0) - (sick?.used ?? 0))));
    const latestPayslip = payslips[0];
    if (latestPayslip) {
      const monthName = new Date(latestPayslip.year, latestPayslip.month - 1, 1).toLocaleDateString("en-GB", { month: "short", year: "numeric" });
      leaveCards[2].textContent = monthName;
    }
  }
}

function formatProfileDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function loadProfile() {
  if (!me?.employee) return;
  const employee = me.employee;
  const textMap = {
    "profile-name": `${employee.firstName ?? ""} ${employee.lastName ?? ""}`.trim() || "—",
    "profile-code": employee.employeeCode ?? "—",
    "profile-role": formatLabel(me.role),
    "profile-department": employee.department ?? "—",
    "profile-designation": employee.designation ?? "—",
    "profile-work-email": employee.email ?? "—",
    "profile-login-email": employee.loginEmail ?? employee.email ?? "—",
    "profile-phone": employee.phone ?? "—",
    "profile-joining": formatProfileDate(employee.dateOfJoining),
    "profile-status": formatLabel(employee.status ?? "ACTIVE"),
    "profile-nationality": employee.nationality ?? "—",
    "profile-dob": formatProfileDate(employee.dateOfBirth),
    "profile-emirates": employee.emiratesId ?? "—",
    "profile-passport": employee.passportNumber ?? "—",
    "profile-labour-card": employee.labourCardNumber ?? "—",
    "profile-basic-salary": String(Math.round(employee.basicSalary ?? 0)),
    "profile-housing": String(Math.round(employee.housingAllowance ?? 0)),
    "profile-transport": String(Math.round(employee.transportAllowance ?? 0)),
    "profile-bank": employee.bankName ?? "—",
    "profile-iban": employee.iban ?? "—",
    "profile-wps": employee.wpsEnabled ? "Yes" : "No",
  };
  Object.entries(textMap).forEach(([id, value]) => {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  });
  const avatar = document.getElementById("profile-avatar");
  if (avatar) {
    avatar.textContent = `${employee.firstName?.[0] ?? ""}${employee.lastName?.[0] ?? ""}`.toUpperCase() || "--";
  }
}

window.__approveLeave = approveLeaveRequest;
window.viewEmployee = function viewEmployeeCompatibility(name) {
  const employee = allEmployees.find((item) => `${item.firstName} ${item.lastName}` === name);
  if (employee) {
    window.__viewEmployeeById(employee.id);
  } else {
    notify(`Opening record: ${name}`);
  }
};

async function start() {
  try {
    await bootstrapAuth();
    applyRoleBasedUi();
    const addButton = document.getElementById("emp-add-btn");
    if (addButton && !elevatedRoles.has(me?.role)) {
      addButton.style.display = "none";
    }
    leaveTypes = await api("/leave/types");
    populateLeaveTypes();
    wireLeaveApplyForm();
    wireEmployeeCreation();
    wireEmployeeFilters();
    await Promise.all([loadDashboard(), refreshEmployees(), loadLeaveRequests(), loadEss()]);
    loadProfile();
    resetEmployeeModalForm();
    notify("Live HRMS data connected");
  } catch (error) {
    notify(error.message);
  }
}

document.addEventListener("DOMContentLoaded", start);
