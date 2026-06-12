import DoctorSidebar from "../Doctor/DoctorSidebar";
import { useState, useEffect } from "react";
import { useLocation, useParams } from "react-router-dom";

const API_BASE = "http://127.0.0.1:8000";
const BLUE = "#1a3bcc";

function calcAge(dob) {
  if (!dob) return "—";
  const d = new Date(dob), now = new Date();
  let age = now.getFullYear() - d.getFullYear();
  if (now < new Date(now.getFullYear(), d.getMonth(), d.getDate())) age--;
  return age;
}

function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

function formatTime(timeStr) {
  if (!timeStr) return "—";
  const [h, m] = timeStr.split(":");
  const hour = parseInt(h);
  return `${hour % 12 || 12}:${m} ${hour >= 12 ? "PM" : "AM"}`;
}

function initials(name = "") {
  return name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
}

function statusColor(status) {
  const map = { pending: "#f59e0b", confirmed: "#22c55e", cancelled: "#ef4444", completed: "#6b7280" };
  return map[status?.toLowerCase()] || "#9ca3af";
}

function Field({ label, children }) {
  return (
    <div>
      <p style={{ fontSize: 13, color: "#6b7280", margin: "0 0 6px", textTransform: "uppercase", letterSpacing: "0.03em", fontWeight: 500 }}>{label}</p>
      {children}
    </div>
  );
}

const inputStyle = {
  width: "100%",
  background: "#f9fafb",
  border: "0.5px solid #e5e7eb",
  borderRadius: 9,
  padding: "11px 14px",
  fontSize: 15,
  color: "#111827",
  boxSizing: "border-box",
  fontFamily: "inherit",
};

