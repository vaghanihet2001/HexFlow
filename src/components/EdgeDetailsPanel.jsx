// src/components/EdgeDetailsPanel.jsx
import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { useTheme } from "./ThemeContext";

export default function EdgeDetailsPanel({
  edge,
  updateEdgeData,
  updateEdgeType,
  deleteEdge,
  onClosePanel,
}) {
  const { themeColors } = useTheme();
  const [labelInput, setLabelInput] = useState("");
  const [type, setType] = useState("bezier");
  const [color, setColor] = useState("#222222");

  useEffect(() => {
    if (edge?.data) {
      setLabelInput(edge.data.label || "");
      setType(edge.data.type || "bezier");
      setColor(edge.data.color || "#222222");
    }
  }, [edge?.id]);

  if (!edge) return null;

  const handleLabelChange = (e) => {
    const value = e.target.value;
    setLabelInput(value);
    updateEdgeData(edge.id, "label", value);
  };

  const handleTypeChange = (e) => {
    const newType = e.target.value;
    setType(newType);
    updateEdgeType(edge.id, newType);
    updateEdgeData(edge.id, "type", newType);
  };

  const handleColorChange = (e) => {
    const newColor = e.target.value;
    setColor(newColor);
    updateEdgeData(edge.id, "color", newColor);
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
        {/* Label */}
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

        {/* Type */}
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
            <option value="bezier">Bezier</option>
            <option value="straight">Straight</option>
            {/* <option value="step">Step</option> */}
            <option value="smoothstep">Smooth Step</option>
          </select>
        </div>

        {/* Color */}
        <div className="mb-3">
          <label className="form-label">Color:</label>
          <input
            type="color"
            className="form-control form-control-color"
            value={color}
            onChange={handleColorChange}
            title="Choose edge color"
          />
        </div>
      </div>

      {/* Delete */}
      <div
        className="flex-shrink-0 p-3 border-top"
        style={{
          position: "sticky",
          bottom: 0,
          backgroundColor: themeColors.sidebarBg,
          borderColor: themeColors.border,
        }}
      >
        <button className="btn btn-danger w-100" onClick={() => deleteEdge(edge.id)}>
          Delete Edge
        </button>
      </div>
    </div>
  );
}
