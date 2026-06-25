const API_BASE = import.meta.env.VITE_API_URL || "/api";
let token = localStorage.getItem("hrms_token");
let me = null;
let leaveTypes = [];
let employees = [];
let allEmployees = [];
let offices = [];
let editingEmployeeId = null;
let managerSearchTerm = "";
const elevatedRoles = new Set(["SUPER_ADMIN", "HR", "HR_OFFICER"]);
let publicMasterConfig = null;
let masterDataCache = null;
let pendingMasterDataLoad = false;
const individualContributorRoles = new Set(["EMPLOYEE", "LABOUR", "STAFF"]);
const l1Roles = new Set(["MANAGER"]);
const l2Roles = new Set(["HR", "HR_OFFICER", "SUPER_ADMIN"]);

function isIndividualContributor(role) {
  return individualContributorRoles.has(role ?? "");
}

function canVoidActingColleague(role) {
  return role === "LABOUR" || role === "STAFF";
}

function myEmployeeId() {
  return me?.employee?.id ?? me?.id ?? "";
}

function canViewAirTicketForEmployee(employeeId) {
  const myId = myEmployeeId();
  return elevatedRoles.has(me?.role) || Boolean(employeeId && myId && employeeId === myId);
}

function formatAirTicketSummary(request) {
  if (request.status === "APPROVED") {
    if (request.airTicketEligible && request.airTicketFare != null) {
      return `<span class="badge badge-green">AED ${Number(request.airTicketFare).toLocaleString()}</span>`;
    }
    if (request.airTicketEligible === false) {
      return `<span class="text-muted" style="font-size:11px">Not eligible</span>`;
    }
  }

  const preview = request.airTicketPreview;
  if (!preview) return `<span class="text-muted">—</span>`;
  if (preview.eligible && preview.fare != null) {
    return `<span class="badge badge-green">AED ${Number(preview.fare).toLocaleString()}</span><div class="text-muted" style="font-size:11px">${escapeAttr(preview.country ?? "")} · ${escapeAttr((preview.roleBand ?? "STAFF").toLowerCase())}</div>`;
  }
  return `<span class="text-muted" style="font-size:11px">${escapeAttr(preview.reason ?? "Not eligible")}</span>`;
}

const ACTING_VOID_VALUE = "__VOID__";

const individualContributorViews = [
  "dashboard", "leave", "exits", "pro", "documents", "profile", "settings",
];

const MOBILE_BOTTOM_PREFERRED = [
  "dashboard", "attendance", "leave", "employees", "calendar", "documents", "profile",
];

const SIDEBAR_VIEW_ORDER = [
  "dashboard", "employees", "leave", "exits", "clearance", "payadjust",
  "attendance", "calendar", "documents", "profile", "offices", "pro", "masterdata", "settings",
];

const MOBILE_TAB_META = {
  dashboard: { label: "Home", icon: "bi-house-door" },
  employees: { label: "Team", icon: "bi-people" },
  leave: { label: "Leave", icon: "bi-calendar2-week" },
  exits: { label: "Exits", icon: "bi-box-arrow-right" },
  clearance: { label: "Clearance", icon: "bi-clipboard-check" },
  payadjust: { label: "Pay", icon: "bi-sliders" },
  attendance: { label: "Attendance", icon: "bi-geo-alt" },
  calendar: { label: "Calendar", icon: "bi-calendar3" },
  documents: { label: "Docs", icon: "bi-folder2-open" },
  profile: { label: "Profile", icon: "bi-person" },
  offices: { label: "Offices", icon: "bi-buildings" },
  pro: { label: "PRO", icon: "bi-passport" },
  masterdata: { label: "Master", icon: "bi-sliders" },
  settings: { label: "Settings", icon: "bi-gear" },
};

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
let calendarDayCache = null;
let calendarShowPingDetails = false;
let lateJoinersMonth = new Date();
let lateJoinersCache = [];
const ATTENDANCE_PING_INTERVAL_MS = 30 * 60 * 1000;

const CALENDAR_SIGNIFICANT_PING_TYPES = new Set([
  "CHECK_IN_BLOCKED_OUTSIDE_GEOFENCE",
  "MANUAL_LOGOUT_LOCK",
  "CHECK_IN_WINDOW_CLOSED",
]);
const CALENDAR_SESSION_BOUNDARY_PING_TYPES = new Set([
  "MANUAL_CHECK_IN",
  "MANUAL_CHECK_OUT",
  "AUTO_CHECK_IN",
  "AUTO_CHECK_OUT",
  "AUTO_CHECK_OUT_TIME",
]);
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

async function reverseGeocodeLocation(latitude, longitude) {
  const key = `${Number(latitude).toFixed(4)},${Number(longitude).toFixed(4)}`;
  if (headerLocationCache.has(key)) {
    return headerLocationCache.get(key);
  }

  const response = await fetch(
    `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(latitude)}&lon=${encodeURIComponent(longitude)}&zoom=16&addressdetails=1`,
    { headers: { Accept: "application/json" } },
  );
  if (!response.ok) {
    throw new Error("Unable to resolve current location");
  }
  const payload = await response.json();
  const address = payload?.address ?? {};
  const coordFallback = `${Number(latitude).toFixed(4)}, ${Number(longitude).toFixed(4)}`;
  const geoTag = address.city
    || address.town
    || address.village
    || address.suburb
    || address.neighbourhood
    || address.state
    || payload?.name
    || (typeof payload?.display_name === "string" ? payload.display_name.split(",")[0] : "")
    || coordFallback;
  const geoAddress = typeof payload?.display_name === "string" ? payload.display_name : null;
  const resolved = { geoTag, geoAddress };
  headerLocationCache.set(key, resolved);
  return resolved;
}

async function reverseGeocodeLocationName(latitude, longitude) {
  const resolved = await reverseGeocodeLocation(latitude, longitude);
  return resolved.geoTag;
}

function formatPingLocation(ping) {
  if (!ping) return "—";
  if (ping.geoTag) {
    const coords = Number.isFinite(Number(ping.latitude)) && Number.isFinite(Number(ping.longitude))
      ? `${Number(ping.latitude).toFixed(5)}, ${Number(ping.longitude).toFixed(5)}`
      : null;
    return coords ? `${ping.geoTag} (${coords})` : ping.geoTag;
  }
  if (Number.isFinite(Number(ping.latitude)) && Number.isFinite(Number(ping.longitude))) {
    return `${Number(ping.latitude).toFixed(5)}, ${Number(ping.longitude).toFixed(5)}`;
  }
  return "—";
}

