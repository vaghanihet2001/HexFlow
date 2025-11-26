import React, { useState, useEffect } from "react";
import NodeBuilderModal from "./NodeBuilderModal";
import { Button, Form } from "react-bootstrap";
import { useTheme } from "./ThemeContext";
import { FaTrash, FaPen } from "react-icons/fa";
import { getAuth } from "firebase/auth";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export default function Sidebar({
  availableNodes,
  onAddNode,
  onSaveCustomNode,
  onDeleteCustomNode,
}) {
  const [search, setSearch] = useState("");
  const [customNodes, setCustomNodes] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editNode, setEditNode] = useState(null);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Skeleton loader
  const [loadingNodes, setLoadingNodes] = useState(true);

  const { themeColors } = useTheme();

  // =============================
  // 🔐 Auth Fetch Wrapper
  // =============================
  const fetchWithAuth = async (url, options = {}) => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) throw new Error("User not logged in");
    const token = await user.getIdToken();

    return fetch(url, {
      ...options,
      headers: {
        ...(options.headers || {}),
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
  };

  // =============================
  // 📥 Fetch nodes from backend
  // =============================
  useEffect(() => {
    const fetchNodes = async () => {
      try {
        setLoadingNodes(true);

        const res = await fetchWithAuth(`${BACKEND_URL}/nodes`);
        const data = await res.json();

        if (Array.isArray(data)) {
          setCustomNodes(data);
        }
      } catch (err) {
        console.error("Failed to fetch custom nodes:", err);
      } finally {
        setLoadingNodes(false);
      }
    };

    const auth = getAuth();
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setTimeout(fetchNodes, 300);
      } else {
        setCustomNodes([]);
        setLoadingNodes(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // =============================
  // 💾 Save custom node
  // =============================
  const handleSaveCustomNode = async (node) => {
    const nodeWithId = { ...node, id: node.id || `custom_${Date.now()}` };
    try {
      setLoadingNodes(true);

      await fetchWithAuth(`${BACKEND_URL}/nodes`, {
        method: "POST",
        body: JSON.stringify(nodeWithId),
      });

      const res = await fetchWithAuth(`${BACKEND_URL}/nodes`);
      const data = await res.json();

      setCustomNodes(data);
      onSaveCustomNode(nodeWithId);
      setShowModal(false);
    } catch (err) {
      console.error("Failed to save custom node:", err);
    } finally {
      setLoadingNodes(false);
    }
  };

  // =============================
  // 🗑️ Delete node
  // =============================
  const handleDelete = async (nodeId) => {
    if (!window.confirm("Are you sure you want to delete this custom node?")) return;

    try {
      setLoadingNodes(true);

      await fetchWithAuth(`${BACKEND_URL}/nodes/${nodeId}`, { method: "DELETE" });

      const res = await fetchWithAuth(`${BACKEND_URL}/nodes`);
      const data = await res.json();

      setCustomNodes(data);
      onDeleteCustomNode(nodeId);
    } catch (err) {
      console.error("Failed to delete custom node:", err);
    } finally {
      setLoadingNodes(false);
    }
  };

  // =============================
  // 🔁 Reset nodes
  // =============================
  const handleReset = async () => {
    if (!window.confirm("Are you sure you want to reset all custom nodes?")) return;

    try {
      setLoadingNodes(true);

      const allNodes = await fetchWithAuth(`${BACKEND_URL}/nodes`);
      const data = await allNodes.json();

      for (const node of data) {
        await fetchWithAuth(`${BACKEND_URL}/nodes/${node.id}`, { method: "DELETE" });
      }

      setCustomNodes([]);
    } catch (err) {
      console.error("Failed to reset custom nodes:", err);
    } finally {
      setLoadingNodes(false);
    }
  };

  // =============================
  // 🧩 Merge & Filter Nodes
  // =============================
  const mergedNodesMap = new Map();
  availableNodes.forEach((n) => mergedNodesMap.set(n.id, n));
  customNodes.forEach((n) => mergedNodesMap.set(n.id, n));
  const filteredNodes = Array.from(mergedNodesMap.values()).filter((n) =>
    n.label.toLowerCase().includes(search.toLowerCase())
  );

  // =============================
  // 🎨 Skeleton Item Component
  // =============================
  const SkeletonItem = () => (
    <div
      style={{
        height: "36px",
        width: "100%",
        background: themeColors.cardBg,
        borderRadius: "6px",
        marginBottom: "10px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          background: "linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,0.2), rgba(255,255,255,0))",
          position: "absolute",
          top: 0,
          left: "-100%",
          width: "100%",
          height: "100%",
          animation: "loadingShimmer 1.4s infinite",
        }}
      ></div>
    </div>
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
        position: "relative",
      }}
    >
      <style>
        {`
          @keyframes loadingShimmer {
            0% { left: -100%; }
            50% { left: 100%; }
            100% { left: 100%; }
          }
        `}
      </style>

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
            <Button
              size="sm"
              variant="outline-secondary"
              onClick={() => setIsCollapsed(!isCollapsed)}
            >
              ⬅
            </Button>
          </div>

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
          {loadingNodes ? (
            // 🔥 Skeleton UI
            <div className="d-flex flex-column gap-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <SkeletonItem key={i} />
              ))}
            </div>
          ) : (
            // 🔥 Real node list
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
                        style={{
                          backgroundColor: themeColors.cardBg,
                          color: themeColors.text,
                          borderColor: themeColors.border,
                        }}
                        onClick={() => {
                          setEditNode(node);
                          setShowModal(true);
                        }}
                      >
                        <FaPen />
                      </Button>
                      <Button variant="danger" size="sm" onClick={() => handleDelete(node.id)}>
                        <FaTrash />
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Bottom Sticky Buttons */}
      {!isCollapsed && !loadingNodes && (
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
          <Button variant="danger" className="w-100" onClick={handleReset}>
            Reset Nodes
          </Button>
        </div>
      )}

      {/* Collapsed Button */}
      {isCollapsed && (
        <div
          className="p-2 border-bottom d-flex justify-content-center flex-shrink-0"
          style={{
            borderBottom: `1px solid ${themeColors.border}`,
            backgroundColor: themeColors.sidebarBg,
          }}
        >
          <Button size="sm" variant="outline-secondary" onClick={() => setIsCollapsed(false)}>
            ➤
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
