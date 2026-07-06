import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  IconHeartPlus,
  IconUser,
  IconMail,
  IconPhone,
  IconLock,
  IconEye,
  IconEyeOff,
  IconCheck,
} from "@tabler/icons-react";

const BLUE = "#185FA5";

function Field({
  label,
  icon: Icon,
  type = "text",
  value,
  onChange,
  placeholder,
  onKeyDown,
}) {
  return (
    <div style={{ marginBottom: 18 }}>
      <label
        style={{
          display: "block",
          marginBottom: 6,
          fontSize: 13,
          fontWeight: 500,
          color: "#475569",
        }}
      >
        {label}
      </label>

      <div style={{ position: "relative" }}>
        <Icon
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
          type={type}
          value={value}
          onChange={onChange}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          style={{
            width: "100%",
            height: "52px",
            padding: "0 16px 0 44px",
            borderRadius: "12px",
            border: "1px solid #dbe4f0",
            outline: "none",
            fontSize: "14px",
            boxSizing: "border-box",
          }}
        />
      </div>
    </div>
  );
}

export default function Register() {
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

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone_number, setPhone_number] = useState("");
  const [password, setPassword] = useState("");
  const [profileImage, setProfileImage] = useState(null);
  const [profilePreview, setProfilePreview] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState("patient");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const validate = () => {
    if (!name.trim()) return "Please enter your full name.";
    if (!email.trim() || !email.includes("@"))
      return "Please enter a valid email address.";
    if (!phone_number.trim()) return "Please enter your phone number.";
    if (password.length < 8) return "Password must be at least 8 characters.";
    return null;
  };

  const redirectByRole = (role) => {
    switch (role) {
      case "admin":
        return navigate("/admin");
      case "doctor":
        return navigate("/doctor");
      case "receptionist":
        return navigate("/receptionist");
      case "patient":
      default:
        return navigate("/patient");
    }
  };

  const handleRegister = async () => {
    const validationError = validate();

    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError("");

    try {
      let res;

      if (profileImage) {
        const form = new FormData();
        form.append("name", name);
        form.append("email", email);
        form.append("phone_number", phone_number);
        form.append("password", password);
        form.append("role", role);
        form.append("profile", profileImage);

        res = await fetch(`${API_BASE}/api/register`, {
          method: "POST",
          headers: {
            Accept: "application/json",
          },
          body: form,
        });
      } else {
        res = await fetch(`${API_BASE}/api/register`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            name,
            email,
            phone_number,
            password,
            role,
          }),
        });
      }

      let data;
      try {
        data = await res.json();
      } catch (jsonError) {
        const text = await res.text();
        console.error("Registration response parse error:", jsonError, text);
        setError(`Server returned invalid JSON (${res.status})`);
        return;
      }

      console.log("Register response:", res.status, data);

      if (!res.ok) {
        const firstError = data.errors
          ? Object.values(data.errors)[0][0]
          : data.message || data.error || res.statusText;

        setError(firstError || `Registration failed (${res.status}).`);
        return;
      }

      const token = data.token || data.access_token || data.data?.token || data.data?.access_token;
      const returnedUser = data.user || data.user_data || (data.data && data.data.user) || (data.data && typeof data.data === 'object' ? data.data : null);

      if (returnedUser) {
        if (returnedUser.profile) returnedUser.profile = normalizeImageUrl(returnedUser.profile);
        if (returnedUser.avatar) returnedUser.avatar = normalizeImageUrl(returnedUser.avatar);
      }

      if (token) {
        localStorage.setItem("token", token);

        const fetchedUser = await fetchCurrentUser(token);
        if (fetchedUser) {
          if (fetchedUser.profile) fetchedUser.profile = normalizeImageUrl(fetchedUser.profile);
          if (fetchedUser.avatar) fetchedUser.avatar = normalizeImageUrl(fetchedUser.avatar);
          localStorage.setItem("user", JSON.stringify(fetchedUser));
          redirectByRole(fetchedUser.role || role);
          setLoading(false);
          return;
        }

        // fallback: save any returned user from register response
        if (returnedUser) {
          if (returnedUser.profile) returnedUser.profile = normalizeImageUrl(returnedUser.profile);
          if (returnedUser.avatar) returnedUser.avatar = normalizeImageUrl(returnedUser.avatar);
          localStorage.setItem("user", JSON.stringify(returnedUser));
        }

        redirectByRole(role);
      } else {
        // If no token but we have user info, save it so login can prefill or sidebar can show
        if (returnedUser) localStorage.setItem("user", JSON.stringify(returnedUser));
        navigate("/");
      }
    } catch (err) {
      console.error(err);
      setError("Could not connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleRegister();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleRegister();
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        gridTemplateColumns: "1fr 520px",
        fontFamily: "Inter, sans-serif",
      }}
    >
      {/* Left */}
      <div
        style={{
          background:
            "linear-gradient(135deg, #0C447C 0%, #185FA5 50%, #2D8CFF 100%)",
          color: "#fff",
          padding: "80px",
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

        <h1 style={{ fontSize: 52, marginBottom: 16 }}>CareConnect</h1>

        <p
          style={{
            fontSize: 20,
            lineHeight: 1.8,
            maxWidth: 550,
          }}
        >
          Manage appointments, prescriptions, medical records, and healthcare
          services from one secure patient portal.
        </p>

        <div
          style={{
            marginTop: 40,
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          {[
            "Book appointments online",
            "Access medical history",
            "View prescriptions instantly",
            "Secure patient information",
          ].map((item) => (
            <div
              key={item}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              <IconCheck size={20} />
              {item}
            </div>
          ))}
        </div>
      </div>

      {/* Right */}
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
            maxWidth: 460,
            background: "#fff",
            borderRadius: 24,
            padding: 40,
            boxShadow: "0 20px 60px rgba(0,0,0,.12)",
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: 30,
              fontWeight: 700,
            }}
          >
            Create Account
          </h2>

          <p
            style={{
              marginTop: 8,
              marginBottom: 24,
              color: "#64748b",
            }}
          >
            Join CareConnect and manage your healthcare online.
          </p>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 24 }}>
              <label
                style={{
                  display: "block",
                  marginBottom: 12,
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#475569",
                }}
              >
                Profile Picture
              </label>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <div
                  style={{
                    position: "relative",
                    width: 110,
                    height: 110,
                  }}
                >
                  <div
                    style={{
                      width: "100%",
                      height: "100%",
                      borderRadius: "50%",
                      overflow: "hidden",
                      border: "4px solid #E2E8F0",
                      background: "#F8FAFC",
                      boxShadow: "0 8px 25px rgba(0,0,0,.08)",
                    }}
                  >
                    {profilePreview ? (
                      <img
                        src={profilePreview}
                        alt="Profile"
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: "100%",
                          height: "100%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 36,
                          fontWeight: 700,
                          color: "#94A3B8",
                        }}
                      >
                        👤
                      </div>
                    )}
                  </div>

                  <label
                    htmlFor="profile-upload"
                    style={{
                      position: "absolute",
                      bottom: 0,
                      right: 0,
                      width: 34,
                      height: 34,
                      borderRadius: "50%",
                      background: "#185FA5",
                      color: "#fff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      fontSize: 18,
                      boxShadow: "0 4px 12px rgba(24,95,165,.3)",
                    }}
                  >
                    +
                  </label>

                  <input
                    id="profile-upload"
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={(e) => {
                      const file = e.target.files?.[0];

                      if (file) {
                        setProfileImage(file);
                        setProfilePreview(URL.createObjectURL(file));
                      }
                    }}
                  />
                </div>

                <div
                  style={{
                    fontSize: 13,
                    color: "#64748B",
                    textAlign: "center",
                  }}
                >
                  Upload a profile photo
                  <br />
                  JPG, PNG up to 2MB
                </div>

                {profilePreview && (
                  <button
                    type="button"
                    onClick={() => {
                      setProfileImage(null);
                      URL.revokeObjectURL(profilePreview);
                      setProfilePreview(null);
                    }}
                    style={{
                      border: "none",
                      background: "#FEE2E2",
                      color: "#DC2626",
                      padding: "8px 14px",
                      borderRadius: 10,
                      cursor: "pointer",
                      fontWeight: 600,
                      fontSize: 13,
                    }}
                  >
                    Remove Photo
                  </button>
                )}
              </div>
            </div>
            <Field
              label="Full Name"
              icon={IconUser}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              onKeyDown={handleKeyDown}
            />

            <Field
              label="Email Address"
              icon={IconMail}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="john@example.com"
              onKeyDown={handleKeyDown}
            />

            <Field
              label="Phone Number"
              icon={IconPhone}
              value={phone_number}
              onChange={(e) => setPhone_number(e.target.value)}
              placeholder="+855 12 345 678"
              onKeyDown={handleKeyDown}
            />

            <div style={{ marginBottom: 18 }}>
              <label
                style={{
                  display: "block",
                  marginBottom: 6,
                  fontSize: 13,
                  fontWeight: 500,
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
                  type={showPassword ? "text" : "password"}
                  value={password}
                  placeholder="Minimum 8 characters"
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    width: "100%",
                    height: "52px",
                    padding: "0 50px 0 44px",
                    borderRadius: "12px",
                    border: "1px solid #dbe4f0",
                    outline: "none",
                    fontSize: "14px",
                    boxSizing: "border-box",
                  }}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
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
                  marginBottom: 18,
                }}
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                height: 54,
                border: "none",
                borderRadius: 12,
                background: "linear-gradient(135deg,#185FA5,#2D8CFF)",
                color: "#fff",
                fontWeight: 600,
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          <p
            style={{
              textAlign: "center",
              marginTop: 24,
              color: "#64748b",
            }}
          >
            Already have an account?{" "}
            <span
              onClick={() => navigate("/")}
              style={{
                color: BLUE,
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              Sign In
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
