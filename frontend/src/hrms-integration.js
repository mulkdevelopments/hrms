const API_BASE = "/api";
let token = localStorage.getItem("hrms_token");
let me = null;
let leaveTypes = [];
let employees = [];
let allEmployees = [];
let offices = [];
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
let attendanceCache = null;
let attendanceTrackingTimer = null;
let attendanceMap = null;
let attendanceMapMarkers = [];
let attendanceOfficeCircles = [];
let attendanceOfficePins = [];
let attendancePathLine = null;
let attendanceDistanceLabel = null;
let latestOnlineAttendanceRows = [];
let employeePresenceMap = new Map();
let employeeLiveMap = null;
let employeeLiveMarker = null;
let calendarCurrentMonth = new Date();
let calendarSelectedDate = null;
let calendarMap = null;
let calendarRouteLayer = null;
let calendarEmployeeId = null;
let calendarEmployeeName = null;
let selectedOfficeId = null;
let officeFormEditingId = null;
let officesMap = null;
let officesMapOfficeCircle = null;
let officesMapOfficePin = null;
let officesMapMarkers = [];
let officesMapPickerMarker = null;
let officesPickerEnabled = false;
let notificationsUnread = true;
const liveNotifications = [];
const leaveStatusSnapshot = new Map();
const headerLocationCache = new Map();
let headerLocationLookupSeq = 0;
let faceModelPromise = null;
let activeFaceStream = null;
let faceConfigCache = { enabled: true, enrolled: false, faceEnrolledAt: null };
let faceDetectionTimer = null;
let faceCaptureReject = null;
let faceDetectionFrameId = null;

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

function setHeaderLocationLabel(text) {
  const label = document.getElementById("header-location-name");
  if (label) {
    label.textContent = text;
  }
}

async function reverseGeocodeLocationName(latitude, longitude) {
  const key = `${Number(latitude).toFixed(4)},${Number(longitude).toFixed(4)}`;
  if (headerLocationCache.has(key)) {
    return headerLocationCache.get(key);
  }

  const response = await fetch(
    `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(latitude)}&lon=${encodeURIComponent(longitude)}&zoom=14&addressdetails=1`,
    { headers: { Accept: "application/json" } },
  );
  if (!response.ok) {
    throw new Error("Unable to resolve current location");
  }
  const payload = await response.json();
  const address = payload?.address ?? {};
  const resolvedName = address.city
    || address.town
    || address.village
    || address.suburb
    || address.state
    || payload?.name
    || (typeof payload?.display_name === "string" ? payload.display_name.split(",")[0] : "")
    || `${Number(latitude).toFixed(4)}, ${Number(longitude).toFixed(4)}`;
  headerLocationCache.set(key, resolvedName);
  return resolvedName;
}

