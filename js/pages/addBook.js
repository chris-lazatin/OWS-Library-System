import { renderAppLayout } from "../components/layout.js";
import { openModal } from "../components/modal.js";
import { addBook } from "../state/store.js";
import { categoryOptions, locationOptions } from "../utils/bookOptions.js";
import { initStore } from "../state/store.js";
await initStore();

renderAppLayout({
  activePage: "add-book",
  content: `
    <header class="page-header">
      <div>
        <h2>Add New Book</h2>
        <p>Catalog entry form structured for future database integration.</p>
      </div>
    </header>

    <form id="addBookForm" class="data-form">
      <section class="form-section" aria-labelledby="titleProperHeading">
        <h3 id="titleProperHeading">Title Proper</h3>
        <div class="form-grid">
          ${renderField("Title Proper", "titleProper", "text", true)}
          ${renderField("Responsibility", "responsibility")}
          ${renderField("Added Entry: Corporate", "corporateEntry")}
        </div>
      </section>

      <section class="form-section" aria-labelledby="publicationHeading">
        <h3 id="publicationHeading">Publication</h3>
        <div class="form-grid">
          ${renderField("Place", "place")}
          ${renderField("Publisher", "publisher")}
          ${renderField("Date", "publicationDate", "date")}
          ${renderField("Extent/Dimension", "extent")}
          ${renderField("ISBN", "isbn")}
          ${renderField("URL", "url", "url")}
        </div>
      </section>

      <section class="form-section" aria-labelledby="localInfoHeading">
        <h3 id="localInfoHeading">Local Information</h3>
        <div class="form-grid">
          ${renderField("Call Number", "callNumber", "text", true)}
          ${renderField("Accession", "accession")}
          ${renderField("Language", "language")}
          ${renderField("Entered By", "enteredBy")}
          ${renderField("Date Entered", "dateEntered", "date")}
          ${renderField("Updated By", "updatedBy")}
          ${renderField("Date Updated", "dateUpdated", "date")}
          ${renderField("Volume/Copy", "volumeCopy")}
          ${renderField("On Shelf", "onShelf", "number")}
          ${renderField("ID", "recordId")}
        </div>

        <div class="choice-block">
          <span class="choice-label">Library/Location</span>
          <div class="choice-group" role="radiogroup" aria-label="Library location">
            ${locationOptions.map((option, index) => renderChoice("location", option, index === 0, "oval-choice")).join("")}
          </div>
        </div>

        <div class="choice-block">
          <span class="choice-label">Categories</span>
          <div class="choice-group category-choice-group" role="radiogroup" aria-label="Book category">
            ${categoryOptions.map((option, index) => renderChoice("category", option, index === 0, "pill-choice")).join("")}
          </div>
        </div>
      </section>

      <div class="form-actions">
        <button class="primary-button form-submit" type="submit">Add Book</button>
      </div>
    </form>
  `
});

const form = document.getElementById("addBookForm");

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const formData = new FormData(form);
  const title = String(formData.get("titleProper") || "").trim();

  await addBook({
    title,
    responsibility: String(formData.get("responsibility") || ""),
    corporateEntry: String(formData.get("corporateEntry") || ""),
    place: String(formData.get("place") || ""),
    publisher: String(formData.get("publisher") || ""),
    publicationDate: String(formData.get("publicationDate") || ""),
    extent: String(formData.get("extent") || ""),
    isbn: String(formData.get("isbn") || ""),
    url: String(formData.get("url") || ""),
    callNumber: String(formData.get("callNumber") || ""),
    accession: String(formData.get("accession") || ""),
    language: String(formData.get("language") || ""),
    enteredBy: String(formData.get("enteredBy") || ""),
    dateEntered: String(formData.get("dateEntered") || ""),
    updatedBy: String(formData.get("updatedBy") || ""),
    dateUpdated: String(formData.get("dateUpdated") || ""),
    volumeCopy: String(formData.get("volumeCopy") || ""),
    onShelf: Number(formData.get("onShelf") || 1),
    recordId: String(formData.get("recordId") || ""),
    location: String(formData.get("location") || locationOptions[0]),
    category: String(formData.get("category") || categoryOptions[0]),
    addedAt: new Date().toISOString().slice(0, 10)
  });

  form.reset();
  resetDefaultChoices();
  showSuccessModal();
});

function renderField(label, name, type = "text", required = false) {
  return `
    <div class="field-group">
      <label for="${name}">${label}</label>
      <input id="${name}" name="${name}" type="${type}" ${required ? "required" : ""}>
    </div>
  `;
}

function renderChoice(name, value, checked, className) {
  const id = `${name}-${value.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  return `
    <label class="${className}">
      <input type="radio" name="${name}" id="${id}" value="${value}" ${checked ? "checked" : ""}>
      <span>${value}</span>
    </label>
  `;
}

function resetDefaultChoices() {
  form.querySelector("input[name='location']").checked = true;
  form.querySelector("input[name='category']").checked = true;
}

function showSuccessModal() {
  const modal = openModal({
    title: "Success",
    size: "small",
    content: `
      <div class="success-message">
        <div class="success-mark" aria-hidden="true">OK</div>
        <p>New Book Added Successfully</p>
      </div>
    `
  });

  window.setTimeout(() => modal.close(), 2000);
}
