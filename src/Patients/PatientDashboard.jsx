import PatientSidebar from "./PatientSidebar";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
/* ─── tiny helpers ─── */

const fmt = (n) =>
    Number(n || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const fmtDate = (d) =>
    d ? new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—";

const fmtTime = (t) => {
    if (!t) return "—";
    const [h, m] = t.split(":");
    const hour = parseInt(h, 10);
    return `${hour > 12 ? hour - 12 : hour}:${m} ${hour >= 12 ? "PM" : "AM"}`;
};

const hour = new Date().getHours();
const greeting = hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";

/* ─── color maps ─── */
const apptStatusStyle = {
    confirmed:  { bg: "#EAF3DE", color: "#3B6D11" },
    completed:  { bg: "#E6F1FB", color: "#185FA5" },
    pending:    { bg: "#FAEEDA", color: "#854F0B" },
    cancelled:  { bg: "#FCEBEB", color: "#A32D2D" },
};

const billStatusStyle = {
    paid:    { bg: "#EAF3DE", color: "#3B6D11" },
    unpaid:  { bg: "#FCEBEB", color: "#A32D2D" },
    pending: { bg: "#FAEEDA", color: "#854F0B" },
};

/* ─── sub-components ─── */
function StatusBadge({ value, map }) {
    const k = (value || "").toLowerCase();
    const s = map[k] || { bg: "#F1EFE8", color: "#5F5E5A" };
    return (
        <span style={{
            background: s.bg, color: s.color,
            fontSize: 12, fontWeight: 600, padding: "3px 10px",
            borderRadius: 20, textTransform: "capitalize", whiteSpace: "nowrap",
        }}>
            {value || "—"}
        </span>
    );
}

function StatCard({ icon, label, value, sub, accent }) {
    const bg = accent ? "#042C53" : "#fff";
    const textColor = accent ? "#fff" : "#1a1a1a";
    const subColor  = accent ? "#85B7EB" : "#999";
    return (
        <div style={{
            background: bg, borderRadius: 14,
            border: accent ? "none" : "0.5px solid rgba(0,0,0,0.08)",
            padding: "20px 22px", display: "flex", flexDirection: "column", gap: 10,
            transition: "transform 0.15s",
        }}
            onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"}
            onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
        >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: 22 }}>{icon}</span>
                {sub && (
                    <span style={{ fontSize: 11, color: subColor, fontWeight: 500 }}>{sub}</span>
                )}
            </div>
            <div>
                <p style={{ margin: 0, fontSize: 32, fontWeight: 700, color: textColor, letterSpacing: "-0.03em", lineHeight: 1 }}>
                    {value}
                </p>
                <p style={{ margin: "5px 0 0", fontSize: 13, color: subColor, fontWeight: 500 }}>{label}</p>
            </div>
        </div>
    );
}

function SectionHeader({ title, linkText, onLink }) {
    return (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: "#1a1a1a", letterSpacing: "-0.01em" }}>
                {title}
            </h2>
            {linkText && (
                <button onClick={onLink} style={{
                    background: "none", border: "none", cursor: "pointer",
                    fontSize: 13, color: "#185FA5", fontWeight: 500, padding: 0,
                }}>
                    {linkText} →
                </button>
            )}
        </div>
    );
}

function Card({ children, style = {} }) {
    return (
        <div style={{
            background: "#fff", borderRadius: 16,
            border: "0.5px solid rgba(0,0,0,0.08)",
            padding: "22px 24px", ...style,
        }}>
            {children}
        </div>
    );
}

function Skeleton({ w = "100%", h = 14, r = 6 }) {
    return (
        <div style={{
            width: w, height: h, borderRadius: r,
            background: "linear-gradient(90deg,#f0f0f0 25%,#e0e0e0 50%,#f0f0f0 75%)",
            backgroundSize: "200% 100%",
            animation: "shimmer 1.4s infinite",
        }} />
    );
    
}

