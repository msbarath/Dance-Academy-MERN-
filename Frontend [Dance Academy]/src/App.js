import { useState } from "react";
import { BrowserRouter, useLocation } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import Sidebar from "./components/Sidebar";
import ScrollToTop from "./components/ScrollToTop";
import AppRoutes from "./routes/AppRoutes";
import "./App.css";

const AUTH_PATHS = ["/login", "/signup", "/forgot-password"];

function Layout() {
    const { pathname } = useLocation();
    const [collapsed, setCollapsed] = useState(false);

    if (AUTH_PATHS.includes(pathname)) return <AppRoutes />;

    return (
        <div className="app-layout">
            <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
            <main className={`app-content${collapsed ? " collapsed" : ""}`}>
                <AppRoutes />
            </main>
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
