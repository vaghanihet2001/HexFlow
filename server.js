import express from "express";
import cors from "cors";
import { fileURLToPath } from "url";
import path from "path";
import { createServer as createViteServer } from "vite";
import { env } from "process";
import admin from "firebase-admin";
import dotenv from "dotenv";
import fs from "fs";

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
    process.exit(1);
  }
}

const db = admin.firestore();

const app = express();
const PORT = env.BACKEND_PORT || 5173;

app.use(cors());
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
// 🔧 Firestore helpers (subcollection model)
// Path: users/{uid}/nodes/{nodeId}
// ===============================
const nodesCollectionRef = (uid) => db.collection("users").doc(uid).collection("nodes");

/**
 * List all nodes for a user
 */
const listUserNodes = async (uid) => {
  const colRef = nodesCollectionRef(uid);
  const snap = await colRef.get();
  return snap.docs.map((d) => {
    return { id: d.id, ...d.data() };
  });
};

/**
 * Upsert a single node as a document with id = node.id
 */
const upsertNodeDoc = async (uid, node) => {
  if (!node.id) throw new Error("Node must have an id");
  const docRef = nodesCollectionRef(uid).doc(node.id);
  await docRef.set(node, { merge: true }); // merge to avoid overwriting server-side fields if added later
  const saved = await docRef.get();
  return { id: saved.id, ...saved.data() };
};

/**
 * Delete a node document
 */
const deleteNodeDoc = async (uid, nodeId) => {
  const docRef = nodesCollectionRef(uid).doc(nodeId);
  await docRef.delete();
};

// ===============================
// 🚀 API ROUTES
// ===============================
app.get("/nodes", verifyFirebaseToken, async (req, res) => {
  const uid = req.user.uid;
  try {
    const nodes = await listUserNodes(uid);
    res.json(nodes);
  } catch (err) {
    console.error(`❌ Failed to list nodes for ${uid}:`, err);
    res.status(500).json({ error: "Failed to fetch nodes" });
  }
});

app.post("/nodes", verifyFirebaseToken, async (req, res) => {
  const uid = req.user.uid;
  const newNode = req.body;
  if (!newNode || !newNode.id) return res.status(400).json({ error: "Node must have an id" });

  try {
    const saved = await upsertNodeDoc(uid, newNode);
    res.json({ success: true, node: saved });
  } catch (err) {
    console.error(`❌ Failed to save node for ${uid}:`, err);
    res.status(500).json({ error: "Failed to save node" });
  }
});

app.delete("/nodes/:id", verifyFirebaseToken, async (req, res) => {
  const uid = req.user.uid;
  const nodeId = req.params.id;
  try {
    await deleteNodeDoc(uid, nodeId);
    res.json({ success: true });
  } catch (err) {
    console.error(`❌ Failed to delete node ${nodeId} for ${uid}:`, err);
    res.status(500).json({ error: "Failed to delete node" });
  }
});

// health
app.get("/healthz", (req, res) => res.json({ ok: true }));

// ===============================
// 🧩 Vite Dev + API Server (no migration)
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
