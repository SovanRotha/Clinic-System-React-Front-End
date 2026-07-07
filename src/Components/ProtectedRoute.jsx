import { Navigate } from 'react-router-dom';
import { getStoredUser, normalizeRole } from '../utils/auth';

function ProtectedRoute({ children, allowedRole }) {
    const token = localStorage.getItem('token');
    const storedUser = getStoredUser();
    const user = storedUser ? { ...storedUser, role: normalizeRole(storedUser.role) } : null;

    if (!token || !user) {
        return <Navigate to="/" replace />;
    }

    const allowedRoles = Array.isArray(allowedRole)
        ? allowedRole.map(normalizeRole).filter(Boolean)
        : [normalizeRole(allowedRole)].filter(Boolean);

    const isAllowed = allowedRoles.length === 0 || allowedRoles.includes(user.role);

    if (!isAllowed) {
        if (user.role === 'admin') return <Navigate to="/admin" replace />;
        if (user.role === 'doctor') return <Navigate to="/doctor" replace />;
        if (user.role === 'receptionist') return <Navigate to="/receptionist" replace />;
        if (user.role === 'patient') return <Navigate to="/patient" replace />;
        return <Navigate to="/" replace />;
    }

    return children;
}

export default ProtectedRoute;