function updateHeaderLocationFromPing(ping) {
  if (!ping || !Number.isFinite(Number(ping.latitude)) || !Number.isFinite(Number(ping.longitude))) {
    setHeaderLocationLabel("Location unavailable");
    return;
  }
  const lat = Number(ping.latitude);
  const lng = Number(ping.longitude);
  const cacheKey = `${lat.toFixed(4)},${lng.toFixed(4)}`;
  if (headerLocationCache.has(cacheKey)) {
    setHeaderLocationLabel(headerLocationCache.get(cacheKey));
    return;
  }

  const seq = ++headerLocationLookupSeq;
  setHeaderLocationLabel("Locating...");
  reverseGeocodeLocationName(lat, lng)
    .then((name) => {
      if (seq !== headerLocationLookupSeq) return;
      setHeaderLocationLabel(name);
    })
    .catch(() => {
      if (seq !== headerLocationLookupSeq) return;
      setHeaderLocationLabel(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
    });
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

  const myEmployeeId = me.employee.id;
  const myExitActions = (exitRecordsCache ?? []).filter((record) => {
    switch (record.status) {
      case "PENDING":
        return record.employee?.managerId === myEmployeeId || elevatedRoles.has(me.role);
      case "LM_APPROVED":
      case "INITIATED":
      case "CLEARANCE_IN_PROGRESS":
      case "SETTLEMENT_READY":
        return elevatedRoles.has(me.role);
      case "DOCUMENTED":
        return me.role === "SUPER_ADMIN" || me.role === "CEO";
      default:
        return false;
    }
  });
  if (myExitActions.length) {
    entries.push({
      icon: "bi-box-arrow-right",
      tone: "warn",
      title: `${myExitActions.length} Exit Request(s) Need Action`,
      desc: "Resignation/termination steps are awaiting your review.",
      time: "Live",
    });
  }

  const myOwnExit = (exitRecordsCache ?? []).find(
    (record) => record.employeeId === myEmployeeId
      && !["COMPLETED", "REJECTED", "CANCELLED"].includes(record.status),
  );
  if (myOwnExit) {
    entries.push({
      icon: "bi-box-arrow-right",
      tone: "info",
      title: "Your exit request is in progress",
      desc: `Current stage: ${EXIT_STATUS_LABELS[myOwnExit.status] ?? myOwnExit.status}.`,
      time: "Live",
    });
  }

  const expiringDocs = (proDocsCache ?? []).filter((doc) => doc.computedStatus === "EXPIRING" || doc.computedStatus === "EXPIRED");
  if (expiringDocs.length) {
    entries.push({
      icon: "bi-passport",
      tone: "warn",
      title: `${expiringDocs.length} Document(s) Expiring / Expired`,
      desc: "Visa, Emirates ID or permit documents need renewal attention.",
      time: "Live",
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
    SUPER_ADMIN: ["dashboard", "employees", "leave", "exits", "payadjust", "pro", "payroll", "ess", "attendance", "calendar", "offices", "profile", "performance", "recruitment", "documents", "compliance", "reports", "settings"],
    CEO: ["dashboard", "employees", "leave", "exits", "payadjust", "pro", "payroll", "ess", "attendance", "calendar", "offices", "profile", "performance", "recruitment", "documents", "compliance", "reports", "settings"],
    HR: ["dashboard", "employees", "leave", "exits", "payadjust", "pro", "payroll", "ess", "attendance", "calendar", "offices", "profile", "performance", "recruitment", "documents", "compliance", "reports", "settings"],
    HR_OFFICER: ["dashboard", "employees", "leave", "exits", "payadjust", "pro", "payroll", "ess", "attendance", "calendar", "offices", "profile", "performance", "recruitment", "documents", "compliance", "reports", "settings"],
    PRO: ["dashboard", "employees", "pro", "ess", "attendance", "calendar", "profile", "settings"],
    MANAGER: ["dashboard", "employees", "leave", "exits", "payadjust", "pro", "ess", "attendance", "calendar", "profile"],
    EMPLOYEE: ["leave", "exits", "payadjust", "pro", "ess", "attendance", "calendar", "profile", "settings"],
  };
  const allViews = ["dashboard", "employees", "leave", "exits", "payadjust", "pro", "payroll", "ess", "attendance", "calendar", "offices", "profile", "performance", "recruitment", "documents", "compliance", "reports", "settings"];
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
  const leaveBalanceTabBtn = document.getElementById("leave-balance-tab-btn");
  if (leaveBalanceTabBtn) {
    leaveBalanceTabBtn.style.display = elevatedRoles.has(role) ? "" : "none";
  }
  const terminateTabBtn = document.getElementById("exit-terminate-tab-btn");
  if (terminateTabBtn) {
    terminateTabBtn.style.display = (elevatedRoles.has(role) || role === "MANAGER") ? "" : "none";
  }
  const adjNewTabBtn = document.getElementById("adj-new-tab-btn");
  if (adjNewTabBtn) {
    adjNewTabBtn.style.display = (elevatedRoles.has(role) || role === "MANAGER") ? "" : "none";
  }
  const adjProcessWrap = document.getElementById("adj-process-wrap");
  if (adjProcessWrap) {
    adjProcessWrap.style.display = (role === "SUPER_ADMIN" || role === "HR") ? "flex" : "none";
  }
  const loanFormCard = document.getElementById("adj-loan-form-card");
  if (loanFormCard) {
    loanFormCard.style.display = elevatedRoles.has(role) ? "" : "none";
  }
  const canManagePro = elevatedRoles.has(role) || role === "PRO";
  ["pro-doc-new-tab-btn", "pro-task-new-tab-btn"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.style.display = canManagePro ? "" : "none";
  });
  const liveWorkforceCard = document.getElementById("att-live-workforce-card");
  if (liveWorkforceCard) {
    liveWorkforceCard.style.display = role === "EMPLOYEE" ? "none" : "";
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

function populateOfficeOptions(selectedOfficeId = "") {
  const officeSelect = document.getElementById("emp-office-id");
  if (!officeSelect) return;
  officeSelect.innerHTML = `<option value="">Select office</option>` + offices
    .map((office) => `<option value="${office.id}">${escapeAttr(office.name)} (${office.radiusMeters}m)</option>`)
    .join("");
  if (selectedOfficeId) {
    officeSelect.value = selectedOfficeId;
  }
}

function syncWorkModeOfficeState() {
  const workModeSelect = document.getElementById("emp-work-mode");
  const officeSelect = document.getElementById("emp-office-id");
  if (!workModeSelect || !officeSelect) return;
  const workMode = workModeSelect.value || "OFFICE";
  const officeRequired = workMode === "OFFICE";
  officeSelect.disabled = workMode === "ONSITE";
  officeSelect.style.opacity = officeSelect.disabled ? "0.6" : "1";
  officeSelect.setAttribute("data-required", officeRequired ? "true" : "false");
}

function resetEmployeeModalForm() {
  const modal = document.getElementById("emp-modal");
  if (!modal) return;
  const title = modal.querySelector(".modal-title");
  const saveBtn = modal.querySelector(".modal-footer .btn.btn-primary");

  [
    "emp-full-name", "emp-code", "emp-dob", "emp-mobile", "emp-email", "emp-designation",
    "emp-join-date", "emp-basic-salary", "emp-emirates-id", "emp-passport", "emp-iban",
    "emp-bank-name", "emp-labour-card", "emp-line-manager-search", "emp-login-email", "emp-login-password", "emp-office-id",
  ].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.value = "";
  });

  [
    "emp-gender", "emp-nationality", "emp-marital-status", "emp-department", "emp-employment-type",
    "emp-pay-frequency", "emp-probation", "emp-notice", "emp-wps", "emp-access-enabled", "emp-user-role", "emp-work-mode",
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
  populateOfficeOptions();
  syncWorkModeOfficeState();
  updateEmploymentStatusBadge();
  editingEmployeeId = null;
}

window.__attemptCloseEmployeeModal = function attemptCloseEmployeeModal() {
  const shouldClose = window.confirm("Are you sure you want to close this dialog?");
  if (!shouldClose) return;
  resetEmployeeModalForm();
  window.closeModal("emp-modal");
};

function updateEmploymentStatusBadge() {
  const joinDateInput = document.getElementById("emp-join-date");
  const badge = document.getElementById("emp-auto-status-badge");
  if (!joinDateInput || !badge) return;

  const joinDate = joinDateInput.value ? new Date(joinDateInput.value) : new Date();
  const probationCutoff = new Date();
  probationCutoff.setMonth(probationCutoff.getMonth() - 6);
  const isActive = !Number.isNaN(joinDate.getTime()) && joinDate <= probationCutoff;

  badge.textContent = isActive ? "ACTIVE" : "PROBATION";
  badge.className = `badge ${isActive ? "badge-green" : "badge-purple"}`;
}

function readEmployeePayloadFromModal() {
  const fullName = document.getElementById("emp-full-name").value.trim();
  const firstName = fullName;
  const lastName = "";
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
    workMode: document.getElementById("emp-work-mode").value || "OFFICE",
    officeId: document.getElementById("emp-office-id").value || undefined,
    iban: document.getElementById("emp-iban").value.trim() || undefined,
    bankName: document.getElementById("emp-bank-name").value.trim() || undefined,
    wpsEnabled: document.getElementById("emp-wps").value === "true",
    labourCardNumber: document.getElementById("emp-labour-card").value.trim() || undefined,
    noticePeriodDays: Number.parseInt(document.getElementById("emp-notice")?.value ?? "30", 10) || 30,
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
      const name = `${employee.firstName ?? ""} ${employee.lastName ?? ""}`.trim();
      const initials = name
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0])
        .join("")
        .toUpperCase() || "--";
      const presence = employeePresenceMap.get(employee.id);
      const attendanceBadge = presence?.isOnline
        ? `<span class="badge badge-green">Checked In</span>`
        : `<span class="badge badge-amber">Offline</span>`;
      const actionItems = [
        `<button class="emp-action-item" type="button" onclick="window.__viewEmployeeById('${employee.id}')">View</button>`,
        presence?.isOnline
          ? `<button class="emp-action-item" type="button" onclick="window.__viewEmployeeLiveLocation('${employee.id}')">Live Location</button>`
          : "",
        `<button class="emp-action-item" type="button" onclick="window.__viewEmployeeCalendar('${employee.id}')">Calendar</button>`,
        canManageEmployees
          ? `<button class="emp-action-item" type="button" onclick="window.__editEmployee('${employee.id}')">Edit</button>`
          : "",
        canManageEmployees
          ? `<button class="emp-action-item" type="button" onclick="window.__alterBankDetails('${employee.id}')">Bank</button>`
          : "",
        canManageEmployees
          ? `<button class="emp-action-item" type="button" onclick="window.__alterSalaryDetails('${employee.id}')">Salary</button>`
          : "",
      ].filter(Boolean).join("");
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
          <td>${attendanceBadge}</td>
          <td>
            <div class="emp-action-menu-wrap">
              <button class="btn btn-secondary btn-sm emp-action-toggle" type="button" onclick="window.__toggleEmployeeActionsMenu('${employee.id}', this)">
                <i class="bi bi-three-dots-vertical"></i>
              </button>
              <div class="emp-action-source" id="emp-actions-${employee.id}" style="display:none">
                ${actionItems}
              </div>
            </div>
          </td>
        </tr>
      `;
    })
    .join("");
}

function getEmployeeActionPortal() {
  let portal = document.getElementById("emp-action-portal");
  if (!portal) {
    portal = document.createElement("div");
    portal.id = "emp-action-portal";
    portal.className = "emp-action-menu";
    document.body.appendChild(portal);
  }
  return portal;
}

window.__closeEmployeeActionsMenu = function closeEmployeeActionsMenu() {
  const portal = document.getElementById("emp-action-portal");
  if (portal) {
    portal.classList.remove("open");
    portal.dataset.employeeId = "";
  }
};

window.__toggleEmployeeActionsMenu = function toggleEmployeeActionsMenu(employeeId, triggerEl) {
  const source = document.getElementById(`emp-actions-${employeeId}`);
  const trigger = triggerEl || source?.parentElement?.querySelector(".emp-action-toggle");
  if (!source || !trigger) return;

  const portal = getEmployeeActionPortal();
  const isOpenForThis = portal.classList.contains("open") && portal.dataset.employeeId === employeeId;
  if (isOpenForThis) {
    window.__closeEmployeeActionsMenu();
    return;
  }

  portal.innerHTML = source.innerHTML;
  portal.dataset.employeeId = employeeId;
  portal.classList.add("open");

  const rect = trigger.getBoundingClientRect();
  const menuWidth = portal.offsetWidth || 160;
  const menuHeight = portal.offsetHeight || 0;
  let left = rect.right - menuWidth;
  if (left < 8) left = 8;
  let top = rect.bottom + 6;
  if (menuHeight && top + menuHeight > window.innerHeight - 8) {
    top = Math.max(8, rect.top - menuHeight - 6);
  }
  portal.style.left = `${left}px`;
  portal.style.top = `${top}px`;
};

function wireEmployeeCreation() {
  const modal = document.getElementById("emp-modal");
  const managerSearchInput = document.getElementById("emp-line-manager-search");
  const accessEnabledSelect = document.getElementById("emp-access-enabled");
  const userRoleSelect = document.getElementById("emp-user-role");
  const loginEmailInput = document.getElementById("emp-login-email");
  const loginPasswordInput = document.getElementById("emp-login-password");
  const joinDateInput = document.getElementById("emp-join-date");
  const workModeSelect = document.getElementById("emp-work-mode");

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
  joinDateInput?.addEventListener("change", updateEmploymentStatusBadge);
  workModeSelect?.addEventListener("change", syncWorkModeOfficeState);
  syncAccessInputsState();
  syncWorkModeOfficeState();
  updateEmploymentStatusBadge();

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
      if (payload.workMode === "OFFICE" && !payload.officeId) {
        notify("Please select an office for office employees");
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

async function loadEmployeesPresence() {
  const list = await api("/attendance/employees-presence");
  employeePresenceMap = new Map(
    (Array.isArray(list) ? list : []).map((row) => [row.employeeId, row]),
  );
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

  await loadEmployeesPresence().catch(() => {
    employeePresenceMap = new Map();
  });
  renderEmployeesTable();
}

async function refreshEmployees() {
  const latest = await api("/employees");
  if (Array.isArray(latest)) {
    allEmployees = latest;
  }
  await loadEmployees();
  populateEmployeeSelectors();
  renderDashboardInsights();
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
  updateEmploymentStatusBadge();
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
  document.getElementById("emp-work-mode").value = employee.workMode ?? "OFFICE";
  populateOfficeOptions(employee.officeId ?? "");
  syncWorkModeOfficeState();

  setSelectByText(document.getElementById("emp-nationality"), employee.nationality);
  setSelectByText(document.getElementById("emp-department"), employee.department);
  setSelectByText(document.getElementById("emp-employment-type"), employee.employmentType ?? "Full-Time");
  setSelectByText(document.getElementById("emp-notice"), `${employee.noticePeriodDays ?? 30} days`);
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
  renderDashboardInsights();
  renderNotifications();
}

function populateEmployeeSelectors() {
  const leaveEmployeeSelect = document.querySelector("#leave-apply .form-group select");
  if (!leaveEmployeeSelect) return;

  const current = leaveEmployeeSelect.value;
  const loggedInEmployeeId = me?.employee?.id ?? "";
  const sourceEmployees = elevatedRoles.has(me?.role)
    ? allEmployees
    : allEmployees.filter((employee) => employee.id === loggedInEmployeeId);

  leaveEmployeeSelect.innerHTML = `<option value="">Select employee…</option>` + sourceEmployees
    .map((employee) => `<option value="${employee.id}">${employee.firstName} ${employee.lastName} (${employee.employeeCode})</option>`)
    .join("");
  const loggedInOptionExists = Boolean(
    loggedInEmployeeId && sourceEmployees.some((employee) => employee.id === loggedInEmployeeId),
  );
  if (loggedInOptionExists) {
    leaveEmployeeSelect.value = loggedInEmployeeId;
  } else {
    leaveEmployeeSelect.value = current;
    if (!leaveEmployeeSelect.value && sourceEmployees.length === 1) {
      leaveEmployeeSelect.value = sourceEmployees[0].id;
    }
  }
  leaveEmployeeSelect.dispatchEvent(new Event("change"));
}

function populateLeaveTypes() {
  const selects = document.querySelectorAll("#leave-apply .form-group select");
  const leaveTypeSelect = selects[1];
  if (!leaveTypeSelect) return;

  leaveTypeSelect.innerHTML = `<option value="">Select leave type…</option>` + leaveTypes
    .map((type) => `<option value="${type.id}">${type.name} (${type.yearlyAllocation} days/yr)</option>`)
    .join("");
}

function getRequestedLeaveDays(startDate, endDate) {
  if (!startDate || !endDate) return 0;
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end < start) return 0;
  const dayMs = 24 * 60 * 60 * 1000;
  return Math.max(1, Math.round((end.getTime() - start.getTime()) / dayMs) + 1);
}

function wireLeaveApplyForm() {
  const section = document.getElementById("leave-apply");
  if (!section) return;

  const selects = section.querySelectorAll(".form-group select");
  const dateInputs = section.querySelectorAll("input[type='date']");
  const reason = section.querySelector("textarea");
  const submitBtn = document.getElementById("leave-submit-btn") || section.querySelector(".btn.btn-primary");
  const earnedChip = document.getElementById("leave-earned-chip");
  const usedChip = document.getElementById("leave-used-chip");
  const availableChip = document.getElementById("leave-available-chip");
  const workedChip = document.getElementById("leave-worked-chip");
  const selectedDaysText = document.getElementById("leave-selected-days-text");
  let maturityState = null;
  let isOverBalance = false;
  const todayIso = new Date().toISOString().slice(0, 10);

  if (dateInputs[0]) dateInputs[0].min = todayIso;
  if (dateInputs[1]) dateInputs[1].min = todayIso;

  const syncDateBounds = () => {
    const fromDate = dateInputs[0]?.value || todayIso;
    if (dateInputs[1]) {
      dateInputs[1].min = fromDate < todayIso ? todayIso : fromDate;
      if (dateInputs[1].value && dateInputs[1].value < dateInputs[1].min) {
        dateInputs[1].value = "";
      }
    }
  };

  const syncSubmitState = () => {
    if (!submitBtn) return;
    submitBtn.disabled = isOverBalance;
    submitBtn.style.opacity = isOverBalance ? "0.55" : "1";
    submitBtn.style.cursor = isOverBalance ? "not-allowed" : "pointer";
  };

  const renderMaturityInfo = () => {
    const requestedDays = getRequestedLeaveDays(dateInputs[0]?.value, dateInputs[1]?.value);
    const selectedLeaveType = leaveTypes.find((item) => item.id === selects[1]?.value);
    const isPaidLeave = selectedLeaveType ? Boolean(selectedLeaveType.paidLeave) : true;
    if (!maturityState) {
      if (earnedChip) earnedChip.textContent = "Earned: 0.00";
      if (usedChip) usedChip.textContent = "Used: 0.00";
      if (availableChip) availableChip.textContent = "Available: 0.00";
      if (workedChip) workedChip.textContent = "Days worked: 0";
      if (selectedDaysText) {
        selectedDaysText.textContent = "Selected days: 0.00";
        selectedDaysText.style.color = "";
        selectedDaysText.style.fontWeight = "";
      }
      isOverBalance = false;
      syncSubmitState();
      return;
    }
    const availableDays = Math.min(60, Number(maturityState.availableDays ?? 0));
    const maturedDays = Math.min(60, Number(maturityState.maturedDays ?? 0));
    const usedDays = Number(maturityState.usedDays ?? 0);
    const daysWorked = Number(maturityState.daysWorked ?? 0);
    if (earnedChip) earnedChip.textContent = `Earned: ${maturedDays.toFixed(2)}`;
    if (usedChip) usedChip.textContent = `Used: ${usedDays.toFixed(2)}`;
    if (availableChip) availableChip.textContent = `Available: ${availableDays.toFixed(2)}`;
    if (workedChip) workedChip.textContent = `Days worked: ${daysWorked}`;

    if (!isPaidLeave) {
      if (selectedDaysText) {
        selectedDaysText.textContent = `Selected days: ${requestedDays.toFixed(2)}`;
        selectedDaysText.style.color = "";
        selectedDaysText.style.fontWeight = "";
      }
      isOverBalance = false;
      syncSubmitState();
      return;
    }
    isOverBalance = requestedDays > 0 && requestedDays > availableDays;
    const availableAfterRequest = availableDays - requestedDays;
    if (selectedDaysText) {
      selectedDaysText.textContent = requestedDays
        ? `Selected days: ${requestedDays.toFixed(2)} • Remaining balance: ${Math.max(0, availableAfterRequest).toFixed(2)}`
        : "Selected days: 0.00";
      selectedDaysText.style.color = isOverBalance ? "#ef4444" : "";
      selectedDaysText.style.fontWeight = isOverBalance ? "700" : "";
    }
    syncSubmitState();
  };

  const refreshMaturityInfo = async () => {
    const employeeId = selects[0]?.value;
    if (!employeeId) {
      maturityState = null;
      renderMaturityInfo();
      return;
    }
    try {
      maturityState = await api(`/leave/maturity/${employeeId}`);
    } catch (_error) {
      maturityState = null;
    }
    renderMaturityInfo();
  };

  submitBtn.onclick = async () => {
    try {
      const employeeId = selects[0].value;
      const leaveTypeId = selects[1].value;
      const startDate = dateInputs[0].value;
      const endDate = dateInputs[1].value;
      const reasonText = reason.value.trim();

      if (!employeeId || !leaveTypeId || !startDate || !endDate) {
        notify("Please complete required leave fields");
        return;
      }
      if (!elevatedRoles.has(me?.role) && me?.employee?.id && employeeId !== me.employee.id) {
        notify("You can only apply leave for your own profile");
        return;
      }

      const start = new Date(startDate);
      const end = new Date(endDate);
      if (startDate < todayIso || endDate < todayIso) {
        notify("Previous dates are not allowed");
        return;
      }
      const days = getRequestedLeaveDays(startDate, endDate);
      if (!days) {
        notify("Invalid leave date range");
        return;
      }
      const hasOverlap = leaveRequestsCache.some((request) => {
        if (request.employeeId !== employeeId) return false;
        if (!["PENDING_L1", "PENDING_L2", "APPROVED"].includes(request.status)) return false;
        const existingStart = new Date(request.startDate);
        const existingEnd = new Date(request.endDate);
        if (Number.isNaN(existingStart.getTime()) || Number.isNaN(existingEnd.getTime())) return false;
        return existingStart <= end && existingEnd >= start;
      });
      if (hasOverlap) {
        notify("Leave already exists in selected time frame");
        return;
      }
      const selectedLeaveType = leaveTypes.find((item) => item.id === leaveTypeId);
      const isPaidLeave = selectedLeaveType ? Boolean(selectedLeaveType.paidLeave) : true;
      if (isPaidLeave && maturityState && days > Math.min(60, Number(maturityState.availableDays ?? 0))) {
        notify(`Insufficient matured leave. Available: ${Math.min(60, Number(maturityState.availableDays ?? 0)).toFixed(2)} day(s).`);
        return;
      }

      await api("/leave/requests", {
        method: "POST",
        body: JSON.stringify({
          employeeId,
          leaveTypeId,
          startDate: start.toISOString(),
          endDate: end.toISOString(),
          days,
          reason: reasonText || "",
        }),
      });

      notify("Leave request submitted successfully");
      selects[0].value = "";
      selects[1].value = "";
      reason.value = "";
      dateInputs[0].value = "";
      dateInputs[1].value = "";
      if (!elevatedRoles.has(me?.role) && me?.employee?.id) {
        selects[0].value = me.employee.id;
      } else if (!selects[0].value && selects[0].options.length === 2) {
        selects[0].selectedIndex = 1;
      }
      await refreshMaturityInfo();
      await loadLeaveRequests();
    } catch (error) {
      notify(error.message);
    }
  };

  selects[0]?.addEventListener("change", () => {
    refreshMaturityInfo().catch(() => null);
  });
  dateInputs.forEach((input) => {
    input.addEventListener("change", () => {
      syncDateBounds();
      renderMaturityInfo();
    });
  });
  selects[1]?.addEventListener("change", renderMaturityInfo);
  syncDateBounds();
  refreshMaturityInfo().catch(() => null);
}

function wireLeaveBalanceLookup() {
  const searchInput = document.getElementById("leave-balance-search");
  const resultsBox = document.getElementById("leave-balance-results");
  if (!searchInput || !resultsBox) return;

  const closeResults = () => {
    resultsBox.style.display = "none";
    resultsBox.innerHTML = "";
  };

  const renderResults = (term) => {
    const query = term.trim().toLowerCase();
    if (!query) {
      closeResults();
      return;
    }
    const matches = allEmployees.filter((employee) => {
      const haystack = [
        employee.firstName,
        employee.lastName,
        employee.employeeCode,
        employee.email,
        employee.department,
        employee.designation,
      ].filter(Boolean).join(" ").toLowerCase();
      return haystack.includes(query);
    }).slice(0, 8);

    if (!matches.length) {
      resultsBox.innerHTML = `<div class="text-muted" style="padding:10px">No matching employees.</div>`;
      resultsBox.style.display = "block";
      return;
    }

    resultsBox.innerHTML = matches.map((employee) => {
      const name = `${employee.firstName ?? ""} ${employee.lastName ?? ""}`.trim();
      return `<button type="button" class="emp-action-item" style="display:block;width:100%;text-align:left;padding:9px 10px" onclick="window.__selectLeaveBalanceEmployee('${employee.id}')">${escapeAttr(name)} (${escapeAttr(employee.employeeCode ?? "—")}) • ${escapeAttr(employee.department ?? "")}</button>`;
    }).join("");
    resultsBox.style.display = "block";
  };

  searchInput.addEventListener("input", () => renderResults(searchInput.value));
  searchInput.addEventListener("focus", () => renderResults(searchInput.value));
  document.addEventListener("click", (event) => {
    if (event.target === searchInput) return;
    if (resultsBox.contains(event.target)) return;
    closeResults();
  });
}

window.__selectLeaveBalanceEmployee = async function selectLeaveBalanceEmployee(employeeId) {
  const employee = allEmployees.find((item) => item.id === employeeId);
  const resultsBox = document.getElementById("leave-balance-results");
  const searchInput = document.getElementById("leave-balance-search");
  const detail = document.getElementById("leave-balance-detail");
  const empty = document.getElementById("leave-balance-empty");
  if (!employee) {
    notify("Employee not found");
    return;
  }
  if (resultsBox) {
    resultsBox.style.display = "none";
    resultsBox.innerHTML = "";
  }
  const name = `${employee.firstName ?? ""} ${employee.lastName ?? ""}`.trim();
  if (searchInput) searchInput.value = name;

  try {
    const data = await api(`/leave/maturity/${employeeId}`);
    const earned = Math.min(60, Number(data.maturedDays ?? 0));
    const used = Number(data.usedDays ?? 0);
    const available = Math.min(60, Number(data.availableDays ?? 0));
    const worked = Number(data.daysWorked ?? 0);

    const avatar = document.getElementById("leave-balance-avatar");
    const nameEl = document.getElementById("leave-balance-name");
    const metaEl = document.getElementById("leave-balance-meta");
    const workedEl = document.getElementById("leave-balance-worked");
    const earnedEl = document.getElementById("leave-balance-earned");
    const usedEl = document.getElementById("leave-balance-used");
    const availableEl = document.getElementById("leave-balance-available");
    const noteEl = document.getElementById("leave-balance-note");

    if (avatar) {
      avatar.textContent = name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase() || "--";
    }
    if (nameEl) nameEl.textContent = name;
    if (metaEl) metaEl.textContent = `${employee.employeeCode ?? "—"} • ${employee.department ?? ""} • ${employee.designation ?? ""}`;
    if (workedEl) workedEl.textContent = String(worked);
    if (earnedEl) earnedEl.textContent = earned.toFixed(2);
    if (usedEl) usedEl.textContent = used.toFixed(2);
    if (availableEl) availableEl.textContent = available.toFixed(2);
    if (noteEl) {
      noteEl.textContent = `Daily maturity ${Number(data.dailyRate ?? 0).toFixed(4)} • Max cap ${data.yearlyCap ?? 60} days • As on ${new Date(data.asOf ?? Date.now()).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}.`;
    }

    if (detail) detail.style.display = "";
    if (empty) empty.style.display = "none";
  } catch (error) {
    notify(error.message);
  }
};

let exitRecordsCache = [];

const EXIT_STATUS_LABELS = {
  PENDING: "Pending L1",
  LM_APPROVED: "Line Manager Approved",
  HR_APPROVED: "HR Approved",
  INITIATED: "Initiated",
  DOCUMENTED: "Documented",
  APPROVED: "Approved",
  CLEARANCE_IN_PROGRESS: "Clearance In Progress",
  SETTLEMENT_READY: "Settlement Ready",
  COMPLETED: "Completed",
  REJECTED: "Rejected",
  CANCELLED: "Cancelled",
};

function exitStatusBadge(status) {
  if (status === "COMPLETED") return "badge-green";
  if (status === "REJECTED" || status === "CANCELLED") return "badge-coral";
  if (status === "SETTLEMENT_READY" || status === "CLEARANCE_IN_PROGRESS") return "badge-blue";
  return "badge-amber";
}

function fmtDate(value) {
  if (!value) return "—";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function populateExitEmployeeSelects() {
  const resignSelect = document.getElementById("exit-emp-select");
  const termSelect = document.getElementById("term-emp-select");
  if (resignSelect) {
    const source = elevatedRoles.has(me?.role)
      ? allEmployees
      : allEmployees.filter((emp) => emp.id === me?.employee?.id);
    resignSelect.innerHTML = `<option value="">Select employee…</option>` + source
      .map((emp) => `<option value="${emp.id}">${escapeAttr(`${emp.firstName ?? ""} ${emp.lastName ?? ""}`.trim())} (${escapeAttr(emp.employeeCode ?? "—")})</option>`)
      .join("");
    if (me?.employee?.id && source.some((emp) => emp.id === me.employee.id)) {
      resignSelect.value = me.employee.id;
    }
    resignSelect.dispatchEvent(new Event("change"));
  }
  if (termSelect) {
    termSelect.innerHTML = `<option value="">Select employee…</option>` + allEmployees
      .filter((emp) => emp.id !== me?.employee?.id)
      .map((emp) => `<option value="${emp.id}">${escapeAttr(`${emp.firstName ?? ""} ${emp.lastName ?? ""}`.trim())} (${escapeAttr(emp.employeeCode ?? "—")})</option>`)
      .join("");
  }
  const todayIso = new Date().toISOString().slice(0, 10);
  ["exit-resignation-date", "exit-lwd", "term-lwd"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.min = todayIso;
  });
}

function renderExitsTable() {
  const tbody = document.getElementById("exit-records-body");
  if (!tbody) return;
  if (!exitRecordsCache.length) {
    tbody.innerHTML = `<tr><td colspan="6" class="text-muted">No exit records yet.</td></tr>`;
    return;
  }
  tbody.innerHTML = exitRecordsCache.map((record) => {
    const emp = record.employee;
    const name = `${emp?.firstName ?? ""} ${emp?.lastName ?? ""}`.trim();
    const typeBadge = record.type === "TERMINATION" ? "badge-coral" : "badge-blue";
    return `
      <tr>
        <td>${escapeAttr(name)} (${escapeAttr(emp?.employeeCode ?? "—")})</td>
        <td><span class="badge ${typeBadge}">${formatLabel(record.type)}</span></td>
        <td><span class="badge ${exitStatusBadge(record.status)}">${escapeAttr(EXIT_STATUS_LABELS[record.status] ?? record.status)}</span></td>
        <td>${fmtDate(record.lastWorkingDate ?? record.requestedLastWorkingDay)}</td>
        <td>${fmtDate(record.createdAt)}</td>
        <td><button class="btn btn-secondary btn-sm" onclick="window.__viewExit('${record.id}')">View</button></td>
      </tr>`;
  }).join("");
}

async function loadExits() {
  try {
    const records = await api("/exits");
    exitRecordsCache = Array.isArray(records) ? records : [];
    renderExitsTable();
    renderNotifications();
  } catch (error) {
    exitRecordsCache = [];
    renderExitsTable();
    notify(error.message);
  }
}

function readFileAsBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Unable to read file"));
    reader.readAsDataURL(file);
  });
}

async function uploadAttachment(inputId, category) {
  const input = document.getElementById(inputId);
  const file = input?.files?.[0];
  if (!file) return undefined;
  if (file.size > 5 * 1024 * 1024) {
    throw new Error("File exceeds the 5 MB limit");
  }
  const dataBase64 = await readFileAsBase64(file);
  const result = await api("/uploads", {
    method: "POST",
    body: JSON.stringify({ fileName: file.name, mimeType: file.type, dataBase64, category }),
  });
  return result?.url;
}

window.__viewAttachment = async function viewAttachment(url) {
  try {
    const response = await fetch(`${API_BASE}${url.replace(/^\/api/, "")}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      cache: "no-store",
    });
    if (!response.ok) throw new Error("Unable to open document");
    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);
    window.open(objectUrl, "_blank");
    setTimeout(() => URL.revokeObjectURL(objectUrl), 60000);
  } catch (error) {
    notify(error.message);
  }
};

