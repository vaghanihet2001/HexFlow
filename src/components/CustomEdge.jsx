// src/components/CustomEdge.jsx
import React from "react";
import { BaseEdge, getBezierPath } from "reactflow";

export default function CustomEdge({
  id,
  sourceX,
  sourceY,
  sourcePosition,
  targetX,
  targetY,
  targetPosition,
  selected,
  data, // <-- important to access label and type
}) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  // Determine color based on type
  let strokeColor = "#222";
  if (data?.type === "thread") strokeColor = "blue";
  else if (data?.type === "process") strokeColor = "green";
  else strokeColor = "#222";

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        style={{ stroke: selected ? "#ff5555" : strokeColor, strokeWidth: selected ? 2 : 2 }}
      />
      {data?.label && (
        <text x={labelX} y={labelY} textAnchor="middle" dominantBaseline="middle" style={{ fill: "#000", fontSize: 12, pointerEvents: "none" }}>
          {data.label}
        </text>
      )}
    </>
  );
}
