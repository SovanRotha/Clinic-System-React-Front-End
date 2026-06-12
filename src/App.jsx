import Patientpage from "./Pages/Patientpage";
import Register from "./Pages/Registerpage";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./Pages/Loginpage";
import ProtectedRoute from "./Components/ProtectedRoute";
import Adminpage from "./Pages/Adminpage";
import Doctorpage from "./Pages/Doctorpage";
import Receptionistpage from "./Pages/Receptionistpage";
import PatientDashboard from "./Patients/PatientDashboard";
import PatientProfile from "./Patients/PatientProfile";
import PatientAppointments from "./Patients/PatientAppointment";
import PatientHistory from "./Patients/PatientHistory";
import PatientPrescriptions from "./Patients/PatientPrescription";
import PatientBill from "./Patients/PatientBill";


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/admin/*" element={
          <ProtectedRoute allowedRole="admin">
            <Adminpage />
          </ProtectedRoute>
        } />
        <Route path="/doctor/*" element={
          <ProtectedRoute allowedRole={["doctor", "admin"]}>
            <Doctorpage />
          </ProtectedRoute>
        } />
        <Route path="/receptionist" element={
          <ProtectedRoute allowedRole={["receptionist", "admin"]}>
            <Receptionistpage />
          </ProtectedRoute>
        } />
        <Route path="/patient/*" element={
          <ProtectedRoute allowedRole={["patient", "admin"]}>
            <Patientpage />
          </ProtectedRoute>
        } />

        
        <Route path="/profile" element={<ProtectedRoute allowedRole={["patient", "admin"]}>
            <PatientProfile />
          </ProtectedRoute>} />
        <Route path="/appointments" element={<ProtectedRoute allowedRole={["patient", "admin"]}>
            <PatientAppointments />
          </ProtectedRoute>} />
        <Route path="/history" element={<ProtectedRoute allowedRole={["patient", "admin"]}>
            <PatientHistory />
          </ProtectedRoute>} />
        <Route path="/prescriptions" element={<ProtectedRoute allowedRole={["patient", "admin"]}>
            <PatientPrescriptions />
          </ProtectedRoute>} />
        <Route path="/bill" element={<ProtectedRoute allowedRole={["patient", "admin"]}>
            <PatientBill />
          </ProtectedRoute>} />

      </Routes>
    </BrowserRouter>
  )
}

export default App