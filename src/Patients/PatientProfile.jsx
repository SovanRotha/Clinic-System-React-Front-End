import { useEffect, useState } from "react";
import PatientSidebar from "./PatientSidebar";

/* ─────────────────────────────────────────────
   PATIENT PROFILE  –  full redesign
───────────────────────────────────────────── */

export default function PatientProfile() {
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState("");
  const [formData, setFormData] = useState({
    gender: "",
    date_of_birth: "",
    address: "",
    blood_group: "",
  });

  const incomplete =
    !patient?.gender ||
    !patient?.date_of_birth ||
    !patient?.address ||
    !patient?.blood_group;

  const fetchPatient = async () => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const token = localStorage.getItem("token");
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`http://127.0.0.1:8000/api/patient-profile/${user.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });
      const data = await res.json();
      const patientData = data.data || data;
      setPatient(patientData);
      setFormData({
        gender: patientData.gender || "",
        date_of_birth: patientData.date_of_birth || "",
        address: patientData.address || "",
        blood_group: patientData.blood_group || "",
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatient();
  }, []);

  const handleFieldChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSaveProfile = async () => {
    const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
    const userId = patient?.user?.id || patient?.user_id || currentUser?.id;
    const patientId = patient?.id || userId;

    if (!patientId) return;

    setSaving(true);
    setSaveError("");
    setSaveSuccess("");

    const token = localStorage.getItem("token");
    const payload = { ...formData, user_id: userId };
    const updateCandidates = [
      { url: `http://127.0.0.1:8000/api/patients/${patientId}`, method: "PUT" },
      { url: `http://127.0.0.1:8000/api/patients/${patientId}`, method: "PATCH" },
    ];

    const sendRequest = async ({ url, method }) => {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => null);
      return { res, data, url, method };
    };

    try {
      let result = null;
      for (const candidate of updateCandidates) {
        result = await sendRequest(candidate);
        if (result.res.ok) break;
        if (result.res.status !== 404 && result.res.status !== 405) break;
      }

      if (!result?.res?.ok) {
        setSaveError(
          result?.data?.message ||
            result?.data?.error ||
            result?.res?.statusText ||
            "The server did not accept the profile update."
        );
        return;
      }

      await fetchPatient();
      setSaveSuccess("Profile updated successfully.");
      setEditMode(false);
    } catch (err) {
      console.error(err);
      setSaveError("Could not connect to the server.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={styles.page}>
      <PatientSidebar />

      <main style={styles.main}>
        {/* ── BREADCRUMB ── */}
        <p style={styles.breadcrumb}>Dashboard &nbsp;/&nbsp; <span style={styles.breadcrumbCurrent}>My Profile</span></p>
        <h1 style={styles.pageTitle}>My Profile</h1>
        {incomplete && !loading && (
          <ProfileCompletionBanner
            onEdit={() => setEditMode((prev) => !prev)}
            editMode={editMode}
          />
        )}
        {editMode && !loading && (
          <ProfileForm
            formData={formData}
            onChange={handleFieldChange}
            onCancel={() => setEditMode(false)}
            onSave={handleSaveProfile}
            saving={saving}
            error={saveError}
            success={saveSuccess}
          />
        )}

        {loading ? (
          <LoadingSkeleton />
        ) : !patient ? (
          <EmptyState />
        ) : (
          <>
            {/* ── HERO CARD ── */}
            <HeroCard patient={patient} />

            {/* ── MAIN GRID ── */}
            <div style={styles.grid}>
              <PersonalInfo patient={patient} />
              <SideStats />
            </div>
          </>
        )}
      </main>
    </div>
  );
}

