
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

function EditDoctor() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [editDoctor, setEditDoctor] = useState({
        user_id: "",
        doctor_code: "",
        name: "",
        email: "",
        phone_number: "",
        specialization: "",
        working_day: "",
        start_time: "",
        end_time: "",
        status: "",
    });

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDoctor = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) {
                    throw new Error("Authentication token missing");
                }

                const response = await fetch(
                    `http://127.0.0.1:8000/api/doctor/${id}`,
                    {
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                if (!response.ok) {
                    throw new Error("Failed to load doctor details");
                }

                const data = await response.json().catch(() => ({}));
                const doctorData = data.doctor || {};

                setEditDoctor({
                    user_id: doctorData.user_id || "",
                    doctor_code: doctorData.doctor_code || "",
                    name: doctorData.user?.name || "",
                    email: doctorData.user?.email || "",
                    phone_number: doctorData.user?.phone_number || "",
                    specialization: doctorData.specialization || "",
                    working_day: doctorData.working_day || "",
                    start_time: doctorData.start_time?.substring(0, 5) || "",
                    end_time: doctorData.end_time?.substring(0, 5) || "",
                    status: doctorData.status || "",
                });
            } catch (error) {
                console.error("Error fetching doctor:", error);
                alert(error.message || "Failed to load doctor details");
            } finally {
                setLoading(false);
            }
        };

        fetchDoctor();
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setEditDoctor((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const token = localStorage.getItem("token");

            const response = await fetch(
                `http://127.0.0.1:8000/api/doctor/${id}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(editDoctor),
                }
            );

            const data = await response.json();

            console.log(data);

            if (!response.ok) {
                throw new Error(data.message || "Failed to update doctor");
            }

            alert("Doctor updated successfully!");
            navigate("/admin/doctors");
        } catch (error) {
            console.error("Error updating doctor:", error);
            alert(error.message);
        }
    };

    if (loading) {
        return (
            <div className="flex">
                
                <div className="p-8">
                    <h2>Loading doctor details...</h2>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-gray-100">
            
            <div className="flex-1 p-8">
                <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-xl p-8">
                    <h1 className="text-3xl font-bold mb-2">
                        Edit Doctor
                    </h1>

                    <p className="text-gray-500 mb-8">
                        Update doctor information.
                    </p>

                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                            <div>
                                <label className="block mb-2 font-medium">
                                    Doctor Code
                                </label>
                                <input
                                    type="text"
                                    name="doctor_code"
                                    value={editDoctor.doctor_code}
                                    onChange={handleChange}
                                    className="w-full border rounded-lg p-3"
                                />
                            </div>

                            <div>
                                <label className="block mb-2 font-medium">
                                    Name
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={editDoctor.name}
                                    onChange={handleChange}
                                    className="w-full border rounded-lg p-3"
                                />
                            </div>

                            <div>
                                <label className="block mb-2 font-medium">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={editDoctor.email}
                                    onChange={handleChange}
                                    className="w-full border rounded-lg p-3"
                                />
                            </div>

                            <div>
                                <label className="block mb-2 font-medium">
                                    Phone Number
                                </label>
                                <input
                                    type="text"
                                    name="phone_number"
                                    value={editDoctor.phone_number}
                                    onChange={handleChange}
                                    className="w-full border rounded-lg p-3"
                                />
                            </div>

                            <div>
                                <label className="block mb-2 font-medium">
                                    Specialization
                                </label>
                                <input
                                    type="text"
                                    name="specialization"
                                    value={editDoctor.specialization}
                                    onChange={handleChange}
                                    className="w-full border rounded-lg p-3"
                                />
                            </div>

                            <div>
                                <label className="block mb-2 font-medium">
                                    Working Day
                                </label>
                                <input
                                    type="text"
                                    name="working_day"
                                    value={editDoctor.working_day}
                                    onChange={handleChange}
                                    className="w-full border rounded-lg p-3"
                                />
                            </div>

                            <div>
                                <label className="block mb-2 font-medium">
                                    Start Time
                                </label>
                                <input
                                    type="time"
                                    name="start_time"
                                    value={editDoctor.start_time}
                                    onChange={handleChange}
                                    className="w-full border rounded-lg p-3"
                                />
                            </div>

                            <div>
                                <label className="block mb-2 font-medium">
                                    End Time
                                </label>
                                <input
                                    type="time"
                                    name="end_time"
                                    value={editDoctor.end_time}
                                    onChange={handleChange}
                                    className="w-full border rounded-lg p-3"
                                />
                            </div>

                            <div>
                                <label className="block mb-2 font-medium">
                                    Status
                                </label>

                                <select
                                    name="status"
                                    value={editDoctor.status}
                                    onChange={handleChange}
                                    className="w-full border rounded-lg p-3"
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

                        <div className="mt-8 flex gap-4">
                            <button
                                type="submit"
                                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg"
                            >
                                Update Doctor
                            </button>

                            <button
                                type="button"
                                onClick={() => navigate("/admin/doctors")}
                                className="bg-gray-300 hover:bg-gray-400 px-6 py-3 rounded-lg"
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

export default EditDoctor;