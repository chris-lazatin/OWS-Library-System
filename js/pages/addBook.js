import { renderAppLayout } from "../components/layout.js";
import { openModal } from "../components/modal.js";
import { addBook, initStore } from "../state/store.js";
import {
  renderBookChoice,
  renderBookField,
  resetBookFormValidation,
  setupBookFormValidation,
  setupEnterToAdvance,
  validateBookForm
} from "../utils/bookForm.js";
import { categoryOptions, locationOptions } from "../utils/bookOptions.js";

renderAppLayout({
  activePage: "add-book",
  content: `
    <header class="page-header">
      <div>
        <h2>Add New Book</h2>
        <p>Book Cataloging, recording the physical attributes and publishing details of a book.</p>
      </div>
    </header>

    <form id="addBookForm" class="data-form" novalidate>
      <section class="form-section" aria-labelledby="titleProperHeading">
        <h3 id="titleProperHeading">Title Proper</h3>
        <div class="form-grid">
          ${renderBookField("Title", "titleProper", "text", true)}
          ${renderBookField("Author/Responsibility", "responsibility", "text", true)}
          ${renderBookField("Added Entry: Corporate", "corporateEntry")}
        </div>
      </section>

      <section class="form-section" aria-labelledby="publicationHeading">
        <h3 id="publicationHeading">Publication</h3>
        <div class="form-grid">
          ${renderBookField("Place", "place")}
          ${renderBookField("Publisher", "publisher", "text", true)}
          ${renderBookField("Year", "publicationDate", "number", true)}
          ${renderBookField("Height (cm)", "height")}
          ${renderBookField("Width (cm)", "width")}
          ${renderBookField("ISBN", "isbn", "text")}
          ${renderBookField("URL", "url", "url")}
        </div>
      </section>

      <section class="form-section" aria-labelledby="localInfoHeading">
        <h3 id="localInfoHeading">Local Information</h3>
        <div class="form-grid">
          ${renderBookField("Call Number", "callNumber", "text", true)}
          ${renderBookField("Accession", "accession")}
          ${renderBookField("Language", "language")}
          ${renderBookField("Entered By", "enteredBy")}
          ${renderBookField("Updated By", "updatedBy")}
          ${renderBookField("Volume", "volumeCopy", "text", false, "", "", { placeholder: "e.g. \"1\"" })}
          ${renderBookField("Edition", "edition")}
          ${renderBookField("Page", "pages", "number")}
          ${renderBookField("Copy", "onShelf", "number", true)}
          ${renderBookField("ID", "recordId")}
        </div>

        <div class="choice-block">
          <span class="choice-label">Library/Location</span>
          <div class="choice-group" role="radiogroup" aria-label="Library location">
            ${locationOptions.map((option, index) => renderBookChoice("location", option, index === 0, "oval-choice")).join("")}
          </div>
        </div>

        <div class="choice-block">
          <span class="choice-label">Categories</span>
          <div class="choice-group category-choice-group" role="radiogroup" aria-label="Book category">
            ${categoryOptions.map((option, index) => renderBookChoice("category", option, index === 0, "pill-choice")).join("")}
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
setupEnterToAdvance(form, "button.form-submit");
setupBookFormValidation(form);
initStore();

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!validateBookForm(form)) {
    return;
  }

  const formData = new FormData(form);
  const title = String(formData.get("titleProper") || "").trim();

  await addBook({
    title,
    responsibility: String(formData.get("responsibility") || ""),
    corporateEntry: String(formData.get("corporateEntry") || ""),
    place: String(formData.get("place") || ""),
    publisher: String(formData.get("publisher") || ""),
    publicationDate: String(formData.get("publicationDate") || ""),
    height: String(formData.get("height") || ""),
    width: String(formData.get("width") || ""),
    isbn: String(formData.get("isbn") || ""),
    url: String(formData.get("url") || ""),
    callNumber: String(formData.get("callNumber") || ""),
    accession: String(formData.get("accession") || ""),
    language: String(formData.get("language") || ""),
    enteredBy: String(formData.get("enteredBy") || ""),
    updatedBy: String(formData.get("updatedBy") || ""),
    volumeCopy: String(formData.get("volumeCopy") || ""),
    edition: String(formData.get("edition") || ""),
    pages: String(formData.get("pages") || ""),
    onShelf: Number(formData.get("onShelf") || 1),
    recordId: String(formData.get("recordId") || ""),
    location: String(formData.get("location") || locationOptions[0]),
    category: String(formData.get("category") || categoryOptions[0]),
    addedAt: new Date().toISOString()
  });

  form.reset();
  resetDefaultChoices();
  showSuccessModal();
});

function resetDefaultChoices() {
  form.querySelector("input[name='location']").checked = true;
  form.querySelector("input[name='category']").checked = true;
  resetBookFormValidation(form);
}

function showSuccessModal() {
  const modal = openModal({
    title: "Success",
    size: "small",
    content: `
      <div class="success-message">
        <div class="success-mark" aria-hidden="true">✓</div>
        <p>Book Added Successfully</p>
        <span>The new catalog record has been saved and is ready to appear across the system.</span>
      </div>
    `
  });

  window.setTimeout(() => modal.close(), 2000);
}
