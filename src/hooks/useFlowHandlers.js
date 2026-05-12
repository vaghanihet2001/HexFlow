// src/hooks/useFlowHandlers.js
import { useCallback } from "react";

export function useFlowHandlers(nodes, setNodes, edges, setEdges, pushToHistory, reactFlowInstance) {
  const addNode = useCallback(
    (nodeInfo) => {
      pushToHistory(nodes, edges);

      // 📍 Calculate center position if instance exists
      let position = { x: Math.random() * 400, y: Math.random() * 400 };
      if (reactFlowInstance) {
        const center = reactFlowInstance.screenToFlowPosition({
          x: window.innerWidth / 2,
          y: window.innerHeight / 2,
        });
        // Add slight random offset so they don't stack perfectly
        position = {
          x: center.x + (Math.random() - 0.5) * 50,
          y: center.y + (Math.random() - 0.5) * 50,
        };
      }

      // 🛠 Set default values for dropdowns
      const fieldsWithDefaults = nodeInfo.fields?.map((f) => {
        if (f.type === "dropdown" && !f.value && f.options?.length > 0) {
          return { ...f, value: f.options[0] };
        }
        return f;
      });

      const newNode = {
        id: `node-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        type: nodeInfo.type,
        position,
        data: {
          ...nodeInfo,
          fields: fieldsWithDefaults,
          instanceId: Date.now() + Math.random(),
        },
        width: nodeInfo.width || 200,
        height: nodeInfo.height || 120,
      };

      setNodes((nds) => [...nds, newNode]);
    },
    [nodes, edges, setNodes, pushToHistory, reactFlowInstance]
  );

  const onConnect = useCallback(
    (params) => {
      // Prevent incomplete edges
      if (!params.source || !params.target) return;

      // 🚫 Prevent duplicate connections
      const exists = edges.some(
        (e) =>
          e.source === params.source &&
          e.target === params.target &&
          e.sourceHandle === params.sourceHandle &&
          e.targetHandle === params.targetHandle
      );
      if (exists) return;

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

  const deleteNodes = useCallback(
    (nodeIds) => {
      const ids = Array.isArray(nodeIds) ? nodeIds : [nodeIds];
      if (ids.length === 0) return;
      pushToHistory(nodes, edges);
      setNodes((nds) => nds.filter((n) => !ids.includes(n.id)));
      setEdges((eds) => eds.filter((e) => !ids.includes(e.source) && !ids.includes(e.target)));
    },
    [nodes, edges, setNodes, setEdges, pushToHistory]
  );

  const deleteEdges = useCallback(
    (edgeIds) => {
      const ids = Array.isArray(edgeIds) ? edgeIds : [edgeIds];
      if (ids.length === 0) return;
      pushToHistory(nodes, edges);
      setEdges((eds) => eds.filter((e) => !ids.includes(e.id)));
    },
    [nodes, edges, setEdges, pushToHistory]
  );

  return {
    addNode,
    onConnect,
    deleteNodes,
    deleteEdges,
    updateEdgeData,
    updateEdgeType,
  };
}
