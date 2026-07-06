import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const SPECIALIZATIONS = [
  "Cardiology", "Neurology", "Orthopedics", "Pediatrics",
  "Dermatology", "Oncology", "Radiology", "Psychiatry",
  "General Practitioner", "Gynecology", "Ophthalmology", "ENT",
  "Urology", "Endocrinology", "Gastroenterology", "Other",
];

const WORKING_DAYS = [
  "Monday – Friday",
  "Monday – Saturday",
  "Saturday – Sunday",
  "Monday, Wednesday, Friday",
  "Tuesday, Thursday",
  "Every Day",
];

function Field({ label, required, hint, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>
        {label}{required && <span style={{ color: "#EF4444", marginLeft: 3 }}>*</span>}
      </label>
      {children}
      {hint && <span style={{ fontSize: 12, color: "#9CA3AF" }}>{hint}</span>}
    </div>
  );
}

function SectionCard({ icon, title, subtitle, children }) {
  return (
    <div style={{ background: "#fff", borderRadius: 16, border: "0.5px solid #E5E7EB", marginBottom: 18, overflow: "hidden" }}>
      <div style={{ padding: "18px 24px", borderBottom: "1px solid #F3F4F6", display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ background: "#EFF6FF", borderRadius: 8, padding: 9, flexShrink: 0 }}>{icon}</div>
        <div>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: "#1a1a2e", margin: 0 }}>{title}</h2>
          <p style={{ fontSize: 13, color: "#6B7280", margin: 0 }}>{subtitle}</p>
        </div>
      </div>
      <div style={{ padding: "22px 24px" }}>{children}</div>
    </div>
  );
}

