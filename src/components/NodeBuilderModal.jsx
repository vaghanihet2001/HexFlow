// src/components/NodeBuilderModal.jsx
import React, { useState, useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { useTheme } from "./ThemeContext";

export default function NodeBuilderModal({ show, onClose, onSave, editingNode }) {
  const { themeColors } = useTheme();

  const [label, setLabel] = useState("");
  const [fields, setFields] = useState([]);
  const [color, setColor] = useState("#ffffff"); // default white

  useEffect(() => {
    if (editingNode) {
      setLabel(editingNode.label);
      setFields(editingNode.fields || []);
      setColor(editingNode.color || "#ffffff");
    } else {
      setLabel("");
      setFields([]);
      setColor("#ffffff");
    }
  }, [editingNode]);

  const addField = (type) => {
    setFields([
      ...fields,
      {
        id: Date.now(),
        type,
        label: `${type} field`,
        options: [],
        value: type === "checkbox" ? [] : "",
      },
    ]);
  };

  const updateField = (id, key, value) => {
    setFields(fields.map((f) => (f.id === id ? { ...f, [key]: value } : f)));
  };

  const deleteField = (id) => {
    setFields(fields.filter((f) => f.id !== id));
  };

  const handleSave = () => {
    const newNode = {
      id: editingNode?.id || `custom_${Date.now()}`,
      type: editingNode?.type || "customNode",
      label,
      custom: true,
      color,
      fields: fields.map((f) => ({
        ...f,
        value: f.type === "checkbox" ? f.value || [] : f.value || "",
      })),
    };
    onSave(newNode);
  };

  return (
    <Modal
      show={show}
      onHide={onClose}
      size="lg"
      style={{ color: themeColors.text }}
      contentClassName="bg-transparent border-0"
    >
      <Modal.Header
        closeButton
        style={{ backgroundColor: themeColors.cardBg, color: themeColors.text }}
      >
        <Modal.Title>{editingNode ? "Edit Node" : "Create New Node"}</Modal.Title>
      </Modal.Header>

      <Modal.Body style={{ backgroundColor: themeColors.cardBg, color: themeColors.text }}>
        {/* Node Label */}
        <Form.Group className="mb-3">
          <Form.Label>Node Label</Form.Label>
          <Form.Control
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            style={{ backgroundColor: themeColors.background, color: themeColors.text, borderColor: themeColors.border }}
          />
        </Form.Group>

        {/* Node Color */}
        <Form.Group className="mb-3">
          <Form.Label>Node Color</Form.Label>
          <Form.Control
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            style={{ backgroundColor: themeColors.background, borderColor: themeColors.border }}
          />
        </Form.Group>

        {/* Fields */}
        <h6>Fields</h6>
        {fields.map((field) => (
          <div
            key={field.id}
            className="border rounded p-2 mb-2"
            style={{ backgroundColor: themeColors.cardBg, color: themeColors.text, borderColor: themeColors.border }}
          >
            <div className="d-flex justify-content-between align-items-center mb-2">
              <strong>{field.type.toUpperCase()}</strong>
              <Button
                variant="outline-danger"
                size="sm"
                onClick={() => deleteField(field.id)}
              >
                ❌ Delete
              </Button>
            </div>

            <Form.Group className="mb-2">
              <Form.Label>Label</Form.Label>
              <Form.Control
                type="text"
                value={field.label}
                onChange={(e) => updateField(field.id, "label", e.target.value)}
                style={{ backgroundColor: themeColors.background, color: themeColors.text, borderColor: themeColors.border }}
              />
            </Form.Group>

            {(field.type === "dropdown" ||
              field.type === "radio" ||
              field.type === "checkbox") && (
              <Form.Group>
                <Form.Label>Options (comma separated)</Form.Label>
                <Form.Control
                  type="text"
                  value={field.options.join(",")}
                  onChange={(e) =>
                    updateField(field.id, "options", e.target.value.split(","))
                  }
                  style={{ backgroundColor: themeColors.background, color: themeColors.text, borderColor: themeColors.border }}
                />
              </Form.Group>
            )}
          </div>
        ))}

        {/* Add Field Buttons */}
        <div className="d-flex gap-2 mt-3">
          <Button onClick={() => addField("text")}>+ Text</Button>
          <Button onClick={() => addField("dropdown")}>+ Dropdown</Button>
          <Button onClick={() => addField("radio")}>+ Radio</Button>
          <Button onClick={() => addField("checkbox")}>+ Checkbox</Button>
        </div>
      </Modal.Body>

      <Modal.Footer style={{ backgroundColor: themeColors.cardBg }}>
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="success" onClick={handleSave}>
          Save Node
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
