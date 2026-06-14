
import { useEffect, useState, useRef } from "react";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    ArcElement,
    Tooltip,
    Legend,
    Filler,
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    ArcElement,
    Tooltip,
    Legend,
    Filler
);

// ─── Helpers ────────────────────────────────────────────────────────────────

function getInitials(name = "") {
    return name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
}

function formatCurrency(val) {
    const n = parseFloat(val || 0);
    if (n >= 1000) return "$" + (n / 1000).toFixed(1) + "k";
    return "$" + n.toFixed(2);
}

function timeAgo(dateStr) {
    const diff = (Date.now() - new Date(dateStr)) / 1000;
    if (diff < 60) return "just now";
    if (diff < 3600) return Math.floor(diff / 60) + " min ago";
    if (diff < 86400) return Math.floor(diff / 3600) + " hrs ago";
    return Math.floor(diff / 86400) + " days ago";
}

function calcAge(dob) {
    if (!dob) return "—";
    const diff = Date.now() - new Date(dob);
    return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25)) + " yrs";
}

// ─── Palette ────────────────────────────────────────────────────────────────

// Use the project's blue palette for admin (replacing previous green/teal)
const TEAL = "#378add"; // was green; now matches other pages' blue
const TEAL_LIGHT = "#e6f1fb";
const TEAL_MID = "#185fa5";
const AMBER = "#fac775";
const AMBER_LIGHT = "#faeeda";
const AMBER_DARK = "#854f0b";
const RED = "#e24b4a";
const RED_LIGHT = "#fcebeb";
const RED_DARK = "#a32d2d";
const BLUE = "#378add";
const BLUE_LIGHT = "#e6f1fb";
const BLUE_DARK = "#185fa5";
const PURPLE = "#7f77dd";
const PURPLE_LIGHT = "#eeedfe";
const PURPLE_DARK = "#3c3489";

const STATUS_COLORS = {
    confirmed: { bg: TEAL_LIGHT, color: TEAL_MID, dot: TEAL },
    completed: { bg: TEAL_LIGHT, color: TEAL_MID, dot: TEAL },
    pending: { bg: AMBER_LIGHT, color: AMBER_DARK, dot: AMBER },
    "in-progress": { bg: AMBER_LIGHT, color: AMBER_DARK, dot: AMBER },
    cancelled: { bg: RED_LIGHT, color: RED_DARK, dot: RED },
    working: { bg: TEAL_LIGHT, color: TEAL_MID, dot: TEAL },
    available: { bg: AMBER_LIGHT, color: AMBER_DARK, dot: AMBER },
    paid: { bg: TEAL_LIGHT, color: TEAL_MID },
    unpaid: { bg: RED_LIGHT, color: RED_DARK },
    A: { bg: RED_LIGHT, color: RED_DARK },
    "A+": { bg: RED_LIGHT, color: RED_DARK },
    "A-": { bg: RED_LIGHT, color: "#7a1f1f" },
    B: { bg: BLUE_LIGHT, color: BLUE_DARK },
    "B+": { bg: BLUE_LIGHT, color: BLUE_DARK },
    "B-": { bg: BLUE_LIGHT, color: BLUE_DARK },
    O: { bg: AMBER_LIGHT, color: AMBER_DARK },
    "O+": { bg: AMBER_LIGHT, color: AMBER_DARK },
    "O-": { bg: AMBER_LIGHT, color: AMBER_DARK },
    AB: { bg: PURPLE_LIGHT, color: PURPLE_DARK },
};

const AVATAR_COLORS = [
    { bg: TEAL_LIGHT, color: TEAL_MID },
    { bg: BLUE_LIGHT, color: BLUE_DARK },
    { bg: AMBER_LIGHT, color: AMBER_DARK },
    { bg: PURPLE_LIGHT, color: PURPLE_DARK },
    { bg: RED_LIGHT, color: RED_DARK },
];

function avatarColor(id = 0) {
    return AVATAR_COLORS[id % AVATAR_COLORS.length];
}

// ─── Reusable UI pieces ─────────────────────────────────────────────────────

