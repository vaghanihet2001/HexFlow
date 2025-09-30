# ReactFlow Playground

A visual graph editor built with **ReactFlow** and **React**, allowing you to create, edit, save, load, and export node-based graphs. This project includes a **custom node details panel**, a **toolbar for file operations**, and full **undo/redo support**.

## Features

- **Drag-and-drop nodes** from the sidebar onto the canvas  
- **Edit node details** using a dedicated panel  
- **Select and manipulate edges and nodes**  
- **Keyboard shortcuts**:
  - Ctrl + C → Copy Node
  - Ctrl + V → Paste Node
  - Delete → Delete Node/Edge
  - Ctrl + Z → Undo
  - Ctrl + Shift + Z → Redo
- **File Operations**:
  - Save graph as JSON
  - Load graph from JSON
  - Start a new graph
  - Export graph as high-resolution image
- **Persistent state**: automatically saves your flow in `localStorage`
- **Custom edge support** for advanced visual connections
- **MiniMap, Controls, and Background** for easier navigation

## Project Setup

### 1. Clone the repository

```bash
git clone https://github.com/vaghanihet2001/Flowgraph.git 
cd reactflow-playground
```
### 2. Install dependencies
```bash
npm install
```

or if you use Yarn:

```bash
yarn install
```

### 3. Start the development server
```bash
npm run dev
```
or with Yarn:

```bash
yarn dev
```
Open http://localhost:5173 in your browser to see the project.

Folder Structure
```bash
reactflow-playground/
├─ src/
│  ├─ components/       
|  |    # React components 
|  |   (  Toolbar,
|  |      Sidebar,
|  |      NodeDetailsPanel, 
|  |      CustomEdge )
│  ├─ hooks/            # Custom hooks(useFlowHandlers)
│  ├─ nodes.js           # Node definitions and nodeTypes
│  ├─ App.jsx            # Main App component
│  └─ index.jsx          # Entry point
├─ public/               # Public assets
├─ package.json
└─ README.md
```
## Usage
<ul>
<li>Drag nodes from the sidebar to the canvas</li>
<li>Click on a node to open the Node Details Panel</li>
<li>Edit node labels and custom fields</li>
<li>Connect nodes using edges by dragging from node handles</li>
<li>Use the toolbar to save/load your graph or export it as an image</li>
<li>Use keyboard shortcuts to speed up workflow</li>
</ul>

## Notes
The graph is automatically saved in localStorage. You can reload the page and continue from your last state

High-resolution image export captures the entire canvas with improved readability

Node copy/paste and undo/redo works for all nodes and edges

## Dependencies
<ul>
<li>React</li>
<li>ReactFlow</li>
<li>React-Bootstrap</li>
<li>html-to-image</li>