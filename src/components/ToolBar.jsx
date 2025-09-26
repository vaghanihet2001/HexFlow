import React, { useRef } from "react";
import { Button, Dropdown, DropdownButton } from "react-bootstrap";
import * as htmlToImage from "html-to-image";

export default function Toolbar({ nodes, edges, setNodes, setEdges }) {
  const fileInputRef = useRef();

  // Save current graph as JSON
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

  // Load graph from JSON file
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

  // Clear current graph
  const handleNew = () => {
    if (window.confirm("Are you sure you want to start a new graph? Unsaved changes will be lost.")) {
      setNodes([]);
      setEdges([]);
    }
  };

  // Export full graph as image
  const handleExportImage = () => {
    const el = document.querySelector(".react-flow");
    if (!el) return alert("ReactFlow container not found!");

    const width = el.scrollWidth;
    const height = el.scrollHeight;

    // Clone element to avoid modifying UI
    const clone = el.cloneNode(true);
    clone.style.transform = "scale(1)";
    clone.style.transformOrigin = "top left";
    clone.style.width = `${width}px`;
    clone.style.height = `${height}px`;
    clone.style.background = "white";

    document.body.appendChild(clone);

    htmlToImage.toPng(clone, { width, height, style: { background: "white" } })
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
    <div className="d-flex align-items-center gap-2 p-2 border-bottom bg-light">
      <DropdownButton id="dropdown-file" title="File" variant="secondary" size="sm">
        <Dropdown.Item onClick={handleNew}>New</Dropdown.Item>
        <Dropdown.Item onClick={handleSave}>Save</Dropdown.Item>
        <Dropdown.Item onClick={() => fileInputRef.current.click()}>Load</Dropdown.Item>
      </DropdownButton>

      {/* Hidden file input for loading */}
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: "none" }}
        accept=".json"
        onChange={handleLoad}
      />

      <Button size="sm" variant="secondary" onClick={handleNew}>New</Button>
      <Button size="sm" variant="secondary" onClick={handleSave}>Save</Button>
      <Button size="sm" variant="secondary" onClick={() => fileInputRef.current.click()}>Load</Button>
      <Button size="sm" variant="secondary" onClick={handleExportImage}>Export as Image</Button>
    </div>
  );
}
