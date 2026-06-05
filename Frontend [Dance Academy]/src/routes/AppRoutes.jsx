import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute";
import Home from "../pages/Home";
import About from "../pages/About";
import FAQ from "../pages/FAQ";
import Contact from "../pages/Contact";
import Privacy from "../pages/Privacy";
import Terms from "../pages/Terms";
import Login from "../pages/Login";
import Signup from "../pages/Signup";
import ForgotPassword from "../pages/ForgotPassword";
import AdminDashboard from "../pages/AdminDashboard";
import CourseManagement from "../pages/CourseManagement";
import StudentManagement from "../pages/StudentManagement";
import AttendanceManagement from "../pages/AttendanceManagement";
import FeeManagement from "../pages/FeeManagement";
import EventManagement from "../pages/EventManagement";
import ContactManagement from "../pages/ContactManagement";
import ThreadManagement from "../pages/ThreadManagement";
import Profile from "../pages/Profile";
import NotFound from "../pages/NotFound";

function AppRoutes() {
    return (
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
    );
}

export default AppRoutes;