window.__submitResignation = async function submitResignation() {
  try {
    const employeeId = document.getElementById("exit-emp-select")?.value;
    const resignationDate = document.getElementById("exit-resignation-date")?.value;
    const lwd = document.getElementById("exit-lwd")?.value;
    const reasonCategory = document.getElementById("exit-reason-category")?.value;
    const reason = document.getElementById("exit-reason")?.value.trim() ?? "";
    const noticeAccepted = document.getElementById("exit-notice-accepted")?.value === "true";
    const confirmed = document.getElementById("exit-confirm")?.checked;

    if (!employeeId || !resignationDate || !lwd) {
      notify("Please fill employee, resignation date and last working day");
      return;
    }
    if (!confirmed) {
      notify("Please confirm the resignation declaration");
      return;
    }
    const supportingDocUrl = await uploadAttachment("exit-doc-file", "RESIGNATION");
    await api("/exits/resignation", {
      method: "POST",
      body: JSON.stringify({
        employeeId,
        resignationDate: new Date(resignationDate).toISOString(),
        requestedLastWorkingDay: new Date(lwd).toISOString(),
        reasonCategory,
        reason,
        noticeAccepted,
        supportingDocUrl,
        employeeConfirmed: true,
      }),
    });
    notify("Resignation submitted successfully");
    document.getElementById("exit-reason").value = "";
    document.getElementById("exit-confirm").checked = false;
    const exitFile = document.getElementById("exit-doc-file");
    if (exitFile) exitFile.value = "";
    await loadExits();
    const recordsTabBtn = document.querySelector("#view-exits .tab-btn[onclick*=\"exit-records\"]");
    if (recordsTabBtn) switchTab(recordsTabBtn, "exit-records");
  } catch (error) {
    notify(error.message);
  }
};

window.__initiateTermination = async function initiateTermination() {
  try {
    const employeeId = document.getElementById("term-emp-select")?.value;
    const reasonCategory = document.getElementById("term-reason-category")?.value;
    const lwd = document.getElementById("term-lwd")?.value;
    const notes = document.getElementById("term-notes")?.value.trim() ?? "";
    if (!employeeId || !lwd) {
      notify("Please select employee and last working date");
      return;
    }
    const supportingDocUrl = await uploadAttachment("term-doc-file", "TERMINATION");
    await api("/exits/termination", {
      method: "POST",
      body: JSON.stringify({
        employeeId,
        reasonCategory,
        lastWorkingDate: new Date(lwd).toISOString(),
        incidentNotes: notes,
        supportingDocUrl,
      }),
    });
    notify("Termination initiated");
    document.getElementById("term-notes").value = "";
    const termFile = document.getElementById("term-doc-file");
    if (termFile) termFile.value = "";
    await loadExits();
    const recordsTabBtn = document.querySelector("#view-exits .tab-btn[onclick*=\"exit-records\"]");
    if (recordsTabBtn) switchTab(recordsTabBtn, "exit-records");
  } catch (error) {
    notify(error.message);
  }
};

function renderExitDetailHtml(record) {
  const emp = record.employee;
  const name = `${emp?.firstName ?? ""} ${emp?.lastName ?? ""}`.trim();
  const role = me?.role;
  const isElevated = elevatedRoles.has(role);
  const isManager = role === "MANAGER";
  const isCeo = role === "SUPER_ADMIN" || role === "CEO";

  const timeline = [
    record.employeeConfirmedAt ? `Submitted ${fmtDate(record.employeeConfirmedAt)}` : "",
    record.lmApprovedAt ? `Line Manager approved ${fmtDate(record.lmApprovedAt)}` : "",
    record.hrApprovedAt ? `HR approved ${fmtDate(record.hrApprovedAt)}` : "",
    record.ceoApprovedAt ? `Director approved ${fmtDate(record.ceoApprovedAt)}` : "",
    record.completedAt ? `Completed ${fmtDate(record.completedAt)}` : "",
    record.rejectedAt ? `Rejected/Cancelled ${fmtDate(record.rejectedAt)}` : "",
  ].filter(Boolean).map((t) => `<li>${escapeAttr(t)}</li>`).join("");

  const clearance = (record.clearanceTasks ?? []).map((task) => {
    const done = task.status === "COMPLETED";
    const action = (!done && (isElevated || isManager))
      ? `<button class="btn btn-accent btn-sm" onclick="window.__exitClearance('${task.id}','COMPLETED')">Mark Done</button>`
      : `<span class="badge ${done ? "badge-green" : "badge-amber"}">${done ? "Cleared" : "Pending"}</span>`;
    return `<div class="flex-between" style="padding:8px 0;border-bottom:1px solid var(--border)"><span>${escapeAttr(task.department)}${task.urgent ? ' <span class="badge badge-coral">Urgent</span>' : ""}</span>${action}</div>`;
  }).join("");

  const s = record.finalSettlement;
  const settlementHtml = s ? `
    <div class="stats-grid" style="margin-top:8px">
      <div class="stat-card"><div class="stat-label">Gratuity (EOSB)</div><div class="stat-value" style="color:#4DB6AC">${Number(s.gratuity).toLocaleString("en-US")}</div></div>
      <div class="stat-card"><div class="stat-label">Leave Encashment</div><div class="stat-value" style="color:#64B5F6">${Number(s.leaveEncashment).toLocaleString("en-US")}</div></div>
      <div class="stat-card"><div class="stat-label">Deductions</div><div class="stat-value" style="color:#FF8A65">${Number(s.deductions).toLocaleString("en-US")}</div></div>
      <div class="stat-card"><div class="stat-label">Net Settlement (AED)</div><div class="stat-value" style="color:#FFD54F">${Number(s.netSettlement).toLocaleString("en-US")}</div></div>
    </div>
    <div class="text-muted" style="font-size:12px;margin-top:6px">Years of service: ${Number(s.yearsOfService).toFixed(2)} • Unpaid salary: AED ${Number(s.unpaidSalary).toLocaleString("en-US")} • Other additions: AED ${Number(s.otherAdditions).toLocaleString("en-US")}</div>
  ` : "";

  // Stage-specific actions
  let actions = "";
  if (record.status === "PENDING" && (isManager || isElevated)) {
    actions = `<button class="btn btn-accent btn-sm" onclick="window.__exitAction('${record.id}','lm-approve')">Approve (L1)</button>`;
  } else if (record.status === "LM_APPROVED" && isElevated) {
    actions = `
      <div class="form-grid" style="margin-bottom:10px">
        <div class="form-group"><label>Confirm Last Working Day</label><input id="exit-hr-lwd" type="date" value="${record.requestedLastWorkingDay ? new Date(record.requestedLastWorkingDay).toISOString().slice(0,10) : ""}"></div>
        <div class="form-group"><label>Notice Shortfall (days)</label><input id="exit-hr-shortfall" type="number" min="0" value="${record.noticeShortfallDays ?? 0}"></div>
      </div>
      <button class="btn btn-primary btn-sm" onclick="window.__exitHrApprove('${record.id}')">HR Approve & Start Clearance</button>`;
  } else if (record.status === "INITIATED" && isElevated) {
    actions = `
      <div class="form-group full" style="margin-bottom:10px"><label>Incident / Documentation Notes</label><textarea id="exit-doc-notes">${escapeAttr(record.incidentNotes ?? "")}</textarea></div>
      <button class="btn btn-primary btn-sm" onclick="window.__exitDocument('${record.id}')">Save Documentation</button>`;
  } else if (record.status === "DOCUMENTED" && isCeo) {
    actions = `<button class="btn btn-primary btn-sm" onclick="window.__exitAction('${record.id}','ceo-approve')">Final Approve (CEO/Director)</button>`;
  } else if (record.status === "CLEARANCE_IN_PROGRESS" && isElevated) {
    const allCleared = (record.clearanceTasks ?? []).every((t) => t.status === "COMPLETED");
    actions = allCleared ? `
      <div class="form-grid" style="margin-bottom:10px">
        <div class="form-group"><label>Unpaid Salary Days</label><input id="exit-set-unpaid" type="number" min="0" value="0"></div>
        <div class="form-group"><label>Extra Deductions (AED)</label><input id="exit-set-deduction" type="number" min="0" value="0"></div>
        <div class="form-group"><label>Other Additions (AED)</label><input id="exit-set-addition" type="number" min="0" value="0"></div>
      </div>
      <button class="btn btn-primary btn-sm" onclick="window.__exitSettlement('${record.id}')">Compute Final Settlement</button>` : `<div class="text-muted" style="font-size:12px">Complete all clearance items to compute settlement.</div>`;
  } else if (record.status === "SETTLEMENT_READY" && isElevated) {
    actions = `<button class="btn btn-primary btn-sm" onclick="window.__exitComplete('${record.id}')">Complete & Issue Experience Letter</button>`;
  } else if (record.status === "COMPLETED") {
    actions = `<button class="btn btn-secondary btn-sm" onclick="window.__exitLetter('${record.id}')">View Experience Letter</button>`;
  }

  const canReject = !["COMPLETED", "REJECTED", "CANCELLED"].includes(record.status) && (isManager || isElevated || isCeo);
  const rejectBtn = canReject ? `<button class="btn btn-danger btn-sm" onclick="window.__exitReject('${record.id}')">${record.type === "TERMINATION" ? "Cancel" : "Reject"}</button>` : "";

  let rejectionHtml = "";
  if ((record.status === "REJECTED" || record.status === "CANCELLED") && record.rejectReason) {
    const rejecter = allEmployees.find((emp) => emp.id === record.rejectedById);
    const rejecterName = rejecter ? `${rejecter.firstName ?? ""} ${rejecter.lastName ?? ""}`.trim() : "";
    rejectionHtml = `
      <div class="alert alert-coral" style="background:rgba(244,81,30,0.1);border:1px solid rgba(244,81,30,0.3);color:#FF8A65;padding:10px 12px;border-radius:10px;font-size:13px">
        <b>${record.type === "TERMINATION" ? "Cancelled" : "Rejected"}${rejecterName ? ` by ${escapeAttr(rejecterName)}` : ""}${record.rejectedAt ? ` on ${fmtDate(record.rejectedAt)}` : ""}</b>
        <div style="margin-top:4px">Reason: ${escapeAttr(record.rejectReason)}</div>
      </div>`;
  }

  return `
    <div style="display:grid;gap:12px">
      <div class="flex-between">
        <div><b>${escapeAttr(name)}</b> <span class="text-muted">(${escapeAttr(emp?.employeeCode ?? "—")})</span></div>
        <span class="badge ${exitStatusBadge(record.status)}">${escapeAttr(EXIT_STATUS_LABELS[record.status] ?? record.status)}</span>
      </div>
      <div class="text-muted" style="font-size:13px">
        ${escapeAttr(formatLabel(record.type))} • ${escapeAttr(emp?.designation ?? "")} • ${escapeAttr(emp?.department ?? "")}<br>
        Reason: ${escapeAttr(formatLabel(record.reasonCategory ?? "—"))}${record.reason ? ` — ${escapeAttr(record.reason)}` : ""}<br>
        Notice period: ${record.noticePeriodDays ?? 30} days • Shortfall: ${record.noticeShortfallDays ?? 0} days • LWD: ${fmtDate(record.lastWorkingDate ?? record.requestedLastWorkingDay)}
      </div>
      ${record.supportingDocUrl ? `<div><button class="btn btn-secondary btn-sm" onclick="window.__viewAttachment('${escapeAttr(record.supportingDocUrl)}')"><i class="bi bi-paperclip"></i> View Supporting Document</button></div>` : ""}
      ${rejectionHtml}
      ${timeline ? `<div><div class="section-title" style="font-size:13px">Progress</div><ul class="emp-tooltip-list" style="padding-left:16px;list-style:disc">${timeline}</ul></div>` : ""}
      ${clearance ? `<div><div class="section-title" style="font-size:13px">Clearance Checklist</div>${clearance}</div>` : ""}
      ${settlementHtml ? `<div><div class="section-title" style="font-size:13px">Final Settlement</div>${settlementHtml}</div>` : ""}
      ${(actions || rejectBtn) ? `<div><div class="section-title" style="font-size:13px">Actions</div><div class="flex gap-8" style="flex-wrap:wrap">${actions}${rejectBtn}</div></div>` : ""}
    </div>`;
}

window.__viewExit = async function viewExit(exitId) {
  try {
    const record = await api(`/exits/${exitId}`);
    openActionModal({
      title: "Exit Record",
      hideSave: true,
      bodyHtml: renderExitDetailHtml(record),
    });
  } catch (error) {
    notify(error.message);
  }
};

async function refreshExitModal(exitId) {
  closeActionModal();
  await loadExits();
  await window.__viewExit(exitId);
}

window.__exitAction = async function exitAction(exitId, action) {
  try {
    await api(`/exits/${exitId}/${action}`, { method: "POST", body: JSON.stringify({}) });
    notify("Exit record updated");
    await refreshExitModal(exitId);
  } catch (error) {
    notify(error.message);
  }
};

window.__exitHrApprove = async function exitHrApprove(exitId) {
  try {
    const lwd = document.getElementById("exit-hr-lwd")?.value;
    const shortfall = Number(document.getElementById("exit-hr-shortfall")?.value ?? 0);
    if (!lwd) {
      notify("Please confirm last working day");
      return;
    }
    await api(`/exits/${exitId}/hr-approve`, {
      method: "POST",
      body: JSON.stringify({ lastWorkingDate: new Date(lwd).toISOString(), noticeShortfallDays: shortfall }),
    });
    notify("HR approved; clearance started");
    await refreshExitModal(exitId);
  } catch (error) {
    notify(error.message);
  }
};

window.__exitDocument = async function exitDocument(exitId) {
  try {
    const notes = document.getElementById("exit-doc-notes")?.value ?? "";
    await api(`/exits/${exitId}/document`, { method: "POST", body: JSON.stringify({ incidentNotes: notes }) });
    notify("Documentation saved");
    await refreshExitModal(exitId);
  } catch (error) {
    notify(error.message);
  }
};

window.__exitClearance = async function exitClearance(taskId, status) {
  try {
    const result = await api(`/exits/clearance/${taskId}`, { method: "PATCH", body: JSON.stringify({ status }) });
    notify("Clearance updated");
    await refreshExitModal(result?.exit?.id);
  } catch (error) {
    notify(error.message);
  }
};

window.__exitSettlement = async function exitSettlement(exitId) {
  try {
    const unpaidSalaryDays = Number(document.getElementById("exit-set-unpaid")?.value ?? 0);
    const extraDeductions = Number(document.getElementById("exit-set-deduction")?.value ?? 0);
    const otherAdditions = Number(document.getElementById("exit-set-addition")?.value ?? 0);
    await api(`/exits/${exitId}/settlement`, {
      method: "POST",
      body: JSON.stringify({ unpaidSalaryDays, extraDeductions, otherAdditions }),
    });
    notify("Final settlement computed");
    await refreshExitModal(exitId);
  } catch (error) {
    notify(error.message);
  }
};

window.__exitComplete = async function exitComplete(exitId) {
  try {
    await api(`/exits/${exitId}/complete`, { method: "POST", body: JSON.stringify({}) });
    notify("Exit completed; experience letter issued");
    await refreshExitModal(exitId);
  } catch (error) {
    notify(error.message);
  }
};

window.__exitReject = async function exitReject(exitId) {
  try {
    const reason = window.prompt("Enter reason for rejection/cancellation:");
    if (!reason || reason.trim().length < 3) {
      notify("A reason of at least 3 characters is required");
      return;
    }
    await api(`/exits/${exitId}/reject`, { method: "POST", body: JSON.stringify({ reason: reason.trim() }) });
    notify("Exit record rejected/cancelled");
    await refreshExitModal(exitId);
  } catch (error) {
    notify(error.message);
  }
};

window.__exitLetter = async function exitLetter(exitId) {
  try {
    const data = await api(`/exits/${exitId}/experience-letter`);
    openActionModal({
      title: "Experience / Service Letter",
      hideSave: true,
      bodyHtml: `<pre style="white-space:pre-wrap;font-family:inherit;font-size:13px;line-height:1.6">${escapeAttr(data.letter)}</pre>`,
    });
  } catch (error) {
    notify(error.message);
  }
};

let adjustmentCategories = [];
let adjustmentDualThreshold = 5000;
let adjustmentsCache = [];
let loansCache = [];

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function adjStatusBadge(status) {
  if (status === "PROCESSED" || status === "APPROVED") return "badge-green";
  if (status === "REJECTED") return "badge-coral";
  return "badge-amber";
}

function populateAdjustmentEmployeeSelects() {
  const source = elevatedRoles.has(me?.role)
    ? allEmployees
    : me?.role === "MANAGER"
      ? allEmployees.filter((emp) => emp.managerId === me?.employee?.id)
      : [];
  const optionsHtml = `<option value="">Select employee…</option>` + source
    .map((emp) => `<option value="${emp.id}">${escapeAttr(`${emp.firstName ?? ""} ${emp.lastName ?? ""}`.trim())} (${escapeAttr(emp.employeeCode ?? "—")})</option>`)
    .join("");
  ["adj-emp-select", "loan-emp-select"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = optionsHtml;
  });
}

function populateAdjustmentCategoryOptions() {
  const typeSelect = document.getElementById("adj-type");
  const catSelect = document.getElementById("adj-category");
  if (!typeSelect || !catSelect) return;
  const type = typeSelect.value || "DEDUCTION";
  const options = adjustmentCategories.filter((c) => c.type === type);
  catSelect.innerHTML = options.map((c) => `<option value="${c.code}">${escapeAttr(c.label)}</option>`).join("");
}

async function loadAdjustmentMeta() {
  try {
    const meta = await api("/adjustments/categories");
    adjustmentCategories = Array.isArray(meta?.categories) ? meta.categories : [];
    adjustmentDualThreshold = Number(meta?.dualApprovalThreshold ?? 5000);
    populateAdjustmentCategoryOptions();
    const note = document.getElementById("loan-threshold-note");
    if (note) note.textContent = `Loans/advances above AED ${adjustmentDualThreshold.toLocaleString("en-US")} require dual approval.`;
  } catch (_error) {
    adjustmentCategories = [];
  }
}

