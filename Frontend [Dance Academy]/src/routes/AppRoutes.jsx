import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute";

const Home               = lazy(() => import("../pages/Home"));
const About              = lazy(() => import("../pages/About"));
const FAQ                = lazy(() => import("../pages/FAQ"));
const Contact            = lazy(() => import("../pages/Contact"));
const Privacy            = lazy(() => import("../pages/Privacy"));
const Terms              = lazy(() => import("../pages/Terms"));
const Login              = lazy(() => import("../pages/Login"));
const Signup             = lazy(() => import("../pages/Signup"));
const ForgotPassword     = lazy(() => import("../pages/ForgotPassword"));
const AdminDashboard     = lazy(() => import("../pages/AdminDashboard"));
const CourseManagement   = lazy(() => import("../pages/CourseManagement"));
const StudentManagement  = lazy(() => import("../pages/StudentManagement"));
const AttendanceManagement = lazy(() => import("../pages/AttendanceManagement"));
const FeeManagement      = lazy(() => import("../pages/FeeManagement"));
const EventManagement    = lazy(() => import("../pages/EventManagement"));
const ContactManagement  = lazy(() => import("../pages/ContactManagement"));
const ThreadManagement   = lazy(() => import("../pages/ThreadManagement"));
const Profile            = lazy(() => import("../pages/Profile"));
const NotFound           = lazy(() => import("../pages/NotFound"));

function AppRoutes() {
    return (
        <Suspense fallback={<div style={{ padding: "2rem" }}>Loading...</div>}>
        <Routes>
            <Route path="/"                   element={<Home />} />
            <Route path="/about"              element={<About />} />
            <Route path="/faq"                element={<FAQ />} />
            <Route path="/contact"            element={<Contact />} />
            <Route path="/privacy"            element={<Privacy />} />
            <Route path="/terms"              element={<Terms />} />
            <Route path="/login"              element={<Login />} />
            <Route path="/signup"             element={<Signup />} />
            <Route path="/forgot-password"    element={<ForgotPassword />} />
            <Route path="/reset-password"     element={<ForgotPassword />} />
            <Route path="/profile"           element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/threads"            element={<ProtectedRoute><ThreadManagement /></ProtectedRoute>} />
            <Route path="/admin"              element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/courses"      element={<ProtectedRoute adminOnly><CourseManagement /></ProtectedRoute>} />
            <Route path="/admin/students"     element={<ProtectedRoute adminOnly><StudentManagement /></ProtectedRoute>} />
            <Route path="/admin/attendance"   element={<ProtectedRoute adminOnly><AttendanceManagement /></ProtectedRoute>} />
            <Route path="/admin/fees"         element={<ProtectedRoute adminOnly><FeeManagement /></ProtectedRoute>} />
            <Route path="/admin/events"       element={<ProtectedRoute adminOnly><EventManagement /></ProtectedRoute>} />
            <Route path="/admin/messages"     element={<ProtectedRoute adminOnly><ContactManagement /></ProtectedRoute>} />
            <Route path="/admin/threads"      element={<ProtectedRoute adminOnly><ThreadManagement /></ProtectedRoute>} />
            <Route path="*"                   element={<NotFound />} />
        </Routes>
        </Suspense>
    );
}

export default AppRoutes;
