// src/components/EdgeDetailsPanel.jsx
import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { useTheme } from "./ThemeContext";

export default function EdgeDetailsPanel({ edge, updateEdgeData, updateEdgeType, deleteEdge, onClosePanel }) {
  const { themeColors } = useTheme();

  if (!edge) return null;

  const [labelInput, setLabelInput] = useState(edge.data?.label || "");
  const [type, setType] = useState(edge.data?.type || "normal");

  useEffect(() => {
    setLabelInput(edge.data?.label || "");
    setType(edge.data?.type || "normal");
  }, [edge.id]);

  const handleLabelChange = (e) => {
    setLabelInput(e.target.value);
    updateEdgeData(edge.id, "label", e.target.value); // update on every change
  };

  const handleTypeChange = (e) => {
    const newType = e.target.value;
    setType(newType);
    updateEdgeType(edge.id, newType);
    updateEdgeData(edge.id, "type", newType);
  };

  return (
    <div
      className="d-flex flex-column border-start"
      style={{
        width: "250px",
        height: "100vh",
        backgroundColor: themeColors.sidebarBg,
        color: themeColors.text,
        borderColor: themeColors.border,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div
        className="flex-shrink-0 p-3 border-bottom d-flex justify-content-between align-items-center"
        style={{ borderColor: themeColors.border }}
      >
        <h5 className="mb-0">Edge Details</h5>
        <button
          style={{
            border: "none",
            background: "transparent",
            fontSize: 18,
            cursor: "pointer",
            color: themeColors.text,
          }}
          onClick={onClosePanel}
        >
          ×
        </button>
      </div>

      {/* Content */}
      <div className="flex-grow-1 overflow-auto p-3">
        <div className="mb-3">
          <label className="form-label">Label:</label>
          <input
            type="text"
            className="form-control"
            style={{
              backgroundColor: themeColors.cardBg,
              color: themeColors.text,
              borderColor: themeColors.border,
            }}
            value={labelInput}
            onChange={handleLabelChange}
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Type:</label>
          <select
            className="form-select"
            style={{
              backgroundColor: themeColors.cardBg,
              color: themeColors.text,
              borderColor: themeColors.border,
            }}
            value={type}
            onChange={handleTypeChange}
          >
            <option value="normal">Normal</option>
            <option value="thread">Thread</option>
            <option value="process">Process</option>
          </select>
        </div>
      </div>

      {/* Delete Button */}
      <div
        className="flex-shrink-0 p-3 border-top"
        style={{
          position: "sticky",
          bottom: 0,
          backgroundColor: themeColors.sidebarBg,
          borderColor: themeColors.border,
          zIndex: 10,
        }}
      >
        <button
          className="btn btn-danger w-100"
          onClick={() => deleteEdge(edge.id)}
        >
          Delete Edge
        </button>
      </div>
    </div>
  );
}
