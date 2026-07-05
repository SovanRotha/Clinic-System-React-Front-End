import DoctorSidebar from "../Doctor/DoctorSidebar";
import { useEffect, useState } from "react";
import {
  Calendar,
  Users,
  ClipboardList,
  CheckCircle,
  Clock,
  TrendingUp,
  ChevronRight,
  MoreVertical,
  FileText,
  Pill,
  ArrowUpRight,
  AlertCircle,
  Target,
} from "lucide-react";

// ── helpers ────────────────────────────────────────────────────────────────────
function formatTime(t) {
  if (!t) return "—";
  const [h, m] = t.split(":");
  const hr = parseInt(h);
  return `${hr % 12 || 12}:${m} ${hr >= 12 ? "PM" : "AM"}`;
}

function calcAge(dob) {
  if (!dob) return null;
  const d = new Date(dob), now = new Date();
  let age = now.getFullYear() - d.getFullYear();
  if (now < new Date(now.getFullYear(), d.getMonth(), d.getDate())) age--;
  return age;
}

function formatDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function normalizeDateToISO(d) {
  if (!d) return null;
  const dt = new Date(d);
  if (isNaN(dt)) return null;
  return dt.toISOString().split("T")[0];
}

function initials(name = "") {
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2) || "PT";
}

const AVATAR_COLORS = [
  { bg: "bg-blue-100",   text: "text-blue-700"   },
  { bg: "bg-purple-100", text: "text-purple-700" },
  { bg: "bg-teal-100",   text: "text-teal-700"   },
  { bg: "bg-indigo-100", text: "text-indigo-700" },
  { bg: "bg-rose-100",   text: "text-rose-700"   },
  { bg: "bg-amber-100",  text: "text-amber-700"  },
];
const avatarColor = (id) => AVATAR_COLORS[(id || 0) % AVATAR_COLORS.length];

const STATUS_CFG = {
  completed:   { dot: "bg-green-500",  badge: "bg-green-100 text-green-700",   label: "COMPLETED"   },
  pending:     { dot: "bg-yellow-400", badge: "bg-yellow-100 text-yellow-700", label: "PENDING"     },
  in_progress: { dot: "bg-blue-500",   badge: "bg-blue-100 text-blue-700",     label: "IN PROGRESS" },
  confirmed:   { dot: "bg-indigo-500", badge: "bg-indigo-100 text-indigo-700", label: "CONFIRMED"   },
  cancelled:   { dot: "bg-red-400",    badge: "bg-red-100 text-red-700",       label: "CANCELLED"   },
};

// ── bar chart (pure CSS) ───────────────────────────────────────────────────────
const DAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
function MiniBarChart({ data }) {
  const max = Math.max(...data, 1);
  const todayIdx = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1;
  return (
    <div className="flex items-end gap-1.5 h-28 mt-4">
      {data.map((v, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          {i === todayIdx && v > 0 && (
            <span className="text-[10px] font-bold text-white bg-blue-600 rounded px-1">{v}</span>
          )}
          <div
            className={`w-full rounded-t-md transition-all ${i === todayIdx ? "bg-blue-600" : "bg-blue-100"}`}
            style={{ height: `${(v / max) * 96}px`, minHeight: 4 }}
          />
          <span className="text-[10px] text-slate-400 font-medium">{DAYS[i]}</span>
        </div>
      ))}
    </div>
  );
}

