import AdminSidebar from "../Admin/AdminSidebar";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function AddDoctor() {
    const navigate = useNavigate();

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingUsers, setLoadingUsers] = useState(true);
    const [userError, setUserError] = useState(null);

    const [doctor, setDoctor] = useState({
        user_id: "",
        doctor_code: "",
        specialization: "",
        working_day: "",
        start_time: "",
        end_time: "",
        status: "working",
    });

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const token = localStorage.getItem("token");
                
                if (!token) {
                    throw new Error("No authentication token found. Please login first.");
                }

                const response = await fetch("http://127.0.0.1:8000/api/doctor-users", {
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json",
                    }
                });
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const data = await response.json();
                
                if (Array.isArray(data)) {
                    setUsers(data);
                } else {
                    console.warn("Users data is not an array:", data);
                    setUsers([]);
                }
            } catch (error) {
                console.error("Error loading users:", error);
                setUserError(error instanceof Error ? error.message : "Failed to load users");
                setUsers([]);
            } finally {
                setLoadingUsers(false);
            }
        };

        fetchUsers();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setDoctor((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setLoading(true);

        try {
            const token = localStorage.getItem("token");
            
            if (!token) {
                throw new Error("No authentication token found. Please login first.");
            }

            const response = await fetch(
                "http://127.0.0.1:8000/api/doctor",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`,
                    },
                    body: JSON.stringify(doctor),
                }
            );

            let data;
            const contentType = response.headers.get("content-type");
            
            if (contentType && contentType.includes("application/json")) {
                data = await response.json();
            } else {
                const text = await response.text();
                data = { message: text || "No response from server" };
            }

            console.log("Response:", data);

            if (!response.ok) {
                const errorMessage = data.message || data.error || JSON.stringify(data) || "Failed to create doctor";
                throw new Error(errorMessage);
            }

            alert("Doctor created successfully!");

            navigate("/admin/doctors");
        } catch (error) {
            console.error("Error creating doctor:", error);
            const errorMsg = error instanceof Error ? error.message : "Something went wrong";
            alert(`Error: ${errorMsg}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen bg-gray-100">
            <AdminSidebar />

            <div className="flex-1 p-8">
                <div className="max-w-5xl mx-auto">
                    <h1 className="text-3xl font-bold mb-2">
                        Add Doctor
                    </h1>

                    <p className="text-gray-600 mb-8">
                        Create a doctor profile and assign it to an existing user.
                    </p>

                    <form
                        onSubmit={handleSubmit}
                        className="bg-white shadow-lg rounded-xl p-8"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                            {/* Doctor User */}
                            <div>
                                <label className="block font-medium mb-2">
                                    Select User
                                </label>

                                {userError && (
                                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-2">
                                        Error: {userError}
                                    </div>
                                )}

                                {loadingUsers && (
                                    <div className="text-gray-500 px-4 py-2">
                                        Loading users...
                                    </div>
                                )}

                                {!loadingUsers && (
                                    <select
                                        name="user_id"
                                        value={doctor.user_id}
                                        onChange={handleChange}
                                        required
                                        className="w-full border border-gray-300 rounded-lg p-3"
                                    >
                                        <option value="">
                                            {users.length === 0 ? "No users available" : "Select Doctor User"}
                                        </option>

                                        {users.map((user) => (
                                            <option
                                                key={user.id}
                                                value={user.id}
                                            >
                                                {user.name} ({user.email})
                                            </option>
                                        ))}
                                    </select>
                                )}
                            </div>

                            {/* Doctor Code */}
                            <div>
                                <label className="block font-medium mb-2">
                                    Doctor Code
                                </label>

                                <input
                                    type="text"
                                    name="doctor_code"
                                    value={doctor.doctor_code}
                                    onChange={handleChange}
                                    required
                                    placeholder="DOC001"
                                    className="w-full border border-gray-300 rounded-lg p-3"
                                />
                            </div>

                            {/* Specialization */}
                            <div>
                                <label className="block font-medium mb-2">
                                    Specialization
                                </label>

                                <input
                                    type="text"
                                    name="specialization"
                                    value={doctor.specialization}
                                    onChange={handleChange}
                                    placeholder="Cardiology"
                                    className="w-full border border-gray-300 rounded-lg p-3"
                                />
                            </div>

                            {/* Working Day */}
                            <div>
                                <label className="block font-medium mb-2">
                                    Working Day
                                </label>

                                <input
                                    type="text"
                                    name="working_day"
                                    value={doctor.working_day}
                                    onChange={handleChange}
                                    required
                                    placeholder="Monday-Friday"
                                    className="w-full border border-gray-300 rounded-lg p-3"
                                />
                            </div>

                            {/* Start Time */}
                            <div>
                                <label className="block font-medium mb-2">
                                    Start Time
                                </label>

                                <input
                                    type="time"
                                    name="start_time"
                                    value={doctor.start_time}
                                    onChange={handleChange}
                                    required
                                    className="w-full border border-gray-300 rounded-lg p-3"
                                />
                            </div>

                            {/* End Time */}
                            <div>
                                <label className="block font-medium mb-2">
                                    End Time
                                </label>

                                <input
                                    type="time"
                                    name="end_time"
                                    value={doctor.end_time}
                                    onChange={handleChange}
                                    required
                                    className="w-full border border-gray-300 rounded-lg p-3"
                                />
                            </div>

                            {/* Status */}
                            <div>
                                <label className="block font-medium mb-2">
                                    Status
                                </label>

                                <select
                                    name="status"
                                    value={doctor.status}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-lg p-3"
                                >
                                    <option value="working">
                                        Working
                                    </option>

                                    <option value="leave">
                                        On Leave
                                    </option>

                                    <option value="inactive">
                                        Inactive
                                    </option>
                                </select>
                            </div>
                        </div>

                        <div className="flex gap-4 mt-8">
                            <button
                                type="submit"
                                disabled={loading || loadingUsers || users.length === 0}
                                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg"
                            >
                                {loading
                                    ? "Creating..."
                                    : "Create Doctor"}
                            </button>

                            <button
                                type="button"
                                onClick={() =>
                                    navigate("/admin/doctors")
                                }
                                className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-3 rounded-lg"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default AddDoctor;