import React, { useState } from "react";
import { Handle, Position } from "reactflow";
import "bootstrap/dist/css/bootstrap.min.css";

export default function DropdownNode({ data }) {
  const [selected, setSelected] = useState(data.value || "");

  return (
    <div
      className="card shadow-sm p-2"
      style={{ minWidth: "180px", borderRadius: "8px" }}
    >
      {/* Node Label */}
      <div className="card-title fw-bold text-center mb-2">
        {data.label || "Dropdown Node"}
      </div>

      {/* Dropdown */}
      <select
        className="form-select form-select-sm"
        value={selected}
        onChange={(e) => setSelected(e.target.value)}
      >
        {data.options?.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>

      {/* Handles */}
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}
