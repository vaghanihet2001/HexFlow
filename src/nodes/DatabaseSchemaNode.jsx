import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';

const DatabaseSchemaNode = ({ id, data, selected, updateNodeData }) => {
    const stopPropagation = (e) => e.stopPropagation();

    const handleUpdateColumn = (colId, key, value) => {
        const newColumns = data.columns.map((c) =>
            c.id === colId ? { ...c, [key]: value } : c
        );
        updateNodeData(id, "columns", newColumns);
    };

    return (
        <div
            style={{
                background: data.color || '#fff',
                border: '1px solid #777',
                borderRadius: '8px',
                minWidth: '200px',
                fontSize: '12px',
                boxShadow: selected ? '0 0 0 2px #555' : 'none',
            }}
        >

            {/* Table Header */}
            <div
                style={{
                    padding: '8px',
                    borderBottom: '1px solid #777',
                    fontWeight: 'bold',
                    textAlign: 'center',
                    background: 'rgba(0,0,0,0.05)',
                    borderTopLeftRadius: '8px',
                    borderTopRightRadius: '8px',
                }}
            >
                <input
                    type="text"
                    className="nodrag"
                    value={data.label || ""}
                    onChange={(e) => updateNodeData(id, "label", e.target.value)}
                    style={{
                        fontWeight: "bold",
                        width: "100%",
                        background: "transparent",
                        border: "none",
                        outline: "none",
                        textAlign: "center",
                        fontSize: "12px",
                        padding: "0",
                    }}
                />
            </div>

            {/* Columns */}
            <div style={{ padding: '8px 0' }}>
                {data.columns && data.columns.map((col, index) => (
                    <div
                        key={col.id || index}
                        style={{
                            position: 'relative',
                            padding: '4px 8px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            gap: '4px'
                        }}
                    >
                        {/* Left Handle (Target) */}
                        <Handle
                            type="target"
                            position={Position.Left}
                            id={`${col.id}-target`}
                            style={{ left: '-4px', top: '50%', transform: 'translateY(-50%)' }}
                        />

                        <input
                            className="form-control form-control-sm shadow-none nodrag"
                            value={col.name}
                            onChange={(e) => handleUpdateColumn(col.id, "name", e.target.value)}
                            style={{
                                fontSize: '10px',
                                padding: '1px 4px',
                                height: '20px',
                                flexGrow: 1
                            }}
                        />

                        <select
                            className="form-select form-select-sm shadow-none nodrag"
                            value={col.type}
                            onChange={(e) => handleUpdateColumn(col.id, "type", e.target.value)}
                            style={{
                                fontSize: '10px',
                                padding: '1px 4px',
                                height: '20px',
                                width: '70px',
                                flexShrink: 0
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

                        {/* Right Handle (Source) */}
                        <Handle
                            type="source"
                            position={Position.Right}
                            id={`${col.id}-source`}
                            style={{ right: '-4px', top: '50%', transform: 'translateY(-50%)' }}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default memo(DatabaseSchemaNode);
