import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  IconHeartPlus,
  IconMail,
  IconLock,
  IconEye,
  IconEyeOff,
  IconCheck,
} from "@tabler/icons-react";
import { normalizeUser } from "../utils/auth";

export default function Login() {
  const navigate = useNavigate();

  const API_BASE = "https://clinic-system-back-end.onrender.com";

  const normalizeImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    const trimmed = url.replace(/^\/+/, "");
    if (trimmed.startsWith("storage/")) {
      return `${API_BASE}/${trimmed}`;
    }
    return `${API_BASE}/storage/${trimmed}`;
  };

  const fetchCurrentUser = async (token) => {
    const endpoints = [
      "/api/user",
      "/api/me",
      "/api/profile",
    ];

    for (const endpoint of endpoints) {
      try {
        const response = await fetch(`${API_BASE}${endpoint}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });

        if (!response.ok) continue;

        const json = await response.json();
        const returnedUser = json.user || json.user_data || (json.data && json.data.user) || json;
        if (returnedUser) {
          return returnedUser;
        }
      } catch (err) {
        continue;
      }
    }

    return null;
  };

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");


  const redirectByRole = (role) => {
    const normalizedRole = String(role || "").trim().toLowerCase();
    switch (normalizedRole) {
      case "admin":
        return navigate("/admin");
      case "doctor":
        return navigate("/doctor");
      case "receptionist":
        return navigate("/receptionist");
      case "patient":
        return navigate("/patient");
      default:
        return navigate("/");
    }
  };

  const handleLogin = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        "https://clinic-system-back-end.onrender.com/api/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      const data = await response.json();

      if (data.token) {
        localStorage.setItem("token", data.token);

        const fetchedUser = await fetchCurrentUser(data.token);
        if (fetchedUser) {
          const normalizedUser = normalizeUser(fetchedUser, data.role || "patient");
          if (normalizedUser.profile) normalizedUser.profile = normalizeImageUrl(normalizedUser.profile);
          if (normalizedUser.avatar) normalizedUser.avatar = normalizeImageUrl(normalizedUser.avatar);
          localStorage.setItem("user", JSON.stringify(normalizedUser));
          redirectByRole(normalizedUser.role);
          setLoading(false);
          return;
        }

        // fallback: use user included in login response (if any)
        const returnedUser = data.user || data.user_data || (data.data && data.data.user) || (data.data && typeof data.data === 'object' ? data.data : null) || (data.role ? { role: data.role } : null);
        const user = normalizeUser(returnedUser || { role: data.role || "patient" }, data.role || "patient");
        if (user) {
          if (user.profile) user.profile = normalizeImageUrl(user.profile);
          if (user.avatar) user.avatar = normalizeImageUrl(user.avatar);
        }
        localStorage.setItem("user", JSON.stringify(user));
        redirectByRole(user.role);
      } else {
        setError(data.message || "Invalid credentials");
      }
    } catch {
      setError("Unable to connect to server");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: "100%",
    height: 52,
    borderRadius: 12,
    border: "1px solid #dbe4f0",
    paddingLeft: 44,
    paddingRight: 44,
    fontSize: 14,
    outline: "none",
    boxSizing: "border-box",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        gridTemplateColumns: "1fr 480px",
        fontFamily: "Inter, sans-serif",
      }}
    >
      {/* LEFT SIDE */}
      <div
        style={{
          background:
            "linear-gradient(135deg,#0C447C,#185FA5,#2D8CFF)",
          color: "white",
          padding: 80,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: 20,
            background: "rgba(255,255,255,.15)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 30,
          }}
        >
          <IconHeartPlus size={42} />
        </div>

        <h1
          style={{
            fontSize: 54,
            marginBottom: 16,
          }}
        >
          CareConnect
        </h1>

        <p
          style={{
            fontSize: 20,
            maxWidth: 550,
            lineHeight: 1.8,
            opacity: 0.95,
          }}
        >
          Access your appointments, prescriptions,
          medical records, and healthcare services
          securely from one place.
        </p>

        <div
          style={{
            marginTop: 40,
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          <div style={{ display: "flex", gap: 10 }}>
            <IconCheck /> Book appointments online
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <IconCheck /> View medical history
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <IconCheck /> Manage prescriptions
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <IconCheck /> Secure patient data
          </div>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div
        style={{
          background: "#f8fafc",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: 40,
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 420,
            background: "white",
            borderRadius: 24,
            padding: 40,
            boxShadow:
              "0 20px 60px rgba(0,0,0,.1)",
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: 30,
              color: "#0f172a",
            }}
          >
            Welcome Back
          </h2>

          <p
            style={{
              color: "#64748b",
              marginTop: 8,
              marginBottom: 24,
            }}
          >
            Sign in to your account
          </p>

          <div
            style={{
              width: 60,
              height: 4,
              background: "#185FA5",
              borderRadius: 999,
              marginBottom: 24,
            }}
          />

          {/* Email */}
          <div style={{ marginBottom: 18 }}>
            <label
              style={{
                display: "block",
                marginBottom: 6,
                fontSize: 13,
                color: "#475569",
              }}
            >
              Email Address
            </label>

            <div style={{ position: "relative" }}>
              <IconMail
                size={18}
                style={{
                  position: "absolute",
                  left: 14,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#94a3b8",
                }}
              />

              <input
                type="email"
                value={email}
                placeholder="john@example.com"
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                style={inputStyle}
              />
            </div>
          </div>

          {/* Password */}
          <div style={{ marginBottom: 20 }}>
            <label
              style={{
                display: "block",
                marginBottom: 6,
                fontSize: 13,
                color: "#475569",
              }}
            >
              Password
            </label>

            <div style={{ position: "relative" }}>
              <IconLock
                size={18}
                style={{
                  position: "absolute",
                  left: 14,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#94a3b8",
                }}
              />

              <input
                type={
                  showPassword ? "text" : "password"
                }
                value={password}
                placeholder="Enter password"
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                style={inputStyle}
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(!showPassword)
                }
                style={{
                  position: "absolute",
                  right: 14,
                  top: "50%",
                  transform: "translateY(-50%)",
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                }}
              >
                {showPassword ? (
                  <IconEyeOff size={18} />
                ) : (
                  <IconEye size={18} />
                )}
              </button>
            </div>
          </div>

          {error && (
            <div
              style={{
                background: "#fee2e2",
                color: "#dc2626",
                padding: 12,
                borderRadius: 10,
                marginBottom: 16,
              }}
            >
              {error}
            </div>
          )}

          <button
            onClick={handleLogin}
            disabled={loading}
            style={{
              width: "100%",
              height: 54,
              border: "none",
              borderRadius: 12,
              background:
                "linear-gradient(135deg,#185FA5,#2D8CFF)",
              color: "white",
              fontWeight: 600,
              cursor: "pointer",
              fontSize: 15,
            }}
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>

          <p
            style={{
              textAlign: "center",
              marginTop: 20,
              color: "#64748b",
            }}
          >
            Don't have an account?{" "}
            <span
              onClick={() =>
                navigate("/register")
              }
              style={{
                color: "#185FA5",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Register
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}