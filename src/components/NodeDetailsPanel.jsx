// src/components/NodeDetailsPanel.jsx
import React from "react";
import { useTheme } from "./ThemeContext";
import { FaEye, FaEyeSlash, FaWindowClose } from "react-icons/fa";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "../css/datepicker-theme.css";

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

  const toggleAllFields = () => {
    const anyVisible = node.data.fields.some((f) => !f.hide);
    node.data.fields.forEach((f) =>
      updateNodeField(node.id, f.id, "hide", anyVisible)
    );
  };

  return (
    <div
      className="d-flex flex-column border-start"
      style={{
        width: "260px",
        backgroundColor: themeColors.sidebarBg,
        color: themeColors.text,
        borderColor: themeColors.border,

        // 🔥 Inject theme variables used by datepicker-theme.css
        "--dp-bg": themeColors.background,
        "--dp-text": themeColors.text,
        "--dp-border": themeColors.border,
      }}
    >
      {/* Header */}
      <div
        className="p-3 border-bottom d-flex justify-content-between align-items-center"
        style={{ borderColor: themeColors.border }}
      >
        <h5 className="mb-0">Node Details</h5>

        <button
          onClick={onClosePanel}
          style={{
            background: "transparent",
            border: "none",
            fontSize: "22px",
            color: themeColors.text,
            cursor: "pointer",
          }}
        >
          <FaWindowClose />
        </button>
      </div>

      {/* Hide/Unhide All */}
      <div className="p-3 border-bottom">
        <button className="btn btn-outline-primary w-100" onClick={toggleAllFields}>
          {node.data.fields.some((f) => !f.hide)
            ? "Hide All Fields"
            : "Unhide All Fields"}
        </button>
      </div>

      {/* Scrollable Body */}
      <div className="flex-grow-1 overflow-auto p-3">
        {/* Label */}
        <div className="mb-3">
          <label style={{ color: themeColors.text }}>Label</label>
          <input
            className="form-control"
            value={node.data.label}
            onChange={(e) => updateNodeData(node.id, "label", e.target.value)}
            style={{
              backgroundColor: themeColors.cardBg,
              color: themeColors.text,
              borderColor: themeColors.border,
            }}
          />
        </div>

        {/* Color */}
        <div className="mb-3">
          <label style={{ color: themeColors.text }}>Color</label>
          <input
            type="color"
            className="form-control form-control-color"
            value={node.data.color}
            onChange={(e) => updateNodeData(node.id, "color", e.target.value)}
            style={{
              padding: 0,
              height: "38px",
              borderColor: themeColors.border,
            }}
          />
        </div>

        {/* FIELDS */}
        {node.data.fields.map((field) => (
          <div
            key={field.id}
            className="border rounded p-2 mb-3"
            style={{
              backgroundColor: themeColors.cardBg,
              borderColor: themeColors.border,
              color: themeColors.text,
            }}
          >
            <div className="d-flex justify-content-between mb-1">
              <label style={{ color: themeColors.text }}>{field.label}</label>

              <button
                className="btn btn-sm btn-outline-secondary"
                onClick={() => toggleFieldVisibility(field.id)}
              >
                {field.hide ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>

            {!field.hide && (
              <>
                {field.type === "text" && (
                  <input
                    className="form-control"
                    style={{
                      backgroundColor: themeColors.background,
                      color: themeColors.text,
                      borderColor: themeColors.border,
                    }}
                    value={field.value}
                    onChange={(e) =>
                      updateNodeField(node.id, field.id, "value", e.target.value)
                    }
                  />
                )}

                {field.type === "dropdown" && (
                  <select
                    className="form-select"
                    value={field.value}
                    onChange={(e) =>
                      updateNodeField(node.id, field.id, "value", e.target.value)
                    }
                    style={{
                      backgroundColor: themeColors.background,
                      color: themeColors.text,
                      borderColor: themeColors.border,
                    }}
                  >
                    {field.options.map((o) => (
                      <option key={o}>{o}</option>
                    ))}
                  </select>
                )}

                {field.type === "radio" &&
                  field.options.map((o) => (
                    <div key={o} className="form-check">
                      <input
                        type="radio"
                        className="form-check-input"
                        checked={field.value === o}
                        onChange={() =>
                          updateNodeField(node.id, field.id, "value", o)
                        }
                      />
                      <label className="form-check-label" style={{ color: themeColors.text }}>
                        {o}
                      </label>
                    </div>
                  ))}

                {field.type === "checkbox" &&
                  field.options.map((o) => (
                    <div key={o} className="form-check">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        checked={field.value?.includes(o)}
                        onChange={(e) => {
                          let v = [...(field.value || [])];
                          if (e.target.checked) v.push(o);
                          else v = v.filter((x) => x !== o);
                          updateNodeField(node.id, field.id, "value", v);
                        }}
                      />
                      <label className="form-check-label" style={{ color: themeColors.text }}>
                        {o}
                      </label>
                    </div>
                  ))}

                {field.type === "number" && (
                  <>
                    <label style={{ color: themeColors.text }}>Value</label>
                    <input
                      type="number"
                      className="form-control"
                      value={field.value}
                      onChange={(e) =>
                        updateNodeField(
                          node.id,
                          field.id,
                          "value",
                          field.numberType === "int"
                            ? parseInt(e.target.value)
                            : parseFloat(e.target.value)
                        )
                      }
                      style={{
                        backgroundColor: themeColors.background,
                        color: themeColors.text,
                        borderColor: themeColors.border,
                      }}
                    />

                    <label className="mt-2" style={{ color: themeColors.text }}>Min</label>
                    <input
                      type="number"
                      className="form-control"
                      value={field.min}
                      onChange={(e) =>
                        updateNodeField(node.id, field.id, "min", Number(e.target.value))
                      }
                      style={{
                        backgroundColor: themeColors.background,
                        color: themeColors.text,
                        borderColor: themeColors.border,
                      }}
                    />

                    <label className="mt-2" style={{ color: themeColors.text }}>Max</label>
                    <input
                      type="number"
                      className="form-control"
                      value={field.max}
                      onChange={(e) =>
                        updateNodeField(node.id, field.id, "max", Number(e.target.value))
                      }
                      style={{
                        backgroundColor: themeColors.background,
                        color: themeColors.text,
                        borderColor: themeColors.border,
                      }}
                    />

                    <label className="mt-2" style={{ color: themeColors.text }}>
                      Number Type
                    </label>
                    <select
                      className="form-select"
                      value={field.numberType}
                      onChange={(e) =>
                        updateNodeField(node.id, field.id, "numberType", e.target.value)
                      }
                      style={{
                        backgroundColor: themeColors.background,
                        color: themeColors.text,
                        borderColor: themeColors.border,
                      }}
                    >
                      <option value="int">Integer</option>
                      <option value="float">Float</option>
                    </select>
                  </>
                )}

                {/* DATE */}
                {field.type === "date" && (
                  <>
                    <label style={{ color: themeColors.text }}>Date</label>
                    <DatePicker
                      selected={field.value ? new Date(field.value) : null}
                      onChange={(date) =>
                        updateNodeField(
                          node.id,
                          field.id,
                          "value",
                          date?.toISOString().split("T")[0]
                        )
                      }
                      className="form-control"
                      dateFormat="yyyy-MM-dd"
                      placeholderText="Select date"
                    />
                  </>
                )}

                {/* DATETIME */}
                {field.type === "datetime" && (
                  <>
                    <label style={{ color: themeColors.text }}>Date & Time</label>
                    <DatePicker
                      selected={field.value ? new Date(field.value) : null}
                      onChange={(date) =>
                        updateNodeField(node.id, field.id, "value", date?.toISOString())
                      }
                      showTimeSelect
                      timeIntervals={5}
                      dateFormat="yyyy-MM-dd HH:mm"
                      className="form-control"
                      placeholderText="Select date & time"
                    />
                  </>
                )}
              </>
            )}
          </div>
        ))}
      </div>

      <div className="p-3 border-top">
        <button className="btn btn-danger w-100" onClick={() => deleteNode(node.id)}>
          Delete Node
        </button>
      </div>
    </div>
  );
}
