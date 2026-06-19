import { escapeHtml } from "./html.js";

export function renderBookTitle(book) {
  const title = String(book?.title || "");
  const volume = String(book?.volumeCopy || "").trim();

  if (!title && !volume) {
    return "-";
  }

  if (!volume || titleAlreadyIncludesVolume(title, volume)) {
    return title ? escapeHtml(title) : "-";
  }

  return `${escapeHtml(title)} <em class="title-volume">Volume ${escapeHtml(volume)}</em>`;
}

function titleAlreadyIncludesVolume(title, volume) {
  const escapedVolume = escapeRegExp(volume);
  return new RegExp(`(?:^|\\s)Volume\\s+${escapedVolume}$`, "i").test(title.trim());
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
