import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';

const DatabaseSchemaNode = ({ id, data, selected }) => {
    return (
        <div
            style={{
                background: data.color || '#fff',
                border: '1px solid #777',
                borderRadius: '8px',
                minWidth: '150px',
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
                {data.label}
            </div>

            {/* Columns */}
            <div style={{ padding: '8px 0' }}>
                {data.columns && data.columns.map((col, index) => (
                    <div
                        key={col.id || index}
                        style={{
                            position: 'relative',
                            padding: '4px 16px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                        }}
                    >
                        {/* Left Handle (Target) */}
                        <Handle
                            type="target"
                            position={Position.Left}
                            id={`${col.id}-target`}
                            style={{ left: '-4px', top: '50%', transform: 'translateY(-50%)' }}
                        />

                        <span style={{ marginRight: '8px' }}>{col.name}</span>
                        <span style={{ color: '#666', fontSize: '10px' }}>{col.type}</span>

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
