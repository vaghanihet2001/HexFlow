import React, { useState } from "react";
import { Handle, Position } from "reactflow";
import "bootstrap/dist/css/bootstrap.min.css";

export default function TextNode({ data }) {
  const [text, setText] = useState(data.value || "");

  return (
    <div
      className="card shadow-sm p-2"
      style={{ minWidth: "180px", borderRadius: "8px", backgroundColor: "#e0f7ff" }}
    >
      {/* Node Label */}
      <div className="card-title fw-bold text-center mb-2">
        {data.label || "Text Node"}
      </div>

      {/* Text Input */}
      <input
        type="text"
        className="form-control form-control-sm"
        placeholder="Enter text..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      {/* Handles */}
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}
