import AdminSidebar from "./AdminSidebar";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AVATAR_COLORS = [
  { bg: "#E6F1FB", color: "#185FA5" },
  { bg: "#EAF3DE", color: "#3B6D11" },
  { bg: "#EEEDFE", color: "#534AB7" },
  { bg: "#FAECE7", color: "#993C1D" },
  { bg: "#FAEEDA", color: "#854F0B" },
  { bg: "#FBEAF0", color: "#993556" },
  { bg: "#E1F5EE", color: "#0F6E56" },
];

const BLOOD_COLORS = {
  "A+":  { bg: "#FAECE7", color: "#993C1D" },
  "A-":  { bg: "#FAEEDA", color: "#854F0B" },
  "B+":  { bg: "#E6F1FB", color: "#185FA5" },
  "B-":  { bg: "#EEEDFE", color: "#534AB7" },
  "AB+": { bg: "#FBEAF0", color: "#993556" },
  "AB-": { bg: "#EAF3DE", color: "#3B6D11" },
  "O+":  { bg: "#E1F5EE", color: "#0F6E56" },
  "O-":  { bg: "#F1EFE8", color: "#5F5758" },
};

const GENDER_COLORS = {
  male:   { bg: "#E6F1FB", color: "#185FA5" },
  female: { bg: "#FBEAF0", color: "#993556" },
  other:  { bg: "#EEEDFE", color: "#534AB7" },
};

function getInitials(name) {
  if (!name) return "?";
  return name.split(" ").filter(Boolean).slice(0, 2).map((n) => n[0].toUpperCase()).join("");
}

