import { fetchBooks, saveBook, editBook, archiveBookRecord, restoreBookRecord, removeBook,
         fetchLendings, saveLending, updateLendingStatus, removeLending,
         fetchNotifications, saveNotification, markAllNotificationsRead,
         subscribeToBooks, subscribeToLendings, subscribeToNotifications
} from "../services/firestoreService.js";
import { categoryOptions, locationOptions } from "../utils/bookOptions.js";

const state = {
  books: [],
  archivedBooks: [],
  notifications: [],
  borrowRecords: [],
  dashboardStats: {}
};

const listeners = new Set();
const NOTIFICATION_LIMIT = 10;
const READ_NOTIFICATION_IDS_KEY = "ows-library-read-notification-ids";
const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

let storeInitialized = false;
let storeReadyPromise = null;

export function initStore() {
  if (storeReadyPromise) return storeReadyPromise;

  storeReadyPromise = new Promise((resolve) => {
    let booksReady = false;
    let lendingsReady = false;

    const checkReady = () => {
      if (booksReady && lendingsReady) resolve();
    };

    subscribeToBooks((allBooks) => {
      setState(splitBooksByArchiveState(allBooks));
      if (!booksReady) { booksReady = true; checkReady(); }
    });

    subscribeToLendings((borrowRecords) => {
      setState({ borrowRecords });
      if (!lendingsReady) { lendingsReady = true; checkReady(); }
    });

    subscribeToNotifications((notifications) => setState({ notifications }));
  });

  return storeReadyPromise;
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
  if (updates.notifications) {
    updates.notifications = normalizeNotifications(updates.notifications);
  }
  const booksChanged = updates.books !== undefined;
  Object.assign(state, updates);
  if (booksChanged || updates.borrowRecords !== undefined) {
    state.dashboardStats = buildDashboardStats(state.books, state.borrowRecords);
  }
  listeners.forEach((listener) => listener(state));
}

export async function markNotificationsRead() {
  persistReadNotifications(state.notifications);
  setState((currentState) => ({
    notifications: currentState.notifications.map((n) => ({ ...n, read: true }))
  }));

  try {
    await markAllNotificationsRead();
    setState((currentState) => ({
      notifications: currentState.notifications.map((n) => ({ ...n, read: true }))
    }));
  } catch (error) {
    console.error("Unable to sync notification read state.", error);
  }
}

export async function addBook(bookData) {
  const book = await saveBook(bookData);
  const notification = await createNotification("added", "Book added", `${book.title || "New book"} was added to the catalog.`);
  setState((currentState) => ({
    books: [book, ...currentState.books],
    notifications: limitNotifications([
      notification,
      ...currentState.notifications
    ])
  }));
  return book;
}

export async function updateBook(bookId, bookData) {
  bookData.addedAt = new Date().toISOString();
  await editBook(bookId, bookData);
  const notification = await createNotification("updated", "Book edited", `${bookData.title || "A book"} details were updated.`);
  let updatedBook;
  setState((currentState) => ({
    books: currentState.books.map((book) => {
      if (book.id !== bookId) return book;
      updatedBook = { ...book, ...bookData, id: book.id, editedAt: bookData.editedAt || book.editedAt };
      return updatedBook;
    }),
    notifications: limitNotifications([
      notification,
      ...currentState.notifications
    ])
  }));
  return updatedBook;
}

export async function archiveBook(bookId) {
  const book = state.books.find((item) => item.id === bookId);
  if (!book) {
    return;
  }

  const archivedAt = new Date().toISOString();
  await archiveBookRecord(bookId, archivedAt);
  const notification = await createNotification("updated", "Book archived", `${book.title || "A book"} was moved to the book archive.`);
  const archivedBook = { ...book, archived: true, archivedAt };

  setState((currentState) => ({
    books: currentState.books.filter((item) => item.id !== bookId),
    archivedBooks: [archivedBook, ...currentState.archivedBooks.filter((item) => item.id !== bookId)],
    notifications: limitNotifications([
      notification,
      ...currentState.notifications
    ])
  }));
}

export async function restoreBook(bookId) {
  const book = state.archivedBooks.find((item) => item.id === bookId);
  if (!book) {
    return;
  }

  const restoredAt = new Date().toISOString();
  await restoreBookRecord(bookId, restoredAt);
  const notification = await createNotification("updated", "Book restored", `${book.title || "A book"} was restored to the active catalog.`);
  const restoredBook = { ...book, archived: false, restoredAt };

  setState((currentState) => ({
    books: [restoredBook, ...currentState.books.filter((item) => item.id !== bookId)],
    archivedBooks: currentState.archivedBooks.filter((item) => item.id !== bookId),
    notifications: limitNotifications([
      notification,
      ...currentState.notifications
    ])
  }));
}

