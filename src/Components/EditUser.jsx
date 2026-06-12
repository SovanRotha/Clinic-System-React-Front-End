import AdminSidebar from "../Admin/AdminSidebar";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

const roleColors = {
  admin: { bg: "#E6F1FB", color: "#185FA5" },
  doctor: { bg: "#EAF3DE", color: "#3B6D11" },
  receptionist: { bg: "#EEEDFE", color: "#534AB7" },
  patient: { bg: "#FAEEDA", color: "#854F0B" },
};

function FieldLabel({ children, required }) {
  return (
    <label style={{ display: "block", marginBottom: "6px", fontSize: "13px", fontWeight: 600, color: "#3D4A5C" }}>
      {children} {required && <span style={{ color: "#E24B4A" }}>*</span>}
    </label>
  );
}

function FieldIcon({ children }) {
  return (
    <span style={{ position: "absolute", left: "13px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none", display: "flex" }}>
      {children}
    </span>
  );
}

const inputStyle = {
  width: "100%",
  border: "0.5px solid #D8DDE8",
  borderRadius: "9px",
  padding: "10px 14px 10px 38px",
  fontSize: "13px",
  color: "#1A2236",
  background: "#FAFBFC",
  outline: "none",
  fontFamily: "inherit",
  transition: "border-color 0.15s",
  boxSizing: "border-box",
};

