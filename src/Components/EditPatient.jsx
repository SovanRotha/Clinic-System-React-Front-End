import AdminSidebar from "../Admin/AdminSidebar";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

function EditPatient() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [patient, setPatient] = useState({
    user_id: "",
    patient_code: "",
    gender: "",
    date_of_birth: "",
    address: "",
    blood_group: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchPatient();
  }, [id]);

  const fetchPatient = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`http://127.0.0.1:8000/api/patients/${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch patient");
      }

      const result = await response.json();

      const patientData = result.data || result;

      setPatient({
        user_id: patientData.user_id || "",
        patient_code: patientData.patient_code || "",
        gender: patientData.gender || "",
        date_of_birth: patientData.date_of_birth || "",
        address: patientData.address || "",
        blood_group: patientData.blood_group || "",
      });
    } catch (error) {
      console.error(error);
      alert("Failed to load patient data");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setPatient((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);

      const token = localStorage.getItem("token");

      const response = await fetch(`http://127.0.0.1:8000/api/patients/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(patient),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Update failed");
      }

      alert("Patient updated successfully");

      navigate("/admin/patients");
    } catch (error) {
      console.error(error);
      alert(error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
        }}
      >
        Loading...
      </div>
    );
  }

  return (
    

      <div style={{ display: "flex" }}>
        <AdminSidebar />

        <div
          style={{
            flex: 1,
            minHeight: "100vh",
            background: "#F4F7FC",
            padding: "30px",
          }}
        >
          {/* Header */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "25px",
            }}
          >
            <div>
              <h1
                style={{
                  margin: 0,
                  fontSize: "28px",
                  color: "#1A2236",
                  fontWeight: "700",
                }}
              >
                Edit Patient
              </h1>
              <p
                style={{
                  marginTop: "5px",
                  color: "#8A94A6",
                }}
              >
                Update patient information
              </p>
            </div>

            <button
              onClick={() => navigate("/admin/patients")}
              style={{
                background: "#fff",
                border: "1px solid #D8DDE8",
                padding: "10px 18px",
                borderRadius: "10px",
                cursor: "pointer",
                fontWeight: "600",
              }}
            >
              ← Back
            </button>
          </div>

          {/* Card */}
          <div
            style={{
              background: "#fff",
              borderRadius: "18px",
              overflow: "hidden",
              boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
            }}
          >
            {/* Blue Header */}
            <div
              style={{
                background: "linear-gradient(135deg,#185FA5,#2563EB)",
                color: "#fff",
                padding: "30px",
                display: "flex",
                alignItems: "center",
                gap: "20px",
              }}
            >
              <div
                style={{
                  width: "80px",
                  height: "80px",
                  borderRadius: "50%",
                  background: "rgba(255,255,255,0.2)",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  fontSize: "30px",
                  fontWeight: "700",
                }}
              >
                {patient.patient_code?.charAt(0) || "P"}
              </div>

              <div>
                <h2
                  style={{
                    margin: 0,
                    fontSize: "24px",
                  }}
                >
                  Patient Information
                </h2>

                <p
                  style={{
                    marginTop: "5px",
                    opacity: 0.9,
                  }}
                >
                  Patient Code: {patient.patient_code}
                </p>
              </div>
            </div>

            {/* Form */}
            <form
              onSubmit={handleSubmit}
              style={{
                padding: "30px",
              }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit,minmax(250px,1fr))",
                  gap: "20px",
                }}
              >
                {/* Patient Code */}
                <div>
                  <label className="label">Patient Code</label>
                  <input
                    type="text"
                    name="patient_code"
                    value={patient.patient_code}
                    onChange={handleChange}
                    className="input"
                  />
                </div>

                {/* Gender */}
                <div>
                  <label className="label">Gender</label>

                  <select
                    name="gender"
                    value={patient.gender}
                    onChange={handleChange}
                    className="input"
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>

                {/* DOB */}
                <div>
                  <label className="label">Date of Birth</label>

                  <input
                    type="date"
                    name="date_of_birth"
                    value={patient.date_of_birth}
                    onChange={handleChange}
                    className="input"
                  />
                </div>

                {/* Blood */}
                <div>
                  <label className="label">Blood Group</label>

                  <select
                    name="blood_group"
                    value={patient.blood_group}
                    onChange={handleChange}
                    className="input"
                  >
                    <option value="">Select Blood Group</option>
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

                {/* Address */}
                <div
                  style={{
                    gridColumn: "1 / -1",
                  }}
                >
                  <label className="label">Address</label>

                  <textarea
                    name="address"
                    value={patient.address}
                    onChange={handleChange}
                    rows="5"
                    className="input"
                  />
                </div>
              </div>

              {/* Buttons */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "12px",
                  marginTop: "30px",
                }}
              >
                <button
                  type="button"
                  onClick={() => navigate("/admin/patients")}
                  style={{
                    background: "#F3F4F6",
                    color: "#374151",
                    border: "none",
                    padding: "12px 20px",
                    borderRadius: "10px",
                    cursor: "pointer",
                    fontWeight: "600",
                  }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    background: "linear-gradient(135deg,#185FA5,#2563EB)",
                    color: "#fff",
                    border: "none",
                    padding: "12px 24px",
                    borderRadius: "10px",
                    cursor: "pointer",
                    fontWeight: "600",
                    minWidth: "150px",
                  }}
                >
                  {saving ? "Updating..." : "Update Patient"}
                </button>
              </div>
            </form>
          </div>

          {/* Styles */}
          <style>{`
      .label{
        display:block;
        margin-bottom:8px;
        font-size:13px;
        font-weight:600;
        color:#6B7280;
      }

      .input{
        width:100%;
        padding:12px 14px;
        border:1px solid #D8DDE8;
        border-radius:10px;
        font-size:14px;
        outline:none;
        transition:.2s;
        background:#fff;
      }

      .input:focus{
        border-color:#185FA5;
        box-shadow:0 0 0 3px rgba(24,95,165,.15);
      }

      textarea.input{
        resize:none;
      }
    `}</style>
        </div>
      </div>

  );
}

export default EditPatient;
