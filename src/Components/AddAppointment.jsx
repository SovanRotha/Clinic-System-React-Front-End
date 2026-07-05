import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function AddAppointment() {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [addAppointment, setAddAppointment] = useState({
    patient_id: "",
    doctor_id: "",
    appointment_date: "",
    appointment_time: "",
    reason: "",
    status: "pending",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("Authentication token not found.");
        }

        const respDoctors = await fetch("http://127.0.0.1:8000/api/doctor", {
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        });
        if (!respDoctors.ok) {
          throw new Error("Failed to load doctors.");
        }
        const dataDoctors = await respDoctors.json().catch(() => ({}));
        setDoctors(Array.isArray(dataDoctors.doctors) ? dataDoctors.doctors : Array.isArray(dataDoctors) ? dataDoctors : []);

        const respPatients = await fetch("http://127.0.0.1:8000/api/patients", {
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        });
        if (!respPatients.ok) {
          throw new Error("Failed to load patients.");
        }
        const dataPatients = await respPatients.json().catch(() => ({}));
        setPatients(Array.isArray(dataPatients.data) ? dataPatients.data : Array.isArray(dataPatients) ? dataPatients : []);
      } catch (err) {
        console.error("Error fetching data:", err);
        alert(err.message || "Failed to load appointment form data.");
      }
    };

    fetchData();
  }, []);

  const handleChange = (e) => {
    setAddAppointment({
      ...addAppointment,
      [e.target.name]: e.target.value,
    });
  };

  const handleCancel = () => {
    navigate("/Admin/appointments");
  };

  const handleSave = async () => {
    if (!addAppointment.patient_id || !addAppointment.doctor_id || !addAppointment.appointment_date) {
      alert("Please select patient, doctor and date.");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      if (!token) { throw new Error("Missing token"); }
      const payload = {
        ...addAppointment,
        patient_id: Number(addAppointment.patient_id),
        doctor_id: Number(addAppointment.doctor_id),
      };
      const res = await fetch("http://127.0.0.1:8000/api/appointment", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      const responseData = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(responseData?.message || responseData?.error || "Failed to save appointment");
      }
      alert("Appointment created successfully");
      navigate("/Admin/appointments");
      setAddAppointment({ patient_id: "", doctor_id: "", appointment_date: "", appointment_time: "", reason: "", status: "pending" });
    } catch (err) {
      console.error(err);
      alert(err.message || "Network error");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        
        {/* Header Block */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Schedule Appointment</h1>
          <p className="text-sm text-slate-500 mt-1">
            Book a new consultation slot between an active provider and patient.
          </p>
        </div>

        {/* Form Container Card */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 sm:p-8 space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Patient Selection Dropdown */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                  Patient File
                </label>
                <div className="relative">
                  <select
                    name="patient_id"
                    value={addAppointment.patient_id}
                    onChange={handleChange}
                    className="w-full bg-slate-50/50 border border-slate-200 text-slate-800 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none transition-all duration-150 appearance-none"
                  >
                    <option value="">Choose matching patient record...</option>
                    {patients.map((patient) => {
                      // Dynamically pull out name if backend maps it, otherwise cleanly present identifiers
                      const displayCode = patient.patient_code ? `[${patient.patient_code}]` : `#${patient.id}`;
                      const displayName = patient.user?.name || patient.name || "Unnamed Patient";
                      
                      return (
                        <option key={patient.id} value={patient.id}>
                          {displayName} {displayCode}
                        </option>
                      );
                    })}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                  </div>
                </div>
              </div>

              {/* Doctor Selection Dropdown */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                  Assigned Doctor
                </label>
                <div className="relative">
                  <select
                    name="doctor_id"
                    value={addAppointment.doctor_id}
                    onChange={handleChange}
                    className="w-full bg-slate-50/50 border border-slate-200 text-slate-800 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none transition-all duration-150 appearance-none"
                  >
                    <option value="">Choose assigned physician...</option>
                    {doctors.map((doctor) => {
                      // Grabs doctor name from user object structure if available, defaults beautifully
                      const displayCode = doctor.doctor_code ? `[${doctor.doctor_code}]` : `#${doctor.id}`;
                      const displayName = doctor.user?.name || doctor.name || "Dr. Professional";
                      const specialization = doctor.specialization ? ` - ${doctor.specialization}` : "";
                      
                      return (
                        <option key={doctor.id} value={doctor.id}>
                          {displayName} {displayCode}{specialization}
                        </option>
                      );
                    })}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                  </div>
                </div>
              </div>

              {/* Date Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                  Appointment Date
                </label>
                <input
                  type="date"
                  name="appointment_date"
                  value={addAppointment.appointment_date}
                  onChange={handleChange}
                  className="w-full bg-slate-50/50 border border-slate-200 text-slate-800 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none transition-all duration-150"
                />
              </div>

              {/* Time Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                  Appointment Time
                </label>
                <input
                  type="time"
                  name="appointment_time"
                  value={addAppointment.appointment_time}
                  onChange={handleChange}
                  className="w-full bg-slate-50/50 border border-slate-200 text-slate-800 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none transition-all duration-150"
                />
              </div>

              {/* Status Selector */}
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                  Initial File Status
                </label>
                <div className="relative">
                  <select
                    name="status"
                    value={addAppointment.status}
                    onChange={handleChange}
                    className="w-full bg-slate-50/50 border border-slate-200 text-slate-800 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none transition-all duration-150 appearance-none capitalize"
                  >
                    <option value="pending">Pending Review</option>
                    <option value="confirmed">Confirmed / Active</option>
                    <option value="completed">Completed Visit</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                  </div>
                </div>
              </div>

              {/* Reason Input */}
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                  Reason for Consultation
                </label>
                <textarea
                  name="reason"
                  value={addAppointment.reason}
                  onChange={handleChange}
                  rows="4"
                  placeholder="Summarize patient symptoms or context for medical charts..."
                  className="w-full bg-slate-50/50 border border-slate-200 text-slate-800 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none transition-all duration-150 resize-none placeholder-slate-400"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={handleCancel}
                className="px-5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors duration-150"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSave}
                className="px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors duration-150 shadow-sm shadow-blue-500/10"
              >
                Create Appointment
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default AddAppointment;