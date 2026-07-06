import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

const AVATAR_COLORS = [
  { bg: "#DBEAFE", text: "#185FA5" },
  { bg: "#FEF3C7", text: "#92400E" },
  { bg: "#F3E8FF", text: "#7E22CE" },
  { bg: "#DCFCE7", text: "#166534" },
  { bg: "#FFE4E6", text: "#9F1239" },
  { bg: "#E0E7FF", text: "#3730A3" },
];

function getInitials(name = "") {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function getAvatarColor(id) {
  return AVATAR_COLORS[id % AVATAR_COLORS.length];
}

const STATUS_STYLES = {
  confirmed:  { bg: "#D1FAE5", color: "#065F46", label: "CONFIRMED" },
  pending:    { bg: "#FEF9C3", color: "#854D0E", label: "PENDING" },
  cancelled:  { bg: "#FEE2E2", color: "#991B1B", label: "CANCELLED" },
  completed:  { bg: "#E0E7FF", color: "#3730A3", label: "COMPLETED" },
};

function StatusBadge({ status = "" }) {
  const key = status.toLowerCase();
  const style = STATUS_STYLES[key] || { bg: "#F3F4F6", color: "#374151", label: status };
  return (
    <span style={{
      background: style.bg,
      color: style.color,
      padding: "5px 14px",
      borderRadius: "20px",
      fontSize: "13px",
      fontWeight: 600,
      letterSpacing: "0.03em",
      whiteSpace: "nowrap",
    }}>
      {style.label}
    </span>
  );
}

const MINI_CAL_DAYS = ["M","T","W","T","F","S","S"];
const MINI_CAL_NUMS = [21,22,23,24,25,26,27];
const TODAY_NUM = 24;

function MiniCalendar() {
  return (
    <div style={styles.sideCard}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14 }}>
        <span style={{ fontSize:16, fontWeight:600, color:"#1a1a2e" }}>Calendar</span>
        <span style={{ fontSize:13, color:"#185FA5", cursor:"pointer" }}>View full</span>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:2, textAlign:"center" }}>
        {MINI_CAL_DAYS.map((d,i) => (
          <div key={i} style={{ fontSize:12, color:"#9CA3AF", paddingBottom:6 }}>{d}</div>
        ))}
        {MINI_CAL_NUMS.map((n) => (
          <div key={n} style={{ display:"flex", alignItems:"center", justifyContent:"center", padding:"4px 0" }}>
            {n === TODAY_NUM ? (
              <span style={{ width:28, height:28, borderRadius:"50%", background:"#185FA5", color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:600 }}>{n}</span>
            ) : (
              <span style={{ fontSize:13, color:"#374151" }}>{n}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  page: {
    display: "flex",
    minHeight: "100vh",
    background: "#EEF2FB",
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
  },
  mainContent: {
    flex: 1,
    padding: "28px 24px",
    minWidth: 0,
  },
  sidebar: {
    width: 230,
    flexShrink: 0,
    padding: "28px 16px 28px 0",
    display: "flex",
    flexDirection: "column",
    gap: 14,
  },
  sideCard: {
    background: "#fff",
    borderRadius: 14,
    border: "0.5px solid #E5E7EB",
    padding: "16px",
  },
  breadcrumb: {
    fontSize: 13,
    color: "#6B7280",
    marginBottom: 8,
  },
  topbar: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  pageTitle: {
    fontSize: 25,
    fontWeight: 700,
    color: "#1a1a2e",
    margin: 0,
  },
  pageSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 4,
  },
  topActions: {
    display: "flex",
    gap: 10,
    alignItems: "center",
    flexShrink: 0,
  },
  btnExport: {
    background: "#fff",
    border: "1px solid #D1D5DB",
    color: "#374151",
    padding: "10px 18px",
    borderRadius: 10,
    fontSize: 14,
    fontWeight: 500,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: 7,
  },
  btnBook: {
    background: "#185FA5",
    color: "#fff",
    border: "none",
    padding: "10px 18px",
    borderRadius: 10,
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: 7,
  },
  filterBar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 18,
    flexWrap: "wrap",
    gap: 10,
  },
  filterTabs: {
    display: "flex",
    gap: 6,
  },
  tableCard: {
    background: "#fff",
    borderRadius: 16,
    border: "0.5px solid #E5E7EB",
    overflow: "hidden",
  },
  tableHeader: {
    padding: "18px 22px 14px",
    borderBottom: "1px solid #F3F4F6",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  tableTitle: {
    fontSize: 18,
    fontWeight: 600,
    color: "#1a1a2e",
    margin: 0,
  },
  tableWrap: {
    overflowX: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: 700,
  },
  th: {
    textAlign: "left",
    padding: "13px 18px",
    fontSize: 13,
    fontWeight: 600,
    color: "#6B7280",
    background: "#F9FAFB",
    borderBottom: "1px solid #F0F0F0",
    whiteSpace: "nowrap",
  },
  td: {
    padding: "15px 18px",
    fontSize: 15,
    color: "#1F2937",
    borderBottom: "0.5px solid #F3F4F6",
    verticalAlign: "middle",
  },
  errorBox: {
    background: "#FEF2F2",
    border: "1px solid #FECACA",
    color: "#DC2626",
    padding: "14px 18px",
    borderRadius: 10,
    fontSize: 15,
    marginBottom: 16,
  },
};

function TabButton({ label, active, count, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "9px 18px",
        borderRadius: 8,
        fontSize: 14,
        fontWeight: active ? 600 : 400,
        cursor: "pointer",
        border: active ? "none" : "1px solid #E5E7EB",
        background: active ? "#185FA5" : "#fff",
        color: active ? "#fff" : "#6B7280",
        transition: "all 0.15s",
      }}
    >
      {label}{count !== undefined ? ` (${count})` : ""}
    </button>
  );
}

function ReceptionistAppointment() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) { setError("Authentication token not found."); return; }
        const response = await fetch("https://clinic-system-back-end.onrender.com/api/appointment", {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        });
        const data = await response.json();
        setAppointments(Array.isArray(data.data) ? data.data : []);
      } catch (err) {
        console.error("Error fetching appointments:", err);
        setError("Unable to load appointments.");
      }
    };
    fetchAppointments();
  }, []);

  const handleDelete = async (appointmentId) => {
    if (!window.confirm("Are you sure you want to delete this appointment?")) return;
    try {
      const token = localStorage.getItem("token");
      if (!token) { setError("Authentication token not found."); return; }
      const response = await fetch(`https://clinic-system-back-end.onrender.com/api/appointment/${appointmentId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });
      if (response.ok) {
        setAppointments(appointments.filter((a) => a.id !== appointmentId));
      } else {
        setError("Failed to delete appointment.");
      }
    } catch (err) {
      console.error("Error deleting appointment:", err);
      setError("An error occurred while deleting the appointment.");
    }
  };

  const countByStatus = (s) =>
    appointments.filter((a) => a.status?.toLowerCase() === s).length;

  const filtered = appointments.filter((a) => {
    const matchTab =
      activeTab === "all" || a.status?.toLowerCase() === activeTab;
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      a.patient?.patient_code?.toLowerCase().includes(q) ||
      a.doctor?.doctor_code?.toLowerCase().includes(q) ||
      String(a.id).includes(q);
    return matchTab && matchSearch;
  });

  const confirmedRatio =
    appointments.length > 0
      ? Math.round((countByStatus("confirmed") / appointments.length) * 100)
      : 0;

  return (
    <div style={styles.page}>
      {/* ── Main content ── */}
      <div style={styles.mainContent}>
        {/* Breadcrumb */}
        <div style={styles.breadcrumb}>
          Dashboard &nbsp;›&nbsp;{" "}
          <span style={{ color: "#185FA5" }}>Appointments</span>
        </div>

        {/* Top bar */}
        <div style={styles.topbar}>
          <div>
            <h1 style={styles.pageTitle}>Appointments Management</h1>
            <p style={styles.pageSubtitle}>
              Manage and monitor all patient appointments
            </p>
          </div>
          <div style={styles.topActions}>
            <button style={styles.btnExport}>
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 16v2a2 2 0 002 2h14a2 2 0 002-2v-2M8 12l4 4 4-4M12 4v12"/></svg>
              Export Data
            </button>
            <button
              style={styles.btnBook}
              onClick={() => navigate("/receptionist/addappointment")}
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18M12 14v4M10 16h4"/></svg>
              Book Appointment
            </button>
          </div>
        </div>

        {/* Filter tabs */}
        <div style={styles.filterBar}>
          <div style={styles.filterTabs}>
            {["all","pending","confirmed","completed","cancelled"].map((tab) => (
              <TabButton
                key={tab}
                label={tab.charAt(0).toUpperCase() + tab.slice(1)}
                active={activeTab === tab}
                onClick={() => setActiveTab(tab)}
              />
            ))}
          </div>
          <div style={{
            background: "#fff",
            border: "1px solid #E5E7EB",
            borderRadius: 8,
            padding: "9px 14px",
            fontSize: 13,
            color: "#374151",
            display: "flex",
            alignItems: "center",
            gap: 7,
          }}>
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
            May 12, 2024 – May 18, 2024
          </div>
        </div>

        {/* Error */}
        {error && <div style={styles.errorBox}>{error}</div>}

        {/* Table */}
        <div style={styles.tableCard}>
          <div style={styles.tableHeader}>
            <h2 style={styles.tableTitle}>Recent Schedule</h2>
            <div style={{ display:"flex", gap:8 }}>
              <div style={{ position:"relative" }}>
                <svg style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", color:"#9CA3AF" }} width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
                <input
                  type="text"
                  placeholder="Search appointments..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{
                    border: "1px solid #E5E7EB",
                    borderRadius: 8,
                    padding: "8px 12px 8px 32px",
                    fontSize: 14,
                    color: "#374151",
                    outline: "none",
                    width: 220,
                  }}
                />
              </div>
            </div>
          </div>

          <div style={styles.tableWrap}>
            <table style={styles.table}>
              <thead>
                <tr>
                  {["ID","Patient","Doctor","Date & Time","Status","Actions"].map((h) => (
                    <th key={h} style={styles.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length > 0 ? (
                  filtered.map((appt, idx) => {
                    const patientName = appt.patient?.patient_code || "Unknown";
                    const doctorName  = appt.doctor?.doctor_code  || "Unknown";
                    const avatarColor = getAvatarColor(appt.id ?? idx);
                    const initials    = getInitials(patientName);
                    return (
                      <tr
                        key={appt.id}
                        style={{ transition:"background 0.12s" }}
                        onMouseEnter={(e) => { Array.from(e.currentTarget.cells).forEach(c => c.style.background = "#EFF6FF"); }}
                        onMouseLeave={(e) => { Array.from(e.currentTarget.cells).forEach(c => c.style.background = ""); }}
                      >
                        {/* ID */}
                        <td style={{ ...styles.td, fontWeight:600, color:"#374151", fontSize:15 }}>
                          #{appt.id}
                        </td>

                        {/* Patient */}
                        <td style={styles.td}>
                          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                            <div style={{
                              width: 38, height: 38, borderRadius:"50%",
                              background: avatarColor.bg, color: avatarColor.text,
                              display:"flex", alignItems:"center", justifyContent:"center",
                              fontSize:13, fontWeight:700, flexShrink:0,
                            }}>
                              {initials}
                            </div>
                            <div>
                              <div style={{ fontSize:15, fontWeight:600, color:"#1F2937" }}>{patientName}</div>
                              <div style={{ fontSize:12, color:"#9CA3AF", marginTop:2 }}>
                                {appt.patient?.phone || "—"}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Doctor */}
                        <td style={styles.td}>
                          <div style={{ fontSize:15, fontWeight:600, color:"#1F2937" }}>{doctorName}</div>
                          <div style={{ fontSize:12, color:"#9CA3AF", marginTop:2 }}>
                            {appt.doctor?.specialization || "—"}
                          </div>
                        </td>

                        {/* Date & Time */}
                        <td style={styles.td}>
                          <div style={{ fontSize:15, fontWeight:600, color:"#1F2937" }}>
                            {appt.appointment_date
                              ? new Date(appt.appointment_date).toLocaleDateString("en-US", { month:"short", day:"numeric", year:"numeric" })
                              : "—"}
                          </div>
                          <div style={{ fontSize:12, color:"#9CA3AF", marginTop:2 }}>
                            {appt.appointment_time || "—"}
                          </div>
                        </td>

                        {/* Status */}
                        <td style={styles.td}>
                          <StatusBadge status={appt.status} />
                        </td>

                        {/* Actions */}
                        <td style={styles.td}>
                          <div style={{ display:"flex", gap:7 }}>
                            <button
                              onClick={() => navigate(`/receptionist/viewappointment/${appt.id}`)}
                              style={{ background:"#EFF6FF", color:"#185FA5", border:"none", padding:"8px 14px", borderRadius:8, fontSize:13, fontWeight:600, cursor:"pointer" }}
                            >
                              View
                            </button>
                            <button
                              onClick={() => navigate(`/receptionist/editappointment/${appt.id}`)}
                              style={{ background:"#F0FDF4", color:"#15803D", border:"none", padding:"8px 14px", borderRadius:8, fontSize:13, fontWeight:600, cursor:"pointer" }}
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(appt.id)}
                              style={{ background:"#FFF1F2", color:"#BE123C", border:"none", padding:"8px 14px", borderRadius:8, fontSize:13, fontWeight:600, cursor:"pointer" }}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="6" style={{ ...styles.td, textAlign:"center", padding:"40px", color:"#9CA3AF", fontSize:15 }}>
                      No appointments found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── Sidebar ── */}
      <div style={styles.sidebar}>
        {/* User card */}
        <div style={{ ...styles.sideCard, display:"flex", alignItems:"center", gap:12 }}>
          <div style={{
            width:44, height:44, borderRadius:"50%",
            background:"#DBEAFE", color:"#185FA5",
            display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:16, fontWeight:700, flexShrink:0,
          }}>
            ES
          </div>
          <div>
            <div style={{ fontSize:16, fontWeight:600, color:"#1a1a2e" }}>Elena Smith</div>
            <div style={{ fontSize:12, color:"#6B7280", marginTop:2, letterSpacing:"0.04em" }}>RECEPTIONIST</div>
          </div>
        </div>

        {/* Mini calendar */}
        <MiniCalendar />

        {/* Check Doctor Availability */}
        <div style={{
          background:"#185FA5", borderRadius:14, padding:"18px",
          color:"#fff", display:"flex", flexDirection:"column", gap:10,
        }}>
          <div style={{ fontSize:16, fontWeight:700 }}>Check Doctor Availability</div>
          <div style={{ fontSize:13, color:"#BFDBFE", lineHeight:1.6 }}>
            View real-time slots for emergency bookings.
          </div>
          <button style={{
            background:"#fff", color:"#185FA5", border:"none",
            borderRadius:8, padding:"10px 0", fontSize:13, fontWeight:700,
            cursor:"pointer", width:"100%",
          }}>
            Open Live View
          </button>
        </div>

        {/* Quick Summary */}
        <div style={styles.sideCard}>
          <div style={{ fontSize:16, fontWeight:600, color:"#1a1a2e", marginBottom:14 }}>Quick Summary</div>

          <div style={{ marginBottom:14 }}>
            <div style={{ fontSize:13, color:"#6B7280", marginBottom:4 }}>Total Appointments</div>
            <div style={{ fontSize:23, fontWeight:700, color:"#1a1a2e" }}>
              {appointments.length.toLocaleString()}
            </div>
          </div>

          <div style={{ height:5, borderRadius:3, background:"#E5E7EB", marginBottom:14 }}>
            <div style={{ height:5, borderRadius:3, background:"#16A34A", width:`${confirmedRatio}%`, transition:"width 0.4s" }} />
          </div>

          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <span style={{ fontSize:13, color:"#6B7280" }}>Confirmed Ratio</span>
            <span style={{ fontSize:21, fontWeight:700, color:"#16A34A" }}>{confirmedRatio}%</span>
          </div>
        </div>

        {/* Stats breakdown */}
        <div style={styles.sideCard}>
          <div style={{ fontSize:16, fontWeight:600, color:"#1a1a2e", marginBottom:12 }}>Status Breakdown</div>
          {[
            { label:"Pending",   count: countByStatus("pending"),   color:"#D97706" },
            { label:"Confirmed", count: countByStatus("confirmed"), color:"#059669" },
            { label:"Cancelled", count: countByStatus("cancelled"), color:"#DC2626" },
            { label:"Completed", count: countByStatus("completed"), color:"#4F46E5" },
          ].map(({ label, count, color }) => (
            <div key={label} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                <div style={{ width:8, height:8, borderRadius:"50%", background:color, flexShrink:0 }} />
                <span style={{ fontSize:14, color:"#374151" }}>{label}</span>
              </div>
              <span style={{ fontSize:15, fontWeight:600, color:"#1a1a2e" }}>{count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ReceptionistAppointment;