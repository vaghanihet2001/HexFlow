// src/components/CustomEdge.jsx
import React from "react";
import { getBezierPath, getEdgeCenter } from "reactflow";

const EDGE_COLORS = {
  normal: "#222222",
  thread: "#0d6efd",
  process: "#198754",
};

export default function CustomEdge({
  id,
  sourceX,
  sourceY,
  sourcePosition,
  targetX,
  targetY,
  targetPosition,
  selected,
  data,
  type,
}) {
  const [edgePath] = getBezierPath({ sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition });
  const [labelX, labelY] = getEdgeCenter({ sourceX, sourceY, targetX, targetY });

  const strokeColor = EDGE_COLORS[type] || EDGE_COLORS.normal;

  return (
    <>
      <path
        id={id}
        d={edgePath}
        style={{
          stroke: strokeColor,
          strokeWidth: selected ? 3 : 2,
          fill: "none",
        }}
      />
      {data?.label && (
        <text
          x={labelX}
          y={labelY - 5}
          textAnchor="middle"
          style={{ fill: "#000", fontSize: 12, pointerEvents: "none", userSelect: "none" }}
        >
          {data.label}
        </text>
      )}
    </>
  );
}
