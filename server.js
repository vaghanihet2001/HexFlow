import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

const nodesFile = path.join(process.cwd(), "customNodes.json");

// Get all nodes
app.get("/nodes", (req, res) => {
  if (!fs.existsSync(nodesFile)) return res.json([]);
  const data = JSON.parse(fs.readFileSync(nodesFile));
  res.json(data);
});

// Save/update a node
app.post("/nodes", (req, res) => {
  const newNode = req.body;

  let nodes = [];
  if (fs.existsSync(nodesFile)) {
    nodes = JSON.parse(fs.readFileSync(nodesFile));
  }

  const index = nodes.findIndex((n) => n.id === newNode.id);
  if (index !== -1) {
    nodes[index] = newNode; // update
  } else {
    nodes.push(newNode); // add
  }

  fs.writeFileSync(nodesFile, JSON.stringify(nodes, null, 2));
  res.json({ success: true, nodes });
});

// Delete node
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

app.listen(PORT, () => console.log(`Backend running at http://localhost:${PORT}`));
