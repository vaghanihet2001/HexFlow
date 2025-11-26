// src/components/Sidebar.jsx
import React, { useState, useEffect } from "react";
import NodeBuilderModal from "./NodeBuilderModal";
import AppModal from "./AppModal";
import { Button, Form } from "react-bootstrap";
import { useTheme } from "./ThemeContext";
import { FaTrash, FaPen, FaCube } from "react-icons/fa";
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

  const [loadingNodes, setLoadingNodes] = useState(true);

  // 🔥 Global AppModal state
  const [confirmResetModal, setConfirmResetModal] = useState({ show: false });

  const { themeColors } = useTheme();

  // ========================================
  // 🔐 Auth Fetch Wrapper
  // ========================================
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

  // ========================================
  // 📥 Fetch nodes
  // ========================================
  useEffect(() => {
    const fetchNodes = async () => {
      try {
        setLoadingNodes(true);

        const res = await fetchWithAuth(`${BACKEND_URL}/nodes`);
        const data = await res.json();

        if (Array.isArray(data)) setCustomNodes(data);
      } catch (err) {
        console.error("Failed to fetch nodes:", err);
      } finally {
        setLoadingNodes(false);
      }
    };

    const auth = getAuth();
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) setTimeout(fetchNodes, 300);
      else {
        setCustomNodes([]);
        setLoadingNodes(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // ========================================
  // 💾 Save custom node (duplicate fix)
  // ========================================
  const handleSaveCustomNode = async (node) => {
    const nodeWithId = {
      ...node,
      id: node.id || `custom_${Date.now()}`,
    };

    // 🚀 FIX: Ignore the current node when checking duplicates
    if (
      customNodes.some(
        (n) =>
          n.id !== nodeWithId.id &&
          n.label.trim().toLowerCase() === nodeWithId.label.trim().toLowerCase()
      )
    ) {
      throw new Error("A node with this name already exists.");
    }

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
      throw err;
    } finally {
      setLoadingNodes(false);
    }
  };

  // ========================================
  // 🗑 Delete node
  // ========================================
  const handleDelete = async (nodeId) => {
    if (!window.confirm("Delete this custom node?")) return;

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

  // ========================================
  // Reset nodes → Use AppModal
  // ========================================
  const openResetConfirm = () => {
    setConfirmResetModal({
      show: true,
      title: "Remove All Custom Nodes?",
      message: "This will permanently delete all your custom nodes.",
      type: "confirm",
      confirmText: "Remove",
      cancelText: "Cancel",
      onConfirm: handleResetConfirm,
    });
  };

  const handleResetConfirm = async () => {
    try {
      setLoadingNodes(true);

      const allNodes = await fetchWithAuth(`${BACKEND_URL}/nodes`);
      const data = await allNodes.json();

      for (const node of data) {
        await fetchWithAuth(`${BACKEND_URL}/nodes/${node.id}`, {
          method: "DELETE",
        });
      }

      setCustomNodes([]);
      setConfirmResetModal({ show: false });
    } catch (err) {
      console.error("Failed to reset:", err);

      setConfirmResetModal({
        show: true,
        title: "Reset Failed",
        message: err.message || "Something went wrong.",
        type: "error",
        confirmText: "Close",
      });
    } finally {
      setLoadingNodes(false);
    }
  };

  // ========================================
  // Merge nodes
  // ========================================
  const mergedNodesMap = new Map();
  availableNodes.forEach((n) => mergedNodesMap.set(n.id, n));
  customNodes.forEach((n) => mergedNodesMap.set(n.id, n));

  const filteredNodes = Array.from(mergedNodesMap.values()).filter((n) =>
    n.label.toLowerCase().includes(search.toLowerCase())
  );

  // ========================================
  // Skeleton item
  // ========================================
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
          background:
            "linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,0.2), rgba(255,255,255,0))",
          position: "absolute",
          top: 0,
          left: "-100%",
          width: "100%",
          height: "100%",
          animation: "loadingShimmer 1.4s infinite",
        }}
      />
    </div>
  );

  // ========================================
  // UI RENDER
  // ========================================
  return (
    <>
      {/* Floating Toggle Button */}
      <Button
        onClick={() => setIsCollapsed(!isCollapsed)}
        style={{
          position: "absolute",
          top: "120px",
          left: isCollapsed ? "12px" : "300px",
          zIndex: 9999,
          transition: "left 0.3s",
          width: "100px",
          height: "40px",
          borderRadius: "8px",
          background: themeColors.cardBg,
          color: themeColors.text,
          border: `1px solid ${themeColors.border}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "6px",
        }}
      >
        Nodes <FaCube />
      </Button>

      {/* Sidebar */}
      <div
        className="d-flex flex-column"
        style={{
          width: isCollapsed ? "0px" : "280px",
          height: "100%",
          overflow: "hidden",
          backgroundColor: themeColors.sidebarBg,
          borderRight: isCollapsed ? "none" : `1px solid ${themeColors.border}`,
          transition: "width 0.3s",
          color: themeColors.text,
        }}
      >
        {/* Search Bar */}
        {!isCollapsed && (
          <div
            className="flex-shrink-0 px-3 pt-3 pb-2"
            style={{
              position: "sticky",
              top: 0,
              zIndex: 10,
              backgroundColor: themeColors.sidebarBg,
              borderBottom: `1px solid ${themeColors.border}`,
            }}
          >
            <style>
              {`
                .sidebar-search::placeholder {
                  color: ${themeColors.placeholderText} !important;
                }
                .sidebar-search:focus {
                  box-shadow: 0 0 0 2px ${themeColors.primary}50 !important;
                }
              `}
            </style>

            <Form.Control
              type="text"
              className="sidebar-search"
              placeholder="Search nodes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                backgroundColor: themeColors.inputBg,
                color: themeColors.inputText,
                borderColor: themeColors.border,
                padding: "8px 10px",
                borderRadius: "6px",
              }}
            />
          </div>
        )}

        {/* Node List */}
        {!isCollapsed && (
          <div
            className="flex-grow-1 px-3 py-2"
            style={{
              overflowY: "auto",
              overflowX: "hidden",
            }}
          >
            {loadingNodes ? (
              <div className="d-flex flex-column gap-2">
                {Array.from({ length: 8 }).map((_, i) => (
                  <SkeletonItem key={i} />
                ))}
              </div>
            ) : (
              <div className="d-flex flex-column gap-2">
                {filteredNodes.map((node) => (
                  <div
                    key={node.id}
                    className="d-flex justify-content-between align-items-center"
                  >
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
                          marginRight: "8px",
                          borderRadius: "3px",
                        }}
                      />
                      {node.label}
                    </Button>

                    {node.id?.startsWith("custom_") && (
                      <div className="d-flex gap-1">
                        <Button
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
            )}
          </div>
        )}

        {/* Bottom */}
        {!isCollapsed && !loadingNodes && (
          <div
            className="flex-shrink-0 p-3"
            style={{
              position: "sticky",
              bottom: 0,
              backgroundColor: themeColors.sidebarBg,
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

            <Button variant="danger" className="w-100" onClick={openResetConfirm}>
              Remove Nodes
            </Button>
            

            <footer style={{ fontSize: "0.75rem", marginTop: "10px", textAlign: "center", color: themeColors.subtleText }}>
                © 2025 HexFlow by HexVerce
            </footer>

          </div>
        )}

        {/* Modals */}
        <NodeBuilderModal
          show={showModal}
          onClose={() => setShowModal(false)}
          onSave={handleSaveCustomNode}
          editingNode={editNode}
        />

        <AppModal
          show={confirmResetModal.show}
          title={confirmResetModal.title}
          message={confirmResetModal.message}
          type={confirmResetModal.type}
          confirmText={confirmResetModal.confirmText}
          cancelText={confirmResetModal.cancelText}
          onConfirm={confirmResetModal.onConfirm}
          onClose={() => setConfirmResetModal({ show: false })}
        />
      </div>
    </>
  );
}
