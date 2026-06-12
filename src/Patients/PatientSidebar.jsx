import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  IconHeartPlus,
  IconMail,
  IconLock,
  IconEye,
  IconEyeOff,
  IconCheck,
} from "@tabler/icons-react";
import {
  LayoutDashboard,
  UserCircle,
  CalendarDays,
  FileText,
  Pill,
  CreditCard,
  Settings,
  LogOut,
  HeartPulse,
} from "lucide-react";

// `useNavigate` must be called inside a component (Hooks rule).
// We'll call it inside `PatientSidebar` below.

const menuItems = [
  {
    icon: LayoutDashboard,
    label: "Dashboard",
    id: "dashboard",
    path: "/patient",
  },
  {
    icon: UserCircle,
    label: "My Profile",
    id: "profile",
    path: "/patient/profile",
  },
  {
    icon: CalendarDays,
    label: "Appointments",
    id: "appointments",
    path: "/patient/appointments",
  },
  {
    icon: FileText,
    label: "Medical Records",
    id: "history",
    path: "/patient/history",
  },
  {
    icon: Pill,
    label: "Prescriptions",
    id: "prescriptions",
    path: "/patient/prescriptions",
  },
  {
    icon: CreditCard,
    label: "Billing",
    id: "billing",
    path : "/patient/bill",
  }
];


export default function PatientSidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const getActiveId = (pathname) => {
    if (pathname === "/patient" || pathname === "/patient/dashboard") {
      return "dashboard";
    }

    const match = menuItems.find((item) => item.path === pathname);
    return match ? match.id : "dashboard";
  };

  const [active, setActive] = useState(() => getActiveId(location.pathname));

  useEffect(() => {
    setActive(getActiveId(location.pathname));
  }, [location.pathname]);

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
    <aside
      style={{
        width: 290,
        minHeight: "100vh",
        background: "#F8FAFC",
        borderRight: "1px solid #E2E8F0",
        display: "flex",
        flexDirection: "column",
        padding: 20,
        boxSizing: "border-box",
        fontFamily: "Inter, sans-serif",
      }}
    >
      {/* Logo */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          marginBottom: 35,
        }}
      >
        <div
          style={{
            width: 58,
            height: 58,
            borderRadius: 18,
            background: "linear-gradient(135deg,#185FA5,#2D8CFF)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            boxShadow: "0 12px 25px rgba(24,95,165,.25)",
          }}
        >
          <HeartPulse size={28} />
        </div>

        <div>
          <h2
            style={{
              margin: 0,
              fontSize: 18,
              fontWeight: 700,
              color: "#0F172A",
            }}
          >
            CareConnect
          </h2>

          <span
            style={{
              fontSize: 12,
              color: "#64748B",
            }}
          >
            Patient Portal
          </span>
        </div>
      </div>

      {/* Main Menu */}
      <div style={{ marginBottom: 30 }}>
        <p
          style={{
            fontSize: 11,
            color: "#94A3B8",
            fontWeight: 700,
            marginBottom: 12,
            textTransform: "uppercase",
            letterSpacing: 1,
          }}
        >
          Main Menu
        </p>

        {menuItems.map(({ icon: Icon, label, id, path }) => {
          const isActive = active === id;

          return (
            <button
              key={id}
              onClick={() => {
                setActive(id);
                navigate(path);
              }}
              style={{
                width: "100%",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 14,
                padding: "14px 16px",
                marginBottom: 8,
                borderRadius: 16,
                background: isActive ? "#FFFFFF" : "transparent",
                color: isActive ? "#185FA5" : "#475569",
                boxShadow: isActive ? "0 10px 25px rgba(0,0,0,.05)" : "none",
                position: "relative",
                transition: ".2s",
              }}
            >
              {isActive && (
                <div
                  style={{
                    position: "absolute",
                    left: 0,
                    top: 10,
                    bottom: 10,
                    width: 4,
                    borderRadius: 999,
                    background: "#185FA5",
                  }}
                />
              )}

              <Icon size={20} />

              <span
                style={{
                  fontSize: 14,
                  fontWeight: isActive ? 600 : 500,
                }}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>

      <div style={{ flex: 1 }} />

      {/* User Card */}
      <div
        style={{
          background: "#FFFFFF",
          borderRadius: 20,
          padding: 16,
          boxShadow: "0 12px 30px rgba(0,0,0,.06)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: "50%",
              overflow: "hidden",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "linear-gradient(135deg,#185FA5,#2D8CFF)",
              color: "#fff",
              fontWeight: 700,
              fontSize: 18,
            }}
          >
            {user && (user.profile || user.avatar) ? (
              <img
                src={user.profile || user.avatar}
                alt={user.name || "avatar"}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              <div>
                {(user && user.name)
                  ? user.name
                      .split(" ")
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join("")
                      .toUpperCase()
                  : "JD"}
              </div>
            )}
          </div>

          <div>
            <div
              style={{
                fontWeight: 700,
                color: "#0F172A",
              }}
            >
              {user && user.name ? user.name : "Jane Doe"}
            </div>

            {user && (user.id || user.patient_id) ? (
              <div
                style={{
                  fontSize: 12,
                  color: "#64748B",
                }}
              >
                {user.patient_id ? `Patient ID #${user.patient_id}` : `ID #${user.id}`}
              </div>
            ) : null}
          </div>
        </div>

        <button
          onClick={() => {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            navigate("/");
          }}
          className="mt-4 w-full p-3 rounded-xl flex items-center justify-center gap-2
             bg-red-100 text-red-600 font-semibold
             hover:bg-red-500 hover:text-white transition-colors"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </aside>
  );
}
