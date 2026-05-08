// src/utils/nodeDB.js
// IndexedDB wrapper for custom node persistence (no backend required)

const DB_NAME = "HexFlowDB";
const DB_VERSION = 1;
const STORE = "customNodes";

// ── Open / upgrade the database ──────────────────────────────────────────────
function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);

    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: "id" });
      }
    };

    req.onsuccess = (e) => resolve(e.target.result);
    req.onerror = (e) => reject(e.target.error);
  });
}

// ── Seed from bundled JSON — only on very first launch ever ─────────────────
// Uses a localStorage flag so that if the user deletes all nodes and refreshes,
// they get an empty sidebar instead of the defaults coming back.
const SEEDED_KEY = "hexflow_db_seeded";

async function seedOnFirstLaunch(db) {
  if (localStorage.getItem(SEEDED_KEY)) return; // already seeded before

  const { default: seed } = await import("../../customNodes.json");
  const tx = db.transaction(STORE, "readwrite");
  const store = tx.objectStore(STORE);
  seed.forEach((node) => store.put(node));
  await new Promise((res, rej) => {
    tx.oncomplete = res;
    tx.onerror = () => rej(tx.error);
  });

  localStorage.setItem(SEEDED_KEY, "true");
  console.log(`🗄️ IndexedDB seeded with ${seed.length} default nodes.`);
}

// ── Public API ────────────────────────────────────────────────────────────────

/** Return all custom nodes as an array */
export async function getAllNodes() {
  const db = await openDB();
  await seedOnFirstLaunch(db);

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readonly");
    const req = tx.objectStore(STORE).getAll();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

/** Insert or update a node (upsert by id) */
export async function upsertNode(node) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    const req = tx.objectStore(STORE).put(node);
    req.onsuccess = () => resolve(node);
    req.onerror = () => reject(req.error);
  });
}

/** Delete a single node by id */
export async function deleteNode(id) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    const req = tx.objectStore(STORE).delete(id);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

/** Wipe every custom node from the store */
export async function clearAllNodes() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    const req = tx.objectStore(STORE).clear();
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}
