import { useState, useEffect, useCallback } from "react";
import Footer from "../components/Footer";
import PageHero from "../components/PageHero";
import { contactApi } from "../utils/api";
import { validate, hasErrors } from "../utils/validation";
import "./Contact.css";

const DRAFT_KEY = "contactDraft";
const MAX_MSG   = 500;
const EMPTY     = { name: "", email: "", message: "" };

function Contact() {
    const [form,       setForm]       = useState(EMPTY);
    const [errors,     setErrors]     = useState({});
    const [success,    setSuccess]    = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [apiErr,     setApiErr]     = useState("");

    useEffect(() => {
        try {
            const draft = sessionStorage.getItem(DRAFT_KEY);
            if (draft) setForm(JSON.parse(draft));
        } catch {}
    }, []);

    const validateField = useCallback((name, value) => validate(name, value), []);

    function handleChange(e) {
        const { name, value } = e.target;
        if (name === "message" && value.length > MAX_MSG) return;
        const updated = { ...form, [name]: value };
        setForm(updated);
        setSuccess(false);
        setApiErr("");
        if (errors[name]) setErrors(p => ({ ...p, [name]: "" }));
        sessionStorage.setItem(DRAFT_KEY, JSON.stringify(updated));
    }

    function handleBlur(e) {
        setErrors(p => ({ ...p, [e.target.name]: validateField(e.target.name, e.target.value) }));
    }

    async function handleSubmit(e) {
        e.preventDefault();
        const newErrors = {
            name:    validate("name",    form.name),
            email:   validate("email",   form.email),
            message: validate("message", form.message),
        };
        setErrors(newErrors);
        if (hasErrors(newErrors)) return;

        setSubmitting(true);
        try {
            await contactApi.send({ name: form.name.trim(), email: form.email.trim().toLowerCase(), message: form.message.trim() });
            sessionStorage.removeItem(DRAFT_KEY);
            setSuccess(true);
            setForm(EMPTY);
            setErrors({});
        } catch (err) {
            setApiErr(err.response?.data?.message || "Failed to send message. Please try again.");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <>
            <PageHero title="Contact" highlight="Us" subtitle="We would love to hear from you. Reach out anytime." />
            <section className="contact-section">
                <div className="contact-grid">
                    <div className="contact-info">
                        <h2>Get In Touch</h2>
                        <p>Have questions about our classes, schedules or fees? Send us a message and we'll get back to you soon.</p>
                        <div className="info-item">
                            <span className="info-icon">&#128205;</span>
                            <span>Coimbatore, Tamil Nadu</span>
                        </div>
                        <div className="info-item">
                            <span className="info-icon">&#128222;</span>
                            <span>+91 9655150590</span>
                        </div>
                        <div className="info-item">
                            <span className="info-icon">&#9993;&#65039;</span>
                            <span>danceacademy@gmail.com</span>
                        </div>
                    </div>

                    <div className="contact-form-box">
                        {success && <div className="form-success">Message sent successfully! We will get back to you soon.</div>}
                        {apiErr  && <div className="field-error" role="alert">{apiErr}</div>}
                        <form onSubmit={handleSubmit} noValidate>
                            <label htmlFor="contact-name">Full Name</label>
                            <input id="contact-name" type="text" name="name" placeholder="Enter your name" value={form.name} onChange={handleChange} onBlur={handleBlur} className={errors.name ? "input-error" : ""} aria-describedby={errors.name ? "contact-name-error" : undefined} aria-invalid={errors.name ? "true" : undefined} />
                            {errors.name && <span id="contact-name-error" className="field-error" role="alert">{errors.name}</span>}

                            <label htmlFor="contact-email">Email Address</label>
                            <input id="contact-email" type="email" name="email" placeholder="Enter your email" value={form.email} onChange={handleChange} onBlur={handleBlur} className={errors.email ? "input-error" : ""} aria-describedby={errors.email ? "contact-email-error" : undefined} aria-invalid={errors.email ? "true" : undefined} />
                            {errors.email && <span id="contact-email-error" className="field-error" role="alert">{errors.email}</span>}

                            <label htmlFor="contact-message">Message</label>
                            <textarea id="contact-message" name="message" placeholder="Enter your message (10–500 characters)" value={form.message} onChange={handleChange} onBlur={handleBlur} className={errors.message ? "input-error" : ""} aria-describedby={errors.message ? "contact-message-error" : undefined} aria-invalid={errors.message ? "true" : undefined} />
                            <div className="char-counter">{form.message.length} / {MAX_MSG}</div>
                            {errors.message && <span id="contact-message-error" className="field-error" role="alert">{errors.message}</span>}

                            <button type="submit" disabled={submitting}>{submitting ? "Sending..." : "Send Message"}</button>
                        </form>
                    </div>
                </div>
            </section>
            <Footer />
        </>
    );
}

export default Contact;
