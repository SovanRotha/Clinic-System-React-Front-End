import PatientSidebar from "./PatientSidebar";
import { useState, useEffect } from "react";

const statusConfig = {
    completed: {
        label: "Completed",
        bg: "bg-emerald-50",
        text: "text-emerald-700",
        dot: "bg-emerald-500",
        border: "border-emerald-200",
    },
    pending: {
        label: "Pending",
        bg: "bg-amber-50",
        text: "text-amber-700",
        dot: "bg-amber-400",
        border: "border-amber-200",
    },
    cancelled: {
        label: "Cancelled",
        bg: "bg-rose-50",
        text: "text-rose-700",
        dot: "bg-rose-400",
        border: "border-rose-200",
    },
};

function StatusBadge({ status }) {
    const cfg = statusConfig[status] || statusConfig.cancelled;
    return (
        <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${cfg.bg} ${cfg.text} ${cfg.border}`}
        >
            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
            {cfg.label || status}
        </span>
    );
}

function StatCard({ label, value, accent }) {
    const accents = {
        default: "from-slate-50 to-white border-slate-200 text-slate-800",
        green: "from-emerald-50 to-white border-emerald-200 text-emerald-800",
        amber: "from-amber-50 to-white border-amber-200 text-amber-800",
    };
    const cls = accents[accent] || accents.default;
    return (
        <div
            className={`bg-linear-to-br ${cls} border rounded-2xl p-5 flex flex-col gap-1 shadow-sm`}
        >
            <p className="text-xs font-semibold uppercase tracking-widest opacity-60">
                {label}
            </p>
            <p className="text-3xl font-bold">{value}</p>
        </div>
    );
}

function formatTime(t) {
    if (!t) return "—";
    const [h, m] = t.split(":");
    const hour = parseInt(h, 10);
    return `${hour % 12 || 12}:${m} ${hour >= 12 ? "PM" : "AM"}`;
}

function formatDate(d) {
    if (!d) return "—";
    const date = new Date(d);
    return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}

function AvatarInitials({ name, color = "blue" }) {
    const colors = {
        blue: "bg-blue-100 text-blue-700",
        slate: "bg-slate-100 text-slate-600",
    };
    const initials = name
        ? name
              .split(" ")
              .slice(0, 2)
              .map((w) => w[0])
              .join("")
              .toUpperCase()
        : "?";
    return (
        <span
            className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold ${colors[color]}`}
        >
            {initials}
        </span>
    );
}

