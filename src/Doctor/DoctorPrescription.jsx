import DoctorSidebar from "../Doctor/DoctorSidebar";
import { useState, useEffect } from "react";
import {
  Search,
  Pill,
  ClipboardList,
  Clock,
  CheckCircle,
  Eye,
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  Stethoscope,
  User,
  Calendar,
  FileText,
  X,
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

function initials(code = "") {
  return code.replace("PT-", "P").slice(0, 2).toUpperCase() || "PT";
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

export default function DoctorPrescription() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null);

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) { setError("Authentication token is missing."); setLoading(false); return; }
    fetch("http://127.0.0.1:8000/api/PrescriptionDoctor", {
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
    })
      .then((res) => res.json())
      .then((data) => {
        const items = Array.isArray(data) ? data
          : Array.isArray(data?.data) ? data.data
          : data?.data ? [data.data] : [];
        setPrescriptions(items);
      })
      .catch(() => setError("Unable to fetch prescriptions."))
      .finally(() => setLoading(false));
  }, [token]);

  const handleSearch = (val) => { setSearch(val); setPage(1); };

  const filtered = prescriptions.filter((p) => {
    const q = search.toLowerCase();
    return !q
      || p.medicine_name?.toLowerCase().includes(q)
      || p.patient?.patient_code?.toLowerCase().includes(q)
      || p.consultation?.diagnosis?.toLowerCase().includes(q);
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const totalCount = prescriptions.length;

  const stats = [
    {
      label: "Total",
      value: totalCount,
      icon: <ClipboardList size={20} />,
      color: "from-blue-500 to-blue-600",
      iconBg: "bg-blue-400/30",
    },
    {
      label: "Medicines",
      value: new Set(prescriptions.map((p) => p.medicine_name)).size,
      icon: <Pill size={20} />,
      color: "from-purple-500 to-purple-600",
      iconBg: "bg-purple-400/30",
    },
    {
      label: "Patients",
      value: new Set(prescriptions.map((p) => p.patient_id)).size,
      icon: <User size={20} />,
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
          <h1 className="text-3xl font-bold text-slate-800">Prescriptions</h1>
          <p className="text-slate-400 mt-1 text-sm">Manage and review prescriptions issued to your patients.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {stats.map((s) => (
            <div key={s.label} className={`bg-linear-to-br ${s.color} rounded-2xl p-5 text-white shadow-sm`}>
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
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <h2 className="font-semibold text-slate-700">Prescription List</h2>
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search medicine, patient, diagnosis…"
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
                  <th className="text-left px-6 py-3">Patient</th>
                  <th className="text-left px-6 py-3">Medicine</th>
                  <th className="text-left px-6 py-3">Dosage & Duration</th>
                  <th className="text-left px-6 py-3">Diagnosis</th>
                  <th className="text-left px-6 py-3">Date</th>
                  <th className="text-left px-6 py-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" className="text-center py-14 text-slate-400 text-sm">Loading prescriptions…</td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan="6" className="text-center py-14 text-red-400 text-sm">{error}</td>
                  </tr>
                ) : paginated.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-14 text-slate-400 text-sm">No prescriptions found.</td>
                  </tr>
                ) : (
                  paginated.map((rx) => {
                    const patient = rx.patient || {};
                    const consult = rx.consultation || {};
                    const color = getAvatarColor(patient.id || rx.id || 0);
                    const age = calcAge(patient.date_of_birth);

                    return (
                      <tr
                        key={rx.id}
                        className="border-t border-slate-100 hover:bg-slate-50/60 transition"
                      >
                        {/* Patient */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`h-10 w-10 rounded-full ${color.bg} ${color.text} flex items-center justify-center text-sm font-bold shrink-0`}>
                              {initials(patient.patient_code)}
                            </div>
                            <div>
                              <p className="font-semibold text-slate-700 text-sm">
                                {patient.patient_code || `Patient #${rx.patient_id}`}
                              </p>
                              <p className="text-xs text-slate-400">
                                {patient.gender && `${patient.gender.charAt(0).toUpperCase() + patient.gender.slice(1)}`}
                                {age ? ` • ${age} yrs` : ""}
                                {patient.blood_group ? ` • ${patient.blood_group}` : ""}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Medicine */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                              <Pill size={13} className="text-blue-500" />
                            </div>
                            <span className="font-semibold text-slate-700 text-sm">{rx.medicine_name || "—"}</span>
                          </div>
                        </td>

                        {/* Dosage & Duration */}
                        <td className="px-6 py-4">
                          <p className="text-sm font-medium text-slate-700">{rx.dosage || "—"}</p>
                          <div className="flex items-center gap-1 mt-0.5">
                            <Clock size={11} className="text-slate-400" />
                            <span className="text-xs text-slate-400">{rx.duration_time || "—"}</span>
                          </div>
                        </td>

                        {/* Diagnosis */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5 text-xs text-slate-600">
                            <Stethoscope size={12} className="text-slate-400 shrink-0" />
                            <span className="truncate max-w-37.5">{consult.diagnosis || "—"}</span>
                          </div>
                          {consult.symptoms && (
                            <p className="text-xs text-slate-400 mt-0.5 truncate max-w-37.5">{consult.symptoms}</p>
                          )}
                        </td>

                        {/* Date */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5 text-xs text-slate-500">
                            <Calendar size={12} className="text-slate-400" />
                            {formatDate(rx.created_at)}
                          </div>
                        </td>

                        {/* Action */}
                        <td className="px-6 py-4">
                          <button
                            onClick={() => setSelected(rx)}
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
              {Math.min(page * ITEMS_PER_PAGE, filtered.length)} of {filtered.length} prescription{filtered.length !== 1 ? "s" : ""}
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

      {/* Detail Modal */}
      {selected && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-linear-to-br from-blue-500 to-indigo-600 p-6 text-white">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                    <Pill size={22} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{selected.medicine_name}</h3>
                    <p className="text-white/75 text-sm mt-0.5">
                      {selected.dosage} · {selected.duration_time}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelected(null)}
                  className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition"
                >
                  <X size={15} />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5">
              {/* Patient Info */}
              <Section title="Patient Information" icon={<User size={14} />}>
                <div className="grid grid-cols-2 gap-3">
                  <InfoItem label="Patient Code" value={selected.patient?.patient_code || "—"} />
                  <InfoItem label="Gender" value={selected.patient?.gender || "—"} />
                  <InfoItem label="Age" value={selected.patient?.date_of_birth ? `${calcAge(selected.patient.date_of_birth)} years` : "—"} />
                  <InfoItem label="Blood Group" value={selected.patient?.blood_group || "—"} />
                  <InfoItem label="Address" value={selected.patient?.address || "—"} />
                </div>
              </Section>

              {/* Consultation Info */}
              <Section title="Consultation" icon={<Stethoscope size={14} />}>
                <div className="space-y-2">
                  <InfoItem label="Diagnosis" value={selected.consultation?.diagnosis || "—"} />
                  <InfoItem label="Symptoms" value={selected.consultation?.symptoms || "—"} />
                  {selected.consultation?.note && (
                    <div className="mt-2 p-3 bg-slate-50 rounded-xl text-xs text-slate-600 italic">
                      "{selected.consultation.note}"
                    </div>
                  )}
                </div>
              </Section>

              {/* Prescription Info */}
              <Section title="Prescription Details" icon={<FileText size={14} />}>
                <div className="grid grid-cols-2 gap-3">
                  <InfoItem label="Medicine" value={selected.medicine_name || "—"} />
                  <InfoItem label="Dosage" value={selected.dosage || "—"} />
                  <InfoItem label="Duration" value={selected.duration_time || "—"} />
                  <InfoItem label="Issued" value={formatDate(selected.created_at)} />
                </div>
              </Section>
            </div>

            {/* Footer */}
            <div className="px-6 pb-6 flex justify-end gap-3">
              <button
                onClick={() => setSelected(null)}
                className="px-4 py-2 text-sm text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition"
              >
                Close
              </button>
              <button className="px-4 py-2 text-sm bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-semibold flex items-center gap-2">
                <CheckCircle size={14} />
                Print Prescription
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Section({ title, icon, children }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-slate-400">{icon}</span>
        <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{title}</h4>
      </div>
      {children}
    </div>
  );
}

function InfoItem({ label, value }) {
  return (
    <div>
      <p className="text-xs text-slate-400 font-medium mb-0.5">{label}</p>
      <p className="text-sm font-semibold text-slate-700">{value}</p>
    </div>
  );
}