import { fetchBooks, saveBook, editBook, removeBook,
         fetchLendings, saveLending, updateLendingStatus, removeLending
} from "../services/firestoreService.js";

const state = {
  books: [],
  notifications: [],
  borrowRecords: [],
  dashboardStats: {}
};

const listeners = new Set();

export async function initStore() {
  const [books, borrowRecords] = await Promise.all([
    fetchBooks(),
    fetchLendings()
  ]);
  setState({ books, borrowRecords });
}

export function getState() {
  return state;
}

export function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function setState(updater) {
  const updates = typeof updater === "function" ? updater(state) : updater;
  Object.assign(state, updates);
  state.dashboardStats = buildDashboardStats(state.books);
  listeners.forEach((listener) => listener(state));
}

export function markNotificationsRead() {
  setState((currentState) => ({
    notifications: currentState.notifications.map((n) => ({ ...n, read: true }))
  }));
}

export async function addBook(bookData) {
  const book = await saveBook(bookData);
  setState((currentState) => ({
    books: [book, ...currentState.books],
    notifications: [
      createNotification("added", "Book added", `${book.title || "New book"} was added to the catalog.`),
      ...currentState.notifications
    ]
  }));
  return book;
}

export async function updateBook(bookId, bookData) {
  await editBook(bookId, bookData);
  let updatedBook;
  setState((currentState) => ({
    books: currentState.books.map((book) => {
      if (book.id !== bookId) return book;
      updatedBook = { ...book, ...bookData, id: book.id };
      return updatedBook;
    }),
    notifications: [
      createNotification("updated", "Book edited", `${bookData.title || "A book"} details were updated.`),
      ...currentState.notifications
    ]
  }));
  return updatedBook;
}

export async function deleteBook(bookId) {
  const book = state.books.find((item) => item.id === bookId);
  await removeBook(bookId);
  setState((currentState) => ({
    books: currentState.books.filter((item) => item.id !== bookId),
    notifications: [
      createNotification("deleted", "Book deleted", `${book?.title || "A book"} was removed from the catalog.`),
      ...currentState.notifications
    ]
  }));
}

export function addPdfNotification(label) {
  setState((currentState) => ({
    notifications: [
      createNotification("pdf", "PDF exported", `${label} PDF was generated.`),
      ...currentState.notifications
    ]
  }));
}

export async function addBorrowRecord(recordData) {
  const record = await saveLending(recordData);
  setState((currentState) => ({
    borrowRecords: [record, ...currentState.borrowRecords],
    notifications: [
      createNotification("borrowed", "Book borrowed", `${record.borrowerName} borrowed ${record.books?.length ?? 1} book record(s).`),
      ...currentState.notifications
    ]
  }));
  return record;
}

export async function updateBorrowStatus(recordId, status) {
  await updateLendingStatus(recordId, status);
  setState((currentState) => ({
    borrowRecords: currentState.borrowRecords.map((record) =>
      record.id === recordId ? { ...record, status } : record
    )
  }));
}

export async function deleteBorrowRecord(recordId) {
  await removeLending(recordId);
  setState((currentState) => ({
    borrowRecords: currentState.borrowRecords.filter((record) => record.id !== recordId),
    notifications: [
      createNotification("deleted", "Borrow record deleted", "A lending record was removed."),
      ...currentState.notifications
    ]
  }));
}

export function buildDashboardStats(books) {
  return {
    totalBooks: books.length,
    byLocation: countBy(books, "location"),
    byCategory: countBy(books, "category"),
    addedOverTime: books.reduce((totals, book) => {
      const month = (book.addedAt || "").slice(0, 7);
      totals[month] = (totals[month] || 0) + 1;
      return totals;
    }, {})
  };
}

function countBy(items, key) {
  return items.reduce((totals, item) => {
    const value = item[key] || "Unassigned";
    totals[value] = (totals[value] || 0) + 1;
    return totals;
  }, {});
}

function createNotification(type, title, message) {
  return {
    id: `nt-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
    type, title, message,
    createdAt: "Just now",
    read: false
  };
}