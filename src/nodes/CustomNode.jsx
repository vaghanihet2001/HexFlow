import React, { useState, useEffect } from "react";
import { Handle, Position, NodeResizer } from "reactflow";

export default function CustomNode({ id, data, selected }) {
  const [nodeHeight, setNodeHeight] = useState(100);

  useEffect(() => {
    const handleResize = () => {
      const el = document.getElementById(id);
      if (el) setNodeHeight(el.offsetHeight);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [id]);

  // Format datetime nicely inside the node
  const prettyDateTime = (str) => {
    if (!str) return "";
    const d = new Date(str);
    if (isNaN(d)) return str;
    return d.toLocaleString();
  };

  return (
    <div
      id={id}
      style={{
        padding: "10px",
        border: "2px solid #555",
        borderRadius: "8px",
        background: data.color || "#fff",
        minWidth: "100px",
        minHeight: "50px",
        maxHeight: "calc(100vh - 20px)",
        height: "100%",
        overflowY: "auto",
        display: "flex",
        flexDirection: "column",
        gap: "8px",

        // scrollbar
        scrollbarWidth: "thin",
        scrollbarColor: "#555 transparent",
      }}
    >
      {selected && <NodeResizer minWidth={100} minHeight={50} />}

      {/* Node title */}
      <div>
        <strong>{data.label}</strong>
      </div>

      {/* Render visible fields */}
      {data.fields
        ?.filter((f) => !f.hide)
        .map((field) => (
          <div
            key={field.id}
            style={{
              marginTop: "5px",
              fontSize: "13px",
              display: field.type === "textarea" ? "flex" : "block",
              flexDirection: "column",
              flex: field.type === "textarea" ? 1 : "0 0 auto",
              minHeight: field.type === "textarea" ? 0 : "auto",
            }}
          >
            <label style={{ fontWeight: "500" }}>{field.label}:</label>

            {/* ====================== TEXT ====================== */}
            {field.type === "text" && (
              <input
                type="text"
                className="form-control"
                value={field.value || ""}
                disabled
                style={{ fontSize: "12px", padding: "3px 6px" }}
              />
            )}

            {/* ====================== TEXT AREA ====================== */}
            {field.type === "textarea" && (
              <textarea
                className="form-control"
                value={field.value || ""}
                disabled
                style={{
                  fontSize: "12px",
                  padding: "3px 6px",
                  resize: "none",
                  height: "100%",
                  width: "100%",
                  boxSizing: "border-box",
                }}
              />
            )}

            {/* ====================== DROPDOWN ====================== */}
            {field.type === "dropdown" && (
              <select
                className="form-select"
                value={field.value || ""}
                disabled
                style={{ fontSize: "12px", padding: "3px 6px" }}
              >
                {field.options?.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            )}

            {/* ====================== RADIO ====================== */}
            {field.type === "radio" &&
              field.options?.map((opt) => (
                <div className="form-check" key={opt} style={{ marginTop: "2px" }}>
                  <input
                    className="form-check-input"
                    type="radio"
                    name={`${data.instanceId}_${field.id}`}
                    value={opt}
                    checked={field.value === opt}
                    disabled
                  />
                  <label className="form-check-label">{opt}</label>
                </div>
              ))}

            {/* ====================== CHECKBOX ====================== */}
            {field.type === "checkbox" &&
              field.options?.map((opt) => (
                <div className="form-check" key={opt} style={{ marginTop: "2px" }}>
                  <input
                    className="form-check-input"
                    type="checkbox"
                    checked={Array.isArray(field.value) && field.value.includes(opt)}
                    disabled
                  />
                  <label className="form-check-label">{opt}</label>
                </div>
              ))}

            {/* ====================== NUMBER ====================== */}
            {field.type === "number" && (
              <input
                type="text"
                value={field.value ?? ""}
                disabled
                className="form-control"
                style={{
                  fontSize: "12px",
                  padding: "3px 6px",
                }}
              />
            )}

            {/* ====================== DATE ====================== */}
            {field.type === "date" && (
              <input
                type="text"
                value={field.value || ""}
                disabled
                className="form-control"
                style={{
                  fontSize: "12px",
                  padding: "3px 6px",
                }}
              />
            )}

            {/* ====================== DATETIME ====================== */}
            {field.type === "datetime" && (
              <input
                type="text"
                value={prettyDateTime(field.value)}
                disabled
                className="form-control"
                style={{
                  fontSize: "12px",
                  padding: "3px 6px",
                }}
              />
            )}
          </div>
        ))}

      {/* Flow handles */}
      {/* Flow handles - All Sides */}
      {/* TOP */}
      <Handle type="target" position={Position.Top} id="target-top" style={{ left: "50%" }} />
      <Handle type="source" position={Position.Top} id="source-top" style={{ left: "50%" }} />

      {/* RIGHT */}
      <Handle type="target" position={Position.Right} id="target-right" style={{ top: "50%" }} />
      <Handle type="source" position={Position.Right} id="source-right" style={{ top: "50%" }} />

      {/* BOTTOM */}
      <Handle type="target" position={Position.Bottom} id="target-bottom" style={{ left: "50%" }} />
      <Handle type="source" position={Position.Bottom} id="source-bottom" style={{ left: "50%" }} />

      {/* LEFT */}
      <Handle type="target" position={Position.Left} id="target-left" style={{ top: "50%" }} />
      <Handle type="source" position={Position.Left} id="source-left" style={{ top: "50%" }} />
    </div>
  );
}