function ConsultationDetail({ consultation }) {
  if (!consultation) return <p>No consultation data available.</p>;
  
  const { appointment, patient, doctor } = consultation;
  const patientName = patient?.user?.name || patient?.name || patient?.patient_code || "Unknown patient";
  const doctorName = doctor?.user?.name || doctor?.doctor_code || "Doctor";
  const isFemale = patient?.gender === "female";
  const avatarBg = isFemale ? "#fde8f0" : "#e6f1fb";
  const avatarColor = isFemale ? "#993556" : "#185FA5";

  const [symptoms, setSymptoms] = useState(consultation.symptoms || "");
  const [diagnosis, setDiagnosis] = useState(consultation.diagnosis || "");
  const [note, setNote] = useState(consultation.note || "");
  const [medicine, setMedicine] = useState("");
  const [dosage, setDosage] = useState("");
  const [frequency, setFrequency] = useState("");
  const [duration, setDuration] = useState("");
  const [prescriptions, setPrescriptions] = useState([
    { id: 1, name: "Lisinopril", dosage: "10mg", frequency: "Once daily", duration: "30 days" },
    { id: 2, name: "Aspirin low dose", dosage: "81mg", frequency: "Once daily", duration: "90 days" },
  ]);

  const addPrescription = () => {
    if (!medicine.trim()) return;
    setPrescriptions(p => [...p, { id: Date.now(), name: medicine, dosage, frequency, duration }]);
    setMedicine(""); setDosage(""); setFrequency(""); setDuration("");
  };

  const removePrescription = (id) => setPrescriptions(p => p.filter(x => x.id !== id));

  return (
    <div style={{ display: "flex", flex: 1, gap: 18, padding: 20, minWidth: 0 }}>

      {/* Left column */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 16, minWidth: 0 }}>

        {/* Patient header card */}
        <div style={{ background: "#fff", border: "0.5px solid #e5e7eb", borderRadius: 14, padding: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap" }}>
            <div style={{
              width: 68, height: 68, borderRadius: 14, background: avatarBg, color: avatarColor,
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 500, flexShrink: 0,
            }}>
              {initials(patientName)}
            </div>
            <div>
              <p style={{ fontSize: 20, fontWeight: 500, color: "#111827", margin: "0 0 4px" }}>{patientName}</p>
              <p style={{ fontSize: 15, color: "#6b7280", margin: "0 0 3px" }}>
                Patient ID: {patient?.patient_code} &nbsp;•&nbsp; {patient?.gender}, {calcAge(patient?.date_of_birth)} yrs
              </p>
              <p style={{ fontSize: 15, color: "#6b7280", margin: "0 0 3px" }}>
                Doctor: {doctorName}
              </p>
              <p style={{ fontSize: 15, color: "#6b7280", margin: "0 0 3px" }}>
                <i className="ti ti-droplet" aria-hidden="true" style={{ fontSize: 15, color: "#e05252", verticalAlign: "-2px" }} />
                Blood Group: {patient?.blood_group}
              </p>
            </div>
            <Divider />
            <div>
              <p style={{ fontSize: 13, color: "#9ca3af", margin: "0 0 5px", textTransform: "uppercase", letterSpacing: "0.04em" }}>Appointment date</p>
              <p style={{ fontSize: 17, fontWeight: 500, color: "#111827", margin: "0 0 3px" }}>{formatDate(appointment?.appointment_date)}</p>
              <p style={{ fontSize: 15, color: "#6b7280", margin: 0 }}>{formatTime(appointment?.appointment_time)}</p>
            </div>
            <Divider />
            <div>
              <p style={{ fontSize: 13, color: "#9ca3af", margin: "0 0 5px", textTransform: "uppercase", letterSpacing: "0.04em" }}>Reason</p>
              <p style={{ fontSize: 15, fontWeight: 500, color: "#111827", margin: 0, maxWidth: 140 }}>{appointment?.reason || "—"}</p>
            </div>
            <Divider />
            <div>
              <p style={{ fontSize: 13, color: "#9ca3af", margin: "0 0 5px", textTransform: "uppercase", letterSpacing: "0.04em" }}>Status</p>
              <p style={{ fontSize: 15, fontWeight: 500, color: "#111827", margin: "0 0 6px", display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ width: 9, height: 9, borderRadius: "50%", background: statusColor(appointment?.status), display: "inline-block" }} />
                {appointment?.status ? appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1) : "—"}
              </p>
              <p style={{ fontSize: 13, color: "#9ca3af", margin: "0 0 3px", textTransform: "uppercase", letterSpacing: "0.04em" }}>Address</p>
              <p style={{ fontSize: 15, fontWeight: 500, color: "#111827", margin: 0 }}>{patient?.address || "—"}</p>
            </div>
          </div>
        </div>

        {/* Consultation form */}
        <div style={{ background: "#fff", border: "0.5px solid #e5e7eb", borderRadius: 14, padding: 20 }}>
          <p style={{ fontSize: 18, fontWeight: 500, color: "#111827", margin: "0 0 18px", display: "flex", alignItems: "center", gap: 8 }}>
            <i className="ti ti-notes-medical" aria-hidden="true" style={{ fontSize: 20, color: BLUE }} />
            Consultation details
          </p>

          <Field label="Presenting symptoms">
            <textarea
              style={{ ...inputStyle, resize: "vertical", marginBottom: 14 }}
              rows={3}
              value={symptoms}
              onChange={e => setSymptoms(e.target.value)}
              placeholder="Describe patient symptoms here…"
            />
          </Field>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
            <Field label="Patient complaints">
              <textarea style={{ ...inputStyle, resize: "vertical" }} rows={3} placeholder="Direct patient quotes or reported issues…" />
            </Field>
            <Field label="Clinical findings">
              <textarea style={{ ...inputStyle, resize: "vertical" }} rows={3} placeholder="Observations from physical examination…" />
            </Field>
          </div>

          <Field label="Diagnosis / ICD-10 code">
            <div style={{ position: "relative", marginBottom: 14 }}>
              <input
                type="text"
                style={{ ...inputStyle, paddingRight: 40 }}
                value={diagnosis}
                onChange={e => setDiagnosis(e.target.value)}
                placeholder="Start typing diagnosis or ICD-10 code…"
              />
              <i className="ti ti-search" aria-hidden="true" style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", fontSize: 18, color: "#9ca3af" }} />
            </div>
          </Field>

          <Field label="Treatment plan & follow-up notes">
            <textarea
              style={{ ...inputStyle, resize: "vertical" }}
              rows={4}
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="Outline the recommended treatment path…"
            />
          </Field>
        </div>
      </div>

      {/* Right column */}
      <div style={{ width: 280, flexShrink: 0, display: "flex", flexDirection: "column", gap: 14 }}>
        <button style={{
          width: "100%", padding: "13px", borderRadius: 10, background: BLUE, border: "none",
          color: "#fff", fontSize: 15, fontWeight: 500, cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
        }}>
          <i className="ti ti-printer" aria-hidden="true" style={{ fontSize: 18 }} />
          Complete & print prescription
        </button>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {["Save draft", "Save consultation"].map(label => (
            <button key={label} style={{
              padding: "11px 8px", borderRadius: 10, background: "#fff", border: "0.5px solid #e5e7eb",
              color: "#374151", fontSize: 14, cursor: "pointer", fontFamily: "inherit",
            }}>{label}</button>
          ))}
        </div>

        {/* Prescription builder */}
        <div style={{ background: "#fff", border: "0.5px solid #e5e7eb", borderRadius: 14, padding: 16 }}>
          <p style={{ fontSize: 17, fontWeight: 500, color: "#111827", margin: "0 0 14px", display: "flex", alignItems: "center", gap: 8 }}>
            <i className="ti ti-prescription" aria-hidden="true" style={{ fontSize: 18, color: BLUE }} />
            Prescription builder
          </p>
          <Field label="Medicine name">
            <input type="text" style={{ ...inputStyle, marginBottom: 10 }} placeholder="Search medicine…" value={medicine} onChange={e => setMedicine(e.target.value)} />
          </Field>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 10 }}>
            <Field label="Dosage">
              <input type="text" style={inputStyle} placeholder="e.g. 500mg" value={dosage} onChange={e => setDosage(e.target.value)} />
            </Field>
            <Field label="Frequency">
              <input type="text" style={inputStyle} placeholder="Once daily" value={frequency} onChange={e => setFrequency(e.target.value)} />
            </Field>
          </div>
          <Field label="Duration">
            <input type="text" style={{ ...inputStyle, marginBottom: 12 }} placeholder="e.g. 7 days" value={duration} onChange={e => setDuration(e.target.value)} />
          </Field>
          <button onClick={addPrescription} style={{
            width: "100%", padding: "11px", borderRadius: 10, background: BLUE, border: "none",
            color: "#fff", fontSize: 15, fontWeight: 500, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            fontFamily: "inherit",
          }}>
            <i className="ti ti-plus" aria-hidden="true" style={{ fontSize: 17 }} /> Add to prescription
          </button>
        </div>

        {/* Current prescriptions */}
        <div style={{ background: "#fff", border: "0.5px solid #e5e7eb", borderRadius: 14, padding: 16 }}>
          <p style={{ fontSize: 13, color: "#6b7280", margin: "0 0 12px", textTransform: "uppercase", letterSpacing: "0.04em", fontWeight: 500 }}>Current prescription</p>
          {prescriptions && prescriptions.map(rx => (
            rx && rx.id && (
            <div key={rx.id} style={{
              display: "flex", alignItems: "flex-start", gap: 10, background: "#f9fafb",
              border: "0.5px solid #e5e7eb", borderRadius: 9, padding: 11, marginBottom: 10,
            }}>
              <div style={{ width: 34, height: 34, borderRadius: 8, background: "#e6f1fb", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <i className="ti ti-pill" aria-hidden="true" style={{ fontSize: 17, color: "#185FA5" }} />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 15, fontWeight: 500, color: "#111827", margin: "0 0 2px" }}>{rx.name}</p>
                <p style={{ fontSize: 13, color: "#6b7280", margin: 0 }}>{rx.dosage} • {rx.frequency} • {rx.duration}</p>
              </div>
              <i className="ti ti-trash" aria-hidden="true" onClick={() => removePrescription(rx.id)}
                style={{ fontSize: 17, color: "#e05252", cursor: "pointer", marginTop: 2 }} />
            </div>
            )
          ))}
          <div style={{ background: "#d1fae5", border: "0.5px solid #a7f3d0", borderRadius: 9, padding: "10px 13px", display: "flex", alignItems: "center", gap: 8 }}>
            <i className="ti ti-circle-check" aria-hidden="true" style={{ fontSize: 18, color: "#065f46", flexShrink: 0 }} />
            <span style={{ fontSize: 13, color: "#065f46" }}>Interaction check passed. No known conflicts found.</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function Divider() {
  return <div style={{ width: "0.5px", background: "#e5e7eb", alignSelf: "stretch", margin: "0 8px" }} />;
}

