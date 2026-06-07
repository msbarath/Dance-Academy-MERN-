export const patterns = {
    name:        /^[A-Za-z][A-Za-z ]{0,49}$/,
    email:       /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    phone:       /^[6-9][0-9]{9}$/,
    password:    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@#$!%*?&]{8,32}$/,
    courseName:  /^[A-Za-z0-9][A-Za-z0-9 &-]{1,59}$/,
    instructor:  /^[A-Za-z][A-Za-z .]{1,49}$/,
    schedule:    /^[\w\s,&:()-]{3,100}$/,
    fee:         /^[1-9][0-9]{0,6}$/,
    amount:      /^[1-9][0-9]{0,6}$/,
    venue:       /^[A-Za-z0-9][A-Za-z0-9 ,.-]{2,99}$/,
    title:       /^[\s\S]{3,100}$/,
    message:     /^[\s\S]{10,500}$/,
    description: /^[\s\S]{0,300}$/,
};

const LABELS = {
    name: "Name", email: "Email", phone: "Phone number", password: "Password",
    firstname: "First name", lastname: "Last name",
    courseName: "Course name", instructor: "Instructor", schedule: "Schedule",
    fee: "Fee", amount: "Amount", venue: "Venue", title: "Title",
    message: "Message", description: "Description",
};

const ERRORS = {
    name:        "Name must be 2–50 letters and spaces only.",
    firstname:   "First name must be 2–50 letters and spaces only.",
    lastname:    "Last name must be 2–50 letters and spaces only.",
    email:       "Enter a valid email address (e.g. name@example.com).",
    phone:       "Enter a valid 10-digit Indian mobile number starting with 6–9.",
    password:    "Password must be 8–32 characters with uppercase, lowercase and a number.",
    courseName:  "Course name must be 2–60 alphanumeric characters.",
    instructor:  "Instructor name must be 2–50 letters only.",
    schedule:    "Schedule must be 3–100 characters.",
    fee:         "Fee must be a positive number up to 9,999,999.",
    amount:      "Amount must be a positive number up to 9,999,999.",
    venue:       "Venue must be 3–100 characters.",
    title:       "Title must be 3–100 characters.",
    message:     "Message must be between 10 and 500 characters.",
    description: "Description must be 300 characters or fewer.",
};

export function validate(field, value, required = true) {
    const trimmed = value != null ? String(value).trim() : "";
    if (!trimmed) return required ? `${LABELS[field] || field} is required.` : "";
    const patternKey = (field === "firstname" || field === "lastname") ? "name" : field;
    if (patterns[patternKey] && !patterns[patternKey].test(trimmed)) return ERRORS[field] || ERRORS[patternKey] || `Invalid ${LABELS[field] || field}.`;
    return "";
}

export function validateConfirmPassword(password, confirm) {
    if (!confirm || !confirm.trim()) return "Please confirm your password.";
    if (password !== confirm) return "Passwords do not match.";
    return "";
}

export function validateDate(date, allowPast = true) {
    if (!date) return "Date is required.";
    const d = new Date(date);
    if (isNaN(d.getTime())) return "Enter a valid date.";
    if (!allowPast && d < new Date(new Date().toDateString())) return "Date cannot be in the past.";
    return "";
}

export function validateAll(fields, required = {}) {
    const errors = {};
    for (const [field, value] of Object.entries(fields)) {
        errors[field] = validate(field, value, required[field] !== false);
    }
    return errors;
}

export function hasErrors(errors) {
    return Object.values(errors).some(Boolean);
}