function updateHeaderLocationFromPing(ping) {
  if (!ping || !Number.isFinite(Number(ping.latitude)) || !Number.isFinite(Number(ping.longitude))) {
    setHeaderLocationLabel("Location unavailable");
    return;
  }
  if (ping.geoTag) {
    setHeaderLocationLabel(ping.geoTag);
    return;
  }
  const lat = Number(ping.latitude);
  const lng = Number(ping.longitude);
  const cacheKey = `${lat.toFixed(4)},${lng.toFixed(4)}`;
  if (headerLocationCache.has(cacheKey)) {
    setHeaderLocationLabel(headerLocationCache.get(cacheKey).geoTag);
    return;
  }

  const seq = ++headerLocationLookupSeq;
  setHeaderLocationLabel("Locating...");
  reverseGeocodeLocation(lat, lng)
    .then((resolved) => {
      if (seq !== headerLocationLookupSeq) return;
      setHeaderLocationLabel(resolved.geoTag);
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

  const pendingRequests = leaveRequestsCache.filter((item) =>
    ["PENDING_L1", "PENDING_ACTING", "PENDING_L2"].includes(item.status),
  );
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

  const lateAttendance = dashboardCache?.lateAttendance ?? attendanceCache?.lateAttendance;
  if (lateAttendance?.warningActive) {
    entries.push({
      icon: "bi-alarm",
      tone: "warn",
      title: "Late check-in warning",
      desc: `You have checked in late ${lateAttendance.monthlyLateCount} time(s) this month (limit: ${lateAttendance.threshold}). Please arrive on time.`,
      time: "Action needed",
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
      case "NEGOTIATION":
      case "PENDING":
        return record.assignedApproverId === myEmployeeId
          || record.employee?.managerId === myEmployeeId
          || elevatedRoles.has(me.role);
      case "LM_APPROVED":
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

  const myPendingClearance = (clearanceTasksCache ?? []).filter((task) => {
    if (task.status === "COMPLETED") return false;
    if (task.department === "ADMIN" || task.department === "PRO" || task.department === "HR") {
      return elevatedRoles.has(me.role);
    }
    return task.assignedManagerId === myEmployeeId;
  });
  if (myPendingClearance.length && (me.role === "MANAGER" || elevatedRoles.has(me.role))) {
    entries.push({
      icon: "bi-clipboard-check",
      tone: "warn",
      title: `${myPendingClearance.length} Clearance Task(s) Pending`,
      desc: "Complete clearance items with a note on the Clearance page.",
      time: "Live",
    });
  }

  const pendingFinanceLoans = (loansCache ?? []).filter((loan) => loan.status === "PENDING_FINANCE");
  if (pendingFinanceLoans.length && isFinanceManagerUser()) {
    entries.push({
      icon: "bi-cash-coin",
      tone: "warn",
      title: `${pendingFinanceLoans.length} Loan/Advance Request(s) — Finance`,
      desc: "Review and approve with a note on Pay Adjustments.",
      time: "Live",
    });
  }
  const pendingHrLoans = (loansCache ?? []).filter((loan) => loan.status === "PENDING_HR");
  if (pendingHrLoans.length && canHrApproveLoan()) {
    entries.push({
      icon: "bi-cash-coin",
      tone: "warn",
      title: `${pendingHrLoans.length} Loan/Advance Request(s) — HR`,
      desc: "Final approval with a note on Pay Adjustments.",
      time: "Live",
    });
  }

  const expiringDocs = getExpiringDocuments();
  if (expiringDocs.length) {
    const expiredCount = expiringDocs.filter((doc) => doc.computedStatus === "EXPIRED").length;
    const soonCount = expiringDocs.length - expiredCount;
    entries.push({
      icon: "bi-passport",
      tone: "warn",
      title: documentExpiryAlertTitle(expiringDocs.length),
      desc: expiredCount
        ? `${soonCount} expiring soon, ${expiredCount} already expired — review in Documents.`
        : "Passport, visa, Emirates ID and other documents need renewal attention.",
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

async function loadPublicMasterConfig() {
  try {
    publicMasterConfig = await api("/master/public-config");
  } catch {
    publicMasterConfig = null;
  }
  return publicMasterConfig;
}

function populateAssignableRoles() {
  const select = document.getElementById("emp-user-role");
  if (!select) return;
  const roles = publicMasterConfig?.roles?.filter((role) => role.assignable) ?? [];
  if (!roles.length) return;
  const current = select.value;
  select.innerHTML = roles.map((role) => `<option value="${escapeAttr(role.code)}">${escapeAttr(role.label)} (${escapeAttr(role.code)})</option>`).join("");
  if (current && roles.some((role) => role.code === current)) {
    select.value = current;
  }
}

async function applyRoleBasedUi() {
  if (!publicMasterConfig) {
    await loadPublicMasterConfig();
  }
  populateAssignableRoles();
  const role = me?.role ?? "EMPLOYEE";
  const fallbackRoleViews = {
    SUPER_ADMIN: ["dashboard", "employees", "leave", "exits", "clearance", "payadjust", "pro", "documents", "attendance", "calendar", "offices", "masterdata", "profile", "settings"],
    CEO: ["dashboard", "employees", "leave", "exits", "clearance", "payadjust", "pro", "documents", "attendance", "calendar", "offices", "profile", "settings"],
    HR: ["dashboard", "employees", "leave", "exits", "clearance", "payadjust", "pro", "documents", "attendance", "calendar", "offices", "masterdata", "profile", "settings"],
    HR_OFFICER: ["dashboard", "employees", "leave", "exits", "clearance", "payadjust", "pro", "documents", "attendance", "calendar", "offices", "profile", "settings"],
    PRO: ["dashboard", "employees", "pro", "documents", "profile", "settings"],
    MANAGER: ["dashboard", "employees", "leave", "exits", "clearance", "pro", "documents", "profile"],
    EMPLOYEE: individualContributorViews,
    LABOUR: individualContributorViews,
    STAFF: individualContributorViews,
  };
  const configuredRole = publicMasterConfig?.roles?.find((item) => item.code === role);
  const allowed = new Set(
    configuredRole?.allowedViews
      ?? fallbackRoleViews[role]
      ?? (isIndividualContributor(role) ? individualContributorViews : fallbackRoleViews.EMPLOYEE),
  );
  const allViews = publicMasterConfig?.views ?? [
    "dashboard", "employees", "leave", "exits", "clearance", "payadjust", "pro",
    "documents", "attendance", "calendar", "offices", "masterdata", "profile", "settings",
  ];
  allViews.forEach((view) => setViewVisibility(view, allowed.has(view)));

  const activeView = document.querySelector(".view.active")?.id?.replace("view-", "");
  if (!activeView || !allowed.has(activeView)) {
    const fallbackView = configuredRole?.allowedViews?.[0] ?? fallbackRoleViews[role]?.[0] ?? "leave";
    const navItem = document.querySelector(`.nav-item[onclick*="navigate('${fallbackView}'"]`);
    if (typeof window.navigate === "function") {
      window.navigate(fallbackView, navItem);
    }
  }

  const pendingApprovalsTab = document.querySelector("button[onclick*=\"leave-pending\"]");
  if (pendingApprovalsTab) {
    pendingApprovalsTab.style.display = isIndividualContributor(role) ? "none" : "";
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
    loanFormCard.style.display = "";
  }
  const canManagePro = elevatedRoles.has(role) || role === "PRO";
  ["pro-doc-new-tab-btn", "pro-task-new-tab-btn"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.style.display = canManagePro ? "" : "none";
  });
  const liveWorkforceCard = document.getElementById("att-live-workforce-card");
  if (liveWorkforceCard) {
    liveWorkforceCard.style.display = isIndividualContributor(role) ? "none" : "";
  }
  applyDocumentsPageRoleUi();
  applyEmployeeDashboardUi();

  mobileNavAllowedViews = allowed;
  syncMobileBottomTabs(allowed);
  syncSidebarSectionVisibility();
}

let mobileNavAllowedViews = null;

function isMobileNavViewport() {
  return window.innerWidth <= 900;
}

function isSidebarNavItemVisible(item) {
  if (item.style.display === "none") return false;
  if (isMobileNavViewport() && item.classList.contains("nav-in-bottom-bar")) return false;
  return true;
}

function syncSidebarSectionVisibility() {
  document.querySelectorAll(".sidebar-nav .nav-section").forEach((section) => {
    const hasVisibleItems = Array.from(section.querySelectorAll(".nav-item")).some(isSidebarNavItemVisible);
    section.style.display = hasVisibleItems ? "" : "none";
  });
}

function refreshMobileSidebarNav() {
  if (mobileNavAllowedViews) {
    syncMobileBottomTabs(mobileNavAllowedViews);
  } else {
    syncSidebarSectionVisibility();
  }
}

function pickMobileBottomTabs(allowed) {
  const picked = [];
  const add = (view) => {
    if (picked.length >= 5 || !allowed.has(view) || picked.includes(view)) return;
    picked.push(view);
  };
  MOBILE_BOTTOM_PREFERRED.forEach(add);
  SIDEBAR_VIEW_ORDER.forEach(add);
  return picked;
}

function syncMobileBottomTabs(allowed) {
  const nav = document.getElementById("mobile-bottom-nav");
  if (!nav) return;

  const tabs = pickMobileBottomTabs(allowed);
  const activeView = document.querySelector(".view.active")?.id?.replace("view-", "");

  nav.innerHTML = "";
  nav.style.gridTemplateColumns = `repeat(${Math.max(tabs.length, 1)}, 1fr)`;

  tabs.forEach((view) => {
    const meta = MOBILE_TAB_META[view] ?? { label: view, icon: "bi-circle" };
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = `bottom-tab${view === activeView ? " active" : ""}`;
    btn.dataset.view = view;
    btn.onclick = () => {
      if (typeof window.navigateFromBottomTab === "function") {
        window.navigateFromBottomTab(view);
      }
    };
    btn.innerHTML = `<i class="bi ${meta.icon}"></i><span class="bottom-tab-label">${escapeAttr(meta.label)}</span>`;
    nav.appendChild(btn);
  });

  const bottomViews = new Set(tabs);
  document.querySelectorAll(".sidebar-nav .nav-item").forEach((item) => {
    const match = item.getAttribute("onclick")?.match(/navigate\('([^']+)'/);
    const view = match?.[1];
    item.classList.toggle("nav-in-bottom-bar", Boolean(view && bottomViews.has(view)));
  });

  if (activeView && typeof window.updateBottomTabActive === "function") {
    window.updateBottomTabActive(activeView);
  }

  syncSidebarSectionVisibility();
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

async function requestPasswordCode(email) {
  return api("/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

async function completePasswordReset(email, code, newPassword) {
  const result = await api("/auth/reset-password", {
    method: "POST",
    body: JSON.stringify({ email, code, newPassword }),
  });
  token = result.token;
  localStorage.setItem("hrms_token", token);
  return result;
}

function showLoginModal() {
  return new Promise((resolve) => {
    const existing = document.getElementById("hrms-login-modal");
    if (existing) existing.remove();

    let step = "email";
    let emailValue = "";

    const wrapper = document.createElement("div");
    wrapper.id = "hrms-login-modal";
    wrapper.className = "modal-overlay open";

    const render = () => {
      const passwordBlock = step === "password" ? `
          <div class="form-group">
            <label for="login-password">Password</label>
            <div class="password-field">
              <input id="login-password" type="password" value="" placeholder="Enter your password" autocomplete="current-password">
              <button type="button" class="password-toggle-btn" id="login-password-toggle" aria-label="Show password">
                <i class="bi bi-eye"></i>
              </button>
            </div>
            <div class="login-password-meta">
              <button type="button" class="btn btn-link btn-sm" id="login-forgot-btn">Forgot password?</button>
            </div>
          </div>` : "";

      const resetBlock = step === "setup" || step === "reset" ? `
          <div class="form-group">
            <label for="login-code">Verification Code</label>
            <input id="login-code" type="text" inputmode="numeric" maxlength="6" placeholder="6-digit code from email">
          </div>
          <div class="form-group">
            <label for="login-new-password">New Password</label>
            <input id="login-new-password" type="password" placeholder="Minimum 8 characters" autocomplete="new-password">
          </div>
          <div class="form-group">
            <label for="login-confirm-password">Confirm Password</label>
            <input id="login-confirm-password" type="password" placeholder="Re-enter new password" autocomplete="new-password">
          </div>` : "";

      const submitLabel = step === "email"
        ? "Continue"
        : step === "password"
          ? "Sign In"
          : step === "setup"
            ? "Create Password & Sign In"
            : "Reset Password & Sign In";

      const emailField = `
          <div class="form-group">
            <label for="login-email">Email</label>
            <input id="login-email" class="${step !== "email" ? "login-email-readonly" : ""}" type="email" value="${emailValue.replace(/"/g, "&quot;")}" placeholder="name@company.com" autocomplete="username" ${step !== "email" ? "readonly" : ""}>
          </div>`;

      wrapper.innerHTML = `
      <div class="modal login-modal">
        <div class="login-brand">
          <img class="theme-logo-dark" src="/brand/logo-mark-light-sm.png" alt="">
          <img class="theme-logo-light" src="/brand/logo-mark-sm.png" alt="">
          <div>
            <div class="login-brand-name">Mulk HRMS</div>
            <div class="login-brand-tag">Employee portal</div>
          </div>
        </div>
        <p id="login-info" class="login-info" role="status"></p>
        <div class="login-form">
          ${emailField}
          ${passwordBlock}
          ${resetBlock}
        </div>
        <div id="login-error" class="login-error" role="alert"></div>
        <div class="login-actions">
          ${step === "setup" ? '<button type="button" class="btn btn-secondary btn-sm" id="login-send-code-btn">Send Verification Code</button>' : ""}
          <button type="button" class="btn btn-primary" id="login-submit-btn">${submitLabel}</button>
          ${step !== "email" ? '<button type="button" class="btn btn-link btn-sm" id="login-back-btn">Use a different email</button>' : ""}
        </div>
      </div>`;

      const submitBtn = wrapper.querySelector("#login-submit-btn");
      const errorEl = wrapper.querySelector("#login-error");
      const infoEl = wrapper.querySelector("#login-info");

      const showError = (message) => {
        errorEl.textContent = message;
        errorEl.style.display = "block";
      };
      const showInfo = (message) => {
        if (!infoEl) return;
        infoEl.textContent = message;
        infoEl.style.display = message ? "block" : "none";
      };

      const passwordToggle = wrapper.querySelector("#login-password-toggle");
      passwordToggle?.addEventListener("click", () => {
        const passwordInput = wrapper.querySelector("#login-password");
        if (!passwordInput) return;
        const showing = passwordInput.type === "text";
        passwordInput.type = showing ? "password" : "text";
        passwordToggle.innerHTML = showing ? '<i class="bi bi-eye"></i>' : '<i class="bi bi-eye-slash"></i>';
      });

      wrapper.querySelector("#login-back-btn")?.addEventListener("click", () => {
        step = "email";
        emailValue = "";
        render();
      });

      wrapper.querySelector("#login-forgot-btn")?.addEventListener("click", async () => {
        submitBtn.disabled = true;
        errorEl.style.display = "none";
        try {
          const result = await requestPasswordCode(emailValue);
          step = "reset";
          render();
          showInfo(result.message);
        } catch (error) {
          showError(error.message || "Unable to send verification code");
        } finally {
          submitBtn.disabled = false;
        }
      });

      wrapper.querySelector("#login-send-code-btn")?.addEventListener("click", async () => {
        submitBtn.disabled = true;
        errorEl.style.display = "none";
        try {
          const result = await requestPasswordCode(emailValue);
          showInfo(result.message);
        } catch (error) {
          showError(error.message || "Unable to send verification code");
        } finally {
          submitBtn.disabled = false;
        }
      });

      submitBtn.addEventListener("click", async () => {
        errorEl.style.display = "none";
        submitBtn.disabled = true;
        submitBtn.textContent = "Please wait…";

        try {
          if (step === "email") {
            emailValue = wrapper.querySelector("#login-email")?.value.trim() ?? "";
            if (!emailValue) {
              showError("Email is required.");
              return;
            }
            const status = await api("/auth/account-status", {
              method: "POST",
              body: JSON.stringify({ email: emailValue }),
            });
            if (status.status === "not_found") {
              showError("No account found for this email.");
              return;
            }
            if (status.status === "disabled") {
              showError("This account is disabled. Contact HR.");
              return;
            }
            if (status.status === "setup_required") {
              step = "setup";
              render();
              showInfo("No password is set yet. Click Send Verification Code to create one.");
              return;
            }
            step = "password";
            render();
            wrapper.querySelector("#login-password")?.focus();
            return;
          }

          if (step === "password") {
            const password = wrapper.querySelector("#login-password")?.value ?? "";
            if (!password) {
              showError("Password is required.");
              return;
            }
            await login(emailValue, password);
            wrapper.remove();
            resolve();
            return;
          }

          const code = wrapper.querySelector("#login-code")?.value.trim() ?? "";
          const newPassword = wrapper.querySelector("#login-new-password")?.value ?? "";
          const confirmPassword = wrapper.querySelector("#login-confirm-password")?.value ?? "";
          if (!/^\d{6}$/.test(code)) {
            showError("Enter the 6-digit verification code from your email.");
            return;
          }
          if (newPassword.length < 8) {
            showError("Password must be at least 8 characters.");
            return;
          }
          if (newPassword !== confirmPassword) {
            showError("Passwords do not match.");
            return;
          }
          await completePasswordReset(emailValue, code, newPassword);
          wrapper.remove();
          resolve();
        } catch (error) {
          showError(error.message || "Unable to sign in");
        } finally {
          submitBtn.disabled = false;
          submitBtn.textContent = step === "email"
            ? "Continue"
            : step === "password"
              ? "Sign In"
              : step === "setup"
                ? "Create Password & Sign In"
                : "Reset Password & Sign In";
        }
      });

      wrapper.querySelector("#login-email")?.focus();
    };

    document.body.appendChild(wrapper);
    render();
  });
}

async function login(email, password) {
  const loginResponse = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const loginData = await loginResponse.json().catch(() => ({}));
  if (!loginResponse.ok) {
    throw new Error(loginData.message || "Invalid credentials");
  }

  token = loginData.token;
  localStorage.setItem("hrms_token", token);
}

async function bootstrapAuth() {
  if (!token) {
    await showLoginModal();
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
    "emp-full-name", "emp-code", "emp-legacy-id", "emp-dob", "emp-mobile", "emp-email", "emp-designation",
    "emp-join-date", "emp-basic-salary", "emp-gross-salary", "emp-ctc-month", "emp-ctc-year", "emp-emirates-id",
    "emp-passport", "emp-iban", "emp-bank-name", "emp-labour-card", "emp-line-manager-search", "emp-login-email",
    "emp-login-password", "emp-office-id", "emp-category", "emp-sub-category", "emp-grade", "emp-employee-type",
    "emp-business-unit", "emp-division", "emp-work-location", "emp-work-country", "emp-payroll-type",
    "emp-payroll-status", "emp-payroll-division", "emp-joining-month", "emp-probation-status", "emp-probation-completion",
    "emp-conveyance", "emp-fixed-ot", "emp-food", "emp-housing", "emp-other-allow", "emp-overseas", "emp-performance",
    "emp-petrol", "emp-risk", "emp-social-insurance", "emp-telephone", "emp-transport", "emp-vehicle", "emp-kids-education",
    "emp-ot-eligible", "emp-ot-rule", "emp-net-currency", "emp-visa-type", "emp-visa-sponsor", "emp-hod-name",
    "emp-hod-email", "emp-comments",
  ].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.value = "";
  });

  const empCodeInput = document.getElementById("emp-code");
  if (empCodeInput) {
    empCodeInput.removeAttribute("readonly");
    empCodeInput.placeholder = "e.g. 2120 (auto if blank)";
  }

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

function readOptionalText(id) {
  const value = document.getElementById(id)?.value?.trim();
  return value || undefined;
}

function readOptionalNumber(id) {
  const raw = document.getElementById(id)?.value;
  if (raw === undefined || raw === "") return undefined;
  const value = Number(raw);
  return Number.isFinite(value) ? value : undefined;
}

function readOptionalIsoDate(id) {
  const value = document.getElementById(id)?.value;
  return value ? new Date(value).toISOString() : undefined;
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
    employeeCode: readOptionalText("emp-code"),
    firstName,
    lastName,
    email: document.getElementById("emp-email").value.trim(),
    phone: document.getElementById("emp-mobile").value.trim() || undefined,
    dateOfBirth: readOptionalIsoDate("emp-dob"),
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
    housingAllowance: readOptionalNumber("emp-housing") ?? Math.round(basicSalary * 0.3),
    transportAllowance: readOptionalNumber("emp-transport") ?? Math.round(basicSalary * 0.1),
    accessEnabled,
    userRole: accessEnabled ? document.getElementById("emp-user-role").value : undefined,
    loginEmail: accessEnabled ? (loginEmail || undefined) : undefined,
    loginPassword: accessEnabled ? (loginPassword || undefined) : undefined,
    legacyEmpId: readOptionalText("emp-legacy-id"),
    gender: readOptionalText("emp-gender"),
    maritalStatus: readOptionalText("emp-marital-status"),
    category: readOptionalText("emp-category"),
    subCategory: readOptionalText("emp-sub-category"),
    grade: readOptionalText("emp-grade"),
    employeeType: readOptionalText("emp-employee-type"),
    businessUnit: readOptionalText("emp-business-unit"),
    division: readOptionalText("emp-division"),
    workLocation: readOptionalText("emp-work-location"),
    workCountry: readOptionalText("emp-work-country"),
    payrollType: readOptionalText("emp-payroll-type"),
    payrollStatus: readOptionalText("emp-payroll-status"),
    payrollDivision: readOptionalText("emp-payroll-division"),
    conveyanceAllowance: readOptionalNumber("emp-conveyance"),
    fixedOtAllowance: readOptionalNumber("emp-fixed-ot"),
    foodAllowance: readOptionalNumber("emp-food"),
    otherAllowance: readOptionalNumber("emp-other-allow"),
    overseasAllowance: readOptionalNumber("emp-overseas"),
    performanceAllowance: readOptionalNumber("emp-performance"),
    petrolAllowance: readOptionalNumber("emp-petrol"),
    riskAllowance: readOptionalNumber("emp-risk"),
    socialInsurance: readOptionalNumber("emp-social-insurance"),
    telephoneAllowance: readOptionalNumber("emp-telephone"),
    vehicleAllowance: readOptionalNumber("emp-vehicle"),
    kidsEducationAllowance: readOptionalNumber("emp-kids-education"),
    grossSalary: readOptionalNumber("emp-gross-salary"),
    otEligible: readOptionalText("emp-ot-eligible"),
    otRuleNormal: readOptionalNumber("emp-ot-rule"),
    netPayCurrency: readOptionalText("emp-net-currency"),
    visaType: readOptionalText("emp-visa-type"),
    visaSponsor: readOptionalText("emp-visa-sponsor"),
    hodName: readOptionalText("emp-hod-name"),
    hodEmail: readOptionalText("emp-hod-email"),
    comments: readOptionalText("emp-comments"),
    probationStatus: readOptionalText("emp-probation-status"),
    joiningMonth: readOptionalText("emp-joining-month"),
    probationCompletionDate: readOptionalIsoDate("emp-probation-completion"),
    ctcMonth: readOptionalNumber("emp-ctc-month"),
    ctcYear: readOptionalNumber("emp-ctc-year"),
  };
}

function buildEmployeeActionItems(employee, canManageEmployees) {
  const presence = employeePresenceMap.get(employee.id);
  return [
    `<button class="emp-action-item emp-action-view" type="button" onclick="window.__viewEmployeeById('${employee.id}')"><i class="bi bi-person-lines-fill"></i><span>View Profile</span></button>`,
    presence?.isOnline
      ? `<button class="emp-action-item" type="button" onclick="window.__viewEmployeeLiveLocation('${employee.id}')"><i class="bi bi-geo-alt"></i><span>Live Location</span></button>`
      : "",
    `<button class="emp-action-item" type="button" onclick="window.__viewEmployeeCalendar('${employee.id}')"><i class="bi bi-calendar3"></i><span>Calendar</span></button>`,
    canManageEmployees
      ? `<button class="emp-action-item emp-action-edit" type="button" onclick="window.__editEmployee('${employee.id}')"><i class="bi bi-pencil-square"></i><span>Edit</span></button>`
      : "",
    canManageEmployees
      ? `<button class="emp-action-item emp-action-bank" type="button" onclick="window.__alterBankDetails('${employee.id}')"><i class="bi bi-bank"></i><span>Bank</span></button>`
      : "",
    canManageEmployees
      ? `<button class="emp-action-item emp-action-salary" type="button" onclick="window.__alterSalaryDetails('${employee.id}')"><i class="bi bi-cash-stack"></i><span>Salary</span></button>`
      : "",
  ].filter(Boolean).join("");
}

function buildEmployeeMobileCard(employee, canManageEmployees) {
  const name = `${employee.firstName ?? ""} ${employee.lastName ?? ""}`.trim() || "Employee";
  const initials = employeeInitials(employee);
  const presence = employeePresenceMap.get(employee.id);
  const joinDate = employee.dateOfJoining
    ? new Date(employee.dateOfJoining).toLocaleDateString("en-GB", { month: "short", year: "numeric" })
    : "—";
  const actionItems = buildEmployeeActionItems(employee, canManageEmployees);
  const attendanceBadge = presence?.isOnline
    ? `<span class="badge badge-green">Checked In</span>`
    : `<span class="badge badge-amber">Offline</span>`;

  return `
    <article class="record-card">
      <div class="record-card-head">
        <div class="user-avatar" style="width:42px;height:42px;font-size:13px;flex-shrink:0">${initials}</div>
        <div class="record-card-head-main">
          <div class="record-card-name">${escapeAttr(name)}</div>
          <div class="record-card-sub">${escapeAttr(employee.email ?? "—")}</div>
          <div class="record-card-badges">
            <span class="badge ${statusBadge(employee.status)}">${escapeAttr(formatLabel(employee.status))}</span>
            ${attendanceBadge}
          </div>
        </div>
      </div>
      <div class="record-card-grid">
        <div class="record-card-field"><span class="record-card-label">Employee ID</span><span class="record-card-value">${escapeAttr(employee.employeeCode ?? "—")}</span></div>
        <div class="record-card-field"><span class="record-card-label">Department</span><span class="record-card-value">${escapeAttr(employee.department ?? "—")}</span></div>
        <div class="record-card-field"><span class="record-card-label">Designation</span><span class="record-card-value">${escapeAttr(employee.designation ?? "—")}</span></div>
        <div class="record-card-field"><span class="record-card-label">Join Date</span><span class="record-card-value">${escapeAttr(joinDate)}</span></div>
        <div class="record-card-field"><span class="record-card-label">Type</span><span class="record-card-value">${escapeAttr(employee.employmentType ?? "Full-Time")}</span></div>
        <div class="record-card-field"><span class="record-card-label">Emirates ID</span><span class="record-card-value">${escapeAttr(employee.emiratesId ?? "—")}</span></div>
      </div>
      <div class="record-card-actions">
        <button class="btn btn-primary btn-sm" type="button" onclick="window.__viewEmployeeById('${employee.id}')">View Profile</button>
        <button class="btn btn-secondary btn-sm" type="button" onclick="window.__viewEmployeeCalendar('${employee.id}')">Calendar</button>
        ${presence?.isOnline ? `<button class="btn btn-secondary btn-sm" type="button" onclick="window.__viewEmployeeLiveLocation('${employee.id}')">Location</button>` : ""}
        <button class="btn btn-secondary btn-sm emp-action-toggle" type="button" onclick="window.__toggleEmployeeActionsMenu('${employee.id}', this)">More</button>
      </div>
      <div class="emp-action-source" id="emp-actions-${employee.id}" style="display:none">${actionItems}</div>
    </article>
  `;
}

function renderEmployeesTable() {
  const tableBody = document.querySelector("#emp-table tbody");
  const mobileList = document.getElementById("emp-mobile-list");
  if (!tableBody) return;
  const canManageEmployees = elevatedRoles.has(me?.role);

  if (!employees.length) {
    tableBody.innerHTML = `<tr><td colspan="10" class="text-muted">No employees match your filters.</td></tr>`;
    if (mobileList) mobileList.innerHTML = `<div class="mobile-empty">No employees match your filters.</div>`;
    return;
  }

  tableBody.innerHTML = employees
    .map((employee) => {
      const name = `${employee.firstName ?? ""} ${employee.lastName ?? ""}`.trim();
      const initials = employeeInitials(employee);
      const presence = employeePresenceMap.get(employee.id);
      const attendanceBadge = presence?.isOnline
        ? `<span class="badge badge-green">Checked In</span>`
        : `<span class="badge badge-amber">Offline</span>`;
      const actionItems = buildEmployeeActionItems(employee, canManageEmployees);
      return `
        <tr>
          <td>
            <div class="flex-center gap-8">
              <div class="user-avatar" style="width:30px;height:30px;font-size:11px">${initials}</div>
              <div>
                <div style="font-weight:500">${escapeAttr(name)}</div>
                <div class="text-muted">${escapeAttr(employee.email ?? "")}</div>
              </div>
            </div>
          </td>
          <td>${escapeAttr(employee.employeeCode ?? "—")}</td>
          <td>${escapeAttr(employee.department ?? "—")}</td>
          <td>${escapeAttr(employee.designation ?? "—")}</td>
          <td><span class="badge badge-blue">${escapeAttr(employee.employmentType ?? "Full-Time")}</span></td>
          <td>${employee.dateOfJoining ? new Date(employee.dateOfJoining).toLocaleDateString("en-GB", { month: "short", year: "numeric" }) : "—"}</td>
          <td>${escapeAttr(employee.emiratesId ?? "—")}</td>
          <td><span class="badge ${statusBadge(employee.status)}">${escapeAttr(formatLabel(employee.status))}</span></td>
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

  if (mobileList) {
    mobileList.innerHTML = employees.map((employee) => buildEmployeeMobileCard(employee, canManageEmployees)).join("");
  }
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

async function uploadExcelImport(path, file, extra = {}, handlers = {}) {
  const onPhase = handlers.onPhase;
  onPhase?.("Reading file…", 2);

  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i]);
  }
  const dataBase64 = btoa(binary);

  onPhase?.("Uploading…", 8);

  const headers = {
    "Content-Type": "application/json",
    ...(handlers.headers ?? {}),
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      fileName: file.name,
      dataBase64,
      ...extra,
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.message || `Import failed: ${response.status}`);
  }

  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error("Import stream unavailable");
  }

  const decoder = new TextDecoder();
  let pending = "";
  let result = null;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    pending += decoder.decode(value, { stream: true });
    const lines = pending.split("\n");
    pending = lines.pop() ?? "";

    for (const line of lines) {
      if (!line.trim()) continue;
      const event = JSON.parse(line);
      if (event.type === "progress") {
        const total = Number(event.total ?? 0);
        const processed = Number(event.processed ?? 0);
        const pct = total > 0 ? 10 + Math.round((processed / total) * 88) : 12;
        let label = total > 0 ? `Processing row ${processed} of ${total}` : "Processing…";
        if (event.phase === "managers") label = "Linking line managers…";
        if (event.sheetName && event.phase !== "managers") {
          label += ` · ${event.sheetName}`;
        }
        onPhase?.(label, pct);
      } else if (event.type === "complete") {
        result = event;
        onPhase?.("Finishing…", 100);
      } else if (event.type === "error") {
        throw new Error(event.message || "Import failed");
      }
    }
  }

  if (!result) {
    throw new Error("Import finished without a result");
  }

  return result;
}

function showImportProgressModal(title, status = "Preparing…", percent = 0) {
  const modal = document.getElementById("import-progress-modal");
  const titleEl = document.getElementById("import-progress-title");
  if (titleEl) titleEl.textContent = title;
  updateImportProgressModal(percent, status);
  modal?.classList.add("open");
}

function updateImportProgressModal(percent, status) {
  const bar = document.getElementById("import-progress-bar");
  const statusEl = document.getElementById("import-progress-status");
  const pctEl = document.getElementById("import-progress-percent");
  const safe = Math.max(0, Math.min(100, Math.round(percent)));
  if (bar) bar.style.width = `${safe}%`;
  if (statusEl && status) statusEl.textContent = status;
  if (pctEl) pctEl.textContent = `${safe}%`;
}

function hideImportProgressModal() {
  document.getElementById("import-progress-modal")?.classList.remove("open");
}

async function runExcelImportWithProgress({ path, file, extra, title, onComplete }) {
  showImportProgressModal(title, "Preparing…", 0);
  try {
    const result = await uploadExcelImport(path, file, extra, {
      onPhase: (status, percent) => updateImportProgressModal(percent, status),
    });
    hideImportProgressModal();
    await onComplete(result);
  } catch (error) {
    hideImportProgressModal();
    throw error;
  }
}

function summarizeLeaveImportResult(result) {
  const errors = Array.isArray(result?.errors) ? result.errors : [];
  const notFound = errors.filter((item) => /not found/i.test(item.message ?? "")).length;
  const invalidDates = errors.filter((item) => /invalid start or end date/i.test(item.message ?? "")).length;
  let summary = `Leave import: ${result.created ?? 0} created, ${result.updated ?? 0} updated, ${result.skipped ?? 0} skipped`;
  if (!errors.length) return summary;
  summary += `, ${errors.length} errors`;
  if (notFound >= errors.length * 0.5) {
    summary += `. ${notFound} row(s) reference employees missing from HRMS — import the employee master file first, then re-import leave.`;
  } else if (invalidDates) {
    summary += `. ${invalidDates} row(s) have invalid dates.`;
  } else if (errors[0]?.message) {
    summary += `. First error (row ${errors[0].row}): ${errors[0].message}`;
  }
  return summary;
}

function summarizeEmployeeImportResult(result) {
  const errors = Array.isArray(result?.errors) ? result.errors : [];
  let summary = `Import done: ${result.created ?? 0} created, ${result.updated ?? 0} updated, ${result.skipped ?? 0} skipped`;
  if (!errors.length) return summary;
  summary += `, ${errors.length} errors`;
  if (errors[0]?.message) {
    summary += `. First error (row ${errors[0].row}): ${errors[0].message}`;
  }
  return summary;
}

function summarizeProImportResult(result) {
  const errors = Array.isArray(result?.errors) ? result.errors : [];
  let summary = `PRO import done: ${result.updated ?? 0} employees updated, ${result.skipped ?? 0} skipped`;
  const proCreated = result.proDocsCreated ?? 0;
  const proUpdated = result.proDocsUpdated ?? 0;
  if (proCreated || proUpdated) {
    summary += `, ${proCreated} documents created, ${proUpdated} documents updated`;
  }
  if (!errors.length) return summary;
  summary += `, ${errors.length} errors`;
  const first = errors[0];
  if (first?.message) {
    summary += `. First error (${first.sheetName ?? "sheet"} row ${first.row}): ${first.message}`;
  }
  return summary;
}

function wireLeaveImport() {
  const importButton = document.getElementById("leave-import-btn");
  const importFile = document.getElementById("leave-import-file");
  if (!importButton || !importFile) return;

  if (elevatedRoles.has(me?.role)) {
    importButton.style.display = "";
    importButton.onclick = () => importFile.click();
    importFile.onchange = async (event) => {
      const file = event.target.files?.[0];
      event.target.value = "";
      if (!file) return;
      try {
        await runExcelImportWithProgress({
          path: "/import/leave",
          file,
          title: "Importing leave records",
          onComplete: async (result) => {
            notify(summarizeLeaveImportResult(result));
            await loadLeaveRequests();
            window.__loadLeaveHistory?.();
          },
        });
      } catch (error) {
        notify(error.message);
      }
    };
  } else {
    importButton.style.display = "none";
  }
}

function wireEmployeeFilters() {
  const toolbar = document.querySelector("#view-employees .toolbar");
  if (!toolbar) return;

  const searchInput = toolbar.querySelector(".search-bar input");
  const departmentSelect = document.getElementById("emp-filter-department");
  const statusSelect = document.getElementById("emp-filter-status");
  const exportButton = document.getElementById("emp-export-btn");
  const importButton = document.getElementById("emp-import-btn");
  const importFile = document.getElementById("emp-import-file");

  if (importButton && importFile && elevatedRoles.has(me?.role)) {
    importButton.style.display = "";
    importButton.onclick = () => importFile.click();
    importFile.onchange = async (event) => {
      const file = event.target.files?.[0];
      event.target.value = "";
      if (!file) return;
      const includeSeparated = window.confirm(
        "Import separated/exited employees too?\n\nChoose OK to import all sheets (including Separated). Choose Cancel for active master sheet only.",
      );
      try {
        await runExcelImportWithProgress({
          path: "/import/employees",
          file,
          extra: { includeSeparated },
          title: "Importing employees",
          onComplete: async (result) => {
            notify(summarizeEmployeeImportResult(result));
            await refreshEmployees();
          },
        });
      } catch (error) {
        notify(error.message);
      }
    };
  } else if (importButton) {
    importButton.style.display = "none";
  }

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

function populateEmployeeFilterOptions() {
  const departmentSelect = document.getElementById("emp-filter-department");
  if (!departmentSelect) return;

  const departments = new Set();
  allEmployees.forEach((employee) => {
    if (employee.department?.trim()) departments.add(employee.department.trim());
  });

  const currentDepartment = employeeFilters.department;
  departmentSelect.innerHTML = `<option>All Departments</option>${[...departments].sort((a, b) => a.localeCompare(b))
    .map((department) => `<option>${escapeAttr(department)}</option>`)
    .join("")}`;
  departmentSelect.value = [...departmentSelect.options].some((option) => option.value === currentDepartment)
    ? currentDepartment
    : "All Departments";
  employeeFilters.department = departmentSelect.value;
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
      employee.legacyEmpId,
      employee.department,
      employee.designation,
      employee.email,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    const matchesSearch = !normalizedSearch
      || searchable.includes(normalizedSearch)
      || employee.employeeCode === normalizedSearch
      || (employee.legacyEmpId ?? "").toLowerCase() === normalizedSearch;
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
  populateEmployeeFilterOptions();
  await loadEmployees();
  populateEmployeeSelectors();
  renderDashboardInsights();
  if (isEmployeeDashboard()) renderEmployeeDashboardSummary();
}

function getEmployeeById(employeeId) {
  return allEmployees.find((employee) => employee.id === employeeId);
}

function closeActionModal() {
  document.getElementById("emp-action-modal")?.remove();
}

function formatProfileMoney(value, currency) {
  if (value == null || Number.isNaN(Number(value))) return "—";
  const code = formatCurrencyLabel(currency);
  const amount = Math.round(Number(value)).toLocaleString();
  return code ? `${code} ${amount}` : amount;
}

function formatCurrencyLabel(currency) {
  if (!currency) return "";
  const key = String(currency).trim().toLowerCase();
  const aliases = {
    aed: "AED",
    inr: "INR",
    "indian rupees": "INR",
    dollars: "USD",
    usd: "USD",
    euro: "EUR",
    eur: "EUR",
    egp: "EGP",
    "ghana cedi": "GHS",
    "irani riyal": "IRR",
  };
  if (aliases[key]) return aliases[key];
  if (/^[a-z]{3}$/i.test(String(currency).trim())) return String(currency).trim().toUpperCase();
  return String(currency).trim();
}

function employeeInitials(employee) {
  const name = `${employee.firstName ?? ""} ${employee.lastName ?? ""}`.trim();
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase() || "--";
}

function profileDetailRow(label, value) {
  const display = value == null || value === "" ? "—" : String(value);
  return `
    <div class="profile-item">
      <span class="profile-key">${escapeAttr(label)}</span>
      <span class="profile-value">${escapeAttr(display)}</span>
    </div>
  `;
}

function profileDetailRowHtml(label, html) {
  return `
    <div class="profile-item">
      <span class="profile-key">${escapeAttr(label)}</span>
      <span class="profile-value">${html}</span>
    </div>
  `;
}

function profileDetailPanel(title, rows) {
  const content = rows.filter(Boolean).join("");
  if (!content) return "";
  return `
    <div class="profile-panel">
      <div class="profile-panel-title">${escapeAttr(title)}</div>
      <div class="profile-list">${content}</div>
    </div>
  `;
}

function buildEmployeeProfileHtml(employee) {
  const fullName = `${employee.firstName ?? ""} ${employee.lastName ?? ""}`.trim() || "Employee";
  const payCurrency = employee.netPayCurrency;
  const money = (value) => formatProfileMoney(value, payCurrency);
  const managerName = employee.manager
    ? `${employee.manager.firstName ?? ""} ${employee.manager.lastName ?? ""}`.trim()
    : "";
  const managerLine = managerName
    ? `${managerName} (${employee.manager.employeeCode ?? "—"})`
    : "Not assigned";
  const presence = employeePresenceMap.get(employee.id);
  const presenceBadge = presence?.isOnline
    ? '<span class="badge badge-green">Checked In</span>'
    : '<span class="badge badge-amber">Offline</span>';
  const legacyLine = employee.legacyEmpId ? ` • Legacy ${employee.legacyEmpId}` : "";
  const allowanceRows = [
    ["Conveyance", employee.conveyanceAllowance],
    ["Fixed OT", employee.fixedOtAllowance],
    ["Food", employee.foodAllowance],
    ["Other", employee.otherAllowance],
    ["Overseas", employee.overseasAllowance],
    ["Performance", employee.performanceAllowance],
    ["Petrol", employee.petrolAllowance],
    ["Risk", employee.riskAllowance],
    ["Social Insurance", employee.socialInsurance],
    ["Telephone", employee.telephoneAllowance],
    ["Vehicle", employee.vehicleAllowance],
    ["Kids Education", employee.kidsEducationAllowance],
  ]
    .filter(([, amount]) => amount != null && Number(amount) > 0)
    .map(([label, amount]) => profileDetailRow(label, money(amount)));

  return `
    <div class="emp-profile-view">
      <div class="profile-hero">
        <div class="profile-hero-body">
          <div class="profile-avatar">${escapeAttr(employeeInitials(employee))}</div>
          <div class="profile-headline">
            <div class="profile-name">${escapeAttr(fullName)}</div>
            <div class="profile-subline">
              ${escapeAttr(employee.employeeCode ?? "—")}${legacyLine ? escapeAttr(legacyLine) : ""}<br>
              ${escapeAttr(employee.designation ?? "—")} • ${escapeAttr(employee.department ?? "—")}
            </div>
          </div>
          <div class="profile-hero-meta">
            <span class="profile-role-pill">${escapeAttr(formatLabel(employee.role ?? "EMPLOYEE"))}</span>
            <span class="badge ${statusBadge(employee.status)}">${escapeAttr(formatLabel(employee.status ?? "ACTIVE"))}</span>
            ${presenceBadge}
          </div>
        </div>
      </div>

      <div class="profile-quick-stats">
        <div class="profile-stat">
          <div class="profile-stat-label">Join Date</div>
          <div class="profile-stat-value">${escapeAttr(formatProfileDate(employee.dateOfJoining))}</div>
        </div>
        <div class="profile-stat">
          <div class="profile-stat-label">Employment</div>
          <div class="profile-stat-value">${escapeAttr(employee.employmentType ?? "Full-Time")}</div>
        </div>
        <div class="profile-stat">
          <div class="profile-stat-label">Work Mode</div>
          <div class="profile-stat-value">${escapeAttr(formatLabel(employee.workMode ?? "OFFICE"))}</div>
        </div>
        <div class="profile-stat">
          <div class="profile-stat-label">Gross Salary</div>
          <div class="profile-stat-value">${escapeAttr(money(employee.grossSalary ?? employee.basicSalary))}</div>
        </div>
      </div>

      <div class="profile-grid">
        ${profileDetailPanel("Contact & Employment", [
          profileDetailRow("Work Email", employee.email),
          profileDetailRow("Login Email", employee.loginEmail ?? employee.email),
          profileDetailRow("Mobile", employee.phone),
          profileDetailRow("Line Manager", managerLine),
          profileDetailRow("Office", employee.office?.name ?? "—"),
          profileDetailRow("Notice Period", employee.noticePeriodDays ? `${employee.noticePeriodDays} days` : "—"),
          profileDetailRowHtml("Platform Access", employee.accessEnabled ? '<span class="badge badge-green">Enabled</span>' : '<span class="badge badge-amber">Disabled</span>'),
        ])}
        ${profileDetailPanel("Organization & Payroll", [
          profileDetailRow("Category", employee.category),
          profileDetailRow("Sub Category", employee.subCategory),
          profileDetailRow("Grade", employee.grade),
          profileDetailRow("Employee Type", employee.employeeType),
          profileDetailRow("Business Unit", employee.businessUnit),
          profileDetailRow("Division", employee.division),
          profileDetailRow("Work Location", employee.workLocation),
          profileDetailRow("Work Country", employee.workCountry),
          profileDetailRow("Payroll Type", employee.payrollType),
          profileDetailRow("Payroll Status", employee.payrollStatus),
          profileDetailRow("Payroll Division", employee.payrollDivision),
        ])}
        ${profileDetailPanel("Compensation", [
          profileDetailRow("Basic Salary", money(employee.basicSalary)),
          profileDetailRow("Housing Allowance", money(employee.housingAllowance)),
          profileDetailRow("Transport Allowance", money(employee.transportAllowance)),
          profileDetailRow("Gross Salary", money(employee.grossSalary)),
          profileDetailRow("CTC / Month", money(employee.ctcMonth)),
          profileDetailRow("CTC / Year", money(employee.ctcYear)),
          profileDetailRow("Net Pay Currency", formatCurrencyLabel(employee.netPayCurrency) || "—"),
          profileDetailRow("OT Eligible", employee.otEligible),
          profileDetailRow("OT Rule (Normal)", employee.otRuleNormal),
        ])}
        ${allowanceRows.length ? profileDetailPanel("Allowances", allowanceRows) : ""}
        ${profileDetailPanel("Compliance & IDs", [
          profileDetailRow("Nationality", employee.nationality),
          profileDetailRow("Gender", employee.gender),
          profileDetailRow("Marital Status", employee.maritalStatus),
          profileDetailRow("Date of Birth", formatProfileDate(employee.dateOfBirth)),
          profileDetailRow("Emirates ID", employee.emiratesId),
          profileDetailRow("Passport", employee.passportNumber),
          profileDetailRow("Labour Card", employee.labourCardNumber),
          profileDetailRow("Probation Status", employee.probationStatus),
          profileDetailRow("Probation Completion", formatProfileDate(employee.probationCompletionDate)),
        ])}
        ${profileDetailPanel("Bank & WPS", [
          profileDetailRow("Bank Name", employee.bankName),
          profileDetailRow("IBAN", employee.iban),
          profileDetailRowHtml("WPS Enabled", employee.wpsEnabled ? '<span class="badge badge-green">Yes</span>' : '<span class="badge badge-coral">No</span>'),
        ])}
        ${profileDetailPanel("Visa & HOD", [
          profileDetailRow("Visa Type", employee.visaType),
          profileDetailRow("Visa Sponsor", employee.visaSponsor),
          profileDetailRow("HOD Name", employee.hodName),
          profileDetailRow("HOD Email", employee.hodEmail),
          profileDetailRow("Comments", employee.comments),
        ])}
      </div>
    </div>
  `;
}

const EMPLOYEE_REPORT_SECTIONS = [
  { id: "profile", label: "Profile & Master Data" },
  { id: "attendance", label: "Attendance & Tracking" },
  { id: "leave", label: "Leave History & Balances" },
  { id: "payroll", label: "Payroll" },
  { id: "exit", label: "Exit & Clearance" },
  { id: "performance", label: "Performance" },
];

function buildEmployeeReportSectionCheckboxes() {
  return `
    <div class="emp-report-sections">
      <div class="emp-report-sections-head">
        <div class="emp-report-sections-title">Include in report</div>
        <div class="emp-report-sections-actions">
          <button type="button" id="emp-report-select-all">Select all</button>
          <button type="button" id="emp-report-clear-all">Clear all</button>
        </div>
      </div>
      <div class="emp-report-section-grid">
        ${EMPLOYEE_REPORT_SECTIONS.map((section) => `
          <label class="emp-report-check">
            <input type="checkbox" class="emp-report-section-input" value="${section.id}" checked>
            <span>${escapeAttr(section.label)}</span>
          </label>
        `).join("")}
      </div>
    </div>
  `;
}

function readSelectedEmployeeReportSections(container) {
  return [...container.querySelectorAll(".emp-report-section-input:checked")].map((input) => input.value);
}

async function downloadEmployeeReportPdf(employeeId, from, to, sections) {
  const params = new URLSearchParams({ from, to, sections: sections.join(",") });
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${API_BASE}/reports/employee/${employeeId}/pdf?${params}`, {
    headers,
    cache: "no-store",
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.message || "Failed to generate report");
  }

  const blob = await response.blob();
  const disposition = response.headers.get("Content-Disposition") ?? "";
  const match = disposition.match(/filename="([^"]+)"/);
  const fileName = match?.[1] ?? `Employee_Report_${from}_${to}.pdf`;
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function openEmployeeViewModal(employee) {
  closeActionModal();
  const canManage = elevatedRoles.has(me?.role);
  const range = defaultLeaveHistoryRange();
  const wrapper = document.createElement("div");
  wrapper.id = "emp-action-modal";
  wrapper.className = "modal-overlay open";
  wrapper.innerHTML = `
    <div class="modal emp-view-modal">
      <div class="modal-header">
        <div class="modal-title">Employee Profile</div>
        <button class="modal-close" id="emp-modal-close" aria-label="Close">✕</button>
      </div>
      <div class="emp-profile-view-scroll">${buildEmployeeProfileHtml(employee)}</div>
      ${canManage ? `
        <div class="emp-report-bar">
          <div class="emp-report-actions-row">
            <div class="form-group">
              <label for="emp-report-from">Report from</label>
              <input type="date" id="emp-report-from" value="${range.from}">
            </div>
            <div class="form-group">
              <label for="emp-report-to">Report to</label>
              <input type="date" id="emp-report-to" value="${range.to}">
            </div>
            <button type="button" class="btn btn-primary btn-sm" id="emp-view-download-pdf" style="margin-bottom:2px">
              <i class="bi bi-file-earmark-pdf"></i> Download PDF Report
            </button>
          </div>
          ${buildEmployeeReportSectionCheckboxes()}
          <div class="emp-report-note">
            Choose which sections to include. Attendance, leave, and payroll use the date range above.
          </div>
        </div>
      ` : ""}
      <div class="modal-footer" style="margin-top:14px">
        <button class="btn btn-secondary" id="emp-view-close">Close</button>
        ${canManage ? `<button class="btn btn-secondary" id="emp-view-edit"><i class="bi bi-pencil-square"></i> Edit</button>` : ""}
        <button class="btn btn-primary" id="emp-view-calendar"><i class="bi bi-calendar3"></i> Calendar</button>
      </div>
    </div>
  `;

  document.body.appendChild(wrapper);

  const close = () => closeActionModal();
  wrapper.querySelector("#emp-modal-close")?.addEventListener("click", close);
  wrapper.querySelector("#emp-view-close")?.addEventListener("click", close);
  wrapper.addEventListener("click", (event) => {
    if (event.target === wrapper) close();
  });
  wrapper.querySelector("#emp-view-edit")?.addEventListener("click", () => {
    close();
    window.__editEmployee(employee.id);
  });
  wrapper.querySelector("#emp-view-calendar")?.addEventListener("click", () => {
    close();
    window.__viewEmployeeCalendar(employee.id);
  });
  wrapper.querySelector("#emp-report-select-all")?.addEventListener("click", () => {
    wrapper.querySelectorAll(".emp-report-section-input").forEach((input) => {
      input.checked = true;
    });
  });
  wrapper.querySelector("#emp-report-clear-all")?.addEventListener("click", () => {
    wrapper.querySelectorAll(".emp-report-section-input").forEach((input) => {
      input.checked = false;
    });
  });
  wrapper.querySelector("#emp-view-download-pdf")?.addEventListener("click", async () => {
    const from = wrapper.querySelector("#emp-report-from")?.value;
    const to = wrapper.querySelector("#emp-report-to")?.value;
    const sections = readSelectedEmployeeReportSections(wrapper);
    if (!from || !to) {
      notify("Select both report dates.");
      return;
    }
    if (from > to) {
      notify("Report from date must be on or before to date.");
      return;
    }
    if (!sections.length) {
      notify("Select at least one section to include in the report.");
      return;
    }
    const button = wrapper.querySelector("#emp-view-download-pdf");
    const original = button?.innerHTML;
    try {
      if (button) {
        button.disabled = true;
        button.innerHTML = "Generating…";
      }
      await downloadEmployeeReportPdf(employee.id, from, to, sections);
      notify("Employee report downloaded");
    } catch (error) {
      notify(error.message);
    } finally {
      if (button) {
        button.disabled = false;
        button.innerHTML = original ?? '<i class="bi bi-file-earmark-pdf"></i> Download PDF Report';
      }
    }
  });
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

  window.__closeEmployeeActionsMenu?.();
  openEmployeeViewModal(employee);
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
  const empCodeInput = document.getElementById("emp-code");
  if (empCodeInput) {
    empCodeInput.value = employee.employeeCode ?? "";
    empCodeInput.setAttribute("readonly", "readonly");
  }
  document.getElementById("emp-legacy-id").value = employee.legacyEmpId ?? "";
  document.getElementById("emp-dob").value = toDateInputValue(employee.dateOfBirth);
  document.getElementById("emp-gender").value = employee.gender ?? document.getElementById("emp-gender").value;
  document.getElementById("emp-marital-status").value = employee.maritalStatus ?? document.getElementById("emp-marital-status").value;
  document.getElementById("emp-mobile").value = employee.phone ?? "";
  document.getElementById("emp-email").value = employee.email ?? "";
  document.getElementById("emp-designation").value = employee.designation ?? "";
  document.getElementById("emp-join-date").value = toDateInputValue(employee.dateOfJoining);
  updateEmploymentStatusBadge();
  document.getElementById("emp-basic-salary").value = String(Math.round(employee.basicSalary ?? 0));
  document.getElementById("emp-gross-salary").value = employee.grossSalary != null ? String(employee.grossSalary) : "";
  document.getElementById("emp-ctc-month").value = employee.ctcMonth != null ? String(employee.ctcMonth) : "";
  document.getElementById("emp-ctc-year").value = employee.ctcYear != null ? String(employee.ctcYear) : "";
  document.getElementById("emp-housing").value = employee.housingAllowance != null ? String(employee.housingAllowance) : "";
  document.getElementById("emp-transport").value = employee.transportAllowance != null ? String(employee.transportAllowance) : "";
  document.getElementById("emp-category").value = employee.category ?? "";
  document.getElementById("emp-sub-category").value = employee.subCategory ?? "";
  document.getElementById("emp-grade").value = employee.grade ?? "";
  document.getElementById("emp-employee-type").value = employee.employeeType ?? "";
  document.getElementById("emp-business-unit").value = employee.businessUnit ?? "";
  document.getElementById("emp-division").value = employee.division ?? "";
  document.getElementById("emp-work-location").value = employee.workLocation ?? "";
  document.getElementById("emp-work-country").value = employee.workCountry ?? "";
  document.getElementById("emp-payroll-type").value = employee.payrollType ?? "";
  document.getElementById("emp-payroll-status").value = employee.payrollStatus ?? "";
  document.getElementById("emp-payroll-division").value = employee.payrollDivision ?? "";
  document.getElementById("emp-joining-month").value = employee.joiningMonth ?? "";
  document.getElementById("emp-probation-status").value = employee.probationStatus ?? "";
  document.getElementById("emp-probation-completion").value = toDateInputValue(employee.probationCompletionDate);
  document.getElementById("emp-conveyance").value = employee.conveyanceAllowance != null ? String(employee.conveyanceAllowance) : "";
  document.getElementById("emp-fixed-ot").value = employee.fixedOtAllowance != null ? String(employee.fixedOtAllowance) : "";
  document.getElementById("emp-food").value = employee.foodAllowance != null ? String(employee.foodAllowance) : "";
  document.getElementById("emp-other-allow").value = employee.otherAllowance != null ? String(employee.otherAllowance) : "";
  document.getElementById("emp-overseas").value = employee.overseasAllowance != null ? String(employee.overseasAllowance) : "";
  document.getElementById("emp-performance").value = employee.performanceAllowance != null ? String(employee.performanceAllowance) : "";
  document.getElementById("emp-petrol").value = employee.petrolAllowance != null ? String(employee.petrolAllowance) : "";
  document.getElementById("emp-risk").value = employee.riskAllowance != null ? String(employee.riskAllowance) : "";
  document.getElementById("emp-social-insurance").value = employee.socialInsurance != null ? String(employee.socialInsurance) : "";
  document.getElementById("emp-telephone").value = employee.telephoneAllowance != null ? String(employee.telephoneAllowance) : "";
  document.getElementById("emp-vehicle").value = employee.vehicleAllowance != null ? String(employee.vehicleAllowance) : "";
  document.getElementById("emp-kids-education").value = employee.kidsEducationAllowance != null ? String(employee.kidsEducationAllowance) : "";
  document.getElementById("emp-ot-eligible").value = employee.otEligible ?? "";
  document.getElementById("emp-ot-rule").value = employee.otRuleNormal != null ? String(employee.otRuleNormal) : "";
  document.getElementById("emp-net-currency").value = employee.netPayCurrency ?? "";
  document.getElementById("emp-visa-type").value = employee.visaType ?? "";
  document.getElementById("emp-visa-sponsor").value = employee.visaSponsor ?? "";
  document.getElementById("emp-hod-name").value = employee.hodName ?? "";
  document.getElementById("emp-hod-email").value = employee.hodEmail ?? "";
  document.getElementById("emp-comments").value = employee.comments ?? "";
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
  if (status === "PENDING_ACTING") return "Awaiting Acting Acceptance";
  if (status === "PENDING_L2") return "Pending L2";
  if (status === "APPROVED") return "Approved";
  if (status === "REJECTED") return "Rejected";
  return status;
}

function leaveStatusBadge(status) {
  if (status === "APPROVED") return "badge-green";
  if (status === "PENDING_L1" || status === "PENDING_L2" || status === "PENDING_ACTING") return "badge-amber";
  if (status === "REJECTED") return "badge-coral";
  return "badge-blue";
}

async function approveLeaveRequest(id, stage, name) {
  try {
    const result = await api(`/leave/requests/${id}/${stage}-approve`, { method: "POST" });
    let message = `Leave approved for ${name}`;
    if (stage === "l2" && result?.airTicket?.eligible && result?.airTicket?.fare != null) {
      message += ` · Air ticket allowance AED ${Number(result.airTicket.fare).toLocaleString()} drafted`;
      if (result.airTicket.adjustmentReference) {
        message += ` (${result.airTicket.adjustmentReference})`;
      }
    } else if (stage === "l2" && result?.airTicket?.reason) {
      message += ` · No air ticket: ${result.airTicket.reason}`;
    }
    notify(message);
    await loadLeaveRequests();
  } catch (error) {
    notify(error.message);
  }
}

async function acceptActingLeave(id, name) {
  try {
    await api(`/leave/requests/${id}/acting-accept`, { method: "POST" });
    notify(`Acting assignment accepted for ${name}'s leave`);
    await loadLeaveRequests();
  } catch (error) {
    notify(error.message);
  }
}

async function rejectActingLeave(id, name) {
  const reason = window.prompt(`Reject acting assignment for ${name}? Enter reason (min 3 characters):`);
  if (!reason || reason.trim().length < 3) {
    if (reason !== null) notify("Rejection reason must be at least 3 characters");
    return;
  }
  try {
    await api(`/leave/requests/${id}/acting-reject`, {
      method: "POST",
      body: JSON.stringify({ reason: reason.trim() }),
    });
    notify(`Acting assignment rejected for ${name}`);
    await loadLeaveRequests();
  } catch (error) {
    notify(error.message);
  }
}

window.__acceptActingLeave = acceptActingLeave;
window.__rejectActingLeave = rejectActingLeave;

function renderLeavePending(requests) {
  const tbody = document.querySelector("#leave-pending-table tbody");
  const table = document.getElementById("leave-pending-table");
  const mobileList = document.getElementById("leave-pending-mobile");
  if (!tbody || !table) return;

  const pending = requests.filter((request) =>
    ["PENDING_L1", "PENDING_ACTING", "PENDING_L2"].includes(request.status),
  );

  const headerCells = table.querySelectorAll("thead th");
  const showAirTicketColumn =
    elevatedRoles.has(me?.role)
    || pending.some((request) => canViewAirTicketForEmployee(request.employeeId));
  if (headerCells.length >= 9) {
    if (headerCells[6]) headerCells[6].style.display = showAirTicketColumn ? "" : "none";
    if (me?.role === "MANAGER") {
      headerCells[7].textContent = "L1 / Acting";
      headerCells[8].textContent = "L2";
    } else if (l2Roles.has(me?.role)) {
      headerCells[7].textContent = "L1 / Acting";
      headerCells[8].textContent = "L2 (You)";
    } else {
      headerCells[7].textContent = "L1 / Acting";
      headerCells[8].textContent = "L2";
    }
  }

  if (!pending.length) {
    tbody.innerHTML = `<tr><td colspan="9" class="text-muted">No pending leave requests.</td></tr>`;
    if (mobileList) mobileList.innerHTML = `<div class="mobile-empty">No pending leave requests.</div>`;
    return;
  }

  const rendered = pending.map((request) => {
      const name = `${request.employee?.firstName ?? ""} ${request.employee?.lastName ?? ""}`.trim();
      const leaveType = request.leaveType?.name ?? "Leave";
      const start = new Date(request.startDate).toLocaleDateString("en-GB", { month: "short", day: "numeric" });
      const end = new Date(request.endDate).toLocaleDateString("en-GB", { month: "short", day: "numeric" });
      const actingName = request.actingApprover
        ? `${request.actingApprover.firstName ?? ""} ${request.actingApprover.lastName ?? ""}`.trim()
        : "—";
      const actingBadge = request.managerOnLeave && request.assignedL1Approver?.isActing
        ? ' <span class="badge badge-amber">Acting approver</span>'
        : "";

      let l1Status = `<span class="text-muted">—</span>`;
      if (request.status === "PENDING_ACTING") {
        l1Status = request.canAcceptActing
          ? `<div class="flex gap-8" style="flex-wrap:wrap"><button class="btn btn-accent btn-sm" onclick="window.__acceptActingLeave('${request.id}','${escapeAttr(name)}')">Accept Acting Role</button><button class="btn btn-danger btn-sm" onclick="window.__rejectActingLeave('${request.id}','${escapeAttr(name)}')">Reject</button></div>`
          : `<span class="badge badge-amber">Awaiting ${escapeAttr(actingName)}</span>`;
      } else if (request.l1ApprovedBy) {
        l1Status = `<span class="badge badge-green">✓ Approved</span>${actingBadge}`;
      } else if (request.status === "PENDING_L1") {
        l1Status = request.canApproveL1
          ? `<button class="btn btn-accent btn-sm" onclick="window.__approveLeave('${request.id}','l1','${escapeAttr(name)}')">Approve L1</button>${actingBadge}`
          : `<span class="badge badge-amber">Pending${actingBadge}</span>`;
      }

      const l2Status = request.status === "PENDING_L2" && hasRole(Array.from(l2Roles))
        ? `<button class="btn btn-accent btn-sm" onclick="window.__approveLeave('${request.id}','l2','${escapeAttr(name)}')">Approve L2</button>`
        : request.status === "PENDING_ACTING"
          ? `<span class="text-muted">After acting acceptance</span>`
          : request.status === "PENDING_L1"
            ? `<span class="text-muted">Awaiting L1</span>`
            : `<span class="badge badge-amber">Pending</span>`;

      const showAirTicket = canViewAirTicketForEmployee(request.employeeId);
      const airTicketCell = showAirTicket ? formatAirTicketSummary(request) : `<span class="text-muted">—</span>`;
      const reason = request.reason ?? request.remark ?? "—";

      const tableRow = `
        <tr>
          <td><b>${escapeAttr(name || request.employeeId)}</b>${request.employee?.role === "MANAGER" ? ' <span class="badge badge-blue">Manager</span>' : ""}</td>
          <td><span class="badge badge-blue">${escapeAttr(leaveType)}</span></td>
          <td>${start}</td>
          <td>${end}</td>
          <td>${request.days}</td>
          <td>${escapeAttr(reason)}</td>
          <td${showAirTicketColumn ? "" : ' style="display:none"'}>${showAirTicket ? airTicketCell : `<span class="text-muted">—</span>`}</td>
          <td><div class="flex gap-8">${l1Status}</div></td>
          <td><div class="flex gap-8">${l2Status}</div></td>
        </tr>
      `;

      const mobileCard = `
        <article class="record-card">
          <div class="record-card-head">
            <div class="record-card-head-main">
              <div class="record-card-name">${escapeAttr(name || request.employeeId)}</div>
              <div class="record-card-badges">
                <span class="badge badge-blue">${escapeAttr(leaveType)}</span>
                <span class="badge ${leaveStatusBadge(request.status)}">${escapeAttr(formatLeaveStatus(request.status))}</span>
              </div>
            </div>
          </div>
          <div class="record-card-grid">
            <div class="record-card-field"><span class="record-card-label">From</span><span class="record-card-value">${start}</span></div>
            <div class="record-card-field"><span class="record-card-label">To</span><span class="record-card-value">${end}</span></div>
            <div class="record-card-field"><span class="record-card-label">Days</span><span class="record-card-value">${request.days}</span></div>
            <div class="record-card-field"><span class="record-card-label">Reason</span><span class="record-card-value">${escapeAttr(reason)}</span></div>
          </div>
          <div class="record-card-actions" style="flex-direction:column;align-items:stretch;border-top:none;padding-top:0">
            <div>${l1Status}</div>
            <div>${l2Status}</div>
          </div>
        </article>
      `;

      return { tableRow, mobileCard };
    });

  tbody.innerHTML = rendered.map((row) => row.tableRow).join("");
  if (mobileList) mobileList.innerHTML = rendered.map((row) => row.mobileCard).join("");
}

function renderMyLeaveHistory(requests) {
  const tbody = document.querySelector("#leave-my-table tbody");
  const mobileList = document.getElementById("leave-my-mobile");
  if (!tbody) return;

  const myId = me?.employee?.id;
  const myRequests = requests
    .filter((request) => !myId || request.employeeId === myId)
    .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());

  if (!myRequests.length) {
    tbody.innerHTML = `<tr><td colspan="12" class="text-muted">No leave requests found.</td></tr>`;
    if (mobileList) mobileList.innerHTML = `<div class="mobile-empty">No leave requests found.</div>`;
    return;
  }

  const rendered = myRequests.map((request) => {
      const leaveType = request.leaveType?.name ?? "Leave";
      const start = new Date(request.startDate).toLocaleDateString("en-GB", { month: "short", day: "numeric", year: "numeric" });
      const end = new Date(request.endDate).toLocaleDateString("en-GB", { month: "short", day: "numeric", year: "numeric" });
      const l1 = request.l1ApprovedBy
        ? `${request.l1ApprovedBy.firstName} ${request.l1ApprovedBy.lastName}`
        : "—";
      const l2 = request.l2ApprovedBy
        ? `${request.l2ApprovedBy.firstName} ${request.l2ApprovedBy.lastName}`
        : "—";
      const remark = request.remark || request.reason || "—";

      const actingName = request.actingApprover
        ? `${request.actingApprover.firstName ?? ""} ${request.actingApprover.lastName ?? ""}`.trim()
        : "—";
      const actingLine =
        request.status === "PENDING_ACTING"
          ? `<div class="text-muted" style="font-size:12px">Acting: ${escapeAttr(actingName)} (pending acceptance)</div>`
          : request.actingApprover && request.actingAcceptedAt
            ? `<div class="text-muted" style="font-size:12px">Acting: ${escapeAttr(actingName)}</div>`
            : "";

      const tableRow = `
        <tr>
          <td><span class="badge badge-blue">${leaveType}</span>${actingLine}</td>
          <td>${start}</td>
          <td>${end}</td>
          <td>${request.days}</td>
          <td>${formatLeaveHistoryDate(request.rejoiningDate)}</td>
          <td>${escapeAttr(request.statusAsOn ?? "—")}</td>
          <td>${request.extendedDays ?? 0}</td>
          <td><span class="badge ${leaveStatusBadge(request.status)}">${formatLeaveStatus(request.status)}</span></td>
          <td>${formatAirTicketSummary(request)}</td>
          <td>${l1}</td>
          <td>${l2}</td>
          <td>${escapeAttr(remark)}</td>
        </tr>
      `;

      const mobileCard = `
        <article class="record-card">
          <div class="record-card-head">
            <div class="record-card-head-main">
              <div class="record-card-name">${escapeAttr(leaveType)}</div>
              <div class="record-card-badges">
                <span class="badge ${leaveStatusBadge(request.status)}">${escapeAttr(formatLeaveStatus(request.status))}</span>
              </div>
            </div>
          </div>
          <div class="record-card-grid">
            <div class="record-card-field"><span class="record-card-label">From</span><span class="record-card-value">${start}</span></div>
            <div class="record-card-field"><span class="record-card-label">To</span><span class="record-card-value">${end}</span></div>
            <div class="record-card-field"><span class="record-card-label">Days</span><span class="record-card-value">${request.days}</span></div>
            <div class="record-card-field"><span class="record-card-label">Rejoin</span><span class="record-card-value">${escapeAttr(formatLeaveHistoryDate(request.rejoiningDate))}</span></div>
          </div>
          ${remark !== "—" ? `<div class="record-card-sub">${escapeAttr(remark)}</div>` : ""}
        </article>
      `;

      return { tableRow, mobileCard };
    });

  tbody.innerHTML = rendered.map((row) => row.tableRow).join("");
  if (mobileList) mobileList.innerHTML = rendered.map((row) => row.mobileCard).join("");
}

function canPickLeaveHistoryEmployee() {
  return elevatedRoles.has(me?.role) || me?.role === "MANAGER";
}

function leaveHistoryEmployeeOptions() {
  const loggedInEmployeeId = me?.employee?.id ?? "";
  if (elevatedRoles.has(me?.role)) return allEmployees;
  if (me?.role === "MANAGER" && me?.employee?.department) {
    return allEmployees.filter(
      (employee) => employee.department === me.employee.department || employee.id === loggedInEmployeeId,
    );
  }
  return allEmployees.filter((employee) => employee.id === loggedInEmployeeId);
}

function defaultLeaveHistoryRange() {
  const today = new Date();
  const from = new Date(today.getFullYear(), 0, 1);
  return { from: toDateKey(from), to: toDateKey(today) };
}

function setLeaveHistoryRange(from, to) {
  const fromInput = document.getElementById("leave-history-from");
  const toInput = document.getElementById("leave-history-to");
  if (fromInput) fromInput.value = from;
  if (toInput) {
    toInput.value = to;
    toInput.min = from;
  }
  if (fromInput) fromInput.max = to;
}

function canExportLeaveReport() {
  return elevatedRoles.has(me?.role) || me?.role === "MANAGER";
}

function populateLeaveHistoryDepartmentSelect() {
  const wrap = document.getElementById("leave-history-dept-wrap");
  const select = document.getElementById("leave-history-dept");
  if (!wrap || !select) return;

  const canFilter = elevatedRoles.has(me?.role);
  wrap.style.display = canFilter ? "" : "none";
  if (!canFilter) return;

  const current = select.value;
  const departments = [...new Set(allEmployees.map((employee) => employee.department).filter(Boolean))].sort();
  select.innerHTML = `<option value="">All departments</option>` + departments
    .map((department) => `<option value="${escapeAttr(department)}">${escapeAttr(department)}</option>`)
    .join("");
  if (current && departments.includes(current)) {
    select.value = current;
  }
}

function syncLeaveHistoryExportControls() {
  const canExport = canExportLeaveReport();
  document.getElementById("leave-export-xlsx-btn")?.style.setProperty("display", canExport ? "" : "none");
  document.getElementById("leave-export-pdf-btn")?.style.setProperty("display", canExport ? "" : "none");
}

async function downloadLeaveReportFile(format) {
  const from = document.getElementById("leave-history-from")?.value;
  const to = document.getElementById("leave-history-to")?.value;
  if (!from || !to) {
    notify("Select both from and to dates.");
    return;
  }
  if (from > to) {
    notify("From date must be on or before to date.");
    return;
  }

  const params = new URLSearchParams({ from, to });
  const employeeId = document.getElementById("leave-history-emp")?.value;
  const department = document.getElementById("leave-history-dept")?.value;
  if (employeeId && canPickLeaveHistoryEmployee()) {
    params.set("employeeId", employeeId);
  }
  if (department && elevatedRoles.has(me?.role)) {
    params.set("department", department);
  }

  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  const response = await fetch(`${API_BASE}/reports/leave/${format}?${params.toString()}`, {
    headers,
    cache: "no-store",
  });
  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.message || "Failed to generate leave report");
  }

  const blob = await response.blob();
  const disposition = response.headers.get("Content-Disposition") ?? "";
  const match = disposition.match(/filename="([^"]+)"/);
  const fileName = match?.[1] ?? `Leave_Report_${from}_${to}.${format}`;
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

window.__downloadLeaveReport = async function downloadLeaveReport(format) {
  const xlsxBtn = document.getElementById("leave-export-xlsx-btn");
  const pdfBtn = document.getElementById("leave-export-pdf-btn");
  const activeBtn = format === "pdf" ? pdfBtn : xlsxBtn;
  const original = activeBtn?.innerHTML;
  try {
    if (activeBtn) {
      activeBtn.disabled = true;
      activeBtn.innerHTML = "Generating…";
    }
    await downloadLeaveReportFile(format);
    notify(`Leave report downloaded (${format.toUpperCase()})`);
  } catch (error) {
    notify(error.message);
  } finally {
    if (xlsxBtn) {
      xlsxBtn.disabled = false;
      if (format === "xlsx") xlsxBtn.innerHTML = original ?? "⬇ Excel";
    }
    if (pdfBtn) {
      pdfBtn.disabled = false;
      if (format === "pdf") pdfBtn.innerHTML = original ?? "⬇ PDF";
    }
  }
};

function populateLeaveHistoryEmployeeSelect() {
  const wrap = document.getElementById("leave-history-emp-wrap");
  const select = document.getElementById("leave-history-emp");
  if (!wrap || !select) return;

  const canPick = canPickLeaveHistoryEmployee();
  wrap.style.display = canPick ? "" : "none";
  if (!canPick) return;

  const current = select.value;
  const employees = leaveHistoryEmployeeOptions();
  const defaultLabel = elevatedRoles.has(me?.role) ? "All employees" : "My leave history";
  select.innerHTML = `<option value="">${defaultLabel}</option>` + employees
    .map((employee) => `<option value="${employee.id}">${employee.firstName} ${employee.lastName} (${employee.employeeCode})</option>`)
    .join("");
  if (current && employees.some((employee) => employee.id === current)) {
    select.value = current;
  }
}

function formatLeaveHistoryDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-GB", { month: "short", day: "numeric", year: "numeric" });
}

function renderLeaveHistoryTable(requests) {
  const tbody = document.getElementById("leave-history-body");
  const mobileList = document.getElementById("leave-history-mobile");
  const summary = document.getElementById("leave-history-summary");
  const showEmployeeCol = canPickLeaveHistoryEmployee();
  const employeeHeader = document.querySelector("#leave-history-table thead th:nth-child(2)");
  if (employeeHeader) employeeHeader.style.display = showEmployeeCol ? "" : "none";

  if (!tbody) return;

  const sorted = [...(requests ?? [])].sort(
    (a, b) => new Date(b.createdAt ?? b.startDate).getTime() - new Date(a.createdAt ?? a.startDate).getTime(),
  );

  if (!sorted.length) {
    tbody.innerHTML = `<tr><td colspan="15" class="text-muted">No leave records found for this date range.</td></tr>`;
    if (mobileList) mobileList.innerHTML = `<div class="mobile-empty">No leave records found for this date range.</div>`;
    if (summary) summary.textContent = "";
    return;
  }

  const totalDays = sorted.reduce((sum, request) => sum + Number(request.days ?? 0), 0);
  const approvedDays = sorted
    .filter((request) => request.status === "APPROVED")
    .reduce((sum, request) => sum + Number(request.days ?? 0), 0);
  if (summary) {
    summary.textContent = `${sorted.length} record${sorted.length === 1 ? "" : "s"} · ${totalDays} day${totalDays === 1 ? "" : "s"} total · ${approvedDays} approved day${approvedDays === 1 ? "" : "s"}`;
  }

  const rendered = sorted.map((request) => {
    const leaveType = request.leaveType?.name ?? "Leave";
    const employeeName = request.employee
      ? `${request.employee.firstName ?? ""} ${request.employee.lastName ?? ""}`.trim()
      : "—";
    const l1 = request.l1ApprovedBy
      ? `${request.l1ApprovedBy.firstName} ${request.l1ApprovedBy.lastName}`
      : "—";
    const l2 = request.l2ApprovedBy
      ? `${request.l2ApprovedBy.firstName} ${request.l2ApprovedBy.lastName}`
      : "—";
    const remark = request.remark || request.reason || "—";
    const applied = formatLeaveHistoryDate(request.createdAt);
    const start = formatLeaveHistoryDate(request.startDate);
    const end = formatLeaveHistoryDate(request.endDate);
    const rejoin = formatLeaveHistoryDate(request.rejoiningDate);
    const statusLabel = formatLeaveStatus(request.status);
    const statusBadge = leaveStatusBadge(request.status);

    const tableRow = `
      <tr>
        <td>${applied}</td>
        <td${showEmployeeCol ? "" : ' style="display:none"'}>${escapeAttr(employeeName)}</td>
        <td><span class="badge badge-blue">${escapeAttr(leaveType)}</span></td>
        <td>${start}</td>
        <td>${end}</td>
        <td>${request.days}</td>
        <td>${rejoin}</td>
        <td>${escapeAttr(request.statusAsOn ?? "—")}</td>
        <td>${request.extendedDays ?? 0}</td>
        <td>${request.leaveBalanceSnapshot ?? "—"}</td>
        <td>${request.currentLeaveBalanceSnapshot ?? "—"}</td>
        <td><span class="badge ${statusBadge}">${escapeAttr(statusLabel)}</span></td>
        <td>${escapeAttr(l1)}</td>
        <td>${escapeAttr(l2)}</td>
        <td>${escapeAttr(remark)}</td>
      </tr>`;

    const mobileCard = `
      <article class="record-card">
        <div class="record-card-head">
          <div class="record-card-head-main">
            <div class="record-card-name">${escapeAttr(showEmployeeCol ? employeeName : leaveType)}</div>
            ${showEmployeeCol ? `<div class="record-card-sub">${escapeAttr(leaveType)}</div>` : ""}
            <div class="record-card-badges">
              <span class="badge badge-blue">${escapeAttr(leaveType)}</span>
              <span class="badge ${statusBadge}">${escapeAttr(statusLabel)}</span>
            </div>
          </div>
        </div>
        <div class="record-card-grid">
          <div class="record-card-field"><span class="record-card-label">Applied</span><span class="record-card-value">${applied}</span></div>
          <div class="record-card-field"><span class="record-card-label">From</span><span class="record-card-value">${start}</span></div>
          <div class="record-card-field"><span class="record-card-label">To</span><span class="record-card-value">${end}</span></div>
          <div class="record-card-field"><span class="record-card-label">Days</span><span class="record-card-value">${request.days}</span></div>
          <div class="record-card-field"><span class="record-card-label">Rejoin</span><span class="record-card-value">${escapeAttr(rejoin)}</span></div>
        </div>
        ${remark !== "—" ? `<div class="record-card-sub">${escapeAttr(remark)}</div>` : ""}
      </article>`;

    return { tableRow, mobileCard };
  });

  tbody.innerHTML = rendered.map((row) => row.tableRow).join("");
  if (mobileList) mobileList.innerHTML = rendered.map((row) => row.mobileCard).join("");
}

window.__initLeaveHistoryTab = function initLeaveHistoryTab() {
  populateLeaveHistoryEmployeeSelect();
  populateLeaveHistoryDepartmentSelect();
  syncLeaveHistoryExportControls();
  const fromInput = document.getElementById("leave-history-from");
  const toInput = document.getElementById("leave-history-to");
  if (!fromInput?.value || !toInput?.value) {
    const range = defaultLeaveHistoryRange();
    setLeaveHistoryRange(range.from, range.to);
  }
  window.__loadLeaveHistory?.();
};

window.__resetLeaveHistoryRange = function resetLeaveHistoryRange() {
  const range = defaultLeaveHistoryRange();
  setLeaveHistoryRange(range.from, range.to);
  const select = document.getElementById("leave-history-emp");
  if (select) select.value = "";
  const tbody = document.getElementById("leave-history-body");
  const mobileList = document.getElementById("leave-history-mobile");
  if (tbody) {
    tbody.innerHTML = `<tr><td colspan="15" class="text-muted">Select a date range and click Search.</td></tr>`;
  }
  if (mobileList) {
    mobileList.innerHTML = `<div class="mobile-empty">Select a date range and click Search.</div>`;
  }
  const summary = document.getElementById("leave-history-summary");
  if (summary) summary.textContent = "";
};

window.__loadLeaveHistory = async function loadLeaveHistory() {
  const from = document.getElementById("leave-history-from")?.value;
  const to = document.getElementById("leave-history-to")?.value;
  if (!from || !to) {
    notify("Select both from and to dates.");
    return;
  }
  if (from > to) {
    notify("From date must be on or before to date.");
    return;
  }

  const params = new URLSearchParams({ fromDate: from, toDate: to });
  const employeeId = document.getElementById("leave-history-emp")?.value;
  if (employeeId && canPickLeaveHistoryEmployee()) {
    params.set("employeeId", employeeId);
  } else if (!elevatedRoles.has(me?.role)) {
    params.set("mine", "true");
  }

  const tbody = document.getElementById("leave-history-body");
  const mobileList = document.getElementById("leave-history-mobile");
  if (tbody) {
    tbody.innerHTML = `<tr><td colspan="15" class="text-muted">Loading leave history…</td></tr>`;
  }
  if (mobileList) {
    mobileList.innerHTML = `<div class="mobile-empty">Loading leave history…</div>`;
  }

  try {
    const requests = await api(`/leave/requests?${params.toString()}`);
    let rows = Array.isArray(requests) ? requests : [];
    const department = document.getElementById("leave-history-dept")?.value;
    if (department && elevatedRoles.has(me?.role)) {
      rows = rows.filter((request) => request.employee?.department === department);
    }
    renderLeaveHistoryTable(rows);
  } catch (error) {
    if (tbody) {
      tbody.innerHTML = `<tr><td colspan="15" class="text-muted">Failed to load leave history.</td></tr>`;
    }
    if (mobileList) {
      mobileList.innerHTML = `<div class="mobile-empty">Failed to load leave history.</div>`;
    }
    notify(error.message);
  }
};

function applyLeaveHistoryPreset(preset) {
  const today = new Date();
  let from;
  let to = new Date(today);

  if (preset === "this-month") {
    from = new Date(today.getFullYear(), today.getMonth(), 1);
  } else if (preset === "last-3-months") {
    from = new Date(today.getFullYear(), today.getMonth() - 2, 1);
  } else if (preset === "this-year") {
    from = new Date(today.getFullYear(), 0, 1);
  } else if (preset === "last-year") {
    from = new Date(today.getFullYear() - 1, 0, 1);
    to = new Date(today.getFullYear() - 1, 11, 31);
  } else {
    return;
  }

  setLeaveHistoryRange(toDateKey(from), toDateKey(to));
  window.__loadLeaveHistory?.();
}

function wireLeaveHistoryTab() {
  document.getElementById("leave-history-from")?.addEventListener("change", (event) => {
    const toInput = document.getElementById("leave-history-to");
    if (toInput) toInput.min = event.target.value;
    if (toInput?.value && toInput.value < event.target.value) {
      toInput.value = event.target.value;
    }
  });
  document.getElementById("leave-history-to")?.addEventListener("change", (event) => {
    const fromInput = document.getElementById("leave-history-from");
    if (fromInput) fromInput.max = event.target.value;
  });
  document.querySelectorAll("[data-leave-range]").forEach((button) => {
    button.addEventListener("click", () => {
      applyLeaveHistoryPreset(button.getAttribute("data-leave-range"));
    });
  });
  document.getElementById("leave-history-dept")?.addEventListener("change", () => {
    window.__loadLeaveHistory?.();
  });
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
        if (request.status === "PENDING_ACTING" && currentUserIsRequester) {
          pushNotification({
            title: "Awaiting acting manager acceptance",
            desc: `${leaveTypeName} will move to HR only after your assigned acting manager accepts.`,
            tone: "info",
            icon: "bi-person-badge",
          });
        }

        if (request.status === "PENDING_L2") {
          if (currentUserIsRequester && !currentUserIsL1Approver) {
            pushNotification({
              title: request.employee?.role === "MANAGER" ? "Acting manager accepted your leave" : "Manager approved your leave",
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
  const pendingCount = requests.filter((item) =>
    ["PENDING_L1", "PENDING_ACTING", "PENDING_L2"].includes(item.status),
  ).length;
  const pendingTab = document.querySelector("button[onclick*='leave-pending']");
  if (pendingTab) {
    pendingTab.textContent = `Pending Approvals (${pendingCount})`;
    const hasActingDuties = requests.some((item) => item.canAcceptActing || item.canApproveL1);
    pendingTab.style.display = isIndividualContributor(me?.role) && !hasActingDuties ? "none" : "";
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
  refreshActingManagerOptions(leaveEmployeeSelect.value || "").catch(() => null);
  populateLeaveHistoryEmployeeSelect();
}

function formatLeaveTypeOption(type) {
  if (type.balanceMode === "MATURITY") {
    return `${type.name} (accrues ${type.yearlyAllocation} days/yr, max ${type.maxCarryForward})`;
  }
  if (type.balanceMode === "NONE") {
    return `${type.name} (unlimited)`;
  }
  const payLabel = type.payRate === "HALF" ? "half pay" : type.payRate === "NONE" ? "no pay" : "full pay";
  return `${type.name} (${type.yearlyAllocation} days/yr · ${payLabel})`;
}

function populateLeaveTypes() {
  const selects = document.querySelectorAll("#leave-apply .form-group select");
  const leaveTypeSelect = selects[1];
  if (!leaveTypeSelect) return;

  leaveTypeSelect.innerHTML = `<option value="">Select leave type…</option>` + leaveTypes
    .map((type) => `<option value="${type.id}">${escapeAttr(formatLeaveTypeOption(type))}</option>`)
    .join("");
}

function findLeaveEntitlement(entitlements, leaveTypeId) {
  return (entitlements?.entitlements ?? []).find((item) => item.leaveTypeId === leaveTypeId) ?? null;
}

function findAnnualLeaveEntitlement(entitlements) {
  return (entitlements?.entitlements ?? []).find((item) => item.code === "AL") ?? null;
}

function setAnnualLeaveBalanceExpanded(expanded) {
  const toggle = document.getElementById("leave-annual-balance-toggle");
  const panel = document.getElementById("leave-annual-balance-panel");
  if (!toggle || !panel) return;
  toggle.classList.toggle("open", expanded);
  panel.hidden = !expanded;
  toggle.setAttribute("aria-expanded", expanded ? "true" : "false");
}

function renderAnnualLeaveBalance(entitlementsState) {
  const wrap = document.getElementById("leave-annual-balance-wrap");
  const earnedEl = document.getElementById("leave-al-earned");
  const usedEl = document.getElementById("leave-al-used");
  const pendingEl = document.getElementById("leave-al-pending");
  const availableEl = document.getElementById("leave-al-available");
  const noteEl = document.getElementById("leave-annual-balance-note");
  const annual = findAnnualLeaveEntitlement(entitlementsState);

  if (!wrap) return;

  if (!annual) {
    wrap.style.display = "none";
    setAnnualLeaveBalanceExpanded(false);
    return;
  }

  wrap.style.display = "";
  setAnnualLeaveBalanceExpanded(false);

  const earned = Number(annual.entitledDays ?? 0);
  const used = Number(annual.usedDays ?? 0);
  const pending = Number(annual.pendingDays ?? 0);
  const available = Number(annual.availableDays ?? 0);
  const worked = Number(annual.daysWorked ?? 0);

  if (earnedEl) earnedEl.textContent = earned.toFixed(2);
  if (usedEl) usedEl.textContent = used.toFixed(2);
  if (pendingEl) pendingEl.textContent = pending.toFixed(2);
  if (availableEl) availableEl.textContent = available.toFixed(2);
  if (noteEl) {
    noteEl.textContent = `Annual leave accrues daily from your join date (${worked} day${worked === 1 ? "" : "s"} of service). Balance as on ${new Date(entitlementsState?.asOf ?? Date.now()).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}.`;
  }
}

function getRequestedLeaveDays(startDate, endDate) {
  if (!startDate || !endDate) return 0;
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end < start) return 0;
  const dayMs = 24 * 60 * 60 * 1000;
  return Math.max(1, Math.round((end.getTime() - start.getTime()) / dayMs) + 1);
}

async function refreshActingManagerOptions(employeeId) {
  const group = document.getElementById("leave-acting-manager-group");
  const select = document.getElementById("leave-acting-manager-select");
  const helpEl = document.getElementById("leave-acting-manager-help");
  if (!group || !select) return;

  const employee = employeeId ? getEmployeeById(employeeId) : null;
  if (!employee) {
    group.style.display = "none";
    select.required = false;
    select.innerHTML = `<option value="">Select department colleague…</option>`;
    return;
  }

  group.style.display = "";
  select.required = true;
  const voidOption = canVoidActingColleague(employee.role)
    ? `<option value="${ACTING_VOID_VALUE}">Void — no acting colleague</option>`
    : "";

  if (helpEl) {
    if (employee.role === "MANAGER") {
      helpEl.textContent =
        "Pick a department colleague to cover your role. They must accept before your leave moves to HR approval, and will approve team leave requests while you are away.";
    } else if (canVoidActingColleague(employee.role)) {
      helpEl.textContent =
        "Pick a department colleague to cover your duties while you are away, or choose Void if no handover is needed. If assigned, they must accept before your leave goes to your line manager.";
    } else {
      helpEl.textContent =
        "Pick a department colleague to cover your duties while you are away. They must accept before your leave goes to your line manager.";
    }
  }

  select.innerHTML = `<option value="">Select department colleague…</option>${voidOption}`;

  try {
    const candidates = await api(`/leave/acting-candidates/${employeeId}`);
    select.innerHTML =
      `<option value="">Select department colleague…</option>${voidOption}` +
      (Array.isArray(candidates) ? candidates : [])
        .map(
          (candidate) =>
            `<option value="${candidate.id}">${escapeAttr(candidate.name)} (${escapeAttr(candidate.employeeCode ?? "—")})${candidate.designation ? ` · ${escapeAttr(candidate.designation)}` : ""}</option>`,
        )
        .join("");
  } catch (_error) {
    select.innerHTML = `<option value="">Unable to load colleagues</option>${voidOption}`;
  }
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
  const airTicketPreviewEl = document.getElementById("leave-air-ticket-preview");
  let entitlementsState = null;
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
    const entitlement = selectedLeaveType
      ? findLeaveEntitlement(entitlementsState, selectedLeaveType.id)
      : null;

    if (!entitlementsState || !selectedLeaveType) {
      if (earnedChip) earnedChip.textContent = "Entitled: —";
      if (usedChip) usedChip.textContent = "Used: —";
      if (availableChip) availableChip.textContent = "Available: —";
      if (workedChip) workedChip.textContent = selectedLeaveType?.balanceMode === "MATURITY" ? "Service days: —" : "Pending: —";
      if (selectedDaysText) {
        selectedDaysText.textContent = "Select employee and leave type to view balance.";
        selectedDaysText.style.color = "";
        selectedDaysText.style.fontWeight = "";
      }
      isOverBalance = false;
      syncSubmitState();
      return;
    }

    const isUnlimited = selectedLeaveType.balanceMode === "NONE";
    const entitledDays = entitlement?.entitledDays;
    const usedDays = Number(entitlement?.usedDays ?? 0);
    const pendingDays = Number(entitlement?.pendingDays ?? 0);
    const availableDays = isUnlimited ? null : Number(entitlement?.availableDays ?? 0);

    if (earnedChip) {
      earnedChip.textContent = isUnlimited
        ? "Entitled: Unlimited"
        : `Entitled: ${selectedLeaveType.balanceMode === "MATURITY" ? Number(entitledDays ?? 0).toFixed(2) : Number(entitledDays ?? 0)}`;
    }
    if (usedChip) usedChip.textContent = `Used: ${usedDays.toFixed(2)}`;
    if (availableChip) {
      availableChip.textContent = isUnlimited
        ? "Available: Unlimited"
        : `Available: ${availableDays.toFixed(2)}`;
    }
    if (workedChip) {
      workedChip.textContent = selectedLeaveType.balanceMode === "MATURITY"
        ? `Service days: ${Number(entitlement?.daysWorked ?? 0)}`
        : `Pending: ${pendingDays.toFixed(2)}`;
    }

    if (isUnlimited) {
      if (selectedDaysText) {
        selectedDaysText.textContent = `Selected days: ${requestedDays.toFixed(2)} · No balance limit for ${selectedLeaveType.name}.`;
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
        : `${selectedLeaveType.name} balance: ${availableDays.toFixed(2)} day(s) available.`;
      selectedDaysText.style.color = isOverBalance ? "#ef4444" : "";
      selectedDaysText.style.fontWeight = isOverBalance ? "700" : "";
    }
    syncSubmitState();
    refreshAirTicketPreview().catch(() => null);
  };

  const refreshAirTicketPreview = async () => {
    if (!airTicketPreviewEl) return;
    const employeeId = selects[0]?.value;
    const leaveTypeId = selects[1]?.value;
    const requestedDays = getRequestedLeaveDays(dateInputs[0]?.value, dateInputs[1]?.value);
    if (!employeeId || !leaveTypeId || !requestedDays || !canViewAirTicketForEmployee(employeeId)) {
      airTicketPreviewEl.textContent = "";
      return;
    }
    try {
      const preview = await api(
        `/leave/air-ticket-preview?employeeId=${encodeURIComponent(employeeId)}&leaveTypeId=${encodeURIComponent(leaveTypeId)}&days=${encodeURIComponent(String(requestedDays))}`,
      );
      if (preview?.eligible && preview?.fare != null) {
        airTicketPreviewEl.innerHTML = `✈️ Estimated air ticket on approval: <b>AED ${Number(preview.fare).toLocaleString()}</b> (${escapeAttr(preview.country ?? "")}, ${escapeAttr((preview.roleBand ?? "staff").toLowerCase())})`;
        airTicketPreviewEl.style.color = "var(--accent)";
      } else {
        airTicketPreviewEl.textContent = preview?.reason
          ? `Air ticket: ${preview.reason}`
          : "";
        airTicketPreviewEl.style.color = "";
      }
    } catch (_error) {
      airTicketPreviewEl.textContent = "";
    }
  };

  const refreshMaturityInfo = async () => {
    const employeeId = selects[0]?.value;
    if (!employeeId) {
      entitlementsState = null;
      renderAnnualLeaveBalance(null);
      renderMaturityInfo();
      return;
    }
    try {
      entitlementsState = await api(`/leave/entitlements/${employeeId}`);
    } catch (_error) {
      entitlementsState = null;
    }
    renderAnnualLeaveBalance(entitlementsState);
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
      if (days > 90) {
        notify("Leave cannot exceed 90 days per request");
        return;
      }
      if (isOverBalance) {
        notify("Insufficient leave balance for the selected dates");
        return;
      }

      const selectedLeaveType = leaveTypes.find((item) => item.id === leaveTypeId);
      if (selectedLeaveType?.balanceMode !== "NONE") {
        try {
          entitlementsState = await api(`/leave/entitlements/${employeeId}`);
        } catch (_error) {
          notify("Unable to verify leave balance. Please try again.");
          return;
        }
        const entitlement = findLeaveEntitlement(entitlementsState, leaveTypeId);
        if (!entitlement) {
          notify("Unable to verify leave balance. Please try again.");
          return;
        }
        const availableDays = Number(entitlement.availableDays ?? 0);
        if (days > availableDays) {
          const label = selectedLeaveType.balanceMode === "MATURITY"
            ? "matured annual leave"
            : `${selectedLeaveType.name} balance`;
          notify(`Insufficient ${label}. Available: ${availableDays.toFixed(2)} day(s). Requested: ${days.toFixed(2)} day(s).`);
          return;
        }
      }

      const hasOverlap = leaveRequestsCache.some((request) => {
        if (request.employeeId !== employeeId) return false;
        if (!["PENDING_L1", "PENDING_ACTING", "PENDING_L2", "APPROVED"].includes(request.status)) return false;
        const existingStart = new Date(request.startDate);
        const existingEnd = new Date(request.endDate);
        if (Number.isNaN(existingStart.getTime()) || Number.isNaN(existingEnd.getTime())) return false;
        return existingStart <= end && existingEnd >= start;
      });
      if (hasOverlap) {
        notify("Leave already exists in selected time frame");
        return;
      }

      const applicant = getEmployeeById(employeeId);
      const actingSelection = document.getElementById("leave-acting-manager-select")?.value || "";
      const actingVoid = actingSelection === ACTING_VOID_VALUE;
      if (!actingSelection) {
        notify("Please assign an acting colleague before applying for leave");
        return;
      }
      if (actingVoid && !canVoidActingColleague(applicant?.role)) {
        notify("Only Labour and Staff can skip acting colleague assignment");
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
          actingVoid: actingVoid || undefined,
          actingApproverId: actingVoid ? undefined : actingSelection,
        }),
      });

      notify(
        actingVoid
          ? "Leave submitted — awaiting line manager approval"
          : "Leave submitted — awaiting acting colleague acceptance",
      );
      selects[0].value = "";
      selects[1].value = "";
      reason.value = "";
      dateInputs[0].value = "";
      dateInputs[1].value = "";
      const actingSelect = document.getElementById("leave-acting-manager-select");
      if (actingSelect) actingSelect.value = "";
      if (!elevatedRoles.has(me?.role) && me?.employee?.id) {
        selects[0].value = me.employee.id;
      } else if (!selects[0].value && selects[0].options.length === 2) {
        selects[0].selectedIndex = 1;
      }
      await refreshActingManagerOptions(selects[0]?.value || "");
      await refreshMaturityInfo();
      await loadLeaveRequests();
    } catch (error) {
      notify(error.message);
    }
  };

  selects[0]?.addEventListener("change", () => {
    refreshActingManagerOptions(selects[0]?.value || "").catch(() => null);
    refreshMaturityInfo().catch(() => null);
    refreshAirTicketPreview().catch(() => null);
  });
  document.getElementById("leave-annual-balance-toggle")?.addEventListener("click", () => {
    const panel = document.getElementById("leave-annual-balance-panel");
    setAnnualLeaveBalanceExpanded(Boolean(panel?.hidden));
  });
  dateInputs.forEach((input) => {
    input.addEventListener("change", () => {
      syncDateBounds();
      renderMaturityInfo();
      refreshAirTicketPreview().catch(() => null);
    });
  });
  selects[1]?.addEventListener("change", () => {
    renderMaturityInfo();
    refreshAirTicketPreview().catch(() => null);
  });
  syncDateBounds();
  refreshActingManagerOptions(selects[0]?.value || "").catch(() => null);
  refreshMaturityInfo().catch(() => null);
  window.__refreshLeaveApplyBalance = () => refreshMaturityInfo().catch(() => null);
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

function renderLeaveBalanceTypes(entitlements) {
  const tbody = document.getElementById("leave-balance-types-body");
  const mobileList = document.getElementById("leave-balance-types-mobile");
  const rows = Array.isArray(entitlements) ? entitlements : [];
  if (!tbody) return;

  if (!rows.length) {
    tbody.innerHTML = `<tr><td colspan="6" class="text-muted">No leave entitlements found.</td></tr>`;
    if (mobileList) mobileList.innerHTML = `<div class="mobile-empty">No leave entitlements found.</div>`;
    return;
  }

  const rendered = rows.map((item) => {
    const payLabel = item.payRate === "HALF" ? "Half pay" : item.payRate === "NONE" ? "No pay" : "Full pay";
    const payBadge = item.payRate === "NONE" ? "badge-coral" : item.payRate === "HALF" ? "badge-amber" : "badge-green";
    const entitledLabel = item.balanceMode === "NONE"
      ? "Unlimited"
      : item.balanceMode === "MATURITY"
        ? Number(item.entitledDays ?? 0).toFixed(2)
        : String(item.entitledDays ?? 0);
    const availableLabel = item.balanceMode === "NONE"
      ? "Unlimited"
      : Number(item.availableDays ?? 0).toFixed(2);
    const used = Number(item.usedDays ?? 0).toFixed(2);
    const pending = Number(item.pendingDays ?? 0).toFixed(2);

    const tableRow = `
      <tr>
        <td>${escapeAttr(item.name)}</td>
        <td>${escapeAttr(entitledLabel)}</td>
        <td>${used}</td>
        <td>${pending}</td>
        <td>${escapeAttr(availableLabel)}</td>
        <td><span class="badge ${payBadge}">${escapeAttr(payLabel)}</span></td>
      </tr>`;

    const mobileCard = `
      <article class="record-card">
        <div class="record-card-head">
          <div class="record-card-head-main">
            <div class="record-card-name">${escapeAttr(item.name)}</div>
            <div class="record-card-badges"><span class="badge ${payBadge}">${escapeAttr(payLabel)}</span></div>
          </div>
        </div>
        <div class="record-card-grid">
          <div class="record-card-field"><span class="record-card-label">Entitlement</span><span class="record-card-value">${escapeAttr(entitledLabel)}</span></div>
          <div class="record-card-field"><span class="record-card-label">Used</span><span class="record-card-value">${used}</span></div>
          <div class="record-card-field"><span class="record-card-label">Pending</span><span class="record-card-value">${pending}</span></div>
          <div class="record-card-field"><span class="record-card-label">Available</span><span class="record-card-value">${escapeAttr(availableLabel)}</span></div>
        </div>
      </article>`;

    return { tableRow, mobileCard };
  });

  tbody.innerHTML = rendered.map((row) => row.tableRow).join("");
  if (mobileList) mobileList.innerHTML = rendered.map((row) => row.mobileCard).join("");
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
    const data = await api(`/leave/entitlements/${employeeId}`);
    const annual = (data.entitlements ?? []).find((item) => item.code === "AL") ?? data.entitlements?.[0];
    const earned = Number(annual?.entitledDays ?? 0);
    const used = Number(annual?.usedDays ?? 0);
    const available = Number(annual?.availableDays ?? 0);
    const worked = Number(annual?.daysWorked ?? 0);

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
      noteEl.textContent = `Annual leave accrues daily (30 days/year, max 60). Other leave types reset each calendar year. As on ${new Date(data.asOf ?? Date.now()).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}.`;
    }
    renderLeaveBalanceTypes(data.entitlements ?? []);

    if (detail) detail.style.display = "";
    if (empty) empty.style.display = "none";
  } catch (error) {
    notify(error.message);
  }
};

let exitRecordsCache = [];
let clearanceTasksCache = [];

const EXIT_STATUS_LABELS = {
  NEGOTIATION: "Negotiation",
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

function parseInputDate(value) {
  if (!value) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [y, m, d] = value.split("-").map(Number);
    return new Date(y, m - 1, d);
  }
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

function addCalendarDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function addCalendarDaysForDisplay(value, days) {
  const start = value instanceof Date ? new Date(value) : parseInputDate(value);
  if (!start || Number.isNaN(start.getTime())) return null;
  return addCalendarDays(start, days);
}

function daysBetweenDates(from, to) {
  const start = from instanceof Date ? new Date(from) : parseInputDate(from);
  const end = to instanceof Date ? new Date(to) : parseInputDate(to);
  if (!start || !end) return 0;
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);
  return Math.max(0, Math.round((end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000)));
}

function getEmployeeNoticeDays(employeeId) {
  const emp = allEmployees.find((e) => e.id === employeeId);
  return Number(emp?.noticePeriodDays ?? 30);
}

function toIsoFromInput(value) {
  const d = parseInputDate(value);
  if (!d) return new Date(value).toISOString();
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 12, 0, 0).toISOString();
}

function buildNoticeWindow(employeeId, startDateStr, lwdDateStr) {
  const noticePeriodDays = getEmployeeNoticeDays(employeeId);
  const start = parseInputDate(startDateStr) ?? new Date();
  start.setHours(0, 0, 0, 0);
  const mandatoryEnd = addCalendarDays(start, noticePeriodDays);
  const requestedEnd = parseInputDate(lwdDateStr);
  const shortfall = requestedEnd
    ? Math.max(0, noticePeriodDays - daysBetweenDates(start, requestedEnd))
    : 0;
  return { noticePeriodDays, start, mandatoryEnd, requestedEnd, shortfall };
}

function isoDateFromRecord(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function renderNoticeStartFieldsHtml(record, prefix) {
  const noticeDays = record.noticePeriodDays ?? 30;
  const defaultStart = record.type === "RESIGNATION"
    ? isoDateFromRecord(record.resignationDate)
    : isoDateFromRecord(record.noticePeriodStartDate ?? record.createdAt);
  const minStart = defaultStart || new Date().toISOString().slice(0, 10);
  const startForPreview = defaultStart || minStart;
  const endPreview = addCalendarDaysForDisplay(startForPreview, noticeDays);
  return `
    <div class="form-group full">
      <label>Notice period starts from</label>
      <input id="${prefix}-notice-start-date" type="date" value="${escapeAttr(startForPreview)}" min="${escapeAttr(minStart)}" data-notice-days="${noticeDays}" onchange="window.__updateExitNoticePreview('${prefix}')">
    </div>
    <div id="${prefix}-notice-window-preview" class="text-muted" style="font-size:12px;margin-bottom:10px">
      ${noticeDays} day notice: ${fmtDate(startForPreview)} → ${fmtDate(endPreview)}
    </div>`;
}

window.__updateExitNoticePreview = function updateExitNoticePreview(prefix) {
  const input = document.getElementById(`${prefix}-notice-start-date`);
  const preview = document.getElementById(`${prefix}-notice-window-preview`);
  if (!input || !preview) return;
  const days = Number(input.dataset.noticeDays ?? 30);
  const start = input.value;
  if (!start) return;
  const end = addCalendarDaysForDisplay(start, days);
  preview.textContent = `${days} day notice: ${fmtDate(start)} → ${fmtDate(end)}`;
};

function renderExitNoticeInfoHtml(context, employeeId, startDateStr, lwdDateStr, mode = "resignation") {
  if (!context || !employeeId) return "";
  const windowInfo = buildNoticeWindow(employeeId, startDateStr, lwdDateStr);
  const managerLine = context.lineManager
    ? `<div><b>Line Manager:</b> ${escapeAttr(context.lineManager.name)} (${escapeAttr(context.lineManager.employeeCode)})</div>`
    : `<div><b>Line Manager:</b> Not assigned</div>`;
  const approverLine = context.assignedApprover
    ? `<div><b>${context.assignedApprover.isActing ? "Acting Approver" : "Approver"}:</b> ${escapeAttr(context.assignedApprover.name)} (${escapeAttr(context.assignedApprover.employeeCode)})${context.managerOnLeave ? ' <span class="badge badge-amber">Primary manager on leave</span>' : ""}</div>`
    : "";
  const requestedLine = windowInfo.requestedEnd
    ? `<div><b>Requested last working day:</b> ${fmtDate(windowInfo.requestedEnd)}${windowInfo.shortfall ? ` <span class="badge badge-coral">Shortfall ${windowInfo.shortfall} day(s)</span>` : ""}</div>`
    : "";
  const footer = mode === "termination"
    ? "Dates are based on this employee's notice period setting and the dates you selected above."
    : "Dates are based on this employee's notice period setting and the dates you selected above.";
  return `
    <div><b>Notice Period:</b> ${windowInfo.noticePeriodDays} days (from employee profile)</div>
    <div><b>From:</b> ${fmtDate(windowInfo.start)} &nbsp;→&nbsp; <b>To:</b> ${fmtDate(windowInfo.mandatoryEnd)}</div>
    ${requestedLine}
    ${managerLine}
    ${approverLine}
    <div class="text-muted" style="margin-top:6px;font-size:12px">${footer}</div>`;
}

async function refreshExitNoticeInfo() {
  const employeeId = document.getElementById("exit-emp-select")?.value;
  const resignationDate = document.getElementById("exit-resignation-date")?.value;
  const lwdDate = document.getElementById("exit-lwd")?.value;
  const box = document.getElementById("exit-notice-info");
  const body = document.getElementById("exit-notice-info-body");
  if (!box || !body || !employeeId) {
    if (box) box.style.display = "none";
    return;
  }
  try {
    const startQuery = resignationDate ? `?startDate=${encodeURIComponent(resignationDate)}` : "";
    const context = await api(`/exits/context/${employeeId}${startQuery}`);
    body.innerHTML = renderExitNoticeInfoHtml(context, employeeId, resignationDate, lwdDate, "resignation");
    box.style.display = "block";
    const lwdInput = document.getElementById("exit-lwd");
    const { mandatoryEnd } = buildNoticeWindow(employeeId, resignationDate, lwdDate);
    if (lwdInput && mandatoryEnd && !lwdInput.dataset.userEdited) {
      const y = mandatoryEnd.getFullYear();
      const m = String(mandatoryEnd.getMonth() + 1).padStart(2, "0");
      const d = String(mandatoryEnd.getDate()).padStart(2, "0");
      lwdInput.value = `${y}-${m}-${d}`;
    }
  } catch {
    if (box) box.style.display = "none";
  }
}

async function refreshTermNoticeInfo() {
  const employeeId = document.getElementById("term-emp-select")?.value;
  const noticeStart = document.getElementById("term-notice-start")?.value;
  const lwdDate = document.getElementById("term-lwd")?.value;
  const box = document.getElementById("term-notice-info");
  const body = document.getElementById("term-notice-info-body");
  if (!box || !body || !employeeId) {
    if (box) box.style.display = "none";
    return;
  }
  try {
    const startQuery = noticeStart ? `?startDate=${encodeURIComponent(noticeStart)}` : "";
    const context = await api(`/exits/context/${employeeId}${startQuery}`);
    body.innerHTML = renderExitNoticeInfoHtml(context, employeeId, noticeStart, lwdDate, "termination");
    box.style.display = "block";
    const lwdInput = document.getElementById("term-lwd");
    const { mandatoryEnd } = buildNoticeWindow(employeeId, noticeStart, lwdDate);
    if (lwdInput && mandatoryEnd && !lwdInput.dataset.userEdited) {
      const y = mandatoryEnd.getFullYear();
      const m = String(mandatoryEnd.getMonth() + 1).padStart(2, "0");
      const d = String(mandatoryEnd.getDate()).padStart(2, "0");
      lwdInput.value = `${y}-${m}-${d}`;
    }
  } catch {
    if (box) box.style.display = "none";
  }
}

window.__refreshExitNoticeInfo = refreshExitNoticeInfo;
window.__refreshTermNoticeInfo = refreshTermNoticeInfo;

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
    resignSelect.onchange = () => {
      const lwdInput = document.getElementById("exit-lwd");
      if (lwdInput) delete lwdInput.dataset.userEdited;
      refreshExitNoticeInfo();
    };
    resignSelect.dispatchEvent(new Event("change"));
  }
  if (termSelect) {
    termSelect.innerHTML = `<option value="">Select employee…</option>` + allEmployees
      .filter((emp) => emp.id !== me?.employee?.id)
      .map((emp) => `<option value="${emp.id}">${escapeAttr(`${emp.firstName ?? ""} ${emp.lastName ?? ""}`.trim())} (${escapeAttr(emp.employeeCode ?? "—")})</option>`)
      .join("");
    termSelect.onchange = () => {
      const lwdInput = document.getElementById("term-lwd");
      if (lwdInput) delete lwdInput.dataset.userEdited;
      refreshTermNoticeInfo();
    };
  }
  const todayIso = new Date().toISOString().slice(0, 10);
  ["exit-resignation-date", "exit-lwd", "term-notice-start", "term-lwd"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.min = todayIso;
  });
  const resignDateEl = document.getElementById("exit-resignation-date");
  if (resignDateEl && !resignDateEl.dataset.exitWired) {
    resignDateEl.dataset.exitWired = "1";
    resignDateEl.value = todayIso;
    resignDateEl.addEventListener("change", () => refreshExitNoticeInfo());
  }
  const termStartEl = document.getElementById("term-notice-start");
  if (termStartEl && !termStartEl.dataset.exitWired) {
    termStartEl.dataset.exitWired = "1";
    termStartEl.value = todayIso;
    termStartEl.addEventListener("change", () => refreshTermNoticeInfo());
  }
  const lwdEl = document.getElementById("exit-lwd");
  if (lwdEl && !lwdEl.dataset.exitWired) {
    lwdEl.dataset.exitWired = "1";
    lwdEl.addEventListener("input", () => {
      lwdEl.dataset.userEdited = "1";
      refreshExitNoticeInfo();
    });
  }
  const termLwdEl = document.getElementById("term-lwd");
  if (termLwdEl && !termLwdEl.dataset.exitWired) {
    termLwdEl.dataset.exitWired = "1";
    termLwdEl.addEventListener("input", () => {
      termLwdEl.dataset.userEdited = "1";
      refreshTermNoticeInfo();
    });
  }
}

function getExitProceedAction(record) {
  const role = me?.role;
  const isElevated = elevatedRoles.has(role);
  const isManager = role === "MANAGER";
  const isCeo = role === "SUPER_ADMIN" || role === "CEO";
  const isAssignedApprover = record.assignedApproverId === me?.employee?.id
    || record.employee?.managerId === me?.employee?.id;
  const inNegotiation = record.status === "NEGOTIATION" || record.status === "PENDING" || record.status === "INITIATED";

  if (inNegotiation && record.type === "RESIGNATION" && (isElevated || (isManager && isAssignedApprover))) {
    return { label: "End Negotiation", tone: "accent" };
  }
  if (inNegotiation && record.type === "TERMINATION" && (isElevated || (isManager && isAssignedApprover))) {
    return { label: "End Negotiation", tone: "accent" };
  }
  if (record.status === "LM_APPROVED" && isElevated) {
    return { label: "HR Approve", tone: "primary" };
  }
  if (record.status === "DOCUMENTED" && isCeo) {
    return { label: "Final Approve", tone: "primary" };
  }
  if (record.status === "SETTLEMENT_READY" && isElevated) {
    return { label: "Complete Exit", tone: "primary" };
  }
  return null;
}

function renderExitsTable() {
  const tbody = document.getElementById("exit-records-body");
  const mobileList = document.getElementById("exit-records-mobile");
  if (!tbody) return;
  if (!exitRecordsCache.length) {
    tbody.innerHTML = `<tr><td colspan="6" class="text-muted">No exit records yet.</td></tr>`;
    if (mobileList) mobileList.innerHTML = `<div class="mobile-empty">No exit records yet.</div>`;
    return;
  }

  const rendered = exitRecordsCache.map((record) => {
    const emp = record.employee;
    const name = `${emp?.firstName ?? ""} ${emp?.lastName ?? ""}`.trim();
    const typeBadge = record.type === "TERMINATION" ? "badge-coral" : "badge-blue";
    const statusBadge = exitStatusBadge(record.status);
    const statusLabel = EXIT_STATUS_LABELS[record.status] ?? record.status;
    const lwd = fmtDate(record.lastWorkingDate ?? record.requestedLastWorkingDay);
    const submitted = fmtDate(record.createdAt);
    const canDelete = elevatedRoles.has(me?.role);
    const proceed = getExitProceedAction(record);
    const proceedBtn = proceed
      ? `<button class="btn btn-${proceed.tone} btn-sm" onclick="window.__viewExit('${record.id}')">${escapeAttr(proceed.label)}</button>`
      : "";
    const deleteBtn = canDelete
      ? `<button class="btn btn-danger btn-sm" onclick="window.__deleteExit('${record.id}')">Delete</button>`
      : "";
    const viewBtn = `<button class="btn btn-secondary btn-sm" onclick="window.__viewExit('${record.id}')">View</button>`;
    const actions = [proceedBtn, viewBtn, deleteBtn].filter(Boolean).join("");

    const tableRow = `
      <tr>
        <td>${escapeAttr(name)} (${escapeAttr(emp?.employeeCode ?? "—")})</td>
        <td><span class="badge ${typeBadge}">${formatLabel(record.type)}</span></td>
        <td><span class="badge ${statusBadge}">${escapeAttr(statusLabel)}</span></td>
        <td>${lwd}</td>
        <td>${submitted}</td>
        <td><div class="flex gap-8" style="flex-wrap:wrap">${actions}</div></td>
      </tr>`;

    const mobileCard = `
      <article class="record-card">
        <div class="record-card-head">
          <div class="record-card-head-main">
            <div class="record-card-name">${escapeAttr(name)}</div>
            <div class="record-card-sub">${escapeAttr(emp?.employeeCode ?? "—")}${emp?.department ? ` · ${escapeAttr(emp.department)}` : ""}</div>
            <div class="record-card-badges">
              <span class="badge ${typeBadge}">${formatLabel(record.type)}</span>
              <span class="badge ${statusBadge}">${escapeAttr(statusLabel)}</span>
            </div>
          </div>
        </div>
        <div class="record-card-grid">
          <div class="record-card-field"><span class="record-card-label">Last Working Day</span><span class="record-card-value">${lwd}</span></div>
          <div class="record-card-field"><span class="record-card-label">Submitted</span><span class="record-card-value">${submitted}</span></div>
        </div>
        ${actions ? `<div class="record-card-actions">${actions}</div>` : ""}
      </article>`;

    return { tableRow, mobileCard };
  });

  tbody.innerHTML = rendered.map((row) => row.tableRow).join("");
  if (mobileList) mobileList.innerHTML = rendered.map((row) => row.mobileCard).join("");
}

const CLEARANCE_DEPARTMENT_LABELS = {
  HOD: "H.O.D / Covering Employee",
  IT: "IT Department",
  FINANCE: "Finance & Accounts",
  ADMIN: "Administration",
  TRANSPORTATION: "Transportation",
  HR: "HR Department",
  PRO: "PR Department",
};

const CLEARANCE_DEPT_META = {
  HOD: { icon: "bi-person-badge", tone: "tone-hod" },
  IT: { icon: "bi-laptop", tone: "tone-it" },
  FINANCE: { icon: "bi-cash-stack", tone: "tone-finance" },
  ADMIN: { icon: "bi-building", tone: "tone-admin" },
  TRANSPORTATION: { icon: "bi-truck", tone: "tone-transport" },
  HR: { icon: "bi-people", tone: "tone-hr" },
  PRO: { icon: "bi-file-earmark-check", tone: "tone-pro" },
};

function formatClearanceDepartment(department = "") {
  return CLEARANCE_DEPARTMENT_LABELS[department] ?? department;
}

function clearanceDeptMeta(department) {
  return CLEARANCE_DEPT_META[department] ?? { icon: "bi-folder-check", tone: "tone-admin" };
}

function clearanceInitials(name = "") {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "—";
  return parts.slice(0, 2).map((part) => part[0]?.toUpperCase() ?? "").join("");
}

function renderClearanceProgressBar(done, total) {
  const pct = total ? Math.round((done / total) * 100) : 0;
  return `<div class="clearance-progress-track"><div class="clearance-progress-fill" style="width:${pct}%"></div></div>`;
}

const CLEARANCE_FINANCIAL_ITEM_KEYS = new Set(["LOAN", "ADVANCE", "IOU"]);

function isFinancialClearanceItem(item) {
  return CLEARANCE_FINANCIAL_ITEM_KEYS.has(item?.itemKey);
}

function renderClearanceAdjustmentMeta(item) {
  const adj = item?.payrollAdjustment;
  if (!adj && !item?.amount) return "";
  const ref = adj?.referenceNumber ?? "—";
  const amt = Number(adj?.amount ?? item?.amount ?? 0).toLocaleString("en-US");
  const typeLabel = (adj?.type ?? item?.adjustmentType) === "ADDITION" ? "Addition" : "Deduction";
  const status = adj?.status ? formatLabel(adj.status) : "Draft";
  const dual = adj?.requiresDualApproval ? " · Dual approval required" : "";
  return `<div class="clearance-financial-meta">
    <span class="badge badge-blue">${escapeAttr(typeLabel)}</span>
    <span>AED ${amt}</span>
    <span class="text-muted">${escapeAttr(ref)} · ${escapeAttr(status)}${escapeAttr(dual)}</span>
  </div>`;
}

function checklistItemResolved(status) {
  return status === "COMPLETED" || status === "NOT_APPLICABLE";
}

function taskHasChecklist(task) {
  return Array.isArray(task?.checklistItems) && task.checklistItems.length > 0;
}

function clearanceChecklistProgress(task) {
  const items = Array.isArray(task?.checklistItems) ? task.checklistItems : [];
  if (!items.length) return null;
  const done = items.filter((item) => checklistItemResolved(item.status)).length;
  return { done, total: items.length };
}

function checklistItemStatusLabel(status) {
  if (status === "COMPLETED") return "Collected";
  if (status === "NOT_APPLICABLE") return "N/A";
  return "Pending";
}

function checklistItemBadge(status) {
  if (status === "COMPLETED") return "badge-green";
  if (status === "NOT_APPLICABLE") return "badge-blue";
  return "badge-amber";
}

function clearanceAssigneeLabel(department) {
  if (department === "HOD") return "Line manager / H.O.D";
  if (department === "ADMIN" || department === "PRO" || department === "HR") return "HR / Admin";
  return "Dept manager";
}

function groupClearanceByExit(tasks) {
  const groups = new Map();
  tasks.forEach((task) => {
    const exitId = task.exitRecord?.id ?? "unknown";
    if (!groups.has(exitId)) groups.set(exitId, { exit: task.exitRecord, tasks: [] });
    groups.get(exitId).tasks.push(task);
  });
  return Array.from(groups.values());
}

function renderClearanceDeptCard(task, options = {}) {
  const done = task.status === "COMPLETED";
  const meta = clearanceDeptMeta(task.department);
  const deptLabel = formatClearanceDepartment(task.department);
  const mgr = task.assignedManager;
  const mgrName = mgr ? `${mgr.firstName ?? ""} ${mgr.lastName ?? ""}`.trim() : "Unassigned";
  const progress = taskHasChecklist(task) ? clearanceChecklistProgress(task) : null;
  const canComplete = canCompleteClearanceTask(task);
  const emp = task.exitRecord?.employee;
  const empName = emp ? `${emp.firstName ?? ""} ${emp.lastName ?? ""}`.trim() : "Employee";

  let actionHtml = "";
  if (done) {
    actionHtml = `<span class="badge badge-green">Cleared</span>`;
  } else if (progress && canComplete) {
    actionHtml = `<button class="btn btn-accent btn-sm" onclick="window.__openClearanceChecklist('${task.id}')"><i class="bi bi-list-check"></i> Open checklist (${progress.done}/${progress.total})</button>`;
  } else if (progress) {
    actionHtml = `<span class="badge badge-blue">${progress.done}/${progress.total} done</span>`;
  } else if (canComplete) {
    actionHtml = `<button class="btn btn-accent btn-sm" onclick="window.__openClearanceComplete('${task.id}','${escapeAttr(task.department)}','${escapeAttr(empName)}')"><i class="bi bi-check2-circle"></i> Sign off</button>`;
  } else {
    actionHtml = `<span class="text-muted" style="font-size:12px">Awaiting ${escapeAttr(clearanceAssigneeLabel(task.department).toLowerCase())}</span>`;
  }

  const progressHtml = progress
    ? `<div style="margin-top:2px">${renderClearanceProgressBar(progress.done, progress.total)}<div class="text-muted" style="font-size:11px;margin-top:5px">${progress.done} of ${progress.total} items resolved</div></div>`
    : "";

  const noteHtml = done && task.remarks
    ? `<div class="text-muted" style="font-size:11px;line-height:1.45;margin-top:2px">${escapeAttr(task.remarks.length > 120 ? `${task.remarks.slice(0, 120)}…` : task.remarks)}</div>`
    : "";

  return `<article class="clearance-dept-card ${done ? "is-done" : "is-pending"}">
    <div class="clearance-dept-top">
      <div class="clearance-dept-icon ${meta.tone}"><i class="bi ${meta.icon}"></i></div>
      <div style="min-width:0;flex:1">
        <div class="clearance-dept-title">${escapeAttr(deptLabel)}${task.urgent ? ' <span class="badge badge-coral">Urgent</span>' : ""}</div>
        <div class="clearance-dept-sub">${escapeAttr(clearanceAssigneeLabel(task.department))}: ${escapeAttr(mgrName)}</div>
      </div>
    </div>
    ${progressHtml}
    ${noteHtml}
    <div class="clearance-dept-actions">${actionHtml}${options.showViewExit && task.exitRecord?.id ? `<button class="btn btn-secondary btn-sm" onclick="window.__viewExit('${task.exitRecord.id}')">View exit</button>` : ""}</div>
  </article>`;
}

function renderClearanceExitCard(group, { doneOnly = false } = {}) {
  const emp = group.exit?.employee;
  const name = `${emp?.firstName ?? ""} ${emp?.lastName ?? ""}`.trim() || "Employee";
  const lwd = group.exit?.lastWorkingDate ?? group.exit?.requestedLastWorkingDay;
  const exitType = group.exit?.type ?? "—";
  const tasks = group.tasks;
  const total = tasks.length;
  const completed = tasks.filter((task) => task.status === "COMPLETED").length;
  const pctLabel = `${completed}/${total} departments`;

  return `<section class="clearance-exit-card">
    <div class="clearance-exit-head">
      <div class="clearance-exit-identity">
        <div class="clearance-exit-avatar">${escapeAttr(clearanceInitials(name))}</div>
        <div style="min-width:0">
          <div class="clearance-exit-name">${escapeAttr(name)} <span class="text-muted">(${escapeAttr(emp?.employeeCode ?? "—")})</span></div>
          <div class="clearance-exit-meta">${escapeAttr(formatLabel(exitType))} · LWD ${fmtDate(lwd)} · ${escapeAttr(emp?.department ?? "—")}</div>
        </div>
      </div>
      <div class="clearance-exit-progress-wrap">
        <div class="clearance-exit-progress-label">${pctLabel}</div>
        ${renderClearanceProgressBar(completed, total)}
      </div>
    </div>
    <div class="clearance-dept-grid">
      ${tasks.map((task) => renderClearanceDeptCard(task, { showViewExit: !doneOnly })).join("")}
    </div>
  </section>`;
}

function canCompleteClearanceTask(task) {
  if (!task || task.status === "COMPLETED") return false;
  if (task.department === "ADMIN" || task.department === "PRO" || task.department === "HR") {
    return elevatedRoles.has(me?.role);
  }
  return me?.role === "MANAGER" && task.assignedManagerId === me?.employee?.id;
}

function renderClearanceBoardHtml(tasks) {
  if (!tasks.length) {
    return `<div class="clearance-empty"><i class="bi bi-clipboard-check"></i>No clearance departments yet.</div>`;
  }
  return `<div class="clearance-board">${tasks.map((task) => renderClearanceDeptCard(task)).join("")}</div>`;
}

function renderClearanceTables() {
  const pendingList = document.getElementById("clearance-pending-list");
  const doneList = document.getElementById("clearance-done-list");
  const kpiPending = document.getElementById("clearance-kpi-pending");
  const kpiDone = document.getElementById("clearance-kpi-done");
  const kpiExits = document.getElementById("clearance-kpi-exits");
  if (!pendingList || !doneList) return;

  const pending = clearanceTasksCache.filter((t) => t.status !== "COMPLETED");
  const done = clearanceTasksCache.filter((t) => t.status === "COMPLETED");
  const pendingGroups = groupClearanceByExit(pending);
  const doneGroups = groupClearanceByExit(done);

  if (kpiPending) kpiPending.textContent = String(pending.length);
  if (kpiDone) kpiDone.textContent = String(done.length);
  if (kpiExits) kpiExits.textContent = String(new Set([...pending, ...done].map((t) => t.exitRecord?.id)).size);

  pendingList.innerHTML = pendingGroups.length
    ? pendingGroups.map((group) => renderClearanceExitCard(group)).join("")
    : `<div class="clearance-empty"><i class="bi bi-check2-circle"></i>You're all caught up — no pending clearance tasks.</div>`;

  doneList.innerHTML = doneGroups.length
    ? doneGroups.map((group) => renderClearanceExitCard(group, { doneOnly: true })).join("")
    : `<div class="clearance-empty"><i class="bi bi-inbox"></i>No completed clearance yet.</div>`;
}

async function loadClearance() {
  try {
    clearanceTasksCache = await api("/exits/clearance/tasks");
    if (!Array.isArray(clearanceTasksCache)) clearanceTasksCache = [];
    renderClearanceTables();
    renderNotifications();
  } catch (error) {
    clearanceTasksCache = [];
    renderClearanceTables();
    if (!isIndividualContributor(me?.role) && me?.role !== "PRO") {
      notify(error.message);
    }
  }
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

function buildUploadMeta(employeeId, extra = {}) {
  const employee = employeeId ? getEmployeeById(employeeId) : null;
  const employeeName = employee ? `${employee.firstName ?? ""} ${employee.lastName ?? ""}`.trim() : undefined;
  return {
    employeeId: employeeId || undefined,
    employeeName: employeeName || undefined,
    employeeCode: employee?.employeeCode || undefined,
    ...extra,
  };
}

async function uploadAttachment(inputId, category, meta = {}) {
  const input = document.getElementById(inputId);
  const file = input?.files?.[0];
  if (!file) return undefined;
  if (file.size > 5 * 1024 * 1024) {
    throw new Error("File exceeds the 5 MB limit");
  }
  const dataBase64 = await readFileAsBase64(file);
  const result = await api("/uploads", {
    method: "POST",
    body: JSON.stringify({
      fileName: file.name,
      mimeType: file.type,
      dataBase64,
      category,
      employeeId: meta.employeeId,
      employeeName: meta.employeeName,
      employeeCode: meta.employeeCode,
      documentType: meta.documentType,
      contextLabel: meta.contextLabel,
    }),
  });
  return result?.url;
}

function resolveAttachmentUrl(url = "") {
  if (!url) return "";
  if (/^https?:\/\//i.test(url)) return url;
  if (url.startsWith("/api/")) return url;
  if (url.startsWith("/")) return `${API_BASE}${url}`;
  return `${API_BASE}/${url}`;
}

function extractUploadId(url = "") {
  const match = String(url).match(/\/uploads\/([^/?#]+)/);
  return match?.[1] ?? null;
}

let docViewerObjectUrl = null;
let docViewerExternalUrl = null;

function parseAttachmentFileName(response, fallback = "Document") {
  const header = response?.headers?.get?.("Content-Disposition") ?? "";
  const encoded = header.match(/filename\*=UTF-8''([^;]+)/i)?.[1];
  if (encoded) {
    try {
      return decodeURIComponent(encoded);
    } catch {
      return fallback;
    }
  }
  return header.match(/filename="([^"]+)"/i)?.[1] ?? fallback;
}

function openDocumentViewerLoading(title = "Document") {
  const modal = document.getElementById("doc-viewer-modal");
  const titleEl = document.getElementById("doc-viewer-title");
  const body = document.getElementById("doc-viewer-body");
  if (titleEl) titleEl.textContent = title;
  if (body) {
    body.innerHTML = `<div class="doc-viewer-loading">Loading document…</div>`;
  }
  modal?.classList.add("open");
}

function renderDocumentViewerContent(body, { fileName, mimeType, srcUrl }) {
  body.replaceChildren();
  if (mimeType === "application/pdf") {
    const frame = document.createElement("iframe");
    frame.className = "doc-viewer-frame";
    frame.src = srcUrl;
    frame.title = fileName || "Document";
    body.appendChild(frame);
    return;
  }
  if (mimeType.startsWith("image/")) {
    const img = document.createElement("img");
    img.className = "doc-viewer-image";
    img.src = srcUrl;
    img.alt = fileName || "Document";
    body.appendChild(img);
    return;
  }

  const fallback = document.createElement("div");
  fallback.className = "doc-viewer-fallback";
  fallback.innerHTML = `<p>Preview is not available for this file type.</p>`;
  const link = document.createElement("a");
  link.className = "btn btn-primary btn-sm";
  link.href = srcUrl;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.textContent = "Download file";
  if (fileName) link.download = fileName;
  fallback.appendChild(link);
  body.appendChild(fallback);
}

function showDocumentViewer({ fileName, mimeType, srcUrl }) {
  const modal = document.getElementById("doc-viewer-modal");
  const titleEl = document.getElementById("doc-viewer-title");
  const body = document.getElementById("doc-viewer-body");
  const openTabBtn = document.getElementById("doc-viewer-open-tab");
  if (!modal || !body) return;

  docViewerExternalUrl = srcUrl;
  if (titleEl) titleEl.textContent = fileName || "Document";
  renderDocumentViewerContent(body, { fileName, mimeType, srcUrl });
  if (openTabBtn) {
    openTabBtn.onclick = () => {
      if (docViewerExternalUrl) {
        window.open(docViewerExternalUrl, "_blank", "noopener,noreferrer");
      }
    };
  }
  modal.classList.add("open");
}

window.__closeDocumentViewer = function closeDocumentViewer() {
  if (docViewerObjectUrl) {
    URL.revokeObjectURL(docViewerObjectUrl);
    docViewerObjectUrl = null;
  }
  docViewerExternalUrl = null;
  document.getElementById("doc-viewer-modal")?.classList.remove("open");
  const body = document.getElementById("doc-viewer-body");
  if (body) body.replaceChildren();
};

window.__viewAttachment = async function viewAttachment(url) {
  try {
    openDocumentViewerLoading("Document");

    let fileName = "Document";
    let mimeType = "application/octet-stream";
    let srcUrl = null;

    const uploadId = extractUploadId(url);
    if (uploadId) {
      const info = await api(`/uploads/${uploadId}/open`);
      fileName = info?.fileName || fileName;
      mimeType = info?.mimeType || mimeType;
      if (info?.mode === "redirect" && info.openUrl) {
        showDocumentViewer({ fileName, mimeType, srcUrl: info.openUrl });
        return;
      }
    }

    const targetUrl = resolveAttachmentUrl(url);
    const response = await fetch(targetUrl, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      cache: "no-store",
    });
    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      throw new Error(payload.message || "Unable to open document");
    }

    mimeType = response.headers.get("Content-Type")?.split(";")[0]?.trim() || mimeType;
    fileName = parseAttachmentFileName(response, fileName);
    const blob = await response.blob();
    const typedBlob = blob.type ? blob : new Blob([blob], { type: mimeType });
    if (docViewerObjectUrl) URL.revokeObjectURL(docViewerObjectUrl);
    docViewerObjectUrl = URL.createObjectURL(typedBlob);
    showDocumentViewer({ fileName, mimeType, srcUrl: docViewerObjectUrl });
  } catch (error) {
    window.__closeDocumentViewer();
    notify(error.message);
  }
};

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && document.getElementById("doc-viewer-modal")?.classList.contains("open")) {
    window.__closeDocumentViewer();
  }
});

window.__submitResignation = async function submitResignation() {
  try {
    const employeeId = document.getElementById("exit-emp-select")?.value;
    const resignationDate = document.getElementById("exit-resignation-date")?.value;
    const lwd = document.getElementById("exit-lwd")?.value;
    const reasonCategory = document.getElementById("exit-reason-category")?.value;
    const reason = document.getElementById("exit-reason")?.value.trim() ?? "";
    const confirmed = document.getElementById("exit-confirm")?.checked;

    if (!employeeId || !resignationDate || !lwd) {
      notify("Please fill employee, resignation date and last working day");
      return;
    }
    if (!confirmed) {
      notify("Please confirm the resignation declaration");
      return;
    }
    const supportingDocUrl = await uploadAttachment(
      "exit-doc-file",
      "RESIGNATION",
      buildUploadMeta(employeeId, { documentType: "RESIGNATION" }),
    );
    await api("/exits/resignation", {
      method: "POST",
      body: JSON.stringify({
        employeeId,
        resignationDate: toIsoFromInput(resignationDate),
        requestedLastWorkingDay: toIsoFromInput(lwd),
        reasonCategory,
        reason,
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
    const noticeStart = document.getElementById("term-notice-start")?.value;
    const lwd = document.getElementById("term-lwd")?.value;
    const notes = document.getElementById("term-notes")?.value.trim() ?? "";
    if (!employeeId || !noticeStart || !lwd) {
      notify("Please select employee, notice start date and last working date");
      return;
    }
    const supportingDocUrl = await uploadAttachment(
      "term-doc-file",
      "TERMINATION",
      buildUploadMeta(employeeId, { documentType: "TERMINATION" }),
    );
    await api("/exits/termination", {
      method: "POST",
      body: JSON.stringify({
        employeeId,
        reasonCategory,
        noticeStartDate: toIsoFromInput(noticeStart),
        lastWorkingDate: toIsoFromInput(lwd),
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
    record.status === "NEGOTIATION" || record.negotiationNotes ? `Negotiation in progress` : "",
    record.lmApprovedAt ? `Line Manager approved ${fmtDate(record.lmApprovedAt)}` : "",
    record.hrApprovedAt ? `HR approved ${fmtDate(record.hrApprovedAt)}` : "",
    record.ceoApprovedAt ? `Director approved ${fmtDate(record.ceoApprovedAt)}` : "",
    record.completedAt ? `Completed ${fmtDate(record.completedAt)}` : "",
    record.rejectedAt ? `Rejected/Cancelled ${fmtDate(record.rejectedAt)}` : "",
  ].filter(Boolean).map((t) => `<li>${escapeAttr(t)}</li>`).join("");

  const lineManager = record.employee?.manager;
  const assignedApprover = record.assignedApprover;
  const managerHtml = `
    <div style="margin-top:8px;padding:10px 12px;border:1px solid var(--border);border-radius:10px;font-size:13px;line-height:1.6">
      <div><b>Notice period:</b> ${record.noticePeriodDays ?? 30} days (from employee profile)</div>
      <div><b>From:</b> ${fmtDate(record.noticePeriodStartDate ?? record.resignationDate)} &nbsp;→&nbsp; <b>To:</b> ${fmtDate(addCalendarDaysForDisplay(record.noticePeriodStartDate ?? record.resignationDate, record.noticePeriodDays ?? 30))}</div>
      <div><b>Last working day:</b> ${fmtDate(record.lastWorkingDate ?? record.requestedLastWorkingDay)}${record.noticeShortfallDays ? ` <span class="badge badge-coral">Shortfall ${record.noticeShortfallDays} day(s)</span>` : ""}</div>
      <div><b>Line manager:</b> ${lineManager ? escapeAttr(`${lineManager.firstName ?? ""} ${lineManager.lastName ?? ""}`.trim()) + ` (${escapeAttr(lineManager.employeeCode ?? "—")})` : "Not assigned"}</div>
      ${assignedApprover ? `<div><b>${assignedApprover.id !== lineManager?.id ? "Acting approver" : "Approver"}:</b> ${escapeAttr(`${assignedApprover.firstName ?? ""} ${assignedApprover.lastName ?? ""}`.trim())} (${escapeAttr(assignedApprover.employeeCode ?? "—")})</div>` : ""}
      ${record.negotiationNotes ? `<div style="margin-top:6px"><b>Negotiation notes:</b> ${escapeAttr(record.negotiationNotes)}</div>` : ""}
    </div>`;

  const clearanceTasks = record.clearanceTasks ?? [];
  const clearanceTotal = clearanceTasks.length;
  const clearanceDone = clearanceTasks.filter((t) => t.status === "COMPLETED").length;
  const clearanceSection = clearanceTotal
    ? `<div>
        <div class="flex-between" style="gap:12px;flex-wrap:wrap;margin-bottom:10px">
          <div class="section-title" style="font-size:13px;margin:0">Department Clearance</div>
          <div style="min-width:120px;text-align:right">
            <div class="text-muted" style="font-size:11px;margin-bottom:4px">${clearanceDone}/${clearanceTotal} departments cleared</div>
            ${renderClearanceProgressBar(clearanceDone, clearanceTotal)}
          </div>
        </div>
        ${renderClearanceBoardHtml(clearanceTasks)}
        <div style="margin-top:10px"><button class="btn btn-secondary btn-sm" onclick="closeActionModal();window.__goClearancePage()"><i class="bi bi-box-arrow-up-right"></i> Open Clearance page</button></div>
      </div>`
    : "";

  const s = record.finalSettlement;
  const settlementCurrency = emp?.netPayCurrency;
  const settlementMoney = (value) => formatProfileMoney(value, settlementCurrency);
  const settlementCode = formatCurrencyLabel(settlementCurrency);
  const settlementHtml = s ? `
    <div class="stats-grid" style="margin-top:8px">
      <div class="stat-card"><div class="stat-label">Gratuity (EOSB)</div><div class="stat-value tone-teal">${escapeAttr(settlementMoney(s.gratuity))}</div></div>
      <div class="stat-card"><div class="stat-label">Leave Encashment</div><div class="stat-value tone-accent">${escapeAttr(settlementMoney(s.leaveEncashment))}</div></div>
      <div class="stat-card"><div class="stat-label">Deductions</div><div class="stat-value tone-danger">${escapeAttr(settlementMoney(s.deductions))}</div></div>
      <div class="stat-card"><div class="stat-label">Net Settlement${settlementCode ? ` (${settlementCode})` : ""}</div><div class="stat-value tone-gold">${escapeAttr(settlementMoney(s.netSettlement))}</div></div>
    </div>
    <div class="text-muted" style="font-size:12px;margin-top:6px">Years of service: ${Number(s.yearsOfService).toFixed(2)} • Unpaid salary: ${escapeAttr(settlementMoney(s.unpaidSalary))} • Other additions: ${escapeAttr(settlementMoney(s.otherAdditions))}</div>
  ` : "";

  // Stage-specific actions
  const canApproveResignation = (record.status === "NEGOTIATION" || record.status === "PENDING")
    && record.type === "RESIGNATION"
    && (isElevated || isManager);
  const isAssignedApprover = record.assignedApproverId === me?.employee?.id
    || record.employee?.managerId === me?.employee?.id;

  const inNegotiation = record.status === "NEGOTIATION" || record.status === "PENDING" || record.status === "INITIATED";

  let actions = "";
  let negotiationBanner = "";
  if (inNegotiation) {
    negotiationBanner = `<div class="alert alert-info" style="font-size:13px;margin-bottom:10px">Negotiation is in progress. Set the notice period start date below — notice only counts from that date forward.</div>`;
  }
  if (canApproveResignation && (isElevated || isAssignedApprover)) {
    actions = `
      <div class="form-grid" style="margin-bottom:10px">
        ${renderNoticeStartFieldsHtml(record, "exit-lm")}
        <div class="form-group full">
          <label>Negotiation notes (optional)</label>
          <textarea id="exit-lm-notes" placeholder="Summarize negotiation outcome…">${escapeAttr(record.negotiationNotes ?? "")}</textarea>
        </div>
      </div>
      <button class="btn btn-accent btn-sm" onclick="window.__exitLmApprove('${record.id}')">End Negotiation & Proceed</button>`;
  } else if (record.status === "LM_APPROVED" && isElevated) {
    actions = `
      <div class="form-grid" style="margin-bottom:10px">
        <div class="form-group"><label>Confirm Last Working Day</label><input id="exit-hr-lwd" type="date" value="${record.requestedLastWorkingDay ? new Date(record.requestedLastWorkingDay).toISOString().slice(0,10) : ""}"></div>
        <div class="form-group"><label>Notice Shortfall (days)</label><input id="exit-hr-shortfall" type="number" min="0" value="${record.noticeShortfallDays ?? 0}"></div>
      </div>
      <button class="btn btn-primary btn-sm" onclick="window.__exitHrApprove('${record.id}')">HR Approve & Start Clearance</button>`;
  } else if (inNegotiation && record.type === "TERMINATION" && (isElevated || (isManager && isAssignedApprover))) {
    actions = `
      <div class="form-grid" style="margin-bottom:10px">
        ${renderNoticeStartFieldsHtml(record, "exit-term")}
        <div class="form-group full"><label>Incident / Documentation Notes</label><textarea id="exit-doc-notes">${escapeAttr(record.incidentNotes ?? "")}</textarea></div>
        <div class="form-group full">
          <label>Negotiation notes (optional)</label>
          <textarea id="exit-term-notes" placeholder="Summarize negotiation outcome…">${escapeAttr(record.negotiationNotes ?? "")}</textarea>
        </div>
      </div>
      <button class="btn btn-primary btn-sm" onclick="window.__exitDocument('${record.id}')">End Negotiation & Proceed</button>`;
  } else if (record.status === "DOCUMENTED" && isCeo) {
    actions = `<button class="btn btn-primary btn-sm" onclick="window.__exitAction('${record.id}','ceo-approve')">Final Approve & Start Clearance</button>`;
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
        Shortfall: ${record.noticeShortfallDays ?? 0} days • LWD: ${fmtDate(record.lastWorkingDate ?? record.requestedLastWorkingDay)}
      </div>
      ${negotiationBanner}
      ${managerHtml}
      ${record.supportingDocUrl ? `<div><button class="btn btn-secondary btn-sm" onclick="window.__viewAttachment('${escapeAttr(record.supportingDocUrl)}')"><i class="bi bi-paperclip"></i> View Supporting Document</button></div>` : ""}
      ${rejectionHtml}
      ${timeline ? `<div><div class="section-title" style="font-size:13px">Progress</div><ul class="emp-tooltip-list" style="padding-left:16px;list-style:disc">${timeline}</ul></div>` : ""}
      ${clearanceSection ? clearanceSection : ""}
      ${settlementHtml ? `<div><div class="section-title" style="font-size:13px">Final Settlement</div>${settlementHtml}</div>` : ""}
      ${(actions || rejectBtn) ? `<div><div class="section-title" style="font-size:13px">Actions</div><div class="flex gap-8" style="flex-wrap:wrap">${actions}${rejectBtn}</div></div>` : ""}
    </div>`;
}

window.__deleteExit = async function deleteExit(exitId) {
  try {
    const record = exitRecordsCache.find((r) => r.id === exitId);
    const emp = record?.employee;
    const label = emp ? ` for ${`${emp.firstName ?? ""} ${emp.lastName ?? ""}`.trim()}` : "";
    if (!window.confirm(`Delete this exit record${label}? This cannot be undone.`)) return;
    await api(`/exits/${exitId}`, { method: "DELETE" });
    notify("Exit record deleted");
    closeActionModal();
    await loadExits();
  } catch (error) {
    notify(error.message);
  }
};

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

window.__exitLmApprove = async function exitLmApprove(exitId) {
  try {
    const noticeStartDate = document.getElementById("exit-lm-notice-start-date")?.value;
    const negotiationNotes = document.getElementById("exit-lm-notes")?.value.trim() ?? "";
    if (!noticeStartDate) {
      notify("Please select when the notice period starts");
      return;
    }
    await api(`/exits/${exitId}/lm-approve`, {
      method: "POST",
      body: JSON.stringify({
        noticePeriodStartDate: toIsoFromInput(noticeStartDate),
        negotiationNotes: negotiationNotes || undefined,
      }),
    });
    notify("Negotiation ended; notice period start recorded");
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
    const noticeStartDate = document.getElementById("exit-term-notice-start-date")?.value;
    const notes = document.getElementById("exit-doc-notes")?.value ?? "";
    const negotiationNotes = document.getElementById("exit-term-notes")?.value.trim() ?? "";
    if (!noticeStartDate) {
      notify("Please select when the notice period starts");
      return;
    }
    await api(`/exits/${exitId}/document`, {
      method: "POST",
      body: JSON.stringify({
        noticePeriodStartDate: toIsoFromInput(noticeStartDate),
        incidentNotes: notes,
        negotiationNotes: negotiationNotes || undefined,
      }),
    });
    notify("Negotiation ended; notice period start recorded");
    await refreshExitModal(exitId);
  } catch (error) {
    notify(error.message);
  }
};

window.__exitClearance = async function exitClearance(taskId, note) {
  try {
    const remarks = note?.trim() ?? "";
    if (remarks.length < 3) {
      notify("Please enter a clearance note (at least 3 characters)");
      return;
    }
    await api(`/exits/clearance/${taskId}`, {
      method: "PATCH",
      body: JSON.stringify({ status: "COMPLETED", remarks }),
    });
    notify("Clearance marked complete");
    closeActionModal();
    await loadClearance();
    await loadExits();
  } catch (error) {
    notify(error.message);
  }
};

window.__goClearancePage = function goClearancePage() {
  const nav = document.querySelector(".nav-item[onclick*=\"navigate('clearance'\"]");
  if (typeof window.navigate === "function") {
    window.navigate("clearance", nav);
  }
  loadClearance().catch((error) => notify(error.message));
};

window.__openClearanceComplete = function openClearanceComplete(taskId, department, employeeName) {
  openActionModal({
    title: `Complete ${formatClearanceDepartment(department)} Clearance`,
    saveLabel: "Mark Done",
    bodyHtml: `
      <div style="display:grid;gap:10px">
        <div class="text-muted" style="font-size:13px">Employee: <b>${escapeAttr(employeeName)}</b></div>
        <div class="form-group full">
          <label>Clearance note (required)</label>
          <textarea id="clearance-note-input" placeholder="Describe what was cleared / returned / settled…" rows="4"></textarea>
        </div>
      </div>`,
    onSave: async () => {
      const note = document.getElementById("clearance-note-input")?.value ?? "";
      await window.__exitClearance(taskId, note);
    },
  });
};

function findClearanceTask(taskId) {
  const fromCache = clearanceTasksCache.find((task) => task.id === taskId);
  if (fromCache) return fromCache;
  for (const record of exitRecordsCache) {
    const match = (record.clearanceTasks ?? []).find((task) => task.id === taskId);
    if (match) return match;
  }
  return null;
}

async function refreshAfterChecklistUpdate(exitId) {
  await loadClearance();
  await loadExits();
  if (exitId) await refreshExitModal(exitId);
}

window.__updateChecklistItem = async function updateChecklistItem(itemId, taskId, status, note, options = {}) {
  try {
    const remarks = note?.trim() || undefined;
    const body = { status, remarks };
    if (options.amount != null) body.amount = Number(options.amount);
    if (options.adjustmentType) body.adjustmentType = options.adjustmentType;

    const result = await api(`/exits/clearance/checklist/${itemId}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    });
    const adj = result?.item?.payrollAdjustment;
    if (adj?.referenceNumber) {
      notify(`Checklist updated — pay adjustment ${adj.referenceNumber} created (${formatLabel(adj.status)})`);
    } else {
      notify(`Checklist item updated (${checklistItemStatusLabel(status)})`);
    }
    if (result?.task) {
      const cacheTask = clearanceTasksCache.find((task) => task.id === taskId);
      if (cacheTask) Object.assign(cacheTask, result.task);
    }
    await refreshAfterChecklistUpdate(result?.exit?.id);
    const modal = document.getElementById("emp-action-modal");
    if (modal && taskId) window.__openClearanceChecklist(taskId);
  } catch (error) {
    notify(error.message);
  }
};

window.__completeFinancialChecklistItem = function completeFinancialChecklistItem(itemId, taskId, status) {
  const amount = Number(document.getElementById(`check-amount-${itemId}`)?.value ?? 0);
  const adjustmentType = document.getElementById(`check-adj-type-${itemId}`)?.value ?? "DEDUCTION";
  const note = document.getElementById(`check-note-${itemId}`)?.value ?? "";
  if (status === "COMPLETED" && (!amount || amount <= 0)) {
    notify("Enter the amount (AED) to record as a pay adjustment");
    return;
  }
  window.__updateChecklistItem(itemId, taskId, status, note, { amount, adjustmentType });
};

window.__openClearanceChecklist = function openClearanceChecklist(taskId) {
  const task = findClearanceTask(taskId);
  if (!task) {
    notify("Clearance task not found");
    return;
  }
  const emp = task.exitRecord?.employee;
  const employeeName = emp ? `${emp.firstName ?? ""} ${emp.lastName ?? ""}`.trim() : "Employee";
  const items = task.checklistItems ?? [];
  const progress = clearanceChecklistProgress(task);
  const deptLabel = formatClearanceDepartment(task.department);
  const meta = clearanceDeptMeta(task.department);
  const canEdit = canCompleteClearanceTask(task);
  const rows = items
    .map((item) => {
      const resolved = checklistItemResolved(item.status);
      const financial = isFinancialClearanceItem(item);
      const statusClass = item.status === "COMPLETED" ? "is-collected" : item.status === "NOT_APPLICABLE" ? "is-na" : "";
      const noteField = !resolved && canEdit
        ? `<input type="text" class="clearance-check-note" id="check-note-${item.id}" placeholder="Optional note…">`
        : item.remarks
          ? `<div class="text-muted" style="font-size:12px;line-height:1.45">${escapeAttr(item.remarks)}</div>`
          : "";
      const financialFields = financial && !resolved && canEdit
        ? `<div class="clearance-financial-fields">
            <input type="number" class="clearance-check-amount" id="check-amount-${item.id}" min="0.01" step="0.01" placeholder="Amount (AED)">
            <select id="check-adj-type-${item.id}">
              <option value="DEDUCTION">Deduction</option>
              ${item.itemKey === "IOU" ? '<option value="ADDITION">Addition (credit)</option>' : ""}
            </select>
          </div>`
        : "";
      const actions = !canEdit
        ? ""
        : resolved
          ? `<div class="clearance-check-actions"><button class="btn btn-secondary btn-sm" onclick="window.__updateChecklistItem('${item.id}','${task.id}','PENDING')"><i class="bi bi-arrow-counterclockwise"></i> Reopen</button></div>`
          : financial
            ? `<div class="clearance-check-actions">
                <button class="btn btn-accent btn-sm" onclick="window.__completeFinancialChecklistItem('${item.id}','${task.id}','COMPLETED')"><i class="bi bi-cash-stack"></i> Record &amp; Collect</button>
                <button class="btn btn-secondary btn-sm" onclick="window.__updateChecklistItem('${item.id}','${task.id}','NOT_APPLICABLE', document.getElementById('check-note-${item.id}')?.value)">N/A</button>
              </div>`
            : `<div class="clearance-check-actions">
                <button class="btn btn-accent btn-sm" onclick="window.__updateChecklistItem('${item.id}','${task.id}','COMPLETED', document.getElementById('check-note-${item.id}')?.value)"><i class="bi bi-check2"></i> Collected</button>
                <button class="btn btn-secondary btn-sm" onclick="window.__updateChecklistItem('${item.id}','${task.id}','NOT_APPLICABLE', document.getElementById('check-note-${item.id}')?.value)">N/A</button>
              </div>`;
      return `<article class="clearance-check-item ${statusClass}${financial ? " is-financial" : ""}">
        <div class="clearance-check-item-top">
          <div style="min-width:0;flex:1">
            <div class="clearance-check-item-title">${escapeAttr(item.label)}${financial ? ' <span class="badge badge-blue" style="margin-left:6px">Payroll</span>' : ""}</div>
            ${financial && !resolved && canEdit ? `<div class="text-muted" style="font-size:12px;margin:4px 0 8px">Enter amount — creates a pay adjustment draft for final settlement payroll.</div>` : ""}
            ${renderClearanceAdjustmentMeta(item)}
            ${financialFields}
            ${noteField}
          </div>
          <span class="badge ${checklistItemBadge(item.status)}">${checklistItemStatusLabel(item.status)}</span>
        </div>
        ${actions}
      </article>`;
    })
    .join("");

  openActionModal({
    title: `${deptLabel}${progress ? ` · ${progress.done}/${progress.total}` : ""}`,
    hideSave: true,
    bodyHtml: `
      <div class="clearance-checklist-shell">
        <div class="clearance-checklist-head">
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">
            <div class="clearance-dept-icon ${meta.tone}"><i class="bi ${meta.icon}"></i></div>
            <div>
              <div style="font-weight:700">${escapeAttr(deptLabel)}</div>
              <div class="text-muted" style="font-size:12px;margin-top:2px">Employee: <b>${escapeAttr(employeeName)}</b> (${escapeAttr(emp?.employeeCode ?? "—")})</div>
            </div>
          </div>
          ${progress ? renderClearanceProgressBar(progress.done, progress.total) : ""}
          <div class="text-muted" style="font-size:12px;margin-top:8px;line-height:1.5">Mark each item as <b>Collected</b> or <b>N/A</b>. Finance items (Loan, Advance, IOU) require an amount and create a <b>pay adjustment</b> for payroll.</div>
        </div>
        <div class="clearance-checklist-items">
          ${rows || `<div class="clearance-empty"><i class="bi bi-list-check"></i>No checklist items found.</div>`}
        </div>
      </div>`,
  });
};

// Legacy aliases
window.__completeItChecklistItem = (itemId, taskId, note) => window.__updateChecklistItem(itemId, taskId, "COMPLETED", note);
window.__reopenItChecklistItem = (itemId, taskId) => window.__updateChecklistItem(itemId, taskId, "PENDING");
window.__openItClearanceChecklist = window.__openClearanceChecklist;

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
  if (status === "PENDING_L2") return "badge-blue";
  return "badge-amber";
}

function formatAdjustmentStatus(adj) {
  if (adj.status === "PENDING_L2") return "Pending Final Approval";
  if (adj.status === "DRAFT" && adj.requiresDualApproval) return "Draft (Dual Approval)";
  return formatLabel(adj.status);
}

function canHrApproveAdjustment() {
  return elevatedRoles.has(me?.role);
}

function canFinalApproveAdjustment() {
  return me?.role === "SUPER_ADMIN" || me?.role === "CEO";
}

function updateAdjustmentDualNote() {
  const amount = Number(document.getElementById("adj-amount")?.value ?? 0);
  const note = document.getElementById("adj-dual-threshold-note");
  if (!note) return;
  if (amount >= adjustmentDualThreshold) {
    note.style.display = "";
    note.textContent = `Amount is at or above AED ${adjustmentDualThreshold.toLocaleString("en-US")}. This adjustment will require HR approval, then CEO / Super Admin final approval.`;
  } else {
    note.style.display = "none";
    note.textContent = "";
  }
}

function isFinanceManagerUser() {
  const dept = (me?.employee?.department ?? "").trim().toLowerCase();
  return me?.role === "MANAGER" && dept === "finance";
}

function canHrApproveLoan() {
  return elevatedRoles.has(me?.role) || me?.role === "SUPER_ADMIN" || me?.role === "CEO";
}

let loanListTab = "pending";

window.__switchLoanListTab = function switchLoanListTab(btn, tab) {
  loanListTab = tab;
  btn.parentElement?.querySelectorAll(".tab-btn").forEach((el) => el.classList.remove("active"));
  btn.classList.add("active");
  renderLoansTable();
};

function filterLoansByTab(loans) {
  const myId = me?.employee?.id;
  const isPendingForMe = (loan) => {
    if (loan.status === "PENDING_FINANCE" && isFinanceManagerUser()) return true;
    if (loan.status === "PENDING_HR" && canHrApproveLoan()) return true;
    if (loan.status === "PENDING_FINANCE" || loan.status === "PENDING_HR") {
      return loan.employeeId === myId || loan.employee?.id === myId;
    }
    return false;
  };
  if (loanListTab === "pending") {
    return loans.filter(isPendingForMe);
  }
  return loans.filter((loan) => !isPendingForMe(loan));
}

function populateLoanEmpSelect() {
  const wrap = document.getElementById("loan-emp-wrap");
  const select = document.getElementById("loan-emp-select");
  const selfLabel = document.getElementById("loan-self-label");
  const role = me?.role;

  if (isIndividualContributor(role) || role === "PRO") {
    if (wrap) wrap.style.display = "none";
    if (selfLabel) {
      selfLabel.style.display = "";
      const name = `${me?.employee?.firstName ?? ""} ${me?.employee?.lastName ?? ""}`.trim();
      selfLabel.textContent = `Requesting for: ${name} (${me?.employee?.employeeCode ?? "—"})`;
    }
    return;
  }

  if (wrap) wrap.style.display = "";
  if (selfLabel) selfLabel.style.display = "none";
  const source = elevatedRoles.has(role)
    ? allEmployees
    : role === "MANAGER"
      ? allEmployees.filter((emp) => emp.id === me?.employee?.id || emp.managerId === me?.employee?.id)
      : [];
  const optionsHtml = `<option value="">Select employee…</option>` + source
    .map((emp) => `<option value="${emp.id}">${escapeAttr(`${emp.firstName ?? ""} ${emp.lastName ?? ""}`.trim())} (${escapeAttr(emp.employeeCode ?? "—")})</option>`)
    .join("");
  if (select) select.innerHTML = optionsHtml;
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
  const el = document.getElementById("adj-emp-select");
  if (el) el.innerHTML = optionsHtml;
  populateLoanEmpSelect();
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
    updateAdjustmentDualNote();
    const note = document.getElementById("loan-threshold-note");
    if (note) {
      note.textContent = `Loans/advances at or above AED ${adjustmentDualThreshold.toLocaleString("en-US")} are flagged for dual approval. All requests still go Finance → HR before activation.`;
    }
  } catch (_error) {
    adjustmentCategories = [];
  }
}

function renderAdjustmentsTable() {
  const tbody = document.getElementById("adj-list-body");
  const mobileList = document.getElementById("adj-list-mobile");
  if (!tbody) return;
  if (!adjustmentsCache.length) {
    tbody.innerHTML = `<tr><td colspan="8" class="text-muted">No adjustments found.</td></tr>`;
    if (mobileList) mobileList.innerHTML = `<div class="mobile-empty">No adjustments found.</div>`;
    return;
  }
  const canHr = canHrApproveAdjustment();
  const canFinal = canFinalApproveAdjustment();
  const catLabel = (code) => adjustmentCategories.find((c) => c.code === code)?.label ?? formatLabel(code);
  const rendered = adjustmentsCache.map((adj) => {
    const emp = adj.employee;
    const name = `${emp?.firstName ?? ""} ${emp?.lastName ?? ""}`.trim();
    const typeBadge = adj.type === "ADDITION" ? "badge-green" : "badge-coral";
    const dualBadge = adj.requiresDualApproval
      ? `<span class="badge badge-blue" style="margin-left:6px" title="Requires dual approval">Dual</span>`
      : "";
    let action = `<span class="text-muted">—</span>`;
    if (canHr && adj.status === "DRAFT") {
      const label = adj.requiresDualApproval ? "Approve (HR)" : "Approve";
      action = `<div class="flex gap-8"><button class="btn btn-accent btn-sm" onclick="window.__approveAdjustment('${adj.id}')">${label}</button><button class="btn btn-danger btn-sm" onclick="window.__rejectAdjustment('${adj.id}')">Reject</button></div>`;
    } else if (canFinal && adj.status === "PENDING_L2") {
      action = `<div class="flex gap-8"><button class="btn btn-accent btn-sm" onclick="window.__approveAdjustment('${adj.id}')">Final Approve</button><button class="btn btn-danger btn-sm" onclick="window.__rejectAdjustment('${adj.id}')">Reject</button></div>`;
    } else if (adj.status === "PENDING_L2") {
      action = `<span class="text-muted" style="font-size:12px">Awaiting CEO / Super Admin</span>`;
    } else if (canHr && adj.status === "APPROVED") {
      action = `<button class="btn btn-danger btn-sm" onclick="window.__rejectAdjustment('${adj.id}')">Reject</button>`;
    }
    const monthLabel = `${MONTH_NAMES[(adj.effectiveMonth ?? 1) - 1]} ${adj.effectiveYear}`;
    const amountLabel = `AED ${Number(adj.amount).toLocaleString("en-US")}`;
    const statusBadge = adjStatusBadge(adj.status);
    const statusLabel = formatAdjustmentStatus(adj);

    const tableRow = `
      <tr>
        <td>${escapeAttr(adj.referenceNumber)}</td>
        <td>${escapeAttr(name)}</td>
        <td><span class="badge ${typeBadge}">${formatLabel(adj.type)}</span>${dualBadge}</td>
        <td>${escapeAttr(catLabel(adj.category))}</td>
        <td>${amountLabel}</td>
        <td>${monthLabel}</td>
        <td><span class="badge ${statusBadge}">${escapeAttr(statusLabel)}</span></td>
        <td>${action}</td>
      </tr>`;

    const mobileCard = `
      <article class="record-card">
        <div class="record-card-head">
          <div class="record-card-head-main">
            <div class="record-card-name">${escapeAttr(adj.referenceNumber)}</div>
            <div class="record-card-sub">${escapeAttr(name)}${emp?.employeeCode ? ` · ${escapeAttr(emp.employeeCode)}` : ""}</div>
            <div class="record-card-badges">
              <span class="badge ${typeBadge}">${formatLabel(adj.type)}</span>
              <span class="badge ${statusBadge}">${escapeAttr(statusLabel)}</span>
              ${adj.requiresDualApproval ? `<span class="badge badge-blue">Dual</span>` : ""}
            </div>
          </div>
        </div>
        <div class="record-card-grid">
          <div class="record-card-field"><span class="record-card-label">Category</span><span class="record-card-value">${escapeAttr(catLabel(adj.category))}</span></div>
          <div class="record-card-field"><span class="record-card-label">Amount</span><span class="record-card-value">${amountLabel}</span></div>
          <div class="record-card-field"><span class="record-card-label">Effective Month</span><span class="record-card-value">${monthLabel}</span></div>
        </div>
        ${action.includes("btn") || action.includes("Awaiting") ? `<div class="record-card-actions">${action}</div>` : ""}
      </article>`;

    return { tableRow, mobileCard };
  });

  tbody.innerHTML = rendered.map((row) => row.tableRow).join("");
  if (mobileList) mobileList.innerHTML = rendered.map((row) => row.mobileCard).join("");
}

function loanStatusBadge(status) {
  if (status === "ACTIVE" || status === "CLOSED") return "badge-green";
  if (status === "REJECTED") return "badge-coral";
  if (status === "PENDING_HR") return "badge-blue";
  return "badge-amber";
}

function renderLoansTable() {
  const tbody = document.getElementById("adj-loans-body");
  const mobileList = document.getElementById("adj-loans-mobile");
  const summary = document.getElementById("loan-list-summary");
  if (!tbody) return;

  const filtered = filterLoansByTab(loansCache);
  const pendingAll = loansCache.filter((loan) => {
    const myId = me?.employee?.id;
    if (loan.status === "PENDING_FINANCE" && isFinanceManagerUser()) return true;
    if (loan.status === "PENDING_HR" && canHrApproveLoan()) return true;
    if (loan.status === "PENDING_FINANCE" || loan.status === "PENDING_HR") {
      return loan.employeeId === myId || loan.employee?.id === myId;
    }
    return false;
  }).length;
  const historyAll = loansCache.length - pendingAll;
  if (summary) {
    summary.textContent = loanListTab === "pending"
      ? `${filtered.length} pending`
      : `${filtered.length} in history · ${pendingAll} still pending`;
  }

  const emptyMessage = loanListTab === "pending" ? "No pending loan/advance requests." : "No loan/advance history yet.";
  if (!filtered.length) {
    tbody.innerHTML = `<tr><td colspan="8" class="text-muted">${emptyMessage}</td></tr>`;
    if (mobileList) mobileList.innerHTML = `<div class="mobile-empty">${emptyMessage}</div>`;
    return;
  }

  const rendered = filtered.map((loan) => {
    const emp = loan.employee;
    const name = `${emp?.firstName ?? ""} ${emp?.lastName ?? ""}`.trim();
    const outstanding = Number(loan.outstandingAmount ?? Math.max(0, loan.totalAmount - loan.recoveredAmount));
    const docCell = loan.supportingDocUrl
      ? `<button class="btn btn-secondary btn-sm" onclick="window.__viewAttachment('${escapeAttr(loan.supportingDocUrl)}')"><i class="bi bi-paperclip"></i> View</button>`
      : `<span class="text-muted">—</span>`;
    let action = `<span class="text-muted">—</span>`;
    if (loan.status === "PENDING_FINANCE" && isFinanceManagerUser()) {
      action = `<div class="flex gap-8"><button class="btn btn-accent btn-sm" onclick="window.__openLoanApprove('${loan.id}','finance')">Finance Approve</button><button class="btn btn-danger btn-sm" onclick="window.__rejectLoan('${loan.id}')">Reject</button></div>`;
    } else if (loan.status === "PENDING_HR" && canHrApproveLoan()) {
      action = `<div class="flex gap-8"><button class="btn btn-accent btn-sm" onclick="window.__openLoanApprove('${loan.id}','hr')">HR / Admin Approve</button><button class="btn btn-danger btn-sm" onclick="window.__rejectLoan('${loan.id}')">Reject</button></div>`;
    } else if (loan.status === "PENDING_FINANCE") {
      action = `<span class="text-muted" style="font-size:12px">Awaiting Finance</span>`;
    } else if (loan.status === "PENDING_HR") {
      const financeNote = loan.financeApprovalNote ? `<div class="text-muted" style="font-size:11px;margin-top:4px">Finance: ${escapeAttr(loan.financeApprovalNote)}</div>` : "";
      action = `<span class="text-muted" style="font-size:12px">Awaiting HR / Admin</span>${financeNote}`;
    } else if (loan.status === "ACTIVE" || loan.status === "CLOSED") {
      action = `<span class="text-muted" style="font-size:12px">Approved</span>`;
    } else if (loan.status === "REJECTED") {
      action = `<span class="text-muted" style="font-size:12px">Rejected</span>`;
    }

    const totalLabel = `AED ${Number(loan.totalAmount).toLocaleString("en-US")}`;
    const recoveredLabel = `AED ${Number(loan.recoveredAmount).toLocaleString("en-US")}`;
    const outstandingLabel = `AED ${outstanding.toLocaleString("en-US")}`;
    const statusBadge = loanStatusBadge(loan.status);
    const statusLabel = formatLabel(loan.status);

    const tableRow = `
      <tr>
        <td>${escapeAttr(name)}</td>
        <td><span class="badge badge-blue">${formatLabel(loan.type)}</span></td>
        <td>${totalLabel}</td>
        <td>${recoveredLabel}</td>
        <td>${outstandingLabel}</td>
        <td><span class="badge ${statusBadge}">${escapeAttr(statusLabel)}</span></td>
        <td>${docCell}</td>
        <td>${action}</td>
      </tr>`;

    const mobileCard = `
      <article class="record-card">
        <div class="record-card-head">
          <div class="record-card-head-main">
            <div class="record-card-name">${escapeAttr(name)}</div>
            <div class="record-card-sub">${escapeAttr(emp?.employeeCode ?? "—")}${emp?.department ? ` · ${escapeAttr(emp.department)}` : ""}</div>
            <div class="record-card-badges">
              <span class="badge badge-blue">${formatLabel(loan.type)}</span>
              <span class="badge ${statusBadge}">${escapeAttr(statusLabel)}</span>
            </div>
          </div>
        </div>
        <div class="record-card-grid">
          <div class="record-card-field"><span class="record-card-label">Total</span><span class="record-card-value">${totalLabel}</span></div>
          <div class="record-card-field"><span class="record-card-label">Recovered</span><span class="record-card-value">${recoveredLabel}</span></div>
          <div class="record-card-field"><span class="record-card-label">Outstanding</span><span class="record-card-value">${outstandingLabel}</span></div>
        </div>
        <div class="record-card-actions">
          ${loan.supportingDocUrl ? docCell : ""}
          ${action}
        </div>
      </article>`;

    return { tableRow, mobileCard };
  });

  tbody.innerHTML = rendered.map((row) => row.tableRow).join("");
  if (mobileList) mobileList.innerHTML = rendered.map((row) => row.mobileCard).join("");
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
    const supportingDocUrl = await uploadAttachment(
      "adj-doc-file",
      "ADJUSTMENT",
      buildUploadMeta(employeeId, { documentType: category }),
    );
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
    const dualMsg = amount >= adjustmentDualThreshold
      ? "Adjustment created. HR approval, then CEO / Super Admin final approval required."
      : "Adjustment created (pending HR approval)";
    notify(dualMsg);
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
    const result = await api(`/adjustments/${id}/approve`, { method: "POST", body: JSON.stringify({}) });
    notify(result?.message ?? "Adjustment approved");
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
    const role = me?.role;
    let employeeId = document.getElementById("loan-emp-select")?.value;
    if (isIndividualContributor(role) || role === "PRO") {
      employeeId = me?.employee?.id;
    }
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
    const supportingDocUrl = await uploadAttachment(
      "loan-doc-file",
      "LOAN",
      buildUploadMeta(employeeId, { documentType: type }),
    );
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
        supportingDocUrl,
      }),
    });
    notify("Loan/advance request submitted");
    document.getElementById("loan-total").value = "";
    document.getElementById("loan-installment").value = "";
    document.getElementById("loan-reason").value = "";
    const loanFile = document.getElementById("loan-doc-file");
    if (loanFile) loanFile.value = "";
    await loadAdjustments();
  } catch (error) {
    notify(error.message);
  }
};

