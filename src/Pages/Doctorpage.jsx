import AppointmentDoctor from "../Doctor/AppointmentDoctor";
import { Routes, Route } from "react-router-dom";
import DashboardDoctor from "../Doctor/DashboardDoctor";
import DoctorPrescription from "../Doctor/DoctorPrescription";
import DoctorProfile from "../Doctor/DoctorProfile";
import DoctorPatients from "../Doctor/DoctorPatient";
import DoctorConsult from "../Doctor/DoctorConsult";
import DoctorConsultation from "../Doctor/DoctorConsultation";

function Doctor() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<DashboardDoctor />} />
        <Route path="/appointments" element={<AppointmentDoctor />} />
        <Route path="/patients" element={<DoctorPatients />} />
        <Route path="/consult" element={<DoctorConsult />} />
        <Route path="/consultation/:id" element={<DoctorConsultation />} />
        <Route path="/prescriptions" element={<DoctorPrescription />} />
        <Route path="/profile" element={<DoctorProfile />} />
      </Routes>
    </div>
  );
}

export default Doctor;