export async function deleteBook(bookId) {
  const book = state.books.find((item) => item.id === bookId)
    || state.archivedBooks.find((item) => item.id === bookId);
  await removeBook(bookId);
  const notification = await createNotification("deleted", "Book deleted", `${book?.title || "A book"} was removed from the catalog.`);
  setState((currentState) => ({
    books: currentState.books.filter((item) => item.id !== bookId),
    archivedBooks: currentState.archivedBooks.filter((item) => item.id !== bookId),
    notifications: limitNotifications([
      notification,
      ...currentState.notifications
    ])
  }));
}

export async function addPdfNotification(label) {
  const notification = await createNotification("pdf", "PDF exported", `${label} PDF was generated.`);
  setState((currentState) => ({
    notifications: limitNotifications([
      notification,
      ...currentState.notifications
    ])
  }));
}

export async function addBorrowRecord(recordData) {
  const record = await saveLending(recordData);
  const notification = await createNotification("borrowed", "Book borrowed", `${record.borrowerName} borrowed ${record.books?.length ?? 1} book record(s).`);
  setState((currentState) => ({
    notifications: limitNotifications([
      notification,
      ...currentState.notifications
    ])
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
  const notification = await createNotification("deleted", "Borrow record deleted", "A lending record was removed.");
  setState((currentState) => ({
    borrowRecords: currentState.borrowRecords.filter((record) => record.id !== recordId),
    notifications: limitNotifications([
      notification,
      ...currentState.notifications
    ])
  }));
}

export function buildDashboardStats(books, borrowRecords = state.borrowRecords) {
  const currentYear = new Date().getFullYear();

  return {
    totalBooks: books.length,
    totalBorrowRecords: borrowRecords.length,
    byLocation: countByOptions(books, "location", locationOptions),
    byCategory: countByOptions(books, "category", categoryOptions),
    addedOverTime: books.reduce((totals, book) => {
      const addedDate = parseDate(book.addedAt);
      if (!addedDate || addedDate.getFullYear() !== currentYear) {
        return totals;
      }

      const monthLabel = MONTH_LABELS[addedDate.getMonth()];
      totals[monthLabel] = (totals[monthLabel] || 0) + 1;
      return totals;
    }, Object.fromEntries(MONTH_LABELS.map((month) => [month, 0]))),
    currentYear
  };
}

async function createNotification(type, title, message) {
  const now = new Date();
  return saveNotification({
    type, title, message,
    createdAt: now.toLocaleString(),
    createdAtValue: now.toISOString(),
    read: false
  });
}

function splitBooksByArchiveState(books) {
  return books.reduce((result, book) => {
    const bookCopy = { ...book };
    if (bookCopy.archived) {
      result.archivedBooks.push(bookCopy);
    } else {
      result.books.push(bookCopy);
    }
    return result;
  }, { books: [], archivedBooks: [] });
}

function countByOptions(items, key, validOptions) {
  const totals = Object.fromEntries(validOptions.map((option) => [option, 0]));
  items.forEach((item) => {
    const value = item[key];
    if (Object.prototype.hasOwnProperty.call(totals, value)) {
      totals[value] += 1;
    }
  });
  return totals;
}

function limitNotifications(notifications) {
  return notifications.slice(0, NOTIFICATION_LIMIT);
}

function normalizeNotifications(notifications) {
  const readNotificationIds = getPersistedReadNotificationIds();
  return limitNotifications(notifications.map((notification) => {
    const notificationId = getNotificationIdentity(notification);
    return {
      ...notification,
      read: Boolean(notification.read || (notificationId && readNotificationIds.has(notificationId)))
    };
  }));
}

function parseDate(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function persistReadNotifications(notifications) {
  const readNotificationIds = getPersistedReadNotificationIds();
  notifications.forEach((notification) => {
    const notificationId = getNotificationIdentity(notification);
    if (notificationId) {
      readNotificationIds.add(notificationId);
    }
  });
  savePersistedReadNotificationIds(readNotificationIds);
}

function getNotificationIdentity(notification) {
  return String(notification.id || notification.createdAtValue || notification.createdAt || "");
}

function getPersistedReadNotificationIds() {
  try {
    return new Set(JSON.parse(localStorage.getItem(READ_NOTIFICATION_IDS_KEY) || "[]"));
  } catch (error) {
    return new Set();
  }
}

function savePersistedReadNotificationIds(readNotificationIds) {
  try {
    localStorage.setItem(READ_NOTIFICATION_IDS_KEY, JSON.stringify([...readNotificationIds].slice(-500)));
  } catch (error) {
    // Ignore storage errors so notification rendering can continue.
  }
}
