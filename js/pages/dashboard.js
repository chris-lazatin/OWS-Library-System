import { renderAppLayout } from "../components/layout.js";
import { renderDashboardCharts } from "../components/charts.js";
import { getState, initStore } from "../state/store.js";

await initStore();

renderAppLayout({
  activePage: "dashboard",
  content: `
    <header class="page-header">
      <div>
        <h2>Dashboard</h2>
        <p>Live overview of library records.</p>
      </div>
    </header>

    <section class="stats-grid" aria-label="Library totals">
      <article class="stat-card">
        <p class="stat-label">Total Books</p>
        <p id="totalBooks" class="stat-value">0</p>
      </article>
      <article class="stat-card">
        <p class="stat-label">Borrow Records</p>
        <p id="borrowRecords" class="stat-value">0</p>
      </article>
      <article class="stat-card">
        <p class="stat-label">Locations</p>
        <p id="locationCount" class="stat-value">0</p>
      </article>
      <article class="stat-card">
        <p class="stat-label">Categories</p>
        <p id="categoryCount" class="stat-value">0</p>
      </article>
    </section>

    <section class="dashboard-grid" aria-label="Dashboard charts">
      <article class="chart-card">
        <h3>Books by Location</h3>
        <div class="chart-frame"><canvas id="locationChart"></canvas></div>
      </article>
      <article class="chart-card">
        <h3>Books by Category</h3>
        <div class="chart-frame"><canvas id="categoryChart"></canvas></div>
      </article>
      <article class="chart-card is-wide">
        <h3>Newly Added Books Over Time</h3>
        <div class="chart-frame"><canvas id="timelineChart"></canvas></div>
      </article>
    </section>
  `
});

const { books, borrowRecords, dashboardStats } = getState();

document.getElementById("totalBooks").textContent = String(dashboardStats.totalBooks);
document.getElementById("borrowRecords").textContent = String(borrowRecords.length);
document.getElementById("locationCount").textContent = String(Object.keys(dashboardStats.byLocation).length);
document.getElementById("categoryCount").textContent = String(Object.keys(dashboardStats.byCategory).length);

renderDashboardCharts({
  ...dashboardStats,
  totalBooks: books.length
});