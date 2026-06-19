import { renderAppLayout } from "../components/layout.js";
import { openConfirmationModal } from "../components/confirmationModal.js";
import { openModal } from "../components/modal.js";
import { archiveBook, getState, initStore, subscribe, updateBook } from "../state/store.js";
import { filterBooks, formatDateForDisplay, getArrangementOptions, sortBooks } from "../utils/bookFilters.js";
import { paginateItems, renderPaginationControls } from "../utils/pagination.js";
import {
  renderBookChoice,
  renderBookField,
  setupBookFormValidation,
  setupEnterToAdvance,
  validateBookForm
} from "../utils/bookForm.js";
import { bookFieldGroups, categoryOptions, locationOptions } from "../utils/bookOptions.js";
import { renderBookTitle } from "../utils/bookDisplay.js";
import { escapeHtml } from "../utils/html.js";

const arrangementOptions = getArrangementOptions();

const pageState = {
  search: "",
  category: "",
  location: "",
  arrangement: "date",
  currentPage: 1
};

renderAppLayout({
  activePage: "book-list",
  content: `
    <header class="page-header">
      <div>
        <h2>Book List</h2>
        <p>Search, filter, arrange, edit, and export the complete catalog.</p>
      </div>
    </header>

    <section class="toolbar book-list-toolbar" aria-label="Book list tools">
      <label class="search-box">
        <span class="sr-only">Search books</span>
        <input id="bookSearch" type="search" placeholder="Search title, Author, or Call number...">
      </label>
      <label class="filter-box">
        <span class="sr-only">Filter by category</span>
        <select id="categoryFilter">
          <option value="">All Categories</option>
          ${categoryOptions.map((category) => `<option value="${escapeHtml(category)}">${escapeHtml(category)}</option>`).join("")}
        </select>
      </label>
      <label class="filter-box">
        <span class="sr-only">Filter by location</span>
        <select id="locationFilter">
          <option value="">All Locations</option>
          ${locationOptions.map((location) => `<option value="${escapeHtml(location)}">${escapeHtml(location)}</option>`).join("")}
        </select>
      </label>
      <label class="filter-box">
        <span class="sr-only">Arrange books</span>
        <select id="arrangementSelect">
          ${arrangementOptions.map((option) => `<option value="${option.value}">${option.label}</option>`).join("")}
        </select>
      </label>
    </section>

    <section class="table-card book-list-card" aria-label="Books">
      <div class="table-scroll vertical-table-scroll">
        <table class="data-table book-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Author</th>
              <th>Publisher</th>
              <th>Year</th>
              <th>Call Number</th>
              <th>ISBN</th>
              <th>Location</th>
              <th>Category</th>
              <th>Copy</th>
              <th>Date Added / Date Edited</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody id="bookTableBody"></tbody>
        </table>
      </div>
      <footer id="bookPagination" class="table-pagination" aria-label="Book list pagination"></footer>
    </section>
  `
});

document.querySelector('a[href="book-list-print.html"]').addEventListener("click", (event) => {
  event.preventDefault();
  const params = new URLSearchParams({
    search: pageState.search,
    category: pageState.category, 
    location: pageState.location,
    arrangement: pageState.arrangement,
  });
  window.location.href = `../pages/book-list-print.html?${params.toString()}`;
});

const tableBody = document.getElementById("bookTableBody");
const paginationMount = document.getElementById("bookPagination");

document.getElementById("bookSearch").addEventListener("input", debounce((event) => {
  pageState.search = event.target.value.trim().toLowerCase();
  resetCurrentPage();
  renderBookTable();
}, 180));

document.getElementById("categoryFilter").addEventListener("change", (event) => {
  pageState.category = event.target.value;
  resetCurrentPage();
  renderBookTable();
});

document.getElementById("locationFilter").addEventListener("change", (event) => {
  pageState.location = event.target.value;
  resetCurrentPage();
  renderBookTable();
});

document.getElementById("arrangementSelect").addEventListener("change", (event) => {
  pageState.arrangement = event.target.value;
  resetCurrentPage();
  renderBookTable();
});

paginationMount.addEventListener("click", (event) => {
  const button = event.target.closest("[data-pagination-action]");
  if (!button) {
    return;
  }

  pageState.currentPage += button.dataset.paginationAction === "next" ? 1 : -1;
  renderBookTable();
});

tableBody.addEventListener("click", (event) => {
  const editButton = event.target.closest("[data-edit-book]");
  const archiveButton = event.target.closest("[data-archive-book]");

  if (editButton) {
    openEditBookModal(editButton.dataset.bookId);
    return;
  }

  if (archiveButton) {
    openArchiveBookModal(archiveButton.dataset.bookId);
  }
});

initStore().then(() => {
  subscribe(renderBookTable);
  renderBookTable();
});

