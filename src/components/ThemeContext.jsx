// src/theme/ThemeContext.jsx
import React, { createContext, useState, useContext, useEffect } from "react";

// --- Centralized color palette ---
export const lightTheme = {
  background: "#ffffff",
  headerBg: "#f8f9fa",
  toolbarBg: "#e9ecef",
  sidebarBg: "#f1f3f5",
  text: "#212529",
  border: "#dee2e6",
  nodeBg: "#e3f2fd",
  edgeColor: "#000000",
  cardBg: "#ffffff",
  surface: "#ffffff",
  inputBg: "#ffffff",
  inputText: "#212529",
  subtleText: "#6b7280",
  placeholderText: "#6b7280",
  buttonBg: "#ffffff",
  buttonText: "#212529",
  hoverBg: "#e9ecef",

  primary: "#0066CC",
  accent: "#33CCFF",
  link: "#4f8cff",
  error: "#ff4d4d",
  googleBtnBg: "#ffffff",
  googleBtnText: "#333333",
  shadow: "rgba(22, 10, 122, 0.50)",
};

export const darkTheme = {
  background: "#121212",
  headerBg: "#1e1e1e",
  toolbarBg: "#2c2c2c",
  sidebarBg: "#252525",
  text: "#ffffff",
  border: "#333333",
  nodeBg: "#2b2b2b",
  edgeColor: "#ffffff",
  cardBg: "#2c2c2c",
  surface: "#2b2b3d",
  inputBg: "#2c2c2c",
  inputText: "#ffffff",
  subtleText: "#94a3b8",
  placeholderText: "#aaaaaa",
  buttonBg: "#2c2c2c",
  buttonText: "#ffffff",
  hoverBg: "#3a3a3a",

  primary: "#0066CC",
  accent: "#33CCFF",
  link: "#4f8cff",
  error: "#ff6b6b",
  googleBtnBg: "#3a3a4f",
  googleBtnText: "#f5f5f5",
  shadow: "rgba(22, 10, 122, 0.50)",
};


// --- Theme Context ---
const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState("dark");

  // Current theme colors **must be defined BEFORE useEffects**
  const themeColors = theme === "light" ? lightTheme : darkTheme;

  // Load saved theme
  useEffect(() => {
    const saved = localStorage.getItem("app-theme");
    if (saved === "light" || saved === "dark") {
      setTheme(saved);
    }
  }, []);

  // Save theme to localStorage
  useEffect(() => {
    localStorage.setItem("app-theme", theme);
  }, [theme]);

  // 🔥 Set global scrollbar gradient colors
  useEffect(() => {
    document.documentElement.style.setProperty(
      "--scroll-primary",
      themeColors.primary
    );
    document.documentElement.style.setProperty(
      "--scroll-accent",
      themeColors.accent
    );
  }, [themeColors]);

  const toggleTheme = () =>
    setTheme((prev) => (prev === "light" ? "dark" : "light"));

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, themeColors }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
