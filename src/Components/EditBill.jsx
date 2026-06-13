import AdminSidebar from "../Admin/AdminSidebar";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

function EditBill() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [bill, setBill] = useState(
        {
            patient_id: "",
            appointment_id: "",
            consultation_fee: "",
            medicine_fee: "",
            total_amount: "",
            payment_status: "unpaid",
        }
    );

    const fetchBill = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`http://127.0.0.1:8000/api/bill/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json",
                },
            });
            const data = await response.json();
            setBill({
                patient_id: data.data.patient_id || "",
                appointment_id: data.data.appointment_id || "",
                consultation_fee: data.data.consultation_fee || "",
                medicine_fee: data.data.medicine_fee || "",
                total_amount: data.data.total_amount || "",
                payment_status: (data.data.payment_status || "unpaid").toLowerCase(),
            });
        } catch (error) {
            console.error("Error fetching bill:", error);
            alert("Failed to load bill");
        }
    };

    useEffect(() => {
        fetchBill();
    }, [id]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setBill((prevBill) => ({
            ...prevBill,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`http://127.0.0.1:8000/api/bill/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(bill),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to update bill");
            }
            alert("Bill updated successfully");
            navigate("/admin/bill");
        } catch (error) {
            console.error("Error updating bill:", error);
            alert(error.message);
        }
    };

    return (
        <div className="flex min-h-screen bg-[#F4F7FC]">
            <AdminSidebar />
            <div className="flex-1 p-6">
                <h2 className="text-2xl font-bold mb-6">Edit Bill</h2>
                <form className="space-y-4" onSubmit={handleSubmit}>
                    <div>
                        <label className="block text-sm font-medium mb-1">Patient ID</label>
                        <input
                            type="text"
                            name="patient_id"
                            value={bill.patient_id}
                            onChange={handleInputChange}
                            className="w-full border border-gray-300 rounded px-3 py-2"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Appointment ID</label>
                        <input
                            type="text"
                            name="appointment_id"
                            value={bill.appointment_id}
                            onChange={handleInputChange}
                            className="w-full border border-gray-300 rounded px-3 py-2"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Consultation Fee</label>
                        <input
                            type="number"
                            name="consultation_fee"
                            value={bill.consultation_fee}
                            onChange={handleInputChange}
                            className="w-full border border-gray-300 rounded px-3 py-2"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Medication Fee</label>
                        <input
                            type="number"
                            name="medicine_fee"
                            value={bill.medicine_fee}
                            onChange={handleInputChange}
                            className="w-full border border-gray-300 rounded px-3 py-2"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Total Amount</label>
                        <input
                            type="number"
                            name="total_amount"
                            value={bill.total_amount}
                            onChange={handleInputChange}
                            className="w-full border border-gray-300 rounded px-3 py-2"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Payment Status</label>
                        <select
                            name="payment_status"
                            value={bill.payment_status}
                            onChange={handleInputChange}
                            className="w-full border border-gray-300 rounded px-3 py-2"
                        >
                            <option value="unpaid">unpaid</option>
                            <option value="paid">paid</option>
                        </select>
                    </div>
                    <div className="flex gap-4">
                        <button
                            type="submit"
                            className="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                            Save Changes
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate("/admin/bill")}
                            className="px-6 py-3 bg-gray-200 rounded hover:bg-gray-300"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>

        </div>
        
    );
}

export default EditBill;