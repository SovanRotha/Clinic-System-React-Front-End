import PatientSidebar from "./PatientSidebar";
import { useState, useEffect } from "react";

const statusColors = {
    paid: {
        bg: "#EAF3DE",
        text: "#3B6D11",
        dot: "#639922",
        label: "Paid",
    },
    unpaid: {
        bg: "#FCEBEB",
        text: "#A32D2D",
        dot: "#E24B4A",
        label: "Unpaid",
    },
    pending: {
        bg: "#FAEEDA",
        text: "#854F0B",
        dot: "#BA7517",
        label: "Pending",
    },
};

const apptStatusColors = {
    completed: { bg: "#EAF3DE", text: "#3B6D11" },
    cancelled: { bg: "#FCEBEB", text: "#A32D2D" },
    scheduled: { bg: "#E6F1FB", text: "#185FA5" },
    pending: { bg: "#FAEEDA", text: "#854F0B" },
};

function Badge({ value, colorMap }) {
    const key = (value || "").toLowerCase();
    const style = colorMap[key] || { bg: "#F1EFE8", text: "#5F5E5A" };
    return (
        <span
            style={{
                background: style.bg,
                color: style.text,
                fontSize: "15px",
                fontWeight: 500,
                padding: "3px 10px",
                borderRadius: "20px",
                display: "inline-block",
                textTransform: "capitalize",
                letterSpacing: "0.01em",
            }}
        >
            {value || "—"}
        </span>
    );
}

function PaymentBadge({ status }) {
    const key = (status || "unpaid").toLowerCase();
    const s = statusColors[key] || statusColors.unpaid;
    return (
        <span
            style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                background: s.bg,
                color: s.text,
                fontSize: "15px",
                fontWeight: 500,
                padding: "4px 12px",
                borderRadius: "20px",
            }}
        >
            <span
                style={{
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    background: s.dot,
                    display: "inline-block",
                }}
            />
            {s.label}
        </span>
    );
}

function MetricCard({ label, value, accent }) {
    return (
        <div
            style={{
                background: accent ? "#042C53" : "var(--bg-secondary, #F8F9FB)",
                borderRadius: 12,
                padding: "14px 18px",
                display: "flex",
                flexDirection: "column",
                gap: 4,
            }}
        >
            <span
                style={{
                    fontSize: 13,
                    fontWeight: 500,
                    letterSpacing: "0.07em",
                    textTransform: "uppercase",
                    color: accent ? "#85B7EB" : "var(--text-muted, #888780)",
                }}
            >
                {label}
            </span>
            <span
                style={{
                    fontSize: 25,
                    fontWeight: 600,
                    color: accent ? "#fff" : "var(--text-primary, #2C2C2A)",
                    letterSpacing: "-0.02em",
                }}
            >
                {value}
            </span>
        </div>
    );
}

