import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";

export default function NodeDetailsPanel({ node, updateNode, deleteNode }) {
  if (!node)
    return (
      <div className="bg-light border-start p-3" style={{ width: "250px" }}>
        <h5 className="text-muted">Select a node</h5>
      </div>
    );

  const handleChange = (key, value) => {
    updateNode({ ...node, data: { ...node.data, [key]: value } });
  };

  return (
    <div
      className="bg-light border-start p-3 d-flex flex-column"
      style={{ width: "250px", height: "100vh", overflowY: "auto" }}
    >
      <h5 className="mb-3">Node Details</h5>

      {/* Label Input */}
      <div className="mb-3">
        <label className="form-label">Label:</label>
        <input
          type="text"
          className="form-control"
          value={node.data.label}
          onChange={(e) => handleChange("label", e.target.value)}
        />
      </div>

      {/* Options Input */}
      {node.data.options && (
        <div className="mb-3">
          <label className="form-label">Options (comma separated):</label>
          <input
            type="text"
            className="form-control"
            value={node.data.options.join(",")}
            onChange={(e) =>
              handleChange("options", e.target.value.split(","))
            }
          />
        </div>
      )}

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
