import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { validate, hasErrors } from "../utils/validation";
import "./Login.css";

const EMPTY = { email: "", password: "" };

function Login() {
    const [form,       setForm]       = useState(EMPTY);
    const [errors,     setErrors]     = useState({});
    const [rememberMe, setRememberMe] = useState(false);
    const { login, loginAsGuest, loading, error, setError } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const saved = localStorage.getItem("rememberedEmail");
        if (saved) { setForm(f => ({ ...f, email: saved })); setRememberMe(true); }
        return () => setError("");
    }, [setError]);

    function handleChange(e) {
        const { name, value } = e.target;
        setForm(f => ({ ...f, [name]: value }));
        setError("");
        if (errors[name]) setErrors(p => ({ ...p, [name]: "" }));
    }

    function handleBlur(e) {
        const { name, value } = e.target;
        setErrors(p => ({ ...p, [name]: validate(name, value) }));
    }

    async function handleSubmit(e) {
        e.preventDefault();
        const newErrors = {
            email:    validate("email",    form.email.trim()),
            password: form.password ? "" : "Password is required.",
        };
        setErrors(newErrors);
        if (hasErrors(newErrors)) return;

        if (rememberMe) localStorage.setItem("rememberedEmail", form.email.trim().toLowerCase());
        else            localStorage.removeItem("rememberedEmail");

        const result = await login(form.email.trim(), form.password);
        if (result.success) navigate(result.role === "admin" ? "/admin" : "/");
    }

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="auth-header">
                    <h1>Welcome Back</h1>
                    <p>Login to your Dance Academy account</p>
                </div>

                {error && <div className="auth-error" role="alert">{error}</div>}

                <form onSubmit={handleSubmit} noValidate>
                    <label>Email Address</label>
                    <input
                        type="email"
                        name="email"
                        placeholder="Enter your email"
                        value={form.email}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={errors.email ? "input-error" : ""}
                        autoComplete="email"
                    />
                    {errors.email && <span className="field-error" role="alert">{errors.email}</span>}

                    <label>Password</label>
                    <input
                        type="password"
                        name="password"
                        placeholder="Enter your password"
                        value={form.password}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={errors.password ? "input-error" : ""}
                        autoComplete="current-password"
                    />
                    {errors.password && <span className="field-error" role="alert">{errors.password}</span>}

                    <div className="remember-row">
                        <label className="remember-label">
                            <input
                                type="checkbox"
                                checked={rememberMe}
                                onChange={e => setRememberMe(e.target.checked)}
                            />
                            Remember me
                        </label>
                    </div>

                    <button type="submit" disabled={loading}>{loading ? "Logging in..." : "Login"}</button>
                    <button
                        type="button"
                        className="guest-btn"
                        onClick={() => { loginAsGuest(); navigate("/"); }}
                    >
                        Continue as Guest
                    </button>
                </form>

                <p className="auth-switch"><Link to="/forgot-password">Forgot Password?</Link></p>
                <p className="auth-switch">Don't have an account? <Link to="/signup">Sign Up</Link></p>
            </div>
        </div>
    );
}

export default Login;