function Badge({ status, children }) {
    const s = STATUS_COLORS[status] || { bg: "#f3f4f6", color: "#555" };
    return (
        <span
            style={{
                background: s.bg,
                color: s.color,
                fontSize: 10,
                fontWeight: 500,
                borderRadius: 99,
                padding: "2px 9px",
                whiteSpace: "nowrap",
            }}
        >
            {children || status}
        </span>
    );
}

function Avatar({ name, id = 0, size = 32 }) {
    const c = avatarColor(id);
    return (
        <div
            style={{
                width: size,
                height: size,
                borderRadius: "50%",
                background: c.bg,
                color: c.color,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: size * 0.38,
                fontWeight: 500,
                flexShrink: 0,
            }}
        >
            {getInitials(name)}
        </div>
    );
}

function StatCard({ icon, iconBg, iconColor, label, value, change, changeUp }) {
    return (
        <div
            style={{
                background: "#fff",
                border: "0.5px solid rgba(0,0,0,0.08)",
                borderRadius: 12,
                padding: "14px 16px",
            }}
        >
            <div
                style={{
                    width: 34,
                    height: 34,
                    borderRadius: 8,
                    background: iconBg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 10,
                    fontSize: 17,
                    color: iconColor,
                }}
            >
                {icon}
            </div>
            <div style={{ fontSize: 10, color: "#888", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 2 }}>
                {label}
            </div>
            <div style={{ fontSize: 22, fontWeight: 600, color: "#111" }}>{value}</div>
            {change && (
                <div style={{ fontSize: 10, marginTop: 3, color: changeUp ? TEAL_MID : RED_DARK }}>
                    {changeUp ? "▲" : "▼"} {change}
                </div>
            )}
        </div>
    );
}

function SectionCard({ title, action, onAction, children, style }) {
    return (
        <div
            style={{
                background: "#fff",
                border: "0.5px solid rgba(0,0,0,0.08)",
                borderRadius: 12,
                padding: "16px 20px",
                ...style,
            }}
        >
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 14,
                }}
            >
                <span style={{ fontSize: 13, fontWeight: 600, color: "#111" }}>{title}</span>
                {action && (
                    <button
                        onClick={onAction}
                        style={{
                            background: "none",
                            border: "none",
                            color: TEAL,
                            fontSize: 11,
                            cursor: "pointer",
                            fontWeight: 500,
                        }}
                    >
                        {action}
                    </button>
                )}
            </div>
            {children}
        </div>
    );
}

function Skeleton({ h = 14, w = "100%", style }) {
    return (
        <div
            style={{
                height: h,
                width: w,
                background: "linear-gradient(90deg,#f0f0f0 25%,#e8e8e8 50%,#f0f0f0 75%)",
                backgroundSize: "200% 100%",
                animation: "shimmer 1.4s infinite",
                borderRadius: 6,
                ...style,
            }}
        />
    );
}

// ─── Main Dashboard ──────────────────────────────────────────────────────────

