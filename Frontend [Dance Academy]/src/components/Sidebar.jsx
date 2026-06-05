import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import "./Sidebar.css";

const PUBLIC_NAV = [
    { path: "/",        label: "Home" },
    { path: "/about",   label: "About Us" },
    { path: "/faq",     label: "FAQ" },
    { path: "/contact", label: "Contact Us" },
    { path: "/privacy", label: "Privacy Policy" },
    { path: "/terms",   label: "Terms & Conditions" },
];

const AUTH_NAV = [
    { path: "/profile", label: "My Profile" },
    { path: "/threads", label: "My Threads" },
];

const GUEST_NAV = [
    { path: "/login",           label: "Login" },
    { path: "/signup",          label: "Sign Up" },
    { path: "/forgot-password", label: "Forgot Password" },
];

const ADMIN_NAV = [
    { path: "/admin",            label: "Dashboard" },
    { path: "/admin/courses",    label: "Courses" },
    { path: "/admin/students",   label: "Students" },
    { path: "/admin/attendance", label: "Attendance" },
    { path: "/admin/fees",       label: "Fee / Payment" },
    { path: "/admin/events",     label: "Events" },
    { path: "/admin/messages",   label: "Messages" },
    { path: "/admin/threads",    label: "Threads" },
];

function NavItem({ path, label, collapsed, active }) {
    return (
        <Link
            to={path}
            className={`sidebar-link${active ? " active" : ""}`}
            title={collapsed ? label : ""}
        >
            <span className="sidebar-link-dot" />
            {!collapsed && <span className="sidebar-link-text">{label}</span>}
        </Link>
    );
}

function Sidebar({ collapsed, setCollapsed }) {
    const { pathname }           = useLocation();
    const navigate               = useNavigate();
    const { user, logout }       = useAuth();
    const { theme, toggleTheme } = useTheme();
    const [showSettings, setShowSettings] = useState(false);

    const isAdmin = user?.role === "admin";
    const isGuest = user?.role === "guest";
    const isLoggedIn = !!user && !isGuest;

    const roleLabel   = isAdmin ? "Admin" : isGuest ? "Guest" : "Student";
    const displayName = user?.firstname || user?.name || "User";

    function handleLogout() { logout(); navigate("/"); }

    function isActive(path) {
        return path === "/admin" ? pathname === "/admin" : pathname === path;
    }

    return (
        <aside className={`sidebar${collapsed ? " sidebar-collapsed" : ""}`}>
            <div className="sidebar-top">
                {!collapsed && <span className="sidebar-logo">Dance Academy</span>}
                <button
                    className="sidebar-toggle"
                    onClick={() => setCollapsed(c => !c)}
                    title={collapsed ? "Expand" : "Collapse"}
                >
                    {collapsed ? "»" : "«"}
                </button>
            </div>

            <nav className="sidebar-nav">
                <div className="sidebar-group">
                    {!collapsed && <div className="sidebar-section-label">Main Menu</div>}
                    {PUBLIC_NAV.map(({ path, label }) => (
                        <NavItem key={path} path={path} label={label} collapsed={collapsed} active={isActive(path)} />
                    ))}
                </div>

                {isLoggedIn && (
                    <div className="sidebar-group">
                        {!collapsed && <div className="sidebar-section-label">Account</div>}
                        {AUTH_NAV.map(({ path, label }) => (
                            <NavItem key={path} path={path} label={label} collapsed={collapsed} active={isActive(path)} />
                        ))}
                    </div>
                )}

                {!isLoggedIn && (
                    <div className="sidebar-group">
                        {!collapsed && <div className="sidebar-section-label">Account</div>}
                        {GUEST_NAV.map(({ path, label }) => (
                            <NavItem key={path} path={path} label={label} collapsed={collapsed} active={isActive(path)} />
                        ))}
                    </div>
                )}

                {isAdmin && (
                    <div className="sidebar-group">
                        {!collapsed && <div className="sidebar-section-label">Admin Panel</div>}
                        {ADMIN_NAV.map(({ path, label }) => (
                            <NavItem key={path} path={path} label={label} collapsed={collapsed} active={isActive(path)} />
                        ))}
                    </div>
                )}
            </nav>

            <div className="sidebar-footer">
                <button
                    className="sidebar-settings-btn"
                    onClick={() => setShowSettings(s => !s)}
                    title="Settings"
                >
                    <span className="settings-icon">&#9881;</span>
                    {!collapsed && <span>Settings</span>}
                </button>

                {showSettings && (
                    <div className={`settings-panel${collapsed ? " settings-panel-mini" : ""}`}>
                        {collapsed ? (
                            <button
                                className="theme-toggle-btn"
                                onClick={toggleTheme}
                                title={theme === "light" ? "Dark Mode" : "Light Mode"}
                            >
                                {theme === "light" ? "🌙" : "☀️"}
                            </button>
                        ) : (
                            <div className="settings-row">
                                <span>Theme</span>
                                <button className="theme-toggle-btn" onClick={toggleTheme}>
                                    {theme === "light" ? "Dark Mode" : "Light Mode"}
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {user && (
                    <>
                        <div className="sidebar-user-info">
                            <div className="sidebar-avatar">{displayName.charAt(0).toUpperCase()}</div>
                            {!collapsed && (
                                <div>
                                    <div className="sidebar-user-name">{displayName}</div>
                                    <div className="sidebar-user-role">{roleLabel}</div>
                                </div>
                            )}
                        </div>
                        <button className="sidebar-logout" onClick={handleLogout} title="Logout">
                            {collapsed ? "↩" : "Logout"}
                        </button>
                    </>
                )}
            </div>
        </aside>
    );
}

export default Sidebar;