// ── main component ────────────────────────────────────────────────────────────
export default function DashboardDoctor() {
  const [doctor,        setDoctor]        = useState(null);
  const [appointments,  setAppointments]  = useState([]);
  const [patients,      setPatients]      = useState([]);
  const [consultations, setConsultations] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading,       setLoading]       = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { setLoading(false); return; }

    Promise.all([
      fetch("http://127.0.0.1:8000/api/doctor/profile",       { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()).catch(() => null),
      fetch("http://127.0.0.1:8000/api/AppointmentDoctor",     { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()).catch(() => []),
      fetch("http://127.0.0.1:8000/api/patients",              { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()).catch(() => []),
      fetch("http://127.0.0.1:8000/api/ConsultationDoctor",    { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()).catch(() => []),
      fetch("http://127.0.0.1:8000/api/PrescriptionDoctor",    { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()).catch(() => []),
    ]).then(([profile, appts, pats, consults, rxs]) => {
      setDoctor(profile?.doctor || profile || null);
      setAppointments(Array.isArray(appts) ? appts : appts?.data || []);
      setPatients(Array.isArray(pats) ? pats : pats?.data || []);
      setConsultations(Array.isArray(consults) ? consults : consults?.data || []);
      setPrescriptions(Array.isArray(rxs) ? rxs : rxs?.data || []);
    }).finally(() => setLoading(false));
  }, []);

  const doctorName = doctor?.user?.name || "Doctor";
  const todayStr   = new Date().toISOString().split("T")[0];

  const todayAppts     = appointments.filter(a => normalizeDateToISO(a.appointment_date) === todayStr);
  const pendingAppts   = appointments.filter(a => a.status === "pending").length;
  const completedAppts = appointments.filter(a => a.status === "completed").length;

  // consultations per weekday (Mon=0 … Sun=6)
  const trendData = Array(7).fill(0);
  consultations.forEach(c => {
    const d = new Date(c.created_at);
    if (!isNaN(d)) {
      const idx = d.getDay() === 0 ? 6 : d.getDay() - 1;
      trendData[idx]++;
    }
  });

  const recentPatients = [...patients].sort((a, b) =>
    new Date(b.updated_at || 0) - new Date(a.updated_at || 0)
  ).slice(0, 4);

  const upcomingAppts = todayAppts
    .filter(a => ["pending", "confirmed"].includes(a.status))
    .slice(0, 3);

  const statCards = [
    {
      label: "Today's Appointments",
      value: todayAppts.length,
      sub: `${todayAppts.length > 0 ? todayAppts.length : "No"} appointments today`,
      icon: <Calendar size={22} />,
      badge: "+5%",
      badgeColor: "text-green-600",
      gradient: "from-blue-500 to-blue-600",
      iconBg: "bg-blue-400/25",
    },
    {
      label: "Total Patients",
      value: patients.length.toLocaleString(),
      sub: "Registered patients",
      icon: <Users size={22} />,
      badge: "+12",
      badgeColor: "text-green-600",
      gradient: "from-indigo-500 to-indigo-600",
      iconBg: "bg-indigo-400/25",
    },
    {
      label: "Pending",
      value: pendingAppts,
      sub: "Awaiting confirmation",
      icon: <AlertCircle size={22} />,
      badge: "Urgent",
      badgeColor: "text-red-500",
      gradient: "from-amber-400 to-orange-500",
      iconBg: "bg-amber-400/25",
    },
    {
      label: "Completed",
      value: completedAppts,
      sub: "Consultations done",
      icon: <CheckCircle size={22} />,
      badge: "Goal",
      badgeColor: "text-slate-500",
      gradient: "from-teal-500 to-teal-600",
      iconBg: "bg-teal-400/25",
    },
  ];

  return (
    <div className="flex bg-slate-50 min-h-screen">
      <DoctorSidebar />

      <div className="flex-1 p-6 overflow-y-auto">
        {/* ── Page Header ── */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-800">
            Good morning, Dr. {doctorName} 👋
          </h1>
          <p className="text-slate-400 mt-1 text-sm">
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
          </p>
        </div>

        {/* ── Stat Cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {statCards.map((s) => (
            <div key={s.label} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <div className="flex items-start justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl bg-linear-to-br ${s.gradient} flex items-center justify-center text-white shadow-sm`}>
                  {s.icon}
                </div>
                <span className={`text-xs font-semibold ${s.badgeColor} flex items-center gap-0.5`}>
                  <ArrowUpRight size={12} />
                  {s.badge}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wide mb-1">{s.label}</p>
              <p className="text-3xl font-bold text-slate-800">{s.value}</p>
              <p className="text-xs text-slate-400 mt-1">{s.sub}</p>
            </div>
          ))}
        </div>

        {/* ── Main Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">

          {/* Today's Appointments table — spans 2 cols */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="font-semibold text-slate-700">Today's Appointments</h2>
              <button className="text-xs text-blue-600 font-semibold flex items-center gap-1 hover:underline">
                View Schedule <ChevronRight size={13} />
              </button>
            </div>

            {loading ? (
              <p className="text-center py-10 text-slate-400 text-sm">Loading…</p>
            ) : todayAppts.length === 0 ? (
              <p className="text-center py-10 text-slate-400 text-sm">No appointments today.</p>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 text-xs text-slate-500 font-semibold uppercase tracking-wide">
                    <th className="text-left px-6 py-3">Time</th>
                    <th className="text-left px-6 py-3">Patient Name</th>
                    <th className="text-left px-6 py-3">Status</th>
                    <th className="text-left px-6 py-3">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {todayAppts.slice(0, 5).map((a) => {
                    const patCode = a.patient?.patient_code || `PT-${a.patient_id}`;
                    const color = avatarColor(a.patient_id || 0);
                    const cfg = STATUS_CFG[a.status] || STATUS_CFG["pending"];
                    return (
                      <tr key={a.id} className="border-t border-slate-100 hover:bg-slate-50/60 transition">
                        <td className="px-6 py-3 text-sm text-slate-600 font-medium whitespace-nowrap">
                          {formatTime(a.appointment_time)}
                        </td>
                        <td className="px-6 py-3">
                          <div className="flex items-center gap-2.5">
                            <div className={`w-8 h-8 rounded-full ${color.bg} ${color.text} flex items-center justify-center text-xs font-bold shrink-0`}>
                              {initials(patCode)}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-slate-700">{patCode}</p>
                              <p className="text-xs text-slate-400">{a.reason}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-3">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${cfg.badge}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                            {cfg.label}
                          </span>
                        </td>
                        <td className="px-6 py-3">
                          <button className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-slate-200 transition">
                            <MoreVertical size={13} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* Upcoming Next sidebar */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100">
              <h2 className="font-semibold text-slate-700">Upcoming Next</h2>
            </div>
            <div className="p-4 space-y-3">
              {upcomingAppts.length === 0 ? (
                <p className="text-center py-6 text-slate-400 text-sm">No upcoming appointments.</p>
              ) : (
                upcomingAppts.map((a, i) => {
                  const color = avatarColor(a.patient_id || i);
                  const patCode = a.patient?.patient_code || `PT-${a.patient_id}`;
                  return (
                    <div key={a.id} className={`p-3 rounded-xl border-l-4 ${i === 0 ? "border-blue-500 bg-blue-50" : "border-slate-200 bg-slate-50"}`}>
                      <p className={`text-xs font-bold uppercase tracking-wide mb-1 ${i === 0 ? "text-blue-500" : "text-slate-400"}`}>
                        {i === 0 ? "Up Next" : formatTime(a.appointment_time)}
                      </p>
                      <div className="flex items-center gap-2">
                        <div className={`w-7 h-7 rounded-full ${color.bg} ${color.text} flex items-center justify-center text-xs font-bold shrink-0`}>
                          {initials(patCode)}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-700">{patCode}</p>
                          <p className="text-xs text-slate-400">{a.reason || "—"}</p>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            <div className="px-4 pb-4">
              <button className="w-full py-2.5 rounded-xl border border-slate-200 text-sm text-slate-600 font-semibold hover:bg-slate-50 transition">
                View Full Calendar
              </button>
            </div>
          </div>
        </div>

        {/* ── Bottom Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Recent Patients */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="font-semibold text-slate-700">Recent Patients</h2>
              <button className="text-xs text-blue-600 font-semibold hover:underline">View All</button>
            </div>
            {loading ? (
              <p className="text-center py-8 text-slate-400 text-sm">Loading…</p>
            ) : recentPatients.length === 0 ? (
              <p className="text-center py-8 text-slate-400 text-sm">No patients found.</p>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 text-xs text-slate-500 font-semibold uppercase tracking-wide">
                    <th className="text-left px-6 py-3">ID</th>
                    <th className="text-left px-6 py-3">Patient</th>
                    <th className="text-left px-6 py-3">Last Visit</th>
                    <th className="text-left px-6 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentPatients.map((p) => {
                    const color = avatarColor(p.id || 0);
                    return (
                      <tr key={p.id} className="border-t border-slate-100 hover:bg-slate-50/60 transition">
                        <td className="px-6 py-3 text-xs text-slate-400 font-mono">{p.patient_code}</td>
                        <td className="px-6 py-3">
                          <div className="flex items-center gap-2">
                            <div className={`w-7 h-7 rounded-full ${color.bg} ${color.text} flex items-center justify-center text-xs font-bold shrink-0`}>
                              {initials(p.user?.name || p.patient_code)}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-slate-700">{p.user?.name || p.patient_code}</p>
                              {p.date_of_birth && (
                                <p className="text-xs text-slate-400">{calcAge(p.date_of_birth)} yrs</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-3 text-xs text-slate-500">{formatDate(p.updated_at)}</td>
                        <td className="px-6 py-3">
                          <span className={`inline-flex items-center gap-1 text-xs font-semibold ${
                            p.gender === "female" ? "text-pink-600" : "text-blue-600"
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${p.gender === "female" ? "bg-pink-400" : "bg-blue-400"}`} />
                            {p.gender ? p.gender.charAt(0).toUpperCase() + p.gender.slice(1) : "—"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* Consultation Trends */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <div className="flex items-start justify-between mb-1">
              <div>
                <h2 className="font-semibold text-slate-700">Consultation Trends</h2>
                <p className="text-xs text-slate-400 mt-0.5">Daily consultations volume</p>
              </div>
              <div className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 rounded-xl text-xs text-slate-500 font-medium">
                Last 7 Days
                <ChevronRight size={12} className="rotate-90" />
              </div>
            </div>

            <MiniBarChart data={trendData} />

            {/* Quick summary row */}
            <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-slate-100">
              <div className="text-center">
                <p className="text-lg font-bold text-slate-700">{consultations.length}</p>
                <p className="text-xs text-slate-400">Total</p>
              </div>
              <div className="text-center border-x border-slate-100">
                <p className="text-lg font-bold text-slate-700">{prescriptions.length}</p>
                <p className="text-xs text-slate-400">Prescriptions</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-slate-700">{patients.length}</p>
                <p className="text-xs text-slate-400">Patients</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}