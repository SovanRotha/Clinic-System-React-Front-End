import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "../Admin/AdminSidebar";

function AddPatient() {
    const navigate = useNavigate();

    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState("");

    const [patient, setPatient] = useState({
        patient_code: "",
        address: "",
        gender: "",
        date_of_birth: "",
        blood_group: "",
    });

    const [loading, setLoading] = useState(false);
    const [loadingUsers, setLoadingUsers] = useState(true);

    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    // =========================
    // Load patient users
    // =========================
    useEffect(() => {
        setLoadingUsers(true);

        const token = localStorage.getItem("token");
        if (!token) {
            setError("Authentication required to load patient users.");
            setLoadingUsers(false);
            return;
        }

        fetch("http://127.0.0.1:8000/api/users?role=patient", {
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
            },
        })
            .then((res) => {
                if (!res.ok) {
                    throw new Error("Unauthorized");
                }
                return res.json();
            })
            .then((data) => {
                setUsers(Array.isArray(data.user) ? data.user : []);
            })
            .catch(() => {
                setError("Failed to load users");
            })
            .finally(() => {
                setLoadingUsers(false);
            });
    }, []);

    // =========================
    // Handle input change
    // =========================
    const handleChange = (e) => {
        setPatient({
            ...patient,
            [e.target.name]: e.target.value,
        });
    };

    // =========================
    // Submit form
    // =========================
    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setMessage("");

        // validation
        if (!selectedUser) {
            setError("Please select a patient user");
            return;
        }

        setLoading(true);

        try {
            const token = localStorage.getItem("token");

            const res = await fetch("http://127.0.0.1:8000/api/patients", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    user_id: selectedUser,
                    patient_code: patient.patient_code,
                    address: patient.address,
                    gender: patient.gender,
                    date_of_birth: patient.date_of_birth,
                    blood_group: patient.blood_group,
                }),
            });

            const data = await res.json().catch(async () => {
                const text = await res.text();
                return { message: text || "Unknown error" };
            });

            if (res.ok) {
                setMessage("Patient created successfully!");

                // reset form
                setSelectedUser("");
                setPatient({
                    patient_code: "",
                    address: "",
                    gender: "",
                    date_of_birth: "",
                });

                // redirect
                setTimeout(() => {
                    navigate("/admin/patients");
                }, 800);
            } else {
                setError(data.message || "Failed to create patient");
            }
        } catch (err) {
            console.error(err);
            setError("Server error. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen bg-[#F5F7FB]">
            <AdminSidebar />

            <div className="flex-1 p-6">
                <h1 className="text-2xl font-bold mb-6">
                    Create Patient Profile
                </h1>

                {/* SUCCESS MESSAGE */}
                {message && (
                    <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
                        {message}
                    </div>
                )}

                {/* ERROR MESSAGE */}
                {error && (
                    <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
                        {error}
                    </div>
                )}

                <form
                    onSubmit={handleSubmit}
                    className="bg-white p-6 rounded-lg shadow-md grid grid-cols-1 md:grid-cols-2 gap-4"
                >
                    {/* USER SELECT */}
                    <select
                        value={selectedUser}
                        onChange={(e) => setSelectedUser(e.target.value)}
                        className="border p-2 rounded"
                        required
                    >
                        <option value="">
                            {loadingUsers
                                ? "Loading users..."
                                : "Select Patient User"}
                        </option>

                        {users.map((u) => (
                            <option key={u.id} value={u.id}>
                                {u.name} ({u.email})
                            </option>
                        ))}
                    </select>

                    {/* PATIENT CODE */}
                    <input
                        type="text"
                        name="patient_code"
                        placeholder="Patient Code"
                        value={patient.patient_code}
                        onChange={handleChange}
                        className="border p-2 rounded"
                        required
                    />

                    {/* DATE OF BIRTH */}
                    <input
                        type="date"
                        name="date_of_birth"
                        value={patient.date_of_birth}
                        onChange={handleChange}
                        className="border p-2 rounded"
                        required
                    />

                    {/* GENDER */}
                    <select
                        name="gender"
                        value={patient.gender}
                        onChange={handleChange}
                        className="border p-2 rounded"
                        required
                    >
                        <option value="">Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                    </select>

                    {/* ADDRESS */}
                    <input
                        type="text"
                        name="address"
                        placeholder="Address"
                        value={patient.address}
                        onChange={handleChange}
                        className="border p-2 rounded"
                        required
                    />

                    {/* BLOOD GROUP */}
                    <select
                        name="blood_group"
                        value={patient.blood_group}
                        onChange={handleChange}
                        className="border p-2 rounded"
                        required
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
                    {/* BUTTON */}
                    <div className="md:col-span-2 flex justify-end">
                        <button
                            type="submit"
                            disabled={loading || loadingUsers}
                            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                        >
                            {loading ? "Saving..." : "Create Patient"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default AddPatient;