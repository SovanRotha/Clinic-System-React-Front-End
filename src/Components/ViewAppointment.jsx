import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

function ViewAppointment() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAppointment = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`http://127.0.0.1:8000/api/appointment/${id}`, {
          headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
        });
        const data = await response.json();
        setAppointment(data.data || data.appointment);
      } catch (error) {
        console.error(error);
        alert("Failed to load appointment");
      } finally {
        setLoading(false);
      }
    };
    fetchAppointment();
  }, [id]);

  const statusConfig = {
    confirmed: { label: "Confirmed", color: "#15803D", bg: "#F0FDF4", border: "#86EFAC" },
    pending:   { label: "Pending",   color: "#A16207", bg: "#FEFCE8", border: "#FDE047" },
    cancelled: { label: "Cancelled", color: "#B91C1C", bg: "#FEF2F2", border: "#FCA5A5" },
    completed: { label: "Completed", color: "#1D4ED8", bg: "#EFF6FF", border: "#93C5FD" },
  };

  const status = statusConfig[appointment?.status?.toLowerCase()] || { label: appointment?.status || "—", color: "#64748B", bg: "#F8FAFC", border: "#E2E8F0" };

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return "—";
    const [h, m] = timeStr.split(":");
    const d = new Date();
    d.setHours(+h, +m);
    return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  };

  const formatDateTime = (str) => {
    if (!str) return "—";
    return new Date(str).toLocaleString("en-US", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  if (loading) {
    return (
      <div style={s.page}>
        <div style={s.loadingWrap}>
          <div style={s.spinner} />
          <span style={s.loadingText}>Loading appointment…</span>
        </div>
      </div>
    );
  }

  return (
    <div style={s.page}>
      <div style={s.container}>

        {/* Header */}
        <div style={s.header}>
          <button style={s.backBtn} onClick={() => navigate("/admin/appointments")}>
            <ArrowLeftIcon /> Appointments
          </button>
          <div style={s.headerRow}>
            <div>
              <h1 style={s.pageTitle}>Appointment Details</h1>
              <p style={s.pageSubtitle}>Appointment #{appointment?.id} · Read-only view</p>
            </div>
            <span style={{ ...s.statusPill, background: status.bg, color: status.color, border: `1px solid ${status.border}` }}>
              {status.label}
            </span>
          </div>
        </div>

        {/* Patient & Doctor */}
        <div style={s.grid2}>
          <div style={s.card}>
            <p style={s.sectionLabel}><UserIcon color="#94A3B8" /> Patient</p>
            <div style={s.avatarRow}>
              <div style={{ ...s.avatar, background: "#EFF6FF", color: "#1D4ED8" }}>
                {(appointment?.patient?.user?.name || "?").charAt(0).toUpperCase()}
              </div>
              <div>
                <p style={s.personName}>{appointment?.patient?.user?.name || "Unknown"}</p>
                <p style={s.personCode}>{appointment?.patient?.patient_code || "—"}</p>
              </div>
            </div>
          </div>

          <div style={s.card}>
            <p style={s.sectionLabel}><StethIcon /> Doctor</p>
            <div style={s.avatarRow}>
              <div style={{ ...s.avatar, background: "#F0FDF4", color: "#15803D" }}>
                {(appointment?.doctor?.user?.name || "?").charAt(0).toUpperCase()}
              </div>
              <div>
                <p style={s.personName}>Dr. {appointment?.doctor?.user?.name || "Unknown"}</p>
                <p style={s.personCode}>{appointment?.doctor?.doctor_code || "—"}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Date & Time */}
        <div style={{ ...s.card, marginTop: 16 }}>
          <p style={s.sectionLabel}><CalendarIcon /> Date &amp; time</p>
          <div style={s.grid2inner}>
            <div style={s.infoBlock}>
              <span style={s.infoLabel}>Date</span>
              <span style={s.infoValue}>{formatDate(appointment?.appointment_date)}</span>
            </div>
            <div style={s.infoBlock}>
              <span style={s.infoLabel}>Time</span>
              <span style={s.infoValue}>{formatTime(appointment?.appointment_time)}</span>
            </div>
          </div>

          {/* Combined preview */}
          {appointment?.appointment_date && appointment?.appointment_time && (
            <div style={s.datePreview}>
              <ClockIcon />
              <span style={{ marginLeft: 8, fontSize: 13, color: "#0369A1" }}>
                {new Date(`${appointment.appointment_date}T${appointment.appointment_time}`).toLocaleString("en-US", {
                  weekday: "long", year: "numeric", month: "long", day: "numeric",
                  hour: "2-digit", minute: "2-digit",
                })}
              </span>
            </div>
          )}
        </div>

        {/* Reason */}
        <div style={{ ...s.card, marginTop: 16 }}>
          <p style={s.sectionLabel}><NoteIcon /> Reason for visit</p>
          <p style={s.reasonText}>{appointment?.reason || "No reason provided"}</p>
        </div>

        {/* Metadata */}
        <div style={{ ...s.card, marginTop: 16 }}>
          <p style={s.sectionLabel}><InfoIcon /> Record info</p>
          <div style={s.grid2inner}>
            <div style={s.infoBlock}>
              <span style={s.infoLabel}>Created at</span>
              <span style={s.infoValue}>{formatDateTime(appointment?.created_at)}</span>
            </div>
            <div style={s.infoBlock}>
              <span style={s.infoLabel}>Last updated</span>
              <span style={s.infoValue}>{formatDateTime(appointment?.updated_at)}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div style={s.actions}>
          <button style={s.cancelBtn} onClick={() => navigate("/admin/appointments")}>
            Close
          </button>
          <button
            style={s.editBtn}
            onClick={() => navigate(`/admin/editappointment/${appointment?.id}`)}
          >
            <EditIcon /> Edit appointment
          </button>
        </div>

      </div>
    </div>
  );
}

/* ── Icons ── */
const ArrowLeftIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 12H5M12 5l-7 7 7 7" />
  </svg>
);
const UserIcon = ({ color = "currentColor" }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 6, verticalAlign: -2 }}>
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
  </svg>
);
const StethIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 6, verticalAlign: -2 }}>
    <path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6 6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3" />
    <path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4" />
    <circle cx="20" cy="10" r="2" />
  </svg>
);
const CalendarIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 6, verticalAlign: -2 }}>
    <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);
const ClockIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0369A1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
  </svg>
);
const NoteIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 6, verticalAlign: -2 }}>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
  </svg>
);
const InfoIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 6, verticalAlign: -2 }}>
    <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);
const EditIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

/* ── Styles ── */
const s = {
  page: { minHeight: "100vh", background: "#F4F7FC", padding: "32px 16px", boxSizing: "border-box" },
  container: { maxWidth: 680, margin: "0 auto" },
  loadingWrap: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", gap: 12 },
  spinner: { width: 28, height: 28, border: "2.5px solid #E2E8F0", borderTop: "2.5px solid #3B82F6", borderRadius: "50%", animation: "spin 0.75s linear infinite" },
  loadingText: { fontSize: 14, color: "#94A3B8" },
  header: { marginBottom: 24 },
  backBtn: { display: "inline-flex", alignItems: "center", gap: 6, background: "none", border: "none", padding: "4px 0", fontSize: 13, color: "#64748B", cursor: "pointer", marginBottom: 12, fontFamily: "inherit" },
  headerRow: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 },
  pageTitle: { fontSize: 22, fontWeight: 600, color: "#0F172A", margin: "0 0 4px" },
  pageSubtitle: { fontSize: 13, color: "#94A3B8", margin: 0 },
  statusPill: { display: "inline-block", fontSize: 12, fontWeight: 500, padding: "4px 12px", borderRadius: 20, flexShrink: 0, marginTop: 4 },
  grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 },
  grid2inner: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 },
  card: { background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: 12, padding: "20px 24px" },
  sectionLabel: { fontSize: 11, fontWeight: 600, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.07em", margin: "0 0 16px", display: "flex", alignItems: "center" },
  avatarRow: { display: "flex", alignItems: "center", gap: 12 },
  avatar: { width: 42, height: 42, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 600, flexShrink: 0 },
  personName: { fontSize: 15, fontWeight: 600, color: "#0F172A", margin: "0 0 3px" },
  personCode: { fontSize: 12, color: "#94A3B8", margin: 0, fontFamily: "monospace" },
  infoBlock: { display: "flex", flexDirection: "column", gap: 5 },
  infoLabel: { fontSize: 11, fontWeight: 600, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.06em" },
  infoValue: { fontSize: 14, fontWeight: 500, color: "#0F172A" },
  datePreview: { display: "flex", alignItems: "center", background: "#F0F9FF", border: "1px solid #BAE6FD", borderRadius: 8, padding: "10px 14px", marginTop: 16 },
  reasonText: { fontSize: 14, color: "#374151", lineHeight: 1.7, margin: 0 },
  actions: { display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 20 },
  cancelBtn: { padding: "10px 20px", borderRadius: 8, border: "1px solid #E2E8F0", background: "#FFFFFF", color: "#374151", fontSize: 14, fontWeight: 500, cursor: "pointer", fontFamily: "inherit" },
  editBtn: { display: "flex", alignItems: "center", gap: 7, padding: "10px 22px", borderRadius: 8, border: "none", background: "#2563EB", color: "#FFFFFF", fontSize: 14, fontWeight: 500, cursor: "pointer", fontFamily: "inherit" },
};

export default ViewAppointment;