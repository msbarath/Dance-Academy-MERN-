import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { validate, hasErrors } from "../utils/validation";
import { authApi } from "../utils/api";
import "./ForgotPassword.css";

function ForgotPassword() {
    const [searchParams] = useSearchParams();
    const tokenFromUrl   = searchParams.get("token") || "";

    // step 1 = request email, step 2 = enter new password (reached via email link)
    const [step,       setStep]       = useState(tokenFromUrl ? 2 : 1);
    const [email,      setEmail]      = useState("");
    const [resetToken, setResetToken] = useState(tokenFromUrl);
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

        setSubmitting(true);
        setApiErr("");
        try {
            const { data } = await authApi.requestReset({ email: email.trim().toLowerCase() });
            setMessage(data.message || "If that email is registered, a reset link has been sent.");
        } catch (reqErr) {
            setApiErr(reqErr.response?.data?.message || "Failed to process request. Please try again.");
        } finally {
            setSubmitting(false);
        }
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
                resetToken:  resetToken,
                newPassword: form.newPassword,
            });
            setMessage(data.message);
            setTimeout(() => navigate("/login"), 2500);
        } catch (resetErr) {
            setApiErr(resetErr.response?.data?.message || "Failed to reset password. Please try again.");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="auth-header">
                    <h1>Reset Password</h1>
                    <p>{step === 1 ? "Enter your registered email to receive a reset link" : "Enter your new password"}</p>
                </div>

                {message && <div className="auth-success" role="status">{message}</div>}
                {apiErr  && <div className="auth-error"  role="alert">{apiErr}</div>}

                {step === 1 ? (
                    <form onSubmit={handleEmailSubmit} noValidate>
                        <label htmlFor="fp-email">Email Address</label>
                        <input
                            id="fp-email"
                            type="email"
                            placeholder="Enter your registered email"
                            value={email}
                            onChange={handleEmailChange}
                            onBlur={handleEmailBlur}
                            className={errors.email ? "input-error" : ""}
                            autoComplete="email"
                        />
                        {errors.email && <span className="field-error" role="alert">{errors.email}</span>}
                        <button type="submit" disabled={submitting}>
                            {submitting ? "Sending..." : "Send Reset Link"}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleReset} noValidate>
                        <label htmlFor="fp-new-password">New Password</label>
                        <input
                            id="fp-new-password"
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

                        <label htmlFor="fp-confirm-password">Confirm New Password</label>
                        <input
                            id="fp-confirm-password"
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

                        <button type="submit" disabled={submitting}>
                            {submitting ? "Resetting..." : "Reset Password"}
                        </button>
                        <button
                            type="button"
                            className="guest-btn"
                            onClick={() => {
                                setStep(1);
                                setResetToken("");
                                setForm({ newPassword: "", confirmPassword: "" });
                                setErrors({});
                                setMessage("");
                                navigate("/forgot-password", { replace: true });
                            }}
                        >
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
