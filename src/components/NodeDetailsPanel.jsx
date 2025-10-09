// src/components/NodeDetailsPanel.jsx
import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { useTheme } from "./ThemeContext";
import { FaEye, FaEyeSlash } from "react-icons/fa";

export default function NodeDetailsPanel({
  node,
  updateNodeField,
  updateNodeData,
  deleteNode,
  onClosePanel,
}) {
  const { themeColors } = useTheme();

  if (!node) return null;

  const toggleFieldVisibility = (fieldId) => {
    const field = node.data.fields.find((f) => f.id === fieldId);
    updateNodeField(node.id, fieldId, "hide", !field.hide);
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
    >
      {/* Top Header */}
      <div
        className="flex-shrink-0 p-3 border-bottom d-flex justify-content-between align-items-center"
        style={{ borderColor: themeColors.border }}
      >
        <h5 className="mb-0">Node Details</h5>
        <button
          style={{
            border: "none",
            background: "transparent",
            fontSize: "18px",
            cursor: "pointer",
            color: themeColors.text,
          }}
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
            style={{
              backgroundColor: themeColors.cardBg,
              color: themeColors.text,
              borderColor: themeColors.border,
            }}
            value={node.data.label}
            onChange={(e) => updateNodeData(node.id, "label", e.target.value)}
          />
        </div>

        {/* Node Color Picker */}
        <div className="mb-3">
          <label className="form-label">Color:</label>
          <input
            type="color"
            className="form-control form-control-color"
            value={node.data.color || "#ffffff"}
            onChange={(e) => updateNodeData(node.id, "color", e.target.value)}
            style={{
              padding: 0,
              height: "35px",
              border: `1px solid ${themeColors.border}`,
              backgroundColor: node.data.color || "#ffffff",
              cursor: "pointer",
            }}
          />
        </div>

        {/* Custom Fields */}
        {node.data.fields?.map((field) => (
          <div
            key={field.id}
            className="mb-3 border rounded p-2"
            style={{
              backgroundColor: themeColors.cardBg,
              borderColor: themeColors.border,
              color: themeColors.text,
            }}
          >
            <div className="d-flex justify-content-between align-items-center mb-1">
              <label className="form-label mb-0">{field.label}</label>
              <button
                className="btn btn-sm btn-outline-secondary"
                onClick={() => toggleFieldVisibility(field.id)}
                title={field.hide ? "Show Field" : "Hide Field"}
              >
                {field.hide ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>

            {!field.hide && (
              <>
                {field.type === "text" && (
                  <input
                    type="text"
                    className="form-control"
                    style={{
                      backgroundColor: themeColors.background,
                      color: themeColors.text,
                      borderColor: themeColors.border,
                    }}
                    value={field.value || ""}
                    onChange={(e) =>
                      updateNodeField(node.id, field.id, "value", e.target.value)
                    }
                  />
                )}

                {field.type === "dropdown" && (
                  <select
                    className="form-select"
                    style={{
                      backgroundColor: themeColors.background,
                      color: themeColors.text,
                      borderColor: themeColors.border,
                    }}
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
                      <input
                        className="form-check-input"
                        type="radio"
                        name={field.id}
                        value={opt}
                        checked={field.value === opt}
                        onChange={() =>
                          updateNodeField(node.id, field.id, "value", opt)
                        }
                        style={{
                          borderColor: themeColors.border,
                        }}
                      />
                      <label
                        className="form-check-label"
                        style={{ color: themeColors.text }}
                      >
                        {opt}
                      </label>
                    </div>
                  ))}

                {field.type === "checkbox" &&
                  field.options?.map((opt) => (
                    <div className="form-check" key={opt}>
                      <input
                        className="form-check-input"
                        type="checkbox"
                        checked={field.value?.includes(opt)}
                        onChange={(e) => {
                          let newValue = field.value || [];
                          if (e.target.checked) newValue = [...newValue, opt];
                          else newValue = newValue.filter((v) => v !== opt);
                          updateNodeField(node.id, field.id, "value", newValue);
                        }}
                        style={{
                          borderColor: themeColors.border,
                        }}
                      />
                      <label
                        className="form-check-label"
                        style={{ color: themeColors.text }}
                      >
                        {opt}
                      </label>
                    </div>
                  ))}
              </>
            )}
          </div>
        ))}
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
          onClick={() => deleteNode(node.id)}
        >
          Delete Node
        </button>
      </div>
    </div>
  );
}