window.__openLoanApprove = function openLoanApprove(loanId, stage) {
  const title = stage === "finance" ? "Finance Approval" : "HR / Admin Approval";
  openActionModal({
    title,
    saveLabel: "Approve",
    bodyHtml: `
      <div class="form-group full">
        <label>Approval note (required)</label>
        <textarea id="loan-approval-note" placeholder="Enter approval note…" rows="4"></textarea>
      </div>`,
    onSave: async () => {
      const note = document.getElementById("loan-approval-note")?.value?.trim() ?? "";
      if (note.length < 3) {
        notify("Please enter an approval note (at least 3 characters)");
        return;
      }
      if (stage === "finance") {
        await window.__approveLoanFinance(loanId, note);
      } else {
        await window.__approveLoanHr(loanId, note);
      }
      closeActionModal();
    },
  });
};

window.__approveLoanFinance = async function approveLoanFinance(id, note) {
  try {
    await api(`/adjustments/loans/${id}/finance-approve`, {
      method: "POST",
      body: JSON.stringify({ note }),
    });
    notify("Finance approval recorded — awaiting HR/Admin");
    await loadAdjustments();
  } catch (error) {
    notify(error.message);
  }
};

window.__approveLoanHr = async function approveLoanHr(id, note) {
  try {
    await api(`/adjustments/loans/${id}/hr-approve`, {
      method: "POST",
      body: JSON.stringify({ note }),
    });
    notify("HR/Admin approval recorded — loan/advance is active");
    await loadAdjustments();
  } catch (error) {
    notify(error.message);
  }
};