function renderAdjustmentsTable() {
  const tbody = document.getElementById("adj-list-body");
  if (!tbody) return;
  if (!adjustmentsCache.length) {
    tbody.innerHTML = `<tr><td colspan="8" class="text-muted">No adjustments found.</td></tr>`;
    return;
  }
  const canApprove = elevatedRoles.has(me?.role);
  const catLabel = (code) => adjustmentCategories.find((c) => c.code === code)?.label ?? formatLabel(code);
  tbody.innerHTML = adjustmentsCache.map((adj) => {
    const emp = adj.employee;
    const name = `${emp?.firstName ?? ""} ${emp?.lastName ?? ""}`.trim();
    const typeBadge = adj.type === "ADDITION" ? "badge-green" : "badge-coral";
    let action = `<span class="text-muted">—</span>`;
    if (canApprove && adj.status === "DRAFT") {
      action = `<div class="flex gap-8"><button class="btn btn-accent btn-sm" onclick="window.__approveAdjustment('${adj.id}')">Approve</button><button class="btn btn-danger btn-sm" onclick="window.__rejectAdjustment('${adj.id}')">Reject</button></div>`;
    } else if (canApprove && adj.status === "APPROVED") {
      action = `<button class="btn btn-danger btn-sm" onclick="window.__rejectAdjustment('${adj.id}')">Reject</button>`;
    }
    return `
      <tr>
        <td>${escapeAttr(adj.referenceNumber)}</td>
        <td>${escapeAttr(name)}</td>
        <td><span class="badge ${typeBadge}">${formatLabel(adj.type)}</span></td>
        <td>${escapeAttr(catLabel(adj.category))}</td>
        <td>AED ${Number(adj.amount).toLocaleString("en-US")}</td>
        <td>${MONTH_NAMES[(adj.effectiveMonth ?? 1) - 1]} ${adj.effectiveYear}</td>
        <td><span class="badge ${adjStatusBadge(adj.status)}">${formatLabel(adj.status)}</span></td>
        <td>${action}</td>
      </tr>`;
  }).join("");
}

function renderLoansTable() {
  const tbody = document.getElementById("adj-loans-body");
  if (!tbody) return;
  if (!loansCache.length) {
    tbody.innerHTML = `<tr><td colspan="7" class="text-muted">No loans or advances.</td></tr>`;
    return;
  }
  const canApprove = elevatedRoles.has(me?.role);
  tbody.innerHTML = loansCache.map((loan) => {
    const emp = loan.employee;
    const name = `${emp?.firstName ?? ""} ${emp?.lastName ?? ""}`.trim();
    const outstanding = Number(loan.outstandingAmount ?? Math.max(0, loan.totalAmount - loan.recoveredAmount));
    let action = `<span class="text-muted">—</span>`;
    if (canApprove && loan.status === "PENDING_APPROVAL") {
      const dualHint = loan.requiresDualApproval && loan.approver1Id ? " (2nd)" : loan.requiresDualApproval ? " (1st)" : "";
      action = `<div class="flex gap-8"><button class="btn btn-accent btn-sm" onclick="window.__approveLoan('${loan.id}')">Approve${dualHint}</button><button class="btn btn-danger btn-sm" onclick="window.__rejectLoan('${loan.id}')">Reject</button></div>`;
    }
    return `
      <tr>
        <td>${escapeAttr(name)}</td>
        <td><span class="badge badge-blue">${formatLabel(loan.type)}</span></td>
        <td>AED ${Number(loan.totalAmount).toLocaleString("en-US")}</td>
        <td>AED ${Number(loan.recoveredAmount).toLocaleString("en-US")}</td>
        <td>AED ${outstanding.toLocaleString("en-US")}</td>
        <td><span class="badge ${loan.status === "CLOSED" ? "badge-green" : loan.status === "REJECTED" ? "badge-coral" : loan.status === "ACTIVE" ? "badge-blue" : "badge-amber"}">${formatLabel(loan.status)}</span></td>
        <td>${action}</td>
      </tr>`;
  }).join("");
}

async function loadAdjustments() {
  try {
    const [adjustments, loans] = await Promise.all([api("/adjustments"), api("/adjustments/loans")]);
    adjustmentsCache = Array.isArray(adjustments) ? adjustments : [];
    loansCache = Array.isArray(loans) ? loans : [];
    renderAdjustmentsTable();
    renderLoansTable();
  } catch (error) {
    notify(error.message);
  }
}

function monthInputToParts(value) {
  if (!value) return null;
  const [year, month] = value.split("-").map((v) => Number(v));
  if (!Number.isFinite(year) || !Number.isFinite(month)) return null;
  return { year, month };
}

window.__submitAdjustment = async function submitAdjustment() {
  try {
    const employeeId = document.getElementById("adj-emp-select")?.value;
    const type = document.getElementById("adj-type")?.value;
    const category = document.getElementById("adj-category")?.value;
    const amount = Number(document.getElementById("adj-amount")?.value ?? 0);
    const monthParts = monthInputToParts(document.getElementById("adj-month")?.value);
    const reason = document.getElementById("adj-reason")?.value.trim() ?? "";
    const recurring = document.getElementById("adj-recurring")?.value === "true";
    const recurEndParts = monthInputToParts(document.getElementById("adj-recur-end")?.value);

    if (!employeeId || !category || !amount || !monthParts) {
      notify("Please complete employee, category, amount and month");
      return;
    }
    if (reason.length < 20) {
      notify("Reason must be at least 20 characters");
      return;
    }
    const supportingDocUrl = await uploadAttachment("adj-doc-file", "ADJUSTMENT");
    await api("/adjustments", {
      method: "POST",
      body: JSON.stringify({
        employeeId,
        type,
        category,
        amount,
        effectiveMonth: monthParts.month,
        effectiveYear: monthParts.year,
        reason,
        supportingDocUrl,
        recurring,
        recurrenceEndMonth: recurring ? recurEndParts?.month : undefined,
        recurrenceEndYear: recurring ? recurEndParts?.year : undefined,
      }),
    });
    notify("Adjustment created (pending approval)");
    document.getElementById("adj-amount").value = "";
    document.getElementById("adj-reason").value = "";
    const adjFile = document.getElementById("adj-doc-file");
    if (adjFile) adjFile.value = "";
    await loadAdjustments();
    const listTabBtn = document.querySelector("#view-payadjust .tab-btn[onclick*=\"adj-list\"]");
    if (listTabBtn) switchTab(listTabBtn, "adj-list");
  } catch (error) {
    notify(error.message);
  }
};

window.__approveAdjustment = async function approveAdjustment(id) {
  try {
    await api(`/adjustments/${id}/approve`, { method: "POST", body: JSON.stringify({}) });
    notify("Adjustment approved");
    await loadAdjustments();
  } catch (error) {
    notify(error.message);
  }
};

window.__rejectAdjustment = async function rejectAdjustment(id) {
  try {
    const reason = window.prompt("Enter rejection reason:");
    if (!reason || reason.trim().length < 3) {
      notify("A reason of at least 3 characters is required");
      return;
    }
    await api(`/adjustments/${id}/reject`, { method: "POST", body: JSON.stringify({ reason: reason.trim() }) });
    notify("Adjustment rejected");
    await loadAdjustments();
  } catch (error) {
    notify(error.message);
  }
};

window.__processAdjustmentMonth = async function processAdjustmentMonth() {
  try {
    const parts = monthInputToParts(document.getElementById("adj-process-month")?.value);
    if (!parts) {
      notify("Select a month to process");
      return;
    }
    const result = await api("/adjustments/process-month", {
      method: "POST",
      body: JSON.stringify({ month: parts.month, year: parts.year }),
    });
    notify(`${result.processed ?? 0} adjustment(s) processed`);
    await loadAdjustments();
  } catch (error) {
    notify(error.message);
  }
};

window.__submitLoan = async function submitLoan() {
  try {
    const employeeId = document.getElementById("loan-emp-select")?.value;
    const type = document.getElementById("loan-type")?.value;
    const totalAmount = Number(document.getElementById("loan-total")?.value ?? 0);
    const installmentAmount = Number(document.getElementById("loan-installment")?.value ?? 0);
    const startParts = monthInputToParts(document.getElementById("loan-start")?.value);
    const reason = document.getElementById("loan-reason")?.value.trim() ?? "";
    if (!employeeId || !totalAmount || !installmentAmount || !startParts) {
      notify("Please complete all loan fields");
      return;
    }
    if (reason.length < 10) {
      notify("Reason must be at least 10 characters");
      return;
    }
    await api("/adjustments/loans", {
      method: "POST",
      body: JSON.stringify({
        employeeId,
        type,
        totalAmount,
        installmentAmount,
        startMonth: startParts.month,
        startYear: startParts.year,
        reason,
      }),
    });
    notify("Loan/advance created (pending approval)");
    document.getElementById("loan-total").value = "";
    document.getElementById("loan-installment").value = "";
    document.getElementById("loan-reason").value = "";
    await loadAdjustments();
  } catch (error) {
    notify(error.message);
  }
};

window.__approveLoan = async function approveLoan(id) {
  try {
    await api(`/adjustments/loans/${id}/approve`, { method: "POST", body: JSON.stringify({}) });
    notify("Loan/advance approval recorded");
    await loadAdjustments();
  } catch (error) {
    notify(error.message);
  }
};

window.__rejectLoan = async function rejectLoan(id) {
  try {
    const reason = window.prompt("Enter rejection reason:");
    if (!reason || reason.trim().length < 3) {
      notify("A reason of at least 3 characters is required");
      return;
    }
    await api(`/adjustments/loans/${id}/reject`, { method: "POST", body: JSON.stringify({ reason: reason.trim() }) });
    notify("Loan/advance rejected");
    await loadAdjustments();
  } catch (error) {
    notify(error.message);
  }
};

function wireAdjustmentForms() {
  const typeSelect = document.getElementById("adj-type");
  typeSelect?.addEventListener("change", populateAdjustmentCategoryOptions);
  const recurringSelect = document.getElementById("adj-recurring");
  recurringSelect?.addEventListener("change", () => {
    const wrap = document.getElementById("adj-recur-end-wrap");
    if (wrap) wrap.style.display = recurringSelect.value === "true" ? "" : "none";
  });
  const todayMonth = new Date().toISOString().slice(0, 7);
  ["adj-month", "adj-recur-end", "loan-start"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.min = todayMonth;
  });
}

let proDocsCache = [];
let proTasksCache = [];
let proDocTypes = [];

function proDocStatusBadge(status) {
  if (status === "EXPIRED") return "badge-coral";
  if (status === "EXPIRING") return "badge-amber";
  return "badge-green";
}

function canManageProUi() {
  return elevatedRoles.has(me?.role) || me?.role === "PRO";
}

function populateProEmployeeSelects() {
  const source = canManageProUi()
    ? allEmployees
    : me?.role === "MANAGER"
      ? allEmployees.filter((emp) => emp.managerId === me?.employee?.id)
      : [];
  const optionsHtml = `<option value="">Select employee…</option>` + source
    .map((emp) => `<option value="${emp.id}">${escapeAttr(`${emp.firstName ?? ""} ${emp.lastName ?? ""}`.trim())} (${escapeAttr(emp.employeeCode ?? "—")})</option>`)
    .join("");
  ["pro-doc-emp", "pro-task-emp"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = optionsHtml;
  });
}

function populateProDocTypeSelects() {
  const optionsHtml = proDocTypes.map((t) => `<option value="${t}">${escapeAttr(formatLabel(t))}</option>`).join("");
  const docSel = document.getElementById("pro-doc-type");
  const taskSel = document.getElementById("pro-task-doctype");
  if (docSel) docSel.innerHTML = optionsHtml;
  if (taskSel) taskSel.innerHTML = `<option value="">— none —</option>` + optionsHtml;
}

async function loadProMeta() {
  try {
    const meta = await api("/pro/doc-types");
    proDocTypes = Array.isArray(meta?.docTypes) ? meta.docTypes : [];
    populateProDocTypeSelects();
  } catch (_error) {
    proDocTypes = [];
  }
}

function renderProDocsTable() {
  const tbody = document.getElementById("pro-docs-body");
  if (!tbody) return;
  if (!proDocsCache.length) {
    tbody.innerHTML = `<tr><td colspan="7" class="text-muted">No documents registered.</td></tr>`;
    return;
  }
  const canManage = canManageProUi();
  tbody.innerHTML = proDocsCache.map((doc) => {
    const emp = doc.employee;
    const name = `${emp?.firstName ?? ""} ${emp?.lastName ?? ""}`.trim();
    const action = doc.fileUrl
      ? `<button class="btn btn-secondary btn-sm" onclick="window.__viewAttachment('${escapeAttr(doc.fileUrl)}')">File</button>`
      : (canManage ? `<button class="btn btn-secondary btn-sm" onclick="window.__renewProDocument('${doc.id}')">Update</button>` : `<span class="text-muted">—</span>`);
    return `
      <tr>
        <td>${escapeAttr(name)}</td>
        <td>${escapeAttr(formatLabel(doc.docType))}</td>
        <td>${escapeAttr(doc.documentNumber ?? "—")}</td>
        <td>${escapeAttr(doc.issuingAuthority ?? "—")}</td>
        <td>${fmtDate(doc.expiryDate)}</td>
        <td><span class="badge ${proDocStatusBadge(doc.computedStatus)}">${formatLabel(doc.computedStatus)}</span></td>
        <td>${action}</td>
      </tr>`;
  }).join("");
}

function renderProTasksTable() {
  const tbody = document.getElementById("pro-tasks-body");
  if (!tbody) return;
  if (!proTasksCache.length) {
    tbody.innerHTML = `<tr><td colspan="7" class="text-muted">No PRO tasks.</td></tr>`;
    return;
  }
  const canManage = canManageProUi();
  tbody.innerHTML = proTasksCache.map((task) => {
    const emp = task.employee;
    const name = `${emp?.firstName ?? ""} ${emp?.lastName ?? ""}`.trim();
    const flow = Array.isArray(task.flow) ? task.flow : [];
    const isFinal = flow.indexOf(task.status) >= flow.length - 1;
    const terminal = ["COMPLETED", "CANCELLED", "PASSPORT_RETURNED", "ABORTED"].includes(task.status);
    let action = `<span class="text-muted">—</span>`;
    if (canManage && !terminal && !isFinal) {
      action = `<button class="btn btn-accent btn-sm" onclick="window.__advanceProTask('${task.id}')">Advance Stage</button>`;
    }
    const govFee = [task.governmentRef, task.feeAmount ? `AED ${Number(task.feeAmount).toLocaleString("en-US")}` : null].filter(Boolean).join(" · ") || "—";
    return `
      <tr>
        <td>${escapeAttr(task.referenceNumber)}${task.autoCreated ? ' <span class="badge badge-amber">Auto</span>' : ""}</td>
        <td>${escapeAttr(name)}</td>
        <td>${escapeAttr(formatLabel(task.taskType))}</td>
        <td>${escapeAttr(task.documentType ? formatLabel(task.documentType) : "—")}</td>
        <td><span class="badge badge-blue">${escapeAttr(formatLabel(task.status))}</span></td>
        <td>${escapeAttr(govFee)}</td>
        <td>${action}</td>
      </tr>`;
  }).join("");
}

async function loadPro() {
  try {
    const [docs, tasks] = await Promise.all([api("/pro/documents"), api("/pro/tasks")]);
    proDocsCache = Array.isArray(docs) ? docs : [];
    proTasksCache = Array.isArray(tasks) ? tasks : [];
    renderProDocsTable();
    renderProTasksTable();
    renderNotifications();
  } catch (error) {
    notify(error.message);
  }
}

window.__submitProDocument = async function submitProDocument() {
  try {
    const employeeId = document.getElementById("pro-doc-emp")?.value;
    const docType = document.getElementById("pro-doc-type")?.value;
    if (!employeeId || !docType) {
      notify("Please select employee and document type");
      return;
    }
    const issueDate = document.getElementById("pro-doc-issue")?.value;
    const expiryDate = document.getElementById("pro-doc-expiry")?.value;
    const fileUrl = await uploadAttachment("pro-doc-file", "DOCUMENT");
    await api("/pro/documents", {
      method: "POST",
      body: JSON.stringify({
        employeeId,
        docType,
        documentNumber: document.getElementById("pro-doc-number")?.value.trim() || undefined,
        issuingAuthority: document.getElementById("pro-doc-authority")?.value.trim() || undefined,
        issueDate: issueDate ? new Date(issueDate).toISOString() : undefined,
        expiryDate: expiryDate ? new Date(expiryDate).toISOString() : undefined,
        fileUrl,
        notes: document.getElementById("pro-doc-notes")?.value.trim() || undefined,
      }),
    });
    notify("Document saved");
    ["pro-doc-number", "pro-doc-authority", "pro-doc-issue", "pro-doc-expiry", "pro-doc-notes"].forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.value = "";
    });
    const f = document.getElementById("pro-doc-file");
    if (f) f.value = "";
    await loadPro();
    const tabBtn = document.querySelector("#view-pro .tab-btn[onclick*=\"pro-documents\"]");
    if (tabBtn) switchTab(tabBtn, "pro-documents");
  } catch (error) {
    notify(error.message);
  }
};

window.__renewProDocument = async function renewProDocument(id) {
  try {
    const newExpiry = window.prompt("Enter new expiry date (YYYY-MM-DD):");
    if (!newExpiry || !/^\d{4}-\d{2}-\d{2}$/.test(newExpiry)) {
      notify("Please enter a valid date (YYYY-MM-DD)");
      return;
    }
    await api(`/pro/documents/${id}`, {
      method: "PUT",
      body: JSON.stringify({ expiryDate: new Date(`${newExpiry}T00:00:00`).toISOString() }),
    });
    notify("Document expiry updated");
    await loadPro();
  } catch (error) {
    notify(error.message);
  }
};

