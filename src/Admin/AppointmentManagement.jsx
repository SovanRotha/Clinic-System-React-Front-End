import AdminSidebar from "./AdminSidebar";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";

function AppointmentManagement() {

    const { id } = useParams();
    const navigate = useNavigate();
    const [appointments, setAppointments] = useState([]);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchAppointments = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) {
                    setError("Authentication token not found.");
                    return;
                }
                const response = await fetch("http://127.0.0.1:8000/api/appointment", {
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`,
                    },
                });
                const data = await response.json();
                setAppointments(Array.isArray(data.data) ? data.data : []);
            } catch (err) {
                console.error("Error fetching appointments:", err);
                setError("Unable to load appointments.");
            }
        };

        fetchAppointments();
    }, []);

    const handleDelete = async (appointmentId) => {
        if (!window.confirm("Are you sure you want to delete this appointment?")) {
            return;
        }
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                setError("Authentication token not found.");
                return;
            }
            const response = await fetch(`http://127.0.0.1:8000/api/appointment/${appointmentId}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
            });
            if (response.ok) {
                setAppointments(appointments.filter((a) => a.id !== appointmentId));
            } else {
                setError("Failed to delete appointment.");
            }
        } catch (err) {
            console.error("Error deleting appointment:", err);
            setError("An error occurred while deleting the appointment.");
        }
    };

    return (
  <div className="flex min-h-screen bg-[#F4F7FC]">
    <AdminSidebar />

    <div className="flex-1 p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Appointment Management
          </h1>
          <p className="text-gray-500 mt-1">
            Manage and monitor all patient appointments
          </p>
        </div>

        <button 
        onClick={() => navigate("/Admin/addappointment")}
        className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-medium shadow-md transition">
          + New Appointment
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <p className="text-gray-500 text-sm">Total Appointments</p>
          <h2 className="text-3xl font-bold text-blue-600 mt-2">
            {appointments.length}
          </h2>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <p className="text-gray-500 text-sm">Pending</p>
          <h2 className="text-3xl font-bold text-yellow-500 mt-2">
            {
              appointments.filter(
                (a) => a.status?.toLowerCase() === "pending"
              ).length
            }
          </h2>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <p className="text-gray-500 text-sm">Confirmed</p>
          <h2 className="text-3xl font-bold text-green-600 mt-2">
            {
              appointments.filter(
                (a) => a.status?.toLowerCase() === "confirmed"
              ).length
            }
          </h2>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <p className="text-gray-500 text-sm">Cancelled</p>
          <h2 className="text-3xl font-bold text-red-500 mt-2">
            {
              appointments.filter(
                (a) => a.status?.toLowerCase() === "cancelled"
              ).length
            }
          </h2>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white p-5 rounded-2xl shadow-sm mb-6">
        <input
          type="text"
          placeholder="Search appointments..."
          className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl mb-6">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b">
          <h2 className="font-semibold text-lg text-gray-800">
            Appointment List
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">
                  ID
                </th>

                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">
                  Patient
                </th>

                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">
                  Doctor
                </th>

                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">
                  Date
                </th>

                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">
                  Status
                </th>

                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {appointments.length > 0 ? (
                appointments.map((appointment) => (
                  <tr
                    key={appointment.id}
                    className="border-b hover:bg-blue-50 transition"
                  >
                    <td className="py-4 px-6 font-medium">
                      #{appointment.id}
                    </td>

                    <td className="py-4 px-6">
                      {appointment.patient?.patient_code || "Unknown"}
                    </td>

                    <td className="py-4 px-6">
                      {appointment.doctor?.doctor_code || "Unknown"}
                    </td>

                    <td className="py-4 px-6">
                      {appointment.appointment_date
                        ? new Date(
                            appointment.appointment_date
                          ).toLocaleDateString()
                        : "—"}
                    </td>

                    <td className="py-4 px-6">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold
                        ${
                          appointment.status?.toLowerCase() ===
                          "confirmed"
                            ? "bg-green-100 text-green-700"
                            : appointment.status?.toLowerCase() ===
                              "pending"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {appointment.status}
                      </span>
                    </td>

                    <td className="py-4 px-6">
                      <div className="flex gap-2">
                        <button className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg text-sm">
                          View
                        </button>

                        <button 
                        onClick={() => navigate(`/Admin/editappointment/${appointment.id}`)}
                        className="bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-lg text-sm">
                          Edit
                        </button>

                        <button 
                        onClick={() => {handleDelete(appointment.id)}}
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg text-sm">
                            Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="6"
                    className="text-center py-10 text-gray-500"
                  >
                    No appointments found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
);
}
export default AppointmentManagement;