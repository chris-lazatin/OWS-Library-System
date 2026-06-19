import { fetchAllNotifications } from "../services/firestoreService.js";
import { escapeHtml } from "../utils/html.js";

const tableBody = document.getElementById("printNotificationTableBody");
const NOTIFICATION_PRINT_LIMIT = 100;

document.getElementById("generatedDate").textContent = `Generated ${new Date().toLocaleString()}`;

document.getElementById("printPage").addEventListener("click", () => {
  window.print();
});

document.getElementById("backPage").addEventListener("click", () => {
  if (window.history.length > 1) {
    window.history.back();
    return;
  }

  window.location.href = "dashboard.html";
});

async function init() {
  tableBody.innerHTML = `<tr><td colspan="3" class="empty-table">Loading notifications...</td></tr>`;

  try {
    const notifications = await fetchAllNotifications();
    const sortedNotifications = [...notifications]
      .sort((a, b) => getNotificationDate(b) - getNotificationDate(a))
      .slice(0, NOTIFICATION_PRINT_LIMIT);

    tableBody.innerHTML = sortedNotifications.length
      ? sortedNotifications.map(renderNotificationRow).join("")
      : `<tr><td colspan="3" class="empty-table">No notifications found.</td></tr>`;
  } catch (error) {
    tableBody.innerHTML = `<tr><td colspan="3" class="empty-table">Unable to load notifications.</td></tr>`;
    throw error;
  }
}

function renderNotificationRow(notification) {
  return `
    <tr>
      <td>${display(notification.title)}</td>
      <td>${display(notification.message)}</td>
      <td>${display(notification.createdAt)}</td>
    </tr>
  `;
}

function display(value) {
  if (value === undefined || value === null || value === "") {
    return "-";
  }

  return escapeHtml(value);
}

function getNotificationDate(notification) {
  const date = new Date(notification.createdAtValue || notification.createdAt || 0);
  return Number.isNaN(date.getTime()) ? new Date(0) : date;
}

init();
