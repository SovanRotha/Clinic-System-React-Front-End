import AdminSidebar from "./AdminSidebar";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function formatTime(t) {
    if (!t) return "—";
    const [h, m] = t.split(":");
    const hr = parseInt(h);
    return `${hr % 12 || 12}:${m} ${hr >= 12 ? "PM" : "AM"}`;
}

const AVATAR_COLORS = [
    { bg: "#E6F1FB", color: "#185FA5" },
    { bg: "#EEEDFE", color: "#534AB7" },
    { bg: "#E1F5EE", color: "#0F6E56" },
    { bg: "#FAECE7", color: "#993C1D" },
    { bg: "#FAEEDA", color: "#854F0B" },
    { bg: "#FBEAF0", color: "#993556" },
];

function getInitials(name) {
    if (!name) return "?";
    return name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((n) => n[0].toUpperCase())
        .join("");
}

function StatusBadge({ status }) {
    const s = (status || "").toLowerCase();
    const styles = {
        active: { background: "#EAF3DE", color: "#3B6D11" },
        on_leave: { background: "#FAECE7", color: "#993C1D" },
        leave: { background: "#FAECE7", color: "#993C1D" },
        pending: { background: "#FAEEDA", color: "#854F0B" },
        inactive: { background: "#F1EFE8", color: "#5F5E5A" },
    };
    const style = styles[s] || styles["inactive"];
    const label = s === "on_leave" || s === "leave" ? "ON LEAVE" : status?.toUpperCase() || "—";
    return (
        <span style={{
            ...style,
            display: "inline-flex",
            alignItems: "center",
            padding: "3px 10px",
            borderRadius: "99px",
            fontSize: "11px",
            fontWeight: 500,
            letterSpacing: "0.03em",
            whiteSpace: "nowrap",
        }}>
            {label}
        </span>
    );
}

