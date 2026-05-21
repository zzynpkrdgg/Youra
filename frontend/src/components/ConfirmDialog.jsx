import './ConfirmDialog.css';

/**
 * Brutalist themed inline confirm dialog.
 * Renders inside the card — no overlay/blur.
 */
export default function ConfirmDialog({ message, onConfirm, onCancel }) {
  return (
    <div className="confirm-dialog">
      <p className="confirm-dialog-msg">{message}</p>
      <div className="confirm-dialog-actions">
        <button className="confirm-dialog-btn confirm-dialog-btn--cancel" onClick={onCancel}>
          HAYIR
        </button>
        <button className="confirm-dialog-btn confirm-dialog-btn--confirm" onClick={onConfirm}>
          EVET, SİL
        </button>
      </div>
    </div>
  );
}
