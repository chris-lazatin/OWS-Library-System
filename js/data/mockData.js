export const mockBooks = [
  { id: "bk-001", title: "General Mathematics", category: "Mathematics", location: "Grade School", callNumber: "MAT-001", addedAt: "2026-01-12" },
  { id: "bk-002", title: "Earth and Life Science", category: "Science", location: "High School", callNumber: "SCI-010", addedAt: "2026-01-20" },
  { id: "bk-003", title: "Philippine History", category: "History", location: "High School", callNumber: "HIS-070", addedAt: "2026-02-04" },
  { id: "bk-004", title: "Creative Writing", category: "Language", location: "Senior High", callNumber: "LAN-122", addedAt: "2026-02-16" },
  { id: "bk-005", title: "Computer Fundamentals", category: "Technology", location: "Senior High", callNumber: "TEC-301", addedAt: "2026-03-03" },
  { id: "bk-006", title: "World Literature", category: "Language", location: "High School", callNumber: "LIT-083", addedAt: "2026-03-21" },
  { id: "bk-007", title: "Practical Research", category: "Research", location: "Senior High", callNumber: "RES-204", addedAt: "2026-04-05" },
  { id: "bk-008", title: "Physical Science", category: "Science", location: "High School", callNumber: "SCI-115", addedAt: "2026-04-17" },
  { id: "bk-009", title: "Statistics and Probability", category: "Mathematics", location: "Senior High", callNumber: "MAT-109", addedAt: "2026-05-08" },
  { id: "bk-010", title: "Values Education", category: "Religion", location: "Grade School", callNumber: "REL-021", addedAt: "2026-05-19" },
  { id: "bk-011", title: "Basic Accounting", category: "Business", location: "Senior High", callNumber: "BUS-047", addedAt: "2026-06-02" },
  { id: "bk-012", title: "Reading Comprehension", category: "Language", location: "Grade School", callNumber: "LAN-015", addedAt: "2026-06-09" }
];

export const mockBorrowRecords = [
  {
    id: "br-001",
    borrowerName: "Angela Santos",
    studentInfo: "Grade 10 - St. Matthew",
    books: [{ bookId: "bk-002", title: "Earth and Life Science", callNumber: "SCI-010", quantity: 1 }],
    dateBorrowed: "2026-06-01",
    lendBy: "Admin User",
    status: "Still Borrowed"
  },
  {
    id: "br-002",
    borrowerName: "Marco Reyes",
    studentInfo: "Grade 12 - STEM A",
    books: [{ bookId: "bk-007", title: "Practical Research", callNumber: "RES-204", quantity: 2 }],
    dateBorrowed: "2026-06-04",
    lendBy: "Admin User",
    status: "Still Borrowed"
  },
  {
    id: "br-003",
    borrowerName: "Elaine Cruz",
    studentInfo: "Grade 11 - HUMSS B",
    books: [{ bookId: "bk-009", title: "Statistics and Probability", callNumber: "MAT-109", quantity: 1 }],
    dateBorrowed: "2026-06-07",
    lendBy: "Admin User",
    status: "Returned"
  }
];

export const mockNotifications = [
  { id: "nt-001", type: "added", title: "Book added", message: "Basic Accounting was added to the catalog.", createdAt: "Today, 9:10 AM", read: false },
  { id: "nt-002", type: "borrowed", title: "Book borrowed", message: "Practical Research was borrowed by Student 1042.", createdAt: "Today, 8:42 AM", read: false },
  { id: "nt-003", type: "pdf", title: "PDF exported", message: "The latest book list report was generated.", createdAt: "Yesterday, 4:35 PM", read: true },
  { id: "nt-004", type: "updated", title: "Book edited", message: "Physical Science details were updated.", createdAt: "Yesterday, 2:18 PM", read: false },
  { id: "nt-005", type: "deleted", title: "Book deleted", message: "An outdated duplicate record was removed.", createdAt: "Jun 8, 2026", read: true },
  { id: "nt-006", type: "added", title: "Book added", message: "Reading Comprehension was added to Grade School.", createdAt: "Jun 8, 2026", read: true },
  { id: "nt-007", type: "borrowed", title: "Book borrowed", message: "Statistics and Probability was checked out.", createdAt: "Jun 7, 2026", read: true },
  { id: "nt-008", type: "pdf", title: "PDF exported", message: "Borrow records report was generated.", createdAt: "Jun 6, 2026", read: true },
  { id: "nt-009", type: "updated", title: "Book edited", message: "World Literature location changed to High School.", createdAt: "Jun 5, 2026", read: true },
  { id: "nt-010", type: "deleted", title: "Book deleted", message: "Damaged archive copy was removed from records.", createdAt: "Jun 4, 2026", read: true },
  { id: "nt-011", type: "added", title: "Book added", message: "Values Education was added to the catalog.", createdAt: "Jun 3, 2026", read: true }
];
