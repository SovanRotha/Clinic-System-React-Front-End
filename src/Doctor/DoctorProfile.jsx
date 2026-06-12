import DoctorSidebar from "./DoctorSidebar";
import { useState, useEffect } from "react";
import {
  User,
  Mail,
  Phone,
  Calendar,
  Clock,
  BadgeCheck,
  Building2,
  Edit3,
  Shield,
  Stethoscope,
} from "lucide-react";

const API_BASE = "http://127.0.0.1:8000";

function normalizeImageUrl(url) {
  if (!url) return null;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  const trimmed = url.replace(/^\/+/, "");
  if (trimmed.startsWith("storage/")) {
    return `${API_BASE}/${trimmed}`;
  }
  return `${API_BASE}/storage/${trimmed}`;
}

function formatTime(t) {
  if (!t) return "—";
  const [h, m] = t.split(":");
  const hr = parseInt(h);
  return `${hr % 12 || 12}:${m} ${hr >= 12 ? "PM" : "AM"}`;
}

function InfoRow({ icon, label, value }) {
  return (
    <div className="flex items-center gap-3 py-3 border-b border-slate-100 last:border-0">
      <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
        <span className="text-slate-400">{icon}</span>
      </div>
      <div>
        <p className="text-xs text-slate-400 font-medium">{label}</p>
        <p className="text-sm font-semibold text-slate-700">{value || "—"}</p>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, color, iconBg }) {
  return (
    <div className={`bg-gradient-to-br ${color} rounded-2xl p-5 text-white shadow-sm`}>
      <div className={`w-9 h-9 rounded-xl ${iconBg} flex items-center justify-center mb-3`}>
        {icon}
      </div>
      <p className="text-white/75 text-xs font-medium uppercase tracking-wide">{label}</p>
      <p className="text-lg font-bold mt-0.5">{value}</p>
    </div>
  );
}