window.__approveLoan = async function approveLoan(id) {
  notify("Use Finance Approve or HR Approve with a note");
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
  document.getElementById("adj-amount")?.addEventListener("input", updateAdjustmentDualNote);
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
let editingProDocId = null;
let documentExpiryAlertMonths = 6;

function documentExpiryAlertLabel() {
  return documentExpiryAlertMonths === 1 ? "1 month" : `${documentExpiryAlertMonths} months`;
}

function documentExpiryAlertTitle(count) {
  return `${count} Document(s) Expiring Within ${documentExpiryAlertLabel()}`;
}

function documentExpiryWindowLabel() {
  return `Within ${documentExpiryAlertLabel()} expiry window`;
}

function canSearchEmployeeDocuments() {
  return elevatedRoles.has(me?.role) || me?.role === "PRO" || me?.role === "CEO";
}

function getExpiringDocuments(docs = proDocsCache) {
  let list = (docs ?? []).filter((doc) => doc.computedStatus === "EXPIRING" || doc.computedStatus === "EXPIRED");
  if (isIndividualContributor(me?.role) || me?.role === "MANAGER") {
    list = list.filter((doc) => doc.employeeId === me?.employee?.id);
  }
  return list;
}

function formatDocTypeLabel(docType) {
  const labels = {
    PASSPORT: "Passport",
    PHOTO: "Photo",
    RESIDENCE_VISA: "Residence Visa",
    EMIRATES_ID: "Emirates ID",
    LABOUR_PERMIT: "Labour Permit",
    HEALTH_CARD: "Health Card",
    MEDICAL_FITNESS: "Medical Fitness",
    LABOUR_CONTRACT: "Labour Contract",
    ESTABLISHMENT_CARD: "Establishment Card",
    TRADE_LICENSE: "Trade License",
  };
  return labels[docType] ?? formatLabel(docType);
}

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
  const optionsHtml = proDocTypes.map((t) => `<option value="${t}">${escapeAttr(formatDocTypeLabel(t))}</option>`).join("");
  const docSel = document.getElementById("pro-doc-type");
  const taskSel = document.getElementById("pro-task-doctype");
  if (docSel) docSel.innerHTML = optionsHtml;
  if (taskSel) taskSel.innerHTML = `<option value="">— none —</option>` + optionsHtml;
}

