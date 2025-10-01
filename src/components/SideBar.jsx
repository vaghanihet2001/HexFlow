import React, { useState, useEffect } from "react";
import NodeBuilderModal from "./NodeBuilderModal";
import { Button, Form } from "react-bootstrap";
import { useTheme } from "./ThemeContext";
import { FaTrash, FaPen } from "react-icons/fa";

export default function Sidebar({ availableNodes, onAddNode, onSaveCustomNode, onDeleteCustomNode }) {
  const [search, setSearch] = useState("");
  const [customNodes, setCustomNodes] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editNode, setEditNode] = useState(null);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const { themeColors } = useTheme();

  useEffect(() => {
    const fetchNodes = async () => {
      try {
        const res = await fetch("http://localhost:5000/nodes");
        const data = await res.json();
        setCustomNodes(data);
      } catch (err) {
        console.error("Failed to fetch custom nodes:", err);
      }
    };
    fetchNodes();
  }, []);

  const handleSaveCustomNode = async (node) => {
    const nodeWithId = { ...node, id: node.id || `custom_${Date.now()}` };
    try {
      await fetch("http://localhost:5000/nodes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nodeWithId),
      });
      const res = await fetch("http://localhost:5000/nodes");
      const data = await res.json();
      setCustomNodes(data);
      onSaveCustomNode(nodeWithId);
      setShowModal(false);
    } catch (err) {
      console.error("Failed to save custom node:", err);
    }
  };

  const handleDelete = async (nodeId) => {
    if (!window.confirm("Are you sure you want to delete this custom node?")) return;
    try {
      await fetch(`http://localhost:5000/nodes/${nodeId}`, { method: "DELETE" });
      const res = await fetch("http://localhost:5000/nodes");
      const data = await res.json();
      setCustomNodes(data);
      onDeleteCustomNode(nodeId);
    } catch (err) {
      console.error("Failed to delete custom node:", err);
    }
  };

  const handleReset = async () => {
    if (!window.confirm("Are you sure you want to reset all custom nodes?")) return;
    try {
      const allNodes = await fetch("http://localhost:5000/nodes");
      const data = await allNodes.json();
      for (const node of data) {
        await fetch(`http://localhost:5000/nodes/${node.id}`, { method: "DELETE" });
      }
      setCustomNodes([]);
    } catch (err) {
      console.error("Failed to reset custom nodes:", err);
    }
  };

  // Merge default and custom nodes
  const mergedNodesMap = new Map();
  availableNodes.forEach((n) => mergedNodesMap.set(n.id, n));
  customNodes.forEach((n) => mergedNodesMap.set(n.id, n));
  const filteredNodes = Array.from(mergedNodesMap.values()).filter((n) =>
    n.label.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div
      className="d-flex flex-column"
      style={{
        width: isCollapsed ? "50px" : "280px",
        height: "100vh",
        transition: "width 0.3s",
        backgroundColor: themeColors.sidebarBg,
        borderRight: `1px solid ${themeColors.border}`,
        color: themeColors.text,
      }}
    >
      {/* Top Sticky Section */}
      {!isCollapsed && (
        <div
          className="flex-shrink-0 px-3 pt-2 pb-1"
          style={{
            position: "sticky",
            top: 0,
            backgroundColor: themeColors.sidebarBg,
            zIndex: 10,
            borderBottom: `1px solid ${themeColors.border}`,
          }}
        >
          <div className="d-flex justify-content-between align-items-center mb-2">
            <h5 className="mb-0">Node Palette</h5>
            <Button size="sm" variant="outline-secondary" onClick={() => setIsCollapsed(!isCollapsed)}>⬅</Button>
          </div>
          <style>
            {`
              .form-control::placeholder {
                color: ${themeColors.placeholderText};
              }
            `}
          </style>
          <Form.Control
            type="text"
            className="mb-2"
            placeholder="Search nodes..."
    
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              backgroundColor: themeColors.inputBg,
              color: themeColors.text,
              borderColor: themeColors.border,
            }}
          />
          
        </div>
      )}

      {/* Middle Scrollable Node List */}
      {!isCollapsed && (
        <div className="flex-grow-1 overflow-auto px-3" style={{ paddingBottom: "100px" }}>
          <div className="d-flex flex-column gap-2">
            {filteredNodes.map((node, idx) => (
              <div key={idx} className="d-flex justify-content-between align-items-center">
                <Button
                  variant="outline-secondary"
                  size="sm"
                  className="flex-grow-1 me-1 d-flex align-items-center"
                  onClick={() => onAddNode(node)}
                  style={{
                    backgroundColor: themeColors.cardBg,
                    color: themeColors.text,
                    borderColor: themeColors.border,
                  }}
                >
                  <span
                    style={{
                      width: "16px",
                      height: "16px",
                      backgroundColor: node.color || "#aaa",
                      display: "inline-block",
                      marginRight: "8px",
                      borderRadius: "3px",
                    }}
                  />
                  {node.label}
                </Button>

                {node.id?.startsWith("custom_") && (
                  <div className="d-flex gap-1">
                    <Button
                      variant={themeColors.buttonVariant}
                      size="sm"
                      style={{ backgroundColor: themeColors.cardBg, color: themeColors.text, borderColor: themeColors.border }}
                      onClick={() => {
                        setEditNode(node);
                        setShowModal(true);
                      }}
                    >
                      <FaPen />
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDelete(node.id)}
                    >
                      <FaTrash />
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bottom Sticky Buttons */}
      {!isCollapsed && (
        <div
          className="flex-shrink-0 p-3"
          style={{
            position: "sticky",
            bottom: 0,
            backgroundColor: themeColors.sidebarBg,
            zIndex: 10,
            borderTop: `1px solid ${themeColors.border}`,
          }}
        >
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
      )}

      {/* Collapse Button (when collapsed) */}
      {isCollapsed && (
        <div className="p-2 border-bottom d-flex justify-content-center flex-shrink-0"
          style={{ borderBottom: `1px solid ${themeColors.border}`, backgroundColor: themeColors.sidebarBg }}
        >
          <Button size="sm" variant="outline-secondary" onClick={() => setIsCollapsed(false)}>➤</Button>
        </div>
      )}

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
