import AdminDashboard from "../Admin/AdminDashboard";
import UserManagement from "../Admin/UserManagement";
import PatientManagement from "../Admin/PatientManagement";
import DoctorManagement from "../Admin/DoctorManagement";
import AppointmentManagement from "../Admin/AppointmentManagement";
import BillingManagement from "../Admin/BillManagement";
import { Routes, Route } from "react-router-dom";
import EditUser from "../Components/EditUser";
import AddUser from "../Components/AddUser";
import AddDoctor from "../Components/AddDoctor";
import EditDoctor from "../Components/EditDoctor";
import ViewPatient from "../Components/ViewPatient";
import EditPatient from "../Components/EditPatient";
import EditAppointment from "../Components/EditAppointment";
import AddAppointment from "../Components/AddAppointment";
import ViewAppointment from "../Components/ViewAppointment";
import EditBill from "../Components/EditBill";
import AddBill from "../Components/AddBill";
import ViewBill from "../Components/ViewBill";

function Admin() {
  return (
    <Routes>
      <Route path="/" element={<AdminDashboard />} />
      <Route path="/users" element={<UserManagement />} />
      <Route path="/editusers/:id" element={<EditUser />} />
      <Route path="/adduser" element={<AddUser/>} />
      <Route path="/patients" element={<PatientManagement />} />
      <Route path="/doctors" element={<DoctorManagement />} />
      <Route path="/adddoctor" element={<AddDoctor />} />
      <Route path="/editdoctor/:id" element={<EditDoctor />} />
      <Route path="/viewpatient/:id" element={<ViewPatient />} />
      <Route path="/editpatient/:id" element={<EditPatient />} />
      <Route path="/appointments" element={<AppointmentManagement />} />
      <Route path="/addappointment" element={<AddAppointment />} />
      <Route path="/editappointment/:id" element={<EditAppointment />} />
      <Route path="/viewappointment/:id" element={<ViewAppointment />} />
      <Route path="/bill" element={<BillingManagement />} />
      <Route path="/editbill/:id" element={<EditBill />} />
      <Route path="/addbill" element={<AddBill />} />
      <Route path="/viewbill/:id" element={<ViewBill />} />
    </Routes>
  );
}   
export default Admin;