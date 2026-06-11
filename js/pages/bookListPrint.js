import { addPdfNotification, getState } from "../state/store.js";
import { escapeHtml } from "../utils/html.js";
import { downloadElementAsPdf } from "../utils/pdf.js";

const printDocument = document.getElementById("printDocument");
const tableBody = document.getElementById("printBookTableBody");

document.getElementById("generatedDate").textContent = `Generated ${new Date().toLocaleString()}`;
tableBody.innerHTML = getState().books.map(renderPrintRow).join("");

document.getElementById("printPage").addEventListener("click", () => {
  window.print();
});

document.querySelectorAll("[data-pdf-download]").forEach((button) => {
  button.addEventListener("click", async () => {
    await downloadElementAsPdf(printDocument, "ows-book-list-report.pdf");
    addPdfNotification("Book list report");
  });
});

function renderPrintRow(book) {
  return `
    <tr>
      <td>${display(book.title)}</td>
      <td>${display(book.callNumber)}</td>
      <td>${display(book.accession)}</td>
      <td>${display(book.responsibility)}</td>
      <td>${display(book.publisher)}</td>
      <td>${display(book.addedAt || book.publicationDate)}</td>
      <td>${display(book.location)}</td>
      <td>${display(book.category)}</td>
      <td>${display(book.isbn)}</td>
      <td>${display(book.enteredBy)}</td>
    </tr>
  `;
}

function display(value) {
  if (value === undefined || value === null || value === "") {
    return "-";
  }

  return escapeHtml(value);
}
