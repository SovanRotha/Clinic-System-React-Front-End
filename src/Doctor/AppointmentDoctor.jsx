import DoctorSidebar from "./DoctorSidebar";
import { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  Search,
  Filter,
  CheckCircle,
  Loader,
  ClipboardList,
  Plus,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const AVATAR_COLORS = [
  { bg: "bg-blue-100", text: "text-blue-700" },
  { bg: "bg-purple-100", text: "text-purple-700" },
  { bg: "bg-green-100", text: "text-green-700" },
  { bg: "bg-pink-100", text: "text-pink-700" },
  { bg: "bg-yellow-100", text: "text-yellow-700" },
  { bg: "bg-teal-100", text: "text-teal-700" },
];

function getAvatarColor(id) {
  return AVATAR_COLORS[id % AVATAR_COLORS.length];
}

function getInitials(code) {
  if (!code) return "PT";
  const parts = code.replace("PT-", "").trim();
  return `P${parts.slice(0, 1)}`;
}

const STATUS_CONFIG = {
  completed: {
    dot: "bg-green-500",
    badge: "bg-green-100 text-green-700",
    label: "COMPLETED",
  },
  pending: {
    dot: "bg-yellow-400",
    badge: "bg-yellow-100 text-yellow-700",
    label: "PENDING",
  },
  in_progress: {
    dot: "bg-blue-500",
    badge: "bg-blue-100 text-blue-700",
    label: "IN PROGRESS",
  },
  cancelled: {
    dot: "bg-red-400",
    badge: "bg-red-100 text-red-700",
    label: "CANCELLED",
  },
};

const ITEMS_PER_PAGE = 8;

const today = new Date().toLocaleDateString("en-US", {
  month: "long",
  day: "numeric",
  year: "numeric",
});

export default function AppointmentDoctor() {
  const [appointments, setAppointments] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) return;
    fetch("http://127.0.0.1:8000/api/AppointmentDoctor", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setAppointments(Array.isArray(data) ? data : data?.data || []))
      .catch(console.error);
  }, [token]);

  const totalAppointments = appointments.length;
  const pendingCount = appointments.filter((a) => a.status === "pending").length;
  const completedCount = appointments.filter((a) => a.status === "completed").length;
  const progressCount = appointments.filter((a) => a.status === "in_progress").length;

  const filtered = appointments.filter((a) =>
    [a.reason, a.patient?.patient_code, String(a.patient_id)]
      .join(" ")
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const handleSearch = (val) => {
    setSearch(val);
    setPage(1);
  };

  const formatTime = (t) => {
    if (!t) return "";
    const [h, m] = t.split(":");
    const date = new Date();
    date.setHours(+h, +m);
    return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  };

  const formatDate = (d) => {
    if (!d) return "";
    const date = new Date(d);
    const isToday = new Date().toDateString() === date.toDateString();
    if (isToday) return "Today";
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const stats = [
    {
      label: "Total Today",
      value: totalAppointments,
      icon: <ClipboardList size={20} />,
      color: "from-blue-500 to-blue-600",
      iconBg: "bg-blue-400/30",
    },
    {
      label: "Pending",
      value: pendingCount,
      icon: <Calendar size={20} />,
      color: "from-purple-500 to-purple-600",
      iconBg: "bg-purple-400/30",
    },
    {
      label: "In Progress",
      value: progressCount,
      icon: <Loader size={20} />,
      color: "from-indigo-500 to-indigo-600",
      iconBg: "bg-indigo-400/30",
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

      <div className="flex-1 p-6 max-w-6xl" style={{ marginLeft: 40 }}>
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">My Appointments</h1>
            <p className="text-slate-400 mt-1 text-sm">
              Manage and track your patient schedule for today,{" "}
              <span className="font-semibold text-slate-600">{today}</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-600 shadow-sm hover:bg-slate-50 transition">
              <Filter size={16} />
              Filter
            </button>
            <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-600 shadow-sm hover:bg-slate-50 transition">
              <Calendar size={16} />
              {today}
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {stats.map((s) => (
            <div
              key={s.label}
              className={`bg-gradient-to-br ${s.color} rounded-2xl p-5 text-white shadow-sm`}
            >
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
          {/* Table Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <h2 className="font-semibold text-slate-700">Appointment List</h2>
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search patient name, ID, or appointment..."
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-9 pr-4 py-2 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-100 w-72"
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 text-xs text-slate-500 font-semibold uppercase tracking-wide">
                  <th className="text-left px-6 py-3">Date & Time</th>
                  <th className="text-left px-6 py-3">Patient Name</th>
                  <th className="text-left px-6 py-3">Status</th>
                  <th className="text-left px-6 py-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {paginated.length > 0 ? (
                  paginated.map((appt) => {
                    const color = getAvatarColor(appt.patient_id || 0);
                    const initials = getInitials(appt.patient?.patient_code);
                    const statusCfg = STATUS_CONFIG[appt.status] || STATUS_CONFIG["pending"];

                    return (
                      <tr
                        key={appt.id}
                        className="border-t border-slate-100 hover:bg-slate-50/60 transition"
                      >
                        {/* Date & Time */}
                        <td className="px-6 py-4">
                          <p className="font-semibold text-slate-700 text-sm">
                            {formatDate(appt.appointment_date)}
                          </p>
                          <p className="text-xs text-slate-400 mt-0.5">
                            {formatTime(appt.appointment_time)}
                          </p>
                        </td>

                        {/* Patient */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div
                              className={`h-9 w-9 rounded-full ${color.bg} ${color.text} flex items-center justify-center text-sm font-bold flex-shrink-0`}
                            >
                              {initials}
                            </div>
                            <div>
                              <p className="font-semibold text-slate-700 text-sm">
                                {appt.patient?.patient_code || `Patient #${appt.patient_id}`}
                              </p>
                              <p className="text-xs text-slate-400">
                                ID: #PT-{String(appt.patient_id).padStart(4, "0")} •{" "}
                                {appt.reason}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${statusCfg.badge}`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
                            {statusCfg.label}
                          </span>
                        </td>

                        {/* Action */}
                        <td className="px-6 py-4">
                          <button className="text-xs text-blue-600 font-semibold hover:underline">
                            View
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="4" className="text-center py-14 text-slate-400 text-sm">
                      No appointments found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100">
            <p className="text-xs text-slate-400">
              Showing {Math.min((page - 1) * ITEMS_PER_PAGE + 1, filtered.length)}–
              {Math.min(page * ITEMS_PER_PAGE, filtered.length)} of {filtered.length} appointments
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
                    <span key={`ellipsis-${i}`} className="w-8 h-8 flex items-center justify-center text-slate-400 text-xs">
                      ...
                    </span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-semibold transition ${
                        page === p
                          ? "bg-blue-600 text-white shadow-sm"
                          : "text-slate-500 hover:bg-slate-100"
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