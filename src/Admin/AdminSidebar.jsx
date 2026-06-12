import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Stethoscope,
  UserRound,
  CalendarClock,
  CreditCard,
  BarChart2,
  Settings,
  LogOut,
} from "lucide-react";

const NAV_ITEMS = [
  { label: "Dashboard",              icon: <LayoutDashboard size={18} />, path: "/admin"    },
  { label: "User Management",        icon: <Users size={18} />,           path: "/admin/users"         },
  { label: "Doctor Management",      icon: <Stethoscope size={18} />,     path: "/admin/doctors"       },
  { label: "Patient Management",     icon: <UserRound size={18} />,       path: "/admin/patients"      },
  { label: "Appointment Management", icon: <CalendarClock size={18} />,   path: "/admin/appointments"  },
  { label: "Billing & Payments",     icon: <CreditCard size={18} />,      path: "/admin/bill"       },
  { label: "Reports & Analytics",    icon: <BarChart2 size={18} />,       path: "/admin/reports"       },
  { label: "Settings",               icon: <Settings size={18} />,        path: "/admin/settings"      },
];

export default function AdminSidebar() {
  const navigate = useNavigate();
    const location = useLocation();
  
    const getActiveId = (pathname) => {
      const sorted = [...NAV_ITEMS].sort((a, b) => b.path.length - a.path.length);
      const match = sorted.find((item) => pathname === item.path || pathname.startsWith(item.path + "/"));
      return match ? match.path : "/admin";
    };

    const active = getActiveId(location.pathname);
  
    // Read current user from localStorage so the sidebar shows the logged-in user's name and avatar
    const [user, setUser] = useState(() => {
      try {
        return JSON.parse(localStorage.getItem("user") || "null");
      } catch {
        return null;
      }
    });
  
    useEffect(() => {
      try {
        setUser(JSON.parse(localStorage.getItem("user") || "null"));
      } catch {
        setUser(null);
      }
    }, [location.pathname]);

  return (
    <aside className="w-64 bg-white border-r border-slate-100 min-h-screen flex flex-col flex-shrink-0">
      {/* Brand */}
      <div className="px-6 pt-7 pb-6 border-b border-slate-100">
        <h1 className="text-xl font-bold text-blue-700 tracking-tight">MediFlow Clinic</h1>
        <p className="text-xs text-slate-400 mt-0.5 font-medium">Clinical Admin Panel</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {NAV_ITEMS.map((item) => {
          const isActive = active === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left ${
                isActive
                  ? "bg-blue-50 text-blue-700 border-l-4 border-blue-600 pl-2"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
              }`}
            >
              <span className={isActive ? "text-blue-600" : "text-slate-400"}>
                {item.icon}
              </span>
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="px-6 py-4 border-t border-slate-100">
        <button
          type="button"
          onClick={() => {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            navigate("/login");
          }}
          className="w-full flex text-white items-center gap-3 px-3 py-3 rounded-xl bg-red-500 text-sm font-semibold text-slate-700 hover:bg-red-600 transition"
        >
          <LogOut size={18} className="text-white " />
          Logout
        </button>
      </div>
    </aside>
  );
}