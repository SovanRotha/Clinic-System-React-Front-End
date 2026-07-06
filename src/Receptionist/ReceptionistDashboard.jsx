import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  CalendarClock,
  CreditCard,
  Plus,
  FileText,
  Bell,
  Clock,
  Search,
  TrendingUp,
  AlertCircle,
  ChevronRight,
  Pencil,
  CircleCheck,
  RefreshCw,
  Eye,
  UserCheck,
  UserPlus,
  SlidersHorizontal,
  MoreHorizontal,
  LineChart,
} from "lucide-react";

// ─── Palette & helpers ────────────────────────────────────────────────────────
const STATUS = {
  Confirmed: {
    label: "Confirmed",
    dot: "#1D9E75",
    bg: "#E1F5EE",
    text: "#0F6E56",
  },
  Pending: {
    label: "Pending",
    dot: "#EF9F27",
    bg: "#FAEEDA",
    text: "#854F0B",
  },
  Cancelled: {
    label: "Cancelled",
    dot: "#E24B4A",
    bg: "#FCEBEB",
    text: "#A32D2D",
  },
  Completed: {
    label: "Completed",
    dot: "#185FA5",
    bg: "#E6F1FB",
    text: "#185FA5",
  },
};

const AVATAR_COLORS = [
  { bg: "#E6F1FB", text: "#185FA5" },
  { bg: "#E1F5EE", text: "#0F6E56" },
  { bg: "#FAECE7", text: "#993C1D" },
  { bg: "#EEEDFE", text: "#534AB7" },
  { bg: "#EAF3DE", text: "#3B6D11" },
];

function initials(name) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function avatarColor(idx) {
  return AVATAR_COLORS[idx % AVATAR_COLORS.length];
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Avatar({ name, size = 36, idx = 0, style = {} }) {
  const c = avatarColor(idx);
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: c.bg,
        color: c.text,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size <= 36 ? 12 : 14,
        fontWeight: 500,
        flexShrink: 0,
        ...style,
      }}
    >
      {initials(name)}
    </div>
  );
}

function StatusPill({ status }) {
  const s = STATUS[status] || STATUS.Pending;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "4px 12px",
        borderRadius: 20,
        background: s.bg,
        color: s.text,
        fontSize: 13,
        fontWeight: 500,
        whiteSpace: "nowrap",
      }}
    >
      <span
        style={{
          width: 7,
          height: 7,
          borderRadius: "50%",
          background: s.dot,
          flexShrink: 0,
        }}
      />
      {s.label}
    </span>
  );
}

function IconBtn({ children, onClick, style = {} }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: 32,
        height: 32,
        borderRadius: 8,
        background: "#F4F7FA",
        border: "0.5px solid rgba(0,0,0,0.1)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        color: "#64748b",
        padding: 0,
        ...style,
      }}
    >
      {children}
    </button>
  );
}

