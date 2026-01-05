import React, { useState } from "react";
import { useTheme } from "./ThemeContext";
import { FaTrash, FaPlus, FaArrowUp, FaArrowDown, FaWindowClose } from "react-icons/fa";

export default function DatabaseNodeDetailsPanel({
    node,
    updateNodeData,
    deleteNode,
    onClosePanel,
}) {
    const { themeColors } = useTheme();
    const [newColName, setNewColName] = useState("");
    const [newColType, setNewColType] = useState("varchar");

    if (!node) return null;

    const columns = node.data.columns || [];

    const handleAddColumn = () => {
        if (!newColName.trim()) return;
        const newCol = {
            id: `col-${Date.now()}`,
            name: newColName,
            type: newColType,
        };
        const newColumns = [...columns, newCol];
        updateNodeData(node.id, "columns", newColumns);
        setNewColName("");
    };

    const handleRemoveColumn = (colId) => {
        const newColumns = columns.filter((c) => c.id !== colId);
        updateNodeData(node.id, "columns", newColumns);
    };

    const handleUpdateColumn = (colId, key, value) => {
        const newColumns = columns.map((c) =>
            c.id === colId ? { ...c, [key]: value } : c
        );
        updateNodeData(node.id, "columns", newColumns);
    };

    const moveColumn = (index, direction) => {
        if (direction === "up" && index === 0) return;
        if (direction === "down" && index === columns.length - 1) return;

        const newColumns = [...columns];
        const targetIndex = direction === "up" ? index - 1 : index + 1;
        [newColumns[index], newColumns[targetIndex]] = [
            newColumns[targetIndex],
            newColumns[index],
        ];
        updateNodeData(node.id, "columns", newColumns);
    };

    return (
        <div
            className="d-flex flex-column border-start"
            style={{
                width: "300px",
                backgroundColor: themeColors.sidebarBg,
                color: themeColors.text,
                borderColor: themeColors.border,
                height: "100%",
            }}
        >
            {/* Header */}
            <div
                className="p-3 border-bottom d-flex justify-content-between align-items-center"
                style={{ borderColor: themeColors.border }}
            >
                <h5 className="mb-0">Table Schema</h5>
                <button
                    onClick={onClosePanel}
                    style={{
                        background: "transparent",
                        border: "none",
                        fontSize: "22px",
                        color: themeColors.text,
                        cursor: "pointer",
                    }}
                >
                    <FaWindowClose />
                </button>
            </div>

            {/* Body */}
            <div className="flex-grow-1 overflow-auto p-3">
                {/* Table Name */}
                <div className="mb-3">
                    <label className="form-label">Table Name</label>
                    <input
                        className="form-control"
                        value={node.data.label}
                        onChange={(e) => updateNodeData(node.id, "label", e.target.value)}
                        style={{
                            backgroundColor: themeColors.cardBg,
                            color: themeColors.text,
                            borderColor: themeColors.border,
                        }}
                    />
                </div>

                {/* Color */}
                <div className="mb-3">
                    <label className="form-label">Header Color</label>
                    <input
                        type="color"
                        className="form-control form-control-color"
                        value={node.data.color || "#ffffff"}
                        onChange={(e) => updateNodeData(node.id, "color", e.target.value)}
                        style={{ width: "100%" }}
                    />
                </div>

                <hr style={{ borderColor: themeColors.border }} />

                {/* Columns List */}
                <h6 className="mb-2">Columns</h6>
                <div className="d-flex flex-column gap-2 mb-3">
                    {columns.map((col, index) => (
                        <div
                            key={col.id}
                            className="p-2 border rounded"
                            style={{
                                backgroundColor: themeColors.cardBg,
                                borderColor: themeColors.border,
                            }}
                        >
                            <div className="d-flex gap-2 mb-2">
                                <input
                                    className="form-control form-control-sm"
                                    value={col.name}
                                    onChange={(e) => handleUpdateColumn(col.id, "name", e.target.value)}
                                    placeholder="Column Name"
                                    style={{
                                        backgroundColor: themeColors.background,
                                        color: themeColors.text,
                                        borderColor: themeColors.border,
                                    }}
                                />
                                <select
                                    className="form-select form-select-sm"
                                    value={col.type}
                                    onChange={(e) => handleUpdateColumn(col.id, "type", e.target.value)}
                                    style={{
                                        width: "100px",
                                        backgroundColor: themeColors.background,
                                        color: themeColors.text,
                                        borderColor: themeColors.border,
                                    }}
                                >
                                    <option value="undefined">undefined</option>
                                    <option value="int">int</option>
                                    <option value="float">float</option>
                                    <option value="varchar">varchar</option>
                                    <option value="boolean">boolean</option>
                                    <option value="string">string</option>
                                    <option value="array">array</option>
                                    <option value="dictionary">dictionary</option>
                                    <option value="date">date</option>
                                    <option value="datetime">datetime</option>

                                </select>
                            </div>

                            <div className="d-flex justify-content-between align-items-center">
                                <div className="d-flex gap-1">
                                    <button
                                        className="btn btn-sm btn-outline-secondary"
                                        onClick={() => moveColumn(index, "up")}
                                        disabled={index === 0}
                                    >
                                        <FaArrowUp />
                                    </button>
                                    <button
                                        className="btn btn-sm btn-outline-secondary"
                                        onClick={() => moveColumn(index, "down")}
                                        disabled={index === columns.length - 1}
                                    >
                                        <FaArrowDown />
                                    </button>
                                </div>
                                <button
                                    className="btn btn-sm btn-outline-danger"
                                    onClick={() => handleRemoveColumn(col.id)}
                                >
                                    <FaTrash />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Add Column */}
                <div className="p-2 border rounded" style={{ borderColor: themeColors.border, background: themeColors.background }}>
                    <h6 className="mb-2" style={{ fontSize: "0.9rem" }}>Add Column</h6>
                    <div className="d-flex gap-2 mb-2">
                        <input
                            className="form-control form-control-sm"
                            placeholder="Name"
                            value={newColName}
                            onChange={(e) => setNewColName(e.target.value)}
                            style={{
                                backgroundColor: themeColors.cardBg,
                                color: themeColors.text,
                                borderColor: themeColors.border,
                            }}
                        />
                        <select
                            className="form-select form-select-sm"
                            value={newColType}
                            onChange={(e) => setNewColType(e.target.value)}
                            style={{
                                width: "100px",
                                backgroundColor: themeColors.cardBg,
                                color: themeColors.text,
                                borderColor: themeColors.border,
                            }}
                        >
                            <option value="undefined">undefined</option>
                            <option value="int">int</option>
                            <option value="float">float</option>
                            <option value="varchar">varchar</option>
                            <option value="boolean">boolean</option>
                            <option value="string">string</option>
                            <option value="array">array</option>
                            <option value="dictionary">dictionary</option>
                            <option value="date">date</option>
                            <option value="datetime">datetime</option>
                        </select>
                    </div>
                    <button className="btn btn-sm btn-primary w-100" onClick={handleAddColumn}>
                        <FaPlus /> Add
                    </button>
                </div>
            </div>

            <div className="p-3 border-top">
                <button className="btn btn-danger w-100" onClick={() => deleteNode(node.id)}>
                    Delete Table
                </button>
            </div>
        </div>
    );
}
