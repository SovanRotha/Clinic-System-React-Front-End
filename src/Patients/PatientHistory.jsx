import PatientSidebar from "./PatientSidebar";
import { useState, useEffect } from "react";

function formatDate(dateStr) {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
    });
}

function ConsultationCard({ consultation, index }) {
    const [expanded, setExpanded] = useState(false);

    const date = consultation.appointment?.appointment_date
        ? formatDate(consultation.appointment.appointment_date)
        : formatDate(consultation.created_at);

    const doctorCode = consultation.doctor?.doctor_code || "Unknown Doctor";

    const initials = doctorCode
        .split(/[-\s]/)
        .slice(0, 2)
        .map((w) => w[0])
        .join("")
        .toUpperCase();

    return (
        <div
            style={{
                background: "#ffffff",
                border: "1.5px solid #e8edf5",
                borderRadius: "20px",
                overflow: "hidden",
                boxShadow: "0 2px 12px rgba(30,60,120,0.06)",
                transition: "box-shadow 0.2s, border-color 0.2s",
                marginBottom: "16px",
            }}
            onMouseEnter={e => {
                e.currentTarget.style.boxShadow = "0 6px 28px rgba(30,60,120,0.11)";
                e.currentTarget.style.borderColor = "#c5d3ea";
            }}
            onMouseLeave={e => {
                e.currentTarget.style.boxShadow = "0 2px 12px rgba(30,60,120,0.06)";
                e.currentTarget.style.borderColor = "#e8edf5";
            }}
        >
            {/* Card Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "22px 28px 18px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                    {/* Index */}
                    <span style={{ fontSize: "12px", fontFamily: "monospace", color: "#a0aec0", fontWeight: 700, minWidth: "32px" }}>
                        #{String(index + 1).padStart(2, "0")}
                    </span>

                    {/* Doctor avatar */}
                    <div style={{
                        width: "46px", height: "46px", borderRadius: "14px",
                        background: "linear-gradient(135deg, #1a56db 0%, #3b82f6 100%)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        color: "#fff", fontWeight: 800, fontSize: "15px", letterSpacing: "0.5px",
                        boxShadow: "0 3px 10px rgba(26,86,219,0.25)",
                        flexShrink: 0
                    }}>
                        {initials}
                    </div>

                    <div>
                        <p style={{ fontSize: "16px", fontWeight: 700, color: "#1a56db", margin: 0, lineHeight: 1.3 }}>
                            {doctorCode}
                        </p>
                        <p style={{ fontSize: "12px", color: "#94a3b8", margin: 0, marginTop: "2px" }}>Attending Physician</p>
                    </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    {/* Date chip */}
                    <div style={{
                        display: "flex", alignItems: "center", gap: "7px",
                        background: "#f0f5ff", border: "1px solid #dbe9ff",
                        borderRadius: "10px", padding: "8px 14px",
                        fontSize: "13px", fontWeight: 600, color: "#3b5bdb"
                    }}>
                        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {date}
                    </div>

                    {/* Expand button */}
                    <button
                        onClick={() => setExpanded(e => !e)}
                        style={{
                            width: "36px", height: "36px", borderRadius: "10px",
                            border: "1.5px solid #e2e8f0", background: expanded ? "#f0f5ff" : "#fafbfc",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            cursor: "pointer", color: expanded ? "#1a56db" : "#94a3b8",
                            transition: "all 0.15s"
                        }}
                    >
                        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"
                            style={{ transform: expanded ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Preview Pills */}
            <div style={{ padding: "0 28px 20px", display: "flex", flexWrap: "wrap", gap: "8px", borderTop: "1px solid #f1f5f9", paddingTop: "16px" }}>
                {consultation.symptoms ? (
                    <span style={{
                        display: "inline-flex", alignItems: "center", gap: "6px",
                        background: "#fff5f5", border: "1px solid #fecaca",
                        color: "#c0392b", borderRadius: "8px", padding: "6px 12px",
                        fontSize: "13px", fontWeight: 600
                    }}>
                        <span>🩺</span>
                        {consultation.symptoms.length > 50
                            ? consultation.symptoms.slice(0, 50) + "…"
                            : consultation.symptoms}
                    </span>
                ) : null}
                {consultation.diagnosis ? (
                    <span style={{
                        display: "inline-flex", alignItems: "center", gap: "6px",
                        background: "#eff6ff", border: "1px solid #bfdbfe",
                        color: "#1d4ed8", borderRadius: "8px", padding: "6px 12px",
                        fontSize: "13px", fontWeight: 600
                    }}>
                        <span>🔬</span>
                        {consultation.diagnosis.length > 50
                            ? consultation.diagnosis.slice(0, 50) + "…"
                            : consultation.diagnosis}
                    </span>
                ) : null}
                {!consultation.symptoms && !consultation.diagnosis && (
                    <span style={{ fontSize: "13px", color: "#94a3b8", fontStyle: "italic" }}>No summary available</span>
                )}
            </div>

            {/* Expanded Detail Panel */}
            {expanded && (
                <div style={{
                    borderTop: "1.5px solid #e8edf5",
                    background: "linear-gradient(180deg, #f8faff 0%, #f4f7ff 100%)",
                    padding: "28px",
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "24px"
                }}>
                    {[
                        {
                            icon: (
                                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            ),
                            label: "Symptoms",
                            value: consultation.symptoms,
                            accent: "#c0392b",
                            bg: "#fff5f5",
                            border: "#fecaca"
                        },
                        {
                            icon: (
                                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                                </svg>
                            ),
                            label: "Diagnosis",
                            value: consultation.diagnosis,
                            accent: "#1d4ed8",
                            bg: "#eff6ff",
                            border: "#bfdbfe"
                        },
                        {
                            icon: (
                                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                            ),
                            label: "Doctor's Notes",
                            value: consultation.note,
                            accent: "#0f766e",
                            bg: "#f0fdf9",
                            border: "#99f6e4"
                        },
                        {
                            icon: (
                                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            ),
                            label: "Consultation Date",
                            value: date,
                            accent: "#7c3aed",
                            bg: "#faf5ff",
                            border: "#ddd6fe"
                        },
                    ].map(({ icon, label, value, accent, bg, border }) => (
                        <div key={label} style={{
                            background: "#fff", border: `1.5px solid ${border}`,
                            borderRadius: "14px", padding: "18px 20px",
                            boxShadow: "0 1px 6px rgba(0,0,0,0.04)"
                        }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
                                <div style={{
                                    width: "34px", height: "34px", borderRadius: "10px",
                                    background: bg, border: `1px solid ${border}`,
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    color: accent, flexShrink: 0
                                }}>
                                    {icon}
                                </div>
                                <span style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#94a3b8" }}>
                                    {label}
                                </span>
                            </div>
                            <p style={{ fontSize: "14px", color: "#374151", lineHeight: 1.65, margin: 0, whiteSpace: "pre-line" }}>
                                {value || <span style={{ color: "#c0c9d8", fontStyle: "italic" }}>Not recorded</span>}
                            </p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default function PatientHistory() {
    const [patientHistory, setPatientHistory] = useState([]);
    const [errorMessage, setErrorMessage] = useState("");
    const [search, setSearch] = useState("");

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        const user = storedUser ? JSON.parse(storedUser) : null;
        const token = localStorage.getItem("token");

        if (!user?.id || !token) {
            setErrorMessage("Missing authenticated user or token.");
            return;
        }

        fetch("http://127.0.0.1:8000/api/my-consultations", {
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
            },
        })
            .then((res) => {
                if (!res.ok) throw new Error("Request failed");
                return res.json();
            })
            .then((data) => {
                const items = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
                setPatientHistory(items);
            })
            .catch(() => {
                setErrorMessage("Failed to load consultation history.");
                setPatientHistory([]);
            });
    }, []);

    const filtered = patientHistory.filter((c) => {
        const q = search.toLowerCase();
        return (
            !q ||
            c.doctor?.doctor_code?.toLowerCase().includes(q) ||
            c.symptoms?.toLowerCase().includes(q) ||
            c.diagnosis?.toLowerCase().includes(q) ||
            c.note?.toLowerCase().includes(q)
        );
    });

    return (
        <div style={{ display: "flex", minHeight: "100vh", background: "#f0f4fb", fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
            <PatientSidebar />

            <main style={{ flex: 1, display: "flex", padding: "40px 32px", overflowY: "auto", marginLeft: 40 }}>
            <div style={{ width: "100%", maxWidth: "860px" }}>

                {/* Page Header */}
                <div style={{ marginBottom: "36px" }}>
                    <p style={{ fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#94a3b8", marginBottom: "6px" }}>
                        Patient Portal
                    </p>
                    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
                        <h1 style={{ fontSize: "32px", fontWeight: 800, color: "#0f172a", margin: 0, letterSpacing: "-0.5px" }}>
                            Consultation History
                        </h1>
                        {patientHistory.length > 0 && (
                            <span style={{
                                background: "#1a56db", color: "#fff",
                                borderRadius: "10px", padding: "7px 16px",
                                fontSize: "13px", fontWeight: 700,
                                boxShadow: "0 3px 10px rgba(26,86,219,0.25)"
                            }}>
                                {patientHistory.length} Record{patientHistory.length !== 1 ? "s" : ""}
                            </span>
                        )}
                    </div>
                </div>

                {/* Error */}
                {errorMessage && (
                    <div style={{
                        display: "flex", alignItems: "center", gap: "12px",
                        background: "#fff5f5", border: "1.5px solid #fca5a5",
                        color: "#b91c1c", padding: "14px 18px",
                        borderRadius: "14px", marginBottom: "24px", fontSize: "14px", fontWeight: 500
                    }}>
                        <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {errorMessage}
                    </div>
                )}

                {/* Search */}
                {patientHistory.length > 0 && (
                    <div style={{ position: "relative", marginBottom: "28px" }}>
                        <svg style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }}
                            width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Search by doctor, symptoms, or diagnosis…"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            style={{
                                width: "100%", paddingLeft: "46px", paddingRight: "16px",
                                paddingTop: "13px", paddingBottom: "13px",
                                background: "#fff", border: "1.5px solid #e2e8f0",
                                borderRadius: "14px", fontSize: "14px", color: "#374151",
                                outline: "none", boxSizing: "border-box",
                                boxShadow: "0 1px 6px rgba(0,0,0,0.05)"
                            }}
                        />
                    </div>
                )}

                {/* Cards */}
                {filtered.length === 0 ? (
                    <div style={{
                        display: "flex", flexDirection: "column", alignItems: "center",
                        justifyContent: "center", gap: "14px", padding: "80px 0",
                        color: "#94a3b8"
                    }}>
                        <div style={{
                            width: "64px", height: "64px", borderRadius: "18px",
                            background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center"
                        }}>
                            <svg width="30" height="30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <p style={{ fontSize: "15px", fontWeight: 600, color: "#64748b", margin: 0 }}>
                            {search ? "No results match your search." : "No consultation history found."}
                        </p>
                        {search && (
                            <button onClick={() => setSearch("")}
                                style={{ fontSize: "13px", color: "#1a56db", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>
                                Clear search
                            </button>
                        )}
                    </div>
                ) : (
                    <div>
                        {filtered.map((c, i) => (
                            <ConsultationCard key={c.id} consultation={c} index={i} />
                        ))}
                    </div>
                )}

                {/* Footer */}
                {filtered.length > 0 && (
                    <p style={{ textAlign: "center", fontSize: "13px", color: "#94a3b8", marginTop: "8px" }}>
                        Showing <strong style={{ color: "#64748b" }}>{filtered.length}</strong> of{" "}
                        <strong style={{ color: "#64748b" }}>{patientHistory.length}</strong> consultations
                    </p>
                )}
            </div>
            </main>
        </div>
    );
}