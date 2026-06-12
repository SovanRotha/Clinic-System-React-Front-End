import PatientSidebar from "./PatientSidebar";
import { useState, useEffect } from "react";

function formatDate(dateStr) {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-US", {
        month: "long", day: "numeric", year: "numeric",
    });
}

function calcAge(dob) {
    if (!dob) return null;
    const b = new Date(dob), n = new Date();
    let a = n.getFullYear() - b.getFullYear();
    if (n < new Date(n.getFullYear(), b.getMonth(), b.getDate())) a--;
    return a;
}

function formatTime(t) {
    if (!t) return "—";
    return t.slice(0, 5);
}

function getInitials(code) {
    return (code || "").split(/[-\s]/).slice(0, 2).map(w => w[0] || "").join("").toUpperCase() || "DR";
}

// ── Small reusable pieces ──────────────────────────────────────────────────

function SectionHeading({ icon, label }) {
    return (
        <div style={{ display: "flex", alignItems: "center", gap: "7px", marginBottom: "14px" }}>
            <div style={{ fontSize: "15px" }}>{icon}</div>
            <span style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.09em", color: "#94a3b8" }}>
                {label}
            </span>
        </div>
    );
}

function Row({ label, value, mono = false }) {
    return (
        <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "flex-start",
            padding: "6px 0", borderBottom: "1px solid #f1f5f9", fontSize: "12.5px", gap: "8px",
        }}>
            <span style={{ color: "#94a3b8", flexShrink: 0 }}>{label}</span>
            <span style={{
                color: value ? "#1e293b" : "#c0c9d8",
                fontStyle: value ? "normal" : "italic",
                fontWeight: value ? 600 : 400,
                textAlign: "right",
                fontFamily: mono ? "monospace" : "inherit",
                maxWidth: "60%",
                wordBreak: "break-word",
                textTransform: "capitalize",
            }}>
                {value}
            </span>
        </div>
    );
}

function InfoBlock({ icon, label, value, accent = "#1a56db", bg = "#eff6ff", border = "#bfdbfe" }) {
    return (
        <div style={{
            background: "#fff", border: `1.5px solid ${border}`,
            borderRadius: "12px", padding: "14px 16px",
        }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                <div style={{
                    width: "28px", height: "28px", borderRadius: "8px",
                    background: bg, display: "flex", alignItems: "center",
                    justifyContent: "center", color: accent, flexShrink: 0,
                }}>
                    {icon}
                </div>
                <span style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#94a3b8" }}>
                    {label}
                </span>
            </div>
            <p style={{ fontSize: "13.5px", color: value ? "#374151" : "#c0c9d8", margin: 0, lineHeight: 1.6, fontStyle: value ? "normal" : "italic" }}>
                {value}
            </p>
        </div>
    );
}

function StatusDot({ status }) {
    const colors = { working: "#16a34a", available: "#1a56db", "on leave": "#d97706", inactive: "#9ca3af" };
    const color = colors[status?.toLowerCase()] || "#9ca3af";
    return (
        <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", textTransform: "capitalize", color: "#1e293b", fontWeight: 600 }}>
            <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: color, display: "inline-block" }} />
            {status || "—"}
        </span>
    );
}

// ── Main prescription card ─────────────────────────────────────────────────

