import { db } from "./firebase.js";
import {
  collection, getDocs, addDoc, updateDoc,
  deleteDoc, doc, query, orderBy
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

// ── BOOKS ──────────────────────────────────────────────
export async function fetchBooks() {
  const q = query(collection(db, "books"), orderBy("addedAt", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function saveBook(bookData) {
  const docRef = await addDoc(collection(db, "books"), {
    ...bookData,
    addedAt: new Date().toISOString().slice(0, 10)
  });
  return { id: docRef.id, ...bookData };
}

export async function editBook(bookId, bookData) {
  await updateDoc(doc(db, "books", bookId), bookData);
}

export async function removeBook(bookId) {
  await deleteDoc(doc(db, "books", bookId));
}

// ── LENDINGS ───────────────────────────────────────────
export async function fetchLendings() {
  const q = query(collection(db, "lendings"), orderBy("borrowedAt", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function saveLending(recordData) {
  const docRef = await addDoc(collection(db, "lendings"), {
    ...recordData,
    borrowedAt: new Date().toISOString(),
    status: "Still Borrowed"
  });
  return { id: docRef.id, ...recordData };
}

export async function updateLendingStatus(recordId, status) {
  await updateDoc(doc(db, "lendings", recordId), { status });
}

export async function removeLending(recordId) {
  await deleteDoc(doc(db, "lendings", recordId));
}