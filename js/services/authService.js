const SESSION_KEY = "ows-library-admin-session";

export async function loginAdmin(credentials) {
  const username = credentials.username.trim();

  sessionStorage.setItem(SESSION_KEY, JSON.stringify({
    username,
    role: "Admin",
    loggedInAt: new Date().toISOString()
  }));

  return { username, role: "Admin" };
}

export function logoutAdmin() {
  sessionStorage.removeItem(SESSION_KEY);
  window.location.href = "../index.html";
}

export function getAdminSession() {
  const rawSession = sessionStorage.getItem(SESSION_KEY);
  return rawSession ? JSON.parse(rawSession) : null;
}
