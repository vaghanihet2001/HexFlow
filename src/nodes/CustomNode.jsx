import React from "react";
import { Handle, Position } from "reactflow";

export default function CustomNode({ data }) {
  return (
    <div
      style={{
        padding: "10px",
        border: "2px solid #555",
        borderRadius: "5px",
        background: data.color || "#fff",
        minWidth: "150px",
      }}
    >
      <div><strong>{data.label}</strong></div>

      {data.fields?.map((field) => (
        <div key={field.id} style={{ marginTop: "5px" }}>
          <label>{field.label}</label>

          {/* Text Input (read-only) */}
          {field.type === "text" && (
            <input
              type="text"
              className="form-control"
              value={field.value || ""}
              disabled
            />
          )}

          {/* Dropdown (read-only) */}
          {field.type === "dropdown" && (
            <select className="form-select" value={field.value || ""} disabled>
              {field.options?.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          )}

          {/* Radio buttons (read-only) */}
          {field.type === "radio" &&
            field.options?.map((opt) => (
              <div className="form-check" key={opt}>
                <input
                  className="form-check-input"
                  type="radio"
                  // Use instanceId to make radio group unique per node instance
                  name={`${data.instanceId}_${field.id}`}
                  value={opt}
                  checked={field.value === opt}
                  disabled
                />
                <label className="form-check-label">{opt}</label>
              </div>
            ))}

          {/* Checkboxes (read-only) */}
        {field.type === "checkbox" &&
        field.options?.map((opt) => (
            <div className="form-check" key={opt}>
            <input
                className="form-check-input"
                type="checkbox"
                checked={Array.isArray(field.value) ? field.value.includes(opt) : false}
                disabled
            />
            <label className="form-check-label">{opt}</label>
            </div>
        ))}

        </div>
      ))}

      {/* Handles for React Flow */}
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}
