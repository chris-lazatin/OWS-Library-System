import { getState, markNotificationsRead, subscribe } from "../state/store.js";
import { escapeHtml } from "../utils/html.js";

export function renderNotifications(mount) {
  let isDropdownOpen = false;
  let hasViewedOpenPanel = false;

  const update = () => {
    const notifications = getState().notifications;
    const hasUnread = notifications.some((notification) => !notification.read);

    mount.innerHTML = `
      <div class="notification-actions">
        <button id="notificationButton" class="utility-button" type="button" aria-label="Open notifications" aria-expanded="${isDropdownOpen}">
          <img src="../assets/bell.png" alt="" class="utility-icon">
          ${hasUnread ? '<span class="unread-dot" aria-hidden="true"></span>' : ""}
        </button>
        <section id="notificationDropdown" class="dropdown ${isDropdownOpen ? "is-open" : ""}" aria-label="Notifications">
          <div class="dropdown-header">
            <h2>Notifications</h2>
            <a class="utility-button notification-print-button" href="notification-print.html" aria-label="Print notifications" title="Print notifications">
              <img src="../assets/print.png" alt="" class="utility-icon">
            </a>
          </div>
          <div class="notification-list">
            ${notifications.length ? notifications.map((notification) => `
              <article class="notification-item ${notification.read ? "" : "is-unread"}">
                <div class="notification-title">${escapeHtml(notification.title)}</div>
                <div class="notification-message">${escapeHtml(notification.message)}</div>
                <div class="notification-time">${escapeHtml(notification.createdAt)}</div>
              </article>
            `).join("") : '<div class="notification-empty">No notifications yet.</div>'}
          </div>
        </section>
        </div>
    `;

    mount.querySelector("#notificationButton").addEventListener("click", (event) => {
      event.stopPropagation();
      isDropdownOpen = !isDropdownOpen;

      if (isDropdownOpen) {
        hasViewedOpenPanel = true;
        update();
        return;
      }

      if (hasViewedOpenPanel) {
        hasViewedOpenPanel = false;
        markNotificationsRead();
        return;
      }

      update();
    });
  };

  update();
  subscribe(update);

  const handleOutsideClick = (event) => {
    if (isDropdownOpen && !mount.contains(event.target)) {
      isDropdownOpen = false;
      if (hasViewedOpenPanel) {
        hasViewedOpenPanel = false;
        markNotificationsRead();
        return;
      }
      update();
    }
  };

  document.removeEventListener("click", handleOutsideClick);
  document.addEventListener("click", handleOutsideClick);
}