function AddDoctor() {
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [userError, setUserError] = useState(null);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [focused, setFocused] = useState("");

  const [doctor, setDoctor] = useState({
    user_id: "",
    doctor_code: "",
    specialization: "",
    working_day: "",
    start_time: "",
    end_time: "",
    status: "working",
  });

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No authentication token found. Please login first.");
        const response = await fetch("https://clinic-system-back-end.onrender.com/api/doctor-users", {
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        setUsers(Array.isArray(data) ? data : []);
      } catch (error) {
        setUserError(error instanceof Error ? error.message : "Failed to load users");
        setUsers([]);
      } finally {
        setLoadingUsers(false);
      }
    };
    fetchUsers();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDoctor((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(""); setSuccessMsg("");
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found. Please login first.");
      const response = await fetch("https://clinic-system-back-end.onrender.com/api/doctor", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(doctor),
      });
      let data;
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        const text = await response.text();
        data = { message: text || "No response from server" };
      }
      if (!response.ok) throw new Error(data.message || data.error || "Failed to create doctor");
      setSuccessMsg("Doctor profile created successfully!");
      setTimeout(() => navigate("/admin/doctors"), 900);
    } catch (error) {
      setErrorMsg(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const inp = (name) => ({
    width: "100%",
    border: `1px solid ${focused === name ? "#2563eb" : "#E5E7EB"}`,
    borderRadius: 10,
    padding: "12px 14px",
    fontSize: 15,
    color: "#1F2937",
    background: "#FAFAFA",
    outline: "none",
    boxSizing: "border-box",
    boxShadow: focused === name ? "0 0 0 3px #DBEAFE" : "none",
    transition: "border-color 0.15s, box-shadow 0.15s",
  });

  const STATUS_OPTIONS = [
    { value: "working",  label: "Working",   dot: "#16A34A" },
    { value: "leave",    label: "On Leave",  dot: "#D97706" },
    { value: "inactive", label: "Inactive",  dot: "#DC2626" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#EEF2FB", fontFamily: "'Inter','Segoe UI',sans-serif" }}>
      {/* Top nav */}
      <div style={{
        background: "#fff", borderBottom: "0.5px solid #E5E7EB",
        padding: "0 28px", height: 52, display: "flex",
        alignItems: "center", justifyContent: "space-between",
        position: "sticky", top: 0, zIndex: 10,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button
            onClick={() => navigate(-1)}
            style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, color: "#6B7280", fontSize: 14 }}
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6"/></svg>
            Back
          </button>
          <span style={{ color: "#D1D5DB" }}>|</span>
          <span style={{ fontSize: 13, color: "#6B7280" }}>
            Dashboard &nbsp;›&nbsp;
            <span
              style={{ color: "#2563eb", cursor: "pointer" }}
              onClick={() => navigate("/admin/doctors")}
            >Doctors</span>
            &nbsp;›&nbsp; Add Doctor
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <svg width="20" height="20" fill="none" stroke="#6B7280" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"/></svg>
          <div style={{ width: 34, height: 34, borderRadius: "50%", background: "#DBEAFE", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "#1D4ED8" }}>ES</div>
        </div>
      </div>

      <div style={{ maxWidth: 860, margin: "0 auto", padding: "32px 24px" }}>
        {/* Page header */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 25, fontWeight: 700, color: "#1a1a2e", margin: 0 }}>Add Doctor</h1>
          <p style={{ fontSize: 14, color: "#6B7280", marginTop: 5 }}>
            Create a doctor profile and assign it to an existing system user.
          </p>
        </div>

        {/* Alerts */}
        {successMsg && (
          <div style={{ background: "#ECFDF5", border: "1px solid #A7F3D0", color: "#065F46", padding: "14px 18px", borderRadius: 10, fontSize: 15, marginBottom: 20, display: "flex", alignItems: "center", gap: 10 }}>
            <svg width="18" height="18" fill="none" stroke="#059669" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"/></svg>
            {successMsg}
          </div>
        )}
        {errorMsg && (
          <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", color: "#DC2626", padding: "14px 18px", borderRadius: 10, fontSize: 15, marginBottom: 20, display: "flex", alignItems: "center", gap: 10 }}>
            <svg width="18" height="18" fill="none" stroke="#DC2626" strokeWidth="2.5" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Section 1: User Assignment */}
          <SectionCard
            icon={<svg width="18" height="18" fill="none" stroke="#2563eb" strokeWidth="2" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>}
            title="User Assignment"
            subtitle="Link this doctor profile to an existing system user"
          >
            {userError && (
              <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", color: "#DC2626", padding: "10px 14px", borderRadius: 8, fontSize: 13, marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
                <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>
                {userError}
              </div>
            )}
            <Field label="Select Doctor User" required hint="Only users with the doctor role are shown">
              {loadingUsers ? (
                <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 14px", background: "#F9FAFB", borderRadius: 10, border: "1px solid #E5E7EB", color: "#9CA3AF", fontSize: 14 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: "spin 1s linear infinite" }}>
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                  </svg>
                  Loading available users...
                </div>
              ) : (
                <select
                  name="user_id"
                  value={doctor.user_id}
                  onChange={handleChange}
                  onFocus={() => setFocused("user_id")}
                  onBlur={() => setFocused("")}
                  required
                  style={inp("user_id")}
                >
                  <option value="">{users.length === 0 ? "No users available" : "— Select a doctor user —"}</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                  ))}
                </select>
              )}
            </Field>
          </SectionCard>

          {/* Section 2: Doctor Information */}
          <SectionCard
            icon={<svg width="18" height="18" fill="none" stroke="#2563eb" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 2a5 5 0 015 5v2a5 5 0 01-10 0V7a5 5 0 015-5zM4 20c0-4 3.582-7 8-7s8 3 8 7"/></svg>}
            title="Doctor Information"
            subtitle="Doctor code and area of specialization"
          >
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
              <Field label="Doctor Code" required hint="e.g. DOC-001">
                <input
                  type="text"
                  name="doctor_code"
                  value={doctor.doctor_code}
                  onChange={handleChange}
                  onFocus={() => setFocused("doctor_code")}
                  onBlur={() => setFocused("")}
                  required
                  placeholder="DOC-001"
                  style={inp("doctor_code")}
                />
              </Field>

              <Field label="Specialization" hint="e.g. Cardiology, Neurology">
                <select
                  name="specialization"
                  value={doctor.specialization}
                  onChange={handleChange}
                  onFocus={() => setFocused("specialization")}
                  onBlur={() => setFocused("")}
                  style={inp("specialization")}
                >
                  <option value="">— Select Specialization —</option>
                  {SPECIALIZATIONS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </Field>
            </div>
          </SectionCard>

          {/* Section 3: Schedule */}
          <SectionCard
            icon={<svg width="18" height="18" fill="none" stroke="#2563eb" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01"/></svg>}
            title="Schedule & Availability"
            subtitle="Set the doctor's working days and consultation hours"
          >
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 18 }}>
              <Field label="Working Days" required>
                <select
                  name="working_day"
                  value={doctor.working_day}
                  onChange={handleChange}
                  onFocus={() => setFocused("working_day")}
                  onBlur={() => setFocused("")}
                  required
                  style={inp("working_day")}
                >
                  <option value="">— Select Days —</option>
                  {WORKING_DAYS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </Field>

              <Field label="Start Time" required>
                <div style={{ position: "relative" }}>
                  <input
                    type="time"
                    name="start_time"
                    value={doctor.start_time}
                    onChange={handleChange}
                    onFocus={() => setFocused("start_time")}
                    onBlur={() => setFocused("")}
                    required
                    style={inp("start_time")}
                  />
                </div>
              </Field>

              <Field label="End Time" required>
                <input
                  type="time"
                  name="end_time"
                  value={doctor.end_time}
                  onChange={handleChange}
                  onFocus={() => setFocused("end_time")}
                  onBlur={() => setFocused("")}
                  required
                  style={inp("end_time")}
                />
              </Field>
            </div>

            {/* Time preview */}
            {doctor.start_time && doctor.end_time && (
              <div style={{ marginTop: 14, background: "#EFF6FF", border: "1px solid #BFDBFE", borderRadius: 8, padding: "10px 16px", display: "flex", alignItems: "center", gap: 8 }}>
                <svg width="15" height="15" fill="none" stroke="#2563eb" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                <span style={{ fontSize: 13, color: "#1E40AF" }}>
                  Consultation hours: <strong>{doctor.start_time}</strong> – <strong>{doctor.end_time}</strong>
                  {doctor.working_day && <> &nbsp;·&nbsp; {doctor.working_day}</>}
                </span>
              </div>
            )}
          </SectionCard>

          {/* Section 4: Status */}
          <SectionCard
            icon={<svg width="18" height="18" fill="none" stroke="#2563eb" strokeWidth="2" viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><path d="M22 4L12 14.01l-3-3"/></svg>}
            title="Employment Status"
            subtitle="Current working status of this doctor"
          >
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
              {STATUS_OPTIONS.map((opt) => (
                <label
                  key={opt.value}
                  style={{
                    display: "flex", alignItems: "center", gap: 12,
                    padding: "14px 16px", borderRadius: 10, cursor: "pointer",
                    border: `2px solid ${doctor.status === opt.value ? "#2563eb" : "#E5E7EB"}`,
                    background: doctor.status === opt.value ? "#EFF6FF" : "#FAFAFA",
                    transition: "all 0.15s",
                  }}
                >
                  <input
                    type="radio"
                    name="status"
                    value={opt.value}
                    checked={doctor.status === opt.value}
                    onChange={handleChange}
                    style={{ display: "none" }}
                  />
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: opt.dot, flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: doctor.status === opt.value ? "#1D4ED8" : "#1F2937" }}>
                      {opt.label}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </SectionCard>

          {/* Action buttons */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 12, marginTop: 4 }}>
            <button
              type="button"
              onClick={() => navigate("/admin/doctors")}
              style={{
                background: "#fff", border: "1px solid #D1D5DB", color: "#374151",
                padding: "12px 24px", borderRadius: 10, fontSize: 15, fontWeight: 500, cursor: "pointer",
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || loadingUsers || users.length === 0}
              style={{
                background: loading || loadingUsers || users.length === 0 ? "#93C5FD" : "#2563eb",
                color: "#fff", border: "none",
                padding: "12px 32px", borderRadius: 10, fontSize: 15, fontWeight: 700,
                cursor: loading || loadingUsers || users.length === 0 ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", gap: 8, transition: "background 0.15s",
              }}
            >
              {loading ? (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation: "spin 1s linear infinite" }}>
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                  </svg>
                  Creating...
                </>
              ) : (
                <>
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"/></svg>
                  Create Doctor
                </>
              )}
            </button>
          </div>
        </form>

        {/* Info tip */}
        <div style={{ marginTop: 24, background: "#EFF6FF", border: "1px solid #BFDBFE", borderRadius: 12, padding: "14px 18px", display: "flex", alignItems: "flex-start", gap: 12 }}>
          <svg width="18" height="18" fill="none" stroke="#2563eb" strokeWidth="2" viewBox="0 0 24 24" style={{ flexShrink: 0, marginTop: 1 }}>
            <circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>
          </svg>
          <p style={{ fontSize: 13, color: "#1E40AF", margin: 0, lineHeight: 1.6 }}>
            <strong>Note:</strong> Only users already registered with the <em>doctor</em> role will appear in the dropdown. If no users are listed, ask the administrator to create a doctor user account first.
          </p>
        </div>

        <div style={{ textAlign: "center", fontSize: 13, color: "#9CA3AF", marginTop: 28, paddingBottom: 12 }}>
          © 2024 MediFlow Clinic Management Systems. All rights reserved.
        </div>
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default AddDoctor;