function DoctorManagement() {
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [currentPage, setCurrentPage] = useState(1);
    const perPage = 5;
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            setError("Missing authentication token.");
            setLoading(false);
            return;
        }
        fetch("http://127.0.0.1:8000/api/doctor", {
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
            },
        })
            .then((res) => res.json().catch(() => null))
            .then((data) => {
                const arr = Array.isArray(data)
                    ? data
                    : Array.isArray(data?.doctors)
                    ? data.doctors
                    : Array.isArray(data?.data)
                    ? data.data
                    : [];
                setDoctors(arr);
            })
            .catch(() => setError("Unable to load doctors."))
            .finally(() => setLoading(false));
    }, []);

    const safeDoctors = Array.isArray(doctors) ? doctors : [];

    const filtered = safeDoctors.filter((d) => {
        const name = d.user?.name?.toLowerCase() || "";
        const email = d.user?.email?.toLowerCase() || "";
        const code = d.doctor_code?.toLowerCase() || "";
        const spec = d.specialization?.toLowerCase() || "";
        const q = search.toLowerCase();
        const matchSearch = !search || name.includes(q) || email.includes(q) || code.includes(q) || spec.includes(q);
        const matchStatus = statusFilter === "All" || (d.status || "").toLowerCase() === statusFilter.toLowerCase();
        return matchSearch && matchStatus;
    });

    const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
    const paginated = filtered.slice((currentPage - 1) * perPage, currentPage * perPage);

    const totalDoctors = safeDoctors.length;
    const activeCount = safeDoctors.filter((d) => (d.status || "").toLowerCase() === "active").length;
    const onLeaveCount = safeDoctors.filter((d) => ["on_leave", "leave"].includes((d.status || "").toLowerCase())).length;
    const avgFee = safeDoctors.length
        ? Math.round(safeDoctors.reduce((sum, d) => sum + parseFloat(d.consultation_fee || 0), 0) / safeDoctors.length)
        : 0;

    const statuses = ["All", "active", "pending", "on_leave", "inactive"];

    const handleDelete = (id) => {
        if (!window.confirm("Delete this doctor?")) return;
        const token = localStorage.getItem("token");
        fetch(`http://127.0.0.1:8000/api/doctor/${id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
        })
            .then((res) => {
                if (res.ok) setDoctors((prev) => prev.filter((d) => d.id !== id));
                else alert("Failed to delete doctor.");
            })
            .catch(() => alert("Network error."));
    };

    return (
        <div style={{ display: "flex", background: "#F4F6FA", minHeight: "100vh" }}>
            <AdminSidebar />

            <main style={{ flex: 1, padding: "0", display: "flex", flexDirection: "column" }}>
                {/* Top Bar */}
                <div style={{
                    background: "#fff",
                    borderBottom: "0.5px solid #E2E6EF",
                    padding: "0 24px",
                    height: "56px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    position: "sticky",
                    top: 0,
                    zIndex: 10,
                }}>
                    <span style={{ fontSize: "16px", fontWeight: 600, color: "#185FA5" }}>
                        Doctor Management
                    </span>
                    <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                        {/* Search */}
                        <div style={{
                            display: "flex", alignItems: "center", gap: "8px",
                            background: "#F4F6FA", border: "0.5px solid #D8DDE8",
                            borderRadius: "8px", padding: "7px 14px", width: "260px",
                        }}>
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#8A94A6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                            </svg>
                            <input
                                value={search}
                                onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                                placeholder="Search by name, ID, or specialization..."
                                style={{ border: "none", background: "transparent", fontSize: "13px", color: "#3D4A5C", outline: "none", width: "100%" }}
                            />
                        </div>
                        {/* Bell */}
                        <div style={{ position: "relative", cursor: "pointer" }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8A94A6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                            </svg>
                            <span style={{ position: "absolute", top: "-3px", right: "-3px", width: "8px", height: "8px", background: "#E24B4A", borderRadius: "50%", border: "1.5px solid #fff" }}></span>
                        </div>
                        {/* Avatar */}
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                            <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "#B5D4F4", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: 600, color: "#0C447C" }}>AU</div>
                            <span style={{ fontSize: "13px", color: "#3D4A5C", fontWeight: 500 }}>Admin User</span>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#8A94A6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="6 9 12 15 18 9"/>
                            </svg>
                        </div>
                    </div>
                </div>

                <div style={{ padding: "24px" }}>
                    {/* Page Title */}
                    <div style={{ marginBottom: "20px" }}>
                        <h1 style={{ fontSize: "22px", fontWeight: 600, color: "#1A2236", margin: 0 }}>Doctors</h1>
                        <p style={{ fontSize: "13px", color: "#8A94A6", marginTop: "4px" }}>Manage all registered doctors, view details, and perform administrative actions.</p>
                    </div>

                    {/* Toolbar */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
                        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                            {/* Specialization filter placeholder */}
                            <button style={filterBtnStyle}>
                                All Specializations
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
                            </button>
                            {/* Status filter */}
                            <div style={{ position: "relative" }}>
                                <select
                                    value={statusFilter}
                                    onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                                    style={{ ...filterBtnStyle, appearance: "none", paddingRight: "28px", cursor: "pointer", background: "#fff" }}
                                >
                                    {statuses.map((s) => (
                                        <option key={s} value={s}>
                                            Status: {s === "on_leave" ? "On Leave" : s.charAt(0).toUpperCase() + s.slice(1)}
                                        </option>
                                    ))}
                                </select>
                                <svg style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#8A94A6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
                            </div>
                            <button style={filterBtnStyle}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="12" y1="18" x2="12" y2="18"/></svg>
                                More Filters
                            </button>
                        </div>
                        <button style={addBtnStyle} onClick={()=>navigate("/admin/adddoctor")}>
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                            Add New Doctor
                        </button>
                    </div>

                    {/* Loading / Error */}
                    {loading && (
                        <div style={{ textAlign: "center", padding: "60px", color: "#8A94A6", fontSize: "14px" }}>
                            Loading doctors...
                        </div>
                    )}
                    {error && (
                        <div style={{ background: "#FCEBEB", border: "0.5px solid #F7C1C1", borderRadius: "8px", padding: "12px 16px", color: "#A32D2D", fontSize: "13px", marginBottom: "16px" }}>
                            {error}
                        </div>
                    )}

                    {/* Table */}
                    {!loading && !error && (
                        <div style={{ background: "#fff", border: "0.5px solid #E2E6EF", borderRadius: "12px", overflow: "hidden", marginBottom: "20px" }}>
                            <div style={{ padding: "12px 18px", borderBottom: "0.5px solid #E2E6EF", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                <span style={{ fontSize: "13px", color: "#8A94A6" }}>
                                    {filtered.length} doctor{filtered.length !== 1 ? "s" : ""} found
                                </span>
                            </div>

                            <div style={{ overflowX: "auto" }}>
                                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                                    <thead>
                                        <tr style={{ background: "#F8F9FC" }}>
                                            {["Doctor ID", "Name", "Specialization", "Phone Number",  "Status", "Action"].map((h) => (
                                                <th key={h} style={{
                                                    padding: "10px 16px", textAlign: "left",
                                                    fontSize: "11px", fontWeight: 600, color: "#8A94A6",
                                                    textTransform: "uppercase", letterSpacing: "0.05em",
                                                    borderBottom: "0.5px solid #E2E6EF", whiteSpace: "nowrap",
                                                }}>{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {paginated.length === 0 ? (
                                            <tr>
                                                <td colSpan={7} style={{ padding: "48px", textAlign: "center", color: "#8A94A6", fontSize: "13px" }}>
                                                    No doctors match your filters.
                                                </td>
                                            </tr>
                                        ) : (
                                            paginated.map((doctor, idx) => {
                                                const ac = AVATAR_COLORS[idx % AVATAR_COLORS.length];
                                                const initials = getInitials(doctor.user?.name);
                                                return (
                                                    <tr key={doctor.id} style={{ borderBottom: "0.5px solid #F0F2F7", transition: "background 0.15s" }}
                                                        onMouseEnter={e => e.currentTarget.style.background = "#F8F9FC"}
                                                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                                                    >
                                                        <td style={{ padding: "14px 16px", color: "#8A94A6", fontSize: "12px", fontFamily: "monospace", whiteSpace: "nowrap" }}>
                                                            {doctor.doctor_code || `DR-${doctor.id}`}
                                                        </td>
                                                        <td style={{ padding: "14px 16px" }}>
                                                            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                                                <div style={{
                                                                    width: "36px", height: "36px", borderRadius: "50%",
                                                                    background: ac.bg, color: ac.color,
                                                                    display: "flex", alignItems: "center", justifyContent: "center",
                                                                    fontSize: "12px", fontWeight: 600, flexShrink: 0,
                                                                }}>
                                                                    {initials}
                                                                </div>
                                                                <div>
                                                                    <div style={{ fontWeight: 600, color: "#1A2236", fontSize: "13px" }}>
                                                                        {doctor.user?.name || "—"}
                                                                    </div>
                                                                    <div style={{ fontSize: "12px", color: "#8A94A6" }}>
                                                                        {doctor.user?.email || "—"}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td style={{ padding: "14px 16px", color: "#3D4A5C" }}>
                                                            {doctor.specialization || "—"}
                                                        </td>
                                                        <td style={{ padding: "14px 16px", color: "#8A94A6", whiteSpace: "nowrap" }}>
                                                            {doctor.phone || doctor.user?.phone_number || "—"}
                                                        </td>
                                                        {/* <td style={{ padding: "14px 16px", fontWeight: 600, color: "#1A2236" }}>
                                                            {doctor.consultation_fee ? `$${parseFloat(doctor.consultation_fee).toFixed(2)}` : "—"}
                                                        </td> */}
                                                        <td style={{ padding: "14px 16px" }}>
                                                            <StatusBadge status={doctor.status} />
                                                        </td>
                                                        <td style={{ padding: "14px 16px" }}>
                                                            <div style={{ display: "flex", gap: "6px" }}>
                                                                <button
                                                                    style={editBtnStyle}
                                                                    onMouseEnter={e => e.currentTarget.style.background = "#E6F1FB"}
                                                                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                                                                    onClick={()=>navigate(`/admin/editdoctor/${doctor.id}`)}
                                                                >
                                                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                                                                    </svg>
                                                                    Edit
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDelete(doctor.id)}
                                                                    style={deleteBtnStyle}
                                                                    onMouseEnter={e => { e.currentTarget.style.background = "#FCEBEB"; e.currentTarget.style.borderColor = "#F7C1C1"; }}
                                                                    onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "#E2E6EF"; }}
                                                                >
                                                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                                        <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                                                                    </svg>
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            <div style={{ borderTop: "0.5px solid #E2E6EF", padding: "12px 18px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                <span style={{ fontSize: "13px", color: "#8A94A6" }}>
                                    Showing {filtered.length === 0 ? 0 : (currentPage - 1) * perPage + 1} to {Math.min(currentPage * perPage, filtered.length)} of {filtered.length} doctors
                                </span>
                                <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
                                    <button
                                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                        disabled={currentPage === 1}
                                        style={pgBtnStyle(false, currentPage === 1)}
                                    >
                                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
                                    </button>
                                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((p) => (
                                        <button key={p} onClick={() => setCurrentPage(p)} style={pgBtnStyle(p === currentPage, false)}>
                                            {p}
                                        </button>
                                    ))}
                                    {totalPages > 5 && <span style={{ color: "#8A94A6", fontSize: "13px", padding: "0 4px" }}>...</span>}
                                    <button
                                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                        disabled={currentPage === totalPages}
                                        style={pgBtnStyle(false, currentPage === totalPages)}
                                    >
                                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Stats Grid */}
                    {!loading && !error && (
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "14px" }}>
                            <StatCard
                                icon={<DoctorIcon />}
                                iconBg="#E6F1FB"
                                label="Total Doctors"
                                value={totalDoctors}
                            />
                            <StatCard
                                icon={<CheckIcon />}
                                iconBg="#EAF3DE"
                                label="Active Now"
                                value={activeCount}
                            />
                            <StatCard
                                icon={<FeeIcon />}
                                iconBg="#FAEEDA"
                                label="Avg. Fee"
                                value={`$${avgFee}`}
                            />
                            <StatCard
                                icon={<LeaveIcon />}
                                iconBg="#FAECE7"
                                label="On Leave"
                                value={onLeaveCount}
                            />
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

function StatCard({ icon, iconBg, label, value }) {
    return (
        <div style={{
            background: "#fff", border: "0.5px solid #E2E6EF", borderRadius: "12px",
            padding: "16px 18px", display: "flex", alignItems: "center", gap: "14px",
        }}>
            <div style={{ width: "42px", height: "42px", borderRadius: "10px", background: iconBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                {icon}
            </div>
            <div>
                <div style={{ fontSize: "11px", fontWeight: 600, color: "#8A94A6", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "3px" }}>{label}</div>
                <div style={{ fontSize: "24px", fontWeight: 600, color: "#1A2236", lineHeight: 1 }}>{value}</div>
            </div>
        </div>
    );
}

/* ── Inline SVG Icons ── */
function DoctorIcon() {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#185FA5" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
        </svg>
    );
}
function CheckIcon() {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3B6D11" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
        </svg>
    );
}
function FeeIcon() {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#854F0B" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
        </svg>
    );
}
function LeaveIcon() {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#993C1D" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="9" y1="16" x2="15" y2="16"/>
        </svg>
    );
}

/* ── Shared Style Objects ── */
const filterBtnStyle = {
    display: "inline-flex", alignItems: "center", gap: "6px",
    background: "#fff", border: "0.5px solid #D8DDE8",
    borderRadius: "8px", padding: "7px 13px",
    fontSize: "13px", color: "#3D4A5C", cursor: "pointer",
    fontFamily: "inherit",
};

const addBtnStyle = {
    display: "inline-flex", alignItems: "center", gap: "6px",
    background: "#185FA5", color: "#fff", border: "none",
    borderRadius: "8px", padding: "8px 18px",
    fontSize: "13px", fontWeight: 600, cursor: "pointer",
    fontFamily: "inherit",
};

const editBtnStyle = {
    display: "inline-flex", alignItems: "center", gap: "5px",
    background: "transparent", border: "0.5px solid #D8DDE8",
    borderRadius: "6px", padding: "5px 10px",
    fontSize: "12px", color: "#185FA5", cursor: "pointer",
    fontFamily: "inherit", transition: "background 0.15s",
};

const deleteBtnStyle = {
    display: "inline-flex", alignItems: "center", justifyContent: "center",
    background: "transparent", border: "0.5px solid #D8DDE8",
    borderRadius: "6px", padding: "5px 8px",
    color: "#A32D2D", cursor: "pointer",
    fontFamily: "inherit", transition: "all 0.15s",
};

const pgBtnStyle = (active, disabled) => ({
    width: "30px", height: "30px", borderRadius: "6px",
    border: active ? "none" : "0.5px solid #D8DDE8",
    background: active ? "#185FA5" : "transparent",
    color: active ? "#fff" : disabled ? "#C4CAD4" : "#3D4A5C",
    fontSize: "13px", cursor: disabled ? "default" : "pointer",
    display: "inline-flex", alignItems: "center", justifyContent: "center",
    fontFamily: "inherit", opacity: disabled ? 0.5 : 1,
});

export default DoctorManagement;