export default function DoctorConsultation() {
  const { id } = useParams();
  const location = useLocation();
  const [consultation, setConsultation] = useState(location.state?.consultation || null);
  const [loading, setLoading] = useState(!location.state?.consultation);
  const [error, setError] = useState("");
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (consultation) { setLoading(false); return; }
    if (!token) { setError("Authentication token is missing."); setLoading(false); return; }
    if (!id) { setError("No consultation ID provided."); setLoading(false); return; }
    const fetchConsultation = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/ConsultationDoctor/${id}`, {
          headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
        });
        if (!res.ok) { 
          const data = await res.json();
          setError(data.message || "Failed to load consultation.");
          return;
        }
        const data = await res.json();
        setConsultation(data?.data ?? data);
      } catch {
        setError("Unable to fetch consultation. Check if the backend is running.");
      } finally {
        setLoading(false);
      }
    };
    fetchConsultation();
  }, [token, id, consultation]);

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f3f4f6", fontSize: 15 }}>
      <DoctorSidebar />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>

        {/* Top bar */}
        <div style={{ background: "#fff", borderBottom: "0.5px solid #e5e7eb", padding: "13px 20px", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 9, background: "#f3f4f6", borderRadius: 9, padding: "8px 14px" }}>
            <i className="ti ti-search" aria-hidden="true" style={{ fontSize: 18, color: "#9ca3af" }} />
            <span style={{ fontSize: 15, color: "#9ca3af" }}>Search patient name, ID, or file…</span>
          </div>
          <i className="ti ti-bell" aria-hidden="true" style={{ fontSize: 22, color: "#6b7280" }} />
          <i className="ti ti-help-circle" aria-hidden="true" style={{ fontSize: 22, color: "#6b7280" }} />
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ textAlign: "right" }}>
              <p style={{ fontSize: 15, fontWeight: 500, color: "#111827", margin: 0 }}>Dr. Sarah Smith</p>
              <p style={{ fontSize: 13, color: "#6b7280", margin: 0 }}>Senior Cardiologist</p>
            </div>
            <div style={{ width: 38, height: 38, borderRadius: "50%", background: "#e6f1fb", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 500, color: "#185FA5" }}>SS</div>
          </div>
        </div>

        {loading ? (
          <p style={{ padding: 24, color: "#6b7280", fontSize: 17 }}>Loading consultation…</p>
        ) : error ? (
          <p style={{ padding: 24, color: "#e05252", fontSize: 17 }}>{error}</p>
        ) : !consultation ? (
          <p style={{ padding: 24, color: "#6b7280", fontSize: 17 }}>No consultation found.</p>
        ) : (
          <ConsultationDetail consultation={consultation} />
        )}
      </div>
    </div>
  );
}