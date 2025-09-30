import React from "react";
import { Handle, Position } from "reactflow";

export default function CustomSubflowNode({ data, isConnectable }) {
  return (
    <div
      style={{
        padding: 10,
        border: "2px dashed #888",
        background: "#f0f0f0",
        width: data.width || 300,
        height: data.height || 200,
        position: "relative",
        boxSizing: "border-box",
        cursor: "pointer",
        overflow: "hidden",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <strong>{data.label}</strong>
        <button
          style={{ fontSize: 12, padding: "2px 6px" }}
          onClick={(e) => {
            e.stopPropagation();
            if (data.toggleCollapse) data.toggleCollapse();
          }}
        >
          {data.collapsed ? "+" : "−"}
        </button>
      </div>

      <Handle type="target" position={Position.Top} isConnectable={isConnectable} />
      <Handle type="source" position={Position.Bottom} isConnectable={isConnectable} />
    </div>
  );
}
