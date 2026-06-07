import { Component } from "react";

class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, info) {
        console.error("ErrorBoundary caught:", error, info.componentStack);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    display:        "flex",
                    flexDirection:  "column",
                    alignItems:     "center",
                    justifyContent: "center",
                    minHeight:      "60vh",
                    padding:        "2rem",
                    textAlign:      "center",
                }}>
                    <h2 style={{ marginBottom: 12 }}>Something went wrong</h2>
                    <p style={{ color: "#666", marginBottom: 24 }}>
                        An unexpected error occurred. Please refresh the page.
                    </p>
                    <button
                        onClick={() => window.location.reload()}
                        style={{
                            padding:      "10px 24px",
                            background:   "#7b2cff",
                            color:        "#fff",
                            border:       "none",
                            borderRadius: 8,
                            cursor:       "pointer",
                            fontSize:     15,
                        }}
                    >
                        Refresh Page
                    </button>
                </div>
            );
        }
        return this.props.children;
    }
}

export default ErrorBoundary;
