import AdminSidebar from "./AdminSidebar";
import { useEffect, useState } from "react";

function AdminDashboard() {

    const [patients, setPatients] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [bills, setBills] = useState([]);

    const [stats, setStats] = useState({
        totalPatients: 0,
        totalDoctors: 0,
        totalAppointments: 0,
        totalIncome: 0,
        paidBills: 0,
        pendingBills: 0,
    });

    useEffect(() => {
        const token = localStorage.getItem("token");

        const fetchData = async () => {
            try {
                const [patientRes, doctorRes, appRes, billRes] = await Promise.all([
                    fetch("http://127.0.0.1:8000/api/patients", {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                    fetch("http://127.0.0.1:8000/api/doctor", {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                    fetch("http://127.0.0.1:8000/api/appointment", {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                    fetch("http://127.0.0.1:8000/api/bill", {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                ]);

                const patientData = await patientRes.json();
                const doctorData = await doctorRes.json();
                const appData = await appRes.json();
                const billData = await billRes.json();

                const billsList = billData.data || [];

                // 💰 CALCULATE TOTAL INCOME
                let totalIncome = 0;
                let paidBills = 0;
                let pendingBills = 0;

                billsList.forEach((bill) => {
                    const amount = parseFloat(bill.total_amount || 0);
                    totalIncome += amount;

                    if (bill.payment_status === "paid") {
                        paidBills++;
                    } else {
                        pendingBills++;
                    }
                });

                setPatients(patientData.data || []);
                setDoctors(doctorData.data || []);
                setAppointments(appData.data || []);
                setBills(billsList);

                setStats({
                    totalPatients: patientData.data?.length || 0,
                    totalDoctors: doctorData.data?.length || 0,
                    totalAppointments: appData.data?.length || 0,
                    totalIncome,
                    paidBills,
                    pendingBills,
                });

            } catch (error) {
                console.error("Dashboard API error:", error);
            }
        };

        fetchData();
    }, []);

    return (
        <div className="flex min-h-screen bg-[#F5F7FB]">

            {/* Sidebar */}
            <AdminSidebar />

            {/* MAIN */}
            <div className="flex-1 p-6">

                {/* HEADER */}
                <h1 className="text-2xl font-bold mb-6">
                    Clinical Dashboard (Live API)
                </h1>

                {/* STATS CARDS */}
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">

                    <Card title="Patients" value={stats.totalPatients} />
                    <Card title="Doctors" value={stats.totalDoctors} />
                    <Card title="Appointments" value={stats.totalAppointments} />

                    <Card
                        title="Total Income"
                        value={`$${stats.totalIncome}`}
                        color="text-green-600"
                    />

                    <Card
                        title="Paid Bills"
                        value={stats.paidBills}
                        color="text-blue-600"
                    />

                    <Card
                        title="Pending"
                        value={stats.pendingBills}
                        color="text-red-500"
                    />
                </div>

                {/* TWO MAIN SECTIONS */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                    {/* APPOINTMENTS LIST */}
                    <div className="bg-white p-4 rounded shadow">
                        <h2 className="font-bold mb-3">Recent Appointments</h2>

                        {appointments.slice(0, 5).map((a) => (
                            <div key={a.id} className="border-b py-2 text-sm">
                                <p>
                                    📅 {a.appointment_date} - {a.reason}
                                </p>
                                <p className="text-gray-500">
                                    Status: {a.status}
                                </p>
                            </div>
                        ))}
                    </div>

                    {/* BILLS LIST */}
                    <div className="bg-white p-4 rounded shadow">
                        <h2 className="font-bold mb-3">Latest Bills</h2>

                        {bills.slice(0, 5).map((b) => (
                            <div key={b.id} className="border-b py-2 text-sm">
                                <p>
                                    💰 Bill #{b.id} - ${b.total_amount}
                                </p>
                                <p
                                    className={
                                        b.payment_status === "paid"
                                            ? "text-green-600"
                                            : "text-red-500"
                                    }
                                >
                                    {b.payment_status}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

/* 🔥 Reusable Card Component */
function Card({ title, value, color = "text-black" }) {
    return (
        <div className="bg-white p-4 rounded shadow">
            <p className="text-gray-500 text-sm">{title}</p>
            <h2 className={`text-xl font-bold ${color}`}>{value}</h2>
        </div>
    );
}

export default AdminDashboard;