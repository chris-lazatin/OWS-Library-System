export const locationOptions = ["OWS Elem", "Learning Resource Center", "All Libraries"];

export const categoryOptions = [
  "C000 - Generalities",
  "C100 - Philosophy/Psychology",
  "C200 - Religion",
  "C300 - Social Sciences",
  "C400 - Language",
  "C500 - Natural Sciences",
  "C600 - Technology",
  "C700 - Art",
  "C800 - Literature",
  "C900 - Geography History",
  "Fiction",
  "Filipiniana"
];

export const bookFieldGroups = [
  {
    title: "Title Proper",
    fields: [
      { label: "Title", name: "title", required: true },
      { label: "Author/Responsibility", name: "responsibility", required: true },
      { label: "Added Entry: Corporate", name: "corporateEntry" }
    ]
  },
  {
    title: "Publication",
    fields: [
      { label: "Place", name: "place" },
      { label: "Publisher", name: "publisher", required: true },
      { label: "Year", name: "publicationDate", type: "number", required: true },
      { label: "Height (cm)", name: "height" },
      { label: "Width (cm)", name: "width" },
      { label: "ISBN", name: "isbn" },
      { label: "URL", name: "url", type: "url" }
    ]
  },
  {
    title: "Local Information",
    fields: [
      { label: "Call Number", name: "callNumber", required: true },
      { label: "Accession", name: "accession" },
      { label: "Language", name: "language" },
      { label: "Entered By", name: "enteredBy" },
      { label: "Updated By", name: "updatedBy" },
      { label: "Volume", name: "volumeCopy", placeholder: "e.g. \"1\"" },
      { label: "Edition", name: "edition" },
      { label: "Page", name: "pages", type: "number" },
      { label: "Copy", name: "onShelf", type: "number", required: true },
      { label: "ID", name: "recordId" }
    ]
  }
];
