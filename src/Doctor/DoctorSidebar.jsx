import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FaUserMd,
  FaUsers,
  FaCalendarAlt,
  FaFileMedical,
  FaPrescriptionBottleAlt,
  FaCog,
  FaSignOutAlt,
  FaTachometerAlt,
  FaPlus,
  FaNotesMedical,
} from "react-icons/fa";

const navItems = [
  {
    label: "Dashboard",
    icon: <FaTachometerAlt />,
    href: "/doctor",
  },
  {
    label: "My Appointments",
    icon: <FaCalendarAlt />,
    href: "/doctor/appointments",
  },
  {
    label: "Patients",
    icon: <FaUsers />,
    href: "/doctor/patients",
  },
  {
    label: "Consultations",
    icon: <FaNotesMedical />,
    href: "/doctor/consult",
  },
  {
    label: "Prescriptions",
    icon: <FaPrescriptionBottleAlt />,
    href: "/doctor/prescriptions",
  },
  {
    label: "My Profile",
    icon: <FaFileMedical />,
    href: "/doctor/profile",
  },
];

const BLUE = "#1a3bcc";

function NavItem({ item, active, onClick }) {
  const isActive = active === item.href;

  return (
    <a
      href={item.href}
      onClick={(e) => {
        e.preventDefault();
        onClick(item.href);
      }}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "11px 12px",
        borderRadius: 10,
        marginBottom: 4,
        textDecoration: "none",
        background: isActive ? BLUE : "transparent",
        transition: "all 0.2s ease",
      }}
    >
      <div
        style={{
          fontSize: 17,
          color: isActive ? "#fff" : "#64748B",
          display: "flex",
          alignItems: "center",
        }}
      >
        {item.icon}
      </div>

      <span
        style={{
          fontSize: 14,
          color: isActive ? "#fff" : "#334155",
          fontWeight: isActive ? 600 : 500,
        }}
      >
        {item.label}
      </span>
    </a>
  );
}

function FooterLink({ href, icon, label, danger }) {
  return (
    <a
      href={href}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "10px 12px",
        borderRadius: 10,
        textDecoration: "none",
        marginBottom: 4,
      }}
    >
      <div
        style={{
          fontSize: 16,
          color: danger ? "#DC2626" : "#64748B",
        }}
      >
        {icon}
      </div>

      <span
        style={{
          fontSize: 14,
          color: danger ? "#DC2626" : "#334155",
        }}
      >
        {label}
      </span>
    </a>
  );
}

export default function DoctorSidebar() {

    const navigate = useNavigate();
    const location = useLocation();

 const getActiveId = (pathname) => {
     const match = navItems.find((item) => item.href === pathname);
     return match ? match.href : "/doctor/dashboard";
   };
 
   const [active, setActive] = useState(() => getActiveId(location.pathname));
 
   useEffect(() => {
     setActive(getActiveId(location.pathname));
   }, [location.pathname]);

   
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
    <div
      style={{
        width: 250,
        minHeight: "100vh",
        background: "#F8FAFF",
        borderRight: "1px solid #E2E8F0",
        display: "flex",
        flexDirection: "column",
        fontFamily: "Inter, sans-serif",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "20px",
          borderBottom: "1px solid #E2E8F0",
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
              width: 42,
              height: 42,
              borderRadius: 10,
              background: BLUE,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <FaUserMd color="white" size={18} />
          </div>

          <div>
            <div
              style={{
                fontWeight: 700,
                color: BLUE,
                fontSize: 16,
              }}
            >
              Clinic Pro
            </div>

            <div
              style={{
                fontSize: 12,
                color: "#64748B",
              }}
            >
              Medical Center
            </div>
          </div>
        </div>
      </div>

      {/* Menu */}
      <div
        style={{
          flex: 1,
          padding: "15px 10px",
        }}
      >
        {navItems.map((item) => (
          <NavItem
            key={item.href}
            item={item}
            active={active}
            onClick={(href) => {
              setActive(href);
              navigate(href);
            }}
          />
        ))}
      </div>

      {/* Footer */}
      <div
        style={{
          padding: "15px 10px",
          borderTop: "1px solid #E2E8F0",
        }}
      >
        <button
          style={{
            width: "100%",
            background: BLUE,
            border: "none",
            color: "white",
            padding: "12px",
            borderRadius: 10,
            cursor: "pointer",
            fontWeight: 600,
            marginBottom: 12,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
          }}
        >
          <FaPlus />
          New Consultation
        </button>

        <FooterLink
          href="/settings"
          icon={<FaCog />}
          label="Settings"
        />

        <FooterLink
          href="/logout"
          icon={<FaSignOutAlt />}
          label="Logout"
          danger
        />
      </div>
    </div>
  );
}