export default function DoctorProfile() {
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchDoctor = async () => {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const doctorId = user?.id || user?.user?.id;

      if (!token) {
        setError("Authentication token is missing.");
        setLoading(false);
        return;
      }
      if (!doctorId) {
        setError("User ID is missing.");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${API_BASE}/api/getDoctor/${doctorId}`, {
          headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
        });
        const data = await res.json();
        const doctorData = data?.doctor || data?.data || data || null;

        if (doctorData?.user) {
          if (doctorData.user.profile) {
            doctorData.user.profile = normalizeImageUrl(doctorData.user.profile);
          }
          if (doctorData.user.avatar) {
            doctorData.user.avatar = normalizeImageUrl(doctorData.user.avatar);
          }
        }

        if (doctorData?.profile) {
          doctorData.profile = normalizeImageUrl(doctorData.profile);
        }
        if (doctorData?.avatar) {
          doctorData.avatar = normalizeImageUrl(doctorData.avatar);
        }

        setDoctor(doctorData);
      } catch (err) {
        console.error(err);
        setError("Unable to fetch profile.");
      } finally {
        setLoading(false);
      }
    };

    fetchDoctor();
  }, [token]);

  const user = doctor?.user || doctor || {};
  const name = user.name || "Doctor";
  const initials = name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div className="flex bg-slate-50 min-h-screen">
      <DoctorSidebar />

      <div className="flex-1 p-6 max-w-5xl" style={{ marginLeft: "40px" }}>
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-800">My Profile</h1>
          <p className="text-slate-400 mt-1 text-sm">View and manage your profile information.</p>
        </div>

        {loading ? (
          <p className="text-slate-400 text-sm">Loading profile…</p>
        ) : error ? (
          <p className="text-red-400 text-sm">{error}</p>
        ) : (
          <div className="space-y-6">
            {/* Profile Hero Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              {/* Banner */}
              <div className="h-28 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />

              {/* Avatar + Name */}
              <div className="px-6 pb-6">
                <div className="flex items-end justify-between -mt-12 mb-4">
                  <div className="relative">
                    {user.profile ? (
                      <img
                        src={user.profile}
                        alt={name}
                        className="w-20 h-20 rounded-2xl border-4 border-white shadow-md object-cover"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-2xl border-4 border-white shadow-md bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold">
                        {initials}
                      </div>
                    )}
                    <span className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white ${doctor?.status === "working" ? "bg-green-400" : "bg-slate-300"}`} />
                  </div>

                  <button className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 text-sm font-semibold rounded-xl hover:bg-blue-100 transition">
                    <Edit3 size={14} />
                    Edit Profile
                  </button>
                </div>

                <h2 className="text-xl font-bold text-slate-800">Dr. {name}</h2>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className="text-sm text-slate-500">{doctor?.doctor_code}</span>
                  <span className="text-slate-300">·</span>
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    doctor?.status === "working"
                      ? "bg-green-100 text-green-700"
                      : "bg-slate-100 text-slate-500"
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${doctor?.status === "working" ? "bg-green-500" : "bg-slate-400"}`} />
                    {doctor?.status === "working" ? "Active" : doctor?.status || "—"}
                  </span>
                  <span className="text-slate-300">·</span>
                  <span className="text-sm text-slate-500 capitalize">{user.role || "Doctor"}</span>
                </div>
              </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard
                label="Working Days"
                value={doctor?.working_day || "—"}
                icon={<Calendar size={18} />}
                color="from-blue-500 to-blue-600"
                iconBg="bg-blue-400/30"
              />
              <StatCard
                label="Start Time"
                value={formatTime(doctor?.start_time)}
                icon={<Clock size={18} />}
                color="from-teal-500 to-teal-600"
                iconBg="bg-teal-400/30"
              />
              <StatCard
                label="End Time"
                value={formatTime(doctor?.end_time)}
                icon={<Clock size={18} />}
                color="from-indigo-500 to-indigo-600"
                iconBg="bg-indigo-400/30"
              />
              <StatCard
                label="Status"
                value={doctor?.status === "working" ? "On Duty" : "Off Duty"}
                icon={<Shield size={18} />}
                color="from-purple-500 to-purple-600"
                iconBg="bg-purple-400/30"
              />
            </div>

            {/* Detail Sections */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Personal Info */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center">
                    <User size={14} className="text-blue-500" />
                  </div>
                  <h3 className="font-semibold text-slate-700 text-sm">Personal Information</h3>
                </div>
                <InfoRow icon={<User size={14} />}      label="Full Name"     value={`Dr. ${name}`} />
                <InfoRow icon={<Mail size={14} />}      label="Email"         value={user.email} />
                <InfoRow icon={<Phone size={14} />}     label="Phone Number"  value={user.phone_number} />
                <InfoRow icon={<Shield size={14} />}    label="Role"          value={user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : "—"} />
              </div>

              {/* Work Info */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center">
                    <Stethoscope size={14} className="text-indigo-500" />
                  </div>
                  <h3 className="font-semibold text-slate-700 text-sm">Work Schedule</h3>
                </div>
                <InfoRow icon={<BadgeCheck size={14} />}  label="Doctor Code"   value={doctor?.doctor_code} />
                <InfoRow icon={<Calendar size={14} />}    label="Working Days"  value={doctor?.working_day} />
                <InfoRow icon={<Clock size={14} />}       label="Start Time"    value={formatTime(doctor?.start_time)} />
                <InfoRow icon={<Clock size={14} />}       label="End Time"      value={formatTime(doctor?.end_time)} />
              </div>
            </div>

            {/* Account Info */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-lg bg-teal-50 flex items-center justify-center">
                  <Building2 size={14} className="text-teal-500" />
                </div>
                <h3 className="font-semibold text-slate-700 text-sm">Account Details</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
                <InfoRow icon={<BadgeCheck size={14} />} label="User ID"        value={`#${user.id}`} />
                <InfoRow icon={<BadgeCheck size={14} />} label="Doctor ID"      value={`#${doctor?.id}`} />
                <InfoRow icon={<Calendar size={14} />}   label="Member Since"   value={user.created_at ? new Date(user.created_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : "—"} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}