import AdminSidebar from "../Admin/AdminSidebar";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function AddAppointment() {

    const navigate = useNavigate();
    const [patients, setPatients] = useState([]);
    const [doctors, setDoctors] = useState([]);
  const [addAppointment, setAddAppointment] = useState({
    patient_id: "",
    doctor_id: "",
    appointment_date: "",
    appointment_time: "",
    reason: "",
    status: "pending",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.error("Authentication token not found.");
          return;
        }

        // Fetch doctors
        const respDoctors = await fetch("http://127.0.0.1:8000/api/doctor", {
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        });
        const dataDoctors = await respDoctors.json().catch(() => ({}));
        setDoctors(Array.isArray(dataDoctors.doctors) ? dataDoctors.doctors : Array.isArray(dataDoctors) ? dataDoctors : []);

        // Fetch patients
        const respPatients = await fetch("http://127.0.0.1:8000/api/patients", {
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        });
        const dataPatients = await respPatients.json().catch(() => ({}));
        setPatients(Array.isArray(dataPatients.data) ? dataPatients.data : Array.isArray(dataPatients) ? dataPatients : []);
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };

    fetchData();
  }, []);

  const handleChange = (e) => {
    setAddAppointment({
      ...addAppointment,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="flex min-h-screen bg-[#F4F7FC]">
      <AdminSidebar />

      <div className="flex-1 p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Add Appointment</h1>
          <p className="text-gray-500 mt-2">
            Schedule a new patient appointment
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Card Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-500 p-6">
            <h2 className="text-white text-xl font-semibold">
              Appointment Information
            </h2>
            <p className="text-blue-100 mt-1">Fill in the details below</p>
          </div>

          {/* Form */}
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Patient */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Patient ID
                </label>
                <select
                  name="patient_id"
                  value={addAppointment.patient_id}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3"
                >
                  <option value="">Select Patient</option>
                  {patients.map((patient) => (
                    <option key={patient.id} value={patient.id}>
                      {patient.patient_code || patient.user?.name || `#${patient.id}`}
                    </option>
                  ))}
                </select>
              </div>

              {/* Doctor */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Doctor ID
                </label>
                <select
                  name="doctor_id"
                  value={addAppointment.doctor_id}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3"
                >
                  <option value="">Select Doctor</option>
                  {doctors.map((doctor) => (
                    <option key={doctor.id} value={doctor.id}>
                      {doctor.doctor_code || doctor.user?.name || `#${doctor.id}`}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Appointment Date
                </label>
                <input
                  type="date"
                  name="appointment_date"
                  value={addAppointment.appointment_date}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {/* Time */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Appointment Time
                </label>
                <input
                  type="time"
                  name="appointment_time"
                  value={addAppointment.appointment_time}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>

                <select
                  name="status"
                  value={addAppointment.status}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="pending">pending</option>
                  <option value="confirmed">confirmed</option>
                  <option value="completed">completed</option>
                  <option value="cancelled">cancelled</option>
                </select>
              </div>

              {/* Reason */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason
                </label>

                <textarea
                  name="reason"
                  value={addAppointment.reason}
                  onChange={handleChange}
                  rows="4"
                  placeholder="Enter appointment reason..."
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3 mt-8">
              <button
                type="button"
                className="px-6 py-3 rounded-xl bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={async () => {
                  // simple client-side validation
                  if (!addAppointment.patient_id || !addAppointment.doctor_id || !addAppointment.appointment_date) {
                    alert("Please select patient, doctor and date.");
                    return;
                  }
                  try {
                    const token = localStorage.getItem("token");
                    if (!token) { alert("Missing token"); return; }
                    const payload = {
                      ...addAppointment,
                      patient_id: Number(addAppointment.patient_id),
                      doctor_id: Number(addAppointment.doctor_id),
                    };
                    const res = await fetch("http://127.0.0.1:8000/api/appointment", {
                      method: "POST",
                      headers: { "Content-Type": "application/json", Accept: "application/json", Authorization: `Bearer ${token}` },
                      body: JSON.stringify(payload),
                    });
                    if (!res.ok) {
                      const text = await res.text().catch(() => null);
                      console.error("Appointment POST failed:", res.status, text);
                      const err = (() => {
                        try { return JSON.parse(text); } catch { return null; }
                      })();
                      alert(err?.message || text || "Failed to save appointment");
                    } else {
                      const created = await res.json().catch(() => null);
                      console.log("Appointment created:", created);
                      alert("Appointment created");
                      navigate("/Admin/appointments");
                      // reset form
                      setAddAppointment({ patient_id: "", doctor_id: "", appointment_date: "", appointment_time: "", reason: "", status: "Pending" });
                    }
                  } catch (err) {
                    console.error(err);
                    alert("Network error");
                  }
                }}
                className="px-6 py-3 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition shadow-md"
              >
                Save Appointment
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default AddAppointment;