export default function AdminDashboard() {
    const [patients, setPatients] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [bills, setBills] = useState([]);
    const [consultations, setConsultations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeNav, setActiveNav] = useState("dashboard");
    const [now] = useState(new Date());

    const [stats, setStats] = useState({
        totalPatients: 0,
        totalDoctors: 0,
        totalAppointments: 0,
        totalIncome: 0,
        paidBills: 0,
        pendingBills: 0,
        confirmedAppts: 0,
        cancelledAppts: 0,
        inProgressAppts: 0,
        workingDoctors: 0,
    });

    useEffect(() => {
        const token = localStorage.getItem("token");

        const fetchData = async () => {
            setLoading(true);
            try {
                const headers = { Authorization: `Bearer ${token}` };
                const BASE = "http://127.0.0.1:8000/api";

                const [patientRes, doctorRes, appRes, billRes, consultRes] =
                    await Promise.all([
                        fetch(`${BASE}/patients`, { headers }),
                        fetch(`${BASE}/doctor`, { headers }),
                        fetch(`${BASE}/appointment`, { headers }),
                        fetch(`${BASE}/bill`, { headers }),
                        fetch(`${BASE}/consultation`, { headers }).catch(() => ({ json: () => ({ data: [] }) })),
                    ]);

                const [patientData, doctorData, appData, billData, consultData] =
                    await Promise.all([
                        patientRes.json(),
                        doctorRes.json(),
                        appRes.json(),
                        billRes.json(),
                        consultRes.json(),
                    ]);

                const patientsList = patientData.data || [];
                const doctorsList = doctorData.doctors || [];
                const apptsList = appData.data || [];
                const billsList = billData.data || [];
                const consultsList = consultData.data || [];

                setPatients(patientsList);
                setDoctors(doctorsList);
                setAppointments(apptsList);
                setBills(billsList);
                setConsultations(consultsList);

                let totalIncome = 0, paidBills = 0, pendingBills = 0;
                billsList.forEach((b) => {
                    totalIncome += parseFloat(b.total_amount || 0);
                    if (b.payment_status === "paid") paidBills++;
                    else pendingBills++;
                });

                const confirmedAppts = apptsList.filter((a) => a.status === "confirmed").length;
                const cancelledAppts = apptsList.filter((a) => a.status === "cancelled").length;
                const inProgressAppts = apptsList.filter((a) => a.status === "in-progress").length;
                const workingDoctors = doctorsList.filter((d) => d.status === "working").length;

                setStats({
                    totalPatients: patientsList.length,
                    totalDoctors: doctorsList.length,
                    totalAppointments: apptsList.length,
                    totalIncome,
                    paidBills,
                    pendingBills,
                    confirmedAppts,
                    cancelledAppts,
                    inProgressAppts,
                    workingDoctors,
                });
            } catch (err) {
                console.error("Dashboard error:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Monthly revenue from bills by month
    const monthlyRevenue = Array(12).fill(0);
    const monthlyPatients = Array(12).fill(0);
    bills.forEach((b) => {
        const m = new Date(b.created_at).getMonth();
        monthlyRevenue[m] += parseFloat(b.total_amount || 0);
    });
    patients.forEach((p) => {
        const m = new Date(p.created_at).getMonth();
        monthlyPatients[m]++;
    });

    const monthLabels = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

    const revenueChartData = {
        labels: monthLabels,
        datasets: [
            {
                label: "Revenue ($)",
                data: monthlyRevenue,
                backgroundColor: TEAL,
                borderRadius: 5,
                yAxisID: "y",
            },
            {
                label: "Patients",
                data: monthlyPatients,
                type: "line",
                borderColor: BLUE,
                backgroundColor: "rgba(55,138,221,0.08)",
                pointRadius: 3,
                pointBackgroundColor: BLUE,
                tension: 0.4,
                fill: true,
                yAxisID: "y1",
                borderDash: [4, 2],
            },
        ],
    };

    const donutData = {
        labels: ["Confirmed", "In-Progress", "Cancelled"],
        datasets: [
            {
                data: [
                    stats.confirmedAppts || 0,
                    stats.inProgressAppts || 0,
                    stats.cancelledAppts || 0,
                ],
                backgroundColor: [TEAL, AMBER, RED],
                borderWidth: 0,
                hoverOffset: 4,
            },
        ],
    };

    const totalApptForDonut =
        (stats.confirmedAppts || 0) +
        (stats.inProgressAppts || 0) +
        (stats.cancelledAppts || 0);

    const efficiencyPct =
        totalApptForDonut > 0
            ? Math.round((stats.confirmedAppts / totalApptForDonut) * 100)
            : 0;

    // Build activity feed from real data
    const activities = [
        ...appointments.slice(0, 2).map((a) => ({
            type: "appointment",
            text: `Appointment created`,
            sub: `${a.reason} · ${a.appointment_date} ${a.appointment_time?.slice(0, 5)}`,
            time: a.created_at,
            iconBg: PURPLE_LIGHT,
            iconColor: PURPLE,
            icon: "📅",
        })),
        ...bills.slice(0, 2).map((b) => ({
            type: "bill",
            text: `Bill #${b.id} · $${parseFloat(b.total_amount || 0).toFixed(2)}`,
            sub: `Payment ${b.payment_status} · Consult $${b.consultation_fee} · Med $${b.medicine_fee}`,
            time: b.updated_at,
            iconBg: b.payment_status === "paid" ? TEAL_LIGHT : RED_LIGHT,
            iconColor: b.payment_status === "paid" ? TEAL_MID : RED_DARK,
            icon: "💰",
        })),
        ...consultations.slice(0, 2).map((c) => ({
            type: "consultation",
            text: `Consultation recorded`,
            sub: `Symptoms: ${c.symptoms || "—"} · Dx: ${c.diagnosis || "—"}`,
            time: c.created_at,
            iconBg: BLUE_LIGHT,
            iconColor: BLUE_DARK,
            icon: "🩺",
        })),
        ...doctors.slice(0, 1).map((d) => ({
            type: "doctor",
            text: `Doctor profile: ${d.user?.name || d.doctor_code}`,
            sub: `${d.doctor_code} · ${d.status} · ${d.working_day}`,
            time: d.created_at,
            iconBg: AMBER_LIGHT,
            iconColor: AMBER_DARK,
            icon: "👨‍⚕️",
        })),
    ]
        .sort((a, b) => new Date(b.time) - new Date(a.time))
        .slice(0, 6);

    const todayAppts = appointments.filter(
        (a) => a.appointment_date === now.toISOString().slice(0, 10)
    );

    return (
        <div style={{ display: "flex", minHeight: "100vh", background: "#F4F5F9", fontFamily: "'DM Sans', system-ui, sans-serif" }}>
            {/* <style>{`
                @keyframes shimmer {
                    0%   { background-position: 200% 0; }
                    100% { background-position: -200% 0; }
                }
                * { box-sizing: border-box; margin: 0; padding: 0; }
                ::-webkit-scrollbar { width: 4px; }
                ::-webkit-scrollbar-thumb { background: #d0d5dd; border-radius: 99px; }
            `}</style> */}

            {/* ── Sidebar ── */}
           

            {/* ── Main ── */}
            <div style={{ flex: 1, overflow: "auto", padding: "1.5rem" }}>

                {/* Top bar */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
                    <div>
                        <h1 style={{ fontSize: 20, fontWeight: 700, color: "#111" }}>Clinical Analytics</h1>
                        <p style={{ fontSize: 12, color: "#888", marginTop: 2 }}>
                            {now.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                        </p>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <button
                            style={{
                                background: "#fff",
                                border: "0.5px solid rgba(0,0,0,0.15)",
                                borderRadius: 8,
                                padding: "7px 13px",
                                fontSize: 12,
                                color: "#555",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                gap: 6,
                            }}
                        >
                            📅 This Month
                        </button>
                        <button
                            style={{
                                background: TEAL,
                                border: "none",
                                borderRadius: 8,
                                padding: "7px 14px",
                                fontSize: 12,
                                color: "#fff",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                gap: 6,
                                fontWeight: 500,
                            }}
                        >
                            + New Appointment
                        </button>
                        <div
                            style={{
                                width: 34,
                                height: 34,
                                borderRadius: "50%",
                                background: TEAL,
                                color: "#fff",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: 13,
                                fontWeight: 600,
                            }}
                        >
                            SR
                        </div>
                    </div>
                </div>

                {/* ── Stat Cards ── */}
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(6, minmax(0, 1fr))",
                        gap: 10,
                        marginBottom: "1.25rem",
                    }}
                >
                    <StatCard icon="👥" iconBg={TEAL_LIGHT} iconColor={TEAL_MID} label="Total Patients" value={loading ? "…" : stats.totalPatients.toLocaleString()} change="+12% this month" changeUp />
                    <StatCard icon="🩺" iconBg={BLUE_LIGHT} iconColor={BLUE_DARK} label="Total Doctors" value={loading ? "…" : stats.totalDoctors} change={`${stats.workingDoctors} working`} changeUp />
                    <StatCard icon="📅" iconBg={AMBER_LIGHT} iconColor={AMBER_DARK} label="Appointments" value={loading ? "…" : stats.totalAppointments.toLocaleString()} change={`${todayAppts.length} today`} changeUp />
                    <StatCard icon="💰" iconBg={TEAL_LIGHT} iconColor={TEAL_MID} label="Total Income" value={loading ? "…" : formatCurrency(stats.totalIncome)} change="+15% vs last" changeUp />
                    <StatCard icon="✅" iconBg="#eaf3de" iconColor="#3b6d11" label="Paid Bills" value={loading ? "…" : stats.paidBills} change={`${stats.totalPatients > 0 ? Math.round((stats.paidBills / (stats.paidBills + stats.pendingBills + 0.001)) * 100) : 0}% rate`} changeUp />
                    <StatCard icon="⏳" iconBg={RED_LIGHT} iconColor={RED_DARK} label="Pending Bills" value={loading ? "…" : stats.pendingBills} change="Needs review" changeUp={false} />
                </div>

                {/* ── Charts row ── */}
                <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: "1rem", marginBottom: "1rem" }}>

                    {/* Revenue chart */}
                    <SectionCard title="Monthly Revenue & Volume">
                        <div style={{ display: "flex", gap: 16, marginBottom: 8, fontSize: 11, color: "#888" }}>
                            <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                                <span style={{ width: 10, height: 10, borderRadius: 2, background: TEAL, display: "inline-block" }} />
                                Revenue ($)
                            </span>
                            <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                                <span style={{ width: 10, height: 10, borderRadius: 2, background: BLUE, display: "inline-block" }} />
                                Patients
                            </span>
                        </div>
                        <div style={{ position: "relative", height: 190 }}>
                            <Bar
                                data={revenueChartData}
                                options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: { legend: { display: false } },
                                    scales: {
                                        x: { ticks: { font: { size: 10 }, color: "#aaa" }, grid: { display: false } },
                                        y: { ticks: { font: { size: 10 }, color: "#aaa", callback: (v) => "$" + v }, grid: { color: "rgba(0,0,0,0.05)" }, position: "left" },
                                        y1: { ticks: { font: { size: 10 }, color: "#aaa" }, grid: { display: false }, position: "right" },
                                    },
                                }}
                            />
                        </div>
                    </SectionCard>

                    {/* Donut */}
                    <SectionCard title="Appointment Status">
                        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                            <div style={{ position: "relative", width: 140, height: 140, flexShrink: 0 }}>
                                <Doughnut
                                    data={donutData}
                                    options={{
                                        responsive: true,
                                        maintainAspectRatio: false,
                                        cutout: "72%",
                                        plugins: { legend: { display: false } },
                                    }}
                                />
                                <div
                                    style={{
                                        position: "absolute",
                                        top: "50%",
                                        left: "50%",
                                        transform: "translate(-50%,-50%)",
                                        textAlign: "center",
                                    }}
                                >
                                    <div style={{ fontSize: 20, fontWeight: 700, color: "#111" }}>{efficiencyPct}%</div>
                                    <div style={{ fontSize: 9, color: "#aaa" }}>efficiency</div>
                                </div>
                            </div>
                            <div style={{ flex: 1 }}>
                                {[
                                    { label: "Confirmed", val: stats.confirmedAppts, color: TEAL },
                                    { label: "In-Progress", val: stats.inProgressAppts, color: AMBER },
                                    { label: "Cancelled", val: stats.cancelledAppts, color: RED },
                                ].map((item) => (
                                    <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 11, color: "#666", marginBottom: 8 }}>
                                        <span style={{ width: 9, height: 9, borderRadius: "50%", background: item.color, flexShrink: 0 }} />
                                        {item.label}
                                        <span style={{ marginLeft: "auto", fontWeight: 600, color: "#111" }}>{item.val}</span>
                                    </div>
                                ))}
                                <div style={{ marginTop: 10, paddingTop: 10, borderTop: "0.5px solid rgba(0,0,0,0.07)" }}>
                                    <div style={{ fontSize: 10, color: "#aaa" }}>Total</div>
                                    <div style={{ fontSize: 16, fontWeight: 700, color: "#111" }}>{totalApptForDonut}</div>
                                </div>
                            </div>
                        </div>
                    </SectionCard>
                </div>

                {/* ── Bottom grid ── */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>

                    {/* Recent Appointments */}
                    <SectionCard title="Recent Appointments" action="View all">
                        {loading
                            ? [1, 2, 3].map((i) => (
                                <div key={i} style={{ display: "flex", gap: 10, padding: "8px 0", borderBottom: "0.5px solid rgba(0,0,0,0.06)" }}>
                                    <Skeleton h={8} w={8} style={{ borderRadius: "50%", marginTop: 5 }} />
                                    <div style={{ flex: 1 }}>
                                        <Skeleton h={11} w="70%" style={{ marginBottom: 5 }} />
                                        <Skeleton h={9} w="50%" />
                                    </div>
                                </div>
                            ))
                            : appointments.slice(0, 6).map((a, i) => {
                                const sc = STATUS_COLORS[a.status] || STATUS_COLORS.pending;
                                return (
                                    <div key={a.id} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "8px 0", borderBottom: i < 5 ? "0.5px solid rgba(0,0,0,0.06)" : "none" }}>
                                        <span style={{ width: 8, height: 8, borderRadius: "50%", background: sc.dot, marginTop: 5, flexShrink: 0 }} />
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ fontSize: 12, fontWeight: 600, color: "#111", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                                {a.reason || "—"}
                                            </div>
                                            <div style={{ fontSize: 10, color: "#888", marginTop: 1 }}>
                                                {a.patient?.patient_code || `PAT-${a.patient_id}`} · {a.appointment_date} {a.appointment_time?.slice(0, 5)}
                                            </div>
                                        </div>
                                        <Badge status={a.status}>{a.status}</Badge>
                                    </div>
                                );
                            })}
                    </SectionCard>

                    {/* Bills */}
                    <SectionCard title="Latest Bills" action="View all">
                        {loading
                            ? [1, 2, 3].map((i) => (
                                <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "0.5px solid rgba(0,0,0,0.06)" }}>
                                    <div><Skeleton h={11} w={100} style={{ marginBottom: 5 }} /><Skeleton h={9} w={80} /></div>
                                    <Skeleton h={30} w={60} />
                                </div>
                            ))
                            : bills.slice(0, 5).map((b, i) => (
                                <div key={b.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 0", borderBottom: i < 4 ? "0.5px solid rgba(0,0,0,0.06)" : "none" }}>
                                    <div>
                                        <div style={{ fontSize: 12, fontWeight: 600, color: "#111" }}>
                                            Bill #{b.id} · PAT-{b.patient_id}
                                        </div>
                                        <div style={{ fontSize: 10, color: "#888", marginTop: 1 }}>
                                            Consult ${parseFloat(b.consultation_fee || 0).toFixed(2)} · Med ${parseFloat(b.medicine_fee || 0).toFixed(2)}
                                        </div>
                                    </div>
                                    <div style={{ textAlign: "right" }}>
                                        <div style={{ fontSize: 13, fontWeight: 700, color: "#111" }}>${parseFloat(b.total_amount || 0).toFixed(2)}</div>
                                        <Badge status={b.payment_status}>{b.payment_status}</Badge>
                                    </div>
                                </div>
                            ))}
                        <div style={{ marginTop: 10, paddingTop: 10, borderTop: "0.5px solid rgba(0,0,0,0.07)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span style={{ fontSize: 11, color: "#888" }}>Total revenue</span>
                            <span style={{ fontSize: 14, fontWeight: 700, color: TEAL_MID }}>
                                ${stats.totalIncome.toFixed(2)}
                            </span>
                        </div>
                    </SectionCard>

                    {/* Doctors */}
                    <SectionCard title="Active Doctors" action="View all">
                        {loading
                            ? [1, 2, 3].map((i) => (
                                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: "0.5px solid rgba(0,0,0,0.06)" }}>
                                    <Skeleton h={30} w={30} style={{ borderRadius: "50%" }} />
                                    <div style={{ flex: 1 }}><Skeleton h={11} w="60%" style={{ marginBottom: 5 }} /><Skeleton h={9} w="40%" /></div>
                                </div>
                            ))
                            : doctors.slice(0, 6).map((d, i) => {
                                const sc = STATUS_COLORS[d.status] || STATUS_COLORS.available;
                                return (
                                    <div key={d.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: i < doctors.slice(0, 6).length - 1 ? "0.5px solid rgba(0,0,0,0.06)" : "none" }}>
                                        <Avatar name={d.user?.name || d.doctor_code} id={d.id} size={30} />
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ fontSize: 12, fontWeight: 600, color: "#111", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                                {d.user?.name || "—"}
                                            </div>
                                            <div style={{ fontSize: 10, color: "#888" }}>{d.doctor_code} · {d.working_day}</div>
                                        </div>
                                        <span style={{ width: 8, height: 8, borderRadius: "50%", background: sc.dot, flexShrink: 0 }} title={d.status} />
                                    </div>
                                );
                            })}
                    </SectionCard>
                </div>

                {/* ── Activity + Patients + Promo ── */}
                <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr 0.8fr", gap: "1rem", marginBottom: "1rem" }}>

                    {/* Activity feed */}
                    <SectionCard title="Recent Clinical Activities" action="View all">
                        {activities.map((act, i) => (
                            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "8px 0", borderBottom: i < activities.length - 1 ? "0.5px solid rgba(0,0,0,0.06)" : "none" }}>
                                <div
                                    style={{
                                        width: 30,
                                        height: 30,
                                        borderRadius: "50%",
                                        background: act.iconBg,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        fontSize: 14,
                                        flexShrink: 0,
                                    }}
                                >
                                    {act.icon}
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontSize: 12, fontWeight: 600, color: "#111" }}>{act.text}</div>
                                    <div style={{ fontSize: 10, color: "#888", marginTop: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                        {act.sub}
                                    </div>
                                </div>
                                <span style={{ fontSize: 10, color: "#aaa", whiteSpace: "nowrap", flexShrink: 0 }}>{timeAgo(act.time)}</span>
                            </div>
                        ))}
                    </SectionCard>

                    {/* Patients list */}
                    <SectionCard title="Recent Patients" action="View all">
                        {loading
                            ? [1, 2, 3, 4].map((i) => (
                                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: "0.5px solid rgba(0,0,0,0.06)" }}>
                                    <Skeleton h={30} w={30} style={{ borderRadius: "50%" }} />
                                    <div style={{ flex: 1 }}><Skeleton h={11} w="60%" style={{ marginBottom: 5 }} /><Skeleton h={9} w="40%" /></div>
                                </div>
                            ))
                            : patients.slice(0, 6).map((p, i) => {
                                const bg = STATUS_COLORS[p.blood_group] || { bg: "#f3f4f6", color: "#555" };
                                return (
                                    <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: i < patients.slice(0, 6).length - 1 ? "0.5px solid rgba(0,0,0,0.06)" : "none" }}>
                                        <Avatar name={p.user?.name || p.patient_code} id={p.id} size={30} />
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ fontSize: 12, fontWeight: 600, color: "#111", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                                {p.user?.name || p.patient_code}
                                            </div>
                                            <div style={{ fontSize: 10, color: "#888", marginTop: 1 }}>
                                                {p.gender} · {calcAge(p.date_of_birth)}
                                            </div>
                                        </div>
                                        <span style={{ fontSize: 10, fontWeight: 600, background: bg.bg, color: bg.color, borderRadius: 99, padding: "2px 7px" }}>
                                            {p.blood_group || "—"}
                                        </span>
                                    </div>
                                );
                            })}
                    </SectionCard>

                    {/* Promo + today summary */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                        <SectionCard title="Today's Appointments" style={{ flex: 1 }}>
                            {todayAppts.length === 0 ? (
                                <div style={{ textAlign: "center", padding: "20px 0", color: "#aaa", fontSize: 12 }}>
                                    No appointments today
                                </div>
                            ) : (
                                todayAppts.slice(0, 4).map((a, i) => {
                                    const sc = STATUS_COLORS[a.status] || STATUS_COLORS.pending;
                                    return (
                                        <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 0", borderBottom: i < todayAppts.length - 1 ? "0.5px solid rgba(0,0,0,0.06)" : "none" }}>
                                            <span style={{ fontSize: 11, color: "#888", minWidth: 38 }}>{a.appointment_time?.slice(0, 5)}</span>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ fontSize: 11, fontWeight: 600, color: "#111", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                                    {a.reason}
                                                </div>
                                            </div>
                                            <span style={{ width: 7, height: 7, borderRadius: "50%", background: sc.dot, flexShrink: 0 }} />
                                        </div>
                                    );
                                })
                            )}
                        </SectionCard>

                        <div
                            style={{
                                background: "#185FA5",
                                borderRadius: 12,
                                padding: "16px 20px",
                            }}
                        >
                            <span
                                style={{
                                    fontSize: 9,
                                    background: TEAL,
                                    color: "#e1f5ee",
                                    borderRadius: 99,
                                    padding: "2px 9px",
                                    display: "inline-block",
                                    marginBottom: 8,
                                    fontWeight: 600,
                                    letterSpacing: "0.05em",
                                    textTransform: "uppercase",
                                }}
                            >
                                Pro Feature
                            </span>
                            <h3 style={{ fontSize: 13, fontWeight: 600, color: "#e1f5ee", marginBottom: 5 }}>
                                Telemedicine Integration
                            </h3>
                            <p style={{ fontSize: 11, color: "#5dcaa5", marginBottom: 12, lineHeight: 1.6 }}>
                                Host HD video consultations directly from the CMS dashboard. No third-party apps needed.
                            </p>
                            <button
                                style={{
                                    width: "100%",
                                    background: "#fff",
                                    color: "#085041",
                                    border: "none",
                                    borderRadius: 8,
                                    padding: "7px 14px",
                                    fontSize: 11,
                                    fontWeight: 600,
                                    cursor: "pointer",
                                }}
                            >
                                Learn More
                            </button>
                        </div>
                    </div>
                </div>

                {/* ── Consultations table ── */}
                {consultations.length > 0 && (
                    <SectionCard title="Recent Consultations" action="View all" style={{ marginBottom: "1rem" }}>
                        <div style={{ overflowX: "auto" }}>
                            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                                <thead>
                                    <tr style={{ borderBottom: "0.5px solid rgba(0,0,0,0.08)" }}>
                                        {["ID", "Patient", "Doctor", "Appointment Date", "Symptoms", "Diagnosis", "Note", "Date"].map((h) => (
                                            <th key={h} style={{ textAlign: "left", padding: "6px 10px", fontSize: 10, color: "#aaa", fontWeight: 600, whiteSpace: "nowrap" }}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {consultations.slice(0, 5).map((c, i) => (
                                        <tr key={c.id} style={{ borderBottom: i < 4 ? "0.5px solid rgba(0,0,0,0.05)" : "none" }}>
                                            <td style={{ padding: "8px 10px", color: "#aaa" }}>#{c.id}</td>
                                            <td style={{ padding: "8px 10px" }}>
                                                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                                    <Avatar name={`PAT-${c.patient_id}`} id={c.patient_id} size={24} />
                                                    <span style={{ color: "#111", fontWeight: 500 }}>PAT-{c.patient_id}</span>
                                                </div>
                                            </td>
                                            <td style={{ padding: "8px 10px", color: "#555" }}>DOC-{c.doctor_id}</td>
                                            <td style={{ padding: "8px 10px", color: "#555", whiteSpace: "nowrap" }}>{c.appointment?.appointment_date || "—"}</td>
                                            <td style={{ padding: "8px 10px", color: "#555" }}>{c.symptoms || "—"}</td>
                                            <td style={{ padding: "8px 10px", color: "#555" }}>{c.diagnosis || "—"}</td>
                                            <td style={{ padding: "8px 10px", color: "#555" }}>{c.note || "—"}</td>
                                            <td style={{ padding: "8px 10px", color: "#aaa", whiteSpace: "nowrap" }}>{new Date(c.created_at).toLocaleDateString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </SectionCard>
                )}

                {/* Footer */}
                <div style={{ textAlign: "center", fontSize: 10, color: "#bbb", paddingTop: "1rem", borderTop: "0.5px solid rgba(0,0,0,0.06)", marginTop: "0.5rem" }}>
                    © 2024 MediFlow CMS. All rights reserved. Precise clinical management for modern healthcare.
                </div>
            </div>
        </div>
    );
}