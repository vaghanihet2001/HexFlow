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
import { useFlowHandlers } from "./hooks/useFlowHandlers";
import { useTheme } from "./components/ThemeContext";

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
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState(null);
  const [showNodeDetails, setShowNodeDetails] = useState(true);
  const [allNodes, setAllNodes] = useState(availableNodes);
  const [history, setHistory] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  const [copiedNodes, setCopiedNodes] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem("flowState");
    if (saved) {
      const { nodes: savedNodes, edges: savedEdges } = JSON.parse(saved);
      setNodes(savedNodes || []);
      setEdges(savedEdges || []);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("flowState", JSON.stringify({ nodes, edges }));
  }, [nodes, edges]);

  const pushToHistory = (newNodes, newEdges) => {
    setHistory((h) => [...h, { nodes: newNodes, edges: newEdges }]);
    setRedoStack([]);
  };

  // Wrap original addNode to add default width/height
  const { addNode: baseAddNode, onConnect, deleteNode, deleteEdge } = useFlowHandlers(
    nodes,
    setNodes,
    edges,
    setEdges,
    pushToHistory
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
          ? { ...e, data: { ...e.data, [key]: value } } // only data object changes
          : e
      )
    );
  };


  const updateEdgeType = (edgeId, newType) => {
    setEdges((eds) =>
      eds.map((e) =>
        e.id === edgeId
          ? { ...e, type: "custom", data: { ...e.data, type: newType } } // type always stays 'custom'
          : e
      )
    );
  };


  const selectedNode = nodes.find((n) => n.id === selectedNodeId);
  const selectedEdge = edges.find((e) => e.id === selectedEdgeId);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "c" && selectedNodeId) {
        e.preventDefault();
        const nodeToCopy = nodes.find((n) => n.id === selectedNodeId);
        if (nodeToCopy) setCopiedNodes([nodeToCopy]);
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "v" && copiedNodes.length) {
        e.preventDefault();
        const newNodes = copiedNodes.map((node) => ({
          ...node,
          id: `node-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          position: { x: node.position.x + 20, y: node.position.y + 20 },
          width: node.width || DEFAULT_NODE_WIDTH,
          height: node.height || DEFAULT_NODE_HEIGHT,
          data: { ...node.data, instanceId: Date.now() + Math.random() },
        }));
        pushToHistory(nodes, edges);
        setNodes((nds) => [...nds, ...newNodes]);
        setSelectedNodeId(newNodes[0].id);
      } else if (e.ctrlKey && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        undo();
      } else if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "z") {
        e.preventDefault();
        redo();
      } else if (e.key === "Delete") {
        if (selectedNodeId) deleteNode(selectedNodeId);
        else if (selectedEdgeId) deleteEdge(selectedEdgeId);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedNodeId, selectedEdgeId, nodes, edges, history, redoStack, copiedNodes]);

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
          // Ensure all loaded nodes have width/height
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
        <Toolbar nodes={nodes} edges={edges} setNodes={setNodes} setEdges={setEdges} />
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
            }}
            onSelectionChange={({ nodes: selNodes, edges: selEdges }) => {
              setSelectedNodeId(selNodes[0]?.id || null);
              setSelectedEdgeId(selEdges[0]?.id || null);
            }}
            minZoom={0.1}
            maxZoom={2}
            zoomOnScroll
            zoomOnPinch
            fitView
          >
            <MiniMap nodeColor={(n) => n.color || themeColors.nodeBg} />
            <Controls />
            <Background color={themeColors.text} variant={BackgroundVariant.Dots} />
          </ReactFlow>
        </div>

        {showNodeDetails && selectedNode && (
          <NodeDetailsPanel
            node={selectedNode}
            updateNodeField={updateNodeField}
            updateNodeData={updateNodeData}
            deleteNode={deleteNode}
            onClosePanel={() => setShowNodeDetails(false)}
          />
        )}

        {selectedEdge && !selectedNode && (
          <EdgeDetailsPanel
            edge={selectedEdge}
            updateEdgeData={updateEdgeData}
            updateEdgeType={updateEdgeType}
            deleteEdge={deleteEdge}
            onClosePanel={() => setSelectedEdgeId(null)}
          />
        )}
      </div>
    </div>
  );
}
