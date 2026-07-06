import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—";

const fmtTime = (t) => {
  if (!t) return "—";
  const [h, m] = t.split(":");
  const hour = parseInt(h, 10);
  return `${hour > 12 ? hour - 12 : hour}:${m} ${hour >= 12 ? "PM" : "AM"}`;
};

const fmt = (n) =>
  Number(n || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const statusStyle = {
  confirmed:  { bg: "#EAF3DE", color: "#3B6D11" },
  pending:    { bg: "#FAEEDA", color: "#854F0B" },
  completed:  { bg: "#E6F1FB", color: "#185FA5" },
  cancelled:  { bg: "#FCEBEB", color: "#A32D2D" },
  paid:       { bg: "#EAF3DE", color: "#3B6D11" },
  unpaid:     { bg: "#FCEBEB", color: "#A32D2D" },
};

export default function ViewPatient() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [consultations, setConsultations] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("profile");

  const normalizeRecords = (payload) => {
    if (Array.isArray(payload?.data)) return payload.data;
    if (Array.isArray(payload)) return payload;
    return [];
  };

  const filterByPatient = (records) => {
    return records.filter((item) =>
      String(item.patient_id) === String(id) || String(item.patient?.id) === String(id)
    );
  };

  const fetchRecords = async (url, token) => {
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Fetch failed (${response.status}): ${text}`);
    }

    const payload = await response.json();
    return filterByPatient(normalizeRecords(payload));
  };

  const fetchAllData = async () => {
    const token = localStorage.getItem("token");
    if (!id || !token) {
      setError("Invalid patient ID or missing authentication.");
      setLoading(false);
      return;
    }

    try {
      const patientResponse = await fetch(`https://clinic-system-back-end.onrender.com/api/patients/${id}`, {
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      });

      if (!patientResponse.ok) {
        const text = await patientResponse.text();
        throw new Error(`Unable to load patient profile (${patientResponse.status}): ${text}`);
      }

      const patientData = await patientResponse.json();
      const patientRecord = patientData.data || patientData;
      setPatient(patientRecord);

      const [appointmentList, consultationList, prescriptionList, billList] = await Promise.all([
        fetchRecords(`https://clinic-system-back-end.onrender.com/api/appointment?patient_id=${id}`, token),
        fetchRecords(`https://clinic-system-back-end.onrender.com/api/consultation?patient_id=${id}`, token),
        fetchRecords(`https://clinic-system-back-end.onrender.com/api/prescription?patient_id=${id}`, token),
        fetchRecords(`https://clinic-system-back-end.onrender.com/api/bill?patient_id=${id}`, token),
      ]);

      setAppointments(appointmentList);
      setConsultations(consultationList);
      setPrescriptions(prescriptionList);
      setBills(billList);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to load patient data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, [id]);

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", background: "#F4F6FA" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", color: "#8A94A6" }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#185FA5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: "spin 1s linear infinite" }}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
          <span>Loading patient data...</span>
        </div>
      </div>
    );
  }

  if (error || !patient) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", background: "#F4F6FA" }}>
        <div style={{ background: "#fff", padding: "40px", borderRadius: "12px", textAlign: "center", maxWidth: "400px" }}>
          <h2 style={{ color: "#E24B4A", marginBottom: "10px" }}>Error Loading Profile</h2>
          <p style={{ color: "#8A94A6", marginBottom: "20px" }}>{error || "Patient not found."}</p>
          <button
            onClick={() => navigate("/admin/patients")}
            style={{ background: "#185FA5", color: "#fff", border: "none", padding: "10px 20px", borderRadius: "8px", cursor: "pointer" }}
          >
            Back to Patients
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#F4F6FA", padding: "28px" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "28px" }}>
          <div>
            <h1 style={{ fontSize: "28px", fontWeight: 700, color: "#1A2236", margin: 0 }}>Patient Profile</h1>
            <p style={{ fontSize: "14px", color: "#8A94A6", marginTop: "8px" }}>Full patient record and history</p>
          </div>
          <button
            onClick={() => navigate("/admin/patients")}
            style={{ background: "#fff", border: "1px solid #D8DDE8", color: "#185FA5", padding: "10px 18px", borderRadius: "8px", cursor: "pointer", fontWeight: 600 }}
          >
            ← Back
          </button>
        </div>

        {/* Patient Card */}
        <div style={{ background: "#fff", borderRadius: "14px", overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.08)", marginBottom: "20px" }}>
          <div style={{ background: "#185FA5", color: "#fff", padding: "24px", display: "flex", alignItems: "center", gap: "20px" }}>
            <div style={{ width: "70px", height: "70px", borderRadius: "50%", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "28px", fontWeight: 700 }}>
              {patient.user?.name?.split(" ").slice(0, 2).map(n => n[0]).join("").toUpperCase() || "?"}
            </div>
            <div style={{ flex: 1 }}>
              <h2 style={{ margin: "0 0 6px", fontSize: "24px", fontWeight: 700 }}>{patient.user?.name || "Unknown"}</h2>
              <p style={{ margin: 0, opacity: 0.9 }}>ID: #{patient.id} | {patient.patient_code}</p>
            </div>
            <div style={{ textAlign: "right", fontSize: "13px" }}>
              <p style={{ margin: "0 0 4px", opacity: 0.85 }}>Gender: <strong>{(patient.gender || "—").toUpperCase()}</strong></p>
              <p style={{ margin: "0 0 4px", opacity: 0.85 }}>Blood: <strong>{patient.blood_group || "—"}</strong></p>
              <p style={{ margin: 0, opacity: 0.85 }}>Email: <strong>{patient.user?.email || "—"}</strong></p>
            </div>
          </div>

          <div style={{ padding: "20px 24px", background: "#F8FAFF", borderBottom: "1px solid #E2E6EF", display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "20px" }}>
            <div>
              <p style={{ margin: 0, fontSize: "12px", color: "#8A94A6", fontWeight: 600 }}>Phone</p>
              <p style={{ margin: "4px 0 0", fontSize: "14px", color: "#1A2236" }}>{patient.user?.phone_number || "—"}</p>
            </div>
            <div>
              <p style={{ margin: 0, fontSize: "12px", color: "#8A94A6", fontWeight: 600 }}>DOB</p>
              <p style={{ margin: "4px 0 0", fontSize: "14px", color: "#1A2236" }}>{fmtDate(patient.date_of_birth)}</p>
            </div>
            <div>
              <p style={{ margin: 0, fontSize: "12px", color: "#8A94A6", fontWeight: 600 }}>Address</p>
              <p style={{ margin: "4px 0 0", fontSize: "14px", color: "#1A2236", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{patient.address || "—"}</p>
            </div>
            <div>
              <p style={{ margin: 0, fontSize: "12px", color: "#8A94A6", fontWeight: 600 }}>Total Appointments</p>
              <p style={{ margin: "4px 0 0", fontSize: "14px", color: "#1A2236", fontWeight: 600 }}>{appointments.length}</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "20px", borderBottom: "2px solid #E2E6EF", background: "#fff", padding: "12px 20px", borderRadius: "10px 10px 0 0" }}>
          {[
            { key: "profile", label: "Profile", icon: "👤" },
            { key: "appointments", label: "Appointments", icon: "📅", count: appointments.length },
            { key: "consultations", label: "Consultations", icon: "🏥", count: consultations.length },
            { key: "prescriptions", label: "Prescriptions", icon: "💊", count: prescriptions.length },
            { key: "bills", label: "Bills", icon: "💰", count: bills.length },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                padding: "10px 16px",
                border: "none",
                background: activeTab === tab.key ? "#185FA5" : "transparent",
                color: activeTab === tab.key ? "#fff" : "#8A94A6",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: activeTab === tab.key ? 600 : 500,
                fontSize: "13px",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                transition: "all 0.2s",
              }}
            >
              {tab.icon} {tab.label}
              {tab.count !== undefined && <span style={{ marginLeft: "4px", opacity: 0.8 }}>({tab.count})</span>}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div style={{ background: "#fff", borderRadius: "0 0 14px 14px", padding: "24px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
          {/* Profile Tab */}
          {activeTab === "profile" && (
            <div>
              <h3 style={{ margin: "0 0 20px", fontSize: "16px", fontWeight: 600, color: "#1A2236" }}>Basic Information</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#8A94A6", marginBottom: "6px", textTransform: "uppercase" }}>Full Name</label>
                  <p style={{ margin: 0, fontSize: "14px", color: "#1A2236" }}>{patient.user?.name || "—"}</p>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#8A94A6", marginBottom: "6px", textTransform: "uppercase" }}>Email</label>
                  <p style={{ margin: 0, fontSize: "14px", color: "#1A2236" }}>{patient.user?.email || "—"}</p>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#8A94A6", marginBottom: "6px", textTransform: "uppercase" }}>Phone</label>
                  <p style={{ margin: 0, fontSize: "14px", color: "#1A2236" }}>{patient.user?.phone_number || "—"}</p>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#8A94A6", marginBottom: "6px", textTransform: "uppercase" }}>Gender</label>
                  <p style={{ margin: 0, fontSize: "14px", color: "#1A2236", textTransform: "capitalize" }}>{patient.gender || "—"}</p>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#8A94A6", marginBottom: "6px", textTransform: "uppercase" }}>Date of Birth</label>
                  <p style={{ margin: 0, fontSize: "14px", color: "#1A2236" }}>{fmtDate(patient.date_of_birth)}</p>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#8A94A6", marginBottom: "6px", textTransform: "uppercase" }}>Blood Group</label>
                  <p style={{ margin: 0, fontSize: "14px", color: "#1A2236" }}>{patient.blood_group || "—"}</p>
                </div>
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#8A94A6", marginBottom: "6px", textTransform: "uppercase" }}>Address</label>
                  <p style={{ margin: 0, fontSize: "14px", color: "#1A2236" }}>{patient.address || "—"}</p>
                </div>
              </div>
            </div>
          )}

          {/* Appointments Tab */}
          {activeTab === "appointments" && (
            <div>
              <h3 style={{ margin: "0 0 20px", fontSize: "16px", fontWeight: 600, color: "#1A2236" }}>Appointments ({appointments.length})</h3>
              {appointments.length === 0 ? (
                <p style={{ textAlign: "center", color: "#8A94A6", padding: "40px 20px" }}>No appointments found</p>
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                    <thead>
                      <tr style={{ background: "#F8F9FC", borderBottom: "1px solid #E2E6EF" }}>
                        <th style={{ padding: "12px", textAlign: "left", fontWeight: 600, color: "#8A94A6" }}>Date</th>
                        <th style={{ padding: "12px", textAlign: "left", fontWeight: 600, color: "#8A94A6" }}>Time</th>
                        <th style={{ padding: "12px", textAlign: "left", fontWeight: 600, color: "#8A94A6" }}>Doctor</th>
                        <th style={{ padding: "12px", textAlign: "left", fontWeight: 600, color: "#8A94A6" }}>Status</th>
                        <th style={{ padding: "12px", textAlign: "left", fontWeight: 600, color: "#8A94A6" }}>Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {appointments.map((apt, idx) => (
                        <tr key={idx} style={{ borderBottom: "1px solid #E2E6EF" }}>
                          <td style={{ padding: "12px", color: "#1A2236" }}>{fmtDate(apt.appointment_date)}</td>
                          <td style={{ padding: "12px", color: "#1A2236" }}>{fmtTime(apt.appointment_time)}</td>
                          <td style={{ padding: "12px", color: "#1A2236" }}>{apt.doctor?.user?.name || apt.doctor_id || "—"}</td>
                          <td style={{ padding: "12px" }}>
                            <span style={{ ...statusStyle[apt.status?.toLowerCase() || "pending"], padding: "3px 10px", borderRadius: "12px", fontSize: "11px", fontWeight: 600 }}>{apt.status || "Pending"}</span>
                          </td>
                          <td style={{ padding: "12px", color: "#8A94A6", maxWidth: "150px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{apt.note || "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Consultations Tab */}
          {activeTab === "consultations" && (
            <div>
              <h3 style={{ margin: "0 0 20px", fontSize: "16px", fontWeight: 600, color: "#1A2236" }}>Consultations ({consultations.length})</h3>
              {consultations.length === 0 ? (
                <p style={{ textAlign: "center", color: "#8A94A6", padding: "40px 20px" }}>No consultations found</p>
              ) : (
                <div style={{ display: "grid", gap: "16px" }}>
                  {consultations.map((consult, idx) => (
                    <div key={idx} style={{ border: "1px solid #E2E6EF", borderRadius: "10px", padding: "16px", background: "#F8FAFF" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
                        <div>
                          <p style={{ margin: 0, fontSize: "14px", fontWeight: 600, color: "#1A2236" }}>Dr. {consult.doctor?.user?.name || "Unknown"}</p>
                          <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#8A94A6" }}>{fmtDate(consult.consultation_date)}</p>
                        </div>
                        <span style={{ ...statusStyle[consult.status?.toLowerCase() || "pending"], padding: "4px 12px", borderRadius: "12px", fontSize: "11px", fontWeight: 600 }}>{consult.status || "Pending"}</span>
                      </div>
                      <p style={{ margin: 0, fontSize: "13px", color: "#3D4A5C", lineHeight: "1.5" }}>{consult.note || "No notes"}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Prescriptions Tab */}
          {activeTab === "prescriptions" && (
            <div>
              <h3 style={{ margin: "0 0 20px", fontSize: "16px", fontWeight: 600, color: "#1A2236" }}>Prescriptions ({prescriptions.length})</h3>
              {prescriptions.length === 0 ? (
                <p style={{ textAlign: "center", color: "#8A94A6", padding: "40px 20px" }}>No prescriptions found</p>
              ) : (
                <div style={{ display: "grid", gap: "16px" }}>
                  {prescriptions.map((rx, idx) => (
                    <div key={idx} style={{ border: "1px solid #E2E6EF", borderRadius: "10px", padding: "16px", background: "#F8FAFF" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px", alignItems: "start" }}>
                        <div>
                          <p style={{ margin: 0, fontSize: "14px", fontWeight: 600, color: "#1A2236" }}>{rx.medication_name || "Medication"}</p>
                          <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#8A94A6" }}>By Dr. {rx.doctor?.user?.name || "Unknown"} • {fmtDate(rx.prescribed_date)}</p>
                        </div>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", fontSize: "13px" }}>
                        <div>
                          <p style={{ margin: 0, fontSize: "12px", color: "#8A94A6", fontWeight: 600 }}>Dosage</p>
                          <p style={{ margin: "4px 0 0", color: "#1A2236" }}>{rx.dosage || "—"}</p>
                        </div>
                        <div>
                          <p style={{ margin: 0, fontSize: "12px", color: "#8A94A6", fontWeight: 600 }}>Duration</p>
                          <p style={{ margin: "4px 0 0", color: "#1A2236" }}>{rx.duration_time || "—"}</p>
                        </div>
                      </div>
                      {rx.instructions && (
                        <div style={{ marginTop: "12px", paddingTop: "12px", borderTop: "1px solid #E2E6EF", fontSize: "13px" }}>
                          <p style={{ margin: 0, color: "#8A94A6", fontWeight: 600 }}>Instructions:</p>
                          <p style={{ margin: "4px 0 0", color: "#3D4A5C" }}>{rx.instructions}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Bills Tab */}
          {activeTab === "bills" && (
            <div>
              <h3 style={{ margin: "0 0 20px", fontSize: "16px", fontWeight: 600, color: "#1A2236" }}>Bills ({bills.length})</h3>
              {bills.length === 0 ? (
                <p style={{ textAlign: "center", color: "#8A94A6", padding: "40px 20px" }}>No bills found</p>
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                    <thead>
                      <tr style={{ background: "#F8F9FC", borderBottom: "1px solid #E2E6EF" }}>
                        <th style={{ padding: "12px", textAlign: "left", fontWeight: 600, color: "#8A94A6" }}>Bill ID</th>
                        <th style={{ padding: "12px", textAlign: "left", fontWeight: 600, color: "#8A94A6" }}>Date</th>
                        <th style={{ padding: "12px", textAlign: "left", fontWeight: 600, color: "#8A94A6" }}>Amount</th>
                        <th style={{ padding: "12px", textAlign: "left", fontWeight: 600, color: "#8A94A6" }}>Status</th>
                        <th style={{ padding: "12px", textAlign: "left", fontWeight: 600, color: "#8A94A6" }}>Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bills.map((bill, idx) => (
                        <tr key={idx} style={{ borderBottom: "1px solid #E2E6EF" }}>
                          <td style={{ padding: "12px", color: "#1A2236", fontWeight: 600 }}>#{bill.id}</td>
                          <td style={{ padding: "12px", color: "#1A2236" }}>{fmtDate(bill.created_at)}</td>
                          <td style={{ padding: "12px", color: "#1A2236", fontWeight: 600 }}>RS {fmt(bill.total_amount)}</td>
                          <td style={{ padding: "12px" }}>
                            <span style={{ ...statusStyle[bill.payment_status?.toLowerCase() || "unpaid"], padding: "3px 10px", borderRadius: "12px", fontSize: "11px", fontWeight: 600 }}>{bill.payment_status || "Unpaid"}</span>
                          </td>
                          <td style={{ padding: "12px", color: "#8A94A6", maxWidth: "150px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{bill.description || "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}