export default function PatientAppointments() {
    const [appointments, setAppointments] = useState([]);
    const [patientProfile, setPatientProfile] = useState(null);
    const [errorMessage, setErrorMessage] = useState("");
    const [filter, setFilter] = useState("all");

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        const user = storedUser ? JSON.parse(storedUser) : null;
        const token = localStorage.getItem("token");

        if (!user?.id || !token) {
            setErrorMessage("Missing user or token.");
            return;
        }

        const headers = {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
        };

        fetch(`https://clinic-system-back-end.onrender.com/api/patient-profile/${user.id}`, { headers })
            .then((res) => res.json())
            .then((data) => setPatientProfile(data.data || data))
            .catch(() => setErrorMessage("Failed to load patient profile"));

        fetch(`https://clinic-system-back-end.onrender.com/api/my-appointments`, { headers })
            .then((res) => res.json())
            .then((data) => {
                const items = Array.isArray(data?.data)
                    ? data.data
                    : Array.isArray(data)
                    ? data
                    : [];
                setAppointments(items);
            })
            .catch(() => setErrorMessage("Failed to load appointments"));
    }, []);

    const filtered =
        filter === "all"
            ? appointments
            : appointments.filter((a) => a.status === filter);

    const patientName = patientProfile?.user?.name;

    return (
        <div className="flex min-h-screen bg-[#f6f7fb] font-sans">
            <PatientSidebar />

            <main className="flex-1 p-8 max-w-6xl mx-auto" style={{ marginLeft: 40 }}>
                {/* ── Page Header ── */}
                <div className="mb-8 flex items-end justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-1">
                            Patient Portal
                        </p>
                        <h1 className="text-3xl font-bold text-slate-800 tracking-tight">
                            {patientName ? `${patientName}'s Appointments` : "My Appointments"}
                        </h1>
                    </div>
                    <span className="text-sm text-slate-400 font-medium">
                        {new Date().toLocaleDateString("en-US", {
                            weekday: "long",
                            month: "long",
                            day: "numeric",
                        })}
                    </span>
                </div>

                {/* ── Error ── */}
                {errorMessage && (
                    <div className="flex items-center gap-3 bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl mb-6 text-sm">
                        <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {errorMessage}
                    </div>
                )}

                {/* ── Stats ── */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                    <StatCard label="Total" value={appointments.length} accent="default" />
                    <StatCard
                        label="Completed"
                        value={appointments.filter((a) => a.status === "completed").length}
                        accent="green"
                    />
                    <StatCard
                        label="Pending"
                        value={appointments.filter((a) => a.status === "pending").length}
                        accent="amber"
                    />
                </div>

                {/* ── Filter Tabs ── */}
                <div className="flex gap-1 mb-5 bg-slate-100 p-1 rounded-xl w-fit">
                    {["all", "pending", "completed", "cancelled"].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-1.5 rounded-lg text-sm font-medium capitalize transition-all duration-150 ${
                                filter === f
                                    ? "bg-white text-slate-800 shadow-sm"
                                    : "text-slate-500 hover:text-slate-700"
                            }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>

                {/* ── Table ── */}
                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                    <table className="min-w-full">
                        <thead>
                            <tr className="border-b border-slate-100">
                                {["#", "Patient", "Doctor", "Reason", "Date", "Time", "Status"].map(
                                    (h) => (
                                        <th
                                            key={h}
                                            className="py-3.5 px-5 text-left text-xs font-semibold uppercase tracking-widest text-slate-400"
                                        >
                                            {h}
                                        </th>
                                    )
                                )}
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-50">
                            {filtered.length > 0 ? (
                                filtered.map((appt) => (
                                    <tr
                                        key={appt.id}
                                        className="hover:bg-slate-50/70 transition-colors duration-100 group"
                                    >
                                        {/* ID */}
                                        <td className="py-4 px-5">
                                            <span className="text-xs font-mono font-semibold text-slate-400">
                                                #{String(appt.id).padStart(4, "0")}
                                            </span>
                                        </td>

                                        {/* Patient */}
                                        <td className="py-4 px-5">
                                            <div className="flex items-center gap-2.5">
                                                <AvatarInitials
                                                    name={appt.patient?.patient_id}
                                                    color="slate"
                                                />
                                                <div>
                                                    <p className="text-sm font-semibold text-slate-700">
                                                        {appt.patient?.patient_code || "—"}
                                                    </p>
                                                    <p className="text-xs text-slate-400">
                                                        {[appt.patient?.gender, appt.patient?.blood_group]
                                                            .filter(Boolean)
                                                            .join(" · ") || "—"}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Doctor */}
                                        <td className="py-4 px-5">
                                            <div className="flex items-center gap-2.5">
                                                <AvatarInitials
                                                    name={appt.doctor?.doctor_code}
                                                    color="blue"
                                                />
                                                <div>
                                                    <p className="text-sm font-semibold text-blue-600">
                                                        {appt.doctor?.doctor_code || "—"}
                                                    </p>
                                                    <p className="text-xs text-slate-400">
                                                        {appt.doctor?.working_day || "—"}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Reason */}
                                        <td className="py-4 px-5 max-w-[180px]">
                                            <p className="text-sm text-slate-600 truncate">
                                                {appt.reason || "—"}
                                            </p>
                                        </td>

                                        {/* Date */}
                                        <td className="py-4 px-5 whitespace-nowrap">
                                            <div className="flex items-center gap-1.5 text-sm text-slate-600">
                                                <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                                {formatDate(appt.appointment_date)}
                                            </div>
                                        </td>

                                        {/* Time */}
                                        <td className="py-4 px-5 whitespace-nowrap">
                                            <div className="flex items-center gap-1.5 text-sm text-slate-600">
                                                <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                {formatTime(appt.appointment_time)}
                                            </div>
                                        </td>

                                        {/* Status */}
                                        <td className="py-4 px-5">
                                            <StatusBadge status={appt.status} />
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={7} className="py-16 text-center">
                                        <div className="flex flex-col items-center gap-3 text-slate-400">
                                            <svg className="w-10 h-10 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                            </svg>
                                            <p className="text-sm font-medium">No appointments found</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>

                    {/* Footer row count */}
                    {filtered.length > 0 && (
                        <div className="border-t border-slate-100 px-5 py-3 flex items-center justify-between">
                            <p className="text-xs text-slate-400">
                                Showing <span className="font-semibold text-slate-600">{filtered.length}</span> of{" "}
                                <span className="font-semibold text-slate-600">{appointments.length}</span> appointments
                            </p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}