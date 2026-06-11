import { renderDashboardCharts } from "../components/charts.js";
import { addPdfNotification, getState, refreshDashboardStats } from "../state/store.js";
import { downloadElementAsPdf } from "../utils/pdf.js";

refreshDashboardStats();

const { dashboardStats } = getState();
const printDocument = document.getElementById("printDocument");

document.getElementById("generatedDate").textContent = `Generated ${new Date().toLocaleString()}`;
document.getElementById("printTotalBooks").textContent = String(dashboardStats.totalBooks);

renderDashboardCharts(dashboardStats);

document.getElementById("printPage").addEventListener("click", () => {
  window.print();
});

document.querySelectorAll("[data-pdf-download]").forEach((button) => {
  button.addEventListener("click", async () => {
    await downloadElementAsPdf(printDocument, "ows-dashboard-report.pdf");
    addPdfNotification("Dashboard report");
  });
});
