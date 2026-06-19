export function getArrangementOptions(dateLabel = "Date Added") {
  return [
    { value: "date", label: dateLabel },
    { value: "newest", label: "Newest to Oldest" },
    { value: "oldest", label: "Oldest to Newest" },
    { value: "alpha", label: "Alphabetical" }
  ];
}

export function filterBooks(books, filters) {
  return books.filter((book) => {
    const searchTarget = `${book.title || ""} ${book.callNumber || ""} ${book.responsibility || ""}`.toLowerCase();
    const matchesSearch = !filters.search || searchTarget.includes(filters.search.toLowerCase());
    const matchesCategory = !filters.category || book.category === filters.category;
    const matchesLocation = !filters.location || book.location === filters.location;

    return matchesSearch && matchesCategory && matchesLocation;
  });
}

export function sortBooks(books, arrangement = "date", options = {}) {
  const sortedBooks = [...books];
  const dateMode = options.dateMode || "latest";

  if (arrangement === "alpha") {
    return sortedBooks.sort((a, b) => String(a.title || "").localeCompare(String(b.title || "")));
  }

  if (arrangement === "oldest") {
    return sortedBooks.sort((a, b) => getPublicationYear(a) - getPublicationYear(b));
  }

  if (arrangement === "newest") {
    return sortedBooks.sort((a, b) => getPublicationYear(b) - getPublicationYear(a));
  }

  return sortedBooks.sort((a, b) => getRecordDate(b, dateMode) - getRecordDate(a, dateMode));
}

export function getRecordDate(book, dateMode = "latest") {
  const rawDate = dateMode === "archived"
    ? book.archivedAt || book.editedAt || book.addedAt
    : book.editedAt || book.addedAt;
  const date = new Date(rawDate || 0);
  return Number.isNaN(date.getTime()) ? new Date(0) : date;
}

export function formatDateForDisplay(value) {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return String(value).slice(0, 10);
  }

  return date.toISOString().slice(0, 10);
}

function getPublicationYear(book) {
  const rawYear = String(book.publicationDate || "").slice(0, 4);
  const year = Number(rawYear);
  return Number.isFinite(year) ? year : 0;
}
