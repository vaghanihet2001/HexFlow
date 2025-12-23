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
    if (!hsl?.startsWith("hsl")) return hsl;
    const m = hsl.match(/hsl\((\d+),\s*(\d+)%?,\s*(\d+)%?\)/);
    if (!m) return "#ffffff";
    return hslToHex(+m[1], +m[2], +m[3]);
  };

  const generateColorFromLabel = (text) => {
    if (!text.trim()) return "#ffffff";
    let hash = 0;
    for (let i = 0; i < text.length; i++)
      hash = text.charCodeAt(i) + ((hash << 5) - hash);
    const hue = Math.abs(hash) % 360;
    return `hsl(${hue}, 75%, 70%)`;
  };

  useEffect(() => {
    if (editingNode) {
      setLabel(editingNode.label);
      setFields(editingNode.fields || []);
      setColor(hslStringToHex(editingNode.color));
      userChangedColor.current = true;
    } else {
      setLabel("");
      setFields([]);
      setColor("#ffffff");
      userChangedColor.current = false;
    }
    setErrorMsg("");
  }, [editingNode]);

  useEffect(() => {
    if (!userChangedColor.current && !editingNode) {
      setColor(hslStringToHex(generateColorFromLabel(label)));
    }
  }, [label]);

  const addField = (type) => {
    const base = {
      id: Date.now() + Math.random(),
      type,
      label: `${type} field`,
      hide: false,
      value: "",
      options: [],
    };

    if (type === "number") {
      base.min = 0;
      base.max = 100;
      base.stepType = "int";
      base.step = 1;
      base.value = 0;
    }

    if (type === "date" || type === "datetime") {
      base.value = "";
    }

    setFields([...fields, base]);
  };

  const updateField = (id, key, value) =>
    setFields(fields.map((f) => (f.id === id ? { ...f, [key]: value } : f)));

  const deleteField = (id) =>
    setFields(fields.filter((f) => f.id !== id));

  const toggleVisibility = (id) =>
    setFields(fields.map((f) => (f.id === id ? { ...f, hide: !f.hide } : f)));

  const handleSave = async () => {
    setSaving(true);
    setErrorMsg("");

    const cleanedFields = fields.map((field) => {
      if (
        ["dropdown", "radio", "checkbox"].includes(field.type) &&
        Array.isArray(field.options)
      ) {
        return {
          ...field,
          options: field.options.map((o) => o.trim()).filter((o) => o),
        };
      }
      return field;
    });

    const newNode = {
      id: editingNode?.id || `custom_${Date.now()}`,
      type: editingNode?.type || "customNode",
      label,
      custom: true,
      color,
      fields: cleanedFields,
    };

    try {
      await onSave(newNode);
    } catch (err) {
      setErrorMsg(err.message);
      setSaving(false);
      return;
    }

    setSaving(false);
  };

  return (
    <Modal
      show={show}
      onHide={saving ? null : onClose}
      size="lg"
      backdrop="static"
      keyboard={!saving}
      contentClassName="bg-transparent border-0"
    >
      {/* HEADER */}
      <Modal.Header
        closeButton={!saving}
        style={{ background: themeColors.cardBg, color: themeColors.text }}
      >
        <Modal.Title>{editingNode ? "Edit Node" : "Create Node"}</Modal.Title>

        <style>
          {`
            .modal-header .btn-close {
              opacity: 1 !important;
              width: 26px !important;
              height: 26px !important;
              background-size: 22px 22px !important;
              background-position: center;
              background-repeat: no-repeat;
              background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='red' viewBox='0 0 24 24'%3E%3Cpath d='M18.3 5.71a1 1 0 0 0-1.41 0L12 10.59 7.11 5.7A1 1 0 0 0 5.7 7.11L10.59 12l-4.9 4.89a1 1 0 1 0 1.41 1.42L12 13.41l4.89 4.9a1 1 0 0 0 1.42-1.41L13.41 12l4.9-4.89a1 1 0 0 0-.01-1.4z'/%3E%3C/svg%3E");
            }
          `}
        </style>
      </Modal.Header>

      {/* BODY WITH BOOTSTRAP OVERRIDES */}
      <Modal.Body
        style={{
          background: themeColors.cardBg,
          color: themeColors.text,

          "--bs-body-bg": themeColors.cardBg,
          "--bs-body-color": themeColors.text,
          "--bs-border-color": themeColors.border,

          "--bs-form-control-bg": themeColors.background,
          "--bs-form-control-color": themeColors.text,
          "--bs-form-control-border-color": themeColors.border,

          "--bs-form-select-bg": themeColors.background,
          "--bs-form-select-color": themeColors.text,
          "--bs-form-select-border-color": themeColors.border,

          // Dropdown arrow SVG
          "--select-arrow": `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='${themeColors.text
            }' viewBox='0 0 16 16'%3E%3Cpath d='M3 6l5 5 5-5z'/%3E%3C/svg%3E")`,

          // Date icon fix
          "--dp-color-scheme": themeColors.isDark ? "dark" : "light",
          "--dp-icon-filter": themeColors.isDark ? "invert(1)" : "invert(0)",
        }}
      >
        <Form.Group className="mb-3">
          <Form.Label>Node Label</Form.Label>
          <Form.Control
            value={label}
            disabled={saving}
            onChange={(e) => setLabel(e.target.value)}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Node Color</Form.Label>
          <Form.Control
            type="color"
            value={color}
            disabled={saving}
            onChange={(e) => {
              setColor(e.target.value);
              userChangedColor.current = true;
            }}
          />
        </Form.Group>

        <h5>Fields</h5>

        {fields.map((field) => (
          <div key={field.id} className="border p-2 mb-2 rounded">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <strong>{field.type.toUpperCase()}</strong>

              <div className="d-flex gap-2">
                <Button
                  size="sm"
                  variant="outline-secondary"
                  onClick={() => toggleVisibility(field.id)}
                >
                  {field.hide ? <FaEyeSlash /> : <FaEye />}
                </Button>
                <Button
                  size="sm"
                  variant="outline-danger"
                  onClick={() => deleteField(field.id)}
                >
                  Delete
                </Button>
              </div>
            </div>

            <Form.Group className="mb-2">
              <Form.Label>Label</Form.Label>
              <Form.Control
                value={field.label}
                onChange={(e) =>
                  updateField(field.id, "label", e.target.value)
                }
              />
            </Form.Group>

            {["dropdown", "radio", "checkbox"].includes(field.type) && (
              <Form.Group className="mb-2">
                <Form.Label>Options (comma separated)</Form.Label>
                <Form.Control
                  value={field.options.join(",")}
                  onChange={(e) =>
                    updateField(field.id, "options", e.target.value.split(","))
                  }
                />
              </Form.Group>
            )}

            {field.type === "number" && (
              <>
                <Form.Group className="mb-2">
                  <Form.Label>Number Type</Form.Label>
                  <Form.Select
                    value={field.stepType}
                    onChange={(e) => {
                      const t = e.target.value;
                      updateField(field.id, "stepType", t);
                      updateField(field.id, "step", t === "int" ? 1 : 0.1);
                    }}
                  >
                    <option value="int">Integer</option>
                    <option value="float">Float</option>
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-2">
                  <Form.Label>Min</Form.Label>
                  <Form.Control
                    type="number"
                    step={field.step}
                    value={field.min}
                    onChange={(e) =>
                      updateField(field.id, "min", Number(e.target.value))
                    }
                  />
                </Form.Group>

                <Form.Group className="mb-2">
                  <Form.Label>Max</Form.Label>
                  <Form.Control
                    type="number"
                    step={field.step}
                    value={field.max}
                    onChange={(e) =>
                      updateField(field.id, "max", Number(e.target.value))
                    }
                  />
                </Form.Group>

                <Form.Group className="mb-2">
                  <Form.Label>Default Value</Form.Label>
                  <Form.Control
                    type="number"
                    step={field.step}
                    value={field.value}
                    onChange={(e) =>
                      updateField(field.id, "value", Number(e.target.value))
                    }
                  />
                </Form.Group>
              </>
            )}

            {field.type === "date" && (
              <Form.Group className="mb-2">
                <Form.Label>Default Date</Form.Label>
                <Form.Control
                  type="date"
                  value={field.value}
                  onChange={(e) =>
                    updateField(field.id, "value", e.target.value)
                  }
                />
              </Form.Group>
            )}

            {field.type === "datetime" && (
              <Form.Group className="mb-2">
                <Form.Label>Default Date & Time</Form.Label>
                <Form.Control
                  type="datetime-local"
                  value={field.value}
                  onChange={(e) =>
                    updateField(field.id, "value", e.target.value)
                  }
                />
              </Form.Group>
            )}
          </div>
        ))}

        <div className="d-flex gap-2 mt-3 flex-wrap">
          <Button onClick={() => addField("text")}>+ Text</Button>
          <Button onClick={() => addField("dropdown")}>+ Dropdown</Button>
          <Button onClick={() => addField("radio")}>+ Radio</Button>
          <Button onClick={() => addField("checkbox")}>+ Checkbox</Button>
          <Button onClick={() => addField("number")}>+ Number</Button>
          <Button onClick={() => addField("date")}>+ Date</Button>
          <Button onClick={() => addField("datetime")}>+ DateTime</Button>
        </div>
      </Modal.Body>

      <Modal.Footer style={{ background: themeColors.cardBg }}>
        {errorMsg && (
          <div style={{ color: themeColors.error || "red", marginRight: "auto" }}>
            {errorMsg}
          </div>
        )}

        <Button onClick={onClose} disabled={saving}>Cancel</Button>
        <Button onClick={handleSave} disabled={saving || !label.trim()}>
          {saving ? "Saving..." : "Save Node"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
