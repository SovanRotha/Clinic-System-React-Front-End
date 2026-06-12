import AdminSidebar from "./AdminSidebar";

function BillManagement() {
    return (
        <div className="flex">
            <div>
                <AdminSidebar />
            </div>
            <h1 className="text-3xl font-bold mb-4">Bill Management</h1>
            <p>Here you can manage all bills, view details, and perform administrative actions.</p>
        </div>
    );
}
export default BillManagement;