window.__submitProTask = async function submitProTask() {
  try {
    const employeeId = document.getElementById("pro-task-emp")?.value;
    const taskType = document.getElementById("pro-task-type")?.value;
    const documentType = document.getElementById("pro-task-doctype")?.value || undefined;
    if (!employeeId || !taskType) {
      notify("Please select employee and task type");
      return;
    }
    await api("/pro/tasks", {
      method: "POST",
      body: JSON.stringify({
        employeeId,
        taskType,
        documentType,
        notes: document.getElementById("pro-task-notes")?.value.trim() || undefined,
      }),
    });
    notify("PRO task created");
    document.getElementById("pro-task-notes").value = "";
    await loadPro();
    const tabBtn = document.querySelector("#view-pro .tab-btn[onclick*=\"pro-tasks\"]");
    if (tabBtn) switchTab(tabBtn, "pro-tasks");
  } catch (error) {
    notify(error.message);
  }
};

window.__advanceProTask = async function advanceProTask(id) {
  try {
    const governmentRef = window.prompt("Government reference number (optional):") || undefined;
    const feeInput = governmentRef !== undefined ? window.prompt("Fee amount for this step (optional, AED):") : undefined;
    const feeAmount = feeInput && !Number.isNaN(Number(feeInput)) ? Number(feeInput) : undefined;
    await api(`/pro/tasks/${id}/advance`, {
      method: "POST",
      body: JSON.stringify({ governmentRef, feeAmount }),
    });
    notify("Task advanced to next stage");
    await loadPro();
  } catch (error) {
    notify(error.message);
  }
};

function wireProForms() {
  const todayIso = new Date().toISOString().slice(0, 10);
  const issue = document.getElementById("pro-doc-issue");
  const expiry = document.getElementById("pro-doc-expiry");
  if (expiry) expiry.min = todayIso;
  if (issue) issue.max = todayIso;
}

async function loadDashboard() {
  const data = await api("/dashboard/overview");
  dashboardCache = data ?? null;
  const statValues = document.querySelectorAll("#view-dashboard .stats-grid .stat-value");
  const statLabels = document.querySelectorAll("#view-dashboard .stats-grid .stat-label");
  const statSubs = document.querySelectorAll("#view-dashboard .stats-grid .stat-sub");
  if (statValues.length >= 4) {
    statValues[0].textContent = String(data.headcount ?? 0);
    statValues[1].textContent = String(data.onLeave ?? 0);
    const payroll = Number(data.monthlyPayroll ?? 0);
    statValues[2].textContent = payroll >= 1000000
      ? `${(payroll / 1000000).toFixed(2)}M`
      : Math.round(payroll).toLocaleString("en-US");
    statValues[3].textContent = String(data.pendingLeaveApprovals ?? 0);
  }
  if (statLabels.length >= 4) {
    statLabels[3].textContent = "Pending Approvals";
  }
  if (statSubs.length >= 4) {
    const headcount = Number(data.headcount ?? 0);
    const onLeave = Number(data.onLeave ?? 0);
    const pendingApprovals = Number(data.pendingLeaveApprovals ?? 0);
    statSubs[1].textContent = headcount ? `${((onLeave / headcount) * 100).toFixed(1)}% of workforce` : "No leave today";
    statSubs[2].textContent = `Current cycle total`;
    statSubs[3].textContent = l1Roles.has(me?.role) ? "Waiting for L1 action" : l2Roles.has(me?.role) ? "Waiting for L2 action" : "Track your leave workflow";
  }
  renderDashboardInsights();
  renderNotifications();
}

function formatDashboardDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Recent";
  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function dashboardRequestDate(request) {
  return request.createdAt || request.updatedAt || request.submittedAt || request.startDate;
}

function formatAed(value, withSign = false) {
  const rounded = Math.round(Number(value ?? 0));
  const abs = Math.abs(rounded).toLocaleString("en-US");
  if (!withSign) return `AED ${abs}`;
  return `${rounded < 0 ? "−" : ""}AED ${abs}`;
}

function renderDashboardInsights() {
  const deptList = document.getElementById("dash-dept-list");
  const alertsList = document.getElementById("dash-alerts");
  const timeline = document.getElementById("dash-timeline");
  const workforceLegend = document.getElementById("dash-workforce-legend");
  const activeCountEl = document.getElementById("dash-active-count");
  const probationCountEl = document.getElementById("dash-probation-count");
  const payrollTitle = document.getElementById("dash-payroll-title");
  const payrollEarnings = document.getElementById("dash-payroll-earnings");
  const payrollDeductions = document.getElementById("dash-payroll-deductions");
  const wpsBadge = document.getElementById("dash-wps-badge");
  const overtimeAmountEl = document.getElementById("dash-overtime-amount");
  const overtimeEmployeesEl = document.getElementById("dash-overtime-employees");
  if (!deptList || !alertsList || !timeline) return;

  const departmentRows = Array.isArray(dashboardCache?.employeesByDept) ? dashboardCache.employeesByDept : [];
  if (!departmentRows.length) {
    deptList.innerHTML = `<div class="text-muted">No department data available yet.</div>`;
  } else {
    const barClasses = ["progress-blue", "progress-accent", "progress-amber", "progress-coral"];
    const maxCount = Math.max(...departmentRows.map((item) => Number(item.count ?? 0)), 1);
    deptList.innerHTML = departmentRows.map((row, index) => {
      const count = Number(row.count ?? 0);
      const width = Math.max(8, Math.round((count / maxCount) * 100));
      return `
        <div>
          <div class="flex-between mb-16" style="margin-bottom:5px;font-size:13px">
            <span>${escapeAttr(row.department ?? "Unassigned")}</span><span class="fw-700">${count}</span>
          </div>
          <div class="progress"><div class="progress-bar ${barClasses[index % barClasses.length]}" style="width:${width}%"></div></div>
        </div>
      `;
    }).join("");
  }

  const pendingApprovals = Number(dashboardCache?.pendingLeaveApprovals ?? 0);
  const onLeave = Number(dashboardCache?.onLeave ?? 0);
  const activeCount = Number(dashboardCache?.activeCount ?? allEmployees.filter((employee) => employee.status === "ACTIVE").length);
  const probationCount = Number(dashboardCache?.probationCount ?? allEmployees.filter((employee) => employee.status === "PROBATION").length);
  const myEmployeeId = me?.employee?.id;
  const myPendingLeaves = myEmployeeId
    ? leaveRequestsCache.filter((request) => request.employeeId === myEmployeeId && (request.status === "PENDING_L1" || request.status === "PENDING_L2")).length
    : 0;
  const alerts = [];

  if (activeCountEl) activeCountEl.textContent = String(activeCount);
  if (probationCountEl) probationCountEl.textContent = String(probationCount);

  if (workforceLegend) {
    const colors = ["var(--accent)", "var(--blue-bright)", "var(--amber)", "var(--coral)", "var(--text-dim)"];
    const nationalityMix = Array.isArray(dashboardCache?.nationalityMix) ? dashboardCache.nationalityMix : [];
    workforceLegend.innerHTML = nationalityMix.length
      ? nationalityMix.map((row, index) => `
          <div class="legend-item">
            <div class="legend-dot" style="background:${colors[index % colors.length]}"></div>
            ${escapeAttr(row.nationality)} (${Number(row.percent ?? 0).toFixed(1)}%)
          </div>
        `).join("")
      : `<div class="text-muted">Nationality mix not available.</div>`;
  }

  const payrollMonth = dashboardCache?.payrollCurrentMonth;
  if (payrollTitle && payrollMonth?.month && payrollMonth?.year) {
    const periodLabel = new Date(payrollMonth.year, payrollMonth.month - 1, 1)
      .toLocaleDateString("en-GB", { month: "long", year: "numeric" });
    payrollTitle.textContent = `Payroll Overview — ${periodLabel}`;
  }
  if (payrollEarnings && payrollMonth) {
    payrollEarnings.innerHTML = `
      <div class="payslip-row"><span>Basic Salaries</span><span>${formatAed(payrollMonth.basic)}</span></div>
      <div class="payslip-row"><span>Housing Allowance</span><span>${formatAed(payrollMonth.housing)}</span></div>
      <div class="payslip-row"><span>Transport</span><span>${formatAed(payrollMonth.transport)}</span></div>
      <div class="payslip-row"><span>Overtime</span><span>${formatAed(payrollMonth.overtime)}</span></div>
      <div class="payslip-row payslip-total"><span>Gross Total</span><span>${formatAed(payrollMonth.grossTotal)}</span></div>
    `;
  }
  if (payrollDeductions && payrollMonth) {
    payrollDeductions.innerHTML = `
      <div class="payslip-row"><span>Total Deductions</span><span style="color:var(--coral)">${formatAed(-Math.abs(payrollMonth.deductions), true)}</span></div>
      <div class="payslip-row payslip-total"><span>Net Pay</span><span>${formatAed(payrollMonth.netPay)}</span></div>
      <div style="margin-top:12px"><div class="badge badge-green" id="dash-wps-badge">Payroll snapshot ready</div></div>
    `;
  }
  const dynamicWpsBadge = document.getElementById("dash-wps-badge") || wpsBadge;
  if (dynamicWpsBadge) {
    dynamicWpsBadge.textContent = payrollMonth?.netPay ? "WPS payroll snapshot generated" : "No payroll records for this period";
  }
  if (overtimeAmountEl) {
    overtimeAmountEl.textContent = formatAed(payrollMonth?.overtime ?? 0).replace("AED ", "");
  }
  if (overtimeEmployeesEl) {
    overtimeEmployeesEl.textContent = String(payrollMonth?.overtimeEmployees ?? 0);
  }

  if (pendingApprovals > 0) {
    alerts.push({
      tone: "success",
      icon: "bi-check2-circle",
      title: `${pendingApprovals} Leave Request${pendingApprovals === 1 ? "" : "s"} Pending`,
      desc: l1Roles.has(me?.role)
        ? "Waiting for your L1 approval."
        : l2Roles.has(me?.role)
          ? "Waiting for your L2 approval."
          : "Approvals are currently in progress.",
    });
  }
  if (myPendingLeaves > 0 && !l1Roles.has(me?.role) && !l2Roles.has(me?.role)) {
    alerts.push({
      tone: "info",
      icon: "bi-hourglass-split",
      title: `${myPendingLeaves} Request${myPendingLeaves === 1 ? "" : "s"} Under Review`,
      desc: "Your leave request is moving through L1/L2 workflow.",
    });
  }
  if (onLeave > 0) {
    alerts.push({
      tone: "warn",
      icon: "bi-calendar-check",
      title: `${onLeave} Employee${onLeave === 1 ? "" : "s"} on Leave Today`,
      desc: "Coverage planning may be required.",
    });
  }
  if (probationCount > 0) {
    alerts.push({
      tone: "info",
      icon: "bi-flag",
      title: `${probationCount} Employee${probationCount === 1 ? "" : "s"} on Probation`,
      desc: "Review probation outcomes and confirmations.",
    });
  }
  if (me?.employee && (!me.employee.bankName || !me.employee.iban)) {
    alerts.push({
      tone: "warn",
      icon: "bi-bank",
      title: "Bank profile incomplete",
      desc: "Update IBAN and Bank Name in your profile.",
    });
  }

  alertsList.innerHTML = (alerts.length ? alerts : [{
    tone: "success",
    icon: "bi-check-circle",
    title: "No active alerts",
    desc: "Everything looks up to date for your scope.",
  }]).slice(0, 5).map((alert) => `
    <div class="alert alert-${alert.tone}">
      <span class="alert-icon"><i class="bi ${alert.icon}"></i></span>
      <div><b>${escapeAttr(alert.title)}</b> ${escapeAttr(alert.desc)}</div>
    </div>
  `).join("");

  const timelineRows = [];
  if (elevatedRoles.has(me?.role) || me?.role === "MANAGER") {
    const recentJoiners = [...allEmployees]
      .filter((employee) => employee.dateOfJoining)
      .sort((a, b) => new Date(b.dateOfJoining).getTime() - new Date(a.dateOfJoining).getTime())
      .slice(0, 2);
    recentJoiners.forEach((employee) => {
      timelineRows.push({
        tone: "green",
        date: new Date(employee.dateOfJoining),
        text: `New joiner <b>${escapeAttr(`${employee.firstName ?? ""} ${employee.lastName ?? ""}`.trim() || "Employee")}</b> added to ${escapeAttr(employee.department ?? "Unassigned")}.`,
      });
    });
  }

  [...leaveRequestsCache]
    .sort((a, b) => new Date(dashboardRequestDate(b)).getTime() - new Date(dashboardRequestDate(a)).getTime())
    .slice(0, 5)
    .forEach((request) => {
      const employeeName = `${request.employee?.firstName ?? ""} ${request.employee?.lastName ?? ""}`.trim() || "Employee";
      const leaveType = request.leaveType?.name ?? "Leave";
      const statusText = formatLeaveStatus(request.status);
      const statusTone = request.status === "APPROVED" ? "green" : request.status === "REJECTED" ? "amber" : "";
      timelineRows.push({
        tone: statusTone,
        date: new Date(dashboardRequestDate(request)),
        text: `<b>${escapeAttr(employeeName)}</b> ${escapeAttr(leaveType)} request marked as ${escapeAttr(statusText)}.`,
      });
    });

  if (dashboardCache?.monthlyPayroll && elevatedRoles.has(me?.role)) {
    timelineRows.push({
      tone: "",
      date: new Date(),
      text: `Monthly payroll snapshot updated — AED <b>${Math.round(Number(dashboardCache.monthlyPayroll ?? 0)).toLocaleString("en-US")}</b>.`,
    });
  }

  timeline.innerHTML = timelineRows
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, 6)
    .map((item) => `
      <div class="tl-item">
        <div class="tl-dot ${item.tone}"></div>
        <div class="tl-date">${escapeAttr(formatDashboardDate(item.date))}</div>
        <div class="tl-text">${item.text}</div>
      </div>
    `)
    .join("");

  if (!timeline.innerHTML) {
    timeline.innerHTML = `<div class="text-muted">No recent activity yet.</div>`;
  }
}

async function loadOffices() {
  const data = await api("/attendance/offices");
  offices = Array.isArray(data) ? data : [];
  populateOfficeOptions();
  renderOfficesTable();
  renderAttendanceMap([]);
  renderSelectedOfficeDetailsMap();
}

function getCurrentLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported in this browser"));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
      },
      (error) => {
        reject(new Error(error.message || "Unable to retrieve location"));
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 5000 },
    );
  });
}

function startAttendanceTracking() {
  if (attendanceTrackingTimer) {
    clearInterval(attendanceTrackingTimer);
  }
  attendanceTrackingTimer = setInterval(async () => {
    try {
      const location = await getCurrentLocation();
      await api("/attendance/ping", {
        method: "POST",
        body: JSON.stringify(location),
      });
      await Promise.all([loadAttendanceStatus(), loadOnlineAttendance()]);
    } catch (_error) {
      // Silent: location permissions can be denied intermittently.
    }
  }, 30000);
}

async function loadAttendanceStatus() {
  const data = await api("/attendance/status");
  attendanceCache = data ?? null;
  const badge = document.getElementById("att-status-badge");
  const workMode = document.getElementById("att-work-mode");
  const officeName = document.getElementById("att-office-name");
  const lastLocation = document.getElementById("att-last-location");
  const geofenceState = document.getElementById("att-geofence-state");
  const policyNote = document.getElementById("att-policy-note");
  const checkInBtn = document.getElementById("att-check-in-btn");
  const checkedInPill = document.getElementById("att-checked-in-pill");
  const checkOutBtn = document.getElementById("att-check-out-btn");
  const headerCheckInBtn = document.getElementById("header-check-in-btn");
  const headerCheckOutBtn = document.getElementById("header-check-out-btn");
  if (!badge || !workMode || !officeName || !lastLocation || !geofenceState || !policyNote) return;

  const active = Boolean(data?.activeSession?.isActive);
  badge.textContent = active ? "Online" : "Offline";
  badge.className = `badge ${active ? "badge-green" : "badge-amber"}`;
  if (checkInBtn) {
    checkInBtn.style.display = active ? "none" : "";
  }
  if (checkedInPill) {
    checkedInPill.style.display = active ? "inline-flex" : "none";
  }
  if (checkOutBtn) {
    checkOutBtn.style.display = active ? "" : "none";
  }
  if (headerCheckInBtn) {
    headerCheckInBtn.style.display = active ? "none" : "";
  }
  if (headerCheckOutBtn) {
    headerCheckOutBtn.style.display = active ? "" : "none";
  }

  const mode = data?.employee?.workMode ?? "OFFICE";
  const office = data?.employee?.office;
  const ping = data?.latestPing;
  updateHeaderLocationFromPing(ping);
  workMode.textContent = formatLabel(mode);
  officeName.textContent = office?.name ?? "Not assigned";
  lastLocation.textContent = ping
    ? `${Number(ping.latitude).toFixed(5)}, ${Number(ping.longitude).toFixed(5)}`
    : "No live ping";
  geofenceState.textContent = ping?.insideGeofence === true
    ? "Inside office geofence"
    : ping?.insideGeofence === false
      ? "Outside office geofence"
      : "Not applicable";

  policyNote.textContent = mode === "OFFICE"
    ? `Auto check-in/out active within ${office?.radiusMeters ?? 500}m geofence of assigned office.`
    : "Check-in allowed from anywhere. Live location is tracked while online.";
}

function ensureAttendanceMap() {
  if (attendanceMap || !window.L) return;
  const mapEl = document.getElementById("att-map");
  if (!mapEl) return;
  attendanceMap = window.L.map(mapEl).setView([25.2048, 55.2708], 10);
  window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "&copy; OpenStreetMap contributors",
  }).addTo(attendanceMap);
}

