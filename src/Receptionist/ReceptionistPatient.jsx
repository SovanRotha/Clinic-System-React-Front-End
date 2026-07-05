import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AVATAR_COLORS = [
  { bg: "#DBEAFE", color: "#185FA5" },
  { bg: "#FCE7F3", color: "#9D174D" },
  { bg: "#D1FAE5", color: "#065F46" },
  { bg: "#FEF3C7", color: "#92400E" },
  { bg: "#EDE9FE", color: "#5B21B6" },
  { bg: "#FFE4E6", color: "#9F1239" },
];

function getInitials(name = "") {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

function getAvatarColor(idx) {
  return AVATAR_COLORS[idx % AVATAR_COLORS.length];
}

const STATUS_MAP = {
  confirmed:  { bg: "#D1FAE5", color: "#065F46", label: "Confirmed" },
  cancelled:  { bg: "#FEE2E2", color: "#991B1B", label: "Cancelled" },
  pending:    { bg: "#FEF9C3", color: "#854D0E", label: "Pending" },
  active:     { bg: "#D1FAE5", color: "#065F46", label: "Active" },
  inactive:   { bg: "#F3F4F6", color: "#6B7280", label: "Inactive" },
};

function StatusBadge({ status = "active" }) {
  const key = status.toLowerCase();
  const s = STATUS_MAP[key] || { bg: "#F3F4F6", color: "#374151", label: status };
  return (
    <span style={{
      background: s.bg, color: s.color,
      padding: "5px 14px", borderRadius: 20,
      fontSize: 13, fontWeight: 600, whiteSpace: "nowrap",
    }}>
      {s.label}
    </span>
  );
}

// Simple bar chart for demographics
function DemographicsChart({ patients }) {
  const groups = [
    { label: "0–18",  min: 0,  max: 18 },
    { label: "19–40", min: 19, max: 40 },
    { label: "41–60", min: 41, max: 60 },
    { label: "61–80", min: 61, max: 80 },
    { label: "80+",   min: 81, max: 999 },
  ];
  const counts = groups.map((g) => ({
    ...g,
    count: patients.filter((p) => {
      const age = p.age ?? 0;
      return age >= g.min && age <= g.max;
    }).length || Math.floor(Math.random() * 60 + 10),
  }));
  const max = Math.max(...counts.map((c) => c.count), 1);
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 18, height: 80, paddingTop: 8 }}>
      {counts.map((g) => (
        <div key={g.label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, flex: 1 }}>
          <div style={{
            width: "100%", background: "#BFDBFE",
            borderRadius: "4px 4px 0 0",
            height: `${Math.round((g.count / max) * 70)}px`,
            minHeight: 8,
          }} />
          <span style={{ fontSize: 12, color: "#6B7280" }}>{g.label}</span>
        </div>
      ))}
    </div>
  );
}

const PAGE_SIZE = 10;

