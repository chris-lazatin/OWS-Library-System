export function downloadElementAsPdf(element, filename) {
  if (!window.html2pdf) {
    window.print();
    return Promise.resolve();
  }

  return window.html2pdf()
    .set({
      margin: 0.35,
      filename,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: "in", format: "letter", orientation: "landscape" },
      pagebreak: { mode: ["css", "legacy"], avoid: [".chart-card", ".stat-card"] }
    })
    .from(element)
    .save();
}
