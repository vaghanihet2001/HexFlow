import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";

export default function NodeDetailsPanel({
  node,
  updateNodeField,
  updateNodeData,
  deleteNode,
  onClosePanel,
}) {
  if (!node) return null;

  return (
    <div
      className="bg-light border-start d-flex flex-column"
      style={{ width: "250px", height: "100vh" }}
    >
      {/* Top Header */}
      <div className="flex-shrink-0 p-3 border-bottom d-flex justify-content-between align-items-center">
        <h5 className="mb-0">Node Details</h5>
        <button
          style={{ border: "none", background: "transparent", fontSize: "18px", cursor: "pointer" }}
          onClick={onClosePanel}
        >
          ×
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-grow-1 overflow-auto p-3" style={{ minHeight: 0 }}>
        {/* Node Label */}
        <div className="mb-3">
          <label className="form-label">Label:</label>
          <input
            type="text"
            className="form-control"
            value={node.data.label}
            onChange={(e) => updateNodeData(node.id, "label", e.target.value)}
          />
        </div>

        {/* Custom Fields */}
        {node.data.fields?.map((field) => (
          <div key={field.id} className="mb-3 border rounded p-2 bg-white">
            <label className="form-label">{field.label}</label>

            {field.type === "text" && (
              <input
                type="text"
                className="form-control"
                value={field.value || ""}
                onChange={(e) =>
                  updateNodeField(node.id, field.id, "value", e.target.value)
                }
              />
            )}

            {field.type === "dropdown" && (
              <select
                className="form-select"
                value={field.value || ""}
                onChange={(e) =>
                  updateNodeField(node.id, field.id, "value", e.target.value)
                }
              >
                {field.options?.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            )}

             {field.type === "radio" &&
              field.options?.map((opt) => (
                <div className="form-check" key={opt}>
                  <input className="form-check-input" type="radio" name={field.id} value={opt} checked={field.value === opt} onChange={() => updateNodeField(node.id, field.id, "value", opt)} />
                  <label className="form-check-label">{opt}</label>
                </div>
              ))}

            {field.type === "checkbox" &&
              field.options?.map((opt) => (
                <div className="form-check" key={opt}>
                  <input className="form-check-input" type="checkbox" checked={field.value?.includes(opt)} onChange={(e) => {
                    let newValue = field.value || [];
                    if (e.target.checked) newValue = [...newValue, opt];
                    else newValue = newValue.filter((v) => v !== opt);
                    updateNodeField(node.id, field.id, "value", newValue);
                  }} />
                  <label className="form-check-label">{opt}</label>
                </div>
              ))}
          </div>
        ))}
        
        
      </div>

      {/* Delete Button */}
      <div
        className="flex-shrink-0 p-3 border-top"
        style={{ position: "sticky", bottom: 0, backgroundColor: "#f8f9fa", zIndex: 10 }}
      >
        <button className="btn btn-danger w-100" onClick={() => deleteNode(node.id)}>
          Delete Node
        </button>
      </div>
    </div>
  );
}
