import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

export default function Sidebar({ availableNodes, onAddNode }) {
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(true);

  const filteredNodes = availableNodes.filter((n) =>
    n.label.toLowerCase().includes(search.toLowerCase())
  );

  const toggleSidebar = () => setIsOpen(!isOpen);

  return (
    <div
      className={`bg-light border-end d-flex flex-column ${
        isOpen ? "p-3" : "p-1"
      }`}
      style={{
        width: isOpen ? "250px" : "50px",
        transition: "width 0.3s",
        height: "100vh",
        overflow: "hidden",
      }}
    >
      {/* Toggle Button */}
      <button
        className="btn btn-secondary mb-3"
        onClick={toggleSidebar}
        style={{ width: "100%" }}
      >
        {isOpen ? "« Collapse" : "»"}
      </button>

      {isOpen && (
        <>
          <h5 className="mb-3">Node Palette</h5>

          {/* Search */}
          <input
            type="text"
            placeholder="Search nodes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="form-control mb-3"
          />

          {/* Node List */}
          <div className="d-flex flex-column gap-2 overflow-auto" style={{ flex: 1 }}>
            {filteredNodes.map((node) => (
              <button
                key={node.type}
                onClick={() => onAddNode(node)}
                className="btn btn-outline-primary text-start"
              >
                {node.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
