import React, { useState, useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";

export default function NodeBuilderModal({ show, onClose, onSave, editingNode }) {
  const [label, setLabel] = useState("");
  const [fields, setFields] = useState([]);
  const [color, setColor] = useState("#ffffff"); // default white


  // Load node data into modal when editing
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
    setFields([...fields, { id: Date.now(), type, label: `${type} field`, options: [] }]);
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
      fields,
      color, // save color
    };
    onSave(newNode);
  };

  return (
    <Modal show={show} onHide={onClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>{editingNode ? "Edit Node" : "Create New Node"}</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {/* Node Label */}
        <Form.Group className="mb-3">
          <Form.Label>Node Label</Form.Label>
          <Form.Control
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
          />
        </Form.Group>

        {/* Node color */}
        <Form.Group className="mb-3">
          <Form.Label>Node Color</Form.Label>
          <Form.Control
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
          />
        </Form.Group>

        {/* Fields */}
        <h6>Fields</h6>
        {fields.map((field) => (
          <div key={field.id} className="border rounded p-2 mb-2 bg-light">
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
              />
            </Form.Group>

            {(field.type === "dropdown" || field.type === "radio") && (
              <Form.Group>
                <Form.Label>Options (comma separated)</Form.Label>
                <Form.Control
                  type="text"
                  value={field.options.join(",")}
                  onChange={(e) =>
                    updateField(field.id, "options", e.target.value.split(","))
                  }
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

      <Modal.Footer>
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
