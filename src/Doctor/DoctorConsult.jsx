import React, { useState, useEffect } from "react";
import DoctorSidebar from "./DoctorSidebar";
import { useNavigate } from "react-router-dom";
import {
  Search,
  ClipboardList,
  Clock,
  CheckCircle,
  Eye,
  Calendar,
  Stethoscope,
  FileText,
  ChevronLeft,
  ChevronRight,
  Plus,
  List,
  CircleCheck,
} from "lucide-react";

const ITEMS_PER_PAGE = 8;

const AVATAR_COLORS = [
  { bg: "bg-blue-100", text: "text-blue-700" },
  { bg: "bg-purple-100", text: "text-purple-700" },
  { bg: "bg-teal-100", text: "text-teal-700" },
  { bg: "bg-indigo-100", text: "text-indigo-700" },
  { bg: "bg-rose-100", text: "text-rose-700" },
  { bg: "bg-amber-100", text: "text-amber-700" },
];

function getAvatarColor(id) {
  return AVATAR_COLORS[(id || 0) % AVATAR_COLORS.length];
}

function initials(name = "") {
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2) || "PT";
}

function formatTime(t) {
  if (!t) return "—";
  const [h, m] = t.split(":");
  const hr = parseInt(h);
  return `${hr % 12 || 12}:${m} ${hr >= 12 ? "PM" : "AM"}`;
}

