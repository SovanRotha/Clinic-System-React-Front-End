
import { useState } from "react";

function AddUserAsPatient() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone_number: "",
    role: "patient",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null); // { type: "success"|"error", message }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);
    const token = localStorage.getItem("token");
    fetch("https://clinic-system-back-end.onrender.com/api/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(formData),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to add user");
        return res.json();
      })
      .then(() => {
        showToast("success", "User added successfully!");
        setFormData({ name: "", email: "", password: "", phone_number: "", role: "patient" });
      })
      .catch((err) => showToast("error", err.message || "Something went wrong."))
      .finally(() => setSubmitting(false));
  };

  const handleCancel = () => {
    setFormData({ name: "", email: "", password: "", phone_number: "", role: "patient" });
  };

  const roleColors = {
    admin: { bg: "#E6F1FB", color: "#185FA5" },
    doctor: { bg: "#EAF3DE", color: "#3B6D11" },
    receptionist: { bg: "#EEEDFE", color: "#534AB7" },
    patient: { bg: "#F0F0F0", color: "#333" },
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#F4F6FA" }}>
      
      <main style={{ flex: 1, display: "flex", flexDirection: "column",   }}>
        {/* Top Bar */}
        <div style={{
          background: "#fff",
          borderBottom: "0.5px solid #E2E6EF",
          padding: "0 28px",
          height: "56px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}>
          <span style={{ fontSize: "16px", fontWeight: 600, color: "#185FA5" }}>User Management</span>
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "#B5D4F4", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: 600, color: "#0C447C" }}>AU</div>
            <span style={{ fontSize: "13px", color: "#3D4A5C", fontWeight: 500 }}>Admin User</span>
          </div>
        </div>

        <div style={{ padding: "28px", flex: 1 ,marginLeft: "250px"}}>
          {/* Breadcrumb */}
          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "16px", fontSize: "12px", color: "#8A94A6" }}>
            <span>Users</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#C4CAD4" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
            <span style={{ color: "#185FA5", fontWeight: 500 }}>Add New User</span>
          </div>

          {/* Page Title */}
          <div style={{ marginBottom: "24px" }}>
            <h1 style={{ fontSize: "22px", fontWeight: 700, color: "#1A2236", margin: 0 }}>Add New User</h1>
            <p style={{ fontSize: "13px", color: "#8A94A6", marginTop: "4px" }}>Create a new system user and assign their role.</p>
          </div>

          {/* Toast */}
          {toast && (
            <div style={{
              display: "flex", alignItems: "center", gap: "10px",
              background: toast.type === "success" ? "#EAF3DE" : "#FAECE7",
              border: `0.5px solid ${toast.type === "success" ? "#B2D98A" : "#F5B8A0"}`,
              color: toast.type === "success" ? "#3B6D11" : "#993C1D",
              borderRadius: "10px", padding: "12px 16px",
              fontSize: "13px", fontWeight: 500, marginBottom: "20px",
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
            {/* Form Card */}
            <div style={{ background: "#fff", border: "0.5px solid #E2E6EF", borderRadius: "14px", overflow: "hidden" }}>
              {/* Card Header */}
              <div style={{ padding: "20px 24px", borderBottom: "0.5px solid #F0F2F7", display: "flex", alignItems: "center", gap: "14px" }}>
                <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: "#E6F1FB", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#185FA5" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <line x1="19" y1="8" x2="19" y2="14"/>
                    <line x1="22" y1="11" x2="16" y2="11"/>
                  </svg>
                </div>
                <div>
                  <h2 style={{ fontSize: "15px", fontWeight: 600, color: "#1A2236", margin: 0 }}>User Information</h2>
                  <p style={{ fontSize: "12px", color: "#8A94A6", marginTop: "2px" }}>Fill in the details below to create a new user account.</p>
                </div>
              </div>

              {/* Form Body */}
              <div style={{ padding: "24px" }}>
                <form onSubmit={handleSubmit}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px", marginBottom: "18px" }}>
                    {/* Full Name */}
                    <div style={{ gridColumn: "1 / -1" }}>
                      <FieldLabel>Full Name</FieldLabel>
                      <div style={{ position: "relative" }}>
                        <FieldIcon>
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#8A94A6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                        </FieldIcon>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          placeholder="e.g. Dr. James Wilson"
                          required
                          style={inputStyle}
                          onFocus={e => e.target.style.borderColor = "#185FA5"}
                          onBlur={e => e.target.style.borderColor = "#D8DDE8"}
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div>
                      <FieldLabel>Email Address</FieldLabel>
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

                    {/* Password */}
                    <div>
                      <FieldLabel>Password</FieldLabel>
                      <div style={{ position: "relative" }}>
                        <FieldIcon>
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#8A94A6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                        </FieldIcon>
                        <input
                          type={showPassword ? "text" : "password"}
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
                          placeholder="Enter secure password"
                          required
                          style={{ ...inputStyle, paddingRight: "44px" }}
                          onFocus={e => e.target.style.borderColor = "#185FA5"}
                          onBlur={e => e.target.style.borderColor = "#D8DDE8"}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#8A94A6", padding: 0, display: "flex" }}
                        >
                          {showPassword ? (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                          ) : (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Role */}
                    <div>
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
                          <option value="patient">Patient</option>
                        </select>
                        <svg style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#8A94A6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
                      </div>
                    </div>
                  </div>

                  {/* Role Preview Badge */}
                  <div style={{
                    background: "#F8F9FC", border: "0.5px solid #E2E6EF",
                    borderRadius: "10px", padding: "14px 16px",
                    display: "flex", alignItems: "center", gap: "12px",
                    marginBottom: "24px",
                  }}>
                    <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: roleColors[formData.role]?.bg || "#E6F1FB", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: 600, color: roleColors[formData.role]?.color || "#185FA5" }}>
                      {formData.name ? formData.name.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase() : "?"}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: "13px", fontWeight: 600, color: "#1A2236" }}>{formData.name || "New User"}</div>
                      <div style={{ fontSize: "12px", color: "#8A94A6" }}>{formData.email || "No email entered"}</div>
                    </div>
                    <span style={{
                      background: roleColors[formData.role]?.bg || "#E6F1FB",
                      color: roleColors[formData.role]?.color || "#185FA5",
                      fontSize: "11px", fontWeight: 600, padding: "4px 12px",
                      borderRadius: "99px", textTransform: "uppercase", letterSpacing: "0.04em",
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
                        fontSize: "13px", fontWeight: 600, cursor: submitting ? "not-allowed" : "pointer",
                        fontFamily: "inherit", transition: "background 0.15s",
                      }}
                    >
                      {submitting ? (
                        <>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ animation: "spin 1s linear infinite" }}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                          Adding...
                        </>
                      ) : (
                        <>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>
                          Add User
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={handleCancel}
                      style={{
                        display: "inline-flex", alignItems: "center", gap: "8px",
                        background: "transparent", color: "#3D4A5C",
                        border: "0.5px solid #D8DDE8", borderRadius: "9px",
                        padding: "10px 22px", fontSize: "13px", fontWeight: 500,
                        cursor: "pointer", fontFamily: "inherit", transition: "background 0.15s",
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

/* ── Small helpers ── */
function FieldLabel({ children }) {
  return (
    <label style={{ display: "block", marginBottom: "6px", fontSize: "13px", fontWeight: 600, color: "#3D4A5C" }}>
      {children}
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

export default AddUserAsPatient;