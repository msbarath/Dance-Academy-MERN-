import { useState, useEffect } from "react";
import { Link, useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { validate, validateConfirmPassword, hasErrors } from "../utils/validation";
import "./Signup.css";

const DRAFT_KEY = "signupDraft";
const EMPTY = { firstname: "", lastname: "", email: "", phone: "", password: "", confirmPassword: "" };

function Signup() {
    const [form,   setForm]   = useState(EMPTY);
    const [errors, setErrors] = useState({});
    const { signup, loading, error, setError, user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        try {
            const draft = sessionStorage.getItem(DRAFT_KEY);
            if (draft) {
                const p = JSON.parse(draft);
                setForm(f => ({ ...f, firstname: p.firstname || "", lastname: p.lastname || "", email: p.email || "", phone: p.phone || "" }));
            }
        } catch {}
        return () => setError("");
    }, [setError]);

    if (user && user.role !== "guest") return <Navigate to="/" replace />;

    function handleChange(e) {
        const { name, value } = e.target;
        const updated = { ...form, [name]: value };
        setForm(updated);
        setError("");
        if (errors[name]) setErrors(p => ({ ...p, [name]: "" }));
        sessionStorage.setItem(DRAFT_KEY, JSON.stringify({ firstname: updated.firstname, lastname: updated.lastname, email: updated.email, phone: updated.phone }));
    }

    function handleBlur(e) {
        const { name, value } = e.target;
        setErrors(p => ({
            ...p,
            [name]: name === "confirmPassword"
                ? validateConfirmPassword(form.password, value)
                : validate(name, value),
        }));
    }

    async function handleSubmit(e) {
        e.preventDefault();
        const newErrors = {
            firstname:       validate("firstname", form.firstname),
            lastname:        validate("lastname",  form.lastname),
            email:           validate("email",    form.email),
            phone:           validate("phone",    form.phone),
            password:        validate("password", form.password),
            confirmPassword: validateConfirmPassword(form.password, form.confirmPassword),
        };
        setErrors(newErrors);
        if (hasErrors(newErrors)) return;

        const result = await signup(form);
        if (result.success) { sessionStorage.removeItem(DRAFT_KEY); navigate("/"); }
    }

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="auth-header">
                    <h1>Create Account</h1>
                    <p>Join Dance Academy and start your journey</p>
                </div>

                {error && <div className="auth-error" role="alert">{error}</div>}

                <form onSubmit={handleSubmit} noValidate>
                    <label htmlFor="su-firstname">First Name</label>
                    <input id="su-firstname" type="text" name="firstname" placeholder="First name" value={form.firstname} onChange={handleChange} onBlur={handleBlur} className={errors.firstname ? "input-error" : ""} autoComplete="given-name" aria-describedby={errors.firstname ? "su-firstname-error" : undefined} aria-invalid={errors.firstname ? "true" : undefined} />
                    {errors.firstname && <span id="su-firstname-error" className="field-error" role="alert">{errors.firstname}</span>}

                    <label htmlFor="su-lastname">Last Name</label>
                    <input id="su-lastname" type="text" name="lastname" placeholder="Last name" value={form.lastname} onChange={handleChange} onBlur={handleBlur} className={errors.lastname ? "input-error" : ""} autoComplete="family-name" aria-describedby={errors.lastname ? "su-lastname-error" : undefined} aria-invalid={errors.lastname ? "true" : undefined} />
                    {errors.lastname && <span id="su-lastname-error" className="field-error" role="alert">{errors.lastname}</span>}

                    <label htmlFor="su-email">Email Address</label>
                    <input id="su-email" type="email" name="email" placeholder="Enter your email" value={form.email} onChange={handleChange} onBlur={handleBlur} className={errors.email ? "input-error" : ""} autoComplete="email" aria-describedby={errors.email ? "su-email-error" : undefined} aria-invalid={errors.email ? "true" : undefined} />
                    {errors.email && <span id="su-email-error" className="field-error" role="alert">{errors.email}</span>}

                    <label htmlFor="su-phone">Phone Number</label>
                    <input id="su-phone" type="tel" name="phone" placeholder="10-digit mobile number" value={form.phone} onChange={handleChange} onBlur={handleBlur} className={errors.phone ? "input-error" : ""} autoComplete="tel" aria-describedby={errors.phone ? "su-phone-error" : undefined} aria-invalid={errors.phone ? "true" : undefined} />
                    {errors.phone && <span id="su-phone-error" className="field-error" role="alert">{errors.phone}</span>}

                    <label htmlFor="su-password">Password</label>
                    <input id="su-password" type="password" name="password" placeholder="Min 8 chars with uppercase, lowercase & number" value={form.password} onChange={handleChange} onBlur={handleBlur} className={errors.password ? "input-error" : ""} autoComplete="new-password" aria-describedby={errors.password ? "su-password-error" : undefined} aria-invalid={errors.password ? "true" : undefined} />
                    {errors.password && <span id="su-password-error" className="field-error" role="alert">{errors.password}</span>}

                    <label htmlFor="su-confirm">Confirm Password</label>
                    <input id="su-confirm" type="password" name="confirmPassword" placeholder="Re-enter your password" value={form.confirmPassword} onChange={handleChange} onBlur={handleBlur} className={errors.confirmPassword ? "input-error" : ""} autoComplete="new-password" aria-describedby={errors.confirmPassword ? "su-confirm-error" : undefined} aria-invalid={errors.confirmPassword ? "true" : undefined} />
                    {errors.confirmPassword && <span id="su-confirm-error" className="field-error" role="alert">{errors.confirmPassword}</span>}

                    <button type="submit" disabled={loading}>{loading ? "Creating account..." : "Create Account"}</button>
                </form>

                <p className="auth-switch">Already have an account? <Link to="/login">Login</Link></p>
            </div>
        </div>
    );
}

export default Signup;
