import { getState, initStore } from "../state/store.js";
import { filterBooks, formatDateForDisplay, sortBooks } from "../utils/bookFilters.js";
import { renderBookTitle } from "../utils/bookDisplay.js";
import { escapeHtml } from "../utils/html.js";

const tableBody = document.getElementById("printArchiveTableBody");

document.getElementById("generatedDate").textContent = `Generated ${new Date().toLocaleString()}`;

document.getElementById("printPage").addEventListener("click", () => {
  window.print();
});

const params = new URLSearchParams(window.location.search);
const printState = {
  search: params.get("search") || "",
  category: params.get("category") || "",
  location: params.get("location") || "",
  arrangement: params.get("arrangement") || "date"
};

async function init() {
  tableBody.innerHTML = `<tr><td colspan="10" class="empty-table">Loading archived books...</td></tr>`;
  await initStore();

  const archivedBooks = sortBooks(
    filterBooks([...getState().archivedBooks], printState),
    printState.arrangement,
    { dateMode: "archived" }
  );

  tableBody.innerHTML = archivedBooks.length
    ? archivedBooks.map(renderPrintRow).join("")
    : `<tr><td colspan="10" class="empty-table">No archived books found.</td></tr>`;
}

function renderPrintRow(book) {
  return `
    <tr>
      <td>${renderBookTitle(book)}</td>
      <td>${display(book.responsibility)}</td>
      <td>${display(book.publisher)}</td>
      <td>${display(book.publicationDate)}</td>
      <td>${display(book.callNumber)}</td>
      <td>${display(book.isbn)}</td>
      <td>${display(book.location)}</td>
      <td>${display(book.category)}</td>
      <td>${display(book.onShelf)}</td>
      <td>${display(formatDateForDisplay(book.archivedAt))}</td>
    </tr>
  `;
}

function display(value) {
  if (value === undefined || value === null || value === "") {
    return "-";
  }

  return escapeHtml(value);
}

init();
