import React, { useState, useEffect } from "react";
import NodeBuilderModal from "./NodeBuilderModal";
import { Button } from "react-bootstrap";

export default function Sidebar({ availableNodes, onAddNode, onSaveCustomNode, onDeleteCustomNode }) {
  const [search, setSearch] = useState("");
  const [customNodes, setCustomNodes] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editNode, setEditNode] = useState(null);
  const [isCollapsed, setIsCollapsed] = useState(false); // new

  // Load nodes from server
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

  const mergedNodesMap = new Map();
  availableNodes.forEach((n) => mergedNodesMap.set(n.id, n));
  customNodes.forEach((n) => mergedNodesMap.set(n.id, n));
  const filteredNodes = Array.from(mergedNodesMap.values()).filter((n) =>
    n.label.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div
      className="d-flex flex-column bg-light border-end"
      style={{ width: isCollapsed ? "50px" : "280px", height: "100vh", transition: "width 0.3s" }}
    >
      

      {/* Node List */}
      {!isCollapsed && (
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
      )}

      {/* Collapse / Expand Button */}
      <div className="p-2 border-bottom d-flex justify-content-center">
        <Button
          size="sm"
          variant="outline-secondary"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? "➤" : "⬅"}
        </Button>
      </div>
      
      {/* Bottom Buttons */}
      {!isCollapsed && (
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
