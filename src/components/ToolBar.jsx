// src/components/Toolbar.jsx
import React, { useRef } from "react";
import { Button, Dropdown, DropdownButton } from "react-bootstrap";
import * as htmlToImage from "html-to-image";
import { useTheme } from "./ThemeContext";

export default function Toolbar({ nodes, edges, setNodes, setEdges }) {
  const fileInputRef = useRef();
  const { theme, themeColors } = useTheme();

  // --- File / Graph Handlers ---
  const handleSave = () => {
    const graph = { nodes, edges };
    const blob = new Blob([JSON.stringify(graph, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "graph.json";
    a.click();
    URL.revokeObjectURL(url);
  };

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
        alert("Invalid graph JSON");
      }
    };
    reader.readAsText(file);
  };

  const handleNew = () => {
    if (window.confirm("Are you sure you want to start a new graph? Unsaved changes will be lost.")) {
      setNodes([]);
      setEdges([]);
    }
  };

  const handleExportImage = () => {
    const el = document.querySelector(".react-flow");
    if (!el) return alert("ReactFlow container not found!");

    const width = el.scrollWidth;
    const height = el.scrollHeight;

    const clone = el.cloneNode(true);
    clone.style.transform = "scale(1)";
    clone.style.transformOrigin = "top left";
    clone.style.width = `${width}px`;
    clone.style.height = `${height}px`;
    clone.style.background = themeColors.background;

    document.body.appendChild(clone);

    htmlToImage
      .toPng(clone, { width, height, style: { background: themeColors.background } })
      .then((dataUrl) => {
        const a = document.createElement("a");
        a.href = dataUrl;
        a.download = "graph.png";
        a.click();
        document.body.removeChild(clone);
      })
      .catch((err) => {
        console.error("Failed to export image:", err);
        document.body.removeChild(clone);
      });
  };

  return (
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
        <Dropdown.Item onClick={handleNew}>New</Dropdown.Item>
        <Dropdown.Item onClick={handleSave}>Save</Dropdown.Item>
        <Dropdown.Item onClick={() => fileInputRef.current.click()}>Load</Dropdown.Item>
        <Dropdown.Item onClick={handleExportImage}>Export as Image</Dropdown.Item>
      </DropdownButton>

      {/* Hidden file input for loading */}
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: "none" }}
        accept=".json"
        onChange={handleLoad}
      />

      {/* Shortcuts / Help Menu */}
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
        <Dropdown.Divider />
        <Dropdown.Header>Other Functions</Dropdown.Header>
        <Dropdown.Item disabled>File → New / Save / Load / Export as Image</Dropdown.Item>
        <Dropdown.Item disabled>Click Node → Show Node Details</Dropdown.Item>
        <Dropdown.Item disabled>Click Edge → Select Edge</Dropdown.Item>
      </DropdownButton>
    </div>
  );
}
