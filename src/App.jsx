// src/App.jsx
import React, { useState, useEffect } from "react";
import ReactFlow, { MiniMap, Controls, Background, useNodesState, useEdgesState } from "reactflow";
import "reactflow/dist/style.css";

import { nodeTypes, availableNodes } from "./nodes";
import { componentTypes } from "./components";
import CustomEdge from "./components/CustomEdge";
import { useFlowHandlers } from "./hooks/useFlowHandlers";

const Sidebar = componentTypes.sideBar;
const Toolbar = componentTypes.toolBar;
const NodeDetailsPanel = componentTypes.nodeDetailsPanel;

export default function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState(null);
  const [showNodeDetails, setShowNodeDetails] = useState(true);
  const [allNodes, setAllNodes] = useState(availableNodes);
  const [history, setHistory] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  const [copiedNodes, setCopiedNodes] = useState([]);
  const toolbarHeight = 50;

  // --- Persistence ---
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

  // --- Flow Handlers ---
  const { addNode, onConnect, deleteNode, deleteEdge } = useFlowHandlers(
    nodes,
    setNodes,
    edges,
    setEdges,
    pushToHistory
  );

  const updateNodeField = (nodeId, fieldId, key, value) => {
    setNodes((nds) =>
      nds.map((n) =>
        n.id === nodeId
          ? { ...n, data: { ...n.data, fields: n.data.fields?.map((f) => (f.id === fieldId ? { ...f, [key]: value } : f)) } }
          : n
      )
    );
  };

  const updateNodeData = (nodeId, key, value) => {
    setNodes((nds) =>
      nds.map((n) => (n.id === nodeId ? { ...n, data: { ...n.data, [key]: value } } : n))
    );
  };

  const selectedNode = nodes.find((n) => n.id === selectedNodeId);

  // --- Keyboard shortcuts: undo/redo, delete, copy/paste ---
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

  // --- Undo / Redo ---
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

  return (
    <div
      style={{ display: "flex", flexDirection: "column", height: "100vh", width: "100vw" }}
      onClick={() => setSelectedEdgeId(null)}
    >
      <div style={{ height: `${toolbarHeight}px`, flexShrink: 0 }}>
        <Toolbar nodes={nodes} edges={edges} setNodes={setNodes} setEdges={setEdges} />
      </div>

      <div style={{ display: "flex", flexGrow: 1, height: `calc(100vh - ${toolbarHeight}px)`, overflow: "hidden" }}>
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
            onDeleteCustomNode={(nodeId) => setAllNodes((prev) => prev.filter((n) => n.id !== nodeId))}
          />
        </div>

        <div style={{ flexGrow: 1, border: "1px solid #ccc", height: "100%" }}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            edgeTypes={{ custom: CustomEdge }}
            onNodeClick={(e, node) => setSelectedNodeId(node.id)}
            onEdgeClick={(e, edge) => setSelectedEdgeId(edge.id)}
            onSelectionChange={({ nodes: selNodes, edges: selEdges }) => {
              setSelectedNodeId(selNodes[0]?.id || null);
              setSelectedEdgeId(selEdges[0]?.id || null);
            }}
            minZoom={0.1}   // allow zooming out further
            maxZoom={2}     // limit zoom in
            zoomOnScroll={true}
            zoomOnPinch={true}
            fitView
          >
            <MiniMap />
            <Controls />
            <Background />
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
      </div>
    </div>
  );
}
