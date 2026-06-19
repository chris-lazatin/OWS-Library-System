import { openConfirmationModal } from "../components/confirmationModal.js";
import { renderAppLayout } from "../components/layout.js";
import { deleteBook, getState, initStore, restoreBook, subscribe } from "../state/store.js";
import { filterBooks, formatDateForDisplay, getArrangementOptions, sortBooks } from "../utils/bookFilters.js";
import { paginateItems, renderPaginationControls } from "../utils/pagination.js";
import { categoryOptions, locationOptions } from "../utils/bookOptions.js";
import { renderBookTitle } from "../utils/bookDisplay.js";
import { escapeHtml } from "../utils/html.js";

const arrangementOptions = getArrangementOptions("Date Archived");

const pageState = {
  search: "",
  category: "",
  location: "",
  arrangement: "date",
  currentPage: 1
};

renderAppLayout({
  activePage: "book-archive",
  content: `
    <header class="page-header">
      <div>
        <h2>Book Archive</h2>
        <p>Review archived books, restore records, or permanently delete obsolete entries.</p>
      </div>
    </header>

    <section class="toolbar book-list-toolbar" aria-label="Book archive tools">
      <label class="search-box">
        <span class="sr-only">Search archived books</span>
        <input id="archiveSearch" type="search" placeholder="Search title or call number...">
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
        <span class="sr-only">Arrange archived books</span>
        <select id="arrangementSelect">
          ${arrangementOptions.map((option) => `<option value="${option.value}">${option.label}</option>`).join("")}
        </select>
      </label>
    </section>

    <section class="table-card book-list-card" aria-label="Archived books">
      <div class="table-scroll vertical-table-scroll">
        <table class="data-table book-table archive-table">
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
              <th>Archived Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody id="archiveTableBody"></tbody>
        </table>
      </div>
      <footer id="archivePagination" class="table-pagination" aria-label="Book archive pagination"></footer>
    </section>
  `
});

document.querySelector('a[href="book-archive-print.html"]').addEventListener("click", (event) => {
  event.preventDefault();
  const params = new URLSearchParams({
    search: pageState.search,
    category: pageState.category,
    location: pageState.location,
    arrangement: pageState.arrangement
  });
  window.location.href = `../pages/book-archive-print.html?${params.toString()}`;
});

const tableBody = document.getElementById("archiveTableBody");
const paginationMount = document.getElementById("archivePagination");

document.getElementById("archiveSearch").addEventListener("input", debounce((event) => {
  pageState.search = event.target.value.trim().toLowerCase();
  resetCurrentPage();
  renderArchiveTable();
}, 180));

document.getElementById("categoryFilter").addEventListener("change", (event) => {
  pageState.category = event.target.value;
  resetCurrentPage();
  renderArchiveTable();
});

document.getElementById("locationFilter").addEventListener("change", (event) => {
  pageState.location = event.target.value;
  resetCurrentPage();
  renderArchiveTable();
});

document.getElementById("arrangementSelect").addEventListener("change", (event) => {
  pageState.arrangement = event.target.value;
  resetCurrentPage();
  renderArchiveTable();
});

paginationMount.addEventListener("click", (event) => {
  const button = event.target.closest("[data-pagination-action]");
  if (!button) {
    return;
  }

  pageState.currentPage += button.dataset.paginationAction === "next" ? 1 : -1;
  renderArchiveTable();
});

tableBody.addEventListener("click", (event) => {
  const restoreButton = event.target.closest("[data-restore-book]");
  const deleteButton = event.target.closest("[data-delete-book]");

  if (restoreButton) {
    openRestoreBookModal(restoreButton.dataset.bookId);
    return;
  }

  if (deleteButton) {
    openPermanentDeleteBookModal(deleteButton.dataset.bookId);
  }
});

initStore().then(() => {
  subscribe(renderArchiveTable);
  renderArchiveTable();
});

function renderArchiveTable() {
  const books = getFilteredArchivedBooks();
  const { items: visibleBooks, pagination } = paginateItems(books, pageState.currentPage);
  pageState.currentPage = pagination.currentPage;

  tableBody.innerHTML = visibleBooks.length
    ? visibleBooks.map(renderArchiveRow).join("")
    : `<tr><td colspan="12" class="empty-table">No archived books found.</td></tr>`;
  paginationMount.innerHTML = renderPaginationControls(pagination, books.length);
}

function getFilteredArchivedBooks() {
  const filteredBooks = filterBooks([...getState().archivedBooks], pageState, { dateMode: "archived" });
  return sortBooks(filteredBooks, pageState.arrangement, { dateMode: "archived" });
}

function renderArchiveRow(book) {
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
      <td>${display(formatDateForDisplay(book.archivedAt))}</td>
      <td>
        <div class="row-actions archive-row-actions">
          <button class="secondary-button compact-button" type="button" data-restore-book data-book-id="${escapeHtml(book.id)}">Restore</button>
          <button class="delete-button archive-delete-button" type="button" data-delete-book data-book-id="${escapeHtml(book.id)}" aria-label="Delete ${escapeHtml(book.title)} permanently" title="Delete permanently"><span aria-hidden="true">&#128465;</span></button>
        </div>
      </td>
    </tr>
  `;
}

function openRestoreBookModal(bookId) {
  const book = getState().archivedBooks.find((item) => item.id === bookId);
  if (!book) {
    return;
  }

  openConfirmationModal({
    title: "Restore Book",
    heading: "Restore this book?",
    message: `${book.title || "This book"} will return to the active Book List and leave the archive.`,
    confirmLabel: "Restore",
    tone: "success",
    onConfirm: () => restoreBook(bookId)
  });
}

function openPermanentDeleteBookModal(bookId) {
  const book = getState().archivedBooks.find((item) => item.id === bookId);
  if (!book) {
    return;
  }

  openConfirmationModal({
    title: "Delete Permanently",
    heading: "Delete this book permanently?",
    message: `${book.title || "This book"} will be removed from storage completely after confirmation.`,
    confirmLabel: "Confirm",
    onConfirm: () => deleteBook(bookId)
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
