import "./FormField.css";

function FormField({ label, error, children }) {
    return (
        <div className="form-field">
            {label && <label className="form-field__label">{label}</label>}
            {children}
            {error && <span className="form-field__error" role="alert">{error}</span>}
        </div>
    );
}

export default FormField;
