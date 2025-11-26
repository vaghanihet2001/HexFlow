import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./css/styles.css";

import { ThemeProvider } from "./components/ThemeContext";
import { AuthProvider, useAuth } from "./auth/AuthContext";
import LoginPage from "./pages/LoginPage";

// ==========================
// 🔔 EARLY BACKEND WAKE CALL
// ==========================
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

(async () => {
  try {
    await fetch(`${BACKEND_URL}/ping`);
    console.log("Backend pinged early.");
  } catch (err) {
    console.error("Early ping failed:", err);
  }
})();
// ==========================


function AppWithAuth() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontSize: "1.5rem",
        }}
      >
        Loading...
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  return <App />;
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <AppWithAuth />
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>
);
