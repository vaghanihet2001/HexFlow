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
        width: nodeInfo.width || 200,
        height: nodeInfo.height || 120,
      };

      setNodes((nds) => [...nds, newNode]);
    },
    [nodes, edges, setNodes, pushToHistory]
  );

  const onConnect = useCallback(
    (params) => {
      // Prevent incomplete edges
      if (!params.source || !params.target) return;

      pushToHistory(nodes, edges);

      const newEdge = {
        id: `e-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        source: params.source,
        target: params.target,
        sourceHandle: params.sourceHandle || null,
        targetHandle: params.targetHandle || null,
        type: "custom", // use your CustomEdge
        data: {
          label: "",
          type: "bezier", // default edge type
          color: null, // default color
        },
      };

      setEdges((eds) => [...eds, newEdge]);
    },
    [nodes, edges, setEdges, pushToHistory]
  );

  const updateEdgeData = useCallback(
    (edgeId, key, value) => {
      setEdges((eds) =>
        eds.map((e) =>
          e.id === edgeId ? { ...e, data: { ...e.data, [key]: value } } : e
        )
      );
    },
    [setEdges]
  );

  const updateEdgeType = useCallback(
    (edgeId, newType) => {
      setEdges((eds) =>
        eds.map((e) =>
          e.id === edgeId
            ? { ...e, type: "custom", data: { ...e.data, type: newType } }
            : e
        )
      );
    },
    [setEdges]
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

  return {
    addNode,
    onConnect,
    deleteNode,
    deleteEdge,
    updateEdgeData,
    updateEdgeType,
  };
}