/* ─── main ─── */
function PatientDashboard() {
    const navigate = useNavigate();
    const [data, setData]       = useState({ appointments: [], consultations: [], prescriptions: [], bills: [] });
    const [loading, setLoading] = useState(true);
    const [userName, setUserName] = useState("Patient");

    useEffect(() => {
        const token = localStorage.getItem("token");
        const name  = localStorage.getItem("name") || "Patient";
        setUserName(name.split(" ")[0]);

        if (!token) { setLoading(false); return; }

        Promise.all([
            fetch("https://clinic-system-back-end.onrender.com/api/my-appointments",  { headers: { Authorization: `Bearer ${token}`, Accept: "application/json" } }).then(r => r.json()),
            fetch("https://clinic-system-back-end.onrender.com/api/my-consultations", { headers: { Authorization: `Bearer ${token}`, Accept: "application/json" } }).then(r => r.json()),
            fetch("https://clinic-system-back-end.onrender.com/api/my-prescriptions", { headers: { Authorization: `Bearer ${token}`, Accept: "application/json" } }).then(r => r.json()),
            fetch("https://clinic-system-back-end.onrender.com/api/my-bills",         { headers: { Authorization: `Bearer ${token}`, Accept: "application/json" } }).then(r => r.json()),
        ])
            .then(([appointments, consultations, prescriptions, bills]) => {
                setData({
                    appointments:  appointments.data  || [],
                    consultations: consultations.data || [],
                    prescriptions: prescriptions.data || [],
                    bills:         bills.data         || [],
                });
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const unpaidBills   = data.bills.filter(b => (b.payment_status || "").toLowerCase() !== "paid");
    const totalOwed     = unpaidBills.reduce((s, b) => s + Number(b.total_amount || 0), 0);
    const upcomingAppts = data.appointments
        .filter(a => ["confirmed","pending","scheduled"].includes((a.status || "").toLowerCase()))
        .slice(0, 4);
    const recentConsult = data.consultations.slice(0, 3);
    const recentRx      = data.prescriptions.slice(0, 4);
    const recentBills   = data.bills.slice(0, 3);

    const rxStatusStyle = (expiry) => {
        if (!expiry) return { bg: "#F1EFE8", color: "#5F5E5A", label: "Active" };
        const diff = new Date(expiry) - new Date();
        if (diff < 0)        return { bg: "#FCEBEB", color: "#A32D2D", label: "Expired" };
        if (diff < 7*864e5)  return { bg: "#FAEEDA", color: "#854F0B", label: "Expiring" };
        return { bg: "#EAF3DE", color: "#3B6D11", label: "Active" };
    };

    return (
        <div style={{ display: "flex", minHeight: "100vh", background: "#F4F5F9", fontFamily: "'DM Sans', system-ui, sans-serif" }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
                @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
                @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
                * { box-sizing: border-box; }
                ::-webkit-scrollbar { width: 4px; }
                ::-webkit-scrollbar-track { background: transparent; }
                ::-webkit-scrollbar-thumb { background: #d0d0d0; border-radius: 4px; }
                table { border-collapse: collapse; width: 100%; }
                th { font-size: 11px; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; color: #999; padding: 0 12px 10px; text-align: left; }
                td { font-size: 14px; color: #2C2C2A; padding: 12px; border-top: 0.5px solid rgba(0,0,0,0.06); vertical-align: middle; }
                tr:first-child td { border-top: none; }
            `}</style>

            <PatientSidebar />

            <div style={{ flex: 1, padding: "36px 32px", maxWidth: 1100, overflowY: "auto", animation: "fadeUp 0.4s ease" , marginLeft: 40 }}>

                {/* ── Top Bar ── */}
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 30 }}>
                    <div>
                        <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700, color: "#0f0f0f", letterSpacing: "-0.03em" }}>
                            {greeting}, {userName} 👋
                        </h1>
                        <p style={{ margin: "6px 0 0", fontSize: 15, color: "#888" }}>
                            Here's a summary of your health activity today.
                        </p>
                    </div>
                    <button style={{
                        background: "#042C53", color: "#fff",
                        border: "none", borderRadius: 10, cursor: "pointer",
                        fontSize: 14, fontWeight: 600, padding: "11px 20px",
                        display: "flex", alignItems: "center", gap: 8,
                        whiteSpace: "nowrap",
                    }}>
                        📅 Book Appointment
                    </button>
                </div>

                {/* ── Stat Cards ── */}
                {loading ? (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 28 }}>
                        {[0,1,2,3].map(i => (
                            <div key={i} style={{ background: "#fff", borderRadius: 14, border: "0.5px solid rgba(0,0,0,0.08)", padding: "20px 22px" }}>
                                <Skeleton h={12} w={60} />
                                <div style={{ marginTop: 14 }}><Skeleton h={32} w={50} r={8} /></div>
                                <div style={{ marginTop: 8 }}><Skeleton h={12} w={90} /></div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 28 }}>
                        <StatCard icon="🗓️" label="Appointments"  value={data.appointments.length}  sub="Total" />
                        <StatCard icon="🩺" label="Consultations" value={data.consultations.length} sub="Total" />
                        <StatCard icon="💊" label="Prescriptions" value={data.prescriptions.length} sub="Total" />
                        <StatCard icon="💳" label="Pending Bills" value={`$${fmt(totalOwed)}`}      sub={`${unpaidBills.length} unpaid`} accent />
                    </div>
                )}

                {/* ── Main Content Grid ── */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 20 }}>

                    {/* LEFT COLUMN */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

                        {/* Upcoming Appointments */}
                        <Card>
                            <SectionHeader title="Upcoming Appointments" onLink={()=>navigate('/appointments')} linkText="View Calendar" />
                            {loading ? (
                                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                                    {[0,1,2].map(i => <Skeleton key={i} h={44} r={10} />)}
                                </div>
                            ) : upcomingAppts.length === 0 ? (
                                <p style={{ color: "#aaa", fontSize: 14, margin: 0 }}>No upcoming appointments.</p>
                            ) : (
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Date</th>
                                            <th>Time</th>
                                            <th>Doctor</th>
                                            <th>Reason</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {upcomingAppts.map((a) => (
                                            <tr key={a.id}>
                                                <td style={{ fontWeight: 500 }}>{fmtDate(a.appointment_date)}</td>
                                                <td style={{ color: "#666" }}>{fmtTime(a.appointment_time)}</td>
                                                <td>
                                                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                                        <div style={{
                                                            width: 30, height: 30, borderRadius: "50%",
                                                            background: "#E6F1FB", display: "flex",
                                                            alignItems: "center", justifyContent: "center",
                                                            fontSize: 13, fontWeight: 600, color: "#185FA5",
                                                        }}>
                                                            {(a.doctor?.user?.name || a.doctor?.doctor_code || "Dr")[0]}
                                                        </div>
                                                        <span style={{ fontSize: 13 }}>{a.doctor?.user?.name || a.doctor?.doctor_code || "—"}</span>
                                                    </div>
                                                </td>
                                                <td style={{ color: "#555", maxWidth: 140 }}>
                                                    <span style={{ display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 130 }}>
                                                        {a.reason || "—"}
                                                    </span>
                                                </td>
                                                <td>
                                                    <StatusBadge value={a.status} map={apptStatusStyle} />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </Card>

                        {/* Recent Consultations */}
                        <Card>
                            <SectionHeader title="Recent Medical History" onLink={()=>navigate("/history")} linkText="Full History" />
                            {loading ? (
                                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                                    {[0,1].map(i => <Skeleton key={i} h={44} r={10} />)}
                                </div>
                            ) : recentConsult.length === 0 ? (
                                <p style={{ color: "#aaa", fontSize: 14, margin: 0 }}>No consultation records.</p>
                            ) : (
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Date</th>
                                            <th>Diagnosis / Reason</th>
                                            <th>Doctor</th>
                                            <th>Notes</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {recentConsult.map((c) => (
                                            <tr key={c.id}>
                                                <td style={{ fontWeight: 500, whiteSpace: "nowrap" }}>{fmtDate(c.consultation_date || c.created_at)}</td>
                                                <td style={{ fontWeight: 500 }}>{c.diagnosis || c.reason || "—"}</td>
                                                <td style={{ color: "#555" }}>{c.doctor?.user?.name || c.doctor?.doctor_code || "—"}</td>
                                                <td>
                                                    <span style={{
                                                        fontSize: 12, background: "#F4F5F9",
                                                        border: "0.5px solid rgba(0,0,0,0.08)",
                                                        padding: "3px 8px", borderRadius: 6,
                                                        color: "#666", cursor: "pointer",
                                                    }}>
                                                        📄 View
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </Card>

                        {/* Recent Prescriptions */}
                        <Card>
                            <SectionHeader title="Recent Prescriptions" onLink={()=>navigate('/prescriptions')} linkText="View All" />
                            {loading ? (
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                                    {[0,1,2,3].map(i => <Skeleton key={i} h={80} r={10} />)}
                                </div>
                            ) : recentRx.length === 0 ? (
                                <p style={{ color: "#aaa", fontSize: 14, margin: 0 }}>No prescriptions found.</p>
                            ) : (
                                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px,1fr))", gap: 12 }}>
                                    {recentRx.map((rx) => {
                                        const st = rxStatusStyle(rx.expiry_date);
                                        return (
                                            <div key={rx.id} style={{
                                                background: "#F8F9FC",
                                                border: "0.5px solid rgba(0,0,0,0.07)",
                                                borderRadius: 12, padding: "14px 16px",
                                            }}>
                                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                                                    <span style={{ fontSize: 20 }}>💊</span>
                                                    <span style={{
                                                        background: st.bg, color: st.color,
                                                        fontSize: 11, fontWeight: 600, padding: "2px 8px",
                                                        borderRadius: 20,
                                                    }}>{st.label}</span>
                                                </div>
                                                <p style={{ margin: "0 0 3px", fontSize: 14, fontWeight: 700, color: "#1a1a1a" }}>
                                                    {rx.medicine?.name || rx.medicine_name || "Medication"}
                                                </p>
                                                <p style={{ margin: "0 0 2px", fontSize: 12, color: "#888" }}>
                                                    {rx.dosage || "—"} · {rx.frequency || "—"}
                                                </p>
                                                <p style={{ margin: 0, fontSize: 12, color: "#aaa" }}>
                                                    Duration: {rx.duration_time || "—"}
                                                </p>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </Card>
                    </div>

                    {/* RIGHT COLUMN */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

                        {/* Quick Health Stats */}
                        <Card style={{ background: "#042C53", border: "none" }}>
                            <p style={{ margin: "0 0 14px", fontSize: 13, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "#85B7EB" }}>
                                Health Overview
                            </p>
                            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                                {[
                                    { label: "Completed Appointments", value: data.appointments.filter(a => (a.status||"").toLowerCase() === "completed").length, icon: "✅" },
                                    { label: "Active Prescriptions",   value: data.prescriptions.filter(rx => !rx.expiry_date || new Date(rx.expiry_date) > new Date()).length, icon: "💊" },
                                    { label: "Unpaid Bills",           value: unpaidBills.length, icon: "⚠️" },
                                    { label: "Total Consultations",    value: data.consultations.length, icon: "🩺" },
                                ].map(({ label, value, icon }) => (
                                    <div key={label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                            <span style={{ fontSize: 16 }}>{icon}</span>
                                            <span style={{ fontSize: 14, color: "#9BB8D4" }}>{label}</span>
                                        </div>
                                        <span style={{ fontSize: 18, fontWeight: 700, color: "#fff" }}>{loading ? "—" : value}</span>
                                    </div>
                                ))}
                            </div>
                        </Card>

                        {/* Billing Overview */}
                        <Card>
                            <SectionHeader title="Billing Overview" onLink={()=>navigate('/bill')} linkText="View All" />
                            {loading ? (
                                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                                    {[0,1].map(i => <Skeleton key={i} h={56} r={10} />)}
                                </div>
                            ) : recentBills.length === 0 ? (
                                <p style={{ color: "#aaa", fontSize: 14, margin: 0 }}>No billing records.</p>
                            ) : (
                                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                                    {recentBills.map((bill) => {
                                        const st = billStatusStyle[(bill.payment_status||"").toLowerCase()] || billStatusStyle.unpaid;
                                        return (
                                            <div key={bill.id} style={{
                                                display: "flex", alignItems: "center", justifyContent: "space-between",
                                                background: "#F8F9FC", borderRadius: 10,
                                                border: "0.5px solid rgba(0,0,0,0.07)",
                                                padding: "12px 14px",
                                            }}>
                                                <div>
                                                    <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "#1a1a1a" }}>
                                                        Invoice #{String(bill.id).padStart(4, "0")}
                                                    </p>
                                                    <p style={{ margin: "3px 0 0", fontSize: 12, color: "#999" }}>
                                                        {fmtDate(bill.created_at)}
                                                    </p>
                                                </div>
                                                <div style={{ textAlign: "right" }}>
                                                    <p style={{ margin: "0 0 4px", fontSize: 15, fontWeight: 700, color: "#1a1a1a" }}>
                                                        ${fmt(bill.total_amount)}
                                                    </p>
                                                    <span style={{
                                                        background: st.bg, color: st.color,
                                                        fontSize: 11, fontWeight: 600,
                                                        padding: "2px 8px", borderRadius: 20,
                                                        textTransform: "capitalize",
                                                    }}>
                                                        {bill.payment_status || "Unpaid"}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}

                                    {unpaidBills.length > 0 && (
                                        <button style={{
                                            marginTop: 4, width: "100%", background: "#042C53",
                                            color: "#fff", border: "none", borderRadius: 10,
                                            padding: "12px", fontSize: 14, fontWeight: 600,
                                            cursor: "pointer",
                                        }}>
                                            Make a Payment  →
                                        </button>
                                    )}
                                </div>
                            )}
                        </Card>

                        {/* Next Appointment Highlight */}
                        {!loading && upcomingAppts.length > 0 && (() => {
                            const next = upcomingAppts[0];
                            return (
                                <Card style={{ background: "#F0FBF5", border: "0.5px solid #9FE1CB" }}>
                                    <p style={{ margin: "0 0 12px", fontSize: 12, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "#0F6E56" }}>
                                        Next Appointment
                                    </p>
                                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                                        <div style={{
                                            width: 44, height: 44, borderRadius: "50%",
                                            background: "#1D9E75", display: "flex",
                                            alignItems: "center", justifyContent: "center",
                                            fontSize: 20, color: "#fff", fontWeight: 700,
                                        }}>
                                            {(next.doctor?.doctor_code || "Dr")[0]}
                                        </div>
                                        <div>
                                            <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#085041" }}>
                                                {next.doctor?.doctor_code || "Your Doctor"}
                                            </p>
                                            <p style={{ margin: "2px 0 0", fontSize: 13, color: "#0F6E56" }}>
                                                {next.doctor?.specialty || next.reason || "Appointment"}
                                            </p>
                                        </div>
                                    </div>
                                    <div style={{ display: "flex", gap: 10 }}>
                                        <div style={{ flex: 1, background: "#fff", borderRadius: 8, padding: "8px 12px", textAlign: "center" }}>
                                            <p style={{ margin: 0, fontSize: 11, color: "#999", marginBottom: 2 }}>Date</p>
                                            <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#085041" }}>
                                                {fmtDate(next.appointment_date)}
                                            </p>
                                        </div>
                                        <div style={{ flex: 1, background: "#fff", borderRadius: 8, padding: "8px 12px", textAlign: "center" }}>
                                            <p style={{ margin: 0, fontSize: 11, color: "#999", marginBottom: 2 }}>Time</p>
                                            <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#085041" }}>
                                                {fmtTime(next.appointment_time)}
                                            </p>
                                        </div>
                                    </div>
                                </Card>
                            );
                        })()}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default PatientDashboard;