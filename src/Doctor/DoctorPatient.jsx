import DoctorSidebar from "./DoctorSidebar";
import { useState, useEffect } from "react";
import {
  Search,
  Filter,
  Users,
  User,
  ChevronLeft,
  ChevronRight,
  Plus,
  Eye,
  Phone,
  Mail,
  MapPin,
  Droplet,
  Calendar,
} from "lucide-react";

const ITEMS_PER_PAGE = 8;

const AVATAR_COLORS = [
  { bg: "bg-blue-100", text: "text-blue-700" },
  { bg: "bg-purple-100", text: "text-purple-700" },
  { bg: "bg-pink-100", text: "text-pink-700" },
  { bg: "bg-teal-100", text: "text-teal-700" },
  { bg: "bg-indigo-100", text: "text-indigo-700" },
  { bg: "bg-rose-100", text: "text-rose-700" },
];

function getAvatarColor(id) {
  return AVATAR_COLORS[(id || 0) % AVATAR_COLORS.length];
}

function calcAge(dob) {
  if (!dob) return "—";
  const d = new Date(dob), now = new Date();
  let age = now.getFullYear() - d.getFullYear();
  if (now < new Date(now.getFullYear(), d.getMonth(), d.getDate())) age--;
  return age;
}

function initials(name = "") {
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2) || "PT";
}

