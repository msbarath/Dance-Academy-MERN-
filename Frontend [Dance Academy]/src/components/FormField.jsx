import { useId, Children, cloneElement, isValidElement, memo } from "react";
import "./FormField.css";

function FormField({ label, error, children, htmlFor }) {
    const autoId = useId();
    const fieldId = htmlFor || autoId;

    const child = (() => {
        const only = Children.only(children);
        if (!isValidElement(only)) return only;
        return cloneElement(only, {
            id:                  only.props.id || fieldId,
            "aria-invalid":      error ? "true" : undefined,
            "aria-describedby":  error ? `${fieldId}-error` : only.props["aria-describedby"],
        });
    })();

    return (
        <div className="form-field">
            {label && (
                <label className="form-field__label" htmlFor={fieldId}>
                    {label}
                </label>
            )}
            {child}
            {error && (
                <span id={`${fieldId}-error`} className="form-field__error" role="alert">
                    {error}
                </span>
            )}
        </div>
    );
}

export default memo(FormField);