function BillCard({ bill }) {
    const appt = bill.appointment || {};
    const patient = bill.patient || {};

    const formatDate = (d) => {
        if (!d) return "—";
        return new Date(d).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    const formatTime = (t) => {
        if (!t) return "—";
        const [h, m] = t.split(":");
        const hour = parseInt(h, 10);
        return `${hour > 12 ? hour - 12 : hour}:${m} ${hour >= 12 ? "PM" : "AM"}`;
    };

    const fmt = (n) =>
        Number(n || 0).toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });

    return (
        <div
            style={{
                background: "#fff",
                border: "0.5px solid rgba(0,0,0,0.09)",
                borderRadius: 16,
                overflow: "hidden",
                marginBottom: 20,
            }}
        >
            {/* Card Header */}
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "16px 24px",
                    borderBottom: "0.5px solid rgba(0,0,0,0.07)",
                    background: "#FAFAFA",
                }}
            >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div
                        style={{
                            width: 36,
                            height: 36,
                            borderRadius: 10,
                            background: "#E6F1FB",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 17,
                        }}
                    >
                        🧾
                    </div>
                    <div>
                        <p
                            style={{
                                margin: 0,
                                fontSize: 17,
                                fontWeight: 600,
                                color: "#1a1a1a",
                                letterSpacing: "-0.01em",
                            }}
                        >
                            Invoice #{String(bill.id).padStart(4, "0")}
                        </p>
                        <p
                            style={{
                                margin: 0,
                                fontSize: 15,
                                color: "#888",
                            }}
                        >
                            Patient code: {patient.patient_code || "—"}
                        </p>
                    </div>
                </div>
                <PaymentBadge status={bill.payment_status} />
            </div>

            {/* Appointment Info Row */}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
                    gap: "0",
                    borderBottom: "0.5px solid rgba(0,0,0,0.07)",
                }}
            >
                {[
                    { icon: "📅", label: "Date", value: formatDate(appt.appointment_date) },
                    { icon: "🕐", label: "Time", value: formatTime(appt.appointment_time) },
                    { icon: "📋", label: "Reason", value: appt.reason || "—" },
                    { icon: "🔖", label: "Appt. Status", value: appt.status || "—", isStatus: true },
                ].map(({ icon, label, value, isStatus }, i) => (
                    <div
                        key={i}
                        style={{
                            padding: "14px 20px",
                            borderRight: i < 3 ? "0.5px solid rgba(0,0,0,0.06)" : "none",
                        }}
                    >
                        <p
                            style={{
                                margin: "0 0 4px",
                                fontSize: 13,
                                fontWeight: 500,
                                letterSpacing: "0.06em",
                                textTransform: "uppercase",
                                color: "#888",
                            }}
                        >
                            {icon} {label}
                        </p>
                        {isStatus ? (
                            <Badge value={value} colorMap={apptStatusColors} />
                        ) : (
                            <p
                                style={{
                                    margin: 0,
                                    fontSize: 15,
                                    fontWeight: 500,
                                    color: "#2C2C2A",
                                }}
                            >
                                {value}
                            </p>
                        )}
                    </div>
                ))}
            </div>

            {/* Fee Breakdown */}
            <div style={{ padding: "16px 24px" }}>
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(3, 1fr)",
                        gap: 10,
                    }}
                >
                    <MetricCard
                        label="Consultation"
                        value={`$${fmt(bill.consultation_fee)}`}
                    />
                    <MetricCard
                        label="Medicine"
                        value={`$${fmt(bill.medicine_fee)}`}
                    />
                    <MetricCard
                        label="Total"
                        value={`$${fmt(bill.total_amount)}`}
                        accent
                    />
                </div>
            </div>
        </div>
    );
}

function SkeletonCard() {
    return (
        <div
            style={{
                background: "#fff",
                border: "0.5px solid rgba(0,0,0,0.09)",
                borderRadius: 16,
                overflow: "hidden",
                marginBottom: 20,
            }}
        >
            <div
                style={{
                    padding: "16px 24px",
                    borderBottom: "0.5px solid rgba(0,0,0,0.07)",
                    background: "#FAFAFA",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                }}
            >
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                    <div
                        style={{
                            width: 36,
                            height: 36,
                            borderRadius: 10,
                            background: "#E8E8E8",
                            animation: "pulse 1.5s ease-in-out infinite",
                        }}
                    />
                    <div>
                        <div
                            style={{
                                width: 110,
                                height: 14,
                                borderRadius: 6,
                                background: "#E8E8E8",
                                marginBottom: 6,
                                animation: "pulse 1.5s ease-in-out infinite",
                            }}
                        />
                        <div
                            style={{
                                width: 80,
                                height: 11,
                                borderRadius: 6,
                                background: "#EFEFEF",
                                animation: "pulse 1.5s ease-in-out infinite",
                            }}
                        />
                    </div>
                </div>
                <div
                    style={{
                        width: 72,
                        height: 24,
                        borderRadius: 20,
                        background: "#E8E8E8",
                        animation: "pulse 1.5s ease-in-out infinite",
                    }}
                />
            </div>
            <div
                style={{
                    padding: "20px 24px",
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gap: 10,
                }}
            >
                {[0, 1, 2].map((i) => (
                    <div
                        key={i}
                        style={{
                            height: 66,
                            borderRadius: 12,
                            background: i === 2 ? "#D4E8F6" : "#EFEFEF",
                            animation: "pulse 1.5s ease-in-out infinite",
                        }}
                    />
                ))}
            </div>
            <style>{`
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.5; }
                }
            `}</style>
        </div>
    );
}

