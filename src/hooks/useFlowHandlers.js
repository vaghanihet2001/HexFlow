// src/hooks/useFlowHandlers.js
import { useCallback } from "react";

export function useFlowHandlers(nodes, setNodes, edges, setEdges, pushToHistory) {
  const addNode = useCallback(
    (nodeInfo) => {
      pushToHistory(nodes, edges);
      const newNode = {
        id: `node-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        type: nodeInfo.type,
        position: { x: Math.random() * 400, y: Math.random() * 400 },
        data: { ...nodeInfo, instanceId: Date.now() + Math.random() },
      };
      setNodes((nds) => [...nds, newNode]);
    },
    [nodes, edges, setNodes, pushToHistory]
  );

  const onConnect = useCallback(
    (params) => {
      pushToHistory(nodes, edges);
      const newEdge = { ...params, id: `e-${params.source}-${params.target}-${Date.now()}`, type: "custom" };
      setEdges((eds) => [...eds, newEdge]);
    },
    [nodes, edges, setEdges, pushToHistory]
  );

  const deleteNode = useCallback(
    (nodeId) => {
      pushToHistory(nodes, edges);
      setNodes((nds) => nds.filter((n) => n.id !== nodeId));
      setEdges((eds) => eds.filter((e) => e.source !== nodeId && e.target !== nodeId));
    },
    [nodes, edges, setNodes, setEdges, pushToHistory]
  );

  const deleteEdge = useCallback(
    (edgeId) => {
      pushToHistory(nodes, edges);
      setEdges((eds) => eds.filter((e) => e.id !== edgeId));
    },
    [nodes, edges, setEdges, pushToHistory]
  );

  return { addNode, onConnect, deleteNode, deleteEdge };
}
