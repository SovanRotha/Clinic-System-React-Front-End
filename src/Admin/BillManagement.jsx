import AdminSidebar from "./AdminSidebar";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function BillManagement() {
    const [bills, setBills] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchBills = async () => {
            try {
                const token = localStorage.getItem("token");

                const res = await fetch("http://127.0.0.1:8000/api/bill", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: "application/json",
                    },
                });

                const data = await res.json();
                setBills(data.data || []);
            } catch (error) {
                console.error("Error fetching bills:", error);
            }
        };

        fetchBills();
    }, []);

    const handleView = (bill) => {
        console.log("View bill:", bill);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this bill?")) {
            return;
        }

        const token = localStorage.getItem("token");
        if (!token) {
            alert("Authentication token missing.");
            return;
        }

        try {
            const res = await fetch(`http://127.0.0.1:8000/api/bill/${id}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json",
                },
            });

            if (!res.ok) {
                throw new Error("Failed to delete bill");
            }

            setBills((prev) => prev.filter((bill) => bill.id !== id));
        } catch (error) {
            console.error("Error deleting bill:", error);
            alert("Failed to delete bill");
        }
    };

    return (
        <div className="flex min-h-screen bg-[#F4F7FC]">
            <AdminSidebar />

            <div className="flex-1 p-6">
                <h1 className="text-3xl font-bold mb-2">Bill Management</h1>
                <p className="text-gray-600 mb-6">
                    Here you can manage all bills, view details, and track payments.
                </p>
                <button onClick={() => navigate("/admin/addbill")} className="mb-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
                    Add New Bill
                </button>

                <div className="overflow-x-auto bg-white shadow rounded-lg">
                    <table className="w-full border-collapse">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="p-3 text-left">ID</th>
                                <th className="p-3 text-left">Patient</th>
                                <th className="p-3 text-left">Appointment Date</th>
                                <th className="p-3 text-left">Consultation Fee</th>
                                <th className="p-3 text-left">Medicine Fee</th>
                                <th className="p-3 text-left">Total</th>
                                <th className="p-3 text-left">Status</th>
                                <th className="p-3 text-left">Action</th>
                                <th className="p-3 text-left">Created</th>
                            </tr>
                        </thead>

                        <tbody>
                            {bills.length > 0 ? (
                                bills.map((bill) => (
                                    <tr
                                        key={bill.id}
                                        className="border-t hover:bg-gray-50"
                                    >
                                        <td className="p-3">{bill.id}</td>

                                        <td className="p-3">
                                            {bill.patient
                                                ? `PAT-${bill.patient.id}`
                                                : "N/A"}
                                        </td>

                                        <td className="p-3">
                                            {bill.appointment?.appointment_date || "N/A"}
                                        </td>

                                        <td className="p-3 text-green-600">
                                            ${bill.consultation_fee}
                                        </td>

                                        <td className="p-3 text-blue-600">
                                            ${bill.medicine_fee}
                                        </td>

                                        <td className="p-3 font-semibold">
                                            ${bill.total_amount}
                                        </td>

                                        <td className="p-3">
                                            <span
                                                className={`px-2 py-1 rounded text-white text-sm ${
                                                    bill.payment_status?.toLowerCase() === "paid"
                                                        ? "bg-green-500"
                                                        : bill.payment_status?.toLowerCase() === "unpaid"
                                                        ? "bg-yellow-500"
                                                        : "bg-gray-500"
                                                }`}
                                            >
                                                {bill.payment_status || "Unknown"}
                                            </span>
                                        </td>

                                        {/* ACTION BUTTONS */}
                                        <td className="p-3">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => navigate(`/admin/viewbill/${bill.id}`)}
                                                    className="px-2 py-1 bg-blue-500 text-white rounded text-sm"
                                                >
                                                    View
                                                </button>

                                                <button
                                                    onClick={() => navigate(`/admin/editbill/${bill.id}`)}
                                                    className="px-2 py-1 bg-yellow-500 text-white rounded text-sm"
                                                >
                                                    Edit
                                                </button>

                                                <button
                                                    onClick={() => handleDelete(bill.id)}
                                                    className="px-2 py-1 bg-red-500 text-white rounded text-sm"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>

                                        <td className="p-3 text-gray-500">
                                            {new Date(
                                                bill.created_at
                                            ).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan="9"
                                        className="text-center p-6"
                                    >
                                        No bills found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default BillManagement;