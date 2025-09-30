import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

export default function EdgeDetailsPanel({ edge, updateEdgeData, updateEdgeType, deleteEdge, onClosePanel }) {
  if (!edge) return null;

  const [labelInput, setLabelInput] = useState(edge.data?.label || "");
  const [type, setType] = useState(edge.data?.type || "normal");

  // Update local state when edge changes
  useEffect(() => {
    setLabelInput(edge.data?.label || "");
    setType(edge.data?.type || "normal");
  }, [edge.id]);

  const handleLabelChange = (e) => setLabelInput(e.target.value);

  const handleLabelCommit = () => {
    updateEdgeData(edge.id, "label", labelInput);
  };

  const handleTypeChange = (e) => {
    const newType = e.target.value;
    setType(newType);
    updateEdgeType(edge.id, newType);
    updateEdgeData(edge.id, "type", newType);
  };

  return (
    <div className="bg-light border-start d-flex flex-column" style={{ width: "250px", height: "100vh" }} onClick={(e) => e.stopPropagation()}>
      <div className="flex-shrink-0 p-3 border-bottom d-flex justify-content-between align-items-center">
        <h5 className="mb-0">Edge Details</h5>
        <button
          style={{ border: "none", background: "transparent", fontSize: 18, cursor: "pointer" }}
          onClick={onClosePanel}
        >
          ×
        </button>
      </div>

      <div className="flex-grow-1 overflow-auto p-3">
        <div className="mb-3">
          <label className="form-label">Label:</label>
          {/* <input
            type="text"
            className="form-control"
            value={labelInput}
            onChange={handleLabelChange}
            onBlur={handleLabelCommit}           // commit on blur
            onKeyDown={(e) => e.key === "Enter" && handleLabelCommit()} // commit on Enter
          /> */}
          <input
            type="text"
            className="form-control"
            value={edge.data?.label || ""}
            onChange={(e) => updateEdgeData(edge.id, "label", e.target.value)}
            />
        </div>

        <div className="mb-3">
          <label className="form-label">Type:</label>
          <select className="form-select" value={type} onChange={handleTypeChange}>
            <option value="normal">Normal</option>
            <option value="thread">Thread</option>
            <option value="process">Process</option>
          </select>
        </div>
      </div>

      <div className="flex-shrink-0 p-3 border-top" style={{ position: "sticky", bottom: 0, backgroundColor: "#f8f9fa", zIndex: 10 }}>
        <button className="btn btn-danger w-100" onClick={() => deleteEdge(edge.id)}>Delete Edge</button>
      </div>
    </div>
  );
}
