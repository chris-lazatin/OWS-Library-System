import { loginAdmin } from "./services/authService.js";

const loginForm = document.getElementById("loginForm");
const passwordInput = document.getElementById("password");
const passwordToggle = document.querySelector(".password-toggle");

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const formData = new FormData(loginForm);
  await loginAdmin({
    username: String(formData.get("username") || ""),
    password: String(formData.get("password") || "")
  });

  window.location.href = "../pages/dashboard.html";
});

passwordToggle.addEventListener("click", () => {
  const isPassword = passwordInput.type === "password";
  passwordInput.type = isPassword ? "text" : "password";
  passwordToggle.setAttribute("aria-label", isPassword ? "Hide password" : "Show password");
});