function renderAttendanceMap(rows) {
  ensureAttendanceMap();
  if (!attendanceMap) return;

  attendanceMapMarkers.forEach((marker) => marker.remove());
  attendanceMapMarkers = [];
  attendanceOfficePins.forEach((marker) => marker.remove());
  attendanceOfficePins = [];
  attendanceOfficeCircles.forEach((circle) => circle.remove());
  attendanceOfficeCircles = [];
  if (attendancePathLine) {
    attendancePathLine.remove();
    attendancePathLine = null;
  }
  if (attendanceDistanceLabel) {
    attendanceDistanceLabel.remove();
    attendanceDistanceLabel = null;
  }

  const office = attendanceCache?.employee?.office;
  const ping = attendanceCache?.latestPing;
  const bounds = [];

  if (office && Number.isFinite(Number(office.latitude)) && Number.isFinite(Number(office.longitude))) {
    const officePin = window.L.marker([office.latitude, office.longitude], {
      icon: window.L.divIcon({
        className: "",
        html: `<div class="office-pulse-marker"></div>`,
        iconSize: [18, 18],
        iconAnchor: [9, 9],
      }),
    }).addTo(attendanceMap);
    officePin.bindPopup(`${escapeAttr(office.name)} center`);
    attendanceOfficePins.push(officePin);

    const circle = window.L.circle([office.latitude, office.longitude], {
      radius: office.radiusMeters ?? 500,
      color: "#ef4444",
      fillColor: "#ef4444",
      fillOpacity: 0.12,
      weight: 2,
      className: "office-geofence-circle",
    }).addTo(attendanceMap);
    circle.bindPopup(`${escapeAttr(office.name)} geofence (${office.radiusMeters ?? 500}m)`);
    attendanceOfficeCircles.push(circle);
    bounds.push([office.latitude, office.longitude]);
  }

  if (ping && Number.isFinite(Number(ping.latitude)) && Number.isFinite(Number(ping.longitude))) {
    const marker = window.L.marker([ping.latitude, ping.longitude], {
      icon: window.L.divIcon({
        className: "",
        html: `<div class="emp-human-marker"><i class="bi bi-person-fill"></i></div>`,
        iconSize: [26, 26],
        iconAnchor: [13, 26],
      }),
    }).addTo(attendanceMap);
    const employeeName = `${me?.employee?.firstName ?? ""} ${me?.employee?.lastName ?? ""}`.trim() || "Employee";
    marker.bindTooltip(`
      <div class="emp-tooltip-title">${escapeAttr(employeeName)}</div>
      <ol class="emp-tooltip-list"><li>1) ${escapeAttr(employeeName)} (${escapeAttr(me?.employee?.employeeCode ?? "—")})</li></ol>
    `, {
      direction: "top",
      offset: [0, -18],
      sticky: true,
      opacity: 1,
      className: "emp-map-tooltip",
    });
    marker.bindPopup(`
      <div style="min-width:190px">
        <div><b>${escapeAttr(employeeName)}</b></div>
        <div>${escapeAttr(me?.employee?.employeeCode ?? "—")} • ${escapeAttr(formatLabel(attendanceCache?.employee?.workMode ?? "OFFICE"))}</div>
        <div>Coords: ${Number(ping.latitude).toFixed(5)}, ${Number(ping.longitude).toFixed(5)}</div>
      </div>
    `);
    attendanceMapMarkers.push(marker);
    bounds.push([ping.latitude, ping.longitude]);
  }

  const otherOnlineRows = (Array.isArray(rows) ? rows : []).filter((row) => {
    const rowEmployeeId = row?.employee?.id;
    const rowPing = row?.latestPing;
    if (!rowPing) return false;
    if (!Number.isFinite(Number(rowPing.latitude)) || !Number.isFinite(Number(rowPing.longitude))) return false;
    return rowEmployeeId && rowEmployeeId !== me?.employee?.id;
  });
  const groupedOthers = groupByCoordinates(otherOnlineRows, (row) => ({
    latitude: row.latestPing.latitude,
    longitude: row.latestPing.longitude,
  }));
  groupedOthers.forEach((group) => {
    const count = group.items.length;
    const marker = window.L.marker([group.latitude, group.longitude], {
      icon: window.L.divIcon({
        className: "",
        html: `<div class="emp-human-marker green"><i class="bi bi-person-fill"></i>${count > 1 ? `<span class="emp-human-count">${count}</span>` : ""}</div>`,
        iconSize: [26, 26],
        iconAnchor: [13, 26],
      }),
    }).addTo(attendanceMap);
    marker.bindTooltip(employeeTooltipHtml(group.items), {
      direction: "top",
      offset: [0, -18],
      sticky: true,
      opacity: 1,
      className: "emp-map-tooltip",
    });
    marker.bindPopup(employeeTooltipHtml(group.items));
    attendanceMapMarkers.push(marker);
    bounds.push([group.latitude, group.longitude]);
  });

  if (office && ping && Number.isFinite(Number(office.latitude)) && Number.isFinite(Number(office.longitude))
    && Number.isFinite(Number(ping.latitude)) && Number.isFinite(Number(ping.longitude))) {
    attendancePathLine = window.L.polyline(
      [[office.latitude, office.longitude], [ping.latitude, ping.longitude]],
      { color: "#ef4444", weight: 2.5, opacity: 0.95, dashArray: "8 8" },
    ).addTo(attendanceMap);
    const distance = Math.round(haversineDistanceMeters(office.latitude, office.longitude, ping.latitude, ping.longitude));
    const midLat = (office.latitude + ping.latitude) / 2;
    const midLng = (office.longitude + ping.longitude) / 2;
    attendanceDistanceLabel = window.L.marker([midLat, midLng], {
      icon: window.L.divIcon({
        className: "",
        html: `<div class="distance-line-label">${distance}m</div>`,
        iconSize: [56, 18],
        iconAnchor: [28, 9],
      }),
      interactive: false,
    }).addTo(attendanceMap);
  }

  setTimeout(() => attendanceMap?.invalidateSize(), 120);

  if (bounds.length) {
    attendanceMap.fitBounds(bounds, { padding: [30, 30], maxZoom: 16 });
  } else {
    attendanceMap.setView([25.2048, 55.2708], 10);
  }
}

async function loadOnlineAttendance() {
  const rows = await api("/attendance/online");
  const tbody = document.getElementById("att-online-body");
  if (!tbody) return;
  const list = Array.isArray(rows) ? rows : [];
  latestOnlineAttendanceRows = list;
  if (!list.length) {
    tbody.innerHTML = `<tr><td colspan="5" class="text-muted">No employees currently online.</td></tr>`;
    renderAttendanceMap([]);
    renderSelectedOfficeDetailsMap();
    return;
  }
  tbody.innerHTML = list.map((row) => {
    const fullName = `${row.employee?.firstName ?? ""} ${row.employee?.lastName ?? ""}`.trim();
    const latestPing = row.latestPing;
    const coords = latestPing ? `${Number(latestPing.latitude).toFixed(5)}, ${Number(latestPing.longitude).toFixed(5)}` : "—";
    const pingTime = latestPing
      ? new Date(latestPing.recordedAt).toLocaleString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })
      : "—";
    return `
      <tr>
        <td>${escapeAttr(fullName)} (${escapeAttr(row.employee?.employeeCode ?? "—")})</td>
        <td>${escapeAttr(formatLabel(row.employee?.workMode ?? "OFFICE"))}</td>
        <td>${escapeAttr(row.office?.name ?? "Remote")}</td>
        <td>${coords}</td>
        <td>${pingTime}</td>
      </tr>
    `;
  }).join("");
  renderAttendanceMap(list);
  renderSelectedOfficeDetailsMap();
}

function monthKeyFromDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

function formatCalendarMonthLabel(date) {
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

function toDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function buildCalendarLeaveStatusMap(gridStartDate, gridEndDateExclusive) {
  const targetEmployeeId = calendarEmployeeId || me?.employee?.id;
  const leaveStatusByDate = new Map();
  if (!targetEmployeeId) return leaveStatusByDate;

  const requests = leaveRequestsCache.filter((request) =>
    request?.employeeId === targetEmployeeId
    && (request?.status === "APPROVED" || request?.status === "PENDING_L1" || request?.status === "PENDING_L2")
  );

  requests.forEach((request) => {
    const start = new Date(request.startDate);
    const end = new Date(request.endDate);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return;
    const rangeStart = start < gridStartDate ? new Date(gridStartDate) : new Date(start);
    const rangeEnd = end >= gridEndDateExclusive
      ? new Date(gridEndDateExclusive.getTime() - 24 * 60 * 60 * 1000)
      : new Date(end);
    if (rangeEnd < rangeStart) return;

    const tone = request.status === "APPROVED" ? "approved" : "pending";
    const cursor = new Date(rangeStart);
    while (cursor <= rangeEnd) {
      const key = toDateKey(cursor);
      const existing = leaveStatusByDate.get(key);
      if (tone === "approved" || !existing) {
        leaveStatusByDate.set(key, tone);
      }
      cursor.setDate(cursor.getDate() + 1);
    }
  });

  return leaveStatusByDate;
}

function ensureCalendarMap() {
  if (calendarMap || !window.L) return;
  const mapEl = document.getElementById("cal-day-map");
  if (!mapEl) return;
  calendarMap = window.L.map(mapEl).setView([25.2048, 55.2708], 10);
  window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "&copy; OpenStreetMap contributors",
  }).addTo(calendarMap);
}

function renderCalendarGrid(monthDate, totalsMap) {
  const monthLabel = document.getElementById("cal-month-label");
  const grid = document.getElementById("cal-grid");
  if (!monthLabel || !grid) return;

  monthLabel.textContent = formatCalendarMonthLabel(monthDate);
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const startOffset = firstDay.getDay();
  const gridStart = new Date(year, month, 1 - startOffset);
  const gridEndExclusive = new Date(gridStart);
  gridEndExclusive.setDate(gridStart.getDate() + 42);
  const leaveStatusByDate = buildCalendarLeaveStatusMap(gridStart, gridEndExclusive);
  const cells = [];

  for (let index = 0; index < 42; index += 1) {
    const current = new Date(gridStart);
    current.setDate(gridStart.getDate() + index);
    const dateKey = toDateKey(current);
    const inCurrentMonth = current.getMonth() === month;
    const totalMinutes = Number(totalsMap.get(dateKey) ?? 0);
    const selected = calendarSelectedDate === dateKey;
    const today = dateKey === toDateKey(new Date());
    const leaveTone = leaveStatusByDate.get(dateKey);
    const leaveClass = leaveTone === "approved" ? "leave-approved" : leaveTone === "pending" ? "leave-pending" : "";
    cells.push(`
      <button
        type="button"
        class="calendar-day ${inCurrentMonth ? "" : "other-month"} ${selected ? "selected" : ""} ${today ? "today" : ""} ${leaveClass}"
        onclick="window.__calendarSelectDate('${dateKey}')"
      >
        <div class="calendar-day-num">${current.getDate()}</div>
        <div class="calendar-day-minutes">${totalMinutes} min</div>
      </button>
    `);
  }
  grid.innerHTML = cells.join("");
}

async function loadCalendarDayRoute(dateKey) {
  const title = document.getElementById("cal-selected-date");
  const summary = document.getElementById("cal-day-summary");
  const timeline = document.getElementById("cal-day-timeline");
  if (title) {
    title.textContent = new Date(`${dateKey}T00:00:00`).toLocaleDateString("en-US", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }
  if (summary) {
    summary.textContent = "Loading route...";
    summary.className = "badge badge-amber";
  }

  const employeeIdQuery = calendarEmployeeId ? `&employeeId=${encodeURIComponent(calendarEmployeeId)}` : "";
  const dayData = await api(`/attendance/calendar/day-route?date=${encodeURIComponent(dateKey)}${employeeIdQuery}`);
  const pings = Array.isArray(dayData?.pings) ? dayData.pings : [];
  const sessions = Array.isArray(dayData?.sessions) ? dayData.sessions : [];
  if (timeline) {
    const events = [];
    sessions.forEach((session) => {
      events.push({
        at: session.checkInAt,
        tone: "green",
        text: `Checked in (${formatLabel(session.checkInMethod ?? "MANUAL")})`,
      });
      if (session.checkOutAt) {
        events.push({
          at: session.checkOutAt,
          tone: "amber",
          text: `Checked out (${formatLabel(session.checkOutMethod ?? "MANUAL")})`,
        });
      } else {
        events.push({
          at: new Date().toISOString(),
          tone: "",
          text: "Session still active (not checked out yet)",
        });
      }
    });
    pings
      .filter((ping) => ["CHECK_IN_BLOCKED_OUTSIDE_GEOFENCE", "MANUAL_LOGOUT_LOCK"].includes(String(ping.eventType)))
      .forEach((ping) => {
        events.push({
          at: ping.recordedAt,
          tone: "amber",
          text: formatLabel(String(ping.eventType ?? "PING")),
        });
      });

    events.sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime());
    if (!events.length) {
      timeline.innerHTML = `<div class="text-muted">No check-in/check-out events for this date.</div>`;
    } else {
      timeline.innerHTML = events.map((event, index) => {
        const prev = index > 0 ? events[index - 1] : null;
        const prevGapMinutes = prev
          ? Math.max(0, Math.round((new Date(event.at).getTime() - new Date(prev.at).getTime()) / 60000))
          : null;
        const gapLine = prevGapMinutes === null
          ? ""
          : `<div class="tl-date">+${prevGapMinutes} min since previous</div>`;
        return `
        <div class="tl-item">
          <div class="tl-dot ${event.tone}"></div>
          <div class="tl-date">${escapeAttr(new Date(event.at).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" }))}</div>
          <div class="tl-text">${escapeAttr(event.text)}</div>
          ${gapLine}
        </div>
      `;
      }).join("");
    }
  }

  ensureCalendarMap();
  if (!calendarMap) return;
  if (calendarRouteLayer) {
    calendarRouteLayer.remove();
    calendarRouteLayer = null;
  }

  const points = pings
    .filter((ping) => Number.isFinite(Number(ping.latitude)) && Number.isFinite(Number(ping.longitude)))
    .map((ping) => [Number(ping.latitude), Number(ping.longitude)]);

  if (!points.length) {
    if (summary) {
      summary.textContent = sessions.length ? "Attendance found, no route points" : "No attendance data";
      summary.className = sessions.length ? "badge badge-blue" : "badge badge-amber";
    }
    calendarMap.setView([25.2048, 55.2708], 10);
    setTimeout(() => calendarMap?.invalidateSize(), 100);
    return;
  }

  const polyline = window.L.polyline(points, {
    color: "#3b82f6",
    weight: 4,
    opacity: 0.85,
  }).addTo(calendarMap);
  const startMarker = window.L.circleMarker(points[0], {
    radius: 6,
    color: "#10b981",
    fillColor: "#10b981",
    fillOpacity: 0.9,
  }).addTo(calendarMap).bindTooltip("Start");
  const endMarker = window.L.circleMarker(points[points.length - 1], {
    radius: 6,
    color: "#ef4444",
    fillColor: "#ef4444",
    fillOpacity: 0.9,
  }).addTo(calendarMap).bindTooltip("End");
  calendarRouteLayer = window.L.featureGroup([polyline, startMarker, endMarker]).addTo(calendarMap);
  calendarMap.fitBounds(polyline.getBounds(), { padding: [24, 24], maxZoom: 17 });
  setTimeout(() => calendarMap?.invalidateSize(), 100);
  if (summary) {
    summary.textContent = `${pings.length} route points`;
    summary.className = "badge badge-green";
  }
}

async function loadCalendarMonth() {
  const month = monthKeyFromDate(calendarCurrentMonth);
  const employeeIdQuery = calendarEmployeeId ? `&employeeId=${encodeURIComponent(calendarEmployeeId)}` : "";
  const monthData = await api(`/attendance/calendar/month?month=${encodeURIComponent(month)}${employeeIdQuery}`);
  const totals = Array.isArray(monthData?.totals) ? monthData.totals : [];
  const totalsMap = new Map(
    totals.map((item) => [String(item.date), Number(item.totalMinutes ?? 0)]),
  );

  if (!calendarSelectedDate || !calendarSelectedDate.startsWith(month)) {
    calendarSelectedDate = `${month}-01`;
  }

  renderCalendarGrid(calendarCurrentMonth, totalsMap);
  await loadCalendarDayRoute(calendarSelectedDate);
  renderCalendarGrid(calendarCurrentMonth, totalsMap);
  const employeeTitle = document.getElementById("cal-employee-title");
  const employeeLabel = document.getElementById("cal-employee-label");
  if (employeeTitle) {
    employeeTitle.textContent = calendarEmployeeName || "My attendance";
  }
  if (employeeLabel) {
    employeeLabel.textContent = `Showing: ${calendarEmployeeName || "My attendance"}`;
  }
}

window.__calendarSelectDate = async function calendarSelectDate(dateKey) {
  calendarSelectedDate = dateKey;
  const [yearText, monthText] = dateKey.split("-");
  const year = Number(yearText);
  const month = Number(monthText);
  if (Number.isFinite(year) && Number.isFinite(month)) {
    calendarCurrentMonth = new Date(year, month - 1, 1);
  }
  await loadCalendarMonth();
};

window.__calendarPrevMonth = async function calendarPrevMonth() {
  calendarCurrentMonth = new Date(calendarCurrentMonth.getFullYear(), calendarCurrentMonth.getMonth() - 1, 1);
  calendarSelectedDate = null;
  await loadCalendarMonth();
};

window.__calendarNextMonth = async function calendarNextMonth() {
  calendarCurrentMonth = new Date(calendarCurrentMonth.getFullYear(), calendarCurrentMonth.getMonth() + 1, 1);
  calendarSelectedDate = null;
  await loadCalendarMonth();
};

function ensureEmployeeLiveMap() {
  if (employeeLiveMap || !window.L) return;
  const mapEl = document.getElementById("emp-live-map");
  if (!mapEl) return;
  employeeLiveMap = window.L.map(mapEl).setView([25.2048, 55.2708], 10);
  window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "&copy; OpenStreetMap contributors",
  }).addTo(employeeLiveMap);
}

