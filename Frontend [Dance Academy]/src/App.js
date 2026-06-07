import { useState } from "react";
import { BrowserRouter, useLocation } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import Sidebar from "./components/Sidebar";
import ScrollToTop from "./components/ScrollToTop";
import ErrorBoundary from "./components/ErrorBoundary";
import AppRoutes from "./routes/AppRoutes";
import "./App.css";

const AUTH_PATHS = ["/login", "/signup", "/forgot-password", "/reset-password"];

function Layout() {
    const { pathname } = useLocation();
    const [collapsed, setCollapsed] = useState(false);

    const isAuthPage = AUTH_PATHS.includes(pathname);

    if (isAuthPage) {
        return (
            <ErrorBoundary>
                <AppRoutes />
            </ErrorBoundary>
        );
    }

    return (
        <div className="app-layout">
            <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
            <div className={`app-content${collapsed ? " collapsed" : ""}`}>
                <ErrorBoundary>
                    <AppRoutes />
                </ErrorBoundary>
            </div>
        </div>
    );
}

function App() {
    return (
        <BrowserRouter>
            <ThemeProvider>
                <AuthProvider>
                    <ScrollToTop />
                    <Layout />
                </AuthProvider>
            </ThemeProvider>
        </BrowserRouter>
    );
}

export default App;
