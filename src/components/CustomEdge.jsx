// src/components/CustomEdge.jsx
import React from "react";
import { BaseEdge, getBezierPath } from "reactflow";

export default function CustomEdge({ id, sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition, selected }) {
  const [edgePath] = getBezierPath({ sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition });
  return (
    <BaseEdge
      id={id}
      path={edgePath}
      style={{ stroke: selected ? "#ff5555" : "#222", strokeWidth: selected ? 2 : 1 }}
    />
  );
}