window.__viewEmployeeLiveLocation = async function viewEmployeeLiveLocation(employeeId) {
  const employee = allEmployees.find((item) => item.id === employeeId);
  const presence = employeePresenceMap.get(employeeId);
  const meta = document.getElementById("emp-live-map-meta");
  openModal("emp-live-map-modal");
  ensureEmployeeLiveMap();
  if (!employeeLiveMap) return;
  if (employeeLiveMarker) {
    employeeLiveMarker.remove();
    employeeLiveMarker = null;
  }
  const latestPing = presence?.latestPing;
  const name = employee ? `${employee.firstName} ${employee.lastName}`.trim() : "Employee";
  if (!latestPing || !Number.isFinite(Number(latestPing.latitude)) || !Number.isFinite(Number(latestPing.longitude))) {
    if (meta) meta.textContent = `${name}: no live location available right now.`;
    employeeLiveMap.setView([25.2048, 55.2708], 10);
    setTimeout(() => employeeLiveMap?.invalidateSize(), 100);
    return;
  }
  const lat = Number(latestPing.latitude);
  const lng = Number(latestPing.longitude);
  employeeLiveMarker = window.L.marker([lat, lng], {
    icon: window.L.divIcon({
      className: "",
      html: `<div class="emp-human-marker"><i class="bi bi-person-fill"></i></div>`,
      iconSize: [26, 26],
      iconAnchor: [13, 26],
    }),
  }).addTo(employeeLiveMap);
  employeeLiveMarker.bindPopup(`${escapeAttr(name)} • ${presence?.isOnline ? "Checked In" : "Offline"}`).openPopup();
  employeeLiveMap.setView([lat, lng], 16);
  setTimeout(() => employeeLiveMap?.invalidateSize(), 100);
  if (meta) {
    const pingAt = latestPing.recordedAt
      ? new Date(latestPing.recordedAt).toLocaleString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })
      : "Unknown";
    meta.textContent = `${name} • ${presence?.isOnline ? "Checked In" : "Offline"} • Last ping: ${pingAt}`;
  }
};

window.__viewEmployeeCalendar = async function viewEmployeeCalendar(employeeId) {
  const employee = allEmployees.find((item) => item.id === employeeId);
  calendarEmployeeId = employeeId;
  calendarEmployeeName = employee ? `${employee.firstName} ${employee.lastName}`.trim() : "Employee";
  calendarCurrentMonth = new Date();
  calendarSelectedDate = toDateKey(new Date());
  const navItem = document.querySelector(".nav-item[onclick*=\"navigate('calendar'\"]");
  if (typeof window.navigate === "function") {
    window.navigate("calendar", navItem);
  }
  await loadCalendarMonth();
  setTimeout(() => calendarMap?.invalidateSize(), 120);
};

async function loadFaceModels() {
  if (!window.faceapi) {
    throw new Error("Face detection library is unavailable");
  }
  if (!faceModelPromise) {
    const modelBase = "https://justadudewhohacks.github.io/face-api.js/models";
    faceModelPromise = Promise.all([
      window.faceapi.nets.tinyFaceDetector.loadFromUri(modelBase),
      window.faceapi.nets.faceLandmark68TinyNet.loadFromUri(modelBase),
      window.faceapi.nets.faceRecognitionNet.loadFromUri(modelBase),
    ]);
  }
  await faceModelPromise;
}

async function loadFaceStatus() {
  const status = await api("/attendance/face/status");
  const backendEnabled = Boolean(status?.enabled);
  faceConfigCache = {
    enabled: true,
    enrolled: Boolean(status?.enrolled),
    faceEnrolledAt: status?.faceEnrolledAt ?? null,
  };
  const enrollStatus = document.getElementById("face-enroll-status");
  const enrollButton = document.getElementById("face-enroll-btn");
  const updateButton = document.getElementById("face-update-btn");
  if (enrollStatus) {
    enrollStatus.textContent = faceConfigCache.enrolled ? "Enrolled" : "Not enrolled";
    enrollStatus.className = `badge ${faceConfigCache.enrolled ? "badge-green" : "badge-amber"}`;
  }
  if (enrollButton) {
    enrollButton.style.display = faceConfigCache.enrolled ? "none" : "";
  }
  if (updateButton) {
    updateButton.style.display = faceConfigCache.enrolled ? "" : "none";
  }
  if (!backendEnabled) {
    api("/attendance/face/config", {
      method: "PUT",
      body: JSON.stringify({ enabled: true }),
    }).catch(() => {});
  }
}

function setFaceModalStatus(message, tone = "amber") {
  const icon = document.getElementById("face-scan-icon");
  const label = document.getElementById("face-scan-label");
  if (!icon || !label) return;
  const normalizedTone = tone === "green" ? "ready" : tone === "coral" ? "error" : "scanning";
  icon.className = `face-scan-icon ${normalizedTone}`;
  label.textContent = message;
}

function setFaceModalGuide(message) {
  const guide = document.getElementById("face-modal-guide");
  if (guide) guide.textContent = message;
}

function updateFaceAngleProgress(targets, currentIndex, visible) {
  const progress = document.getElementById("face-angle-progress");
  if (!progress) return;
  progress.style.display = visible ? "" : "none";
  if (!visible) {
    progress.innerHTML = "";
    return;
  }
  progress.innerHTML = targets.map((target, index) => {
    const stateClass = index < currentIndex ? "done" : index === currentIndex ? "active" : "";
    return `<span class="face-angle-chip ${stateClass}">${index < currentIndex ? "✓ " : ""}${escapeAttr(target)}</span>`;
  }).join("");
}

function stopFaceModalStream() {
  if (faceDetectionTimer) {
    clearInterval(faceDetectionTimer);
    faceDetectionTimer = null;
  }
  if (faceDetectionFrameId) {
    cancelAnimationFrame(faceDetectionFrameId);
    faceDetectionFrameId = null;
  }
  const video = document.getElementById("face-video");
  const overlay = document.getElementById("face-overlay");
  if (activeFaceStream) {
    activeFaceStream.getTracks().forEach((track) => track.stop());
    activeFaceStream = null;
  }
  if (video) {
    video.pause();
    video.srcObject = null;
  }
  if (overlay) {
    const ctx = overlay.getContext("2d");
    if (ctx) ctx.clearRect(0, 0, overlay.width || 0, overlay.height || 0);
  }
}

function averageDescriptor(descriptors) {
  if (!descriptors.length) return [];
  const length = descriptors[0].length;
  const sums = new Array(length).fill(0);
  descriptors.forEach((descriptor) => {
    for (let index = 0; index < length; index += 1) {
      sums[index] += Number(descriptor[index] ?? 0);
    }
  });
  return sums.map((value) => value / descriptors.length);
}

function detectPose(detection) {
  if (!detection?.landmarks) return "UNKNOWN";
  const leftEye = detection.landmarks.getLeftEye?.();
  const rightEye = detection.landmarks.getRightEye?.();
  const nose = detection.landmarks.getNose?.();
  if (!leftEye?.length || !rightEye?.length || !nose?.length) return "UNKNOWN";
  const leftEyeCenterX = leftEye.reduce((sum, p) => sum + p.x, 0) / leftEye.length;
  const rightEyeCenterX = rightEye.reduce((sum, p) => sum + p.x, 0) / rightEye.length;
  const eyesCenterX = (leftEyeCenterX + rightEyeCenterX) / 2;
  const eyeDistance = Math.max(1, Math.abs(rightEyeCenterX - leftEyeCenterX));
  const noseX = nose[3]?.x ?? nose[0]?.x ?? eyesCenterX;
  const normalizedOffset = (noseX - eyesCenterX) / eyeDistance;
  if (normalizedOffset > 0.08) return "LEFT";
  if (normalizedOffset < -0.08) return "RIGHT";
  return "FRONT";
}

async function openFaceModal(mode = "verify") {
  const modal = document.getElementById("face-modal");
  const video = document.getElementById("face-video");
  const overlay = document.getElementById("face-overlay");
  const title = document.getElementById("face-modal-title");
  if (!modal || !video || !overlay || !title) {
    throw new Error("Face modal is unavailable");
  }

  title.textContent = mode === "enroll" ? "Enroll Face" : "Verify Face";
  setFaceModalGuide(mode === "enroll"
    ? "Automatic multi-angle capture: Front, Left, Right."
    : "Look straight into camera for auto scan.");
  updateFaceAngleProgress(["FRONT", "LEFT", "RIGHT"], 0, mode === "enroll");
  setFaceModalStatus("Scanning", "blue");
  modal.classList.add("open");

  await loadFaceModels();
  activeFaceStream = await navigator.mediaDevices.getUserMedia({
    video: {
      facingMode: "user",
      width: { ideal: 1280 },
      height: { ideal: 720 },
    },
    audio: false,
  });
  video.srcObject = activeFaceStream;
  await new Promise((resolve, reject) => {
    let resolved = false;
    const done = () => {
      if (resolved) return;
      resolved = true;
      resolve(null);
    };
    const fail = () => {
      if (resolved) return;
      resolved = true;
      reject(new Error("Unable to initialize camera stream"));
    };
    video.onloadedmetadata = () => done();
    setTimeout(() => {
      if (!video.videoWidth || !video.videoHeight) {
        fail();
      } else {
        done();
      }
    }, 2500);
  });
  await video.play();

  const context = overlay.getContext("2d");
  const syncOverlaySize = () => {
    overlay.width = video.videoWidth || video.clientWidth || 640;
    overlay.height = video.videoHeight || video.clientHeight || 480;
  };
  syncOverlaySize();
  return new Promise((resolve, reject) => {
    faceCaptureReject = reject;
    const enrollmentTargets = mode === "enroll" ? ["FRONT", "LEFT", "RIGHT"] : ["FRONT"];
    const capturedDescriptors = [];
    let currentTargetIdx = 0;
    let stableFrames = 0;
    let detectionBusy = false;
    let isResolved = false;

    const finalize = (descriptor) => {
      if (isResolved) return;
      isResolved = true;
      faceCaptureReject = null;
      stopFaceModalStream();
      resolve(descriptor);
    };

    const runDetectionFrame = async () => {
      if (!modal.classList.contains("open") || isResolved) return;
      if (!video.videoWidth || !video.videoHeight || !context) {
        setFaceModalStatus("Camera", "amber");
        setFaceModalGuide("Initializing camera stream…");
        faceDetectionFrameId = requestAnimationFrame(runDetectionFrame);
        return;
      }
      if (detectionBusy) {
        faceDetectionFrameId = requestAnimationFrame(runDetectionFrame);
        return;
      }
      detectionBusy = true;
      try {
        syncOverlaySize();
        const detection = await window.faceapi
          .detectSingleFace(video, new window.faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.25 }))
          .withFaceLandmarks(true)
          .withFaceDescriptor();

        context.clearRect(0, 0, overlay.width, overlay.height);

        if (!detection?.descriptor) {
          stableFrames = 0;
          setFaceModalStatus("Scanning", "blue");
          setFaceModalGuide("No face detected. Keep face centered and bright.");
          faceDetectionFrameId = requestAnimationFrame(runDetectionFrame);
          return;
        }

        const { x, y, width, height } = detection.detection.box;
        context.strokeStyle = "#22c55e";
        context.lineWidth = 3;
        context.setLineDash([8, 6]);
        context.strokeRect(x, y, width, height);
        context.setLineDash([]);

        const pose = detectPose(detection);
        const target = enrollmentTargets[currentTargetIdx];
        const poseMatched = pose === target || (mode === "verify" && pose === "FRONT");
        if (!poseMatched) {
          stableFrames = 0;
          setFaceModalStatus("Adjust", "amber");
          setFaceModalGuide(mode === "enroll"
            ? `Turn ${target} and hold steady.`
            : "Look straight into camera.");
          faceDetectionFrameId = requestAnimationFrame(runDetectionFrame);
          return;
        }

        stableFrames += 1;
        if (stableFrames < 8) {
          setFaceModalStatus("Scanning", "blue");
          setFaceModalGuide(mode === "enroll"
            ? `Hold ${target}...`
            : "Hold still for auto-capture...");
          faceDetectionFrameId = requestAnimationFrame(runDetectionFrame);
          return;
        }

        const descriptor = Array.from(detection.descriptor);
        if (mode === "enroll") {
          capturedDescriptors.push(descriptor);
          currentTargetIdx += 1;
          stableFrames = 0;
          updateFaceAngleProgress(enrollmentTargets, currentTargetIdx, true);
          setFaceModalStatus("Captured", "green");
          if (currentTargetIdx < enrollmentTargets.length) {
            setFaceModalGuide(`Captured ${target}. Now turn ${enrollmentTargets[currentTargetIdx]}.`);
            faceDetectionFrameId = requestAnimationFrame(runDetectionFrame);
            return;
          }
          setFaceModalGuide("All angles captured.");
          await new Promise((done) => setTimeout(done, 300));
          finalize(averageDescriptor(capturedDescriptors));
          return;
        }

        setFaceModalStatus("Matched", "green");
        setFaceModalGuide("Face scanned successfully.");
        await new Promise((done) => setTimeout(done, 220));
        finalize(descriptor);
      } catch (_error) {
        stableFrames = 0;
        setFaceModalStatus("Error", "coral");
        setFaceModalGuide("Face engine error. Please retry.");
      } finally {
        detectionBusy = false;
        if (!isResolved) {
          faceDetectionFrameId = requestAnimationFrame(runDetectionFrame);
        }
      }
    };
    faceDetectionFrameId = requestAnimationFrame(runDetectionFrame);
  });
}

window.__closeFaceModal = function closeFaceModal() {
  const modal = document.getElementById("face-modal");
  const reject = faceCaptureReject;
  faceCaptureReject = null;
  stopFaceModalStream();
  if (reject) {
    reject(new Error("Face capture cancelled"));
  }
  modal?.classList.remove("open");
};

async function enrollFaceFlow() {
  const descriptor = await openFaceModal("enroll");
  await api("/attendance/face/enroll", {
    method: "POST",
    body: JSON.stringify({ descriptor }),
  });
  setFaceModalStatus("Enrollment successful", "green");
  await new Promise((resolve) => setTimeout(resolve, 700));
  window.__closeFaceModal();
  await loadFaceStatus();
  notify("Face enrollment completed");
}

async function verifyFaceFlow() {
  const descriptor = await openFaceModal("verify");
  try {
    const result = await api("/attendance/face/verify", {
      method: "POST",
      body: JSON.stringify({ descriptor }),
    });
    setFaceModalStatus("Face matched", "green");
    await new Promise((resolve) => setTimeout(resolve, 650));
    window.__closeFaceModal();
    return result?.faceVerificationToken;
  } catch (error) {
    setFaceModalStatus("Face not matched", "coral");
    await new Promise((resolve) => setTimeout(resolve, 900));
    window.__closeFaceModal();
    throw error;
  }
}

window.__attendanceCheckIn = async function attendanceCheckIn() {
  try {
    await loadFaceStatus();
    let faceVerificationToken;
    if (faceConfigCache.enabled) {
      if (!faceConfigCache.enrolled) {
        notify("Face enrollment required before first check-in");
        await enrollFaceFlow();
      }
      faceVerificationToken = await verifyFaceFlow();
    }
    const location = await getCurrentLocation();
    await api("/attendance/check-in", {
      method: "POST",
      body: JSON.stringify({
        ...location,
        faceVerificationToken,
      }),
    });
    await Promise.all([loadAttendanceStatus(), loadOnlineAttendance()]);
    notify("Checked in successfully");
  } catch (error) {
    await Promise.all([loadAttendanceStatus(), loadOnlineAttendance()]).catch(() => null);
    notify(error.message);
  }
};

window.__attendanceCheckOut = async function attendanceCheckOut() {
  try {
    await loadFaceStatus();
    let faceVerificationToken;
    if (faceConfigCache.enabled) {
      if (!faceConfigCache.enrolled) {
        notify("Face enrollment required before check-out");
        await enrollFaceFlow();
      }
      faceVerificationToken = await verifyFaceFlow();
    }
    const location = await getCurrentLocation().catch(() => null);
    await api("/attendance/check-out", {
      method: "POST",
      body: JSON.stringify({
        ...(location ?? {}),
        faceVerificationToken,
      }),
    });
    await Promise.all([loadAttendanceStatus(), loadOnlineAttendance()]);
    notify("Checked out successfully");
  } catch (error) {
    await Promise.all([loadAttendanceStatus(), loadOnlineAttendance()]).catch(() => null);
    notify(error.message);
  }
};

window.__attendanceRefresh = async function attendanceRefresh() {
  try {
    await Promise.all([loadAttendanceStatus(), loadOnlineAttendance(), loadFaceStatus()]);
    notify("Attendance refreshed");
  } catch (error) {
    notify(error.message);
  }
};