function PatientManagement() {
  const navigate = useNavigate();
  const [patients, setPatients]   = useState([]);
  const [search, setSearch]       = useState("");
  const [genderFilter, setGender] = useState("All");
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState("");
  const [currentPage, setPage]    = useState(1);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const perPage = 8;

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { setError("Missing authentication token."); setLoading(false); return; }

    fetch("http://127.0.0.1:8000/api/patients", {
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
    })
      .then((res) => res.json())
      .then((data) => {
        const arr = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
        setPatients(arr);
      })
      .catch(() => setError("Unable to load patients."))
      .finally(() => setLoading(false));
  }, []);

  const filtered = patients.filter((p) => {
    const name  = p.user?.name?.toLowerCase() || "";
    const code  = p.patient_code?.toLowerCase() || "";
    const email = p.user?.email?.toLowerCase() || "";
    const q     = search.toLowerCase();
    const matchSearch = !search || name.includes(q) || code.includes(q) || email.includes(q);
    const matchGender = genderFilter === "All" || (p.gender || "").toLowerCase() === genderFilter.toLowerCase();
    return matchSearch && matchGender;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const paginated  = filtered.slice((currentPage - 1) * perPage, currentPage * perPage);

  const maleCount   = patients.filter((p) => p.gender?.toLowerCase() === "male").length;
  const femaleCount = patients.filter((p) => p.gender?.toLowerCase() === "female").length;

  const handleDelete = (id) => {
    if (!window.confirm("Delete this patient?")) return;
    const token = localStorage.getItem("token");
    fetch(`http://127.0.0.1:8000/api/patients/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
    })
      .then((res) => { if (res.ok) setPatients((prev) => prev.filter((p) => p.id !== id)); })
      .catch(() => alert("Network error."));
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#F4F6FA" }}>
      <AdminSidebar />

      <main style={{ flex: 1, display: "flex", flexDirection: "column" }}>

        {/* ── Top Bar ── */}
        <div style={{
          background: "#fff", borderBottom: "0.5px solid #E2E6EF",
          padding: "0 28px", height: "56px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          position: "sticky", top: 0, zIndex: 10,
        }}>
          <span style={{ fontSize: "16px", fontWeight: 600, color: "#185FA5" }}>Patient Management</span>
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            {/* search */}
            <div style={{
              display: "flex", alignItems: "center", gap: "8px",
              background: "#F4F6FA", border: "0.5px solid #D8DDE8",
              borderRadius: "8px", padding: "7px 14px", width: "240px",
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8A94A6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder="Search patients..."
                style={{ border: "none", background: "transparent", fontSize: "13px", color: "#3D4A5C", outline: "none", width: "100%" }}
              />
            </div>
            {/* bell */}
            <div style={{ position: "relative", cursor: "pointer" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8A94A6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
              <span style={{ position: "absolute", top: "-3px", right: "-3px", width: "7px", height: "7px", background: "#E24B4A", borderRadius: "50%", border: "1.5px solid #fff" }}/>
            </div>
            {/* avatar */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
              <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "#B5D4F4", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: 600, color: "#0C447C" }}>AU</div>
              <span style={{ fontSize: "13px", color: "#3D4A5C", fontWeight: 500 }}>Admin User</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#8A94A6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
            </div>
          </div>
        </div>

        <div style={{ padding: "28px" }}>

          {/* ── Page Title ── */}
          <div style={{ marginBottom: "22px" }}>
            <h1 style={{ fontSize: "22px", fontWeight: 700, color: "#1A2236", margin: 0 }}>Patients</h1>
            <p style={{ fontSize: "13px", color: "#8A94A6", marginTop: "4px" }}>View and manage all registered patients in the system.</p>
          </div>

          {/* ── Stats Row ── */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "14px", marginBottom: "22px" }}>
            <StatCard icon={<PatientsIcon />} iconBg="#E6F1FB" label="Total Patients" value={patients.length} />
            <StatCard icon={<MaleIcon />}     iconBg="#E6F1FB" label="Male"           value={maleCount} />
            <StatCard icon={<FemaleIcon />}   iconBg="#FBEAF0" label="Female"         value={femaleCount} />
            <StatCard icon={<SearchIcon />}   iconBg="#EAF3DE" label="Filtered"       value={filtered.length} />
          </div>

          {/* ── Toolbar ── */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
            <div style={{ display: "flex", gap: "8px" }}>
              {["All", "male", "female", "other"].map((g) => (
                <button
                  key={g}
                  onClick={() => { setGender(g); setPage(1); }}
                  style={{
                    padding: "7px 14px", borderRadius: "8px", fontSize: "13px",
                    fontWeight: genderFilter === g ? 600 : 400,
                    background: genderFilter === g ? "#185FA5" : "#fff",
                    color: genderFilter === g ? "#fff" : "#3D4A5C",
                    border: genderFilter === g ? "none" : "0.5px solid #D8DDE8",
                    cursor: "pointer", fontFamily: "inherit",
                  }}
                >
                  {g === "All" ? "All Genders" : g.charAt(0).toUpperCase() + g.slice(1)}
                </button>
              ))}
            </div>
            <button style={{
              display: "inline-flex", alignItems: "center", gap: "6px",
              background: "#185FA5", color: "#fff", border: "none",
              borderRadius: "8px", padding: "8px 18px",
              fontSize: "13px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Add New Patient
            </button>
          </div>

          {/* ── Error ── */}
          {error && (
            <div style={{ background: "#FAECE7", border: "0.5px solid #F5B8A0", borderRadius: "10px", padding: "12px 16px", color: "#993C1D", fontSize: "13px", marginBottom: "16px", display: "flex", gap: "8px", alignItems: "center" }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              {error}
            </div>
          )}

          {/* ── Table Card ── */}
          <div style={{ background: "#fff", border: "0.5px solid #E2E6EF", borderRadius: "14px", overflow: "hidden" }}>

            <div style={{ padding: "14px 20px", borderBottom: "0.5px solid #E2E6EF", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: "14px", fontWeight: 600, color: "#1A2236" }}>Patient List</span>
              <span style={{ fontSize: "12px", color: "#8A94A6" }}>{filtered.length} patient{filtered.length !== 1 ? "s" : ""} found</span>
            </div>

            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                <thead>
                  <tr style={{ background: "#F8F9FC" }}>
                    {["Patient", "Email", "Patient Code", "Gender", "Blood Group", "Address", "Action"].map((h) => (
                      <th key={h} style={{
                        padding: "10px 16px", textAlign: "left",
                        fontSize: "11px", fontWeight: 600, color: "#8A94A6",
                        textTransform: "uppercase", letterSpacing: "0.05em",
                        borderBottom: "0.5px solid #E2E6EF", whiteSpace: "nowrap",
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={7} style={{ padding: "56px", textAlign: "center" }}>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", color: "#8A94A6" }}>
                          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#185FA5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: "spin 1s linear infinite" }}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                          <span style={{ fontSize: "13px" }}>Loading patients...</span>
                        </div>
                      </td>
                    </tr>
                  ) : paginated.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ padding: "56px", textAlign: "center" }}>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px", color: "#8A94A6" }}>
                          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#D8DDE8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                          <span style={{ fontSize: "13px" }}>No patients found</span>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    paginated.map((patient, idx) => {
                      const ac  = AVATAR_COLORS[idx % AVATAR_COLORS.length];
                      const gc  = GENDER_COLORS[(patient.gender || "").toLowerCase()] || GENDER_COLORS.other;
                      const bc  = BLOOD_COLORS[patient.blood_group] || { bg: "#F4F6FA", color: "#3D4A5C" };
                      return (
                        <tr
                          key={patient.id}
                          style={{ borderBottom: "0.5px solid #F0F2F7" }}
                          onMouseEnter={e => e.currentTarget.style.background = "#F8F9FC"}
                          onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                        >
                          {/* Patient */}
                          <td style={{ padding: "14px 16px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                              <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: ac.bg, color: ac.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: 700, flexShrink: 0 }}>
                                {getInitials(patient.user?.name)}
                              </div>
                              <div>
                                <div style={{ fontWeight: 600, color: "#1A2236" }}>{patient.user?.name || "—"}</div>
                                <div style={{ fontSize: "12px", color: "#8A94A6" }}>ID #{patient.id}</div>
                              </div>
                            </div>
                          </td>

                          {/* Email */}
                          <td style={{ padding: "14px 16px", color: "#8A94A6" }}>{patient.user?.email || "—"}</td>

                          {/* Code */}
                          <td style={{ padding: "14px 16px" }}>
                            <span style={{ fontFamily: "monospace", fontSize: "12px", background: "#F4F6FA", border: "0.5px solid #E2E6EF", borderRadius: "6px", padding: "3px 8px", color: "#3D4A5C" }}>
                              {patient.patient_code || "—"}
                            </span>
                          </td>

                          {/* Gender */}
                          <td style={{ padding: "14px 16px" }}>
                            {patient.gender ? (
                              <span style={{ background: gc.bg, color: gc.color, fontSize: "11px", fontWeight: 600, padding: "3px 10px", borderRadius: "99px", textTransform: "capitalize", letterSpacing: "0.03em" }}>
                                {patient.gender}
                              </span>
                            ) : "—"}
                          </td>

                          {/* Blood Group */}
                          <td style={{ padding: "14px 16px" }}>
                            {patient.blood_group ? (
                              <span style={{ background: bc.bg, color: bc.color, fontSize: "12px", fontWeight: 700, padding: "3px 10px", borderRadius: "6px", letterSpacing: "0.02em" }}>
                                {patient.blood_group}
                              </span>
                            ) : "—"}
                          </td>

                          {/* Address */}
                          <td style={{ padding: "14px 16px", color: "#8A94A6", maxWidth: "180px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {patient.address || "—"}
                          </td>

                          {/* Actions */}
                          <td style={{ padding: "14px 16px" }}>
                            <div style={{ display: "flex", gap: "6px" }}>
                              <button
                                style={viewBtnStyle}
                                onClick={() => setSelectedPatient(patient)}
                                onMouseEnter={e => e.currentTarget.style.background = "#E6F1FB"}
                                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                               
                              >
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                                View
                              </button>
                              <button
                                style={editBtnStyle}
                                onMouseEnter={e => e.currentTarget.style.background = "#E6F1FB"}
                                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                                onClick={()=>navigate(`/admin/editpatient/${patient.id}`)}
                              >
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                                Edit
                              </button>
                              <button
                                onClick={() => handleDelete(patient.id)}
                                style={deleteBtnStyle}
                                onMouseEnter={e => { e.currentTarget.style.background = "#FCEBEB"; e.currentTarget.style.borderColor = "#F7C1C1"; }}
                                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "#E2E6EF"; }}
                              >
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* ── Pagination ── */}
            {!loading && filtered.length > perPage && (
              <div style={{ borderTop: "0.5px solid #E2E6EF", padding: "12px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: "13px", color: "#8A94A6" }}>
                  Showing {(currentPage - 1) * perPage + 1}–{Math.min(currentPage * perPage, filtered.length)} of {filtered.length} patients
                </span>
                <div style={{ display: "flex", gap: "4px" }}>
                  <PgBtn disabled={currentPage === 1} onClick={() => setPage((p) => p - 1)}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
                  </PgBtn>
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((p) => (
                    <PgBtn key={p} active={p === currentPage} onClick={() => setPage(p)}>{p}</PgBtn>
                  ))}
                  {totalPages > 5 && <span style={{ padding: "0 4px", color: "#8A94A6", fontSize: "13px", display: "flex", alignItems: "center" }}>...</span>}
                  <PgBtn disabled={currentPage === totalPages} onClick={() => setPage((p) => p + 1)}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                  </PgBtn>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {selectedPatient && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }}
          onClick={() => setSelectedPatient(null)}
        >
          <div
            style={{ width: "min(92vw, 720px)", background: "#fff", borderRadius: "24px", overflow: "hidden", boxShadow: "0 30px 80px rgba(15,23,42,0.18)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ padding: "24px 28px", background: "#185FA5", color: "#fff", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontSize: "13px", fontWeight: 600, opacity: 0.85, letterSpacing: "0.08em", textTransform: "uppercase" }}>Patient Details</div>
                <h2 style={{ margin: "10px 0 0", fontSize: "24px", fontWeight: 700 }}>{selectedPatient.user?.name || "Unknown Patient"}</h2>
              </div>
              <button
                onClick={() => setSelectedPatient(null)}
                style={{ width: "38px", height: "38px", borderRadius: "999px", background: "rgba(255,255,255,0.14)", border: "none", color: "#fff", cursor: "pointer", fontSize: "16px", lineHeight: 1 }}
              >
                ×
              </button>
            </div>
            <div style={{ padding: "26px 28px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px", background: "#F8FAFF" }}>
              <DetailRow label="Patient Code" value={selectedPatient.patient_code || "—"} />
              <DetailRow label="Email" value={selectedPatient.user?.email || "—"} />
              <DetailRow label="Gender" value={selectedPatient.gender || "—"} />
              <DetailRow label="Blood Group" value={selectedPatient.blood_group || "—"} />
              <DetailRow label="Address" value={selectedPatient.address || "—"} long />
              <DetailRow label="Phone" value={selectedPatient.user?.phone_number || "—"} />
              <DetailRow label="Date of Birth" value={selectedPatient.date_of_birth || "—"} />
              <DetailRow label="Patient ID" value={`#${selectedPatient.id}`} />
            </div>
            <div style={{ padding: "18px 28px 22px", display: "flex", justifyContent: "flex-end", gap: "10px", background: "#fff" }}>
              <button
                onClick={() => setSelectedPatient(null)}
                style={{ border: "1px solid #D8DDE8", background: "#fff", color: "#3D4A5C", padding: "10px 18px", borderRadius: "10px", cursor: "pointer" }}
              >
                Close
              </button>
              <button
                onClick={() => {
                  window.location.href = `/admin/viewpatient/${selectedPatient.id}`;
                }}
                style={{ background: "#185FA5", color: "#fff", border: "none", padding: "10px 18px", borderRadius: "10px", cursor: "pointer" }}
              >
                Open Full Profile
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

/* ── Sub-components ── */
function StatCard({ icon, iconBg, label, value }) {
  return (
    <div style={{ background: "#fff", border: "0.5px solid #E2E6EF", borderRadius: "12px", padding: "16px 18px", display: "flex", alignItems: "center", gap: "14px" }}>
      <div style={{ width: "42px", height: "42px", borderRadius: "10px", background: iconBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: "11px", fontWeight: 600, color: "#8A94A6", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "3px" }}>{label}</div>
        <div style={{ fontSize: "24px", fontWeight: 700, color: "#1A2236", lineHeight: 1 }}>{value}</div>
      </div>
    </div>
  );
}

function PgBtn({ children, active, disabled, onClick }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      width: "30px", height: "30px", borderRadius: "6px",
      border: active ? "none" : "0.5px solid #D8DDE8",
      background: active ? "#185FA5" : "transparent",
      color: active ? "#fff" : disabled ? "#C4CAD4" : "#3D4A5C",
      fontSize: "13px", cursor: disabled ? "default" : "pointer",
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      fontFamily: "inherit", opacity: disabled ? 0.5 : 1,
    }}>
      {children}
    </button>
  );
}

/* ── SVG Icons ── */
function PatientsIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#185FA5" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
}
function MaleIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#185FA5" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="10" cy="14" r="5"/><line x1="19" y1="5" x2="14.14" y2="9.86"/><polyline points="15 5 19 5 19 9"/></svg>;
}
function FemaleIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#993556" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="5"/><line x1="12" y1="13" x2="12" y2="21"/><line x1="9" y1="18" x2="15" y2="18"/></svg>;
}
function SearchIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3B6D11" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
}