function renderBookTable() {
  const books = getFilteredBooks();
  const { items: visibleBooks, pagination } = paginateItems(books, pageState.currentPage);
  pageState.currentPage = pagination.currentPage;

  tableBody.innerHTML = visibleBooks.length
    ? visibleBooks.map(renderBookRow).join("")
    : `<tr><td colspan="11" class="empty-table">No books found.</td></tr>`;
  paginationMount.innerHTML = renderPaginationControls(pagination, books.length);
}

function getFilteredBooks() {
  return sortBooks(filterBooks([...getState().books], pageState), pageState.arrangement);
}

function renderBookRow(book) {
  return `
    <tr>
      <td><strong>${renderBookTitle(book)}</strong></td>
      <td>${display(book.responsibility)}</td>
      <td>${display(book.publisher)}</td>
      <td>${display(book.publicationDate)}</td>
      <td>${display(book.callNumber)}</td>
      <td>${display(book.isbn)}</td>
      <td>${display(book.location)}</td>
      <td>${display(book.category)}</td>
      <td>${display(book.onShelf)}</td>
      <td>${display(formatDateForDisplay(book.editedAt || book.addedAt))}</td>
      <td>
        <div class="row-actions">
          <button class="secondary-button compact-button" type="button" data-edit-book data-book-id="${escapeHtml(book.id)}">Edit</button>
          <button class="danger-button compact-button" type="button" data-archive-book data-book-id="${escapeHtml(book.id)}" aria-label="Archive ${escapeHtml(book.title)}">Archive</button>
        </div>
      </td>
    </tr>
  `;
}

function openArchiveBookModal(bookId) {
  const book = getState().books.find((item) => item.id === bookId);
  if (!book) {
    return;
  }

  openConfirmationModal({
    title: "Archive Book",
    heading: "Archive this book?",
    message: `${book.title || "This book"} will move out of the active Book List and into Book Archive with all details preserved.`,
    confirmLabel: "Archive",
    onConfirm: () => archiveBook(bookId)
  });
}

function openEditBookModal(bookId) {
  const book = getState().books.find((item) => item.id === bookId);
  if (!book) {
    return;
  }

  const modal = openModal({
    title: "Edit Book",
    size: "large",
    content: `
      <form id="editBookForm" class="data-form modal-form" novalidate>
        ${bookFieldGroups.map((group, index) => `
          <section class="form-section modal-form-section" aria-labelledby="editGroup${index}">
            <h3 id="editGroup${index}">${group.title}</h3>
            <div class="form-grid">
              ${group.fields.map((field) => renderBookField(field.label, field.name, field.type || "text", Boolean(field.required), book[field.name] ?? "", "edit-", { placeholder: field.placeholder })).join("")}
            </div>
          </section>
        `).join("")}

        <div class="choice-block">
          <span class="choice-label">Library/Location</span>
          <div class="choice-group" role="radiogroup" aria-label="Edit library location">
            ${locationOptions.map((option, index) => renderBookChoice("location", option, book.location ? book.location === option : index === 0, "oval-choice", "edit-")).join("")}
          </div>
        </div>

        <div class="choice-block">
          <span class="choice-label">Categories</span>
          <div class="choice-group category-choice-group" role="radiogroup" aria-label="Edit book category">
            ${categoryOptions.map((option, index) => renderBookChoice("category", option, book.category ? book.category === option : index === 0, "pill-choice", "edit-")).join("")}
          </div>
        </div>

        <div class="modal-actions">
          <button class="secondary-button" type="button" data-modal-close>Cancel</button>
          <button class="primary-button modal-submit" type="submit">Save</button>
        </div>
      </form>
    `
  });

  const editForm = modal.root.querySelector("#editBookForm");
  setupEnterToAdvance(editForm, "button.modal-submit");
  setupBookFormValidation(editForm);

  editForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!validateBookForm(editForm)) {
      return;
    }

    const formData = new FormData(event.currentTarget);

    await updateBook(bookId, {
      title: String(formData.get("title") || "").trim(),
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
      onShelf: Number(formData.get("onShelf") || 0),
      recordId: String(formData.get("recordId") || ""),
      location: String(formData.get("location") || book.location || ""),
      category: String(formData.get("category") || book.category || ""),
      editedAt: new Date().toISOString()
    });

    modal.close();
  });
}

function display(value) {
  if (value === undefined || value === null || value === "") {
    return "-";
  }

  return escapeHtml(value);
}

function resetCurrentPage() {
  pageState.currentPage = 1;
}

function debounce(callback, wait) {
  let timeoutId;
  return (...args) => {
    window.clearTimeout(timeoutId);
    timeoutId = window.setTimeout(() => callback(...args), wait);
  };
}