async function loadProMeta() {
  try {
    const meta = await api("/pro/doc-types");
    proDocTypes = Array.isArray(meta?.docTypes) ? meta.docTypes : [];
    if (Number.isFinite(meta?.alertMonths) && meta.alertMonths > 0) {
      documentExpiryAlertMonths = meta.alertMonths;
    }
    populateProDocTypeSelects();
  } catch (_error) {
    proDocTypes = [];
  }
}

function proTaskMatchesSearch(task, query) {
  if (!query) return true;
  const emp = task.employee;
  const name = `${emp?.firstName ?? ""} ${emp?.lastName ?? ""}`.trim();
  const haystack = [
    task.referenceNumber,
    name,
    emp?.employeeCode,
    emp?.department,
    task.taskType,
    task.status,
    proStatusLabel(task.status),
    formatLabel(task.taskType),
    task.governmentRef,
    task.feeAmount != null ? String(task.feeAmount) : "",
    task.autoCreated ? "auto" : "",
  ].join(" ").toLowerCase();
  return haystack.includes(query);
}

function proDocMatchesSearch(doc, query) {
  if (!query) return true;
  const emp = doc.employee;
  const name = `${emp?.firstName ?? ""} ${emp?.lastName ?? ""}`.trim();
  const haystack = [
    name,
    emp?.employeeCode,
    emp?.department,
    doc.docType,
    formatDocTypeLabel(doc.docType),
    doc.documentNumber,
    doc.issuingAuthority,
    doc.computedStatus,
    formatLabel(doc.computedStatus),
    doc.notes,
  ].join(" ").toLowerCase();
  return haystack.includes(query);
}

