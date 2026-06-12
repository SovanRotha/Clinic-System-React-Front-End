import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children, allowedRole }) {
    const token = localStorage.getItem('token');
    const user  = JSON.parse(localStorage.getItem('user') || 'null');

    if (!token || !user) {
        return <Navigate to="/" replace />;
    }
 

    // ✅ Handle both string and array
    const allowed = Array.isArray(allowedRole)
        ? allowedRole.includes(user.role)
        : user.role === allowedRole;

    

    if (allowedRole && !allowed) {
        if (user.role === 'admin')   return <Navigate to="/admin" replace />;
        if (user.role === 'doctor') return <Navigate to="/doctor"   replace />;
        if (user.role === 'receptionist') return <Navigate to="/receptionist"   replace />;
        if (user.role === 'patient') return <Navigate to="/patient"   replace />;
        return <Navigate to="/" replace />;
    }

    return children;
}

export default ProtectedRoute;