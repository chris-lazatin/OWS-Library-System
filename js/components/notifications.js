import { getState, markNotificationsRead, subscribe } from "../state/store.js";
import { escapeHtml } from "../utils/html.js";

export function renderNotifications(mount) {
  let isDropdownOpen = false;

  const update = () => {
    const notifications = getState().notifications;
    const hasUnread = notifications.some((notification) => !notification.read);

    mount.innerHTML = `
      <button id="notificationButton" class="utility-button" type="button" aria-label="Open notifications" aria-expanded="${isDropdownOpen}">
        <span aria-hidden="true">!</span>
        ${hasUnread ? '<span class="unread-dot" aria-hidden="true"></span>' : ""}
      </button>
      <section id="notificationDropdown" class="dropdown ${isDropdownOpen ? "is-open" : ""}" aria-label="Notifications">
        <div class="dropdown-header">
          <h2>Notifications</h2>
          <span>${notifications.length}</span>
        </div>
        <div class="notification-list">
          ${notifications.map((notification) => `
            <article class="notification-item ${notification.read ? "" : "is-unread"}">
              <div class="notification-title">${escapeHtml(notification.title)}</div>
              <div class="notification-message">${escapeHtml(notification.message)}</div>
              <div class="notification-time">${escapeHtml(notification.createdAt)}</div>
            </article>
          `).join("")}
        </div>
      </section>
    `;

    mount.querySelector("#notificationButton").addEventListener("click", (event) => {
      event.stopPropagation();
      isDropdownOpen = !isDropdownOpen;

      if (isDropdownOpen) {
        markNotificationsRead();
        return;
      }

      update();
    });
  };

  update();
  subscribe(update);

  document.addEventListener("click", (event) => {
    if (isDropdownOpen && !mount.contains(event.target)) {
      isDropdownOpen = false;
      update();
    }
  });
}
