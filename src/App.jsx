import React, { useCallback, useState } from "react";
import ReactFlow, {
  addEdge,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
} from "reactflow";
import "reactflow/dist/style.css";

import { nodeTypes, availableNodes } from "./nodes";
import { componentTypes } from "./components";

const Sidebar = componentTypes.sideBar;
const NodeDetailsPanel = componentTypes.nodeDetailsPanel;

let id = 1;

export default function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState(null);

  const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), []);

  const onNodeClick = (event, node) => setSelectedNode(node);

  const updateNode = (updatedNode) => {
    setNodes((nds) => nds.map((n) => (n.id === updatedNode.id ? updatedNode : n)));
    setSelectedNode(updatedNode);
  };

  const deleteNode = (nodeId) => {
    setNodes((nds) => nds.filter((n) => n.id !== nodeId));
    setEdges((eds) => eds.filter((e) => e.source !== nodeId && e.target !== nodeId));
    if (selectedNode?.id === nodeId) setSelectedNode(null);
  };

  const addNode = (nodeInfo) => {
    const newNode = {
      id: `${id++}`,
      type: nodeInfo.type,
      position: { x: Math.random() * 400, y: Math.random() * 400 },
      data: { label: nodeInfo.label, options: nodeInfo.options || [] },
    };
    setNodes((nds) => [...nds, newNode]);
  };

  return (
    <div className="d-flex" style={{ height: "100vh", width: "100vw" }}>
      {/* Sidebar */}
      <Sidebar availableNodes={availableNodes} onAddNode={addNode} />

      {/* ReactFlow Canvas */}
      <div className="flex-grow-1 border" style={{ position: "relative" }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          onNodeClick={onNodeClick}
          fitView
        >
          <MiniMap />
          <Controls />
          <Background />
        </ReactFlow>
      </div>

      {/* Node Details Panel */}
      <NodeDetailsPanel
        node={selectedNode}
        updateNode={updateNode}
        deleteNode={deleteNode} // pass delete function
      />
    </div>
  );
}