function PrescriptionCard({ item, index }) {
    const [expanded, setExpanded] = useState(false);

    const d = item.doctor || {};
    const p = item.patient || {};
    const c = item.consultation || {};
    const age = calcAge(p.date_of_birth);

    return (
        <div style={{
            background: "#ffffff",
            border: "1.5px solid #e8edf5",
            borderRadius: "20px",
            overflow: "hidden",
            boxShadow: "0 2px 14px rgba(26,60,120,0.07)",
            marginBottom: "18px",
            transition: "box-shadow 0.2s, border-color 0.2s",
        }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 6px 28px rgba(26,60,120,0.13)"; e.currentTarget.style.borderColor = "#c5d3ea"; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 2px 14px rgba(26,60,120,0.07)"; e.currentTarget.style.borderColor = "#e8edf5"; }}
        >
            {/* Top accent bar */}
            <div style={{ height: "4px", background: "linear-gradient(90deg, #1a56db 0%, #38bdf8 100%)" }} />

            {/* Header */}
            <div style={{ padding: "20px 26px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                    <span style={{ fontSize: "11px", fontFamily: "monospace", fontWeight: 700, color: "#a0aec0", minWidth: "28px" }}>
                        #{String(index + 1).padStart(2, "0")}
                    </span>
                    <div style={{
                        width: "48px", height: "48px", borderRadius: "14px",
                        background: "linear-gradient(135deg, #0ea5e9 0%, #1a56db 100%)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "22px", boxShadow: "0 3px 10px rgba(26,86,219,0.28)", flexShrink: 0,
                    }}>
                        💊
                    </div>
                    <div>
                        <p style={{ fontSize: "18px", fontWeight: 800, color: "#0f172a", margin: 0, letterSpacing: "-0.3px" }}>
                            {item.medicine_name || "Unnamed Medicine"}
                        </p>
                        <p style={{ fontSize: "12px", color: "#94a3b8", margin: "2px 0 0", fontFamily: "monospace" }}>
                            Prescription #{item.id} · Consultation #{item.consultation_id}
                        </p>
                    </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                    {item.dosage && (
                        <span style={{
                            background: "linear-gradient(135deg,#eff6ff,#dbeafe)", border: "1.5px solid #bfdbfe",
                            color: "#1d4ed8", borderRadius: "10px", padding: "7px 14px", fontSize: "13px", fontWeight: 700,
                        }}>
                            {item.dosage}
                        </span>
                    )}
                    {item.duration_time && (
                        <span style={{
                            background: "#f0fdf9", border: "1.5px solid #99f6e4", color: "#0f766e",
                            borderRadius: "10px", padding: "7px 14px", fontSize: "13px", fontWeight: 700,
                            display: "flex", alignItems: "center", gap: "5px",
                        }}>
                            <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {item.duration_time}
                        </span>
                    )}
                    <button onClick={() => setExpanded(e => !e)} style={{
                        width: "36px", height: "36px", borderRadius: "10px", border: "1.5px solid #e2e8f0",
                        background: expanded ? "#eff6ff" : "#fafbfc", display: "flex", alignItems: "center",
                        justifyContent: "center", cursor: "pointer", color: expanded ? "#1a56db" : "#94a3b8", transition: "all 0.15s",
                    }}>
                        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"
                            style={{ transform: expanded ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Quick info chips */}
            <div style={{ padding: "0 26px 18px", display: "flex", flexWrap: "wrap", gap: "10px", borderTop: "1px solid #f1f5f9", paddingTop: "14px" }}>
                {/* Doctor chip */}
                <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "#f0f5ff", border: "1px solid #dbe9ff", borderRadius: "10px", padding: "7px 13px" }}>
                    <div style={{ width: "28px", height: "28px", borderRadius: "8px", background: "linear-gradient(135deg,#1a56db,#3b82f6)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "11px", fontWeight: 800 }}>
                        {getInitials(d.doctor_code)}
                    </div>
                    <div>
                        <p style={{ fontSize: "10px", color: "#93a3c0", margin: 0, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>Doctor</p>
                        <p style={{ fontSize: "13px", fontWeight: 700, color: "#1a56db", margin: 0 }}>{d.doctor_code || "—"}</p>
                    </div>
                </div>

                {/* Patient chip */}
                <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "7px 13px" }}>
                    <div style={{ width: "28px", height: "28px", borderRadius: "8px", background: "#e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px" }}>
                        🧑
                    </div>
                    <div>
                        <p style={{ fontSize: "10px", color: "#94a3b8", margin: 0, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>Patient</p>
                        <p style={{ fontSize: "13px", fontWeight: 700, color: "#374151", margin: 0 }}>
                            ID: {p.id || "—"} · {p.patient_code || "—"}
                        </p>
                    </div>
                </div>

                {/* Blood group chip */}
                {p.blood_group && (
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", background: "#fff5f5", border: "1px solid #fecaca", borderRadius: "10px", padding: "7px 13px" }}>
                        <span style={{ fontSize: "14px" }}>🩸</span>
                        <div>
                            <p style={{ fontSize: "10px", color: "#f87171", margin: 0, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>Blood Group</p>
                            <p style={{ fontSize: "13px", fontWeight: 700, color: "#c0392b", margin: 0 }}>{p.blood_group}</p>
                        </div>
                    </div>
                )}

                {/* Date chip */}
                <div style={{ display: "flex", alignItems: "center", gap: "6px", background: "#faf5ff", border: "1px solid #ddd6fe", borderRadius: "10px", padding: "7px 13px", marginLeft: "auto" }}>
                    <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="#7c3aed" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span style={{ fontSize: "13px", fontWeight: 600, color: "#7c3aed" }}>{formatDate(item.created_at)}</span>
                </div>
            </div>

            {/* ── Expanded Panel ── */}
            {expanded && (
                <div style={{ borderTop: "1.5px solid #e8edf5", background: "linear-gradient(180deg,#f8faff 0%,#f4f7ff 100%)", padding: "26px" }}>

                    {/* Consultation */}
                    <SectionHeading icon="🩺" label="Consultation" />
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "24px" }}>
                        <InfoBlock
                            icon={<svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
                            label="Symptoms" value={c.symptoms}
                            accent="#c0392b" bg="#fff5f5" border="#fecaca"
                        />
                        <InfoBlock
                            icon={<svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>}
                            label="Diagnosis" value={c.diagnosis}
                            accent="#1d4ed8" bg="#eff6ff" border="#bfdbfe"
                        />
                        <div style={{ gridColumn: "1 / -1" }}>
                            <InfoBlock
                                icon={<svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>}
                                label="Doctor's Notes" value={c.note}
                                accent="#0f766e" bg="#f0fdf9" border="#99f6e4"
                            />
                        </div>
                    </div>

                    {/* Divider */}
                    <div style={{ borderTop: "1.5px solid #e8edf5", margin: "0 0 24px" }} />

                    {/* Doctor + Patient side by side */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>

                        {/* Doctor */}
                        <div style={{ background: "#fff", border: "1.5px solid #bfdbfe", borderRadius: "14px", padding: "18px" }}>
                            <SectionHeading icon="👨‍⚕️" label="Doctor" />
                            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
                                <div style={{ width: "42px", height: "42px", borderRadius: "50%", background: "linear-gradient(135deg,#1a56db,#3b82f6)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "13px", fontWeight: 800, flexShrink: 0 }}>
                                    {getInitials(d.doctor_code)}
                                </div>
                                <div>
                                    <p style={{ fontSize: "15px", fontWeight: 700, color: "#0f172a", margin: 0 }}>{d.doctor_code || "—"}</p>
                                    <p style={{ fontSize: "11px", color: "#94a3b8", margin: "2px 0 0", fontFamily: "monospace" }}>Doctor ID: {d.id || "—"}</p>
                                </div>
                            </div>
                            <Row label="📅 Working Days" value={d.working_day} />
                            <Row label="🕐 Hours" value={d.start_time && d.end_time ? `${formatTime(d.start_time)} – ${formatTime(d.end_time)}` : null} />
                            <Row label="🔵 Status" value={null}  />
                            <div style={{ marginTop: "-22px", display: "flex", justifyContent: "flex-end", paddingBottom: "6px", borderBottom: "1px solid #f1f5f9" }}>
                                <StatusDot status={d.status} />
                            </div>
                            <Row label="👤 User ID" value={d.user_id ? `#${d.user_id}` : null} mono />
                        </div>

                        {/* Patient */}
                        <div style={{ background: "#fff", border: "1.5px solid #fecaca", borderRadius: "14px", padding: "18px" }}>
                            <SectionHeading icon="🧑" label="Patient" />
                            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
                                <div style={{ width: "42px", height: "42px", borderRadius: "50%", background: "linear-gradient(135deg,#f87171,#ef4444)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "13px", fontWeight: 800, flexShrink: 0 }}>
                                    {(p.patient_code || "PT").slice(0, 2).toUpperCase()}
                                </div>
                                <div>
                                    <p style={{ fontSize: "15px", fontWeight: 700, color: "#0f172a", margin: 0 }}>{p.patient_code || "—"}</p>
                                    <p style={{ fontSize: "11px", color: "#94a3b8", margin: "2px 0 0", fontFamily: "monospace" }}>Patient ID: {p.id || "—"}</p>
                                </div>
                            </div>
                            <Row label="⚧ Gender" value={p.gender} />
                            <Row label="🎂 Date of Birth" value={p.date_of_birth ? `${formatDate(p.date_of_birth)}${age !== null ? ` (${age} yrs)` : ""}` : null} />
                            <Row label="🩸 Blood Group" value={p.blood_group} />
                            <Row label="📍 Address" value={p.address} />
                            <Row label="👤 User ID" value={p.user_id ? `#${p.user_id}` : null} mono />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// ── Page ───────────────────────────────────────────────────────────────────

export default function PatientPrescriptions() {
    const [prescriptions, setPrescriptions] = useState([]);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        const user = storedUser ? JSON.parse(storedUser) : null;
        const token = localStorage.getItem("token");

        if (!user?.id || !token) { setError("Missing authentication."); setLoading(false); return; }

        fetch("http://127.0.0.1:8000/api/my-prescriptions", {
            headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
        })
            .then(res => { if (!res.ok) throw new Error(); return res.json(); })
            .then(data => {
                const items = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
                setPrescriptions(items);
            })
            .catch(() => setError("Failed to load prescriptions."))
            .finally(() => setLoading(false));
    }, []);

    const filtered = prescriptions.filter(p => {
        const q = search.toLowerCase();
        return !q ||
            p.medicine_name?.toLowerCase().includes(q) ||
            p.doctor?.doctor_code?.toLowerCase().includes(q) ||
            p.consultation?.diagnosis?.toLowerCase().includes(q) ||
            p.consultation?.symptoms?.toLowerCase().includes(q) ||
            p.patient?.patient_code?.toLowerCase().includes(q);
    });

    return (
        <div style={{ display: "flex", minHeight: "100vh", background: "#f0f4fb", fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
            <PatientSidebar />

            <main style={{ flex: 1, display: "flex", marginLeft: 40, padding: "40px 32px", overflowY: "auto" }}>
                <div style={{ width: "100%", maxWidth: "900px" }}>

                    {/* Header */}
                    <div style={{ marginBottom: "36px" }}>
                        <p style={{ fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#94a3b8", marginBottom: "6px" }}>
                            Patient Portal
                        </p>
                        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
                            <div>
                                <h1 style={{ fontSize: "32px", fontWeight: 800, color: "#0f172a", margin: 0, letterSpacing: "-0.5px" }}>
                                    My Prescriptions
                                </h1>
                                <p style={{ fontSize: "14px", color: "#64748b", margin: "6px 0 0" }}>
                                    Medicines and medical instructions from your doctors
                                </p>
                            </div>
                            {prescriptions.length > 0 && (
                                <span style={{
                                    background: "#1a56db", color: "#fff", borderRadius: "10px",
                                    padding: "7px 16px", fontSize: "13px", fontWeight: 700,
                                    boxShadow: "0 3px 10px rgba(26,86,219,0.25)",
                                }}>
                                    {prescriptions.length} Prescription{prescriptions.length !== 1 ? "s" : ""}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Loading */}
                    {loading && (
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "80px 0", gap: "12px", color: "#94a3b8" }}>
                            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" style={{ animation: "spin 1s linear infinite" }}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
                            <span style={{ fontSize: "14px", fontWeight: 500 }}>Loading prescriptions…</span>
                        </div>
                    )}

                    {/* Error */}
                    {error && (
                        <div style={{
                            display: "flex", alignItems: "center", gap: "12px",
                            background: "#fff5f5", border: "1.5px solid #fca5a5",
                            color: "#b91c1c", padding: "14px 18px",
                            borderRadius: "14px", marginBottom: "24px", fontSize: "14px", fontWeight: 500,
                        }}>
                            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {error}
                        </div>
                    )}

                    {/* Search */}
                    {!loading && prescriptions.length > 0 && (
                        <div style={{ position: "relative", marginBottom: "28px" }}>
                            <svg style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }}
                                width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input
                                type="text"
                                placeholder="Search by medicine, doctor, patient code, or diagnosis…"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                style={{
                                    width: "100%", paddingLeft: "46px", paddingRight: "16px",
                                    paddingTop: "13px", paddingBottom: "13px",
                                    background: "#fff", border: "1.5px solid #e2e8f0",
                                    borderRadius: "14px", fontSize: "14px", color: "#374151",
                                    outline: "none", boxSizing: "border-box",
                                    boxShadow: "0 1px 6px rgba(0,0,0,0.05)",
                                }}
                            />
                        </div>
                    )}

                    {/* Cards */}
                    {!loading && (
                        filtered.length === 0 ? (
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "14px", padding: "80px 0", color: "#94a3b8" }}>
                                <div style={{ width: "64px", height: "64px", borderRadius: "18px", background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "28px" }}>
                                    💊
                                </div>
                                <p style={{ fontSize: "15px", fontWeight: 600, color: "#64748b", margin: 0 }}>
                                    {search ? "No prescriptions match your search." : "No prescriptions found."}
                                </p>
                                {search && (
                                    <button onClick={() => setSearch("")} style={{ fontSize: "13px", color: "#1a56db", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>
                                        Clear search
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div>
                                {filtered.map((item, i) => (
                                    <PrescriptionCard key={item.id} item={item} index={i} />
                                ))}
                            </div>
                        )
                    )}

                    {/* Footer */}
                    {!loading && filtered.length > 0 && (
                        <p style={{ textAlign: "center", fontSize: "13px", color: "#94a3b8", marginTop: "8px" }}>
                            Showing <strong style={{ color: "#64748b" }}>{filtered.length}</strong> of{" "}
                            <strong style={{ color: "#64748b" }}>{prescriptions.length}</strong> prescriptions
                        </p>
                    )}
                </div>
            </main>
        </div>
    );
}