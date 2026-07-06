
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function UserManagement() {
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 10;

  useEffect(() => {
    const loadUsers = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("Missing authentication token.");
        }

        const res = await fetch("https://clinic-system-back-end.onrender.com/api/users", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          throw new Error("Unable to load users");
        }

        const data = await res.json().catch(() => null);
        const arr = Array.isArray(data)
          ? data
          : Array.isArray(data?.user)
          ? data.user
          : [];
        setUsers(arr);
        setError("");
      } catch (err) {
        setError(err.message || "Unable to load users");
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this user?")) return;
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Missing authentication token.");
      }

      const res = await fetch(`https://clinic-system-back-end.onrender.com/api/users/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        throw new Error("Failed to delete user.");
      }

      setUsers((prev) => prev.filter((u) => u.id !== id));
      setError("");
    } catch (err) {
      setError(err.message || "Failed to delete user.");
    }
  };

  const filtered = users.filter((u) => {
    const matchSearch =
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === "all" || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const paginated = filtered.slice((currentPage - 1) * perPage, currentPage * perPage);

  const totalUsers = users.length;
  const pendingApprovals = users.filter((u) => u.status === "pending").length;

  const getInitials = (name = "") =>
    name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();

  const avatarColor = (role) => {
    switch (role) {
      case "doctor": return { bg: "#E6F1FB", color: "#185FA5" };
      case "patient": return { bg: "#E1F5EE", color: "#0F6E56" };
      case "admin": return { bg: "#FCEBEB", color: "#A32D2D" };
      default: return { bg: "#FAEEDA", color: "#854F0B" };
    }
  };

  const roleBadge = (role) => {
    switch (role) {
      case "admin":       return { bg: "#FCEBEB", color: "#A32D2D", label: "Admin" };
      case "doctor":      return { bg: "#E6F1FB", color: "#185FA5", label: "Doctor" };
      case "patient":     return { bg: "#E1F5EE", color: "#0F6E56", label: "Patient" };
      case "receptionist":return { bg: "#FAEEDA", color: "#854F0B", label: "Receptionist" };
      default:            return { bg: "#F1EFE8", color: "#5F5E5A", label: role };
    }
  };

  const pageNumbers = () => {
    const pages = [];
    const start = Math.max(1, currentPage - 1);
    const end = Math.min(totalPages, start + 2);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#F4F6FA" }}>
      

      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>

        {/* Top bar */}
        <div style={{
          background: "#fff",
          borderBottom: "0.5px solid #E2E4E9",
          padding: "12px 28px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 8,
            background: "#F4F6FA", border: "0.5px solid #E2E4E9",
            borderRadius: 10, padding: "8px 14px", width: 260,
          }}>
            <svg width="14" height="14" fill="none" stroke="#9CA3AF" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              type="text"
              placeholder="Search system records..."
              style={{ background: "transparent", border: "none", outline: "none", fontSize: 13, color: "#1E293B", width: "100%" }}
            />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ position: "relative", cursor: "pointer" }}>
              <svg width="20" height="20" fill="none" stroke="#64748B" strokeWidth="1.8" viewBox="0 0 24 24">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
              <div style={{ position: "absolute", top: -2, right: -2, width: 8, height: 8, borderRadius: "50%", background: "#E24B4A" }} />
            </div>
            <div style={{
              display: "flex", alignItems: "center", gap: 10,
              border: "0.5px solid #E2E4E9", borderRadius: 10,
              padding: "6px 12px", background: "#fff", cursor: "pointer",
            }}>
              <div style={{ textAlign: "right" }}>
                <p style={{ fontSize: 13, fontWeight: 500, color: "#1E293B", margin: 0 }}>Admin User</p>
                <p style={{ fontSize: 11, color: "#94A3B8", margin: 0 }}>Super Administrator</p>
              </div>
              <div style={{
                width: 32, height: 32, borderRadius: "50%",
                background: "#E6F1FB", display: "flex", alignItems: "center",
                justifyContent: "center", fontSize: 12, fontWeight: 500, color: "#185FA5",
              }}>AU</div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div style={{ padding: "28px 28px", flex: 1 }}>

          {/* Header row */}
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24 }}>
            <div>
              <h1 style={{ fontSize: 22, fontWeight: 500, color: "#1E293B", margin: 0 }}>User Management</h1>
              <p style={{ fontSize: 13, color: "#64748B", marginTop: 4 }}>
                Configure system access and manage staff credentials across the clinic ecosystem.
              </p>
            </div>
            <button
              onClick={() => navigate("/admin/adduser")}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "10px 18px", background: "#185FA5", color: "#E6F1FB",
                border: "none", borderRadius: 10, fontSize: 13, fontWeight: 500,
                cursor: "pointer", whiteSpace: "nowrap",
              }}
            >
              <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                <line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/>
              </svg>
              Add new user
            </button>
          </div>

          {error && (
            <div style={{ background: "#FCEBEB", color: "#A32D2D", padding: "12px 16px", borderRadius: 10, marginBottom: 20, fontSize: 13 }}>
              {error}
            </div>
          )}

          {/* Two-column layout */}
          <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 20, alignItems: "start" }}>

            {/* Left column */}
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

              {/* Total users */}
              <div style={{
                background: "#fff", border: "0.5px solid #E2E4E9",
                borderRadius: 12, padding: "18px 20px",
                display: "flex", alignItems: "center", justifyContent: "space-between",
              }}>
                <div>
                  <p style={{ fontSize: 11, fontWeight: 500, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 6px" }}>
                    Total active users
                  </p>
                  <h2 style={{ fontSize: 28, fontWeight: 500, color: "#1E293B", margin: 0 }}>{totalUsers}</h2>
                </div>
                <div style={{
                  width: 42, height: 42, borderRadius: "50%",
                  background: "#E6F1FB", display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <svg width="20" height="20" fill="none" stroke="#185FA5" strokeWidth="1.8" viewBox="0 0 24 24">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                  </svg>
                </div>
              </div>

              {/* Pending approvals */}
              <div style={{
                background: "#fff", border: "0.5px solid #E2E4E9",
                borderRadius: 12, padding: "18px 20px",
                display: "flex", alignItems: "center", justifyContent: "space-between",
              }}>
                <div>
                  <p style={{ fontSize: 11, fontWeight: 500, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 6px" }}>
                    Pending approvals
                  </p>
                  <h2 style={{ fontSize: 28, fontWeight: 500, color: "#1E293B", margin: 0 }}>{pendingApprovals}</h2>
                </div>
                <div style={{
                  width: 42, height: 42, borderRadius: "50%",
                  background: "#E1F5EE", display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <svg width="20" height="20" fill="none" stroke="#0F6E56" strokeWidth="1.8" viewBox="0 0 24 24">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  </svg>
                </div>
              </div>

              {/* Help card */}
              <div style={{ background: "#185FA5", borderRadius: 12, padding: 20 }}>
                <p style={{ fontSize: 10, fontWeight: 500, letterSpacing: "0.08em", opacity: 0.7, marginBottom: 6, textTransform: "uppercase", color: "#E6F1FB" }}>
                  Quick support
                </p>
                <p style={{ fontSize: 14, fontWeight: 500, marginBottom: 8, lineHeight: 1.4, color: "#E6F1FB" }}>
                  Need help managing permissions?
                </p>
                <p style={{ fontSize: 12, opacity: 0.75, marginBottom: 16, lineHeight: 1.5, color: "#E6F1FB" }}>
                  Access the documentation to understand role-based access control (RBAC) levels.
                </p>
                <button style={{
                  background: "transparent",
                  border: "1.5px solid rgba(255,255,255,0.5)",
                  color: "#E6F1FB", padding: "7px 14px",
                  borderRadius: 8, fontSize: 12, cursor: "pointer", fontWeight: 500,
                }}>
                  View guide
                </button>
              </div>
            </div>

            {/* Right column — table */}
            <div style={{ background: "#fff", border: "0.5px solid #E2E4E9", borderRadius: 12, overflow: "hidden" }}>

              {/* Toolbar */}
              <div style={{
                padding: "14px 18px", display: "flex", alignItems: "center",
                gap: 10, borderBottom: "0.5px solid #E2E4E9", flexWrap: "wrap",
              }}>
                <select
                  value={roleFilter}
                  onChange={(e) => { setRoleFilter(e.target.value); setCurrentPage(1); }}
                  style={{
                    padding: "7px 12px", border: "0.5px solid #E2E4E9",
                    borderRadius: 8, fontSize: 12, color: "#64748B",
                    background: "#fff", cursor: "pointer", outline: "none",
                  }}
                >
                  <option value="all">All roles</option>
                  <option value="doctor">Doctor</option>
                  <option value="patient">Patient</option>
                  <option value="receptionist">Receptionist</option>
                  <option value="admin">Admin</option>
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  style={{
                    padding: "7px 12px", border: "0.5px solid #E2E4E9",
                    borderRadius: 8, fontSize: 12, color: "#64748B",
                    background: "#fff", cursor: "pointer", outline: "none",
                  }}
                >
                  <option value="all">All statuses</option>
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="inactive">Inactive</option>
                </select>

                <div style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "7px 12px", border: "0.5px solid #E2E4E9",
                  borderRadius: 8, flex: 1, minWidth: 140,
                }}>
                  <svg width="13" height="13" fill="none" stroke="#9CA3AF" strokeWidth="2" viewBox="0 0 24 24">
                    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
                  </svg>
                  <input
                    type="text"
                    placeholder="Filter by name..."
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                    style={{
                      border: "none", background: "transparent", outline: "none",
                      fontSize: 12, color: "#1E293B", width: "100%",
                    }}
                  />
                </div>
              </div>

              {/* Table */}
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
                  <thead>
                    <tr style={{ background: "#F8FAFC" }}>
                      {["User ID", "Name", "Email", "Contact", "Role", "Actions"].map((h, i) => (
                        <th
                          key={h}
                          style={{
                            padding: "11px 12px", textAlign: i === 4 ? "center" : i === 5 ? "right" : "left",
                            fontSize: 11, fontWeight: 500, color: "#94A3B8",
                            textTransform: "uppercase", letterSpacing: "0.06em",
                            width: i === 0 ? "70px" : i === 1 ? "200px" : i === 2 ? "200px" : i === 3 ? "130px" : i === 4 ? "110px" : "160px",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {loading && (
                      <tr>
                        <td colSpan="5" style={{ padding: "40px 0", textAlign: "center", color: "#94A3B8", fontSize: 13 }}>
                          Loading users...
                        </td>
                      </tr>
                    )}
                    {!loading && paginated.length === 0 && (
                      <tr>
                        <td colSpan="5" style={{ padding: "40px 0", textAlign: "center", color: "#94A3B8", fontSize: 13 }}>
                          No users found
                        </td>
                      </tr>
                    )}
                    {paginated.map((user) => {
                      const av = avatarColor(user.role);
                      const badge = roleBadge(user.role);
                      return (
                        <tr
                          key={user.id}
                          style={{ borderTop: "0.5px solid #E2E4E9" }}
                          onMouseEnter={(e) => e.currentTarget.style.background = "#F8FAFC"}
                          onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                        >
                          <td style={{ padding: "12px 12px", fontSize: 12, color: "#94A3B8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            #{user.id}
                          </td>
                          <td style={{ padding: "12px 12px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <div style={{
                                width: 34, height: 34, borderRadius: "50%",
                                background: av.bg, color: av.color,
                                display: "flex", alignItems: "center", justifyContent: "center",
                                fontSize: 12, fontWeight: 500, flexShrink: 0,
                              }}>
                                {getInitials(user.name)}
                              </div>
                              <div style={{ overflow: "hidden" }}>
                                <p style={{ fontSize: 13, fontWeight: 500, color: "#1E293B", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.name}</p>
                                <p style={{ fontSize: 11, color: "#94A3B8", margin: "2px 0 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>ID #{user.id}</p>
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: "12px 12px", fontSize: 12, color: "#64748B", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            <div>{user.email}</div>
                          </td>
                          <td style={{ padding: "12px 12px", fontSize: 12, color: "#64748B", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            <div>{user.phone_number || user.phone || "N/A"}</div>
                          </td>
                          <td style={{ padding: "12px 12px", textAlign: "center" }}>
                            <span style={{
                              display: "inline-block", padding: "3px 10px",
                              borderRadius: 20, fontSize: 11, fontWeight: 500,
                              background: badge.bg, color: badge.color,
                              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "100%",
                            }}>
                              {badge.label}
                            </span>
                          </td>
                          <td style={{ padding: "10px 12px" }}>
                            <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                              <button
                                onClick={() => navigate(`/admin/editusers/${user.id}`)}
                                style={{
                                  display: "flex", alignItems: "center", gap: 4,
                                  padding: "6px 10px", background: "#E6F1FB", color: "#185FA5",
                                  border: "none", borderRadius: 8, fontSize: 12,
                                  fontWeight: 500, cursor: "pointer",
                                }}
                              >
                                <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                                </svg>
                                Edit
                              </button>
                              <button
                                onClick={() => handleDelete(user.id)}
                                style={{
                                  display: "flex", alignItems: "center", gap: 4,
                                  padding: "6px 10px", background: "#FCEBEB", color: "#A32D2D",
                                  border: "none", borderRadius: 8, fontSize: 12,
                                  fontWeight: 500, cursor: "pointer",
                                }}
                              >
                                <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                  <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                                  <path d="M10 11v6"/><path d="M14 11v6"/>
                                  <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                                </svg>
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Footer / Pagination */}
              <div style={{
                padding: "14px 18px", borderTop: "0.5px solid #E2E4E9",
                display: "flex", alignItems: "center", justifyContent: "space-between",
              }}>
                <p style={{ fontSize: 12, color: "#64748B", margin: 0 }}>
                  Showing {filtered.length === 0 ? 0 : (currentPage - 1) * perPage + 1} to{" "}
                  {Math.min(currentPage * perPage, filtered.length)} of {filtered.length} entries
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    style={{
                      width: 28, height: 28, border: "0.5px solid #E2E4E9",
                      borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center",
                      cursor: currentPage === 1 ? "not-allowed" : "pointer",
                      background: "#fff", opacity: currentPage === 1 ? 0.4 : 1,
                    }}
                  >
                    <svg width="12" height="12" fill="none" stroke="#64748B" strokeWidth="2" viewBox="0 0 24 24">
                      <polyline points="15 18 9 12 15 6"/>
                    </svg>
                  </button>

                  {pageNumbers().map((n) => (
                    <button
                      key={n}
                      onClick={() => setCurrentPage(n)}
                      style={{
                        width: 28, height: 28, border: "0.5px solid #E2E4E9",
                        borderRadius: 8, fontSize: 12, cursor: "pointer",
                        background: currentPage === n ? "#185FA5" : "#fff",
                        color: currentPage === n ? "#fff" : "#64748B",
                        fontWeight: currentPage === n ? 500 : 400,
                        borderColor: currentPage === n ? "#185FA5" : "#E2E4E9",
                      }}
                    >{n}</button>
                  ))}

                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    style={{
                      width: 28, height: 28, border: "0.5px solid #E2E4E9",
                      borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center",
                      cursor: currentPage === totalPages ? "not-allowed" : "pointer",
                      background: "#fff", opacity: currentPage === totalPages ? 0.4 : 1,
                    }}
                  >
                    <svg width="12" height="12" fill="none" stroke="#64748B" strokeWidth="2" viewBox="0 0 24 24">
                      <polyline points="9 18 15 12 9 6"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserManagement;