import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

function EditAppointment() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [editAppointment, setEditAppointment] = useState({
    patient_id: "",
    doctor_id: "",
    appointment_date: "",
    appointment_time: "",
    reason: "",
    status: "pending",
  });

  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("Authentication token missing");
        }

        const appointmentRes = await fetch(`https://clinic-system-back-end.onrender.com/api/appointment/${id}`, {
          headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
        });
        if (!appointmentRes.ok) {
          throw new Error("Failed to load appointment data");
        }

        const appointmentData = await appointmentRes.json().catch(() => ({}));
        const appointment = appointmentData.data || appointmentData.appointment;
        setEditAppointment({
          patient_id: appointment.patient_id || "",
          doctor_id: appointment.doctor_id || "",
          appointment_date: appointment.appointment_date || "",
          appointment_time: appointment.appointment_time ? appointment.appointment_time.slice(0, 5) : "",
          reason: appointment.reason || "",
          status: (appointment.status || "pending").toLowerCase(),
        });

        const [doctorRes, patientRes] = await Promise.all([
          fetch("https://clinic-system-back-end.onrender.com/api/doctor", { headers: { Authorization: `Bearer ${token}` } }),
          fetch("https://clinic-system-back-end.onrender.com/api/patients", { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        if (!doctorRes.ok || !patientRes.ok) {
          throw new Error("Failed to load patient or doctor options");
        }

        const doctorData = await doctorRes.json().catch(() => ({}));
        const patientData = await patientRes.json().catch(() => ({}));
        setDoctors(doctorData.doctors || doctorData.data || []);
        setPatients(patientData.patients || patientData.data || []);
      } catch (error) {
        console.error(error);
        alert(error.message || "Failed to load appointment data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditAppointment((prev) => ({ ...prev, [name]: value }));
  };

  const setStatus = (status) => {
    setEditAppointment((prev) => ({ ...prev, status }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!editAppointment.patient_id || !editAppointment.doctor_id || !editAppointment.appointment_date || !editAppointment.appointment_time) {
      alert("Patient, doctor, date, and time are required");
      return;
    }
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Authentication token missing");
      const payload = {
        ...editAppointment,
        patient_id: Number(editAppointment.patient_id),
        doctor_id: Number(editAppointment.doctor_id),
      };
      const response = await fetch(`https://clinic-system-back-end.onrender.com/api/appointment/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Accept: "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || data.message || "Update failed");
      navigate("/admin/appointments");
    } catch (error) {
      console.error("Error updating appointment:", error);
      alert(error.message);
    } finally {
      setSaving(false);
    }
  };

  const statusConfig = {
    pending:   { label: "Pending",   color: "#A16207", bg: "#FEFCE8", border: "#FDE047", icon: <ClockIcon /> },
    confirmed: { label: "Confirmed", color: "#15803D", bg: "#F0FDF4", border: "#86EFAC", icon: <CheckIcon /> },
    cancelled: { label: "Cancelled", color: "#B91C1C", bg: "#FEF2F2", border: "#FCA5A5", icon: <XIcon /> },
  };

  const currentStatus = statusConfig[editAppointment.status] || statusConfig.pending;

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
              <h1 style={s.pageTitle}>Edit Appointment</h1>
              <p style={s.pageSubtitle}>Appointment #{id} · Update details below</p>
            </div>
            <span style={{ ...s.statusPill, background: currentStatus.bg, color: currentStatus.color, border: `1px solid ${currentStatus.border}` }}>
              {currentStatus.label}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit}>

          {/* Section: Patient & Doctor */}
          <div style={s.card}>
            <p style={s.sectionLabel}><UserIcon /> Patient &amp; doctor</p>
            <div style={s.grid2}>
              <div style={s.field}>
                <label style={s.label}>Patient</label>
                <div style={s.selectWrap}>
                  <select name="patient_id" value={editAppointment.patient_id} onChange={handleChange} style={s.select} required>
                    <option value="">Select patient</option>
                    {patients.map((p) => (
                      <option key={p.id} value={p.id}>{p.patient_code} — {p.user?.name}</option>
                    ))}
                  </select>
                  <ChevronIcon />
                </div>
              </div>
              <div style={s.field}>
                <label style={s.label}>Doctor</label>
                <div style={s.selectWrap}>
                  <select name="doctor_id" value={editAppointment.doctor_id} onChange={handleChange} style={s.select} required>
                    <option value="">Select doctor</option>
                    {doctors.map((d) => (
                      <option key={d.id} value={d.id}>{d.doctor_code} — Dr. {d.user?.name}</option>
                    ))}
                  </select>
                  <ChevronIcon />
                </div>
              </div>
            </div>
          </div>

          {/* Section: Date & Time */}
          <div style={{ ...s.card, marginTop: 16 }}>
            <p style={s.sectionLabel}><CalendarIcon /> Date &amp; time</p>
            <div style={s.grid2}>
              <div style={s.field}>
                <label style={s.label}>Appointment date</label>
                <input
                  type="date"
                  name="appointment_date"
                  value={editAppointment.appointment_date}
                  onChange={handleChange}
                  style={s.input}
                  required
                  onFocus={e => Object.assign(e.target.style, s.inputFocus)}
                  onBlur={e => Object.assign(e.target.style, { borderColor: "#E2E8F0", boxShadow: "none" })}
                />
              </div>
              <div style={s.field}>
                <label style={s.label}>Appointment time</label>
                <input
                  type="time"
                  name="appointment_time"
                  value={editAppointment.appointment_time}
                  onChange={handleChange}
                  style={s.input}
                  required
                  onFocus={e => Object.assign(e.target.style, s.inputFocus)}
                  onBlur={e => Object.assign(e.target.style, { borderColor: "#E2E8F0", boxShadow: "none" })}
                />
              </div>
            </div>

            {/* Date/time preview */}
            {editAppointment.appointment_date && editAppointment.appointment_time && (
              <div style={s.datePreview}>
                <CalendarIcon />
                <span style={{ marginLeft: 8, fontSize: 13, color: "#374151" }}>
                  {new Date(`${editAppointment.appointment_date}T${editAppointment.appointment_time}`).toLocaleString("en-US", {
                    weekday: "long", year: "numeric", month: "long", day: "numeric",
                    hour: "2-digit", minute: "2-digit",
                  })}
                </span>
              </div>
            )}
          </div>

          {/* Section: Status */}
          <div style={{ ...s.card, marginTop: 16 }}>
            <p style={s.sectionLabel}><CheckIcon /> Appointment status</p>
            <div style={s.statusToggle}>
              {Object.entries(statusConfig).map(([key, cfg]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setStatus(key)}
                  style={{
                    ...s.statusBtn,
                    ...(editAppointment.status === key
                      ? { background: cfg.bg, borderColor: cfg.border, color: cfg.color }
                      : s.statusBtnInactive),
                  }}
                >
                  {cfg.icon}
                  {cfg.label}
                </button>
              ))}
            </div>
            <p style={s.statusHint}>
              {editAppointment.status === "pending" && "Waiting for confirmation from the doctor or admin."}
              {editAppointment.status === "confirmed" && "This appointment is confirmed and scheduled."}
              {editAppointment.status === "cancelled" && "This appointment has been cancelled."}
            </p>
          </div>

          {/* Section: Reason */}
          <div style={{ ...s.card, marginTop: 16 }}>
            <p style={s.sectionLabel}><NoteIcon /> Reason for visit</p>
            <textarea
              name="reason"
              value={editAppointment.reason}
              onChange={handleChange}
              rows={4}
              placeholder="Describe the reason for this appointment…"
              style={s.textarea}
              onFocus={e => Object.assign(e.target.style, s.inputFocus)}
              onBlur={e => Object.assign(e.target.style, { borderColor: "#E2E8F0", boxShadow: "none" })}
            />
          </div>

          {/* Actions */}
          <div style={s.actions}>
            <button type="button" style={s.cancelBtn} onClick={() => navigate("/admin/appointments")}>
              Cancel
            </button>
            <button type="submit" style={{ ...s.saveBtn, opacity: saving ? 0.7 : 1 }} disabled={saving}>
              {saving ? (
                <><div style={s.btnSpinner} /> Saving…</>
              ) : (
                <><SaveIcon /> Update appointment</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ── Inline SVG icons ── */
const ArrowLeftIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 12H5M12 5l-7 7 7 7" />
  </svg>
);
const UserIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 6, verticalAlign: -2 }}>
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
  </svg>
);
const CalendarIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 6, verticalAlign: -2 }}>
    <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);
const ClockIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
  </svg>
);
const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 6, verticalAlign: -2 }}>
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);
const XIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
  </svg>
);
const NoteIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 6, verticalAlign: -2 }}>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
  </svg>
);
const SaveIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" />
  </svg>
);
const ChevronIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
    <polyline points="6 9 12 15 18 9" />
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
  card: { background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: 12, padding: "20px 24px" },
  sectionLabel: { fontSize: 11, fontWeight: 600, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.07em", margin: "0 0 16px", display: "flex", alignItems: "center" },
  grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 },
  field: { display: "flex", flexDirection: "column", gap: 6 },
  label: { fontSize: 13, fontWeight: 500, color: "#374151" },
  selectWrap: { position: "relative" },
  select: { width: "100%", boxSizing: "border-box", border: "1px solid #E2E8F0", borderRadius: 8, padding: "9px 36px 9px 12px", fontSize: 14, color: "#0F172A", background: "#F8FAFC", fontFamily: "inherit", outline: "none", appearance: "none", cursor: "pointer" },
  input: { width: "100%", boxSizing: "border-box", border: "1px solid #E2E8F0", borderRadius: 8, padding: "9px 12px", fontSize: 14, color: "#0F172A", background: "#F8FAFC", fontFamily: "inherit", outline: "none" },
  inputFocus: { borderColor: "#3B82F6", boxShadow: "0 0 0 3px rgba(59,130,246,0.12)" },
  datePreview: { display: "flex", alignItems: "center", background: "#F0F9FF", border: "1px solid #BAE6FD", borderRadius: 8, padding: "10px 14px", marginTop: 16, color: "#0369A1" },
  statusToggle: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 12 },
  statusBtn: { display: "flex", alignItems: "center", justifyContent: "center", gap: 7, padding: "10px 12px", borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: "pointer", fontFamily: "inherit", border: "1.5px solid", transition: "all 0.15s" },
  statusBtnInactive: { background: "#F8FAFC", borderColor: "#E2E8F0", color: "#94A3B8" },
  statusHint: { fontSize: 12, color: "#94A3B8", margin: 0, lineHeight: 1.5 },
  textarea: { width: "100%", boxSizing: "border-box", border: "1px solid #E2E8F0", borderRadius: 8, padding: "10px 12px", fontSize: 14, color: "#0F172A", background: "#F8FAFC", fontFamily: "inherit", outline: "none", resize: "vertical", lineHeight: 1.6 },
  actions: { display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 20 },
  cancelBtn: { padding: "10px 20px", borderRadius: 8, border: "1px solid #E2E8F0", background: "#FFFFFF", color: "#374151", fontSize: 14, fontWeight: 500, cursor: "pointer", fontFamily: "inherit" },
  saveBtn: { display: "flex", alignItems: "center", gap: 7, padding: "10px 22px", borderRadius: 8, border: "none", background: "#2563EB", color: "#FFFFFF", fontSize: 14, fontWeight: 500, cursor: "pointer", fontFamily: "inherit" },
  btnSpinner: { width: 14, height: 14, border: "2px solid rgba(255,255,255,0.35)", borderTop: "2px solid #fff", borderRadius: "50%", animation: "spin 0.75s linear infinite" },
};

export default EditAppointment;