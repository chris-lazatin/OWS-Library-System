import { escapeHtml } from "./html.js";

export function renderBookField(label, name, type = "text", required = false, value = "", idPrefix = "", options = {}) {
  const id = `${idPrefix}${name}`;
  const minAttribute = name === "publicationDate" ? 'min="0" max="9999" oninput="if(this.value.length>4)this.value=this.value.slice(0,4)"' : name === "onShelf" ? 'min="0"' : "";
  const valueAttribute = value === undefined || value === null ? "" : `value="${escapeHtml(value)}"`;
  const placeholderAttribute = options.placeholder ? `placeholder="${escapeHtml(options.placeholder)}"` : "";

  return `
    <div class="field-group">
      <label for="${escapeHtml(id)}">${escapeHtml(label)}</label>
      <input id="${escapeHtml(id)}" name="${escapeHtml(name)}" type="${escapeHtml(type)}" ${valueAttribute} ${required ? "required" : ""} ${minAttribute} ${placeholderAttribute}>
      <span class="field-error" aria-live="polite"></span>
    </div>
  `;
}

export function renderBookChoice(name, value, checked, className, idPrefix = "") {
  const id = `${idPrefix}${name}-${slugify(value)}`;

  return `
    <label class="${escapeHtml(className)} choice-color-${slugify(value)}">
      <input type="radio" name="${escapeHtml(name)}" id="${escapeHtml(id)}" value="${escapeHtml(value)}" ${checked ? "checked" : ""}>
      <span>${escapeHtml(value)}</span>
    </label>
  `;
}

export function setupEnterToAdvance(form, submitSelector) {
  const focusableFields = Array.from(form.querySelectorAll(`input:not([type='radio']), ${submitSelector}`));

  form.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" || !event.target.matches("input:not([type='radio'])")) {
      return;
    }

    event.preventDefault();
    const currentIndex = focusableFields.indexOf(event.target);
    const nextField = focusableFields[currentIndex + 1];
    if (nextField) {
      nextField.focus();
    }
  });
}

export function setupBookFormValidation(form) {
  form.addEventListener("input", (event) => {
    const field = event.target.closest("input");
    if (field) {
      clearFieldError(field);
    }
  });
}

export function validateBookForm(form) {
  const requiredFields = Array.from(form.querySelectorAll("input[required]"));
  let firstInvalidField = null;

  requiredFields.forEach((field) => {
    const value = String(field.value || "").trim();
    const isInvalid = !value || (field.type === "number" && Number(value) < 0) || (field.name === "publicationDate" && value.length > 4);

    if (isInvalid) {
      showFieldError(field, "This field is required.");
      firstInvalidField ||= field;
    } else {
      clearFieldError(field);
    }
  });

  const location = form.querySelector("input[name='location']:checked");
  const category = form.querySelector("input[name='category']:checked");
  if (!location || !category) {
    firstInvalidField ||= form.querySelector("input[name='location'], input[name='category']");
  }

  if (firstInvalidField) {
    firstInvalidField.focus();
    return false;
  }

  return true;
}

export function resetBookFormValidation(form) {
  form.querySelectorAll(".field-group.has-error").forEach((group) => group.classList.remove("has-error"));
  form.querySelectorAll(".field-error").forEach((error) => {
    error.textContent = "";
  });
}

export function clearFieldError(field) {
  const group = field.closest(".field-group");
  if (!group) return;
  group.classList.remove("has-error");
  const error = group.querySelector(".field-error");
  if (error) {
    error.textContent = "";
  }
}

function showFieldError(field, message) {
  const group = field.closest(".field-group");
  group.classList.add("has-error");
  group.querySelector(".field-error").textContent = message;
}

function slugify(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