/* ─────────────────────────────────────────────
   HERO CARD
───────────────────────────────────────────── */
function HeroCard({ patient }) {
  const name    = patient?.user?.name ?? "—";
  const profile = patient?.user?.profile;
  const email   = patient?.user?.email ?? "";

  const avatarSrc = profile
    ? profile.startsWith("http")
      ? profile
      : `http://127.0.0.1:8000/storage/${profile}`
    : null;

  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return (
    <div style={styles.heroCard}>
      {/* left — avatar + name */}
      <div style={styles.heroLeft}>
        <div style={styles.avatarWrap}>
          {avatarSrc ? (
            <img src={avatarSrc} alt={name} style={styles.avatarImg} />
          ) : (
            <div style={styles.avatarFallback}>{initials}</div>
          )}
          <span style={styles.onlineDot} />
        </div>

        <div>
          <h2 style={styles.heroName}>{name}</h2>
          <p style={styles.heroSub}>{email || "Patient Account"}</p>
          <div style={styles.badgeRow}>
            <Badge color="green" label="Active"   icon="●" />
            <Badge color="blue"  label="Verified" icon="✓" />
          </div>
        </div>
      </div>

      {/* right — quick stats */}
      <div style={styles.heroStats}>
        <HeroStat label="Total Visits"     value="12" />
        <div style={styles.statDivider} />
        <HeroStat label="Prescriptions"   value="3"  />
        <div style={styles.statDivider} />
        <HeroStat label="Upcoming"        value="2"  />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   PERSONAL INFO CARD
───────────────────────────────────────────── */
function PersonalInfo({ patient }) {
  const u = patient?.user ?? {};

  const rows1 = [
    { label: "Full Name",     value: u.name },
    { label: "Email",         value: u.email },
    { label: "Phone",         value: u.phone_number },
    { label: "Gender",        value: patient.gender },
    { label: "Date of Birth", value: patient.date_of_birth },
    { label: "Blood Group",   value: patient.blood_group, blood: true },
  ];

  const rows2 = [
    { label: "Address",      value: patient.address,      wide: true },
    { label: "Patient Code", value: patient.patient_code, mono: true },
    { label: "Registered",   value: "Jan 2022" },
  ];

  return (
    <div style={styles.card}>
      <SectionTitle icon="🪪" label="Personal Information" />

      <div style={styles.infoGrid}>
        {rows1.map(({ label, value, blood }) => (
          <div key={label}>
            <p style={styles.infoLabel}>{label}</p>
            {blood ? (
              <span style={styles.bloodBadge}>{value || "—"}</span>
            ) : (
              <p style={styles.infoValue}>{value || "—"}</p>
            )}
          </div>
        ))}
      </div>

      <div style={styles.divider} />

      <div style={styles.infoGrid}>
        {rows2.map(({ label, value, wide, mono }) => (
          <div key={label} style={wide ? { gridColumn: "span 2" } : {}}>
            <p style={styles.infoLabel}>{label}</p>
            <p style={{ ...styles.infoValue, ...(mono ? styles.mono : {}) }}>{value || "—"}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   RIGHT SIDEBAR STATS
───────────────────────────────────────────── */
function SideStats() {
  return (
    <div style={styles.sideCol}>
      {/* status + last visit */}
      <div style={styles.card}>
        <SectionTitle icon="📊" label="Account Overview" />
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <StatRow icon="✅" iconBg="#DCFCE7" iconColor="#16A34A" label="Account status" value="Active"   valueColor="#16A34A" />
          <StatRow icon="🕐" iconBg="#FEF9C3" iconColor="#CA8A04" label="Last visit"     value="Today"   valueColor="#CA8A04" />
          <StatRow icon="💊" iconBg="#DBEAFE" iconColor="#2563EB" label="Next appointment" value="Jun 12" valueColor="#2563EB" />
        </div>
      </div>

      {/* data completion */}
      <div style={styles.card}>
        <SectionTitle icon="📈" label="Data Completion" />
        <div style={styles.completionScore}>92%</div>
        <ProgressBar label="Profile info"     pct={100} color="#22C55E" />
        <ProgressBar label="Medical history"  pct={88}  color="#3B82F6" />
        <ProgressBar label="Insurance"        pct={75}  color="#F59E0B" />
        <ProgressBar label="Emergency contact" pct={60} color="#EF4444" />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   SMALL REUSABLE PIECES
───────────────────────────────────────────── */
function SectionTitle({ icon, label }) {
  return (
    <div style={styles.sectionTitle}>
      <span style={{ fontSize: 15 }}>{icon}</span>
      <span>{label}</span>
    </div>
  );
}

function Badge({ color, label, icon }) {
  const map = {
    green: { bg: "#DCFCE7", fg: "#16A34A" },
    blue:  { bg: "#DBEAFE", fg: "#2563EB" },
  };
  const { bg, fg } = map[color];
  return (
    <span style={{ ...styles.badge, background: bg, color: fg }}>
      {icon} {label}
    </span>
  );
}

function HeroStat({ label, value }) {
  return (
    <div style={styles.heroStatItem}>
      <p style={styles.heroStatValue}>{value}</p>
      <p style={styles.heroStatLabel}>{label}</p>
    </div>
  );
}

function StatRow({ icon, iconBg, iconColor, label, value, valueColor }) {
  return (
    <div style={styles.statRow}>
      <div style={{ ...styles.statIcon, background: iconBg, color: iconColor }}>{icon}</div>
      <div style={{ flex: 1 }}>
        <p style={styles.statLabel}>{label}</p>
        <p style={{ ...styles.statValue, color: valueColor }}>{value}</p>
      </div>
    </div>
  );
}

function ProgressBar({ label, pct, color }) {
  return (
    <div style={{ marginTop: 12 }}>
      <div style={styles.progressHeader}>
        <span style={styles.progressLabel}>{label}</span>
        <span style={styles.progressPct}>{pct}%</span>
      </div>
      <div style={styles.progressTrack}>
        <div style={{ ...styles.progressFill, width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {[1, 2, 3].map((i) => (
        <div key={i} style={{ ...styles.card, height: 80, background: "#F1F5F9", animation: "pulse 1.5s infinite" }} />
      ))}
    </div>
  );
}

function ProfileCompletionBanner({ editMode, onEdit }) {
  return (
    <div style={styles.completionBanner}>
      <div>
        <p style={styles.completionTitle}>Profile incomplete</p>
        <p style={styles.completionText}>
          Some important patient details are missing. Complete your profile to keep medical records accurate and appointments streamlined.
        </p>
      </div>
      <button type="button" onClick={onEdit} style={styles.completionButton}>
        {editMode ? "Close" : "Complete profile"}
      </button>
    </div>
  );
}

function ProfileForm({ formData, onChange, onCancel, onSave, saving, error, success }) {
  return (
    <div style={{ ...styles.card, marginBottom: 22 }}>
      <SectionTitle icon="✍️" label="Complete your patient profile" />

      <div style={styles.formGrid}>
        <div>
          <label style={styles.inputLabel}>Gender</label>
          <select
            value={formData.gender}
            onChange={(e) => onChange("gender", e.target.value)}
            style={styles.inputField}
          >
            <option value="">Select gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label style={styles.inputLabel}>Date of birth</label>
          <input
            type="date"
            value={formData.date_of_birth}
            onChange={(e) => onChange("date_of_birth", e.target.value)}
            style={styles.inputField}
          />
        </div>

        <div>
          <label style={styles.inputLabel}>Blood group</label>
          <select
            value={formData.blood_group}
            onChange={(e) => onChange("blood_group", e.target.value)}
            style={styles.inputField}
          >
            <option value="">Select group</option>
            <option value="A+">A+</option>
            <option value="A-">A-</option>
            <option value="B+">B+</option>
            <option value="B-">B-</option>
            <option value="AB+">AB+</option>
            <option value="AB-">AB-</option>
            <option value="O+">O+</option>
            <option value="O-">O-</option>
          </select>
        </div>

        <div style={{ gridColumn: "1 / -1" }}>
          <label style={styles.inputLabel}>Address</label>
          <textarea
            value={formData.address}
            onChange={(e) => onChange("address", e.target.value)}
            rows={3}
            style={{ ...styles.inputField, minHeight: 92, resize: "vertical" }}
          />
        </div>
      </div>

      {error && <p style={styles.formMessageError}>{error}</p>}
      {success && <p style={styles.formMessageSuccess}>{success}</p>}

      <div style={styles.formActions}>
        <button type="button" onClick={onCancel} style={styles.secondaryButton}>
          Cancel
        </button>
        <button type="button" onClick={onSave} disabled={saving} style={styles.primaryButton}>
          {saving ? "Saving..." : "Save profile"}
        </button>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div style={{ ...styles.card, textAlign: "center", padding: 48 }}>
      <p style={{ fontSize: 32, marginBottom: 12 }}>🔍</p>
      <p style={{ fontWeight: 600, marginBottom: 6 }}>No profile found</p>
      <p style={{ color: "#94A3B8", fontSize: 14 }}>We couldn't load your patient data. Please try again.</p>
    </div>
  );
}

/* ─────────────────────────────────────────────
   STYLES
───────────────────────────────────────────── */
const styles = {
  /* layout */
  page: {
    display: "flex",
    background: "#F8FAFC",
    minHeight: "100vh",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
  },
  main: {
    flex: 1,
    padding: "32px 36px",
    maxWidth: 1100,
    marginLeft: 40,
  },

  /* breadcrumb */
  breadcrumb: {
    fontSize: 12,
    color: "#94A3B8",
    marginBottom: 4,
  },
  breadcrumbCurrent: {
    color: "#64748B",
    fontWeight: 500,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: 700,
    color: "#0F172A",
    margin: "0 0 24px",
  },

  /* hero card */
  heroCard: {
    background: "#fff",
    border: "1px solid #E2E8F0",
    borderRadius: 20,
    padding: "20px 28px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 22,
    boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.04)",
  },
  heroLeft: {
    display: "flex",
    alignItems: "center",
    gap: 18,
  },
  avatarWrap: {
    position: "relative",
    flexShrink: 0,
  },
  avatarImg: {
    width: 68,
    height: 68,
    borderRadius: "50%",
    objectFit: "cover",
    border: "3px solid #E0F2FE",
  },
  avatarFallback: {
    width: 68,
    height: 68,
    borderRadius: "50%",
    background: "linear-gradient(135deg, #DBEAFE 0%, #EDE9FE 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 22,
    fontWeight: 700,
    color: "#3B82F6",
    border: "3px solid #E0F2FE",
  },
  onlineDot: {
    position: "absolute",
    bottom: 3,
    right: 3,
    width: 13,
    height: 13,
    background: "#22C55E",
    borderRadius: "50%",
    border: "2.5px solid #fff",
  },
  heroName: {
    fontSize: 18,
    fontWeight: 700,
    color: "#0F172A",
    margin: "0 0 3px",
  },
  heroSub: {
    fontSize: 13,
    color: "#64748B",
    margin: "0 0 10px",
  },
  badgeRow: {
    display: "flex",
    gap: 6,
  },
  badge: {
    fontSize: 11,
    fontWeight: 600,
    padding: "3px 10px",
    borderRadius: 999,
    letterSpacing: "0.02em",
  },
  heroStats: {
    display: "flex",
    alignItems: "center",
    gap: 20,
  },
  heroStatItem: {
    textAlign: "center",
    minWidth: 64,
  },
  heroStatValue: {
    fontSize: 22,
    fontWeight: 700,
    color: "#0F172A",
    margin: 0,
  },
  heroStatLabel: {
    fontSize: 11,
    color: "#94A3B8",
    margin: "3px 0 0",
    textTransform: "uppercase",
    letterSpacing: "0.04em",
  },
  statDivider: {
    width: 1,
    height: 40,
    background: "#E2E8F0",
  },

  /* grid */
  grid: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 2fr) minmax(0, 1fr)",
    gap: 22,
  },

  /* card */
  card: {
    background: "#fff",
    border: "1px solid #E2E8F0",
    borderRadius: 18,
    padding: "20px 24px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.04)",
  },
  sectionTitle: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    fontSize: 13,
    fontWeight: 600,
    color: "#374151",
    marginBottom: 18,
    textTransform: "uppercase",
    letterSpacing: "0.06em",
  },

  /* info grid */
  infoGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "16px 20px",
  },
  infoLabel: {
    fontSize: 11,
    fontWeight: 500,
    color: "#94A3B8",
    margin: "0 0 4px",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
  },
  infoValue: {
    fontSize: 14,
    fontWeight: 600,
    color: "#1E293B",
    margin: 0,
  },
  mono: {
    fontFamily: "'Fira Code', 'Courier New', monospace",
    fontSize: 13,
    background: "#F1F5F9",
    padding: "2px 8px",
    borderRadius: 6,
    display: "inline-block",
  },
  bloodBadge: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minWidth: 40,
    padding: "4px 10px",
    background: "#FEE2E2",
    color: "#DC2626",
    fontWeight: 700,
    fontSize: 13,
    borderRadius: 8,
    letterSpacing: "0.04em",
  },
  divider: {
    height: 1,
    background: "#F1F5F9",
    margin: "20px 0",
  },

  /* side col */
  sideCol: {
    display: "flex",
    flexDirection: "column",
    gap: 22,
  },

  /* stat rows */
  statRow: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "10px 12px",
    borderRadius: 12,
    background: "#F8FAFC",
    border: "1px solid #F1F5F9",
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 16,
    flexShrink: 0,
  },
  statLabel: {
    fontSize: 11,
    color: "#94A3B8",
    margin: "0 0 2px",
    textTransform: "uppercase",
    letterSpacing: "0.04em",
  },
  statValue: {
    fontSize: 14,
    fontWeight: 700,
    margin: 0,
  },

  /* completion */
  completionScore: {
    fontSize: 36,
    fontWeight: 800,
    color: "#0F172A",
    marginBottom: 4,
    lineHeight: 1,
  },
  progressHeader: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  progressLabel: {
    fontSize: 12,
    color: "#64748B",
  },
  progressPct: {
    fontSize: 12,
    fontWeight: 600,
    color: "#374151",
  },
  progressTrack: {
    height: 6,
    background: "#F1F5F9",
    borderRadius: 999,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 999,
    transition: "width 0.6s ease",
  },
  completionBanner: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 20,
    background: "#FEF3C7",
    border: "1px solid #FDE68A",
    borderRadius: 18,
    padding: "18px 22px",
    marginBottom: 22,
  },
  completionTitle: {
    margin: 0,
    fontSize: 15,
    fontWeight: 700,
    color: "#92400E",
  },
  completionText: {
    margin: "6px 0 0",
    fontSize: 13,
    color: "#92400E",
    maxWidth: 680,
    lineHeight: 1.5,
  },
  completionButton: {
    border: "none",
    borderRadius: 12,
    background: "#92400E",
    color: "#fff",
    padding: "12px 18px",
    cursor: "pointer",
    fontWeight: 700,
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: 18,
  },
  inputLabel: {
    display: "block",
    marginBottom: 8,
    fontSize: 12,
    fontWeight: 600,
    color: "#475569",
  },
  inputField: {
    width: "100%",
    height: 48,
    borderRadius: 12,
    border: "1px solid #E2E8F0",
    padding: "0 14px",
    fontSize: 14,
    color: "#0F172A",
    outline: "none",
    boxSizing: "border-box",
  },
  formActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: 12,
    marginTop: 22,
  },
  primaryButton: {
    background: "#2563EB",
    color: "#fff",
    border: "none",
    borderRadius: 12,
    padding: "12px 18px",
    cursor: "pointer",
    fontWeight: 700,
  },
  secondaryButton: {
    background: "#F1F5F9",
    color: "#0F172A",
    border: "1px solid #E2E8F0",
    borderRadius: 12,
    padding: "12px 18px",
    cursor: "pointer",
    fontWeight: 700,
  },
  formMessageError: {
    marginTop: 16,
    color: "#B91C1C",
    fontSize: 13,
  },
  formMessageSuccess: {
    marginTop: 16,
    color: "#166534",
    fontSize: 13,
  },
};