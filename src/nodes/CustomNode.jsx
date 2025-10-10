import React, { useState, useEffect } from "react";
import { Handle, Position, NodeResizer } from "reactflow";

export default function CustomNode({ data, selected }) {
  const [nodeHeight, setNodeHeight] = useState(100); // Set initial height

  useEffect(() => {
    // Update nodeHeight when the node's size changes
    const handleResize = () => {
      const nodeElement = document.getElementById(data.id);
      if (nodeElement) {
        
        setNodeHeight(nodeElement.offsetHeight);

      }
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [data.id]);

  return (

      <div
        id={data.id}
        // hide scrollbar
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
              scrollbarWidth: "thin", 
              scrollbarColor: "#888 transparent", 
              WebkitScrollbar: "none",
              WebkitScrollbarThumb: {
                backgroundColor: "red",
                borderRadius: "10px",
              },
              WebkitScrollbarTrack: {
                backgroundColor: "transparent",
              },
            }}


      >
      {selected && <NodeResizer minWidth={100} minHeight={50} />}
      <div><strong>{data.label}</strong></div>

      {data.fields
      ?.filter((field) => !field.hide) // Only include fields where hide is false
      .map((field) => (
        <div key={field.id} style={{ marginTop: "5px" }}>
          <label>{field.label}</label>

          {/* Text Input (read-only) */}
          {field.type === "text" && (
            <input
              type="text"
              className="form-control"
              value={field.value || ""}
              disabled
            />
          )}

          {/* Dropdown (read-only) */}
          {field.type === "dropdown" && (
            <select className="form-select" value={field.value || ""} disabled>
              {field.options?.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          )}

          {/* Radio buttons (read-only) */}
          {field.type === "radio" &&
            field.options?.map((opt) => (
              <div className="form-check" key={opt}>
                <input
                  className="form-check-input"
                  type="radio"
                  // Use instanceId to make radio group unique per node instance
                  name={`${data.instanceId}_${field.id}`}
                  value={opt}
                  checked={field.value === opt}
                  disabled
                />
                <label className="form-check-label">{opt}</label>
              </div>
            ))}

          {/* Checkboxes (read-only) */}
        {field.type === "checkbox" &&
        field.options?.map((opt) => (
            <div className="form-check" key={opt}>
            <input
                className="form-check-input"
                type="checkbox"
                checked={Array.isArray(field.value) ? field.value.includes(opt) : false}
                disabled
            />
            <label className="form-check-label">{opt}</label>
            </div>
        ))}

        </div>
      ))}

      {/* Handles for React Flow */}
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}
