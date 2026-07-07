export function normalizeRole(role) {
  if (!role) return null;
  return String(role).trim().toLowerCase();
}

export function getStoredUser() {
  try {
    const raw = localStorage.getItem("user");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
}

export function normalizeUser(user, fallbackRole = null) {
  if (!user || typeof user !== "object") {
    return { role: normalizeRole(fallbackRole) || "patient" };
  }

  const role = normalizeRole(
    user.role || user.user_type || user.role_name || user.roleName || fallbackRole
  ) || "patient";

  return { ...user, role };
}