function EditUser() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);
  const [originalName, setOriginalName] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone_number: "",
    role: "admin",
  });

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { showToast("error", "Missing authentication token."); return; }

    fetch(`http://127.0.0.1:8000/api/users/${id}`, {
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
    })
      .then((res) => res.json())
      .then((data) => {
        const user = data.user || data;
        const loaded = {
          name: user.name || "",
          email: user.email || "",
          phone_number: user.phone_number || user.phone || "",
          role: user.role || "admin",
        };
        setFormData(loaded);
        setOriginalName(user.name || "");
      })
      .catch(() => showToast("error", "Unable to load user."))
      .finally(() => setLoading(false));
  }, [id]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/users/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        body: JSON.stringify({ ...formData, phone: formData.phone_number }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update user");
      showToast("success", "User updated successfully!");
      setTimeout(() => navigate("/admin/users"), 1200);
    } catch (err) {
      showToast("error", err.message || "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  const rc = roleColors[formData.role] || roleColors.admin;
  const initials = formData.name
    ? formData.name.split(" ").filter(Boolean).slice(0, 2).map((n) => n[0].toUpperCase()).join("")
    : "?";

  /* ── Loading skeleton ── */
  if (loading) {
    return (
      <div style={{ display: "flex", minHeight: "100vh", background: "#F4F6FA" }}>
        <AdminSidebar />
        <main style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          <div style={{ background: "#fff", borderBottom: "0.5px solid #E2E6EF", height: "56px", display: "flex", alignItems: "center", padding: "0 28px" }}>
            <span style={{ fontSize: "16px", fontWeight: 600, color: "#185FA5" }}>User Management</span>
          </div>
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "14px", color: "#8A94A6" }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#185FA5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: "spin 1s linear infinite" }}>
                <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
              </svg>
              <span style={{ fontSize: "13px" }}>Loading user data...</span>
            </div>
          </div>
        </main>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#F4F6FA" }}>
      <AdminSidebar />

      <main style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {/* Top Bar */}
        <div style={{
          background: "#fff", borderBottom: "0.5px solid #E2E6EF",
          padding: "0 28px", height: "56px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          position: "sticky", top: 0, zIndex: 10,
        }}>
          <span style={{ fontSize: "16px", fontWeight: 600, color: "#185FA5" }}>User Management</span>
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "#B5D4F4", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: 600, color: "#0C447C" }}>AU</div>
            <span style={{ fontSize: "13px", color: "#3D4A5C", fontWeight: 500 }}>Admin User</span>
          </div>
        </div>

        <div style={{ padding: "28px", flex: 1, marginLeft: "250px" }}>
          {/* Breadcrumb */}
          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "16px", fontSize: "12px", color: "#8A94A6" }}>
            <span
              onClick={() => navigate("/admin/users")}
              style={{ cursor: "pointer", color: "#185FA5", fontWeight: 500 }}
            >
              Users
            </span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#C4CAD4" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
            <span>Edit User</span>
            {originalName && (
              <>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#C4CAD4" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                <span style={{ color: "#1A2236", fontWeight: 500 }}>{originalName}</span>
              </>
            )}
          </div>

          {/* Page Title */}
          <div style={{ marginBottom: "24px", display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
            <div>
              <h1 style={{ fontSize: "22px", fontWeight: 700, color: "#1A2236", margin: 0 }}>Edit User</h1>
              <p style={{ fontSize: "13px", color: "#8A94A6", marginTop: "4px" }}>Update account information for this user.</p>
            </div>
            <button
              onClick={() => navigate("/admin/users")}
              style={{
                display: "inline-flex", alignItems: "center", gap: "6px",
                background: "transparent", border: "0.5px solid #D8DDE8",
                borderRadius: "8px", padding: "7px 14px",
                fontSize: "13px", color: "#3D4A5C", cursor: "pointer",
                fontFamily: "inherit",
              }}
              onMouseEnter={e => e.currentTarget.style.background = "#F4F6FA"}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
              Back to Users
            </button>
          </div>

          {/* Toast */}
          {toast && (
            <div style={{
              display: "flex", alignItems: "center", gap: "10px",
              background: toast.type === "success" ? "#EAF3DE" : "#FAECE7",
              border: `0.5px solid ${toast.type === "success" ? "#B2D98A" : "#F5B8A0"}`,
              color: toast.type === "success" ? "#3B6D11" : "#993C1D",
              borderRadius: "10px", padding: "12px 16px",
              fontSize: "13px", fontWeight: 500, marginBottom: "20px", maxWidth: "680px",
            }}>
              {toast.type === "success" ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              )}
              {toast.message}
            </div>
          )}

          <div style={{ maxWidth: "680px" }}>
            <div style={{ background: "#fff", border: "0.5px solid #E2E6EF", borderRadius: "14px", overflow: "hidden" }}>

              {/* Card Header */}
              <div style={{ padding: "20px 24px", borderBottom: "0.5px solid #F0F2F7", display: "flex", alignItems: "center", gap: "14px" }}>
                <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: "#FAEEDA", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#854F0B" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                </div>
                <div>
                  <h2 style={{ fontSize: "15px", fontWeight: 600, color: "#1A2236", margin: 0 }}>Edit User Information</h2>
                  <p style={{ fontSize: "12px", color: "#8A94A6", marginTop: "2px" }}>
                    Editing account for{" "}
                    <span style={{ fontWeight: 600, color: "#1A2236" }}>{originalName || `User #${id}`}</span>
                  </p>
                </div>

                {/* User ID chip */}
                <div style={{ marginLeft: "auto", background: "#F4F6FA", border: "0.5px solid #E2E6EF", borderRadius: "99px", padding: "4px 12px", fontSize: "11px", color: "#8A94A6", fontFamily: "monospace", whiteSpace: "nowrap" }}>
                  ID #{id}
                </div>
              </div>

              {/* Form */}
              <div style={{ padding: "24px" }}>
                <form onSubmit={handleSubmit}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px", marginBottom: "18px" }}>

                    {/* Full Name — full width */}
                    <div style={{ gridColumn: "1 / -1" }}>
                      <FieldLabel required>Full Name</FieldLabel>
                      <div style={{ position: "relative" }}>
                        <FieldIcon>
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#8A94A6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                        </FieldIcon>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          placeholder="Full name"
                          required
                          style={inputStyle}
                          onFocus={e => e.target.style.borderColor = "#185FA5"}
                          onBlur={e => e.target.style.borderColor = "#D8DDE8"}
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div>
                      <FieldLabel required>Email Address</FieldLabel>
                      <div style={{ position: "relative" }}>
                        <FieldIcon>
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#8A94A6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                        </FieldIcon>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="example@mediflow.com"
                          required
                          style={inputStyle}
                          onFocus={e => e.target.style.borderColor = "#185FA5"}
                          onBlur={e => e.target.style.borderColor = "#D8DDE8"}
                        />
                      </div>
                    </div>

                    {/* Phone */}
                    <div>
                      <FieldLabel>Phone Number</FieldLabel>
                      <div style={{ position: "relative" }}>
                        <FieldIcon>
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#8A94A6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.27h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9a16 16 0 0 0 6.91 6.91l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 23 16.92z"/></svg>
                        </FieldIcon>
                        <input
                          type="text"
                          name="phone_number"
                          value={formData.phone_number}
                          onChange={handleChange}
                          placeholder="+1 (555) 000-0000"
                          style={inputStyle}
                          onFocus={e => e.target.style.borderColor = "#185FA5"}
                          onBlur={e => e.target.style.borderColor = "#D8DDE8"}
                        />
                      </div>
                    </div>

                    {/* Role */}
                    <div style={{ gridColumn: "1 / -1" }}>
                      <FieldLabel>Role</FieldLabel>
                      <div style={{ position: "relative" }}>
                        <FieldIcon>
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#8A94A6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                        </FieldIcon>
                        <select
                          name="role"
                          value={formData.role}
                          onChange={handleChange}
                          style={{ ...inputStyle, paddingRight: "36px", appearance: "none", cursor: "pointer" }}
                          onFocus={e => e.target.style.borderColor = "#185FA5"}
                          onBlur={e => e.target.style.borderColor = "#D8DDE8"}
                        >
                          <option value="admin">Admin</option>
                          <option value="doctor">Doctor</option>
                          <option value="patient">Patient</option>
                          <option value="receptionist">Receptionist</option>
                        </select>
                        <svg style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#8A94A6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
                      </div>
                    </div>
                  </div>

                  {/* Live Preview Card */}
                  <div style={{
                    background: "#F8F9FC", border: "0.5px solid #E2E6EF",
                    borderRadius: "10px", padding: "14px 16px",
                    display: "flex", alignItems: "center", gap: "12px",
                    marginBottom: "24px",
                  }}>
                    <div style={{
                      width: "38px", height: "38px", borderRadius: "50%",
                      background: rc.bg, color: rc.color,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "13px", fontWeight: 700, flexShrink: 0,
                    }}>
                      {initials}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: "13px", fontWeight: 600, color: "#1A2236", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {formData.name || "—"}
                      </div>
                      <div style={{ fontSize: "12px", color: "#8A94A6", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {formData.email || "No email"}
                      </div>
                    </div>
                    {formData.phone_number && (
                      <div style={{ fontSize: "12px", color: "#8A94A6", whiteSpace: "nowrap", marginRight: "8px" }}>
                        {formData.phone_number}
                      </div>
                    )}
                    <span style={{
                      background: rc.bg, color: rc.color,
                      fontSize: "11px", fontWeight: 600,
                      padding: "4px 12px", borderRadius: "99px",
                      textTransform: "uppercase", letterSpacing: "0.04em", whiteSpace: "nowrap",
                    }}>
                      {formData.role}
                    </span>
                  </div>

                  {/* Divider */}
                  <div style={{ borderTop: "0.5px solid #F0F2F7", marginBottom: "20px" }} />

                  {/* Actions */}
                  <div style={{ display: "flex", gap: "10px" }}>
                    <button
                      type="submit"
                      disabled={submitting}
                      style={{
                        display: "inline-flex", alignItems: "center", gap: "8px",
                        background: submitting ? "#7AAFD4" : "#185FA5",
                        color: "#fff", border: "none",
                        borderRadius: "9px", padding: "10px 22px",
                        fontSize: "13px", fontWeight: 600,
                        cursor: submitting ? "not-allowed" : "pointer",
                        fontFamily: "inherit",
                      }}
                    >
                      {submitting ? (
                        <>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ animation: "spin 1s linear infinite" }}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                          Saving...
                        </>
                      ) : (
                        <>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
                          Save Changes
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => navigate("/admin/users")}
                      style={{
                        display: "inline-flex", alignItems: "center", gap: "8px",
                        background: "transparent", color: "#3D4A5C",
                        border: "0.5px solid #D8DDE8", borderRadius: "9px",
                        padding: "10px 22px", fontSize: "13px", fontWeight: 500,
                        cursor: "pointer", fontFamily: "inherit",
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = "#F4F6FA"}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </main>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default EditUser;