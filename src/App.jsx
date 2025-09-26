import React, { useCallback, useState, useEffect } from "react";
import ReactFlow, {
  addEdge,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  BaseEdge,
  getBezierPath,
} from "reactflow";
import "reactflow/dist/style.css";

import { nodeTypes, availableNodes } from "./nodes";
import { componentTypes } from "./components";

const Sidebar = componentTypes.sideBar;
const Toolbar = componentTypes.toolBar;
const NodeDetailsPanel = componentTypes.nodeDetailsPanel;

let idCounter = 1;

// --- Custom Edge Component ---
const CustomEdge = ({ id, sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition, selected }) => {
  const [edgePath] = getBezierPath({ sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition });
  return (
    <BaseEdge
      id={id}
      path={edgePath}
      style={{ stroke: selected ? "#ff5555" : "#222", strokeWidth: selected ? 2 : 1 }}
    />
  );
};

const edgeTypes = { custom: CustomEdge };

export default function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState(null);
  const [showNodeDetails, setShowNodeDetails] = useState(true);
  const [allNodes, setAllNodes] = useState(availableNodes);
  const [history, setHistory] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
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

  const undo = () => {
    if (history.length > 0) {
      const prev = history[history.length - 1];
      setRedoStack((r) => [...r, { nodes, edges }]);
      setNodes(prev.nodes);
      setEdges(prev.edges);
      setHistory((h) => h.slice(0, -1));
      setSelectedNodeId(null);
      setSelectedEdgeId(null);
    }
  };

  const redo = () => {
    if (redoStack.length > 0) {
      const next = redoStack[redoStack.length - 1];
      setHistory((h) => [...h, { nodes, edges }]);
      setNodes(next.nodes);
      setEdges(next.edges);
      setRedoStack((r) => r.slice(0, -1));
      setSelectedNodeId(null);
      setSelectedEdgeId(null);
    }
  };

  // --- Keyboard shortcuts ---
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.key === "z" && !e.shiftKey) {
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
  }, [selectedNodeId, selectedEdgeId, nodes, edges, history, redoStack]);

  // --- Node / Edge handlers ---
  const onNodeClick = (event, node) => {
    setSelectedNodeId(node.id);
    setSelectedEdgeId(null);
    setShowNodeDetails(true);
  };

  const onEdgeClick = (event, edge) => {
    setSelectedEdgeId(edge.id);
    setSelectedNodeId(null);
  };

  const onConnect = useCallback(
    (params) => {
      pushToHistory(nodes, edges);
      const newEdge = {
        ...params,
        id: `e-${params.source}-${params.target}-${Date.now()}`,
        type: "custom",
      };
      setEdges((eds) => [...eds, newEdge]);
    },
    [nodes, edges]
  );

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

  const deleteNode = (nodeId) => {
    pushToHistory(nodes, edges);
    setNodes((nds) => nds.filter((n) => n.id !== nodeId));
    setEdges((eds) => eds.filter((e) => e.source !== nodeId && e.target !== nodeId));
    setSelectedNodeId(null);
  };

  const deleteEdge = (edgeId) => {
    pushToHistory(nodes, edges);
    setEdges((eds) => eds.filter((e) => e.id !== edgeId));
    setSelectedEdgeId(null);
  };

  const addNode = (nodeInfo) => {
    pushToHistory(nodes, edges);
    const newNode = {
      id: `${idCounter++}`,
      type: nodeInfo.type,
      position: { x: Math.random() * 400, y: Math.random() * 400 },
      data: { ...nodeInfo, instanceId: Date.now() + Math.random() },
    };
    setNodes((nds) => [...nds, newNode]);
  };

  const saveCustomNode = (node) => {
    setAllNodes((prev) => {
      const exists = prev.find((n) => n.id === node.id);
      if (exists) return prev.map((n) => (n.id === node.id ? node : n));
      return [...prev, node];
    });
  };

  const deleteCustomNode = (nodeId) => {
    setAllNodes((prev) => prev.filter((n) => n.id !== nodeId));
  };

  const selectedNode = nodes.find((n) => n.id === selectedNodeId);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", width: "100vw" }} onClick={() => setSelectedEdgeId(null)}>
      <div style={{ height: `${toolbarHeight}px`, flexShrink: 0 }}>
        <Toolbar nodes={nodes} edges={edges} setNodes={setNodes} setEdges={setEdges} />
      </div>

      <div style={{ display: "flex", flexGrow: 1, height: `calc(100vh - ${toolbarHeight}px)`, overflow: "hidden" }}>
        <div style={{ height: "100%", overflowY: "auto", flexShrink: 0 }}>
          <Sidebar availableNodes={allNodes} onAddNode={addNode} onSaveCustomNode={saveCustomNode} onDeleteCustomNode={deleteCustomNode} />
        </div>

        <div style={{ flexGrow: 1, border: "1px solid #ccc", height: "100%" }}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={(changes) => onNodesChange(changes)}
            onEdgesChange={(changes) => onEdgesChange(changes)}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            onNodeClick={onNodeClick}
            onEdgeClick={onEdgeClick}
            onSelectionChange={({ nodes: selNodes, edges: selEdges }) => {
              if (selNodes.length > 0) {
                setSelectedNodeId(selNodes[0].id);
                setSelectedEdgeId(null);
              } else if (selEdges.length > 0) {
                setSelectedEdgeId(selEdges[0].id);
                setSelectedNodeId(null);
              } else {
                setSelectedNodeId(null);
                setSelectedEdgeId(null);
              }
            }}
            fitView
          >
            <MiniMap />
            <Controls />
            <Background />
          </ReactFlow>
        </div>

        {showNodeDetails && selectedNode && (
          <div style={{ height: "100%", overflowY: "auto", flexShrink: 0 }}>
            <NodeDetailsPanel
              node={selectedNode}
              updateNodeField={updateNodeField}
              updateNodeData={updateNodeData}
              deleteNode={deleteNode}
              onClosePanel={() => setShowNodeDetails(false)}
            />
          </div>
        )}
      </div>
    </div>
  );
}
