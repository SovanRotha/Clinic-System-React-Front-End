import { Routes, Route } from "react-router-dom";
import PatientDashboard from "../Patients/PatientDashboard";
import PatientProfile from "../Patients/PatientProfile";
import PatientAppointments from "../Patients/PatientAppointment";
import PatientHistory from "../Patients/PatientHistory";
import PatientPrescriptions from "../Patients/PatientPrescription";
import PatientBill from "../Patients/PatientBill";

function Patientpage() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<PatientDashboard />} />
        <Route path="/profile" element={<PatientProfile />} />
        <Route path="/appointments" element={<PatientAppointments />} />
        <Route path="/history" element={<PatientHistory />} />
        <Route path="/prescriptions" element={<PatientPrescriptions />} />
        <Route path="/bill" element={<PatientBill />} />
      </Routes>
    </div>
  );
}

export default Patientpage;