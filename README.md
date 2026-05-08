# 🌊 HexFlow

**HexFlow** is a powerful, visual node-based flow editor built with **ReactFlow** and **React**.  
Design, connect, and document system architectures, data pipelines, and workflows — all in the browser. No backend required.

🔗 **[Live Demo → hexverce.in/projects/hexflow](https://www.hexverce.in/projects/hexflow)**

---

## 🧠 Project Overview

HexFlow lets you visually map out complex systems using a rich drag-and-drop canvas.  
It's designed to be lightweight, fully offline-capable, and instantly deployable via Docker.

- 🎨 Drag & drop nodes from a customisable sidebar onto an infinite canvas
- 🔗 Connect nodes with smart, typed edges
- 💾 Auto-saves your flow to `localStorage` — resume exactly where you left off
- 🗄️ Custom node library stored in **IndexedDB** — no backend needed
- 🌙 Full dark / light theme support

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | ⚛️ React + ReactFlow |
| **Storage** | 🗄️ IndexedDB (nodes) + localStorage (flow state) |
| **Auth** | 🔐 Firebase Auth *(optional — off by default)* |
| **Deployment** | 🐳 Docker |

---

## ⚙️ How to Run

### 🐳 Docker (recommended)

```bash
git clone https://github.com/vaghanihet2001/HexFlow.git
cd HexFlow
cp .env.example .env   # edit if needed
docker compose up --build
```

🌐 Open **http://localhost:5000** in your browser.

### 💻 Local Dev

```bash
npm install
npm run start:frontend
```

---

## 🔐 Authentication (Optional)

Firebase Authentication is **disabled by default**. The app runs in **offline mode** — no login required, no Firebase credentials needed.

| `VITE_ENABLE_AUTH` | Behaviour |
|---|---|
| `false` *(default)* | App opens directly, no login. Firebase credentials are **not** required. |
| `true` | Login screen is shown. Firebase credentials **must** be set in `.env`. |

To enable auth, set the flag in your `.env` and fill in your Firebase project credentials:

```env
VITE_ENABLE_AUTH=true

VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

> **Note:** If `VITE_ENABLE_AUTH=false`, all Firebase variables are ignored and can be left blank.

---

## 🗄️ Custom Node Storage

Custom nodes are persisted in the browser's **IndexedDB** — no server, no database setup.

- On **first launch**, the app seeds a library of 19 general-purpose nodes automatically
- **Create, edit, and delete** nodes persist across page refreshes
- If you delete all nodes and refresh, the sidebar stays **empty** (won't re-seed)
- Clearing browser data (or opening in a new browser) restores the default nodes

---

## ✨ Features

✅ Drag & drop nodes from sidebar to canvas  
✅ Click a node to open its detail panel and edit fields  
✅ Connect nodes by dragging from handles  
✅ Custom node builder — create your own node types with custom fields  
✅ 19 general-purpose built-in node templates  
✅ **Keyboard shortcuts**:

| Shortcut | Action |
|---|---|
| `Ctrl + C` | Copy node |
| `Ctrl + V` | Paste node |
| `Delete` | Delete selected node / edge |
| `Ctrl + Z` | Undo |
| `Ctrl + Shift + Z` | Redo |

✅ **File operations** via toolbar:
- 💾 Save flow as JSON
- 📂 Load flow from JSON
- 🖼️ Export canvas as high-resolution image
- 🗑️ Start fresh

✅ MiniMap, zoom controls, and dot-grid background  
✅ Dark / Light theme toggle  
✅ Optional Firebase Authentication  

---

## 📦 Folder Structure

```
HexFlow/
├── src/
│   ├── auth/              # Firebase auth + AuthContext
│   ├── components/        # Header, Sidebar, Panels, Toolbar, etc.
│   ├── hooks/             # useFlowHandlers
│   ├── nodes/             # Built-in node type definitions
│   ├── pages/             # LoginPage
│   ├── utils/             # nodeDB.js (IndexedDB wrapper)
│   └── App.jsx            # Main canvas + layout
├── customNodes.json       # Default node library (seed data)
├── .env.example           # Environment variable template
├── docker-compose.yml
├── Dockerfile
└── README.md
```

---

## 🌐 Environment Variables

Copy `.env.example` to `.env` before running:

```bash
cp .env.example .env
```

| Variable | Required | Description |
|---|---|---|
| `FRONTEND_PORT` | ✅ | Port for the Vite dev server (default: `5000`) |
| `VITE_ALLOWED_HOSTS` | ✅ | Comma-separated allowed hostnames |
| `VITE_ENABLE_AUTH` | ✅ | `true` to enable login, `false` for offline mode |
| `VITE_FIREBASE_*` | ⚠️ Only if auth enabled | Firebase project credentials |

---

## 🧑‍💻 Author

### Vaghani Het

📫 <a href="https://github.com/vaghanihet2001">GitHub Profile</a> · <a href="https://hexverce.in/">HexVerce</a> · <a href="https://www.hexverce.in/projects/hexflow">HexFlow Live</a>

---

## 📝 License

This project is open-source and available under the [GNU General Public License v3.0 (GPL-3.0)](LICENSE).