function haversineDistanceMeters(fromLat, fromLng, toLat, toLng) {
  const toRadians = (deg) => (deg * Math.PI) / 180;
  const earthRadius = 6371000;
  const latDiff = toRadians(toLat - fromLat);
  const lngDiff = toRadians(toLng - fromLng);
  const a = Math.sin(latDiff / 2) ** 2
    + Math.cos(toRadians(fromLat)) * Math.cos(toRadians(toLat)) * Math.sin(lngDiff / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadius * c;
}

function groupByCoordinates(items, getCoords) {
  const grouped = new Map();
  items.forEach((item) => {
    const coords = getCoords(item);
    if (!coords) return;
    const lat = Number(coords.latitude);
    const lng = Number(coords.longitude);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;
    const key = `${lat.toFixed(5)}|${lng.toFixed(5)}`;
    if (!grouped.has(key)) {
      grouped.set(key, { latitude: lat, longitude: lng, items: [] });
    }
    grouped.get(key).items.push(item);
  });
  return Array.from(grouped.values());
}

function employeeTooltipHtml(entries) {
  const title = entries.length > 1 ? `Employees at same location (${entries.length})` : "Employee location";
  const list = entries.map((entry, index) => {
    const name = `${entry.employee?.firstName ?? ""} ${entry.employee?.lastName ?? ""}`.trim() || entry.name || "Employee";
    const code = entry.employee?.employeeCode ?? entry.employeeCode ?? "—";
    return `<li>${index + 1}) ${escapeAttr(name)} (${escapeAttr(code)})</li>`;
  }).join("");
  return `
    <div class="emp-tooltip-title">${escapeAttr(title)}</div>
    <ol class="emp-tooltip-list">${list}</ol>
  `;
}

function resetOfficesForm() {
  officeFormEditingId = null;
  const name = document.getElementById("off-name");
  const radius = document.getElementById("off-radius");
  const lat = document.getElementById("off-lat");
  const lng = document.getElementById("off-lng");
  const note = document.getElementById("off-picker-note");
  if (name) name.value = "";
  if (radius) radius.value = "500";
  if (lat) lat.value = "";
  if (lng) lng.value = "";
  if (note) {
    note.textContent = officesPickerEnabled
      ? "Pick mode enabled. Click map to set coordinates."
      : "Pick mode off. Enable and click map to select coordinates.";
  }
}

function renderOfficesTable() {
  const tbody = document.getElementById("offices-table-body");
  if (!tbody) return;
  if (!offices.length) {
    tbody.innerHTML = `<tr><td colspan="4" class="text-muted">No offices configured yet.</td></tr>`;
    return;
  }
  tbody.innerHTML = offices.map((office) => `
    <tr>
      <td><b>${escapeAttr(office.name)}</b></td>
      <td>${Number(office.radiusMeters ?? 500)}m</td>
      <td>${Number(office.latitude).toFixed(5)}, ${Number(office.longitude).toFixed(5)}</td>
      <td>
        <div class="flex gap-8" style="flex-wrap:wrap">
          <button class="btn btn-secondary btn-sm" onclick="window.__officesSelect('${office.id}')">View</button>
          <button class="btn btn-secondary btn-sm" onclick="window.__officesEdit('${office.id}')">Edit</button>
          <button class="btn btn-danger btn-sm" onclick="window.__officesDelete('${office.id}','${escapeAttr(office.name)}')">Delete</button>
        </div>
      </td>
    </tr>
  `).join("");
}

function ensureOfficesMap() {
  if (officesMap || !window.L) return;
  const mapEl = document.getElementById("offices-map");
  if (!mapEl) return;
  officesMap = window.L.map(mapEl).setView([25.2048, 55.2708], 10);
  window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "&copy; OpenStreetMap contributors",
  }).addTo(officesMap);
  officesMap.on("click", (event) => {
    if (!officesPickerEnabled) return;
    const { lat, lng } = event.latlng;
    const latInput = document.getElementById("off-lat");
    const lngInput = document.getElementById("off-lng");
    if (latInput) latInput.value = lat.toFixed(6);
    if (lngInput) lngInput.value = lng.toFixed(6);
    if (officesMapPickerMarker) {
      officesMapPickerMarker.setLatLng([lat, lng]);
    } else {
      officesMapPickerMarker = window.L.marker([lat, lng], { draggable: true }).addTo(officesMap);
      officesMapPickerMarker.on("dragend", () => {
        const pos = officesMapPickerMarker.getLatLng();
        if (latInput) latInput.value = Number(pos.lat).toFixed(6);
        if (lngInput) lngInput.value = Number(pos.lng).toFixed(6);
      });
    }
    notify("Office location selected");
  });
}

function renderSelectedOfficeDetailsMap() {
  ensureOfficesMap();
  if (!officesMap) return;
  officesMapMarkers.forEach((item) => item.remove());
  officesMapMarkers = [];
  if (officesMapOfficeCircle) {
    officesMapOfficeCircle.remove();
    officesMapOfficeCircle = null;
  }
  if (officesMapOfficePin) {
    officesMapOfficePin.remove();
    officesMapOfficePin = null;
  }

  const tagContainer = document.getElementById("off-nearby-tags");
  const office = offices.find((item) => item.id === selectedOfficeId) ?? offices[0];
  if (!office) {
    if (tagContainer) {
      tagContainer.innerHTML = `<span class="badge badge-blue">No office selected</span>`;
    }
    officesMap.setView([25.2048, 55.2708], 10);
    return;
  }
  selectedOfficeId = office.id;

  officesMapOfficePin = window.L.marker([office.latitude, office.longitude], {
    icon: window.L.divIcon({
      className: "",
      html: `<div class="office-pulse-marker"></div>`,
      iconSize: [18, 18],
      iconAnchor: [9, 9],
    }),
  }).addTo(officesMap);
  officesMapOfficePin.bindPopup(`${escapeAttr(office.name)} center`);

  officesMapOfficeCircle = window.L.circle([office.latitude, office.longitude], {
    radius: office.radiusMeters ?? 500,
    color: "#ef4444",
    fillColor: "#ef4444",
    fillOpacity: 0.14,
    weight: 2,
    className: "office-geofence-circle",
  }).addTo(officesMap);
  officesMapOfficeCircle.bindPopup(`${escapeAttr(office.name)} (${office.radiusMeters ?? 500}m geofence)`);

  const nearby = [];
  const highlightNearbyGreen = ["SUPER_ADMIN", "HR", "HR_OFFICER", "MANAGER"].includes(me?.role ?? "");
  latestOnlineAttendanceRows.forEach((row) => {
    const ping = row.latestPing;
    if (!ping) return;
    const distance = haversineDistanceMeters(office.latitude, office.longitude, ping.latitude, ping.longitude);
    if (distance > Math.max((office.radiusMeters ?? 500) * 3, 800)) return;
    const employeeName = `${row.employee?.firstName ?? ""} ${row.employee?.lastName ?? ""}`.trim() || "Employee";
    nearby.push({
      name: employeeName,
      mode: row.employee?.workMode ?? "OFFICE",
      distanceMeters: Math.round(distance),
      latitude: ping.latitude,
      longitude: ping.longitude,
      employeeCode: row.employee?.employeeCode ?? "—",
    });
  });

  nearby.sort((a, b) => a.distanceMeters - b.distanceMeters);
  const groupedNearby = groupByCoordinates(nearby, (item) => ({ latitude: item.latitude, longitude: item.longitude }));
  groupedNearby.forEach((group) => {
    const count = group.items.length;
    const marker = window.L.marker([group.latitude, group.longitude], {
      icon: window.L.divIcon({
        className: "",
        html: `<div class="emp-human-marker ${highlightNearbyGreen ? "green" : ""}"><i class="bi bi-person-fill"></i>${count > 1 ? `<span class="emp-human-count">${count}</span>` : ""}</div>`,
        iconSize: [26, 26],
        iconAnchor: [13, 26],
      }),
    }).addTo(officesMap);
    marker.bindTooltip(employeeTooltipHtml(group.items), {
      direction: "top",
      offset: [0, -18],
      sticky: true,
      opacity: 1,
      className: "emp-map-tooltip",
    });
    marker.bindPopup(employeeTooltipHtml(group.items));
    officesMapMarkers.push(marker);
  });

  if (tagContainer) {
    tagContainer.innerHTML = nearby.length
      ? nearby.slice(0, 20).map((item) => `<span class="badge ${highlightNearbyGreen || item.distanceMeters <= (office.radiusMeters ?? 500) ? "badge-green" : "badge-blue"}">${escapeAttr(item.name)} • ${item.distanceMeters}m</span>`).join("")
      : `<span class="badge badge-blue">No nearby online employees</span>`;
  }

  const bounds = [[office.latitude, office.longitude], ...nearby.map((item) => [item.latitude, item.longitude])];
  officesMap.fitBounds(bounds, { padding: [40, 40], maxZoom: 16 });
  setTimeout(() => officesMap?.invalidateSize(), 120);
}

window.__officesSelect = function officesSelect(officeId) {
  selectedOfficeId = officeId;
  renderSelectedOfficeDetailsMap();
};

window.__officesEdit = function officesEdit(officeId) {
  const office = offices.find((item) => item.id === officeId);
  if (!office) return;
  officeFormEditingId = office.id;
  const name = document.getElementById("off-name");
  const radius = document.getElementById("off-radius");
  const lat = document.getElementById("off-lat");
  const lng = document.getElementById("off-lng");
  if (name) name.value = office.name ?? "";
  if (radius) radius.value = String(office.radiusMeters ?? 500);
  if (lat) lat.value = Number(office.latitude).toFixed(6);
  if (lng) lng.value = Number(office.longitude).toFixed(6);
  selectedOfficeId = office.id;
  renderSelectedOfficeDetailsMap();
  notify(`Editing office: ${office.name}`);
};

window.__officesDelete = async function officesDelete(officeId, officeName) {
  if (!confirm(`Delete office "${officeName}"?`)) return;
  try {
    await api(`/attendance/offices/${officeId}`, { method: "DELETE" });
    if (selectedOfficeId === officeId) selectedOfficeId = null;
    if (officeFormEditingId === officeId) resetOfficesForm();
    await Promise.all([loadOffices(), refreshEmployees()]);
    notify("Office deleted");
  } catch (error) {
    notify(error.message);
  }
};

window.__officesTogglePicker = function officesTogglePicker() {
  officesPickerEnabled = !officesPickerEnabled;
  const note = document.getElementById("off-picker-note");
  if (note) {
    note.textContent = officesPickerEnabled
      ? "Pick mode enabled. Click map to set coordinates."
      : "Pick mode off. Enable and click map to select coordinates.";
  }
  notify(officesPickerEnabled ? "Map picker enabled" : "Map picker disabled");
};

window.__officesSearchLocation = async function officesSearchLocation() {
  try {
    ensureOfficesMap();
    if (!officesMap) {
      notify("Map is not ready yet");
      return;
    }
    const query = document.getElementById("off-map-search")?.value?.trim();
    if (!query) {
      notify("Enter a location to search");
      return;
    }
    const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${encodeURIComponent(query)}`;
    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
      },
    });
    if (!response.ok) {
      throw new Error("Location search failed");
    }
    const results = await response.json();
    if (!Array.isArray(results) || !results.length) {
      notify("No matching location found");
      return;
    }
    const top = results[0];
    const lat = Number(top.lat);
    const lng = Number(top.lon);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      notify("Invalid coordinates returned from search");
      return;
    }
    const latInput = document.getElementById("off-lat");
    const lngInput = document.getElementById("off-lng");
    if (latInput) latInput.value = lat.toFixed(6);
    if (lngInput) lngInput.value = lng.toFixed(6);
    if (officesMapPickerMarker) {
      officesMapPickerMarker.setLatLng([lat, lng]);
    } else {
      officesMapPickerMarker = window.L.marker([lat, lng], { draggable: true }).addTo(officesMap);
      officesMapPickerMarker.on("dragend", () => {
        const pos = officesMapPickerMarker.getLatLng();
        if (latInput) latInput.value = Number(pos.lat).toFixed(6);
        if (lngInput) lngInput.value = Number(pos.lng).toFixed(6);
      });
    }
    officesMap.setView([lat, lng], 15);
    officesMapPickerMarker.openPopup();
    notify("Location found. Adjust marker if needed, then save office.");
  } catch (error) {
    notify(error.message || "Unable to search location");
  }
};

window.__officesSave = async function officesSave() {
  try {
    const isEdit = Boolean(officeFormEditingId);
    const name = document.getElementById("off-name")?.value?.trim();
    const radiusMeters = Number(document.getElementById("off-radius")?.value || 500);
    const latitude = Number(document.getElementById("off-lat")?.value);
    const longitude = Number(document.getElementById("off-lng")?.value);
    if (!name) {
      notify("Please enter office name");
      return;
    }
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      notify("Please pick valid coordinates from map");
      return;
    }
    const payload = {
      name,
      latitude,
      longitude,
      radiusMeters: Number.isFinite(radiusMeters) ? radiusMeters : 500,
      active: true,
    };
    if (officeFormEditingId) {
      await api(`/attendance/offices/${officeFormEditingId}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
    } else {
      await api("/attendance/offices", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    }
    if (officesMapPickerMarker) {
      officesMapPickerMarker.remove();
      officesMapPickerMarker = null;
    }
    officesPickerEnabled = false;
    resetOfficesForm();
    await Promise.all([loadOffices(), refreshEmployees()]);
    notify(isEdit ? "Office updated" : "Office created");
    officeFormEditingId = null;
  } catch (error) {
    notify(error.message);
  }
};

window.__officesResetForm = function officesResetForm() {
  resetOfficesForm();
  if (officesMapPickerMarker) {
    officesMapPickerMarker.remove();
    officesMapPickerMarker = null;
  }
  officesPickerEnabled = false;
};

window.__changeMyPassword = async function changeMyPassword() {
  try {
    const currentPasswordInput = document.getElementById("set-current-password");
    const newPasswordInput = document.getElementById("set-new-password");
    const confirmPasswordInput = document.getElementById("set-confirm-password");
    const currentPassword = currentPasswordInput?.value ?? "";
    const newPassword = newPasswordInput?.value ?? "";
    const confirmPassword = confirmPasswordInput?.value ?? "";

    if (!currentPassword || !newPassword || !confirmPassword) {
      notify("Please fill current, new, and confirm password");
      return;
    }
    if (newPassword.length < 8) {
      notify("New password must be at least 8 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      notify("New password and confirm password do not match");
      return;
    }

    await api("/auth/change-password", {
      method: "POST",
      body: JSON.stringify({
        currentPassword,
        newPassword,
      }),
    });

    if (currentPasswordInput) currentPasswordInput.value = "";
    if (newPasswordInput) newPasswordInput.value = "";
    if (confirmPasswordInput) confirmPasswordInput.value = "";
    notify("Password updated successfully");
  } catch (error) {
    notify(error.message);
  }
};

window.__faceSaveConfig = async function faceSaveConfig() {
  notify("Face verification is mandatory for check-in.");
};

window.__faceEnrollFromSettings = async function faceEnrollFromSettings() {
  try {
    await enrollFaceFlow();
  } catch (error) {
    notify(error.message);
  }
};

window.__faceUpdateFromSettings = async function faceUpdateFromSettings() {
  try {
    await enrollFaceFlow();
    notify("Face data updated");
  } catch (error) {
    notify(error.message);
  }
};

window.__faceResetFromSettings = async function faceResetFromSettings() {
  try {
    await api("/attendance/face/enroll", { method: "DELETE" });
    await loadFaceStatus();
    notify("Face data reset");
  } catch (error) {
    notify(error.message);
  }
};

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

window.addEventListener("resize", () => {
  if (attendanceMap) {
    setTimeout(() => attendanceMap.invalidateSize(), 100);
  }
  if (officesMap) {
    setTimeout(() => officesMap.invalidateSize(), 100);
  }
  if (calendarMap) {
    setTimeout(() => calendarMap.invalidateSize(), 100);
  }
  if (employeeLiveMap) {
    setTimeout(() => employeeLiveMap.invalidateSize(), 100);
  }
});

document.addEventListener("click", (event) => {
  if (event.target?.closest(".emp-action-menu-wrap")) return;
  const portalClick = event.target?.closest("#emp-action-portal");
  if (portalClick) {
    if (event.target.closest(".emp-action-item")) {
      window.__closeEmployeeActionsMenu?.();
    }
    return;
  }
  window.__closeEmployeeActionsMenu?.();
});

window.addEventListener("scroll", () => window.__closeEmployeeActionsMenu?.(), true);
window.addEventListener("resize", () => window.__closeEmployeeActionsMenu?.());

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
    await loadOffices();
    leaveTypes = await api("/leave/types");
    populateLeaveTypes();
    wireLeaveApplyForm();
    wireLeaveBalanceLookup();
    const exitNav = document.querySelector(".nav-item[onclick*=\"navigate('exits'\"]");
    exitNav?.addEventListener("click", () => {
      populateExitEmployeeSelects();
      loadExits().catch((error) => notify(error.message));
    });
    wireAdjustmentForms();
    const payadjustNav = document.querySelector(".nav-item[onclick*=\"navigate('payadjust'\"]");
    payadjustNav?.addEventListener("click", () => {
      populateAdjustmentEmployeeSelects();
      populateAdjustmentCategoryOptions();
      loadAdjustments().catch((error) => notify(error.message));
    });
    wireProForms();
    const proNav = document.querySelector(".nav-item[onclick*=\"navigate('pro'\"]");
    proNav?.addEventListener("click", () => {
      populateProEmployeeSelects();
      populateProDocTypeSelects();
      loadPro().catch((error) => notify(error.message));
    });
    wireEmployeeCreation();
    wireEmployeeFilters();
    document.getElementById("face-modal")?.addEventListener("click", (event) => {
      if (event.target?.id === "face-modal") {
        window.__closeFaceModal();
      }
    });
    await Promise.all([loadDashboard(), refreshEmployees(), loadLeaveRequests(), loadEss(), loadAttendanceStatus(), loadOnlineAttendance(), loadFaceStatus()]);
    populateExitEmployeeSelects();
    loadExits().catch(() => null);
    populateAdjustmentEmployeeSelects();
    loadAdjustmentMeta().catch(() => null);
    loadAdjustments().catch(() => null);
    populateProEmployeeSelects();
    loadProMeta().catch(() => null);
    loadPro().catch(() => null);
    const attendanceNav = document.querySelector(".nav-item[onclick*=\"navigate('attendance'\"]");
    attendanceNav?.addEventListener("click", () => {
      Promise.all([loadAttendanceStatus(), loadOnlineAttendance()])
        .catch((error) => notify(error.message))
        .finally(() => {
          setTimeout(() => attendanceMap?.invalidateSize(), 150);
        });
    });
    const calendarNav = document.querySelector(".nav-item[onclick*=\"navigate('calendar'\"]");
    calendarNav?.addEventListener("click", () => {
      calendarEmployeeId = null;
      calendarEmployeeName = null;
      calendarCurrentMonth = new Date();
      calendarSelectedDate = toDateKey(new Date());
      loadCalendarMonth().catch((error) => notify(error.message));
      setTimeout(() => calendarMap?.invalidateSize(), 120);
    });
    if (document.getElementById("view-calendar")?.classList.contains("active")) {
      await loadCalendarMonth();
      setTimeout(() => calendarMap?.invalidateSize(), 120);
    }
    if (document.getElementById("view-attendance")?.classList.contains("active")) {
      await Promise.all([loadAttendanceStatus(), loadOnlineAttendance()]);
      setTimeout(() => attendanceMap?.invalidateSize(), 150);
    }
    startAttendanceTracking();
    loadProfile();
    resetEmployeeModalForm();
    notify("Live HRMS data connected");
  } catch (error) {
    notify(error.message);
  }
}

document.addEventListener("DOMContentLoaded", start);