export default function DoctorPatient() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [genderFilter, setGenderFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null);

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) { setError("Authentication token is missing."); setLoading(false); return; }
    fetch("http://127.0.0.1:8000/api/patients", {
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
    })
      .then((res) => res.json())
      .then((data) => {
        const items = Array.isArray(data?.data) ? data.data
          : Array.isArray(data?.patients) ? data.patients
          : Array.isArray(data) ? data : [];
        setPatients(items);
      })
      .catch(() => setError("Unable to load patients."))
      .finally(() => setLoading(false));
  }, [token]);

  const genderCycle = ["all", "female", "male"];
  const cycleGender = () => {
    const idx = genderCycle.indexOf(genderFilter);
    setGenderFilter(genderCycle[(idx + 1) % genderCycle.length]);
    setPage(1);
  };

  const handleSearch = (val) => { setSearch(val); setPage(1); };

  const filtered = patients.filter((p) => {
    const gOk = genderFilter === "all" || p.gender === genderFilter;
    const q = search.toLowerCase();
    const qOk = !q
      || p.user?.name?.toLowerCase().includes(q)
      || p.patient_code?.toLowerCase().includes(q)
      || p.user?.email?.toLowerCase().includes(q);
    return gOk && qOk;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const totalCount = patients.length;
  const femaleCount = patients.filter((p) => p.gender === "female").length;
  const maleCount = patients.filter((p) => p.gender === "male").length;

  const stats = [
    {
      label: "Total Patients",
      value: totalCount,
      icon: <Users size={20} />,
      color: "from-blue-500 to-blue-600",
      iconBg: "bg-blue-400/30",
    },
    {
      label: "Female",
      value: femaleCount,
      icon: <User size={20} />,
      color: "from-pink-500 to-rose-500",
      iconBg: "bg-pink-400/30",
    },
    {
      label: "Male",
      value: maleCount,
      icon: <User size={20} />,
      color: "from-indigo-500 to-indigo-600",
      iconBg: "bg-indigo-400/30",
    },
  ];

  return (
    <div className="flex bg-slate-50 min-h-screen">
      <DoctorSidebar />

      <div className="flex-1 p-6 max-w-6xl mx-auto" style={{ marginLeft: 40 }}>
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-800">My Patients</h1>
          <p className="text-slate-400 mt-1 text-sm">View and manage your patient records.</p>
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
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <h2 className="font-semibold text-slate-700">Patient List</h2>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by name, code, email…"
                  value={search}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-9 pr-4 py-2 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-100 w-64"
                />
              </div>
              <button
                onClick={cycleGender}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-600 shadow-sm hover:bg-slate-50 transition"
              >
                <Filter size={15} />
                {genderFilter === "all" ? "All Genders" : genderFilter.charAt(0).toUpperCase() + genderFilter.slice(1)}
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 text-xs text-slate-500 font-semibold uppercase tracking-wide">
                  <th className="text-left px-6 py-3">Patient</th>
                  <th className="text-left px-6 py-3">Details</th>
                  <th className="text-left px-6 py-3">Contact</th>
                  <th className="text-left px-6 py-3">Gender</th>
                  <th className="text-left px-6 py-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="5" className="text-center py-14 text-slate-400 text-sm">
                      Loading patients…
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan="5" className="text-center py-14 text-red-400 text-sm">{error}</td>
                  </tr>
                ) : paginated.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-14 text-slate-400 text-sm">
                      No patients found.
                    </td>
                  </tr>
                ) : (
                  paginated.map((patient) => {
                    const name = patient.user?.name || "Unknown";
                    const color = getAvatarColor(patient.id || 0);
                    const isFemale = patient.gender === "female";

                    return (
                      <tr
                        key={patient.id ?? patient.patient_code}
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
                              <p className="text-xs text-slate-400">{patient.patient_code}</p>
                            </div>
                          </div>
                        </td>

                        {/* Details */}
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1">
                            <span className="flex items-center gap-1.5 text-xs text-slate-500">
                              <Calendar size={12} className="text-slate-400" />
                              {calcAge(patient.date_of_birth)} yrs
                            </span>
                            <span className="flex items-center gap-1.5 text-xs text-slate-500">
                              <Droplet size={12} className="text-red-400" />
                              {patient.blood_group || "—"}
                            </span>
                            <span className="flex items-center gap-1.5 text-xs text-slate-500">
                              <MapPin size={12} className="text-slate-400" />
                              {patient.address || "—"}
                            </span>
                          </div>
                        </td>

                        {/* Contact */}
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1">
                            <span className="flex items-center gap-1.5 text-xs text-slate-500">
                              <Mail size={12} className="text-slate-400" />
                              {patient.user?.email || "—"}
                            </span>
                            <span className="flex items-center gap-1.5 text-xs text-slate-500">
                              <Phone size={12} className="text-slate-400" />
                              {patient.user?.phone_number || "—"}
                            </span>
                          </div>
                        </td>

                        {/* Gender badge */}
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                            isFemale
                              ? "bg-pink-100 text-pink-700"
                              : "bg-blue-100 text-blue-700"
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${isFemale ? "bg-pink-400" : "bg-blue-400"}`} />
                            {isFemale ? "Female" : "Male"}
                          </span>
                        </td>

                        {/* Action */}
                        <td className="px-6 py-4">
                          <button
                            onClick={() => setSelected(patient)}
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
              {Math.min(page * ITEMS_PER_PAGE, filtered.length)} of {filtered.length} patients
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

      {/* Patient Detail Modal */}
      {selected && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className={`p-6 bg-gradient-to-br ${selected.gender === "female" ? "from-pink-500 to-rose-500" : "from-blue-500 to-indigo-600"} text-white`}>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center text-xl font-bold">
                  {initials(selected.user?.name || "")}
                </div>
                <div>
                  <h3 className="text-xl font-bold">{selected.user?.name || "Unknown"}</h3>
                  <p className="text-white/75 text-sm">{selected.patient_code}</p>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <InfoItem label="Age" value={`${calcAge(selected.date_of_birth)} years`} />
                <InfoItem label="Gender" value={selected.gender} />
                <InfoItem label="Blood Group" value={selected.blood_group || "—"} />
                <InfoItem label="Address" value={selected.address || "—"} />
                <InfoItem label="Email" value={selected.user?.email || "—"} />
                <InfoItem label="Phone" value={selected.user?.phone_number || "—"} />
                <InfoItem label="Date of Birth" value={selected.date_of_birth || "—"} />
                <InfoItem label="Patient ID" value={`#${selected.id}`} />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 pb-6 flex justify-end gap-3">
              <button
                onClick={() => setSelected(null)}
                className="px-4 py-2 text-sm text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition"
              >
                Close
              </button>
              <button className="px-4 py-2 text-sm bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-semibold">
                View Full Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InfoItem({ label, value }) {
  return (
    <div>
      <p className="text-xs text-slate-400 font-medium uppercase tracking-wide mb-0.5">{label}</p>
      <p className="text-sm font-semibold text-slate-700 truncate">{value}</p>
    </div>
  );
}