function renderProDocsTable() {
  const tbody = document.getElementById("pro-docs-body");
  const mobileList = document.getElementById("pro-docs-mobile");
  if (!tbody) return;
  const query = (document.getElementById("pro-docs-search")?.value ?? "").trim().toLowerCase();
  const filtered = proDocsCache.filter((doc) => proDocMatchesSearch(doc, query));
  if (!proDocsCache.length) {
    tbody.innerHTML = `<tr><td colspan="7" class="text-muted">No documents registered.</td></tr>`;
    if (mobileList) mobileList.innerHTML = `<div class="mobile-empty">No documents registered.</div>`;
    return;
  }
  if (!filtered.length) {
    tbody.innerHTML = `<tr><td colspan="7" class="text-muted">No documents match your search.</td></tr>`;
    if (mobileList) mobileList.innerHTML = `<div class="mobile-empty">No documents match your search.</div>`;
    return;
  }
  const canManage = canManageProUi();
  const rendered = filtered.map((doc) => {
    const emp = doc.employee;
    const name = `${emp?.firstName ?? ""} ${emp?.lastName ?? ""}`.trim();
    const docType = formatDocTypeLabel(doc.docType);
    const status = formatLabel(doc.computedStatus);
    const badge = proDocStatusBadge(doc.computedStatus);
    let action = `<span class="text-muted">—</span>`;
    let mobileActions = "";
    if (canManage) {
      const parts = [];
      const mobileParts = [];
      if (doc.fileUrl) {
        parts.push(`<button class="btn btn-secondary btn-sm" onclick="window.__viewAttachment('${escapeAttr(doc.fileUrl)}')">View</button>`);
        mobileParts.push(`<button class="btn btn-secondary btn-sm" onclick="window.__viewAttachment('${escapeAttr(doc.fileUrl)}')">View</button>`);
      }
      parts.push(`<button class="btn btn-secondary btn-sm" onclick="window.__editProDocument('${doc.id}')">Edit</button>`);
      parts.push(`<button class="btn btn-danger btn-sm" onclick="window.__deleteProDocument('${doc.id}')">Delete</button>`);
      mobileParts.push(`<button class="btn btn-secondary btn-sm" onclick="window.__editProDocument('${doc.id}')">Edit</button>`);
      mobileParts.push(`<button class="btn btn-danger btn-sm" onclick="window.__deleteProDocument('${doc.id}')">Delete</button>`);
      action = `<div class="flex gap-8" style="flex-wrap:wrap">${parts.join("")}</div>`;
      mobileActions = mobileParts.join("");
    } else if (doc.fileUrl) {
      action = `<button class="btn btn-secondary btn-sm" onclick="window.__viewAttachment('${escapeAttr(doc.fileUrl)}')">View</button>`;
      mobileActions = action;
    }

    const tableRow = `
      <tr>
        <td>${escapeAttr(name)}</td>
        <td>${escapeAttr(docType)}</td>
        <td>${escapeAttr(doc.documentNumber ?? "—")}</td>
        <td>${escapeAttr(doc.issuingAuthority ?? "—")}</td>
        <td>${fmtDate(doc.expiryDate)}</td>
        <td><span class="badge ${badge}">${escapeAttr(status)}</span></td>
        <td>${action}</td>
      </tr>`;

    const mobileCard = `
      <article class="record-card">
        <div class="record-card-head">
          <div class="record-card-head-main">
            <div class="record-card-name">${escapeAttr(docType)}</div>
            <div class="record-card-sub">${escapeAttr(name)}${emp?.employeeCode ? ` · ${escapeAttr(emp.employeeCode)}` : ""}</div>
            <div class="record-card-badges"><span class="badge ${badge}">${escapeAttr(status)}</span></div>
          </div>
        </div>
        <div class="record-card-grid">
          <div class="record-card-field"><span class="record-card-label">Number</span><span class="record-card-value">${escapeAttr(doc.documentNumber ?? "—")}</span></div>
          <div class="record-card-field"><span class="record-card-label">Authority</span><span class="record-card-value">${escapeAttr(doc.issuingAuthority ?? "—")}</span></div>
          <div class="record-card-field"><span class="record-card-label">Expiry</span><span class="record-card-value">${fmtDate(doc.expiryDate)}</span></div>
        </div>
        ${mobileActions ? `<div class="record-card-actions">${mobileActions}</div>` : ""}
      </article>`;

    return { tableRow, mobileCard };
  });

  tbody.innerHTML = rendered.map((row) => row.tableRow).join("");
  if (mobileList) mobileList.innerHTML = rendered.map((row) => row.mobileCard).join("");
}

function proStatusLabel(status) {
  const labels = {
    VISA_PROCESSING: "Visa Processing",
    EVISA: "eVisa",
    NON_EXIT: "Non Exit",
    MEDICAL: "Medical",
    EID: "EID",
    COMPLETED: "Completed",
    RENEWAL_INITIATED: "Renewal Initiated",
    DOCUMENTS_VALIDATED: "Documents Validated",
    SUBMITTED: "Submitted",
    MEDICAL_IN_PROGRESS: "Medical In Progress",
    CANCELLATION_PENDING: "Cancellation Pending",
    PASSPORT_COLLECTED: "Passport Collected",
    CANCELLATION_SUBMITTED: "Cancellation Submitted",
    CANCELLED: "Cancelled",
    PASSPORT_RETURNED: "Passport Returned",
    ABORTED: "Aborted",
  };
  return labels[status] ?? formatLabel(status);
}

function isProTaskTerminal(task) {
  if (!task || task.status === "ABORTED") return true;
  const flow = Array.isArray(task.flow) ? task.flow : [];
  if (!flow.length) return false;
  return task.status === flow[flow.length - 1];
}

function renderProTasksTable() {
  const tbody = document.getElementById("pro-tasks-body");
  const mobileList = document.getElementById("pro-tasks-mobile");
  if (!tbody) return;
  const query = (document.getElementById("pro-tasks-search")?.value ?? "").trim().toLowerCase();
  const filtered = proTasksCache.filter((task) => proTaskMatchesSearch(task, query));
  if (!proTasksCache.length) {
    tbody.innerHTML = `<tr><td colspan="6" class="text-muted">No PRO tasks.</td></tr>`;
    if (mobileList) mobileList.innerHTML = `<div class="mobile-empty">No PRO tasks.</div>`;
    return;
  }
  if (!filtered.length) {
    tbody.innerHTML = `<tr><td colspan="6" class="text-muted">No tasks match your search.</td></tr>`;
    if (mobileList) mobileList.innerHTML = `<div class="mobile-empty">No tasks match your search.</div>`;
    return;
  }
  const canManage = canManageProUi();
  const stageSelectStyle = "min-width:150px;padding:6px 8px;border-radius:8px;border:1px solid var(--border);background:var(--surface);color:var(--text)";
  const mobileStageSelectStyle = `${stageSelectStyle};width:100%`;

  const rendered = filtered.map((task) => {
    const emp = task.employee;
    const name = `${emp?.firstName ?? ""} ${emp?.lastName ?? ""}`.trim();
    const flow = Array.isArray(task.flow) ? task.flow : [];
    const terminal = isProTaskTerminal(task);
    const taskType = formatLabel(task.taskType);
    const stageLabel = proStatusLabel(task.status);
    const stageBadge = task.status === "COMPLETED" ? "badge-green" : task.status === "VISA_PROCESSING" ? "badge-amber" : "badge-blue";
    const govFee = [task.governmentRef, task.feeAmount ? `AED ${Number(task.feeAmount).toLocaleString("en-US")}` : null].filter(Boolean).join(" · ") || "—";
    const autoBadge = task.autoCreated ? ' <span class="badge badge-amber">Auto</span>' : "";

    let action = `<span class="text-muted">—</span>`;
    let mobileAction = "";
    if (canManage && !terminal && flow.length) {
      const options = flow.map((stage) =>
        `<option value="${stage}" ${stage === task.status ? "selected" : ""}>${escapeAttr(proStatusLabel(stage))}</option>`,
      ).join("");
      action = `<select class="pro-stage-select" onchange="window.__setProTaskStage('${task.id}', this.value, this)" style="${stageSelectStyle}">${options}</select>`;
      mobileAction = `<select class="pro-stage-select" onchange="window.__setProTaskStage('${task.id}', this.value, this)" style="${mobileStageSelectStyle}">${options}</select>`;
    }

    const tableRow = `
      <tr>
        <td>${escapeAttr(task.referenceNumber)}${autoBadge}</td>
        <td>${escapeAttr(name)}</td>
        <td>${escapeAttr(taskType)}</td>
        <td><span class="badge ${stageBadge}">${escapeAttr(stageLabel)}</span></td>
        <td>${escapeAttr(govFee)}</td>
        <td>${action}</td>
      </tr>`;

    const mobileCard = `
      <article class="record-card">
        <div class="record-card-head">
          <div class="record-card-head-main">
            <div class="record-card-name">${escapeAttr(task.referenceNumber)}</div>
            <div class="record-card-sub">${escapeAttr(name)}${emp?.employeeCode ? ` · ${escapeAttr(emp.employeeCode)}` : ""}</div>
            <div class="record-card-badges">
              ${task.autoCreated ? '<span class="badge badge-amber">Auto</span>' : ""}
              <span class="badge badge-blue">${escapeAttr(taskType)}</span>
              <span class="badge ${stageBadge}">${escapeAttr(stageLabel)}</span>
            </div>
          </div>
        </div>
        <div class="record-card-grid">
          <div class="record-card-field"><span class="record-card-label">Gov. Ref / Fee</span><span class="record-card-value">${escapeAttr(govFee)}</span></div>
        </div>
        ${mobileAction ? `<div class="record-card-actions" style="flex-direction:column;align-items:stretch;border-top:none;padding-top:0"><label class="record-card-label" style="margin-bottom:4px">Change Stage</label>${mobileAction}</div>` : ""}
      </article>`;

    return { tableRow, mobileCard };
  });

  tbody.innerHTML = rendered.map((row) => row.tableRow).join("");
  if (mobileList) mobileList.innerHTML = rendered.map((row) => row.mobileCard).join("");
}

function refreshEmployeeDashboardDocStat() {
  if (!isEmployeeDashboard()) return;
  const expiringDocCount = getExpiringDocuments().length;
  const statValues = document.querySelectorAll("#view-dashboard .stats-grid .stat-value");
  const statSubs = document.querySelectorAll("#view-dashboard .stats-grid .stat-sub");
  if (statValues[3]) statValues[3].textContent = String(expiringDocCount);
  if (statSubs[3]) {
    statSubs[3].textContent = expiringDocCount ? documentExpiryWindowLabel() : "All documents up to date";
  }
}

async function loadPro() {
  try {
    const [docs, tasks] = await Promise.all([api("/pro/documents"), api("/pro/tasks")]);
    proDocsCache = Array.isArray(docs) ? docs : [];
    proTasksCache = Array.isArray(tasks) ? tasks : [];
    renderProDocsTable();
    renderProTasksTable();
    renderNotifications();
    renderDashboardInsights();
    refreshEmployeeDashboardDocStat();
  } catch (error) {
    notify(error.message);
  }
}

function renderEmployeeDocumentsTable(docs) {
  const tbody = document.getElementById("documents-table-body");
  const mobileList = document.getElementById("documents-mobile-list");
  if (!tbody) return;
  const emptyMsg = "No documents registered for this employee yet.";
  if (!docs.length) {
    tbody.innerHTML = `<tr><td colspan="7" class="text-muted">${emptyMsg}</td></tr>`;
    if (mobileList) mobileList.innerHTML = `<div class="mobile-empty">${emptyMsg}</div>`;
    return;
  }

  const rendered = docs.map((doc) => {
    const docType = formatDocTypeLabel(doc.docType);
    const status = formatLabel(doc.computedStatus ?? "VALID");
    const badge = proDocStatusBadge(doc.computedStatus);
    const fileCell = doc.fileUrl
      ? `<button class="btn btn-secondary btn-sm" onclick="window.__viewAttachment('${escapeAttr(doc.fileUrl)}')">View</button>`
      : `<span class="text-muted">—</span>`;
    const fileAction = doc.fileUrl
      ? `<button class="btn btn-secondary btn-sm" onclick="window.__viewAttachment('${escapeAttr(doc.fileUrl)}')">View File</button>`
      : "";

    const tableRow = `
      <tr>
        <td>${escapeAttr(docType)}</td>
        <td>${escapeAttr(doc.documentNumber ?? "—")}</td>
        <td>${escapeAttr(doc.issuingAuthority ?? "—")}</td>
        <td>${fmtDate(doc.issueDate)}</td>
        <td>${fmtDate(doc.expiryDate)}</td>
        <td><span class="badge ${badge}">${escapeAttr(status)}</span></td>
        <td>${fileCell}</td>
      </tr>`;

    const mobileCard = `
      <article class="record-card">
        <div class="record-card-head">
          <div class="record-card-head-main">
            <div class="record-card-name">${escapeAttr(docType)}</div>
            <div class="record-card-badges"><span class="badge ${badge}">${escapeAttr(status)}</span></div>
          </div>
        </div>
        <div class="record-card-grid">
          <div class="record-card-field"><span class="record-card-label">Number</span><span class="record-card-value">${escapeAttr(doc.documentNumber ?? "—")}</span></div>
          <div class="record-card-field"><span class="record-card-label">Authority</span><span class="record-card-value">${escapeAttr(doc.issuingAuthority ?? "—")}</span></div>
          <div class="record-card-field"><span class="record-card-label">Issue Date</span><span class="record-card-value">${fmtDate(doc.issueDate)}</span></div>
          <div class="record-card-field"><span class="record-card-label">Expiry</span><span class="record-card-value">${fmtDate(doc.expiryDate)}</span></div>
        </div>
        ${fileAction ? `<div class="record-card-actions">${fileAction}</div>` : ""}
      </article>`;

    return { tableRow, mobileCard };
  });

  tbody.innerHTML = rendered.map((row) => row.tableRow).join("");
  if (mobileList) mobileList.innerHTML = rendered.map((row) => row.mobileCard).join("");
}

window.__selectDocumentsEmployee = async function selectDocumentsEmployee(employeeId, silent = false) {
  const employee = allEmployees.find((item) => item.id === employeeId) ?? (employeeId === me?.employee?.id ? me.employee : null);
  const resultsBox = document.getElementById("documents-search-results");
  const searchInput = document.getElementById("documents-search");
  const detail = document.getElementById("documents-detail");
  const empty = document.getElementById("documents-empty");
  if (!employee) {
    if (!silent) notify("Employee not found");
    return;
  }
  if (resultsBox) {
    resultsBox.style.display = "none";
    resultsBox.innerHTML = "";
  }
  const name = `${employee.firstName ?? ""} ${employee.lastName ?? ""}`.trim();
  if (searchInput && canSearchEmployeeDocuments()) searchInput.value = name;

  try {
    const docs = await api(`/pro/documents?employeeId=${encodeURIComponent(employeeId)}`);
    const rows = Array.isArray(docs) ? docs : [];

    const avatar = document.getElementById("documents-avatar");
    const nameEl = document.getElementById("documents-name");
    const metaEl = document.getElementById("documents-meta");
    if (avatar) {
      avatar.textContent = name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase() || "--";
    }
    if (nameEl) nameEl.textContent = name;
    if (metaEl) metaEl.textContent = `${employee.employeeCode ?? "—"} • ${employee.department ?? ""} • ${employee.designation ?? ""}`;

    renderEmployeeDocumentsTable(rows);
    if (detail) detail.style.display = "";
    if (empty) empty.style.display = "none";
  } catch (error) {
    notify(error.message);
  }
};

function wireDocumentsLookup() {
  const searchInput = document.getElementById("documents-search");
  const resultsBox = document.getElementById("documents-search-results");
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
      return `<button type="button" class="emp-action-item" style="display:block;width:100%;text-align:left;padding:9px 10px" onclick="window.__selectDocumentsEmployee('${employee.id}')">${escapeAttr(name)} (${escapeAttr(employee.employeeCode ?? "—")}) • ${escapeAttr(employee.department ?? "")}</button>`;
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

function applyDocumentsPageRoleUi() {
  const canSearch = canSearchEmployeeDocuments();
  const searchWrap = document.getElementById("documents-search-wrap");
  const selfNote = document.getElementById("documents-self-note");
  const pageTitle = document.getElementById("documents-page-title");
  const empty = document.getElementById("documents-empty");
  if (searchWrap) searchWrap.style.display = canSearch ? "" : "none";
  if (selfNote) selfNote.style.display = canSearch ? "none" : "";
  if (pageTitle) pageTitle.textContent = canSearch ? "Employee Document Lookup" : "My Documents";
  if (empty && !canSearch) empty.style.display = "none";
}

async function loadDocumentsPage() {
  applyDocumentsPageRoleUi();
  if (canSearchEmployeeDocuments()) return;
  if (me?.employee?.id) {
    await window.__selectDocumentsEmployee(me.employee.id, true);
  }
}

function resetProDocumentForm() {
  editingProDocId = null;
  const title = document.getElementById("pro-doc-form-title");
  const saveBtn = document.getElementById("pro-doc-save-btn");
  const cancelBtn = document.getElementById("pro-doc-cancel-btn");
  const fileLabel = document.getElementById("pro-doc-file-label");
  const fileNote = document.getElementById("pro-doc-file-note");
  if (title) title.textContent = "Add / Register Document";
  if (saveBtn) saveBtn.textContent = "Save Document";
  if (cancelBtn) cancelBtn.style.display = "none";
  if (fileLabel) fileLabel.textContent = "Document File (required · PDF/JPG/PNG · max 5 MB)";
  if (fileNote) {
    fileNote.style.display = "none";
    fileNote.textContent = "";
  }
  ["pro-doc-number", "pro-doc-authority", "pro-doc-issue", "pro-doc-expiry", "pro-doc-notes"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.value = "";
  });
  const empSel = document.getElementById("pro-doc-emp");
  if (empSel) {
    empSel.value = "";
    empSel.disabled = false;
  }
  const typeSel = document.getElementById("pro-doc-type");
  if (typeSel && proDocTypes.length) typeSel.value = proDocTypes[0];
  const fileInput = document.getElementById("pro-doc-file");
  if (fileInput) fileInput.value = "";
}

