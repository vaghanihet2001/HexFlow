// src/components/Sidebar.jsx
import React, { useState, useEffect } from "react";
import NodeBuilderModal from "./NodeBuilderModal";
import { Button } from "react-bootstrap";

export default function Sidebar({ availableNodes, onAddNode, onSaveCustomNode, onDeleteCustomNode }) {
  const [search, setSearch] = useState("");
  const [customNodes, setCustomNodes] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editNode, setEditNode] = useState(null);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("customNodes") || "[]");
    setCustomNodes(saved);
  }, []);

  const handleSaveCustomNode = (node) => {
    let updated;
    if (editNode) {
      updated = customNodes.map((n) => (n.id === node.id ? node : n));
    } else {
      const nodeWithId = { ...node, id: node.id || `custom_${Date.now()}` };
      updated = [...customNodes, nodeWithId];
    }
    setCustomNodes(updated);
    localStorage.setItem("customNodes", JSON.stringify(updated));
    onSaveCustomNode(node);
    setShowModal(false);
  };

  const handleDelete = (nodeId) => {
    if (!window.confirm("Are you sure you want to delete this custom node?")) return;

    const updated = customNodes.filter((n) => n.id !== nodeId);
    setCustomNodes(updated);
    localStorage.setItem("customNodes", JSON.stringify(updated));
    onDeleteCustomNode(nodeId);
  };

  const handleReset = () => {
    if (!window.confirm("Are you sure you want to reset all custom nodes?")) return;

    setCustomNodes([]);
    localStorage.removeItem("customNodes");
  };

  const mergedNodesMap = new Map();
  availableNodes.forEach((n) => mergedNodesMap.set(n.id, n));
  customNodes.forEach((n) => mergedNodesMap.set(n.id, n));
  const filteredNodes = Array.from(mergedNodesMap.values()).filter((n) =>
    n.label.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="d-flex flex-column bg-light border-end" style={{ width: "280px", height: "100vh" }}>
      {/* Node List */}
      <div className="flex-grow-1 overflow-auto p-3">
        <h5>Node Palette</h5>
        <input
          type="text"
          className="form-control mb-2"
          placeholder="Search nodes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className="d-flex flex-column gap-2">
          {filteredNodes.map((node, idx) => (
            <div key={idx} className="d-flex justify-content-between align-items-center">
              <Button
                variant="outline-secondary"
                size="sm"
                className="flex-grow-1 me-1"
                onClick={() => onAddNode(node)}
              >
                {node.label}
              </Button>

              {node.id?.startsWith("custom_") && (
                <>
                  <Button
                    variant="outline-warning"
                    size="sm"
                    onClick={() => {
                      setEditNode(node);
                      setShowModal(true);
                    }}
                  >
                    ✎
                  </Button>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => handleDelete(node.id)}
                  >
                    🗑
                  </Button>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Buttons */}
      <div className="p-3 border-top">
        <Button
          variant="primary"
          className="w-100 mb-2"
          onClick={() => {
            setEditNode(null);
            setShowModal(true);
          }}
        >
          + Create Node
        </Button>
        <Button
          variant="danger"
          className="w-100"
          onClick={handleReset}
        >
          Reset Nodes
        </Button>
      </div>

      {/* Node Builder Modal */}
      <NodeBuilderModal
        show={showModal}
        onClose={() => setShowModal(false)}
        onSave={handleSaveCustomNode}
        editingNode={editNode}
      />
    </div>
  );
}
