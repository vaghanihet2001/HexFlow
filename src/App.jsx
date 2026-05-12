// src/App.jsx
import React, { useState, useEffect } from "react";
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
} from "reactflow";
import "reactflow/dist/style.css";

import { nodeTypes, availableNodes } from "./nodes";
import { componentTypes } from "./components";
import CustomEdge from "./components/CustomEdge";
import EdgeDetailsPanel from "./components/EdgeDetailsPanel";
import DatabaseNodeDetailsPanel from "./components/DatabaseNodeDetailsPanel";
import { useFlowHandlers } from "./hooks/useFlowHandlers";
import { useTheme } from "./components/ThemeContext";
import { getAllNodes, bulkUpsertNodes, getDefaultNodes, clearAllNodes } from "./utils/nodeDB";

const Sidebar = componentTypes.sideBar;
const Toolbar = componentTypes.toolBar;
const NodeDetailsPanel = componentTypes.nodeDetailsPanel;
const Header = componentTypes.header;

const HEADER_HEIGHT = 60;
const TOOLBAR_HEIGHT = 50;

// Default node size
const DEFAULT_NODE_WIDTH = 200;
const DEFAULT_NODE_HEIGHT = 120;

export default function App() {
  const { themeColors } = useTheme();

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [initialized, setInitialized] = useState(false); // ✅ NEW
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState(null);
  const [showNodeDetails, setShowNodeDetails] = useState(true);
  const [allNodes, setAllNodes] = useState(availableNodes);
  const [history, setHistory] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  const [copiedNodes, setCopiedNodes] = useState([]);
  const [copiedEdges, setCopiedEdges] = useState([]); // 🔥 Added for multi-copy
  const [selectedNodes, setSelectedNodes] = useState([]); // 🔥 Added for multi-select
  const [selectedEdges, setSelectedEdges] = useState([]); // 🔥 Added for multi-select
  const [reactFlowInstance, setReactFlowInstance] = useState(null); // ✅ NEW
  const [sidebarRefreshKey, setSidebarRefreshKey] = useState(0); // 🔥 Triggers sidebar reload

  // 👓 View Options
  const [viewOptions, setViewOptions] = useState({
    minimap: true,
    controls: true,
    background: true,
  });

  // 1️⃣ Load from localStorage once on mount
  useEffect(() => {
    const saved = localStorage.getItem("flowState");
    if (saved) {
      try {
        const { nodes: savedNodes, edges: savedEdges } = JSON.parse(saved);
        setNodes(savedNodes || []);
        setEdges(savedEdges || []);
      } catch (err) {
        console.error("Failed to parse flowState:", err);
      }
    }
    setInitialized(true); // ✅ Only after loading complete
  }, []);

  // 2️⃣ Save only after initialization to avoid overwriting
  useEffect(() => {
    if (!initialized) return;
    localStorage.setItem("flowState", JSON.stringify({ nodes, edges }));
  }, [nodes, edges, initialized]);

  const pushToHistory = (newNodes, newEdges) => {
    setHistory((h) => [...h, { nodes: newNodes, edges: newEdges }]);
    setRedoStack([]);
  };

  // Flow handlers
  const { addNode: baseAddNode, onConnect, deleteNodes, deleteEdges } = useFlowHandlers(
    nodes,
    setNodes,
    edges,
    setEdges,
    pushToHistory,
    reactFlowInstance // ✅ Pass instance
  );

  const addNode = (node) => {
    const newNode = {
      ...node,
      width: node.width || DEFAULT_NODE_WIDTH,
      height: node.height || DEFAULT_NODE_HEIGHT,
      data: { ...node.data },
    };
    baseAddNode(newNode);
  };

  const updateNodeField = (nodeId, fieldId, key, value) => {
    setNodes((nds) =>
      nds.map((n) =>
        n.id === nodeId
          ? {
            ...n,
            data: {
              ...n.data,
              fields: n.data.fields?.map((f) =>
                f.id === fieldId ? { ...f, [key]: value } : f
              ),
            },
          }
          : n
      )
    );
  };

  const updateNodeData = (nodeId, key, value) => {
    setNodes((nds) =>
      nds.map((n) =>
        n.id === nodeId ? { ...n, data: { ...n.data, [key]: value } } : n
      )
    );
  };

  const updateEdgeData = (edgeId, key, value) => {
    setEdges((eds) =>
      eds.map((e) =>
        e.id === edgeId
          ? { ...e, data: { ...e.data, [key]: value } }
          : e
      )
    );
  };

  const updateEdgeType = (edgeId, newType) => {
    setEdges((eds) =>
      eds.map((e) =>
        e.id === edgeId
          ? { ...e, type: "custom", data: { ...e.data, type: newType } }
          : e
      )
    );
  };

  const selectedNode = nodes.find((n) => n.id === selectedNodeId);
  const selectedEdge = edges.find((e) => e.id === selectedEdgeId);

  // 🧠 Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "c" && selectedNodes.length) {
        e.preventDefault();
        setCopiedNodes(selectedNodes);
        
        // Find edges that connect two nodes in the current selection
        const internalEdges = edges.filter(
          (e) =>
            selectedNodes.some((n) => n.id === e.source) &&
            selectedNodes.some((n) => n.id === e.target)
        );
        setCopiedEdges(internalEdges);
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "v" && copiedNodes.length) {
        e.preventDefault();

        const nodeIdMap = {};
        const offset = 80;

        // 1. Create new nodes with fresh IDs and update map
        const newNodes = copiedNodes.map((node, index) => {
          const newId = `node-${Date.now()}-${index}-${Math.floor(Math.random() * 1000)}`;
          nodeIdMap[node.id] = newId;
          return {
            ...node,
            id: newId,
            selected: true,
            position: { x: node.position.x + offset, y: node.position.y + offset },
            data: { ...node.data, instanceId: Date.now() + Math.random() },
          };
        });

        // 2. Create new edges using the ID map
        const newEdges = copiedEdges.map((edge, index) => ({
          ...edge,
          id: `e-${Date.now()}-${index}-${Math.floor(Math.random() * 1000)}`,
          source: nodeIdMap[edge.source],
          target: nodeIdMap[edge.target],
          selected: true,
        }));

        pushToHistory(nodes, edges);

        // 3. Deselect old nodes/edges and add new ones
        setNodes((nds) => [
          ...nds.map((n) => ({ ...n, selected: false })),
          ...newNodes,
        ]);
        setEdges((eds) => [
          ...eds.map((e) => ({ ...e, selected: false })),
          ...newEdges,
        ]);

        // 4. Update selection state to ONLY the new ones
        setSelectedNodes(newNodes);
        setSelectedEdges(newEdges);
        setSelectedNodeId(newNodes[0]?.id || null);
      } else if (e.ctrlKey && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        undo();
      } else if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "z") {
        e.preventDefault();
        redo();
      } else if (e.key === "Delete") {
        if (selectedNodes.length) {
          deleteNodes(selectedNodes.map((n) => n.id));
          setSelectedNodes([]);
          setSelectedNodeId(null);
        } else if (selectedEdges.length) {
          deleteEdges(selectedEdges.map((e) => e.id));
          setSelectedEdges([]);
          setSelectedEdgeId(null);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedNodes, selectedEdges, nodes, edges, history, redoStack, copiedNodes, copiedEdges]);

  const undo = () => {
    if (!history.length) return;
    const prev = history[history.length - 1];
    setRedoStack((r) => [...r, { nodes, edges }]);
    setNodes(prev.nodes);
    setEdges(prev.edges);
    setHistory((h) => h.slice(0, -1));
    setSelectedNodeId(null);
    setSelectedEdgeId(null);
  };

  const redo = () => {
    if (!redoStack.length) return;
    const next = redoStack[redoStack.length - 1];
    setHistory((h) => [...h, { nodes, edges }]);
    setNodes(next.nodes);
    setEdges(next.edges);
    setRedoStack((r) => r.slice(0, -1));
    setSelectedNodeId(null);
    setSelectedEdgeId(null);
  };

  const handleFileLoad = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const { nodes: loadedNodes, edges: loadedEdges } = JSON.parse(e.target.result);
        if (loadedNodes && loadedEdges) {
          const fixedNodes = loadedNodes.map((n) => ({
            ...n,
            width: n.width || DEFAULT_NODE_WIDTH,
            height: n.height || DEFAULT_NODE_HEIGHT,
          }));
          setNodes(fixedNodes);
          setEdges(loadedEdges);
          pushToHistory(fixedNodes, loadedEdges);
        }
      } catch (err) {
        console.error("Invalid flow file:", err);
        alert("Invalid flow JSON file");
      }
    };
    reader.readAsText(file);
  };

  // =============================
  // 📦 CUSTOM NODE ACTIONS
  // =============================
  const handleExportNodes = async () => {
    try {
      const allCustomNodes = await getAllNodes();
      const json = JSON.stringify(allCustomNodes, null, 2);
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "custom_nodes.json";
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export nodes failed:", err);
    }
  };

  const handleImportNodes = async (nodesToImport) => {
    try {
      if (!Array.isArray(nodesToImport)) throw new Error("Invalid data format");
      await bulkUpsertNodes(nodesToImport);
      setSidebarRefreshKey((prev) => prev + 1);
    } catch (err) {
      console.error("Import nodes failed:", err);
      alert("Failed to import nodes: " + err.message);
    }
  };

  const handleFetchDefaultNodes = async () => {
    try {
      const defaults = await getDefaultNodes();
      await bulkUpsertNodes(defaults);
      setSidebarRefreshKey((prev) => prev + 1);
    } catch (err) {
      console.error("Fetch default nodes failed:", err);
    }
  };

  const handleRemoveAllNodes = async () => {
    try {
      await clearAllNodes();
      setSidebarRefreshKey((prev) => prev + 1);
    } catch (err) {
      console.error("Remove all nodes failed:", err);
    }
  };

  const toggleViewOption = (option) => {
    setViewOptions((prev) => ({ ...prev, [option]: !prev[option] }));
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        width: "100vw",
        backgroundColor: themeColors.background,
      }}
      onClick={() => setSelectedEdgeId(null)}
    >
      <Header />
      <div style={{ height: `${TOOLBAR_HEIGHT}px`, flexShrink: 0 }}>
        <Toolbar
          nodes={nodes}
          edges={edges}
          setNodes={setNodes}
          setEdges={setEdges}
          onExportNodes={handleExportNodes}
          onImportNodes={handleImportNodes}
          onFetchDefaultNodes={handleFetchDefaultNodes}
          onRemoveAllNodes={handleRemoveAllNodes}
          viewOptions={viewOptions}
          onToggleView={toggleViewOption}
        />
      </div>

      <div
        style={{
          display: "flex",
          flexGrow: 1,
          height: `calc(100vh - ${HEADER_HEIGHT + TOOLBAR_HEIGHT}px)`,
          overflow: "hidden",
        }}
      >
        <div style={{ height: "100%", overflowY: "auto", flexShrink: 0 }}>
          <Sidebar
            availableNodes={allNodes}
            onAddNode={addNode}
            refreshKey={sidebarRefreshKey} // 🔥 added
            onSaveCustomNode={(node) => {
              setAllNodes((prev) => {
                const exists = prev.find((n) => n.id === node.id);
                return exists ? prev.map((n) => (n.id === node.id ? node : n)) : [...prev, node];
              });
            }}
            onDeleteCustomNode={(nodeId) =>
              setAllNodes((prev) => prev.filter((n) => n.id !== nodeId))
            }
          />
        </div>

        <div
          style={{
            flexGrow: 1,
            border: `1px solid ${themeColors.border}`,
            height: "100%",
          }}
        >
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onInit={setReactFlowInstance} // ✅ Capture instance
            nodeTypes={nodeTypes}
            edgeTypes={{ custom: CustomEdge }}
            onNodeClick={(e, node) => {
              setSelectedNodeId(node.id);
              setShowNodeDetails(true);
            }}
            onEdgeClick={(e, edge) => {
              setSelectedEdgeId(edge.id);
              setSelectedNodeId(null);
            }}
            onPaneClick={() => {
              setShowNodeDetails(false);
              setSelectedEdgeId(null);
              setSelectedNodes([]); // 🔥 Clear on pane click
              setSelectedEdges([]); // 🔥 Clear on pane click
            }}
            onSelectionChange={({ nodes: selNodes, edges: selEdges }) => {
              setSelectedNodes(selNodes); // 🔥 Multi-select
              setSelectedEdges(selEdges); // 🔥 Multi-select
              setSelectedNodeId(selNodes[0]?.id || null);
              setSelectedEdgeId(selEdges[0]?.id || null);
            }}
            selectionOnDrag={true} // 🔥 Enable selection box
            selectionMode="partial" // 🔥 Select nodes even if only partially covered
            panOnDrag={[1, 2]} // 🔥 Allow panning with middle/right mouse or space drag
            minZoom={0.1}
            maxZoom={2}
            zoomOnScroll
            zoomOnPinch
            fitView
          >
            {viewOptions.minimap && <MiniMap nodeColor={(n) => n.color || themeColors.nodeBg} />}
            {viewOptions.controls && <Controls />}
            {viewOptions.background && (
              <Background color={themeColors.text} variant={BackgroundVariant.Dots} />
            )}
          </ReactFlow>
        </div>

        {showNodeDetails && selectedNode && selectedNode.type !== "databaseSchema" && (
          <NodeDetailsPanel
            node={selectedNode}
            updateNodeField={updateNodeField}
            updateNodeData={updateNodeData}
            deleteNode={() => deleteNodes(selectedNode.id)} // 🔥 Updated
            onClosePanel={() => setShowNodeDetails(false)}
          />
        )}

        {showNodeDetails && selectedNode && selectedNode.type === "databaseSchema" && (
          <DatabaseNodeDetailsPanel
            node={selectedNode}
            updateNodeData={updateNodeData}
            deleteNode={() => deleteNodes(selectedNode.id)} // 🔥 Updated
            onClosePanel={() => setShowNodeDetails(false)}
          />
        )}

        {selectedEdge && !selectedNode && (
          <EdgeDetailsPanel
            edge={selectedEdge}
            updateEdgeData={updateEdgeData}
            updateEdgeType={updateEdgeType}
            deleteEdge={() => deleteEdges(selectedEdge.id)} // 🔥 Updated
            onClosePanel={() => setSelectedEdgeId(null)}
          />
        )}
      </div>
    </div>
  );
}
