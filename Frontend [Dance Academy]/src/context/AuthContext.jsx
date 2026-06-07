import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { authApi } from "../utils/api";
import { invalidateStore } from "../hooks/useStore";

const AuthContext = createContext();

function loadUser() {
    try {
        const raw = localStorage.getItem("authUser");
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        if (!parsed?.email || !parsed?.role) { localStorage.removeItem("authUser"); return null; }
        return parsed;
    } catch {
        localStorage.removeItem("authUser");
        return null;
    }
}

function buildUserData(d) {
    return {
        id:        d.id,
        firstname: d.firstname,
        lastname:  d.lastname,
        name:      `${d.firstname} ${d.lastname}`,
        email:     d.email,
        phone:     d.phone,
        role:      d.role,
    };
}

export function AuthProvider({ children }) {
    const [user,    setUser]    = useState(loadUser);
    const [loading, setLoading] = useState(false);
    const [error,   setError]   = useState("");

    // On mount, verify the stored token against the server to prevent
    // role spoofing via manually edited localStorage.
    // Empty deps [] is intentional — run once on mount only.
    useEffect(() => {
        const token = localStorage.getItem("authToken");
        if (!token) return;
        authApi.profile()
            .then(({ data }) => {
                const verified = buildUserData(data.data);
                localStorage.setItem("authUser", JSON.stringify(verified));
                setUser(verified);
            })
            .catch(() => {
                localStorage.removeItem("authToken");
                localStorage.removeItem("authUser");
                setUser(null);
            });
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        function handleForceLogout() {
            localStorage.removeItem("authToken");
            localStorage.removeItem("authUser");
            setUser(null);
            setError("");
            invalidateStore();
        }
        window.addEventListener("auth:logout", handleForceLogout);
        return () => window.removeEventListener("auth:logout", handleForceLogout);
    }, []);

    const login = useCallback(async (email, password) => {
        setLoading(true);
        setError("");
        try {
            const { data } = await authApi.login({ email, password });
            localStorage.setItem("authToken", data.token);
            const userData = buildUserData(data.data);
            localStorage.setItem("authUser", JSON.stringify(userData));
            setUser(userData);
            invalidateStore();
            return { success: true, role: userData.role };
        } catch (err) {
            const msg = err.response?.data?.message || "Login failed. Please try again.";
            setError(msg);
            return { success: false, message: msg };
        } finally {
            setLoading(false);
        }
    }, []);

    const signup = useCallback(async (formData) => {
        setLoading(true);
        setError("");
        try {
            const payload = {
                firstname: formData.firstname,
                lastname:  formData.lastname,
                email:     formData.email,
                phone:     formData.phone,
                password:  formData.password,
            };
            const { data } = await authApi.signup(payload);
            localStorage.setItem("authToken", data.token);
            const userData = buildUserData(data.data);
            localStorage.setItem("authUser", JSON.stringify(userData));
            setUser(userData);
            invalidateStore();
            return { success: true };
        } catch (err) {
            const msg = err.response?.data?.message || "Registration failed. Please try again.";
            setError(msg);
            return { success: false, message: msg };
        } finally {
            setLoading(false);
        }
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem("authToken");
        localStorage.removeItem("authUser");
        setUser(null);
        setError("");
        invalidateStore();
    }, []);

    const loginAsGuest = useCallback(() => {
        const guest = { id: "guest", name: "Guest", firstname: "Guest", lastname: "", email: "", phone: "", role: "guest" };
        setUser(guest);
    }, []);

    const updateProfile = useCallback(async (formData) => {
        setLoading(true);
        try {
            const payload = {
                firstname: formData.firstname,
                lastname:  formData.lastname,
                phone:     formData.phone,
            };
            const { data } = await authApi.updateProfile(payload);
            const userData = buildUserData(data.data);
            localStorage.setItem("authUser", JSON.stringify(userData));
            setUser(userData);
            return { success: true };
        } catch (err) {
            const msg = err.response?.data?.message || "Failed to update profile.";
            return { success: false, message: msg };
        } finally {
            setLoading(false);
        }
    }, []);

    return (
        <AuthContext.Provider value={{ user, loading, error, login, signup, logout, loginAsGuest, updateProfile, setError }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