function PatientBill() {
    const [bills, setBills] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            setError("You are not logged in.");
            setLoading(false);
            return;
        }
        fetch("https://clinic-system-back-end.onrender.com/api/my-bills", {
            method: "GET",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        })
            .then((res) => {
                if (!res.ok) throw new Error(`API Error: ${res.status}`);
                return res.json();
            })
            .then((result) => {
                setBills(result.data || []);
                setLoading(false);
            })
            .catch(() => {
                setError("Failed to load bills. Please try again.");
                setLoading(false);
            });
    }, []);

    const paid = bills.filter(
        (b) => (b.payment_status || "").toLowerCase() === "paid"
    ).length;
    const unpaid = bills.length - paid;
    const totalOwed = bills
        .filter((b) => (b.payment_status || "").toLowerCase() !== "paid")
        .reduce((sum, b) => sum + Number(b.total_amount || 0), 0);

    return (
        <div style={{ display: "flex", minHeight: "100vh", background: "#F5F6FA" }}>
            <PatientSidebar />

            <div
                style={{
                    flex: 1,
                    padding: "36px 32px",
                    maxWidth: 860,
                    margin: "0 auto",
                    width: "100%",
                    marginLeft: 40
                }}
            >
                {/* Page Header */}
                <div style={{ marginBottom: 28 }}>
                    <h1
                        style={{
                            margin: "0 0 6px",
                            fontSize: 26,
                            fontWeight: 700,
                            color: "#1a1a1a",
                            letterSpacing: "-0.03em",
                        }}
                    >
                        Billing
                    </h1>
                    <p style={{ margin: 0, fontSize: 16, color: "#888" }}>
                        View and manage your medical invoices
                    </p>
                </div>

                {/* Summary Strip */}
                {!loading && !error && bills.length > 0 && (
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(3, 1fr)",
                            gap: 12,
                            marginBottom: 28,
                        }}
                    >
                        {[
                            { label: "Total Bills", value: bills.length },
                            { label: "Paid", value: paid },
                            {
                                label: "Amount Due",
                                value: `$${totalOwed.toLocaleString("en-US", {
                                    minimumFractionDigits: 2,
                                })}`,
                            },
                        ].map(({ label, value }, i) => (
                            <div
                                key={i}
                                style={{
                                    background: "#fff",
                                    border: "0.5px solid rgba(0,0,0,0.09)",
                                    borderRadius: 14,
                                    padding: "16px 20px",
                                }}
                            >
                                <p
                                    style={{
                                        margin: "0 0 4px",
                                        fontSize: 13,
                                        fontWeight: 500,
                                        letterSpacing: "0.07em",
                                        textTransform: "uppercase",
                                        color: "#999",
                                    }}
                                >
                                    {label}
                                </p>
                                <p
                                    style={{
                                        margin: 0,
                                        fontSize: 25,
                                        fontWeight: 700,
                                        color: "#1a1a1a",
                                        letterSpacing: "-0.03em",
                                    }}
                                >
                                    {value}
                                </p>
                            </div>
                        ))}
                    </div>
                )}

                {/* Error */}
                {error && (
                    <div
                        style={{
                            background: "#FCEBEB",
                            color: "#A32D2D",
                            borderRadius: 12,
                            padding: "14px 18px",
                            fontSize: 14,
                            fontWeight: 500,
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                            marginBottom: 20,
                        }}
                    >
                        ⚠️ {error}
                    </div>
                )}

                {/* Loading Skeletons */}
                {loading && (
                    <>
                        <SkeletonCard />
                        <SkeletonCard />
                    </>
                )}

                {/* Empty State */}
                {!loading && !error && bills.length === 0 && (
                    <div
                        style={{
                            background: "#fff",
                            border: "0.5px solid rgba(0,0,0,0.09)",
                            borderRadius: 16,
                            padding: "56px 32px",
                            textAlign: "center",
                        }}
                    >
                        <div style={{ fontSize: 40, marginBottom: 12 }}>🧾</div>
                        <p
                            style={{
                                margin: "0 0 6px",
                                fontSize: 16,
                                fontWeight: 600,
                                color: "#1a1a1a",
                            }}
                        >
                            No bills yet
                        </p>
                        <p style={{ margin: 0, fontSize: 13, color: "#999" }}>
                            Your billing history will appear here.
                        </p>
                    </div>
                )}

                {/* Bill Cards */}
                {!loading &&
                    !error &&
                    bills.map((bill) => (
                        <BillCard key={bill.id} bill={bill} />
                    ))}
            </div>
        </div>
    );
}

export default PatientBill;