import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { validate, hasErrors } from "../utils/validation";
import { authApi } from "../utils/api";
import "./ForgotPassword.css";

function ForgotPassword() {
    const [step,       setStep]       = useState(1);
    const [email,      setEmail]      = useState("");
    const [form,       setForm]       = useState({ newPassword: "", confirmPassword: "" });
    const [errors,     setErrors]     = useState({});
    const [message,    setMessage]    = useState("");
    const [apiErr,     setApiErr]     = useState("");
    const [submitting, setSubmitting] = useState(false);
    const navigate = useNavigate();

    function handleEmailChange(e) {
        setEmail(e.target.value);
        setErrors({});
        setApiErr("");
    }

    function handleEmailBlur() {
        setErrors({ email: validate("email", email) });
    }

    async function handleEmailSubmit(e) {
        e.preventDefault();
        const err = validate("email", email);
        if (err) { setErrors({ email: err }); return; }
        setStep(2);
        setMessage("Enter your new password below.");
    }

    function handleChange(e) {
        const { name, value } = e.target;
        setForm(f => ({ ...f, [name]: value }));
        setApiErr("");
        if (errors[name]) setErrors(p => ({ ...p, [name]: "" }));
    }

    function handleBlur(e) {
        const { name, value } = e.target;
        if (name === "confirmPassword") {
            setErrors(p => ({ ...p, confirmPassword: form.newPassword !== value ? "Passwords do not match." : "" }));
        } else {
            setErrors(p => ({ ...p, [name]: validate("password", value) }));
        }
    }

    async function handleReset(e) {
        e.preventDefault();
        const newErrors = {
            newPassword:     validate("password", form.newPassword),
            confirmPassword: form.newPassword !== form.confirmPassword ? "Passwords do not match." : "",
        };
        setErrors(newErrors);
        if (hasErrors(newErrors)) return;

        setSubmitting(true);
        setApiErr("");
        try {
            const { data } = await authApi.resetPassword({
                email:       email.trim().toLowerCase(),
                newPassword: form.newPassword,
            });
            setMessage(data.message);
            setTimeout(() => navigate("/login"), 2500);
        } catch (err) {
            setApiErr(err.response?.data?.message || "Failed to reset password. Please try again.");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="auth-header">
                    <h1>Reset Password</h1>
                    <p>{step === 1 ? "Enter your registered email to proceed" : `Resetting password for ${email}`}</p>
                </div>

                {message && <div className="auth-success" role="status">{message}</div>}
                {apiErr  && <div className="auth-error"  role="alert">{apiErr}</div>}

                {step === 1 ? (
                    <form onSubmit={handleEmailSubmit} noValidate>
                        <label>Email Address</label>
                        <input
                            type="email"
                            placeholder="Enter your registered email"
                            value={email}
                            onChange={handleEmailChange}
                            onBlur={handleEmailBlur}
                            className={errors.email ? "input-error" : ""}
                            autoComplete="email"
                        />
                        {errors.email && <span className="field-error" role="alert">{errors.email}</span>}
                        <button type="submit">Continue</button>
                    </form>
                ) : (
                    <form onSubmit={handleReset} noValidate>
                        <label>New Password</label>
                        <input
                            type="password"
                            name="newPassword"
                            placeholder="Min 8 chars with uppercase, lowercase & number"
                            value={form.newPassword}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className={errors.newPassword ? "input-error" : ""}
                            autoComplete="new-password"
                        />
                        {errors.newPassword && <span className="field-error" role="alert">{errors.newPassword}</span>}

                        <label>Confirm New Password</label>
                        <input
                            type="password"
                            name="confirmPassword"
                            placeholder="Re-enter your new password"
                            value={form.confirmPassword}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className={errors.confirmPassword ? "input-error" : ""}
                            autoComplete="new-password"
                        />
                        {errors.confirmPassword && <span className="field-error" role="alert">{errors.confirmPassword}</span>}

                        <button type="submit" disabled={submitting}>{submitting ? "Resetting..." : "Reset Password"}</button>
                        <button type="button" className="guest-btn" onClick={() => { setStep(1); setForm({ newPassword: "", confirmPassword: "" }); setErrors({}); setMessage(""); }}>
                            Back
                        </button>
                    </form>
                )}

                <p className="auth-switch">Remembered your password? <Link to="/login">Login</Link></p>
            </div>
        </div>
    );
}

export default ForgotPassword;
