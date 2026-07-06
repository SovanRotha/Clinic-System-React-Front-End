import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

function EditBill() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [bill, setBill] = useState({
        patient_id: "",
        appointment_id: "",
        consultation_fee: "",
        medicine_fee: "",
        total_amount: "",
        payment_status: "unpaid",
    });

    const fetchBill = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                throw new Error("Authentication token missing");
            }

            const response = await fetch(`https://clinic-system-back-end.onrender.com/api/bill/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json",
                },
            });

            if (!response.ok) {
                throw new Error("Failed to load bill");
            }

            const data = await response.json().catch(() => ({}));
            const billData = data.data || {};
            const consultFee = parseFloat(billData.consultation_fee) || 0;
            const medicineFee = parseFloat(billData.medicine_fee) || 0;
            setBill({
                patient_id: billData.patient_id || "",
                appointment_id: billData.appointment_id || "",
                consultation_fee: consultFee,
                medicine_fee: medicineFee,
                total_amount: consultFee + medicineFee,
                payment_status: (billData.payment_status || "unpaid").toLowerCase(),
            });
        } catch (error) {
            console.error("Error fetching bill:", error);
            alert(error.message || "Failed to load bill");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBill();
    }, [id]);

    const handleFeeChange = (e) => {
        const { name, value } = e.target;
        setBill((prev) => {
            const updated = { ...prev, [name]: parseFloat(value) || 0 };
            updated.total_amount =
                (name === "consultation_fee" ? parseFloat(value) || 0 : prev.consultation_fee) +
                (name === "medicine_fee" ? parseFloat(value) || 0 : prev.medicine_fee);
            return updated;
        });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setBill((prev) => ({ ...prev, [name]: value }));
    };

    const setStatus = (status) => {
        setBill((prev) => ({ ...prev, payment_status: status }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`https://clinic-system-back-end.onrender.com/api/bill/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(bill),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to update bill");
            }
            navigate("/admin/bill");
        } catch (error) {
            console.error("Error updating bill:", error);
            alert(error.message);
        } finally {
            setSaving(false);
        }
    };

    const isPaid = bill.payment_status === "paid";

    if (loading) {
        return (
            <div style={styles.page}>
                <div style={styles.loadingWrap}>
                    <div style={styles.spinner} />
                    <span style={styles.loadingText}>Loading bill…</span>
                </div>
            </div>
        );
    }

    return (
        <div style={styles.page}>
            <div style={styles.container}>

                {/* Header */}
                <div style={styles.header}>
                    <button style={styles.backBtn} onClick={() => navigate("/admin/bill")}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M19 12H5M12 5l-7 7 7 7" />
                        </svg>
                        Bills
                    </button>
                    <div style={styles.headerRight}>
                        <div>
                            <h1 style={styles.pageTitle}>Edit Bill</h1>
                            <p style={styles.pageSubtitle}>Bill #{id} · Update details below</p>
                        </div>
                        <span style={{ ...styles.statusPill, ...(isPaid ? styles.pillPaid : styles.pillUnpaid) }}>
                            {isPaid ? "Paid" : "Unpaid"}
                        </span>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    {/* Section: Patient & Appointment */}
                    <div style={styles.card}>
                        <p style={styles.sectionLabel}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 6, verticalAlign: -2 }}>
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                            </svg>
                            Patient &amp; appointment
                        </p>
                        <div style={styles.grid2}>
                            <div style={styles.field}>
                                <label style={styles.label}>Patient ID</label>
                                <input
                                    style={styles.input}
                                    type="text"
                                    name="patient_id"
                                    value={bill.patient_id}
                                    onChange={handleInputChange}
                                    placeholder="e.g. P-00412"
                                    onFocus={e => Object.assign(e.target.style, styles.inputFocus)}
                                    onBlur={e => Object.assign(e.target.style, { borderColor: "#E2E8F0", boxShadow: "none" })}
                                />
                            </div>
                            <div style={styles.field}>
                                <label style={styles.label}>Appointment ID</label>
                                <input
                                    style={styles.input}
                                    type="text"
                                    name="appointment_id"
                                    value={bill.appointment_id}
                                    onChange={handleInputChange}
                                    placeholder="e.g. APT-8821"
                                    onFocus={e => Object.assign(e.target.style, styles.inputFocus)}
                                    onBlur={e => Object.assign(e.target.style, { borderColor: "#E2E8F0", boxShadow: "none" })}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Section: Fees */}
                    <div style={{ ...styles.card, marginTop: 16 }}>
                        <p style={styles.sectionLabel}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 6, verticalAlign: -2 }}>
                                <rect x="2" y="5" width="20" height="14" rx="2" /><line x1="2" y1="10" x2="22" y2="10" />
                            </svg>
                            Fee breakdown
                        </p>
                        <div style={styles.grid2}>
                            <div style={styles.field}>
                                <label style={styles.label}>Consultation fee</label>
                                <div style={styles.inputWrap}>
                                    <span style={styles.inputPrefix}>$</span>
                                    <input
                                        style={{ ...styles.input, paddingLeft: 32 }}
                                        type="number"
                                        name="consultation_fee"
                                        value={bill.consultation_fee}
                                        onChange={handleFeeChange}
                                        min="0"
                                        step="0.01"
                                        placeholder="0.00"
                                        onFocus={e => Object.assign(e.target.style, styles.inputFocus)}
                                        onBlur={e => Object.assign(e.target.style, { borderColor: "#E2E8F0", boxShadow: "none" })}
                                    />
                                </div>
                            </div>
                            <div style={styles.field}>
                                <label style={styles.label}>Medication fee</label>
                                <div style={styles.inputWrap}>
                                    <span style={styles.inputPrefix}>$</span>
                                    <input
                                        style={{ ...styles.input, paddingLeft: 32 }}
                                        type="number"
                                        name="medicine_fee"
                                        value={bill.medicine_fee}
                                        onChange={handleFeeChange}
                                        min="0"
                                        step="0.01"
                                        placeholder="0.00"
                                        onFocus={e => Object.assign(e.target.style, styles.inputFocus)}
                                        onBlur={e => Object.assign(e.target.style, { borderColor: "#E2E8F0", boxShadow: "none" })}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Fee summary rows */}
                        <div style={styles.feeSummary}>
                            <div style={styles.feeRow}>
                                <span style={styles.feeRowLabel}>Consultation</span>
                                <span style={styles.feeRowValue}>${parseFloat(bill.consultation_fee || 0).toFixed(2)}</span>
                            </div>
                            <div style={styles.feeRow}>
                                <span style={styles.feeRowLabel}>Medication</span>
                                <span style={styles.feeRowValue}>${parseFloat(bill.medicine_fee || 0).toFixed(2)}</span>
                            </div>
                            <div style={styles.feeDivider} />
                            <div style={{ ...styles.feeRow, ...styles.feeTotal }}>
                                <span>Total amount</span>
                                <span>${parseFloat(bill.total_amount || 0).toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Section: Payment Status */}
                    <div style={{ ...styles.card, marginTop: 16 }}>
                        <p style={styles.sectionLabel}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 6, verticalAlign: -2 }}>
                                <polyline points="20 6 9 17 4 12" />
                            </svg>
                            Payment status
                        </p>
                        <div style={styles.statusToggle}>
                            <button
                                type="button"
                                style={{ ...styles.statusBtn, ...(bill.payment_status === "unpaid" ? styles.statusBtnUnpaidActive : styles.statusBtnInactive) }}
                                onClick={() => setStatus("unpaid")}
                            >
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                                </svg>
                                Unpaid
                            </button>
                            <button
                                type="button"
                                style={{ ...styles.statusBtn, ...(bill.payment_status === "paid" ? styles.statusBtnPaidActive : styles.statusBtnInactive) }}
                                onClick={() => setStatus("paid")}
                            >
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
                                </svg>
                                Paid
                            </button>
                        </div>
                        <p style={styles.statusHint}>
                            {isPaid
                                ? "This bill has been marked as paid. The patient's record will reflect this."
                                : "This bill is pending payment. Update once payment is received."}
                        </p>
                    </div>

                    {/* Actions */}
                    <div style={styles.actions}>
                        <button
                            type="button"
                            style={styles.cancelBtn}
                            onClick={() => navigate("/admin/bill")}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            style={{ ...styles.saveBtn, opacity: saving ? 0.7 : 1 }}
                            disabled={saving}
                        >
                            {saving ? (
                                <>
                                    <div style={styles.btnSpinner} /> Saving…
                                </>
                            ) : (
                                <>
                                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" />
                                    </svg>
                                    Save changes
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

const styles = {
    page: {
        minHeight: "100vh",
        background: "#F4F7FC",
        padding: "32px 16px",
        boxSizing: "border-box",
    },
    container: {
        maxWidth: 680,
        margin: "0 auto",
    },
    loadingWrap: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "60vh",
        gap: 12,
    },
    spinner: {
        width: 28,
        height: 28,
        border: "2.5px solid #E2E8F0",
        borderTop: "2.5px solid #3B82F6",
        borderRadius: "50%",
        animation: "spin 0.75s linear infinite",
    },
    loadingText: {
        fontSize: 14,
        color: "#94A3B8",
    },
    header: {
        marginBottom: 24,
    },
    backBtn: {
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        background: "none",
        border: "none",
        padding: "4px 0",
        fontSize: 13,
        color: "#64748B",
        cursor: "pointer",
        marginBottom: 12,
        fontFamily: "inherit",
    },
    headerRight: {
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: 12,
    },
    pageTitle: {
        fontSize: 22,
        fontWeight: 600,
        color: "#0F172A",
        margin: "0 0 4px",
    },
    pageSubtitle: {
        fontSize: 13,
        color: "#94A3B8",
        margin: 0,
    },
    statusPill: {
        display: "inline-block",
        fontSize: 12,
        fontWeight: 500,
        padding: "4px 12px",
        borderRadius: 20,
        flexShrink: 0,
        marginTop: 4,
    },
    pillPaid: {
        background: "#DCFCE7",
        color: "#16A34A",
    },
    pillUnpaid: {
        background: "#FEF9C3",
        color: "#A16207",
    },
    card: {
        background: "#FFFFFF",
        border: "1px solid #E2E8F0",
        borderRadius: 12,
        padding: "20px 24px",
    },
    sectionLabel: {
        fontSize: 11,
        fontWeight: 600,
        color: "#94A3B8",
        textTransform: "uppercase",
        letterSpacing: "0.07em",
        margin: "0 0 16px",
        display: "flex",
        alignItems: "center",
    },
    grid2: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 16,
    },
    field: {
        display: "flex",
        flexDirection: "column",
        gap: 6,
    },
    label: {
        fontSize: 13,
        fontWeight: 500,
        color: "#374151",
    },
    inputWrap: {
        position: "relative",
    },
    inputPrefix: {
        position: "absolute",
        left: 12,
        top: "50%",
        transform: "translateY(-50%)",
        fontSize: 14,
        color: "#94A3B8",
        pointerEvents: "none",
        userSelect: "none",
    },
    input: {
        width: "100%",
        boxSizing: "border-box",
        border: "1px solid #E2E8F0",
        borderRadius: 8,
        padding: "9px 12px",
        fontSize: 14,
        color: "#0F172A",
        background: "#F8FAFC",
        fontFamily: "inherit",
        outline: "none",
        transition: "border-color 0.15s, box-shadow 0.15s",
    },
    inputFocus: {
        borderColor: "#3B82F6",
        boxShadow: "0 0 0 3px rgba(59,130,246,0.12)",
    },
    feeSummary: {
        background: "#F8FAFC",
        border: "1px solid #E2E8F0",
        borderRadius: 8,
        padding: "12px 16px",
        marginTop: 20,
    },
    feeRow: {
        display: "flex",
        justifyContent: "space-between",
        fontSize: 13,
        color: "#64748B",
        padding: "4px 0",
    },
    feeRowLabel: {
        color: "#64748B",
    },
    feeRowValue: {
        color: "#374151",
        fontVariantNumeric: "tabular-nums",
    },
    feeDivider: {
        borderTop: "1px dashed #E2E8F0",
        margin: "8px 0",
    },
    feeTotal: {
        fontSize: 15,
        fontWeight: 600,
        color: "#0F172A",
        paddingTop: 4,
    },
    statusToggle: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 10,
        marginBottom: 12,
    },
    statusBtn: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        padding: "11px 16px",
        borderRadius: 8,
        fontSize: 14,
        fontWeight: 500,
        cursor: "pointer",
        fontFamily: "inherit",
        transition: "all 0.15s",
        border: "1.5px solid",
    },
    statusBtnInactive: {
        background: "#F8FAFC",
        borderColor: "#E2E8F0",
        color: "#94A3B8",
    },
    statusBtnUnpaidActive: {
        background: "#FEFCE8",
        borderColor: "#FDE047",
        color: "#A16207",
    },
    statusBtnPaidActive: {
        background: "#F0FDF4",
        borderColor: "#86EFAC",
        color: "#16A34A",
    },
    statusHint: {
        fontSize: 12,
        color: "#94A3B8",
        margin: 0,
        lineHeight: 1.5,
    },
    actions: {
        display: "flex",
        justifyContent: "flex-end",
        gap: 10,
        marginTop: 20,
    },
    cancelBtn: {
        padding: "10px 20px",
        borderRadius: 8,
        border: "1px solid #E2E8F0",
        background: "#FFFFFF",
        color: "#374151",
        fontSize: 14,
        fontWeight: 500,
        cursor: "pointer",
        fontFamily: "inherit",
    },
    saveBtn: {
        display: "flex",
        alignItems: "center",
        gap: 7,
        padding: "10px 22px",
        borderRadius: 8,
        border: "none",
        background: "#2563EB",
        color: "#FFFFFF",
        fontSize: 14,
        fontWeight: 500,
        cursor: "pointer",
        fontFamily: "inherit",
        transition: "background 0.15s",
    },
    btnSpinner: {
        width: 14,
        height: 14,
        border: "2px solid rgba(255,255,255,0.35)",
        borderTop: "2px solid #fff",
        borderRadius: "50%",
        animation: "spin 0.75s linear infinite",
    },
};

export default EditBill;