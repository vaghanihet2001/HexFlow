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
          {field.type === "text" && (
            <input type="text" className="form-control" placeholder={field.label} />
          )}
          {field.type === "dropdown" && (
            <select className="form-select">
              {field.options?.map((opt) => (
                <option key={opt}>{opt}</option>
              ))}
            </select>
          )}
          {field.type === "radio" && field.options?.map((opt) => (
            <div key={opt} className="form-check">
              <input className="form-check-input" type="radio" name={field.id} value={opt} />
              <label className="form-check-label">{opt}</label>
            </div>
          ))}
          {field.type === "checkbox" && field.options?.map((opt) => (
            <div key={opt} className="form-check">
              <input className="form-check-input" type="checkbox" value={opt} />
              <label className="form-check-label">{opt}</label>
            </div>
          ))}
        </div>
      ))}

      {/* Handles */}
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}