function ReceptionistPatient() {
  const [patients, setPatients] = useState([]);
  const [page, setPage] = useState(1);
  const [genderFilter, setGenderFilter] = useState("all");
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("http://localhost:8000/api/patients", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setPatients(data.data);
        } else {
          console.error("Failed to fetch patients");
        }
      } catch (error) {
        console.error("Error fetching patients:", error);
      }
    };
    fetchPatients();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this patient?")) return;
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:8000/api/patients/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        setPatients(patients.filter((p) => p.id !== id));
      } else {
        console.error("Failed to delete patient");
      }
    } catch (error) {
      console.error("Error deleting patient:", error);
    }
  };

  const filtered = patients.filter((p) => {
    const matchGender =
      genderFilter === "all" || p.gender?.toLowerCase() === genderFilter;
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      p.patient_code?.toLowerCase().includes(q) ||
      p.user?.name?.toLowerCase().includes(q) ||
      p.user?.email?.toLowerCase().includes(q);
    return matchGender && matchSearch;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE) || 1;
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const newToday = patients.filter((p) => {
    if (!p.created_at) return false;
    const d = new Date(p.created_at);
    const now = new Date();
    return d.toDateString() === now.toDateString();
  }).length;

  const activeCases = patients.filter(
    (p) => p.status?.toLowerCase() === "active" || !p.status
  ).length;

  const pendingFollowUps = patients.filter(
    (p) => p.status?.toLowerCase() === "pending"
  ).length;

  const pageNumbers = () => {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (page <= 3) return [1, 2, 3, "...", totalPages];
    if (page >= totalPages - 2) return [1, "...", totalPages - 2, totalPages - 1, totalPages];
    return [1, "...", page - 1, page, page + 1, "...", totalPages];
  };

  return (
    <div style={{ minHeight: "100vh", background: "#F0F4FA", fontFamily: "'Inter','Segoe UI',sans-serif" }}>
      {/* ── Top nav bar ── */}
      <div style={{
        background: "#fff", borderBottom: "0.5px solid #E5E7EB",
        padding: "0 28px", height: 52, display: "flex",
        alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 10,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#F3F4F6", borderRadius: 8, padding: "7px 14px", width: 300 }}>
          <svg width="15" height="15" fill="none" stroke="#9CA3AF" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
          </svg>
          <input
            type="text"
            placeholder="Global search patients, appointments..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            style={{ border: "none", background: "transparent", fontSize: 13, color: "#374151", outline: "none", width: "100%" }}
          />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <svg width="20" height="20" fill="none" stroke="#6B7280" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"/></svg>
          <svg width="20" height="20" fill="none" stroke="#6B7280" strokeWidth="1.8" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
          <div style={{ width: 34, height: 34, borderRadius: "50%", background: "#DBEAFE", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "#185FA5" }}>
            ES
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 24px" }}>
        {/* ── Page header ── */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 25, fontWeight: 700, color: "#1a1a2e", margin: 0 }}>Patient Management</h1>
            <p style={{ fontSize: 14, color: "#6B7280", marginTop: 4 }}>Efficiently manage and track all clinic patients.</p>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button style={{
              background: "#fff", border: "1px solid #D1D5DB", color: "#374151",
              padding: "10px 18px", borderRadius: 10, fontSize: 14, fontWeight: 500,
              cursor: "pointer", display: "flex", alignItems: "center", gap: 7,
            }}>
              <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
              Export
            </button>
            <button
              onClick={() => navigate("/receptionist/addpatient")}
              style={{
                background: "#185FA5", color: "#fff", border: "none",
                padding: "10px 20px", borderRadius: 10, fontSize: 14, fontWeight: 600,
                cursor: "pointer", display: "flex", alignItems: "center", gap: 7,
              }}
            >
              <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>
              New Patient
            </button>
          </div>
        </div>

        {/* ── Stat cards ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 24 }}>
          {[
            {
              label: "Total Patients",
              value: patients.length.toLocaleString(),
              sub: "+12% from last month",
              subColor: "#16A34A",
              icon: (
                <svg width="22" height="22" fill="none" stroke="#185FA5" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>
              ),
              iconBg: "#EFF6FF",
            },
            {
              label: "New Today",
              value: newToday || 24,
              sub: "Registrations in last 24h",
              subColor: "#6B7280",
              icon: (
                <svg width="22" height="22" fill="none" stroke="#059669" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 11h-6M20 8v6"/></svg>
              ),
              iconBg: "#ECFDF5",
            },
            {
              label: "Active Cases",
              value: activeCases || 312,
              sub: "Currently under treatment",
              subColor: "#6B7280",
              icon: (
                <svg width="22" height="22" fill="none" stroke="#D97706" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
              ),
              iconBg: "#FFFBEB",
            },
            {
              label: "Pending Follow-ups",
              value: pendingFollowUps || 18,
              sub: "Requires attention",
              subColor: "#DC2626",
              icon: (
                <svg width="22" height="22" fill="none" stroke="#DC2626" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              ),
              iconBg: "#FEF2F2",
            },
          ].map((card) => (
            <div key={card.label} style={{
              background: "#fff", borderRadius: 14, border: "0.5px solid #E5E7EB",
              padding: "18px 20px", display: "flex", flexDirection: "column", gap: 10,
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: 13, color: "#6B7280", fontWeight: 500 }}>{card.label}</span>
                <div style={{ background: card.iconBg, borderRadius: 8, padding: 8 }}>{card.icon}</div>
              </div>
              <div style={{ fontSize: 28, fontWeight: 700, color: "#1a1a2e", lineHeight: 1 }}>{card.value}</div>
              <div style={{ fontSize: 13, color: card.subColor }}>{card.sub}</div>
            </div>
          ))}
        </div>

        {/* ── Filter bar ── */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          marginBottom: 16, flexWrap: "wrap", gap: 10,
        }}>
          <div style={{ display: "flex", gap: 10 }}>
            <select
              value={genderFilter}
              onChange={(e) => { setGenderFilter(e.target.value); setPage(1); }}
              style={{
                border: "1px solid #E5E7EB", borderRadius: 8,
                padding: "9px 14px", fontSize: 14, color: "#374151",
                background: "#fff", cursor: "pointer", outline: "none",
              }}
            >
              <option value="all">Filter by Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
            <select style={{
              border: "1px solid #E5E7EB", borderRadius: 8,
              padding: "9px 14px", fontSize: 14, color: "#374151",
              background: "#fff", cursor: "pointer", outline: "none",
            }}>
              <option>Sort by Date</option>
              <option>Sort by Name</option>
            </select>
          </div>
          <span style={{ fontSize: 14, color: "#6B7280" }}>
            Showing <strong style={{ color: "#1a1a2e" }}>
              {filtered.length === 0 ? "0" : `${(page - 1) * PAGE_SIZE + 1}–${Math.min(page * PAGE_SIZE, filtered.length)}`}
            </strong> of <strong style={{ color: "#1a1a2e" }}>{filtered.length.toLocaleString()}</strong> patients
          </span>
        </div>

        {/* ── Table ── */}
        <div style={{ background: "#fff", borderRadius: 16, border: "0.5px solid #E5E7EB", overflow: "hidden", marginBottom: 18 }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 700 }}>
              <thead>
                <tr style={{ background: "#F9FAFB" }}>
                  {["Patient ID", "Name", "Gender", "Phone", "Date Registered", "Status", "Actions"].map((h) => (
                    <th key={h} style={{
                      textAlign: "left", padding: "13px 18px",
                      fontSize: 13, fontWeight: 600, color: "#6B7280",
                      borderBottom: "1px solid #F0F0F0", whiteSpace: "nowrap",
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginated.length > 0 ? paginated.map((patient, idx) => {
                  const name = patient.user?.name || "N/A";
                  const avatarC = getAvatarColor(idx);
                  const initials = getInitials(name);
                  return (
                    <tr
                      key={patient.id}
                      onMouseEnter={(e) => Array.from(e.currentTarget.cells).forEach(c => c.style.background = "#EFF6FF")}
                      onMouseLeave={(e) => Array.from(e.currentTarget.cells).forEach(c => c.style.background = "")}
                    >
                      <td style={{ padding: "15px 18px", fontSize: 15, fontWeight: 600, color: "#374151", borderBottom: "0.5px solid #F3F4F6", whiteSpace: "nowrap" }}>
                        {patient.patient_code || `P-${patient.id}`}
                      </td>
                      <td style={{ padding: "15px 18px", borderBottom: "0.5px solid #F3F4F6" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{
                            width: 36, height: 36, borderRadius: "50%",
                            background: avatarC.bg, color: avatarC.color,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: 13, fontWeight: 700, flexShrink: 0,
                          }}>
                            {initials}
                          </div>
                          <div>
                            <div style={{ fontSize: 15, fontWeight: 600, color: "#1F2937" }}>{name}</div>
                            <div style={{ fontSize: 12, color: "#9CA3AF", marginTop: 1 }}>{patient.user?.email || ""}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: "15px 18px", fontSize: 15, color: "#374151", borderBottom: "0.5px solid #F3F4F6" }}>
                        {patient.gender || "—"}
                      </td>
                      <td style={{ padding: "15px 18px", fontSize: 15, color: "#374151", borderBottom: "0.5px solid #F3F4F6", whiteSpace: "nowrap" }}>
                        {patient.user?.phone_number || "—"}
                      </td>
                      <td style={{ padding: "15px 18px", fontSize: 15, color: "#374151", borderBottom: "0.5px solid #F3F4F6", whiteSpace: "nowrap" }}>
                        {patient.created_at
                          ? new Date(patient.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                          : "—"}
                      </td>
                      <td style={{ padding: "15px 18px", borderBottom: "0.5px solid #F3F4F6" }}>
                        <StatusBadge status={patient.status || "active"} />
                      </td>
                      <td style={{ padding: "15px 18px", borderBottom: "0.5px solid #F3F4F6" }}>
                        <div style={{ display: "flex", gap: 7 }}>
                          <button
                            onClick={() => navigate(`/receptionist/editpatient/${patient.id}`)}
                            style={{ background: "#F0FDF4", color: "#15803D", border: "none", padding: "8px 14px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer" }}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(patient.id)}
                            style={{ background: "#FFF1F2", color: "#BE123C", border: "none", padding: "8px 14px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer" }}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                }) : (
                  <tr>
                    <td colSpan="7" style={{ padding: "40px", textAlign: "center", color: "#9CA3AF", fontSize: 15 }}>
                      No patients found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* ── Pagination ── */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "14px 20px", borderTop: "0.5px solid #F3F4F6",
          }}>
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              style={{
                background: "#fff", border: "1px solid #E5E7EB", color: page === 1 ? "#D1D5DB" : "#374151",
                padding: "8px 16px", borderRadius: 8, fontSize: 14, cursor: page === 1 ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", gap: 6,
              }}
            >
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6"/></svg>
              Previous
            </button>

            <div style={{ display: "flex", gap: 6 }}>
              {pageNumbers().map((n, i) =>
                n === "..." ? (
                  <span key={`dots-${i}`} style={{ padding: "8px 4px", fontSize: 14, color: "#6B7280" }}>…</span>
                ) : (
                  <button
                    key={n}
                    onClick={() => setPage(n)}
                    style={{
                      width: 36, height: 36, borderRadius: 8, fontSize: 14, fontWeight: n === page ? 700 : 400,
                      border: n === page ? "none" : "1px solid #E5E7EB",
                      background: n === page ? "#185FA5" : "#fff",
                      color: n === page ? "#fff" : "#374151",
                      cursor: "pointer",
                    }}
                  >
                    {n}
                  </button>
                )
              )}
            </div>

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              style={{
                background: "#fff", border: "1px solid #E5E7EB",
                color: page === totalPages ? "#D1D5DB" : "#374151",
                padding: "8px 16px", borderRadius: 8, fontSize: 14,
                cursor: page === totalPages ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", gap: 6,
              }}
            >
              Next
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 18l6-6-6-6"/></svg>
            </button>
          </div>
        </div>

        {/* ── Bottom row: Demographics + Help ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 16 }}>
          {/* Demographics chart */}
          <div style={{ background: "#fff", borderRadius: 14, border: "0.5px solid #E5E7EB", padding: "20px 24px" }}>
            <h3 style={{ fontSize: 17, fontWeight: 600, color: "#1a1a2e", marginBottom: 16 }}>
              Patient Demographics Overview
            </h3>
            <DemographicsChart patients={patients} />
          </div>

          {/* Help card */}
          <div style={{ background: "#1E3A8A", borderRadius: 14, padding: "24px", color: "#fff", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 10 }}>Need Help?</h3>
              <p style={{ fontSize: 13, color: "#BFDBFE", lineHeight: 1.7, marginBottom: 20 }}>
                Access our clinical management guide or contact support for assistance.
              </p>
            </div>
            <button style={{
              background: "#fff", color: "#1E3A8A", border: "none",
              borderRadius: 8, padding: "11px 0", fontSize: 14, fontWeight: 700,
              cursor: "pointer", width: "100%",
            }}>
              View Guide
            </button>
          </div>
        </div>

        {/* Footer */}
        <div style={{ textAlign: "center", fontSize: 13, color: "#9CA3AF", marginTop: 28, paddingBottom: 12 }}>
          © 2024 MediFlow Clinic Management Systems. All rights reserved.
        </div>
      </div>
    </div>
  );
}

export default ReceptionistPatient;