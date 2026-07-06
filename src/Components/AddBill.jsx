
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
        const fetchData = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) {
                    throw new Error("Missing authentication token.");
                }

                const [pRes, aRes] = await Promise.all([
                    fetch("https://clinic-system-back-end.onrender.com/api/patients", {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            Accept: "application/json",
                        },
                    }),
                    fetch("https://clinic-system-back-end.onrender.com/api/appointment", {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            Accept: "application/json",
                        },
                    }),
                ]);

                if (!pRes.ok || !aRes.ok) {
                    throw new Error("Failed to load related records.");
                }

                const pData = await pRes.json().catch(() => ({}));
                const aData = await aRes.json().catch(() => ({}));

                setPatients(pData.data || []);
                setAppointments(aData.data || []);
            } catch (error) {
                console.error("Error loading data:", error);
                alert(error.message || "Failed to load bill form data.");
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

        try {
            const token = localStorage.getItem("token");
            if (!token) {
                throw new Error("Missing authentication token.");
            }

            const payload = {
                ...formData,
                consultation_fee: parseFloat(formData.consultation_fee),
                medicine_fee: parseFloat(formData.medicine_fee),
            };

            const res = await fetch("https://clinic-system-back-end.onrender.com/api/bill", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                body: JSON.stringify(payload),
            });

            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                throw new Error(data.message || "Failed to create bill");
            }

            alert("Bill created successfully!");
            navigate("/admin/bill");
        } catch (error) {
            console.error("Error:", error);
            alert(error.message || "Unable to create bill.");
        }
    };

    return (
        <div className="flex min-h-screen bg-gray-100">
           

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