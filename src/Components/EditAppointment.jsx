import AdminSidebar from "../Admin/AdminSidebar";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

function EditAppointment() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [editAppointment, setEditAppointment] = useState({
    patient_id: "",
    doctor_id: "",
    appointment_date: "",
    appointment_time: "",
    reason: "",
    status: "pending",
  });

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");

        const appointmentRes = await fetch(
          `http://127.0.0.1:8000/api/appointment/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          }
        );

        const appointmentData = await appointmentRes.json();
        const appointment = appointmentData.data || appointmentData.appointment;

        setEditAppointment({
          patient_id: appointment.patient_id || "",
          doctor_id: appointment.doctor_id || "",
          appointment_date: appointment.appointment_date || "",
           appointment_time: appointment.appointment_time? appointment.appointment_time.slice(0, 5): "",
          reason: appointment.reason || "",
          status: (appointment.status || "pending").toLowerCase(),
        });

        const doctorRes = await fetch("http://127.0.0.1:8000/api/doctor", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const doctorData = await doctorRes.json();
        setDoctors(doctorData.doctors || doctorData.data || []);

        const patientRes = await fetch("http://127.0.0.1:8000/api/patients", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const patientData = await patientRes.json();
        setPatients(patientData.patients || patientData.data || []);
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditAppointment((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Authentication token missing");
      }

      if (!editAppointment.patient_id || !editAppointment.doctor_id || !editAppointment.appointment_date || !editAppointment.appointment_time) {
        throw new Error("Patient, doctor, and appointment details are required");
      }

      const payload = {
        ...editAppointment,
        patient_id: Number(editAppointment.patient_id),
        doctor_id: Number(editAppointment.doctor_id),
      };

      console.debug("Updating appointment payload", payload);

      const response = await fetch(
  `http://127.0.0.1:8000/api/appointment/${id}`,
  {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  }
);

const data = await response.json();

console.log("FULL RESPONSE:", data);

if (!response.ok) {
  alert(JSON.stringify(data, null, 2));
  throw new Error(data.error || data.message);
}

      alert("Appointment updated successfully!");
      navigate("/admin/appointments");
    } catch (error) {
      console.error("Error updating appointment:", error);
      alert(error.message);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F4F7FC]">
      <AdminSidebar />
      <div className="flex-1 p-6">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block mb-2 font-medium">Patient</label>
            <select
              name="patient_id"
              value={editAppointment.patient_id}
              onChange={handleChange}
              className="w-full border rounded-xl px-4 py-3"
            >
              <option value="">Select Patient</option>
              {patients.map((patient) => (
                <option key={patient.id} value={patient.id}>
                  {patient.patient_code} - {patient.user?.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-2 font-medium">Doctor</label>
            <select
              name="doctor_id"
              value={editAppointment.doctor_id}
              onChange={handleChange}
              className="w-full border rounded-xl px-4 py-3"
            >
              <option value="">Select Doctor</option>
              {doctors.map((doctor) => (
                <option key={doctor.id} value={doctor.id}>
                  {doctor.doctor_code} - Dr. {doctor.user?.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-2 font-medium">Appointment Date</label>
            <input
              type="date"
              name="appointment_date"
              value={editAppointment.appointment_date}
              onChange={handleChange}
              className="w-full border rounded-xl px-4 py-3"
            />
          </div>

          <div>
            <label className="block mb-2 font-medium">Appointment Time</label>
            <input
              type="time"
              name="appointment_time"
              value={editAppointment.appointment_time}
              onChange={handleChange}
              className="w-full border rounded-xl px-4 py-3"
            />
          </div>

          <div>
            <label className="block mb-2 font-medium">Status</label>
            <select
              name="status"
              value={editAppointment.status}
              onChange={handleChange}
              className="w-full border rounded-xl px-4 py-3"
            >
              <option value="pending">pending</option>
              <option value="confirmed">confirmed</option>
              <option value="cancelled">cancelled</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block mb-2 font-medium">Reason</label>
            <textarea
              name="reason"
              value={editAppointment.reason}
              onChange={handleChange}
              rows={4}
              className="w-full border rounded-xl px-4 py-3"
            />
          </div>

          <div className="md:col-span-2 flex justify-end gap-3 mt-8">
            <button
              type="button"
              onClick={() => navigate("/admin/appointments")}
              className="px-6 py-3 bg-gray-200 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 text-white rounded-xl"
            >
              Update Appointment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditAppointment;
