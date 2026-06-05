import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { validate, hasErrors } from "../utils/validation";
import { authApi } from "../utils/api";
import "./AdminPanel.css";

function Profile() {
    const { user, updateProfile } = useAuth();
    const [form,     setForm]     = useState({ firstname: "", lastname: "", phone: "" });
    const [errors,   setErrors]   = useState({});
    const [saving,   setSaving]   = useState(false);
    const [success,  setSuccess]  = useState("");
    const [apiErr,   setApiErr]   = useState("");

    useEffect(() => {
        authApi.profile()
            .then(r => {
                const d = r.data.data;
                setForm({ firstname: d.firstname || "", lastname: d.lastname || "", phone: d.phone || "" });
            })
            .catch(() => setApiErr("Failed to load profile."));
    }, []);

    function handleChange(e) {
        const { name, value } = e.target;
        setForm(f => ({ ...f, [name]: value }));
        setSuccess("");
        setApiErr("");
        if (errors[name]) setErrors(p => ({ ...p, [name]: "" }));
    }

    function handleBlur(e) {
        const { name, value } = e.target;
        setErrors(p => ({ ...p, [name]: validate("name", value) }));
    }

    async function handleSubmit(e) {
        e.preventDefault();
        const newErrors = {
            firstname: validate("name", form.firstname),
            lastname:  validate("name", form.lastname),
        };
        setErrors(newErrors);
        if (hasErrors(newErrors)) return;

        setSaving(true);
        const result = await updateProfile(form);
        setSaving(false);
        if (result.success) setSuccess("Profile updated successfully.");
        else setApiErr(result.message || "Failed to update profile.");
    }

    return (
        <div className="panel-page">
            <div className="panel-header">
                <h1>My Profile</h1>
                <p>View and update your account information.</p>
            </div>

            <div className="panel-form-box" style={{ maxWidth: 520 }}>
                <h2>Account Details</h2>

                <div style={{ marginBottom: 16, padding: "12px 16px", background: "var(--accent-bg)", borderRadius: 8, fontSize: 13 }}>
                    <div><strong>Email:</strong> {user?.email}</div>
                    <div style={{ marginTop: 4 }}><strong>Role:</strong> <span style={{ textTransform: "capitalize" }}>{user?.role}</span></div>
                </div>

                {success && <div style={{ background: "#e8f9f0", color: "#1a7a4a", borderRadius: 8, padding: "10px 14px", fontSize: 13, fontWeight: 500, marginBottom: 14 }}>{success}</div>}
                {apiErr  && <div className="panel-error">{apiErr}</div>}

                <form onSubmit={handleSubmit} noValidate>
                    <div className="panel-form-row">
                        <div className="panel-field">
                            <label>First Name</label>
                            <input
                                name="firstname"
                                placeholder="First name"
                                value={form.firstname}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                className={errors.firstname ? "input-error" : ""}
                            />
                            {errors.firstname && <span className="field-error">{errors.firstname}</span>}
                        </div>
                        <div className="panel-field">
                            <label>Last Name</label>
                            <input
                                name="lastname"
                                placeholder="Last name"
                                value={form.lastname}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                className={errors.lastname ? "input-error" : ""}
                            />
                            {errors.lastname && <span className="field-error">{errors.lastname}</span>}
                        </div>
                    </div>
                    <div className="panel-field" style={{ marginBottom: 16 }}>
                        <label>Phone Number</label>
                        <input
                            name="phone"
                            placeholder="10-digit mobile number"
                            value={form.phone}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="panel-form-actions">
                        <button type="submit" className="panel-btn" disabled={saving}>
                            {saving ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default Profile;
