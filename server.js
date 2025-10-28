import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = 5173;

app.use(cors());
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const nodesFile = path.join(process.cwd(), "customNodes.json");

// === API ROUTES ===
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

// === START VITE DEV SERVER ===
const startServer = async () => {
  const vite = await createViteServer({
    server: { middlewareMode: true, port: PORT, host: "0.0.0.0" },
    appType: "custom",
  });

  app.use(vite.middlewares);

  app.listen(PORT, "0.0.0.0", () =>
    console.log(`✅ Server + Frontend running on http://0.0.0.0:${PORT}`)
  );
};

startServer();
