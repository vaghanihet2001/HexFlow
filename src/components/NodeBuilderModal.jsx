// src/components/NodeBuilderModal.jsx
import React, { useState, useEffect, useRef } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { useTheme } from "./ThemeContext";
import { FaEye, FaEyeSlash } from "react-icons/fa";

export default function NodeBuilderModal({ show, onClose, onSave, editingNode }) {
  const { themeColors } = useTheme();

  const [label, setLabel] = useState("");
  const [fields, setFields] = useState([]);
  const [color, setColor] = useState("#ffffff");

  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const userChangedColor = useRef(false);

  // ------------------------------------------------
  // 🔵 HSL → HEX conversion helpers
  // ------------------------------------------------
  const hslToHex = (h, s, l) => {
    s /= 100;
    l /= 100;

    const k = (n) => (n + h / 30) % 12;
    const a = s * Math.min(l, 1 - l);

    const f = (n) =>
      Math.round(
        255 *
          (l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1))))
      )
        .toString(16)
        .padStart(2, "0");

    return `#${f(0)}${f(8)}${f(4)}`;
  };

  const hslStringToHex = (hsl) => {
    if (!hsl || !hsl.startsWith("hsl")) return hsl;
    const match = hsl.match(/hsl\((\d+),\s*(\d+)%?,\s*(\d+)%?\)/);
    if (!match) return "#ffffff";
    return hslToHex(Number(match[1]), Number(match[2]), Number(match[3]));
  };

  // ------------------------------------------------
  // 🎨 Auto Color Generation From Label
  // ------------------------------------------------
  const generateColorFromLabel = (text) => {
    if (!text.trim()) return "#ffffff";

    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      hash = text.charCodeAt(i) + ((hash << 5) - hash);
    }

    const hue = Math.abs(hash) % 360;
    return `hsl(${hue}, 75%, 70%)`;
  };

  // ------------------------------------------------
  // 📌 Load node for editing OR reset for creation
  // ------------------------------------------------
  useEffect(() => {
    if (editingNode) {
      setLabel(editingNode.label);
      setFields(editingNode.fields || []);
      setColor(hslStringToHex(editingNode.color || "#ffffff"));
      userChangedColor.current = true;
    } else {
      setLabel("");
      setFields([]);
      setColor("#ffffff");
      userChangedColor.current = false;
    }
    setErrorMsg("");
  }, [editingNode]);

  // ------------------------------------------------
  // 🎨 Auto-update color from label (only when creating)
  // ------------------------------------------------
  useEffect(() => {
    if (!userChangedColor.current && !editingNode) {
      const hsl = generateColorFromLabel(label);
      setColor(hslStringToHex(hsl));
    }
  }, [label]);

  // ------------------------------------------------
  // ➕ Field operations
  // ------------------------------------------------
  const addField = (type) => {
    setFields([
      ...fields,
      {
        id: Date.now(),
        type,
        label: `${type} field`,
        hide: false,
        options: [],
        value: type === "checkbox" ? [] : "",
      },
    ]);
  };

  const updateField = (id, key, value) =>
    setFields(fields.map((f) => (f.id === id ? { ...f, [key]: value } : f)));

  const deleteField = (id) => setFields(fields.filter((f) => f.id !== id));

  const toggleVisibility = (id) =>
    setFields(fields.map((f) => (f.id === id ? { ...f, hide: !f.hide } : f)));

  // ------------------------------------------------
  // 💾 Save Logic + Spinner + Error
  // ------------------------------------------------
  const handleSave = async () => {
    setSaving(true);
    setErrorMsg("");

    const newNode = {
      id: editingNode?.id || `custom_${Date.now()}`,
      type: editingNode?.type || "customNode",
      label,
      custom: true,
      color: hslStringToHex(color),
      fields: fields.map((f) => ({
        ...f,
        value: f.type === "checkbox" ? f.value || [] : f.value || "",
      })),
    };

    try {
      await onSave(newNode);
    } catch (err) {
      setErrorMsg(err.message || "Failed to save node.");
      setSaving(false);
      return;
    }

    setSaving(false);
  };

  // ------------------------------------------------
  // 🧩 UI
  // ------------------------------------------------
  return (
    <Modal
      show={show}
      onHide={saving ? null : onClose}
      size="lg"
      contentClassName="bg-transparent border-0"
      backdrop="static"
      keyboard={!saving}
      style={{ color: themeColors.text }}
    >
      <Modal.Header
        closeButton={!saving}
        style={{ backgroundColor: themeColors.cardBg, color: themeColors.text }}
      >
        {/* 🔴 RED CLOSE BUTTON OVERRIDE */}
          <style>
          {`
            .modal-header .btn-close {
              opacity: 1 !important;
              width: 28px !important;
              height: 28px !important;
              padding: 0 !important;

              background-size: 24px 24px !important;
              background-repeat: no-repeat !important;
              background-position: center !important;

              /* 🔥 bigger bold red X */
              background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' fill='red' viewBox='0 0 24 24'%3E%3Cpath d='M6.225 4.811L12 10.586l5.775-5.775a1.5 1.5 0 1 1 2.121 2.122L14.121 12.707l5.775 5.775a1.5 1.5 0 0 1-2.121 2.121L12 14.828l-5.775 5.775a1.5 1.5 0 1 1-2.121-2.121l5.775-5.775-5.775-5.774a1.5 1.5 0 0 1 2.121-2.122z'/%3E%3C/svg%3E");
            }

            /* Optional: hover glow */
            .modal-header .btn-close:hover {
              filter: drop-shadow(0 0 4px red);
            }
          `}
          </style>


        <Modal.Title>{editingNode ? "Edit Node" : "Create Node"}</Modal.Title>
      </Modal.Header>

      <Modal.Body style={{ backgroundColor: themeColors.cardBg }}>

        {/* Label */}
        <Form.Group className="mb-3">
          <Form.Label style={{ color: themeColors.text }}>Node Label</Form.Label>
          <Form.Control
            type="text"
            value={label}
            disabled={saving}
            onChange={(e) => setLabel(e.target.value)}
            style={{
              backgroundColor: themeColors.background,
              color: themeColors.text,
              borderColor: themeColors.border,
            }}
          />
        </Form.Group>

        {/* Color */}
        <Form.Group className="mb-3">
          <Form.Label style={{ color: themeColors.text }}>Node Color</Form.Label>
          <Form.Control
            type="color"
            value={color}
            disabled={saving}
            onChange={(e) => {
              setColor(e.target.value);
              userChangedColor.current = true;
            }}
            style={{
              backgroundColor: themeColors.background,
              borderColor: themeColors.border,
            }}
          />
        </Form.Group>

        <h6 style={{ color: themeColors.text }}>Fields</h6>

        {/* Fields List */}
        {fields.map((field) => (
          <div
            key={field.id}
            className="border rounded p-2 mb-2"
            style={{
              backgroundColor: themeColors.cardBg,
              borderColor: themeColors.border,
              color: themeColors.text,
              opacity: saving ? 0.7 : 1,
            }}
          >
            <div className="d-flex justify-content-between align-items-center mb-2">
              <strong>{field.type.toUpperCase()}</strong>

              <div className="d-flex gap-2">
                <Button
                  variant="outline-secondary"
                  size="sm"
                  disabled={saving}
                  onClick={() => toggleVisibility(field.id)}
                >
                  {field.hide ? <FaEyeSlash /> : <FaEye />}
                </Button>

                <Button
                  variant="outline-danger"
                  size="sm"
                  disabled={saving}
                  onClick={() => deleteField(field.id)}
                >
                  ❌ Delete
                </Button>
              </div>
            </div>

            {/* Field Label */}
            <Form.Group className="mb-2">
              <Form.Label style={{ color: themeColors.text }}>Label</Form.Label>
              <Form.Control
                type="text"
                value={field.label}
                disabled={saving}
                onChange={(e) =>
                  updateField(field.id, "label", e.target.value)
                }
                style={{
                  backgroundColor: themeColors.background,
                  color: themeColors.text,
                  borderColor: themeColors.border,
                }}
              />
            </Form.Group>

            {/* Field Options */}
            {(field.type === "dropdown" ||
              field.type === "radio" ||
              field.type === "checkbox") && (
              <Form.Group>
                <Form.Label style={{ color: themeColors.text }}>
                  Options (comma separated)
                </Form.Label>
                <Form.Control
                  type="text"
                  disabled={saving}
                  value={field.options.join(",")}
                  onChange={(e) =>
                    updateField(field.id, "options", e.target.value.split(","))
                  }
                  style={{
                    backgroundColor: themeColors.background,
                    color: themeColors.text,
                    borderColor: themeColors.border,
                  }}
                />
              </Form.Group>
            )}
          </div>
        ))}

        {/* Add Field Buttons */}
        <div className="d-flex gap-2 mt-3">
          <Button disabled={saving} onClick={() => addField("text")}>
            + Text
          </Button>
          <Button disabled={saving} onClick={() => addField("dropdown")}>
            + Dropdown
          </Button>
          <Button disabled={saving} onClick={() => addField("radio")}>
            + Radio
          </Button>
          <Button disabled={saving} onClick={() => addField("checkbox")}>
            + Checkbox
          </Button>
        </div>
      </Modal.Body>

      <Modal.Footer style={{ backgroundColor: themeColors.cardBg }}>
        {errorMsg && (
          <div
            style={{
              color: themeColors.error || "red",
              fontWeight: "bold",
              marginRight: "auto",
            }}
          >
            {errorMsg}
          </div>
        )}

        <Button variant="secondary" disabled={saving} onClick={onClose}>
          Cancel
        </Button>

        <Button
          variant="success"
          disabled={saving || !label.trim()}
          onClick={handleSave}
        >
          {saving ? (
            <>
              <span className="spinner-border spinner-border-sm me-2"></span>
              Saving...
            </>
          ) : (
            "Save Node"
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
