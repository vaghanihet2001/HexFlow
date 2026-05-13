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
const FlowTabs = componentTypes.flowTabs;
const AppModal = componentTypes.appModal;

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

  const [flows, setFlows] = useState([]);
  const [activeFlowId, setActiveFlowId] = useState(null);
  const [appModal, setAppModal] = useState({ show: false });

  // 1️⃣ Load from localStorage once on mount
  useEffect(() => {
    const savedFlows = localStorage.getItem("hexFlows");
    const savedActiveId = localStorage.getItem("activeHexFlowId");

    if (savedFlows && savedActiveId) {
      try {
        const parsedFlows = JSON.parse(savedFlows);
        setFlows(parsedFlows);
        setActiveFlowId(savedActiveId);
        
        const activeFlow = parsedFlows.find((f) => f.id === savedActiveId) || parsedFlows[0];
        setNodes(activeFlow.nodes || []);
        setEdges(activeFlow.edges || []);
        if (!parsedFlows.find((f) => f.id === savedActiveId)) {
          setActiveFlowId(activeFlow.id);
        }
      } catch (err) {
        console.error("Failed to parse hexFlows:", err);
        initDefaultFlow();
      }
    } else {
      // Migration from old single flow
      const oldState = localStorage.getItem("flowState");
      let initialNodes = [];
      let initialEdges = [];
      if (oldState) {
        try {
          const parsed = JSON.parse(oldState);
          initialNodes = parsed.nodes || [];
          initialEdges = parsed.edges || [];
        } catch (err) {
          console.error("Failed to parse old flowState:", err);
        }
      }
      const defaultFlow = { id: `flow-${Date.now()}`, name: "Flow-1", nodes: initialNodes, edges: initialEdges };
      setFlows([defaultFlow]);
      setActiveFlowId(defaultFlow.id);
      setNodes(initialNodes);
      setEdges(initialEdges);
    }
    setInitialized(true);
  }, []);

  const initDefaultFlow = () => {
    const defaultFlow = { id: `flow-${Date.now()}`, name: "Flow-1", nodes: [], edges: [] };
    setFlows([defaultFlow]);
    setActiveFlowId(defaultFlow.id);
    setNodes([]);
    setEdges([]);
  };

  // 2️⃣ Save only after initialization to avoid overwriting
  useEffect(() => {
    if (!initialized) return;
    const flowsToSave = flows.map((f) =>
      f.id === activeFlowId ? { ...f, nodes, edges } : f
    );
    localStorage.setItem("hexFlows", JSON.stringify(flowsToSave));
    localStorage.setItem("activeHexFlowId", activeFlowId);
  }, [nodes, edges, flows, activeFlowId, initialized]);

  // =============================
  // 🗂 FLOW TABS MANAGEMENT
  // =============================
  const switchFlow = (targetFlowId) => {
    if (targetFlowId === activeFlowId) return;
    setFlows((prev) => {
      const updatedFlows = prev.map((f) =>
        f.id === activeFlowId ? { ...f, nodes, edges } : f
      );
      const targetFlow = updatedFlows.find((f) => f.id === targetFlowId);
      if (targetFlow) {
        setNodes(targetFlow.nodes || []);
        setEdges(targetFlow.edges || []);
        setActiveFlowId(targetFlowId);
        setHistory([]);
        setRedoStack([]);
        setSelectedNodeId(null);
        setSelectedEdgeId(null);
        setSelectedNodes([]);
        setSelectedEdges([]);
      }
      return updatedFlows;
    });
  };

  const addFlow = () => {
    let i = 1;
    while (flows.some((f) => f.name.toLowerCase() === `flow-${i}`)) {
      i++;
    }
    
    const newFlow = {
      id: `flow-${Date.now()}`,
      name: `Flow-${i}`,
      nodes: [],
      edges: [],
    };
    
    setFlows((prev) => {
      const updatedFlows = prev.map((f) =>
        f.id === activeFlowId ? { ...f, nodes, edges } : f
      );
      return [...updatedFlows, newFlow];
    });
    
    setNodes([]);
    setEdges([]);
    setActiveFlowId(newFlow.id);
    setHistory([]);
    setRedoStack([]);
    setSelectedNodeId(null);
    setSelectedEdgeId(null);
    setSelectedNodes([]);
    setSelectedEdges([]);
  };

  const duplicateFlow = (sourceFlowId) => {
    setFlows((prev) => {
      // First ensure the active flow's latest state is saved
      const updatedFlows = prev.map((f) =>
        f.id === activeFlowId ? { ...f, nodes, edges } : f
      );
      
      const sourceFlow = updatedFlows.find((f) => f.id === sourceFlowId);
      if (!sourceFlow) return updatedFlows;

      // Create new duplicated nodes with fresh instance IDs to avoid conflicts
      const newNodes = (sourceFlow.nodes || []).map((node) => ({
        ...node,
        id: `node-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        data: { ...node.data, instanceId: Date.now() + Math.random() },
      }));
      // Map old node IDs to new node IDs for edges
      const idMap = {};
      (sourceFlow.nodes || []).forEach((n, i) => {
        idMap[n.id] = newNodes[i].id;
      });
      const newEdges = (sourceFlow.edges || []).map((edge) => ({
        ...edge,
        id: `e-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        source: idMap[edge.source] || edge.source,
        target: idMap[edge.target] || edge.target,
      }));

      const newFlow = {
        id: `flow-${Date.now()}`,
        name: `${sourceFlow.name} (Copy)`,
        nodes: newNodes,
        edges: newEdges,
      };

      // Switch to the duplicated flow automatically
      setNodes(newNodes);
      setEdges(newEdges);
      setActiveFlowId(newFlow.id);
      setHistory([]);
      setRedoStack([]);
      setSelectedNodeId(null);
      setSelectedEdgeId(null);
      setSelectedNodes([]);
      setSelectedEdges([]);

      return [...updatedFlows, newFlow];
    });
  };

  const renameFlow = (id, newName) => {
    setFlows((prev) =>
      prev.map((f) => (f.id === id ? { ...f, name: newName } : f))
    );
  };

  const removeFlow = (id) => {
    if (flows.length === 1) {
      setAppModal({
        show: true,
        type: "error",
        title: "Action Not Allowed",
        message: "You cannot remove the last flow. There must be at least one flow open.",
        confirmText: "Close"
      });
      return;
    }
    setFlows((prev) => {
      // First, update the active flow's state in case it's not the one being removed
      const syncedFlows = prev.map((f) =>
        f.id === activeFlowId ? { ...f, nodes, edges } : f
      );
      const newFlows = syncedFlows.filter((f) => f.id !== id);
      
      if (id === activeFlowId) {
        const targetFlow = newFlows[0];
        setNodes(targetFlow.nodes || []);
        setEdges(targetFlow.edges || []);
        setActiveFlowId(targetFlow.id);
        setHistory([]);
        setRedoStack([]);
        setSelectedNodeId(null);
        setSelectedEdgeId(null);
        setSelectedNodes([]);
        setSelectedEdges([]);
      }
      return newFlows;
    });
  };

  const deleteAllFlows = () => {
    const defaultFlow = { id: `flow-${Date.now()}`, name: "Flow-1", nodes: [], edges: [] };
    setFlows([defaultFlow]);
    setActiveFlowId(defaultFlow.id);
    setNodes([]);
    setEdges([]);
    setHistory([]);
    setRedoStack([]);
    setSelectedNodeId(null);
    setSelectedEdgeId(null);
    setSelectedNodes([]);
    setSelectedEdges([]);
  };

  const reorderFlows = (draggedId, targetId) => {
    setFlows((prev) => {
      const draggedIndex = prev.findIndex((f) => f.id === draggedId);
      const targetIndex = prev.findIndex((f) => f.id === targetId);
      if (draggedIndex < 0 || targetIndex < 0) return prev;
      
      const newFlows = [...prev];
      const [draggedItem] = newFlows.splice(draggedIndex, 1);
      newFlows.splice(targetIndex, 0, draggedItem);
      return newFlows;
    });
  };

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

  const updateNodeField = React.useCallback((nodeId, fieldId, key, value) => {
    setSelectedNodeId(nodeId);
    setShowNodeDetails(true);
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
  }, [setNodes, setSelectedNodeId, setShowNodeDetails]);

  const updateNodeData = React.useCallback((nodeId, key, value) => {
    setSelectedNodeId(nodeId);
    setShowNodeDetails(true);
    setNodes((nds) =>
      nds.map((n) =>
        n.id === nodeId ? { ...n, data: { ...n.data, [key]: value } } : n
      )
    );
  }, [setNodes, setSelectedNodeId, setShowNodeDetails]);

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

  const onLoadFlow = (fileContent, fileName = "") => {
    try {
      const { nodes: loadedNodes, edges: loadedEdges } = JSON.parse(fileContent);
      if (loadedNodes && loadedEdges) {
        const fixedNodes = loadedNodes.map((n) => ({
          ...n,
          width: n.width || DEFAULT_NODE_WIDTH,
          height: n.height || DEFAULT_NODE_HEIGHT,
        }));
        
        let targetName = fileName ? fileName.replace(/\.json$/i, "") : `flow-${Date.now()}`;
        
        const newFlow = {
          id: `flow-${Date.now()}`,
          name: targetName,
          nodes: fixedNodes,
          edges: loadedEdges,
        };

        setFlows((prev) => {
          const updatedFlows = prev.map((f) =>
            f.id === activeFlowId ? { ...f, nodes, edges } : f
          );
          return [...updatedFlows, newFlow];
        });

        setNodes(fixedNodes);
        setEdges(loadedEdges);
        setActiveFlowId(newFlow.id);
        setHistory([]);
        setRedoStack([]);
        setSelectedNodeId(null);
        setSelectedEdgeId(null);
        setSelectedNodes([]);
        setSelectedEdges([]);
      }
    } catch (err) {
      console.error("Invalid flow file:", err);
      alert("Invalid flow JSON file");
    }
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

  // =============================
  // 🚀 NODE TYPES WITH UPDATE HANDLERS
  // =============================
  const memoizedNodeTypes = React.useMemo(() => ({
    customNode: (props) => (
      <nodeTypes.customNode 
        {...props} 
        updateNodeField={updateNodeField} 
        updateNodeData={updateNodeData} 
      />
    ),
    databaseSchema: (props) => (
      <nodeTypes.databaseSchema 
        {...props} 
        updateNodeData={updateNodeData} 
      />
    ),
  }), [updateNodeField, updateNodeData]);

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
          onNewFlow={addFlow}
          onLoadFlow={onLoadFlow}
          activeFlowName={flows.find(f => f.id === activeFlowId)?.name || "Flow-1"}
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
            display: "flex",
            flexDirection: "column",
            minWidth: 0,
          }}
        >
          <div style={{ flexGrow: 1, position: "relative" }}>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onInit={setReactFlowInstance} // ✅ Capture instance
              nodeTypes={memoizedNodeTypes} // ✅ Use memoized nodeTypes
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
                setSelectedNodes([]); // Clear on pane click
                setSelectedEdges([]); // Clear on pane click
              }}
              onSelectionChange={({ nodes: selNodes, edges: selEdges }) => {
                setSelectedNodes(selNodes); //  Multi-select
                setSelectedEdges(selEdges); //  Multi-select
                setSelectedNodeId(selNodes[0]?.id || null);
                setSelectedEdgeId(selEdges[0]?.id || null);
              }}
              selectionOnDrag={true} // Enable selection box
              selectionMode="partial" // Select nodes even if only partially covered
              panOnDrag={[1, 2]} // Allow panning with middle/right mouse or space drag
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
          <FlowTabs
            flows={flows}
            activeFlowId={activeFlowId}
            onSwitch={switchFlow}
            onAdd={addFlow}
            onRename={renameFlow}
            onDuplicate={duplicateFlow}
            onRemove={removeFlow}
            onReorder={reorderFlows}
            onDeleteAll={deleteAllFlows}
          />
        </div>

        {showNodeDetails && selectedNode && selectedNode.type !== "databaseSchema" && (
          <NodeDetailsPanel
            node={selectedNode}
            updateNodeField={updateNodeField}
            updateNodeData={updateNodeData}
            deleteNode={() => deleteNodes(selectedNode.id)}
            onClosePanel={() => setShowNodeDetails(false)}
          />
        )}

        {showNodeDetails && selectedNode && selectedNode.type === "databaseSchema" && (
          <DatabaseNodeDetailsPanel
            node={selectedNode}
            updateNodeData={updateNodeData}
            deleteNode={() => deleteNodes(selectedNode.id)} 
            onClosePanel={() => setShowNodeDetails(false)}
          />
        )}

        {selectedEdge && !selectedNode && (
          <EdgeDetailsPanel
            edge={selectedEdge}
            updateEdgeData={updateEdgeData}
            updateEdgeType={updateEdgeType}
            deleteEdge={() => deleteEdges(selectedEdge.id)} 
            onClosePanel={() => setSelectedEdgeId(null)}
          />
        )}
      </div>

      <AppModal
        show={appModal.show}
        title={appModal.title}
        message={appModal.message}
        type={appModal.type}
        confirmText={appModal.confirmText}
        cancelText={appModal.cancelText}
        onConfirm={appModal.onConfirm}
        onClose={() => setAppModal({ show: false })}
      />
    </div>
  );
}