function formatDate(d) {
  if (!d) return "—";
  const date = new Date(d);
  const isToday = new Date().toDateString() === date.toDateString();
  if (isToday) return "Today";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function calcAge(dob) {
  if (!dob) return null;
  const d = new Date(dob), now = new Date();
  let age = now.getFullYear() - d.getFullYear();
  if (now < new Date(now.getFullYear(), d.getMonth(), d.getDate())) age--;
  return age;
}

const STATUS_CONFIG = {
  completed:   { dot: "bg-green-500",  badge: "bg-green-100 text-green-700",   label: "COMPLETED"   },
  pending:     { dot: "bg-yellow-400", badge: "bg-yellow-100 text-yellow-700", label: "PENDING"     },
  confirmed:   { dot: "bg-blue-500",   badge: "bg-blue-100 text-blue-700",     label: "CONFIRMED"   },
  cancelled:   { dot: "bg-red-400",    badge: "bg-red-100 text-red-700",       label: "CANCELLED"   },
  in_progress: { dot: "bg-indigo-500", badge: "bg-indigo-100 text-indigo-700", label: "IN PROGRESS" },
};

const FILTERS = [
  { key: "all",       label: "All",       icon: <List size={14} /> },
  { key: "pending",   label: "Pending",   icon: <Clock size={14} /> },
  { key: "confirmed", label: "Confirmed", icon: <CircleCheck size={14} /> },
  { key: "completed", label: "Completed", icon: <CheckCircle size={14} /> },
];

export default function DoctorConsult() {
  const navigate = useNavigate();
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) { setError("Authentication token is missing."); setLoading(false); return; }
    fetch("http://127.0.0.1:8000/api/ConsultationDoctor", {
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
    })
      .then((res) => res.json())
      .then((data) => {
        const items = data?.data
          ? Array.isArray(data.data) ? data.data : [data.data]
          : Array.isArray(data) ? data : [];
        setConsultations(items);
      })
      .catch(() => setError("Unable to fetch consultations."))
      .finally(() => setLoading(false));
  }, [token]);

  const handleSearch = (val) => { setSearch(val); setPage(1); };
  const handleFilter = (key) => { setFilter(key); setPage(1); };

  const filtered = consultations.filter((c) => {
    const name = c.patient?.user?.name || c.patient?.name || "";
    const fOk = filter === "all" || c.appointment?.status === filter;
    const q = search.toLowerCase();
    const qOk = !q
      || name.toLowerCase().includes(q)
      || c.patient?.patient_code?.toLowerCase().includes(q)
      || c.diagnosis?.toLowerCase().includes(q);
    return fOk && qOk;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const totalCount     = consultations.length;
  const pendingCount   = consultations.filter((c) => c.appointment?.status === "pending").length;
  const completedCount = consultations.filter((c) => c.appointment?.status === "completed").length;

  const stats = [
    {
      label: "Total",
      value: totalCount,
      icon: <ClipboardList size={20} />,
      color: "from-blue-500 to-blue-600",
      iconBg: "bg-blue-400/30",
    },
    {
      label: "Pending",
      value: pendingCount,
      icon: <Clock size={20} />,
      color: "from-amber-400 to-orange-500",
      iconBg: "bg-amber-400/30",
    },
    {
      label: "Completed",
      value: completedCount,
      icon: <CheckCircle size={20} />,
      color: "from-teal-500 to-teal-600",
      iconBg: "bg-teal-400/30",
    },
  ];

  return (
    <div className="flex bg-slate-50 min-h-screen">
      <DoctorSidebar />

      <div className="flex-1 p-6 max-w-6xl" style={{ marginLeft: "40px" }}>
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-800">Consultations</h1>
          <p className="text-slate-400 mt-1 text-sm">Manage your consultations and patient interactions.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {stats.map((s) => (
            <div key={s.label} className={`bg-gradient-to-br ${s.color} rounded-2xl p-5 text-white shadow-sm`}>
              <div className={`w-9 h-9 rounded-xl ${s.iconBg} flex items-center justify-center mb-3`}>
                {s.icon}
              </div>
              <p className="text-white/75 text-xs font-medium uppercase tracking-wide">{s.label}</p>
              <p className="text-4xl font-bold mt-0.5">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Table Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          {/* Toolbar */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 flex-wrap gap-3">
            <div className="flex items-center gap-2">
              {FILTERS.map((f) => (
                <button
                  key={f.key}
                  onClick={() => handleFilter(f.key)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                    filter === f.key
                      ? "bg-blue-600 text-white shadow-sm"
                      : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                  }`}
                >
                  {f.icon}
                  {f.label}
                </button>
              ))}
            </div>

            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search patient, diagnosis…"
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-9 pr-4 py-2 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-100 w-64"
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 text-xs text-slate-500 font-semibold uppercase tracking-wide">
                  <th className="text-left px-6 py-3">Patient</th>
                  <th className="text-left px-6 py-3">Appointment</th>
                  <th className="text-left px-6 py-3">Diagnosis</th>
                  <th className="text-left px-6 py-3">Reason</th>
                  <th className="text-left px-6 py-3">Status</th>
                  <th className="text-left px-6 py-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" className="text-center py-14 text-slate-400 text-sm">
                      Loading consultations…
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan="6" className="text-center py-14 text-red-400 text-sm">{error}</td>
                  </tr>
                ) : paginated.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-14 text-slate-400 text-sm">
                      No consultations found.
                    </td>
                  </tr>
                ) : (
                  paginated.map((c) => {
                    const patient = c.patient || {};
                    const appt = c.appointment || {};
                    const name = patient.user?.name || patient.name || patient.patient_code || "Unknown";
                    const age = calcAge(patient.date_of_birth);
                    const color = getAvatarColor(patient.id || c.id || 0);
                    const statusCfg = STATUS_CONFIG[appt.status?.toLowerCase()] || STATUS_CONFIG["pending"];

                    return (
                      <tr
                        key={c.id ?? `${c.patient_id}-${appt.id}`}
                        className="border-t border-slate-100 hover:bg-slate-50/60 transition"
                      >
                        {/* Patient */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`h-10 w-10 rounded-full ${color.bg} ${color.text} flex items-center justify-center text-sm font-bold flex-shrink-0`}>
                              {initials(name)}
                            </div>
                            <div>
                              <p className="font-semibold text-slate-700 text-sm">{name}</p>
                              <p className="text-xs text-slate-400">
                                {patient.patient_code || `#${patient.id}`}
                                {age ? ` • ${age} yrs` : ""}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Appointment */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5 text-xs text-slate-600">
                            <Calendar size={12} className="text-slate-400" />
                            <span>{formatDate(appt.appointment_date)}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
                            <Clock size={12} />
                            <span>{formatTime(appt.appointment_time)}</span>
                          </div>
                        </td>

                        {/* Diagnosis */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5 text-xs text-slate-600">
                            <Stethoscope size={12} className="text-slate-400 flex-shrink-0" />
                            <span className="truncate max-w-[140px]">{c.diagnosis || "N/A"}</span>
                          </div>
                        </td>

                        {/* Reason */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5 text-xs text-slate-600">
                            <FileText size={12} className="text-slate-400 flex-shrink-0" />
                            <span className="truncate max-w-[120px]">{appt.reason || "—"}</span>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${statusCfg.badge}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
                            {statusCfg.label}
                          </span>
                        </td>

                        {/* Action */}
                        <td className="px-6 py-4">
                          <button
                            onClick={() =>
                              navigate(`/doctor/consultation/${c.id}`, { state: { consultation: c } })
                            }
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 text-xs font-semibold rounded-lg hover:bg-blue-100 transition"
                          >
                            <Eye size={13} />
                            View
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100">
            <p className="text-xs text-slate-400">
              Showing {filtered.length === 0 ? 0 : (page - 1) * ITEMS_PER_PAGE + 1}–
              {Math.min(page * ITEMS_PER_PAGE, filtered.length)} of {filtered.length} record{filtered.length !== 1 ? "s" : ""}
            </p>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                <ChevronLeft size={14} />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                .reduce((acc, p, idx, arr) => {
                  if (idx > 0 && p - arr[idx - 1] > 1) acc.push("…");
                  acc.push(p);
                  return acc;
                }, [])
                .map((p, i) =>
                  p === "…" ? (
                    <span key={`e-${i}`} className="w-8 h-8 flex items-center justify-center text-slate-400 text-xs">...</span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-semibold transition ${
                        page === p ? "bg-blue-600 text-white shadow-sm" : "text-slate-500 hover:bg-slate-100"
                      }`}
                    >
                      {p}
                    </button>
                  )
                )}

              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                <ChevronRight size={14} />
              </button>

              <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm hover:bg-blue-700 transition ml-1">
                <Plus size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}