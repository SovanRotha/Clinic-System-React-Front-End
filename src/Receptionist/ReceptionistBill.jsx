import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Bell,
  Clock,
  Download,
  Plus,
  TrendingUp,
  AlertCircle,
  Check,
  SlidersHorizontal,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  Send,
  CircleCheck,
  FileText,
} from "lucide-react";

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_MAP = {
  paid: { label: "Paid", dot: "#1D9E75", bg: "#E1F5EE", text: "#0F6E56" },
  unpaid: { label: "Unpaid", dot: "#E24B4A", bg: "#FCEBEB", text: "#A32D2D" },
  processing: { label: "Processing", dot: "#EF9F27", bg: "#FAEEDA", text: "#854F0B" },
  pending: { label: "Pending", dot: "#EF9F27", bg: "#FAEEDA", text: "#854F0B" },
};

const AVATAR_COLORS = [
  { bg: "#E6F1FB", text: "#185FA5" },
  { bg: "#E1F5EE", text: "#0F6E56" },
  { bg: "#FAECE7", text: "#993C1D" },
  { bg: "#EEEDFE", text: "#534AB7" },
  { bg: "#FAEEDA", text: "#854F0B" },
];

const METHODS = [
  { label: "Credit Card", pct: 62, color: "#185FA5" },
  { label: "Insurance Claims", pct: 28, color: "#1D9E75" },
  { label: "Cash / Bank", pct: 10, color: "#534AB7" },
];

const TRANSACTIONS = [
  {
    icon: "check",
    iconBg: "#E1F5EE",
    iconColor: "#0F6E56",
    title: "$120 received from Sarah K.",
    meta: "2 mins ago · Card Payment",
  },
  {
    icon: "file",
    iconBg: "#E6F1FB",
    iconColor: "#185FA5",
    title: "New invoice #INV-8821 drafted",
    meta: "15 mins ago · Robert Miller",
  },
  {
    icon: "alert",
    iconBg: "#FAEEDA",
    iconColor: "#854F0B",
    title: "Overdue: #INV-8806 unpaid",
    meta: "1 hr ago · Alice Walker",
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function initials(name = "") {
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

function formatCurrency(val) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(val);
}

function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function statusKey(status = "") {
  return status.toLowerCase();
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Avatar({ name, size = 32, idx = 0 }) {
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
        fontSize: size <= 34 ? 12 : 14,
        fontWeight: 500,
        flexShrink: 0,
      }}
    >
      {initials(name)}
    </div>
  );
}

function StatusPill({ status }) {
  const key = statusKey(status);
  const s = STATUS_MAP[key] || STATUS_MAP.pending;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        padding: "4px 11px",
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
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: s.dot,
          flexShrink: 0,
        }}
      />
      {s.label}
    </span>
  );
}

function IconBtn({ children }) {
  return (
    <button
      style={{
        width: 32,
        height: 32,
        borderRadius: 8,
        background: "#F4F7FA",
        border: "0.5px solid rgba(0,0,0,0.09)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        color: "#64748b",
        padding: 0,
      }}
    >
      {children}
    </button>
  );
}

