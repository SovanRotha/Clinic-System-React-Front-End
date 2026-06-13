import AdminSidebar from "../Admin/AdminSidebar";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function AddBill() {
    const navigate = useNavigate();

    const [patients, setPatients] = useState([]);
    const [appointments, setAppointments] = useState([]);

    const [formData, setFormData] = useState({
        patient_id: "",
        appointment_id: "",
        consultation_fee: "",
        medicine_fee: "",
        payment_status: "unpaid",
    });

    // Fetch patients + appointments
    useEffect(() => {
        const token = localStorage.getItem("token");

        const fetchData = async () => {
            try {
                const [pRes, aRes] = await Promise.all([
                    fetch("http://127.0.0.1:8000/api/patients", {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            Accept: "application/json",
                        },
                    }),
                    fetch("http://127.0.0.1:8000/api/appointment", {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            Accept: "application/json",
                        },
                    }),
                ]);

                const pData = await pRes.json();
                const aData = await aRes.json();

                setPatients(pData.data || []);
                setAppointments(aData.data || []);
            } catch (error) {
                console.error("Error loading data:", error);
            }
        };

        fetchData();
    }, []);

    // Handle input change
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    // Submit bill
    const handleSubmit = async (e) => {
        e.preventDefault();

        const token = localStorage.getItem("token");

        const payload = {
            ...formData,
            consultation_fee: parseFloat(formData.consultation_fee),
            medicine_fee: parseFloat(formData.medicine_fee),
        };

        try {
            const res = await fetch("http://127.0.0.1:8000/api/bill", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                alert("Bill created successfully!");
                navigate("/admin/bill");
            } else {
                alert("Failed to create bill");
            }
        } catch (error) {
            console.error("Error:", error);
        }
    };

    return (
        <div className="flex min-h-screen bg-gray-100">
            <AdminSidebar />

            <div className="flex-1 p-6">
                <h1 className="text-3xl font-bold mb-6">Add New Bill</h1>

                <form
                    onSubmit={handleSubmit}
                    className="bg-white p-6 rounded shadow-md space-y-4"
                >
                    {/* Patient */}
                    <div>
                        <label className="block mb-1">Patient</label>
                        <select
                            name="patient_id"
                            value={formData.patient_id}
                            onChange={handleChange}
                            className="w-full border p-2 rounded"
                            required
                        >
                            <option value="">Select Patient</option>
                            {patients.map((p) => (
                                <option key={p.id} value={p.id}>
                                    PAT-{p.id} - {p.user?.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Appointment */}
                    <div>
                        <label className="block mb-1">Appointment</label>
                        <select
                            name="appointment_id"
                            value={formData.appointment_id}
                            onChange={handleChange}
                            className="w-full border p-2 rounded"
                            required
                        >
                            <option value="">Select Appointment</option>
                            {appointments.map((a) => (
                                <option key={a.id} value={a.id}>
                                    {a.appointment_date} - {a.reason}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Consultation Fee */}
                    <div>
                        <label className="block mb-1">Consultation Fee</label>
                        <input
                            type="number"
                            name="consultation_fee"
                            value={formData.consultation_fee}
                            onChange={handleChange}
                            className="w-full border p-2 rounded"
                            required
                        />
                    </div>

                    {/* Medicine Fee */}
                    <div>
                        <label className="block mb-1">Medicine Fee</label>
                        <input
                            type="number"
                            name="medicine_fee"
                            value={formData.medicine_fee}
                            onChange={handleChange}
                            className="w-full border p-2 rounded"
                            required
                        />
                    </div>

                    {/* Payment Status */}
                    <div>
                        <label className="block mb-1">Payment Status</label>
                        <select
                            name="payment_status"
                            value={formData.payment_status}
                            onChange={handleChange}
                            className="w-full border p-2 rounded"
                        >
                            <option value="unpaid">unpaid</option>
                            <option value="paid">paid</option>
                        </select>
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                        Create Bill
                    </button>
                </form>
            </div>
        </div>
    );
}

export default AddBill;