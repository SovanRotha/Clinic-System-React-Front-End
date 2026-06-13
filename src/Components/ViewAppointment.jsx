import AdminSidebar from "../Admin/AdminSidebar";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

function ViewAppointment() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAppointment();
  }, [id]);

  const fetchAppointment = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `http://127.0.0.1:8000/api/appointment/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      const data = await response.json();

      setAppointment(data.data || data.appointment);
    } catch (error) {
      console.error(error);
      alert("Failed to load appointment");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "confirmed":
        return "bg-green-100 text-green-700";
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      case "cancelled":
        return "bg-red-100 text-red-700";
      case "completed":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        Loading Appointment...
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#F4F7FC]">
      <AdminSidebar />

      <div className="flex-1 p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Appointment Details
            </h1>
            <p className="text-gray-500 mt-1">
              View appointment information
            </p>
          </div>

          <button
            onClick={() => navigate("/admin/appointments")}
            className="px-5 py-2 bg-white border rounded-xl hover:bg-gray-50"
          >
            Back
          </button>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Top Banner */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-500 p-8 text-white">
            <h2 className="text-2xl font-bold">
              Appointment #{appointment?.id}
            </h2>

            <div className="mt-3">
              <span
                className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(
                  appointment?.status
                )}`}
              >
                {appointment?.status}
              </span>
            </div>
          </div>

          {/* Details */}
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Patient */}
              <div className="bg-gray-50 p-5 rounded-xl">
                <h3 className="text-sm text-gray-500 mb-2">
                  Patient Information
                </h3>

                <p className="font-semibold text-lg">
                  {appointment?.patient?.user?.name || "Unknown"}
                </p>

                <p className="text-gray-600">
                  Code: {appointment?.patient?.patient_code}
                </p>
              </div>

              {/* Doctor */}
              <div className="bg-gray-50 p-5 rounded-xl">
                <h3 className="text-sm text-gray-500 mb-2">
                  Doctor Information
                </h3>

                <p className="font-semibold text-lg">
                  Dr. {appointment?.doctor?.user?.name || "Unknown"}
                </p>

                <p className="text-gray-600">
                  Code: {appointment?.doctor?.doctor_code}
                </p>
              </div>

              {/* Date */}
              <div className="bg-gray-50 p-5 rounded-xl">
                <h3 className="text-sm text-gray-500 mb-2">
                  Appointment Date
                </h3>

                <p className="font-semibold">
                  {appointment?.appointment_date}
                </p>
              </div>

              {/* Time */}
              <div className="bg-gray-50 p-5 rounded-xl">
                <h3 className="text-sm text-gray-500 mb-2">
                  Appointment Time
                </h3>

                <p className="font-semibold">
                  {appointment?.appointment_time}
                </p>
              </div>

              {/* Reason */}
              <div className="md:col-span-2 bg-gray-50 p-5 rounded-xl">
                <h3 className="text-sm text-gray-500 mb-2">
                  Appointment Reason
                </h3>

                <p className="text-gray-700">
                  {appointment?.reason || "No reason provided"}
                </p>
              </div>

              {/* Created */}
              <div className="bg-gray-50 p-5 rounded-xl">
                <h3 className="text-sm text-gray-500 mb-2">Created At</h3>

                <p className="font-semibold">
                  {new Date(appointment?.created_at).toLocaleString()}
                </p>
              </div>

              {/* Updated */}
              <div className="bg-gray-50 p-5 rounded-xl">
                <h3 className="text-sm text-gray-500 mb-2">Last Updated</h3>

                <p className="font-semibold">
                  {new Date(appointment?.updated_at).toLocaleString()}
                </p>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex justify-end gap-3 mt-8">
              <button
                onClick={() =>
                  navigate(`/admin/editappointment/${appointment.id}`)
                }
                className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
              >
                Edit Appointment
              </button>

              <button
                onClick={() => navigate("/admin/appointments")}
                className="px-6 py-3 bg-gray-200 rounded-xl hover:bg-gray-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ViewAppointment;