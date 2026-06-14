import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const inputStyle = {
  width: "100%",
  border: "1px solid #E5E7EB",
  borderRadius: 10,
  padding: "12px 14px",
  fontSize: 15,
  color: "#1F2937",
  background: "#FAFAFA",
  outline: "none",
  boxSizing: "border-box",
  transition: "border-color 0.15s",
};

const labelStyle = {
  fontSize: 13,
  fontWeight: 600,
  color: "#374151",
  marginBottom: 6,
  display: "block",
};

function Field({ label, required, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <label style={labelStyle}>
        {label} {required && <span style={{ color: "#EF4444" }}>*</span>}
      </label>
      {children}
    </div>
  );
}

function AddPatient() {
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [patient, setPatient] = useState({
    patient_code: "",
    address: "",
    gender: "",
    date_of_birth: "",
    blood_group: "",
  });
  const [loading, setLoading] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [focusedField, setFocusedField] = useState("");

  useEffect(() => {
    setLoadingUsers(true);
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Authentication required to load patient users.");
      setLoadingUsers(false);
      return;
    }
    fetch("http://127.0.0.1:8000/api/users?role=patient", {
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
    })
      .then((res) => { if (!res.ok) throw new Error("Unauthorized"); return res.json(); })
      .then((data) => setUsers(Array.isArray(data.user) ? data.user : []))
      .catch(() => setError("Failed to load users"))
      .finally(() => setLoadingUsers(false));
  }, []);

  const handleChange = (e) =>
    setPatient({ ...patient, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setMessage("");
    if (!selectedUser) { setError("Please select a patient user"); return; }
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://127.0.0.1:8000/api/patients", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          user_id: selectedUser,
          patient_code: patient.patient_code,
          address: patient.address,
          gender: patient.gender,
          date_of_birth: patient.date_of_birth,
          blood_group: patient.blood_group,
        }),
      });
      const data = await res.json().catch(async () => {
        const text = await res.text();
        return { message: text || "Unknown error" };
      });
      if (res.ok) {
        setMessage("Patient created successfully!");
        setSelectedUser("");
        setPatient({ patient_code: "", address: "", gender: "", date_of_birth: "", blood_group: "" });
        setTimeout(() => navigate("/receptionist/patients"), 800);
      } else {
        setError(data.message || "Failed to create patient");
      }
    } catch (err) {
      console.error(err);
      setError("Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const focused = (name) => ({
    ...inputStyle,
    borderColor: focusedField === name ? "#2563eb" : "#E5E7EB",
    boxShadow: focusedField === name ? "0 0 0 3px #DBEAFE" : "none",
  });

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
            onClick={() => navigate("/receptionist/patients")}
            style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, color: "#6B7280", fontSize: 14 }}
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6"/></svg>
            Back
          </button>
          <span style={{ color: "#D1D5DB" }}>|</span>
          <span style={{ fontSize: 13, color: "#6B7280" }}>
            Dashboard &nbsp;›&nbsp; <span style={{ color: "#2563eb" }}>Patients</span> &nbsp;›&nbsp; Add Patient
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
          <h1 style={{ fontSize: 25, fontWeight: 700, color: "#1a1a2e", margin: 0 }}>Create Patient Profile</h1>
          <p style={{ fontSize: 14, color: "#6B7280", marginTop: 5 }}>
            Fill in the details below to register a new patient in the system.
          </p>
        </div>

        {/* Alerts */}
        {message && (
          <div style={{
            background: "#ECFDF5", border: "1px solid #A7F3D0", color: "#065F46",
            padding: "14px 18px", borderRadius: 10, fontSize: 15, marginBottom: 20,
            display: "flex", alignItems: "center", gap: 10,
          }}>
            <svg width="18" height="18" fill="none" stroke="#059669" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"/></svg>
            {message}
          </div>
        )}
        {error && (
          <div style={{
            background: "#FEF2F2", border: "1px solid #FECACA", color: "#DC2626",
            padding: "14px 18px", borderRadius: 10, fontSize: 15, marginBottom: 20,
            display: "flex", alignItems: "center", gap: 10,
          }}>
            <svg width="18" height="18" fill="none" stroke="#DC2626" strokeWidth="2.5" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>
            {error}
          </div>
        )}

        {/* Form card */}
        <form onSubmit={handleSubmit}>
          {/* Section: User Assignment */}
          <div style={{ background: "#fff", borderRadius: 16, border: "0.5px solid #E5E7EB", marginBottom: 18, overflow: "hidden" }}>
            <div style={{ padding: "18px 24px", borderBottom: "1px solid #F3F4F6", display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ background: "#EFF6FF", borderRadius: 8, padding: 8 }}>
                <svg width="18" height="18" fill="none" stroke="#2563eb" strokeWidth="2" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              </div>
              <div>
                <h2 style={{ fontSize: 16, fontWeight: 700, color: "#1a1a2e", margin: 0 }}>User Assignment</h2>
                <p style={{ fontSize: 13, color: "#6B7280", margin: 0 }}>Link this profile to an existing system user</p>
              </div>
            </div>
            <div style={{ padding: "22px 24px" }}>
              <Field label="Select Patient User" required>
                <select
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                  onFocus={() => setFocusedField("user")}
                  onBlur={() => setFocusedField("")}
                  required
                  style={focused("user")}
                >
                  <option value="">
                    {loadingUsers ? "Loading users..." : "— Select a patient user —"}
                  </option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                  ))}
                </select>
              </Field>
            </div>
          </div>

          {/* Section: Patient Details */}
          <div style={{ background: "#fff", borderRadius: 16, border: "0.5px solid #E5E7EB", marginBottom: 18, overflow: "hidden" }}>
            <div style={{ padding: "18px 24px", borderBottom: "1px solid #F3F4F6", display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ background: "#EFF6FF", borderRadius: 8, padding: 8 }}>
                <svg width="18" height="18" fill="none" stroke="#2563eb" strokeWidth="2" viewBox="0 0 24 24"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M8 2v4M16 2v4M2 10h20"/></svg>
              </div>
              <div>
                <h2 style={{ fontSize: 16, fontWeight: 700, color: "#1a1a2e", margin: 0 }}>Patient Details</h2>
                <p style={{ fontSize: 13, color: "#6B7280", margin: 0 }}>Basic identification and personal information</p>
              </div>
            </div>
            <div style={{ padding: "22px 24px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
              <Field label="Patient Code" required>
                <input
                  type="text"
                  name="patient_code"
                  placeholder="e.g. P-1001"
                  value={patient.patient_code}
                  onChange={handleChange}
                  onFocus={() => setFocusedField("patient_code")}
                  onBlur={() => setFocusedField("")}
                  required
                  style={focused("patient_code")}
                />
              </Field>

              <Field label="Date of Birth" required>
                <input
                  type="date"
                  name="date_of_birth"
                  value={patient.date_of_birth}
                  onChange={handleChange}
                  onFocus={() => setFocusedField("dob")}
                  onBlur={() => setFocusedField("")}
                  required
                  style={focused("dob")}
                />
              </Field>

              <Field label="Gender" required>
                <select
                  name="gender"
                  value={patient.gender}
                  onChange={handleChange}
                  onFocus={() => setFocusedField("gender")}
                  onBlur={() => setFocusedField("")}
                  required
                  style={focused("gender")}
                >
                  <option value="">— Select Gender —</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </Field>

              <Field label="Blood Group" required>
                <select
                  name="blood_group"
                  value={patient.blood_group}
                  onChange={handleChange}
                  onFocus={() => setFocusedField("blood_group")}
                  onBlur={() => setFocusedField("")}
                  required
                  style={focused("blood_group")}
                >
                  <option value="">— Select Blood Group —</option>
                  {["A+","A-","B+","B-","AB+","AB-","O+","O-"].map((bg) => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </select>
              </Field>
            </div>
          </div>

          {/* Section: Address */}
          <div style={{ background: "#fff", borderRadius: 16, border: "0.5px solid #E5E7EB", marginBottom: 24, overflow: "hidden" }}>
            <div style={{ padding: "18px 24px", borderBottom: "1px solid #F3F4F6", display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ background: "#EFF6FF", borderRadius: 8, padding: 8 }}>
                <svg width="18" height="18" fill="none" stroke="#2563eb" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
              </div>
              <div>
                <h2 style={{ fontSize: 16, fontWeight: 700, color: "#1a1a2e", margin: 0 }}>Address</h2>
                <p style={{ fontSize: 13, color: "#6B7280", margin: 0 }}>Patient's residential address</p>
              </div>
            </div>
            <div style={{ padding: "22px 24px" }}>
              <Field label="Full Address" required>
                <input
                  type="text"
                  name="address"
                  placeholder="Street, City, Province / Country"
                  value={patient.address}
                  onChange={handleChange}
                  onFocus={() => setFocusedField("address")}
                  onBlur={() => setFocusedField("")}
                  required
                  style={focused("address")}
                />
              </Field>
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 12 }}>
            <button
              type="button"
              onClick={() => navigate("/receptionist/patients")}
              style={{
                background: "#fff", border: "1px solid #D1D5DB", color: "#374151",
                padding: "12px 24px", borderRadius: 10, fontSize: 15, fontWeight: 500,
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || loadingUsers}
              style={{
                background: loading ? "#93C5FD" : "#2563eb",
                color: "#fff", border: "none",
                padding: "12px 32px", borderRadius: 10, fontSize: 15, fontWeight: 700,
                cursor: loading || loadingUsers ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", gap: 8,
                transition: "background 0.15s",
              }}
            >
              {loading ? (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation: "spin 1s linear infinite" }}>
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                  </svg>
                  Saving...
                </>
              ) : (
                <>
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"/></svg>
                  Create Patient
                </>
              )}
            </button>
          </div>
        </form>

        {/* Info tip */}
        <div style={{
          marginTop: 24, background: "#EFF6FF", border: "1px solid #BFDBFE",
          borderRadius: 12, padding: "14px 18px",
          display: "flex", alignItems: "flex-start", gap: 12,
        }}>
          <svg width="18" height="18" fill="none" stroke="#2563eb" strokeWidth="2" viewBox="0 0 24 24" style={{ flexShrink: 0, marginTop: 1 }}>
            <circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>
          </svg>
          <p style={{ fontSize: 13, color: "#1E40AF", margin: 0, lineHeight: 1.6 }}>
            <strong>Note:</strong> The user must already be registered in the system with the <em>patient</em> role before they can be linked to a patient profile. If the user doesn't appear in the dropdown, ask them to register first.
          </p>
        </div>
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default AddPatient;