window.__cancelProDocumentEdit = function cancelProDocumentEdit() {
  resetProDocumentForm();
  const tabBtn = document.querySelector("#view-pro .tab-btn[onclick*=\"pro-documents\"]");
  if (tabBtn) switchTab(tabBtn, "pro-documents");
};

window.__editProDocument = function editProDocument(id) {
  const doc = proDocsCache.find((item) => item.id === id);
  if (!doc) {
    notify("Document not found");
    return;
  }
  populateProEmployeeSelects();
  populateProDocTypeSelects();
  editingProDocId = id;
  const title = document.getElementById("pro-doc-form-title");
  const saveBtn = document.getElementById("pro-doc-save-btn");
  const cancelBtn = document.getElementById("pro-doc-cancel-btn");
  const fileLabel = document.getElementById("pro-doc-file-label");
  const fileNote = document.getElementById("pro-doc-file-note");
  if (title) title.textContent = "Edit Document";
  if (saveBtn) saveBtn.textContent = "Update Document";
  if (cancelBtn) cancelBtn.style.display = "";
  if (fileLabel) fileLabel.textContent = "Replace File (optional · PDF/JPG/PNG · max 5 MB)";
  if (fileNote) {
    fileNote.style.display = doc.fileUrl ? "" : "none";
    fileNote.textContent = doc.fileUrl ? "Current file attached. Upload a new file only if you want to replace it." : "";
  }
  const empSel = document.getElementById("pro-doc-emp");
  if (empSel) {
    empSel.value = doc.employeeId;
    empSel.disabled = true;
  }
  const typeSel = document.getElementById("pro-doc-type");
  if (typeSel) typeSel.value = doc.docType;
  const numberEl = document.getElementById("pro-doc-number");
  if (numberEl) numberEl.value = doc.documentNumber ?? "";
  const authorityEl = document.getElementById("pro-doc-authority");
  if (authorityEl) authorityEl.value = doc.issuingAuthority ?? "";
  const issueEl = document.getElementById("pro-doc-issue");
  if (issueEl) issueEl.value = doc.issueDate ? String(doc.issueDate).slice(0, 10) : "";
  const expiryEl = document.getElementById("pro-doc-expiry");
  if (expiryEl) expiryEl.value = doc.expiryDate ? String(doc.expiryDate).slice(0, 10) : "";
  const notesEl = document.getElementById("pro-doc-notes");
  if (notesEl) notesEl.value = doc.notes ?? "";
  const fileInput = document.getElementById("pro-doc-file");
  if (fileInput) fileInput.value = "";
  const tabBtn = document.querySelector("#view-pro .tab-btn[onclick*=\"pro-doc-new\"]");
  if (tabBtn) switchTab(tabBtn, "pro-doc-new");
};

window.__deleteProDocument = async function deleteProDocument(id) {
  try {
    const doc = proDocsCache.find((item) => item.id === id);
    const label = doc ? formatDocTypeLabel(doc.docType) : "this document";
    if (!window.confirm(`Delete ${label}? This cannot be undone.`)) return;
    await api(`/pro/documents/${id}`, { method: "DELETE" });
    notify("Document deleted");
    if (editingProDocId === id) resetProDocumentForm();
    await loadPro();
  } catch (error) {
    notify(error.message);
  }
};

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
    const fileInput = document.getElementById("pro-doc-file");
    const hasNewFile = Boolean(fileInput?.files?.[0]);
    if (!editingProDocId && !hasNewFile) {
      notify("Please attach a document file (PDF, JPG or PNG)");
      return;
    }
    const fileUrl = hasNewFile
      ? await uploadAttachment(
          "pro-doc-file",
          "DOCUMENT",
          buildUploadMeta(employeeId, { documentType: docType }),
        )
      : undefined;
    const payload = {
      docType,
      documentNumber: document.getElementById("pro-doc-number")?.value.trim() || undefined,
      issuingAuthority: document.getElementById("pro-doc-authority")?.value.trim() || undefined,
      issueDate: issueDate ? new Date(issueDate).toISOString() : undefined,
      expiryDate: expiryDate ? new Date(expiryDate).toISOString() : undefined,
      notes: document.getElementById("pro-doc-notes")?.value.trim() || undefined,
    };
    if (fileUrl) payload.fileUrl = fileUrl;

    if (editingProDocId) {
      await api(`/pro/documents/${editingProDocId}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      notify("Document updated");
    } else {
      await api("/pro/documents", {
        method: "POST",
        body: JSON.stringify({ ...payload, employeeId, fileUrl }),
      });
      notify("Document saved");
    }
    resetProDocumentForm();
    await loadPro();
    const tabBtn = document.querySelector("#view-pro .tab-btn[onclick*=\"pro-documents\"]");
    if (tabBtn) switchTab(tabBtn, "pro-documents");
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

window.__setProTaskStage = async function setProTaskStage(id, status, selectEl) {
  const task = proTasksCache.find((t) => t.id === id);
  if (!task || task.status === status) return;
  if (isProTaskTerminal(task)) {
    notify("Completed tasks cannot be changed");
    if (selectEl) selectEl.value = task.status;
    return;
  }
  try {
    await api(`/pro/tasks/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
    notify("Stage updated");
    await loadPro();
  } catch (error) {
    notify(error.message);
    if (selectEl && task) selectEl.value = task.status;
  }
};

window.__advanceProTask = async function advanceProTask(id) {
  const task = proTasksCache.find((t) => t.id === id);
  const flow = Array.isArray(task?.flow) ? task.flow : [];
  const idx = flow.indexOf(task?.status ?? "");
  if (idx < 0 || idx >= flow.length - 1) {
    notify("Use the stage dropdown to set the status");
    return;
  }
  await window.__setProTaskStage(id, flow[idx + 1]);
};

function wireProForms() {
  const todayIso = new Date().toISOString().slice(0, 10);
  const issue = document.getElementById("pro-doc-issue");
  const expiry = document.getElementById("pro-doc-expiry");
  if (expiry) expiry.min = todayIso;
  if (issue) issue.max = todayIso;
  document.getElementById("pro-tasks-search")?.addEventListener("input", renderProTasksTable);
  document.getElementById("pro-docs-search")?.addEventListener("input", renderProDocsTable);
  const addDocTabBtn = document.getElementById("pro-doc-new-tab-btn");
  addDocTabBtn?.addEventListener("click", () => {
    resetProDocumentForm();
  });

  const canManagePro = elevatedRoles.has(me?.role) || me?.role === "PRO";
  const importButton = document.getElementById("pro-import-btn");
  const importFile = document.getElementById("pro-import-file");
  if (importButton && importFile) {
    importButton.style.display = canManagePro ? "" : "none";
    importButton.onclick = () => importFile.click();
    importFile.onchange = async (event) => {
      const file = event.target.files?.[0];
      event.target.value = "";
      if (!file) return;
      const includeCompanySheets = window.confirm(
        "Include company entity sheets too?\n\nOK = Employee Master Data + Eurocon / Metalplast / Alubond ME sheets, etc.\nCancel = Employee Master Data sheet only.",
      );
      try {
        await runExcelImportWithProgress({
          path: "/import/pro",
          file,
          extra: { includeCompanySheets },
          title: "Importing PRO data",
          onComplete: async (result) => {
            notify(summarizeProImportResult(result));
            await loadPro();
            await refreshEmployees();
          },
        });
      } catch (error) {
        notify(error.message);
      }
    };
  }
}

function isEmployeeDashboard() {
  return isIndividualContributor(me?.role);
}

function applyEmployeeDashboardUi() {
  const isEmployee = isEmployeeDashboard();
  document.getElementById("dash-employee-summary-card")?.style.setProperty("display", isEmployee ? "" : "none");
  document.getElementById("dash-admin-insights-row")?.style.setProperty("display", isEmployee ? "none" : "");
  document.getElementById("dash-overtime-panel")?.style.setProperty("display", isEmployee ? "none" : "");
}

function renderEmployeeDashboardSummary() {
  const container = document.getElementById("dash-employee-summary");
  const employee = allEmployees.find((item) => item.id === me?.employee?.id) ?? me?.employee;
  if (!container || !employee) return;
  const manager = employee.managerId
    ? allEmployees.find((item) => item.id === employee.managerId)
    : null;
  const managerName = manager
    ? `${manager.firstName ?? ""} ${manager.lastName ?? ""}`.trim()
    : "—";
  const items = [
    ["Employee ID", employee.employeeCode ?? "—"],
    ["Department", employee.department ?? "—"],
    ["Designation", employee.designation ?? "—"],
    ["Status", formatLabel(employee.status ?? "ACTIVE")],
    ["Joined", employee.dateOfJoining ? fmtDate(employee.dateOfJoining) : "—"],
    ["Reporting To", managerName],
  ];
  container.innerHTML = items.map(([label, value]) => `
    <div style="background:var(--highlight);border:1px solid var(--border-bright);border-radius:9px;padding:12px">
      <div class="text-muted" style="font-size:11px;margin-bottom:4px">${escapeAttr(label)}</div>
      <div style="font-weight:600">${escapeAttr(value)}</div>
    </div>
  `).join("");
}

async function loadDashboard() {
  const data = await api("/dashboard/overview");
  dashboardCache = data ?? null;
  const statValues = document.querySelectorAll("#view-dashboard .stats-grid .stat-value");
  const statLabels = document.querySelectorAll("#view-dashboard .stats-grid .stat-label");
  const statSubs = document.querySelectorAll("#view-dashboard .stats-grid .stat-sub");
  const isEmployee = isEmployeeDashboard();
  const payrollMonth = data?.payrollCurrentMonth;
  const expiringDocCount = getExpiringDocuments().length;

  if (statValues.length >= 4) {
    if (isEmployee) {
      statValues[0].textContent = formatLabel(me?.employee?.status ?? "ACTIVE");
      statValues[1].textContent = String(data.pendingLeaveApprovals ?? 0);
      statValues[2].textContent = Math.round(Number(payrollMonth?.netPay ?? 0)).toLocaleString("en-US");
      statValues[3].textContent = String(expiringDocCount);
    } else {
      statValues[0].textContent = String(data.headcount ?? 0);
      statValues[1].textContent = String(data.onLeave ?? 0);
      const payroll = Number(data.monthlyPayroll ?? 0);
      statValues[2].textContent = payroll >= 1000000
        ? `${(payroll / 1000000).toFixed(2)}M`
        : Math.round(payroll).toLocaleString("en-US");
      statValues[3].textContent = String(data.pendingLeaveApprovals ?? 0);
    }
  }
  if (statLabels.length >= 4) {
    if (isEmployee) {
      statLabels[0].textContent = "Employment Status";
      statLabels[1].textContent = "Pending Leave Requests";
      const payCode = formatCurrencyLabel(employeePayCurrency());
      statLabels[2].textContent = payCode ? `Net Pay (${payCode})` : "Net Pay (This Month)";
      statLabels[3].textContent = "Documents Expiring";
    } else {
      statLabels[0].textContent = "Total Headcount";
      statLabels[1].textContent = "On Leave Today";
      statLabels[2].textContent = "Monthly Payroll (AED)";
      statLabels[3].textContent = "Pending Approvals";
    }
  }
  if (statSubs.length >= 4) {
    if (isEmployee) {
      statSubs[0].textContent = me?.employee?.department ?? "Your department";
      statSubs[1].textContent = Number(data.pendingLeaveApprovals ?? 0) ? "Awaiting manager/HR action" : "No open requests";
      statSubs[2].textContent = payrollMonth?.month && payrollMonth?.year
        ? new Date(payrollMonth.year, payrollMonth.month - 1, 1).toLocaleDateString("en-GB", { month: "long", year: "numeric" })
        : "Current pay cycle";
      statSubs[3].textContent = expiringDocCount ? documentExpiryWindowLabel() : "All documents up to date";
    } else {
      const headcount = Number(data.headcount ?? 0);
      const onLeave = Number(data.onLeave ?? 0);
      statSubs[1].textContent = headcount ? `${((onLeave / headcount) * 100).toFixed(1)}% of workforce` : "No leave today";
      statSubs[2].textContent = "Current cycle total";
      statSubs[3].textContent = l1Roles.has(me?.role) ? "Waiting for L1 action" : l2Roles.has(me?.role) ? "Waiting for L2 action" : "Track your leave workflow";
    }
  }
  if (isEmployee) renderEmployeeDashboardSummary();
  renderLateAttendanceDashboardBanner();
  renderDashboardInsights();
  renderNotifications();
}

