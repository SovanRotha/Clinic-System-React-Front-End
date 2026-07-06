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
                    `https://clinic-system-back-end.onrender.com/api/bill/${id}`,
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

    // Elegant Skeleton Loading State
    if (!bill) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
                <div className="max-w-3xl w-full bg-white rounded-2xl shadow-sm p-8 animate-pulse space-y-6">
                    <div className="h-8 bg-slate-200 rounded w-1/4"></div>
                    <div className="grid grid-cols-3 gap-4">
                        <div className="h-20 bg-slate-100 rounded-xl"></div>
                        <div className="h-20 bg-slate-100 rounded-xl"></div>
                        <div className="h-20 bg-slate-100 rounded-xl"></div>
                    </div>
                    <div className="h-40 bg-slate-100 rounded-xl"></div>
                </div>
            </div>
        );
    }

    const isPaid = bill.payment_status === "paid";

    return (
        <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                
                {/* Header Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Invoice Details</h1>
                        <p className="text-sm text-slate-500 mt-1">Generated on {new Date(bill.created_at).toLocaleDateString(undefined, { dateStyle: 'long' })}</p>
                    </div>
                    <button className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-xl shadow-sm transition-colors duration-200">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                        </svg>
                        Download Invoice
                    </button>
                </div>

                {/* Main Content Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* Left 2 Columns: Bill Summary & Details */}
                    <div className="lg:col-span-2 space-y-6">
                        
                        {/* Meta Card */}
                        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-6">
                                <div>
                                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Invoice ID</span>
                                    <h3 className="text-xl font-bold text-slate-800">#{bill.id}</h3>
                                </div>
                                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide capitalize ${
                                    isPaid ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-rose-50 text-rose-700 border border-rose-200"
                                }`}>
                                    <span className={`w-2 h-2 rounded-full ${isPaid ? "bg-emerald-500" : "bg-rose-500"}`}></span>
                                    {bill.payment_status}
                                </span>
                            </div>

                            {/* Financial Breakdown */}
                            <div className="space-y-3">
                                <div className="flex justify-between items-center text-sm py-2">
                                    <span className="text-slate-500">Consultation Fee</span>
                                    <span className="font-medium text-slate-800">${parseFloat(bill.consultation_fee).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm py-2">
                                    <span className="text-slate-500">Medicine Fee</span>
                                    <span className="font-medium text-slate-800">${parseFloat(bill.medicine_fee).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center pt-4 border-t border-dashed border-slate-200">
                                    <span className="text-base font-semibold text-slate-900">Total Amount</span>
                                    <span className="text-2xl font-extrabold text-blue-600">${parseFloat(bill.total_amount).toFixed(2)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Appointment Info Card */}
                        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-slate-400">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                                </svg>
                                <h2 className="text-lg font-bold text-slate-900">Appointment Details</h2>
                            </div>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 rounded-xl p-4">
                                <div>
                                    <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Date & Time</p>
                                    <p className="font-semibold text-slate-800 mt-0.5">
                                        {bill.appointment?.appointment_date || "N/A"} at {bill.appointment?.appointment_time || "N/A"}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Status</p>
                                    <span className="inline-block px-2.5 py-0.5 mt-1 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100 capitalize">
                                        {bill.appointment?.status || "N/A"}
                                    </span>
                                </div>
                                <div className="sm:col-span-2 border-t border-slate-200/60 pt-3 mt-1">
                                    <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Reason for Visit</p>
                                    <p className="text-sm text-slate-700 mt-1 italic">
                                        "{bill.appointment?.reason || "No reason specified"}"
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Patient Details Sidebar */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 sticky top-6">
                            <div className="flex items-center gap-2 mb-6">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-slate-400">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                                </svg>
                                <h2 className="text-lg font-bold text-slate-900">Patient File</h2>
                            </div>

                            <div className="space-y-4">
                                <div className="pb-3 border-b border-slate-100">
                                    <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Patient ID</p>
                                    <p className="font-bold text-slate-800 mt-0.5">
                                        {bill.patient ? `PAT-${bill.patient.id}` : "N/A"}
                                    </p>
                                </div>

                                <div className="pb-3 border-b border-slate-100">
                                    <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Gender</p>
                                    <p className="font-semibold text-slate-800 mt-0.5 capitalize">
                                        {bill.patient?.gender || "N/A"}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Blood Group</p>
                                    <p className="inline-flex items-center justify-center px-2.5 py-1 rounded bg-red-50 text-red-700 text-xs font-bold mt-1 border border-red-100">
                                        {bill.patient?.blood_group || "N/A"}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}

export default ViewBill;