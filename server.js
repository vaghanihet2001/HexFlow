import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { env } from "process";
import admin from "firebase-admin";
import dotenv from "dotenv";

dotenv.config();

// ===============================
// 🔥 Initialize Firebase Admin
// ===============================
if (!admin.apps.length) {
  try {
    if (process.env.GOOGLE_APPLICATION_CREDENTIALS && fs.existsSync(process.env.GOOGLE_APPLICATION_CREDENTIALS)) {
      admin.initializeApp({
        credential: admin.credential.cert(process.env.GOOGLE_APPLICATION_CREDENTIALS),
      });
      console.log("✅ Firebase Admin initialized using service account file.");
    } else {
      admin.initializeApp({
        credential: admin.credential.applicationDefault(),
      });
      console.log("✅ Firebase Admin initialized (default credentials).");
    }
  } catch (err) {
    console.error("❌ Failed to initialize Firebase Admin:", err);
  }
}

const app = express();
const PORT = env.BACKEND_PORT || 5173;

app.use(cors());
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const nodesDir = path.join(process.cwd(), "user_nodes");

// Ensure nodes directory exists
if (!fs.existsSync(nodesDir)) {
  fs.mkdirSync(nodesDir, { recursive: true });
}

// ===============================
// 🔐 Firebase Token Verification Middleware
// ===============================
const verifyFirebaseToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing or invalid token" });
  }

  const token = authHeader.split("Bearer ")[1];
  try {
    const decoded = await admin.auth().verifyIdToken(token);
    req.user = decoded; // add user info to request
    next();
  } catch (err) {
    console.error("❌ Firebase auth error:", err);
    res.status(401).json({ error: "Unauthorized" });
  }
};

// ===============================
// 📁 Helper Functions
// ===============================
const getUserFile = (uid) => path.join(nodesDir, `${uid}.json`);

const readUserNodes = (uid) => {
  const filePath = getUserFile(uid);
  if (!fs.existsSync(filePath)) return [];
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (err) {
    console.error(`❌ Failed to read nodes for user ${uid}:`, err);
    return [];
  }
};

const writeUserNodes = (uid, data) => {
  const filePath = getUserFile(uid);
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    console.log(`💾 Saved ${data.length} nodes for user ${uid}`);
  } catch (err) {
    console.error(`❌ Failed to write nodes for user ${uid}:`, err);
  }
};

// ===============================
// 🚀 API ROUTES (Per-user storage)
// ===============================
app.get("/nodes", verifyFirebaseToken, (req, res) => {
  const uid = req.user.uid;
  const nodes = readUserNodes(uid);
  res.json(nodes);
});

app.post("/nodes", verifyFirebaseToken, (req, res) => {
  const uid = req.user.uid;
  const newNode = req.body;

  const nodes = readUserNodes(uid);
  const index = nodes.findIndex((n) => n.id === newNode.id);
  if (index !== -1) nodes[index] = newNode;
  else nodes.push(newNode);

  writeUserNodes(uid, nodes);
  res.json({ success: true, nodes });
});

app.delete("/nodes/:id", verifyFirebaseToken, (req, res) => {
  const uid = req.user.uid;
  const nodeId = req.params.id;

  let nodes = readUserNodes(uid);
  nodes = nodes.filter((n) => n.id !== nodeId);

  writeUserNodes(uid, nodes);
  res.json({ success: true });
});

// ===============================
// 🧩 Vite Dev + API Server
// ===============================
const startServer = async () => {
  const vite = await createViteServer({
    server: {
      middlewareMode: true,
      port: PORT,
      host: "0.0.0.0",
    },
    appType: "custom",
  });

  app.use(vite.middlewares);

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`✅ Server + Frontend running on http://0.0.0.0:${PORT}`);
  });
};

startServer();
