import AdminSidebar from "./AdminSidebar";

function AdminDashboard() {
  return (
    <div className="flex">
        <div>
            <AdminSidebar />
        </div>
      <h1 className="text-3xl font-bold mb-4">Admin Dashboard</h1>
      <p>Welcome to the admin dashboard! Here you can manage users, view reports, and configure settings.</p>
    </div>
  );
}
export default AdminDashboard;