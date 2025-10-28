import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0",
    port: process.env.PORT || 5000,
    allowedHosts: ["hexflow.onrender.com"], // 👈 add your Render domain here
  },
});
