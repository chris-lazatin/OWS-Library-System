import { openModal } from "./modal.js";
import { escapeHtml } from "../utils/html.js";

export function openConfirmationModal({
  title = "Confirm Action",
  heading,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  tone = "danger",
  onConfirm
}) {
  const modal = openModal({
    title,
    size: "small",
    content: `
      <div class="success-message confirmation-message confirmation-${escapeHtml(tone)}">
        <div class="success-mark" aria-hidden="true">!</div>
        <p>${escapeHtml(heading)}</p>
        <span>${escapeHtml(message)}</span>
        <div class="modal-actions confirmation-actions">
          <button class="secondary-button" type="button" data-modal-close>${escapeHtml(cancelLabel)}</button>
          <button class="primary-button modal-submit" type="button" data-confirm-action>${escapeHtml(confirmLabel)}</button>
        </div>
      </div>
    `
  });

  modal.root.querySelector("[data-confirm-action]").addEventListener("click", async (event) => {
    const button = event.currentTarget;
    button.disabled = true;

    try {
      if (onConfirm) {
        await onConfirm();
      }
      modal.close();
    } catch (error) {
      button.disabled = false;
      throw error;
    }
  });

  return modal;
}