function Card({ children, style = {}, className = "" }) {
  return (
    <div
      className={className}
      style={{
        background: "#fff",
        border: "0.5px solid rgba(0,0,0,0.09)",
        borderRadius: 16,
        padding: "20px 22px",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const SCHEDULE = [
  {
    time: "09:00 AM",
    patient: "Alice Johnson",
    doctor: "Dr. Sarah Miller",
    status: "Confirmed",
  },
  {
    time: "09:30 AM",
    patient: "Michael Brown",
    doctor: "Dr. Robert Chen",
    status: "Pending",
  },
  {
    time: "10:15 AM",
    patient: "David Wilson",
    doctor: "Dr. Sarah Miller",
    status: "Cancelled",
  },
  {
    time: "11:00 AM",
    patient: "Emily Moore",
    doctor: "Dr. Emily Watts",
    status: "Completed",
  },
  {
    time: "11:30 AM",
    patient: "James Carter",
    doctor: "Dr. Robert Chen",
    status: "Confirmed",
  },
  {
    time: "02:00 PM",
    patient: "Linda Park",
    doctor: "Dr. Emily Watts",
    status: "Pending",
  },
];

const RECENT = [
  { name: "Robert Garcia", id: "MED-9921", ago: "2h ago" },
  { name: "Jessica Taylor", id: "MED-9920", ago: "5h ago" },
  { name: "Marcus Lee", id: "MED-9919", ago: "Yesterday" },
  { name: "Priya Nair", id: "MED-9918", ago: "Yesterday" },
];

const CHART_POINTS = [65, 58, 50, 42, 48, 38, 28, 18, 15, 12, 20, 16];

function sparkPath(pts, w, h) {
  const mx = Math.max(...pts);
  const mn = Math.min(...pts);
  const xs = pts.map((_, i) => (i / (pts.length - 1)) * w);
  const ys = pts.map((p) => h - ((p - mn) / (mx - mn || 1)) * (h - 10) - 5);
  const pairs = xs.map((x, i) => [x, ys[i]]);
  const d = pairs
    .map(([x, y], i) => {
      if (i === 0) return `M${x},${y}`;
      const [px, py] = pairs[i - 1];
      const cx1 = px + (x - px) / 3;
      const cx2 = x - (x - px) / 3;
      return `C${cx1},${py} ${cx2},${y} ${x},${y}`;
    })
    .join(" ");
  return { d, last: pairs[pairs.length - 1] };
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function ReceptionistDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    appointments: 0,
    patients: 0,
    bills: 0,
  });
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: "", gender: "Male", phone: "" });
  const [searchVal, setSearchVal] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }
    const fetchCounts = async () => {
      try {
        const headers = {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        };
        const [aRes, pRes, bRes] = await Promise.all([
          fetch("https://clinic-system-back-end.onrender.com/api/appointment", { headers }),
          fetch("https://clinic-system-back-end.onrender.com/api/patients", { headers }),
          fetch("https://clinic-system-back-end.onrender.com/api/bill", { headers }),
        ]);
        const [aData, pData, bData] = await Promise.all([
          aRes.json(),
          pRes.json(),
          bRes.json(),
        ]);
        setStats({
          appointments: Array.isArray(aData.data) ? aData.data.length : 0,
          patients: Array.isArray(pData.data) ? pData.data.length : 0,
          bills: Array.isArray(bData.data) ? bData.data.length : 0,
        });
      } catch (e) {
        console.error("Dashboard stats error", e);
      } finally {
        setLoading(false);
      }
    };
    fetchCounts();
  }, []);

  const { d: sparkD, last: sparkLast } = sparkPath(CHART_POINTS, 280, 80);

  // ─── Styles ──────────────────────────────────────────────────────────────────
  const styles = {
    root: {
      minHeight: "100vh",
      background: "#F0F4FA",
      fontFamily:
        "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    },

    // Topbar
    topbar: {
      background: "#fff",
      borderBottom: "0.5px solid rgba(0,0,0,0.09)",
      padding: "0 28px",
      height: 58,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      position: "sticky",
      top: 0,
      zIndex: 100,
    },
    searchBox: {
      display: "flex",
      alignItems: "center",
      gap: 9,
      background: "#F4F7FA",
      border: "0.5px solid rgba(0,0,0,0.09)",
      borderRadius: 10,
      padding: "8px 15px",
      width: 300,
      fontSize: 15,
      color: "#94a3b8",
      cursor: "text",
    },
    searchInput: {
      border: "none",
      background: "transparent",
      outline: "none",
      fontSize: 15,
      color: "#334155",
      width: "100%",
    },
    topbarRight: {
      display: "flex",
      alignItems: "center",
      gap: 14,
    },
    userInfo: { textAlign: "right" },
    userName: { fontSize: 15, fontWeight: 500, color: "#0f172a" },
    userRole: {
      fontSize: 12,
      color: "#94a3b8",
      textTransform: "uppercase",
      letterSpacing: "0.5px",
    },

    // Layout
    main: {
      padding: "26px 28px",
      maxWidth: 1200,
      margin: "0 auto",
      display: "flex",
      flexDirection: "column",
      gap: 22,
    },

    // Header
    pageHeader: {
      display: "flex",
      alignItems: "flex-start",
      justifyContent: "space-between",
    },
    pageTitle: {
      fontSize: 25,
      fontWeight: 600,
      color: "#0f172a",
      lineHeight: 1.2,
    },
    pageSub: { fontSize: 15, color: "#64748b", marginTop: 5 },
    btnPrimary: {
      display: "flex",
      alignItems: "center",
      gap: 8,
      background: "#185FA5",
      color: "#fff",
      border: "none",
      borderRadius: 10,
      padding: "10px 20px",
      fontSize: 15,
      fontWeight: 500,
      cursor: "pointer",
      whiteSpace: "nowrap",
      transition: "background 0.15s",
    },

    // Stat cards
    statGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(4, 1fr)",
      gap: 18,
    },
    statCard: {
      background: "#fff",
      border: "0.5px solid rgba(0,0,0,0.09)",
      borderRadius: 16,
      padding: "20px 22px",
      display: "flex",
      flexDirection: "column",
      gap: 12,
    },
    statTop: {
      display: "flex",
      alignItems: "flex-start",
      justifyContent: "space-between",
    },
    statIcon: {
      width: 42,
      height: 42,
      borderRadius: 10,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    statLabel: { fontSize: 15, color: "#64748b" },
    statValue: { fontSize: 25, fontWeight: 600, color: "#0f172a", lineHeight: 1 },
    badge: {
      fontSize: 12,
      fontWeight: 500,
      borderRadius: 20,
      padding: "3px 10px",
      display: "inline-flex",
      alignItems: "center",
      gap: 4,
    },

    // Lower two-col
    lower: {
      display: "grid",
      gridTemplateColumns: "1fr 340px",
      gap: 22,
      alignItems: "start",
    },
    leftCol: { display: "flex", flexDirection: "column", gap: 22 },
    rightCol: { display: "flex", flexDirection: "column", gap: 22 },

    cardHeader: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 18,
    },
    cardTitle: {
      fontSize: 18,
      fontWeight: 600,
      color: "#0f172a",
      display: "flex",
      alignItems: "center",
      gap: 8,
    },

    // Table
    table: { width: "100%", borderCollapse: "collapse" },
    th: {
      fontSize: 13,
      fontWeight: 500,
      color: "#94a3b8",
      textAlign: "left",
      padding: "8px 14px",
      borderBottom: "0.5px solid rgba(0,0,0,0.08)",
      textTransform: "uppercase",
      letterSpacing: "0.5px",
    },
    td: {
      padding: "13px 14px",
      fontSize: 15,
      color: "#0f172a",
      borderBottom: "0.5px solid rgba(0,0,0,0.06)",
    },

    patientCell: { display: "flex", alignItems: "center", gap: 10 },

    actionBtn: {
      width: 30,
      height: 30,
      borderRadius: 8,
      background: "#F4F7FA",
      border: "0.5px solid rgba(0,0,0,0.08)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      cursor: "pointer",
      color: "#64748b",
      padding: 0,
    },
    viewAll: {
      textAlign: "center",
      padding: "14px 0 4px",
      fontSize: 15,
      color: "#185FA5",
      cursor: "pointer",
      fontWeight: 500,
    },

    // Recently Registered
    regGrid: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 12,
      marginTop: 2,
    },
    regCard: {
      display: "flex",
      alignItems: "center",
      gap: 12,
      background: "#F4F7FA",
      border: "0.5px solid rgba(0,0,0,0.08)",
      borderRadius: 12,
      padding: "12px 14px",
      cursor: "pointer",
      transition: "border-color 0.15s",
    },
    regName: { fontSize: 15, fontWeight: 500, color: "#0f172a" },
    regMeta: { fontSize: 13, color: "#64748b", marginTop: 2 },

    // Quick Registration
    formGroup: {
      display: "flex",
      flexDirection: "column",
      gap: 5,
      marginBottom: 14,
    },
    formLabel: { fontSize: 13, color: "#64748b", fontWeight: 500 },
    formInput: {
      background: "#F4F7FA",
      border: "0.5px solid rgba(0,0,0,0.1)",
      borderRadius: 9,
      padding: "9px 13px",
      fontSize: 15,
      color: "#0f172a",
      outline: "none",
      fontFamily: "inherit",
      width: "100%",
    },
    formRow: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 },
    btnComplete: {
      width: "100%",
      background: "#185FA5",
      color: "#fff",
      border: "none",
      borderRadius: 10,
      padding: "11px",
      fontSize: 15,
      fontWeight: 500,
      cursor: "pointer",
      marginTop: 6,
    },

    // Revenue
    revHeader: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 16,
    },
    revPeriod: { fontSize: 13, color: "#94a3b8", marginTop: 3 },
    revItem: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
    },
    revDotLabel: {
      display: "flex",
      alignItems: "center",
      gap: 9,
      fontSize: 15,
      color: "#0f172a",
    },
    revAmount: { fontSize: 15, fontWeight: 500, color: "#0f172a" },
    revDivider: {
      border: "none",
      borderTop: "0.5px solid rgba(0,0,0,0.08)",
      margin: "10px 0",
    },
    btnReport: {
      width: "100%",
      background: "#F4F7FA",
      border: "0.5px solid rgba(0,0,0,0.1)",
      borderRadius: 10,
      padding: 11,
      fontSize: 15,
      fontWeight: 500,
      cursor: "pointer",
      color: "#334155",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      marginTop: 14,
    },
  };

  return (
    <div style={styles.root}>
      {/* ── Topbar ── */}
      <div style={styles.topbar}>
        <div style={styles.searchBox}>
          <Search size={16} color="#94a3b8" />
          <input
            style={styles.searchInput}
            placeholder="Search patients, records, or bills..."
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
          />
        </div>
        <div style={styles.topbarRight}>
          <IconBtn>
            <Bell size={17} />
          </IconBtn>
          <IconBtn>
            <Clock size={17} />
          </IconBtn>
          <div style={styles.userInfo}>
            <div style={styles.userName}>Sarah Jenkins</div>
            <div style={styles.userRole}>Lead Receptionist</div>
          </div>
          <Avatar name="Sarah Jenkins" size={38} idx={0} />
        </div>
      </div>

      <div style={styles.main}>
        {/* ── Page header ── */}
        <div style={styles.pageHeader}>
          <div>
            <div style={styles.pageTitle}>Receptionist Dashboard</div>
            <div style={styles.pageSub}>
              Welcome back, Sarah. Here's a summary of clinic activities today.
            </div>
          </div>
          <button
            style={styles.btnPrimary}
            onClick={() => navigate("/receptionist/addappointment")}
          >
            <UserPlus size={18} />
            Register Patient
          </button>
        </div>

        {/* ── Stat cards ── */}
        <div style={styles.statGrid}>
          {/* Total Patients */}
          <div style={styles.statCard}>
            <div style={styles.statTop}>
              <div
                style={{
                  ...styles.statIcon,
                  background: "#E6F1FB",
                  color: "#185FA5",
                }}
              >
                <Users size={21} />
              </div>
              <span
                style={{
                  ...styles.badge,
                  background: "#EAF3DE",
                  color: "#3B6D11",
                }}
              >
                <TrendingUp size={12} /> +4%
              </span>
            </div>
            <div style={styles.statLabel}>Total Patients</div>
            <div style={styles.statValue}>
              {loading ? "…" : (stats.patients || 1284).toLocaleString()}
            </div>
          </div>

          {/* Today's Appointments */}
          <div style={styles.statCard}>
            <div style={styles.statTop}>
              <div
                style={{
                  ...styles.statIcon,
                  background: "#E1F5EE",
                  color: "#0F6E56",
                }}
              >
                <CalendarClock size={21} />
              </div>
              <span
                style={{
                  ...styles.badge,
                  background: "#E6F1FB",
                  color: "#185FA5",
                }}
              >
                85% full
              </span>
            </div>
            <div style={styles.statLabel}>Today's Appointments</div>
            <div style={styles.statValue}>
              {loading ? "…" : stats.appointments || 42}
            </div>
          </div>

          {/* Pending Actions */}
          <div style={styles.statCard}>
            <div style={styles.statTop}>
              <div
                style={{
                  ...styles.statIcon,
                  background: "#FAEEDA",
                  color: "#854F0B",
                }}
              >
                <AlertCircle size={21} />
              </div>
              <span
                style={{
                  ...styles.badge,
                  background: "#FCEBEB",
                  color: "#A32D2D",
                  fontSize: 11,
                  textTransform: "uppercase",
                  letterSpacing: "0.6px",
                }}
              >
                Urgent
              </span>
            </div>
            <div style={styles.statLabel}>Pending Actions</div>
            <div style={styles.statValue}>8</div>
          </div>

          {/* Today's Income */}
          <div
            style={{
              ...styles.statCard,
              border: "1.5px solid #185FA5",
            }}
          >
            <div style={styles.statTop}>
              <div
                style={{
                  ...styles.statIcon,
                  background: "#E6F1FB",
                  color: "#185FA5",
                }}
              >
                <CreditCard size={21} />
              </div>
              <span
                style={{
                  ...styles.badge,
                  background: "#E1F5EE",
                  color: "#0F6E56",
                }}
              >
                <span
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    background: "#1D9E75",
                    display: "inline-block",
                  }}
                />{" "}
                Live
              </span>
            </div>
            <div style={styles.statLabel}>Today's Income</div>
            <div style={{ ...styles.statValue, fontSize: 23, color: "#185FA5" }}>
              $3,450
            </div>
          </div>
        </div>

        {/* ── Lower two-column ── */}
        <div style={styles.lower}>
          {/* LEFT */}
          <div style={styles.leftCol}>
            {/* Today's Schedule */}
            <Card>
              <div style={styles.cardHeader}>
                <div style={styles.cardTitle}>
                  <CalendarClock size={20} color="#185FA5" />
                  Today's Schedule
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <IconBtn>
                    <SlidersHorizontal size={15} />
                  </IconBtn>
                  <IconBtn>
                    <MoreHorizontal size={15} />
                  </IconBtn>
                </div>
              </div>

              <table style={styles.table}>
                <thead>
                  <tr>
                    {["Time", "Patient Name", "Doctor", "Status", "Actions"].map(
                      (h) => (
                        <th key={h} style={styles.th}>
                          {h}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody>
                  {SCHEDULE.map((row, i) => (
                    <tr key={i}>
                      <td
                        style={{
                          ...styles.td,
                          fontSize: 15,
                          color: "#64748b",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {row.time}
                      </td>
                      <td style={styles.td}>
                        <div style={styles.patientCell}>
                          <Avatar name={row.patient} size={32} idx={i} />
                          <span style={{ fontSize: 15 }}>{row.patient}</span>
                        </div>
                      </td>
                      <td style={{ ...styles.td, color: "#64748b", fontSize: 15 }}>
                        {row.doctor}
                      </td>
                      <td style={styles.td}>
                        <StatusPill status={row.status} />
                      </td>
                      <td style={styles.td}>
                        <div style={{ display: "flex", gap: 6 }}>
                          {row.status === "Confirmed" && (
                            <button style={styles.actionBtn}>
                              <Pencil size={14} />
                            </button>
                          )}
                          {row.status === "Pending" && (
                            <button style={styles.actionBtn}>
                              <CircleCheck size={14} />
                            </button>
                          )}
                          {row.status === "Cancelled" && (
                            <button style={styles.actionBtn}>
                              <RefreshCw size={14} />
                            </button>
                          )}
                          {row.status === "Completed" && (
                            <button style={styles.actionBtn}>
                              <Eye size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div
                style={styles.viewAll}
                onClick={() => navigate("/receptionist/appointments")}
              >
                View All Appointments
              </div>
            </Card>

            {/* Recently Registered */}
            <Card>
              <div style={styles.cardHeader}>
                <div style={styles.cardTitle}>
                  <UserCheck size={20} color="#185FA5" />
                  Recently Registered
                </div>
              </div>
              <div style={styles.regGrid}>
                {RECENT.map((r, i) => (
                  <div
                    key={i}
                    style={styles.regCard}
                    onClick={() => navigate("/receptionist/patients")}
                  >
                    <Avatar name={r.name} size={38} idx={i + 2} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={styles.regName}>{r.name}</div>
                      <div style={styles.regMeta}>
                        ID: {r.id} · {r.ago}
                      </div>
                    </div>
                    <ChevronRight size={17} color="#94a3b8" />
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* RIGHT */}
          <div style={styles.rightCol}>
            {/* Quick Registration */}
            <Card>
              <div style={styles.cardHeader}>
                <div style={styles.cardTitle}>
                  <UserPlus size={20} color="#185FA5" />
                  Quick Registration
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Patient full name</label>
                <input
                  style={styles.formInput}
                  type="text"
                  placeholder="John Doe"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>

              <div style={styles.formRow}>
                <div style={{ ...styles.formGroup, marginBottom: 0 }}>
                  <label style={styles.formLabel}>Gender</label>
                  <select
                    style={{ ...styles.formInput, cursor: "pointer" }}
                    value={form.gender}
                    onChange={(e) =>
                      setForm({ ...form, gender: e.target.value })
                    }
                  >
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                </div>
                <div style={{ ...styles.formGroup, marginBottom: 0 }}>
                  <label style={styles.formLabel}>Phone number</label>
                  <input
                    style={styles.formInput}
                    type="text"
                    placeholder="+1 555-0123"
                    value={form.phone}
                    onChange={(e) =>
                      setForm({ ...form, phone: e.target.value })
                    }
                  />
                </div>
              </div>

              <button
                style={styles.btnComplete}
                onClick={() => navigate("/receptionist/addappointment")}
              >
                Complete Registration
              </button>
            </Card>

            {/* Revenue Summary */}
            <Card>
              <div style={styles.revHeader}>
                <div>
                  <div style={{ ...styles.cardTitle, fontSize: 18 }}>
                    Revenue Summary
                  </div>
                  <div style={styles.revPeriod}>Last 7 days performance</div>
                </div>
                <LineChart size={21} color="#185FA5" />
              </div>

              {/* Sparkline */}
              <svg
                viewBox="0 0 280 80"
                style={{ width: "100%", height: 80, marginBottom: 16 }}
                preserveAspectRatio="none"
              >
                <defs>
                  <linearGradient
                    id="sparkGrad"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="0%"
                      stopColor="#185FA5"
                      stopOpacity="0.18"
                    />
                    <stop
                      offset="100%"
                      stopColor="#185FA5"
                      stopOpacity="0"
                    />
                  </linearGradient>
                </defs>
                <path
                  d={sparkD + ` L${sparkLast[0]},80 L0,80 Z`}
                  fill="url(#sparkGrad)"
                  stroke="none"
                />
                <path
                  d={sparkD}
                  fill="none"
                  stroke="#185FA5"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle
                  cx={sparkLast[0]}
                  cy={sparkLast[1]}
                  r="4"
                  fill="#185FA5"
                />
              </svg>

              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={styles.revItem}>
                  <div style={styles.revDotLabel}>
                    <span
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        background: "#1D9E75",
                        flexShrink: 0,
                      }}
                    />
                    Paid bills
                  </div>
                  <div style={styles.revAmount}>$28,450.00</div>
                </div>
                <hr style={styles.revDivider} />
                <div style={styles.revItem}>
                  <div style={styles.revDotLabel}>
                    <span
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        background: "#E24B4A",
                        flexShrink: 0,
                      }}
                    />
                    Unpaid invoices
                  </div>
                  <div style={{ ...styles.revAmount, color: "#A32D2D" }}>
                    $1,240.00
                  </div>
                </div>
              </div>

              <button
                style={styles.btnReport}
                onClick={() => navigate("/receptionist/bills")}
              >
                <FileText size={18} />
                Generate Financial Report
              </button>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}