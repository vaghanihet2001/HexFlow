// src/components/Toolbar.jsx
import React, { useRef, useState } from "react";
import { Button, Dropdown, DropdownButton } from "react-bootstrap";
import { FaCheck } from "react-icons/fa";
import * as htmlToImage from "html-to-image";
import { useTheme } from "./ThemeContext";
import AppModal from "./AppModal";

export default function Toolbar({
  nodes,
  edges,
  setNodes,
  setEdges,
  onExportNodes,
  onImportNodes,
  onFetchDefaultNodes,
  onRemoveAllNodes,
  viewOptions,
  onToggleView,
}) {
  const fileInputRef = useRef();
  const nodeImportRef = useRef();
  const { theme, themeColors } = useTheme();

  // 🔥 State for custom confirmation modal
  const [modal, setModal] = useState({ show: false });

  // =============================
  // 📁 SAVE GRAPH
  // =============================
  const handleSave = async () => {
    const graph = { nodes, edges };
    const json = JSON.stringify(graph, null, 2);

    if ("showSaveFilePicker" in window) {
      try {
        const handle = await window.showSaveFilePicker({
          suggestedName: "graph.json",
          types: [
            {
              description: "JSON File",
              accept: { "application/json": [".json"] },
            },
          ],
        });

        const writable = await handle.createWritable();
        await writable.write(json);
        await writable.close();
        return;
      } catch (err) {
        if (err.name === "AbortError" || err.name === "NotAllowedError") {
          console.log("Save canceled");
          return;
        }
        console.error("Save dialog failed:", err);
      }
    }

    // Fallback download
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");

    a.href = url;
    a.download = "graph.json";
    a.click();

    URL.revokeObjectURL(url);
  };

  // =============================
  // 📂 LOAD GRAPH
  // =============================
  const handleLoad = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const graph = JSON.parse(e.target.result);
        setNodes(graph.nodes || []);
        setEdges(graph.edges || []);
      } catch (err) {
        setModal({
          show: true,
          title: "Invalid JSON",
          message: "The selected file is not a valid graph file.",
          type: "error",
          confirmText: "Close",
        });
      }
    };
    reader.readAsText(file);
  };

  // =============================
  // 🆕 CREATE NEW GRAPH (Show Modal)
  // =============================
  const confirmNewGraph = () => {
    setModal({
      show: true,
      type: "confirm",
      title: "Start New Graph?",
      message: "All unsaved changes will be lost. Continue?",
      confirmText: "Yes, Start New",
      cancelText: "Cancel",
      onConfirm: () => {
        setNodes([]);
        setEdges([]);
        setModal({ show: false });
      },
    });
  };

  // =============================
  // 🗑 REMOVE ALL NODES (Show Modal)
  // =============================
  const confirmRemoveAllNodes = () => {
    setModal({
      show: true,
      type: "confirm",
      title: "Remove All Custom Nodes?",
      message: "This will permanently delete all your custom nodes. Continue?",
      confirmText: "Remove All",
      cancelText: "Cancel",
      onConfirm: () => {
        onRemoveAllNodes();
        setModal({ show: false });
      },
    });
  };

  // =============================
  // 🖼 EXPORT IMAGE
  // =============================

  const handleExportImage = async () => {
    const el = document.querySelector(".react-flow");
    if (!el)
      return setModal({
        show: true,
        title: "Export Failed",
        message: "ReactFlow container not found!",
        type: "error",
        confirmText: "Close",
      });

    const width = el.scrollWidth;
    const height = el.scrollHeight;

    // Clone node for clean rendering
    const clone = el.cloneNode(true);
    clone.style.transform = "scale(1)";
    clone.style.transformOrigin = "top left";
    clone.style.width = `${width}px`;
    clone.style.height = `${height}px`;
    clone.style.background = themeColors.background;

    document.body.appendChild(clone);

    try {
      const dataUrl = await htmlToImage.toPng(clone, {
        width,
        height,
        style: { background: themeColors.background },
      });

      document.body.removeChild(clone);

      // If browser supports file picker — use it
      if ("showSaveFilePicker" in window) {
        try {
          const handle = await window.showSaveFilePicker({
            suggestedName: "graph.png",
            types: [
              {
                description: "PNG Image",
                accept: { "image/png": [".png"] },
              },
            ],
          });

          const writable = await handle.createWritable();
          const blob = await (await fetch(dataUrl)).blob();

          await writable.write(blob);
          await writable.close();
          return;
        } catch (err) {
          if (err.name === "AbortError" || err.name === "NotAllowedError") {
            console.log("Save canceled");
            return;
          }
          console.error("Save File Dialog failed:", err);
        }
      }

      // Otherwise fallback auto-download
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = "graph.png";
      a.click();

    } catch (err) {
      console.error("Export failed:", err);
      setModal({
        show: true,
        type: "error",
        title: "Export Failed",
        message: "Unable to export graph image.",
        confirmText: "Close",
      });
      document.body.removeChild(clone);
    }
  };


  return (
    <>
      <div
        className="d-flex align-items-center gap-2 p-2 border-bottom"
        style={{
          backgroundColor: themeColors.toolbarBg,
          borderColor: themeColors.border,
          color: themeColors.text,
        }}
      >
        {/* File Menu */}
        <DropdownButton
          id="dropdown-file"
          title="File"
          variant={theme === "light" ? "secondary" : "dark"}
          size="sm"
          menuVariant={theme === "light" ? "light" : "dark"}
        >
          <Dropdown.Item onClick={confirmNewGraph}>New</Dropdown.Item>
          <Dropdown.Item onClick={handleSave}>Save</Dropdown.Item>
          <Dropdown.Item onClick={() => fileInputRef.current.click()}>
            Load
          </Dropdown.Item>
          <Dropdown.Item onClick={handleExportImage}>
            Export as Image
          </Dropdown.Item>
        </DropdownButton>

        {/* Nodes Menu */}
        <DropdownButton
          id="dropdown-nodes"
          title="Nodes"
          variant={theme === "light" ? "secondary" : "dark"}
          size="sm"
          menuVariant={theme === "light" ? "light" : "dark"}
        >
          <Dropdown.Item onClick={onFetchDefaultNodes}>
            Fetch Default Nodes
          </Dropdown.Item>
          <Dropdown.Item onClick={onExportNodes}>Export Nodes</Dropdown.Item>
          <Dropdown.Item onClick={() => nodeImportRef.current.click()}>
            Import Nodes
          </Dropdown.Item>
          <Dropdown.Divider />
          <Dropdown.Item className="text-danger" onClick={confirmRemoveAllNodes}>
            Remove All Nodes
          </Dropdown.Item>
        </DropdownButton>

        {/* View Menu */}
        <DropdownButton
          id="dropdown-view"
          title="View"
          variant={theme === "light" ? "secondary" : "dark"}
          size="sm"
          menuVariant={theme === "light" ? "light" : "dark"}
        >
          <Dropdown.Item onClick={() => onToggleView("minimap")}>
            <div className="d-flex align-items-center" style={{ minWidth: "150px" }}>
              <div style={{ width: "20px" }}>
                {viewOptions.minimap && <FaCheck size={12} />}
              </div>
              <span>Show Minimap</span>
            </div>
          </Dropdown.Item>
          <Dropdown.Item onClick={() => onToggleView("controls")}>
            <div className="d-flex align-items-center">
              <div style={{ width: "20px" }}>
                {viewOptions.controls && <FaCheck size={12} />}
              </div>
              <span>Show Controls</span>
            </div>
          </Dropdown.Item>
          <Dropdown.Item onClick={() => onToggleView("background")}>
            <div className="d-flex align-items-center">
              <div style={{ width: "20px" }}>
                {viewOptions.background && <FaCheck size={12} />}
              </div>
              <span>Show Background</span>
            </div>
          </Dropdown.Item>
        </DropdownButton>

        {/* Hidden file input for loading */}
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: "none" }}
          accept=".json"
          onChange={handleLoad}
        />

        {/* Hidden file input for importing nodes */}
        <input
          type="file"
          ref={nodeImportRef}
          style={{ display: "none" }}
          accept=".json"
          onChange={(e) => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (event) => {
              try {
                const nodesToImport = JSON.parse(event.target.result);
                onImportNodes(nodesToImport);
              } catch (err) {
                alert("Invalid JSON file");
              }
            };
            reader.readAsText(file);
            e.target.value = null; // reset to allow same file import
          }}
        />

        {/* Help Menu */}
        <DropdownButton
          id="dropdown-help"
          title="Help / Shortcuts"
          variant={theme === "light" ? "info" : "secondary"}
          size="sm"
          menuVariant={theme === "light" ? "light" : "dark"}

        >
          <Dropdown.Header>Keyboard Shortcuts</Dropdown.Header>
          <Dropdown.Item disabled>Ctrl + C → Copy Node</Dropdown.Item>
          <Dropdown.Item disabled>Ctrl + V → Paste Node</Dropdown.Item>
          <Dropdown.Item disabled>Delete → Delete Node/Edge</Dropdown.Item>
          <Dropdown.Item disabled>Ctrl + Z → Undo</Dropdown.Item>
          <Dropdown.Item disabled>Ctrl + Shift + Z → Redo</Dropdown.Item>
        </DropdownButton>
      </div>

      {/* Global App Modal */}
      <AppModal
        show={modal.show}
        title={modal.title}
        message={modal.message}
        type={modal.type}
        confirmText={modal.confirmText}
        cancelText={modal.cancelText}
        onConfirm={modal.onConfirm}
        onClose={() => setModal({ show: false })}
      />
    </>
  );
}
