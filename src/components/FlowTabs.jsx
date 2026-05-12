import React, { useState } from "react";
import { FaTimes, FaPlus, FaLayerGroup, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { useTheme } from "./ThemeContext";

export default function FlowTabs({
  flows,
  activeFlowId,
  onSwitch,
  onAdd,
  onRename,
  onDuplicate,
  onRemove,
  onReorder,
  onDeleteAll,
}) {
  const { themeColors } = useTheme();
  const [editingTabId, setEditingTabId] = useState(null);
  const [editingName, setEditingName] = useState("");
  const [contextMenu, setContextMenu] = useState(null);
  const [listMenu, setListMenu] = useState(null); // { x, y }
  const [draggedTabId, setDraggedTabId] = useState(null);
  const scrollRef = React.useRef(null);

  const scrollTabs = (offset) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: offset, behavior: "smooth" });
    }
  };

  const handleDragStart = (e, id) => {
    setDraggedTabId(id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e, targetId) => {
    e.preventDefault();
    if (draggedTabId && draggedTabId !== targetId && onReorder) {
      onReorder(draggedTabId, targetId);
    }
    setDraggedTabId(null);
  };

  React.useEffect(() => {
    const handleClickOutside = () => {
      setContextMenu(null);
      setListMenu(null);
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const handleDoubleClick = (e, flow) => {
    e.stopPropagation();
    setEditingTabId(flow.id);
    setEditingName(flow.name);
  };

  const handleRenameSubmit = (id) => {
    if (editingName.trim()) {
      onRename(id, editingName.trim());
    }
    setEditingTabId(null);
    setEditingName("");
  };

  const handleKeyDown = (e, id) => {
    if (e.key === "Enter") {
      handleRenameSubmit(id);
    } else if (e.key === "Escape") {
      setEditingTabId(null);
      setEditingName("");
    }
  };

  const handleContextMenu = (e, flow) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      flowId: flow.id,
      flowName: flow.name,
    });
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-end", // Align to bottom
        backgroundColor: themeColors.sidebarBg,
        borderTop: `1px solid ${themeColors.border}`,
        overflow: "hidden", // Parent handles no overflow, child does
        padding: "0",
        minHeight: "30px",
        flexShrink: 0,
      }}
    >
      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
      <div
        onClick={onAdd}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "30px",
          height: "30px",
          cursor: "pointer",
          flexShrink: 0,
          color: themeColors.text,
          backgroundColor: "transparent",
          borderRight: `1px solid ${themeColors.border}`,
          transition: "background-color 0.2s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = themeColors.border)}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
        title="New Flow"
      >
        <FaPlus size={12} />
      </div>
      
      <div
        onClick={(e) => {
          e.stopPropagation();
          setListMenu({ x: e.clientX, y: e.clientY });
        }}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "30px",
          height: "30px",
          cursor: "pointer",
          flexShrink: 0,
          color: themeColors.text,
          backgroundColor: "transparent",
          borderRight: `1px solid ${themeColors.border}`,
          transition: "background-color 0.2s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = themeColors.border)}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
        title="Flow List"
      >
        <FaLayerGroup size={12} />
      </div>

      <div
        className="hide-scrollbar"
        ref={scrollRef}
        style={{
          display: "flex",
          alignItems: "flex-end",
          flexGrow: 1,
          minWidth: 0,
          overflowX: "auto",
          scrollBehavior: "smooth",
        }}
      >
        {flows.map((flow) => {
        const isActive = flow.id === activeFlowId;
        return (
          <div
            key={flow.id}
            draggable
            onDragStart={(e) => handleDragStart(e, flow.id)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, flow.id)}
            onClick={() => onSwitch(flow.id)}
            style={{
              display: "flex",
              alignItems: "center",
              flexShrink: 0,
              height: "30px",
              padding: "0 14px",
              backgroundColor: isActive ? themeColors.background : "transparent",
              color: isActive ? themeColors.primary : themeColors.textMuted || "#888",
              borderTopLeftRadius: "6px",
              borderTopRightRadius: "6px",
              borderRight: `1px solid ${themeColors.border}`,
              borderTop: isActive ? `3px solid ${themeColors.primary}` : `1px solid ${themeColors.border}`,
              borderLeft: isActive ? `1px solid ${themeColors.border}` : "1px solid transparent",
              cursor: "pointer",
              transition: "background-color 0.2s, color 0.2s",
              position: "relative",
              top: isActive ? "-1px" : "0", 
              zIndex: isActive ? 10 : 1,
              opacity: draggedTabId === flow.id ? 0.5 : 1,
            }}
            title="Double-click to rename"
            onDoubleClick={(e) => handleDoubleClick(e, flow)}
            onContextMenu={(e) => handleContextMenu(e, flow)}
          >
            {editingTabId === flow.id ? (
              <input
                autoFocus
                value={editingName}
                onChange={(e) => setEditingName(e.target.value)}
                onBlur={() => handleRenameSubmit(flow.id)}
                onKeyDown={(e) => handleKeyDown(e, flow.id)}
                style={{
                  background: themeColors.background,
                  color: themeColors.text,
                  border: `1px solid ${themeColors.border}`,
                  borderRadius: "3px",
                  padding: "0 4px",
                  fontSize: "14px",
                  width: "100px",
                  outline: "none",
                }}
                onClick={(e) => e.stopPropagation()} // Prevent switching when clicking input
              />
            ) : (
              <span
                style={{
                  fontSize: "13px",
                  fontWeight: isActive ? "700" : "500",
                  whiteSpace: "nowrap",
                  userSelect: "none",
                  marginRight: flows.length > 1 ? "6px" : "0",
                }}
              >
                {flow.name}
              </span>
            )}
            {flows.length > 1 && (
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(flow.id);
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "4px",
                  borderRadius: "50%",
                  cursor: "pointer",
                  color: themeColors.textMuted || "#888",
                  marginLeft: "4px",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#ff4d4f")}
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = themeColors.textMuted || "#888")
                }
                title="Close Flow"
              >
                <FaTimes size={10} />
              </div>
            )}
          </div>
        );
      })}
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          flexShrink: 0,
        }}
      >
        <div
          onClick={() => scrollTabs(-150)}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "30px",
            height: "30px",
            cursor: "pointer",
            color: themeColors.text,
            backgroundColor: "transparent",
            borderLeft: `1px solid ${themeColors.border}`,
            transition: "background-color 0.2s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = themeColors.border)}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
          title="Scroll Left"
        >
          <FaChevronLeft size={10} />
        </div>
        <div
          onClick={() => scrollTabs(150)}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "30px",
            height: "30px",
            cursor: "pointer",
            color: themeColors.text,
            backgroundColor: "transparent",
            borderLeft: `1px solid ${themeColors.border}`,
            transition: "background-color 0.2s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = themeColors.border)}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
          title="Scroll Right"
        >
          <FaChevronRight size={10} />
        </div>
      </div>

      {contextMenu && (
        <div
          style={{
            position: "fixed",
            bottom: window.innerHeight - contextMenu.y,
            left: contextMenu.x,
            backgroundColor: themeColors.cardBg || themeColors.sidebarBg,
            border: `1px solid ${themeColors.border}`,
            borderRadius: "6px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            zIndex: 9999,
            padding: "4px 0",
            minWidth: "120px",
            color: themeColors.text,
            fontSize: "14px",
          }}
          onClick={(e) => e.stopPropagation()} // Keep open if clicking inside (though handlers close it)
        >
          <div
            style={{ padding: "6px 12px", cursor: "pointer" }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = themeColors.border)}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
            onClick={() => {
              setEditingTabId(contextMenu.flowId);
              setEditingName(contextMenu.flowName);
              setContextMenu(null);
            }}
          >
            Rename
          </div>
          <div
            style={{ padding: "6px 12px", cursor: "pointer" }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = themeColors.border)}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
            onClick={() => {
              if (onDuplicate) onDuplicate(contextMenu.flowId);
              setContextMenu(null);
            }}
          >
            Duplicate
          </div>
          <div
            style={{ padding: "6px 12px", cursor: "pointer", color: "#ff4d4f" }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = themeColors.border)}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
            onClick={() => {
              onRemove(contextMenu.flowId);
              setContextMenu(null);
            }}
          >
            Delete
          </div>
        </div>
      )}

      {listMenu && (
        <div
          style={{
            position: "fixed",
            bottom: window.innerHeight - listMenu.y + 10,
            left: listMenu.x,
            backgroundColor: themeColors.cardBg || themeColors.sidebarBg,
            border: `1px solid ${themeColors.border}`,
            borderRadius: "6px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            zIndex: 9999,
            padding: "4px 0",
            minWidth: "160px",
            maxHeight: "300px",
            overflowY: "auto",
            color: themeColors.text,
            fontSize: "14px",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {flows.map(f => (
            <div
              key={f.id}
              style={{
                padding: "6px 12px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                backgroundColor: f.id === activeFlowId ? themeColors.border : "transparent"
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = themeColors.border)}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = f.id === activeFlowId ? themeColors.border : "transparent")}
              onClick={() => {
                onSwitch(f.id);
                setListMenu(null);
              }}
            >
              <span style={{ 
                width: "8px", 
                height: "8px", 
                borderRadius: "50%", 
                backgroundColor: f.id === activeFlowId ? themeColors.primary : "transparent",
                marginRight: "8px",
                display: "inline-block"
              }}></span>
              {f.name}
            </div>
          ))}
          <div style={{ height: "1px", backgroundColor: themeColors.border, margin: "4px 0" }}></div>
          <div
            style={{ padding: "6px 12px", cursor: "pointer", color: "#ff4d4f", fontWeight: "bold" }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = themeColors.border)}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
            onClick={() => {
              if (onDeleteAll) onDeleteAll();
              setListMenu(null);
            }}
          >
            Delete All Flows
          </div>
        </div>
      )}
    </div>
  );
}