function Card({ children, style = {} }) {
  return (
    <div
      style={{
        background: "#fff",
        border: "0.5px solid rgba(0,0,0,0.09)",
        borderRadius: 15,
        padding: "20px 22px",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function ProgressBar({ pct, color }) {
  return (
    <div
      style={{
        height: 4,
        background: "#F0F4FA",
        borderRadius: 4,
        overflow: "hidden",
        marginTop: 5,
      }}
    >
      <div
        style={{
          height: "100%",
          width: `${pct}%`,
          background: color,
          borderRadius: 4,
        }}
      />
    </div>
  );
}

function TxIcon({ type, bg, color }) {
  const icons = {
    check: <CircleCheck size={17} />,
    file: <FileText size={17} />,
    alert: <AlertCircle size={17} />,
  };
  return (
    <div
      style={{
        width: 32,
        height: 32,
        borderRadius: 8,
        background: bg,
        color,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      {icons[type]}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

const PAGE_SIZE = 8;

export default function ReceptionistBilling() {
  const navigate = useNavigate();
  const [bills, setBills] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBills = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) { setLoading(false); return; }
        const res = await fetch("http://127.0.0.1:8000/api/bill", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        setBills(Array.isArray(data.data) ? data.data : []);
      } catch (e) {
        console.error("Error fetching bills:", e);
        setError("Unable to load billing data.");
      } finally {
        setLoading(false);
      }
    };
    fetchBills();
  }, []);

  // ── Derived stats ────────────────────────────────────────────────────────────
  const totalRevenue = bills
    .filter((b) => statusKey(b.status) === "paid")
    .reduce((s, b) => s + parseFloat(b.amount || 0), 0);

  const outstanding = bills
    .filter((b) => ["unpaid", "pending"].includes(statusKey(b.status)))
    .reduce((s, b) => s + parseFloat(b.amount || 0), 0);

  const pendingCount = bills.filter((b) =>
    ["unpaid", "pending"].includes(statusKey(b.status))
  ).length;

  const allAmounts = bills.map((b) => parseFloat(b.amount || 0)).filter(Boolean);
  const avgTicket =
    allAmounts.length > 0
      ? allAmounts.reduce((a, b) => a + b, 0) / allAmounts.length
      : 0;

  const paidToday = bills
    .filter((b) => {
      const d = new Date(b.created_at || b.updated_at || "");
      const today = new Date();
      return (
        statusKey(b.status) === "paid" &&
        d.toDateString() === today.toDateString()
      );
    })
    .reduce((s, b) => s + parseFloat(b.amount || 0), 0);

  const paidTodayCount = bills.filter((b) => {
    const d = new Date(b.created_at || b.updated_at || "");
    const today = new Date();
    return (
      statusKey(b.status) === "paid" &&
      d.toDateString() === today.toDateString()
    );
  }).length;

  // ── Filtered + paged ─────────────────────────────────────────────────────────
  const filtered = bills.filter((b) => {
    const q = search.toLowerCase();
    return (
      !q ||
      String(b.id).includes(q) ||
      (b.patient?.patient_code || "").toLowerCase().includes(q) ||
      (b.status || "").toLowerCase().includes(q)
    );
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // ── Styles ───────────────────────────────────────────────────────────────────
  const S = {
    root: {
      minHeight: "100vh",
      background: "#F0F4FA",
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    },
    topbar: {
      background: "#fff",
      borderBottom: "0.5px solid rgba(0,0,0,0.09)",
      padding: "0 26px",
      height: 56,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      position: "sticky",
      top: 0,
      zIndex: 100,
    },
    searchWrap: {
      display: "flex",
      alignItems: "center",
      gap: 8,
      background: "#F4F7FA",
      border: "0.5px solid rgba(0,0,0,0.09)",
      borderRadius: 9,
      padding: "7px 14px",
      width: 300,
    },
    searchInput: {
      border: "none",
      background: "transparent",
      outline: "none",
      fontSize: 15,
      color: "#334155",
      width: "100%",
      fontFamily: "inherit",
    },
    topRight: { display: "flex", alignItems: "center", gap: 13 },
    userName: { fontSize: 15, fontWeight: 500, color: "#0f172a" },
    userRole: { fontSize: 12, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.5px" },
    topAvatar: {
      width: 36, height: 36, borderRadius: "50%",
      background: "#E6F1FB", color: "#185FA5",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: 13, fontWeight: 500,
    },
    main: { padding: "24px 26px", maxWidth: 1180, margin: "0 auto", display: "flex", flexDirection: "column", gap: 20 },
    pageHdr: { display: "flex", alignItems: "flex-start", justifyContent: "space-between" },
    pageTitle: { fontSize: 25, fontWeight: 600, color: "#0f172a" },
    pageSub: { fontSize: 15, color: "#64748b", marginTop: 4 },
    hdrBtns: { display: "flex", gap: 10 },
    btnOutline: {
      display: "flex", alignItems: "center", gap: 7,
      background: "#fff", border: "0.5px solid rgba(0,0,0,0.15)",
      borderRadius: 9, padding: "9px 16px",
      fontSize: 15, fontWeight: 500, color: "#334155", cursor: "pointer",
    },
    btnPrimary: {
      display: "flex", alignItems: "center", gap: 7,
      background: "#185FA5", border: "none",
      borderRadius: 9, padding: "9px 18px",
      fontSize: 15, fontWeight: 500, color: "#fff", cursor: "pointer",
    },
    statGrid: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 },
    statCard: {
      background: "#fff", border: "0.5px solid rgba(0,0,0,0.09)",
      borderRadius: 15, padding: "20px 22px",
    },
    statLbl: {
      fontSize: 13, fontWeight: 500, color: "#94a3b8",
      textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 10,
    },
    statVal: { fontSize: 23, fontWeight: 600, color: "#0f172a", lineHeight: 1 },
    statSub: { fontSize: 13, marginTop: 8, display: "flex", alignItems: "center", gap: 5 },
    lower: { display: "grid", gridTemplateColumns: "1fr 300px", gap: 20, alignItems: "start" },
    cardHdr: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 },
    cardTitle: { fontSize: 18, fontWeight: 600, color: "#0f172a" },
    table: { width: "100%", borderCollapse: "collapse", tableLayout: "fixed" },
    th: {
      fontSize: 13, fontWeight: 500, color: "#94a3b8",
      textAlign: "left", padding: "8px 12px",
      borderBottom: "0.5px solid rgba(0,0,0,0.07)",
      textTransform: "uppercase", letterSpacing: "0.5px",
    },
    td: { padding: "13px 12px", fontSize: 15, color: "#0f172a", borderBottom: "0.5px solid rgba(0,0,0,0.06)" },
    patientCell: { display: "flex", alignItems: "center", gap: 9 },
    actionBtn: {
      background: "#F4F7FA", border: "0.5px solid rgba(0,0,0,0.1)",
      borderRadius: 7, padding: "5px 12px",
      fontSize: 13, cursor: "pointer", color: "#334155",
    },
    pagination: { display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 14 },
    pgBtns: { display: "flex", gap: 6 },
    pgBtn: {
      width: 30, height: 30, borderRadius: 7,
      border: "0.5px solid rgba(0,0,0,0.1)", background: "#fff",
      fontSize: 13, fontWeight: 500, cursor: "pointer",
      color: "#334155", display: "flex", alignItems: "center", justifyContent: "center",
    },
    pgBtnActive: {
      width: 30, height: 30, borderRadius: 7,
      border: "none", background: "#185FA5",
      fontSize: 13, fontWeight: 500, cursor: "pointer",
      color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
    },
    rightCol: { display: "flex", flexDirection: "column", gap: 20 },
    reminderCard: { background: "#185FA5", borderRadius: 15, padding: "20px 22px" },
    sectionLbl: {
      fontSize: 13, fontWeight: 600, color: "#94a3b8",
      textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 14,
    },
    methodRow: { display: "flex", flexDirection: "column", gap: 12 },
    mRowTop: { display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 15, color: "#0f172a", marginBottom: 3 },
    txList: { display: "flex", flexDirection: "column", gap: 10 },
    txItem: {
      display: "flex", alignItems: "flex-start", gap: 10,
      padding: "11px 13px", borderRadius: 10,
      background: "#F4F7FA", border: "0.5px solid rgba(0,0,0,0.07)",
    },
    txTitle: { fontSize: 15, fontWeight: 500, color: "#0f172a" },
    txMeta: { fontSize: 13, color: "#94a3b8", marginTop: 2 },
  };

  // ── Page range helper ─────────────────────────────────────────────────────────
  const pageNumbers = [];
  for (let i = Math.max(1, page - 1); i <= Math.min(totalPages, page + 1); i++) {
    pageNumbers.push(i);
  }

  return (
    <div style={S.root}>
      {/* Topbar */}
      <div style={S.topbar}>
        <div style={S.searchWrap}>
          <Search size={16} color="#94a3b8" />
          <input
            style={S.searchInput}
            placeholder="Search invoices, patients, or transactions..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <div style={S.topRight}>
          <IconBtn><Bell size={17} /></IconBtn>
          <IconBtn><Clock size={17} /></IconBtn>
          <div style={{ textAlign: "right" }}>
            <div style={S.userName}>Sarah Jenkins</div>
            <div style={S.userRole}>Admin Lead</div>
          </div>
          <div style={S.topAvatar}>SJ</div>
        </div>
      </div>

      <div style={S.main}>
        {/* Page header */}
        <div style={S.pageHdr}>
          <div>
            <div style={S.pageTitle}>Billing &amp; Invoices</div>
            <div style={S.pageSub}>
              Manage clinical fees, patient payments, and generate new invoices.
            </div>
          </div>
          <div style={S.hdrBtns}>
            <button style={S.btnOutline}>
              <Download size={17} /> Export Report
            </button>
            <button
              style={S.btnPrimary}
              onClick={() => navigate("/receptionist/addbill")}
            >
              <Plus size={17} /> Create Invoice
            </button>
          </div>
        </div>

        {/* Stat cards */}
        <div style={S.statGrid}>
          <div style={S.statCard}>
            <div style={S.statLbl}>Total Revenue</div>
            <div style={S.statVal}>
              {loading ? "…" : formatCurrency(totalRevenue || 24580)}
            </div>
            <div style={{ ...S.statSub, color: "#0F6E56" }}>
              <TrendingUp size={14} /> +12% from last month
            </div>
          </div>

          <div style={S.statCard}>
            <div style={S.statLbl}>Outstanding</div>
            <div style={S.statVal}>
              {loading ? "…" : formatCurrency(outstanding || 3120.5)}
            </div>
            <div style={{ ...S.statSub, color: "#A32D2D" }}>
              <AlertCircle size={14} />
              {pendingCount || 14} invoices pending
            </div>
          </div>

          <div style={S.statCard}>
            <div style={S.statLbl}>Average Ticket</div>
            <div style={S.statVal}>
              {loading ? "…" : formatCurrency(avgTicket || 145)}
            </div>
            <ProgressBar pct={68} color="#185FA5" />
            <div style={{ ...S.statSub, color: "#185FA5", marginTop: 6 }}>
              68% of monthly target
            </div>
          </div>

          <div style={S.statCard}>
            <div style={S.statLbl}>Paid Today</div>
            <div style={{ ...S.statVal, color: "#185FA5" }}>
              {loading ? "…" : formatCurrency(paidToday || 1240)}
            </div>
            <div style={{ ...S.statSub, color: "#64748b" }}>
              <Check size={14} color="#1D9E75" />
              {paidTodayCount || 8} completed transactions
            </div>
          </div>
        </div>

        {/* Lower two-col */}
        <div style={S.lower}>
          {/* Left — invoice table */}
          <Card>
            <div style={S.cardHdr}>
              <div style={S.cardTitle}>Recent Invoices</div>
              <div style={{ display: "flex", gap: 8 }}>
                <IconBtn><SlidersHorizontal size={15} /></IconBtn>
                <IconBtn><MoreHorizontal size={15} /></IconBtn>
              </div>
            </div>

            {error && (
              <div
                style={{
                  background: "#FCEBEB",
                  border: "0.5px solid rgba(162,45,45,0.25)",
                  color: "#A32D2D",
                  padding: "10px 14px",
                  borderRadius: 9,
                  fontSize: 15,
                  marginBottom: 16,
                }}
              >
                {error}
              </div>
            )}

            <div style={{ overflowX: "auto" }}>
              <table style={S.table}>
                <thead>
                  <tr>
                    <th style={{ ...S.th, width: 95 }}>Invoice ID</th>
                    <th style={{ ...S.th, width: 160 }}>Patient name</th>
                    <th style={{ ...S.th, width: 100 }}>Date</th>
                    <th style={{ ...S.th, width: 105 }}>Amount</th>
                    <th style={{ ...S.th, width: 115 }}>Status</th>
                    <th style={{ ...S.th, width: 100 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={6} style={{ ...S.td, textAlign: "center", color: "#94a3b8", padding: "32px 0" }}>
                        Loading invoices…
                      </td>
                    </tr>
                  ) : paginated.length > 0 ? (
                    paginated.map((bill, i) => (
                      <tr
                        key={bill.id}
                        style={{ cursor: "pointer" }}
                        onMouseEnter={(e) => {
                          e.currentTarget.querySelectorAll("td").forEach(
                            (td) => (td.style.background = "#F8FAFD")
                          );
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.querySelectorAll("td").forEach(
                            (td) => (td.style.background = "")
                          );
                        }}
                      >
                        <td style={{ ...S.td, fontSize: 13, fontWeight: 600, color: "#185FA5" }}>
                          #INV-{bill.id}
                        </td>
                        <td style={S.td}>
                          <div style={S.patientCell}>
                            <Avatar
                              name={bill.patient?.name || bill.patient?.patient_code || "P"}
                              size={32}
                              idx={i}
                            />
                            <span style={{ fontSize: 15 }}>
                              {bill.patient?.name || bill.patient?.patient_code || "Unknown"}
                            </span>
                          </div>
                        </td>
                        <td style={{ ...S.td, color: "#64748b", fontSize: 15 }}>
                          {formatDate(bill.created_at || bill.bill_date)}
                        </td>
                        <td style={{ ...S.td, fontWeight: 500 }}>
                          {formatCurrency(parseFloat(bill.amount || bill.total_amount || 0))}
                        </td>
                        <td style={S.td}>
                          <StatusPill status={bill.status || "pending"} />
                        </td>
                        <td style={S.td}>
                          <div style={{ display: "flex", gap: 6 }}>
                            <button
                              style={S.actionBtn}
                              onClick={() => navigate(`/receptionist/viewbill/${bill.id}`)}
                            >
                              View
                            </button>
                            <button
                              style={{ ...S.actionBtn, color: "#0F6E56", background: "#E1F5EE", border: "none" }}
                              onClick={() => navigate(`/receptionist/editbill/${bill.id}`)}
                            >
                              Edit
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} style={{ ...S.td, textAlign: "center", color: "#94a3b8", padding: "32px 0" }}>
                        No invoices found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div style={S.pagination}>
              <span style={{ fontSize: 13, color: "#64748b" }}>
                Showing {Math.min(filtered.length, PAGE_SIZE * page - PAGE_SIZE + 1)}–
                {Math.min(filtered.length, PAGE_SIZE * page)} of {filtered.length || 248} invoices
              </span>
              <div style={S.pgBtns}>
                <button
                  style={S.pgBtn}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  <ChevronLeft size={14} />
                </button>
                {pageNumbers.map((n) => (
                  <button
                    key={n}
                    style={n === page ? S.pgBtnActive : S.pgBtn}
                    onClick={() => setPage(n)}
                  >
                    {n}
                  </button>
                ))}
                <button
                  style={S.pgBtn}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </Card>

          {/* Right column */}
          <div style={S.rightCol}>
            {/* Pending reminders */}
            <div style={S.reminderCard}>
              <div style={{ fontSize: 18, fontWeight: 600, color: "#fff", marginBottom: 8 }}>
                Pending Reminders
              </div>
              <div style={{ fontSize: 15, color: "#B5D4F4", lineHeight: 1.5 }}>
                Send automatic payment reminders to {pendingCount || 14} overdue accounts.
              </div>
              <button
                style={{
                  width: "100%",
                  background: "#fff",
                  color: "#185FA5",
                  border: "none",
                  borderRadius: 9,
                  padding: 11,
                  fontSize: 15,
                  fontWeight: 600,
                  cursor: "pointer",
                  marginTop: 16,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 7,
                }}
              >
                <Send size={16} /> Bulk Send Now
              </button>
            </div>

            {/* Methods distribution */}
            <Card>
              <div style={S.sectionLbl}>Methods Distribution</div>
              <div style={S.methodRow}>
                {METHODS.map((m) => (
                  <div key={m.label}>
                    <div style={S.mRowTop}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 15 }}>
                        <span
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            background: m.color,
                            flexShrink: 0,
                          }}
                        />
                        {m.label}
                      </div>
                      <span style={{ fontSize: 15, fontWeight: 500, color: "#0f172a" }}>
                        {m.pct}%
                      </span>
                    </div>
                    <ProgressBar pct={m.pct} color={m.color} />
                  </div>
                ))}
              </div>
            </Card>

            {/* Latest transactions */}
            <Card>
              <div style={S.sectionLbl}>Latest Transactions</div>
              <div style={S.txList}>
                {TRANSACTIONS.map((tx, i) => (
                  <div key={i} style={S.txItem}>
                    <TxIcon type={tx.icon} bg={tx.iconBg} color={tx.iconColor} />
                    <div>
                      <div style={S.txTitle}>{tx.title}</div>
                      <div style={S.txMeta}>{tx.meta}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div
                style={{
                  textAlign: "center",
                  paddingTop: 12,
                  fontSize: 15,
                  color: "#185FA5",
                  fontWeight: 500,
                  cursor: "pointer",
                }}
                onClick={() => navigate("/receptionist/bills/activity")}
              >
                View All Activity
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}