/* ── Shared button styles ── */
const editBtnStyle = {
  display: "inline-flex", alignItems: "center", gap: "5px",
  background: "transparent", border: "0.5px solid #D8DDE8",
  borderRadius: "6px", padding: "5px 10px",
  fontSize: "12px", color: "#185FA5", cursor: "pointer",
  fontFamily: "inherit", transition: "background 0.15s",
};
const deleteBtnStyle = {
  display: "inline-flex", alignItems: "center", justifyContent: "center",
  background: "transparent", border: "0.5px solid #E2E6EF",
  borderRadius: "6px", padding: "5px 8px",
  color: "#A32D2D", cursor: "pointer",
  fontFamily: "inherit", transition: "all 0.15s",
};
const viewBtnStyle = {
  display: "inline-flex", alignItems: "center", gap: "5px",
  background: "transparent", border: "0.5px solid #D8DDE8",
  borderRadius: "6px", padding: "5px 10px",
  fontSize: "12px", color: "#185FA5", cursor: "pointer",
  fontFamily: "inherit", transition: "background 0.15s",
};

function DetailRow({ label, value, long }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px", gridColumn: long ? "1 / -1" : undefined }}>
      <span style={{ fontSize: "11px", fontWeight: 700, color: "#8A94A6", textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</span>
      <span style={{ fontSize: "14px", fontWeight: 600, color: "#1A2236", wordBreak: "break-word" }}>{value}</span>
    </div>
  );
}

export default PatientManagement;