function renderLateAttendanceDashboardBanner() {
  const card = document.getElementById("dash-late-attendance-card");
  const text = document.getElementById("dash-late-attendance-text");
  if (!card || !text) return;
  const late = dashboardCache?.lateAttendance;
  if (!isEmployeeDashboard() || !late?.warningActive) {
    card.style.display = "none";
    return;
  }
  card.style.display = "";
  text.innerHTML = `<b>Late check-in warning</b> You have checked in late ${late.monthlyLateCount} time(s) this month (allowed: ${late.threshold}). A warning email has been sent — please arrive on time.`;
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

function formatPayrollMoney(value, currency, withSign = false) {
  const rounded = Math.round(Number(value ?? 0));
  const abs = Math.abs(rounded).toLocaleString("en-US");
  const code = formatCurrencyLabel(currency);
  const prefix = code ? `${code} ` : "";
  if (!withSign) return `${prefix}${abs}`;
  return `${rounded < 0 ? "−" : ""}${prefix}${abs}`;
}

function employeePayCurrency() {
  return me?.employee?.netPayCurrency;
}

function formatAed(value, withSign = false) {
  return formatPayrollMoney(value, "AED", withSign);
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
  const payslipCurrency = isEmployeeDashboard() ? employeePayCurrency() : "AED";
  if (payrollTitle && payrollMonth?.month && payrollMonth?.year) {
    const periodLabel = new Date(payrollMonth.year, payrollMonth.month - 1, 1)
      .toLocaleDateString("en-GB", { month: "long", year: "numeric" });
    payrollTitle.textContent = isEmployeeDashboard()
      ? `My Payslip — ${periodLabel}`
      : `Payroll Overview — ${periodLabel}`;
  }
  if (payrollEarnings && payrollMonth) {
    payrollEarnings.innerHTML = `
      <div class="payslip-row"><span>${isEmployeeDashboard() ? "Basic Salary" : "Basic Salaries"}</span><span>${formatPayrollMoney(payrollMonth.basic, payslipCurrency)}</span></div>
      <div class="payslip-row"><span>Housing Allowance</span><span>${formatPayrollMoney(payrollMonth.housing, payslipCurrency)}</span></div>
      <div class="payslip-row"><span>Transport</span><span>${formatPayrollMoney(payrollMonth.transport, payslipCurrency)}</span></div>
      <div class="payslip-row"><span>Overtime</span><span>${formatPayrollMoney(payrollMonth.overtime, payslipCurrency)}</span></div>
      <div class="payslip-row payslip-total"><span>Gross Total</span><span>${formatPayrollMoney(payrollMonth.grossTotal, payslipCurrency)}</span></div>
    `;
  }
  if (payrollDeductions && payrollMonth) {
    payrollDeductions.innerHTML = `
      <div class="payslip-row"><span>Total Deductions</span><span style="color:var(--coral)">${formatPayrollMoney(-Math.abs(payrollMonth.deductions), payslipCurrency, true)}</span></div>
      <div class="payslip-row payslip-total"><span>Net Pay</span><span>${formatPayrollMoney(payrollMonth.netPay, payslipCurrency)}</span></div>
      <div style="margin-top:12px"><div class="badge badge-green" id="dash-wps-badge">Payroll snapshot ready</div></div>
    `;
  }
  const dynamicWpsBadge = document.getElementById("dash-wps-badge") || wpsBadge;
  if (dynamicWpsBadge) {
    dynamicWpsBadge.textContent = payrollMonth?.netPay ? "WPS payroll snapshot generated" : "No payroll records for this period";
  }
  if (overtimeAmountEl) {
    overtimeAmountEl.textContent = Math.round(Number(payrollMonth?.overtime ?? 0)).toLocaleString("en-US");
  }
  const overtimeLabelEl = document.getElementById("dash-overtime-label");
  if (overtimeLabelEl && isEmployeeDashboard()) {
    const code = formatCurrencyLabel(employeePayCurrency());
    overtimeLabelEl.textContent = code ? `Overtime Payout (${code})` : "Overtime Payout";
  } else if (overtimeLabelEl) {
    overtimeLabelEl.textContent = "Overtime Payout (AED)";
  }
  if (overtimeEmployeesEl) {
    overtimeEmployeesEl.textContent = String(payrollMonth?.overtimeEmployees ?? 0);
  }

  if (pendingApprovals > 0 && !isEmployeeDashboard()) {
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
  if (onLeave > 0 && !isEmployeeDashboard()) {
    alerts.push({
      tone: "warn",
      icon: "bi-calendar-check",
      title: `${onLeave} Employee${onLeave === 1 ? "" : "s"} on Leave Today`,
      desc: "Coverage planning may be required.",
    });
  }
  const lateToday = Number(dashboardCache?.lateJoinersToday ?? 0);
  const lateOverThreshold = Number(dashboardCache?.employeesOverLateThreshold ?? 0);
  if (!isEmployeeDashboard() && (lateToday > 0 || lateOverThreshold > 0)) {
    alerts.push({
      tone: "warn",
      icon: "bi-alarm",
      title: `${lateToday} Late Joiner${lateToday === 1 ? "" : "s"} Today`,
      desc: lateOverThreshold
        ? `${lateOverThreshold} employee${lateOverThreshold === 1 ? "" : "s"} exceeded the monthly late limit — review Attendance.`
        : "Review late check-ins on the Attendance page.",
    });
  }
  const employeeLate = dashboardCache?.lateAttendance;
  if (isEmployeeDashboard() && employeeLate?.warningActive) {
    alerts.push({
      tone: "warn",
      icon: "bi-alarm",
      title: "Late check-in warning",
      desc: `You have ${employeeLate.monthlyLateCount} late check-in(s) this month (limit: ${employeeLate.threshold}).`,
    });
  }
  if (isEmployeeDashboard() && me?.employee?.status === "ON_LEAVE") {
    alerts.push({
      tone: "info",
      icon: "bi-calendar-check",
      title: "You are on leave today",
      desc: "Enjoy your time off — check Leave Management for details.",
    });
  }
  if (probationCount > 0 && !isEmployeeDashboard()) {
    alerts.push({
      tone: "info",
      icon: "bi-flag",
      title: `${probationCount} Employee${probationCount === 1 ? "" : "s"} on Probation`,
      desc: "Review probation outcomes and confirmations.",
    });
  }
  if (isEmployeeDashboard() && me?.employee?.status === "PROBATION") {
    alerts.push({
      tone: "info",
      icon: "bi-flag",
      title: "You are on probation",
      desc: "Your confirmation review is tracked by HR and your manager.",
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

  const expiringDocs = getExpiringDocuments();
  if (expiringDocs.length) {
    const expiredCount = expiringDocs.filter((doc) => doc.computedStatus === "EXPIRED").length;
    const soonCount = expiringDocs.length - expiredCount;
    alerts.push({
      tone: "warn",
      icon: "bi-passport",
      title: documentExpiryAlertTitle(expiringDocs.length),
      desc: expiredCount
        ? `${soonCount} expiring soon, ${expiredCount} expired — open Documents to review.`
        : "Passport, visa, Emirates ID and permits need renewal planning.",
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

  const leaveTimelineSource = isEmployeeDashboard() && myEmployeeId
    ? leaveRequestsCache.filter((request) => request.employeeId === myEmployeeId)
    : leaveRequestsCache;

  [...leaveTimelineSource]
    .sort((a, b) => new Date(dashboardRequestDate(b)).getTime() - new Date(dashboardRequestDate(a)).getTime())
    .slice(0, 5)
    .forEach((request) => {
      const employeeName = `${request.employee?.firstName ?? ""} ${request.employee?.lastName ?? ""}`.trim() || "Employee";
      const leaveType = request.leaveType?.name ?? "Leave";
      const statusText = formatLeaveStatus(request.status);
      const statusTone = request.status === "APPROVED" ? "green" : request.status === "REJECTED" ? "amber" : "";
      const timelineText = isEmployeeDashboard()
        ? `Your <b>${escapeAttr(leaveType)}</b> request was marked as ${escapeAttr(statusText)}.`
        : `<b>${escapeAttr(employeeName)}</b> ${escapeAttr(leaveType)} request marked as ${escapeAttr(statusText)}.`;
      timelineRows.push({
        tone: statusTone,
        date: new Date(dashboardRequestDate(request)),
        text: timelineText,
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

async function getCurrentLocationWithGeoTag() {
  const location = await getCurrentLocation();
  try {
    const geo = await reverseGeocodeLocation(location.latitude, location.longitude);
    return { ...location, geoTag: geo.geoTag, geoAddress: geo.geoAddress };
  } catch {
    return location;
  }
}

function startAttendanceTracking() {
  if (attendanceTrackingTimer) {
    clearInterval(attendanceTrackingTimer);
  }
  const sendAttendancePing = async () => {
    try {
      const location = await getCurrentLocationWithGeoTag();
      await api("/attendance/ping", {
        method: "POST",
        body: JSON.stringify(location),
      });
      await Promise.all([loadAttendanceStatus(), loadOnlineAttendance()]);
    } catch (_error) {
      // Silent: location permissions can be denied intermittently.
    }
  };
  sendAttendancePing();
  attendanceTrackingTimer = setInterval(sendAttendancePing, ATTENDANCE_PING_INTERVAL_MS);
}

async function loadAttendanceStatus() {
  const data = await api("/attendance/status");
  attendanceCache = data ?? null;
  const badge = document.getElementById("att-status-badge");
  const workMode = document.getElementById("att-work-mode");
  const officeName = document.getElementById("att-office-name");
  const lastLocation = document.getElementById("att-last-location");
  const geoTagEl = document.getElementById("att-geo-tag");
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
  if (geoTagEl) {
    geoTagEl.textContent = ping?.geoTag ?? "Resolving place name…";
    geoTagEl.title = ping?.geoAddress ?? "";
  }
  lastLocation.textContent = ping ? formatPingLocation(ping) : "No live ping";
  geofenceState.textContent = ping?.insideGeofence === true
    ? "Inside office geofence"
    : ping?.insideGeofence === false
      ? "Outside office geofence"
      : "Not applicable";

  policyNote.textContent = mode === "OFFICE"
    ? `Auto check-in/out active within ${office?.radiusMeters ?? 500}m geofence of assigned office. Late check-ins after the configured end time are recorded.`
    : "Check-in allowed from anywhere. Late check-ins after the configured end time are recorded.";

  const lateWarning = document.getElementById("att-late-warning");
  const lateWarningText = document.getElementById("att-late-warning-text");
  const late = data?.lateAttendance;
  if (lateWarning && lateWarningText) {
    if (late?.warningActive) {
      lateWarning.style.display = "";
      lateWarningText.innerHTML = `<b>Late check-in warning</b> — ${late.monthlyLateCount} late check-in(s) this month (limit: ${late.threshold}).`;
    } else if (late?.monthlyLateCount > 0) {
      lateWarning.style.display = "";
      lateWarning.className = "alert alert-info";
      lateWarningText.innerHTML = `<b>Late check-in recorded</b> — ${late.monthlyLateCount} late check-in(s) this month (limit: ${late.threshold}).`;
    } else {
      lateWarning.style.display = "none";
      lateWarning.className = "alert alert-warn";
    }
  }
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
        ${ping.geoTag ? `<div><i class="bi bi-geo-alt"></i> ${escapeAttr(ping.geoTag)}</div>` : ""}
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

async function loadLateJoiners() {
  const card = document.getElementById("att-late-joiners-card");
  const tbody = document.getElementById("att-late-joiners-body");
  const mobileList = document.getElementById("att-late-joiners-mobile");
  const summary = document.getElementById("att-late-joiners-summary");
  const monthLabelEl = document.getElementById("att-late-joiners-month-label");
  const nextBtn = document.getElementById("att-late-joiners-next-btn");
  const canView = elevatedRoles.has(me?.role) || me?.role === "MANAGER" || me?.role === "CEO";
  if (card) card.style.display = canView ? "" : "none";
  if (!canView || !tbody) return;

  const monthKey = monthKeyFromDate(lateJoinersMonth);
  const monthLabel = formatCalendarMonthLabel(lateJoinersMonth);
  const viewingCurrentMonth = monthKey === monthKeyFromDate(new Date());
  if (monthLabelEl) monthLabelEl.textContent = monthLabel;
  if (nextBtn) nextBtn.disabled = viewingCurrentMonth;

  try {
    const data = await api(`/attendance/late-joiners?month=${encodeURIComponent(monthKey)}`);
    const rows = Array.isArray(data?.employees) ? data.employees : [];
    lateJoinersCache = rows;
    if (summary) {
      const todayPart = viewingCurrentMonth
        ? `${data?.lateJoinersToday ?? 0} late joiner(s) today · `
        : "";
      summary.textContent = `${todayPart}${rows.length} employee(s) with late check-ins in ${monthLabel} (warning after ${data?.threshold ?? 2}). Click a row for details.`;
    }
    if (!rows.length) {
      tbody.innerHTML = `<tr><td colspan="5" class="text-muted">No late check-ins recorded for ${escapeAttr(monthLabel)}.</td></tr>`;
      if (mobileList) mobileList.innerHTML = `<div class="mobile-empty">No late check-ins recorded for ${escapeAttr(monthLabel)}.</div>`;
      return;
    }
    tbody.innerHTML = rows.map((row) => {
      const latest = row.latestCheckInAt
        ? new Date(row.latestCheckInAt).toLocaleString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })
        : "—";
      const status = row.warningActive
        ? `<span class="badge badge-coral">Over limit</span>`
        : `<span class="badge badge-amber">Late</span>`;
      return `
        <tr class="late-joiner-row" data-late-employee-id="${escapeAttr(row.employeeId)}" style="cursor:pointer" title="View late check-in details">
          <td>${escapeAttr(row.name ?? "—")} (${escapeAttr(row.employeeCode ?? "—")})</td>
          <td>${escapeAttr(row.department ?? "—")}</td>
          <td>${Number(row.lateCount ?? 0)}</td>
          <td>${escapeAttr(latest)}</td>
          <td>${status}</td>
        </tr>
      `;
    }).join("");
    if (mobileList) {
      mobileList.innerHTML = rows.map((row) => {
        const latest = row.latestCheckInAt
          ? new Date(row.latestCheckInAt).toLocaleString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })
          : "—";
        const status = row.warningActive
          ? `<span class="badge badge-coral">Over limit</span>`
          : `<span class="badge badge-amber">Late</span>`;
        return `
          <article class="record-card record-card-tappable" data-late-employee-id="${escapeAttr(row.employeeId)}" role="button" tabindex="0">
            <div class="record-card-head">
              <div class="record-card-head-main">
                <div class="record-card-name">${escapeAttr(row.name ?? "—")}</div>
                <div class="record-card-sub">${escapeAttr(row.employeeCode ?? "—")} · ${escapeAttr(row.department ?? "—")}</div>
                <div class="record-card-badges">${status}</div>
              </div>
            </div>
            <div class="record-card-grid">
              <div class="record-card-field"><span class="record-card-label">Late Count</span><span class="record-card-value">${Number(row.lateCount ?? 0)}</span></div>
              <div class="record-card-field"><span class="record-card-label">Latest Late Check-in</span><span class="record-card-value">${escapeAttr(latest)}</span></div>
            </div>
          </article>
        `;
      }).join("");
      mobileList.querySelectorAll("[data-late-employee-id]").forEach((card) => {
        const open = () => showLateJoinerDetails(card.dataset.lateEmployeeId);
        card.addEventListener("click", open);
        card.addEventListener("keydown", (event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            open();
          }
        });
      });
    }
    tbody.querySelectorAll("tr[data-late-employee-id]").forEach((tr) => {
      tr.addEventListener("click", () => {
        showLateJoinerDetails(tr.dataset.lateEmployeeId);
      });
    });
  } catch (error) {
    tbody.innerHTML = `<tr><td colspan="5" class="text-muted">${escapeAttr(error.message ?? "Failed to load late joiners")}</td></tr>`;
    if (mobileList) mobileList.innerHTML = `<div class="mobile-empty">${escapeAttr(error.message ?? "Failed to load late joiners")}</div>`;
  }
}

window.__lateJoinersPrevMonth = function lateJoinersPrevMonth() {
  lateJoinersMonth = new Date(lateJoinersMonth.getFullYear(), lateJoinersMonth.getMonth() - 1, 1);
  loadLateJoiners().catch((error) => notify(error.message));
};

window.__lateJoinersNextMonth = function lateJoinersNextMonth() {
  const now = new Date();
  const next = new Date(lateJoinersMonth.getFullYear(), lateJoinersMonth.getMonth() + 1, 1);
  if (next.getFullYear() > now.getFullYear()
    || (next.getFullYear() === now.getFullYear() && next.getMonth() > now.getMonth())) {
    return;
  }
  lateJoinersMonth = next;
  loadLateJoiners().catch((error) => notify(error.message));
};

function formatLateSessionClock(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

function showLateJoinerDetails(employeeId) {
  const row = lateJoinersCache.find((item) => item.employeeId === employeeId);
  const title = document.getElementById("att-late-detail-title");
  const summary = document.getElementById("att-late-detail-summary");
  const body = document.getElementById("att-late-detail-body");
  if (!row || !title || !summary || !body) return;

  const monthLabel = formatCalendarMonthLabel(lateJoinersMonth);
  title.textContent = `${row.name ?? "Employee"} — Late Check-ins`;
  summary.innerHTML = `
    <strong>${escapeAttr(row.employeeCode ?? "—")}</strong>
    · ${escapeAttr(row.department ?? "—")}
    · ${escapeAttr(row.designation ?? "—")}
    · ${Number(row.lateCount ?? 0)} late check-in(s) in ${escapeAttr(monthLabel)}
    · ${row.warningActive ? '<span class="badge badge-coral">Over limit</span>' : '<span class="badge badge-amber">Late</span>'}
  `;

  const sessions = Array.isArray(row.sessions) ? [...row.sessions] : [];
  sessions.sort((a, b) => new Date(b.checkInAt).getTime() - new Date(a.checkInAt).getTime());

  if (!sessions.length) {
    body.innerHTML = `<tr><td colspan="5" class="text-muted">No session details available.</td></tr>`;
  } else {
    body.innerHTML = sessions.map((session) => {
      const checkIn = new Date(session.checkInAt);
      const dateLabel = Number.isNaN(checkIn.getTime())
        ? "—"
        : checkIn.toLocaleDateString("en-GB", { weekday: "short", day: "2-digit", month: "short", year: "numeric" });
      return `
        <tr>
          <td>${escapeAttr(dateLabel)}</td>
          <td>${escapeAttr(formatLateSessionClock(session.checkInAt))}</td>
          <td>${session.checkOutAt ? escapeAttr(formatLateSessionClock(session.checkOutAt)) : "—"}</td>
          <td>${escapeAttr(formatLabel(session.checkInMethod ?? "MANUAL"))}</td>
          <td>${escapeAttr(session.officeName ?? "—")}</td>
        </tr>
      `;
    }).join("");
  }

  openModal("att-late-detail-modal");
}

window.__showLateJoinerDetails = showLateJoinerDetails;

async function loadOnlineAttendance() {
  const rows = await api("/attendance/online");
  const tbody = document.getElementById("att-online-body");
  const mobileList = document.getElementById("att-online-mobile");
  if (!tbody) return;
  const list = Array.isArray(rows) ? rows : [];
  latestOnlineAttendanceRows = list;
  if (!list.length) {
    tbody.innerHTML = `<tr><td colspan="5" class="text-muted">No employees currently online.</td></tr>`;
    if (mobileList) mobileList.innerHTML = `<div class="mobile-empty">No employees currently online.</div>`;
    renderAttendanceMap([]);
    renderSelectedOfficeDetailsMap();
    return;
  }
  tbody.innerHTML = list.map((row) => {
    const fullName = `${row.employee?.firstName ?? ""} ${row.employee?.lastName ?? ""}`.trim();
    const latestPing = row.latestPing;
    const coords = latestPing ? formatPingLocation(latestPing) : "—";
    const pingTime = latestPing
      ? new Date(latestPing.recordedAt).toLocaleString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })
      : "—";
    return `
      <tr>
        <td>${escapeAttr(fullName)} (${escapeAttr(row.employee?.employeeCode ?? "—")})${row.isLateCheckIn ? ' <span class="badge badge-amber">Late</span>' : ""}</td>
        <td>${escapeAttr(formatLabel(row.employee?.workMode ?? "OFFICE"))}</td>
        <td>${escapeAttr(row.office?.name ?? "Remote")}</td>
        <td>${coords}</td>
        <td>${pingTime}</td>
      </tr>
    `;
  }).join("");
  if (mobileList) {
    mobileList.innerHTML = list.map((row) => {
      const fullName = `${row.employee?.firstName ?? ""} ${row.employee?.lastName ?? ""}`.trim();
      const latestPing = row.latestPing;
      const geoTag = latestPing?.geoTag ?? (latestPing ? formatPingLocation(latestPing) : "—");
      const pingTime = latestPing
        ? new Date(latestPing.recordedAt).toLocaleString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })
        : "—";
      return `
        <article class="record-card">
          <div class="record-card-head">
            <div class="record-card-head-main">
              <div class="record-card-name">${escapeAttr(fullName || "Employee")}</div>
              <div class="record-card-sub">${escapeAttr(row.employee?.employeeCode ?? "—")}</div>
              <div class="record-card-badges">
                <span class="badge badge-green">Online</span>
                ${row.isLateCheckIn ? '<span class="badge badge-amber">Late</span>' : ""}
              </div>
            </div>
          </div>
          <div class="record-card-grid">
            <div class="record-card-field"><span class="record-card-label">Mode</span><span class="record-card-value">${escapeAttr(formatLabel(row.employee?.workMode ?? "OFFICE"))}</span></div>
            <div class="record-card-field"><span class="record-card-label">Office</span><span class="record-card-value">${escapeAttr(row.office?.name ?? "Remote")}</span></div>
            <div class="record-card-field"><span class="record-card-label">Location</span><span class="record-card-value">${escapeAttr(geoTag ?? "—")}</span></div>
            <div class="record-card-field"><span class="record-card-label">Last Ping</span><span class="record-card-value">${escapeAttr(pingTime)}</span></div>
          </div>
        </article>
      `;
    }).join("");
  }
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

function formatCalendarClockTime(value) {
  return new Date(value).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

function pingLocationLabel(ping) {
  if (ping?.geoTag) return String(ping.geoTag);
  if (Number.isFinite(Number(ping?.latitude)) && Number.isFinite(Number(ping?.longitude))) {
    return `${Number(ping.latitude).toFixed(4)}, ${Number(ping.longitude).toFixed(4)}`;
  }
  return null;
}

function summarizePingLocations(pings) {
  const labels = pings.map(pingLocationLabel).filter(Boolean);
  if (!labels.length) return "";
  const unique = [...new Set(labels)];
  if (unique.length === 1) return unique[0];
  if (unique.length === 2) return `${unique[0]} → ${unique[1]}`;
  return `${unique[0]} → ${unique[unique.length - 1]} (${unique.length} places)`;
}

function formatLocationTrackedSummary(pings, rangeLabel) {
  const count = pings.length;
  const location = summarizePingLocations(pings);
  const locationPart = location ? ` · ${location}` : "";
  return `Location tracked · ${count} update${count === 1 ? "" : "s"} (${rangeLabel})${locationPart}`;
}

function groupRoutinePingBlocks(pings) {
  const routinePings = pings
    .filter((ping) => String(ping.eventType ?? "PING") === "PING")
    .sort((a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime());
  if (!routinePings.length) return [];

  const blocks = [];
  let block = null;
  for (const ping of routinePings) {
    const timestamp = new Date(ping.recordedAt).getTime();
    if (!block || timestamp - block.endMs > 45 * 60 * 1000) {
      if (block) blocks.push(block);
      block = {
        startMs: timestamp,
        endMs: timestamp,
        startAt: ping.recordedAt,
        endAt: ping.recordedAt,
        count: 1,
        outsideGeofence: ping.insideGeofence === false,
        pings: [ping],
      };
    } else {
      block.endMs = timestamp;
      block.endAt = ping.recordedAt;
      block.count += 1;
      block.pings.push(ping);
      if (ping.insideGeofence === false) block.outsideGeofence = true;
    }
  }
  if (block) blocks.push(block);
  return blocks;
}

function buildCalendarTimelineEvents(sessions, pings) {
  const events = [];

  sessions.forEach((session) => {
    const checkInAt = session.checkInAt;
    const checkOutAt = session.checkOutAt;
    events.push({
      at: checkInAt,
      tone: "green",
      text: `Checked in (${formatLabel(session.checkInMethod ?? "MANUAL")})`,
      kind: "session",
    });

    const sessionEnd = checkOutAt ? new Date(checkOutAt).getTime() : Date.now();
    const sessionStart = new Date(checkInAt).getTime();
    const sessionPings = pings.filter((ping) => {
      const ts = new Date(ping.recordedAt).getTime();
      return ts >= sessionStart && ts <= sessionEnd;
    });

    sessionPings
      .filter((ping) => CALENDAR_SIGNIFICANT_PING_TYPES.has(String(ping.eventType)))
      .forEach((ping) => {
        const label = ping.geoTag
          ? `${formatLabel(String(ping.eventType))} · ${ping.geoTag}`
          : formatLabel(String(ping.eventType));
        events.push({
          at: ping.recordedAt,
          tone: ping.insideGeofence === false ? "amber" : "",
          text: label,
          kind: "alert",
        });
      });

    const routinePings = sessionPings.filter((ping) => String(ping.eventType ?? "PING") === "PING");
    if (routinePings.length && !calendarShowPingDetails) {
      const start = routinePings[0].recordedAt;
      const end = routinePings[routinePings.length - 1].recordedAt;
      const startLabel = formatCalendarClockTime(start);
      const endLabel = formatCalendarClockTime(end);
      const rangeLabel = startLabel === endLabel ? startLabel : `${startLabel}–${endLabel}`;
      events.push({
        at: start,
        tone: "",
        text: formatLocationTrackedSummary(routinePings, rangeLabel),
        kind: "summary",
        isSummary: true,
      });
    } else if (calendarShowPingDetails) {
      routinePings.forEach((ping) => {
        const location = pingLocationLabel(ping);
        const label = location ? `Ping · ${location}` : "Location ping";
        events.push({
          at: ping.recordedAt,
          tone: ping.insideGeofence === false ? "amber" : "",
          text: label,
          kind: "ping",
        });
      });
    }

    if (checkOutAt) {
      events.push({
        at: checkOutAt,
        tone: "amber",
        text: `Checked out (${formatLabel(session.checkOutMethod ?? "MANUAL")})`,
        kind: "session",
      });
    } else {
      events.push({
        at: new Date().toISOString(),
        tone: "",
        text: "Session still active (not checked out yet)",
        kind: "session",
      });
    }
  });

  if (!sessions.length) {
    pings
      .filter((ping) => {
        const type = String(ping.eventType ?? "PING");
        if (calendarShowPingDetails && type === "PING") return true;
        return CALENDAR_SIGNIFICANT_PING_TYPES.has(type) || CALENDAR_SESSION_BOUNDARY_PING_TYPES.has(type);
      })
      .forEach((ping) => {
        const label = ping.geoTag
          ? `${formatLabel(String(ping.eventType ?? "PING"))} · ${ping.geoTag}`
          : formatLabel(String(ping.eventType ?? "PING"));
        events.push({
          at: ping.recordedAt,
          tone: ping.insideGeofence === false ? "amber" : "",
          text: label,
          kind: ping.eventType === "PING" ? "ping" : "alert",
        });
      });

    if (!calendarShowPingDetails) {
      groupRoutinePingBlocks(pings).forEach((block) => {
        const rangeLabel = formatCalendarClockTime(block.startAt) === formatCalendarClockTime(block.endAt)
          ? formatCalendarClockTime(block.startAt)
          : `${formatCalendarClockTime(block.startAt)}–${formatCalendarClockTime(block.endAt)}`;
        events.push({
          at: block.startAt,
          tone: block.outsideGeofence ? "amber" : "",
          text: formatLocationTrackedSummary(block.pings ?? [], rangeLabel),
          kind: "summary",
          isSummary: true,
        });
      });
    }
  }

  return events.sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime());
}

function renderCalendarDayTimeline() {
  const timeline = document.getElementById("cal-day-timeline");
  const toggleBtn = document.getElementById("cal-timeline-toggle-pings");
  if (!timeline || !calendarDayCache) return;

  const { pings, sessions } = calendarDayCache;
  const routinePingCount = pings.filter((ping) => String(ping.eventType ?? "PING") === "PING").length;
  if (toggleBtn) {
    toggleBtn.style.display = routinePingCount > 0 ? "" : "none";
    toggleBtn.textContent = calendarShowPingDetails ? "Hide pings" : `Show all pings (${routinePingCount})`;
  }

  const events = buildCalendarTimelineEvents(sessions, pings);
  if (!events.length) {
    timeline.innerHTML = `<div class="text-muted">No check-in/check-out events for this date.</div>`;
    return;
  }

  timeline.innerHTML = events.map((event, index) => {
    const prev = index > 0 ? events[index - 1] : null;
    const prevGapMinutes = prev
      ? Math.max(0, Math.round((new Date(event.at).getTime() - new Date(prev.at).getTime()) / 60000))
      : null;
    const showGap = prevGapMinutes !== null
      && prevGapMinutes >= 5
      && !event.isSummary
      && !prev?.isSummary;
    const gapLine = showGap ? `<div class="tl-gap">+${prevGapMinutes} min gap</div>` : "";
    const timeLabel = event.kind === "summary"
      ? formatCalendarClockTime(event.at)
      : new Date(event.at).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
    return `
      <div class="tl-item${event.isSummary ? " is-summary" : ""}">
        <div class="tl-dot ${event.tone}"></div>
        <div class="tl-date">${escapeAttr(timeLabel)}</div>
        <div class="tl-text">${escapeAttr(event.text)}</div>
        ${gapLine}
      </div>`;
  }).join("");
}

window.__toggleCalendarPingDetails = function toggleCalendarPingDetails() {
  calendarShowPingDetails = !calendarShowPingDetails;
  renderCalendarDayTimeline();
};

async function loadCalendarDayRoute(dateKey) {
  const title = document.getElementById("cal-selected-date");
  const summary = document.getElementById("cal-day-summary");
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
  calendarDayCache = { dateKey, pings, sessions };
  renderCalendarDayTimeline();

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

  const routeColor = getComputedStyle(document.documentElement).getPropertyValue("--map-route-color").trim() || "#fafafa";
  const polyline = window.L.polyline(points, {
    color: routeColor,
    weight: 4,
    opacity: 0.85,
  }).addTo(calendarMap);
  const pingMarkers = pings
    .filter((ping) => Number.isFinite(Number(ping.latitude)) && Number.isFinite(Number(ping.longitude)))
    .map((ping) => window.L.circleMarker([Number(ping.latitude), Number(ping.longitude)], {
      radius: 4,
      color: routeColor,
      fillColor: getComputedStyle(document.documentElement).getPropertyValue("--blue-bright").trim() || "#a3a3a3",
      fillOpacity: 0.85,
    }).bindPopup(`
      <div style="font-size:12px;line-height:1.45">
        <div><b>${escapeAttr(formatLabel(String(ping.eventType ?? "PING")))}</b></div>
        ${ping.geoTag ? `<div>${escapeAttr(ping.geoTag)}</div>` : ""}
        <div>${escapeAttr(new Date(ping.recordedAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }))}</div>
      </div>
    `));
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
  calendarRouteLayer = window.L.featureGroup([polyline, ...pingMarkers, startMarker, endMarker]).addTo(calendarMap);
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

function captureVideoFrame(video) {
  const canvas = document.createElement("canvas");
  canvas.width = video.videoWidth || 640;
  canvas.height = video.videoHeight || 480;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Unable to capture face photo");
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", 0.92);
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
    const capturedImages = [];
    let currentTargetIdx = 0;
    let stableFrames = 0;
    let detectionBusy = false;
    let isResolved = false;

    const finalize = (payload, options = {}) => {
      if (isResolved) return;
      isResolved = true;
      faceCaptureReject = null;
      if (!options.keepOpen) {
        stopFaceModalStream();
      }
      resolve(payload);
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
          .detectSingleFace(video, new window.faceapi.TinyFaceDetectorOptions({ inputSize: 416, scoreThreshold: 0.4 }))
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
        if (stableFrames < 12) {
          setFaceModalStatus("Scanning", "blue");
          setFaceModalGuide(mode === "enroll"
            ? `Hold ${target}...`
            : "Hold still for auto-capture...");
          faceDetectionFrameId = requestAnimationFrame(runDetectionFrame);
          return;
        }

        const frameImage = captureVideoFrame(video);
        if (mode === "enroll") {
          capturedImages.push(frameImage);
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
          finalize({ images: capturedImages });
          return;
        }

        setFaceModalStatus("Captured", "green");
        setFaceModalGuide("Verifying identity…");
        await new Promise((done) => setTimeout(done, 220));
        finalize({ image: frameImage }, { keepOpen: true });
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
  const capture = await openFaceModal("enroll");
  await api("/attendance/face/enroll-photo", {
    method: "POST",
    body: JSON.stringify({ images: capture.images }),
  });
  setFaceModalStatus("Enrollment successful", "green");
  await new Promise((resolve) => setTimeout(resolve, 700));
  window.__closeFaceModal();
  await loadFaceStatus();
  notify("Face enrollment completed");
}

async function verifyFaceFlow() {
  const capture = await openFaceModal("verify");
  setFaceModalStatus("Verifying", "blue");
  setFaceModalGuide("Checking face against your enrollment…");
  try {
    const result = await api("/attendance/face/verify-photo", {
      method: "POST",
      body: JSON.stringify({ image: capture.image }),
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
    const location = await getCurrentLocationWithGeoTag();
    const result = await api("/attendance/check-in", {
      method: "POST",
      body: JSON.stringify({
        ...location,
        faceVerificationToken,
      }),
    });
    await Promise.all([loadAttendanceStatus(), loadOnlineAttendance(), loadDashboard()]);
    notify(result?.lateCheckIn
      ? `Checked in late (${result?.lateAttendance?.monthlyLateCount ?? 1} this month)`
      : "Checked in successfully");
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
    const location = await getCurrentLocationWithGeoTag().catch(() => null);
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
    await Promise.all([loadAttendanceStatus(), loadOnlineAttendance(), loadFaceStatus(), loadLateJoiners()]);
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

function formatProfileDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function loadProfile() {
  if (!me?.employee) return;
  const employee = me.employee;
  const money = (value) => formatProfileMoney(value, employee.netPayCurrency);
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
    "profile-basic-salary": money(employee.basicSalary),
    "profile-housing": money(employee.housingAllowance),
    "profile-transport": money(employee.transportAllowance),
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
  refreshMobileSidebarNav();
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

const MASTER_VIEW_LABELS = {
  dashboard: "Dashboard",
  employees: "Employees",
  leave: "Leave",
  exits: "Exits",
  clearance: "Clearance",
  payadjust: "Pay Adjustments",
  pro: "PRO",
  documents: "Documents",
  attendance: "Attendance",
  calendar: "Calendar",
  offices: "Offices",
  masterdata: "Master Data",
  profile: "Profile",
  settings: "Settings",
};

function toTimeInputValue(value = "") {
  const match = /^(\d{1,2}):(\d{2})$/.exec(String(value).trim());
  if (!match) return "";
  return `${String(match[1]).padStart(2, "0")}:${match[2]}`;
}

function fromTimeInputValue(value = "") {
  if (!value) return "";
  const [hours, minutes] = value.split(":");
  return `${String(hours).padStart(2, "0")}:${minutes}`;
}

function setMasterDataTableMessage(message) {
  const html = `<tr><td colspan="8" class="text-muted">${escapeAttr(message)}</td></tr>`;
  ["md-leave-types-body", "md-roles-body"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = html;
  });
}

function renderMasterDataForms() {
  if (!masterDataCache) return;
  const { attendance, leave, leaveTypes, roles, settings, airTicket } = masterDataCache;
  if (!attendance || !leave) {
    setMasterDataTableMessage("Master data response was incomplete.");
    return;
  }

  const checkInStart = document.getElementById("md-check-in-start");
  const checkInEnd = document.getElementById("md-check-in-end");
  const autoCheckOut = document.getElementById("md-auto-check-out");
  const timezone = document.getElementById("md-timezone");
  const annualDays = document.getElementById("md-annual-days");
  const maturityCap = document.getElementById("md-maturity-cap");
  const maturityNote = document.getElementById("md-maturity-rate-note");
  const dualThreshold = document.getElementById("md-dual-threshold");

  if (checkInStart) checkInStart.value = toTimeInputValue(attendance.checkInStart);
  if (checkInEnd) checkInEnd.value = toTimeInputValue(attendance.checkInEnd);
  if (autoCheckOut) autoCheckOut.value = toTimeInputValue(attendance.autoCheckOut);
  if (timezone) timezone.value = attendance.timezone ?? "Asia/Dubai";
  if (annualDays) annualDays.value = leave.annualYearlyDays;
  if (maturityCap) maturityCap.value = leave.maturityMaxCap;
  if (maturityNote) {
    maturityNote.textContent =
      `Daily accrual rate: ${Number(leave.maturityDailyRate ?? 0).toFixed(4)} day(s) per day worked.`;
  }
  const thresholdSetting = Array.isArray(settings)
    ? settings.find((item) => item.key === "payroll.dualApprovalThreshold")
    : null;
  if (dualThreshold) dualThreshold.value = Number(thresholdSetting?.value ?? 5000);

  const airEnabled = document.getElementById("md-air-enabled");
  const airMinDays = document.getElementById("md-air-min-days");
  const airLeaveCodes = document.getElementById("md-air-leave-codes");
  const airBody = document.getElementById("md-air-ticket-body");
  if (airEnabled) airEnabled.value = airTicket?.enabled === false ? "false" : "true";
  if (airMinDays) airMinDays.value = Number(airTicket?.minDays ?? 30);
  if (airLeaveCodes) {
    airLeaveCodes.value = Array.isArray(airTicket?.eligibleLeaveCodes)
      ? airTicket.eligibleLeaveCodes.join(", ")
      : "AL";
  }
  if (airBody) {
    const fares = Array.isArray(airTicket?.fares) ? airTicket.fares : [];
    airBody.innerHTML = fares.length
      ? fares.map((row, index) => `
        <tr data-air-row="${index}">
          <td><input type="text" class="md-air-country" value="${escapeAttr(row.country ?? "")}" style="width:100%"></td>
          <td><input type="number" class="md-air-manager" min="0" step="50" value="${Number(row.manager ?? 0)}" style="width:100%"></td>
          <td><input type="number" class="md-air-staff" min="0" step="50" value="${Number(row.staff ?? 0)}" style="width:100%"></td>
          <td><input type="number" class="md-air-labour" min="0" step="50" value="${Number(row.labour ?? 0)}" style="width:100%"></td>
        </tr>`).join("")
      : `<tr><td colspan="4" class="text-muted">No fare rows configured.</td></tr>`;
  }

  const leaveBody = document.getElementById("md-leave-types-body");
  if (leaveBody) {
    leaveBody.innerHTML = leaveTypes.length
      ? leaveTypes.map((type) => `
        <tr>
          <td>${escapeAttr(type.name)}</td>
          <td>${escapeAttr(type.code)}</td>
          <td>${type.yearlyAllocation}</td>
          <td>${escapeAttr(formatLabel(type.balanceMode))}</td>
          <td>${escapeAttr(formatLabel(type.payRate))}</td>
          <td>${type.requiresAttachment ? "Yes" : "No"}</td>
          <td><span class="badge ${type.active ? "badge-green" : "badge-coral"}">${type.active ? "Active" : "Inactive"}</span></td>
          <td><button class="btn btn-secondary btn-sm" onclick="window.__editLeaveType('${escapeAttr(type.id)}')">Edit</button></td>
        </tr>`).join("")
      : `<tr><td colspan="8" class="text-muted">No leave types configured.</td></tr>`;
  }

  const rolesBody = document.getElementById("md-roles-body");
  if (rolesBody) {
    rolesBody.innerHTML = roles.length
      ? roles.map((role) => `
        <tr>
          <td>${escapeAttr(role.code)}</td>
          <td>${escapeAttr(role.label)}</td>
          <td>${role.isIndividualContributor ? "Yes" : "No"}</td>
          <td>${role.canVoidActingColleague ? "Yes" : "No"}</td>
          <td>${role.assignable ? "Yes" : "No"}</td>
          <td style="max-width:220px;font-size:12px">${escapeAttr((role.allowedViews ?? []).map((view) => MASTER_VIEW_LABELS[view] ?? view).join(", "))}</td>
          <td><span class="badge ${role.active ? "badge-green" : "badge-coral"}">${role.active ? "Active" : "Inactive"}</span></td>
          <td><button class="btn btn-secondary btn-sm" onclick="window.__editRole('${escapeAttr(role.id)}')">Edit</button></td>
        </tr>`).join("")
      : `<tr><td colspan="8" class="text-muted">No roles configured.</td></tr>`;
  }
}

async function loadMasterData() {
  if (!hasRole(["SUPER_ADMIN", "HR"])) {
    setMasterDataTableMessage("You do not have permission to manage master data.");
    throw new Error("You do not have permission to manage master data.");
  }
  setMasterDataTableMessage("Loading…");
  try {
    masterDataCache = await api("/master");
    renderMasterDataForms();
  } catch (error) {
    setMasterDataTableMessage(error?.message ?? "Failed to load master data.");
    throw error;
  }
}

window.__loadViewData = function loadViewData(view) {
  if (view === "attendance" && token && me) {
    loadLateJoiners().catch((error) => notify(error.message));
  }
  if (view !== "masterdata") return;
  if (!token || !me) {
    pendingMasterDataLoad = true;
    return;
  }
  loadMasterData().catch((error) => notify(error.message));
};

function renderRoleViewCheckboxes(selected = []) {
  const container = document.getElementById("md-role-views");
  if (!container) return;
  const views = publicMasterConfig?.views ?? Object.keys(MASTER_VIEW_LABELS);
  const selectedSet = new Set(selected);
  container.innerHTML = views.map((view) => `
    <label style="display:flex;align-items:center;gap:6px;font-size:12px">
      <input type="checkbox" value="${escapeAttr(view)}" ${selectedSet.has(view) ? "checked" : ""}>
      ${escapeAttr(MASTER_VIEW_LABELS[view] ?? view)}
    </label>`).join("");
}

window.__openLeaveTypeModal = function openLeaveTypeModal() {
  document.getElementById("md-lt-id").value = "";
  document.getElementById("md-leave-type-modal-title").textContent = "Add Leave Type";
  document.getElementById("md-lt-name").value = "";
  document.getElementById("md-lt-code").value = "";
  document.getElementById("md-lt-code").disabled = false;
  document.getElementById("md-lt-days").value = "0";
  document.getElementById("md-lt-carry").value = "0";
  document.getElementById("md-lt-balance-mode").value = "YEARLY";
  document.getElementById("md-lt-pay-rate").value = "FULL";
  document.getElementById("md-lt-attachment").value = "false";
  document.getElementById("md-lt-paid").value = "true";
  document.getElementById("md-lt-active").value = "true";
  openModal("md-leave-type-modal");
};

window.__editLeaveType = function editLeaveType(id) {
  const type = masterDataCache?.leaveTypes?.find((item) => item.id === id);
  if (!type) return;
  document.getElementById("md-lt-id").value = type.id;
  document.getElementById("md-leave-type-modal-title").textContent = "Edit Leave Type";
  document.getElementById("md-lt-name").value = type.name ?? "";
  document.getElementById("md-lt-code").value = type.code ?? "";
  document.getElementById("md-lt-code").disabled = true;
  document.getElementById("md-lt-days").value = type.yearlyAllocation ?? 0;
  document.getElementById("md-lt-carry").value = type.maxCarryForward ?? 0;
  document.getElementById("md-lt-balance-mode").value = type.balanceMode ?? "YEARLY";
  document.getElementById("md-lt-pay-rate").value = type.payRate ?? "FULL";
  document.getElementById("md-lt-attachment").value = type.requiresAttachment ? "true" : "false";
  document.getElementById("md-lt-paid").value = type.paidLeave ? "true" : "false";
  document.getElementById("md-lt-active").value = type.active ? "true" : "false";
  openModal("md-leave-type-modal");
};

window.__saveLeaveTypeModal = async function saveLeaveTypeModal() {
  const payload = {
    name: document.getElementById("md-lt-name").value.trim(),
    code: document.getElementById("md-lt-code").value.trim().toUpperCase(),
    yearlyAllocation: Number(document.getElementById("md-lt-days").value || 0),
    maxCarryForward: Number(document.getElementById("md-lt-carry").value || 0),
    balanceMode: document.getElementById("md-lt-balance-mode").value,
    payRate: document.getElementById("md-lt-pay-rate").value,
    requiresAttachment: document.getElementById("md-lt-attachment").value === "true",
    paidLeave: document.getElementById("md-lt-paid").value === "true",
    active: document.getElementById("md-lt-active").value === "true",
  };
  const id = document.getElementById("md-lt-id").value;
  try {
    if (id) {
      await api(`/master/leave-types/${id}`, { method: "PATCH", body: JSON.stringify(payload) });
    } else {
      await api("/master/leave-types", { method: "POST", body: JSON.stringify(payload) });
    }
    closeModal("md-leave-type-modal");
    leaveTypes = await api("/leave/types");
    populateLeaveTypes();
    await loadMasterData();
    notify("Leave type saved.");
  } catch (error) {
    notify(error.message);
  }
};

window.__openRoleModal = function openRoleModal() {
  document.getElementById("md-role-id").value = "";
  document.getElementById("md-role-modal-title").textContent = "Add Role";
  document.getElementById("md-role-code").value = "";
  document.getElementById("md-role-code").disabled = false;
  document.getElementById("md-role-label").value = "";
  document.getElementById("md-role-desc").value = "";
  document.getElementById("md-role-ic").value = "false";
  document.getElementById("md-role-void").value = "false";
  document.getElementById("md-role-assignable").value = "true";
  document.getElementById("md-role-active").value = "true";
  renderRoleViewCheckboxes(["dashboard", "profile", "settings"]);
  openModal("md-role-modal");
};

window.__editRole = function editRole(id) {
  const role = masterDataCache?.roles?.find((item) => item.id === id);
  if (!role) return;
  document.getElementById("md-role-id").value = role.id;
  document.getElementById("md-role-modal-title").textContent = "Edit Role";
  document.getElementById("md-role-code").value = role.code ?? "";
  document.getElementById("md-role-code").disabled = true;
  document.getElementById("md-role-label").value = role.label ?? "";
  document.getElementById("md-role-desc").value = role.description ?? "";
  document.getElementById("md-role-ic").value = role.isIndividualContributor ? "true" : "false";
  document.getElementById("md-role-void").value = role.canVoidActingColleague ? "true" : "false";
  document.getElementById("md-role-assignable").value = role.assignable ? "true" : "false";
  document.getElementById("md-role-active").value = role.active ? "true" : "false";
  renderRoleViewCheckboxes(role.allowedViews ?? []);
  openModal("md-role-modal");
};

window.__saveRoleModal = async function saveRoleModal() {
  const allowedViews = Array.from(document.querySelectorAll("#md-role-views input:checked")).map((input) => input.value);
  if (!allowedViews.length) {
    notify("Select at least one allowed view.");
    return;
  }
  const payload = {
    code: document.getElementById("md-role-code").value.trim().toUpperCase(),
    label: document.getElementById("md-role-label").value.trim(),
    description: document.getElementById("md-role-desc").value.trim() || undefined,
    isIndividualContributor: document.getElementById("md-role-ic").value === "true",
    canVoidActingColleague: document.getElementById("md-role-void").value === "true",
    assignable: document.getElementById("md-role-assignable").value === "true",
    active: document.getElementById("md-role-active").value === "true",
    allowedViews,
  };
  const id = document.getElementById("md-role-id").value;
  try {
    if (id) {
      const { code, ...updatePayload } = payload;
      await api(`/master/roles/${id}`, { method: "PATCH", body: JSON.stringify(updatePayload) });
    } else {
      await api("/master/roles", { method: "POST", body: JSON.stringify(payload) });
    }
    closeModal("md-role-modal");
    await loadPublicMasterConfig();
    await applyRoleBasedUi();
    await loadMasterData();
    notify("Role saved.");
  } catch (error) {
    notify(error.message);
  }
};

window.__saveMasterAttendance = async function saveMasterAttendance() {
  try {
    await api("/master/attendance", {
      method: "PATCH",
      body: JSON.stringify({
        checkInStart: fromTimeInputValue(document.getElementById("md-check-in-start").value),
        checkInEnd: fromTimeInputValue(document.getElementById("md-check-in-end").value),
        autoCheckOut: fromTimeInputValue(document.getElementById("md-auto-check-out").value),
        timezone: document.getElementById("md-timezone").value.trim(),
      }),
    });
    await loadMasterData();
    notify("Attendance policy saved.");
  } catch (error) {
    notify(error.message);
  }
};

window.__saveMasterLeavePolicy = async function saveMasterLeavePolicy() {
  try {
    await api("/master/leave-policy", {
      method: "PATCH",
      body: JSON.stringify({
        annualYearlyDays: Number(document.getElementById("md-annual-days").value),
        maturityMaxCap: Number(document.getElementById("md-maturity-cap").value),
      }),
    });
    await loadMasterData();
    notify("Leave policy saved.");
  } catch (error) {
    notify(error.message);
  }
};

function collectMasterAirTicketPayload() {
  const fares = Array.from(document.querySelectorAll("#md-air-ticket-body tr[data-air-row]")).map((row) => ({
    country: row.querySelector(".md-air-country")?.value?.trim() ?? "",
    manager: Number(row.querySelector(".md-air-manager")?.value || 0),
    staff: Number(row.querySelector(".md-air-staff")?.value || 0),
    labour: Number(row.querySelector(".md-air-labour")?.value || 0),
  })).filter((row) => row.country);

  return {
    enabled: document.getElementById("md-air-enabled")?.value === "true",
    minDays: Number(document.getElementById("md-air-min-days")?.value || 30),
    eligibleLeaveCodes: (document.getElementById("md-air-leave-codes")?.value || "AL")
      .split(",")
      .map((code) => code.trim().toUpperCase())
      .filter(Boolean),
    fares,
  };
}

window.__saveMasterAirTicket = async function saveMasterAirTicket() {
  try {
    const payload = collectMasterAirTicketPayload();
    if (!payload.fares.length) {
      notify("Add at least one country fare row.");
      return;
    }
    await api("/master/air-ticket", {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
    await loadMasterData();
    notify("Air ticket settings saved.");
  } catch (error) {
    notify(error.message);
  }
};

window.__resetMasterAirTicketFares = async function resetMasterAirTicketFares() {
  try {
    await api("/master/air-ticket/reset-fares", { method: "POST" });
    await loadMasterData();
    notify("Default air ticket fares restored.");
  } catch (error) {
    notify(error.message);
  }
};

window.__saveMasterPayroll = async function saveMasterPayroll() {
  try {
    await api("/master/payroll", {
      method: "PATCH",
      body: JSON.stringify({
        dualApprovalThreshold: Number(document.getElementById("md-dual-threshold").value),
      }),
    });
    await loadMasterData();
    notify("Payroll settings saved.");
  } catch (error) {
    notify(error.message);
  }
};

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
    await loadPublicMasterConfig();
    await applyRoleBasedUi();
    const addButton = document.getElementById("emp-add-btn");
    if (addButton && !elevatedRoles.has(me?.role)) {
      addButton.style.display = "none";
    }
    await loadOffices();
    leaveTypes = await api("/leave/types");
    populateLeaveTypes();
    wireLeaveApplyForm();
    wireLeaveBalanceLookup();
    wireLeaveHistoryTab();
    wireDocumentsLookup();
    const exitNav = document.querySelector(".nav-item[onclick*=\"navigate('exits'\"]");
    exitNav?.addEventListener("click", () => {
      populateExitEmployeeSelects();
      loadExits().catch((error) => notify(error.message));
    });
    const clearanceNav = document.querySelector(".nav-item[onclick*=\"navigate('clearance'\"]");
    clearanceNav?.addEventListener("click", () => {
      loadClearance().catch((error) => notify(error.message));
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
    const documentsNav = document.querySelector(".nav-item[onclick*=\"navigate('documents'\"]");
    documentsNav?.addEventListener("click", () => {
      loadDocumentsPage().catch((error) => notify(error.message));
    });
    const dashboardNav = document.querySelector(".nav-item[onclick*=\"navigate('dashboard'\"]");
    dashboardNav?.addEventListener("click", () => {
      loadDashboard().catch((error) => notify(error.message));
    });
    wireEmployeeCreation();
    wireEmployeeFilters();
    wireLeaveImport();
    document.getElementById("face-modal")?.addEventListener("click", (event) => {
      if (event.target?.id === "face-modal") {
        window.__closeFaceModal();
      }
    });
    await Promise.all([loadDashboard(), refreshEmployees(), loadLeaveRequests(), loadAttendanceStatus(), loadOnlineAttendance(), loadFaceStatus(), loadLateJoiners()]);
    populateExitEmployeeSelects();
    loadExits().catch(() => null);
    loadClearance().catch(() => null);
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
    if (document.getElementById("view-documents")?.classList.contains("active")) {
      await loadDocumentsPage();
    }
    if (document.getElementById("view-attendance")?.classList.contains("active")) {
      await Promise.all([loadAttendanceStatus(), loadOnlineAttendance()]);
      setTimeout(() => attendanceMap?.invalidateSize(), 150);
    }
    if (document.getElementById("view-masterdata")?.classList.contains("active") || pendingMasterDataLoad) {
      pendingMasterDataLoad = false;
      await loadMasterData().catch((error) => notify(error.message));
    }
    startAttendanceTracking();
    loadProfile();
    resetEmployeeModalForm();
  } catch (error) {
    notify(error.message);
  }
}

document.addEventListener("DOMContentLoaded", start);
