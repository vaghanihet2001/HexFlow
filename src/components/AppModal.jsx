import React from "react";
import { Modal, Button, Spinner } from "react-bootstrap";
import { useTheme } from "./ThemeContext";

export default function AppModal({
  show,
  onClose,
  title = "",
  message = "",
  type = "info",          // "info" | "success" | "error" | "confirm"
  confirmText = "OK",
  cancelText = "Cancel",
  onConfirm,
  loading = false,        // show spinner in confirm button
  autoClose = false,      // auto-close after confirm
}) {
  const { themeColors } = useTheme();

  // color mapping
  const typeColors = {
    info: themeColors.accent,
    success: "#28a745",
    error: "#ff4d4d",
    confirm: themeColors.primary,
  };

  const headerColor = typeColors[type] || themeColors.accent;

  const handleConfirm = async () => {
      if (!onConfirm) return onClose();

      const result = await onConfirm();

      if (autoClose && result !== false) {
        onClose();
      }
  };

  return (
    <Modal
      show={show}
      onHide={onClose}
      centered
      backdrop="static"      // prevent accidental close
      keyboard={true}
    >
      <Modal.Header
        closeButton
        style={{
          backgroundColor: themeColors.cardBg,
          borderBottom: `2px solid ${headerColor}`,
        }}
      >
        <Modal.Title style={{ color: headerColor }}>
          {title}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body
        style={{
          backgroundColor: themeColors.cardBg,
          color: themeColors.text,
        }}
      >
        {message}
      </Modal.Body>

      <Modal.Footer
        style={{
          backgroundColor: themeColors.cardBg,
          borderTop: `1px solid ${themeColors.border}`,
        }}
      >

        {type === "confirm" && (
          <Button variant="secondary" onClick={onClose}>
            {cancelText}
          </Button>
        )}

        <Button
          variant="primary"
          onClick={handleConfirm}
          disabled={loading}
          style={{ backgroundColor: headerColor, borderColor: headerColor }}
        >
          {loading ? (
            <Spinner animation="border" size="sm" />
          ) : (
            confirmText
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
