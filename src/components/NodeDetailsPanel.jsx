import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";

export default function NodeDetailsPanel({ node, updateNode, deleteNode, onClosePanel }) {
  if (!node)
    return (
      <div className="bg-light border-start p-3" style={{ width: "250px" }}>
        <h5 className="text-muted">Select a node</h5>
      </div>
    );

  const handleFieldChange = (fieldId, key, value) => {
    const updatedFields = node.data.fields.map((f) =>
      f.id === fieldId ? { ...f, [key]: value } : f
    );
    updateNode({ ...node, data: { ...node.data, fields: updatedFields } });
  };

  const handleChange = (key, value) => {
    updateNode({ ...node, data: { ...node.data, [key]: value } });
  };

  return (
    <div
      className="bg-light border-start p-3 d-flex flex-column"
      style={{ width: "250px", height: "100vh", overflowY: "auto", position: "relative" }}
    >
      {/* Close Button */}
      <button
        style={{
          position: "absolute",
          top: "10px",
          right: "10px",
          border: "none",
          background: "transparent",
          fontSize: "18px",
          cursor: "pointer",
        }}
        onClick={onClosePanel}
      >
        ×
      </button>

      <h5 className="mb-3">Node Details</h5>

      {/* Node Label */}
      <div className="mb-3">
        <label className="form-label">Label:</label>
        <input
          type="text"
          className="form-control"
          value={node.data.label}
          onChange={(e) => handleChange("label", e.target.value)}
        />
      </div>

      {/* Custom Fields */}
      {node.data.fields?.map((field) => (
        <div key={field.id} className="mb-3 border rounded p-2 bg-white">
          <label className="form-label">{field.label}</label>

          {/* Text Input */}
          {field.type === "text" && (
            <input
              type="text"
              className="form-control"
              value={field.value || ""}
              onChange={(e) =>
                handleFieldChange(field.id, "value", e.target.value)
              }
            />
          )}

          {/* Dropdown */}
          {field.type === "dropdown" && (
            <select
              className="form-select"
              value={field.value || ""}
              onChange={(e) =>
                handleFieldChange(field.id, "value", e.target.value)
              }
            >
              {field.options?.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          )}

          {/* Radio */}
          {field.type === "radio" &&
            field.options?.map((opt) => (
              <div className="form-check" key={opt}>
                <input
                  className="form-check-input"
                  type="radio"
                  name={field.id}
                  value={opt}
                  checked={field.value === opt}
                  onChange={() =>
                    handleFieldChange(field.id, "value", opt)
                  }
                />
                <label className="form-check-label">{opt}</label>
              </div>
            ))}

          {/* Checkbox */}
          {field.type === "checkbox" &&
            field.options?.map((opt) => (
              <div className="form-check" key={opt}>
                <input
                  className="form-check-input"
                  type="checkbox"
                  checked={field.value?.includes(opt)}
                  onChange={(e) => {
                    let newValue = field.value || [];
                    if (e.target.checked) {
                      newValue = [...newValue, opt];
                    } else {
                      newValue = newValue.filter((v) => v !== opt);
                    }
                    handleFieldChange(field.id, "value", newValue);
                  }}
                />
                <label className="form-check-label">{opt}</label>
              </div>
            ))}
        </div>
      ))}

      {/* Delete Node Button */}
      <button
        className="btn btn-danger mt-auto"
        onClick={() => deleteNode(node.id)}
      >
        Delete Node
      </button>
    </div>
  );
}
