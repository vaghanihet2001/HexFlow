import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const app = express();

// Render dynamically sets the port for you:
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// -------- Serve Frontend (React Build) --------

// Get current directory (for ES modules)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static files from the dist folder
const distPath = path.join(__dirname, "dist");
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));

  // Fallback to index.html for React Router
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/nodes")) return next(); // skip API routes
    res.sendFile(path.join(distPath, "index.html"));
  });
}

// -------- Backend API --------

const nodesFile = path.join(process.cwd(), "customNodes.json");

app.get("/nodes", (req, res) => {
  if (!fs.existsSync(nodesFile)) return res.json([]);
  const data = JSON.parse(fs.readFileSync(nodesFile));
  res.json(data);
});

app.post("/nodes", (req, res) => {
  const newNode = req.body;
  let nodes = [];
  if (fs.existsSync(nodesFile)) {
    nodes = JSON.parse(fs.readFileSync(nodesFile));
  }

  const index = nodes.findIndex((n) => n.id === newNode.id);
  if (index !== -1) nodes[index] = newNode;
  else nodes.push(newNode);

  fs.writeFileSync(nodesFile, JSON.stringify(nodes, null, 2));
  res.json({ success: true, nodes });
});

app.delete("/nodes/:id", (req, res) => {
  const nodeId = req.params.id;
  let nodes = [];
  if (fs.existsSync(nodesFile)) {
    nodes = JSON.parse(fs.readFileSync(nodesFile));
  }
  nodes = nodes.filter((n) => n.id !== nodeId);
  fs.writeFileSync(nodesFile, JSON.stringify(nodes, null, 2));
  res.json({ success: true });
});

// -------- Start Server --------
app.listen(PORT, "0.0.0.0", () =>
  console.log(`Server running on port ${PORT}`)
);
