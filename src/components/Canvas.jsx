import React from "react";
import { availableNodes } from "../nodes";

export default function Sidebar({ addNode }) {
  return (
    <div style={{ width: "200px", padding: "10px", background: "#eee" }}>
      <h3>Node Palette</h3>
      {availableNodes.map((n) => (
        <button key={n.type} onClick={() => addNode(n.type)}>
          {n.label}
        </button>
      ))}
    </div>
  );
}
