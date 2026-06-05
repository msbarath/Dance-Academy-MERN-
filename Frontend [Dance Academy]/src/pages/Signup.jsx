import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { validate, validateConfirmPassword, hasErrors } from "../utils/validation";
import "./Signup.css";

const DRAFT_KEY = "signupDraft";
const EMPTY = { firstname: "", lastname: "", email: "", phone: "", password: "", confirmPassword: "" };

function Signup() {
    const [form,   setForm]   = useState(EMPTY);
    const [errors, setErrors] = useState({});
    const { signup, loading, error, setError } = useAuth();
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
            firstname:       validate("name",     form.firstname),
            lastname:        validate("name",     form.lastname),
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
                    <label>First Name</label>
                    <input type="text" name="firstname" placeholder="First name" value={form.firstname} onChange={handleChange} onBlur={handleBlur} className={errors.firstname ? "input-error" : ""} autoComplete="given-name" />
                    {errors.firstname && <span className="field-error" role="alert">{errors.firstname}</span>}

                    <label>Last Name</label>
                    <input type="text" name="lastname" placeholder="Last name" value={form.lastname} onChange={handleChange} onBlur={handleBlur} className={errors.lastname ? "input-error" : ""} autoComplete="family-name" />
                    {errors.lastname && <span className="field-error" role="alert">{errors.lastname}</span>}

                    <label>Email Address</label>
                    <input type="email" name="email" placeholder="Enter your email" value={form.email} onChange={handleChange} onBlur={handleBlur} className={errors.email ? "input-error" : ""} autoComplete="email" />
                    {errors.email && <span className="field-error" role="alert">{errors.email}</span>}

                    <label>Phone Number</label>
                    <input type="tel" name="phone" placeholder="10-digit mobile number" value={form.phone} onChange={handleChange} onBlur={handleBlur} className={errors.phone ? "input-error" : ""} autoComplete="tel" />
                    {errors.phone && <span className="field-error" role="alert">{errors.phone}</span>}

                    <label>Password</label>
                    <input type="password" name="password" placeholder="Min 8 chars with uppercase, lowercase & number" value={form.password} onChange={handleChange} onBlur={handleBlur} className={errors.password ? "input-error" : ""} autoComplete="new-password" />
                    {errors.password && <span className="field-error" role="alert">{errors.password}</span>}

                    <label>Confirm Password</label>
                    <input type="password" name="confirmPassword" placeholder="Re-enter your password" value={form.confirmPassword} onChange={handleChange} onBlur={handleBlur} className={errors.confirmPassword ? "input-error" : ""} autoComplete="new-password" />
                    {errors.confirmPassword && <span className="field-error" role="alert">{errors.confirmPassword}</span>}

                    <button type="submit" disabled={loading}>{loading ? "Creating account..." : "Create Account"}</button>
                </form>

                <p className="auth-switch">Already have an account? <Link to="/login">Login</Link></p>
            </div>
        </div>
    );
}

export default Signup;
