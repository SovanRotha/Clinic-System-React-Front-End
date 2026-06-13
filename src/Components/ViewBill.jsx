import AdminSidebar from "../Admin/AdminSidebar";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

function ViewBill() {
    const { id } = useParams();
    const [bill, setBill] = useState(null);

    useEffect(() => {
        const fetchBill = async () => {
            try {
                const token = localStorage.getItem("token");

                const res = await fetch(
                    `http://127.0.0.1:8000/api/bill/${id}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            Accept: "application/json",
                        },
                    }
                );

                const data = await res.json();
                setBill(data.data);
            } catch (error) {
                console.error("Error fetching bill:", error);
            }
        };

        fetchBill();
    }, [id]);

    if (!bill) {
        return (
            <div className="flex">
                <AdminSidebar />
                <div className="p-6">Loading bill details...</div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-gray-100">
            <AdminSidebar />

            <div className="flex-1 p-6">
                <h1 className="text-3xl font-bold mb-6">Bill Details</h1>

                <div className="bg-white shadow rounded-lg p-6 space-y-4">

                    {/* Bill Info */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-gray-500">Bill ID</p>
                            <p className="font-semibold">{bill.id}</p>
                        </div>

                        <div>
                            <p className="text-gray-500">Status</p>
                            <span
                                className={`px-3 py-1 rounded text-white text-sm ${
                                    bill.payment_status === "paid"
                                        ? "bg-green-500"
                                        : "bg-red-500"
                                }`}
                            >
                                {bill.payment_status}
                            </span>
                        </div>

                        <div>
                            <p className="text-gray-500">Consultation Fee</p>
                            <p className="font-semibold text-green-600">
                                ${bill.consultation_fee}
                            </p>
                        </div>

                        <div>
                            <p className="text-gray-500">Medicine Fee</p>
                            <p className="font-semibold text-blue-600">
                                ${bill.medicine_fee}
                            </p>
                        </div>

                        <div>
                            <p className="text-gray-500">Total Amount</p>
                            <p className="font-bold text-lg">
                                ${bill.total_amount}
                            </p>
                        </div>

                        <div>
                            <p className="text-gray-500">Created At</p>
                            <p className="font-semibold">
                                {new Date(bill.created_at).toLocaleString()}
                            </p>
                        </div>
                    </div>

                    {/* Patient Info */}
                    <div className="mt-6 border-t pt-4">
                        <h2 className="text-xl font-bold mb-2">
                            Patient Information
                        </h2>

                        <p>
                            <span className="text-gray-500">Patient Code:</span>{" "}
                            {bill.patient
                                ? `PAT-${bill.patient.id}`
                                : "N/A"}
                        </p>

                        <p>
                            <span className="text-gray-500">Gender:</span>{" "}
                            {bill.patient?.gender || "N/A"}
                        </p>

                        <p>
                            <span className="text-gray-500">Blood Group:</span>{" "}
                            {bill.patient?.blood_group || "N/A"}
                        </p>
                    </div>

                    {/* Appointment Info */}
                    <div className="mt-6 border-t pt-4">
                        <h2 className="text-xl font-bold mb-2">
                            Appointment Information
                        </h2>

                        <p>
                            <span className="text-gray-500">Date:</span>{" "}
                            {bill.appointment?.appointment_date || "N/A"}
                        </p>

                        <p>
                            <span className="text-gray-500">Time:</span>{" "}
                            {bill.appointment?.appointment_time || "N/A"}
                        </p>

                        <p>
                            <span className="text-gray-500">Reason:</span>{" "}
                            {bill.appointment?.reason || "N/A"}
                        </p>

                        <p>
                            <span className="text-gray-500">Status:</span>{" "}
                            {bill.appointment?.status || "N/A"}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ViewBill;