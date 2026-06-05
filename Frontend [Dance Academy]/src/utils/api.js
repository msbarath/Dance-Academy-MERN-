import axios from "axios";

const BASE = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

const api = axios.create({ baseURL: BASE, withCredentials: true });
const publicApi = axios.create({ baseURL: BASE });

let csrfToken = null;

async function fetchCsrfToken() {
    if (csrfToken) return csrfToken;
    const { data } = await axios.get(`${BASE}/csrf-token`, { withCredentials: true });
    csrfToken = data.csrfToken;
    return csrfToken;
}

const CSRF_MUTATING_PATHS = ["/user/signup", "/user/login", "/user/reset-password"];

api.interceptors.request.use(async (config) => {
    const token = localStorage.getItem("authToken");
    if (token) config.headers.Authorization = `Bearer ${token}`;

    const method = config.method?.toLowerCase();
    const isCsrfPath = CSRF_MUTATING_PATHS.some(p => config.url?.includes(p));
    if (isCsrfPath && ["post", "put", "patch", "delete"].includes(method)) {
        config.headers["x-csrf-token"] = await fetchCsrfToken();
    }
    return config;
});

api.interceptors.response.use(
    (res) => res,
    (err) => {
        if (err.response?.status === 403 && err.response?.data?.message?.toLowerCase().includes("csrf")) {
            csrfToken = null;
        }
        if (err.response?.status === 401) {
            const url = err.config?.url || "";
            const isProtected = ["/user/profile", "/user/all", "/students", "/attendance", "/fees", "/threads", "/contact"].some(p => url.includes(p));
            if (isProtected) {
                localStorage.removeItem("authToken");
                localStorage.removeItem("authUser");
                window.location.href = "/login";
            }
        }
        return Promise.reject(err);
    }
);

export const authApi = {
    signup:        (data) => api.post("/user/signup", data),
    login:         (data) => api.post("/user/login", data),
    resetPassword: (data) => api.post("/user/reset-password", data),
    profile:       ()     => api.get("/user/profile"),
    updateProfile: (data) => api.put("/user/profile", data),
    getAllUsers:    ()     => api.get("/user/all"),
    deleteUser:    (id)   => api.delete(`/user/${id}`),
};

export const coursesApi = {
    getAll: ()         => publicApi.get("/courses"),
    create: (data)     => api.post("/courses", data),
    update: (id, data) => api.put(`/courses/${id}`, data),
    remove: (id)       => api.delete(`/courses/${id}`),
};

export const studentsApi = {
    getCount: ()         => publicApi.get("/students/count"),
    getAll:   ()         => api.get("/students"),
    create:   (data)     => api.post("/students", data),
    update:   (id, data) => api.put(`/students/${id}`, data),
    remove:   (id)       => api.delete(`/students/${id}`),
};

export const attendanceApi = {
    getAll: (date)     => api.get("/attendance", { params: date ? { date } : {} }),
    mark:   (data)     => api.post("/attendance", data),
    update: (id, data) => api.put(`/attendance/${id}`, data),
    remove: (id)       => api.delete(`/attendance/${id}`),
};

export const feesApi = {
    getAll: (month)    => api.get("/fees", { params: month ? { month } : {} }),
    record: (data)     => api.post("/fees", data),
    update: (id, data) => api.put(`/fees/${id}`, data),
    remove: (id)       => api.delete(`/fees/${id}`),
};

export const eventsApi = {
    getAll:  ()         => publicApi.get("/events"),
    create:  (data)     => api.post("/events", data),
    update:  (id, data) => api.put(`/events/${id}`, data),
    remove:  (id)       => api.delete(`/events/${id}`),
};

export const contactApi = {
    getAll: ()     => api.get("/contact"),
    send:   (data) => publicApi.post("/contact", data),
    remove: (id)   => api.delete(`/contact/${id}`),
};

export const threadsApi = {
    getAll:      ()         => api.get("/threads"),
    create:      (data)     => api.post("/threads", data),
    getById:     (id)       => api.get(`/threads/${id}`),
    update:      (id, data) => api.put(`/threads/${id}`, data),
    remove:      (id)       => api.delete(`/threads/${id}`),
    getMessages: (id)       => api.get(`/threads/${id}/messages`),
    sendMessage: (id, data) => api.post(`/threads/${id}/messages`, data),
};

export default api;
