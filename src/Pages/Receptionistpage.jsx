import ReceptionistDashboard from "../Receptionist/ReceptionistDashboard";
import ReceptionistAppointment from "../Receptionist/ReceptionistAppointment";
import ReceptionistBill from "../Receptionist/ReceptionistBill";
import { Routes, Route } from "react-router-dom";
import ReceptionistPatient from "../Receptionist/ReceptionistPatient";
import AddPatient from "../Components/AddPatient";
import AddUserAsPatient from "../Receptionist/AddUserAsPatient";
import ReceptionistSidebar from "../Receptionist/ReceptionistSidebar";
import EditPatient from "../Components/EditPatient";
import EditAppointment from "../Components/EditAppointment";
import ViewAppointment from "../Components/ViewAppointment";
import AddAppointment from "../Components/AddAppointment";
import ViewBill from "../Components/ViewBill";
import EditBill from "../Components/EditBill";
import AddBill from "../Components/AddBill";
import User from "../Receptionist/User";
import AddUser from "../Components/AddUser";
import EditUser from "../Receptionist/EditUser";

function Receptionist() {
  return (
    <div>
      <Routes>
        <Route
          path="/*"
          element={
            <div
              style={{
                display: "flex",
                minHeight: "100vh",
                background: "#F4F6FA",
              }}
            >
              <ReceptionistSidebar />
              <div style={{ flex: 1 }}>
                <Routes>
                  <Route index element={<ReceptionistDashboard />} />
                  <Route path="/patients" element={<ReceptionistPatient />} />
                  <Route path="/addpatient" element={<AddPatient />} />
                  <Route path="/adduser" element={<AddUserAsPatient />} />
                  <Route path="/editpatient/:id" element={<EditPatient />} />
                  <Route path="/appointments" element={<ReceptionistAppointment />} />
                  <Route path="/addappointment" element={<AddAppointment />} />
                  <Route path="/users" element={<User />} />
                  <Route path="/adduser" element={<AddUser />} />
                  <Route path="/edituser/:id" element={<EditUser />} />
                  <Route path="/editappointment/:id" element={<EditAppointment />} />
                  <Route path="/viewappointment/:id" element={<ViewAppointment />} />
                  <Route path="/bills" element={<ReceptionistBill />} />
                  <Route path="/addbill" element={<AddBill />} />
                  <Route path="/editbill/:id" element={<EditBill />} />
                  <Route path="/viewbill/:id" element={<ViewBill />} />
                </Routes>
              </div>
            </div>
          }
        />
      </Routes>
    </div>
  );
}
export default Receptionist;
