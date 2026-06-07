import axios from "axios";

const BASE = (process.env.REACT_APP_API_URL || "http://localhost:5000/api").replace(/\/$/, "");

const api       = axios.create({ baseURL: BASE, withCredentials: true });
const publicApi = axios.create({ baseURL: BASE, withCredentials: false });
const csrfApi   = axios.create({ baseURL: BASE, withCredentials: false });

function addAuthInterceptor(instance) {
    instance.interceptors.request.use((config) => {
        const token = localStorage.getItem("authToken");
        if (token) config.headers.Authorization = `Bearer ${token}`;
        return config;
    });

    instance.interceptors.response.use(
        (res) => res,
        (err) => {
            if (err.response?.status === 401) {
                localStorage.removeItem("authToken");
                localStorage.removeItem("authUser");
                window.dispatchEvent(new CustomEvent("auth:logout"));
            }
            return Promise.reject(err);
        }
    );
}

addAuthInterceptor(api);

export const authApi = {
    signup:         (data) => api.post("/user/signup",         data),
    login:          (data) => api.post("/user/login",          data),
    requestReset:   (data) => api.post("/user/request-reset",  data),
    resetPassword:  (data) => api.post("/user/reset-password", data),
    profile:        ()     => api.get("/user/profile"),
    updateProfile:  (data) => api.put("/user/profile",         data),
    getAllUsers:     ()     => api.get("/user/all"),
    deleteUser:     (id)   => api.delete(`/user/${id}`),
};

export const coursesApi = {
    getAll: ()         => publicApi.get("/courses"),
    create: (data)     => api.post("/courses",       data),
    update: (id, data) => api.put(`/courses/${id}`,  data),
    remove: (id)       => api.delete(`/courses/${id}`),
};

export const studentsApi = {
    getCount: ()         => publicApi.get("/students/count"),
    getAll:   ()         => api.get("/students"),
    create:   (data)     => api.post("/students",       data),
    update:   (id, data) => api.put(`/students/${id}`,  data),
    remove:   (id)       => api.delete(`/students/${id}`),
};

export const attendanceApi = {
    getAll: (date)     => api.get("/attendance", { params: date ? { date } : {} }),
    mark:   (data)     => api.post("/attendance",       data),
    update: (id, data) => api.put(`/attendance/${id}`,  data),
    remove: (id)       => api.delete(`/attendance/${id}`),
};

export const feesApi = {
    getAll: (month)    => api.get("/fees", { params: month ? { month } : {} }),
    record: (data)     => api.post("/fees",       data),
    update: (id, data) => api.put(`/fees/${id}`,  data),
    remove: (id)       => api.delete(`/fees/${id}`),
};

export const eventsApi = {
    getAll:  ()         => publicApi.get("/events"),
    create:  (data)     => api.post("/events",       data),
    update:  (id, data) => api.put(`/events/${id}`,  data),
    remove:  (id)       => api.delete(`/events/${id}`),
};

export const contactApi = {
    getAll: ()     => api.get("/contact"),
    send:   (data) => csrfApi.post("/contact", data),
    remove: (id)   => api.delete(`/contact/${id}`),
};

export const threadsApi = {
    getAll:        (params)          => api.get("/threads", { params }),
    create:        (data)            => api.post("/threads",                         data),
    getById:       (id)              => api.get(`/threads/${id}`),
    update:        (id, data)        => api.put(`/threads/${id}`,                    data),
    remove:        (id)              => api.delete(`/threads/${id}`),
    getMessages:   (id, params)      => api.get(`/threads/${id}/messages`, { params }),
    sendMessage:   (id, data)        => api.post(`/threads/${id}/messages`,          data),
    updateMessage: (id, msgId, data) => api.put(`/threads/${id}/messages/${msgId}`,  data),
    deleteMessage: (id, msgId)       => api.delete(`/threads/${id}/messages/${msgId}`),
};

export default api;
